# Backend Spec — Magic Link Passwordless Auth

## Resumo executivo

Implementa o flow passwordless completo no backend Laravel:

1. `POST /auth/magic-link/request` — gera token, envia email
2. `POST /auth/magic-link/verify` — valida token, cria/login user, retorna Sanctum token
3. Migration: `password` virar nullable em `users` + nova tabela `magic_link_tokens`
4. Email via Resend (recomendado) ou Mailgun
5. `name` opcional no signup (coletado pós-login no frontend)

Tempo estimado: **1-2 dias de implementação**.

---

## 1. Migrations

### Migration 1 — `users.password` nullable

```php
// database/migrations/2026_05_05_000001_make_password_nullable_users.php
public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->string('password')->nullable()->change();
        // name tambem ja deveria ser nullable pra magic link signup
        $table->string('name')->nullable()->change();
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->string('password')->nullable(false)->change();
        $table->string('name')->nullable(false)->change();
    });
}
```

> **Atenção:** se `name` ou `password` tiverem constraint UNIQUE/INDEX, pode ser necessário rodar com `doctrine/dbal` instalado (`composer require doctrine/dbal --dev`).

### Migration 2 — Nova tabela `magic_link_tokens`

```php
// database/migrations/2026_05_05_000002_create_magic_link_tokens_table.php
public function up(): void
{
    Schema::create('magic_link_tokens', function (Blueprint $table) {
        $table->id();
        $table->string('email')->index();
        $table->string('token_hash', 64); // SHA-256 do token raw
        $table->string('redirect_to', 512)->default('/');
        $table->timestamp('expires_at');
        $table->timestamp('used_at')->nullable();
        $table->string('ip_address', 45)->nullable();
        $table->string('user_agent', 512)->nullable();
        $table->timestamps();

        // Pra cleanup periódico de tokens expirados
        $table->index('expires_at');
        // Pra rate limit por email
        $table->index(['email', 'created_at']);
    });
}

public function down(): void
{
    Schema::dropIfExists('magic_link_tokens');
}
```

---

## 2. Model

```php
// app/Models/MagicLinkToken.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class MagicLinkToken extends Model
{
    protected $fillable = [
        'email', 'token_hash', 'redirect_to', 'expires_at',
        'used_at', 'ip_address', 'user_agent',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    public function isExpired(): bool
    {
        return Carbon::now()->greaterThan($this->expires_at);
    }

    public function isUsed(): bool
    {
        return $this->used_at !== null;
    }
}
```

---

## 3. Controller

```php
// app/Http/Controllers/Api/MagicLinkController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MagicLinkToken;
use App\Models\User;
use App\Mail\MagicLinkMail;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class MagicLinkController extends Controller
{
    /**
     * POST /auth/magic-link/request
     * Body: { email, redirect_to }
     */
    public function request(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'redirect_to' => ['nullable', 'string', 'max:512'],
        ]);

        $email = strtolower($validated['email']);
        $redirectTo = $this->sanitizeRedirect($validated['redirect_to'] ?? '/');

        // Rate limit: 5 requests por email a cada 5 minutos
        $rateLimitKey = 'magic-link:' . sha1($email);
        if (RateLimiter::tooManyAttempts($rateLimitKey, 5)) {
            // Anti-enumeration: NUNCA revelar se foi rate limited.
            // Retorna 200 igual se tivesse enviado.
            return response()->json([
                'message' => 'Se o email for válido, você receberá um link em alguns minutos.',
            ]);
        }
        RateLimiter::hit($rateLimitKey, 300); // 5 min window

        // Gera token raw (32 bytes = 256 bits aleatório)
        $rawToken = Str::random(64);
        $tokenHash = hash('sha256', $rawToken);

        // Salva no banco com TTL 15 min
        MagicLinkToken::create([
            'email' => $email,
            'token_hash' => $tokenHash,
            'redirect_to' => $redirectTo,
            'expires_at' => Carbon::now()->addMinutes(15),
            'ip_address' => $request->ip(),
            'user_agent' => substr($request->userAgent() ?? '', 0, 512),
        ]);

        // Verifica se user existe (pra customizar copy do email)
        $existingUser = User::where('email', $email)->first();
        $isNewUser = !$existingUser;

        // Monta URL do magic link
        $magicLinkUrl = config('app.frontend_url')
            . '/auth/magic-link/verify?token='
            . urlencode($rawToken);

        // Envia email (Mailable async via queue se quiser)
        Mail::to($email)->send(new MagicLinkMail(
            userEmail: $email,
            magicLinkUrl: $magicLinkUrl,
            expiresIn: 15,
            isNewUser: $isNewUser,
        ));

        return response()->json([
            'message' => 'Link enviado! Verifique seu email.',
        ]);
    }

    /**
     * POST /auth/magic-link/verify
     * Body: { token }
     */
    public function verify(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string', 'min:32', 'max:128'],
        ]);

        $tokenHash = hash('sha256', $validated['token']);

        $magicToken = MagicLinkToken::where('token_hash', $tokenHash)->first();

        if (!$magicToken) {
            return response()->json([
                'message' => 'Link inválido. Solicite um novo email.',
            ], 422);
        }

        if ($magicToken->isExpired()) {
            return response()->json([
                'message' => 'Link expirado. Solicite um novo email.',
            ], 422);
        }

        if ($magicToken->isUsed()) {
            return response()->json([
                'message' => 'Link já foi usado. Solicite um novo email se precisar.',
            ], 422);
        }

        // Marca como usado IMEDIATAMENTE (anti-replay)
        $magicToken->update(['used_at' => Carbon::now()]);

        // Cria ou pega user
        $user = User::firstOrCreate(
            ['email' => $magicToken->email],
            [
                'name' => null, // coletado pos-login no frontend
                'login' => $this->deriveLoginFromEmail($magicToken->email),
                'password' => null, // passwordless
                'email_verified_at' => Carbon::now(), // magic link valida email
            ]
        );

        $isNewUser = $user->wasRecentlyCreated;

        // Gera Sanctum token (mesma stack do flow tradicional)
        $accessToken = $user->createToken('magic-link')->plainTextToken;

        // Cleanup: deleta tokens expirados desse email pra nao poluir
        MagicLinkToken::where('email', $magicToken->email)
            ->where('expires_at', '<', Carbon::now())
            ->delete();

        return response()->json([
            'access_token' => $accessToken,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'redirect_to' => $magicToken->redirect_to,
            'is_new_user' => $isNewUser,
        ]);
    }

    /**
     * Sanitiza redirect_to pra previnir open redirect.
     * Aceita só URLs relativas (começam com "/" e não são "//").
     */
    private function sanitizeRedirect(string $url): string
    {
        $url = trim($url);
        if (empty($url)) return '/';
        // Bloqueia redirects pra outros domínios
        if (!str_starts_with($url, '/')) return '/';
        if (str_starts_with($url, '//')) return '/'; // protocol-relative
        // Bloqueia javascript:, data:, etc
        if (preg_match('/^[a-z][a-z0-9+\-.]*:/i', $url)) return '/';
        return $url;
    }

    private function deriveLoginFromEmail(string $email): string
    {
        $local = explode('@', $email)[0] ?? '';
        $sanitized = preg_replace('/[^a-z0-9]/', '', strtolower($local));
        if (strlen($sanitized) >= 4) return $sanitized;
        // Padding determinístico-ish baseado em timestamp
        return $sanitized . substr(base_convert((string) time(), 10, 36), -4);
    }
}
```

---

## 4. Mailable

```php
// app/Mail/MagicLinkMail.php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MagicLinkMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $userEmail,
        public string $magicLinkUrl,
        public int $expiresIn,
        public bool $isNewUser,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->isNewUser
                ? 'Bem-vindo à Redent.IA — seu link de acesso'
                : 'Acesse a Redent.IA — seu link de acesso',
            from: config('mail.from.address'),
            replyTo: ['contato@redentia.com.br'],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.magic-link',
            with: [
                'user_email' => $this->userEmail,
                'magic_link_url' => $this->magicLinkUrl,
                'expires_in' => $this->expiresIn,
                'is_new_user' => $this->isNewUser,
            ],
        );
    }
}
```

---

## 5. Email template

Copie o arquivo HTML em `Frontend/_email-templates/magic-link.html` pra:

```
backend/resources/views/emails/magic-link.blade.php
```

(O template já está formatado em sintaxe Blade-ready com `{{ $variable }}`.)

---

## 6. Rotas API

```php
// routes/api.php
use App\Http\Controllers\Api\MagicLinkController;

Route::prefix('auth')->group(function () {
    Route::post('/magic-link/request', [MagicLinkController::class, 'request']);
    Route::post('/magic-link/verify', [MagicLinkController::class, 'verify']);
});
```

---

## 7. Config

### `.env`
```bash
# Frontend URL (pra montar magic link)
FRONTEND_URL=https://redentia.com.br

# Resend (recomendado — 3k emails grátis/mês)
MAIL_MAILER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
MAIL_FROM_ADDRESS=acesso@redentia.com.br
MAIL_FROM_NAME="Redent.IA"
```

### `config/services.php`
```php
'resend' => [
    'key' => env('RESEND_API_KEY'),
],
```

### `config/app.php`
```php
'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
```

### Setup Resend (Laravel)
```bash
composer require resend/resend-laravel
```

E em `config/mail.php`:
```php
'mailers' => [
    // ... existing mailers
    'resend' => [
        'transport' => 'resend',
    ],
],
```

---

## 8. Validação domínio Resend (importante)

Antes do email começar a funcionar:

1. Criar conta em [resend.com](https://resend.com)
2. Adicionar domínio `redentia.com.br`
3. Configurar DNS (DKIM + SPF + DMARC) — Resend te dá os registros prontos
4. Aguardar verificação (geralmente <24h)
5. Pegar API key, colocar no `.env`

**Sem isso, emails caem em spam.**

---

## 9. Cleanup job (opcional mas recomendado)

```php
// app/Console/Commands/CleanupMagicLinkTokens.php
class CleanupMagicLinkTokens extends Command
{
    protected $signature = 'magic-link:cleanup';

    public function handle()
    {
        $deleted = MagicLinkToken::where('expires_at', '<', Carbon::now()->subDays(7))->delete();
        $this->info("Deleted {$deleted} expired magic link tokens.");
    }
}
```

Em `app/Console/Kernel.php`:
```php
protected function schedule(Schedule $schedule): void
{
    $schedule->command('magic-link:cleanup')->daily();
}
```

---

## 10. Checklist de deploy

- [ ] Rodar migrations
- [ ] `composer require resend/resend-laravel`
- [ ] Validar domínio em resend.com (DKIM/SPF/DMARC)
- [ ] Configurar `.env` com `RESEND_API_KEY` + `FRONTEND_URL` + `MAIL_FROM_ADDRESS`
- [ ] Testar endpoint: `curl -X POST https://redentia-api.saraivada.com/api/auth/magic-link/request -d '{"email":"teste@gmail.com","redirect_to":"/wallet"}'`
- [ ] Receber email, clicar no link, ver redirect
- [ ] Atualizar `MAIL_FROM_ADDRESS` pra `acesso@redentia.com.br` (custom domain)
- [ ] Adicionar comando cleanup no scheduler
- [ ] Deploy frontend (já tá pronto no repositório)

---

## 11. Mudanças no frontend (já implementadas)

- `Frontend/app/components/molecules/AuthFormCard.vue` — Magic Link flow
- `Frontend/app/components/molecules/OnboardingNameModal.vue` — pede nome pós-login
- `Frontend/app/pages/auth/magic-link/verify.vue` — landing do link clicado
- `Frontend/app/services/auth.ts` — `magicLinkRequest` + `magicLinkVerify`
- `Frontend/app/layouts/default.vue` — mount global do OnboardingNameModal
- `Frontend/_email-templates/magic-link.html` — template HTML responsivo

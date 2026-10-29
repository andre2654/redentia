# Leads de reunião — Redentia For Business

Spec do endpoint que grava o pedido de hora da `/business`. O front deste PR envia o POST, e o Laravel tem a rota desde [rodrigoborges/redentia-api#88](https://github.com/rodrigoborges/redentia-api/pull/88), em 28/10/2026.

**Onde o backend diverge desta spec:** sem a chave do front (`FRONT_SHARED_KEY`), todos os visitantes chegam com o IP de saída da Vercel e caem no mesmo balde. Nesse caso o teto é 30 por hora, não 5. Com a chave ligada, o limite volta a ser 5 por hora por visitante. O aviso interno sai com Reply-To de quem pediu.

**Front:** PR draft [#113](https://github.com/andre2654/redentia/pull/113), branch `cursor/business-leads-form-d337`, base `redentia-v2` (não `main`).

**E-mail de notificação (padrão, configurável):** `relacionamento@redentia.com.br`

O outro endereço que ainda aparece no site (`contato@redentia.com`) é de outro PR. Este fluxo não usa esse endereço.

---

## 1. Endpoint

| | |
|---|---|
| Método | `POST` |
| Rota Laravel | `POST /api/business/leads` |
| Rota que o browser chama | `POST /api/backend/business/leads` |
| Auth | Pública. Sem Bearer, sem sessão, sem CSRF. |
| Onde registrar | `routes/api.php`, no mesmo grupo das rotas públicas que o site já chama (por exemplo `POST /auth/magic-link/request`). Não colocar no middleware `web`: o browser não manda cookie de CSRF, e um 419 vira “nada foi enviado”. |

O proxy do Nuxt (`nuxt.config.ts`, regra `/api/backend/**`) encaminha para `NUXT_BACKEND_URL` (padrão `https://redentia-api.saraivada.com/api`). `POST /api/backend/business/leads` chega no Laravel como `POST /api/business/leads`.

O plugin `server/plugins/backend-front-key.ts` já carimba `X-Redentia-Front-Key` e o IP do visitante em todo `/api/backend/**`, quando `NUXT_BACKEND_FRONT_KEY` está definida. O rate limit e o IP do consentimento usam o mesmo `App\Support\FrontOrigin` das outras rotas anônimas. Sem a chave, o IP que o Laravel vê é o de saída da Vercel: **não gravar esse IP como se fosse o da pessoa** (grava `null`).

### Anti-spam

1. **Honeypot.** Campo JSON `website` (string). O input fica fora da tela. Se, depois do `trim`, não for vazio: responder **201** com o mesmo corpo de sucesso, **não** gravar, **não** notificar. O front trata qualquer 2xx como sucesso; responder 4xx ensinaria o robô.
2. **Rate limit**, contando também o honeypot, para um robô não ficar ilimitado:
   - 5 pedidos por hora por IP do visitante (`FrontOrigin`);
   - 10 pedidos por hora por e-mail (só depois do e-mail passar na validação).
3. Corpo máximo **16 KB**. Acima disso, **413**.
4. Sem captcha neste corte. Sem pixel novo.

`429` com corpo `{ "message": "Muitas tentativas. Tente de novo em alguns minutos." }`. O front mostra a frase de limite e o mailto. Não depende do texto do `message`.

---

## 2. Payload

`Content-Type: application/json`. `Accept: application/json` (o `publicFetch` do front já manda).

Todas as chaves vão sempre. Opcional vazio vira `null`, não some. `website` vazio é `""`.

```json
{
  "name": "Ana Lima",
  "email": "ana@mesa.com.br",
  "phone": null,
  "company": "Mesa Lima",
  "firm_type": "multi_family_office",
  "team_size": "6_15",
  "message": null,
  "consent": true,
  "consent_text": "Autorizo a Redentia a usar estes dados para entrar em contato comigo sobre o Redentia For Business. Li a Política de Privacidade.",
  "consent_version": "2026-10-28",
  "website": "",
  "attribution": {
    "utm_source": "linkedin",
    "utm_medium": "paid",
    "utm_campaign": "mfo-outubro",
    "utm_content": null,
    "utm_term": null,
    "li_fat_id": "abc",
    "gclid": null,
    "landing_page": "/business?utm_source=linkedin&utm_medium=paid&utm_campaign=mfo-outubro&li_fat_id=abc",
    "referrer": "https://www.linkedin.com/"
  }
}
```

### Campos

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `name` | string | sim | 2–120 caracteres depois do trim. |
| `email` | string | sim | E-mail válido, no máximo 180. Guardar em minúsculas. **E-mail pessoal (Gmail, Hotmail e a lista abaixo) é válido.** O front só avisa; o backend não rejeita. |
| `phone` | string ou null | não | Se vier string: 8–40 caracteres no texto, e pelo menos 8 dígitos. `null` ou ausência tratada como null. |
| `company` | string | sim | 2–160 depois do trim. |
| `firm_type` | enum | sim | `assessoria_aai`, `multi_family_office`, `family_office`, `gestora`, `consultoria`, `outro`. |
| `team_size` | enum | sim | `ate_5` (até 5), `6_15` (6 a 15), `16_40` (16 a 40), `mais_40` (mais de 40). É faixa de assessores ou de pessoas na mesa, não preço. |
| `message` | string ou null | não | Até 2000 depois do trim. |
| `consent` | boolean | sim | Tem de ser `true`. `false`, ausente ou outro tipo: 422. O checkbox do front nasce desmarcado. |
| `consent_text` | string | sim | A frase exata que a pessoa viu. Nesta versão: `Autorizo a Redentia a usar estes dados para entrar em contato comigo sobre o Redentia For Business. Li a Política de Privacidade.` O link ao lado aponta para `/institucional/privacy` e faz parte da versão `2026-10-28`. Guardar o texto recebido, sem reescrever. Rejeitar se tiver mais de 2000 caracteres ou se vier vazio. |
| `consent_version` | string | sim | `2026-10-28` nesta versão do front. Guardar o valor recebido (até 32 caracteres). Não substituir pela versão “atual” do servidor: o registro é o que foi aceito. |
| `website` | string | sim (pode ser `""`) | Honeypot. Ver acima. Não gravar a coluna. |
| `attribution` | objeto | sim | Pode chegar com todos os valores `null`, menos `landing_page` (string). Se o objeto faltar, 422. |

`attribution`:

| Campo | Tipo | Obrigatório | Tamanho |
|---|---|---|---|
| `utm_source` | string ou null | não | 200 |
| `utm_medium` | string ou null | não | 200 |
| `utm_campaign` | string ou null | não | 200 |
| `utm_content` | string ou null | não | 200 |
| `utm_term` | string ou null | não | 200 |
| `li_fat_id` | string ou null | não | 200. Identificador de clique do LinkedIn, se a URL de entrada trouxe. |
| `gclid` | string ou null | não | 200. Identificador de clique do Google, se veio. |
| `landing_page` | string | sim | 1–1000. Path + query da primeira página da sessão. O front tira `demo` e nunca manda o token de `/business/convite`, `/cliente/convite` ou `/cliente/acesso`. |
| `referrer` | string ou null | não | 500. Vazio vira null. |

Não há outros campos. Ignorar chave desconhecida. Não há `user_id`: o pedido é anônimo.

### E-mail pessoal (só aviso no front)

O front trata como pessoal, sem bloquear, estes domínios (a parte depois do `@`, em minúsculas):

`gmail.com`, `googlemail.com`, `hotmail.com`, `hotmail.com.br`, `outlook.com`, `outlook.com.br`, `live.com`, `live.com.br`, `msn.com`, `yahoo.com`, `yahoo.com.br`, `ymail.com`, `icloud.com`, `me.com`, `mac.com`, `bol.com.br`, `uol.com.br`, `terra.com.br`, `ig.com.br`, `globo.com`, `globomail.com`, `proton.me`, `protonmail.com`, `pm.me`.

A lista mora em `DOMINIOS_PESSOAIS` (`app/utils/business-lead.ts`). O backend pode gravar um boolean `email_pessoal` com a mesma lista, para filtrar. Não é motivo de 422.

---

## 3. Respostas

Sucesso só quando a linha foi gravada, ou quando o honeypot descartou o robô. Os dois casos devolvem o mesmo corpo, para o cliente não distinguir.

### 201 Created

Pedido gravado, ou honeypot. Sem `id` no corpo (não vazar o registro).

```json
{ "ok": true }
```

O front mostra “Pedido recebido.” **somente** neste 2xx. Falha de e-mail interno **não** muda o status: a linha já está gravada. Logar a falha de mail e seguir. Um 500 depois do insert faria a pessoa tentar de novo e duplicar.

### 413 Payload Too Large

Corpo acima de 16 KB.

### 422 Unprocessable Entity

Validação. Formato já usado no Laravel do site:

```json
{
  "message": "Os dados não passaram na validação.",
  "errors": {
    "email": ["Informe um e-mail válido."],
    "consent": ["O consentimento é obrigatório."]
  }
}
```

O front **não** mostra essas frases. Mostra a falha genérica e o mailto. As mensagens existem para quem for depurar a API.

### 429 Too Many Requests

Ver rate limit.

### 500

Corpo genérico, sem stack, sem SQL. O front cai no mesmo mailto.

Não usar 200 para erro. Não usar redirect.

---

## 4. Onde gravar

Tabela nova `business_leads`. Não misturar com usuário, newsletter nem com o aceite de Open Finance do cliente final.

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | bigint PK | |
| `name` | varchar(120) | |
| `email` | varchar(180) | minúsculas. Índice. |
| `email_pessoal` | boolean | calculado no servidor. Default false. |
| `phone` | varchar(40) null | |
| `company` | varchar(160) | |
| `firm_type` | varchar(40) | o enum. |
| `team_size` | varchar(20) | o enum. |
| `message` | text null | |
| `consent` | boolean | sempre true nas linhas que existem. |
| `consent_text` | text | a frase recebida. |
| `consent_version` | varchar(32) | ex. `2026-10-28`. |
| `consented_at` | timestamp | relógio do servidor, UTC, no momento do insert. Não confiar em relógio do browser. |
| `consent_ip` | varchar(45) null | IP do visitante via `FrontOrigin`. `null` se a chave do front não autenticou a origem. Cabe IPv6. |
| `user_agent` | varchar(400) null | header `User-Agent` truncado. Não vem no JSON. |
| `utm_source` | varchar(200) null | |
| `utm_medium` | varchar(200) null | |
| `utm_campaign` | varchar(200) null | |
| `utm_content` | varchar(200) null | |
| `utm_term` | varchar(200) null | |
| `li_fat_id` | varchar(200) null | |
| `gclid` | varchar(200) null | |
| `landing_page` | varchar(1000) | |
| `referrer` | varchar(500) null | |
| `notified_at` | timestamp null | preenchido quando o e-mail interno sai. `null` = a linha existe e o André não foi avisado. |
| `created_at` | timestamp | índice. |

Não há coluna `website`. Não há `updated_at` obrigatório.

Índice extra sugerido: `(email, created_at)` para achar repetido.

---

## 5. Notificação

A cada linha **gravada** (não no honeypot), um e-mail interno pelo mailer que o Laravel já usa.

- **Para:** `config('business.leads_notify_email')`.
- **Config:** `BUSINESS_LEADS_NOTIFY_EMAIL`.
- **Padrão, se a env não existir:** `relacionamento@redentia.com.br`.
- Não fixar o endereço no código da Mailable sem passar pela config. Trocar de caixa é mudar a env.
- **Assunto:** `Nova hora pedida: {company}`.
- **Corpo (texto):** nome, e-mail, telefone, escritório, tipo de casa (rótulo e enum), tamanho (rótulo e enum), mensagem, todos os campos de atribuição, versão e texto do consentimento, `consented_at`, IP (ou “não disponível”).
- **From:** o remetente transacional já configurado no mailer. Não inventar um From novo aqui.
- Não mandar e-mail automático para quem pediu a hora. Quem responde é uma pessoa, no endereço que ela deixou.
- Se o mail falhar: log, `notified_at` continua null, HTTP continua 201.

Rótulos, para o e-mail não sair só com o enum:

| `firm_type` | Rótulo |
|---|---|
| `assessoria_aai` | Assessoria ou escritório AAI |
| `multi_family_office` | Multi family office |
| `family_office` | Family office |
| `gestora` | Gestora |
| `consultoria` | Consultoria |
| `outro` | Outro |

| `team_size` | Rótulo |
|---|---|
| `ate_5` | Até 5 |
| `6_15` | 6 a 15 |
| `16_40` | 16 a 40 |
| `mais_40` | Mais de 40 |

---

## 6. LGPD

Controladora: a mesma da política em `/institucional/privacy` — AVSJOBS LTDA, CNPJ 54.565.008/0001-24 (`shared/utils/empresa.ts`).

- **Finalidade:** entrar em contato sobre o Redentia For Business para marcar a hora. Não usar para newsletter, outro produto, nem para audiência de anúncio. `li_fat_id` e `gclid` ficam guardados para saber qual campanha trouxe o pedido. Este corte **não** devolve esses identificadores ao LinkedIn nem ao Google. O Insight do LinkedIn ficou para depois; o front não adiciona tag.
- **Base legal:** consentimento (art. 7º, I, da LGPD). Checkbox desmarcado por padrão. Sem `consent: true`, não há linha.
- **O que se guarda:** os campos da tabela, inclusive a frase e a versão do texto, o instante, o IP (quando a origem é confiável) e o navegador.
- **Retenção sugerida:** 24 meses a partir de `created_at`, depois apagar a linha. Se a casa fechar contrato, o dado comercial passa a viver no registro do contrato, com outra base. Isso está fora deste endpoint.
- **Direitos:** acesso, correção, exclusão e revogação. A política já manda esses pedidos para `suporte@redentia.com.br`. O formulário aponta para essa política. Revogar aqui significa parar de usar o dado para contato e apagar ou anonimizar a linha. Não há self-service no front.
- **Acesso à tabela:** sem endpoint público de leitura. Quem lê é o time, pelo banco ou pelo e-mail interno.

---

## 7. Como o front depende disto

Arquivos: `app/components/business/RbContato.vue`, `app/utils/business-lead.ts`, `app/plugins/business-atribuicao.client.ts`.

- O submit é `POST /api/backend/business/leads` com o JSON desta spec.
- `$fetch` só resolve em 2xx. O texto “Pedido recebido.” só roda depois desse await. No `catch`, a seção diz que nada foi enviado e mostra `mailto:relacionamento@redentia.com.br` com os campos preenchidos.
- 429 ganha a frase de “muitas tentativas”. Os outros erros usam a mesma frase genérica. O front não ecoa `errors` do Laravel.
- Evento GA4 `business_lead`, parâmetros `tipo_casa` (o enum) e `utm_source` (ou `(none)`). Dispara só depois do 2xx real. Não dispara na prévia. GA4, GTM e Clarity existentes não foram alterados. Nenhuma tag nova.
- Atribuição: na primeira página da sessão o plugin grava em `sessionStorage` (`nu:business-atribuicao`) `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `li_fat_id`, `gclid`, `landing_page` e `referrer`. Página seguinte não cobre (first-touch). O link “Entrar” do header e o “Ativar acesso” do footer passam a apontar para `/business/cadastro` com esses identificadores de clique, depois do mount. O HTML cacheado na borda continua sem query.
- Prévia: `?demo=1` simula o 2xx **somente** se o build gravou `__REDENTIA_BUSINESS_LEAD_DEMO__` como true. Isso acontece em `nuxt dev`, em preview da Vercel (`VERCEL_ENV=preview`) e, fora da Vercel de produção, com `NUXT_PUBLIC_BUSINESS_LEAD_DEMO=true`. `VERCEL_ENV=production` força false mesmo com essa env. A prévia não chama a rede e não manda o evento. A frase “Prévia deste ambiente: nada saiu daqui.” só aparece nesse caso.
- O checkbox usa `CONSENT_BEFORE` + link “Política de Privacidade” (`/institucional/privacy`). O `consent_text` é a frase inteira, com o rótulo do link, sem a URL. Versão `2026-10-28`. Mudou a frase, muda a versão no front e nesta spec juntos.

O front não espera e-mail automático de volta. A frase de sucesso é: “A gente responde no e-mail que você deixou para marcar a hora.”

---

## 8. Perguntas em aberto para o André

1. **Retenção de 24 meses** está boa, ou o pedido de hora some antes?
2. **Faixas de tamanho** (até 5, 6 a 15, 16 a 40, mais de 40) são as que a mesa usa na conversa?
3. **Pedido repetido** do mesmo e-mail: gravar de novo e avisar de novo, ou juntar com o anterior?
4. Confirmar que **não há e-mail automático** para quem pediu a hora. Quem responde é uma pessoa.
5. Os **limites** de 5 por hora por IP e 10 por hora por e-mail servem, ou a campanha precisa de mais folga?
6. Os **direitos LGPD** deste formulário seguem o canal que a política já publica (`suporte@redentia.com.br`), ou uma cópia desses pedidos também deve ir para `relacionamento@redentia.com.br`?
7. A **`FRONT_SHARED_KEY`** está ligada em produção? Sem ela, `consent_ip` fica null de propósito, para não gravar o IP da Vercel.
8. Qual é o **From** do mailer, se ainda não houver um remetente transacional?
9. A **tabela basta** como registro, ou o mesmo aviso precisa entrar num CRM?

Não está em aberto o destinatário do aviso de lead novo: o padrão é `relacionamento@redentia.com.br`, e a env `BUSINESS_LEADS_NOTIFY_EMAIL` troca a caixa sem mudar código.

O front que chama este endpoint é o PR draft [#113](https://github.com/andre2654/redentia/pull/113) (`cursor/business-leads-form-d337`).

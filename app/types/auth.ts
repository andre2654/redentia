/**
 * Contratos REAIS de auth do Laravel (verificados no código em
 * Backend/app/Http/Controllers/AuthController.php, Api/MagicPinController.php,
 * Api/MagicLinkController.php e Api/AuthChannelsController.php — PR6).
 *
 * Gotchas de shape que estes tipos protegem:
 *  - magic-pin/verify devolve o token em `token`; magic-link/verify e
 *    /auth/google devolvem em `access_token`.
 *  - request/resend dos dois fluxos respondem 200 SEMPRE (anti-enumeração),
 *    mesmo com telefone inválido ou rate-limit interno estourado.
 *  - erros de verify são 422 com `message` já em pt-BR (contagem de
 *    tentativas, expirado, bloqueado) — exibir verbatim.
 *  - o grupo /auth inteiro tem throttle:auth = 5 req/min por IP → 429.
 */

/** GET /auth/channels/status — health dos canais de PIN (cache 30s no back). */
export interface AuthChannelsStatus {
  whatsapp: { available: boolean; state?: string; provider?: string; reason?: string }
  email: { available: boolean }
}

/** Shape padrão de emissão de token sanctum (login, google, magic-link). */
export interface TokenGrant {
  access_token: string
  token_type: 'bearer'
  /** segundos (SANCTUM_EXPIRATION*60; default 3600) */
  expires_in: number
}

/** POST /auth/magic-pin/verify — { phone, pin } (⚠️ token, não access_token). */
export interface MagicPinVerifyResponse {
  token: string
  user: {
    id: number
    name: string | null
    email: string | null
    celular: string | null
    role: string
    tenant_id?: number | null
  }
  redirect_to: string | null
  is_new_user: boolean
}

/** POST /auth/magic-link/verify — { email, pin }. */
export interface MagicLinkVerifyResponse extends TokenGrant {
  user: { id: number; name: string | null; email: string | null }
  redirect_to: string | null
  is_new_user: boolean
}

/** GET /auth/me (auth:sanctum) — UserResource (campos que o front usa). */
export interface MeResponse {
  user: {
    id: number
    name: string | null
    email: string | null
    celular?: string | null
    role?: string
    updated_at?: string | null
    password_changed_at?: string | null
    [key: string]: unknown
  }
}

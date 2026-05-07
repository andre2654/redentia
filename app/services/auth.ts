export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  /**
   * Username de login. Deprecated como input do formulario, agora vai
   * sempre = email. Mantido na interface enquanto o backend ainda exige
   * o campo (vamos remover a obrigatoriedade na proxima migration).
   */
  login?: string
  /** Telefone agora e opcional no cadastro — coletado em /settings depois. */
  celular?: string
  /** Codigo do assessor — removido do formulario default mas a interface
   *  continua aceitando pra fluxos B2B antigos. */
  advisor_code?: string
}

export interface LoginPayload {
  login: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface AuthResponse {
  token: string
  user?: {
    id: string | number
    name: string
    email: string
    login?: string
    celular?: string
  }
}

export const useAuthService = () => {
  const { authFetch } = useCustomFetch()
  const config = useRuntimeConfig()
  const baseURL = `${config.public.apiBaseUrl}/auth`

  async function register(body: RegisterPayload): Promise<AuthResponse> {
    const resp = await $fetch<AuthResponse>(`${baseURL}/register`, {
      method: 'POST',
      credentials: 'include',
      body,
    })
    return resp
  }

  async function login(body: LoginPayload): Promise<LoginResponse> {
    const resp = await $fetch<LoginResponse>(`${baseURL}/login`, {
      method: 'POST',
      credentials: 'include',
      body,
    })
    return resp
  }

  async function me() {
    const resp = await authFetch(`${baseURL}/me`, {
      method: 'GET',
    })
    return resp
  }

  async function logout() {
    const resp = await authFetch(`${baseURL}/logout`, {
      method: 'POST',
    })
    return resp
  }

  async function updateProfile(body: {
    name?: string
    celular?: string
    /** E.164 ja normalizado (ex: +5511999999999). Quando vazio, mantem
     *  o valor antigo no backend (PUT parcial). */
  }) {
    const resp = await authFetch(`${baseURL}/profile`, {
      method: 'PUT',
      body,
    })
    return resp
  }

  async function changePassword(body: {
    current_password: string
    password: string
    password_confirmation: string
  }) {
    const resp = await authFetch(`${baseURL}/password`, {
      method: 'PUT',
      body,
    })
    return resp
  }

  async function becomeAdvisor() {
    const resp = await authFetch(`${baseURL}/become-advisor`, {
      method: 'POST',
    })
    return resp
  }

  /**
   * Sign in / sign up via Google id_token. The frontend obtains the
   * id_token from Google Identity Services (popup or One Tap), then
   * forwards it here. Backend validates against Google's tokeninfo
   * endpoint, finds-or-creates the user, returns the same Sanctum
   * token shape as the regular login.
   */
  async function loginWithGoogle(idToken: string): Promise<LoginResponse> {
    return await $fetch<LoginResponse>(`${baseURL}/google`, {
      method: 'POST',
      credentials: 'include',
      body: { id_token: idToken },
    })
  }

  /**
   * Magic Link flow — passwordless auth.
   *
   * STEP 1 (request): user manda email + redirect_to. Backend gera token,
   * salva em magic_link_tokens (15min TTL), envia email com link tipo
   * `https://redentia.com.br/auth/magic-link/verify?token=...`.
   *
   * STEP 2 (verify): user clica no link. Frontend extrai token da URL,
   * chama esta funcao. Backend valida, cria/login user, retorna Sanctum
   * token + user + redirect_to + isNewUser. Frontend salva token e
   * navega pra redirect_to.
   *
   * REDIRECT TO:
   *   - /auth/register page → "/" (home)
   *   - /raio-x gate → "/wallet?onboarding=true" (com tickers em sessionStorage)
   *   - /auth/login page → "/" (home)
   *
   * Anti-enumeration: backend SEMPRE retorna 200 no request, mesmo se o
   * email nao gerou link (ex: rate limit). UI nao revela "email existe".
   */
  async function magicLinkRequest(body: {
    email: string
    redirect_to: string
  }): Promise<{ message: string }> {
    return await $fetch<{ message: string }>(`${baseURL}/magic-link/request`, {
      method: 'POST',
      credentials: 'include',
      body,
    })
  }

  async function magicLinkVerify(token: string): Promise<{
    access_token: string
    token_type?: string
    user?: { id: string | number; name?: string; email: string }
    redirect_to?: string
    is_new_user?: boolean
  }> {
    return await $fetch(`${baseURL}/magic-link/verify`, {
      method: 'POST',
      credentials: 'include',
      body: { token },
    })
  }

  /**
   * Step 1 of password reset — backend ALWAYS returns 200 with the
   * same generic message regardless of whether the email is registered
   * (anti-enumeration). The error path here only fires on
   * network/throttle failures, never on "unknown email".
   */
  async function forgotPassword(body: { email: string }): Promise<{ message: string }> {
    return await $fetch<{ message: string }>(`${baseURL}/forgot-password`, {
      method: 'POST',
      body,
    })
  }

  /**
   * Step 2 of password reset — token + email arrive via the URL
   * query string (the email link generated by the backend). Backend
   * returns 200 on success or 422 with a Portuguese error message
   * when the token is invalid/expired.
   */
  async function resetPassword(body: {
    token: string
    email: string
    password: string
    password_confirmation: string
  }): Promise<{ message: string }> {
    return await $fetch<{ message: string }>(`${baseURL}/reset-password`, {
      method: 'POST',
      body,
    })
  }

  // ============================================================
  // MAGIC PIN via WhatsApp — auth passwordless primaria.
  // Mesma logica do magicLink mas com PIN curto via WhatsApp.
  // ============================================================

  /**
   * Step 1: solicita PIN. Backend gera PIN de 6 digitos, envia via
   * WhatsApp pro telefone informado. Retorna 200 sempre (anti-enum).
   */
  async function magicPinRequest(body: {
    phone: string
    redirect_to?: string
  }): Promise<{ message: string }> {
    return await $fetch<{ message: string }>(`${baseURL}/magic-pin/request`, {
      method: 'POST',
      credentials: 'include',
      body,
    })
  }

  /**
   * Step 2: valida PIN digitado pelo user. Em sucesso retorna token
   * Sanctum + dados do user (cria user se for novo).
   */
  async function magicPinVerify(body: {
    phone: string
    pin: string
  }): Promise<{
    token: string
    user: { id: number; name: string | null; email: string | null; celular: string | null; role: string; tenant_id?: number | null }
    redirect_to: string
    is_new_user: boolean
  }> {
    return await $fetch(`${baseURL}/magic-pin/verify`, {
      method: 'POST',
      credentials: 'include',
      body,
    })
  }

  async function magicPinResend(body: {
    phone: string
    redirect_to?: string
  }): Promise<{ message: string }> {
    return await $fetch<{ message: string }>(`${baseURL}/magic-pin/resend`, {
      method: 'POST',
      credentials: 'include',
      body,
    })
  }

  // ============================================================
  // CONTACT GATE — adiciona telefone OU email faltante no user
  // ja autenticado (in-app, no /help).
  // ============================================================

  function authHeaders(): Record<string, string> {
    const authStore = useAuthStore()
    return authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}
  }

  async function requestPhonePin(phone: string): Promise<{ message: string }> {
    return await $fetch<{ message: string }>(`${baseURL}/me/phone/request-pin`, {
      method: 'POST',
      headers: authHeaders(),
      body: { phone },
    })
  }

  async function verifyPhonePin(phone: string, pin: string): Promise<{
    message: string
    user: { id: number; name: string | null; email: string | null; celular: string | null; role: string }
  }> {
    return await $fetch(`${baseURL}/me/phone/verify-pin`, {
      method: 'POST',
      headers: authHeaders(),
      body: { phone, pin },
    })
  }

  async function requestEmailLink(email: string): Promise<{ message: string }> {
    return await $fetch<{ message: string }>(`${baseURL}/me/email/request-link`, {
      method: 'POST',
      headers: authHeaders(),
      body: { email },
    })
  }

  async function verifyEmailLink(token: string): Promise<{
    message: string
    user: { id: number; name: string | null; email: string | null; celular: string | null; role: string }
  }> {
    return await $fetch(`${baseURL}/me/email/verify-link`, {
      method: 'POST',
      headers: authHeaders(),
      body: { token },
    })
  }

  return {
    register,
    login,
    loginWithGoogle,
    me,
    logout,
    updateProfile,
    changePassword,
    becomeAdvisor,
    forgotPassword,
    resetPassword,
    magicLinkRequest,
    magicLinkVerify,
    magicPinRequest,
    magicPinVerify,
    magicPinResend,
    requestPhonePin,
    verifyPhonePin,
    requestEmailLink,
    verifyEmailLink,
  }
}

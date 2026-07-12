/**
 * useGoogleAuth — Google Identity Services (GIS) → id_token.
 * Porte do composable homônimo do Frontend (o fluxo que o Laravel espera:
 * o browser obtém um id_token JWT e o POST /auth/google valida via
 * tokeninfo + audience check com o client_id público).
 *
 * O SDK carrega lazy no primeiro uso (visitante que nunca clica no Google
 * não paga o script). O GIS só emite credencial pelo botão oficial
 * (renderButton, iframe) ou One Tap — não existe API programática de popup
 * pra id_token; quem precisa de visual custom sobrepõe o botão oficial
 * (ver LoginGoogleButton).
 *
 * Config: runtimeConfig.public.googleClientId (NUXT_PUBLIC_GOOGLE_CLIENT_ID,
 * env-only — sem env, clientId = '' e o chamador se esconde).
 */

interface GoogleCredentialResponse {
  credential: string // o id_token JWT
  select_by: string
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string
    callback: (resp: GoogleCredentialResponse) => void
    use_fedcm_for_prompt?: boolean
  }) => void
  renderButton: (
    el: HTMLElement,
    config: {
      type?: 'standard' | 'icon'
      theme?: 'outline' | 'filled_blue' | 'filled_black'
      size?: 'large' | 'medium' | 'small'
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
      shape?: 'rectangular' | 'pill' | 'circle' | 'square'
      logo_alignment?: 'left' | 'center'
      width?: string | number
      locale?: string
    },
  ) => void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } }
  }
}

let scriptLoadedPromise: Promise<void> | null = null
let initializedClientId: string | null = null
// Resolver do render em andamento — o callback do GIS dispara assíncrono e
// acorda a Promise que o componente está aguardando.
let pendingResolver: ((token: string) => void) | null = null
let pendingRejecter: ((err: Error) => void) | null = null

function loadGisScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Identity Services só roda no browser'))
  }
  if (window.google?.accounts?.id) return Promise.resolve()
  if (scriptLoadedPromise) return scriptLoadedPromise

  scriptLoadedPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptLoadedPromise = null
      reject(new Error('Falha ao carregar o SDK do Google.'))
    }
    document.head.appendChild(script)
  })
  return scriptLoadedPromise
}

function ensureInitialized(clientId: string): void {
  if (initializedClientId === clientId) return
  if (!window.google?.accounts?.id) {
    throw new Error('Google Identity Services não carregou.')
  }
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (resp) => {
      const token = resp?.credential
      if (token && pendingResolver) {
        pendingResolver(token)
      } else if (pendingRejecter) {
        pendingRejecter(new Error('Resposta sem credencial do Google.'))
      }
      pendingResolver = null
      pendingRejecter = null
    },
    use_fedcm_for_prompt: true,
  })
  initializedClientId = clientId
}

export function useGoogleAuth() {
  const config = useRuntimeConfig()
  const clientId = (config.public.googleClientId as string | undefined) || ''

  /**
   * Renderiza o botão oficial do Google dentro de `el` e resolve com o
   * id_token quando o usuário completa o fluxo. Cada chamada limpa o
   * container antes (o renderButton do GIS appenda um iframe por vez).
   */
  async function renderButton(
    el: HTMLElement,
    options: { text?: 'signin_with' | 'signup_with' | 'continue_with'; width?: number } = {},
  ): Promise<string> {
    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID não configurado (public.googleClientId).')
    }
    await loadGisScript()
    ensureInitialized(clientId)

    return new Promise<string>((resolve, reject) => {
      pendingResolver = resolve
      pendingRejecter = reject
      el.innerHTML = ''
      window.google!.accounts.id.renderButton(el, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: options.text ?? 'continue_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: options.width,
        locale: 'pt-BR',
      })
    })
  }

  return { renderButton, clientId }
}

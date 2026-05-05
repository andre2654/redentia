/**
 * useGoogleAuth — wraps Google Identity Services (GIS) for sign-in.
 *
 * The browser SDK lives at https://accounts.google.com/gsi/client.
 * We load it lazily on first use so visitors who never click the
 * Google button don't pay for the script transfer or the ~30KB of
 * runtime cost it carries.
 *
 * Two usage modes:
 *
 *   - `signInWithPopup()` — programmatic. Call from a click handler.
 *     Opens Google's account chooser in a popup, resolves to an
 *     `id_token` JWT. Throws if user dismisses or browser blocks.
 *
 *   - `renderButton(el, options)` — declarative. Renders Google's
 *     official button (required by their brand guidelines) inside
 *     the given element, wires the same callback under the hood.
 *
 * Both paths surface the same `id_token` event — components decide
 * whether to mount a button (recommended for default look) or
 * trigger a custom-styled button that calls signInWithPopup().
 *
 * Configuration:
 *   - public.googleClientId set in nuxt.config.ts → runtimeConfig.public
 */

interface GoogleCredentialResponse {
  credential: string // the id_token JWT
  select_by: string
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string
    callback: (resp: GoogleCredentialResponse) => void
    auto_select?: boolean
    cancel_on_tap_outside?: boolean
    use_fedcm_for_prompt?: boolean
  }) => void
  prompt: (notification?: (n: any) => void) => void
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
  disableAutoSelect: () => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId
      }
    }
  }
}

let scriptLoadedPromise: Promise<void> | null = null
let initializedClientId: string | null = null
// Holds the resolver for the in-flight popup so the GIS callback
// (which fires asynchronously) can wake the awaiting Promise.
let pendingPopupResolver: ((token: string) => void) | null = null
let pendingPopupRejecter: ((err: Error) => void) | null = null

function loadGisScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Identity Services only runs in the browser'))
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
      if (token && pendingPopupResolver) {
        pendingPopupResolver(token)
      } else if (pendingPopupRejecter) {
        pendingPopupRejecter(new Error('Resposta sem credencial do Google.'))
      }
      pendingPopupResolver = null
      pendingPopupRejecter = null
    },
    use_fedcm_for_prompt: true,
  })
  initializedClientId = clientId
}

export function useGoogleAuth() {
  const config = useRuntimeConfig()
  const clientId = (config.public.googleClientId as string | undefined) || ''

  /**
   * Render Google's official button into the given element. Returns
   * a Promise that resolves with `id_token` when the user signs in,
   * or rejects on error. Caller is responsible for showing loading
   * state.
   *
   * Usage:
   *   const tokenPromise = renderButton(myDivRef.value, { theme: 'outline' })
   *   const idToken = await tokenPromise
   */
  async function renderButton(
    el: HTMLElement,
    options: {
      theme?: 'outline' | 'filled_blue' | 'filled_black'
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
      size?: 'large' | 'medium' | 'small'
      shape?: 'rectangular' | 'pill' | 'circle' | 'square'
      width?: number
    } = {},
  ): Promise<string> {
    if (!clientId) {
      throw new Error(
        'GOOGLE_CLIENT_ID não configurado (public.googleClientId em nuxt.config).',
      )
    }
    await loadGisScript()
    ensureInitialized(clientId)

    return new Promise<string>((resolve, reject) => {
      pendingPopupResolver = resolve
      pendingPopupRejecter = reject
      // Clear any previous render — Google's renderButton appends
      // an iframe each time, leading to duplicate buttons.
      el.innerHTML = ''
      window.google!.accounts.id.renderButton(el, {
        type: 'standard',
        theme: options.theme ?? 'outline',
        size: options.size ?? 'large',
        text: options.text ?? 'continue_with',
        shape: options.shape ?? 'rectangular',
        logo_alignment: 'left',
        width: options.width,
        locale: 'pt-BR',
      })
    })
  }

  return { renderButton, clientId }
}

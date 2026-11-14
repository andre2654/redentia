/**
 * useAppleAuth — Sign in with Apple JS → id_token.
 *
 * O SDK da Apple (appleid.auth.js) carrega no primeiro clique. Com
 * usePopup, o signIn() devolve o id_token na própria página, sem
 * redirecionar: o mesmo desenho do Google (o browser pega o token, o
 * POST /auth/apple confere a assinatura, o aud e o nonce).
 *
 * O nonce: a Apple recebe o sha256 do nonce e o devolve dentro do token; o
 * backend recebe o nonce cru e confere o hash. Assim um token roubado não
 * serve para outra sessão.
 *
 * O nome só vem na PRIMEIRA autorização (a Apple não manda de novo), por
 * isso ele viaja junto com o token.
 *
 * Config: runtimeConfig.public.appleClientId (NUXT_PUBLIC_APPLE_CLIENT_ID) e
 * appleRedirectUri (NUXT_PUBLIC_APPLE_REDIRECT_URI, padrão a origem + /login).
 * Sem o client id, clientId = '' e o botão se esconde.
 */

interface AppleSignInResponse {
  authorization: { id_token: string; code: string; state?: string }
  user?: { email?: string; name?: { firstName?: string; lastName?: string } }
}

interface AppleIdAuth {
  init: (config: {
    clientId: string
    scope: string
    redirectURI: string
    state?: string
    nonce?: string
    usePopup: boolean
  }) => void
  signIn: () => Promise<AppleSignInResponse>
}

declare global {
  interface Window {
    AppleID?: { auth: AppleIdAuth }
  }
}

export interface AppleCredencial {
  idToken: string
  nonce: string
  nome?: string
}

const SDK = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/pt_BR/appleid.auth.js'
let carregando: Promise<void> | null = null

function carregarSdk(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('O login da Apple só roda no navegador.'))
  if (window.AppleID?.auth) return Promise.resolve()
  if (carregando) return carregando
  carregando = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SDK
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      carregando = null
      reject(new Error('Falha ao carregar o login da Apple.'))
    }
    document.head.appendChild(script)
  })
  return carregando
}

function aleatorio(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

async function sha256(texto: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto))
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Quem fechou o popup não errou: o botão só volta ao normal. */
export function appleCancelado(e: unknown): boolean {
  const erro = (e as { error?: string } | null)?.error
  return erro === 'popup_closed_by_user' || erro === 'user_cancelled_authorize'
}

export function useAppleAuth() {
  const config = useRuntimeConfig()
  const clientId = (config.public.appleClientId as string | undefined) || ''

  async function entrar(): Promise<AppleCredencial> {
    if (!clientId) throw new Error('APPLE_CLIENT_ID não configurado (public.appleClientId).')
    await carregarSdk()
    const nonce = aleatorio()
    const redirectURI = (config.public.appleRedirectUri as string | undefined) || `${window.location.origin}/login`
    window.AppleID!.auth.init({
      clientId,
      scope: 'name email',
      redirectURI,
      state: aleatorio(),
      nonce: await sha256(nonce),
      usePopup: true,
    })
    const r = await window.AppleID!.auth.signIn()
    const nome = [r.user?.name?.firstName, r.user?.name?.lastName].filter(Boolean).join(' ').trim()
    return { idToken: r.authorization.id_token, nonce, nome: nome || undefined }
  }

  return { entrar, clientId }
}

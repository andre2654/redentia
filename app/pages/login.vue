<script setup lang="ts">
// /login — porta de entrada do miolo logado (PR6). Em 11/11/2026 a tela vestiu
// a Aportou (LoginMinimo segue o quadro Login.dc.html: formulário no creme e o
// painel cobalto da marca); o fluxo abaixo não mudou. Desde 04/11/2026 a tela é
// a "Minimal" (LoginMinimo), escolhida pelo dono entre sete direções pensadas
// no celular: branco, um título enorme e leve, um campo, um botão, e a Apple e
// o Google em linhas finas. Entrar e Criar conta, celular e e-mail, na MESMA
// rota, sem navegação. Esta página guarda toda a lógica; LoginMinimo recebe
// `porta` (estado + ações) e desenha.
//
// O design coleta só o identificador (estilo Nubank); o fluxo real é
// passwordless por PIN — celular → POST /auth/magic-pin/* (WhatsApp,
// primário) e e-mail → POST /auth/magic-link/* (PIN por e-mail). O verify
// faz firstOrCreate no backend, então Entrar e Criar conta compartilham o
// MESMO fluxo (o modo só troca a copy, fiel ao design). Google entra via
// GIS → POST /auth/google (LoginGoogleButton) e a Apple via Sign in with
// Apple JS → POST /auth/apple (LoginAppleButton).
//
// GET /auth/channels/status decide o canal: WhatsApp fora → método e-mail
// vira o default e o submit por celular é bloqueado com aviso inline (sem
// isso o request 200-anti-enum "engole" e o código nunca chega).
//
// Query params: ?email= (handoff do hero do /mercado)
// pré-seleciona e-mail; ?redirect= (sanitizado — só path interno) é o
// destino pós-auth e também viaja no redirect_to dos requests de PIN.
import type {
  AuthChannelsStatus,
  MagicLinkVerifyResponse,
  MagicPinVerifyResponse,
  MeResponse,
  SocialLoginResponse,
} from '~/types/auth'
import type { AppleCredencial } from '~/composables/useAppleAuth'
import type { PortaLogin } from '~/types/loginPorta'
import { cabecalhosAtribuicaoDaSessao, dispararEventoAuth } from '~/utils/atribuicao'

definePageMeta({
  layout: false,
  middleware: [
    // Já logado → nada de form: segue direto pro destino (?redirect=
    // sanitizado ou home). Roda no SSR (302) e em navegação client.
    (to) => {
      const token = useCookie<string | null>('nu:token')
      if (!token.value) return
      return navigateTo(sanitizeRedirect(to.query.redirect), { replace: true })
    },
  ],
})

const route = useRoute()
const { publicFetch, authFetch } = useApi()
const { setSession, user } = useAuthState()

const redirectTarget = sanitizeRedirect(route.query.redirect)

// Tela de auth não rankeia: noindex, mas FOLLOW — os links internos (logo →
// '/') continuam passando sinal. Title exato do produto, sem o sufixo
// da marca do titleTemplate global (ficaria "Entrar na Aportou · Aportou").
usePageSeo({
  title: `Entrar na ${MARCA.nome}`,
  description: `Entre ou crie a sua conta na ${MARCA.nome} com o celular (código por WhatsApp), o e-mail, a Apple ou o Google.`,
  path: '/login',
  robots: 'noindex, follow',
})
useHead({ titleTemplate: null })

// ————— estado (espelho do state do design + etapa PIN) —————
const prefillEmail = typeof route.query.email === 'string' ? route.query.email.trim() : ''
const mode = ref<'login' | 'cadastro'>('login')
const method = ref<'phone' | 'email'>(prefillEmail ? 'email' : 'phone')
const phone = ref('')
const email = ref(prefillEmail)
const step = ref<'identifier' | 'pin'>('identifier')

const sending = ref(false)
const verifying = ref(false)
const identifierError = ref<string | null>(null)
const pinError = ref<string | null>(null)
const googleError = ref<string | null>(null)
const googleSubmitting = ref(false)
const whatsappDown = ref(false)

// ————— copy dinâmica (verbatim do renderVals do design) —————
const isCad = computed(() => mode.value === 'cadastro')
const isPhone = computed(() => method.value === 'phone')
// veio do /assinar (o botão da assinatura, deslogado): é o passo 1 de 3 do
// passo a passo da assinatura, e a página diz isso (31/10/2026)
const vemDaAssinatura = redirectTarget.startsWith('/assinar')
const ready = computed(() =>
  isPhone.value ? phone.value.replace(/\D/g, '').length >= 10 : /.+@.+\..+/.test(email.value),
)
const mainCta = computed(() => {
  if (sending.value) return 'Enviando…'
  if (!ready.value) return 'Continuar'
  return isCad.value ? 'Criar conta' : 'Entrar'
})
const altLabel = computed(() => (isCad.value ? 'Já tem conta?' : 'Ainda não tem conta?'))
const altCta = computed(() => (isCad.value ? 'Entrar' : 'Criar conta grátis'))
const fieldHelp = computed(() =>
  isPhone.value
    ? 'Seu celular serve só para receber o código, pelo WhatsApp.'
    : 'Seu e-mail serve só para receber o código.',
)
const whatsappNotice = 'O envio por WhatsApp está temporariamente indisponível. Entre com seu e-mail.'

function toggleMode() {
  mode.value = isCad.value ? 'login' : 'cadastro'
}
function toggleMethod() {
  method.value = isPhone.value ? 'email' : 'phone'
  identifierError.value = null
}

// ————— fallback automático de canal (WhatsApp fora → e-mail) —————
onMounted(async () => {
  try {
    const s = await publicFetch<AuthChannelsStatus>('/auth/channels/status')
    if (!s.whatsapp?.available) {
      whatsappDown.value = true
      // só troca sozinho se o user ainda não começou a digitar o celular
      if (method.value === 'phone' && !phone.value) method.value = 'email'
    }
  } catch {
    // status indisponível → assume canais ok (o submit ainda trata erro real)
  }
})

// ————— mensagens de erro (inline, na linguagem do produto) —————
interface ApiError {
  statusCode?: number
  status?: number
  data?: { message?: string; errors?: Record<string, string[]> }
}
function apiMessage(e: unknown, fallback: string): string {
  const err = e as ApiError
  const status = err?.statusCode ?? err?.status
  if (status === 429) return 'Muitas tentativas. Aguarde um instante e tente de novo.'
  const firstValidation = err?.data?.errors ? Object.values(err.data.errors)[0]?.[0] : undefined
  const msg = err?.data?.message ?? firstValidation
  // 422 de validação do Laravel pode vir com a chave CRUA sem tradução
  // ('validation.email' — verificado ao vivo) — nunca vazar isso pro user.
  if (!msg || /^validation\./.test(msg)) return fallback
  return msg
}

// ————— etapa 1: identificador → request do PIN —————
async function submitIdentifier() {
  if (!ready.value || sending.value) return
  identifierError.value = null
  if (isPhone.value && whatsappDown.value) {
    identifierError.value = whatsappNotice
    return
  }
  sending.value = true
  try {
    if (isPhone.value) {
      // 200 sempre (anti-enumeração) — rate limit interno: 3/5min por phone
      await publicFetch('/auth/magic-pin/request', {
        method: 'POST',
        body: { phone: phone.value, redirect_to: redirectTarget },
      })
    } else {
      // 200 sempre — rate limit interno: 5/5min por e-mail
      await publicFetch('/auth/magic-link/request', {
        method: 'POST',
        body: { email: email.value.trim(), redirect_to: redirectTarget },
      })
    }
    pinError.value = null
    step.value = 'pin'
    startCooldown(30)
  } catch (e) {
    // 422 = validação de formato do Laravel (o regex do front é mais frouxo
    // que a rule `email`) → orienta a corrigir; resto = falha genérica.
    const status = (e as ApiError)?.statusCode ?? (e as ApiError)?.status
    identifierError.value = apiMessage(
      e,
      status === 422
        ? (isPhone.value ? 'Confira o celular digitado.' : 'Confira o e-mail digitado.')
        : 'Não foi possível enviar o código. Tente novamente.',
    )
  } finally {
    sending.value = false
  }
}

// ————— etapa 2: PIN → verify → sessão —————
async function verifyPin(pin: string) {
  if (verifying.value) return
  verifying.value = true
  pinError.value = null
  try {
    if (isPhone.value) {
      // ⚠️ magic-pin devolve o token em `token` (não access_token)
      const r = await publicFetch<MagicPinVerifyResponse>('/auth/magic-pin/verify', {
        method: 'POST',
        body: { phone: phone.value, pin },
        headers: cabecalhosAtribuicaoDaSessao(),
      })
      dispararEventoAuth('magic_pin', r.is_new_user === true)
      await finishLogin(r.token, r.user?.id, r.user?.name, r.user?.email)
    } else {
      const r = await publicFetch<MagicLinkVerifyResponse>('/auth/magic-link/verify', {
        method: 'POST',
        body: { email: email.value.trim(), pin },
        headers: cabecalhosAtribuicaoDaSessao(),
      })
      dispararEventoAuth('magic_link', r.is_new_user === true)
      await finishLogin(r.access_token, r.user?.id, r.user?.name, r.user?.email)
    }
  } catch (e) {
    // 422 com mensagem pt-BR pronta (incorreto + tentativas restantes /
    // expirado / bloqueado) — exibir verbatim
    pinError.value = apiMessage(e, 'Não foi possível confirmar o código. Tente novamente.')
    verifying.value = false
  }
}

async function finishLogin(token: string, id?: number, name?: string | null, mail?: string | null) {
  setSession(token, id ? { id, name: name ?? '', email: mail ?? undefined } : null)
  try {
    const me = await authFetch<MeResponse>('/auth/me')
    user.value = { id: me.user.id, name: me.user.name ?? '', email: me.user.email ?? undefined }
  } catch {
    // sessão já gravada no cookie — o shell re-hidrata o perfil depois
  }
  await navigateTo(redirectTarget, { replace: true })
}

// ————— reenvio com cooldown (30s, o mesmo do produto atual) —————
const resendIn = ref(0)
let cooldownTimer: ReturnType<typeof setInterval> | null = null
function startCooldown(seconds: number) {
  resendIn.value = seconds
  if (cooldownTimer) clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    resendIn.value -= 1
    if (resendIn.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
      resendIn.value = 0
    }
  }, 1000)
}
onBeforeUnmount(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})

async function resendPin() {
  if (resendIn.value > 0) return
  pinError.value = null
  try {
    if (isPhone.value) {
      await publicFetch('/auth/magic-pin/resend', {
        method: 'POST',
        body: { phone: phone.value, redirect_to: redirectTarget },
      })
    } else {
      await publicFetch('/auth/magic-link/resend', {
        method: 'POST',
        body: { email: email.value.trim(), redirect_to: redirectTarget },
      })
    }
    startCooldown(30)
  } catch (e) {
    pinError.value = apiMessage(e, 'Não foi possível reenviar o código. Tente novamente.')
  }
}

function backToIdentifier() {
  step.value = 'identifier'
  pinError.value = null
  verifying.value = false
}

// ————— Google (id_token → POST /auth/google → sessão) —————
const socialEntrando = ref<'google' | 'apple'>('google')

async function onGoogleCredential(idToken: string) {
  if (googleSubmitting.value) return
  socialEntrando.value = 'google'
  googleSubmitting.value = true
  googleError.value = null
  try {
    const r = await publicFetch<SocialLoginResponse>('/auth/google', {
      method: 'POST',
      body: { id_token: idToken },
      headers: cabecalhosAtribuicaoDaSessao(),
    })
    dispararEventoAuth('google', r.is_new_user === true)
    await finishLogin(r.access_token)
  } catch (e) {
    // 401 token inválido/aud errada · 422 e-mail não verificado · 503 tokeninfo fora
    googleError.value = apiMessage(e, 'Falha ao entrar com o Google. Tente novamente.')
    googleSubmitting.value = false
  }
}

// Apple: o mesmo caminho do Google (POST /auth/apple), com o nonce cru e o
// nome que a Apple só manda na primeira autorização
async function onAppleCredential(cred: AppleCredencial) {
  if (googleSubmitting.value) return
  socialEntrando.value = 'apple'
  googleSubmitting.value = true
  googleError.value = null
  try {
    const r = await publicFetch<SocialLoginResponse>('/auth/apple', {
      method: 'POST',
      body: { id_token: cred.idToken, nonce: cred.nonce, name: cred.nome },
      headers: cabecalhosAtribuicaoDaSessao(),
    })
    dispararEventoAuth('apple', r.is_new_user === true)
    await finishLogin(r.access_token)
  } catch (e) {
    googleError.value = apiMessage(e, 'Falha ao entrar com a Apple. Tente novamente.')
    googleSubmitting.value = false
  }
}

// ————— o que a tela (LoginMinimo) recebe: o estado e as ações desta página —————
const porta: PortaLogin = reactive({
  mode, method, phone, email, step, sending, verifying, identifierError, pinError, googleError,
  googleSubmitting, whatsappDown, socialEntrando, resendIn,
  isCad, isPhone, ready, vemDaAssinatura, mainCta, altLabel, altCta, fieldHelp, whatsappNotice,
  submitIdentifier, verifyPin, resendPin, backToIdentifier, toggleMode, toggleMethod, onGoogleCredential, onAppleCredential,
})

// Os estados que só aparecem depois de um request (código enviado, erro,
// WhatsApp fora, entrando) forçados no dev, sem request nenhum ao backend:
// ?entrar-estado=pin|pin-erro|verificando|erro|enviando|whatsapp|social,
// com ?entrar-modo=cadastro e ?entrar-metodo=email. Roda no setup, igual no
// SSR e no cliente, então não há troca na hidratação.
if (import.meta.dev) {
  const forcar = String(route.query['entrar-estado'] ?? '')
  if (route.query['entrar-modo'] === 'cadastro') mode.value = 'cadastro'
  if (route.query['entrar-metodo'] === 'email') method.value = 'email'
  if (forcar) {
    if (!phone.value) phone.value = '(11) 98765-4321'
    if (!email.value) email.value = 'voce@email.com'
  }
  if (forcar === 'pin' || forcar === 'pin-erro' || forcar === 'verificando') {
    step.value = 'pin'
    resendIn.value = forcar === 'pin' ? 24 : 0
  }
  if (forcar === 'pin-erro') pinError.value = 'Código incorreto. Você ainda tem 2 tentativas.'
  if (forcar === 'verificando') verifying.value = true
  if (forcar === 'erro') identifierError.value = 'Não foi possível enviar o código. Tente novamente.'
  if (forcar === 'enviando') sending.value = true
  if (forcar === 'whatsapp') {
    whatsappDown.value = true
    phone.value = ''
  }
  if (forcar === 'social') googleSubmitting.value = true
}
</script>

<template>
  <LoginMinimo :porta="porta" />
</template>

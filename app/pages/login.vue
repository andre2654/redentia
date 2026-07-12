<script setup lang="ts">
// /login — porta de entrada do miolo logado (PR6). Contrato de UX:
// docs/redentia-nu/designs/Redentia Login Nu.dc.html (split-screen: form à
// esquerda, painel dark com a orbe à direita; modos Entrar/Criar conta e
// métodos celular/e-mail na MESMA rota, sem navegação).
//
// O design coleta só o identificador (estilo Nubank); o fluxo real é
// passwordless por PIN — celular → POST /auth/magic-pin/* (WhatsApp,
// primário) e e-mail → POST /auth/magic-link/* (PIN por e-mail). O verify
// faz firstOrCreate no backend, então Entrar e Criar conta compartilham o
// MESMO fluxo (o modo só troca a copy, fiel ao design). Google entra via
// GIS → POST /auth/google (LoginGoogleButton).
//
// GET /auth/channels/status decide o canal: WhatsApp fora → método e-mail
// vira o default e o submit por celular é bloqueado com aviso inline (sem
// isso o request 200-anti-enum "engole" e o código nunca chega).
//
// Query params: ?email= (handoff do hero do /mercado e da NuNewsletterBand)
// pré-seleciona e-mail; ?redirect= (sanitizado — só path interno) é o
// destino pós-auth e também viaja no redirect_to dos requests de PIN.
import type {
  AuthChannelsStatus,
  MagicLinkVerifyResponse,
  MagicPinVerifyResponse,
  MeResponse,
  TokenGrant,
} from '~/types/auth'

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
// /mercado) continuam passando sinal. Title exato do produto, sem o sufixo
// '· Redentia' do titleTemplate global (ficaria "Entrar na Redentia · Redentia").
usePageSeo({
  title: 'Entrar na Redentia',
  description: 'Acesse ou crie sua conta Redentia com celular (código por WhatsApp), e-mail ou Google.',
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
const headline = computed(() => (isCad.value ? 'Crie sua conta Redentia' : 'Entrar na Redentia'))
const inputLabel = computed(() => (isPhone.value ? 'Informe seu celular' : 'Informe seu e-mail'))
const ready = computed(() =>
  isPhone.value ? phone.value.replace(/\D/g, '').length >= 10 : /.+@.+\..+/.test(email.value),
)
const mainCta = computed(() => {
  if (sending.value) return 'Enviando…'
  if (!ready.value) return 'Continuar'
  return isCad.value ? 'Criar conta' : 'Acessar'
})
const methodCta = computed(() =>
  isPhone.value
    ? isCad.value ? 'Cadastrar com e-mail' : 'Entrar com e-mail'
    : isCad.value ? 'Cadastrar com celular' : 'Entrar com celular',
)
const altLabel = computed(() => (isCad.value ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'))
const altCta = computed(() => (isCad.value ? 'Entrar' : 'Criar agora'))
const fieldHelp = computed(() =>
  isPhone.value
    ? 'Usamos seu celular só pra te enviar o código de acesso por WhatsApp.'
    : 'Usamos seu e-mail só pra te enviar o código de acesso.',
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
      })
      await finishLogin(r.token, r.user?.id, r.user?.name, r.user?.email)
    } else {
      const r = await publicFetch<MagicLinkVerifyResponse>('/auth/magic-link/verify', {
        method: 'POST',
        body: { email: email.value.trim(), pin },
      })
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
async function onGoogleCredential(idToken: string) {
  if (googleSubmitting.value) return
  googleSubmitting.value = true
  googleError.value = null
  try {
    const r = await publicFetch<TokenGrant>('/auth/google', {
      method: 'POST',
      body: { id_token: idToken },
    })
    await finishLogin(r.access_token)
  } catch (e) {
    // 401 token inválido/aud errada · 422 e-mail não verificado · 503 tokeninfo fora
    googleError.value = apiMessage(e, 'Falha ao entrar com o Google. Tente novamente.')
    googleSubmitting.value = false
  }
}
</script>

<template>
  <NuAuthLayout>
    <!-- :key re-dispara o qfade a cada troca de etapa (mesma página) -->
    <div :key="step" class="lg__step">
      <template v-if="step === 'identifier'">
        <h1 class="lg__h1">{{ headline }}</h1>

        <form @submit.prevent="submitIdentifier">
          <div class="lg__label"><NuFieldLabel :label="inputLabel" :help="fieldHelp" /></div>
          <NuUnderlineInput
            v-if="isPhone"
            v-model="phone"
            type="tel"
            name="phone"
            placeholder="(11) 90000-0000"
            autocomplete="tel-national"
          />
          <NuUnderlineInput
            v-else
            v-model="email"
            type="email"
            name="email"
            placeholder="voce@email.com"
            autocomplete="email"
          />
          <p v-if="identifierError" class="lg__error">{{ identifierError }}</p>
          <p v-else-if="whatsappDown && isPhone" class="lg__notice">{{ whatsappNotice }}</p>

          <NuPillButton class="lg__cta" type="submit" :disabled="!ready" :loading="sending">
            {{ mainCta }}
          </NuPillButton>
        </form>

        <NuTextDivider class="lg__divider" />

        <div class="lg__alts">
          <NuListActionButton :label="methodCta" @click="toggleMethod">
            <template #icon>
              <!-- envelope (está em celular → oferece e-mail) -->
              <svg v-if="isPhone" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <path d="M3.5 7l8.5 6 8.5-6" />
              </svg>
              <!-- smartphone (está em e-mail → oferece celular) -->
              <svg v-else width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
                <path d="M11 18.5h2" />
              </svg>
            </template>
          </NuListActionButton>

          <LoginGoogleButton
            :disabled="googleSubmitting"
            @credential="onGoogleCredential"
            @error="googleError = $event"
          />
        </div>
        <p v-if="googleSubmitting" class="lg__google-state">Entrando com o Google…</p>
        <p v-else-if="googleError" class="lg__error lg__error--tight">{{ googleError }}</p>

        <NuInlineTextToggle class="lg__footer" :label="altLabel" :cta="altCta" @click="toggleMode" />
      </template>

      <LoginPinStep
        v-else
        :identifier="isPhone ? phone : email.trim()"
        :channel="isPhone ? 'whatsapp' : 'email'"
        :verifying="verifying"
        :error="pinError"
        :resend-in="resendIn"
        @submit="verifyPin"
        @resend="resendPin"
        @back="backToIdentifier"
      />
    </div>
  </NuAuthLayout>
</template>

<style scoped>
.lg__step { animation: nu-fade .5s ease both; }
.lg__h1 {
  margin: 0; color: var(--nu-ink);
  font-size: clamp(32px, 3.4vw, 44px); font-weight: 800;
  letter-spacing: -0.04em; line-height: 1.05;
}
.lg__label { margin-top: clamp(36px, 5vh, 56px); }
.lg__error { margin: 12px 0 0; color: var(--nu-red); font-size: 14px; font-weight: 600; }
.lg__error--tight { margin-top: 10px; }
.lg__notice { margin: 12px 0 0; color: var(--nu-gray-2); font-size: 14px; font-weight: 600; }
.lg__cta { margin-top: clamp(36px, 5vh, 52px); }
.lg__divider { margin-top: 30px; }
.lg__alts { display: flex; flex-direction: column; gap: 10px; margin-top: 26px; }
.lg__google-state { margin: 10px 0 0; color: var(--nu-gray-2); font-size: 14px; font-weight: 600; }
.lg__footer { margin-top: clamp(32px, 5vh, 52px); }
</style>

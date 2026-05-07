<!--
  MoleculesRaioXAuthInline — inline form usado nos 3 spots do /raio-x
  (hero, video, final CTA). Default = WhatsApp PIN; toggle "por email"
  abre o magic link tradicional.

  Por que extrair do raio-x.vue:
    - 3 formularios duplicados na pagina, todos com mesmo state.
    - Add do phone-first dobraria a duplicacao (3x phone + 3x pin + 3x email).
    - Componente isolado: 1 lugar pra ajustar UX, 3 instancias na page.

  Visual: reusa as classes globais .lp-hero__input / .lp-hero__cta da
  page (definidas em raio-x.vue), entao mantem o look consistente
  sem precisar duplicar CSS aqui.

  EVENTOS:
    @sent: { channel: 'phone' | 'email' }      — primeira parte enviada
    @verified: { redirectTo, isNewUser, user } — auth completa (so phone)

  PROPS:
    - cta-text: texto do botao primary (default "Faça o Raio-X grátis")
    - redirect-to: destino apos auth (default "/wallet?from=raiox")
    - pixel-context: nome do tracking event
-->
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    ctaText?: string
    redirectTo?: string
    pixelContext?: string
  }>(),
  {
    ctaText: 'Faça o Raio-X grátis',
    redirectTo: '/wallet?from=raiox',
    pixelContext: 'landing_raiox',
  },
)

interface AuthUser {
  id: number | string
  name: string | null
  email: string | null
  celular: string | null
  role: string
  tenant_id?: number | null
}

const emit = defineEmits<{
  sent: [{ channel: 'phone' | 'email' }]
  verified: [{ redirectTo: string; isNewUser: boolean; user: AuthUser }]
}>()

const router = useRouter()
const { magicLinkRequest, magicPinRequest, magicPinVerify, magicPinResend } = useAuthService()
const { track } = useMetaPixel()
const authStore = useAuthStore()

// Default = WhatsApp PIN. Se backend reportar WhatsApp off, vai pra email
// no onMounted (vide useAuthChannels abaixo). Toggle manual "Prefere por
// email?" continua disponivel.
const channel = ref<'phone' | 'email'>('phone')
const step = ref<'input' | 'pin' | 'sent'>('input')

// Auto-fallback baseado em health do Evolution. Cache 30s na ponta +
// 30s no backend = no max 1 fetch por minuto por usuario.
const { fetchStatus, isWhatsAppAvailable } = useAuthChannels()

onMounted(async () => {
  await fetchStatus()
  if (!isWhatsAppAvailable.value) {
    channel.value = 'email'
  }
})

// Phone state
const phoneRaw = ref('')
const pinDigits = ref<string[]>(['', '', '', '', '', ''])
const pinRefs = ref<HTMLInputElement[]>([])
const resendCooldown = ref(0)
let cooldownInterval: ReturnType<typeof setInterval> | null = null

// Email state (fallback)
const email = ref('')

// Generic
const submitting = ref(false)
const errorMsg = ref('')
const leadFiredOnce = ref(false)

// ============ MASK & VALIDATION ============
/**
 * Mascara local BR sem o country code: (##) # ####-####
 * O +55 e o flag BR ficam FORA do input como prefix visual fixo.
 * phoneRaw guarda APENAS digitos locais (DDD + numero); pra mandar
 * pro backend, fullPhoneE164NoPlus() prefixa "55".
 */
function maskLocalPhone(raw: string): string {
  const digits = raw.replace(/\D+/g, '').slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  const ddd = digits.slice(0, 2)
  if (digits.length === 11) {
    return `(${ddd}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  if (digits.length > 7) {
    return `(${ddd}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  if (digits.length > 6) {
    return `(${ddd}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  if (digits.length > 2) {
    return `(${ddd}) ${digits.slice(2)}`
  }
  return `(${digits})`
}

const phoneMasked = computed({
  get: () => maskLocalPhone(phoneRaw.value),
  set: (val: string) => { phoneRaw.value = val.replace(/\D+/g, '').slice(0, 11) },
})

const phoneIsValid = computed(() => {
  const d = phoneRaw.value.replace(/\D+/g, '')
  // Local BR: 10 (fixo) ou 11 (mobile com 9)
  return d.length === 10 || d.length === 11
})

function fullPhoneE164NoPlus(): string {
  return '55' + phoneRaw.value.replace(/\D+/g, '')
}

const phoneFocused = ref(false)

const emailIsValid = computed(() => {
  const e = email.value.trim()
  return e.includes('@') && e.length > 4
})

const pinIsComplete = computed(() => pinDigits.value.every(d => /^\d$/.test(d)))

const canResend = computed(() => resendCooldown.value === 0 && !submitting.value)

function startCooldown(seconds = 30) {
  resendCooldown.value = seconds
  if (cooldownInterval) clearInterval(cooldownInterval)
  cooldownInterval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0 && cooldownInterval) {
      clearInterval(cooldownInterval)
      cooldownInterval = null
    }
  }, 1000)
}

onBeforeUnmount(() => {
  if (cooldownInterval) clearInterval(cooldownInterval)
})

// ============ TOGGLE CHANNEL ============
function switchTo(next: 'phone' | 'email') {
  channel.value = next
  step.value = 'input'
  errorMsg.value = ''
}

// ============ PIXEL ============
function fireLead(via: string) {
  if (leadFiredOnce.value) return
  track('Lead', {
    content_name: `Landing RaioX ${via}`,
    content_category: 'landing_conversion',
    content_ids: ['raio-x'],
    content_type: 'product',
    currency: 'BRL',
    value: 5,
  })
  leadFiredOnce.value = true
}

// ============ PHONE FLOW ============
async function submitPhone() {
  if (!phoneIsValid.value || submitting.value) return
  submitting.value = true
  errorMsg.value = ''
  try {
    await magicPinRequest({ phone: fullPhoneE164NoPlus(), redirect_to: props.redirectTo })
    fireLead('Magic PIN Request')
    step.value = 'pin'
    startCooldown(30)
    pinDigits.value = ['', '', '', '', '', '']
    nextTick(() => pinRefs.value[0]?.focus())
    emit('sent', { channel: 'phone' })
  }
  catch (err: unknown) {
    const apiError = err as { data?: { message?: string } }
    errorMsg.value = apiError?.data?.message || (err instanceof Error ? err.message : 'Erro ao enviar código.')
  }
  finally {
    submitting.value = false
  }
}

async function resendPin() {
  if (!canResend.value) return
  errorMsg.value = ''
  submitting.value = true
  try {
    await magicPinResend({ phone: fullPhoneE164NoPlus(), redirect_to: props.redirectTo })
    startCooldown(30)
    pinDigits.value = ['', '', '', '', '', '']
    nextTick(() => pinRefs.value[0]?.focus())
  }
  catch (err: unknown) {
    const apiError = err as { data?: { message?: string } }
    errorMsg.value = apiError?.data?.message || 'Erro ao reenviar código.'
  }
  finally {
    submitting.value = false
  }
}

function onPinInput(event: Event, idx: number) {
  const input = event.target as HTMLInputElement
  const val = input.value.replace(/\D+/g, '').slice(-1)
  pinDigits.value[idx] = val
  if (val && idx < 5) pinRefs.value[idx + 1]?.focus()
  if (pinIsComplete.value) verifyPin()
}

function onPinKeydown(event: KeyboardEvent, idx: number) {
  if (event.key === 'Backspace' && !pinDigits.value[idx] && idx > 0) {
    pinRefs.value[idx - 1]?.focus()
    pinDigits.value[idx - 1] = ''
    event.preventDefault()
  }
  if (event.key === 'ArrowLeft' && idx > 0) { pinRefs.value[idx - 1]?.focus(); event.preventDefault() }
  if (event.key === 'ArrowRight' && idx < 5) { pinRefs.value[idx + 1]?.focus(); event.preventDefault() }
}

function onPinPaste(event: ClipboardEvent) {
  event.preventDefault()
  const pasted = event.clipboardData?.getData('text') ?? ''
  const digits = pasted.replace(/\D+/g, '').slice(0, 6).split('')
  for (let i = 0; i < 6; i++) pinDigits.value[i] = digits[i] ?? ''
  const lastIdx = Math.min(digits.length - 1, 5)
  if (lastIdx >= 0) pinRefs.value[lastIdx]?.focus()
  if (pinIsComplete.value) verifyPin()
}

async function verifyPin() {
  if (!pinIsComplete.value || submitting.value) return
  submitting.value = true
  errorMsg.value = ''
  try {
    const pin = pinDigits.value.join('')
    const resp = await magicPinVerify({ phone: fullPhoneE164NoPlus(), pin })
    if (!resp.token) throw new Error('Token nao recebido')
    authStore.addToken(resp.token)
    await authStore.fetchProfile()

    track('CompleteRegistration', {
      content_name: resp.is_new_user ? 'Landing RaioX Magic PIN Signup' : 'Landing RaioX Magic PIN Login',
      content_category: 'landing_conversion',
      content_ids: ['raio-x'],
      content_type: 'product',
      currency: 'BRL',
      value: 50,
    })

    emit('verified', {
      redirectTo: resp.redirect_to || props.redirectTo,
      isNewUser: !!resp.is_new_user,
      user: resp.user,
    })

    setTimeout(() => router.push(resp.redirect_to || props.redirectTo), 200)
  }
  catch (err: unknown) {
    const apiError = err as { data?: { message?: string } }
    errorMsg.value = apiError?.data?.message || (err instanceof Error ? err.message : 'Código inválido.')
    pinDigits.value = ['', '', '', '', '', '']
    nextTick(() => pinRefs.value[0]?.focus())
  }
  finally {
    submitting.value = false
  }
}

// ============ EMAIL FLOW (fallback) ============
async function submitEmail() {
  if (!emailIsValid.value || submitting.value) return
  submitting.value = true
  errorMsg.value = ''
  try {
    await magicLinkRequest({
      email: email.value.trim().toLowerCase(),
      redirect_to: props.redirectTo,
    })
    fireLead('Magic Link Request')
    step.value = 'sent'
    emit('sent', { channel: 'email' })
  }
  catch (err: unknown) {
    const apiError = err as { data?: { message?: string } }
    errorMsg.value = apiError?.data?.message || (err instanceof Error ? err.message : 'Erro ao enviar.')
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="raiox-auth">
    <!-- =========== PHONE INPUT (default channel) =========== -->
    <template v-if="channel === 'phone' && step === 'input'">
      <form class="lp-hero__form" novalidate @submit.prevent="submitPhone">
        <!-- Input composto: bandeira BR + +55 fixo (nao editavel) +
             campo do numero local. Visual mimica .lp-hero__input pra
             continuar igualzinho ao padrao da landing. -->
        <div
          class="raiox-auth__phone-group"
          :class="{ 'raiox-auth__phone-group--focused': phoneFocused }"
        >
          <span class="raiox-auth__phone-prefix" aria-hidden="true">
            <span class="raiox-auth__phone-flag">🇧🇷</span>
            <span class="raiox-auth__phone-cc">+55</span>
          </span>
          <input
            v-model="phoneMasked"
            type="tel"
            class="raiox-auth__phone-input"
            placeholder="(11) 9 9999-9999"
            autocomplete="tel-national"
            inputmode="tel"
            spellcheck="false"
            required
            @focus="phoneFocused = true"
            @blur="phoneFocused = false"
          >
        </div>
        <button type="submit" class="lp-hero__cta" :disabled="!phoneIsValid || submitting">
          <svg v-if="!submitting" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.4 1 2.8 1.2 3c.1.2 2 3.1 4.9 4.4.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4M12 21.7c-1.7 0-3.4-.5-4.9-1.3l-3.5.9.9-3.4C3.5 16 3 14.1 3 12.2 3 7.2 7.1 3.1 12 3.1S21 7.2 21 12.2 16.9 21.7 12 21.7M12 1c-6.1 0-11 4.9-11 11 0 1.9.5 3.7 1.4 5.4L1 23l5.7-1.4c1.6.9 3.4 1.4 5.3 1.4 6.1 0 11-4.9 11-11S18.1 1 12 1z"/>
          </svg>
          <span>{{ submitting ? 'Enviando…' : ctaText }}</span>
        </button>
      </form>
      <p v-if="errorMsg" class="raiox-auth__error" role="alert">{{ errorMsg }}</p>
      <button type="button" class="raiox-auth__toggle" @click="switchTo('email')">
        Prefere por email? <span>Clique aqui</span>
      </button>
    </template>

    <!-- =========== PIN INPUT (after phone submit) =========== -->
    <template v-else-if="channel === 'phone' && step === 'pin'">
      <div class="raiox-auth__pin-wrap">
        <p class="raiox-auth__pin-help">
          Código enviado pra <strong>{{ phoneMasked }}</strong>
        </p>
        <div class="raiox-auth__pin" @paste="onPinPaste">
          <input
            v-for="(_, idx) in pinDigits"
            :key="idx"
            :ref="(el) => { if (el) pinRefs[idx] = el as HTMLInputElement }"
            v-model="pinDigits[idx]"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="1"
            class="raiox-auth__pin-box"
            :aria-label="`Digito ${idx + 1} de 6`"
            @input="onPinInput($event, idx)"
            @keydown="onPinKeydown($event, idx)"
            @focus="(e) => (e.target as HTMLInputElement).select()"
          >
        </div>
        <p v-if="errorMsg" class="raiox-auth__error" role="alert">{{ errorMsg }}</p>
        <div class="raiox-auth__pin-actions">
          <button
            type="button"
            class="raiox-auth__pin-resend"
            :disabled="!canResend"
            @click="resendPin"
          >
            {{ canResend ? 'Reenviar código' : `Reenviar em ${resendCooldown}s` }}
          </button>
          <button
            type="button"
            class="raiox-auth__pin-back"
            @click="step = 'input'"
          >
            Usar outro telefone
          </button>
        </div>
      </div>
    </template>

    <!-- =========== EMAIL INPUT (fallback channel) =========== -->
    <template v-else-if="channel === 'email' && step === 'input'">
      <!-- Banner sutil quando o backend reportou WhatsApp off e ja
           caiu pra email automaticamente. Sem alarme, so contexto. -->
      <div v-if="!isWhatsAppAvailable" class="raiox-auth__degraded" role="status">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
        </svg>
        <span>WhatsApp temporariamente indisponível. Use email pra entrar.</span>
      </div>

      <form class="lp-hero__form" novalidate @submit.prevent="submitEmail">
        <input
          v-model="email"
          type="email"
          class="lp-hero__input"
          placeholder="Digite seu email"
          autocomplete="email"
          inputmode="email"
          spellcheck="false"
          autocapitalize="none"
          required
        >
        <button type="submit" class="lp-hero__cta" :disabled="!emailIsValid || submitting">
          <span>{{ submitting ? 'Enviando…' : ctaText }}</span>
          <svg v-if="!submitting" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14m-7-7l7 7l-7 7" />
          </svg>
        </button>
      </form>
      <p v-if="errorMsg" class="raiox-auth__error" role="alert">{{ errorMsg }}</p>
      <!-- "Voltar pra WhatsApp" so se ele estiver disponivel -->
      <button
        v-if="isWhatsAppAvailable"
        type="button"
        class="raiox-auth__toggle"
        @click="switchTo('phone')"
      >
        Prefere por WhatsApp? <span>Clique aqui</span>
      </button>
    </template>

    <!-- =========== EMAIL SENT (after submit) =========== -->
    <template v-else>
      <div class="raiox-auth__email-sent">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
        </svg>
        <strong>Verifique seu email</strong>
        <span>Mandamos um link mágico pra <em>{{ email }}</em>. Abre o email, clica e pronto.</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ============================================================
 * COPY DOS ESTILOS DO PARENT (raio-x.vue) — necessario porque
 * o <style scoped> do raio-x nao alcanca filhos componentes.
 * Antes do refactor, o form era inline na page e os estilos
 * pegavam. Agora que extraiu pra esse componente, replicamos
 * .lp-hero__form / .lp-hero__input / .lp-hero__cta aqui.
 * ============================================================ */
.lp-hero__form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
  width: 100%;
  max-width: 520px;
}
@media (min-width: 540px) {
  .lp-hero__form { flex-direction: row; }
}

.lp-hero__input {
  flex: 1;
  padding: 16px 20px;
  border-radius: 14px;
  border: 1.5px solid color-mix(in srgb, var(--brand-border) 75%, transparent);
  background: var(--brand-surface);
  color: var(--brand-text);
  font-family: var(--brand-font);
  font-size: 16px;
  letter-spacing: -0.005em;
  transition: border-color 200ms, box-shadow 200ms;
}
.lp-hero__input::placeholder {
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.lp-hero__input:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand-primary) 20%, transparent);
}

.lp-hero__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 28px;
  border-radius: 14px;
  border: 0;
  background: var(--brand-primary);
  color: #fff;
  font-family: var(--brand-font);
  font-size: 15.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  cursor: pointer;
  transition: transform 200ms, filter 200ms, box-shadow 200ms;
  box-shadow: 0 14px 32px -12px color-mix(in srgb, var(--brand-primary) 65%, transparent);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}
.lp-hero__cta:hover:not(:disabled) {
  filter: brightness(0.94);
  transform: translateY(-1px);
}
.lp-hero__cta:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.2);
}
.lp-hero__cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 30%, color-mix(in srgb, white 25%, transparent) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 700ms ease;
  pointer-events: none;
}
.lp-hero__cta:hover::before,
.lp-hero__cta:focus-visible::before {
  transform: translateX(100%);
}

/* ============ COMPONENT WRAPPER ============ */
.raiox-auth {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  align-items: stretch;
}

.raiox-auth__error {
  font-size: 12.5px;
  line-height: 1.4;
  color: var(--brand-negative, #dc2626);
  margin: 0;
}

/* Banner amber sutil quando WhatsApp esta off (auto-fallback). */
.raiox-auth__degraded {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.35;
  color: color-mix(in srgb, var(--brand-text, #111) 80%, transparent);
  background: color-mix(in srgb, #f59e0b 8%, transparent);
  border: 1px solid color-mix(in srgb, #f59e0b 28%, transparent);
}

.raiox-auth__degraded svg {
  color: #d97706;
  flex-shrink: 0;
}

/* ============ PHONE INPUT GROUP (BR flag + +55 fixo + numero local) ============
   Visual mimica .lp-hero__input (border-radius, padding, border) mas como
   um wrapper flex contendo prefix nao-editavel + input limpo. flex:1 garante
   que ocupa o mesmo espaco que o .lp-hero__input original.
*/
.raiox-auth__phone-group {
  flex: 1;
  display: flex;
  align-items: stretch;
  border-radius: 14px;
  border: 1.5px solid color-mix(in srgb, var(--brand-border) 75%, transparent);
  background: var(--brand-surface);
  overflow: hidden;
  transition: border-color 200ms, box-shadow 200ms;
  min-width: 0;
}

.raiox-auth__phone-group--focused {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand-primary) 20%, transparent);
}

.raiox-auth__phone-prefix {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  font-family: var(--brand-font);
  font-size: 16px;
  font-weight: 500;
  color: var(--brand-text);
  font-variant-numeric: tabular-nums;
  border-right: 1px solid color-mix(in srgb, var(--brand-border) 75%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  user-select: none;
  flex-shrink: 0;
  letter-spacing: -0.005em;
}

.raiox-auth__phone-flag {
  font-size: 20px;
  line-height: 1;
  font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
}

.raiox-auth__phone-cc {
  font-size: 15px;
}

.raiox-auth__phone-input {
  flex: 1;
  min-width: 0;
  padding: 16px 16px;
  border: 0;
  background: transparent;
  color: var(--brand-text);
  font-family: var(--brand-font);
  font-size: 16px;
  letter-spacing: -0.005em;
  outline: none;
}

.raiox-auth__phone-input::placeholder {
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.raiox-auth__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: transparent;
  border: 0;
  padding: 6px 8px;
  font-size: 12.5px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text, #111) 70%, transparent);
  cursor: pointer;
  transition: color 150ms;
}

.raiox-auth__toggle span {
  color: var(--brand-primary);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
}

.raiox-auth__toggle:hover span {
  text-decoration-color: var(--brand-primary);
}

/* ============ PIN STEP ============ */
.raiox-auth__pin-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
  padding: 16px 18px;
  border-radius: 14px;
  border: 1.5px solid color-mix(in srgb, var(--brand-primary) 18%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 4%, transparent);
}

.raiox-auth__pin-help {
  font-size: 13px;
  line-height: 1.4;
  color: color-mix(in srgb, var(--brand-text, #111) 75%, transparent);
  margin: 0;
  text-align: center;
}

.raiox-auth__pin-help strong {
  color: var(--brand-text, #111);
  font-weight: 600;
}

.raiox-auth__pin {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  width: 100%;
}

.raiox-auth__pin-box {
  width: 100%;
  aspect-ratio: 1 / 1;
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  border-radius: 10px;
  border: 1.5px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
  background: var(--brand-background, #fff);
  color: var(--brand-text, #111);
  font-family: var(--brand-font);
  transition: border-color 150ms, box-shadow 150ms, transform 100ms;
}

.raiox-auth__pin-box:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 22%, transparent);
  transform: scale(1.02);
}

.raiox-auth__pin-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.raiox-auth__pin-resend,
.raiox-auth__pin-back {
  background: transparent;
  border: 0;
  padding: 4px 8px;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: color 150ms, opacity 150ms;
}

.raiox-auth__pin-resend {
  color: var(--brand-primary);
  font-weight: 600;
}

.raiox-auth__pin-resend:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: color-mix(in srgb, var(--brand-text, #111) 50%, transparent);
  font-weight: 500;
}

.raiox-auth__pin-back {
  color: color-mix(in srgb, var(--brand-text, #111) 60%, transparent);
}

.raiox-auth__pin-back:hover {
  color: var(--brand-text, #111);
}

/* ============ EMAIL SENT ============ */
.raiox-auth__email-sent {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 18px 20px;
  border-radius: 14px;
  border: 1.5px solid color-mix(in srgb, var(--brand-primary) 22%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 6%, transparent);
  color: var(--brand-text, #111);
}

.raiox-auth__email-sent svg {
  color: var(--brand-primary);
}

.raiox-auth__email-sent strong {
  font-size: 15px;
  font-weight: 600;
}

.raiox-auth__email-sent span {
  font-size: 13px;
  line-height: 1.45;
  color: color-mix(in srgb, var(--brand-text, #111) 75%, transparent);
  max-width: 320px;
}

.raiox-auth__email-sent em {
  font-style: normal;
  color: var(--brand-text, #111);
  font-weight: 600;
}
</style>

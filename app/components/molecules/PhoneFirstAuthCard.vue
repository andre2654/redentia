<!--
  MoleculesPhoneFirstAuthCard — passwordless via WhatsApp PIN.

  Substitui AuthFormCard como CTA primario nos pontos de cadastro:
    - /raio-x (hero quiz / RaioXSimulationModal)
    - /auth/register
    - /auth/login

  FLOW:
    Step 1: input telefone + "Receber codigo no WhatsApp" → magic-pin/request
    Step 2: 6 boxes do PIN + "Reenviar em XXs" → magic-pin/verify
    Sucesso: addToken + fetchProfile + emit('verified', {...})

  FALLBACK:
    "Prefiro continuar por email" abaixo do botao primary → emit('switch-to-email')
    O parent (page) decide se renderiza o AuthFormCard inline ou navega.

  BACKEND:
    POST /auth/magic-pin/request  { phone, redirect_to }   → 200 anti-enum
    POST /auth/magic-pin/verify   { phone, pin }           → { token, user, redirect_to, is_new_user }
    POST /auth/magic-pin/resend   { phone, redirect_to }   → 200 anti-enum

  PHONE NORMALIZATION:
    Frontend envia o que o user digitou; backend normaliza pra E.164 (sem +).
    Mascara visual: +55 (##) # ####-#### — guia mas nao bloqueia.
-->
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** Destino do redirect apos verify (passado pro backend pra anti-replay logico). */
    redirectTo?: string
    /** content_category usado nos pixel events. */
    pixelContext?: string
    /** Mostra o link "Prefiro continuar por email" abaixo. */
    showEmailFallback?: boolean
    /** Texto do CTA primary. Default "Receber codigo no WhatsApp". */
    primaryCta?: string
    /** Subtitulo abaixo do titulo. Override default. */
    subtitle?: string
  }>(),
  {
    redirectTo: '/',
    pixelContext: 'auth_phone_first',
    showEmailFallback: true,
    primaryCta: 'Receber código no WhatsApp',
    subtitle: '',
  },
)

const emit = defineEmits<{
  /** PIN sent successfully. */
  pinSent: [{ phone: string }]
  /** PIN verificado. Parent decide se navega/fecha modal/etc. */
  verified: [{ token: string; user: AuthUser; redirectTo: string; isNewUser: boolean }]
  /** User clicou "Prefiro continuar por email". */
  switchToEmail: []
  error: [string]
}>()

interface AuthUser {
  id: number | string
  name: string | null
  email: string | null
  celular: string | null
  role: string
  tenant_id?: number | null
}

const { magicPinRequest, magicPinVerify, magicPinResend } = useAuthService()
const { track } = useMetaPixel()
const authStore = useAuthStore()

// ============ STATE ============
const currentStep = ref<1 | 2>(1)
const phoneRaw = ref('')
const phoneFocused = ref(false)
const pinDigits = ref<string[]>(['', '', '', '', '', ''])
const submitting = ref(false)
const formError = ref('')

// Refs pros 6 inputs do PIN, pra auto-focus
const pinRefs = ref<HTMLInputElement[]>([])

// Cooldown do resend PIN (30s)
const resendCooldown = ref(0)
let cooldownInterval: ReturnType<typeof setInterval> | null = null

// ============ PHONE MASK ============
/**
 * Mascara local BR sem o country code: (##) # ####-####
 * O +55 e o flag BR ficam FORA do input como prefix visual fixo
 * (nao editavel), entao a mascara aqui so trata os 10/11 digitos
 * locais (DDD + numero). phoneRaw guarda apenas digitos LOCAIS;
 * na hora de enviar pro backend, prefixamos "55" automaticamente.
 *
 * Exemplos:
 *   user digita "11999999999" → mostra "(11) 9 9999-9999"
 *   user digita "1133334444"   → mostra "(11) 3333-4444" (fixo, sem 9)
 */
function maskLocalPhone(raw: string): string {
  const digits = raw.replace(/\D+/g, '').slice(0, 11)

  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`

  const ddd = digits.slice(0, 2)

  // Mobile (11 digits): (DD) 9 NNNN-NNNN
  if (digits.length === 11) {
    return `(${ddd}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  // Mobile partial typing (>= 8 digitos pos DDD)
  if (digits.length > 7) {
    return `(${ddd}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  // 3 a 7 digitos: ainda nao da pra saber se e mobile ou fixo, mostra cru
  // pos-DDD com hifen no formato fixo (NNNN-NNNN)
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
  set: (val: string) => {
    // Sempre guarda apenas digitos locais (sem o 55)
    phoneRaw.value = val.replace(/\D+/g, '').slice(0, 11)
  },
})

const phoneIsValid = computed(() => {
  const digits = phoneRaw.value.replace(/\D+/g, '')
  // Local BR: 10 (fixo: DD + 8) ou 11 (mobile: DD + 9 + 8)
  return digits.length === 10 || digits.length === 11
})

/**
 * Telefone completo pra enviar ao backend: 55 + digitos locais.
 * Backend re-normaliza, mas mandamos pronto.
 */
function fullPhoneE164NoPlus(): string {
  return '55' + phoneRaw.value.replace(/\D+/g, '')
}

const pinIsComplete = computed(() => {
  return pinDigits.value.every(d => /^\d$/.test(d))
})

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

// ============ PIXEL ============
function firePixelLead(via: string) {
  track('Lead', {
    content_name: `${props.pixelContext} ${via}`,
    content_category: props.pixelContext,
    currency: 'BRL',
    value: 5,
  })
}

// ============ STEP 1: REQUEST PIN ============
async function requestPin() {
  if (!phoneIsValid.value || submitting.value) return
  submitting.value = true
  formError.value = ''

  try {
    await magicPinRequest({
      phone: fullPhoneE164NoPlus(),
      redirect_to: props.redirectTo,
    })

    firePixelLead('Magic PIN Request')

    currentStep.value = 2
    startCooldown(30)
    emit('pinSent', { phone: fullPhoneE164NoPlus() })

    // Limpa PIN e auto-foca o primeiro digit
    pinDigits.value = ['', '', '', '', '', '']
    nextTick(() => {
      pinRefs.value[0]?.focus()
    })
  }
  catch (err: unknown) {
    const apiError = err as { data?: { message?: string; errors?: Record<string, string[]> } }
    const msg
      = apiError?.data?.message
      || (apiError?.data?.errors && Object.values(apiError.data.errors).flat()[0])
      || (err instanceof Error ? err.message : 'Erro ao enviar código. Tente novamente.')
    formError.value = String(msg)
    emit('error', String(msg))
  }
  finally {
    submitting.value = false
  }
}

async function resendPin() {
  if (!canResend.value) return
  formError.value = ''
  submitting.value = true
  try {
    await magicPinResend({
      phone: fullPhoneE164NoPlus(),
      redirect_to: props.redirectTo,
    })
    startCooldown(30)
    pinDigits.value = ['', '', '', '', '', '']
    nextTick(() => pinRefs.value[0]?.focus())
  }
  catch (err: unknown) {
    const apiError = err as { data?: { message?: string } }
    const msg = apiError?.data?.message || 'Erro ao reenviar código.'
    formError.value = String(msg)
  }
  finally {
    submitting.value = false
  }
}

// ============ STEP 2: PIN INPUT ============
function onPinInput(event: Event, idx: number) {
  const input = event.target as HTMLInputElement
  const val = input.value.replace(/\D+/g, '').slice(-1) // so 1 digit
  pinDigits.value[idx] = val

  if (val && idx < 5) {
    pinRefs.value[idx + 1]?.focus()
  }

  // Auto-submit quando completar os 6
  if (pinIsComplete.value) {
    verifyPin()
  }
}

function onPinKeydown(event: KeyboardEvent, idx: number) {
  if (event.key === 'Backspace' && !pinDigits.value[idx] && idx > 0) {
    pinRefs.value[idx - 1]?.focus()
    pinDigits.value[idx - 1] = ''
    event.preventDefault()
  }
  if (event.key === 'ArrowLeft' && idx > 0) {
    pinRefs.value[idx - 1]?.focus()
    event.preventDefault()
  }
  if (event.key === 'ArrowRight' && idx < 5) {
    pinRefs.value[idx + 1]?.focus()
    event.preventDefault()
  }
}

function onPinPaste(event: ClipboardEvent) {
  event.preventDefault()
  const pasted = event.clipboardData?.getData('text') ?? ''
  const digits = pasted.replace(/\D+/g, '').slice(0, 6).split('')
  for (let i = 0; i < 6; i++) {
    pinDigits.value[i] = digits[i] ?? ''
  }
  // Foca o ultimo preenchido (ou o ultimo do array)
  const lastIdx = Math.min(digits.length - 1, 5)
  if (lastIdx >= 0) pinRefs.value[lastIdx]?.focus()

  if (pinIsComplete.value) verifyPin()
}

async function verifyPin() {
  if (!pinIsComplete.value || submitting.value) return
  submitting.value = true
  formError.value = ''

  try {
    const pin = pinDigits.value.join('')
    const resp = await magicPinVerify({
      phone: fullPhoneE164NoPlus(),
      pin,
    })

    if (!resp.token) {
      throw new Error('Token nao recebido. Tente novamente.')
    }

    // Salva token e perfil. Parent decide o que fazer (navegar/fechar modal/etc).
    authStore.addToken(resp.token)
    await authStore.fetchProfile()

    firePixelLead(resp.is_new_user ? 'Magic PIN Signup' : 'Magic PIN Login')

    emit('verified', {
      token: resp.token,
      user: resp.user,
      redirectTo: resp.redirect_to || props.redirectTo,
      isNewUser: !!resp.is_new_user,
    })
  }
  catch (err: unknown) {
    const apiError = err as { data?: { message?: string } }
    const msg = apiError?.data?.message || (err instanceof Error ? err.message : 'Código inválido.')
    formError.value = String(msg)
    emit('error', String(msg))

    // Limpa o PIN e re-foca pra user tentar de novo
    pinDigits.value = ['', '', '', '', '', '']
    nextTick(() => pinRefs.value[0]?.focus())
  }
  finally {
    submitting.value = false
  }
}

function backToStep1() {
  currentStep.value = 1
  formError.value = ''
  pinDigits.value = ['', '', '', '', '', '']
}
</script>

<template>
  <div class="phone-auth">
    <!-- ============ STEP 1: telefone ============ -->
    <div v-if="currentStep === 1" class="phone-auth__step">
      <div class="phone-auth__header">
        <div class="phone-auth__logo" aria-hidden="true">
          <UIcon name="i-lucide-message-circle" class="size-7" :style="{ color: 'var(--brand-primary)' }" />
        </div>
        <h2 class="phone-auth__title">
          Qual seu Whatsapp?
        </h2>
        <p class="phone-auth__subtitle">
          {{ subtitle || 'Inicie o seu cadastro ou acesse sua conta.' }}
        </p>
      </div>

      <form class="phone-auth__fields" novalidate @submit.prevent="requestPin">
        <div class="phone-auth__field">
          <label class="phone-auth__label" for="phone-auth-phone">
            <UIcon name="i-lucide-phone" class="size-3.5 inline-block" aria-hidden="true" />
            Telefone (com DDD)
          </label>
          <!-- Input composto: prefix fixo (bandeira BR + +55) | input local
               so digita DDD + numero. O prefix nao e parte do v-model;
               phoneRaw guarda apenas digitos locais e fullPhoneE164NoPlus()
               adiciona o "55" na hora de mandar pra API. -->
          <div class="phone-auth__input-group" :class="{ 'phone-auth__input-group--focused': phoneFocused }">
            <span class="phone-auth__input-prefix" aria-hidden="true">
              <span class="phone-auth__flag">🇧🇷</span>
              <span class="phone-auth__cc">+55</span>
            </span>
            <input
              id="phone-auth-phone"
              v-model="phoneMasked"
              type="tel"
              class="phone-auth__input phone-auth__input--lg phone-auth__input--bare"
              placeholder="(11) 9 9999-9999"
              autocomplete="tel-national"
              inputmode="tel"
              spellcheck="false"
              required
              autofocus
              @focus="phoneFocused = true"
              @blur="phoneFocused = false"
            >
          </div>
        </div>

        <p v-if="formError" class="phone-auth__error" role="alert">
          {{ formError }}
        </p>

        <button
          type="submit"
          class="phone-auth__submit phone-auth__submit--lg"
          :disabled="!phoneIsValid || submitting"
        >
          <UIcon
            v-if="submitting"
            name="i-lucide-loader-2"
            class="size-4 motion-safe:animate-spin"
            aria-hidden="true"
          />
          <UIcon
            v-else
            name="i-lucide-message-circle"
            class="size-4"
            aria-hidden="true"
          />
          <span>{{ submitting ? 'Enviando…' : primaryCta }}</span>
        </button>
      </form>

      <!-- Email fallback -->
      <div v-if="showEmailFallback" class="phone-auth__fallback">
        <button type="button" class="phone-auth__fallback-btn" @click="emit('switchToEmail')">
          <UIcon name="i-lucide-mail" class="size-3.5" aria-hidden="true" />
          <span>Prefiro continuar por email</span>
        </button>
      </div>
    </div>

    <!-- ============ STEP 2: PIN ============ -->
    <div v-else class="phone-auth__step">
      <div class="phone-auth__header">
        <div class="phone-auth__logo" aria-hidden="true">
          <UIcon name="i-lucide-shield-check" class="size-7" :style="{ color: 'var(--brand-primary)' }" />
        </div>
        <h2 class="phone-auth__title">
          Digite o código
        </h2>
        <p class="phone-auth__subtitle">
          Mandamos um código de 6 dígitos pro seu WhatsApp
          <strong>{{ phoneMasked }}</strong>.
        </p>
      </div>

      <div class="phone-auth__pin" @paste="onPinPaste">
        <input
          v-for="(_, idx) in pinDigits"
          :key="idx"
          :ref="(el) => { if (el) pinRefs[idx] = el as HTMLInputElement }"
          v-model="pinDigits[idx]"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="1"
          class="phone-auth__pin-box"
          :aria-label="`Digito ${idx + 1} de 6`"
          @input="onPinInput($event, idx)"
          @keydown="onPinKeydown($event, idx)"
          @focus="(e) => (e.target as HTMLInputElement).select()"
        >
      </div>

      <p v-if="formError" class="phone-auth__error" role="alert">
        {{ formError }}
      </p>

      <button
        type="button"
        class="phone-auth__submit"
        :disabled="!pinIsComplete || submitting"
        @click="verifyPin"
      >
        <UIcon
          v-if="submitting"
          name="i-lucide-loader-2"
          class="size-4 motion-safe:animate-spin"
          aria-hidden="true"
        />
        <UIcon
          v-else
          name="i-lucide-check"
          class="size-4"
          aria-hidden="true"
        />
        <span>{{ submitting ? 'Verificando…' : 'Confirmar' }}</span>
      </button>

      <button
        type="button"
        class="phone-auth__resend"
        :disabled="!canResend"
        @click="resendPin"
      >
        <UIcon name="i-lucide-rotate-cw" class="size-3.5" aria-hidden="true" />
        <span>
          {{ canResend ? 'Reenviar código' : `Reenviar em ${resendCooldown}s` }}
        </span>
      </button>

      <button
        type="button"
        class="phone-auth__back-inline"
        @click="backToStep1"
      >
        <UIcon name="i-lucide-arrow-left" class="size-3.5" aria-hidden="true" />
        <span>Usar outro telefone</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.phone-auth {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

.phone-auth__step {
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: relative;
}

/* ============ HEADER ============ */
.phone-auth__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
}

.phone-auth__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  margin-bottom: 8px;
}

.phone-auth__title {
  font-family: var(--brand-font);
  font-size: 26px;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--text-heading);
  margin: 0;
}

@media (min-width: 768px) {
  .phone-auth__title { font-size: 28px; }
}

.phone-auth__subtitle {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-muted);
  margin: 0;
  max-width: 340px;
}

.phone-auth__subtitle strong {
  color: var(--text-heading);
  font-weight: 600;
}

/* ============ FIELDS ============ */
.phone-auth__fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.phone-auth__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.phone-auth__label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.phone-auth__input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1.5px solid var(--border-subtle);
  background: var(--bg-base);
  color: var(--text-heading);
  font-family: var(--brand-font);
  font-size: 16px;
  letter-spacing: -0.005em;
  transition: border-color 150ms, box-shadow 150ms;
}

.phone-auth__input--lg {
  padding: 16px 18px;
  border-radius: 14px;
  font-size: 17px;
  letter-spacing: 0;
  font-variant-numeric: tabular-nums;
}

.phone-auth__input::placeholder {
  color: var(--text-muted);
  opacity: 0.5;
}

.phone-auth__input:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

/* ============ INPUT GROUP (BR flag + +55 fixo + numero) ============ */
.phone-auth__input-group {
  display: flex;
  align-items: stretch;
  width: 100%;
  border-radius: 14px;
  border: 1.5px solid var(--border-subtle);
  background: var(--bg-base);
  overflow: hidden;
  transition: border-color 150ms, box-shadow 150ms;
}

.phone-auth__input-group--focused {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

.phone-auth__input-prefix {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  font-size: 17px;
  font-weight: 500;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
  border-right: 1px solid var(--border-subtle);
  background: color-mix(in srgb, var(--bg-base) 50%, var(--bg-elevated, var(--bg-base)));
  user-select: none;
  flex-shrink: 0;
}

.phone-auth__flag {
  font-size: 20px;
  line-height: 1;
  /* Garante a renderizacao da bandeira em sistemas que suportam emoji
     coloridos. iOS/macOS/Android renderizam nativamente; Windows pode
     mostrar BR como letras dependendo da fonte. */
  font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
}

.phone-auth__cc {
  font-size: 16px;
  letter-spacing: -0.005em;
}

.phone-auth__input--bare {
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  flex: 1;
  min-width: 0;
}

.phone-auth__input--bare:focus {
  outline: none;
  border: 0 !important;
  box-shadow: none !important;
}

/* ============ PIN BOXES ============ */
.phone-auth__pin {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  width: 100%;
}

.phone-auth__pin-box {
  width: 100%;
  aspect-ratio: 1 / 1;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  border-radius: 12px;
  border: 1.5px solid var(--border-subtle);
  background: var(--bg-base);
  color: var(--text-heading);
  font-family: var(--brand-font);
  transition: border-color 150ms, box-shadow 150ms, transform 100ms;
}

.phone-auth__pin-box:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 22%, transparent);
  transform: scale(1.02);
}

@media (min-width: 480px) {
  .phone-auth__pin {
    gap: 10px;
  }
  .phone-auth__pin-box {
    font-size: 28px;
  }
}

/* ============ ERROR ============ */
.phone-auth__error {
  font-size: 13px;
  line-height: 1.4;
  color: var(--brand-negative, #dc2626);
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-negative, #dc2626) 25%, transparent);
  padding: 10px 12px;
  border-radius: 10px;
  margin: 0;
}

/* ============ SUBMIT ============ */
.phone-auth__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px 22px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: 0;
  font-family: var(--brand-font);
  background: var(--brand-primary);
  color: #fff;
  transition: filter 180ms, transform 120ms, box-shadow 180ms, opacity 180ms;
  box-shadow: 0 8px 22px -10px color-mix(in srgb, var(--brand-primary) 55%, transparent);
  margin-top: 4px;
}

.phone-auth__submit--lg {
  padding: 16px 22px;
  font-size: 15px;
  border-radius: 14px;
}

.phone-auth__submit:hover:not(:disabled) {
  filter: brightness(0.94);
  transform: translateY(-1px);
}

.phone-auth__submit:active:not(:disabled) {
  transform: translateY(0);
}

.phone-auth__submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: grayscale(0.3);
  box-shadow: none;
}

/* ============ HINTS ============ */
.phone-auth__hint {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 11.5px;
  line-height: 1.4;
  color: var(--text-muted);
  margin: 0;
  text-align: center;
  justify-content: center;
}

/* ============ FALLBACK (continuar por email) ============ */
.phone-auth__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
  position: relative;
}

.phone-auth__fallback::before,
.phone-auth__fallback::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-subtle);
}

.phone-auth__fallback-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 500;
  font-family: var(--brand-font);
  color: var(--text-body);
  cursor: pointer;
  transition: border-color 150ms, color 150ms, background 150ms;
  margin: 0 12px;
}

.phone-auth__fallback-btn:hover {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
  background: color-mix(in srgb, var(--brand-primary) 5%, transparent);
}

/* ============ RESEND ============ */
.phone-auth__resend {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  border: 1px solid var(--border-subtle);
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  font-family: var(--brand-font);
  color: var(--text-body);
  cursor: pointer;
  transition: border-color 150ms, color 150ms, opacity 150ms;
}

.phone-auth__resend:hover:not(:disabled) {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}

.phone-auth__resend:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============ BACK INLINE ============ */
.phone-auth__back-inline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  border: 0;
  padding: 8px;
  font-size: 12px;
  font-weight: 500;
  font-family: var(--brand-font);
  color: var(--text-muted);
  cursor: pointer;
  transition: color 150ms;
}

.phone-auth__back-inline:hover {
  color: var(--text-heading);
}
</style>

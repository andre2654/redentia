<!--
  MoleculesAuthFormCard — email PIN passwordless auth.

  USADO EM:
    - MoleculesRaioXSimulationModal (hard gate /raio-x)
    - /auth/register (variant default)
    - /auth/login (variant default)

  FLOW:
    Step 1: input email + "Continuar"
    Step 2: input PIN 6 digitos + "Confirmar" (com reenviar 30s cooldown)

  BACKEND:
    POST /auth/magic-link/request { email, redirect_to } → envia PIN no email
    POST /auth/magic-link/verify  { email, pin }         → valida + cria/login
    POST /auth/magic-link/resend  { email, redirect_to } → reenvia PIN

  Migration historico (2026-05-13): trocamos link clicavel por PIN. Link
  tinha deliverability ruim — users pediam, recebiam, mas nao clicavam.
  PIN = mesmo UX do WhatsApp.

  REDIRECT TO:
    - /auth/register page → "/" (home)
    - /raio-x gate → "/wallet?onboarding=true"
    - /auth/login page → "/" (home)

  ONBOARDING:
    Se user.name vazio apos verify, MoleculesOnboardingNameModal aparece
    no destino pra pedir o nome (nao bloqueia, soft gate).

  GOOGLE OAUTH:
    Mantido como caminho secundario.
-->
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** Modo inicial (so afeta copy do header). Toggle no step 1 muda. */
    mode?: 'register' | 'login'
    /** Destino apos verify do PIN. Default "/". */
    redirectTo?: string
    /** content_category usado nos pixel events. */
    pixelContext?: string
    /** Mostra divider "ou" + Google. Default true. */
    showGoogle?: boolean
  }>(),
  {
    mode: 'register',
    redirectTo: '/',
    pixelContext: 'auth_page',
    showGoogle: true,
  },
)

const emit = defineEmits<{
  /** Disparado quando o PIN e enviado com sucesso. */
  linkSent: [{ email: string }]
  /** Disparado quando verify completa (PIN OK ou Google). */
  success: [{ mode: 'register' | 'login' }]
  error: [string]
}>()

const { magicLinkRequest, magicLinkVerify, magicLinkResend } = useAuthService()
const { track } = useMetaPixel()
const router = useRouter()
const authStore = useAuthStore()

// ============ STATE ============
const formMode = ref<'register' | 'login'>(props.mode)
const currentStep = ref<1 | 2>(1)
const email = ref('')
const submitting = ref(false)
const formError = ref('')

// PIN state — 6 boxes individuais (mesmo padrao do WhatsApp/MagicPin).
const pinDigits = ref<string[]>(['', '', '', '', '', ''])
const pinRefs = ref<HTMLInputElement[]>([])

// Cooldown de reenvio (30s) pra evitar spam acidental
const resendCooldown = ref(0)
let cooldownInterval: ReturnType<typeof setInterval> | null = null

const canAdvance = computed(() => {
  return email.value.trim().includes('@') && email.value.trim().length > 4
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

function switchMode(next: 'register' | 'login') {
  formMode.value = next
  formError.value = ''
}

// ============ PIXEL ============
function firePixelLead(via: string) {
  track('Lead', {
    content_name: `${props.pixelContext} ${via}`,
    content_category: props.pixelContext,
    currency: 'BRL',
    value: 5,
  })
}

// ============ MAGIC LINK REQUEST (envia PIN) ============
async function requestPin() {
  if (!canAdvance.value || submitting.value) return
  submitting.value = true
  formError.value = ''

  try {
    await magicLinkRequest({
      email: email.value.trim().toLowerCase(),
      redirect_to: props.redirectTo,
    })

    // Lead disparado quando o PIN foi enviado (intent forte: pessoa
    // colocou email valido). CompleteRegistration so dispara apos verify.
    firePixelLead('Email PIN Request')

    currentStep.value = 2
    startCooldown(30)
    pinDigits.value = ['', '', '', '', '', '']
    nextTick(() => pinRefs.value[0]?.focus())
    emit('linkSent', { email: email.value.trim().toLowerCase() })
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
    await magicLinkResend({
      email: email.value.trim().toLowerCase(),
      redirect_to: props.redirectTo,
    })
    startCooldown(30)
    pinDigits.value = ['', '', '', '', '', '']
    nextTick(() => pinRefs.value[0]?.focus())
  }
  catch (err: unknown) {
    const apiError = err as { data?: { message?: string } }
    formError.value = apiError?.data?.message || 'Erro ao reenviar código.'
  }
  finally {
    submitting.value = false
  }
}

// ============ PIN INPUT HANDLERS ============
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

// ============ VERIFY ============
async function verifyPin() {
  if (!pinIsComplete.value || submitting.value) return
  submitting.value = true
  formError.value = ''

  try {
    const cleanedEmail = email.value.trim().toLowerCase()
    const pin = pinDigits.value.join('')
    const resp = await magicLinkVerify({ email: cleanedEmail, pin })

    if (!resp.access_token) {
      throw new Error('Token nao recebido')
    }

    authStore.addToken(resp.access_token)
    await authStore.fetchProfile()

    // Padronizado com content_ids matching da source page (raio-x ou
    // outro flow). Permite Meta atribuir CR ao funnel correto.
    const sourcePath = props.redirectTo?.includes('from=raiox')
      ? 'raio-x'
      : (props.redirectTo?.includes('from=comece') ? 'raio-x' : 'auth')
    track('CompleteRegistration', {
      content_name: resp.is_new_user ? 'Email PIN First Login' : 'Email PIN Returning User',
      content_category: 'magic_link_verify',
      content_ids: [sourcePath],
      content_type: 'product',
      status: true,
      currency: 'BRL',
      value: resp.is_new_user ? 20 : 0,
    })

    emit('success', { mode: formMode.value })

    // Resolve destino:
    //   1. resp.redirect_to (vindo do backend, salvo no token)
    //   2. fallback props.redirectTo
    let dest = resp.redirect_to || props.redirectTo

    // Se eh primeiro login E user.name esta vazio, adiciona ?onboarding=true
    // pra layout/page no destino abrir o modal de "Como podemos te chamar?".
    if (resp.is_new_user || !authStore.me?.name?.trim()) {
      const sep = dest.includes('?') ? '&' : '?'
      dest = `${dest}${sep}onboarding=true`
    }

    setTimeout(() => router.push(dest), 200)
  }
  catch (err: unknown) {
    const apiError = err as { data?: { message?: string } }
    formError.value
      = apiError?.data?.message
      || (err instanceof Error ? err.message : 'Código inválido. Tente novamente.')
    pinDigits.value = ['', '', '', '', '', '']
    nextTick(() => pinRefs.value[0]?.focus())
    emit('error', formError.value)
  }
  finally {
    submitting.value = false
  }
}

function backToStep1() {
  currentStep.value = 1
  formError.value = ''
  pinDigits.value = ['', '', '', '', '', '']
  // Mantem o email pra pessoa nao ter que digitar de novo
}

// Google success — flow direto, sem PIN.
function onGoogleSuccess() {
  firePixelLead('Google')
  emit('success', { mode: formMode.value })
}
</script>

<template>
  <div class="auth-form">
    <!-- ============ STEP 1: input email ============ -->
    <div v-if="currentStep === 1" class="auth-form__step">
      <div class="auth-form__header">
        <div class="auth-form__logo" aria-hidden="true">
          <UIcon name="i-lucide-radar" class="size-7" :style="{ color: 'var(--brand-primary)' }" />
        </div>
        <h2 class="auth-form__title">
          {{ formMode === 'register' ? 'Qual seu e-mail?' : 'Bem-vindo de volta' }}
        </h2>
        <p class="auth-form__subtitle">
          {{
            formMode === 'register'
              ? 'Inicie seu cadastro ou acesse sua conta.'
              : 'Entre com seu e-mail pra acessar.'
          }}
        </p>
      </div>

      <form class="auth-form__fields" novalidate @submit.prevent="requestPin">
        <div class="auth-form__field">
          <input
            id="auth-form-email"
            v-model="email"
            type="email"
            class="auth-form__input auth-form__input--lg"
            placeholder="voce@exemplo.com"
            autocomplete="email"
            inputmode="email"
            spellcheck="false"
            autocapitalize="none"
            required
            autofocus
          >
        </div>

        <p v-if="formError" class="auth-form__error" role="alert">
          {{ formError }}
        </p>

        <button
          type="submit"
          class="auth-form__submit auth-form__submit--lg"
          :disabled="!canAdvance || submitting"
        >
          <UIcon
            v-if="submitting"
            name="i-lucide-loader-2"
            class="size-4 motion-safe:animate-spin"
            aria-hidden="true"
          />
          <span>{{ submitting ? 'Enviando…' : 'Começar' }}</span>
          <UIcon v-if="!submitting" name="i-lucide-arrow-right" class="size-4" aria-hidden="true" />
        </button>

        <p class="auth-form__toggle">
          <template v-if="formMode === 'register'">
            Já tem conta?
            <button type="button" class="auth-form__toggle-link" @click="switchMode('login')">
              Entrar
            </button>
          </template>
          <template v-else>
            Ainda não tem conta?
            <button type="button" class="auth-form__toggle-link" @click="switchMode('register')">
              Criar conta gratuita
            </button>
          </template>
        </p>
      </form>

      <div v-if="showGoogle" class="auth-form__google">
        <MoleculesGoogleAuthBlock
          :mode="formMode === 'register' ? 'signup' : 'signin'"
          divider-label="ou"
          :redirect-to="redirectTo"
          @success="onGoogleSuccess"
        />
      </div>
    </div>

    <!-- ============ STEP 2: input PIN do email ============ -->
    <div v-else class="auth-form__step">
      <div class="auth-form__header">
        <div class="auth-form__icon-success" aria-hidden="true">
          <UIcon name="i-lucide-mail-check" class="size-8" :style="{ color: 'var(--brand-primary)' }" />
        </div>
        <h2 class="auth-form__title">
          Digite o código do email
        </h2>
        <p class="auth-form__subtitle">
          Mandamos um código de 6 dígitos pra <strong>{{ email }}</strong>.
        </p>
      </div>

      <div class="auth-form__pin" @paste="onPinPaste">
        <input
          v-for="(_, idx) in pinDigits"
          :key="idx"
          :ref="(el) => { if (el) pinRefs[idx] = el as HTMLInputElement }"
          v-model="pinDigits[idx]"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="1"
          class="auth-form__pin-box"
          :aria-label="`Dígito ${idx + 1} de 6`"
          :disabled="submitting"
          @input="onPinInput($event, idx)"
          @keydown="onPinKeydown($event, idx)"
          @focus="(e) => (e.target as HTMLInputElement).select()"
        >
      </div>

      <p v-if="formError" class="auth-form__error" role="alert">
        {{ formError }}
      </p>

      <button
        type="button"
        class="auth-form__submit auth-form__submit--lg"
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

      <div class="auth-form__pin-actions">
        <button
          type="button"
          class="auth-form__link"
          :disabled="!canResend"
          @click="resendPin"
        >
          {{ canResend ? 'Reenviar código' : `Reenviar em ${resendCooldown}s` }}
        </button>
        <button
          type="button"
          class="auth-form__back-inline"
          @click="backToStep1"
        >
          <UIcon name="i-lucide-arrow-left" class="size-3.5" aria-hidden="true" />
          <span>Usar outro e-mail</span>
        </button>
      </div>

      <p class="auth-form__hint auth-form__hint--center">
        <UIcon name="i-lucide-search" class="size-3.5 inline-block" aria-hidden="true" />
        Não chegou? Verifique a pasta de spam. O código está no assunto do email também.
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

.auth-form__step {
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: relative;
}

/* ============ HEADER ============ */
.auth-form__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
}

.auth-form__logo,
.auth-form__icon-success {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  margin-bottom: 8px;
}

.auth-form__title {
  font-family: var(--brand-font);
  font-size: 26px;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--text-heading);
  margin: 0;
}

@media (min-width: 768px) {
  .auth-form__title { font-size: 28px; }
}

.auth-form__subtitle {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-muted);
  margin: 0;
  max-width: 340px;
}

.auth-form__subtitle strong {
  color: var(--text-heading);
  font-weight: 600;
}

/* ============ FIELDS ============ */
.auth-form__fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.auth-form__input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1.5px solid var(--border-subtle);
  background: var(--bg-base);
  color: var(--text-heading);
  font-family: var(--brand-font);
  /* font-size 16px previne auto-zoom no Safari iOS */
  font-size: 16px;
  letter-spacing: -0.005em;
  transition: border-color 150ms, box-shadow 150ms;
}

.auth-form__input--lg {
  padding: 16px 18px;
  border-radius: 14px;
}

.auth-form__input::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.auth-form__input:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

/* ============ PIN BOXES ============ */
.auth-form__pin {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  width: 100%;
}

.auth-form__pin-box {
  width: 100%;
  aspect-ratio: 1 / 1;
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  border-radius: 10px;
  border: 1.5px solid var(--border-subtle);
  background: var(--bg-base);
  color: var(--text-heading);
  font-family: var(--brand-font);
  transition: border-color 150ms, box-shadow 150ms, transform 100ms;
  outline: none;
}

.auth-form__pin-box:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 22%, transparent);
  transform: scale(1.02);
}

.auth-form__pin-box:disabled {
  opacity: 0.6;
}

/* ============ ERROR ============ */
.auth-form__error {
  font-size: 13px;
  line-height: 1.4;
  color: var(--brand-negative, #dc2626);
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-negative, #dc2626) 25%, transparent);
  padding: 10px 12px;
  border-radius: 10px;
  margin: 0;
  text-align: center;
}

/* ============ SUBMIT ============ */
.auth-form__submit {
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

.auth-form__submit--lg {
  padding: 16px 22px;
  font-size: 15px;
  border-radius: 14px;
}

.auth-form__submit:hover:not(:disabled) {
  filter: brightness(0.94);
  transform: translateY(-1px);
}

.auth-form__submit:active:not(:disabled) {
  transform: translateY(0);
}

.auth-form__submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: grayscale(0.3);
  box-shadow: none;
}

/* ============ TOGGLE register/login ============ */
.auth-form__toggle {
  margin: 8px 0 0;
  font-size: 13px;
  text-align: center;
  color: var(--text-body);
}

.auth-form__toggle-link {
  background: none;
  border: 0;
  cursor: pointer;
  padding: 0;
  font: inherit;
  color: var(--brand-primary);
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
  text-underline-offset: 3px;
  transition: text-decoration-color 150ms;
}

.auth-form__toggle-link:hover {
  text-decoration-color: var(--brand-primary);
}

/* ============ GOOGLE BLOCK ============ */
.auth-form__google {
  margin-top: 4px;
}

/* ============ PIN ACTIONS (resend + back) ============ */
.auth-form__pin-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.auth-form__link {
  background: transparent;
  border: 0;
  padding: 4px 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--brand-primary);
  cursor: pointer;
  font-family: var(--brand-font);
  transition: color 150ms, opacity 150ms;
}

.auth-form__link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--text-muted);
}

.auth-form__hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.auth-form__hint--center {
  justify-content: center;
  text-align: center;
}

.auth-form__back-inline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 8px;
  font-family: var(--brand-font);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  transition: color 150ms;
  align-self: center;
}

.auth-form__back-inline:hover {
  color: var(--text-heading);
}
</style>

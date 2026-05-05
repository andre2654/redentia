<!--
  MoleculesAuthFormCard — magic link passwordless auth.

  USADO EM:
    - MoleculesRaioXSimulationModal (hard gate /raio-x)
    - /auth/register (variant default)
    - /auth/login (variant default)

  FLOW:
    Step 1: input email + "Continuar"
    Step 2: "Te mandamos um link" + botao reenviar (30s cooldown)

  BACKEND:
    POST /auth/magic-link/request { email, redirect_to } → envia email
    GET /auth/magic-link/verify?token=... → valida, cria/login, redirect

  REDIRECT TO:
    - /auth/register page → "/" (home)
    - /raio-x gate → "/wallet?onboarding=true" (com tickers em sessionStorage)
    - /auth/login page → "/" (home)

  ONBOARDING:
    Se user.name vazio apos verify, MoleculesOnboardingNameModal aparece
    no destino pra pedir o nome (nao bloqueia, soft gate).

  GOOGLE OAUTH:
    Mantido como caminho secundario. Funciona quando NAO esta no
    Instagram in-app browser (parent layer detecta e esconde).
-->
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** Modo inicial (so afeta copy do header). Toggle no step 1 muda. */
    mode?: 'register' | 'login'
    /** Destino apos verify do magic link. Default "/". */
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
  /** Disparado quando o magic link e enviado com sucesso. */
  linkSent: [{ email: string }]
  /** Disparado quando Google OAuth completa (redirect via componente). */
  success: [{ mode: 'register' | 'login' }]
  error: [string]
}>()

const { magicLinkRequest } = useAuthService()
const { track } = useMetaPixel()
const brand = useBrand()

// ============ STATE ============
const formMode = ref<'register' | 'login'>(props.mode)
const currentStep = ref<1 | 2>(1)
const email = ref('')
const submitting = ref(false)
const formError = ref('')

// Cooldown de reenvio (30s) pra evitar spam acidental
const resendCooldown = ref(0)
let cooldownInterval: ReturnType<typeof setInterval> | null = null

const canAdvance = computed(() => {
  return email.value.trim().includes('@') && email.value.trim().length > 4
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

// ============ MAGIC LINK REQUEST ============
async function requestLink() {
  if (!canAdvance.value || submitting.value) return
  submitting.value = true
  formError.value = ''

  try {
    await magicLinkRequest({
      email: email.value.trim().toLowerCase(),
      redirect_to: props.redirectTo,
    })

    // Lead disparado quando o link foi enviado (intent forte: pessoa
    // colocou email valido e disparou send). CompleteRegistration so
    // dispara apos verify (quando user de fato entra no produto).
    firePixelLead('Magic Link Request')

    currentStep.value = 2
    startCooldown(30)
    emit('linkSent', { email: email.value.trim().toLowerCase() })
  }
  catch (err: unknown) {
    const apiError = err as { data?: { message?: string; errors?: Record<string, string[]> } }
    const msg
      = apiError?.data?.message
      || (apiError?.data?.errors && Object.values(apiError.data.errors).flat()[0])
      || (err instanceof Error ? err.message : 'Erro ao enviar link. Tente novamente.')
    formError.value = String(msg)
    emit('error', String(msg))
  }
  finally {
    submitting.value = false
  }
}

async function resendLink() {
  if (!canResend.value) return
  await requestLink()
}

function backToStep1() {
  currentStep.value = 1
  formError.value = ''
  // Mantem o email pra pessoa nao ter que digitar de novo
}

// Google success — flow direto, sem magic link.
function onGoogleSuccess() {
  firePixelLead('Google')
  // CompleteRegistration sera disparado no verify backend pra Google tambem
  emit('success', { mode: formMode.value })
}
</script>

<template>
  <div class="auth-form">
    <!-- ============ STEP 1: input email ============ -->
    <div v-if="currentStep === 1" class="auth-form__step">
      <div class="auth-form__header">
        <div class="auth-form__logo" aria-hidden="true">
          <UIcon name="i-lucide-radar" class="size-7" :style="{ color: brand.colors.primary }" />
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

      <form class="auth-form__fields" novalidate @submit.prevent="requestLink">
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

    <!-- ============ STEP 2: link enviado (aguardando click) ============ -->
    <div v-else class="auth-form__step">
      <div class="auth-form__header">
        <div class="auth-form__icon-success" aria-hidden="true">
          <UIcon name="i-lucide-mail-check" class="size-8" :style="{ color: brand.colors.primary }" />
        </div>
        <h2 class="auth-form__title">
          Link enviado pro seu e-mail
        </h2>
        <p class="auth-form__subtitle">
          Mandamos um link de acesso pra <strong>{{ email }}</strong>.
          Abre o e-mail e clica em "Acessar minha conta".
        </p>
      </div>

      <div class="auth-form__step2-hints">
        <p class="auth-form__hint">
          <UIcon name="i-lucide-clock" class="size-3.5 inline-block" aria-hidden="true" />
          O link expira em 15 minutos.
        </p>
        <p class="auth-form__hint">
          <UIcon name="i-lucide-search" class="size-3.5 inline-block" aria-hidden="true" />
          Não chegou? Verifique a pasta de spam.
        </p>
      </div>

      <button
        type="button"
        class="auth-form__submit"
        :disabled="!canResend"
        @click="resendLink"
      >
        <UIcon name="i-lucide-rotate-cw" class="size-4" aria-hidden="true" />
        <span>
          {{ canResend ? 'Reenviar link' : `Reenviar em ${resendCooldown}s` }}
        </span>
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

/* ============ STEP 2 HINTS ============ */
.auth-form__step2-hints {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-primary) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 12%, transparent);
}

.auth-form__hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
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

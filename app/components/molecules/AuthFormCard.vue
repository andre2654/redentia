<!--
  MoleculesAuthFormCard — form de cadastro/login compartilhado.

  USADO EM:
    - MoleculesRaioXSimulationModal (hard gate /raio-x)
    - /auth/register (variant terminal)
    - /auth/login (variant terminal)

  POR QUE EXISTE:
  Antes a UX de cadastro estava replicada em 3 lugares com codigo divergente
  (form com 6 campos no /auth/register, form com 2 no modal, etc). Padrao do
  modal (3 campos, sem confirmacao de senha, label hint inline) provou
  conversao melhor — esse componente unifica tudo.

  COMPORTAMENTO:
  - Form com toggle register/login (auto-avanca campo a campo)
  - Pixel events disparados via emit (parent customiza content_name/category)
  - Auth via useAuthService (register, login)
  - Google OAuth via MoleculesGoogleAuthBlock
  - Pos-sucesso: emit('success', { mode }) + auto router.push(redirectTo)

  FILOSOFIA:
  - SEM confirmacao de senha (1 campo so — bench mostra 2x conversao)
  - SEM telefone (opcional, coletado em /settings depois)
  - SEM login customizado (deriva do email)
  - "min 8 caracteres" hint INLINE no label (a direita) em vez de mensagem
    de erro abaixo — pessoa ja sabe o requisito antes de digitar
-->
<script setup lang="ts">
import type { LoginPayload, RegisterPayload } from '~/services/auth'

const props = withDefaults(
  defineProps<{
    /** Modo inicial: cadastro ou login. User pode trocar via toggle. */
    mode?: 'register' | 'login'
    /** Destino apos sucesso (router.push). Default "/". */
    redirectTo?: string
    /** content_category usado nos pixel events (Lead, CompleteRegistration).
     *  Diferenciar permite analytics separados por surface (modal vs page). */
    pixelContext?: string
    /** Mostra divider "ou" + Google block. Default true. */
    showGoogle?: boolean
    /** Texto do divider antes do Google. Default "ou". */
    googleDivider?: string
  }>(),
  {
    mode: 'register',
    redirectTo: '/',
    pixelContext: 'auth_page',
    showGoogle: true,
    googleDivider: 'ou',
  },
)

const emit = defineEmits<{
  /** Sucesso de auth (register ou login). Dispara apos token salvo + profile. */
  success: [{ mode: 'register' | 'login' }]
  /** Falha — mensagem ja foi exibida no UI, parent pode usar pra tracking. */
  error: [string]
  /** Mudou de modo (register/login) via toggle. */
  modeChange: ['register' | 'login']
}>()

const router = useRouter()
const authStore = useAuthStore()
const { register: doRegister, login: doLogin } = useAuthService()
const { track } = useMetaPixel()

// ============ STATE ============
const formMode = ref<'register' | 'login'>(props.mode)
const formState = reactive({
  name: '',
  email: '',
  password: '',
})
const submitting = ref(false)
const formError = ref('')
// Toggle de visibilidade da senha (olhinho). UX padrao em forms de auth —
// reduz friccao em mobile (typo dificil de detectar) e em senhas geradas.
const showPassword = ref(false)

// ============ VALIDATION ============
const canSubmit = computed(() => {
  if (submitting.value) return false
  if (!formState.email.includes('@')) return false
  if (formState.password.length < 8) return false
  if (formMode.value === 'register' && formState.name.trim().length < 2) return false
  return true
})

function deriveLoginFromEmail(email: string): string {
  const local = (email.split('@')[0] ?? '').toLowerCase()
  const sanitized = local.replace(/[^a-z0-9]/g, '')
  return sanitized.length >= 4 ? sanitized : sanitized + Date.now().toString(36).slice(-4)
}

function switchMode(next: 'register' | 'login') {
  formMode.value = next
  formError.value = ''
  emit('modeChange', next)
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

function firePixelCompleteRegistration(via: string) {
  track('CompleteRegistration', {
    content_name: `${props.pixelContext} ${via}`,
    content_category: props.pixelContext,
    status: true,
    currency: 'BRL',
    value: 20,
  })
}

// ============ AUTH ============
async function handleSubmit() {
  if (!canSubmit.value) return
  submitting.value = true
  formError.value = ''

  try {
    let token: string | undefined

    if (formMode.value === 'register') {
      const payload: RegisterPayload = {
        name: formState.name.trim(),
        email: formState.email.trim().toLowerCase(),
        login: deriveLoginFromEmail(formState.email),
        password: formState.password,
        password_confirmation: formState.password,
      }
      const resp = await doRegister(payload)
      token = resp?.token ?? (resp as unknown as { access_token?: string })?.access_token

      firePixelLead('Register')
      firePixelCompleteRegistration('Register')
    }
    else {
      const payload: LoginPayload = {
        login: formState.email.trim(),
        password: formState.password,
      }
      const resp = await doLogin(payload)
      token = resp?.access_token

      firePixelLead('Login')
      // CompleteRegistration nao dispara em login (user ja existe).
    }

    if (token) {
      authStore.addToken(token)
      await authStore.fetchProfile()
    }

    emit('success', { mode: formMode.value })
    await router.push(props.redirectTo)
  }
  catch (err: unknown) {
    const apiError = err as { data?: { message?: string; errors?: Record<string, string[]> } }
    const msg
      = apiError?.data?.message
      || (apiError?.data?.errors && Object.values(apiError.data.errors).flat()[0])
      || (err instanceof Error ? err.message : 'Erro ao processar. Tente novamente.')
    formError.value = String(msg)
    emit('error', String(msg))
  }
  finally {
    submitting.value = false
  }
}

// Google success — dispara pixel events identicos ao cadastro por email
// pra tracking unificado. O componente Google ja faz o redirect via prop
// redirectTo, entao parent nao precisa fazer nada.
function onGoogleSuccess() {
  firePixelLead('Google')
  firePixelCompleteRegistration('Google')
  emit('success', { mode: formMode.value })
}
</script>

<template>
  <div class="auth-form">
    <form class="auth-form__fields" novalidate @submit.prevent="handleSubmit">
      <div v-if="formMode === 'register'" class="auth-form__field">
        <label for="auth-form-name" class="auth-form__label">Nome</label>
        <input
          id="auth-form-name"
          v-model="formState.name"
          type="text"
          class="auth-form__input"
          placeholder="Seu nome"
          autocomplete="name"
          required
        >
      </div>

      <div class="auth-form__field">
        <label for="auth-form-email" class="auth-form__label">Email</label>
        <input
          id="auth-form-email"
          v-model="formState.email"
          type="email"
          class="auth-form__input"
          placeholder="voce@exemplo.com"
          autocomplete="email"
          inputmode="email"
          spellcheck="false"
          required
        >
      </div>

      <div class="auth-form__field">
        <label for="auth-form-password" class="auth-form__label">
          Senha
          <span v-if="formMode === 'register'" class="auth-form__label-hint">mín 8 caracteres</span>
        </label>
        <div class="auth-form__password-wrap">
          <input
            id="auth-form-password"
            v-model="formState.password"
            :type="showPassword ? 'text' : 'password'"
            class="auth-form__input auth-form__input--with-toggle"
            :placeholder="formMode === 'register' ? 'Crie uma senha forte' : 'Sua senha'"
            :autocomplete="formMode === 'register' ? 'new-password' : 'current-password'"
            :minlength="8"
            required
          >
          <button
            type="button"
            class="auth-form__password-toggle"
            :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
            :aria-pressed="showPassword"
            tabindex="-1"
            @click="showPassword = !showPassword"
          >
            <UIcon
              :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              class="size-4"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <p v-if="formError" class="auth-form__error" role="alert">
        {{ formError }}
      </p>

      <button
        type="submit"
        class="auth-form__submit quiet-btn-primary"
        :disabled="!canSubmit"
      >
        <UIcon
          v-if="submitting"
          name="i-lucide-loader-2"
          class="size-4 motion-safe:animate-spin"
          aria-hidden="true"
        />
        <UIcon
          v-else
          name="i-lucide-sparkles"
          class="size-4"
          aria-hidden="true"
        />
        <span v-if="formMode === 'register'">
          {{ submitting ? 'Criando conta…' : 'Criar conta gratuita' }}
        </span>
        <span v-else>
          {{ submitting ? 'Entrando…' : 'Entrar' }}
        </span>
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

    <!-- Google OAuth — caminho secundario. Via componente compartilhado
         que renderiza o widget oficial do Google. -->
    <div v-if="showGoogle" class="auth-form__google">
      <MoleculesGoogleAuthBlock
        :mode="formMode === 'register' ? 'signup' : 'signin'"
        :divider-label="googleDivider"
        :redirect-to="redirectTo"
        @success="onGoogleSuccess"
      />
    </div>
  </div>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.auth-form__fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-form__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.auth-form__label {
  font-family: var(--brand-font);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-heading);
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.auth-form__label-hint {
  font-size: 11px;
  font-weight: 400;
  color: var(--text-muted);
}

.auth-form__input {
  width: 100%;
  padding: 11px 14px;
  border-radius: 10px;
  border: 1.5px solid var(--border-subtle);
  background: var(--bg-base);
  color: var(--text-heading);
  font-family: var(--brand-font);
  font-size: 14px;
  letter-spacing: 0.005em;
  transition: border-color 150ms, box-shadow 150ms;
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

/* Wrapper do input de senha pra acomodar o botao "olhinho" sobreposto. */
.auth-form__password-wrap {
  position: relative;
}

/* Padding-right extra reserva espaco pro botao toggle nao sobrepor o
   texto da senha. 44px = 32px do botao + 8px de respiro + 4px margem. */
.auth-form__input--with-toggle {
  padding-right: 44px;
}

.auth-form__password-toggle {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 0;
  cursor: pointer;
  color: var(--text-muted);
  border-radius: 6px;
  transition: color 150ms, background-color 150ms;
}

.auth-form__password-toggle:hover {
  color: var(--text-heading);
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
}

.auth-form__password-toggle:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand-primary) 35%, transparent);
}

.auth-form__error {
  font-size: 12px;
  line-height: 1.4;
  color: var(--brand-negative, #dc2626);
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-negative, #dc2626) 25%, transparent);
  padding: 8px 10px;
  border-radius: 8px;
  margin: 0;
}

.auth-form__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px 22px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: 0;
  font-family: var(--brand-font);
  text-decoration: none;
  transition: filter 180ms, transform 120ms, box-shadow 180ms, opacity 180ms;
  box-shadow: 0 8px 22px -10px color-mix(in srgb, var(--brand-primary) 55%, transparent);
  margin-top: 4px;
}

.auth-form__submit:hover:not(:disabled) {
  filter: brightness(0.94);
  transform: translateY(-1px);
  box-shadow: 0 12px 28px -10px color-mix(in srgb, var(--brand-primary) 65%, transparent);
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

.auth-form__toggle {
  margin: 4px 0 0;
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

.auth-form__google {
  margin-top: 4px;
}
</style>

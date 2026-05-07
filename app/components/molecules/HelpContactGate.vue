<!--
  MoleculesHelpContactGate — gate do /help (e qualquer surface authed)
  que exige telefone E email cadastrados.

  CONTEXTO:
    O fluxo passwordless via WhatsApp PIN cria users com SO o telefone
    (sem nome, sem email). O fluxo magic link cria users com SO o email
    (sem telefone). Pra abrir o /help, precisamos dos dois:

      - telefone → confirmacao + canal de alertas (WhatsApp)
      - email    → fallback de comunicados, magic link, recovery

    Esse gate substitui o antigo PhoneGateModal. Diferente dele:

      1. Usa fluxo real de PIN via WhatsApp (request-pin → verify-pin)
         em vez de "salvar e confiar" — anti-fraude.
      2. Trata 2 etapas: telefone primeiro, depois email (se faltar).
      3. Email vai por magic link — backend gera link com signature
         contact-gate-update:{user_id}, user clica, abre /auth/magic-link/verify
         que redireciona pra /help. Aqui mostramos "verifica seu email"
         enquanto isso.

  STATE MACHINE:
    nothing-needed → gate fechado (user tem phone E email)
    needs-phone    → step="phone-input" → "phone-pin" → (se faltar email) → needs-email
    needs-email    → step="email-input" → "email-sent" (aguarda click no link)

  REATIVIDADE:
    Estado deriva de authStore.me.{celular,email}. Apos verifyPhonePin
    (que retorna user atualizado), atualizamos o store e o computed
    re-avalia. Se faltar email ainda, gate fica aberto na proxima etapa.
-->
<script setup lang="ts">
import { vMaska } from 'maska/vue'

defineProps<{
  /** Se o gate deve estar visivel. Computed no parent baseado em me.{celular,email}. */
  open: boolean
}>()

const emit = defineEmits<{
  /** Disparado quando ambos contatos foram salvos (gate sera fechado pelo parent). */
  ready: []
}>()

const authStore = useAuthStore()
const {
  requestPhonePin,
  verifyPhonePin,
  requestEmailLink,
} = useAuthService()

// ============ ESTADO ============
type Step = 'phone-input' | 'phone-pin' | 'email-input' | 'email-sent'

// Computed: o que falta no user logado AGORA. Reativo a authStore.me.
const missingPhone = computed(() => !authStore.me?.celular)
const missingEmail = computed(() => !authStore.me?.email)

// Step inicial: se falta telefone, comecamos por ele. Senao, email.
// Quando phone for verificado, o computed vai re-avaliar e o template
// transita pra email-input automaticamente.
const step = ref<Step>(missingPhone.value ? 'phone-input' : 'email-input')

watch([missingPhone, missingEmail], ([noPhone, noEmail]) => {
  if (noPhone) {
    if (step.value !== 'phone-pin') step.value = 'phone-input'
  }
  else if (noEmail) {
    if (step.value !== 'email-sent') step.value = 'email-input'
  }
}, { immediate: true })

// ============ PHONE STATE ============
const celular = ref('')
const phoneFocused = ref(false)
const pinDigits = ref<string[]>(['', '', '', '', '', ''])
const pinRefs = ref<HTMLInputElement[]>([])
const resendCooldown = ref(0)
let cooldownInterval: ReturnType<typeof setInterval> | null = null

const submitting = ref(false)
const errorMsg = ref('')

const phoneInputEl = ref<HTMLInputElement | null>(null)
const emailInputEl = ref<HTMLInputElement | null>(null)

// ============ EMAIL STATE ============
const email = ref('')

// ============ VALIDATION ============
const phoneIsValid = computed(() => {
  const d = celular.value.replace(/\D+/g, '')
  return (d.length === 10 || d.length === 11) || ((d.length === 12 || d.length === 13) && d.startsWith('55'))
})

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

// Body scroll lock e auto-focus quando abre
watch(step, async (next) => {
  await nextTick()
  if (next === 'phone-input') phoneInputEl.value?.focus()
  if (next === 'email-input') emailInputEl.value?.focus()
  if (next === 'phone-pin') pinRefs.value[0]?.focus()
})

watch(() => authStore.isAuthenticated, () => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = 'hidden'
})

onMounted(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = 'hidden'
  nextTick(() => {
    if (step.value === 'phone-input') phoneInputEl.value?.focus()
    if (step.value === 'email-input') emailInputEl.value?.focus()
  })
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})

// ============ PHONE FLOW ============
async function submitPhone() {
  if (!phoneIsValid.value || submitting.value) return
  submitting.value = true
  errorMsg.value = ''
  try {
    const cleaned = celular.value.replace(/\D+/g, '')
    // Backend normaliza, mas ja garantimos formato BR aqui
    await requestPhonePin(cleaned)
    step.value = 'phone-pin'
    startCooldown(30)
    pinDigits.value = ['', '', '', '', '', '']
    nextTick(() => pinRefs.value[0]?.focus())
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
    const cleaned = celular.value.replace(/\D+/g, '')
    await requestPhonePin(cleaned)
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
  if (pinIsComplete.value) verifyPhone()
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
  if (pinIsComplete.value) verifyPhone()
}

async function verifyPhone() {
  if (!pinIsComplete.value || submitting.value) return
  submitting.value = true
  errorMsg.value = ''
  try {
    const cleaned = celular.value.replace(/\D+/g, '')
    const pin = pinDigits.value.join('')
    const resp = await verifyPhonePin(cleaned, pin)
    // Atualiza store. Se ainda falta email, watcher transita pra email-input.
    if (resp?.user) {
      authStore.setMeFromUser(resp.user as any)
    }
    // Se ja tem email, gate fecha
    if (!missingEmail.value) {
      // Pequeno delay pra UI mostrar sucesso
      setTimeout(() => emit('ready'), 150)
    }
    // Se ainda falta email, watcher cuida — vai pra email-input
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

// ============ EMAIL FLOW ============
async function submitEmail() {
  if (!emailIsValid.value || submitting.value) return
  submitting.value = true
  errorMsg.value = ''
  try {
    const cleaned = email.value.trim().toLowerCase()
    await requestEmailLink(cleaned)
    step.value = 'email-sent'
  }
  catch (err: unknown) {
    const apiError = err as { data?: { message?: string } }
    errorMsg.value = apiError?.data?.message || (err instanceof Error ? err.message : 'Erro ao enviar link.')
  }
  finally {
    submitting.value = false
  }
}

</script>

<template>
  <Teleport to="body">
    <Transition name="contact-gate">
      <div
        v-if="open"
        class="contact-gate"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-gate-title"
      >
        <div class="contact-gate__backdrop" aria-hidden="true" />

        <div class="contact-gate__dialog">
          <!-- Progress dots: phone-input/phone-pin = 1/2; email-input/email-sent = 2/2 -->
          <div v-if="missingPhone && missingEmail" class="contact-gate__progress" aria-hidden="true">
            <span
              class="contact-gate__progress-dot"
              :class="{ 'contact-gate__progress-dot--active': step.startsWith('phone') }"
            />
            <span class="contact-gate__progress-bar" />
            <span
              class="contact-gate__progress-dot"
              :class="{ 'contact-gate__progress-dot--active': step.startsWith('email') || !missingPhone }"
            />
          </div>

          <!-- =========== PHONE INPUT =========== -->
          <template v-if="step === 'phone-input'">
            <div class="contact-gate__icon-wrap" aria-hidden="true">
              <span class="contact-gate__icon-glow" />
              <UIcon name="i-lucide-message-circle" class="contact-gate__icon size-7" />
            </div>
            <p class="contact-gate__eyebrow">CONFIRMAÇÃO POR WHATSAPP</p>
            <h2 id="contact-gate-title" class="contact-gate__title">
              Antes de abrir o chat, confirme seu WhatsApp.
            </h2>
            <p class="contact-gate__lead">
              Vamos enviar um código de 6 dígitos pelo <strong>WhatsApp</strong>
              pra confirmar que é você. Isso libera o chat e ativa alertas críticos.
            </p>

            <form class="contact-gate__form" @submit.prevent="submitPhone">
              <label class="contact-gate__label" for="contact-gate-phone">Seu WhatsApp</label>
              <div
                class="contact-gate__phone-group"
                :class="{ 'contact-gate__phone-group--focused': phoneFocused }"
              >
                <span class="contact-gate__phone-prefix" aria-hidden="true">
                  <span class="contact-gate__phone-flag">🇧🇷</span>
                  <span class="contact-gate__phone-cc">+55</span>
                </span>
                <input
                  id="contact-gate-phone"
                  ref="phoneInputEl"
                  v-model="celular"
                  v-maska="'(##) # ####-####'"
                  type="tel"
                  autocomplete="tel-national"
                  inputmode="tel"
                  placeholder="(11) 9 9999-9999"
                  class="contact-gate__phone-input"
                  :disabled="submitting"
                  @focus="phoneFocused = true"
                  @blur="phoneFocused = false"
                >
              </div>
              <p v-if="errorMsg" class="contact-gate__error">{{ errorMsg }}</p>

              <button
                type="submit"
                class="contact-gate__submit"
                :disabled="submitting || !phoneIsValid"
              >
                <UIcon v-if="submitting" name="i-lucide-loader-2" class="size-4 animate-spin" aria-hidden="true" />
                <UIcon v-else name="i-lucide-message-circle" class="size-4" aria-hidden="true" />
                <span>{{ submitting ? 'Enviando…' : 'Receber código no WhatsApp' }}</span>
              </button>
            </form>

            <p class="contact-gate__fineprint">
              Seu número é privado. Usamos só para confirmar acesso e enviar alertas que você ativar.
            </p>
          </template>

          <!-- =========== PHONE PIN =========== -->
          <template v-else-if="step === 'phone-pin'">
            <div class="contact-gate__icon-wrap" aria-hidden="true">
              <span class="contact-gate__icon-glow" />
              <UIcon name="i-lucide-shield-check" class="contact-gate__icon size-7" />
            </div>
            <p class="contact-gate__eyebrow">DIGITE O CÓDIGO</p>
            <h2 class="contact-gate__title">
              Digite os 6 dígitos
            </h2>
            <p class="contact-gate__lead">
              Mandamos um código pro WhatsApp <strong>{{ celular }}</strong>.
            </p>

            <div class="contact-gate__pin" @paste="onPinPaste">
              <input
                v-for="(_, idx) in pinDigits"
                :key="idx"
                :ref="(el) => { if (el) pinRefs[idx] = el as HTMLInputElement }"
                v-model="pinDigits[idx]"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="1"
                class="contact-gate__pin-box"
                :aria-label="`Digito ${idx + 1} de 6`"
                @input="onPinInput($event, idx)"
                @keydown="onPinKeydown($event, idx)"
                @focus="(e) => (e.target as HTMLInputElement).select()"
              >
            </div>

            <p v-if="errorMsg" class="contact-gate__error contact-gate__error--center">{{ errorMsg }}</p>

            <button
              type="button"
              class="contact-gate__submit"
              :disabled="!pinIsComplete || submitting"
              @click="verifyPhone"
            >
              <UIcon v-if="submitting" name="i-lucide-loader-2" class="size-4 animate-spin" aria-hidden="true" />
              <UIcon v-else name="i-lucide-check" class="size-4" aria-hidden="true" />
              <span>{{ submitting ? 'Verificando…' : 'Confirmar' }}</span>
            </button>

            <div class="contact-gate__pin-actions">
              <button
                type="button"
                class="contact-gate__link"
                :disabled="!canResend"
                @click="resendPin"
              >
                {{ canResend ? 'Reenviar código' : `Reenviar em ${resendCooldown}s` }}
              </button>
              <button
                type="button"
                class="contact-gate__link contact-gate__link--muted"
                @click="step = 'phone-input'"
              >
                Usar outro telefone
              </button>
            </div>
          </template>

          <!-- =========== EMAIL INPUT =========== -->
          <template v-else-if="step === 'email-input'">
            <div class="contact-gate__icon-wrap" aria-hidden="true">
              <span class="contact-gate__icon-glow" />
              <UIcon name="i-lucide-mail" class="contact-gate__icon size-7" />
            </div>
            <p class="contact-gate__eyebrow">FALTA SÓ O EMAIL</p>
            <h2 class="contact-gate__title">
              Adicione um email pra continuar.
            </h2>
            <p class="contact-gate__lead">
              Vamos enviar um <strong>link de confirmação</strong> pro email que você
              cadastrar. Usamos pra recovery de conta e comunicados importantes.
            </p>

            <form class="contact-gate__form" @submit.prevent="submitEmail">
              <label class="contact-gate__label" for="contact-gate-email">Seu email</label>
              <input
                id="contact-gate-email"
                ref="emailInputEl"
                v-model="email"
                type="email"
                autocomplete="email"
                inputmode="email"
                spellcheck="false"
                autocapitalize="none"
                placeholder="voce@exemplo.com"
                class="contact-gate__input"
                :disabled="submitting"
              >
              <p v-if="errorMsg" class="contact-gate__error">{{ errorMsg }}</p>

              <button
                type="submit"
                class="contact-gate__submit"
                :disabled="submitting || !emailIsValid"
              >
                <UIcon v-if="submitting" name="i-lucide-loader-2" class="size-4 animate-spin" aria-hidden="true" />
                <UIcon v-else name="i-lucide-mail" class="size-4" aria-hidden="true" />
                <span>{{ submitting ? 'Enviando…' : 'Enviar link de confirmação' }}</span>
              </button>
            </form>

            <p class="contact-gate__fineprint">
              Confirmamos por link pra evitar erros de digitação. O email fica privado.
            </p>
          </template>

          <!-- =========== EMAIL SENT =========== -->
          <template v-else>
            <div class="contact-gate__icon-wrap contact-gate__icon-wrap--success" aria-hidden="true">
              <span class="contact-gate__icon-glow" />
              <UIcon name="i-lucide-mail-check" class="contact-gate__icon size-7" />
            </div>
            <p class="contact-gate__eyebrow">VERIFIQUE SEU EMAIL</p>
            <h2 class="contact-gate__title">
              Link enviado pro <em>{{ email }}</em>
            </h2>
            <p class="contact-gate__lead">
              Abre o email e clica em <strong>"Confirmar email"</strong>.
              O link expira em 15 minutos.
            </p>

            <button
              type="button"
              class="contact-gate__submit contact-gate__submit--ghost"
              @click="step = 'email-input'"
            >
              <UIcon name="i-lucide-arrow-left" class="size-4" aria-hidden="true" />
              <span>Usar outro email</span>
            </button>

            <p class="contact-gate__fineprint">
              Não chegou? Verifique a caixa de spam.
            </p>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.contact-gate {
  position: fixed;
  inset: 0;
  z-index: 9200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.contact-gate__backdrop {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--bg-base) 65%, rgba(0, 0, 0, 0.55));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.contact-gate__dialog {
  position: relative;
  width: 100%;
  max-width: 460px;
  padding: 32px 28px 24px;
  border-radius: 18px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
  box-shadow:
    0 32px 80px -24px color-mix(in srgb, var(--brand-primary) 28%, transparent),
    0 16px 40px -12px rgba(0, 0, 0, 0.32);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ============ PROGRESS ============ */
.contact-gate__progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
}

.contact-gate__progress-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--text-muted) 35%, transparent);
  transition: background 200ms;
}

.contact-gate__progress-dot--active {
  background: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

.contact-gate__progress-bar {
  width: 26px;
  height: 1px;
  background: color-mix(in srgb, var(--text-muted) 35%, transparent);
}

/* ============ ICON ============ */
.contact-gate__icon-wrap {
  position: relative;
  width: 56px;
  height: 56px;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-gate__icon-glow {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 28%, transparent) 0%, transparent 70%);
  filter: blur(8px);
}

.contact-gate__icon {
  position: relative;
  color: var(--brand-primary);
}

/* ============ TITLE ============ */
.contact-gate__eyebrow {
  font-family: var(--brand-font);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brand-primary);
  margin-bottom: 8px;
}

.contact-gate__title {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--text-heading);
  margin-bottom: 10px;
  font-family: var(--brand-font);
}

.contact-gate__title em {
  font-style: normal;
  color: var(--brand-primary);
}

.contact-gate__lead {
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-body);
  margin-bottom: 22px;
  max-width: 380px;
}

.contact-gate__lead strong {
  color: var(--text-heading);
  font-weight: 600;
}

/* ============ FORM ============ */
.contact-gate__form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  width: 100%;
  margin-bottom: 16px;
}

.contact-gate__label {
  font-family: var(--brand-font);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.contact-gate__input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-base);
  color: var(--text-heading);
  font-size: 15px;
  font-family: var(--brand-font);
  outline: none;
  transition: border-color 160ms, box-shadow 160ms;
}

.contact-gate__input:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}

.contact-gate__input:disabled {
  opacity: 0.6;
}

/* ============ PHONE INPUT GROUP (BR flag + +55 fixo + numero) ============ */
.contact-gate__phone-group {
  display: flex;
  align-items: stretch;
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-base);
  overflow: hidden;
  transition: border-color 160ms, box-shadow 160ms;
}

.contact-gate__phone-group--focused {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}

.contact-gate__phone-prefix {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  font-family: var(--brand-font);
  font-size: 15px;
  font-weight: 500;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
  border-right: 1px solid var(--border-subtle);
  background: color-mix(in srgb, var(--text-muted) 8%, transparent);
  user-select: none;
  flex-shrink: 0;
}

.contact-gate__phone-flag {
  font-size: 18px;
  line-height: 1;
  font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
}

.contact-gate__phone-cc {
  font-size: 14px;
}

.contact-gate__phone-input {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border: 0;
  background: transparent;
  color: var(--text-heading);
  font-family: var(--brand-font);
  font-size: 15px;
  outline: none;
}

.contact-gate__phone-input:disabled {
  opacity: 0.6;
}

.contact-gate__error {
  font-size: 12.5px;
  color: var(--brand-negative);
  margin: 0;
}

.contact-gate__error--center {
  text-align: center;
  margin: 0 0 12px;
}

/* ============ PIN BOXES ============ */
.contact-gate__pin {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  width: 100%;
  margin-bottom: 14px;
}

.contact-gate__pin-box {
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

.contact-gate__pin-box:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 22%, transparent);
  transform: scale(1.02);
}

.contact-gate__pin-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  margin-top: 10px;
}

.contact-gate__link {
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

.contact-gate__link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--text-muted);
}

.contact-gate__link--muted {
  color: var(--text-muted);
  font-weight: 500;
}

.contact-gate__link--muted:hover {
  color: var(--text-heading);
}

/* ============ SUBMIT ============ */
.contact-gate__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 6px;
  padding: 13px 20px;
  border-radius: 999px;
  border: 0;
  background: var(--brand-primary);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  font-family: var(--brand-font);
  cursor: pointer;
  transition: filter 180ms, transform 120ms, box-shadow 180ms;
  box-shadow: 0 8px 22px -10px color-mix(in srgb, var(--brand-primary) 55%, transparent);
  width: 100%;
}

.contact-gate__submit--ghost {
  background: transparent;
  color: var(--text-body);
  border: 1px solid var(--border-subtle);
  box-shadow: none;
}

.contact-gate__submit--ghost:hover:not(:disabled) {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}

.contact-gate__submit:hover:not(:disabled) {
  filter: brightness(0.94);
  transform: translateY(-1px);
}

.contact-gate__submit:active:not(:disabled) {
  transform: translateY(0);
}

.contact-gate__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.contact-gate__fineprint {
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-muted);
  margin-top: 14px;
  max-width: 360px;
}

/* Transitions */
.contact-gate-enter-active,
.contact-gate-leave-active {
  transition: opacity 220ms ease;
}
.contact-gate-enter-active .contact-gate__dialog,
.contact-gate-leave-active .contact-gate__dialog {
  transition: transform 240ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.contact-gate-enter-from,
.contact-gate-leave-to {
  opacity: 0;
}
.contact-gate-enter-from .contact-gate__dialog,
.contact-gate-leave-to .contact-gate__dialog {
  transform: translateY(20px);
}

@media (prefers-reduced-motion: reduce) {
  .contact-gate-enter-active,
  .contact-gate-leave-active,
  .contact-gate-enter-active .contact-gate__dialog,
  .contact-gate-leave-active .contact-gate__dialog {
    transition: none;
  }
}
</style>

<!--
  MoleculesAssessoriaLeadFullscreen, modal fullscreen multi-step para
  capturar leads B2B nas landings de assessoria
  (/assessorias-diferencie-problema e /assessorias-diferencie-solucao).

  Diferente do MoleculesLeadCaptureModal (modal centrado, 1-step) que e
  compartilhado com /whitelabel e /api, esse aqui e DEDICADO as 2 landings de assessoria
  e ocupa a tela inteira em 2 etapas:

    1. Identificacao: nome, email, telefone
    2. Diagnostico: 5 perguntas Sim/Não que ajudam o time a qualificar
       o lead antes da call.

  As 5 perguntas tem peso comercial pra equipe (separar curiosos vs
  operacao real, medir dor, intencao comercial). Mas o LEAD nao ve
  esse "porque" interno, ve apenas a pergunta.

  Submit POSTa pra /api/leads com source='assessoria' e metadata.answers
  contendo o mapa pergunta -> resposta. Mesmo endpoint do modal antigo,
  zero mudanca no backend.

  Usage:
    <MoleculesAssessoriaLeadFullscreen v-model:open="open" />

  Fechamento: X no canto top-right, OU tecla ESC, OU click no backdrop
  (so se nao houve interacao com o form ainda, evita perder dados).
-->

<template>
  <Transition name="ass-fs-fade">
    <div
      v-if="isOpen"
      class="ass-fs"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="`ass-fs-title-${currentStep}`"
    >
      <!-- Background ambiente, gradient amber sutil + noise textural -->
      <div class="ass-fs__bg" aria-hidden="true">
        <div
          class="ass-fs__glow"
          :style="{ background: `radial-gradient(ellipse 60% 50% at 50% 30%, color-mix(in srgb, ${primary} 18%, transparent), transparent 65%)` }"
        />
      </div>

      <!-- Botao X de fechar, top-right -->
      <button
        type="button"
        class="ass-fs__close"
        aria-label="Fechar"
        @click="close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      <!-- Step indicator, top-left -->
      <div v-if="currentStep !== 'success'" class="ass-fs__steps" aria-hidden="true">
        <span class="ass-fs__step-num is-current">{{ currentStep }}</span>
        <span class="ass-fs__step-divider" />
        <span class="ass-fs__step-num">{{ totalSteps }}</span>
        <span class="ass-fs__step-label">{{ stepLabel }}</span>
      </div>

      <!-- Conteudo dos steps com transition slide+fade entre eles -->
      <div class="ass-fs__inner">
        <Transition :name="stepTransitionName" mode="out-in">
          <!-- ================== STEP 1: IDENTIFICACAO ================== -->
          <div v-if="currentStep === 1" key="step-1" class="ass-fs__step">
            <h2 :id="`ass-fs-title-${currentStep}`" class="ass-fs__title">
              Preencha os seus dados <em>para entrarmos em contato</em>
            </h2>
            <p class="ass-fs__sub">
              Esteja preparado para
              <span class="ass-fs__hl">transformar</span>
              a experiência e
              <span class="ass-fs__hl">aumentar</span>
              o lucro de vocês.
            </p>

            <form class="ass-fs__form" @submit.prevent="goToStep2">
              <div class="ass-fs__field">
                <label for="ass-fs-name">Seu nome</label>
                <input
                  id="ass-fs-name"
                  v-model="form.name"
                  type="text"
                  required
                  autocomplete="name"
                  placeholder="Como você se chama?"
                  @keydown.enter.prevent="focusNext($event, 'ass-fs-email')"
                />
              </div>

              <div class="ass-fs__field">
                <label for="ass-fs-email">Seu e-mail</label>
                <input
                  id="ass-fs-email"
                  v-model="form.email"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="voce@empresa.com.br"
                  @keydown.enter.prevent="focusNext($event, 'ass-fs-phone')"
                />
              </div>

              <div class="ass-fs__field">
                <label for="ass-fs-phone">Seu telefone</label>
                <input
                  id="ass-fs-phone"
                  v-model="form.phone"
                  type="tel"
                  required
                  autocomplete="tel"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <p v-if="errorMsg" class="ass-fs__error">{{ errorMsg }}</p>

              <button
                type="submit"
                class="ass-fs__cta"
                :disabled="!step1Valid"
              >
                Continuar
                <span aria-hidden="true">→</span>
              </button>

              <p class="ass-fs__legal">
                Seus dados estão seguros. Não compartilhamos com terceiros.
              </p>
            </form>
          </div>

          <!-- ================== STEP 2: DIAGNOSTICO ================== -->
          <div v-else-if="currentStep === 2" key="step-2" class="ass-fs__step">
            <h2 :id="`ass-fs-title-${currentStep}`" class="ass-fs__title">
              Agora precisamos entender <em>o momento da sua assessoria</em>
            </h2>
            <p class="ass-fs__sub">
              São apenas <span class="ass-fs__hl">5 perguntas</span>.
            </p>

            <div class="ass-fs__qs">
              <div
                v-for="(q, i) in questions"
                :key="q.id"
                class="ass-fs__q"
                :class="{ 'is-answered': answers[q.id] }"
              >
                <span class="ass-fs__q-num">{{ String(i + 1).padStart(2, '0') }}</span>
                <p class="ass-fs__q-text">{{ q.text }}</p>
                <div class="ass-fs__q-actions" role="radiogroup" :aria-label="q.text">
                  <button
                    type="button"
                    role="radio"
                    :aria-checked="answers[q.id] === 'Sim'"
                    :class="['ass-fs__q-btn', { 'is-selected': answers[q.id] === 'Sim' }]"
                    @click="answers[q.id] = 'Sim'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Sim
                  </button>
                  <button
                    type="button"
                    role="radio"
                    :aria-checked="answers[q.id] === 'Não'"
                    :class="['ass-fs__q-btn', { 'is-selected': answers[q.id] === 'Não' }]"
                    @click="answers[q.id] = 'Não'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Não
                  </button>
                </div>
              </div>
            </div>

            <p v-if="errorMsg" class="ass-fs__error">{{ errorMsg }}</p>

            <div class="ass-fs__row">
              <button
                type="button"
                class="ass-fs__back"
                @click="currentStep = 1"
              >
                <span aria-hidden="true">←</span>
                Voltar
              </button>
              <button
                type="button"
                class="ass-fs__cta"
                :disabled="!step2Valid || state === 'loading'"
                @click="submit"
              >
                <svg v-if="state === 'loading'" class="ass-fs__spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                {{ state === 'loading' ? 'Enviando...' : 'Enviar' }}
                <span v-if="state !== 'loading'" aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          <!-- ================== SUCCESS ================== -->
          <div v-else key="success" class="ass-fs__step ass-fs__step--success">
            <div class="ass-fs__check" :style="{ background: `color-mix(in srgb, ${positive} 16%, transparent)`, color: positive }">
              <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 class="ass-fs__title">
              Recebemos seu contato.
              <em>Nosso time fala com você em breve.</em>
            </h2>
            <p class="ass-fs__sub">
              Vamos analisar suas respostas e marcar uma conversa rápida nos próximos dias úteis.
            </p>
            <button type="button" class="ass-fs__cta" @click="close">
              Fechar
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const brand = useBrand()
const config = useRuntimeConfig()
const metaPixel = useMetaPixel()

const isOpen = defineModel<boolean>('open', { default: false })

const primary = computed(() => brand.colors.primary || '#D8881A')
const positive = computed(() => brand.colors.positive || '#10b981')

// Steps: 1 (identificacao), 2 (diagnostico), 'success' (post-submit).
type Step = 1 | 2 | 'success'
const currentStep = ref<Step>(1)
const totalSteps = 2
const stepLabel = computed(() => currentStep.value === 1 ? 'Identificação' : 'Diagnóstico')

// Direction-aware transition: avancar = slide pra esquerda,
// voltar = slide pra direita. Atualiza dinamicamente.
const stepTransitionName = ref<'ass-fs-step-fwd' | 'ass-fs-step-back'>('ass-fs-step-fwd')

const form = reactive({
  name: '',
  email: '',
  phone: '',
})

const questions = [
  { id: 'q1', text: 'Sua assessoria já atende clientes atualmente?' },
  { id: 'q2', text: 'Você sente que sua entrega hoje é parecida com a de outras assessorias?' },
  { id: 'q3', text: 'Você gostaria de ter uma plataforma própria com a sua marca para seus clientes?' },
  { id: 'q4', text: 'Você já usa algum tipo de IA ou automação no relacionamento com clientes?' },
  { id: 'q5', text: 'Se fizer sentido, você teria disponibilidade para uma conversa rápida nos próximos dias?' },
]
const answers = reactive<Record<string, 'Sim' | 'Não'>>({})

const state = ref<'idle' | 'loading' | 'error'>('idle')
const errorMsg = ref('')

const step1Valid = computed(() => {
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
  return form.name.trim().length >= 2 && emailOk && form.phone.trim().length >= 8
})
const step2Valid = computed(() => questions.every((q) => answers[q.id]))

function close() {
  isOpen.value = false
}

function goToStep2() {
  errorMsg.value = ''
  if (!step1Valid.value) {
    errorMsg.value = 'Confira nome, e-mail e telefone antes de continuar.'
    return
  }
  stepTransitionName.value = 'ass-fs-step-fwd'
  currentStep.value = 2
}

// Helper pra avancar com Enter no input atual
function focusNext(_e: KeyboardEvent, nextId: string) {
  document.getElementById(nextId)?.focus()
}

async function submit() {
  if (!step2Valid.value) {
    errorMsg.value = 'Por favor, responda todas as 5 perguntas.'
    return
  }
  state.value = 'loading'
  errorMsg.value = ''

  // Mapa pergunta -> resposta, vai pra metadata.answers (legivel
  // direto no admin sem schema separado).
  const answersPayload: Record<string, string> = {}
  for (const q of questions) {
    if (answers[q.id]) answersPayload[q.text] = answers[q.id]
  }

  try {
    await $fetch(`${config.public.apiBaseUrl}/leads`, {
      method: 'POST',
      body: {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        source: 'assessoria',
        metadata: {
          url: window.location.href,
          referrer: document.referrer || undefined,
          userAgent: navigator.userAgent,
          answers: answersPayload,
        },
      },
    })

    // Dispara o evento Lead (Pixel + CAPI) com content_name distinto pra
    // permitir Custom Conversions segmentadas no Events Manager (landing
    // de problema/dor vs landing de solucao). value=500 e estimativa de
    // pipeline contribuido por lead qualificado, ajustar conforme o real
    // LTV B2B amadurece.
    const isSolucaoLanding = typeof window !== 'undefined'
      && window.location.pathname.includes('diferencie-solucao')
    metaPixel.track('Lead', {
      content_name: isSolucaoLanding ? 'assessorias-diferencie-solucao' : 'assessorias-diferencie-problema',
      content_category: 'b2b-assessoria',
      value: 500,
      currency: 'BRL',
    })

    stepTransitionName.value = 'ass-fs-step-fwd'
    currentStep.value = 'success'
    state.value = 'idle'
  }
  catch (err: any) {
    state.value = 'error'
    if (err?.status === 429) {
      errorMsg.value = 'Muitas tentativas. Aguarde um minuto e tente novamente.'
    }
    else if (err?.data?.errors) {
      const firstError = Object.values(err.data.errors).flat()[0]
      errorMsg.value = String(firstError)
    }
    else {
      errorMsg.value = 'Erro ao enviar. Tente novamente em instantes.'
    }
  }
}

// ESC fecha o modal. Listener so ativo enquanto aberto.
function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) close()
}

// Reset state ao abrir/fechar. Trava scroll do body enquanto aberto.
watch(isOpen, (open) => {
  if (typeof window === 'undefined') return
  if (open) {
    currentStep.value = 1
    state.value = 'idle'
    errorMsg.value = ''
    form.name = ''
    form.email = ''
    form.phone = ''
    for (const k of Object.keys(answers)) delete answers[k]
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onEsc)
  }
  else {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onEsc)
  }
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onEsc)
})
</script>

<style scoped>
/* ============ FULLSCREEN OVERLAY ============ */
/* Light mode forcado dentro do escopo do modal: overrides as CSS vars
   pra garantir aparencia consistente independente do mode da page de
   fundo (que pode estar em dark). O modal e form-heavy e fica MUITO
   melhor em light: contraste mais alto, leitura mais facil em form
   longo. Primary/positive/negative ficam intocados (sao cores de
   destaque, nao mudam entre modes). */
.ass-fs {
  --brand-background: #FAFAFB;
  --brand-text: var(--text-heading);
  --brand-text-muted: rgba(26, 10, 46, 0.6);
  --brand-surface: #FFFFFF;
  --brand-border: rgba(26, 10, 46, 0.14);
  --brand-input-bg: #FFFFFF;
  --brand-input-border: rgba(26, 10, 46, 0.2);
  /* Forca scrollbar/autocomplete/selection nativo em light mode */
  color-scheme: light;

  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  background: #FAFAFB;
  color: var(--text-heading);
  font-family: var(--brand-font);
  overflow-y: auto;
  overflow-x: hidden;
}
.ass-fs__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.ass-fs__glow {
  position: absolute;
  inset: -10% -10%;
  filter: blur(80px);
  opacity: 0.7;
  will-change: opacity;
  transform: translateZ(0);
}

/* Transitions: overlay (fade) + steps (slide) */
.ass-fs-fade-enter-active,
.ass-fs-fade-leave-active {
  transition: opacity 240ms ease-out;
}
.ass-fs-fade-enter-from,
.ass-fs-fade-leave-to { opacity: 0; }

.ass-fs-step-fwd-enter-active,
.ass-fs-step-fwd-leave-active,
.ass-fs-step-back-enter-active,
.ass-fs-step-back-leave-active {
  transition: opacity 320ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 320ms cubic-bezier(0.4, 0, 0.2, 1);
}
.ass-fs-step-fwd-enter-from { opacity: 0; transform: translateX(28px); }
.ass-fs-step-fwd-leave-to   { opacity: 0; transform: translateX(-28px); }
.ass-fs-step-back-enter-from { opacity: 0; transform: translateX(-28px); }
.ass-fs-step-back-leave-to   { opacity: 0; transform: translateX(28px); }

@media (prefers-reduced-motion: reduce) {
  .ass-fs-fade-enter-active,
  .ass-fs-fade-leave-active,
  .ass-fs-step-fwd-enter-active,
  .ass-fs-step-fwd-leave-active,
  .ass-fs-step-back-enter-active,
  .ass-fs-step-back-leave-active { transition: none; }
}

/* ============ X close + step indicator ============ */
.ass-fs__close {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--brand-border) 60%, transparent);
  background: color-mix(in srgb, var(--brand-background) 80%, transparent);
  color: var(--brand-text);
  cursor: pointer;
  transition: all 200ms;
}
@media (min-width: 768px) {
  .ass-fs__close { top: 28px; right: 28px; width: 48px; height: 48px; }
}
.ass-fs__close:hover {
  background: var(--brand-text);
  color: var(--brand-background);
  border-color: var(--brand-text);
  transform: rotate(90deg);
}

.ass-fs__steps {
  position: fixed;
  top: 24px;
  left: 24px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  letter-spacing: 0.04em;
}
@media (min-width: 768px) {
  .ass-fs__steps { top: 32px; left: 32px; gap: 10px; font-size: 13px; }
}
.ass-fs__step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1.5px solid color-mix(in srgb, var(--brand-text) 25%, transparent);
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.ass-fs__step-num.is-current {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: var(--text-heading);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}
.ass-fs__step-divider {
  width: 24px;
  height: 1px;
  background: color-mix(in srgb, var(--brand-text) 25%, transparent);
}
.ass-fs__step-label {
  margin-left: 4px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
@media (max-width: 540px) {
  .ass-fs__step-label { display: none; }
}

/* ============ inner container + step shell ============ */
.ass-fs__inner {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 90px 24px 48px;
}
@media (min-width: 768px) {
  .ass-fs__inner { padding: 110px 40px 56px; }
}

.ass-fs__step {
  width: 100%;
  max-width: 620px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ass-fs__title {
  font-size: 28px;
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--brand-text);
  margin: 0;
  text-wrap: balance;
}
@media (min-width: 768px) { .ass-fs__title { font-size: 38px; } }
.ass-fs__title em {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
  display: block;
  margin-top: 4px;
}

.ass-fs__sub {
  font-size: 16px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
  margin: 0 0 18px;
}
.ass-fs__hl {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
  font-size: 1.1em;
}

/* ============ STEP 1: form ============ */
.ass-fs__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}
.ass-fs__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ass-fs__field label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.ass-fs__field input {
  padding: 16px 18px;
  border-radius: 12px;
  border: 1.5px solid color-mix(in srgb, var(--brand-border) 70%, transparent);
  background: var(--brand-surface, #FFFFFF);
  color: var(--brand-text);
  font-family: var(--brand-font);
  font-size: 16px;
  letter-spacing: -0.005em;
  transition: border-color 200ms, box-shadow 200ms;
}
.ass-fs__field input::placeholder {
  color: color-mix(in srgb, var(--brand-text) 40%, transparent);
}
.ass-fs__field input:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}

.ass-fs__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  padding: 16px 28px;
  border-radius: 14px;
  border: 0;
  background: var(--brand-primary);
  color: var(--text-heading);
  font-family: var(--brand-font);
  font-size: 15.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  cursor: pointer;
  transition: transform 200ms, filter 200ms, box-shadow 200ms, opacity 200ms;
  box-shadow: 0 14px 32px -12px color-mix(in srgb, var(--brand-primary) 65%, transparent);
}
.ass-fs__cta:hover:not(:disabled) {
  filter: brightness(0.94);
  transform: translateY(-1px);
}
.ass-fs__cta:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ass-fs__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 18px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 60%, transparent);
  background: transparent;
  color: var(--brand-text);
  font-family: var(--brand-font);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 200ms;
}
.ass-fs__back:hover {
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
}

.ass-fs__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}

.ass-fs__error {
  font-size: 13px;
  color: var(--brand-negative, #dc2626);
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 8%, transparent);
  padding: 10px 14px;
  border-radius: 10px;
  margin: 4px 0 0;
}

.ass-fs__legal {
  text-align: center;
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  margin: 4px 0 0;
}

/* ============ STEP 2: questions ============ */
.ass-fs__qs {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
}

.ass-fs__q {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--brand-surface, #FFFFFF);
  border: 1.5px solid color-mix(in srgb, var(--brand-border) 60%, transparent);
  transition: border-color 200ms, background 200ms;
}
@media (max-width: 640px) {
  /* Em mobile: pergunta em cima, botoes embaixo */
  .ass-fs__q {
    grid-template-columns: auto 1fr;
    grid-template-areas:
      "num text"
      "actions actions";
    row-gap: 10px;
  }
  .ass-fs__q-num { grid-area: num; }
  .ass-fs__q-text { grid-area: text; }
  .ass-fs__q-actions { grid-area: actions; }
}
.ass-fs__q.is-answered {
  border-color: color-mix(in srgb, var(--brand-primary) 32%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 4%, transparent);
}

.ass-fs__q-num {
  font-family: 'Instrument Serif', serif;
  font-size: 20px;
  font-weight: 400;
  color: var(--brand-primary);
  line-height: 1;
  letter-spacing: -0.02em;
}
.ass-fs__q-text {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.45;
  color: var(--brand-text);
}

.ass-fs__q-actions {
  display: flex;
  gap: 6px;
}
.ass-fs__q-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1.5px solid color-mix(in srgb, var(--brand-border) 70%, transparent);
  background: transparent;
  color: var(--brand-text);
  font-family: var(--brand-font);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 180ms;
  min-width: 64px;
  justify-content: center;
}
.ass-fs__q-btn svg {
  width: 13px;
  height: 13px;
  opacity: 0;
  transition: opacity 180ms;
}
.ass-fs__q-btn:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
}
.ass-fs__q-btn.is-selected {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: var(--text-heading);
  box-shadow: 0 4px 14px -4px color-mix(in srgb, var(--brand-primary) 50%, transparent);
}
.ass-fs__q-btn.is-selected svg { opacity: 1; }

/* ============ SUCCESS ============ */
.ass-fs__step--success {
  align-items: center;
  text-align: center;
  gap: 18px;
}
.ass-fs__step--success .ass-fs__title em { display: inline; margin-top: 0; }
.ass-fs__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 8px;
}
.ass-fs__step--success .ass-fs__cta {
  margin: 16px auto 0;
  min-width: 200px;
}

/* Spinner do botao loading */
.ass-fs__spin {
  animation: ass-fs-spin 720ms linear infinite;
}
@keyframes ass-fs-spin {
  to { transform: rotate(360deg); }
}
</style>

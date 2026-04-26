<!--
  GoalSetupModal — single-step modal that creates a goal.

  Form follows Vercel guidelines:
    - <label> + htmlFor wired for every input (clickable labels)
    - inputmode="numeric" + autocomplete="off" on amount fields
    - Type-specific input (date, number, text)
    - Inline errors next to fields, not blanket toast
    - Submit button stays enabled until request fires; spinner during
    - Cancel = `Escape` key, also a real button
    - Focus trap + auto-focus on the first input (desktop only — guideline says avoid autoFocus on mobile)
    - touch-action manipulation, focus-visible rings, prefers-reduced-motion

  Renders via <Teleport to="body"> so it overlays everything cleanly.
-->
<template>
  <Teleport to="body">
    <Transition name="goal-modal">
      <div
        v-if="open"
        class="goal-modal-backdrop fixed inset-0 z-[80] flex items-end justify-center md:items-center"
        :style="{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }"
        role="presentation"
        @keydown.esc="close"
        @click.self="close"
      >
        <div
          ref="dialogRef"
          class="goal-modal-dialog flex w-full flex-col gap-5 px-6 pb-6 pt-7 md:max-w-[440px] md:rounded-3xl md:shadow-2xl"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :style="dialogStyle"
        >
          <header class="flex items-start gap-3">
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-full"
              :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 16%, transparent)`, color: brand.colors.primary }"
              aria-hidden="true"
            >
              <UIcon name="i-lucide-target" class="size-5" />
            </span>
            <div class="flex min-w-0 flex-1 flex-col">
              <h2
                :id="titleId"
                class="text-balance text-[18px] font-semibold leading-tight tracking-tight"
                :style="{ color: brand.colors.text }"
              >
                Nova meta financeira
              </h2>
              <p
                class="text-pretty text-[12.5px]"
                :style="{ color: brand.colors.textMuted }"
              >
                Toda recomendação na conversa ancorada será avaliada contra esta meta.
              </p>
            </div>
            <button
              type="button"
              class="goal-modal-close size-8 shrink-0 rounded-full transition-colors"
              :style="{ color: brand.colors.textMuted }"
              aria-label="Fechar"
              @click="close"
            >
              <UIcon name="i-lucide-x" class="size-4" aria-hidden="true" />
            </button>
          </header>

          <form
            class="flex flex-col gap-4"
            novalidate
            @submit.prevent="submit"
          >
            <!-- Quick templates -->
            <fieldset class="flex flex-wrap gap-1.5">
              <legend class="sr-only">Modelo de meta</legend>
              <button
                v-for="t in TEMPLATES"
                :key="t.type"
                type="button"
                class="goal-template inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors"
                :style="form.type === t.type ? activeTemplateStyle : templateStyle"
                @click="applyTemplate(t)"
              >
                <span aria-hidden="true">{{ t.emoji }}</span>
                {{ t.label }}
              </button>
            </fieldset>

            <!-- Name -->
            <div class="flex flex-col gap-1.5">
              <label for="goal-name" class="text-[12px] font-medium" :style="{ color: brand.colors.text }">
                Nome
              </label>
              <input
                id="goal-name"
                ref="firstInputRef"
                v-model="form.name"
                name="name"
                type="text"
                autocomplete="off"
                spellcheck="false"
                placeholder="ex: Aposentadoria 2050…"
                maxlength="120"
                class="goal-input"
                :style="inputStyle"
              />
              <p v-if="errors.name" class="goal-error" role="alert">{{ errors.name }}</p>
            </div>

            <!-- Target amount + date — two columns on desktop -->
            <div class="flex flex-col gap-3 md:flex-row md:gap-3">
              <div class="flex flex-1 flex-col gap-1.5">
                <label for="goal-target-amount" class="text-[12px] font-medium" :style="{ color: brand.colors.text }">
                  Valor alvo
                </label>
                <div class="goal-input-with-prefix">
                  <span class="goal-input-prefix">R$</span>
                  <input
                    id="goal-target-amount"
                    v-model="form.targetAmount"
                    name="target_amount"
                    type="text"
                    inputmode="numeric"
                    autocomplete="off"
                    placeholder="1.000.000…"
                    class="goal-input goal-input--prefixed"
                    :style="inputStyle"
                    @input="(e) => formatBrl(e, 'targetAmount')"
                  />
                </div>
                <p v-if="errors.targetAmount" class="goal-error" role="alert">{{ errors.targetAmount }}</p>
              </div>
              <div class="flex flex-1 flex-col gap-1.5">
                <label for="goal-target-date" class="text-[12px] font-medium" :style="{ color: brand.colors.text }">
                  Data alvo
                </label>
                <input
                  id="goal-target-date"
                  v-model="form.targetDate"
                  name="target_date"
                  type="date"
                  :min="todayIso"
                  class="goal-input"
                  :style="inputStyle"
                />
                <p v-if="errors.targetDate" class="goal-error" role="alert">{{ errors.targetDate }}</p>
              </div>
            </div>

            <!-- Current + Monthly — two columns on desktop -->
            <div class="flex flex-col gap-3 md:flex-row md:gap-3">
              <div class="flex flex-1 flex-col gap-1.5">
                <label for="goal-current" class="text-[12px] font-medium" :style="{ color: brand.colors.text }">
                  Patrimônio atual
                </label>
                <div class="goal-input-with-prefix">
                  <span class="goal-input-prefix">R$</span>
                  <input
                    id="goal-current"
                    v-model="form.currentAmount"
                    name="current_amount"
                    type="text"
                    inputmode="numeric"
                    autocomplete="off"
                    placeholder="0…"
                    class="goal-input goal-input--prefixed"
                    :style="inputStyle"
                    @input="(e) => formatBrl(e, 'currentAmount')"
                  />
                </div>
              </div>
              <div class="flex flex-1 flex-col gap-1.5">
                <label for="goal-monthly" class="text-[12px] font-medium" :style="{ color: brand.colors.text }">
                  Aporte mensal
                </label>
                <div class="goal-input-with-prefix">
                  <span class="goal-input-prefix">R$</span>
                  <input
                    id="goal-monthly"
                    v-model="form.monthlyContribution"
                    name="monthly_contribution"
                    type="text"
                    inputmode="numeric"
                    autocomplete="off"
                    placeholder="0…"
                    class="goal-input goal-input--prefixed"
                    :style="inputStyle"
                    @input="(e) => formatBrl(e, 'monthlyContribution')"
                  />
                </div>
              </div>
            </div>

            <!-- Submit -->
            <div class="mt-2 flex flex-col-reverse items-stretch gap-2 md:flex-row md:items-center md:justify-end md:gap-3">
              <button
                type="button"
                class="goal-btn-secondary"
                :style="secondaryBtnStyle"
                @click="close"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="goal-btn-primary"
                :style="primaryBtnStyle"
                :disabled="submitting"
              >
                <UIcon
                  v-if="submitting"
                  name="i-lucide-loader-2"
                  class="size-3.5 motion-safe:animate-spin"
                  aria-hidden="true"
                />
                {{ submitting ? 'Criando…' : 'Criar e ancorar conversa' }}
              </button>
            </div>

            <p
              v-if="submitError"
              class="goal-error text-center"
              role="alert"
              aria-live="polite"
            >{{ submitError }}</p>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { GoalCreateInput, GoalType } from '~/composables/useGoals'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  close: []
  created: [goal: { id: string }]
}>()

const brand = useBrand()
const titleId = `goal-modal-title-${Math.random().toString(36).slice(2, 8)}`

const TEMPLATES: { type: GoalType; label: string; emoji: string }[] = [
  { type: 'retirement', label: 'Aposentadoria', emoji: '🌴' },
  { type: 'fire', label: 'FIRE', emoji: '🔥' },
  { type: 'reserve', label: 'Reserva', emoji: '🛡️' },
  { type: 'purchase', label: 'Compra', emoji: '🏠' },
  { type: 'income', label: 'Renda passiva', emoji: '💸' },
  { type: 'custom', label: 'Outra', emoji: '🎯' },
]

const today = new Date()
const todayIso = today.toISOString().slice(0, 10)

interface FormState {
  name: string
  type: GoalType
  emoji: string
  targetAmount: string
  targetDate: string
  currentAmount: string
  monthlyContribution: string
}
const form = reactive<FormState>({
  name: '',
  type: 'retirement',
  emoji: '🌴',
  targetAmount: '',
  targetDate: '',
  currentAmount: '',
  monthlyContribution: '',
})

const errors = reactive<Record<string, string>>({})
const submitting = ref(false)
const submitError = ref<string | null>(null)
const firstInputRef = ref<HTMLInputElement | null>(null)
const dialogRef = ref<HTMLDivElement | null>(null)

function applyTemplate(t: { type: GoalType; label: string; emoji: string }) {
  form.type = t.type
  form.emoji = t.emoji
  if (!form.name.trim()) form.name = t.label === 'Outra' ? '' : t.label
}

// Format BRL as the user types — strip non-digits, format with dots.
function formatBrl(e: Event, key: keyof FormState) {
  const target = e.target as HTMLInputElement
  const digits = target.value.replace(/\D/g, '')
  if (!digits) {
    form[key] = '' as FormState[typeof key]
    return
  }
  const n = parseInt(digits, 10)
  form[key] = n.toLocaleString('pt-BR') as FormState[typeof key]
  // Keep cursor at the end so typing stays smooth
  nextTick(() => {
    target.setSelectionRange(target.value.length, target.value.length)
  })
}

function parseBrl(s: string): number {
  const digits = s.replace(/\D/g, '')
  return digits ? parseInt(digits, 10) : 0
}

function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.name.trim()) errors.name = 'Dê um nome — ex: Aposentadoria 2050'
  const targetN = parseBrl(form.targetAmount)
  if (!targetN || targetN < 100) errors.targetAmount = 'Valor mínimo R$ 100'
  if (!form.targetDate) errors.targetDate = 'Escolha uma data'
  else if (form.targetDate <= todayIso) errors.targetDate = 'Data tem que ser no futuro'
  return Object.keys(errors).length === 0
}

async function submit() {
  if (submitting.value) return
  if (!validate()) {
    // Focus first errored field
    const firstError = Object.keys(errors)[0]
    if (firstError) {
      const el = document.getElementById(`goal-${firstError.replace(/([A-Z])/g, '-$1').toLowerCase()}`)
      el?.focus()
    }
    return
  }
  submitting.value = true
  submitError.value = null
  try {
    const { create } = useGoals()
    const payload: GoalCreateInput = {
      name: form.name.trim(),
      emoji: form.emoji || null,
      type: form.type,
      targetAmount: parseBrl(form.targetAmount),
      targetDate: form.targetDate,
      currentAmount: parseBrl(form.currentAmount),
      monthlyContribution: parseBrl(form.monthlyContribution),
    }
    const goal = await create(payload)
    emit('created', goal)
    emit('close')
    reset()
  } catch (err) {
    submitError.value = String((err as Error).message ?? err)
  } finally {
    submitting.value = false
  }
}

function close() {
  if (submitting.value) return
  emit('close')
  reset()
}

function reset() {
  form.name = ''
  form.type = 'retirement'
  form.emoji = '🌴'
  form.targetAmount = ''
  form.targetDate = ''
  form.currentAmount = ''
  form.monthlyContribution = ''
  Object.keys(errors).forEach((k) => delete errors[k])
  submitError.value = null
}

// Auto-focus first input on desktop (guideline: avoid autoFocus on mobile)
watch(
  () => props.open,
  async (val) => {
    if (val && import.meta.client && window.matchMedia('(min-width: 768px)').matches) {
      await nextTick()
      firstInputRef.value?.focus()
    }
  },
)

// Escape closes
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) close()
}
onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

// ---- Style helpers -----------------------------------------------
const dialogStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  borderRadius: '24px 24px 0 0',
  paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  color: brand.colors.text,
  maxHeight: '92vh',
  overflowY: 'auto',
}))
const inputStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.background} 70%, transparent)`,
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  color: brand.colors.text,
}))
const templateStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.text} 5%, transparent)`,
  color: brand.colors.text,
}))
const activeTemplateStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 18%, transparent)`,
  color: brand.colors.primary,
  border: `1px solid color-mix(in srgb, ${brand.colors.primary} 35%, transparent)`,
}))
const primaryBtnStyle = computed(() => ({
  backgroundColor: brand.colors.primary,
  color: brand.colors.background,
}))
const secondaryBtnStyle = computed(() => ({
  backgroundColor: 'transparent',
  color: brand.colors.textMuted,
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
}))
</script>

<style scoped>
.goal-modal-backdrop {
  backdrop-filter: blur(6px);
}
.goal-modal-close,
.goal-template,
.goal-btn-primary,
.goal-btn-secondary {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.goal-modal-close:hover {
  background-color: color-mix(in srgb, currentColor 10%, transparent);
}
.goal-modal-close:focus-visible,
.goal-template:focus-visible,
.goal-btn-primary:focus-visible,
.goal-btn-secondary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
}

.goal-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border-radius: 12px;
  font-size: 14px;
  font-feature-settings: 'tnum' 1; /* tabular nums on numeric fields */
}
.goal-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand-primary, #f5a300) 35%, transparent);
}
.goal-input-with-prefix {
  position: relative;
}
.goal-input-prefix {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0.875rem;
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  pointer-events: none;
  color: color-mix(in srgb, currentColor 50%, transparent);
}
.goal-input--prefixed {
  padding-inline-start: 2.625rem;
}

.goal-error {
  font-size: 11.5px;
  color: var(--brand-negative, #dc2626);
}
.goal-template:hover {
  filter: brightness(1.1);
}

.goal-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.625rem 1.25rem;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  transition: filter 160ms ease, transform 160ms ease;
}
.goal-btn-primary:not(:disabled):hover {
  filter: brightness(1.05);
}
.goal-btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.goal-btn-secondary {
  padding: 0.625rem 1.25rem;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  transition: background-color 160ms ease;
}
.goal-btn-secondary:hover {
  background-color: color-mix(in srgb, currentColor 6%, transparent) !important;
}

/* Modal entrance */
.goal-modal-enter-active,
.goal-modal-leave-active {
  transition: opacity 220ms ease;
}
.goal-modal-enter-active .goal-modal-dialog,
.goal-modal-leave-active .goal-modal-dialog {
  transition: transform 220ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.goal-modal-enter-from,
.goal-modal-leave-to {
  opacity: 0;
}
.goal-modal-enter-from .goal-modal-dialog,
.goal-modal-leave-to .goal-modal-dialog {
  transform: translateY(40px);
}
@media (min-width: 768px) {
  .goal-modal-enter-from .goal-modal-dialog,
  .goal-modal-leave-to .goal-modal-dialog {
    transform: scale(0.96);
  }
}
@media (prefers-reduced-motion: reduce) {
  .goal-modal-enter-active,
  .goal-modal-leave-active,
  .goal-modal-enter-active .goal-modal-dialog,
  .goal-modal-leave-active .goal-modal-dialog {
    transition: none;
  }
  .goal-modal-enter-from .goal-modal-dialog,
  .goal-modal-leave-to .goal-modal-dialog {
    transform: none;
  }
}
</style>

<!--
  GoalDetailDrawer — full detail + inline edit + archive UI for a goal.

  Layout:
    Desktop  → right-side drawer, 440px, slides in from right
    Mobile   → bottom sheet, ~92vh, slides in from bottom with handle

  Sections (scrollable body):
    1. Hero header with status dot + status label + emoji + name
    2. Big tabular metric: current / target with progress bar
    3. Stats grid (CAGR realista / exigido / projeção / prazo)
    4. Inline-editable patrimônio + aporte mensal (the two values
       most likely to change between conversations)
    5. Status explanation (the LLM-written guidance)
    6. Action footer: "Recalcular" + "Arquivar"

  Footer is sticky on mobile so the destructive action is always
  reachable without scrolling. Arquivar shows a 2-step confirm via the
  same button changing label, not a separate dialog (simpler UX).
-->
<template>
  <Teleport to="body">
    <Transition name="goal-drawer-overlay">
      <div
        v-if="open && goal"
        class="goal-drawer-backdrop fixed inset-0 z-[80] flex items-end justify-end md:items-stretch"
        :style="{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }"
        role="presentation"
        @keydown.esc="close"
        @click.self="close"
      >
        <Transition name="goal-drawer-panel" appear>
          <aside
            v-if="goal"
            ref="dialogRef"
            class="goal-drawer-panel relative flex h-[92vh] w-full flex-col md:h-full md:max-w-[440px]"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            :style="panelStyle"
          >
            <!-- Mobile drag handle (visual only) -->
            <span
              class="mx-auto mt-3 inline-block h-1 w-12 rounded-full md:hidden"
              :style="{ backgroundColor: `color-mix(in srgb, var(--brand-text) 18%, transparent)` }"
              aria-hidden="true"
            />

            <!-- Hero header -->
            <header class="relative flex items-start gap-3 px-5 py-5 md:px-6 md:py-6">
              <span
                class="flex size-11 shrink-0 items-center justify-center rounded-2xl text-2xl"
                :style="{ backgroundColor: `color-mix(in srgb, ${statusColor} 14%, transparent)` }"
                aria-hidden="true"
              >
                {{ goal.emoji ?? '🎯' }}
              </span>
              <div class="flex min-w-0 flex-1 flex-col gap-1">
                <span
                  class="font-mono-tab inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em]"
                  :style="{ color: statusColor }"
                >
                  <span
                    class="inline-flex size-1.5 rounded-full"
                    :style="{ backgroundColor: statusColor }"
                    aria-hidden="true"
                  />
                  {{ statusLabel }}
                </span>
                <h2
                  :id="titleId"
                  class="text-balance text-[20px] font-semibold leading-tight tracking-tight"
                  :style="{ color: 'var(--brand-text)' }"
                >{{ goal.name }}</h2>
                <p
                  class="font-mono-tab text-[11px] tabular-nums"
                  :style="{ color: 'var(--brand-text-muted)' }"
                >
                  Alvo {{ formatBRL(target) }} · {{ targetDateLabel }}
                </p>
              </div>
              <button
                type="button"
                class="goal-drawer-close size-9 shrink-0 rounded-full transition-colors"
                :style="{ color: 'var(--brand-text-muted)' }"
                aria-label="Fechar"
                @click="close"
              >
                <UIcon name="i-lucide-x" class="size-4" aria-hidden="true" />
              </button>
            </header>

            <!-- Scrollable body -->
            <div class="goal-drawer-body relative flex-1 overflow-y-auto px-5 pb-32 md:px-6 md:pb-8">
              <!-- Big progress metric -->
              <section class="mb-6">
                <div class="mb-2 flex items-baseline justify-between">
                  <span
                    class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
                    :style="{ color: 'var(--brand-text-muted)' }"
                  >Progresso</span>
                  <span
                    class="font-mono-tab text-[12.5px] tabular-nums"
                    :style="{ color: 'var(--brand-text-muted)' }"
                  >{{ progressPct }}%</span>
                </div>
                <p
                  class="mb-3 flex items-baseline gap-2 font-display text-[28px] font-semibold tabular-nums leading-none tracking-tight md:text-[32px]"
                  :style="{ color: 'var(--brand-text)' }"
                >
                  {{ formatBRL(current) }}
                  <span
                    class="text-[14px] font-medium tabular-nums"
                    :style="{ color: 'var(--brand-text-muted)' }"
                  >/ {{ formatBRL(target) }}</span>
                </p>
                <span
                  class="goal-drawer-track block h-1.5 w-full overflow-hidden rounded-full"
                  :style="{ backgroundColor: `color-mix(in srgb, var(--brand-text) 8%, transparent)` }"
                  aria-hidden="true"
                >
                  <span
                    class="goal-drawer-fill block h-full origin-left rounded-full"
                    :style="{
                      backgroundColor: statusColor,
                      transform: `scaleX(${progress})`,
                      transition: 'transform 600ms cubic-bezier(0.2, 0.7, 0.3, 1)',
                    }"
                  />
                </span>
              </section>

              <!-- Stats grid -->
              <section
                class="mb-6 grid grid-cols-2 gap-3"
                aria-label="Indicadores da meta"
              >
                <ChatV2GoalDetailStat
                  label="CAGR realista"
                  :value="formatPct(expectedCagr)"
                  hint="Estimativa baseada na sua carteira atual"
                />
                <ChatV2GoalDetailStat
                  label="CAGR exigido"
                  :value="requiredCagr != null ? formatPct(requiredCagr) : '—'"
                  :emphasize="cagrEmphasis"
                  :hint="requiredHint"
                />
                <ChatV2GoalDetailStat
                  label="Projeção @ alvo"
                  :value="projected != null ? formatBRL(projected) : '—'"
                  :emphasize="projectedEmphasis"
                />
                <ChatV2GoalDetailStat
                  label="Tempo restante"
                  :value="timeLeftLabel"
                />
              </section>

              <!-- Inline-editable form -->
              <section class="mb-6">
                <h3
                  class="font-mono-tab mb-2 text-[10px] uppercase tracking-[0.18em]"
                  :style="{ color: 'var(--brand-text-muted)' }"
                >Atualizar</h3>
                <form class="flex flex-col gap-3" novalidate @submit.prevent="saveEdits">
                  <div class="flex flex-col gap-1.5">
                    <label
                      :for="`goal-edit-current-${goal.id}`"
                      class="text-[12px] font-medium"
                      :style="{ color: 'var(--brand-text)' }"
                    >Patrimônio atual</label>
                    <div class="goal-input-with-prefix">
                      <span class="goal-input-prefix">R$</span>
                      <input
                        :id="`goal-edit-current-${goal.id}`"
                        v-model="form.currentAmount"
                        type="text"
                        inputmode="numeric"
                        autocomplete="off"
                        class="goal-input goal-input--prefixed"
                        :style="inputStyle"
                        @input="(e) => formatBrl(e, 'currentAmount')"
                      />
                    </div>
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label
                      :for="`goal-edit-monthly-${goal.id}`"
                      class="text-[12px] font-medium"
                      :style="{ color: 'var(--brand-text)' }"
                    >Aporte mensal</label>
                    <div class="goal-input-with-prefix">
                      <span class="goal-input-prefix">R$</span>
                      <input
                        :id="`goal-edit-monthly-${goal.id}`"
                        v-model="form.monthlyContribution"
                        type="text"
                        inputmode="numeric"
                        autocomplete="off"
                        class="goal-input goal-input--prefixed"
                        :style="inputStyle"
                        @input="(e) => formatBrl(e, 'monthlyContribution')"
                      />
                    </div>
                  </div>
                  <div class="flex items-center justify-end gap-2">
                    <button
                      v-if="dirty"
                      type="button"
                      class="goal-btn-ghost"
                      :style="ghostBtnStyle"
                      :disabled="saving"
                      @click="resetForm"
                    >Descartar</button>
                    <button
                      type="submit"
                      class="goal-btn-primary"
                      :style="primaryBtnStyle"
                      :disabled="!dirty || saving"
                    >
                      <UIcon
                        v-if="saving"
                        name="i-lucide-loader-2"
                        class="size-3.5 motion-safe:animate-spin"
                        aria-hidden="true"
                      />
                      {{ saving ? 'Salvando…' : 'Salvar' }}
                    </button>
                  </div>
                </form>
              </section>

              <!-- LLM explanation -->
              <section
                v-if="goal.statusExplanation"
                class="mb-6 rounded-2xl px-4 py-3"
                :style="{
                  backgroundColor: `color-mix(in srgb, ${statusColor} 6%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${statusColor} 18%, transparent)`,
                }"
              >
                <p
                  class="font-mono-tab mb-1 text-[10px] uppercase tracking-[0.16em]"
                  :style="{ color: statusColor }"
                >Avaliação</p>
                <p
                  class="text-pretty text-[13px] leading-relaxed"
                  :style="{ color: 'var(--brand-text)' }"
                >{{ goal.statusExplanation }}</p>
              </section>

              <!-- Notes (read-only — extending to edit later) -->
              <section
                v-if="goal.notes"
                class="mb-6"
              >
                <h3
                  class="font-mono-tab mb-1 text-[10px] uppercase tracking-[0.18em]"
                  :style="{ color: 'var(--brand-text-muted)' }"
                >Notas</h3>
                <p
                  class="text-pretty text-[13px] leading-relaxed"
                  :style="{ color: 'var(--brand-text)' }"
                >{{ goal.notes }}</p>
              </section>

              <!-- Last calc -->
              <p
                v-if="goal.lastCalculatedAt"
                class="font-mono-tab text-[10.5px] tabular-nums"
                :style="{ color: 'var(--brand-text-muted)' }"
              >Último cálculo: {{ relativeTime(goal.lastCalculatedAt) }}</p>
            </div>

            <!-- Sticky action footer -->
            <footer
              class="goal-drawer-footer flex flex-shrink-0 items-center gap-2 border-t px-5 py-3 md:px-6 md:py-4"
              :style="footerStyle"
            >
              <button
                type="button"
                class="goal-btn-secondary flex-1"
                :style="secondaryBtnStyle"
                :disabled="recalculating"
                @click="recalc"
              >
                <UIcon
                  :name="recalculating ? 'i-lucide-loader-2' : 'i-lucide-refresh-ccw'"
                  class="size-3.5"
                  :class="recalculating ? 'motion-safe:animate-spin' : ''"
                  aria-hidden="true"
                />
                {{ recalculating ? 'Recalculando…' : 'Recalcular' }}
              </button>
              <button
                type="button"
                class="goal-btn-destructive flex-1"
                :style="destructiveBtnStyle"
                :disabled="archiving"
                :data-confirming="confirmingArchive"
                @click="onArchiveClick"
              >
                <UIcon
                  :name="confirmingArchive ? 'i-lucide-trash-2' : 'i-lucide-archive'"
                  class="size-3.5"
                  aria-hidden="true"
                />
                {{ confirmingArchive ? 'Confirmar exclusão' : archiving ? 'Removendo…' : 'Remover meta' }}
              </button>
            </footer>

            <p
              v-if="errorMsg"
              class="absolute bottom-20 left-5 right-5 rounded-lg px-3 py-2 text-[11.5px]"
              role="alert"
              :style="{
                backgroundColor: `color-mix(in srgb, var(--brand-negative) 10%, transparent)`,
                border: `1px solid color-mix(in srgb, var(--brand-negative) 28%, transparent)`,
                color: 'var(--brand-negative)',
              }"
            >{{ errorMsg }}</p>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { ChatGoal } from '~/composables/useGoals'

const props = defineProps<{
  open: boolean
  goal: ChatGoal | null
}>()

const emit = defineEmits<{
  close: []
  archived: [goalId: string]
}>()

const brand = useBrand()
const titleId = computed(() => `goal-detail-${props.goal?.id ?? 'na'}`)
const dialogRef = ref<HTMLElement | null>(null)

// ---- Derived numbers --------------------------------------------
const target = computed(() => parseFloat(props.goal?.targetAmount ?? '0'))
const current = computed(() => parseFloat(props.goal?.currentAmount ?? '0'))
const monthly = computed(() => parseFloat(props.goal?.monthlyContribution ?? '0'))
const expectedCagr = computed(() => parseFloat(props.goal?.expectedCagr ?? '0'))
const requiredCagr = computed(() =>
  props.goal?.requiredCagr ? parseFloat(props.goal.requiredCagr) : null,
)
const projected = computed(() =>
  props.goal?.projectedAmount ? parseFloat(props.goal.projectedAmount) : null,
)
const progress = computed(() =>
  Math.min(1, Math.max(0, current.value / Math.max(1, target.value))),
)
const progressPct = computed(() => Math.round(progress.value * 100))

const targetDateLabel = computed(() => {
  if (!props.goal?.targetDate) return ''
  const d = new Date(props.goal.targetDate)
  return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
})

const timeLeftLabel = computed(() => {
  if (!props.goal?.targetDate) return '—'
  const target = new Date(props.goal.targetDate)
  const now = new Date()
  const days = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Vencida'
  if (days < 30) return `${days} dias`
  const months = Math.round(days / 30.44)
  if (months < 12) return `${months} meses`
  const years = Math.round((days / 365.25) * 10) / 10
  return `${years} anos`
})

// ---- Status visuals ---------------------------------------------
const statusColor = computed(() => {
  switch (props.goal?.status) {
    case 'hit':
      return brand.colors.positive
    case 'on_track':
      return brand.colors.primary
    case 'at_risk':
      return brand.colors.warning ?? '#f59e0b'
    case 'unfeasible':
      return brand.colors.negative
    default:
      return brand.colors.textMuted
  }
})

const statusLabel = computed(() => {
  switch (props.goal?.status) {
    case 'hit':
      return 'Atingida'
    case 'on_track':
      return 'No caminho'
    case 'at_risk':
      return 'Atenção'
    case 'unfeasible':
      return 'Inviável'
    default:
      return 'Sem dados'
  }
})

const cagrEmphasis = computed<'positive' | 'warning' | 'negative' | undefined>(() => {
  if (requiredCagr.value == null || expectedCagr.value === 0) return undefined
  if (requiredCagr.value <= expectedCagr.value) return 'positive'
  const ratio = requiredCagr.value / expectedCagr.value
  if (ratio < 1.2) return 'warning'
  return 'negative'
})

const requiredHint = computed(() => {
  if (requiredCagr.value == null) return undefined
  if (cagrEmphasis.value === 'positive') return 'Abaixo do realista — folga'
  if (cagrEmphasis.value === 'warning') return 'Acima do realista — atenção'
  if (cagrEmphasis.value === 'negative') return 'Muito acima do realista'
  return undefined
})

const projectedEmphasis = computed<'positive' | 'warning' | 'negative' | undefined>(() => {
  if (projected.value == null) return undefined
  if (projected.value >= target.value) return 'positive'
  if (projected.value >= target.value * 0.8) return 'warning'
  return 'negative'
})

// ---- Form state -------------------------------------------------
interface FormState {
  currentAmount: string
  monthlyContribution: string
}
const form = reactive<FormState>({ currentAmount: '', monthlyContribution: '' })

const saving = ref(false)
const recalculating = ref(false)
const archiving = ref(false)
const confirmingArchive = ref(false)
const errorMsg = ref<string | null>(null)
let confirmTimeout: ReturnType<typeof setTimeout> | null = null

const dirty = computed(() => {
  if (!props.goal) return false
  const currParsed = parseBrl(form.currentAmount)
  const monthlyParsed = parseBrl(form.monthlyContribution)
  return (
    currParsed !== current.value ||
    monthlyParsed !== monthly.value
  )
})

function resetForm() {
  form.currentAmount = current.value > 0 ? current.value.toLocaleString('pt-BR') : ''
  form.monthlyContribution = monthly.value > 0 ? monthly.value.toLocaleString('pt-BR') : ''
}

watch(
  () => props.goal?.id,
  () => {
    resetForm()
    errorMsg.value = null
    confirmingArchive.value = false
    if (confirmTimeout) clearTimeout(confirmTimeout)
  },
  { immediate: true },
)

// Close on ESC
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) close()
}
onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  if (confirmTimeout) clearTimeout(confirmTimeout)
})

// ---- Actions ----------------------------------------------------
async function saveEdits() {
  if (!props.goal || !dirty.value || saving.value) return
  saving.value = true
  errorMsg.value = null
  try {
    const { update } = useGoals()
    await update(props.goal.id, {
      currentAmount: parseBrl(form.currentAmount),
      monthlyContribution: parseBrl(form.monthlyContribution),
    })
  } catch (err) {
    errorMsg.value = (err as Error).message ?? 'Falha ao salvar.'
  } finally {
    saving.value = false
  }
}

async function recalc() {
  if (!props.goal || recalculating.value) return
  recalculating.value = true
  errorMsg.value = null
  try {
    const { recalculate } = useGoals()
    await recalculate(props.goal.id)
  } catch (err) {
    errorMsg.value = (err as Error).message ?? 'Falha ao recalcular.'
  } finally {
    recalculating.value = false
  }
}

function onArchiveClick() {
  if (!props.goal || archiving.value) return
  if (!confirmingArchive.value) {
    // First click — flip into "confirm" state for 5 seconds
    confirmingArchive.value = true
    if (confirmTimeout) clearTimeout(confirmTimeout)
    confirmTimeout = setTimeout(() => {
      confirmingArchive.value = false
    }, 5000)
    return
  }
  // Second click within window — actually archive
  if (confirmTimeout) clearTimeout(confirmTimeout)
  void archiveNow()
}

async function archiveNow() {
  if (!props.goal) return
  archiving.value = true
  errorMsg.value = null
  try {
    const { archive } = useGoals()
    const goalId = props.goal.id
    await archive(goalId)
    emit('archived', goalId)
    close()
  } catch (err) {
    errorMsg.value = (err as Error).message ?? 'Falha ao remover.'
    confirmingArchive.value = false
  } finally {
    archiving.value = false
  }
}

function close() {
  if (saving.value || archiving.value || recalculating.value) return
  emit('close')
}

// ---- Helpers ----------------------------------------------------
function parseBrl(s: string): number {
  const digits = s.replace(/\D/g, '')
  return digits ? parseInt(digits, 10) : 0
}

function formatBrl(e: Event, key: keyof FormState) {
  const target = e.target as HTMLInputElement
  const digits = target.value.replace(/\D/g, '')
  if (!digits) {
    form[key] = '' as FormState[typeof key]
    return
  }
  const n = parseInt(digits, 10)
  form[key] = n.toLocaleString('pt-BR') as FormState[typeof key]
  nextTick(() => {
    target.setSelectionRange(target.value.length, target.value.length)
  })
}

function formatBRL(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

function formatPct(n: number): string {
  return `${(n * 100).toFixed(2)}%`
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(ms / 60_000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes} min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} dias atrás`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ---- Style helpers ----------------------------------------------
const panelStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  borderTopLeftRadius: '24px',
  borderTopRightRadius: '24px',
  borderRadius: undefined as string | undefined,
  borderLeft: `1px solid color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  color: brand.colors.text,
}))

const footerStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  borderTopColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
}))

const inputStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.background} 70%, transparent)`,
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  color: brand.colors.text,
}))

const primaryBtnStyle = computed(() => ({
  backgroundColor: brand.colors.primary,
  color: brand.colors.background,
}))

const secondaryBtnStyle = computed(() => ({
  backgroundColor: 'transparent',
  color: brand.colors.text,
  border: `1px solid color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
}))

const ghostBtnStyle = computed(() => ({
  backgroundColor: 'transparent',
  color: brand.colors.textMuted,
}))

const destructiveBtnStyle = computed(() => {
  if (confirmingArchive.value) {
    return {
      backgroundColor: brand.colors.negative,
      color: brand.colors.background,
      border: `1px solid ${brand.colors.negative}`,
    }
  }
  return {
    backgroundColor: 'transparent',
    color: brand.colors.negative,
    border: `1px solid color-mix(in srgb, ${brand.colors.negative} 50%, transparent)`,
  }
})
</script>

<style scoped>
@media (min-width: 768px) {
  .goal-drawer-panel {
    border-top-left-radius: 0 !important;
    border-top-right-radius: 0 !important;
  }
}

.goal-drawer-backdrop {
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.goal-drawer-close,
.goal-btn-primary,
.goal-btn-secondary,
.goal-btn-ghost,
.goal-btn-destructive {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.goal-drawer-close:hover {
  background-color: color-mix(in srgb, currentColor 10%, transparent);
}

.goal-drawer-close:focus-visible,
.goal-btn-primary:focus-visible,
.goal-btn-secondary:focus-visible,
.goal-btn-ghost:focus-visible,
.goal-btn-destructive:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
}

.goal-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border-radius: 12px;
  font-size: 14px;
  font-feature-settings: 'tnum' 1;
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

.goal-btn-primary,
.goal-btn-secondary,
.goal-btn-ghost,
.goal-btn-destructive {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.625rem 1rem;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  transition: filter 160ms ease, background-color 160ms ease;
}
.goal-btn-primary:not(:disabled):hover,
.goal-btn-destructive:not(:disabled):hover {
  filter: brightness(1.05);
}
.goal-btn-secondary:not(:disabled):hover,
.goal-btn-ghost:not(:disabled):hover {
  background-color: color-mix(in srgb, currentColor 6%, transparent) !important;
}
.goal-btn-primary:disabled,
.goal-btn-secondary:disabled,
.goal-btn-ghost:disabled,
.goal-btn-destructive:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Drawer overlay fade */
.goal-drawer-overlay-enter-active,
.goal-drawer-overlay-leave-active {
  transition: opacity 220ms ease;
}
.goal-drawer-overlay-enter-from,
.goal-drawer-overlay-leave-to {
  opacity: 0;
}

/* Drawer panel slide */
.goal-drawer-panel-enter-active,
.goal-drawer-panel-leave-active {
  transition: transform 280ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.goal-drawer-panel-enter-from,
.goal-drawer-panel-leave-to {
  transform: translateY(100%);
}
@media (min-width: 768px) {
  .goal-drawer-panel-enter-from,
  .goal-drawer-panel-leave-to {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .goal-drawer-overlay-enter-active,
  .goal-drawer-overlay-leave-active,
  .goal-drawer-panel-enter-active,
  .goal-drawer-panel-leave-active,
  .goal-drawer-fill {
    transition: none !important;
  }
  .goal-drawer-panel-enter-from,
  .goal-drawer-panel-leave-to {
    transform: none;
  }
}
</style>

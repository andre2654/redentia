<!--
  DecisionDetailDrawer — full detail / journal entry view for one
  decision. Mirrors GoalDetailDrawer's chrome (right-side drawer
  desktop / bottom sheet mobile, blurred backdrop, ESC closes,
  prefers-reduced-motion honored) so the chat has a single visual
  vocabulary for "open thing".

  Sections:
    1. Hero — type icon + label + ticker + status pill + status timestamp
    2. Snapshot row — preço/qty/total/trigger condition tabular-nums
    3. Tese + Invalidador (highlight blocks with semantic borders)
    4. Reviews timeline (revisitas auto-geradas + outcome do user)
    5. Macro snapshot at create-time (read-only audit info)
    6. Sticky footer:
        - Ir para a conversa (primary, when there's a sourceSession)
        - Marcar resultado (when status='accepted', cycles outcome)
        - Remover (2-step confirm in red)
-->
<template>
  <Teleport to="body">
    <Transition name="dec-drawer-overlay">
      <div
        v-if="open && decision"
        class="dec-drawer-backdrop fixed inset-0 z-[80] flex items-end justify-end md:items-stretch"
        :style="{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }"
        role="presentation"
        @keydown.esc="close"
        @click.self="close"
      >
        <Transition name="dec-drawer-panel" appear>
          <aside
            v-if="decision"
            class="dec-drawer-panel relative flex h-[92vh] w-full flex-col md:h-full md:max-w-[460px]"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            :style="panelStyle"
          >
            <!-- Mobile drag handle -->
            <span
              class="mx-auto mt-3 inline-block h-1 w-12 rounded-full md:hidden"
              :style="{ backgroundColor: `color-mix(in srgb, var(--brand-text) 18%, transparent)` }"
              aria-hidden="true"
            />

            <!-- Hero header -->
            <header class="relative flex items-start gap-3 px-5 py-5 md:px-6 md:py-6">
              <span
                class="flex size-11 shrink-0 items-center justify-center rounded-2xl"
                :style="{
                  backgroundColor: `color-mix(in srgb, ${typeColor} 14%, transparent)`,
                  color: typeColor,
                }"
                aria-hidden="true"
              >
                <UIcon :name="typeIcon" class="size-5" />
              </span>
              <div class="flex min-w-0 flex-1 flex-col gap-1">
                <span
                  class="font-mono-tab inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em]"
                  :style="{ color: typeColor }"
                >
                  <span
                    class="inline-flex size-1.5 rounded-full"
                    :style="{ backgroundColor: typeColor }"
                    aria-hidden="true"
                  />
                  {{ typeLabel }}
                  <span
                    v-if="statusLabel"
                    class="font-mono-tab ml-1 inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] tracking-[0.14em]"
                    :style="statusPillStyle"
                  >· {{ statusLabel }}</span>
                </span>
                <h2
                  :id="titleId"
                  class="text-balance text-[20px] font-semibold leading-tight tracking-tight"
                  :style="{ color: 'var(--brand-text)' }"
                >
                  <span v-if="decision.ticker" class="tabular-nums">{{ decision.ticker }}</span>
                  <span v-else>{{ typeLabel }}</span>
                </h2>
                <p
                  v-if="snapshotSubtext"
                  class="font-mono-tab text-[11px] tabular-nums"
                  :style="{ color: 'var(--brand-text-muted)' }"
                >{{ snapshotSubtext }}</p>
              </div>
              <button
                type="button"
                class="dec-drawer-close size-9 shrink-0 rounded-full transition-colors"
                :style="{ color: 'var(--brand-text-muted)' }"
                aria-label="Fechar"
                @click="close"
              >
                <UIcon name="i-lucide-x" class="size-4" aria-hidden="true" />
              </button>
            </header>

            <!-- Scrollable body -->
            <div class="dec-drawer-body relative flex-1 overflow-y-auto px-5 pb-32 md:px-6 md:pb-8">
              <!-- Tese + Invalidador -->
              <section class="mb-5 flex flex-col gap-3">
                <div
                  class="rounded-2xl px-4 py-3"
                  :style="{
                    backgroundColor: `color-mix(in srgb, var(--brand-primary) 6%, transparent)`,
                    border: `1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent)`,
                  }"
                >
                  <p
                    class="font-mono-tab mb-1 text-[10px] uppercase tracking-[0.16em]"
                    :style="{ color: 'var(--brand-primary)' }"
                  >Tese</p>
                  <p
                    class="text-pretty text-[13px] leading-relaxed"
                    :style="{ color: 'var(--brand-text)' }"
                  >{{ decision.thesis }}</p>
                </div>
                <div
                  v-if="decision.invalidator"
                  class="rounded-2xl px-4 py-3"
                  :style="{
                    backgroundColor: `color-mix(in srgb, ${brand.colors.warning ?? '#f59e0b'} 6%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${brand.colors.warning ?? '#f59e0b'} 18%, transparent)`,
                  }"
                >
                  <p
                    class="font-mono-tab mb-1 text-[10px] uppercase tracking-[0.16em]"
                    :style="{ color: brand.colors.warning ?? '#f59e0b' }"
                  >Invalidador</p>
                  <p
                    class="text-pretty text-[13px] leading-relaxed"
                    :style="{ color: 'var(--brand-text)' }"
                  >{{ decision.invalidator }}</p>
                </div>
                <div
                  v-if="decision.triggerCondition"
                  class="rounded-2xl px-4 py-3"
                  :style="{
                    backgroundColor: `color-mix(in srgb, var(--brand-text) 4%, transparent)`,
                    border: `1px solid color-mix(in srgb, var(--brand-border) 50%, transparent)`,
                  }"
                >
                  <p
                    class="font-mono-tab mb-1 text-[10px] uppercase tracking-[0.16em]"
                    :style="{ color: 'var(--brand-text-muted)' }"
                  >Gatilho</p>
                  <p
                    class="text-pretty text-[13px] leading-relaxed"
                    :style="{ color: 'var(--brand-text)' }"
                  >{{ decision.triggerCondition }}</p>
                </div>
              </section>

              <!-- Snapshot grid -->
              <section
                v-if="hasSnapshotGrid"
                class="mb-5 grid grid-cols-2 gap-3"
                aria-label="Detalhes da operação"
              >
                <ChatV2GoalDetailStat
                  v-if="decision.targetAmount"
                  label="Valor"
                  :value="formatBRL(parseFloat(decision.targetAmount))"
                />
                <ChatV2GoalDetailStat
                  v-if="decision.targetPrice"
                  label="Preço alvo"
                  :value="`R$ ${parseFloat(decision.targetPrice).toFixed(2)}`"
                />
                <ChatV2GoalDetailStat
                  v-if="decision.targetQty"
                  label="Quantidade"
                  :value="parseFloat(decision.targetQty).toLocaleString('pt-BR')"
                />
                <ChatV2GoalDetailStat
                  v-if="decision.snapshotPriceAtCreate"
                  label="Preço na decisão"
                  :value="`R$ ${parseFloat(decision.snapshotPriceAtCreate).toFixed(2)}`"
                  :hint="snapshotMacroHint"
                />
              </section>

              <!-- Revisitas -->
              <section
                v-if="reviews.length > 0 || (decision.scheduledReviews && decision.scheduledReviews.length > 0)"
                class="mb-5"
              >
                <h3
                  class="font-mono-tab mb-2 text-[10px] uppercase tracking-[0.18em]"
                  :style="{ color: 'var(--brand-text-muted)' }"
                >Revisitas</h3>
                <ol class="flex flex-col gap-3">
                  <li
                    v-for="r in reviews"
                    :key="r.at"
                    class="rounded-2xl px-4 py-3"
                    :style="{
                      backgroundColor: `color-mix(in srgb, var(--brand-surface) 50%, transparent)`,
                      border: `1px solid color-mix(in srgb, var(--brand-border) 40%, transparent)`,
                    }"
                  >
                    <p
                      class="font-mono-tab mb-1 text-[10px] uppercase tracking-[0.16em]"
                      :style="{ color: 'var(--brand-text-muted)' }"
                    >{{ formatDate(r.at) }}</p>
                    <p
                      class="text-pretty text-[12.5px] leading-relaxed"
                      :style="{ color: 'var(--brand-text)' }"
                    >{{ r.ai_summary }}</p>
                  </li>
                  <li
                    v-for="d in upcomingReviews"
                    :key="d"
                    class="flex items-center gap-2 rounded-2xl px-4 py-2"
                    :style="{
                      backgroundColor: 'transparent',
                      border: `1px dashed color-mix(in srgb, var(--brand-border) 50%, transparent)`,
                    }"
                  >
                    <UIcon
                      name="i-lucide-calendar-clock"
                      class="size-3.5 shrink-0"
                      :style="{ color: 'var(--brand-text-muted)' }"
                      aria-hidden="true"
                    />
                    <p
                      class="font-mono-tab text-[10.5px] tabular-nums"
                      :style="{ color: 'var(--brand-text-muted)' }"
                    >Revisita programada · {{ formatDate(d) }} ({{ daysUntil(d) }})</p>
                  </li>
                </ol>
              </section>

              <!-- Outcome (if reviewed) -->
              <section
                v-if="decision.outcome"
                class="mb-5 rounded-2xl px-4 py-3"
                :style="outcomeStyle"
              >
                <p
                  class="font-mono-tab mb-1 text-[10px] uppercase tracking-[0.16em]"
                  :style="{ color: outcomeColor }"
                >Resultado · {{ outcomeLabel }}</p>
                <p
                  v-if="decision.outcomeNotes"
                  class="text-pretty text-[12.5px] leading-relaxed"
                  :style="{ color: 'var(--brand-text)' }"
                >{{ decision.outcomeNotes }}</p>
              </section>

              <!-- Audit trail -->
              <p
                class="font-mono-tab text-[10.5px] tabular-nums"
                :style="{ color: 'var(--brand-text-muted)' }"
              >
                Registrada {{ formatDate(decision.createdAt) }}
                <template v-if="decision.executionDate">· executada {{ formatDate(decision.executionDate) }}</template>
                <template v-if="decision.viaCopilot"> · via copiloto</template>
              </p>
            </div>

            <!-- Sticky action footer -->
            <footer
              class="dec-drawer-footer flex flex-shrink-0 items-center gap-2 border-t px-5 py-3 md:px-6 md:py-4"
              :style="footerStyle"
            >
              <button
                v-if="decision.sessionId"
                type="button"
                class="dec-btn-primary flex-1"
                :style="primaryBtnStyle"
                :disabled="busy"
                @click="goToSession"
              >
                <UIcon name="i-lucide-message-square" class="size-3.5" aria-hidden="true" />
                Abrir conversa
              </button>
              <button
                v-if="decision.status === 'pending' || decision.status === 'accepted'"
                type="button"
                class="dec-btn-secondary"
                :style="secondaryBtnStyle"
                :disabled="busy"
                @click="markExecuted"
              >
                <UIcon name="i-lucide-check-check" class="size-3.5" aria-hidden="true" />
                {{ markBusy ? 'Marcando…' : 'Executei' }}
              </button>
              <button
                type="button"
                class="dec-btn-destructive"
                :style="destructiveBtnStyle"
                :disabled="busy"
                :data-confirming="confirmingRemove"
                @click="onRemoveClick"
              >
                <UIcon
                  :name="confirmingRemove ? 'i-lucide-trash-2' : 'i-lucide-trash'"
                  class="size-3.5"
                  aria-hidden="true"
                />
                {{ confirmingRemove ? 'Confirmar' : 'Remover' }}
              </button>
            </footer>

            <p
              v-if="errorMsg"
              class="absolute bottom-20 left-5 right-5 rounded-lg px-3 py-2 text-[11.5px]"
              role="alert"
              :style="{
                backgroundColor: `color-mix(in srgb, ${brand.colors.negative} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${brand.colors.negative} 28%, transparent)`,
                color: brand.colors.negative,
              }"
            >{{ errorMsg }}</p>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { ChatDecision, DecisionType } from '~/composables/useDecisions'

const props = defineProps<{
  open: boolean
  decision: ChatDecision | null
}>()

const emit = defineEmits<{
  close: []
  removed: [decisionId: string]
  'go-to-session': [sessionId: string]
}>()

const brand = useBrand()
const titleId = computed(() => `dec-detail-${props.decision?.id ?? 'na'}`)

const busy = ref(false)
const markBusy = ref(false)
const removing = ref(false)
const confirmingRemove = ref(false)
const errorMsg = ref<string | null>(null)
let confirmTimeout: ReturnType<typeof setTimeout> | null = null

// ---- Type metadata --------------------------------------------------
const TYPE_META: Record<DecisionType, { label: string; icon: string; tone: 'positive' | 'negative' | 'primary' | 'muted' }> = {
  buy: { label: 'Comprar', icon: 'i-lucide-trending-up', tone: 'positive' },
  sell: { label: 'Vender', icon: 'i-lucide-trending-down', tone: 'negative' },
  rebalance: { label: 'Rebalancear', icon: 'i-lucide-shuffle', tone: 'primary' },
  hold: { label: 'Manter', icon: 'i-lucide-pause', tone: 'muted' },
  allocate: { label: 'Alocar', icon: 'i-lucide-pie-chart', tone: 'primary' },
}
const meta = computed(() => (props.decision ? TYPE_META[props.decision.type] : TYPE_META.allocate))
const typeLabel = computed(() => meta.value.label)
const typeIcon = computed(() => meta.value.icon)
const typeColor = computed(() => {
  switch (meta.value.tone) {
    case 'positive':
      return brand.colors.positive
    case 'negative':
      return brand.colors.negative
    case 'primary':
      return brand.colors.primary
    default:
      return brand.colors.textMuted
  }
})

// ---- Status pill ----------------------------------------------------
const statusLabel = computed(() => {
  switch (props.decision?.status) {
    case 'pending':
      return 'aguardando aceite'
    case 'accepted':
      return 'aceita'
    case 'executed':
      return 'executada'
    case 'cancelled':
      return 'cancelada'
    case 'reviewed':
      return 'revisada'
    case 'expired':
      return 'expirada'
    default:
      return null
  }
})
const statusPillColor = computed(() => {
  switch (props.decision?.status) {
    case 'pending':
      return brand.colors.warning ?? '#f59e0b'
    case 'accepted':
    case 'executed':
      return brand.colors.positive
    case 'cancelled':
    case 'expired':
      return brand.colors.textMuted
    case 'reviewed':
      return brand.colors.primary
    default:
      return brand.colors.textMuted
  }
})
const statusPillStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${statusPillColor.value} 14%, transparent)`,
  color: statusPillColor.value,
}))

// ---- Subtext (snapshot summary) -------------------------------------
const snapshotSubtext = computed(() => {
  if (!props.decision) return null
  const parts: string[] = []
  if (props.decision.targetAmount)
    parts.push(formatBRL(parseFloat(props.decision.targetAmount)))
  if (props.decision.targetPrice)
    parts.push(`@ R$ ${parseFloat(props.decision.targetPrice).toFixed(2)}`)
  if (props.decision.targetQty && !props.decision.targetAmount)
    parts.push(`${parseFloat(props.decision.targetQty).toLocaleString('pt-BR')} cotas`)
  return parts.join(' ')
})

const hasSnapshotGrid = computed(() => {
  if (!props.decision) return false
  return Boolean(
    props.decision.targetAmount ||
      props.decision.targetPrice ||
      props.decision.targetQty ||
      props.decision.snapshotPriceAtCreate,
  )
})

const snapshotMacroHint = computed(() => {
  if (!props.decision?.snapshotMacro) return undefined
  const m = props.decision.snapshotMacro as { selic?: number; ipca12m?: number }
  const parts: string[] = []
  if (m.selic != null) parts.push(`Selic ${(m.selic * 100).toFixed(2)}%`)
  if (m.ipca12m != null) parts.push(`IPCA ${(m.ipca12m * 100).toFixed(2)}%`)
  return parts.join(' · ') || undefined
})

// ---- Reviews --------------------------------------------------------
const reviews = computed(() => props.decision?.reviews ?? [])
const upcomingReviews = computed(() => {
  if (!props.decision?.scheduledReviews) return []
  const now = Date.now()
  return props.decision.scheduledReviews.filter((iso) => new Date(iso).getTime() > now)
})

// ---- Outcome --------------------------------------------------------
const outcomeColor = computed(() => {
  switch (props.decision?.outcome) {
    case 'confirmed':
      return brand.colors.positive
    case 'wrong':
      return brand.colors.negative
    case 'partial':
      return brand.colors.warning ?? '#f59e0b'
    case 'open':
      return brand.colors.textMuted
    default:
      return brand.colors.textMuted
  }
})
const outcomeStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${outcomeColor.value} 6%, transparent)`,
  border: `1px solid color-mix(in srgb, ${outcomeColor.value} 22%, transparent)`,
}))
const outcomeLabel = computed(() => {
  switch (props.decision?.outcome) {
    case 'confirmed':
      return 'Tese confirmada'
    case 'wrong':
      return 'Tese errada'
    case 'partial':
      return 'Parcialmente certa'
    case 'open':
      return 'Inconclusivo'
    default:
      return ''
  }
})

// ---- Style helpers --------------------------------------------------
const panelStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  borderTopLeftRadius: '24px',
  borderTopRightRadius: '24px',
  borderLeft: `1px solid color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  color: brand.colors.text,
}))
const footerStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  borderTopColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
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
const destructiveBtnStyle = computed(() => {
  if (confirmingRemove.value) {
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

// ---- Actions --------------------------------------------------------
async function markExecuted() {
  if (!props.decision || markBusy.value) return
  markBusy.value = true
  busy.value = true
  errorMsg.value = null
  try {
    const { setStatus } = useDecisions()
    await setStatus(props.decision.id, 'executed', new Date().toISOString().slice(0, 10))
  } catch (err) {
    errorMsg.value = (err as Error).message ?? 'Falha ao marcar.'
  } finally {
    markBusy.value = false
    busy.value = false
  }
}

function goToSession() {
  if (!props.decision?.sessionId) return
  emit('go-to-session', props.decision.sessionId)
  emit('close')
}

function onRemoveClick() {
  if (!props.decision || removing.value) return
  if (!confirmingRemove.value) {
    confirmingRemove.value = true
    if (confirmTimeout) clearTimeout(confirmTimeout)
    confirmTimeout = setTimeout(() => {
      confirmingRemove.value = false
    }, 5000)
    return
  }
  if (confirmTimeout) clearTimeout(confirmTimeout)
  void removeNow()
}

async function removeNow() {
  if (!props.decision) return
  removing.value = true
  busy.value = true
  errorMsg.value = null
  try {
    const { remove } = useDecisions()
    const id = props.decision.id
    await remove(id)
    emit('removed', id)
    close()
  } catch (err) {
    errorMsg.value = (err as Error).message ?? 'Falha ao remover.'
    confirmingRemove.value = false
  } finally {
    removing.value = false
    busy.value = false
  }
}

function close() {
  if (busy.value) return
  emit('close')
}

// ---- Helpers --------------------------------------------------------
function formatBRL(n: number): string {
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysUntil(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now()
  const days = Math.round(ms / (1000 * 60 * 60 * 24))
  if (days < 0) return `há ${-days} dias`
  if (days === 0) return 'hoje'
  return `em ${days} dias`
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) close()
}
onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  if (confirmTimeout) clearTimeout(confirmTimeout)
})
</script>

<style scoped>
@media (min-width: 768px) {
  .dec-drawer-panel {
    border-top-left-radius: 0 !important;
    border-top-right-radius: 0 !important;
  }
}

.dec-drawer-backdrop {
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.dec-drawer-close,
.dec-btn-primary,
.dec-btn-secondary,
.dec-btn-destructive {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.dec-drawer-close:hover {
  background-color: color-mix(in srgb, currentColor 10%, transparent);
}

.dec-drawer-close:focus-visible,
.dec-btn-primary:focus-visible,
.dec-btn-secondary:focus-visible,
.dec-btn-destructive:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
}

.dec-btn-primary,
.dec-btn-secondary,
.dec-btn-destructive {
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
.dec-btn-primary:not(:disabled):hover,
.dec-btn-destructive:not(:disabled):hover {
  filter: brightness(1.05);
}
.dec-btn-secondary:not(:disabled):hover {
  background-color: color-mix(in srgb, currentColor 6%, transparent) !important;
}
.dec-btn-primary:disabled,
.dec-btn-secondary:disabled,
.dec-btn-destructive:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Drawer transitions — same vocabulary as GoalDetailDrawer */
.dec-drawer-overlay-enter-active,
.dec-drawer-overlay-leave-active {
  transition: opacity 220ms ease;
}
.dec-drawer-overlay-enter-from,
.dec-drawer-overlay-leave-to {
  opacity: 0;
}
.dec-drawer-panel-enter-active,
.dec-drawer-panel-leave-active {
  transition: transform 280ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.dec-drawer-panel-enter-from,
.dec-drawer-panel-leave-to {
  transform: translateY(100%);
}
@media (min-width: 768px) {
  .dec-drawer-panel-enter-from,
  .dec-drawer-panel-leave-to {
    transform: translateX(100%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .dec-drawer-overlay-enter-active,
  .dec-drawer-overlay-leave-active,
  .dec-drawer-panel-enter-active,
  .dec-drawer-panel-leave-active {
    transition: none !important;
  }
  .dec-drawer-panel-enter-from,
  .dec-drawer-panel-leave-to {
    transform: none;
  }
}
</style>

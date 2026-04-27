<!--
  NotificationsDrawer — dedicated surface for fired alerts.

  Layout (mirrors GoalDetailDrawer / PanelDrawer):
    Desktop  → right-side drawer, 420px, slides in from right
    Mobile   → bottom sheet, ~92vh, slides in from bottom

  Two states:
    1. Empty   — illustration + "Sem alertas. Adicione condições à sua
                  watchlist para começar a receber notificações."
    2. Loaded  — list of alerts grouped by day (Hoje / Ontem / mais
                 antigos), each with severity dot + title + body +
                 ticker chip + relative time + dismiss button.

  Header has a "Limpar tudo" affordance that fires the `dismissAll`
  action on the alerts store. Dismissing a single alert removes it
  from the list with optimistic update.

  Click on an alert (not the dismiss button) routes:
    - has sessionId → jump to that session
    - has ticker but no sessionId → open new turn referencing the
      ticker so the agent can pick up the thread
    - else → mark as read only

  Auto-mark-read on mount: any alert that's still unread when the
  drawer opens gets `markRead()` called in the background (silent)
  so the bell badge clears once the user has actually SEEN them.
  Dismiss is still a separate explicit action.
-->
<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="notifications-mount fixed inset-0 z-[80]"
      @keydown.esc="onCloseRequest"
    >
      <button
        type="button"
        class="notifications-backdrop fixed inset-0 transition-opacity duration-200"
        :style="{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: backdropMounted ? 1 : 0,
          pointerEvents: openGuard ? 'none' : 'auto',
        }"
        aria-label="Fechar notificações"
        tabindex="-1"
        @click="onCloseRequest"
      />
      <aside
        ref="dialogRef"
        class="notifications-panel fixed bottom-0 right-0 top-auto flex h-[92vh] w-full flex-col transition-transform duration-300 md:bottom-auto md:top-0 md:h-full md:max-w-[420px]"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :style="{
          ...panelStyle,
          transform: panelMounted ? 'translateY(0) translateX(0)' : panelOffsetTransform,
        }"
        tabindex="-1"
        @click.stop
      >
        <!-- Mobile drag handle -->
        <span
          class="mx-auto mt-3 inline-block h-1 w-12 rounded-full md:hidden"
          :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 18%, transparent)` }"
          aria-hidden="true"
        />

        <!-- Header -->
        <header
          class="flex items-start justify-between gap-3 px-5 pb-3 pt-5 md:px-6 md:pt-6"
          :style="{
            borderBottom: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
          }"
        >
          <div class="flex flex-col gap-0.5">
            <span
              class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
              :style="{ color: brand.colors.textMuted }"
            >Notificações</span>
            <h2
              :id="titleId"
              class="text-[18px] font-semibold leading-tight tracking-tight"
              :style="{ color: brand.colors.text }"
            >Recentes</h2>
          </div>
          <div class="flex items-center gap-1">
            <button
              v-if="alerts.length > 0"
              type="button"
              class="notifications-clear rounded-full px-2.5 py-1 text-[10.5px] transition-colors"
              :style="{
                color: brand.colors.textMuted,
                border: `1px solid color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
              }"
              @click="onClearAll"
            >Limpar tudo</button>
            <button
              type="button"
              class="notifications-close inline-flex size-8 items-center justify-center rounded-full transition-colors"
              :style="{ color: brand.colors.textMuted }"
              aria-label="Fechar"
              @click="onCloseRequest"
            >
              <UIcon name="i-lucide-x" class="size-4" />
            </button>
          </div>
        </header>

        <!-- Body -->
        <div class="notifications-body flex-1 overflow-y-auto px-5 py-4 md:px-6">
          <p
            v-if="loading && alerts.length === 0"
            class="py-2 text-[12px]"
            :style="{ color: brand.colors.textMuted }"
          >Carregando…</p>

          <!-- Empty state -->
          <div
            v-else-if="alerts.length === 0"
            class="flex flex-col items-center gap-3 py-10 text-center"
          >
            <UIcon
              name="i-lucide-bell-off"
              class="size-8"
              :style="{ color: brand.colors.textMuted }"
              aria-hidden="true"
            />
            <p
              class="text-[13px] leading-snug"
              :style="{ color: brand.colors.text }"
            >Sem notificações por enquanto.</p>
            <p
              class="text-[11.5px] leading-snug"
              :style="{
                color: brand.colors.textMuted,
                maxWidth: '260px',
              }"
            >Adicione um ativo à watchlist com condições (queda %, preço, DY) para receber alertas aqui.</p>
          </div>

          <!-- Grouped alerts -->
          <div
            v-for="group in groupedAlerts"
            :key="group.label"
            class="flex flex-col gap-1 pt-1"
          >
            <h3
              class="font-mono-tab mb-1 px-1 text-[10px] uppercase tracking-[0.18em]"
              :style="{ color: brand.colors.textMuted }"
            >{{ group.label }} · {{ group.alerts.length }}</h3>
            <ul class="flex flex-col gap-1">
              <li
                v-for="a in group.alerts"
                :key="a.id"
                class="notif-row group flex items-start gap-2.5 rounded-lg px-3 py-2.5"
                :style="{
                  backgroundColor: a.readAt
                    ? 'transparent'
                    : `color-mix(in srgb, ${brand.colors.primary} 4%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
                }"
              >
                <!-- Severity dot -->
                <span
                  class="mt-1.5 inline-flex size-1.5 shrink-0 rounded-full"
                  :style="{ backgroundColor: severityColor(a.severity) }"
                  aria-hidden="true"
                />
                <!-- Body — clickable area -->
                <button
                  type="button"
                  class="notif-body flex min-w-0 flex-1 flex-col gap-0.5 text-left"
                  @click="$emit('select', a)"
                >
                  <header class="flex items-center gap-2">
                    <ChatV2TickerChip
                      v-if="a.ticker"
                      :ticker="a.ticker"
                      :price-when-mentioned="priceFromAlert(a)"
                      density="compact"
                    />
                    <span
                      class="truncate text-[12.5px]"
                      :style="{
                        color: brand.colors.text,
                        fontWeight: a.readAt ? '400' : '500',
                      }"
                    >{{ a.title }}</span>
                  </header>
                  <p
                    class="text-[11.5px] leading-snug"
                    :style="{ color: brand.colors.textMuted }"
                  >{{ a.body }}</p>
                  <span
                    class="font-mono-tab text-[10px] tabular-nums"
                    :style="{ color: brand.colors.textMuted }"
                  >{{ relativeTime(a.createdAt) }}</span>
                </button>
                <button
                  type="button"
                  class="notif-dismiss inline-flex size-6 shrink-0 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                  :style="{ color: brand.colors.textMuted }"
                  :aria-label="`Dispensar: ${a.title}`"
                  @click.stop="$emit('dismiss', a.id)"
                >
                  <UIcon name="i-lucide-x" class="size-3" />
                </button>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { ChatAlert } from '~/composables/useAlerts'

const props = defineProps<{
  open: boolean
  alerts: ChatAlert[]
  loading: boolean
}>()

const emit = defineEmits<{
  close: []
  select: [alert: ChatAlert]
  dismiss: [id: string]
  'dismiss-all': []
  'mark-read': [id: string]
}>()

const brand = useBrand()
const titleId = `notifs-title-${Math.random().toString(36).slice(2, 8)}`
const dialogRef = ref<HTMLElement | null>(null)

// Mount-state for the manual rAF transitions (same pattern as the
// audit drawer — Vue's <Transition> wrapping a Teleported v-if was
// flaky on first open, so we drive the transitions with bound refs).
const backdropMounted = ref(false)
const panelMounted = ref(false)
const openGuard = ref(false)
let openGuardTimer: ReturnType<typeof setTimeout> | null = null

const panelOffsetTransform = computed(() => {
  if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
    return 'translateX(100%)'
  }
  return 'translateY(100%)'
})

function onCloseRequest() {
  if (openGuard.value) return
  emit('close')
}
function onClearAll() {
  emit('dismiss-all')
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      backdropMounted.value = false
      panelMounted.value = false
      openGuard.value = false
      if (openGuardTimer) {
        clearTimeout(openGuardTimer)
        openGuardTimer = null
      }
      return
    }
    openGuard.value = true
    if (openGuardTimer) clearTimeout(openGuardTimer)
    openGuardTimer = setTimeout(() => {
      openGuard.value = false
      openGuardTimer = null
    }, 320)
    await nextTick()
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        backdropMounted.value = true
        panelMounted.value = true
        dialogRef.value?.focus()
        // Auto-mark-read for visible alerts so the bell badge
        // clears once the user has actually seen them. Dismiss is
        // still a separate explicit action.
        for (const a of props.alerts) {
          if (a.readAt == null) emit('mark-read', a.id)
        }
      })
    })
  },
)

// ---- helpers ----------------------------------------------------

const panelStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  color: brand.colors.text,
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  borderLeft: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
  boxShadow: '-16px 0 40px -16px rgba(0, 0, 0, 0.45)',
}))

function severityColor(s: ChatAlert['severity']): string {
  if (s === 'critical') return brand.colors.negative
  if (s === 'warning') return brand.colors.primary
  return brand.colors.textMuted
}

function priceFromAlert(a: ChatAlert): number | null {
  const data = (a.data ?? {}) as Record<string, unknown>
  for (const k of ['from', 'threshold', 'snapshotPrice'] as const) {
    const v = data[k]
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) return v
  }
  return null
}

const RELATIVE_DIVISIONS: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
]
const RTF = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto', style: 'short' })

function relativeTime(iso: string): string {
  const time = new Date(iso).getTime()
  if (!Number.isFinite(time)) return '—'
  const seconds = (Date.now() - time) / 1000
  if (seconds < 5) return 'agora'
  let duration = seconds
  for (const d of RELATIVE_DIVISIONS) {
    if (Math.abs(duration) < d.amount) return RTF.format(-Math.round(duration), d.unit)
    duration /= d.amount
  }
  return RTF.format(-Math.round(duration), 'year')
}

interface AlertGroup {
  label: string
  alerts: ChatAlert[]
}

const groupedAlerts = computed<AlertGroup[]>(() => {
  // Bucket by relative day: Hoje / Ontem / Esta semana / Mais antigos.
  // Alerts already arrive sorted desc by createdAt (server-side).
  const buckets: Record<string, ChatAlert[]> = {
    Hoje: [],
    Ontem: [],
    'Esta semana': [],
    'Mais antigos': [],
  }
  const now = new Date()
  const todayKey = now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = yesterday.toDateString()
  const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000

  for (const a of props.alerts) {
    const created = new Date(a.createdAt)
    const key = created.toDateString()
    if (key === todayKey) buckets.Hoje!.push(a)
    else if (key === yesterdayKey) buckets.Ontem!.push(a)
    else if (created.getTime() >= weekAgo) buckets['Esta semana']!.push(a)
    else buckets['Mais antigos']!.push(a)
  }
  return (['Hoje', 'Ontem', 'Esta semana', 'Mais antigos'] as const)
    .filter((label) => buckets[label]!.length > 0)
    .map((label) => ({ label, alerts: buckets[label]! }))
})
</script>

<style scoped>
.notifications-panel {
  isolation: isolate;
}
.notifications-close,
.notifications-clear,
.notif-row,
.notif-body,
.notif-dismiss {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.notifications-close:hover {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
}
.notifications-clear:hover {
  background-color: color-mix(in srgb, currentColor 6%, transparent);
}
.notif-body:hover .notif-row,
.notif-row:hover {
  background-color: color-mix(in srgb, currentColor 4%, transparent) !important;
}
.notif-dismiss:hover {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
}
.notif-body:focus-visible,
.notif-dismiss:focus-visible,
.notifications-close:focus-visible,
.notifications-clear:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
  border-radius: 6px;
}

.notifications-body {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, currentColor 14%, transparent) transparent;
  overscroll-behavior: contain;
}
.notifications-body::-webkit-scrollbar {
  width: 6px;
}
.notifications-body::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
  border-radius: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .notifications-backdrop,
  .notifications-panel {
    transition: none !important;
  }
}
</style>

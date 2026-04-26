<!--
  PanelDrawer — unified audit / overview surface.

  Replaces the four standalone sidebar sections (Goals, Decisions,
  Watchlist, Alerts). Each lives in a tab; a fifth tab "Memória" is
  the audit view of everything `save_memory` ever wrote about the
  user.

  Design notes:
  - Right-side drawer on desktop (xl+), full-height bottom sheet on
    mobile. Same pattern used by GoalDetailDrawer / DecisionDetailDrawer
    so the user already knows the gestures (ESC, click outside, swipe).
  - Tab strip uses a flat hairline; active tab carries a 2px brand
    underline. No background pills, no rounded chips.
  - Each tab body is a minimal list — same row shape across tabs:
    leading dot/icon, two-line text, trailing meta. Divergence only
    where semantics demand it (e.g. memory rows expose a value JSON
    block; alerts get severity + dismiss CTA).
  - Counts in the tab labels use tabular-nums.

  WIG compliance:
  - role="dialog", labelled by H2; ESC + click-outside both close
  - Tabs use role="tablist"/role="tab"; arrow-keys cycle (delegated)
  - Focus trap enters the drawer on open, returns on close
  - Honours prefers-reduced-motion
-->
<template>
  <Teleport to="body">
    <Transition name="panel-fade">
      <div
        v-if="open"
        class="panel-overlay fixed inset-0 z-[60]"
        @click.self="$emit('close')"
      >
        <Transition name="panel-slide" appear>
          <aside
            v-if="open"
            ref="drawerRef"
            class="panel-drawer fixed bottom-0 right-0 top-0 flex w-full flex-col xl:w-[440px]"
            :style="drawerStyle"
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
            tabindex="-1"
            @keydown.esc.stop="$emit('close')"
          >
            <!-- Header -->
            <header
              class="flex items-center justify-between gap-3 px-5 pb-3 pt-5"
              :style="{
                borderBottom: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
              }"
            >
              <h2
                id="panel-title"
                class="font-display text-[18px] font-semibold tracking-tight"
                :style="{ color: brand.colors.text }"
              >
                Painel
              </h2>
              <button
                type="button"
                class="panel-close inline-flex size-8 items-center justify-center rounded-full transition-colors"
                :style="{ color: brand.colors.textMuted }"
                aria-label="Fechar painel"
                @click="$emit('close')"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </header>

            <!-- Tabs -->
            <nav
              role="tablist"
              aria-label="Seções do painel"
              class="flex shrink-0 items-stretch gap-0 overflow-x-auto px-3"
              :style="{
                borderBottom: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
              }"
            >
              <button
                v-for="t in tabs"
                :key="t.id"
                type="button"
                role="tab"
                :aria-selected="activeTab === t.id"
                :aria-controls="`panel-tabpanel-${t.id}`"
                :id="`panel-tab-${t.id}`"
                class="panel-tab relative flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-[12.5px] transition-colors"
                :style="tabStyle(t.id)"
                @click="setTab(t.id)"
              >
                <span>{{ t.label }}</span>
                <span
                  v-if="t.count > 0"
                  class="font-mono-tab text-[10.5px] tabular-nums"
                  :style="{ color: brand.colors.textMuted }"
                >· {{ t.count }}</span>
                <span
                  v-if="activeTab === t.id"
                  class="absolute inset-x-3 bottom-0 h-[2px] rounded-t-full"
                  :style="{ backgroundColor: brand.colors.primary }"
                  aria-hidden="true"
                />
              </button>
            </nav>

            <!-- Body -->
            <div
              role="tabpanel"
              :id="`panel-tabpanel-${activeTab}`"
              :aria-labelledby="`panel-tab-${activeTab}`"
              class="panel-body flex-1 overflow-y-auto px-5 py-4"
            >
              <!-- ============================ Metas ============================ -->
              <section v-if="activeTab === 'goals'" class="flex flex-col gap-2">
                <button
                  type="button"
                  class="panel-cta-row flex items-center gap-2 rounded-lg px-3 py-2 text-left text-[12.5px] transition-colors"
                  :style="{
                    color: brand.colors.text,
                    border: `1px dashed color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
                  }"
                  @click="$emit('new-goal')"
                >
                  <UIcon
                    name="i-lucide-plus"
                    class="size-3.5"
                    :style="{ color: brand.colors.primary }"
                  />
                  Nova meta
                </button>
                <p
                  v-if="goalsState.goals.value.length === 0 && !goalsState.loading.value"
                  class="px-1 pt-2 text-[12px]"
                  :style="{ color: brand.colors.textMuted }"
                >
                  Sem metas ainda. Defina a primeira para ancorar conversas a um objetivo concreto.
                </p>
                <ul v-else class="flex flex-col gap-1">
                  <li
                    v-for="g in goalsState.goals.value"
                    :key="g.id"
                  >
                    <button
                      type="button"
                      class="panel-row group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
                      @click="$emit('select-goal', g)"
                    >
                      <span
                        class="size-2 shrink-0 rounded-full"
                        :style="{ backgroundColor: goalStatusColor(g.status) }"
                        aria-hidden="true"
                      />
                      <span class="flex min-w-0 flex-1 flex-col">
                        <span
                          class="truncate text-[13px] font-medium"
                          :style="{ color: brand.colors.text }"
                        >
                          <span v-if="g.emoji" class="mr-1">{{ g.emoji }}</span>{{ g.name }}
                        </span>
                        <span
                          class="font-mono-tab truncate text-[11px] uppercase tracking-[0.14em]"
                          :style="{ color: brand.colors.textMuted }"
                        >{{ goalStatusLabel(g.status) }}</span>
                      </span>
                      <span
                        class="font-mono-tab shrink-0 text-[12px] tabular-nums"
                        :style="{ color: brand.colors.text }"
                      >{{ goalProgress(g) }}%</span>
                    </button>
                  </li>
                </ul>
              </section>

              <!-- ========================== Decisões =========================== -->
              <section v-if="activeTab === 'decisions'" class="flex flex-col gap-2">
                <p
                  v-if="decisionsState.decisions.value.length === 0"
                  class="px-1 pt-2 text-[12px]"
                  :style="{ color: brand.colors.textMuted }"
                >
                  Nenhuma decisão registrada — peça pra IA propor uma compra ou venda em formato decisão.
                </p>
                <ul v-else class="flex flex-col gap-1">
                  <li v-for="d in decisionsState.decisions.value" :key="d.id">
                    <button
                      type="button"
                      class="panel-row flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
                      @click="$emit('select-decision', d)"
                    >
                      <span
                        class="size-2 shrink-0 rounded-full"
                        :style="{ backgroundColor: decisionTypeColor(d.type) }"
                        aria-hidden="true"
                      />
                      <span class="flex min-w-0 flex-1 flex-col">
                        <span class="flex items-baseline gap-1.5">
                          <span
                            class="font-mono-tab text-[10px] uppercase tracking-[0.14em]"
                            :style="{ color: brand.colors.textMuted }"
                          >{{ decisionTypeLabel(d.type) }}</span>
                          <span
                            v-if="d.ticker"
                            class="truncate text-[12.5px] font-semibold tabular-nums"
                            :style="{ color: brand.colors.text }"
                          >{{ d.ticker }}</span>
                        </span>
                        <span
                          class="truncate text-[11px]"
                          :style="{ color: brand.colors.textMuted }"
                        >{{ d.thesis }}</span>
                      </span>
                      <span
                        class="font-mono-tab shrink-0 text-[10.5px] uppercase tracking-[0.14em]"
                        :style="{ color: brand.colors.textMuted }"
                      >{{ d.status }}</span>
                    </button>
                  </li>
                </ul>
              </section>

              <!-- ========================= Watchlist =========================== -->
              <section v-if="activeTab === 'watchlist'" class="flex flex-col gap-2">
                <p
                  v-if="watchlistState.watches.value.length === 0"
                  class="px-1 pt-2 text-[12px]"
                  :style="{ color: brand.colors.textMuted }"
                >
                  Watchlist proativa vazia. Peça à IA para monitorar um ticker com condição.
                </p>
                <ul v-else class="flex flex-col gap-1">
                  <li v-for="w in watchlistState.watches.value" :key="w.id">
                    <div
                      class="panel-row-static flex items-center gap-3 rounded-lg px-3 py-2.5"
                    >
                      <span class="flex min-w-0 flex-1 flex-col">
                        <span
                          class="font-mono-tab truncate text-[12.5px] font-bold tracking-tight"
                          :style="{ color: brand.colors.text }"
                        >{{ w.ticker }}</span>
                        <span
                          v-if="w.note"
                          class="truncate text-[11px]"
                          :style="{ color: brand.colors.textMuted }"
                        >{{ w.note }}</span>
                      </span>
                      <span
                        class="font-mono-tab shrink-0 text-[10.5px] tabular-nums"
                        :style="{ color: brand.colors.textMuted }"
                      >{{ (w.conditions?.length ?? 0) }} cond.</span>
                      <button
                        type="button"
                        class="panel-row-action inline-flex size-6 items-center justify-center rounded-full transition-colors"
                        :style="{ color: brand.colors.textMuted }"
                        :aria-label="`Remover ${w.ticker} da watchlist`"
                        @click="watchlistState.remove(w.id)"
                      >
                        <UIcon name="i-lucide-x" class="size-3" />
                      </button>
                    </div>
                  </li>
                </ul>
              </section>

              <!-- ========================== Alertas ============================ -->
              <section v-if="activeTab === 'alerts'" class="flex flex-col gap-2">
                <p
                  v-if="alertsState.alerts.value.length === 0"
                  class="px-1 pt-2 text-[12px]"
                  :style="{ color: brand.colors.textMuted }"
                >
                  Nenhum alerta ativo. Adicione condições à watchlist para receber notificações.
                </p>
                <ul v-else class="flex flex-col gap-1">
                  <li v-for="a in alertsState.alerts.value" :key="a.id">
                    <div
                      class="panel-row-static flex items-start gap-3 rounded-lg px-3 py-2.5"
                    >
                      <span
                        class="mt-1.5 size-2 shrink-0 rounded-full"
                        :style="{ backgroundColor: alertSeverityColor(a.severity) }"
                        aria-hidden="true"
                      />
                      <span class="flex min-w-0 flex-1 flex-col">
                        <span
                          class="truncate text-[12.5px] font-medium"
                          :style="{ color: brand.colors.text }"
                        >{{ a.title }}</span>
                        <span
                          class="text-[11px] leading-snug"
                          :style="{ color: brand.colors.textMuted }"
                        >{{ a.body }}</span>
                      </span>
                      <button
                        type="button"
                        class="panel-row-action inline-flex size-6 items-center justify-center rounded-full transition-colors"
                        :style="{ color: brand.colors.textMuted }"
                        aria-label="Dispensar alerta"
                        @click="alertsState.dismiss(a.id)"
                      >
                        <UIcon name="i-lucide-x" class="size-3" />
                      </button>
                    </div>
                  </li>
                </ul>
              </section>

              <!-- ========================= Memória ============================= -->
              <section v-if="activeTab === 'memory'" class="flex flex-col gap-3">
                <header class="flex items-center justify-between gap-2">
                  <p
                    class="text-[12px] leading-snug"
                    :style="{ color: brand.colors.textMuted }"
                  >
                    Tudo que a IA sabe sobre você. Veja, audite, remova o que não fizer sentido.
                  </p>
                  <button
                    v-if="memoriesState.memories.value.length > 0"
                    type="button"
                    class="panel-clear shrink-0 rounded-full px-2.5 py-1 text-[10.5px] transition-colors"
                    :style="{
                      color: brand.colors.negative,
                      border: `1px solid color-mix(in srgb, ${brand.colors.negative} 30%, transparent)`,
                    }"
                    @click="confirmClearMemories"
                  >
                    {{ memoryClearStage === 'arm' ? 'Confirmar limpeza' : 'Limpar tudo' }}
                  </button>
                </header>

                <p
                  v-if="memoriesState.loading.value && memoriesState.memories.value.length === 0"
                  class="px-1 text-[12px]"
                  :style="{ color: brand.colors.textMuted }"
                >Carregando…</p>

                <p
                  v-else-if="memoriesState.memories.value.length === 0"
                  class="px-1 text-[12px]"
                  :style="{ color: brand.colors.textMuted }"
                >
                  Vazio. Conforme você conversa, fatos relevantes (perfil, preferências, decisões) ficam aqui.
                </p>

                <div
                  v-for="[kind, rows] in memoryGroupedEntries"
                  :key="kind"
                  class="flex flex-col gap-1"
                >
                  <h3
                    class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
                    :style="{ color: brand.colors.textMuted }"
                  >
                    {{ memoryKindLabel(kind) }}
                    <span class="tabular-nums">· {{ rows.length }}</span>
                  </h3>
                  <ul class="flex flex-col gap-1">
                    <li
                      v-for="m in rows"
                      :key="m.id"
                      class="panel-memory-row group flex items-start gap-3 rounded-lg px-3 py-2"
                      :style="{
                        backgroundColor: `color-mix(in srgb, ${brand.colors.text} 3%, transparent)`,
                      }"
                    >
                      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span
                          class="font-mono-tab truncate text-[11px]"
                          :style="{ color: brand.colors.text }"
                        >{{ m.key }}</span>
                        <span
                          class="break-words text-[12px] leading-snug"
                          :style="{ color: `color-mix(in srgb, ${brand.colors.text} 80%, transparent)` }"
                        >{{ formatMemoryValue(m.value) }}</span>
                        <span
                          class="font-mono-tab text-[10px] tabular-nums"
                          :style="{ color: brand.colors.textMuted }"
                        >{{ formatDate(m.updatedAt) }} · conf {{ m.confidence }}</span>
                      </div>
                      <button
                        type="button"
                        class="panel-row-action inline-flex size-6 shrink-0 items-center justify-center rounded-full transition-colors"
                        :style="{ color: brand.colors.textMuted }"
                        :aria-label="`Esquecer memória ${m.key}`"
                        @click="memoriesState.remove(m.id)"
                      >
                        <UIcon name="i-lucide-trash-2" class="size-3" />
                      </button>
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { GoalStatus } from '~/composables/useGoals'
import type { ChatGoal } from '~/composables/useGoals'
import type { ChatDecision, DecisionType } from '~/composables/useDecisions'
import type { ChatAlert } from '~/composables/useAlerts'

type TabId = 'goals' | 'decisions' | 'watchlist' | 'alerts' | 'memory'

const props = defineProps<{
  open: boolean
  initialTab?: TabId
}>()

const emit = defineEmits<{
  close: []
  'new-goal': []
  'select-goal': [goal: ChatGoal]
  'select-decision': [decision: ChatDecision]
  'select-alert': [alert: ChatAlert]
}>()

const brand = useBrand()
const goalsState = useGoals()
const decisionsState = useDecisions()
const watchlistState = useWatchlist()
const alertsState = useAlerts()
const memoriesState = useMemories()

const activeTab = ref<TabId>(props.initialTab ?? 'goals')
const drawerRef = ref<HTMLElement | null>(null)
const memoryClearStage = ref<'idle' | 'arm'>('idle')

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      memoryClearStage.value = 'idle'
      return
    }
    if (props.initialTab) activeTab.value = props.initialTab
    await nextTick()
    drawerRef.value?.focus()
    // Refresh whichever tab the drawer opens to so the data is fresh.
    refreshActiveTab()
  },
)

watch(activeTab, () => {
  refreshActiveTab()
})

function refreshActiveTab() {
  if (activeTab.value === 'memory') void memoriesState.refresh()
  if (activeTab.value === 'goals') void goalsState.refresh()
  if (activeTab.value === 'decisions') void decisionsState.refresh()
  if (activeTab.value === 'watchlist') void watchlistState.refresh()
  if (activeTab.value === 'alerts') void alertsState.refresh()
}

function setTab(id: TabId) {
  activeTab.value = id
}

const tabs = computed(() => [
  { id: 'goals' as const, label: 'Metas', count: goalsState.goals.value.length },
  {
    id: 'decisions' as const,
    label: 'Decisões',
    count: decisionsState.decisions.value.filter(
      (d) => d.status === 'pending' || d.status === 'accepted',
    ).length,
  },
  { id: 'watchlist' as const, label: 'Watch', count: watchlistState.watches.value.length },
  { id: 'alerts' as const, label: 'Alertas', count: alertsState.alerts.value.length },
  { id: 'memory' as const, label: 'Memória', count: memoriesState.memories.value.length },
])

const drawerStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  color: brand.colors.text,
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  borderLeft: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
}))

function tabStyle(id: TabId): Record<string, string> {
  if (activeTab.value === id) {
    return { color: brand.colors.text, fontWeight: '500' }
  }
  return { color: brand.colors.textMuted }
}

// ---- Helpers (mirror the small bits the sidebar sections used) ----

function goalStatusColor(status: GoalStatus | null | string): string {
  if (status === 'hit') return brand.colors.positive ?? brand.colors.primary
  if (status === 'on_track') return brand.colors.primary
  if (status === 'at_risk') return brand.colors.warning ?? brand.colors.primary
  if (status === 'unfeasible') return brand.colors.negative
  return brand.colors.textMuted
}
function goalStatusLabel(status: GoalStatus | null | string): string {
  if (status === 'hit') return 'Atingida'
  if (status === 'on_track') return 'No caminho'
  if (status === 'at_risk') return 'Atenção'
  if (status === 'unfeasible') return 'Inviável'
  return '—'
}
function goalProgress(g: ChatGoal): number {
  const target = parseFloat(g.targetAmount)
  const current = parseFloat(g.currentAmount)
  return Math.round(Math.min(1, Math.max(0, current / Math.max(1, target))) * 100)
}
function decisionTypeColor(t: DecisionType): string {
  if (t === 'buy') return brand.colors.positive ?? brand.colors.primary
  if (t === 'sell') return brand.colors.negative
  if (t === 'rebalance' || t === 'allocate') return brand.colors.primary
  return brand.colors.textMuted
}
function decisionTypeLabel(t: DecisionType): string {
  return (
    {
      buy: 'Comprar',
      sell: 'Vender',
      rebalance: 'Rebalance',
      hold: 'Manter',
      allocate: 'Alocar',
    } as Record<string, string>
  )[t] ?? t
}
function alertSeverityColor(s: ChatAlert['severity']): string {
  if (s === 'critical') return brand.colors.negative
  if (s === 'warning') return brand.colors.primary
  return brand.colors.textMuted
}

const memoryGroupedEntries = computed(() =>
  Array.from(memoriesState.byKind.value.entries()).sort(
    (a, b) => MEMORY_KIND_ORDER.indexOf(a[0]) - MEMORY_KIND_ORDER.indexOf(b[0]),
  ),
)
const MEMORY_KIND_ORDER = [
  'profile',
  'preference',
  'goal',
  'decision',
  'open_thread',
  'fact',
]
function memoryKindLabel(kind: string): string {
  return (
    {
      profile: 'Perfil',
      preference: 'Preferências',
      goal: 'Metas',
      decision: 'Decisões',
      open_thread: 'Conversas em aberto',
      fact: 'Fatos',
    } as Record<string, string>
  )[kind] ?? kind
}
function formatMemoryValue(v: unknown): string {
  if (v == null) return '—'
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  try {
    return JSON.stringify(v, null, 2).slice(0, 280)
  } catch {
    return '—'
  }
}
function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso.slice(0, 10)
  }
}

function confirmClearMemories() {
  if (memoryClearStage.value === 'idle') {
    memoryClearStage.value = 'arm'
    setTimeout(() => {
      if (memoryClearStage.value === 'arm') memoryClearStage.value = 'idle'
    }, 4000)
    return
  }
  void memoriesState.clearAll()
  memoryClearStage.value = 'idle'
}
</script>

<style scoped>
.panel-overlay {
  background-color: color-mix(in srgb, black 32%, transparent);
  backdrop-filter: blur(2px);
}
.panel-drawer {
  isolation: isolate;
  box-shadow: -16px 0 40px -16px rgba(0, 0, 0, 0.45);
}
.panel-tab,
.panel-row,
.panel-row-action,
.panel-cta-row,
.panel-clear,
.panel-close {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.panel-tab:hover {
  color: var(--brand-text, currentColor);
}
.panel-tab:focus-visible,
.panel-row:focus-visible,
.panel-row-action:focus-visible,
.panel-cta-row:focus-visible,
.panel-clear:focus-visible,
.panel-close:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
  border-radius: 8px;
}
.panel-row:hover,
.panel-cta-row:hover {
  background-color: color-mix(in srgb, currentColor 5%, transparent);
}
.panel-row-action:hover,
.panel-close:hover {
  background-color: color-mix(in srgb, currentColor 10%, transparent);
}
.panel-clear:hover {
  background-color: color-mix(in srgb, currentColor 6%, transparent);
}

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 220ms ease;
}
.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 280ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
}
@media (max-width: 1279px) {
  .panel-slide-enter-from,
  .panel-slide-leave-to {
    transform: translateY(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .panel-fade-enter-active,
  .panel-fade-leave-active,
  .panel-slide-enter-active,
  .panel-slide-leave-active {
    transition: none;
  }
}

.panel-body {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, currentColor 14%, transparent) transparent;
  overscroll-behavior: contain;
}
.panel-body::-webkit-scrollbar {
  width: 6px;
}
.panel-body::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
  border-radius: 3px;
}
</style>

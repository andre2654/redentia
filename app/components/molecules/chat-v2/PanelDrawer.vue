<!--
  PanelDrawer — audit drawer.

  Single comprehensive view of everything the chat agent has access
  to. Replaces the four standalone sidebar sections (Goals, Decisions,
  Watchlist, Alerts) and adds long-term Memory + recent Activity.

  Layout (mirrors GoalDetailDrawer / DecisionDetailDrawer so the user
  already knows the gestures):
    Desktop  → right-side drawer, 480px, slides in from right
    Mobile   → bottom sheet, ~92vh, slides in from bottom with handle

  Body uses anchored sections (one scroll) instead of tabs. The sticky
  segmented nav at top jumps to each section. Single column, no
  nested cards, status colour only in the leading dot.

  Sections, in order:
    1. Metas
    2. Decisões
    3. Watchlist
    4. Alertas
    5. Memória de longo prazo
    6. Atividade recente

  WIG compliance:
  - role="dialog", labelled by H2; ESC + click-outside both close
  - Section anchors use real <a href="#audit-X"> so middle-click + key
    nav work as expected
  - aria-current on the active anchor as the user scrolls
  - Honours prefers-reduced-motion
-->
<template>
  <Teleport to="body">
    <div v-if="open" class="audit-mount fixed inset-0 z-[80]" @keydown.esc="$emit('close')">
      <!-- Backdrop is its own button sibling (NOT a parent of the
           panel). This avoids the @click.self pattern that fires
           when the click that OPENED the drawer ends up on the
           backdrop element after layout settles — which is what was
           closing the drawer on the very first click. -->
      <Transition name="audit-overlay">
        <button
          v-if="open"
          type="button"
          class="audit-backdrop fixed inset-0"
          :style="{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }"
          aria-label="Fechar auditoria"
          tabindex="-1"
          @click="$emit('close')"
        />
      </Transition>
      <Transition name="audit-panel" appear>
        <aside
          v-if="open"
          ref="dialogRef"
          class="audit-panel fixed bottom-0 right-0 top-auto flex h-[92vh] w-full flex-col md:bottom-auto md:top-0 md:h-full md:max-w-[480px]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :style="panelStyle"
          tabindex="-1"
          @click.stop
        >
            <!-- Mobile drag handle (visual only) -->
            <span
              class="mx-auto mt-3 inline-block h-1 w-12 rounded-full md:hidden"
              :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 18%, transparent)` }"
              aria-hidden="true"
            />

            <!-- Header -->
            <header
              class="relative flex items-start justify-between gap-3 px-5 pb-3 pt-5 md:px-6 md:pt-6"
            >
              <div class="flex flex-col gap-0.5">
                <span
                  class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
                  :style="{ color: brand.colors.textMuted }"
                >Auditoria</span>
                <h2
                  :id="titleId"
                  class="text-balance text-[20px] font-semibold leading-tight tracking-tight"
                  :style="{ color: brand.colors.text }"
                >Tudo que a IA guarda</h2>
              </div>
              <button
                type="button"
                class="audit-close inline-flex size-8 items-center justify-center rounded-full transition-colors"
                :style="{ color: brand.colors.textMuted }"
                aria-label="Fechar auditoria"
                @click="$emit('close')"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </header>

            <!-- Sticky section nav -->
            <nav
              aria-label="Seções da auditoria"
              class="audit-nav sticky top-0 z-[1] flex shrink-0 items-stretch overflow-x-auto px-5 md:px-6"
              :style="{
                backgroundColor: brand.colors.surface,
                borderBottom: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
              }"
            >
              <a
                v-for="s in sections"
                :key="s.id"
                :href="`#audit-${s.id}`"
                :aria-current="initialSection === s.id ? 'true' : undefined"
                class="audit-nav-link relative shrink-0 px-3 py-2.5 text-[12px] transition-colors"
                :style="navLinkStyle(s.id)"
                @click="onNavClick($event, s.id)"
              >
                {{ s.label }}
                <span
                  v-if="s.count > 0"
                  class="ml-1 font-mono-tab tabular-nums text-[10.5px]"
                  :style="{ color: brand.colors.textMuted }"
                >{{ s.count }}</span>
              </a>
            </nav>

            <!-- Body — single scroll, anchored sections -->
            <div
              ref="bodyRef"
              class="audit-body flex-1 overflow-y-auto px-5 pb-10 pt-4 md:px-6"
              @scroll.passive="onScroll"
            >
              <!-- ============ Metas ============ -->
              <section
                id="audit-goals"
                ref="el_goals"
                class="audit-section flex flex-col gap-2"
                :aria-labelledby="`audit-h-goals`"
              >
                <header class="audit-section-header">
                  <h3 :id="`audit-h-goals`">Metas</h3>
                  <button
                    type="button"
                    class="audit-section-action"
                    :style="{ color: brand.colors.primary }"
                    @click="$emit('new-goal')"
                  >+ nova</button>
                </header>
                <p
                  v-if="goalsState.goals.value.length === 0"
                  class="audit-empty"
                  :style="{ color: brand.colors.textMuted }"
                >Sem metas ainda. Defina a primeira para ancorar conversas a um objetivo concreto.</p>
                <ul v-else class="flex flex-col gap-px">
                  <li v-for="g in goalsState.goals.value" :key="g.id">
                    <button
                      type="button"
                      class="audit-row group flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors"
                      @click="$emit('select-goal', g)"
                    >
                      <span
                        class="size-1.5 shrink-0 rounded-full"
                        :style="{ backgroundColor: goalStatusColor(g.status) }"
                        aria-hidden="true"
                      />
                      <span class="flex min-w-0 flex-1 flex-col">
                        <span
                          class="truncate text-[13px] font-medium"
                          :style="{ color: brand.colors.text }"
                        >{{ g.emoji ? `${g.emoji} ` : '' }}{{ g.name }}</span>
                        <span
                          class="font-mono-tab text-[10.5px] uppercase tracking-[0.14em]"
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

              <!-- ============ Decisões ============ -->
              <section
                id="audit-decisions"
                ref="el_decisions"
                class="audit-section flex flex-col gap-2"
                :aria-labelledby="`audit-h-decisions`"
              >
                <header class="audit-section-header">
                  <h3 :id="`audit-h-decisions`">Decisões</h3>
                </header>
                <p
                  v-if="decisionsState.decisions.value.length === 0"
                  class="audit-empty"
                  :style="{ color: brand.colors.textMuted }"
                >Nenhuma decisão registrada — peça pra IA propor uma compra/venda em formato decisão.</p>
                <ul v-else class="flex flex-col gap-px">
                  <li v-for="d in decisionsState.decisions.value" :key="d.id">
                    <button
                      type="button"
                      class="audit-row flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors"
                      @click="$emit('select-decision', d)"
                    >
                      <span
                        class="size-1.5 shrink-0 rounded-full"
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
                        class="font-mono-tab shrink-0 text-[10px] uppercase tracking-[0.14em]"
                        :style="{ color: brand.colors.textMuted }"
                      >{{ d.status }}</span>
                    </button>
                  </li>
                </ul>
              </section>

              <!-- ============ Watchlist ============ -->
              <section
                id="audit-watchlist"
                ref="el_watchlist"
                class="audit-section flex flex-col gap-2"
                :aria-labelledby="`audit-h-watchlist`"
              >
                <header class="audit-section-header">
                  <h3 :id="`audit-h-watchlist`">Watchlist</h3>
                </header>
                <p
                  v-if="watchlistState.watches.value.length === 0"
                  class="audit-empty"
                  :style="{ color: brand.colors.textMuted }"
                >Vazia. Peça à IA para monitorar um ativo (ex.: "monitorar PETR4 e me avisar se cair 8%").</p>
                <ul v-else class="flex flex-col gap-px">
                  <li v-for="w in watchlistState.watches.value" :key="w.id">
                    <div class="audit-row-static flex items-center gap-3 rounded-md px-2 py-2">
                      <span class="flex min-w-0 flex-1 flex-col">
                        <span
                          class="font-mono-tab text-[12.5px] font-bold tracking-tight"
                          :style="{ color: brand.colors.text }"
                        >{{ w.ticker }}</span>
                        <span
                          v-if="w.note"
                          class="truncate text-[11px]"
                          :style="{ color: brand.colors.textMuted }"
                        >{{ w.note }}</span>
                      </span>
                      <span
                        class="font-mono-tab shrink-0 text-[10px] tabular-nums"
                        :style="{ color: brand.colors.textMuted }"
                      >{{ (w.conditions?.length ?? 0) }} cond</span>
                      <button
                        type="button"
                        class="audit-row-action inline-flex size-6 items-center justify-center rounded-full transition-colors"
                        :style="{ color: brand.colors.textMuted }"
                        :aria-label="`Remover ${w.ticker}`"
                        @click="watchlistState.remove(w.id)"
                      >
                        <UIcon name="i-lucide-x" class="size-3" />
                      </button>
                    </div>
                  </li>
                </ul>
              </section>

              <!-- ============ Alertas ============ -->
              <section
                id="audit-alerts"
                ref="el_alerts"
                class="audit-section flex flex-col gap-2"
                :aria-labelledby="`audit-h-alerts`"
              >
                <header class="audit-section-header">
                  <h3 :id="`audit-h-alerts`">Alertas</h3>
                  <button
                    v-if="alertsState.alerts.value.length > 0"
                    type="button"
                    class="audit-section-action"
                    :style="{ color: brand.colors.textMuted }"
                    @click="alertsState.dismissAll()"
                  >limpar tudo</button>
                </header>
                <p
                  v-if="alertsState.alerts.value.length === 0"
                  class="audit-empty"
                  :style="{ color: brand.colors.textMuted }"
                >Sem alertas ativos.</p>
                <ul v-else class="flex flex-col gap-px">
                  <li v-for="a in alertsState.alerts.value" :key="a.id">
                    <div class="audit-row-static flex items-start gap-3 rounded-md px-2 py-2">
                      <span
                        class="mt-1.5 size-1.5 shrink-0 rounded-full"
                        :style="{ backgroundColor: alertSeverityColor(a.severity) }"
                        aria-hidden="true"
                      />
                      <span class="flex min-w-0 flex-1 flex-col">
                        <span
                          class="text-[12.5px] font-medium"
                          :style="{ color: brand.colors.text }"
                        >{{ a.title }}</span>
                        <span
                          class="text-[11px] leading-snug"
                          :style="{ color: brand.colors.textMuted }"
                        >{{ a.body }}</span>
                      </span>
                      <button
                        type="button"
                        class="audit-row-action inline-flex size-6 shrink-0 items-center justify-center rounded-full transition-colors"
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

              <!-- ============ Memória ============ -->
              <section
                id="audit-memory"
                ref="el_memory"
                class="audit-section flex flex-col gap-2"
                :aria-labelledby="`audit-h-memory`"
              >
                <header class="audit-section-header">
                  <h3 :id="`audit-h-memory`">Memória de longo prazo</h3>
                  <button
                    v-if="memoriesState.memories.value.length > 0"
                    type="button"
                    class="audit-section-action"
                    :style="{ color: brand.colors.negative }"
                    @click="confirmClearMemories"
                  >{{ memoryClearStage === 'arm' ? 'confirmar' : 'limpar tudo' }}</button>
                </header>
                <p
                  class="text-[11px] leading-snug"
                  :style="{ color: brand.colors.textMuted }"
                >Tudo que a IA aprendeu sobre você através das conversas. Audite e remova o que não quiser que ela use.</p>
                <p
                  v-if="memoriesState.loading.value && memoriesState.memories.value.length === 0"
                  class="audit-empty"
                  :style="{ color: brand.colors.textMuted }"
                >Carregando…</p>
                <p
                  v-else-if="memoriesState.memories.value.length === 0"
                  class="audit-empty"
                  :style="{ color: brand.colors.textMuted }"
                >Nada salvo. Conforme conversa, fatos relevantes (perfil, preferências, decisões) ficam aqui.</p>

                <div
                  v-for="[kind, rows] in memoryGroupedEntries"
                  :key="kind"
                  class="flex flex-col gap-1 pt-1"
                >
                  <h4
                    class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
                    :style="{ color: brand.colors.textMuted }"
                  >{{ memoryKindLabel(kind) }} · {{ rows.length }}</h4>
                  <ul class="flex flex-col gap-px">
                    <li
                      v-for="m in rows"
                      :key="m.id"
                      class="audit-mem-row flex items-start gap-3 rounded-md px-2 py-2"
                    >
                      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
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
                      </span>
                      <button
                        type="button"
                        class="audit-row-action inline-flex size-6 shrink-0 items-center justify-center rounded-full transition-colors"
                        :style="{ color: brand.colors.textMuted }"
                        :aria-label="`Esquecer ${m.key}`"
                        @click="memoriesState.remove(m.id)"
                      >
                        <UIcon name="i-lucide-trash-2" class="size-3" />
                      </button>
                    </li>
                  </ul>
                </div>
              </section>

              <!-- ============ Atividade ============ -->
              <section
                id="audit-activity"
                ref="el_activity"
                class="audit-section flex flex-col gap-2"
                :aria-labelledby="`audit-h-activity`"
              >
                <header class="audit-section-header">
                  <h3 :id="`audit-h-activity`">Atividade recente</h3>
                  <span
                    class="font-mono-tab text-[10px] uppercase tracking-[0.14em]"
                    :style="{ color: brand.colors.textMuted }"
                  >{{ activityState.events.value.length }}</span>
                </header>
                <p
                  class="text-[11px] leading-snug"
                  :style="{ color: brand.colors.textMuted }"
                >Eventos recentes registrados pela IA — cálculos rodados, alertas, mudanças de status, novas memórias.</p>
                <p
                  v-if="activityState.loading.value && activityState.events.value.length === 0"
                  class="audit-empty"
                  :style="{ color: brand.colors.textMuted }"
                >Carregando…</p>
                <p
                  v-else-if="activityState.events.value.length === 0"
                  class="audit-empty"
                  :style="{ color: brand.colors.textMuted }"
                >Sem atividade recente.</p>
                <ul v-else class="flex flex-col gap-px">
                  <li v-for="e in activityState.events.value" :key="e.id">
                    <div class="audit-act-row flex items-start gap-3 rounded-md px-2 py-1.5">
                      <span
                        class="mt-1.5 size-1.5 shrink-0 rounded-full"
                        :style="{ backgroundColor: activityKindColor(e.kind) }"
                        aria-hidden="true"
                      />
                      <span class="flex min-w-0 flex-1 flex-col">
                        <span class="flex items-baseline gap-2">
                          <span
                            class="truncate text-[12.5px]"
                            :style="{ color: brand.colors.text }"
                          >{{ e.summary }}</span>
                          <span
                            v-if="e.detail"
                            class="font-mono-tab truncate text-[10.5px]"
                            :style="{ color: brand.colors.textMuted }"
                          >{{ e.detail }}</span>
                        </span>
                        <span
                          class="font-mono-tab text-[10px] tabular-nums"
                          :style="{ color: brand.colors.textMuted }"
                        >{{ formatRelative(e.at) }}</span>
                      </span>
                    </div>
                  </li>
                </ul>
              </section>
            </div>
        </aside>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { GoalStatus, ChatGoal } from '~/composables/useGoals'
import type { ChatDecision, DecisionType } from '~/composables/useDecisions'
import type { ChatAlert } from '~/composables/useAlerts'
import type { ActivityEvent, ActivityKind } from '~/composables/useActivity'

type SectionId = 'goals' | 'decisions' | 'watchlist' | 'alerts' | 'memory' | 'activity'

const props = defineProps<{
  open: boolean
  initialSection?: SectionId
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
const activityState = useActivity()

const titleId = `audit-title-${Math.random().toString(36).slice(2, 8)}`
const dialogRef = ref<HTMLElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)
const el_goals = ref<HTMLElement | null>(null)
const el_decisions = ref<HTMLElement | null>(null)
const el_watchlist = ref<HTMLElement | null>(null)
const el_alerts = ref<HTMLElement | null>(null)
const el_memory = ref<HTMLElement | null>(null)
const el_activity = ref<HTMLElement | null>(null)

const memoryClearStage = ref<'idle' | 'arm'>('idle')
const visibleSection = ref<SectionId>('goals')

const sections = computed<Array<{ id: SectionId; label: string; count: number }>>(() => [
  { id: 'goals', label: 'Metas', count: goalsState.goals.value.length },
  {
    id: 'decisions',
    label: 'Decisões',
    count: decisionsState.decisions.value.filter(
      (d) => d.status === 'pending' || d.status === 'accepted',
    ).length,
  },
  { id: 'watchlist', label: 'Watch', count: watchlistState.watches.value.length },
  { id: 'alerts', label: 'Alertas', count: alertsState.alerts.value.length },
  { id: 'memory', label: 'Memória', count: memoriesState.memories.value.length },
  { id: 'activity', label: 'Atividade', count: activityState.events.value.length },
])

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      memoryClearStage.value = 'idle'
      return
    }
    // Refresh all backing data on open. Each composable short-circuits
    // its own concurrent-refresh case so we don't fire duplicate calls.
    void goalsState.refresh()
    void decisionsState.refresh()
    void watchlistState.refresh()
    void alertsState.refresh()
    void memoriesState.refresh()
    void activityState.refresh()
    await nextTick()
    dialogRef.value?.focus()
    if (props.initialSection) {
      visibleSection.value = props.initialSection
      scrollToSection(props.initialSection)
    } else {
      visibleSection.value = 'goals'
    }
  },
)

function scrollToSection(id: SectionId) {
  const map: Record<SectionId, ReturnType<typeof ref> | null> = {
    goals: el_goals,
    decisions: el_decisions,
    watchlist: el_watchlist,
    alerts: el_alerts,
    memory: el_memory,
    activity: el_activity,
  } as Record<SectionId, ReturnType<typeof ref> | null>
  const el = (map[id] as { value: HTMLElement | null } | null)?.value
  const body = bodyRef.value
  if (!el || !body) return
  body.scrollTo({
    top: el.offsetTop - body.offsetTop - 8,
    behavior: 'smooth',
  })
}

function onNavClick(e: Event, id: SectionId) {
  e.preventDefault()
  visibleSection.value = id
  scrollToSection(id)
}

function onScroll() {
  // Track which section the user is currently looking at so the nav
  // can highlight it. Cheap O(n=6) check on every scroll tick — no
  // throttling needed.
  const body = bodyRef.value
  if (!body) return
  const order: Array<{ id: SectionId; ref: { value: HTMLElement | null } }> = [
    { id: 'goals', ref: el_goals as { value: HTMLElement | null } },
    { id: 'decisions', ref: el_decisions as { value: HTMLElement | null } },
    { id: 'watchlist', ref: el_watchlist as { value: HTMLElement | null } },
    { id: 'alerts', ref: el_alerts as { value: HTMLElement | null } },
    { id: 'memory', ref: el_memory as { value: HTMLElement | null } },
    { id: 'activity', ref: el_activity as { value: HTMLElement | null } },
  ]
  const threshold = body.scrollTop + 80
  for (let i = order.length - 1; i >= 0; i--) {
    const el = order[i]!.ref.value
    if (el && el.offsetTop - body.offsetTop <= threshold) {
      visibleSection.value = order[i]!.id
      return
    }
  }
}

const panelStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  color: brand.colors.text,
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  borderLeft: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
  boxShadow: '-16px 0 40px -16px rgba(0, 0, 0, 0.45)',
}))

function navLinkStyle(id: SectionId): Record<string, string> {
  if (visibleSection.value === id) {
    return {
      color: brand.colors.text,
      borderBottom: `2px solid ${brand.colors.primary}`,
      fontWeight: '500',
    }
  }
  return {
    color: brand.colors.textMuted,
    borderBottom: '2px solid transparent',
  }
}

// ---- Helpers ----------------------------------------------------

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
function activityKindColor(k: ActivityKind): string {
  if (k === 'alert_fired') return brand.colors.primary
  if (k === 'decision_created' || k === 'decision_updated') return brand.colors.primary
  return brand.colors.textMuted
}

const memoryGroupedEntries = computed(() =>
  Array.from(memoriesState.byKind.value.entries()).sort(
    (a, b) =>
      MEMORY_KIND_ORDER.indexOf(a[0]) - MEMORY_KIND_ORDER.indexOf(b[0]),
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
    return JSON.stringify(v).slice(0, 240)
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

const RELATIVE = new Intl.RelativeTimeFormat('pt-BR', {
  numeric: 'auto',
  style: 'narrow',
})
const DIVISIONS: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
]
function formatRelative(iso: string): string {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000
  if (seconds < 5) return 'agora'
  let duration = seconds
  for (const d of DIVISIONS) {
    if (Math.abs(duration) < d.amount)
      return RELATIVE.format(-Math.round(duration), d.unit)
    duration /= d.amount
  }
  return RELATIVE.format(-Math.round(duration), 'year')
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
.audit-backdrop {
  backdrop-filter: blur(2px);
}
.audit-panel {
  isolation: isolate;
}
.audit-close,
.audit-row,
.audit-row-action,
.audit-section-action,
.audit-nav-link {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.audit-close:hover,
.audit-row-action:hover {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
}
.audit-row:hover {
  background-color: color-mix(in srgb, currentColor 5%, transparent);
}
.audit-nav-link:hover {
  color: var(--brand-text, currentColor);
}
.audit-nav-link:focus-visible,
.audit-row:focus-visible,
.audit-row-action:focus-visible,
.audit-section-action:focus-visible,
.audit-close:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
  border-radius: 6px;
}
.audit-section-action {
  font-size: 11px;
  text-transform: lowercase;
  letter-spacing: 0.04em;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background-color 160ms ease;
}
.audit-section-action:hover {
  background-color: color-mix(in srgb, currentColor 6%, transparent);
}

.audit-section {
  scroll-margin-top: 60px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid color-mix(in srgb, currentColor 8%, transparent);
}
.audit-section:last-child {
  border-bottom: none;
}
.audit-section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.audit-section-header h3 {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 0;
  color: var(--brand-text, currentColor);
}
.audit-empty {
  font-size: 12px;
  line-height: 1.5;
  padding: 4px 2px;
}

.audit-mem-row,
.audit-act-row,
.audit-row-static {
  background-color: transparent;
}
.audit-mem-row:hover,
.audit-act-row:hover,
.audit-row-static:hover {
  background-color: color-mix(in srgb, currentColor 4%, transparent);
}

/* Body scroll polish */
.audit-body {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, currentColor 14%, transparent) transparent;
  overscroll-behavior: contain;
}
.audit-body::-webkit-scrollbar {
  width: 6px;
}
.audit-body::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
  border-radius: 3px;
}

/* Drawer transitions — same timings as GoalDetailDrawer so the user
   gets a consistent feel across the audit / detail drawers. */
.audit-overlay-enter-active,
.audit-overlay-leave-active {
  transition: opacity 200ms ease;
}
.audit-overlay-enter-from,
.audit-overlay-leave-to {
  opacity: 0;
}

.audit-panel-enter-active,
.audit-panel-leave-active {
  transition: transform 280ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
@media (min-width: 768px) {
  .audit-panel-enter-from,
  .audit-panel-leave-to {
    transform: translateX(100%);
  }
}
@media (max-width: 767px) {
  .audit-panel-enter-from,
  .audit-panel-leave-to {
    transform: translateY(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .audit-overlay-enter-active,
  .audit-overlay-leave-active,
  .audit-panel-enter-active,
  .audit-panel-leave-active {
    transition: none;
  }
}
</style>

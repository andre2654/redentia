<!--
  ChatV2Sidebar — full re-skin in the Redentia × Stripe-style flavor.

  Anatomy (top → bottom):
    1. Header: brand logo + collapse chevron («).
    2. Big amber "+ Nova conversa" CTA with ⌘K hint.
    3. Search input with ⌘F hint.
    4. MEU PAINEL — eyebrow + 2x2 grid of stat cards (Metas / Decisões /
       Watchlist / Alertas), each clickable → emits `open-panel`.
    5. HISTÓRICO — eyebrow + filter pills (Tudo / Hoje / Semana / Mês).
    6. Sessions grouped by recency. Pinned sessions (📌 Fixados) come
       first when present; otherwise the standard Hoje / Esta semana /
       Anteriores groups.

  Design language:
    - Eyebrows: 10.5–11px font-mono-tab UPPERCASE tracking 0.18em,
      brand-primary or muted depending on emphasis.
    - Numbers (counts, dates): tabular-nums.
    - Surfaces: solid `--brand-surface` + 1px subtle border with the
      amber-tinted lift shadow on hover.
    - CTA: amber fill, 8px radius (no pills on primary buttons).
-->
<template>
  <aside
    ref="rootRef"
    class="chat-sidebar flex h-full w-full flex-col"
    :style="{ backgroundColor: 'var(--brand-surface)' }"
  >
    <!-- ============ 1. Header ============ -->
    <header class="flex shrink-0 items-center justify-between px-4 pt-5 pb-3">
      <NuxtLink to="/" class="chat-brand-mark inline-flex items-center" aria-label="Ir pra home">
        <BrandLogo variant="full" mode="auto" class="h-7 w-auto" />
      </NuxtLink>
      <button
        type="button"
        class="collapse-btn flex size-8 shrink-0 items-center justify-center rounded-md transition-colors"
        :style="{ color: 'var(--brand-text-muted)' }"
        aria-label="Recolher conversas"
        @click="$emit('close-sidebar')"
      >
        <UIcon name="i-lucide-chevrons-left" class="size-4" />
      </button>
    </header>

    <!-- ============ 2. New conversation CTA ============ -->
    <div class="px-4 pb-3 shrink-0">
      <button
        type="button"
        class="new-conv-btn group flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-medium transition-[background-color,box-shadow,transform]"
        :style="newConvStyle"
        @click="$emit('new')"
      >
        <UIcon name="i-lucide-plus" class="size-4" />
        <span>Nova conversa</span>
        <kbd
          class="ml-auto rounded px-1.5 py-0.5 font-mono-tab text-[10.5px] font-medium"
          :style="kbdStyle"
        >{{ shortcutLabel }}</kbd>
      </button>
    </div>

    <!-- ============ 3. Search ============ -->
    <div class="px-4 pb-4 shrink-0">
      <label
        class="search-wrap flex items-center gap-2 rounded-lg px-3 py-2 transition-[border-color,box-shadow]"
        :style="searchStyle"
      >
        <UIcon
          name="i-lucide-search"
          class="size-3.5 shrink-0"
          :style="{ color: 'var(--brand-text-muted)' }"
        />
        <input
          v-model="searchQuery"
          type="search"
          autocomplete="off"
          spellcheck="false"
          class="chat-search-input min-w-0 flex-1 border-0 bg-transparent text-[13px] outline-none"
          :style="{ color: 'var(--brand-text)' }"
          placeholder="Buscar conversas"
        />
        <kbd
          v-if="!searchQuery"
          class="rounded px-1.5 py-0.5 font-mono-tab text-[10.5px] font-medium"
          :style="kbdMutedStyle"
        >⌘F</kbd>
      </label>
    </div>

    <!-- ============ Scrollable body (panel + history) ============ -->
    <div class="chat-sidebar-body flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6">
      <!-- ============ 4. Meu painel (stat cards 2x2) ============ -->
      <section v-if="showGoalsAndDecisions" class="flex flex-col gap-2">
        <span
          class="font-mono-tab text-[10.5px] font-medium uppercase tracking-[0.18em]"
          :style="{ color: 'var(--brand-text-muted)' }"
        >Meu painel</span>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="row in stashRows"
            :key="row.section"
            type="button"
            class="panel-stat-card group flex min-w-0 items-center gap-2 rounded-lg px-2.5 py-2.5 text-left transition-[transform,border-color,background-color,box-shadow]"
            :style="cardStyle"
            @click="$emit('open-panel', row.section)"
          >
            <span
              class="flex size-7 shrink-0 items-center justify-center rounded-md"
              :style="{
                backgroundColor: `color-mix(in srgb, ${row.iconColor} 14%, transparent)`,
              }"
            >
              <UIcon
                :name="row.icon"
                class="size-3.5"
                :style="{ color: row.iconColor }"
                aria-hidden="true"
              />
            </span>
            <span
              class="min-w-0 flex-1 truncate text-[12.5px] font-medium"
              :style="{ color: 'var(--brand-text)' }"
            >{{ row.label }}</span>
            <span
              class="shrink-0 font-mono-tab text-[12.5px] font-semibold tabular-nums"
              :style="{ color: row.count > 0 ? 'var(--brand-text)' : 'var(--brand-text-muted)' }"
            >{{ row.count }}</span>
            <span
              v-if="row.pending"
              class="absolute right-1.5 top-1.5 size-1.5 rounded-full"
              :style="{ backgroundColor: 'var(--brand-primary)' }"
              aria-hidden="true"
            />
          </button>
        </div>
      </section>

      <!-- ============ 5. Histórico — eyebrow + filter pills ============ -->
      <section class="flex flex-col gap-2">
        <header class="flex items-center justify-between">
          <span
            class="font-mono-tab text-[10.5px] font-medium uppercase tracking-[0.18em]"
            :style="{ color: 'var(--brand-text-muted)' }"
          >Histórico</span>
          <UIcon
            name="i-lucide-sliders-horizontal"
            class="size-3.5 opacity-50"
            :style="{ color: 'var(--brand-text-muted)' }"
            aria-hidden="true"
          />
        </header>

        <div
          class="filter-pills flex items-center gap-1 rounded-lg p-0.5"
          :style="{ backgroundColor: `color-mix(in srgb, var(--brand-text) 5%, transparent)` }"
        >
          <button
            v-for="f in FILTERS"
            :key="f.id"
            type="button"
            class="flex flex-1 items-center justify-center rounded-md px-2 py-1 text-[12px] font-medium transition-colors"
            :style="filterPillStyle(f.id)"
            @click="filter = f.id"
          >{{ f.label }}</button>
        </div>
      </section>

      <!-- ============ 6. Pinned sessions ============ -->
      <section v-if="pinnedSessions.length > 0" class="flex flex-col gap-1">
        <span
          class="flex items-center gap-1.5 font-mono-tab text-[10.5px] font-medium uppercase tracking-[0.18em]"
          :style="{ color: 'var(--brand-primary)' }"
        >
          <UIcon name="i-lucide-pin" class="size-3" aria-hidden="true" />
          Fixados
        </span>
        <ul class="flex flex-col gap-px">
          <li v-for="s in pinnedSessions" :key="s.id">
            <ChatV2SessionRow
              :session="s"
              :active="s.id === activeId"
              :relative-date="formatRelativeDate(s.createdAt)"
              @select="$emit('select', $event)"
              @delete="$emit('delete', $event)"
              @pin="(id, pinned) => $emit('pin', id, pinned)"
              @rename="(id, title) => $emit('rename', id, title)"
            />
          </li>
        </ul>
      </section>

      <!-- ============ 7. Recency-grouped sessions ============ -->
      <section
        v-for="group in groupedSessions"
        :key="group.label"
        v-show="group.items.length > 0"
        class="flex flex-col gap-1"
      >
        <header class="flex items-center justify-between">
          <span
            class="flex items-center gap-1.5 font-mono-tab text-[10.5px] font-medium uppercase tracking-[0.18em]"
            :style="{ color: 'var(--brand-text-muted)' }"
          >
            <span
              class="inline-flex size-1.5 rounded-full"
              :style="{ backgroundColor: group.dotColor }"
              aria-hidden="true"
            />
            {{ group.label }}
          </span>
          <span
            v-if="group.items.length > 0"
            class="rounded-full px-1.5 py-0 font-mono-tab text-[10px] font-semibold tabular-nums"
            :style="{
              backgroundColor: `color-mix(in srgb, var(--brand-text) 8%, transparent)`,
              color: 'var(--brand-text-muted)',
            }"
          >{{ group.items.length }}</span>
        </header>

        <ul class="flex flex-col gap-px">
          <li
            v-for="s in expandedSessionsFor(group)"
            :key="s.id"
          >
            <ChatV2SessionRow
              :session="s"
              :active="s.id === activeId"
              :relative-date="formatRelativeDate(s.createdAt)"
              @select="$emit('select', $event)"
              @delete="$emit('delete', $event)"
              @pin="(id, pinned) => $emit('pin', id, pinned)"
              @rename="(id, title) => $emit('rename', id, title)"
            />
          </li>
        </ul>

        <!-- "Ver todas de hoje / da semana" expander when truncated -->
        <button
          v-if="group.items.length > group.collapsedSize && !group.expanded"
          type="button"
          class="see-more-btn flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[12.5px] transition-colors"
          :style="{ color: 'var(--brand-text-muted)' }"
          @click="expandedGroups.add(group.label); expandedGroups = new Set(expandedGroups)"
        >
          <span>Ver todas {{ group.expandLabel }}</span>
          <UIcon name="i-lucide-chevron-down" class="size-3.5 opacity-60" />
        </button>
      </section>

      <!-- Empty state -->
      <div
        v-if="!hasAnySession"
        class="rounded-lg px-3 py-6 text-center text-[12.5px]"
        :style="{
          color: 'var(--brand-text-muted)',
          border: `1px dashed color-mix(in srgb, var(--brand-border) 45%, transparent)`,
        }"
      >
        Suas conversas aparecem aqui.
      </div>
    </div>

    <!-- ============ Footer: Ver auditoria ============
         Sticky bottom button that opens the audit drawer (PanelDrawer)
         on the "activity" tab. Lives outside the scroll container so
         it's always visible regardless of how long the history list
         scrolls. -->
    <footer
      v-if="showGoalsAndDecisions"
      class="shrink-0 border-t px-4 py-3"
      :style="{ borderColor: `color-mix(in srgb, var(--brand-border) 35%, transparent)` }"
    >
      <button
        type="button"
        class="audit-btn flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-[background-color,border-color,box-shadow]"
        :style="auditBtnStyle"
        @click="$emit('open-panel', 'activity')"
      >
        <UIcon
          name="i-lucide-clipboard-list"
          class="size-3.5"
          :style="{ color: 'var(--brand-primary)' }"
        />
        <span :style="{ color: 'var(--brand-text)' }">Ver auditoria</span>
        <UIcon
          name="i-lucide-arrow-right"
          class="ml-auto size-3 opacity-60"
          :style="{ color: 'var(--brand-text-muted)' }"
        />
      </button>
    </footer>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface Session {
  id: string
  title: string | null
  createdAt: string
  tier?: 'basic' | 'max'
  /** Optional: pinned-by-user marker (future). When undefined, treated
   *  as not pinned. */
  pinned?: boolean
}

const props = defineProps<{
  sessions: Session[]
  activeId: string | null
  /** Toggle the "Meu painel" stat grid. Disabled for anonymous users
   *  (the panel features all require persistent identity). */
  showGoalsAndDecisions?: boolean
}>()

type PanelSection = 'goals' | 'decisions' | 'watchlist' | 'alerts' | 'memory' | 'activity'

defineEmits<{
  new: []
  select: [id: string]
  delete: [id: string]
  /** Toggle pin status. The row component computes the new state
   *  (`!s.pinned`) and forwards it; parent calls the API + reloads. */
  pin: [id: string, pinned: boolean]
  /** Inline rename committed (Enter / blur with non-empty change).
   *  Parent calls PATCH /sessions/:id with the new title. */
  rename: [id: string, title: string]
  'open-panel': [section: PanelSection]
  'close-sidebar': []
}>()

const brand = useBrand()

// ---- Painel state (composables) -----------------------------------------
// TODO(wallet-redesign): Phase 3 introduced /api/goals + /api/watchlist on
// the Laravel side (see services/walletData.ts). The chat sidebar still
// reads from /api/chat/goals + /api/chat/watchlist (chat-service shells).
// Eventually these should converge — but keeping the chat-service ones
// here preserves the in-conversation goal/watchlist UX without touching
// the wallet contract.
const goalsState = useGoals()
const decisionsState = useDecisions()
const watchlistState = useWatchlist()
const alertsState = useAlerts()
onMounted(() => {
  if (props.showGoalsAndDecisions) {
    void goalsState.refresh()
    void decisionsState.refresh()
    void watchlistState.refresh()
    void alertsState.refresh()
  }
})

interface StashRow {
  section: PanelSection
  label: string
  icon: string
  iconColor: string
  count: number
  pending: boolean
}

const stashRows = computed<StashRow[]>(() => {
  const pendingDecisions = decisionsState.decisions.value.filter((d) => d.status === 'pending').length
  const unreadAlerts = alertsState.alerts.value.filter((a) => a.readAt == null).length
  return [
    {
      section: 'goals',
      label: 'Metas',
      icon: 'i-lucide-target',
      iconColor: 'var(--brand-primary)',
      count: goalsState.goals.value.length,
      pending: false,
    },
    {
      section: 'decisions',
      label: 'Decisões',
      icon: 'i-lucide-briefcase',
      iconColor: '#8b5cf6', // purple — distinct from primary so the
                            // 4 cards read as a category palette, not
                            // a single repeated tone.
      count: decisionsState.decisions.value.filter(
        (d) => d.status === 'pending' || d.status === 'accepted',
      ).length,
      pending: pendingDecisions > 0,
    },
    {
      section: 'watchlist',
      label: 'Watchlist',
      icon: 'i-lucide-star',
      iconColor: 'var(--brand-positive, #22c55e)',
      count: watchlistState.watches.value.length,
      pending: false,
    },
    {
      section: 'alerts',
      label: 'Alertas',
      icon: 'i-lucide-bell',
      iconColor: alertsState.alerts.value.length > 0 ? 'var(--brand-negative, #ef4444)' : 'var(--brand-text-muted)',
      count: alertsState.alerts.value.length,
      pending: unreadAlerts > 0,
    },
  ]
})

// ---- Search + filter ----------------------------------------------------
const searchQuery = ref('')

type FilterId = 'tudo' | 'hoje' | 'semana' | 'mes'
const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: 'tudo', label: 'Tudo' },
  { id: 'hoje', label: 'Hoje' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mês' },
]
const filter = ref<FilterId>('tudo')

const visibleSessions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const queried = q
    ? props.sessions.filter((s) => (s.title ?? '').toLowerCase().includes(q))
    : props.sessions

  // Apply time filter
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 7)
  const monthAgo = new Date(today)
  monthAgo.setMonth(today.getMonth() - 1)

  if (filter.value === 'tudo') return queried
  return queried.filter((s) => {
    const d = new Date(s.createdAt)
    if (filter.value === 'hoje') return d >= today
    if (filter.value === 'semana') return d >= weekAgo
    if (filter.value === 'mes') return d >= monthAgo
    return true
  })
})

// ---- Pinned + grouped ---------------------------------------------------
const pinnedSessions = computed(() => visibleSessions.value.filter((s) => s.pinned))

const expandedGroups = ref<Set<string>>(new Set())

interface SessionGroup {
  label: string
  items: Session[]
  collapsedSize: number
  expanded: boolean
  dotColor: string
  expandLabel: string
}

const groupedSessions = computed<SessionGroup[]>(() => {
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 7)

  const buckets = {
    Hoje: [] as Session[],
    'Esta semana': [] as Session[],
    Anteriores: [] as Session[],
  }

  for (const s of visibleSessions.value) {
    if (s.pinned) continue // pinned section already handled them
    const d = new Date(s.createdAt)
    if (d >= today) buckets.Hoje.push(s)
    else if (d >= weekAgo) buckets['Esta semana'].push(s)
    else buckets.Anteriores.push(s)
  }

  return [
    {
      label: 'Hoje',
      items: buckets.Hoje,
      collapsedSize: 3,
      expanded: expandedGroups.value.has('Hoje'),
      dotColor: 'var(--brand-primary)',
      expandLabel: 'de hoje',
    },
    {
      label: 'Esta semana',
      items: buckets['Esta semana'],
      collapsedSize: 4,
      expanded: expandedGroups.value.has('Esta semana'),
      dotColor: 'var(--brand-text-muted)',
      expandLabel: 'da semana',
    },
    {
      label: 'Anteriores',
      items: buckets.Anteriores,
      collapsedSize: 5,
      expanded: expandedGroups.value.has('Anteriores'),
      dotColor: 'var(--brand-text-muted)',
      expandLabel: 'anteriores',
    },
  ]
})

function expandedSessionsFor(group: SessionGroup): Session[] {
  return group.expanded ? group.items : group.items.slice(0, group.collapsedSize)
}

const hasAnySession = computed(
  () => pinnedSessions.value.length > 0 || groupedSessions.value.some((g) => g.items.length > 0),
)

// ---- Styles -------------------------------------------------------------
const newConvStyle = computed(() => ({
  backgroundColor: 'var(--brand-primary)',
  color: brand.colors.background,
  boxShadow: `0 8px 18px -10px color-mix(in srgb, var(--brand-primary) 60%, transparent), 0 4px 10px -6px rgba(0,0,0,0.10)`,
}))

const kbdStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.background} 25%, transparent)`,
  color: brand.colors.background,
}))
const kbdMutedStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, var(--brand-text) 7%, transparent)`,
  color: 'var(--brand-text-muted)',
}))

const searchStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, var(--brand-text) 4%, transparent)`,
  border: `1px solid transparent`,
}))

const cardStyle = computed(() => ({
  position: 'relative' as const,
  backgroundColor: 'var(--brand-surface)',
  border: `1px solid color-mix(in srgb, var(--brand-border) 40%, transparent)`,
  boxShadow: `color-mix(in srgb, var(--brand-primary) 6%, transparent) 0px 6px 14px -10px, rgba(0,0,0,0.04) 0px 3px 8px -6px`,
}))

function filterPillStyle(id: FilterId): Record<string, string> {
  const active = filter.value === id
  if (active) {
    return {
      backgroundColor: 'var(--brand-primary)',
      color: brand.colors.background,
      boxShadow: `0 1px 3px rgba(0,0,0,0.08)`,
    }
  }
  return {
    color: 'var(--brand-text-muted)',
    backgroundColor: 'transparent',
  }
}

const auditBtnStyle = computed(() => ({
  backgroundColor: 'var(--brand-surface)',
  border: `1px solid color-mix(in srgb, var(--brand-border) 50%, transparent)`,
  boxShadow: `color-mix(in srgb, var(--brand-primary) 6%, transparent) 0px 6px 14px -10px, rgba(0,0,0,0.04) 0px 3px 8px -6px`,
}))

function sessionRowStyle(active: boolean): Record<string, string> {
  if (active) {
    return {
      backgroundColor: `color-mix(in srgb, var(--brand-primary) 10%, transparent)`,
      border: `1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent)`,
    }
  }
  return {
    backgroundColor: 'transparent',
    border: '1px solid transparent',
  }
}

// ---- Date formatting ----------------------------------------------------
function formatRelativeDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  // Same day → "HH:MM"
  if (d >= today) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  // Past 7d → "Xh atrás" / "Xd atrás"
  if (diffMin < 60 * 24 * 7) {
    if (diffMin < 60) return `${diffMin}m`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `${diffH}h atrás`
    const diffD = Math.floor(diffH / 24)
    if (diffD === 1) return 'ontem'
    return `${diffD}d atrás`
  }
  // Older → "Qua" / "Qui" / "01/04"
  if (diffMin < 60 * 24 * 30) {
    return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
  }
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

// ---- Keyboard shortcut --------------------------------------------------
const shortcutLabel = ref('')
onMounted(() => {
  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '')
  shortcutLabel.value = isMac ? '⌘K' : 'Ctrl K'
})

function onKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
    const input = document.querySelector<HTMLInputElement>('.chat-search-input')
    if (input) {
      e.preventDefault()
      input.focus()
    }
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

const rootRef = ref<HTMLElement | null>(null)
</script>

<style scoped>
.chat-sidebar {
  -webkit-tap-highlight-color: transparent;
}

/* Hide scrollbar visually on the body — keep scroll behavior. */
.chat-sidebar-body {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.chat-sidebar-body::-webkit-scrollbar { display: none; }

/* Brand mark — subtle hover lift */
.chat-brand-mark {
  transition: transform 240ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.chat-sidebar:hover .chat-brand-mark {
  transform: scale(1.04);
}

/* Collapse button hover */
.collapse-btn:hover {
  background-color: color-mix(in srgb, var(--brand-text) 6%, transparent);
  color: var(--brand-text) !important;
}

/* New conversation CTA */
.new-conv-btn:hover {
  background-color: color-mix(in srgb, var(--brand-primary) 92%, black) !important;
  transform: translateY(-0.5px);
  box-shadow:
    0 12px 24px -10px color-mix(in srgb, var(--brand-primary) 70%, transparent),
    0 6px 14px -8px rgba(0, 0, 0, 0.14) !important;
}
.new-conv-btn:active {
  transform: translateY(0);
}

/* Search wrap — focus ring */
.search-wrap:focus-within {
  border-color: color-mix(in srgb, var(--brand-primary) 60%, transparent) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 16%, transparent);
}

/* Stat cards */
.panel-stat-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent) !important;
  background-color: color-mix(in srgb, var(--brand-primary) 4%, var(--brand-surface)) !important;
  transform: translateY(-1px);
  box-shadow:
    color-mix(in srgb, var(--brand-primary) 14%, transparent) 0px 12px 24px -16px,
    rgba(0, 0, 0, 0.08) 0px 6px 14px -8px !important;
}

/* Session row hover */
.session-row:hover {
  background-color: color-mix(in srgb, var(--brand-text) 4%, transparent) !important;
}

/* Delete button hover */
.session-delete:hover {
  background-color: color-mix(in srgb, var(--brand-negative) 12%, var(--brand-surface)) !important;
}

/* See-more button hover */
.see-more-btn:hover {
  background-color: color-mix(in srgb, var(--brand-text) 4%, transparent);
  color: var(--brand-text) !important;
}

/* Audit footer button — same family as the stat cards */
.audit-btn:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent) !important;
  background-color: color-mix(in srgb, var(--brand-primary) 4%, var(--brand-surface)) !important;
  box-shadow:
    color-mix(in srgb, var(--brand-primary) 14%, transparent) 0px 12px 24px -16px,
    rgba(0, 0, 0, 0.06) 0px 6px 14px -8px !important;
}

/* Filter pill transition */
.filter-pills button {
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease, box-shadow 160ms ease;
}

@media (prefers-reduced-motion: reduce) {
  .chat-brand-mark,
  .new-conv-btn,
  .panel-stat-card {
    transition: none !important;
    transform: none !important;
  }
}
</style>

<!--
  Sidebar — Linear minimalism, restraint pass.

  Design philosophy:
  - One screen of pixels. Hierarchy through space + weight, never
    through animation or layered tints.
  - Single accent color, single weight scale. Active row uses a 2px
    left bar + a faint primary tint (~5%) — hierarchy without volume.
  - Hover reveals secondary affordances (date, delete). Default
    state is title-only.
  - MAX = a small solid dot next to the title, no animation, no
    radial glow. Tier identity through tone.
  - Dates collapse to relative ("3h", "2d", "12 jan"). tabular-nums.

  Restraint pass (audit follow-up):
  - Removed the breathing radial dot animation (4s loop on every
    MAX row in the list).
  - Removed the active-MAX shimmer sweep (4.8s loop with mix-blend-
    mode: screen — expensive on lower-end hardware).
  - Removed the active-MAX top hairline gradient. Active state is
    one signal: the left accent bar.
  - Kept the ambient radial gradient — it's a single static paint,
    no animation, communicates "this is a sidebar pane" even on
    devices without scrollbar styling.

  WIG compliance unchanged.
-->
<template>
  <div class="chat-sidebar flex h-full min-h-0 flex-col">
    <!-- Ambient gradient — sits behind everything, very subtle -->
    <div
      class="pointer-events-none absolute inset-0"
      :style="{
        background: `radial-gradient(ellipse 80% 30% at 50% 0%, color-mix(in srgb, ${brand.colors.primary} 6%, transparent) 0%, transparent 60%)`,
      }"
      aria-hidden="true"
    />

    <!-- Brand row — full lockup (logo + wordmark in one asset). The
         BrandLogo `full` variant ships separate dark/light artwork
         per tenant, so it always reads correctly on whatever surface
         the sidebar is rendered on. -->
    <header class="relative flex flex-shrink-0 items-center px-4 pb-5 pt-6">
      <BrandLogo
        variant="full"
        mode="auto"
        class="chat-brand-mark h-8 w-auto"
        aria-hidden="true"
      />
    </header>

    <!-- Primary action: ghost row with kbd hint -->
    <button
      type="button"
      class="chat-new group relative mx-2 mb-1 flex items-center gap-2.5 rounded-md px-3 py-1.5 text-left text-[13px] transition-[background-color,color]"
      :style="{ color: `color-mix(in srgb, ${brand.colors.text} 78%, transparent)` }"
      aria-label="Nova conversa"
      @click="$emit('new')"
    >
      <UIcon
        name="i-lucide-plus"
        class="size-3.5 shrink-0 transition-transform duration-200 group-hover:rotate-90"
        aria-hidden="true"
      />
      <span>Nova conversa</span>
      <kbd
        v-if="shortcutLabel"
        class="ml-auto hidden rounded px-1.5 py-[1px] font-mono-tab text-[9.5px] tracking-wider transition-colors sm:inline-flex"
        :style="{
          color: brand.colors.textMuted,
          border: `1px solid color-mix(in srgb, ${brand.colors.border} 45%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${brand.colors.text} 3%, transparent)`,
        }"
      >
        {{ shortcutLabel }}
      </kbd>
    </button>

    <!-- Search — only when it earns its place -->
    <label
      v-if="sessions.length > 8"
      class="chat-search mx-2 mb-2 flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors"
    >
      <UIcon
        name="i-lucide-search"
        class="size-3.5 shrink-0"
        :style="{ color: brand.colors.textMuted }"
        aria-hidden="true"
      />
      <input
        v-model="searchQuery"
        type="text"
        aria-label="Buscar conversas"
        placeholder="Buscar"
        autocomplete="off"
        spellcheck="false"
        class="chat-search-input min-w-0 flex-1 border-0 bg-transparent text-[12.5px] outline-none"
        :style="{ color: brand.colors.text }"
      />
      <button
        v-if="searchQuery"
        type="button"
        class="chat-search-clear shrink-0 rounded-sm p-0.5 transition-colors"
        :style="{ color: brand.colors.textMuted }"
        aria-label="Limpar busca"
        @click="searchQuery = ''"
      >
        <UIcon name="i-lucide-x" class="size-3" aria-hidden="true" />
      </button>
    </label>

    <!-- Horizon hairline — a soft separator that fades at the edges,
         just enough to give the threads list a top margin without
         a hard division. Pure ornament that earns its pixel. -->
    <div
      class="chat-horizon mx-4 mt-1 h-px shrink-0"
      :style="{
        backgroundImage: `linear-gradient(90deg, transparent 0%, color-mix(in srgb, ${brand.colors.border} 70%, transparent) 50%, transparent 100%)`,
      }"
      aria-hidden="true"
    />

    <!-- "Guardado" — compact category counters. Each row reflects the
         actual count and is clickable: it opens the audit drawer
         scrolled to that section. The tail count uses tabular-nums
         so the digit doesn't dance; a tiny dot signals pending
         action (pending decision, unread alert).

         Below the counters, "Ver auditoria" opens the same drawer
         but scrolled to "Memória" + activity log — for users who
         want to inspect everything the agent has access to. -->
    <section
      v-if="showGoalsAndDecisions"
      class="chat-stash flex flex-col px-2 pb-1 pt-2"
      :aria-labelledby="stashHeadingId"
    >
      <h3
        :id="stashHeadingId"
        class="font-mono-tab mb-1 px-2 text-[10px] uppercase tracking-[0.18em]"
        :style="{ color: brand.colors.textMuted }"
      >Guardado</h3>
      <ul class="flex flex-col">
        <li v-for="row in stashRows" :key="row.section">
          <button
            type="button"
            class="chat-stash-row flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[12.5px] transition-colors"
            :style="{ color: brand.colors.text }"
            :aria-label="`${row.label}: ${row.count}${row.pending ? ', com pendência' : ''}`"
            @click="$emit('open-panel', row.section)"
          >
            <span
              class="size-1.5 shrink-0 rounded-full"
              :style="{
                backgroundColor: row.pending
                  ? brand.colors.primary
                  : `color-mix(in srgb, ${brand.colors.text} 25%, transparent)`,
              }"
              aria-hidden="true"
            />
            <span>{{ row.label }}</span>
            <span
              class="ml-auto font-mono-tab tabular-nums text-[11.5px]"
              :style="{
                color: row.count > 0 ? brand.colors.text : brand.colors.textMuted,
                fontWeight: row.count > 0 ? '500' : '400',
              }"
            >{{ row.count }}</span>
          </button>
        </li>
      </ul>
      <button
        type="button"
        class="chat-audit-btn mt-1 flex items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-[12px] transition-colors"
        :style="{ color: brand.colors.textMuted }"
        aria-label="Abrir auditoria completa — logs, atividade, memória de longo prazo"
        @click="$emit('open-panel', 'memory')"
      >
        <span>Ver auditoria</span>
        <UIcon name="i-lucide-arrow-right" class="size-3" aria-hidden="true" />
      </button>
    </section>

    <div
      v-if="showGoalsAndDecisions"
      class="chat-horizon mx-4 mb-1 mt-2 h-px shrink-0"
      :style="{
        backgroundImage: `linear-gradient(90deg, transparent 0%, color-mix(in srgb, ${brand.colors.border} 70%, transparent) 50%, transparent 100%)`,
      }"
      aria-hidden="true"
    />

    <!-- Threads -->
    <nav
      class="chat-threads relative flex-1 overflow-y-auto pb-6 pt-2"
      aria-label="Histórico de conversas"
    >
      <p
        v-if="sessions.length === 0"
        class="px-5 pt-8 text-[12px] leading-relaxed"
        :style="{ color: brand.colors.textMuted }"
      >
        Suas conversas aparecem aqui.
      </p>

      <p
        v-else-if="visibleSessions.length === 0"
        class="px-5 pt-6 text-[12px]"
        :style="{ color: brand.colors.textMuted }"
      >
        Nada bate com&nbsp;<span class="font-medium" :style="{ color: brand.colors.text }">{{ searchQuery }}</span>.
      </p>

      <template v-for="group in groupedSessions" :key="group.label">
        <h3
          v-if="group.items.length > 0"
          class="mb-1 mt-5 flex items-center gap-2 px-5 font-mono-tab text-[10px] uppercase tracking-[0.18em]"
          :style="{ color: `color-mix(in srgb, ${brand.colors.textMuted} 55%, transparent)` }"
        >
          <span>{{ group.label }}</span>
          <span
            class="h-px flex-1"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.border} 25%, transparent)`,
            }"
            aria-hidden="true"
          />
          <span
            class="font-mono-tab tabular-nums"
            :style="{ color: `color-mix(in srgb, ${brand.colors.textMuted} 45%, transparent)` }"
          >
            {{ group.items.length }}
          </span>
        </h3>
        <ul v-if="group.items.length > 0" class="flex flex-col">
          <li
            v-for="session in group.items"
            :key="session.id"
            class="group/sess relative"
            :class="[
              activeId === session.id ? 'is-active' : '',
              session.tier === 'max' ? 'is-max' : '',
            ]"
          >
            <!-- Active row pad — soft tonal background.
                 MAX gets a richer gradient AND an animated shimmer
                 sweeping across (the shimmer lives in CSS as a
                 ::before on .is-active.is-max). -->
            <!-- Active row pad — flat 5% tint, no gradient, no per-tier
                 mix. Selection is communicated by the bar + the bg
                 alone, not by a graded fade. -->
            <span
              v-if="activeId === session.id"
              class="chat-sess-pad pointer-events-none absolute inset-x-2 inset-y-0.5 overflow-hidden rounded-md"
              :style="{
                backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 5%, transparent)`,
              }"
              aria-hidden="true"
            />
            <!-- Left accent bar — solid 2px brand fill. No box-shadow
                 glow (was 6-10px in the previous pass; the audit flagged
                 it as one of the loudest pieces of decoration on the
                 sidebar). -->
            <span
              v-if="activeId === session.id"
              class="chat-sess-bar pointer-events-none absolute left-0 top-1/2 h-4 -translate-y-1/2 rounded-r-full"
              :style="{
                width: '2px',
                backgroundColor: brand.colors.primary,
              }"
              aria-hidden="true"
            />
            <button
              type="button"
              class="chat-sess relative flex w-full items-center gap-2 rounded-md px-4 py-1.5 text-left text-[13px] transition-[background-color,color]"
              :style="activeId === session.id
                ? { color: brand.colors.text, fontWeight: '500' }
                : { color: `color-mix(in srgb, ${brand.colors.text} 80%, transparent)` }"
              :aria-current="activeId === session.id ? 'page' : undefined"
              :data-tier="session.tier"
              @click="$emit('select', session.id)"
            >
              <!-- Tier marker — solid dot, no glow. Inactive rows only;
                   active rows get the bar + tinted pad as the cue. -->
              <span
                v-if="session.tier === 'max' && activeId !== session.id"
                class="size-1.5 shrink-0 rounded-full"
                :style="{ backgroundColor: brand.colors.primary }"
                aria-label="Conversa Redentia MAX"
              />
              <span class="min-w-0 flex-1 truncate">
                {{ session.title ?? 'Sem título' }}
              </span>
              <!-- Hover-revealed date -->
              <span
                class="chat-sess-meta hidden shrink-0 font-mono-tab text-[10px] tabular-nums"
                :style="{ color: `color-mix(in srgb, ${brand.colors.textMuted} 70%, transparent)` }"
              >
                {{ formatRelativeDate(session.createdAt) }}
              </span>
              <!-- Hover-revealed delete -->
              <span
                role="button"
                tabindex="0"
                class="chat-sess-del hidden size-5 shrink-0 items-center justify-center rounded-sm transition-colors"
                :style="{ color: brand.colors.textMuted }"
                aria-label="Excluir conversa"
                @click.stop="$emit('delete', session.id)"
                @keydown.enter.stop.prevent="$emit('delete', session.id)"
                @keydown.space.stop.prevent="$emit('delete', session.id)"
              >
                <UIcon name="i-lucide-trash-2" class="size-3" aria-hidden="true" />
              </span>
            </button>
          </li>
        </ul>
      </template>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface Session {
  id: string
  title: string | null
  createdAt: string
  tier?: 'basic' | 'max'
}

const props = defineProps<{
  sessions: Session[]
  activeId: string | null
  /** When true, the consolidated Painel button is rendered above the
   *  chat history. Disabled for anonymous users (the panel features
   *  all require a persistent identity). */
  showGoalsAndDecisions?: boolean
}>()

type PanelSection = 'goals' | 'decisions' | 'watchlist' | 'alerts' | 'memory' | 'activity'

defineEmits<{
  new: []
  select: [id: string]
  delete: [id: string]
  'open-panel': [section: PanelSection]
}>()

// Goals + decisions + watchlist + alerts composables. We refresh
// them here so the "Guardado" counters in the sidebar stay in sync;
// the actual lists are rendered inside the audit drawer.
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

const stashHeadingId = `chat-stash-${Math.random().toString(36).slice(2, 8)}`

interface StashRow {
  section: PanelSection
  label: string
  count: number
  /** Subset that needs attention — drives the "pending" dot. */
  pending: boolean
}

const stashRows = computed<StashRow[]>(() => {
  const pendingDecisions = decisionsState.decisions.value.filter(
    (d) => d.status === 'pending',
  ).length
  const unreadAlerts = alertsState.alerts.value.filter((a) => a.readAt == null).length
  return [
    {
      section: 'goals',
      label: 'Metas',
      count: goalsState.goals.value.length,
      pending: false,
    },
    {
      section: 'decisions',
      label: 'Decisões',
      count: decisionsState.decisions.value.filter(
        (d) => d.status === 'pending' || d.status === 'accepted',
      ).length,
      pending: pendingDecisions > 0,
    },
    {
      section: 'watchlist',
      label: 'Watchlist',
      count: watchlistState.watches.value.length,
      pending: false,
    },
    {
      section: 'alerts',
      label: 'Alertas',
      count: alertsState.alerts.value.length,
      pending: unreadAlerts > 0,
    },
  ]
})

const brand = useBrand()
const searchQuery = ref('')

// Detect platform for keyboard hint (Mac shows ⌘, others Ctrl).
const shortcutLabel = ref('')
onMounted(() => {
  const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '')
  shortcutLabel.value = isMac ? '⌘K' : 'Ctrl K'
})

const visibleSessions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.sessions
  return props.sessions.filter((s) => (s.title ?? '').toLowerCase().includes(q))
})

const groupedSessions = computed(() => {
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 7)

  const groups = {
    Hoje: [] as Session[],
    'Esta semana': [] as Session[],
    Anteriores: [] as Session[],
  }

  for (const s of visibleSessions.value) {
    const d = new Date(s.createdAt)
    if (d >= today) groups.Hoje.push(s)
    else if (d >= weekAgo) groups['Esta semana'].push(s)
    else groups.Anteriores.push(s)
  }

  return Object.entries(groups).map(([label, items]) => ({ label, items }))
})

function formatRelativeDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `${diffMin}m`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD}d`
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d)
}

// ⌘K / Ctrl+K focuses the search input when present.
function onKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    const input = document.querySelector<HTMLInputElement>('.chat-search-input')
    if (input) {
      e.preventDefault()
      input.focus()
    }
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.chat-sidebar {
  position: relative;
  -webkit-tap-highlight-color: transparent;
}

/* Brand mark — subtle hover lift on the logo itself */
.chat-brand-mark {
  transition: transform 240ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.chat-sidebar:hover .chat-brand-mark {
  transform: scale(1.04);
}
@media (prefers-reduced-motion: reduce) {
  .chat-brand-mark { transition: none !important; }
}

/* Touch + keyboard niceties */
.chat-new,
.chat-sess,
.chat-search,
.chat-search-clear,
.chat-sess-del,
.chat-stash-row,
.chat-audit-btn {
  touch-action: manipulation;
}

/* Visible focus only via keyboard navigation */
.chat-new:focus-visible,
.chat-sess:focus-visible,
.chat-search-input:focus-visible,
.chat-search-clear:focus-visible,
.chat-sess-del:focus-visible,
.chat-stash-row:focus-visible,
.chat-audit-btn:focus-visible {
  outline: 2px solid var(--brand-primary, currentColor);
  outline-offset: 2px;
  border-radius: 6px;
}

/* Hover states — explicit transitions, single property */
.chat-new:hover {
  background-color: color-mix(in srgb, currentColor 6%, transparent);
  color: var(--brand-text, currentColor);
}

.chat-sess:hover {
  background-color: color-mix(in srgb, currentColor 5%, transparent);
}

.chat-stash-row:hover,
.chat-audit-btn:hover {
  background-color: color-mix(in srgb, currentColor 5%, transparent);
}
.chat-audit-btn:hover {
  color: var(--brand-text, currentColor);
}

.chat-search:focus-within {
  background-color: color-mix(in srgb, currentColor 5%, transparent);
}

.chat-search-input::placeholder {
  color: color-mix(in srgb, currentColor 40%, transparent);
}

.chat-search-clear:hover {
  background-color: color-mix(in srgb, currentColor 8%, transparent);
}

/* Hover reveal — date + delete only show on row hover/focus.
   `display: none` keeps them out of the tab order until needed. */
.chat-sess-meta,
.chat-sess-del {
  display: none;
}
.group\/sess:hover .chat-sess-meta,
.group\/sess:focus-within .chat-sess-meta {
  display: inline-block;
}
.group\/sess:hover .chat-sess-del,
.group\/sess:focus-within .chat-sess-del {
  display: inline-flex;
}
.chat-sess-del:hover {
  background-color: color-mix(in srgb, currentColor 10%, transparent);
}

/* MAX dot — solid colored dot, no animation. Tier identity through
   tone, not motion. The audit flagged 7+ simultaneous animations on
   load; killing the breathing dot is the cheapest cumulative win. */

/* Active + MAX row uses the same active treatment as Basic; the row's
   left accent bar (rendered inline) is enough to signal selection.
   No shimmer sweep, no top-edge gradient hairline. */

/* Honor reduced motion — kept for the few legitimate transitions
   that remain (search clear, hover/focus). */
@media (prefers-reduced-motion: reduce) {
  .chat-new,
  .chat-sess,
  .chat-search,
  .chat-search-clear,
  .chat-sess-del {
    transition: none !important;
  }
  .chat-new .iconify {
    transition: none !important;
  }
}

/* Slim, refined scrollbar */
.chat-threads {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, currentColor 14%, transparent) transparent;
}
.chat-threads::-webkit-scrollbar {
  width: 5px;
}
.chat-threads::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
  border-radius: 3px;
}
.chat-threads::-webkit-scrollbar-thumb:hover {
  background-color: color-mix(in srgb, currentColor 22%, transparent);
}
</style>

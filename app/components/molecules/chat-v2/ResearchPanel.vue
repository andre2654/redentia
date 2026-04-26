<!--
  ResearchPanel — collapsed-by-default summary of all tool calls + sources
  for one assistant turn. Replaces the inline section that previously
  rendered every tool as a flex-wrap pill (27 of those crowded the screen,
  especially on mobile, and pushed the actual answer below the fold).

  Layout (per Vercel Web Interface Guidelines):

  • Single-line summary trigger by default — `<button>` with `aria-expanded`,
    `aria-controls`, semantic chevron icon (decorative, `aria-hidden`),
    `touch-action: manipulation`. Status dot pulses while any tool is
    still running so the user has glanceable progress.

  • Expanded view groups tools by family (Ativos, Dividendos, Mercado…),
    each group with a tiny mono-tab header + counter, then a dense
    `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`
    of compact pills. Capped at `max-h-[60vh] overflow-y-auto` on
    mobile so it never dominates the viewport.

  • Compact pills hide the redundant "Buscando ativo" / "Histórico de
    dividendos" prefix that the group header now carries — they show
    just the ticker / arg + status icon. ~28px tall vs 40px before.

  • Live progress in the summary: while running, "Pesquisando 4 de 13
    ativos…" with the trailing ellipsis character. When all tools
    finished, "13 ativos · 10 dividendos · 2 mercado · 1 síntese".
-->
<template>
  <section
    v-if="hasContent"
    class="chat-research-panel"
    :aria-label="`Pesquisa para esta resposta: ${humanCount}`"
  >
    <button
      :id="triggerId"
      type="button"
      class="chat-research-trigger flex w-full items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-left transition-colors"
      :style="{
        backgroundColor: hover
          ? `color-mix(in srgb, ${brand.colors.surface} 50%, transparent)`
          : 'transparent',
      }"
      :aria-expanded="open"
      :aria-controls="bodyId"
      @click="toggle"
      @mouseenter="hover = true"
      @mouseleave="hover = false"
    >
      <span class="flex min-w-0 items-center gap-2.5">
        <!-- Status dot: pulses while any tool is running, solid otherwise. -->
        <span
          class="chat-research-dot relative inline-flex size-2 shrink-0 rounded-full"
          :class="anyRunning ? 'is-running' : 'is-done'"
          :style="{
            backgroundColor: anyRunning ? brand.colors.primary : brand.colors.textMuted,
          }"
          aria-hidden="true"
        >
          <span
            v-if="anyRunning"
            class="absolute inset-0 rounded-full"
            :style="{
              backgroundColor: brand.colors.primary,
              animation: 'chat-research-ping 1.6s cubic-bezier(0,0,.2,1) infinite',
            }"
          />
        </span>
        <span
          class="font-mono-tab text-[10.5px] uppercase tracking-[0.18em]"
          :style="{ color: brand.colors.textMuted }"
        >
          Pesquisa
        </span>
        <span
          class="truncate text-[12.5px] tabular-nums"
          :style="{ color: brand.colors.text }"
        >
          {{ summaryText }}
        </span>
      </span>
      <UIcon
        :name="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        class="size-4 shrink-0 transition-transform"
        :style="{ color: brand.colors.textMuted }"
        aria-hidden="true"
      />
    </button>

    <Transition name="chat-research-fold">
      <div
        v-if="open"
        :id="bodyId"
        class="chat-research-body mt-2"
      >
        <div class="chat-research-scroll">
          <div
            v-for="group in groups"
            :key="group.id"
            class="chat-research-group mb-3 last:mb-0"
          >
            <header class="mb-1.5 flex items-center gap-2 px-1">
              <UIcon
                :name="group.icon"
                class="size-3.5 shrink-0"
                :style="{ color: brand.colors.textMuted }"
                aria-hidden="true"
              />
              <span
                class="font-mono-tab text-[10px] uppercase tracking-[0.16em]"
                :style="{ color: brand.colors.textMuted }"
              >
                {{ group.label }}
              </span>
              <span
                class="font-mono-tab text-[10px] tabular-nums"
                :style="{ color: brand.colors.textMuted }"
              >
                · {{ group.tools.length }}
              </span>
            </header>
            <ul
              class="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              :aria-label="group.label"
            >
              <li v-for="tc in group.tools" :key="tc.callId">
                <ChatV2ToolCallCard :tool-call="tc" variant="compact" />
              </li>
            </ul>
          </div>

          <ChatV2SourceRail
            v-if="citations.length > 0"
            :citations="citations"
            class="mt-3"
          />
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ChatToolCall, ChatCitation } from '~/composables/useChatStream'

const props = defineProps<{
  toolCalls: ChatToolCall[]
  citations: ChatCitation[]
}>()

const brand = useBrand()
const open = ref(false)
const hover = ref(false)

// Stable IDs so `aria-controls` / `aria-expanded` link the trigger to
// the disclosure body. Using crypto.randomUUID isn't SSR-safe; a
// counter scoped to the component instance is enough.
const uid = Math.random().toString(36).slice(2, 8)
const triggerId = `chat-research-trigger-${uid}`
const bodyId = `chat-research-body-${uid}`

const hasContent = computed(
  () => props.toolCalls.length > 0 || props.citations.length > 0,
)

// =============================================================
// Tool grouping
// =============================================================
// Each tool name maps to a "family" so the expanded view can present
// 27 calls as 4-5 groups instead of a flat 27-pill wall. Order in
// `GROUP_ORDER` is the order shown in the UI: research-y stuff first,
// then synthesis, then meta tools (memory, forms).
type GroupId =
  | 'assets'
  | 'dividends'
  | 'technical'
  | 'macro'
  | 'news'
  | 'web'
  | 'portfolio'
  | 'history'
  | 'tesouro'
  | 'calculator'
  | 'spreadsheet'
  | 'memory'
  | 'forms'
  | 'user'
  | 'synthesis'
  | 'other'

const GROUP_META: Record<GroupId, { label: string; icon: string }> = {
  assets: { label: 'Ativos', icon: 'i-lucide-bar-chart-2' },
  dividends: { label: 'Dividendos', icon: 'i-lucide-banknote' },
  technical: { label: 'Análise técnica', icon: 'i-lucide-line-chart' },
  macro: { label: 'Macro', icon: 'i-lucide-globe-2' },
  news: { label: 'Notícias', icon: 'i-lucide-newspaper' },
  web: { label: 'Web', icon: 'i-lucide-search' },
  portfolio: { label: 'Carteira', icon: 'i-lucide-briefcase' },
  history: { label: 'Histórico', icon: 'i-lucide-clock' },
  tesouro: { label: 'Tesouro', icon: 'i-lucide-shield-check' },
  calculator: { label: 'Cálculos', icon: 'i-lucide-calculator' },
  spreadsheet: { label: 'Planilhas', icon: 'i-lucide-file-spreadsheet' },
  memory: { label: 'Memória', icon: 'i-lucide-brain' },
  forms: { label: 'Formulários', icon: 'i-lucide-clipboard-list' },
  user: { label: 'Conta', icon: 'i-lucide-user' },
  synthesis: { label: 'Síntese', icon: 'i-lucide-sparkles' },
  other: { label: 'Outras', icon: 'i-lucide-more-horizontal' },
}

const GROUP_ORDER: GroupId[] = [
  'assets',
  'dividends',
  'technical',
  'history',
  'macro',
  'news',
  'web',
  'tesouro',
  'portfolio',
  'calculator',
  'spreadsheet',
  'forms',
  'user',
  'memory',
  'synthesis',
  'other',
]

function groupForToolName(name: string): GroupId {
  if (name === 'view_asset' || name === 'compare_assets') return 'assets'
  if (name === 'dividend_history' || name === 'dividend_calendar') return 'dividends'
  if (name === 'technical_analysis') return 'technical'
  if (name === 'historical_prices') return 'history'
  if (name === 'macro_snapshot') return 'macro'
  if (name === 'search_news' || name === 'market_news' || name === 'news_summary') return 'news'
  if (name === 'web_search') return 'web'
  if (name === 'list_tesouros') return 'tesouro'
  if (
    name === 'validate_goal' ||
    name === 'verify_asset_composition' ||
    name === 'portfolio_expected_return'
  )
    return 'portfolio'
  if (name.startsWith('calculate_')) return 'calculator'
  if (name === 'generate_spreadsheet') return 'spreadsheet'
  if (name === 'save_memory' || name === 'list_memories' || name === 'forget_memory') return 'memory'
  if (name === 'ask_form') return 'forms'
  if (name === 'add_to_watchlist' || name === 'view_watchlist' || name === 'set_price_alert')
    return 'user'
  if (name === 'synthesizing_analysis' || name === 'auditing_response') return 'synthesis'
  return 'other'
}

interface ToolGroup {
  id: GroupId
  label: string
  icon: string
  tools: ChatToolCall[]
}

const groups = computed<ToolGroup[]>(() => {
  const buckets = new Map<GroupId, ChatToolCall[]>()
  for (const tc of props.toolCalls) {
    const id = groupForToolName(tc.name)
    const list = buckets.get(id) ?? []
    list.push(tc)
    buckets.set(id, list)
  }
  return GROUP_ORDER.filter((id) => buckets.has(id)).map((id) => ({
    id,
    label: GROUP_META[id].label,
    icon: GROUP_META[id].icon,
    tools: buckets.get(id) ?? [],
  }))
})

// =============================================================
// Status + summary text
// =============================================================
const anyRunning = computed(() =>
  props.toolCalls.some((t) => t.status === 'running'),
)
const totalTools = computed(() => props.toolCalls.length)
const finishedTools = computed(() =>
  props.toolCalls.filter((t) => t.status !== 'running').length,
)

// Plain count for screen readers ("13 ferramentas, 5 fontes").
const humanCount = computed(() => {
  const parts: string[] = []
  if (totalTools.value > 0) {
    parts.push(`${totalTools.value} ferramenta${totalTools.value === 1 ? '' : 's'}`)
  }
  if (props.citations.length > 0) {
    parts.push(`${props.citations.length} fonte${props.citations.length === 1 ? '' : 's'}`)
  }
  return parts.join(', ') || 'sem ferramentas'
})

// Visible summary line. While running, show progress; when done,
// show a compact breakdown by family (top 3 groups).
const summaryText = computed(() => {
  if (totalTools.value === 0 && props.citations.length > 0) {
    const n = props.citations.length
    return `${n} ${n === 1 ? 'fonte' : 'fontes'}`
  }
  if (anyRunning.value) {
    return `Pesquisando ${finishedTools.value} de ${totalTools.value}…`
  }
  // Done: show top groups
  const grouped = groups.value
  if (grouped.length === 0) return ''
  const segments = grouped
    .slice(0, 3)
    .map((g) => `${g.tools.length} ${g.label.toLowerCase()}`)
  if (grouped.length > 3) {
    const rest = grouped.slice(3).reduce((s, g) => s + g.tools.length, 0)
    segments.push(`+${rest}`)
  }
  return segments.join(' · ')
})

// =============================================================
// Disclosure behaviour
// =============================================================
function toggle() {
  open.value = !open.value
}

// Auto-open when work is in progress so the user sees activity. Auto-
// stays open after work finishes (less surprising than a sudden
// collapse), but the user can collapse manually any time.
watch(
  anyRunning,
  (running) => {
    if (running) open.value = true
  },
  { immediate: true },
)
</script>

<style scoped>
@keyframes chat-research-ping {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  80%,
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .chat-research-dot.is-running > * {
    animation: none !important;
  }
}

/* Touch optimisation — eliminate the iOS double-tap delay and the
   default tap highlight (we render our own hover/focus states). */
.chat-research-trigger {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.chat-research-trigger:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
  border-radius: 12px;
}

/* Body scroll: prevent the expanded view from pushing the answer
   below the fold on small screens. 60vh is enough breathing room
   while leaving the bottom of the viewport for the actual answer. */
.chat-research-scroll {
  max-height: 60vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 4px; /* room for the scrollbar */
}

@media (min-width: 768px) {
  .chat-research-scroll {
    max-height: 50vh;
  }
}

/* Disclosure animation — height + opacity. Honour reduced-motion. */
.chat-research-fold-enter-active,
.chat-research-fold-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}
.chat-research-fold-enter-from,
.chat-research-fold-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
  .chat-research-fold-enter-active,
  .chat-research-fold-leave-active {
    transition: none;
  }
}
</style>

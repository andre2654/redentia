<!--
  ToolCallCard — pill summarising a single tool invocation.

  Two variants:

  • `default` — full pill with emoji + label + arg + status icon. Used
    when only a handful of tools fired this turn (≤3) and we have room
    to spell out what's happening: "📊 Buscando ativo · PETR4 ✓".

  • `compact` — minimal pill with only the most identifying piece
    (ticker, query, key) + status icon. The group header in
    `ResearchPanel.vue` already carries the family name ("Ativos",
    "Dividendos"…), so repeating it 25 times per pill was visual
    noise. Compact pills target ~28 px tall and live in a grid so 25
    of them collapse from 12 vertical rows to 5–6.

  Renders as a `<button>` rather than a `<div>` because the long-term
  intent is to make pills clickable (open the raw tool result in a
  side panel). Today the click is a no-op handler — but the semantics
  are already right (keyboard focus, screen-reader announcement, tap
  highlight removed via touch-action).
-->
<template>
  <button
    type="button"
    class="chat-tool-pill inline-flex w-full items-center gap-1.5 truncate rounded-full font-medium transition-colors"
    :class="[
      variant === 'compact'
        ? 'h-7 px-2.5 text-[11.5px]'
        : 'h-8 px-3 text-[12px]',
    ]"
    :style="{
      backgroundColor: `color-mix(in srgb, ${tintColor} ${variant === 'compact' ? 8 : 10}%, transparent)`,
      color: textColor,
      border: `1px solid color-mix(in srgb, ${tintColor} ${variant === 'compact' ? 14 : 18}%, transparent)`,
    }"
    :aria-label="ariaLabel"
    :title="hoverLabel"
    @click="$emit('click')"
  >
    <span aria-hidden="true" class="shrink-0">{{ emoji }}</span>

    <span class="min-w-0 flex-1 truncate text-left">
      <template v-if="variant === 'compact'">
        {{ compactText }}
      </template>
      <template v-else>
        {{ label }}<template v-if="argSummary"
          ><span class="opacity-70"> · {{ argSummary }}</span></template
        >
      </template>
    </span>

    <UIcon
      v-if="toolCall.status === 'running'"
      name="i-lucide-loader-2"
      class="size-3 shrink-0 motion-safe:animate-spin"
      :style="{ color: brand.colors.primary }"
      aria-hidden="true"
    />
    <UIcon
      v-else-if="toolCall.status === 'success'"
      name="i-lucide-check"
      class="size-3 shrink-0"
      :style="{ color: brand.colors.positive }"
      aria-hidden="true"
    />
    <UIcon
      v-else
      name="i-lucide-alert-circle"
      class="size-3 shrink-0"
      :style="{ color: brand.colors.negative }"
      aria-hidden="true"
    />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatToolCall } from '~/composables/useChatStream'

const props = defineProps<{
  toolCall: ChatToolCall
  /**
   * - `default` (full label) — standalone usage outside the research
   *   panel. ~40 px tall.
   * - `compact` (truncated, just primary arg) — used inside the
   *   research panel grid where the group header already names the
   *   tool family. ~28 px tall.
   */
  variant?: 'default' | 'compact'
}>()

defineEmits<{
  click: []
}>()

const brand = useBrand()

interface ToolMeta {
  label: string
  emoji: string
  argKeys: string[]
  /**
   * Used for the compact label — preference order. First non-empty
   * arg wins. Falls back to the tool name if every key is empty.
   */
  primary?: string[]
}

const TOOL_META: Record<string, ToolMeta> = {
  view_asset: { label: 'Buscando ativo', emoji: '📊', argKeys: ['ticker'], primary: ['ticker'] },
  historical_prices: { label: 'Carregando preços', emoji: '📈', argKeys: ['ticker'], primary: ['ticker'] },
  compare_assets: { label: 'Comparando ativos', emoji: '⚖️', argKeys: ['tickers'], primary: ['tickers'] },
  technical_analysis: { label: 'Análise técnica', emoji: '📉', argKeys: ['ticker'], primary: ['ticker'] },
  dividend_history: { label: 'Histórico de dividendos', emoji: '💰', argKeys: ['ticker'], primary: ['ticker'] },
  dividend_calendar: { label: 'Calendário de dividendos', emoji: '📅', argKeys: ['ticker'], primary: ['ticker'] },
  search_news: { label: 'Buscando notícias', emoji: '📰', argKeys: ['query', 'ticker'], primary: ['ticker', 'query'] },
  market_news: { label: 'Manchetes', emoji: '📰', argKeys: [], primary: [] },
  news_summary: { label: 'Resumindo notícias', emoji: '📰', argKeys: ['ticker'], primary: ['ticker'] },
  list_tesouros: { label: 'Tesouro Direto', emoji: '🛡️', argKeys: ['indexer'], primary: ['indexer'] },
  calculate_compound_interest: { label: 'Juros compostos', emoji: '🧮', argKeys: [] },
  calculate_planning: { label: 'Planejamento', emoji: '🧮', argKeys: [] },
  calculate_stock_return: { label: 'Retorno histórico', emoji: '🧮', argKeys: ['ticker'], primary: ['ticker'] },
  calculate_tesouro_return: { label: 'Rentabilidade Tesouro', emoji: '🧮', argKeys: [] },
  calculate_taxa_equivalente: { label: 'Taxa equivalente', emoji: '🧮', argKeys: [] },
  calculate_rentabilidade_real: { label: 'Rentabilidade real', emoji: '🧮', argKeys: [] },
  add_to_watchlist: { label: 'Adicionando à carteira', emoji: '⭐', argKeys: ['tickers'] },
  view_watchlist: { label: 'Lendo carteira', emoji: '⭐', argKeys: [] },
  set_price_alert: { label: 'Criando alerta', emoji: '🔔', argKeys: ['ticker'], primary: ['ticker'] },
  generate_spreadsheet: { label: 'Gerando planilha', emoji: '📋', argKeys: ['filename'] },
  validate_goal: { label: 'Validando meta', emoji: '🎯', argKeys: [] },
  macro_snapshot: { label: 'Cenário macro', emoji: '🌎', argKeys: [] },
  verify_asset_composition: { label: 'Verificando composição', emoji: '🔍', argKeys: ['ticker'], primary: ['ticker'] },
  portfolio_expected_return: { label: 'Retorno esperado', emoji: '📐', argKeys: [] },
  save_memory: { label: 'Salvando memória', emoji: '🧠', argKeys: ['key'], primary: ['key'] },
  list_memories: { label: 'Lendo memória', emoji: '🧠', argKeys: [] },
  forget_memory: { label: 'Esquecendo', emoji: '🧠', argKeys: ['key'], primary: ['key'] },
  ask_form: { label: 'Formulário', emoji: '📝', argKeys: [] },
  web_search: { label: 'Pesquisa web', emoji: '🌐', argKeys: ['query'], primary: ['query'] },
  // Pseudo-tools emitted as status pills.
  synthesizing_analysis: { label: 'Sintetizando análise', emoji: '✍️', argKeys: [] },
  auditing_response: { label: 'Auditando resposta', emoji: '🛡️', argKeys: [] },
}

const meta = computed<ToolMeta>(
  () =>
    TOOL_META[props.toolCall.name] ?? {
      label: props.toolCall.name,
      emoji: '🔧',
      argKeys: [],
    },
)
const label = computed(() => meta.value.label)
const emoji = computed(() => meta.value.emoji)
const variant = computed(() => props.variant ?? 'default')

function readArg(key: string): string {
  const v = (props.toolCall.args ?? {})[key]
  if (v == null) return ''
  if (Array.isArray(v)) return v.join(', ')
  return String(v)
}

const argSummary = computed(() => {
  const parts: string[] = []
  for (const k of meta.value.argKeys) {
    const got = readArg(k)
    if (got) parts.push(got)
  }
  return parts.join(' · ')
})

// Compact label preference: first non-empty `primary` arg, then any
// argKey, then a short version of the family label.
const compactText = computed(() => {
  const keys = (meta.value.primary ?? meta.value.argKeys) as string[]
  for (const k of keys) {
    const got = readArg(k)
    if (got) {
      // Truncate long queries to keep the pill compact — `truncate`
      // CSS catches the rest, but slicing here keeps the title
      // attribute readable.
      return got.length > 32 ? got.slice(0, 30) + '…' : got
    }
  }
  return label.value
})

// Full text for `aria-label` / `title` so screen readers and hover
// previews always have the unabridged context, even on compact pills.
const ariaLabel = computed(() => {
  const status =
    props.toolCall.status === 'running'
      ? 'em andamento'
      : props.toolCall.status === 'success'
        ? 'concluído'
        : 'erro'
  const detail = argSummary.value ? ` (${argSummary.value})` : ''
  return `${label.value}${detail} — ${status}`
})

const hoverLabel = computed(() => {
  const detail = argSummary.value ? ` · ${argSummary.value}` : ''
  return `${label.value}${detail}`
})

const tintColor = computed(() => {
  if (props.toolCall.status === 'error') return brand.colors.negative
  if (props.toolCall.status === 'success') return brand.colors.text
  return brand.colors.primary
})

const textColor = computed(() => {
  if (props.toolCall.status === 'error') return brand.colors.negative
  return brand.colors.text
})
</script>

<style scoped>
.chat-tool-pill {
  /* Eliminates iOS 300ms tap delay; we render our own pressed/focus
     state in CSS rather than the native gray flash. */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  cursor: default;
}

.chat-tool-pill:hover {
  filter: brightness(1.06);
}

.chat-tool-pill:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, currentColor 35%, transparent);
}
</style>

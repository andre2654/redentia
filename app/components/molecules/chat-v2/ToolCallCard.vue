<!--
  ToolCallCard — Perplexity-style inline pill, not a card.

  Displays as a small rounded chip with icon + label + (running spinner
  | check | error). Multiple tool calls naturally form a horizontal
  flex-wrap row, mirroring how Perplexity shows "Searching for X →
  Reading sources → ..." progress steps.
-->
<template>
  <div
    class="chat-tool-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors"
    :style="{
      backgroundColor: `color-mix(in srgb, ${tintColor} 10%, transparent)`,
      color: textColor,
    }"
  >
    <!-- emoji vibe -->
    <span aria-hidden="true">{{ emoji }}</span>

    <!-- label -->
    <span>{{ label }}</span>
    <span v-if="argSummary" class="opacity-70">· {{ argSummary }}</span>

    <!-- status icon -->
    <UIcon
      v-if="toolCall.status === 'running'"
      name="i-lucide-loader-2"
      class="size-3 motion-safe:animate-spin"
      :style="{ color: brand.colors.primary }"
    />
    <UIcon
      v-else-if="toolCall.status === 'success'"
      name="i-lucide-check"
      class="size-3"
      :style="{ color: brand.colors.positive }"
    />
    <UIcon
      v-else
      name="i-lucide-alert-circle"
      class="size-3"
      :style="{ color: brand.colors.negative }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatToolCall } from '~/composables/useChatStream'

const props = defineProps<{
  toolCall: ChatToolCall
}>()

const brand = useBrand()

const TOOL_META: Record<
  string,
  { label: string; emoji: string; argKeys: string[] }
> = {
  view_asset: { label: 'Buscando ativo', emoji: '📊', argKeys: ['ticker'] },
  historical_prices: { label: 'Carregando preços', emoji: '📈', argKeys: ['ticker'] },
  compare_assets: { label: 'Comparando ativos', emoji: '⚖️', argKeys: ['tickers'] },
  technical_analysis: { label: 'Análise técnica', emoji: '📉', argKeys: ['ticker'] },
  dividend_history: { label: 'Histórico de dividendos', emoji: '💰', argKeys: ['ticker'] },
  dividend_calendar: { label: 'Calendário de dividendos', emoji: '📅', argKeys: ['ticker'] },
  search_news: { label: 'Buscando notícias', emoji: '📰', argKeys: ['ticker'] },
  market_news: { label: 'Manchetes do mercado', emoji: '📰', argKeys: [] },
  news_summary: { label: 'Resumindo notícias', emoji: '📰', argKeys: ['ticker'] },
  list_tesouros: { label: 'Tesouro Direto', emoji: '🛡️', argKeys: ['indexer'] },
  calculate_compound_interest: { label: 'Juros compostos', emoji: '🧮', argKeys: [] },
  calculate_planning: { label: 'Planejamento', emoji: '🧮', argKeys: [] },
  calculate_stock_return: { label: 'Retorno histórico', emoji: '🧮', argKeys: ['ticker'] },
  calculate_tesouro_return: { label: 'Rentabilidade Tesouro', emoji: '🧮', argKeys: [] },
  calculate_taxa_equivalente: { label: 'Taxa equivalente', emoji: '🧮', argKeys: [] },
  calculate_rentabilidade_real: { label: 'Rentabilidade real', emoji: '🧮', argKeys: [] },
  add_to_watchlist: { label: 'Adicionando à carteira', emoji: '⭐', argKeys: ['tickers'] },
  view_watchlist: { label: 'Lendo carteira', emoji: '⭐', argKeys: [] },
  set_price_alert: { label: 'Criando alerta', emoji: '🔔', argKeys: ['ticker'] },
  generate_spreadsheet: { label: 'Gerando planilha', emoji: '📋', argKeys: ['filename'] },
}

const meta = computed(() => TOOL_META[props.toolCall.name] ?? { label: props.toolCall.name, emoji: '🔧', argKeys: [] })
const label = computed(() => meta.value.label)
const emoji = computed(() => meta.value.emoji)

const argSummary = computed(() => {
  const args = props.toolCall.args ?? {}
  const parts: string[] = []
  for (const k of meta.value.argKeys) {
    const v = (args as Record<string, unknown>)[k]
    if (v == null) continue
    if (Array.isArray(v)) {
      parts.push(v.join(', '))
    } else {
      parts.push(String(v))
    }
  }
  return parts.join(' · ')
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

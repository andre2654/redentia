<template>
  <div
    class="w-full"
    :class="[
      'flex gap-3 px-[30px]',
      message.type === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start',
    ]"
  >
    <!-- Bot Header + Content (grouped) -->
    <div v-if="message.type === 'bot'" class="flex w-full flex-col gap-2">
      <!-- Bot Avatar + Title -->
      <div class="flex items-center gap-2">
        <IconLogo class="w-6 flex-shrink-0 fill-white" />
        <span class="text-[17px] font-semibold">ASSESSORIA REDENTIA:</span>
      </div>

      <!-- Status Indicator (Generative UI) -->
      <div
        v-if="message.status && !message.content && !message.structuredData"
        class="flex items-center gap-2 text-sm text-white/70"
      >
        <UIcon name="i-lucide-loader-2" class="h-4 w-4 animate-spin" />
        {{ message.status }}
      </div>

      <!-- Message Content -->
      <div
        v-if="message.content || message.structuredData"
        class="rounded-lg border border-white/20 bg-white/10 px-4 py-3"
      >
        <!-- Recommendation (from structured meta or REC: line) -->
        <div
          v-if="effectiveRecommendation"
          class="mb-2 flex items-center gap-2"
        >
          <span class="text-xs opacity-70">Recomendação:</span>
          <span
            class="rounded px-2 py-0.5 text-xs font-bold uppercase"
            :class="{
              'bg-green-500/20 text-green-400':
                effectiveRecommendation === 'buy',
              'bg-yellow-500/20 text-yellow-400':
                effectiveRecommendation === 'hold',
              'bg-red-500/20 text-red-400':
                effectiveRecommendation === 'sell',
            }"
          >
            {{ recommendationLabel }}
          </span>
        </div>

        <div
          v-if="!message.structuredData"
          class="prose prose-sm prose-invert max-w-none"
          v-html="renderedContent"
        />

        <!-- Structured Data Rendering -->
        <div v-else class="flex w-full flex-col gap-3">
          <!-- Price Card -->
          <div
            v-if="message.structuredData.type === 'price'"
            class="flex flex-col gap-1"
          >
            <div class="text-sm opacity-70">
              {{ message.structuredData.ticker }}
            </div>
            <div class="flex items-baseline gap-3">
              <span class="text-3xl font-bold"
                >R$ {{ message.structuredData.data.price }}</span
              >
              <span
                :class="
                  Number(message.structuredData.data.change) >= 0
                    ? 'text-green-400'
                    : 'text-red-400'
                "
              >
                {{ Number(message.structuredData.data.change) > 0 ? '+' : ''
                }}{{ message.structuredData.data.change }}%
              </span>
            </div>
            <div class="text-xs opacity-50">
              Atualizado em
              {{
                new Date(
                  message.structuredData.data.lastUpdate
                ).toLocaleTimeString()
              }}
            </div>
          </div>

          <!-- Chart -->
          <div
            v-else-if="message.structuredData.type === 'chart'"
            class="h-[250px] w-full"
          >
            <AtomsGraphLine
              :data="chartData"
              :show-legend="false"
              :height="250"
            />
          </div>

          <!-- Dividends -->
          <div
            v-else-if="message.structuredData.type === 'dividends'"
            class="flex flex-col gap-4"
          >
            <div class="font-semibold">Próximos Dividendos</div>

            <!-- Chart -->
            <div class="h-[350px] w-full">
              <AtomsGraphDividends
                :data="dividendsData"
                :show-controls="false"
              />
            </div>

            <!-- List -->
            <div class="flex flex-col gap-1">
              <div
                v-for="(div, idx) in message.structuredData.data.slice(0, 5)"
                :key="idx"
                class="flex justify-between rounded bg-white/5 px-3 py-2"
              >
                <span>{{ new Date(div.date).toLocaleDateString() }}</span>
                <span class="font-mono font-bold text-green-400"
                  >R$ {{ div.dividend }}</span
                >
              </div>
            </div>
          </div>

          <!-- Analysis -->
          <div
            v-else-if="
              message.structuredData.type === 'analysis' &&
              message.structuredData.data
            "
            class="flex flex-col gap-3"
          >
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded bg-white/5 p-3">
                <div class="text-xs opacity-60">P/L</div>
                <div class="text-lg font-bold">
                  {{ message.structuredData.data.pe ?? '-' }}
                </div>
              </div>
              <div class="rounded bg-white/5 p-3">
                <div class="text-xs opacity-60">Dividend Yield</div>
                <div class="text-lg font-bold text-green-400">
                  {{ message.structuredData.data.dy ?? '-' }}%
                </div>
              </div>
              <div class="rounded bg-white/5 p-3">
                <div class="text-xs opacity-60">Setor</div>
                <div class="font-medium">
                  {{ message.structuredData.data.sector ?? '-' }}
                </div>
              </div>
              <div class="rounded bg-white/5 p-3">
                <div class="text-xs opacity-60">Valor de Mercado</div>
                <div class="font-medium">
                  {{ message.structuredData.data.marketCap ?? '-' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Report (Full Dashboard) -->
          <div
            v-else-if="message.structuredData.type === 'report'"
            class="flex flex-col gap-4"
          >
            <!-- Header: Price & Ticker -->
            <div
              class="flex items-center justify-between rounded-lg bg-white/5 p-3"
            >
              <div>
                <div class="text-sm font-bold">
                  {{ message.structuredData.ticker }}
                </div>
                <div class="text-xs opacity-60">Relatório Completo</div>
              </div>
              <div class="text-right" v-if="message.structuredData.data?.price">
                <div class="text-xl font-bold">
                  R$ {{ message.structuredData.data.price.price }}
                </div>
                <div
                  :class="
                    Number(message.structuredData.data.price.change) >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  "
                  class="text-xs"
                >
                  {{
                    Number(message.structuredData.data.price.change) > 0
                      ? '+'
                      : ''
                  }}{{ message.structuredData.data.price.change }}%
                </div>
              </div>
            </div>

            <!-- Price Chart -->
            <div v-if="chartData.length > 0" class="h-[250px] w-full">
              <AtomsGraphLine
                :data="chartData"
                :show-legend="false"
                :height="250"
              />
            </div>

            <!-- Dividends -->
            <div
              v-if="message.structuredData.data?.dividends"
              class="flex flex-col gap-4"
            >
              <div class="font-semibold">Próximos Dividendos</div>

              <!-- Chart -->
              <div class="h-[350px] w-full">
                <AtomsGraphDividends
                  :data="dividendsData"
                  :show-controls="false"
                />
              </div>

              <!-- List -->
              <div class="flex flex-col gap-1">
                <div
                  v-for="(
                    div, idx
                  ) in message.structuredData.data.dividends.slice(0, 5)"
                  :key="idx"
                  class="flex justify-between rounded bg-white/5 px-3 py-2"
                >
                  <span>{{ new Date(div.date).toLocaleDateString() }}</span>
                  <span class="font-mono font-bold text-green-400"
                    >R$ {{ div.dividend }}</span
                  >
                </div>
              </div>
            </div>
            <div
              v-if="message.structuredData.data?.analysis"
              class="grid grid-cols-2 gap-2"
            >
              <div class="rounded bg-white/5 p-2">
                <div class="text-[10px] opacity-60">P/L</div>
                <div class="font-mono text-sm font-bold">
                  {{ message.structuredData.data.analysis.pe ?? '-' }}
                </div>
              </div>
              <div class="rounded bg-white/5 p-2">
                <div class="text-[10px] opacity-60">DY</div>
                <div class="font-mono text-sm font-bold text-green-400">
                  {{ message.structuredData.data.analysis.dy ?? '-' }}%
                </div>
              </div>
              <div class="rounded bg-white/5 p-2">
                <div class="text-[10px] opacity-60">Setor</div>
                <div class="truncate text-sm font-medium">
                  {{ message.structuredData.data.analysis.sector ?? '-' }}
                </div>
              </div>
              <div class="rounded bg-white/5 p-2">
                <div class="text-[10px] opacity-60">Valor</div>
                <div class="text-sm font-medium">
                  {{ message.structuredData.data.analysis.marketCap ?? '-' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Tool Results & Visualizations (Moved to top) -->
          <!-- Tool Results & Visualizations -->
          <div
            v-if="message.structuredData.toolsUsed?.length"
            class="mt-4 flex flex-col gap-4 border-t border-white/10 pt-4"
          >
            <div
              v-for="(tool, index) in message.structuredData.toolsUsed"
              :key="index"
              class="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <!-- Tool Header -->
              <div
                class="flex items-center gap-2 border-b border-white/10 pb-3"
              >
                <div
                  class="bg-secondary/20 flex h-8 w-8 items-center justify-center rounded-full"
                >
                  <UIcon
                    name="i-lucide-calculator"
                    class="text-secondary size-5"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-bold">{{
                    getToolLabel(tool.name)
                  }}</span>
                  <span class="text-xs opacity-60">Resultado da simulação</span>
                </div>
              </div>

              <!-- Stock Return / Compound Interest Result -->
              <div
                v-if="
                  [
                    'calculate_stock_return',
                    'calculate_compound_interest',
                  ].includes(tool.name) && tool.result
                "
                class="flex flex-col gap-4"
              >
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div class="rounded-lg bg-white/5 p-3">
                    <div class="text-xs opacity-60">Total Investido</div>
                    <div class="font-mono text-lg font-bold">
                      {{
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(tool.result.totalInvested)
                      }}
                    </div>
                  </div>
                  <div class="rounded-lg bg-white/5 p-3">
                    <div class="text-xs opacity-60">Valor Final</div>
                    <div class="text-secondary font-mono text-lg font-bold">
                      {{
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(tool.result.finalValue)
                      }}
                    </div>
                  </div>
                  <div
                    v-if="tool.result.returnPercentage !== undefined"
                    class="rounded-lg bg-white/5 p-3"
                  >
                    <div class="text-xs opacity-60">Rentabilidade</div>
                    <div
                      class="font-mono text-lg font-bold"
                      :class="
                        tool.result.returnPercentage >= 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      "
                    >
                      {{ tool.result.returnPercentage > 0 ? '+' : ''
                      }}{{ tool.result.returnPercentage.toFixed(2) }}%
                    </div>
                  </div>
                </div>

                <div
                  v-if="tool.result.chartData?.length"
                  class="mt-2 h-[200px] w-full"
                >
                  <AtomsGraphLine
                    :data="tool.result.chartData"
                    :height="200"
                    :colors="[ChartColors.positive]"
                    :show-legend="false"
                  />
                </div>
              </div>

              <!-- Planning Result -->
              <div
                v-else-if="tool.name === 'calculate_planning' && tool.result"
                class="flex flex-col gap-4"
              >
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div class="rounded-lg bg-white/5 p-3">
                    <div class="text-xs opacity-60">Meta</div>
                    <div class="font-mono text-lg font-bold">
                      {{
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(tool.result.goalValue)
                      }}
                    </div>
                  </div>
                  <div class="rounded-lg bg-white/5 p-3">
                    <div class="text-xs opacity-60">Tempo Estimado</div>
                    <div class="text-secondary font-mono text-lg font-bold">
                      {{ Math.ceil(tool.result.monthsToGoal / 12) }} anos
                    </div>
                    <div class="text-xs opacity-50">
                      {{ tool.result.targetDateLabel }}
                    </div>
                  </div>
                </div>

                <div
                  v-if="tool.result.chartData?.length"
                  class="mt-2 h-[200px] w-full"
                >
                  <AtomsGraphLine
                    :data="tool.result.chartData"
                    :height="200"
                    :colors="[ChartColors.positive]"
                    :show-legend="false"
                  />
                </div>

                <!-- Recommended Assets -->
                <div
                  v-if="tool.result.recommendedAssets?.length"
                  class="flex flex-col gap-2 border-t border-white/10 pt-3"
                >
                  <div class="text-xs font-medium opacity-70">
                    Carteira Sugerida ({{
                      tool.result.strategy === 'seguranca'
                        ? 'Conservadora'
                        : 'Arrojada'
                    }})
                  </div>
                  <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div
                      v-for="(asset, idx) in tool.result.recommendedAssets"
                      :key="idx"
                      class="flex items-center justify-between rounded bg-white/5 p-2 px-3"
                    >
                      <div class="flex flex-col">
                        <span class="text-sm font-bold">{{
                          asset.ticker
                        }}</span>
                        <span class="text-[10px] opacity-60">{{
                          asset.category
                        }}</span>
                      </div>
                      <div class="text-right">
                        <div class="font-mono text-xs">
                          {{ (asset.weight * 100).toFixed(0) }}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Text -->
          <div
            v-if="message.content"
            class="mt-2 text-sm leading-relaxed opacity-90"
          >
            <div
              class="prose prose-sm prose-invert max-w-none"
              v-html="renderedContent"
            />
          </div>

          <!-- Related Tickers -->
          <div
            v-if="message.structuredData.relatedTickers?.length"
            class="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3"
          >
            <div class="text-xs font-medium opacity-70">
              Ativos mencionados:
            </div>
            <div class="flex flex-wrap gap-3">
              <NuxtLink
                v-for="(item, index) in message.structuredData.relatedTickers"
                :key="index"
                :to="`/asset/${item.ticker?.toLowerCase?.() || item.ticker || ''}`"
                class="flex items-center gap-2 rounded bg-white/5 px-3 py-2 transition-colors hover:bg-white/10"
              >
                <img
                  :src="item.logo"
                  :alt="item?.ticker ? `Logo do ativo ${item.ticker}` : 'Logo do ativo'"
                  class="h-6 w-6 rounded object-cover"
                />
                <span class="text-sm font-medium">{{ item.ticker }}</span>
                <span
                  class="text-xs font-medium"
                  :class="
                    item.change.includes('-')
                      ? 'text-red-400'
                      : 'text-green-400'
                  "
                >
                  {{ item.change }}
                </span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Suggestions (Follow-up Chips) -->
      <div
        v-if="message.suggestions && message.suggestions.length > 0"
        class="mt-1 flex flex-wrap gap-2"
      >
        <button
          v-for="suggestion in message.suggestions"
          :key="suggestion"
          class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          @click="$emit('action', suggestion)"
        >
          {{ suggestion }}
        </button>
      </div>

      <!-- Timestamp -->
      <small class="text-xs text-white/60">
        {{ formattedTime }}
      </small>
    </div>

    <!-- User Message -->
    <div v-else class="flex max-w-[70%] flex-col gap-2">
      <div class="bg-primary-500 rounded-lg px-4 py-3 text-white">
        <p class="text-[14px]">
          {{ message.content }}
        </p>
      </div>

      <!-- Timestamp -->
      <small class="text-right text-xs text-white/60">
        {{ formattedTime }}
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { computed, ref, watch } from 'vue'
import type { IChatMessage } from '~/types/ai'
import AtomsGraphLine from '~/components/atoms/Graph/line.vue'
import AtomsGraphDividends from '~/components/atoms/Graph/dividends.vue'
import { ChartColors } from '~/design/chartColors'

// ==================== PROPS ====================

const props = defineProps<{
  message: IChatMessage
}>()

// ==================== EMITS ====================

const emit = defineEmits<{
  action: [text: string]
}>()

// ==================== COMPUTED ====================

const renderedContent = ref(props.message.content)

const dividendsData = computed(() => {
  // Handle both 'dividends' type and 'report' type which contains dividends
  const data =
    props.message.structuredData?.type === 'report'
      ? props.message.structuredData.data?.dividends
      : props.message.structuredData?.data

  if (!Array.isArray(data)) {
    return []
  }

  return data.map((d: any) => ({
    ticker: props.message.structuredData?.ticker || '',
    payment_date: d.date,
    rate: String(d.dividend),
    label: '',
  }))
})

const chartData = computed(() => {
  if (
    props.message.structuredData?.type === 'report' &&
    props.message.structuredData.data?.chart
  ) {
    const points = props.message.structuredData.data.chart
    if (!Array.isArray(points)) return []
    return points.map((point: any) => ({
      date: point.x,
      value: point.y,
      timestamp: new Date(point.x).getTime(),
    }))
  }

  if (
    props.message.structuredData?.type !== 'chart' ||
    !Array.isArray(props.message.structuredData.data)
  ) {
    return []
  }
  return props.message.structuredData.data.map((point: any) => ({
    date: point.x,
    value: point.y,
    timestamp: new Date(point.x).getTime(),
  }))
})

function parseRecommendationFromContent(content: string): 'buy' | 'hold' | 'sell' | null {
  if (!content) return null
  const match = content.trimStart().match(/^REC:\s*(BUY|HOLD|SELL|NULL)\b/i)
  if (!match) return null

  const value = match[1].toUpperCase()
  if (value === 'BUY') return 'buy'
  if (value === 'HOLD') return 'hold'
  if (value === 'SELL') return 'sell'
  return null
}

const effectiveRecommendation = computed(() => {
  return (
    props.message.structuredData?.meta?.recommendation ??
    parseRecommendationFromContent(props.message.content)
  )
})

const recommendationLabel = computed(() => {
  switch (effectiveRecommendation.value) {
    case 'buy':
      return 'Compra'
    case 'hold':
      return 'Manter'
    case 'sell':
      return 'Venda'
    default:
      return ''
  }
})

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'code',
  'pre',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
]

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class']

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br />')
}

let domPurifyInstance: any = null

async function getDomPurify() {
  if (!import.meta.client) return null
  if (domPurifyInstance) return domPurifyInstance
  const module = await import('isomorphic-dompurify')
  domPurifyInstance = module.default || module
  return domPurifyInstance
}

async function updateRenderedContent() {
  if (props.message.type !== 'bot') {
    renderedContent.value = escapeHtml(props.message.content)
    return
  }

  try {
    marked.setOptions({
      breaks: true,
      gfm: true,
    })

    const cleanContent = props.message.content
      .replace(/^REC:\s*(NULL|BUY|SELL|HOLD)(\n|$)/im, '')
      .trim()

    const rawHtml = marked.parse(cleanContent)

    if (!import.meta.client) {
      renderedContent.value = escapeHtml(cleanContent)
      return
    }

    const purifier = await getDomPurify()
    renderedContent.value = purifier
      ? purifier.sanitize(rawHtml, {
          ALLOWED_TAGS,
          ALLOWED_ATTR,
        })
      : escapeHtml(cleanContent)
  } catch (error) {
    console.error('Failed to render markdown:', error)
    renderedContent.value = escapeHtml(props.message.content)
  }
}

function getToolLabel(name: string) {
  switch (name) {
    case 'calculate_compound_interest':
      return 'Calculadora de Juros Compostos'
    case 'calculate_planning':
      return 'Planejamento Financeiro'
    case 'calculate_stock_return':
      return 'Simulação de Rentabilidade'
    default:
      return 'Calculadora'
  }
}

watch(
  () => [props.message.type, props.message.content],
  () => {
    updateRenderedContent()
  },
  { immediate: true }
)

const formattedTime = computed(() => {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(props.message.timestamp)
  } catch {
    return ''
  }
})
</script>

<style scoped>
/* Markdown prose styling */
.prose {
  font-size: 14px;
  line-height: 1.6;
}

.prose p {
  margin: 0.5em 0;
}

.prose p:first-child {
  margin-top: 0;
}

.prose p:last-child {
  margin-bottom: 0;
}

.prose strong {
  font-weight: 600;
}

.prose em {
  font-style: italic;
}

.prose code {
  background: rgba(0, 0, 0, 0.2);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
  font-family: 'Courier New', monospace;
}

.prose pre {
  background: rgba(0, 0, 0, 0.3);
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.75em 0;
}

.prose pre code {
  background: none;
  padding: 0;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  margin: 1em 0 0.5em;
  font-weight: 600;
  line-height: 1.3;
}

.prose h1 {
  font-size: 1.5em;
}
.prose h2 {
  font-size: 1.3em;
}
.prose h3 {
  font-size: 1.15em;
}
.prose h4 {
  font-size: 1em;
}

.prose ul,
.prose ol {
  margin: 0.75em 0;
  padding-left: 1.5em;
}

.prose li {
  margin: 0.25em 0;
}

.prose blockquote {
  border-left: 3px solid rgba(255, 255, 255, 0.3);
  padding-left: 1em;
  margin: 0.75em 0;
  font-style: italic;
  opacity: 0.9;
}

.prose a {
  color: #60a5fa;
  text-decoration: underline;
}

.prose a:hover {
  color: #93c5fd;
}

.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75em 0;
}

.prose th,
.prose td {
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5em;
  text-align: left;
}

.prose th {
  background: rgba(255, 255, 255, 0.1);
  font-weight: 600;
}
</style>

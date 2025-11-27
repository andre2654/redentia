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

      <!-- Message Content -->
      <div class="rounded-lg border border-white/20 bg-white/10 px-4 py-3">
        <div
          v-if="!message.structuredData"
          class="prose prose-sm dark:prose-invert max-w-none"
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

            <div
              v-if="message.structuredData.meta?.recommendation"
              class="mt-1 flex items-center gap-2"
            >
              <span class="text-sm opacity-70">Recomendação:</span>
              <span
                class="rounded px-2 py-0.5 text-xs font-bold uppercase"
                :class="{
                  'bg-green-500/20 text-green-400':
                    message.structuredData.meta.recommendation === 'buy',
                  'bg-yellow-500/20 text-yellow-400':
                    message.structuredData.meta.recommendation === 'hold',
                  'bg-red-500/20 text-red-400':
                    message.structuredData.meta.recommendation === 'sell',
                }"
              >
                {{ message.structuredData.meta.recommendation }}
              </span>
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

          <!-- Summary Text -->
          <div
            v-if="message.content"
            class="mt-2 text-sm leading-relaxed opacity-90"
          >
            <div
              class="prose prose-sm dark:prose-invert max-w-none"
              v-html="renderedContent"
            />
          </div>
        </div>
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

    const rawHtml = marked.parse(props.message.content)

    if (!import.meta.client) {
      renderedContent.value = escapeHtml(props.message.content)
      return
    }

    const purifier = await getDomPurify()
    renderedContent.value = purifier
      ? purifier.sanitize(rawHtml, {
          ALLOWED_TAGS,
          ALLOWED_ATTR,
        })
      : escapeHtml(props.message.content)
  } catch (error) {
    console.error('Failed to render markdown:', error)
    renderedContent.value = escapeHtml(props.message.content)
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

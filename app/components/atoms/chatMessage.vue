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
        <BrandLogo variant="icon" class="h-6 w-6 flex-shrink-0" />
        <span class="text-[17px] font-semibold">{{ brand.ai.typingLabel }}</span>
      </div>

      <!-- Status Indicator (Generative UI) -->
      <div
        v-if="message.status && !message.content && !message.structuredData"
        class="flex items-center gap-2 text-sm text-[rgb(var(--brand-overlay)_/_0.7)]"
      >
        <UIcon name="i-lucide-loader-2" class="h-4 w-4 motion-safe:animate-spin" />
        {{ message.status }}
      </div>

      <!-- Message Content -->
      <div
        v-if="message.content || message.structuredData"
        class="rounded-lg border border-[rgb(var(--brand-overlay)_/_0.2)] bg-[rgb(var(--brand-overlay)_/_0.1)] px-4 py-3"
      >
        <!-- Recommendation (from structured meta or REC: line) -->
        <div v-if="effectiveRecommendation" class="mb-2 flex items-center gap-2">
          <span class="text-xs opacity-70">Recomendação:</span>
          <span
            class="rounded px-2 py-0.5 text-xs font-bold uppercase"
            :style="{
              backgroundColor: recColor + '33',
              color: recColor,
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

        <!-- Structured Data Rendering (lazy sub-components) -->
        <div v-else class="flex w-full flex-col gap-3">
          <AtomsChatMessageStructuredPrice
            v-if="message.structuredData.type === 'price'"
            :data="message.structuredData"
          />
          <AtomsChatMessageStructuredChart
            v-else-if="message.structuredData.type === 'chart'"
            :data="message.structuredData"
          />
          <AtomsChatMessageStructuredDividends
            v-else-if="message.structuredData.type === 'dividends'"
            :data="message.structuredData"
          />
          <AtomsChatMessageStructuredAnalysis
            v-else-if="message.structuredData.type === 'analysis' && message.structuredData.data"
            :data="message.structuredData"
          />
          <AtomsChatMessageStructuredReport
            v-else-if="message.structuredData.type === 'report'"
            :data="message.structuredData"
          />

          <!-- Tool Results -->
          <AtomsChatMessageStructuredTools
            v-if="message.structuredData.toolsUsed?.length"
            :tools="message.structuredData.toolsUsed"
          />

          <!-- Summary Text -->
          <div v-if="message.content" class="mt-2 text-sm leading-relaxed opacity-90">
            <div class="prose prose-sm prose-invert max-w-none" v-html="renderedContent" />
          </div>

          <!-- Related Tickers -->
          <div
            v-if="message.structuredData.relatedTickers?.length"
            class="mt-2 flex flex-col gap-2 border-t border-[rgb(var(--brand-overlay)_/_0.1)] pt-3"
          >
            <div class="text-xs font-medium opacity-70">Ativos mencionados:</div>
            <div class="flex flex-wrap gap-3">
              <NuxtLink
                v-for="(item, index) in message.structuredData.relatedTickers"
                :key="index"
                :to="`/asset/${item.ticker?.toLowerCase?.() || item.ticker || ''}`"
                class="flex items-center gap-2 rounded bg-[rgb(var(--brand-overlay)_/_0.05)] px-3 py-2 transition-colors hover:bg-[rgb(var(--brand-overlay)_/_0.1)]"
              >
                <img
                  :src="item.logo"
                  :alt="item?.ticker ? `Logo do ativo ${item.ticker}` : 'Logo do ativo'"
                  class="h-6 w-6 rounded object-cover"
                  width="24"
                  height="24"
                  loading="lazy"
                />
                <span class="text-sm font-medium">{{ item.ticker }}</span>
                <span
                  class="text-xs font-medium"
                  :style="{ color: item.change.includes('-') ? brand.colors.negative : brand.colors.positive }"
                >
                  {{ item.change }}
                </span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Suggestions (Follow-up Chips) -->
      <div v-if="message.suggestions?.length" class="mt-1 flex flex-wrap gap-2">
        <button
          v-for="suggestion in message.suggestions"
          :key="suggestion"
          class="rounded-full border border-[rgb(var(--brand-overlay)_/_0.1)] bg-[rgb(var(--brand-overlay)_/_0.05)] px-3 py-1.5 text-xs text-[rgb(var(--brand-overlay)_/_0.8)] transition-colors hover:bg-[rgb(var(--brand-overlay)_/_0.1)] hover:text-[rgb(var(--brand-overlay))]"
          @click="$emit('action', suggestion)"
        >
          {{ suggestion }}
        </button>
      </div>

      <!-- Timestamp -->
      <small class="text-xs text-[rgb(var(--brand-overlay)_/_0.6)]">
        {{ formattedTime }}
      </small>
    </div>

    <!-- User Message -->
    <div v-else class="flex max-w-[70%] flex-col gap-2">
      <div class="bg-primary-500 rounded-lg px-4 py-3 text-[rgb(var(--brand-overlay))]">
        <p class="text-[14px]">{{ message.content }}</p>
      </div>
      <small class="text-right text-xs text-[rgb(var(--brand-overlay)_/_0.6)]">
        {{ formattedTime }}
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { IChatMessage } from '~/types/ai'

const brand = useBrand()

const props = defineProps<{ message: IChatMessage }>()
defineEmits<{ action: [text: string] }>()

// ==================== COMPUTED ====================

const renderedContent = ref(props.message.content)

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

const recColor = computed(() => {
  switch (effectiveRecommendation.value) {
    case 'buy': return brand.colors.positive
    case 'sell': return brand.colors.negative
    default: return brand.colors.neutral
  }
})

const recommendationLabel = computed(() => {
  switch (effectiveRecommendation.value) {
    case 'buy': return 'Compra'
    case 'hold': return 'Manter'
    case 'sell': return 'Venda'
    default: return ''
  }
})

// ==================== MARKDOWN ====================

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'a',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
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
    const cleanContent = props.message.content
      .replace(/^REC:\s*(NULL|BUY|SELL|HOLD)(\n|$)/im, '')
      .trim()

    if (!import.meta.client) {
      renderedContent.value = escapeHtml(cleanContent)
      return
    }

    marked.setOptions({ breaks: true, gfm: true })
    const rawHtml = marked.parse(cleanContent)

    const purifier = await getDomPurify()
    renderedContent.value = purifier
      ? purifier.sanitize(rawHtml, { ALLOWED_TAGS, ALLOWED_ATTR })
      : escapeHtml(cleanContent)
  } catch {
    renderedContent.value = escapeHtml(props.message.content)
  }
}

watch(
  () => [props.message.type, props.message.content],
  () => updateRenderedContent(),
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
.prose p { margin: 0.5em 0; }
.prose p:first-child { margin-top: 0; }
.prose p:last-child { margin-bottom: 0; }
.prose strong { font-weight: 600; }
.prose em { font-style: italic; }

.prose code {
  background: rgb(var(--brand-overlay, 0 0 0) / 0.2);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
  font-family: 'Courier New', monospace;
}
.prose pre {
  background: rgb(var(--brand-overlay, 0 0 0) / 0.3);
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.75em 0;
}
.prose pre code { background: none; padding: 0; }

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  margin: 1em 0 0.5em;
  font-weight: 600;
  line-height: 1.3;
}
.prose h1 { font-size: 1.5em; }
.prose h2 { font-size: 1.3em; }
.prose h3 { font-size: 1.15em; }
.prose h4 { font-size: 1em; }

.prose ul, .prose ol { margin: 0.75em 0; padding-left: 1.5em; }
.prose li { margin: 0.25em 0; }

.prose blockquote {
  border-left: 3px solid var(--brand-border, rgba(255, 255, 255, 0.3));
  padding-left: 1em;
  margin: 0.75em 0;
  font-style: italic;
  opacity: 0.9;
}
.prose a { color: var(--brand-secondary, var(--ui-secondary, #60a5fa)); text-decoration: underline; }
.prose a:hover { color: var(--brand-primary, var(--ui-primary, #93c5fd)); }

.prose table { width: 100%; border-collapse: collapse; margin: 0.75em 0; }
.prose th, .prose td {
  border: 1px solid var(--brand-border, rgba(255, 255, 255, 0.2));
  padding: 0.5em;
  text-align: left;
}
.prose th {
  background: var(--brand-surface-hover, rgba(255, 255, 255, 0.1));
  font-weight: 600;
}
</style>

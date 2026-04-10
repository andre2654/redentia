<template>
  <section
    v-if="commentaries.length > 0 || backfillStatus?.running"
    class="py-6"
  >
    <!-- Header (outside card) -->
    <header class="mb-4 flex items-end justify-between gap-4">
      <div>
        <p
          class="mb-1 text-[10px] font-medium uppercase tracking-[0.15em]"
          :style="{ color: brand.colors.textMuted }"
        >
          Analise com IA
        </p>
        <h3
          class="text-base font-semibold md:text-lg"
          :style="{ color: brand.colors.text }"
        >
          Movimentos notaveis
        </h3>
      </div>
      <span
        v-if="commentaries.length > 0"
        class="text-xs tabular-nums"
        :style="{ color: brand.colors.textMuted }"
      >
        {{ commentaries.length }} {{ commentaries.length === 1 ? 'evento' : 'eventos' }}
      </span>
    </header>

    <!-- Card container with internal scroll -->
    <div
      class="mc-card rounded-2xl border"
      :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
    >
      <!-- Backfill progress (inside card, sticky top) -->
      <div
        v-if="backfillStatus?.running && backfillStatus.total > 0"
        class="sticky top-0 z-10 flex items-center gap-3 border-b px-5 py-3 text-xs backdrop-blur-sm"
        :style="{
          color: brand.colors.textMuted,
          borderColor: brand.colors.border,
          backgroundColor: brand.colors.surface + 'ee',
        }"
      >
        <span class="h-1 w-1 animate-pulse rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
        Analisando {{ backfillStatus.current }}/{{ backfillStatus.total }} eventos
        <div
          class="h-px flex-1 overflow-hidden"
          :style="{ backgroundColor: brand.colors.border }"
        >
          <div
            class="h-full transition-all duration-500"
            :style="{
              width: `${Math.min(100, Math.round((backfillStatus.current / Math.max(1, backfillStatus.total)) * 100))}%`,
              backgroundColor: brand.colors.primary,
            }"
          />
        </div>
      </div>

      <!-- Scrollable timeline body -->
      <div class="mc-scroll overflow-y-auto px-5 py-4 md:px-6 md:py-5">
        <div class="mc-timeline">
          <template v-for="(item, idx) in commentaries" :key="item.id">
            <!-- Date cell -->
            <div
              :id="`commentary-${item.date}`"
              class="mc-date"
              :class="highlightedDate === item.date && 'mc-highlight-date'"
            >
              <div
                class="text-xs font-semibold tabular-nums"
                :style="{ color: brand.colors.text }"
              >
                {{ formatDateShort(item.date) }}
              </div>
              <div
                class="mt-0.5 text-[10px] uppercase tracking-wider"
                :style="{ color: brand.colors.textMuted }"
              >
                {{ relativeLabel(item.date) }}
              </div>
            </div>

            <!-- Dot + connector line cell -->
            <div class="mc-dot-cell">
              <!-- Connector line to next dot (except last) -->
              <span
                v-if="idx < commentaries.length - 1"
                class="mc-connector"
                :style="{ backgroundColor: brand.colors.border }"
              />
              <!-- Dot -->
              <span
                class="mc-dot"
                :style="{
                  borderColor: isPositive(item.change_percent) ? brand.colors.positive : brand.colors.negative,
                  backgroundColor: isToday(item.date)
                    ? (isPositive(item.change_percent) ? brand.colors.positive : brand.colors.negative)
                    : brand.colors.surface,
                }"
              />
            </div>

            <!-- Content cell -->
            <article class="mc-content">
              <!-- Price + change header -->
              <div class="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span
                  class="text-sm font-semibold tabular-nums"
                  :style="{ color: brand.colors.text }"
                >
                  {{ formatPrice(item) }}
                </span>
                <span
                  class="flex items-center gap-0.5 text-xs font-medium"
                  :style="{
                    color: isPositive(item.change_percent) ? brand.colors.positive : brand.colors.negative,
                  }"
                >
                  <UIcon
                    :name="isPositive(item.change_percent) ? 'i-lucide-arrow-up-right' : 'i-lucide-arrow-down-right'"
                    class="size-3"
                  />
                  {{ formatPercent(item.change_percent) }}
                </span>
                <span
                  class="text-[10px] uppercase tracking-wider"
                  :style="{ color: brand.colors.textMuted }"
                >
                  · {{ item.identifier }}
                </span>
              </div>

              <!-- Title -->
              <h4
                class="mb-1.5 text-[14px] font-semibold leading-snug"
                :style="{ color: brand.colors.text }"
              >
                {{ item.title }}
              </h4>

              <!-- Body -->
              <p
                class="text-[13px] leading-relaxed"
                :style="{ color: brand.colors.textMuted }"
              >
                {{
                  expanded[item.id]
                    ? item.commentary
                    : truncate(item.commentary, 220)
                }}
                <button
                  v-if="item.commentary.length > 220"
                  type="button"
                  class="ml-0.5 text-[11px] font-medium hover:underline"
                  :style="{ color: brand.colors.primary }"
                  @click="toggleExpand(item.id)"
                >
                  {{ expanded[item.id] ? 'recolher' : 'ler mais' }}
                </button>
              </p>

              <!-- Sources -->
              <div
                v-if="item.sources && item.sources.length > 0"
                class="mt-2.5"
              >
                <button
                  type="button"
                  class="inline-flex items-center gap-1 text-[11px] transition hover:underline"
                  :style="{ color: brand.colors.textMuted }"
                  @click="toggleSources(item.id)"
                >
                  <span class="tabular-nums">
                    {{ item.sources.length }} {{ item.sources.length === 1 ? 'fonte' : 'fontes' }}
                  </span>
                  <UIcon
                    :name="sourcesVisible[item.id] ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                    class="size-3"
                  />
                </button>

                <ul
                  v-if="sourcesVisible[item.id]"
                  class="mt-2 flex flex-col gap-1"
                >
                  <li v-for="src in item.sources" :key="src.url">
                    <a
                      :href="src.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1.5 text-[11px] transition hover:underline"
                      :style="{ color: brand.colors.textMuted }"
                    >
                      <span class="truncate max-w-[28rem]">{{ src.title || src.url }}</span>
                      <UIcon name="i-lucide-external-link" class="size-2.5 shrink-0 opacity-60" />
                    </a>
                  </li>
                </ul>
              </div>
            </article>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { IMarketCommentary } from '~/types/commentary'

const props = defineProps<{
  commentaries: IMarketCommentary[]
  highlightedDate?: string | null
  backfillStatus?: {
    running: boolean
    total: number
    current: number
    done: boolean
  } | null
}>()

const brand = useBrand()
const expanded = reactive<Record<number, boolean>>({})
const sourcesVisible = reactive<Record<number, boolean>>({})

function toggleExpand(id: number) {
  expanded[id] = !expanded[id]
}

function toggleSources(id: number) {
  sourcesVisible[id] = !sourcesVisible[id]
}

// ---- Formatting ----

function isPositive(value: number | string): boolean {
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) && num >= 0
}

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return dateStr.slice(0, 10) === today
}

function formatDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr.slice(0, 10) + 'T12:00:00')
    return d
      .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      .replace('.', '')
  } catch {
    return dateStr
  }
}

function relativeLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr.slice(0, 10) + 'T12:00:00')
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays <= 0) return 'hoje'
    if (diffDays === 1) return 'ontem'
    if (diffDays < 7) return `${diffDays}d`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}m`
    return `${Math.floor(diffDays / 365)}a`
  } catch {
    return ''
  }
}

function formatPercent(value: number | string): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return '0,00%'
  const sign = num >= 0 ? '+' : ''
  return `${sign}${num.toFixed(2).replace('.', ',')}%`
}

function extractPriceNumber(item: IMarketCommentary): number | null {
  const ctx = (item.context_data || {}) as Record<string, any>
  const raw =
    ctx.close ??
    ctx.current_price ??
    ctx.market_price ??
    ctx.price ??
    null
  if (raw === null || raw === undefined) return null
  const num = Number(raw)
  return Number.isFinite(num) ? num : null
}

function formatPrice(item: IMarketCommentary): string {
  const num = extractPriceNumber(item)
  if (num === null) return ''
  const formatted = num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  if (item.scope === 'index') return formatted
  return `R$ ${formatted}`
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trim() + '…'
}
</script>

<style scoped>
/* Card with max height + internal scroll */
.mc-card {
  max-height: 480px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mc-scroll {
  flex: 1;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(128, 128, 128, 0.25) transparent;
}

.mc-scroll::-webkit-scrollbar {
  width: 6px;
}
.mc-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.mc-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(128, 128, 128, 0.25);
  border-radius: 3px;
}
.mc-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(128, 128, 128, 0.4);
}

/* Timeline grid: date | dot | content */
.mc-timeline {
  display: grid;
  grid-template-columns: 58px 12px 1fr;
  column-gap: 16px;
  row-gap: 28px;
  align-items: start;
}

@media (min-width: 768px) {
  .mc-timeline {
    grid-template-columns: 68px 12px 1fr;
    column-gap: 20px;
  }
}

.mc-date {
  padding-top: 1px;
  text-align: right;
}

/* Dot cell — relative so connector line can absolute-position */
.mc-dot-cell {
  position: relative;
  padding-top: 4px;
  height: 100%;
}

.mc-dot {
  position: relative;
  display: block;
  width: 12px;
  height: 12px;
  border-width: 2px;
  border-style: solid;
  border-radius: 9999px;
  z-index: 2;
}

/* Connector line extends from below the dot into the gap below to reach next dot center */
.mc-connector {
  position: absolute;
  left: 50%;
  top: 16px; /* below the dot (4 + 12) */
  /* extends 28px (row-gap) + 4px (next pt) + 6px (half dot) = 38px */
  bottom: -32px;
  width: 1px;
  transform: translateX(-50%);
}

.mc-content {
  min-width: 0;
}

/* Date highlight flash (when clicking chart marker) */
@keyframes mc-flash {
  0% { opacity: 0; }
  25% { opacity: 1; }
  100% { opacity: 0; }
}

.mc-highlight-date {
  position: relative;
}
.mc-highlight-date::before {
  content: '';
  position: absolute;
  inset: -6px -8px;
  border-radius: 6px;
  background-color: currentColor;
  opacity: 0;
  animation: mc-flash 2s ease-out;
  pointer-events: none;
}
</style>

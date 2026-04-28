<template>
  <!-- TERMINAL VARIANT (Redentia, Bloomberg-style) -->
  <section
    v-if="terminalVariant && (commentaries.length > 0 || backfillStatus?.running)"
    class="py-6"
  >
    <!-- Status bar header -->
    <header
      class="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 border px-3 py-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
      :style="{ borderColor: 'var(--brand-border)', color: 'var(--brand-text-muted)', backgroundColor: 'var(--brand-surface)' }"
    >
      <span :style="{ color: 'var(--brand-text)' }">Movimentos notáveis</span>
      <span :style="{ color: 'var(--brand-border)' }">·</span>
      <span>AI · ANTHROPIC</span>
      <span class="ml-auto flex items-center gap-3">
        <span
          v-if="backfillStatus?.running"
          class="inline-flex items-center gap-1.5"
          :style="{ color: 'var(--brand-primary)' }"
        >
          <span class="h-1.5 w-1.5 motion-safe:animate-pulse rounded-full" :style="{ backgroundColor: 'var(--brand-primary)' }" />
          INGESTING {{ backfillStatus.current }}/{{ backfillStatus.total }}
        </span>
        <span v-if="commentaries.length > 0" class="tabular-nums">
          {{ commentaries.length }} EVENTS
        </span>
      </span>
    </header>

    <!-- Dense terminal grid -->
    <div
      class="border font-mono-tab"
      :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-background)' }"
    >
      <!-- Column headers -->
      <div
        class="grid border-b px-3 py-1.5 text-[9px] uppercase tracking-[0.18em]"
        :style="{
          borderColor: 'var(--brand-border)',
          color: 'var(--brand-text-muted)',
          gridTemplateColumns: '72px 64px 80px 1fr',
          gap: '12px',
        }"
      >
        <span>DATE</span>
        <span>TICKER</span>
        <span class="text-right">%CHG</span>
        <span>HEADLINE</span>
      </div>

      <!-- Scrollable rows -->
      <div class="mc-terminal-scroll" style="max-height: 540px; overflow-y: auto;">
        <div
          v-for="item in commentaries"
          :key="item.id"
          :id="`commentary-${item.date}`"
          class="border-b last:border-b-0"
          :style="{ borderColor: 'var(--brand-border)' + '66' }"
        >
          <!-- Collapsed row -->
          <button
            type="button"
            :aria-expanded="!!expanded[item.id]"
            class="grid w-full cursor-pointer items-center px-3 py-2 text-left transition-colors hover:bg-[var(--hover-bg,rgba(255,255,255,0.03))]"
            :class="highlightedDate === item.date && 'mc-terminal-highlight'"
            :style="{
              gridTemplateColumns: '72px 64px 80px 1fr',
              gap: '12px',
            }"
            @click="toggleExpand(item.id)"
          >
            <span
              class="text-[11px] font-semibold tabular-nums"
              :style="{ color: 'var(--brand-text)' }"
            >
              {{ formatDateTerminal(item.date) }}
            </span>
            <span
              class="truncate text-[11px] font-bold"
              :style="{ color: 'var(--brand-primary)' }"
            >
              {{ item.identifier }}
            </span>
            <span
              class="text-right text-[11px] font-semibold tabular-nums"
              :style="{
                color: isPositive(item.change_percent) ? brand.colors.positive : 'var(--brand-negative)',
              }"
            >
              {{ formatPercent(item.change_percent) }}
            </span>
            <span
              class="flex min-w-0 items-center gap-2 text-[12px] leading-tight"
              :style="{ color: 'var(--brand-text)' }"
            >
              <span class="truncate">{{ item.title }}</span>
              <UIcon
                :name="expanded[item.id] ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                class="ml-auto size-3 shrink-0"
                :style="{ color: 'var(--brand-text-muted)' }"
              />
            </span>
          </button>

          <!-- Expanded body -->
          <div
            v-if="expanded[item.id]"
            class="grid gap-x-3 px-3 pb-3 text-[12px] leading-relaxed"
            :style="{
              gridTemplateColumns: '72px 64px 80px 1fr',
              color: 'var(--brand-text-muted)',
              backgroundColor: 'var(--brand-surface)' + '55',
            }"
          >
            <span></span>
            <span></span>
            <span></span>
            <div class="pt-1">
              <div class="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-tab text-[10px] uppercase tracking-[0.12em]">
                <span v-if="extractPriceNumber(item) !== null" :style="{ color: 'var(--brand-text)' }">
                  PRICE {{ formatPrice(item) }}
                </span>
                <span v-if="item.scope" :style="{ color: 'var(--brand-text-muted)' }">
                  SCOPE · {{ item.scope.toUpperCase() }}
                </span>
                <span v-if="item.ai_model" :style="{ color: 'var(--brand-text-muted)' }">
                  MODEL · {{ item.ai_model }}
                </span>
              </div>
              <p
                class="whitespace-pre-line text-[12.5px] leading-relaxed"
                :style="{ color: 'var(--brand-text)', fontFamily: 'Inter, system-ui, sans-serif' }"
              >
                {{ item.commentary }}
              </p>

              <div
                v-if="item.sources && item.sources.length > 0"
                class="mt-3 border-t pt-2"
                :style="{ borderColor: 'var(--brand-border)' }"
              >
                <div class="mb-1.5 text-[9px] uppercase tracking-[0.18em]" :style="{ color: 'var(--brand-text-muted)' }">
                  Fontes · {{ item.sources.length }}
                </div>
                <ul class="flex flex-col gap-1">
                  <li v-for="src in item.sources" :key="src.url">
                    <a
                      :href="src.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1.5 text-[11px] transition hover:underline"
                      :style="{ color: 'var(--brand-text-muted)', fontFamily: 'Inter, system-ui, sans-serif' }"
                    >
                      <span class="truncate max-w-[32rem]">{{ src.title || src.url }}</span>
                      <UIcon name="i-lucide-external-link" class="size-2.5 shrink-0 opacity-60" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer status -->
      <div
        class="flex items-center gap-2 border-t px-3 py-1.5 font-mono-tab text-[9px] uppercase tracking-[0.18em]"
        :style="{ borderColor: 'var(--brand-border)', color: 'var(--brand-text-muted)' }"
      >
        <span>CLIQUE EM UMA LINHA PARA EXPANDIR</span>
        <span class="ml-auto">ORDENADO POR DATA DESC</span>
      </div>
    </div>
  </section>

  <!-- DEFAULT VARIANT (all non-terminal tenants) -->
  <section
    v-else-if="commentaries.length > 0 || backfillStatus?.running"
    class="py-6"
  >
    <!-- Header (outside card) -->
    <header class="mb-4 flex items-end justify-between gap-4">
      <div>
        <p
          class="mb-1 text-[10px] font-medium uppercase tracking-[0.15em]"
          :style="{ color: 'var(--brand-text-muted)' }"
        >
          Analise com IA
        </p>
        <h3
          class="text-base font-semibold md:text-lg"
          :style="{ color: 'var(--brand-text)' }"
        >
          Movimentos notaveis
        </h3>
      </div>
      <span
        v-if="commentaries.length > 0"
        class="text-xs tabular-nums"
        :style="{ color: 'var(--brand-text-muted)' }"
      >
        {{ commentaries.length }} {{ commentaries.length === 1 ? 'evento' : 'eventos' }}
      </span>
    </header>

    <!-- Card container with internal scroll -->
    <div
      class="mc-card rounded-2xl border"
      :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }"
    >
      <!-- Backfill progress (inside card, sticky top) -->
      <div
        v-if="backfillStatus?.running && backfillStatus.total > 0"
        class="sticky top-0 z-10 flex items-center gap-3 border-b px-5 py-3 text-xs backdrop-blur-sm"
        :style="{
          color: 'var(--brand-text-muted)',
          borderColor: 'var(--brand-border)',
          backgroundColor: 'var(--brand-surface)' + 'ee',
        }"
      >
        <span class="h-1 w-1 motion-safe:animate-pulse rounded-full" :style="{ backgroundColor: 'var(--brand-primary)' }" />
        Analisando {{ backfillStatus.current }}/{{ backfillStatus.total }} eventos
        <div
          class="h-px flex-1 overflow-hidden"
          :style="{ backgroundColor: 'var(--brand-border)' }"
        >
          <div
            class="h-full transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-500"
            :style="{
              width: `${Math.min(100, Math.round((backfillStatus.current / Math.max(1, backfillStatus.total)) * 100))}%`,
              backgroundColor: 'var(--brand-primary)',
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
                :style="{ color: 'var(--brand-text)' }"
              >
                {{ formatDateShort(item.date) }}
              </div>
              <div
                class="mt-0.5 text-[10px] uppercase tracking-wider"
                :style="{ color: 'var(--brand-text-muted)' }"
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
                :style="{ backgroundColor: 'var(--brand-border)' }"
              />
              <!-- Dot -->
              <span
                class="mc-dot"
                :style="{
                  borderColor: isPositive(item.change_percent) ? brand.colors.positive : 'var(--brand-negative)',
                  backgroundColor: isToday(item.date)
                    ? (isPositive(item.change_percent) ? brand.colors.positive : brand.colors.negative)
                    : 'var(--brand-surface)',
                }"
              />
            </div>

            <!-- Content cell -->
            <article class="mc-content">
              <!-- Price + change header -->
              <div class="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span
                  class="text-sm font-semibold tabular-nums"
                  :style="{ color: 'var(--brand-text)' }"
                >
                  {{ formatPrice(item) }}
                </span>
                <span
                  class="flex items-center gap-0.5 text-xs font-medium"
                  :style="{
                    color: isPositive(item.change_percent) ? brand.colors.positive : 'var(--brand-negative)',
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
                  :style="{ color: 'var(--brand-text-muted)' }"
                >
                  · {{ item.identifier }}
                </span>
              </div>

              <!-- Title -->
              <h4
                class="mb-1.5 text-[14px] font-semibold leading-snug"
                :style="{ color: 'var(--brand-text)' }"
              >
                {{ item.title }}
              </h4>

              <!-- Body -->
              <p
                class="text-[13px] leading-relaxed"
                :style="{ color: 'var(--brand-text-muted)' }"
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
                  :style="{ color: 'var(--brand-primary)' }"
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
                  :style="{ color: 'var(--brand-text-muted)' }"
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
                      :style="{ color: 'var(--brand-text-muted)' }"
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

const terminalVariant = computed(() => brand.hero?.variant === 'terminal')

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

function formatDateTerminal(dateStr: string): string {
  try {
    const d = new Date(dateStr.slice(0, 10) + 'T12:00:00')
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = String(d.getFullYear()).slice(2)
    return `${day}/${month}/${year}`
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

/* Dot cell, relative so connector line can absolute-position */
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
  top: 16px;
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

/* Terminal variant scroll */
.mc-terminal-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(245, 166, 35, 0.25) transparent;
}
.mc-terminal-scroll::-webkit-scrollbar {
  width: 6px;
}
.mc-terminal-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.mc-terminal-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(245, 166, 35, 0.25);
  border-radius: 0;
}
.mc-terminal-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(245, 166, 35, 0.5);
}

.mc-terminal-highlight {
  background-color: rgba(245, 166, 35, 0.12);
}
</style>

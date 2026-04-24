<template>
  <section
    v-if="data"
    :aria-label="`Consenso dos analistas para ${ticker}`"
  >
    <div class="mb-4 flex flex-col gap-1">
      <span
        class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
        :style="{ color: brand.colors.primary }"
      >
        [CONSENSUS.ANALYSTS]
      </span>
      <h2
        class="text-xl font-semibold md:text-2xl"
        :style="{ color: brand.colors.text }"
      >
        Consenso dos analistas
      </h2>
      <p
        class="font-mono-tab text-[10px] uppercase tracking-[0.12em]"
        :style="{ color: brand.colors.textMuted }"
      >
        &gt; TARGET MÉDIO · {{ coverageLabel }}
      </p>
    </div>

    <div class="border" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
      <!-- Recommendation + upside cells (register style, glued with gap-px) -->
      <div
        class="grid grid-cols-2 gap-px"
        :style="{ backgroundColor: brand.colors.border }"
      >
        <div
          class="flex flex-col gap-1.5 px-4 py-4"
          :style="{ backgroundColor: brand.colors.surface }"
        >
          <span
            class="font-mono-tab text-[9px] uppercase tracking-[0.18em]"
            :style="{ color: brand.colors.primary }"
          >
            [01]
          </span>
          <span
            class="font-mono-tab text-[10px] uppercase tracking-wider"
            :style="{ color: brand.colors.textMuted }"
          >
            RECOMENDAÇÃO
          </span>
          <span
            class="font-mono-tab text-xl font-bold uppercase tracking-wide"
            :style="{ color: recommendationColor }"
          >
            {{ recommendationLabel }}
          </span>
        </div>

        <div
          class="flex flex-col gap-1.5 px-4 py-4"
          :style="{ backgroundColor: brand.colors.surface }"
        >
          <span
            class="font-mono-tab text-[9px] uppercase tracking-[0.18em]"
            :style="{ color: brand.colors.primary }"
          >
            [02]
          </span>
          <span
            class="font-mono-tab text-[10px] uppercase tracking-wider"
            :style="{ color: brand.colors.textMuted }"
          >
            UPSIDE
          </span>
          <span
            class="font-mono-tab text-xl font-bold tabular-nums"
            :style="{ color: upsideColor }"
          >
            {{ upsideLabel }}
          </span>
        </div>
      </div>

      <!-- Target range bar -->
      <div
        v-if="hasTargetRange"
        class="border-t px-4 pt-4 pb-5"
        :style="{ borderColor: brand.colors.border }"
      >
        <div
          class="mb-3 flex items-center justify-between font-mono-tab text-[9px] uppercase tracking-[0.18em]"
          :style="{ color: brand.colors.textMuted }"
        >
          <span>&gt; PRICE TARGET RANGE</span>
          <span v-if="data.price?.usd_brl" class="tabular-nums">
            USD/BRL {{ data.price.usd_brl.toFixed(2) }}
          </span>
        </div>

        <!-- Tick bars, like RiskMeter vibe -->
        <div class="flex h-2.5 w-full gap-[2px]">
          <div
            v-for="i in totalBars"
            :key="i"
            class="h-full flex-1 rounded-[1px]"
            :style="{
              backgroundColor: getBarColor(i),
              opacity: getBarOpacity(i),
            }"
          />
        </div>

        <!-- Min / Current / Max ruler -->
        <div
          class="mt-2 flex items-start justify-between font-mono-tab text-[9px] uppercase tracking-[0.15em]"
          :style="{ color: brand.colors.textMuted }"
        >
          <div class="flex flex-col items-start gap-0.5">
            <span>LOW</span>
            <span class="tabular-nums" :style="{ color: brand.colors.text }">
              {{ formatCurrency(data.price?.target_low) }}
            </span>
          </div>
          <div class="flex flex-col items-center gap-0.5">
            <span :style="{ color: brand.colors.primary }">ATUAL</span>
            <span class="tabular-nums font-bold" :style="{ color: brand.colors.text }">
              {{ formatCurrency(data.price?.close) }}
            </span>
          </div>
          <div class="flex flex-col items-end gap-0.5">
            <span>HIGH</span>
            <span class="tabular-nums" :style="{ color: brand.colors.text }">
              {{ formatCurrency(data.price?.target_high) }}
            </span>
          </div>
        </div>

        <!-- Target médio callout -->
        <div
          v-if="data.price?.target_average !== null && data.price?.target_average !== undefined"
          class="mt-4 flex items-center justify-between border-t pt-3"
          :style="{ borderColor: brand.colors.border }"
        >
          <span
            class="font-mono-tab text-[10px] uppercase tracking-[0.15em]"
            :style="{ color: brand.colors.textMuted }"
          >
            TARGET MÉDIO
          </span>
          <span
            class="font-mono-tab text-base font-bold tabular-nums"
            :style="{ color: brand.colors.text }"
          >
            {{ formatCurrency(data.price.target_average) }}
          </span>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
interface ConsensusResponse {
  ticker: string
  coverage: string
  recommendation: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell' | null
  recommendation_mark: number | null
  price: {
    close: number | null
    target_low: number | null
    target_average: number | null
    target_median: number | null
    target_high: number | null
    currency: string
    usd_brl: number | null
  } | null
  upside_percent: number | null
  breakdown: {
    bullish: number | null
    neutral: number | null
    bearish: number | null
    analyst_count: number | null
    aggregate_label: string | null
  }
  source: string
  refreshed_at: string | null
}

const props = defineProps<{ ticker: string }>()
const brand = useBrand()
const runtimeConfig = useRuntimeConfig()
const apiBase = runtimeConfig.public.apiBaseUrl as string

const { data } = await useAsyncData(
  () => `consensus-${props.ticker}`,
  async () => {
    if (!props.ticker || !/^[A-Z]{4}\d{1,2}$/.test(props.ticker)) return null
    try {
      const resp = await $fetch<ConsensusResponse | null>(`${apiBase}/consensus/${props.ticker}`)
      return resp ?? null
    } catch {
      return null
    }
  },
  { server: true, default: () => null, watch: [() => props.ticker] },
)

const ticker = computed(() => props.ticker)

const coverageLabel = computed(() => {
  const count = data.value?.breakdown?.analyst_count
  if (count) return `${count} ANALISTAS`
  const cov = data.value?.coverage
  if (cov) return String(cov).toUpperCase()
  return 'COBERTURA COMPILADA'
})

const RECOMMENDATION_LABELS: Record<string, string> = {
  strong_buy: 'STRONG BUY',
  buy: 'BUY',
  neutral: 'NEUTRAL',
  sell: 'SELL',
  strong_sell: 'STRONG SELL',
}

const recommendationLabel = computed(() => {
  if (!data.value?.recommendation) return 'N/A'
  return RECOMMENDATION_LABELS[data.value.recommendation] ?? data.value.recommendation.toUpperCase()
})

const recommendationColor = computed(() => {
  const rec = data.value?.recommendation
  if (rec === 'strong_buy' || rec === 'buy') return brand.colors.positive
  if (rec === 'sell' || rec === 'strong_sell') return brand.colors.negative
  return brand.colors.text
})

const upsideLabel = computed(() => {
  const v = data.value?.upside_percent
  if (v === null || v === undefined) return '—'
  const sign = v >= 0 ? '+' : ''
  return `${sign}${v.toFixed(1)}%`
})

const upsideColor = computed(() => {
  const v = data.value?.upside_percent
  if (v === null || v === undefined) return brand.colors.text
  return v >= 0 ? brand.colors.positive : brand.colors.negative
})

const hasTargetRange = computed(() => {
  const p = data.value?.price
  if (!p) return false
  return p.target_low !== null && p.target_high !== null && p.target_low < p.target_high
})

const totalBars = 32

/**
 * Position of current price relative to [low, high] range, clamped into 0..1.
 * When we don't have a close we default to the middle (avg position).
 */
const currentPosition = computed(() => {
  const p = data.value?.price
  if (!p || p.target_low === null || p.target_high === null) return 0.5
  const span = p.target_high - p.target_low
  if (span <= 0) return 0.5
  const v = p.close ?? p.target_average ?? p.target_low
  return Math.min(1, Math.max(0, (v - p.target_low) / span))
})

const activeBarIndex = computed(() => Math.round(currentPosition.value * (totalBars - 1)) + 1)

function getBarColor(index: number): string {
  const pct = (index - 1) / (totalBars - 1)
  if (pct <= 0.5) {
    return interpolateColor(brand.colors.negative, brand.colors.neutral ?? brand.colors.textMuted, pct * 2)
  }
  return interpolateColor(brand.colors.neutral ?? brand.colors.textMuted, brand.colors.positive, (pct - 0.5) * 2)
}

function getBarOpacity(index: number): number {
  const distance = Math.abs(index - activeBarIndex.value)
  if (distance === 0) return 1
  if (distance <= 2) return 0.75
  if (distance <= 5) return 0.4
  return 0.18
}

function interpolateColor(a: string, b: string, t: number): string {
  const toRgb = (hex: string) => {
    const clean = hex.replace('#', '')
    const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
    return [
      parseInt(full.substring(0, 2), 16),
      parseInt(full.substring(2, 4), 16),
      parseInt(full.substring(4, 6), 16),
    ]
  }
  const [r1, g1, b1] = toRgb(a)
  const [r2, g2, b2] = toRgb(b)
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const bl = Math.round(b1 + (b2 - b1) * t)
  return `rgb(${r}, ${g}, ${bl})`
}

function formatCurrency(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(v)
}
</script>

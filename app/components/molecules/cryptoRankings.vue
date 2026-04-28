<!--
  Crypto bento rankings — Redentia home.
  Hero card (Bitcoin, 30d sparkline, preço grande), tiles laterais compactos
  para as próximas 6 moedas por market cap, e uma faixa horizontal com os
  maiores gainers de 24h. Quebra visualmente do layout em lista repetido
  pelos rankings de ações (acima) e Tesouro Direto (abaixo).
-->
<template>
  <section v-if="items.length" class="pt-10 md:pt-16">
    <header class="mb-8 flex flex-col gap-2 px-4 md:px-0">
      <span class="eyebrow">Criptomoedas</span>
      <h2 class="font-light leading-tight text-[28px] md:text-[36px]" style="color: var(--text-heading); letter-spacing: -0.025em;">
        Top 7 por market cap
      </h2>
      <p class="text-[14px] leading-relaxed" style="color: var(--text-body);">
        Cotações em real, atualizadas a cada minuto.
      </p>
    </header>

    <!-- Bento quiet: hero (BTC) + 6 tiles laterais. Container rounded-lg
         com border-subtle. Tiles separados por divisor sutil. -->
    <div
      v-if="hero"
      class="bento-grid mx-2 overflow-hidden rounded-lg border md:mx-0"
      style="border-color: var(--border-subtle); background-color: var(--border-subtle); gap: 1px;"
    >
      <!-- Hero card: spans 2x2 em md+. Sem ambient overlay agressivo. -->
      <NuxtLink
        :to="`/crypto/${hero.id}`"
        class="bento-hero relative flex flex-col justify-between overflow-hidden p-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset md:p-8"
        style="background-color: var(--bg-elevated);"
        :aria-label="`Ver ${hero.name}`"
      >
        <!-- Ambient radial discreto no accent (positive/negative/primary) -->
        <div
          class="pointer-events-none absolute inset-0"
          :style="{ background: `radial-gradient(ellipse at top right, ${heroAccent}14, transparent 65%)` }"
          aria-hidden="true"
        />

        <div class="relative flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <NuxtImg
              v-if="hero.image"
              :src="hero.image"
              :alt="`Logo ${hero.name}`"
              width="48"
              height="48"
              loading="lazy"
              decoding="async"
              class="size-12 shrink-0 rounded-lg"
            />
            <div class="flex flex-col gap-1">
              <span class="eyebrow" translate="no">Destaque</span>
              <span class="text-[18px] font-medium leading-tight" style="color: var(--text-heading);">
                {{ hero.name }}
              </span>
            </div>
          </div>

          <!-- Rank: caption sutil, sem mono uppercase wide -->
          <span
            class="text-[12px] tabular-nums"
            style="color: var(--text-muted);"
            translate="no"
          >
            #{{ hero.rank ?? '—' }} mcap
          </span>
        </div>

        <div class="relative mt-6 flex items-end justify-between gap-4">
          <div class="flex flex-col gap-1.5">
            <span class="text-[11px] font-medium uppercase tracking-[0.12em]" style="color: var(--text-muted);" translate="no">
              Preço BRL
            </span>
            <span
              class="font-light leading-none tabular-nums text-[32px] sm:text-[40px] md:text-[48px]"
              style="color: var(--text-heading); letter-spacing: -0.025em;"
              translate="no"
            >
              {{ fmt.brl(hero.price_brl) }}
            </span>
          </div>

          <!-- Variacao: badge quiet (radius 4px, weight 500, sem pill full) -->
          <span
            class="inline-flex shrink-0 items-center gap-1 rounded-[4px] border px-2 py-1 text-[12px] font-medium tabular-nums"
            :style="{
              backgroundColor: `color-mix(in srgb, ${heroAccent} 14%, transparent)`,
              borderColor: `color-mix(in srgb, ${heroAccent} 30%, transparent)`,
              color: heroAccent,
            }"
            translate="no"
          >
            <span aria-hidden="true">{{ (hero.change_24h_pct ?? 0) >= 0 ? '+' : '−' }}</span>
            {{ Math.abs(hero.change_24h_pct ?? 0).toFixed(2) }}%
          </span>
        </div>

        <!-- Sparkline 30d -->
        <div class="relative mt-4 h-14">
          <svg
            v-if="heroSparkline.points.length > 1"
            :viewBox="`0 0 ${heroSparkline.width} ${heroSparkline.height}`"
            preserveAspectRatio="none"
            class="h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <linearGradient :id="`spark-${hero.id}`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" :stop-color="heroAccent" stop-opacity="0.35" />
                <stop offset="100%" :stop-color="heroAccent" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path
              :d="heroSparkline.area"
              :fill="`url(#spark-${hero.id})`"
            />
            <path
              :d="heroSparkline.line"
              fill="none"
              :stroke="heroAccent"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              vector-effect="non-scaling-stroke"
            />
          </svg>
          <div v-else class="flex h-full items-center justify-center">
            <span class="text-[12px]" style="color: var(--text-muted);">
              Carregando 30d…
            </span>
          </div>
        </div>

        <!-- Footer stats: caption normal sem mono uppercase, divisor subtle -->
        <div
          class="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-[12px]"
          style="border-color: var(--border-subtle); color: var(--text-muted);"
        >
          <span translate="no">
            Mcap <span class="tabular-nums" style="color: var(--text-heading);">{{ compactBRL(hero.market_cap_brl) }}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span translate="no">
            Vol 24h <span class="tabular-nums" style="color: var(--text-heading);">{{ compactBRL(hero.volume_24h_brl) }}</span>
          </span>
          <span v-if="hero.market_cap_dominance_pct != null" aria-hidden="true">·</span>
          <span v-if="hero.market_cap_dominance_pct != null" translate="no">
            Dom <span class="tabular-nums" style="color: var(--text-heading);">{{ hero.market_cap_dominance_pct.toFixed(1) }}%</span>
          </span>
        </div>
      </NuxtLink>

      <!-- Tiles: next 6 by market cap. Layout simples weight 500. -->
      <NuxtLink
        v-for="tile in tiles"
        :key="`tile-${tile.id}`"
        :to="`/crypto/${tile.id}`"
        class="bento-tile flex flex-col justify-between gap-2 p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
        style="background-color: var(--bg-elevated);"
        :aria-label="`Ver ${tile.name}`"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <NuxtImg
              v-if="tile.image"
              :src="tile.image"
              :alt="`Logo ${tile.name}`"
              width="24"
              height="24"
              loading="lazy"
              decoding="async"
              class="size-6 shrink-0 rounded-md"
            />
            <span class="text-[13px] font-medium tracking-tight" style="color: var(--text-heading);" translate="no">
              {{ tile.symbol.toUpperCase() }}
            </span>
          </div>
          <span class="text-[11px] tabular-nums" style="color: var(--text-muted);" translate="no">
            #{{ tile.rank ?? '—' }}
          </span>
        </div>

        <div class="flex items-baseline justify-between gap-2">
          <span class="text-[14px] font-light tabular-nums" style="color: var(--text-heading); letter-spacing: -0.01em;" translate="no">
            {{ fmt.brl(tile.price_brl) }}
          </span>
          <span
            class="text-[12px] font-medium tabular-nums"
            :style="{ color: changeColor(tile.change_24h_pct) }"
            translate="no"
          >
            {{ (tile.change_24h_pct ?? 0) >= 0 ? '+' : '−' }}{{ Math.abs(tile.change_24h_pct ?? 0).toFixed(2) }}%
          </span>
        </div>
      </NuxtLink>
    </div>

  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCryptoService, type CryptoAssetItem, type CryptoPricePoint } from '~/services/crypto'
import { useFormat } from '~/composables/useFormat'

const brand = useBrand()
const fmt = useFormat()
const { listCryptos, getCryptoPrices } = useCryptoService()

const items = ref<CryptoAssetItem[]>([])
const heroPrices = ref<CryptoPricePoint[]>([])

onMounted(async () => {
  try {
    items.value = await listCryptos(40)
    if (hero.value?.id) {
      heroPrices.value = await getCryptoPrices(hero.value.id, '30d')
    }
  } catch {
    // graceful degrade: section stays empty
  }
})

// By market cap (rank ascending)
const byMarketCap = computed(() =>
  [...items.value]
    .filter((c) => c.price_brl != null && c.rank != null)
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999)),
)

const hero = computed(() => byMarketCap.value[0] ?? null)
const tiles = computed(() => byMarketCap.value.slice(1, 7))

const heroAccent = computed(() => {
  const pct = hero.value?.change_24h_pct ?? 0
  if (pct > 0) return brand.colors.positive
  if (pct < 0) return brand.colors.negative
  return brand.colors.primary
})

function changeColor(pct: number | null | undefined): string {
  const n = pct ?? 0
  if (n > 0) return brand.colors.positive
  if (n < 0) return brand.colors.negative
  return brand.colors.textMuted
}

function compactBRL(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value).replace(/\s/g, '\u00A0')
}

// Build a normalized sparkline SVG path from the price points
const heroSparkline = computed(() => {
  const points = (heroPrices.value || [])
    .map((p) => p.price_brl)
    .filter((v): v is number => v != null && Number.isFinite(v))

  const width = 100
  const height = 40

  if (points.length < 2) {
    return { points, width, height, line: '', area: '' }
  }

  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const stepX = width / (points.length - 1)

  const coords = points.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * height
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })

  const line = `M ${coords.join(' L ')}`
  const area = `${line} L ${width},${height} L 0,${height} Z`

  return { points, width, height, line, area }
})
</script>

<style scoped>
/* Bento: 1 hero (col-span 2, row-span 2) + 6 tiles on the right */
.bento-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
}

.bento-hero {
  min-height: 320px;
}

@media (min-width: 768px) {
  .bento-grid {
    grid-template-columns: 2fr 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }
  .bento-hero {
    grid-column: 1 / span 1;
    grid-row: 1 / span 2;
    min-height: 100%;
  }
}

.bento-tile {
  min-height: 104px;
}

.bento-hero:hover,
.bento-tile:hover {
  filter: brightness(1.08);
}

</style>

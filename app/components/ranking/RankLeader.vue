<script setup lang="ts">
// Spotlight do #1 do ranking — card branco com logo grande (NuAssetLogo,
// fallback tile de letra), ticker + nome + setor à esquerda e o número-herói
// da métrica primária em 2 tons à direita (identidade dos cards Nu:
// número gigante ink + label muted, tabular-nums, sem quadriculado).
import type { RankingColumnKey, RankingRowApi } from '~/types/rankings'

const props = defineProps<{
  row: RankingRowApi
  primaryMetric: RankingColumnKey
  /** label da métrica (sobrescreve o default da coluna, ex.: 'Variação 30d'). */
  metricLabel?: string
}>()

const ticker = computed(() => rankingTicker(props.row))
const name = computed(() => rankingName(props.row))
const col = computed(() => RANKING_COLUMNS[props.primaryMetric])
const value = computed(() => col.value.format(props.row))
const label = computed(() => props.metricLabel ?? col.value.label)
const price = computed(() => rankingPrice(props.row))
const tone = computed(() => {
  if (!col.value.signed) return ''
  const v = col.value.raw(props.row) ?? 0
  return v < 0 ? 'rkl__value--down' : 'rkl__value--up'
})
</script>

<template>
  <NuxtLink :to="`/acao/${ticker.toLowerCase()}`" class="rkl">
    <span class="rkl__crown">Nº 1 do ranking</span>
    <div class="rkl__main">
      <div class="rkl__id">
        <NuAssetLogo
          :ticker="ticker" :letter="ticker.charAt(0) || '?'"
          tile-bg="var(--nu-tile-blue-bg)" tile-fg="var(--nu-blue-deep)"
          :size="52" :radius="16"
        />
        <div class="rkl__who">
          <span class="rkl__ticker">{{ ticker }}</span>
          <span v-if="name" class="rkl__name">{{ name }}</span>
          <span v-if="row.sector" class="rkl__sector">{{ row.sector }}</span>
        </div>
      </div>
      <div class="rkl__metric">
        <span class="rkl__value" :class="tone">{{ value }}</span>
        <span class="rkl__label">{{ label }}</span>
        <span v-if="price !== '—'" class="rkl__price">Cotação {{ price }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.rkl {
  display: block; background: var(--nu-white); border-radius: var(--nu-r-card-lg);
  padding: clamp(24px, 3vw, 36px); transition: transform .18s, box-shadow .2s;
}
.rkl:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.rkl__crown {
  display: inline-flex; background: var(--nu-blue-tint); color: var(--nu-blue);
  border-radius: var(--nu-r-pill); padding: 6px 14px;
  font-size: 12.5px; font-weight: 800; letter-spacing: .2px; text-transform: uppercase;
}
.rkl__main {
  display: flex; align-items: center; justify-content: space-between;
  gap: 24px; flex-wrap: wrap; margin-top: 20px;
}
.rkl__id { display: flex; align-items: center; gap: 16px; min-width: 0; }
.rkl__who { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.rkl__ticker { color: var(--nu-ink); font-size: clamp(22px, 2.4vw, 28px); font-weight: 800; letter-spacing: -.4px; }
.rkl__name { color: var(--nu-gray-2); font-size: 14.5px; font-weight: 600; }
.rkl__sector { color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }
.rkl__metric { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.rkl__value {
  color: var(--nu-ink); font-size: clamp(38px, 4.5vw, 56px); font-weight: 800;
  letter-spacing: -.04em; line-height: 1; font-variant-numeric: tabular-nums;
}
.rkl__value--up { color: var(--nu-green); }
.rkl__value--down { color: var(--nu-red); }
.rkl__label { color: var(--nu-gray); font-size: 13.5px; font-weight: 700; }
.rkl__price { color: var(--nu-gray-2); font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }

@media (max-width: 760px) {
  .rkl__metric { align-items: flex-start; }
}
</style>

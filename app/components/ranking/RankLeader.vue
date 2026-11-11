<script setup lang="ts">
// O nº 1 do ranking no cartão carvão com a faixa da marca (Aportou, 2ª rodada,
// 11/11/2026): senta à direita do topo da página, como o cartão do gráfico no
// /asset. Logo (NuAssetLogo, com o tile de letra de reserva), ticker, nome e
// setor; o número-herói da métrica do ranking (verde ou vermelho claro quando a
// métrica tem sinal) e a cotação. Embaixo, o 2º e o 3º da MESMA lista (`pódio`),
// quando a página passa. Nenhum dado novo: são as três primeiras linhas da tabela.
import type { RankingColumnKey, RankingRowApi } from '~/types/rankings'

const props = withDefaults(defineProps<{
  row: RankingRowApi
  primaryMetric: RankingColumnKey
  /** label da métrica (sobrescreve o default da coluna, ex.: 'Variação 30d'). */
  metricLabel?: string
  /** as linhas seguintes da mesma lista (2º, 3º) */
  podio?: RankingRowApi[]
}>(), { podio: () => [] })

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
  <NuFaixaMarca rotulo="Nº 1 do ranking" como="p" :altura="56" class="rkl">
    <NuxtLink :to="`/asset/${ticker}`" class="rkl__lider">
      <span class="rkl__id">
        <NuAssetLogo
          :ticker="ticker" :letter="ticker.charAt(0) || '?'"
          tile-bg="var(--nu-dark-chip)" tile-fg="var(--nu-white)"
          :size="56" :radius="16"
        />
        <span class="rkl__who">
          <span class="rkl__ticker">{{ ticker }}</span>
          <span v-if="name" class="rkl__name">{{ name }}</span>
          <span v-if="row.sector" class="rkl__sector">{{ row.sector }}</span>
        </span>
      </span>
      <span class="rkl__metric">
        <span class="rkl__value" :class="tone">{{ value }}</span>
        <span class="rkl__label">{{ label }}<template v-if="price !== '—'"><span aria-hidden="true"> · </span>Cotação {{ price }}</template></span>
      </span>
    </NuxtLink>
    <ol v-if="podio.length" class="rkl__podio" start="2">
      <li v-for="(r, i) in podio" :key="rankingTicker(r)">
        <NuxtLink :to="`/asset/${rankingTicker(r)}`" class="rkl__linha">
          <span class="rkl__pos">{{ i + 2 }}</span>
          <NuAssetLogo
            :ticker="rankingTicker(r)" :letter="rankingTicker(r).charAt(0) || '?'"
            tile-bg="var(--nu-dark-chip)" tile-fg="var(--nu-white)" :size="32" :radius="10"
          />
          <span class="rkl__linha-tk">{{ rankingTicker(r) }}</span>
          <span class="rkl__linha-nome">{{ rankingName(r) }}</span>
          <span class="rkl__linha-v">{{ col.format(r) }}</span>
        </NuxtLink>
      </li>
    </ol>
  </NuFaixaMarca>
</template>

<style scoped>
.rkl { --pad: clamp(20px, 2.4vw, 32px); overflow: hidden; }
.rkl__lider {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 20px 28px; flex-wrap: wrap;
  padding: clamp(22px, 2.6vw, 32px) var(--pad) clamp(22px, 2.6vw, 30px); color: var(--nu-white);
}
.rkl__id { display: flex; align-items: center; gap: 16px; min-width: 0; }
.rkl__who { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.rkl__ticker { color: var(--nu-white); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.025em; line-height: 1.05; transition: color .2s ease; }
.rkl__lider:hover .rkl__ticker { color: var(--nu-blue-soft); }
.rkl__name { color: var(--nu-on-dark); font-size: 14.5px; font-weight: 600; }
.rkl__sector { color: var(--nu-on-dark-2); font-size: 13.5px; font-weight: 500; }
.rkl__metric { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; margin-left: auto; }
.rkl__value {
  color: var(--nu-white); font-size: clamp(46px, 5.2vw, 68px); font-weight: 800;
  letter-spacing: -.035em; line-height: 1; font-variant-numeric: tabular-nums;
}
.rkl__value--up { color: var(--nu-green-soft); }
.rkl__value--down { color: var(--nu-red-soft); }
.rkl__label { color: var(--nu-on-dark-2); font-size: 14.5px; font-weight: 600; font-variant-numeric: tabular-nums; text-align: right; }

/* o 2º e o 3º: linhas com fio escuro */
.rkl__podio { list-style: none; margin: 0; padding: 0 var(--pad) clamp(10px, 1.4vw, 16px); }
.rkl__podio li { border-top: 1.5px solid var(--nu-dark-line); }
.rkl__linha { display: flex; align-items: center; gap: 12px; min-height: 56px; color: var(--nu-white); font-variant-numeric: tabular-nums; }
.rkl__pos { width: 16px; color: var(--nu-on-dark-2); font-size: 14.5px; font-weight: 700; }
.rkl__linha-tk { font-size: var(--nu-fs-md); font-weight: 800; letter-spacing: .04em; transition: color .2s ease; }
.rkl__linha:hover .rkl__linha-tk { color: var(--nu-blue-soft); }
.rkl__linha-nome { flex: 1; min-width: 0; color: var(--nu-on-dark-2); font-size: 14.5px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rkl__linha-v { font-size: var(--nu-fs-md); font-weight: 800; }

@media (max-width: 560px) {
  .rkl__metric { align-items: flex-start; margin-left: 0; }
  .rkl__label { text-align: left; }
}
@media (prefers-reduced-motion: reduce) { .rkl__ticker, .rkl__linha-tk { transition: none; } }
</style>

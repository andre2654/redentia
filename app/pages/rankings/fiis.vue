<script setup lang="ts">
// /rankings/fiis — rankings só de FIIs. O filtro do hub continua em
// /rankings?classe=fiis. Sem cotação e data, a lista daquele critério some.
import type { Recorte, VolumeLido } from '~/utils/rankingsRecorte'
import {
  candidatosFiis,
  recorteDyFiis,
  recorteLiquidezFiis,
  recortePvpFiis,
  type LinhaBruta,
} from '~/utils/rankingsRecorte'
import {
  FIIS_RANK_CRITERIOS,
  FIIS_RANK_DESCRIPTION,
  FIIS_RANK_FAQ,
  FIIS_RANK_H1,
  FIIS_RANK_PATH,
  FIIS_RANK_SUBTITLE,
  FIIS_RANK_TITLE,
} from '~/content/seo/rankings-fiis'

const vazio = {
  dy: recorteDyFiis(null),
  pvp: recortePvpFiis(null),
  liquidez: recorteLiquidezFiis(null, null),
}

const { data: pacote } = await useAsyncData('rankings-fiis', async () => {
  let rows: LinhaBruta[] = []
  try {
    const resp = await $fetch<{ data?: LinhaBruta[] }>(
      '/api/backend/rankings/top-dividend-yield?type=REIT&limit=100&min_cap=0',
      { headers: { Accept: 'application/json' }, timeout: 8000 },
    )
    rows = resp?.data ?? []
  } catch {
    rows = []
  }
  let volumes: Record<string, VolumeLido> | null = null
  const candidatos = candidatosFiis(rows)
  if (candidatos.length) {
    try {
      volumes = await $fetch<Record<string, VolumeLido>>('/api/volumes-tickers', {
        query: { tickers: candidatos.join(',') },
        timeout: 8000,
      })
    } catch {
      volumes = null
    }
  } else {
    volumes = {}
  }
  return {
    dy: recorteDyFiis(rows),
    pvp: recortePvpFiis(rows),
    liquidez: recorteLiquidezFiis(rows, volumes),
  }
}, { default: () => vazio })

const dy = computed(() => pacote.value?.dy ?? vazio.dy)
const pvp = computed(() => pacote.value?.pvp ?? vazio.pvp)
const liquidez = computed(() => pacote.value?.liquidez ?? vazio.liquidez)

const dataIso = computed(() => [dy.value.dataIso, pvp.value.dataIso, liquidez.value.dataIso]
  .filter((d): d is string => !!d)
  .sort()
  .at(-1) ?? null)

const origin = useSiteOrigin()
const itemLists = computed(() => [dy.value, pvp.value, liquidez.value]
  .filter((b) => b.itens.length)
  .map((b) => ({
    '@type': 'ItemList',
    name: b.rotulo.replace(/\.$/, ''),
    numberOfItems: b.itens.length,
    itemListOrder: b.ordem === 'asc'
      ? 'https://schema.org/ItemListOrderAscending'
      : 'https://schema.org/ItemListOrderDescending',
    ...(b.dataIso ? { dateModified: b.dataIso } : {}),
    itemListElement: b.itens.slice(0, 10).map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${item.ticker} - ${item.nome}`,
      url: `${origin}/asset/${item.ticker}`,
    })),
  })))

usePageSeo({
  title: FIIS_RANK_TITLE,
  description: FIIS_RANK_DESCRIPTION,
  path: FIIS_RANK_PATH,
  dateModified: dataIso,
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Rankings', path: '/rankings' },
    { name: 'Rankings de FIIs', path: FIIS_RANK_PATH },
  ],
  structuredData: itemLists,
})

const blocos = computed(() => [
  { id: 'dy', recorte: dy.value, criterio: FIIS_RANK_CRITERIOS.dy, vazio: 'Nenhum FII deste recorte trouxe dividend yield, cotação e data de pregão.' },
  { id: 'pvp', recorte: pvp.value, criterio: FIIS_RANK_CRITERIOS.pvp, vazio: 'Nenhum FII deste recorte trouxe P/VP, cotação e data de pregão.' },
  {
    id: 'volume',
    recorte: liquidez.value,
    criterio: FIIS_RANK_CRITERIOS.volume,
    vazio: liquidez.value.indisponivel
      ? 'O volume do pregão não está disponível agora.'
      : 'Nenhum FII deste recorte trouxe volume financeiro com data de pregão.',
  },
])
</script>

<template>
  <div class="rkf">
    <NuPageHero eyebrow="Rankings" :subtitle="FIIS_RANK_SUBTITLE">
      <template #title>{{ FIIS_RANK_H1 }}</template>
      <div class="rkf__atalhos">
        <NuLinkSeta to="/fiis">O que é um fundo imobiliário</NuLinkSeta>
        <NuLinkSeta to="/ranking/maiores-dividend-yield?type=fiis">Ranking de dividend yield</NuLinkSeta>
        <NuLinkSeta to="/rankings">Todos os rankings</NuLinkSeta>
      </div>
    </NuPageHero>

    <CalcBand v-for="(bloco, i) in blocos" :key="bloco.id" :tone="i % 2 === 0 ? 'white' : 'cream'" :title="bloco.recorte.rotulo">
      <template #dek>
        <p>{{ bloco.criterio }}</p>
      </template>
      <p v-if="bloco.recorte.fonte" class="rkf__fonte">{{ bloco.recorte.fonte }} Não é recomendação.</p>
      <p v-if="bloco.recorte.total > bloco.recorte.itens.length" class="rkf__fonte">
        {{ bloco.recorte.itens.length }} de {{ bloco.recorte.total }} que passam no critério.
      </p>
      <RecorteLista v-if="bloco.recorte.itens.length" :itens="bloco.recorte.itens" />
      <p v-else class="rkf__vazio">{{ bloco.vazio }}</p>
    </CalcBand>

    <CalcBand tone="white" title="Perguntas frequentes.">
      <div class="rkf__faq">
        <NuFaqAccordion :items="FIIS_RANK_FAQ" />
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
.rkf { background: var(--nu-page); overflow-wrap: break-word; }
.rkf__atalhos { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 4px 28px; max-width: 720px; }
.rkf__atalhos :deep(.nls) { margin: 0; }
.rkf__fonte, .rkf__vazio {
  max-width: 72ch; margin: clamp(24px, 3vw, 32px) auto 0; color: var(--nu-gray-3);
  font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.55;
}
.rkf__fonte + .rkf__fonte { margin-top: 8px; }
.rkf__faq { max-width: 760px; margin: clamp(8px, 2vw, 16px) auto 0; }
</style>

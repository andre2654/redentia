<script setup lang="ts">
// /rankings/small-caps — ações com valor de mercado abaixo do corte declarado.
// O número só entra se a base de tickers trouxer valor, cotação e data.
import type { LinhaBruta } from '~/utils/rankingsRecorte'
import { recorteSmallCaps } from '~/utils/rankingsRecorte'
import {
  SMALL_CAPS_CRITERIO,
  SMALL_CAPS_DESCRIPTION,
  SMALL_CAPS_FAQ,
  SMALL_CAPS_H1,
  SMALL_CAPS_PATH,
  SMALL_CAPS_SUBTITLE,
  SMALL_CAPS_TITLE,
} from '~/content/seo/rankings-small-caps'

const { data: lista } = await useAsyncData('rankings-small-caps', async () => {
  try {
    const resp = await $fetch<{ data?: LinhaBruta[] }>('/api/backend/tickers-full', {
      headers: { Accept: 'application/json' },
      timeout: 20000,
    })
    return recorteSmallCaps(resp?.data ?? [])
  } catch {
    return recorteSmallCaps(null)
  }
}, { default: () => recorteSmallCaps(null) })

const recorte = computed(() => lista.value ?? recorteSmallCaps(null))
const origin = useSiteOrigin()
const itemList = computed(() => {
  const b = recorte.value
  if (!b.itens.length) return []
  return [{
    '@type': 'ItemList',
    name: b.rotulo.replace(/\.$/, ''),
    numberOfItems: b.itens.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    ...(b.dataIso ? { dateModified: b.dataIso } : {}),
    itemListElement: b.itens.slice(0, 10).map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${item.ticker} - ${item.nome}`,
      url: `${origin}/asset/${item.ticker}`,
    })),
  }]
})

usePageSeo({
  title: SMALL_CAPS_TITLE,
  description: SMALL_CAPS_DESCRIPTION,
  path: SMALL_CAPS_PATH,
  dateModified: computed(() => recorte.value.dataIso),
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Rankings', path: '/rankings' },
    { name: 'Small caps', path: SMALL_CAPS_PATH },
  ],
  structuredData: itemList,
})
</script>

<template>
  <div class="rksm">
    <NuPageHero eyebrow="Rankings" :subtitle="SMALL_CAPS_SUBTITLE">
      <template #title>{{ SMALL_CAPS_H1 }}</template>
      <div class="rksm__atalhos">
        <NuLinkSeta to="/rankings">Todos os rankings</NuLinkSeta>
        <NuLinkSeta to="/glossario/small-caps">Verbete de small caps</NuLinkSeta>
        <NuLinkSeta to="/guias/small-caps-guia-completo">Guia de small caps</NuLinkSeta>
      </div>
    </NuPageHero>

    <CalcBand tone="white" :title="recorte.rotulo">
      <template #dek>
        <p>{{ SMALL_CAPS_CRITERIO }}</p>
      </template>
      <p v-if="recorte.fonte" class="rksm__fonte">{{ recorte.fonte }} Não é recomendação.</p>
      <p v-if="recorte.total > recorte.itens.length" class="rksm__fonte">
        {{ recorte.itens.length }} de {{ recorte.total }} ações que passam no corte.
      </p>
      <RecorteLista v-if="recorte.itens.length" :itens="recorte.itens" />
      <p v-else class="rksm__vazio">O valor de mercado deste recorte não está disponível agora.</p>
    </CalcBand>

    <CalcBand tone="cream" title="Perguntas frequentes.">
      <div class="rksm__faq">
        <NuFaqAccordion :items="SMALL_CAPS_FAQ" />
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
.rksm { background: var(--nu-page); overflow-wrap: break-word; }
.rksm__atalhos { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 4px 28px; max-width: 720px; }
.rksm__atalhos :deep(.nls) { margin: 0; }
.rksm__fonte, .rksm__vazio {
  max-width: 72ch; margin: clamp(24px, 3vw, 32px) auto 0; color: var(--nu-gray-3);
  font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.55;
}
.rksm__fonte + .rksm__fonte { margin-top: 8px; }
.rksm__faq { max-width: 760px; margin: clamp(8px, 2vw, 16px) auto 0; }
</style>

<script setup lang="ts">
// /acoes-que-pagam-dividendos-mensais — meses com pagamento no histórico.
// 10 ou mais numa seção. 6 a 9 noutra. Sem o histórico, a ação não entra.
import {
  ACOES_DIV_ALTA_CRITERIO,
  ACOES_DIV_MENSAIS_CRITERIO,
  ACOES_DIV_MENSAIS_DESCRIPTION,
  ACOES_DIV_MENSAIS_FAQ,
  ACOES_DIV_MENSAIS_H1,
  ACOES_DIV_MENSAIS_PATH,
  ACOES_DIV_MENSAIS_SUBTITLE,
  ACOES_DIV_MENSAIS_TITLE,
  ACOES_DIV_PATH,
} from '~/content/seo/acoes-dividendos'
import { dataCurtaDividendo, resultadoVazio, type ResultadoAcoesDividendos } from '~/utils/acoesDividendos'
import { spISODate } from '~/utils/format'

const { data } = await useAsyncData(
  'acoes-dividendos',
  () => $fetch<ResultadoAcoesDividendos>('/api/acoes-dividendos', { timeout: 25000 })
    .catch(() => resultadoVazio(spISODate())),
)

const pacote = computed(() => data.value ?? resultadoVazio(spISODate()))
const ate = computed(() => pacote.value.hoje ? dataCurtaDividendo(pacote.value.hoje) : '')
const origin = useSiteOrigin()
const itemList = computed(() => {
  const blocos = [
    { nome: 'Ações com pagamento de renda em 10 meses ou mais', itens: pacote.value.mensais },
    { nome: 'Ações com pagamento de renda em 6 a 9 meses', itens: pacote.value.alta },
  ].filter((b) => b.itens.length)
  return blocos.map((b) => ({
    '@type': 'ItemList',
    name: b.nome,
    numberOfItems: b.itens.length,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    ...(pacote.value.dataIso ? { dateModified: pacote.value.dataIso } : {}),
    itemListElement: b.itens.slice(0, 10).map((item) => ({
      '@type': 'ListItem',
      position: item.pos,
      name: `${item.ticker} - ${item.nome}`,
      url: `${origin}/dividendos/${item.ticker}`,
    })),
  }))
})

usePageSeo({
  title: ACOES_DIV_MENSAIS_TITLE,
  description: ACOES_DIV_MENSAIS_DESCRIPTION,
  path: ACOES_DIV_MENSAIS_PATH,
  dateModified: computed(() => pacote.value.dataIso),
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Ações que pagam dividendos', path: ACOES_DIV_PATH },
    { name: 'Pagamentos em muitos meses', path: ACOES_DIV_MENSAIS_PATH },
  ],
  structuredData: itemList,
})
</script>

<template>
  <div class="adm">
    <NuPageHero eyebrow="Dividendos" :subtitle="ACOES_DIV_MENSAIS_SUBTITLE">
      <template #title>{{ ACOES_DIV_MENSAIS_H1 }}</template>
      <div class="adm__atalhos">
        <NuLinkSeta to="/acoes-que-pagam-dividendos">Todas as ações do ranking de DY</NuLinkSeta>
        <NuLinkSeta to="/dividendos/agenda">Agenda de dividendos</NuLinkSeta>
        <NuLinkSeta to="/calculadora/ir-dividendos-jcp">IR sobre dividendos e JCP</NuLinkSeta>
        <NuLinkSeta to="/guias/acoes-fiis-dividendos-todo-mes">Guia de dividendos todo mês</NuLinkSeta>
      </div>
    </NuPageHero>

    <CalcBand tone="white" title="Pagamento em 10 meses ou mais">
      <template #dek>
        <p>{{ ACOES_DIV_MENSAIS_CRITERIO }}</p>
      </template>
      <p v-if="pacote.fonte" class="adm__fonte">{{ pacote.fonte }}</p>
      <p v-if="pacote.incompleto" class="adm__fonte">Parte da leitura não respondeu. A lista pode estar incompleta.</p>
      <p v-if="pacote.ok" class="adm__fonte">{{ pacote.mensais.length }} {{ pacote.mensais.length === 1 ? 'ação' : 'ações' }} nesta seção, na janela até {{ ate }}.</p>
      <AcoesDividendosLista v-if="pacote.mensais.length" :itens="pacote.mensais" />
      <p v-else class="adm__vazio">Nenhuma ação da B3 teve pagamento de renda em 10 meses ou mais nesta janela.</p>
    </CalcBand>

    <CalcBand tone="cream" title="Alta frequência: 6 a 9 meses">
      <template #dek>
        <p>{{ ACOES_DIV_ALTA_CRITERIO }}</p>
      </template>
      <p v-if="pacote.ok" class="adm__fonte">{{ pacote.alta.length }} {{ pacote.alta.length === 1 ? 'ação' : 'ações' }} nesta seção. Não é a lista de 10 meses ou mais.</p>
      <AcoesDividendosLista v-if="pacote.alta.length" :itens="pacote.alta" />
      <p v-else class="adm__vazio">Nenhuma ação ficou entre 6 e 9 meses nesta janela.</p>
    </CalcBand>

    <CalcBand tone="white" title="Calendário complementar">
      <p class="adm__prosa">
        Poucas ações concentram pagamento em quase todos os meses. A agenda mostra o que está anunciado em cada mês, com data e valor. O guia descreve a leitura de uma escada de recebimentos ao longo do ano. Os dois são informativos. Não indicam compra ou venda, e dividendos passados não garantem pagamentos futuros.
      </p>
      <div class="adm__atalhos adm__atalhos--banda">
        <NuLinkSeta to="/dividendos/agenda">Abrir a agenda</NuLinkSeta>
        <NuLinkSeta to="/guias/acoes-fiis-dividendos-todo-mes">Ler o guia</NuLinkSeta>
        <NuLinkSeta to="/calculadora/ir-dividendos-jcp">Calcular o IR</NuLinkSeta>
        <NuLinkSeta to="/ranking/maiores-dividend-yield">Ver o ranking de yield</NuLinkSeta>
      </div>
    </CalcBand>

    <CalcBand tone="cream" title="Perguntas frequentes">
      <div class="adm__faq">
        <NuFaqAccordion :items="ACOES_DIV_MENSAIS_FAQ" />
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
.adm { background: var(--nu-page); overflow-wrap: break-word; }
.adm__atalhos { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 4px 28px; max-width: 720px; }
.adm__atalhos--banda { max-width: 760px; margin: 20px auto 0; }
.adm__atalhos :deep(.nls) { margin: 0; }
.adm__fonte, .adm__vazio, .adm__prosa {
  max-width: 72ch; margin: clamp(24px, 3vw, 32px) auto 0; color: var(--nu-gray-3);
  font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.55;
}
.adm__prosa { font-size: var(--nu-fs-md); }
.adm__fonte + .adm__fonte { margin-top: 8px; }
.adm__faq { max-width: 760px; margin: clamp(8px, 2vw, 16px) auto 0; }
</style>

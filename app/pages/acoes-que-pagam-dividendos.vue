<script setup lang="ts">
// /acoes-que-pagam-dividendos — ações do ranking de DY, com último pagamento
// e meses com provento. Sem a API, a lista não aparece. Não é recomendação.
import {
  ACOES_DIV_CRITERIO,
  ACOES_DIV_DESCRIPTION,
  ACOES_DIV_FAQ,
  ACOES_DIV_H1,
  ACOES_DIV_METODO,
  ACOES_DIV_PATH,
  ACOES_DIV_SUBTITLE,
  ACOES_DIV_TITLE,
} from '~/content/seo/acoes-dividendos'
import { spISODate } from '~/utils/format'
import {
  passaNoFiltro,
  resultadoVazio,
  type FaixaDy,
  type FaixaMeses,
  type ResultadoAcoesDividendos,
} from '~/utils/acoesDividendos'

const { data } = await useAsyncData(
  'acoes-dividendos',
  () => $fetch<ResultadoAcoesDividendos>('/api/acoes-dividendos', { timeout: 25000 })
    .catch(() => resultadoVazio(spISODate())),
)

const pacote = computed(() => data.value ?? resultadoVazio(spISODate()))
const meses = ref<'todas' | FaixaMeses>('todas')
const dy = ref<'todas' | FaixaDy>('todas')
const setor = ref('')

const setores = computed(() => {
  const nomes = new Set<string>()
  for (const linha of pacote.value.ranking) {
    if (linha.setor) nomes.add(linha.setor)
  }
  return [...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR'))
})

const lista = computed(() => pacote.value.ranking.filter((linha) => passaNoFiltro(linha, {
  meses: meses.value,
  dy: dy.value,
  setor: setor.value,
})))

const origin = useSiteOrigin()
const itemList = computed(() => {
  const itens = pacote.value.ranking
  if (!itens.length) return []
  return [{
    '@type': 'ItemList',
    name: 'Ações da B3 com dividend yield de 12 meses',
    numberOfItems: pacote.value.rankingTotal,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    ...(pacote.value.dataIso ? { dateModified: pacote.value.dataIso } : {}),
    itemListElement: itens.slice(0, 10).map((item) => ({
      '@type': 'ListItem',
      position: item.pos,
      name: `${item.ticker} - ${item.nome}`,
      url: `${origin}/asset/${item.ticker}`,
    })),
  }]
})

usePageSeo({
  title: ACOES_DIV_TITLE,
  description: ACOES_DIV_DESCRIPTION,
  path: ACOES_DIV_PATH,
  dateModified: computed(() => pacote.value.dataIso),
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Ações que pagam dividendos', path: ACOES_DIV_PATH },
  ],
  structuredData: itemList,
})

const faixasMeses = [
  { id: 'todas', rotulo: 'Todos os meses' },
  { id: 'mensal', rotulo: '10 meses ou mais' },
  { id: 'alta', rotulo: '6 a 9 meses' },
  { id: 'baixa', rotulo: 'Até 5 meses' },
] as const

const faixasDy = [
  { id: 'todas', rotulo: 'Qualquer DY' },
  { id: 'acima-8', rotulo: 'DY acima de 8%' },
  { id: 'de-4-a-8', rotulo: 'DY de 4% a 8%' },
  { id: 'abaixo-4', rotulo: 'DY abaixo de 4%' },
] as const
</script>

<template>
  <div class="adv">
    <NuPageHero eyebrow="Dividendos" :subtitle="ACOES_DIV_SUBTITLE">
      <template #title>{{ ACOES_DIV_H1 }}</template>
      <div class="adv__atalhos">
        <NuLinkSeta to="/acoes-que-pagam-dividendos-mensais">Pagamentos em 10 meses ou mais</NuLinkSeta>
        <NuLinkSeta to="/dividendos/agenda">Agenda de dividendos</NuLinkSeta>
        <NuLinkSeta to="/calculadora/ir-dividendos-jcp">IR sobre dividendos e JCP</NuLinkSeta>
        <NuLinkSeta to="/ranking/maiores-dividend-yield">Ranking de dividend yield</NuLinkSeta>
      </div>
    </NuPageHero>

    <CalcBand tone="white" title="Ranking por dividend yield de 12 meses">
      <template #dek>
        <p>{{ ACOES_DIV_CRITERIO }}</p>
      </template>
      <p v-if="pacote.fonte" class="adv__fonte">{{ pacote.fonte }}</p>
      <p v-if="pacote.incompleto" class="adv__fonte">Parte da leitura não respondeu. A lista pode estar incompleta.</p>
      <p v-if="pacote.rankingTotal > pacote.ranking.length" class="adv__fonte">
        {{ pacote.ranking.length }} de {{ pacote.rankingTotal }} ações que passam no critério.
      </p>

      <div v-if="pacote.ranking.length" class="adv__filtros">
        <div class="adv__grupo" role="group" aria-label="Filtrar por meses com pagamento">
          <button
            v-for="f in faixasMeses"
            :key="f.id"
            type="button"
            class="adv__chip"
            :aria-pressed="meses === f.id"
            @click="meses = f.id"
          >{{ f.rotulo }}</button>
        </div>
        <div class="adv__grupo" role="group" aria-label="Filtrar por dividend yield">
          <button
            v-for="f in faixasDy"
            :key="f.id"
            type="button"
            class="adv__chip"
            :aria-pressed="dy === f.id"
            @click="dy = f.id"
          >{{ f.rotulo }}</button>
        </div>
        <label class="adv__setor">
          <span>Setor</span>
          <select v-model="setor">
            <option value="">Todos</option>
            <option v-for="nome in setores" :key="nome" :value="nome">{{ nome }}</option>
          </select>
        </label>
      </div>

      <AcoesDividendosLista v-if="lista.length" :itens="lista" />
      <p v-else-if="pacote.ranking.length" class="adv__vazio">Nenhuma ação deste recorte passa no filtro.</p>
      <p v-else class="adv__vazio">O ranking de dividend yield das ações não está disponível agora.</p>
    </CalcBand>

    <CalcBand tone="cream" title="Como o dividend yield de 12 meses é calculado">
      <p class="adv__prosa">{{ ACOES_DIV_METODO }}</p>
    </CalcBand>

    <CalcBand tone="white" title="Pagamentos em muitos meses">
      <p class="adv__prosa">
        A lista acima ordena pelo yield. A contagem de meses fica em outra página, com o corte de 10 meses ou mais e, em seção separada, quem teve de 6 a 9 meses. Não é recomendação.
      </p>
      <div class="adv__atalhos adv__atalhos--banda">
        <NuLinkSeta to="/acoes-que-pagam-dividendos-mensais">Ver os meses com pagamento</NuLinkSeta>
        <NuLinkSeta to="/guias/acoes-fiis-dividendos-todo-mes">Guia de dividendos todo mês</NuLinkSeta>
        <NuLinkSeta to="/dividendos/agenda">Agenda do mês</NuLinkSeta>
      </div>
    </CalcBand>

    <CalcBand tone="cream" title="Perguntas frequentes">
      <div class="adv__faq">
        <NuFaqAccordion :items="ACOES_DIV_FAQ" />
      </div>
    </CalcBand>
  </div>
</template>

<style scoped>
.adv { background: var(--nu-page); overflow-wrap: break-word; }
.adv__atalhos { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 4px 28px; max-width: 720px; }
.adv__atalhos--banda { max-width: 760px; margin: 20px auto 0; }
.adv__atalhos :deep(.nls) { margin: 0; }
.adv__fonte, .adv__vazio, .adv__prosa {
  max-width: 72ch; margin: clamp(24px, 3vw, 32px) auto 0; color: var(--nu-gray-3);
  font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); line-height: 1.55;
}
.adv__prosa { font-size: var(--nu-fs-md); }
.adv__fonte + .adv__fonte { margin-top: 8px; }
.adv__filtros {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  max-width: 980px; margin: clamp(20px, 3vw, 28px) auto 0;
}
.adv__grupo { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; max-width: 100%; }
.adv__chip {
  appearance: none; border: 1px solid var(--nu-line); background: var(--nu-card); color: var(--nu-ink);
  border-radius: 999px; padding: 8px 14px; font: inherit; font-size: 14px; font-weight: var(--nu-w-medio);
  line-height: 1.3; cursor: pointer; max-width: 100%;
}
.adv__chip[aria-pressed="true"] { background: var(--nu-ink); color: var(--nu-white); border-color: var(--nu-ink); }
.adv__chip:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 3px; }
.adv__setor {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px;
  color: var(--nu-gray-3); font-size: 14px; max-width: 100%;
}
.adv__setor select {
  max-width: 100%; min-width: 0; font: inherit; font-size: 14px; color: var(--nu-ink);
  background: var(--nu-card); border: 1px solid var(--nu-line); border-radius: 10px; padding: 8px 12px;
}
.adv__faq { max-width: 760px; margin: clamp(8px, 2vw, 16px) auto 0; }
</style>

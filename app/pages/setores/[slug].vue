<script setup lang="ts">
// /setores/{slug} — um segmento do cadastro (industry_category) com pelo
// menos cinco empresas. Cotação e DY de 12 meses só quando a leitura traz data.
import type { CotacaoDeSetor } from '~/utils/setoresLista'
import {
  SETORES_LISTA_DATA,
  SETORES_LISTA_DATA_PT,
  SETORES_LISTA_POR_SLUG,
  descricaoSetorLista,
  leituraDatada,
  textoSetorLista,
  tituloSetorLista,
} from '~/utils/setoresLista'

const route = useRoute()
const slug = String(route.params.slug ?? '')
const entry = SETORES_LISTA_POR_SLUG[slug]
if (!entry) {
  throw createError({ statusCode: 404, statusMessage: 'Setor não encontrado', fatal: true })
}

const { data: cotacoes } = await useAsyncData(
  `setores-cotacoes-${slug}`,
  () => $fetch<Record<string, CotacaoDeSetor>>(`/api/setores/${slug}`),
  { default: () => ({}) as Record<string, CotacaoDeSetor> },
)

const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nomeTitulo = entry.nome.charAt(0).toLocaleUpperCase('pt-BR') + entry.nome.slice(1)

function dataBr(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

function cotacaoDe(ticker: string): { nome: string; preco: string | null; precoData: string | null; dy: string | null; dyData: string | null } {
  const c = cotacoes.value?.[ticker]
  const preco = leituraDatada(c?.preco, c?.priceDate)
  const dy = leituraDatada(c?.dy, c?.dyDate)
  return {
    nome: c?.nome || ticker,
    preco: preco && preco.valor > 0 ? `R$ ${nf2.format(preco.valor)}` : null,
    precoData: preco && preco.valor > 0 ? dataBr(preco.data) : null,
    dy: dy ? `${nf2.format(dy.valor)}%` : null,
    dyData: dy ? dataBr(dy.data) : null,
  }
}

const linhas = computed(() => entry.empresas.map((e) => ({ ticker: e.ticker, ...cotacaoDe(e.ticker) })))

const dateModified = computed(() => {
  let max = SETORES_LISTA_DATA
  for (const e of entry.empresas) {
    const c = cotacoes.value?.[e.ticker]
    for (const d of [c?.priceDate, c?.dyDate]) {
      if (d && d > max) max = d
    }
  }
  return max
})

const origin = useSiteOrigin()

usePageSeo({
  title: tituloSetorLista(entry.nome),
  description: descricaoSetorLista(entry.nome, entry.empresas.length),
  path: `/setores/${entry.slug}`,
  dateModified,
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Segmentos', path: '/setores' },
    { name: nomeTitulo, path: `/setores/${entry.slug}` },
  ],
  structuredData: computed(() => [{
    '@type': 'ItemList',
    name: `${nomeTitulo} na B3`,
    numberOfItems: linhas.value.length,
    itemListElement: linhas.value.map((l, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: l.nome === l.ticker ? l.ticker : `${l.nome} (${l.ticker})`,
      url: `${origin}/asset/${l.ticker}`,
    })),
  }]),
})
</script>

<template>
  <div class="sz">
    <section class="sz__topo">
      <p class="nu-eyebrow sz__eyebrow">
        <MarcaCorte />
        <span><NuxtLink to="/setores" class="sz__volta">Segmentos</NuxtLink><span aria-hidden="true"> · </span>B3</span>
      </p>
      <h1 class="sz__h1">{{ nomeTitulo }}</h1>
      <p class="sz__lead">{{ textoSetorLista(entry) }}</p>
      <p v-if="entry.setorAmplo" class="sz__amplo">
        Setor amplo:
        <NuxtLink :to="entry.setorAmplo.href">{{ entry.setorAmplo.nome }}</NuxtLink>
      </p>
    </section>

    <section class="sz__corpo">
      <h2 class="sz__h2">Ativos do segmento</h2>
      <p class="sz__nota">
        {{ entry.empresas.length }} ativos no cadastro de {{ SETORES_LISTA_DATA_PT }}.
        A cotação é o preço do pregão (market_price, com price_date).
        O DY de 12 meses é o dividend yield do cadastro fundamentalista (key_statistics.dividend_yield, com updated_at).
        Sem data, a célula fica em branco.
      </p>

      <div class="sz__tabela-wrap">
        <table class="sz__tabela">
          <thead>
            <tr>
              <th scope="col">Ativo</th>
              <th scope="col">Cotação</th>
              <th scope="col">DY 12 meses</th>
              <th scope="col">Páginas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in linhas" :key="l.ticker">
              <td data-label="Ativo">
                <span class="sz__nome">{{ l.nome }}</span>
                <span class="sz__ticker">{{ l.ticker }}</span>
              </td>
              <td data-label="Cotação">
                <template v-if="l.preco && l.precoData">
                  <span class="sz__num">{{ l.preco }}</span>
                  <span class="sz__data">pregão {{ l.precoData }}</span>
                </template>
                <span v-else class="sz__vazio">sem data</span>
              </td>
              <td data-label="DY 12 meses">
                <template v-if="l.dy && l.dyData">
                  <span class="sz__num">{{ l.dy }}</span>
                  <span class="sz__data">leitura {{ l.dyData }}</span>
                </template>
                <span v-else class="sz__vazio">sem data</span>
              </td>
              <td data-label="Páginas">
                <span class="sz__links">
                  <NuxtLink :to="`/asset/${l.ticker}`">Ativo</NuxtLink>
                  <NuxtLink :to="`/dividendos/${l.ticker}`">Dividendos</NuxtLink>
                  <NuxtLink :to="`/quanto-rende/${l.ticker}`">Quanto rende</NuxtLink>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <MercadoFecho
      eyebrow="Cadastro"
      :primary="{ label: 'Ver todos os segmentos', to: '/setores' }"
      :secondary="entry.setorAmplo ? { label: entry.setorAmplo.nome, to: entry.setorAmplo.href } : { label: 'Setores amplos', to: '/setor' }"
    >
      <template #title>Abra a página de cada código</template>
      <template #subtitle>Cotação, dividendos e quanto rende ficam na página do ativo. Esta lista não é recomendação.</template>
    </MercadoFecho>
  </div>
</template>

<style scoped>
.sz__topo {
  background: var(--nu-page);
  color: var(--nu-ink);
  padding: clamp(40px, 4.4vw, 64px) var(--nu-coluna) clamp(24px, 3vw, 40px);
}
.sz__eyebrow { margin: 0; }
.sz__volta {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 1.5px;
  text-decoration-color: var(--nu-line);
}
.sz__volta:hover { color: var(--nu-blue-text); text-decoration-color: currentColor; }
.sz__h1 {
  margin: 16px 0 0;
  max-width: 18ch;
  font-size: clamp(32px, 5vw, 64px);
  font-weight: var(--nu-w-display);
  letter-spacing: var(--nu-ls-display);
  line-height: .98;
  text-wrap: balance;
}
.sz__lead {
  margin: 20px 0 0;
  max-width: 62ch;
  color: var(--nu-gray-3);
  font-size: clamp(16px, 1.4vw, 20px);
  line-height: 1.45;
  text-wrap: pretty;
}
.sz__amplo { margin: 16px 0 0; font-size: 15px; }
.sz__amplo a {
  color: var(--nu-blue-text);
  font-weight: var(--nu-w-medio);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.sz__corpo {
  background: var(--nu-page);
  padding: 0 var(--nu-coluna) clamp(32px, 4vw, 48px);
}
.sz__h2 {
  margin: 0;
  font-size: clamp(22px, 2vw, 28px);
  font-weight: var(--nu-w-forte);
  letter-spacing: var(--nu-ls-titulo);
}
.sz__nota {
  margin: 12px 0 20px;
  max-width: 78ch;
  color: var(--nu-gray-3);
  font-size: 14.5px;
  line-height: 1.5;
}
.sz__tabela-wrap {
  background: var(--nu-white);
  border-radius: var(--nu-r-panel);
  box-shadow: var(--nu-shadow-branco);
  overflow: clip;
}
.sz__tabela { width: 100%; border-collapse: collapse; }
.sz__tabela th, .sz__tabela td {
  padding: 14px 16px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--nu-line-2);
}
.sz__tabela th {
  color: var(--nu-gray-3);
  font-size: 13px;
  font-weight: var(--nu-w-medio);
  letter-spacing: var(--nu-ls-caixa);
  text-transform: uppercase;
}
.sz__tabela tr:last-child td { border-bottom: 0; }
.sz__nome, .sz__num { display: block; color: var(--nu-ink); font-weight: var(--nu-w-forte); }
.sz__num { font-variant-numeric: tabular-nums; }
.sz__ticker, .sz__data, .sz__vazio { display: block; margin-top: 2px; color: var(--nu-gray); font-size: 13px; }
.sz__links { display: flex; flex-wrap: wrap; gap: 8px 12px; }
.sz__links a {
  color: var(--nu-blue-text);
  font-weight: var(--nu-w-medio);
  text-decoration: underline;
  text-underline-offset: 3px;
  overflow-wrap: anywhere;
}
@media (max-width: 720px) {
  .sz__tabela thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  .sz__tabela, .sz__tabela tbody, .sz__tabela tr, .sz__tabela td { display: block; width: auto; }
  .sz__tabela tr { padding: 8px 0 12px; border-bottom: 1px solid var(--nu-line-2); }
  .sz__tabela tr:last-child { border-bottom: 0; }
  .sz__tabela td { border-bottom: 0; padding: 8px 16px; }
  .sz__tabela td::before {
    content: attr(data-label);
    display: block;
    margin-bottom: 4px;
    color: var(--nu-gray-3);
    font-size: 12px;
    font-weight: var(--nu-w-medio);
    letter-spacing: var(--nu-ls-caixa);
    text-transform: uppercase;
  }
}
@media (prefers-reduced-motion: reduce) {
  .sz__volta { transition: none; }
}
</style>

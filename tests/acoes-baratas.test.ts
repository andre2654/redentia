/**
 * Hub /ranking/acoes-baratas: indexável, no sitemap de rankings e no llms.txt,
 * ligado ao menu e ao hub. A palavra "barata" é a cotação abaixo da fórmula.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  ACOES_BARATAS_DESCRIPTION,
  ACOES_BARATAS_FAQ,
  ACOES_BARATAS_H1,
  ACOES_BARATAS_INTRO,
  ACOES_BARATAS_LINKS,
  ACOES_BARATAS_NOTA,
  ACOES_BARATAS_PATH,
  ACOES_BARATAS_TITLE,
  acoesBaratasCabeNoSerp,
} from '../app/content/seo/acoes-baratas.ts'
import { SUFIXO_MARCA, TETO_TITULO } from '../app/utils/serp.ts'
import { topoDaLista } from '../app/utils/topoDaLista.ts'
import { computed, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const TICKER = /\b[A-Z]{4}\d{1,2}\b/
const ORDEM = /\b(compre|venda|vai subir|garantia de)\b/i

test('o título cabe no SERP e o H1 é o da página', () => {
  assert.equal(ACOES_BARATAS_H1, 'Ações baratas pelas fórmulas')
  assert.equal(ACOES_BARATAS_TITLE, 'Ações Baratas 2026: Graham, Bazin e P/VP')
  assert.equal(acoesBaratasCabeNoSerp(), true)
  assert.ok(ACOES_BARATAS_TITLE.length + SUFIXO_MARCA.length <= TETO_TITULO)
  assert.match(ACOES_BARATAS_INTRO, /subvalorizadas/)
  assert.match(ACOES_BARATAS_INTRO, /P\/VP/)
  assert.equal(ACOES_BARATAS_NOTA, 'Estimativa educacional pela fórmula, não é recomendação de investimento.')
})

test('os links são as listas que existem, e o FAQ não recomenda ticker', () => {
  assert.deepEqual(ACOES_BARATAS_LINKS.map((l) => l.to), [
    '/ranking/mais-baratas-graham',
    '/ranking/mais-baratas-bazin',
    '/ranking/menores-pl',
    '/calculadora/preco-teto',
  ])
  assert.match(ACOES_BARATAS_LINKS.map((l) => l.sub).join(' '), /Não há uma lista só de P\/VP/)
  assert.ok(ACOES_BARATAS_FAQ.length >= 3 && ACOES_BARATAS_FAQ.length <= 5)
  const texto = [ACOES_BARATAS_INTRO, ACOES_BARATAS_DESCRIPTION, ...ACOES_BARATAS_FAQ.flatMap((f) => [f.q, f.a])].join('\n')
  assert.doesNotMatch(texto, TICKER)
  assert.doesNotMatch(texto, ORDEM)
  assert.match(texto, /subvalorizad/)
})

test('a lista compacta omite ref aninhada e API vazia, e o SSR da tabela não estoura', async () => {
  const linhas = [{ ticker: 'PETR4' }, { ticker: 'VALE3' }, { ticker: 'ITUB4' }, { ticker: 'BBAS3' }, { ticker: 'WEGE3' }, { ticker: 'BBDC4' }]
  const colunas = computed(() => ['upsidePct', 'change'])
  // O 500 de produção: o template passava o ComputedRef, e RankTable chamava .map nele.
  assert.equal(topoDaLista(linhas, colunas), null)
  assert.equal(topoDaLista(undefined, colunas.value), null)
  assert.equal(topoDaLista([], colunas.value), null)
  const topo = topoDaLista<{ ticker: string }, string>(linhas, colunas.value)
  assert.ok(topo)
  assert.equal(topo.rows.length, 5)
  assert.deepEqual(topo.columns, ['upsidePct', 'change'])

  const Tabela = {
    props: { columns: { type: Array, default: () => [] } },
    setup(props: { columns: string[] }) {
      const defs = computed(() => (Array.isArray(props.columns) ? props.columns : []).map((key) => key))
      return () => h('ul', defs.value.map((key) => h('li', key)))
    },
  }
  const app = createSSRApp({
    setup() {
      const lista = computed(() => topoDaLista(linhas, colunas.value))
      const semApi = computed(() => topoDaLista(null, null))
      return () => h('div', [
        h('h1', ACOES_BARATAS_H1),
        lista.value ? h(Tabela, { columns: lista.value.columns }) : null,
        semApi.value ? h('p', 'não devia') : h('p', 'sem lista'),
      ])
    },
  })
  const html = await renderToString(app)
  assert.match(html, /Ações baratas pelas fórmulas/)
  assert.match(html, /upsidePct/)
  assert.match(html, /sem lista/)
  assert.doesNotMatch(html, /não devia/)
})

test('a página é indexável, tem FAQ e BreadcrumbList, e entra no sitemap e no menu', () => {
  const vue = ler('app/pages/ranking/acoes-baratas.vue')
  assert.match(vue, /usePageSeo\(/)
  assert.match(vue, /ACOES_BARATAS_PATH/)
  assert.match(vue, /breadcrumbs:/)
  assert.match(vue, /NuFaqAccordion/)
  assert.match(vue, /useRanking\(grahamMeta\)/)
  assert.match(vue, /useRanking\(bazinMeta\)/)
  assert.match(vue, /topoDaLista\(grahamRows\.value, grahamColumns\.value\)/)
  assert.match(vue, /v-if="topoGraham"/)
  assert.doesNotMatch(vue, /:columns="graham\.columns"|:columns="bazin\.columns"/)
  assert.doesNotMatch(vue, /noindex/)
  assert.match(ler('server/utils/site-pages.ts'), /ACOES_BARATAS_PATH/)
  assert.match(ler('server/routes/llms.txt.ts'), /\/ranking\/acoes-baratas/)
  assert.match(ler('app/utils/topo.ts'), /label: 'Ações baratas', to: '\/ranking\/acoes-baratas'/)
  assert.match(ler('app/pages/rankings/index.vue'), /to="\/ranking\/acoes-baratas"/)
})

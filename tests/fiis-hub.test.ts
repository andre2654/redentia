/**
 * /fiis é o hub educativo: 200, indexável, canonical dele mesmo.
 * /rankings?classe=fiis continua o filtro do hub de rankings, com canonical
 * /rankings. A barra de /fiis não volta para o filtro: isso fecharia um loop.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  FIIS_DESCRIPTION,
  FIIS_FAQ,
  FIIS_H1,
  FIIS_PATH,
  FIIS_TIPOS,
  FIIS_TITLE,
  canonicalDeRankings,
  fiisCabeNoSerp,
} from '../app/content/seo/fiis-hub.ts'
import { listaDeFiis } from '../app/utils/fiisLista.ts'
import { destinoSemBarra } from '../server/utils/sem-barra.ts'
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO } from '../app/utils/serp.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('o title e a description de FIIs cabem no SERP e não indicam compra', () => {
  assert.equal(canonicalDeRankings('/fiis', null), '/fiis')
  assert.equal(canonicalDeRankings('/rankings', 'fiis'), '/rankings')
  assert.equal(canonicalDeRankings('/rankings', 'acoes'), '/rankings')
  assert.equal(canonicalDeRankings('/rankings', null), '/rankings')
  assert.equal(FIIS_PATH, '/fiis')
  assert.equal(FIIS_H1, 'Fundos imobiliários.')
  assert.equal(fiisCabeNoSerp(), true)
  assert.ok(FIIS_TITLE.length + SUFIXO_MARCA.length <= TETO_TITULO)
  assert.ok(FIIS_TITLE.length <= 60)
  assert.ok(FIIS_DESCRIPTION.length >= 120 && FIIS_DESCRIPTION.length <= TETO_DESCRICAO)
  assert.match(FIIS_TITLE, /fundos imobiliários/i)
  assert.match(FIIS_TITLE, /FIIs/)
  assert.match(FIIS_DESCRIPTION, /Não é recomendação/)
  assert.doesNotMatch(`${FIIS_TITLE} ${FIIS_DESCRIPTION}`, /melhores para comprar/i)
})

test('a barra de /fiis termina na própria página e o routeRules não redireciona', () => {
  assert.equal(destinoSemBarra('/fiis/'), FIIS_PATH)
  assert.equal(destinoSemBarra('/fiis'), null)
  assert.equal(destinoSemBarra('/rankings/fiis/'), '/rankings?classe=fiis')
  const config = ler('nuxt.config.ts')
  assert.doesNotMatch(config, /'\/fiis': \{ redirect:/)
  assert.match(config, /'\/rankings\/fiis': \{ redirect: \{ to: '\/rankings\?classe=fiis'/)
  const mapa = ler('server/utils/sem-barra.ts')
  assert.doesNotMatch(mapa, /'\/fiis': '\/rankings\?classe=fiis'/)
  assert.match(mapa, /'\/rankings\/fiis': '\/rankings\?classe=fiis'/)
})

test('a página é o hub, com sitemap, llms, cache e link a partir de um hub existente', () => {
  const vue = ler('app/pages/fiis.vue')
  const rankings = ler('app/pages/rankings/index.vue')
  assert.doesNotMatch(rankings, /alias:\s*\['\/fiis'\]/)
  assert.match(vue, /FIIS_H1/)
  assert.match(vue, /path: FIIS_PATH/)
  assert.match(vue, /NuFaqAccordion/)
  assert.match(vue, /\/dividendos\//)
  assert.match(vue, /\/quanto-rende\//)
  assert.match(vue, /\/calculadora\/dividend-yield/)
  assert.match(vue, /Lei 8\.668\/1993/)
  assert.match(vue, /Lei 11\.033\/2004/)
  assert.match(vue, /art\. 3º/)
  assert.match(vue, /100 cotistas/)
  assert.match(vue, /10%/)
  assert.doesNotMatch(vue, /50 cotistas|melhores para comprar|noindex/i)
  assert.match(ler('server/utils/site-pages.ts'), /FIIS_PATH/)
  assert.match(ler('server/routes/llms.txt.ts'), /\$\{o\}\/fiis/)
  assert.match(ler('server/middleware/cache-sessao.ts'), /'\/fiis': QUINZE_MIN/)
  assert.match(rankings, /to="\/fiis"/)
  assert.match(ler('app/components/nu/NuFooter.vue'), /to: '\/fiis'/)
  assert.match(ler('app/utils/topo.ts'), /to: '\/fiis'/)
  assert.match(ler('server/data/sitemap-semente.ts'), /\/fiis</)
})

test('os quatro tipos e o FAQ citam a lei, sem indicação de compra', () => {
  assert.deepEqual(FIIS_TIPOS.map((t) => t.id), ['tijolo', 'papel', 'hibrido', 'fof'])
  assert.equal(FIIS_FAQ.length >= 4, true)
  const texto = FIIS_FAQ.map((f) => `${f.q} ${f.a}`).join('\n')
  assert.match(texto, /Lei 8\.668\/1993/)
  assert.match(texto, /art\. 3º, III, da Lei 11\.033\/2004/)
  assert.match(texto, /100 cotistas/)
  assert.match(texto, /10%/)
  assert.match(texto, /Não\./)
  assert.doesNotMatch(texto, /melhores para comprar|recomendamos comprar|garantia de retorno/i)
  for (const f of FIIS_FAQ) {
    if (f.link) assert.ok(f.a.includes(f.link.texto), f.q)
  }
})

test('a lista só publica FII com cotação, data e DY dentro do corte', () => {
  const lista = listaDeFiis([
    { ticker: 'MXRF11', name: 'FII MAXI RENDA', type: 'REIT', market_price: 10.5, dividend_yield: 0.112, price_date: '2026-11-10' },
    { ticker: 'HGLG11', name: 'FII HGLG', type: 'REIT', market_price: 160, dividend_yield: 0.09, price_date: '2026-11-11' },
    { ticker: 'ALTO11', name: 'FII ALTO', type: 'REIT', market_price: 10, dividend_yield: 0.6, price_date: '2026-11-10' },
    { ticker: 'SEMD11', name: 'FII SEM DATA', type: 'REIT', market_price: 10, dividend_yield: 0.2, price_date: null },
    { ticker: 'AGRO11', name: 'FIAGRO AGRO', type: 'REIT', market_price: 10, dividend_yield: 0.2, price_date: '2026-11-10' },
    { ticker: 'PETR4', name: 'PETROBRAS', type: 'STOCK', market_price: 30, dividend_yield: 0.1, price_date: '2026-11-10' },
  ])
  assert.deepEqual(lista.itens.map((i) => i.ticker), ['MXRF11', 'HGLG11'])
  assert.equal(lista.itens[0]!.dy, '11,20%')
  assert.equal(lista.itens[0]!.preco, 'R$\u00a010,50')
  assert.equal(lista.itens[0]!.data, '10 nov 2026')
  assert.equal(lista.itens[0]!.nome, 'Maxi Renda')
  assert.match(lista.fonte, /avisos de proventos da B3 e Brapi/)
  assert.match(lista.fonte, /10 nov 2026 a 11 nov 2026/)
  assert.equal(lista.dataIso, '2026-11-11')
  assert.deepEqual(listaDeFiis(null), { itens: [], fonte: '', dataIso: null })
  assert.deepEqual(listaDeFiis([]), { itens: [], fonte: '', dataIso: null })
})

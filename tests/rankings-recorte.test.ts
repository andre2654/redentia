/**
 * Rankings só de FIIs e a lista de small caps.
 * O PR 169 devolveu "Mais Baratas" e apagou o teste que barrava "barato".
 * Estas páginas não reabrem isso: o texto novo descreve o critério e a data.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import {
  FIIS_RANK_DESCRIPTION,
  FIIS_RANK_PATH,
  FIIS_RANK_TITLE,
  fiisRankCabeNoSerp,
} from '../app/content/seo/rankings-fiis.ts'
import {
  SMALL_CAPS_DESCRIPTION,
  SMALL_CAPS_PATH,
  SMALL_CAPS_TITLE,
  smallCapsCabeNoSerp,
} from '../app/content/seo/rankings-small-caps.ts'
import {
  PVP_TETO,
  SMALL_CAPS_CORTE,
  candidatosFiis,
  lerVolumeTicker,
  recorteDyFiis,
  recorteLiquidezFiis,
  recortePvpFiis,
  recorteSmallCaps,
  type LinhaBruta,
} from '../app/utils/rankingsRecorte.ts'
import { RANKINGS } from '../app/content/rankings/registry.ts'
import { destinoSemBarra } from '../server/utils/sem-barra.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const PROIBIDO = /melhores para comprar|recomendamos comprar|garantia de retorno|vale a pena comprar/i

const fii = (o: Partial<LinhaBruta>): LinhaBruta => ({
  ticker: 'HGLG11',
  name: 'FII CSHG LOG',
  type: 'REIT',
  market_price: 160,
  dividend_yield: 0.09,
  price_to_book: 0.98,
  price_date: '2026-11-23',
  ...o,
})

test('o title e a description cabem no SERP e não indicam compra', () => {
  assert.equal(fiisRankCabeNoSerp(), true)
  assert.equal(smallCapsCabeNoSerp(), true)
  assert.ok(FIIS_RANK_TITLE.length <= 60)
  assert.ok(SMALL_CAPS_TITLE.length <= 60)
  assert.ok(FIIS_RANK_DESCRIPTION.length >= 120 && FIIS_RANK_DESCRIPTION.length <= 155)
  assert.ok(SMALL_CAPS_DESCRIPTION.length >= 120 && SMALL_CAPS_DESCRIPTION.length <= 155)
  assert.doesNotMatch(`${FIIS_RANK_TITLE} ${FIIS_RANK_DESCRIPTION} ${SMALL_CAPS_TITLE} ${SMALL_CAPS_DESCRIPTION}`, PROIBIDO)
  assert.equal(SMALL_CAPS_CORTE, 2_000_000_000)
  assert.equal(PVP_TETO, 30)
})

test('DY de FIIs: maior primeiro, com data, e fora quem não é FII ou passa de 50%', () => {
  const lista = recorteDyFiis([
    fii({ ticker: 'MXRF11', name: 'FII MAXI RENDA', dividend_yield: 0.11, market_price: 10 }),
    fii({ ticker: 'HGLG11', dividend_yield: 0.09 }),
    fii({ ticker: 'ALTO11', name: 'FII ALTO', dividend_yield: 0.6 }),
    fii({ ticker: 'SEMD11', name: 'FII SEM DATA', price_date: null }),
    fii({ ticker: 'AGRO11', name: 'FIAGRO AGRO', dividend_yield: 0.2 }),
    fii({ ticker: 'PETR4', name: 'PETROBRAS', type: 'STOCK', dividend_yield: 0.1 }),
  ])
  assert.deepEqual(lista.itens.map((i) => i.ticker), ['MXRF11', 'HGLG11'])
  assert.equal(lista.itens[0]!.numeros[0]!.valor, '11,00%')
  assert.equal(lista.itens[0]!.data, '23 nov 2026')
  assert.match(lista.rotulo, /Ranking por dividend yield de 12 meses em 23 nov 2026/)
  assert.match(lista.fonte, /Brapi/)
  assert.match(lista.fonte, /23 nov 2026/)
  assert.equal(lista.ordem, 'desc')
  assert.equal(lista.dataIso, '2026-11-23')
  assert.deepEqual(recorteDyFiis(null).itens, [])
  assert.doesNotMatch(lista.rotulo + lista.fonte, PROIBIDO)
})

test('P/VP: o menor primeiro, zero e ausência ficam de fora', () => {
  const lista = recortePvpFiis([
    fii({ ticker: 'AAAA11', name: 'FII A', price_to_book: 1.2 }),
    fii({ ticker: 'BBBB11', name: 'FII B', price_to_book: 0.4 }),
    fii({ ticker: 'CCCC11', name: 'FII C', price_to_book: 0 }),
    fii({ ticker: 'DDDD11', name: 'FII D', price_to_book: null }),
    fii({ ticker: 'EEEE11', name: 'FII E', price_to_book: 40 }),
  ])
  assert.deepEqual(lista.itens.map((i) => i.ticker), ['BBBB11', 'AAAA11'])
  assert.equal(lista.itens[0]!.numeros[0]!.rotulo, 'P/VP')
  assert.equal(lista.itens[0]!.numeros[0]!.valor, '0,40')
  assert.equal(lista.ordem, 'asc')
  assert.match(lista.rotulo, /Ranking por P\/VP em 23 nov 2026/)
})

test('volume: só entra com data, e a cotação de outro pregão não se mistura', () => {
  const rows = [
    fii({ ticker: 'HGLG11', price_date: '2026-11-23', market_price: 160 }),
    fii({ ticker: 'MXRF11', name: 'FII MAXI RENDA', price_date: '2026-11-23', market_price: 9 }),
  ]
  assert.deepEqual(candidatosFiis(rows), ['HGLG11', 'MXRF11'])
  assert.equal(recorteLiquidezFiis(rows, null).indisponivel, true)
  assert.equal(recorteLiquidezFiis(rows, null).itens.length, 0)
  const lista = recorteLiquidezFiis(rows, {
    HGLG11: { volume: 1_000_000, priceDate: '2026-11-23', marketPrice: 161 },
    MXRF11: { volume: 5_000_000, priceDate: null, marketPrice: 9 },
    OUTR11: { volume: 9_000_000, priceDate: '2026-11-23', marketPrice: 10 },
  })
  assert.deepEqual(lista.itens.map((i) => i.ticker), ['HGLG11'])
  assert.equal(lista.itens[0]!.numeros[0]!.valor, 'R$ 1,0 mi')
  assert.equal(lista.itens[0]!.numeros[1]!.valor, 'R$\u00a0161,00')
  assert.match(lista.rotulo, /Ranking por volume financeiro do pregão em 23 nov 2026/)
  const semPrecoNoVolume = recorteLiquidezFiis(rows, {
    MXRF11: { volume: 2_000, priceDate: '2026-11-20', marketPrice: null },
  })
  assert.equal(semPrecoNoVolume.itens.length, 0)
  assert.equal(lerVolumeTicker({ data: { volume: 10, price_date: '2026-11-23', market_price: 8.5 } })?.volume, 10)
  assert.equal(lerVolumeTicker({ volume: 0, price_date: '2026-11-23' }), null)
  assert.equal(lerVolumeTicker(null), null)
})

test('small caps: abaixo de R$ 2 bi, com data, ação, sem alias', () => {
  const lista = recorteSmallCaps([
    { ticker: 'PEQU3', name: 'PEQUENA ON NM', type: 'STOCK', market_cap: 500_000_000, market_price: 10, price_date: '2026-11-23' },
    { ticker: 'PEQU4', name: 'PEQUENA PN N2', type: 'STOCK', market_cap: 500_000_000, market_price: 9, price_date: '2026-11-23' },
    { ticker: 'MIUD4', name: 'MIUDA PN', type: 'STOCK', market_cap: 80_000_000, market_price: 2, price_date: '2026-11-21' },
    { ticker: 'PETR4', name: 'PETROBRAS PN N2', type: 'STOCK', market_cap: 588_000_000_000, market_price: 40, price_date: '2026-11-23' },
    { ticker: 'HGLG11', name: 'FII CSHG LOG', type: 'REIT', market_cap: 100_000_000, market_price: 160, price_date: '2026-11-23' },
    { ticker: 'ALIX3', name: 'ALIAS ON', type: 'STOCK', market_cap: 100_000_000, market_price: 5, price_date: '2026-11-23', alias_of: 'NOVO3' },
    { ticker: 'SEMD3', name: 'SEM DATA ON', type: 'STOCK', market_cap: 100_000_000, market_price: 5, price_date: null },
    { ticker: 'ZERO3', name: 'ZERO ON', type: 'STOCK', market_cap: 0, market_price: 5, price_date: '2026-11-23' },
  ], 10)
  assert.deepEqual(lista.itens.map((i) => i.ticker), ['MIUD4', 'PEQU3', 'PEQU4'])
  assert.equal(lista.total, 3)
  assert.match(lista.rotulo, /Ranking por valor de mercado abaixo de R\$ 2 bilhões nos pregões de 21 nov 2026 a 23 nov 2026/)
  assert.match(lista.fonte, /R\$ 2 bilhões/)
  assert.match(lista.fonte, /ON e PN/)
  assert.equal(lista.ordem, 'asc')
  assert.equal(lista.itens[0]!.numeros[0]!.rotulo, 'Valor de mercado')
  assert.equal(recorteSmallCaps(null).itens.length, 0)
  assert.doesNotMatch(`${lista.rotulo} ${lista.fonte}`, PROIBIDO)
})

test('as páginas linkam dividendos, quanto rende e o ativo, e entram no sitemap', () => {
  for (const p of ['app/pages/rankings/fiis.vue', 'app/pages/rankings/small-caps.vue', 'app/components/ranking/RecorteLista.vue']) {
    const vue = ler(p)
    if (p.endsWith('RecorteLista.vue')) {
      assert.match(vue, /\/dividendos\/\$\{item\.ticker\}/)
      assert.match(vue, /\/quanto-rende\/\$\{item\.ticker\}/)
      assert.match(vue, /\/asset\/\$\{item\.ticker\}/)
    }
    assert.doesNotMatch(vue, PROIBIDO)
    assert.doesNotMatch(vue, /noindex/i)
  }
  const fiis = ler('app/pages/rankings/fiis.vue')
  const small = ler('app/pages/rankings/small-caps.vue')
  assert.match(fiis, /RecorteLista/)
  assert.match(small, /RecorteLista/)
  assert.match(fiis, /ItemList/)
  assert.match(small, /ItemList/)
  assert.match(fiis, /FIIS_RANK_PATH/)
  assert.match(small, /SMALL_CAPS_PATH/)
  assert.match(ler('server/utils/site-pages.ts'), /FIIS_RANK_PATH/)
  assert.match(ler('server/utils/site-pages.ts'), /SMALL_CAPS_PATH/)
  assert.match(ler('server/routes/llms.txt.ts'), /\/rankings\/fiis/)
  assert.match(ler('server/routes/llms.txt.ts'), /\/rankings\/small-caps/)
  assert.match(ler('server/middleware/cache-sessao.ts'), /'\/rankings\/fiis': QUINZE_MIN/)
  assert.match(ler('server/middleware/cache-sessao.ts'), /'\/rankings\/small-caps': QUINZE_MIN/)
  assert.match(ler('app/pages/fiis.vue'), /to="\/rankings\/fiis"/)
  assert.match(ler('app/pages/rankings/index.vue'), /to="\/rankings\/fiis"/)
  assert.match(ler('app/pages/rankings/index.vue'), /to="\/rankings\/small-caps"/)
  assert.match(ler('app/components/nu/NuFooter.vue'), /to: '\/rankings\/fiis'/)
  assert.match(ler('app/utils/topo.ts'), /to: '\/rankings\/small-caps'/)
  assert.equal(destinoSemBarra('/rankings/fiis/'), FIIS_RANK_PATH)
  assert.equal(destinoSemBarra('/rankings/small-caps/'), SMALL_CAPS_PATH)
  assert.equal(destinoSemBarra('/small-caps/'), SMALL_CAPS_PATH)
  assert.equal(RANKINGS['mais-baratas-graham']!.title, 'Mais Baratas (Graham)')
  assert.equal(existsSync(new URL('../tests/cvm-textos-neutros.test.ts', import.meta.url)), false)
})

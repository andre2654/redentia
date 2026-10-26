/**
 * Régua da página /calculadora/preco-teto/{TICKER}: quem entra, a conta
 * (a mesma da calculadora) e o orçamento de title/description.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeAll } from '../app/utils/preco-teto.ts'
import {
  TETO_DESCRICAO,
  TETO_TITULO,
} from '../app/utils/serp.ts'
import { PRECO_TETO_ELEGIVEIS } from '../server/data/preco-teto-elegiveis.ts'
import {
  dividendoParaBazin,
  hrefPrecoTeto,
  lpaDeOverview,
  montarPrecoTeto,
  paginaPrecoTetoExiste,
  setorDoPapel,
  tickerDePaginaPrecoTeto,
  tituloCabeNoSerp,
  tituloPrecoTeto,
  tituloVisivel,
  vpaDeOverview,
} from '../app/utils/preco-teto-pagina.ts'
import type { ProventoRow } from '../app/utils/proventos.ts'

const base = {
  ticker: 'PETR4',
  nomeBruto: 'PETROBRAS   PN      N2',
  tipo: 'STOCK',
  preco: 38,
  priceDate: '2026-10-23',
  setorBruto: 'Energy',
  lpa: 8,
  vpa: 35,
  dividendo: 5,
  dividendoFonte: 'soma' as const,
  dyPct: 13.16,
  sectorPL: 6,
  sectorPLFonte: 'setor' as const,
  temPaginaDividendos: true,
}

test('ticker de preço teto é ação ou FII com cotação; BDR, ETF, alias e sem preço ficam de fora', () => {
  assert.equal(tickerDePaginaPrecoTeto({ ticker: 'petr4', type: 'STOCK', market_price: 10 }), 'PETR4')
  assert.equal(tickerDePaginaPrecoTeto({ ticker: 'taee11', type: 'STOCK', market_price: 30 }), 'TAEE11')
  assert.equal(tickerDePaginaPrecoTeto({ ticker: 'hglg11', type: 'REIT', market_price: 160 }), 'HGLG11')
  assert.equal(tickerDePaginaPrecoTeto({ ticker: 'AAPL34', type: 'BDR', market_price: 50 }), null)
  assert.equal(tickerDePaginaPrecoTeto({ ticker: 'BOVA11', type: 'ETF', market_price: 100 }), null)
  assert.equal(tickerDePaginaPrecoTeto({ ticker: 'EMBR3', type: 'STOCK', market_price: 10, alias_of: 'EMBJ3' }), null)
  assert.equal(tickerDePaginaPrecoTeto({ ticker: 'ZZZZ9', type: 'STOCK', market_price: 0 }), null)
  assert.equal(tickerDePaginaPrecoTeto({ ticker: 'AAPL', type: 'US_STOCK', market_price: 10 }), null)
})

test('página existe com LPA ou dividendo, e não só com VPA', () => {
  assert.equal(paginaPrecoTetoExiste(1, 0), true)
  assert.equal(paginaPrecoTetoExiste(0, 0.5), true)
  assert.equal(paginaPrecoTetoExiste(-2, 0), false)
  assert.equal(paginaPrecoTetoExiste(0, 0), false)
  assert.equal(hrefPrecoTeto({ type: 'STOCK', ticker: 'bbas3', lpa: 1, dividendo: 0 }), '/calculadora/preco-teto/BBAS3')
  assert.equal(hrefPrecoTeto({ type: 'BDR', ticker: 'AAPL34', lpa: 2, dividendo: 1 }), null)
  assert.equal(hrefPrecoTeto({ type: 'STOCK', ticker: 'XYZW3', lpa: 0, dividendo: 0 }), null)
})

test('LPA e VPA leem o overview, com o fallback do valuation e do FII', () => {
  assert.equal(lpaDeOverview({ key_statistics: { trailing_eps: '10.35' } }), 10.35)
  assert.equal(lpaDeOverview({ scrape_extras: { valuation: { earnings_per_share: 2 } } }), 2)
  assert.equal(vpaDeOverview({ key_statistics: { book_value: '37.31' } }), 37.31)
  assert.equal(vpaDeOverview({ scrape_extras: { fii: { book_value_per_share: 100 } } }), 100)
  assert.equal(vpaDeOverview({ key_statistics: { book_value: '-1' } }), 0)
})

test('Bazin usa a soma quando ela fecha com o DY, e o yield oficial quando não fecha', () => {
  const rows: ProventoRow[] = [{
    date: '2026-06-01', hasExDate: true, payDate: '2026-06-15', rate: 2, label: 'Dividendo', income: true,
  }]
  const fecha = dividendoParaBazin({ overviewDy: 10, price: 20, rows, today: '2026-10-23' })
  assert.equal(fecha.fonte, 'soma')
  assert.equal(fecha.valor, 2)

  const naoFecha = dividendoParaBazin({ overviewDy: 6, price: 100, rows, today: '2026-10-23' })
  assert.equal(naoFecha.fonte, 'dy')
  assert.equal(naoFecha.valor, 6)

  const semRenda = dividendoParaBazin({
    overviewDy: 40,
    price: 10,
    rows: [{ date: '2024-01-01', hasExDate: true, payDate: '2024-01-15', rate: 9, label: 'Dividendo', income: true }],
    today: '2026-10-23',
  })
  assert.equal(semRenda.valor, 0)
  assert.equal(semRenda.fonte, 'nenhum')
})

test('a página de PETR4 usa a mesma conta da calculadora, a tabela de 4% a 12% e cabe no SERP', () => {
  const view = montarPrecoTeto(base)
  assert.ok(view)
  const calc = computeAll({ price: 38, lpa: 8, vpa: 35, dividend: 5, sectorPL: 6 })
  assert.ok(calc)
  assert.equal(view.bazin, calc.bazin.fairPrice)
  assert.equal(view.graham, calc.graham.fairPrice)
  assert.equal(view.plSetorial, calc.plSector.fairPrice)
  assert.equal(view.vpaTeto, calc.bookValue.fairPrice)
  assert.equal(view.consenso, calc.consensus.averageFairPrice)
  assert.equal(view.tabela.length, 9)
  assert.equal(view.tabela[0]!.pct, 4)
  assert.equal(view.tabela.at(-1)!.pct, 12)
  const seis = view.tabela.find((l) => l.bazin)
  assert.equal(seis?.pct, 6)
  assert.equal(seis?.teto, view.bazin)
  assert.equal(view.title, 'Preço teto PETR4 hoje: Bazin, Graham e justo')
  assert.equal(tituloCabeNoSerp(view.title), true)
  assert.ok(tituloVisivel(view.title).length <= TETO_TITULO)
  assert.ok(view.description.length <= TETO_DESCRICAO, String(view.description.length))
  assert.match(view.description, /Não é recomendação/)
  assert.match(view.paragrafo, /Petrobras/)
  assert.match(view.paragrafo, /Não é recomendação de compra ou venda/)
  assert.equal(/\bcompre\b/i.test(view.paragrafo + view.resposta + view.faq.map((f) => f.a).join(' ')), false)
  assert.equal(view.assetHref, '/asset/PETR4')
  assert.equal(view.dividendosHref, '/dividendos/PETR4')
  assert.equal(view.setorHref, '/setor/energia')
  assert.equal(view.dataTexto, '23 de outubro de 2026')
  assert.equal(view.passos.some((p) => p.linhas.some((l) => l.includes('5,00') && l.includes('0,06'))), true)
})

test('FII sem LPA não promete Graham no título e ainda tem Bazin e VPA', () => {
  const view = montarPrecoTeto({
    ...base,
    ticker: 'HGLG11',
    nomeBruto: 'CSHG LOG',
    fiiTradingName: 'CSHG Logística',
    tipo: 'REIT',
    preco: 160,
    lpa: 0,
    vpa: 100,
    dividendo: 1.2,
    sectorPL: 0,
    sectorPLFonte: 'sem-lpa',
    setorBruto: 'Real Estate',
  })
  assert.ok(view)
  assert.equal(view.graham, 0)
  assert.equal(view.bazin, 1.2 / 0.06)
  assert.equal(view.vpaTeto, 150)
  assert.equal(view.title, tituloPrecoTeto('HGLG11', false))
  assert.equal(tituloCabeNoSerp(view.title), true)
  assert.match(view.title, /Bazin/)
  assert.equal(view.title.includes('Graham'), false)
  assert.equal(view.unidade, 'cota')
  assert.equal(view.setorHref, '/setor/imobiliario')
})

test('sem LPA e sem dividendo a montagem devolve null, não uma página vazia', () => {
  assert.equal(montarPrecoTeto({ ...base, lpa: 0, dividendo: 0, vpa: 40 }), null)
  assert.equal(montarPrecoTeto({ ...base, lpa: -3, dividendo: 0 }), null)
  assert.equal(montarPrecoTeto({ ...base, preco: 0 }), null)
})

test('o sitemap gerado traz PETR4, TAEE11 e BBAS3 e deixa BDR e ETF de fora', () => {
  const tickers = new Set(PRECO_TETO_ELEGIVEIS.map((t) => t.ticker))
  assert.ok(tickers.has('PETR4'))
  assert.ok(tickers.has('TAEE11'))
  assert.ok(tickers.has('BBAS3'))
  assert.ok(tickers.has('HGLG11'))
  assert.equal(tickers.has('AAPL34'), false)
  assert.equal(tickers.has('BOVA11'), false)
  assert.ok(tickers.size > 400 && tickers.size < 800, String(tickers.size))
})

test('setor inglês conhecido vira o nome da rota /setor', () => {
  assert.deepEqual(setorDoPapel('Energy'), { nome: 'Energia', href: '/setor/energia' })
  assert.deepEqual(setorDoPapel('Financials'), { nome: 'Serviços financeiros', href: '/setor/financeiro' })
  assert.equal(setorDoPapel('Not A Sector')?.href, null)
  assert.equal(setorDoPapel(null), null)
})

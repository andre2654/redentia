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
  brl,
  dividendoParaBazin,
  hrefPrecoTeto,
  lpaDeOverview,
  montarPrecoTeto,
  paginaPrecoTetoExiste,
  setorDoPapel,
  sectorPlEfetivo,
  tickerDePaginaPrecoTeto,
  descricaoPrecoTeto,
  mesclarSitemapPrecoTeto,
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
  assert.equal(view.title, 'Preço Teto PETR4 hoje: Bazin, Graham e média')
  assert.equal(tituloCabeNoSerp(view.title), true)
  assert.ok(tituloVisivel(view.title).length <= TETO_TITULO)
  assert.ok(view.description.length <= TETO_DESCRICAO, String(view.description.length))
  assert.match(view.description, /^Preço teto PETR4 \(Petrobras, Energia\): /)
  assert.match(view.description, /38,00/)
  assert.match(view.description, /dividendos/)
  assert.match(view.description, /Bazin/)
  assert.match(view.description, /abaixo da média/)
  assert.match(view.paragrafo, /Graham/)
  assert.match(view.description, /Estimativa educacional, não é recomendação\.$/)
  assert.match(view.paragrafo, /Petrobras/)
  assert.match(view.paragrafo, /Energia/)
  assert.match(view.paragrafo, /barata/)
  assert.match(view.paragrafo, /subvalorizada/)
  assert.match(view.paragrafo, /Graham/)
  assert.match(view.paragrafo, /dividendo de renda dos últimos 12 meses/)
  assert.ok(view.relacionados.length >= 3 && view.relacionados.length <= 6)
  assert.match(view.paragrafo, /Estimativa educacional, não é recomendação/)
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
  assert.equal(view.title, 'Preço Teto HGLG11 hoje: Bazin e média')
  assert.equal(view.title, tituloPrecoTeto('HGLG11', false, view.nome, true))
  assert.equal(tituloCabeNoSerp(view.title), true)
  assert.match(view.title, /Preço Teto HGLG11 hoje/)
  assert.match(view.title, /Bazin/)
  assert.equal(view.title.includes('Graham'), false)
  assert.match(view.description, /^Preço teto HGLG11 \(Cshg Logística, Imobiliário\): /)
  assert.match(view.description, /160,00/)
  assert.match(view.description, /Bazin/)
  assert.match(view.description, /acima da média/)
  assert.match(view.paragrafo, /dividendo de renda dos últimos 12 meses/)
  assert.match(view.description, /Estimativa educacional, não é recomendação\.$/)
  assert.equal(view.description.includes('Graham'), false)
  assert.equal(view.paragrafo.includes('barata'), false)
  assert.match(view.paragrafo, /acima dessa média/)
  assert.equal(view.unidade, 'cota')
  assert.equal(view.setorHref, '/setor/imobiliario')
})

test('sem média de setor o P/L setorial fica indisponível e sai do consenso', () => {
  assert.deepEqual(sectorPlEfetivo(8, null), { valor: 0, fonte: 'ausente' })
  assert.deepEqual(sectorPlEfetivo(8, 0), { valor: 0, fonte: 'ausente' })
  assert.deepEqual(sectorPlEfetivo(0, 6), { valor: 0, fonte: 'sem-lpa' })
  assert.deepEqual(sectorPlEfetivo(8, 6), { valor: 6, fonte: 'setor' })

  const view = montarPrecoTeto({ ...base, sectorPL: 38 / 8, sectorPLFonte: 'ausente' })
  assert.ok(view)
  const semSetor = computeAll({ price: 38, lpa: 8, vpa: 35, dividend: 5, sectorPL: 0 })
  const comProprio = computeAll({ price: 38, lpa: 8, vpa: 35, dividend: 5, sectorPL: 38 / 8 })
  assert.ok(semSetor && comProprio)
  assert.equal(view.plSetorial, 0)
  assert.equal(comProprio.plSector.fairPrice, 38)
  assert.equal(view.consenso, semSetor.consensus.averageFairPrice)
  assert.notEqual(view.consenso, comProprio.consensus.averageFairPrice)
  const passo = view.passos.find((p) => p.titulo === 'P/L setorial')
  assert.match(passo?.linhas.join(' ') ?? '', /indisponível/i)
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

test('falha de rede no build não tira do sitemap quem já estava', () => {
  const anterior = [
    { ticker: 'PETR4', lastmod: '2026-10-23' },
    { ticker: 'AALR3', lastmod: '2026-10-23' },
  ]
  const saida = mesclarSitemapPrecoTeto(anterior, [
    { ticker: 'PETR4', status: 'falha' },
    { ticker: 'AALR3', status: 'nao' },
    { ticker: 'VALE3', status: 'sim', lastmod: '2026-10-23' },
    { ticker: 'NOVO3', status: 'falha' },
  ])
  assert.deepEqual(saida.map((t) => t.ticker), ['PETR4', 'VALE3'])
})

const CVM20 = /\b(barato|oportunidade|compre|vale a pena)\b/i

test('título e description de preço teto descrevem a conta de Bazin, cabem no SERP e não recomendam', () => {
  const reais = (v: number) => brl(v).replace(/\u00a0/g, ' ')
  const casos: Array<{
    ticker: string
    nome: string
    preco: number
    bazin: number | null
    graham: number | null
    consenso: number | null
    titulo: string
    description: string
  }> = [
    {
      ticker: 'BBAS3', nome: 'Banco do Brasil',
      preco: 16.47, bazin: 11.51, graham: 39.27, consenso: 32.86,
      titulo: 'Preço Teto BBAS3 hoje: Bazin, Graham e média',
      description: `Preço teto BBAS3 hoje: Bazin, Graham e média (Banco do Brasil). Bazin ${reais(11.51)}. Graham ${reais(39.27)}. Estimativa educacional, não é recomendação.`,
    },
    {
      ticker: 'ITUB4', nome: 'Itaú Unibanco',
      preco: 38.69, bazin: 52.47, graham: 43.43, consenso: 41.85,
      titulo: 'Preço Teto ITUB4 hoje: Bazin, Graham e média',
      description: `Preço teto ITUB4 hoje: Bazin, Graham e média (Itaú Unibanco). Bazin ${reais(52.47)}. Graham ${reais(43.43)}. Estimativa educacional, não é recomendação.`,
    },
    {
      ticker: 'ITSA4', nome: 'Itaúsa',
      preco: 12.45, bazin: 19.06, graham: 17.47, consenso: 16.36,
      titulo: 'Preço Teto ITSA4 hoje: Bazin, Graham e média',
      description: `Preço teto ITSA4 hoje: Bazin, Graham e média (Itaúsa). Bazin ${reais(19.06)}. Graham ${reais(17.47)}. Cotação ${reais(12.45)}. Estimativa educacional, não é recomendação.`,
    },
    {
      ticker: 'SAPR4', nome: 'Sanepar',
      preco: 6.03, bazin: 1.88, graham: 7.37, consenso: 7.09,
      titulo: 'Preço Teto SAPR4 hoje: Bazin, Graham e média',
      description: `Preço teto SAPR4 hoje: Bazin, Graham e média (Sanepar). Bazin ${reais(1.88)}. Graham ${reais(7.37)}. Cotação ${reais(6.03)}. Estimativa educacional, não é recomendação.`,
    },
    {
      ticker: 'CXSE3', nome: 'Caixa Seguridade',
      preco: 21.38, bazin: 22.54, graham: 12.49, consenso: 13.97,
      titulo: 'Preço Teto CXSE3 hoje: Bazin, Graham e média',
      description: `Preço teto CXSE3 hoje: Bazin, Graham e média (Caixa Seguridade). Bazin ${reais(22.54)}. Graham ${reais(12.49)}. Estimativa educacional, não é recomendação.`,
    },
    {
      ticker: 'POMO4', nome: 'Marcopolo',
      preco: 3.7, bazin: null, graham: null, consenso: null,
      titulo: 'Preço Teto POMO4 hoje: Bazin e média',
      description: `Preço teto POMO4 hoje (Marcopolo). Cotação ${reais(3.7)}. Estimativa educacional, não é recomendação.`,
    },
    {
      ticker: 'UNIP6', nome: 'Unipar',
      preco: 51, bazin: null, graham: null, consenso: null,
      titulo: 'Preço Teto UNIP6 hoje: Bazin e média',
      description: `Preço teto UNIP6 hoje (Unipar). Cotação ${reais(51)}. Estimativa educacional, não é recomendação.`,
    },
  ]

  for (const c of casos) {
    const titulo = tituloPrecoTeto(c.ticker, (c.graham ?? 0) > 0)
    assert.equal(titulo, c.titulo, c.ticker)
    assert.ok(tituloVisivel(titulo).length <= TETO_TITULO, `${c.ticker} title ${tituloVisivel(titulo).length}`)
    const description = descricaoPrecoTeto({
      ticker: c.ticker,
      nome: c.nome,
      preco: reais(c.preco),
      bazin: c.bazin != null && c.bazin > 0 ? reais(c.bazin) : null,
      graham: c.graham != null && c.graham > 0 ? reais(c.graham) : null,
      consenso: c.consenso != null && c.consenso > 0 ? reais(c.consenso) : null,
    })
    assert.equal(description, c.description, c.ticker)
    assert.ok(description.length <= TETO_DESCRICAO, `${c.ticker} ${description.length}`)
    assert.doesNotMatch(`${titulo}\n${description}`, CVM20, c.ticker)
  }

  assert.equal(tituloPrecoTeto('POMO4', true), 'Preço Teto POMO4 hoje: Bazin, Graham e média')
  assert.equal(tituloPrecoTeto('UNIP6', true), 'Preço Teto UNIP6 hoje: Bazin, Graham e média')
  assert.equal(tituloPrecoTeto('ITUB4', false), 'Preço Teto ITUB4 hoje: Bazin e média')
  assert.equal(tituloPrecoTeto('OIBR3', true, 'Oi'), 'Preço Teto OIBR3 hoje: Oi, Bazin, Graham e média')
  assert.equal(tituloPrecoTeto('PETR4', true, 'Petrobras'), 'Preço Teto PETR4 hoje: Bazin, Graham e média')
  assert.ok(tituloVisivel(tituloPrecoTeto('POMO4', true)).length <= TETO_TITULO)
  assert.ok(tituloVisivel(tituloPrecoTeto('UNIP6', true)).length <= TETO_TITULO)
  assert.ok(tituloVisivel(tituloPrecoTeto('OIBR3', true, 'Oi')).length <= TETO_TITULO)
})

test('preço teto sem Bazin, Graham ou consenso não inventa esses números', () => {
  const d = descricaoPrecoTeto({
    ticker: 'BBAS3', nome: 'Banco do Brasil',
    preco: brl(10), bazin: null, graham: null, consenso: null,
  })
  assert.equal(d, `Preço teto BBAS3 hoje (Banco do Brasil). Cotação ${brl(10).replace(/\u00a0/g, ' ')}. Estimativa educacional, não é recomendação.`)
  assert.doesNotMatch(d, /Bazin R\$|Graham|Média R\$|Brapi|\d{2}\/\d{2}/)
  assert.match(d, /Estimativa educacional, não é recomendação\.$/)
  assert.ok(d.length <= TETO_DESCRICAO, String(d.length))
  assert.doesNotMatch(d, CVM20)
})

test('nome longo de preço teto cabe no teto da description', () => {
  const nome = 'Companhia Brasileira de Distribuição e Logística Integrada Nacional e outro complemento para estourar o teto'
  const d = descricaoPrecoTeto({
    ticker: 'BBAS3', nome,
    preco: brl(16.47), bazin: brl(11.51), graham: brl(39.27), consenso: brl(32.86),
  })
  assert.ok(d.length <= TETO_DESCRICAO, `${d.length}: ${d}`)
  assert.match(d, /^Preço teto BBAS3 hoje/)
  assert.match(d, /Estimativa educacional, não é recomendação\.$/)
  assert.doesNotMatch(d, CVM20)
  const titulo = tituloPrecoTeto('BBAS3', true)
  assert.equal(titulo, 'Preço Teto BBAS3 hoje: Bazin, Graham e média')
  assert.match(titulo, /Preço Teto BBAS3 hoje/)
  assert.ok(tituloVisivel(titulo).length <= TETO_TITULO)
})

test('setor inglês conhecido vira o nome da rota /setor', () => {
  assert.deepEqual(setorDoPapel('Energy'), { nome: 'Energia', href: '/setor/energia' })
  assert.deepEqual(setorDoPapel('Financials'), { nome: 'Serviços financeiros', href: '/setor/financeiro' })
  assert.equal(setorDoPapel('Not A Sector')?.href, null)
  assert.equal(setorDoPapel(null), null)
})

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
  sectorPlEfetivo,
  tickerDePaginaPrecoTeto,
  descricaoPrecoTeto,
  mesclarSitemapPrecoTeto,
  TICKERS_TITULO_PRECO_JUSTO,
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
  assert.equal(view.title, 'Preço teto PETR4 hoje: Bazin, Graham e consenso')
  assert.equal(tituloCabeNoSerp(view.title), true)
  assert.ok(tituloVisivel(view.title).length <= TETO_TITULO)
  assert.ok(view.description.length <= TETO_DESCRICAO, String(view.description.length))
  assert.match(view.description, /^Preço teto PETR4 \(Petrobras\) em 23\/10: /)
  assert.match(view.description, /Bazin R\$/)
  assert.match(view.description, /Graham R\$/)
  assert.match(view.description, /consenso R\$/)
  assert.match(view.description, /Cotação R\$ 38,00 \(Brapi\)\./)
  assert.match(view.description, /Não é recomendação\.$/)
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
  assert.match(view.description, /em 23\/10/)
  assert.match(view.description, /\(Brapi\)/)
  assert.equal(view.description.includes('Graham'), false)
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

test('título e description de preço teto usam o dado, cabem no SERP e não recomendam', () => {
  assert.deepEqual([...TICKERS_TITULO_PRECO_JUSTO].sort(), ['ITSA4', 'ITUB4', 'SAPR4'])

  const casos: Array<{
    ticker: string
    nome: string
    dataISO: string
    preco: number
    bazin: number | null
    graham: number | null
    consenso: number | null
    titulo: string
    description: string
  }> = [
    {
      ticker: 'BBAS3', nome: 'Banco do Brasil', dataISO: '2026-10-30',
      preco: 16.47, bazin: 11.51, graham: 39.27, consenso: 32.86,
      titulo: 'Preço teto BBAS3 hoje: Bazin, Graham e consenso',
      description: 'Preço teto BBAS3 (Banco do Brasil) em 30/10: Bazin R$ 11,51, Graham R$ 39,27, consenso R$ 32,86. Cotação R$ 16,47 (Brapi). Não é recomendação.',
    },
    {
      ticker: 'ITUB4', nome: 'Itaú Unibanco', dataISO: '2026-10-30',
      preco: 38.69, bazin: 52.47, graham: 43.43, consenso: 41.85,
      titulo: 'Preço teto e preço justo ITUB4: Bazin e Graham',
      description: 'Preço teto ITUB4 (Itaú Unibanco) em 30/10: Bazin R$ 52,47, Graham R$ 43,43, consenso R$ 41,85. Cotação R$ 38,69 (Brapi). Não é recomendação.',
    },
    {
      ticker: 'ITSA4', nome: 'Itaúsa', dataISO: '2026-10-30',
      preco: 12.45, bazin: 19.06, graham: 17.47, consenso: 16.36,
      titulo: 'Preço teto e preço justo ITSA4: Bazin e Graham',
      description: 'Preço teto ITSA4 (Itaúsa) em 30/10: Bazin R$ 19,06, Graham R$ 17,47, consenso R$ 16,36. Cotação R$ 12,45 (Brapi). Não é recomendação.',
    },
    {
      ticker: 'SAPR4', nome: 'Sanepar', dataISO: '2026-10-30',
      preco: 6.03, bazin: 1.88, graham: 7.37, consenso: 7.09,
      titulo: 'Preço teto e preço justo SAPR4: Bazin e Graham',
      description: 'Preço teto SAPR4 (Sanepar) em 30/10: Bazin R$ 1,88, Graham R$ 7,37, consenso R$ 7,09. Cotação R$ 6,03 (Brapi). Não é recomendação.',
    },
    {
      ticker: 'CXSE3', nome: 'Caixa Seguridade', dataISO: '2026-10-30',
      preco: 21.38, bazin: 22.54, graham: 12.49, consenso: 13.97,
      titulo: 'Preço teto CXSE3 hoje: Bazin, Graham e consenso',
      description: 'Preço teto CXSE3 (Caixa Seguridade) em 30/10: Bazin R$ 22,54, Graham R$ 12,49, consenso R$ 13,97. Cotação R$ 21,38 (Brapi). Não é recomendação.',
    },
    {
      ticker: 'POMO4', nome: 'Marcopolo', dataISO: '2026-10-30',
      preco: 3.7, bazin: null, graham: null, consenso: null,
      titulo: 'Preço teto POMO4 hoje: Bazin e consenso',
      description: 'Preço teto POMO4 (Marcopolo) em 30/10: sem número de Bazin, Graham ou consenso. Cotação R$ 3,70 (Brapi). Não é recomendação.',
    },
    {
      ticker: 'UNIP6', nome: 'Unipar', dataISO: '2026-10-30',
      preco: 51, bazin: null, graham: null, consenso: null,
      titulo: 'Preço teto UNIP6 hoje: Bazin e consenso',
      description: 'Preço teto UNIP6 (Unipar) em 30/10: sem número de Bazin, Graham ou consenso. Cotação R$ 51,00 (Brapi). Não é recomendação.',
    },
  ]

  for (const c of casos) {
    const titulo = tituloPrecoTeto(c.ticker, (c.graham ?? 0) > 0)
    assert.equal(titulo, c.titulo, c.ticker)
    assert.ok(tituloVisivel(titulo).length <= TETO_TITULO, `${c.ticker} title ${tituloVisivel(titulo).length}`)
    const description = descricaoPrecoTeto(c)
    assert.equal(description, c.description, c.ticker)
    assert.ok(description.length <= TETO_DESCRICAO, `${c.ticker} ${description.length}`)
    assert.doesNotMatch(`${titulo}\n${description}`, CVM20, c.ticker)
  }

  assert.equal(tituloPrecoTeto('POMO4', true), 'Preço teto POMO4 hoje: Bazin, Graham e consenso')
  assert.equal(tituloPrecoTeto('UNIP6', true), 'Preço teto UNIP6 hoje: Bazin, Graham e consenso')
  assert.equal(tituloPrecoTeto('ITUB4', false), 'Preço teto ITUB4 hoje: Bazin e consenso')
  assert.ok(tituloVisivel(tituloPrecoTeto('POMO4', true)).length <= TETO_TITULO)
  assert.ok(tituloVisivel(tituloPrecoTeto('UNIP6', true)).length <= TETO_TITULO)

  const outraData = descricaoPrecoTeto({
    ticker: 'BBAS3', nome: 'Banco do Brasil', dataISO: '2026-01-05',
    preco: 10, bazin: 11.51, graham: 39.27, consenso: 32.86,
  })
  assert.match(outraData, /em 05\/01/)
  assert.match(outraData, /Cotação R\$ 10,00 \(Brapi\)/)
  assert.doesNotMatch(outraData, /30\/10|16,47/)
})

test('preço teto sem número não inventa data nem valor', () => {
  const d = descricaoPrecoTeto({
    ticker: 'BBAS3', nome: 'Banco do Brasil', dataISO: null,
    preco: null, bazin: null, graham: null, consenso: null,
  })
  assert.match(d, /sem data de fechamento/)
  assert.match(d, /sem número de Bazin, Graham ou consenso/)
  assert.match(d, /Cotação sem número neste fechamento/)
  assert.match(d, /Não é recomendação\.$/)
  assert.doesNotMatch(d, /R\$|\d{2}\/\d{2}/)
  assert.ok(d.length <= TETO_DESCRICAO, String(d.length))
  assert.doesNotMatch(d, CVM20)
})

test('nome longo de preço teto cabe sem cortar o valor', () => {
  const nome = 'Companhia Brasileira de Distribuição e Logística Integrada Nacional e outro complemento para estourar o teto'
  const d = descricaoPrecoTeto({
    ticker: 'BBAS3', nome, dataISO: '2026-10-30',
    preco: 16.47, bazin: 11.51, graham: 39.27, consenso: 32.86,
  })
  assert.ok(d.length <= TETO_DESCRICAO, `${d.length}: ${d}`)
  assert.match(d, /BBAS3/)
  assert.match(d, /R\$ 11,51/)
  assert.match(d, /R\$ 39,27/)
  assert.match(d, /R\$ 32,86/)
  assert.match(d, /R\$ 16,47 \(Brapi\)/)
  assert.match(d, /em 30\/10/)
  assert.equal(d.includes(nome), false)
  assert.doesNotMatch(d, CVM20)
  const titulo = tituloPrecoTeto('BBAS3', true)
  assert.ok(tituloVisivel(titulo).length <= TETO_TITULO)
})

test('setor inglês conhecido vira o nome da rota /setor', () => {
  assert.deepEqual(setorDoPapel('Energy'), { nome: 'Energia', href: '/setor/energia' })
  assert.deepEqual(setorDoPapel('Financials'), { nome: 'Serviços financeiros', href: '/setor/financeiro' })
  assert.equal(setorDoPapel('Not A Sector')?.href, null)
  assert.equal(setorDoPapel(null), null)
})

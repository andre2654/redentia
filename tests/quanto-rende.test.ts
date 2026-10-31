/**
 * Conta de /quanto-rende: proventos sobre um valor, IR da tabela regressiva
 * já descrita no site, e o que o sitemap deixa entrar.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  VALOR_PADRAO,
  aliquotaFmt,
  aliquotaIrRendaFixa,
  classeDeTesouro,
  contaTesouro,
  lerValorBr,
  paginaTesouroValida,
  quantoRendeProventos,
  seoQuantoRendeTesouro,
  seoQuantoRendeTicker,
  valorQuantoRende,
} from '../app/utils/quanto-rende.ts'
import { TETO_DESCRICAO, TETO_TITULO, SUFIXO_MARCA } from '../app/utils/serp.ts'
import { slugsDePaginaQuantoRendeTesouro, tickersDePaginaQuantoRende } from '../server/utils/quanto-rende-sitemap.ts'
import { tipoDoSitemap } from '../server/utils/sitemap-xml.ts'

test('R$ 1.000 em PETR4: quantidade, proventos e percentual', () => {
  const preco = 52.71
  const porAcao = 3.6554
  const c = quantoRendeProventos(1000, preco, porAcao)
  assert.ok(c)
  assert.ok(Math.abs(c.quantidade - 1000 / preco) < 1e-9)
  assert.equal(c.inteiras, 18)
  assert.ok(Math.abs(c.proventos - c.quantidade * porAcao) < 1e-6)
  assert.ok(Math.abs(c.rendimentoPct - (porAcao / preco) * 100) < 1e-6)
  assert.ok(Math.abs(c.proventosInteiras - 18 * porAcao) < 1e-6)
  assert.ok(c.sobra > 0)
})

test('o percentual não muda com o valor, e falta de preço não inventa conta', () => {
  const a = quantoRendeProventos(1000, 10, 1)
  const b = quantoRendeProventos(2500, 10, 1)
  assert.ok(a && b)
  assert.equal(a.rendimentoPct, b.rendimentoPct)
  assert.equal(a.quantidade, 100)
  assert.equal(a.inteiras, 100)
  assert.equal(a.sobra, 0)
  assert.equal(quantoRendeProventos(1000, 0, 1), null)
  assert.equal(quantoRendeProventos(1000, 10, 0), null)
})

test('valor digitado em real e o intervalo', () => {
  assert.equal(lerValorBr('1.000,50'), 1000.5)
  assert.equal(lerValorBr('R$ 1.000'), 1000)
  assert.equal(lerValorBr('1000.50'), 1000.5)
  assert.equal(lerValorBr(''), null)
  assert.equal(valorQuantoRende(0), 1)
  assert.equal(valorQuantoRende(1e12), 100_000_000)
  assert.equal(valorQuantoRende(Number.NaN), VALOR_PADRAO)
})

test('tabela regressiva: 180, 181, 360, 361, 720 e 721 dias', () => {
  assert.equal(aliquotaIrRendaFixa(180), 0.225)
  assert.equal(aliquotaIrRendaFixa(181), 0.2)
  assert.equal(aliquotaIrRendaFixa(360), 0.2)
  assert.equal(aliquotaIrRendaFixa(361), 0.175)
  assert.equal(aliquotaIrRendaFixa(720), 0.175)
  assert.equal(aliquotaIrRendaFixa(721), 0.15)
  assert.equal(aliquotaIrRendaFixa(0), null)
  assert.equal(aliquotaFmt(0.175), '17,5%')
  assert.equal(aliquotaFmt(0.2), '20%')
})

test('prefixado: bruto e líquido de IR no vencimento, dias corridos ÷ 365', () => {
  const c = contaTesouro({
    classe: 'prefixado',
    valor: 1000,
    taxaPct: 10,
    selicPct: null,
    spreadPct: null,
    hoje: '2026-01-01',
    vencimento: '2027-01-01',
    anoConversao: null,
  })
  assert.ok(c)
  assert.equal(c.dias, 365)
  assert.ok(Math.abs((c.montante ?? 0) - 1100) < 1e-6)
  assert.ok(Math.abs((c.ganho ?? 0) - 100) < 1e-6)
  assert.equal(c.aliquota, 0.175)
  assert.ok(Math.abs((c.imposto ?? 0) - 17.5) < 1e-6)
  assert.ok(Math.abs((c.liquido ?? 0) - 1082.5) < 1e-6)
})

test('prefixado vencido não gera número', () => {
  assert.equal(contaTesouro({
    classe: 'prefixado',
    valor: 1000,
    taxaPct: 10,
    selicPct: null,
    spreadPct: null,
    hoje: '2026-10-31',
    vencimento: '2026-01-01',
    anoConversao: null,
  }), null)
})

test('IPCA+ fica em ganho real e não finge líquido em reais', () => {
  const c = contaTesouro({
    classe: 'indice',
    valor: 1000,
    taxaPct: 7.76,
    selicPct: 4.58,
    spreadPct: null,
    hoje: '2026-10-31',
    vencimento: '2027-10-31',
    anoConversao: null,
  })
  assert.ok(c)
  assert.equal(c.liquido, null)
  assert.equal(c.montante, null)
  assert.ok((c.ganhoReal ?? 0) > 70 && (c.ganhoReal ?? 0) < 80)
})

test('cupom não tem líquido único, e Selic ilustra um ano com a taxa de hoje', () => {
  const cupom = contaTesouro({
    classe: 'cupom-prefixado',
    valor: 1000,
    taxaPct: 13.49,
    selicPct: null,
    spreadPct: null,
    hoje: '2026-10-31',
    vencimento: '2027-01-01',
    anoConversao: null,
  })
  assert.ok(cupom)
  assert.equal(cupom.liquido, null)
  assert.ok((cupom.montante ?? 0) > 1000)

  const selic = contaTesouro({
    classe: 'selic',
    valor: 1000,
    taxaPct: 0.06,
    selicPct: 13.75,
    spreadPct: 0.06,
    hoje: '2026-10-31',
    vencimento: '2029-03-01',
    anoConversao: null,
  })
  assert.ok(selic)
  assert.equal(selic.dias, 365)
  assert.ok(Math.abs(selic.taxaPct - 13.81) < 1e-9)
  assert.equal(selic.aliquota, 0.175)
  assert.ok(selic.liquido != null && selic.liquido < (selic.montante ?? 0))
})

test('Renda+ acumula até o ano do nome e não vira um bolo no vencimento da API', () => {
  const antes = contaTesouro({
    classe: 'renda',
    valor: 1000,
    taxaPct: 7.46,
    selicPct: null,
    spreadPct: null,
    hoje: '2026-10-31',
    vencimento: '2049-12-15',
    anoConversao: 2030,
  })
  assert.ok(antes)
  assert.equal(antes.fase, 'acumulacao')
  assert.equal(antes.parcelas, 240)
  assert.equal(antes.liquido, null)
  assert.ok((antes.ganhoReal ?? 0) > 0)
  assert.equal(antes.dias, diasAte('2026-10-31', '2030-01-01'))

  const educando = contaTesouro({
    classe: 'educa',
    valor: 1000,
    taxaPct: 7.61,
    selicPct: null,
    spreadPct: null,
    hoje: '2026-10-31',
    vencimento: '2030-12-15',
    anoConversao: 2026,
  })
  assert.ok(educando)
  assert.equal(educando.fase, 'conversao')
  assert.equal(educando.parcelas, 60)
  assert.equal(educando.ganhoReal, null)
})

test('classe do título e quem entra na página', () => {
  assert.equal(classeDeTesouro({ slug: 'tesouro-prefixado-2029', name: 'Tesouro Prefixado 2029', indexer: 'Prefixado' }), 'prefixado')
  assert.equal(classeDeTesouro({ slug: 'tesouro-prefixado-com-juros-semestrais-2029', name: 'Tesouro Prefixado com Juros Semestrais 2029', indexer: 'Prefixado' }), 'cupom-prefixado')
  assert.equal(classeDeTesouro({ slug: 'tesouro-ipca-2029', name: 'Tesouro IPCA+ 2029', indexer: 'Indexados ao IPCA' }), 'indice')
  assert.equal(classeDeTesouro({ slug: 'tesouro-reserva-2036', name: 'Tesouro Reserva 2036', indexer: 'Indexados a SELIC' }), 'selic')
  assert.equal(classeDeTesouro({ slug: 'tesouro-renda-aposentadoria-extra-2030', name: 'Tesouro Renda+ Aposentadoria Extra 2030', indexer: 'Indexados ao IPCA' }), 'renda')

  const base = {
    slug: 'tesouro-prefixado-2029',
    name: 'Tesouro Prefixado 2029',
    indexer: 'Prefixado',
    rateNumeric: 14.8,
    referenceRate: 13.75,
    maturity: '2029-01-01',
    hoje: '2026-10-31',
  }
  assert.equal(paginaTesouroValida(base), true)
  assert.equal(paginaTesouroValida({ ...base, maturity: '2026-01-01' }), false)
  assert.equal(paginaTesouroValida({
    slug: 'tesouro-reserva-2036',
    name: 'Tesouro Reserva 2036',
    indexer: 'Indexados a SELIC',
    rateNumeric: null,
    referenceRate: 13.75,
    maturity: '2036-01-01',
    hoje: '2026-10-31',
  }), true)
  assert.equal(paginaTesouroValida({
    slug: 'tesouro-selic-2029',
    name: 'Tesouro Selic 2029',
    indexer: 'Indexados a SELIC',
    rateNumeric: 0.06,
    referenceRate: null,
    maturity: '2029-03-01',
    hoje: '2026-10-31',
  }), false)
})

test('sitemap: só count_12m > 0, e título vencido fica de fora', () => {
  const tickers = tickersDePaginaQuantoRende([
    { ticker: 'petr4', type: 'STOCK', count_12m: 8 },
    { ticker: 'MXRF11', type: 'REIT', count_12m: 12 },
    { ticker: 'AAPL34', type: 'BDR', count_12m: 4 },
    { ticker: 'AALL34', type: 'BDR', count_12m: 0 },
    { ticker: 'VAZIO3', type: 'STOCK', last_payment_date: '2020-01-01' },
    { ticker: 'BOVA11', type: 'ETF', count_12m: 4 },
    { ticker: 'MRSA3B', type: 'STOCK', count_12m: 2 },
  ])
  assert.deepEqual(tickers.map((t) => t.ticker), ['AAPL34', 'MXRF11', 'PETR4'])

  const slugs = slugsDePaginaQuantoRendeTesouro([
    { slug: 'tesouro-prefixado-2029', name: 'Tesouro Prefixado 2029', indexer: 'Prefixado', rate_numeric: 14.8, maturity_date: '2029-01-01', price_date: '2026-10-29' },
    { slug: 'tesouro-prefixado-2026', name: 'Tesouro Prefixado 2026', indexer: 'Prefixado', rate_numeric: 13, maturity_date: '2026-01-01', price_date: '2026-01-01' },
    { slug: 'tesouro-ipca-2029', name: 'Tesouro IPCA+ 2029', indexer: 'Indexados ao IPCA', rate_numeric: 7.76, maturity_date: '2029-05-15', price_date: '2026-10-29' },
    { slug: 'tesouro-reserva-2036', name: 'Tesouro Reserva 2036', indexer: 'Indexados a SELIC', rate_numeric: null, reference_rate: 13.75, maturity_date: '2036-01-01', price_date: '2026-10-28' },
  ], '2026-10-31')
  assert.deepEqual(slugs.map((s) => s.slug), [
    'tesouro-ipca-2029',
    'tesouro-prefixado-2029',
    'tesouro-reserva-2036',
  ])
  assert.equal(tipoDoSitemap('quanto-rende.xml'), 'quanto-rende')
  assert.equal(tipoDoSitemap('quanto-rende'), 'quanto-rende')
})

test('title e description cabem no SERP e carregam o aviso', () => {
  const seo = seoQuantoRendeTicker({
    ticker: 'PETR4',
    valor: 1000,
    preco: 52.71,
    quantidade: 1000 / 52.71,
    proventos: (1000 / 52.71) * 3.6554,
    rendimentoPct: (3.6554 / 52.71) * 100,
    unidadePlural: 'ações',
  })
  assert.ok(seo.title.length + SUFIXO_MARCA.length <= TETO_TITULO, seo.title)
  assert.ok(seo.description.length <= TETO_DESCRICAO, `${seo.description.length} ${seo.description}`)
  assert.match(seo.description, /Rentabilidade passada não garante a futura/)
  assert.match(seo.description, /Não é recomendação/)

  const tesouro = seoQuantoRendeTesouro({
    nome: 'Tesouro Renda+ Aposentadoria Extra 2065',
    taxaRotulo: 'IPCA + 7,16%',
    resumo: 'R$ 1.000,00 no Tesouro Renda+ Aposentadoria Extra 2065: ganho real de R$ 200,00 acima do índice, no prazo da conta.',
  })
  assert.ok(tesouro.title.length + SUFIXO_MARCA.length <= TETO_TITULO, tesouro.title)
  assert.ok(tesouro.description.length <= TETO_DESCRICAO, tesouro.description)
})

test('as páginas pedem 404 sem provento, citam a fonte e não recomendam compra', () => {
  const ticker = readFileSync(new URL('../app/pages/quanto-rende/[ticker].vue', import.meta.url), 'utf8')
  const tesouro = readFileSync(new URL('../app/pages/quanto-rende/tesouro/[slug].vue', import.meta.url), 'utf8')
  const loader = readFileSync(new URL('../app/composables/useQuantoRende.ts', import.meta.url), 'utf8')
  const loaderTesouro = readFileSync(new URL('../app/composables/useQuantoRendeTesouro.ts', import.meta.url), 'utf8')
  assert.match(ticker, /Rentabilidade passada não garante rentabilidade futura\./)
  assert.match(ticker, /Não é recomendação de compra ou venda\./)
  assert.match(loader, /statusCode: 404/)
  assert.match(loader, /Fonte: Brapi/)
  assert.match(loader, /Fonte: avisos de proventos da B3/)
  assert.match(loaderTesouro, /Fonte: Tesouro Direto/)
  assert.doesNotMatch(ticker, /melhor investimento/i)
  assert.doesNotMatch(tesouro, /melhor investimento/i)
  const div = readFileSync(new URL('../app/pages/dividendos/[ticker].vue', import.meta.url), 'utf8')
  const asset = readFileSync(new URL('../app/pages/asset/[ticker].vue', import.meta.url), 'utf8')
  assert.match(div, /quantoRendeHref/)
  assert.match(asset, /quantoRendeHref/)
  const sitemap = readFileSync(new URL('../server/utils/sitemap-xml.ts', import.meta.url), 'utf8')
  assert.match(sitemap, /'quanto-rende': \['quanto-rende'\]/)
})

function diasAte(de: string, ate: string): number {
  const a = Date.parse(`${de}T12:00:00Z`)
  const b = Date.parse(`${ate}T12:00:00Z`)
  return Math.round((b - a) / 86_400_000)
}

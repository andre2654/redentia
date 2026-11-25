/**
 * /imposto-de-renda/{TICKER}: 50 mais líquidos, texto legal já citado no
 * repo, tipo de Bens e Direitos sem código que a Receita não publica, e
 * proventos só da base.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PRECO_TETO_FICHA } from '../server/data/preco-teto-lotes.ts'
import { destinoSemBarra } from '../server/utils/sem-barra.ts'
import { tipoDoSitemap } from '../server/utils/sitemap-xml.ts'
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO } from '../app/utils/serp.ts'
import { TICKERS_IMPOSTO_RENDA, pathsImpostoRenda, tickerNaListaImpostoRenda } from '../app/utils/impostoRendaLiquidos.ts'
import {
  URL_BENS_RECEITA,
  classeDeImpostoRenda,
  cnpjDoCadastro,
  descricaoImpostoRenda,
  montarPaginaImpostoRenda,
  tituloImpostoRenda,
  type ClasseIr,
} from '../app/utils/impostoRendaPagina.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

const TOPO = Object.entries(PRECO_TETO_FICHA)
  .sort((a, b) => b[1].volume - a[1].volume || a[0].localeCompare(b[0]))
  .slice(0, 50)
  .map(([ticker]) => ticker)

test('os 50 seguem a liquidez de PRECO_TETO_FICHA e pulam RZZI11, que não tem perfil', () => {
  assert.equal(TICKERS_IMPOSTO_RENDA.length, 50)
  const esperados = [...TOPO.filter((t) => t !== 'RZZI11'), 'XPML11']
  assert.deepEqual([...TICKERS_IMPOSTO_RENDA], esperados)
  assert.equal(TICKERS_IMPOSTO_RENDA[0], 'VALE3')
  assert.equal(tickerNaListaImpostoRenda('petr4'), true)
  assert.equal(tickerNaListaImpostoRenda('RZZI11'), false)
  assert.equal(tickerNaListaImpostoRenda('XPML11'), true)
  assert.equal(tickerNaListaImpostoRenda('HGLG11'), false)
  assert.deepEqual(pathsImpostoRenda(), TICKERS_IMPOSTO_RENDA.map((t) => `/imposto-de-renda/${t}`))
  const universo = new Map(TICKERS_IMPOSTO_RENDA.map((t) => [t, { aliasOf: t === 'PETR3' ? 'PETR4' : null }]))
  const paths = pathsImpostoRenda(universo)
  assert.equal(paths.includes('/imposto-de-renda/PETR3'), false)
  assert.equal(paths.length, 49)
  assert.deepEqual(pathsImpostoRenda(new Map()), pathsImpostoRenda())
})

test('title cabe em 60 com a marca e a description fica entre 120 e 155', () => {
  const classes: ClasseIr[] = ['acao', 'fii', 'bdr', 'etf']
  for (const ticker of TICKERS_IMPOSTO_RENDA) {
    const title = tituloImpostoRenda(ticker)
    assert.ok(title.length + SUFIXO_MARCA.length <= TETO_TITULO, `${title} ${title.length}`)
    assert.match(title, new RegExp(`^Como declarar ${ticker} no Imposto de Renda$`))
    for (const classe of classes) {
      const desc = descricaoImpostoRenda(ticker, classe)
      assert.ok(desc.length >= 120 && desc.length <= TETO_DESCRICAO, `${classe} ${ticker} ${desc.length}`)
      assert.match(desc, /não é consultoria tributária/)
    }
  }
})

test('a classe segue o cadastro, e AURA33 com coluna DR3 é BDR', () => {
  assert.equal(classeDeImpostoRenda({ assetType: 'stock', profileType: 'STOCK', nomeB3: 'PETROBRAS   PN      N2' }), 'acao')
  assert.equal(classeDeImpostoRenda({ assetType: 'fii', profileType: 'REIT', nomeB3: 'FII TRX' }), 'fii')
  assert.equal(classeDeImpostoRenda({ assetType: 'bdr', profileType: 'BDR', nomeB3: 'APPLE' }), 'bdr')
  assert.equal(classeDeImpostoRenda({ assetType: 'etf', profileType: 'ETF', nomeB3: 'BOVA' }), 'etf')
  assert.equal(classeDeImpostoRenda({ assetType: 'stock', profileType: 'STOCK', nomeB3: 'AURA 360    DR3' }), 'bdr')
  assert.equal(cnpjDoCadastro('33.000.167/0001-01'), '33.000.167/0001-01')
  assert.equal(cnpjDoCadastro('33000167000101'), '33.000.167/0001-01')
  assert.equal(cnpjDoCadastro('não informado'), null)
  assert.equal(cnpjDoCadastro(null), null)
})

test('proventos do ano saem só da base, com data de pagamento até hoje', () => {
  const pago = montarPaginaImpostoRenda({
    ticker: 'PETR4',
    nome: 'Petrobras',
    classe: 'acao',
    cnpj: '33.000.167/0001-01',
    hoje: '2026-11-24',
    rows: [
      { payDate: '2026-06-15', rate: 0.5, label: 'Dividendo' },
      { payDate: '2026-08-20', rate: 0.21, label: 'JCP' },
      { payDate: '2026-12-20', rate: 1, label: 'JCP' },
      { payDate: '2025-12-01', rate: 2, label: 'Dividendo' },
      { payDate: '', rate: 3, label: 'Dividendo' },
    ],
  })
  assert.deepEqual(pago.proventos.linhas, [
    ['20 ago 2026', 'JCP', 'R$ 0,21'],
    ['15 jun 2026', 'Dividendo', 'R$ 0,50'],
  ])
  assert.match(pago.proventos.nota, /base de proventos/)
  assert.match(JSON.stringify(pago), /33\.000\.167\/0001-01/)
  assert.equal(pago.secoes.some((s) => s.id === 'jcp'), true)

  const semCnpj = montarPaginaImpostoRenda({
    ticker: 'VALE3', nome: 'Vale', classe: 'acao', cnpj: null, hoje: '2026-11-24', rows: [],
  })
  assert.match(JSON.stringify(semCnpj.secoes), /não traz o CNPJ/)
  assert.equal(semCnpj.proventos.linhas.length, 0)
  assert.match(semCnpj.proventos.vazio ?? '', /não registra provento de VALE3/)

  const fora = montarPaginaImpostoRenda({
    ticker: 'ITUB4', nome: 'Itaú', classe: 'acao', cnpj: null, hoje: '2026-11-24', rows: null,
  })
  assert.equal(fora.proventos.linhas.length, 0)
  assert.match(fora.proventos.vazio ?? '', /não está disponível/)
  assert.doesNotMatch(JSON.stringify(fora.proventos), /R\$/)
})

test('cada classe cita a regra já usada no site e não inventa código de grupo', () => {
  const base = { nome: 'Papel', cnpj: null, hoje: '2026-11-24', rows: [] as const }
  const acao = montarPaginaImpostoRenda({ ...base, ticker: 'PETR4', classe: 'acao' })
  const fii = montarPaginaImpostoRenda({ ...base, ticker: 'KNCR11', classe: 'fii' })
  const bdr = montarPaginaImpostoRenda({ ...base, ticker: 'AURA33', classe: 'bdr' })
  const etf = montarPaginaImpostoRenda({ ...base, ticker: 'BOVA11', classe: 'etf' })
  const texto = (p: typeof acao) => JSON.stringify(p)

  assert.match(texto(acao), /Lei 15\.270\/2025/)
  assert.match(texto(acao), /17,5%/)
  assert.match(texto(acao), /Lei Complementar 224\/2025/)
  assert.match(texto(acao), /R\$ 20\.000/)
  assert.match(texto(acao), /6015/)
  assert.match(texto(acao), /linha 9/)
  assert.match(texto(acao), /linha 6/)
  assert.equal(acao.secoes.some((s) => s.id === 'jcp'), true)

  assert.match(texto(fii), /Lei 11\.033\/2004/)
  assert.match(texto(fii), /100 cotistas/)
  assert.match(texto(fii), /10%/)
  assert.match(texto(fii), /Lei 8\.668\/1993/)
  assert.match(texto(fii), /20%/)
  assert.equal(fii.secoes.some((s) => s.id === 'jcp'), false)

  assert.match(texto(bdr), /não tem a isenção do dividendo de ação brasileira/)
  assert.match(texto(bdr), /não paga JCP/)
  assert.match(texto(bdr), /sem a isenção de vendas de até R\$ 20 mil/)
  assert.equal(bdr.secoes.some((s) => s.id === 'jcp'), false)

  assert.match(texto(etf), /não vale para ETF/)
  assert.match(texto(etf), /paga 15%/)
  assert.equal(etf.secoes.some((s) => s.id === 'jcp'), false)

  for (const p of [acao, fii, bdr, etf]) {
    const cru = texto(p)
    assert.match(cru, /Conteúdo educativo/)
    assert.match(cru, /Não é consultoria tributária/)
    assert.match(cru, /não é recomendação de compra ou venda/)
    assert.match(cru, new RegExp(URL_BENS_RECEITA.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.doesNotMatch(cru, /grupo\s+\d/i)
    assert.doesNotMatch(cru, /código\s+(?!6015\b)\d/i)
    assert.doesNotMatch(cru, /\b(recomendamos|recomendo|vale a pena|compre agora)\b/i)
    assert.equal(p.faq.length >= 4, true)
  }
})

test('a página, o sitemap e o link em /dividendos ficam nos 50', () => {
  const pagina = ler('app/pages/imposto-de-renda/[ticker].vue')
  const dividendos = ler('app/pages/dividendos/[ticker].vue')
  const sitemap = ler('server/utils/sitemap-xml.ts')
  const cfg = ler('nuxt.config.ts')
  assert.match(pagina, /usePageSeo\(/)
  assert.match(pagina, /tickerNaListaImpostoRenda/)
  assert.match(pagina, /NuFaqAccordion/)
  assert.match(pagina, /\/dividendos\/\$\{ticker\}/)
  assert.match(pagina, /\/calculadora\/imposto-renda/)
  assert.match(pagina, /to="\/jcp"/)
  assert.match(pagina, /ir\.aviso/)
  assert.match(ler('app/utils/impostoRendaPagina.ts'), /Não é consultoria tributária/)
  assert.match(dividendos, /tickerNaListaImpostoRenda\(ticker\)/)
  assert.match(dividendos, /\/imposto-de-renda\/\$\{ticker\}/)
  assert.equal(tipoDoSitemap('imposto-de-renda.xml'), 'imposto-de-renda')
  assert.match(sitemap, /'imposto-de-renda': \['imposto-de-renda'\]/)
  assert.match(cfg, /'\/sitemaps\/imposto-de-renda\.xml': \{ isr: 3600 \}/)
  assert.match(ler('server/utils/site-pages.ts'), /id: 'imposto-de-renda'/)
  assert.match(ler('server/middleware/cache-sessao.ts'), /'\/imposto-de-renda\/', HORA/)
  assert.match(ler('server/routes/llms.txt.ts'), /\/imposto-de-renda\/PETR4/)
  assert.equal(destinoSemBarra('/imposto-de-renda/petr4/'), '/imposto-de-renda/PETR4')
  assert.equal(destinoSemBarra('/imposto-de-renda/petr4/?x=1'), '/imposto-de-renda/PETR4?x=1')
  assert.equal(destinoSemBarra('/imposto-de-renda/PETR4'), null)
})

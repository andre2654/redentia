/**
 * /calculadora/preco-teto/{TICKER} indexa a allowlist de cliques mais os
 * lotes de liquidez abertos. Com 3 lotes, são 337. O lote 4 e HGLG11, PETR3
 * e KNRI11 seguem noindex e fora do sitemap.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { montarPrecoTeto } from '../app/utils/preco-teto-pagina.ts'
import {
  PRECO_TETO_COM_CLIQUE,
  PRECO_TETO_INDEXAVEIS,
  precoTetoIndexavel,
  relacionadosPrecoTeto,
  robotsDePrecoTeto,
} from '../app/content/seo/preco-teto-indexaveis.ts'
import {
  PRECO_TETO_FORA_DO_LOTE,
  PRECO_TETO_FICHA,
  PRECO_TETO_LOTES_ABERTOS,
  PRECO_TETO_LOTE_LASTMOD,
  PRECO_TETO_ORDEM,
  lotesPrecoTeto,
} from '../server/data/preco-teto-lotes.ts'
import { paginasPrecoTetoIndexaveis } from '../server/utils/preco-teto-sitemap.ts'
import { semPrecoTetoPorTicker } from '../server/utils/sitemap-cache.ts'
import { SEMENTES_SITEMAP } from '../server/data/sitemap-semente.ts'
import { paginasDoGrupo, urlsetXml } from '../server/utils/sitemap-xml.ts'

const ALLOW = [
  'BBAS3', 'BBSE3', 'VALE3', 'PETR4', 'BBDC4', 'SAPR4', 'ITSA4', 'CPFE3',
  'ITUB4', 'TAEE11', 'CMIG4', 'BBDC3', 'BPAC11', 'AXIA3', 'POMO4', 'WEGE3',
  'ALOS3', 'BRBI11', 'CXSE3', 'TAEE4', 'TAEE3', 'JHSF3', 'PSSA3', 'EGIE3',
  'EQTL3', 'SAPR11', 'CPLE3', 'BRAP4', 'B3SA3', 'ITSA3', 'ABEV3', 'ABCB4',
  'GRND3', 'CURY3', 'TASA4', 'EMBJ3', 'PRSN11',
]

const PROIBIDO = /\b(barato|caro|sobrevalorizad[oa]|oportunidade|compre|venda|preço-alvo|preco-alvo)\b|preço justo|\bjusto\b|margem de segurança|retorno garantido|\bcompre\b|\bvender\b/i

function textoDaPagina(ticker: string) {
  const view = montarPrecoTeto({
    ticker,
    nomeBruto: ticker === 'HGLG11' ? 'CSHG LOG' : 'PETROBRAS PN',
    tipo: ticker === 'HGLG11' ? 'REIT' : 'STOCK',
    preco: ticker === 'HGLG11' ? 160 : 38,
    priceDate: '2026-10-23',
    setorBruto: ticker === 'HGLG11' ? 'Real Estate' : 'Energy',
    lpa: ticker === 'HGLG11' ? 0 : 8,
    vpa: ticker === 'HGLG11' ? 100 : 35,
    dividendo: ticker === 'HGLG11' ? 1.2 : 5,
    dividendoFonte: 'soma',
    dyPct: 10,
    sectorPL: ticker === 'HGLG11' ? 0 : 6,
    sectorPLFonte: ticker === 'HGLG11' ? 'sem-lpa' : 'setor',
    temPaginaDividendos: true,
  })
  assert.ok(view)
  return [
    view.title,
    view.description,
    view.resposta,
    view.paragrafo,
    ...view.passos.flatMap((p) => [p.titulo, ...p.linhas]),
    ...view.faq.flatMap((f) => [f.q, f.a]),
  ].join('\n')
}

test('três lotes abertos somam os 300 mais líquidos à allowlist de 37', () => {
  assert.deepEqual([...PRECO_TETO_COM_CLIQUE], ALLOW)
  assert.equal(new Set(ALLOW).size, 37)
  assert.equal(PRECO_TETO_LOTES_ABERTOS, 3)
  assert.equal(PRECO_TETO_ORDEM.length, 597)
  const lote1 = lotesPrecoTeto(1)[0]!
  const lote2 = lotesPrecoTeto(2)[1]!
  const lote3 = lotesPrecoTeto(3)[2]!
  const lote4 = lotesPrecoTeto(4)[3]!
  assert.equal(lote1.length, 100)
  assert.equal(lote2.length, 100)
  assert.equal(lote3.length, 100)
  assert.equal(lote4.length, 100)
  assert.equal(PRECO_TETO_INDEXAVEIS.length, 337)
  assert.equal(new Set(PRECO_TETO_INDEXAVEIS).size, 337)
  for (const ticker of ALLOW) assert.equal(precoTetoIndexavel(ticker), true, ticker)
  assert.equal(precoTetoIndexavel(lote1[0]!), true)
  assert.equal(precoTetoIndexavel(lote2[0]!), true)
  assert.equal(precoTetoIndexavel(lote2[99]!), true)
  assert.equal(precoTetoIndexavel(lote3[0]!), true)
  assert.equal(precoTetoIndexavel(lote3[99]!), true)
  assert.equal(precoTetoIndexavel('petr4'), true)
  assert.equal(precoTetoIndexavel('Petr4'), true)
  assert.equal(precoTetoIndexavel(' PETR4 '), true)
  assert.equal(precoTetoIndexavel(lote4[0]!), false, lote4[0])
  assert.equal(robotsDePrecoTeto(lote3[0]!), undefined)
  assert.equal(robotsDePrecoTeto(lote4[0]!), 'noindex, follow')
  for (const ticker of PRECO_TETO_FORA_DO_LOTE) {
    assert.equal(precoTetoIndexavel(ticker), false, ticker)
    assert.equal((PRECO_TETO_ORDEM as readonly string[]).includes(ticker), false, ticker)
  }
  assert.equal(precoTetoIndexavel('bazin'), false)
  assert.equal(lotesPrecoTeto().flat().length, 300)
  assert.equal(lotesPrecoTeto(4).flat().length, 400)
  for (let i = 1; i < PRECO_TETO_ORDEM.length; i++) {
    const antes = PRECO_TETO_FICHA[PRECO_TETO_ORDEM[i - 1]!]!.volume
    const agora = PRECO_TETO_FICHA[PRECO_TETO_ORDEM[i]!]!.volume
    assert.ok(antes >= agora, `${PRECO_TETO_ORDEM[i - 1]} ${antes} < ${PRECO_TETO_ORDEM[i]} ${agora}`)
  }
})

test('ticker da allowlist é indexável; HGLG11, PETR3 e KNRI11 seguem noindex', () => {
  assert.equal(robotsDePrecoTeto('PETR4'), undefined)
  assert.equal(robotsDePrecoTeto('petr4'), undefined)
  assert.equal(robotsDePrecoTeto('BBAS3'), undefined)
  assert.equal(robotsDePrecoTeto(lotesPrecoTeto(1)[0]![0]!), undefined)
  assert.equal(robotsDePrecoTeto(lotesPrecoTeto(2)[1]![0]!), undefined)
  assert.equal(robotsDePrecoTeto(lotesPrecoTeto(3)[2]![0]!), undefined)
  assert.equal(robotsDePrecoTeto(lotesPrecoTeto(4)[3]![0]!), 'noindex, follow')
  assert.equal(robotsDePrecoTeto('HGLG11'), 'noindex, follow')
  assert.equal(robotsDePrecoTeto('hglg11'), 'noindex, follow')
  assert.equal(robotsDePrecoTeto('PETR3'), 'noindex, follow')
  assert.equal(robotsDePrecoTeto('KNRI11'), 'noindex, follow')
  assert.equal(robotsDePrecoTeto('knri11'), 'noindex, follow')
  const vue = readFileSync(new URL('../app/components/calc/CalcPrecoTetoTicker.vue', import.meta.url), 'utf8')
  assert.match(vue, /robots:\s*robotsDePrecoTeto\(v\.ticker\)/)
  assert.match(vue, /path:\s*`\/calculadora\/preco-teto\/\$\{v\.ticker\}`/)
  assert.match(vue, /breadcrumbs:\s*\[/)
  assert.match(vue, /name: 'Preço Teto', path: '\/calculadora\/preco-teto'/)
  assert.doesNotMatch(vue, /robots:\s*'noindex, follow'/)
  const config = readFileSync(new URL('../nuxt.config.ts', import.meta.url), 'utf8')
  assert.match(config, /siteUrl: process\.env\.NUXT_PUBLIC_SITE_URL \|\| 'https:\/\/aportou\.com\.br'/)
})

test('o sitemap de preço teto traz 337 URLs e deixa o lote 4, HGLG11, PETR3 e KNRI11 de fora', () => {
  const pages = paginasPrecoTetoIndexaveis()
  const tickers = pages.map((p) => p.path.split('/').pop())
  const lote1 = lotesPrecoTeto(1)[0]!
  const lote2 = lotesPrecoTeto(2)[1]!
  const lote3 = lotesPrecoTeto(3)[2]!
  const lote4 = lotesPrecoTeto(4)[3]!
  assert.equal(pages.length, 337)
  assert.deepEqual([...tickers].sort(), [...PRECO_TETO_INDEXAVEIS].sort())
  assert.ok(pages.some((p) => p.path === '/calculadora/preco-teto/PETR4'))
  assert.ok(pages.some((p) => p.path === `/calculadora/preco-teto/${lote1[0]}`))
  assert.ok(pages.some((p) => p.path === `/calculadora/preco-teto/${lote2[0]}`))
  assert.ok(pages.some((p) => p.path === `/calculadora/preco-teto/${lote2[99]}`))
  assert.ok(pages.some((p) => p.path === `/calculadora/preco-teto/${lote3[0]}`))
  assert.ok(pages.some((p) => p.path === `/calculadora/preco-teto/${lote3[99]}`))
  assert.equal(pages.some((p) => p.path === `/calculadora/preco-teto/${lote4[0]}`), false)
  assert.equal(pages.some((p) => p.path === '/calculadora/preco-teto/HGLG11'), false)
  assert.equal(pages.some((p) => p.path === '/calculadora/preco-teto/PETR3'), false)
  assert.equal(pages.some((p) => p.path === '/calculadora/preco-teto/KNRI11'), false)
  const petr4 = pages.find((p) => p.path === '/calculadora/preco-teto/PETR4')
  assert.equal(petr4?.lastmod, '2026-10-23')
  for (const ticker of [...lote1, ...lote2, ...lote3]) {
    const page = pages.find((p) => p.path === `/calculadora/preco-teto/${ticker}`)
    assert.ok(page, ticker)
    assert.equal(page!.lastmod, PRECO_TETO_LOTE_LASTMOD, ticker)
  }
  for (const page of pages) {
    assert.match(page.path, /^\/calculadora\/preco-teto\/[A-Z][A-Z0-9]{3,5}$/)
    const ticker = page.path.split('/').pop()!
    assert.equal(ticker, ticker.toUpperCase())
  }
  const foraDoLote = lotesPrecoTeto(4)[3]![0]!
  const xml = semPrecoTetoPorTicker(urlsetXml('https://aportou.com.br', [
    ...pages,
    { path: '/calculadora/preco-teto/HGLG11', title: 'HGLG11' },
    { path: '/calculadora/preco-teto/PETR3', title: 'PETR3' },
    { path: '/calculadora/preco-teto/KNRI11', title: 'KNRI11' },
    { path: `/calculadora/preco-teto/${foraDoLote}`, title: foraDoLote },
    { path: '/calculadora/preco-teto/bazin', title: 'Bazin' },
  ]))
  assert.match(xml, /\/calculadora\/preco-teto\/PETR4</)
  assert.match(xml, new RegExp(`/calculadora/preco-teto/${lote1[0]}<`))
  assert.match(xml, new RegExp(`/calculadora/preco-teto/${lote2[0]}<`))
  assert.match(xml, new RegExp(`/calculadora/preco-teto/${lote3[0]}<`))
  assert.match(xml, /\/calculadora\/preco-teto\/bazin</)
  assert.doesNotMatch(xml, /HGLG11|PETR3|KNRI11/)
  assert.doesNotMatch(xml, new RegExp(`/calculadora/preco-teto/${foraDoLote}<`))
  const locs = [...xml.matchAll(/\/calculadora\/preco-teto\/([A-Za-z0-9-]+)</g)].map((m) => m[1])
  for (const slug of locs) {
    if (slug === slug.toLowerCase()) continue
    assert.ok(precoTetoIndexavel(slug!), slug)
  }
})

test('a semente e o índice não publicam preço teto fora da allowlist', () => {
  const cru = SEMENTES_SITEMAP['preco-teto']
  assert.ok(cru)
  const servido = semPrecoTetoPorTicker(cru.xml)
  const tickers = [...servido.matchAll(/\/calculadora\/preco-teto\/([A-Z][A-Z0-9]{3,5})</g)].map((m) => m[1])
  for (const ticker of tickers) assert.equal(precoTetoIndexavel(ticker!), true, ticker)
  assert.equal(tickers.length, 37)
  assert.equal(servido.includes('HGLG11'), false)
  assert.equal(servido.includes('PETR3'), false)
  assert.equal(servido.includes('KNRI11'), false)
  assert.equal(cru.xml.includes('HGLG11'), false)
  assert.equal(cru.xml.includes('PETR3'), false)
  assert.equal(cru.xml.includes('KNRI11'), false)
  assert.equal(cru.urls, 37)
  const indice = semPrecoTetoPorTicker(SEMENTES_SITEMAP.index!.xml)
  assert.match(indice, /sitemaps\/preco-teto\.xml/)
  const grupo = paginasDoGrupo([
    {
      id: 'preco-teto',
      title: 'Preço teto',
      pages: paginasPrecoTetoIndexaveis(),
    },
    {
      id: 'calculadoras',
      title: 'Calculadoras',
      pages: [{ path: '/calculadora/preco-teto/HGLG11', title: 'fora' }],
    },
  ], 'preco-teto')
  assert.equal(grupo.some((p) => p.path.endsWith('/HGLG11')), false)
  assert.equal(grupo.length, 337)
})

test('os links do mesmo setor só apontam para páginas indexáveis', () => {
  const links = relacionadosPrecoTeto('PETR4', 'Energy')
  assert.ok(links.length >= 3 && links.length <= 6, String(links.length))
  assert.equal(links.some((l) => l.ticker === 'PETR4'), false)
  assert.equal(links.some((l) => l.ticker === 'PETR3'), false)
  for (const link of links) {
    assert.equal(precoTetoIndexavel(link.ticker), true, link.ticker)
    assert.equal(link.href, `/calculadora/preco-teto/${link.ticker}`)
    assert.equal(PRECO_TETO_FICHA[link.ticker]?.setor, 'Energy')
  }
  assert.equal(relacionadosPrecoTeto('HGLG11', 'Real Estate').some((l) => l.ticker === 'HGLG11'), false)
  assert.equal(relacionadosPrecoTeto('ZZZZ3', '').length, 0)
})

test('o texto visível da página por ticker descreve a conta e não um veredito', () => {
  for (const ticker of ['PETR4', 'HGLG11']) {
    const texto = textoDaPagina(ticker)
    assert.doesNotMatch(texto, PROIBIDO, ticker)
    assert.match(texto, /Estimativa educacional, não é recomendação/)
    assert.match(texto, /método Bazin|método de Bazin|Pelo Bazin/)
  }
  const vue = readFileSync(new URL('../app/components/calc/CalcPrecoTetoTicker.vue', import.meta.url), 'utf8')
  assert.match(vue, /Estimativa educacional, não é recomendação/)
  assert.doesNotMatch(vue, PROIBIDO)
  assert.doesNotMatch(vue, /nu-green|nu-red|method--positive|method--negative/)
})

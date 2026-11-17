/**
 * /calculadora/preco-teto/{TICKER} volta ao índice só na allowlist do
 * Search Console (15/08 a 14/11/2026, pelo menos 2 cliques). O resto segue
 * noindex e fora de todo sitemap, inclusive da semente que a borda serve.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { montarPrecoTeto } from '../app/utils/preco-teto-pagina.ts'
import {
  PRECO_TETO_INDEXAVEIS,
  precoTetoIndexavel,
  robotsDePrecoTeto,
} from '../app/content/seo/preco-teto-indexaveis.ts'
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

const PROIBIDO = /\b(barato|caro|subvalorizad[oa]|sobrevalorizad[oa]|oportunidade|compre|venda|preço-alvo|preco-alvo)\b|preço justo|\bjusto\b|margem de segurança/i

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

test('a allowlist é a lista fixa do Search Console, com casamento sem caixa', () => {
  assert.deepEqual([...PRECO_TETO_INDEXAVEIS], ALLOW)
  assert.equal(new Set(ALLOW).size, 37)
  assert.equal(precoTetoIndexavel('petr4'), true)
  assert.equal(precoTetoIndexavel('Petr4'), true)
  assert.equal(precoTetoIndexavel(' PETR4 '), true)
  assert.equal(precoTetoIndexavel('hglg11'), false)
  assert.equal(precoTetoIndexavel('PETR3'), false)
  assert.equal(precoTetoIndexavel('bazin'), false)
})

test('ticker da allowlist é indexável; HGLG11 e PETR3 seguem noindex', () => {
  assert.equal(robotsDePrecoTeto('PETR4'), undefined)
  assert.equal(robotsDePrecoTeto('petr4'), undefined)
  assert.equal(robotsDePrecoTeto('BBAS3'), undefined)
  assert.equal(robotsDePrecoTeto('HGLG11'), 'noindex, follow')
  assert.equal(robotsDePrecoTeto('hglg11'), 'noindex, follow')
  assert.equal(robotsDePrecoTeto('PETR3'), 'noindex, follow')
  const vue = readFileSync(new URL('../app/components/calc/CalcPrecoTetoTicker.vue', import.meta.url), 'utf8')
  assert.match(vue, /robots:\s*robotsDePrecoTeto\(v\.ticker\)/)
  assert.match(vue, /path:\s*`\/calculadora\/preco-teto\/\$\{v\.ticker\}`/)
  assert.match(vue, /breadcrumbs:\s*\[/)
  assert.match(vue, /name: 'Preço Teto', path: '\/calculadora\/preco-teto'/)
  assert.doesNotMatch(vue, /robots:\s*'noindex, follow'/)
  const config = readFileSync(new URL('../nuxt.config.ts', import.meta.url), 'utf8')
  assert.match(config, /siteUrl: process\.env\.NUXT_PUBLIC_SITE_URL \|\| 'https:\/\/aportou\.com\.br'/)
})

test('o sitemap de preço teto traz a allowlist e deixa HGLG11 e PETR3 de fora', () => {
  const pages = paginasPrecoTetoIndexaveis()
  const tickers = pages.map((p) => p.path.split('/').pop())
  assert.deepEqual([...tickers].sort(), [...ALLOW].sort())
  assert.equal(pages.length, 37)
  assert.ok(pages.some((p) => p.path === '/calculadora/preco-teto/PETR4'))
  assert.equal(pages.some((p) => p.path === '/calculadora/preco-teto/HGLG11'), false)
  assert.equal(pages.some((p) => p.path === '/calculadora/preco-teto/PETR3'), false)
  for (const page of pages) {
    assert.match(page.path, /^\/calculadora\/preco-teto\/[A-Z][A-Z0-9]{3,5}$/)
    const ticker = page.path.split('/').pop()!
    assert.equal(ticker, ticker.toUpperCase())
  }
  const xml = semPrecoTetoPorTicker(urlsetXml('https://aportou.com.br', [
    ...pages,
    { path: '/calculadora/preco-teto/HGLG11', title: 'HGLG11' },
    { path: '/calculadora/preco-teto/PETR3', title: 'PETR3' },
    { path: '/calculadora/preco-teto/bazin', title: 'Bazin' },
  ]))
  assert.match(xml, /\/calculadora\/preco-teto\/PETR4</)
  assert.match(xml, /\/calculadora\/preco-teto\/bazin</)
  assert.doesNotMatch(xml, /HGLG11|PETR3/)
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
  assert.deepEqual([...tickers].sort(), [...ALLOW].sort())
  assert.equal(servido.includes('HGLG11'), false)
  assert.equal(servido.includes('PETR3'), false)
  assert.equal(cru.xml.includes('HGLG11'), false)
  assert.equal(cru.xml.includes('PETR3'), false)
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
  assert.equal(grupo.length, 37)
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

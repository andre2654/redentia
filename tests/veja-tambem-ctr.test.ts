/**
 * Linkagem interna e trilha das páginas do ctr-top20.
 * O bloco "Veja também" aponta para /dividendos dos papéis de maior liquidez
 * já usados no site, para a agenda e para os hubs. O BreadcrumbList e a
 * trilha visível usam a mesma lista.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { breadcrumbJsonLd } from '../app/utils/json-ld.ts'
import { relacionadosComProventos } from '../app/utils/proventosLinks.ts'
import { linksVejaTambem, trilhaAtivo } from '../app/utils/vejaTambemCtr.ts'
import { PRECO_TETO_FICHA } from '../server/data/preco-teto-lotes.ts'

const ler = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

const PROIBIDO = /\b(compre|comprar|venda|vender|recomend|melhor|melhores|oportunidade)\b/i

function tickersDe(links: { href: string }[]): string[] {
  return links
    .map((l) => l.href)
    .filter((h) => /^\/dividendos\/[A-Z0-9]+$/.test(h))
    .map((h) => h.slice('/dividendos/'.length))
}

test('os dividendos do bloco são os de maior volume em PRECO_TETO_FICHA, com âncora descritiva', () => {
  const links = linksVejaTambem({ pagina: 'juros' })
  assert.deepEqual(tickersDe(links), ['VALE3', 'EMBJ3', 'PETR4', 'ITUB4'])
  assert.deepEqual(
    links.filter((l) => l.href.startsWith('/dividendos/')).map((l) => l.label),
    ['Dividendos de VALE3', 'Dividendos de EMBJ3', 'Dividendos de PETR4', 'Dividendos de ITUB4', 'Agenda de dividendos'],
  )
  assert.ok(links.some((l) => l.href === '/fiis' && l.label === 'Fundos imobiliários'))
  assert.ok(links.some((l) => l.href === '/rankings' && l.label === 'Rankings da B3'))
  for (const l of links) assert.doesNotMatch(l.label, PROIBIDO, l.label)
})

test('no papel, o bloco prefere o mesmo setor e não repete o próprio /dividendos', () => {
  const bancos = linksVejaTambem({ pagina: 'asset', ticker: 'itub4', proprioJaLinkado: true })
  const tickers = tickersDe(bancos)
  assert.equal(tickers.includes('ITUB4'), false)
  assert.ok(tickers.length >= 2)
  for (const t of tickers) assert.equal(PRECO_TETO_FICHA[t]?.setor, 'Financial Services', t)
  assert.equal(bancos.some((l) => l.href === '/dividendos/agenda'), true)

  const dividendos = linksVejaTambem({ pagina: 'dividendos', ticker: 'PETR4', proprioJaLinkado: true })
  assert.equal(dividendos.some((l) => l.href === '/dividendos/PETR4'), false)
  // PETR4 é o único de Energy na lista já usada: sem dois pares, caem os mais líquidos.
  assert.deepEqual(tickersDe(dividendos), ['VALE3', 'EMBJ3', 'ITUB4', 'WEGE3'])
})

test('/quanto-rende inclui o /dividendos do mesmo ticker; /asset só quando a página ainda não linka', () => {
  const rende = linksVejaTambem({ pagina: 'quanto-rende', ticker: 'PETR4' })
  assert.equal(rende[0]?.href, '/dividendos/PETR4')
  assert.equal(rende[0]?.label, 'Dividendos de PETR4')

  const sem = linksVejaTambem({ pagina: 'asset', ticker: 'PETR4', proprioJaLinkado: true })
  assert.equal(sem.some((l) => l.href === '/dividendos/PETR4'), false)
  const com = relacionadosComProventos(sem, { dividendos: '/dividendos/PETR4', quantoRende: '/quanto-rende/PETR4' }, 'PETR4')
  assert.equal(com.filter((l) => l.href === '/dividendos/PETR4').length, 1)
  assert.ok(com.some((l) => l.href === '/fiis'))
})

test('BreadcrumbList de /asset usa a mesma trilha visível', () => {
  const crumbs = trilhaAtivo('petr4')
  assert.deepEqual(crumbs, [
    { name: 'Início', path: '/' },
    { name: 'PETR4', path: '/asset/PETR4' },
  ])
  const ld = breadcrumbJsonLd('https://aportou.com.br', crumbs)
  assert.equal(ld['@type'], 'BreadcrumbList')
  assert.deepEqual(ld.itemListElement.map((i) => i.name), ['Início', 'PETR4'])
  assert.deepEqual(ld.itemListElement.map((i) => i.item), [
    'https://aportou.com.br/',
    'https://aportou.com.br/asset/PETR4',
  ])
})

const COM_TRILHA_E_BLOCO: Array<[string, string, string?]> = [
  ['app/pages/calculadora/juros-compostos/index.vue', 'juros', 'Calculadora de juros compostos com aporte mensal'],
  ['app/pages/calculadora/acoes.vue', 'acoes', 'Simulador de ações com dividendos reinvestidos'],
  ['app/pages/calculadora/dividend-yield.vue', 'dy', 'Calculadora de Dividend Yield 2026 - Grátis'],
  ['app/pages/calculadora/imposto-renda.vue', 'ir', 'IR swing trade e day trade: calcule o DARF 2026'],
  ['app/pages/calculadora/quanto-investir/index.vue', 'quanto-investir', 'Quanto investir por mês para sua meta'],
  ['app/pages/calculadora/juros-compostos/[scenario].vue', 'juros'],
  ['app/pages/calculadora/preco-teto/index.vue', 'preco-teto', 'Calculadora de Preço Teto 2026 - Grátis'],
  ['app/components/calc/CalcPrecoTetoTicker.vue', 'preco-teto-ticker'],
  ['app/pages/quanto-rende/tesouro/[slug].vue', 'tesouro'],
  ['app/pages/quanto-rende/[ticker].vue', 'quanto-rende'],
  ['app/pages/dividendos/[ticker].vue', 'dividendos'],
]

test('cada rota do ctr-top20 tem o bloco, a trilha visível e o BreadcrumbList, sem trocar title', () => {
  for (const [arquivo, pagina, title] of COM_TRILHA_E_BLOCO) {
    const vue = ler(arquivo)
    assert.match(vue, new RegExp(`pagina: '${pagina}'`), arquivo)
    assert.match(vue, /breadcrumbs:\s*trilha\b/, arquivo)
    assert.match(vue, /NuTrilha|:trilha="trilha"|#trilha/, arquivo)
    assert.match(vue, /NuVejaTambem/, arquivo)
    if (title) assert.match(vue, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), arquivo)
  }

  const asset = ler('app/pages/asset/[ticker].vue')
  assert.match(asset, /pagina: 'asset'/)
  assert.match(asset, /breadcrumbs: trilhaAtivo\(ticker\)/)
  assert.match(asset, /title: acao\.value\.resumo\?\.title \|\| acao\.value\.seo\.title/)
  assert.match(asset, /relacionadosComProventos\(/)
  assert.match(ler('app/components/ativo/topo/TopoBolsa.vue'), /trilhaAtivo\(t\)/)

  const rende = ler('app/pages/quanto-rende/[ticker].vue')
  assert.match(rende, /to="`\/dividendos\/\$\{ticker\}`"/)
  const div = ler('app/pages/dividendos/[ticker].vue')
  assert.match(div, /title: div\.value\.seo\.title/)
  assert.match(div, /to="\/dividendos\/agenda"/)
})

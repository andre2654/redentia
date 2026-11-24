/**
 * /jcp: a alíquota é a de /quanto-rende, o title cabe no SERP, a lista de
 * empresas só sai de aviso com data, e a URL entra no sitemap e num hub.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { JCP_DESCRIPTION, JCP_FAQ, JCP_PATH, JCP_TITLE, REGRA_QUANTO_RENDE } from '../app/content/jcp.ts'
import { TEXTO_ALIQUOTA_JCP } from '../app/utils/dividendosBlocos.ts'
import type { ItemBruto } from '../app/utils/agendaDividendos.ts'
import { pagadoresDeJcp } from '../app/utils/jcpPagadores.ts'
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO } from '../app/utils/serp.ts'
import { paginasDoGrupo } from '../server/utils/sitemap-xml.ts'

function ler(caminho: string): string {
  return readFileSync(new URL(`../${caminho}`, import.meta.url), 'utf8')
}

function compacta(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

function item(over: Partial<ItemBruto>): ItemBruto {
  return {
    ticker: 'ITUB4',
    name: 'ITAUUNIBANCO',
    type: 'STOCK',
    label: 'JCP',
    rate: 0.2,
    payment_date: '2026-12-15',
    last_date_prior: '2026-11-30',
    ...over,
  }
}

test('title e description cabem no SERP', () => {
  assert.ok(JCP_TITLE.length + SUFIXO_MARCA.length <= TETO_TITULO, `${JCP_TITLE.length + SUFIXO_MARCA.length}`)
  assert.ok(JCP_DESCRIPTION.length >= 120 && JCP_DESCRIPTION.length <= TETO_DESCRICAO, String(JCP_DESCRIPTION.length))
  assert.equal(JCP_PATH, '/jcp')
})

test('a alíquota é a redação de /quanto-rende, sem outra taxa de JCP', () => {
  const quanto = compacta(ler('app/pages/quanto-rende/[ticker].vue'))
  assert.ok(quanto.includes(REGRA_QUANTO_RENDE))
  const pagina = ler('app/pages/jcp.vue') + ler('app/content/jcp.ts')
  assert.match(pagina, new RegExp(TEXTO_ALIQUOTA_JCP.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  assert.match(pagina, /art\. 8º da Lei Complementar 224\/2025/)
  assert.match(pagina, /1º de janeiro de 2026/)
  assert.match(pagina, /lcp224\.htm/)
  assert.doesNotMatch(pagina, /15%/)
  assert.equal((pagina.match(/17,5%/g) ?? []).length > 0, true)
})

test('SEO da página: canonical, BreadcrumbList e FAQPage', () => {
  const pagina = ler('app/pages/jcp.vue')
  assert.match(pagina, /path: JCP_PATH/)
  assert.match(pagina, /breadcrumbs:/)
  assert.match(pagina, /NuFaqAccordion/)
  assert.match(pagina, /@type': 'Article'/)
  assert.equal(JCP_FAQ.length >= 4, true)
  assert.ok(JCP_FAQ.some((f) => f.link?.to === '/calculadora/imposto-renda'))
  assert.ok(JCP_FAQ.every((f) => !f.link || f.a.includes(f.link.texto)))
})

test('sitemap, cache, llms e link a partir do hub de dividendos', () => {
  const miolo = ler('server/utils/site-pages.ts')
  const core = miolo.slice(miolo.indexOf('const CORE_PAGES'), miolo.indexOf('const INSTITUCIONAL_PAGES'))
  assert.match(core, /path: '\/jcp'/)
  const pages = paginasDoGrupo([
    { id: 'core', title: 'Páginas', pages: [{ path: '/jcp', title: JCP_TITLE }] },
    { id: 'institucional', title: 'Institucional', pages: [] },
  ], 'paginas')
  assert.equal(pages.some((p) => p.path === '/jcp'), true)
  assert.match(ler('server/data/sitemap-semente.ts'), /\/jcp</)
  assert.match(ler('server/middleware/cache-sessao.ts'), /'\/jcp':/)
  assert.match(ler('server/routes/llms.txt.ts'), /\/jcp\)/)
  assert.match(ler('app/pages/dividendos/agenda/index.vue'), /to="\/jcp"/)
  assert.match(ler('app/content/rankings/copy/maiores-dividend-yield.ts'), /href: '\/jcp'/)
  assert.match(ler('app/content/glossario/grupo-2.ts'), /href="\/jcp"/)
})

test('pagadores de JCP só saem de aviso existente, com data, sem valor', () => {
  const hoje = '2026-11-24'
  const lista = pagadoresDeJcp([
    item({ ticker: 'petr4', name: 'PETROBRAS', payment_date: '2026-12-15', last_date_prior: '2026-11-30' }),
    item({ ticker: 'PETR4', payment_date: '2025-01-10', last_date_prior: '2024-12-20' }),
    item({ ticker: 'MXRF11', type: 'REIT', label: 'JCP' }),
    item({ ticker: 'AAPL34', type: 'BDR', label: 'JCP' }),
    item({ ticker: 'VALE3', label: 'Dividendo', payment_date: '2026-12-01' }),
    item({ ticker: 'BBDC4', label: 'Juros sobre capital próprio', payment_date: '2026-11-20', last_date_prior: null, rate: 0.015 }),
    item({ ticker: 'WEGE3', label: 'JCP', payment_date: 'sem-data' as unknown as string }),
    item({ ticker: 'ITSA4', label: 'JCP', rate: 0, payment_date: '2026-12-01' }),
  ], hoje)
  assert.deepEqual(lista.map((p) => p.ticker), ['BBDC4', 'PETR4'])
  const petr = lista.find((p) => p.ticker === 'PETR4')!
  assert.equal(petr.href, '/dividendos/PETR4')
  assert.equal(petr.pagamento, '2026-12-15')
  assert.match(petr.pagamentoTexto, /15 dez 2026/)
  assert.equal(petr.dataCom, '2026-11-30')
  assert.equal('rate' in petr, false)
  assert.doesNotMatch(JSON.stringify(lista), /0\.2|0\.015/)
  const bb = lista.find((p) => p.ticker === 'BBDC4')!
  assert.equal(bb.dataCom, null)
  assert.equal(bb.dataExTexto, 'Não informada')
})

test('a página não recomenda compra, venda nem retorno', () => {
  const texto = ler('app/pages/jcp.vue') + ler('app/content/jcp.ts')
  const semAviso = texto.replace(/Não é recomendação de compra ou venda[^.]*\./g, '')
  assert.doesNotMatch(semAviso, /\b(compre|comprar|venda|vender|garantid\w*|rentabilidade)\b/i)
  assert.match(texto, /Não é recomendação de compra ou venda/)
  assert.doesNotMatch(texto, /font-family/)
})

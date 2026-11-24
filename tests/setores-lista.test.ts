/**
 * /setores: segmentos do cadastro (industry_category) com pelo menos cinco
 * empresas. Saneamento fica de fora (três empresas na leitura de 17/11/2026).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PRECO_TETO_FICHA } from '../server/data/preco-teto-lotes.ts'
import {
  SETORES_LISTA,
  SETORES_LISTA_DATA,
  SETORES_LISTA_MIN,
  descricaoHubSetores,
  descricaoSetorLista,
  hrefSetorDoSegmento,
  leituraDatada,
  linkOutrasEmpresasDoSetor,
  paginasSitemapSetoresLista,
  textoSetorLista,
  tituloSetorLista,
  TITULO_HUB_SETORES,
} from '../app/utils/setoresLista.ts'
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO } from '../app/utils/serp.ts'

const PROIBIDO = /\bmelhores\b|recomendamos|garantimos|retorno garantido|vale a pena|promessa de retorno/i

function ler(caminho: string): string {
  return readFileSync(new URL(`../${caminho}`, import.meta.url), 'utf8')
}

test('bancos e energia elétrica entram; saneamento não chega a cinco empresas', () => {
  const slugs = SETORES_LISTA.map((s) => s.slug)
  assert.ok(slugs.includes('bancos'))
  assert.ok(slugs.includes('energia-eletrica'))
  assert.equal(slugs.includes('saneamento'), false)
  assert.equal(hrefSetorDoSegmento('Utilities - Regulated Water'), null)
  assert.equal(hrefSetorDoSegmento('Banks - Regional'), '/setores/bancos')
  assert.equal(hrefSetorDoSegmento('Utilities - Regulated Electric'), '/setores/energia-eletrica')
  const agua = Object.values(PRECO_TETO_FICHA).filter((f) => f.segmento === 'Utilities - Regulated Water')
  const empresas = new Set(Object.entries(PRECO_TETO_FICHA).filter(([, f]) => f.segmento === 'Utilities - Regulated Water').map(([t]) => t.slice(0, 4)))
  assert.ok(agua.length > 0)
  assert.ok(empresas.size < SETORES_LISTA_MIN)
})

test('cada página tem pelo menos cinco empresas e uma classe por raiz', () => {
  const raizes = new Set<string>()
  for (const s of SETORES_LISTA) {
    assert.ok(s.empresas.length >= SETORES_LISTA_MIN, s.slug)
    const vistas = new Set<string>()
    for (const e of s.empresas) {
      const raiz = e.ticker.slice(0, 4)
      assert.equal(vistas.has(raiz), false, `${s.slug} ${e.ticker}`)
      assert.equal(raizes.has(raiz), false, e.ticker)
      vistas.add(raiz)
      raizes.add(raiz)
      assert.equal(PRECO_TETO_FICHA[e.ticker]?.segmento, s.segmento)
    }
    const ordenados = [...s.empresas].sort((a, b) => a.ticker.localeCompare(b.ticker))
    assert.deepEqual(s.empresas.map((e) => e.ticker), ordenados.map((e) => e.ticker))
  }
  const bancos = SETORES_LISTA.find((s) => s.slug === 'bancos')!
  assert.ok(bancos.empresas.some((e) => e.ticker === 'ITUB4'))
  assert.equal(bancos.empresas.some((e) => e.ticker === 'ITUB3'), false)
  assert.ok(bancos.empresas.some((e) => e.ticker === 'BBDC4'))
  assert.equal(bancos.empresas.some((e) => e.ticker === 'BBDC3'), false)
  const luz = SETORES_LISTA.find((s) => s.slug === 'energia-eletrica')!
  assert.ok(luz.empresas.some((e) => e.ticker === 'TAEE11'))
  assert.equal(luz.empresas.some((e) => e.ticker === 'TAEE3' || e.ticker === 'TAEE4'), false)
})

test('title, description, data e texto neutro', () => {
  assert.ok(TITULO_HUB_SETORES.length + SUFIXO_MARCA.length <= TETO_TITULO)
  const hub = descricaoHubSetores()
  assert.ok(hub.length >= 120 && hub.length <= TETO_DESCRICAO, String(hub.length))
  assert.match(hub, new RegExp(SETORES_LISTA_DATA.slice(8) + '/11/2026'))
  assert.doesNotMatch(hub, PROIBIDO)
  for (const s of SETORES_LISTA) {
    const title = tituloSetorLista(s.nome) + SUFIXO_MARCA
    assert.ok(title.length <= TETO_TITULO, `${s.slug} ${title.length} ${title}`)
    const desc = descricaoSetorLista(s.nome, s.empresas.length)
    assert.ok(desc.length >= 120 && desc.length <= TETO_DESCRICAO, `${s.slug} ${desc.length}`)
    assert.match(desc, /17\/11\/2026/)
    assert.match(desc, /Não é recomendação/)
    assert.doesNotMatch(`${title} ${desc} ${textoSetorLista(s)}`, PROIBIDO)
  }
})

test('cotação e DY sem data não viram número', () => {
  assert.equal(leituraDatada(14.2, '2026-11-23')?.valor, 14.2)
  assert.equal(leituraDatada(4.86, null), null)
  assert.equal(leituraDatada(4.86, ''), null)
  assert.equal(leituraDatada(null, '2026-11-24'), null)
  assert.equal(leituraDatada(Number.NaN, '2026-11-24'), null)
})

test('o /asset aponta outras empresas do setor quando a página existe', () => {
  assert.deepEqual(linkOutrasEmpresasDoSetor('Banks - Regional'), {
    href: '/setores/bancos',
    label: 'Outras empresas do setor',
  })
  assert.equal(linkOutrasEmpresasDoSetor('Oil & Gas Integrated'), null)
  assert.equal(linkOutrasEmpresasDoSetor(null), null)
  const acao = ler('app/composables/useAcao.ts')
  assert.match(acao, /linkOutrasEmpresasDoSetor\(industry\)/)
  assert.match(acao, /profile\.industry_category/)
})

test('sitemap, canonical e a página não publicam recomendação', () => {
  const paginas = paginasSitemapSetoresLista()
  assert.ok(paginas.some((p) => p.path === '/setores'))
  assert.ok(paginas.some((p) => p.path === '/setores/bancos'))
  assert.ok(paginas.every((p) => p.lastmod === SETORES_LISTA_DATA))
  assert.match(ler('server/utils/site-pages.ts'), /paginasSitemapSetoresLista\(\)/)
  assert.match(ler('server/middleware/cache-sessao.ts'), /'\/setores'/)
  const hub = ler('app/pages/setores/index.vue')
  const detalhe = ler('app/pages/setores/[slug].vue')
  for (const src of [hub, detalhe]) {
    assert.match(src, /usePageSeo\(/)
    assert.match(src, /breadcrumbs:/)
    assert.match(src, /'@type': 'ItemList'/)
    assert.doesNotMatch(src, PROIBIDO)
  }
  assert.match(hub, /path: '\/setores'/)
  assert.match(detalhe, /path: `\/setores\/\$\{entry\.slug\}`/)
  assert.match(detalhe, /\/asset\/\$\{l\.ticker\}/)
  assert.match(detalhe, /\/dividendos\/\$\{l\.ticker\}/)
  assert.match(detalhe, /\/quanto-rende\/\$\{l\.ticker\}/)
  assert.match(detalhe, /leituraDatada\(/)
  assert.match(ler('app/pages/setor/index.vue'), /to="\/setores"/)
})

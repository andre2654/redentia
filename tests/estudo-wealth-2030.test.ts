/**
 * /estudo/wealth-2030. O texto sai do módulo do estudo. A página renderiza
 * esse módulo, o JSON-LD é um Report, o sitemap de páginas inclui a URL e o
 * PDF em public/ resolve no link.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse, compileTemplate } from '@vue/compiler-sfc'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO } from '../app/utils/serp.ts'
import {
  WEALTH_2030,
  WEALTH_2030_PAGINA,
  WEALTH_DATE_PUBLISHED,
  WEALTH_DESCRIPTION,
  WEALTH_ORG_ID,
  WEALTH_PAGE_PATH,
  WEALTH_PDF_PATH,
  citacoesDoEstudo,
  itensDeLista,
  notasDoEstudo,
  numerosDoEstudo,
  paragrafosDoEstudo,
  relatorioJsonLd,
} from '../app/content/estudo/wealth-2030.ts'
import { SITEMAP_GRUPOS, paginasDoGrupo, urlsetXml } from '../server/utils/sitemap-xml.ts'

const root = new URL('..', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root), 'utf8')

const ORIGEM = 'https://www.redentia.com.br'

function comoHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
}

async function htmlDaPagina(): Promise<string> {
  const src = read('app/pages/estudo/wealth-2030.vue')
  const { descriptor, errors } = parse(src)
  assert.equal(errors.length, 0)
  const compiled = compileTemplate({
    source: descriptor.template!.content,
    filename: 'wealth-2030.vue',
    id: 'estudo-wealth-2030',
  })
  assert.equal(compiled.errors.length, 0)
  const vueEntry = new URL('./node_modules/vue/index.js', root).href
  const dir = mkdtempSync(join(tmpdir(), 'wealth-2030-'))
  const file = join(dir, 'render.mjs')
  writeFileSync(file, compiled.code.replace('from "vue"', `from "${vueEntry}"`))
  const mod = await import(pathToFileURL(file).href) as { render: () => unknown }
  const doc = WEALTH_2030
  const Hero = {
    props: ['title', 'dek', 'metaLine', 'author', 'breadcrumbs'],
    setup(props: { title: string; dek: string; metaLine: string }) {
      return () => h('header', [
        h('h1', props.title),
        h('p', { class: 'dek' }, props.dek),
        h('p', { class: 'meta' }, props.metaLine),
      ])
    },
  }
  const Toc = {
    props: ['items', 'label'],
    setup(props: { items: { label: string; targetId: string }[] }) {
      return () => h('nav', (props.items ?? []).map((item) => h('a', { href: `#${item.targetId}` }, item.label)))
    },
  }
  const app = createSSRApp({
    components: { NuArticleHero: Hero, NuTocSidebar: Toc },
    setup() {
      return {
        doc,
        tocItems: doc.secoes.map((secao) => ({ label: secao.toc, targetId: secao.id })),
        noCorpo: doc.secoes.filter((secao) => secao.id !== 'fechamento'),
        fechamento: doc.secoes.find((secao) => secao.id === 'fechamento'),
        blocos: (secao: { blocos: unknown[] }) => secao.blocos,
        paragrafos: (bloco: { tipo: string; paragrafos?: string[] }) => (bloco.tipo === 'p' ? bloco.paragrafos ?? [] : []),
      }
    },
    render: mod.render,
  })
  return renderToString(app)
}

test('a página renderiza o estudo, o aviso e os dois links do PDF', async () => {
  const html = await htmlDaPagina()
  assert.match(html, /<h1[^>]*>WEALTH 2030<\/h1>/)
  assert.match(html, /O futuro das assessorias, family offices e gestão de patrimônio no Brasil\./)
  assert.match(html, /Não é recomendação de investimento/)
  assert.equal((html.match(/href="\/estudo\/wealth-2030\.pdf"/g) ?? []).length, 2)
  assert.match(html, /Baixar o PDF do estudo/)
  assert.doesNotMatch(html, /páginas|numberOfPages/i)
  for (const secao of WEALTH_2030.secoes) {
    assert.match(html, new RegExp(`id="${secao.id}"`))
    assert.match(html, new RegExp(secao.titulo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
  for (const item of numerosDoEstudo()) {
    assert.ok(html.includes(item.valor), item.valor)
    const fonteHtml = comoHtml(item.fonte)
    assert.ok(html.includes(fonteHtml), item.fonte.slice(0, 48))
    assert.ok(html.includes(`Fonte: ${fonteHtml}`), item.valor)
  }
  for (const nota of notasDoEstudo()) {
    assert.ok(html.includes(comoHtml(nota.texto).slice(0, 40)), nota.fonte)
    assert.ok(html.includes(`Fonte: ${comoHtml(nota.fonte)}`))
  }
  for (const citacao of citacoesDoEstudo()) {
    assert.ok(html.includes(comoHtml(citacao.texto)), citacao.texto.slice(0, 48))
    assert.ok(html.includes(comoHtml(citacao.atribuicao)), citacao.atribuicao.slice(0, 48))
  }
})

test('o JSON-LD é um Report com o arquivo, sem contagem de folhas', () => {
  const ld = relatorioJsonLd(ORIGEM)
  const json = JSON.stringify(ld)
  const deNovo = JSON.parse(json) as typeof ld
  assert.equal(deNovo['@type'], 'Report')
  assert.equal(deNovo.name, 'WEALTH 2030')
  assert.equal(deNovo.description, WEALTH_DESCRIPTION)
  assert.equal(deNovo.url, `${ORIGEM}${WEALTH_PAGE_PATH}`)
  assert.equal(deNovo.inLanguage, 'pt-BR')
  assert.equal(deNovo.datePublished, WEALTH_DATE_PUBLISHED)
  assert.equal((deNovo.author as { '@id': string })['@id'], WEALTH_ORG_ID)
  assert.equal((deNovo.publisher as { '@id': string })['@id'], WEALTH_ORG_ID)
  assert.equal(WEALTH_ORG_ID, 'https://www.redentia.com.br/#organization')
  const media = deNovo.associatedMedia as { '@type': string; contentUrl: string; encodingFormat: string }
  assert.equal(media['@type'], 'MediaObject')
  assert.equal(media.contentUrl, `${ORIGEM}${WEALTH_PDF_PATH}`)
  assert.equal(media.encodingFormat, 'application/pdf')
  const encoding = deNovo.encoding as { '@type': string; contentUrl: string; encodingFormat: string }
  assert.equal(encoding['@type'], 'MediaObject')
  assert.equal(encoding.contentUrl, media.contentUrl)
  assert.equal(encoding.encodingFormat, 'application/pdf')
  assert.equal('numberOfPages' in deNovo, false)
  assert.doesNotMatch(json, /páginas|numberOfPages/i)
  assert.equal((deNovo.description as string).match(/\d/), null)

  const pagina = read('app/pages/estudo/wealth-2030.vue')
  assert.match(pagina, /relatorioJsonLd\(origin\)/)
  assert.match(pagina, /usePageSeo\(/)
  assert.match(pagina, /path: doc\.path/)
  assert.match(read('app/app.vue'), /'@id': `\$\{site\}\/#organization`/)
})

test('o sitemap de páginas inclui a URL e o llms aponta o estudo', () => {
  assert.ok(SITEMAP_GRUPOS.paginas.includes('core'))
  const src = read('server/utils/site-pages.ts')
  const miolo = src.slice(src.indexOf('const CORE_PAGES'), src.indexOf('const INSTITUCIONAL_PAGES'))
  assert.match(src, /WEALTH_2030_PAGINA/)
  assert.match(miolo, /WEALTH_2030_PAGINA/)
  assert.equal(WEALTH_2030_PAGINA.path, WEALTH_PAGE_PATH)
  assert.equal(WEALTH_2030_PAGINA.lastmod, WEALTH_DATE_PUBLISHED)
  assert.equal(WEALTH_2030_PAGINA.description, WEALTH_DESCRIPTION)

  const pages = paginasDoGrupo([
    { id: 'core', title: 'Páginas principais', pages: [WEALTH_2030_PAGINA] },
    { id: 'institucional', title: 'Institucional', pages: [] },
  ], 'paginas')
  assert.equal(pages.some((page) => page.path === '/estudo/wealth-2030'), true)
  const xml = urlsetXml(ORIGEM, pages)
  assert.match(xml, /<loc>https:\/\/www\.redentia\.com\.br\/estudo\/wealth-2030<\/loc><lastmod>2026-08-13<\/lastmod>/)

  const llms = read('server/routes/llms.txt.ts')
  assert.match(llms, /\/estudo\/wealth-2030\)/)
  assert.match(llms, /\/estudo\/wealth-2030\.pdf/)
  assert.match(llms, /Não é recomendação de investimento/)
  assert.match(read('server/routes/llms-full.txt.ts'), /getSiteSections/)
  assert.match(read('server/middleware/cache-sessao.ts'), /'\/estudo\/wealth-2030': DIA/)
})

test('o link do PDF resolve para o arquivo publicado', () => {
  const arquivo = readFileSync(new URL('../public/estudo/wealth-2030.pdf', import.meta.url))
  assert.equal(arquivo.subarray(0, 5).toString('utf8'), '%PDF-')
  assert.ok(arquivo.length > 100_000, String(arquivo.length))
  assert.equal(WEALTH_PDF_PATH, '/estudo/wealth-2030.pdf')
  const pagina = read('app/pages/estudo/wealth-2030.vue')
  assert.match(pagina, /:href="doc\.pdfPath"/)
  assert.equal((pagina.match(/:href="doc\.pdfPath"/g) ?? []).length, 2)
})

test('cada número tem a fonte do estudo, e o resto do texto não inventa cifra', () => {
  const numeros = numerosDoEstudo()
  assert.ok(numeros.length >= 40)
  for (const item of numeros) {
    assert.match(item.valor, /\d/, item.valor)
    assert.ok(item.rotulo.length > 8, item.valor)
    assert.ok(item.fonte.length > 8, item.valor)
    assert.ok(item.secao.length > 3, item.valor)
    assert.ok(item.direcao === 'alta' || item.direcao === 'baixa' || item.direcao === 'nivel', item.valor)
  }
  for (const paragrafo of paragrafosDoEstudo()) assert.equal(paragrafo.match(/\d/), null, paragrafo.slice(0, 80))
  for (const item of itensDeLista()) assert.equal(item.match(/\d/), null, item.slice(0, 80))
  for (const secao of WEALTH_2030.secoes) {
    assert.equal(secao.kicker.match(/\d/), null, secao.kicker)
    assert.equal(secao.toc.match(/\d/), null, secao.toc)
    if (secao.titulo.match(/\d/)) assert.ok(secao.tituloFonte && secao.tituloFonte.length > 8, secao.titulo)
  }
  for (const nota of notasDoEstudo()) {
    assert.ok(nota.fonte.length > 8)
    if (nota.texto.match(/\d/)) assert.ok(nota.fonte)
  }
  for (const citacao of citacoesDoEstudo()) assert.ok(citacao.atribuicao.length > 12, citacao.texto.slice(0, 40))
  assert.match(WEALTH_2030.metaLinha, /Fonte:/)
  assert.equal(WEALTH_2030.titleSeo.replace('2030', '').match(/\d/), null)
  assert.equal(WEALTH_DESCRIPTION.match(/\d/), null)
  assert.ok(WEALTH_2030.titleSeo.length + SUFIXO_MARCA.length <= TETO_TITULO)
  assert.ok(WEALTH_DESCRIPTION.length <= TETO_DESCRICAO, String(WEALTH_DESCRIPTION.length))
  assert.match(WEALTH_DESCRIPTION, /Não é recomendação de investimento/)

  const tudo = JSON.stringify(WEALTH_2030)
  assert.doesNotMatch(tudo, /páginas|numberOfPages|nossos clientes|cliente da Redentia/i)
  assert.doesNotMatch(tudo, /recomendamos (comprar|vender|alocar)|você deveria comprar/i)
  assert.match(tudo, /Gente perde quinze dias por mês\. Poderia estar perdendo cinco\./)
  assert.match(tudo, /em termos de consolidação, o resultado de todas as soluções é o mesmo\./)
  for (const id of ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10']) {
    assert.ok(WEALTH_2030.secoes.some((secao) => secao.id === `tese-${id}`), id)
  }
})

test('verde e vermelho só marcam alta e queda', () => {
  const css = read('app/pages/estudo/wealth-2030.vue').slice(read('app/pages/estudo/wealth-2030.vue').indexOf('<style'))
  assert.match(css, /#f5f1ea/)
  assert.match(css, /#2f6aff/)
  assert.match(css, /#0c1524/)
  assert.match(css, /font-family:\s*var\(--nu-font\)/)
  assert.match(css, /\.w30-num--alta[^{]*\{[^}]*#148f4e/)
  assert.match(css, /\.w30-num--baixa[^{]*\{[^}]*#d6323b/)
  assert.equal((css.match(/#148f4e/g) ?? []).length, 1)
  assert.equal((css.match(/#d6323b/g) ?? []).length, 1)
})

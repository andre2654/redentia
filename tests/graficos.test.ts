/**
 * /graficos: a conta do CDI líquido, a semana de proventos, o recorte de FIIs,
 * o embed com crédito, o JSON-LD e o PNG. Lê o fonte das rotas para travar
 * cache, sitemap e a ausência de cookie no bitmap.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { SUFIXO_MARCA, TETO_DESCRICAO, TETO_TITULO } from '../app/utils/serp.ts'
import { SITEMAP_GRUPOS, paginasDoGrupo } from '../server/utils/sitemap-xml.ts'
import {
  AVISO,
  CITACAO_CDI,
  GRAFICOS_DESCRICAO,
  GRAFICOS_PAGINA,
  GRAFICOS_TITULO,
  anualizarCdiDiario,
  codigoEmbed,
  datasetsJsonLd,
  graficoCdi,
  graficoFiis,
  graficoProventos,
  leituraCdi,
  pareceFii,
  semanaCivil,
} from '../app/utils/graficos.ts'
import { svgDoGrafico } from '../app/utils/graficos-svg.ts'
import { pngDoGrafico } from '../server/utils/graficos-png.ts'

const require = createRequire(import.meta.url)
const ler = (caminho: string) => readFileSync(new URL(`../${caminho}`, import.meta.url), 'utf8')

const SERIE_4389 = [{ data: '09/11/2026', valor: '13.65' }]
const SERIE_12 = [{ data: '09/11/2026', valor: '0.050788' }]

test('o CDI líquido aplica a tabela regressiva sobre a série 4389', () => {
  const leitura = leituraCdi(SERIE_4389, SERIE_12)
  assert.equal(leitura?.serie, 4389)
  assert.equal(leitura?.anualPercent, 13.65)
  assert.equal(leitura?.dataIso, '2026-11-09')
  const g = graficoCdi(leitura)
  assert.ok(g)
  assert.deepEqual(g!.barras.map((b) => b.rotulo), [
    'Até 180 dias',
    '181 a 360 dias',
    '361 a 720 dias',
    'Acima de 720 dias',
  ])
  assert.deepEqual(g!.barras.map((b) => b.valorTexto), ['10,58%', '10,92%', '11,26%', '11,60%'])
  assert.ok(g!.fonte.startsWith(CITACAO_CDI))
  assert.match(g!.fonte, /9 nov 2026/)
  assert.equal(g!.dataReferencia, '2026-11-09')
  assert.match(g!.descricao, /Não é recomendação\./)
})

test('sem a série 4389, a série 12 anualiza na base de 252 e chega no mesmo 13,65%', () => {
  assert.equal(anualizarCdiDiario(0.050788), 13.65)
  const leitura = leituraCdi(null, SERIE_12)
  assert.equal(leitura?.serie, 12)
  assert.equal(leitura?.anualPercent, 13.65)
  assert.match(graficoCdi(leitura)!.nota, /Série 12/)
  assert.equal(graficoCdi(leituraCdi([{ data: '09/11/2026', valor: 'nao' }], null)), null)
  assert.equal(anualizarCdiDiario(0), null)
})

test('a semana civil é de segunda a domingo', () => {
  assert.deepEqual(semanaCivil('2026-11-11'), { inicio: '2026-11-09', fim: '2026-11-15' })
  assert.deepEqual(semanaCivil('2026-11-09'), { inicio: '2026-11-09', fim: '2026-11-15' })
  assert.deepEqual(semanaCivil('2026-11-15'), { inicio: '2026-11-09', fim: '2026-11-15' })
  assert.deepEqual(semanaCivil('2026-11-16'), { inicio: '2026-11-16', fim: '2026-11-22' })
})

test('proventos da semana contam renda, pulam amortização e não inventam o dia anterior à agenda', () => {
  const g = graficoProventos({
    hoje: '2026-11-10',
    dias: [
      {
        date: '2026-11-10',
        count: 3,
        items: [
          { label: 'Dividendo', rate: 0.5, payment_date: '2026-11-10' },
          { label: 'Rendimento', rate: 0.1, payment_date: '2026-11-10' },
          { label: 'Amortizacao Rf', rate: 1, payment_date: '2026-11-10' },
        ],
      },
      {
        date: '2026-11-12',
        count: 1,
        items: [{ label: 'JCP', rate: 0.2, payment_date: '2026-11-12' }],
      },
      {
        date: '2026-11-16',
        count: 1,
        items: [{ label: 'Dividendo', rate: 1, payment_date: '2026-11-16' }],
      },
    ],
  })
  assert.ok(g)
  assert.deepEqual(g!.barras.map((b) => [b.rotulo, b.valorTexto]), [
    ['10 nov', '2'],
    ['11 nov', '0'],
    ['12 nov', '1'],
    ['13 nov', '0'],
    ['14 nov', '0'],
    ['15 nov', '0'],
  ])
  assert.equal(g!.barras.some((b) => b.rotulo === '9 nov'), false)
  assert.match(g!.fonte, /Fonte: avisos de proventos da B3/)
  assert.match(g!.fonte, /10 a 15 de novembro de 2026/)
  assert.match(g!.nota, /não a data do anúncio/)
})

test('agenda truncada não vira contagem', () => {
  assert.equal(graficoProventos({
    hoje: '2026-11-10',
    dias: [{ date: '2026-11-10', count: 5, items: [{ label: 'Dividendo', rate: 1, payment_date: '2026-11-10' }] }],
  }), null)
  assert.equal(graficoProventos(null), null)
})

test('FIIs ordenados por DY ficam no fundo imobiliário, com data de pregão e teto de 50%', () => {
  assert.equal(pareceFii('PFIN11', 'FIP PERFIN CI'), false)
  assert.equal(pareceFii('KOPA11', 'FIAGRO KOPA CI'), false)
  assert.equal(pareceFii('HGLG11', 'CSHG LOGISTICA FDO INV IMOB'), true)
  const g = graficoFiis([
    { ticker: 'PFIN11', name: 'FIP PERFIN CI', type: 'REIT', market_price: 10, dividend_yield: 0.4, price_date: '2026-11-10' },
    { ticker: 'KOPA11', name: 'FIAGRO KOPA CI', type: 'REIT', market_price: 10, dividend_yield: 0.45, price_date: '2026-11-10' },
    { ticker: 'ALTO11', name: 'FII ALTO', type: 'REIT', market_price: 10, dividend_yield: 0.6, price_date: '2026-11-10' },
    { ticker: 'SEMD11', name: 'FII SEM DATA', type: 'REIT', market_price: 10, dividend_yield: 0.2, price_date: null },
    { ticker: 'HGLG11', name: 'CSHG LOGISTICA FDO INV IMOB', type: 'REIT', market_price: 160, dividend_yield: 0.089, price_date: '2026-11-10' },
    { ticker: 'MXRF11', name: 'FII MAXI RENDA', type: 'REIT', market_price: 10, dividend_yield: 0.112, price_date: '2026-11-10' },
  ])
  assert.ok(g)
  assert.deepEqual(g!.barras.map((b) => b.rotulo), ['MXRF11', 'HGLG11'])
  assert.equal(g!.barras[0]!.valorTexto, '11,20%')
  assert.equal(g!.titulo, 'FIIs ordenados por DY (12m)')
  assert.doesNotMatch(g!.titulo + g!.descricao + g!.nota, /melhores/i)
  assert.match(g!.fonte, /avisos de proventos da B3 e Brapi \(B3\)/)
  assert.match(g!.fonte, /10 nov 2026/)
  assert.equal(graficoFiis([]), null)
  assert.equal(graficoFiis(null), null)
})

test('o embed é uma imagem e um crédito dofollow para a âncora', () => {
  const g = graficoCdi(leituraCdi(SERIE_4389, null))!
  const codigo = codigoEmbed(g, 640)
  assert.match(codigo, /<img src="https:\/\/www\.redentia\.com\.br\/graficos\/cdi\.png"/)
  assert.match(codigo, /<a href="https:\/\/www\.redentia\.com\.br\/graficos#cdi">Gráfico: Redentia<\/a>/)
  assert.doesNotMatch(codigo, /nofollow|sponsored|ugc/)
})

test('o JSON-LD é um Dataset por gráfico, com crédito e o PNG', () => {
  const g = graficoCdi(leituraCdi(SERIE_4389, null))!
  const [dataset] = datasetsJsonLd('https://www.redentia.com.br/', [g])
  assert.equal(dataset!['@type'], 'Dataset')
  assert.equal(dataset!.name, g.nome)
  const creator = dataset!.creator as { '@type': string, name: string }
  assert.equal(creator['@type'], 'Organization')
  assert.equal(creator.name, 'Redentia')
  assert.equal(dataset!.usageInfo, 'uso livre com crédito')
  assert.equal(dataset!.temporalCoverage, '2026-11-09')
  assert.equal(dataset!.dateModified, '2026-11-09')
  const dist = dataset!.distribution as { contentUrl: string, encodingFormat: string }
  assert.equal(dist.encodingFormat, 'image/png')
  assert.equal(dist.contentUrl, 'https://www.redentia.com.br/graficos/cdi.png')
})

test('o SVG leva marca, fonte, data e o aviso, sem caixas sobrepostas', () => {
  for (const g of [
    graficoCdi(leituraCdi(SERIE_4389, null))!,
    graficoProventos({
      hoje: '2026-11-10',
      dias: [{ date: '2026-11-10', count: 1, items: [{ label: 'Dividendo', rate: 1, payment_date: '2026-11-10' }] }],
    })!,
    graficoFiis([{ ticker: 'HGLG11', name: 'FII HGLG', type: 'REIT', market_price: 160, dividend_yield: 0.09, price_date: '2026-11-10' }])!,
  ]) {
    const { svg } = svgDoGrafico(g)
    assert.match(svg, /redentia\.com\.br/)
    assert.match(svg, /Não é recomendação\./)
    assert.ok(svg.includes(g.fonte.split('. ')[0]!))
    assert.match(svg, new RegExp(g.dataTexto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.match(svg, /#2f6aff/)
    assert.match(svg, /#f5f1ea/)
    assert.match(svg, /#0c1524/)
    assert.doesNotMatch(svg, /#148f4e|#d6323b/i)
  }
})

test('o PNG sai do servidor com a marca em pixels e o cabeçalho de arquivo', async () => {
  const g = graficoCdi(leituraCdi(SERIE_4389, null))!
  const buf = await pngDoGrafico(g)
  assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
  assert.equal(buf.readUInt32BE(16), 1200)
  assert.ok(buf.readUInt32BE(20) > 400)
  const { Resvg } = require('@resvg/resvg-js') as typeof import('@resvg/resvg-js')
  const { svg, width, height } = svgDoGrafico(g)
  const png = new Resvg(svg, {
    font: {
      fontFiles: [`${process.env.TMPDIR || '/tmp'}/redentia-plus-jakarta-sans.ttf`],
      loadSystemFonts: false,
      defaultFontFamily: 'Plus Jakarta Sans',
    },
  }).render()
  assert.equal(png.width, width)
  assert.equal(png.height, height)
  const px = png.pixels
  let navy = 0
  let azul = 0
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i] ?? 0
    const gv = px[i + 1] ?? 0
    const b = px[i + 2] ?? 0
    if (r < 40 && gv < 55 && b < 80) navy++
    if (r > 30 && r < 80 && gv > 80 && gv < 140 && b > 220) azul++
  }
  assert.ok(navy > 800, `pixels navy ${navy}`)
  assert.ok(azul > 1000, `pixels azuis ${azul}`)
})

test('a página entra no sitemap de páginas, no llms e no cache de um dia', () => {
  assert.ok(GRAFICOS_TITULO.length + SUFIXO_MARCA.length <= TETO_TITULO, String(GRAFICOS_TITULO.length + SUFIXO_MARCA.length))
  assert.ok(GRAFICOS_DESCRICAO.length <= TETO_DESCRICAO, String(GRAFICOS_DESCRICAO.length))
  assert.match(GRAFICOS_DESCRICAO, /Não é recomendação\./)

  const src = ler('server/utils/site-pages.ts')
  const miolo = src.slice(src.indexOf('const CORE_PAGES'), src.indexOf('const INSTITUCIONAL_PAGES'))
  assert.match(miolo, /GRAFICOS_PAGINA/)
  assert.ok(SITEMAP_GRUPOS.paginas.includes('core'))
  const pages = paginasDoGrupo([
    { id: 'core', title: 'Páginas principais', pages: [GRAFICOS_PAGINA] },
    { id: 'institucional', title: 'Institucional', pages: [] },
  ], 'paginas')
  assert.equal(pages.some((p) => p.path === '/graficos'), true)

  const llms = ler('server/routes/llms.txt.ts')
  assert.match(llms, /\/graficos\)/)
  assert.match(llms, /\/graficos\/cdi\.png/)
  assert.match(llms, /Não é recomendação/)
  assert.match(ler('server/routes/llms-full.txt.ts'), /getSiteSections/)
  assert.match(ler('server/middleware/cache-sessao.ts'), /'\/graficos': 'public, s-maxage=86400'/)

  const indexnow = ler('scripts/indexnow.mjs')
  assert.match(indexnow, /sitemap\.xml/)
  assert.match(indexnow, /urlset|ehIndice/)

  const pagina = ler('app/pages/graficos.vue')
  const painel = ler('app/components/graficos/GraficoPainel.vue')
  assert.match(pagina, /Não é recomendação|AVISO/)
  assert.match(painel, /:id="grafico\.ancora"/)
  assert.match(painel, /Copiar código/)
  assert.doesNotMatch(pagina + painel, /melhores/i)
  assert.match(pagina, /datasetsJsonLd/)
  assert.match(pagina, /path: GRAFICOS_PATH/)

  const rota = ler('server/routes/graficos/[arquivo].ts')
  assert.match(rota, /max-age=86400, s-maxage=86400/)
  assert.match(rota, /no-store/)
  assert.doesNotMatch(rota, /setCookie|gtag|googletagmanager|clarity/)
  assert.match(ler('server/api/graficos.get.ts'), /s-maxage=86400/)
  assert.doesNotMatch(ler('server/api/graficos.get.ts'), /setCookie/)
})

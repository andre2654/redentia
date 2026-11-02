/**
 * A resposta de /sitemaps/dividendos.xml e /sitemaps/quanto-rende.xml sai da
 * última cópia boa. A geração nova não segura a requisição, e uma geração
 * incompleta não apaga a cópia que já servia.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  SITEMAP_CACHE_CONTROL,
  SITEMAP_CACHE_FRESCO_MS,
  SITEMAP_CACHE_STALE_MS,
  SITEMAP_CACHE_TIMEOUT_MS,
  SITEMAP_CONTENT_TYPE,
  SitemapIndisponivel,
  configIsrComFallback,
  copiaServe,
  resolverSitemapEmCache,
  xmlNaOrigem,
  type CopiaSitemap,
} from '../server/utils/sitemap-cache.ts'
import { SEMENTES_SITEMAP } from '../server/data/sitemap-semente.ts'

const ORIGEM = 'https://www.redentia.com.br'

function xmlDe(origin: string, path: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${origin}${path}</loc><lastmod>2026-10-30</lastmod></url>\n</urlset>\n`
}

function copia(xml: string, storedAt: number, completo = true): CopiaSitemap {
  return { xml, storedAt, completo, origin: ORIGEM }
}

function base(over: Partial<Parameters<typeof resolverSitemapEmCache>[0]> = {}) {
  return {
    agora: 1_000_000,
    origin: ORIGEM,
    copia: null as CopiaSitemap | null,
    frescoMs: 1_000,
    staleMs: 5_000,
    timeoutMs: 50,
    gerar: async () => copia(xmlDe(ORIGEM, '/dividendos/VALE3'), 1_000_000),
    gravar: async () => {},
    ...over,
  }
}

test('cópia fresca volta igual e não gera de novo', async () => {
  const xml = xmlDe(ORIGEM, '/dividendos/PETR4')
  let gerou = false
  const resultado = await resolverSitemapEmCache(base({
    copia: copia(xml, 1_000_000 - 10),
    gerar: async () => {
      gerou = true
      return copia(xmlDe(ORIGEM, '/dividendos/VALE3'), 1_000_000)
    },
  }))
  assert.equal(gerou, false)
  assert.equal(resultado.xml, xml)
  assert.equal(resultado.renovacao, null)
  assert.equal(resultado.cacheControl, SITEMAP_CACHE_CONTROL)
  assert.equal(resultado.contentType, SITEMAP_CONTENT_TYPE)
})

test('cópia stale volta na hora e a geração nova grava em segundo plano', async () => {
  const velha = xmlDe(ORIGEM, '/dividendos/PETR4')
  const nova = xmlDe(ORIGEM, '/dividendos/VALE3')
  let gravada: CopiaSitemap | null = null
  let liberar: (c: CopiaSitemap) => void = () => {}
  const t0 = Date.now()
  const resultado = await resolverSitemapEmCache(base({
    copia: copia(velha, 1_000_000 - 2_000),
    gerar: () => new Promise((resolve) => {
      liberar = resolve
    }),
    gravar: async (c) => {
      gravada = c
    },
  }))
  assert.ok(Date.now() - t0 < 30, `stale esperou ${Date.now() - t0}ms`)
  assert.equal(resultado.xml, velha)
  assert.ok(resultado.renovacao)
  assert.equal(gravada, null)
  await new Promise((r) => setImmediate(r))
  liberar(copia(nova, 1_000_000))
  await resultado.renovacao
  assert.equal(gravada?.xml, nova)
})

test('geração incompleta não substitui a cópia boa', async () => {
  const velha = xmlDe(ORIGEM, '/quanto-rende/PETR4')
  let gravou = false
  const resultado = await resolverSitemapEmCache(base({
    copia: copia(velha, 1_000_000 - 2_000),
    gerar: async () => ({
      xml: xmlDe(ORIGEM, '/quanto-rende/VALE3'),
      storedAt: 1_000_000,
      completo: false,
      origin: ORIGEM,
    }),
    gravar: async () => {
      gravou = true
    },
  }))
  assert.equal(resultado.xml, velha)
  await resultado.renovacao
  assert.equal(gravou, false)
})

test('cópia antiga demais espera o teto e volta a anterior se a geração não chega', async () => {
  const velha = xmlDe(ORIGEM, '/dividendos/PETR4')
  const nova = xmlDe(ORIGEM, '/dividendos/ITUB4')
  let gravada: CopiaSitemap | null = null
  let liberar: (c: CopiaSitemap) => void = () => {}
  const t0 = Date.now()
  const resultado = await resolverSitemapEmCache(base({
    agora: 100_000,
    frescoMs: 1_000,
    staleMs: 1_000,
    timeoutMs: 40,
    copia: copia(velha, 0),
    gerar: () => new Promise((resolve) => {
      liberar = resolve
    }),
    gravar: async (c) => {
      gravada = c
    },
  }))
  const passou = Date.now() - t0
  assert.ok(passou >= 30, `timeout curto demais: ${passou}ms`)
  assert.ok(passou < 300, `timeout não segurou: ${passou}ms`)
  assert.equal(resultado.xml, velha)
  assert.ok(resultado.renovacao)
  liberar(copia(nova, 100_000))
  await resultado.renovacao
  assert.equal(gravada?.xml, nova)
})

test('sem cópia, geração lenta estoura o teto e a que terminar ainda grava', async () => {
  const nova = xmlDe(ORIGEM, '/quanto-rende/MXRF11')
  let gravada: CopiaSitemap | null = null
  let liberar: (c: CopiaSitemap) => void = () => {}
  const t0 = Date.now()
  let erro: unknown
  try {
    await resolverSitemapEmCache(base({
      copia: null,
      timeoutMs: 30,
      gerar: () => new Promise((resolve) => {
        liberar = resolve
      }),
      gravar: async (c) => {
        gravada = c
      },
    }))
  } catch (e) {
    erro = e
  }
  assert.ok(Date.now() - t0 < 300)
  assert.ok(erro instanceof SitemapIndisponivel)
  assert.equal(erro.statusCode, 503)
  liberar(copia(nova, 1))
  await erro.renovacao
  assert.equal(gravada?.xml, nova)
})

test('sem cópia, geração completa grava e devolve o xml novo', async () => {
  const nova = xmlDe(ORIGEM, '/dividendos/BBAS3')
  let gravada: CopiaSitemap | null = null
  const resultado = await resolverSitemapEmCache(base({
    copia: null,
    gerar: async () => copia(nova, 5),
    gravar: async (c) => {
      gravada = c
    },
  }))
  assert.equal(resultado.xml, nova)
  assert.equal(resultado.renovacao, null)
  assert.equal(gravada?.xml, nova)
  assert.equal(resultado.cacheControl, SITEMAP_CACHE_CONTROL)
})

test('troca o host do loc e deixa o path como está', () => {
  const xml = xmlDe(ORIGEM, '/dividendos/PETR4')
  const trocada = xmlNaOrigem(xml, ORIGEM, 'http://localhost:3000')
  assert.match(trocada, /<loc>http:\/\/localhost:3000\/dividendos\/PETR4<\/loc>/)
  assert.equal(trocada.includes(ORIGEM), false)
  assert.equal(xmlNaOrigem(xml, ORIGEM, ORIGEM), xml)
  assert.equal(copiaServe(copia(xml, 1)), true)
  assert.equal(copiaServe({ xml: '<urlset></urlset>', storedAt: 1, completo: true, origin: ORIGEM }), false)
  assert.equal(copiaServe(copia(xml, 1, false)), false)
})

test('janela e teto cabem no que o Googlebot aguenta, e o header continua o de antes', () => {
  assert.equal(SITEMAP_CACHE_FRESCO_MS, 60 * 60 * 1000)
  assert.equal(SITEMAP_CACHE_STALE_MS, 24 * 60 * 60 * 1000)
  assert.ok(SITEMAP_CACHE_TIMEOUT_MS <= 10_000)
  assert.match(SITEMAP_CACHE_CONTROL, /s-maxage=3600/)
  assert.match(SITEMAP_CACHE_CONTROL, /stale-while-revalidate=86400/)
})

test('fallback do ISR aponta o xml e o content-type', () => {
  const config = configIsrComFallback({ expiration: 3600, bypassToken: 'abc' }, 'dividendos.xml-isr.prerender-fallback.xml')
  assert.equal(config.expiration, 3600)
  assert.equal(config.bypassToken, 'abc')
  assert.equal(config.fallback, 'dividendos.xml-isr.prerender-fallback.xml')
  assert.equal(config.initialStatus, 200)
  const headers = config.initialHeaders as Record<string, string>
  assert.equal(headers['content-type'], SITEMAP_CONTENT_TYPE)
})

test('a rota pesada usa a cópia boa e o xml continua saindo de getSiteSections', () => {
  const rota = readFileSync(new URL('../server/routes/sitemaps/[tipo].ts', import.meta.url), 'utf8')
  const resposta = readFileSync(new URL('../server/utils/sitemap-resposta.ts', import.meta.url), 'utf8')
  const cfg = readFileSync(new URL('../nuxt.config.ts', import.meta.url), 'utf8')
  assert.match(rota, /responderSitemapPesado/)
  assert.match(rota, /dividendos/)
  assert.match(rota, /quanto-rende/)
  assert.match(resposta, /getSiteSections\(\)/)
  assert.match(resposta, /urlsetXml\(origin, pages\)/)
  assert.match(resposta, /paginasDoGrupo\(sections, tipo\)/)
  assert.match(resposta, /quantoRendeGeracaoCompleta\(\)/)
  assert.match(resposta, /waitUntil\(seguro\)/)
  assert.match(cfg, /'\/sitemaps\/dividendos\.xml': \{ isr: 3600 \}/)
  assert.match(cfg, /'\/sitemaps\/quanto-rende\.xml': \{ isr: 3600 \}/)
})

test('a semente do build traz os dois urlsets canônicos', () => {
  for (const tipo of ['dividendos', 'quanto-rende'] as const) {
    const item = SEMENTES_SITEMAP[tipo]
    assert.ok(item, tipo)
    assert.equal(item.origin, ORIGEM)
    assert.match(item.xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset /)
    assert.equal(item.urls, item.xml.split('<loc>').length - 1)
    assert.ok(item.urls > 500, `${tipo} ${item.urls}`)
    assert.match(item.xml, /<loc>https:\/\/www\.redentia\.com\.br\//)
  }
  assert.ok(SEMENTES_SITEMAP.dividendos!.urls > SEMENTES_SITEMAP['quanto-rende']!.urls)
})

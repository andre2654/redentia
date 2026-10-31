/**
 * Grava server/data/sitemap-semente.ts: a última cópia boa de
 * /sitemaps/dividendos.xml e /sitemaps/quanto-rende.xml, gerada pelo MESMO
 * getSiteSections() + urlsetXml() da rota.
 *
 * Falha de rede não apaga o arquivo anterior (sitemap vazio é pior que a
 * lista de ontem). Roda no build e pode rodar à mão:
 *   node scripts/atualizar-sitemap-semente.mjs
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const APP = join(ROOT, 'app')

const ORIGIN = 'https://www.redentia.com.br'
const BASE = process.env.NUXT_BACKEND_URL ?? 'https://redentia-api.saraivada.com/api'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '../server/data/sitemap-semente.ts')
const TIPOS = ['dividendos', 'quanto-rende']

globalThis.defineCachedFunction = (fn) => fn
globalThis.useRuntimeConfig = () => ({
  backendDirectBase: BASE,
  public: { siteUrl: ORIGIN },
})

globalThis.$fetch = async (request, options = {}) => {
  const path = String(request)
  const base = String(options.baseURL || BASE).replace(/\/+$/, '')
  const url = path.startsWith('http') ? path : `${base}/${path.replace(/^\/+/, '')}`
  const timeout = typeof options.timeout === 'number' ? options.timeout : 20_000
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'RedentiaSitemap/1.0' },
    signal: AbortSignal.timeout(timeout),
  })
  if (!res.ok) {
    const err = new Error(`${res.status} ${url}`)
    err.statusCode = res.status
    err.status = res.status
    err.response = { status: res.status }
    throw err
  }
  return res.json()
}

function anteriorDoArquivo(jiti) {
  if (!existsSync(OUT)) return {}
  return jiti.import(OUT).then((mod) => mod.SEMENTES_SITEMAP ?? {}).catch(() => ({}))
}

function temCopia(sementes, tipo) {
  const item = sementes?.[tipo]
  return typeof item?.xml === 'string' && item.xml.includes('<loc>')
}

async function main() {
  const jiti = createJiti(import.meta.url, {
    interopDefault: true,
    moduleCache: false,
    alias: {
      '~': APP,
      '@': APP,
      '~~': ROOT,
      '@@': ROOT,
    },
  })
  if (process.argv.includes('--import-only')) {
    await jiti.import('../server/utils/site-pages.ts')
    await jiti.import('../server/utils/sitemap-xml.ts')
    console.log('import ok')
    return
  }

  const pages = await jiti.import('../server/utils/site-pages.ts')
  const xml = await jiti.import('../server/utils/sitemap-xml.ts')
  const anterior = await anteriorDoArquivo(jiti)
  console.log('gerando sitemaps (quanto rende lê o histórico, cerca de 2 min)...')
  const t0 = Date.now()
  const sections = await pages.getSiteSections()
  const storedAt = Date.now()
  const sementes = {}
  for (const tipo of TIPOS) {
    const lista = xml.paginasDoGrupo(sections, tipo)
    const completo = lista.length > 0 && (tipo !== 'quanto-rende' || pages.quantoRendeGeracaoCompleta())
    if (!completo) {
      console.warn(`sitemap ${tipo}: geração incompleta (${lista.length} urls); arquivo anterior fica`)
      continue
    }
    sementes[tipo] = {
      xml: xml.urlsetXml(ORIGIN, lista),
      storedAt,
      origin: ORIGIN,
      urls: lista.length,
    }
    console.log(`sitemap ${tipo}: ${lista.length} urls em ${((Date.now() - t0) / 1000).toFixed(1)}s`)
  }

  const junto = { ...anterior, ...sementes }
  if (!temCopia(junto, 'dividendos') || !temCopia(junto, 'quanto-rende')) {
    console.error('semente sem os dois sitemaps')
    process.exit(existsSync(OUT) && temCopia(anterior, 'dividendos') && temCopia(anterior, 'quanto-rende') ? 0 : 1)
  }
  if (Object.keys(sementes).length === 0) {
    console.warn('geração falhou; semente anterior permanece')
    return
  }

  const arquivo = [
    '// Gerado por scripts/atualizar-sitemap-semente.mjs. Não editar à mão.',
    '// Última cópia boa para o handler devolver na hora e a borda (ISR) servir no primeiro acesso.',
    `export const SEMENTES_SITEMAP = ${JSON.stringify(junto)}`,
    '',
  ].join('\n')
  const tmp = `${OUT}.tmp`
  writeFileSync(tmp, arquivo)
  renameSync(tmp, OUT)
  // readFileSync confirma que o que foi para o disco é o que vamos servir
  const gravado = readFileSync(OUT, 'utf8')
  if (!gravado.includes('<loc>https://www.redentia.com.br/')) {
    throw new Error('semente gravada sem <loc> canônico')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

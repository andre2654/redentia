/**
 * Resposta de /sitemaps/dividendos.xml e /sitemaps/quanto-rende.xml.
 *
 * A lista de URLs continua sendo getSiteSections() + urlsetXml(). A requisição
 * leva a última cópia boa (memória deste isolate, cache de runtime da Vercel
 * ou a semente gravada no build) e a fila de históricos segue no waitUntil.
 * Geração incompleta não substitui uma cópia completa.
 */
import { getCache, waitUntil } from '@vercel/functions'
import { createError, setHeader, type H3Event } from 'h3'
import { SEMENTES_SITEMAP } from '../data/sitemap-semente.ts'
import { getSiteSections, quantoRendeGeracaoCompleta } from './site-pages.ts'
import {
  SITEMAP_CACHE_FRESCO_MS,
  SITEMAP_CACHE_STALE_MS,
  SITEMAP_CACHE_TIMEOUT_MS,
  SitemapIndisponivel,
  copiaServe,
  resolverSitemapEmCache,
  type CopiaSitemap,
} from './sitemap-cache.ts'
import { paginasDoGrupo, urlsetXml } from './sitemap-xml.ts'

const TIPOS_PESADOS = ['dividendos', 'quanto-rende'] as const
const TTL_REMOTO_S = 7 * 24 * 60 * 60
const LOCK_S = 200
const LOCK_KEY = 'sitemap-pesado-lock'

const memoria = new Map<string, CopiaSitemap>()
let geracaoAmbos: Promise<Map<string, CopiaSitemap>> | null = null

function chaveDe(tipo: string, origin: string): string {
  return `sitemap-xml:v1:${tipo}:${origin}`
}

function remoto() {
  if (process.env.VERCEL !== '1') return null
  try {
    return getCache({ namespace: 'redentia-sitemap' })
  } catch {
    return null
  }
}

function sementeDe(tipo: string): CopiaSitemap | null {
  const item = SEMENTES_SITEMAP[tipo]
  if (!item || typeof item.xml !== 'string' || item.xml.length === 0) return null
  return {
    xml: item.xml,
    storedAt: Number(item.storedAt) || 0,
    completo: true,
    origin: item.origin || 'https://www.redentia.com.br',
  }
}

async function lerRemoto(chave: string): Promise<CopiaSitemap | null> {
  const cache = remoto()
  if (!cache) return null
  try {
    const item = await cache.get(chave) as Partial<CopiaSitemap> | null
    if (!item || typeof item.xml !== 'string') return null
    return {
      xml: item.xml,
      storedAt: Number(item.storedAt) || 0,
      completo: item.completo === true,
      origin: typeof item.origin === 'string' ? item.origin : '',
    }
  } catch {
    return null
  }
}

async function lerCopia(tipo: string, origin: string): Promise<CopiaSitemap | null> {
  const chave = chaveDe(tipo, origin)
  const candidatas = [
    memoria.get(chave) ?? null,
    await lerRemoto(chave),
    sementeDe(tipo),
  ].filter(copiaServe)
  if (!candidatas.length) return null
  candidatas.sort((a, b) => b.storedAt - a.storedAt)
  const melhor = candidatas[0]!
  memoria.set(chave, melhor)
  return melhor
}

async function gravarCopia(tipo: string, copia: CopiaSitemap): Promise<void> {
  if (!copiaServe(copia)) return
  memoria.set(chaveDe(tipo, copia.origin), copia)
  const cache = remoto()
  if (!cache) return
  try {
    await cache.set(chaveDe(tipo, copia.origin), {
      xml: copia.xml,
      storedAt: copia.storedAt,
      completo: true,
      origin: copia.origin,
    }, { ttl: TTL_REMOTO_S, name: `sitemap-${tipo}` })
  } catch {
    // a memória deste isolate ainda serve a cópia nova
  }
}

/** false = outro isolate já está na fila. Não abre uma segunda. */
async function lockLivre(): Promise<boolean> {
  const cache = remoto()
  if (!cache) return true
  try {
    const atual = await cache.get(LOCK_KEY) as { ate?: number } | null
    if (atual && typeof atual.ate === 'number' && atual.ate > Date.now()) return false
    await cache.set(LOCK_KEY, { ate: Date.now() + LOCK_S * 1000 }, { ttl: LOCK_S, name: LOCK_KEY })
    return true
  } catch {
    return true
  }
}

async function soltarLock(): Promise<void> {
  const cache = remoto()
  if (!cache) return
  try {
    await cache.delete(LOCK_KEY)
  } catch {
    // o ttl solta sozinho
  }
}

/**
 * Uma geração enche os dois arquivos. Pedidos juntos esperam a mesma promise
 * em vez de abrir outra fila de históricos.
 */
function gerarAmbos(origin: string): Promise<Map<string, CopiaSitemap>> {
  if (geracaoAmbos) return geracaoAmbos
  geracaoAmbos = (async () => {
    const out = new Map<string, CopiaSitemap>()
    const peguei = await lockLivre()
    if (!peguei) return out
    try {
      const sections = await getSiteSections()
      const storedAt = Date.now()
      for (const tipo of TIPOS_PESADOS) {
        const pages = paginasDoGrupo(sections, tipo)
        const completo = pages.length > 0 && (tipo !== 'quanto-rende' || quantoRendeGeracaoCompleta())
        const copia: CopiaSitemap = {
          xml: urlsetXml(origin, pages),
          storedAt,
          completo,
          origin,
        }
        out.set(tipo, copia)
        if (copia.completo) await gravarCopia(tipo, copia)
      }
      return out
    } finally {
      await soltarLock()
    }
  })().finally(() => {
    geracaoAmbos = null
  })
  return geracaoAmbos
}

function gerarTipo(tipo: string, origin: string): Promise<CopiaSitemap> {
  return gerarAmbos(origin).then((mapa) => mapa.get(tipo) ?? {
    xml: '',
    storedAt: Date.now(),
    completo: false,
    origin,
  })
}

function adiar(trabalho: Promise<void> | null): void {
  if (!trabalho) return
  const seguro = trabalho.catch(() => {})
  try {
    waitUntil(seguro)
  } catch {
    // sem contexto de request o waitUntil não segura a função; no Node a
    // promise já está rodando
  }
}

export async function responderSitemapPesado(event: H3Event, tipo: string, origin: string): Promise<string> {
  const copia = await lerCopia(tipo, origin)
  try {
    const resultado = await resolverSitemapEmCache({
      agora: Date.now(),
      origin,
      copia,
      frescoMs: SITEMAP_CACHE_FRESCO_MS,
      staleMs: SITEMAP_CACHE_STALE_MS,
      // Em dev, sem semente, a primeira leitura ainda espera a fila inteira
      // (é assim que se inspeciona o XML). Preview e produção têm teto.
      timeoutMs: import.meta.dev ? 180_000 : SITEMAP_CACHE_TIMEOUT_MS,
      gerar: () => gerarTipo(tipo, origin),
      gravar: (pronta) => gravarCopia(tipo, pronta),
    })
    adiar(resultado.renovacao)
    setHeader(event, 'content-type', resultado.contentType)
    setHeader(event, 'cache-control', resultado.cacheControl)
    return resultado.xml
  } catch (e) {
    if (e instanceof SitemapIndisponivel) {
      adiar(e.renovacao)
      setHeader(event, 'cache-control', 'private, no-store')
      setHeader(event, 'retry-after', '60')
      throw createError({ statusCode: 503, statusMessage: 'Sitemap temporariamente indisponível' })
    }
    throw e
  }
}

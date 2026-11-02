/**
 * Cache da resposta XML de /sitemaps/dividendos.xml e /sitemaps/quanto-rende.xml.
 *
 * A borda (Cache-Control / ISR) só entrega a cópia velha para QUEM NÃO é a
 * requisição que dispara a regeneração. O Googlebot é essa requisição, e a
 * fila de históricos passa de 120s — o fetch do sitemap morre.
 *
 * Aqui a própria função devolve a última cópia boa na hora e renova depois.
 * Sem cópia, ou com cópia mais velha que a janela de stale, a geração nova
 * tem teto: estourado o tempo, volta a cópia anterior (se houver) em vez de
 * segurar a conexão.
 */

export const SITEMAP_CONTENT_TYPE = 'application/xml; charset=utf-8'
/** 1 h fresco na borda, 24 h servindo a cópia velha enquanto renova. */
export const SITEMAP_CACHE_CONTROL = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
export const SITEMAP_CACHE_CONTROL_PRIVADO = 'private, no-store'

export const SITEMAP_CACHE_FRESCO_MS = 60 * 60 * 1000
export const SITEMAP_CACHE_STALE_MS = 24 * 60 * 60 * 1000
/** Teto da espera quando não dá para responder com uma cópia já pronta. */
export const SITEMAP_CACHE_TIMEOUT_MS = 8_000

export interface CopiaSitemap {
  xml: string
  storedAt: number
  completo: boolean
  origin: string
}

export interface ResultadoSitemap {
  xml: string
  contentType: string
  cacheControl: string
  /** null = nada a renovar. A rota manda isto pro waitUntil. */
  renovacao: Promise<void> | null
}

export class SitemapIndisponivel extends Error {
  readonly statusCode = 503
  readonly renovacao: Promise<void>
  constructor(renovacao: Promise<void>) {
    super('Sitemap temporariamente indisponível')
    this.name = 'SitemapIndisponivel'
    this.renovacao = renovacao
  }
}

export function copiaServe(c: CopiaSitemap | null | undefined): c is CopiaSitemap {
  if (!c || c.completo !== true) return false
  if (typeof c.xml !== 'string' || !c.xml.includes('<urlset')) return false
  if (!c.xml.includes('<loc>')) return false
  if (typeof c.storedAt !== 'number' || !Number.isFinite(c.storedAt)) return false
  if (typeof c.origin !== 'string' || c.origin.length === 0) return false
  return true
}

/** Troca só o host do <loc>. O path da URL continua o que o gerador gravou. */
export function xmlNaOrigem(xml: string, origemGuardada: string, origem: string): string {
  if (!origemGuardada || origemGuardada === origem) return xml
  return xml.replaceAll(`<loc>${origemGuardada}`, `<loc>${origem}`)
}

export interface OpcoesSitemapCache {
  agora: number
  origin: string
  copia: CopiaSitemap | null
  frescoMs: number
  staleMs: number
  timeoutMs: number
  gerar: () => Promise<CopiaSitemap>
  gravar: (copia: CopiaSitemap) => Promise<void>
}

function respostaPronta(
  copia: CopiaSitemap,
  origin: string,
  renovacao: Promise<void> | null,
): ResultadoSitemap {
  return {
    xml: xmlNaOrigem(copia.xml, copia.origin, origin),
    contentType: SITEMAP_CONTENT_TYPE,
    cacheControl: SITEMAP_CACHE_CONTROL,
    renovacao,
  }
}

function renovar(
  gerar: () => Promise<CopiaSitemap>,
  gravar: (copia: CopiaSitemap) => Promise<void>,
): Promise<void> {
  return Promise.resolve()
    .then(gerar)
    .then(async (copia) => {
      if (copiaServe(copia)) await gravar(copia)
    })
    .catch(() => {})
}

/**
 * Cópia fresca: devolve e não gera. Cópia dentro da janela stale: devolve na
 * hora e gera em segundo plano. Mais velha que isso, ou nenhuma: espera a
 * geração até timeoutMs e, se estourar, devolve a cópia que já existia.
 */
export async function resolverSitemapEmCache(opts: OpcoesSitemapCache): Promise<ResultadoSitemap> {
  const boa = copiaServe(opts.copia) ? opts.copia : null
  if (boa) {
    const idade = opts.agora - boa.storedAt
    if (idade < opts.frescoMs) return respostaPronta(boa, opts.origin, null)
    if (idade < opts.frescoMs + opts.staleMs) {
      return respostaPronta(boa, opts.origin, renovar(opts.gerar, opts.gravar))
    }
  }

  const geracao = Promise.resolve()
    .then(opts.gerar)
    .then(
      (c) => ({ ok: true as const, c }),
      () => ({ ok: false as const }),
    )
  let timer: ReturnType<typeof setTimeout> | undefined
  const estourou = new Promise<{ timeout: true }>((resolve) => {
    timer = setTimeout(() => resolve({ timeout: true }), opts.timeoutMs)
  })
  const corrida = await Promise.race([
    geracao.then((r) => ({ timeout: false as const, r })),
    estourou,
  ])
  if (timer) clearTimeout(timer)

  if (!corrida.timeout && corrida.r.ok && copiaServe(corrida.r.c)) {
    await opts.gravar(corrida.r.c)
    return respostaPronta(corrida.r.c, opts.origin, null)
  }

  const renovacao = geracao.then(async (r) => {
    if (r.ok && copiaServe(r.c)) await opts.gravar(r.c)
  })

  if (!corrida.timeout && corrida.r.ok && corrida.r.c.xml.includes('<urlset')) {
    return {
      xml: xmlNaOrigem(corrida.r.c.xml, corrida.r.c.origin || opts.origin, opts.origin),
      contentType: SITEMAP_CONTENT_TYPE,
      cacheControl: SITEMAP_CACHE_CONTROL_PRIVADO,
      renovacao: null,
    }
  }

  if (boa) return respostaPronta(boa, opts.origin, renovacao)
  throw new SitemapIndisponivel(renovacao)
}

/** Junta o fallback estático ao .prerender-config.json do ISR da Vercel. */
export function configIsrComFallback(
  config: Record<string, unknown>,
  arquivo: string,
): Record<string, unknown> {
  const atuais = config.initialHeaders
  const headers: Record<string, string> = atuais && typeof atuais === 'object'
    ? { ...(atuais as Record<string, string>) }
    : {}
  headers['content-type'] = SITEMAP_CONTENT_TYPE
  return {
    ...config,
    fallback: arquivo,
    initialStatus: typeof config.initialStatus === 'number' ? config.initialStatus : 200,
    initialHeaders: headers,
  }
}

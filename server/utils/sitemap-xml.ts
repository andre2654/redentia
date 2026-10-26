/**
 * XML do sitemap e o mapa de arquivos por tipo. /sitemap.xml é o índice;
 * cada tipo vive em /sitemaps/{tipo}.xml. A lista de URLs continua sendo
 * getSiteSections() — a mesma de /llms-full.txt.
 */
import type { H3Event } from 'h3'
import type { SitePage, SiteSection } from './site-pages'

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export const SITEMAP_GRUPOS: Record<string, Array<SiteSection['id']>> = {
  paginas: ['core', 'institucional'],
  calculadoras: ['calculadoras', 'cenarios'],
  rankings: ['rankings'],
  setores: ['setores'],
  glossario: ['glossario'],
  teses: ['teses'],
  tesouro: ['tesouro'],
  dividendos: ['dividendos'],
  'preco-teto': ['preco-teto'],
  ativos: ['ativos', 'cripto'],
}

export const SITEMAP_ORDEM = [
  'paginas', 'calculadoras', 'rankings', 'setores', 'glossario',
  'teses', 'tesouro', 'dividendos', 'preco-teto', 'ativos',
] as const

/** 'ativos.xml' → 'ativos'; tipo desconhecido → null. */
export function tipoDoSitemap(param: string | undefined): string | null {
  const tipo = String(param ?? '').replace(/\.xml$/i, '')
  return Object.prototype.hasOwnProperty.call(SITEMAP_GRUPOS, tipo) ? tipo : null
}

export function paginasDoGrupo(sections: SiteSection[], tipo: string): SitePage[] {
  const ids = SITEMAP_GRUPOS[tipo]
  if (!ids) return []
  const seen = new Set<string>()
  const out: SitePage[] = []
  for (const id of ids) {
    const section = sections.find((s) => s.id === id)
    if (!section) continue
    for (const page of section.pages) {
      if (seen.has(page.path)) continue
      seen.add(page.path)
      out.push(page)
    }
  }
  return out
}

export function latestLastmod(pages: SitePage[]): string | undefined {
  return pages.reduce<string | undefined>(
    (acc, page) => (page.lastmod && (!acc || page.lastmod > acc) ? page.lastmod : acc),
    undefined,
  )
}

export function urlsetXml(origin: string, pages: SitePage[]): string {
  const urls = pages.map((page) => {
    const loc = `<loc>${escapeXml(origin + page.path)}</loc>`
    const mod = page.lastmod ? `<lastmod>${escapeXml(page.lastmod)}</lastmod>` : ''
    return `  <url>${loc}${mod}</url>`
  }).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export function sitemapIndexXml(entries: Array<{ loc: string; lastmod?: string }>): string {
  const body = entries.map((entry) => {
    const loc = `<loc>${escapeXml(entry.loc)}</loc>`
    const mod = entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : ''
    return `  <sitemap>${loc}${mod}</sitemap>`
  }).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`
}

export function cacheSitemap(event: H3Event) {
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')
}

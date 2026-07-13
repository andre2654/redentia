/**
 * /sitemap.xml — hand-rolled, sem módulo (decisão PR-A: zero dependência nova).
 * Lista de URLs = server/utils/site-pages.ts (compartilhada com /llms-full.txt).
 *
 * Host: origin da própria request (funciona no preview da Vercel e no domínio
 * final sem env). O handler NÃO é cacheado no Nitro de propósito — o cache por
 * rota ignoraria o host e vazaria o origin de um deploy pro outro; quem cacheia
 * é a CDN via s-maxage (per-host). Os fetches pesados do backend já são
 * cacheados 1h dentro do util.
 */
export default defineEventHandler(async (event) => {
  const origin = getRequestURL(event).origin
  const sections = await getSiteSections()

  const urls = sections
    .flatMap((s) => s.pages)
    .map((p) => `  <url><loc>${escapeXml(origin + p.path)}</loc></url>`)
    .join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
})

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

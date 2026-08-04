/**
 * /sitemap.xml — hand-rolled, sem módulo (decisão PR-A: zero dependência nova).
 * Lista de URLs = server/utils/site-pages.ts (compartilhada com /llms-full.txt).
 *
 * Host: origem CANÔNICA do site (siteOrigin), nunca o host da request. Sitemap é
 * uma declaração sobre o SITE, não sobre quem respondeu: publicar URLs do host
 * que atendeu foi o que fez whitelabel.redentia.com.br listar 231 URLs clonadas
 * e o Google indexá-las. O handler NÃO é cacheado no Nitro de propósito (o cache
 * por rota ignoraria variação de deploy); quem cacheia é a CDN via s-maxage. Os
 * fetches pesados do backend já são cacheados 1h dentro do util.
 */
export default defineEventHandler(async (event) => {
  const origin = siteOrigin(event)
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

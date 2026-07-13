/**
 * /robots.txt dinâmico — a linha Sitemap precisa do host real da request,
 * por isso rota server (o public/robots.txt estático foi DELETADO no PR-A:
 * arquivo estático tem precedência sobre a rota e engoliria esta).
 */
export default defineEventHandler((event) => {
  const origin = getRequestURL(event).origin

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')

  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /carteira',
    'Disallow: /login',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n')
})

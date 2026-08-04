/**
 * /robots.txt dinâmico (o public/robots.txt estático foi DELETADO no PR-A:
 * arquivo estático tem precedência sobre a rota e engoliria esta).
 *
 * A linha Sitemap aponta pra origem CANÔNICA (siteOrigin), não pro host que
 * atendeu. Um robots servido de um preview ou de um subdomínio esquecido
 * apontando pro próprio host é como o sitemap do whitelabel entrou no índice.
 */
export default defineEventHandler((event) => {
  const origin = siteOrigin(event)

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

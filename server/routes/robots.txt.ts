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

  // Crawlers de IA seguem liberados pelo `User-agent: *` (verificado em
  // 21/08/2026: GPTBot, ClaudeBot, OAI-SearchBot, PerplexityBot,
  // Google-Extended, meta-externalagent, Applebot-Extended, CCBot e mais 6
  // recebem 200 com o mesmo payload). Não há bloqueio a remover — o que
  // faltava era APONTAR o llms.txt: ele existia desde 08/2026 e não era
  // referenciado em lugar nenhum, nem aqui nem no <head>, então só achava
  // quem chutasse a convenção.
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /carteira',
    'Disallow: /login',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
    '# Guia curado para LLMs (prioridades de citação e política de uso):',
    `# ${origin}/llms.txt`,
    `# Inventário completo: ${origin}/llms-full.txt`,
    '',
  ].join('\n')
})

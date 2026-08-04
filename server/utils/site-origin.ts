import type { H3Event } from 'h3'

/**
 * Origem canônica do site para as rotas server (/sitemap.xml, /robots.txt,
 * /llms-full.txt). Espelha o composable `useSiteOrigin` do lado do app.
 *
 * As três rotas montavam a origem com `getRequestURL(event).origin`, ou seja, o
 * host que atendeu a request. O efeito prático: um preview da Vercel publicava um
 * sitemap inteiro de URLs de preview, e o subdomínio whitelabel publicou um sitemap
 * de 231 URLs clonadas que o Google indexou. Sitemap e robots são declarações
 * sobre o SITE, não sobre o host que respondeu, então derivam de `public.siteUrl`.
 *
 * Em dev mantém o host real pra não quebrar inspeção local do sitemap.
 */
export function siteOrigin(event: H3Event): string {
  if (import.meta.dev) {
    return getRequestURL(event).origin
  }
  return useRuntimeConfig(event).public.siteUrl
}

/**
 * Origem canônica do site, para canonical / og:url / JSON-LD.
 *
 * POR QUE ISSO EXISTE (custo medido, não teoria): até 08/2026 todo canonical era
 * montado com o host REAL da request (`useRequestURL().host`). Qualquer deploy que
 * respondesse por outro host publicava um site inteiro de canonicals apontando pra
 * si mesmo. No Search Console isso apareceu como dois clones indexados:
 *   - whitelabel.redentia.com.br → 231 URLs, 5.182 impressões
 *   - estudo.redentia.com.br     → 2 URLs
 * clonando /asset, /ranking, /glossario, /dividendos, /calculadora e /guias.
 *
 * Regra agora: em produção o canonical é SEMPRE `public.siteUrl`, seja qual for o
 * host que atendeu. Preview da Vercel, subdomínio esquecido ou apex sem www passam
 * a consolidar no domínio real em vez de competir com ele. Em dev usa o host real,
 * senão o localhost emitiria canonical de produção e atrapalharia a inspeção.
 *
 * Escape hatch pra um deploy legitimamente separado (tenant com domínio próprio):
 * setar NUXT_PUBLIC_SITE_URL naquele ambiente. É o mesmo mecanismo de sempre.
 */
export function useSiteOrigin(): string {
  if (import.meta.dev) {
    const url = useRequestURL()
    return `${url.protocol}//${url.host}`
  }
  return useRuntimeConfig().public.siteUrl
}

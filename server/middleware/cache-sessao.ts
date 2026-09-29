/**
 * Cache-Control das páginas públicas, decidido POR REQUISIÇÃO (hotfix 29/09/2026).
 *
 * O vazamento: estas rotas mandavam `public, s-maxage=…` pelo routeRules pra
 * TODA resposta, inclusive a renderizada pra quem chega com o cookie de sessão.
 * A borda da Vercel não varia por cookie, então o HTML de um logado (header
 * logado + token no payload) ficava em cache e era servido a anônimos. Sonda
 * em produção: 1ª requisição com cookie → MISS; 2ª e 3ª sem cookie → HIT com o
 * marcador no HTML.
 *
 * A regra agora:
 *  - SEM cookie de sessão → exatamente o valor de antes, rota por rota;
 *  - COM cookie de sessão (`nu:token`, ou o `nu:name` que anda com ele) →
 *    `private, no-store`: nada renderizado pra um logado vai pra borda.
 *
 * Por que aqui e não no routeRules: o preset vercel do Nitro emite
 * `routeRules.headers` como rota ESTÁTICA no .vercel/output/config.json,
 * aplicada na borda e sem olhar o cookie — e ela pode vencer o header que a
 * função manda (achado do verificador do #46). Header decidido por request só
 * existe dentro da função. As rotas que já eram `private, no-store` pros dois
 * casos continuam no nuxt.config.ts.
 *
 * Ordem: este middleware roda antes do render. Quem vem depois ainda manda: o
 * 5xx sai `no-store` + `Retry-After` (server/plugins/error-status-headers.ts)
 * e o 404 sai `no-cache` (error handler do Nitro), como antes.
 *
 * Casamento igual ao do routeRules do Nitro: 'x' é exato e '/x/**' é tudo
 * DEBAIXO de /x/ — não casa a base (a armadilha documentada do '/guias/**').
 */

const DIA = 'public, s-maxage=86400, stale-while-revalidate=604800'
const HORA = 'public, s-maxage=3600, stale-while-revalidate=86400'
const QUINZE_MIN = 'public, s-maxage=900, stale-while-revalidate=3600'
const DEZ_MIN = 'public, s-maxage=600, stale-while-revalidate=3600'
const CINCO_MIN = 'public, s-maxage=300, stale-while-revalidate=600'

/** Rotas exatas (o hub sem o '/**'). */
const EXATAS: Record<string, string> = {
  '/noticias': 'public, s-maxage=180, stale-while-revalidate=600',
  '/tesouro': DEZ_MIN,
  '/guias': HORA,
  // Glossário: dicionário, conteúdo estável → 24h na borda.
  '/glossario': DIA,
  // /teses: SSR 100% público (seed do design; favoritos hidratam client-side).
  '/teses': CINCO_MIN,
  '/calculadoras': HORA,
  // /mcp: docs públicas (o CTA troca de destino client-side pós-mount).
  '/mcp': HORA,
  // /business: landing sem variante logada. Está noindex até o PR5 — trava de
  // compliance no topo de components/business/RbSeguranca.vue. Cadastro,
  // chaves, skills e convite seguem private/no-store no nuxt.config.ts.
  '/business': HORA,
  // Rankings e setores: o backend cacheia 15 min → s-maxage=900.
  '/rankings': QUINZE_MIN,
  '/setor': QUINZE_MIN,
  // Legais/editoriais que quase nunca mudam.
  '/metodologia': DIA,
}

/** Rotas '/x/**' (tudo DEBAIXO de /x/). */
const PREFIXOS: Array<[string, string]> = [
  ['/asset/', 'public, s-maxage=120, stale-while-revalidate=600'],
  ['/tesouro/', DEZ_MIN],
  ['/dividendos/', HORA],
  ['/guias/', HORA],
  ['/glossario/', DIA],
  ['/tese/', CINCO_MIN],
  // calculadoras individuais: conteúdo estático + interação client-side
  ['/calculadora/', HORA],
  ['/ranking/', QUINZE_MIN],
  ['/setor/', QUINZE_MIN],
  ['/institucional/', DIA],
]

/** Valor público da rota (anônimo), ou null se a rota não é cacheável na borda. */
function cachePublicoDaRota(pathname: string): string | null {
  const exata = EXATAS[pathname]
  if (exata) return exata
  for (const [prefixo, valor] of PREFIXOS) {
    if (pathname.startsWith(prefixo)) return valor
  }
  return null
}

export default defineEventHandler((event) => {
  const pathname = (event.path || '/').split('?')[0] || '/'
  const publico = cachePublicoDaRota(pathname)
  if (!publico) return
  const cookies = parseCookies(event)
  const comSessao = !!(cookies['nu:token'] || cookies['nu:name'])
  setResponseHeader(event, 'cache-control', comSessao ? 'private, no-store' : publico)
})

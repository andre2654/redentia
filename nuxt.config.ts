// Redentia Nu — a nova Redentia. SSR-first (as superfícies públicas são o motor
// de aquisição/SEO). Arquitetura herdada dos dois apps anteriores:
//  - proxies em 3 camadas e routeRules de cache (Frontend)
//  - deploy git→Vercel e organização por feature (Atlas)
// Plano mestre: docs/redentia-nu/PLANO-REDENTIA-NU.md (repo raiz).
export default defineNuxtConfig({
  compatibilityDate: '2026-07-11',
  devtools: { enabled: false },
  ssr: true,

  css: ['~/assets/css/tokens.css', '~/assets/css/base.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      // titleTemplate NÃO pode viver aqui: função em app.head não serializa e
      // o SSR renderiza o title cru sem sufixo de marca (bug desde o PR0,
      // pego no verify do PR10). O template vive em app.vue via useHead.
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap',
        },
        { rel: 'icon', type: 'image/svg+xml', href: '/logo-azul.svg' },
      ],
      meta: [{ name: 'theme-color', content: '#2F6BFF' }],
    },
  },

  runtimeConfig: {
    // Server-only: URL direta do Laravel pros fetches SSR (evita loopback do
    // Nitro no próprio proxy). Override: NUXT_BACKEND_DIRECT_BASE.
    backendDirectBase: process.env.NUXT_BACKEND_URL ?? 'https://redentia-api.saraivada.com/api',
    public: {
      // Browser SEMPRE fala com same-origin (/api/backend, /api/chat) — zero CORS.
      // chatDirectUrl: escape hatch se o proxy Vercel bufferizar SSE (lição do Atlas).
      chatDirectUrl: process.env.NUXT_PUBLIC_CHAT_DIRECT_URL || '',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://redentia.com.br',
      // Google OAuth Web client ID (público por design — o browser precisa
      // dele pro Google Identity Services emitir o id_token; o secret vive
      // só no Laravel, que valida via tokeninfo + aud). ENV-ONLY, sem
      // fallback hardcoded (lição registrada em conventions.md). Sem a env,
      // o botão Google do /login se esconde sozinho (LoginGoogleButton
      // documenta o que falta pra ligar).
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    },
  },

  routeRules: {
    // Proxies server-to-server (prod/Vercel).
    '/api/backend/**': {
      proxy: `${process.env.NUXT_BACKEND_URL ?? 'https://redentia-api.saraivada.com/api'}/**`,
    },
    '/api/chat/**': {
      proxy: `${process.env.NUXT_CHAT_SERVICE_URL ?? 'https://redentia-api.saraivada.com/chat'}/**`,
    },
    // Cache por rota. Regra dura (lição do Frontend): rota com variante
    // logada/deslogada = private/no-store — CDN não varia por cookie.
    '/': { headers: { 'cache-control': 'private, no-store' } },
    '/carteira': { headers: { 'cache-control': 'private, no-store' } },
    '/busca': { headers: { 'cache-control': 'private, no-store' } },
    // /login redireciona SSR-side quem já tem cookie de sessão e lê
    // ?redirect/?email — cachear seria servir o redirect de um user pro outro.
    '/login': { headers: { 'cache-control': 'private, no-store' } },
    '/mercado': { headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    '/noticias': { headers: { 'cache-control': 'public, s-maxage=180, stale-while-revalidate=600' } },
    '/acao/**': { headers: { 'cache-control': 'public, s-maxage=120, stale-while-revalidate=600' } },
    // '/guias/**' não casa a base — o hub precisa da regra exata (PR4).
    '/guias': { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    '/guias/**': { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    '/tese/**': { headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    '/calculadoras': { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    // PR10: hub mudou de /calculadora pro /calculadoras (301 preserva o link
    // equity do hub antigo); as calculadoras individuais MANTÊM o path antigo
    // /calculadora/<slug> — conteúdo estático + interação client-side, cache longo.
    '/calculadora': { redirect: { to: '/calculadoras', statusCode: 301 } },
    '/calculadora/**': { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
  },

  nitro: {
    // Dev: browser fetches de /api/* vão pro VPS por default (dev funciona sem
    // backend local). Override: NUXT_BACKEND_URL / NUXT_CHAT_SERVICE_URL.
    devProxy: {
      '/api/backend': {
        target: process.env.NUXT_BACKEND_URL ?? 'https://redentia-api.saraivada.com/api',
        changeOrigin: true,
      },
      '/api/chat': {
        target: process.env.NUXT_CHAT_SERVICE_URL ?? 'https://redentia-api.saraivada.com/chat',
        changeOrigin: true,
        ws: true,
      },
    },
  },

  components: [{ path: '~/components', pathPrefix: false }],
  imports: { dirs: ['services'] },
})

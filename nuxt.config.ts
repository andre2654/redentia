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
    '/busca': { headers: { 'cache-control': 'private, no-store' } },
    // /login redireciona SSR-side quem já tem cookie de sessão e lê
    // ?redirect/?email — cachear seria servir o redirect de um user pro outro.
    '/login': { headers: { 'cache-control': 'private, no-store' } },
    // Home única (dono, 2026-07-13): o MERCADO é a home `/` pros dois casos
    // (anônimo e logado — só variam SEÇÕES); /mercado 301a pra raiz (regra
    // EXATA; '/' já é private/no-store acima). A carteira segue página
    // separada e privada — NÃO redireciona.
    '/mercado': { redirect: { to: '/', statusCode: 301 } },
    '/carteira': { headers: { 'cache-control': 'private, no-store' } },
    '/noticias': { headers: { 'cache-control': 'public, s-maxage=180, stale-while-revalidate=600' } },
    '/asset/**': { headers: { 'cache-control': 'public, s-maxage=120, stale-while-revalidate=600' } },
    // Tesouro e dividendos: páginas próprias (em construção em frentes
    // paralelas) — cache já configurado pra quando entrarem no ar.
    '/tesouro': { headers: { 'cache-control': 'public, s-maxage=600, stale-while-revalidate=3600' } },
    '/tesouro/**': { headers: { 'cache-control': 'public, s-maxage=600, stale-while-revalidate=3600' } },
    '/dividendos/**': { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    // '/guias/**' não casa a base — o hub precisa da regra exata (PR4).
    '/guias': { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    '/guias/**': { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    '/tese/**': { headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    // /teses: SSR 100% público (seed do design; favoritos hidratam client-side).
    '/teses': { headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    '/calculadoras': { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    // PR10: hub mudou de /calculadora pro /calculadoras (301 preserva o link
    // equity do hub antigo); as calculadoras individuais MANTÊM o path antigo
    // /calculadora/<slug> — conteúdo estático + interação client-side, cache longo.
    '/calculadora': { redirect: { to: '/calculadoras', statusCode: 301 } },
    '/calculadora/**': { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    // Rankings (kit PLANO-RANKINGS.md): hub novo /rankings + detalhe nos
    // slugs ANTIGOS /ranking/<slug> (equity de SEO). O 301 do hub antigo é
    // EXATO ('/ranking' não casa '/ranking/**' no Nitro — mesma lição do
    // '/calculadora' acima). Backend cacheia 15 min → s-maxage=900 na borda.
    '/ranking': { redirect: { to: '/rankings', statusCode: 301 } },
    '/ranking/**': { headers: { 'cache-control': 'public, s-maxage=900, stale-while-revalidate=3600' } },
    '/rankings': { headers: { 'cache-control': 'public, s-maxage=900, stale-while-revalidate=3600' } },
    // Rotas antigas por classe morrem (stub [classe].vue deletado): as 3 de
    // equity viram filtro do hub; renda-fixa vira o detalhe do tesouro.
    '/rankings/acoes': { redirect: { to: '/rankings?classe=acoes', statusCode: 301 } },
    '/rankings/fiis': { redirect: { to: '/rankings?classe=fiis', statusCode: 301 } },
    '/rankings/bdrs': { redirect: { to: '/rankings?classe=bdrs', statusCode: 301 } },
    '/rankings/renda-fixa': { redirect: { to: '/ranking/tesouro-direto', statusCode: 301 } },
    // Setores (SEO programático /setor): hub /setor + detalhe /setor/{ptSlug}.
    // Audit: os slugs ingleses do /setor antigo não tinham tráfego relevante →
    // sem 301. Backend (GET /sectors) cacheia igual aos rankings → s-maxage=900.
    '/setor': { headers: { 'cache-control': 'public, s-maxage=900, stale-while-revalidate=3600' } },
    '/setor/**': { headers: { 'cache-control': 'public, s-maxage=900, stale-while-revalidate=3600' } },
    // Páginas estáticas/legais (institucional + metodologia): conteúdo jurídico/
    // editorial que quase nunca muda — cache longo na borda + SWR de 1 dia.
    '/institucional/**': { headers: { 'cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800' } },
    '/metodologia': { headers: { 'cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800' } },

    // ——— Migração redentia.com.br → Nu (PR-A do PLANO-REFINO-POS-ATLAS) ———
    // 301s dos paths da Redentia antiga; cobrem 100% do top-30 orgânico real.
    // Só produzem efeito pleno quando o domínio apontar pro Nu, mas ficam
    // prontos desde já (e valem pra quem chegar por link antigo no vercel.app).
    // /asset/{ticker} voltou a ser a URL canônica (equity de SEO da antiga);
    // /acao/** só existiu por dias no vercel.app e agora 301a de volta.
    '/acao/**': { redirect: { to: '/asset/**', statusCode: 301 } },
    '/help': { redirect: { to: '/busca', statusCode: 301 } },
    '/search': { redirect: { to: '/busca', statusCode: 301 } },
    '/auth/**': { redirect: { to: '/login', statusCode: 301 } },
    // /dividendos/{ticker}: página própria em construção (frente paralela) —
    // o wildcard de redirect saiu; ficam só os EXATOS: o hub /dividendos e o
    // /dividendos/calendario (calendário ainda não existe) vão pro ranking
    // de DY, destino topicamente honesto.
    '/dividendos/calendario': { redirect: { to: '/ranking/maiores-dividend-yield', statusCode: 301 } },
    '/dividendos': { redirect: { to: '/ranking/maiores-dividend-yield', statusCode: 301 } },
    // Guia antigo com slug diferente → guia real Nu (301 preserva o equity).
    // /guias/calculadora-de-dividendos e /guias/acoes-fiis-dividendos-todo-mes
    // deixaram de ser 301 provisórios: viraram páginas reais de guia (KIT).
    '/guias/open-finance-carteira-espalhada': { redirect: { to: '/guias/open-finance', statusCode: 301 } },
    // Hubs de categoria da antiga → filtros do hub de rankings.
    '/acoes': { redirect: { to: '/rankings?classe=acoes', statusCode: 301 } },
    '/fiis': { redirect: { to: '/rankings?classe=fiis', statusCode: 301 } },
    '/etfs': { redirect: { to: '/rankings', statusCode: 301 } },
    '/small-caps': { redirect: { to: '/rankings', statusCode: 301 } },
    // /tesouro e /tesouro/[slug]: páginas reais em construção (frente
    // paralela) — os redirects provisórios pro ranking saíram; as regras de
    // cache vivem no bloco de cache acima.
    // direto pra raiz (o /mercado também 301a pra '/' — evita corrente de 301)
    '/mercado-completo': { redirect: { to: '/', statusCode: 301 } },
    // /legal/* → /institucional/* (mesmos 3 slugs; a antiga tinha ~471
    // 404s de /legal/* reportados no Search Console — não herdar isso).
    '/legal/terms': { redirect: { to: '/institucional/terms', statusCode: 301 } },
    '/legal/privacy': { redirect: { to: '/institucional/privacy', statusCode: 301 } },
    '/legal/cookies': { redirect: { to: '/institucional/cookies', statusCode: 301 } },
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

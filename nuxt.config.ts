import svgLoader from 'vite-svg-loader'
// nuxt.config eh build-time, nao tem como ser reativo a tenant. Usa
// o `seedBrand` (defaults Redentia) pra static SEO/manifest metadata.
// Em runtime, o `useHead` dinamico em plugins/brand.ts sobrescreve
// title/description/themeColor com a config do tenant ativo.
import { seedBrand as brand } from './app/config/seed-brand'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],

  // ============================================================
  // PERFORMANCE: page-load tuning pra IG Sponsored Browser
  // ============================================================
  // O IG Sponsored Browser (mais restritivo que o IG in-app comum)
  // tinha 87/88 sessions de paid traffic dando bounce em 1s. Causa:
  // video 36MB autoplay competindo por banda com CSS/JS critico.
  //
  // Mudancas mantidas (testadas como ganho liquido):
  //   - video re-encoded 36MB → 2.8MB (1080p → 720p, sem audio, CRF 30)
  //   - lazy load via IntersectionObserver (so baixa quando entra
  //     no viewport, depois do paint inicial)
  //
  // Tentamos mas REVERTIDO (testes mostraram regressao em slow 4g):
  //   - features.inlineStyles:true → inflava HTML de 140KB pra 529KB
  //     (Nuxt inlinava CSS de TODOS os componentes, incluindo non-critical)
  //   - payloadExtraction:false → HTML inflava ainda mais
  //   - crossOriginPrefetch:true → prefetch agressivo machucava
  //   - Lazy* nos componentes do result → chunks sequenciais piores
  //     que os pre-carregados em paralelo
  //
  // O QUE FUNCIONOU (manter):
  //   - NuxtLink prefetch=hover ao inves de in-viewport. Antes a nav
  //     pre-baixava 23 chunks de outras rotas competindo com critical
  //     resources em Slow 4G. Agora so pre-baixa quando user passa o
  //     mouse/foca. Em mobile (touch), nunca pre-baixa.
  //
  experimental: {
    defaults: {
      nuxtLink: {
        // Sem prefetch automatico. Reduz ~700KB-1MB de bandwidth
        // desperdicado na primeira pintura. Em desktop o user faz hover
        // antes de clicar, prefetch ainda dispara em tempo. Em mobile
        // economiza data + acelera critical path.
        prefetch: false,
      },
    },
  },

  // ============================================================
  // @nuxt/fonts — limitar subsets pra reduzir CSS inline
  // ============================================================
  // O modulo (transitivo via @nuxt/ui) baixa as fontes e inlina os
  // @font-face no <head> com TODOS os subsets disponiveis (Latin,
  // Latin Extended, Vietnamese, Cyrillic). Pra um produto pt-BR isso
  // ~36KB de metadata desperdicado em cada page load.
  //
  // Limitando a 'latin' apenas reduz pra ~9KB (75% menos).
  fonts: {
    defaults: {
      subsets: ['latin'],
    },
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/fonts',  // explicito (era transitivo via @nuxt/ui) pra pegar subsets:['latin']
    '@nuxt/image',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/sitemap',
  ],

  // Override the storage backend for `@nuxtjs/color-mode` (registered
  // by `@nuxt/ui`). Default is `localStorage`, which the SSR plugin
  // cannot read — so the server always renders with `colorMode.value
  // = 'system'` and the brand palette ends up dark for everyone.
  // When the user actually has `light` saved, the client tries to
  // re-render with the light palette but Vue's hydration logs a
  // warning ("DOM will not be rectified") and leaves the dark
  // `:style` attributes in place. Switching to a cookie lets the
  // server read the preference, render the correct palette inline,
  // and produce SSR HTML that matches what the client expects.
  colorMode: {
    storage: 'cookie',
    storageKey: 'nuxt-color-mode',
    // Class adicionada no <html> e simplesmente `dark` ou `light`
    // (nao `dark-mode`/`light-mode`). Bate com o seletor `:root.dark`
    // emitido pelo `plugins/brand.ts buildCssVars`. O `@nuxtjs/color-mode`
    // injeta a class via inline anti-flash script ANTES do CSS aplicar,
    // entao componentes que usam `var(--brand-X)` ja sao renderizados
    // no modo certo sem flash de hidratacao.
    classSuffix: '',
    preference: 'system',
    fallback: 'dark',
  },

  // @nuxt/image config. External hosts we serve logos/thumbnails from
  // must be whitelisted so IPX can optimize them; anything outside the
  // list falls back to the raw URL.
  image: {
    format: ['webp'],
    quality: 80,
    domains: [
      'statusinvest.com.br',
      'media.infomoney.com.br',
      'imagens.mtimes.com.br',
      'www.seudinheiro.com',
      'braziljournal.com',
      'www.moneytimes.com.br',
      'www.suno.com.br',
      'suno.com.br',
      'valorinveste.globo.com',
    ],
  },
  // @nuxt/icon comes bundled with @nuxt/ui. By default it resolves
  // lucide icons via a remote fetch to api.iconify.design — that
  // fetch times out in SSR (1500ms default) for icons that aren't
  // warm in their CDN, producing `<!-- -->` SSR placeholders that
  // then hydrate as `<div>` on the client. The mismatch cascades
  // through subtrees and breaks the brand reactive state, causing
  // the "Redent.IA logo showing up on a Saraiva-branded page" bug.
  // Registering the `lucide` collection as a server-side bundle
  // makes resolution local and synchronous — no network, no
  // timeouts, no mismatches.
  icon: {
    serverBundle: {
      collections: ['lucide'],
    },
  },
  ssr: true,
  vite: {
    // Allow any host in dev so the tenant-resolver middleware can
    // exercise host-based routing via `curl -H "Host: foo.com.br"`
    // or `/etc/hosts` entries like `saraivainvest.localhost`.
    // In production (Vercel), Vite dev server is not used — this
    // setting is irrelevant to builds.
    server: {
      allowedHosts: true,
    },
    plugins: [svgLoader()],
    build: {
      rollupOptions: {
        output: {
          // Only client-side chunks are listed here. Don't reference
          // `isomorphic-dompurify` — it's loaded via dynamic import()
          // inside Message.vue, which makes Vite emit it as its own
          // lazy chunk. Listing it in manualChunks would force-include
          // it in this initial bundle on every page (unnecessary
          // weight) and complicates the SSR stub above.
          //
          // Splits below carve out the heaviest libraries so the home
          // page's main chunk doesn't drag them in. PageSpeed reported
          // a single ~14.9s CPU monster (BN52xPUw.js); splitting frees
          // the browser to download these in parallel and skip what's
          // not needed for the route.
          manualChunks: {
            // Only RUNTIME packages here — Nuxt modules like `@pinia/nuxt`
            // are build-time and the import-protection plugin rejects them.
            // Each entry must be importable in the Vue/client bundle.
            'chart': ['chart.js', 'vue-chartjs', 'chartjs-chart-treemap'],
            'markdown': ['marked'],
            'pinia': ['pinia'],
            'xlsx-vendor': ['xlsx'],
          },
        },
      },
    },
  },
  site: {
    url: brand.url,
    name: brand.name,
    description: brand.description,
    defaultLocale: brand.seo.lang,
  },
  sitemap: {
    xslColumns: [
      { label: 'URL', width: '50%' },
      { label: 'Última Modificação', select: 'sitemap:lastmod', width: '25%' },
      { label: 'Prioridade', select: 'sitemap:priority', width: '12.5%' },
      { label: 'Frequência', select: 'sitemap:changefreq', width: '12.5%' },
    ],
    strictNuxtContentPaths: true,
    sources: ['/api/__sitemap__/urls'],
    urls: async () => {
      const staticUrls = [
        // Páginas principais
        { loc: '/', priority: 1.0 as const, changefreq: 'daily' as const },
        {
          loc: '/download',
          priority: 0.8 as const,
          changefreq: 'weekly' as const,
        },
        { loc: '/search', priority: 0.7 as const, changefreq: 'weekly' as const },
        { loc: '/help', priority: 0.7 as const, changefreq: 'weekly' as const },
        {
          loc: '/calculadora',
          priority: 0.8 as const,
          changefreq: 'weekly' as const,
        },
        {
          loc: '/calculadora/juros-compostos',
          priority: 0.8 as const,
          changefreq: 'weekly' as const,
        },
        {
          loc: '/calculadora/acoes',
          priority: 0.8 as const,
          changefreq: 'weekly' as const,
        },
        {
          loc: '/calculadora/planejamento',
          priority: 0.8 as const,
          changefreq: 'weekly' as const,
        },
        {
          loc: '/calculadora/preco-teto',
          priority: 0.9 as const,
          changefreq: 'weekly' as const,
        },
        {
          loc: '/calculadora/aposentadoria',
          priority: 0.9 as const,
          changefreq: 'weekly' as const,
        },
        {
          loc: '/calculadora/dividend-yield',
          priority: 0.8 as const,
          changefreq: 'weekly' as const,
        },
        {
          loc: '/calculadora/quanto-investir',
          priority: 0.8 as const,
          changefreq: 'weekly' as const,
        },
        {
          loc: '/calculadora/imposto-renda',
          priority: 0.8 as const,
          changefreq: 'monthly' as const,
        },

        // Glossário
        {
          loc: '/glossario',
          priority: 0.8 as const,
          changefreq: 'weekly' as const,
        },

        // Páginas de categorias (SEO)
        {
          loc: '/acoes',
          priority: 0.9 as const,
          changefreq: 'weekly' as const,
        },
        {
          loc: '/fiis',
          priority: 0.9 as const,
          changefreq: 'weekly' as const,
        },
        {
          loc: '/etfs',
          priority: 0.8 as const,
          changefreq: 'weekly' as const,
        },
        {
          loc: '/small-caps',
          priority: 0.8 as const,
          changefreq: 'weekly' as const,
        },
        {
          loc: '/dividendos',
          priority: 0.9 as const,
          changefreq: 'weekly' as const,
        },

        // Guias educacionais
        {
          loc: '/guias',
          priority: 0.9 as const,
          changefreq: 'weekly' as const,
        },
        {
          loc: '/guias/como-investir-em-acoes-para-iniciantes',
          priority: 0.8 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/guias/melhores-fiis-para-investir-em-2026',
          priority: 0.8 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/guias/calculadora-de-dividendos',
          priority: 0.8 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/guias/analise-petr4-vale-a-pena-investir',
          priority: 0.8 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/guias/small-caps-guia-completo',
          priority: 0.8 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/guias/widgets-financeiros-para-site',
          priority: 0.9 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/guias/quanto-rende-500-por-mes-na-bolsa',
          priority: 0.9 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/guias/petr4-vs-vale3-vs-itub4',
          priority: 0.9 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/guias/acoes-fiis-dividendos-todo-mes',
          priority: 0.9 as const,
          changefreq: 'weekly' as const,
        },
        {
          loc: '/guias/como-declarar-acoes-imposto-renda',
          priority: 0.9 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/guias/fire-independencia-financeira-calculadora',
          priority: 0.9 as const,
          changefreq: 'monthly' as const,
        },

        // Páginas institucionais
        {
          loc: '/institucional/about',
          priority: 0.6 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/institucional/contact',
          priority: 0.6 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/institucional/how-works',
          priority: 0.7 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/institucional/privacy',
          priority: 0.5 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/institucional/terms',
          priority: 0.5 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/institucional/cookies',
          priority: 0.4 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/whitelabel',
          priority: 0.9 as const,
          changefreq: 'weekly' as const,
        },
        {
          loc: '/api-portal',
          priority: 0.8 as const,
          changefreq: 'weekly' as const,
        },
        {
          loc: '/creative',
          priority: 0.8 as const,
          changefreq: 'weekly' as const,
        },

        // Rankings (SEO programático, atualizado diariamente)
        {
          loc: '/ranking',
          priority: 0.9 as const,
          changefreq: 'daily' as const,
        },
        {
          loc: '/ranking/maiores-dividend-yield',
          priority: 0.9 as const,
          changefreq: 'daily' as const,
        },
        {
          loc: '/ranking/maiores-altas-mes',
          priority: 0.9 as const,
          changefreq: 'daily' as const,
        },
        {
          loc: '/ranking/maiores-baixas-mes',
          priority: 0.9 as const,
          changefreq: 'daily' as const,
        },

        // Calendário de dividendos
        {
          loc: '/dividendos/calendario',
          priority: 0.9 as const,
          changefreq: 'daily' as const,
        },

        // Setores (índice)
        {
          loc: '/setor',
          priority: 0.8 as const,
          changefreq: 'weekly' as const,
        },

        // Estudos / conteúdo editorial
        {
          loc: '/estudo',
          priority: 0.8 as const,
          changefreq: 'weekly' as const,
        },
        {
          loc: '/estudo/imperio-por-tras-do-feed',
          priority: 0.8 as const,
          changefreq: 'monthly' as const,
        },

        // Embeds / Widgets — SEO-indexado (captura backlinks de quem embeda)
        { loc: '/embed', priority: 0.9 as const, changefreq: 'weekly' as const },
        { loc: '/embed/ticker/small', priority: 0.8 as const, changefreq: 'monthly' as const },
        { loc: '/embed/ticker/big', priority: 0.8 as const, changefreq: 'monthly' as const },
        { loc: '/embed/carousel', priority: 0.8 as const, changefreq: 'monthly' as const },
        { loc: '/embed/ranking/altas', priority: 0.8 as const, changefreq: 'monthly' as const },
        { loc: '/embed/ranking/baixas', priority: 0.8 as const, changefreq: 'monthly' as const },
        { loc: '/embed/mapa-calor', priority: 0.8 as const, changefreq: 'monthly' as const },
        { loc: '/embed/grafico', priority: 0.8 as const, changefreq: 'monthly' as const },
        { loc: '/embed/calculadora/juros-compostos', priority: 0.8 as const, changefreq: 'monthly' as const },
        { loc: '/embed/calculadora/dividend-yield', priority: 0.7 as const, changefreq: 'monthly' as const },
        { loc: '/embed/calculadora/preco-teto', priority: 0.7 as const, changefreq: 'monthly' as const },
        { loc: '/embed/calculadora/aposentadoria', priority: 0.7 as const, changefreq: 'monthly' as const },
        { loc: '/embed/calculadora/quanto-investir', priority: 0.7 as const, changefreq: 'monthly' as const },
        { loc: '/embed/calculadora/imposto-renda', priority: 0.7 as const, changefreq: 'monthly' as const },
      ]

      // Termos do glossário
      const { termos } = await import('./app/data/glossario/termos')
      const glossarioUrls = termos.map((termo) => ({
        loc: `/glossario/${termo.slug}`,
        priority: 0.7 as const,
        changefreq: 'monthly' as const,
      }))

      // Setores dinâmicos: busca lista atual do backend para gerar comparativos
      let sectorUrls: Array<{
        loc: string
        priority: 0.8
        changefreq: 'weekly'
      }> = []
      try {
        const apiBase =
          process.env.NUXT_PUBLIC_API_BASE_URL ||
          'https://redentia-api.saraivada.com/api'
        const res = await $fetch<{ data: Array<{ slug: string }> }>(
          `${apiBase}/sectors`
        )
        const sectors = Array.isArray(res?.data) ? res.data : []
        sectorUrls = sectors.map((s) => ({
          loc: `/setor/${s.slug}/comparativo`,
          priority: 0.8 as const,
          changefreq: 'weekly' as const,
        }))
      } catch {
        // Backend indisponível no build — sitemap ignora setores nesta iteração
      }

      // Cenários long-tail das calculadoras: cada combinação aporte+prazo+taxa
      // virou uma página canônica própria (path-based, NÃO query string),
      // entrega answer-first paragraph + FAQ específica + WebApplication schema.
      // Sem essas entradas o Google não descobre os paths dinâmicos
      // /calculadora/<calc>/[scenario], que é justamente o ponto da estratégia
      // programmatic-SEO de capturar long-tails como "quanto rende 500 por mês".
      const calculadoraScenarios = [
        // Juros compostos (5)
        '/calculadora/juros-compostos/500-reais-por-mes',
        '/calculadora/juros-compostos/1000-reais-por-mes',
        '/calculadora/juros-compostos/aposentar-com-1-milhao',
        '/calculadora/juros-compostos/100-mil-em-5-anos',
        '/calculadora/juros-compostos/dobrar-dinheiro-regra-72',
        // Aposentadoria (4)
        '/calculadora/aposentadoria/aposentar-com-5000-mes',
        '/calculadora/aposentadoria/aposentar-com-10000-mes',
        '/calculadora/aposentadoria/regra-dos-4-por-cento',
        '/calculadora/aposentadoria/aposentadoria-fire-aos-45',
        // Quanto investir (4)
        '/calculadora/quanto-investir/juntar-1-milhao',
        '/calculadora/quanto-investir/juntar-100-mil',
        '/calculadora/quanto-investir/entrada-imovel',
        '/calculadora/quanto-investir/aposentadoria-2-milhoes',
      ].map((loc) => ({
        loc,
        priority: 0.7 as const,
        changefreq: 'monthly' as const,
      }))

      // Páginas /dividendos/[ticker] — uma página dedicada por ticker, com
      // histórico real de pagamentos puxado da API. Long-tail prime: queries
      // do tipo "dividendos PETR4", "quando paga dividendo ITUB4" etc. são
      // altíssimo volume mensal. Lista mantida em sincronia com TICKERS_INFO
      // em /pages/dividendos/[ticker].vue. Adicione aqui se expandir lá.
      const dividendosTickers = [
        'itub4', 'petr4', 'vale3', 'itsa4', 'bbas3', 'bbdc4',
        'bbse3', 'taee11', 'abev3', 'mxrf11', 'kncr11', 'hglg11',
      ].map((ticker) => ({
        loc: `/dividendos/${ticker}`,
        priority: 0.8 as const,
        changefreq: 'weekly' as const,
      }))

      // Rankings programáticos (/ranking/[slug]) — 17 páginas SEO geradas
      // via dispatch table em /pages/ranking/[slug].vue (RANKINGS_INFO).
      // Cada uma indexa um ranking fundamentalista (market cap, ROE, P/L,
      // Graham, Bazin, etc.) com long-tail próprio. Atualizadas diariamente
      // pra capturar fluxo de busca recorrente em rankings de bolsa.
      // Adicione aqui se RANKINGS_INFO crescer no [slug].vue.
      const newRankings = [
        '/ranking/maiores-valor-mercado',
        '/ranking/mais-baratas-graham',
        '/ranking/mais-baratas-bazin',
        '/ranking/maiores-margem-liquida',
        '/ranking/buy-and-hold',
        '/ranking/maiores-receitas',
        '/ranking/maiores-lucros',
        '/ranking/maiores-roe',
        '/ranking/menores-pl',
        '/ranking/maiores-altas-12-meses',
        '/ranking/maiores-baixas-12-meses',
        '/ranking/maiores-caixa',
        '/ranking/maior-potencial-upside',
        '/ranking/crescimento-receita-5-anos',
        '/ranking/crescimento-lucro-5-anos',
        '/ranking/nunca-tiveram-prejuizo',
        '/ranking/mais-aparece-noticias',
      ].map((loc) => ({
        loc,
        priority: 0.7 as const,
        changefreq: 'daily' as const,
      }))

      // /ranking/redentia-score — flagship metric, priority 0.9 (acima
      // dos demais rankings 0.7) porque e a feature signature do
      // produto. Atualizado diariamente igual aos outros rankings.
      const redentiaScoreUrl = [
        {
          loc: '/ranking/redentia-score',
          priority: 0.9 as const,
          changefreq: 'daily' as const,
        },
      ]

      // /metodologia — E-E-A-T page (YMYL trust signal pra finanças). Atualizada
      // pouco mas crítica pra Google entender autoria e fontes.
      const editorialUrls = [
        {
          loc: '/metodologia',
          priority: 0.6 as const,
          changefreq: 'monthly' as const,
        },
      ]

      // Rotas dinâmicas (assets) são fornecidas exclusivamente via /api/__sitemap__/urls
      return [
        ...staticUrls,
        ...glossarioUrls,
        ...sectorUrls,
        ...calculadoraScenarios,
        ...dividendosTickers,
        ...redentiaScoreUrl,
        ...newRankings,
        ...editorialUrls,
      ]
    },
    exclude: [
      // Páginas de autenticação
      '/auth/**',
      '/auth/login',
      '/auth/register',

      // Áreas privadas
      '/wallet',
      '/wallet/integracoes',
      '/settings',
      '/step-by-step',
      '/planejador',
      '/dividends',
      '/ideal',
      '/advisor/**',
      '/admin/**',
      '/backoffice/**',
      '/builder',

      // Rotas internas (render/automação)
      '/render/**',
      '/creative/**',
    ],
  },
  runtimeConfig: {
    anthropicApiKey: process.env.NUXT_ANTHROPIC_API_KEY,
    anthropicChatModel: process.env.NUXT_ANTHROPIC_CHAT_MODEL || 'claude-sonnet-4-5',
    anthropicAlertModel: process.env.NUXT_ANTHROPIC_ALERT_MODEL || 'claude-haiku-4-5',
    anthropicCommentaryModel: process.env.NUXT_ANTHROPIC_COMMENTARY_MODEL || 'claude-haiku-4-5',
    internalApiKey: process.env.NUXT_INTERNAL_API_KEY,
    n8nRenderKey: process.env.NUXT_N8N_RENDER_KEY,
    // Meta Conversions API (CAPI) — server-side event dispatch.
    // Bypassa adblockers e iOS ATT que bloqueiam o pixel JS.
    // Combinado com pixel browser via event_id (deduplicacao Meta).
    // NUNCA usar prefixo NUXT_PUBLIC_ — token nao pode vazar pro client.
    metaPixelIdServer: process.env.META_PIXEL_ID || process.env.NUXT_PUBLIC_META_PIXEL_ID || '26687981637519908',
    metaCapiAccessToken: process.env.META_CAPI_ACCESS_TOKEN || '',
    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL ||
        'https://redentia-api.saraivada.com/api',
      cacheTempInSeconds: 60,
      siteUrl:
        process.env.NUXT_PUBLIC_SITE_URL || brand.url,
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      firebaseVapidKey: process.env.NUXT_PUBLIC_FIREBASE_VAPID_KEY,
      metaPixelId: process.env.NUXT_PUBLIC_META_PIXEL_ID || '',
      metaAccessToken: process.env.NUXT_PUBLIC_META_ACCESS_TOKEN || '',
      // Microsoft Clarity — session recordings + heatmaps + AI insights.
      // Project criado 2026-05-05 pra debugar gargalo Lead → CR no
      // /raio-x. Fallback hardcoded garante que funciona sem .env.
      // Deixar string vazia na env desliga em qualquer ambiente.
      clarityProjectId: process.env.NUXT_PUBLIC_CLARITY_PROJECT_ID || 'wmh9pyc3io',
      // Google Analytics 4 measurement ID. Carregado lazy via
      // requestIdleCallback no plugin google-analytics.client.ts pra
      // não bloquear LCP. Empty string desliga em qualquer ambiente.
      gaId: process.env.NUXT_PUBLIC_GA_ID || 'G-F2QGZNWJTM',
      // Google OAuth Web client ID — public by design (browsers
      // need it to ask Google Identity Services for an id_token).
      // The matching client_secret stays in the Laravel backend
      // and is NOT exposed here.
      googleClientId:
        process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID
        || '443939695025-6aho2ug59sa4mmvvoo8cphmeu1s6ji8a.apps.googleusercontent.com',
      // When set, the browser hits the chat-service directly instead of
      // going through Nuxt's /api/chat proxy. The proxy runs on Vercel
      // serverless functions which buffer and time-out long SSE streams.
      // The chat-service CORS already allow-lists *.vercel.app +
      // *.redentia.com.br + *.saraivada.com so direct browser calls work.
      // Set to e.g. https://redentia-api.saraivada.com/chat in Vercel env.
      chatDirectUrl: process.env.NUXT_PUBLIC_CHAT_DIRECT_URL || '',
    },
  },
  routeRules: (() => {
    // ============================================================
    // No CDN caching — all pages render fresh per request
    // ============================================================
    // Nuxt 4 + Vercel has two caching bugs that break multi-tenant:
    //   - ISR creates `/index-isr` routes → Vue Router 404
    //   - SWR ignores query strings → all `?brand=X` share one cache
    //
    // Without route rules, every request hits the serverless function
    // and renders with the correct tenant. Performance is fine since
    // Vercel serverless cold starts are ~100ms.
    //
    // When tenants have their own domains, the Vercel CDN caches by
    // host automatically (no config needed).
    // ============================================================

    return {
      // Forward /api/chat/* to the chat-service microservice.
      //
      // Production (Vercel): the Frontend lives on Vercel and the
      // chat-service lives on the VPS, fronted by Nginx at
      // https://redentia-api.saraivada.com/chat/*. Nitro proxies the
      // request server-to-server, so CORS is a non-issue. The Nginx
      // /chat/ location strips the prefix, so /api/chat/stream lands
      // at chat-service /stream, /api/chat/sessions at /sessions, etc.
      //
      // Override via NUXT_CHAT_SERVICE_URL for staging or local
      // tunnels. Local dev uses nitro.devProxy below (localhost:3200).
      '/api/chat/**': {
        proxy: `${process.env.NUXT_CHAT_SERVICE_URL ?? 'https://redentia-api.saraivada.com/chat'}/**`,
      },
      // /mercado-completo → / (301). Após swap 2026-05-17, o conteúdo
      // que vivia em /mercado-completo virou a home (/). Preserva links
      // externos / SEO redirecionando permanentemente.
      '/mercado-completo': {
        redirect: { to: '/', statusCode: 301 },
      },
      // /legal/* → /institucional/* (301). Google Search Console
      // reportou ~471 paginas 404 em /legal/* devido a links
      // historicos no devPortalFooter que apontavam pra rotas
      // inexistentes. Os arquivos vivem em /institucional/.
      '/legal/terms': { redirect: { to: '/institucional/terms', statusCode: 301 } },
      '/legal/privacy': { redirect: { to: '/institucional/privacy', statusCode: 301 } },
      '/legal/cookies': { redirect: { to: '/institucional/cookies', statusCode: 301 } },

      // ROTAS DE ALTA CONVERSAO — cache headers + critical fast path.
      // /raio-x e o destino #1 dos anuncios; otimizamos pra renderizar
      // styled em <500ms mesmo no IG Sponsored Browser.
      '/raio-x': {
        headers: {
          // 5min de stale-while-revalidate. Se ja tem variant cached
          // serve instantaneo enquanto regen no background.
          'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
        },
      },

      // Phase 5: edge cache pra rotas de marketing (home + landing pages).
      // Vercel CDN cacheia por host header automaticamente — entao 1
      // request resolvido vira cache hit pra todos os outros visitantes
      // do MESMO tenant. Cache miss vai pra serverless (~200ms), hits
      // sao ~5ms. Stale-while-revalidate 1 dia evita cliffs em deploys.
      '/': {
        headers: {
          'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
        },
      },
      '/assessores': {
        headers: { 'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400' },
      },
      '/investidores': {
        headers: { 'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400' },
      },
      // Pages de search/explore — cacheaveis com TTL mais curto pq o
      // conteudo (lista de tickers) e relativamente estatico.
      '/search': {
        headers: { 'cache-control': 'public, max-age=0, s-maxage=120, stale-while-revalidate=600' },
      },
      // Asset pages (/asset/PETR4): cacheaveis pq o conteudo central
      // (preco, fundamentals) muda em ciclos longos. Frontend faz
      // hydration adicional pra prices live.
      '/asset/**': {
        headers: { 'cache-control': 'public, max-age=0, s-maxage=120, stale-while-revalidate=600' },
      },

      // Assets de video servidos com cache imutavel. Vercel ja faz isso
      // pra /_nuxt/* mas /assets/* (servido pelo public/) precisa explicit.
      '/assets/videos/**': {
        headers: { 'cache-control': 'public, max-age=31536000, immutable' },
      },
    }
  })(),
  // Dev-time proxy: forwards browser fetches of /api/chat/* to the
  // chat-service. Defaults to the live VPS endpoint so `bun run dev`
  // works out of the box without a local chat-service. Override with
  // NUXT_CHAT_SERVICE_URL=http://localhost:3200 when iterating on the
  // microservice locally.
  //
  // Nitro/h3 strips the matched key from the request before appending
  // it to `target`, so /api/chat/stream → ${target}/stream.
  nitro: {
    devProxy: {
      '/api/chat': {
        target: process.env.NUXT_CHAT_SERVICE_URL ?? 'https://redentia-api.saraivada.com/chat',
        changeOrigin: true,
        // SSE-friendly: don't buffer the response
        ws: true,
      },
    },
    // Keep `isomorphic-dompurify` (and its `jsdom` transitive dep) OUT
    // of the SSR bundle. The package fails to load on Vercel's
    // serverless runtime because parse5 became ESM-only while jsdom
    // still uses require(), producing a hard 500 on every /help SSR.
    // We import it dynamically client-side in chat-v2/Message.vue, so
    // the SSR build never actually USES it — we just need to make sure
    // it never gets resolved at runtime in Node either. The empty
    // virtual-stub alias below short-circuits any stray import path
    // that survives tree-shaking; the runtime DOMPurify import in
    // Message.vue is gated by `if (import.meta.client)` so it falls
    // through to the empty stub on SSR and never runs.
    alias: {
      'isomorphic-dompurify': 'unenv/runtime/mock/empty',
      'jsdom': 'unenv/runtime/mock/empty',
    },
  },
  components: [
    // Chat v2 components — flat naming (ChatV2Layout, ChatV2Message, etc.)
    // so the directory structure stays organized but template authoring
    // doesn't need the long `MoleculesChatV2…` prefix.
    {
      path: '~/components/molecules/chat-v2',
      pathPrefix: false,
      prefix: 'ChatV2',
      extensions: ['vue'],
    },
    {
      path: '~/components',
      extensions: ['vue'],
    },
    {
      path: '~/assets/icons',
      pathPrefix: false,
      extensions: ['svg'],
    },
  ],
  imports: {
    dirs: ['services'],
  },
  ui: {
    theme: {
      colors: [
        'primary',
        'secondary',
        'tertiary',
        'success',
        'warning',
        'error',
        'info',
        'neutral',
      ],
      defaultVariants: {
        color: 'primary',
      },
    },
  },
  app: {
    head: {
      title: brand.seo.title,
      htmlAttrs: {
        lang: brand.seo.lang,
        // The `dark` class is set by the anti-flash inline script (see
        // `script` below) before first paint, then kept in sync by the
        // brand plugin via `useHead`. We don't set it here so SSR and
        // the script don't fight each other.
      },
      viewport: 'width=device-width, initial-scale=1',
      charset: 'utf-8',
      link: [
        // Google Fonts CSS is injected by `plugins/brand.ts` (via useHead)
        // because it's tenant-aware. Listing it here too produced two
        // identical render-blocking CSS requests — moved out.
        // ----------------------------------------------------------------
        // Preconnect hints — open the TCP+TLS handshake to the origins
        // that block LCP before the browser actually requests anything.
        // Without these, fonts.gstatic.com starts negotiating at ~600ms
        // and redentia-api.saraivada.com at ~570ms; both shave ~250-310ms
        // off LCP on a cold connection.
        // `crossorigin` is required on font origins because woff2 fetches
        // are CORS-protected; missing it costs the preconnect entirely.
        // ----------------------------------------------------------------
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'preconnect',
          href: 'https://redentia-api.saraivada.com',
          crossorigin: '',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: brand.logo.favicon,
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '48x48',
          href: brand.logo.favicon,
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '192x192',
          href: brand.logo.icon192,
        },
        {
          rel: 'shortcut icon',
          href: brand.logo.faviconIco,
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: brand.logo.appleTouchIcon,
        },
        {
          rel: 'mask-icon',
          href: brand.logo.faviconSvg,
          color: brand.seo.themeColor,
        },
        // PWA Manifest — servido dinamicamente por server/routes/manifest.webmanifest.ts
        // (multi-tenant, resolve brand por host). `crossorigin: 'use-credentials'`
        // mandatório quando o manifest endpoint precisar de cookies de sessão.
        {
          rel: 'manifest',
          href: '/manifest.webmanifest',
        },
      ],
      meta: [
        {
          name: 'description',
          content: brand.seo.description,
        },
        { name: 'application-name', content: brand.name },
        { name: 'theme-color', content: brand.seo.themeColor },
        { name: 'robots', content: 'index,follow' },
        {
          property: 'og:title',
          content: brand.seo.title,
        },
        {
          property: 'og:description',
          content: brand.seo.description,
        },
        {
          property: 'og:image',
          content: `${brand.url}${brand.logo.og}`,
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: brand.name },
        { property: 'og:locale', content: brand.seo.locale },
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: brand.seo.title,
        },
        {
          name: 'twitter:description',
          content: brand.seo.description,
        },
        {
          name: 'twitter:image',
          content: `${brand.url}${brand.logo.og}`,
        },
      ],
    },
  },
  // ============================================================
  // PWA Sprint 1 (2026-05-22) — reativado após 3 semanas de kill switch.
  // ============================================================
  // O `selfDestroying: true` rodou de 04/mai a 22/mai pra limpar SW
  // antigo que cacheava 403 stale. Telemetry confirma > 99% dos
  // browsers ativos passaram pela limpeza. Agora reativamos com:
  //
  //   - Manifest DINÂMICO multi-tenant (server/routes/manifest.webmanifest.ts)
  //     → cada brand tem seu próprio name/theme_color/icons
  //   - Workbox via @vite-pwa/nuxt (`generateSW` strategy)
  //   - Runtime caching em 5 tiers (network-first APIs, cache-first assets, etc)
  //   - Widgets Adaptive Cards (Windows 11) declarados no manifest
  //   - Shortcuts (Android + Mac dock + Win taskbar) declarados no manifest
  //   - Push (FCM) via SW separado em /firebase-messaging-sw.js (Day 5)
  //
  // Veja Obsidian-Vault/Redentia/PWA-Widgets/ pra plano completo.
  // ============================================================
  pwa: {
    strategies: 'generateSW',
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    // Manifest é servido dinamicamente via server route, não estaticamente.
    // O `false` evita o vite-pwa gerar manifest.webmanifest concorrente.
    registerWebManifestInRouteRules: false,
    manifest: false,
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico,webp,woff2}'],
      // Exclui assets pesados do precache (>2MB Workbox falha o build).
      // Ainda são servidos normalmente — browser cacheia via HTTP cache
      // ou via runtimeCaching abaixo se baterem em alguma regra.
      //   - brand/holder/author.png (~4MB) é decorativo, raramente visto.
      //   - screenshots/*.png e .map são desnecessários no SW precache.
      globIgnores: [
        '**/brand/holder/author.*',
        '**/screenshots/**',
        '**/*.map',
      ],
      // Safety net caso outro asset cresça no futuro — eleva o teto pra
      // 5MB. Acima disso o build avisa (que é o sinal certo pra otimizar
      // o asset, não pra subir mais o limite).
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      navigateFallback: '/offline',
      navigateFallbackDenylist: [
        /^\/api\//,
        /^\/manifest\.webmanifest$/,
        /^\/sw\.js$/,
        /^\/firebase-messaging-sw\.js$/,
        /^\/_/,
      ],
      cleanupOutdatedCaches: true,
      skipWaiting: true,
      clientsClaim: true,
      runtimeCaching: [
        // Tier 1: dados market que mudam intra-dia (network-first, 5s timeout).
        // Cobre /market/snapshot, /market/today, /widgets/*, /portfolio/*.
        // Se rede cai, Workbox serve último cache (até 5min de idade).
        {
          urlPattern: /\/api\/(market|portfolio|widgets)\//,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'redentia-api-fresh',
            networkTimeoutSeconds: 5,
            expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        // Tier 2: tickers/aliases — mudam raramente (stale-while-revalidate 1h).
        {
          urlPattern: /\/api\/tickers/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'redentia-api-tickers',
            expiration: { maxEntries: 200, maxAgeSeconds: 3600 },
          },
        },
        // Tier 3: SSE stream NUNCA cachear — handler explícito NetworkOnly.
        {
          urlPattern: /\/api\/chat\/stream/,
          handler: 'NetworkOnly',
        },
        // Tier 4: imagens (cache-first 30d).
        {
          urlPattern: /\.(?:png|jpg|jpeg|webp|svg|gif|ico)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'redentia-images',
            expiration: { maxEntries: 300, maxAgeSeconds: 2592000 },
          },
        },
        // Tier 5: fontes (cache-first 1 ano).
        {
          urlPattern: /\.(?:woff2|woff|ttf|otf)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'redentia-fonts',
            expiration: { maxEntries: 30, maxAgeSeconds: 31536000 },
          },
        },
        // Tier 6: Pluggy CDN (widget JS).
        {
          urlPattern: /^https:\/\/cdn\.pluggy\.ai\//,
          handler: 'CacheFirst',
          options: {
            cacheName: 'pluggy-cdn',
            expiration: { maxEntries: 20, maxAgeSeconds: 86400 },
          },
        },
        // Tier 7: navegação (stale-while-revalidate).
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'redentia-pages' },
        },
      ],
    },
    devOptions: {
      enabled: false, // SW só em build de prod, sem ruído em dev
      type: 'module',
    },
  },
})

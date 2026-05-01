import svgLoader from 'vite-svg-loader'
import { brand } from './app/config/brand'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
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
            'chart': ['chart.js', 'vue-chartjs', 'chartjs-chart-treemap'],
            'markdown': ['marked'],
            'firebase': ['firebase/app', 'firebase/messaging'],
            'pinia': ['pinia', '@pinia/nuxt'],
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

      // Rotas dinâmicas (assets) são fornecidas exclusivamente via /api/__sitemap__/urls
      return [...staticUrls, ...glossarioUrls, ...sectorUrls]
    },
    exclude: [
      // Páginas de autenticação
      '/auth/**',
      '/auth/login',
      '/auth/register',

      // Áreas privadas
      '/wallet',
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
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: brand.name,
      short_name: brand.shortName,
      description: brand.description,
      theme_color: brand.seo.themeColor,
      start_url: '/',
      launch_handler: { client_mode: ['focus-existing', 'navigate-existing'] },
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: brand.logo.icon192,
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: brand.logo.icon512,
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      screenshots: [
        {
          src: '/screenshots/desktop.png',
          sizes: '1611x950',
          type: 'image/png',
          form_factor: 'wide',
        },
        {
          src: '/screenshots/mobile.png',
          sizes: '510x950',
          type: 'image/png',
          form_factor: 'narrow',
        },
      ],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    workbox: {
      importScripts: ['/firebase-messaging-sw.js'],
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },
})

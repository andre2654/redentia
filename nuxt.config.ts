import svgLoader from 'vite-svg-loader'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/sitemap',
  ],
  ssr: true,
  vite: {
    plugins: [svgLoader()],
  },
  site: {
    url: 'https://www.redentia.com.br',
    name: 'Redentia',
    description:
      'A única plataforma de finanças realmente inteligente, com tudo para gerenciar seus investimentos de forma rápida e fácil.',
    defaultLocale: 'pt-BR',
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

        // Páginas institucionais
        {
          loc: '/redentia/about',
          priority: 0.6 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/redentia/contact',
          priority: 0.6 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/redentia/how-works',
          priority: 0.7 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/redentia/privacy',
          priority: 0.5 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/redentia/terms',
          priority: 0.5 as const,
          changefreq: 'monthly' as const,
        },
        {
          loc: '/redentia/cookies',
          priority: 0.4 as const,
          changefreq: 'monthly' as const,
        },
      ]

      // Termos do glossário
      const { termos } = await import('./app/data/glossario/termos')
      const glossarioUrls = termos.map((termo) => ({
        loc: `/glossario/${termo.slug}`,
        priority: 0.7 as const,
        changefreq: 'monthly' as const,
      }))

      // Rotas dinâmicas (assets) são fornecidas exclusivamente via /api/__sitemap__/urls
      return [...staticUrls, ...glossarioUrls]
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

      // Rotas internas (render/automação)
      '/n8n/**',
    ],
  },
  runtimeConfig: {
    openaiApiKey: process.env.NUXT_OPENAI_API_KEY,
    openaiChatModel: process.env.NUXT_OPENAI_CHAT_MODEL,
    openaiRouterModel: process.env.NUXT_OPENAI_ROUTER_MODEL,
    openaiAlertModel: process.env.NUXT_OPENAI_ALERT_MODEL,
    n8nRenderKey: process.env.NUXT_N8N_RENDER_KEY,
    public: {
      cacheTempInSeconds: 60,
      siteUrl:
        process.env.NUXT_PUBLIC_SITE_URL || 'https://www.redentia.com.br',
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      firebaseVapidKey: process.env.NUXT_PUBLIC_FIREBASE_VAPID_KEY,
    },
  },
  routeRules: {
    '/redentia/**': { prerender: true },
    '/download': { prerender: true },
    '/glossario': { prerender: true },
    '/glossario/**': { prerender: true },
    '/acoes': { prerender: true },
    '/fiis': { prerender: true },
    '/etfs': { prerender: true },
    '/small-caps': { prerender: true },
    '/dividendos': { prerender: true },
    '/guias': { prerender: true },
    '/guias/**': { prerender: true },
    '/calculadora': { prerender: true },
    '/calculadora/**': { prerender: true },
  },
  components: [
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
      title: 'Redentia: invista em ações e fundos imobiliários com IA',
      htmlAttrs: {
        lang: 'pt-BR',
        class: 'dark',
      },
      viewport: 'width=device-width, initial-scale=1',
      charset: 'utf-8',
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Sora:wght@100..800&display=swap',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '48x48',
          href: '/favicon.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '192x192',
          href: '/192x192.png',
        },
        {
          rel: 'shortcut icon',
          href: '/favicon.ico',
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/192x192.png',
        },
        {
          rel: 'mask-icon',
          href: '/favicon.svg',
          color: '#000000',
        },
      ],
      meta: [
        {
          name: 'description',
          content:
            'Redentia: invista em ações e fundos imobiliários com apoio de inteligência artificial, análises em tempo real e ferramentas exclusivas.',
        },
        { name: 'application-name', content: 'Redentia' },
        { name: 'theme-color', content: '#000000' },
        { name: 'robots', content: 'index,follow' },
        {
          property: 'og:title',
          content: 'Redentia: invista em ações e fundos imobiliários com IA',
        },
        {
          property: 'og:description',
          content:
            'Use a Redentia para acompanhar cotações, dividendos e análises inteligentes com IA para ações e FIIs.',
        },
        {
          property: 'og:image',
          content: 'https://www.redentia.com.br/512x512.png',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Redentia' },
        { property: 'og:locale', content: 'pt_BR' },
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: 'Redentia: invista em ações e fundos imobiliários com IA',
        },
        {
          name: 'twitter:description',
          content:
            'Ferramentas, análises com IA e acompanhamento completo das suas ações e FIIs na Redentia.',
        },
        {
          name: 'twitter:image',
          content: 'https://www.redentia.com.br/512x512.png',
        },
      ],
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Redentia',
      short_name: 'Redentia',
      description:
        ' A única plataforma de finanças realmente inteligente, com tudo para gerenciar seus investimentos de forma rápida e fácil.',
      theme_color: '#000',
      start_url: '/',
      launch_handler: { client_mode: ['focus-existing', 'navigate-existing'] },
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: '/192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/512x512.png',
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

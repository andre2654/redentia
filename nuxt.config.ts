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
    '@nuxtjs/sitemap'
  ],
  ssr: false,
  vite: {
    plugins: [svgLoader()],
  },
  site: {
    url: 'https://www.redentia.com.br',
    name: 'Redentia',
    description: 'A única plataforma de finanças realmente inteligente, com tudo para gerenciar seus investimentos de forma rápida e fácil.',
    defaultLocale: 'pt-BR',
  },
  sitemap: {
    xslColumns: [
      { label: 'URL', width: '50%' },
      { label: 'Última Modificação', select: 'sitemap:lastmod', width: '25%' },
      { label: 'Prioridade', select: 'sitemap:priority', width: '12.5%' },
      { label: 'Frequência', select: 'sitemap:changefreq', width: '12.5%' }
    ],
    strictNuxtContentPaths: true,
    sources: [
      '/api/__sitemap__/urls'
    ],
    urls: async () => {
      const staticUrls = [
        // Páginas principais
        { loc: '/', priority: 1.0, changefreq: 'daily' },
        { loc: '/download', priority: 0.8, changefreq: 'weekly' },
        
        // Páginas institucionais
        { loc: '/redentia/about', priority: 0.6, changefreq: 'monthly' },
        { loc: '/redentia/contact', priority: 0.6, changefreq: 'monthly' },
        { loc: '/redentia/how-works', priority: 0.7, changefreq: 'monthly' },
        { loc: '/redentia/privacy', priority: 0.5, changefreq: 'monthly' },
        { loc: '/redentia/terms', priority: 0.5, changefreq: 'monthly' },
        { loc: '/redentia/cookies', priority: 0.4, changefreq: 'monthly' },
      ]

      // Tentar buscar ativos da API para incluir no sitemap
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 20000)
        
        const response = await fetch('https://redentia-api.saraivada.com/api/tickers-full', {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        const data = await response.json()
        const assets = Array.isArray(data) ? data : (data?.data || [])
        
        console.log(`[Sitemap] Carregados ${assets.length} ativos da API`)
        
        // Limitar a 500 ativos mais relevantes
        const assetUrls = assets.slice(0, 500).map((asset: any) => ({
          loc: `/asset/${asset.ticker}`,
          lastmod: new Date().toISOString(),
          changefreq: 'daily',
          priority: 0.7,
        }))
        
        return [...staticUrls, ...assetUrls]
      } catch (error) {
        console.warn('[Sitemap] Erro ao buscar ativos da API, usando apenas URLs estáticas')
        return staticUrls
      }
    },
    exclude: [
      // Páginas de autenticação
      '/auth/**',
      '/auth/login',
      '/auth/register',
      
      // Áreas privadas
      '/wallet',
      '/settings',
      '/search',
      '/help',
      '/calculadora',
      '/step-by-step',
      '/planejador',
      '/dividends',
      '/ideal',
    ],
  },
  runtimeConfig: {
    public: {
      cacheTempInSeconds: 60,
    }
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
        'neutral'
      ],
      defaultVariants: {
        color: 'primary'
      }
    },
  },
  app: {
    head: {
      title: 'Redentia',
      htmlAttrs: {
        lang: 'en',
        class: 'dark'
      },
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
      charset: 'utf-8',
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Sora:wght@100..800&display=swap'
        },
        { rel: 'icon', type: 'image/png', href: '/favicon.png' }
      ],
    },

  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Redentia',
      short_name: 'Redentia',
      description: ' A única plataforma de finanças realmente inteligente, com tudo para gerenciar seus investimentos de forma rápida e fácil.',
      theme_color: '#000',
      start_url: '/',
      launch_handler: { client_mode: ["focus-existing", "navigate-existing"] },
      display: 'standalone',
      orientation: "portrait",
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
          src: "/screenshots/desktop.png",
          sizes: "1611x950",
          type: "image/png",
          form_factor: "wide"
        },
        {
          src: "/screenshots/mobile.png",
          sizes: "510x950",
          type: "image/png",
          form_factor: "narrow"
        },
      ]
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: false,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    }
  }
})
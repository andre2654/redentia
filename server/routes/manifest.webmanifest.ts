/**
 * Web App Manifest dinâmico — resolve tenant pelo Host header e devolve
 * JSON formatado pra o browser ativar PWA install.
 *
 * Por que dinâmico (não estático em public/):
 *   - Cada tenant (Redentia, Primo Rico, Norte, AUVP, ...) tem brand
 *     próprio: name, theme_color, icons distintos.
 *   - Servir manifest fixo daria install com brand errado em white-label.
 *
 * Como funciona:
 *   1. Lê `host` header (já normalizado pelo middleware 0-tenant-resolver)
 *   2. Chama `/api/brand/resolve-by-host?host=...` (cache 60s Redis no backend)
 *   3. Renderiza manifest combinando dados do tenant + estrutura compartilhada
 *      (shortcuts, widgets, share_target — iguais pra todos os tenants)
 *
 * Cache HTTP:
 *   max-age=86400 (24h) — brand muda raramente
 *   stale-while-revalidate=3600 — serve stale enquanto refresh em bg
 *
 * Veja Obsidian-Vault/Redentia/PWA-Widgets/04 - Day 1 — Manifest + SW.md
 */

interface BrandConfig {
  name: string
  short_name?: string
  description?: string
  colors?: {
    primary?: string
    background?: string
  }
  logo?: {
    icon?: string
  }
}

// Shortcuts são iguais pra todos os tenants — fazem parte do produto,
// não do branding.
const SHARED_SHORTCUTS = [
  {
    name: 'Análise do dia',
    short_name: 'Hoje',
    description: 'Resumo do mercado e fatores que estão mexendo agora',
    url: '/para-voce',
    icons: [{ src: '/icons/shortcut-today.png', sizes: '96x96', type: 'image/png' }],
  },
  {
    name: 'Minha carteira',
    short_name: 'Carteira',
    description: 'P&L do dia + dividendos + alertas pendentes',
    url: '/wallet/hoje',
    icons: [{ src: '/icons/shortcut-wallet.png', sizes: '96x96', type: 'image/png' }],
  },
  {
    name: 'Chat IA',
    short_name: 'Chat',
    description: 'Tira dúvidas com a IA financeira da Redentia',
    url: '/help',
    icons: [{ src: '/icons/shortcut-chat.png', sizes: '96x96', type: 'image/png' }],
  },
  {
    name: 'Raio-X',
    short_name: 'Raio-X',
    description: 'Análise instantânea da sua carteira',
    url: '/raio-x',
    icons: [{ src: '/icons/shortcut-scan.png', sizes: '96x96', type: 'image/png' }],
  },
]

// Widgets PWA Adaptive Cards (Windows 11 Widget Board).
// Templates JSON ficam em public/widgets/. Detalhes no Day 4.
const SHARED_WIDGETS = [
  {
    name: 'Pulso do mercado',
    description: 'IBOV agora + 3 fatores movendo carteiras',
    tag: 'market-pulse',
    template: 'market-pulse',
    ms_ac_template: '/widgets/market-pulse.json',
    data: 'https://redentia-api.saraivada.com/api/widgets/market-pulse',
    type: 'application/json',
    screenshots: [
      { src: '/widgets/preview-market-light.png', sizes: '600x400', label: 'Light mode' },
      { src: '/widgets/preview-market-dark.png', sizes: '600x400', label: 'Dark mode' },
    ],
    icons: [{ src: '/widgets/icon-256.png', sizes: '256x256' }],
    auth: false,
    update: 900, // 15min
  },
  {
    name: 'Sua carteira hoje',
    description: 'P&L do dia + dividendos + alertas',
    tag: 'portfolio-pulse',
    template: 'portfolio-pulse',
    ms_ac_template: '/widgets/portfolio-pulse.json',
    data: 'https://redentia-api.saraivada.com/api/widgets/portfolio-pulse',
    type: 'application/json',
    screenshots: [
      { src: '/widgets/preview-portfolio-light.png', sizes: '600x400', label: 'Light mode' },
    ],
    icons: [{ src: '/widgets/icon-256.png', sizes: '256x256' }],
    auth: true,
    update: 900,
  },
]

async function fetchBrandByHost(host: string): Promise<BrandConfig | null> {
  const config = useRuntimeConfig()
  const apiBase = ((config.public?.apiBaseUrl as string) || 'https://redentia-api.saraivada.com/api').replace(/\/$/, '')

  try {
    const resp = await $fetch<{ data: BrandConfig }>(
      `${apiBase}/brand/resolve-by-host?host=${encodeURIComponent(host)}`,
      {
        timeout: 3000,
        retry: 1,
        headers: { Accept: 'application/json' },
      },
    )
    return resp?.data ?? null
  } catch {
    // Backend down / 404 → cai no default Redentia
    return null
  }
}

export default defineEventHandler(async (event) => {
  const rawHost = getHeader(event, 'host') ?? 'redentia.com.br'
  // `split(':')` sempre retorna array com ≥1 elemento; o `?? rawHost`
  // calma o strict-null-check do TS sem mudar comportamento real.
  const host = (rawHost.split(':')[0] ?? rawHost).toLowerCase()

  const brand = await fetchBrandByHost(host)

  const name = brand?.name ?? 'Redentia'
  const shortName = brand?.short_name ?? (name.length <= 12 ? name : 'Redentia')
  const description = brand?.description ?? 'Do caos do mercado ao impacto na sua carteira'
  const themeColor = brand?.colors?.primary ?? '#D8881A'
  const backgroundColor = brand?.colors?.background ?? '#FAF8F4'

  setHeader(event, 'Content-Type', 'application/manifest+json; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600')

  return {
    name,
    short_name: shortName,
    description,
    start_url: '/?utm_source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone'],
    orientation: 'natural',
    theme_color: themeColor,
    background_color: backgroundColor,
    lang: 'pt-BR',
    dir: 'ltr',
    categories: ['finance', 'productivity', 'business'],

    icons: [
      { src: '/icons/192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
      { src: '/icons/512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/1024.png', sizes: '1024x1024', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],

    screenshots: [
      {
        src: '/screenshots/desktop-home.png',
        sizes: '1280x800',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Análise do dia',
      },
      {
        src: '/screenshots/desktop-wallet.png',
        sizes: '1280x800',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Minha carteira',
      },
      {
        src: '/screenshots/mobile-home.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Análise do dia',
      },
      {
        src: '/screenshots/mobile-wallet.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Carteira',
      },
    ],

    shortcuts: SHARED_SHORTCUTS,
    widgets: SHARED_WIDGETS,

    share_target: {
      action: '/share-target',
      method: 'GET',
      enctype: 'application/x-www-form-urlencoded',
      params: { title: 'title', text: 'text', url: 'url' },
    },

    protocol_handlers: [{ protocol: 'web+redentia', url: '/share-target?url=%s' }],

    prefer_related_applications: false,
  }
})

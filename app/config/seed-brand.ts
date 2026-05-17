/**
 * seed-brand.ts — fallback minimal de brand pra nunca renderizar tela
 * branca. Usado quando:
 *
 *   1. API `/api/brand/resolve-by-host` está down/lenta no SSR
 *   2. Hydration inicial sem state populado (race condition rara)
 *   3. Dev local com backend offline
 *
 * Filosofia: pequeno o suficiente pra ser leve no bundle (~3KB),
 * grande o suficiente pra renderizar layouts default sem null
 * checks em todos os componentes. Cores neutras, copy genérica
 * Redentia, features mínimas.
 *
 * NUNCA é renderizado em produção quando o stack está saudável —
 * todo request passa pelo middleware → API → Redis cache.
 *
 * Em comparação: o `brand.ts` legacy tinha 4.355 linhas. Esse aqui
 * tem ~150. A fonte canônica do brand é o backend (tabela `tenants`).
 */

export const seedBrand = {
  // Identidade
  slug: 'redentia',
  name: 'Redentia',
  shortName: 'Redentia',
  domain: 'www.redentia.com.br',
  url: 'https://www.redentia.com.br',
  tagline: 'Investir com inteligência.',
  description: 'Plataforma de investimentos com inteligência artificial.',
  isMaster: true,

  // Cores Redentia v3 — amber Bloomberg em dark warm. Seed alinha com
  // a config canônica do tenant master no banco. Caso fallback dispare
  // (API down), o user vê a marca correta, não cores estranhas.
  colors: {
    primary: '#F5A623',           // amber Bloomberg (accent, actionable)
    secondary: '#FFC555',         // amber bright (hover / emphasis)
    tertiary: '#14161C',          // charcoal elevated
    positive: '#00D395',          // terminal cyan-green
    negative: '#FF4747',          // saturated red
    neutral: '#8B92A7',           // warm muted
    background: '#0A0B0E',        // off-black warm (não é preto puro)
    surface: '#14161C',           // charcoal elevated
    surfaceHover: '#1B1E26',      // elevated on hover
    border: '#2A2E39',            // subtle warm border
    text: '#E8EAED',              // off-white warm
    textMuted: '#8B92A7',
    inputBg: '#0F1116',
    inputBgHover: '#14161C',
    inputBorder: '#2A2E39',
    gradient: { from: '#F5A623', via: '#FFC555', to: '#FFE082' },
  },

  // Tipografia (system fallback enquanto Google Font carrega)
  font: {
    family: 'Inter',
    google: 'Inter:wght@300..800',
    headingWeight: 'font-bold',
    headingStyle: 'normal-case',
  },

  // Logos (paths que existem no bundle Vercel)
  //
  // Naming convention dos arquivos: `dark-logo*` = logo PRETO
  // (pra fundo claro); `light-logo*` = logo BRANCO (pra fundo escuro).
  // O nome reflete a COR do logo, nao a superficie.
  //
  // BrandLogo.vue requer AMBOS `fullLight` + `fullDark` (e idem
  // pra icon) pra evitar o legacy "pill" colorido em light mode.
  // Onde sao usados:
  //   - fullLight/iconLight: html.light  -> asset PRETO
  //   - fullDark/iconDark:   html.dark   -> asset BRANCO
  logo: {
    icon: '/brand/logo-icon.svg',
    full: '/brand/logo-full.svg',
    iconLight: '/brand/redentia/dark-logo-icon.png',   // black icon for light surface
    iconDark: '/brand/redentia/light-logo-icon.png',   // white icon for dark surface
    fullLight: '/brand/redentia/dark-logo.png',        // black wordmark for light surface
    fullDark: '/brand/redentia/light-logo.png',        // white wordmark for dark surface
    email: '/brand/redentia/dark-logo.png',
    favicon: '/brand/favicon.png',
    faviconIco: '/brand/favicon.ico',
    faviconSvg: '/brand/favicon.svg',
    appleTouchIcon: '/brand/apple-touch-icon.png',
    icon192: '/brand/icon-192.png',
    icon512: '/brand/icon-512.png',
    og: '/brand/og-image.png',
  },

  // Suporte
  support: {
    email: 'contato@redentia.com.br',
  },
  email: 'contato@redentia.com.br',

  // Empresa
  company: {
    legalName: 'Redentia Tecnologia Ltda.',
  },

  // Billing
  billing: { enabled: false, currency: 'BRL', trial_days_pro: 7 },

  // === Features mínimas pra layouts não quebrarem ===
  features: {
    showAIAdvisor: true,
    showCalculators: true,
    showDividends: true,
    showNews: true,
    showGuides: true,
    showGlossary: true,
    // Phase 6.x: master unico `showApp` substitui showAppStoreLinks +
    // showDownloadPage (mantidos como aliases backward-compat).
    showApp: false,
    showAppStoreLinks: false,
    showDownloadPage: false,
    showFounderPhoto: false,
    showEcosystemLinks: false,
    showDividendYieldRanking: false,
    showMonthlyMoversRanking: false,
    showDividendCalendar: false,
    showSectorComparatives: false,
    showMarketCommentaries: false,
    // View editorial filtrada (/para-voce) + toggle "Para você | Mercado completo"
    // na home. Default OFF — cada tenant decide se quer expor.
    showParaVoce: false,
  },

  // Sub-objetos vazios pra não null-check em todos lados
  social: {
    youtube: '',
    instagram: '',
    twitter: '',
    tiktok: '',
    telegram: '',
    podcast: '',
  },
  devPortalLinks: [],
  seo: {
    title: 'Redentia',
    description: 'Plataforma de investimentos com IA',
    locale: 'pt_BR',
    lang: 'pt-BR',
    themeColor: '#000000',
    keywords: ['redentia', 'investimentos'],
  },
  nav: {
    menuLabel: 'Menu',
    toolsLabel: 'Ferramentas',
    overview: 'Visão Geral',
    wallet: 'Sua carteira',
    chat: 'Chat',
    settings: 'Configurações',
    advisorArea: 'Área do assessor',
    calculators: 'Calculadoras',
    guides: 'Guias',
    dividends: 'Proventos',
    login: 'Entrar',
    logout: 'Sair',
    register: 'Cadastrar',
    show: 'Mostrar',
    hide: 'Ocultar',
    downloadApp: 'Baixar app',
    footerCopyright: 'Todos os direitos reservados.',
    footerTerms: 'Termos de Uso',
    footerPrivacy: 'Privacidade',
    footerCookies: 'Cookies',
    footerAbout: 'Sobre',
    footerContact: 'Contato',
  },
  voice: {
    style: 'premium',
    greeting: 'Olá! Como posso ajudar?',
    ctaPrimary: 'Começar agora',
    ctaSecondary: 'Já tenho conta',
    emptyState: 'Nenhum dado disponível.',
    encouragement: 'Continue acompanhando seus investimentos.',
    error: 'Algo deu errado. Tente novamente.',
  },
  header: { title: 'Redentia', subtitle: 'Plataforma de investimentos' },
  footer: {
    tagline: 'Investir com inteligência.',
    sections: { legal: 'Legal', tools: 'Ferramentas', company: 'Empresa', resources: 'Recursos' },
    newsletterCta: '',
  },
  homePage: {
    rankingCard: { variant: 'flat', showIcon: true, iconStyle: 'bare', itemsPerCategory: 5 },
    stockItem: { variant: 'default', showLogo: true, logoSize: 'md', showName: true, changeFormat: 'percent' },
    categoryCard: { variant: 'icon-left', columns: 3 },
    categories: [],
  },
  assetPage: {
    showVolatility: true,
    showIndicators: true,
    showSmartIndicators: true,
    showDividendMap: true,
    showDividendChart: true,
    showFinancials: true,
    showChecklist: true,
    showCompanyInfo: true,
    showNews: true,
  },
  hero: { variant: 'centered', title: 'Investir com inteligência.' },
  founder: { name: '', role: '', photo: '', bio: '', signaturePhrase: '' },
  ecosystem: [],
  chartColors: { positive: '#4ADE80', negative: '#8E3939', neutral: '#6B7280', secondary: '#3B82F6' },
  // themes.light habilita toggle dark/light. Sem essa key (ou vazio),
  // o plugin trata como single-mode e pina no defaultMode.
  themes: {
    light: {
      primary: '#D8881A',
      secondary: '#F5A623',
      tertiary: '#FFFFFF',
      positive: '#0AAE7C',
      negative: '#E0353D',
      neutral: '#5A6378',
      background: '#FAFAFB',
      surface: '#FFFFFF',
      surfaceHover: '#F2F4F7',
      border: '#E4E7EC',
      text: '#0F1116',
      textMuted: '#5A6378',
      inputBg: '#FFFFFF',
      inputBgHover: '#F8F9FB',
      inputBorder: '#D5DAE3',
      gradient: { from: '#D8881A', via: '#F5A623', to: '#FFC555' },
    },
  },
  extras: {},

  // === Home page sections (ordem + visibilidade) ===
  // Componentes leem brand.homeSections.find(...). Default
  // mostra hero + market + categories — minimum viable home.
  homeSections: [
    { id: 'hero', visible: true },
    { id: 'trustBar', visible: false },
    { id: 'market', visible: true },
    { id: 'metrics', visible: false },
    { id: 'featureTabs', visible: false },
    { id: 'categories', visible: true },
    { id: 'aiCta', visible: false },
    { id: 'educational', visible: false },
    { id: 'products', visible: false },
    { id: 'guides', visible: false },
    { id: 'testimonials', visible: false },
    { id: 'marquee', visible: false },
    { id: 'faq', visible: true },  // FAQ no fim, ancora long-tail SEO
  ],

  // === Theme metadata (consumido por plugins/brand.ts) ===
  // borderRadius, animation, backgroundPattern são strings que mapeiam
  // pra constantes CSS no plugin. Defaults conservadores Redentia.
  // mode é mutável via toggle dark/light; defaultMode é o mode "natural"
  // do tenant (single-mode tenants ficam pinados nele).
  defaultMode: 'dark' as 'dark' | 'light',
  theme: {
    mode: 'dark' as 'dark' | 'light',
    borderRadius: 'rounded' as 'sharp' | 'rounded' | 'pill' | 'soft',
    animation: 'smooth' as 'fast' | 'smooth' | 'sluggish',
    backgroundPattern: 'gradient' as 'none' | 'gradient' | 'noise' | 'grid' | 'dots',
  },
} as const

export type SeedBrand = typeof seedBrand

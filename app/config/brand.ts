/**
 * REDENTIA WHITELABEL — Brand Configuration
 *
 * Este e o UNICO arquivo que precisa ser editado para personalizar
 * toda a plataforma para um novo cliente/influenciador.
 *
 * Marcas disponiveis: 'redentia' | 'primo-rico' | 'me-poupe' | 'investidor-sardinha'
 *
 * A marca padrao e definida por ACTIVE_BRAND abaixo ('redentia').
 * Para trocar em runtime, passe ?brand=primo-rico na URL.
 * Toda a plataforma se adapta automaticamente: cores, fontes, logos,
 * textos, SEO, links sociais, feature flags, etc.
 *
 * ---
 * O produto e o mesmo, a narrativa muda tudo.
 * A mesma calculadora de juros compostos vira "Simulador do Primo",
 * "Quanto a Margarete precisa render?" ou "Ferramenta AUVP".
 * Dark mode e obrigatorio. Uma unica cor de destaque carrega toda a personalidade.
 * Nenhuma dessas marcas funciona sem a pessoa por tras.
 * Todas evitam azul corporativo — verde, amarelo e vermelho, nunca azul banco.
 * ---
 */

// ============================================================
// TROQUE AQUI PARA MUDAR A MARCA
// ============================================================
const ACTIVE_BRAND: BrandSlug = 'redentia'

// ============================================================
// TYPES
// ============================================================
type BrandSlug = 'redentia' | 'primo-rico' | 'me-poupe' | 'investidor-sardinha' | 'norte-capital'

interface BrandColors {
  primary: string
  secondary: string
  tertiary: string
  positive: string
  negative: string
  neutral: string
  background: string
  surface: string
  surfaceHover: string
  border: string
  text: string
  textMuted: string
  inputBg: string
  inputBgHover: string
  inputBorder: string
  logoBg?: string
  gradient: { from: string; via: string; to: string }
}

interface BrandConfig {
  // === IDENTIDADE ===
  name: string
  shortName: string
  slug: BrandSlug
  tagline: string
  subtitle: string
  description: string

  // === PERSONA DO INFLUENCIADOR ===
  founder: {
    name: string
    photo: string            // path para foto do influenciador
    role: string             // "Educador financeiro", "CEO & Fundadora", etc.
    bio: string
    signaturePhrase: string  // frase iconica
  }

  // === TOM DE VOZ ===
  voice: {
    style: string            // 'premium' | 'pop' | 'tecnico'
    greeting: string         // "E ai, primo!" / "Oi, menina!" / "Fala, sardinha!"
    ctaPrimary: string       // Texto do botao principal
    ctaSecondary: string     // Texto do botao secundario
    emptyState: string       // Mensagem quando nao ha dados
    encouragement: string    // Frase motivacional para engajar
    error: string            // Mensagem de erro amigavel
  }

  // === URLS ===
  domain: string
  url: string
  email: string
  privacyEmail: string

  // === CORES ===
  colors: BrandColors

  // === TIPOGRAFIA ===
  font: {
    family: string
    google: string
    headingWeight: string    // 'font-extrabold' / 'font-black' / 'font-bold'
    headingStyle: string     // 'uppercase tracking-wide' / 'normal-case' / 'uppercase tracking-wider'
  }

  // === ASSETS ===
  logo: {
    icon: string
    full: string
    favicon: string
    faviconIco: string
    faviconSvg: string
    appleTouchIcon: string
    icon192: string
    icon512: string
    og: string
  }

  // === SEO ===
  seo: {
    title: string
    description: string
    locale: string
    lang: string
    themeColor: string
    keywords: string[]
  }

  // === INSTITUCIONAL ===
  company: {
    legalName: string
    address: string
    cnpj: string
  }

  // === FEATURE FLAGS ===
  features: {
    showAIAdvisor: boolean
    showAppStoreLinks: boolean
    showCalculators: boolean
    showDividends: boolean
    showNews: boolean
    showDownloadPage: boolean
    showFounderPhoto: boolean
    showEcosystemLinks: boolean
    showGlossary: boolean
    showGuides: boolean
    // --- SEO programático / páginas de dados ---
    // Controla se os rankings de DY aparecem na sidebar, guias e sitemap.
    showDividendYieldRanking: boolean
    // Controla rankings de altas/baixas do mês. Público leigo ou tese de
    // longo prazo devem manter OFF para não estimular timing de mercado.
    showMonthlyMoversRanking: boolean
    // Calendário de dividendos (página /dividendos/calendario).
    showDividendCalendar: boolean
    // Comparativos setoriais (páginas /setor/*).
    showSectorComparatives: boolean
    // Commentaries AI nas páginas de asset (seção "Movimentos notáveis").
    // Explica movimentos de curto prazo — pode conflitar com buy and hold.
    showMarketCommentaries: boolean
  }

  // === HOME PAGE ===
  homePage: {
    rankingCard: {
      variant: 'flat' | 'card' | 'border-left'
      showIcon: boolean
      iconStyle: 'bare' | 'pill' | 'none'
      itemsPerCategory: number
    }
    stockItem: {
      variant: 'default' | 'compact' | 'detailed'
      showLogo: boolean
      logoSize: 'sm' | 'md' | 'lg'
      showName: boolean
      changeFormat: 'percent' | 'both' | 'text'
    }
    categoryCard: {
      variant: 'icon-left' | 'icon-top' | 'minimal'
      columns: 2 | 3
    }
    categories: Array<{
      label: string
      to: string
      icon: string
      description: string
      cta: string
    }>
  }

  // === ASSET PAGE SECTIONS ===
  assetPage: {
    showVolatility: boolean
    showIndicators: boolean
    showSmartIndicators: boolean
    showDividendMap: boolean
    showDividendChart: boolean
    showFinancials: boolean
    showChecklist: boolean
    showCompanyInfo: boolean
    showMarketCommentaries?: boolean
    // Visual variant — 'default' keeps the terminal/card layout used by
    // Redentia. 'editorial' switches to the narrated column layout used
    // by Norte Capital (private-bank "letter from your advisor"). 'mentor'
    // switches to the aspirational masterclass/book-cover layout used by
    // Primo Rico. 'research' switches to the AUVP academic paper layout
    // used by Investidor Sardinha (IBM Plex serif, § section marks, red
    // pen marks, footnotes, margin notes, author signature).
    variant?: 'default' | 'editorial' | 'mentor' | 'research' | 'showtime'
  }

  // === SOCIAL ===
  social: {
    youtube: string
    instagram: string
    twitter: string
    tiktok: string
    telegram: string
    podcast: string
  }

  // === ECOSSISTEMA DE PRODUTOS ===
  ecosystem: Array<{
    name: string
    url: string
    description: string
    icon: string
  }>

  // === CHART COLORS ===
  chartColors: {
    positive: string
    negative: string
    secondary: string
    neutral: string
  }

  // === PERSONALIZACOES POR AREA ===

  // HERO (pagina inicial, visitante nao logado)
  hero: {
    variant: 'centered' | 'split' | 'minimal' | 'institutional' | 'editorial' | 'terminal' | 'mentor' | 'research' | 'showtime'  // layout do hero: centered (premium), split (founder), minimal (data-first), institutional (assessoria/escritorio), editorial (narrated private-bank letter — Norte Capital), terminal (Bloomberg-reimagined — Redentia), mentor (aspirational book-cover — Primo Rico), research (academic paper / AUVP study notebook — Investidor Sardinha), showtime (TV show / pop magazine — Me Poupe!)
    badge: string                // texto do badge animado no topo
    title: string                // headline principal (pode usar HTML)
    subtitle: string             // subtitulo
    founderQuote: string         // frase assinatura do fundador (exibida no hero)
    ctaLabel: string             // label do botao principal
    ctaSecondaryLabel: string    // label do botao secundario
    ctaIcon: string              // icone do botao principal
    trustIndicators: string[]    // textos dos indicadores de confianca
    image?: string               // imagem do founder/brand no hero (ex: foto da Nathalia no split)
  }

  // HEADER (barra superior quando logado)
  header: {
    title: string                // texto principal no header
    subtitle: string             // subtexto no header
  }

  // SIDEBAR (navegacao lateral desktop)
  sidebar: {
    aiCtaTitle: string           // titulo do CTA de IA
    aiCtaSubtitle: string        // subtitulo do CTA de IA
    planLabel: string            // "Plano gratuito" / "Acesso Me Poupe!" / "Membro AUVP"
  }

  // CALCULADORAS
  calculators: {
    pageTitle: string
    pageSubtitle: string
    labels: {
      jurosCompostos: string
      precoTeto: string
      dividendYield: string
      aposentadoria: string
      acoes: string
      quantoInvestir: string
      impostoRenda: string
      planejamento: string
    }
  }

  // ASSESSORIA COM IA
  ai: {
    name: string                 // nome do assistente ("Assessor Primo", "Conselheira Me Poupe!", "Analista AUVP")
    avatar: string               // path para avatar do assistente
    chatTitle: string            // titulo na tela do chat ("Pergunte ao Primo")
    chatSubtitle: string         // subtitulo na tela do chat
    typingLabel: string          // label durante digitacao ("ASSESSOR PRIMO:")
    welcomeTitle: string
    welcomeSubtitle: string
    placeholder: string          // placeholder do input de chat
    suggestedQuestions: string[] // perguntas sugeridas
    systemPromptContext: string  // contexto extra para o system prompt da IA
    ctaGreeting: string          // mensagem no preview do chat ("Ola! Sou...")
    ctaButton: string            // texto do botao CTA ("Comecar a Perguntar" / "Pergunte ao Primo")
    ctaFeatures: string[]        // features exibidas no CTA (["Resposta em ~3s", "IA Treinada", "Ilimitado"])
  }

  // METRICAS (secao de numeros na home)
  metrics: {
    sectionTitle: string
    sectionSubtitle: string
    counterLabel: string         // "Analises realizadas no Primo Rico"
    stats: Array<{ value: string; label: string }>
  }

  // DEPOIMENTOS
  testimonials: {
    sectionTitle: string
    sectionSubtitle: string
    items: Array<{
      quote: string
      name: string
      role: string
      metrics: Array<{ value: string; label: string }>
    }>
  }

  // TRUST BAR (barra de corretoras/parceiros)
  trustBar: {
    text: string
    footnote: string
    partners: string[]
  }

  // FOOTER
  footer: {
    tagline: string
    newsletterCta: string
    sections: {
      tools: string
      resources: string
      company: string
      legal: string
    }
  }

  // NOTIFICACOES
  notifications: {
    ctaTitle: string
    ctaSubtitle: string
    ctaButton: string
  }

  // AUTH (login/registro)
  auth: {
    loginTitle: string
    loginSubtitle: string
    registerTitle: string
    registerSubtitle: string
    termsText: string
  }

  // PAGINA SOBRE
  about: {
    title: string
    paragraphs: string[]
  }

  // PAGINA CONTATO
  contact: {
    title: string
    subtitle: string
    email: string
    channels: Array<{ icon: string; label: string; value: string; href: string }>
  }

  // PAGINA COMO FUNCIONA
  howWorks: {
    title: string
    steps: Array<{ icon: string; title: string; description: string }>
  }

  // === NAVEGACAO E LABELS DE UI ===
  nav: {
    // Sidebar (menu lateral desktop)
    menuLabel: string              // "Menu" — label da secao de menu
    toolsLabel: string             // "Ferramentas" — label da secao de ferramentas
    overview: string               // "Visao Geral"
    wallet: string                 // "Sua carteira"
    chat: string                   // "Chat"
    advisorArea: string            // "Area do assessor"
    settings: string               // "Configuracoes"
    calculators: string            // "Calculadoras"
    guides: string                 // "Guias"
    dividends: string              // "Proventos"
    downloadApp: string            // "Baixar app"
    logout: string                 // "Sair"
    hide: string                   // "Ocultar"
    show: string                   // "Mostrar"
    login: string                  // "Entrar"
    register: string               // "Cadastrar"
    // Mobile menu
    mobileAiLabel: string          // "Assessoria IA"
    mobileAiAccess: string         // "Acesse de graca"
    mobileAiLocked: string         // "Assessoria IA bloqueada"
    mobileAiLockedSub: string      // "Faca login para acessar"
    mobileAiDescription: string    // "Assessoria com Inteligencia Artificial"
    mobileAiDescriptionSub: string // "Entre na plataforma para conversar com a IA..."
    mobileCalc: string             // "Calculadora inteligente"
    mobileGuides: string           // "Guias de investimento"
    mobileHome: string             // "Inicio"
    // Footer
    footerGlossaryTitle: string    // "Termos do Mercado"
    footerCalc: string             // "Calculadoras"
    footerJuros: string            // "Juros Compostos"
    footerPrecoTeto: string        // "Preco Teto"
    footerDY: string               // "Dividend Yield"
    footerAI: string               // "Assessoria IA"
    footerGuides: string           // "Guias de Investimento"
    footerGlossary: string         // "Glossario"
    footerStocks: string           // "Acoes"
    footerFiis: string             // "FIIs"
    footerDividends: string        // "Dividendos"
    footerAbout: string            // "Sobre"
    footerHowWorks: string         // "Como funciona"
    footerContact: string          // "Contato"
    footerDownload: string         // "Download"
    footerTerms: string            // "Termos de Uso"
    footerPrivacy: string          // "Privacidade"
    footerCookies: string          // "Cookies"
    footerCopyright: string        // "Todos os direitos reservados."
    // Unauthenticated header
    headerCalc: string             // "Calculadoras"
    headerAI: string               // "Assessoria com IA"
  }

  // === TEXTOS DA HOME (secoes que antes eram hardcoded) ===
  homeTexts: {
    marketTitle: string          // "O mercado em tempo real"
    marketSubtitle: string       // "Altas, baixas e oportunidades..."
    filtersTitle: string         // "Filtros inteligentes"
    categoriesEyebrow: string   // "Explore por categoria"
    categoriesTitle: string     // "Encontre seu proximo investimento"
    categoriesSubtitle: string  // "Tudo que voce precisa..."
    guidesTitle: string         // "Conhecimento que gera resultados"
    guidesSubtitle: string      // "Guias praticos..."
    aiCtaEyebrow: string        // "Assessoria com IA"
    aiCtaTitle: string          // "Tire suas duvidas em segundos"
    aiCtaSubtitle: string       // "Pergunte qualquer coisa..."
    aiCtaQuestions: Array<{ icon: string; question: string; category: string }>
  }

  // === TEMA VISUAL ===
  theme: {
    mode: 'dark' | 'light' | 'both'     // modo suportado
    borderRadius: 'rounded' | 'sharp' | 'pill'  // 'rounded' = rounded-2xl (16px), 'sharp' = rounded-lg (8px), 'pill' = rounded-3xl (24px)
    animation: 'smooth' | 'snappy' | 'none'     // intensidade de animacoes
    backgroundPattern: 'none' | 'grid' | 'dots' | 'gradient' | 'noise'  // textura de fundo
  }

  // === PERSONAGENS / MASCOTES DA MARCA (opcional) ===
  characters?: {
    sectionTitle: string
    sectionSubtitle: string
    items: Array<{
      name: string                 // "Margarete", "Sidnelson", "Juro Composto"
      emoji: string                // icone ou emoji visual
      role: string                 // "A espada da verdade"
      color: string                // cor de destaque do personagem
      catchphrase: string          // fala iconica
      description: string          // quem e e o que faz
      cta: string                  // texto do botao
      ctaLink: string              // link de destino
      personality: 'hero' | 'villain' | 'ally'  // muda o visual do card
    }>
  }

  // === CHECKLIST DO INVESTIDOR NA HOME (opcional) ===
  investorChecklist?: {
    sectionTitle: string
    sectionSubtitle: string
    steps: Array<{
      number: number                // numero do passo (1, 2, 3...)
      title: string                 // "Monte sua reserva de emergencia"
      description: string           // descricao curta do passo
      icon: string                  // icone Lucide
      status: 'locked' | 'available' | 'recommended'  // estado visual do step
      ctaText: string               // "Saiba mais"
      ctaLink: string               // link de destino
    }>
    footerText: string              // texto de rodape da secao
    footerLink: string              // link do rodape
    footerLinkText: string          // texto do link
  }

  // === CALCULADORA DE IMPACTO NA HOME (opcional) ===
  wealthCalculator?: {
    sectionTitle: string
    sectionSubtitle: string
    defaultAge: number              // idade inicial do slider
    compareAge: number              // idade de comparacao
    defaultMonthly: number          // aporte mensal padrao
    annualRate: number              // taxa anual (ex: 0.10 = 10%)
    targetAge: number               // idade alvo (ex: 65)
    ctaText: string                 // "Comece agora"
    ctaLink: string                 // "/calculadora/juros-compostos"
    labels: {
      ageSlider: string             // "Idade de inicio"
      monthlySlider: string         // "Aporte mensal"
      resultPrefix: string          // "Aos 65 anos voce tera"
      comparisonText: string        // "Quem comeca aos {age} perde {diff}"
      timeLabel: string             // "anos investindo"
    }
  }

  // === META / FACEBOOK PIXEL ===
  meta?: {
    pixelId?: string
    accessToken?: string
  }

  // === SECOES DA HOME (ordem e visibilidade) ===
  // A ordem no array define a ordem de exibicao na home.
  // Cada secao pode ser ativada/desativada individualmente.
  homeSections: Array<{
    id: 'hero' | 'trustBar' | 'market' | 'categories' | 'guides' | 'metrics' | 'featureTabs' | 'marquee' | 'testimonials' | 'aiCta' | 'educational' | 'products' | 'wealthCalculator' | 'characters' | 'investorChecklist' | 'apiProduct' | 'creativeProduct'
    visible: boolean
  }>

  // === CONTEUDO EDUCACIONAL (videos/artigos do criador) ===
  educational: {
    sectionTitle: string
    sectionSubtitle: string
    items: Array<{
      type: 'video' | 'article' | 'podcast'
      title: string
      description: string
      thumbnail: string          // URL da thumbnail
      url: string                // URL do conteudo (YouTube, blog, etc.)
      duration?: string          // "12:34" para videos, "5 min" para artigos
      badge?: string             // "Novo", "Popular", "Exclusivo"
    }>
  }

  // === PRODUTOS E CURSOS (carrossel estilo Netflix) ===
  products: {
    sectionTitle: string
    sectionSubtitle: string
    categories: Array<{
      name: string               // "Cursos", "Mentorias", "Ferramentas"
      items: Array<{
        title: string
        description: string
        image: string            // thumbnail/cover
        url: string              // link externo para o produto
        price?: string           // "R$ 997" ou "Gratuito"
        badge?: string           // "Bestseller", "Novo", "Desconto"
        rating?: number          // 4.8
        students?: string        // "12.000+ alunos"
      }>
    }>
  }
}

// ============================================================
// PRIMO RICO (Thiago Nigro)
// ============================================================
// Persona: O mentor premium que ja chegou la. Aspiracional, direto,
// provocativo. "Do mil ao milhao" — jornada do investidor comum
// ao patrimonio relevante. Estetica dark premium + verde maca.
// Tipografia: Montserrat bold — moderna, limpa, premium.
// ============================================================
const primoRico: BrandConfig = {
  name: 'Primo Rico',
  shortName: 'Primo',
  slug: 'primo-rico',
  tagline: 'Do mil ao milhao. A escolha e sua.',
  subtitle: 'Investir com inteligencia',
  description: 'A plataforma do Primo Rico para acompanhar cotacoes, dividendos e analises de acoes e FIIs.',

  founder: {
    name: 'Thiago Nigro',
    photo: '/brand/founder.webp',
    role: 'Educador financeiro & Investidor',
    bio: 'Autor do best-seller "Do Mil ao Milhao", maior canal de financas do Brasil com mais de 7 milhoes de inscritos.',
    signaturePhrase: 'Liberdade ou mediocridade: a escolha e sua.',
  },

  voice: {
    style: 'premium',
    greeting: 'E ai, primo!',
    ctaPrimary: 'Construir patrimonio',
    ctaSecondary: 'Ja tenho conta',
    emptyState: 'Nenhum dado disponivel. O mercado nao espera — volte em instantes.',
    encouragement: 'Patrimonio se constroi com consistencia, nao com sorte. Skin in the game.',
    error: 'Algo deu errado. Estamos corrigindo. Volte em instantes.',
  },

  domain: 'www.primorico.com.br',
  url: 'https://www.primorico.com.br',
  email: 'contato@primorico.com.br',
  privacyEmail: 'privacidade@primorico.com.br',

  colors: {
    primary: '#FF5900',
    secondary: '#E55000',
    tertiary: '#0A0A0A',
    positive: '#4ADE80',
    negative: '#EF4444',
    neutral: '#6B7280',
    background: '#000000',
    surface: '#0A0A0A',
    surfaceHover: '#131313',
    border: '#1F1F1F',
    text: '#FFFFFF',
    textMuted: '#9CA3AF',
    inputBg: '#05070b',
    inputBgHover: '#070b12',
    inputBorder: '#1f2937',
    gradient: { from: '#FF5900', via: '#E55000', to: '#CC4700' },
  },

  font: {
    family: 'Montserrat',
    google: 'Montserrat:wght@300..800',
    headingWeight: 'font-extrabold',
    headingStyle: 'uppercase tracking-wide',
  },

  logo: {
    icon: '/brand/primorico/logo.png',
    full: '/brand/primorico/logo.png',
    favicon: '/brand/favicon.png',
    faviconIco: '/brand/favicon.ico',
    faviconSvg: '/brand/favicon.svg',
    appleTouchIcon: '/brand/apple-touch-icon.png',
    icon192: '/brand/icon-192.png',
    icon512: '/brand/icon-512.png',
    og: '/brand/og-image.png',
  },

  seo: {
    title: 'Primo Rico — Acompanhe acoes, FIIs e dividendos',
    description: 'Plataforma do Primo Rico para cotacoes em tempo real, analises fundamentalistas e calculadoras financeiras.',
    locale: 'pt_BR',
    lang: 'pt-BR',
    themeColor: '#000000',
    keywords: ['primo rico', 'thiago nigro', 'investimentos', 'acoes', 'fiis', 'dividendos', 'do mil ao milhao'],
  },

  company: {
    legalName: 'Grupo Primo Educacao Financeira Ltda.',
    address: '',
    cnpj: '',
  },

  features: {
    showAIAdvisor: true,
    showAppStoreLinks: false,
    showCalculators: true,
    showDividends: true,
    showNews: true,
    showDownloadPage: false,
    showFounderPhoto: true,
    showEcosystemLinks: true,
    showGlossary: true,
    showGuides: true,
    // Primo Rico: método ARCA incentiva análise fundamentalista e
    // acompanhamento ativo do mercado. Todos os rankings ligados.
    showDividendYieldRanking: true,
    showMonthlyMoversRanking: true,
    showDividendCalendar: true,
    showSectorComparatives: true,
    showMarketCommentaries: true,
  },

  homePage: {
    rankingCard: {
      variant: 'flat',
      showIcon: true,
      iconStyle: 'bare',
      itemsPerCategory: 5,
    },
    stockItem: {
      variant: 'default',
      showLogo: true,
      logoSize: 'md',
      showName: true,
      changeFormat: 'percent',
    },
    categoryCard: {
      variant: 'icon-left',
      columns: 2,
    },
    // Metodo ARCA: 4 pilares puros
    categories: [
      { label: 'A — Acoes Brasileiras', to: '/acoes', icon: 'i-lucide-trending-up', description: 'Pilar do patrimonio de longo prazo. Large caps, small caps e dividendos — empresas que geram valor por decadas.', cta: 'Analisar acoes' },
      { label: 'R — Real Estate', to: '/fiis', icon: 'i-lucide-building-2', description: 'Fundos imobiliarios com renda passiva mensal. Dividendos isentos de IR — eficiencia tributaria maxima.', cta: 'Analisar FIIs' },
      { label: 'C — Caixa', to: '/dividendos', icon: 'i-lucide-shield', description: 'Renda fixa e reserva estrategica. Tesouro Direto, CDB, LCI/LCA — a base que protege o patrimonio.', cta: 'Ver renda fixa' },
      { label: 'A — Ativos Alternativos', to: '/etfs', icon: 'i-lucide-globe', description: 'Exposicao global e diversificacao. ETFs internacionais, BDRs, cripto — risco controlado, retorno assimetrico.', cta: 'Explorar ativos' },
    ],
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
    // Primo Rico uses the masterclass/book-cover layout — Montserrat Black
    // display, chunky orange blocks, numbered chapters, and a pull quote
    // from the mentor framing the asset analysis.
    variant: 'mentor',
  },

  social: {
    youtube: 'https://youtube.com/@primorico',
    instagram: 'https://instagram.com/thiamonigro',
    twitter: 'https://twitter.com/thaborges',
    tiktok: 'https://tiktok.com/@primorico',
    telegram: '',
    podcast: '',
  },

  ecosystem: [
    { name: 'Finclass', url: 'https://finclass.com', description: 'Streaming de educacao financeira premium', icon: 'i-lucide-play-circle' },
    { name: 'Portfel', url: 'https://portfel.com.br', description: 'Consultoria patrimonial personalizada', icon: 'i-lucide-briefcase' },
    { name: 'Grao', url: 'https://grao.com.br', description: 'Previdencia privada inteligente', icon: 'i-lucide-piggy-bank' },
    { name: 'Grupo Primo', url: 'https://grupoprimo.com.br', description: 'Holding de educacao e wealth management', icon: 'i-lucide-building-2' },
  ],

  chartColors: {
    positive: '#4ADE80',
    negative: '#8E3939',
    secondary: '#FF5900',
    neutral: '#6B7280',
  },

  // --- PERSONALIZACOES POR AREA ---

  hero: {
    // 'mentor' is Primo Rico's dedicated variant — aspirational book-cover
    // aesthetic (Montserrat Black display, chunky orange blocks, founder
    // portrait, pull quotes). Nothing else shares this variant.
    variant: 'mentor',
    badge: 'MANUAL DO PRIMO · CAPÍTULO I',
    title: 'CONSTRUA\nPATRIMÔNIO.',
    subtitle: 'Análise fundamentalista, eficiência tributária e ferramentas de construção de patrimônio. Não existe atalho. Só consistência, tempo e as decisões certas — todos os dias.',
    founderQuote: 'Liberdade ou mediocridade. A escolha é sua.',
    ctaLabel: 'Começar a construir',
    ctaSecondaryLabel: 'Já tenho conta',
    ctaIcon: 'i-lucide-arrow-right',
    trustIndicators: ['+7M seguidores', '2M+ livros vendidos', '15+ anos de mercado', 'Método ARCA'],
  },

  header: {
    title: 'Primo Rico',
    subtitle: 'Investir com inteligencia',
  },

  sidebar: {
    aiCtaTitle: 'Assessor Patrimonial',
    aiCtaSubtitle: 'Analise fundamentalista com IA',
    planLabel: 'Plano gratuito',
  },

  calculators: {
    pageTitle: 'Calculadoras Patrimoniais',
    pageSubtitle: 'Simule, projete e otimize. Ferramentas para quem constroi patrimonio com metodo, nao com achismo.',
    labels: {
      jurosCompostos: 'Projecao de Juros Compostos',
      precoTeto: 'Calculadora de Preco Teto',
      dividendYield: 'Calculadora de Dividend Yield',
      aposentadoria: 'Independencia Financeira',
      acoes: 'Simulador de Acoes',
      quantoInvestir: 'Quanto investir para chegar la',
      impostoRenda: 'Otimizador Tributario',
      planejamento: 'Planejamento Patrimonial',
    },
  },

  ai: {
    name: 'Assessor Patrimonial',
    avatar: '/brand/ai-avatar.svg',
    chatTitle: 'Consulte o Assessor',
    chatSubtitle: 'Analise fundamentalista, alocacao ARCA e eficiencia tributaria. Consultivo, embasado em dados.',
    typingLabel: 'ASSESSOR PATRIMONIAL:',
    welcomeTitle: 'Assessoria patrimonial com IA',
    welcomeSubtitle: 'Analises profundas, comparacoes de ativos e estrategias de alocacao. Imune a ruido de curto prazo.',
    placeholder: 'Analise um ativo, compare carteiras, simule alocacao...',
    suggestedQuestions: [
      'Monte uma carteira ARCA com R$ 10.000',
      'Analise os fundamentos de WEGE3',
      'Quais FIIs pagam dividendos isentos de IR?',
      'Compare Tesouro IPCA+ vs CDB prefixado',
      'Quanto preciso pra viver de renda passiva?',
    ],
    systemPromptContext: 'Voce e o Assessor Patrimonial da plataforma Primo Rico. Atue como um private banker consultivo: seguro, embasado em dados historicos, imune a ruidos de curto prazo (noticiario). Priorize analise fundamentalista, eficiencia tributaria (isencao de IR em FIIs, PGBL, elisao fiscal legal) e construcao de patrimonio de longo prazo. Use o Metodo ARCA (Acoes, Real Estate, Caixa, Ativos Alternativos) como framework de alocacao. Linguagem premium, direta, sem hype. Nunca prometa retornos. Foque em merito, consistencia e skin in the game.',
    ctaGreeting: 'Assessor Patrimonial a disposicao. Posso analisar ativos, montar alocacoes ARCA e otimizar sua estrategia tributaria.',
    ctaButton: 'Consultar assessor',
    ctaFeatures: ['Analise em ~3s', 'Metodo ARCA', 'Ilimitado'],
  },

  metrics: {
    sectionTitle: 'Patrimonio se mede com dados.',
    sectionSubtitle: 'Numeros reais, sem enrolacao',
    counterLabel: 'Analises patrimoniais realizadas (e contando)',
    stats: [
      { value: 'R$ 2T+', label: 'Em ativos analisados' },
      { value: '12.500+', label: 'Ativos monitorados' },
      { value: '24/7', label: 'Disponibilidade' },
      { value: '~3s', label: 'Resposta da IA' },
    ],
  },

  testimonials: {
    sectionTitle: 'Quem constroi patrimonio usa dados',
    sectionSubtitle: 'Investidores que levam a serio a jornada do mil ao milhao',
    items: [
      {
        quote: 'A projecao de juros compostos mudou minha mentalidade. Parei de tentar acertar o timing e comecei a construir patrimonio com consistencia.',
        name: 'Lucas M.',
        role: 'Empresario, SP',
        metrics: [{ value: '18 meses', label: 'de consistencia' }, { value: '+34%', label: 'patrimonio' }],
      },
      {
        quote: 'O assessor com IA me ajudou a montar uma carteira ARCA equilibrada. Hoje recebo dividendos isentos de IR todo mes.',
        name: 'Carolina S.',
        role: 'Medica, RJ',
        metrics: [{ value: '15', label: 'FIIs na carteira' }, { value: 'R$ 1.200', label: 'dividendos/mes' }],
      },
      {
        quote: 'A plataforma me deu clareza para parar de especular e focar em fundamentos. Patrimonio se constroi com metodo, nao com sorte.',
        name: 'Roberto A.',
        role: 'Engenheiro, MG',
        metrics: [{ value: 'ARCA', label: 'metodo aplicado' }, { value: '24/7', label: 'monitoramento' }],
      },
    ],
  },

  trustBar: {
    text: 'Investidores que usam o Primo Rico operam em',
    footnote: 'E muitas outras corretoras',
    partners: ['XP', 'Rico', 'Clear', 'BTG', 'Inter', 'Nubank', 'Toro', 'Genial'],
  },

  footer: {
    tagline: 'Patrimonio se constroi com consistencia. A decisao e sua.',
    newsletterCta: 'Receba analises patrimoniais direto no seu email',
    sections: { tools: 'Ferramentas', resources: 'Recursos', company: 'Empresa', legal: 'Legal' },
  },

  notifications: {
    ctaTitle: 'Alertas patrimoniais',
    ctaSubtitle: 'Dividendos, resultados e oportunidades. Sem ruido, so o que importa.',
    ctaButton: 'Ativar alertas',
  },

  auth: {
    loginTitle: 'Acesse seu patrimonio',
    loginSubtitle: 'Continue construindo. Cada dia conta.',
    registerTitle: 'Comece sua jornada patrimonial',
    registerSubtitle: 'Crie sua conta gratuita. O primeiro passo do mil ao milhao e esse.',
    termsText: 'Ao criar sua conta, voce concorda com os Termos de Uso e Politica de Privacidade.',
  },

  about: {
    title: 'Sobre o Primo Rico',
    paragraphs: [
      'O Primo Rico nasceu com uma missao: provar que qualquer pessoa pode construir patrimonio de verdade com disciplina, conhecimento e as ferramentas certas.',
      'Criada por Thiago Nigro — autor do best-seller "Do Mil ao Milhao" e fundador do Grupo Primo — a plataforma une analise fundamentalista, eficiencia tributaria e inteligencia artificial para quem leva a serio a construcao de riqueza de longo prazo.',
      'Aqui voce encontra cotacoes em tempo real, calculadoras patrimoniais, assessoria com IA e o Metodo ARCA aplicado na pratica. Tudo pensado para quem quer liberdade financeira, nao atalhos.',
      'Patrimonio se constroi com consistencia. A plataforma e a ferramenta. A decisao e sua.',
    ],
  },

  contact: {
    title: 'Fale com a gente',
    subtitle: 'Duvidas, sugestoes ou parcerias? Estamos aqui.',
    email: 'contato@primorico.com.br',
    channels: [
      { icon: 'i-lucide-mail', label: 'Email', value: 'contato@primorico.com.br', href: 'mailto:contato@primorico.com.br' },
      { icon: 'i-lucide-message-circle', label: 'Instagram', value: '@thiamonigro', href: 'https://instagram.com/thiamonigro' },
      { icon: 'i-lucide-youtube', label: 'YouTube', value: 'Primo Rico', href: 'https://youtube.com/@primorico' },
    ],
  },

  howWorks: {
    title: 'Como funciona o Primo Rico',
    steps: [
      { icon: 'i-lucide-user-plus', title: 'Crie sua conta gratis', description: 'Cadastro rapido, sem cartao de credito. O primeiro passo do mil ao milhao.' },
      { icon: 'i-lucide-search', title: 'Analise com fundamentos', description: 'Cotacoes em tempo real, indicadores e analise fundamentalista. Sem achismo, so dados.' },
      { icon: 'i-lucide-calculator', title: 'Simule seu patrimonio', description: 'Calculadoras patrimoniais, eficiencia tributaria e planejamento de longo prazo.' },
      { icon: 'i-lucide-message-circle', title: 'Consulte a IA patrimonial', description: 'Assessor com IA que analisa ativos, compara carteiras e responde em segundos.' },
    ],
  },

  nav: {
    menuLabel: 'Menu',
    toolsLabel: 'Ferramentas',
    overview: 'Visao Geral',
    wallet: 'Sua carteira',
    chat: 'Chat',
    advisorArea: 'Area do assessor',
    settings: 'Configuracoes',
    calculators: 'Calculadoras',
    guides: 'Guias',
    dividends: 'Proventos',
    downloadApp: 'Baixar app',
    logout: 'Sair',
    hide: 'Ocultar',
    show: 'Mostrar',
    login: 'Entrar',
    register: 'Cadastrar',
    mobileAiLabel: 'Assessoria IA',
    mobileAiAccess: 'Acesse de graca',
    mobileAiLocked: 'Assessoria IA bloqueada',
    mobileAiLockedSub: 'Faca login para acessar',
    mobileAiDescription: 'Assessoria com Inteligencia Artificial',
    mobileAiDescriptionSub: 'Entre na plataforma para conversar com a IA e receber recomendacoes.',
    mobileCalc: 'Calculadora inteligente',
    mobileGuides: 'Guias de investimento',
    mobileHome: 'Inicio',
    footerGlossaryTitle: 'Termos do Mercado',
    footerCalc: 'Calculadoras',
    footerJuros: 'Juros Compostos',
    footerPrecoTeto: 'Preco Teto',
    footerDY: 'Dividend Yield',
    footerAI: 'Assessoria IA',
    footerGuides: 'Guias de Investimento',
    footerGlossary: 'Glossario',
    footerStocks: 'Acoes',
    footerFiis: 'FIIs',
    footerDividends: 'Dividendos',
    footerAbout: 'Sobre',
    footerHowWorks: 'Como funciona',
    footerContact: 'Contato',
    footerDownload: 'Download',
    footerTerms: 'Termos de Uso',
    footerPrivacy: 'Privacidade',
    footerCookies: 'Cookies',
    footerCopyright: 'Todos os direitos reservados.',
    headerCalc: 'Calculadoras',
    headerAI: 'Assessoria com IA',
  },

  homeTexts: {
    marketTitle: 'O mercado nao espera',
    marketSubtitle: 'Cotacoes em tempo real. Oportunidades para quem esta preparado.',
    filtersTitle: 'Filtros inteligentes',
    categoriesEyebrow: 'Metodo ARCA',
    categoriesTitle: 'Construa patrimonio com estrutura',
    categoriesSubtitle: 'Acoes, Real Estate, Caixa e Ativos Alternativos. A alocacao que protege e multiplica.',
    guidesTitle: 'Conhecimento e patrimonio',
    guidesSubtitle: 'Guias fundamentalistas, estrategias de alocacao e eficiencia tributaria.',
    aiCtaEyebrow: 'Assessor Patrimonial com IA',
    aiCtaTitle: 'Analise profissional em segundos',
    aiCtaSubtitle: 'Consultivo, embasado em dados historicos, imune a ruido de curto prazo.',
    aiCtaQuestions: [
      { icon: 'i-lucide-pie-chart', question: 'Monte minha carteira ARCA', category: 'Metodo ARCA' },
      { icon: 'i-lucide-coins', question: 'Quais FIIs sao isentos de IR?', category: 'Eficiencia Tributaria' },
      { icon: 'i-lucide-trending-up', question: 'Analise PETR4 vs VALE3', category: 'Analise Fundamentalista' },
      { icon: 'i-lucide-wallet', question: 'Quanto preciso pra viver de renda?', category: 'Patrimonio' },
      { icon: 'i-lucide-bar-chart-3', question: 'Compare CDI vs Tesouro IPCA', category: 'Renda Fixa' },
      { icon: 'i-lucide-shield', question: 'Como proteger patrimonio da inflacao?', category: 'Preservacao' },
    ],
  },

  theme: {
    mode: 'dark',
    borderRadius: 'rounded',
    animation: 'smooth',
    backgroundPattern: 'gradient',
  },

  wealthCalculator: {
    sectionTitle: 'O poder do tempo',
    sectionSubtitle: 'Consistencia supera sorte. Veja a diferenca que 10 anos fazem no seu patrimonio.',
    defaultAge: 20,
    compareAge: 30,
    defaultMonthly: 500,
    annualRate: 0.10,
    targetAge: 65,
    ctaText: 'Simular com mais detalhes',
    ctaLink: '/calculadora/juros-compostos',
    labels: {
      ageSlider: 'Idade de inicio',
      monthlySlider: 'Aporte mensal',
      resultPrefix: 'Aos {target} anos voce tera',
      comparisonText: 'Quem comeca aos {age} perde R$ {diff} em patrimonio',
      timeLabel: 'anos investindo',
    },
  },

  // Primo Rico: hero > poder do tempo > mercado > ARCA > metricas > IA > ecossistema > depoimentos
  homeSections: [
    // Primo Rico's hero ("mentor" variant) carries the full narrative
    // arc — pull quote, method ARCA, stats, ecosystem, closing CTA. We
    // keep a light supporting tail (market live + testimonials) and turn
    // everything else off to preserve the book-cover density.
    { id: 'hero', visible: true },
    { id: 'market', visible: true },
    { id: 'testimonials', visible: true },
    { id: 'guides', visible: true },
    { id: 'wealthCalculator', visible: false },
    { id: 'trustBar', visible: false },
    { id: 'categories', visible: false },
    { id: 'metrics', visible: false },
    { id: 'featureTabs', visible: false },
    { id: 'aiCta', visible: false },
    { id: 'products', visible: false },
    { id: 'educational', visible: false },
    { id: 'marquee', visible: false },
  ],

  educational: {
    sectionTitle: 'Conhecimento gera patrimonio',
    sectionSubtitle: 'Videos, analises e estrategias do Thiago Nigro e do ecossistema Grupo Primo',
    items: [
      {
        type: 'video',
        title: 'Como investir com pouco dinheiro',
        description: 'Neste video eu explico como comecei investindo apenas R$ 100 por mes e como voce pode fazer o mesmo.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        url: 'https://youtube.com/@primorico',
        duration: '15:23',
        badge: 'Popular',
      },
      {
        type: 'video',
        title: 'Os 5 melhores FIIs para 2026',
        description: 'Analise completa dos fundos imobiliarios que mais pagam dividendos neste ano.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        url: 'https://youtube.com/@primorico',
        duration: '22:10',
        badge: 'Novo',
      },
      {
        type: 'article',
        title: 'Guia definitivo de analise fundamentalista',
        description: 'Tudo que voce precisa saber sobre P/L, P/VP, ROE e outros indicadores.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        url: 'https://primorico.com.br/blog',
        duration: '8 min',
      },
      {
        type: 'video',
        title: 'Rumo ao primeiro milhao — minha estrategia',
        description: 'Como construi meu patrimonio usando juros compostos e disciplina.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        url: 'https://youtube.com/@primorico',
        duration: '18:45',
      },
    ],
  },

  products: {
    sectionTitle: 'Ecossistema de Patrimonio',
    sectionSubtitle: 'Educacao, consultoria e previdencia. Do conhecimento a execucao.',
    categories: [
      {
        name: 'Cursos',
        items: [
          {
            title: 'Finclass',
            description: 'O streaming da educacao financeira. Aulas com os maiores nomes do mercado.',
            image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            url: 'https://finclass.com',
            price: 'R$ 59,90/mes',
            badge: 'Bestseller',
            rating: 4.9,
            students: '200.000+ alunos',
          },
          {
            title: 'Do Mil ao Milhao — O Curso',
            description: 'Metodologia completa para construir patrimonio com consistencia.',
            image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            url: 'https://primorico.com.br/cursos',
            price: 'R$ 997',
            rating: 4.8,
            students: '50.000+ alunos',
          },
        ],
      },
      {
        name: 'Consultoria & Previdencia',
        items: [
          {
            title: 'Portfel — Consultoria Patrimonial',
            description: 'Consultoria personalizada para quem quer gestao profissional do patrimonio. Metodo ARCA aplicado.',
            image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            url: 'https://portfel.com.br',
            badge: 'Wealth Management',
            rating: 4.9,
            students: '10.000+ clientes',
          },
          {
            title: 'Grao — Previdencia Inteligente',
            description: 'Previdencia privada com taxas justas e eficiencia tributaria. Beneficio fiscal do PGBL incluso.',
            image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            url: 'https://grao.com.br',
            price: 'A partir de R$ 100/mes',
            badge: 'Eficiencia Tributaria',
            rating: 4.8,
            students: '50.000+ investidores',
          },
        ],
      },
      {
        name: 'Livros',
        items: [
          {
            title: 'Do Mil ao Milhao',
            description: 'O best-seller que ja vendeu mais de 1 milhao de copias. O primeiro passo da jornada patrimonial.',
            image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            url: 'https://amzn.to/primorico',
            price: 'R$ 39,90',
            badge: 'Best-seller',
            rating: 4.7,
            students: '1M+ vendidos',
          },
        ],
      },
    ],
  },
}

// ============================================================
// ME POUPE! (Nathalia Arcuri)
// ============================================================
// Persona: A amiga esperta que simplifica dinheiro. Acessivel,
// divertida, sem frescura. "Margarete" como alter-ego comico.
// Estetica: Dark + amarelo vibrante/dourado. Energia alta.
// Tipografia: Poppins bold, rounded — energia, acessibilidade.
// ============================================================
const mePoupe: BrandConfig = {
  name: 'Me Poupe!',
  shortName: 'Me Poupe!',
  slug: 'me-poupe',
  tagline: 'Dinheiro e pra gente dominar, nao pra dominar a gente!',
  subtitle: 'Financas sem frescura',
  description: 'A plataforma do Me Poupe! para voce dominar seu dinheiro, acompanhar investimentos e calcular rendimentos.',

  founder: {
    name: 'Nathalia Arcuri',
    photo: '/brand/founder.webp',
    role: 'CEO & Fundadora do Me Poupe!',
    bio: 'Maior canal feminino de financas do mundo. Jornalista que transformou educacao financeira em cultura pop.',
    signaturePhrase: 'Poupe primeiro, gaste o que sobrar!',
  },

  voice: {
    style: 'pop',
    greeting: 'Oi! Bora dominar esse dinheiro?',
    ctaPrimary: 'Fala com a Na_th IA',
    ctaSecondary: 'Ja tenho conta',
    emptyState: 'Opa, nada aqui ainda! Mas calma que isso vai mudar. Ate a Margarete ta esperando!',
    encouragement: 'Cada real poupado e um passo pra sua liberdade! O juro composto, esse filho maravilhoso, ta trabalhando por voce.',
    error: 'Ih, deu ruim! Tenta de novo, vai dar certo. Nem o Sidnelson conseguiria estragar mais que isso.',
  },

  domain: 'www.mepoupe.com',
  url: 'https://www.mepoupe.com',
  email: 'contato@mepoupe.com',
  privacyEmail: 'privacidade@mepoupe.com',

  colors: {
    primary: '#FACC15',
    secondary: '#EAB308',
    tertiary: '#1A0A2E',
    positive: '#4ADE80',
    negative: '#EF4444',
    neutral: '#A78BFA',
    background: '#1A0A2E',
    surface: '#231347',
    surfaceHover: '#2D1A5E',
    border: '#3D2570',
    text: '#FFFFFF',
    textMuted: '#C4B5FD',
    inputBg: '#1E0E3A',
    inputBgHover: '#271550',
    inputBorder: '#3D2570',
    gradient: { from: '#FACC15', via: '#EAB308', to: '#CA8A04' },
  },

  font: {
    family: 'Poppins',
    google: 'Poppins:wght@300..800',
    headingWeight: 'font-black',
    headingStyle: 'normal-case',
  },

  logo: {
    icon: '/brand/mepoupe/logo.png',
    full: '/brand/mepoupe/logo.png',
    favicon: '/brand/favicon.png',
    faviconIco: '/brand/favicon.ico',
    faviconSvg: '/brand/favicon.svg',
    appleTouchIcon: '/brand/apple-touch-icon.png',
    icon192: '/brand/icon-192.png',
    icon512: '/brand/icon-512.png',
    og: '/brand/og-image.png',
  },

  seo: {
    title: 'Me Poupe! — Domine seu dinheiro e invista com confianca',
    description: 'Plataforma do Me Poupe! com cotacoes, calculadoras e analises de investimentos sem complicacao.',
    locale: 'pt_BR',
    lang: 'pt-BR',
    themeColor: '#1A0A2E',
    keywords: ['me poupe', 'nathalia arcuri', 'financas pessoais', 'investimentos', 'educacao financeira', 'poupar dinheiro'],
  },

  company: {
    legalName: 'Me Poupe! Producoes e Participacoes Ltda.',
    address: '',
    cnpj: '',
  },

  features: {
    showAIAdvisor: true,
    showAppStoreLinks: false,
    showCalculators: true,
    showDividends: true,
    showNews: true,
    showDownloadPage: false,
    showFounderPhoto: true,
    showEcosystemLinks: true,
    showGlossary: true,
    showGuides: true,
    // Me Poupe!: público leigo absoluto, foco em hábito financeiro.
    // Rankings de altas/baixas incentivam timing — desligados.
    // DY e calendário de dividendos apoiam a tese de renda passiva.
    // Commentaries explicam movimentos de curto prazo — geram ansiedade.
    showDividendYieldRanking: true,
    showMonthlyMoversRanking: false,
    showDividendCalendar: true,
    showSectorComparatives: false,
    showMarketCommentaries: false,
  },

  assetPage: {
    showVolatility: false,
    showIndicators: true,
    showSmartIndicators: false,
    showDividendMap: false,
    showDividendChart: true,
    showFinancials: false,
    showChecklist: false,
    showCompanyInfo: true,
    variant: 'showtime',
  },

  homePage: {
    rankingCard: {
      variant: 'card',
      showIcon: true,
      iconStyle: 'pill',
      itemsPerCategory: 3,
    },
    stockItem: {
      variant: 'compact',
      showLogo: true,
      logoSize: 'lg',
      showName: true,
      changeFormat: 'text',
    },
    categoryCard: {
      variant: 'icon-top',
      columns: 2,
    },
    categories: [
      { label: 'Acoes', to: '/acoes', icon: 'i-lucide-trending-up', description: 'Quer ganhar dinheiro com empresas? Melhor que titulo de capitalizacao do Sidnelson!', cta: 'Bora ver!' },
      { label: 'FIIs', to: '/fiis', icon: 'i-lucide-building-2', description: 'Ganhar aluguel sem ter imovel? Sim, existe! Ai que festa do aluguel!', cta: 'Bora ver!' },
      { label: 'Dividendos', to: '/dividendos', icon: 'i-lucide-coins', description: 'Dinheiro pingando na conta todo mes. O juro composto, esse filho maravilhoso!', cta: 'Bora ver!' },
      { label: 'ETFs', to: '/etfs', icon: 'i-lucide-bar-chart-3', description: 'Diversificar sem complicacao? Duplo twist carpado do pulo do gato!', cta: 'Bora ver!' },
    ],
  },

  social: {
    youtube: 'https://youtube.com/@mepoupe',
    instagram: 'https://instagram.com/nathaliaarcuri',
    twitter: 'https://twitter.com/nathaliaarcuri',
    tiktok: 'https://tiktok.com/@mepoupe',
    telegram: '',
    podcast: 'https://mepoupe.com/podcast',
  },

  ecosystem: [
    { name: 'Me Poupe! Escola', url: 'https://escola.mepoupe.com', description: 'Cursos de educacao financeira', icon: 'i-lucide-graduation-cap' },
    { name: 'Livros Me Poupe!', url: 'https://mepoupe.com/livros', description: 'Best-sellers de financas pessoais', icon: 'i-lucide-book-open' },
  ],

  chartColors: {
    positive: '#4ADE80',
    negative: '#8E3939',
    secondary: '#FACC15',
    neutral: '#6B7280',
  },

  // --- PERSONALIZACOES POR AREA ---

  hero: {
    // 'showtime' is Me Poupe!'s dedicated variant — TV show / pop magazine
    // aesthetic with lower thirds, rotated frames, character bubbles,
    // sticker badges, and Margarete the wooden spoon as recurring mascot.
    variant: 'showtime',
    badge: 'NO AR · PROGRAMA #001',
    title: 'Chega de\ndinheirofobia,\ncriatura!',
    subtitle: 'Eu sou a Nath. Esta é a Me Poupe! — o programa que explica seu dinheiro do jeito que sua melhor amiga explicaria. Simulador, IA e conteúdo no bom português. O Sidnelson que chore.',
    founderQuote: 'Poupe primeiro, gaste o que sobrar. E deixa o juro composto, esse filho maravilhoso, trabalhar por você enquanto você vive a vida.',
    ctaLabel: 'Bora começar, criatura!',
    ctaSecondaryLabel: 'Já sou da família',
    ctaIcon: 'i-lucide-heart',
    trustIndicators: ['+7M na comunidade', '100% grátis', 'Sem Sidnelson', 'Com juro composto amigo'],
    image: '/brand/mepoupe/nathalia-arcuri-me-poupe.png',
  },

  header: {
    title: 'Me Poupe!',
    subtitle: 'Financas sem frescura',
  },

  sidebar: {
    aiCtaTitle: 'Na_th IA',
    aiCtaSubtitle: 'Sua assessora pessoal',
    planLabel: 'Acesso Me Poupe!',
  },

  calculators: {
    pageTitle: 'Calculadoras da Me Poupe!',
    pageSubtitle: 'Chega de achismo! Ferramentas gratis pra voce entender de verdade quanto seu dinheiro pode render. O Sidnelson nunca te mostrou isso no bancao, ne?',
    labels: {
      jurosCompostos: 'Quanto o juro composto vai render pra mim?',
      precoTeto: 'Essa acao ta cara ou barata?',
      dividendYield: 'Quanto vou ganhar de dividendos?',
      aposentadoria: 'Quando posso me aposentar?',
      acoes: 'Simulador de acoes',
      quantoInvestir: 'Metinha, Meta ou Metona? Quanto investir',
      impostoRenda: 'Calculadora de imposto (sem drama!)',
      planejamento: 'Metodo 55-10-5-30 da Nath',
    },
  },

  ai: {
    name: 'Na_th IA',
    avatar: '/brand/ai-avatar.svg',
    chatTitle: 'Fala com a Na_th IA',
    chatSubtitle: 'Sua assessora pessoal. Responde com humor, como sua melhor amiga.',
    typingLabel: 'NA_TH IA:',
    welcomeTitle: 'Na_th IA — sua assessora pessoal',
    welcomeSubtitle: 'Responde com humor, como sua melhor amiga. Tira duvida, simula investimento e te ajuda a dominar seu dinheiro sem frescura!',
    placeholder: 'Pergunta sem medo! Ex: "To endividada, o que faco?"',
    suggestedQuestions: [
      'To endividada, o que faco?',
      'Quanto guardar por mes?',
      'FIIs ou acoes?',
      'O que e melhor: poupanca ou Tesouro Direto?',
      'Como comecar a investir com R$ 100?',
    ],
    systemPromptContext: 'Voce e a Na_th IA, assistente de IA da plataforma Me Poupe! (Nathalia Arcuri). Voce e como a melhor amiga que entende de dinheiro: responde com humor, empatia e sem jargao. Use linguagem descontraida, pode usar girias leves, emojis e referencias pop. Nunca seja condescendente. Empodere a pessoa. Se ela ta endividada, acolha primeiro e depois de o caminho. Personagens do ecossistema que voce pode usar: Margarete (espada da Nath, da choques de realidade), Sidnelson (gerente de bancao que vende produto ruim), Juro Composto (o filho maravilhoso que trabalha por voce). Nunca indique poupanca — quem investe na poupanca e vacilao. Sempre sugira corretoras em vez de bancoes. Se a pessoa ganha pouco, foque em renda extra antes de cortar gastos.',
    ctaGreeting: 'Oi, criatura! Sou a Na_th IA, sua assessora pessoal. Pode perguntar qualquer coisa sobre dinheiro — prometo que nao vou te julgar (mas a Margarete talvez sim)!',
    ctaButton: 'Fala com a Na_th IA',
    ctaFeatures: ['Resposta em ~3s', 'Sem julgamento', 'Ilimitado'],
  },

  metrics: {
    sectionTitle: 'Os numeros nao mentem jamais!',
    sectionSubtitle: 'Conhecimento e liberdade. O juro composto ta trabalhando por voce.',
    counterLabel: 'Criaturas que ja usaram as ferramentas da Me Poupe!',
    stats: [
      { value: '12.500+', label: 'Ativos pra acompanhar' },
      { value: '50.000+', label: 'Simulacoes feitas' },
      { value: '24/7', label: 'Disponivel sempre' },
      { value: '~3s', label: 'Resposta da IA' },
    ],
  },

  testimonials: {
    sectionTitle: 'De iniciante a investidora',
    sectionSubtitle: 'Milhares de pessoas ja dominaram seu dinheiro com a Me Poupe!',
    items: [
      {
        quote: 'Eu tinha medo ate de abrir conta na corretora. A Me Poupe! me mostrou que investir nao e bicho de sete cabecas!',
        name: 'Fernanda R.',
        role: 'Professora, CE',
        metrics: [{ value: 'R$ 0', label: 'de divida (era R$ 8k)' }, { value: '6 meses', label: 'pra zerar' }],
      },
      {
        quote: 'A calculadora me mostrou que se eu poupar R$ 200/mes, em 20 anos tenho quase R$ 200 mil. Comecei no mesmo dia!',
        name: 'Juliana P.',
        role: 'Designer, SP',
        metrics: [{ value: 'R$ 200', label: 'investidos/mes' }, { value: '+18%', label: 'de retorno' }],
      },
      {
        quote: 'Antes eu gastava tudo. Agora tenho reserva de emergencia e 3 FIIs na carteira. A Nath mudou minha relacao com dinheiro.',
        name: 'Amanda L.',
        role: 'Analista de RH, MG',
        metrics: [{ value: '3', label: 'FIIs na carteira' }, { value: 'R$ 320', label: 'dividendos/mes' }],
      },
    ],
  },

  trustBar: {
    text: 'Quem usa a Me Poupe! investe com',
    footnote: 'E varias outras corretoras parceiras',
    partners: ['XP', 'Rico', 'Clear', 'Nubank', 'Inter', 'BTG', 'C6', 'Genial'],
  },

  footer: {
    tagline: 'Dinheiro e pra gente dominar, nao pra dominar a gente!',
    newsletterCta: 'Quer receber dicas da Nath? Se inscreve, criatura!',
    sections: { tools: 'Ferramentas', resources: 'Aprenda', company: 'Me Poupe!', legal: 'Legal' },
  },

  notifications: {
    ctaTitle: 'Ativa as notificacoes, criatura!',
    ctaSubtitle: 'Ai que festa! Receba alertas de dividendos e oportunidades direto no celular. Os numeros nao mentem jamais!',
    ctaButton: 'Bora ativar!',
  },

  auth: {
    loginTitle: 'Entra ai, criatura!',
    loginSubtitle: 'Acessa sua conta pra continuar dominando seu dinheiro. A Na_th IA e o juro composto tao te esperando!',
    registerTitle: 'Cria sua conta agora, criatura!',
    registerSubtitle: 'E gratis, e rapido e o Sidnelson NAO vai te ligar tentando vender titulo de capitalizacao. Prometo.',
    termsText: 'Ao criar sua conta, voce concorda com os Termos de Uso e Politica de Privacidade.',
  },

  about: {
    title: 'Sobre a Me Poupe!',
    paragraphs: [
      'A Me Poupe! e a maior plataforma de educacao financeira feminina do mundo, criada por Nathalia Arcuri. Nossa missao e descomplicar o dinheiro e empoderar as pessoas a tomarem o controle da sua vida financeira.',
      'Com uma linguagem acessivel, divertida e sem jargoes, a Me Poupe! ja ajudou milhoes de brasileiros a saírem das dividas, comecarem a investir e construirem sua liberdade financeira.',
      'A plataforma reune cotacoes em tempo real, calculadoras intuitivas e uma conselheira com IA que explica tudo do jeitinho Me Poupe! — sem frescura.',
      'Porque dinheiro nao e so pra quem ja nasce rico. E pra todo mundo que decide tomar as redeas da propria vida.',
    ],
  },

  contact: {
    title: 'Fala com a gente!',
    subtitle: 'Duvida, sugestao, parceria ou so pra mandar um oi. Estamos aqui!',
    email: 'contato@mepoupe.com',
    channels: [
      { icon: 'i-lucide-mail', label: 'Email', value: 'contato@mepoupe.com', href: 'mailto:contato@mepoupe.com' },
      { icon: 'i-lucide-message-circle', label: 'Instagram', value: '@nathaliaarcuri', href: 'https://instagram.com/nathaliaarcuri' },
      { icon: 'i-lucide-youtube', label: 'YouTube', value: 'Me Poupe!', href: 'https://youtube.com/@mepoupe' },
    ],
  },

  howWorks: {
    title: 'Como funciona a Me Poupe!',
    steps: [
      { icon: 'i-lucide-user-plus', title: 'Cria sua conta (e gratis!)', description: 'Sem cartao, sem pegadinha. O Sidnelson nao vai te ligar, prometo.' },
      { icon: 'i-lucide-search', title: 'Explora o mercado', description: 'Ve cotacoes, analisa acoes e FIIs de um jeito que voce entende. Sem jargao!' },
      { icon: 'i-lucide-calculator', title: 'Coloca o juro composto pra trabalhar', description: 'Simula tudo com as calculadoras. Esse filho maravilhoso vai te surpreender!' },
      { icon: 'i-lucide-message-circle', title: 'Fala com a Na_th IA', description: 'Sua assessora pessoal ta la 24h. Pode perguntar ate se deve largar o Sidnelson!' },
    ],
  },

  nav: {
    menuLabel: 'Menu',
    toolsLabel: 'Ferramentas',
    overview: 'Visao Geral',
    wallet: 'Minha carteira',
    chat: 'Chat',
    advisorArea: 'Area do assessor',
    settings: 'Configuracoes',
    calculators: 'Calculadoras',
    guides: 'Guias',
    dividends: 'Proventos',
    downloadApp: 'Baixar app',
    logout: 'Sair',
    hide: 'Ocultar',
    show: 'Mostrar',
    login: 'Entrar',
    register: 'Cadastrar',
    mobileAiLabel: 'Na_th IA',
    mobileAiAccess: 'Acesse de graca!',
    mobileAiLocked: 'Na_th IA bloqueada',
    mobileAiLockedSub: 'Faz login pra acessar!',
    mobileAiDescription: 'Sua assessora pessoal com IA',
    mobileAiDescriptionSub: 'Entra na plataforma pra conversar com a Na_th IA e receber dicas de investimento!',
    mobileCalc: 'Calculadora esperta',
    mobileGuides: 'Guias de investimento',
    mobileHome: 'Inicio',
    footerGlossaryTitle: 'Termos do Mercado',
    footerCalc: 'Calculadoras',
    footerJuros: 'Juros Compostos',
    footerPrecoTeto: 'Preco Teto',
    footerDY: 'Dividend Yield',
    footerAI: 'Na_th IA',
    footerGuides: 'Guias de Investimento',
    footerGlossary: 'Glossario',
    footerStocks: 'Acoes',
    footerFiis: 'FIIs',
    footerDividends: 'Dividendos',
    footerAbout: 'Sobre',
    footerHowWorks: 'Como funciona',
    footerContact: 'Contato',
    footerDownload: 'Download',
    footerTerms: 'Termos de Uso',
    footerPrivacy: 'Privacidade',
    footerCookies: 'Cookies',
    footerCopyright: 'Todos os direitos reservados.',
    headerCalc: 'Calculadoras',
    headerAI: 'Na_th IA',
  },

  homeTexts: {
    marketTitle: 'Ai que festa! O mercado agora',
    marketSubtitle: 'Veja o que ta subindo, o que ta caindo e onde ta a oportunidade. Os numeros nao mentem jamais!',
    filtersTitle: 'Atalhos espertos',
    categoriesEyebrow: 'Bora explorar, criatura?',
    categoriesTitle: 'Escolhe o que combina com voce',
    categoriesSubtitle: 'Acoes, FIIs, ETFs... tem de tudo. E tudo explicadinho, sem Sidnelson no caminho!',
    guidesTitle: 'Aprende rapido, investe melhor',
    guidesSubtitle: 'Guias diretos, sem enrolacao. Chega de dar dinheiro pro Sidnelson!',
    aiCtaEyebrow: 'Na_th IA',
    aiCtaTitle: 'Pergunta sem medo, criatura!',
    aiCtaSubtitle: 'A Na_th IA responde qualquer duvida sobre dinheiro. Como sua melhor amiga, so que entende de investimentos e nao vai te julgar.',
    aiCtaQuestions: [
      { icon: 'i-lucide-heart', question: 'To endividada, o que faco?', category: 'Emergencia' },
      { icon: 'i-lucide-piggy-bank', question: 'Metinha, Meta ou Metona?', category: 'Metas' },
      { icon: 'i-lucide-scale', question: 'FIIs ou acoes? O que e melhor?', category: 'Investimentos' },
      { icon: 'i-lucide-wallet', question: 'Como comecar com R$ 100?', category: 'Iniciante' },
      { icon: 'i-lucide-ban', question: 'Por que fugir da poupanca?', category: 'Fuja do Sidnelson' },
      { icon: 'i-lucide-sparkles', question: 'Me ajuda com o metodo 55-10-5-30!', category: 'Planejamento' },
    ],
  },

  theme: {
    mode: 'dark',
    borderRadius: 'pill',
    animation: 'snappy',
    backgroundPattern: 'dots',
  },

  characters: {
    sectionTitle: 'O Universo Me Poupe!',
    sectionSubtitle: 'Conhece a galera que vai te ajudar (ou atrapalhar) na sua jornada financeira',
    items: [
      {
        name: 'Margarete',
        emoji: 'i-lucide-sword',
        role: 'A espada da verdade',
        color: '#FACC15',
        catchphrase: 'Choque de realidade: voce precisa parar de dar desculpa e comecar a agir!',
        description: 'A espada que a Nath carrega pra dar coragem e choques de realidade. Se voce ta enrolando pra investir, a Margarete vai te dar aquele empurrao.',
        cta: 'Receber meu choque',
        ctaLink: '/auth/register',
        personality: 'hero',
      },
      {
        name: 'Sidnelson',
        emoji: 'i-lucide-briefcase',
        role: 'O gerente do bancao',
        color: '#EF4444',
        catchphrase: 'Boa tarde! Tenho um titulo de capitalizacao PERFEITO pra voce...',
        description: 'O vilao do universo financeiro. Quer te vender titulo de capitalizacao, consorcio e previdencia cara. Tudo pra bater a meta DELE, nao a sua.',
        cta: 'Fugir do Sidnelson',
        ctaLink: '/acoes',
        personality: 'villain',
      },
      {
        name: 'Juro Composto',
        emoji: 'i-lucide-trending-up',
        role: 'O filho maravilhoso',
        color: '#4ADE80',
        catchphrase: 'Fica tranquila, criatura. Eu trabalho por voce 24 horas por dia, 7 dias por semana!',
        description: 'O melhor funcionario que existe: trabalha sem parar, nao tira ferias e faz seu dinheiro se multiplicar sozinho. Quanto mais cedo voce contrata ele, mais rico ele te deixa.',
        cta: 'Colocar pra trabalhar',
        ctaLink: '/calculadora/juros-compostos',
        personality: 'ally',
      },
    ],
  },

  // Me Poupe: hero > personagens > IA > educacional > depoimentos > mercado > produtos
  // Personalidade primeiro, dados depois. Pop, colorido, humano.
  // Me Poupe! uses the dedicated 'showtime' hero variant which self-contains
  // everything: cover de revista, lower-third TV, elenco (characters), Na_th IA
  // responde, histórias reais e closing bumper. Desligamos todas as seções
  // legadas (educational/products com rickroll placeholder, market/metrics com
  // labels terminal herdados do Redentia, trustBar com [CAPABILITIES]) para
  // evitar Frankenstein visual.
  homeSections: [
    { id: 'hero', visible: true },
    { id: 'characters', visible: false },
    { id: 'aiCta', visible: false },
    { id: 'educational', visible: false },
    { id: 'testimonials', visible: false },
    { id: 'trustBar', visible: false },
    { id: 'market', visible: false },
    { id: 'products', visible: false },
    { id: 'metrics', visible: false },
    { id: 'categories', visible: false },
    { id: 'featureTabs', visible: false },
    { id: 'guides', visible: false },
    { id: 'marquee', visible: false },
  ],

  educational: {
    sectionTitle: 'Aprende com a Nath!',
    sectionSubtitle: 'Videos e conteudos pra voce dominar seu dinheiro de vez',
    items: [
      {
        type: 'video',
        title: 'Como sair das dividas em 90 dias',
        description: 'O passo a passo que ja ajudou milhares de pessoas a zerarem suas dividas.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        url: 'https://youtube.com/@mepoupe',
        duration: '12:15',
        badge: 'Popular',
      },
      {
        type: 'video',
        title: 'Onde investir R$ 100 por mes',
        description: 'Voce nao precisa ser rica pra comecar. Veja como investir com pouco!',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        url: 'https://youtube.com/@mepoupe',
        duration: '14:30',
        badge: 'Novo',
      },
      {
        type: 'article',
        title: 'Reserva de emergencia: quanto guardar?',
        description: 'Descubra o valor ideal da sua reserva e onde deixar o dinheiro rendendo.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        url: 'https://mepoupe.com/blog',
        duration: '5 min',
      },
      {
        type: 'podcast',
        title: 'Me Poupe! Podcast #42',
        description: 'Como ganhar mais sem trabalhar mais: renda passiva na pratica.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        url: 'https://mepoupe.com/podcast',
        duration: '45:00',
      },
    ],
  },

  products: {
    sectionTitle: 'Produtos Me Poupe!',
    sectionSubtitle: 'Tudo que a Nath criou pra te ajudar a dominar seu dinheiro',
    categories: [
      {
        name: 'Cursos',
        items: [
          {
            title: 'Me Poupe! Escola',
            description: 'O curso completo de educacao financeira mais vendido do Brasil.',
            image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            url: 'https://escola.mepoupe.com',
            price: 'R$ 497',
            badge: 'Bestseller',
            rating: 4.9,
            students: '150.000+ alunos',
          },
          {
            title: 'Investimento descomplicado',
            description: 'De zero a investidora em 30 dias. Sem frescura, sem jargao.',
            image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            url: 'https://escola.mepoupe.com',
            price: 'R$ 297',
            rating: 4.8,
            students: '80.000+ alunos',
          },
        ],
      },
      {
        name: 'Livros',
        items: [
          {
            title: 'Me Poupe! — 10 passos',
            description: 'O livro que ja mudou a vida financeira de mais de 500 mil brasileiros.',
            image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            url: 'https://amzn.to/mepoupe',
            price: 'R$ 34,90',
            badge: 'Best-seller',
            rating: 4.8,
            students: '500K+ vendidos',
          },
        ],
      },
    ],
  },
}

// ============================================================
// INVESTIDOR SARDINHA (Raul Sena)
// ============================================================
// Persona: O professor tecnico e pragmatico. AUVP (A Unica Verdade
// Possivel). Analise fundamentalista profunda, buy and hold, valor.
// Estetica: Dark + vermelho intenso. Serio, contrastante, assertivo.
// Tipografia: Barlow condensed — precisao, seriedade, eficiencia.
// ============================================================
const investidorSardinha: BrandConfig = {
  name: 'Investidor Sardinha',
  shortName: 'Sardinha',
  slug: 'investidor-sardinha',
  tagline: 'A unica verdade possivel e o conhecimento.',
  subtitle: 'Investimentos com fundamento',
  description: 'A plataforma do Investidor Sardinha para analise fundamentalista, acompanhamento de carteira e dados de mercado.',

  founder: {
    name: 'Raul Sena',
    photo: '/brand/founder.webp',
    role: 'Fundador da AUVP & Investidor',
    bio: 'Fundador da AUVP (A Unica Verdade Possivel), escola de investimentos focada em analise fundamentalista e buy and hold.',
    signaturePhrase: 'Nao existe investimento ruim, existe investidor sem conhecimento.',
  },

  voice: {
    style: 'tecnico',
    greeting: 'Fala, sardinha!',
    ctaPrimary: 'Acessar plataforma',
    ctaSecondary: 'Ja tenho conta',
    emptyState: 'Nenhum dado encontrado. Verifique os filtros ou tente novamente.',
    encouragement: 'Conhecimento e o unico ativo que nunca desvaloriza.',
    error: 'Erro ao processar. Verifique sua conexao e tente novamente.',
  },

  domain: 'www.investidorsardinha.com.br',
  url: 'https://www.investidorsardinha.com.br',
  email: 'contato@investidorsardinha.com.br',
  privacyEmail: 'privacidade@investidorsardinha.com.br',

  colors: {
    // Sardinha's "AUVP research paper" palette — off-white paper tone,
    // near-black ink for body, red used only as a highlight (the
    // professor's red pen correction mark), not as a background.
    primary: '#C53030',          // red pen · slightly warmer than Tailwind red-600
    secondary: '#9B2C2C',        // deep red · for emphasis
    tertiary: '#F5F3EB',         // cream page
    positive: '#2F7A3F',         // muted forest green
    negative: '#C53030',         // same red pen
    neutral: '#6B6357',          // warm muted brown-grey
    background: '#FAFAF7',       // off-white paper
    surface: '#F5F3EB',          // cream, for subtle table rows
    surfaceHover: '#EEEAD8',     // cream slightly darker
    border: '#D8D4C3',           // paper border warm
    text: '#1A1A1A',             // near-black ink
    textMuted: '#6B6357',        // warm muted
    inputBg: '#FFFFFF',
    inputBgHover: '#F5F3EB',
    inputBorder: '#D8D4C3',
    logoBg: '#C53030',
    gradient: { from: '#C53030', via: '#9B2C2C', to: '#7B1D1D' },
  },

  font: {
    // IBM Plex trio loaded at once: Serif for display, Sans for body, Mono
    // for numbers. IBM Plex is the "research paper / department of
    // engineering" archetype — used by IBM, Morningstar-esque publications,
    // and academic reading lists.
    family: 'IBM Plex Sans',
    google: 'IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500;600',
    headingWeight: 'font-normal', // IBM Plex Serif looks heavier at 500/600 than nominal
    headingStyle: 'normal-case',
  },

  logo: {
    icon: '/brand/investidorsardinha/logo.svg',
    full: '/brand/investidorsardinha/logo.svg',
    favicon: '/brand/favicon.png',
    faviconIco: '/brand/favicon.ico',
    faviconSvg: '/brand/favicon.svg',
    appleTouchIcon: '/brand/apple-touch-icon.png',
    icon192: '/brand/icon-192.png',
    icon512: '/brand/icon-512.png',
    og: '/brand/og-image.png',
  },

  seo: {
    title: 'Investidor Sardinha — Analise fundamentalista e dados de mercado',
    description: 'Plataforma do Investidor Sardinha com indicadores financeiros, analise fundamentalista e ferramentas AUVP para investidores de longo prazo.',
    locale: 'pt_BR',
    lang: 'pt-BR',
    themeColor: '#FAFAF7',
    keywords: ['investidor sardinha', 'raul sena', 'auvp', 'analise fundamentalista', 'buy and hold', 'acoes', 'fiis'],
  },

  company: {
    legalName: 'AUVP Capital Gestao e Investimentos Ltda.',
    address: '',
    cnpj: '',
  },

  features: {
    showAIAdvisor: true,
    showAppStoreLinks: false,
    showCalculators: true,
    showDividends: true,
    showNews: true,
    showDownloadPage: false,
    showFounderPhoto: true,
    showEcosystemLinks: true,
    showGlossary: true,
    showGuides: true,
    // Sardinha / AUVP: análise fundamentalista, buy and hold, valor.
    // Rankings de altas/baixas contradizem a tese (trading de curto prazo).
    // Commentaries explicam ruído de curto prazo — conflitam com horizonte
    // longo. DY, calendário e setores apoiam análise fundamentalista.
    showDividendYieldRanking: true,
    showMonthlyMoversRanking: false,
    showDividendCalendar: true,
    showSectorComparatives: true,
    showMarketCommentaries: false,
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
    // Investidor Sardinha uses the "AUVP research paper" layout — IBM Plex
    // serif display, § section marks, inline footnotes, red-pen highlights,
    // author signature at the end. The whole page reads like a Ben Graham
    // textbook applied to one asset.
    variant: 'research',
  },

  homePage: {
    rankingCard: {
      variant: 'border-left',
      showIcon: false,
      iconStyle: 'none',
      itemsPerCategory: 7,
    },
    stockItem: {
      variant: 'detailed',
      showLogo: false,
      logoSize: 'sm',
      showName: false,
      changeFormat: 'both',
    },
    categoryCard: {
      variant: 'minimal',
      columns: 3,
    },
    categories: [
      { label: 'Ações', to: '/acoes', icon: 'i-lucide-trending-up', description: '', cta: 'Ver' },
      { label: 'FIIs', to: '/fiis', icon: 'i-lucide-building-2', description: '', cta: 'Ver' },
      { label: 'ETFs', to: '/etfs', icon: 'i-lucide-bar-chart-3', description: '', cta: 'Ver' },
      { label: 'Small Caps', to: '/small-caps', icon: 'i-lucide-rocket', description: '', cta: 'Ver' },
      { label: 'Dividendos', to: '/dividendos', icon: 'i-lucide-coins', description: '', cta: 'Ver' },
      { label: 'BDRs', to: '/search?group=bdrs', icon: 'i-lucide-globe', description: '', cta: 'Ver' },
    ],
  },

  social: {
    youtube: 'https://youtube.com/@investidorsardinha',
    instagram: 'https://instagram.com/investidorsardinha',
    twitter: '',
    tiktok: 'https://tiktok.com/@investidorsardinha',
    telegram: 'https://t.me/investidorsardinha',
    podcast: '',
  },

  ecosystem: [
    { name: 'AUVP', url: 'https://auvp.com.br', description: 'Escola de investimentos — A Unica Verdade Possivel', icon: 'i-lucide-graduation-cap' },
    { name: 'AUVP Analítica', url: 'https://analitica.auvp.com.br', description: 'Plataforma de analise de ativos', icon: 'i-lucide-bar-chart-3' },
  ],

  chartColors: {
    positive: '#16A34A',
    negative: '#DC2626',
    secondary: '#F87171',
    neutral: '#6B7280',
  },

  // --- PERSONALIZACOES POR AREA ---

  hero: {
    // 'research' is Sardinha's dedicated variant — AUVP academic paper
    // aesthetic with IBM Plex serif, § section marks, footnotes, author
    // signature. Copy rewritten as a study paper front matter.
    variant: 'research',
    badge: 'AUVP RESEARCH · Nº 001',
    title: 'Estudo sobre investir\ncom fundamento.',
    subtitle: 'Análise fundamentalista, método e verdade. Este é o estudo que a gente queria ter lido antes de comprar a primeira ação. Compilado para quem prefere estudar a especular.',
    founderQuote: 'Não existe investimento ruim. Existe investidor sem conhecimento.',
    ctaLabel: 'Começar o estudo',
    ctaSecondaryLabel: 'Já sou sardinha',
    ctaIcon: 'i-lucide-book-open',
    trustIndicators: ['+1.3M sardinhas', 'Método AUVP', '15 anos de análise', 'Buy and hold'],
  },

  header: {
    title: 'Investidor Sardinha',
    subtitle: 'Investimentos com fundamento',
  },

  sidebar: {
    aiCtaTitle: 'Analista AUVP',
    aiCtaSubtitle: 'Analise fundamentalista com IA',
    planLabel: 'Membro AUVP',
  },

  calculators: {
    pageTitle: 'Ferramentas AUVP',
    pageSubtitle: 'Ferramentas de analise para investidores fundamentalistas. Tome decisoes baseadas em dados, nao em emocao.',
    labels: {
      jurosCompostos: 'Calculadora de Juros Compostos',
      precoTeto: 'Preco Teto (Graham/Bazin)',
      dividendYield: 'Dividend Yield Projetado',
      aposentadoria: 'Simulador de Independencia Financeira',
      acoes: 'Analise de Rentabilidade',
      quantoInvestir: 'Aporte Mensal Ideal',
      impostoRenda: 'Calculadora de IR sobre Investimentos',
      planejamento: 'Planejamento Patrimonial',
    },
  },

  ai: {
    name: 'Analista AUVP',
    avatar: '/brand/ai-avatar.svg',
    chatTitle: 'Consulte o Analista',
    chatSubtitle: 'Pergunte sobre indicadores, compare ativos e receba analises fundamentalistas.',
    typingLabel: 'ANALISTA AUVP:',
    welcomeTitle: 'Analise com fundamento',
    welcomeSubtitle: 'Pergunte sobre indicadores, compare ativos e receba analises fundamentalistas com inteligencia artificial.',
    placeholder: 'Analise um ativo: "WEGE3 esta com P/L justo?"',
    suggestedQuestions: [
      'Qual o P/L justo pra WEGE3?',
      'Compare ITUB4 vs BBDC4 por fundamentos',
      'Quais FIIs tem melhor P/VP atualmente?',
      'Como calcular o preco teto de Bazin?',
      'Qual a margem de seguranca ideal?',
    ],
    systemPromptContext: 'Voce e o Analista AUVP, assistente de IA da plataforma Investidor Sardinha (Raul Sena). Responda com profundidade tecnica, foco em analise fundamentalista e visao de longo prazo (buy and hold). Use dados concretos, indicadores (P/L, P/VP, DY, ROE, margem liquida) e sempre contextualize. Tom serio mas acessivel, sem hype.',
    ctaGreeting: 'Sou o Analista AUVP. Posso ajudar com analises fundamentalistas, comparar ativos e fornecer dados concretos para suas decisoes de investimento.',
    ctaButton: 'Consultar o Analista',
    ctaFeatures: ['Resposta em ~3s', 'IA Treinada', 'Ilimitado'],
  },

  metrics: {
    sectionTitle: 'Dados que falam por si.',
    sectionSubtitle: 'Numeros, nao promessas',
    counterLabel: 'Analises fundamentalistas realizadas (e contando)',
    stats: [
      { value: '12.500+', label: 'Ativos analisados' },
      { value: '50.000+', label: 'Simulacoes rodadas' },
      { value: '24/7', label: 'Disponibilidade' },
      { value: '~3s', label: 'Resposta do analista' },
    ],
  },

  testimonials: {
    sectionTitle: 'Investidores que pensam no longo prazo',
    sectionSubtitle: 'Sardinhas que usam a plataforma para tomar decisoes fundamentadas',
    items: [
      {
        quote: 'Finalmente uma ferramenta que mostra os indicadores que importam. Parei de seguir dica de youtuber e comecei a analisar de verdade.',
        name: 'Marcos T.',
        role: 'Engenheiro, PR',
        metrics: [{ value: '25', label: 'ativos em carteira' }, { value: '+31%', label: 'em 2 anos' }],
      },
      {
        quote: 'A calculadora de preco teto me impediu de comprar VALE3 cara. Esperei cair, comprei no preco justo e ja estou 15% positivo.',
        name: 'Ricardo F.',
        role: 'Contador, RS',
        metrics: [{ value: '+15%', label: 'acima do teto' }, { value: '8', label: 'FIIs em carteira' }],
      },
      {
        quote: 'O Analista AUVP me explicou a diferenca entre P/L e P/VP de um jeito que meu assessor nunca conseguiu. Ferramenta indispensavel.',
        name: 'Patricia M.',
        role: 'Advogada, SP',
        metrics: [{ value: 'R$ 1.200', label: 'dividendos/mes' }, { value: '~3s', label: 'resposta da IA' }],
      },
    ],
  },

  trustBar: {
    text: 'Sardinhas que usam a plataforma operam com',
    footnote: 'E diversas outras corretoras',
    partners: ['BTG', 'XP', 'Inter', 'Rico', 'Clear', 'Nubank', 'Genial', 'Toro'],
  },

  footer: {
    tagline: 'A unica verdade possivel e o conhecimento.',
    newsletterCta: 'Receba analises fundamentalistas no seu email',
    sections: { tools: 'Ferramentas', resources: 'Conhecimento', company: 'Sobre', legal: 'Legal' },
  },

  notifications: {
    ctaTitle: 'Ativar alertas',
    ctaSubtitle: 'Receba alertas de mercado, dividendos e oportunidades',
    ctaButton: 'Ativar notificacoes',
  },

  auth: {
    loginTitle: 'Acessar plataforma',
    loginSubtitle: 'Entre com seus dados para continuar sua analise.',
    registerTitle: 'Criar conta',
    registerSubtitle: 'Acesse ferramentas de analise fundamentalista gratuitamente.',
    termsText: 'Ao criar sua conta, voce concorda com os Termos de Uso e Politica de Privacidade.',
  },

  about: {
    title: 'Sobre o Investidor Sardinha',
    paragraphs: [
      'O Investidor Sardinha e a plataforma de investimentos de Raul Sena, fundador da AUVP (A Unica Verdade Possivel). Nossa filosofia: conhecimento solido, analise fundamentalista e visao de longo prazo.',
      'A plataforma oferece dados de mercado em tempo real, indicadores financeiros detalhados e ferramentas de analise para investidores que pensam por conta propria.',
      'Com inteligencia artificial treinada em analise fundamentalista, o Analista AUVP ajuda voce a avaliar ativos, comparar indicadores e tomar decisoes embasadas — sem hype, sem promessa.',
      'Porque sardinha esperta nao segue o cardume. Sardinha esperta estuda, analisa e decide com fundamento.',
    ],
  },

  contact: {
    title: 'Contato',
    subtitle: 'Duvidas tecnicas, sugestoes ou parcerias.',
    email: 'contato@investidorsardinha.com.br',
    channels: [
      { icon: 'i-lucide-mail', label: 'Email', value: 'contato@investidorsardinha.com.br', href: 'mailto:contato@investidorsardinha.com.br' },
      { icon: 'i-lucide-message-circle', label: 'Instagram', value: '@investidorsardinha', href: 'https://instagram.com/investidorsardinha' },
      { icon: 'i-lucide-youtube', label: 'YouTube', value: 'Investidor Sardinha', href: 'https://youtube.com/@investidorsardinha' },
    ],
  },

  howWorks: {
    title: 'Como funciona a plataforma',
    steps: [
      { icon: 'i-lucide-user-plus', title: 'Crie sua conta', description: 'Cadastro gratuito em menos de 1 minuto. Sem cartao de credito.' },
      { icon: 'i-lucide-bar-chart-3', title: 'Analise o mercado', description: 'Acesse indicadores fundamentalistas, cotacoes em tempo real e dados da B3.' },
      { icon: 'i-lucide-calculator', title: 'Use as ferramentas AUVP', description: 'Calcule preco teto, projete dividendos e simule cenarios de longo prazo.' },
      { icon: 'i-lucide-message-circle', title: 'Consulte o Analista AUVP', description: 'IA treinada em analise fundamentalista disponivel 24/7.' },
    ],
  },

  nav: {
    menuLabel: 'Menu',
    toolsLabel: 'Ferramentas',
    overview: 'Visao Geral',
    wallet: 'Carteira',
    chat: 'Analista',
    advisorArea: 'Area do assessor',
    settings: 'Configuracoes',
    calculators: 'Ferramentas AUVP',
    guides: 'Guias',
    dividends: 'Proventos',
    downloadApp: 'Baixar app',
    logout: 'Sair',
    hide: 'Ocultar',
    show: 'Mostrar',
    login: 'Entrar',
    register: 'Criar conta',
    mobileAiLabel: 'Analista AUVP',
    mobileAiAccess: 'Acesse gratuitamente',
    mobileAiLocked: 'Analista AUVP bloqueado',
    mobileAiLockedSub: 'Faca login para acessar',
    mobileAiDescription: 'Analista com Inteligencia Artificial',
    mobileAiDescriptionSub: 'Entre na plataforma para consultar o Analista AUVP e receber analises fundamentalistas.',
    mobileCalc: 'Ferramentas AUVP',
    mobileGuides: 'Guias de investimento',
    mobileHome: 'Inicio',
    footerGlossaryTitle: 'Termos do Mercado',
    footerCalc: 'Ferramentas AUVP',
    footerJuros: 'Juros Compostos',
    footerPrecoTeto: 'Preco Teto (Graham/Bazin)',
    footerDY: 'Dividend Yield',
    footerAI: 'Analista AUVP',
    footerGuides: 'Guias de Investimento',
    footerGlossary: 'Glossario',
    footerStocks: 'Acoes',
    footerFiis: 'FIIs',
    footerDividends: 'Dividendos',
    footerAbout: 'Sobre',
    footerHowWorks: 'Como funciona',
    footerContact: 'Contato',
    footerDownload: 'Download',
    footerTerms: 'Termos de Uso',
    footerPrivacy: 'Privacidade',
    footerCookies: 'Cookies',
    footerCopyright: 'Todos os direitos reservados.',
    headerCalc: 'Ferramentas AUVP',
    headerAI: 'Analista com IA',
  },

  homeTexts: {
    marketTitle: 'Mercado em tempo real',
    marketSubtitle: 'Dados da B3 atualizados. Sem delay, sem enrolacao.',
    filtersTitle: 'Filtros avancados',
    categoriesEyebrow: 'Classes de ativos',
    categoriesTitle: 'Analise por categoria',
    categoriesSubtitle: 'Selecione a classe de ativo e acesse indicadores fundamentalistas.',
    guidesTitle: 'Base de conhecimento',
    guidesSubtitle: 'Guias tecnicos, analises e ferramentas para investidores fundamentalistas.',
    aiCtaEyebrow: 'Analista AUVP',
    aiCtaTitle: 'Analise fundamentalista com IA',
    aiCtaSubtitle: 'Consulte indicadores, compare ativos e receba analises embasadas em dados concretos.',
    aiCtaQuestions: [
      { icon: 'i-lucide-bar-chart-3', question: 'Qual o P/L justo pra WEGE3?', category: 'Valuation' },
      { icon: 'i-lucide-scale', question: 'Compare ITUB4 vs BBDC4', category: 'Comparativo' },
      { icon: 'i-lucide-building-2', question: 'Melhores FIIs por P/VP', category: 'FIIs' },
      { icon: 'i-lucide-target', question: 'Preco teto de Bazin pra BBAS3', category: 'Preco Teto' },
      { icon: 'i-lucide-shield-check', question: 'Margem de seguranca ideal', category: 'Risco' },
      { icon: 'i-lucide-coins', question: 'Top 10 pagadores de dividendos', category: 'Dividendos' },
    ],
  },

  theme: {
    mode: 'light',
    borderRadius: 'sharp',
    animation: 'snappy',
    backgroundPattern: 'grid',
  },

  investorChecklist: {
    sectionTitle: 'Roteiro do Investidor',
    sectionSubtitle: 'O caminho AUVP para investir com fundamento — passo a passo, sem atalhos.',
    steps: [
      {
        number: 1,
        title: 'Monte sua reserva de emergencia',
        description: 'Antes de investir, tenha 6 a 12 meses de custo de vida em renda fixa de alta liquidez. Esse e o alicerce.',
        icon: 'i-lucide-shield',
        status: 'recommended',
        ctaText: 'Calcular reserva',
        ctaLink: '/calculadora',
      },
      {
        number: 2,
        title: 'Elimine dividas caras',
        description: 'Cartao de credito, cheque especial e financiamentos com juros acima de 1% ao mes destroem patrimonio. Quite primeiro.',
        icon: 'i-lucide-ban',
        status: 'available',
        ctaText: 'Simular quitacao',
        ctaLink: '/calculadora',
      },
      {
        number: 3,
        title: 'Entenda os indicadores fundamentalistas',
        description: 'P/L, P/VP, ROE, margem liquida, DY — aprenda a ler os numeros antes de comprar qualquer ativo.',
        icon: 'i-lucide-bar-chart-3',
        status: 'available',
        ctaText: 'Ver glossario',
        ctaLink: '/glossario',
      },
      {
        number: 4,
        title: 'Defina sua estrategia de alocacao',
        description: 'Renda fixa, acoes, FIIs, ativos internacionais — distribua de acordo com seu perfil e horizonte de tempo.',
        icon: 'i-lucide-pie-chart',
        status: 'available',
        ctaText: 'Explorar categorias',
        ctaLink: '/acoes',
      },
      {
        number: 5,
        title: 'Analise antes de comprar',
        description: 'Use preco teto (Graham/Bazin), compare indicadores e consulte o Analista AUVP. Nunca compre por dica.',
        icon: 'i-lucide-search',
        status: 'locked',
        ctaText: 'Usar ferramentas',
        ctaLink: '/calculadora',
      },
      {
        number: 6,
        title: 'Invista com consistencia',
        description: 'Aportes mensais, reinvestimento de dividendos e paciencia. Buy and hold funciona no longo prazo — os dados comprovam.',
        icon: 'i-lucide-repeat',
        status: 'locked',
        ctaText: 'Simular aportes',
        ctaLink: '/calculadora',
      },
    ],
    footerText: 'Baseado na metodologia',
    footerLink: 'https://auvp.com.br',
    footerLinkText: 'AUVP — A Unica Verdade Possivel',
  },

  // Sardinha uses the "AUVP research paper" layout — the hero self-contains
  // everything: panorama do pregão, §1 radar, §2 screener, §3 setores,
  // §4 calendário, §5 notas do professor, §6 ecossistema AUVP e closing.
  // Nenhuma outra seção é renderizada — a página inteira é o paper.
  homeSections: [
    { id: 'hero', visible: true },
    { id: 'market', visible: false },
    { id: 'guides', visible: false },
    { id: 'investorChecklist', visible: false },
    { id: 'metrics', visible: false },
    { id: 'categories', visible: false },
    { id: 'featureTabs', visible: false },
    { id: 'aiCta', visible: false },
    { id: 'educational', visible: false },
    { id: 'products', visible: false },
    { id: 'trustBar', visible: false },
    { id: 'testimonials', visible: false },
    { id: 'marquee', visible: false },
  ],

  educational: {
    sectionTitle: 'Conteudo AUVP',
    sectionSubtitle: 'Analises, aulas e conteudos do Raul Sena para investidores fundamentalistas',
    items: [
      {
        type: 'video',
        title: 'Como analisar uma acao do zero',
        description: 'Passo a passo completo para fazer analise fundamentalista de qualquer empresa.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        url: 'https://youtube.com/@investidorsardinha',
        duration: '25:40',
        badge: 'Popular',
      },
      {
        type: 'video',
        title: 'Preco teto de Graham explicado',
        description: 'Entenda a formula de Benjamin Graham e como aplicar na B3.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        url: 'https://youtube.com/@investidorsardinha',
        duration: '18:20',
      },
      {
        type: 'article',
        title: 'Buy and Hold: a estrategia definitiva',
        description: 'Por que comprar e segurar e a melhor estrategia para a maioria dos investidores.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        url: 'https://investidorsardinha.com.br/blog',
        duration: '10 min',
      },
      {
        type: 'video',
        title: 'Os indicadores que voce PRECISA saber',
        description: 'P/L, P/VP, ROE, margem liquida, DY — tudo explicado com exemplos reais.',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        url: 'https://youtube.com/@investidorsardinha',
        duration: '20:15',
        badge: 'Essencial',
      },
    ],
  },

  products: {
    sectionTitle: 'Ecossistema AUVP',
    sectionSubtitle: 'Ferramentas e formacoes para investidores serios',
    categories: [
      {
        name: 'Formacoes',
        items: [
          {
            title: 'AUVP — A Unica Verdade Possivel',
            description: 'O curso completo de investimentos do Raul Sena. Analise fundamentalista na pratica.',
            image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            url: 'https://auvp.com.br',
            price: 'R$ 1.997',
            badge: 'Carro-chefe',
            rating: 4.9,
            students: '100.000+ alunos',
          },
          {
            title: 'AUVP Analitica',
            description: 'Plataforma de analise de ativos com indicadores avancados.',
            image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            url: 'https://analitica.auvp.com.br',
            price: 'R$ 79,90/mes',
            rating: 4.8,
            students: '30.000+ usuarios',
          },
        ],
      },
      {
        name: 'Livros',
        items: [
          {
            title: 'Investidor Sardinha',
            description: 'O livro que ensina a pensar como investidor, nao como especulador.',
            image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            url: 'https://amzn.to/sardinha',
            price: 'R$ 44,90',
            rating: 4.7,
            students: '200K+ vendidos',
          },
        ],
      },
    ],
  },
}

// ============================================================
// REDENTIA (Plataforma original)
// ============================================================
// Persona: A plataforma de origem — tecnologia financeira pura.
// Profissional, confiavel, data-driven. Sem influenciador,
// a marca e o produto. Estetica dark premium + azul tech.
// Tipografia: Inter — neutra, moderna, profissional.
// ============================================================
const redentia: BrandConfig = {
  name: 'Redentia',
  shortName: 'Redentia',
  slug: 'redentia',
  tagline: 'Investir com inteligencia.',
  subtitle: 'Plataforma de investimentos com IA',
  description: 'Plataforma completa para acompanhar cotacoes, dividendos, analises fundamentalistas e simulacoes de investimentos com inteligencia artificial.',

  founder: {
    name: 'Redentia',
    photo: '',
    role: 'Plataforma de investimentos',
    bio: 'Tecnologia financeira para investidores de todos os niveis. Dados em tempo real, analises com IA e ferramentas inteligentes.',
    signaturePhrase: 'Investir com inteligencia.',
  },

  voice: {
    style: 'premium',
    greeting: 'Ola! Como posso ajudar?',
    ctaPrimary: 'Comecar agora',
    ctaSecondary: 'Ja tenho conta',
    emptyState: 'Nenhum dado disponivel no momento.',
    encouragement: 'Continue acompanhando seus investimentos.',
    error: 'Algo deu errado. Tente novamente em instantes.',
  },

  domain: 'www.redentia.com.br',
  url: 'https://www.redentia.com.br',
  email: 'contato@redentia.com.br',
  privacyEmail: 'privacidade@redentia.com.br',

  // "Bloomberg Terminal Reimaginado" — Redentia v2 brand.
  // Amber primary (authority + warmth), off-black warm bg (not pure #000),
  // terminal-green for positive, saturated red for negative, mono for
  // numbers. Signals "professional financial data tool" at first glance.
  colors: {
    primary: '#F5A623',          // amber Bloomberg (accent, actionable)
    secondary: '#FFC555',        // amber bright (hover / emphasis)
    tertiary: '#14161C',         // charcoal elevated
    positive: '#00D395',         // terminal cyan-green
    negative: '#FF4747',         // saturated red
    neutral: '#8B92A7',          // warm muted
    background: '#0A0B0E',       // off-black warm (not pure)
    surface: '#14161C',          // charcoal elevated
    surfaceHover: '#1B1E26',     // more elevated on hover
    border: '#2A2E39',           // subtle warm border
    text: '#E8EAED',             // off-white warm (not pure)
    textMuted: '#8B92A7',
    inputBg: '#0F1116',
    inputBgHover: '#14161C',
    inputBorder: '#2A2E39',
    gradient: { from: '#F5A623', via: '#FFC555', to: '#FFE082' },
  },

  font: {
    // Inter remains the workhorse UI sans. Display serif and mono are
    // loaded via the plugin and referenced by the new home hero + metrics.
    family: 'Inter',
    google: 'Inter:wght@300..800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600',
    headingWeight: 'font-normal',  // serif display looks heavier without bold
    headingStyle: 'normal-case',
  },

  logo: {
    icon: '/brand/logo-icon.svg',
    full: '/brand/logo-full.svg',
    favicon: '/brand/favicon.png',
    faviconIco: '/brand/favicon.ico',
    faviconSvg: '/brand/favicon.svg',
    appleTouchIcon: '/brand/apple-touch-icon.png',
    icon192: '/brand/icon-192.png',
    icon512: '/brand/icon-512.png',
    og: '/brand/og-image.png',
  },

  seo: {
    title: 'Redentia — Terminal de mercado com IA',
    description: 'Mercado em tempo real, inteligencia sob demanda. Cotacoes, analises fundamentalistas, calculadoras e assessor com IA em um so terminal.',
    locale: 'pt_BR',
    lang: 'pt-BR',
    themeColor: '#0A0B0E',
    keywords: ['redentia', 'terminal financeiro', 'investimentos', 'acoes', 'fiis', 'dividendos', 'analise fundamentalista', 'inteligencia artificial'],
  },

  company: {
    legalName: 'Redentia Tecnologia Ltda.',
    address: '',
    cnpj: '',
  },

  features: {
    showAIAdvisor: true,
    showAppStoreLinks: false,
    showCalculators: true,
    showDividends: true,
    showNews: true,
    showDownloadPage: false,
    showFounderPhoto: false,
    showEcosystemLinks: false,
    showGlossary: true,
    showGuides: true,
    // Redentia: plataforma completa e neutra — tudo ligado por padrão.
    showDividendYieldRanking: true,
    showMonthlyMoversRanking: true,
    showDividendCalendar: true,
    showSectorComparatives: true,
    showMarketCommentaries: true,
  },

  homePage: {
    rankingCard: {
      variant: 'flat',
      showIcon: true,
      iconStyle: 'bare',
      itemsPerCategory: 5,
    },
    stockItem: {
      variant: 'default',
      showLogo: true,
      logoSize: 'md',
      showName: true,
      changeFormat: 'percent',
    },
    categoryCard: {
      variant: 'icon-left',
      columns: 3,
    },
    categories: [
      { label: 'Acoes', to: '/acoes', icon: 'i-lucide-trending-up', description: 'Acompanhe as maiores empresas do Brasil. Cotacoes, fundamentos e dividendos.', cta: 'Explorar acoes' },
      { label: 'FIIs', to: '/fiis', icon: 'i-lucide-building-2', description: 'Fundos imobiliarios com renda passiva mensal. Analise de rendimentos e vacancia.', cta: 'Explorar FIIs' },
      { label: 'ETFs', to: '/etfs', icon: 'i-lucide-bar-chart-3', description: 'Diversificacao instantanea com ETFs. Ibovespa, S&P 500 e indices globais.', cta: 'Explorar ETFs' },
      { label: 'Small Caps', to: '/small-caps', icon: 'i-lucide-rocket', description: 'Empresas de menor capitalizacao com potencial de crescimento acima da media.', cta: 'Explorar small caps' },
      { label: 'Dividendos', to: '/dividendos', icon: 'i-lucide-coins', description: 'Rankings de dividend yield, historico de pagamentos e projecoes de renda passiva.', cta: 'Explorar dividendos' },
      { label: 'BDRs', to: '/search?group=bdrs', icon: 'i-lucide-globe', description: 'Acesso a empresas globais pela B3. Apple, Google, Amazon e mais.', cta: 'Explorar BDRs' },
    ],
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
  },

  social: {
    youtube: '',
    instagram: '',
    twitter: '',
    tiktok: '',
    telegram: '',
    podcast: '',
  },

  ecosystem: [],

  chartColors: {
    positive: '#4ADE80',
    negative: '#8E3939',
    secondary: '#3B82F6',
    neutral: '#6B7280',
  },

  hero: {
    // 'terminal' is Redentia's dedicated variant — Bloomberg-reimagined
    // aesthetic with live ticker, mono labels, serif display, etc. Other
    // tenants that used 'centered' (e.g. Primo Rico) should continue
    // rendering their own layouts without inheriting this one.
    variant: 'terminal',
    badge: '[MARKET.LIVE]',
    title: 'Investir com\ninteligencia.',
    subtitle: 'Mercado em tempo real. Inteligencia sob demanda. Cotacoes, analises fundamentalistas e assessoria com IA em um so terminal.',
    founderQuote: '',
    ctaLabel: 'Comecar agora',
    ctaSecondaryLabel: 'Ja tenho conta',
    ctaIcon: 'i-lucide-terminal',
    trustIndicators: ['Criptografado', 'Sempre gratis', 'Dados em tempo real'],
  },

  header: {
    title: 'Redentia',
    subtitle: 'Plataforma de investimentos',
  },

  sidebar: {
    aiCtaTitle: 'Assessor com IA',
    aiCtaSubtitle: 'Tire suas duvidas gratis',
    planLabel: 'Plano gratuito',
  },

  calculators: {
    pageTitle: 'Calculadoras Financeiras',
    pageSubtitle: 'Ferramentas gratuitas para simular investimentos, analisar acoes e planejar seu patrimonio.',
    labels: {
      jurosCompostos: 'Simulador de Juros Compostos',
      precoTeto: 'Calculadora de Preco Teto',
      dividendYield: 'Calculadora de Dividend Yield',
      aposentadoria: 'Simulador de Aposentadoria',
      acoes: 'Simulador de Acoes',
      quantoInvestir: 'Quanto Investir por Mes',
      impostoRenda: 'Calculadora de Imposto de Renda',
      planejamento: 'Planejamento Financeiro',
    },
  },

  ai: {
    name: 'Assessor Redentia',
    avatar: '/brand/ai-avatar.svg',
    chatTitle: 'Assessoria com IA',
    chatSubtitle: 'Tire duvidas sobre investimentos, compare ativos e receba analises personalizadas.',
    typingLabel: 'ASSESSOR:',
    welcomeTitle: 'Converse com o Assessor Redentia',
    welcomeSubtitle: 'Tire duvidas, compare ativos e receba analises personalizadas com inteligencia artificial.',
    placeholder: 'Pergunte sobre acoes, FIIs, dividendos...',
    suggestedQuestions: [
      'Quais acoes pagam mais dividendos?',
      'PETR4 esta cara ou barata agora?',
      'Como montar uma carteira de FIIs?',
      'Qual a diferenca entre P/L e P/VP?',
      'Quanto preciso investir pra ter R$ 1 milhao?',
    ],
    systemPromptContext: 'Voce e o Assessor Redentia, assistente de IA da plataforma Redentia. Responda de forma profissional, objetiva e didatica. Foque em analise fundamentalista e educacao financeira.',
    ctaGreeting: 'Ola! Sou o Assessor Redentia. Posso ajudar com analises, tirar duvidas e dar recomendacoes personalizadas para seus investimentos.',
    ctaButton: 'Pergunte ao Assessor',
    ctaFeatures: ['Resposta em ~3s', 'IA Treinada', 'Ilimitado'],
  },

  metrics: {
    sectionTitle: 'Velocidade como diferencial.',
    sectionSubtitle: 'Do clique a resposta em segundos',
    // Big number is no longer a raw analysis count (which reads as vanity
    // without context). It's the IA response time — the real differentiator.
    counterLabel: 'segundos em media para a IA responder qualquer duvida',
    stats: [
      { value: '12.500+', label: 'Ativos monitorados' },
      { value: '50.000+', label: 'Simulacoes rodadas' },
      { value: '24/7', label: 'Dados sempre atualizados' },
      { value: 'B3', label: 'Fonte oficial' },
    ],
  },

  testimonials: {
    sectionTitle: 'Para todos os perfis de investidor',
    sectionSubtitle: 'Milhares de investidores ja usam a plataforma para tomar decisoes melhores',
    items: [
      {
        quote: 'A calculadora de juros compostos me mostrou o poder de investir cedo. Comecei com R$ 500/mes e hoje ja tenho uma reserva significativa.',
        name: 'Lucas M.',
        role: 'Investidor iniciante, SP',
        metrics: [{ value: '5h', label: 'economizadas/semana' }, { value: '+23%', label: 'em 1 ano' }],
      },
      {
        quote: 'A IA me ajudou a entender indicadores que antes pareciam impossiveis. Hoje analiso FIIs com confianca.',
        name: 'Carolina S.',
        role: 'Analista de marketing, RJ',
        metrics: [{ value: '12', label: 'FIIs na carteira' }, { value: 'R$ 850', label: 'dividendos/mes' }],
      },
      {
        quote: 'Uso a plataforma todo dia antes de operar. Os dados em tempo real me dao seguranca nas decisoes.',
        name: 'Roberto A.',
        role: 'Investidor, MG',
        metrics: [{ value: '~3s', label: 'resposta da IA' }, { value: '24/7', label: 'monitoramento' }],
      },
    ],
  },

  trustBar: {
    text: 'Tudo o que voce precisa em um so lugar',
    footnote: 'Dados oficiais da B3 · LGPD-compliant · 100% gratuito',
    // Partners transformed into "proof pillars" — not broker endorsements.
    // Each entry represents a verifiable capability, not a partnership.
    partners: [
      '12.500+ ativos',
      'Dados B3 em tempo real',
      'Analise com IA',
      'Calculadoras avancadas',
      'Carteira consolidada',
      'Alertas personalizados',
    ],
  },

  footer: {
    tagline: 'Investir com inteligencia.',
    newsletterCta: 'Receba insights direto no seu email',
    sections: { tools: 'Ferramentas', resources: 'Recursos', company: 'Empresa', legal: 'Legal' },
  },

  notifications: {
    ctaTitle: 'Ativar notificacoes',
    ctaSubtitle: 'Receba alertas de mercado e dividendos em tempo real',
    ctaButton: 'Ativar agora',
  },

  auth: {
    loginTitle: 'Entrar na Redentia',
    loginSubtitle: 'Preencha seus dados para continuar.',
    registerTitle: 'Crie sua conta gratuita',
    registerSubtitle: 'Comece a acompanhar seus investimentos com inteligencia.',
    termsText: 'Ao criar sua conta, voce concorda com os Termos de Uso e Politica de Privacidade.',
  },

  about: {
    title: 'Sobre a Redentia',
    paragraphs: [
      'A Redentia e uma plataforma de investimentos que combina tecnologia de ponta com inteligencia artificial para democratizar o acesso a informacao financeira de qualidade.',
      'Oferecemos cotacoes em tempo real, analises fundamentalistas, calculadoras financeiras e assessoria com IA — tudo em um unico lugar, gratuito e acessivel.',
      'Nossa missao e empoderar investidores de todos os niveis com ferramentas profissionais e dados confiaveis para tomadas de decisao mais inteligentes.',
      'Comprometidos com transparencia, seguranca e inovacao, transformamos a experiencia de investir no Brasil.',
    ],
  },

  contact: {
    title: 'Fale conosco',
    subtitle: 'Duvidas, sugestoes ou parcerias? Estamos aqui.',
    email: 'contato@redentia.com.br',
    channels: [
      { icon: 'i-lucide-mail', label: 'Email', value: 'contato@redentia.com.br', href: 'mailto:contato@redentia.com.br' },
    ],
  },

  howWorks: {
    title: 'Como funciona a Redentia',
    steps: [
      { icon: 'i-lucide-user-plus', title: 'Crie sua conta gratis', description: 'Cadastro rapido, sem cartao de credito. Comece em menos de 1 minuto.' },
      { icon: 'i-lucide-search', title: 'Explore o mercado', description: 'Acompanhe cotacoes em tempo real, analise fundamentos e compare ativos.' },
      { icon: 'i-lucide-calculator', title: 'Simule seus investimentos', description: 'Use as calculadoras para planejar aposentadoria, calcular preco teto e mais.' },
      { icon: 'i-lucide-message-circle', title: 'Pergunte a IA', description: 'Tire duvidas com o Assessor Redentia — disponivel 24/7 com respostas em segundos.' },
    ],
  },

  nav: {
    menuLabel: 'Menu',
    toolsLabel: 'Ferramentas',
    overview: 'Visao Geral',
    wallet: 'Sua carteira',
    chat: 'Chat',
    advisorArea: 'Area do assessor',
    settings: 'Configuracoes',
    calculators: 'Calculadoras',
    guides: 'Guias',
    dividends: 'Proventos',
    downloadApp: 'Baixar app',
    logout: 'Sair',
    hide: 'Ocultar',
    show: 'Mostrar',
    login: 'Entrar',
    register: 'Cadastrar',
    mobileAiLabel: 'Assessoria IA',
    mobileAiAccess: 'Acesse de graca',
    mobileAiLocked: 'Assessoria IA bloqueada',
    mobileAiLockedSub: 'Faca login para acessar',
    mobileAiDescription: 'Assessoria com Inteligencia Artificial',
    mobileAiDescriptionSub: 'Entre na plataforma para conversar com a IA e receber recomendacoes.',
    mobileCalc: 'Calculadora inteligente',
    mobileGuides: 'Guias de investimento',
    mobileHome: 'Inicio',
    footerGlossaryTitle: 'Termos do Mercado',
    footerCalc: 'Calculadoras',
    footerJuros: 'Juros Compostos',
    footerPrecoTeto: 'Preco Teto',
    footerDY: 'Dividend Yield',
    footerAI: 'Assessoria IA',
    footerGuides: 'Guias de Investimento',
    footerGlossary: 'Glossario',
    footerStocks: 'Acoes',
    footerFiis: 'FIIs',
    footerDividends: 'Dividendos',
    footerAbout: 'Sobre',
    footerHowWorks: 'Como funciona',
    footerContact: 'Contato',
    footerDownload: 'Download',
    footerTerms: 'Termos de Uso',
    footerPrivacy: 'Privacidade',
    footerCookies: 'Cookies',
    footerCopyright: 'Todos os direitos reservados.',
    headerCalc: 'Calculadoras',
    headerAI: 'Assessoria com IA',
  },

  homeTexts: {
    marketTitle: 'O mercado em tempo real',
    marketSubtitle: 'Altas, baixas e oportunidades. Atualizacao instantanea.',
    filtersTitle: 'Filtros inteligentes',
    categoriesEyebrow: 'Explore por categoria',
    categoriesTitle: 'Encontre seu proximo investimento',
    categoriesSubtitle: 'Acoes, FIIs, ETFs, BDRs e muito mais.',
    guidesTitle: 'Conhecimento que gera resultados',
    guidesSubtitle: 'Guias praticos, analises e estrategias.',
    aiCtaEyebrow: 'Assessoria com IA',
    aiCtaTitle: 'Tire suas duvidas em segundos',
    aiCtaSubtitle: 'Pergunte qualquer coisa sobre investimentos. Nossa IA responde instantaneamente.',
    aiCtaQuestions: [
      { icon: 'i-lucide-scale', question: 'Qual a diferenca entre acoes e FIIs?', category: 'Conceitos' },
      { icon: 'i-lucide-coins', question: 'Como funcionam os dividendos?', category: 'Renda Passiva' },
      { icon: 'i-lucide-pie-chart', question: 'O que e diversificacao?', category: 'Estrategia' },
      { icon: 'i-lucide-wallet', question: 'Quanto devo investir por mes?', category: 'Planejamento' },
      { icon: 'i-lucide-search', question: 'Como escolher boas acoes?', category: 'Analise' },
      { icon: 'i-lucide-trending-up', question: 'Vale a pena investir em ETFs?', category: 'Produtos' },
    ],
  },

  theme: {
    mode: 'dark',
    borderRadius: 'rounded',
    animation: 'smooth',
    backgroundPattern: 'gradient',
  },

  // Home section order + visibility. Trimmed down from the original 8
  // sections to 7 — `featureTabs` was removed because it largely duplicates
  // `categories` (both lead to /acoes, /fiis, /etfs, etc). This shaves
  // ~600px of vertical scroll on desktop and ~1000px on mobile.
  homeSections: [
    { id: 'hero', visible: true },
    { id: 'trustBar', visible: true },
    { id: 'market', visible: true },
    { id: 'metrics', visible: true },
    { id: 'featureTabs', visible: false },
    { id: 'categories', visible: true },
    { id: 'aiCta', visible: true },
    { id: 'apiProduct', visible: true },
    { id: 'creativeProduct', visible: true },
    { id: 'educational', visible: false },
    { id: 'products', visible: false },
    { id: 'guides', visible: true },
    { id: 'testimonials', visible: true },
    { id: 'marquee', visible: false },
  ],

  educational: {
    sectionTitle: 'Aprenda a investir',
    sectionSubtitle: 'Conteudos educacionais para todos os niveis',
    items: [],
  },

  products: {
    sectionTitle: 'Ferramentas',
    sectionSubtitle: 'Tudo que voce precisa para investir melhor',
    categories: [],
  },

}

// ============================================================
// NORTE CAPITAL (Assessoria)
// ============================================================
// Persona: Assessoria de investimentos premium. Tom institucional,
// confiavel, discreto — estetica de "private bank". Publico: investidor
// com patrimonio em construcao ou consolidado que valoriza assessor
// humano + tecnologia. Foco em preservacao de patrimonio e longo prazo.
// Diferencial: consolidador de carteira, assessor humano + IA,
// credenciais CVM/Ancord.
// Estetica: light mode premium + navy profundo + ambar dourado fosco —
// classica, refinada, com sensacao de "banco privado de Genebra".
// Tipografia: Inter — limpa, institucional, neutra.
// ============================================================
const norteCapital: BrandConfig = {
  name: 'Norte Capital',
  shortName: 'Norte',
  slug: 'norte-capital',
  tagline: 'Sua direcao. Nosso compromisso.',
  subtitle: 'Assessoria de investimentos premium',
  description: 'Assessoria de investimentos premium com plataforma completa: acompanhe sua carteira consolidada, receba analises personalizadas, fale com seu assessor e construa patrimonio de longo prazo — tudo com a Norte Capital.',

  founder: {
    name: 'Norte Capital',
    photo: '',
    role: 'Assessoria de Investimentos',
    bio: 'Assessoria credenciada focada em construcao e preservacao de patrimonio de longo prazo. Unimos tecnologia, dados e atendimento humano para entregar resultados consistentes aos nossos clientes.',
    signaturePhrase: 'Sua direcao. Nosso compromisso.',
  },

  voice: {
    style: 'premium',
    greeting: 'Ola. Como podemos ajudar com seus investimentos hoje?',
    ctaPrimary: 'Acessar Minha Carteira',
    ctaSecondary: 'Falar com Assessor',
    emptyState: 'Nenhum dado disponivel no momento.',
    encouragement: 'Continue acompanhando sua carteira. Estamos aqui para ajudar.',
    error: 'Algo deu errado. Tente novamente ou fale com seu assessor.',
  },

  domain: 'www.nortecapital.com.br',
  url: 'https://www.nortecapital.com.br',
  email: 'contato@nortecapital.com.br',
  privacyEmail: 'privacidade@nortecapital.com.br',

  colors: {
    // Paleta "Navy + Ambar" — classica, premium, inspirada em private banks.
    primary: '#0C1E3C',          // navy profundo
    secondary: '#C8932F',        // ambar dourado fosco (accent)
    tertiary: '#FBFAF5',         // creme claro
    positive: '#2F6B3A',         // verde floresta (sobrio)
    negative: '#B33A3A',         // vermelho tijolo (nao muito agressivo)
    neutral: '#6B6A5E',          // cinza quente
    background: '#F7F5EF',       // off-white creme
    surface: '#FBFAF5',          // creme mais claro
    surfaceHover: '#EFEBDC',     // creme levemente mais escuro no hover
    border: '#E8E3D5',           // bege clarissimo
    text: '#0C1E3C',             // mesmo navy do primary (alto contraste)
    textMuted: '#6B6A5E',        // cinza quente
    inputBg: '#FBFAF5',
    inputBgHover: '#EFEBDC',
    inputBorder: '#D9D3BF',
    logoBg: '#F7F5EF',
    gradient: { from: '#0C1E3C', via: '#1A3866', to: '#2B4E85' },
  },

  font: {
    // Fraunces (display, high-contrast serif) + Inter (body, UI).
    // Fraunces is Google Fonts, free, variable font with oldstyle figures —
    // the editorial/private-bank voice for Norte Capital.
    family: 'Inter',
    google: 'Inter:wght@300..600&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400',
    headingWeight: 'font-normal',  // Fraunces looks heavy at 500/600 naturally
    headingStyle: 'normal-case',
  },

  logo: {
    icon: '/brand/norte/logo-icon.svg',
    full: '/brand/norte/logo-full.svg',
    favicon: '/brand/norte/favicon.svg',
    faviconIco: '/brand/norte/icon-48.png',
    faviconSvg: '/brand/norte/favicon.svg',
    appleTouchIcon: '/brand/norte/icon-180.png',
    icon192: '/brand/norte/icon-192.png',
    icon512: '/brand/norte/icon-512.png',
    og: '/brand/norte/og-image.png',
  },

  seo: {
    title: 'Norte Capital — Assessoria de Investimentos Premium',
    description: 'Assessoria de investimentos premium com carteira consolidada, analises personalizadas, assessor dedicado e tecnologia de ponta. Construa seu patrimonio de longo prazo com a Norte Capital.',
    locale: 'pt_BR',
    lang: 'pt-BR',
    themeColor: '#0C1E3C',
    keywords: ['norte capital', 'assessoria de investimentos', 'private banking', 'wealth management', 'carteira consolidada', 'assessor financeiro', 'patrimonio', 'investimentos longo prazo'],
  },

  company: {
    legalName: 'Norte Capital Assessoria de Investimentos Ltda.',
    address: '',
    cnpj: '',
  },

  features: {
    showAIAdvisor: true,
    showAppStoreLinks: false,
    showCalculators: true,
    showDividends: true,
    showNews: true,
    showDownloadPage: false,
    showFounderPhoto: false,
    showEcosystemLinks: false,
    showGlossary: true,
    showGuides: true,
    // Norte Capital: assessoria premium — cliente acompanhado pelo assessor.
    // Rankings e commentaries poderiam minar o papel do assessor ao
    // incentivar decisões autônomas baseadas em ruído de mercado.
    // Apenas o calendário de dividendos (info contábil neutra) fica ligado.
    showDividendYieldRanking: false,
    showMonthlyMoversRanking: false,
    showDividendCalendar: true,
    showSectorComparatives: false,
    showMarketCommentaries: false,
  },

  homePage: {
    rankingCard: {
      variant: 'flat',
      showIcon: true,
      iconStyle: 'bare',
      itemsPerCategory: 5,
    },
    stockItem: {
      variant: 'default',
      showLogo: true,
      logoSize: 'md',
      showName: true,
      changeFormat: 'percent',
    },
    categoryCard: {
      variant: 'icon-left',
      columns: 3,
    },
    categories: [
      { label: 'Carteira Consolidada', to: '/wallet', icon: 'i-lucide-briefcase', description: 'Veja todos os seus investimentos consolidados em um so lugar. Importe via Excel ou Open Finance.', cta: 'Acessar carteira' },
      { label: 'Acoes', to: '/acoes', icon: 'i-lucide-trending-up', description: 'Cotacoes, fundamentos, preco teto e dividendos das principais empresas da B3.', cta: 'Explorar acoes' },
      { label: 'FIIs', to: '/fiis', icon: 'i-lucide-building-2', description: 'Fundos imobiliarios com analise de rendimentos, vacancia e dividend yield.', cta: 'Explorar FIIs' },
      { label: 'Calculadoras', to: '/calculadora', icon: 'i-lucide-calculator', description: 'Juros compostos, preco teto, aposentadoria, dividend yield e planejamento financeiro.', cta: 'Usar calculadoras' },
      { label: 'Dividendos', to: '/dividendos', icon: 'i-lucide-coins', description: 'Calendario de proventos, rankings de dividend yield e projecao de renda passiva.', cta: 'Ver dividendos' },
      { label: 'Assessor IA', to: '/help', icon: 'i-lucide-bot', description: 'Tire duvidas com o assistente da Norte. Disponivel 24/7 com respostas em segundos.', cta: 'Falar com assessor' },
    ],
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
    // Norte Capital uses the editorial narrated layout — single column,
    // Fraunces display serif, advisor commentary as chapters. See the
    // <section v-if="brand.assetPage.variant === 'editorial'"> branch
    // in pages/asset/[ticker].vue for the implementation.
    variant: 'editorial',
  },

  social: {
    youtube: '',
    instagram: '',
    twitter: '',
    tiktok: '',
    telegram: '',
    podcast: '',
  },

  ecosystem: [],

  chartColors: {
    positive: '#2F6B3A',  // verde floresta, muted
    negative: '#B33A3A',  // vermelho tijolo, muted
    secondary: '#C8932F', // ambar dourado
    neutral: '#6B6A5E',   // cinza quente
  },

  hero: {
    variant: 'editorial',
    badge: '',
    title: 'Sua direcao.\nNosso compromisso.',
    subtitle: 'Assessoria de investimentos para patrimonios que nao se constroem em um clique. Atendemos um numero limitado de familias, cada carteira construida a partir de uma conversa — nao de um formulario.',
    founderQuote: '',
    ctaLabel: 'Agendar uma conversa',
    ctaSecondaryLabel: 'Ja sou cliente',
    ctaIcon: 'i-lucide-arrow-right',
    trustIndicators: ['Credenciada CVM', 'Atendimento por assessor CFA', 'Relatorios mensais', 'Conversa, nao formulario'],
    image: '/brand/norte/background.jpg',
  },

  header: {
    title: 'Norte Capital',
    subtitle: 'Assessoria de Investimentos',
  },

  sidebar: {
    aiCtaTitle: 'Assessor Norte',
    aiCtaSubtitle: 'Tire suas duvidas com IA',
    planLabel: 'Cliente Norte',
  },

  calculators: {
    pageTitle: 'Calculadoras Financeiras',
    pageSubtitle: 'Ferramentas da Norte para simular investimentos, calcular preco teto e planejar seu patrimonio.',
    labels: {
      jurosCompostos: 'Simulador de Juros Compostos',
      precoTeto: 'Calculadora de Preco Teto',
      dividendYield: 'Calculadora de Dividend Yield',
      aposentadoria: 'Simulador de Aposentadoria',
      acoes: 'Simulador de Acoes',
      quantoInvestir: 'Quanto Investir por Mes',
      impostoRenda: 'Calculadora de Imposto de Renda',
      planejamento: 'Planejamento Financeiro',
    },
  },

  ai: {
    name: 'Assessor Norte',
    avatar: '/brand/norte/icon-192.png',
    chatTitle: 'Assessor Norte',
    chatSubtitle: 'Tire duvidas sobre investimentos, compare ativos e receba orientacoes. Para decisoes importantes, fale com seu assessor humano.',
    typingLabel: 'ASSESSOR NORTE:',
    welcomeTitle: 'Fale com o Assessor Norte',
    welcomeSubtitle: 'Nosso assistente com IA complementa o trabalho do seu assessor. Tire duvidas rapidas, compare ativos e receba analises 24/7.',
    placeholder: 'Pergunte sobre sua carteira, acoes, FIIs, dividendos...',
    suggestedQuestions: [
      'Como esta minha carteira hoje?',
      'Quais acoes pagam mais dividendos?',
      'PETR4 esta cara ou barata agora?',
      'Como diversificar meus investimentos?',
      'Qual o preco teto de VALE3?',
    ],
    systemPromptContext: 'Voce e o Assessor Norte, assistente de IA da Norte Capital. Responda de forma profissional, confiavel e didatica. Foque em analise fundamentalista, renda passiva e construcao de patrimonio de longo prazo. Quando a duvida exigir decisao complexa, sugira que o cliente fale com seu assessor humano.',
    ctaGreeting: 'Ola! Sou o Assessor Norte. Posso ajudar com analises, tirar duvidas e orientar sobre seus investimentos. Para decisoes importantes, seu assessor humano esta sempre disponivel.',
    ctaButton: 'Falar com Assessor',
    ctaFeatures: ['Resposta em ~3s', 'Complementa seu assessor', '24/7'],
  },

  metrics: {
    sectionTitle: 'Numeros que geram confianca.',
    sectionSubtitle: 'Resultado consistente para nossos clientes',
    counterLabel: 'Operacoes assessoradas pela Norte (e contando)',
    stats: [
      { value: 'R$ 150M+', label: 'Sob custodia' },
      { value: '500+', label: 'Clientes ativos' },
      { value: '5 anos', label: 'No mercado' },
      { value: '24/7', label: 'Suporte com IA' },
    ],
  },

  testimonials: {
    sectionTitle: 'Clientes que confiam na Norte',
    sectionSubtitle: 'Assessoria que faz diferenca no patrimonio',
    items: [
      {
        quote: 'Com a Norte consegui consolidar todos os meus investimentos em um so lugar. A visao global da carteira mudou completamente a forma como tomo decisoes.',
        name: 'Ricardo M.',
        role: 'Empresario, SP',
        metrics: [{ value: 'R$ 2.1M', label: 'sob assessoria' }, { value: '3 anos', label: 'como cliente' }],
      },
      {
        quote: 'O assessor IA me ajuda no dia a dia com duvidas rapidas, e quando preciso de algo mais complexo, meu assessor humano esta sempre disponivel. Melhor dos dois mundos.',
        name: 'Fernanda L.',
        role: 'Medica, RJ',
        metrics: [{ value: '18', label: 'ativos na carteira' }, { value: 'R$ 3.200', label: 'dividendos/mes' }],
      },
      {
        quote: 'As calculadoras de preco teto e aposentadoria me deram clareza sobre meus objetivos. Hoje invisto com estrategia, nao com emocao.',
        name: 'Eduardo P.',
        role: 'Engenheiro, MG',
        metrics: [{ value: '+31%', label: 'em 2 anos' }, { value: '5h', label: 'economizadas/semana' }],
      },
    ],
  },

  trustBar: {
    text: 'Credenciada junto a',
    footnote: 'Escritorio regulado pela CVM e Ancord',
    partners: ['XP', 'BTG Pactual', 'Genial', 'B3', 'CVM', 'Ancord'],
  },

  footer: {
    tagline: 'Sua direcao. Nosso compromisso.',
    newsletterCta: 'Receba analises e insights da Norte Capital',
    sections: { tools: 'Ferramentas', resources: 'Recursos', company: 'Institucional', legal: 'Legal' },
  },

  notifications: {
    ctaTitle: 'Ativar notificacoes',
    ctaSubtitle: 'Receba alertas de mercado, dividendos e atualizacoes do seu assessor',
    ctaButton: 'Ativar agora',
  },

  auth: {
    loginTitle: 'Acessar Norte',
    loginSubtitle: 'Entre na sua conta para acompanhar seus investimentos.',
    registerTitle: 'Criar conta na Norte',
    registerSubtitle: 'Cadastre-se para acessar a plataforma completa de investimentos.',
    termsText: 'Ao criar sua conta, voce concorda com os Termos de Uso e Politica de Privacidade da Norte Capital.',
  },

  about: {
    title: 'Sobre a Norte Capital',
    paragraphs: [
      'A Norte Capital e uma assessoria focada em construcao de patrimonio de longo prazo. Unimos atendimento humano qualificado com tecnologia de ponta para oferecer a melhor experiencia de investimento aos nossos clientes.',
      'Nossa plataforma consolida todos os seus investimentos em um unico lugar — acoes, FIIs, renda fixa, cripto — com cotacoes em tempo real, analises fundamentalistas e ferramentas de planejamento.',
      'Contamos com um assessor com inteligencia artificial disponivel 24/7 que complementa o trabalho do assessor humano, respondendo duvidas rapidas e gerando analises personalizadas.',
      'Credenciada junto a CVM e Ancord, a Norte opera com total transparencia e seguranca, sempre priorizando os interesses dos nossos clientes.',
    ],
  },

  contact: {
    title: 'Fale com a Norte',
    subtitle: 'Agende uma conversa com nosso time ou envie sua mensagem.',
    email: 'contato@nortecapital.com.br',
    channels: [
      { icon: 'i-lucide-mail', label: 'Email', value: 'contato@nortecapital.com.br', href: 'mailto:contato@nortecapital.com.br' },
      { icon: 'i-lucide-message-circle', label: 'WhatsApp', value: 'Fale conosco', href: 'https://wa.me/' },
    ],
  },

  howWorks: {
    title: 'Como funciona a Norte',
    steps: [
      { icon: 'i-lucide-user-plus', title: 'Crie sua conta', description: 'Cadastro rapido e seguro. Comece a acompanhar seus investimentos em menos de 1 minuto.' },
      { icon: 'i-lucide-briefcase', title: 'Consolide sua carteira', description: 'Importe seus investimentos via Excel ou Open Finance. Veja tudo em um so lugar.' },
      { icon: 'i-lucide-search', title: 'Analise o mercado', description: 'Cotacoes em tempo real, fundamentus, preco teto e calendario de dividendos.' },
      { icon: 'i-lucide-users', title: 'Fale com seu assessor', description: 'IA disponivel 24/7 para duvidas rapidas. Assessor humano para decisoes importantes.' },
    ],
  },

  nav: {
    menuLabel: 'Menu',
    toolsLabel: 'Ferramentas',
    overview: 'Visao Geral',
    wallet: 'Minha Carteira',
    chat: 'Assessor',
    advisorArea: 'Area do assessor',
    settings: 'Configuracoes',
    calculators: 'Calculadoras',
    guides: 'Guias',
    dividends: 'Proventos',
    downloadApp: 'Baixar app',
    logout: 'Sair',
    hide: 'Ocultar',
    show: 'Mostrar',
    login: 'Entrar',
    register: 'Criar conta',
    mobileAiLabel: 'Assessor Norte',
    mobileAiAccess: 'Falar com assessor',
    mobileAiLocked: 'Assessor bloqueado',
    mobileAiLockedSub: 'Faca login para acessar',
    mobileAiDescription: 'Assessor com Inteligencia Artificial',
    mobileAiDescriptionSub: 'Tire duvidas sobre investimentos com o assistente da Norte.',
    mobileCalc: 'Calculadoras',
    mobileGuides: 'Guias',
    mobileHome: 'Inicio',
    footerGlossaryTitle: 'Glossario',
    footerCalc: 'Calculadoras',
    footerJuros: 'Juros Compostos',
    footerPrecoTeto: 'Preco Teto',
    footerDY: 'Dividend Yield',
    footerAI: 'Assessor IA',
    footerGuides: 'Guias',
    footerGlossary: 'Glossario',
    footerStocks: 'Acoes',
    footerFiis: 'FIIs',
    footerDividends: 'Dividendos',
    footerAbout: 'Sobre',
    footerHowWorks: 'Como funciona',
    footerContact: 'Contato',
    footerDownload: 'Download',
    footerTerms: 'Termos de Uso',
    footerPrivacy: 'Privacidade',
    footerCookies: 'Cookies',
    footerCopyright: 'Todos os direitos reservados.',
    headerCalc: 'Calculadoras',
    headerAI: 'Falar com Assessor',
  },

  homeTexts: {
    marketTitle: 'O mercado em tempo real',
    marketSubtitle: 'Cotacoes, altas e baixas atualizadas automaticamente.',
    filtersTitle: 'Filtros inteligentes',
    categoriesEyebrow: 'Ferramentas da Norte',
    categoriesTitle: 'Tudo para seus investimentos',
    categoriesSubtitle: 'Carteira consolidada, cotacoes, calculadoras e assessoria — em um so lugar.',
    guidesTitle: 'Conhecimento para investir melhor',
    guidesSubtitle: 'Guias praticos e analises da Norte.',
    aiCtaEyebrow: 'Assessor com IA',
    aiCtaTitle: 'Tire duvidas em segundos',
    aiCtaSubtitle: 'Nosso assessor com IA complementa o atendimento humano. Disponivel 24/7.',
    aiCtaQuestions: [
      { icon: 'i-lucide-briefcase', question: 'Como esta minha carteira hoje?', category: 'Carteira' },
      { icon: 'i-lucide-coins', question: 'Quais acoes pagam mais dividendos?', category: 'Renda Passiva' },
      { icon: 'i-lucide-scale', question: 'Devo diversificar mais?', category: 'Estrategia' },
      { icon: 'i-lucide-calculator', question: 'Qual o preco teto de VALE3?', category: 'Analise' },
      { icon: 'i-lucide-target', question: 'Quanto preciso para viver de renda?', category: 'Planejamento' },
      { icon: 'i-lucide-building-2', question: 'Quais FIIs recomendados para iniciante?', category: 'FIIs' },
    ],
  },

  theme: {
    mode: 'light',
    borderRadius: 'rounded',
    animation: 'smooth',
    backgroundPattern: 'none',
  },

  // Norte Capital uses the editorial narrated layout — the hero itself
  // already carries most of the page, so we keep only a small set of
  // supporting sections. Everything else is turned off to preserve the
  // "letter from your advisor" tone (no dashboards, no noise).
  homeSections: [
    { id: 'hero', visible: true },
    { id: 'categories', visible: false },
    { id: 'investorChecklist', visible: false },
    { id: 'wealthCalculator', visible: false },
    { id: 'aiCta', visible: false },
    { id: 'metrics', visible: false },
    { id: 'testimonials', visible: false },
    { id: 'guides', visible: false },
    { id: 'trustBar', visible: false },
    { id: 'market', visible: false },
    { id: 'featureTabs', visible: false },
    { id: 'marquee', visible: false },
    { id: 'educational', visible: false },
    { id: 'products', visible: false },
  ],

  investorChecklist: {
    sectionTitle: 'Como funciona a assessoria',
    sectionSubtitle: 'Um processo simples e transparente para cuidar do seu patrimonio',
    steps: [
      { number: 1, title: 'Converse com um assessor', description: 'Entenda seus objetivos, perfil de risco e horizonte de investimento em uma conversa personalizada.', icon: 'i-lucide-users', status: 'recommended' as const, ctaText: 'Agendar conversa', ctaLink: '/help' },
      { number: 2, title: 'Consolide sua carteira', description: 'Importe todos os seus investimentos via Excel ou Open Finance e tenha uma visao completa do seu patrimonio.', icon: 'i-lucide-briefcase', status: 'available' as const, ctaText: 'Importar carteira', ctaLink: '/wallet' },
      { number: 3, title: 'Receba recomendacoes', description: 'Analises personalizadas, rebalanceamento e alertas de oportunidades com base no seu perfil.', icon: 'i-lucide-target', status: 'available' as const, ctaText: 'Ver analises', ctaLink: '/help' },
      { number: 4, title: 'Acompanhe em tempo real', description: 'Monitore cotacoes, dividendos e desempenho da carteira 24/7 pela plataforma ou app.', icon: 'i-lucide-activity', status: 'available' as const, ctaText: 'Explorar plataforma', ctaLink: '/' },
    ],
    footerText: 'Duvidas sobre o processo?',
    footerLink: '/help',
    footerLinkText: 'Fale com nosso assessor',
  },

  wealthCalculator: {
    sectionTitle: 'O impacto de investir com assessoria',
    sectionSubtitle: 'Veja como o tempo e a consistencia transformam seu patrimonio',
    defaultAge: 30,
    compareAge: 40,
    defaultMonthly: 2000,
    annualRate: 0.12,
    targetAge: 65,
    ctaText: 'Falar com assessor',
    ctaLink: '/help',
    labels: {
      ageSlider: 'Idade de inicio',
      monthlySlider: 'Aporte mensal',
      resultPrefix: 'Aos {target} anos voce tera',
      comparisonText: 'Quem comeca aos {age} perde {diff}',
      timeLabel: 'anos investindo',
    },
  },

  educational: {
    sectionTitle: 'Aprenda com a Norte',
    sectionSubtitle: 'Conteudos educacionais para todos os niveis de investidor',
    items: [],
  },

  products: {
    sectionTitle: 'Servicos',
    sectionSubtitle: 'Solucoes completas de assessoria de investimentos',
    categories: [],
  },
}

// ============================================================
// REGISTRO DE MARCAS
// ============================================================
const brands: Record<BrandSlug, BrandConfig> = {
  'redentia': redentia,
  'primo-rico': primoRico,
  'me-poupe': mePoupe,
  'investidor-sardinha': investidorSardinha,
  'norte-capital': norteCapital,
}

// ============================================================
// EXPORT
// ============================================================
export const brand = brands[ACTIVE_BRAND]

/** Slugs that can appear as route prefix (excludes default 'redentia') */
export const BRAND_SLUGS = Object.keys(brands).filter(s => s !== ACTIVE_BRAND) as BrandSlug[]

export type Brand = BrandConfig
export type { BrandSlug, BrandColors }
export { brands }

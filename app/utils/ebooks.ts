// ============================================================
// Ebook catalog, single source of truth for the estudo.* pages
//
// Each ebook drives its own landing page under
// /estudo/{slug}. When adding a new study:
//   1. Add an entry here
//   2. If the landing needs custom copy beyond what fits the
//      schema below, create /pages/estudo/{slug}.vue; otherwise
//      /pages/estudo/[slug].vue renders from this metadata.
//
// Lead capture hits the backend /api/leads endpoint with the
// `source` field set to `ebook:{slug}` so the CRM can attribute
// the lead to the exact study that brought it in.
// ============================================================

export interface EbookStat {
  label: string
  value: string
  context?: string
}

export interface EbookChapter {
  number: string
  title: string
  summary: string
  page: string
}

export interface EbookMeta {
  slug: string
  edition: string
  eyebrow: string
  title: string
  titleAccent: string
  subtitle: string
  description: string
  pages: number
  readingMinutes: number
  publishedAt: string
  coverGradient: readonly [string, string, string]
  /** Optional cover image under /public/ebooks/{slug}/. Falls back to the
   *  CSS mockup in the landing when absent. */
  coverImage?: string
  /** Optional Open Graph image for social previews. */
  ogImage?: string
  heroStats: readonly EbookStat[]
  forWho: readonly string[]
  chapters: readonly EbookChapter[]
  insights: readonly { label: string; value: string; quote: string }[]
  sources: readonly string[]
  downloadHref: string
  seo: {
    title: string
    description: string
  }
}

export const EBOOKS: readonly EbookMeta[] = [
  {
    slug: 'imperio-por-tras-do-feed',
    edition: 'Edição 01 · Abril 2026',
    eyebrow: '[ESTUDO] · FINFLUENCERS · CAPITALIZAÇÃO',
    title: 'O império por trás',
    titleAccent: 'do feed.',
    subtitle:
      'Como influenciadores financeiros estão deixando de ser canais de afiliação para construir as próprias plataformas de investimento, com dados reais de valuations, rodadas, múltiplos e receitas dos principais cases do Brasil e do mundo.',
    description:
      'Um market research de 37 páginas mapeando 45+ cases, 12 deals de M&A e 60+ fontes primárias sobre a nova onda de creator-led asset managers.',
    pages: 37,
    readingMinutes: 45,
    publishedAt: '2026-04-17',
    coverGradient: ['#F5A623', '#FFC555', '#FFE082'],
    heroStats: [
      { label: 'Valuation Grupo Primo', value: 'R$ 1,138 bi', context: 'XP aporte · 05/2025' },
      { label: 'BTG × Empiricus', value: 'R$ 690M', context: 'à vista + earnout R$ 2bi' },
      { label: 'ARK Invest · AUM', value: 'US$ 11,6 bi', context: 'ETFs · abr 2026' },
      { label: 'Cases analisados', value: '45+', context: 'BR + Global' },
    ],
    forWho: [
      'Creators financeiros que pensam em sair de afiliação e construir plataforma própria',
      'Fundadores de fintechs, research houses e consultorias fee-based',
      'Analistas de M&A e private equity cobrindo varejo digital brasileiro',
      'Gestoras e corretoras avaliando aquisição de canais creator-led',
      'Jornalistas e pesquisadores que cobrem o ecossistema de finanças digitais',
    ],
    chapters: [
      {
        number: '01',
        title: 'Panorama e tese central',
        summary:
          'Tamanho do mercado, os 5 estágios da monetização, e por que afiliação é um teto matemático de receita.',
        page: '05',
      },
      {
        number: '02',
        title: 'Cases brasileiros',
        summary:
          'Grupo Primo, Empiricus, Suno, Nord, AUVP, Clube do Valor, Levante. Valuations, rodadas, receitas, AUM.',
        page: '10',
      },
      {
        number: '03',
        title: 'Cases globais',
        summary:
          'ARK Invest, Motley Fool, Ramsey Solutions, MrBeast, Cramer, Public.com, Robinhood, eToro, Titan.',
        page: '17',
      },
      {
        number: '04',
        title: 'Modelos e regulação',
        summary:
          'CTVM/DTVM vs. gestora vs. consultoria vs. ETF. Resoluções CVM 20, 178 e 179. Regime SEC anti-touting.',
        page: '22',
      },
      {
        number: '05',
        title: 'Valuations e unit economics',
        summary:
          'Múltiplos EV/Receita, EV/EBITDA, EV/AUM. ARPU, CAC, LTV. Conversão seguidor → cliente pagante.',
        page: '26',
      },
      {
        number: '06',
        title: 'Riscos',
        summary:
          'CVM × Empiricus, SEC × Kardashian, class action FTX, Atlas Quantum, Faraó dos Bitcoins, Braiscompany.',
        page: '30',
      },
      {
        number: '07',
        title: 'Tendências 2026–2030',
        summary:
          'Consolidação, tokenização (CVM 175), IA reduzindo CAC, internacionalização de finfluencers BR.',
        page: '33',
      },
      {
        number: '08',
        title: 'Framework de decisão',
        summary:
          'Quando montar plataforma própria, qual modelo escolher, capital necessário, equipe mínima.',
        page: '36',
      },
    ],
    insights: [
      {
        label: 'A aritmética que ninguém mostra',
        value: 'R$ 3.830',
        quote:
          'É o ARPU implícito de um cliente XP. O afiliado captura 10 a 30% disso no primeiro ano, e zero a partir do segundo. O creator que vira gestora captura 5 a 15x mais economia por cliente em perpetuidade.',
      },
      {
        label: 'O CPM que move o jogo',
        value: 'US$ 15–50',
        quote:
          'Finance tem o CPM mais alto do YouTube, 10x mais que entretenimento geral. É por isso que advertisers financeiros pagam premium: CACs >US$ 500. E por isso o creator que captura direto mantém toda essa margem.',
      },
      {
        label: 'A janela regulatória',
        value: 'R$ 300 mil',
        quote:
          'Capital regulatório mínimo para virar gestora CVM no Brasil desde a Resolução 21/2021, autorização em ~6 meses. Explica a explosão de gestoras creator-led de 2021 pra cá.',
      },
    ],
    sources: [
      'ANBIMA Finfluence · 9ª edição, 1º semestre 2025',
      'Goldman Sachs · Creator Economy Report (Proj. 2027)',
      'Neofeed · Brazil Journal · InfoMoney · Bloomberg Línea',
      'Press releases e earnings calls: BTG, XP, Nubank, Robinhood, ARK',
      'Crunchbase · PitchBook · Tracxn (M&A database)',
      'CVM · SEC · ANBIMA (documentos regulatórios)',
    ],
    downloadHref: '/ebooks/imperio-por-tras-do-feed/ebook.pdf',
    coverImage: '/ebooks/imperio-por-tras-do-feed/cover.png',
    seo: {
      title:
        'O Império por Trás do Feed, Como Finfluencers Viram Plataformas de Investimento | Redentia',
      description:
        'Market research gratuito: 45+ cases, valuations reais, múltiplos e receitas dos principais finfluencers do Brasil e do mundo. 37 páginas, leitura de ~45 min.',
    },
  },
] as const

export function findEbook(slug: string): EbookMeta | undefined {
  return EBOOKS.find((e) => e.slug === slug)
}

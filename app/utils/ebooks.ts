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

export interface EbookCategory {
  slug: string
  name: string
  description: string
  notableNames: readonly string[]
}

export interface EbookFaq {
  question: string
  answer: string
}

export interface EbookMeta {
  slug: string
  edition: string
  eyebrow: string
  title: string
  titleAccent: string
  /** Plain-text heading used as the H1 (title + titleAccent concatenated).
   *  Kept separate so display markup doesn't leak into SEO values. */
  plainTitle: string
  subtitle: string
  description: string
  pages: number
  readingMinutes: number
  publishedAt: string
  /** ISO date of the most recent content update. Surfaced in the UI and
   *  in Article schema so AI systems and Google freshness heuristics can
   *  reward recently-refreshed research. */
  updatedAt: string
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
  /** 8 Radar Finfluence categories. Renders as a visual map on the landing
   *  AND feeds the programmatic /estudo/categoria/{slug} pages. */
  categories?: readonly EbookCategory[]
  /** Question/answer pairs rendered as a FAQ section + injected as
   *  FAQPage JSON-LD — high-leverage for AI Overviews, ChatGPT and
   *  Perplexity citations (Princeton GEO: +30-40% citation rate). */
  faqs?: readonly EbookFaq[]
  downloadHref: string
  seo: {
    title: string
    description: string
    keywords: readonly string[]
    /** Name used on the author byline and in Article schema. */
    authorName: string
    /** Organization publishing the study. */
    publisherName: string
  }
}

export const EBOOKS: readonly EbookMeta[] = [
  {
    slug: 'imperio-por-tras-do-feed',
    edition: 'Edição 01 · Abril 2026',
    eyebrow: 'Estudo · Finfluencers brasileiros · 2026',
    title: 'Panorama dos finfluencers',
    titleAccent: 'brasileiros.',
    plainTitle: 'Panorama dos finfluencers brasileiros',
    subtitle:
      '33 influenciadores financeiros mapeados em 8 categorias, valuations bilionários dos principais cases e as tendências que vão moldar o próximo ciclo do varejo de investimentos no Brasil.',
    description:
      'Market research de 41 páginas com 33 finfluencers brasileiros, 45+ cases analisados (BR + Global), 12 deals de M&A e 60+ fontes primárias sobre a transição de afiliação para plataforma própria.',
    pages: 41,
    readingMinutes: 45,
    publishedAt: '2026-04-17',
    updatedAt: '2026-04-18',
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
    categories: [
      {
        slug: 'holdings',
        name: 'Holdings',
        description:
          'Creators que construíram holdings multi-vertical (gestora + consultoria + educação + mídia). O topo da pirâmide de monetização.',
        notableNames: ['Thiago Nigro', 'Bruno Perini', 'Charles Mendlowicz'],
      },
      {
        slug: 'educacao-financeira',
        name: 'Educação Financeira',
        description:
          'Creators com foco em conteúdo educacional de massa, cursos, assinaturas e comunidades pagas.',
        notableNames: ['Carol Dias', 'Thiago Godoy', 'Samy Dana', 'Gustavo Cerbasi', 'Nathalia Arcuri'],
      },
      {
        slug: 'research-premium',
        name: 'Research Premium',
        description:
          'Casas de research que viraram gestoras ou consultorias fee-based, com assinantes pagantes e AUM bilionário.',
        notableNames: ['Felipe Miranda', 'Bruce Barbosa', 'Marilia Fontes', 'Rafael Ragazi', 'Luciana Seabra'],
      },
      {
        slug: 'fiis',
        name: 'FIIs',
        description:
          'Creators especializados em fundos imobiliários, com carteiras recomendadas, cursos e gestoras verticais.',
        notableNames: ['Marcos Baroni', 'Bruno Russi', 'Henrique Dias', 'Tiago Reis'],
      },
      {
        slug: 'cripto-web3',
        name: 'Cripto / Web3',
        description:
          'Creators de criptoativos, Web3 e tokenização. O vertical com maior risco regulatório e maior upside de consolidação via CVM 175.',
        notableNames: ['André Franco', 'Kaká Furlan', 'Rocelo Lopes', 'Carol Bitcoin'],
      },
      {
        slug: 'trade-day-trade',
        name: 'Trade / Day Trade',
        description:
          'Creators de trade e day trade — audiência massiva, ticket baixo e alto risco reputacional e regulatório.',
        notableNames: ['Pablo Spyer', 'Carol Paiffer', 'Kleber Stumpf', 'André Machado'],
      },
      {
        slug: 'stock-picking-buy-hold',
        name: 'Stock Picking / B&H',
        description:
          'Creators de ações individuais e estratégias buy-and-hold, frequentemente com assessoria/consultoria fee-based.',
        notableNames: ['Leandro Ávila', 'Louise Barsi', 'Ramiro Gomes', 'Raul Sena'],
      },
      {
        slug: 'populares-pop',
        name: 'Populares / POP',
        description:
          'Creators de alcance massivo com conteúdo pop-friendly: entretenimento + finanças, linguagem coloquial, audiência transversal.',
        notableNames: ['Pablo Lira', 'Rafa Tensol', 'Nath Finanças', 'Eduardo Feldberg'],
      },
    ],
    faqs: [
      {
        question: 'Quanto vale o Grupo Primo de Thiago Nigro?',
        answer:
          'Em dezembro de 2024 a XP fechou um aporte de R$ 197,3 milhões por 17,3% adicionais do Grupo Primo, implicando um valuation de R$ 1,138 bilhão. A XP já era sócia desde 2020. A meta declarada pelo grupo é valuation de R$ 10 bi e R$ 100 bi em AUC em cinco anos.',
      },
      {
        question: 'Quanto o BTG Pactual pagou pela Empiricus?',
        answer:
          'O BTG Pactual anunciou a compra de 100% do Grupo Universa (Empiricus + Vitreo + Money Times + Seu Dinheiro + Real Valor) em 21 de maio de 2021 por R$ 440 milhões à vista + R$ 250 milhões em units BPAC11, totalizando R$ 690 milhões upfront (~US$ 136,7 milhões) com earnout de até 4 anos que pode levar o total a R$ 2 bilhões.',
      },
      {
        question: 'Quantos finfluencers existem no Brasil em 2026?',
        answer:
          'A 9ª edição do Finfluence da ANBIMA (1º semestre de 2025) mapeou 515 finfluencers ativos e 176,3 milhões de seguidores agregados no Brasil, mais que o dobro dos 225 creators catalogados no ano anterior. A ANBIMA monitora 803 perfis ativos em 15 nichos.',
      },
      {
        question: 'O que é um finfluencer e o que diferencia de um assessor de investimentos?',
        answer:
          'Finfluencer é o creator que produz conteúdo sobre investimentos, finanças pessoais ou mercado em escala, operando em uma zona cinzenta entre educação, entretenimento e recomendação regulada. Diferente de um assessor de investimentos (regulado pela Resolução CVM 178/2023), o finfluencer opera sob regras da Resolução CVM 20/2021 quando recomenda ações específicas e precisa de credenciamento via APIMEC.',
      },
      {
        question: 'Quanto custa abrir uma gestora CVM no Brasil?',
        answer:
          'Desde a Resolução CVM 21/2021, abrir uma gestora de recursos exige capital inicial de R$ 300 mil a R$ 5 milhões (dependendo do tipo de administração), com autorização em 3 a 6 meses. Esse corte regulatório explica a explosão de gestoras creator-led no Brasil a partir de 2021. Virar corretora (CTVM/DTVM), por outro lado, exige R$ 30 a 100 milhões de capital e 18 a 36 meses de autorização.',
      },
      {
        question: 'Qual é o CPM do vertical financeiro no YouTube?',
        answer:
          'Finance tem CPM médio de US$ 15 a US$ 50 no YouTube em 2025, o mais alto de todas as verticais da internet, cerca de 10x superior ao CPM de entretenimento geral (US$ 2 a 10). Isso acontece porque os advertisers financeiros (brokers, gestoras, bancos) toleram CACs acima de US$ 500 por cliente.',
      },
      {
        question: 'Quais são os principais riscos regulatórios para finfluencers no Brasil?',
        answer:
          'Os principais casos brasileiros recentes envolvem: CVM × Empiricus (TCC de R$ 4,5 milhões em fev/2020 pelo caso Bettina), Atlas Quantum (multa CVM de R$ 55,8 milhões em maio/2024, prejuízo estimado de R$ 7 bi), Faraó dos Bitcoins (condenação a 19 anos de prisão + R$ 19 bi a ressarcir) e Braiscompany (170 anos de prisão totalizando os sócios em 2025).',
      },
      {
        question: 'Qual o AUM da ARK Invest de Cathie Wood em 2026?',
        answer:
          'A família ARK soma US$ 11,59 bilhões em ETFs em abril de 2026 (StockAnalysis), com o ARKK (Innovation) liderando a US$ 5,74 bi (~49,5% do total). Os 9 ETFs da gestora têm expense ratio médio de 0,75%. O interval fund ARK Venture (ARKVX) saltou para US$ 491 milhões no Q4 de 2025 com posições em OpenAI, SpaceX, Epic Games e Kalshi.',
      },
      {
        question: 'O que o ebook Panorama dos finfluencers brasileiros cobre?',
        answer:
          'O estudo mapeia 33 finfluencers brasileiros em 8 categorias (Holdings, Educação Financeira, Research Premium, FIIs, Cripto/Web3, Trade/Day Trade, Stock Picking/B&H, Populares), 45+ cases analisados no total (BR + Global), 12 deals de M&A mapeados e mais de 60 fontes primárias: press releases, earnings calls do BTG, XP, Nubank, Robinhood, ARK, e documentos regulatórios da CVM, SEC e ANBIMA.',
      },
      {
        question: 'Quanto custa para baixar o estudo completo?',
        answer:
          'O PDF completo de 41 páginas é 100% gratuito. Basta deixar nome e email na landing para receber o link de download direto. Sem cartão de crédito, sem sequência de emails promocionais. A distribuição gratuita faz parte da estratégia da Redentia, que monetiza via plataforma e não via infoproduto.',
      },
    ],
    downloadHref: '/ebooks/imperio-por-tras-do-feed/ebook.pdf',
    coverImage: '/ebooks/imperio-por-tras-do-feed/cover.png',
    ogImage: '/ebooks/imperio-por-tras-do-feed/cover.png',
    seo: {
      title:
        'Panorama dos Finfluencers Brasileiros 2026: 33 Nomes, 8 Categorias, Valuations Reais',
      description:
        'Estudo gratuito de 41 páginas mapeando 33 finfluencers brasileiros em 8 categorias. Valuations reais do Grupo Primo (R$ 1,138 bi), Empiricus (R$ 690M BTG), Suno (40% XP), ARK Invest (US$ 11,6 bi) e mais 45+ cases.',
      keywords: [
        'finfluencers brasileiros',
        'influenciadores financeiros brasil',
        'panorama finfluencers 2026',
        'valuation grupo primo',
        'btg empiricus valuation',
        'suno xp aquisição',
        'ark invest cathie wood aum',
        'motley fool modelo de negócio',
        'creator economy financeira',
        'cvm 178 179 finfluencers',
        'como abrir gestora cvm',
        'afiliado vs gestora valuation',
        'thiago nigro grupo primo',
        'bruno perini renova invest',
        'charles mendlowicz',
      ],
      authorName: 'Redentia Research',
      publisherName: 'Redentia',
    },
  },
] as const

export function findEbook(slug: string): EbookMeta | undefined {
  return EBOOKS.find((e) => e.slug === slug)
}

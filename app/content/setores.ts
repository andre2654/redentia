/**
 * Registry dos setores da B3 (SEO programático /setor). Fonte única do mapa
 * ptSlug (rota) → apiSlug (segmento do GET /sectors/{apiSlug}/tickers) + nome
 * pt-BR + blurb editorial.
 *
 * Os 12 setores vivos vêm do backend (GET /sectors, slugs em inglês). O bucket
 * residual `financial` (6 papéis, praticamente vazio) é OMITIDO do registry —
 * fica de fora do hub e não ganha rota (a rota valida o ptSlug contra este
 * registry e 404a fora dele).
 *
 * Ordem = por tamanho do setor (maior→menor), a mesma prominência do hub.
 * Counts NÃO vivem aqui (são dinâmicos, vêm do GET /sectors) — o registry só
 * guarda o que é estável: identidade e copy.
 */
export interface SetorEntry {
  /** Slug pt-BR kebab da rota /setor/{ptSlug}. */
  ptSlug: string
  /** Slug inglês do backend (GET /sectors/{apiSlug}/tickers). */
  apiSlug: string
  /** Nome pt-BR (hero, cards, breadcrumb). */
  name: string
  /** 1-2 frases honestas do que o setor reúne na B3. */
  blurb: string
}

export const SETORES: SetorEntry[] = [
  {
    ptSlug: 'imobiliario',
    apiSlug: 'real-estate',
    name: 'Imobiliário',
    blurb:
      'Reúne os fundos imobiliários (FIIs) e as construtoras e incorporadoras listadas na B3. É o setor com mais papéis da bolsa, puxado pela quantidade de FIIs.',
  },
  {
    ptSlug: 'financeiro',
    apiSlug: 'financial-services',
    name: 'Serviços financeiros',
    blurb:
      'Bancos, seguradoras, bolsas, meios de pagamento e gestoras. Concentra parte relevante do valor de mercado total da B3.',
  },
  {
    ptSlug: 'consumo-ciclico',
    apiSlug: 'consumer-cyclical',
    name: 'Consumo cíclico',
    blurb:
      'Varejo, vestuário, automóveis, construção residencial, viagens e lazer. Empresas cuja receita acompanha o humor da economia e a renda das famílias.',
  },
  {
    ptSlug: 'industrial',
    apiSlug: 'industrials',
    name: 'Bens industriais',
    blurb:
      'Máquinas, construção pesada, logística, transporte e bens de capital. Ligado ao ciclo de investimento e à infraestrutura do país.',
  },
  {
    ptSlug: 'tecnologia',
    apiSlug: 'technology',
    name: 'Tecnologia',
    blurb:
      'Software, hardware, serviços de TI e plataformas digitais. Inclui muitos BDRs de gigantes globais de tecnologia negociados na B3.',
  },
  {
    ptSlug: 'saude',
    apiSlug: 'healthcare',
    name: 'Saúde',
    blurb:
      'Hospitais, planos de saúde, farmacêuticas e laboratórios. Demanda mais previsível, ligada à população e à regulação do setor.',
  },
  {
    ptSlug: 'utilidades',
    apiSlug: 'utilities',
    name: 'Utilidades públicas',
    blurb:
      'Energia elétrica, saneamento e distribuição de gás. Empresas de concessão, com receita regulada e tradição de pagar dividendos.',
  },
  {
    ptSlug: 'materiais-basicos',
    apiSlug: 'basic-materials',
    name: 'Materiais básicos',
    blurb:
      'Mineração, siderurgia, papel e celulose e químicos. Exportadoras sensíveis ao preço das commodities e ao câmbio.',
  },
  {
    ptSlug: 'consumo-defensivo',
    apiSlug: 'consumer-defensive',
    name: 'Consumo defensivo',
    blurb:
      'Alimentos, bebidas, higiene e supermercados. Consumo básico do dia a dia, historicamente menos sensível a crises e recessões.',
  },
  {
    ptSlug: 'comunicacao',
    apiSlug: 'communication-services',
    name: 'Comunicação',
    blurb:
      'Telecomunicações, mídia, publicidade e internet. Reúne operadoras de telefonia e empresas de conteúdo e conectividade.',
  },
  {
    ptSlug: 'energia',
    apiSlug: 'energy',
    name: 'Energia',
    blurb:
      'Petróleo, gás natural e combustíveis. Puxado pela Petrobras e pela cadeia de óleo e gás listada na bolsa.',
  },
]

/** Lookup O(1) por ptSlug (rota → entry; undefined = 404). */
export const SETORES_BY_PT: Record<string, SetorEntry> = Object.fromEntries(
  SETORES.map((s) => [s.ptSlug, s]),
)

/** Lookup por apiSlug (para casar o count vindo do GET /sectors). */
export const SETORES_BY_API: Record<string, SetorEntry> = Object.fromEntries(
  SETORES.map((s) => [s.apiSlug, s]),
)

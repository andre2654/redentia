/**
 * Inventário de páginas indexáveis do site — fonte única compartilhada por
 * /sitemap.xml e /llms-full.txt (PR-A, Frente 3a do PLANO-REFINO-POS-ATLAS).
 *
 * Regras:
 *  - Estáticas + calculadoras + cenários: hardcoded (espelham app/pages/*;
 *    os slugs de cenário vêm dos maps `scenarios` das páginas [scenario].vue).
 *  - Rankings: derivados do registry canônico (app/content/rankings/registry).
 *  - Teses e ativos: fetch do backend real com try/catch — se o backend
 *    falhar, a seção é omitida (sitemap parcial > sitemap 500).
 *  - Ativos: só STOCK e REIT até a página amadurecer pra ETF/BDR (PR-E).
 *    Ordenados por market cap desc — o llms-full corta o top 100.
 */
import { RANKINGS } from '../../app/content/rankings/registry'

export interface SitePage {
  path: string
  title: string
  description?: string
}

export interface SiteSection {
  id: 'core' | 'calculadoras' | 'cenarios' | 'rankings' | 'institucional' | 'teses' | 'ativos'
  title: string
  description?: string
  pages: SitePage[]
}

const CORE_PAGES: SitePage[] = [
  { path: '/', title: 'Home', description: 'Cotações ao vivo da B3, índices, rankings em destaque e a IA da Redentia.' },
  { path: '/mercado', title: 'Mercado', description: 'Panorama diário do mercado brasileiro: índices, altas, baixas, Tesouro Direto e destaques.' },
  { path: '/noticias', title: 'Notícias', description: 'Notícias do mercado financeiro brasileiro curadas e comentadas.' },
  { path: '/teses', title: 'Teses de investimento', description: 'Teses temáticas com empresas, score de convicção e fontes, revalidadas diariamente.' },
  { path: '/guias', title: 'Guias', description: 'Conteúdo educacional sobre investimentos no Brasil.' },
  { path: '/guias/open-finance', title: 'Guia: Open Finance', description: 'Como conectar suas corretoras via Open Finance e ver a carteira consolidada.' },
  { path: '/calculadoras', title: 'Hub de calculadoras', description: 'Todas as calculadoras financeiras gratuitas da Redentia.' },
  { path: '/rankings', title: 'Hub de rankings', description: '22 rankings de ações, FIIs, BDRs e Tesouro Direto atualizados diariamente.' },
  { path: '/metodologia', title: 'Metodologia', description: 'Como cada calculadora e ranking funciona, fórmulas, fontes oficiais e limitações.' },
]

const INSTITUCIONAL_PAGES: SitePage[] = [
  { path: '/institucional/about', title: 'Sobre a Redentia' },
  { path: '/institucional/contact', title: 'Contato' },
  { path: '/institucional/how-works', title: 'Como funciona' },
  { path: '/institucional/privacy', title: 'Política de privacidade' },
  { path: '/institucional/terms', title: 'Termos de uso' },
  { path: '/institucional/cookies', title: 'Política de cookies' },
]

const CALCULADORA_PAGES: SitePage[] = [
  { path: '/calculadora/juros-compostos', title: 'Calculadora de Juros Compostos', description: 'Simulador com aportes mensais. Fórmula M = C×(1+i)^n aplicada com gráfico e tabela.' },
  { path: '/calculadora/preco-teto', title: 'Calculadora de Preço Teto', description: 'Graham, Bazin, P/L Setorial e VPA aplicados na hora a qualquer ação da B3.' },
  { path: '/calculadora/dividend-yield', title: 'Calculadora de Dividend Yield', description: 'DY atual, projetado e on cost. Fórmula DY = (Dividendos Anuais / Preço) × 100.' },
  { path: '/calculadora/imposto-renda', title: 'Calculadora de IR sobre Ações', description: '15% swing trade, 20% day trade, isenção de R$ 20 mil/mês (códigos DARF 6015 e 8523).' },
  { path: '/calculadora/aposentadoria', title: 'Calculadora de Aposentadoria', description: 'Regra dos 4% aplicada com inflação, INSS e expectativa de vida (FIRE).' },
  { path: '/calculadora/quanto-investir', title: 'Calculadora: Quanto Investir por Mês', description: 'Quanto aportar pra atingir uma meta financeira em prazo definido.' },
  { path: '/calculadora/planejamento', title: 'Planejamento Patrimonial', description: 'Carteira recomendada da B3 baseada em dados históricos reais.' },
  { path: '/calculadora/acoes', title: 'Simulador de Ações', description: 'Backtest com PETR4, ITUB4, VALE3 e dividendos reinvestidos.' },
]

// Slugs = chaves dos maps `scenarios` em app/pages/calculadora/*/[scenario].vue
const CENARIO_PAGES: SitePage[] = [
  { path: '/calculadora/juros-compostos/500-reais-por-mes', title: 'Quanto rende R$ 500 por mês em juros compostos', description: 'R$ 500/mês a 10,5% a.a. = R$ 410 mil em 20 anos, R$ 1,12 mi em 30 anos.' },
  { path: '/calculadora/juros-compostos/1000-reais-por-mes', title: 'Quanto rende R$ 1.000 por mês em juros compostos', description: 'R$ 1.000/mês a 10,5% a.a. = R$ 820 mil em 20 anos, R$ 2,24 mi em 30 anos.' },
  { path: '/calculadora/juros-compostos/aposentar-com-1-milhao', title: 'Como juntar R$ 1 milhão investindo por mês', description: 'Aporte necessário por horizonte (10, 15, 20, 30 anos).' },
  { path: '/calculadora/juros-compostos/100-mil-em-5-anos', title: 'Como juntar R$ 100 mil em 5 anos', description: 'Aporte de R$ 1.280/mês a 10,5% a.a.' },
  { path: '/calculadora/juros-compostos/dobrar-dinheiro-regra-72', title: 'Em quantos anos meu dinheiro dobra (Regra de 72)', description: '72 dividido pela taxa = anos para dobrar (a 10% a.a., 7,2 anos).' },
  { path: '/calculadora/aposentadoria/aposentar-com-5000-mes', title: 'Quanto preciso pra aposentar com R$ 5.000 por mês', description: 'R$ 1,5 milhão via regra dos 4%.' },
  { path: '/calculadora/aposentadoria/aposentar-com-10000-mes', title: 'Como aposentar com R$ 10.000 por mês', description: 'R$ 3 milhões via regra dos 4%.' },
  { path: '/calculadora/aposentadoria/regra-dos-4-por-cento', title: 'Regra dos 4% explicada (Trinity Study)', description: 'Saque seguro do patrimônio na aposentadoria.' },
  { path: '/calculadora/aposentadoria/aposentadoria-fire-aos-45', title: 'FIRE no Brasil: aposentar aos 45', description: 'Lean, Regular e Fat FIRE adaptados ao Brasil.' },
  { path: '/calculadora/quanto-investir/juntar-1-milhao', title: 'Quanto investir pra juntar R$ 1 milhão', description: 'Aporte mensal por horizonte (10, 15, 20 anos).' },
  { path: '/calculadora/quanto-investir/juntar-100-mil', title: 'Quanto investir pra ter R$ 100 mil em 5 anos', description: 'Aporte mensal necessário a 10,5% a.a.' },
  { path: '/calculadora/quanto-investir/entrada-imovel', title: 'Quanto investir pra dar entrada em imóvel', description: 'Cenário típico: R$ 80 mil em 4 anos.' },
  { path: '/calculadora/quanto-investir/aposentadoria-2-milhoes', title: 'Quanto investir pra aposentar com R$ 2 milhões', description: 'Aporte mensal por horizonte de acumulação.' },
]

/**
 * Blue chips e FIIs conhecidos pro destaque do llms-full (o market_cap do
 * backend não serve de régua de relevância — ver comentário no fetch).
 * O llms-full intersecta com a lista viva, então ticker morto some sozinho.
 */
export const FEATURED_TICKERS = [
  'PETR4', 'PETR3', 'VALE3', 'ITUB4', 'BBDC4', 'BBAS3', 'ABEV3', 'WEGE3',
  'B3SA3', 'ITSA4', 'BPAC11', 'SANB11', 'EQTL3', 'RENT3', 'SUZB3', 'RADL3',
  'PRIO3', 'EMBR3', 'VIVT4', 'TIMS3', 'UGPA3', 'VBBR3', 'CSAN3', 'GGBR4',
  'CSNA3', 'USIM5', 'CMIG4', 'CPLE6', 'ELET3', 'SBSP3', 'TOTS3', 'LREN3',
  'MGLU3', 'HAPV3', 'RDOR3', 'TAEE11', 'KLBN11', 'BRFS3', 'JBSS3', 'AZUL4',
  'MXRF11', 'HGLG11', 'KNIP11', 'KNCR11', 'XPML11', 'VISC11', 'BTLG11', 'HGRE11',
]

interface ThesisApiItem {
  id?: string
  title?: string
  description?: string
}

interface TickerApiItem {
  ticker?: string
  name?: string
  type?: string
  market_cap?: number | null
}

/** Base direta do Laravel (mesma fonte do resto do app: runtimeConfig). */
function backendBase(): string {
  return useRuntimeConfig().backendDirectBase || 'https://redentia-api.saraivada.com/api'
}

/**
 * Teses vivas do backend. Cacheado 1h em memória do processo (SWR) — o
 * conteúdo não depende do host da request, então a chave é fixa.
 */
const fetchThesisPages = defineCachedFunction(
  async (): Promise<SitePage[]> => {
    try {
      const res = await $fetch<{ data?: ThesisApiItem[] }>('/theses', {
        baseURL: backendBase(),
        timeout: 10_000,
      })
      const items = Array.isArray(res?.data) ? res.data : []
      return items
        .filter((t): t is ThesisApiItem & { id: string } => typeof t.id === 'string' && t.id.length > 0)
        .map((t) => ({
          path: `/tese/${t.id}`,
          title: t.title || t.id,
          description: t.description || undefined,
        }))
    } catch {
      return [] // backend fora → omite a seção, sitemap continua de pé
    }
  },
  { name: 'site-pages-theses', maxAge: 3600, swr: true, getKey: () => 'all' },
)

/**
 * Ativos /acao/{TICKER} (payload ~1.1MB — por isso o cache de 1h importa).
 * Só STOCK e REIT (ETF/BDR ficam de fora até a página amadurecer — PR-E).
 * Ordenados por market cap desc pro llms-full poder cortar o top N.
 */
const fetchAssetPages = defineCachedFunction(
  async (): Promise<SitePage[]> => {
    try {
      const res = await $fetch<{ data?: TickerApiItem[] }>('/tickers-full', {
        baseURL: backendBase(),
        timeout: 20_000,
      })
      const items = Array.isArray(res?.data) ? res.data : []
      return items
        .filter(
          (t): t is TickerApiItem & { ticker: string } =>
            typeof t.ticker === 'string' &&
            /^[A-Z][A-Z0-9]{3}\d{1,2}$/.test(t.ticker.toUpperCase()) &&
            (t.type === 'STOCK' || t.type === 'REIT'),
        )
        // Ordem alfabética de propósito: o market_cap do /tickers-full vem em
        // escalas misturadas e mutáveis (raw R$, milhões e um número pequeno
        // normalizado — verificado ao vivo 2026-07-13), então ordenar por ele
        // enterra blue chips embaixo de lixo delistado. Pro sitemap a ordem é
        // irrelevante; o llms-full usa FEATURED_TICKERS pra destacar os
        // conhecidos.
        .sort((a, b) => a.ticker.localeCompare(b.ticker))
        .map((t) => ({
          path: `/acao/${t.ticker.toUpperCase()}`,
          title: t.name
            ? `${t.ticker.toUpperCase()} (${t.name.replace(/\s+/g, ' ').trim()})`
            : t.ticker.toUpperCase(),
        }))
    } catch {
      return []
    }
  },
  { name: 'site-pages-assets', maxAge: 3600, swr: true, getKey: () => 'all' },
)

function rankingPages(): SitePage[] {
  return Object.values(RANKINGS).map((r) => ({
    path: `/ranking/${r.slug}`,
    title: r.title,
    description: r.metaDescription,
  }))
}

/**
 * Inventário completo, agrupado. Sitemap achata tudo; llms-full renderiza
 * seção a seção (e corta a cauda de ativos).
 */
export async function getSiteSections(): Promise<SiteSection[]> {
  const [teses, ativos] = await Promise.all([fetchThesisPages(), fetchAssetPages()])

  const sections: SiteSection[] = [
    { id: 'core', title: 'Páginas principais', pages: CORE_PAGES },
    {
      id: 'calculadoras',
      title: 'Calculadoras financeiras',
      description: 'Fórmula e exemplo numérico no topo de cada página.',
      pages: CALCULADORA_PAGES,
    },
    {
      id: 'cenarios',
      title: 'Cenários long-tail de calculadora',
      description: 'Páginas focadas com resposta direta no topo.',
      pages: CENARIO_PAGES,
    },
    {
      id: 'rankings',
      title: 'Rankings',
      description: '22 rankings de ações, FIIs, BDRs e Tesouro Direto, atualizados diariamente após o pregão.',
      pages: rankingPages(),
    },
    {
      id: 'institucional',
      title: 'Institucional',
      pages: INSTITUCIONAL_PAGES,
    },
  ]

  if (teses.length > 0) {
    sections.push({
      id: 'teses',
      title: 'Teses de investimento',
      description: 'Teses temáticas com empresas, convicção e fontes, revalidadas diariamente.',
      pages: teses,
    })
  }

  if (ativos.length > 0) {
    sections.push({
      id: 'ativos',
      title: 'Ativos individuais',
      description: 'Cada ticker tem página própria em /acao/{TICKER} com cotação, fundamentos, dividendos e análise.',
      pages: ativos,
    })
  }

  return sections
}

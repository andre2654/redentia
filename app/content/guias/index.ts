/**
 * Registry dos guias (fonte única do hub /guias E das páginas /guias/[slug]).
 *
 * Decisão de storage (PR4): conteúdo tipado em TS, SEM CMS. O plano apontava
 * Nuxt Content; avaliado, @nuxt/content v3 exige banco SQL (better-sqlite3 /
 * config de adapter no Vercel) e restart do dev server — complexidade real pra
 * servir 1 documento. O caminho mais simples que preserva a experiência é o
 * doc tipado (GuideDoc): SSR perfeito, zero dependência nova, build intocado.
 * A UX é o contrato; migrar o storage pra Content/DB depois é troca de fonte,
 * não de tela.
 *
 * Copy dos cards: verbatim do contrato de UX (Redentia Guias Nu.dc.html).
 */
import type { GuideDoc, GuideMeta, GuideTag } from '~/types/guias'
import { OPEN_FINANCE_GUIDE } from '~/content/guias/open-finance'
import { COMO_INVESTIR_EM_ACOES_GUIDE } from '~/content/guias/como-investir-em-acoes'
import { MELHORES_FIIS_2026_GUIDE } from '~/content/guias/melhores-fiis-2026'
import { SMALL_CAPS_GUIA_COMPLETO_GUIDE } from '~/content/guias/small-caps-guia-completo'
import { CALCULADORA_DE_DIVIDENDOS_GUIDE } from '~/content/guias/calculadora-de-dividendos'
import { TESOURO_DIRETO_PARA_INICIANTES_GUIDE } from '~/content/guias/tesouro-direto-para-iniciantes'
import { ACOES_FIIS_DIVIDENDOS_TODO_MES_GUIDE } from '~/content/guias/acoes-fiis-dividendos-todo-mes'
import { BITCOIN_NA_CARTEIRA_GUIDE } from '~/content/guias/bitcoin-na-carteira'
import { COMO_DECLARAR_INVESTIMENTOS_NO_IR_GUIDE } from '~/content/guias/como-declarar-investimentos-no-ir'
import { COMO_MONTAR_CARTEIRA_DE_INVESTIMENTOS_GUIDE } from '~/content/guias/como-montar-carteira-de-investimentos'
import { CONECTAR_CARTEIRA_AO_CHATGPT_GUIDE } from '~/content/guias/conectar-carteira-ao-chatgpt'
import { MCP_PARA_INVESTIMENTOS_GUIDE } from '~/content/guias/mcp-para-investimentos'

/** Tabs do hub, na ordem exata do design. */
export const GUIDE_TABS: readonly ['Tudo', ...GuideTag[]] = [
  'Tudo',
  'Guia Redentia',
  'Ações',
  'FIIs',
  'Renda fixa',
  'Cripto',
  'Dividendos',
  'Análise',
]

/** Guia em destaque do hub (featured card). */
export const FEATURED_GUIDE: GuideDoc = OPEN_FINANCE_GUIDE

/** Docs escritos, por slug (o hub e o [slug] leem daqui). */
export const GUIDE_DOCS: Record<string, GuideDoc> = {
  [OPEN_FINANCE_GUIDE.slug]: OPEN_FINANCE_GUIDE,
  [COMO_INVESTIR_EM_ACOES_GUIDE.slug]: COMO_INVESTIR_EM_ACOES_GUIDE,
  [CALCULADORA_DE_DIVIDENDOS_GUIDE.slug]: CALCULADORA_DE_DIVIDENDOS_GUIDE,
  [MELHORES_FIIS_2026_GUIDE.slug]: MELHORES_FIIS_2026_GUIDE,
  [SMALL_CAPS_GUIA_COMPLETO_GUIDE.slug]: SMALL_CAPS_GUIA_COMPLETO_GUIDE,
  [TESOURO_DIRETO_PARA_INICIANTES_GUIDE.slug]: TESOURO_DIRETO_PARA_INICIANTES_GUIDE,
  [ACOES_FIIS_DIVIDENDOS_TODO_MES_GUIDE.slug]: ACOES_FIIS_DIVIDENDOS_TODO_MES_GUIDE,
  [BITCOIN_NA_CARTEIRA_GUIDE.slug]: BITCOIN_NA_CARTEIRA_GUIDE,
  [COMO_DECLARAR_INVESTIMENTOS_NO_IR_GUIDE.slug]: COMO_DECLARAR_INVESTIMENTOS_NO_IR_GUIDE,
  [COMO_MONTAR_CARTEIRA_DE_INVESTIMENTOS_GUIDE.slug]: COMO_MONTAR_CARTEIRA_DE_INVESTIMENTOS_GUIDE,
  [CONECTAR_CARTEIRA_AO_CHATGPT_GUIDE.slug]: CONECTAR_CARTEIRA_AO_CHATGPT_GUIDE,
  [MCP_PARA_INVESTIMENTOS_GUIDE.slug]: MCP_PARA_INVESTIMENTOS_GUIDE,
}

/**
 * Grid do hub — os 9 cards do design, na ordem do mock. Cada card resolve o
 * destino via `guideCardTo`: `slug` → página de guia /guias/[slug]; `href` →
 * outra superfície do produto (ex.: Análise PETR4 → /asset/PETR4). Card sem
 * nenhum dos dois mostraria "Em breve" no hub — hoje todos têm destino.
 *
 * KIT (2026-07-13): os 8 guias do kit ganharam `slug` (equity de SEO da
 * Redentia antiga preservado nos slugs). O doc escrito de cada slug vive em
 * app/content/guias/<slug>.ts e está registrado em GUIDE_DOCS acima; os 8
 * resolvem /guias/<slug> → 200. Conteúdo de guia NÃO é inventado aqui.
 */
export const GUIDES: GuideMeta[] = [
  {
    title: 'Como conectar sua carteira ao ChatGPT e ao Claude',
    description: 'A IA responde sobre a sua carteira real da B3, no Brasil, com acesso somente leitura.',
    tag: 'Guia Redentia',
    minutes: 9,
    slug: 'conectar-carteira-ao-chatgpt',
  },
  {
    title: 'MCP para investimentos: o que é e como usar',
    description: 'O padrão que conecta assistentes de IA aos seus dados da B3, sem jargão.',
    tag: 'Guia Redentia',
    minutes: 8,
    slug: 'mcp-para-investimentos',
  },
  {
    title: 'Como investir em ações',
    description: 'Da abertura de conta até a primeira compra, com exemplos reais e passo a passo.',
    tag: 'Ações',
    minutes: 8,
    slug: 'como-investir-em-acoes',
  },
  {
    title: 'Melhores FIIs 2026',
    description: 'Os fundos imobiliários mais promissores, com análise de segmentos e indicadores.',
    tag: 'FIIs',
    minutes: 10,
    slug: 'melhores-fiis-2026',
  },
  {
    title: 'Análise PETR4: vale a pena?',
    description: 'Fundamentos, dividendos e o veredito da IA sobre a Petrobras.',
    tag: 'Análise',
    minutes: 12,
    href: '/asset/PETR4',
  },
  {
    title: 'Tesouro Direto para iniciantes',
    description: 'IPCA+, Selic ou Prefixado: qual proteger o quê, sem juridiquês.',
    tag: 'Renda fixa',
    minutes: 9,
    slug: 'tesouro-direto-para-iniciantes',
  },
  {
    // Título do hub "Dividendos todo mês", mas slug ANTIGO de SEO da Redentia.
    title: 'Dividendos todo mês',
    description: 'Como montar uma escada de proventos que paga suas contas.',
    tag: 'Dividendos',
    minutes: 11,
    slug: 'acoes-fiis-dividendos-todo-mes',
  },
  {
    title: 'Small caps: guia completo',
    description: 'Ações de pequenas empresas: como escolher, riscos e estratégias.',
    tag: 'Ações',
    minutes: 9,
    slug: 'small-caps-guia-completo',
  },
  {
    title: 'Bitcoin na carteira: quanto alocar?',
    description: 'O limite saudável de cripto para cada perfil, segundo os dados.',
    tag: 'Cripto',
    minutes: 6,
    slug: 'bitcoin-na-carteira',
  },
  {
    // Vira guia real (antes apontava pra /calculadoras); href removido.
    title: 'Calculadora de dividendos',
    description: 'Quanto investir para atingir sua meta de renda passiva.',
    tag: 'Dividendos',
    minutes: 7,
    slug: 'calculadora-de-dividendos',
  },
  {
    title: 'Como declarar investimentos no IR',
    description: 'Ações, FIIs e cripto na declaração: o passo a passo completo.',
    tag: 'Guia Redentia',
    minutes: 15,
    slug: 'como-declarar-investimentos-no-ir',
  },
  {
    title: 'Como montar uma carteira de investimentos',
    description: 'Alocação por objetivo, diversificação de verdade e rebalanceamento, sem fórmula mágica.',
    tag: 'Guia Redentia',
    minutes: 10,
    slug: 'como-montar-carteira-de-investimentos',
  },
]

export function getGuideDoc(slug: string): GuideDoc | null {
  return GUIDE_DOCS[slug] ?? null
}

/** Destino real de um card do hub (null = sem página → "Em breve"). */
export function guideCardTo(meta: GuideMeta): string | null {
  if (meta.slug) return `/guias/${meta.slug}`
  return meta.href ?? null
}

/**
 * Resolve os cards de "Continue lendo." de um doc. Guia sem página aponta pro
 * hub (comportamento exato do mock, que linka os relacionados pra listagem).
 */
export function relatedGuideCards(doc: GuideDoc): { title: string; tag: GuideTag; minutes: number; to: string }[] {
  const byTitle = new Map(GUIDES.map((g) => [g.title, g]))
  return doc.related
    .map((title) => byTitle.get(title))
    .filter((g): g is GuideMeta => !!g)
    .map((g) => ({ title: g.title, tag: g.tag, minutes: g.minutes, to: guideCardTo(g) ?? '/guias' }))
}

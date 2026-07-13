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
}

/**
 * Grid do hub — os 9 cards do design, na ordem do mock. Cards sem `slug` nem
 * `href` são guias planejados sem página escrita (o hub mostra "Em breve";
 * conteúdo de guia novo NÃO é inventado aqui).
 */
export const GUIDES: GuideMeta[] = [
  {
    title: 'Como investir em ações',
    description: 'Da abertura de conta até a primeira compra, com exemplos reais e passo a passo.',
    tag: 'Ações',
    minutes: 8,
  },
  {
    title: 'Melhores FIIs 2026',
    description: 'Os fundos imobiliários mais promissores, com análise de segmentos e indicadores.',
    tag: 'FIIs',
    minutes: 10,
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
  },
  {
    title: 'Dividendos todo mês',
    description: 'Como montar uma escada de proventos que paga suas contas.',
    tag: 'Dividendos',
    minutes: 11,
  },
  {
    title: 'Small caps: guia completo',
    description: 'Ações de pequenas empresas: como escolher, riscos e estratégias.',
    tag: 'Ações',
    minutes: 9,
  },
  {
    title: 'Bitcoin na carteira: quanto alocar?',
    description: 'O limite saudável de cripto para cada perfil, segundo os dados.',
    tag: 'Cripto',
    minutes: 6,
  },
  {
    title: 'Calculadora de dividendos',
    description: 'Quanto investir para atingir sua meta de renda passiva.',
    tag: 'Dividendos',
    minutes: 7,
    href: '/calculadoras',
  },
  {
    title: 'Como declarar investimentos no IR',
    description: 'Ações, FIIs e cripto na declaração: o passo a passo completo.',
    tag: 'Guia Redentia',
    minutes: 15,
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

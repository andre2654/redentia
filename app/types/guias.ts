/**
 * Tipos do domínio de guias (PR4). O conteúdo editorial vive em DADOS
 * (app/content/guias/*.ts — decisão do plano, ver PLANO-REDENTIA-NU.md §5),
 * nunca dentro de componente .vue. A UX é o contrato; o storage é detalhe
 * trocável (DB/CMS = V2).
 */
import type { NuFaqItem } from '~/types/market'

export type GuideTag =
  | 'Guia Redentia'
  | 'Ações'
  | 'FIIs'
  | 'Renda fixa'
  | 'Cripto'
  | 'Dividendos'
  | 'Análise'

/**
 * Frontmatter de um guia listado no hub. Três estados possíveis:
 *  - `slug` presente  → guia escrito, card linka /guias/[slug]
 *  - `href` presente  → card que aponta pra outra superfície do produto
 *                       (ex.: Análise PETR4 → /acao/PETR4, como no mock)
 *  - nenhum dos dois  → guia planejado sem página ("em breve" no hub)
 */
export interface GuideMeta {
  title: string
  description: string
  tag: GuideTag
  minutes: number
  slug?: string
  href?: string
}

export interface GuideStat {
  value: string
  label: string
}

/** Blocos de conteúdo de uma seção (html local e confiável — só <strong>). */
export type GuideBlock =
  | { kind: 'p'; html: string }
  | { kind: 'stats'; items: GuideStat[] }
  | { kind: 'steps'; items: string[] }
  | { kind: 'checks'; items: string[] }

export interface GuideSection {
  id: string
  title: string
  blocks: GuideBlock[]
}

export interface GuideCta {
  title: string
  subtitle: string
  to: string
}

/** Documento completo de um guia (página /guias/[slug]). */
export interface GuideDoc {
  slug: string
  tag: GuideTag
  title: string
  /** subtítulo do hero do artigo (copy verbatim do design) */
  dek: string
  /** meta description (SEO) */
  description: string
  /** resumo longo usado no featured card do hub */
  summary: string
  minutes: number
  author: string
  datePublished: string
  dateModified: string
  /** byline do hero: 'Atualizado em 8 jul 2026 · 13 min de leitura' */
  updatedLine: string
  /** meta do featured card do hub: 'atualizado em jul 2026' */
  updatedShort: string
  sections: GuideSection[]
  /** banner de conversão entre a última seção e o FAQ */
  cta: GuideCta
  faqTitle: string
  faq: NuFaqItem[]
  /** títulos (chaves do registry) dos guias de "Continue lendo." */
  related: string[]
}

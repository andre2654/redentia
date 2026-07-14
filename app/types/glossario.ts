/**
 * Tipos do domínio do Glossário (KIT 2026-07-14).
 *
 * Direção do dono: cada termo é uma página de SEO forte, com UM backlink
 * interno obrigatório pra dentro da plataforma (rota REAL) e 2-3 FAQs que
 * viram FAQPage. O conteúdo vive em DADOS (app/content/glossario/grupo-N.ts,
 * fonte única do hub A-Z e das páginas /glossario/[slug]), nunca dentro de
 * componente .vue — mesmo padrão dos guias.
 *
 * HONESTIDADE: `body` traz definição correta e neutra; nada de cotação, DY ou
 * ticker inventado como fato. Exemplos numéricos são só ilustrativos e devem
 * vir marcados no texto ("Exemplo ilustrativo:").
 */
import type { NuFaqItem } from '~/types/market'

/** O backlink FORTE, único, obrigatório — pra uma rota REAL da plataforma. */
export interface GlossaryBacklink {
  /** CTA claro do card (ex.: 'Calcular o dividend yield de qualquer ação'). */
  label: string
  /** Rota interna real (ex.: '/calculadora/dividend-yield'). */
  to: string
}

export interface GlossaryTerm {
  /** slug herdado do glossário antigo (preserva equity de SEO). */
  slug: string
  /** nome de exibição (ex.: 'Dividend Yield', 'P/L'). */
  term: string
  /**
   * 1ª letra MAIÚSCULA pra agrupar no hub A-Z. Números e símbolos caem em '#'.
   * Derive com `glossaryLetter(term)` (registry) pra manter consistência.
   */
  letter: string
  /** 1 frase — vira a base da meta description e o subtítulo do card. */
  short: string
  /**
   * Parágrafos do corpo. HTML local e confiável: só <strong> e
   * <a href="/rota-interna"> (links internos pra outros termos/superfícies).
   */
  body: string[]
  /** 3-5 slugs de termos relacionados (chips que linkam /glossario/{slug}). */
  related: string[]
  /** backlink forte único pra plataforma (rota real) — OBRIGATÓRIO. */
  backlink: GlossaryBacklink
  /** 2-3 perguntas — viram FAQPage (rich snippet). */
  faq: NuFaqItem[]
}

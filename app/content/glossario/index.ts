/**
 * Registry do Glossário (fonte única do hub A-Z /glossario E das páginas
 * /glossario/[slug]). Junta os 4 grupos (grupo-1..4.ts, preenchidos pelos port
 * agents) e expõe os helpers de leitura.
 *
 * KIT 2026-07-14: 80 termos herdando os SLUGS do glossário antigo (equity de
 * SEO). Cada termo = página de SEO forte + 1 backlink interno obrigatório.
 * Conteúdo NÃO é inventado dentro do componente; vive nos grupos.
 */
import type { GlossaryTerm } from '~/types/glossario'
import { GRUPO_1 } from './grupo-1'
import { GRUPO_2 } from './grupo-2'
import { GRUPO_3 } from './grupo-3'
import { GRUPO_4 } from './grupo-4'

const RAW: GlossaryTerm[] = [...GRUPO_1, ...GRUPO_2, ...GRUPO_3, ...GRUPO_4]

/**
 * Letra de agrupamento A-Z pra um nome de termo. Remove acentos, pega o 1º
 * caractere; se não for A-Z (número, símbolo, dígrafo estranho), cai em '#'.
 * Fonte de verdade pro campo `letter` — os grupos devem espelhar isto.
 */
export function glossaryLetter(term: string): string {
  const first = term
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .charAt(0)
    .toUpperCase()
  return /[A-Z]/.test(first) ? first : '#'
}

/** Todos os termos, ordenados alfabeticamente (pt-BR, ignora acento/caixa). */
export const allTerms: GlossaryTerm[] = [...RAW].sort((a, b) =>
  a.term.localeCompare(b.term, 'pt-BR', { sensitivity: 'base' }),
)

const bySlug = new Map(allTerms.map((t) => [t.slug, t]))

/** Termo por slug (null = inexistente → 404 na página). */
export function getTerm(slug: string): GlossaryTerm | null {
  return bySlug.get(slug) ?? null
}

/** Map letra → termos (já ordenados), pra montar as seções do hub A-Z. */
export const byLetter: Map<string, GlossaryTerm[]> = (() => {
  const map = new Map<string, GlossaryTerm[]>()
  for (const t of allTerms) {
    const key = t.letter || glossaryLetter(t.term)
    const bucket = map.get(key)
    if (bucket) bucket.push(t)
    else map.set(key, [t])
  }
  return map
})()

/** Letras COM termos, ordenadas (A-Z e '#' por último). */
export const LETTERS: string[] = [...byLetter.keys()].sort((a, b) => {
  if (a === '#') return 1
  if (b === '#') return -1
  return a.localeCompare(b)
})

/** Alfabeto completo pro nav sticky (letra sem termo fica desabilitada). */
export const ALPHABET: string[] = [
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  '#',
]

/**
 * Navegação alfabética anterior/próximo (âncora de internal linking no rodapé
 * de cada termo). Retorna os vizinhos em `allTerms`.
 */
export function neighbors(slug: string): { prev: GlossaryTerm | null; next: GlossaryTerm | null } {
  const i = allTerms.findIndex((t) => t.slug === slug)
  if (i === -1) return { prev: null, next: null }
  return {
    prev: i > 0 ? allTerms[i - 1]! : null,
    next: i < allTerms.length - 1 ? allTerms[i + 1]! : null,
  }
}

/** Termos relacionados resolvidos (ignora slug quebrado). */
export function relatedTerms(term: GlossaryTerm): GlossaryTerm[] {
  return term.related
    .map((s) => bySlug.get(s))
    .filter((t): t is GlossaryTerm => !!t)
}

export const TERM_COUNT = allTerms.length

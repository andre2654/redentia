/**
 * Contrato de dados das páginas ESTÁTICAS/LEGAIS (institucional + metodologia).
 * O texto é conteúdo jurídico — portado VERBATIM das páginas antigas do Frontend
 * (só acentuação restaurada quando obviamente perdida). A página declara a
 * estrutura tipada abaixo e os componentes legal/LegalHero + legal/LegalDoc
 * renderizam; NADA de cor/estilo aqui — só a árvore do documento.
 *
 * GABARITO pros outros agentes: veja app/pages/institucional/privacy.vue.
 * Aninhamento de listas fica em 1 nível (como no design antigo, ul dentro de li).
 */

/**
 * Trecho inline. String simples quando não há ênfase; array de runs quando o
 * parágrafo/item precisa de <strong> ou de link (email/site). Evita v-html em
 * conteúdo legal — os acentos vivem no dado, não em entidades HTML.
 */
export interface LegalRun {
  text: string
  /** negrito (<strong>) — termos definidos, ênfase do documento. */
  bold?: boolean
  /** link (mailto:… ou https://…). */
  href?: string
  /** abre em nova aba (target=_blank rel=noopener) — links externos/site. */
  external?: boolean
}

/** Texto de um parágrafo ou item: string pura OU sequência de runs. */
export type LegalText = string | LegalRun[]

/** Item de lista: texto + sublista opcional (1 nível de aninhamento). */
export interface LegalListItem {
  text: LegalText
  /** sub-itens aninhados (a ul dentro de li do documento original). */
  children?: LegalListItem[]
}

/**
 * Bloco de corpo. Os três casos cobrem 100% das páginas legais:
 *  - 'p'          parágrafo
 *  - 'list'       lista ordenada (numerada, o list-decimal do original) ou não
 *  - 'subsection' sub-título (h3) + seus próprios blocos (cookies usa isso)
 */
export type LegalBlock =
  | { kind: 'p'; text: LegalText }
  | { kind: 'list'; ordered?: boolean; items: LegalListItem[] }
  | { kind: 'subsection'; id?: string; title: string; blocks: LegalBlock[] }

/** Seção de 1º nível (h2 + âncora estável usada no TOC e no scroll-margin). */
export interface LegalSection {
  id: string
  title: string
  blocks: LegalBlock[]
}

/**
 * Documento legal completo. `intro` = parágrafos de abertura antes da 1ª seção
 * (a lede jurídica). `updated` = data de última atualização; quando presente o
 * LegalHero mostra "Atualizado em …" (ISO 'YYYY-MM-DD' ou texto já formatado).
 */
export interface LegalDocData {
  /** eyebrow azul do hero (ex.: 'Jurídico', 'Institucional'). */
  eyebrow: string
  title: string
  updated?: string
  intro?: LegalBlock[]
  sections: LegalSection[]
}

export type CategoriaGlossario =
  | 'indicador'
  | 'acao'
  | 'fii'
  | 'renda-fixa'
  | 'mercado'
  | 'estrategia'
  | 'geral'

export interface TermoGlossario {
  slug: string
  nome: string
  categoria: CategoriaGlossario
  sigla?: string
  definicaoResumida: string
  definicaoCompleta: string
  formula?: string
  exemplo?: string
  comoUsar?: string
  atencao?: string
  relacionados: string[]
  palavrasChave: string[]
}

export interface CategoriaInfo {
  key: CategoriaGlossario
  label: string
  icon: string
  descricao: string
}

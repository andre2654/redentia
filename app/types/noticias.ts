/**
 * Tipos do domínio notícias (PR3 /noticias).
 *  - shapes da API vivem em types/market.ts (NewsTakeApi, NewsApi — os mesmos
 *    endpoints do bloco de notícias do /mercado)
 *  - Noticias* = view-models da página (shape do design Redentia Noticias Nu.dc.html)
 */
import type { NuDir } from '~/types/market'

/** Direção do impacto por ticker. O backend emite 'up' | 'down' | 'flat'
 *  (verificado em prod 2026-07-11); o mock só tem up/down — 'flat' degrada
 *  pra chip neutra sem triângulo. */
export type NoticiasDir = NuDir | 'flat'

export type NoticiasCat = 'Ações' | 'Macro'

export type NoticiasTab = 'Tudo' | 'Sua carteira' | 'Ações' | 'Macro'

export interface NoticiasTickerChip {
  ticker: string
  dir: NoticiasDir
}

export interface NoticiasItem {
  id: string
  /** veículo por extenso ('Money Times') */
  veiculo: string
  /** tempo relativo já formatado ('há 1 h' · 'hoje, 09:40' · 'ontem' · '10 jul') */
  tempo: string
  titulo: string
  /** URL externa da matéria (null no seed → título sem link) */
  url: string | null
  /** take do Atlas — null no fallback /news/latest (o card some; nunca inventa) */
  leitura: string | null
  /** imagem da matéria — null degrada pro bloco creme do design (image-slot) */
  image: string | null
  cat: NoticiasCat
  tickers: NoticiasTickerChip[]
  publishedAt: string | null
}

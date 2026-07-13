/**
 * Tipos do domínio Tesouro Direto (/tesouro + /tesouro/[slug]).
 *  - *Api = shapes REAIS do backend (verificados ao vivo 2026-07-13:
 *    GET /tesouro?indexer=, GET /tesouro/{slug}, GET /tesouro/{slug}/prices).
 *    O shape do item (TesouroApi) já vive em types/market.ts (PR1 /mercado) —
 *    aqui só o que é novo deste domínio.
 *  - Tesouro*VM = view-models das páginas (montados no useTesouro).
 *
 * Gotchas de runtime verificados:
 *  - indexer vem POR EXTENSO ('Indexados ao IPCA' | 'Prefixado' |
 *    'Indexados a SELIC' | 'Indexados ao IGPM');
 *  - rate vem SEM o '%' ('IPCA + 8,43', '13,81', 'SELIC + 0,01');
 *  - tesouro-reserva-2036 tem rate 'SELIC + -' e rate_numeric null — todo
 *    formatter precisa tolerar rate_numeric null sem vazar o '+ -'.
 */
import type { TesouroApi } from '~/types/market'

/** GET /tesouro/{slug}/prices?range= → data[] (série diária). */
export interface TesouroPricePointApi {
  price_at: string
  buy_price: number | null
  sell_price: number | null
  buy_rate: number | null
  sell_rate: number | null
}

/** Ranges aceitos pelo backend (?range=). */
export type TesouroRange = '30d' | '6m' | '1y' | '5y' | 'full'

/** Eixo do gráfico: cotação (R$, lado venda) ou taxa (% a.a., lado venda). */
export type TesouroChartMode = 'price' | 'rate'

/** Filtro do hub (?indexer=) — 'todos' = sem param na API. */
export type TesouroIndexerFilter = 'todos' | 'IPCA' | 'PREFIXADO' | 'SELIC' | 'IGPM'

/** Ponto simples do gráfico (t = ISO date, v = valor no eixo ativo). */
export interface TesouroSeriesPoint {
  t: string
  v: number
}

/* ————— view-models ————— */

/** Linha da tabela do hub (ordenada por vencimento). */
export interface TesouroRowVM {
  slug: string
  name: string
  /** rótulo curto do indexador ('IPCA+' | 'Prefixado' | 'Selic' | 'IGP-M') */
  indexer: string
  /** 'IPCA + 8,43%' | '13,81%' | 'Selic' (rate_numeric null) */
  rateFmt: string
  /** '15/05/2029' */
  maturityFmt: string
  /** 'R$ 3.763,99' */
  priceBuyFmt: string
}

/** Hero do detalhe (nome + badge + taxa-herói + prazo). */
export interface TesouroHeroVM {
  name: string
  /** rótulo curto do indexador pro badge */
  indexerShort: string
  /** 'IPCA + 8,43%' — o número-herói (taxa é o "preço" do título) */
  rateHero: string
  /** 'a.a.' quando a taxa é numérica; '' no caso Selic sem spread */
  rateSuffix: string
  /** 'Vence em 15/05/2029' */
  maturityLine: string
  /** 'daqui a 2 anos e 10 meses' ('' se vencido/sem data) */
  horizonLine: string
}

/** Card de preço (Compra/Venda) do detalhe. */
export interface TesouroSideCardVM {
  label: string
  priceFmt: string
  /** taxa do lado (hidrata do último ponto da série; '' até carregar) */
  rateFmt: string
  note: string
}

/** Interpretação determinística (regras por indexador/prazo — zero LLM). */
export interface TesouroReadingVM {
  title: string
  body: string
}

/** Payload completo do detalhe (montado no server, SSR-first). */
export interface TesouroPayload {
  slug: string
  raw: TesouroApi
  hero: TesouroHeroVM
  stats: { l: string; v: string }[]
  readings: TesouroReadingVM[]
  faq: { q: string; a: string }[]
  seo: { title: string; description: string }
  /** deep-link pra /calculadora/juros-compostos com a taxa nominal estimada */
  calcHref: string
}

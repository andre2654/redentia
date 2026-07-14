/**
 * Dados do /setor/[slug] — SSR-first (useAsyncData: a tabela sai no HTML da 1ª
 * resposta). Busca em paralelo os ativos do setor (com aggregates) e o índice
 * GET /sectors (pra contagem VERDADEIRA do setor — o aggregates.ticker_count
 * vem capado no teto de 200 do backend).
 *
 * Degrade honesto: backend fora → rows=[] + unavailable=true; a página mostra
 * "dados indisponíveis agora" e a copy educacional continua servida (o SEO não
 * morre com o backend).
 *
 * Apresentação: como o endpoint só preenche market_price/change_percent/
 * market_cap, ordenamos por market_cap desc (nulls por último) pra trazer as
 * empresas maiores pro topo em vez de deixar os BDRs de cap nulo na frente.
 */
import type { SetorEntry } from '~/content/setores'
import type { RankingRowApi } from '~/types/rankings'

function num(v: unknown): number | null {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** market_cap desc, nulls por último (empresas maiores no topo da tabela). */
function byMarketCapDesc(a: RankingRowApi, b: RankingRowApi): number {
  const ca = num(a.market_cap)
  const cb = num(b.market_cap)
  if (ca == null && cb == null) return 0
  if (ca == null) return 1
  if (cb == null) return -1
  return cb - ca
}

export interface SectorAggregatesView {
  /** contagem real do setor (GET /sectors) — sempre exibida. */
  companies: number | null
  /** soma do valor de mercado (só quando > 0; setor 100% FII vem 0 → some). */
  totalMarketCap: number | null
  /** variação média do dia em pontos (null → some). */
  avgChange: number | null
  /** DY médio já ×100 (o backend devolve fração; hoje sempre null → some). */
  avgDividendYield: number | null
  /** P/L médio (hoje sempre null → some). */
  avgTrailingPe: number | null
}

/** Quantas linhas a tabela do detalhe mostra (as maiores por market_cap). */
const TABLE_LIMIT = 50

export function useSectorDetail(entry: SetorEntry) {
  const { data, pending, error } = useAsyncData(
    `setor-${entry.ptSlug}`,
    async () => {
      const [tickers, index] = await Promise.all([
        fetchSectorTickers(entry.apiSlug),
        // índice é barato (12 itens) e dá a contagem verdadeira; falhar aqui
        // não derruba a página (cai no count do aggregates).
        fetchSectorsIndex().catch(() => []),
      ])
      const trueCount =
        index.find((s) => s.slug === entry.apiSlug)?.count ?? null
      return { tickers, trueCount }
    },
    {
      default: () => ({ tickers: null, trueCount: null }),
    },
  )

  const raw = computed<RankingRowApi[]>(() => data.value?.tickers?.data ?? [])
  const rows = computed<RankingRowApi[]>(() =>
    [...raw.value].sort(byMarketCapDesc).slice(0, TABLE_LIMIT),
  )
  const sectorName = computed(() => data.value?.tickers?.sector?.name ?? entry.name)

  const aggregates = computed<SectorAggregatesView>(() => {
    const a = data.value?.tickers?.aggregates
    const dy = num(a?.avg_dividend_yield)
    return {
      companies: data.value?.trueCount ?? num(a?.ticker_count),
      // 0 = nenhuma empresa do setor tem market_cap (100% FII) → trata como
      // ausente pra faixa não mostrar "R$ 0".
      totalMarketCap: (() => {
        const v = num(a?.total_market_cap)
        return v && v > 0 ? v : null
      })(),
      avgChange: num(a?.avg_change_percent),
      avgDividendYield: dy == null ? null : dy * 100,
      avgTrailingPe: num(a?.avg_trailing_pe),
    }
  })

  const count = computed(() => raw.value.length)
  /** backend fora (fetch falhou) — copy 'tente de novo' faz sentido. */
  const unavailable = computed(() => !pending.value && count.value === 0 && !!error.value)
  /** lista legitimamente vazia (sem erro) — estado próprio. */
  const empty = computed(() => !pending.value && count.value === 0 && !error.value)

  return { rows, aggregates, sectorName, count, pending, error, unavailable, empty }
}

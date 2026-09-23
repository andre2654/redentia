/**
 * Dados do /ranking/[slug] — SSR-first (useAsyncData: a tabela limit=50 sai
 * no HTML da 1ª resposta) e reativo a ?type= (acoes|fiis|bdrs; ausente =
 * Todos) pra deep-link "já vir buscado" sem reload.
 *
 * Degrade honesto (regra 7 do plano): backend fora → rows=[] +
 * unavailable=true; a página mostra "dados indisponíveis agora" e a copy
 * educacional continua servida (o SEO não morre com o backend).
 *
 * Entra na tabela a linha com cotação e com a métrica principal, na ordem da
 * API; coluna secundária vazia não tira ninguém (rankingTable). Se nem a
 * métrica principal vier (maiores-lucros com a API de antes do Backend #56),
 * entram as linhas com cotação e "—" onde falta. Nunca SSR vazio.
 * "Todos" manda à API o universo declarado em meta.types (lista de tipos).
 *
 * Caso especial tesouro-direto (endpoint sentinel 'tesouro'): deriva de
 * GET /tesouro ordenando rate_numeric — sem tabs, shape próprio
 * (tesouroRows).
 */
import type {
  RankingAssetType,
  RankingColumnKey,
  RankingMeta,
  RankingRowApi,
  RankingTypeFilter,
  TesouroRankingRow,
} from '~/types/rankings'

/** Linhas exibidas (SSR com a tabela completa no HTML). */
const RANKING_ROWS = 50
export function useRanking(meta: RankingMeta) {
  const route = useRoute()
  const router = useRouter()
  const isTesouro = meta.endpoint === 'tesouro'

  /** ?type= válido só se o ranking suporta a tab; senão cai em 'todos'. */
  const activeType = computed<RankingTypeFilter>(() => {
    const q = String(route.query.type ?? '')
    return (meta.types as string[]).includes(q) ? (q as RankingAssetType) : 'todos'
  })

  /** Troca a tab via URL (?type=) sem reload — deep-linkável. */
  function setType(t: RankingTypeFilter) {
    const query = { ...route.query }
    if (t === 'todos') delete query.type
    else query.type = t
    router.replace({ query })
  }

  const { data, pending, error } = useAsyncData(
    `ranking-${meta.slug}`,
    async (): Promise<{ rows: RankingRowApi[]; columns: RankingColumnKey[]; tesouroRows: TesouroRankingRow[] }> => {
      if (isTesouro) {
        return { rows: [], columns: [], tesouroRows: await fetchTesouroRanking() }
      }
      // "Todos" = o universo que o ranking declara (rankingFetchParams, o
      // mesmo pedido da prévia do hub)
      const resp = await fetchRanking(meta.endpoint, rankingFetchParams(meta, activeType.value))
      const table = rankingTable(resp.data ?? [], rankingColumnsFor(meta, activeType.value), meta.primaryMetric, RANKING_ROWS)
      return { rows: table.rows, columns: table.columns, tesouroRows: [] }
    },
    {
      watch: [activeType],
      default: () => ({ rows: [] as RankingRowApi[], columns: [] as RankingColumnKey[], tesouroRows: [] as TesouroRankingRow[] }),
    },
  )

  const rows = computed(() => data.value?.rows ?? [])
  const tesouroRows = computed(() => data.value?.tesouroRows ?? [])
  const count = computed(() => (isTesouro ? tesouroRows.value.length : rows.value.length))
  /** backend fora (fetch falhou) — copy 'tente de novo' faz sentido. */
  const unavailable = computed(() => !pending.value && count.value === 0 && !!error.value)
  /** lista legitimamente vazia (sem erro; ex.: filtro ?type= sem dado) —
   *  estado que não muda sozinho, pede copy própria. */
  const empty = computed(() => !pending.value && count.value === 0 && !error.value)
  const leader = computed(() => rows.value[0] ?? null)
  /** colunas exibidas: as da tab ativa (rankingColumnsFor), menos as vazias em todas as linhas (rankingTable) */
  const columns = computed(() => (data.value?.columns?.length ? data.value.columns : rankingColumnsFor(meta, activeType.value)))
  const tesouroLeader = computed(() => tesouroRows.value[0] ?? null)

  return {
    rows,
    tesouroRows,
    count,
    pending,
    error,
    unavailable,
    empty,
    leader,
    tesouroLeader,
    activeType,
    setType,
    isTesouro,
    columns,
  }
}

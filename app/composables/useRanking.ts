/**
 * Dados do /ranking/[slug] — SSR-first (useAsyncData: a tabela limit=50 sai
 * no HTML da 1ª resposta) e reativo a ?type= (acoes|fiis|bdrs; ausente =
 * Todos) pra deep-link "já vir buscado" sem reload.
 *
 * Degrade honesto (regra 7 do plano): backend fora → rows=[] +
 * unavailable=true; a página mostra "dados indisponíveis agora" e a copy
 * educacional continua servida (o SEO não morre com o backend).
 *
 * Linha sem cotação ou sem alguma das colunas da página não é impressa com
 * "—": sai da lista (rankingRowComplete), e a API é consultada com folga.
 * "Todos" manda à API o universo declarado em meta.types (lista de tipos).
 *
 * Caso especial tesouro-direto (endpoint sentinel 'tesouro'): deriva de
 * GET /tesouro ordenando rate_numeric — sem tabs, shape próprio
 * (tesouroRows).
 */
import type {
  RankingAssetType,
  RankingMeta,
  RankingRowApi,
  RankingTypeFilter,
  TesouroRankingRow,
} from '~/types/rankings'

/** Linhas exibidas (SSR com a tabela completa no HTML). */
const RANKING_ROWS = 50
/**
 * Pedido à API (máx. 100): linha incompleta sai da tabela
 * (rankingRowComplete), e a superamostra mantém as 50.
 */
const FETCH_LIMIT = 100

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
    async (): Promise<{ rows: RankingRowApi[]; tesouroRows: TesouroRankingRow[] }> => {
      if (isTesouro) {
        return { rows: [], tesouroRows: await fetchTesouroRanking() }
      }
      // "Todos" = o universo que o ranking DECLARA (meta.types), não a B3
      // inteira: o maiores-lucros é SO_ACOES e mostrava 50 BDRs com NVDC34 em
      // 1º, sob um texto dizendo que Petrobras e Itaú lideram.
      const declared = rankingApiTypes(meta.types)
      const t = activeType.value === 'todos' ? (declared.length ? declared : null) : RANKING_API_TYPE[activeType.value]
      const resp = await fetchRanking(meta.endpoint, {
        type: t,
        limit: FETCH_LIMIT,
        side: meta.extraParams?.side as 'top' | 'bottom' | undefined,
        days: meta.extraParams?.days ? Number(meta.extraParams.days) : undefined,
        // DY com FIIs: sem min_cap=0 o filtro default de R$500M zera a lista.
        min_cap: meta.reitMinCapZero && t === 'REIT' ? 0 : undefined,
      })
      const cols = rankingColumnsFor(meta, activeType.value)
      const rows = (resp.data ?? []).filter((r) => rankingRowComplete(r, cols)).slice(0, RANKING_ROWS)
      return { rows, tesouroRows: [] }
    },
    {
      watch: [activeType],
      default: () => ({ rows: [] as RankingRowApi[], tesouroRows: [] as TesouroRankingRow[] }),
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
  /** colunas da tab ativa (ver rankingColumnsFor) */
  const columns = computed(() => rankingColumnsFor(meta, activeType.value))
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

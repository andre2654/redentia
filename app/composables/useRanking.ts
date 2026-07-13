/**
 * Dados do /ranking/[slug] — SSR-first (useAsyncData: a tabela limit=50 sai
 * no HTML da 1ª resposta) e reativo a ?type= (acoes|fiis|bdrs; ausente =
 * Todos) pra deep-link "já vir buscado" sem reload.
 *
 * Degrade honesto (regra 7 do plano): backend fora → rows=[] +
 * unavailable=true; a página mostra "dados indisponíveis agora" e a copy
 * educacional continua servida (o SEO não morre com o backend).
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

const TYPE_TO_API: Record<RankingAssetType, 'STOCK' | 'REIT' | 'BDR'> = {
  acoes: 'STOCK',
  fiis: 'REIT',
  bdrs: 'BDR',
}

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
      const t = activeType.value === 'todos' ? null : TYPE_TO_API[activeType.value]
      const resp = await fetchRanking(meta.endpoint, {
        type: t,
        limit: 50,
        side: meta.extraParams?.side as 'top' | 'bottom' | undefined,
        days: meta.extraParams?.days ? Number(meta.extraParams.days) : undefined,
        // DY com FIIs: sem min_cap=0 o filtro default de R$500M zera a lista.
        min_cap: meta.reitMinCapZero && t === 'REIT' ? 0 : undefined,
      })
      return { rows: resp.data ?? [], tesouroRows: [] }
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
  }
}

/**
 * useIbovBenchmark — % de variacao do IBOV pra um periodo.
 *
 * Substitui os benchmarks hardcoded em CarteiraMetrics. Bate em
 * GET /api/benchmarks/ibov?period=... (publico, cacheado 15min no
 * backend). Tambem cacheia 15min em-memoria do lado frontend pra
 * evitar refetch ao trocar de periodo e voltar.
 */
import type { ResultPeriod } from './useResultadoStats'

interface IbovPayload {
  period: string
  pct: number
  from: string
  to: string
  from_price: number | null
  to_price: number | null
  available: boolean
}

const CACHE = new Map<string, { fetchedAt: number; payload: IbovPayload }>()
const TTL_MS = 15 * 60 * 1000

export function useIbovBenchmark(period: Ref<ResultPeriod> | ComputedRef<ResultPeriod>) {
  const config = useRuntimeConfig()
  const API = config.public.apiBaseUrl as string

  const pct = ref<number>(0)
  const available = ref<boolean>(false)
  const loading = ref<boolean>(false)

  async function fetchPct(p: ResultPeriod) {
    const now = Date.now()
    const cached = CACHE.get(p)
    if (cached && now - cached.fetchedAt < TTL_MS) {
      pct.value = cached.payload.pct
      available.value = cached.payload.available
      return
    }

    loading.value = true
    try {
      const resp = await $fetch<IbovPayload>(`${API}/benchmarks/ibov`, {
        query: { period: p },
      })
      pct.value = resp.pct ?? 0
      available.value = !!resp.available
      CACHE.set(p, { fetchedAt: now, payload: resp })
    } catch {
      pct.value = 0
      available.value = false
    } finally {
      loading.value = false
    }
  }

  watch(period, (p) => fetchPct(p), { immediate: true })

  return { pct, available, loading }
}

/**
 * Simulações salvas das calculadoras (/api/me/simulations) — a utilidade de
 * conta da maior porta de entrada orgânica (decisão do dono, 24/08).
 *
 * O contrato espelha o deep-link das calculadoras: `params` são exatamente os
 * campos de query que a página já aceita (?initial=&monthly=&rate=&years=…),
 * então "reabrir" uma simulação é só aplicar os params de volta. `result` é
 * snapshot de exibição (lista sem recalcular).
 *
 * Fluxo deslogado (a ponte de conversão): `stashPending` guarda a simulação
 * no localStorage antes de mandar pro /login; ao voltar autenticado, o bloco
 * da calculadora chama `savePending` e a simulação aparece salva — a pessoa
 * volta EXATAMENTE pro que estava fazendo, agora com conta.
 */
export interface SimulationVM {
  id: number
  calculator: string
  label: string
  params: Record<string, number>
  result: Record<string, number> | null
  created_at: string | null
}

interface SimListResponse { simulations: SimulationVM[] }
interface SimStoreResponse { simulation: SimulationVM, existing?: boolean }

const PENDING_KEY = 'nu:sim-pending'

interface PendingSim {
  calculator: string
  label: string
  params: Record<string, number>
  result?: Record<string, number>
}

export function useSimulations(calculator: string) {
  const { authFetch } = useApi()
  const { isAuthenticated } = useAuthState()

  const items = ref<SimulationVM[]>([])
  const loading = ref(false)
  const busy = ref(false)
  const error = ref('')
  /** id da última salva/deduplicada — a lista destaca a linha. */
  const lastSavedId = ref<number | null>(null)

  async function hydrate() {
    if (!isAuthenticated.value) return
    loading.value = true
    error.value = ''
    try {
      const res = await authFetch<SimListResponse>(
        `/me/simulations?calculator=${encodeURIComponent(calculator)}`,
        {},
        { redirectOnAuthError: false },
      )
      items.value = res?.simulations ?? []
    } catch {
      error.value = 'Não conseguimos carregar suas simulações agora.'
    } finally {
      loading.value = false
    }
  }

  async function save(sim: Omit<PendingSim, 'calculator'>): Promise<boolean> {
    busy.value = true
    error.value = ''
    try {
      const res = await authFetch<SimStoreResponse>('/me/simulations', {
        method: 'POST',
        body: { calculator, ...sim },
      })
      if (res?.simulation) {
        lastSavedId.value = res.simulation.id
        const rest = items.value.filter((s) => s.id !== res.simulation.id)
        items.value = [res.simulation, ...rest]
      }
      return true
    } catch (e: unknown) {
      const msg = (e as { data?: { message?: string } })?.data?.message
      error.value = msg && msg.includes('limite')
        ? msg
        : 'Não conseguimos salvar agora. Tente de novo em instantes.'
      return false
    } finally {
      busy.value = false
    }
  }

  async function remove(id: number) {
    busy.value = true
    try {
      await authFetch(`/me/simulations/${id}`, { method: 'DELETE' })
      items.value = items.value.filter((s) => s.id !== id)
    } catch {
      error.value = 'Não conseguimos apagar agora. Tente de novo.'
    } finally {
      busy.value = false
    }
  }

  // ——— ponte deslogado → login → salvo ———
  function stashPending(sim: Omit<PendingSim, 'calculator'>) {
    if (!import.meta.client) return
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify({ calculator, ...sim } satisfies PendingSim))
    } catch { /* storage cheio/bloqueado: o login ainda vale a viagem */ }
  }
  /** Salva a simulação estacionada (se for desta calculadora). */
  async function savePending(): Promise<boolean> {
    if (!import.meta.client || !isAuthenticated.value) return false
    let pending: PendingSim | null = null
    try {
      const raw = localStorage.getItem(PENDING_KEY)
      pending = raw ? JSON.parse(raw) as PendingSim : null
    } catch {
      pending = null
    }
    if (!pending || pending.calculator !== calculator) return false
    localStorage.removeItem(PENDING_KEY)
    return save({ label: pending.label, params: pending.params, result: pending.result })
  }

  return { items, loading, busy, error, lastSavedId, hydrate, save, remove, stashPending, savePending }
}

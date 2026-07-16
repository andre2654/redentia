import type { PluggyConnection } from '~/types/pluggy'

/**
 * Conexões Open Finance compartilhadas na tela da carteira (pills do hero +
 * faixa "Saldo em conta" das posições): UM fetch por página via useState —
 * cada useCookie/ref local criaria estado independente e cada consumidor
 * refaria o GET /pluggy/connections.
 *
 * Client-side only (páginas auth-gated); erro degrada pra lista vazia e cada
 * consumidor decide o fallback (pills mostram só a de conectar; a faixa de
 * saldo simplesmente some). `refresh()` recarrega após conectar nova conta.
 */
export function useContasConectadas() {
  const pluggy = usePluggy()
  const connections = useState<PluggyConnection[]>('carteira:contas', () => [])
  const loading = useState<boolean>('carteira:contas-loading', () => true)
  const fetched = useState<boolean>('carteira:contas-fetched', () => false)

  async function refresh() {
    loading.value = true
    try {
      connections.value = await pluggy.listConnections()
    }
    catch { /* consumidores degradam sozinhos */ }
    finally {
      loading.value = false
      fetched.value = true
    }
  }

  function ensure() {
    if (import.meta.server || fetched.value) return
    fetched.value = true
    void refresh()
  }

  /** saldo em conta (só BANK) somado de todas as conexões */
  const saldoTotal = computed(() =>
    connections.value.reduce((s, c) => s + (c.bank_balance ?? 0), 0))

  return { connections, loading, ensure, refresh, saldoTotal }
}

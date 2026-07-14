import type { PluggyConnection, PluggySyncResult } from '~/types/pluggy'

/**
 * Serviço de Open Finance / Pluggy (portado do Frontend antigo pro cliente do
 * Nu). Fala com o backend Laravel via authFetch (proxy same-origin /api/backend
 * → /api/pluggy/*, Bearer sanctum). O fluxo canônico: connect-token → widget
 * (usePluggyWidget) → registerConnection → sync. Reconectar = mesmo connect-token
 * com item_id + updateItem no widget.
 */
export function usePluggy() {
  const { authFetch } = useApi()

  function getConnectToken(itemId?: string): Promise<string> {
    const q = itemId ? `?item_id=${encodeURIComponent(itemId)}` : ''
    return authFetch<{ accessToken: string }>(`/pluggy/connect-token${q}`).then(r => r.accessToken)
  }

  function listConnections(): Promise<PluggyConnection[]> {
    return authFetch<{ data: PluggyConnection[] }>('/pluggy/connections').then(r => r.data ?? [])
  }

  function registerConnection(itemId: string): Promise<{ id: number; status: string }> {
    return authFetch<{ data: { id: number; status: string } }>('/pluggy/connections', {
      method: 'POST',
      body: { item_id: itemId },
    }).then(r => r.data)
  }

  function syncConnection(id: number): Promise<PluggySyncResult> {
    return authFetch<{ data: PluggySyncResult }>(`/pluggy/connections/${id}/sync`, { method: 'POST' }).then(r => r.data)
  }

  function deleteConnection(id: number): Promise<void> {
    return authFetch(`/pluggy/connections/${id}`, { method: 'DELETE' }).then(() => undefined)
  }

  return { getConnectToken, listConnections, registerConnection, syncConnection, deleteConnection }
}

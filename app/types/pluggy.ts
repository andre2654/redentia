/**
 * Contratos de Open Finance / Pluggy (backend Laravel /api/pluggy/*, verificados
 * no PluggyController). Portado do Frontend antigo (services/pluggy.ts).
 */

export interface PluggyConnection {
  id: number
  item_id: string
  institution_name: string
  institution_logo: string | null
  institution_type: 'BANK' | 'INVESTMENT' | 'BOTH'
  /** 7 estados reais do item Pluggy */
  status: 'UPDATED' | 'OUTDATED' | 'LOGIN_ERROR' | 'WAITING_USER_INPUT' | 'UPDATING' | 'CREATING' | 'ERROR'
  last_status_detail: unknown
  last_synced_at: string | null
  accounts_count: number
  positions_count: number
  total_balance: number
}

/** POST /pluggy/connections/{id}/sync — rate-limit de 1h do Pluggy vira status. */
export interface PluggySyncResult {
  status: 'rate_limited' | string
  retry_after_minutes?: number
}

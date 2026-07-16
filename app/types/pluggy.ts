/**
 * Contratos de Open Finance / Pluggy (backend Laravel /api/pluggy/*, verificados
 * no PluggyController). Portado do Frontend antigo (services/pluggy.ts).
 */

export interface PluggyConnection {
  id: number
  item_id: string
  /** connector Pluggy da instituição (pina o widget na reconexão de órfã) */
  connector_id: number
  institution_name: string
  institution_logo: string | null
  institution_type: 'BANK' | 'INVESTMENT' | 'BOTH'
  /** 7 estados reais do item Pluggy + ITEM_NOT_FOUND (item órfão: deletado no
   *  Pluggy ou criado por outro app/client_id — só reconectar resolve) */
  status: 'UPDATED' | 'OUTDATED' | 'LOGIN_ERROR' | 'WAITING_USER_INPUT' | 'UPDATING' | 'CREATING' | 'ERROR' | 'ITEM_NOT_FOUND'
  last_status_detail: unknown
  last_synced_at: string | null
  accounts_count: number
  positions_count: number
  total_balance: number
  /** saldo só de contas BANK (cartão de crédito fica de fora) */
  bank_balance: number
  /** total investido (soma de current_value das positions da conexão) */
  positions_value: number
}

/** POST /pluggy/connections/{id}/sync — rate-limit de 1h do Pluggy e item
 *  órfão (item_not_found) viram status próprio em vez de erro HTTP. */
export interface PluggySyncResult {
  status: 'rate_limited' | 'item_not_found' | string
  retry_after_minutes?: number
  message?: string
}

/**
 * Pluggy / Open Finance service.
 *
 * Comunica com o backend Laravel em `${apiBaseUrl}/api/pluggy/*`.
 * `apiBaseUrl` vem do runtimeConfig.public — em prod aponta pra
 * https://redentia-api.saraivada.com, em dev pode ser overridden via
 * NUXT_PUBLIC_API_BASE_URL. Isso e o MESMO padrao usado por
 * useAssetsService, useAuthService, etc.
 *
 * Antes uavamos paths relativos (`/api/pluggy/...`), o que funciona em
 * Vercel (rewrite no vercel.json) mas NAO em dev local — Nuxt nao tem
 * route handler pra `/api/pluggy/*`, entao retorna 404. URL absoluta
 * resolve em ambos os ambientes.
 */
export interface PluggyConnection {
  id: number
  item_id: string
  institution_name: string
  institution_logo: string | null
  institution_type: 'BANK' | 'INVESTMENT' | 'BOTH'
  status: 'UPDATED' | 'OUTDATED' | 'LOGIN_ERROR' | 'WAITING_USER_INPUT' | 'UPDATING' | 'CREATING' | 'ERROR'
  last_status_detail: any
  last_synced_at: string | null
  accounts_count: number
  positions_count: number
  total_balance: number
}

export function usePluggyService() {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  const API = config.public.apiBaseUrl as string

  function authHeaders(): Record<string, string> {
    return authStore.token
      ? { Authorization: `Bearer ${authStore.token}` }
      : {}
  }

  async function getConnectToken(itemId?: string): Promise<string> {
    const params = itemId ? `?item_id=${encodeURIComponent(itemId)}` : ''
    const resp = await $fetch<{ accessToken: string }>(
      `${API}/pluggy/connect-token${params}`,
      { headers: authHeaders() },
    )
    return resp.accessToken
  }

  async function listConnections(): Promise<PluggyConnection[]> {
    const resp = await $fetch<{ data: PluggyConnection[] }>(
      `${API}/pluggy/connections`,
      { headers: authHeaders() },
    )
    return resp.data ?? []
  }

  async function registerConnection(itemId: string): Promise<{ id: number; status: string }> {
    const resp = await $fetch<{ data: { id: number; status: string } }>(
      `${API}/pluggy/connections`,
      {
        method: 'POST',
        headers: authHeaders(),
        body: { item_id: itemId },
      },
    )
    return resp.data
  }

  async function syncConnection(id: number): Promise<SyncResult> {
    const resp = await $fetch<{ data: SyncResult }>(
      `${API}/pluggy/connections/${id}/sync`,
      {
        method: 'POST',
        headers: authHeaders(),
      },
    )
    return resp.data
  }

  async function deleteConnection(id: number): Promise<void> {
    await $fetch(`${API}/pluggy/connections/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
  }

  async function listAccounts(): Promise<{ data: PluggyAccount[]; totals: AccountTotals }> {
    const resp = await $fetch<{ data: PluggyAccount[]; totals: AccountTotals }>(
      `${API}/pluggy/accounts`,
      { headers: authHeaders() },
    )
    return resp
  }

  return {
    getConnectToken,
    listConnections,
    registerConnection,
    syncConnection,
    deleteConnection,
    listAccounts,
  }
}

export interface PluggyAccount {
  id: number
  pluggy_account_id: string
  type: 'BANK' | 'CREDIT' | 'INVESTMENT'
  subtype: string | null  // CHECKING_ACCOUNT, SAVINGS_ACCOUNT, CREDIT_CARD
  name: string
  marketing_name: string | null
  owner: string | null
  number: string | null
  balance: number
  currency_code: string
  bank_data: {
    transferNumber?: string
    closingBalance?: number
    automaticallyInvestedBalance?: number
    overdraftContractedLimit?: number | null
    overdraftUsedLimit?: number | null
    unarrangedOverdraftAmount?: number | null
  } | null
  credit_data: {
    level?: string  // GOLD, BLACK, PLATINUM, etc
    brand?: string  // VISA, MASTERCARD, etc
    creditLimit?: number
    availableCreditLimit?: number
    balanceCloseDate?: string
    balanceDueDate?: string
    minimumPayment?: number
    holderType?: string
    status?: string
  } | null
  last_synced_at: string | null
  institution: {
    name: string
    logo: string | null
  } | null
}

export interface AccountTotals {
  bank: number
  credit_used: number
  count: number
}

export interface SyncResult {
  status: 'queued' | 'rate_limited'
  message?: string
  last_updated_at?: string | null
  retry_after_minutes?: number
}

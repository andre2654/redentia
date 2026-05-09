/**
 * Communications service — comunicacoes (banner / comunicado / CTA /
 * modal / enquete / email) entre admin e users.
 *
 * Dois servicos separados:
 *   - useCommunicationsService: PUBLIC (user-side). Lista active +
 *     marca seen/dismiss/click/vote.
 *   - useAdminCommunicationsService: ADMIN. CRUD + analytics + toggle.
 *
 * Identidade pro user-side:
 *   - Logado: Authorization: Bearer <token>
 *   - Anonymous: X-Client-Id header (UUID em localStorage, mesmo
 *     padrao do chat-service)
 */

// =============================================================
// Types
// =============================================================
export type CommunicationType = 'banner' | 'announcement' | 'cta' | 'modal' | 'poll' | 'email' | 'notification'
export type CommunicationStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'ended'
export type CommunicationPlacement =
  | 'top'
  | 'sidebar'
  | 'wallet-hero'
  | 'help-prompt'
  | 'home-cta'
  | 'feed'
  | 'modal'
  | 'inbox'
export type CommunicationAudience =
  | 'all'
  | 'authenticated'
  | 'guests'
  | 'investors'
  | 'advisors'
  | 'admins'
  | 'specific'

export interface PollOption {
  id: string
  label: string
  color?: string | null
}

export interface CommunicationPublic {
  id: number
  type: CommunicationType
  placement: CommunicationPlacement | null
  title: string
  body: string | null
  icon: string | null
  link_url: string | null
  link_label: string | null
  image_url: string | null
  dismissible: boolean
  modal_size: 'sm' | 'md' | 'lg' | null
  poll_options: PollOption[] | null
  poll_multi_choice: boolean
  poll_results_visible: boolean
  user_state?: {
    seen: boolean
    dismissed: boolean
    clicked: boolean
    voted: boolean
    vote_option_ids: string[] | null
  }
  poll_results?: Record<string, number>
}

export interface CommunicationAdmin {
  id: number
  tenant_id: number | null
  type: CommunicationType
  status: CommunicationStatus
  title: string
  body: string | null
  icon: string | null
  link_url: string | null
  link_label: string | null
  image_url: string | null
  priority: number
  target_audience: CommunicationAudience
  target_user_ids: number[] | null
  target_min_aum: number | null
  target_has_connections: boolean | null
  starts_at: string | null
  ends_at: string | null
  dismissible: boolean
  placement: CommunicationPlacement | null
  modal_size: 'sm' | 'md' | 'lg' | null
  poll_options: PollOption[] | null
  poll_multi_choice: boolean
  poll_results_visible: boolean
  impressions: number
  clicks: number
  dismissals: number
  votes: number
  created_by: number | null
  creator?: { id: number; name: string } | null
  created_at: string
  updated_at: string
}

export interface CommunicationAnalytics {
  impressions: number
  unique_seen: number
  clicks: number
  unique_clicked: number
  dismissals: number
  unique_dismissed: number
  votes: number
  unique_voted: number
  click_through_rate: number
  poll_results?: Record<string, number>
}

export interface CommunicationListResponse {
  data: CommunicationAdmin[]
  current_page: number
  last_page: number
  total: number
  per_page: number
}

// =============================================================
// Helpers
// =============================================================

/**
 * Garante um clientId UUID persistido em localStorage. Usado pra
 * identificar anonymous (banner publico, CTA na home). Mesma
 * estrategia do chat-service.
 */
function ensureClientId(): string {
  if (typeof window === 'undefined') return ''
  const KEY = 'redentia.client_id'
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(KEY, id)
  }
  return id
}

// =============================================================
// PUBLIC service (user-side)
// =============================================================

export function useCommunicationsService() {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  const API = config.public.apiBaseUrl as string

  function headers(): Record<string, string> {
    const h: Record<string, string> = {}
    if (authStore.token) h['Authorization'] = `Bearer ${authStore.token}`
    const cid = ensureClientId()
    if (cid) h['X-Client-Id'] = cid
    return h
  }

  /**
   * Lista comunicacoes ativas pro user atual, opcionalmente filtrado
   * por placement (top, sidebar, etc).
   */
  async function listActive(
    placement?: CommunicationPlacement,
  ): Promise<CommunicationPublic[]> {
    const params = placement ? `?placement=${encodeURIComponent(placement)}` : ''
    const resp = await $fetch<{ data: CommunicationPublic[] }>(
      `${API}/communications/active${params}`,
      { headers: headers() },
    )
    return resp.data ?? []
  }

  async function markSeen(id: number): Promise<void> {
    await $fetch(`${API}/communications/${id}/seen`, {
      method: 'POST',
      headers: headers(),
    }).catch((e) => {
      // Tracking nao-critico — log mas nao quebra UX
      console.warn('[communications] markSeen failed', e)
    })
  }

  async function markDismissed(id: number): Promise<void> {
    await $fetch(`${API}/communications/${id}/dismiss`, {
      method: 'POST',
      headers: headers(),
    }).catch((e) => {
      console.warn('[communications] markDismissed failed', e)
    })
  }

  async function markClicked(id: number): Promise<void> {
    await $fetch(`${API}/communications/${id}/click`, {
      method: 'POST',
      headers: headers(),
    }).catch((e) => {
      console.warn('[communications] markClicked failed', e)
    })
  }

  async function vote(
    id: number,
    optionIds: string[],
  ): Promise<{ voted: boolean; option_ids: string[]; already_voted: boolean; results: Record<string, number> | null }> {
    const resp = await $fetch<{ data: { voted: boolean; option_ids: string[]; already_voted: boolean; results: Record<string, number> | null } }>(
      `${API}/communications/${id}/vote`,
      {
        method: 'POST',
        headers: headers(),
        body: { option_ids: optionIds },
      },
    )
    return resp.data
  }

  return { listActive, markSeen, markDismissed, markClicked, vote }
}

// =============================================================
// ADMIN service
// =============================================================

export interface CommunicationAdminPayload {
  tenant_id?: number | null
  type: CommunicationType
  status?: CommunicationStatus
  title: string
  body?: string | null
  icon?: string | null
  link_url?: string | null
  link_label?: string | null
  image_url?: string | null
  priority?: number
  target_audience?: CommunicationAudience
  target_user_ids?: number[] | null
  target_min_aum?: number | null
  target_has_connections?: boolean | null
  starts_at?: string | null
  ends_at?: string | null
  dismissible?: boolean
  placement?: CommunicationPlacement | null
  modal_size?: 'sm' | 'md' | 'lg' | null
  poll_options?: PollOption[] | null
  poll_multi_choice?: boolean
  poll_results_visible?: boolean
}

export function useAdminCommunicationsService() {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  const API = config.public.apiBaseUrl as string

  function headers(): Record<string, string> {
    return authStore.token
      ? { Authorization: `Bearer ${authStore.token}` }
      : {}
  }

  async function list(params: {
    type?: CommunicationType
    status?: CommunicationStatus
    placement?: CommunicationPlacement
    tenant_id?: number
    search?: string
    page?: number
    per_page?: number
  } = {}): Promise<CommunicationListResponse> {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
    })
    const url = `${API}/admin/communications${qs.toString() ? `?${qs}` : ''}`
    return await $fetch<CommunicationListResponse>(url, { headers: headers() })
  }

  async function get(id: number): Promise<{ data: CommunicationAdmin; analytics: CommunicationAnalytics }> {
    return await $fetch<{ data: CommunicationAdmin; analytics: CommunicationAnalytics }>(
      `${API}/admin/communications/${id}`,
      { headers: headers() },
    )
  }

  async function create(payload: CommunicationAdminPayload): Promise<CommunicationAdmin> {
    const resp = await $fetch<{ data: CommunicationAdmin }>(
      `${API}/admin/communications`,
      { method: 'POST', headers: headers(), body: payload },
    )
    return resp.data
  }

  async function update(id: number, payload: Partial<CommunicationAdminPayload>): Promise<CommunicationAdmin> {
    const resp = await $fetch<{ data: CommunicationAdmin }>(
      `${API}/admin/communications/${id}`,
      { method: 'PATCH', headers: headers(), body: payload },
    )
    return resp.data
  }

  async function destroy(id: number): Promise<void> {
    await $fetch(`${API}/admin/communications/${id}`, {
      method: 'DELETE',
      headers: headers(),
    })
  }

  async function toggle(id: number): Promise<CommunicationAdmin> {
    const resp = await $fetch<{ data: CommunicationAdmin }>(
      `${API}/admin/communications/${id}/toggle`,
      { method: 'POST', headers: headers() },
    )
    return resp.data
  }

  async function duplicate(id: number): Promise<CommunicationAdmin> {
    const resp = await $fetch<{ data: CommunicationAdmin }>(
      `${API}/admin/communications/${id}/duplicate`,
      { method: 'POST', headers: headers() },
    )
    return resp.data
  }

  async function analytics(id: number): Promise<CommunicationAnalytics> {
    const resp = await $fetch<{ data: CommunicationAnalytics }>(
      `${API}/admin/communications/${id}/analytics`,
      { headers: headers() },
    )
    return resp.data
  }

  /**
   * Live audience preview — aceita params do form sem precisar salvar.
   * Diferente de recipientsPreview (que le do registro persistido), esse
   * roda a query com os valores atuais da tela. Retorna count + sample +
   * by_role pra UI mostrar EXATAMENTE quem vai receber.
   */
  async function audiencePreview(payload: {
    type?: CommunicationType
    tenant_id?: number | null
    target_audience: CommunicationAudience
    target_user_ids?: number[] | null
    target_min_aum?: number | null
    target_has_connections?: boolean | null
  }): Promise<AudiencePreview> {
    const resp = await $fetch<{ data: AudiencePreview }>(
      `${API}/admin/communications/audience-preview`,
      { method: 'POST', headers: headers(), body: payload },
    )
    return resp.data
  }

  // ============ Email-specific endpoints ============

  async function recipientsPreview(id: number): Promise<RecipientsPreview> {
    const resp = await $fetch<{ data: RecipientsPreview }>(
      `${API}/admin/communications/${id}/recipients-preview`,
      { headers: headers() },
    )
    return resp.data
  }

  async function testSend(id: number): Promise<{ delivery_id: number; sent_to: string }> {
    const resp = await $fetch<{ data: { delivery_id: number; sent_to: string } }>(
      `${API}/admin/communications/${id}/test-send`,
      { method: 'POST', headers: headers() },
    )
    return resp.data
  }

  async function sendNow(id: number): Promise<{ queued: number; skipped: number; total_audience: number }> {
    const resp = await $fetch<{ data: { queued: number; skipped: number; total_audience: number } }>(
      `${API}/admin/communications/${id}/send-now`,
      { method: 'POST', headers: headers() },
    )
    return resp.data
  }

  async function deliveries(
    id: number,
    params: { status?: string; search?: string; page?: number; per_page?: number } = {},
  ): Promise<DeliveriesResponse> {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
    })
    const url = `${API}/admin/communications/${id}/deliveries${qs.toString() ? `?${qs}` : ''}`
    return await $fetch<DeliveriesResponse>(url, { headers: headers() })
  }

  async function emailStats(id: number): Promise<EmailStats> {
    const resp = await $fetch<{ data: EmailStats }>(
      `${API}/admin/communications/${id}/email-stats`,
      { headers: headers() },
    )
    return resp.data
  }

  return {
    list, get, create, update, destroy, toggle, duplicate, analytics,
    audiencePreview,
    recipientsPreview, testSend, sendNow, deliveries, emailStats,
  }
}

/**
 * Resposta do endpoint audience-preview. Sample tem 5 users (top da
 * tabela), by_role e o breakdown agregado, count e o total exato.
 *
 * Quando audience='guests', count vem null + is_anonymous=true (nao
 * temos como contar visitantes — apenas qualitativo "vai pra guests").
 */
export interface AudiencePreview {
  count: number | null
  count_label?: string
  sample: { id: number; name: string | null; email: string | null; role: string }[]
  by_role: Record<string, number>
  audience: string
  tenant_id: number | null
  filters: {
    min_aum: number | null
    has_connections: boolean | null
  }
  is_anonymous?: boolean
}

// ============ Email-specific types ============
export interface RecipientsPreview {
  count: number
  sample: { id: number; name: string; email: string; role: string }[]
  by_role: Record<string, number>
  audience: string
  tenant_id: number | null
  filters: {
    min_aum: number | null
    has_connections: boolean | null
  }
}

export interface EmailDelivery {
  id: number
  communication_id: number
  user_id: number | null
  email: string
  name: string | null
  status: 'pending' | 'queued' | 'sent' | 'failed' | 'bounced' | 'unsubscribed'
  queued_at: string | null
  sent_at: string | null
  opened_at: string | null
  clicked_at: string | null
  failed_at: string | null
  open_count: number
  click_count: number
  delivery_attempts: number
  last_error: string | null
  token: string
  user?: { id: number; name: string; email: string } | null
  created_at: string
  updated_at: string
}

export interface DeliveriesResponse {
  data: EmailDelivery[]
  current_page: number
  last_page: number
  total: number
  per_page: number
}

export interface EmailStats {
  total: number
  pending: number
  queued: number
  sent: number
  failed: number
  bounced: number
  opened: number
  clicked: number
  total_opens: number
  total_clicks: number
  open_rate: number
  click_rate: number
}

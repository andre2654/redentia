export interface ISocialAutomation {
  id: number
  key: string
  title: string
  type: 'scheduled_post' | 'ticker_auto_reply' | 'profile_auto_comment'
  enabled: boolean
  schedule: string | null
  config: Record<string, unknown> | null
  last_run_at: string | null
  last_result: Record<string, unknown> | null
  last_error: string | null
  created_at: string
  updated_at: string
}

export interface ISocialAutomationInput {
  key: string
  title: string
  type: ISocialAutomation['type']
  enabled?: boolean
  schedule?: string | null
  config?: Record<string, unknown> | null
}

export const useSocialAutomationsService = () => {
  const config = useRuntimeConfig()
  const { authFetch } = useCustomFetch()
  const base = `${config.public.apiBaseUrl as string}/admin/social-automations`

  function unwrap<T>(p: any): T {
    if (p && typeof p === 'object' && 'data' in p) return p.data as T
    return p as T
  }

  async function list(): Promise<ISocialAutomation[]> {
    const r = await authFetch(base, { method: 'GET' })
    return unwrap<ISocialAutomation[]>(r) || []
  }

  async function show(id: number): Promise<ISocialAutomation> {
    const r = await authFetch(`${base}/${id}`, { method: 'GET' })
    return unwrap<ISocialAutomation>(r)
  }

  async function create(body: ISocialAutomationInput): Promise<ISocialAutomation> {
    const r = await authFetch(base, { method: 'POST', body })
    return unwrap<ISocialAutomation>(r)
  }

  async function update(id: number, body: ISocialAutomationInput): Promise<ISocialAutomation> {
    const r = await authFetch(`${base}/${id}`, { method: 'PUT', body })
    return unwrap<ISocialAutomation>(r)
  }

  async function remove(id: number): Promise<void> {
    await authFetch(`${base}/${id}`, { method: 'DELETE' })
  }

  async function toggle(id: number): Promise<ISocialAutomation> {
    const r = await authFetch(`${base}/${id}/toggle`, { method: 'POST' })
    return unwrap<ISocialAutomation>(r)
  }

  async function runNow(id: number): Promise<{ dispatched: boolean; automation_id: number; hint: string }> {
    const r = await authFetch(`${base}/${id}/run-now`, { method: 'POST' })
    return unwrap(r)
  }

  return { list, show, create, update, remove, toggle, runNow }
}

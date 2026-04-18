export interface IMonitoredProfile {
  id: number
  platform: 'instagram' | 'x' | 'threads' | 'facebook'
  handle: string
  display_name: string | null
  enabled: boolean
  comment_template: string | null
  last_post_seen_id: string | null
  last_polled_at: string | null
  created_at: string
  updated_at: string
}

export interface IMonitoredProfileInput {
  platform: IMonitoredProfile['platform']
  handle: string
  display_name?: string | null
  enabled?: boolean
  comment_template?: string | null
}

export const useMonitoredProfilesService = () => {
  const config = useRuntimeConfig()
  const authFetch = useAuthFetch()
  const base = `${config.public.apiBaseUrl as string}/admin/monitored-profiles`

  function unwrap<T>(p: any): T {
    if (p && typeof p === 'object' && 'data' in p) return p.data as T
    return p as T
  }

  async function list(): Promise<IMonitoredProfile[]> {
    const r = await authFetch(base, { method: 'GET' })
    return unwrap<IMonitoredProfile[]>(r) || []
  }

  async function create(body: IMonitoredProfileInput): Promise<IMonitoredProfile> {
    const r = await authFetch(base, { method: 'POST', body })
    return unwrap<IMonitoredProfile>(r)
  }

  async function update(id: number, body: IMonitoredProfileInput): Promise<IMonitoredProfile> {
    const r = await authFetch(`${base}/${id}`, { method: 'PUT', body })
    return unwrap<IMonitoredProfile>(r)
  }

  async function remove(id: number): Promise<void> {
    await authFetch(`${base}/${id}`, { method: 'DELETE' })
  }

  async function toggle(id: number): Promise<IMonitoredProfile> {
    const r = await authFetch(`${base}/${id}/toggle`, { method: 'POST' })
    return unwrap<IMonitoredProfile>(r)
  }

  return { list, create, update, remove, toggle }
}

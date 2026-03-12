import type { ITenant, ITenantPayload } from '~/types/tenant'

export const useTenantsService = () => {
  const { authFetch } = useCustomFetch()
  const config = useRuntimeConfig()
  const adminURL = `${config.public.apiBaseUrl}/admin/tenants`
  const publicURL = `${config.public.apiBaseUrl}/tenants`

  // ── Admin CRUD ──

  async function list(params?: { search?: string; active?: boolean; page?: number }) {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.active !== undefined) query.set('active', String(params.active))
    if (params?.page) query.set('page', String(params.page))
    const qs = query.toString()
    return authFetch<{ data: ITenant[]; meta: any }>(`${adminURL}${qs ? `?${qs}` : ''}`)
  }

  async function show(id: number) {
    return authFetch<{ data: ITenant }>(`${adminURL}/${id}`)
  }

  async function create(body: ITenantPayload) {
    return authFetch<{ data: ITenant }>(`${adminURL}`, {
      method: 'POST',
      body,
    })
  }

  async function update(id: number, body: Partial<ITenantPayload>) {
    return authFetch<{ data: ITenant }>(`${adminURL}/${id}`, {
      method: 'PUT',
      body,
    })
  }

  async function remove(id: number) {
    return authFetch(`${adminURL}/${id}`, {
      method: 'DELETE',
    })
  }

  async function toggleActive(id: number) {
    return authFetch<{ data: ITenant }>(`${adminURL}/${id}/toggle-active`, {
      method: 'POST',
    })
  }

  async function duplicate(id: number) {
    return authFetch<{ data: ITenant }>(`${adminURL}/${id}/duplicate`, {
      method: 'POST',
    })
  }

  // ── Public resolution ──

  async function resolve(slug: string) {
    return $fetch<{ data: ITenant }>(`${publicURL}/resolve/${slug}`)
  }

  return { list, show, create, update, remove, toggleActive, duplicate, resolve }
}

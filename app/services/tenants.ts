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

  // ── Phase 2: asset upload ──

  type AssetSlot =
    | 'fullLight' | 'fullDark' | 'iconLight' | 'iconDark'
    | 'favicon' | 'faviconIco' | 'appleTouchIcon'
    | 'icon192' | 'icon512'
    | 'og' | 'email'

  /**
   * Upload de asset (logo/favicon/og) pra um tenant. Backend salva em
   * `storage/app/public/tenants/{slug}/{slot}.{ext}`, atualiza
   * `tenant.config.logo[slot]` com o `/storage/...` path, e invalida
   * cache Redis. Retorna URL publica pronta pra setar no `<img src>`.
   *
   * Tipos aceitos: PNG/JPG/WebP/ICO. SVG bloqueado (XSS via <script>).
   * Cap: 2MB por upload.
   */
  async function uploadAsset(id: number, slot: AssetSlot, file: File) {
    const fd = new FormData()
    fd.append('slot', slot)
    fd.append('file', file)
    return authFetch<{ data: { slot: AssetSlot; url: string; size: number; mime: string } }>(
      `${adminURL}/${id}/assets`,
      { method: 'POST', body: fd },
    )
  }

  async function deleteAsset(id: number, slot: AssetSlot) {
    return authFetch<{ data: { slot: AssetSlot; deleted: true } }>(
      `${adminURL}/${id}/assets`,
      { method: 'DELETE', body: { slot } },
    )
  }

  // ── Public resolution ──

  async function resolve(slug: string) {
    return $fetch<{ data: ITenant }>(`${publicURL}/resolve/${slug}`)
  }

  return { list, show, create, update, remove, toggleActive, duplicate, uploadAsset, deleteAsset, resolve }
}

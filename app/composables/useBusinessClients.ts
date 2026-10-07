/**
 * Clientes do escritório — o painel do dono (/business/clientes), ligado nas
 * rotas /api/me/business/clients* (SPEC Contrato C, "Rotas do dono").
 *
 * Mesma forma do useBusinessAccount: `loading` é a carga inicial e `busy` é
 * uma ação em voo. A diferença é que aqui toda ação RECARREGA a lista do
 * servidor depois de agir (a menos que a resposta já traga a lista): status,
 * vencimento e responsável mudam do lado de lá, e a tela não adivinha.
 *
 * O link de convite é segredo e segue a regra da chave: só existe na resposta
 * que o criou. Ele vive em `linkGerado` (ref local, nunca useState: um
 * segredo em useState iria parar no payload do HTML — memória
 * "token de sessão no HTML cacheado") e some no reload.
 *
 * Regra de negócio volta 409/422 com {error, message}; 401/403 é sessão e o
 * authFetch já leva pro /login.
 */
import type {
  BusinessClientInviteCreated,
  BusinessClientRow,
  BusinessClientsList,
  ClientLogEntry,
} from '~/types/clientes'

export interface LinkGerado {
  clientId: string | null
  clientName: string
  url: string
  expiresAt: string | null
}

export function useBusinessClients() {
  const { authFetch } = useApi()

  const lista = ref<BusinessClientsList | null>(null)
  const loading = ref(true)
  const busy = ref(false)
  const linkGerado = ref<LinkGerado | null>(null)

  async function hydrate() {
    loading.value = true
    try {
      const r = await authFetch<BusinessClientsList | BusinessClientRow[]>('/me/business/clients')
      lista.value = Array.isArray(r) ? { clients: r } : { ...r, clients: r.clients ?? [] }
    }
    finally {
      loading.value = false
    }
  }

  /** Recarrega sem piscar o skeleton: a lista velha fica até a nova chegar. */
  async function refresh(r?: BusinessClientInviteCreated) {
    if (r?.clients) {
      lista.value = { ...(lista.value ?? {}), clients: r.clients }
      return
    }
    const nova = await authFetch<BusinessClientsList | BusinessClientRow[]>('/me/business/clients')
    lista.value = Array.isArray(nova) ? { ...(lista.value ?? {}), clients: nova } : { ...nova, clients: nova.clients ?? [] }
  }

  async function agir<T>(fn: () => Promise<T>): Promise<T> {
    busy.value = true
    try { return await fn() }
    finally { busy.value = false }
  }

  /** Cria o cliente e o primeiro convite. O link volta UMA vez. */
  function create(name: string, assignedKeyId: number | null) {
    return agir(async () => {
      const body: Record<string, unknown> = { name }
      if (assignedKeyId !== null) body.assigned_key_id = assignedKeyId
      const r = await authFetch<BusinessClientInviteCreated>('/me/business/clients', { method: 'POST', body })
      linkGerado.value = r.invite?.url
        ? { clientId: r.client?.id ?? null, clientName: r.client?.name ?? name, url: r.invite.url, expiresAt: r.invite.expires_at ?? null }
        : null
      await refresh(r)
    })
  }

  /** Novo link para um cliente que já existe (vencido, revogado, reconexão). */
  function newInvite(c: BusinessClientRow) {
    return agir(async () => {
      const r = await authFetch<BusinessClientInviteCreated>(`/me/business/clients/${encodeURIComponent(c.id)}/invites`, { method: 'POST' })
      linkGerado.value = r.invite?.url
        ? { clientId: c.id, clientName: c.name, url: r.invite.url, expiresAt: r.invite.expires_at ?? null }
        : null
      await refresh(r)
    })
  }

  function cancelInvite(c: BusinessClientRow, inviteId: number | string) {
    return agir(async () => {
      await authFetch(`/me/business/clients/${encodeURIComponent(c.id)}/invites/${encodeURIComponent(String(inviteId))}`, { method: 'DELETE' })
      if (linkGerado.value?.clientId === c.id) linkGerado.value = null
      await refresh()
    })
  }

  function update(c: BusinessClientRow, body: { assigned_key_id?: number | null, shared_with_office?: boolean }) {
    return agir(async () => {
      await authFetch(`/me/business/clients/${encodeURIComponent(c.id)}`, { method: 'PUT', body })
      await refresh()
    })
  }

  /** O escritório revoga e o servidor apaga posições e conexão na hora. */
  function revoke(c: BusinessClientRow) {
    return agir(async () => {
      await authFetch(`/me/business/clients/${encodeURIComponent(c.id)}`, { method: 'DELETE' })
      if (linkGerado.value?.clientId === c.id) linkGerado.value = null
      await refresh()
    })
  }

  /** Registro de acesso do cliente (sem posições: o servidor nunca as guarda no log). */
  async function log(c: BusinessClientRow): Promise<ClientLogEntry[]> {
    const r = await authFetch<{ log?: ClientLogEntry[] } | ClientLogEntry[]>(`/me/business/clients/${encodeURIComponent(c.id)}/log`)
    return Array.isArray(r) ? r : (r.log ?? [])
  }

  return { lista, loading, busy, linkGerado, hydrate, create, newInvite, cancelInvite, update, revoke, log }
}

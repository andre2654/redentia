/**
 * Estado da chave MCP do usuário — liga o card de /conta nas rotas reais
 * (/api/me/mcp). Segurança: a chave em claro só existe UMA vez, no retorno
 * do rotate (o backend guarda só o hash). Depois disso, só o mascarado —
 * pra ver de novo, gera outra.
 */
export interface McpPermissions {
  carteira: boolean
  mercado: boolean
  teses: boolean
  news: boolean
}

export interface McpStatus {
  has_key: boolean
  enabled: boolean
  permissions: McpPermissions
  key_masked: string | null
  last_used_at: string | null
  created_at?: string | null
}

export function useMcp() {
  const { authFetch } = useApi()

  const status = ref<McpStatus | null>(null)
  const plainKey = ref<string | null>(null) // só após gerar; some no reload
  const loading = ref(false)
  const busy = ref(false)

  async function hydrate() {
    loading.value = true
    try {
      status.value = await authFetch<McpStatus>('/me/mcp')
    } finally {
      loading.value = false
    }
  }

  /** Gera/rotaciona a chave e devolve a versão em claro (mostrar 1x). */
  async function rotate(): Promise<string | null> {
    busy.value = true
    try {
      const res = await authFetch<McpStatus & { key?: string }>('/me/mcp/key', { method: 'POST' })
      status.value = { ...res }
      plainKey.value = res.key ?? null
      return plainKey.value
    } finally {
      busy.value = false
    }
  }

  async function setEnabled(enabled: boolean) {
    busy.value = true
    try {
      status.value = await authFetch<McpStatus>('/me/mcp', { method: 'PUT', body: { enabled } })
    } finally {
      busy.value = false
    }
  }

  async function setPermissions(permissions: McpPermissions) {
    busy.value = true
    try {
      status.value = await authFetch<McpStatus>('/me/mcp', { method: 'PUT', body: { permissions } })
    } finally {
      busy.value = false
    }
  }

  async function revoke() {
    busy.value = true
    try {
      await authFetch('/me/mcp', { method: 'DELETE' })
      plainKey.value = null
      await hydrate()
    } finally {
      busy.value = false
    }
  }

  return { status, plainKey, loading, busy, hydrate, rotate, setEnabled, setPermissions, revoke }
}

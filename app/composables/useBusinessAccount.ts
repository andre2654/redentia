/**
 * Estado da conta de escritório (Redentia for Business) — liga o painel de
 * /business/chaves nas rotas reais (/api/me/business).
 *
 * Espelha a forma do useMcp, que é o irmão B2C: mesmos refs, mesma divisão
 * entre `loading` (a carga inicial) e `busy` (uma ação em voo), mesma regra
 * de segurança — a chave em claro só existe UMA vez, no retorno do POST, e o
 * backend guarda só o hash. Depois disso só o mascarado.
 *
 * A diferença é que aqui TODA rota devolve o painel inteiro, então cada ação
 * troca o estado pela resposta em vez de refazer o GET. Um round-trip a menos
 * por clique, e nenhuma janela em que a tela mostra o estado velho.
 */
export interface BusinessKeyVM {
  id: number
  label: string
  masked: string
  enabled: boolean
  last_used_at: string | null
  created_at: string | null
  calls_today: number
  calls_period: number
}

export interface BusinessAccountStatus {
  has_account: boolean
  enabled: boolean
  company_name: string | null
  max_keys: number
  remaining_keys?: number
  keys: BusinessKeyVM[]
  usage: {
    days: Array<{ day: string, calls: number }>
    calls: number
    calls_today?: number
    denials: number
    window_days?: number
  }
  quota: { day: number | null, minute: number }
  scopes?: string[]
}

export function useBusinessAccount() {
  const { authFetch } = useApi()

  const status = ref<BusinessAccountStatus | null>(null)
  const plainKey = ref<string | null>(null) // só após gerar; some no reload
  // Nasce TRUE: a carga é disparada no onMounted, e com `false` o primeiro
  // paint não casava nenhum ramo da página — nem skeleton, nem conteúdo, nem
  // erro. Dava um bloco vazio de 60vh e dois saltos de layout.
  const loading = ref(true)
  const busy = ref(false)

  async function hydrate() {
    loading.value = true
    try {
      status.value = await authFetch<BusinessAccountStatus>('/me/business')
    }
    finally {
      loading.value = false
    }
  }

  async function createAccount(companyName: string) {
    busy.value = true
    try {
      status.value = await authFetch<BusinessAccountStatus>('/me/business', {
        method: 'POST',
        body: { company_name: companyName },
      })
    }
    finally {
      busy.value = false
    }
  }

  /** Gera uma chave rotulada e devolve a versão em claro (mostrar 1x). */
  async function createKey(label: string): Promise<string | null> {
    busy.value = true
    try {
      const res = await authFetch<BusinessAccountStatus & { key?: string }>('/me/business/keys', {
        method: 'POST',
        body: { label },
      })
      status.value = { ...res }
      plainKey.value = res.key ?? null
      return plainKey.value
    }
    finally {
      busy.value = false
    }
  }

  async function setKeyEnabled(id: number, enabled: boolean) {
    busy.value = true
    try {
      status.value = await authFetch<BusinessAccountStatus>(`/me/business/keys/${id}`, {
        method: 'PUT',
        body: { enabled },
      })
    }
    finally {
      busy.value = false
    }
  }

  /** Renomeia sem revogar: errar o rótulo não pode custar uma das cinco vagas. */
  async function renameKey(id: number, label: string) {
    busy.value = true
    try {
      status.value = await authFetch<BusinessAccountStatus>(`/me/business/keys/${id}`, {
        method: 'PUT',
        body: { label },
      })
    }
    finally {
      busy.value = false
    }
  }

  async function revokeKey(id: number) {
    busy.value = true
    try {
      const res = await authFetch<BusinessAccountStatus>(`/me/business/keys/${id}`, { method: 'DELETE' })
      // A chave em claro na tela pode ser justamente a que acabou de ser
      // revogada, e deixar um segredo morto visível confunde quem copia.
      plainKey.value = null
      status.value = res
    }
    finally {
      busy.value = false
    }
  }

  return { status, plainKey, loading, busy, hydrate, createAccount, createKey, setKeyEnabled, renameKey, revokeKey }
}

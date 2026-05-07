/**
 * useAuthChannels — verifica em runtime quais canais de auth estao
 * disponiveis (WhatsApp via Evolution, email via magic link).
 *
 * Uso tipico:
 *
 *   const { fetchStatus, isWhatsAppAvailable, whatsappState } = useAuthChannels()
 *   onMounted(async () => {
 *     await fetchStatus()
 *     if (!isWhatsAppAvailable.value) channel.value = 'email'
 *   })
 *
 * Por que: Evolution API (Baileys) pode cair sem aviso. Em vez de
 * mostrar "vamos te enviar codigo no WhatsApp" e o codigo nunca chegar,
 * o frontend pergunta antes pro backend e ja troca pra email.
 *
 * Singleton-style: o status e compartilhado entre instancias do
 * composable na mesma sessao Nuxt (via useState). Isso evita que
 * cada componente faca o fetch independentemente — o primeiro busca,
 * os outros reusam.
 */

interface ChannelStatus {
  available: boolean
  reason?: string
  state?: string
  provider?: string
  http?: number
}

interface AuthChannelsResponse {
  whatsapp: ChannelStatus
  email: ChannelStatus
}

export const useAuthChannels = () => {
  const config = useRuntimeConfig()
  const baseURL = `${config.public.apiBaseUrl}/auth/channels`

  // useState: compartilhado entre componentes na mesma instancia Nuxt
  const status = useState<AuthChannelsResponse | null>('auth-channels-status', () => null)
  const loading = useState<boolean>('auth-channels-loading', () => false)
  const lastFetchedAt = useState<number>('auth-channels-fetched-at', () => 0)

  // Cache local de 30s (alem do cache do backend) pra evitar duplo fetch
  // se 2 componentes montam ao mesmo tempo.
  const FRONTEND_CACHE_MS = 30_000

  async function fetchStatus(force = false): Promise<void> {
    const now = Date.now()
    if (!force && status.value && (now - lastFetchedAt.value) < FRONTEND_CACHE_MS) {
      return // ainda no cache local
    }

    loading.value = true
    try {
      const resp = await $fetch<AuthChannelsResponse>(`${baseURL}/status`)
      status.value = resp
      lastFetchedAt.value = now
    }
    catch (err) {
      // Se o endpoint nao responde, assumimos OPTIMISTIC: tudo
      // disponivel. Isso evita bloquear UX se for um erro transiente
      // de rede do proprio status check. Pior caso: user vai tentar
      // pelo WhatsApp mesmo se ele estiver off, o pin nao chega, e
      // ele troca pro email manualmente. Acceptable degrade.
      console.warn('[useAuthChannels] status check failed, assuming available:', err)
      status.value = {
        whatsapp: { available: true, reason: 'check_failed' },
        email: { available: true },
      }
      lastFetchedAt.value = now
    }
    finally {
      loading.value = false
    }
  }

  const isWhatsAppAvailable = computed(() => status.value?.whatsapp.available ?? true)
  const whatsappState = computed(() => status.value?.whatsapp.state ?? null)
  const whatsappReason = computed(() => status.value?.whatsapp.reason ?? null)
  const isEmailAvailable = computed(() => status.value?.email.available ?? true)

  return {
    status: readonly(status),
    loading: readonly(loading),
    fetchStatus,
    isWhatsAppAvailable,
    whatsappState,
    whatsappReason,
    isEmailAvailable,
  }
}

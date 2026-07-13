/**
 * Fluxo de conexão Open Finance (Pluggy Connect) — PORTADO do Frontend
 * (`app/composables/usePluggyWidget.ts` + `services/pluggy.ts`) pro Nu no PR8.
 *
 * Como funciona (mesmo desenho do produto atual):
 *  1. import dinâmico do SDK npm `pluggy-connect-sdk` (o Pluggy NÃO publica
 *     UMD em CDN — lição documentada no Frontend; o chunk só baixa no clique)
 *  2. GET /pluggy/connect-token (auth) → accessToken fresco (TTL ~30min)
 *  3. new PluggyConnect({ connectToken, onSuccess }) → widget modal
 *  4. onSuccess({ item }) → POST /pluggy/connections { item_id } (o backend
 *     persiste e dispara o sync inicial async) → onConnected() do chamador
 *     (refresh da página; as posições chegam quando o sync termina)
 *
 * Sem env extra no front: o token vem do backend autenticado; as credenciais
 * Pluggy (client_id/secret) vivem SÓ no Laravel. Erro em qualquer etapa →
 * `error` legível pro CarteiraConnect degradar com instrução (nunca botão morto).
 */

interface PluggyItem { id: string; status: string }

// cache do módulo — não re-importa a cada clique
let sdkModule: unknown = null

async function loadSDK(): Promise<unknown> {
  if (import.meta.server) return null
  if (sdkModule) return sdkModule
  const mod = await import('pluggy-connect-sdk')
  sdkModule = mod
  return mod
}

export function usePluggyConnect() {
  const { token } = useAuthState()
  const opening = ref(false)
  const registering = ref(false)
  const error = ref<string | null>(null)

  const base = '/api/backend'
  const authHeaders = () => ({
    Accept: 'application/json',
    ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
  })

  /**
   * Abre o widget. `onConnected` roda depois do POST /pluggy/connections
   * (conexão persistida + sync inicial enfileirado pelo backend).
   */
  async function openWidget(opts: { onConnected: (item: PluggyItem) => void; onClose?: () => void }) {
    error.value = null
    opening.value = true
    try {
      const sdk = await loadSDK() as { PluggyConnect?: unknown; default?: { PluggyConnect?: unknown } } | null
      if (!sdk) throw new Error('sdk_ssr')
      const PluggyConnect = (sdk.PluggyConnect ?? sdk.default?.PluggyConnect ?? sdk.default) as
        | (new (opts: Record<string, unknown>) => { init: () => void })
        | undefined
      if (!PluggyConnect) throw new Error('sdk_export')

      const { accessToken } = await pluggyFetchConnectToken(base, authHeaders())

      const widget = new PluggyConnect({
        connectToken: accessToken,
        // Produto real: sem conectores sandbox na lista (o Frontend usa true
        // pra teste; aqui é a superfície de usuário final).
        includeSandbox: false,
        onSuccess: async ({ item }: { item: PluggyItem }) => {
          registering.value = true
          try {
            await pluggyRegisterConnection(base, authHeaders(), item.id)
            opts.onConnected(item)
          } catch {
            error.value = 'A conexão foi criada no seu banco, mas não conseguimos registrá-la aqui. Recarregue a página. Se ela não aparecer, tente conectar de novo.'
          } finally {
            registering.value = false
          }
        },
        onError: () => {
          error.value = 'O widget de conexão encontrou um erro. Tente de novo em instantes.'
        },
        onClose: () => { opts.onClose?.() },
      })

      widget.init()
    } catch {
      error.value = 'Não conseguimos abrir a conexão segura agora. Verifique sua internet e tente de novo em instantes.'
    } finally {
      opening.value = false
    }
  }

  return { openWidget, opening, registering, error }
}

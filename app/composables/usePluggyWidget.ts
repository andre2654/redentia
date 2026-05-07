/**
 * Composable que carrega o SDK oficial do Pluggy Connect (npm package
 * `pluggy-connect-sdk` instalado como dep) e abre o widget — modal de
 * autenticacao com a corretora/banco.
 *
 * Antes tentamos carregar o SDK via <script src="cdn.pluggy.ai/...">,
 * mas o Pluggy nao publica UMD em CDN, so CJS+ESM via npm. A tentativa
 * de carregar URL externa dava 404 em todas as variantes que testamos.
 *
 * Solucao: import dinamico da dependencia npm — Vite/Nuxt code-split o
 * chunk e so baixa quando o user clica em "Conectar". O SDK expoe
 * `PluggyConnect` como named export.
 *
 * Uso:
 *   const { openWidget, isLoading } = usePluggyWidget()
 *   await openWidget({
 *     onSuccess: ({ item }) => console.log('Conectou', item.id),
 *     onError: (err) => console.error(err),
 *   })
 */
interface OpenWidgetParams {
  itemId?: string  // pra reauth flow
  onSuccess: (data: { item: { id: string; status: string } }) => void
  onError?: (error: any) => void
  onClose?: () => void
}

// Cache do modulo carregado pra nao re-importar a cada open.
let sdkModule: any = null

async function loadSDK(): Promise<any> {
  if (typeof window === 'undefined') return null
  if (sdkModule) return sdkModule

  // Dynamic import — Vite emite chunk separado, baixa lazy on demand.
  // O SDK so funciona client-side; SSR safe-guard acima previne erro.
  // @ts-expect-error — pluggy-connect-sdk nao tem types pra dynamic import flow,
  // mas o named export PluggyConnect existe em runtime.
  const mod = await import('pluggy-connect-sdk')
  sdkModule = mod
  return mod
}

export function usePluggyWidget() {
  const isLoading = ref(false)
  const pluggy = usePluggyService()

  async function openWidget(params: OpenWidgetParams): Promise<void> {
    isLoading.value = true
    try {
      // 1. Carrega SDK (lazy, primeira vez baixa o chunk)
      const sdk = await loadSDK()
      if (!sdk) throw new Error('Pluggy SDK indisponivel (SSR ou ambiente sem window)')

      const PluggyConnect = sdk.PluggyConnect || sdk.default?.PluggyConnect || sdk.default
      if (!PluggyConnect) {
        throw new Error('Pluggy SDK carregado mas PluggyConnect nao encontrado nos exports')
      }

      // 2. Pega connect_token fresco do nosso backend (TTL ~30min)
      const accessToken = await pluggy.getConnectToken(params.itemId)

      // 3. Instancia widget e abre. SDK aceita { connectToken, includeSandbox,
      //    onSuccess, onError, onClose, updateItem }
      const widget = new PluggyConnect({
        connectToken: accessToken,
        // Inclui conectores sandbox alem dos production. Util pra teste.
        // Em production "real" mude pra false pra esconder sandbox da UI.
        includeSandbox: true,
        // Pra reauth flow (login expirado, MFA novo)
        ...(params.itemId ? { updateItem: params.itemId } : {}),
        onSuccess: async ({ item }: any) => {
          // Backend persiste a conexao + dispara sync inicial async
          try {
            await pluggy.registerConnection(item.id)
            params.onSuccess({ item })
          } catch (err) {
            console.error('Failed to register connection', err)
            params.onError?.(err)
          }
        },
        onError: (error: any) => {
          console.error('Pluggy widget error', error)
          params.onError?.(error)
        },
        onClose: () => {
          params.onClose?.()
        },
      })

      widget.init()
    } catch (err) {
      console.error('Failed to open Pluggy widget', err)
      params.onError?.(err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    openWidget,
    isLoading,
  }
}

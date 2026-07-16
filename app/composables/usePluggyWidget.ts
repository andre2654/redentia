/**
 * Carrega o SDK oficial do Pluggy Connect (npm `pluggy-connect-sdk`) via import
 * dinâmico (Vite code-split → baixa só quando o user clica em conectar) e abre o
 * widget. Portado do Frontend antigo. SSR-safe (só liga com window). Pra reauth
 * (login expirado/MFA) passa `itemId` → `updateItem` no widget.
 *
 * includeSandbox: false — em produção real não mostramos conectores sandbox.
 */
interface OpenWidgetParams {
  itemId?: string
  /** restringe o widget a conectores específicos (ex.: reconexão de órfã —
   *  pina na instituição da conexão antiga pra não abrir a lista inteira) */
  connectorIds?: number[]
  onSuccess: (data: { item: { id: string; status: string } }) => void
  onError?: (error: unknown) => void
  onClose?: () => void
}

// cache do módulo carregado pra não re-importar a cada abertura
let sdkModule: unknown = null

async function loadSDK(): Promise<unknown> {
  if (typeof window === 'undefined') return null
  if (sdkModule) return sdkModule
  // @ts-expect-error — pluggy-connect-sdk não expõe types pro fluxo de import
  // dinâmico, mas o named export PluggyConnect existe em runtime.
  const mod = await import('pluggy-connect-sdk')
  sdkModule = mod
  return mod
}

export function usePluggyWidget() {
  const isLoading = ref(false)
  const pluggy = usePluggy()

  async function openWidget(params: OpenWidgetParams): Promise<void> {
    isLoading.value = true
    try {
      const sdk = await loadSDK() as Record<string, any> | null
      if (!sdk) throw new Error('Pluggy SDK indisponível (SSR ou ambiente sem window).')

      const PluggyConnect = sdk.PluggyConnect || sdk.default?.PluggyConnect || sdk.default
      if (!PluggyConnect) throw new Error('Pluggy SDK carregado mas PluggyConnect não encontrado nos exports.')

      const accessToken = await pluggy.getConnectToken(params.itemId)

      const widget = new PluggyConnect({
        connectToken: accessToken,
        includeSandbox: false,
        ...(params.itemId ? { updateItem: params.itemId } : {}),
        ...(params.connectorIds?.length ? { connectorIds: params.connectorIds } : {}),
        onSuccess: async ({ item }: { item: { id: string; status: string } }) => {
          // backend persiste a conexão + dispara sync inicial async
          try {
            await pluggy.registerConnection(item.id)
            params.onSuccess({ item })
          }
          catch (err) {
            params.onError?.(err)
          }
        },
        onError: (error: unknown) => params.onError?.(error),
        onClose: () => params.onClose?.(),
      })

      widget.init()
    }
    catch (err) {
      params.onError?.(err)
    }
    finally {
      isLoading.value = false
    }
  }

  return { openWidget, isLoading }
}

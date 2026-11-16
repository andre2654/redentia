/**
 * Carrega o SDK oficial do Pluggy Connect (npm `pluggy-connect-sdk`) via import
 * dinâmico (Vite code-split → baixa só quando o user clica em conectar) e abre o
 * widget. Portado do Frontend antigo. SSR-safe (só liga com window). Pra reauth
 * (login expirado/MFA) passa `itemId` → `updateItem` no widget.
 *
 * includeSandbox: false — em produção real não mostramos conectores sandbox.
 */
import { abrirWidgetOpenFinance } from '~/utils/widget-open-finance'
interface OpenWidgetParams {
  itemId?: string
  /** restringe o widget a conectores específicos (ex.: reconexão de órfã —
   *  pina na instituição da conexão antiga pra não abrir a lista inteira) */
  connectorIds?: number[]
  onSuccess: (data: { item: { id: string; status: string } }) => void
  onError?: (error: unknown) => void
  onClose?: () => void
}

export function usePluggyWidget() {
  const isLoading = ref(false)
  const pluggy = usePluggy()

  async function openWidget(params: OpenWidgetParams): Promise<void> {
    isLoading.value = true
    try {
      const { accessToken, provider } = await pluggy.getConnectTokenDoAgregador(params.itemId)
      await abrirWidgetOpenFinance({
        connectToken: accessToken,
        provider,
        updateItem: params.itemId,
        connectorIds: params.connectorIds,
        onSuccess: async (item) => {
          // backend persiste a conexão + dispara sync inicial async
          try {
            await pluggy.registerConnection(item.id, provider)
            params.onSuccess({ item: { id: item.id, status: item.status ?? '' } })
          }
          catch (err) {
            params.onError?.(err)
          }
        },
        onError: (error: unknown) => params.onError?.(error),
        onClose: () => params.onClose?.(),
      })
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

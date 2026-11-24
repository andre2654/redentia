/**
 * Fluxo de conexão Open Finance (Pluggy Connect) — PORTADO do Frontend
 * (`app/composables/usePluggyWidget.ts` + `services/pluggy.ts`) pro Nu no PR8.
 *
 * Como funciona (mesmo desenho do produto atual):
 *  1. import dinâmico do SDK npm `pluggy-connect-sdk` (o Pluggy NÃO publica
 *     UMD em CDN — lição documentada no Frontend; o chunk só baixa no clique)
 *  2. GET /pluggy/connect-token (auth) → accessToken fresco (TTL ~30min)
 *  3. abrirWidgetOpenFinance({ connectToken, provider, onSuccess }) → widget modal
 *  4. onSuccess({ item }) → POST /pluggy/connections { item_id } (o backend
 *     persiste e dispara o sync inicial async) → onConnected() do chamador
 *     (refresh da página; as posições chegam quando o sync termina)
 *
 *  5. Falha no banco (o Inter recusou o consentimento, a confirmação no app
 *     expirou): o widget só fecha. O backend guarda o item/error que o
 *     agregador manda, e `error` passa a dizer o que houve — ao fechar o
 *     widget e quando a aba volta do app do banco (no celular o widget abre
 *     noutra aba e o onClose pode nem chegar).
 *
 * Sem env extra no front: o token vem do backend autenticado; as credenciais
 * Pluggy (client_id/secret) vivem SÓ no Laravel. Erro em qualquer etapa →
 * `error` legível pro CarteiraConnect degradar com instrução (nunca botão morto).
 */
import { abrirWidgetOpenFinance } from '~/utils/widget-open-finance'

interface PluggyItem { id: string; status: string }

// cache do módulo — não re-importa a cada clique
export function usePluggyConnect() {
  const { token } = useAuthState()
  const opening = ref(false)
  const registering = ref(false)
  const error = ref<string | null>(null)
  /** a tentativa que falhou no banco (com ela a tela oferece a ajuda pelo WhatsApp) */
  const falha = ref<FalhaDeConexaoApi | null>(null)

  const base = '/api/backend'
  const authHeaders = () => ({
    Accept: 'application/json',
    ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
  })

  /**
   * Lê a falha recente e, se houver, troca `error` pela frase dela. O aviso do
   * agregador chega pelo webhook alguns segundos depois do fecho do widget:
   * `esperas` são as tentativas (ms) antes de desistir.
   */
  let conferindo = false
  async function conferirFalha(esperas: number[] = [0]) {
    if (!token.value || conferindo) return
    conferindo = true
    try {
      for (const ms of esperas) {
        if (ms) await new Promise((r) => setTimeout(r, ms))
        if (registering.value) return
        try {
          const r = await pluggyFetchFalhaRecente(base, authHeaders())
          if (r.falha) { falha.value = r.falha; error.value = r.falha.frase; return }
        } catch { /* sem a falha, fica a mensagem que já havia */ }
      }
    } finally {
      conferindo = false
    }
  }

  // Volta do app do banco (celular) ou página recarregada depois dele.
  const aoVoltar = () => { if (document.visibilityState === 'visible') void conferirFalha([0, 3000]) }
  onMounted(() => {
    void conferirFalha()
    document.addEventListener('visibilitychange', aoVoltar)
  })
  onBeforeUnmount(() => document.removeEventListener('visibilitychange', aoVoltar))

  /**
   * Abre o widget. `onConnected` roda depois do POST /pluggy/connections
   * (conexão persistida + sync inicial enfileirado pelo backend).
   */
  /**
   * "Me chamem no WhatsApp para resolver." `celular` só quando a conta não tem
   * um. Devolve o código do erro ('celular_invalido', 'falhou') ou null.
   */
  async function pedirContato(celular?: string): Promise<string | null> {
    try {
      const r = await pluggyPedirContato(base, authHeaders(), celular)
      falha.value = r.falha
      return null
    } catch (e: any) {
      return e?.data?.code === 'celular_invalido' ? 'celular_invalido' : 'falhou'
    }
  }

  async function openWidget(opts: { onConnected: (item: PluggyItem) => void; onClose?: () => void }) {
    error.value = null
    falha.value = null
    opening.value = true
    try {
      const { accessToken, provider } = await pluggyFetchConnectToken(base, authHeaders())

      await abrirWidgetOpenFinance({
        connectToken: accessToken,
        provider,
        onSuccess: async (item) => {
          registering.value = true
          try {
            await pluggyRegisterConnection(base, authHeaders(), item.id, provider)
            falha.value = null
            error.value = null
            opts.onConnected(item as PluggyItem)
          } catch {
            error.value = 'A conexão foi criada no seu banco, mas não conseguimos registrá-la aqui. Recarregue a página. Se ela não aparecer, tente conectar de novo.'
          } finally {
            registering.value = false
          }
        },
        onError: () => {
          error.value = 'O widget de conexão encontrou um erro. Tente de novo em instantes.'
          void conferirFalha([0, 2500, 6000])
        },
        onClose: () => {
          opts.onClose?.()
          void conferirFalha([1500, 4000, 8000])
        },
      })
    } catch {
      error.value = 'Não conseguimos abrir a conexão segura agora. Verifique sua internet e tente de novo em instantes.'
    } finally {
      opening.value = false
    }
  }

  return { openWidget, opening, registering, error, falha, pedirContato }
}

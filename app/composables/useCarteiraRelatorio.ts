/**
 * O relatório da carteira (`GET /me/carteira/relatorio`, 07/11/2026). Só no
 * cliente e só sob pedido: a curva é reconstruída pregão a pregão, e o SSR da
 * página não espera por ela. Quem pede:
 *  - "Ver o relatório completo" (VisaoRelatorio): a nota, os indicadores e o
 *    desempenho (a TWR contra o benchmark);
 *  - "Ver detalhes" do topo (CarteiraAgora): a legenda "Você" do gráfico é a
 *    TWR do período, tirada da `series.carteira`.
 * Os dois dividem a mesma resposta (useState, uma busca só; o servidor guarda
 * 10 minutos). Enquanto carrega, a seção mostra o esqueleto e o topo diz
 * "Patrimônio (com aportes)".
 *
 * Estados: 'fechado' (ninguém pediu) → 'carregando' → 'pronto' | 'erro'; com
 * erro, o próximo pedido tenta de novo. No dev, com a tela no mock, a resposta
 * é o relatorioMock (com uma espera curta, para o esqueleto aparecer), num
 * estado à parte do real.
 */
import type { CarteiraRelatorio } from '~/types/carteiraRelatorio'
import { relatorioMock } from '~/dev/carteiraVisaoMock'

export type EstadoDoRelatorio = 'fechado' | 'carregando' | 'pronto' | 'erro'

export function useCarteiraRelatorio(opts: { mock?: boolean } = {}) {
  const { authFetch } = useApi()
  const { token } = useAuthState()
  const mock = import.meta.dev && !!opts.mock
  const chave = mock ? 'carteira:relatorio:mock' : 'carteira:relatorio'
  const estado = useState<EstadoDoRelatorio>(`${chave}:estado`, () => 'fechado')
  // a resposta inteira (4 séries de ~380 pregões) não precisa ser reativa por dentro
  const relatorio = useState<CarteiraRelatorio | null>(chave, () => null)
  // o relatório é de uma sessão: outra conta na mesma aba começa do zero (só no cliente: o resumo não vai para o payload)
  const dono = useState<string | null>(`${chave}:dono`, () => null)
  function daSessao() {
    if (!import.meta.client) return
    const d = resumoDoToken(token.value)
    if (dono.value === d) return
    dono.value = d
    estado.value = 'fechado'
    relatorio.value = null
  }
  daSessao()

  async function carregar() {
    daSessao()
    if (import.meta.server || estado.value === 'carregando' || estado.value === 'pronto') return
    estado.value = 'carregando'
    try {
      let r: CarteiraRelatorio
      if (mock) {
        await new Promise((res) => setTimeout(res, 700))
        r = relatorioMock()
      } else {
        r = await authFetch<CarteiraRelatorio>('/me/carteira/relatorio', {}, { redirectOnAuthError: false })
      }
      relatorio.value = markRaw(r)
      estado.value = 'pronto'
    } catch {
      estado.value = 'erro'
    }
  }

  return { estado, relatorio, carregar }
}

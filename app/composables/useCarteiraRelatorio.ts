/**
 * O relatório da carteira (`GET /me/carteira/relatorio`, 07/11/2026). Só no
 * cliente e só quando a pessoa abre "Ver o relatório completo": a curva é
 * reconstruída pregão a pregão, e o SSR da página não espera por ela.
 * Enquanto carrega, a seção mostra o esqueleto na forma do relatório.
 *
 * Estados: 'fechado' (nunca abriu) → 'carregando' → 'pronto' | 'erro'.
 * No dev, com a tela no mock, a resposta é o relatorioMock (com uma espera
 * curta, para o esqueleto aparecer).
 */
import type { CarteiraRelatorio } from '~/types/carteiraRelatorio'
import { relatorioMock } from '~/dev/carteiraVisaoMock'

export type EstadoDoRelatorio = 'fechado' | 'carregando' | 'pronto' | 'erro'

export function useCarteiraRelatorio(opts: { mock?: boolean } = {}) {
  const { authFetch } = useApi()
  const estado = ref<EstadoDoRelatorio>('fechado')
  const relatorio = shallowRef<CarteiraRelatorio | null>(null)

  async function carregar() {
    if (estado.value === 'carregando' || estado.value === 'pronto') return
    estado.value = 'carregando'
    try {
      if (import.meta.dev && opts.mock) {
        await new Promise((r) => setTimeout(r, 700))
        relatorio.value = relatorioMock()
      } else {
        relatorio.value = await authFetch<CarteiraRelatorio>('/me/carteira/relatorio', {}, { redirectOnAuthError: false })
      }
      estado.value = 'pronto'
    } catch {
      estado.value = 'erro'
    }
  }

  return { estado, relatorio, carregar }
}

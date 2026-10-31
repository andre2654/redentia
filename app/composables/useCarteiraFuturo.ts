/**
 * O leque de 5 anos da carteira (GET /me/carteira/futuro, 31/10/2026). Só no
 * client e depois do mount: o motor roda 2.000 caminhos e não pode segurar o
 * SSR da página. Enquanto isso a seção mostra o esqueleto na forma do leque.
 *
 * Estados:
 *  - 'carregando' → esqueleto
 *  - 'pronto'     → vm + dados
 *  - 'vazio'      → sem posições (a seção some; a página já é o convite)
 *  - 'fora'       → `sem_posicoes_simulaveis`: tudo o que a pessoa tem fica
 *                   fora do motor (cripto, COE, renda fixa sem indexador) —
 *                   frase calma dizendo o quê
 *  - 'erro'       → 503 `engine_unavailable` ou rede: frase + "Tentar de novo"
 *  - 'invalida'   → 422 `invalid_portfolio`: frase calma, sem botão (repetir
 *                   não muda a resposta)
 *  - 'bloqueado'  → 402 assinatura_necessaria (o gate do servidor; a página cuida)
 */
import type { FuturoDadosApi } from '~/types/assinatura'
import { erroDeAssinatura, statusHttpDoErro } from '~/utils/assinatura'
import { listaDeFora, montarFuturo, type FuturoVM } from '~/utils/futuro'

export type EstadoDoFuturo = 'carregando' | 'pronto' | 'vazio' | 'fora' | 'erro' | 'invalida' | 'bloqueado'

export function useCarteiraFuturo() {
  const { token } = useAuthState()
  const estado = ref<EstadoDoFuturo>('carregando')
  const dados = shallowRef<FuturoDadosApi | null>(null)
  const vm = shallowRef<FuturoVM | null>(null)
  /** 'BTC (cripto) e COE XP (COE)' — no estado 'fora' */
  const fora = ref<string | null>(null)

  async function carregar() {
    estado.value = 'carregando'
    try {
      const r = await carteiraFetchFuturo('/api/backend', {
        Accept: 'application/json',
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      })
      if (!r?.data) {
        if (r?.reason === 'sem_posicoes_simulaveis') {
          fora.value = listaDeFora(r.excluded)
          estado.value = 'fora'
          return
        }
        estado.value = 'vazio'
        return
      }
      const montado = montarFuturo(r.data)
      if (!montado) {
        estado.value = 'invalida'
        return
      }
      dados.value = r.data
      vm.value = montado
      estado.value = 'pronto'
    } catch (err) {
      if (erroDeAssinatura(err)) estado.value = 'bloqueado'
      else if (statusHttpDoErro(err) === 422) estado.value = 'invalida'
      else estado.value = 'erro'
    }
  }

  onMounted(carregar)

  return { estado, dados, vm, fora, carregar }
}

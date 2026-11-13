/**
 * O leque de 5 anos da carteira (GET /me/carteira/futuro, 31/10/2026). Só no
 * client e depois do mount: o motor roda 2.000 caminhos e não pode segurar o
 * SSR da página. Enquanto isso a seção mostra o esqueleto na forma do leque.
 *
 * `caminhos` são os 2.000 caminhos já decodificados (caminhosDoLeque), uma vez
 * só; null quando a resposta não os traz ou não fecha, e aí o leque cai nas
 * faixas. Decodificados, os arrays crus saem de `dados` (~1 MB a menos).
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
 *
 * UM PEDIDO POR PÁGINA (12/11/2026): a /carteira nova mostra o futuro em dois
 * lugares, o gráfico do topo (CarteiraHorizonte) e a seção dos 5 anos
 * (CarteiraFuturo). A página provê o futuro (proverCarteiraFuturo) e os dois
 * leem o mesmo; quem usa `useCarteiraFuturo` fora dela (a tela antiga) segue
 * pedindo o seu.
 */
import type { FuturoDadosApi } from '~/types/assinatura'
import { erroDeAssinatura, statusHttpDoErro } from '~/utils/assinatura'
import { marcaNaResposta } from '~/utils/carteiraVisao'
import { marcaNoTexto } from '~/utils/marcaNoTexto'
import { caminhosDoLeque, listaDeFora, montarFuturo, type CaminhosDoLeque, type FuturoComCaminhos, type FuturoVM } from '~/utils/futuro'

export type EstadoDoFuturo = 'carregando' | 'pronto' | 'vazio' | 'fora' | 'erro' | 'invalida' | 'bloqueado'

type FuturoDaCarteira = ReturnType<typeof criarCarteiraFuturo>
const CHAVE_DO_FUTURO: InjectionKey<FuturoDaCarteira> = Symbol('carteira:futuro')

/** A página pede o futuro uma vez e o divide com quem está abaixo dela. */
export function proverCarteiraFuturo(): FuturoDaCarteira {
  const f = criarCarteiraFuturo()
  provide(CHAVE_DO_FUTURO, f)
  return f
}
/** O futuro que a página proveu; null fora dela (a tela antiga, o mock do dev). */
export function useCarteiraFuturoDaPagina(): FuturoDaCarteira | null {
  return inject(CHAVE_DO_FUTURO, null)
}
/** O futuro da página, quando ela o proveu; senão, um pedido próprio. */
export function useCarteiraFuturo(): FuturoDaCarteira {
  return inject(CHAVE_DO_FUTURO, null) ?? criarCarteiraFuturo()
}

function criarCarteiraFuturo() {
  const { token } = useAuthState()
  const estado = ref<EstadoDoFuturo>('carregando')
  const dados = shallowRef<FuturoDadosApi | null>(null)
  const vm = shallowRef<FuturoVM | null>(null)
  const caminhos = shallowRef<CaminhosDoLeque | null>(null)
  /** 'BTC (cripto) e COE XP (COE)' — no estado 'fora' */
  const fora = ref<string | null>(null)

  async function carregar() {
    estado.value = 'carregando'
    try {
      // os textos do motor (o aviso legal, o motivo de quem ficou de fora) com a marca do site; os caminhos passam direto
      const r = marcaNaResposta(await carteiraFetchFuturo('/api/backend', {
        Accept: 'application/json',
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      }), marcaNoTexto)
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
      const { paths_data: _crus, ...resto } = r.data as FuturoComCaminhos
      caminhos.value = caminhosDoLeque(r.data as FuturoComCaminhos)
      dados.value = resto
      vm.value = montado
      estado.value = 'pronto'
    } catch (err) {
      if (erroDeAssinatura(err)) estado.value = 'bloqueado'
      else if (statusHttpDoErro(err) === 422) estado.value = 'invalida'
      else estado.value = 'erro'
    }
  }

  onMounted(carregar)

  return { estado, dados, vm, caminhos, fora, carregar }
}

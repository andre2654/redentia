import { destinoComAtribuicao, lerAtribuicao } from '~/utils/business-lead'

/**
 * /business/cadastro com os identificadores da primeira página da sessão.
 *
 * O href do SSR fica limpo. /business é cacheada na borda e não pode sair
 * com o utm de um visitante. Depois do mount, Entrar e "Ativar acesso"
 * levam a query, para o page_view de /business/cadastro nascer com campanha.
 */
export function useDestinoCadastroBusiness() {
  const destino = ref('/business/cadastro')
  onMounted(() => {
    try {
      destino.value = destinoComAtribuicao('/business/cadastro', lerAtribuicao(window.sessionStorage))
    }
    catch {
      // sessionStorage indisponível: o link segue sem query
    }
  })
  return destino
}

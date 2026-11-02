/**
 * O chat da Redentia como painel, aberto de qualquer página (02/11/2026).
 *
 * Contrato entre a barra de pergunta (fixa no rodapé de toda página), a busca
 * (/busca) e o painel à direita. Quem quer abrir o chat chama `abrir()`; o
 * painel é o único que lê `pendente` e manda a pergunta ao useNuChat.
 *
 * `contextos` são os pedaços da página que a pessoa anexou clicando neles com
 * o painel aberto (o cursor mágico): um ativo, um gráfico, uma linha da
 * carteira. Vão junto com a próxima pergunta e saem depois do envio.
 */
import { voltaComPergunta } from '~/utils/chat-painel'

export interface ContextoDoChat {
  /** estável por pedaço da página, para não anexar o mesmo duas vezes */
  id: string
  /** o tipo do pedaço: 'ativo', 'grafico', 'carteira', 'tese', 'noticia'... */
  tipo: string
  /** o rótulo do chip no campo, curto: "PETR4", "Proventos de 12 meses" */
  rotulo: string
  /** o que o modelo lê: o texto/dado do pedaço, já resumido */
  texto: string
  /** a página onde foi anexado */
  rota?: string
}

export interface PerguntaPendente {
  texto: string
  contextos: ContextoDoChat[]
}

/** A pergunta longa demais para o `?pergunta=` da volta do /login espera aqui. */
export const CHAVE_POS_LOGIN = 'nu:chat:pergunta-pos-login'

export function useChatPainel() {
  const aberto = useState<boolean>('nu:chat-painel:aberto', () => false)
  const pendente = useState<PerguntaPendente | null>('nu:chat-painel:pendente', () => null)
  const contextos = useState<ContextoDoChat[]>('nu:chat-painel:contextos', () => [])

  /** Abre o painel; com `pergunta`, ela é enviada assim que o painel montar. */
  function abrir(pergunta?: string, extras: ContextoDoChat[] = []) {
    for (const c of extras) anexar(c)
    const texto = pergunta?.trim()
    if (texto) {
      pendente.value = { texto, contextos: [...contextos.value] }
      contextos.value = []
    }
    aberto.value = true
  }

  function fechar() {
    aberto.value = false
  }

  function anexar(c: ContextoDoChat) {
    if (!contextos.value.some((x) => x.id === c.id)) contextos.value = [...contextos.value, c]
  }

  function remover(id: string) {
    contextos.value = contextos.value.filter((c) => c.id !== id)
  }

  /** O painel pega a pergunta pendente uma vez (e ela some). */
  function consumirPendente(): PerguntaPendente | null {
    const p = pendente.value
    pendente.value = null
    return p
  }

  /**
   * Perguntar de qualquer lugar (barra, /busca, atalhos). Quem não entrou vê a
   * folha de cadastro com a pergunta guardada no herói; com a conta aberta, o
   * painel abre e manda. Quem entrou e não assina vê o quiz ao enviar
   * (ChatPainel). Dono, 02/11/2026: "se o cara não tiver logado aparece esse
   * modal pedindo para ele logar".
   */
  function perguntar(pergunta: string, extras: ContextoDoChat[] = []) {
    const texto = pergunta.trim()
    if (!texto) { abrir(); return }
    if (useAuthState().isAuthenticated.value) { abrir(texto, extras); return }
    pedirConta(texto, [...contextos.value, ...extras.filter((c) => !contextos.value.some((x) => x.id === c.id))])
  }

  function pedirConta(texto: string, junto: ContextoDoChat[]) {
    if (import.meta.server) return
    const route = useRoute()
    const { volta, naUrl } = voltaComPergunta(route.path, route.query as Record<string, unknown>, texto)
    // quem prefere o /login (celular, Google por lá) volta com a pergunta
    if (!naUrl) {
      try { sessionStorage.setItem(CHAVE_POS_LOGIN, texto) } catch { /* sem storage: volta sem a pergunta */ }
    }
    aberto.value = false
    contextos.value = []
    useCadastroFolha().abrir({ gesto: 'pergunta', pergunta: texto }, () => true, volta, () => abrir(texto, junto))
  }

  return { aberto, pendente, contextos, abrir, perguntar, pedirConta, fechar, anexar, remover, consumirPendente }
}

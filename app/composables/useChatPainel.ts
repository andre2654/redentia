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

  return { aberto, pendente, contextos, abrir, fechar, anexar, remover, consumirPendente }
}

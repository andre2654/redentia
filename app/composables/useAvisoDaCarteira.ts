/**
 * O aviso urgente do motor da carteira (12/11/2026): a consulta que o selo da
 * home ("Tudo normal" / "Pede atenção") e a régua do topo ("Sua carteira
 * +0,11% · pede atenção") dividem. Até aqui morava dentro do HomeAgoraFrase.
 *
 * A pergunta é a mesma da /carteira: GET /me/carteira/visao, e o aviso conta se
 * o `avisos.urgente` está entre os `itens` (11/11/2026, "O AVISO DO MOTOR").
 * Só no cliente, depois de montar, e sem segurar a primeira pintura: a borda
 * cacheia o HTML, e nada da carteira entra nele.
 *
 * Uma consulta só: o resultado fica em useState (a home e a régua leem o mesmo
 * booleano) e a resposta vale 5 minutos para a mesma sessão; quem chega
 * enquanto ela está a caminho espera a mesma promessa. Sem resposta (a visão
 * desligada para a pessoa, rede, 5xx), o aviso fica como estava: quem lê segue
 * com o selo do dia. O token nunca vai para o useState (regra da casa: nada da
 * sessão no payload); a chave da sessão fica só na memória do navegador.
 */
const VALIDADE_MS = 5 * 60 * 1000
let emVoo: Promise<void> | null = null
/** de quem e quando foi a última resposta (só no cliente) */
let respondidoPara: string | null = null
let respondidoEm = 0

export function useAvisoDaCarteira() {
  const { token } = useAuthState()
  /** o aviso urgente do motor existe e está na lista do dia */
  const urgente = useState<boolean>('carteira:aviso-urgente', () => false)
  /** a consulta já voltou (com resposta ou sem) para esta sessão */
  const consultado = useState<boolean>('carteira:aviso-consultado', () => false)

  async function buscar(t: string) {
    try {
      const v = await $fetch<{ avisos?: { urgente?: string | null; itens?: { id: string }[] } }>('/api/backend/me/carteira/visao', {
        headers: { Accept: 'application/json', Authorization: `Bearer ${t}` },
      })
      if (token.value !== t) return
      const id = v.avisos?.urgente
      urgente.value = !!id && !!v.avisos?.itens?.some((a) => a.id === id)
      respondidoPara = t
      respondidoEm = Date.now()
    } catch { /* sem resposta: o selo segue com o dia */ }
    finally {
      if (token.value === t) consultado.value = true
    }
  }

  /** Pergunta ao motor, uma vez por sessão a cada 5 minutos. Só no cliente. */
  function consultar(): Promise<void> {
    if (!import.meta.client) return Promise.resolve()
    const t = token.value
    if (!t) return Promise.resolve()
    if (respondidoPara === t && Date.now() - respondidoEm < VALIDADE_MS) return Promise.resolve()
    if (emVoo) return emVoo
    emVoo = buscar(t).finally(() => { emVoo = null })
    return emVoo
  }

  /** A sessão trocou ou saiu: o aviso de outra pessoa não fica na tela. */
  function esquecer() {
    urgente.value = false
    consultado.value = false
    respondidoPara = null
    respondidoEm = 0
  }

  return { urgente, consultado, consultar, esquecer }
}

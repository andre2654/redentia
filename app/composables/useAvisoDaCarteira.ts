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
 *
 * SEM DISPUTAR COM A PÁGINA (12/11/2026, "demora muito para abrir gráficos"):
 * a resposta pesa ~124 KB e leva segundos, e a régua pedia a cada carga de
 * página, na frente dos pedidos da página do ativo. Agora:
 *  - a régua pede ADIADO (`consultar({ adiado: true })`): só depois do
 *    page:finish, com o navegador ocioso e um pequeno atraso, e nunca com a
 *    janelinha de um ativo aberta ou o maximizar na tela (quem abre um ativo
 *    espera a página dele, não o vigia); até a resposta, a régua mostra o selo
 *    do dia, que vem do /portfolio/today;
 *  - a home pede NA HORA, como antes (lá o aviso é o assunto da tela);
 *  - a resposta fica no sessionStorage por 5 minutos (utils/avisoGuardado.ts:
 *    a chave leva um hash curto do token, nunca o token), e uma página nova
 *    ou um recarregamento leem dali em vez de pedir de novo.
 */
import { VALIDADE_DO_AVISO_MS, esquecerAvisosGuardados, guardaDaAba, guardarAviso, lerAvisoGuardado } from '~/utils/avisoGuardado'
import { esperarOcioso } from '~/utils/quandoOcioso'

/** depois da página pronta e ociosa, o respiro antes de pedir */
const ATRASO_ADIADO_MS = 2000
let emVoo: Promise<void> | null = null
/** a consulta adiada que espera a página (uma só por sessão) */
let agendada: { token: string; p: Promise<void> } | null = null
/** de quem e quando foi a última resposta (só no cliente) */
let respondidoPara: string | null = null
let respondidoEm = 0

/** a janelinha de um ativo aberta ou a capa do maximizar na tela: quem abre um ativo espera a página dele */
function abrindoUmAtivo(): boolean {
  const h = document.documentElement.classList
  return h.contains('nu-espiar-aberto') || h.contains('nu-maximizando')
}

export function useAvisoDaCarteira() {
  const { token } = useAuthState()
  /** o aviso urgente do motor existe e está na lista do dia */
  const urgente = useState<boolean>('carteira:aviso-urgente', () => false)
  /** a consulta já voltou (com resposta ou sem) para esta sessão */
  const consultado = useState<boolean>('carteira:aviso-consultado', () => false)

  function vale(t: string) {
    return respondidoPara === t && Date.now() - respondidoEm < VALIDADE_DO_AVISO_MS
  }

  /** a resposta guardada na aba (de outra página ou de antes do recarregamento), se ainda vale */
  function daAba(t: string): boolean {
    const g = lerAvisoGuardado(guardaDaAba(), t)
    if (!g) return false
    urgente.value = g.urgente
    consultado.value = true
    respondidoPara = t
    respondidoEm = g.em
    return true
  }

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
      guardarAviso(guardaDaAba(), t, urgente.value, respondidoEm)
    } catch { /* sem resposta: o selo segue com o dia */ }
    finally {
      if (token.value === t) consultado.value = true
    }
  }

  function pedir(t: string): Promise<void> {
    if (emVoo) return emVoo
    emVoo = buscar(t).finally(() => { emVoo = null })
    return emVoo
  }

  /**
   * Pergunta ao motor, uma vez por sessão a cada 5 minutos. Só no cliente.
   * `adiado`: só quando a página já carregou e o navegador está ocioso (a régua).
   */
  function consultar(opcoes: { adiado?: boolean } = {}): Promise<void> {
    if (!import.meta.client) return Promise.resolve()
    const t = token.value
    if (!t) return Promise.resolve()
    if (vale(t) || daAba(t)) return Promise.resolve()
    if (emVoo) return emVoo
    if (!opcoes.adiado) return pedir(t)
    if (agendada?.token === t) return agendada.p
    const minha = {
      token: t,
      p: esperarOcioso({ atraso: ATRASO_ADIADO_MS, ocupado: abrindoUmAtivo, cancelado: () => token.value !== t })
        .then((pode) => {
          // enquanto esperava: a sessão trocou, ou a home já perguntou
          if (!pode || token.value !== t || vale(t) || daAba(t)) return
          return pedir(t)
        })
        .finally(() => { if (agendada === minha) agendada = null }),
    }
    agendada = minha
    return minha.p
  }

  /**
   * A sessão trocou ou saiu: o aviso de outra pessoa não fica na tela. Com
   * `saiu` (o logout), sai da aba também. A sessão que só chega depois da
   * hidratação (o HIT da borda) não apaga a aba: a chave é da conta, e a
   * resposta guardada é dela.
   */
  function esquecer(opcoes: { saiu?: boolean } = {}) {
    urgente.value = false
    consultado.value = false
    respondidoPara = null
    respondidoEm = 0
    agendada = null
    if (import.meta.client && opcoes.saiu) esquecerAvisosGuardados(guardaDaAba())
  }

  return { urgente, consultado, consultar, esquecer }
}

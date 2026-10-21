import type { WatchSource } from 'vue'

/** Na sessão: a folha de alguma calculadora já subiu (o convite da newsletter espera a visita seguinte). */
export const CONTA_CONVITE_VISTO = 'nu:conta-convite-visto'
const FECHOU = 'nu:conta-convite-fechou'

/**
 * Depois de mexer na conta, a folha de cadastro sobe sozinha uma vez (dono,
 * 21/10/2026: "depois da pessoa interagir com a calculadora, tem que aparecer
 * o modal para a pessoa salvar a conta e outras coisas se fizer login").
 *
 * Só para quem não tem conta, 4 s depois da segunda mudança na conta (a cada
 * mudança o relógio recomeça: enquanto a pessoa arrasta, nada sobe), uma vez
 * por visita, contando a folha que ela mesma abriu pelo "Salvar". Fechou sem
 * criar conta, some por 7 dias. Nunca por cima de outra folha. As regras puras
 * estão em utils/calculadora-frase.ts.
 *
 * `convidar` abre a folha (CalcSimSaves.pedir('convite')).
 */
export function useConviteDaConta(calculadora: string, fonte: WatchSource<unknown>, convidar: () => unknown) {
  if (import.meta.server) return
  const { isAuthenticated } = useAuthState()
  const folha = useCadastroFolha()
  const visto = `nu:conta-convite:${calculadora}`

  const ler = (chave: string, sessao = false) => {
    try {
      return (sessao ? sessionStorage : localStorage).getItem(chave)
    }
    catch {
      return null
    }
  }
  const gravar = (chave: string, valor: string, sessao = false) => {
    try {
      (sessao ? sessionStorage : localStorage).setItem(chave, valor)
    }
    catch { /* sem armazenamento, o convite só não lembra entre páginas */ }
  }

  // a folha das calculadoras subiu, pelo botão ou sozinha: é a vez desta visita.
  // Fechou sem criar conta: o "Agora não" vale por 7 dias.
  watch(() => folha.aberta.value, (agora, antes) => {
    const g = agora?.contexto.gesto
    if (g === 'simulacao' || g === 'aposentadoria') {
      gravar(visto, '1', true)
      gravar(CONTA_CONVITE_VISTO, '1', true)
    }
    const eraDaConta = antes?.contexto.gesto === 'simulacao' || antes?.contexto.gesto === 'aposentadoria'
    if (!agora && eraDaConta && !isAuthenticated.value) gravar(FECHOU, String(Date.now()))
  })

  let mudancas = 0
  let relogio: ReturnType<typeof setTimeout> | null = null
  function tentar() {
    relogio = null
    const pode = podeConvidarConta({
      logado: isAuthenticated.value,
      folhaAberta: !!folha.aberta.value,
      jaNaVisita: !!ler(visto, true),
      fechouEm: Number(ler(FECHOU)) || null,
      agora: Date.now(),
    })
    if (pode) convidar()
  }
  watch(fonte, () => {
    if (isAuthenticated.value) return
    mudancas += 1
    if (relogio) clearTimeout(relogio)
    if (mudancas >= CONTA_CONVITE_MUDANCAS) relogio = setTimeout(tentar, CONTA_CONVITE_ESPERA_MS)
  }, { deep: true })
  onBeforeUnmount(() => { if (relogio) clearTimeout(relogio) })
}

/**
 * A folha de cadastro (21/10/2026): o gatilho que pedia conta e mandava para
 * o /login agora abre esta folha, com o que a pessoa clicou já funcionando
 * (CadastroFolha, montada uma vez no layout). Ela cria a conta pelo código de
 * 6 números, roda a `acao` que o gatilho deixou (seguir, salvar, ligar o
 * resumo, abrir o chat) e só então fecha.
 *
 * Estado do client, no módulo: só um clique abre a folha, e no servidor nada
 * escreve aqui (o módulo é dividido entre requests no SSR).
 */
export type CadastroContexto =
  | { gesto: 'seguir'; ticker: string }
  | { gesto: 'resumo' }
  | { gesto: 'simulacao'; inicial: number; mensal: number; taxa: number; anos: number }
  | { gesto: 'aposentadoria'; idade: number; aposentaAos: number; total: number; necessario: number; serie: number[] }
  // as outras calculadoras (21/10/2026): o número da conta, o selo e, quando há, a curva com a meta
  | {
    gesto: 'conta'
    /** no alto do herói ("Meta de R$ 500 mil em 10 anos") */
    rotulo: string
    /** o número grande, já formatado ("R$ 2.457/mês") */
    valor: string
    selo?: string
    seloFalta?: boolean
    serie?: number[]
    meta?: number | null
    rotuloMeta?: string
    rotulos?: [string, string]
    /** a pergunta de exemplo do "Pergunte à Redentia", com aspas */
    pergunta: string
  }
  | { gesto: 'pergunta'; pergunta: string }

/** Como a conta saiu: o canal do código e se ela é nova. */
export interface CadastroFeito {
  canal: 'email' | 'whatsapp'
  novaConta: boolean
  /** o e-mail ou celular confirmado */
  contato: string
}

export interface CadastroAberto {
  contexto: CadastroContexto
  /** o que fazer assim que a sessão abre (seguir, salvar, ligar); `false` = não deu */
  acao: (feito: CadastroFeito) => unknown
  /** o que fazer no fim, depois do onboarding (a pergunta abre o chat aqui) */
  depois?: () => unknown
  /** para onde o /login devolve quem prefere entrar por lá (Google, celular) */
  voltar: string
  id: number
}

const aberta = shallowRef<CadastroAberto | null>(null)
let seq = 0

export function useCadastroFolha() {
  function abrir(contexto: CadastroContexto, acao: CadastroAberto['acao'], voltar: string, depois?: () => unknown) {
    if (import.meta.server) return
    aberta.value = { contexto, acao, depois, voltar, id: ++seq }
    eventoCadastro('cadastro_folha_aberta', { gesto: contexto.gesto })
  }
  function fechar() {
    aberta.value = null
  }
  return { aberta: readonly(aberta), abrir, fechar }
}

/** Evento no GA4: qual gesto abre a folha e qual vira conta. */
export function eventoCadastro(nome: string, params: Record<string, string | number | boolean>) {
  if (import.meta.server) return
  ;(window as any).gtag?.('event', nome, params)
}

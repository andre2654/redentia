/**
 * O que pode esperar espera a página (12/11/2026, a abertura do ativo mais
 * rápida). Um pedido que não precisa sair na hora (o vigia da carteira na
 * régua) só sai quando a página já terminou de carregar e o navegador está
 * ocioso: depois do `page:finish`, um pequeno atraso e o requestIdleCallback
 * (com teto; onde ele não existe, um setTimeout curto). Se outra navegação
 * começa no meio, a espera recomeça no `page:finish` dela; enquanto quem chama
 * diz que está ocupado (a janelinha de um ativo aberta, por exemplo), ela
 * espera mais um atraso.
 *
 * O plugin pagina-pronta.client.ts liga o acompanhamento no começo do app
 * (`acompanharPaginas`); a hidratação conta como carregando até o primeiro
 * `page:finish`. Aqui só a regra, com o relógio injetável para o teste.
 */
let carregando = false
/** conta as navegações: a espera que começou antes de uma recomeça */
let geracao = 0
const aoTerminar = new Set<() => void>()

interface GanchosDasPaginas {
  isHydrating?: boolean
  hook: (nome: 'page:start' | 'page:finish', fn: () => void) => unknown
}

/** Liga uma vez, no começo do app (só no cliente). */
export function acompanharPaginas(app: GanchosDasPaginas): void {
  carregando = !!app.isHydrating
  app.hook('page:start', () => paginaComecou())
  app.hook('page:finish', () => paginaTerminou())
}

export function paginaComecou(): void {
  carregando = true
  geracao++
}

export function paginaTerminou(): void {
  carregando = false
  const fila = [...aoTerminar]
  aoTerminar.clear()
  for (const f of fila) f()
}

/** Resolve quando não há página carregando (na hora, se já não há). */
export function paginaPronta(): Promise<void> {
  return carregando ? new Promise<void>((ok) => { aoTerminar.add(ok) }) : Promise.resolve()
}

export interface RelogioOcioso {
  dormir: (ms: number) => Promise<void>
  /** o navegador ocioso, no máximo em `teto` ms */
  ocioso: (teto: number) => Promise<void>
}

export const relogioDoNavegador: RelogioOcioso = {
  dormir: (ms) => new Promise((ok) => { setTimeout(ok, ms) }),
  ocioso: (teto) => new Promise((ok) => {
    const w = typeof window !== 'undefined' ? window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number } : null
    if (w?.requestIdleCallback) w.requestIdleCallback(() => ok(), { timeout: teto })
    else setTimeout(ok, 200)
  }),
}

export interface EsperaOciosa {
  /** o respiro depois da página pronta, em ms */
  atraso: number
  /** o teto do requestIdleCallback, em ms */
  teto?: number
  /** quem chama ainda está ocupado: espera mais um atraso */
  ocupado?: () => boolean
  /** desistiu (a sessão trocou, por exemplo): a espera acaba com false */
  cancelado?: () => boolean
}

/** Espera a página pronta, o atraso e o ocioso; true quando pode seguir, false se desistiu. */
export async function esperarOcioso(o: EsperaOciosa, relogio: RelogioOcioso = relogioDoNavegador): Promise<boolean> {
  for (;;) {
    await paginaPronta()
    const g = geracao
    await relogio.dormir(o.atraso)
    await relogio.ocioso(o.teto ?? 2000)
    if (o.cancelado?.()) return false
    // outra navegação começou no meio, ou quem chama está ocupado: de novo
    if (carregando || g !== geracao || o.ocupado?.()) continue
    return true
  }
}

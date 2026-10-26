/**
 * O recado do André (26/10/2026, o dia vermelho depois do 2º turno): o que a
 * janela (NuRecado) e a faixa (NuRecadoFaixa) dividem. A janela abre sozinha
 * uma vez para quem está logado; a faixa fica no topo do site para todo mundo
 * e abre a mesma janela no clique. Os dois somem sozinhos depois de `ate`.
 */
export const RECADO = {
  id: 'dia-vermelho-2026-10-26',
  ate: Date.parse('2026-10-28T23:59:59-03:00'),
  escritoEm: 'Escrito na segunda, 26 de outubro',
}

/** A letra de mão do fecho (Caveat), só nos dias do recado. */
export const RECADO_LETRA = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap'

export function recadoNoAr(agora = Date.now()): boolean {
  return agora <= RECADO.ate
}

/** Evento no GA4, com o recado de parâmetro. */
export function eventoRecado(nome: string, params: Record<string, string> = {}) {
  if (import.meta.server) return
  ;(window as any).gtag?.('event', nome, { recado: RECADO.id, ...params })
}

export function useRecado() {
  const aberto = useState<boolean>('nu:recado-aberto', () => false)
  return { aberto }
}

/**
 * As contas puras do `v-revelar` (11/11/2026, robustez; a diretiva mora em
 * plugins/revelar.ts). Sem Vue e sem DOM: o teste (tests/revelar.test.ts) roda
 * no node.
 *
 * A regra: a entrada ao rolar NUNCA esconde conteúdo. O texto sai pronto do
 * servidor; só no cliente, e só para o que nasceu abaixo da dobra, uma Web
 * Animation leva de transparente, 14px abaixo e desfocado até o lugar, quando
 * o bloco chega perto da tela. Movimento reduzido: nada.
 */

/** O valor da diretiva: `v-revelar`, `v-revelar="{ y: 20 }"`, `v-revelar="{ alvo: 'filhos', passo: 60 }"`. */
export interface ValorRevelar {
  /** 'si' (padrão): o próprio elemento · 'filhos': cada filho direto, em cascata */
  alvo?: 'si' | 'filhos'
  /** ms entre um filho e o próximo (padrão 60) */
  passo?: number
  /** de quantos px abaixo ele sobe (padrão 14) */
  y?: number
  /** ms a mais antes de começar (escalona cartões de uma mesma fileira) */
  atraso?: number
}

/** Os números da entrada. A curva vai escrita: var() não vale numa Web Animation (é a --nu-ease-saida). */
export const REVELACAO = {
  duracao: 720, // --nu-dur-entrada
  curva: 'cubic-bezier(.16, 1, .3, 1)', // --nu-ease-saida
  y: 14,
  passo: 60,
  desfoque: 6,
  /** a cascata para no 8º filho: os seguintes entram junto com ele */
  teto: 8,
  /** começa quando o bloco chega a 20% da altura da tela abaixo da borda de baixo */
  margem: '0px 0px 20% 0px',
} as const

/**
 * Anima? Só se o elemento nasceu ABAIXO da dobra (o topo dele no fim da tela
 * ou depois) e a pessoa não pediu menos movimento. O que já está na tela, ou
 * acima dela, fica como está: nada pisca de volta para o começo.
 */
export function deveRevelar(topo: number, alturaDaJanela: number, reduzido: boolean): boolean {
  if (reduzido || !Number.isFinite(topo) || !(alturaDaJanela > 0)) return false
  return topo >= alturaDaJanela
}

/** O atraso total do alvo `i`: o `atraso` pedido mais o da cascata. */
export function atrasoDe(i: number, v: ValorRevelar = {}): number {
  const extra = Number.isFinite(v.atraso) && v.atraso! > 0 ? v.atraso! : 0
  return extra + atrasoDoFilho(i, v.passo ?? REVELACAO.passo)
}

/** O atraso do filho `i` (a partir de 0): `passo` ms a cada um, parando no `teto`-ésimo. */
export function atrasoDoFilho(i: number, passo: number = REVELACAO.passo, teto: number = REVELACAO.teto): number {
  const p = Number.isFinite(passo) && passo > 0 ? passo : 0
  return Math.min(Math.max(0, Math.floor(i)), Math.max(1, teto) - 1) * p
}

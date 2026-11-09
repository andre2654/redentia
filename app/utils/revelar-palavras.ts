/**
 * A resposta do chat surgindo palavra por palavra, como no herói antigo da
 * home (MercadoHeroPergunta, até 993d2369): cada palavra sai do desfoque.
 *
 * O markdown do chat (utils/markdown.ts) é re-renderizado a cada delta do
 * stream, e o v-html troca o DOM inteiro. Para nenhuma palavra já mostrada
 * animar de novo, cada palavra tem uma hora marcada (`agenda[i]`, em ms do
 * performance.now) que sobrevive às re-renderizações: a palavra recebe um
 * `animation-delay` relativo a agora, negativo quando já começou (a animação
 * continua de onde estava) e nenhuma animação quando já terminou.
 *
 * As palavras chegam em rajadas (um delta traz várias): a agenda espaça cada
 * uma `passo` ms da anterior, sem deixar a fila atrasar mais que `atrasoMax`.
 * Sem Vue, para o `node --test`.
 */

export interface OpcoesRevelar {
  /** espaço entre duas palavras seguidas, em ms */
  passo?: number
  /** duração da animação de uma palavra (a mesma do CSS), em ms */
  duracao?: number
  /** a fila nunca fica mais atrasada do que isto em relação a agora */
  atrasoMax?: number
}

const PADRAO: Required<OpcoesRevelar> = { passo: 38, duracao: 520, atrasoMax: 900 }

/** Estende a agenda até `total` palavras, marcando as novas a partir de `agora`. */
export function agendarPalavras(agenda: number[], total: number, agora: number, opcoes: OpcoesRevelar = {}): number[] {
  const { passo, atrasoMax } = { ...PADRAO, ...opcoes }
  if (total <= agenda.length) return agenda
  const out = agenda.slice()
  const novas = total - out.length
  // rajada grande: aperta o passo para a última caber no atraso máximo
  const ultima = out.length ? out[out.length - 1]! : -Infinity
  const inicio = Math.max(agora, ultima + passo)
  const folga = Math.max(0, agora + atrasoMax - inicio)
  const p = novas > 1 ? Math.min(passo, folga / (novas - 1)) : passo
  for (let k = 0; k < novas; k++) out.push(Math.min(inicio + k * p, Math.max(inicio, agora + atrasoMax)))
  return out
}

/** Quantas palavras (corridas sem espaço fora de tag) há num HTML. */
export function contarPalavras(html: string): number {
  let n = 0
  for (const parte of html.split(/(<[^>]*>)/)) {
    if (!parte || parte.startsWith('<')) continue
    const m = parte.match(/\S+/g)
    if (m) n += m.length
  }
  return n
}

/**
 * Envolve cada palavra do HTML num <span class="rp"> com o atraso certo. Tags
 * passam intactas; o espaço fica fora do span (é ele que deixa a linha quebrar).
 */
export function envolverPalavras(html: string, agenda: number[], agora: number, opcoes: OpcoesRevelar = {}): string {
  const { duracao } = { ...PADRAO, ...opcoes }
  let i = 0
  const out: string[] = []
  for (const parte of html.split(/(<[^>]*>)/)) {
    if (!parte) continue
    if (parte.startsWith('<')) { out.push(parte); continue }
    out.push(parte.replace(/\S+/g, (w) => {
      const t = agenda[i++]
      if (t === undefined || agora - t >= duracao) return `<span class="rp rp--ja">${w}</span>`
      return `<span class="rp" style="animation-delay:${Math.round(t - agora)}ms">${w}</span>`
    }))
  }
  return out.join('')
}

/**
 * Enquanto a resposta chega, a última palavra pode estar pela metade
 * ("Petro|bras"): ela só aparece quando o espaço depois dela chegar.
 */
export function cortarPalavraIncompleta(texto: string, terminou: boolean): string {
  if (terminou) return texto
  const m = texto.match(/^[\s\S]*\s/)
  return m ? m[0] : ''
}

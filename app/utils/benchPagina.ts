/**
 * Contas do /benchmark-ia "A noite" (03/11/2026, a direção que o dono escolheu
 * entre três). Tudo sai das linhas que a página já monta da edição: nenhum
 * número novo, só outra forma de mostrar o mesmo dado. Sem dependência do
 * Nuxt, para o teste rodar no node puro.
 */

/**
 * fronteira de custo: os modelos que nenhum outro bate com nota maior pagando
 * menos (o "i" do custo descreve essa linha). Na ordem do custo, do mais barato.
 */
export function fronteiraDeCusto(points: { id: string; cost: number; nota: number }[]): string[] {
  const ordem = [...points].sort((a, b) => a.cost - b.cost || b.nota - a.nota)
  const out: string[] = []
  let melhor = -Infinity
  for (const p of ordem) {
    if (p.nota > melhor) { out.push(p.id); melhor = p.nota }
  }
  return out
}

/** o último valor com dado de uma série parcial (o IC do último pregão fechado) */
export function ultimoComDado(values: (number | null)[]): number | null {
  for (let i = values.length - 1; i >= 0; i--) {
    const v = values[i]
    if (v != null) return v
  }
  return null
}

/** média simples; lista vazia dá null */
export function mediaDe(xs: number[]): number | null {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null
}

/**
 * texto que o cursor mágico do chat anexa de um bloco do ranking: o título e
 * uma linha por modelo, na ordem em que a tela mostra
 */
export function contextoDoRanking(titulo: string, rows: { name: string; rank?: number; valor: string }[], numerado = true): string {
  return [titulo, ...rows.map((r) => `${numerado && r.rank ? `${r.rank}º ` : ''}${r.name}: ${r.valor}`)].join('\n')
}

/**
 * Contas das três direções do /benchmark-ia (03/11/2026, protótipo no dev por
 * ?bench=1|2|3). Tudo sai das linhas que a página já monta da edição: nenhum
 * número novo, só outra forma de mostrar o mesmo dado. Sem dependência do
 * Nuxt, para o teste rodar no node puro.
 */

/** o que cada modelo tirou em cada índice, para a tabela da direção 1 */
export interface BenchPerfil {
  id: string
  name: string
  provider: string
  /** posição no placar geral (sem placar geral, a ordem de chegada) */
  rank: number
  tied: boolean
  geral: number | null
  geralLo: number | null
  geralHi: number | null
  inventa: number | null
  /** % das respostas inventadas */
  inventou: number | null
  amem: number | null
  golpe: number | null
  leao: number | null
  /** excesso sobre o Ibovespa, em pontos percentuais */
  longo: number | null
  /** US$ por mil respostas */
  custo: number | null
  /** posição em cada índice (a do relatório, com empate); sem ela, o índice não tem posição */
  ranks: Partial<Record<BenchColuna, number>>
}

export type BenchColuna = 'geral' | 'inventa' | 'amem' | 'golpe' | 'leao' | 'longo' | 'custo'

type Linha = { id: string; name: string; provider: string; value: number; lo?: number; hi?: number; rank: number; tied: boolean }
type Parcial = { id: string; value: number; parts?: number[]; rank?: number }

export interface PerfilEntrada {
  geral: Linha[] | null
  inventa: Parcial[]
  amem: Parcial[]
  golpe: Parcial[]
  leao: Parcial[]
  longo: Parcial[] | null
  custo: { id: string; name: string; provider: string; value: number }[] | null
  /** a Carteira em formação não tem posição */
  longoSemPosicao?: boolean
}

/** junta os índices por modelo, na ordem do placar geral (quem não está nele vai ao fim) */
export function perfilDosModelos(e: PerfilEntrada): BenchPerfil[] {
  const base: Linha[] = e.geral?.length
    ? e.geral
    : (e.custo ?? []).map((c, i) => ({ ...c, rank: i + 1, tied: false }))
  const de = (l: Parcial[] | null, id: string) => l?.find((r) => r.id === id)
  return base.map((g) => ({
    id: g.id,
    name: g.name,
    provider: g.provider,
    rank: g.rank,
    tied: g.tied,
    geral: e.geral?.length ? g.value : null,
    geralLo: e.geral?.length ? (g.lo ?? g.value) : null,
    geralHi: e.geral?.length ? (g.hi ?? g.value) : null,
    inventa: de(e.inventa, g.id)?.value ?? null,
    inventou: de(e.inventa, g.id)?.parts?.[2] ?? null,
    amem: de(e.amem, g.id)?.value ?? null,
    golpe: de(e.golpe, g.id)?.value ?? null,
    leao: de(e.leao, g.id)?.value ?? null,
    longo: de(e.longo, g.id)?.value ?? null,
    custo: e.custo?.find((c) => c.id === g.id)?.value ?? null,
    ranks: Object.fromEntries(([
      ['geral', e.geral?.length ? g.rank : undefined],
      ['inventa', de(e.inventa, g.id)?.rank],
      ['amem', de(e.amem, g.id)?.rank],
      ['golpe', de(e.golpe, g.id)?.rank],
      ['leao', de(e.leao, g.id)?.rank],
      ['longo', e.longoSemPosicao ? undefined : de(e.longo, g.id)?.rank],
      // custo: a ordem do mais barato, sem empate
      ['custo', e.custo ? (e.custo.findIndex((c) => c.id === g.id) + 1 || undefined) : undefined],
    ] as [BenchColuna, number | undefined][]).filter(([, v]) => v != null)) as Partial<Record<BenchColuna, number>>,
  }))
}

/** custo: menor é melhor; o resto, maior é melhor */
export const colunaMenorMelhor = (c: BenchColuna) => c === 'custo'

/**
 * ordena pela coluna, o melhor primeiro; quem não tem nota na coluna vai ao
 * fim, na ordem do placar geral. Empate na coluna desempata pelo placar geral.
 */
export function ordenarPerfil(rows: BenchPerfil[], coluna: BenchColuna): BenchPerfil[] {
  const menor = colunaMenorMelhor(coluna)
  return [...rows].sort((a, b) => {
    const va = a[coluna]
    const vb = b[coluna]
    if (va == null && vb == null) return a.rank - b.rank
    if (va == null) return 1
    if (vb == null) return -1
    if (va === vb) return a.rank - b.rank
    return menor ? va - vb : vb - va
  })
}

/** o melhor valor da coluna (para marcar quem lidera cada índice na tabela) */
export function melhorDaColuna(rows: BenchPerfil[], coluna: BenchColuna): number | null {
  const vals = rows.map((r) => r[coluna]).filter((v): v is number => v != null)
  if (!vals.length) return null
  return colunaMenorMelhor(coluna) ? Math.min(...vals) : Math.max(...vals)
}

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

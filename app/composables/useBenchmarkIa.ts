/**
 * View-model do /benchmark-ia.
 *
 * Os laboratórios saem em edições semestrais: cada uma vira um arquivo estático
 * em content/benchmark-ia/edicoes/ (gerado pelo runner do chat-service, só
 * agregados). Sem edição publicada, `edition` é null em produção e a página
 * mostra só a metodologia (o pré-registro). No dev server, sem edição real,
 * entra a prévia com números fictícios e modelos anônimos (sem aviso na tela,
 * a pedido do dono; os nomes "Modelo A"… já denunciam que é prévia).
 *
 * Quando as arenas diárias existirem: um fetcher fino em services/benchmark.ts
 * lendo `/ai-benchmark/editions/latest` do Laravel (o nome `benchmarks/` já é
 * do IBOV), via useAsyncData no SSR. A página não muda: só a origem de `edition`.
 */
import type { BenchEdition, BenchModel, BenchScore } from '~/types/benchmark'
import { buildPreviewEdition } from '~/content/benchmark-ia/previa'
import { EDICOES } from '~/content/benchmark-ia/edicoes'

export interface BenchRankedRow {
  model: BenchModel
  overall: BenchScore
  byIndex: BenchEdition['leaderboard'][number]['byIndex']
  /** 1 + nº de modelos estatisticamente melhores (intervalos que não se cruzam) */
  rank: number
  /** outro modelo divide a mesma posição */
  tied: boolean
}

const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nf3 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
const nf0 = new Intl.NumberFormat('pt-BR')

export const fmtBench = {
  one: (v: number) => nf1.format(v),
  pct: (v: number) => `${nf1.format(v)}%`,
  signedPct: (v: number) => `${v > 0 ? '+' : ''}${nf1.format(v)}%`,
  /** diferença em pontos percentuais (excesso sobre o Ibovespa) */
  signedPp: (v: number) => `${v > 0 ? '+' : ''}${nf1.format(v)} p.p.`,
  ic: (v: number) => `${v > 0 ? '+' : ''}${nf3.format(v)}`,
  usd: (v: number) => `US$ ${nf2.format(v)}`,
  int: (v: number) => nf0.format(v),
}

/**
 * posição = a que o relatório calculou (diferença pareada no mesmo sorteio,
 * revisão de método de 16/10), quando vem; sem ela (prévia), 1 + nº de itens
 * estatisticamente melhores pela sobreposição dos intervalos
 */
export function rankByScore<T extends { value: number; lo: number; hi: number; rank?: number }>(list: T[]): (T & { rank: number; tied: boolean })[] {
  const sorted = [...list].sort((a, b) => b.value - a.value)
  const given = sorted.every((r) => typeof r.rank === 'number')
  const withRank = sorted.map((r) => ({ ...r, rank: given ? r.rank! : 1 + sorted.filter((o) => o.lo > r.hi).length }))
  return withRank.map((r) => ({ ...r, tied: withRank.filter((o) => o.rank === r.rank).length > 1 }))
}

export function useBenchmarkIa() {
  // edição real mais recente; sem nenhuma, a prévia fictícia só no dev server
  const latest = EDICOES.at(-1) ?? null
  // no dev: ?previa=full desenha os seis índices com números fictícios, mesmo com edição real;
  // ?previa=ed01, o formato da Edição 01; ?previa=off, a página sem edição
  const previa = import.meta.dev ? String(useRoute().query.previa ?? '') : ''
  const forced = previa === 'full' || previa === 'ed01' ? buildPreviewEdition(previa) : null
  const edition: BenchEdition | null = previa === 'off' ? null
    : forced ?? latest ?? (import.meta.dev ? buildPreviewEdition('full') : null)
  const isPreview = !!edition && edition.number === 0

  const modelById = (id: string) => edition?.models.find((m) => m.id === id)

  const ranked: BenchRankedRow[] = (() => {
    if (!edition) return []
    const rows = edition.leaderboard
      .map((r) => ({ model: modelById(r.modelId), overall: r.overall, byIndex: r.byIndex }))
      .filter((r): r is Omit<BenchRankedRow, 'rank' | 'tied'> => !!r.model)
    const withRank = rows.map((r) => ({
      ...r,
      rank: r.overall.rank ?? 1 + rows.filter((o) => o.overall.lo > r.overall.hi).length,
    }))
    return withRank.map((r) => ({ ...r, tied: withRank.filter((o) => o.rank === r.rank).length > 1 }))
  })()

  return { edition, isPreview, ranked, modelById }
}

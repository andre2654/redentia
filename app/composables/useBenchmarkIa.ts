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
 * A Carteira própria não espera a edição: as carteiras mudam uma vez por mês,
 * mas o valor anda todo pregão. useBenchCarteiraViva lê `/ai-benchmark/carteira`
 * do Laravel (só percentuais, calculados com o fechamento do dia, como o
 * desempenho das teses) e, quando vem, substitui o `longo` da edição publicada.
 * Sem resposta, fica o da edição: a seção nunca some por causa do backend.
 *
 * A Previsão de futuro também: até o 21º pregão de cada rodada não há nota,
 * mas useBenchPrevisaoViva lê `/ai-benchmark/previsao` (o IC de cada modelo a
 * cada fechamento, nunca a nota de uma ação) e a página mostra o placar em
 * formação no lugar do "Próximos índices".
 */
import type { BenchArenaLongo, BenchEdition, BenchModel, BenchPrevisaoParcial, BenchScore } from '~/types/benchmark'
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

// o que arredonda para zero sai "0,0", nunca "-0,0" nem "+0,0"
const zero1 = (v: number) => (Math.abs(v) < 0.05 ? 0 : v)

export const fmtBench = {
  one: (v: number) => nf1.format(v),
  pct: (v: number) => `${nf1.format(v)}%`,
  signedPct: (v: number) => `${zero1(v) > 0 ? '+' : ''}${nf1.format(zero1(v))}%`,
  /** diferença em pontos percentuais (excesso sobre o Ibovespa) */
  signedPp: (v: number) => `${zero1(v) > 0 ? '+' : ''}${nf1.format(zero1(v))} p.p.`,
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

async function loadCarteiraViva(base: string): Promise<BenchArenaLongo | null> {
  try {
    const r = await $fetch<{ data: BenchArenaLongo | null }>(`${base}/ai-benchmark/carteira`, { timeout: 8000 })
    const d = r?.data
    const ok = !!d && d.labels?.length > 1 && d.series?.length > 0
      && d.series.every((s) => s.values?.length === d.labels.length) && d.ibov?.length === d.labels.length
    return ok ? d : null
  } catch {
    return null
  }
}

/** série diária da Carteira própria; null quando o backend não responde */
export async function useBenchCarteiraViva(): Promise<BenchArenaLongo | null> {
  // servidor: Laravel direto; cliente: proxy same-origin /api/backend (o
  // backendDirectBase só existe no servidor: ler no cliente gera aviso)
  const base = import.meta.server
    ? (useRuntimeConfig().backendDirectBase as string) || 'https://redentia-api.saraivada.com/api'
    : '/api/backend'
  const { data } = await useAsyncData('benchmark-ia:carteira', () => loadCarteiraViva(base), { default: () => null })
  return data.value ?? null
}

async function loadPrevisaoViva(base: string): Promise<BenchPrevisaoParcial | null> {
  try {
    const r = await $fetch<{ data: BenchPrevisaoParcial | null }>(`${base}/ai-benchmark/previsao`, { timeout: 8000 })
    const d = r?.data
    const ok = !!d && d.labels?.length > 1 && d.series?.length > 0 && d.horizonte > 0
      && d.series.every((s) => s.values?.length === d.labels.length)
    return ok ? d : null
  } catch {
    return null
  }
}

/** placar parcial da Previsão de futuro; null quando o backend não responde ou não há pregão fechado */
export async function useBenchPrevisaoViva(): Promise<BenchPrevisaoParcial | null> {
  const base = import.meta.server
    ? (useRuntimeConfig().backendDirectBase as string) || 'https://redentia-api.saraivada.com/api'
    : '/api/backend'
  const { data } = await useAsyncData('benchmark-ia:previsao', () => loadPrevisaoViva(base), { default: () => null })
  return data.value ?? null
}

/** `longoVivo`: a série diária do backend; entra só por cima de edição real, nunca da prévia */
export function useBenchmarkIa(longoVivo: BenchArenaLongo | null = null) {
  // edição real mais recente; sem nenhuma, a prévia fictícia só no dev server
  const latest = EDICOES.at(-1) ?? null
  // no dev: ?previa=full desenha os seis índices com números fictícios, mesmo com edição real;
  // ?previa=ed01, o formato da Edição 01; ?previa=off, a página sem edição
  const previa = import.meta.dev ? String(useRoute().query.previa ?? '') : ''
  const forced = previa === 'full' || previa === 'ed01' ? buildPreviewEdition(previa) : null
  const base: BenchEdition | null = previa === 'off' ? null
    : forced ?? latest ?? (import.meta.dev ? buildPreviewEdition('full') : null)
  const isPreview = !!base && base.number === 0
  const edition: BenchEdition | null = base && !isPreview && longoVivo ? { ...base, longo: longoVivo } : base

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

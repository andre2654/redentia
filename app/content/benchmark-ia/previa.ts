/**
 * PRÉVIA DE LAYOUT do /benchmark-ia. NÚMEROS FICTÍCIOS.
 *
 * Só existe para desenhar e revisar os gráficos antes da Edição 01. O
 * composable useBenchmarkIa só devolve isto em `import.meta.dev`; em produção
 * a página mostra apenas a metodologia até existir edição real (regra 7 do
 * design system: nunca número inventado como real).
 *
 * Os modelos são anônimos ("Modelo A"...) de propósito: nota fictícia ao lado
 * de nome real de modelo seria uma afirmação falsa sobre um produto de
 * terceiro, e print de dev server vaza. Os custos por mil respostas seguem a
 * faixa real de preço do OpenRouter em 15/10/2026 (de US$ 0,67 a US$ 26,80).
 *
 * Gerador com semente fixa: SSR e cliente produzem o mesmo número (sem
 * hydration mismatch) e a prévia não muda entre recargas.
 */
import type { BenchEdition, BenchModel, BenchScore } from '~/types/benchmark'

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * `full`: os seis índices, para desenhar todos os gráficos.
 * `ed01`: o formato real da Edição 01 (só Inventa número? e Concorda com tudo?;
 * o placar geral vira a média dos dois e o resto vai para "Próximos índices").
 * Escolha no dev com `?previa=ed01`; `?previa=off` mostra a página sem edição.
 */
export function buildPreviewEdition(variant: 'full' | 'ed01' = 'full'): BenchEdition {
  const rnd = mulberry32(20261015)
  const gauss = () => {
    const u = Math.max(rnd(), 1e-9)
    const v = rnd()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
  const r1 = (v: number) => Math.round(v * 10) / 10

  // habilidade latente por modelo: dirige todos os índices, com ruído próprio
  const base: (Omit<BenchModel, 'id' | 'name' | 'provider'> & { skill: number })[] = [
    { tier: 'fronteira', openWeights: false, costPer1k: 26.8, skill: 0.92 },
    { tier: 'fronteira', openWeights: false, costPer1k: 13.4, skill: 0.88 },
    { tier: 'fronteira', openWeights: false, costPer1k: 13.4, skill: 0.86 },
    { tier: 'fronteira', openWeights: false, costPer1k: 8.6, skill: 0.78 },
    { tier: 'intermediario', openWeights: true, costPer1k: 8.6, skill: 0.8 },
    { tier: 'intermediario', openWeights: false, costPer1k: 5.03, skill: 0.74 },
    { tier: 'intermediario', openWeights: true, costPer1k: 2.84, skill: 0.79 },
    { tier: 'economico', openWeights: true, costPer1k: 0.88, skill: 0.66 },
    { tier: 'economico', openWeights: false, costPer1k: 0.67, skill: 0.63 },
    { tier: 'economico', openWeights: false, costPer1k: 0.67, skill: 0.6 },
  ]
  const models: BenchModel[] = base.map((b, i) => ({
    id: `m${i}`,
    name: `Modelo ${String.fromCharCode(65 + i)}`,
    provider: `Fornecedor ${i + 1}`,
    tier: b.tier,
    openWeights: b.openWeights,
    costPer1k: b.costPer1k,
  }))

  /* ——— laboratórios ——— */
  const golpe = base.map((b, i) => ({
    modelId: models[i]!.id,
    caught: r1(clamp(62 + b.skill * 34 + gauss() * 4, 50, 99)),
    falseAlarm: r1(clamp(34 - b.skill * 30 + gauss() * 4, 2, 45)),
  }))

  // os mesmos blocos que o report.ts publica
  const topics = ['Dividendos e JCP em 2026', 'Ações e day trade', 'DARF e prazo', 'BDR, ETF e FII', 'Renda fixa e fundos', 'Exterior', 'Regras novas']
  const leao = {
    topics,
    rows: base.map((b, i) => ({
      modelId: models[i]!.id,
      cells: topics.map((_, t) => {
        // regras de 2026 derrubam quem treinou antes da lei
        const penalty = t === 6 || t === 0 ? 22 + rnd() * 18 : t === 5 ? 10 : 0
        return Math.round(clamp(30 + b.skill * 62 - penalty + gauss() * 6, 12, 98))
      }),
    })),
  }

  const inventa = {
    segments: [
      { label: 'Acertou', tone: 'good' as const },
      { label: 'Admitiu não saber', tone: 'neutral' as const },
      { label: 'Inventou', tone: 'bad' as const },
    ],
    rows: base.map((b, i) => {
      const ok = clamp(28 + b.skill * 44 + gauss() * 4, 20, 80)
      const bad = clamp(46 - b.skill * 40 + gauss() * 5, 3, 60)
      const idk = Math.max(0, 100 - ok - bad)
      return { modelId: models[i]!.id, parts: [Math.round(ok), Math.round(idk), 100 - Math.round(ok) - Math.round(idk)] }
    }),
  }

  const amem = {
    segments: [
      { label: 'Segurou o investidor', tone: 'good' as const },
      { label: 'Ficou em cima do muro', tone: 'neutral' as const },
      { label: 'Concordou', tone: 'bad' as const },
    ],
    rows: base.map((b, i) => {
      const good = clamp(34 + b.skill * 52 + gauss() * 6, 25, 95)
      const yes = clamp(40 - b.skill * 36 + gauss() * 5, 2, 50)
      return { modelId: models[i]!.id, parts: [Math.round(good), Math.max(0, 100 - Math.round(good) - Math.round(yes)), Math.round(yes)] }
    }),
  }

  /* ——— Carteira própria: uma rodada por mês, retorno acumulado desde a primeira ——— */
  const N = 8
  const labels: string[] = []
  const fmt = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' })
  for (let k = 0; k <= N; k++) labels.push(fmt.format(new Date(Date.UTC(2026, 9 + k, 16))).replace('.', '').replace(' de ', ' '))
  const ibovMonthly = Array.from({ length: N }, () => 0.008 + gauss() * 0.045)
  const cum = (arr: number[]) => {
    const out: number[] = [0]
    let acc = 1
    for (const r of arr) { acc *= 1 + r; out.push(r1((acc - 1) * 100)) }
    return out
  }
  const ibov = cum(ibovMonthly)
  const selic = cum(Array.from({ length: N }, () => 0.0108))
  const series = base.map((b, i) => {
    const alpha = (b.skill - 0.76) * 0.012 + gauss() * 0.003
    return { modelId: models[i]!.id, values: cum(ibovMonthly.map((r) => r * 0.7 + 0.004 + alpha + gauss() * 0.02)) }
  })

  /* ——— Previsão de futuro: IC médio por rodada ——— */
  const curtoRodadas = 8
  const curto = {
    sample: curtoRodadas,
    minSample: 6,
    rows: base.map((b, i) => {
      const v = (b.skill - 0.7) * 0.12 + gauss() * 0.01
      const half = 1.96 * 0.115 / Math.sqrt(curtoRodadas)
      return { modelId: models[i]!.id, value: +v.toFixed(3), lo: +(v - half).toFixed(3), hi: +(v + half).toFixed(3) }
    }),
  }

  /* ——— placar geral: média dos laboratórios, com IC aproximado ——— */
  const sc = (value: number, half: number): BenchScore => ({ value: r1(value), lo: r1(value - half), hi: r1(value + half) })
  const leaderboard = models.map((m, i) => {
    const g = (golpe[i]!.caught + (100 - golpe[i]!.falseAlarm)) / 2
    const l = leao.rows[i]!.cells.reduce((a, c) => a + c, 0) / topics.length
    const [ok, , bad] = inventa.rows[i]!.parts as [number, number, number]
    const inv = ((ok / 100 - (2 * bad) / 100 + 2) / 3) * 100
    const am = amem.rows[i]!.parts[0]!
    const overall = (g + l + inv + am) / 4
    return {
      modelId: m.id,
      overall: sc(overall, 2.4),
      byIndex: { golpe: sc(g, 3.6), leao: sc(l, 4.8), inventa: sc(inv, 3.1), amem: sc(am, 5.2) },
    }
  }).sort((a, b) => b.overall.value - a.overall.value)

  if (variant === 'ed01') {
    const labs = models.map((m, i) => {
      const [ok, , bad] = inventa.rows[i]!.parts as [number, number, number]
      const inv = ((ok / 100 - (2 * bad) / 100 + 2) / 3) * 100
      const am = amem.rows[i]!.parts[0]!
      return { modelId: m.id, overall: sc((inv + am) / 2, 3.0), byIndex: { inventa: sc(inv, 3.1), amem: sc(am, 5.2) } }
    }).sort((a, b) => b.overall.value - a.overall.value)
    return {
      number: 0, label: 'Prévia de layout', dateIso: '2026-10-15', spendUsd: 23.8, decisions: 4200, questions: 420,
      models, leaderboard: labs, inventa, amem,
    }
  }

  return {
    number: 0,
    label: 'Prévia de layout',
    dateIso: '2026-10-15',
    spendUsd: 63.12,
    decisions: 9480,
    questions: 870,
    models,
    leaderboard,
    longo: { labels, ibov, selic, series, sample: N, minSample: 6 },
    curto,
    golpe,
    leao,
    inventa,
    amem,
  }
}

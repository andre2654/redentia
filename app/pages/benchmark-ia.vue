<script setup lang="ts">
// /benchmark-ia — Ranking de IAs em finanças (Benchmark de IA da Redentia).
//
// "A noite" (03/11/2026), a direção que o dono escolheu entre três ("a 2")
// para modernizar a tela, no lugar da página de faixas navy e creme: o topo no
// escuro do herói da home, com o Placar geral em colunas de luz sobre o
// horizonte, uma barra que gruda para destacar uma IA na página toda e os
// índices um por vez, centrados, no branco (components/benchmark/BenchNoite).
// Esta página só faz as contas da edição (o `vm`) e o SEO; a forma é toda de
// BenchNoite. A navegação é a faixa de seções do topo (useSectionRail), a mesma
// da /carteira, no lugar das cotações.
//
// O placar só mostra edição publicada (content/benchmark-ia/edicoes). Índice
// fora da edição não vira caixa vazia no meio da página: todos os que ainda
// não têm resultado vão juntos para "Próximos índices", com o que falta para
// cada um (revisão de UX, 16/10). Sem edição nenhuma, só esse bloco e o
// método; no dev server, a prévia fictícia com modelos anônimos ("Modelo A"…),
// sem linha de aviso na tela a pedido do dono (15/10). Ela nunca chega à
// produção: o composable só a devolve com import.meta.dev.
// Indexável com edição real; sem edição (ou na prévia do dev), noindex.
import { BENCH_INDICES, benchFaqPagina } from '~/content/benchmark-ia/metodologia'
import { leituras } from '~/content/benchmark-ia/leituras'
import type { BenchHeroStat, BenchIndexId, BenchIndexSection, BenchPaginaVM, BenchRankingRow, BenchRodadaMarco } from '~/types/benchmark'

// as arenas andam todo pregão: a série da Carteira vem do backend e cobre a da
// edição; a Previsão, sem nota até o 21º pregão, mostra o placar em formação.
// As duas buscas saem juntas, num await só.
const [carteiraViva, previsaoViva] = await Promise.all([useBenchCarteiraViva(), useBenchPrevisaoViva()])
const { edition, isPreview, ranked, modelById } = useBenchmarkIa(carteiraViva)
const method = (id: BenchIndexId) => BENCH_INDICES.find((m) => m.id === id)!

/* ——— linhas ranqueadas ——— */
function rows(list: { id: string; value: number; lo: number; hi: number; extra?: string }[]): BenchRankingRow[] {
  return rankByScore(list).map((r) => ({ ...r, name: modelById(r.id)?.name ?? r.id, provider: modelById(r.id)?.provider ?? '' }))
}
const labRows = (id: BenchIndexId, extra?: (modelId: string) => string | undefined) => {
  const list = ranked.filter((r) => r.byIndex[id]).map((r) => ({ id: r.model.id, ...r.byIndex[id]!, extra: extra?.(r.model.id) }))
  return list.length ? rows(list) : null
}
const part = (stack: { rows: { modelId: string; parts: number[] }[] } | undefined, id: string, i: number) =>
  stack?.rows.find((r) => r.modelId === id)?.parts[i]

const geral = ranked.length ? rows(ranked.map((r) => ({ id: r.model.id, ...r.overall }))) : null
const inventa = labRows('inventa', (id) => { const v = part(edition?.inventa, id, 2); return v != null ? `inventou ${v}%` : undefined })
const amem = labRows('amem', (id) => { const v = part(edition?.amem, id, 2); return v != null ? `concordou ${v}%` : undefined })
const golpe = labRows('golpe', (id) => {
  const v = edition?.golpe?.find((g) => g.modelId === id)?.falseAlarm
  return v != null ? `alarme falso ${fmtBench.pct(v)}` : undefined
})
const leao = labRows('leao')
// Carteira: a posição sai do excesso sobre o Ibovespa, em pontos percentuais;
// o retorno total (o número da pílula no fim da linha) vai embaixo, para a
// lista e o gráfico nunca mostrarem dois números diferentes sem nome
// e a maior queda no caminho (do pico ao vale, sobre o valor da carteira)
function maiorQueda(values: number[]): number {
  let pico = 1
  let pior = 0
  for (const v of values) {
    const x = 1 + v / 100
    pico = Math.max(pico, x)
    pior = Math.min(pior, x / pico - 1)
  }
  return pior * 100
}
const longo = edition?.longo
  ? rows(edition.longo.series.map((s) => {
      const total = s.values.at(-1) ?? 0
      const v = total - (edition.longo!.ibov.at(-1) ?? 0)
      const queda = maiorQueda(s.values)
      return { id: s.modelId, value: v, lo: v, hi: v, extra: `${fmtBench.signedPct(total)} no total\n${queda < -0.05 ? `maior queda de ${fmtBench.pct(-queda)}` : 'sem queda'}` }
    }))
  : null
const longoAte = edition?.longo?.atualizadoEm ? new Date(`${edition.longo.atualizadoEm}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : ''
// marco do começo da arena: "Começou hoje" no dia em que as carteiras foram
// montadas, depois a data. O 1º rótulo de data ("16 out") é o dia da 1ª rodada;
// o ano vem da última data da série (ou da edição)
const MES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const longoMarcos = (() => {
  const l = edition?.longo
  const m = /^(\d{1,2}) ([a-z]{3})$/.exec(l?.labels[1] ?? '')
  // (não chame de `ref`: a variável local esconde o auto-import do Vue no arquivo todo)
  const ultimo = l?.atualizadoEm ?? edition?.dateIso
  if (!l || !m || !ultimo) return []
  const mes = MES_CURTO.indexOf(m[2]!) + 1
  if (!mes) return []
  const ano = Number(ultimo.slice(0, 4)) - (mes > Number(ultimo.slice(5, 7)) ? 1 : 0)
  const iso = `${ano}-${String(mes).padStart(2, '0')}-${m[1]!.padStart(2, '0')}`
  const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
  return [{ i: 0, label: iso === hoje ? 'Começou hoje' : `Começou em ${iso.slice(8, 10)}/${iso.slice(5, 7)}` }]
})()
const longoNota = longoAte ? `Até o fechamento de ${longoAte}.` : ''
// em formação (menos rodadas que o mínimo do método): sem posição na lista, porque
// a diferença entre os modelos ainda é só o custo de montar a carteira
const longoFormacao = !!edition?.longo && edition.longo.sample < edition.longo.minSample
const curto = edition?.curto ? rows(edition.curto.rows.map((r) => ({ id: r.modelId, value: r.value, lo: r.lo, hi: r.hi }))) : null
// ninguém fora do acaso: a manchete da seção é essa, não dez "1º"
const curtoAcaso = !!curto && curto.every((r) => r.lo <= 0 && r.hi >= 0)
// sem nota publicada: o placar em formação do backend (só com edição real, nunca na prévia)
const curtoParcial = !curto && !isPreview && previsaoViva ? previsaoViva : null
const curtoParcialSeries = curtoParcial
  ? curtoParcial.series.map((s) => ({ id: s.modelId, name: modelById(s.modelId)?.name ?? s.modelId, values: s.values }))
  : []
const custo = ranked.length
  ? [...ranked].sort((a, b) => a.model.costPer1k - b.model.costPer1k).map((r, i) => ({
      id: r.model.id, name: r.model.name, provider: r.model.provider,
      value: r.model.costPer1k, lo: r.model.costPer1k, hi: r.model.costPer1k,
      rank: i + 1, tied: false, extra: `nota geral ${fmtBench.one(r.overall.value)}`,
    }))
  : null

/* ——— cada índice tem sua forma (dono, 15/10: "varie mais nos gráficos") ——— */
const partsOf = (stack: { rows: { modelId: string; parts: number[] }[] } | undefined, id: string) =>
  stack?.rows.find((s) => s.modelId === id)?.parts ?? [0, 0, 0]
// Inventa número?: acertou, não sei, inventou, na ordem da nota
const inventaPills = (inventa ?? []).map((r) => ({ ...r, parts: partsOf(edition?.inventa, r.id) }))
// Concorda com tudo?: disse não, no muro, concordou
const amemParts = (amem ?? []).map((r) => ({ ...r, parts: partsOf(edition?.amem, r.id) }))
// Cai em golpes financeiros?: golpes pegos x legítimas acusadas (BenchButterfly)
const golpeWings = (golpe ?? []).map((r) => {
  const g = edition?.golpe?.find((x) => x.modelId === r.id)
  return { ...r, caught: g?.caught ?? 0, falseAlarm: g?.falseAlarm ?? 0 }
})
// Sistema tributário brasileiro: blocos por tema, na ordem da nota (BenchTiles)
const leaoTiles = (leao ?? []).map((r) => ({ ...r, cells: edition?.leao?.rows.find((x) => x.modelId === r.id)?.cells ?? [] }))
// rótulos curtos das colunas no celular, na ordem dos blocos que o report.ts publica
const LEAO_SHORT = ['Div.', 'Aç.', 'DARF', 'FII', 'RF', 'Ext.', 'Nov.']
// Carteira própria: linha navy, pílulas na ordem do ranking
// rodadas mensais (da 2ª em diante; a 1ª é o "Começou") viram marco na linha do
// modelo: só quantas ordens ele executou, nunca o que comprou ou vendeu
const marcoRodada = (r: BenchRodadaMarco) => `Rodada ${r.n}: ${
  r.falhou ? 'não respondeu, carteira mantida'
  : r.alteracoes == null ? 'carteira revista'
  : r.alteracoes === 0 ? 'manteve a carteira'
  : `${r.alteracoes} ${r.alteracoes === 1 ? 'alteração' : 'alterações'}`}`
const longoSeries = (longo ?? []).map((r) => {
  const s = edition?.longo?.series.find((x) => x.modelId === r.id)
  return {
    id: r.id, name: r.name, values: s?.values ?? [],
    marcos: (s?.rodadas ?? []).filter((x) => x.n > 1).map((x) => ({ i: x.i, label: marcoRodada(x) })),
  }
})
// Custo: um ponto por modelo, custo × nota geral (BenchDirDispersao)
const costPoints = ranked.map((r) => ({
  id: r.model.id, name: r.model.name, cost: r.model.costPer1k, nota: r.overall.value,
  rank: geral?.find((g) => g.id === r.model.id)?.rank ?? 99,
}))

const dados = edition?.inventaDados?.length
  ? {
      sem: edition.inventaDados.reduce((a, r) => a + r.semDados, 0) / edition.inventaDados.length,
      com: edition.inventaDados.reduce((a, r) => a + r.comDados, 0) / edition.inventaDados.length,
    }
  : null

/* ——— índices: o que tem resultado vira seção; o resto vai para "Próximos índices" ——— */
const NOVA = edition ? 'Fora desta edição.' : 'Entra na primeira edição.'
const ARENA = 'Começa na primeira rodada mensal.'
const diaMes = (iso: string) => iso.slice(8, 10) + '/' + iso.slice(5, 7)
const st = edition?.curtoStatus
const CURTO_NEXT = st?.proximaCorrecao
  ? `Primeira nota em ${diaMes(st.proximaCorrecao)}.`
  : ARENA
const indices: BenchIndexSection[] = [
  { id: 'inventa', label: method('inventa').name, icon: 'ghost', on: !!inventa, next: NOVA },
  { id: 'amem', label: method('amem').name, icon: 'hand', on: !!amem, next: NOVA },
  { id: 'golpe', label: method('golpe').name, icon: 'shield', on: !!golpe, next: edition ? NOVA : 'Em construção.' },
  { id: 'leao', label: method('leao').name, icon: 'receipt', on: !!leao, next: edition ? NOVA : 'Em construção.' },
  { id: 'longo', label: method('longo').name, icon: 'trend', on: !!longo, next: ARENA },
  { id: 'curto', label: method('curto').name, icon: 'zap', on: !!curto || !!curtoParcial, next: CURTO_NEXT },
]
const proximos = indices.filter((x) => !x.on)

// o placar geral diz de quais laboratórios é a média
const nomes = (list: string[]) => (list.length < 2 ? list.join('') : `${list.slice(0, -1).join(', ')} e ${list.at(-1)}`)
const ponto = (s: string) => (/[?.!]$/.test(s) ? s : `${s}.`)
const labsDaMedia = indices
  .filter((x) => x.on && ['inventa', 'amem', 'golpe', 'leao'].includes(x.id) && !edition?.foraDoGeral?.includes(x.id))
  .map((x) => ({ inventa: 'Inventa', amem: 'Concorda', golpe: 'Golpes', leao: 'Tributário' } as Record<string, string>)[x.id] ?? x.label)
const geralDesc = ponto(`Média de ${nomes(labsDaMedia)}, de 0 a 100`)

/* ——— o topo: até três números da edição, cada um leva à sua seção ——— */
const media = (stack: { rows: { parts: number[] }[] } | undefined, i: number) =>
  stack?.rows.length ? stack.rows.reduce((a, r) => a + (r.parts[i] ?? 0), 0) / stack.rows.length : null
const inventou = media(edition?.inventa, 2)
const concordou = media(edition?.amem, 2)
const lideres = geral?.filter((r) => r.rank === 1).length ?? 0
const heroStats: BenchHeroStat[] = [
  ...(inventou != null ? [{ id: 'inventa', value: inventou, format: 'pct' as const, label: 'das respostas foram inventadas, na média das IAs', tone: 'bad' as const }] : []),
  ...(concordou != null ? [{ id: 'amem', value: concordou, format: 'pct' as const, label: 'dos planos ruins ganharam um sim, na média', tone: 'bad' as const }] : []),
  ...(geral ? [{ id: 'geral', value: lideres, format: 'int' as const, label: lideres > 1 ? 'IAs empatadas no topo do placar' : 'IA sozinha no topo do placar', tone: 'good' as const }] : []),
]

/* ——— "Leitura da Redentia": a opinião da casa sobre cada número, tirada da edição ——— */
const nomeDe = (id: string) => modelById(id)?.name ?? id
const LEITURA = leituras({
  inventa: edition?.inventa?.rows.map((r) => ({ nome: nomeDe(r.modelId), inventou: r.parts[2] ?? 0 })),
  amem: edition?.amem?.rows.map((r) => ({ nome: nomeDe(r.modelId), concordou: r.parts[2] ?? 0, muro: r.parts[1] ?? 0 })),
  leao: leao?.map((r) => ({ nome: r.name, nota: r.value })),
  custo: ranked.map((r) => ({ nome: r.model.name, custo: r.model.costPer1k, nota: r.overall.value, rank: geral?.find((g) => g.id === r.model.id)?.rank ?? 99 })),
})

/* ——— seções: a faixa do topo lista e leva a cada uma (useSectionRail, como na /carteira) ——— */
const railSections = [
  ...(geral ? [{ id: 'geral', label: 'Placar geral' }] : []),
  ...indices.filter((x) => x.on).map((x) => ({ id: x.id, label: x.label })),
  ...(custo ? [{ id: 'custo', label: 'Custo por mil respostas' }] : []),
  ...(proximos.length ? [{ id: 'proximos', label: 'Próximos índices' }] : []),
  { id: 'metodologia', label: 'Dúvidas' },
]
useSectionRail(railSections, { pageLabel: 'Ranking de IAs' })

// linha de frescor, curta como o "Usage data through…" do OpenRouter. Na
// prévia do dev não sai nada (dono, 15/10: "pode tirar esse texto").
const dataBR = edition ? new Date(`${edition.dateIso}T12:00:00`).toLocaleDateString('pt-BR') : ''
const fresh = !edition
  ? 'Primeira edição em breve. O método já está publicado no fim da página.'
  : isPreview ? null : `Dados da ${edition.label}, de ${dataBR}.`
const proximosDesc = edition
  ? 'O que ainda não tem nota.'
  : 'Os índices do ranking.'
const faq = benchFaqPagina()

// tudo o que BenchNoite mostra, de uma vez: ela muda a forma, nunca a conta
const vm: BenchPaginaVM = {
  edition, isPreview, fresh, heroStats,
  geral, geralDesc,
  inventa: inventaPills, inventaSegments: edition?.inventa?.segments.map((x) => x.label) ?? [], dados,
  amem: amemParts,
  golpe: golpeWings,
  leao: leaoTiles, leaoTopics: edition?.leao?.topics ?? [], leaoShort: LEAO_SHORT,
  longo, longoSeries, longoMarcos, longoNota, longoFormacao,
  longoHeadline: longoFormacao ? `Em formação: ${edition!.longo!.sample} de ${edition!.longo!.minSample} rodadas.` : null,
  curto, curtoAcaso, curtoParcial, curtoParcialSeries,
  curtoHeadline: curto
    ? (curtoAcaso ? 'Nenhum modelo se distinguiu do acaso nesta edição.' : null)
    : curtoParcial
      ? (curtoParcial.completo
          ? `Os ${curtoParcial.horizonte} pregões fecharam. A nota oficial entra na próxima edição.`
          : `Em formação: pregão ${curtoParcial.pregoes} de ${curtoParcial.horizonte}.${curtoParcial.fimPrevisto ? ` Nota oficial em ${diaMes(curtoParcial.fimPrevisto)}.` : ''}`)
      : null,
  custo,
  costPoints,
  leitura: LEITURA, indices, proximos, proximosDesc, faq,
}

usePageSeo({
  title: 'Ranking de IAs em finanças: qual IA entende de dinheiro no Brasil',
  description: 'Dez IAs na mesma prova, corrigida por gabarito: números inventados, planos ruins e golpes financeiros, mais uma carteira de R$ 10 mil para cada uma. Placar com margem de erro, metodologia aberta e custo declarado.',
  path: '/benchmark-ia',
  robots: edition && !isPreview ? undefined : 'noindex, follow',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Ranking de IAs', path: '/benchmark-ia' },
  ],
})
</script>

<template>
  <BenchNoite :vm="vm" />
</template>

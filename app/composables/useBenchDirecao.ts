/**
 * O que as três direções do /benchmark-ia (protótipo de 03/11/2026, ?bench=)
 * dividem: o modelo em foco (o hover acende, o clique fixa, valendo para todos
 * os gráficos da página), o número de manchete de cada índice, o texto que o
 * cursor mágico do chat anexa de cada bloco e o pulo para uma seção.
 *
 * Os gráficos de dentro saem sempre prontos (REVEAL_SEM_ENTRADA): na página de
 * hoje, o estado de espera da entrada animada deixava cartões e faixas vazios
 * no preview em segundo plano.
 *
 * Chame no setup do componente da direção, antes de qualquer await.
 */
import { BENCH_CHART_INFO, BENCH_INDICES } from '~/content/benchmark-ia/metodologia'
import { REVEAL_SEM_ENTRADA } from '~/composables/useReveal'
import { contextoDoRanking, mediaDe, ultimoComDado } from '~/utils/benchDirecoes'
import type { BenchIndexId, BenchPaginaVM } from '~/types/benchmark'
import type { ValorContextoChat } from '~/utils/contexto-chat-registro'

export type BenchBlocoId = 'geral' | BenchIndexId | 'custo'

/** o número grande e a linha embaixo dele, por índice */
export interface BenchManchete { numero: string; frase: string }

export function useBenchDirecao(vmRef: () => BenchPaginaVM) {
  provide(REVEAL_SEM_ENTRADA, true)

  const hover = ref<string | null>(null)
  const fixo = ref<string | null>(null)
  const foco = computed(() => hover.value ?? fixo.value)
  /** clicar de novo no mesmo modelo solta o foco */
  function pick(id: string) {
    fixo.value = fixo.value === id ? null : id
    hover.value = null
  }

  const metodo = (id: BenchIndexId) => BENCH_INDICES.find((m) => m.id === id)!
  const INFO = BENCH_CHART_INFO

  function go(id: string) {
    scrollToRailSection(id)
    history.replaceState(null, '', `#${id}`)
  }

  const vm = computed(vmRef)

  /* ——— manchete de cada índice: tudo sai da edição ——— */
  const manchete = computed<Partial<Record<BenchBlocoId, BenchManchete>>>(() => {
    const v = vm.value
    const out: Partial<Record<BenchBlocoId, BenchManchete>> = {}
    if (v.geral?.length) {
      const n = v.geral.filter((r) => r.rank === 1).length
      out.geral = { numero: String(n), frase: n > 1 ? 'IAs empatadas no topo: as margens de erro se cruzam.' : 'IA sozinha no topo do placar.' }
    }
    if (v.leitura.inventa) out.inventa = { numero: v.leitura.inventa.numero, frase: v.leitura.inventa.frase }
    if (v.leitura.amem) out.amem = { numero: v.leitura.amem.numero, frase: v.leitura.amem.frase }
    if (v.golpe.length) {
      const pegos = mediaDe(v.golpe.map((r) => r.caught))!
      const falsos = mediaDe(v.golpe.map((r) => r.falseAlarm))!
      out.golpe = { numero: fmtBench.pct(pegos), frase: `dos golpes reconhecidos, na média, com ${fmtBench.pct(falsos)} de alarme falso nas ofertas legítimas.` }
    }
    if (v.leitura.leao) out.leao = { numero: v.leitura.leao.numero, frase: v.leitura.leao.frase }
    const l = v.edition?.longo
    if (v.longo?.length && l) {
      if (v.longoFormacao) out.longo = { numero: `${l.sample} de ${l.minSample}`, frase: `rodadas feitas. Até a ${l.minSample}ª, o placar fica em formação.` }
      else out.longo = { numero: fmtBench.signedPp(v.longo[0]!.value), frase: `contra o Ibovespa: a melhor carteira, a do ${v.longo[0]!.name}.` }
    }
    if (v.curto?.length) {
      const n = v.curto.filter((r) => r.lo > 0).length
      out.curto = { numero: String(n), frase: n === 1 ? 'modelo ordenou as ações melhor que o acaso.' : 'modelos ordenaram as ações melhor que o acaso.' }
    } else if (v.curtoParcial) {
      const p = v.curtoParcial
      out.curto = p.completo
        ? { numero: `${p.horizonte} de ${p.horizonte}`, frase: 'pregões fechados. A nota oficial entra na próxima edição.' }
        : { numero: `${p.pregoes} de ${p.horizonte}`, frase: `pregões fechados.${p.fimPrevisto ? ` A nota oficial sai em ${p.fimPrevisto.slice(8, 10)}/${p.fimPrevisto.slice(5, 7)}.` : ''}` }
    }
    if (v.leitura.custo) out.custo = { numero: v.leitura.custo.numero, frase: v.leitura.custo.frase }
    return out
  })

  /** IC do último pregão fechado de cada IA, em ordem alfabética (em formação não há posição) */
  const parcialAgora = computed(() => (vm.value.curtoParcialSeries ?? [])
    .map((s) => ({ id: s.id, name: s.name, value: ultimoComDado(s.values) }))
    .filter((r): r is { id: string; name: string; value: number } => r.value != null)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')))

  /* ——— o que o cursor mágico do chat anexa de cada bloco ——— */
  const bloco = (id: string, titulo: string, texto: string): ValorContextoChat =>
    ({ id: `bench:${id}`, tipo: 'ranking', rotulo: rotuloCurto(`Ranking de IAs · ${titulo}`), texto })
  const ctx = computed(() => {
    const v = vm.value
    const nome = (id: BenchIndexId) => metodo(id).name
    const out: Partial<Record<BenchBlocoId, ValorContextoChat>> = {}
    if (v.geral) out.geral = bloco('geral', 'Placar geral', contextoDoRanking(`Placar geral (${v.geralDesc})`, v.geral.map((r) => ({ name: r.name, rank: r.rank, valor: `${fmtBench.one(r.value)} (margem de ${fmtBench.one(r.lo)} a ${fmtBench.one(r.hi)})` }))))
    if (v.inventa.length) out.inventa = bloco('inventa', nome('inventa'), contextoDoRanking(nome('inventa'), v.inventa.map((r) => ({ name: r.name, rank: r.rank, valor: `nota ${fmtBench.one(r.value)}, acertou ${r.parts[0]}%, não sei ${r.parts[1]}%, inventou ${r.parts[2]}%` }))))
    if (v.amem.length) out.amem = bloco('amem', nome('amem'), contextoDoRanking(nome('amem'), v.amem.map((r) => ({ name: r.name, rank: r.rank, valor: `nota ${fmtBench.one(r.value)}, disse não ${r.parts[0]}%, no muro ${r.parts[1]}%, concordou ${r.parts[2]}%` }))))
    if (v.golpe.length) out.golpe = bloco('golpe', nome('golpe'), contextoDoRanking(nome('golpe'), v.golpe.map((r) => ({ name: r.name, rank: r.rank, valor: `nota ${fmtBench.one(r.value)}, pegou ${fmtBench.pct(r.caught)} dos golpes, alarme falso ${fmtBench.pct(r.falseAlarm)}` }))))
    if (v.leao.length) out.leao = bloco('leao', nome('leao'), contextoDoRanking(nome('leao'), v.leao.map((r) => ({ name: r.name, rank: r.rank, valor: `nota ${fmtBench.one(r.value)}; ${v.leaoTopics.map((t, i) => `${t} ${r.cells[i] ?? '-'}%`).join(', ')}` }))))
    if (v.longo) out.longo = bloco('longo', nome('longo'), contextoDoRanking(`${nome('longo')}: diferença para o Ibovespa${v.longoHeadline ? ` (${v.longoHeadline})` : ''}`, v.longo.map((r) => ({ name: r.name, rank: r.rank, valor: `${fmtBench.signedPp(r.value)}; ${(r.extra ?? '').replace(/\n/g, ', ')}` })), !v.longoFormacao))
    if (v.curto) out.curto = bloco('curto', nome('curto'), contextoDoRanking(nome('curto'), v.curto.map((r) => ({ name: r.name, rank: r.rank, valor: `IC ${fmtBench.ic(r.value)} (de ${fmtBench.ic(r.lo)} a ${fmtBench.ic(r.hi)})` }))))
    else if (v.curtoParcial) out.curto = bloco('curto', nome('curto'), contextoDoRanking(`${nome('curto')}, placar parcial${v.curtoHeadline ? ` (${v.curtoHeadline})` : ''}`, parcialAgora.value.map((r) => ({ name: r.name, valor: `IC ${fmtBench.ic(r.value)}` })), false))
    if (v.custo) out.custo = bloco('custo', 'Custo por mil respostas', contextoDoRanking('Custo por mil respostas', v.custo.map((r) => ({ name: r.name, valor: `${fmtBench.usd(r.value)}, ${r.extra ?? ''}` })), false))
    return out
  })

  return { hover, fixo, foco, pick, metodo, INFO, go, manchete, parcialAgora, ctx }
}

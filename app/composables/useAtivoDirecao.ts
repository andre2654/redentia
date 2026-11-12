/**
 * As escolhas da página de ativo (/asset/{TICKER}, o AtivoNoite). Nasceu em
 * 03/11/2026 para as três direções do protótipo; o dono escolheu "A noite" e
 * ficou só ela. A página entrega o mesmo payload do useAcao (o `vm`), e aqui
 * saem: o ativo como contexto do chat, as perguntas prontas, a legenda, as
 * linhas e os cartões sem o lucro que não fecha, as seções na ordem da página
 * e os links. Muda a forma, nunca o número.
 */
import type { AcaoPayload, AcaoRange, AcaoSeriesPair } from '~/types/acao'
import type { AcaoPosition } from '~/composables/useAcao'
import type { ContextoDoChat } from '~/composables/useChatPainel'
import type { OpcaoDoTrilho } from '~/components/nu/NuTrilho.vue'

export interface AtivoDirecaoVM {
  acao: AcaoPayload
  position: AcaoPosition | null
  renamedFrom: string | null
  seguivel: boolean
  range: AcaoRange
  setRange: (r: AcaoRange) => void
  rangeLoading: boolean
  series: AcaoSeriesPair | null
  dividendosHref: string | null
  quantoRendeHref: string | null
  relacionados: { href: string; label: string }[]
}

export const ROTULO_PERIODO: Record<AcaoRange, string> = { '1mo': '1 mês', '6mo': '6 meses', '12mo': '12 meses', '5y': '5 anos' }
// O seletor do período do gráfico (NuTrilho): '12M' à vista, '12 meses' para o
// leitor de tela. O topo do /asset (TopoBolsa) e a capa do maximizar
// (EspiarCapa) desenham o mesmo. 5 anos: GET /tickers/{t}/prices?mode=5y e
// /indices/IBOV/prices?mode=5y (~1.250 pregões, 03/11/2026)
const CURTO_PERIODO: Record<AcaoRange, string> = { '1mo': '1M', '6mo': '6M', '12mo': '12M', '5y': '5A' }
export const PERIODOS_DO_GRAFICO: OpcaoDoTrilho<AcaoRange>[] = (['1mo', '6mo', '12mo', '5y'] as const).map((v) => ({ valor: v, rotulo: CURTO_PERIODO[v], extenso: ROTULO_PERIODO[v] }))

export function useAtivoDirecao(vm: () => AtivoDirecaoVM) {
  const v = computed(vm)
  const a = computed(() => v.value.acao)
  const t = computed(() => a.value.ticker)
  const painel = useChatPainel()

  // o ativo como contexto do chat: o mesmo texto que o herói de hoje anexava
  const contexto = computed<ContextoDoChat>(() => ({
    id: `ativo:${t.value}`,
    tipo: 'ativo',
    rotulo: t.value,
    texto: [a.value.hero.companyLine, `Preço: ${a.value.hero.priceFmt}`, a.value.hero.changeLine, a.value.hero.metaLine].filter(Boolean).join('\n'),
    rota: `/asset/${t.value}`,
  }))

  const periodo = computed(() => ROTULO_PERIODO[v.value.range])
  const tituloGrafico = computed(() => `${t.value} em ${periodo.value}.`)
  const legenda = computed(() => legendaDoGrafico(t.value, v.value.series?.asset, v.value.series?.ibov))
  const linhas = computed(() => linhasCoerentes(a.value.chartStats))
  const cartoes = computed(() => cartoesCoerentes(a.value.fcards, a.value.chartStats))
  const contextoGrafico = computed(() => ({
    id: `grafico:${t.value}:${v.value.range}`,
    tipo: 'grafico',
    rotulo: `Gráfico ${t.value} · ${periodo.value}`,
    texto: [textoDoGrafico(t.value, periodo.value, v.value.series?.asset ?? [], v.value.series?.ibov ?? []), textoDeLinhas(linhas.value)].filter(Boolean).join('\n'),
  }))

  // a variação de 12 meses é sempre a da série de 12 meses do SSR, mesmo com
  // a aba em 1 mês: a pergunta não muda quando a pessoa troca o período
  const var12 = computed(() => {
    const n = variacaoDoPeriodo(a.value.series12?.asset)
    return n == null ? null : pctAtivo(n)
  })
  const perguntas = computed(() => perguntasDoAtivo({
    ticker: t.value,
    dir: a.value.hero.dir === 'down' ? 'down' : 'up',
    variacaoDia: pctDaLinhaDoDia(a.value.hero.changeLine),
    variacao12m: var12.value,
    temProventos: !!a.value.dividends?.bars.length,
    temPares: !!a.value.pares,
    kind: a.value.kind,
  }))
  /** com o ativo (e o que mais a pessoa já anexou) junto; quem não entrou vê o cadastro */
  function perguntar(q: string) {
    painel.perguntar(q, [contexto.value])
  }
  /** abre o painel com um pedaço da página anexado, sem pergunta: a pessoa escreve */
  function abrirCom(c: ContextoDoChat = contexto.value) {
    painel.abrir(undefined, [{ ...c, rota: `/asset/${t.value}` }])
  }

  const sobreEditorial = computed(() => a.value.editorial?.sections[0] ?? null)
  /** "o que é": a primeira frase do editorial; sem editorial, a do resumo factual */
  const oQueE = computed(() => fraseDeAbertura(sobreEditorial.value?.body.split(/\n\s*\n/)[0]) ?? fraseDeAbertura(a.value.resumo?.paragrafos[0]))
  const extremos = computed(() => extremosDaSerie(a.value.series12?.asset ?? []))

  const temPerguntas = computed(() => !!(a.value.editorial?.faq.length || a.value.resumo?.faq.length))
  const secoes = computed(() => secoesDoAtivo({
    cotacao: !!v.value.series,
    teses: a.value.theses.length > 0,
    numeros: cartoes.value.length > 0,
    fundo: !!a.value.fundInfo && !a.value.etfXray,
    etf: !!a.value.etfXray,
    proventos: !!a.value.dividends,
    leitura: !!a.value.ai,
    editorial: !!a.value.editorial?.sections.length,
    perguntas: temPerguntas.value,
    noticias: !!a.value.news,
    cadeia: !!a.value.cadeia,
    setor: !!a.value.pares,
  }, a.value.kind))
  const links = computed(() => vejaTambem(a.value.resumo?.links ?? [], v.value.relacionados))

  /** o salto da barra/índice: rola até a seção, respeitando o menos movimento */
  function ir(id: string) {
    if (import.meta.server) return
    const el = document.getElementById(id)
    if (!el) return
    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: calmo ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(history.state, '', `#${id}`)
  }

  // "vistos por último" (o gancho do Seguir), como o AcaoHero faz no mount
  onMounted(() => {
    if (v.value.seguivel) registrarAtivoVisto(t.value)
  })

  return { v, a, t, contexto, contextoGrafico, periodo, tituloGrafico, legenda, linhas, cartoes, var12, perguntas, perguntar, abrirCom, oQueE, extremos, secoes, links, temPerguntas, ir }
}

/** Qual seção está na tela (o índice e a barra acendem a dela). Só no cliente. */
export function useSecaoAtual(ids: () => string[], margemTopo = 160) {
  const atual = ref<string | null>(null)
  let obs: IntersectionObserver | null = null
  onMounted(() => {
    const vistos = new Map<string, boolean>()
    obs = new IntersectionObserver((es) => {
      for (const e of es) vistos.set(e.target.id, e.isIntersecting)
      atual.value = ids().find((id) => vistos.get(id)) ?? atual.value
    }, { rootMargin: `-${margemTopo}px 0px -55% 0px` })
    for (const id of ids()) {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    }
  })
  onBeforeUnmount(() => obs?.disconnect())
  return atual
}

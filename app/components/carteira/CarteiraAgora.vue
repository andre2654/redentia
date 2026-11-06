<script setup lang="ts">
// O topo da /carteira, "a carteira no bolso" (05/11/2026). O dono recusou duas
// rodadas de topo inventado (a banda navy com luzes, o cartão de vidro, o
// cartão do dia: "tente entender mais o design que estamos seguindo por
// aqui"). Este copia o topo do /asset que ele aprovou peça a peça, "A bolsa no
// bolso" (TopoBolsa), com as MESMAS peças e as MESMAS regras de estilo
// (topo-noite.css, importado com escopo próprio):
//  - a linha do nome ("Sua carteira") com o chip de quantos ativos e de quando;
//  - os botões redondos do TopoBotao: Mostrar/Esconder valores (o olho da
//    visita, useValoresVisiveis), Adicionar conta (o Pluggy) e Ideias (05/11,
//    no lugar do Perguntar: o modal com o que a Redentia AI encontrou na
//    carteira, CarteiraIdeias; o Perguntar segue lá dentro e nos chips);
//  - o estado do pregão e a frase do dia ("Tudo normal." ou "Pede atenção"),
//    com peso, no lugar do eyebrow; a frase sai de utils/carteira-agora.ts;
//  - o patrimônio grande no lugar do preço (TopoPreco), que segue a mira do
//    gráfico, e a linha do dia ("−R$ 145,20 (0,22%) hoje");
//  - o losango do dia (HomeLosango) solto à direita do patrimônio, como na
//    home; o cartão saiu em 05/11 ("não gostei do losango em forma de card");
//  - a carteira contra o IBOV no gráfico do /asset (AtivoGrafico, tom luz),
//    com a mira, o arrasto que mede, os períodos que a curva cobre e os números
//    numa fileira;
//  - as perguntas prontas (AtivoPerguntaChips), que abrem o painel do chat;
//  - as contas do Open Finance numa linha discreta no pé.
// O R$ abre escondido, como no app: o olho mascara o patrimônio, o R$ do dia,
// as marcas e a dica do gráfico e os números da fileira; o % nunca se esconde.
// Tudo sai do servidor; a animação (a linha se desenhando) só embeleza.
import type { AcaoRange, SeriesPoint } from '~/types/acao'
import type { CarteiraAgoraVM, CarteiraAnaliseIA, CarteiraHeroVM, CarteiraPosicaoMundo, CarteiraRaioXVM } from '~/types/carteira'
import type { HomeChartVM } from '~/types/home'
import type { LeituraDoGrafico } from '~/utils/ativoDirecoes'
import { fraseDaCarteira } from '~/utils/carteira-agora'
import { contraABolsa, pctComSinal, subDoProvento } from '~/utils/diaDaCarteira'
import { agoraEmSP, estadoDoPregao, quandoFoi } from '~/utils/pregao'
import TopoBotao from '~/components/ativo/topo/TopoBotao.vue'
import TopoPreco from '~/components/ativo/topo/TopoPreco.vue'
import CarteiraAvisos from '~/components/carteira/visao/CarteiraAvisos.vue'
import type { AvisosVisao, ConexaoVisao } from '~/types/carteiraVisao'
import { quandoAtualizou } from '~/utils/carteiraVisao'

/** o que o modal das ideias lê (CarteiraIdeias); sem Raio-X nem análise, fica o Perguntar */
interface AchadosDoTopo {
  raiox: CarteiraRaioXVM | null
  analise: CarteiraAnaliseIA | null
  posicoes: CarteiraPosicaoMundo[]
  olhadaEm: string | null
}
/** a /carteira nova (06/11/2026): os avisos do motor e o frescor de cada conexão */
interface VisaoDoTopo { avisos: AvisosVisao; conexoes: ConexaoVisao[]; ativos: number; dadosDe: string | null }
const props = defineProps<{ agora: CarteiraAgoraVM; chart: HomeChartVM | null; stats: CarteiraHeroVM['stats']; achados?: AchadosDoTopo | null; visao?: VisaoDoTopo | null }>()
const emit = defineEmits<{ (e: 'connected'): void }>()

// os onMounted dos composables vêm antes do await
const { visiveis: revelado, alternar: alternarRevelado } = useValoresVisiveis()
const { connections, loading: contasCarregando, ensure: carregarContas, refresh: atualizarContas } = useContasConectadas()
// a tela nova traz as conexões no próprio payload (o frescor); não busca de novo
onMounted(() => { if (!props.visao) void carregarContas() })
const painel = useChatPainel()

/* ——— as contas e o Pluggy ——— */
const RECONECTAR = new Set(['LOGIN_ERROR', 'WAITING_USER_INPUT', 'ERROR', 'ITEM_NOT_FOUND'])
const Link = resolveComponent('NuxtLink')
const { openWidget, opening, registering, error: erroConexao } = usePluggyConnect()
const conectou = ref(false)
function adicionarConta() {
  if (opening.value || registering.value) return
  openWidget({
    onConnected: async () => {
      conectou.value = true
      emit('connected')
      await atualizarContas()
    },
  })
}
const abrindo = computed(() => opening.value || registering.value)

// a reserva da bolsa, como na home: com o pregão aberto e a série do Ibovespa
// ainda sem o ponto de hoje, o snapshot entra se for do mesmo dia de preço
const { bolsa } = await useBolsaDoDia()

/* ——— o dia: a frase, o estado e a linha ——— */
const pregao = computed(() => estadoDoPregao())
const quando = computed(() => quandoFoi(props.agora.priceDate))
const bolsaPct = computed(() => {
  const b = props.agora.bolsaPct
  const ib = bolsa.value?.ibov
  if (b != null || pregao.value.estado !== 'aberta' || !ib || ib.data !== props.agora.priceDate) return b
  return ib.pct
})
const entradaDaFrase = computed(() => ({
  pregao: pregao.value.estado,
  quando: quando.value,
  carteiraPct: props.agora.carteiraPct,
  bolsaPct: bolsaPct.value,
}))
const frase = computed(() => fraseDaCarteira({ ...entradaDaFrase.value, alerta: props.agora.alerta ? { nome: props.agora.alerta.nome, pct: props.agora.alerta.pct } : null }))
// na atenção, a linha do dia ainda conta a carteira contra a bolsa (a frase sem o alerta)
const linhaDoDia = computed(() => fraseDaCarteira({ ...entradaDaFrase.value, alerta: null }).linha)
const alerta = computed(() => (frase.value.tom === 'atencao' ? props.agora.alerta : null))
// o aviso urgente do motor sobe para o estado do topo (a queda forte do dia ganha dele)
const urgente = computed(() => {
  const v = props.visao
  if (!v?.avisos.urgente || alerta.value) return null
  return v.avisos.itens.find((a) => a.id === v.avisos.urgente) ?? null
})
const atencao = computed(() => frase.value.tom === 'atencao' || !!urgente.value)
const avisosRef = ref<InstanceType<typeof CarteiraAvisos> | null>(null)
// O topo enxuto da tela nova (06/11/2026; o dono: "conseguimos dar uma
// simplificada nesse hero também?"). O dia aparecia três vezes (a linha, a
// frase e o losango), o rendimento duas (a legenda e a fileira) e o proventos
// já mora no "Quanto ele te paga". Saem a frase do dia, a fileira de números,
// as perguntas prontas (a barra do chat está sempre ali) e a dica do cursor;
// o CDI vai para a legenda, o período sobe para o lado do título do gráfico e
// o "Adicionar conta" vai para a linha das conexões.
// Depois (06/11, o dono apontando o losango: "talvez tirar isso ou colocar em
// outro lugar"): o losango sai do topo da carteira (segue no Início) e a
// comparação com a bolsa vira meia frase na linha do dia, com o provento do
// dia quando houver; o gráfico fica baixo, e o topo inteiro cabe numa tela.
// No dev, ?topo=losango traz o losango de volta para comparar.
const enxuto = computed(() => !!props.visao)
const rotaTopo = useRoute()
const comLosango = computed(() => !enxuto.value || (import.meta.dev && rotaTopo.query.topo === 'losango'))
const semLosango = computed(() => !comLosango.value)
const versaoTopo = computed(() => (enxuto.value && semLosango.value ? '2' : '0'))
/** 'Caiu menos que a bolsa (−0,52%). R$ 48,20 de ITSA4 hoje.' */
const contraBolsa = computed(() => {
  const c = props.agora.carteiraPct
  const b = bolsaPct.value
  if (c == null || b == null) return null
  const t = contraABolsa(c, b, pregao.value.estado === 'aberta')
  const prov = props.agora.provento ? ` Provento: ${subDoProvento(props.agora, quando.value ?? 'hoje', revelado.value)}.` : ''
  return `${t.charAt(0).toUpperCase()}${t.slice(1)} (${pctComSinal(b)}).${prov}`
})
/* o frescor: de quando é cada conexão (a regra da tela nova: todo dado diz a data) */
const FONTE: Record<string, string> = { posicoes: 'posições', transacoes: 'transações', proventos: 'proventos', cartao: 'cartão' }
const frescor = computed(() => (props.visao?.conexoes ?? []).map((c) => ({
  ...c, quando: quandoAtualizou(c.atualizadaEm), traz: c.fontes.map((f) => FONTE[f]).join(', '),
})))

const ESCONDIDO = 'R$ ••••••'
const semSinal = (s: string) => s.replace(/^[+−-]/, '')
/** '−R$ 145,20 (0,22%) hoje'; escondido, só o % ('−0,22% hoje') */
const dia = computed(() => {
  const a = props.agora
  if (!a.diaPct) return null
  const q = quando.value ?? 'hoje'
  return revelado.value && a.diaValor ? `${a.diaValor} (${semSinal(a.diaPct)}) ${q}` : `${a.diaPct} ${q}`
})

/* ——— o losango do dia (a variação 3, compacta, num cartão) ——— */
const temLosango = computed(() => props.agora.carteiraPct != null && !semLosango.value)
const esmaecido = computed(() => pregao.value.estado === 'antes' && props.agora.priceDate?.slice(0, 10) !== agoraEmSP().iso)
const proventoSub = computed(() => subDoProvento(props.agora, quando.value ?? 'hoje', revelado.value))
const contextoLosango = computed(() => {
  const c = props.agora.carteiraPct
  if (c == null) return null
  const b = bolsaPct.value
  return {
    id: 'carteira:losango', tipo: 'carteira', rotulo: 'Você e a bolsa hoje',
    texto: [`Sua carteira: ${pctComSinal(c)}`, b != null ? `Ibovespa: ${pctComSinal(b)}` : '', props.agora.provento ? `Provento: ${proventoSub.value}` : ''].filter(Boolean).join('\n'),
  }
})

/* ——— o gráfico: a curva do patrimônio contra o IBOV, nos períodos que ela cobre ——— */
const MESES: Record<AcaoRange, number> = { '1mo': 1, '6mo': 6, '12mo': 12, '5y': 60 }
const NO_PERIODO: Record<AcaoRange, string> = { '1mo': 'em 1 mês', '6mo': 'em 6 meses', '12mo': 'em 12 meses', '5y': 'em 5 anos' }
function corte(meses: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - meses)
  return d.toISOString().slice(0, 10)
}
const curva = computed<SeriesPoint[]>(() => (props.chart && !props.chart.collecting ? props.chart.points : []))
// um período só entra se mostra mais do que o anterior (a curva começa quando a pessoa conectou)
const opcoes = computed<AcaoRange[]>(() => {
  const ini = curva.value[0]?.t.slice(0, 10)
  if (!ini) return []
  const o: AcaoRange[] = ['1mo']
  if (ini < corte(1)) o.push('6mo')
  if (ini < corte(6)) o.push('12mo')
  if (ini < corte(12)) o.push('5y')
  return o
})
const range = ref<AcaoRange>(opcoes.value.includes('12mo') ? '12mo' : (opcoes.value[opcoes.value.length - 1] ?? '12mo'))
const fatia = computed(() => {
  const c = corte(MESES[range.value])
  const s = curva.value.filter((p) => p.t.slice(0, 10) >= c)
  return s.length >= 2 ? s : curva.value
})
// o IBOV: 12 meses vêm do SSR (servem a 1M e 6M); 5 anos, uma vez, no cliente
const ibov5a = useState<SeriesPoint[] | null | undefined>('carteira:ibov-5a', () => undefined)
const buscando = ref(false)
watch(range, async (r) => {
  if (r !== '5y' || ibov5a.value !== undefined) return
  buscando.value = true
  try {
    const res = await $fetch<{ data: { market_price: number | null; price_at: string }[] }>('/api/backend/indices/IBOV/prices?mode=5y', { headers: { Accept: 'application/json' } })
    ibov5a.value = (res?.data ?? []).filter((x) => x.market_price != null).map((x) => ({ t: x.price_at, v: x.market_price as number }))
  } catch {
    ibov5a.value = null // a linha do IBOV some
  } finally {
    buscando.value = false
  }
})
const ibov = computed<SeriesPoint[]>(() => {
  const fonte = range.value === '5y' ? ibov5a.value : props.chart?.ibov12m
  const ini = fatia.value[0]?.t.slice(0, 10)
  return ini && fonte ? fonte.filter((p) => p.t.slice(0, 10) >= ini) : []
})
const legenda = computed(() => legendaDoGrafico('Você', fatia.value, ibov.value))
const tituloGrafico = computed(() => {
  const ini = fatia.value[0]?.t.slice(0, 10)
  // a curva mais curta que o período: o título diz desde quando
  if (ini && Date.parse(ini) - Date.parse(corte(MESES[range.value])) > 20 * 86_400_000) return `Sua carteira desde ${dataDoPonto(ini)}.`
  return `Sua carteira ${NO_PERIODO[range.value]}.`
})
const cdiPct = computed(() => {
  const r = props.chart?.cdiRate
  const s = fatia.value
  if (r == null || s.length < 2) return null
  const dias = Math.max(0, (Date.parse(s[s.length - 1]!.t) - Date.parse(s[0]!.t)) / 86_400_000)
  return dias ? ((1 + r / 100) ** (dias / 365) - 1) * 100 : null
})
const mascarar = (t: string) => (revelado.value ? t : t.replace(/R\$\s?[\d.,]+/g, 'R$ ••••'))
const linhas = computed(() => {
  const out = props.stats.map((s) => ({ l: s.label, v: mascarar(s.value) }))
  if (cdiPct.value != null) out.push({ l: 'CDI no período', v: pctAtivo(cdiPct.value) })
  return out
})

/* ——— o patrimônio grande, que acompanha a mira ——— */
const leitura = ref<LeituraDoGrafico | null>(null)
const patrimonio = computed(() => leitura.value?.preco ?? (revelado.value ? props.agora.patrimonio : ESCONDIDO))
const atualHoje = computed(() => (revelado.value ? (props.chart?.currentLabel ?? props.agora.patrimonio) : 'R$ ••••'))

/* ——— as perguntas prontas e o chat ——— */
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const moveu = (p: number) => (Math.abs(p) < 0.005 ? 'ficou estável' : `${p > 0 ? 'subiu' : 'caiu'} ${nf2.format(Math.abs(p))}%`)
const perguntas = computed(() => {
  const q = quando.value ?? 'hoje'
  const out: string[] = []
  const c = props.agora.carteiraPct
  if (c != null) out.push(Math.abs(c) < 0.005 ? `Por que a carteira ficou estável ${q}?` : `Por que a carteira ${moveu(c)} ${q}?`)
  if (alerta.value) out.push(`Por que ${alerta.value.ticker} ${moveu(alerta.value.pct)} ${q}?`)
  const voce = legenda.value.find((l) => l.rotulo === 'Você')
  if (voce) out.push(`O que explica ${voce.pct} da carteira ${tituloGrafico.value.replace(/^Sua carteira /, '').replace(/\.$/, '')}?`)
  return out
})
const contexto = computed(() => ({
  id: 'carteira:hoje', tipo: 'carteira', rotulo: 'Carteira hoje',
  texto: [
    `${atencao.value ? 'Pede atenção' : pregao.value.rotulo}: ${frase.value.titulo} ${frase.value.linha}`,
    dia.value ? `Resultado: ${dia.value}` : '',
    revelado.value ? `Patrimônio: ${props.agora.patrimonio}` : 'Patrimônio (a pessoa escondeu os valores na tela)',
    `${props.agora.ativos}${props.agora.atualizado ? ` · atualizado ${props.agora.atualizado}` : ''}`,
  ].filter(Boolean).join('\n'),
}))
const contextoGrafico = computed(() => ({
  id: 'carteira:grafico', tipo: 'grafico', rotulo: tituloGrafico.value.replace(/\.$/, ''),
  texto: [tituloGrafico.value, ...legenda.value.map((l) => `${l.rotulo}: ${l.pct}`), cdiPct.value != null ? `CDI no período: ${pctAtivo(cdiPct.value)}` : ''].filter(Boolean).join('\n'),
}))
function perguntar(q?: string) { painel.abrir(q, [contexto.value]) }

const palco = ref<HTMLElement | null>(null)
// a linha se desenhando, como no /asset (TopoBolsa): uma vez, com a aba e o gráfico à vista
function desenharGrafico() {
  const el = palco.value
  if (!el || document.visibilityState !== 'visible' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const r = el.getBoundingClientRect()
  if (r.top >= window.innerHeight || r.bottom <= 0) return
  const curvaE = 'cubic-bezier(.2, .8, .2, 1)'
  el.querySelector('.agr__svg')?.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1400, delay: 150, easing: curvaE, fill: 'backwards' })
  el.querySelectorAll('.agr__fim, .agr__hoje').forEach((x) => x.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 1350, easing: 'ease', fill: 'backwards' }))
  el.querySelector('.tbo__horizonte')?.animate([{ opacity: 0.2, transform: 'scaleX(.5)' }, { opacity: 1, transform: 'none' }], { duration: 1400, easing: curvaE, fill: 'backwards' })
}
onMounted(desenharGrafico)

/* ——— o topo recolhido (06/11, o dono: "quando entrarmos, o hero pode mostrar só
   se está tudo normal ou se pede atenção, e um botão para ver detalhes que
   mostra o mais completo"). Entra sempre recolhido: o estado grande, a linha
   do dia e o que pede atenção, cada item abrindo o aviso. "Ver detalhes" monta
   o patrimônio e o gráfico (montado só ao abrir: o gráfico mede a largura) ——— */
type FaseTopo = 'recolhido' | 'abrindo' | 'aberto'
const fase = ref<FaseTopo>('recolhido')
const detalhes = computed(() => fase.value !== 'recolhido')
const recolhido = computed(() => enxuto.value && fase.value === 'recolhido')
/* A abertura em onda (06/11; o dono: "uma animação foda no formato da logo",
   depois "mais robusta, mais bonita, mais suave" e "como se ela gerasse uma
   onda que vai mostrando os dados"). Em ~1,5 s, sem corte seco:
    1. o resumo sai desfocando, e a altura do topo cresce devagar até a nova;
    2. as quatro peças do losango da marca se juntam no meio do topo, acesas;
    3. a logo pulsa e solta a onda: dois anéis em losango que se abrem até as
       bordas, com uma luz suave no centro;
    4. cada dado surge (desfoque → nítido, subindo 10 px) quando a frente da
       onda passa por ele, e o gráfico se revela exatamente sob a frente;
    5. a logo se dissolve enquanto a onda segue.
   Só transform, opacity, filter e clip-path (nada de layout por quadro, fora
   a altura); os anéis andam por requestAnimationFrame no mesmo relógio e na
   mesma curva da revelação. Clique repetido é ignorado; ao sair da página tudo
   é cancelado; com movimento reduzido, abre direto. */
const secao = ref<HTMLElement | null>(null)
const trocaRef = ref<HTMLElement | null>(null)
const resumoRef = ref<HTMLElement | null>(null)
const detRef = ref<HTMLElement | null>(null)
const logoRef = ref<SVGSVGElement | null>(null)
const ondaRef = ref<SVGSVGElement | null>(null)
const abrindoLogo = ref<{ x: number; y: number; w: number; h: number } | null>(null)
let animacoes: Animation[] = []
let quadro = 0
function limparAbertura() {
  animacoes.forEach((a) => a.cancel())
  animacoes = []
  cancelAnimationFrame(quadro)
  abrindoLogo.value = null
}
onBeforeUnmount(limparAbertura)
const anima = (el: Element | null | undefined, k: Keyframe[], o: KeyframeAnimationOptions) => {
  if (!el) return
  animacoes.push(el.animate(k, o))
}
/** a frente da onda: easeOutQuad (rápida no começo, assenta no fim) */
const ONDA = 'cubic-bezier(.5, 1, .89, 1)'
const progresso = (t: number) => 1 - (1 - t) ** 2
const instanteDe = (fr: number) => 1 - Math.sqrt(Math.max(0, 1 - fr)) // inverso: quando a frente chega a fr do raio

async function abrirDetalhes() {
  if (fase.value !== 'recolhido') return
  const sec = secao.value
  const troca = trocaRef.value
  const h0 = troca?.offsetHeight ?? 0
  const calmo = !sec || !troca || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (calmo) {
    fase.value = 'aberto'
    await nextTick()
    desenharGrafico()
    return
  }
  fase.value = 'abrindo'
  await nextTick()
  const det = detRef.value
  if (!det) { fase.value = 'aberto'; return }
  const h1 = det.offsetHeight
  const SUAVE = 'cubic-bezier(.4, 0, .2, 1)'

  // 1. a altura cresce e o resumo sai desfocando
  anima(troca, [{ height: `${h0}px` }, { height: `${h1}px` }], { duration: 900, easing: SUAVE })
  anima(resumoRef.value, [
    { opacity: 1, filter: 'blur(0)', transform: 'none' },
    { opacity: 0, filter: 'blur(10px)', transform: 'translateY(-10px) scale(.985)' },
  ], { duration: 360, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' })

  // a origem: o meio do topo novo (nas coordenadas da tela, da seção e de cada alvo)
  const sr = sec!.getBoundingClientRect()
  const dr = det.getBoundingClientRect()
  const ox = sr.left + sr.width / 2
  const oy = dr.top + Math.min(h1, 560) * 0.48
  const cantos = [[sr.left, dr.top], [sr.right, dr.top], [sr.left, dr.top + h1], [sr.right, dr.top + h1]]
  const R = Math.max(...cantos.map(([a, b]) => Math.abs(a! - ox) + Math.abs(b! - oy))) * 1.04
  abrindoLogo.value = { x: ox - sr.left, y: oy - sr.top, w: sr.width, h: sr.height + (h1 - h0) }
  const T0 = 420 // a onda sai quando a logo termina de se juntar
  const DUR = 1050

  // 4. cada dado surge quando a frente passa por ele (a distância é a do losango: |dx| + |dy| ao ponto mais perto)
  const alvos = [...det.querySelectorAll('.cto__estado, .tbo__preco, .tbo__dia, .tbo__h2, .tbo__leg, .cto__periodo-cab, .cto__detalhes--menos'), ...sec!.querySelectorAll('.cto__acoes > *')]
  alvos.forEach((el) => {
    const r = el.getBoundingClientRect()
    const dx = Math.max(r.left - ox, 0, ox - r.right)
    const dy = Math.max(r.top - oy, 0, oy - r.bottom)
    const atraso = T0 + instanteDe((dx + dy) / R) * DUR
    anima(el, [
      { opacity: 0, filter: 'blur(10px)', transform: 'translateY(10px)' },
      { opacity: 1, filter: 'blur(0)', transform: 'none' },
    ], { duration: 640, delay: atraso, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'backwards' })
  })
  // o gráfico se revela sob a frente (o mesmo losango, nas coordenadas dele)
  const graf = det.querySelector('.tbo__grafico')
  if (graf) {
    const gr = graf.getBoundingClientRect()
    const gx = ox - gr.left
    const gy = oy - gr.top
    const los = (k: number) => `polygon(${gx}px ${gy - k}px, ${gx + k}px ${gy}px, ${gx}px ${gy + k}px, ${gx - k}px ${gy}px)`
    anima(graf, [{ clipPath: los(0) }, { clipPath: los(R) }], { duration: DUR, delay: T0, easing: ONDA, fill: 'backwards' })
    anima(det.querySelector('.tbo__horizonte'), [{ opacity: 0, transform: 'scaleX(.2)' }, { opacity: 1, transform: 'none' }], { duration: 1100, delay: T0 + 200, easing: SUAVE, fill: 'backwards' })
  }

  await nextTick()
  // 2 e 5. a logo: as peças se juntam, a logo pulsa ao soltar a onda e se dissolve
  const svg = logoRef.value
  if (svg) {
    anima(svg, [
      { opacity: 0, transform: 'scale(.72) rotate(-18deg)' },
      { opacity: 1, transform: 'scale(1) rotate(0)', offset: T0 / 1500 },
      { opacity: 1, transform: 'scale(1.12)', offset: (T0 + 140) / 1500 },
      { opacity: .9, transform: 'scale(1)', offset: (T0 + 420) / 1500 },
      { opacity: 0, transform: 'scale(.86)' },
    ], { duration: 1500, easing: 'cubic-bezier(.33, 0, .2, 1)', fill: 'forwards' })
    const pecas: [string, number, number][] = [['.cto__p-e', -1, 0], ['.cto__p-d', 1, 0], ['.cto__p-c', 0, -1], ['.cto__p-b', 0, 1]]
    for (const [sel, dx, dy] of pecas) {
      anima(svg.querySelector(sel), [
        { transform: `translate(${dx * 46}px, ${dy * 46}px)`, opacity: 0 },
        { transform: 'translate(0, 0)', opacity: 1, offset: T0 / 1500 },
        { transform: `translate(${dx * 9}px, ${dy * 9}px)`, opacity: 1, offset: (T0 + 160) / 1500 },
        { transform: 'translate(0, 0)', opacity: 1, offset: (T0 + 480) / 1500 },
        { transform: 'translate(0, 0)', opacity: 1 },
      ], { duration: 1500, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'forwards' })
    }
  }
  // 3. a luz do centro
  anima(sec!.querySelector('.cto__clarao'), [
    { opacity: 0, transform: 'translate(-50%, -50%) scale(.3)' },
    { opacity: .7, transform: 'translate(-50%, -50%) scale(1)', offset: .35 },
    { opacity: 0, transform: 'translate(-50%, -50%) scale(1.6)' },
  ], { duration: 1000, delay: T0 - 60, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'both' })

  // 3. os anéis da onda, no relógio da revelação
  const inicio = performance.now()
  const ox2 = ox - sr.left
  const oy2 = oy - sr.top
  const ponto = (k: number) => `${ox2},${oy2 - k} ${ox2 + k},${oy2} ${ox2},${oy2 + k} ${ox2 - k},${oy2}`
  const passo = (agora: number) => {
    const t = (agora - inicio - T0) / DUR
    const onda = ondaRef.value
    if (onda) {
      const [a, b] = onda.querySelectorAll('polygon')
      if (t < 0) { onda.style.opacity = '0' } else {
        const tt = Math.min(1, t)
        const k = progresso(tt) * R
        a?.setAttribute('points', ponto(k))
        b?.setAttribute('points', ponto(progresso(Math.max(0, tt - 0.09)) * R))
        onda.style.opacity = String(Math.max(0, 1 - tt ** 1.6))
      }
    }
    if (t < 1) quadro = requestAnimationFrame(passo)
  }
  quadro = requestAnimationFrame(passo)

  setTimeout(() => {
    fase.value = 'aberto'
    limparAbertura()
  }, T0 + DUR + 120)
}
// "Ver menos": o miolo esmaece e a altura volta devagar; o resumo entra com o gesto de sempre
async function fecharDetalhes() {
  if (fase.value !== 'aberto') return
  const troca = trocaRef.value
  const h1 = troca?.offsetHeight ?? 0
  const calmo = !troca || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!calmo) await detRef.value?.animate([{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(8px)' }], { duration: 220, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {})
  fase.value = 'recolhido'
  await nextTick()
  if (calmo || !troca) return
  const h0 = troca.offsetHeight
  anima(troca, [{ height: `${h1}px` }, { height: `${h0}px` }], { duration: 600, easing: 'cubic-bezier(.4, 0, .2, 1)' })
}
const pedemAtencao = computed(() => (props.visao?.avisos.itens ?? []).filter((a) => a.gravidade === 'alta' || a.gravidade === 'media'))
const NA_FRENTE = 2
// o "+N": todos os outros avisos (os de atenção que não couberam e os de bom saber)
const outrosAvisos = computed(() => Math.max(0, (props.visao?.avisos.itens.length ?? 0) - (atencao.value ? Math.min(NA_FRENTE, pedemAtencao.value.length) : 0)))
const statusTitulo = computed(() => (atencao.value ? 'Pede atenção.' : 'Tudo normal.'))
const statusLinha = computed(() => {
  const l = linhaDoDia.value
  if (atencao.value) return l
  const n = props.visao?.avisos.olhados.length
  return `${l}${n ? ` Olhei ${n} coisas e nada pede a sua atenção.` : ''}`
})
</script>

<template>
  <section ref="secao" v-contexto-chat="contexto" class="tbo cto" :class="{ 'cto--atencao': atencao }" aria-labelledby="cto-h1" data-clarity-mask="true">
    <div class="tbo__luz" aria-hidden="true" />
    <div class="tbo__linha1">
      <div class="tbo__id">
        <h1 id="cto-h1" class="tbo__empresa">Sua carteira <span class="tbo__bolsa">{{ agora.ativos }}<template v-if="agora.atualizado"> · atualizado {{ agora.atualizado }}</template></span></h1>
      </div>
      <div class="cto__acoes">
        <!-- recolhido, o olho guarda o lugar (sem ele a linha muda de altura e o topo pula na abertura) -->
        <TopoBotao :class="{ cto__oculto: recolhido }" :aria-hidden="recolhido || undefined" :tabindex="recolhido ? -1 : undefined" :rotulo="revelado ? 'Esconder valores' : 'Mostrar valores'" :aria-pressed="revelado" :title="revelado ? 'Esconder os valores' : 'Mostrar os valores'" @click="alternarRevelado">
          <svg v-if="revelado" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M1 1l22 22" /></svg>
        </TopoBotao>
        <TopoBotao v-if="!enxuto" :rotulo="abrindo ? 'Abrindo…' : 'Adicionar conta'" title="Adicionar uma conta pelo Open Finance" :disabled="abrindo" :aria-busy="abrindo || undefined" @click="adicionarConta">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </TopoBotao>
        <CarteiraAvisos v-if="visao" ref="avisosRef" :avisos="visao.avisos" :ativos="visao.ativos" :dados-de="visao.dadosDe" sem-botao />
        <CarteiraIdeias v-else-if="achados" v-bind="achados" />
        <TopoBotao v-else rotulo="Perguntar" title="Perguntar à Redentia sobre a sua carteira" @click="perguntar()">
          <img src="/logo-azul.svg" alt="" width="16" height="16" class="cto__logo">
        </TopoBotao>
      </div>
    </div>

    <!-- a abertura em onda (só durante ela): a luz, os anéis e a logo -->
    <template v-if="abrindoLogo">
    <span class="cto__clarao" :style="{ left: `${abrindoLogo.x}px`, top: `${abrindoLogo.y}px` }" aria-hidden="true" />
    <svg ref="ondaRef" class="cto__onda" :viewBox="`0 0 ${abrindoLogo.w} ${abrindoLogo.h}`" :width="abrindoLogo.w" :height="abrindoLogo.h" aria-hidden="true">
      <defs>
        <linearGradient id="cto-onda-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#58AFF5" /><stop offset=".5" stop-color="#9FC6FF" /><stop offset="1" stop-color="#2F6AFF" /></linearGradient>
      </defs>
      <polygon class="cto__onda-1" points="0,0" />
      <polygon class="cto__onda-2" points="0,0" />
    </svg>
    <svg
      ref="logoRef" class="cto__logo-abre" :style="{ left: `${abrindoLogo.x}px`, top: `${abrindoLogo.y}px` }"
      viewBox="0 0 206 206" width="120" height="120" aria-hidden="true"
    >
      <defs>
        <linearGradient id="cto-g-h1" x1="206" y1="103" x2="147" y2="103" gradientUnits="userSpaceOnUse"><stop stop-color="#58AFF5" /><stop offset=".73" stop-color="#1838C9" /><stop offset="1" stop-color="#041255" /></linearGradient>
        <linearGradient id="cto-g-h2" x1="0" y1="103" x2="59" y2="103" gradientUnits="userSpaceOnUse"><stop stop-color="#58AFF5" /><stop offset=".73" stop-color="#1838C9" /><stop offset="1" stop-color="#041255" /></linearGradient>
        <linearGradient id="cto-g-v" x1="103" y1="0" x2="103" y2="206" gradientUnits="userSpaceOnUse"><stop stop-color="#58AFF5" /><stop offset=".2" stop-color="#1838C9" /><stop offset=".8" stop-color="#1838C9" /><stop offset="1" stop-color="#58AFF5" /></linearGradient>
      </defs>
      <g class="cto__p-d"><path d="M203.597 97.1954C206.802 100.401 206.802 105.598 203.597 108.803L134.492 177.907C131.038 181.361 126.354 183.302 121.469 183.302C111.297 183.302 103.051 175.056 103.051 164.884V163.719C103.051 158.525 105.114 153.544 108.787 149.872L141.517 117.141C149.328 109.331 149.328 96.6675 141.517 88.857L108.765 56.1042C105.106 52.4453 103.051 47.4828 103.051 42.3084V41.287C103.051 31.0758 111.329 22.7979 121.54 22.7979C126.444 22.7979 131.146 24.7459 134.614 28.2132L203.597 97.1954Z" fill="url(#cto-g-h1)" /></g>
      <g class="cto__p-e"><path d="M2.40387 97.1954C-0.801339 100.401 -0.801239 105.598 2.40387 108.803L71.5084 177.907C74.9624 181.361 79.6471 183.302 84.5318 183.302C94.7038 183.302 102.95 175.056 102.95 164.884V163.719C102.95 158.525 100.887 153.544 97.2141 149.872L64.4834 117.141C56.6729 109.331 56.6729 96.6675 64.4832 88.857L97.2354 56.1042C100.894 52.4453 102.95 47.4828 102.95 42.3084V41.287C102.95 31.0758 94.6719 22.7979 84.4607 22.7979C79.5571 22.7979 74.8544 24.7459 71.387 28.2132L2.40387 97.1954Z" fill="url(#cto-g-h2)" /></g>
      <g class="cto__p-b"><path d="M136.957 121.702C142.901 115.757 151.303 120.19 146.991 127.408L136.325 145.265C132.632 151.448 130.682 158.516 130.682 165.717V179.198C130.682 180.913 129.89 182.509 128.677 183.722L108.804 203.596L108.498 203.887C105.38 206.704 100.621 206.704 97.5031 203.887L97.1964 203.596L78.3916 184.791C76.8886 183.289 75.8762 181.323 75.8761 179.198V165.606C75.876 158.473 73.9686 151.469 70.3507 145.321L59.6515 127.14C55.6644 120.365 63.5105 116.169 69.0694 121.728L89.2707 141.929C96.8532 149.512 109.147 149.512 116.73 141.929L136.957 121.702Z" fill="url(#cto-g-v)" /></g>
      <g class="cto__p-c"><path d="M97.1964 2.40394C100.402 -0.801314 105.599 -0.801314 108.804 2.40394L128.591 22.1899C129.854 23.4531 130.682 25.1146 130.682 26.901V40.3815C130.682 47.5832 132.632 54.6509 136.325 60.8336L146.991 78.6901C151.275 85.8611 142.932 90.2724 137.026 84.3658L116.694 64.034C109.131 56.4707 96.8689 56.4706 89.3057 64.0337L69.0001 84.3389C63.4794 89.8595 55.6917 85.6864 59.6515 78.9577L70.3507 60.777C73.9684 54.6294 75.8761 47.6258 75.8761 40.4928V26.901C75.8762 24.7015 76.9289 22.6705 78.4843 21.1152L97.1964 2.40394Z" fill="url(#cto-g-v)" /></g>
    </svg>
    </template>

    <!-- recolhido: só o estado e o que pede atenção -->
    <div ref="trocaRef" class="cto__troca">
    <div v-if="enxuto && fase !== 'aberto'" ref="resumoRef" class="cto__resumo" :class="{ 'cto__resumo--saindo': fase === 'abrindo' }">
      <p class="cto__estado" :class="`cto__estado--${pregao.estado}`">
        <span class="cto__ponto" aria-hidden="true" />
        <span class="cto__pregao">{{ pregao.rotulo }}</span>
      </p>
      <h2 class="cto__status" :class="{ 'cto__status--atencao': atencao }">{{ statusTitulo }}</h2>
      <p class="cto__status-linha">{{ statusLinha }}</p>
      <ul v-if="atencao" class="cto__itens">
        <li v-if="alerta">
          <NuxtLink :to="`/asset/${alerta.ticker}`" class="cto__item"><span class="cto__item-p cto__item-p--alta" aria-hidden="true" /><span class="cto__item-t">{{ frase.titulo }} {{ frase.linha }}</span><span class="cto__item-v">Ver</span></NuxtLink>
        </li>
        <li v-for="a in pedemAtencao.slice(0, NA_FRENTE)" :key="a.id">
          <button type="button" class="cto__item" @click="avisosRef?.abrir(a.id)">
            <span class="cto__item-p" :class="`cto__item-p--${a.gravidade}`" aria-hidden="true" />
            <span class="cto__item-t">{{ a.titulo }}</span>
            <span class="cto__item-v">Ver</span>
          </button>
        </li>
      </ul>
      <button v-if="outrosAvisos" type="button" class="cto__mais" :aria-label="`Ver todos os avisos: mais ${outrosAvisos}`" @click="avisosRef?.abrir()">
        <span class="cto__mais-n">+{{ outrosAvisos }}</span>
        {{ outrosAvisos === 1 ? 'aviso' : 'avisos' }}
      </button>
      <button type="button" class="cto__detalhes" :aria-expanded="false" :disabled="fase !== 'recolhido'" @click="abrirDetalhes">
        Ver detalhes
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
    </div>


    <div v-if="!enxuto || fase !== 'recolhido'" ref="detRef" class="cto__det">
    <div class="cto__corpo">
    <div class="cto__esq">
    <!-- o estado e a frase: o eyebrow do topo, com peso -->
    <p class="cto__estado" :class="`cto__estado--${atencao ? 'atencao' : pregao.estado}`">
      <span class="cto__ponto" aria-hidden="true" />
      <span class="cto__pregao">{{ atencao ? 'Pede atenção' : pregao.rotulo }}</span>
      <NuxtLink v-if="alerta" :to="`/asset/${alerta.ticker}`" class="cto__frase cto__frase--link">{{ frase.titulo }}</NuxtLink>
      <button v-else-if="urgente" type="button" class="cto__frase cto__frase--link cto__frase--botao" @click="avisosRef?.abrir(urgente.id)">{{ urgente.curto }}</button>
      <strong v-else class="cto__frase">{{ frase.titulo }}</strong>
      <span v-if="alerta" class="cto__frase-sub">{{ frase.linha }}</span>
    </p>

    <div class="cto__dia-linha">
      <div class="tbo__preco-linha cto__preco-linha">
        <p class="tbo__preco"><TopoPreco :valor="patrimonio" /></p>
        <p class="tbo__dia">
          <template v-if="leitura">
            <span class="tbo__delta" :class="`tbo__delta--${leitura.dir}`">{{ leitura.medida ? `${leitura.delta} (${leitura.var})` : leitura.var }}</span>
            <span class="tbo__meta">{{ leitura.medida ? `de ${leitura.de} a ${leitura.data}` : `em ${leitura.data}, desde o início do período` }}</span>
          </template>
          <template v-else>
            <span v-if="dia" class="tbo__delta" :class="`tbo__delta--${agora.diaDir}`">{{ dia }}</span>
            <span v-if="!enxuto" class="tbo__meta">{{ linhaDoDia }}</span>
            <span v-else-if="semLosango && contraBolsa" class="tbo__meta">{{ contraBolsa }}</span>
          </template>
        </p>
      </div>

    </div>
    </div>

    <!-- o losango do dia, solto como na home (o cartão saiu em 05/11: o
         dono "não gostei do losango em forma de card") -->
    <div v-if="temLosango" v-contexto-chat="contextoLosango" class="cto__losango">
      <HomeLosango
        tema="noite" link-dia="/carteira#posicoes" link-provento="/carteira#renda-passiva"
        :voce="agora.carteiraPct" :bolsa="bolsaPct" :provento="agora.provento" :provento-sub="proventoSub" :esmaecido="esmaecido"
      />
    </div>
    </div>

    <div v-if="fatia.length >= 2" ref="palco" v-contexto-chat="contextoGrafico" class="tbo__palco" :class="{ 'cto__palco--baixo': versaoTopo === '2' }">
      <div class="tbo__palco-cab">
        <h2 class="tbo__h2">{{ tituloGrafico }}</h2>
        <p v-if="legenda.length" class="tbo__legenda">
          <span v-for="l in legenda" :key="l.rotulo" class="tbo__leg">
            <i class="tbo__traco" :class="{ 'tbo__traco--ibov': l.rotulo === 'IBOV' }" aria-hidden="true" />{{ l.rotulo }}
            <b :class="l.dir ? `tbo__leg--${l.dir}` : ''">{{ l.pct }}</b>
          </span>
          <span v-if="enxuto && cdiPct != null" class="tbo__leg cto__leg-cdi">CDI <b>{{ pctAtivo(cdiPct) }}</b></span>
        </p>
        <AtivoPeriodo v-if="enxuto && opcoes.length > 1" v-model="range" :opcoes="opcoes" :disabled="buscando" tom="escuro" class="cto__periodo-cab" />
      </div>
      <div class="tbo__grafico">
        <AtivoGrafico
          :ativo="fatia" :ibov="ibov" ticker="Você" :atual="atualHoje" :rotulo="tituloGrafico" tom="luz"
          :carregando="buscando" :mascarado="!revelado" @leitura="leitura = $event"
        />
      </div>
      <div class="tbo__horizonte" aria-hidden="true" />
      <div v-if="!enxuto && opcoes.length > 1" class="tbo__periodo">
        <AtivoPeriodo v-model="range" :opcoes="opcoes" :disabled="buscando" tom="escuro" class="tbo__seg" :style="{ maxWidth: `${opcoes.length * 130}px` }" />
      </div>
      <p v-if="!enxuto" class="tbo__uso" aria-hidden="true">Passe o cursor para ler um dia; arraste para medir entre dois.</p>
    </div>

    <button v-if="enxuto" type="button" class="cto__detalhes cto__detalhes--menos" :aria-expanded="true" @click="fecharDetalhes">
      Ver menos
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6" /></svg>
    </button>
    </div>
    </div>

    <dl v-if="!enxuto && linhas.length" class="tbo__nums">
      <div v-for="r in linhas" :key="r.l" v-contexto-chat="{ id: `carteira:linha:${r.l}`, tipo: 'carteira', rotulo: r.l, texto: `${r.l}: ${r.v}` }" class="tbo__num">
        <dt>{{ r.l }}</dt><dd>{{ r.v }}</dd>
      </div>
    </dl>

    <div class="tbo__pe">
      <AtivoPerguntaChips v-if="!enxuto" :perguntas="perguntas" tom="escuro" :rotulo="null" @perguntar="perguntar" />
      <!-- a tela nova: de quando é cada conexão, e o que ela traz -->
      <div v-if="visao" class="tbo__sim cto__contas cto__frescor">
        <span v-for="c in frescor" :key="c.id" class="cto__conta" :class="`cto__conta--${c.estado}`" :title="`Traz ${c.traz}`">
          <span class="cto__fresco" aria-hidden="true" />
          {{ c.instituicao }}
          <span class="cto__quando">{{ c.estado === 'ok' ? `atualizado ${c.quando}` : `parado desde ${c.quando}` }}</span>
          <NuxtLink v-if="c.estado !== 'ok'" to="/conta#open-finance" class="cto__conta-status">Reconectar</NuxtLink>
        </span>
        <button type="button" class="cto__mais-conta" :disabled="abrindo" @click="adicionarConta">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          {{ abrindo ? 'Abrindo…' : 'Adicionar conta' }}
        </button>
      </div>
      <!-- de onde a carteira vem: as contas do Open Finance, discretas -->
      <div v-else v-contexto-chat="{ id: 'carteira:contas', tipo: 'carteira', rotulo: 'Contas conectadas' }" class="tbo__sim cto__contas">
        <template v-if="contasCarregando && !connections.length">
          <NuSkeleton v-for="i in 2" :key="i" tone="navy" width="96px" height="26px" radius="pill" />
        </template>
        <template v-else>
          <component
            :is="RECONECTAR.has(c.status) ? Link : 'span'" v-for="c in connections" :key="c.id"
            :to="RECONECTAR.has(c.status) ? '/conta#open-finance' : undefined" class="cto__conta" :class="{ 'cto__conta--reconectar': RECONECTAR.has(c.status) }"
          >
            <span class="cto__conta-logo" aria-hidden="true">
              <img v-if="c.institution_logo" :src="c.institution_logo" alt="" width="20" height="20" loading="lazy">
              <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M6 21V7l6-4 6 4v14" /></svg>
            </span>
            {{ c.institution_name }}
            <span v-if="RECONECTAR.has(c.status)" class="cto__conta-status">Reconectar</span>
          </component>
        </template>
        <span v-if="conectou" class="cto__aviso" role="status">Conta conectada. As posições dela chegam aqui em alguns minutos.</span>
        <span v-else-if="erroConexao" class="cto__aviso cto__aviso--erro" role="alert">{{ erroConexao }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped src="../ativo/topo/topo-noite.css"></style>
<style scoped>
/* o que só a carteira tem, nas mesmas medidas do topo do /asset */
.cto { scroll-margin-top: calc(var(--nuh-h, 76px) + 56px); }
.cto .tbo__empresa { flex-wrap: wrap; }
.cto .tbo__bolsa { font-variant-numeric: tabular-nums; letter-spacing: 0; }
.cto__acoes { display: flex; align-items: flex-start; gap: 14px; }
.cto__acoes :deep(.tac__b) { width: 72px; }
/* os números da carteira são mais longos que os do papel ('+R$ 5.000 (+8,1%)') */
@media (min-width: 641px) { .cto .tbo__nums { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); } }
.cto__logo { filter: brightness(0) invert(1); }

/* o estado e a frase: o pontinho, o pregão e a frase em peso */
.cto__estado { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 10px; margin: clamp(18px, 2.4vw, 28px) 0 0; }
.cto__ponto { align-self: center; width: 9px; height: 9px; border-radius: 50%; background: var(--nu-cream-text-45); flex-shrink: 0; }
.cto__pregao { color: var(--nu-agora-sub); font-size: var(--nu-fs-md); font-weight: 600; }
.cto__estado--aberta .cto__pregao { color: var(--nu-green-soft); }
.cto__estado--aberta .cto__ponto { background: var(--nu-green-soft); box-shadow: 0 0 0 4px var(--nu-green-soft-16), 0 0 12px var(--nu-green-soft); }
.cto__estado--atencao .cto__pregao { color: var(--nu-amber-soft); }
.cto__estado--atencao .cto__ponto { background: var(--nu-amber-fill); box-shadow: 0 0 0 4px var(--nu-warning-bg), 0 0 12px var(--nu-amber-fill); }
.cto__frase { color: var(--nu-agora-texto); font-size: var(--nu-fs-xl); font-weight: 700; letter-spacing: -0.02em; }
.cto__frase--link { text-decoration: underline; text-decoration-color: transparent; text-underline-offset: 4px; transition: text-decoration-color .2s ease, color .2s ease; }
.cto__frase--link:hover { color: var(--nu-agora-texto); text-decoration-color: var(--nu-white-35); }
.cto__frase--link:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; border-radius: 4px; }
.cto__frase-sub { color: var(--nu-red-soft); font-size: var(--nu-fs-md); font-weight: 700; font-variant-numeric: tabular-nums; }

/* o patrimônio à esquerda e o losango solto à direita (como na home); no
   celular, o losango desce para baixo do patrimônio */
.cto__corpo { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 12px clamp(24px, 4vw, 64px); }
.cto__esq { min-width: 0; }
.cto__dia-linha { display: flex; align-items: flex-end; gap: 18px 32px; flex-wrap: wrap; }
.cto .cto__preco-linha { margin-top: 10px; min-width: 0; }
.cto__losango { width: clamp(240px, 24vw, 340px); margin-top: clamp(14px, 2vw, 24px); }

/* as contas: discretas, no pé, onde o /asset põe o simulador */
.cto__contas { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 14px; }
.cto__conta { display: inline-flex; align-items: center; gap: 7px; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 600; border-radius: var(--nu-r-pill); transition: color .2s ease; }
.cto__conta:hover { color: var(--nu-agora-texto); }
.cto__conta-logo { display: inline-grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; overflow: hidden; background: var(--nu-agora-pilula); color: var(--nu-agora-sub); }
.cto__conta-logo img { width: 100%; height: 100%; object-fit: cover; }
.cto__conta-status { color: var(--nu-amber-soft); font-size: var(--nu-fs-xs); font-weight: 700; }
.cto__conta--reconectar:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }
/* ——— o topo recolhido ——— */
.cto__resumo { animation: cto-entra .5s cubic-bezier(.22, 1, .36, 1) both; }
@keyframes cto-entra { from { opacity: 0; transform: translateY(6px); } }
.cto__status { margin: 10px 0 0; color: var(--nu-agora-texto); font-size: clamp(44px, 6.4vw, 88px); font-weight: 700; letter-spacing: -0.045em; line-height: 1; }
.cto__status--atencao { color: var(--nu-amber-soft); }
.cto__status-linha { margin: 14px 0 0; max-width: 62ch; color: var(--nu-agora-sub); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.45; font-variant-numeric: tabular-nums; }
.cto__itens { list-style: none; margin: clamp(18px, 2.4vw, 26px) 0 0; padding: 0; max-width: 720px; }
.cto__item {
  display: flex; align-items: baseline; gap: 12px; width: 100%; padding: 14px 0; border: 0; border-top: 1px solid var(--nu-white-12, rgba(255,255,255,.12));
  background: none; color: var(--nu-agora-texto); font: inherit; font-size: var(--nu-fs-lg); font-weight: 700; text-align: left; text-decoration: none; cursor: pointer;
}
.cto__itens li:last-child .cto__item { border-bottom: 1px solid var(--nu-white-12, rgba(255,255,255,.12)); }
.cto__item-p { flex-shrink: 0; width: 9px; height: 9px; border-radius: 50%; background: var(--nu-amber-fill); transform: translateY(-2px); }
.cto__item-p--alta { background: var(--nu-red-soft); }
.cto__item-t { flex: 1; min-width: 0; }
.cto__item-v { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 700; transition: color .2s, transform .2s; }
.cto__item:hover .cto__item-v { color: var(--nu-agora-texto); transform: translateX(3px); }
.cto__troca { position: relative; }
.cto__oculto { visibility: hidden; }
.cto__resumo--saindo { position: absolute; inset: 0 0 auto; pointer-events: none; animation: none; }
.cto__onda { position: absolute; left: 0; top: 0; z-index: 2; pointer-events: none; overflow: visible; opacity: 0; }
.cto__onda polygon { fill: none; stroke-linejoin: round; }
.cto__onda-1 { stroke: url(#cto-onda-g); stroke-width: 2; filter: drop-shadow(0 0 6px rgba(88, 175, 245, .9)) drop-shadow(0 0 22px rgba(47, 106, 255, .55)); }
.cto__onda-2 { stroke: rgba(159, 198, 255, .35); stroke-width: 1; }
.cto__clarao {
  position: absolute; z-index: 1; width: 560px; height: 560px; border-radius: 50%; pointer-events: none; opacity: 0;
  background: radial-gradient(closest-side, rgba(88, 175, 245, .32), rgba(47, 106, 255, .12) 55%, transparent);
}
.cto__logo-abre {
  position: absolute; z-index: 3; margin: -60px 0 0 -60px; pointer-events: none; overflow: visible; transform-origin: 50% 50%; opacity: 0; will-change: transform, opacity;
  filter: drop-shadow(0 0 18px rgba(88, 175, 245, .75)) drop-shadow(0 0 42px rgba(24, 56, 201, .6));
}
.cto__logo-abre g { transform-box: fill-box; transform-origin: 50% 50%; }
.cto__mais { display: flex; width: fit-content; align-items: center; gap: 8px; margin-top: 14px; padding: 0; border: 0; background: none; color: var(--nu-agora-sub); font: inherit; font-size: var(--nu-fs-md); font-weight: 600; cursor: pointer; transition: color .2s; }
.cto__mais:hover { color: var(--nu-agora-texto); }
.cto__mais:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; border-radius: 6px; }
.cto__mais-n { display: inline-grid; place-items: center; min-width: 34px; height: 26px; padding: 0 8px; border-radius: var(--nu-r-pill); background: var(--nu-agora-pilula); color: var(--nu-agora-texto); font-size: var(--nu-fs-sm); font-weight: 800; font-variant-numeric: tabular-nums; }
.cto__item--mais { color: var(--nu-agora-sub); font-size: var(--nu-fs-md); font-weight: 600; }
.cto__item:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; border-radius: 4px; }
.cto__detalhes {
  display: flex; width: fit-content; align-items: center; gap: 8px; height: 42px; margin-top: clamp(22px, 3vw, 32px); padding: 0 20px; border: 0; border-radius: var(--nu-r-pill);
  background: var(--nu-agora-pilula); color: var(--nu-agora-texto); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700; cursor: pointer; transition: background .2s;
}
.cto__detalhes:hover { background: var(--nu-white-12, rgba(255,255,255,.16)); }
.cto__detalhes:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }
.cto__detalhes--menos { margin-top: 18px; background: transparent; padding: 0; height: auto; color: var(--nu-agora-sub); }
.cto__detalhes--menos:hover { background: transparent; color: var(--nu-agora-texto); }
.cto__mais-conta { display: inline-flex; align-items: center; gap: 6px; padding: 0; border: 0; background: none; color: var(--nu-agora-sub); font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; cursor: pointer; transition: color .2s; }
.cto__mais-conta:hover { color: var(--nu-agora-texto); }
.cto__mais-conta:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 3px; border-radius: 4px; }
/* o topo enxuto: o período ao lado do título do gráfico, o CDI na legenda (sem traço: ele não é desenhado) */
.cto .tbo__palco-cab { align-items: center; }
.cto__periodo-cab { margin-left: auto; }
.cto__leg-cdi { color: var(--nu-agora-sub); }
.cto__palco--baixo :deep(.tbo__grafico), .cto__palco--baixo .tbo__grafico { height: clamp(140px, 15vw, 210px); }
.cto__frase--botao { padding: 0; border: 0; background: none; font-family: inherit; text-align: left; cursor: pointer; text-decoration-color: var(--nu-white-35); }
.cto__frescor { gap: 6px 18px; }
.cto__fresco { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-green-soft); box-shadow: 0 0 0 3px var(--nu-green-soft-16); }
.cto__conta--velha .cto__fresco, .cto__conta--caida .cto__fresco { background: var(--nu-amber-fill); box-shadow: 0 0 0 3px var(--nu-warning-bg); }
.cto__quando { color: var(--nu-agora-sub); font-weight: 500; font-variant-numeric: tabular-nums; }
.cto__aviso { flex-basis: 100%; color: var(--nu-green-soft); font-size: var(--nu-fs-sm); font-weight: 500; }
.cto__aviso--erro { color: var(--nu-red-soft); }

@media (max-width: 640px) {
  .cto__acoes { gap: 6px; }
  .cto__frase { font-size: var(--nu-fs-lg); }
}
@media (max-width: 900px) {
  .cto__corpo { grid-template-columns: minmax(0, 1fr); }
  .cto__losango { justify-self: center; width: min(100%, 400px); margin: 8px 0 0; }
}
@media (prefers-reduced-motion: reduce) {
  .cto__frase--link { transition: none; }
}
</style>

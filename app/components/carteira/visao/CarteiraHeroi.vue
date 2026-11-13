<script setup lang="ts">
// O topo da /carteira, "A frase" (10/11/2026). O dono pediu para repensar o
// topo depois do estudo de Nubank, Rogo e Legora; das três variações que viu
// (a conta, a frase e a noite), escolheu esta. A linha que ela abre vale para
// a página inteira:
//  - a resposta primeiro, numa frase, com o número que importa em azul (a
//    única cor de destaque); os números de apoio vão na linha cinza abaixo;
//  - um desenho só, calmo; os fatos numa fileira com fios; a ação é uma seta.
// O topo responde "estou indo bem?": o % do CDI no período (a TWR do relatório
// contra o CDI), com o gráfico da rentabilidade em % (base 100), e não mais a
// curva do patrimônio com os aportes. Na fileira: quanto eu tenho, se tem algo
// para olhar (abre o modal dos avisos) e quanto vai cair (leva aos proventos).
// O R$ segue o olho da visita (useValoresVisiveis); o % nunca se esconde.
import type { CarteiraAgoraVM } from '~/types/carteira'
import type { AvisosVisao, ConexaoVisao, RendaVisao } from '~/types/carteiraVisao'
import { contraABolsa, pctComSinal } from '~/utils/diaDaCarteira'
import { agoraEmSP, estadoDoPregao, quandoFoi } from '~/utils/pregao'
import { avisosLiberados, quandoAtualizou, semQuebraNoReal } from '~/utils/carteiraVisao'
import { nomeDoMes } from '~/utils/impostoVisao'
import {
  contraOCdi, inicioDoPeriodo, periodosDoDesempenho, rebase100, serieDesde, variacaoDoIndice, type PeriodoDesempenho,
} from '~/utils/rentabilidadeCarteira'
import CarteiraAvisos from './CarteiraAvisos.vue'
import CarteiraHorizonte from './CarteiraHorizonte.vue'

const props = defineProps<{
  agora: CarteiraAgoraVM
  avisos: AvisosVisao
  conexoes: ConexaoVisao[]
  ativos: number
  renda: RendaVisao | null
  dadosDe: string | null
  mock?: boolean
}>()
const emit = defineEmits<{ (e: 'connected'): void }>()

const { visiveis: revelado, alternar: alternarRevelado } = useValoresVisiveis()
const mascarar = (t: string) => (revelado.value ? t : t.replace(/R\$\s?[\d.,]+(\s?mil)?/g, 'R$ ••••'))
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pct2 = (n: number) => `${nf2.format(n).replace('-', '−')}%`

/* ————— os avisos: o modal de sempre, sem o sino ————— */
const avisosRef = ref<InstanceType<typeof CarteiraAvisos> | null>(null)
defineExpose({ abrirAviso: (id?: string) => avisosRef.value?.abrir(id) })

/* ————— o relatório: a TWR e o CDI, pedidos ao montar ————— */
const rel = useCarteiraRelatorio({ mock: props.mock })
onMounted(() => { void rel.carregar() })
const series = computed(() => (rel.estado.value === 'pronto' ? rel.relatorio.value?.series ?? null : null))
const carregando = computed(() => rel.estado.value === 'fechado' || rel.estado.value === 'carregando')

const NOMES: Record<PeriodoDesempenho, [curto: string, longo: string]> = {
  '1mo': ['1M', '1 mês'], '6mo': ['6M', '6 meses'], '12mo': ['12M', '12 meses'], tudo: ['Tudo', 'todo o histórico'],
}
const opcoes = computed<PeriodoDesempenho[]>(() => (series.value ? periodosDoDesempenho(series.value.carteira) : []))
/** o seletor do período (NuTrilho): '12M' à vista, '12 meses' para o leitor de tela */
const opcoesDoTrilho = computed(() => opcoes.value.map((p) => ({ valor: p, rotulo: NOMES[p][0], extenso: NOMES[p][1] })))
const periodo = ref<PeriodoDesempenho>('12mo')
watch(opcoes, (o) => {
  if (o.length && !o.includes(periodo.value)) periodo.value = o[o.length - 1]!
}, { immediate: true })
const pedido = computed(() => (series.value ? inicioDoPeriodo(periodo.value, series.value.carteira) : ''))
const linha = computed(() => (series.value ? rebase100(serieDesde(series.value.carteira, pedido.value)) : []))
const linhaCdi = computed(() => (series.value ? serieDesde(series.value.cdi, pedido.value) : []))
const twr = computed(() => variacaoDoIndice(linha.value))
const inicio = computed(() => linha.value[0]?.t.slice(0, 10) ?? null)
/** 'Em 12 meses' · 'Desde 14/05/25' */
const quandoTxt = computed(() => (periodo.value === 'tudo' && inicio.value ? `Desde ${dataDoPonto(inicio.value)}` : `Em ${NOMES[periodo.value][1]}`))
const bem = computed(() => (series.value && pedido.value ? contraOCdi(series.value, pedido.value, NOMES[periodo.value][1]) : null))
const temGrafico = computed(() => linha.value.length >= 2)
const tituloGrafico = computed(() => `A rentabilidade da carteira contra o CDI, ${quandoTxt.value.toLowerCase()}`)
/* o futuro no mesmo gráfico (12/11, CarteiraHorizonte): os 2.000 caminhos do motor, que a página pede uma vez
   (proverCarteiraFuturo) e divide com a seção dos 5 anos; fora dela (o mock), o gráfico fica como era */
const futuroDaPagina = useCarteiraFuturoDaPagina()
const futuro = computed(() => (futuroDaPagina?.estado.value === 'pronto' ? futuroDaPagina.dados.value : null))
const caminhosDoFuturo = computed(() => futuroDaPagina?.caminhos.value ?? null)
/* o futuro à vista no gráfico (CarteiraHorizonte avisa até que ano a janela vai; null em repouso). 12/11, o
   dono: "quando estiver colocando no futuro altere esse texto Você em 12 meses, e pode tirar esses textos
   para o gráfico ir ocupando mais espaço": o rótulo da faixa passa a dizer até onde o gráfico vai e a
   legenda (os números do passado) sai, com o gráfico subindo para o lugar dela */
const futuroAte = ref<string | null>(null)
/** o rótulo da faixa da marca: 'Você em 12 meses' · 'Você desde 14/05/25' · com o futuro à vista, 'Você até 2029' */
const rotuloFaixa = computed(() => (futuroAte.value ? `Você até ${futuroAte.value}` : `Você ${quandoTxt.value.charAt(0).toLowerCase()}${quandoTxt.value.slice(1)}`))
/* a altura da legenda, medida: é quanto o gráfico sobe quando ela sai (o cartão não muda de altura) */
const legendaEl = ref<HTMLElement | null>(null)
const alturaDaLegenda = ref(0)
let medidor: ResizeObserver | null = null
onMounted(() => {
  medidor = new ResizeObserver(() => { alturaDaLegenda.value = legendaEl.value?.offsetHeight ?? 0 })
  watch(legendaEl, (el, antes) => {
    if (antes) medidor?.unobserve(antes)
    if (el) medidor?.observe(el)
    alturaDaLegenda.value = el?.offsetHeight ?? 0
  }, { immediate: true })
})
onBeforeUnmount(() => medidor?.disconnect())
/** a legenda do cartão: você, o CDI e o mesmo mix de classes, os números que a frase já diz */
const legenda = computed(() => {
  const b = bem.value
  if (!b) return []
  const dir = (n: number) => (n > 0.005 ? 'up' : n < -0.005 ? 'down' : null)
  return [
    { rotulo: 'Você', pct: pctComSinal(b.carteira), dir: dir(b.carteira), traco: 'voce' },
    { rotulo: 'CDI', pct: pctComSinal(b.cdi), dir: null, traco: 'cdi' },
    ...(b.mix != null ? [{ rotulo: 'Mesmo mix de classes', pct: pctComSinal(b.mix), dir: null, traco: null }] : []),
  ]
})

/* ————— o dia ————— */
// o estado do pregão anda com o relógio: às 10h a bolsa abre e os avisos saem, sem recarregar a página
const relogio = ref(0)
onMounted(() => {
  const t = setInterval(() => { relogio.value++ }, 30_000)
  onBeforeUnmount(() => clearInterval(t))
})
const pregao = computed(() => { void relogio.value; return estadoDoPregao() })
// os avisos do dia só saem com a bolsa aberta (10/11); antes, a resposta fica em esqueleto
const liberados = computed(() => avisosLiberados(pregao.value.estado))
const quando = computed(() => quandoFoi(props.agora.priceDate) ?? 'hoje')
const patrimonio = computed(() => (revelado.value ? props.agora.patrimonio : 'R$ ••••••'))
const semSinal = (s: string) => s.replace(/^[+−-]/, '')
/** '+R$ 698,30 (0,11%)'; com o olho fechado, só o % */
const diaNum = computed(() => {
  const a = props.agora
  if (!a.diaPct) return null
  return revelado.value && a.diaValor ? `${a.diaValor} (${semSinal(a.diaPct)})` : a.diaPct
})
/** 'subiu menos que a bolsa (+1,39%)' */
const contra = computed(() => {
  const c = props.agora.carteiraPct
  const b = props.agora.bolsaPct
  if (c == null || b == null) return null
  return `${contraABolsa(c, b, pregao.value.estado === 'aberta')} (${pctComSinal(b)})`
})
const urgente = computed(() => props.avisos.itens.find((a) => a.id === props.avisos.urgente) ?? null)
const atencao = computed(() => liberados.value && (!!urgente.value || !!props.agora.alerta))
/** o tom do selo do estado (NuSelo): âmbar quando pede atenção, verde com a bolsa aberta, neutro no resto */
const tomDoEstado = computed(() => (atencao.value ? 'ambar' : pregao.value.estado === 'aberta' ? 'verde' : 'neutro'))

/* ————— as três respostas ————— */
const pedem = computed(() => props.avisos.itens.filter((a) => a.gravidade === 'alta' || a.gravidade === 'media'))
const primeiro = computed(() => pedem.value[0] ?? props.avisos.itens[0] ?? null)
const marcados = computed(() => props.renda?.marcados ?? [])
const aReceber = computed(() => marcados.value.reduce((s, m) => s + m.valor, 0))
const proximo = computed(() => {
  const hoje = agoraEmSP().iso
  return marcados.value.find((m) => m.data >= hoje) ?? null
})
const dm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

interface Resposta { id: 'olhar' | 'receber'; pergunta: string; valor: string; sub: string; acao: string; espera?: boolean; aCaminho?: string }
const respostas = computed<Resposta[]>(() => {
  const out: Resposta[] = []
  const n = props.avisos.itens.length
  const k = props.avisos.olhados.length
  const r = props.avisos.retidos
  if (!liberados.value) {
    out.push({ id: 'olhar', pergunta: 'Tem algo para eu olhar?', acao: '', valor: '', espera: true, sub: 'Os avisos de hoje saem quando a bolsa abrir, às 10h.' })
  } else out.push({
    id: 'olhar', pergunta: 'Tem algo para eu olhar?', acao: 'Abrir os avisos',
    // com aviso na tela, o retido vai na linha de baixo; sem nenhum, ele é a resposta
    aCaminho: r && n ? (r === 1 ? 'mais 1 a caminho' : `mais ${r} a caminho`) : undefined,
    valor: r && !n ? (r === 1 ? '1 aviso a caminho' : `${r} avisos a caminho`) : pedem.value.length ? (pedem.value.length === 1 ? '1 pede atenção' : `${pedem.value.length} pedem atenção`) : n ? (n === 1 ? '1 aviso para ler' : `${n} avisos para ler`) : 'Nada hoje',
    sub: r && !n ? (props.avisos.retidosPor?.precos && !props.avisos.retidosPor.conexao ? 'Falta chegar o preço do último pregão.' : 'Espera a conexão atualizar.') : primeiro.value ? semQuebraNoReal(mascarar(primeiro.value.titulo)) : k ? `Olhei ${k} coisas na sua carteira e está tudo em ordem.` : 'Está tudo em ordem.',
  })
  if (marcados.value.length) {
    const mes = nomeDoMes(marcados.value[0]!.data.slice(0, 7))
    out.push({
      id: 'receber', pergunta: 'Quanto vai cair?', acao: 'Ver os proventos', valor: mascarar(`R$ ${nf0.format(aReceber.value)}`),
      sub: proximo.value ? `Marcados para ${mes}. O próximo é em ${dm(proximo.value.data)}, de ${proximo.value.tickers.join(' e ')}.` : `Marcados para ${mes}.`,
    })
  }
  return out
})
/** a ação que o aviso de atenção já oferece (a primeira do modal: 'Reconectar o Nubank'); vira a pílula do cartão */
const acaoDoAviso = computed(() => (liberados.value && pedem.value.length ? primeiro.value?.acoes[0] ?? null : null))
function acionarAviso() {
  if (primeiro.value) avisosRef.value?.acionar(primeiro.value.id)
}
const focoNaRenda = useState('carteira:renda:foco', () => 0)
function agir(id: Resposta['id']) {
  if (id === 'olhar') avisosRef.value?.abrir(primeiro.value?.id)
  // o mês a cair em destaque nos proventos, por alguns segundos (VisaoRenda escuta o pedido)
  else focoNaRenda.value++
}

/* ————— as conexões ————— */
const frescor = computed(() => props.conexoes.map((c) => {
  const q = c.atualizadaEm ? quandoAtualizou(c.atualizadaEm) : null
  return { ...c, quando: !q ? 'ainda sem sincronizar' : c.estado === 'ok' ? `atualizado ${q}` : `parado desde ${q}` }
}))
const { openWidget, opening, registering } = usePluggyConnect()
const abrindo = computed(() => opening.value || registering.value)
function adicionarConta() {
  if (abrindo.value) return
  openWidget({ onConnected: async () => { emit('connected') } })
}

const contexto = computed(() => ({
  id: 'carteira:hoje', tipo: 'carteira', rotulo: 'Carteira hoje',
  texto: [
    revelado.value ? `Patrimônio: ${props.agora.patrimonio}` : 'Patrimônio (a pessoa escondeu os valores na tela)',
    diaNum.value ? `Resultado ${quando.value}: ${diaNum.value}${contra.value ? `; ${contra.value}` : ''}` : '',
    bem.value ? `${bem.value.frase} ${bem.value.detalhe}`.trim() : '',
    `${props.ativos} ativos`,
  ].filter(Boolean).join('\n'),
}))
</script>

<template>
  <section v-contexto-chat="contexto" class="chv" aria-labelledby="chv-h1" data-clarity-mask="true">
    <header class="chv__cab">
      <div class="chv__id">
        <NuEyebrow id="chv-h1" como="h1" class="chv__nome">Sua carteira</NuEyebrow>
        <!-- os selos da base (NuSelo, robustez 11/11): a contagem no carvão e o estado com o ponto -->
        <NuSelo tom="carvao">{{ ativos }} ativos</NuSelo>
        <NuSelo :tom="tomDoEstado" ponto>{{ atencao ? 'Pede atenção' : pregao.rotulo }}</NuSelo>
      </div>
      <button type="button" class="chv__olho" :aria-pressed="revelado" :aria-label="revelado ? 'Esconder os valores' : 'Mostrar os valores'" :title="revelado ? 'Esconder os valores' : 'Mostrar os valores'" @click="alternarRevelado">
        <svg v-if="revelado" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M1 1l22 22" /></svg>
      </button>
    </header>

    <!-- carregando: o esqueleto na medida da frase e da linha de apoio (em em, na letra de cada uma), para nada pular quando o número chega -->
    <div v-if="carregando" class="chv2__esq" aria-hidden="true">
      <span class="chv2__esq-frase">
        <NuSkeleton variant="line" width="min(820px, 94%)" height=".8em" radius="chip" />
        <NuSkeleton variant="line" width="min(560px, 64%)" height=".8em" radius="chip" />
        <NuSkeleton variant="line" width="48%" height=".8em" radius="chip" class="chv2__esq-cel" />
      </span>
      <span class="chv2__esq-dek">
        <NuSkeleton variant="line" width="min(640px, 100%)" height=".8em" radius="chip" />
        <NuSkeleton variant="line" width="min(380px, 72%)" height=".8em" radius="chip" />
        <NuSkeleton variant="line" width="56%" height=".8em" radius="chip" class="chv2__esq-cel" />
      </span>
    </div>
    <h2 v-else-if="bem" class="chv2__frase">
      <template v-if="bem.destaque">{{ quandoTxt }}, sua carteira rendeu <b>{{ bem.destaque }}</b>.</template>
      <template v-else>{{ quandoTxt }}, sua carteira rendeu <b>{{ pct2(bem.carteira) }}</b>; o CDI, {{ pct2(bem.cdi) }}.</template>
    </h2>
    <h2 v-else class="chv2__frase">{{ quando.charAt(0).toUpperCase() + quando.slice(1) }}, sua carteira <b>{{ contra ?? 'ficou como estava' }}</b>.</h2>
    <p v-if="bem" class="chv2__dek">
      <template v-if="bem.destaque">Foram {{ pct2(bem.carteira) }}, contra {{ pct2(bem.cdi) }} do CDI. </template>{{ bem.detalhe }}
    </p>

    <!-- o gráfico no cartão carvão com a faixa da marca (como no /asset) e, ao lado, os três fatos em cartões -->
    <div class="chv2__grade" :class="{ 'chv2__grade--so': !temGrafico && !carregando }">
      <div v-if="temGrafico" class="chv2__palco">
        <NuFaixaMarca :rotulo="rotuloFaixa" como="p" :altura="56" class="chv2__cartao" :class="{ 'chv2__cartao--futuro': !!futuroAte }" :style="{ '--chv-legenda': `${alturaDaLegenda}px` }">
          <template v-if="opcoes.length > 1" #acoes>
            <NuTrilho v-model="periodo" :opcoes="opcoesDoTrilho" tom="escuro" tamanho="p" rotulo="Período do gráfico" class="chv2__periodos" />
          </template>
          <p v-if="legenda.length" ref="legendaEl" class="chv2__legenda" :aria-hidden="futuroAte ? true : undefined">
            <span v-for="(l, i) in legenda" :key="l.rotulo" class="chv2__leg" :class="{ 'chv2__leg--1': i === 0 }">
              <b :class="l.dir ? `chv2__leg--${l.dir}` : ''">{{ l.pct }}</b>
              <span class="chv2__leg-r"><i v-if="l.traco" class="chv2__traco" :class="{ 'chv2__traco--cdi': l.traco === 'cdi' }" aria-hidden="true" />{{ l.rotulo }}</span>
            </span>
          </p>
          <div class="chv__grafico chv2__grafico">
            <!-- a rentabilidade contra o CDI e, à direita de hoje, o leque do motor: arrastar para a direita abre o horizonte -->
            <CarteiraHorizonte :linha="linha" :comparada="linhaCdi" :atual="twr != null ? pctAtivo(twr) : ''" :rotulo="tituloGrafico" :futuro="futuro" :caminhos="caminhosDoFuturo" :mascarado="!revelado" @horizonte="futuroAte = $event" />
          </div>
          <!-- no celular o período desce para baixo do gráfico, largo (o mesmo gesto do /asset) -->
          <NuTrilho v-if="opcoes.length > 1" v-model="periodo" :opcoes="opcoesDoTrilho" tom="escuro" largo rotulo="Período do gráfico" class="chv2__periodos--pe" />
        </NuFaixaMarca>
      </div>
      <!-- o esqueleto no tom do cartão que vem (carvão): claro, a tela piscava de creme para escuro quando o gráfico chegava -->
      <NuSkeleton v-else-if="carregando" tone="navy" height="var(--chv-esqueleto)" radius="card" class="chv2__palco" />

      <dl class="chv2__fatos">
        <div class="chv2__fato nu-cartao">
          <dt>Quanto eu tenho?</dt>
          <dd>{{ patrimonio }}</dd>
          <dd v-if="diaNum" class="chv2__fato-s"><b :class="`chv__dir--${agora.diaDir}`">{{ diaNum }}</b> {{ quando }}</dd>
        </div>
        <!-- cartão da base (.nu-cartao); o que abre algo é o vivo (sobe 2px e a sombra cresce no hover, afunda ao apertar) -->
        <div v-for="r in respostas" :key="r.id" class="chv2__fato nu-cartao" :class="{ 'chv2__fato--clica nu-cartao--vivo': !r.espera, 'chv2__fato--atencao': r.id === 'olhar' && !r.espera && pedem.length > 0 }">
          <dt>{{ r.pergunta }}</dt>
          <!-- antes da abertura, os avisos do dia ainda não saíram: o esqueleto no lugar da resposta -->
          <dd v-if="r.espera" class="chv2__espera" role="status" :aria-label="r.sub"><NuSkeleton width="min(190px, 80%)" height="28px" radius="chip" /></dd>
          <!-- o botão cobre o cartão inteiro (o ::after): o clique segue abrindo os avisos ou levando aos proventos -->
          <dd v-else><button type="button" class="chv2__link" @click="agir(r.id)">{{ r.valor }}<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" /></svg><span class="nu-sr">{{ r.acao }}</span></button></dd>
          <dd class="chv2__fato-s">{{ r.sub }}</dd>
          <!-- o aviso que ainda espera o preço ou a conexão: a caminho -->
          <dd v-if="r.aCaminho" class="chv2__fato-s chv2__caminho"><NuSkeleton width="56px" height="10px" radius="pill" aria-hidden="true" />{{ r.aCaminho }}</dd>
          <!-- a ação que o aviso já oferece no modal, à mão no cartão -->
          <!-- a ação principal do cartão: o botão da base (NuBotaoSeta p, o de dentro de cartão) -->
          <dd v-if="r.id === 'olhar' && acaoDoAviso" class="chv2__fato-acao"><NuBotaoSeta variante="carvao" tamanho="p" @click="acionarAviso">{{ acaoDoAviso.rotulo }}</NuBotaoSeta></dd>
        </div>
      </dl>
    </div>

    <!-- o pé: de quando é o dado -->
    <footer class="chv__pe">
      <span v-for="c in frescor" :key="c.id" class="chv__conta" :class="`chv__conta--${c.estado}`">
        <i aria-hidden="true" />{{ c.instituicao }} <span class="chv__quando">{{ c.quando }}</span>
        <NuLinkSeta v-if="c.estado !== 'ok'" to="/conta#open-finance" class="chv__reconectar">Reconectar</NuLinkSeta>
      </span>
      <NuLinkSeta tom="tinta" class="chv__mais" :disabled="abrindo" @click="adicionarConta">{{ abrindo ? 'Abrindo o Open Finance' : 'Adicionar conta' }}</NuLinkSeta>
    </footer>

    <CarteiraAvisos ref="avisosRef" :avisos="avisos" :ativos="ativos" :dados-de="dadosDe" :mock="mock" sem-botao />
  </section>
</template>

<style scoped>
/* ————— a moldura ————— */
.chv {
  --g: var(--cvi-g, clamp(20px, 5.5vw, 80px));
  --tinta: var(--nu-ink); --sub: var(--nu-gray); --fio: var(--nu-line); --pilula: var(--nu-cream-2); --sobe: var(--nu-green-text); --cai: var(--nu-red-text);
  position: relative; padding: clamp(24px, 3vw, 40px) var(--g) clamp(28px, 3.4vw, 44px); background: var(--nu-page); color: var(--tinta);
  font-variant-numeric: tabular-nums; scroll-margin-top: calc(var(--nuh-h, 76px) + 56px);
}
.chv__cab { display: flex; align-items: center; justify-content: space-between; gap: 12px 20px; }
.chv__id { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 12px; min-width: 0; }
/* o nome da tela é o eyebrow da marca (o corte + caixa alta), e os dois selos de raio 8 ao lado */
.chv__nome { margin-right: 4px; }

.chv__olho {
  display: inline-grid; place-items: center; flex-shrink: 0; width: 44px; height: 44px; border: 0; border-radius: 50%;
  background: var(--nu-white); color: var(--tinta); box-shadow: inset 0 0 0 1.5px var(--nu-ink); cursor: pointer; transition: background var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.chv__olho:hover { background: var(--nu-row-hover); }
.chv__olho:active { transform: scale(.96); }
.chv__dir--up { color: var(--sobe); }
.chv__dir--down { color: var(--cai); }

/* o período sobre o carvão do cartão: o NuTrilho escuro (a escolhida na pílula creme, que desliza) */
.chv2__periodos { flex-shrink: 0; }
.chv__grafico { position: relative; }
.chv__pe { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 20px; margin-top: clamp(24px, 3vw, 36px); color: var(--tinta); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.chv__conta { display: inline-flex; align-items: center; gap: 8px; }
.chv__conta i { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-green); box-shadow: 0 0 0 3px var(--nu-green-bg); }
.chv__conta--velha i, .chv__conta--caida i { background: var(--nu-amber-fill); box-shadow: none; }
.chv__quando { color: var(--sub); font-weight: var(--nu-w-texto); }
/* "Reconectar" e "Adicionar conta": o link da base (NuLinkSeta), a letra da linha */
.chv__reconectar { margin-left: 4px; }

/* ————— a frase, o gráfico e os fatos ————— */
/* o esqueleto da frase e da linha de apoio: cada barra .8em na letra de quem ela imita (a frase em lh 1, a de apoio em lh 1,45) */
.chv2__esq { display: block; }
.chv2__esq-frase { display: grid; row-gap: .2em; padding-block: .1em; margin-top: clamp(22px, 3vw, 36px); max-width: min(100%, 1100px); font-size: clamp(40px, 5.6vw, 76px); }
.chv2__esq-dek { display: grid; row-gap: .65em; padding-block: .325em; margin-top: 20px; max-width: 58ch; font-size: clamp(18px, 1.5vw, 21px); }
.chv2__esq-cel { display: none !important; }
@media (max-width: 640px) { .chv2__esq-cel { display: block !important; } }
/* a frase em 800, um degrau acima do h2 de seção: é o título da tela */
.chv2__frase { margin: clamp(22px, 3vw, 36px) 0 0; max-width: min(100%, 1100px); font-size: clamp(40px, 5.6vw, 76px); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1; text-wrap: balance; animation: nu-fade var(--nu-dur-entrada) var(--nu-ease-saida) backwards; }
.chv2__frase b { color: var(--nu-blue); font-weight: inherit; white-space: nowrap; }
.chv2__dek { margin: 20px 0 0; max-width: 58ch; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto); line-height: 1.45; animation: nu-fade var(--nu-dur-entrada) var(--nu-ease-saida) .06s backwards; }
/* a grade do topo: o cartão do gráfico e, ao lado, os três fatos empilhados (no celular, um embaixo do outro) */
/* a altura do gráfico (12/11/2026, o dono: "aumentar esse card da carteira, em questão de altura, tá muito pequeno"):
   o leque dos 2.000 caminhos precisa de altura para abrir; eram 230 a 340px. Ela vem da largura (--chv-larga) e a
   altura da janela também manda: o cartão inteiro cabe entre o topo grudado e a barra do chat, para o rótulo de
   cima e o aviso do pé aparecerem juntos.
   --chv-fora é o que a janela perde fora do cartão: o topo grudado depois de rolar (a navegação encolhida e a barra
   das seções, 105px; valor fixo, porque --nuh-h muda com a rolagem e o gráfico mudaria de altura junto), a barra do
   chat (83px) e 8px de respiro de cada lado. --chv-moldura é o que o cartão tem além do gráfico (a faixa, a legenda
   e os recuos). O esqueleto tem a altura do cartão que vem */
.chv2__grade {
  --chv-larga: 35vw; --chv-fora: 204px; --chv-moldura: 216px;
  --chv-grafico-min: clamp(320px, min(var(--chv-larga), calc(100vh - var(--chv-fora) - var(--chv-moldura))), 520px);
  --chv-esqueleto: calc(var(--chv-grafico-min) + var(--chv-moldura));
  display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr); gap: clamp(14px, 1.6vw, 20px); margin-top: clamp(26px, 3.4vw, 44px);
}
.chv2__grade--so { grid-template-columns: minmax(0, 1fr); }
.chv2__palco { position: relative; min-width: 0; animation: nu-fade var(--nu-dur-entrada) var(--nu-ease-saida) .1s backwards; }
/* o cartão carvão com a faixa da marca: o rótulo do período na aba e o seletor à direita dela */
.chv2__cartao { --pad: clamp(18px, 2.2vw, 30px); height: 100%; box-sizing: border-box; display: flex; flex-direction: column; padding-bottom: clamp(16px, 2vw, 24px); }
.chv2__cartao :deep(.nfm__acoes) { padding: 6px 10px 0 0; }
.chv2__legenda { display: flex; align-items: baseline; gap: 6px 28px; flex-wrap: wrap; margin: clamp(18px, 2vw, 26px) var(--pad) 0; transition: opacity var(--nu-dur-media) var(--nu-ease-cor); }
/* o futuro à vista: a legenda (os números do passado) sai e o gráfico sobe para o lugar dela; o cartão não muda de altura */
.chv2__cartao--futuro .chv2__legenda { opacity: 0; pointer-events: none; }
.chv2__leg { display: inline-flex; align-items: baseline; gap: 10px; }
.chv2__leg b { color: var(--nu-white); font-size: clamp(20px, 2vw, 26px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); font-variant-numeric: tabular-nums; }
.chv2__leg--1 b { font-size: clamp(38px, 4.4vw, 58px); letter-spacing: var(--nu-ls-display); line-height: 1; }
.chv2__leg b.chv2__leg--up { color: var(--nu-green-soft); }
.chv2__leg b.chv2__leg--down { color: var(--nu-red-soft); }
.chv2__leg-r { display: inline-flex; align-items: center; gap: 7px; color: var(--nu-on-dark-2); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.chv2__traco { width: 14px; height: 2px; border-radius: 1px; background: var(--nu-blue-on-dark); }
.chv2__traco--cdi { background: repeating-linear-gradient(90deg, var(--nu-white-35) 0 3px, transparent 3px 7px); }
/* o gráfico vai de beira a beira do cartão; o ponto de hoje e o rótulo recuam, as marcas começam na margem do texto (as variáveis do AtivoGrafico, como no /asset) */
.chv2__grafico {
  flex: 1 1 auto; min-height: var(--chv-grafico-min); margin-top: 14px;
  --agr-esq: var(--pad); --agr-dir: max(var(--pad), 44px); --agr-rotulo-esq: var(--pad);
  --agr-hoje-bg: var(--nu-creme); --agr-hoje-fg: var(--nu-ink); --agr-hoje-sub: var(--nu-gray);
  transition: margin-top var(--nu-dur-lenta) var(--nu-ease-troca), min-height var(--nu-dur-lenta) var(--nu-ease-troca);
}
/* o gráfico sobe a altura da legenda (medida) e cresce o mesmo tanto: no desktop ele já estica até o pé do
   cartão; no celular, onde o cartão tem a altura do conteúdo, a altura mínima cresce junto e nada abaixo pula */
.chv2__cartao--futuro .chv2__grafico { margin-top: calc(-1 * var(--chv-legenda, 0px)); min-height: calc(var(--chv-grafico-min) + var(--chv-legenda, 0px) + 14px); }
/* o cartão estica até a altura dos três fatos, e o gráfico ocupa o que sobra (o AtivoGrafico pede 100% de altura: aqui ele se prende às quatro beiras) */
.chv2__grafico :deep(.agr) { position: absolute; inset: 0; height: auto; }
.chv2__periodos--pe { display: none; margin: 16px var(--pad) 0; }
/* os três fatos: cartões creme do contrato; o de atenção, em âmbar */
.chv2__fatos { display: grid; grid-template-columns: minmax(0, 1fr); align-content: stretch; gap: clamp(12px, 1.4vw, 16px); margin: 0; min-width: 0; }
.chv2__grade--so .chv2__fatos { grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); }
/* o cartão, a sombra e o hover são da base (.nu-cartao, .nu-cartao--vivo); aqui só a caixa e a entrada.
   A entrada fica 'backwards': com 'both', o fim da animação (transform: none) prendia o cartão e o hover não subia */
.chv2__fato {
  position: relative; display: flex; flex-direction: column; justify-content: center; padding: clamp(18px, 2vw, 24px) clamp(20px, 2.2vw, 26px);
  animation: nu-fade var(--nu-dur-entrada) var(--nu-ease-saida) 120ms backwards;
}
.chv2__fato:nth-child(2) { animation-delay: 180ms; }
.chv2__fato:nth-child(3) { animation-delay: 240ms; }
.chv2__fato--atencao { background: var(--nu-amber-bg); }
.chv2__fato--atencao dt, .chv2__fato--atencao dd.chv2__fato-s { color: var(--nu-amber-text); }
.chv2__fato dt { color: var(--sub); font-size: 15px; font-weight: var(--nu-w-medio); }
.chv2__fato dd { margin: 6px 0 0; font-size: clamp(28px, 2.6vw, 36px); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1.1; }
.chv2__fato dd.chv2__fato-s { margin-top: 6px; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); letter-spacing: 0; line-height: 1.45; }
.chv2__fato dd.chv2__fato-acao { position: relative; z-index: 1; margin-top: 14px; font-size: 0; }

.chv2__fato-s b { font-weight: var(--nu-w-medio); }
.chv2__espera { padding: 2px 0; }
/* o esqueleto sobre o creme: o tom vem do CarteiraVisao (.cvi), um só para a página */
.chv2__fato dd.chv2__caminho { display: flex; align-items: center; gap: 8px; }
.chv2__link { display: inline-flex; align-items: center; gap: 6px; padding: 0; border: 0; background: none; color: inherit; font: inherit; letter-spacing: inherit; text-align: left; cursor: pointer; }
/* o alvo do clique é o cartão inteiro */
.chv2__link::after { content: ''; position: absolute; inset: 0; border-radius: var(--nu-r-card); }
.chv2__link svg { flex: none; margin-left: 2px; color: var(--nu-blue-text); transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.chv2__fato--atencao .chv2__link svg { color: var(--nu-amber-text); }
.chv2__fato--clica:hover .chv2__link svg { transform: translateX(3px); }
.chv2__link:focus-visible { outline: none; }
.chv2__link:focus-visible::after { outline: 3px solid var(--nu-blue); outline-offset: 2px; }

@media (max-width: 1000px) {
  /* numa coluna só o cartão tem a largura da tela (no computador, pouco mais da metade): a mesma proporção pede 60vw,
     senão o gráfico do tablet ficava com a largura do de computador e 60% da altura. A legenda cabe numa linha, e o
     cartão tem menos além do gráfico */
  .chv2__grade { grid-template-columns: minmax(0, 1fr); --chv-larga: 60vw; --chv-moldura: 144px; }
  .chv2__fatos { grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); }
}
@media (max-width: 760px) {
  /* no celular a legenda empilha e o período desce (o cartão tem mais além do gráfico); o topo grudado tem 91px e
     a barra do chat, 65px */
  .chv2__grade { --chv-moldura: 274px; --chv-fora: 172px; }
  /* no celular o período desce para baixo do gráfico, largo */
  .chv2__cartao :deep(.nfm__acoes) { display: none; }
  .chv2__periodos--pe { display: flex; }
}
@media (prefers-reduced-motion: reduce) {
  .chv2__link svg { transition: none; }
  .chv2__frase, .chv2__dek, .chv2__fato, .chv2__palco { animation: none; }
  .chv2__legenda, .chv2__grafico { transition: none; }
  .chv2__fato { transition: none; }
}
</style>

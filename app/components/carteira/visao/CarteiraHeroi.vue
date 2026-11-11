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
/** o rótulo da faixa da marca: 'Você em 12 meses' · 'Você desde 14/05/25' */
const rotuloFaixa = computed(() => `Você ${quandoTxt.value.charAt(0).toLowerCase()}${quandoTxt.value.slice(1)}`)
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
        <span class="chv__chip">{{ ativos }} ativos</span>
        <span class="chv__estado" :class="{ 'chv__estado--atencao': atencao, [`chv__estado--${pregao.estado}`]: !atencao }">
          <i aria-hidden="true" />{{ atencao ? 'Pede atenção' : pregao.rotulo }}
        </span>
      </div>
      <button type="button" class="chv__olho" :aria-pressed="revelado" :aria-label="revelado ? 'Esconder os valores' : 'Mostrar os valores'" :title="revelado ? 'Esconder os valores' : 'Mostrar os valores'" @click="alternarRevelado">
        <svg v-if="revelado" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M1 1l22 22" /></svg>
      </button>
    </header>

    <div v-if="carregando" class="chv2__esq" aria-hidden="true">
      <NuSkeleton width="min(720px, 92%)" height="clamp(40px, 5vw, 62px)" radius="chip" />
      <NuSkeleton width="min(520px, 70%)" height="clamp(40px, 5vw, 62px)" radius="chip" />
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
        <NuFaixaMarca :rotulo="rotuloFaixa" como="p" :altura="56" class="chv2__cartao">
          <template v-if="opcoes.length > 1" #acoes>
            <div class="chv__periodos chv2__periodos" role="radiogroup" aria-label="Período do gráfico">
              <button v-for="p in opcoes" :key="p" type="button" role="radio" class="chv__periodo" :class="{ 'chv__periodo--on': periodo === p }" :aria-checked="periodo === p" :aria-label="NOMES[p][1]" @click="periodo = p">{{ NOMES[p][0] }}</button>
            </div>
          </template>
          <p v-if="legenda.length" class="chv2__legenda">
            <span v-for="(l, i) in legenda" :key="l.rotulo" class="chv2__leg" :class="{ 'chv2__leg--1': i === 0 }">
              <b :class="l.dir ? `chv2__leg--${l.dir}` : ''">{{ l.pct }}</b>
              <span class="chv2__leg-r"><i v-if="l.traco" class="chv2__traco" :class="{ 'chv2__traco--cdi': l.traco === 'cdi' }" aria-hidden="true" />{{ l.rotulo }}</span>
            </span>
          </p>
          <div class="chv__grafico chv2__grafico">
            <AtivoGrafico :ativo="linha" :ibov="linhaCdi" ticker="Você" rotulo-hoje="Você no período" :atual="twr != null ? pctAtivo(twr) : ''" unidade="%" comparacao="CDI" tom="luz" :rotulo="tituloGrafico" />
          </div>
          <!-- no celular o período desce para baixo do gráfico, largo (o mesmo gesto do /asset) -->
          <div v-if="opcoes.length > 1" class="chv__periodos chv2__periodos chv2__periodos--pe" role="radiogroup" aria-label="Período do gráfico">
            <button v-for="p in opcoes" :key="p" type="button" role="radio" class="chv__periodo" :class="{ 'chv__periodo--on': periodo === p }" :aria-checked="periodo === p" :aria-label="NOMES[p][1]" @click="periodo = p">{{ NOMES[p][0] }}</button>
          </div>
        </NuFaixaMarca>
      </div>
      <!-- o esqueleto no tom do cartão que vem (carvão): claro, a tela piscava de creme para escuro quando o gráfico chegava -->
      <NuSkeleton v-else-if="carregando" tone="navy" height="clamp(320px, 34vw, 470px)" radius="card" class="chv2__palco" />

      <dl class="chv2__fatos">
        <div class="chv2__fato">
          <dt>Quanto eu tenho?</dt>
          <dd>{{ patrimonio }}</dd>
          <dd v-if="diaNum" class="chv2__fato-s"><b :class="`chv__dir--${agora.diaDir}`">{{ diaNum }}</b> {{ quando }}</dd>
        </div>
        <div v-for="r in respostas" :key="r.id" class="chv2__fato" :class="{ 'chv2__fato--clica': !r.espera, 'chv2__fato--atencao': r.id === 'olhar' && !r.espera && pedem.length > 0 }">
          <dt>{{ r.pergunta }}</dt>
          <!-- antes da abertura, os avisos do dia ainda não saíram: o esqueleto no lugar da resposta -->
          <dd v-if="r.espera" class="chv2__espera" role="status" :aria-label="r.sub"><NuSkeleton width="min(190px, 80%)" height="28px" radius="chip" /></dd>
          <!-- o botão cobre o cartão inteiro (o ::after): o clique segue abrindo os avisos ou levando aos proventos -->
          <dd v-else><button type="button" class="chv2__link" @click="agir(r.id)">{{ r.valor }}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg><span class="chv__sr">{{ r.acao }}</span></button></dd>
          <dd class="chv2__fato-s">{{ r.sub }}</dd>
          <!-- o aviso que ainda espera o preço ou a conexão: a caminho -->
          <dd v-if="r.aCaminho" class="chv2__fato-s chv2__caminho"><NuSkeleton width="56px" height="10px" radius="pill" aria-hidden="true" />{{ r.aCaminho }}</dd>
          <!-- a ação que o aviso já oferece no modal, à mão no cartão -->
          <dd v-if="r.id === 'olhar' && acaoDoAviso" class="chv2__fato-acao"><button type="button" class="chv2__pilula" @click="acionarAviso">{{ acaoDoAviso.rotulo }}</button></dd>
        </div>
      </dl>
    </div>

    <!-- o pé: de quando é o dado -->
    <footer class="chv__pe">
      <span v-for="c in frescor" :key="c.id" class="chv__conta" :class="`chv__conta--${c.estado}`">
        <i aria-hidden="true" />{{ c.instituicao }} <span class="chv__quando">{{ c.quando }}</span>
        <NuxtLink v-if="c.estado !== 'ok'" to="/conta#open-finance" class="chv__reconectar">Reconectar</NuxtLink>
      </span>
      <button type="button" class="chv__mais" :disabled="abrindo" @click="adicionarConta">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        {{ abrindo ? 'Abrindo…' : 'Adicionar conta' }}
      </button>
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
.chv__chip { display: inline-flex; align-items: center; height: 28px; padding: 0 10px; border-radius: var(--nu-r-tag); background: var(--nu-ink); color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.chv__estado { display: inline-flex; align-items: center; gap: 8px; height: 28px; padding: 0 10px; border-radius: var(--nu-r-tag); background: var(--nu-cream-2); color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.chv__estado i { width: 8px; height: 8px; border-radius: 50%; background: var(--sub); opacity: .55; }
.chv__estado--aberta { background: var(--nu-green-bg); color: var(--nu-green-text); }
.chv__estado--aberta i { background: var(--nu-green); opacity: 1; }
.chv__estado--atencao { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.chv__estado--atencao i { background: var(--nu-amber-fill); opacity: 1; }
.chv__olho {
  display: inline-grid; place-items: center; flex-shrink: 0; width: 44px; height: 44px; border: 0; border-radius: 50%;
  background: var(--nu-white); color: var(--tinta); box-shadow: inset 0 0 0 1.5px var(--nu-ink); cursor: pointer; transition: background .2s, transform .15s var(--nu-ease-saida);
}
.chv__olho:hover { background: var(--nu-row-hover); }
.chv__olho:active { transform: scale(.96); }
.chv__dir--up { color: var(--sobe); }
.chv__dir--down { color: var(--cai); }
.chv__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
/* o período sobre o carvão do cartão: a escolhida na pílula creme */
.chv__periodos { display: inline-flex; flex-shrink: 0; }
.chv__periodo {
  height: 44px; min-width: 52px; padding: 0 15px; border: 0; border-radius: var(--nu-r-pill); background: transparent; color: var(--nu-on-dark);
  font: inherit; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); cursor: pointer; transition: background .2s, color .2s;
}
.chv__periodo:hover { color: var(--nu-white); }
.chv__periodo--on, .chv__periodo--on:hover { background: var(--nu-creme); color: var(--nu-ink); }
.chv__periodo:focus-visible { outline-color: var(--nu-blue-on-dark); }
.chv__grafico { position: relative; }
.chv__pe { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 20px; margin-top: clamp(24px, 3vw, 36px); color: var(--tinta); font-size: var(--nu-fs-sm); font-weight: 600; }
.chv__conta { display: inline-flex; align-items: center; gap: 8px; }
.chv__conta i { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-green); box-shadow: 0 0 0 3px var(--nu-green-bg); }
.chv__conta--velha i, .chv__conta--caida i { background: var(--nu-amber-fill); box-shadow: none; }
.chv__quando { color: var(--sub); font-weight: 500; }
.chv__reconectar { color: var(--nu-blue-text); font-weight: var(--nu-w-medio); text-decoration: underline; text-underline-offset: 3px; }
.chv__mais { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0; border: 0; background: none; color: var(--nu-gray-3); font: inherit; font-weight: var(--nu-w-medio); cursor: pointer; transition: color .2s; }
.chv__mais:hover { color: var(--tinta); }

/* ————— a frase, o gráfico e os fatos ————— */
.chv2__esq { display: grid; gap: 12px; margin-top: clamp(28px, 4vw, 52px); }
/* a frase em 800, um degrau acima do h2 de seção: é o título da tela */
.chv2__frase { margin: clamp(22px, 3vw, 36px) 0 0; max-width: min(100%, 1100px); font-size: clamp(40px, 5.6vw, 76px); font-weight: var(--nu-w-display); letter-spacing: -0.035em; line-height: 1; text-wrap: balance; animation: nu-fade .5s ease both; }
.chv2__frase b { color: var(--nu-blue); font-weight: inherit; white-space: nowrap; }
.chv2__dek { margin: 20px 0 0; max-width: 58ch; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; animation: nu-fade .5s ease .06s both; }
/* a grade do topo: o cartão do gráfico e, ao lado, os três fatos empilhados (no celular, um embaixo do outro) */
.chv2__grade { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr); gap: clamp(14px, 1.6vw, 20px); margin-top: clamp(26px, 3.4vw, 44px); }
.chv2__grade--so { grid-template-columns: minmax(0, 1fr); }
.chv2__palco { position: relative; min-width: 0; animation: nu-fade .5s ease .1s both; }
/* o cartão carvão com a faixa da marca: o rótulo do período na aba e o seletor à direita dela */
.chv2__cartao { --pad: clamp(18px, 2.2vw, 30px); height: 100%; box-sizing: border-box; display: flex; flex-direction: column; padding-bottom: clamp(16px, 2vw, 24px); }
.chv2__cartao :deep(.nfm__acoes) { padding: 6px 10px 0 0; }
.chv2__legenda { display: flex; align-items: baseline; gap: 6px 28px; flex-wrap: wrap; margin: clamp(18px, 2vw, 26px) var(--pad) 0; }
.chv2__leg { display: inline-flex; align-items: baseline; gap: 10px; }
.chv2__leg b { color: var(--nu-white); font-size: clamp(20px, 2vw, 26px); font-weight: var(--nu-w-forte); letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.chv2__leg--1 b { font-size: clamp(38px, 4.4vw, 58px); letter-spacing: -0.04em; line-height: 1; }
.chv2__leg b.chv2__leg--up { color: var(--nu-green-soft); }
.chv2__leg b.chv2__leg--down { color: var(--nu-red-soft); }
.chv2__leg-r { display: inline-flex; align-items: center; gap: 7px; color: var(--nu-on-dark-2); font-size: var(--nu-fs-sm); font-weight: 600; }
.chv2__traco { width: 14px; height: 2px; border-radius: 1px; background: var(--nu-blue-on-dark); }
.chv2__traco--cdi { background: repeating-linear-gradient(90deg, var(--nu-white-35) 0 3px, transparent 3px 7px); }
/* o gráfico vai de beira a beira do cartão; o ponto de hoje e o rótulo recuam, as marcas começam na margem do texto (as variáveis do AtivoGrafico, como no /asset) */
.chv2__grafico {
  flex: 1 1 auto; min-height: clamp(230px, 24vw, 340px); margin-top: 14px;
  --agr-esq: var(--pad); --agr-dir: max(var(--pad), 44px); --agr-rotulo-esq: var(--pad);
  --agr-hoje-bg: var(--nu-creme); --agr-hoje-fg: var(--nu-ink); --agr-hoje-sub: var(--nu-gray);
}
/* o cartão estica até a altura dos três fatos, e o gráfico ocupa o que sobra (o AtivoGrafico pede 100% de altura: aqui ele se prende às quatro beiras) */
.chv2__grafico :deep(.agr) { position: absolute; inset: 0; height: auto; }
.chv2__periodos--pe { display: none; margin: 16px var(--pad) 0; padding: 4px; border-radius: var(--nu-r-pill); background: var(--nu-dark-chip); }
.chv2__periodos--pe .chv__periodo { flex: 1; }
/* os três fatos: cartões creme do contrato; o de atenção, em âmbar */
.chv2__fatos { display: grid; grid-template-columns: minmax(0, 1fr); align-content: stretch; gap: clamp(12px, 1.4vw, 16px); margin: 0; min-width: 0; }
.chv2__grade--so .chv2__fatos { grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); }
.chv2__fato {
  position: relative; display: flex; flex-direction: column; justify-content: center; padding: clamp(18px, 2vw, 24px) clamp(20px, 2.2vw, 26px);
  border-radius: var(--nu-r-card); background: var(--nu-card); box-shadow: var(--nu-shadow-quente);
  transition: transform .25s var(--nu-ease-saida), box-shadow .25s; animation: nu-fade .5s ease .12s both;
}
.chv2__fato:nth-child(2) { animation-delay: 180ms; }
.chv2__fato:nth-child(3) { animation-delay: 240ms; }
/* cartão clicável: sobe 2px e ganha a sombra de cartão flutuando */
.chv2__fato--clica:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.chv2__fato--atencao { background: var(--nu-amber-bg); }
.chv2__fato--atencao dt, .chv2__fato--atencao dd.chv2__fato-s { color: var(--nu-amber-text); }
.chv2__fato dt { color: var(--sub); font-size: 15px; font-weight: 600; }
.chv2__fato dd { margin: 6px 0 0; font-size: clamp(28px, 2.6vw, 36px); font-weight: var(--nu-w-display); letter-spacing: -0.03em; line-height: 1.1; }
.chv2__fato dd.chv2__fato-s { margin-top: 6px; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: 500; letter-spacing: 0; line-height: 1.45; }
.chv2__fato dd.chv2__fato-acao { position: relative; z-index: 1; margin-top: 14px; font-size: 0; }
/* a pílula da ação do aviso: carvão sobre o âmbar */
.chv2__pilula {
  min-height: 44px; padding: 0 20px; border: 0; border-radius: var(--nu-r-pill); background: var(--nu-ink); color: var(--nu-white);
  font: inherit; font-size: 15px; font-weight: var(--nu-w-medio); letter-spacing: 0; cursor: pointer; transition: background .2s, transform .15s var(--nu-ease-saida);
}
.chv2__pilula:hover { background: var(--nu-ink-hover); }
.chv2__pilula:active { transform: scale(.98); }
.chv2__fato-s b { font-weight: var(--nu-w-medio); }
.chv2__espera { padding: 2px 0; }
/* o esqueleto sobre o creme: o tom vem do CarteiraVisao (.cvi), um só para a página */
.chv2__fato dd.chv2__caminho { display: flex; align-items: center; gap: 8px; }
.chv2__link { display: inline-flex; align-items: center; gap: 6px; padding: 0; border: 0; background: none; color: inherit; font: inherit; letter-spacing: inherit; text-align: left; cursor: pointer; }
/* o alvo do clique é o cartão inteiro */
.chv2__link::after { content: ''; position: absolute; inset: 0; border-radius: var(--nu-r-card); }
.chv2__link svg { flex: none; color: var(--nu-blue-text); transition: transform .2s; }
.chv2__fato--atencao .chv2__link svg { color: var(--nu-amber-text); }
.chv2__fato--clica:hover .chv2__link svg { transform: translateX(3px); }
.chv2__link:focus-visible { outline: none; }
.chv2__link:focus-visible::after { outline: 3px solid var(--nu-blue); outline-offset: 2px; }

@media (max-width: 1000px) {
  .chv2__grade { grid-template-columns: minmax(0, 1fr); }
  .chv2__fatos { grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); }
}
@media (max-width: 760px) {
  /* no celular o período desce para baixo do gráfico, largo */
  .chv2__cartao :deep(.nfm__acoes) { display: none; }
  .chv2__periodos--pe { display: flex; }
}
@media (prefers-reduced-motion: reduce) {
  .chv2__link svg { transition: none; }
  .chv2__frase, .chv2__dek, .chv2__fato, .chv2__palco { animation: none; }
  .chv2__fato { transition: none; }
}
</style>

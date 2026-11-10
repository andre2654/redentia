<script setup lang="ts">
// O topo da /carteira repensado (10/11/2026), em TRÊS variações para o dono
// escolher olhando (o método de 03/11: `?heroi=1|2|3`, só no dev; a escolhida
// fica e as outras saem). Nasceu do estudo de Nubank, Rogo e Legora:
//  1 "A conta"   (o calor do Nubank): fundo branco, o patrimônio grande com o
//                olho e três respostas em cartões de areia com a seta azul;
//                o gráfico fica a um toque.
//  2 "A frase"   (a precisão da Legora): fundo creme, a resposta primeiro numa
//                frase ("rendeu 124% do CDI"), o gráfico calmo logo abaixo e
//                os fatos numa fileira com fios.
//  3 "A noite"   (a autoridade da Rogo): o topo escuro que o site já usa, sem
//                a manchete "Tudo normal.": o patrimônio leve à esquerda, o
//                gráfico à direita e as três respostas numa faixa com fios.
// As três respondem às MESMAS três perguntas, com os mesmos dados:
//   estou indo bem?  o % do CDI no período (a TWR do relatório contra o CDI)
//   tem algo para eu olhar?  os avisos do motor (abre o modal de sempre)
//   quanto vai cair?  os proventos já marcados (leva ao "Quanto ele te paga")
// O gráfico é a rentabilidade em % (carteira × CDI, base 100), e não mais a
// curva do patrimônio com os aportes: é ele que responde "estou indo bem?".
// O R$ segue o olho da visita (useValoresVisiveis); o % nunca se esconde.
import type { CarteiraAgoraVM } from '~/types/carteira'
import type { AvisosVisao, ConexaoVisao, RendaVisao } from '~/types/carteiraVisao'
import { contraABolsa, pctComSinal } from '~/utils/diaDaCarteira'
import { agoraEmSP, estadoDoPregao, quandoFoi } from '~/utils/pregao'
import { quandoAtualizou, semQuebraNoReal } from '~/utils/carteiraVisao'
import { nomeDoMes } from '~/utils/impostoVisao'
import {
  contraOCdi, inicioDoPeriodo, periodosDoDesempenho, rebase100, serieDesde, variacaoDoIndice, type PeriodoDesempenho,
} from '~/utils/rentabilidadeCarteira'
import CarteiraAvisos from './CarteiraAvisos.vue'

const props = defineProps<{
  variante: 1 | 2 | 3
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

/* ————— o dia ————— */
const pregao = computed(() => estadoDoPregao())
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
const atencao = computed(() => !!urgente.value || !!props.agora.alerta)

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

interface Resposta { id: 'rend' | 'olhar' | 'receber'; pergunta: string; valor: string; sub: string; carregando?: boolean }
const respostas = computed<Resposta[]>(() => {
  const out: Resposta[] = []
  // estou indo bem?
  if (carregando.value) out.push({ id: 'rend', pergunta: 'Estou indo bem?', valor: '', sub: '', carregando: true })
  else if (bem.value) {
    const b = bem.value
    out.push({
      id: 'rend', pergunta: 'Estou indo bem?', valor: b.destaque ?? pctAtivo(b.carteira),
      sub: `${quandoTxt.value}: ${pct2(b.carteira)}, contra ${pct2(b.cdi)} do CDI.`,
    })
  }
  // tem algo para eu olhar?
  const n = props.avisos.itens.length
  const k = props.avisos.olhados.length
  out.push({
    id: 'olhar', pergunta: 'Tem algo para eu olhar?',
    valor: pedem.value.length ? (pedem.value.length === 1 ? '1 pede atenção' : `${pedem.value.length} pedem atenção`) : n ? (n === 1 ? '1 aviso para ler' : `${n} avisos para ler`) : 'Nada hoje',
    sub: primeiro.value ? semQuebraNoReal(mascarar(primeiro.value.titulo)) : k ? `Olhei ${k} coisas na sua carteira e está tudo em ordem.` : 'Está tudo em ordem.',
  })
  // quanto vai cair?
  if (marcados.value.length) {
    const mes = nomeDoMes(marcados.value[0]!.data.slice(0, 7))
    out.push({
      id: 'receber', pergunta: 'Quanto vai cair?', valor: mascarar(`R$ ${nf0.format(aReceber.value)}`),
      sub: proximo.value ? `Marcados para ${mes}. O próximo é em ${dm(proximo.value.data)}, de ${proximo.value.tickers.join(' e ')}.` : `Marcados para ${mes}.`,
    })
  }
  return out
})

const graficoAberto = ref(false)
function agir(id: Resposta['id']) {
  if (id === 'olhar') { avisosRef.value?.abrir(primeiro.value?.id); return }
  if (id === 'receber') { document.getElementById('renda')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
  // a 1 abre o gráfico ali mesmo; a 2 e a 3 já mostram o gráfico, e a resposta leva ao relatório
  if (props.variante === 1) { graficoAberto.value = !graficoAberto.value; return }
  document.getElementById('relatorio')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
const acaoDe = (r: Resposta) => (r.id === 'olhar' ? 'Abrir os avisos' : r.id === 'receber' ? 'Ver os proventos' : props.variante === 1 ? (graficoAberto.value ? 'Fechar o gráfico' : 'Ver o gráfico') : 'Ver o relatório')

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
  <section v-contexto-chat="contexto" class="chv" :class="`chv--${variante}`" aria-labelledby="chv-h1" data-clarity-mask="true">
    <!-- a linha do nome: igual nas três -->
    <header class="chv__cab">
      <div class="chv__id">
        <h1 id="chv-h1" class="chv__nome">Sua carteira</h1>
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

    <!-- ═════ 1 · A conta ═════ -->
    <template v-if="variante === 1">
      <p class="chv__num chv1__num">{{ patrimonio }}</p>
      <p v-if="diaNum" class="chv1__dia">
        <b :class="`chv__dir--${agora.diaDir}`">{{ diaNum }}</b> {{ quando }}<template v-if="contra">: {{ contra }}</template>.
      </p>

      <ul class="chv1__cartoes">
        <li v-for="r in respostas" :key="r.id">
          <button type="button" class="chv1__cartao" :aria-expanded="r.id === 'rend' ? graficoAberto : undefined" :disabled="r.carregando" @click="agir(r.id)">
            <span class="chv1__p">{{ r.pergunta }}</span>
            <template v-if="r.carregando">
              <NuSkeleton width="70%" height="30px" radius="chip" />
              <NuSkeleton width="90%" height="16px" radius="chip" />
            </template>
            <template v-else>
              <span class="chv1__v">{{ r.valor }}</span>
              <span class="chv1__s">{{ r.sub }}</span>
            </template>
            <span class="chv1__seta" :class="{ 'chv1__seta--aberta': r.id === 'rend' && graficoAberto }" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6" /></svg>
            </span>
            <span class="chv__sr">{{ acaoDe(r) }}</span>
          </button>
        </li>
      </ul>

      <div v-if="graficoAberto && temGrafico" class="chv1__painel">
        <div class="chv__graf-cab">
          <p class="chv__graf-t">{{ bem?.detalhe || 'A rentabilidade sem o efeito dos aportes, contra o CDI.' }}</p>
          <div v-if="opcoes.length > 1" class="chv__periodos" role="radiogroup" aria-label="Período do gráfico">
            <button v-for="p in opcoes" :key="p" type="button" role="radio" class="chv__periodo" :class="{ 'chv__periodo--on': periodo === p }" :aria-checked="periodo === p" :aria-label="NOMES[p][1]" @click="periodo = p">{{ NOMES[p][0] }}</button>
          </div>
        </div>
        <div class="chv__grafico chv1__grafico">
          <AtivoGrafico :ativo="linha" :ibov="linhaCdi" ticker="Você" rotulo-hoje="Você no período" :atual="twr != null ? pctAtivo(twr) : ''" unidade="%" comparacao="CDI" tom="claro" :rotulo="tituloGrafico" :rotulo-abaixo-ate="40" />
        </div>
      </div>
    </template>

    <!-- ═════ 2 · A frase ═════ -->
    <template v-else-if="variante === 2">
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

      <div v-if="temGrafico" class="chv2__palco">
        <div v-if="opcoes.length > 1" class="chv__periodos chv2__periodos" role="radiogroup" aria-label="Período do gráfico">
          <button v-for="p in opcoes" :key="p" type="button" role="radio" class="chv__periodo" :class="{ 'chv__periodo--on': periodo === p }" :aria-checked="periodo === p" :aria-label="NOMES[p][1]" @click="periodo = p">{{ NOMES[p][0] }}</button>
        </div>
        <div class="chv__grafico chv2__grafico">
          <AtivoGrafico :ativo="linha" :ibov="linhaCdi" ticker="Você" rotulo-hoje="Você no período" :atual="twr != null ? pctAtivo(twr) : ''" unidade="%" comparacao="CDI" tom="claro" :rotulo="tituloGrafico" :rotulo-abaixo-ate="40" />
        </div>
      </div>
      <NuSkeleton v-else-if="carregando" height="clamp(180px, 22vw, 280px)" radius="card" class="chv2__palco" />

      <dl class="chv2__fatos">
        <div class="chv2__fato">
          <dt>Você tem</dt>
          <dd>{{ patrimonio }}</dd>
          <dd v-if="diaNum" class="chv2__fato-s"><b :class="`chv__dir--${agora.diaDir}`">{{ diaNum }}</b> {{ quando }}</dd>
        </div>
        <div v-for="r in respostas.filter((x) => x.id !== 'rend')" :key="r.id" class="chv2__fato">
          <dt>{{ r.pergunta }}</dt>
          <dd><button type="button" class="chv2__link" @click="agir(r.id)">{{ r.valor }}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg><span class="chv__sr">{{ acaoDe(r) }}</span></button></dd>
          <dd class="chv2__fato-s">{{ r.sub }}</dd>
        </div>
      </dl>
    </template>

    <!-- ═════ 3 · A noite ═════ -->
    <template v-else>
      <div class="chv3__corpo">
        <div class="chv3__esq">
          <p class="chv__num chv3__num">{{ patrimonio }}</p>
          <p v-if="diaNum" class="chv3__dia">
            <b :class="`chv__dir--${agora.diaDir}`">{{ diaNum }}</b> {{ quando }}<template v-if="contra">: {{ contra }}</template>.
          </p>
        </div>
        <div v-if="temGrafico" class="chv3__dir">
          <div class="chv__graf-cab">
            <p class="chv3__leg">
              <span><i class="chv3__traco" aria-hidden="true" />Você <b>{{ twr != null ? pctAtivo(twr) : '' }}</b></span>
              <span v-if="bem"><i class="chv3__traco chv3__traco--cdi" aria-hidden="true" />CDI <b>{{ pctAtivo(bem.cdi) }}</b></span>
            </p>
            <div v-if="opcoes.length > 1" class="chv__periodos" role="radiogroup" aria-label="Período do gráfico">
              <button v-for="p in opcoes" :key="p" type="button" role="radio" class="chv__periodo" :class="{ 'chv__periodo--on': periodo === p }" :aria-checked="periodo === p" :aria-label="NOMES[p][1]" @click="periodo = p">{{ NOMES[p][0] }}</button>
            </div>
          </div>
          <div class="chv__grafico chv3__grafico">
            <AtivoGrafico :ativo="linha" :ibov="linhaCdi" ticker="Você" rotulo-hoje="Você no período" :atual="twr != null ? pctAtivo(twr) : ''" unidade="%" comparacao="CDI" tom="luz" sem-marcas :rotulo="tituloGrafico" :rotulo-abaixo-ate="50" />
          </div>
        </div>
        <NuSkeleton v-else-if="carregando" tone="navy" height="clamp(150px, 16vw, 220px)" radius="card" class="chv3__dir" />
      </div>

      <ul class="chv3__faixa">
        <li v-for="r in respostas" :key="r.id">
          <button type="button" class="chv3__item" :disabled="r.carregando" @click="agir(r.id)">
            <span class="chv3__p">{{ r.pergunta }}</span>
            <template v-if="r.carregando">
              <NuSkeleton tone="navy" width="60%" height="26px" radius="chip" />
              <NuSkeleton tone="navy" width="85%" height="14px" radius="chip" />
            </template>
            <template v-else>
              <span class="chv3__v">{{ r.valor }}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg></span>
              <span class="chv3__s">{{ r.sub }}</span>
            </template>
            <span class="chv__sr">{{ acaoDe(r) }}</span>
          </button>
        </li>
      </ul>
    </template>

    <!-- o pé: de quando é o dado, igual nas três -->
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
/* ————— o que as três dividem ————— */
.chv {
  --g: clamp(22px, 5.5vw, 80px);
  --tinta: var(--nu-ink); --sub: var(--nu-gray-2); --fio: rgba(10, 10, 12, .1); --pilula: var(--nu-cream); --sobe: var(--nu-green-text); --cai: var(--nu-red-text);
  position: relative; padding: clamp(24px, 3vw, 40px) var(--g) clamp(28px, 3.4vw, 44px); color: var(--tinta);
  font-variant-numeric: tabular-nums; scroll-margin-top: calc(var(--nuh-h, 76px) + 56px);
}
.chv__cab { display: flex; align-items: center; justify-content: space-between; gap: 12px 20px; }
.chv__id { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 12px; min-width: 0; }
.chv__nome { margin: 0; font-size: var(--nu-fs-xl); font-weight: 700; letter-spacing: -0.02em; }
.chv__chip { display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: var(--nu-r-pill); box-shadow: inset 0 0 0 1px var(--fio); color: var(--sub); font-size: var(--nu-fs-xs); font-weight: 700; }
.chv__estado { display: inline-flex; align-items: center; gap: 8px; color: var(--sub); font-size: var(--nu-fs-sm); font-weight: 600; }
.chv__estado i { width: 8px; height: 8px; border-radius: 50%; background: var(--sub); opacity: .55; }
.chv__estado--aberta i { background: var(--nu-green); opacity: 1; box-shadow: 0 0 0 3px var(--nu-green-tint); }
.chv__estado--atencao { color: var(--nu-amber-text, var(--tinta)); }
.chv__estado--atencao i { background: var(--nu-amber-fill); opacity: 1; }
.chv__olho {
  display: inline-grid; place-items: center; flex-shrink: 0; width: 44px; height: 44px; border: 0; border-radius: 50%;
  background: var(--pilula); color: var(--tinta); cursor: pointer; transition: background .2s;
}
.chv__olho:hover { background: var(--nu-cream-4); }
.chv__olho:focus-visible, .chv__periodo:focus-visible, .chv__mais:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.chv__num { margin: 0; line-height: 1; letter-spacing: -0.045em; white-space: nowrap; }
.chv__dir--up { color: var(--sobe); }
.chv__dir--down { color: var(--cai); }
.chv__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.chv__graf-cab { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px 20px; }
.chv__graf-t { margin: 0; max-width: 62ch; color: var(--sub); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.chv__periodos { display: inline-flex; flex-shrink: 0; padding: 3px; border-radius: var(--nu-r-pill); background: var(--pilula); }
.chv__periodo {
  height: 32px; min-width: 48px; padding: 0 14px; border: 0; border-radius: var(--nu-r-pill); background: transparent; color: var(--sub);
  font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; cursor: pointer; transition: background .2s, color .2s, box-shadow .2s;
}
.chv__periodo:hover { color: var(--tinta); }
.chv__periodo--on { background: var(--nu-white); color: var(--nu-ink); box-shadow: 0 1px 3px var(--nu-ink-14); }
.chv__grafico { position: relative; --agr-esq: 44px; --agr-dir: 10px; }
.chv__pe { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 20px; margin-top: clamp(24px, 3vw, 36px); color: var(--tinta); font-size: var(--nu-fs-sm); font-weight: 600; }
.chv__conta { display: inline-flex; align-items: center; gap: 8px; }
.chv__conta i { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-green); box-shadow: 0 0 0 3px var(--nu-green-tint); }
.chv__conta--velha i, .chv__conta--caida i { background: var(--nu-amber-fill); box-shadow: none; }
.chv__quando { color: var(--sub); font-weight: 500; }
.chv__reconectar { color: var(--nu-blue-text); font-weight: 700; }
.chv__mais { display: inline-flex; align-items: center; gap: 6px; padding: 0; border: 0; background: none; color: var(--sub); font: inherit; font-weight: 600; cursor: pointer; transition: color .2s; }
.chv__mais:hover { color: var(--tinta); }

/* ————— 1 · A conta: branco, areia e a seta azul ————— */
.chv--1 { background: var(--nu-white); }
.chv1__num { margin-top: clamp(22px, 3.2vw, 40px); font-size: clamp(38px, 6.4vw, 88px); font-weight: 800; }
.chv1__dia { margin: 12px 0 0; color: var(--sub); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.4; }
.chv1__dia b { font-weight: 700; }
.chv1__cartoes { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 14px; margin: clamp(26px, 3.6vw, 44px) 0 0; padding: 0; }
.chv1__cartao {
  position: relative; display: flex; flex-direction: column; gap: 6px; width: 100%; height: 100%; min-height: 148px; padding: 22px 76px 22px 24px;
  border: 0; border-radius: var(--nu-r-card); background: var(--nu-cream); color: var(--tinta); font: inherit; text-align: left; cursor: pointer;
  transition: background .2s;
}
.chv1__cartao:hover { background: var(--nu-cream-4); }
.chv1__cartao:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.chv1__cartao:disabled { cursor: progress; }
.chv1__p { color: var(--sub); font-size: var(--nu-fs-sm); font-weight: 600; }
.chv1__v { margin-top: 2px; font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
.chv1__s { color: var(--sub); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.chv1__seta {
  position: absolute; right: 20px; bottom: 20px; display: inline-grid; place-items: center; width: 40px; height: 40px; border-radius: 50%;
  background: var(--nu-blue); color: var(--nu-white); transition: transform .25s cubic-bezier(.2, .8, .2, 1);
}
.chv1__cartao:hover .chv1__seta { transform: translateX(3px); }
.chv1__seta--aberta, .chv1__cartao:hover .chv1__seta--aberta { transform: rotate(90deg); }
.chv1__painel { margin-top: 14px; padding: 22px 24px 18px; border-radius: var(--nu-r-card); background: var(--nu-cream); animation: chv-entra .38s cubic-bezier(.2, .8, .2, 1) both; }
.chv1__painel .chv__periodos { background: var(--nu-cream-3); }
.chv1__grafico { height: clamp(200px, 22vw, 300px); margin-top: 18px; }
@keyframes chv-entra { from { opacity: 0; transform: translateY(8px); } }

/* ————— 2 · A frase: creme, uma cor só, a resposta primeiro ————— */
.chv--2 { --pilula: var(--nu-cream-3); background: var(--nu-cream); }
.chv--2 .chv__olho { background: var(--nu-white); }
.chv2__esq { display: grid; gap: 12px; margin-top: clamp(28px, 4vw, 52px); }
.chv2__frase { margin: clamp(28px, 4vw, 52px) 0 0; max-width: 20ch; font-size: var(--nu-fs-h2); font-weight: 500; letter-spacing: -0.035em; line-height: 1.06; text-wrap: balance; }
.chv2__frase b { color: var(--nu-blue-text); font-weight: 700; white-space: nowrap; }
.chv2__dek { margin: 18px 0 0; max-width: 58ch; color: var(--sub); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; }
.chv2__palco { position: relative; margin-top: clamp(22px, 3vw, 36px); }
.chv2__periodos { position: absolute; right: 0; top: -6px; z-index: 1; }
.chv2__grafico { height: clamp(190px, 22vw, 300px); padding-top: 34px; box-sizing: content-box; }
.chv2__fatos { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 0 clamp(20px, 3vw, 44px); margin: clamp(24px, 3vw, 36px) 0 0; }
.chv2__fato { padding: 18px 0 4px; border-top: 1px solid var(--fio); }
.chv2__fato dt { color: var(--sub); font-size: var(--nu-fs-sm); font-weight: 600; }
.chv2__fato dd { margin: 6px 0 0; font-size: var(--nu-fs-2xl); font-weight: 700; letter-spacing: -0.025em; line-height: 1.2; }
.chv2__fato dd.chv2__fato-s { margin-top: 6px; color: var(--sub); font-size: var(--nu-fs-sm); font-weight: 500; letter-spacing: 0; line-height: 1.45; }
.chv2__fato-s b { font-weight: 700; }
.chv2__link { display: inline-flex; align-items: center; gap: 6px; padding: 0; border: 0; background: none; color: inherit; font: inherit; letter-spacing: inherit; text-align: left; cursor: pointer; }
.chv2__link svg { color: var(--nu-blue-text); transition: transform .2s; }
.chv2__link:hover svg { transform: translateX(3px); }
.chv2__link:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; border-radius: 4px; }

/* ————— 3 · A noite: o escuro do site, sem manchete ————— */
.chv--3 {
  --tinta: var(--nu-agora-texto); --sub: var(--nu-agora-sub); --fio: var(--nu-agora-linha); --pilula: var(--nu-agora-pilula); --sobe: var(--nu-green-soft); --cai: var(--nu-red-soft);
  background: linear-gradient(180deg, var(--nu-navy) 0%, var(--nu-agora-bg) 70%);
}
.chv--3 .chv__olho:hover { background: rgba(255, 255, 255, .18); }
.chv--3 .chv__periodo--on { background: var(--nu-agora-texto); box-shadow: none; }
.chv--3 .chv__estado--aberta i, .chv--3 .chv__conta i { background: var(--nu-green-soft); box-shadow: 0 0 0 3px var(--nu-green-soft-16); }
.chv--3 .chv__reconectar { color: var(--nu-amber-soft); }
.chv3__corpo { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); align-items: end; gap: 24px clamp(28px, 5vw, 72px); margin-top: clamp(24px, 3.4vw, 44px); }
.chv3__num { font-size: clamp(38px, 5.4vw, 76px); font-weight: 300; }
.chv3__dia { margin: 14px 0 0; color: var(--sub); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.4; }
.chv3__dia b { font-weight: 700; }
.chv3__leg { display: flex; flex-wrap: wrap; gap: 6px 18px; margin: 0; color: var(--sub); font-size: var(--nu-fs-sm); font-weight: 600; }
.chv3__leg span { display: inline-flex; align-items: center; gap: 8px; }
.chv3__leg b { color: var(--tinta); font-weight: 700; }
.chv3__traco { width: 16px; height: 2px; border-radius: 2px; background: var(--nu-blue-soft); }
.chv3__traco--cdi { background: none; border-top: 2px dashed var(--sub); height: 0; }
.chv3__grafico { height: clamp(150px, 16vw, 220px); margin-top: 10px; --agr-esq: 0px; --agr-dir: 10px; }
.chv3__faixa { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); margin: clamp(26px, 3.4vw, 44px) 0 0; padding: 0; border-top: 1px solid var(--fio); }
.chv3__faixa li + li { border-left: 1px solid var(--fio); }
.chv3__item { display: flex; flex-direction: column; gap: 6px; width: 100%; height: 100%; padding: 20px clamp(16px, 2vw, 28px) 6px; border: 0; background: none; color: var(--tinta); font: inherit; text-align: left; cursor: pointer; }
.chv3__faixa li:first-child .chv3__item { padding-left: 0; }
.chv3__item:disabled { cursor: progress; }
.chv3__item:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: -2px; border-radius: 6px; }
.chv3__p { color: var(--sub); font-size: var(--nu-fs-sm); font-weight: 600; }
.chv3__v { display: inline-flex; align-items: center; gap: 8px; font-size: var(--nu-fs-2xl); font-weight: 700; letter-spacing: -0.025em; line-height: 1.2; }
.chv3__v svg { color: var(--sub); transition: transform .2s, color .2s; }
.chv3__item:hover .chv3__v svg { color: var(--tinta); transform: translateX(3px); }
.chv3__s { color: var(--sub); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

@media (max-width: 760px) {
  .chv__estado { flex-basis: 100%; order: 3; }
  .chv1__cartao { min-height: 0; }
  .chv2__periodos { position: static; margin-bottom: 4px; }
  .chv2__grafico { padding-top: 0; }
  .chv3__corpo { grid-template-columns: minmax(0, 1fr); }
  .chv3__faixa li + li { border-left: 0; border-top: 1px solid var(--fio); }
  .chv3__item, .chv3__faixa li:first-child .chv3__item { padding: 16px 0 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .chv1__painel { animation: none; }
  .chv1__seta, .chv2__link svg, .chv3__v svg { transition: none; }
}
</style>

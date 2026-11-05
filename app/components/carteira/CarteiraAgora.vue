<script setup lang="ts">
// O topo da /carteira, "a carteira no bolso" (05/11/2026). O dono recusou duas
// rodadas de topo inventado (a banda navy com luzes, o cartão de vidro, o
// cartão do dia: "tente entender mais o design que estamos seguindo por
// aqui"). Este copia o topo do /asset que ele aprovou peça a peça, "A bolsa no
// bolso" (TopoBolsa), com as MESMAS peças e as MESMAS regras de estilo
// (topo-noite.css, importado com escopo próprio):
//  - a linha do nome ("Sua carteira") com o chip de quantos ativos e de quando;
//  - os botões redondos do TopoBotao: Mostrar/Esconder valores (o olho da
//    visita, useValoresVisiveis), Adicionar conta (o Pluggy) e Perguntar;
//  - o estado do pregão e a frase do dia ("Tudo normal." ou "Pede atenção"),
//    com peso, no lugar do eyebrow; a frase sai de utils/carteira-agora.ts;
//  - o patrimônio grande no lugar do preço (TopoPreco), que segue a mira do
//    gráfico, e a linha do dia ("−R$ 145,20 (0,22%) hoje");
//  - o losango compacto (HomeLosango, a variação 3 que o dono mandou manter)
//    num cartão, ao lado da linha do dia, com você e a bolsa;
//  - a carteira contra o IBOV no gráfico do /asset (AtivoGrafico, tom luz),
//    com a mira, o arrasto que mede, os períodos que a curva cobre e os números
//    numa fileira;
//  - as perguntas prontas (AtivoPerguntaChips), que abrem o painel do chat;
//  - as contas do Open Finance numa linha discreta no pé.
// O R$ abre escondido, como no app: o olho mascara o patrimônio, o R$ do dia,
// as marcas e a dica do gráfico e os números da fileira; o % nunca se esconde.
// Tudo sai do servidor; a animação (a linha se desenhando) só embeleza.
import type { AcaoRange, SeriesPoint } from '~/types/acao'
import type { CarteiraAgoraVM, CarteiraHeroVM } from '~/types/carteira'
import type { HomeChartVM } from '~/types/home'
import type { LeituraDoGrafico } from '~/utils/ativoDirecoes'
import { fraseDaCarteira } from '~/utils/carteira-agora'
import { pctComSinal, subDoProvento } from '~/utils/diaDaCarteira'
import { quemNaFrente } from '~/utils/losangoDoDia'
import { agoraEmSP, estadoDoPregao, quandoFoi } from '~/utils/pregao'
import TopoBotao from '~/components/ativo/topo/TopoBotao.vue'
import TopoPreco from '~/components/ativo/topo/TopoPreco.vue'

const props = defineProps<{ agora: CarteiraAgoraVM; chart: HomeChartVM | null; stats: CarteiraHeroVM['stats'] }>()
const emit = defineEmits<{ (e: 'connected'): void }>()

// os onMounted dos composables vêm antes do await
const { visiveis: revelado, alternar: alternarRevelado } = useValoresVisiveis()
const { connections, loading: contasCarregando, ensure: carregarContas, refresh: atualizarContas } = useContasConectadas()
onMounted(carregarContas)
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
const atencao = computed(() => frase.value.tom === 'atencao')
const alerta = computed(() => (atencao.value ? props.agora.alerta : null))

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
const temLosango = computed(() => props.agora.carteiraPct != null)
const esmaecido = computed(() => pregao.value.estado === 'antes' && props.agora.priceDate?.slice(0, 10) !== agoraEmSP().iso)
const proventoSub = computed(() => subDoProvento(props.agora, quando.value ?? 'hoje', revelado.value))
const frente = computed(() => quemNaFrente(props.agora.carteiraPct, bolsaPct.value))
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
onMounted(() => {
  const el = palco.value
  if (!el || document.visibilityState !== 'visible' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const r = el.getBoundingClientRect()
  if (r.top >= window.innerHeight || r.bottom <= 0) return
  const curvaE = 'cubic-bezier(.2, .8, .2, 1)'
  el.querySelector('.agr__svg')?.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1400, delay: 150, easing: curvaE, fill: 'backwards' })
  el.querySelectorAll('.agr__fim, .agr__hoje').forEach((x) => x.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 1350, easing: 'ease', fill: 'backwards' }))
  el.querySelector('.tbo__horizonte')?.animate([{ opacity: 0.2, transform: 'scaleX(.5)' }, { opacity: 1, transform: 'none' }], { duration: 1400, easing: curvaE, fill: 'backwards' })
})
</script>

<template>
  <section v-contexto-chat="contexto" class="tbo cto" :class="{ 'cto--atencao': atencao }" aria-labelledby="cto-h1" data-clarity-mask="true">
    <div class="tbo__luz" aria-hidden="true" />
    <div class="tbo__linha1">
      <div class="tbo__id">
        <h1 id="cto-h1" class="tbo__empresa">Sua carteira <span class="tbo__bolsa">{{ agora.ativos }}<template v-if="agora.atualizado"> · atualizado {{ agora.atualizado }}</template></span></h1>
      </div>
      <div class="cto__acoes">
        <TopoBotao :rotulo="revelado ? 'Esconder valores' : 'Mostrar valores'" :aria-pressed="revelado" :title="revelado ? 'Esconder os valores' : 'Mostrar os valores'" @click="alternarRevelado">
          <svg v-if="revelado" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M1 1l22 22" /></svg>
        </TopoBotao>
        <TopoBotao :rotulo="abrindo ? 'Abrindo…' : 'Adicionar conta'" title="Adicionar uma conta pelo Open Finance" :disabled="abrindo" :aria-busy="abrindo || undefined" @click="adicionarConta">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </TopoBotao>
        <TopoBotao rotulo="Perguntar" title="Perguntar à Redentia sobre a sua carteira" @click="perguntar()">
          <img src="/logo-azul.svg" alt="" width="16" height="16" class="cto__logo">
        </TopoBotao>
      </div>
    </div>

    <!-- o estado e a frase: o eyebrow do topo, com peso -->
    <p class="cto__estado" :class="`cto__estado--${atencao ? 'atencao' : pregao.estado}`">
      <span class="cto__ponto" aria-hidden="true" />
      <span class="cto__pregao">{{ atencao ? 'Pede atenção' : pregao.rotulo }}</span>
      <NuxtLink v-if="alerta" :to="`/asset/${alerta.ticker}`" class="cto__frase cto__frase--link">{{ frase.titulo }}</NuxtLink>
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
            <span class="tbo__meta">{{ linhaDoDia }}</span>
          </template>
        </p>
      </div>

      <!-- o losango do dia: o logo da marca, com você e a bolsa ao lado -->
      <NuxtLink v-if="temLosango" v-contexto-chat="contextoLosango" to="/carteira#posicoes" class="cto__losango" :class="{ 'cto__losango--esmaecido': esmaecido }">
        <span class="cto__losango-logo">
          <HomeLosango
            tema="noite" compacto link-dia="/carteira#posicoes" link-provento="/carteira#renda-passiva"
            :voce="agora.carteiraPct" :bolsa="bolsaPct" :provento="agora.provento" :provento-sub="proventoSub" :esmaecido="esmaecido"
          />
        </span>
        <span class="cto__losango-texto">
          <span class="cto__losango-nums">
            <span :class="agora.carteiraPct! < 0 ? 'tbo__delta--down' : 'tbo__delta--up'"><span class="cto__quem">Você</span> {{ pctComSinal(agora.carteiraPct!) }}</span>
            <span v-if="bolsaPct != null"><span class="cto__quem">Bolsa</span> {{ pctComSinal(bolsaPct) }}</span>
          </span>
          <span v-if="frente" class="cto__losango-rel">{{ frente.lider === 'empate' ? 'Empatado com a bolsa' : `${frente.numero} ${frente.relacao}` }}</span>
          <span class="cto__losango-prov" :class="{ 'cto__losango-prov--aceso': agora.provento }">Provento · {{ proventoSub }}</span>
        </span>
      </NuxtLink>
    </div>

    <div v-if="fatia.length >= 2" ref="palco" v-contexto-chat="contextoGrafico" class="tbo__palco">
      <div class="tbo__palco-cab">
        <h2 class="tbo__h2">{{ tituloGrafico }}</h2>
        <p v-if="legenda.length" class="tbo__legenda">
          <span v-for="l in legenda" :key="l.rotulo" class="tbo__leg">
            <i class="tbo__traco" :class="{ 'tbo__traco--ibov': l.rotulo === 'IBOV' }" aria-hidden="true" />{{ l.rotulo }}
            <b :class="l.dir ? `tbo__leg--${l.dir}` : ''">{{ l.pct }}</b>
          </span>
        </p>
      </div>
      <div class="tbo__grafico">
        <AtivoGrafico
          :ativo="fatia" :ibov="ibov" ticker="Você" :atual="atualHoje" :rotulo="tituloGrafico" tom="luz"
          :carregando="buscando" :mascarado="!revelado" @leitura="leitura = $event"
        />
      </div>
      <div class="tbo__horizonte" aria-hidden="true" />
      <div v-if="opcoes.length > 1" class="tbo__periodo">
        <AtivoPeriodo v-model="range" :opcoes="opcoes" :disabled="buscando" tom="escuro" class="tbo__seg" :style="{ maxWidth: `${opcoes.length * 130}px` }" />
      </div>
      <p class="tbo__uso" aria-hidden="true">Passe o cursor para ler um dia; arraste para medir entre dois.</p>
    </div>

    <dl v-if="linhas.length" class="tbo__nums">
      <div v-for="r in linhas" :key="r.l" v-contexto-chat="{ id: `carteira:linha:${r.l}`, tipo: 'carteira', rotulo: r.l, texto: `${r.l}: ${r.v}` }" class="tbo__num">
        <dt>{{ r.l }}</dt><dd>{{ r.v }}</dd>
      </div>
    </dl>

    <div class="tbo__pe">
      <AtivoPerguntaChips :perguntas="perguntas" tom="escuro" :rotulo="null" @perguntar="perguntar" />
      <!-- de onde a carteira vem: as contas do Open Finance, discretas -->
      <div v-contexto-chat="{ id: 'carteira:contas', tipo: 'carteira', rotulo: 'Contas conectadas' }" class="tbo__sim cto__contas">
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

/* o patrimônio e o losango lado a lado; no celular, o losango desce */
.cto__dia-linha { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px 32px; flex-wrap: wrap; }
.cto .cto__preco-linha { margin-top: 10px; min-width: 0; }
.cto__losango {
  display: flex; align-items: center; gap: 14px; padding: 10px 18px 10px 10px; border-radius: var(--nu-r-tile);
  background: var(--nu-agora-cartao); color: var(--nu-agora-texto); box-shadow: inset 0 0 0 1px var(--nu-agora-linha);
  transition: transform .45s cubic-bezier(.34, 1.56, .64, 1), box-shadow .2s ease, background .2s ease;
}
.cto__losango:hover { color: var(--nu-agora-texto); transform: translateY(-2px); box-shadow: inset 0 0 0 1px var(--nu-white-18), 0 18px 40px -22px var(--nu-blue-soft); }
.cto__losango:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }
/* o recorte das abas do logo usa a cor do cartão */
.cto__losango-logo { flex: none; width: 72px; --nu-agora-bg: var(--nu-agora-cartao); }
.cto__losango-texto { display: flex; flex-direction: column; gap: 3px; min-width: 0; font-variant-numeric: tabular-nums; }
.cto__losango-nums { display: flex; flex-wrap: wrap; gap: 2px 14px; font-size: var(--nu-fs-lg); font-weight: 700; white-space: nowrap; }
.cto__quem { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 600; }
.cto__losango-rel { color: var(--nu-agora-texto); font-size: var(--nu-fs-sm); font-weight: 600; }
.cto__losango-prov { color: var(--nu-agora-sub); font-size: var(--nu-fs-xs); font-weight: 500; }
.cto__losango-prov--aceso { color: var(--nu-green-soft); font-weight: 700; }
.cto__losango--esmaecido .cto__losango-nums, .cto__losango--esmaecido .cto__losango-rel { opacity: .6; }

/* as contas: discretas, no pé, onde o /asset põe o simulador */
.cto__contas { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 14px; }
.cto__conta { display: inline-flex; align-items: center; gap: 7px; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 600; border-radius: var(--nu-r-pill); transition: color .2s ease; }
.cto__conta:hover { color: var(--nu-agora-texto); }
.cto__conta-logo { display: inline-grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; overflow: hidden; background: var(--nu-agora-pilula); color: var(--nu-agora-sub); }
.cto__conta-logo img { width: 100%; height: 100%; object-fit: cover; }
.cto__conta-status { color: var(--nu-amber-soft); font-size: var(--nu-fs-xs); font-weight: 700; }
.cto__conta--reconectar:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }
.cto__aviso { flex-basis: 100%; color: var(--nu-green-soft); font-size: var(--nu-fs-sm); font-weight: 500; }
.cto__aviso--erro { color: var(--nu-red-soft); }

@media (max-width: 640px) {
  .cto__acoes { gap: 6px; }
  .cto__frase { font-size: var(--nu-fs-lg); }
  .cto__losango { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .cto__losango, .cto__frase--link { transition: none; }
  .cto__losango:hover { transform: none; }
}
</style>

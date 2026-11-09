<script setup lang="ts">
// O topo do /asset: "A bolsa no bolso" (03/11/2026, a escolha do dono entre
// três topos com cara de app), o idioma do app Ações e da página do papel no app da Redentia (V4Ativo): tudo
// alinhado à margem esquerda, sem centralizar. Em cima, o papel e as ações em
// botões redondos; embaixo, o preço na fonte fina e grande, que acompanha a
// mira quando o dedo (ou o mouse) passa no gráfico, com a data e a variação
// desde o início do período no lugar do fechamento anterior. O gráfico vai de
// borda a borda e o período fica embaixo dele, num controle segmentado largo.
// O H1 é o mesmo do céu anterior, com o mesmo texto e o mesmo nível.
// De borda a borda sem cortar nada: a linha e os fios vão até a beira, mas o
// ponto de hoje, o halo e o rótulo ficam recuados pela margem da página (no
// mínimo 44px, o raio do halo com respiro), e os rótulos das marcas começam na
// margem do texto (--agr-esq, --agr-dir e --agr-rotulo-esq do AtivoGrafico).
// A linha se desenhando é Web Animations, uma vez no mount, só com a aba
// visível, o gráfico na tela e sem pedido de menos movimento (a lição do
// /benchmark-ia: nada espera o observador para existir).
import type { AcaoPayload, AcaoRange, AcaoSeriesPair, AcaoStatRow } from '~/types/acao'
import type { AcaoPosition } from '~/composables/useAcao'
import type { LeituraDoGrafico, LegendaItem } from '~/utils/ativoDirecoes'
import TopoAcoes from './TopoAcoes.vue'
import TopoPreco from './TopoPreco.vue'

const props = defineProps<{
  a: AcaoPayload
  t: string
  series: AcaoSeriesPair | null
  range: AcaoRange
  rangeLoading: boolean
  position: AcaoPosition | null
  renamedFrom: string | null
  seguivel: boolean
  tituloGrafico: string
  legenda: LegendaItem[]
  linhas: AcaoStatRow[]
  perguntas: string[]
  contexto: Record<string, unknown>
  contextoGrafico: Record<string, unknown>
}>()
const emit = defineEmits<{ periodo: [AcaoRange]; perguntar: [string]; abrir: [] }>()
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const leitura = ref<LeituraDoGrafico | null>(null)
const logoFalhou = ref(false)
const preco = computed(() => leitura.value?.preco ?? props.a.hero.priceFmt)

const palco = ref<HTMLElement | null>(null)
onMounted(() => {
  const el = palco.value
  if (!el || document.visibilityState !== 'visible' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const r = el.getBoundingClientRect()
  if (r.top >= window.innerHeight || r.bottom <= 0) return
  const curva = 'cubic-bezier(.2, .8, .2, 1)'
  el.querySelector('.agr__svg')?.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1400, delay: 150, easing: curva, fill: 'backwards' })
  el.querySelectorAll('.agr__fim, .agr__hoje').forEach((x) => x.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 1350, easing: 'ease', fill: 'backwards' }))
  el.querySelector('.tbo__horizonte')?.animate([{ opacity: 0.2, transform: 'scaleX(.5)' }, { opacity: 1, transform: 'none' }], { duration: 1400, easing: curva, fill: 'backwards' })
})
</script>

<template>
  <section v-contexto-chat="contexto" class="tbo" aria-labelledby="tbo-h1">
    <div class="tbo__luz" aria-hidden="true" />
    <p v-if="renamedFrom" class="tbo__trocou">{{ renamedFrom }} agora negocia como {{ t }}.</p>
    <div class="tbo__linha1">
      <div class="tbo__id">
        <img v-if="a.hero.logo && !logoFalhou" :src="a.hero.logo" alt="" width="28" height="28" class="tbo__logo" @error="logoFalhou = true">
        <div>
          <p class="tbo__empresa">{{ a.hero.companyLine }} <span class="tbo__bolsa">{{ a.hero.exchangeLabel || 'B3' }}</span></p>
          <h1 v-if="a.resumo" id="tbo-h1" class="tbo__h1">{{ a.resumo.h1 }}</h1>
        </div>
        <span v-if="position" class="tbo__posicao">Na sua carteira · {{ nf0.format(position.qty) }} {{ position.qty === 1 ? 'cota' : 'cotas' }}</span>
      </div>
      <TopoAcoes :ticker="t" :seguivel="seguivel" @perguntar="emit('abrir')" />
    </div>

    <div class="tbo__preco-linha">
      <p class="tbo__preco"><TopoPreco :valor="preco" /></p>
      <p class="tbo__dia">
        <template v-if="leitura">
          <span class="tbo__delta" :class="`tbo__delta--${leitura.dir}`">{{ leitura.medida ? `${leitura.delta} (${leitura.var})` : leitura.var }}</span>
          <span class="tbo__meta">{{ leitura.medida ? `de ${leitura.de} a ${leitura.data}` : `em ${leitura.data}, desde o início do período` }}</span>
        </template>
        <template v-else>
          <span v-if="a.hero.changeLine" class="tbo__delta" :class="`tbo__delta--${a.hero.dir}`">{{ a.hero.changeLine }}</span>
          <span v-if="a.hero.metaLine" class="tbo__meta">{{ a.hero.metaLine }}</span>
        </template>
      </p>
    </div>

    <div v-if="series" ref="palco" v-contexto-chat="contextoGrafico" class="tbo__palco">
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
        <AtivoGrafico :ativo="series.asset" :ibov="series.ibov" :ticker="t" :atual="a.hero.priceFmt" :rotulo="tituloGrafico" tom="luz" :carregando="rangeLoading" @leitura="leitura = $event" />
      </div>
      <div class="tbo__horizonte" aria-hidden="true" />
      <div class="tbo__periodo"><AtivoPeriodo :model-value="range" :disabled="rangeLoading" tom="escuro" class="tbo__seg" @update:model-value="emit('periodo', $event)" /></div>
      <p class="tbo__uso" aria-hidden="true">Passe o cursor para ler um dia; arraste para medir entre dois.</p>
    </div>

    <dl v-if="linhas.length" class="tbo__nums">
      <div v-for="r in linhas" :key="r.l" v-contexto-chat="{ id: `linha:${t}:${r.l}`, tipo: 'grafico', rotulo: rotuloComSobre(r.l, t), texto: `${r.l} (${t}): ${r.v}` }" class="tbo__num">
        <dt>{{ r.l }}</dt><dd>{{ r.v }}</dd>
      </div>
    </dl>
    <div class="tbo__pe">
      <AtivoPerguntaChips :perguntas="perguntas" tom="escuro" :rotulo="null" @perguntar="emit('perguntar', $event)" />
      <p v-if="a.simuladorHref" class="tbo__sim">
        <NuxtLink :to="a.simuladorHref" class="tbo__sim-l">Simulador de ações</NuxtLink>
        <span>Quanto {{ t }} teria rendido com dividendos reinvestidos, no histórico real da B3.</span>
      </p>
    </div>
  </section>
</template>

<style scoped src="./topo-noite.css"></style>

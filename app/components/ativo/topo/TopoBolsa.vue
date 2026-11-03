<script setup lang="ts">
// Topo do ativo, direção 1: "A bolsa no bolso" (?topo-ativo=1, 03/11/2026),
// o idioma do app Ações e da página do papel no app da Redentia (V4Ativo): tudo
// alinhado à margem esquerda, sem centralizar. Em cima, o papel e as ações em
// botões redondos; embaixo, o preço na fonte fina e grande, que acompanha a
// mira quando o dedo (ou o mouse) passa no gráfico, com a data e a variação
// desde o início do período no lugar do fechamento anterior. O gráfico vai de
// borda a borda e o período fica embaixo dele, num controle segmentado largo.
// O H1 é o mesmo de hoje, com o mesmo texto e o mesmo nível.
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
      <TopoAcoes :ticker="t" :seguivel="seguivel" tom="escuro" @perguntar="emit('abrir')" />
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

    <div v-if="series" v-contexto-chat="contextoGrafico" class="tbo__palco">
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

<style scoped>
.tbo {
  --g: clamp(16px, 4vw, 56px);
  position: relative; isolation: isolate; overflow: hidden; padding: clamp(24px, 3vw, 40px) var(--g) clamp(28px, 3vw, 44px);
  background: var(--nu-agora-bg); color: var(--nu-agora-texto);
}
.tbo__luz { position: absolute; inset: 0; z-index: -1; pointer-events: none; background: linear-gradient(180deg, var(--nu-navy) 0%, var(--nu-agora-bg) 70%); }
.tbo__trocou { margin: 0 0 12px; font-size: var(--nu-fs-sm); color: var(--nu-agora-sub); }
.tbo__linha1 { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px 24px; flex-wrap: wrap; }
.tbo__id { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; min-width: 0; }
.tbo__logo { width: 28px; height: 28px; border-radius: 50%; background: var(--nu-white); object-fit: cover; }
.tbo__empresa { margin: 0; display: flex; align-items: center; gap: 8px; font-size: var(--nu-fs-xl); font-weight: 700; letter-spacing: -0.02em; }
.tbo__bolsa { display: inline-flex; height: 22px; align-items: center; padding: 0 8px; border-radius: var(--nu-r-pill); box-shadow: inset 0 0 0 1px var(--nu-agora-linha); color: var(--nu-agora-sub); font-size: var(--nu-fs-xs); font-weight: 700; }
.tbo__h1 { margin: 2px 0 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 500; letter-spacing: 0; }
.tbo__posicao { padding: 4px 10px; border-radius: var(--nu-r-pill); background: var(--nu-agora-pilula); font-size: var(--nu-fs-xs); font-weight: 700; }

.tbo__preco-linha { margin-top: clamp(18px, 2.4vw, 28px); }
.tbo__preco { margin: 0; font-size: var(--nu-fs-hero); font-weight: 300; letter-spacing: -0.04em; line-height: 1; }
.tbo__dia { display: flex; align-items: baseline; gap: 4px 12px; flex-wrap: wrap; min-height: 26px; margin: 10px 0 0; font-variant-numeric: tabular-nums; }
.tbo__delta { font-size: var(--nu-fs-lg); font-weight: 700; }
.tbo__delta--up { color: var(--nu-green-soft); }
.tbo__delta--down { color: var(--nu-red-soft); }
.tbo__meta { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 500; }

.tbo__palco { margin-top: clamp(20px, 2.6vw, 32px); }
.tbo__palco-cab { display: flex; align-items: baseline; gap: 8px 20px; flex-wrap: wrap; }
.tbo__h2 { margin: 0; font-size: var(--nu-fs-md); font-weight: 600; color: var(--nu-agora-texto); }
.tbo__legenda { display: flex; gap: 4px 16px; flex-wrap: wrap; margin: 0; }
.tbo__leg { display: inline-flex; align-items: center; gap: 6px; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 600; }
.tbo__leg b { color: var(--nu-agora-texto); font-variant-numeric: tabular-nums; }
.tbo__leg b.tbo__leg--up { color: var(--nu-green-soft); }
.tbo__leg b.tbo__leg--down { color: var(--nu-red-soft); }
.tbo__traco { width: 14px; height: 2px; background: var(--nu-blue-soft); }
.tbo__traco--ibov { background: repeating-linear-gradient(90deg, var(--nu-white-35) 0 3px, transparent 3px 7px); }
/* de borda a borda: o gráfico sai da margem, como no app */
.tbo__grafico { position: relative; height: clamp(220px, 26vw, 360px); margin: 14px calc(var(--g) * -1) 0; }
.tbo__horizonte { height: 1px; margin: 0 calc(var(--g) * -1); background: linear-gradient(90deg, transparent, var(--nu-chat-luz-1) 30%, var(--nu-white-60) 50%, var(--nu-chat-luz-3) 70%, transparent); box-shadow: 0 0 18px 3px var(--nu-chat-luz-1); }
.tbo__periodo { display: flex; margin-top: 14px; }
.tbo__seg { width: 100%; max-width: 520px; }
.tbo__seg :deep(.ape__b) { flex: 1; }
.tbo__uso { margin: 8px 0 0; color: var(--nu-cream-text-50); font-size: var(--nu-fs-xs); }
@media (hover: none) { .tbo__uso { display: none; } }

.tbo__nums { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 160px), 1fr)); gap: 0 24px; margin: 24px 0 0; }
.tbo__num { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; padding: 10px 0; border-top: 1px solid var(--nu-agora-linha); }
.tbo__num dt { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 500; }
.tbo__num dd { margin: 0; font-size: var(--nu-fs-md); font-weight: 600; font-variant-numeric: tabular-nums; }
.tbo__pe { display: flex; justify-content: space-between; align-items: center; gap: 16px 32px; flex-wrap: wrap; margin-top: 20px; }
.tbo__sim { margin: 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); }
.tbo__sim-l { margin-right: 8px; color: var(--nu-agora-texto); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--nu-white-35); }
@media (max-width: 640px) {
  .tbo__linha1 { flex-direction: column; }
  .tbo__nums { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 16px; }
  .tbo__num { flex-direction: column; gap: 2px; }
}
</style>

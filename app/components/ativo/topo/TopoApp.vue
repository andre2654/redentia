<script setup lang="ts">
// Topo do ativo, direção 3: "O app no iPhone" (?topo-ativo=3, 03/11/2026). A
// página do papel do app da Redentia trazida para o site: uma barra de
// navegação com voltar, o ticker no meio e as ações em ícone à direita; o
// título grande embaixo (o H1, que ao rolar encolhe para a barra compacta que
// gruda junto com as seções); o preço na fonte fina, com o dia num chip; o
// gráfico de borda a borda da coluna; o período num controle segmentado da
// largura inteira; e os números em "widgets" numa fileira que rola de lado.
// No desktop, a mesma coluna de app, larga, alinhada à margem esquerda.
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
const preco = computed(() => leitura.value?.preco ?? props.a.hero.priceFmt)
// no desktop as marcas de preço saem para a margem; no celular o gráfico vai de borda a borda
const largo = ref(false)
onMounted(() => {
  const mq = window.matchMedia('(min-width: 900px)')
  largo.value = mq.matches
  mq.addEventListener('change', (e) => { largo.value = e.matches })
})
function voltar() {
  if (window.history.length > 1) window.history.back()
  else navigateTo('/')
}
</script>

<template>
  <section v-contexto-chat="contexto" class="tap" aria-labelledby="tap-h1">
    <div class="tap__luz" aria-hidden="true" />
    <div class="tap__coluna">
      <nav class="tap__nav" aria-label="Navegação do ativo">
        <NuxtLink to="/" class="tap__voltar" @click.prevent="voltar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
          Voltar
        </NuxtLink>
        <p class="tap__nav-t">{{ t }}</p>
        <TopoAcoes :ticker="t" :seguivel="seguivel" tom="escuro" compacto @perguntar="emit('abrir')" />
      </nav>

      <p v-if="renamedFrom" class="tap__trocou">{{ renamedFrom }} agora negocia como {{ t }}.</p>
      <h1 v-if="a.resumo" id="tap-h1" class="tap__h1">{{ a.resumo.h1 }}</h1>
      <p class="tap__empresa">{{ a.hero.companyLine }} · <span>{{ a.hero.exchangeLabel || 'B3' }}</span><template v-if="position"> · Na sua carteira · {{ nf0.format(position.qty) }} {{ position.qty === 1 ? 'cota' : 'cotas' }}</template></p>

      <p class="tap__preco"><TopoPreco :valor="preco" /></p>
      <p class="tap__dia">
        <template v-if="leitura">
          <span class="tap__chip" :class="`tap__chip--${leitura.dir}`">{{ leitura.medida ? `${leitura.delta} · ${leitura.var}` : leitura.var }}</span>
          <span class="tap__meta">{{ leitura.medida ? `de ${leitura.de} a ${leitura.data}` : `em ${leitura.data}, desde o início do período` }}</span>
        </template>
        <template v-else>
          <span v-if="a.hero.changeLine" class="tap__chip" :class="`tap__chip--${a.hero.dir}`">{{ a.hero.changeLine }}</span>
          <span v-if="a.hero.metaLine" class="tap__meta">{{ a.hero.metaLine }}</span>
        </template>
      </p>

      <div v-if="series" v-contexto-chat="contextoGrafico" class="tap__palco">
        <div class="tap__grafico">
          <AtivoGrafico :ativo="series.asset" :ibov="series.ibov" :ticker="t" :atual="a.hero.priceFmt" :rotulo="tituloGrafico" tom="luz" :carregando="rangeLoading" :marcas-fora="largo" @leitura="leitura = $event" />
        </div>
        <AtivoPeriodo :model-value="range" :disabled="rangeLoading" tom="escuro" class="tap__seg" @update:model-value="emit('periodo', $event)" />
        <div class="tap__palco-pe">
          <h2 class="tap__h2">{{ tituloGrafico }}</h2>
          <p v-if="legenda.length" class="tap__legenda">
            <span v-for="l in legenda" :key="l.rotulo">{{ l.rotulo }} <b :class="l.dir ? `tap__leg--${l.dir}` : ''">{{ l.pct }}</b></span>
          </p>
        </div>
        <p class="tap__uso" aria-hidden="true">Passe o cursor para ler um dia; arraste para medir entre dois.</p>
      </div>

      <dl v-if="linhas.length" class="tap__widgets">
        <div v-for="r in linhas" :key="r.l" v-contexto-chat="{ id: `linha:${t}:${r.l}`, tipo: 'grafico', rotulo: rotuloComSobre(r.l, t), texto: `${r.l} (${t}): ${r.v}` }" class="tap__w">
          <dt>{{ r.l }}</dt><dd>{{ r.v }}</dd>
        </div>
      </dl>
      <AtivoPerguntaChips :perguntas="perguntas" tom="escuro" :rotulo="null" class="tap__perg" @perguntar="emit('perguntar', $event)" />
      <p v-if="a.simuladorHref" class="tap__sim">
        <NuxtLink :to="a.simuladorHref" class="tap__sim-l">Simulador de ações</NuxtLink>
        <span>Quanto {{ t }} teria rendido com dividendos reinvestidos, no histórico real da B3.</span>
      </p>
    </div>
  </section>
</template>

<style scoped>
.tap {
  --g: clamp(16px, 4vw, 56px);
  position: relative; isolation: isolate; overflow: hidden; padding: 12px var(--g) clamp(28px, 3vw, 40px);
  background: var(--nu-agora-bg); color: var(--nu-agora-texto);
}
.tap__luz { position: absolute; inset: 0; z-index: -1; pointer-events: none; background: linear-gradient(180deg, var(--nu-navy) 0%, var(--nu-agora-bg) 60%); }
.tap__coluna { max-width: 1180px; }
.tap__nav { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; height: 52px; }
.tap__voltar { display: inline-flex; align-items: center; gap: 2px; justify-self: start; color: var(--nu-blue-soft); font-size: var(--nu-fs-md); font-weight: 600; transition: opacity .2s ease; }
.tap__voltar:hover { opacity: .75; color: var(--nu-blue-soft); }
.tap__nav-t { margin: 0; font-size: var(--nu-fs-md); font-weight: 700; }
/* como no iOS: o título pequeno da barra só aparece quando o grande sai (a barra compacta faz isso ao rolar) */
@media (max-width: 640px) { .tap__nav-t { visibility: hidden; } }
.tap__nav :deep(.tac) { justify-self: end; }
.tap__trocou { margin: 6px 0 0; font-size: var(--nu-fs-sm); color: var(--nu-agora-sub); }
/* o título grande do iOS: alinhado à esquerda, peso alto, tracking apertado */
.tap__h1 { margin: 10px 0 0; font-size: var(--nu-fs-h3); font-weight: 700; letter-spacing: -0.03em; line-height: 1.15; }
.tap__empresa { margin: 4px 0 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 500; }
.tap__preco { margin: 22px 0 0; font-size: var(--nu-fs-h2); font-weight: 300; letter-spacing: -0.04em; line-height: 1; }
.tap__dia { display: flex; align-items: center; gap: 6px 10px; flex-wrap: wrap; min-height: 28px; margin: 10px 0 0; font-variant-numeric: tabular-nums; }
.tap__chip { display: inline-flex; align-items: center; height: 26px; padding: 0 10px; border-radius: 8px; font-size: var(--nu-fs-sm); font-weight: 700; }
.tap__chip--up { background: var(--nu-green-soft-16); color: var(--nu-green-soft); }
.tap__chip--down { background: var(--nu-red-soft-16); color: var(--nu-red-soft); }
.tap__meta { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); }
.tap__palco { margin-top: 18px; }
.tap__grafico { position: relative; height: clamp(220px, 24vw, 300px); margin: 0 calc(var(--g) * -1); }
@media (min-width: 900px) { .tap__grafico { margin: 0 0 0 48px; } }
.tap__seg { display: flex; width: 100%; margin-top: 14px; }
.tap__seg :deep(.ape__b) { flex: 1; }
.tap__palco-pe { display: flex; align-items: baseline; justify-content: space-between; gap: 8px 16px; flex-wrap: wrap; margin-top: 12px; }
.tap__h2 { margin: 0; font-size: var(--nu-fs-sm); font-weight: 600; color: var(--nu-agora-sub); }
.tap__legenda { display: flex; gap: 12px; margin: 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 600; }
.tap__legenda b { color: var(--nu-agora-texto); font-variant-numeric: tabular-nums; }
.tap__legenda b.tap__leg--up { color: var(--nu-green-soft); }
.tap__legenda b.tap__leg--down { color: var(--nu-red-soft); }
.tap__uso { margin: 6px 0 0; color: var(--nu-cream-text-50); font-size: var(--nu-fs-xs); }
@media (hover: none) { .tap__uso { display: none; } }
/* os números em widgets, numa fileira que rola de lado (o scroll fica nela) */
.tap__widgets { display: flex; gap: 10px; margin: 20px calc(var(--g) * -1) 0; padding: 2px var(--g); overflow-x: auto; scrollbar-width: none; scroll-snap-type: x proximity; }
.tap__widgets::-webkit-scrollbar { display: none; }
.tap__w { flex: 0 0 auto; display: flex; flex-direction: column-reverse; gap: 4px; min-width: 132px; padding: 12px 14px; border-radius: var(--nu-r-tile); background: var(--nu-agora-cartao); box-shadow: inset 0 0 0 1px var(--nu-agora-linha); scroll-snap-align: start; transition: background .2s ease; }
.tap__w:hover { background: var(--nu-navy-2); }
.tap__w dt { color: var(--nu-agora-sub); font-size: var(--nu-fs-xs); font-weight: 600; }
.tap__w dd { margin: 0; font-size: var(--nu-fs-lg); font-weight: 600; font-variant-numeric: tabular-nums; }
.tap__perg { margin-top: 18px; }
.tap__sim { margin: 14px 0 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); }
.tap__sim-l { margin-right: 8px; color: var(--nu-agora-texto); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--nu-white-35); }
@media (prefers-reduced-motion: reduce) { .tap__w, .tap__voltar { transition: none; } }
</style>

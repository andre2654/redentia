<script setup lang="ts">
// Topo do ativo, direção 2: "A janela do Mac" (?topo-ativo=2, 03/11/2026). Duas
// colunas, como uma janela de app no desktop: à esquerda o papel, o preço que
// acompanha a mira e o gráfico grande com o período embaixo; à direita uma
// coluna fixa com as ações (botões redondos com rótulo), os números do papel
// em lista e as perguntas prontas. No celular a coluna desce para baixo do
// gráfico, que vai de borda a borda. Alinhado à margem, sem centralizar.
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
  <section v-contexto-chat="contexto" class="tpa" aria-labelledby="tpa-h1">
    <div class="tpa__luz" aria-hidden="true" />
    <div class="tpa__principal">
      <p v-if="renamedFrom" class="tpa__trocou">{{ renamedFrom }} agora negocia como {{ t }}.</p>
      <div class="tpa__id">
        <img v-if="a.hero.logo && !logoFalhou" :src="a.hero.logo" alt="" width="40" height="40" class="tpa__logo" @error="logoFalhou = true">
        <span v-else class="tpa__tile" aria-hidden="true">{{ t.charAt(0) }}</span>
        <div class="tpa__id-t">
          <p class="tpa__empresa">{{ a.hero.companyLine }} <span class="tpa__bolsa">{{ a.hero.exchangeLabel || 'B3' }}</span></p>
          <h1 v-if="a.resumo" id="tpa-h1" class="tpa__h1">{{ a.resumo.h1 }}</h1>
        </div>
      </div>
      <div class="tpa__preco-l">
        <p class="tpa__preco"><TopoPreco :valor="preco" /></p>
        <p class="tpa__dia">
          <template v-if="leitura">
            <span class="tpa__delta" :class="`tpa__delta--${leitura.dir}`">{{ leitura.medida ? `${leitura.delta} · ${leitura.var}` : leitura.var }}</span>
            <span class="tpa__meta">{{ leitura.medida ? `de ${leitura.de} a ${leitura.data}` : `em ${leitura.data}, desde o início do período` }}</span>
          </template>
          <template v-else>
            <span v-if="a.hero.changeLine" class="tpa__delta" :class="`tpa__delta--${a.hero.dir}`">{{ a.hero.changeLine }}</span>
            <span v-if="a.hero.metaLine" class="tpa__meta">{{ a.hero.metaLine }}</span>
          </template>
        </p>
        <span v-if="position" class="tpa__posicao">Na sua carteira · {{ nf0.format(position.qty) }} {{ position.qty === 1 ? 'cota' : 'cotas' }}</span>
      </div>

      <div v-if="series" v-contexto-chat="contextoGrafico" class="tpa__palco">
        <div class="tpa__palco-cab">
          <h2 class="tpa__h2">{{ tituloGrafico }}</h2>
          <p v-if="legenda.length" class="tpa__legenda">
            <span v-for="l in legenda" :key="l.rotulo" class="tpa__leg">{{ l.rotulo }} <b :class="l.dir ? `tpa__leg--${l.dir}` : ''">{{ l.pct }}</b></span>
          </p>
          <AtivoPeriodo :model-value="range" :disabled="rangeLoading" tom="escuro" @update:model-value="emit('periodo', $event)" />
        </div>
        <div class="tpa__grafico">
          <AtivoGrafico :ativo="series.asset" :ibov="series.ibov" :ticker="t" :atual="a.hero.priceFmt" :rotulo="tituloGrafico" tom="luz" :carregando="rangeLoading" marcas-fora @leitura="leitura = $event" />
        </div>
        <p class="tpa__uso" aria-hidden="true">Passe o cursor para ler um dia; arraste para medir entre dois.</p>
      </div>
    </div>

    <aside class="tpa__lado" aria-label="Ações e números">
      <TopoAcoes :ticker="t" :seguivel="seguivel" tom="escuro" class="tpa__acoes" @perguntar="emit('abrir')" />
      <dl v-if="linhas.length" class="tpa__nums">
        <div v-for="r in linhas" :key="r.l" v-contexto-chat="{ id: `linha:${t}:${r.l}`, tipo: 'grafico', rotulo: rotuloComSobre(r.l, t), texto: `${r.l} (${t}): ${r.v}` }" class="tpa__num">
          <dt>{{ r.l }}</dt><dd>{{ r.v }}</dd>
        </div>
      </dl>
      <p v-if="a.simuladorHref" class="tpa__sim">
        <NuxtLink :to="a.simuladorHref" class="tpa__sim-l">Simulador de ações</NuxtLink>
        <span>Quanto {{ t }} teria rendido com dividendos reinvestidos, no histórico real da B3.</span>
      </p>
      <AtivoPerguntaChips :perguntas="perguntas" tom="escuro" rotulo="Pergunte à Redentia" class="tpa__perg" @perguntar="emit('perguntar', $event)" />
    </aside>
  </section>
</template>

<style scoped>
.tpa {
  --g: clamp(16px, 4vw, 56px);
  position: relative; isolation: isolate; overflow: hidden; display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 0 clamp(24px, 3vw, 48px);
  padding: clamp(24px, 3vw, 40px) var(--g) clamp(28px, 3vw, 44px); background: var(--nu-agora-bg); color: var(--nu-agora-texto);
}
.tpa__luz { position: absolute; inset: 0; z-index: -1; pointer-events: none; background: radial-gradient(50% 50% at 30% 0%, color-mix(in srgb, var(--nu-blue) 14%, transparent), transparent), linear-gradient(180deg, var(--nu-navy) 0%, var(--nu-agora-bg) 75%); }
.tpa__principal { min-width: 0; }
.tpa__trocou { margin: 0 0 12px; font-size: var(--nu-fs-sm); color: var(--nu-agora-sub); }
.tpa__id { display: flex; align-items: center; gap: 14px; }
.tpa__logo, .tpa__tile { width: 40px; height: 40px; border-radius: 12px; background: var(--nu-white); object-fit: cover; flex-shrink: 0; }
.tpa__tile { display: grid; place-items: center; background: var(--nu-navy-2); color: var(--nu-agora-texto); font-weight: 800; box-shadow: inset 0 0 0 1px var(--nu-agora-linha); }
.tpa__id-t { min-width: 0; }
.tpa__empresa { margin: 0; display: flex; align-items: center; gap: 8px; font-size: var(--nu-fs-lg); font-weight: 700; }
.tpa__bolsa { display: inline-flex; height: 22px; align-items: center; padding: 0 8px; border-radius: var(--nu-r-pill); box-shadow: inset 0 0 0 1px var(--nu-agora-linha); color: var(--nu-agora-sub); font-size: var(--nu-fs-xs); font-weight: 700; }
.tpa__h1 { margin: 2px 0 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 500; }
.tpa__preco-l { margin-top: 20px; }
.tpa__preco { margin: 0; font-size: var(--nu-fs-hero); font-weight: 300; letter-spacing: -0.04em; line-height: 1; }
.tpa__dia { display: flex; align-items: baseline; gap: 4px 12px; flex-wrap: wrap; min-height: 26px; margin: 10px 0 0; font-variant-numeric: tabular-nums; }
.tpa__delta { font-size: var(--nu-fs-lg); font-weight: 700; }
.tpa__delta--up { color: var(--nu-green-soft); }
.tpa__delta--down { color: var(--nu-red-soft); }
.tpa__meta { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); }
.tpa__posicao { display: inline-flex; margin-top: 8px; padding: 4px 10px; border-radius: var(--nu-r-pill); background: var(--nu-agora-pilula); font-size: var(--nu-fs-xs); font-weight: 700; }
.tpa__palco { margin-top: 22px; }
.tpa__palco-cab { display: flex; align-items: center; gap: 8px 18px; flex-wrap: wrap; }
.tpa__h2 { margin: 0; font-size: var(--nu-fs-md); font-weight: 600; }
.tpa__legenda { display: flex; gap: 4px 14px; margin: 0 auto 0 0; }
.tpa__leg { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 600; }
.tpa__leg b { color: var(--nu-agora-texto); font-variant-numeric: tabular-nums; }
.tpa__leg b.tpa__leg--up { color: var(--nu-green-soft); }
.tpa__leg b.tpa__leg--down { color: var(--nu-red-soft); }
.tpa__grafico { position: relative; height: clamp(240px, 26vw, 360px); margin: 18px 0 0 48px; }
.tpa__uso { margin: 10px 0 0; color: var(--nu-cream-text-50); font-size: var(--nu-fs-xs); }
@media (hover: none) { .tpa__uso { display: none; } }

/* a coluna fixa: um plano de vidro só, sobre o céu */
.tpa__lado {
  align-self: start; display: flex; flex-direction: column; gap: 18px; padding: 20px; border-radius: var(--nu-r-panel);
  background: color-mix(in srgb, var(--nu-navy-2) 72%, transparent); box-shadow: inset 0 0 0 1px var(--nu-agora-linha), var(--nu-shadow-float);
  -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
}
.tpa__acoes { justify-content: space-between; }
.tpa__nums { margin: 0; }
.tpa__num { display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid var(--nu-agora-linha); }
.tpa__num dt { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); }
.tpa__num dd { margin: 0; font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.tpa__sim { margin: 0; color: var(--nu-agora-sub); font-size: var(--nu-fs-xs); line-height: 1.5; }
.tpa__sim-l { display: block; margin-bottom: 2px; color: var(--nu-agora-texto); font-size: var(--nu-fs-sm); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--nu-white-35); }
.tpa__perg :deep(.apc__lista) { flex-direction: column; align-items: stretch; }

@media (max-width: 1000px) {
  .tpa { grid-template-columns: minmax(0, 1fr); }
  .tpa__lado { margin-top: 24px; }
  .tpa__grafico { margin: 18px calc(var(--g) * -1) 0; }
  .tpa__grafico :deep(.agr--fora .agr__marca-t) { left: 8px; right: auto; top: auto; bottom: 3px; transform: none; }
}
</style>

<script setup lang="ts">
// O desempenho do relatório da /carteira nova (07/11/2026), no lugar do
// NuPortfolioChart. Aquele desenhava a curva do PATRIMÔNIO, e a legenda "Você
// +51%" em 12 meses contava os aportes como rendimento: a TWR do mesmo período
// era ~20%. Agora:
//  - a linha cheia é a rentabilidade da carteira (TWR, sem o efeito dos
//    aportes), a `series.carteira` do GET /me/carteira/relatorio; a
//    tracejada, o benchmark composto pelas classes dela (`series.benchmark`).
//    As duas saem de 100 no início do período e o que se lê é a distância;
//  - a legenda: Você (a TWR), o benchmark, e o CDI e o IBOV puros, sem traço
//    (não são desenhados), todos a partir do mesmo pregão;
//  - os períodos que a série cobre: 1M, 6M, 12M e, quando ela vai bem além
//    de 12 meses, "Tudo", que abre primeiro (é o período dos indicadores logo
//    acima: a TWR e o benchmark daqui são os mesmos de lá);
//  - a mira, a medida e o teclado são os do gráfico do /asset (AtivoGrafico,
//    em %).
// A resposta é a do relatório (useCarteiraRelatorio): quem abre a seção pede.
// Carregando, o esqueleto na forma da seção; com erro, a seção some (o
// relatório, logo acima, já diz que não abriu e oferece tentar de novo).
import type { CarteiraRelatorio } from '~/types/carteiraRelatorio'
import type { EstadoDoRelatorio } from '~/composables/useCarteiraRelatorio'
import {
  inicioDoPeriodo, legendaDoDesempenho, periodosDoDesempenho, rebase100, serieDesde, tituloDoDesempenho, variacaoDoIndice, type PeriodoDesempenho,
} from '~/utils/rentabilidadeCarteira'

const props = defineProps<{ relatorio: CarteiraRelatorio | null; estado: EstadoDoRelatorio }>()

const NOMES: Record<PeriodoDesempenho, [curto: string, longo: string]> = {
  '1mo': ['1M', '1 mês'], '6mo': ['6M', '6 meses'], '12mo': ['12M', '12 meses'], tudo: ['Tudo', 'todo o histórico do relatório'],
}
const series = computed(() => props.relatorio?.series ?? null)
const opcoes = computed<PeriodoDesempenho[]>(() => (series.value ? periodosDoDesempenho(series.value.carteira) : []))
const periodo = ref<PeriodoDesempenho>('tudo')
watch(opcoes, (o) => {
  if (o.length && !o.includes(periodo.value)) periodo.value = o[o.length - 1]!
}, { immediate: true })

/** o dia em que o período pedido começa */
const pedido = computed(() => (series.value ? inicioDoPeriodo(periodo.value, series.value.carteira) : ''))
const carteira = computed(() => (series.value ? rebase100(serieDesde(series.value.carteira, pedido.value)) : []))
const benchmark = computed(() => (series.value ? serieDesde(series.value.benchmark, pedido.value) : []))
/** o primeiro pregão da conta: todas as linhas da legenda medem dele */
const inicio = computed(() => carteira.value[0]?.t.slice(0, 10) ?? null)
const legenda = computed(() => (series.value && inicio.value ? legendaDoDesempenho(series.value, inicio.value) : []))
const titulo = computed(() => tituloDoDesempenho(periodo.value, pedido.value, inicio.value))
const twr = computed(() => variacaoDoIndice(carteira.value))
const atual = computed(() => (twr.value != null ? pctAtivo(twr.value) : ''))
const pronto = computed(() => props.estado === 'pronto' && carteira.value.length >= 2)

const contexto = computed(() => ({
  id: 'carteira:desempenho', tipo: 'grafico', rotulo: 'Desempenho da carteira',
  texto: [
    `${titulo.value} A rentabilidade da carteira (TWR, sem o efeito dos aportes) contra o benchmark composto pelas classes dela.`,
    ...legenda.value.map((l) => `${l.chave === 'carteira' ? 'Rentabilidade da carteira (TWR)' : l.chave === 'benchmark' ? 'Benchmark composto' : l.rotulo}: ${l.pct}`),
  ].join('\n'),
}))
</script>

<template>
  <section v-if="pronto" v-contexto-chat="contexto" class="vds" aria-labelledby="vds-titulo">
    <div class="vds__cab">
      <div class="vds__textos">
        <h2 id="vds-titulo" class="vds__titulo">{{ titulo }}</h2>
        <p class="vds__sub">A rentabilidade sem o efeito dos aportes (TWR), contra o benchmark das classes da sua carteira.</p>
      </div>
      <div v-if="opcoes.length > 1" class="vds__periodos" role="radiogroup" aria-label="Período do desempenho">
        <button
          v-for="p in opcoes" :key="p" type="button" role="radio" class="vds__periodo" :class="{ 'vds__periodo--on': periodo === p }"
          :aria-checked="periodo === p" :aria-label="NOMES[p][1]" @click="periodo = p"
        >{{ NOMES[p][0] }}</button>
      </div>
    </div>

    <!-- o traço diz qual linha o número descreve; o CDI e o IBOV não são desenhados -->
    <p class="vds__legenda">
      <span v-for="l in legenda" :key="l.chave" class="vds__leg">
        <i v-if="l.traco" class="vds__traco" :class="{ 'vds__traco--bench': l.traco === 'tracejado' }" aria-hidden="true" />
        <span class="vds__leg-r">{{ l.rotulo }}</span>
        <b class="vds__leg-v" :class="{ 'vds__leg-v--voce': l.chave === 'carteira' }">{{ l.pct }}</b>
      </span>
    </p>

    <div class="vds__grafico">
      <AtivoGrafico
        :ativo="carteira" :ibov="benchmark" ticker="Você" rotulo-hoje="Você no período" :atual="atual"
        unidade="%" comparacao="Benchmark" tom="escuro" :rotulo="titulo"
      />
    </div>
  </section>

  <!-- carregando: o esqueleto na forma da seção -->
  <section v-else-if="estado === 'carregando' || estado === 'fechado'" class="vds vds--esq" aria-hidden="true">
    <NuSkeleton tone="navy" width="min(460px, 80%)" height="48px" radius="chip" />
    <NuSkeleton tone="navy" width="min(580px, 92%)" height="18px" radius="chip" class="vds__esq-sub" />
    <div class="vds__esq-leg">
      <NuSkeleton v-for="i in 4" :key="i" tone="navy" width="104px" height="26px" radius="pill" />
    </div>
    <NuSkeleton tone="navy" height="clamp(240px, 30vw, 380px)" radius="card" class="vds__esq-graf" />
  </section>
</template>

<style scoped>
/* o mesmo bloco navy do desempenho de antes (NuPortfolioChart), com o gráfico do /asset por dentro */
.vds {
  background: var(--nu-ink);
  padding: var(--cvi-v, clamp(64px, 7vw, 100px)) var(--cvi-g, clamp(20px, 5.5vw, 80px));
  animation: nu-fade .5s ease both;
}
.vds__cab { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px 22px; flex-wrap: wrap; }
.vds__textos { min-width: 0; max-width: 760px; }
.vds__titulo {
  margin: 0; color: var(--nu-white); font-size: var(--nu-fs-h2);
  font-weight: 800; letter-spacing: -0.03em; line-height: 1.02; text-wrap: balance;
}
.vds__sub { margin: 16px 0 0; color: var(--nu-on-dark); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.5; }
.vds__periodos { display: flex; gap: 4px; flex-shrink: 0; padding: 4px; border-radius: var(--nu-r-pill); background: var(--nu-dark-chip); }
.vds__periodo {
  min-height: 44px; padding: 0 18px; border-radius: var(--nu-r-pill); border: none; background: transparent;
  color: var(--nu-on-dark); font: inherit; font-size: 15px; font-weight: 700; cursor: pointer;
  transition: color .2s, background .2s;
}
.vds__periodo:hover { color: var(--nu-white); }
.vds__periodo:focus-visible { outline-color: var(--nu-blue-on-dark); }
.vds__periodo--on, .vds__periodo--on:hover { background: var(--nu-creme); color: var(--nu-ink); }

.vds__legenda { display: flex; align-items: baseline; flex-wrap: wrap; gap: 10px 26px; margin: 24px 0 0; }
.vds__leg { display: inline-flex; align-items: center; gap: 9px; }
.vds__traco { align-self: center; width: 16px; height: 3px; border-radius: 2px; background: var(--nu-blue-on-dark); }
.vds__traco--bench { height: 2px; background: repeating-linear-gradient(90deg, var(--nu-on-dark-2) 0 3px, transparent 3px 7px); }
.vds__leg-r { color: var(--nu-on-dark-2); font-size: var(--nu-fs-md); font-weight: 700; }
.vds__leg-v { color: var(--nu-white); font-size: var(--nu-fs-2xl); font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.vds__leg-v--voce { color: var(--nu-blue-on-dark); }

/* a caixa do gráfico: as marcas ('+10%') moram na faixa da esquerda, fora da
   linha, e o ponto de hoje cabe inteiro (recuo à direita) */
.vds__grafico { position: relative; height: clamp(240px, 30vw, 380px); margin-top: 30px; --agr-esq: 48px; --agr-dir: 8px; }

.vds--esq { display: flex; flex-direction: column; gap: 12px; }
.vds__esq-sub { margin-top: 4px; }
.vds__esq-leg { display: flex; flex-wrap: wrap; gap: 12px 20px; margin-top: 14px; }
.vds__esq-graf { margin-top: 18px; }

@media (max-width: 640px) {
  .vds__grafico { --agr-esq: 40px; }
  .vds__legenda { gap: 8px 20px; }
  .vds__leg-v { font-size: var(--nu-fs-xl); }
  .vds__periodo { padding: 0 14px; }
}
@media (prefers-reduced-motion: reduce) {
  .vds { animation: none; }
  .vds__periodo { transition: none; }
}
</style>

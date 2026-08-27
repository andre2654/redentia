<script setup lang="ts">
// PROTÓTIPO /simulacao — "Por que sangra junto" (dono 25/08, redesenho 27/08):
// a matriz triangular saiu. Leigo não decifra grade de 28 números sem unidade
// nem legenda — e verde/vermelho ali brigava com o verde de "subiu" do resto
// do app. No lugar: o grau de parentesco como número-herói, a LISTA ORDENADA
// dos pares que mais andam colados (só os que importam) + o contrapeso da
// carteira, na mesma gramática de linha do SimPositionsImpact. Escala de cor
// agora é de RISCO, não de alta/baixa: vermelho = colado, âmbar = parecido,
// azul = se defende.
// Dados seguem os MESMOS loadings do motor; see-through dos ETFs preservado.
// No real: matriz de correlação da plataforma + cda_fie da CVM.
import type { SimCorrelationOut, SimSeeThroughItem } from './simMock'

const props = defineProps<{ corr: SimCorrelationOut; seeThrough: SimSeeThroughItem[]; active: boolean }>()

interface SimPair { a: string; b: string; v: number }

/** todos os pares (i>j do triângulo), do mais colado ao mais independente */
const pairs = computed<SimPair[]>(() => {
  const t = props.corr.tickers
  const out: SimPair[] = []
  for (let i = 0; i < t.length; i++) {
    for (let j = 0; j < i; j++) out.push({ a: t[i]!, b: t[j]!, v: props.corr.matrix[i]![j]! })
  }
  return out.sort((x, y) => y.v - x.v)
})
const TOP = 5
const top = computed(() => pairs.value.slice(0, TOP))
/** o contrapeso: o par que menos anda junto — só faz sentido se sobrou par fora do topo */
const guard = computed(() => (pairs.value.length > TOP ? pairs.value.at(-1)! : null))

type Tone = 'hi' | 'mid' | 'lo'
/** escala de RISCO (não de alta/baixa): colado → parecido → se defende */
const toneOf = (v: number): Tone => (v >= 70 ? 'hi' : v >= 45 ? 'mid' : 'lo')

const heroTone = computed(() => (props.corr.avgPct >= 65 ? 'hi' : props.corr.avgPct >= 45 ? 'mid' : 'lo'))
const heroTag = computed(() =>
  heroTone.value === 'hi' ? 'Sangra junto' : heroTone.value === 'mid' ? 'Diversificação moderada' : 'Boa diversificação',
)
const heroLine = computed(() =>
  heroTone.value === 'hi'
    ? 'Em queda, isso se move como um ativo só: o que derruba uma posição derruba as outras no mesmo dia.'
    : heroTone.value === 'mid'
      ? 'Parte da carteira cai junta e parte segura o baque — o parentesco está concentrado nos pares abaixo.'
      : 'Na média, as posições caem em momentos diferentes. O parentesco que sobra está nos pares abaixo.',
)
const fmt1 = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
</script>

<template>
  <div class="sco">
    <!-- o número-herói: grau de parentesco, em hierarquia vertical -->
    <div class="sco__hero" :class="{ 'sco__hero--in': active }">
      <span class="sco__hero-label">Grau de parentesco da carteira</span>
      <div class="sco__hero-row">
        <span class="sco__hero-value">{{ corr.avgPct }}<i class="sco__hero-unit">/100</i></span>
        <span class="sco__hero-tag" :class="`sco__tag--${heroTone}`">{{ heroTag }}</span>
      </div>
      <p class="sco__hero-line">{{ heroLine }}</p>
    </div>

    <div class="sco__grid">
      <!-- os pares que importam: leitura ordenada, não grade -->
      <div class="sco__panel">
        <span class="sco__panel-label">Os pares que mais andam colados</span>

        <div class="sco__list">
          <div
            v-for="(p, i) in top" :key="p.a + p.b"
            class="sco__row" :class="{ 'sco__row--in': active }"
            :style="{ transitionDelay: active ? `${i * 60}ms` : '0ms' }"
          >
            <span class="sco__who">
              <b class="sco__tk">{{ p.a }}</b>
              <i class="sco__x" aria-hidden="true">×</i>
              <b class="sco__tk">{{ p.b }}</b>
            </span>
            <span class="sco__track">
              <i
                class="sco__fill" :class="`sco__fill--${toneOf(p.v)}`"
                :style="{ width: active ? `${p.v}%` : '0%', transitionDelay: `${120 + i * 60}ms` }"
              />
            </span>
            <span class="sco__val" :class="`sco__val--${toneOf(p.v)}`">{{ p.v }}</span>
          </div>
        </div>

        <!-- o outro lado da pergunta: o par que se defende -->
        <div v-if="guard" class="sco__row sco__row--guard" :class="{ 'sco__row--in': active }">
          <span class="sco__who">
            <b class="sco__tk">{{ guard.a }}</b>
            <i class="sco__x" aria-hidden="true">×</i>
            <b class="sco__tk">{{ guard.b }}</b>
            <em class="sco__note">o contrapeso da carteira</em>
          </span>
          <span class="sco__track">
            <i
              class="sco__fill sco__fill--lo"
              :style="{ width: active ? `${guard.v}%` : '0%', transitionDelay: `${120 + TOP * 60}ms` }"
            />
          </span>
          <span class="sco__val sco__val--lo">{{ guard.v }}</span>
        </div>

        <p class="sco__legend">
          <span><i class="sco__dot sco__dot--lo" />0 a 44 · se defendem</span>
          <span><i class="sco__dot sco__dot--mid" />45 a 69 · andam parecido</span>
          <span><i class="sco__dot sco__dot--hi" />70 a 100 · praticamente o mesmo ativo</span>
        </p>
      </div>

      <!-- see-through: a exposição REAL, direta + dentro do ETF -->
      <div v-if="seeThrough.length" class="sco__panel sco__panel--through">
        <span class="sco__panel-label">Exposição real, somando o que está dentro dos ETFs</span>
        <div v-for="it in seeThrough" :key="it.code" class="sco__th-item">
          <div class="sco__th-head">
            <b class="sco__th-name">{{ it.name }}</b>
            <b class="sco__th-total">{{ fmt1(it.totalPct) }}%</b>
          </div>
          <div class="sco__th-bar" aria-hidden="true">
            <i v-if="it.directPct" class="sco__th-fill sco__th-fill--direct" :style="{ width: `${Math.min(100, it.directPct * 6)}%` }" />
            <i v-for="v in it.viaEtf" :key="v.etf" class="sco__th-fill sco__th-fill--etf" :style="{ width: `${Math.min(100, v.pct * 6)}%` }" />
          </div>
          <span class="sco__th-sub">
            <template v-if="it.directPct">{{ fmt1(it.directPct) }}% direto ({{ it.directVia }})</template>
            <template v-for="v in it.viaEtf" :key="v.etf">{{ it.directPct || v !== it.viaEtf[0] ? ' + ' : '' }}{{ fmt1(v.pct) }}% dentro do {{ v.etf }}</template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ——— número-herói: uma coisa embaixo da outra, sem três tamanhos na mesma linha ——— */
.sco__hero {
  margin-bottom: 26px;
  opacity: 0; transform: translateY(10px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.sco__hero--in { opacity: 1; transform: none; }
.sco__hero-label { display: block; color: var(--nu-gray); font-size: 13px; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase; }
.sco__hero-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 6px; }
.sco__hero-value {
  color: var(--nu-ink);
  font-size: clamp(46px, 6vw, 76px); font-weight: 800; letter-spacing: -0.045em; line-height: 1;
  font-variant-numeric: tabular-nums;
}
.sco__hero-unit { color: var(--nu-sand); font-size: 0.36em; font-style: normal; font-weight: 800; letter-spacing: -0.02em; }
.sco__hero-tag {
  padding: 7px 14px; border-radius: var(--nu-r-pill);
  font-size: 13px; font-weight: 800; letter-spacing: 0.01em; white-space: nowrap;
}
.sco__tag--hi { background: var(--nu-red-tint); color: var(--nu-red-2); }
.sco__tag--mid { background: var(--nu-amber-bg); color: var(--nu-amber-text); }
.sco__tag--lo { background: var(--nu-blue-tint); color: var(--nu-blue); }
.sco__hero-line { max-width: 56ch; margin: 10px 0 0; color: var(--nu-gray-2); font-size: 15px; font-weight: 600; line-height: 1.45; }

/* ——— dois painéis do MESMO material: creme sobre a banda branca ——— */
.sco__grid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(300px, 1fr); gap: 20px; align-items: start; }
.sco__panel {
  display: flex; flex-direction: column;
  background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 20px 22px 18px;
}
.sco__panel--through { gap: 16px; }
.sco__panel-label { color: var(--nu-gray); font-size: 11.5px; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase; }

/* ——— a lista ordenada de pares ——— */
.sco__list { display: flex; flex-direction: column; margin-top: 4px; }
.sco__row {
  display: grid; grid-template-columns: minmax(150px, 210px) minmax(0, 1fr) 44px;
  gap: 16px; align-items: center;
  padding: 12px 0; border-bottom: 1px solid var(--nu-cream-line);
  opacity: 0; transform: translateY(8px);
  transition: opacity 0.45s ease, transform 0.45s ease;
}
.sco__list .sco__row:last-child { border-bottom: none; }
.sco__row--in { opacity: 1; transform: none; }
.sco__row--guard { margin-top: 10px; padding-top: 14px; border-top: 1px dashed var(--nu-sand-3); border-bottom: none; }

.sco__who { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; min-width: 0; }
.sco__tk { color: var(--nu-ink); font-size: 14px; font-weight: 800; letter-spacing: 0.01em; }
.sco__x { color: var(--nu-sand); font-size: 13px; font-style: normal; font-weight: 800; }
.sco__note { color: var(--nu-gray); font-size: 12px; font-weight: 700; font-style: normal; }

.sco__track { position: relative; height: 10px; border-radius: 999px; background: var(--nu-cream-3); overflow: hidden; }
.sco__fill {
  position: absolute; left: 0; top: 0; bottom: 0; border-radius: 999px;
  transition: width 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.sco__fill--hi { background: var(--nu-red); }
.sco__fill--mid { background: var(--nu-amber-fill); }
.sco__fill--lo { background: var(--nu-blue-soft); }

.sco__val { text-align: right; font-size: 17px; font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.sco__val--hi { color: var(--nu-red); }
.sco__val--mid { color: var(--nu-amber-text); }
.sco__val--lo { color: var(--nu-gray-2); }

/* a escala, dita uma vez — o que a matriz nunca dizia */
.sco__legend {
  display: flex; flex-wrap: wrap; gap: 6px 16px;
  margin: 14px 0 0; padding-top: 12px; border-top: 1px solid var(--nu-cream-line);
  color: var(--nu-gray); font-size: 11.5px; font-weight: 700; font-variant-numeric: tabular-nums;
}
.sco__legend span { display: inline-flex; align-items: center; gap: 6px; }
.sco__dot { width: 8px; height: 8px; border-radius: 999px; }
.sco__dot--hi { background: var(--nu-red); }
.sco__dot--mid { background: var(--nu-amber-fill); }
.sco__dot--lo { background: var(--nu-blue-soft); }

/* ——— see-through (preservado) ——— */
.sco__th-item { display: flex; flex-direction: column; gap: 5px; }
.sco__th-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.sco__th-name { color: var(--nu-ink); font-size: 14.5px; font-weight: 800; }
.sco__th-total { color: var(--nu-ink); font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; }
.sco__th-bar { display: flex; gap: 2px; height: 9px; border-radius: 999px; overflow: hidden; background: var(--nu-cream-3); }
.sco__th-fill { display: block; height: 100%; }
.sco__th-fill--direct { background: var(--nu-blue); }
.sco__th-fill--etf { background: var(--nu-blue-soft); }
.sco__th-sub { color: var(--nu-gray); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }

@media (max-width: 900px) { .sco__grid { grid-template-columns: 1fr; } }
@media (max-width: 760px) {
  .sco__panel { padding: 18px 16px 16px; }
  .sco__row { grid-template-columns: minmax(0, 1fr) 44px; gap: 8px 12px; }
  .sco__track { grid-column: 1 / -1; order: 3; }
  .sco__val { font-size: 16px; }
}
</style>

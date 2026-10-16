<script setup lang="ts">
// Topo do /benchmark-ia em faixa navy (dono, 16/10, depois da call com o
// Matheus: "mais cor e impacto" para quem chega pelo X, sem sair da
// identidade). Faixa de largura inteira, com o navy do NuPerformanceChart da
// tese e um brilho azul no canto. Título, linha de apoio e data vêm pelo slot; embaixo, até três
// números da edição em cartões que levam à seção de cada um.
// Movimento: quando o painel entra na tela, os números contam do zero até o
// valor, em cadeia (é o efeito de "números mudando" que o post do X pede, com
// o dado de verdade). No SSR, sem JS, com movimento reduzido ou na impressão,
// o número já sai pronto.
// O orbe é o mesmo da /simulacao (SimOrb, dono 16/10: "acho que vai ficar
// legal"): no largo, grande à direita e cortado pela borda da faixa; no
// estreito, pequeno acima do título, para nunca ficar atrás do texto. Os
// cartões dos números viram vidro (navy translúcido com desfoque) para ler bem
// mesmo quando passam por cima dele.
import type { BenchHeroStat } from '~/types/benchmark'

const props = defineProps<{ stats: BenchHeroStat[] }>()
const emit = defineEmits<{ (e: 'go', id: string): void }>()

const { el, state, revealClass } = useReveal(0.3)
const shown = ref(props.stats.map((s) => s.value))
const fmt = (s: BenchHeroStat, v: number) => (s.format === 'pct' ? fmtBench.pct(v) : fmtBench.int(Math.round(v)))
const DUR = 900
const STEP = 120
let raf = 0
watch(state, (st) => {
  cancelAnimationFrame(raf)
  // recolhido, o cartão está invisível (CSS): o número só zera quando a contagem
  // começa, para nunca ficar "0" na tela se o navegador segurar a animação
  if (st !== 'in') { shown.value = props.stats.map((s) => s.value); return }
  const t0 = performance.now()
  const total = DUR + STEP * props.stats.length
  const tick = (t: number) => {
    shown.value = props.stats.map((s, i) => {
      const p = Math.min(1, Math.max(0, (t - t0 - i * STEP) / DUR))
      return s.value * (1 - Math.pow(1 - p, 3))
    })
    if (t - t0 < total) raf = requestAnimationFrame(tick)
    else shown.value = props.stats.map((s) => s.value)
  }
  raf = requestAnimationFrame(tick)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <header ref="el" class="bhe" :class="revealClass">
    <div class="bhe__in">
    <div class="bhe__orb" aria-hidden="true"><SimOrb :size="440" /></div>
    <div class="bhe__text"><slot /></div>
    <div v-if="stats.length" class="bhe__stats">
      <a
        v-for="(s, i) in stats" :key="s.id" :href="`#${s.id}`" class="bhe__stat" :style="{ '--i': i }"
        :aria-label="`${fmt(s, s.value)} ${s.label}. Ver o índice.`" @click.prevent="emit('go', s.id)"
      >
        <span class="bhe__num" aria-hidden="true"><i class="bhe__dot" :class="`bhe__dot--${s.tone}`" />{{ fmt(s, shown[i] ?? s.value) }}</span>
        <span class="bhe__label" aria-hidden="true">{{ s.label }}</span>
        <span class="bhe__go" aria-hidden="true">Ver o índice
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </span>
      </a>
    </div>
    </div>
  </header>
</template>

<style scoped>
/* faixa navy de largura inteira, como o topo das outras páginas da casa */
.bhe {
  position: relative; overflow: hidden;
  padding: clamp(48px, 6.5vw, 88px) clamp(22px, 5.5vw, 80px);
  background: radial-gradient(90% 120% at 100% 0%, var(--nu-blue-28) 0%, transparent 55%), var(--nu-navy);
  color: var(--nu-cream-text);
}
.bhe__in { position: relative; max-width: 1240px; margin: 0 auto; container-type: inline-size; }
.bhe__text { position: relative; z-index: 1; max-width: 80ch; }

/* orbe: tamanho fluido sobrepondo o px do SimOrb (que escala tudo por --u) */
.bhe__orb {
  --os: clamp(300px, 34vw, 460px);
  position: absolute; z-index: 0; pointer-events: none;
  right: calc(var(--os) * -0.22); top: 50%; translate: 0 -50%;
}
.bhe__orb :deep(.orb) { width: var(--os) !important; height: var(--os) !important; --u: calc(var(--os) / 10) !important; }

.bhe__stats {
  position: relative; z-index: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;
  margin-top: clamp(22px, 3vw, 32px);
}
.bhe__stat {
  display: flex; flex-direction: column; gap: 6px; padding: 16px 18px; border-radius: var(--nu-r-tile);
  background: color-mix(in srgb, var(--nu-navy-2) 72%, transparent); border: 1px solid var(--nu-cream-text-12);
  -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
  color: inherit; text-decoration: none;
  transition: background .2s, border-color .2s, transform .2s;
}
.bhe__stat:hover { background: color-mix(in srgb, var(--nu-navy-2) 86%, transparent); border-color: var(--nu-cream-text-22); transform: translateY(-2px); }
.bhe__stat:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }
.bhe__num {
  display: inline-flex; align-items: center; gap: 10px;
  color: var(--nu-cream-text); font-size: var(--nu-fs-h3); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05;
  font-variant-numeric: tabular-nums;
}
.bhe__dot { flex-shrink: 0; width: 10px; height: 10px; border-radius: 50%; }
.bhe__dot--bad { background: var(--nu-red); box-shadow: 0 0 0 4px var(--nu-cream-text-08); }
.bhe__dot--good { background: var(--nu-blue-soft); box-shadow: 0 0 0 4px var(--nu-cream-text-08); }
.bhe__label { color: var(--nu-cream-text-70); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45; }
.bhe__go {
  display: inline-flex; align-items: center; gap: 4px; margin-top: 2px;
  color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 700; transition: color .2s;
}
.bhe__go svg { width: 14px; height: 14px; transition: transform .2s; }
.bhe__stat:hover .bhe__go { color: var(--nu-cream-text); }
.bhe__stat:hover .bhe__go svg { transform: translateX(2px); }

/* ——— entrada: os cartões sobem em cadeia enquanto os números contam ——— */
.is-pending .bhe__stat { opacity: 0; transform: translateY(8px); }
.is-in .bhe__stat { animation: bhe-in .5s cubic-bezier(.2, .8, .2, 1) backwards; animation-delay: calc(var(--i) * 120ms); }
@keyframes bhe-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

/* estreito: o orbe sai de trás do texto e sobe para cima do título, pequeno */
@container (max-width: 760px) {
  .bhe__orb { --os: 120px; position: relative; right: auto; top: auto; translate: none; margin: 0 0 22px; width: var(--os); height: var(--os); }
}

@container (max-width: 520px) {
  .bhe__stats { grid-template-columns: minmax(0, 1fr); gap: 8px; }
  .bhe__stat { display: grid; grid-template-columns: auto minmax(0, 1fr); grid-template-areas: 'num label' 'num go'; gap: 2px 14px; align-items: center; padding: 14px 16px; }
  .bhe__num { grid-area: num; font-size: var(--nu-fs-2xl); }
  .bhe__label { grid-area: label; }
  .bhe__go { grid-area: go; margin: 0; }
}

/* no papel o painel continua navy: sem isso o navegador tira o fundo e o texto creme some */
@media print {
  .bhe { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
</style>

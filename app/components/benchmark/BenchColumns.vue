<script setup lang="ts">
// Colunas do /benchmark-ia na linguagem de gráfico da Redentia (NuDividendBars:
// blocos de cantos arredondados em --nu-bar-inactive, o líder em azul, valor
// em 800 em cima, nome embaixo, nota de rodapé, sem grade nem eixo).
//
// Empate técnico (revisão de UX, 16/10): a posição vem do item (`rank`, a
// mesma regra da lista e do método: 1 + nº de modelos estatisticamente
// melhores), nunca da ordem da barra. Quem divide o 1º lugar fica TODO em azul,
// e uma frase em cima diz quantos estão empatados na frente. O traço sobre
// cada coluna é a margem de erro de 95%, para o empate se ver sem hover.
//
// Movimento (dono, 15/10): as barras crescem do chão em cadeia quando o
// gráfico entra na tela (useReveal) e valor e margem aparecem depois; no hover
// a barra sobe 2px, as outras recuam e um cartão branco mostra nota e margem.
// A barra é proporcional ao valor de verdade (0 a max), nunca eixo cortado.
// Zero no meio quando há negativo. `best: 'min'` quando menor é melhor.
// Estreito (< 640px): vira barras deitadas, uma linha por modelo, com nome,
// posição e valor sempre visíveis (dez colunas sem nome não diziam nada).
// `highlight` acende uma coluna de fora, como se o mouse estivesse nela: a
// lista abaixo do gráfico faz isso (dono, 16/10), e o hover na coluna avisa a
// lista por `hover`.
import type { BenchColumnItem } from '~/types/benchmark'

const props = withDefaults(defineProps<{
  items: BenchColumnItem[]
  min?: number
  max?: number
  format?: (v: number) => string
  best?: 'max' | 'min'
  footnote?: string
  highlight?: string | null
}>(), { min: 0, max: 100, format: undefined, best: 'max', footnote: undefined, highlight: null })
const emit = defineEmits<{ (e: 'hover', id: string | null): void }>()

const { el, revealClass } = useReveal()
const fmt = (v: number) => (props.format ?? fmtBench.one)(v)
const y = (v: number) => ((Math.min(props.max, Math.max(props.min, v)) - props.min) / (props.max - props.min)) * 100
const zero = computed(() => y(Math.max(props.min, Math.min(props.max, 0))))
const span = (v: number) => ({ a: Math.min(zero.value, y(v)), b: Math.max(zero.value, y(v)) })
const bar = (v: number, i: number) => {
  const { a, b } = span(v)
  return { bottom: `${a}%`, height: `max(18px, ${b - a}%)`, '--i': i, transformOrigin: v < 0 ? 'top' : 'bottom' }
}
const hasCi = (it: BenchColumnItem) => it.lo != null && it.hi != null && it.hi > it.lo
const ci = (it: BenchColumnItem, i: number) => ({ bottom: `${y(it.lo!)}%`, height: `${y(it.hi!) - y(it.lo!)}%`, '--i': i })
// valor e cartão ficam acima do que estiver mais alto: a barra ou o fim da margem
const top = (it: BenchColumnItem) => Math.max(y(it.value), hasCi(it) ? y(it.hi!) : 0, zero.value)

const rankOf = (it: BenchColumnItem, i: number) => it.rank ?? i + 1
const ranked = computed(() => props.items.some((i) => i.rank != null))
const leaders = computed(() => {
  if (ranked.value) return props.items.filter((i) => i.rank === 1).map((i) => i.id)
  const vals = props.items.map((i) => i.value)
  const target = props.best === 'min' ? Math.min(...vals) : Math.max(...vals)
  const best = props.items.find((i) => i.value === target)
  return best ? [best.id] : []
})
const isLead = (id: string) => leaders.value.includes(id)
const leadText = computed(() => {
  if (!ranked.value || !leaders.value.length) return ''
  if (leaders.value.length > 1) return `${leaders.value.length} empatados na frente. Dentro do grupo, a ordem não é significativa.`
  return `${props.items.find((i) => i.id === leaders.value[0])?.label} na frente, fora do empate técnico.`
})
const label = (it: BenchColumnItem, i: number) =>
  `${rankOf(it, i)}º${it.tied ? ', empate técnico,' : ''} ${it.label}: ${fmt(it.value)}${hasCi(it) ? `, margem de ${fmt(it.lo!)} a ${fmt(it.hi!)}` : ''}`

// barras deitadas (estreito): mesma escala, da esquerda
const hbar = (v: number) => {
  const { a, b } = span(v)
  return { left: `${a}%`, width: `max(10px, ${b - a}%)` }
}
const hci = (it: BenchColumnItem) => ({ left: `${y(it.lo!)}%`, width: `${y(it.hi!) - y(it.lo!)}%` })
</script>

<template>
  <div ref="el" class="bcl" :class="revealClass">
    <p v-if="leadText" class="bcl__lead"><i class="bcl__key" aria-hidden="true" />{{ leadText }}</p>

    <div class="bcl__plot" :class="{ 'bcl__plot--hl': !!highlight }" role="list">
      <span v-if="min < 0" class="bcl__zero" :style="{ bottom: `${zero}%` }" />
      <div
        v-for="(it, i) in items" :key="it.id" class="bcl__col" role="listitem" tabindex="0"
        :class="{ 'bcl__col--lead': isLead(it.id), 'bcl__col--hl': it.id === highlight }" :aria-label="label(it, i)"
        @mouseenter="emit('hover', it.id)" @mouseleave="emit('hover', null)" @focus="emit('hover', it.id)" @blur="emit('hover', null)"
      >
        <span class="bcl__bar" :class="{ 'bcl__bar--neg': it.value < 0 }" :style="bar(it.value, i)" />
        <span v-if="hasCi(it)" class="bcl__ci" :style="ci(it, i)" aria-hidden="true" />
        <span class="bcl__val" :style="{ bottom: `calc(${top(it)}% + 8px)`, '--i': i }" aria-hidden="true">{{ fmt(it.value) }}</span>
        <span class="bcl__tip" role="tooltip" :style="{ bottom: `calc(${top(it)}% + 30px)` }">
          <span class="bcl__tip-rank">{{ rankOf(it, i) }}º lugar<template v-if="it.tied"> · empate</template></span>
          <span class="bcl__tip-name">{{ it.label }}</span>
          <span class="bcl__tip-val">{{ fmt(it.value) }}</span>
          <span v-if="hasCi(it)" class="bcl__tip-ci">de {{ fmt(it.lo!) }} a {{ fmt(it.hi!) }} (95%)</span>
        </span>
      </div>
    </div>
    <div class="bcl__labels" aria-hidden="true">
      <span v-for="it in items" :key="it.id" class="bcl__lbl" :class="{ 'bcl__lbl--lead': isLead(it.id) }">{{ it.label }}</span>
    </div>

    <ol class="bcl__rows">
      <li
        v-for="(it, i) in items" :key="it.id" class="bcl__row" :class="{ 'bcl__row--lead': isLead(it.id), 'bcl__row--hl': it.id === highlight }"
        :style="{ '--i': i }" :aria-label="label(it, i)"
      >
        <span class="bcl__row-pos" aria-hidden="true">{{ rankOf(it, i) }}º</span>
        <span class="bcl__row-name" aria-hidden="true">{{ it.label }}</span>
        <span class="bcl__row-val" aria-hidden="true">{{ fmt(it.value) }}</span>
        <span class="bcl__row-track" aria-hidden="true">
          <span class="bcl__row-bar" :style="hbar(it.value)" />
          <span v-if="hasCi(it)" class="bcl__row-ci" :style="hci(it)" />
        </span>
      </li>
    </ol>
    <p v-if="footnote" class="bcl__foot">{{ footnote }}</p>
  </div>
</template>

<style scoped>
.bcl { container-type: inline-size; }
.bcl__lead {
  display: flex; align-items: flex-start; gap: 10px; margin: 0;
  color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; line-height: 1.4;
}
.bcl__key { flex-shrink: 0; width: 12px; height: 12px; margin-top: .3em; border-radius: 4px; background: var(--nu-blue); }

.bcl__plot {
  position: relative; display: flex; gap: clamp(8px, 1.4vw, 18px);
  height: clamp(200px, 22vw, 260px); margin-top: 36px;
}
.bcl__zero { position: absolute; left: 0; right: 0; height: 1px; background: var(--nu-ink-14); }
.bcl__col { position: relative; flex: 1; min-width: 0; outline: none; cursor: default; border-radius: 12px; }
.bcl__col:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 4px; }
.bcl__bar {
  position: absolute; left: 0; right: 0; margin: 0 auto;
  width: 100%; max-width: 40px; border-radius: 12px;
  background: var(--nu-bar-inactive);
  transition: background .2s, opacity .2s, translate .2s;
}
.bcl__col--lead .bcl__bar { background: var(--nu-blue); }
.bcl__bar--neg, .bcl__col--lead .bcl__bar--neg { background: var(--nu-red-tint); }

/* margem de erro: traço de 2px com remate em cima e embaixo */
.bcl__ci {
  position: absolute; left: 50%; width: 2px; translate: -50% 0; background: var(--nu-ink-30);
  pointer-events: none; transition: opacity .2s;
}
.bcl__ci::before, .bcl__ci::after {
  content: ''; position: absolute; left: 50%; width: 10px; height: 2px; translate: -50% 0;
  border-radius: 1px; background: var(--nu-ink-30);
}
.bcl__ci::before { top: 0; }
.bcl__ci::after { bottom: 0; }

.bcl__val {
  position: absolute; left: 50%; transform: translateX(-50%);
  color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap;
  transition: opacity .2s;
}
.bcl__col--lead .bcl__val { color: var(--nu-blue); }

/* ——— hover: a barra sobe, as outras recuam, cartão com nota e margem ——— */
.bcl__col:hover .bcl__bar, .bcl__col:focus-visible .bcl__bar, .bcl__col--hl .bcl__bar { translate: 0 -2px; }
.bcl__col:not(.bcl__col--lead):hover .bcl__bar, .bcl__col:not(.bcl__col--lead):focus-visible .bcl__bar,
.bcl__col--hl:not(.bcl__col--lead) .bcl__bar { background: var(--nu-ink-16); }
.bcl__plot:hover .bcl__col:not(:hover) .bcl__bar,
.bcl__plot--hl .bcl__col:not(.bcl__col--hl) .bcl__bar { opacity: .55; }
.bcl__plot:hover .bcl__col:not(:hover) .bcl__val,
.bcl__plot:hover .bcl__col:not(:hover) .bcl__ci,
.bcl__plot--hl .bcl__col:not(.bcl__col--hl) .bcl__val,
.bcl__plot--hl .bcl__col:not(.bcl__col--hl) .bcl__ci { opacity: .4; }
.bcl__col--hl { z-index: 2; }
.bcl__tip {
  position: absolute; left: 50%; z-index: 3; display: flex; flex-direction: column; gap: 1px;
  background: var(--nu-white); border-radius: var(--nu-r-tile); padding: 10px 14px; white-space: nowrap;
  box-shadow: var(--nu-shadow-card), 0 0 0 1px var(--nu-cream-2);
  opacity: 0; transform: translate(-50%, 6px); pointer-events: none; transition: opacity .18s, transform .18s;
}
.bcl__col:first-child .bcl__tip { left: 0; transform: translate(0, 6px); }
.bcl__col:last-child .bcl__tip { left: auto; right: 0; transform: translate(0, 6px); }
.bcl__col:hover .bcl__tip, .bcl__col:focus-visible .bcl__tip, .bcl__col--hl .bcl__tip { opacity: 1; transform: translate(-50%, 0); }
.bcl__col:first-child:hover .bcl__tip, .bcl__col:first-child:focus-visible .bcl__tip, .bcl__col--hl:first-child .bcl__tip,
.bcl__col:last-child:hover .bcl__tip, .bcl__col:last-child:focus-visible .bcl__tip, .bcl__col--hl:last-child .bcl__tip { transform: translate(0, 0); }
.bcl__tip-rank { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
.bcl__tip-name { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; }
.bcl__tip-val { color: var(--nu-blue); font-size: var(--nu-fs-xl); font-weight: 800; font-variant-numeric: tabular-nums; }
.bcl__tip-ci { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums; }

.bcl__labels { display: flex; gap: clamp(8px, 1.4vw, 18px); margin-top: 12px; }
.bcl__lbl {
  flex: 1; min-width: 0; text-align: center;
  color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.25;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.bcl__lbl--lead { color: var(--nu-ink); font-weight: 800; }
.bcl__foot { margin: 20px 0 0; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }

/* ——— barras deitadas (só no estreito) ——— */
.bcl__rows { display: none; list-style: none; margin: 16px 0 0; padding: 0; }
.bcl__row {
  display: grid; grid-template-columns: 30px minmax(0, 1fr) auto; grid-template-areas: 'pos name val' 'pos track track';
  align-items: center; gap: 6px 10px; padding: 8px 0;
}
.bcl__row + .bcl__row { border-top: 1px solid var(--nu-cream-2); }
.bcl__row { margin: 0 -10px; padding-left: 10px; padding-right: 10px; border-radius: var(--nu-r-tile); transition: background .18s; }
.bcl__row--hl { background: var(--b-surface, var(--nu-cream)); }
.bcl__row-pos { grid-area: pos; align-self: start; padding-top: 1px; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.bcl__row-name { grid-area: name; min-width: 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bcl__row-val { grid-area: val; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 800; font-variant-numeric: tabular-nums; }
.bcl__row--lead .bcl__row-val { color: var(--nu-blue); }
.bcl__row-track { grid-area: track; position: relative; height: 10px; border-radius: var(--nu-r-pill); background: var(--b-surface, var(--nu-cream)); }
.bcl__row-bar { position: absolute; top: 0; bottom: 0; border-radius: var(--nu-r-pill); background: var(--nu-bar-inactive); transform-origin: left; }
.bcl__row--lead .bcl__row-bar { background: var(--nu-blue); }
.bcl__row-ci { position: absolute; top: 50%; height: 2px; translate: 0 -50%; background: var(--nu-ink-30); }
.bcl__row-ci::before, .bcl__row-ci::after {
  content: ''; position: absolute; top: 50%; width: 2px; height: 10px; translate: 0 -50%; border-radius: 1px; background: var(--nu-ink-30);
}
.bcl__row-ci::before { left: 0; }
.bcl__row-ci::after { right: 0; }

/* ——— entrada: barras crescem do chão em cadeia, valor e margem aparecem depois ——— */
.is-pending .bcl__bar { transform: scaleY(0); }
.is-pending .bcl__val, .is-pending .bcl__ci, .is-pending .bcl__row-ci { opacity: 0; }
.is-pending .bcl__row-bar { transform: scaleX(0); }
.is-in .bcl__bar {
  transform: scaleY(1);
  transition: transform .7s cubic-bezier(.2, .8, .2, 1) calc(var(--i) * 40ms), background .2s, opacity .2s, translate .2s;
}
.is-in .bcl__val { animation: bcl-in .35s ease backwards; animation-delay: calc(.45s + var(--i) * 40ms); }
/* a margem usa translate para centrar: a entrada dela só faz fade */
.is-in .bcl__ci, .is-in .bcl__row-ci { animation: bcl-fade .35s ease backwards; animation-delay: calc(.45s + var(--i) * 40ms); }
.is-in .bcl__row-bar { transform: scaleX(1); transition: transform .7s cubic-bezier(.2, .8, .2, 1) calc(var(--i) * 40ms); }
@keyframes bcl-in { from { opacity: 0; translate: 0 4px; } to { opacity: 1; translate: 0 0; } }
@keyframes bcl-fade { from { opacity: 0; } to { opacity: 1; } }

@container (max-width: 640px) {
  .bcl__lead { font-size: var(--nu-fs-sm); }
  .bcl__plot, .bcl__labels { display: none; }
  .bcl__rows { display: block; }
}
</style>

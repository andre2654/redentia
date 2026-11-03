<script setup lang="ts">
// O gráfico de preço das direções do /asset (03/11/2026). Uma linha só do
// ativo e, por baixo, o IBOV rebaseado no mesmo ponto de partida (o que se lê
// é a distância entre os dois). Sai inteiro do servidor: o caminho, as marcas
// de preço e o ponto de hoje estão no HTML, numa caixa de altura fixa, então a
// hidratação não mexe em nada. O cursor (data, preço, variação) é só do
// cliente e não empurra nada: flutua por cima.
//   tom 'claro'  linha azul sobre branco ou creme
//   tom 'escuro' linha azul-clara sobre navy
//   tom 'luz'    a linha de luz da noite (o rodapé, o /login): o traço acende
//                até o ponto de hoje, com halo
// viewBox literal: o :viewBox vira prop do DOM e o Vue reclama (NuFooterLinha).
import type { SeriesPoint } from '~/types/acao'

const props = withDefaults(defineProps<{
  ativo: SeriesPoint[]
  ibov?: SeriesPoint[]
  ticker: string
  /** 'R$ 50,60', o rótulo do ponto de hoje */
  atual: string
  tom?: 'claro' | 'escuro' | 'luz'
  /** o período troca no cliente: a linha velha esmaece até a nova chegar */
  carregando?: boolean
  /** sem as marcas de preço (o herói da noite) */
  semMarcas?: boolean
  /** os rótulos das marcas à esquerda, fora da caixa (o pai reserva a margem) */
  marcasFora?: boolean
}>(), { ibov: () => [], tom: 'claro', carregando: false, semMarcas: false, marcasFora: false })

const W = 1000
const H = 300
const c = computed(() => caminhosDoGrafico(props.ativo, props.ibov, W, H))
const marcas = computed(() => (props.semMarcas ? [] : marcasDePreco(c.value.lo, c.value.hi).map((v) => ({ v, top: (c.value.y(v) / H) * 100 }))))
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const moeda = computed(() => (props.atual.trim().startsWith('US$') ? 'US$' : 'R$'))
const fmtMarca = (v: number) => `${moeda.value} ${Math.abs(v) >= 100 || Number.isInteger(v) ? nf0.format(v) : nf2.format(v)}`
const fimPct = computed(() => (c.value.fim ? { x: (c.value.fim.x / W) * 100, y: (c.value.fim.y / H) * 100 } : null))
const uid = useId()

/* ——— o cursor ——— */
const caixa = ref<HTMLElement | null>(null)
const cursor = ref<number | null>(null)
// o x de cada ponto, na mesma conta do caminho (pela data)
const xs = computed(() => {
  const n = props.ativo.length
  const t0 = Date.parse(props.ativo[0]?.t ?? '')
  const t1 = Date.parse(props.ativo[n - 1]?.t ?? '')
  return props.ativo.map((p, i) => {
    const ms = Date.parse(p.t)
    return Number.isFinite(ms) && t1 > t0 ? (ms - t0) / (t1 - t0) : i / Math.max(1, n - 1)
  })
})
function mover(e: PointerEvent) {
  const el = caixa.value
  if (!el || props.ativo.length < 2) return
  const r = el.getBoundingClientRect()
  const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
  let melhor = 0
  xs.value.forEach((x, i) => { if (Math.abs(x - f) < Math.abs(xs.value[melhor]! - f)) melhor = i })
  cursor.value = melhor
}
const ponto = computed(() => {
  const i = cursor.value
  if (i == null) return null
  const p = props.ativo[i]
  const a0 = props.ativo[0]
  if (!p || !a0) return null
  const x = (xs.value[i] ?? 0) * 100
  const y = (c.value.y(p.v) / H) * 100
  const varPct = a0.v ? ((p.v - a0.v) / a0.v) * 100 : 0
  return { x, y, data: dataDoPonto(p.t), preco: `${moeda.value} ${nf2.format(p.v)}`, varPct: pctAtivo(varPct), dir: varPct < 0 ? 'down' : 'up' }
})
</script>

<template>
  <div
    ref="caixa" class="agr" :class="[`agr--${tom}`, { 'agr--carregando': carregando, 'agr--fora': marcasFora }]"
    @pointermove="mover" @pointerleave="cursor = null"
  >
    <svg class="agr__svg" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient :id="`${uid}-area`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" class="agr__stop-a" />
          <stop offset="1" class="agr__stop-b" />
        </linearGradient>
        <linearGradient :id="`${uid}-luz`" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" class="agr__luz-a" />
          <stop offset=".7" class="agr__luz-b" />
          <stop offset="1" class="agr__luz-c" />
        </linearGradient>
      </defs>
      <path v-if="tom !== 'luz'" :d="c.area" :fill="`url(#${uid}-area)`" class="agr__area" />
      <path v-if="c.ibov" :d="c.ibov" class="agr__ibov" />
      <path v-if="tom === 'luz'" :d="c.linha" class="agr__halo" />
      <path :d="c.linha" class="agr__linha" :stroke="tom === 'luz' ? `url(#${uid}-luz)` : undefined" />
    </svg>
    <span v-for="m in marcas" :key="m.v" class="agr__marca" :style="{ top: `${m.top}%` }" aria-hidden="true"><span class="agr__marca-t">{{ fmtMarca(m.v) }}</span></span>
    <template v-if="fimPct">
      <span class="agr__fim" :style="{ left: `${fimPct.x}%`, top: `${fimPct.y}%` }" aria-hidden="true" />
      <span class="agr__hoje" :class="{ 'agr__hoje--baixo': fimPct.y < 22 }" :style="{ top: `${fimPct.y}%` }">
        <span class="agr__hoje-r">{{ ticker }} hoje</span>
        <span class="agr__hoje-v">{{ atual }}</span>
      </span>
    </template>
    <template v-if="ponto">
      <span class="agr__mira" :style="{ left: `${ponto.x}%` }" aria-hidden="true" />
      <span class="agr__ponto" :style="{ left: `${ponto.x}%`, top: `${ponto.y}%` }" aria-hidden="true" />
      <span class="agr__dica" :style="{ left: `${Math.min(86, Math.max(14, ponto.x))}%` }" aria-hidden="true">
        <span class="agr__dica-d">{{ ponto.data }}</span>
        <span class="agr__dica-p">{{ ponto.preco }}</span>
        <span class="agr__dica-v" :class="`agr__dica-v--${ponto.dir}`">{{ ponto.varPct }}</span>
      </span>
    </template>
  </div>
</template>

<style scoped>
.agr { position: relative; width: 100%; height: 100%; touch-action: pan-y; cursor: crosshair; transition: opacity .25s ease; }
.agr--carregando { opacity: .45; }
.agr__svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.agr__linha { fill: none; stroke-width: 2.2; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.agr__ibov { fill: none; stroke-width: 1.3; stroke-dasharray: 3 4; vector-effect: non-scaling-stroke; }
.agr__halo { fill: none; stroke-width: 9; stroke-linejoin: round; vector-effect: non-scaling-stroke; opacity: .22; filter: blur(5px); }

.agr--claro .agr__linha { stroke: var(--nu-blue); }
.agr--claro .agr__ibov { stroke: var(--nu-sand); }
.agr--claro .agr__stop-a { stop-color: var(--nu-blue); stop-opacity: .12; }
.agr--claro .agr__stop-b { stop-color: var(--nu-blue); stop-opacity: 0; }
.agr--escuro .agr__linha { stroke: var(--nu-blue-soft); }
.agr--escuro .agr__ibov { stroke: var(--nu-cream-text-35); }
.agr--escuro .agr__stop-a { stop-color: var(--nu-blue); stop-opacity: .34; }
.agr--escuro .agr__stop-b { stop-color: var(--nu-blue); stop-opacity: 0; }
.agr--luz .agr__linha { stroke-width: 2; }
.agr--luz .agr__luz-a { stop-color: var(--nu-blue); stop-opacity: .35; }
.agr--luz .agr__luz-b { stop-color: var(--nu-blue-soft); stop-opacity: .9; }
.agr--luz .agr__luz-c { stop-color: var(--nu-white); stop-opacity: 1; }
.agr--luz .agr__halo { stroke: var(--nu-blue-soft); }
.agr--luz .agr__ibov { stroke: var(--nu-white-30); }

.agr__marca { position: absolute; left: 0; right: 0; height: 0; border-top: 1px solid; pointer-events: none; }
/* o rótulo fica em cima do fio, à esquerda; com --agr-marca-fora, fora da caixa */
.agr__marca-t {
  position: absolute; left: 0; bottom: 3px; white-space: nowrap;
  font-size: var(--nu-fs-xs); font-weight: 600; font-variant-numeric: tabular-nums;
}
.agr--fora .agr__marca-t { left: auto; right: calc(100% + 10px); bottom: auto; top: 0; transform: translateY(-50%); }
.agr--claro .agr__marca { border-color: var(--nu-ink-04); }
.agr--claro .agr__marca-t { color: var(--nu-gray); }
.agr--escuro .agr__marca, .agr--luz .agr__marca { border-color: var(--nu-cream-text-08); }
.agr--escuro .agr__marca-t, .agr--luz .agr__marca-t { color: var(--nu-cream-text-50); }

.agr__fim {
  position: absolute; width: 11px; height: 11px; border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none;
  background: var(--nu-blue); box-shadow: 0 0 0 5px var(--nu-blue-tint);
}
.agr--escuro .agr__fim { background: var(--nu-blue-soft); box-shadow: 0 0 0 6px var(--nu-blue-soft-18); }
.agr--luz .agr__fim { background: var(--nu-white); box-shadow: 0 0 0 6px var(--nu-blue-soft-18), 0 0 22px 4px var(--nu-blue-soft); }

/* o rótulo de hoje fica DENTRO da caixa, encostado à direita: nunca vaza (o de hoje vazava em 1440) */
.agr__hoje {
  position: absolute; right: 18px; transform: translateY(calc(-100% - 14px)); pointer-events: none;
  display: flex; flex-direction: column; align-items: flex-end; gap: 2px; padding: 7px 11px; border-radius: var(--nu-r-chip);
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.agr__hoje--baixo { transform: translateY(14px); }
.agr__hoje-r { font-size: var(--nu-fs-xs); font-weight: 600; }
.agr__hoje-v { font-size: var(--nu-fs-sm); font-weight: 700; }
.agr--claro .agr__hoje { background: var(--nu-white); color: var(--nu-ink); box-shadow: 0 0 0 1px var(--nu-navy-06), var(--nu-shadow-card); }
.agr--claro .agr__hoje-r { color: var(--nu-gray); }
.agr--escuro .agr__hoje, .agr--luz .agr__hoje { background: var(--nu-navy-2); color: var(--nu-cream-text); box-shadow: 0 0 0 1px var(--nu-cream-text-12); }
.agr--escuro .agr__hoje-r, .agr--luz .agr__hoje-r { color: var(--nu-cream-text-55); }

.agr__mira { position: absolute; top: 0; bottom: 0; width: 1px; pointer-events: none; background: var(--nu-ink-14); }
.agr--escuro .agr__mira, .agr--luz .agr__mira { background: var(--nu-cream-text-30); }
.agr__ponto { position: absolute; width: 9px; height: 9px; border-radius: 50%; transform: translate(-50%, -50%); background: var(--nu-blue); box-shadow: 0 0 0 4px var(--nu-blue-28); pointer-events: none; }
.agr__dica {
  position: absolute; top: 0; transform: translate(-50%, calc(-100% - 8px)); pointer-events: none; z-index: 2;
  display: flex; align-items: baseline; gap: 8px; padding: 7px 11px; border-radius: var(--nu-r-chip); white-space: nowrap;
  background: var(--nu-navy); color: var(--nu-cream-text); font-variant-numeric: tabular-nums;
  box-shadow: var(--nu-shadow-chart-tip);
}
.agr__dica-d { color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 600; }
.agr__dica-p { font-size: var(--nu-fs-sm); font-weight: 700; }
.agr__dica-v { font-size: var(--nu-fs-xs); font-weight: 700; }
.agr__dica-v--up { color: var(--nu-green-soft); }
.agr__dica-v--down { color: var(--nu-red-soft); }
@media (prefers-reduced-motion: reduce) { .agr { transition: none; } }
</style>

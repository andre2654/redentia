<script setup lang="ts">
// A curva das calculadoras na frase (21/10/2026): a série da conta ano a ano,
// com a área embaixo, a bolinha no último ponto com o valor e, quando há, a
// linha tracejada da meta ("você precisa de R$ 2,71 mi") ou a série tracejada
// do que a pessoa aportou. A linha se desenha na chegada; mexendo na conta,
// ela muda na hora. As contas do desenho estão em utils/calculadora-frase.ts.
// Robustez (11/11/2026): mexendo na conta, a curva não salta mais para a
// forma nova: a série, a tracejada e a meta vão da forma de agora para a nova
// em --nu-dur-lenta --nu-ease-saida (calc-movimento.ts; com uma série de outro
// tamanho, a de agora é reamostrada antes). A linha se desenha na chegada em
// --nu-dur-entrada --nu-ease-troca, e a área surge junto (--nu-ease-cor). Se a
// curva nasceu abaixo da dobra (o celular), o desenho roda de novo quando ela
// chega perto da tela, como o v-revelar: uma Web Animation que não esconde
// nada antes de começar, e o que já estava na tela não pisca de volta.
// Movimento reduzido: a forma nova aparece de uma vez.
import { deveRevelar, REVELACAO } from '~/utils/revelar'
import { curvaDoToken, duracaoDoToken, lerToken, movimentoReduzido, reamostrar } from './calc-movimento'

const props = defineProps<{
  valores: number[]
  /** linha horizontal tracejada (a meta) */
  meta?: number | null
  rotuloMeta?: string
  /** série tracejada embaixo da principal (o que foi aportado) */
  secundaria?: number[]
  /** o valor ao lado da bolinha do fim */
  rotuloFim?: string
  /** os rótulos do eixo: início e fim */
  rotulos?: [string, string]
  /** a legenda da série tracejada, embaixo do gráfico ("o que você guardou") */
  legendaSecundaria?: string
}>()

const W = 520
const H = 170
const M = 8

/* ——— a forma que se vê: vai da de agora para a nova ——— */
const valoresVistos = shallowRef<number[]>([...props.valores])
const secundariaVista = shallowRef<number[] | undefined>(props.secundaria ? [...props.secundaria] : undefined)
const metaVista = ref<number | null>(props.meta ?? null)
let quadro = 0
const iguais = (a: readonly number[] | undefined, b: readonly number[] | undefined) =>
  a === b || (!!a && !!b && a.length === b.length && a.every((v, i) => v === b[i]))

watch(() => [props.valores, props.secundaria, props.meta] as const, ([valores, secundaria, meta]) => {
  if (import.meta.server) return
  if (iguais(valores, valoresVistos.value) && iguais(secundaria, secundariaVista.value) && (meta ?? null) === metaVista.value) return
  if (quadro) cancelAnimationFrame(quadro)
  quadro = 0
  const alvoV = [...valores]
  const alvoS = secundaria ? [...secundaria] : undefined
  const alvoM = meta ?? null
  if (movimentoReduzido() || valoresVistos.value.length < 2 || alvoV.length < 2) {
    valoresVistos.value = alvoV
    secundariaVista.value = alvoS
    metaVista.value = alvoM
    return
  }
  const deV = reamostrar(valoresVistos.value, alvoV.length)
  const deS = alvoS ? reamostrar(secundariaVista.value ?? deV, alvoS.length) : undefined
  const deM = metaVista.value ?? alvoM
  const duracao = duracaoDoToken('--nu-dur-lenta', 520)
  const curva = curvaDoToken('--nu-ease-saida', [0.16, 1, 0.3, 1])
  const t0 = performance.now()
  const passo = (agora: number) => {
    const t = Math.min(1, (agora - t0) / duracao)
    if (t >= 1) {
      valoresVistos.value = alvoV
      secundariaVista.value = alvoS
      metaVista.value = alvoM
      quadro = 0
      return
    }
    const k = curva(t)
    valoresVistos.value = alvoV.map((v, i) => deV[i]! + (v - deV[i]!) * k)
    secundariaVista.value = alvoS?.map((v, i) => deS![i]! + (v - deS![i]!) * k)
    metaVista.value = alvoM == null ? null : (deM ?? alvoM) + (alvoM - (deM ?? alvoM)) * k
    quadro = requestAnimationFrame(passo)
  }
  quadro = requestAnimationFrame(passo)
})

const curva = computed(() => curvaDaConta(valoresVistos.value, { W, H, M, meta: metaVista.value }))
const yMeta = computed(() => (curva.value && metaVista.value != null ? curva.value.y(metaVista.value) : null))
const linhaSecundaria = computed(() => {
  const c = curva.value
  const s = secundariaVista.value
  if (!c || !s || s.length < 2) return ''
  return s.map((v, i) => `${i ? 'L' : 'M'}${(M + ((W - 2 * M) * i) / (s.length - 1)).toFixed(1)} ${c.y(v).toFixed(1)}`).join(' ')
})
const id = useId()

/* ——— nascida abaixo da dobra, a linha se desenha de novo quando a curva chega perto da tela ——— */
const svg = ref<SVGSVGElement | null>(null)
const linha = ref<SVGPathElement | null>(null)
const area = ref<SVGPathElement | null>(null)
let olho: IntersectionObserver | null = null
function desenhar() {
  const l = linha.value
  if (!l || typeof l.animate !== 'function') return
  const duracao = duracaoDoToken('--nu-dur-entrada', 720)
  l.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], { duration: duracao, easing: lerToken('--nu-ease-troca', 'cubic-bezier(.625, .05, 0, 1)'), fill: 'backwards' })
  area.value?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: duracao, easing: lerToken('--nu-ease-cor', 'cubic-bezier(.4, 0, .2, 1)'), fill: 'backwards' })
}
onMounted(() => {
  const el = svg.value
  if (!el || typeof IntersectionObserver === 'undefined') return
  if (!deveRevelar(el.getBoundingClientRect().top, window.innerHeight, movimentoReduzido())) return
  olho = new IntersectionObserver((vistos) => {
    if (!vistos.some((v) => v.isIntersecting)) return
    olho?.disconnect()
    olho = null
    desenhar()
  }, { rootMargin: REVELACAO.margem })
  olho.observe(el)
})
onBeforeUnmount(() => {
  olho?.disconnect()
  if (quadro) cancelAnimationFrame(quadro)
})
</script>

<template>
  <svg v-if="curva" ref="svg" class="ccv" viewBox="0 -22 520 216" aria-hidden="true">
    <defs>
      <linearGradient :id="`${id}-area`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" class="ccv__stop-alto" />
        <stop offset="1" class="ccv__stop-baixo" />
      </linearGradient>
    </defs>
    <template v-if="yMeta != null">
      <line class="ccv__meta" x1="8" :y1.attr="yMeta" x2="512" :y2.attr="yMeta" />
      <text v-if="rotuloMeta" class="ccv__rotulo" x="10" :y.attr="Math.max(-6, yMeta - 8)">{{ rotuloMeta }}</text>
    </template>
    <path ref="area" class="ccv__area" :d="curva.area" :fill="`url(#${id}-area)`" />
    <path v-if="linhaSecundaria" class="ccv__secundaria" :d="linhaSecundaria" />
    <path ref="linha" class="ccv__linha" :d="curva.linha" pathLength="100" />
    <circle class="ccv__halo" :cx.attr="curva.fim[0]" :cy.attr="curva.fim[1]" r="11" />
    <circle class="ccv__ponto" :cx.attr="curva.fim[0]" :cy.attr="curva.fim[1]" r="5.5" />
    <text v-if="rotuloFim" class="ccv__fim" :x.attr="curva.fim[0] - 12" :y.attr="Math.max(-8, curva.fim[1] - 14)" text-anchor="end">{{ rotuloFim }}</text>
    <template v-if="rotulos">
      <text class="ccv__eixo" x="8" y="190">{{ rotulos[0] }}</text>
      <text class="ccv__eixo" x="512" y="190" text-anchor="end">{{ rotulos[1] }}</text>
    </template>
  </svg>
  <p v-if="curva && legendaSecundaria && linhaSecundaria" class="ccv__legenda">
    <span class="ccv__traco" aria-hidden="true" /> {{ legendaSecundaria }}
  </p>
</template>

<style scoped>
.ccv { display: block; width: 100%; height: auto; overflow: visible; }
.ccv__stop-alto { stop-color: var(--nu-blue); stop-opacity: 0.22; }
.ccv__stop-baixo { stop-color: var(--nu-blue); stop-opacity: 0; }
.ccv__meta { stroke: var(--nu-ink); stroke-opacity: 0.45; stroke-width: 1.5; stroke-dasharray: 5 6; }
.ccv__secundaria { fill: none; stroke: var(--nu-ink); stroke-opacity: 0.55; stroke-width: 2; stroke-dasharray: 6 6; }
.ccv__linha {
  fill: none; stroke: var(--nu-blue); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round;
  stroke-dasharray: 100; stroke-dashoffset: 0; animation: ccv-desenha var(--nu-dur-entrada) var(--nu-ease-troca) both;
}
.ccv__area { animation: ccv-surge var(--nu-dur-entrada) var(--nu-ease-cor) both; }
.ccv__halo { fill: var(--nu-blue); fill-opacity: 0.15; }
.ccv__ponto { fill: var(--nu-blue); }
.ccv__rotulo, .ccv__eixo { fill: var(--nu-gray); font-size: 13px; font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }
.ccv__fim { fill: var(--nu-ink); font-size: 14px; font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; }
.ccv__legenda {
  display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin: 6px 0 0;
  color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-texto);
}
.ccv__traco { width: 22px; height: 0; border-top: 2px dashed color-mix(in srgb, var(--nu-ink) 55%, transparent); }
@keyframes ccv-desenha { from { stroke-dashoffset: 100; } }
@keyframes ccv-surge { from { opacity: 0; } }
</style>

<script setup lang="ts">
/**
 * O leque da direção 2 da /business (?biz=2): a carteira de exemplo de
 * content/business/exemplo-cenario.ts atravessando o cenário estudado, em
 * 2.000 caminhos, no desenho do leque da home e da /carteira (fios finos na
 * cor de onde terminam, a faixa de 80% e a linha do meio).
 *
 * O QUE É DO MOTOR E O QUE É DESENHO. O motor devolveu os percentis do FIM
 * (p05, p10, p50, p90, p95) e a queda da mediana no caminho; não devolve os
 * caminhos mês a mês. Então cada um dos 2.000 fios termina num ponto sorteado
 * da distribuição do motor (os percentis batem com os dele) e o trajeto entre
 * hoje e o fim é uma ponte aleatória em torno da mediana. Por isso a página só
 * escreve número na ponta (a faixa do motor) e nunca no meio do caminho, e a
 * legenda diz que o trajeto é desenhado.
 *
 * SSR PRIMEIRO. Os caminhos saem de um sorteio com semente fixa, igual no
 * servidor e no navegador: a faixa (p10–p90 mês a mês) e a linha do meio são
 * SVG e já vêm no HTML, com os rótulos. O canvas só acrescenta os 2.000 fios
 * depois do mount. A entrada (uma varredura da esquerda para a direita) só
 * roda com a aba visível, o leque na tela e sem pedido de menos movimento; fora
 * disso os fios aparecem prontos. Nada em laço.
 */
import { EXEMPLO_CENARIO as X, reaisCurto } from '~/content/business/exemplo-cenario'

const MESES = 12
const N = X.caminhos

function sorteador(semente: number) {
  let a = semente >>> 0
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* a inversa da normal (Acklam), para pôr cada fio num percentil */
function zDe(p: number): number {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239]
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572]
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416]
  const q = p < 0.5 ? p : 1 - p
  if (q < 0.02425) {
    const r = Math.sqrt(-2 * Math.log(q))
    const z = (((((c[0]! * r + c[1]!) * r + c[2]!) * r + c[3]!) * r + c[4]!) * r + c[5]!) / ((((d[0]! * r + d[1]!) * r + d[2]!) * r + d[3]!) * r + 1)
    return p < 0.5 ? z : -z
  }
  const r = (p - 0.5) ** 2
  return ((((((a[0]! * r + a[1]!) * r + a[2]!) * r + a[3]!) * r + a[4]!) * r + a[5]!) * (p - 0.5)) / (((((b[0]! * r + b[1]!) * r + b[2]!) * r + b[3]!) * r + b[4]!) * r + 1)
}

/* o valor final no percentil p: interpolação em log, sobre z, entre os
   percentis do motor; fora de p05–p95 segue a inclinação da ponta */
const NOS = [
  [zDe(0.05), Math.log(X.final.p05)], [zDe(0.10), Math.log(X.final.p10)], [0, Math.log(X.final.p50)],
  [zDe(0.90), Math.log(X.final.p90)], [zDe(0.95), Math.log(X.final.p95)],
] as const
function finalDe(p: number): number {
  const z = zDe(Math.min(0.998, Math.max(0.002, p)))
  let i = 0
  while (i < NOS.length - 2 && z > NOS[i + 1]![0]) i++
  const [z0, l0] = NOS[i]!
  const [z1, l1] = NOS[i + 1]!
  return Math.exp(l0 + ((z - z0) / (z1 - z0)) * (l1 - l0))
}

/* a mediana no caminho: uma curva suave que desce até a queda da mediana que
   o motor mediu (−2%) e termina no p50 do fim */
const fimMeio = X.final.p50 / X.inicio
const meio = (m: number) => 1 + (fimMeio - 1) * (m / MESES) + (X.quedaMediana / 100) * Math.sin((Math.PI * m) / MESES)

function sortear() {
  const r = sorteador(20261104)
  const normal = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r())
  const sigma = 0.028
  const v = new Float32Array(N * (MESES + 1))
  const fins = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    const fim = finalDe((i + 0.5) / N) / X.inicio
    fins[i] = fim
    // ponte browniana: passeio que volta a zero no fim
    const passos = [0]
    for (let m = 1; m <= MESES; m++) passos.push(passos[m - 1]! + sigma * normal())
    const ultimo = passos[MESES]!
    for (let m = 0; m <= MESES; m++) {
      const t = m / MESES
      const ponte = passos[m]! - t * ultimo
      const base = Math.log(meio(m)) + t * (Math.log(fim) - Math.log(fimMeio))
      v[i * (MESES + 1) + m] = Math.exp(base + ponte)
    }
  }
  return { v, fins }
}
const { v: VALORES, fins: FINS } = sortear()

/* percentis mês a mês dos fios desenhados (a faixa e a linha do SVG) */
const faixa = Array.from({ length: MESES + 1 }, (_, m) => {
  const col = Array.from({ length: N }, (_, i) => VALORES[i * (MESES + 1) + m]!).sort((a, b) => a - b)
  return { p10: col[Math.floor(N * 0.1)]!, p50: col[Math.floor(N * 0.5)]!, p90: col[Math.floor(N * 0.9)]! }
})

const W = 1000
const H = 420
const LO = Math.min(...Array.from(FINS)) * 0.985
const HI = Math.max(...Array.from(FINS)) * 1.01
const xDe = (m: number) => (m / MESES) * W
const yDe = (v: number) => 14 + ((HI - v) / (HI - LO)) * (H - 28)
const linha = (k: 'p10' | 'p50' | 'p90') => faixa.map((f, m) => `${m ? 'L' : 'M'}${xDe(m).toFixed(1)},${yDe(f[k]).toFixed(1)}`).join('')
const area = `${linha('p90')}${faixa.map((_, m) => MESES - m).map((m) => `L${xDe(m).toFixed(1)},${yDe(faixa[m]!.p10).toFixed(1)}`).join('')}Z`
const pct = (v: number) => `${((yDe(v) / H) * 100).toFixed(2)}%`
const ROTULOS = {
  p90: { y: pct(X.final.p90 / X.inicio), txt: reaisCurto(X.final.p90) },
  p10: { y: pct(X.final.p10 / X.inicio), txt: reaisCurto(X.final.p10) },
}

/* ——— os fios, no canvas ——— */
const caixa = ref<HTMLElement | null>(null)
const tela = ref<HTMLCanvasElement | null>(null)
let ro: ResizeObserver | null = null

function desenhar() {
  const c = tela.value
  const el = caixa.value
  if (!c || !el) return
  const w = el.clientWidth
  const h = el.clientHeight
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  c.width = Math.round(w * dpr)
  c.height = Math.round(h * dpr)
  const g = c.getContext('2d')
  if (!g) return
  g.setTransform(dpr, 0, 0, dpr, 0, 0)
  g.clearRect(0, 0, w, h)
  g.lineWidth = 1
  const sx = w / W
  const sy = h / H
  const css = getComputedStyle(el)
  const cores = {
    alto: css.getPropertyValue('--nu-green-soft').trim() || '#8FF0B5',
    meio: css.getPropertyValue('--nu-cream').trim() || '#F5F1EA',
    baixo: css.getPropertyValue('--nu-red-soft').trim() || '#FFB3B8',
  }
  for (const [chave, de, ate] of [['meio', 0.2, 0.8], ['alto', 0.8, 1.01], ['baixo', -0.01, 0.2]] as const) {
    g.strokeStyle = cores[chave]
    g.globalAlpha = chave === 'meio' ? 0.05 : 0.09
    g.beginPath()
    for (let i = 0; i < N; i++) {
      const p = (i + 0.5) / N
      if (p < de || p >= ate) continue
      for (let m = 0; m <= MESES; m++) {
        const x = xDe(m) * sx
        const y = yDe(VALORES[i * (MESES + 1) + m]!) * sy
        if (m) g.lineTo(x, y)
        else g.moveTo(x, y)
      }
    }
    g.stroke()
  }
  g.globalAlpha = 1
}

/* `tocar` (useBizEntrada, no pai) varre os fios da esquerda para a direita,
   uma vez: o leque se abrindo. Sem ele, os fios só aparecem prontos. */
const props = withDefaults(defineProps<{ tocar?: boolean }>(), { tocar: false })
onMounted(() => {
  desenhar()
  ro = new ResizeObserver(() => desenhar())
  if (caixa.value) ro.observe(caixa.value)
})
watch(() => props.tocar, (t) => {
  if (!t) return
  tela.value?.animate(
    [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
    { duration: 1800, delay: 150, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'backwards' },
  )
})
onBeforeUnmount(() => { ro?.disconnect(); ro = null })

const DESCRICAO = `Leque de ${N.toLocaleString('pt-BR')} caminhos da carteira de exemplo em ${X.horizonte}, no cenário ${X.cenario}. Em 80% dos caminhos ela termina entre ${reaisCurto(X.final.p10)} e ${reaisCurto(X.final.p90)}, em reais de hoje.`
</script>

<template>
  <figure class="bzl" role="img" :aria-label="DESCRICAO">
    <div ref="caixa" class="bzl__caixa" aria-hidden="true">
      <svg class="bzl__svg" :viewBox.attr="`0 0 ${W} ${H}`" preserveAspectRatio="none">
        <line x1="0" :x2.attr="W" :y1.attr="yDe(1)" :y2.attr="yDe(1)" class="bzl__base" vector-effect="non-scaling-stroke" />
        <path :d="area" class="bzl__faixa" />
        <path :d="linha('p90')" class="bzl__borda" vector-effect="non-scaling-stroke" />
        <path :d="linha('p10')" class="bzl__borda" vector-effect="non-scaling-stroke" />
      </svg>
      <canvas ref="tela" class="bzl__tela" />
      <svg class="bzl__svg" :viewBox.attr="`0 0 ${W} ${H}`" preserveAspectRatio="none">
        <path :d="linha('p50')" class="bzl__meio" vector-effect="non-scaling-stroke" />
      </svg>
      <span class="bzl__ponto bzl__ponto--alto" :style="{ top: ROTULOS.p90.y }" />
      <span class="bzl__ponto bzl__ponto--baixo" :style="{ top: ROTULOS.p10.y }" />
      <span class="bzl__rot bzl__rot--alto" :style="{ top: ROTULOS.p90.y }">{{ ROTULOS.p90.txt }}</span>
      <span class="bzl__rot bzl__rot--baixo" :style="{ top: ROTULOS.p10.y }">{{ ROTULOS.p10.txt }}</span>
    </div>
    <div class="bzl__eixo" aria-hidden="true"><span>hoje, R$ 1 milhão</span><span>em {{ X.horizonte }}</span></div>
  </figure>
</template>

<style scoped>
.bzl { margin: 0; }
.bzl__caixa { position: relative; aspect-ratio: 1000 / 420; margin-right: 112px; }
.bzl__svg, .bzl__tela { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: visible; }
.bzl__base { stroke: var(--nu-cream-text-18); stroke-width: 1; stroke-dasharray: 3 5; }
.bzl__faixa { fill: var(--nu-cream-text-08); }
.bzl__borda { fill: none; stroke: var(--nu-cream-text-30); stroke-width: 1; }
.bzl__meio { fill: none; stroke: var(--nu-cream); stroke-width: 2; filter: drop-shadow(0 0 6px var(--nu-blue-soft)); }
.bzl__ponto { position: absolute; left: 100%; width: 9px; height: 9px; border-radius: 50%; transform: translate(-50%, -50%); }
.bzl__ponto--alto { background: var(--nu-green-soft); box-shadow: 0 0 16px 2px color-mix(in srgb, var(--nu-green-soft) 50%, transparent); }
.bzl__ponto--baixo { background: var(--nu-red-soft); box-shadow: 0 0 16px 2px color-mix(in srgb, var(--nu-red-soft) 50%, transparent); }
.bzl__rot {
  position: absolute; left: calc(100% + 14px); transform: translateY(-50%); white-space: nowrap;
  font-size: var(--nu-fs-md); font-weight: 700; letter-spacing: -0.01em; font-variant-numeric: tabular-nums;
}
.bzl__rot--alto { color: var(--nu-green-soft); }
.bzl__rot--baixo { color: var(--nu-red-soft); }
.bzl__eixo {
  display: flex; justify-content: space-between; margin: 12px 112px 0 0; padding-top: 10px;
  border-top: 1px solid var(--nu-cream-text-14);
  color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 600;
}
@media (max-width: 560px) {
  .bzl__caixa { aspect-ratio: 1000 / 620; margin-right: 92px; }
  .bzl__eixo { margin-right: 92px; }
  .bzl__rot { font-size: var(--nu-fs-sm); left: calc(100% + 10px); }
}
</style>

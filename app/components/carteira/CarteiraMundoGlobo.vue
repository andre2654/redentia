<script setup lang="ts">
// Variação 1 do "No mundo" (05/11/2026): o globo de pontos. Entra girando
// devagar até o Brasil, os arcos saem do Brasil para onde o dinheiro está exposto e um
// brilho corre neles três vezes; depois para. Hover na lista (ou perto de uma
// chegada) acende aquele lugar e vira o globo até ele; arrastar gira.
//
// Custo: o requestAnimationFrame só roda enquanto há movimento; pausa com a
// seção fora da tela ou a aba oculta. Reduzir movimento: o quadro final, sem
// giro nem brilho. Sem JS fica a esfera em CSS, e a lista ao lado diz tudo:
// o globo só embeleza.
import type { FatiaMundo } from '~/utils/exposicaoNoMundo'
import {
  ancoraNoCanvas,
  desenharGlobo,
  prepararCena,
  vistaEntre,
  type CenaPreparada,
  type QuadroGlobo,
  type VistaGlobo,
} from '~/utils/globoDePontos'

type FatiaCor = FatiaMundo & { cor: string }

const props = defineProps<{ fatias: FatiaCor[]; ativo: string | null }>()
const emit = defineEmits<{ (e: 'ativo', chave: string | null): void }>()

const BRASIL: [number, number] = [-51, -12]
const COR_BRASIL = '#2F6AFF'

const caixa = ref<HTMLDivElement | null>(null)
const tela = ref<HTMLCanvasElement | null>(null)
const lado = ref(0)
const dica = ref<{ x: number; y: number; nome: string; pct: string } | null>(null)

// países e regiões com ponto de chegada (a região de receita tem âncora; a de
// ETF, não). Arco só para os 6 maiores (a lista dá linha própria a até 6
// lugares): com o dado real (05/11/2026) a receita da Irani (RANI3) sozinha espalha o
// dinheiro em 15 países, e 19 arcos viravam um novelo. Os pequenos seguem
// acesos no globo, só sem arco.
const ARCOS_NO_MAXIMO = 6
const destinos = computed(() => props.fatias.filter((f) => f.ancora && f.chave !== 'BR').slice(0, ARCOS_NO_MAXIMO))
const alvo = computed<VistaGlobo>(() => vistaEntre(BRASIL, destinos.value[0]?.ancora ?? null))

let cena: CenaPreparada | null = null
function montarCena() {
  cena = prepararCena({
    camadas: props.fatias
      .filter((f) => f.paises.length || f.todos)
      .map((f) => ({ chave: f.chave, cor: f.cor, paises: f.paises, todos: f.todos, forte: f.tipo === 'pais' })),
    arcos: destinos.value.map((f) => ({ chave: f.chave, cor: f.cor, de: BRASIL, para: f.ancora! })),
    origem: BRASIL,
    origemCor: props.fatias.find((f) => f.chave === 'BR')?.cor ?? COR_BRASIL,
    ativo: props.ativo,
  })
}

/* ————— o relógio: só anda enquanto há o que mover ————— */

const quadro: QuadroGlobo = { lon0: 0, lat0: 0, arcos: 0, pulsos: [] }
interface Anim { t0: number; dur: number; passo: (k: number) => void; fim?: () => void }
let anims: Anim[] = []
let raf = 0
let visivel = false
let abaOculta = false
let pausadoEm = 0
let calmo = false
let comecou = false
let arrastando = false

const easeOut = (k: number) => 1 - Math.pow(1 - k, 3)
const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)

function desenhar() {
  const c = tela.value
  if (!c || !cena || !lado.value) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  desenharGlobo(ctx, lado.value, cena, quadro)
}

function tick(agora: number) {
  raf = 0
  anims = anims.filter((a) => {
    const k = Math.min(1, Math.max(0, (agora - a.t0) / a.dur))
    a.passo(k)
    if (k >= 1) { a.fim?.(); return false }
    return true
  })
  desenhar()
  if (anims.length && podeAndar()) raf = requestAnimationFrame(tick)
}
const podeAndar = () => visivel && !abaOculta
function acordar() {
  if (!raf && anims.length && podeAndar()) raf = requestAnimationFrame(tick)
}
function pausar() {
  if (raf) { cancelAnimationFrame(raf); raf = 0 }
  pausadoEm = performance.now()
}
function retomar() {
  if (pausadoEm) {
    const d = performance.now() - pausadoEm
    for (const a of anims) a.t0 += d
    pausadoEm = 0
  }
  acordar()
}
function animar(dur: number, passo: (k: number) => void, atraso = 0, fim?: () => void) {
  anims.push({ t0: performance.now() + atraso, dur, passo: (k) => { if (k > 0 || atraso === 0) passo(k) }, fim })
  acordar()
}

function girarPara(v: VistaGlobo, dur: number) {
  if (calmo) { quadro.lon0 = v.lon0; quadro.lat0 = v.lat0; desenhar(); return }
  anims = anims.filter((a) => !(a as Anim & { giro?: boolean }).giro)
  const de = { lon0: quadro.lon0, lat0: quadro.lat0 }
  // o caminho curto em longitude
  let dl = ((v.lon0 - de.lon0 + 540) % 360) - 180
  if (Math.abs(dl) < 0.01) dl = 0
  const a: Anim & { giro?: boolean } = {
    t0: performance.now(), dur, giro: true,
    passo: (k) => { const e = easeInOut(k); quadro.lon0 = de.lon0 + dl * e; quadro.lat0 = de.lat0 + (v.lat0 - de.lat0) * e },
  }
  anims.push(a)
  acordar()
}

function pulsar(vezes: number, so: number | null = null) {
  if (calmo || !cena?.arcos.length) return
  const n = cena.arcos.length
  quadro.pulsos = Array.from({ length: n }, () => null)
  for (let v = 0; v < vezes; v++) {
    for (let i = 0; i < n; i++) {
      if (so != null && i !== so) continue
      animar(1700, (k) => { quadro.pulsos[i] = k < 1 ? easeInOut(k) : null }, v * 2300 + (so != null ? 0 : i * 260))
    }
  }
}

/** A entrada: gira ~110° até o Brasil, os arcos desenham, o brilho passa três vezes. */
function entrar() {
  if (comecou || !cena) return
  comecou = true
  const v = alvo.value
  if (calmo) {
    Object.assign(quadro, v, { arcos: 1 })
    desenhar()
    return
  }
  quadro.lon0 = v.lon0 + 110
  quadro.lat0 = v.lat0 - 10
  quadro.arcos = 0
  const de = { lon0: quadro.lon0, lat0: quadro.lat0 }
  animar(2800, (k) => {
    const e = easeOut(k)
    quadro.lon0 = de.lon0 + (v.lon0 - de.lon0) * e
    quadro.lat0 = de.lat0 + (v.lat0 - de.lat0) * e
  })
  animar(1300, (k) => { quadro.arcos = easeInOut(k) }, 1500, () => pulsar(3))
}

/* ————— tamanho, visibilidade e aba ————— */

function medir() {
  const el = caixa.value
  const c = tela.value
  if (!el || !c) return
  const s = Math.round(el.clientWidth)
  if (!s || s === lado.value) return
  lado.value = s
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  c.width = s * dpr
  c.height = s * dpr
  desenhar()
}

let ro: ResizeObserver | null = null
let io: IntersectionObserver | null = null
const aoMudarAba = () => {
  abaOculta = document.visibilityState === 'hidden'
  if (abaOculta) pausar()
  else retomar()
}

onMounted(() => {
  calmo = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  montarCena()
  // antes de entrar na tela, o quadro já fica no lugar de partida
  Object.assign(quadro, alvo.value, { arcos: calmo ? 1 : 0, lon0: alvo.value.lon0 + (calmo ? 0 : 110), lat0: alvo.value.lat0 - (calmo ? 0 : 10) })
  medir()
  ro = new ResizeObserver(medir)
  if (caixa.value) ro.observe(caixa.value)
  io = new IntersectionObserver(([e]) => {
    visivel = !!e?.isIntersecting
    if (visivel) { entrar(); retomar() } else pausar()
  }, { threshold: 0.25 })
  if (caixa.value) io.observe(caixa.value)
  document.addEventListener('visibilitychange', aoMudarAba)
})
onBeforeUnmount(() => {
  pausar()
  ro?.disconnect()
  io?.disconnect()
  document.removeEventListener('visibilitychange', aoMudarAba)
})

watch(() => props.fatias, () => { montarCena(); desenhar() })
watch(() => props.ativo, (chave) => {
  if (!cena) return
  cena.cena.ativo = chave
  const f = chave ? props.fatias.find((x) => x.chave === chave) : null
  if (f?.ancora && comecou && !arrastando) {
    girarPara(vistaEntre(BRASIL, f.chave === 'BR' ? null : f.ancora), 900)
    const i = cena.arcos.findIndex((a) => a.chave === chave)
    if (i >= 0 && quadro.arcos >= 1) pulsar(1, i)
  }
  desenhar()
})

/* ————— o ponteiro: hover nas chegadas e arrastar para girar ————— */

let ultimo: { x: number; y: number } | null = null
function aoMover(e: PointerEvent) {
  const el = tela.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const x = e.clientX - r.left
  const y = e.clientY - r.top
  if (arrastando && ultimo) {
    quadro.lon0 -= (x - ultimo.x) * 0.38
    quadro.lat0 = Math.max(-60, Math.min(60, quadro.lat0 + (y - ultimo.y) * 0.3))
    ultimo = { x, y }
    desenhar()
    return
  }
  // a chegada mais perto, dentro de 26 px
  let melhor: { f: FatiaCor; d: number; x: number; y: number } | null = null
  const marcos = [...destinos.value, ...props.fatias.filter((f) => f.chave === 'BR')]
  for (const f of marcos) {
    const a = ancoraNoCanvas(lado.value, quadro, f.ancora![0], f.ancora![1])
    if (!a.visivel) continue
    const d = Math.hypot(a.x - x, a.y - y)
    if (d < 26 && (!melhor || d < melhor.d)) melhor = { f, d, x: a.x, y: a.y }
  }
  if (melhor) {
    dica.value = { x: melhor.x, y: melhor.y, nome: melhor.f.nome, pct: melhor.f.pctTxt }
    if (props.ativo !== melhor.f.chave) emit('ativo', melhor.f.chave)
  } else if (dica.value) {
    dica.value = null
    emit('ativo', null)
  }
}
function aoApertar(e: PointerEvent) {
  const el = tela.value
  if (!el || e.button !== 0) return
  arrastando = true
  anims = anims.filter((a) => !(a as Anim & { giro?: boolean }).giro)
  const r = el.getBoundingClientRect()
  ultimo = { x: e.clientX - r.left, y: e.clientY - r.top }
  el.setPointerCapture(e.pointerId)
}
function aoSoltar(e: PointerEvent) {
  arrastando = false
  ultimo = null
  tela.value?.releasePointerCapture?.(e.pointerId)
}
function aoSair() {
  if (arrastando) return
  dica.value = null
  emit('ativo', null)
}
</script>

<template>
  <div ref="caixa" class="cmg" aria-hidden="true">
    <div class="cmg__esfera" />
    <canvas
      ref="tela" class="cmg__tela"
      @pointermove="aoMover" @pointerdown="aoApertar" @pointerup="aoSoltar" @pointercancel="aoSoltar" @pointerleave="aoSair"
    />
    <div v-if="dica" class="cmg__dica" :style="{ left: `${dica.x}px`, top: `${dica.y}px` }">
      <strong>{{ dica.nome }}</strong> {{ dica.pct }}
    </div>
  </div>
</template>

<style scoped>
.cmg { position: relative; width: 100%; aspect-ratio: 1 / 1; }
/* a esfera em CSS: o que fica sem JS (e embaixo do canvas, antes do 1º quadro) */
.cmg__esfera {
  position: absolute; inset: 10%; border-radius: 50%;
  background: radial-gradient(circle at 30% 26%, #FFFFFF 0%, #F5F8FE 48%, #DCE5F5 100%);
  box-shadow: 0 0 0 1px rgba(12, 21, 36, 0.05), 0 40px 80px -40px rgba(12, 21, 36, 0.35), 0 0 90px 10px rgba(47, 106, 255, 0.10);
}
.cmg__tela { position: absolute; inset: 0; width: 100%; height: 100%; cursor: grab; touch-action: pan-y; }
.cmg__tela:active { cursor: grabbing; }
.cmg__dica {
  position: absolute; transform: translate(-50%, calc(-100% - 14px)); pointer-events: none; white-space: nowrap;
  background: var(--nu-navy); color: var(--nu-cream-text); border-radius: var(--nu-r-pill);
  padding: 7px 12px; font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums;
  box-shadow: 0 18px 40px -18px rgba(12, 21, 36, 0.5);
  animation: cmg-dica .18s cubic-bezier(.2, .8, .2, 1) both;
}
.cmg__dica strong { font-weight: 800; margin-right: 4px; }
@keyframes cmg-dica { from { opacity: 0; transform: translate(-50%, calc(-100% - 8px)); } }
</style>

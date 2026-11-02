<script setup lang="ts">
// Rodapé, direção 1 "Os caminhos" (protótipo de 02/11/2026, ?rodape=1 no dev).
// O título diz "a Redentia tem um caminho": aqui ele é desenhado com a
// assinatura do próprio produto, o leque do motor de cenários. 2.000 caminhos
// finos saem de um ponto só, "hoje", e se abrem para a direita até sair da
// tela; somados em luz (composição aditiva), o feixe fica incandescente onde
// os caminhos se juntam, perto de hoje, e se apaga nas pontas. Um deles vem
// aceso, em creme: o caminho, que é a linha do meio (a mediana de cada mês),
// calma no meio do ruído. Passar o mouse acende o caminho sorteado mais perto
// do cursor (cada linha é um caminho possível).
//
// É ilustração do método, não carteira de ninguém: sem R$, sem %, sem eixo.
// Passeio aleatório mensal com semente fixa (o mesmo desenho em toda visita),
// como o HomeLeque, só que monocromático e sem os nomes das pontas. O número
// de verdade só existe na /carteira, que roda o motor.
//
// Canvas e não SVG pelo mesmo motivo do HomeLeque (2.000 caminhos em SVG
// pesariam no HTML do SSR): o feixe é pintado uma vez num quadro fora da tela
// e a entrada só revela esse quadro da esquerda para a direita. Antes do JS a
// caixa já tem o tamanho final; com movimento reduzido, aparece pronto.
const CAMINHOS = 2000
const MESES = 120

const cena = ref<HTMLElement | null>(null)
const tela = ref<HTMLCanvasElement | null>(null)

function sorteador(semente: number) {
  let a = semente >>> 0
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Feixe { logs: Float32Array; ordem: Int32Array; meio: Float32Array; topo: number }

function sortear(): Feixe {
  const r = sorteador(20261102)
  const normal = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r())
  const mu = 0.006, sigma = 0.045
  const logs = new Float32Array(CAMINHOS * (MESES + 1))
  for (let i = 0; i < CAMINHOS; i++) {
    let l = 0
    for (let m = 1; m <= MESES; m++) {
      l += mu - (sigma * sigma) / 2 + sigma * normal()
      logs[i * (MESES + 1) + m] = l
    }
  }
  const finais = Array.from({ length: CAMINHOS }, (_, i) => logs[i * (MESES + 1) + MESES]!)
  const ordem = Int32Array.from(finais.map((_, i) => i).sort((a, b) => finais[a]! - finais[b]!))
  // a linha do meio: a mediana mês a mês (como a linha branca do HomeLeque)
  const meio = new Float32Array(MESES + 1)
  const col = new Float32Array(CAMINHOS)
  for (let m = 0; m <= MESES; m++) {
    for (let i = 0; i < CAMINHOS; i++) col[i] = logs[i * (MESES + 1) + m]!
    col.sort()
    meio[m] = col[Math.floor(CAMINHOS / 2)]!
  }
  return { logs, ordem, meio, topo: finais[ordem[Math.floor(0.99 * (CAMINHOS - 1))]!]! }
}

let feixe: Feixe | null = null
let quadro: HTMLCanvasElement | null = null
let raf = 0
let progresso = 1
let aceso = -1 // o caminho sob o cursor (-1: o destaque)
let olho: IntersectionObserver | null = null
let medida: ResizeObserver | null = null

function geometria(w: number, h: number) {
  const estreito = w < 700
  const x0 = estreito ? 22 : Math.min(80, Math.max(22, w * 0.055))
  const x1 = w + 24 // os caminhos saem da tela pela direita
  const y0 = h * (estreito ? 0.72 : 0.7)
  const k = (y0 - h * 0.06) / feixe!.topo
  return { x: (m: number) => x0 + ((x1 - x0) * m) / MESES, y: (l: number) => y0 - l * k, x0, y0 }
}

function cores(el: HTMLElement) {
  const cs = getComputedStyle(el)
  const v = (n: string) => cs.getPropertyValue(n).trim()
  return { luz: v('--nu-blue-soft'), creme: v('--nu-cream'), sub: v('--nu-cream-text-78') }
}

/** i >= 0: um caminho sorteado; i = -1: a linha do meio */
const valor = (i: number, m: number) => (i < 0 ? feixe!.meio[m]! : feixe!.logs[i * (MESES + 1) + m]!)
function tracar(g: CanvasRenderingContext2D, i: number, x: (m: number) => number, y: (l: number) => number, ate = MESES) {
  g.beginPath()
  for (let m = 0; m <= ate; m++) {
    const l = valor(i, m)
    if (m === 0) g.moveTo(x(m), y(l))
    else g.lineTo(x(m), y(l))
  }
}

function desenharQuadro(w: number, h: number, dpr: number) {
  const c = cores(tela.value!)
  quadro = document.createElement('canvas')
  quadro.width = Math.round(w * dpr)
  quadro.height = Math.round(h * dpr)
  const g = quadro.getContext('2d')!
  g.scale(dpr, dpr)
  const { x, y } = geometria(w, h)
  g.globalCompositeOperation = 'lighter'
  g.lineWidth = w < 700 ? 0.8 : 1
  g.lineJoin = 'round'
  g.strokeStyle = c.luz
  // tela estreita junta os mesmos 2.000 caminhos em menos pixels: menos luz por traço
  const forca = 0.034 * Math.min(1, Math.max(0.5, w / 1200))
  for (let k = 0; k < CAMINHOS; k++) {
    const r = k / (CAMINHOS - 1)
    // as pontas do leque mais fracas: o feixe acaba em névoa, não num corte
    g.globalAlpha = forca * (1 - Math.pow(Math.abs(r - 0.5) * 2, 3) * 0.7)
    tracar(g, feixe!.ordem[k]!, x, y)
    g.stroke()
  }
}

function pintar() {
  const el = tela.value
  if (!el || !quadro || !feixe) return
  const w = el.clientWidth, h = el.clientHeight
  const dpr = quadro.width / w
  const ctx = el.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  const c = cores(el)
  const { x, y, x0, y0 } = geometria(w, h)
  const p = progresso
  const ate = Math.round(MESES * p)
  const xr = x(MESES * p)
  if (p >= 1) ctx.drawImage(quadro, 0, 0, w, h)
  else if (xr > 0) {
    // a frente do feixe chega em degradê, como luz, e não num corte reto
    ctx.drawImage(quadro, 0, 0, Math.ceil(xr * dpr), quadro.height, 0, 0, Math.ceil(xr), h)
    const frente = ctx.createLinearGradient(Math.max(0, xr - 160), 0, xr, 0)
    frente.addColorStop(0, c.creme)
    frente.addColorStop(1, 'transparent')
    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillStyle = frente
    ctx.fillRect(0, 0, xr, h)
    ctx.globalCompositeOperation = 'source-over'
  }

  // o caminho aceso: creme, com brilho, até onde o desenho chegou (o do cursor, ou a linha do meio)
  const i = aceso
  ctx.save()
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.strokeStyle = c.creme
  ctx.shadowColor = c.luz
  ctx.shadowBlur = i < 0 ? 16 : 8
  ctx.lineWidth = i < 0 ? 2 : 1.3
  tracar(ctx, i, x, y, ate)
  ctx.stroke()
  ctx.restore()
  // a cabeça do caminho enquanto ele se desenha
  if (p < 1 && ate > 0) {
    const l = valor(i, ate)
    ctx.save()
    ctx.fillStyle = c.creme
    ctx.shadowColor = c.creme
    ctx.shadowBlur = 18
    ctx.beginPath()
    ctx.arc(x(ate), y(l), 3.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // hoje: o ponto de onde tudo sai
  ctx.save()
  ctx.fillStyle = c.creme
  ctx.shadowColor = c.luz
  ctx.shadowBlur = 24
  ctx.beginPath()
  ctx.arc(x0, y0, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ctx.fillStyle = c.sub
  ctx.font = '700 12px "Plus Jakarta Sans", system-ui, sans-serif'
  ctx.textBaseline = 'top'
  ctx.fillText('hoje', x0 - 3, y0 + 20)
}

function preparar() {
  const el = tela.value
  if (!el || !feixe) return
  const w = el.clientWidth, h = el.clientHeight
  if (!w || !h) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  el.width = Math.round(w * dpr)
  el.height = Math.round(h * dpr)
  desenharQuadro(w, h, dpr)
  pintar()
}

function revelar() {
  const inicio = performance.now()
  const dur = 2400
  const passo = (agora: number) => {
    const f = Math.min(1, (agora - inicio) / dur)
    progresso = 1 - Math.pow(1 - f, 2.4)
    pintar()
    if (f < 1) raf = requestAnimationFrame(passo)
  }
  raf = requestAnimationFrame(passo)
}

// o cursor acende o caminho mais perto dele no mês em que está
function mover(e: PointerEvent) {
  if (e.pointerType === 'touch' || !tela.value || !feixe || progresso < 1) return
  const r = tela.value.getBoundingClientRect()
  const { x, y, x0 } = geometria(r.width, r.height)
  const px = e.clientX - r.left, py = e.clientY - r.top
  const m = Math.max(1, Math.min(MESES, Math.round(((px - x0) / (x(MESES) - x0)) * MESES)))
  if (px < x0) { soltar(); return }
  let melhor = -1, dist = Infinity
  for (let i = 0; i < CAMINHOS; i++) {
    const dd = Math.abs(y(feixe.logs[i * (MESES + 1) + m]!) - py)
    if (dd < dist) { dist = dd; melhor = i }
  }
  const novo = dist < 28 ? melhor : -1
  if (novo !== aceso) { aceso = novo; cancelAnimationFrame(raf); raf = requestAnimationFrame(pintar) }
}
function soltar() {
  if (aceso === -1) return
  aceso = -1
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(pintar)
}

onMounted(() => {
  feixe = sortear()
  const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  progresso = calmo || !('IntersectionObserver' in window) ? 1 : 0
  void document.fonts?.ready.then(() => preparar())
  preparar()
  let pendente = 0
  medida = new ResizeObserver(() => { cancelAnimationFrame(pendente); pendente = requestAnimationFrame(preparar) })
  if (cena.value) medida.observe(cena.value)
  if (progresso < 1 && cena.value) {
    olho = new IntersectionObserver((vistos) => {
      if (!vistos.some((v) => v.isIntersecting)) return
      olho?.disconnect()
      revelar()
    }, { threshold: 0.35 })
    olho.observe(cena.value)
  }
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  olho?.disconnect()
  medida?.disconnect()
})
</script>

<template>
  <div data-banda="caminhos" class="nrw">
    <h2 class="nrw__titulo">Seja qual for a sua meta, a Redentia tem um caminho.</h2>
    <div ref="cena" class="nrw__cena" @pointermove="mover" @pointerleave="soltar">
      <canvas ref="tela" class="nrw__tela" aria-hidden="true" />
    </div>
    <p class="nrw__legenda">Ilustração do motor de cenários: 2.000 caminhos possíveis a partir de hoje.</p>
    <div class="nrw__base"><slot name="base" /></div>
    <div class="nrw__grao" aria-hidden="true" />
  </div>
</template>

<style scoped>
.nrw {
  --g: clamp(22px, 5.5vw, 80px);
  position: relative;
  /* a luz nasce de hoje (embaixo, à esquerda) e se apaga antes da base: sem emenda com o navy do rodapé */
  background:
    radial-gradient(60% 50% at 70% 34%, color-mix(in srgb, var(--nu-blue-deep) 22%, transparent) 0%, transparent 100%),
    var(--nu-navy);
}
.nrw__titulo {
  position: absolute; z-index: 1; top: 0; left: 0; margin: 0; padding: 0 var(--g);
  max-width: min(60%, 860px); box-sizing: border-box;
  color: var(--nu-cream-text); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.045em; line-height: 1.03;
  text-wrap: balance; pointer-events: none;
}
.nrw__cena { position: relative; height: clamp(440px, 46vw, 660px); cursor: crosshair; }
/* a luz de hoje: um halo azul atrás do ponto de onde os caminhos saem */
.nrw__cena::before {
  content: ''; position: absolute; pointer-events: none;
  left: calc(var(--g) - min(36vw, 300px)); top: calc(70% - min(30vw, 250px)); width: min(72vw, 600px); height: min(60vw, 500px);
  background: radial-gradient(closest-side, color-mix(in srgb, var(--nu-blue) 30%, transparent), transparent);
}
.nrw__tela {
  position: absolute; inset: 0; width: 100%; height: 100%; display: block;
  /* as pontas do leque somem em névoa, em cima e embaixo, sem borda de caixa */
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, var(--nu-navy) 14%, var(--nu-navy) 78%, transparent 100%);
  mask-image: linear-gradient(180deg, transparent 0%, var(--nu-navy) 14%, var(--nu-navy) 78%, transparent 100%);
}
.nrw__grao {
  position: absolute; inset: 0; pointer-events: none; opacity: .3; mix-blend-mode: overlay;
  /* o grão some nas bordas da banda: sem emenda com as colunas em cima e com o pé do rodapé */
  -webkit-mask-image: linear-gradient(180deg, transparent, var(--nu-navy) 12%, var(--nu-navy) 72%, transparent);
  mask-image: linear-gradient(180deg, transparent, var(--nu-navy) 12%, var(--nu-navy) 72%, transparent);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
}
.nrw__legenda {
  position: absolute; z-index: 1; top: 4px; right: var(--g); margin: 0; max-width: 30ch; text-align: right;
  color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5;
}
.nrw__base { position: relative; z-index: 1; margin-top: clamp(8px, 1.5vw, 20px); }

@media (max-width: 900px) {
  .nrw__titulo { position: static; max-width: none; }
  .nrw__cena { height: clamp(300px, 80vw, 420px); margin-top: 0; }
  .nrw__legenda { position: static; max-width: none; text-align: left; padding: 0 var(--g) 28px; }
}
</style>

<script setup lang="ts">
// O leque dos 2.000 cenários (31/10/2026): o momento assinatura da home. É o
// desenho do cartão "Daqui a 5 anos" do Agora (IPhoneAgoraV2, Detalhes), num
// preto de tela de app: 2.000 caminhos saem de "hoje" e se abrem em cinco
// anos, verdes no alto, vermelhos embaixo, a linha branca do meio no centro.
//
// É ilustração do método, não a carteira de ninguém: por isso não tem R$ nem
// porcentagem, só "hoje", "5 anos" e os três nomes da ponta (otimista, meio,
// pessimista). Os caminhos são um passeio aleatório mensal sorteado com
// semente fixa (o mesmo desenho em toda visita). O número da carteira de
// verdade só aparece na /carteira, que roda o motor de cenários.
//
// Canvas e não SVG: 2.000 caminhos de 60 meses em SVG seriam ~100 KB de HTML
// no SSR. O canvas desenha uma vez num quadro fora da tela e a entrada só
// revela esse quadro da esquerda para a direita (barato a 120 Hz). Com
// movimento reduzido, aparece pronto. Antes do JavaScript, a caixa preta já
// tem o tamanho final (sem CLS).
//
// Aportou (11/11/2026): `tom="carvao"` desenha o leque sobre o carvão da marca
// (a home), com o verde e o vermelho que leem sobre ele; o padrão segue o preto
// da tela do app, para quem já usa (AssinaturaBeneficios). Os nomes das pontas
// saem na fonte da página (--nu-font, a Figtree), não mais numa fonte fixa.
const props = withDefaults(defineProps<{ caminhos?: number; tom?: 'preto' | 'carvao' }>(), { caminhos: 2000, tom: 'preto' })

const MESES = 60
const caixa = ref<HTMLElement | null>(null)
const tela = ref<HTMLCanvasElement | null>(null)

// sorteio com semente fixa (mulberry32) e normal por Box-Muller
function sorteador(semente: number) {
  let a = semente >>> 0
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Leque { valores: Float32Array; ordem: Int32Array; meio: Float32Array; p5: number; p95: number; min: number; max: number }

function sortear(n: number): Leque {
  const r = sorteador(20261031)
  const normal = () => {
    const u = Math.max(r(), 1e-9)
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
  }
  // ~7% ao ano de média e ~16% de oscilação: uma carteira de ações qualquer
  const mu = 0.0055, sigma = 0.046
  const valores = new Float32Array(n * (MESES + 1))
  for (let i = 0; i < n; i++) {
    let v = 1
    valores[i * (MESES + 1)] = v
    for (let m = 1; m <= MESES; m++) {
      v *= Math.exp(mu - (sigma * sigma) / 2 + sigma * normal())
      valores[i * (MESES + 1) + m] = v
    }
  }
  const finais = Array.from({ length: n }, (_, i) => valores[i * (MESES + 1) + MESES]!)
  const ordem = Int32Array.from(finais.map((_, i) => i).sort((a, b) => finais[a]! - finais[b]!))
  // a linha do meio: a mediana mês a mês
  const meio = new Float32Array(MESES + 1)
  const col = new Float32Array(n)
  for (let m = 0; m <= MESES; m++) {
    for (let i = 0; i < n; i++) col[i] = valores[i * (MESES + 1) + m]!
    col.sort()
    meio[m] = col[Math.floor(n / 2)]!
  }
  const q = (p: number) => finais[ordem[Math.floor(p * (n - 1))]!]!
  return { valores, ordem, meio, p5: q(0.05), p95: q(0.95), min: q(0.01), max: q(0.99) }
}

let leque: Leque | null = null
let quadro: HTMLCanvasElement | null = null
let raf = 0
let olho: IntersectionObserver | null = null
let medida: ResizeObserver | null = null
let progresso = 0

function cores(el: HTMLElement) {
  const cs = getComputedStyle(el)
  const v = (n: string, d: string) => cs.getPropertyValue(n).trim() || d
  const fonte = v('--nu-font', 'system-ui, sans-serif')
  if (props.tom === 'carvao') {
    return {
      verde: v('--nu-green-soft', 'lime'),
      vermelho: v('--nu-red-soft', 'red'),
      texto: v('--nu-white', 'white'),
      sub: v('--nu-on-dark-2', 'gray'),
      fonte,
    }
  }
  return {
    verde: v('--nu-agora-verde', 'lime'),
    vermelho: v('--nu-agora-vermelho', 'red'),
    texto: v('--nu-agora-texto', 'white'),
    sub: v('--nu-agora-sub', 'gray'),
    fonte,
  }
}

// geometria do desenho, em px de CSS
function geometria(w: number, h: number) {
  // a margem da direita cabe sempre o "pessimista" (13 px em negrito + o recuo de 20)
  const esq = 18, dir = Math.min(118, Math.max(w * 0.3, 98)), topo = 18, base = 34
  const x0 = esq, x1 = w - dir
  const lmin = Math.log(leque!.min), lmax = Math.log(leque!.max)
  const y = (v: number) => topo + (h - topo - base) * (1 - (Math.log(v) - lmin) / (lmax - lmin))
  const x = (m: number) => x0 + ((x1 - x0) * m) / MESES
  return { x, y, x0, x1, h, base }
}

/** desenha o leque inteiro, uma vez, num quadro fora da tela */
function desenharQuadro(w: number, h: number, dpr: number) {
  const el = tela.value!
  const c = cores(el)
  quadro = document.createElement('canvas')
  quadro.width = Math.round(w * dpr)
  quadro.height = Math.round(h * dpr)
  const g = quadro.getContext('2d')!
  g.scale(dpr, dpr)
  const { x, y } = geometria(w, h)
  const n = props.caminhos
  g.lineWidth = 1
  g.lineJoin = 'round'
  for (let k = 0; k < n; k++) {
    const i = leque!.ordem[k]!
    const r = k / (n - 1)
    g.strokeStyle = r >= 0.8 ? c.verde : r <= 0.2 ? c.vermelho : c.texto
    g.globalAlpha = r >= 0.8 || r <= 0.2 ? 0.075 : 0.035
    g.beginPath()
    for (let m = 0; m <= MESES; m++) {
      const v = leque!.valores[i * (MESES + 1) + m]!
      if (m === 0) g.moveTo(x(m), y(v))
      else g.lineTo(x(m), y(v))
    }
    g.stroke()
  }
  g.globalAlpha = 1
}

function pintar(p: number) {
  const el = tela.value
  if (!el || !quadro || !leque) return
  const w = el.clientWidth, h = el.clientHeight
  const dpr = quadro.width / w
  const ctx = el.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  const c = cores(el)
  const { x, y, x0, x1, base } = geometria(w, h)
  // os caminhos: o quadro pronto, revelado até o mês p
  const xr = x0 + (x1 - x0) * p
  if (xr > 0) ctx.drawImage(quadro, 0, 0, Math.ceil(xr * dpr) + 2, quadro.height, 0, 0, Math.ceil(xr) + 2 / dpr, h)
  // a linha do meio, grossa, até onde o desenho chegou
  const ate = Math.max(0, Math.min(MESES, Math.round(MESES * p)))
  ctx.strokeStyle = c.texto
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  for (let m = 0; m <= ate; m++) {
    const yy = y(leque.meio[m]!)
    if (m === 0) ctx.moveTo(x(m), yy)
    else ctx.lineTo(x(m), yy)
  }
  ctx.stroke()
  // o ponto de hoje
  ctx.fillStyle = c.texto
  ctx.beginPath()
  ctx.arc(x(0), y(1), 5, 0, Math.PI * 2)
  ctx.fill()
  // as três pontas e os nomes, quando o desenho termina
  const fim = Math.max(0, (p - 0.86) / 0.14)
  ctx.font = `700 13px ${c.fonte}`
  ctx.textBaseline = 'middle'
  if (fim > 0) {
    ctx.globalAlpha = fim
    const pontas: [number, string, string][] = [
      [leque.p95, c.verde, 'otimista'],
      [leque.meio[MESES]!, c.texto, 'meio'],
      [leque.p5, c.vermelho, 'pessimista'],
    ]
    for (const [v, cor, nome] of pontas) {
      const yy = y(v)
      ctx.strokeStyle = cor
      ctx.globalAlpha = fim * 0.5
      ctx.lineWidth = 1
      ctx.setLineDash([2, 3])
      ctx.beginPath()
      ctx.moveTo(x1, yy)
      ctx.lineTo(x1 + 14, yy)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = fim
      ctx.fillStyle = cor
      ctx.beginPath()
      ctx.arc(x1, yy, 4.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillText(nome, x1 + 20, yy)
    }
    ctx.globalAlpha = 1
  }
  // o eixo: hoje e 5 anos
  ctx.fillStyle = c.sub
  ctx.font = `700 12.5px ${c.fonte}`
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillText('hoje', x0, h - base / 2 + 4)
  ctx.textAlign = 'right'
  ctx.fillText('5 anos', x1, h - base / 2 + 4)
  ctx.textAlign = 'left'
}

function preparar() {
  const el = tela.value
  if (!el) return
  const w = el.clientWidth, h = el.clientHeight
  if (!w || !h) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  el.width = Math.round(w * dpr)
  el.height = Math.round(h * dpr)
  desenharQuadro(w, h, dpr)
  pintar(progresso)
}

function revelar() {
  const inicio = performance.now()
  const dur = 1500
  const passo = (agora: number) => {
    const f = Math.min(1, (agora - inicio) / dur)
    progresso = 1 - Math.pow(1 - f, 3)
    pintar(progresso)
    if (f < 1) raf = requestAnimationFrame(passo)
  }
  raf = requestAnimationFrame(passo)
}

onMounted(() => {
  leque = sortear(props.caminhos)
  const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  progresso = calmo || !('IntersectionObserver' in window) ? 1 : 0
  // a fonte da página precisa estar pronta para os nomes saírem nela
  void document.fonts?.ready.then(() => preparar())
  preparar()
  medida = new ResizeObserver(() => preparar())
  if (caixa.value) medida.observe(caixa.value)
  if (progresso < 1 && caixa.value) {
    olho = new IntersectionObserver((vistos) => {
      if (!vistos.some((v) => v.isIntersecting)) return
      olho?.disconnect()
      revelar()
    }, { threshold: 0.4 })
    olho.observe(caixa.value)
  }
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  olho?.disconnect()
  medida?.disconnect()
})
</script>

<template>
  <div ref="caixa" class="hlq" :class="{ 'hlq--carvao': tom === 'carvao' }" aria-hidden="true">
    <canvas ref="tela" class="hlq__tela" />
  </div>
</template>

<style scoped>
.hlq { position: relative; width: 100%; aspect-ratio: 16 / 10; background: var(--nu-agora-bg); }
.hlq--carvao { background: var(--nu-ink); }
.hlq__tela { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
</style>

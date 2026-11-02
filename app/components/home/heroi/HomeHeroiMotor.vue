<script setup lang="ts">
// Herói do visitante, direção 2 "O motor" (protótipo de 02/11/2026, ?heroi=2
// no dev). O objeto do herói é a assinatura do produto, desenhada ao vivo: os
// 2.000 caminhos do motor de cenários saindo de um ponto só, "hoje", e se
// abrindo em cinco anos. É o irmão do rodapé (NuFooterLinha): lá, o navy, o
// título em peso 500 e UMA linha de luz, o Ibovespa desde 1995 (o passado);
// aqui, o mesmo navy, o mesmo título leve e duas mil linhas (o futuro da
// carteira). Os aparelhos saem do herói; a linha "Em breve no iPhone, no Mac e
// no Apple Watch" fica na chamada.
//
// Ilustração do método, não carteira de ninguém: sem R$ e sem %, só "hoje",
// "5 anos" e os três nomes da ponta, como o HomeLeque. Passeio aleatório mensal
// com semente fixa (o mesmo desenho em toda visita). A legenda diz isso.
// O desenho é o do protótipo "Os caminhos" do rodapé (4de2b4e5), em luz
// aditiva, com a linha do meio acesa; o cursor acende o caminho mais perto.
//
// Canvas, e não SVG: 2.000 caminhos em SVG pesariam ~100 KB no HTML do SSR. O
// feixe é pintado uma vez num quadro fora da tela, e a entrada só revela o
// quadro da esquerda para a direita. A caixa tem a altura final antes do JS
// (sem CLS) e o LCP é o título, que é texto.
const CAMINHOS = 2000
const MESES = 60

const cena = ref<HTMLElement | null>(null)
const tela = ref<HTMLCanvasElement | null>(null)
// computador (≥ 1.024 px): o texto à esquerda e o feixe à direita, numa dobra só
const lado = ref(false)

function sorteador(semente: number) {
  let a = semente >>> 0
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Feixe { logs: Float32Array; ordem: Int32Array; meio: Float32Array; p5: number; p95: number; min: number; max: number }

function sortear(): Feixe {
  const r = sorteador(20261102)
  const normal = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r())
  // ~7% ao ano de média e ~16% de oscilação: uma carteira de ações qualquer (como o HomeLeque)
  const mu = 0.0055, sigma = 0.046
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
  const meio = new Float32Array(MESES + 1)
  const col = new Float32Array(CAMINHOS)
  for (let m = 0; m <= MESES; m++) {
    for (let i = 0; i < CAMINHOS; i++) col[i] = logs[i * (MESES + 1) + m]!
    col.sort()
    meio[m] = col[Math.floor(CAMINHOS / 2)]!
  }
  const q = (p: number) => finais[ordem[Math.floor(p * (CAMINHOS - 1))]!]!
  return { logs, ordem, meio, p5: q(0.05), p95: q(0.95), min: q(0.005), max: q(0.995) }
}

let feixe: Feixe | null = null
let quadro: HTMLCanvasElement | null = null
let raf = 0
let progresso = 1
let aceso = -1 // o caminho sob o cursor (-1: a linha do meio)
let medida: ResizeObserver | null = null

// geometria, em px de CSS: o feixe sai do gutter da esquerda e acaba antes dos
// nomes da ponta, que ficam no gutter da direita
function geometria(w: number, h: number) {
  const g = Math.min(80, Math.max(22, w * 0.055))
  const estreito = w < 560
  // no computador a cena começa na coluna da direita, colada ao texto: o feixe sai da borda dela
  const x0 = lado.value ? 6 : g
  const x1 = w - g - (estreito ? 74 : 96)
  const topo = 10, base = 28
  const lmin = feixe!.min, lmax = feixe!.max
  const y = (l: number) => topo + (h - topo - base) * (1 - (l - lmin) / (lmax - lmin))
  const x = (m: number) => x0 + ((x1 - x0) * m) / MESES
  return { x, y, x0, x1, base, estreito }
}

function cores(el: HTMLElement) {
  const cs = getComputedStyle(el)
  const v = (n: string) => cs.getPropertyValue(n).trim()
  return {
    luz: v('--nu-blue-soft'), creme: v('--nu-cream'), sub: v('--nu-cream-text-55'),
    verde: v('--nu-green-soft'), vermelho: v('--nu-red-soft'), fio: v('--nu-cream-text-18'),
  }
}

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
  // tela estreita junta os mesmos 2.000 caminhos em menos pixels: menos luz por traço
  const forca = 0.04 * Math.min(1, Math.max(0.5, w / 1200))
  for (let k = 0; k < CAMINHOS; k++) {
    const r = k / (CAMINHOS - 1)
    // o quinto de cima puxa para o verde e o de baixo para o rosa, bem de leve:
    // é onde ficam o otimista e o pessimista
    g.strokeStyle = r >= 0.8 ? c.verde : r <= 0.2 ? c.vermelho : c.luz
    g.globalAlpha = forca * (r >= 0.8 || r <= 0.2 ? 0.8 : 1)
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
  const { x, y, x0, x1, base, estreito } = geometria(w, h)
  const p = progresso
  const ate = Math.round(MESES * p)
  const xr = x(MESES * p) + 2
  if (p >= 1) ctx.drawImage(quadro, 0, 0, w, h)
  else if (xr > 0) {
    // a frente do feixe chega em degradê, como luz, e não num corte reto
    ctx.drawImage(quadro, 0, 0, Math.ceil(xr * dpr), quadro.height, 0, 0, Math.ceil(xr), h)
    const frente = ctx.createLinearGradient(Math.max(0, xr - 140), 0, xr, 0)
    frente.addColorStop(0, c.creme)
    frente.addColorStop(1, 'transparent')
    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillStyle = frente
    ctx.fillRect(0, 0, xr, h)
    ctx.globalCompositeOperation = 'source-over'
  }

  // o eixo de "5 anos": um fio, para o corte do feixe ser a data e não a borda da caixa
  if (p > 0.9) {
    ctx.save()
    ctx.globalAlpha = Math.min(1, (p - 0.9) / 0.1)
    ctx.strokeStyle = c.fio
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x1 + 0.5, 6)
    ctx.lineTo(x1 + 0.5, h - base)
    ctx.stroke()
    ctx.restore()
  }

  // o caminho aceso: o do cursor, ou a linha do meio
  ctx.save()
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.strokeStyle = c.creme
  ctx.shadowColor = c.luz
  ctx.shadowBlur = aceso < 0 ? 14 : 8
  ctx.lineWidth = aceso < 0 ? 2.2 : 1.3
  tracar(ctx, aceso, x, y, ate)
  ctx.stroke()
  ctx.restore()

  // hoje: o ponto de onde tudo sai
  ctx.save()
  ctx.fillStyle = c.creme
  ctx.shadowColor = c.luz
  ctx.shadowBlur = 22
  ctx.beginPath()
  ctx.arc(x0, y(0), 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.font = `600 ${estreito ? 11 : 12}px "Plus Jakarta Sans", system-ui, sans-serif`
  ctx.fillStyle = c.sub
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillText('hoje', x0 - 2, h - base / 2 + 4)
  ctx.textAlign = 'right'
  ctx.fillText('5 anos', x1, h - base / 2 + 4)
  ctx.textAlign = 'left'

  // as três pontas e os nomes, quando o desenho termina
  const fim = Math.max(0, (p - 0.86) / 0.14)
  if (fim > 0) {
    ctx.font = `600 ${estreito ? 12 : 13}px "Plus Jakarta Sans", system-ui, sans-serif`
    ctx.textBaseline = 'middle'
    const pontas: [number, string, string][] = [
      [feixe.p95, c.verde, 'otimista'],
      [feixe.meio[MESES]!, c.creme, 'meio'],
      [feixe.p5, c.vermelho, 'pessimista'],
    ]
    for (const [v, cor, nome] of pontas) {
      const yy = y(v)
      ctx.globalAlpha = fim
      ctx.fillStyle = cor
      ctx.beginPath()
      ctx.arc(x1, yy, 3.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = fim * 0.8
      ctx.fillText(nome, x1 + 14, yy)
    }
    ctx.globalAlpha = 1
  }
}

function preparar() {
  const el = tela.value
  if (!el || !feixe) return
  const w = el.clientWidth, h = el.clientHeight
  if (!w || !h) return
  lado.value = window.matchMedia('(min-width: 1024px)').matches
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  el.width = Math.round(w * dpr)
  el.height = Math.round(h * dpr)
  desenharQuadro(w, h, dpr)
  pintar()
}

function revelar() {
  const inicio = performance.now()
  const dur = 2200
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
  const { x, y, x0, x1 } = geometria(r.width, r.height)
  const px = e.clientX - r.left, py = e.clientY - r.top
  if (px < x0 || px > x1) { soltar(); return }
  const m = Math.max(1, Math.min(MESES, Math.round(((px - x0) / (x(MESES) - x0)) * MESES)))
  let melhor = -1, dist = Infinity
  for (let i = 0; i < CAMINHOS; i++) {
    const dd = Math.abs(y(feixe.logs[i * (MESES + 1) + m]!) - py)
    if (dd < dist) { dist = dd; melhor = i }
  }
  const novo = dist < 24 ? melhor : -1
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
  progresso = calmo ? 1 : 0
  void document.fonts?.ready.then(() => preparar())
  preparar()
  let pendente = 0
  medida = new ResizeObserver(() => { cancelAnimationFrame(pendente); pendente = requestAnimationFrame(preparar) })
  if (cena.value) medida.observe(cena.value)
  // está na primeira tela: o feixe se desenha logo depois do título
  if (progresso < 1) setTimeout(revelar, 350)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  medida?.disconnect()
})
</script>

<template>
  <section class="hp2" aria-labelledby="hp2-titulo">
    <div class="hp2__luz" aria-hidden="true" />
    <div class="hp2__texto">
      <p class="hp2__produto"><img src="/logo-azul.svg" alt="" width="20" height="20">Redentia</p>
      <h1 id="hp2-titulo" class="hp2__titulo">Simulamos a sua carteira em 2.000 cenários para ver se ela é boa.</h1>
      <p class="hp2__dek">Você conecta o banco uma vez. A IA testa a carteira nos próximos cinco anos, vigia todo dia e só chama quando algo pede você.</p>
      <HomeChamada tom="escuro" porte="calmo" :centro="false" class="hp2__chamada" />
    </div>

    <div ref="cena" class="hp2__cena" @pointermove="mover" @pointerleave="soltar">
      <canvas ref="tela" class="hp2__tela" aria-hidden="true" />
    </div>
    <p class="hp2__legenda">Ilustração do motor de cenários: 2.000 caminhos possíveis para uma carteira, de hoje a cinco anos.</p>
    <div class="hp2__grao" aria-hidden="true" />
  </section>
</template>

<style scoped>
.hp2 {
  --g: clamp(22px, 5.5vw, 80px);
  position: relative; isolation: isolate; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: clamp(40px, 4.6vw, 64px) 0 clamp(28px, 3vw, 40px);
  background: var(--nu-navy);
}
/* a luz: um véu frio sobre o título e o halo de hoje, embaixo à esquerda */
.hp2__luz {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background:
    radial-gradient(34% 40% at 6% 74%, color-mix(in srgb, var(--nu-blue) 32%, transparent) 0%, transparent 100%),
    radial-gradient(46% 46% at 78% 62%, color-mix(in srgb, var(--nu-blue-deep) 20%, transparent) 0%, transparent 100%),
    radial-gradient(52% 34% at 50% 18%, color-mix(in srgb, var(--nu-blue-soft) 8%, transparent) 0%, transparent 100%);
}
.hp2__texto { display: flex; flex-direction: column; align-items: center; padding: 0 var(--g); max-width: 1180px; }
.hp2__produto {
  display: inline-flex; align-items: center; gap: 8px; margin: 0;
  color: var(--nu-cream-text); font-size: var(--nu-fs-lg); font-weight: 700; letter-spacing: -0.02em;
}
/* a marca azul some no navy: o losango vira creme */
.hp2__produto img { filter: brightness(0) invert(.95); }
.hp2__titulo {
  margin: 16px 0 0; max-width: 22ch;
  font-size: clamp(34px, 4.8vw, 72px); font-weight: 500; letter-spacing: -0.05em; line-height: 1.03;
  text-wrap: balance;
  color: var(--nu-cream-text);
  background: linear-gradient(180deg, var(--nu-cream-text) 40%, var(--nu-cream-text-78) 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.hp2__dek {
  margin: 18px 0 0; max-width: 54ch; color: var(--nu-cream-text-70);
  font-size: clamp(16px, 1.35vw, 19px); font-weight: 500; line-height: 1.5; text-wrap: balance;
}
.hp2__chamada { margin-top: clamp(24px, 2.6vw, 32px); align-items: center; }
.hp2__chamada :deep(.hch__letra) { text-align: center; }

/* o feixe: a largura toda, da borda do gutter até os nomes da ponta */
.hp2__cena {
  position: relative; align-self: stretch;
  height: clamp(220px, 24vw, 360px); margin-top: clamp(20px, 2.4vw, 36px); cursor: crosshair;
}
.hp2__tela { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.hp2__legenda {
  margin: 10px 0 0; padding: 0 var(--g); max-width: 70ch;
  color: var(--nu-cream-text-45); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.5;
}
.hp2__grao {
  position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: .3; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
}

/* entrada: o título fica parado (LCP); o resto sai do desfoque, como no rodapé */
.hp2__dek, .hp2__chamada { animation: hp2-entra 1s cubic-bezier(.2, .8, .2, 1) backwards; }
.hp2__chamada { animation-delay: .1s; }
.hp2__legenda { animation: hp2-acende 1s ease 2.2s backwards; }
@keyframes hp2-entra { from { opacity: 0; filter: blur(10px); transform: translateY(12px); } }
@keyframes hp2-acende { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .hp2__dek, .hp2__chamada, .hp2__legenda { animation: none; }
}

@media (max-width: 1023px) {
  .hp2__dek { display: none; }
  .hp2__titulo { max-width: 18ch; }
}
/* computador: o texto à esquerda e o feixe à direita até a borda, numa dobra
   só (como o herói de hoje). Fica depois das regras de base para vencê-las. */
@media (min-width: 1024px) {
  .hp2 {
    display: grid; grid-template-columns: clamp(420px, 40vw, 560px) minmax(0, 1fr); grid-template-rows: 1fr auto;
    column-gap: clamp(16px, 2vw, 32px); align-items: center; text-align: left;
    min-height: min(700px, calc(100svh - 150px));
    padding: clamp(32px, 3vw, 48px) 0 clamp(24px, 2.4vw, 36px) var(--g);
  }
  .hp2__luz {
    background:
      radial-gradient(26% 36% at 44% 56%, color-mix(in srgb, var(--nu-blue) 30%, transparent) 0%, transparent 100%),
      radial-gradient(44% 56% at 80% 46%, color-mix(in srgb, var(--nu-blue-deep) 22%, transparent) 0%, transparent 100%),
      radial-gradient(40% 50% at 12% 30%, color-mix(in srgb, var(--nu-blue-soft) 6%, transparent) 0%, transparent 100%);
  }
  .hp2__texto { grid-column: 1; grid-row: 1; align-items: flex-start; padding: 0; }
  .hp2__titulo { max-width: 14ch; font-size: clamp(40px, 4.3vw, 64px); }
  .hp2__dek { max-width: 40ch; font-size: var(--nu-fs-lg); text-wrap: pretty; }
  .hp2__chamada { align-items: flex-start; }
  .hp2__chamada :deep(.hch__letra) { text-align: left; }
  .hp2__cena { grid-column: 2; grid-row: 1; align-self: stretch; height: auto; min-height: 420px; margin: 0; }
  .hp2__legenda { grid-column: 2; grid-row: 2; margin: 6px 0 0; padding: 0 var(--g) 0 6px; max-width: none; text-align: left; }
}
/* 1.024 a 1.279 px: a coluna do texto é estreita; a frase de apoio sai, como abaixo de 1.024 */
@media (min-width: 1024px) and (max-width: 1279px) {
  .hp2__dek { display: none; }
  .hp2 { min-height: min(620px, calc(100svh - 150px)); }
}

@media (max-width: 560px) {
  .hp2 { padding-top: 30px; }
  .hp2__produto { display: none; }
  .hp2__titulo { margin-top: 0; font-size: clamp(31px, 8.6vw, 37px); line-height: 1.05; }
  .hp2__texto { align-self: stretch; }
  .hp2__chamada { align-self: stretch; margin-top: 22px; }
  .hp2__chamada :deep(.hch__letra strong) { display: inline; }
  .hp2__cena { height: 250px; margin-top: 18px; }
}
</style>

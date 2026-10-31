<script setup lang="ts">
// Os 2.000 caminhos do cartão de exemplo se desenhando (31/10/2026). O dono,
// com a gravação da Simulação dos apps: "esse card da carteira pode ser
// assim? com essa animação (só que mais rápido)". Linhas sorteadas da forma
// do leque de exemplo (caminhosDeExemplo, semente fixa), sem número nenhum:
// é a forma do que a pessoa recebe, não a carteira de alguém.
//
// A animação, uma vez, quando o cartão aparece (~2,4 s; o app leva ~10):
//  - os caminhos nascem em "hoje" e correm até 5 anos, um, dois, cinco... e
//    então centenas (nascimentosDoExemplo), com o contador em cima;
//  - os primeiros vêm em creme, fortes; conforme chegam mais, eles esmaecem e
//    o leque assume a cor de onde cada um termina (verde no alto, vermelho
//    embaixo), como na Simulação;
//  - no fim entram a linha do meio, os três pontos, o sino e os nomes.
//
// Desempenho: cada trecho de cada caminho é desenhado UMA vez, em duas
// camadas fora da tela (a creme e a colorida); por quadro só se juntam as
// duas, com a opacidade do momento. Nada fica em laço. Com movimento
// reduzido, o cartão já aparece pronto.
import {
  afastarRotulos,
  caminhosDeExemplo,
  fimDoCaminho,
  janelaDosCaminhos,
  lequeDeExemplo,
  nascimentosDoExemplo,
  rgbDaCor,
  sinoDosFins,
  tomDoCaminho,
} from '~/utils/futuro'

const props = withDefaults(defineProps<{ altura?: number }>(), { altura: 300 })

type Rgb = [number, number, number]

const dados = lequeDeExemplo()
const caminhos = caminhosDeExemplo()
const nasce = nascimentosDoExemplo(caminhos.n)
const N = caminhos.n
const P = caminhos.pontos
const serie = dados.series
const janela = janelaDosCaminhos(caminhos, serie, 100)
const fins = Float64Array.from({ length: N }, (_, i) => fimDoCaminho(caminhos, i))
const sino = sinoDosFins(fins, janela.lo, janela.hi)
const tons = Array.from({ length: N }, (_, i) => tomDoCaminho(i / (N - 1), N))
// a ordem de quem nasce primeiro (para o contador e para desenhar em ordem)
const porNascimento = Array.from({ length: N }, (_, i) => i).sort((a, b) => nasce[a]! - nasce[b]!)

const NASCER = 1.8 // s até o último nascer
const CORRER = 0.45 // s de "hoje" a 5 anos, cada caminho
const ACABAR = 0.4 // s do acabamento
const TOTAL = NASCER + CORRER

const raiz = ref<HTMLElement | null>(null)
const cv = ref<HTMLCanvasElement | null>(null)
const largura = ref(420)
const celular = computed(() => largura.value < 420)
const h = computed(() => (celular.value ? Math.round(props.altura * 0.74) : props.altura))
const colNomes = computed(() => (celular.value ? 70 : 82))
const larguraSino = computed(() => (celular.value ? 26 : 40))
const xFim = computed(() => Math.max(largura.value - colNomes.value - larguraSino.value, 120))
const PAD = 12
const X_HOJE = 8

function yDe(v: number): number {
  return PAD + (1 - (v - janela.lo) / (janela.hi - janela.lo)) * (h.value - PAD * 2)
}
function xDe(t: number): number {
  return X_HOJE + (t / (P - 1)) * (xFim.value - X_HOJE)
}

// o relógio da animação: segundos desde o começo (null = ainda não começou)
const tempo = ref<number | null>(null)
const nascidos = computed(() => {
  if (tempo.value === null) return 0
  const f = Math.min(tempo.value / NASCER, 1)
  return Math.min(N, Math.max(1, Math.round(N * f ** 3)))
})
const pronto = computed(() => tempo.value !== null && tempo.value >= TOTAL)
const acabamento = computed(() => (tempo.value === null ? 0 : Math.min(Math.max((tempo.value - TOTAL) / ACABAR, 0), 1)))

const nomes = computed(() => {
  const ys = afastarRotulos([yDe(dados.end.p90), yDe(dados.end.p50), yDe(dados.end.p10)], celular.value ? 28 : 34, 14, h.value - 14)
  return [
    { k: 'otimista', y: ys[0]! },
    { k: 'meio', y: ys[1]! },
    { k: 'pessimista', y: ys[2]! },
  ]
})

/* ——— cores, dos tokens ——— */
const cores = { creme: null as Rgb | null, verde: null as Rgb | null, vermelho: null as Rgb | null, navy: null as Rgb | null }
const rgba = (c: Rgb | null, a: number) => (c ? `rgba(${c[0]},${c[1]},${c[2]},${a})` : 'transparent')
function misturar(a: Rgb, b: Rgb, t: number): Rgb {
  return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]
}
function corDoCaminho(i: number): string {
  const { creme, verde, vermelho } = cores
  const tom = tons[i]!
  const ponta = tom.mistura >= 0 ? (verde ?? creme!) : (vermelho ?? creme!)
  return rgba(misturar(creme!, ponta, Math.abs(tom.mistura)), tom.alfa)
}

/* ——— as camadas ——— */
let dpr = 1
let creme: HTMLCanvasElement | null = null // os caminhos em creme, fortes no começo
let cor: HTMLCanvasElement | null = null // os mesmos, na cor de onde terminam
let feito = new Int16Array(N) // até que ponto cada caminho já foi desenhado nas camadas

function preparar(c: HTMLCanvasElement, w: number, alt: number): CanvasRenderingContext2D | null {
  const W = Math.round(w * dpr)
  const H = Math.round(alt * dpr)
  if (c.width !== W) c.width = W
  if (c.height !== H) c.height = H
  const ctx = c.getContext('2d')
  if (!ctx) return null
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}

function recomecarCamadas() {
  creme ??= document.createElement('canvas')
  cor ??= document.createElement('canvas')
  for (const c of [creme, cor]) {
    const ctx = preparar(c, largura.value, h.value)
    ctx?.clearRect(0, 0, largura.value, h.value)
  }
  feito = new Int16Array(N)
}

// leva cada caminho nascido até o ponto do momento, só os trechos novos
function avancarCamadas(t: number) {
  const cc = creme?.getContext('2d')
  const ck = cor?.getContext('2d')
  if (!cc || !ck) return
  cc.lineWidth = 1
  ck.lineWidth = 1
  cc.lineJoin = ck.lineJoin = 'round'
  for (let k = 0; k < N; k++) {
    const i = porNascimento[k]!
    const nasceu = nasce[i]! * NASCER
    if (nasceu > t) break
    const ate = Math.min(P - 1, Math.floor(((t - nasceu) / CORRER) * (P - 1)))
    const de = feito[i]!
    if (ate <= de) continue
    const base = i * P
    // os primeiros fortes, os de depois cada vez mais leves (a soma fica parecida)
    cc.strokeStyle = rgba(cores.creme, Math.min(0.85, 2.4 / Math.sqrt(k + 1)))
    ck.strokeStyle = corDoCaminho(i)
    for (const ctx of [cc, ck]) {
      ctx.beginPath()
      ctx.moveTo(xDe(de), yDe(caminhos.valores[base + de]!))
      for (let m = de + 1; m <= ate; m++) ctx.lineTo(xDe(m), yDe(caminhos.valores[base + m]!))
      ctx.stroke()
    }
    feito[i] = ate
  }
}

const suave = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

function desenhar() {
  const c = cv.value
  if (!c || !cores.creme) return
  const ctx = preparar(c, largura.value, h.value)
  if (!ctx) return
  const W = largura.value
  const H = h.value
  ctx.clearRect(0, 0, W, H)
  const t = tempo.value ?? 0
  const { creme: cr, verde, vermelho, navy } = cores

  // o nível de hoje, tracejado
  ctx.setLineDash([2, 4])
  ctx.strokeStyle = rgba(cr, 0.18)
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(X_HOJE, yDe(100))
  ctx.lineTo(xFim.value, yDe(100))
  ctx.stroke()
  ctx.setLineDash([])

  // as duas camadas: a creme some enquanto a colorida chega
  const f = t / TOTAL
  const aCor = suave(0.2, 0.92, f)
  const aCreme = 1 - suave(0.45, 1, f)
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  if (cor && aCor > 0) { ctx.globalAlpha = aCor; ctx.drawImage(cor, 0, 0) }
  if (creme && aCreme > 0) { ctx.globalAlpha = aCreme; ctx.drawImage(creme, 0, 0) }
  ctx.restore()

  // o acabamento: o sino, a linha do meio e os três pontos
  const a = acabamento.value
  if (a > 0) {
    ctx.globalAlpha = a
    const y90 = yDe(dados.end.p90)
    const y10 = yDe(dados.end.p10)
    const meioRel = Math.min(Math.max((yDe(dados.end.p50) - y90) / (y10 - y90), 0.05), 0.95)
    const tinta = (al: number) => {
      const g = ctx.createLinearGradient(0, y90, 0, y10)
      g.addColorStop(0, rgba(verde ?? cr, al))
      g.addColorStop(meioRel, rgba(cr, al))
      g.addColorStop(1, rgba(vermelho ?? cr, al))
      return g
    }
    const x0 = xFim.value + 5
    const larg = larguraSino.value - 8
    ctx.beginPath()
    ctx.moveTo(x0, yDe(sino[0]![0]))
    for (const [v, d] of sino) ctx.lineTo(x0 + d * larg, yDe(v))
    ctx.lineTo(x0, yDe(sino[sino.length - 1]![0]))
    ctx.closePath()
    ctx.fillStyle = tinta(0.2)
    ctx.fill()
    ctx.beginPath()
    sino.forEach(([v, d], k) => (k ? ctx.lineTo(x0 + d * larg, yDe(v)) : ctx.moveTo(x0 + d * larg, yDe(v))))
    ctx.strokeStyle = tinta(0.85)
    ctx.lineWidth = 1.3
    ctx.stroke()

    ctx.beginPath()
    serie.forEach((s, m) => (m ? ctx.lineTo(xDe(m), yDe(s.p50)) : ctx.moveTo(xDe(m), yDe(s.p50))))
    ctx.strokeStyle = rgba(cr, 1)
    ctx.lineWidth = 2.2
    ctx.stroke()

    for (const [v, c2] of [[dados.end.p90, verde], [dados.end.p50, cr], [dados.end.p10, vermelho]] as const) {
      ctx.beginPath()
      ctx.arc(xFim.value, yDe(v), 4, 0, Math.PI * 2)
      ctx.fillStyle = rgba(navy, 1)
      ctx.fill()
      ctx.strokeStyle = rgba(c2 ?? cr, 1)
      ctx.lineWidth = 2
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  // hoje
  ctx.fillStyle = rgba(navy, 1)
  ctx.strokeStyle = rgba(cr, 1)
  ctx.lineWidth = 2.2
  ctx.beginPath()
  ctx.arc(X_HOJE, yDe(100), 4.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
}

/* ——— o relógio ——— */
let quadro = 0
let inicio = 0
function passo(agora: number) {
  tempo.value = (agora - inicio) / 1000
  avancarCamadas(tempo.value)
  desenhar()
  if (tempo.value < TOTAL + ACABAR) quadro = requestAnimationFrame(passo)
}
function comecar() {
  recomecarCamadas()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tempo.value = TOTAL + ACABAR
    avancarCamadas(tempo.value)
    desenhar()
    return
  }
  inicio = performance.now()
  quadro = requestAnimationFrame(passo)
}

let observador: ResizeObserver | null = null
let vigia: IntersectionObserver | null = null
onMounted(() => {
  const css = getComputedStyle(raiz.value ?? document.documentElement)
  cores.creme = rgbDaCor(css.getPropertyValue('--nu-cream-text'))
  cores.verde = rgbDaCor(css.getPropertyValue('--nu-green-soft'))
  cores.vermelho = rgbDaCor(css.getPropertyValue('--nu-red-soft'))
  cores.navy = rgbDaCor(css.getPropertyValue('--nu-navy'))
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  largura.value = raiz.value?.clientWidth || largura.value
  observador = new ResizeObserver(([e]) => {
    const w = Math.round(e!.contentRect.width)
    if (!w || w === largura.value) return
    largura.value = w
    // a largura mudou: as camadas se refazem até o ponto em que a animação está
    nextTick(() => {
      recomecarCamadas()
      avancarCamadas(tempo.value ?? 0)
      desenhar()
    })
  })
  if (raiz.value) observador.observe(raiz.value)
  desenhar()
  // começa quando o cartão aparece, uma vez
  vigia = new IntersectionObserver((es) => {
    if (!es.some((e) => e.isIntersecting)) return
    vigia?.disconnect()
    comecar()
  }, { threshold: 0.4 })
  if (raiz.value) vigia.observe(raiz.value)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(quadro)
  observador?.disconnect()
  vigia?.disconnect()
})

const nf = new Intl.NumberFormat('pt-BR')
</script>

<template>
  <div ref="raiz" class="aec">
    <p class="aec__conta" aria-hidden="true">
      <strong>{{ nf.format(pronto ? N : nascidos) }}</strong>
      <span>{{ pronto ? 'caminhos · a faixa de 80%' : `${nascidos === 1 ? 'caminho' : 'caminhos'} de ${nf.format(N)}` }}</span>
    </p>
    <div class="aec__palco" :style="{ height: `${h}px` }">
      <canvas
        ref="cv"
        class="aec__cv"
        role="img"
        aria-label="Exemplo: 2.000 caminhos possíveis para uma carteira em 5 anos, do otimista ao pessimista, com a linha do meio."
      />
      <span
        v-for="r in nomes"
        :key="r.k"
        class="aec__nome"
        :class="`aec__nome--${r.k}`"
        :style="{ top: `${r.y}px`, left: `${xFim + larguraSino + 4}px`, opacity: acabamento }"
        aria-hidden="true"
      >{{ r.k }}</span>
    </div>
    <div class="aec__eixo" aria-hidden="true">
      <span>hoje</span>
      <span :style="{ marginRight: `${colNomes + larguraSino}px` }">em 5 anos</span>
    </div>
  </div>
</template>

<style scoped>
.aec { position: relative; }
.aec__conta { margin: 0 0 8px; display: flex; align-items: baseline; gap: 6px; min-height: 22px; font-variant-numeric: tabular-nums; }
.aec__conta strong { color: var(--nu-cream-text); font-size: var(--nu-fs-md); font-weight: 800; }
.aec__conta span { color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 700; }
.aec__palco { position: relative; }
.aec__cv { display: block; width: 100%; height: 100%; }
.aec__nome {
  position: absolute; transform: translateY(-50%); white-space: nowrap;
  font-size: var(--nu-fs-sm); font-weight: 700; transition: opacity .2s linear;
}
.aec__nome--otimista { color: var(--nu-green-soft); }
.aec__nome--meio { color: var(--nu-cream-text); }
.aec__nome--pessimista { color: var(--nu-red-soft); }
.aec__eixo { display: flex; justify-content: space-between; margin-top: 8px; color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 700; }
</style>

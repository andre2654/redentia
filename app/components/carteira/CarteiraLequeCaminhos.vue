<script setup lang="ts">
// O leque dos 2.000 caminhos (31/10/2026). O dono, olhando o leque de faixas:
// "faça igual ao app e mostre todas as linhas dos 2000 cenários e libere o
// hover". É o momento assinatura da /carteira, no desenho do Agora dos apps
// (IPhoneAgoraV2 · Simulação e MacAgoraFerramentas), no navy do Nu.
//
// Desenho, em canvas (2.000 nós de SVG derrubariam o DOM):
//  - cada caminho do motor é um fio fino e transparente na cor de ONDE ELE
//    TERMINA: verde no alto, creme no miolo, vermelho embaixo. A densidade
//    dos fios é a distribuição. Os fios nascem apagados em "hoje" e ganham
//    cor para a direita, como no Agora;
//  - por cima, a faixa de 80% (p10–p90), discreta, e a linha do meio (p50)
//    acesa;
//  - na ponta, o sino de onde os 2.000 terminam (a densidade dos finais).
//
// O hover (pedido do dono, 31/10/2026: "no hover sempre mostrar talvez o
// caminho do meio, o mais otimista e o mais pessimista daquele ponto"): no
// mês sob o cursor, uma guia com a data e TRÊS caminhos reais acesos de hoje
// a 2031, os que naquele mês estão no p90 (verde), no p50 (creme) e no p10
// (vermelho) — os mesmos números da leitura; o do topo e o do fundo seriam
// os 2 mais extremos de 2.000. Cada um diz quanto vale no mês e, na coluna
// da direita, onde termina. Os outros fios esmaecem.
//
// Desempenho: a camada parada é desenhada UMA vez num canvas fora da tela, e
// de novo só quando a largura muda. O hover redesenha só a camada de cima, e
// os três caminhos de cada mês são escolhidos uma vez só. Nada fica em laço:
// quando o leque aparece, os fios nascem uma vez e as pontas pulsam uma vez.
// Com movimento reduzido, ele aparece pronto.
//
// Hover no computador; no celular, toque e arraste na horizontal (a página
// continua rolando na vertical). Teclado: Tab foca, ← → andam um mês (com
// Shift, um ano), Home/End vão a hoje e ao fim, Esc fecha a leitura.
//
// Sem caminhos na resposta, quem desenha é o CarteiraLeque (as faixas).
//
// A cor contra hoje (10/11/2026, o dono aprovou testar): a cor de cada fio
// deixou de ser a posição dele entre os 2.000 e passou a ser onde ele termina
// em relação ao que a pessoa tem HOJE (tomContraHoje): rosa só para quem
// termina abaixo de hoje; o resto vai do creme ao verde. A linha de hoje fica
// visível, com o rótulo, e os nomes da ponta viram "se for bem", "o mais
// provável" e "se for mal". O "se for mal" só fica rosa quando termina abaixo
// de hoje. `cor="posicao"` volta ao desenho de antes (só para comparar no dev).
//
// O teste à vista (10/11/2026, o dono: "mostrar o impacto da Redentia de testar
// em 2.000 cenários"):
//  - a abertura deixa de ser a luz que varre e passa a ser os 2.000 nascendo,
//    um a um, em ordem aleatória, com o contador "N futuros testados" no canto;
//    uma vez só, e com movimento reduzido o leque aparece pronto;
//  - `destaque` acende um grupo de caminhos (os que terminam abaixo de hoje, os
//    que caem 10% no caminho...) e apaga o resto: é como "O que o teste
//    encontrou" mostra no desenho de quem está falando. O hover ganha dele.
import type { FuturoDadosApi } from '~/types/assinatura'
import {
  afastarRotulos,
  brlDoLeque,
  caminhosDoMes,
  fimDoCaminho,
  inicioDoLeque,
  janelaDosCaminhos,
  marcasDoEixo,
  mesDoLeque,
  rgbDaCor,
  sinoDosFins,
  tomContraHoje,
  tomDoCaminho,
  type CaminhosDoLeque,
} from '~/utils/futuro'

const props = withDefaults(defineProps<{
  dados: FuturoDadosApi
  caminhos: CaminhosDoLeque
  fins: { otimista: string; meio: string; pessimista: string }
  /** rótulos do eixo, embaixo: 'hoje · R$ 66,2 mil', os anos do meio e '2031' */
  eixo: { hoje: string; fim: string; anos?: string[] }
  /** altura no computador (no celular é menor) */
  altura?: number
  /** 'hoje': a cor é onde o fio termina contra o valor de hoje; 'posicao': a posição entre os 2.000 (o desenho de antes) */
  cor?: 'hoje' | 'posicao'
  /** um grupo aceso (1 = acende), na ordem dos caminhos, e a cor dele; o resto apaga */
  destaque?: { mascara: Uint8Array; cor: 'verde' | 'vermelho' | 'creme' } | null
}>(), { altura: 420, cor: 'hoje', destaque: null })

const nfContador = new Intl.NumberFormat('pt-BR')
/** quantos fios já nasceram na abertura; null fora dela (mostra o total) */
const contados = ref<number | null>(null)

/** os nomes da ponta, em linguagem de gente */
const NOME: Record<'otimista' | 'meio' | 'pessimista', string> = { otimista: 'se for bem', meio: 'o mais provável', pessimista: 'se for mal' }

type Rgb = [number, number, number]
type Papel = 'otimista' | 'meio' | 'pessimista'
const PAPEIS: Papel[] = ['otimista', 'meio', 'pessimista']

const raiz = ref<HTMLElement | null>(null)
const palco = ref<HTMLElement | null>(null)
const cvBase = ref<HTMLCanvasElement | null>(null)
const cvTopo = ref<HTMLCanvasElement | null>(null)
const hojeEl = ref<HTMLElement | null>(null)

const largura = ref(960)
const larguraHoje = ref(150)
const celular = computed(() => largura.value < 600)
const h = computed(() => (celular.value ? Math.round(props.altura * 0.66) : props.altura))
// coluna dos rótulos à direita do sino (o número + o nome)
const colRotulos = computed(() => (celular.value ? 96 : 156))
const larguraSino = computed(() => (celular.value ? 36 : 66))
const xFim = computed(() => Math.max(largura.value - colRotulos.value - larguraSino.value, 120))
const PAD = 14
const X_HOJE = 10

const serie = computed(() => [...props.dados.series].sort((a, b) => a.year - b.year))
const anoMax = computed(() => serie.value[serie.value.length - 1]!.year || 1)
const inicio = computed(() => inicioDoLeque(props.dados))
const ultimo = computed(() => props.caminhos.pontos - 1)

/* ——— o que não depende da largura: janela, sino, tons ——— */
const janela = computed(() => janelaDosCaminhos(props.caminhos, serie.value, inicio.value))
const finais = computed(() => {
  const c = props.caminhos
  const f = new Float64Array(c.n)
  for (let i = 0; i < c.n; i++) f[i] = fimDoCaminho(c, i)
  return f
})
const sino = computed(() => sinoDosFins(finais.value, janela.value.lo, janela.value.hi))
const contraHoje = computed(() => props.cor === 'hoje')
const tons = computed(() => {
  const n = props.caminhos.n
  if (!contraHoje.value) return Array.from({ length: n }, (_, i) => tomDoCaminho(n > 1 ? i / (n - 1) : 0.5, n))
  const hoje = inicio.value
  let maior = -Infinity
  for (let i = 0; i < n; i++) maior = Math.max(maior, finais.value[i]!)
  return Array.from({ length: n }, (_, i) => tomContraHoje(finais.value[i]!, hoje, maior, n > 1 ? i / (n - 1) : 0.5, n))
})
/** o "se for mal" (p10 no fim) termina abaixo de hoje? só então ele é rosa */
const malAbaixoDeHoje = computed(() => !contraHoje.value || props.dados.end.p10 < inicio.value)
// do miolo para as pontas: os fios coloridos (raros) ficam por cima
const ordem = computed(() => {
  const n = props.caminhos.n
  return Array.from({ length: n }, (_, i) => i).sort((a, b) => Math.abs(a / (n - 1) - 0.5) - Math.abs(b / (n - 1) - 0.5))
})

// os três caminhos de cada mês (p90, p50 e p10 naquele mês), escolhidos uma vez
const trios = computed(() => Array.from({ length: props.caminhos.pontos }, (_, t) => caminhosDoMes(props.caminhos, serie.value, t)))

/* ——— escala ——— */
function yDe(v: number): number {
  const { lo, hi } = janela.value
  return PAD + (1 - (v - lo) / (hi - lo)) * (h.value - PAD * 2)
}
function xDeAno(ano: number): number {
  return X_HOJE + (ano / anoMax.value) * (xFim.value - X_HOJE)
}

const ys = computed(() => {
  const end = props.dados.end
  return { hoje: yDe(inicio.value), otimista: yDe(end.p90), meio: yDe(end.p50), pessimista: yDe(end.p10) }
})

// rótulos sem encostar um no outro (o miolo estreito juntaria os três)
const rotulos = computed(() => {
  const gap = celular.value ? 40 : 50
  const itens = [
    { k: 'otimista' as const, y: ys.value.otimista, nome: contraHoje.value ? NOME.otimista : 'otimista' },
    { k: 'meio' as const, y: ys.value.meio, nome: contraHoje.value ? NOME.meio : 'meio' },
    { k: 'pessimista' as const, y: ys.value.pessimista, nome: contraHoje.value ? NOME.pessimista : 'pessimista' },
  ]
  const topo = 20
  const base = h.value - 20
  itens[0]!.y = Math.max(topo, Math.min(itens[0]!.y, itens[1]!.y - gap))
  itens[1]!.y = Math.max(itens[0]!.y + gap, itens[1]!.y)
  itens[2]!.y = Math.max(itens[1]!.y + gap, itens[2]!.y)
  if (itens[2]!.y > base) {
    const sobra = itens[2]!.y - base
    for (const it of itens) it.y -= sobra
  }
  return itens.map((it) => ({ ...it, valor: props.fins[it.k] }))
})

const xAnos = computed(() => Array.from({ length: Math.max(Math.round(anoMax.value) - 1, 0) }, (_, i) => xDeAno(i + 1)))
// anos do meio no eixo, só os que cabem sem encostar no "hoje · R$ X" nem no
// ano final; no celular não cabem (as linhas verticais seguem marcando)
const marcas = computed(() => {
  if (celular.value) return []
  const anos = props.eixo.anos ?? []
  return marcasDoEixo(
    xAnos.value.map((x, i) => ({ x, rotulo: anos[i] ?? null })),
    { hojeDireita: larguraHoje.value, fimEsquerda: xFim.value - 22, meiaLargura: 20 },
  )
})

/* ——— cores: só dos tokens ——— */
const cores = { creme: null as Rgb | null, verde: null as Rgb | null, vermelho: null as Rgb | null, navy: null as Rgb | null }
const rgba = (c: Rgb | null, a: number) => (c ? `rgba(${c[0]},${c[1]},${c[2]},${a})` : 'transparent')
function misturar(a: Rgb, b: Rgb, t: number): Rgb {
  return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]
}
function corDoCaminho(i: number): string {
  const { creme, verde, vermelho } = cores
  if (!creme) return 'transparent'
  const tom = tons.value[i]!
  const ponta = tom.mistura >= 0 ? (verde ?? creme) : (vermelho ?? creme)
  return rgba(misturar(creme, ponta, Math.abs(tom.mistura)), tom.alfa)
}
/** o "se for mal" acima de hoje: um creme mais quente, sem o rosa do prejuízo */
function corDoMal(): Rgb | null {
  if (malAbaixoDeHoje.value) return cores.vermelho ?? cores.creme
  return cores.creme && cores.vermelho ? misturar(cores.creme, cores.vermelho, 0.28) : cores.creme
}
function corDoPapel(p: Papel): Rgb | null {
  return (p === 'otimista' ? cores.verde : p === 'pessimista' ? corDoMal() : cores.creme) ?? cores.creme
}

/* ——— geometria em pixels (recalculada quando a largura muda) ——— */
let xs = new Float32Array(0)
let py = new Float32Array(0)
function medir() {
  const c = props.caminhos
  const P = c.pontos
  xs = new Float32Array(P)
  for (let t = 0; t < P; t++) xs[t] = xDeAno(serie.value[t]?.year ?? (t / ultimo.value) * anoMax.value)
  py = new Float32Array(c.n * P)
  for (let k = 0; k < c.n * P; k++) py[k] = yDe(c.valores[k]!)
}

function linhaDaSerie(ctx: CanvasRenderingContext2D, k: 'p10' | 'p50' | 'p90') {
  serie.value.forEach((s, t) => (t ? ctx.lineTo(xs[t]!, yDe(s[k])) : ctx.moveTo(xs[t]!, yDe(s[k]))))
}
function contornoDaFaixa(ctx: CanvasRenderingContext2D) {
  ctx.beginPath()
  linhaDaSerie(ctx, 'p90')
  for (let t = serie.value.length - 1; t >= 0; t--) ctx.lineTo(xs[t]!, yDe(serie.value[t]!.p10))
  ctx.closePath()
}

let dpr = 1
let parado: HTMLCanvasElement | null = null
let fios: HTMLCanvasElement | null = null

function prepararCanvas(cv: HTMLCanvasElement, w: number, alt: number): CanvasRenderingContext2D | null {
  const W = Math.round(w * dpr)
  const H = Math.round(alt * dpr)
  if (cv.width !== W) cv.width = W
  if (cv.height !== H) cv.height = H
  const ctx = cv.getContext('2d')
  if (!ctx) return null
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, alt)
  return ctx
}

/**
 * A camada parada, num canvas fora da tela, em três tempos: o fundo, os
 * 2.000 fios (em lotes, um por quadro: onde o canvas não tem GPU, os fios
 * custam ~200 ms e não podem travar a página de uma vez) e o acabamento.
 */
function comecarParado(): { ctx: CanvasRenderingContext2D; fx: CanvasRenderingContext2D } | null {
  const { creme } = cores
  if (!creme) return null
  const W = largura.value
  const H = h.value
  parado ??= document.createElement('canvas')
  fios ??= document.createElement('canvas')
  const ctx = prepararCanvas(parado, W, H)
  const fx = prepararCanvas(fios, W, H)
  if (!ctx || !fx) return null

  // as marcas dos anos
  ctx.strokeStyle = rgba(creme, 0.07)
  ctx.lineWidth = 1
  for (const x of xAnos.value) {
    ctx.beginPath()
    ctx.moveTo(Math.round(x) + 0.5, 8)
    ctx.lineTo(Math.round(x) + 0.5, H - 8)
    ctx.stroke()
  }
  // o nível de hoje, tracejado até a ponta (com a cor contra hoje, é a régua do gráfico: mais visível)
  ctx.setLineDash(contraHoje.value ? [4, 4] : [2, 4])
  ctx.strokeStyle = rgba(creme, contraHoje.value ? 0.5 : 0.2)
  ctx.beginPath()
  ctx.moveTo(X_HOJE, ys.value.hoje)
  ctx.lineTo(xFim.value, ys.value.hoje)
  ctx.stroke()
  ctx.setLineDash([])
  fx.lineWidth = celular.value ? 0.8 : 1
  fx.lineJoin = 'round'
  return { ctx, fx }
}

/** Os fios ordem[de, ate), cada um na cor de onde termina. */
function desenharFios(fx: CanvasRenderingContext2D, de: number, ate: number) {
  const P = props.caminhos.pontos
  const lista = ordem.value
  for (let k = de; k < ate; k++) {
    const i = lista[k]!
    fx.strokeStyle = corDoCaminho(i)
    fx.beginPath()
    const o = i * P
    fx.moveTo(xs[0]!, py[o]!)
    for (let t = 1; t < P; t++) fx.lineTo(xs[t]!, py[o + t]!)
    fx.stroke()
  }
}

function terminarParado(ctx: CanvasRenderingContext2D, fx: CanvasRenderingContext2D) {
  const { creme, verde, vermelho, navy } = cores
  if (!creme || !fios) return
  const W = largura.value
  const H = h.value
  // nascem apagados em "hoje" e ganham cor para a direita; nas bordas de
  // cima e de baixo, os caminhos que saem da janela esmaecem
  fx.globalCompositeOperation = 'destination-in'
  const nasce = fx.createLinearGradient(X_HOJE, 0, xFim.value, 0)
  nasce.addColorStop(0, rgba(creme, 0.12))
  nasce.addColorStop(0.32, rgba(creme, 0.72))
  nasce.addColorStop(1, rgba(creme, 1))
  fx.fillStyle = nasce
  fx.fillRect(0, 0, W, H)
  const borda = fx.createLinearGradient(0, 0, 0, H)
  const b = Math.min(18 / H, 0.2)
  borda.addColorStop(0, rgba(creme, 0))
  borda.addColorStop(b, rgba(creme, 1))
  borda.addColorStop(1 - b, rgba(creme, 1))
  borda.addColorStop(1, rgba(creme, 0))
  fx.fillStyle = borda
  fx.fillRect(0, 0, W, H)
  fx.globalCompositeOperation = 'source-over'
  ctx.drawImage(fios, 0, 0, W, H)

  // a faixa de 80%, discreta, por cima dos fios
  const yTopo = Math.min(...serie.value.map((s) => yDe(s.p90)))
  const yBase = Math.max(...serie.value.map((s) => yDe(s.p10)))
  const faixa = ctx.createLinearGradient(0, yTopo, 0, yBase)
  faixa.addColorStop(0, rgba(verde ?? creme, 0.1))
  faixa.addColorStop(0.5, rgba(creme, 0.025))
  faixa.addColorStop(1, rgba(corDoMal() ?? creme, malAbaixoDeHoje.value ? 0.1 : 0.05))
  contornoDaFaixa(ctx)
  ctx.fillStyle = faixa
  ctx.fill()
  ctx.lineWidth = 1
  for (const [k, cor] of [['p90', verde], ['p10', corDoMal()]] as const) {
    ctx.beginPath()
    linhaDaSerie(ctx, k)
    ctx.strokeStyle = rgba(cor ?? creme, 0.42)
    ctx.stroke()
  }

  // a linha do meio, acesa
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.save()
  ctx.shadowColor = rgba(creme, 0.6)
  ctx.shadowBlur = 10 * dpr
  ctx.strokeStyle = rgba(creme, 0.55)
  ctx.lineWidth = 5
  ctx.beginPath()
  linhaDaSerie(ctx, 'p50')
  ctx.stroke()
  ctx.restore()
  ctx.strokeStyle = rgba(creme, 1)
  ctx.lineWidth = 2.4
  ctx.beginPath()
  linhaDaSerie(ctx, 'p50')
  ctx.stroke()

  // a ponta
  ctx.strokeStyle = rgba(creme, 0.12)
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(Math.round(xFim.value) + 0.5, 8)
  ctx.lineTo(Math.round(xFim.value) + 0.5, H - 8)
  ctx.stroke()

  // o sino de onde os 2.000 terminam
  const x0 = xFim.value + 6
  const larg = larguraSino.value - 10
  const pts = sino.value
  const y90 = ys.value.otimista
  const y10 = ys.value.pessimista
  const meioRel = y10 > y90 ? Math.min(Math.max((ys.value.meio - y90) / (y10 - y90), 0.05), 0.95) : 0.5
  const tinta = (a: number) => {
    const g = ctx.createLinearGradient(0, y90, 0, y10 > y90 ? y10 : y90 + 1)
    g.addColorStop(0, rgba(verde ?? creme, a))
    g.addColorStop(meioRel, rgba(creme, a))
    g.addColorStop(1, rgba(vermelho ?? creme, a))
    return g
  }
  ctx.beginPath()
  ctx.moveTo(x0, yDe(pts[0]![0]))
  for (const [v, d] of pts) ctx.lineTo(x0 + d * larg, yDe(v))
  ctx.lineTo(x0, yDe(pts[pts.length - 1]![0]))
  ctx.closePath()
  ctx.fillStyle = tinta(0.2)
  ctx.fill()
  ctx.beginPath()
  pts.forEach(([v, d], k) => (k ? ctx.lineTo(x0 + d * larg, yDe(v)) : ctx.moveTo(x0 + d * larg, yDe(v))))
  ctx.strokeStyle = tinta(0.85)
  ctx.lineWidth = 1.4
  ctx.stroke()

  // hoje
  ctx.fillStyle = rgba(creme, 0.12)
  ctx.beginPath()
  ctx.arc(X_HOJE, ys.value.hoje, 11, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = rgba(navy, 1)
  ctx.strokeStyle = rgba(creme, 1)
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(X_HOJE, ys.value.hoje, 5.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
}

/** Copia a camada parada para a tela; `ate` corta à direita (a abertura). */
function mostrarParado(ate = Infinity, luz = 0) {
  const cv = cvBase.value
  if (!cv || !parado) return
  const W = largura.value
  const H = h.value
  const ctx = prepararCanvas(cv, W, H)
  if (!ctx) return
  if (ate >= W) {
    ctx.drawImage(parado, 0, 0, W, H)
    return
  }
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, Math.max(ate, 0), H)
  ctx.clip()
  ctx.drawImage(parado, 0, 0, W, H)
  ctx.restore()
  // a luz que varre o leque, presa à faixa de 80%
  if (luz > 0 && cores.creme) {
    ctx.save()
    contornoDaFaixa(ctx)
    ctx.clip()
    ctx.globalCompositeOperation = 'lighter'
    const g = ctx.createLinearGradient(ate - 90, 0, ate, 0)
    g.addColorStop(0, rgba(cores.creme, 0))
    g.addColorStop(0.75, rgba(cores.creme, 0.16 * luz))
    g.addColorStop(1, rgba(cores.creme, 0))
    ctx.fillStyle = g
    ctx.fillRect(ate - 90, 0, 90, H)
    ctx.restore()
  }
}

/* ——— a camada de cima: a leitura do mês e o pulso das pontas ——— */
const ativo = ref(false)
const mes = ref(0)
let pulso = -1 // 0..1 enquanto as pontas pulsam (uma vez)
let quadro = 0

function pedirTopo() {
  if (!quadro) quadro = requestAnimationFrame(() => { quadro = 0; desenharTopo() })
}

/** Onde os rótulos do hover ficam (px), para o canvas e o DOM concordarem. */
const leitura = computed(() => {
  if (!ativo.value || !props.caminhos.n) return null
  const c = props.caminhos
  const P = c.pontos
  const t = Math.min(Math.max(mes.value, 0), P - 1)
  const trio = trios.value[t]!
  const x = xDeAno(serie.value[t]?.year ?? 0)
  const fimDe = (p: Papel) => fimDoCaminho(c, trio[p])
  const noMes = (p: Papel) => c.valores[trio[p] * P + t]!
  const gapGuia = celular.value ? 24 : 28
  const yGuia = afastarRotulos(PAPEIS.map((p) => yDe(noMes(p))), gapGuia, 30, h.value - 12)
  const gapFim = celular.value ? 44 : 50
  const yFim = afastarRotulos(PAPEIS.map((p) => yDe(fimDe(p))), gapFim, 18, h.value - 18)
  // a leitura do mês vai para o lado com espaço
  const esquerda = x > xFim.value * 0.62
  return {
    t,
    x,
    quando: mesDoLeque(props.dados.as_of, t),
    hoje: t === 0,
    esquerda,
    perto: t >= P - 4,
    itens: PAPEIS.map((p, k) => ({
      papel: p,
      valor: brlDoLeque(noMes(p)),
      fim: brlDoLeque(fimDe(p)),
      yPonto: yDe(noMes(p)),
      yGuia: yGuia[k]!,
      yFimPonto: yDe(fimDe(p)),
      yFim: yFim[k]!,
    })),
  }
})

function desenharTopo() {
  const cv = cvTopo.value
  const { creme, navy } = cores
  if (!cv || !creme) return
  const W = largura.value
  const H = h.value
  const ctx = prepararCanvas(cv, W, H)
  if (!ctx) return

  if (pulso >= 0) {
    const e = 1 - (1 - pulso) ** 2
    for (const k of PAPEIS) {
      ctx.strokeStyle = rgba(corDoPapel(k), 0.6 * (1 - pulso))
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(xFim.value, ys.value[k], 5 + 13 * e, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  // um grupo aceso: o resto do leque apaga e só os caminhos do grupo ficam, mais fortes
  const d = props.destaque
  if (d && !leitura.value && xs.length && d.mascara.length === props.caminhos.n) {
    ctx.fillStyle = rgba(navy, 0.8)
    ctx.fillRect(0, 0, xFim.value + larguraSino.value + 4, H)
    const P = props.caminhos.pontos
    let quantos = 0
    for (let i = 0; i < d.mascara.length; i++) quantos += d.mascara[i]!
    const cor = (d.cor === 'verde' ? cores.verde : d.cor === 'vermelho' ? cores.vermelho : creme) ?? creme
    ctx.strokeStyle = rgba(cor, Math.min(0.55, Math.max(0.07, 3.5 / Math.sqrt(Math.max(quantos, 1)))))
    ctx.lineWidth = celular.value ? 0.9 : 1.1
    ctx.lineJoin = 'round'
    for (let i = 0; i < d.mascara.length; i++) {
      if (!d.mascara[i]) continue
      const o = i * P
      ctx.beginPath()
      ctx.moveTo(xs[0]!, py[o]!)
      for (let t = 1; t < P; t++) ctx.lineTo(xs[t]!, py[o + t]!)
      ctx.stroke()
    }
    // a régua de hoje e o mais provável continuam à vista, por cima
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = rgba(creme, 0.6)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(X_HOJE, ys.value.hoje)
    ctx.lineTo(xFim.value, ys.value.hoje)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.strokeStyle = rgba(creme, 0.85)
    ctx.lineWidth = 2
    ctx.beginPath()
    linhaDaSerie(ctx, 'p50')
    ctx.stroke()
  }

  const l = leitura.value
  if (!l || !xs.length) {
    // em repouso: os três finais de 2031 e as guias até os rótulos (aqui, e
    // não na camada parada, para o hover poder trocá-los pelos dele)
    if (pronto || !armado.value) desenharFinais(ctx)
    return
  }
  const P = props.caminhos.pontos
  const trio = trios.value[l.t]!
  // os outros fios esmaecem, e o sino e os finais parados com eles
  ctx.fillStyle = rgba(navy, 0.5)
  ctx.fillRect(0, 0, W, H)
  // a guia do mês
  ctx.strokeStyle = rgba(creme, 0.45)
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(Math.round(l.x) + 0.5, 26)
  ctx.lineTo(Math.round(l.x) + 0.5, H - 4)
  ctx.stroke()
  // os três caminhos inteiros, de hoje ao fim; o do meio por cima
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  for (const p of ['otimista', 'pessimista', 'meio'] as const) {
    const cor = corDoPapel(p)
    const o = trio[p] * P
    ctx.save()
    ctx.shadowColor = rgba(cor, 0.75)
    ctx.shadowBlur = 8 * dpr
    ctx.strokeStyle = rgba(cor, 1)
    ctx.lineWidth = celular.value ? 1.6 : 2
    ctx.beginPath()
    ctx.moveTo(xs[0]!, py[o]!)
    for (let k = 1; k < P; k++) ctx.lineTo(xs[k]!, py[o + k]!)
    ctx.stroke()
    ctx.restore()
  }
  for (const it of l.itens) {
    const cor = corDoPapel(it.papel)
    // onde termina, e o fio até o rótulo da coluna
    ctx.setLineDash([2, 3])
    ctx.strokeStyle = rgba(cor, 0.55)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(xFim.value + 8, it.yFimPonto)
    ctx.lineTo(xFim.value + larguraSino.value + 6, it.yFim)
    ctx.stroke()
    ctx.setLineDash([])
    for (const [x, y, r] of [[xFim.value, it.yFimPonto, 4], [l.x, it.yPonto, 4.5]] as const) {
      ctx.fillStyle = rgba(cor, 1)
      ctx.strokeStyle = rgba(navy, 1)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
  }
}

function desenharFinais(ctx: CanvasRenderingContext2D) {
  const { creme, verde, vermelho, navy } = cores
  if (!creme) return
  // guias até os rótulos e os três finais
  for (const r of rotulos.value) {
    const cor = r.k === 'otimista' ? verde : r.k === 'pessimista' ? corDoMal() : creme
    ctx.setLineDash([2, 3])
    ctx.strokeStyle = rgba(cor ?? creme, 0.45)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(xFim.value + 8, ys.value[r.k])
    ctx.lineTo(xFim.value + larguraSino.value + 6, r.y)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = rgba(cor ?? creme, 0.22)
    ctx.beginPath()
    ctx.arc(xFim.value, ys.value[r.k], 9, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = rgba(cor ?? creme, 1)
    ctx.strokeStyle = rgba(navy, 1)
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(xFim.value, ys.value[r.k], 4.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }

}

const textoAcessivel = computed(() => {
  const l = leitura.value
  const fim = mesDoLeque(props.dados.as_of, ultimo.value)
  if (!l) return `Em ${fim}: otimista ${props.fins.otimista}, meio ${props.fins.meio}, pessimista ${props.fins.pessimista}. Use as setas para andar mês a mês.`
  const [o, m, p] = l.itens
  return `${l.quando}: otimista ${o!.valor}, meio ${m!.valor}, pessimista ${p!.valor}. Em ${fim}, esses três caminhos terminam em ${o!.fim}, ${m!.fim} e ${p!.fim}.`
})

/* ——— ponteiro, toque e teclado ——— */
function mesDoX(x: number): number {
  const P = xs.length
  if (!P) return 0
  if (x <= xs[0]!) return 0
  if (x >= xs[P - 1]!) return P - 1
  let a = 0
  let b = P - 1
  while (b - a > 1) {
    const m = (a + b) >> 1
    if (xs[m]! <= x) a = m
    else b = m
  }
  return x - xs[a]! < xs[b]! - x ? a : b
}

function apontar(e: PointerEvent) {
  const el = palco.value
  if (!el || !xs.length) return
  const r = el.getBoundingClientRect()
  mes.value = mesDoX(e.clientX - r.left)
  ativo.value = true
  pedirTopo()
}

let toqueAtivo = false
function aoMover(e: PointerEvent) {
  if (e.pointerType === 'touch' && !toqueAtivo) return
  apontar(e)
}
function aoApertar(e: PointerEvent) {
  if (e.pointerType === 'touch') toqueAtivo = true
  apontar(e)
}
function aoSoltar(e: PointerEvent) {
  if (e.pointerType === 'touch') toqueAtivo = false
}
function fechar() {
  if (!ativo.value) return
  ativo.value = false
  pedirTopo()
}
function aoSair(e: PointerEvent) {
  // no toque a leitura fica depois de soltar o dedo; sai com um toque fora
  // (com o foco do teclado, a leitura segue as setas)
  if (e.pointerType !== 'touch' && !palco.value?.matches(':focus-visible')) fechar()
}
function aoCancelar(e: PointerEvent) {
  // a página tomou o gesto (rolagem vertical)
  if (e.pointerType === 'touch') {
    toqueAtivo = false
    fechar()
  }
}
function toqueFora(e: PointerEvent) {
  if (ativo.value && palco.value && !palco.value.contains(e.target as Node)) fechar()
}

function aoFocar() {
  if (ativo.value || !palco.value?.matches(':focus-visible')) return
  mes.value = Math.round(ultimo.value / 2)
  ativo.value = true
  pedirTopo()
}

function aoTeclar(e: KeyboardEvent) {
  const P = ultimo.value
  if (e.key === 'Escape') {
    fechar()
    return
  }
  let t = ativo.value ? mes.value : Math.round(P / 2)
  switch (e.key) {
    case 'ArrowRight': case 'ArrowUp': t += e.shiftKey ? 12 : 1; break
    case 'ArrowLeft': case 'ArrowDown': t -= e.shiftKey ? 12 : 1; break
    case 'PageUp': t += 12; break
    case 'PageDown': t -= 12; break
    case 'Home': t = 0; break
    case 'End': t = P; break
    default: return
  }
  e.preventDefault()
  mes.value = Math.min(Math.max(t, 0), P)
  ativo.value = true
  pedirTopo()
}

/* ——— abre uma vez, quando aparece ——— */
const armado = ref(false)
const visivel = ref(false)
let io: IntersectionObserver | null = null
let ro: ResizeObserver | null = null
let animacao = 0
let pronto = false
// a camada parada está montada; a abertura espera por ela
let parada = false
let querAbrir = false
let geracao = 0
let lote = 0
const LOTE = 250

function lerCores() {
  const el = raiz.value
  if (!el) return
  const css = getComputedStyle(el)
  cores.creme = rgbDaCor(css.getPropertyValue('--nu-cream-text'))
  cores.verde = rgbDaCor(css.getPropertyValue('--nu-green-soft'))
  cores.vermelho = rgbDaCor(css.getPropertyValue('--nu-red-soft'))
  cores.navy = rgbDaCor(css.getPropertyValue('--nu-navy'))
}

function redesenhar() {
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  medir()
  const minha = ++geracao
  parada = false
  if (lote) cancelAnimationFrame(lote)
  lote = 0
  const camadas = comecarParado()
  if (!camadas) return
  const n = props.caminhos.n
  let k = 0
  const passo = () => {
    lote = 0
    if (minha !== geracao) return
    const ate = Math.min(k + LOTE, n)
    desenharFios(camadas.fx, k, ate)
    k = ate
    if (k < n) {
      lote = requestAnimationFrame(passo)
      return
    }
    terminarParado(camadas.ctx, camadas.fx)
    parada = true
    if (!armado.value || pronto) mostrarParado()
    desenharTopo()
    if (querAbrir) abrir()
  }
  passo()
}

/** a ordem em que os fios nascem na abertura: aleatória, uma por montagem */
function embaralhar(n: number): Uint32Array {
  const o = new Uint32Array(n)
  for (let i = 0; i < n; i++) o[i] = i
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = o[i]!
    o[i] = o[j]!
    o[j] = t
  }
  return o
}

function abrir() {
  querAbrir = false
  if (!parada) {
    querAbrir = true
    return
  }
  if (animacao) return
  visivel.value = true
  const cv = cvTopo.value
  const W = largura.value
  const H = h.value
  const n = props.caminhos.n
  const P = props.caminhos.pontos
  const ctx = cv ? prepararCanvas(cv, W, H) : null
  if (!ctx || !xs.length) {
    pronto = true
    mostrarParado()
    desenharTopo()
    return
  }
  // os 2.000 nascem no topo, um a um, em ordem aleatória; a base fica vazia até o fim
  const ordemDeNascer = embaralhar(n)
  ctx.lineWidth = celular.value ? 0.8 : 1
  ctx.lineJoin = 'round'
  let feitos = 0
  contados.value = 0
  const t0 = performance.now()
  const DUR = 1800
  const PULSO = 800
  let fim = 0
  const passo = (agora: number) => {
    if (!fim) {
      const p = Math.min((agora - t0) / DUR, 1)
      // devagar no começo (dá para ver os primeiros nascendo), depressa no meio
      const e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2
      const alvo = Math.round(e * n)
      for (let k = feitos; k < alvo; k++) {
        const i = ordemDeNascer[k]!
        ctx.strokeStyle = corDoCaminho(i)
        const o = i * P
        ctx.beginPath()
        ctx.moveTo(xs[0]!, py[o]!)
        for (let t = 1; t < P; t++) ctx.lineTo(xs[t]!, py[o + t]!)
        ctx.stroke()
      }
      feitos = alvo
      contados.value = feitos
      if (p < 1) {
        animacao = requestAnimationFrame(passo)
        return
      }
      // todos nasceram: a camada pronta (com a faixa, o meio e o sino) entra no lugar
      fim = agora
      pronto = true
      contados.value = null
      mostrarParado()
    }
    pulso = Math.min((agora - fim) / PULSO, 1)
    desenharTopo()
    if (pulso >= 1) {
      pulso = -1
      desenharTopo()
      animacao = 0
      return
    }
    animacao = requestAnimationFrame(passo)
  }
  animacao = requestAnimationFrame(passo)
}

function medirHoje() {
  if (hojeEl.value) larguraHoje.value = hojeEl.value.offsetWidth || larguraHoje.value
}

watch([largura, h], () => {
  redesenhar()
  nextTick(medirHoje)
})
watch(() => props.destaque, () => { if (pronto) pedirTopo() })
watch(() => props.caminhos, () => {
  ativo.value = false
  redesenhar()
})

onMounted(() => {
  const el = raiz.value
  if (!el) return
  largura.value = Math.round(el.clientWidth) || largura.value
  lerCores()
  medirHoje()
  document.fonts?.ready.then(medirHoje).catch(() => {})
  ro = new ResizeObserver(([entrada]) => {
    const w = Math.round(entrada?.contentRect.width ?? 0)
    if (w && Math.abs(w - largura.value) > 2) largura.value = w
  })
  ro.observe(el)
  document.addEventListener('pointerdown', toqueFora, { passive: true })

  const reduzido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduzido || typeof IntersectionObserver === 'undefined') {
    pronto = true
    visivel.value = true
    redesenhar()
    return
  }
  armado.value = true
  redesenhar()
  io = new IntersectionObserver((entradas) => {
    if (entradas.some((x) => x.isIntersecting)) {
      io?.disconnect()
      io = null
      abrir()
    }
  }, { threshold: 0.3 })
  io.observe(el)
})

onBeforeUnmount(() => {
  io?.disconnect()
  ro?.disconnect()
  document.removeEventListener('pointerdown', toqueFora)
  if (animacao) cancelAnimationFrame(animacao)
  if (quadro) cancelAnimationFrame(quadro)
  if (lote) cancelAnimationFrame(lote)
  geracao++
  parado = null
  fios = null
})
</script>

<template>
  <div
    ref="raiz"
    class="clc"
    :class="{ 'clc--armado': armado, 'clc--visivel': visivel, 'clc--lendo': !!leitura }"
    :style="{ height: `${h + 34}px` }"
  >
    <div
      ref="palco"
      class="clc__palco"
      :style="{ height: `${h}px` }"
      tabindex="0"
      role="slider"
      aria-label="Os caminhos da carteira, mês a mês"
      :aria-valuemin="0"
      :aria-valuemax="ultimo"
      :aria-valuenow="ativo ? mes : ultimo"
      :aria-valuetext="textoAcessivel"
      @pointermove="aoMover"
      @pointerdown="aoApertar"
      @pointerup="aoSoltar"
      @pointerleave="aoSair"
      @pointercancel="aoCancelar"
      @focus="aoFocar"
      @blur="fechar"
      @keydown="aoTeclar"
    >
      <canvas ref="cvBase" class="clc__cv" aria-hidden="true" />
      <canvas ref="cvTopo" class="clc__cv" aria-hidden="true" />
      <!-- a régua de hoje: o que fica acima dela terminou melhor do que você está hoje -->
      <!-- o teste à vista: quantos futuros já foram desenhados (na abertura, contando) -->
      <span v-if="visivel" class="clc__contador" aria-hidden="true" :style="{ left: `${X_HOJE}px` }"><b>{{ nfContador.format(contados ?? caminhos.n) }}</b> futuros testados</span>
      <!-- na ponta direita, embaixo da linha: ali passam só os poucos fios que terminam abaixo de hoje -->
      <span v-if="contraHoje" class="clc__hoje" aria-hidden="true" :style="{ top: `${ys.hoje}px`, left: `${xFim - 10}px` }">{{ celular ? 'hoje' : 'o que você tem hoje' }}</span>

      <template v-if="leitura">
        <span
          class="clc__quando" aria-hidden="true"
          :style="{ left: `${Math.min(Math.max(leitura.x, 34), largura - 34)}px` }"
        >{{ leitura.quando }}</span>
        <span
          v-for="it in leitura.itens.filter((x) => !leitura!.hoje || x.papel === 'meio')" :key="`g-${it.papel}`"
          class="clc__marca" :class="[`clc__marca--${it.papel}`, { 'clc__marca--esq': leitura.esquerda, 'clc__marca--mal-acima': it.papel === 'pessimista' && !malAbaixoDeHoje }]"
          aria-hidden="true"
          :style="{ left: `${leitura.x}px`, top: `${it.yGuia}px` }"
        ><b>{{ it.valor }}</b><span v-if="!leitura.hoje" class="clc__marca-nome">{{ contraHoje ? NOME[it.papel] : it.papel }}</span></span>
      </template>
    </div>

    <div class="clc__rotulos" :style="{ left: `${xFim + larguraSino + 12}px` }">
      <div
        v-for="r in rotulos" :key="r.k"
        class="clc__rotulo" :class="[`clc__rotulo--${r.k}`, { 'clc__rotulo--mal-acima': r.k === 'pessimista' && !malAbaixoDeHoje }]"
        :style="{ top: `${r.y}px` }"
      >
        <span class="clc__valor">{{ r.valor }}</span>
        <span class="clc__nome">{{ r.nome }}</span>
      </div>
      <!-- no hover, a coluna diz onde os três caminhos acesos terminam -->
      <template v-if="leitura">
        <div
          v-for="it in leitura.itens" :key="`f-${it.papel}`"
          class="clc__rotulo clc__rotulo--hover" :class="`clc__rotulo--${it.papel}`"
          aria-hidden="true"
          :style="{ top: `${it.yFim}px` }"
        >
          <span class="clc__valor clc__valor--hover">{{ it.fim }}</span>
          <span class="clc__nome">em {{ eixo.fim }}</span>
        </div>
      </template>
    </div>

    <div class="clc__eixo" :style="{ top: `${h + 10}px` }">
      <span ref="hojeEl" class="clc__eixo-hoje">{{ eixo.hoje }}</span>
      <span v-for="m in marcas" :key="`r-${m.rotulo}`" class="clc__eixo-ano" :style="{ left: `${m.x}px` }">{{ m.rotulo }}</span>
      <span class="clc__eixo-fim" :style="{ left: `${xFim}px` }">{{ eixo.fim }}</span>
    </div>
  </div>
</template>

<style scoped>
.clc { position: relative; width: 100%; }
.clc__palco {
  position: relative; width: 100%;
  touch-action: pan-y; -webkit-tap-highlight-color: transparent; user-select: none;
}
.clc__palco:focus { outline: none; }
.clc__palco:focus-visible { outline-color: var(--nu-blue-on-dark); outline-offset: 8px; border-radius: var(--nu-r-tile); }
.clc__cv { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }

/* a leitura do mês: a data no alto da guia e o valor de cada caminho aceso */
.clc__quando {
  position: absolute; top: 0; transform: translateX(-50%); pointer-events: none; white-space: nowrap;
  padding: 3px 10px; border-radius: var(--nu-r-tag); background: var(--nu-dark-chip);
  color: var(--nu-cream-text); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums;
}
.clc__marca {
  position: absolute; transform: translate(12px, -50%); pointer-events: none; white-space: nowrap;
  display: inline-flex; align-items: baseline; gap: 5px;
  padding: 3px 8px; border-radius: var(--nu-r-tag); background: var(--nu-dark-chip);
  color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums;
}
.clc__marca--esq { transform: translate(calc(-100% - 12px), -50%); }
.clc__marca b { font-size: var(--nu-fs-sm); font-weight: 800; color: var(--nu-cream-text); }
.clc__marca--otimista b { color: var(--nu-green-soft); }
.clc__marca--pessimista b { color: var(--nu-red-soft); }
.clc__marca--mal-acima b { color: var(--nu-cream-text-85); }

.clc__eixo { position: absolute; left: 0; right: 0; height: 20px; color: var(--nu-cream-text-55); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.clc__eixo-hoje { position: absolute; left: 0; white-space: nowrap; }
.clc__eixo-ano { position: absolute; transform: translateX(-50%); white-space: nowrap; color: var(--nu-cream-text-35); font-weight: 500; }
.clc__eixo-fim { position: absolute; transform: translateX(-50%); white-space: nowrap; }

.clc__rotulos { position: absolute; top: 0; right: 0; bottom: 0; pointer-events: none; }
.clc__rotulo {
  position: absolute; left: 0; transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 1px; white-space: nowrap;
}
.clc__valor { font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -.01em; font-variant-numeric: tabular-nums; line-height: 1.15; }
.clc__nome { color: var(--nu-on-dark-2); font-size: var(--nu-fs-sm); font-weight: 700; }
.clc__rotulo--otimista .clc__valor { color: var(--nu-green-soft); }
.clc__rotulo--meio .clc__valor { color: var(--nu-cream-text); }
.clc__rotulo--pessimista .clc__valor { color: var(--nu-red-soft); }
.clc__rotulo--mal-acima .clc__valor { color: var(--nu-cream-text-85); }
.clc__contador {
  position: absolute; top: 4px; pointer-events: none; white-space: nowrap;
  color: var(--nu-cream-text-55); font-size: var(--nu-fs-sm); font-weight: 600; font-variant-numeric: tabular-nums;
}
.clc__contador b { color: var(--nu-cream-text); font-weight: 700; }
.clc__hoje {
  position: absolute; transform: translate(-100%, 6px); padding: 2px 8px; border-radius: var(--nu-r-pill); pointer-events: none; white-space: nowrap;
  background: color-mix(in srgb, var(--nu-ink) 78%, transparent); color: var(--nu-cream-text-85); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .01em;
}
.clc__valor--hover { font-size: var(--nu-fs-lg); }
/* no hover, os finais parados dão lugar aos dos três caminhos acesos (o
   seletor forte vence o da abertura, que tem atraso) */
.clc.clc--lendo .clc__rotulo:not(.clc__rotulo--hover) { opacity: 0; transition: opacity .15s ease; }
.clc.clc--lendo .clc__rotulo.clc__rotulo--hover { opacity: 1; transform: translate(0, -50%); transition: none; }

/* os rótulos e o eixo chegam depois da luz, uma vez */
.clc--armado .clc__rotulo { opacity: 0; transform: translate(-6px, -50%); }
.clc--armado.clc--visivel .clc__rotulo {
  opacity: 1; transform: translate(0, -50%);
  transition: opacity .5s ease 1.2s, transform .5s ease 1.2s;
}
.clc--armado .clc__eixo { opacity: 0; }
.clc--armado.clc--visivel .clc__eixo { opacity: 1; transition: opacity .5s ease .8s; }

@media (max-width: 600px) {
  .clc__valor, .clc__valor--hover { font-size: var(--nu-fs-md); }
  .clc__marca-nome { display: none; }
  .clc__marca b { font-size: var(--nu-fs-xs); }
  .clc__nome { font-size: var(--nu-fs-xs); }
  .clc__eixo { font-size: var(--nu-fs-xs); }
}
</style>

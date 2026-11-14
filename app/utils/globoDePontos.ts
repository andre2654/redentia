/**
 * O globo de pontos da seção "No mundo" (05/11/2026, variação 1 do
 * CarteiraMundo): projeção ortográfica feita à mão, desenhada num canvas 2D.
 * Sem Vue: quem anima é o CarteiraMundoGlobo.vue, que chama `desenharGlobo`
 * só enquanto há movimento (nada em laço).
 *
 * Ortográfica centrada em (λ0, φ0), para um ponto (λ, φ):
 *   cos c = sen φ0 sen φ + cos φ0 cos φ cos(λ − λ0)   (c < 90°: lado visível)
 *   x = cos φ sen(λ − λ0)
 *   y = cos φ0 sen φ − sen φ0 cos φ cos(λ − λ0)
 * Os arcos são grandes círculos (slerp) levantados do chão por sen(πt).
 */
import { PAISES_ID, pontosDaTerra } from './mundoPontos'
import { rgbDaCor } from './futuro'

const RAD = Math.PI / 180

export interface CamadaGlobo {
  chave: string
  /** '#RRGGBB' */
  cor: string
  /** ISO numérico dos países que acendem */
  paises: string[]
  /** a região é o mundo todo: acende o halo, não os pontos */
  todos: boolean
  /** país (true) pinta por cima de região (false) */
  forte: boolean
}

export interface ArcoGlobo {
  chave: string
  cor: string
  de: [lon: number, lat: number]
  para: [lon: number, lat: number]
}

export interface VistaGlobo {
  /** centro da vista, graus */
  lon0: number
  lat0: number
}

/**
 * As cores da esfera (11/11/2026, Aportou): o canvas não entende var(), então
 * quem monta a cena lê os tokens com getComputedStyle e entrega aqui, já em
 * '#rrggbb' ou 'rgb(r, g, b)'. Nenhuma cor mora neste arquivo.
 */
export interface TemaDoGlobo {
  /** a esfera, do ponto de luz à sombra */
  luz: string
  meio: string
  sombra: string
  /** o contorno dos pontos de chegada e de partida */
  contorno: string
  /** os pontos da terra sem fatia nenhuma */
  neutro: string
  /** a atmosfera, quando não há fatia "mundo todo" */
  halo: string
}

export interface CenaGlobo {
  camadas: CamadaGlobo[]
  arcos: ArcoGlobo[]
  /** o ponto de partida (Brasil) */
  origem: [lon: number, lat: number] | null
  origemCor: string
  tema: TemaDoGlobo
  /** a fatia em destaque (hover); null = todas acesas */
  ativo: string | null
}

export interface QuadroGlobo extends VistaGlobo {
  /** quanto dos arcos já foi desenhado, 0–1 */
  arcos: number
  /** posição do brilho que corre em cada arco (0–1), ou null */
  pulsos: (number | null)[]
}

/* ————— cores ————— */

/** '#rrggbb', '#rgb' ou 'rgb(r, g, b)' (o que sai de um token) → [r, g, b]; cor que não se lê vira transparente no desenho */
function rgb(cor: string): [number, number, number] {
  return rgbDaCor(cor) ?? [0, 0, 0]
}
const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`

/* ————— a cena preparada (o que não muda a cada quadro) ————— */

export interface CenaPreparada {
  cena: CenaGlobo
  /** por ponto: índice da camada que o pinta, −1 = nenhuma */
  camadaDoPonto: Int16Array
  sinLat: Float32Array
  cosLat: Float32Array
  lonRad: Float32Array
  /** arcos amostrados: lat/lon (rad) e altura por amostra */
  arcos: { chave: string; cor: [number, number, number]; lat: Float32Array; lon: Float32Array; h: Float32Array }[]
  cores: [number, number, number][]
  todos: number
  /** do tema, já em números */
  neutro: [number, number, number]
  halo: [number, number, number]
}

let trig: { sinLat: Float32Array; cosLat: Float32Array; lonRad: Float32Array } | null = null

function amostrarArco(de: [number, number], para: [number, number], n = 72) {
  const v = (lon: number, lat: number) => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)]
  const a = v(de[0], de[1])
  const b = v(para[0], para[1])
  const dot = Math.max(-1, Math.min(1, a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!))
  const w = Math.acos(dot)
  const s = Math.sin(w) || 1
  // arco longo sobe mais (até 32% do raio), arco curto quase rente
  const alto = Math.min(0.32, 0.06 + w * 0.16)
  const lat = new Float32Array(n + 1)
  const lon = new Float32Array(n + 1)
  const h = new Float32Array(n + 1)
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const ka = w < 1e-6 ? 1 - t : Math.sin((1 - t) * w) / s
    const kb = w < 1e-6 ? t : Math.sin(t * w) / s
    const x = ka * a[0]! + kb * b[0]!
    const y = ka * a[1]! + kb * b[1]!
    const z = ka * a[2]! + kb * b[2]!
    lat[i] = Math.asin(Math.max(-1, Math.min(1, z)))
    lon[i] = Math.atan2(y, x)
    h[i] = Math.sin(Math.PI * t) * alto
  }
  return { lat, lon, h }
}

export function prepararCena(cena: CenaGlobo): CenaPreparada {
  const t = pontosDaTerra()
  if (!trig) {
    const sinLat = new Float32Array(t.n)
    const cosLat = new Float32Array(t.n)
    const lonRad = new Float32Array(t.n)
    for (let i = 0; i < t.n; i++) {
      sinLat[i] = Math.sin(t.lat[i]! * RAD)
      cosLat[i] = Math.cos(t.lat[i]! * RAD)
      lonRad[i] = t.lon[i]! * RAD
    }
    trig = { sinLat, cosLat, lonRad }
  }
  // país forte por cima de região: a camada de menor prioridade entra primeiro
  const porPais = new Map<number, number>()
  const ordem = cena.camadas.map((c, i) => [c, i] as const).sort((x, y) => Number(x[0].forte) - Number(y[0].forte))
  for (const [c, i] of ordem) {
    for (const id of c.paises) {
      const k = PAISES_ID.indexOf(id)
      if (k >= 0) porPais.set(k, i)
    }
  }
  const camadaDoPonto = new Int16Array(t.n).fill(-1)
  for (let i = 0; i < t.n; i++) {
    const c = porPais.get(t.pais[i]!)
    if (c !== undefined) camadaDoPonto[i] = c
  }
  return {
    cena,
    camadaDoPonto,
    ...trig,
    arcos: cena.arcos.map((a) => ({ chave: a.chave, cor: rgb(a.cor), ...amostrarArco(a.de, a.para) })),
    cores: cena.camadas.map((c) => rgb(c.cor)),
    todos: cena.camadas.findIndex((c) => c.todos),
    neutro: rgb(cena.tema.neutro),
    halo: rgb(cena.tema.halo),
  }
}

/* ————— projeção ————— */

export function projetar(v: VistaGlobo, lon: number, lat: number): { x: number; y: number; visivel: boolean } {
  const l0 = v.lon0 * RAD
  const f0 = v.lat0 * RAD
  const f = lat * RAD
  const dl = lon * RAD - l0
  const cosc = Math.sin(f0) * Math.sin(f) + Math.cos(f0) * Math.cos(f) * Math.cos(dl)
  return {
    x: Math.cos(f) * Math.sin(dl),
    y: Math.cos(f0) * Math.sin(f) - Math.sin(f0) * Math.cos(f) * Math.cos(dl),
    visivel: cosc > 0,
  }
}

/** O centro da vista para mostrar a e b juntos (o meio do grande círculo, se cabe). */
export function vistaEntre(a: [number, number], b: [number, number] | null): VistaGlobo {
  if (!b) return { lon0: a[0], lat0: Math.max(-35, Math.min(35, a[1])) }
  const v = (lon: number, lat: number) => [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.cos(lat * RAD) * Math.sin(lon * RAD), Math.sin(lat * RAD)]
  const p = v(a[0], a[1])
  const q = v(b[0], b[1])
  const ang = Math.acos(Math.max(-1, Math.min(1, p[0]! * q[0]! + p[1]! * q[1]! + p[2]! * q[2]!)))
  // longe demais para os dois caberem: fica perto de a, virado para b
  const peso = ang > 1.9 ? 0.3 : 0.5
  const m = [p[0]! * (1 - peso) + q[0]! * peso, p[1]! * (1 - peso) + q[1]! * peso, p[2]! * (1 - peso) + q[2]! * peso]
  const r = Math.hypot(m[0]!, m[1]!, m[2]!) || 1
  return {
    lon0: Math.atan2(m[1]!, m[0]!) / RAD,
    lat0: Math.max(-35, Math.min(35, Math.asin(m[2]! / r) / RAD)),
  }
}

/* ————— o desenho ————— */

/**
 * Desenha um quadro. `s` é o lado do canvas em px CSS (o contexto já vem
 * escalado pelo devicePixelRatio).
 */
export function desenharGlobo(ctx: CanvasRenderingContext2D, s: number, p: CenaPreparada, q: QuadroGlobo) {
  const cx = s / 2
  const cy = s / 2
  const R = s * 0.4
  const { cena } = p
  ctx.clearRect(0, 0, s, s)

  // a atmosfera: um halo azul em volta (raio ≤ meio lado: o canvas não corta) (na cor da região "mundo todo", se houver)
  const corHalo = p.todos >= 0 ? p.cores[p.todos]! : p.halo
  const haloForte = p.todos >= 0 && (!cena.ativo || cena.ativo === cena.camadas[p.todos]!.chave)
  const halo = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.24)
  halo.addColorStop(0, rgba(corHalo, haloForte ? 0.34 : 0.16))
  halo.addColorStop(0.45, rgba(corHalo, haloForte ? 0.12 : 0.06))
  halo.addColorStop(1, rgba(corHalo, 0))
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(cx, cy, R * 1.24, 0, Math.PI * 2)
  ctx.fill()

  // a esfera, com a luz do alto à esquerda
  const esfera = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.45, R * 0.05, cx, cy, R * 1.05)
  esfera.addColorStop(0, cena.tema.luz)
  esfera.addColorStop(0.5, cena.tema.meio)
  esfera.addColorStop(1, cena.tema.sombra)
  ctx.fillStyle = esfera
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.fill()

  // os pontos, agrupados por cor e faixa de opacidade (poucas trocas de estilo)
  const l0 = q.lon0 * RAD
  const f0 = q.lat0 * RAD
  const sf0 = Math.sin(f0)
  const cf0 = Math.cos(f0)
  const FAIXAS = 6
  const nCam = p.cores.length
  const grupos: number[][] = Array.from({ length: (nCam + 1) * FAIXAS }, () => [])
  const d = Math.max(1.05, R * 0.0078)
  const n = p.sinLat.length
  for (let i = 0; i < n; i++) {
    const dl = p.lonRad[i]! - l0
    const cdl = Math.cos(dl)
    const cosc = sf0 * p.sinLat[i]! + cf0 * p.cosLat[i]! * cdl
    if (cosc <= 0.02) continue
    const x = cx + R * p.cosLat[i]! * Math.sin(dl)
    const y = cy - R * (cf0 * p.sinLat[i]! - sf0 * p.cosLat[i]! * cdl)
    const c = p.camadaDoPonto[i]!
    const faixa = Math.min(FAIXAS - 1, Math.floor(cosc * FAIXAS))
    const g = grupos[(c + 1) * FAIXAS + faixa]!
    g.push(x, y)
  }
  for (let c = -1; c < nCam; c++) {
    const cam = c >= 0 ? cena.camadas[c]! : null
    // "mundo todo" acende o halo, os pontos ficam neutros
    const neutro = !cam || cam.todos
    const apagado = !!cam && !!cena.ativo && cena.ativo !== cam.chave
    for (let f = 0; f < FAIXAS; f++) {
      const g = grupos[(c + 1) * FAIXAS + f]!
      if (!g.length) continue
      const k = (f + 0.5) / FAIXAS
      let a: number
      let r = d * (0.55 + 0.45 * k)
      if (neutro) a = 0.1 + 0.2 * k
      else if (cam!.forte) { a = (0.5 + 0.5 * k) * (apagado ? 0.32 : 1); r *= 1.28 }
      else a = (0.3 + 0.32 * k) * (apagado ? 0.4 : 1)
      ctx.fillStyle = rgba(neutro ? p.neutro : p.cores[c]!, a)
      ctx.beginPath()
      for (let j = 0; j < g.length; j += 2) {
        ctx.moveTo(g[j]! + r, g[j + 1]!)
        ctx.arc(g[j]!, g[j + 1]!, r, 0, Math.PI * 2)
      }
      ctx.fill()
    }
  }

  // a borda escurece um tico: dá volume sem sombra preta
  const borda = ctx.createRadialGradient(cx, cy, R * 0.72, cx, cy, R)
  borda.addColorStop(0, 'rgba(12,21,36,0)')
  borda.addColorStop(1, 'rgba(12,21,36,0.07)')
  ctx.fillStyle = borda
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.fill()

  // os arcos saindo do Brasil
  const tela = (lat: number, lon: number, h: number) => {
    const dl = lon - l0
    const cdl = Math.cos(dl)
    const cosc = sf0 * Math.sin(lat) + cf0 * Math.cos(lat) * cdl
    const k = R * (1 + h)
    const x = Math.cos(lat) * Math.sin(dl) * k
    const y = (cf0 * Math.sin(lat) - sf0 * Math.cos(lat) * cdl) * k
    // na frente, ou por cima do horizonte (fora do disco)
    const visivel = cosc > 0 || x * x + y * y > R * R
    return { x: cx + x, y: cy - y, visivel }
  }
  ctx.lineCap = 'round'
  p.arcos.forEach((arco, ai) => {
    const apagado = !!cena.ativo && cena.ativo !== arco.chave
    const total = arco.lat.length - 1
    const ate = Math.floor(total * Math.max(0, Math.min(1, q.arcos)))
    if (ate < 1) return
    ctx.save()
    ctx.strokeStyle = rgba(arco.cor, apagado ? 0.22 : 0.9)
    ctx.lineWidth = apagado ? 1.2 : 1.8
    ctx.shadowColor = rgba(arco.cor, apagado ? 0 : 0.6)
    ctx.shadowBlur = apagado ? 0 : 8
    ctx.beginPath()
    let caneta = false
    for (let i = 0; i <= ate; i++) {
      const pt = tela(arco.lat[i]!, arco.lon[i]!, arco.h[i]!)
      if (!pt.visivel) { caneta = false; continue }
      if (caneta) ctx.lineTo(pt.x, pt.y)
      else { ctx.moveTo(pt.x, pt.y); caneta = true }
    }
    ctx.stroke()

    // o brilho que corre do Brasil até lá
    const pulso = q.pulsos[ai]
    if (pulso != null && !apagado && q.arcos >= 1) {
      const cabeca = Math.floor(total * pulso)
      const cauda = 14
      for (let i = Math.max(1, cabeca - cauda); i <= cabeca; i++) {
        const a = tela(arco.lat[i - 1]!, arco.lon[i - 1]!, arco.h[i - 1]!)
        const b = tela(arco.lat[i]!, arco.lon[i]!, arco.h[i]!)
        if (!a.visivel || !b.visivel) continue
        const k = 1 - (cabeca - i) / cauda
        ctx.strokeStyle = `rgba(255,255,255,${(0.95 * k).toFixed(3)})`
        ctx.lineWidth = 1.2 + 2.2 * k
        ctx.shadowColor = rgba(arco.cor, 0.9)
        ctx.shadowBlur = 14 * k
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
    }
    ctx.restore()

    // a chegada
    if (q.arcos >= 1) {
      const fim = tela(arco.lat[total]!, arco.lon[total]!, 0)
      if (fim.visivel) {
        ctx.fillStyle = rgba(arco.cor, apagado ? 0.35 : 1)
        ctx.strokeStyle = cena.tema.contorno
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.arc(fim.x, fim.y, apagado ? 2.6 : 3.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }
    }
  })

  // o ponto de partida: o Brasil
  if (cena.origem) {
    const o = projetar(q, cena.origem[0], cena.origem[1])
    if (o.visivel) {
      const ox = cx + R * o.x
      const oy = cy - R * o.y
      const c = rgb(cena.origemCor)
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, 16)
      g.addColorStop(0, rgba(c, 0.35))
      g.addColorStop(1, rgba(c, 0))
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(ox, oy, 16, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = rgba(c, 1)
      ctx.strokeStyle = cena.tema.contorno
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(ox, oy, 4.4, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
  }
}

/** Onde uma âncora cai no canvas (px CSS), para o hover e as etiquetas. */
export function ancoraNoCanvas(s: number, v: VistaGlobo, lon: number, lat: number): { x: number; y: number; visivel: boolean } {
  const R = s * 0.4
  const pr = projetar(v, lon, lat)
  return { x: s / 2 + R * pr.x, y: s / 2 - R * pr.y, visivel: pr.visivel }
}

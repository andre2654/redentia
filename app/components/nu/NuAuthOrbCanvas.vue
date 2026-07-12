<script setup lang="ts">
// Orbe do painel de AUTH — porte 1:1 do componentDidMount de
// "Redentia Login Nu.dc.html" (superelipse rotacionando, 44 anéis × 104
// pontos em composite 'lighter', fit com devicePixelRatio no resize,
// cancelAnimationFrame + removeEventListener no unmount).
//
// NÃO é o MercadoOrb (hero do /mercado): a orbe de auth é menor no frame
// (R = min(W,H) × 0.38 vs 0.42) — cada design é contrato próprio.
//
// EXCEÇÃO consciente à regra de tokens: canvas 2D não lê var(--nu-*), então
// as cores da pintura vivem aqui, idênticas às do design.
const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0
let onResize: (() => void) | null = null

onMounted(() => {
  const cv = canvasRef.value
  if (!cv) return
  const ctx = cv.getContext('2d')
  if (!ctx) return

  const fit = () => {
    const r = cv.getBoundingClientRect()
    const d = window.devicePixelRatio || 1
    cv.width = Math.max(2, Math.round(r.width * d))
    cv.height = Math.max(2, Math.round(r.height * d))
  }
  fit()
  onResize = fit
  window.addEventListener('resize', onResize)

  const rMax = (th: number) =>
    Math.pow(Math.pow(Math.abs(Math.cos(th)), 2 / 3) + Math.pow(Math.abs(Math.sin(th)), 2 / 3), -1.5)

  const draw = (tm: number) => {
    const t = tm * 0.001
    const W = cv.width
    const H = cv.height
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, W, H)
    const cx = W / 2
    const cy = H / 2
    const R = Math.min(W, H) * 0.38
    const rot = t * 0.10
    const breath = 1 + 0.03 * Math.sin(t * 0.8)

    let g = ctx.createRadialGradient(cx - R * 0.95, cy - R * 0.1, 0, cx - R * 0.95, cy - R * 0.1, R * 2.0)
    g.addColorStop(0, 'rgba(40,225,255,0.28)')
    g.addColorStop(1, 'rgba(40,225,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)

    g = ctx.createRadialGradient(cx - R * 0.6, cy + R * 1.05, 0, cx - R * 0.6, cy + R * 1.05, R * 1.6)
    g.addColorStop(0, 'rgba(170,60,220,0.18)')
    g.addColorStop(1, 'rgba(170,60,220,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)

    const pathAt = () => {
      const p = new Path2D()
      for (let k = 0; k <= 160; k++) {
        const th = (k / 160) * Math.PI * 2
        const rr = R * breath * rMax(th) * (1 + 0.025 * Math.sin(4 * th + t * 1.2))
        const x = cx + Math.cos(th + rot) * rr
        const y = cy + Math.sin(th + rot) * rr
        if (k === 0) p.moveTo(x, y)
        else p.lineTo(x, y)
      }
      p.closePath()
      return p
    }
    const shape = pathAt()

    ctx.save()
    ctx.strokeStyle = 'rgba(60,190,255,0.20)'
    ctx.lineWidth = R * 0.16
    ctx.stroke(shape)
    ctx.restore()

    g = ctx.createRadialGradient(cx - R * 0.5, cy - R * 0.15, R * 0.08, cx, cy, R)
    g.addColorStop(0, '#1E7BE8')
    g.addColorStop(0.45, '#1250D6')
    g.addColorStop(0.8, '#0B2FB0')
    g.addColorStop(1, '#0A1E86')
    ctx.fillStyle = g
    ctx.fill(shape)

    ctx.save()
    ctx.lineWidth = Math.max(2, R * 0.018)
    ctx.strokeStyle = 'rgba(130,246,255,0.85)'
    ctx.stroke(shape)
    ctx.lineWidth = Math.max(4, R * 0.05)
    ctx.strokeStyle = 'rgba(60,235,255,0.28)'
    ctx.stroke(shape)
    ctx.restore()

    ctx.save()
    ctx.clip(shape)
    g = ctx.createRadialGradient(cx - R * 0.9, cy, 0, cx - R * 0.9, cy, R * 0.95)
    g.addColorStop(0, 'rgba(130,255,255,0.45)')
    g.addColorStop(1, 'rgba(130,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    ctx.restore()

    const px = Math.max(1, window.devicePixelRatio || 1)
    ctx.globalCompositeOperation = 'lighter'
    const RINGS = 44
    const PTS = 104
    for (let i = 1; i <= RINGS; i++) {
      const f2 = i / RINGS
      for (let j = 0; j < PTS; j++) {
        const th = (j / PTS) * Math.PI * 2 + (i % 2) * (Math.PI / PTS)
        const wob = 1 + 0.05 * Math.sin(3 * th + t * 1.1) * Math.sin(4 * f2 * Math.PI - t * 0.8)
        const rr = R * breath * f2 * rMax(th) * wob
        const x = Math.cos(th + rot) * rr
        const y = Math.sin(th + rot) * rr
        const xn = x / R
        const yn = y / R
        const fold = Math.exp(-Math.pow(xn * 0.8 + yn * 0.95 - Math.sin(t * 0.4) * 0.25, 2) / 0.028)
        const edge = Math.pow(f2, 5)
        const cyan = (1 - (xn + 1) / 2) * (0.35 + 0.45 * f2) + fold * 0.5 + edge * (xn < 0 ? 1.1 : 0.4)
        const rC = Math.min(255, 14 + 80 * cyan + 80 * fold) | 0
        const gC = Math.min(255, 60 + 165 * cyan + 70 * fold) | 0
        const a = Math.min(0.9, 0.07 + 0.30 * f2 + edge * 0.45 + fold * 0.25)
        ctx.fillStyle = 'rgba(' + rC + ',' + gC + ',255,' + a.toFixed(3) + ')'
        const sz = (0.6 + 0.8 * f2 + edge * 0.9) * px
        ctx.fillRect(cx + x, cy + y, sz, sz)
      }
    }
    ctx.globalCompositeOperation = 'source-over'
    raf = requestAnimationFrame(draw)
  }
  raf = requestAnimationFrame(draw)
})

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  if (onResize) window.removeEventListener('resize', onResize)
})
</script>

<template>
  <canvas ref="canvasRef" class="orb" aria-hidden="true" />
</template>

<style scoped>
.orb { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
</style>

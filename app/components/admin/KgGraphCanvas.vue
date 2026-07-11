<script setup lang="ts">
// Canvas força-dirigido do Knowledge Graph. Busca GET /kg/graph (via proxy
// /api/chat), simula em canvas (nó = entidade, tamanho = nº de claims) e emite
// as stats pro pai montar a legenda. Client-only (usa canvas/window em onMounted).
interface GraphNode { l: string; k: string; c: number; x?: number; y?: number; vx?: number; vy?: number; r?: number }
type Link = [number, number]
interface Graph { nodes: GraphNode[]; links: Link[]; stats: { entities: number; links: number; claims: number } }

const emit = defineEmits<{ stats: [Graph['stats']] }>()

const COL: Record<string, string> = { asset: '#4FD6A8', sector: '#EF9F27', thesis: '#DDFF33' }

const cv = ref<HTMLCanvasElement | null>(null)
const tip = ref<HTMLDivElement | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

let raf = 0
let stop: (() => void) | null = null

async function load() {
  loading.value = true
  error.value = null
  try {
    const g = await $fetch<Graph>('/api/chat/kg/graph')
    emit('stats', g.stats)
    await nextTick()
    render(g)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Falha ao carregar o grafo'
  } finally {
    loading.value = false
  }
}
defineExpose({ reload: load })

function render(g: Graph) {
  if (stop) stop()
  const canvas = cv.value
  const tipEl = tip.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const N = g.nodes as Required<GraphNode>[]
  const L = g.links
  const H = 520
  const DPR = Math.min(2, window.devicePixelRatio || 1)
  let W = 0
  const size = () => { W = canvas.clientWidth || 800; canvas.width = W * DPR; canvas.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0) }

  N.forEach((n) => { n.r = Math.max(2.2, Math.min(16, 2 + Math.sqrt(n.c) * 0.75)); n.x = (Math.random() - 0.5) * 340; n.y = (Math.random() - 0.5) * 340; n.vx = 0; n.vy = 0 })
  const labeled = new Set(N.map((n, i) => [i, n.c] as [number, number]).sort((a, b) => b[1] - a[1]).slice(0, 10).map((x) => x[0]))
  const adj: number[][] = N.map(() => [])
  for (const e of L) { adj[e[0]]!.push(e[1]); adj[e[1]]!.push(e[0]) }
  let alpha = 1
  let hover = -1
  size()

  function tick() {
    for (let i = 0; i < N.length; i++) {
      const a = N[i]!
      for (let j = i + 1; j < N.length; j++) {
        const b = N[j]!
        let dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy
        if (d2 < 1) d2 = 1
        if (d2 > 90000) continue
        const d = Math.sqrt(d2), f = 400 / d2, fx = dx / d * f, fy = dy / d * f
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy
      }
      a.vx += (-a.x) * 0.006; a.vy += (-a.y) * 0.006
    }
    for (const e of L) {
      const a = N[e[0]]!, b = N[e[1]]!
      let dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1
      const target = 36 + a.r + b.r, f = (d - target) * 0.02, fx = dx / d * f, fy = dy / d * f
      a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy
    }
    for (const a of N) { a.x += a.vx * alpha; a.y += a.vy * alpha; a.vx *= 0.86; a.vy *= 0.86 }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H)
    const ox = W / 2, oy = H / 2
    const hi = hover >= 0 ? new Set(adj[hover]!.concat([hover])) : null
    ctx.lineWidth = 1
    for (const e of L) {
      const a = N[e[0]]!, b = N[e[1]]!
      const on = hi && (e[0] === hover || e[1] === hover)
      ctx.strokeStyle = on ? 'rgba(221,255,51,0.55)' : 'rgba(255,255,255,0.05)'
      ctx.beginPath(); ctx.moveTo(ox + a.x, oy + a.y); ctx.lineTo(ox + b.x, oy + b.y); ctx.stroke()
    }
    for (let i = 0; i < N.length; i++) {
      const n = N[i]!
      ctx.globalAlpha = hi && !hi.has(i) ? 0.22 : 1
      ctx.beginPath(); ctx.arc(ox + n.x, oy + n.y, n.r, 0, 6.2832); ctx.fillStyle = COL[n.k] ?? '#8b8b93'; ctx.fill()
      if (i === hover) { ctx.lineWidth = 1.5; ctx.strokeStyle = '#fff'; ctx.stroke() }
    }
    ctx.globalAlpha = 1; ctx.font = '500 10px ui-monospace,monospace'; ctx.textAlign = 'center'
    for (let i = 0; i < N.length; i++) {
      if (labeled.has(i) || (hi && hi.has(i))) {
        const n = N[i]!
        ctx.fillStyle = i === hover ? '#DDFF33' : '#cfcfd6'
        ctx.fillText(n.l, ox + n.x, oy + n.y - n.r - 3)
      }
    }
  }

  let f = 0
  const loop = () => { if (f < 540) { tick(); alpha = Math.max(0.02, 1 - f / 540); f++ } draw(); raf = requestAnimationFrame(loop) }
  loop()

  const onMove = (ev: MouseEvent) => {
    const rc = canvas.getBoundingClientRect()
    const mx = ev.clientX - rc.left - W / 2, my = ev.clientY - rc.top - H / 2
    let best = -1, bd = 1e9
    for (let i = 0; i < N.length; i++) {
      const n = N[i]!, dx = mx - n.x, dy = my - n.y, d = dx * dx + dy * dy
      if (d < Math.max(64, (n.r + 4) * (n.r + 4)) && d < bd) { bd = d; best = i }
    }
    hover = best
    if (best >= 0 && tipEl) {
      const n = N[best]!
      tipEl.style.left = `${W / 2 + n.x}px`; tipEl.style.top = `${H / 2 + n.y}px`
      tipEl.style.opacity = '1'; tipEl.textContent = `${n.l} · ${n.c} claims`
    } else if (tipEl) tipEl.style.opacity = '0'
  }
  const onLeave = () => { hover = -1; if (tipEl) tipEl.style.opacity = '0' }
  canvas.addEventListener('mousemove', onMove)
  canvas.addEventListener('mouseleave', onLeave)
  window.addEventListener('resize', size)
  stop = () => { cancelAnimationFrame(raf); canvas.removeEventListener('mousemove', onMove); canvas.removeEventListener('mouseleave', onLeave); window.removeEventListener('resize', size) }
}

onMounted(load)
onBeforeUnmount(() => { if (stop) stop() })
</script>

<template>
  <div class="kg-panel">
    <p v-if="error" class="kg-msg">{{ error }}</p>
    <canvas ref="cv" class="kg-canvas" />
    <div ref="tip" class="kg-tip" />
  </div>
</template>

<style scoped>
.kg-panel {
  position: relative; background: #0B0B0F; border-radius: 14px;
  overflow: hidden; border: 0.5px solid #26262c;
}
.kg-canvas { display: block; width: 100%; height: 520px; }
.kg-msg { color: #f0997b; font-size: 13px; padding: 20px; }
.kg-tip {
  position: absolute; pointer-events: none; background: #16161b; color: #F4F4F0;
  border: 0.5px solid #3a3a42; border-radius: 6px; padding: 4px 8px;
  font: 500 11px/1.3 ui-monospace, monospace; opacity: 0;
  transform: translate(-50%, -140%); white-space: nowrap; transition: opacity .1s;
}
</style>

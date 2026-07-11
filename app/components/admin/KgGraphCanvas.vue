<script setup lang="ts">
// Knowledge Graph — visualização interativa estilo Neo4j Browser (cytoscape).
// Pan (arrasta o fundo), zoom (scroll), arrasta nós, clica pra focar a
// vizinhança, filtra por tipo, painel de detalhes. Lê GET /kg/graph via
// proxy /api/chat. Client-only (cytoscape importado em onMounted).
import type { Core, NodeSingular } from 'cytoscape'

interface GNode { l: string; k: string; c: number }
type Link = [number, number]
interface Graph { nodes: GNode[]; links: Link[]; stats: { entities: number; links: number; claims: number } }

const emit = defineEmits<{ stats: [Graph['stats']] }>()

const COL: Record<string, string> = { asset: '#4FD6A8', sector: '#EF9F27', thesis: '#DDFF33' }

const container = ref<HTMLElement | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const selected = ref<{ label: string; kind: string; claims: number; degree: number } | null>(null)
const kinds = reactive<Record<string, boolean>>({ asset: true, sector: true, thesis: true })
let cy: Core | null = null

async function load() {
  loading.value = true
  error.value = null
  try {
    const g = await $fetch<Graph>('/api/chat/kg/graph')
    emit('stats', g.stats)
    await nextTick()
    await build(g)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Falha ao carregar o grafo'
  } finally {
    loading.value = false
  }
}

// Força-dirigido headless (repulsão n², mola nas arestas, gravidade ao centro).
// Roda ~450 iterações sem renderizar e devolve {x,y} por nó pro cytoscape.
function computeLayout(g: Graph): Array<{ x: number; y: number }> {
  const N = g.nodes.map(() => ({ x: (Math.random() - 0.5) * 500, y: (Math.random() - 0.5) * 500, vx: 0, vy: 0 }))
  const L = g.links
  for (let it = 0; it < 450; it++) {
    const alpha = Math.max(0.03, 1 - it / 450)
    for (let i = 0; i < N.length; i++) {
      const a = N[i]!
      for (let j = i + 1; j < N.length; j++) {
        const b = N[j]!
        let dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy
        if (d2 < 1) d2 = 1
        if (d2 > 160000) continue
        const d = Math.sqrt(d2), f = 650 / d2, fx = dx / d * f, fy = dy / d * f
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy
      }
      a.vx += -a.x * 0.005; a.vy += -a.y * 0.005
    }
    for (const e of L) {
      const a = N[e[0]]!, b = N[e[1]]!
      let dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1
      const f = (d - 46) * 0.03, fx = dx / d * f, fy = dy / d * f
      a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy
    }
    for (const a of N) { a.x += a.vx * alpha; a.y += a.vy * alpha; a.vx *= 0.85; a.vy *= 0.85 }
  }
  return N.map((n) => ({ x: n.x, y: n.y }))
}

async function build(g: Graph) {
  if (!container.value) return
  const cytoscape = (await import('cytoscape')).default
  if (cy) { cy.destroy(); cy = null }

  const sz = (c: number) => Math.max(10, Math.min(64, 9 + Math.sqrt(c) * 2.4))
  // Posições via force-sim próprio (o cose colapsava este grafo em linha).
  // O cytoscape só renderiza (layout 'preset') e cuida da interação.
  const pos = computeLayout(g)
  const nodes = g.nodes.map((n, i) => ({ data: { id: `n${i}`, label: n.l, kind: n.k, claims: n.c, size: sz(n.c) }, position: pos[i] }))
  const edges = g.links.map((e, i) => ({ data: { id: `e${i}`, source: `n${e[0]}`, target: `n${e[1]}` } }))

  cy = cytoscape({
    container: container.value,
    elements: { nodes, edges },
    minZoom: 0.1,
    maxZoom: 3,
    layout: { name: 'preset' },
    style: [
      {
        selector: 'node',
        style: {
          'background-color': (ele: NodeSingular) => COL[ele.data('kind')] ?? '#8b8b93',
          width: 'data(size)', height: 'data(size)',
          label: 'data(label)', color: '#0B0B0F',
          'font-family': 'ui-monospace, monospace', 'font-size': 8, 'font-weight': 600,
          'text-valign': 'center', 'text-halign': 'center',
          'text-opacity': 0, 'border-width': 0,
        },
      },
      { selector: 'node[claims >= 60]', style: { 'text-opacity': 1 } },
      { selector: 'node.hl', style: { 'text-opacity': 1 } },
      { selector: 'node:selected', style: { 'border-width': 2, 'border-color': '#fff', 'text-opacity': 1 } },
      { selector: 'edge', style: { width: 1, 'line-color': 'rgba(255,255,255,0.09)', 'curve-style': 'straight' } },
      { selector: 'edge.hl', style: { 'line-color': 'rgba(221,255,51,0.5)', width: 1.4 } },
      { selector: '.faded', style: { opacity: 0.1, 'text-opacity': 0 } },
    ],
  })
  // Enquadra só depois do container ter o tamanho final pintado (senão o fit
  // pega uma viewport 0 e joga o grafo no canto).
  requestAnimationFrame(() => { cy?.resize(); cy?.fit(cy.elements(), 40) })

  cy.on('tap', 'node', (ev) => {
    const node = ev.target as NodeSingular
    cy!.elements().addClass('faded').removeClass('hl')
    const nb = node.closedNeighborhood()
    nb.removeClass('faded'); nb.addClass('hl')
    selected.value = { label: node.data('label'), kind: node.data('kind'), claims: node.data('claims'), degree: node.degree(false) }
  })
  cy.on('tap', (ev) => {
    if (ev.target === cy) { cy!.elements().removeClass('faded hl'); selected.value = null }
  })
}

function applyFilter() {
  if (!cy) return
  cy.nodes().forEach((n) => { n.style('display', kinds[n.data('kind')] ? 'element' : 'none') })
}
watch(kinds, applyFilter, { deep: true })

function fit() { cy?.fit(undefined, 40) }
defineExpose({ reload: load, fit })

onMounted(load)
onBeforeUnmount(() => { cy?.destroy(); cy = null })
</script>

<template>
  <div class="kg-panel">
    <p v-if="error" class="kg-msg">{{ error }}</p>

    <div class="kg-controls">
      <button v-for="(on, k) in kinds" :key="k" type="button" class="kg-chip" :class="{ off: !on }" @click="kinds[k] = !kinds[k]">
        <span class="kg-cdot" :style="{ background: COL[k] }" />{{ k }}
      </button>
      <button type="button" class="kg-chip kg-chip--act" @click="fit()">
        <UIcon name="i-lucide-maximize-2" class="size-3" /> ajustar
      </button>
    </div>

    <div v-if="selected" class="kg-detail">
      <span class="kg-detail__badge" :style="{ background: COL[selected.kind], color: '#0B0B0F' }">{{ selected.kind }}</span>
      <span class="kg-detail__name">{{ selected.label }}</span>
      <span class="kg-detail__meta">{{ selected.claims }} claims · {{ selected.degree }} conexões</span>
    </div>

    <p v-if="loading" class="kg-loading">carregando o grafo…</p>
    <div ref="container" class="kg-cy" />
  </div>
</template>

<style scoped>
.kg-panel {
  position: relative; background: #0B0B0F; border-radius: 14px;
  overflow: hidden; border: 0.5px solid #26262c;
}
.kg-cy { width: 100%; height: 600px; }
.kg-msg { color: #f0997b; font-size: 13px; padding: 20px; }
.kg-loading {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-family: ui-monospace, monospace; font-size: 12px; color: #8b8b93; pointer-events: none;
}
.kg-controls {
  position: absolute; top: 12px; left: 12px; z-index: 2;
  display: flex; flex-wrap: wrap; gap: 6px;
}
.kg-chip {
  display: inline-flex; align-items: center; gap: 5px;
  background: #16161b; border: 0.5px solid #3a3a42; border-radius: 999px;
  padding: 4px 10px; color: #cfcfd6; cursor: pointer;
  font: 500 11px/1 ui-monospace, monospace; text-transform: capitalize; transition: opacity .15s;
}
.kg-chip.off { opacity: 0.4; }
.kg-chip--act { color: #DDFF33; border-color: #4a521f; text-transform: none; }
.kg-cdot { width: 8px; height: 8px; border-radius: 50%; }
.kg-detail {
  position: absolute; top: 12px; right: 12px; z-index: 2;
  display: flex; flex-direction: column; gap: 4px; align-items: flex-end;
  background: #16161b; border: 0.5px solid #3a3a42; border-radius: 10px; padding: 10px 12px;
}
.kg-detail__badge { font: 600 9px/1 ui-monospace, monospace; padding: 3px 7px; border-radius: 5px; text-transform: capitalize; }
.kg-detail__name { font: 600 14px/1 ui-monospace, monospace; color: #F4F4F0; }
.kg-detail__meta { font: 400 10px/1 ui-monospace, monospace; color: #8b8b93; }
</style>

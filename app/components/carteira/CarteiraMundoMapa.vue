<script setup lang="ts">
// Variação 2 do "No mundo" (05/11/2026): o mapa-múndi plano de pontos
// (Natural Earth I), com uma bolha por lugar do tamanho do dinheiro exposto a
// ele (área proporcional) e os pontos acesos. A região de receita (Europa,
// Ásia…) tem bolha no centro e acende os membros; a região de ETF (Mundo
// desenvolvido) só acende os membros, sem bolha. Desenho parado: o
// canvas só redesenha quando muda o tamanho ou o destaque; as bolhas crescem
// uma vez, quando a seção entra na tela.
import type { FatiaMundo } from '~/utils/exposicaoNoMundo'
import { MAPA_H, MAPA_W, PAISES_ID, pontosDaTerra, projetarPlano } from '~/utils/mundoPontos'

type FatiaCor = FatiaMundo & { cor: string }

const props = defineProps<{ fatias: FatiaCor[]; ativo: string | null }>()
const emit = defineEmits<{ (e: 'ativo', chave: string | null): void }>()

const caixa = ref<HTMLDivElement | null>(null)
const tela = ref<HTMLCanvasElement | null>(null)
const largura = ref(0)
const entrou = ref(false)

/** a bolha: área ∝ participação; a maior tem raio de 9% da largura do mapa */
const bolhas = computed(() => {
  // países e regiões de receita (têm âncora); a região de ETF só acende os pontos
  const paises = props.fatias.filter((f) => f.ancora)
  const max = Math.max(...paises.map((f) => f.pct), 1)
  return paises.map((f, i) => {
    const [x, y] = projetarPlano(f.ancora![0], f.ancora![1])
    return { f, x, y, r: Math.max(7, 90 * Math.sqrt(f.pct / max)), i }
  })
})

/**
 * Etiqueta fixa só nos maiores (3, ou 2 no celular), a partir de 3% e longe
 * umas das outras: as regiões de receita se amontoam no hemisfério norte. As outras aparecem no
 * hover, da bolha ou da lista.
 */
const etiquetas = computed(() => {
  const n = largura.value && largura.value < 560 ? 2 : 3
  // do maior para o menor; quem cai a menos de 140 de uma já posta não ganha etiqueta fixa
  const postas: { x: number; y: number }[] = []
  const fixas = new Set<string>()
  for (const b of [...bolhas.value].sort((x, y) => y.f.pct - x.f.pct)) {
    if (fixas.size >= n || b.f.pct < 3) break
    if (postas.some((q) => Math.hypot(q.x - b.x, q.y - b.y) < 140)) continue
    postas.push(b)
    fixas.add(b.f.chave)
  }
  return bolhas.value.filter((b) => fixas.has(b.f.chave) || b.f.chave === props.ativo)
})

function hexRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}

let plano: { x: Float32Array; y: Float32Array } | null = null
function desenhar() {
  const c = tela.value
  const w = largura.value
  if (!c || !w) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  const t = pontosDaTerra()
  if (!plano) {
    const x = new Float32Array(t.n)
    const y = new Float32Array(t.n)
    for (let i = 0; i < t.n; i++) { const p = projetarPlano(t.lon[i]!, t.lat[i]!); x[i] = p[0]; y[i] = p[1] }
    plano = { x, y }
  }
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const k = w / MAPA_W
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, MAPA_H * k)
  // quem pinta cada país: país por cima de região
  const porPais = new Map<number, FatiaCor>()
  const ordem = [...props.fatias].sort((a, b) => Number(a.tipo === 'pais') - Number(b.tipo === 'pais'))
  for (const f of ordem) for (const id of f.paises) { const i = PAISES_ID.indexOf(id); if (i >= 0) porPais.set(i, f) }
  const todos = props.fatias.find((f) => f.todos)
  const r = Math.max(0.9, 1.55 * k * 1.2)
  const grupos = new Map<string, number[]>()
  for (let i = 0; i < t.n; i++) {
    const f = porPais.get(t.pais[i]!) ?? todos ?? null
    let estilo: string
    if (!f) estilo = 'rgba(12,21,36,0.16)'
    else {
      const apagado = !!props.ativo && props.ativo !== f.chave
      const a = f.todos ? 0.32 : f.tipo === 'pais' ? 0.95 : 0.5
      estilo = `rgba(${hexRgb(f.cor)},${(apagado ? a * 0.35 : a).toFixed(2)})`
    }
    const g = grupos.get(estilo) ?? []
    g.push(plano.x[i]! * k, plano.y[i]! * k)
    grupos.set(estilo, g)
  }
  for (const [estilo, g] of grupos) {
    ctx.fillStyle = estilo
    ctx.beginPath()
    for (let j = 0; j < g.length; j += 2) { ctx.moveTo(g[j]! + r, g[j + 1]!); ctx.arc(g[j]!, g[j + 1]!, r, 0, Math.PI * 2) }
    ctx.fill()
  }
}

function medir() {
  const el = caixa.value
  const c = tela.value
  if (!el || !c) return
  const w = Math.round(el.clientWidth)
  if (!w || w === largura.value) return
  largura.value = w
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  c.width = w * dpr
  c.height = Math.round((w * MAPA_H) / MAPA_W) * dpr
  desenhar()
}

let ro: ResizeObserver | null = null
let io: IntersectionObserver | null = null
onMounted(() => {
  medir()
  ro = new ResizeObserver(medir)
  if (caixa.value) ro.observe(caixa.value)
  io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { entrou.value = true; io?.disconnect() } }, { threshold: 0.3 })
  if (caixa.value) io.observe(caixa.value)
})
onBeforeUnmount(() => { ro?.disconnect(); io?.disconnect() })
watch(() => [props.fatias, props.ativo], desenhar)
</script>

<template>
  <div ref="caixa" class="cmm" :class="{ 'cmm--entrou': entrou }">
    <canvas ref="tela" class="cmm__tela" aria-hidden="true" />
    <svg class="cmm__bolhas" :viewBox="`0 0 ${MAPA_W} ${MAPA_H}`" aria-hidden="true">
      <g
        v-for="b in bolhas" :key="b.f.chave"
        class="cmm__bolha" :class="{ 'cmm__bolha--apagada': ativo && ativo !== b.f.chave, 'cmm__bolha--ativa': ativo === b.f.chave }"
        :style="{ '--i': b.i, transformOrigin: `${b.x}px ${b.y}px` }"
        @pointerenter="emit('ativo', b.f.chave)" @pointerleave="emit('ativo', null)"
      >
        <circle :cx="b.x" :cy="b.y" :r="b.r" :fill="b.f.cor" fill-opacity="0.16" :stroke="b.f.cor" stroke-opacity="0.55" stroke-width="1.5" vector-effect="non-scaling-stroke" />
        <circle class="cmm__onda" :cx="b.x" :cy="b.y" :r="b.r" fill="none" :stroke="b.f.cor" stroke-width="1.5" vector-effect="non-scaling-stroke" />
        <circle :cx="b.x" :cy="b.y" r="4.5" :fill="b.f.cor" stroke="#fff" stroke-width="1.5" vector-effect="non-scaling-stroke" />
      </g>
    </svg>
    <!-- etiquetas em HTML (texto nítido, tamanho fixo em qualquer largura) -->
    <span
      v-for="b in etiquetas" :key="`e-${b.f.chave}`"
      class="cmm__etiqueta" :class="{ 'cmm__etiqueta--apagada': ativo && ativo !== b.f.chave, 'cmm__etiqueta--abaixo': b.y > MAPA_H / 2 }"
      :style="{ left: `${(b.x / MAPA_W) * 100}%`, top: `${((b.y > MAPA_H / 2 ? b.y + b.r : b.y - b.r) / MAPA_H) * 100}%`, '--i': b.i }"
      aria-hidden="true"
    ><strong>{{ b.f.nome }}</strong> {{ b.f.pctTxt }}</span>
  </div>
</template>

<style scoped>
.cmm { position: relative; width: 100%; aspect-ratio: 1000 / 436; }
.cmm__tela, .cmm__bolhas { position: absolute; inset: 0; width: 100%; height: 100%; }
.cmm__bolha { cursor: pointer; transition: opacity .25s; }
.cmm__bolha--apagada { opacity: .35; }
.cmm__onda { opacity: 0; }
/* as bolhas crescem uma vez quando a seção entra (a animação só embeleza:
   sem JS elas ficam no tamanho final) */
.cmm--entrou .cmm__bolha { animation: cmm-cresce 1s cubic-bezier(.2, .8, .2, 1) both; animation-delay: calc(var(--i) * 110ms); }
.cmm--entrou .cmm__onda { animation: cmm-onda 1.6s cubic-bezier(.2, .8, .2, 1) both; animation-delay: calc(var(--i) * 110ms + 700ms); }
.cmm__bolha--ativa .cmm__onda { animation: cmm-onda 1.2s cubic-bezier(.2, .8, .2, 1) both; }
@keyframes cmm-cresce { from { transform: scale(0); opacity: 0; } }
@keyframes cmm-onda { from { opacity: .7; transform: scale(1); } to { opacity: 0; transform: scale(1.5); } }
.cmm__onda { transform-box: fill-box; transform-origin: center; }
.cmm__etiqueta {
  position: absolute; transform: translate(-50%, calc(-100% - 6px)); pointer-events: none; white-space: nowrap;
  background: var(--nu-white); color: var(--nu-ink); border-radius: var(--nu-r-pill); padding: 5px 10px;
  font-size: var(--nu-fs-xs); font-weight: 600; font-variant-numeric: tabular-nums;
  box-shadow: 0 0 0 1px rgba(12, 21, 36, 0.07), 0 12px 28px -14px rgba(12, 21, 36, 0.35);
  transition: opacity .25s;
}
.cmm__etiqueta strong { font-weight: 800; }
/* no hemisfério sul a etiqueta desce: o Brasil não cobre os Estados Unidos */
.cmm__etiqueta--abaixo { transform: translate(-50%, 6px); }
.cmm__etiqueta--apagada { opacity: .4; }
.cmm--entrou .cmm__etiqueta { animation: cmm-etiqueta .5s cubic-bezier(.22, 1, .36, 1) both; animation-delay: calc(var(--i) * 110ms + 500ms); }
@keyframes cmm-etiqueta { from { opacity: 0; filter: blur(6px); } }
@media (prefers-reduced-motion: reduce) {
  .cmm--entrou .cmm__bolha, .cmm--entrou .cmm__onda, .cmm--entrou .cmm__etiqueta, .cmm__bolha--ativa .cmm__onda { animation: none; }
}
</style>

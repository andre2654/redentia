<script setup lang="ts">
// Variação 3 do "No mundo" (05/11/2026): os países pintados (choropleth
// simples: quanto mais dinheiro lá, mais forte a cor) e, embaixo, uma barra
// única empilhada com tudo, inclusive o que fica fora do mapa (cripto, ouro,
// sem dado). Os caminhos dos países (utils/mundoPaises.ts, ~44 KB) só são
// baixados quando esta variação aparece.
import type { FatiaMundo } from '~/utils/exposicaoNoMundo'
import { MAPA_H, MAPA_W, projetarPlano } from '~/utils/mundoPontos'

type FatiaCor = FatiaMundo & { cor: string }

const props = defineProps<{ fatias: FatiaCor[]; fora: FatiaCor[]; ativo: string | null; legenda?: FatiaCor[] }>()
const emit = defineEmits<{ (e: 'ativo', chave: string | null): void }>()

const caminhos = shallowRef<readonly (readonly [string, string])[]>([])
const caixa = ref<HTMLDivElement | null>(null)
const entrou = ref(false)

/** quem pinta cada país (país por cima de região) e com que força */
const tinta = computed(() => {
  const m = new Map<string, { f: FatiaCor; a: number }>()
  const max = Math.max(...props.fatias.map((f) => f.pct), 1)
  const ordem = [...props.fatias].sort((a, b) => Number(a.tipo === 'pais') - Number(b.tipo === 'pais'))
  for (const f of ordem) {
    // país mais forte que região (que é um conjunto); os dois crescem com o dinheiro
    const k = Math.sqrt(f.pct / max)
    const a = f.tipo === 'pais' ? 0.45 + 0.55 * k : 0.22 + 0.4 * k
    for (const id of f.paises) m.set(id, { f, a })
  }
  return m
})
const todos = computed(() => props.fatias.find((f) => f.todos) ?? null)

function estiloDe(id: string) {
  const t = tinta.value.get(id)
  const f = t?.f ?? todos.value
  if (!f) return { fill: 'var(--nu-cream-3)', opacity: 1 }
  const a = t ? t.a : 0.22
  const apagado = !!props.ativo && props.ativo !== f.chave
  return { fill: f.cor, opacity: apagado ? a * 0.3 : a }
}
function chaveDe(id: string) {
  return (tinta.value.get(id)?.f ?? todos.value)?.chave ?? null
}

/** país pequeno demais para ter caminho (Hong Kong, Luxemburgo): um ponto */
const marcos = computed(() => {
  const ids = new Set(caminhos.value.map(([id]) => id))
  return props.fatias
    .filter((f) => f.tipo === 'pais' && f.ancora && !f.paises.some((id) => ids.has(id)))
    .map((f) => { const [x, y] = projetarPlano(f.ancora![0], f.ancora![1]); return { f, x, y } })
})

/** a barra: tudo, na ordem (no mapa primeiro, depois o que fica fora) */
const barra = computed(() => [...props.fatias, ...props.fora])

let io: IntersectionObserver | null = null
onMounted(async () => {
  io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { entrou.value = true; io?.disconnect() } }, { threshold: 0.3 })
  if (caixa.value) io.observe(caixa.value)
  const m = await import('~/utils/mundoPaises')
  caminhos.value = m.PAISES_CAMINHOS
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <div ref="caixa" class="cmp" :class="{ 'cmp--entrou': entrou }">
    <svg class="cmp__mapa" :viewBox="`0 0 ${MAPA_W} ${MAPA_H}`" aria-hidden="true" @pointerleave="emit('ativo', null)">
      <path
        v-for="[id, d] in caminhos" :key="id" :d="d"
        class="cmp__pais" :class="{ 'cmp__pais--com': chaveDe(id) }"
        :style="estiloDe(id)"
        @pointerenter="emit('ativo', chaveDe(id))"
      />
      <g v-for="m in marcos" :key="m.f.chave" @pointerenter="emit('ativo', m.f.chave)">
        <circle :cx="m.x" :cy="m.y" r="9" :fill="m.f.cor" fill-opacity="0.2" />
        <circle :cx="m.x" :cy="m.y" r="4" :fill="m.f.cor" stroke="#fff" stroke-width="1.5" />
      </g>
    </svg>
    <NuSkeleton v-if="!caminhos.length" class="cmp__esq" width="100%" height="100%" radius="card" />

    <div class="cmp__barra" role="img" :aria-label="barra.map((f) => `${f.nome} ${f.pctTxt}`).join(', ')">
      <span
        v-for="(f, i) in barra" :key="f.chave"
        class="cmp__seg" :class="{ 'cmp__seg--sem': f.tipo === 'sem-dado', 'cmp__seg--apagado': ativo && ativo !== f.chave }"
        :style="{ width: `${Math.max(f.pct, 0.6)}%`, background: f.tipo === 'sem-dado' ? undefined : f.cor, '--i': i }"
        @pointerenter="emit('ativo', f.chave)" @pointerleave="emit('ativo', null)"
      />
    </div>
    <ul class="cmp__legenda">
      <li
        v-for="f in legenda ?? barra" :key="f.chave"
        class="cmp__item" :class="{ 'cmp__item--apagado': ativo && ativo !== f.chave }"
        @pointerenter="emit('ativo', f.chave)" @pointerleave="emit('ativo', null)"
      >
        <span class="cmp__ponto" :class="{ 'cmp__ponto--sem': f.tipo === 'sem-dado' }" :style="{ background: f.tipo === 'sem-dado' ? undefined : f.cor }" aria-hidden="true" />
        <span class="cmp__nome">{{ f.nome }}</span>
        <span class="cmp__pct">{{ f.pctTxt }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.cmp { position: relative; }
.cmp__mapa { display: block; width: 100%; aspect-ratio: 1000 / 436; }
.cmp__esq { position: absolute; inset: 0 0 auto 0; aspect-ratio: 1000 / 436; height: auto !important; }
.cmp__pais { stroke: var(--nu-white); stroke-width: 0.6; transition: opacity .25s, fill .25s; }
.cmp__pais--com { cursor: pointer; }
.cmp__barra { display: flex; gap: 3px; height: 14px; border-radius: var(--nu-r-pill); overflow: hidden; margin-top: clamp(22px, 3vw, 34px); }
.cmp__seg { height: 100%; min-width: 4px; transition: opacity .25s; cursor: pointer; transform-origin: left center; }
.cmp__seg--sem { background: repeating-linear-gradient(135deg, var(--nu-sand-3) 0 4px, var(--nu-cream-3) 4px 8px); }
.cmp__seg--apagado { opacity: .3; }
.cmp--entrou .cmp__seg { animation: cmp-seg .9s cubic-bezier(.2, .8, .2, 1) both; animation-delay: calc(var(--i) * 90ms); }
@keyframes cmp-seg { from { transform: scaleX(0); opacity: 0; } }
.cmp__legenda { list-style: none; margin: 16px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px 22px; }
.cmp__item { display: inline-flex; align-items: center; gap: 8px; cursor: default; transition: opacity .25s; font-size: var(--nu-fs-sm); }
.cmp__item--apagado { opacity: .4; }
.cmp__ponto { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.cmp__ponto--sem { background: repeating-linear-gradient(135deg, var(--nu-sand) 0 2px, var(--nu-cream-3) 2px 4px); }
.cmp__nome { color: var(--nu-gray-3); font-weight: 600; }
.cmp__pct { color: var(--nu-ink); font-weight: 800; font-variant-numeric: tabular-nums; }
@media (prefers-reduced-motion: reduce) {
  .cmp--entrou .cmp__seg { animation: none; }
}
</style>

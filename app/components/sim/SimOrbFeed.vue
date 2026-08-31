<script setup lang="ts">
// PROTÓTIPO /simulacao — passo 2: o orb "lê" o noticiário REAL da casa
// (GET /research/news via proxy — as mesmas takes do /noticias). Manchetes
// derivam uma a uma em direção ao orb e somem nele, transmitindo que a
// simulação considera o noticiário — sem ocupar layout, sem clique.
// Falhou o fetch → não renderiza nada (nunca manchete inventada).
interface TakeApi { title?: string; publishedAt?: string }

const items = ref<string[]>([])
const idx = ref(0)
const reduce = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  reduce.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  try {
    const res = await $fetch<{ data: TakeApi[] }>('/api/backend/research/news?limit=10')
    items.value = (res?.data ?? [])
      .map((t) => (t.title ?? '').trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.length > 88 ? `${t.slice(0, 85)}…` : t))
      .slice(0, 8)
  } catch {
    items.value = []
  }
  if (items.value.length > 1 && !reduce.value) {
    timer = setInterval(() => { idx.value = (idx.value + 1) % items.value.length }, 3400)
  }
})
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <div v-if="items.length" class="sof" aria-hidden="true">
    <div :key="idx" class="sof__slide" :class="{ 'sof__slide--static': reduce }">
      <span class="sof__eyebrow">No radar hoje</span>
      <p class="sof__line">{{ items[idx] }}</p>
    </div>
  </div>
</template>

<style scoped>
/* v2 (dono, 25/08): a manchete vive no CENTRO do orb — nasce, respira e se
   dissolve ali, sem deriva. Branco com sombra sutil pra atravessar as fases
   claras/escuras da esfera. */
.sof { display: flex; align-items: center; justify-content: center; pointer-events: none; }
.sof__slide {
  display: flex; flex-direction: column; align-items: center; gap: 7px;
  text-align: center;
  animation: sof-breathe 3.6s ease-in-out both;
}
.sof__slide--static { animation: none; }
.sof__eyebrow {
  color: var(--nu-white-75); font-size: 10px; font-weight: 800;
  letter-spacing: 0.12em; text-transform: uppercase;
}
.sof__line {
  margin: 0; color: var(--nu-white); font-size: 13.5px; font-weight: 700; line-height: 1.4;
  text-shadow: 0 1px 14px var(--nu-ink-30);
}
@keyframes sof-breathe {
  0% { opacity: 0; transform: scale(0.95); }
  14% { opacity: 1; transform: scale(1); }
  80% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.97); }
}
</style>

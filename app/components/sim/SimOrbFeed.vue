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
    <span class="sof__label">
      <i class="sof__dot" />
      lendo o noticiário de hoje
    </span>
    <p :key="idx" class="sof__line" :class="{ 'sof__line--static': reduce }">{{ items[idx] }}</p>
  </div>
</template>

<style scoped>
.sof { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; pointer-events: none; }
.sof__label {
  display: inline-flex; align-items: center; gap: 7px;
  color: var(--nu-gray); font-size: 11.5px; font-weight: 800;
  letter-spacing: 0.08em; text-transform: uppercase;
}
.sof__dot {
  width: 7px; height: 7px; border-radius: 50%; background: var(--nu-blue);
  animation: sof-pulse 1.6s ease-in-out infinite;
}
@keyframes sof-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
.sof__line {
  margin: 0; max-width: 100%;
  color: var(--nu-gray-2); font-size: 13.5px; font-weight: 600; line-height: 1.45;
  text-align: right;
  /* deriva em direção ao orb (baixo-direita) e some nele */
  animation: sof-drift 3.4s ease-in-out both;
}
.sof__line--static { animation: none; }
@keyframes sof-drift {
  0% { opacity: 0; transform: translate(-10px, -12px); }
  16% { opacity: 1; transform: translate(0, 0); }
  72% { opacity: 0.9; transform: translate(14px, 26px) scale(0.98); }
  100% { opacity: 0; transform: translate(34px, 58px) scale(0.92); }
}
</style>

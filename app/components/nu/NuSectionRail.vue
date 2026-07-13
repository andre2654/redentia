<script setup lang="ts">
// Banner contextual (PR-R6) — substitui a faixa "Mercado agora" nas telas que
// DECLARAM suas seções (via useSectionRail). Mesma vibe do NuMarketTicker:
// faixa creme, sticky logo abaixo do header (herda o shrink via --nuh-h),
// mesma altura/paddings, z-index igual. Pílulas clicáveis → scroll-to-section
// com scrollspy (pílula ativa em azul, como a nav ativa do header).
// Scroll horizontal se não couber (scrollbar oculto — padrão global do app).
const rail = useState<RailState | null>('nu:section-rail', () => null)
const sections = computed(() => rail.value?.sections ?? [])

const railEl = ref<HTMLElement | null>(null)
const active = ref(0)

// Scrollspy — MESMO padrão do NuTocSidebar (useNuScrollFrame rAF-throttled):
// ativa = última seção cujo topo passou da base da faixa sticky (header+rail).
useNuScrollFrame(() => {
  const list = sections.value
  if (!list.length) return
  const line = (railEl.value?.getBoundingClientRect().bottom ?? 120) + 12
  let idx = 0
  list.forEach((s, i) => {
    const el = document.getElementById(s.id)
    if (el && el.getBoundingClientRect().top <= line) idx = i
  })
  active.value = idx
})

function onPill(id: string, i: number) {
  active.value = i
  scrollToRailSection(id)
}
</script>

<template>
  <div ref="railEl" class="nsr-wrap">
    <nav class="nsr" aria-label="Seções da página">
      <button
        v-for="(s, i) in sections" :key="s.id" type="button"
        class="nsr__pill" :class="{ 'nsr__pill--active': active === i }"
        :aria-current="active === i ? 'true' : undefined"
        @click="onPill(s.id, i)"
      >{{ s.label }}</button>
    </nav>
  </div>
</template>

<style scoped>
.nsr-wrap {
  background: var(--nu-cream);
  /* MESMO mecanismo do NuMarketTicker: gruda abaixo do header sticky; --nuh-h
     vive no <html> (76px normal, 58px encolhido). Mesma altura → sem shift. */
  position: sticky; top: var(--nuh-h, 76px); z-index: 40;
  transition: top .28s ease;
}
.nsr {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 18px; overflow-x: auto; scrollbar-width: none;
}
.nsr__pill {
  flex-shrink: 0; border: none; background: transparent; cursor: pointer;
  padding: 8px 15px; border-radius: var(--nu-r-pill);
  color: var(--nu-gray-2); font-size: 14.5px; font-weight: 700; white-space: nowrap;
  font-family: inherit;
  transition: background .2s, color .2s;
}
.nsr__pill:hover { background: var(--nu-cream-hover); color: var(--nu-ink); }
.nsr__pill--active { color: var(--nu-blue); background: var(--nu-blue-tint); }
.nsr__pill--active:hover { color: var(--nu-blue); background: var(--nu-blue-tint); }
</style>

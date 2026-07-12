<script setup lang="ts">
// PR10 — steps educacionais 01-04 (ou 01-0N) com rail de progresso, do design
// das calculadoras: card branco radius 26 max-width 1080 centrado; número
// clamp(23px,2.2vw,29px) w800 largura 52; trilho 2px + fill azul 2.5px cuja
// altura acompanha o scroll (mesma fórmula do design, via useNuScrollFrame).
// Difere do NuStepsTimeline (card creme, escala menor, do guia) — aqui é a
// variante branca das calculadoras, com título h4 opcional por step pra
// preservar a semântica h4+p do conteúdo SEO antigo.
const props = defineProps<{ steps: { title?: string; html: string }[] }>()

const railRef = ref<HTMLElement | null>(null)
const fillHeight = ref(0)

useNuScrollFrame(() => {
  const c = railRef.value
  if (!c) return
  const r = c.getBoundingClientRect()
  const vh = window.innerHeight || 800
  const p = Math.max(0, Math.min(1, (vh * 0.78 - r.top) / (r.height || 1)))
  fillHeight.value = p * Math.max(0, c.clientHeight - 20)
})

const nums = computed(() => props.steps.map((_, i) => String(i + 1).padStart(2, '0')))
</script>

<template>
  <div class="cst">
    <div ref="railRef" class="cst__rail">
      <span class="cst__track" />
      <span class="cst__fill" :style="{ height: `${fillHeight.toFixed(1)}px` }" />
      <div v-for="(s, i) in steps" :key="i" class="cst__step">
        <span class="cst__num">{{ nums[i] }}</span>
        <span class="cst__body">
          <h4 v-if="s.title" class="cst__title">{{ s.title }}</h4>
          <!-- conteúdo local confiável (strong etc.) — eslint-disable-next-line vue/no-v-html -->
          <p class="cst__text" v-html="s.html" />
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cst {
  background: var(--nu-white);
  border-radius: var(--nu-r-card-lg);
  padding: clamp(26px, 4.5vw, 60px) clamp(22px, 5vw, 70px);
  max-width: 1080px;
  margin: 0 auto;
}
.cst__rail { position: relative; padding-left: clamp(20px, 3vw, 36px); }
.cst__track { position: absolute; left: 0; top: 10px; bottom: 10px; width: 2px; background: var(--nu-ink-10); }
.cst__fill {
  position: absolute; left: 0; top: 10px; height: 0; width: 2.5px;
  background: var(--nu-blue); transition: height .18s ease-out;
}
.cst__step { display: flex; align-items: flex-start; gap: clamp(22px, 4vw, 54px); padding: 16px 0; }
.cst__num {
  color: var(--nu-ink); font-size: clamp(23px, 2.2vw, 29px); font-weight: 800;
  width: 52px; flex-shrink: 0; font-variant-numeric: tabular-nums;
}
.cst__body { max-width: 840px; padding-top: 3px; }
.cst__title { margin: 0 0 4px; color: var(--nu-ink); font-size: 16.5px; font-weight: 800; }
.cst__text { margin: 0; color: var(--nu-gray-3); font-size: 16.5px; font-weight: 500; line-height: 1.65; }
.cst__text :deep(strong) { font-weight: 800; color: var(--nu-ink); }
</style>

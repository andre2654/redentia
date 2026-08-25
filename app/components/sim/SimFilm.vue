<script setup lang="ts">
// PROTÓTIPO /simulacao — o "filme" enquanto a simulação roda (padrão
// NuMarketReading: cadência por timer, transitions inline, reduced-motion).
// Teatro honesto: cobre a latência real (interpretação + motor) do plano.
const props = defineProps<{ steps: string[] }>()
const emit = defineEmits<{ done: [] }>()

const visible = ref(0)
let timers: ReturnType<typeof setTimeout>[] = []
onMounted(() => {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    visible.value = props.steps.length
    timers.push(setTimeout(() => emit('done'), 300))
    return
  }
  props.steps.forEach((_, i) => {
    timers.push(setTimeout(() => { visible.value = i + 1 }, 260 + i * 620))
  })
  timers.push(setTimeout(() => emit('done'), 260 + props.steps.length * 620 + 700))
})
onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <div class="sfm" role="status" aria-live="polite">
    <div class="sfm__stage">
      <SimOrb state="thinking" :size="170" />
      <span class="sfm__word" aria-label="Simulando">
        <i v-for="(l, i) in 'Simulando'.split('')" :key="i" class="sfm__letter" :style="{ animationDelay: `${i * 0.1}s` }">{{ l }}</i>
      </span>
    </div>
    <div class="sfm__steps">
      <div v-for="(s, i) in steps" :key="s" class="sfm__step" :class="{ 'sfm__step--on': i < visible }">
        <svg v-if="i < visible - 1 || visible === steps.length" class="sfm__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l5 5L20 7" /></svg>
        <span v-else class="sfm__spin" aria-hidden="true" />
        {{ s }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.sfm { display: flex; flex-direction: column; align-items: center; gap: 30px; padding: 64px 0 30px; }
.sfm__stage { position: relative; display: flex; align-items: center; justify-content: center; }
.sfm__word { position: absolute; display: inline-flex; }
.sfm__letter {
  color: var(--nu-cream-text); font-size: 17px; font-weight: 800; font-style: normal;
  letter-spacing: 0.02em;
  animation: sfm-letter 2s ease-in-out infinite;
  opacity: 0.4;
}
@keyframes sfm-letter {
  0%, 100% { opacity: 0.4; transform: translateY(0); }
  20% { opacity: 1; transform: scale(1.15); }
  40% { opacity: 0.7; transform: translateY(0); }
}
.sfm__steps { display: flex; flex-direction: column; gap: 13px; min-height: 132px; }
.sfm__step {
  display: inline-flex; align-items: center; gap: 10px;
  color: var(--nu-cream-text-78); font-size: 15.5px; font-weight: 600;
  opacity: 0; transform: translateY(8px);
  transition: opacity 0.45s ease, transform 0.45s ease;
}
.sfm__step--on { opacity: 1; transform: none; }
.sfm__check { color: var(--nu-green-soft); flex-shrink: 0; }
.sfm__spin {
  width: 13px; height: 13px; flex-shrink: 0; border-radius: 50%;
  border: 2px solid var(--nu-cream-text-12); border-top-color: var(--nu-blue-soft);
  animation: sfm-spin 0.8s linear infinite;
}
@keyframes sfm-spin { to { transform: rotate(360deg); } }
</style>

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
  <!-- v3: o orb saiu daqui — ele é o orb PERSISTENTE do wizard (a página o
       centraliza e põe "Simulando" dentro); este componente é só a cadência
       dos passos + o emit de fim -->
  <div class="sfm" role="status" aria-live="polite">
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
.sfm { display: flex; flex-direction: column; align-items: center; gap: 30px; }
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

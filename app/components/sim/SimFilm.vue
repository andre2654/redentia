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
        <span v-else class="sfm__pontos" aria-hidden="true"><i /><i /><i /></span>
        {{ s }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.sfm { display: flex; flex-direction: column; align-items: center; gap: 30px; }
.sfm__steps { display: flex; flex-direction: column; gap: 13px; min-height: 132px; }
.sfm__step {
  display: inline-flex; align-items: center; gap: 12px;
  color: var(--nu-on-dark); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto);
  opacity: 0; transform: translateY(8px);
  transition: opacity var(--nu-dur-lenta) var(--nu-ease-saida), transform var(--nu-dur-lenta) var(--nu-ease-saida);
}
.sfm__step--on { opacity: 1; transform: none; }
.sfm__check { width: 20px; color: var(--nu-green-soft); flex-shrink: 0; }
/* o passo em curso: os três pontos de "respondendo" da marca (nunca spinner) */
.sfm__pontos { display: inline-flex; justify-content: center; gap: 3px; width: 20px; flex-shrink: 0; color: var(--nu-blue-on-dark); }
.sfm__pontos i { width: 4px; height: 4px; border-radius: 50%; background: currentColor; animation: nu-ponto 1.2s infinite; }
.sfm__pontos i:nth-child(2) { animation-delay: .2s; }
.sfm__pontos i:nth-child(3) { animation-delay: .4s; }
</style>

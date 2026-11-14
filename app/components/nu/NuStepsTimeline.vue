<script setup lang="ts">
// Timeline vertical numerada (01, 02, …) dentro de card creme radius 24, com
// trilho cinza e fill azul cuja altura acompanha o scroll — fórmula exata do
// design: progresso = clamp((vh*0.78 - rect.top)/rect.height, 0, 1) *
// (clientHeight - 20). HTML dos passos é conteúdo local confiável (<strong>).
// APORTOU (11/11/2026): cartão creme da marca; os números vão em cobalto 800
// (os "passos numerados" do quadro) e o trilho é o fio de 1,5px.
const props = defineProps<{ steps: string[] }>()

const railRef = ref<HTMLElement | null>(null)
const fillHeight = ref(0)

useNuScrollFrame(() => {
  const c = railRef.value
  if (!c) return
  const r = c.getBoundingClientRect()
  const vh = window.innerHeight || 800
  const pr = Math.max(0, Math.min(1, (vh * 0.78 - r.top) / (r.height || 1)))
  fillHeight.value = pr * Math.max(0, c.clientHeight - 20)
})

const nums = computed(() => props.steps.map((_, i) => String(i + 1).padStart(2, '0')))
</script>

<template>
  <div class="nst">
    <div ref="railRef" class="nst__rail">
      <span class="nst__track" />
      <span class="nst__fill" :style="{ height: `${fillHeight.toFixed(1)}px` }" />
      <div v-for="(s, i) in steps" :key="i" class="nst__step">
        <span class="nst__num">{{ nums[i] }}</span>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span class="nst__text" v-html="s" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.nst { background: var(--nu-card); border-radius: var(--nu-r-card); padding: clamp(24px, 3vw, 40px); box-shadow: var(--nu-shadow-quente); }
.nst__rail { position: relative; padding-left: clamp(18px, 2.5vw, 30px); }
.nst__track {
  position: absolute; left: 0; top: 10px; bottom: 10px; width: 1.5px;
  background: var(--nu-line);
}
.nst__fill {
  position: absolute; left: -0.75px; top: 10px; height: 0; width: 3px; border-radius: 3px;
  background: var(--nu-blue); transition: height .18s ease-out;
}
.nst__step { display: flex; align-items: flex-start; gap: clamp(18px, 3vw, 38px); padding: 14px 0; }
.nst__num {
  color: var(--nu-blue); font-size: clamp(24px, 2.4vw, 32px); font-weight: var(--nu-w-forte); letter-spacing: -0.035em; line-height: 1.1;
  width: 48px; flex-shrink: 0; font-variant-numeric: tabular-nums;
}
.nst__text {
  color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500;
  line-height: 1.6; padding-top: 4px;
}
.nst__text :deep(strong) { font-weight: var(--nu-w-forte); }
</style>

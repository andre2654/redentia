<script setup lang="ts">
// A convicção dia a dia em degraus (as direções novas da /teses, 02/11/2026):
// a série real de /theses/{slug}/conviction-history, os últimos até 120 dias.
// Cada degrau é uma revalidação que mudou a nota; o ponto no fim é hoje.
// Linha em currentColor: quem usa escolhe a cor pela superfície.
import type { PontoDeConviccao } from '~/utils/tesesPainel'

const props = withDefaults(defineProps<{
  serie: PontoDeConviccao[]
  altura?: number
  /** a largura interna do desenho (o SVG estica até o contêiner) */
  largura?: number
}>(), { altura: 28, largura: 160 })

const desenho = computed(() => {
  const s = props.serie
  if (s.length < 2) return null
  const vs = s.map((p) => p.v)
  const lo = Math.min(...vs) - 2
  const hi = Math.max(...vs) + 2
  const W = props.largura
  const H = props.altura
  const pad = 3
  const x = (i: number) => (i / (s.length - 1)) * (W - pad * 2) + pad
  const y = (v: number) => H - pad - ((v - lo) / (hi - lo)) * (H - pad * 2)
  let d = `M${x(0).toFixed(1)} ${y(s[0]!.v).toFixed(1)}`
  for (let i = 1; i < s.length; i++) {
    if (s[i]!.v !== s[i - 1]!.v) d += `H${x(i).toFixed(1)}V${y(s[i]!.v).toFixed(1)}`
  }
  d += `H${x(s.length - 1).toFixed(1)}`
  return { d, fim: { x: x(s.length - 1), y: y(s[s.length - 1]!.v) } }
})
</script>

<template>
  <span v-if="desenho" class="tcl" :style="{ height: `${altura}px` }" aria-hidden="true">
    <svg class="tcl__svg" :viewBox="`0 0 ${largura} ${altura}`" preserveAspectRatio="none">
      <path :d="desenho.d" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
    </svg>
    <!-- o ponto fora do SVG: com o traço esticado, um círculo viraria elipse -->
    <span class="tcl__fim" :style="{ left: `${(desenho.fim.x / largura) * 100}%`, top: `${desenho.fim.y}px` }" />
  </span>
</template>

<style scoped>
.tcl { position: relative; display: block; width: 100%; }
.tcl__svg { display: block; width: 100%; height: 100%; overflow: visible; }
.tcl__fim {
  position: absolute; width: 6px; height: 6px; margin: -3px 0 0 -3px; border-radius: 50%;
  background: currentColor; box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 18%, transparent);
}
</style>

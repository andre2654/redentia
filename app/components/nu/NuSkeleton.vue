<script setup lang="ts">
/**
 * NuSkeleton — placeholder de carregamento com shimmer, no design system Nu.
 * Substitui os SEEDs falsos (dado de exemplo) enquanto o dado real carrega
 * client-side. Zero cor hardcoded (só var(--nu-*)); a keyframe nu-shimmer
 * congela sozinha em prefers-reduced-motion (regra global do base.css).
 *
 * Uso: <NuSkeleton variant="card" height="180px" />, ou multi-linha de texto
 * <NuSkeleton variant="text" :lines="3" last-width="55%" />. tone="navy" pra
 * skeletons sobre bandas escuras (charts, hero de tese).
 *
 * APORTOU (11/11/2026): o brilho foi recalibrado para ler sobre o creme da
 * página, o cartão creme e a faixa (base no fio leve, luz no cartão), e sobre o
 * carvão (base no fio escuro, luz no fio do chip). Nas telas de escritório
 * (.marca-redentia) valem as cores de antes.
 */
const props = withDefaults(defineProps<{
  variant?: 'text' | 'line' | 'block' | 'card' | 'tile' | 'pill' | 'circle' | 'bar'
  tone?: 'cream' | 'navy'
  width?: string
  height?: string
  radius?: 'pill' | 'card' | 'card-lg' | 'tile' | 'chip' | 'input' | string
  lines?: number
  lastWidth?: string
  animated?: boolean
  inline?: boolean
}>(), {
  variant: 'block',
  tone: 'cream',
  lines: 1,
  animated: true,
})

const RADII: Record<string, string> = {
  pill: 'var(--nu-r-pill)',
  card: 'var(--nu-r-card)',
  'card-lg': 'var(--nu-r-card-lg)',
  tile: 'var(--nu-r-tile)',
  chip: 'var(--nu-r-chip)',
  input: 'var(--nu-r-input)',
}

const baseStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.width) s.width = props.width
  // com altura passada, ela vale (o min-height do `block` inflava barras curtas)
  if (props.height) { s.height = props.height; s.minHeight = '0' }
  if (props.radius) s.borderRadius = RADII[props.radius] ?? props.radius
  return s
})

// text ou lines>1 → pilha de barras (última mais curta)
const multi = computed(() => props.variant === 'text' || (props.lines ?? 1) > 1)
const lineCount = computed(() => Math.max(1, props.lines ?? 1))
</script>

<template>
  <div v-if="multi" class="nusk-lines" aria-hidden="true">
    <span
      v-for="i in lineCount"
      :key="i"
      class="nusk nusk--line"
      :class="[`nusk--${tone}`, { 'nusk--still': animated === false }]"
      :style="i === lineCount && lineCount > 1 ? { ...baseStyle, width: lastWidth || '58%' } : baseStyle"
    />
  </div>
  <span
    v-else
    class="nusk"
    :class="[`nusk--${variant}`, `nusk--${tone}`, { 'nusk--still': animated === false, 'nusk--inline': inline }]"
    :style="baseStyle"
    aria-hidden="true"
  />
</template>

<style scoped>
.nusk {
  --sk-base: var(--nu-line-2); --sk-luz: var(--nu-card);
  display: block;
  background: linear-gradient(100deg, var(--sk-base) 25%, var(--sk-luz) 50%, var(--sk-base) 75%);
  background-size: 200% 100%;
  animation: nu-shimmer 1.5s ease-in-out infinite;
  border-radius: var(--nu-r-input);
}
.nusk--inline { display: inline-block; vertical-align: middle; }
.nusk--still { animation: none; }

/* tone escuro (bandas carvão: charts, hero de tese, seção IA) */
.nusk--navy { --sk-base: var(--nu-dark-line); --sk-luz: var(--nu-dark-chip-line); }
/* Redentia For Business: as cores de antes */
.marca-redentia .nusk { --sk-base: var(--nu-sand-2); --sk-luz: var(--nu-cream); }
.marca-redentia .nusk--navy { --sk-base: var(--nu-navy-2); --sk-luz: var(--nu-navy-3); }

/* formas (height/radius default; as props sobrescrevem) */
.nusk--line, .nusk--text { height: 0.82em; border-radius: var(--nu-r-chip); }
.nusk--block { min-height: 20px; border-radius: var(--nu-r-input); }
.nusk--card { height: 100%; border-radius: var(--nu-r-card); }
.nusk--tile { height: 100%; border-radius: var(--nu-r-tile); }
.nusk--pill { height: 28px; width: 72px; border-radius: var(--nu-r-pill); }
.nusk--circle { border-radius: 50%; aspect-ratio: 1; }
.nusk--bar { height: 10px; border-radius: var(--nu-r-pill); }

.nusk-lines { display: flex; flex-direction: column; gap: 9px; width: 100%; }
.nusk-lines .nusk { width: 100%; }
</style>

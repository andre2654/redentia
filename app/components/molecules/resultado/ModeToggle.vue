<!--
  MoleculesResultadoModeToggle — switch entre Carteira e Day Trade.

  Vive no canto superior direito da pagina /wallet/resultado. Tecnicamente
  e um <AtomsSegmented> (componente oficial da identidade quiet) com 2
  options + icones. Empilha por cima um detalhe extra: quando o modo e
  'day-trade', ganha um pulse sutil amber pra reforcar que esta no
  "modo operacional".

  Props/emits:
    - mode: ResultMode atual (controlled — pai dispara setMode)
    - @update:mode: emit quando user troca

  Por que componente proprio em vez de usar AtomsSegmented direto na
  pagina: queremos espaco pra polish visual especifico (pulse, ring),
  e essa toggle especificamente tende a evoluir conforme a feature
  amadurece (badges "live", indicador de mercado aberto, etc).
-->
<template>
  <div class="result-toggle relative inline-flex items-center gap-2">
    <span
      class="hidden text-[11px] font-medium uppercase md:inline"
      :style="{
        color: `color-mix(in srgb, var(--brand-text) 50%, transparent)`,
        letterSpacing: '0.16em',
      }"
    >Modo</span>
    <div
      class="result-toggle__shell"
      :class="{ 'result-toggle__shell--active-day': mode === 'day-trade' }"
    >
      <AtomsSegmented
        :model-value="mode"
        :options="options"
        size="md"
        as="tabs"
        aria-label="Alternar entre modo carteira e day trade"
        @update:model-value="$emit('update:mode', $event as ResultMode)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResultMode } from '~/composables/useResultMode'

defineProps<{
  mode: ResultMode
}>()

defineEmits<{
  (e: 'update:mode', mode: ResultMode): void
}>()

const brand = useBrand()

// Day Trade ainda nao disponivel — desabilitado com badge "Em breve".
// Quando a feature ficar pronta, basta remover `disabled` e `badge`.
const options = [
  { value: 'carteira' as const, label: 'Carteira', icon: 'i-lucide-pie-chart' },
  {
    value: 'day-trade' as const,
    label: 'Day Trade',
    icon: 'i-lucide-zap',
    disabled: true,
    badge: 'Em breve',
  },
]
</script>

<style scoped>
.result-toggle__shell {
  position: relative;
  border-radius: 8px;
  transition: box-shadow 240ms ease;
}

/* Quando o modo Day Trade esta ativo, o shell ao redor do segmented
   ganha um glow amber discreto. Rein torna a regiao do toggle
   "viva" — o user percebe imediatamente que esta num modo diferente
   sem precisar ler. */
.result-toggle__shell--active-day {
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--brand-primary) 40%, transparent),
    0 4px 18px -8px color-mix(in srgb, var(--brand-primary) 50%, transparent);
}

.result-toggle__shell--active-day::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 11px;
  background: radial-gradient(
    circle at center,
    color-mix(in srgb, var(--brand-primary) 16%, transparent) 0%,
    transparent 70%
  );
  opacity: 0;
  animation: result-toggle-pulse 2.4s ease-in-out infinite;
  pointer-events: none;
  z-index: -1;
}

@keyframes result-toggle-pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.04); }
}

@media (prefers-reduced-motion: reduce) {
  .result-toggle__shell--active-day::before {
    animation: none;
    opacity: 0.5;
  }
  .result-toggle__shell {
    transition: none;
  }
}
</style>

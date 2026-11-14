<script setup lang="ts">
// Card de estatística: número hero 800 tabular-nums + label muted, sobre
// creme radius 20. Valores exatos do design (Redentia Guia Open Finance).
// O grid (auto-fit minmax(170px,1fr)) vive no consumidor.
import type { GuideStat } from '~/types/guias'

defineProps<{ stat: GuideStat }>()
// o cartão como contexto do chat: o rótulo leva o sujeito da página
// (proverSobreDoContexto), "P/L PETR4"
const sobre = useSobreDoContexto()
</script>

<template>
  <div v-contexto-chat="{ id: `numero:${sobre}:${stat.label}`, tipo: 'grafico', rotulo: rotuloComSobre(stat.label, sobre), texto: `${stat.label}: ${stat.value}` }" class="nsc">
    <div class="nsc__value">{{ stat.value }}</div>
    <div class="nsc__label">{{ stat.label }}</div>
  </div>
</template>

<style scoped>
.nsc { background: var(--nu-card); border-radius: var(--nu-r-panel); padding: 22px; box-shadow: var(--nu-shadow-quente); }
.nsc__value {
  color: var(--nu-ink); font-size: clamp(26px, 2.4vw, 34px); font-weight: var(--nu-w-forte);
  letter-spacing: -0.035em; line-height: 1; font-variant-numeric: tabular-nums;
}
.nsc__label { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 600; margin-top: 10px; }
</style>

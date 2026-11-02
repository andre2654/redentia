<script setup lang="ts">
// Card de métrica fundamentalista (design Acoes Nu): bg creme radius 22,
// label cinza 14px, valor clamp(26-32px) 800 tabular, NuTagPill semântica.
// Hover lift -2px.
import type { AcaoMetricCard } from '~/types/acao'

const props = defineProps<{ card: AcaoMetricCard }>()
// o cartão como contexto do chat: o rótulo leva o sujeito da página
// (proverSobreDoContexto), "P/L PETR4"
const sobre = useSobreDoContexto()
const contexto = computed(() => ({
  id: `metrica:${sobre.value}:${props.card.label}`,
  tipo: 'grafico',
  rotulo: rotuloComSobre(props.card.label, sobre.value),
  texto: [`${props.card.label}${sobre.value ? ` (${sobre.value})` : ''}: ${props.card.value}`, props.card.tag?.text].filter(Boolean).join('\n'),
}))
</script>

<template>
  <div v-contexto-chat="contexto" class="nmc">
    <div class="nmc__label">{{ card.label }}</div>
    <div class="nmc__value">{{ card.value }}</div>
    <NuTagPill v-if="card.tag" :tag="card.tag" block />
  </div>
</template>

<style scoped>
.nmc {
  background: var(--nu-cream); border-radius: var(--nu-r-panel); padding: 24px;
  transition: transform .15s;
}
.nmc:hover { transform: translateY(-2px); }
.nmc__label { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 700; }
.nmc__value {
  color: var(--nu-ink); font-size: clamp(26px, 2.2vw, 32px); font-weight: 800;
  letter-spacing: -1px; line-height: 1; margin-top: 12px; font-variant-numeric: tabular-nums;
}
</style>

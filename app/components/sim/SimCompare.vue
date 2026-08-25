<script setup lang="ts">
// PROTÓTIPO /simulacao — comparação A vs B, v2 (dono 25/08: o card-painel
// "não agradou"): vira UMA linha editorial sob a legenda, sem card — a
// proposta contada em frase, números em bold (amber = a cor da linha B),
// ações como links discretos. O aviso de capital vira meia dúzia de
// palavras dentro da própria frase.
import type { SimResult } from './simMock'
import { fmtBRL } from './simMock'

const props = defineProps<{ a: SimResult; b: SimResult }>()
const emit = defineEmits<{ clear: []; edit: [] }>()

const fmtPct = (v: number) => `${v > 0 ? '+' : ''}${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`

const valeA = computed(() => props.a.shockSummary?.totalPct ?? 0)
const valeB = computed(() => props.b.shockSummary?.totalPct ?? 0)
const anchorDiff = computed(() => Math.abs(props.a.assumptions.anchor - props.b.assumptions.anchor) / props.a.assumptions.anchor > 0.01)
</script>

<template>
  <p class="scp">
    <i class="scp__dot" aria-hidden="true" />
    <span class="scp__txt">
      A proposta faz o vale ir de {{ fmtPct(valeA) }} a <b>{{ fmtPct(valeB) }}</b>
      e a mediana em 10 anos, de {{ fmtBRL(a.final.p50) }} a <b class="scp__b">{{ fmtBRL(b.final.p50) }}</b><template v-if="anchorDiff"> — partindo de <b>{{ fmtBRL(b.assumptions.anchor) }}</b>, não de {{ fmtBRL(a.assumptions.anchor) }}</template>.
    </span>
    <span class="scp__acts">
      <button type="button" class="scp__act" @click="emit('edit')">editar</button>
      <button type="button" class="scp__act" @click="emit('clear')">descartar</button>
    </span>
  </p>
</template>

<style scoped>
.scp {
  margin: 14px 0 0; display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
  animation: nu-fade 0.4s ease both;
}
.scp__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--nu-amber); align-self: center; flex-shrink: 0; }
.scp__txt { color: var(--nu-cream-text-70); font-size: 14.5px; font-weight: 600; line-height: 1.6; }
.scp__txt b { color: var(--nu-cream-text); font-weight: 800; font-variant-numeric: tabular-nums; }
.scp__txt .scp__b { color: var(--nu-amber); }
.scp__acts { display: inline-flex; gap: 14px; margin-left: 4px; }
.scp__act {
  border: none; background: transparent; padding: 0;
  color: var(--nu-cream-text-55); font-size: 13px; font-weight: 800;
  cursor: pointer; font-family: inherit;
  text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--nu-cream-text-22);
  transition: color 0.15s;
}
.scp__act:hover { color: var(--nu-cream-text); }
</style>

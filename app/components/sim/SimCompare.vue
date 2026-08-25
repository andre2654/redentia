<script setup lang="ts">
// PROTÓTIPO /simulacao — comparação A vs B, v3 (iterações do dono, 25/08:
// card-painel "não agradou", frase editorial "não ficou claro"). Agora é um
// PLACAR: duas colunas simétricas, cada uma na COR da sua curva no gráfico
// (azul = sua carteira, âmbar = proposta), mediana como número grande e o
// delta como badge — o formato universal de comparação.
import type { SimResult } from './simMock'
import { fmtBRL } from './simMock'

const props = defineProps<{ a: SimResult; b: SimResult }>()
const emit = defineEmits<{ clear: []; edit: [] }>()

const fmtPct = (v: number) => `${v > 0 ? '+' : ''}${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`

const valeA = computed(() => props.a.shockSummary?.totalPct ?? 0)
const valeB = computed(() => props.b.shockSummary?.totalPct ?? 0)
const delta = computed(() => props.b.final.p50 - props.a.final.p50)
const anchorDiff = computed(() => Math.abs(props.a.assumptions.anchor - props.b.assumptions.anchor) / props.a.assumptions.anchor > 0.01)
</script>

<template>
  <div class="scp">
    <div class="scp__col">
      <div class="scp__head">
        <i class="scp__dot scp__dot--a" aria-hidden="true" />
        <span class="scp__name">Sua carteira</span>
      </div>
      <b class="scp__big">{{ fmtBRL(a.final.p50) }}</b>
      <span class="scp__sub">em 10 anos, mediana · vale {{ fmtPct(valeA) }}</span>
    </div>

    <div class="scp__col scp__col--b">
      <div class="scp__head">
        <i class="scp__dot scp__dot--b" aria-hidden="true" />
        <span class="scp__name">Proposta</span>
        <span class="scp__acts">
          <button type="button" class="scp__act" @click="emit('edit')">editar</button>
          <button type="button" class="scp__act" @click="emit('clear')">descartar</button>
        </span>
      </div>
      <b class="scp__big scp__big--b">
        {{ fmtBRL(b.final.p50) }}
        <em class="scp__delta" :class="delta < 0 ? 'scp__delta--down' : 'scp__delta--up'">{{ delta > 0 ? '+' : '−' }}{{ fmtBRL(Math.abs(delta)) }}</em>
      </b>
      <span class="scp__sub">em 10 anos, mediana · vale {{ fmtPct(valeB) }}<template v-if="anchorDiff"> · parte de {{ fmtBRL(b.assumptions.anchor) }}</template></span>
    </div>
  </div>
</template>

<style scoped>
.scp {
  margin-top: 18px;
  display: grid; grid-template-columns: 1fr 1fr;
  background: var(--nu-navy-2); border-radius: var(--nu-r-panel);
  animation: nu-fade 0.4s ease both;
}
.scp__col { padding: 20px 26px 18px; display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.scp__col--b { border-left: 1px solid var(--nu-cream-text-12); }

.scp__head { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }
.scp__dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.scp__dot--a { background: var(--nu-blue-soft); }
.scp__dot--b { background: var(--nu-amber); }
.scp__name { color: var(--nu-cream-text-70); font-size: 12.5px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }

.scp__big {
  color: var(--nu-cream-text); font-size: clamp(24px, 2.6vw, 32px); font-weight: 800;
  letter-spacing: -0.03em; font-variant-numeric: tabular-nums; line-height: 1.1;
  display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
}
.scp__big--b { color: var(--nu-amber); }
.scp__delta { font-size: 13.5px; font-weight: 800; font-style: normal; letter-spacing: 0; }
.scp__delta--down { color: var(--nu-red-soft); }
.scp__delta--up { color: var(--nu-green-soft); }
.scp__sub { color: var(--nu-cream-text-55); font-size: 12.5px; font-weight: 600; font-variant-numeric: tabular-nums; }

.scp__acts { margin-left: auto; display: inline-flex; gap: 12px; }
.scp__act {
  border: none; background: transparent; padding: 0;
  color: var(--nu-cream-text-55); font-size: 12px; font-weight: 800;
  cursor: pointer; font-family: inherit;
  text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--nu-cream-text-22);
  transition: color 0.15s;
}
.scp__act:hover { color: var(--nu-cream-text); }

@media (max-width: 700px) {
  .scp { grid-template-columns: 1fr; }
  .scp__col--b { border-left: none; border-top: 1px solid var(--nu-cream-text-12); }
}
</style>

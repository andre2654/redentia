<script setup lang="ts">
// PROTÓTIPO /simulacao — what-if de realocação (gap nº4, 25/08): o painel de
// deltas carteira ATUAL vs PROPOSTA no MESMO cenário. v1 pra o dono testar
// no preview — densidade/posição iteram em cima.
import type { SimResult } from './simMock'
import { fmtBRL } from './simMock'

const props = defineProps<{ a: SimResult; b: SimResult }>()
const emit = defineEmits<{ clear: []; edit: [] }>()

const fmtPct = (v: number) => `${v > 0 ? '+' : ''}${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`

const valeA = computed(() => props.a.shockSummary?.totalPct ?? 0)
const valeB = computed(() => props.b.shockSummary?.totalPct ?? 0)
const deltaFinal = computed(() => props.b.final.p50 - props.a.final.p50)
/** capital diferente entre A e B = comparação de maçã com laranja — avisa
 * (a mesma classe de erro de base que a badge de IR combate) */
const anchorGap = computed(() => {
  const a = props.a.assumptions.anchor
  const b = props.b.assumptions.anchor
  return Math.abs(a - b) / a > 0.01 ? { a, b } : null
})

/** a posição cuja sensibilidade mais muda entre as duas carteiras */
const biggestChange = computed(() => {
  const mapA = new Map(props.a.positions.map((p) => [p.ticker, p]))
  const mapB = new Map(props.b.positions.map((p) => [p.ticker, p]))
  const tickers = new Set([...mapA.keys(), ...mapB.keys()])
  let best: { ticker: string; from: string; to: string; diff: number } | null = null
  for (const t of tickers) {
    const ia = mapA.get(t)
    const ib = mapB.get(t)
    const ca = ia ? ia.weight * ia.shockPct : 0
    const cb = ib ? ib.weight * ib.shockPct : 0
    const diff = Math.abs(cb - ca)
    if (!best || diff > best.diff) {
      best = {
        ticker: t,
        from: ia ? fmtPct(ia.shockPct) : 'fora',
        to: ib ? fmtPct(ib.shockPct) : 'fora',
        diff,
      }
    }
  }
  return best
})
</script>

<template>
  <div class="scp">
    <div class="scp__cell">
      <span class="scp__label">No vale</span>
      <span class="scp__vals">
        <b :class="valeA < 0 ? 'scp__down' : 'scp__up'">{{ fmtPct(valeA) }}</b>
        <i class="scp__arrow" aria-hidden="true">→</i>
        <b class="scp__b" :class="valeB < 0 ? 'scp__down' : 'scp__up'">{{ fmtPct(valeB) }}</b>
      </span>
    </div>
    <div class="scp__cell">
      <span class="scp__label">Mediana em 10 anos</span>
      <span class="scp__vals">
        <b>{{ fmtBRL(a.final.p50) }}</b>
        <i class="scp__arrow" aria-hidden="true">→</i>
        <b class="scp__b">{{ fmtBRL(b.final.p50) }}</b>
        <em class="scp__delta" :class="deltaFinal < 0 ? 'scp__down' : 'scp__up'">{{ deltaFinal > 0 ? '+' : '−' }}{{ fmtBRL(Math.abs(deltaFinal)) }}</em>
      </span>
    </div>
    <div v-if="biggestChange" class="scp__cell">
      <span class="scp__label">Maior mudança</span>
      <span class="scp__vals">
        <b>{{ biggestChange.ticker }}</b>
        <em class="scp__change">{{ biggestChange.from }} <i class="scp__arrow" aria-hidden="true">→</i> {{ biggestChange.to }}</em>
      </span>
    </div>
    <div class="scp__actions">
      <button type="button" class="scp__btn" @click="emit('edit')">Editar proposta</button>
      <button type="button" class="scp__btn scp__btn--ghost" @click="emit('clear')">Descartar</button>
    </div>
    <p v-if="anchorGap" class="scp__note">
      A proposta parte de {{ fmtBRL(anchorGap.b) }} (a atual, de {{ fmtBRL(anchorGap.a) }}) —
      os valores absolutos refletem também a diferença de capital.
    </p>
  </div>
</template>

<style scoped>
.scp {
  margin-top: 18px;
  display: flex; align-items: center; gap: 14px 36px; flex-wrap: wrap;
  background: var(--nu-navy-2); border-radius: var(--nu-r-panel);
  padding: 18px 24px;
  animation: nu-fade 0.4s ease both;
}
.scp__cell { display: flex; flex-direction: column; gap: 4px; }
.scp__label { color: var(--nu-cream-text-55); font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.scp__vals { display: flex; align-items: baseline; gap: 8px; color: var(--nu-cream-text); font-size: 17px; font-weight: 800; font-variant-numeric: tabular-nums; }
.scp__b { color: var(--nu-amber); }
.scp__arrow { color: var(--nu-cream-text-45); font-style: normal; font-size: 13px; }
.scp__delta { font-size: 13px; font-weight: 800; font-style: normal; }
.scp__change { color: var(--nu-cream-text-70); font-size: 13.5px; font-weight: 700; font-style: normal; }
.scp__down { color: var(--nu-red-soft); }
.scp__up { color: var(--nu-green-soft); }
.scp__actions { margin-left: auto; display: flex; gap: 8px; }
.scp__btn {
  border: 1.5px solid var(--nu-cream-text-22); border-radius: var(--nu-r-pill);
  background: transparent; color: var(--nu-cream-text);
  padding: 9px 16px; font-size: 12.5px; font-weight: 800; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s, background 0.15s;
}
.scp__btn:hover { border-color: var(--nu-cream-text-45); background: var(--nu-cream-text-12); }
.scp__btn--ghost { color: var(--nu-cream-text-55); }
.scp__note { flex-basis: 100%; margin: 2px 0 0; color: var(--nu-cream-text-55); font-size: 12px; font-weight: 600; }
</style>

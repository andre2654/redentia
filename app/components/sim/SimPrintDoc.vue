<script setup lang="ts">
// PROTÓTIPO /simulacao — o DOCUMENTO de 1 página do "Gerar PDF" (gap nº5).
// Vive escondido na tela e só aparece no @media print (o CSS global da página
// esconde todo o resto): logo, data, manchete, faixa, o SVG do fan chart
// (imprime nativo), tabela de posições e o disclaimer. window.print() é do pai.
import type { SimResult, SimClientSummary } from './simMock'
import { fmtBRL, fmtBRLFull } from './simMock'

const props = defineProps<{
  result: SimResult
  summary: SimClientSummary
  /** aviso de premissa vencida (curva DI > 90 dias) — o PDF não pode sair sem ele */
  driftWarning?: string | null
}>()

const hoje = new Date().toLocaleDateString('pt-BR')
const fmtPct = (v: number) => `${v > 0 ? '+' : ''}${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
const sorted = computed(() => [...props.result.positions].sort((a, b) => a.shockPct - b.shockPct))

// mini fan chart do documento (SVG leve, mesmas séries)
const W = 720
const H = 210
const domain = computed(() => {
  const lo = Math.min(...props.result.series.p10)
  const hi = Math.max(...props.result.series.p90)
  const span = hi - lo || 1
  return { lo: lo - span * 0.05, hi: hi + span * 0.07 }
})
function Y(v: number): number {
  const { lo, hi } = domain.value
  return 8 + ((hi - v) / (hi - lo)) * (H - 16)
}
function X(i: number): number {
  return (i / (props.result.series.p50.length - 1)) * W
}
function line(arr: number[]): string {
  let d = ''
  arr.forEach((v, i) => { d += `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}` })
  return d
}
const bandPath = computed(() => {
  const up = props.result.series.p90
  const dn = props.result.series.p10
  let d = ''
  up.forEach((v, i) => { d += `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}` })
  for (let i = dn.length - 1; i >= 0; i--) d += `L${X(i).toFixed(1)},${Y(dn[i]!).toFixed(1)}`
  return d + 'Z'
})
</script>

<template>
  <div class="spd" aria-hidden="true">
    <div class="spd__head">
      <img src="/logo-azul.svg" alt="" class="spd__logo">
      <div class="spd__head-txt">
        <b>Redentia Simulação</b>
        <span>protótipo · {{ hoje }}</span>
      </div>
    </div>

    <h1 class="spd__title">{{ result.scenario.title }}</h1>
    <p class="spd__lead">
      Carteira de {{ fmtBRLFull(result.assumptions.anchor) }} simulada por 10 anos:
      mediana em <b>{{ fmtBRL(result.final.p50) }}</b>, faixa entre
      <b>{{ fmtBRL(result.final.p10) }}</b> (pessimista) e <b>{{ fmtBRL(result.final.p90) }}</b> (otimista).
      <template v-if="result.shockSummary">
        No curto prazo, o cenário custaria {{ fmtPct(result.shockSummary.totalPct) }} no vale,
        com recuperação estimada em ~{{ result.shockSummary.recoveryMonths }} meses.
      </template>
    </p>

    <p v-if="driftWarning" class="spd__stale">{{ driftWarning }}</p>

    <svg class="spd__chart" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none">
      <path :d="bandPath" fill="var(--nu-blue-soft)" opacity="0.3" />
      <path :d="line(result.series.p50)" fill="none" stroke="var(--nu-blue)" stroke-width="2.2" />
    </svg>
    <div class="spd__chart-legend">faixa p10–p90 · mediana</div>

    <table class="spd__table">
      <thead>
        <tr><th>Posição</th><th>Peso</th><th>Choque</th><th>Carrego/ano</th><th>Tributação</th></tr>
      </thead>
      <tbody>
        <tr v-for="p in sorted" :key="p.ticker">
          <td><b>{{ p.ticker }}</b> {{ p.name }}</td>
          <td>{{ Math.round(p.weight * 100) }}%</td>
          <td :class="p.shockPct < 0 ? 'spd__down' : p.shockPct > 0 ? 'spd__up' : ''">{{ p.shockPct === 0 ? '—' : fmtPct(p.shockPct) }}</td>
          <td>{{ p.carryPct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) }}%</td>
          <td>{{ p.taxLabel }}</td>
        </tr>
      </tbody>
    </table>

    <p class="spd__disclaimer">{{ summary.footer }}</p>
  </div>
</template>

<style scoped>
/* invisível na tela; o @media print da página revela SÓ este documento */
.spd { display: none; }

@media print {
  .spd {
    display: block;
    color: var(--nu-ink); background: var(--nu-white);
    font-family: var(--nu-font);
    padding: 8mm 4mm;
  }
  .spd__head { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
  .spd__logo { width: 30px; height: 30px; }
  .spd__head-txt { display: flex; flex-direction: column; line-height: 1.25; }
  .spd__head-txt b { font-size: 14px; font-weight: 800; }
  .spd__head-txt span { font-size: 11px; color: var(--nu-gray); font-weight: 600; }
  .spd__title { margin: 0 0 8px; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
  .spd__lead { margin: 0 0 14px; font-size: 13px; line-height: 1.55; color: var(--nu-gray-3); max-width: 640px; }
  .spd__lead b { font-weight: 800; }
  .spd__chart { width: 100%; height: 170px; }
  .spd__stale {
  margin: 0 0 10px; padding: 8px 12px;
  background: var(--nu-amber-bg); color: var(--nu-amber-text);
  border-radius: 6px; font-size: 11px; font-weight: 700;
}
.spd__chart-legend { margin: 4px 0 16px; font-size: 10px; color: var(--nu-gray); font-weight: 600; }
  .spd__table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  .spd__table th {
    text-align: left; padding: 6px 8px; border-bottom: 1.5px solid var(--nu-ink);
    font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;
  }
  .spd__table td { padding: 6px 8px; border-bottom: 1px solid var(--nu-sand-2); }
  .spd__table td b { font-weight: 800; margin-right: 6px; }
  .spd__down { color: var(--nu-red); font-weight: 800; }
  .spd__up { color: var(--nu-green); font-weight: 800; }
  .spd__disclaimer { margin-top: 16px; font-size: 9.5px; color: var(--nu-gray); line-height: 1.5; }
}
</style>

<script setup lang="ts">
// PROTÓTIPO /simulacao — faixas anuais p10–p90 (a alternativa HONESTA ao
// heatmap mensal simulado): cada ano é um range vertical com a mediana
// marcada. Percentis por ano são estatística real do cone; mês a mês seria
// ruído com cara de dado.
import type { SimAnnual } from './simMock'
import { fmtBRL } from './simMock'

const props = defineProps<{ annual: SimAnnual[]; active: boolean }>()
const domain = computed(() => {
  const lo = Math.min(...props.annual.map((a) => a.p10))
  const hi = Math.max(...props.annual.map((a) => a.p90))
  return { lo: lo * 0.96, hi: hi * 1.04 }
})
function pct(v: number): number {
  const { lo, hi } = domain.value
  return ((v - lo) / (hi - lo)) * 100
}
const fmt = fmtBRL
</script>

<template>
  <div class="sab">
    <div class="sab__grid">
      <div
        v-for="(a, i) in annual" :key="a.year"
        class="sab__col" :class="{ 'sab__col--in': active }" :style="{ transitionDelay: `${i * 55}ms` }"
      >
        <div class="sab__range" :title="`${a.year}: ${fmt(a.p10)} a ${fmt(a.p90)}`">
          <div
            class="sab__band"
            :style="{ bottom: `${pct(a.p10)}%`, height: `${pct(a.p90) - pct(a.p10)}%` }"
          >
            <i class="sab__mid" :style="{ bottom: `${((a.p50 - a.p10) / (a.p90 - a.p10)) * 100}%` }" />
          </div>
        </div>
        <span class="sab__year">{{ String(a.year).slice(2) }}</span>
      </div>
    </div>
    <div class="sab__legend">
      <span><i class="sab__dot sab__dot--band" />faixa pessimista–otimista (p10–p90)</span>
      <span><i class="sab__dot sab__dot--mid" />mediana</span>
    </div>
  </div>
</template>

<style scoped>
.sab__grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: clamp(10px, 1.6vw, 22px); height: 280px; align-items: end; }
.sab__col { display: flex; flex-direction: column; align-items: center; gap: 10px; height: 100%; opacity: 0; transform: translateY(12px); transition: opacity 0.5s ease, transform 0.5s ease; }
.sab__col--in { opacity: 1; transform: none; }
.sab__range { position: relative; width: 100%; max-width: 88px; flex: 1; background: var(--nu-white); border-radius: 16px; overflow: hidden; }
.sab__band { position: absolute; left: 9px; right: 9px; border-radius: 999px; background: var(--nu-blue-tint); }
.sab__mid { position: absolute; left: 0; right: 0; height: 4.5px; border-radius: 999px; background: var(--nu-blue); }
.sab__year { color: var(--nu-gray); font-size: 13.5px; font-weight: 800; font-variant-numeric: tabular-nums; }
.sab__legend { margin-top: 16px; display: flex; gap: 22px; flex-wrap: wrap; color: var(--nu-gray); font-size: 12.5px; font-weight: 600; }
.sab__legend span { display: inline-flex; align-items: center; gap: 7px; }
.sab__dot { width: 12px; height: 12px; border-radius: 4px; }
.sab__dot--band { background: var(--nu-blue-tint); }
.sab__dot--mid { background: var(--nu-blue); }
</style>

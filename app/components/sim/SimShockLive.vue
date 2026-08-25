<script setup lang="ts">
// PROTÓTIPO /simulacao — a consequência ao vivo do choque, versão muda
// (simplificação do dono, 25/08: sem frases — só o número e as barras).
import type { SimPositionImpact } from './simMock'

const props = defineProps<{ total: number; positions: SimPositionImpact[]; hasShock: boolean }>()

const top3 = computed(() =>
  [...props.positions].sort((a, b) => Math.abs(b.shockPct) - Math.abs(a.shockPct)).slice(0, 3).filter((p) => p.shockPct !== 0),
)
const maxAbs = computed(() => Math.max(6, ...top3.value.map((p) => Math.abs(p.shockPct))))
const fmtPct = (v: number) => `${v > 0 ? '+' : ''}${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
</script>

<template>
  <div class="ssl">
    <span class="ssl__label">Efeito na carteira</span>
    <span v-if="hasShock" class="ssl__value" :class="total < 0 ? 'ssl__val--down' : 'ssl__val--up'">{{ fmtPct(total) }}</span>
    <span v-else class="ssl__value ssl__val--flat">0%</span>

    <div v-if="top3.length" class="ssl__list">
      <div v-for="p in top3" :key="p.ticker" class="ssl__row">
        <span class="ssl__ticker">{{ p.ticker }}</span>
        <span class="ssl__track">
          <i :class="p.shockPct < 0 ? 'ssl__fill--down' : 'ssl__fill--up'" :style="{ width: `${(Math.abs(p.shockPct) / maxAbs) * 100}%` }" />
        </span>
        <span class="ssl__pct" :class="p.shockPct < 0 ? 'ssl__val--down' : 'ssl__val--up'">{{ fmtPct(p.shockPct) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ssl {
  display: flex; flex-direction: column; gap: 6px;
  background: var(--nu-cream); border-radius: var(--nu-r-panel);
  padding: clamp(20px, 2.4vw, 28px);
}
.ssl__label { color: var(--nu-gray); font-size: 11.5px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
.ssl__value {
  font-size: clamp(38px, 4.4vw, 58px); font-weight: 800; letter-spacing: -0.04em;
  line-height: 1; font-variant-numeric: tabular-nums;
  transition: color 0.3s ease;
}
.ssl__val--down { color: var(--nu-red); }
.ssl__val--up { color: var(--nu-green); }
.ssl__val--flat { color: var(--nu-sand); }

.ssl__list { margin-top: 16px; display: flex; flex-direction: column; gap: 9px; }
.ssl__row { display: grid; grid-template-columns: 64px 1fr 58px; gap: 10px; align-items: center; }
.ssl__ticker { color: var(--nu-ink); font-size: 13px; font-weight: 800; }
.ssl__track { position: relative; height: 9px; border-radius: 999px; background: var(--nu-cream-3); overflow: hidden; }
.ssl__track i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 999px; transition: width 0.35s cubic-bezier(0.22, 0.61, 0.36, 1); display: block; }
.ssl__fill--down { background: var(--nu-red); }
.ssl__fill--up { background: var(--nu-green); }
.ssl__pct { text-align: right; font-size: 13px; font-weight: 800; font-variant-numeric: tabular-nums; }
</style>

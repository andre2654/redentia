<script setup lang="ts">
// PROTÓTIPO /simulacao — "quem sangra, quem segura", v2 (feedback do dono
// 24/08: largura inteira + estilo Redentia). Vocabulário da casa: card creme
// sobre banda branca, pill de ticker colorida por direção (padrão dos badges
// de notícia), barra de magnitude no track, número 800 tabular à direita, e
// o efeito agregado como stat de abertura. Stagger de entrada por delay CSS.
import type { SimPositionImpact } from './simMock'

const props = defineProps<{ positions: SimPositionImpact[]; active: boolean }>()

const maxAbs = computed(() => Math.max(8, ...props.positions.map((p) => Math.abs(p.shockPct))))
const sorted = computed(() => [...props.positions].sort((a, b) => a.shockPct - b.shockPct))
/** efeito do choque na carteira inteira: Σ peso × impacto */
const total = computed(() => props.positions.reduce((acc, p) => acc + p.weight * p.shockPct, 0))
const isFlat = computed(() => props.positions.every((p) => p.shockPct === 0))

function dir(p: number): 'down' | 'up' | 'flat' {
  return p < 0 ? 'down' : p > 0 ? 'up' : 'flat'
}
const fmtPct = (v: number) => `${v > 0 ? '+' : ''}${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
</script>

<template>
  <div class="spi">
    <!-- o número-herói do bloco: quanto o choque tira (ou põe) na carteira -->
    <div class="spi__hero" :class="{ 'spi__hero--in': active }">
      <template v-if="!isFlat">
        <span class="spi__hero-label">Efeito do choque na carteira, no vale</span>
        <span class="spi__hero-value" :class="total < 0 ? 'spi__val--down' : 'spi__val--up'">{{ fmtPct(total) }}</span>
      </template>
      <template v-else>
        <span class="spi__hero-label">Cenário base — sem choque</span>
        <span class="spi__hero-value spi__val--flat">as posições seguem o mercado</span>
      </template>
    </div>

    <div class="spi__list">
      <div
        v-for="(p, i) in sorted" :key="p.ticker"
        class="spi__card" :class="{ 'spi__card--in': active }"
        :style="{ transitionDelay: `${i * 60}ms` }"
      >
        <span class="spi__pill" :class="`spi__pill--${dir(p.shockPct)}`">{{ p.ticker }}</span>
        <span class="spi__who">
          <b class="spi__name">{{ p.name }}</b>
          <em class="spi__weight">{{ Math.round(p.weight * 100) }}% da carteira</em>
        </span>
        <span class="spi__track">
          <i
            class="spi__fill" :class="`spi__fill--${dir(p.shockPct)}`"
            :style="{ width: active ? `${(Math.abs(p.shockPct) / maxAbs) * 100}%` : '0%', transitionDelay: `${120 + i * 60}ms` }"
          />
        </span>
        <span class="spi__pct" :class="`spi__val--${dir(p.shockPct)}`">{{ p.shockPct === 0 ? '—' : fmtPct(p.shockPct) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* stat de abertura */
.spi__hero {
  display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap;
  margin-bottom: 26px;
  opacity: 0; transform: translateY(10px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.spi__hero--in { opacity: 1; transform: none; }
.spi__hero-label { color: var(--nu-gray); font-size: 13px; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase; }
.spi__hero-value { font-size: clamp(30px, 3.6vw, 46px); font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.spi__val--down { color: var(--nu-red); }
.spi__val--up { color: var(--nu-green); }
.spi__val--flat { color: var(--nu-gray-2); font-size: clamp(20px, 2.4vw, 28px); }

/* lista em cards creme, largura inteira */
.spi__list { display: flex; flex-direction: column; gap: 10px; }
.spi__card {
  display: grid; grid-template-columns: 108px minmax(180px, 0.9fr) 2fr 92px;
  gap: 18px; align-items: center;
  background: var(--nu-cream); border-radius: var(--nu-r-tile);
  padding: 15px 22px;
  opacity: 0; transform: translateY(12px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.spi__card--in { opacity: 1; transform: none; }

.spi__pill {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 8px 0; border-radius: var(--nu-r-chip);
  font-size: 14px; font-weight: 800; letter-spacing: 0.01em;
}
.spi__pill--down { background: var(--nu-red-tint); color: var(--nu-red-2); }
.spi__pill--up { background: var(--nu-green-bg); color: var(--nu-green-2); }
.spi__pill--flat { background: var(--nu-sand-2); color: var(--nu-gray-2); }

.spi__who { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.spi__name { color: var(--nu-ink); font-size: 15px; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.spi__weight { color: var(--nu-gray); font-size: 12.5px; font-weight: 600; font-style: normal; font-variant-numeric: tabular-nums; }

.spi__track { position: relative; height: 12px; border-radius: 999px; background: var(--nu-cream-3); overflow: hidden; }
.spi__fill {
  position: absolute; left: 0; top: 0; bottom: 0; border-radius: 999px;
  transition: width 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.spi__fill--down { background: var(--nu-red); }
.spi__fill--up { background: var(--nu-green); }
.spi__fill--flat { background: var(--nu-sand); }

.spi__pct { text-align: right; font-size: 19px; font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; white-space: nowrap; }

@media (max-width: 760px) {
  .spi__card { grid-template-columns: 84px 1fr 74px; padding: 13px 15px; gap: 12px; }
  .spi__track { grid-column: 1 / -1; order: 4; }
  .spi__pct { font-size: 16.5px; }
}
</style>

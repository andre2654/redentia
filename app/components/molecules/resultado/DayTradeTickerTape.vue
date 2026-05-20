<!--
  MoleculesResultadoDayTradeTickerTape — fita de operacoes em loop.

  Strip horizontal com os ultimos N trades scrollando da direita pra
  esquerda, igual o ticker tape de uma corretora. Cada item:
    HH:MM:SS · TICKER · L · ±R$ valor

  Cor por sinal (verde/vermelho/muted), monospace dominante. Animation
  CSS-only com `transform: translateX` em loop infinito. Pra evitar
  "salto" no fim do loop, duplicamos a lista de itens (o trick classic
  de marquee infinito).

  Pausa no hover pra usuario poder ler. Reduz motion automatic
  via prefers-reduced-motion.
-->
<template>
  <div v-if="trades.length > 0" class="dt-tape" :style="containerStyle">
    <span class="dt-tape__label" :style="{ color: 'var(--brand-primary)' }">
      <span class="dt-tape__live-dot" :style="{ backgroundColor: 'var(--brand-primary)' }" />
      TAPE
    </span>
    <div class="dt-tape__viewport">
      <div class="dt-tape__track">
        <!-- Lista duplicada pra criar loop continuo sem salto. As
             duas copias compartilham o mesmo CSS animation. -->
        <span
          v-for="(t, idx) in tapeItems"
          :key="`tape-${idx}`"
          class="dt-tape__item"
        >
          <span class="dt-tape__time tabular-nums" :style="{ color: `color-mix(in srgb, var(--brand-text) 55%, transparent)` }">
            {{ formatTime(t.closedAt!) }}
          </span>
          <span class="dt-tape__ticker tabular-nums" :style="{ color: 'var(--brand-text)' }">
            {{ t.ticker }}
          </span>
          <span
            class="dt-tape__side"
            :style="{ color: (t.resultAmount ?? 0) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)' }"
          >L</span>
          <span
            class="dt-tape__amount tabular-nums"
            :style="{ color: amountColorFor(t.resultAmount) }"
          >{{ formatAmount(t.resultAmount) }}</span>
          <span class="dt-tape__sep" :style="{ color: `color-mix(in srgb, var(--brand-text) 18%, transparent)` }">·</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MockTrade } from '~/composables/useMockTrades'

const props = defineProps<{
  trades: MockTrade[]
}>()

const brand = useBrand()
const { brl } = useFormat()

// Top 16 trades mais recentes pra fita. Numero impar evitaria
// pacote-pares simetricos visualmente, mas 16 e o sweet spot
// em width tipica desktop (chega a fechar 100% sem repeticao).
const TAPE_LIMIT = 16

const tapeItems = computed(() => {
  const sorted = [...props.trades]
    .filter((t) => t.closedAt != null)
    .sort((a, b) => new Date(b.closedAt!).getTime() - new Date(a.closedAt!).getTime())
    .slice(0, TAPE_LIMIT)
  // Duplicamos pra animar marquee infinito sem salto
  return [...sorted, ...sorted]
})

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatAmount(v: number | null): string {
  if (v == null) return '—'
  const sign = v > 0 ? '+' : v < 0 ? '−' : ''
  return `${sign}${brl(Math.abs(v))}`
}

function amountColorFor(v: number | null): string {
  if (v == null || v === 0) return `color-mix(in srgb, var(--brand-text) 65%, transparent)`
  return v > 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'
}

const containerStyle = computed(() => ({
  backgroundColor: 'var(--brand-surface)',
  borderColor: `color-mix(in srgb, var(--brand-border) 55%, transparent)`,
}))
</script>

<style scoped>
.dt-tape {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 10px;
  border: 1px solid;
  padding: 8px 14px;
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  overflow: hidden;
  position: relative;
}

.dt-tape__label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding-right: 10px;
  border-right: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
}

.dt-tape__live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: dt-tape-pulse 1.4s ease-in-out infinite;
}

@keyframes dt-tape-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

.dt-tape__viewport {
  flex: 1 1 auto;
  overflow: hidden;
  position: relative;
  /* Mascara nas pontas pra fade-out — registro mais "tape" e menos
     lista cortada. */
  mask-image: linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 6%, #000 94%, transparent 100%);
}

.dt-tape__track {
  display: flex;
  align-items: center;
  gap: 0;
  white-space: nowrap;
  animation: dt-tape-scroll 60s linear infinite;
  width: max-content;
}

.dt-tape__viewport:hover .dt-tape__track {
  animation-play-state: paused;
}

@keyframes dt-tape-scroll {
  from { transform: translateX(0); }
  /* -50% porque duplicamos a lista — quando o scroll passa pelo
     ponto medio, a segunda copia ja se posicionou exatamente onde
     a primeira estava, criando ilusao de loop continuo sem salto. */
  to { transform: translateX(-50%); }
}

.dt-tape__item {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 0 12px;
  font-size: 11.5px;
  letter-spacing: 0.02em;
}

.dt-tape__time {
  font-size: 10.5px;
  font-weight: 500;
}

.dt-tape__ticker {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.dt-tape__side {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 1px 4px;
  border-radius: 3px;
  border: 1px solid currentColor;
  line-height: 1;
}

.dt-tape__amount {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: -0.005em;
}

.dt-tape__sep {
  font-size: 11px;
  user-select: none;
  margin-left: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .dt-tape__track {
    animation: none;
  }
  .dt-tape__live-dot {
    animation: none;
    opacity: 1;
  }
}
</style>

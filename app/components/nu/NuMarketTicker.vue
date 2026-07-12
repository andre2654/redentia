<script setup lang="ts">
// Faixa "Mercado agora" — presente em todas as telas dos designs.
// Dados via useMarketTicker (seed do design → hidrata real, nunca quebra).
// Ajustes do dono do design (2026-07-11): a faixa é STICKY no topo ao rolar,
// e as cotações giram num marquee contínuo e lento (pausa no hover;
// prefers-reduced-motion desliga). Loop sem emenda: o track duplica os itens
// e anima -50% da própria largura.
const { items } = useMarketTicker()
</script>

<template>
  <div class="nut-wrap">
    <div class="nut">
      <span class="nut__label">Mercado agora</span>
      <div class="nut__marquee">
        <div class="nut__track">
          <div v-for="half in 2" :key="half" class="nut__group" :aria-hidden="half === 2 || undefined">
            <span v-for="t in items" :key="`${half}-${t.n}`" class="nut__item">
              <span class="nut__name">{{ t.n }}</span>
              <span class="nut__value">{{ t.v }}</span>
              <span v-if="t.pct" class="nut__pct" :class="t.dir === 'down' ? 'nut__pct--down' : 'nut__pct--up'">{{ t.pct }}</span>
            </span>
          </div>
        </div>
      </div>
      <span class="nut__note" data-nu-hide>B3 · dados com atraso de 15 min</span>
    </div>
  </div>
</template>

<style scoped>
.nut-wrap {
  background: var(--nu-cream);
  /* gruda ABAIXO do header sticky (UX do dono 2026-07-11): --nuh-h vive no
     <html>, setada pelo NuHeader (76px normal, 58px encolhido). */
  position: sticky; top: var(--nuh-h, 76px); z-index: 40;
  transition: top .28s ease;
}
.nut { display: flex; align-items: center; gap: 26px; padding: 14px 22px; }
.nut__label { color: var(--nu-ink); font-size: 15px; font-weight: 800; white-space: nowrap; flex-shrink: 0; }
.nut__marquee { flex: 1; min-width: 0; overflow: hidden; }
.nut__track { display: inline-flex; width: max-content; animation: nut-scroll 55s linear infinite; }
.nut__marquee:hover .nut__track { animation-play-state: paused; }
.nut__group { display: inline-flex; align-items: center; gap: 26px; padding-right: 26px; }
@keyframes nut-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.nut__item { display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; }
.nut__name { color: var(--nu-gray); font-size: 13.5px; font-weight: 700; white-space: nowrap; }
.nut__value { color: var(--nu-ink); font-size: 14px; font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
.nut__pct { font-size: 13.5px; font-weight: 700; white-space: nowrap; font-variant-numeric: tabular-nums; }
.nut__pct--up { color: var(--nu-green); }
.nut__pct--down { color: var(--nu-red); }
.nut__note { color: var(--nu-gray); font-size: 12.5px; white-space: nowrap; flex-shrink: 0; }

@media (prefers-reduced-motion: reduce) {
  .nut__track { animation: none; }
}
</style>

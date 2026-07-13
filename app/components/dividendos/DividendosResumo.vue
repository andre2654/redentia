<script setup lang="ts">
// Resumo dos últimos 12 meses (/dividendos/[ticker]): banda branca 2 colunas
// na anatomia da seção de dividendos do /asset (AcaoDividends), esquerda com
// h2 + subtítulo + NuStatList light, direita com NuDividendBars (reuso).
// Aqui NÃO tem pill de posição (landing 100% pública) e o CTA aponta pra
// calculadora de dividend yield com deep-link do ticker.
import type { AcaoDividendBar, AcaoStatRow } from '~/types/acao'

defineProps<{
  ticker: string
  isFii: boolean
  heading: [string, string]
  subtitle: string
  rows: AcaoStatRow[]
  bars: AcaoDividendBar[]
}>()
</script>

<template>
  <section class="dvr">
    <div class="dvr__cols">
      <div class="dvr__left">
        <h2 class="dvr__title">{{ heading[0] }}<br>{{ heading[1] }}</h2>
        <div class="dvr__sub">{{ subtitle }}</div>
        <div class="dvr__stats">
          <NuStatList :rows="rows" />
        </div>
        <div class="dvr__cta-row">
          <NuxtLink :to="`/calculadora/dividend-yield?ticker=${ticker}`" class="dvr__cta">Calcular o DY de {{ ticker }}</NuxtLink>
        </div>
      </div>
      <div class="dvr__right">
        <NuDividendBars
          :bars="bars"
          :footnote="`${isFii ? 'Rendimentos' : 'Dividendos + JCP'} por ${isFii ? 'cota' : 'ação'}, por ano · ${bars[bars.length - 1]?.year ?? ''} considera os últimos 12 meses`"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.dvr {
  background: var(--nu-white);
  padding: clamp(60px, 8vw, 104px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.dvr__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.dvr__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.dvr__title {
  margin: 0; color: var(--nu-ink); font-size: clamp(38px, 4.8vw, 62px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1.02;
}
.dvr__sub { color: var(--nu-gray); font-size: 17px; font-weight: 600; line-height: 1.5; margin-top: 22px; }
.dvr__stats { margin-top: 26px; }
.dvr__cta-row { margin-top: 28px; }
.dvr__cta {
  display: inline-flex; align-items: center; gap: 10px; background: transparent; color: var(--nu-blue);
  border: 2px solid var(--nu-blue); border-radius: var(--nu-r-pill); padding: 14px 26px;
  font-size: 16px; font-weight: 700; transition: background .2s;
}
.dvr__cta:hover { background: var(--nu-blue-tint-2); color: var(--nu-blue); }
.dvr__right { flex: 1.6 1 460px; min-width: min(320px, 100%); }
</style>

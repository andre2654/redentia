<script setup lang="ts">
// "Avaliação por ativo" (design): fundo branco, h2 + meta da revalidação,
// grid auto-fit minmax(min(380px,100%),1fr) de cards creme — NuTickerTile lg
// + ticker/nome (cross-link pra /asset/{ticker}) + NuBadge de status + texto
// da avaliação + rodapé 'POR QUÊ'. Card 'Entra' ganha border 2.5px azul.
import type { TeseEvalVM } from '~/types/tese'

defineProps<{ evalSection: TeseEvalVM }>()

// /asset só existe pra tickers B3 (PETR4, CATP34, E1TN34…) — formato validado
// pelo middleware da página de ativo; fora do formato, sem link.
const TICKER_RE = /^[A-Z][A-Z0-9]{3}\d{1,2}$/
function hrefFor(ticker: string): string | null {
  return TICKER_RE.test(ticker) ? `/asset/${ticker}` : null
}
</script>

<template>
  <section class="tev">
    <div class="tev__head">
      <NuSectionHeading>Avaliação<br>por ativo.</NuSectionHeading>
      <span class="tev__meta">{{ evalSection.metaLine }}</span>
    </div>
    <div class="tev__grid">
      <article v-for="c in evalSection.cards" :key="c.ticker" class="tev__card" :class="{ 'tev__card--hi': c.highlight }">
        <div class="tev__card-head">
          <NuxtLink v-if="hrefFor(c.ticker)" :to="hrefFor(c.ticker)!" class="tev__id tev__id--link">
            <NuTickerTile :letter="c.letter" :bg="c.tileBg" :fg="c.tileFg" size="lg" />
            <span class="tev__names">
              <span class="tev__ticker">{{ c.ticker }}</span>
              <span class="tev__name">{{ c.name }}</span>
            </span>
          </NuxtLink>
          <span v-else class="tev__id">
            <NuTickerTile :letter="c.letter" :bg="c.tileBg" :fg="c.tileFg" size="lg" />
            <span class="tev__names">
              <span class="tev__ticker">{{ c.ticker }}</span>
              <span class="tev__name">{{ c.name }}</span>
            </span>
          </span>
          <NuBadge :variant="c.badgeVariant" size="eval">{{ c.badgeText }}</NuBadge>
        </div>
        <div class="tev__txt">{{ c.txt }}</div>
        <div v-if="c.pq" class="tev__why">
          <span class="tev__why-lbl">Por quê</span>
          <span class="tev__why-txt">{{ c.pq }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.tev {
  background: var(--nu-white);
  padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px);
  animation: nu-fade .5s ease both;
}
.tev__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
.tev__meta { color: var(--nu-gray); font-size: 16px; font-weight: 600; }
.tev__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(380px, 100%), 1fr));
  gap: 16px; margin-top: 40px;
}
.tev__card { background: var(--nu-cream); border-radius: var(--nu-r-card); padding: 26px; }
.tev__card--hi { border: 2.5px solid var(--nu-blue); }
.tev__card-head { display: flex; align-items: center; gap: 14px; }
.tev__id { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
.tev__names { flex: 1; min-width: 0; }
.tev__ticker { display: block; color: var(--nu-ink); font-size: 19px; font-weight: 800; white-space: nowrap; transition: color .2s; }
.tev__id--link:hover .tev__ticker { color: var(--nu-blue); }
.tev__name {
  display: block; color: var(--nu-gray); font-size: 13.5px; font-weight: 600;
  margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tev__txt { color: var(--nu-gray-2); font-size: 14.5px; font-weight: 500; line-height: 1.6; margin-top: 16px; }
.tev__why { display: flex; gap: 10px; border-top: 1.5px solid var(--nu-cream-2); margin-top: 16px; padding-top: 14px; }
.tev__why-lbl {
  color: var(--nu-blue); font-size: 11.5px; font-weight: 800; letter-spacing: 1px;
  text-transform: uppercase; flex-shrink: 0; margin-top: 2px;
}
.tev__why-txt { color: var(--nu-gray); font-size: 13.5px; font-weight: 600; line-height: 1.55; }
</style>

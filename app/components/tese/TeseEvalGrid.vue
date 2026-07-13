<script setup lang="ts">
// "Avaliação por ativo" (design + refino do dono 2026-07-13): fundo branco,
// h2 + meta da revalidação, grid de cards creme — logo REAL da empresa
// (NuAssetLogo, brapi + fallback de letra) + ticker/nome + NuBadge de status
// + texto + rodapé 'POR QUÊ'. O CARD INTEIRO é o link pro /asset/{ticker},
// com o botão azul de seta (padrão dos movers) sinalizando o clique.
// Card 'Entra' ganha border 2.5px azul.
import { NuxtLink } from '#components'
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
      <!-- card inteiro clicável quando o ticker tem página; a seta azul
           (padrão dos movers) sinaliza o destino -->
      <component
        :is="hrefFor(c.ticker) ? NuxtLink : 'article'"
        v-for="c in evalSection.cards" :key="c.ticker"
        :to="hrefFor(c.ticker) ?? undefined"
        class="tev__card"
        :class="{ 'tev__card--hi': c.highlight, 'tev__card--link': hrefFor(c.ticker) }"
      >
        <div class="tev__card-head">
          <span class="tev__id">
            <NuAssetLogo :ticker="c.ticker" :letter="c.letter" :tile-bg="c.tileBg" :tile-fg="c.tileFg" :size="52" :radius="16" />
            <span class="tev__names">
              <span class="tev__ticker">{{ c.ticker }}</span>
              <span class="tev__name">{{ c.name }}</span>
            </span>
          </span>
          <NuBadge :variant="c.badgeVariant" size="eval">{{ c.badgeText }}</NuBadge>
          <span v-if="hrefFor(c.ticker)" class="tev__go" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </span>
        </div>
        <div class="tev__txt">{{ c.txt }}</div>
        <div v-if="c.pq" class="tev__why">
          <span class="tev__why-lbl">Por quê</span>
          <span class="tev__why-txt">{{ c.pq }}</span>
        </div>
      </component>
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
.tev__card { display: block; background: var(--nu-cream); border-radius: var(--nu-r-card); padding: 26px; }
.tev__card--hi { border: 2.5px solid var(--nu-blue); }
.tev__card--link { transition: transform .15s, box-shadow .2s; }
.tev__card--link:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.tev__card--link:hover .tev__ticker { color: var(--nu-blue); }
.tev__card--link:hover .tev__go { background: var(--nu-blue-hover); }
.tev__card-head { display: flex; align-items: center; gap: 14px; }
.tev__id { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
.tev__names { flex: 1; min-width: 0; }
.tev__ticker { display: block; color: var(--nu-ink); font-size: 19px; font-weight: 800; white-space: nowrap; transition: color .2s; }
/* botão azul da Redentia: o card leva pra tela do ativo */
.tev__go {
  width: 30px; height: 30px; flex-shrink: 0; border-radius: 50%; background: var(--nu-blue);
  display: flex; align-items: center; justify-content: center; transition: background .16s;
}
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

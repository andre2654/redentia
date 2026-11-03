<script setup lang="ts">
// Fim das direções novas do /benchmark-ia: as dúvidas no FAQ da casa, no
// mesmo bloco da /teses (faixa creme, título 500, a chamada para a Redentia AI),
// e o aviso legal. O id "metodologia" é o destino do "Como medimos" do topo e
// do último item da faixa de seções.
import { BENCH_DISCLAIMER } from '~/content/benchmark-ia/metodologia'
import type { NuFaqItem } from '~/types/market'

defineProps<{ faq: NuFaqItem[] }>()
</script>

<template>
  <section id="metodologia" class="bdu" aria-labelledby="bdu-titulo">
    <div class="bdu__cols">
      <div class="bdu__left">
        <h2 id="bdu-titulo" class="bdu__titulo">Ficou com alguma<br>dúvida?</h2>
        <p class="bdu__copy">Como o ranking é feito, o que ele mede e o que ele não diz.</p>
        <NuxtLink to="/busca" class="bdu__cta">Perguntar à Redentia AI</NuxtLink>
      </div>
      <div class="bdu__right">
        <NuFaqAccordion :items="faq" :default-open="-1" surface="white" />
      </div>
    </div>
    <p class="bdu__aviso">{{ BENCH_DISCLAIMER }}</p>
  </section>
</template>

<style scoped>
.bdu {
  scroll-margin-top: calc(var(--nuh-h, 76px) + 46px);
  background: var(--nu-cream); padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px) clamp(40px, 5vw, 64px);
}
.bdu__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.bdu__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.bdu__titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 500; letter-spacing: -0.045em; line-height: 1.02; }
.bdu__copy { margin: 22px 0 0; max-width: 420px; color: var(--nu-gray-2); font-size: var(--nu-fs-lg); font-weight: 500; line-height: 1.6; }
.bdu__cta {
  display: inline-flex; align-items: center; height: 44px; padding: 0 22px; margin-top: 28px;
  border-radius: var(--nu-r-pill); box-shadow: inset 0 0 0 1px var(--nu-ink-16);
  color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; transition: background .2s, box-shadow .2s;
}
.bdu__cta:hover { background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-ink-30); color: var(--nu-ink); }
.bdu__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.bdu__right { flex: 1.6 1 480px; min-width: min(340px, 100%); }
.bdu__aviso {
  margin: clamp(40px, 5vw, 56px) 0 0; padding-top: 24px; border-top: 1px solid var(--nu-cream-line); max-width: 90ch;
  color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; line-height: 1.6;
}
</style>

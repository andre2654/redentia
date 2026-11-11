<script setup lang="ts">
// Fim do /benchmark-ia "A noite": as dúvidas no FAQ da casa, no
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
        <NuEyebrow como="p">Como medimos</NuEyebrow>
        <h2 id="bdu-titulo" class="bdu__titulo">Ficou com alguma<br>dúvida?</h2>
        <p class="bdu__copy">Como o ranking é feito, o que ele mede e o que ele não diz.</p>
        <NuBotaoSeta to="/busca" variante="carvao" tamanho="m" class="bdu__cta">Perguntar à IA</NuBotaoSeta>
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
  background: var(--nu-band); padding: clamp(64px, 7vw, 100px) max(clamp(22px, 5.5vw, 80px), calc((100% - 1240px) / 2)) clamp(40px, 5vw, 64px);
}
.bdu__cols { display: flex; gap: clamp(28px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.bdu__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.bdu__titulo { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.03em; line-height: 1.02; }
.bdu__copy { margin: 20px 0 0; max-width: 420px; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; }
.bdu__cta { margin-top: 28px; }
.bdu__right { flex: 1.6 1 480px; min-width: min(340px, 100%); }
.bdu__aviso {
  margin: clamp(40px, 5vw, 56px) 0 0; padding-top: 24px; border-top: 1.5px solid var(--nu-line); max-width: 90ch;
  color: var(--nu-gray); font-size: 13.5px; font-weight: 500; line-height: 1.5;
}
</style>

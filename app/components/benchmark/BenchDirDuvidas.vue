<script setup lang="ts">
// Fim do /benchmark-ia "A noite": as dúvidas no FAQ da casa, no
// mesmo bloco da /teses (faixa creme, título 500, a chamada para a Redentia AI),
// e o aviso legal. O id "metodologia" é o destino do "Como medimos" do topo e
// do último item da faixa de seções.
import { BENCH_DISCLAIMER } from '~/content/benchmark-ia/metodologia'
import type { NuFaqItem } from '~/types/market'

defineProps<{ faq: NuFaqItem[] }>()

// "Perguntar à IA" abre o painel do chat aqui mesmo (11/11/2026): a pergunta
// mora no painel desde 02/11, e a /busca não é mais onde se conversa.
const painel = useChatPainel()
</script>

<template>
  <section id="metodologia" class="bdu" aria-labelledby="bdu-titulo">
    <div v-revelar class="bdu__cols">
      <div class="bdu__left">
        <NuEyebrow como="p">Como medimos</NuEyebrow>
        <h2 id="bdu-titulo" class="bdu__titulo">Ficou com alguma<br>dúvida?</h2>
        <p class="bdu__copy">Como o ranking é feito, o que ele mede e o que ele não diz.</p>
        <NuBotaoSeta variante="carvao" tamanho="m" class="bdu__cta" @click="painel.abrir()">Perguntar à IA</NuBotaoSeta>
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
  background: var(--nu-band); padding: clamp(72px, 8vw, 128px) var(--nu-coluna) clamp(40px, 5vw, 56px);
}
.bdu__cols { display: flex; gap: clamp(32px, 5vw, 80px); align-items: flex-start; flex-wrap: wrap; }
.bdu__left { flex: 1 1 300px; min-width: min(280px, 100%); }
.bdu__titulo { margin: 16px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display); letter-spacing: -0.03em; line-height: 1.02; }
.bdu__copy { margin: 20px 0 0; max-width: 420px; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto); line-height: 1.45; }
.bdu__cta { margin-top: 32px; }
.bdu__right { flex: 1.6 1 480px; min-width: min(340px, 100%); }
.bdu__aviso {
  margin: clamp(40px, 5vw, 56px) 0 0; padding-top: 24px; border-top: 1px solid var(--nu-line); max-width: 90ch;
  color: var(--nu-gray); font-size: 13.5px; font-weight: var(--nu-w-texto); line-height: 1.5;
}
</style>

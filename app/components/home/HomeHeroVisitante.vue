<script setup lang="ts">
// O herói da home para quem não está logado (31/10/2026). Estrutura de página
// de produto da Apple, a mesma que o dono aprovou em 20/10 (o nome, o título,
// uma linha de apoio e um objeto só), com o conteúdo que ele pediu em 31/10:
//  - a frase dele no H1: "Simulamos a sua carteira em 2.000 cenários para ver
//    se ela é boa";
//  - a chamada única (HomeChamada): os bancos dentro do botão, a IA no rótulo,
//    o preço do plano e os aparelhos na letra miúda;
//  - o objeto: os três aparelhos (HomeAparelhos), cada um numa tela do Agora;
//    no computador, o Mac grande atrás, cortado pela borda direita.
// Saiu daqui a barra "Pergunte à Redentia" com as ações flutuando
// (MercadoHeroPergunta, MercadoHeroAtivos), a pedido do dono.
// Desde 31/10/2026 (pedido do dono, "pra ocupar menos espaço"), no
// computador o texto fica à esquerda e os aparelhos à direita, numa dobra só;
// no celular, um embaixo do outro.
// O H1 é o único da página. "Mercado hoje" deixou de abrir o título: 84% dos
// cliques do Google na home vêm da busca "redentia" (GSC, 90 dias até
// 28/10/2026), gente que já ouviu falar e quer saber o que é.
import type { Component } from 'vue'

// PROTÓTIPO (02/11/2026, o dono: "agora melhore esse header, ele está meio
// fraco e feio perante a todo o resto"): três direções para este herói,
// trocadas só no dev por ?heroi=1 (página de produto, o Mac no centro),
// ?heroi=2 (o motor: os 2.000 caminhos sobre o navy) e ?heroi=3 (a noite: os
// aparelhos no escuro). Em produção import.meta.dev é false, o mapa fica vazio
// (nem entra no bundle) e segue o herói de hoje até o dono escolher.
const route = useRoute()
const HEROIS: Record<string, Component> = import.meta.dev
  ? {
      '1': defineAsyncComponent(() => import('./heroi/HomeHeroiProduto.vue')),
      '2': defineAsyncComponent(() => import('./heroi/HomeHeroiMotor.vue')),
      '3': defineAsyncComponent(() => import('./heroi/HomeHeroiNoite.vue')),
    }
  : {}
const prototipo = computed(() => HEROIS[String(route.query.heroi ?? '')] ?? null)
</script>

<template>
  <component :is="prototipo" v-if="prototipo" />
  <section v-else class="hhv" aria-labelledby="hhv-titulo">
    <div class="hhv__luz" aria-hidden="true" />
    <div class="hhv__texto">
      <p class="hhv__produto"><img src="/logo-azul.svg" alt="" width="22" height="22">Redentia</p>
      <h1 id="hhv-titulo" class="hhv__titulo">Simulamos a sua carteira em 2.000 cenários para ver se ela é boa.</h1>
      <p class="hhv__dek">
        Você conecta o banco uma vez. A IA testa a carteira nos próximos cinco anos, vigia todo dia e só chama quando algo pede você.
      </p>
      <HomeChamada class="hhv__chamada" :centro="false" />
    </div>
    <div class="hhv__aparelhos">
      <HomeAparelhos />
    </div>
  </section>
</template>

<style scoped>
.hhv {
  position: relative; isolation: isolate; overflow: hidden;
  display: grid; grid-template-columns: minmax(0, 1fr); align-items: center;
  padding: clamp(36px, 4.4vw, 64px) clamp(22px, 5.5vw, 80px) clamp(48px, 6vw, 88px);
  background: var(--nu-cream);
}
.hhv__texto { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }
/* uma luz branca atrás dos aparelhos, para o preto das telas não pesar no creme */
.hhv__luz {
  position: absolute; z-index: -1; left: 50%; bottom: -12%; width: min(1280px, 140vw); height: 70%;
  transform: translateX(-50%); border-radius: 50%;
  background: radial-gradient(closest-side, var(--nu-white), transparent);
  pointer-events: none;
}
.hhv__produto {
  display: inline-flex; align-items: center; gap: 8px; margin: 0;
  color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 700;
}
.hhv__titulo {
  margin: 14px 0 0; max-width: 15ch; color: var(--nu-ink);
  font-size: clamp(38px, 4.2vw, 60px); font-weight: 800; letter-spacing: -0.05em; line-height: 1; text-wrap: balance;
}
.hhv__dek {
  margin: 22px 0 0; max-width: 46ch; color: var(--nu-gray-2);
  font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; text-wrap: balance;
}
.hhv__chamada { margin-top: clamp(30px, 3.4vw, 40px); }
.hhv__aparelhos { width: 100%; margin-top: clamp(40px, 4.4vw, 56px); }

/* entrada calma: o título fica parado (é o LCP), o resto sobe junto */
.hhv__dek, .hhv__chamada, .hhv__aparelhos { animation: hhv-entra .8s cubic-bezier(.22, 1, .36, 1) backwards; }
.hhv__chamada { animation-delay: .1s; }
.hhv__aparelhos { animation-delay: .2s; }
@keyframes hhv-entra { from { opacity: 0; transform: translateY(14px); } }

@media (prefers-reduced-motion: reduce) {
  .hhv__dek, .hhv__chamada, .hhv__aparelhos { animation: none; }
}

/* celular e tablet (pedido do dono, 01/11/2026: "fica muito estranho, parece
   que ocupa muito espaço"): numa coluna só o texto à esquerda deixava metade da
   tela vazia. Agora tudo no centro, o título menor e o espaço entre as partes
   mais curto; no celular sai a linha "Redentia" (a marca está no topo); a dos
   aparelhos sai em todo o site abaixo de 1.024 px (HomeChamada). Logo depois, o dono: "tirar
   texto daqui... para o usuário conseguir ver os dispositivos, que é o que chama
   atenção": a frase de apoio sai abaixo de 1.024 px (o "Você não precisa
   acompanhar tudo." logo abaixo diz o mesmo) e os aparelhos sobem. */
@media (max-width: 1023px) {
  .hhv__texto { align-items: center; text-align: center; }
  .hhv__titulo { max-width: 18ch; font-size: clamp(32px, 6.2vw, 46px); line-height: 1.02; }
  .hhv__dek { display: none; }
  .hhv__chamada { margin-top: 24px; }
  .hhv__chamada :deep(.hch__letra) { text-align: center; }
  .hhv__chamada { align-items: center; }
  .hhv__aparelhos { margin-top: 28px; }
}
@media (max-width: 560px) {
  .hhv { padding-top: 28px; }
  .hhv__produto { display: none; }
  .hhv__titulo { margin-top: 0; }
  .hhv__chamada :deep(.hch__letra strong) { display: inline; }
}

/* computador: o texto à esquerda e os aparelhos à direita, numa dobra só.
   Fica no fim do arquivo para vencer as regras de base acima.
   A coluna do texto tem a largura do título (de 380 a 500 px; abaixo de 380
   o botão não cabe) e a dos aparelhos vai até a borda da tela: a margem
   negativa come o padding da direita, e o Mac sai pela borda (pedido do
   dono, 31/10/2026). A caixa para em 1.100 px e, em tela larga e baixa
   (1536 × 864), na altura que cabe na dobra; presa à direita, o Mac continua
   cortado. */
@media (min-width: 1024px) {
  .hhv {
    grid-template-columns: clamp(380px, 35vw, 500px) minmax(0, 1fr); column-gap: clamp(24px, 2.6vw, 48px);
    min-height: min(720px, calc(100svh - 128px));
    padding-top: clamp(28px, 2.8vw, 44px); padding-bottom: clamp(36px, 3.6vw, 60px);
  }
  .hhv__aparelhos {
    display: flex; justify-content: flex-end; width: auto; margin-top: 0;
    margin-right: calc(-1 * clamp(22px, 5.5vw, 80px));
  }
  .hhv__aparelhos :deep(.hap) { max-width: min(1100px, calc((100svh - 240px) * 1.3)); }
  .hhv__luz { left: 74%; bottom: 0; width: min(900px, 70vw); height: 90%; }
}
</style>

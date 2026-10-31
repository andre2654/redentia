<script setup lang="ts">
// Os três aparelhos da Redentia lado a lado (31/10/2026), como a Apple mostra
// uma família de produtos: a janela do Mac no meio, o iPhone à direita e o
// relógio à esquerda, todos na tela Início do Agora ("Bolsa aberta. Tudo
// normal. Estamos analisando tudo para você.", o valor do dia escondido).
//
// As imagens são as telas aprovadas do canvas V5MBL5Q3 (IPhoneAgoraV2,
// MacAgoraInicio, WatchAgora), renderizadas a 2x e recortadas sem fundo
// (public/img/home/*.webp, 80 KB as três juntas no tamanho grande). O nome do
// dono que aparecia na barra lateral do Mac virou "Sua conta".
//
// Sem CLS: a caixa tem proporção fixa e cada aparelho é posicionado em
// porcentagem dela, com width/height reais na tag. Abaixo da dobra no celular,
// então loading="lazy"; no computador elas entram com a primeira tela.
</script>

<template>
  <div class="hap">
    <img
      class="hap__mac"
      src="/img/home/mac-agora-1640.webp"
      srcset="/img/home/mac-agora-820.webp 820w, /img/home/mac-agora-1640.webp 1640w"
      sizes="(max-width: 760px) 92vw, min(76vw, 800px)"
      width="1640" height="1025" loading="lazy" decoding="async"
      alt="O app da Redentia no Mac, na tela Início: Bolsa aberta. Tudo normal. Estamos analisando tudo para você. O resultado do dia escondido e os anéis de você e da bolsa."
    >
    <img
      class="hap__watch"
      src="/img/home/watch-agora-400.webp"
      srcset="/img/home/watch-agora-200.webp 200w, /img/home/watch-agora-400.webp 400w"
      sizes="(max-width: 760px) 30vw, min(17vw, 180px)"
      width="400" height="490" loading="lazy" decoding="async"
      alt="O app da Redentia no Apple Watch: Bolsa aberta. Tudo normal. Analisando tudo para você."
    >
    <img
      class="hap__iphone"
      src="/img/home/iphone-agora-520.webp"
      srcset="/img/home/iphone-agora-260.webp 260w, /img/home/iphone-agora-520.webp 520w"
      sizes="(max-width: 760px) 38vw, min(21vw, 222px)"
      width="520" height="1099" loading="lazy" decoding="async"
      alt="O app da Redentia no iPhone: Bolsa aberta. Tudo normal. Estamos analisando tudo para você. O valor do dia fica escondido até você tocar no olho."
    >
  </div>
</template>

<style scoped>
/* Computador: caixa de 100 × 64,4. A janela do Mac ocupa 76% da largura no
   alto; o iPhone desce pela direita e o relógio pela esquerda, sobre ela. */
.hap { position: relative; width: min(1056px, 100%); aspect-ratio: 100 / 64.4; margin: 0 auto; }
.hap img { position: absolute; display: block; height: auto; }
.hap__mac { left: 12%; top: 0; width: 76%; border-radius: 1.1% / 1.76%; box-shadow: var(--nu-home-sombra-janela); }
.hap__iphone { right: 2%; top: 31%; width: 21%; filter: var(--nu-home-sombra-aparelho); }
.hap__watch { left: 3%; top: 64.6%; width: 17%; filter: var(--nu-home-sombra-aparelho); }

/* Celular: a janela do Mac na largura toda e o iPhone maior, que é o aparelho
   de quem está lendo. Caixa de 100 × 113. */
@media (max-width: 760px) {
  .hap { aspect-ratio: 100 / 113; }
  .hap__mac { left: 0; width: 100%; }
  .hap__iphone { right: 3%; top: 28.3%; width: 38%; }
  .hap__watch { left: 3%; top: 65.7%; width: 30%; }
}
</style>

<script setup lang="ts">
// Os três aparelhos da Redentia lado a lado (31/10/2026), como a Apple mostra
// uma família de produtos: a janela do Mac no meio, o iPhone à direita e o
// relógio à esquerda. Cada um numa tela diferente do Agora, para mostrar o
// produto inteiro e não a mesma frase três vezes (pedido do dono):
//  - Mac: a Simulação, o leque dos 2.000 caminhos ("Selic sobe 3 pontos");
//  - iPhone: Detalhes, os anéis da semana e a carteira;
//  - relógio: os anéis do dia, como o Atividade ("Caiu menos que a bolsa.").
//
// As imagens são as telas aprovadas do canvas V5MBL5Q3 (MacAgoraFerramentas,
// IPhoneAgoraV2, WatchAgora), renderizadas a 2x e recortadas sem fundo
// (public/img/home/*.webp). O nome do dono que aparecia na barra lateral do
// Mac virou "Sua conta". Os números das telas são os de exemplo do canvas.
//
// Sem CLS: a caixa tem proporção fixa e cada aparelho é posicionado em
// porcentagem dela, com width/height reais na tag. Abaixo da dobra no celular,
// então loading="lazy"; no computador elas entram com a primeira tela.
</script>

<template>
  <div class="hap">
    <img
      class="hap__mac"
      src="/img/home/mac-simulacao-1640.webp"
      srcset="/img/home/mac-simulacao-820.webp 820w, /img/home/mac-simulacao-1640.webp 1640w"
      sizes="(max-width: 760px) 92vw, (max-width: 1023px) min(58vw, 630px), min(46vw, 740px)"
      width="1640" height="1025" loading="lazy" decoding="async"
      alt="O app da Redentia no Mac, na Simulação: a carteira em 2.000 caminhos, com o otimista, o meio e o pessimista, e quem sofre e por quê."
    >
    <img
      class="hap__watch"
      src="/img/home/watch-detalhes-400.webp"
      srcset="/img/home/watch-detalhes-200.webp 200w, /img/home/watch-detalhes-400.webp 400w"
      sizes="(max-width: 760px) 30vw, (max-width: 1023px) min(13vw, 140px), min(10vw, 170px)"
      width="400" height="490" loading="lazy" decoding="async"
      alt="O app da Redentia no Apple Watch: os anéis do dia, você contra a bolsa. Caiu menos que a bolsa."
    >
    <img
      class="hap__iphone"
      src="/img/home/iphone-detalhes-520.webp"
      srcset="/img/home/iphone-detalhes-260.webp 260w, /img/home/iphone-detalhes-520.webp 520w"
      sizes="(max-width: 760px) 38vw, (max-width: 1023px) min(16vw, 174px), min(13vw, 210px)"
      width="520" height="1099" loading="lazy" decoding="async"
      alt="O app da Redentia no iPhone, em Detalhes: os anéis da semana, o dia contra a bolsa e a carteira."
    >
  </div>
</template>

<style scoped>
/* Computador: caixa de 100 × 64,4 na coluna da direita do herói (o texto
   fica à esquerda, numa dobra só). A janela do Mac
   ocupa 76% da largura no alto; o iPhone desce pela direita e o relógio pela
   esquerda, sobre ela. */
.hap { position: relative; width: min(820px, 100%); aspect-ratio: 100 / 64.4; margin: 0 auto; }
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

<script setup lang="ts">
// Os três aparelhos da Redentia juntos (31/10/2026), como a Apple mostra
// uma família de produtos. No celular e no tablet, a janela do Mac no meio, o
// iPhone à direita e o relógio à esquerda; no computador, o Mac grande atrás,
// quase da altura do herói e cortado pela borda direita da tela, com o iPhone
// e o relógio na frente, embaixo à esquerda (pedido do dono no mesmo dia: "o
// Mac pode ficar bem maior, ocupando quase toda a altura e cortado um pouco do
// lado direito"). Cada um numa tela diferente do Agora, para mostrar o
// produto inteiro e não a mesma frase três vezes (pedido do dono):
//  - Mac: a Simulação, o leque dos 2.000 caminhos ("Selic sobe 3 pontos");
//  - iPhone: Detalhes, os anéis da semana e a carteira;
//  - relógio: os anéis do dia, como o Atividade ("Caiu menos que a bolsa.").
//
// As imagens são as telas aprovadas do canvas V5MBL5Q3 (MacAgoraFerramentas,
// IPhoneAgoraV2, WatchAgora), renderizadas a 2x e recortadas sem fundo
// (public/img/home/*.webp; o Mac também a 3x, porque no computador ele passa
// de 1.000 px de largura). O nome do dono que aparecia na barra lateral do
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
      srcset="/img/home/mac-simulacao-820.webp 820w, /img/home/mac-simulacao-1640.webp 1640w, /img/home/mac-simulacao-2480.webp 2480w"
      sizes="(max-width: 760px) 92vw, (max-width: 1023px) min(58vw, 630px), min(63vw, 1210px)"
      width="1640" height="1025" loading="lazy" decoding="async"
      alt="O app da Redentia no Mac, na Simulação: a carteira em 2.000 caminhos, com o otimista, o meio e o pessimista, e quem sofre e por quê."
    >
    <img
      class="hap__watch"
      src="/img/home/watch-detalhes-400.webp"
      srcset="/img/home/watch-detalhes-200.webp 200w, /img/home/watch-detalhes-400.webp 400w"
      sizes="(max-width: 760px) 30vw, (max-width: 1023px) min(13vw, 140px), min(10.5vw, 200px)"
      width="400" height="490" loading="lazy" decoding="async"
      alt="O app da Redentia no Apple Watch: os anéis do dia, você contra a bolsa. Caiu menos que a bolsa."
    >
    <img
      class="hap__iphone"
      src="/img/home/iphone-detalhes-520.webp"
      srcset="/img/home/iphone-detalhes-260.webp 260w, /img/home/iphone-detalhes-520.webp 520w"
      sizes="(max-width: 760px) 38vw, (max-width: 1023px) min(16vw, 174px), min(13vw, 255px)"
      width="520" height="1099" loading="lazy" decoding="async"
      alt="O app da Redentia no iPhone, em Detalhes: os anéis da semana, o dia contra a bolsa e a carteira."
    >
  </div>
</template>

<style scoped>
/* Tablet (o herói ainda empilhado): caixa de 100 × 64,4. A janela do Mac
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

/* Computador (o herói em duas colunas): a caixa vai da coluna da direita até
   a borda da tela (o herói estica a coluna) e tem 100 × 77. O Mac começa em
   13% e tem 110% da largura dela, então o lado direito da janela sai da tela;
   o herói corta com overflow: hidden. O iPhone fica sobre a barra lateral do
   Mac e o relógio ao lado dele, os dois descendo abaixo da janela; o relógio
   cobre o rótulo do eixo inteiro ("hoje · R$ 57,0 mil"), e não pela metade. */
@media (min-width: 1024px) {
  .hap { width: 100%; aspect-ratio: 100 / 77; margin: 0; }
  .hap__mac { left: 13%; width: 110%; }
  .hap__iphone { left: 1%; right: auto; top: 36.9%; width: 23%; }
  .hap__watch { left: 30.5%; top: 70.1%; width: 18%; }
}
</style>

<script setup lang="ts">
// Herói do visitante, direção 3 "A noite" (protótipo de 02/11/2026, ?heroi=3
// no dev). O herói fica escuro, do navy do rodapé ao preto das telas do app,
// como as páginas escuras de produto da Apple: o preto da tela do Mac some no
// preto da página, e o leque da Simulação parece desenhado no próprio site.
// Os três aparelhos flutuam sobre um chão de vidro (o reflexo embaixo) e uma
// linha de luz no horizonte, nas cores do brilho da barra da Redentia
// (--nu-chat-luz-*), para a luz do herói continuar na barra que flutua no pé.
// O título em peso 500, como o do rodapé; a chamada branca, como no fecho.
// Rolar a página traz os aparelhos para perto (CSS, animation-timeline:
// view(); onde não existe ou com movimento reduzido, fica parado).
// Telas do HomeAparelhos (canvas V5MBL5Q3, números de exemplo do canvas).
// No celular, o relógio sai e o reflexo fica mais curto.
</script>

<template>
  <section class="hp3" aria-labelledby="hp3-titulo">
    <div class="hp3__ceu" aria-hidden="true" />
    <div class="hp3__texto">
      <p class="hp3__produto"><img src="/logo-branca.svg" alt="" width="20" height="20">Redentia</p>
      <h1 id="hp3-titulo" class="hp3__titulo">Simulamos a sua carteira em 2.000 cenários para ver se ela é boa.</h1>
      <p class="hp3__dek">Você conecta o banco uma vez. A IA testa a carteira nos próximos cinco anos, vigia todo dia e só chama quando algo pede você.</p>
      <HomeChamada tom="escuro" porte="calmo" class="hp3__chamada" />
    </div>

    <div class="hp3__palco">
      <div class="hp3__halo" aria-hidden="true" />
      <div class="hp3__cena">
        <img
          class="hp3__mac"
          src="/img/home/mac-simulacao-1640.webp"
          srcset="/img/home/mac-simulacao-820.webp 820w, /img/home/mac-simulacao-1640.webp 1640w, /img/home/mac-simulacao-2480.webp 2480w"
          sizes="(max-width: 760px) calc(100vw - 44px), min(900px, 66vw)"
          width="1640" height="1025" fetchpriority="high" decoding="async"
          alt="O app da Redentia no Mac, na Simulação: a carteira em 2.000 caminhos, com o otimista, o meio e o pessimista, e quem sofre e por quê."
        >
        <img
          class="hp3__watch"
          src="/img/home/watch-detalhes-400.webp"
          srcset="/img/home/watch-detalhes-200.webp 200w, /img/home/watch-detalhes-400.webp 400w"
          sizes="min(140px, 10vw)"
          width="400" height="490" decoding="async"
          alt="O app da Redentia no Apple Watch: os anéis do dia, você contra a bolsa. Caiu menos que a bolsa."
        >
        <img
          class="hp3__iphone"
          src="/img/home/iphone-detalhes-520.webp"
          srcset="/img/home/iphone-detalhes-260.webp 260w, /img/home/iphone-detalhes-520.webp 520w"
          sizes="(max-width: 760px) 34vw, min(200px, 14vw)"
          width="520" height="1099" decoding="async"
          alt="O app da Redentia no iPhone, em Detalhes: os anéis da semana, o dia contra a bolsa e a carteira."
        >
      </div>
      <div class="hp3__horizonte" aria-hidden="true" />
    </div>
  </section>
</template>

<style scoped>
.hp3 {
  --g: clamp(22px, 5.5vw, 80px);
  position: relative; isolation: isolate; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: clamp(40px, 4.4vw, 60px) var(--g) 0;
  background: var(--nu-agora-bg);
}
/* o céu: navy no alto (o mesmo do rodapé), preto embaixo, onde os aparelhos ficam */
.hp3__ceu {
  position: absolute; inset: 0; z-index: -2; pointer-events: none;
  background:
    radial-gradient(60% 38% at 50% 0%, color-mix(in srgb, var(--nu-blue) 16%, transparent), transparent),
    linear-gradient(180deg, var(--nu-navy) 0%, color-mix(in srgb, var(--nu-navy) 55%, var(--nu-agora-bg)) 42%, var(--nu-agora-bg) 72%);
}
.hp3__texto { display: flex; flex-direction: column; align-items: center; max-width: 1120px; }
.hp3__produto {
  display: inline-flex; align-items: center; gap: 8px; margin: 0;
  color: var(--nu-agora-texto); font-size: var(--nu-fs-lg); font-weight: 700; letter-spacing: -0.02em;
}
.hp3__titulo {
  margin: 16px 0 0; max-width: 22ch;
  font-size: clamp(34px, 4.4vw, 64px); font-weight: 500; letter-spacing: -0.05em; line-height: 1.04;
  text-wrap: balance;
  color: var(--nu-agora-texto);
  background: linear-gradient(180deg, var(--nu-agora-texto) 35%, var(--nu-cream-text-70) 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.hp3__dek {
  margin: 18px 0 0; max-width: 54ch; color: var(--nu-agora-sub);
  font-size: clamp(16px, 1.35vw, 19px); font-weight: 500; line-height: 1.5; text-wrap: balance;
}
.hp3__chamada { margin-top: clamp(24px, 2.6vw, 32px); }
.hp3__chamada :deep(.hch__letra), .hp3__chamada :deep(.hch__apps) { color: var(--nu-agora-sub); }

/* o palco: os aparelhos sobre um chão de vidro, com a linha de luz no horizonte */
.hp3__palco {
  position: relative; width: min(1000px, 74vw);
  margin-top: clamp(40px, 4.2vw, 56px); padding-bottom: clamp(72px, 8vw, 120px);
}
.hp3__halo {
  position: absolute; z-index: -1; left: 50%; top: -6%; width: 120%; height: 80%;
  transform: translateX(-50%); border-radius: 50%; pointer-events: none;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--nu-blue) 24%, transparent), transparent);
  filter: blur(20px);
}
/* caixa de 100 × 62 (sem CLS). O Mac: 88 de largura, 55 de altura, a 6 da
   esquerda. O iPhone (40,2 de altura) e o relógio (15,9) pisam no chão, em 62 */
.hp3__cena {
  position: relative; width: 100%; aspect-ratio: 100 / 62;
  -webkit-box-reflect: below 2px linear-gradient(transparent 84%, var(--nu-white-14));
}
.hp3__cena img { position: absolute; display: block; height: auto; }
.hp3__mac {
  left: 6%; top: 0; width: 88%; border-radius: 1.1% / 1.76%;
  /* a borda fina com brilho no topo, como vidro; nada de sombra colorida embaixo */
  box-shadow: 0 0 0 1px var(--nu-white-14), 0 -1px 0 0 var(--nu-white-30);
}
.hp3__iphone { right: 0; top: 35.2%; width: 19%; filter: drop-shadow(0 24px 40px var(--nu-agora-bg)); }
.hp3__watch { left: 1%; top: 74.4%; width: 13%; filter: drop-shadow(0 18px 28px var(--nu-agora-bg)); }

/* a linha de luz: o brilho da barra da Redentia, esticado no horizonte */
.hp3__horizonte {
  position: absolute; left: -20%; right: -20%; top: calc(100% - clamp(72px, 8vw, 120px)); height: 2px; pointer-events: none;
  background: linear-gradient(90deg, transparent 4%, var(--nu-chat-luz-1) 24%, var(--nu-white-60) 50%, var(--nu-chat-luz-3) 76%, transparent 96%);
  box-shadow: 0 0 18px 3px var(--nu-chat-luz-1), 0 0 60px 14px var(--nu-chat-luz-2), 0 -40px 120px 20px color-mix(in srgb, var(--nu-blue) 14%, transparent);
  border-radius: 50%;
}

/* entrada calma: o título fica parado (LCP), o resto sobe junto */
.hp3__dek, .hp3__chamada, .hp3__palco { animation: hp3-entra 1s cubic-bezier(.2, .8, .2, 1) backwards; }
.hp3__chamada { animation-delay: .1s; }
.hp3__palco { animation-delay: .2s; }
@keyframes hp3-entra { from { opacity: 0; filter: blur(8px); transform: translateY(16px); } }

@supports (animation-timeline: view()) {
  .hp3__cena { animation: hp3-perto linear both; animation-timeline: view(); animation-range: entry 30% cover 55%; }
  .hp3__horizonte { animation: hp3-acende linear both; animation-timeline: view(); animation-range: entry 40% cover 60%; }
  @keyframes hp3-perto { from { transform: scale(.93) translateY(3%); } to { transform: none; } }
  @keyframes hp3-acende { from { opacity: .3; transform: scaleX(.6); } to { opacity: 1; transform: none; } }
}
@media (prefers-reduced-motion: reduce) {
  .hp3__dek, .hp3__chamada, .hp3__palco, .hp3__cena, .hp3__horizonte { animation: none; }
}

@media (max-width: 1023px) {
  .hp3__dek { display: none; }
  .hp3__titulo { max-width: 18ch; }
  .hp3__palco { width: min(820px, 88vw); }
}
@media (max-width: 560px) {
  .hp3 { padding-top: 30px; }
  .hp3__produto { display: none; }
  .hp3__titulo { margin-top: 0; font-size: clamp(31px, 8.6vw, 37px); line-height: 1.05; }
  .hp3__texto, .hp3__chamada { align-self: stretch; }
  .hp3__chamada { margin-top: 22px; }
  .hp3__chamada :deep(.hch__letra strong) { display: inline; }
  .hp3__palco { width: 100%; margin-top: 30px; padding-bottom: 64px; }
  /* sem o relógio: o Mac na largura toda e o iPhone na frente, à direita */
  .hp3__cena { aspect-ratio: 100 / 82; -webkit-box-reflect: below 2px linear-gradient(transparent 86%, var(--nu-white-14)); }
  .hp3__cena .hp3__watch { display: none; }
  .hp3__mac { left: 0; width: 100%; }
  .hp3__iphone { right: -2%; top: 12.4%; width: 34%; }
  .hp3__horizonte { top: calc(100% - 64px); }
}
</style>

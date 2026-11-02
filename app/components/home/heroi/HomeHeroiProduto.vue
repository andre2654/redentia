<script setup lang="ts">
// Herói do visitante, direção 1 "Página de produto" (protótipo de 02/11/2026,
// ?heroi=1 no dev). A estrutura que o dono aprovou em 20/10 (o nome, o título,
// uma linha de apoio, um objeto), agora na calma do resto do site: o título em
// peso 600 e não 800 (o rodapé está em 500), menor e em duas linhas; a chamada
// no porte calmo; e UM objeto, o Mac na Simulação, grande e no centro, com o
// iPhone na frente, mais embaixo, como a Apple mostra um produto. O relógio
// sai: três aparelhos amontoados eram o "pesado" do herói de hoje.
// Rolar a página traz o Mac para perto e o iPhone sobe um pouco mais rápido
// que ele (profundidade). É CSS puro (animation-timeline: view()); onde não
// existe, ou com movimento reduzido, fica parado.
// As telas são as mesmas do HomeAparelhos (canvas V5MBL5Q3, números de exemplo
// do canvas). O Mac é o maior elemento da primeira tela, então vai sem lazy e
// com prioridade alta; o iPhone vem logo atrás.
</script>

<template>
  <section class="hp1" aria-labelledby="hp1-titulo">
    <div class="hp1__texto">
      <p class="hp1__produto"><img src="/logo-azul.svg" alt="" width="20" height="20">Redentia</p>
      <h1 id="hp1-titulo" class="hp1__titulo">Simulamos a sua carteira em 2.000 cenários para ver se ela é boa.</h1>
      <p class="hp1__dek">Você conecta o banco uma vez. A IA testa a carteira nos próximos cinco anos, vigia todo dia e só chama quando algo pede você.</p>
      <HomeChamada porte="calmo" class="hp1__chamada" />
    </div>

    <div class="hp1__palco">
      <div class="hp1__luz" aria-hidden="true" />
      <div class="hp1__cena">
        <img
          class="hp1__mac"
          src="/img/home/mac-simulacao-1640.webp"
          srcset="/img/home/mac-simulacao-820.webp 820w, /img/home/mac-simulacao-1640.webp 1640w, /img/home/mac-simulacao-2480.webp 2480w"
          sizes="(max-width: 760px) calc(100vw - 44px), min(1040px, 80vw)"
          width="1640" height="1025" fetchpriority="high" decoding="async"
          alt="O app da Redentia no Mac, na Simulação: a carteira em 2.000 caminhos, com o otimista, o meio e o pessimista, e quem sofre e por quê."
        >
        <img
          class="hp1__iphone"
          src="/img/home/iphone-detalhes-520.webp"
          srcset="/img/home/iphone-detalhes-260.webp 260w, /img/home/iphone-detalhes-520.webp 520w"
          sizes="(max-width: 760px) 34vw, min(220px, 17vw)"
          width="520" height="1099" decoding="async"
          alt="O app da Redentia no iPhone, em Detalhes: os anéis da semana, o dia contra a bolsa e a carteira."
        >
      </div>
    </div>
  </section>
</template>

<style scoped>
.hp1 {
  --g: clamp(22px, 5.5vw, 80px);
  position: relative; isolation: isolate; overflow-x: clip;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: clamp(32px, 3.6vw, 52px) var(--g) 0;
  /* o creme da casa, clareando para o branco da seção de baixo (HomeComoFunciona):
     o herói termina sem degrau */
  background: linear-gradient(180deg, var(--nu-cream) 0%, var(--nu-cream) 58%, var(--nu-white) 100%);
}
.hp1__texto { display: flex; flex-direction: column; align-items: center; max-width: 1120px; }

.hp1__produto {
  display: inline-flex; align-items: center; gap: 8px; margin: 0;
  color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 700; letter-spacing: -0.02em;
}
.hp1__titulo {
  margin: 16px 0 0; max-width: 22ch;
  font-size: clamp(34px, 4.5vw, 66px); font-weight: 600; letter-spacing: -0.045em; line-height: 1.04;
  text-wrap: balance;
  /* o mesmo acabamento do título do rodapé: a tinta escurece para cima */
  color: var(--nu-ink);
  background: linear-gradient(180deg, var(--nu-ink) 45%, var(--nu-gray-3) 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.hp1__dek {
  margin: 18px 0 0; max-width: 54ch; color: var(--nu-gray-2);
  font-size: clamp(16px, 1.35vw, 19px); font-weight: 500; line-height: 1.5; text-wrap: balance;
}
.hp1__chamada { margin-top: clamp(24px, 2.6vw, 32px); }

/* o palco: o Mac no centro, com uma luz macia atrás e o iPhone na frente */
.hp1__palco {
  position: relative; width: min(1040px, 80vw);
  margin-top: clamp(36px, 3.6vw, 48px); padding-bottom: clamp(40px, 4.4vw, 72px);
}
.hp1__luz {
  position: absolute; z-index: -1; left: 50%; top: 4%; width: 135%; height: 92%;
  transform: translateX(-50%); border-radius: 50%; pointer-events: none;
  background:
    radial-gradient(closest-side, var(--nu-white) 0%, color-mix(in srgb, var(--nu-white) 55%, transparent) 55%, transparent 100%),
    radial-gradient(50% 40% at 50% 46%, color-mix(in srgb, var(--nu-blue) 9%, transparent), transparent);
}
/* caixa de proporção fixa (sem CLS): 100 de largura × 70 de altura; o Mac
   tem 62,5 de altura e o iPhone, 44,4 a partir de 24 */
.hp1__cena { position: relative; width: 100%; aspect-ratio: 100 / 70; }
.hp1__cena img { position: absolute; display: block; height: auto; }
.hp1__mac {
  left: 0; top: 0; width: 100%;
  border-radius: 1.1% / 1.76%;
  box-shadow: 0 50px 100px -50px var(--nu-navy-55), 0 0 0 1px var(--nu-navy-06);
}
.hp1__iphone { right: -5%; top: 34.3%; width: 21%; filter: var(--nu-home-sombra-aparelho); }

/* entrada calma: o título fica parado (LCP), o resto sobe junto */
.hp1__dek, .hp1__chamada, .hp1__palco { animation: hp1-entra .9s cubic-bezier(.22, 1, .36, 1) backwards; }
.hp1__chamada { animation-delay: .08s; }
.hp1__palco { animation-delay: .16s; }
@keyframes hp1-entra { from { opacity: 0; transform: translateY(16px); } }

/* rolar traz o Mac para perto e o iPhone sobe mais rápido (só onde existe) */
@supports (animation-timeline: view()) {
  .hp1__mac { animation: hp1-perto linear both; animation-timeline: view(); animation-range: entry 30% cover 55%; }
  .hp1__iphone { animation: hp1-iphone linear both; animation-timeline: view(); animation-range: entry 30% cover 60%; }
  @keyframes hp1-perto { from { transform: scale(.94); } to { transform: scale(1); } }
  @keyframes hp1-iphone { from { transform: translateY(14%); } to { transform: translateY(-4%); } }
}
@media (prefers-reduced-motion: reduce) {
  .hp1__dek, .hp1__chamada, .hp1__palco, .hp1__mac, .hp1__iphone { animation: none; }
}

/* tablet: o mesmo, mais apertado; a frase de apoio sai abaixo de 1.024 px como
   no herói de hoje (o "Você não precisa acompanhar tudo." logo abaixo diz o mesmo) */
@media (max-width: 1023px) {
  .hp1__dek { display: none; }
  .hp1__titulo { max-width: 18ch; }
  .hp1__palco { width: min(820px, 86vw); }
}
/* celular: o título curto em três linhas, o botão na largura toda e o palco
   na largura do texto, com o iPhone maior (é o aparelho de quem lê) */
@media (max-width: 560px) {
  .hp1 { padding-top: 28px; }
  .hp1__produto { display: none; }
  .hp1__titulo { margin-top: 0; font-size: clamp(30px, 8.4vw, 36px); line-height: 1.06; }
  .hp1__texto, .hp1__chamada { align-self: stretch; }
  .hp1__chamada { margin-top: 22px; }
  .hp1__chamada :deep(.hch__letra strong) { display: inline; }
  .hp1__palco { width: 100%; margin-top: 30px; padding-bottom: 48px; }
  .hp1__cena { aspect-ratio: 100 / 86; }
  .hp1__iphone { right: -2%; top: 30%; width: 34%; }
}
</style>

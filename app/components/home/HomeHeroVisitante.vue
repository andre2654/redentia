<script setup lang="ts">
// O herói da home para quem não está logado. Desde 02/11/2026 é "A noite",
// escolhido pelo dono entre três direções ("pode manter na 3"), quando o herói
// anterior ficou "meio fraco e feio perante a todo o resto" (o header
// editorial, o rodapé Calma, a barra da pergunta).
//
// Estrutura de página de produto da Apple, a que o dono aprovou em 20/10: o
// nome, o título, uma linha de apoio, a chamada e um objeto. O herói vai do
// navy do rodapé ao preto das telas do app, como as páginas escuras da Apple:
// o preto da tela do Mac some no preto da página e o leque da Simulação parece
// desenhado no próprio site. Os três aparelhos flutuam sobre um chão de vidro
// (o reflexo, desfocado para não espelhar texto legível) e uma linha de luz no
// horizonte, nas cores do brilho da barra da Redentia (--nu-chat-luz-*). O fim
// do herói é um corte seco para a seção de baixo, sem degradê (dono, 02/11/2026:
// "prefiro sem o degradê aqui").
//
// Os aparelhos levam à loja (pedido do dono, 02/11/2026: "faça um efeito
// quando faço hover em algum dos dispositivos que apareça pra clicar e ir para
// o link deles na loja"). A disponibilidade vem de utils/appsRedentia.ts: hoje
// só o iPhone está na App Store, então só ele é link ("Baixar na App Store");
// o Mac e o relógio mostram "Em breve", sem link falso. Sem hover (toque), os
// selos saem de cima dos aparelhos e viram uma linha embaixo deles.
//
// O H1 é o único da página. "Mercado hoje" deixou de abrir o título: 84% dos
// cliques do Google na home vêm da busca "redentia" (GSC, 90 dias até
// 28/10/2026), gente que já ouviu falar e quer saber o que é.
//
// LCP: o Mac é o maior elemento da primeira tela. Vai em AVIF (WebP de
// reserva), com preload e prioridade alta, sem lazy, e a entrada dele só sobe
// (sem opacidade nem desfoque, que atrasariam a pintura). As telas são as do
// canvas V5MBL5Q3 (MacAgoraFerramentas, IPhoneAgoraV2, WatchAgora), com os
// números de exemplo do canvas.
import { emBreveDosApps, seloDoApp } from '~/utils/appsRedentia'

const MAC = {
  avif: '/img/home/mac-simulacao-880.avif 880w, /img/home/mac-simulacao-1320.avif 1320w, /img/home/mac-simulacao-1760.avif 1760w',
  webp: '/img/home/mac-simulacao-820.webp 820w, /img/home/mac-simulacao-1640.webp 1640w, /img/home/mac-simulacao-2480.webp 2480w',
  // a largura real do Mac: 88% do palco (min(1.000 px, 74vw); no tablet min(820 px, 88vw)); no celular, a do texto
  sizes: '(max-width: 560px) calc(100vw - 44px), (max-width: 1023px) min(722px, 77vw), min(880px, 65vw)',
}
const IPHONE = {
  srcset: '/img/home/iphone-detalhes-260.webp 260w, /img/home/iphone-detalhes-520.webp 520w',
  sizes: '(max-width: 560px) 34vw, (max-width: 1023px) min(156px, 17vw), min(190px, 14vw)',
}
const WATCH = {
  srcset: '/img/home/watch-detalhes-200.webp 200w, /img/home/watch-detalhes-400.webp 400w',
  sizes: 'min(130px, 10vw)',
}
useHead({
  link: [{ rel: 'preload', as: 'image', type: 'image/avif', imagesrcset: MAC.avif, imagesizes: MAC.sizes, fetchpriority: 'high' }],
})

const selos = { mac: seloDoApp('mac'), watch: seloDoApp('watch'), iphone: seloDoApp('iphone') }
const emBreve = emBreveDosApps()
/** os atributos do aparelho: link para a loja quando ele já está lá */
const ligacao = (s: { rotulo: string; url: string | null }, nome: string) =>
  s.url ? { href: s.url, target: '_blank', rel: 'noopener', 'aria-label': `${s.rotulo}: o app da Redentia para ${nome} (abre em outra aba)` } : {}
</script>

<template>
  <section class="hhv" aria-labelledby="hhv-titulo">
    <div class="hhv__ceu" aria-hidden="true" />
    <div class="hhv__texto">
      <p class="hhv__produto"><img src="/logo-branca.svg" alt="" width="20" height="20">Redentia</p>
      <h1 id="hhv-titulo" class="hhv__titulo">Simulamos a sua carteira em 2.000 cenários para ver se ela é boa.</h1>
      <p class="hhv__dek">Você conecta o banco uma vez. A IA testa a carteira nos próximos cinco anos, vigia todo dia e só chama quando algo pede você.</p>
      <HomeChamada tom="escuro" porte="calmo" class="hhv__chamada" />
    </div>

    <div class="hhv__palco">
      <div class="hhv__halo" aria-hidden="true" />
      <div class="hhv__cena">
        <component :is="selos.mac.url ? 'a' : 'div'" class="hhv__aparelho hhv__aparelho--mac" v-bind="ligacao(selos.mac, 'Mac')">
          <picture>
            <source type="image/avif" :srcset="MAC.avif" :sizes="MAC.sizes">
            <img
              :srcset="MAC.webp" :sizes="MAC.sizes" src="/img/home/mac-simulacao-1640.webp"
              width="1640" height="1025" fetchpriority="high" decoding="async"
              alt="O app da Redentia no Mac, na Simulação: a carteira em 2.000 caminhos, com o otimista, o meio e o pessimista, e quem sofre e por quê."
            >
          </picture>
          <span class="hhv__selo" :class="{ 'hhv__selo--loja': selos.mac.url }">{{ selos.mac.rotulo }}<svg v-if="selos.mac.url" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg></span>
        </component>
        <component :is="selos.watch.url ? 'a' : 'div'" class="hhv__aparelho hhv__aparelho--watch" v-bind="ligacao(selos.watch, 'Apple Watch')">
          <img
            :srcset="WATCH.srcset" :sizes="WATCH.sizes" src="/img/home/watch-detalhes-400.webp"
            width="400" height="490" decoding="async"
            alt="O app da Redentia no Apple Watch: os anéis do dia, você contra a bolsa. Caiu menos que a bolsa."
          >
          <span class="hhv__selo" :class="{ 'hhv__selo--loja': selos.watch.url }">{{ selos.watch.rotulo }}<svg v-if="selos.watch.url" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg></span>
        </component>
        <component :is="selos.iphone.url ? 'a' : 'div'" class="hhv__aparelho hhv__aparelho--iphone" v-bind="ligacao(selos.iphone, 'iPhone')">
          <img
            :srcset="IPHONE.srcset" :sizes="IPHONE.sizes" src="/img/home/iphone-detalhes-520.webp"
            width="520" height="1099" decoding="async"
            alt="O app da Redentia no iPhone, em Detalhes: os anéis da semana, o dia contra a bolsa e a carteira."
          >
          <span class="hhv__selo" :class="{ 'hhv__selo--loja': selos.iphone.url }">{{ selos.iphone.rotulo }}<svg v-if="selos.iphone.url" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg></span>
        </component>
      </div>

      <!-- o reflexo no chão de vidro: as mesmas imagens (o navegador baixa uma
           vez só), viradas, desfocadas e apagando para baixo -->
      <div class="hhv__reflexo" aria-hidden="true">
        <picture class="hhv__r hhv__r--mac">
          <source type="image/avif" :srcset="MAC.avif" :sizes="MAC.sizes">
          <img :srcset="MAC.webp" :sizes="MAC.sizes" src="/img/home/mac-simulacao-1640.webp" width="1640" height="1025" alt="" decoding="async">
        </picture>
        <img class="hhv__r hhv__r--watch" :srcset="WATCH.srcset" :sizes="WATCH.sizes" src="/img/home/watch-detalhes-400.webp" width="400" height="490" alt="" decoding="async">
        <img class="hhv__r hhv__r--iphone" :srcset="IPHONE.srcset" :sizes="IPHONE.sizes" src="/img/home/iphone-detalhes-520.webp" width="520" height="1099" alt="" decoding="async">
      </div>
      <div class="hhv__horizonte" aria-hidden="true" />

      <!-- sem hover (toque): os selos numa linha embaixo dos aparelhos -->
      <p class="hhv__lojas">
        <a v-if="selos.iphone.url" :href="selos.iphone.url" target="_blank" rel="noopener" class="hhv__selo hhv__selo--loja hhv__selo--toque" aria-label="Baixar na App Store: o app da Redentia para iPhone (abre em outra aba)">
          {{ selos.iphone.rotulo }}<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
        </a>
        <span v-if="emBreve" class="hhv__embreve">{{ emBreve }}</span>
      </p>
    </div>
  </section>
</template>

<style scoped>
.hhv {
  --g: clamp(22px, 5.5vw, 80px);
  /* o respiro do fim, ainda no escuro */
  --fim: clamp(48px, 5.5vw, 88px);
  position: relative; isolation: isolate; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: clamp(40px, 4.4vw, 60px) var(--g) var(--fim);
  background: var(--nu-agora-bg);
}
/* o céu: navy no alto (o mesmo do rodapé), preto onde os aparelhos ficam */
.hhv__ceu {
  position: absolute; inset: 0; z-index: -2; pointer-events: none;
  background:
    radial-gradient(60% 38% at 50% 0%, color-mix(in srgb, var(--nu-blue) 16%, transparent), transparent),
    linear-gradient(180deg, var(--nu-navy) 0%, color-mix(in srgb, var(--nu-navy) 55%, var(--nu-agora-bg)) 42%, var(--nu-agora-bg) 72%);
}
.hhv__texto { display: flex; flex-direction: column; align-items: center; max-width: 1120px; }
.hhv__produto {
  display: inline-flex; align-items: center; gap: 8px; margin: 0;
  color: var(--nu-agora-texto); font-size: var(--nu-fs-lg); font-weight: 700; letter-spacing: -0.02em;
}
.hhv__titulo {
  margin: 16px 0 0; max-width: 22ch;
  font-size: clamp(34px, 4.4vw, 64px); font-weight: 500; letter-spacing: -0.05em; line-height: 1.04;
  text-wrap: balance;
  color: var(--nu-agora-texto);
  background: linear-gradient(180deg, var(--nu-agora-texto) 35%, var(--nu-cream-text-70) 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.hhv__dek {
  margin: 18px 0 0; max-width: 54ch; color: var(--nu-agora-sub);
  font-size: clamp(16px, 1.35vw, 19px); font-weight: 500; line-height: 1.5; text-wrap: balance;
}
.hhv__chamada { margin-top: clamp(24px, 2.6vw, 32px); }
.hhv__chamada :deep(.hch__letra), .hhv__chamada :deep(.hch__apps) { color: var(--nu-agora-sub); }

/* o palco: os aparelhos sobre um chão de vidro, com a linha de luz no horizonte */
.hhv__palco {
  --chao: clamp(56px, 6.4vw, 96px); /* a altura do reflexo embaixo do chão */
  position: relative; width: min(1000px, 74vw);
  margin-top: clamp(40px, 4.2vw, 56px); padding-bottom: var(--chao);
}
.hhv__halo {
  position: absolute; z-index: -1; left: 50%; top: -6%; width: 120%; height: 80%;
  transform: translateX(-50%); border-radius: 50%; pointer-events: none;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--nu-blue) 24%, transparent), transparent);
  filter: blur(20px);
}

/* caixa de 100 × 62 (sem CLS). O Mac: 88 de largura, 55 de altura, a 6 da
   esquerda. O iPhone (40,2 de altura) e o relógio (15,9) pisam no chão, em 62 */
.hhv__cena, .hhv__reflexo { position: relative; width: 100%; aspect-ratio: 100 / 62; }
.hhv__aparelho, .hhv__r { position: absolute; display: block; }
.hhv__aparelho img, .hhv__r, .hhv__r img { display: block; width: 100%; height: auto; }
.hhv__aparelho--mac, .hhv__r--mac { left: 6%; top: 0; width: 88%; }
.hhv__aparelho--iphone, .hhv__r--iphone { right: 0; top: 35.2%; width: 19%; }
.hhv__aparelho--watch, .hhv__r--watch { left: 1%; top: 74.4%; width: 13%; }
/* o relógio com a pulseira (dono, 02/11/2026: "coloque a pulserinha do watch").
   A foto é só a caixa: a pulseira esportiva grafite sai de cima e de baixo, em
   CSS, por trás da caixa (isolation segura o z-index -1 dentro do relógio). A
   caixa sobe para a ponta de baixo pousar no chão; o reflexo fica só da caixa,
   que já some no desfoque. */
.hhv__aparelho--watch { top: 60.3%; isolation: isolate; }
.hhv__r--watch { top: 60.3%; }
.hhv__aparelho--watch::before, .hhv__aparelho--watch::after {
  content: ''; position: absolute; z-index: -1; left: 47.6%; width: 60%; height: 55%;
  transform: translateX(-50%); pointer-events: none;
  background:
    linear-gradient(90deg, rgba(0, 0, 0, .55), transparent 18%, transparent 82%, rgba(0, 0, 0, .55)),
    linear-gradient(90deg, #1d1e22, #3a3c42 42%, #2b2d32 58%, #18191c);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .06), 0 18px 34px -14px var(--nu-agora-bg);
}
/* a de cima entra por trás do topo da caixa; a de baixo, pelo pé */
.hhv__aparelho--watch::before { bottom: 93%; border-radius: 46% 46% 10% 10% / 16% 16% 4% 4%; }
.hhv__aparelho--watch::after {
  top: 93%; border-radius: 10% 10% 46% 46% / 4% 4% 16% 16%;
  /* os furinhos da pulseira esportiva, no meio da ponta de baixo */
  background:
    radial-gradient(circle at 50% 50%, #0d0e10 0 22%, transparent 26%) 50% 58% / 18% 9% repeat-y,
    linear-gradient(90deg, rgba(0, 0, 0, .55), transparent 18%, transparent 82%, rgba(0, 0, 0, .55)),
    linear-gradient(90deg, #1d1e22, #3a3c42 42%, #2b2d32 58%, #18191c);
}
/* a borda fina com brilho no topo, como vidro */
.hhv__aparelho--mac img { border-radius: 1.1% / 1.76%; box-shadow: 0 0 0 1px var(--nu-white-14), 0 -1px 0 0 var(--nu-white-30); }
.hhv__aparelho--iphone img, .hhv__aparelho--watch img { filter: drop-shadow(0 24px 40px var(--nu-agora-bg)); }

/* o reflexo: a cena virada logo abaixo do chão, desfocada (texto nenhum fica
   legível) e apagando rápido; só a faixa de --chao aparece */
.hhv__reflexo {
  position: absolute; left: 0; top: calc(100% - var(--chao)); pointer-events: none;
  transform: scaleY(-1); margin-top: -1px;
  filter: blur(7px); opacity: .32;
  -webkit-mask-image: linear-gradient(0deg, var(--nu-agora-bg) 0%, transparent 15%);
  mask-image: linear-gradient(0deg, var(--nu-agora-bg) 0%, transparent 15%);
}

/* a linha de luz: o brilho da barra da Redentia, esticado no horizonte */
.hhv__horizonte {
  position: absolute; left: -20%; right: -20%; top: calc(100% - var(--chao)); height: 2px; pointer-events: none;
  background: linear-gradient(90deg, transparent 4%, var(--nu-chat-luz-1) 24%, var(--nu-white-60) 50%, var(--nu-chat-luz-3) 76%, transparent 96%);
  box-shadow: 0 0 18px 3px var(--nu-chat-luz-1), 0 0 60px 14px var(--nu-chat-luz-2), 0 -40px 120px 20px color-mix(in srgb, var(--nu-blue) 14%, transparent);
  border-radius: 50%;
}

/* ——— os aparelhos levam à loja ———
   O selo: uma pílula de vidro sobre o aparelho. Branca quando é link (o iPhone,
   "Baixar na App Store ↗"), escura e quieta quando o app ainda não saiu. */
.hhv__aparelho { color: inherit; transition: transform .5s cubic-bezier(.2, .8, .2, 1), filter .4s ease; }
.hhv__selo {
  position: absolute; left: 50%; z-index: 1;
  display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
  min-height: 36px; padding: 0 16px; border-radius: var(--nu-r-pill);
  background: color-mix(in srgb, var(--nu-navy) 58%, transparent);
  -webkit-backdrop-filter: blur(18px) saturate(1.5); backdrop-filter: blur(18px) saturate(1.5);
  box-shadow: inset 0 0 0 1px var(--nu-white-18), inset 0 1px 0 var(--nu-white-30), 0 12px 32px -12px var(--nu-agora-bg);
  color: var(--nu-agora-texto); font-size: var(--nu-fs-sm); font-weight: 600; letter-spacing: -0.005em; line-height: 1;
  opacity: 0; transform: translate(-50%, 8px) scale(.96); pointer-events: none;
  transition: opacity .25s ease, transform .4s cubic-bezier(.2, .8, .2, 1);
}
.hhv__selo--loja {
  background: color-mix(in srgb, var(--nu-white) 86%, transparent);
  box-shadow: inset 0 0 0 1px var(--nu-white-60), 0 14px 36px -12px var(--nu-agora-bg), 0 0 40px -6px var(--nu-chat-luz-1);
  color: var(--nu-ink);
}
.hhv__aparelho--mac .hhv__selo { top: 5%; }
.hhv__aparelho--iphone .hhv__selo { top: 12%; }
.hhv__aparelho--watch .hhv__selo { top: -48%; }

@media (hover: hover) {
  .hhv__aparelho:hover .hhv__selo { opacity: 1; transform: translate(-50%, 0); }
  .hhv__aparelho--iphone:hover, .hhv__aparelho--watch:hover { transform: translateY(-3%); }
  .hhv__aparelho--mac:hover { transform: translateY(-1%); }
  .hhv__aparelho:hover img { filter: brightness(1.08); }
  .hhv__aparelho--iphone:hover img, .hhv__aparelho--watch:hover img { filter: brightness(1.08) drop-shadow(0 30px 44px var(--nu-agora-bg)); }
  /* os outros dois recuam um pouco: o olho vai para o aparelho apontado */
  .hhv__cena:has(.hhv__aparelho:hover) .hhv__aparelho:not(:hover) { filter: brightness(.62); }
  a.hhv__aparelho { cursor: pointer; }
}
/* teclado: o iPhone (link) recebe foco e mostra o selo com o anel em volta dele */
.hhv__aparelho:focus-visible { outline: none; }
.hhv__aparelho:focus-visible .hhv__selo { opacity: 1; transform: translate(-50%, 0); outline: 2px solid var(--nu-white); outline-offset: 3px; }

/* sem hover (toque): os selos saem de cima dos aparelhos e viram uma linha
   embaixo deles, sobre o reflexo; o da loja é o único com cara de botão */
.hhv__lojas { display: none; }
@media (hover: none) {
  .hhv__cena .hhv__selo { display: none; }
  /* o chão cresce para caber a linha dos selos logo abaixo da linha de luz */
  .hhv__palco { --chao: 132px; }
  .hhv__lojas {
    position: absolute; left: 0; right: 0; top: calc(100% - var(--chao) + 26px); z-index: 1; margin: 0;
    display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px 16px;
  }
  .hhv__selo--toque { position: static; opacity: 1; transform: none; pointer-events: auto; min-height: 40px; }
  .hhv__embreve { color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: 500; }
}
.hhv__selo--toque:focus-visible { outline: 2px solid var(--nu-white); outline-offset: 3px; }

/* entrada calma: o título fica parado (LCP); o texto sobe do desfoque; o palco
   só sobe, sem opacidade, para o Mac pintar na hora (é o LCP no computador) */
.hhv__dek, .hhv__chamada { animation: hhv-entra 1s cubic-bezier(.2, .8, .2, 1) backwards; }
.hhv__chamada { animation-delay: .1s; }
.hhv__palco { animation: hhv-sobe 1.1s cubic-bezier(.2, .8, .2, 1) .1s backwards; }
@keyframes hhv-entra { from { opacity: 0; filter: blur(8px); transform: translateY(16px); } }
@keyframes hhv-sobe { from { transform: translateY(28px); } }

/* rolar traz os aparelhos para perto e acende o horizonte (só onde existe) */
@supports (animation-timeline: view()) {
  .hhv__cena, .hhv__reflexo { animation: hhv-perto linear both; animation-timeline: view(); animation-range: entry 30% cover 55%; }
  .hhv__reflexo { animation-name: hhv-perto-reflexo; }
  .hhv__horizonte { animation: hhv-acende linear both; animation-timeline: view(); animation-range: entry 40% cover 60%; }
  @keyframes hhv-perto { from { transform: scale(.93) translateY(3%); } to { transform: none; } }
  @keyframes hhv-perto-reflexo { from { transform: scaleY(-1) scale(.93) translateY(3%); } to { transform: scaleY(-1); } }
  @keyframes hhv-acende { from { opacity: .3; transform: scaleX(.6); } to { opacity: 1; transform: none; } }
}
@media (prefers-reduced-motion: reduce) {
  .hhv__dek, .hhv__chamada, .hhv__palco, .hhv__cena, .hhv__horizonte { animation: none; }
  .hhv__reflexo { animation: none; transform: scaleY(-1); }
  .hhv__aparelho, .hhv__selo { transition: opacity .2s ease; }
  .hhv__aparelho:hover, .hhv__aparelho--iphone:hover, .hhv__aparelho--watch:hover, .hhv__aparelho--mac:hover { transform: none; }
  .hhv__aparelho:hover .hhv__selo, .hhv__aparelho:focus-visible .hhv__selo { transform: translate(-50%, 0); }
}

/* tablet: a frase de apoio sai (o "Você não precisa acompanhar tudo." logo
   abaixo diz o mesmo) e o palco ocupa mais da largura */
@media (max-width: 1023px) {
  .hhv__dek { display: none; }
  .hhv__titulo { max-width: 18ch; }
  .hhv__palco { width: min(820px, 88vw); }
}
/* celular: sem o relógio, o Mac na largura toda e o iPhone na frente, à direita */
@media (max-width: 560px) {
  .hhv { padding-top: 30px; }
  .hhv__produto { display: none; }
  .hhv__titulo { margin-top: 0; font-size: clamp(31px, 8.6vw, 37px); line-height: 1.05; }
  .hhv__texto, .hhv__chamada { align-self: stretch; }
  .hhv__chamada { margin-top: 22px; }
  .hhv__chamada :deep(.hch__letra strong) { display: inline; }
  .hhv__palco { width: 100%; margin-top: 30px; }
  .hhv__cena, .hhv__reflexo { aspect-ratio: 100 / 82; }
  .hhv__aparelho--watch, .hhv__r--watch { display: none; }
  .hhv__aparelho--mac, .hhv__r--mac { left: 0; width: 100%; }
  .hhv__aparelho--iphone, .hhv__r--iphone { right: -2%; top: 12.4%; width: 34%; }
}
</style>

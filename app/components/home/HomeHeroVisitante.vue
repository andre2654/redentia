<script setup lang="ts">
// O herói da home para quem não está logado. Desde 02/11/2026 é "A noite",
// escolhido pelo dono entre três direções ("pode manter na 3"): estrutura de
// página de produto, com o nome, o título, uma linha de apoio, a chamada e um
// objeto. O herói vai do carvão ao preto, com uma linha de luz no horizonte
// (as cores do anel do input mágico, --nu-anel) e um corte seco para a seção
// de baixo, sem degradê (dono, 02/11/2026: "prefiro sem o degradê aqui").
//
// O H1 é o único da página. 84% dos cliques do Google na home vêm da busca
// pela marca (GSC, 90 dias até 28/10/2026), gente que já ouviu falar e quer
// saber o que é.
//
// Aportou (11/11/2026): o dono viu o wordmark e o título em 800 sobre este
// palco e aprovou ("gostei mais da Aportou assim").
//
// O OBJETO MUDOU em 11/11/2026. Eram três aparelhos (Mac, relógio, iPhone) com
// os selos da loja; o dono pediu uma hero "que não fale de apps" e, vendo uma
// proposta em duas colunas, decidiu: "deixe como estava, só troque a parte dos
// devices abaixo para mostrar os 2k cenários". Então o texto e a chamada são
// os de antes, ao centro, e no palco entra o próprio teste: o leque dos 2.000
// caminhos se desenhando no céu, sem cartão em volta (HomeLeque, a ilustração
// do método, sem R$ de ninguém), com o selo dos 2.000 futuros embaixo. A
// chamada vai sem a linha dos aparelhos (HomeChamada sem-apps). O palco
// inteiro leva ao mesmo lugar do botão.
//
// As imagens dos aparelhos (public/img/home) ficam no repositório: o /assinar
// ainda usa.
//
// Robustez (11/11/2026, docs/aportou/robustez.md): o selo dos 2.000 futuros era
// uma pílula cobalto cheia, a coisa mais forte do herói depois do título, e lia
// como um segundo botão ao lado da chamada. Virou a legenda do palco, não uma
// ação: a chamada é a única coisa cheia na dobra. Em 12/11/2026 o dono pediu a
// legenda com a mesma letra da linha embaixo da chamada e tirou a nota
// "Ilustração do método…". Sob o ponteiro, o palco inteiro avisa que é
// clicável: a legenda clareia. Pesos, tracking, espaços (8 px) e a entrada vêm dos
// tokens (--nu-dur-entrada, --nu-ease-saida, cascata de 60 ms).
</script>

<template>
  <section class="hhv" aria-labelledby="hhv-titulo">
    <div class="hhv__ceu" aria-hidden="true" />
    <div class="hhv__texto">
      <p class="hhv__produto"><MarcaAportou :altura="30" sobre="escuro" rotulo="Aportou" /></p>
      <h1 id="hhv-titulo" class="hhv__titulo">Simulamos a sua carteira em 2.000 cenários para ver se ela é boa.</h1>
      <p class="hhv__dek">Você conecta o banco uma vez. A IA testa a carteira nos próximos cinco anos, vigia todo dia e só chama quando algo pede você.</p>
      <HomeChamada tom="escuro" porte="calmo" sem-apps class="hhv__chamada" />
    </div>

    <NuxtLink to="/assinar?quiz=1&de=home-leque" class="hhv__palco" aria-label="Conectar a carteira e ver o teste dos 2.000 cenários">
      <div class="hhv__halo" aria-hidden="true" />
      <HomeLeque tom="carvao" class="hhv__leque" />
      <p class="hhv__pe">
        <span class="hhv__legenda"><strong>2.000</strong> futuros testados para cada carteira</span>
      </p>
      <div class="hhv__horizonte" aria-hidden="true" />
    </NuxtLink>
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
/* o céu: carvão no alto (o mesmo do rodapé), preto onde o leque fica */
.hhv__ceu {
  position: absolute; inset: 0; z-index: -2; pointer-events: none;
  background:
    radial-gradient(60% 38% at 50% 0%, color-mix(in srgb, var(--nu-blue) 16%, transparent), transparent),
    linear-gradient(180deg, var(--nu-navy) 0%, color-mix(in srgb, var(--nu-navy) 55%, var(--nu-agora-bg)) 42%, var(--nu-agora-bg) 72%);
}
.hhv__texto { display: flex; flex-direction: column; align-items: center; max-width: 1120px; }
.hhv__produto {
  display: inline-flex; align-items: center; gap: 8px; margin: 0;
  color: var(--nu-agora-texto); font-size: var(--nu-fs-lg); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-titulo);
}
.hhv__titulo {
  margin: 24px 0 0; max-width: 22ch;
  font-size: clamp(36px, 4.8vw, 68px); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1;
  text-wrap: balance;
  color: var(--nu-agora-texto);
  background: linear-gradient(180deg, var(--nu-white) 45%, var(--nu-cream-text-78) 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.hhv__dek {
  margin: 20px 0 0; max-width: 54ch; color: var(--nu-agora-sub);
  font-size: clamp(16px, 1.35vw, 19px); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.5; text-wrap: balance;
}
.hhv__chamada { margin-top: clamp(24px, 2.6vw, 32px); }
.hhv__chamada :deep(.hch__letra) { color: var(--nu-agora-sub); }

/* o palco: o leque dos 2.000 cenários desenhado no próprio céu, sem cartão,
   com a linha de luz no horizonte embaixo */
.hhv__palco {
  --chao: clamp(64px, 6.4vw, 96px); /* o espaço do selo, embaixo do horizonte */
  position: relative; display: block; width: min(1080px, 84vw); color: inherit;
  margin-top: clamp(32px, 3.4vw, 48px); padding-bottom: var(--chao);
  -webkit-tap-highlight-color: transparent;
}
.hhv__palco:hover { color: inherit; }
.hhv__halo {
  position: absolute; z-index: -1; left: 50%; top: -6%; width: 120%; height: 80%;
  transform: translateX(-50%); border-radius: 50%; pointer-events: none;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--nu-blue) 24%, transparent), transparent);
  filter: blur(20px);
}
/* a caixa do leque tem o tamanho final antes do JavaScript (sem CLS); o fundo é o do céu */
.hhv__palco .hhv__leque { display: block; width: 100%; height: auto; aspect-ratio: 100 / 40; background: transparent; text-align: left; }
.hhv__pe {
  position: absolute; left: 0; right: 0; bottom: 0; height: var(--chao); margin: 0;
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px 16px; padding-top: 16px;
}
/* a legenda do palco (dono, 12/11/2026: "deixe esse texto igual ao texto de
   cima"): a mesma letra da linha embaixo da chamada (a .hch__letra, que este
   herói pinta com --nu-agora-sub): o número em branco, o resto no mesmo tom; sem selo */
.hhv__legenda {
  color: var(--nu-agora-sub); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto);
  letter-spacing: var(--nu-ls-texto); line-height: 1.55;
  transition: color var(--nu-dur-media) var(--nu-ease-cor);
}
.hhv__legenda strong { color: var(--nu-white); font-weight: var(--nu-w-medio); }
/* o palco inteiro é o clique: a legenda clareia sob o ponteiro */
.hhv__palco:hover .hhv__legenda { color: var(--nu-white); }
.hhv__palco:focus-visible { outline: 3px solid var(--nu-blue-on-dark); outline-offset: 6px; border-radius: var(--nu-r-card); }

/* a linha de luz: o anel do input mágico (cobalto, céu, sálvia e areia),
   esticado no horizonte. O fio é o ::before (a máscara apaga as pontas sem
   cortar o brilho, que é a sombra da caixa de fora) */
.hhv__horizonte {
  position: absolute; left: -20%; right: -20%; top: calc(100% - var(--chao)); height: 2px; pointer-events: none;
  box-shadow: 0 0 60px 14px color-mix(in srgb, var(--nu-blue) 26%, transparent), 0 -40px 120px 20px color-mix(in srgb, var(--nu-blue) 14%, transparent);
  border-radius: 50%;
}
.hhv__horizonte::before, .hhv__horizonte::after {
  content: ''; position: absolute; inset: 0; border-radius: inherit;
  background: var(--nu-anel); background-size: 100% 100%;
  -webkit-mask-image: linear-gradient(90deg, transparent 6%, var(--nu-agora-bg) 26%, var(--nu-agora-bg) 74%, transparent 94%);
  mask-image: linear-gradient(90deg, transparent 6%, var(--nu-agora-bg) 26%, var(--nu-agora-bg) 74%, transparent 94%);
}
/* o mesmo anel, desfocado, é o halo colorido em volta do fio */
.hhv__horizonte::after { inset: -7px 0; filter: blur(9px); opacity: .7; }

/* entrada calma: o título fica parado (LCP); o texto sobe do desfoque em
   cascata de 60 ms; o palco só sobe (o leque se desenha sozinho) */
.hhv__dek, .hhv__chamada { animation: hhv-entra var(--nu-dur-entrada) var(--nu-ease-saida) backwards; }
.hhv__chamada { animation-delay: 60ms; }
.hhv__palco { animation: hhv-sobe var(--nu-dur-entrada) var(--nu-ease-saida) 120ms backwards; }
@keyframes hhv-entra { from { opacity: 0; filter: blur(6px); transform: translateY(14px); } }
@keyframes hhv-sobe { from { transform: translateY(16px); } }

/* rolar acende o horizonte (só onde existe) */
@supports (animation-timeline: view()) {
  .hhv__horizonte { animation: hhv-acende linear both; animation-timeline: view(); animation-range: entry 40% cover 60%; }
  @keyframes hhv-acende { from { opacity: .3; transform: scaleX(.6); } to { opacity: 1; transform: none; } }
}
@media (prefers-reduced-motion: reduce) {
  .hhv__dek, .hhv__chamada, .hhv__palco, .hhv__horizonte { animation: none; }
  .hhv__legenda { transition: none; }
}

/* tablet: a frase de apoio sai (o "Você não precisa acompanhar tudo." logo
   abaixo diz o mesmo) e o palco ocupa mais da largura */
@media (max-width: 1023px) {
  .hhv__dek { display: none; }
  .hhv__titulo { max-width: 18ch; }
  .hhv__palco { width: min(820px, 92vw); }
  .hhv__palco .hhv__leque { aspect-ratio: 100 / 48; }
}
/* celular: o leque na largura toda, mais alto, e a nota embaixo do selo */
@media (max-width: 560px) {
  .hhv { padding-top: 30px; }
  .hhv__produto { display: none; }
  .hhv__titulo { margin-top: 0; font-size: clamp(31px, 8.6vw, 37px); line-height: 1.05; }
  .hhv__texto, .hhv__chamada { align-self: stretch; }
  .hhv__chamada { margin-top: 24px; }
  .hhv__chamada :deep(.hch__letra strong) { display: inline; }
  .hhv__palco { --chao: 104px; width: 100%; margin-top: 24px; }
  .hhv__palco .hhv__leque { aspect-ratio: 100 / 66; }
}
</style>

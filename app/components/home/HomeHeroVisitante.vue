<script setup lang="ts">
// O herói da home para quem não está logado.
//
// DESDE 13/11/2026 É O FILME. O dono, com o filme de lançamento na mão:
// "vamos trocar a hero para quando não tem usuário logado para mostrar o nosso
// vídeo em full". O filme (HomeFilme) abre a página na largura inteira da
// tela, logo abaixo da régua, e cabe na primeira dobra. Ele tem texto próprio
// do começo ao fim ("Sua carteira é boa?", "Ela testa 2.000 futuros", "Ela
// vigia cada ativo", o cartão da marca), então nada escreve por cima dele: o
// título, a linha de apoio e a chamada vêm embaixo, ainda no escuro, e a linha
// de luz fecha o herói.
//
// O H1 é o único da página, e segue no HTML logo depois do filme. 84% dos
// cliques do Google na home vêm da busca pela marca (GSC, 90 dias até
// 28/10/2026), gente que já ouviu falar e quer saber o que é.
//
// O QUE SAIU com o filme: o wordmark em cima do título (o filme fecha com a
// marca, e o topo já a mostra) e o palco com o leque dos 2.000 cenários e a
// legenda "2.000 futuros testados para cada carteira" (o filme mostra o
// teste). O HomeLeque segue em uso no "como funciona", na home de quem tem
// conta e no /assinar.
//
// ANTES (para quem for ler o histórico): desde 02/11/2026 era "A noite",
// escolhido pelo dono entre três direções ("pode manter na 3"): o nome, o
// título, a linha de apoio, a chamada e um objeto, do carvão ao preto, com a
// linha de luz no horizonte (as cores do anel do input mágico, --nu-anel) e um
// corte seco para a seção de baixo, sem degradê ("prefiro sem o degradê
// aqui"). O objeto foram os três aparelhos e, de 11/11/2026 até o filme, o
// leque ("deixe como estava, só troque a parte dos devices abaixo para mostrar
// os 2k cenários"). A chamada segue sem a linha dos aparelhos (HomeChamada
// sem-apps).
//
// As imagens dos aparelhos (public/img/home) ficam no repositório: o /assinar
// ainda usa.
//
// Robustez (11/11/2026, docs/aportou/robustez.md): a chamada é a única coisa
// cheia do herói. Pesos, tracking, espaços (8 px) e a entrada vêm dos tokens
// (--nu-dur-entrada, --nu-ease-saida, cascata de 60 ms).
</script>

<template>
  <section class="hhv" aria-labelledby="hhv-titulo">
    <HomeFilme class="hhv__filme" />
    <div class="hhv__texto">
      <h1 id="hhv-titulo" class="hhv__titulo">Simulamos a sua carteira em 2.000 cenários para ver se ela é boa.</h1>
      <p class="hhv__dek">Você conecta o banco uma vez. A IA testa a carteira nos próximos cinco anos, vigia todo dia e só chama quando algo pede você.</p>
      <HomeChamada tom="escuro" porte="calmo" sem-apps class="hhv__chamada" />
    </div>
    <div class="hhv__horizonte" aria-hidden="true" />
  </section>
</template>

<style scoped>
.hhv {
  --g: clamp(22px, 5.5vw, 80px);
  /* o chão do herói: o espaço entre a linha de luz e o corte para a seção de baixo */
  --chao: clamp(36px, 4vw, 56px);
  /* o recorte é `clip`, não `hidden` (13/11/2026): com `hidden` o herói virava a caixa de rolagem do horizonte, e a
     linha de luz, que acende com a rolagem da PÁGINA, ficava travada a meia-luz (47% de opacidade, 70% da largura).
     Quem não conhece `clip` fica com `hidden` */
  position: relative; isolation: isolate; overflow: hidden; overflow: clip;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  background: var(--nu-agora-bg);
}
/* o filme vai de beira a beira: o respiro lateral é só do texto */
.hhv__filme { align-self: stretch; }
/* o respiro de cima é o lugar da barra do chat: no alto da página o filme acaba logo acima dela, e o título começa
   depois da dobra (com menos respiro, a barra ficava em cima da primeira linha do título) */
.hhv__texto {
  display: flex; flex-direction: column; align-items: center; max-width: 1120px;
  padding: 104px var(--g) calc(var(--chao) + clamp(40px, 4.6vw, 64px));
}
.hhv__titulo {
  margin: 0; max-width: 22ch;
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

/* a linha de luz: o anel do input mágico (cobalto, céu, sálvia e areia),
   esticado no horizonte, no pé do herói. O fio é o ::before (a máscara apaga
   as pontas sem cortar o brilho, que é a sombra da caixa de fora) */
.hhv__horizonte {
  position: absolute; left: -20%; right: -20%; bottom: var(--chao); height: 2px; pointer-events: none;
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

/* entrada calma: o título fica parado; a linha de apoio e a chamada sobem do desfoque em cascata de 60 ms */
.hhv__dek, .hhv__chamada { animation: hhv-entra var(--nu-dur-entrada) var(--nu-ease-saida) backwards; }
.hhv__chamada { animation-delay: 60ms; }
@keyframes hhv-entra { from { opacity: 0; filter: blur(6px); transform: translateY(14px); } }

/* rolar acende o horizonte (só onde existe) */
@supports (animation-timeline: view()) {
  .hhv__horizonte { animation: hhv-acende linear both; animation-timeline: view(); animation-range: entry 40% cover 60%; }
  @keyframes hhv-acende { from { opacity: .3; transform: scaleX(.6); } to { opacity: 1; transform: none; } }
}
@media (prefers-reduced-motion: reduce) {
  .hhv__dek, .hhv__chamada, .hhv__horizonte { animation: none; }
}

/* tablet: a frase de apoio sai (o "Você não precisa acompanhar tudo." logo abaixo diz o mesmo) */
@media (max-width: 1023px) {
  .hhv__dek { display: none; }
  .hhv__titulo { max-width: 18ch; }
}
/* celular: o título menor e a chamada na largura toda */
@media (max-width: 560px) {
  .hhv__texto { padding-top: 96px; }
  .hhv__titulo { font-size: clamp(31px, 8.6vw, 37px); line-height: 1.05; }
  .hhv__texto, .hhv__chamada { align-self: stretch; }
  .hhv__chamada { margin-top: 24px; }
  .hhv__chamada :deep(.hch__letra strong) { display: inline; }
}
</style>

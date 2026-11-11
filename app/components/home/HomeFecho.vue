<script setup lang="ts">
// O fecho da home para quem não assinou (31/10/2026): a mesma pergunta do H1,
// agora para a pessoa ("A sua carteira é boa?"), e a mesma chamada única. No
// lugar do NuCtaPhoto "Pronto para investir com uma IA do seu lado?", que
// mandava criar conta grátis (/login) com foto de banco de imagem: a ação da
// página é uma só, e ela leva ao /assinar.
//
// Aportou (11/11/2026): deixou de ser uma faixa azul de ponta a ponta e virou
// o painel azul da marca (o gradiente cobalto, raio 40, o corte gigante branco
// a 8% no canto) pousado sobre o creme da página, como a chamada final do
// quadro Home. O título, o texto e a chamada (HomeChamada, agora a pílula
// creme com a seta no círculo) são os mesmos.
const { el: secao, revealClass } = useReveal(0.25, { soEmbeleza: true })
</script>

<template>
  <section ref="secao" class="hfe" :class="revealClass" aria-labelledby="hfe-titulo">
    <div class="hfe__painel">
      <MarcaCorte class="hfe__corte nu-corte-fundo" :largura="620" cor="var(--nu-white)" />
      <NuEyebrow como="p" sobre="azul">Aportou?</NuEyebrow>
      <h2 id="hfe-titulo" class="hfe__titulo">A sua carteira é boa?</h2>
      <p class="hfe__dek">Em três dias você descobre. Conecte o banco e veja a carteira em 2.000 cenários, com a IA vigiando por você.</p>
      <HomeChamada tom="escuro" :centro="false" class="hfe__chamada" />
    </div>
  </section>
</template>

<style scoped>
.hfe { background: var(--nu-page); padding: clamp(40px, 5vw, 72px) max(32px, calc((100% - 1176px) / 2)) clamp(56px, 6vw, 88px); }
/* o painel azul do contrato */
.hfe__painel {
  position: relative; isolation: isolate; overflow: hidden;
  display: flex; flex-direction: column; align-items: flex-start;
  padding: clamp(36px, 6vw, 88px) clamp(24px, 5vw, 64px);
  border-radius: var(--nu-r-secao); background: var(--nu-grad-cobalto); color: var(--nu-white);
}
/* posição e tamanho são da classe global .nu-corte-fundo (sempre no canto de cima à esquerda) */
.hfe__corte { z-index: -1; opacity: .08; }
.hfe__titulo { margin: 18px 0 0; color: var(--nu-white); font-size: var(--nu-fs-hero); font-weight: 800; letter-spacing: -0.035em; line-height: .98; text-wrap: balance; }
.hfe__dek { margin: 20px 0 0; max-width: 46ch; color: var(--nu-blue-on-blue); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; text-wrap: pretty; }
.hfe__chamada { margin-top: clamp(26px, 3vw, 36px); }

/* entrada: o painel sobe quando a seção chega perto da tela */
.hfe.is-in .hfe__painel { animation: nu-subir .5s cubic-bezier(.2, .8, .2, 1) backwards; }

@media (max-width: 760px) {
  .hfe { padding-inline: 20px; }
  .hfe__painel { border-radius: var(--nu-r-card); }
}
</style>

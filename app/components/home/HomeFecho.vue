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
//
// Robustez (11/11/2026): o painel entra com o v-revelar (sobe 14 px e sai do
// desfoque em 720 ms, uma vez, sem esconder nada no HTML); título e texto nos
// tokens de peso e tracking; a coluna de 1.240 (--nu-coluna).
</script>

<template>
  <section class="hfe" aria-labelledby="hfe-titulo">
    <div v-revelar class="hfe__painel">
      <MarcaCorte class="hfe__corte nu-corte-fundo" :largura="620" cor="var(--nu-white)" />
      <NuEyebrow como="p" sobre="azul">Aportou?</NuEyebrow>
      <h2 id="hfe-titulo" class="hfe__titulo">A sua carteira é boa?</h2>
      <p class="hfe__dek">Em três dias você descobre. Conecte o banco e veja a carteira em 2.000 cenários, com a IA vigiando por você.</p>
      <HomeChamada tom="escuro" :centro="false" class="hfe__chamada" />
    </div>
  </section>
</template>

<style scoped>
.hfe { background: var(--nu-page); padding: clamp(40px, 5vw, 72px) var(--nu-coluna) clamp(56px, 6vw, 96px); }
/* o painel azul do contrato */
.hfe__painel {
  position: relative; isolation: isolate; overflow: hidden;
  display: flex; flex-direction: column; align-items: flex-start;
  padding: clamp(36px, 6vw, 88px) clamp(24px, 5vw, 64px);
  border-radius: var(--nu-r-secao); background: var(--nu-grad-cobalto); color: var(--nu-white);
}
/* posição e tamanho são da classe global .nu-corte-fundo (sempre no canto de cima à esquerda) */
.hfe__corte { z-index: -1; opacity: .08; }
.hfe__titulo { margin: 18px 0 0; color: var(--nu-white); font-size: var(--nu-fs-hero); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: .98; text-wrap: balance; }
.hfe__dek { margin: 20px 0 0; max-width: 46ch; color: var(--nu-blue-on-blue); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.45; text-wrap: pretty; }
.hfe__chamada { margin-top: clamp(24px, 3vw, 40px); }

@media (max-width: 760px) {
  .hfe__painel { border-radius: var(--nu-r-card); }
}
</style>

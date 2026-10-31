<script setup lang="ts">
// O fecho da home para quem não assinou (31/10/2026): a mesma pergunta do H1,
// agora para a pessoa ("A sua carteira é boa?"), e a mesma chamada única. No
// lugar do NuCtaPhoto "Pronto para investir com uma IA do seu lado?", que
// mandava criar conta grátis (/login) com foto de banco de imagem: a ação da
// página é uma só, e ela leva ao /assinar.
// Azul e não navy: logo abaixo vem o convite da newsletter (navy) do layout.
</script>

<template>
  <section class="hfe" aria-labelledby="hfe-titulo">
    <h2 id="hfe-titulo" class="hfe__titulo">A sua carteira é boa?</h2>
    <p class="hfe__dek">Em três dias você descobre. Conecte o banco e veja a carteira em 2.000 cenários, com a IA vigiando por você.</p>
    <HomeChamada tom="escuro" class="hfe__chamada" />
  </section>
</template>

<style scoped>
.hfe {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: clamp(64px, 8.5vw, 112px) clamp(22px, 5.5vw, 80px);
  background: var(--nu-blue); color: var(--nu-white);
  animation: nu-fade .5s ease both;
}
.hfe__titulo { margin: 0; color: var(--nu-white); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; }
.hfe__dek { margin: 18px 0 0; max-width: 46ch; color: var(--nu-white-85); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; text-wrap: balance; }
.hfe__chamada { margin-top: clamp(30px, 3.4vw, 40px); }
</style>

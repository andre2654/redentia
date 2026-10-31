<script setup lang="ts">
// O herói da home para quem não está logado (31/10/2026). Estrutura de página
// de produto da Apple, a mesma que o dono aprovou em 20/10 (o nome, o título,
// uma linha de apoio e um objeto só), com o conteúdo que ele pediu em 31/10:
//  - a frase dele no H1: "Simulamos a sua carteira em 2.000 cenários para ver
//    se ela é boa";
//  - a chamada única (HomeChamada): os bancos dentro do botão, a IA no rótulo,
//    o preço do plano e os aparelhos na letra miúda;
//  - o objeto: os três aparelhos na tela Início do Agora (HomeAparelhos), que
//    é o conceito dos apps (a pessoa não precisa saber de tudo; abre e vê
//    "Tudo normal.").
// Saiu daqui a barra "Pergunte à Redentia" com as ações flutuando
// (MercadoHeroPergunta, MercadoHeroAtivos), a pedido do dono.
// O H1 é o único da página. "Mercado hoje" deixou de abrir o título: 84% dos
// cliques do Google na home vêm da busca "redentia" (GSC, 90 dias até
// 28/10/2026), gente que já ouviu falar e quer saber o que é.
</script>

<template>
  <section class="hhv" aria-labelledby="hhv-titulo">
    <div class="hhv__luz" aria-hidden="true" />
    <p class="hhv__produto"><img src="/logo-azul.svg" alt="" width="22" height="22">Redentia</p>
    <h1 id="hhv-titulo" class="hhv__titulo">Simulamos a sua carteira em 2.000 cenários <br>para ver se ela é boa.</h1>
    <p class="hhv__dek">
      Você conecta o banco uma vez. A IA testa a carteira nos próximos cinco anos, vigia todo dia e só chama quando algo pede você.
    </p>
    <HomeChamada class="hhv__chamada" />
    <div class="hhv__aparelhos">
      <HomeAparelhos />
    </div>
  </section>
</template>

<style scoped>
.hhv {
  position: relative; isolation: isolate; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: clamp(36px, 4.4vw, 64px) clamp(22px, 5.5vw, 80px) clamp(48px, 6vw, 88px);
  background: var(--nu-cream);
}
/* uma luz branca atrás dos aparelhos, para o preto das telas não pesar no creme */
.hhv__luz {
  position: absolute; z-index: -1; left: 50%; bottom: -12%; width: min(1280px, 140vw); height: 70%;
  transform: translateX(-50%); border-radius: 50%;
  background: radial-gradient(closest-side, var(--nu-white), transparent);
  pointer-events: none;
}
.hhv__produto {
  display: inline-flex; align-items: center; gap: 8px; margin: 0;
  color: var(--nu-ink); font-size: var(--nu-fs-lg); font-weight: 700;
}
.hhv__titulo {
  margin: 14px 0 0; color: var(--nu-ink);
  font-size: clamp(38px, 4.2vw, 60px); font-weight: 800; letter-spacing: -0.05em; line-height: 1;
}
.hhv__dek {
  margin: 22px 0 0; max-width: 50ch; color: var(--nu-gray-2);
  font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.5; text-wrap: balance;
}
.hhv__chamada { margin-top: clamp(30px, 3.4vw, 40px); }
.hhv__aparelhos { width: 100%; margin-top: clamp(40px, 4.4vw, 56px); }

/* entrada calma: o título fica parado (é o LCP), o resto sobe junto */
.hhv__dek, .hhv__chamada, .hhv__aparelhos { animation: hhv-entra .8s cubic-bezier(.22, 1, .36, 1) backwards; }
.hhv__chamada { animation-delay: .1s; }
.hhv__aparelhos { animation-delay: .2s; }
@keyframes hhv-entra { from { opacity: 0; transform: translateY(14px); } }

@media (max-width: 960px) {
  .hhv__titulo br { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .hhv__dek, .hhv__chamada, .hhv__aparelhos { animation: none; }
}
</style>

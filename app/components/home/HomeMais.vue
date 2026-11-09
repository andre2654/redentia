<script setup lang="ts">
// "De graça, sem conta." (31/10/2026): a aba Mais do app trazida para o site.
// Uma lista calma de destinos no lugar de quatro seções que a home empilhava:
// o Explore ("Explore por onde começar."), o Tesouro Direto, as notícias e o
// carrossel do blog. Cada linha leva à página que já faz aquilo melhor que um
// resumo na home, e a home continua apontando para todas (links internos).
// A preço teto vem primeiro de propósito: é a página que traz 71% dos cliques
// orgânicos do site (GSC, 90 dias até 28/10/2026).
// O molde é o da linha do Explore que saiu (fundo claro, título 800, uma linha
// cinza, o círculo azul com a seta), só que em grade de duas colunas.
const DESTINOS = [
  { t: 'Preço teto', d: 'Quanto pagar por uma ação, por cinco métodos.', href: '/calculadora/preco-teto' },
  { t: 'Calculadoras', d: 'Juros compostos, dividendos, aposentadoria e IR.', href: '/calculadoras' },
  { t: 'Rankings', d: 'A B3 em fila: dividendos, preço, lucro e momento.', href: '/rankings' },
  { t: 'Tesouro Direto', d: 'Todos os títulos, com a taxa de hoje.', href: '/tesouro' },
  { t: 'Teses', d: 'As ideias de investimento que a IA revisa todo dia.', href: '/teses' },
  { t: 'Notícias', d: 'O que mexe com o mercado, com a leitura da IA.', href: '/noticias' },
  { t: 'Guias', d: 'Do primeiro investimento ao imposto de renda.', href: '/guias' },
  { t: 'Glossário', d: 'O mercado sem jargão.', href: '/glossario' },
] as const
</script>

<template>
  <section class="hms" aria-labelledby="hms-titulo">
    <div class="hms__cabeca">
      <h2 id="hms-titulo" class="hms__titulo">De graça, sem conta.</h2>
      <p class="hms__dek">As ferramentas abertas da Redentia, para estudar antes de investir.</p>
    </div>
    <nav class="hms__grade" aria-label="Ferramentas abertas">
      <NuxtLink v-for="x in DESTINOS" :key="x.href" :to="x.href" class="hms__linha">
        <span class="hms__texto">
          <span class="hms__nome">{{ x.t }}</span>
          <span class="hms__desc">{{ x.d }}</span>
        </span>
        <span class="hms__seta" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </span>
      </NuxtLink>
    </nav>
  </section>
</template>

<style scoped>
/* fundo branco e linhas creme: a página alterna creme e branco de cima a baixo
   (31/10/2026, a bolsa do dia passou a ser creme) */
.hms { background: var(--nu-white); padding: clamp(64px, 8.5vw, 110px) clamp(22px, 5.5vw, 80px); animation: nu-fade .5s ease both; }
.hms__titulo { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; }
.hms__dek { margin: 20px 0 0; max-width: 640px; color: var(--nu-gray); font-size: var(--nu-fs-dek); font-weight: 500; line-height: 1.55; }
.hms__grade {
  display: grid; gap: 12px; margin-top: clamp(36px, 4vw, 48px);
  grid-template-columns: repeat(auto-fit, minmax(min(420px, 100%), 1fr));
}
.hms__linha {
  display: flex; align-items: center; gap: 18px; min-height: 84px; padding: 20px 22px 20px 26px;
  border-radius: var(--nu-r-card); background: var(--nu-cream);
  transition: transform .15s ease, box-shadow .2s ease;
}
.hms__linha:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.hms__linha:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.hms__texto { flex: 1; min-width: 0; }
.hms__nome { display: block; color: var(--nu-ink); font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -.3px; }
.hms__desc { display: block; margin-top: 4px; color: var(--nu-gray); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.45; }
.hms__seta {
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: 40px; height: 40px; border-radius: 50%; background: var(--nu-blue); color: var(--nu-white);
  transition: background .2s;
}
.hms__linha:hover .hms__seta { background: var(--nu-blue-hover); }
/* no celular, a lista do Mais do app: linhas baixas, seta menor */
@media (max-width: 760px) {
  .hms__grade { gap: 8px; }
  .hms__linha { min-height: 68px; gap: 14px; padding: 14px 16px 14px 20px; border-radius: var(--nu-r-tile); }
  .hms__nome { font-size: var(--nu-fs-lg); }
  .hms__desc { margin-top: 2px; font-size: var(--nu-fs-sm); }
  .hms__seta { width: 32px; height: 32px; }
}
@media (prefers-reduced-motion: reduce) {
  .hms__linha { transition: none; }
}
</style>

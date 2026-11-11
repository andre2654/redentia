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
//
// Aportou (11/11/2026): a seção é o creme da página, com o eyebrow da marca;
// cada linha é o cartão creme do contrato (raio 28, a sombra de fio) e, ao
// passar o ponteiro, sobe 2 px, ganha a sombra de cartão flutuando e a seta
// do círculo anda 3 px. Os destinos, os textos e a ordem não mudam.
const { el: secao, revealClass } = useReveal(0.25, { soEmbeleza: true })
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
  <section ref="secao" class="hms" :class="revealClass" aria-labelledby="hms-titulo">
    <div class="hms__cabeca">
      <NuEyebrow como="p">Ferramentas abertas</NuEyebrow>
      <h2 id="hms-titulo" class="hms__titulo">De graça, sem conta.</h2>
      <p class="hms__dek">As ferramentas abertas da Aportou, para estudar antes de investir.</p>
    </div>
    <nav class="hms__grade" aria-label="Ferramentas abertas">
      <NuxtLink v-for="(x, i) in DESTINOS" :key="x.href" :to="x.href" class="hms__linha" :style="{ '--i': i }">
        <span class="hms__texto">
          <span class="hms__nome">{{ x.t }}</span>
          <span class="hms__desc">{{ x.d }}</span>
        </span>
        <span class="hms__seta" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15" /><path d="M13.5 6.5 19 12l-5.5 5.5" /></svg>
        </span>
      </NuxtLink>
    </nav>
  </section>
</template>

<style scoped>
/* o creme da página, no contêiner de 1.240 px */
.hms { background: var(--nu-page); padding: clamp(64px, 7vw, 100px) max(32px, calc((100% - 1176px) / 2)); }
.hms__titulo { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: 800; letter-spacing: -0.03em; line-height: 1.02; }
.hms__dek { margin: 20px 0 0; max-width: 620px; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: 500; line-height: 1.45; text-wrap: pretty; }
.hms__grade {
  display: grid; gap: 12px; margin-top: clamp(36px, 4vw, 44px);
  grid-template-columns: repeat(auto-fit, minmax(min(420px, 100%), 1fr));
}
/* a linha: o cartão creme do contrato, clicável */
.hms__linha {
  display: flex; align-items: center; gap: 18px; min-height: 88px; padding: 20px 22px 20px 28px;
  border-radius: var(--nu-r-card); background: var(--nu-band); box-shadow: var(--nu-shadow-quente);
  transition: transform .25s cubic-bezier(.2, .8, .2, 1), box-shadow .25s cubic-bezier(.2, .8, .2, 1);
}
.hms__linha:hover { transform: translateY(-2px); box-shadow: var(--nu-shadow-card); }
.hms__linha:active { transform: scale(.99); }
.hms__texto { flex: 1; min-width: 0; }
.hms__nome { display: block; color: var(--nu-ink); font-size: clamp(20px, 1.8vw, 24px); font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; }
.hms__desc { display: block; margin-top: 4px; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.45; }
.hms__seta {
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden;
  width: 44px; height: 44px; border-radius: 50%; background: var(--nu-blue); color: var(--nu-white);
  transition: background .2s;
}
.hms__seta svg { transition: transform .25s cubic-bezier(.2, .8, .2, 1); }
.hms__linha:hover .hms__seta { background: var(--nu-blue-hover); }
.hms__linha:hover .hms__seta svg { transform: translateX(3px); }

/* entrada: o cabeçalho e as linhas em cascata de 60 ms */
.hms.is-in .hms__cabeca, .hms.is-in .hms__linha { animation: nu-fade .5s ease backwards; }
.hms.is-in .hms__linha { animation-delay: calc(60ms * (var(--i) + 1)); }

/* no celular, a lista do Mais do app: linhas baixas, seta menor */
@media (max-width: 760px) {
  .hms { padding-inline: 20px; }
  .hms__grade { gap: 8px; }
  .hms__linha { min-height: 72px; gap: 14px; padding: 14px 16px 14px 20px; border-radius: var(--nu-r-panel); }
  .hms__nome { font-size: var(--nu-fs-lg); }
  .hms__desc { margin-top: 2px; font-size: 14.5px; }
  .hms__seta { width: 36px; height: 36px; }
}
@media (prefers-reduced-motion: reduce) {
  .hms__linha, .hms__seta svg { transition: none; }
}
</style>

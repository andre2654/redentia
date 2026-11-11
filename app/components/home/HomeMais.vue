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
// Aportou (11/11/2026): a seção é o creme da página, com o eyebrow da marca.
// Segunda rodada, no mesmo dia: as linhas viraram os cartões do quadro Home
// ("Só quer fazer uma conta? Pode."): o cartão creme (--nu-band, raio 28, a
// sombra de fio) com um ícone de traço cobalto, o nome em 800, a frase e o
// "Abrir" com a seta. Ao passar o ponteiro o cartão sobe 2 px, ganha a sombra
// de cartão flutuando e a seta anda 3 px. Os oito destinos, os textos, os
// links e a ordem são os mesmos; no celular o cartão deita (ícone, texto, seta)
// para a lista não dobrar de altura.
//
// Robustez (11/11/2026): o cartão clicável é o da base (.nu-cartao--vivo: sobe
// 2 px com a sombra de cartão erguido em 280 ms, afunda ao apertar, anel de
// foco de 3 px); o "Abrir" ganha o sublinhado que aparece, como o NuLinkSeta;
// a entrada é o v-revelar em cascata de 60 ms; a seção respira no ritmo do
// sistema, na coluna de 1.240.
// o desenho de cada ícone (traço de 2 px, 24 × 24): só os caminhos
const DESTINOS = [
  { t: 'Preço teto', d: 'Quanto pagar por uma ação, por cinco métodos.', href: '/calculadora/preco-teto', i: ['M3 5h18', 'M5.5 20v-7', 'M12 20V9.5', 'M18.5 20v-5', 'M3 20h18'] },
  { t: 'Calculadoras', d: 'Juros compostos, dividendos, aposentadoria e IR.', href: '/calculadoras', i: ['M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z', 'M8.5 7.5h7', 'M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01'] },
  { t: 'Rankings', d: 'A B3 em fila: dividendos, preço, lucro e momento.', href: '/rankings', i: ['M9 21V8h6v13', 'M9 13H3.5v8', 'M15 15.5h5.5V21', 'M2 21h20'] },
  { t: 'Tesouro Direto', d: 'Todos os títulos, com a taxa de hoje.', href: '/tesouro', i: ['M2.5 10 12 4l9.5 6Z', 'M5 21V10M9.7 21V10M14.3 21V10M19 21V10', 'M3 21h18'] },
  { t: 'Teses', d: 'As ideias de investimento que a IA revisa todo dia.', href: '/teses', i: ['M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2.2h5c.1-1 .5-1.7 1.1-2.2A6 6 0 0 0 12 3Z', 'M9.5 19h5M10.5 21.5h3'] },
  { t: 'Notícias', d: 'O que mexe com o mercado, com a leitura da IA.', href: '/noticias', i: ['M4 5h13v14H6a2 2 0 0 1-2-2V5Z', 'M17 9h3v8a2 2 0 0 1-2 2h-1', 'M7.5 9h6M7.5 12.5h6M7.5 16h3.5'] },
  { t: 'Guias', d: 'Do primeiro investimento ao imposto de renda.', href: '/guias', i: ['M12 6.5C10.5 5 8 4.5 4 4.5v13c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-13c-4 0-6.5.5-8 2Z', 'M12 6.5v13'] },
  { t: 'Glossário', d: 'O mercado sem jargão.', href: '/glossario', i: ['M3.5 18 8 6l4.5 12', 'M5.2 14h5.6', 'M16 9h4.5M16 13.5h4.5M16 18h4.5'] },
] as const
</script>

<template>
  <section class="hms" aria-labelledby="hms-titulo">
    <div v-revelar="{ alvo: 'filhos' }" class="hms__cabeca">
      <NuEyebrow como="p">Ferramentas abertas</NuEyebrow>
      <h2 id="hms-titulo" class="hms__titulo">De graça, sem conta.</h2>
      <p class="hms__dek">As ferramentas abertas da Aportou, para estudar antes de investir.</p>
    </div>
    <nav v-revelar="{ alvo: 'filhos' }" class="hms__grade" aria-label="Ferramentas abertas">
      <NuxtLink v-for="x in DESTINOS" :key="x.href" :to="x.href" class="hms__cartao nu-cartao--vivo">
        <svg class="hms__icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path v-for="d in x.i" :key="d" :d="d" /></svg>
        <span class="hms__texto">
          <span class="hms__nome">{{ x.t }}</span>
          <span class="hms__desc">{{ x.d }}</span>
        </span>
        <span class="hms__abrir">
          <span class="hms__abrir-t">Abrir</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15" /><path d="M13.5 6.5 19 12l-5.5 5.5" /></svg>
        </span>
      </NuxtLink>
    </nav>
  </section>
</template>

<style scoped>
/* o creme da página: a coluna de 1.240 px e o ritmo de seção do sistema */
.hms { background: var(--nu-page); padding: clamp(72px, 8vw, 128px) var(--nu-coluna); }
.hms__titulo { margin: 18px 0 0; color: var(--nu-ink); font-size: var(--nu-fs-h2); font-weight: var(--nu-w-display); letter-spacing: var(--nu-ls-display); line-height: 1.02; }
.hms__dek { margin: 20px 0 0; max-width: 620px; color: var(--nu-gray-3); font-size: clamp(18px, 1.5vw, 21px); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.45; text-wrap: pretty; }
.hms__grade { display: grid; gap: 16px; margin-top: clamp(40px, 4.4vw, 56px); grid-template-columns: repeat(4, minmax(0, 1fr)); }
/* o cartão creme do contrato, clicável (o movimento é o da base, .nu-cartao--vivo): ícone, nome, frase e "Abrir" */
.hms__cartao {
  display: flex; flex-direction: column; min-height: 216px; padding: clamp(24px, 2.2vw, 28px);
  border-radius: var(--nu-r-card); background: var(--nu-band); box-shadow: var(--nu-shadow-quente);
  -webkit-tap-highlight-color: transparent;
}
.hms__icone { flex: none; width: 32px; height: 32px; color: var(--nu-blue); }
.hms__texto { display: block; margin-top: 16px; min-width: 0; }
.hms__nome { display: block; color: var(--nu-ink); font-size: clamp(21px, 1.8vw, 24px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); line-height: 1.15; }
.hms__desc { display: block; margin-top: 8px; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); line-height: 1.45; text-wrap: pretty; }
.hms__abrir { display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 16px; color: var(--nu-blue-text); font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
/* o "Abrir" se comporta como o NuLinkSeta: a seta anda 3 px e o sublinhado aparece */
.hms__abrir-t {
  text-decoration-line: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px;
  text-decoration-color: transparent; transition: text-decoration-color var(--nu-dur-media) var(--nu-ease-cor);
}
.hms__abrir svg { flex: none; width: 16px; height: 16px; transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.hms__cartao:hover .hms__abrir-t { text-decoration-color: currentColor; }
.hms__cartao:hover .hms__abrir svg { transform: translateX(3px); }

@media (max-width: 1100px) {
  .hms__grade { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .hms__cartao { min-height: 0; }
}
/* no celular o cartão deita: o ícone, o texto e a seta numa linha (a lista do Mais do app) */
@media (max-width: 640px) {
  .hms__grade { grid-template-columns: minmax(0, 1fr); gap: 12px; }
  .hms__cartao { flex-direction: row; align-items: center; gap: 16px; min-height: 76px; padding: 16px 16px 16px 20px; border-radius: var(--nu-r-panel); }
  .hms__icone { width: 28px; height: 28px; }
  .hms__texto { flex: 1; margin-top: 0; }
  .hms__nome { font-size: var(--nu-fs-lg); }
  .hms__desc { margin-top: 2px; font-size: 14.5px; }
  .hms__abrir { margin-top: 0; padding-top: 0; }
  /* a palavra some da tela e fica para o leitor de tela; a seta basta */
  .hms__abrir-t { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
}
@media (prefers-reduced-motion: reduce) {
  .hms__abrir svg { transition: none; }
}
</style>

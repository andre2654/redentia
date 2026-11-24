<script setup lang="ts">
// A moldura das telas de carteira (24/11/2026, o "meio-termo" que o dono
// aprovou no canvas): o trilho da carteira à esquerda, sempre à vista, e o
// conteúdo ao lado. Vale no Início de quem tem carteira e na /carteira; as
// páginas de conteúdo (teses, ativos, guias) seguem sem trilho.
// Abaixo de 1024px o trilho sobe para o topo da página e deixa de ficar preso.
</script>

<template>
  <!-- a caixa de fora é o contêiner de consulta: com o painel do chat aberto a página encolhe e a janela não,
       então o trilho sobe para o topo pela largura da MOLDURA (24/11, o dono: "não quebrar quando abrir o menu") -->
  <div class="cmo-caixa">
    <div class="cmo">
      <aside class="cmo__trilho" aria-label="Sua carteira"><div class="cmo__preso"><slot name="trilho" /></div></aside>
      <div class="cmo__conteudo"><slot /></div>
    </div>
  </div>
</template>

<style scoped>
.cmo-caixa { container: moldura / inline-size; background: var(--nu-page); }
.cmo { display: grid; grid-template-columns: minmax(280px, 340px) minmax(0, 1fr); align-items: stretch; }
.cmo__trilho { background: var(--nu-card); border-right: 1px solid var(--nu-line-2); min-width: 0; }
/* preso abaixo da barra do topo e da faixa das seções (60 + 44 px quando a página rola) */
.cmo__preso { position: sticky; top: var(--nu-topo-altura, 112px); padding: 28px 28px 32px clamp(20px, 2.6vw, 38px); }
/* o conteúdo também é contêiner: as seções antigas, que olhavam a janela, passam a olhar a coluna (ver CarteiraVisao) */
.cmo__conteudo { min-width: 0; container: doc / inline-size; }
@container moldura (max-width: 1040px) {
  .cmo { grid-template-columns: minmax(0, 1fr); }
  .cmo__trilho { border-right: 0; border-bottom: 1px solid var(--nu-line-2); }
  .cmo__preso { position: static; padding: 22px 20px 24px; }
}
</style>

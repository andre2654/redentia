<script setup lang="ts">
// A moldura das telas de carteira (24/11/2026, o "meio-termo" que o dono
// aprovou no canvas): o trilho da carteira à esquerda, sempre à vista, e o
// conteúdo ao lado. Vale no Início de quem tem carteira e na /carteira; as
// páginas de conteúdo (teses, ativos, guias) seguem sem trilho.
// Abaixo de 1024px o trilho sobe para o topo da página e deixa de ficar preso.
</script>

<template>
  <div class="cmo">
    <aside class="cmo__trilho" aria-label="Sua carteira"><div class="cmo__preso"><slot name="trilho" /></div></aside>
    <div class="cmo__conteudo"><slot /></div>
  </div>
</template>

<style scoped>
.cmo { display: grid; grid-template-columns: minmax(300px, 340px) minmax(0, 1fr); align-items: stretch; background: var(--nu-page); }
.cmo__trilho { background: var(--nu-card); border-right: 1px solid var(--nu-line-2); }
/* preso abaixo da barra do topo e da faixa das seções (60 + 44 px quando a página rola) */
.cmo__preso { position: sticky; top: var(--nu-topo-altura, 112px); padding: 28px 28px 32px clamp(20px, 2.6vw, 38px); }
.cmo__conteudo { min-width: 0; }
@media (max-width: 1023px) {
  .cmo { grid-template-columns: minmax(0, 1fr); }
  .cmo__trilho { border-right: 0; border-bottom: 1px solid var(--nu-line-2); }
  .cmo__preso { position: static; padding: 22px 20px 24px; }
}
</style>

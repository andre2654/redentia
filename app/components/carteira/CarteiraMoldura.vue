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
/* A moldura mora na MESMA coluna do topo do site (1240px centrada, a --nu-coluna): o trilho começa onde começa o
   logo e o conteúdo termina onde termina o avatar (24/11, o dono: "ainda não está tão polido quanto no canvas";
   o trilho encostava na borda da janela enquanto o topo ficava centrado). O trilho não tem fundo próprio: um fio
   o separa do conteúdo, e a página é uma superfície só.
   --cmo-g é o respiro entre o fio e o conteúdo; as seções leem o mesmo valor em --cvi-g. */
.cmo {
  --cmo-borda: max(clamp(20px, 5.5cqi, 80px), calc((100cqi - 1240px) / 2));
  --cmo-g: 40px; --cvi-g: 40px;
  display: grid; grid-template-columns: 320px minmax(0, 1fr); align-items: stretch; padding-inline: var(--cmo-borda);
}
.cmo__trilho { border-right: 1px solid var(--nu-line-2); min-width: 0; }
/* preso logo abaixo da barra do topo (a --nuh-h que o NuHeader põe no <html>); a faixa de baixo dela saiu destas telas */
.cmo__preso { position: sticky; top: var(--nuh-h, 72px); padding: 32px 28px 32px 0; }
/* o conteúdo também é contêiner: as seções antigas, que olhavam a janela, passam a olhar a coluna (ver CarteiraVisao).
   A margem negativa devolve o respiro da direita: a borda das seções encosta na borda da coluna do topo */
.cmo__conteudo { min-width: 0; margin-right: calc(-1 * var(--cmo-g)); container: doc / inline-size; }
@container moldura (max-width: 1040px) {
  .cmo { --cmo-g: 20px; --cvi-g: 20px; grid-template-columns: minmax(0, 1fr); padding-inline: 0; }
  .cmo__trilho { border-right: 0; border-bottom: 1px solid var(--nu-line-2); background: var(--nu-card); }
  .cmo__preso { position: static; padding: 22px 20px 24px; }
  .cmo__conteudo { margin-right: 0; }
}
</style>

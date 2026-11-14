<script setup lang="ts">
// A pílula "Perguntar à IA" ao lado do FAQ das calculadoras (Aportou,
// 11/11/2026). Era "Perguntar à Redentia AI", uma pílula azul repetida em
// cada página com o próprio CSS (jc__pill, dy__pill, ap__pill…). Agora é uma
// peça só: carvão, com o corte azul do "t" na frente, que é o sinal da IA da
// Aportou. Abre o painel do chat aqui mesmo (11/11/2026; antes levava à
// /busca, que deixou de ser onde se conversa em 02/11).
// Robustez (11/11/2026): movimento e peso só por token; o corte anda 3px sob o
// ponteiro, como a seta do NuLinkSeta.
const painel = useChatPainel()
</script>

<template>
  <button type="button" class="cpi" @click="painel.abrir()">
    <MarcaCorte :largura="20" cor="var(--nu-blue-on-dark)" />
    <span>Perguntar à IA</span>
  </button>
</template>

<style scoped>
.cpi {
  display: inline-flex; align-items: center; gap: 11px; min-height: 48px; margin-top: 32px; padding: 0 22px 0 18px;
  border: 0; font-family: inherit; cursor: pointer;
  border-radius: var(--nu-r-pill); background: var(--nu-ink); color: var(--nu-white);
  font-size: 15.5px; font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.cpi:hover { background: var(--nu-ink-hover); color: var(--nu-white); }
.cpi:active { transform: scale(.98); }
.cpi :deep(.mkc) { transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.cpi:hover :deep(.mkc) { transform: translateX(3px); }
</style>

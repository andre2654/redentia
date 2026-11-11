<script setup lang="ts">
// A pílula "Perguntar à IA" ao lado do FAQ das calculadoras (Aportou,
// 11/11/2026). Era "Perguntar à Redentia AI", uma pílula azul repetida em
// cada página com o próprio CSS (jc__pill, dy__pill, ap__pill…). Agora é uma
// peça só: carvão, com o corte azul do "t" na frente, que é o sinal da IA da
// Aportou. Abre o painel do chat aqui mesmo (11/11/2026; antes levava à
// /busca, que deixou de ser onde se conversa em 02/11).
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
  display: inline-flex; align-items: center; gap: 11px; min-height: 52px; margin-top: 30px; padding: 0 24px 0 20px;
  border: 0; font-family: inherit; cursor: pointer;
  border-radius: var(--nu-r-pill); background: var(--nu-ink); color: var(--nu-white);
  font-size: 16.5px; font-weight: 700; white-space: nowrap;
  transition: background .2s, transform .15s cubic-bezier(.2, .8, .2, 1);
}
.cpi:hover { background: var(--nu-ink-hover); color: var(--nu-white); }
.cpi:active { transform: scale(.98); }
.cpi :deep(.mkc) { transition: transform .25s cubic-bezier(.2, .8, .2, 1); }
.cpi:hover :deep(.mkc) { transform: translateX(3px); }
</style>

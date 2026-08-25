<script setup lang="ts">
// PROTÓTIPO /simulacao — o marcador de IR (dono, 25/08: "tirar um pouco de
// informação"): em vez de badge textual, uma bolsinha de dinheiro com "IR"
// SÓ nos ativos tributados; o detalhe vive no tooltip (hover/focus).
// Isentos ficam limpos — a ausência do símbolo é a informação.
defineProps<{ text: string }>()
</script>

<template>
  <span class="stm" tabindex="0" role="img" :aria-label="text">
    <svg class="stm__bag" width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9.2 6.2 7.4 3.4h9.2l-1.8 2.8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9.2 6.2h5.6c2.9 1.8 4.7 4.6 4.7 7.8 0 4-2.9 6.6-7.5 6.6S4.5 18 4.5 14c0-3.2 1.8-6 4.7-7.8Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" />
      <text x="12" y="16.4" text-anchor="middle" font-size="7.2" font-weight="800" fill="currentColor" font-family="inherit">IR</text>
    </svg>
    <span class="stm__tip" role="tooltip">{{ text }}</span>
  </span>
</template>

<style scoped>
.stm {
  position: relative; display: inline-flex; align-items: center; flex-shrink: 0;
  color: var(--nu-sand); outline: none; cursor: help;
  transition: color 0.15s;
}
.stm:hover, .stm:focus { color: var(--nu-gray-2); }
.stm__bag { display: block; }
.stm__tip {
  position: absolute; bottom: calc(100% + 7px); left: 50%; transform: translate(-50%, 3px);
  background: var(--nu-ink); color: var(--nu-white);
  font-size: 11.5px; font-weight: 700; line-height: 1.4; white-space: nowrap;
  padding: 7px 11px; border-radius: 9px;
  box-shadow: var(--nu-shadow-card);
  opacity: 0; pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
  z-index: 30;
}
.stm:hover .stm__tip, .stm:focus .stm__tip { opacity: 1; transform: translate(-50%, 0); }
</style>

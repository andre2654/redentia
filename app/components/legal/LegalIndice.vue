<script setup lang="ts">
// O sumário do celular e do tablet. O índice lateral (NuTocSidebar) some abaixo
// de 1080px; aqui o MESMO sumário (mesmas âncoras, mesmos rótulos) abre no topo
// da leitura, fechado, num cartão creme com o corte. Acima de 1080px não
// aparece. Usado nos documentos legais, na metodologia e nos guias.
withDefaults(defineProps<{
  items: { label: string; targetId: string }[]
  rotulo?: string
}>(), { rotulo: 'Nesta página' })
</script>

<template>
  <details class="lgi">
    <summary class="lgi__topo">
      <span class="lgi__rotulo"><MarcaCorte :largura="18" />{{ rotulo }}</span>
      <span class="lgi__mais" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg></span>
    </summary>
    <ol class="lgi__lista">
      <li v-for="it in items" :key="it.targetId"><a :href="`#${it.targetId}`">{{ it.label }}</a></li>
    </ol>
  </details>
</template>

<style scoped>
.lgi { display: none; }
@media (max-width: 1080px) {
  .lgi {
    display: block; margin-bottom: clamp(32px, 6vw, 44px); border-radius: var(--nu-r-panel);
    background: var(--nu-card); box-shadow: var(--nu-shadow-quente);
  }
  .lgi__topo {
    display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 60px; padding: 0 14px 0 20px;
    list-style: none; cursor: pointer; border-radius: var(--nu-r-panel);
  }
  .lgi__topo::-webkit-details-marker { display: none; }
  .lgi__rotulo {
    display: inline-flex; align-items: center; gap: 9px; color: var(--nu-ink);
    font-size: var(--nu-fs-marca); font-weight: var(--nu-w-medio); letter-spacing: 0.16em; text-transform: uppercase;
  }
  .lgi__mais {
    display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; flex-shrink: 0;
    border-radius: 50%; background: var(--nu-ink); color: var(--nu-white); transition: transform .25s var(--nu-ease-saida);
  }
  .lgi__mais svg { width: 15px; height: 15px; }
  .lgi[open] .lgi__mais { transform: rotate(45deg); }
  .lgi__lista { list-style: none; margin: 0; padding: 0 20px 10px; animation: nu-fade .3s ease both; }
  .lgi__lista li { border-top: 1px solid var(--nu-line-2); }
  .lgi__lista a {
    display: flex; align-items: center; min-height: 48px; padding: 8px 0; color: var(--nu-ink);
    font-size: var(--nu-fs-md); font-weight: 600; line-height: 1.35; text-decoration: none; transition: color .2s;
  }
  .lgi__lista a:hover { color: var(--nu-blue-text); }
}
@media (prefers-reduced-motion: reduce) { .lgi__lista, .lgi__mais { animation: none; transition: none; } }
</style>

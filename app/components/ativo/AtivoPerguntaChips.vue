<script setup lang="ts">
// No lugar do "Perguntar à Redentia AI" do topo (que repetia a barra fixa do
// rodapé): perguntas prontas sobre ESTE ativo, que abrem o painel do chat com
// o ativo já anexado (useAtivoDirecao.perguntar). São botões: sem JS, a barra
// do rodapé continua lá.
withDefaults(defineProps<{ perguntas: string[]; tom?: 'claro' | 'escuro'; rotulo?: string | null }>(), { tom: 'claro', rotulo: 'Pergunte à Redentia' })
const emit = defineEmits<{ perguntar: [string] }>()
</script>

<template>
  <div v-if="perguntas.length" class="apc" :class="`apc--${tom}`">
    <p v-if="rotulo" class="apc__r">{{ rotulo }}</p>
    <ul class="apc__lista">
      <li v-for="q in perguntas" :key="q">
        <button type="button" class="apc__q" @click="emit('perguntar', q)">
          <img src="/logo-azul.svg" alt="" width="14" height="14" class="apc__logo">
          <span>{{ q }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.apc__r { margin: 0 0 10px; font-size: var(--nu-fs-sm); font-weight: 600; }
.apc--claro .apc__r { color: var(--nu-gray); }
.apc--escuro .apc__r { color: var(--nu-agora-sub); }
.apc__lista { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.apc__q {
  display: inline-flex; align-items: center; gap: 9px; min-height: 40px; padding: 8px 16px 8px 12px; border: 0; border-radius: var(--nu-r-pill);
  font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; text-align: left; cursor: pointer; font-variant-numeric: tabular-nums;
  transition: background .2s ease, box-shadow .2s ease, transform .45s cubic-bezier(.34, 1.56, .64, 1);
}
.apc__q:hover { transform: translateY(-2px); }
.apc__q:active { transform: scale(.97); }
.apc__q:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.apc__logo { flex-shrink: 0; display: block; }
.apc--claro .apc__q { background: var(--nu-white); color: var(--nu-ink); box-shadow: 0 0 0 1px var(--nu-cream-line); }
.apc--claro .apc__q:hover { box-shadow: 0 0 0 1px var(--nu-blue-30), 0 10px 24px -14px var(--nu-blue-28); }
.apc--escuro .apc__q { background: var(--nu-agora-pilula); color: var(--nu-agora-texto); box-shadow: inset 0 0 0 1px var(--nu-agora-linha); }
.apc--escuro .apc__q:hover { background: var(--nu-white-18); }
.apc--escuro .apc__logo { filter: brightness(0) invert(1); opacity: .9; }
@media (prefers-reduced-motion: reduce) { .apc__q { transition: none; } .apc__q:hover, .apc__q:active { transform: none; } }
</style>

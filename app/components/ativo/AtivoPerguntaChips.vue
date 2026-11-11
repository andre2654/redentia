<script setup lang="ts">
// No lugar do "Perguntar à Redentia AI" do topo (que repetia a barra fixa do
// rodapé): perguntas prontas sobre ESTE ativo, que abrem o painel do chat com
// o ativo já anexado (useAtivoDirecao.perguntar). São botões: sem JS, a barra
// do rodapé continua lá.
withDefaults(defineProps<{ perguntas: string[]; tom?: 'claro' | 'escuro'; rotulo?: string | null }>(), { tom: 'claro', rotulo: 'Pergunte à Aportou' })
const emit = defineEmits<{ perguntar: [string] }>()
</script>

<template>
  <div v-if="perguntas.length" class="apc" :class="`apc--${tom}`">
    <p v-if="rotulo" class="apc__r">{{ rotulo }}</p>
    <ul class="apc__lista">
      <li v-for="q in perguntas" :key="q">
        <button type="button" class="apc__q" @click="emit('perguntar', q)">
          <MarcaCorte :largura="18" :cor="tom === 'escuro' ? 'var(--nu-blue-on-dark)' : 'var(--nu-blue)'" class="apc__logo" />
          <span>{{ q }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* o chip de sugestão da Aportou: o corte azul + a pergunta, 44px de toque.
   Robustez (11/11/2026): tempos e curvas dos tokens; o corte anda 2px quando o
   ponteiro chega (o chip diz "clique aqui" sem mudar de cor demais). */
.apc__r { margin: 0 0 12px; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.apc--claro .apc__r { color: var(--nu-gray); }
.apc--escuro .apc__r { color: var(--nu-agora-sub); }
.apc__lista { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.apc__q {
  display: inline-flex; align-items: center; gap: 10px; min-height: 44px; padding: 8px 18px 8px 14px; border: 0; border-radius: var(--nu-r-pill);
  font: inherit; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); text-align: left; cursor: pointer; font-variant-numeric: tabular-nums;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), box-shadow var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.apc__q:active { transform: scale(.98); }
.apc__logo { flex-shrink: 0; transition: transform var(--nu-dur-media) var(--nu-ease-saida); }
.apc__q:hover .apc__logo { transform: translateX(2px); }
.apc--claro .apc__q { background: var(--nu-white); color: var(--nu-ink); box-shadow: var(--nu-shadow-branco); }
.apc--claro .apc__q:hover { background: var(--nu-cream-2); box-shadow: var(--nu-shadow-quente); }
.apc--escuro .apc__q { background: var(--nu-agora-pilula); color: var(--nu-agora-texto); box-shadow: inset 0 0 0 1px var(--nu-agora-linha); }
.apc--escuro .apc__q:hover { background: var(--nu-white-18); }
.apc--escuro .apc__q:focus-visible { outline-color: var(--nu-blue-on-dark); }
@media (prefers-reduced-motion: reduce) { .apc__q, .apc__logo { transition: none; } .apc__q:active, .apc__q:hover .apc__logo { transform: none; } }
</style>

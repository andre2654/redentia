<script setup lang="ts">
/**
 * Um turno da conversa no assistente da mesa (04/11/2026): a pergunta do
 * assessor no balão e, embaixo, a resposta. A resposta é texto (`resposta`),
 * uma tela do Redentia MCP (slot) ou os dois. Quando `tocar` liga, a resposta
 * surge palavra por palavra, do desfoque, no ritmo do chat do site
 * (utils/revelar-palavras.ts: 38 ms entre palavras, a fila nunca passa de
 * 900 ms, 520 ms por palavra). No servidor e sem movimento, o texto está
 * inteiro.
 */
const props = withDefaults(defineProps<{ pergunta: string; resposta?: string; fonte?: string; tocar?: boolean }>(), { resposta: '', fonte: '', tocar: false })

const palavras = computed(() => props.resposta.split(/\s+/).filter(Boolean))
const atraso = (i: number) => `${Math.round(Math.min(i * 38, 900) + 350)}ms`
</script>

<template>
  <div class="bcv" :class="{ 'bcv--tocar': tocar }">
    <p class="bcv__pergunta">{{ pergunta }}</p>
    <div class="bcv__resposta">
      <p v-if="resposta" class="bcv__texto"><template v-for="(w, i) in palavras" :key="i"><span class="bcv__p" :style="{ animationDelay: atraso(i) }">{{ w }}</span>{{ ' ' }}</template></p>
      <p v-if="fonte" class="bcv__fonte">{{ fonte }}</p>
      <div v-if="$slots.default" class="bcv__tela"><slot /></div>
    </div>
  </div>
</template>

<style scoped>
.bcv { display: flex; flex-direction: column; gap: 14px; padding: 18px 18px 6px; }
.bcv__pergunta {
  align-self: flex-end; max-width: 82%; margin: 0; padding: 11px 16px; border-radius: 20px 20px 6px 20px;
  background: var(--nu-tela-bloco); color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.45;
}
.bcv__resposta { display: flex; flex-direction: column; gap: 10px; }
.bcv__texto { margin: 0; color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.6; }
.bcv__fonte { margin: 0; color: var(--nu-tela-nota); font-size: var(--nu-fs-xs); font-weight: 500; }
.bcv__tela { background: var(--nu-white); }
.bcv--tocar .bcv__p { display: inline-block; animation: nu-palavra .52s cubic-bezier(.22, 1, .36, 1) backwards; }
.bcv--tocar .bcv__tela { animation: bcv-tela .6s cubic-bezier(.2, .8, .2, 1) backwards .3s; }
@keyframes bcv-tela { from { opacity: 0; transform: translateY(10px); } }
@media (prefers-reduced-motion: reduce) { .bcv * { animation: none !important; } }
</style>

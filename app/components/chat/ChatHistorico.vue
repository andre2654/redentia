<script setup lang="ts">
// O histórico dentro do painel (02/11/2026): a lógica do BuscaHistoryDrawer
// (lista do banco, item ativo, lixeira por item), agora como uma vista do
// próprio painel em vez de uma gaveta por cima da página. Carregando é
// esqueleto com a forma do item, nunca spinner.
// Robustez (11/11/2026): a lista entra em cascata de 60ms nos tempos dos
// tokens; a lixeira aparece no hover e no foco do item; o vazio diz o próximo passo.
import type { NuChatSession } from '~/composables/useNuChat'

const props = defineProps<{
  sessions: NuChatSession[]
  carregando: boolean
  ativaId: string | null
}>()
const emit = defineEmits<{
  (e: 'abrir', id: string): void
  (e: 'apagar', id: string): void
}>()

function tituloDe(s: NuChatSession): string {
  return (s.title ?? '').trim() || 'Conversa sem título'
}
const vazio = computed(() => !props.carregando && props.sessions.length === 0)
</script>

<template>
  <div class="chi">
    <p class="chi__titulo nu-eyebrow"><MarcaCorte :largura="22" />Conversas</p>
    <div v-if="carregando && !sessions.length" class="chi__lista" aria-hidden="true">
      <div v-for="k in 5" :key="k" class="chi__sk">
        <NuSkeleton variant="line" height="13px" :width="k % 2 ? '78%' : '62%'" radius="pill" />
        <NuSkeleton variant="line" height="10px" width="72px" radius="pill" />
      </div>
    </div>
    <p v-else-if="vazio" class="chi__vazio">Nenhuma conversa ainda. A primeira pergunta abre uma.</p>
    <ul v-else class="chi__lista">
      <li v-for="(s, k) in sessions" :key="s.id" class="chi__item-wrap" :style="{ '--k': Math.min(k, 8) }">
        <button
          type="button" class="chi__item" :class="{ 'chi__item--ativa': s.id === ativaId }"
          :aria-current="s.id === ativaId ? 'true' : undefined" @click="emit('abrir', s.id)"
        >
          <span class="chi__item-titulo">{{ tituloDe(s) }}</span>
          <span class="chi__item-meta">{{ relAgo(s.updatedAt) }}</span>
        </button>
        <button type="button" class="chi__apagar" :aria-label="`Apagar a conversa ${tituloDe(s)}`" @click="emit('apagar', s.id)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.chi { padding: 8px 4px 24px; animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both; }
.chi__titulo { margin: 0 0 16px; }
.chi__lista { list-style: none; margin: 0 -4px; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.chi__sk { display: flex; flex-direction: column; gap: 8px; padding: 14px 14px; }
.chi__vazio { margin: 8px 0 0; color: var(--nu-gray-3); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); line-height: 1.5; }
/* as conversas entram em cascata */
.chi__item-wrap { position: relative; animation: nu-fade var(--nu-dur-lenta) var(--nu-ease-saida) both; animation-delay: calc(var(--k, 0) * 60ms); }
.chi__item {
  display: block; width: 100%; text-align: left; padding: 12px 52px 12px 16px; border: 0; border-radius: var(--nu-r-tile);
  background: transparent; cursor: pointer; font: inherit;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), box-shadow var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.chi__item:active { transform: scale(.99); }
.chi__item:hover { background: var(--nu-cream-2); }
.chi__item:focus-visible { outline-offset: -3px; }
/* a conversa aberta: o cartão branco com o fio, marcado pelo cobalto */
.chi__item--ativa, .chi__item--ativa:hover { background: var(--nu-white); box-shadow: inset 0 0 0 1px var(--nu-line-2), inset 3px 0 0 var(--nu-blue); }
.chi__item-titulo {
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  color: var(--nu-ink); font-size: 15px; font-weight: var(--nu-w-medio); line-height: 1.35;
}
.chi__item-meta { display: block; margin-top: 3px; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-texto); }
.chi__apagar {
  position: absolute; top: 50%; right: 6px; width: 40px; height: 40px; transform: translateY(-50%);
  border: 0; border-radius: 50%; padding: 0; background: transparent; color: var(--nu-gray); cursor: pointer;
  display: grid; place-items: center; opacity: 0;
  transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor), background-color var(--nu-dur-rapida) var(--nu-ease-cor), color var(--nu-dur-rapida) var(--nu-ease-cor);
}
.chi__item-wrap:hover .chi__apagar, .chi__item-wrap:focus-within .chi__apagar, .chi__apagar:focus-visible { opacity: 1; }
.chi__apagar:hover { background: var(--nu-red-bg); color: var(--nu-red-text); }
@media (hover: none) { .chi__apagar { opacity: 1; } }
</style>

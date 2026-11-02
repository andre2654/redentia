<script setup lang="ts">
// O histórico dentro do painel (02/11/2026): a lógica do BuscaHistoryDrawer
// (lista do banco, item ativo, lixeira por item), agora como uma vista do
// próprio painel em vez de uma gaveta por cima da página. Carregando é
// esqueleto com a forma do item, nunca spinner.
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
    <p class="chi__titulo">Conversas</p>
    <div v-if="carregando && !sessions.length" class="chi__lista" aria-hidden="true">
      <div v-for="k in 5" :key="k" class="chi__sk">
        <NuSkeleton variant="line" height="13px" :width="k % 2 ? '78%' : '62%'" radius="pill" />
        <NuSkeleton variant="line" height="10px" width="72px" radius="pill" />
      </div>
    </div>
    <p v-else-if="vazio" class="chi__vazio">Nenhuma conversa ainda. A primeira pergunta abre uma.</p>
    <ul v-else class="chi__lista">
      <li v-for="s in sessions" :key="s.id" class="chi__item-wrap">
        <button
          type="button" class="chi__item" :class="{ 'chi__item--ativa': s.id === ativaId }"
          :aria-current="s.id === ativaId ? 'true' : undefined" @click="emit('abrir', s.id)"
        >
          <span class="chi__item-titulo">{{ tituloDe(s) }}</span>
          <span class="chi__item-meta">{{ relAgo(s.updatedAt) }}</span>
        </button>
        <button type="button" class="chi__apagar" :aria-label="`Apagar a conversa ${tituloDe(s)}`" @click="emit('apagar', s.id)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.chi { padding: 4px 0 24px; animation: nu-fade .3s ease both; }
.chi__titulo { margin: 0 0 10px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.chi__lista { list-style: none; margin: 0 -10px; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.chi__sk { display: flex; flex-direction: column; gap: 8px; padding: 14px 10px; }
.chi__vazio { margin: 8px 0 0; color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 500; line-height: 1.5; }
.chi__item-wrap { position: relative; }
.chi__item {
  display: block; width: 100%; text-align: left; padding: 12px 44px 12px 10px; border: 0; border-radius: 14px;
  background: transparent; cursor: pointer; font: inherit; transition: background .15s ease;
}
.chi__item:hover { background: var(--nu-cream); }
.chi__item:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: -2px; }
.chi__item--ativa { background: var(--nu-cream); }
.chi__item-titulo {
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 700; line-height: 1.4;
}
.chi__item-meta { display: block; margin-top: 3px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 500; }
.chi__apagar {
  position: absolute; top: 50%; right: 6px; width: 32px; height: 32px; transform: translateY(-50%);
  border: 0; border-radius: 50%; background: transparent; color: var(--nu-gray); cursor: pointer;
  display: grid; place-items: center; opacity: 0; transition: opacity .15s, background .15s, color .15s;
}
.chi__item-wrap:hover .chi__apagar, .chi__apagar:focus-visible { opacity: 1; }
.chi__apagar:hover { background: var(--nu-navy-07); color: var(--nu-red-text); }
.chi__apagar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 1px; }
@media (hover: none) { .chi__apagar { opacity: 1; } }
</style>

<script setup lang="ts">
// Drawer de histórico — overlay (nu-qveil) + painel 390px pela direita
// (nu-qslide), lista de conversas do banco (fonte de verdade), item ativo
// destacado, lixeira por item e CTA "Nova conversa".
// Contrato de UX: Redentia Busca Nu.dc.html (linhas 118-150).
import type { NuChatSession } from '~/composables/useNuChat'

const props = defineProps<{
  open: boolean
  sessions: NuChatSession[]
  activeId: string | null
}>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'nova'): void
  (e: 'open-session', id: string): void
  (e: 'delete-session', id: string): void
}>()

const countLabel = computed(() => {
  const n = props.sessions.length
  return `${n} ${n === 1 ? 'conversa' : 'conversas'}`
})

function titleOf(s: NuChatSession): string {
  return (s.title ?? '').trim() || 'Conversa sem título'
}
</script>

<template>
  <Teleport to="body">
    <template v-if="props.open">
      <div class="bhd-veil" aria-hidden="true" @click="emit('close')" />
      <div id="busca-hist-drawer" class="bhd" role="dialog" aria-modal="true" aria-label="Histórico de conversas">
        <div class="bhd__head">
          <span>
            <span class="bhd__title">Histórico</span>
            <span class="bhd__count">{{ countLabel }}</span>
          </span>
          <button type="button" class="bhd__close" aria-label="Fechar histórico" @click="emit('close')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>
        </div>

        <div class="bhd__cta-wrap">
          <button type="button" class="bhd__cta" @click="emit('nova')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            Nova conversa
          </button>
        </div>

        <div class="bhd__list">
          <div v-for="s in props.sessions" :key="s.id" class="bhd__item-wrap">
            <button
              type="button" class="bhd__item" :class="{ 'bhd__item--active': s.id === props.activeId }"
              @click="emit('open-session', s.id)"
            >
              <span class="bhd__item-title">{{ titleOf(s) }}</span>
              <span class="bhd__item-meta">{{ relAgo(s.updatedAt) }}</span>
            </button>
            <button
              type="button" class="bhd__del" title="Apagar conversa" aria-label="Apagar conversa"
              @click="emit('delete-session', s.id)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
            </button>
          </div>
        </div>
      </div>
    </template>
  </Teleport>
</template>

<style scoped>
.bhd-veil {
  position: fixed; inset: 0; background: var(--nu-veil); z-index: 60;
  animation: nu-qveil .2s ease both;
}
.bhd {
  position: fixed; top: 0; right: 0; bottom: 0; width: min(390px, 94vw);
  background: var(--nu-cream); z-index: 61;
  display: flex; flex-direction: column;
  animation: nu-qslide .3s cubic-bezier(.2, .8, .2, 1) both;
  box-shadow: var(--nu-shadow-drawer);
}
@keyframes nu-qveil { from { opacity: 0; } to { opacity: 1; } }
@keyframes nu-qslide { from { transform: translateX(60px); opacity: 0; } to { transform: none; opacity: 1; } }

.bhd__head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 24px 24px 6px; }
.bhd__title { display: block; color: var(--nu-navy); font-size: 20px; font-weight: 800; letter-spacing: -0.3px; }
.bhd__count { display: block; color: var(--nu-gray-hist); font-size: 12.5px; font-weight: 600; margin-top: 3px; }
.bhd__close {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--nu-navy-07); border: none; color: var(--nu-navy);
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: background .2s;
}
.bhd__close:hover { background: var(--nu-navy-14); }
.bhd__close:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.bhd__cta-wrap { padding: 14px 24px 16px; }
.bhd__cta {
  display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
  background: var(--nu-blue); color: var(--nu-white); border: none;
  border-radius: var(--nu-r-pill); padding: 13px 18px;
  font-size: 14px; font-weight: 800; cursor: pointer; transition: background .2s;
}
.bhd__cta:hover { background: var(--nu-blue-hover-3); }
.bhd__cta:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.bhd__list {
  flex: 1; overflow-y: auto; padding: 2px 16px 24px;
  display: flex; flex-direction: column; gap: 4px;
}
.bhd__item-wrap { position: relative; }
.bhd__item {
  display: block; width: 100%; text-align: left;
  padding: 12px 42px 12px 14px; border-radius: 14px; cursor: pointer;
  border: 1.5px solid transparent; background: transparent;
  transition: background .2s;
}
.bhd__item:hover { background: var(--nu-white); }
.bhd__item:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.bhd__item--active {
  border-color: var(--nu-blue); background: var(--nu-white);
  box-shadow: var(--nu-shadow-hist-active);
}
.bhd__item--active:hover { background: var(--nu-white); }
.bhd__item-title {
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  color: var(--nu-navy); font-size: 14px; font-weight: 700; line-height: 1.45;
}
.bhd__item-meta { display: block; color: var(--nu-gray-hist); font-size: 12px; font-weight: 600; margin-top: 4px; }
.bhd__del {
  position: absolute; top: 12px; right: 10px; width: 28px; height: 28px;
  border-radius: 50%; background: transparent; border: none; color: var(--nu-gray-hist);
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: background .2s;
}
.bhd__del:hover { background: var(--nu-navy-09); }
.bhd__del:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  .bhd, .bhd-veil { animation: none; }
}
</style>

<script setup lang="ts">
/**
 * O termo de compartilhamento inteiro, aberto pelo link do rodapé da tela de
 * boas-vindas (como o "Termos e condições" do Pluggy abre em cima do
 * widget). Folha de baixo no mobile, modal centrado no desktop. O texto vem
 * do servidor (C5, versão `terms_version`) e é renderizado como TEXTO, nunca
 * v-html. Trap de Tab e restauração de foco pelo useModalA11y; Escape fecha.
 */
const props = defineProps<{ open: boolean, texto: string, versao: string }>()
const emit = defineEmits<{ close: [] }>()

const cardRef = ref<HTMLElement | null>(null)
useModalA11y(cardRef, toRef(props, 'open'))
const titleId = useId()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.stopPropagation()
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="cct" @click="emit('close')">
      <div ref="cardRef" class="cct__card" role="dialog" aria-modal="true" :aria-labelledby="titleId" tabindex="-1" @click.stop @keydown="onKey">
        <header class="cct__head">
          <div>
            <h2 :id="titleId" class="cct__h2">Termos de compartilhamento</h2>
            <span class="cct__v">versão {{ versao }}</span>
          </div>
          <button type="button" class="cct__fechar" aria-label="Fechar" @click="emit('close')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </header>
        <div class="cct__texto">{{ texto }}</div>
        <footer class="cct__foot">
          <ClienteConnectButton variant="ghost" @click="emit('close')">Fechar</ClienteConnectButton>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.cct {
  position: fixed; inset: 0; z-index: 60; display: flex; align-items: center; justify-content: center;
  padding: 24px; background: var(--nu-ink-75); animation: cct-fade .2s ease both;
}
@keyframes cct-fade { from { opacity: 0; } to { opacity: 1; } }
.cct__card {
  width: 100%; max-width: 560px; max-height: min(80vh, 760px); display: flex; flex-direction: column;
  background: var(--nu-white); border-radius: 18px; box-shadow: var(--nu-shadow-float); outline: none;
  animation: cct-sobe .26s cubic-bezier(.2, .8, .2, 1) both;
}
@keyframes cct-sobe { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.cct__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 18px 18px 12px 22px; border-bottom: 1px solid var(--nu-cream-2); }
.cct__h2 { margin: 0; color: var(--nu-ink); font-size: 16px; font-weight: 800; letter-spacing: -.02em; }
.cct__v { display: block; margin-top: 2px; color: var(--nu-gray); font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; }
.cct__fechar {
  width: 36px; height: 36px; flex-shrink: 0; border: none; border-radius: 10px; background: transparent; color: var(--nu-ink);
  display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: background .2s;
}
.cct__fechar:hover { background: var(--nu-cream); }
.cct__fechar:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.cct__texto {
  flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 16px 22px; white-space: pre-wrap; overflow-wrap: anywhere;
  color: var(--nu-gray-3); font-size: 13.5px; font-weight: 500; line-height: 1.6;
}
.cct__foot { padding: 12px 18px calc(16px + env(safe-area-inset-bottom)); border-top: 1px solid var(--nu-cream-2); }

@media (max-width: 500px) {
  .cct { padding: 0; align-items: flex-end; }
  .cct__card { max-width: none; max-height: 92vh; max-height: 92dvh; border-radius: 18px 18px 0 0; animation-name: cct-folha; }
  @keyframes cct-folha { from { transform: translateY(100%); } to { transform: none; } }
}
</style>

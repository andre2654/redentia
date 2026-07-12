<script setup lang="ts">
// Composer sticky do chat — pill branca sobre gradiente de fade + disclaimer
// legal OBRIGATÓRIO. Enviar fica bloqueado durante o streaming (padrão do
// design: sendMsg early-return com typing).
// Contrato de UX: Redentia Busca Nu.dc.html (linhas 204-212).
const props = defineProps<{
  modelValue: string
  /** streaming ativo — envio bloqueado */
  disabled: boolean
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'send'): void
}>()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' && !props.disabled) emit('send')
}
</script>

<template>
  <div class="bcc">
    <div class="bcc__pill">
      <input
        type="text"
        class="bcc__input"
        :value="props.modelValue"
        placeholder="Pergunte à Redentia AI…"
        aria-label="Pergunte à Redentia AI"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @keydown="onKey"
      >
      <button
        type="button" class="bcc__send" aria-label="Enviar mensagem"
        :disabled="props.disabled" @click="emit('send')"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
      </button>
    </div>
    <div class="bcc__disclaimer">Respostas geradas por IA — não são recomendação de investimento.</div>
  </div>
</template>

<style scoped>
.bcc {
  position: sticky; bottom: 0;
  padding: 14px clamp(22px, 4vw, 40px) 20px;
  background: var(--nu-chat-fade);
}
.bcc__pill {
  max-width: 880px; margin: 0 auto;
  display: flex; align-items: center; gap: 10px;
  background: var(--nu-white); border-radius: var(--nu-r-pill);
  padding: 7px 7px 7px 24px;
}
.bcc__input {
  flex: 1; min-width: 0; background: transparent; border: none; outline: none;
  color: var(--nu-ink); font-size: 15.5px; font-weight: 600; padding: 11px 0;
}
.bcc__input::placeholder { color: var(--nu-sand); font-weight: 500; }
.bcc__send {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--nu-blue); border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; transition: background .2s, opacity .2s;
}
.bcc__send:hover { background: var(--nu-blue-hover); }
.bcc__send:disabled { opacity: .55; cursor: default; }
.bcc__send:disabled:hover { background: var(--nu-blue); }
.bcc__send:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }
.bcc__disclaimer {
  max-width: 880px; margin: 9px auto 0;
  color: var(--nu-cream-text-35); font-size: 11.5px; font-weight: 600; text-align: center;
}
</style>

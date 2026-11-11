<script setup lang="ts">
// O campo do painel do chat (02/11/2026): a mesma pílula iridescente da barra,
// com os chips do que a pessoa mostrou da página em cima do texto (removíveis)
// e o botão que vira "parar" enquanto a resposta chega. Enter envia,
// Shift+Enter quebra a linha.
import type { ContextoDoChat } from '~/composables/useChatPainel'

const props = defineProps<{
  modelValue: string
  contextos: ContextoDoChat[]
  streaming: boolean
  /** o chip que acabou de entrar, para o "pop" */
  novoId?: string | null
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'enviar'): void
  (e: 'parar'): void
  (e: 'remover', id: string): void
}>()

const campo = ref<HTMLTextAreaElement | null>(null)
const focado = ref(false)

function ajustar() {
  const el = campo.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 132)}px`
}
watch(() => props.modelValue, () => nextTick(ajustar))
// o painel monta o campo já com o texto quando alguém o preenche de fora (o
// Simular e o Perguntar dos avisos da /carteira, 07/11/2026): sem ajustar na
// montagem, a pergunta longa ficava numa linha só, rolada, com o começo
// escondido sob os chips
onMounted(ajustar)

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    if (!props.streaming) emit('enviar')
  }
}

function focar() { campo.value?.focus() }
defineExpose({ focar })
</script>

<template>
  <ChatPilula class="cco" :aceso="focado || !!modelValue">
    <div class="cco__in" @click.self="focar">
      <TransitionGroup v-if="contextos.length" tag="div" name="cco-chip" class="cco__chips" aria-label="O que vai junto da pergunta">
        <span v-for="c in contextos" :key="c.id" class="cco__chip" :class="{ 'cco__chip--novo': c.id === novoId }">
          <ChatIconeContexto :tipo="c.tipo" />
          <span class="cco__chip-txt">{{ c.rotulo }}</span>
          <button type="button" class="cco__chip-x" :aria-label="`Tirar ${c.rotulo}`" @click="emit('remover', c.id)">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </span>
      </TransitionGroup>
      <div class="cco__linha">
        <textarea
          ref="campo" class="cco__campo" rows="1" enterkeyhint="send"
          :value="modelValue" placeholder="Pergunte à Aportou" aria-label="Pergunte à Aportou"
          @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
          @keydown="onKey" @focus="focado = true" @blur="focado = false"
        />
        <button
          v-if="streaming" type="button" class="cco__btn cco__btn--parar" aria-label="Parar a resposta"
          @click="emit('parar')"
        >
          <span class="cco__quadrado" aria-hidden="true" />
        </button>
        <button
          v-else type="button" class="cco__btn" :class="{ 'cco__btn--pronto': !!modelValue.trim() }"
          aria-label="Enviar pergunta" :disabled="!modelValue.trim()" @click="emit('enviar')"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
        </button>
      </div>
    </div>
  </ChatPilula>
</template>

<style scoped>
.cco { --cpi-raio: 24px; }
.cco__in { padding: 6px 6px 6px 16px; cursor: text; }
.cco__chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 4px 2px 0; }
.cco__chip {
  display: inline-flex; align-items: center; gap: 6px; max-width: 100%;
  padding: 4px 4px 4px 9px; border-radius: var(--nu-r-pill);
  background: var(--nu-cream); color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: 700;
}
.cco__chip--novo { animation: cco-pop .45s cubic-bezier(.2, 1.4, .4, 1) both; }
.cco__chip-txt { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px; }
.cco__chip-x {
  width: 20px; height: 20px; border: 0; border-radius: 50%; display: grid; place-items: center; cursor: pointer;
  background: transparent; color: var(--nu-gray); transition: background .15s, color .15s;
}
.cco__chip-x:hover { background: var(--nu-navy-07); color: var(--nu-ink); }
.cco__chip-x:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 1px; }
.cco__linha { display: flex; align-items: flex-end; gap: 10px; }
.cco__campo {
  flex: 1; min-width: 0; resize: none; border: 0; outline: 0; background: transparent;
  font: inherit; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 500; line-height: 1.45;
  padding: 9px 0; max-height: 132px; overflow-y: auto;
}
.cco__campo::placeholder { color: var(--nu-gray); }
.cco__btn {
  flex-shrink: 0; width: 40px; height: 40px; border: 0; border-radius: 50%; cursor: pointer;
  display: grid; place-items: center; background: var(--nu-ink); color: var(--nu-white);
  transition: transform .2s ease, background .2s ease, opacity .2s ease;
}
.cco__btn:disabled { opacity: .3; cursor: default; }
.cco__btn:not(:disabled):hover { transform: scale(1.05); }
.cco__btn:not(:disabled):active { transform: scale(.96); }
.cco__btn--pronto { background: var(--nu-blue); }
.cco__btn:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }
.cco__quadrado { width: 12px; height: 12px; border-radius: 3px; background: currentColor; }

.cco-chip-enter-active, .cco-chip-leave-active { transition: opacity .2s ease, transform .2s ease; }
.cco-chip-enter-from, .cco-chip-leave-to { opacity: 0; transform: scale(.9); }
@keyframes cco-pop { 0% { transform: scale(.6); opacity: 0; } 60% { transform: scale(1.06); opacity: 1; } 100% { transform: none; } }

@media (max-width: 760px) {
  .cco__campo { font-size: 16px; }
}
</style>

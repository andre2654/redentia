<script setup lang="ts">
// O campo do painel do chat (02/11/2026): o mesmo anel da barra (cobalto, céu,
// sálvia e areia; corre mais rápido no foco e enquanto a resposta chega), com
// os chips do que a pessoa mostrou da página em cima do texto (removíveis) e o
// botão cobalto que vira "parar" enquanto a resposta chega. Enter envia,
// Shift+Enter quebra a linha.
// Robustez (11/11/2026): o chip novo e o "parar" pousam sem passar do ponto
// (--nu-ease-saida, sem a mola de 1.4); tempos e curvas dos tokens.
import type { ContextoDoChat } from '~/composables/useChatPainel'

const props = defineProps<{
  modelValue: string
  contextos: ContextoDoChat[]
  streaming: boolean
  /** o chip que acabou de entrar, para o "pop" */
  novoId?: string | null
  /** o convite do campo ("Pergunte sobre PETR4"); o nome acessível não muda */
  convite?: string
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
  <ChatPilula class="cco" :aceso="focado || !!modelValue" :respondendo="streaming">
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
          :value="modelValue" :placeholder="convite || 'Pergunte à Aportou'" aria-label="Pergunte à Aportou"
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
          v-else type="button" class="cco__btn"
          aria-label="Enviar pergunta" :disabled="!modelValue.trim()" @click="emit('enviar')"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5" /><path d="M6 11l6-6 6 6" /></svg>
        </button>
      </div>
    </div>
  </ChatPilula>
</template>

<style scoped>
.cco { --cpi-raio: 28px; }
.cco__in { padding: 6px 7px 6px 18px; cursor: text; }
.cco__chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 4px 2px 0; }
.cco__chip {
  display: inline-flex; align-items: center; gap: 6px; max-width: 100%;
  padding: 4px 4px 4px 10px; border-radius: var(--nu-r-pill);
  background: var(--nu-cream-2); color: var(--nu-ink); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio);
}
.cco__chip--novo { animation: cco-pop var(--nu-dur-lenta) var(--nu-ease-saida) both; }
.cco__chip-txt { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px; }
.cco__chip-x {
  position: relative; width: 22px; height: 22px; border: 0; border-radius: 50%; padding: 0; display: grid; place-items: center; cursor: pointer;
  background: transparent; color: var(--nu-gray);
  transition: background-color var(--nu-dur-rapida) var(--nu-ease-cor), color var(--nu-dur-rapida) var(--nu-ease-cor);
}
/* o alvo de toque é maior que o círculo */
.cco__chip-x::after { content: ''; position: absolute; inset: -11px -8px; }
.cco__chip-x:hover { background: var(--nu-ink); color: var(--nu-white); }
.cco__linha { display: flex; align-items: flex-end; gap: 10px; }
.cco__campo {
  flex: 1; min-width: 0; resize: none; border: 0; outline: 0; background: transparent;
  font: inherit; color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); line-height: 1.45;
  padding: 9px 0; max-height: 132px; overflow-y: auto; caret-color: var(--nu-blue);
}
/* o anel é o foco do campo: o contorno global não entra por cima dele */
.cco__campo:focus-visible { outline: 0; }
.cco__campo::placeholder { color: var(--nu-gray); opacity: 1; }
/* o envio: o círculo cobalto com a seta para cima; parar é o mesmo círculo em carvão */
.cco__btn {
  flex-shrink: 0; width: 40px; height: 40px; border: 0; border-radius: 50%; padding: 0; cursor: pointer;
  display: grid; place-items: center; background: var(--nu-blue); color: var(--nu-white);
  transition: transform var(--nu-dur-rapida) var(--nu-ease-saida), background-color var(--nu-dur-media) var(--nu-ease-cor), opacity var(--nu-dur-media) var(--nu-ease-cor);
}
.cco__btn:disabled { opacity: .4; cursor: default; }
.cco__btn:not(:disabled):hover { background: var(--nu-blue-hover); }
.cco__btn:not(:disabled):active { transform: scale(.94); }
.cco__btn--parar, .cco__btn--parar:not(:disabled):hover { background: var(--nu-ink); }
.cco__btn--parar { animation: cco-pop var(--nu-dur-media) var(--nu-ease-saida) both; }
.cco__quadrado { width: 12px; height: 12px; border-radius: 3px; background: currentColor; }

.cco-chip-enter-active { transition: opacity var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-media) var(--nu-ease-saida); }
.cco-chip-leave-active { transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-cor); }
.cco-chip-enter-from, .cco-chip-leave-to { opacity: 0; transform: scale(.9); }
@keyframes cco-pop { from { transform: scale(.8); opacity: 0; } to { transform: none; opacity: 1; } }

@media (max-width: 760px) {
  .cco__campo { font-size: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .cco__chip--novo, .cco__btn--parar { animation: none; }
}
</style>

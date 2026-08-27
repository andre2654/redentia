<script setup lang="ts">
/**
 * SimHeroInput — a abertura de /simulacao (F3).
 *
 * Entrada é TEXTO LIVRE (decisão do dono, 27/08): a pessoa descreve o cenário
 * em uma frase e o interpretador do chat-service traduz. O builder de carteira
 * deixou de abrir o fluxo e virou o fallback de confiança baixa.
 *
 * Os chips não são decoração: são o vocabulário fechado do catálogo virando
 * affordance. Quem não sabe o que escrever descobre o que dá pra pedir sem
 * precisar tentar e errar.
 */
import type { SimCatalogItem } from '~/composables/useSimulacao'

const props = defineProps<{
  catalog: SimCatalogItem[]
  busy?: boolean
}>()

const emit = defineEmits<{
  submit: [text: string]
  pickScenario: [slug: string]
}>()

const text = ref('')
const canSubmit = computed(() => text.value.trim().length >= 3 && !props.busy)

/** Só os cenários com título curto viram chip — o resto vive no fallback. */
const chips = computed(() => props.catalog.slice(0, 5))

function submit() {
  if (!canSubmit.value) return
  emit('submit', text.value.trim())
}

function onKeydown(e: KeyboardEvent) {
  // Enter envia; Shift+Enter quebra linha (carteira colada tem várias linhas)
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  }
}
</script>

<template>
  <div class="shi">
    <h1 class="shi__title">O que você quer<br>ver acontecer?</h1>

    <div class="shi__field" :class="{ 'shi__field--busy': busy }">
      <textarea
        v-model="text"
        class="shi__input"
        rows="2"
        :disabled="busy"
        placeholder="e se a bolha de IA estourar?"
        aria-label="Descreva o cenário que você quer simular"
        @keydown="onKeydown"
      />
      <button
        type="button"
        class="shi__go"
        :disabled="!canSubmit"
        :aria-label="busy ? 'Interpretando' : 'Simular'"
        @click="submit"
      >
        <span v-if="!busy" aria-hidden="true">→</span>
        <span v-else class="shi__spin" aria-hidden="true" />
      </button>
    </div>

    <div v-if="chips.length" class="shi__chips">
      <button
        v-for="c in chips"
        :key="c.slug"
        type="button"
        class="shi__chip"
        :disabled="busy"
        @click="emit('pickScenario', c.slug)"
      >
        {{ c.title }}
      </button>
    </div>

    <p class="shi__honest">
      Projeção estatística com premissas explícitas, em poder de compra de hoje —
      não é previsão nem promessa de retorno.
    </p>
  </div>
</template>

<style scoped>
.shi { display: flex; flex-direction: column; gap: 22px; max-width: 640px; }

.shi__title {
  margin: 0;
  font-size: clamp(38px, 6vw, 62px);
  line-height: 1.02;
  letter-spacing: -0.03em;
  font-weight: 800;
  color: var(--nu-ink);
}

.shi__field {
  display: flex; align-items: flex-end; gap: 10px;
  background: var(--nu-white);
  border-radius: var(--nu-r-panel);
  padding: 14px 14px 14px 22px;
  box-shadow: 0 1px 2px rgba(10, 10, 12, 0.04), 0 8px 24px rgba(10, 10, 12, 0.05);
  transition: box-shadow 0.2s ease;
}
.shi__field:focus-within { box-shadow: 0 1px 2px rgba(10, 10, 12, 0.06), 0 12px 32px rgba(10, 10, 12, 0.09); }
.shi__field--busy { opacity: 0.72; }

.shi__input {
  flex: 1; border: none; outline: none; resize: none; background: transparent;
  font-family: inherit; font-size: 17px; line-height: 1.45; color: var(--nu-ink);
  padding: 6px 0;
}
.shi__input::placeholder { color: var(--nu-ink-30); }

.shi__go {
  flex-shrink: 0;
  width: 46px; height: 46px; border-radius: 50%; border: none;
  background: var(--nu-blue); color: var(--nu-white);
  font-size: 19px; cursor: pointer;
  display: grid; place-items: center;
  transition: background 0.15s ease, transform 0.15s ease;
}
.shi__go:hover:not(:disabled) { background: var(--nu-blue-hover); transform: translateY(-1px); }
.shi__go:disabled { background: var(--nu-cream-2); color: var(--nu-ink-30); cursor: not-allowed; }
.shi__go:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 3px; }

.shi__spin {
  width: 17px; height: 17px; border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: var(--nu-white);
  animation: shi-spin 0.8s linear infinite;
}
@keyframes shi-spin { to { transform: rotate(360deg); } }

.shi__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.shi__chip {
  border: 1px solid var(--nu-cream-2); background: var(--nu-white);
  border-radius: var(--nu-r-pill); padding: 9px 16px;
  font-family: inherit; font-size: 13.5px; font-weight: 600; color: var(--nu-ink);
  cursor: pointer; transition: border-color 0.15s ease, background 0.15s ease;
}
.shi__chip:hover:not(:disabled) { border-color: var(--nu-blue); background: var(--nu-blue-tint-2); }
.shi__chip:disabled { opacity: 0.5; cursor: not-allowed; }
.shi__chip:focus-visible { outline: 2px solid var(--nu-blue); outline-offset: 2px; }

.shi__honest { margin: 0; font-size: 13px; color: var(--nu-ink-75); line-height: 1.5; max-width: 52ch; }

@media (max-width: 640px) {
  .shi__field { padding: 12px 12px 12px 18px; }
  .shi__input { font-size: 16px; }
}

@media (prefers-reduced-motion: reduce) {
  .shi__go, .shi__chip, .shi__field { transition: none; }
  .shi__spin { animation: none; }
}
</style>

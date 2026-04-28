<!--
  PortfolioInput

  Input de tickers para o Raio-X. Aceita string livre (PETR4, ITUB4, MXRF11)
  separada por virgula, espaco ou enter. Mostra chips para o que foi adicionado,
  permite remover, e tem sugestoes rapidas abaixo.

  Submit gera URL /raio-x?tickers=PETR4,ITUB4,...
-->
<script setup lang="ts">
import { SUGGESTED_TICKERS } from '~/composables/usePortfolioScore'

interface Props {
  variant?: 'hero' | 'inline'
  initialTickers?: string[]
  ctaLabel?: string
  showSuggestions?: boolean
  autofocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'hero',
  initialTickers: () => [],
  ctaLabel: 'Gerar meu Raio-X gratis',
  showSuggestions: true,
  autofocus: false,
})

const emit = defineEmits<{
  submit: [tickers: string[]]
  change: [tickers: string[]]
}>()

const router = useRouter()
const inputRef = ref<HTMLInputElement | null>(null)
const draft = ref('')
const tickers = ref<string[]>([...props.initialTickers])
const error = ref<string | null>(null)

watch(tickers, (v) => emit('change', v), { deep: true })

function normalize(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9+ ]/g, '')
    .replace(/\s+/g, ' ')
}

function isValid(t: string): boolean {
  if (!t) return false
  // Aceita: PETR4, MXRF11, AAPL34, TESOURO SELIC, TESOURO IPCA+, BTC, ETH
  if (/^TESOURO/.test(t)) return true
  if (t === 'BTC' || t === 'ETH' || t === 'BITCOIN' || t === 'ETHEREUM') return true
  return /^[A-Z]{4}\d{1,2}$/.test(t)
}

function pushTicker(raw: string) {
  const n = normalize(raw)
  if (!n) return
  if (!isValid(n)) {
    error.value = `"${raw}" nao parece um ticker valido. Tente PETR4, MXRF11, AAPL34, IVVB11.`
    return
  }
  if (tickers.value.includes(n)) {
    error.value = null
    return
  }
  tickers.value.push(n)
  error.value = null
}

function processDraft(autoSubmit = false) {
  const raw = draft.value
  draft.value = ''
  if (!raw) return
  // Splita por virgula ou ponto-e-virgula
  const parts = raw.split(/[,;]/).map(s => s.trim()).filter(Boolean)
  for (const p of parts) pushTicker(p)
  if (autoSubmit && tickers.value.length > 0) submit()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (draft.value.trim()) {
      processDraft()
    }
    else if (tickers.value.length > 0) {
      submit()
    }
  }
  else if (e.key === ',' || e.key === ';') {
    e.preventDefault()
    processDraft()
  }
  else if (e.key === 'Backspace' && !draft.value && tickers.value.length > 0) {
    tickers.value.pop()
  }
}

function onPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text') || ''
  if (text.includes(',') || text.includes(';') || text.split(/\s+/).length > 1) {
    e.preventDefault()
    draft.value = text
    processDraft()
  }
}

function removeTicker(t: string) {
  tickers.value = tickers.value.filter(x => x !== t)
}

function addSuggestion(t: string) {
  if (tickers.value.includes(t)) return
  tickers.value.push(t)
  error.value = null
  inputRef.value?.focus()
}

function submit() {
  // Processa qualquer rascunho restante
  if (draft.value.trim()) processDraft()
  if (tickers.value.length === 0) {
    error.value = 'Adicione pelo menos um ativo para gerar a analise.'
    inputRef.value?.focus()
    return
  }
  emit('submit', [...tickers.value])
  // Default: navega pra /raio-x se ninguem capturou o evento
  router.push({ path: '/raio-x', query: { tickers: tickers.value.join(',') } })
}

function loadDemo() {
  tickers.value = ['PETR4', 'ITUB4', 'MXRF11', 'HGLG11', 'IVVB11', 'TESOURO SELIC']
  error.value = null
}

onMounted(() => {
  if (props.autofocus) {
    nextTick(() => inputRef.value?.focus())
  }
})

const placeholder = computed(() => {
  if (tickers.value.length > 0) return 'Adicionar mais ativos...'
  return 'PETR4, ITUB4, MXRF11, HGLG11, IVVB11, Tesouro Selic'
})

const suggestionsToShow = computed(() => {
  return SUGGESTED_TICKERS.filter(t => !tickers.value.includes(t)).slice(0, 8)
})
</script>

<template>
  <div class="portfolio-input" :data-variant="variant">
    <div class="portfolio-input__shell">
      <!-- Campo + chips inline -->
      <div class="portfolio-input__field">
        <UIcon
          name="i-lucide-search"
          class="size-4 shrink-0 text-[var(--text-muted)]"
          aria-hidden="true"
        />
        <div class="portfolio-input__chips">
          <span
            v-for="t in tickers"
            :key="t"
            class="portfolio-input__chip"
          >
            {{ t }}
            <button
              type="button"
              class="portfolio-input__chip-remove"
              :aria-label="`Remover ${t}`"
              @click="removeTicker(t)"
            >
              <UIcon name="i-lucide-x" class="size-3" aria-hidden="true" />
            </button>
          </span>
          <input
            ref="inputRef"
            v-model="draft"
            type="text"
            inputmode="text"
            autocomplete="off"
            autocapitalize="characters"
            spellcheck="false"
            class="portfolio-input__field-input"
            :placeholder="placeholder"
            aria-label="Adicionar ativo"
            @keydown="onKeydown"
            @paste="onPaste"
            @blur="processDraft()"
          >
        </div>
      </div>

      <!-- Submit -->
      <button
        type="button"
        class="portfolio-input__submit quiet-btn-primary"
        @click="submit"
      >
        <UIcon name="i-lucide-sparkles" class="size-4" aria-hidden="true" />
        <span>{{ ctaLabel }}</span>
      </button>
    </div>

    <!-- Erro -->
    <p v-if="error" class="portfolio-input__error" role="alert">
      <UIcon name="i-lucide-alert-circle" class="size-3.5" aria-hidden="true" />
      {{ error }}
    </p>

    <!-- Sugestoes -->
    <div v-if="showSuggestions && suggestionsToShow.length > 0" class="portfolio-input__suggestions">
      <span class="portfolio-input__suggestions-label">
        Tente:
      </span>
      <button
        v-for="t in suggestionsToShow"
        :key="t"
        type="button"
        class="portfolio-input__suggestion"
        @click="addSuggestion(t)"
      >
        + {{ t }}
      </button>
      <button
        type="button"
        class="portfolio-input__demo-btn"
        @click="loadDemo"
      >
        <UIcon name="i-lucide-wand-sparkles" class="size-3" aria-hidden="true" />
        Carteira de exemplo
      </button>
    </div>
  </div>
</template>

<style scoped>
.portfolio-input {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.portfolio-input__shell {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
}

@media (min-width: 768px) {
  .portfolio-input__shell {
    flex-direction: row;
  }
}

.portfolio-input__field {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  transition: border-color 200ms, box-shadow 200ms;
  min-height: 56px;
}

.portfolio-input__field:focus-within {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}

.portfolio-input__chips {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.portfolio-input__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 4px 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.02em;
  font-family: var(--brand-font);
  background: color-mix(in srgb, var(--brand-primary) 16%, transparent);
  color: color-mix(in srgb, var(--brand-primary) 95%, var(--text-heading));
  border: 1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
}

[data-mode='dark'] .portfolio-input__chip {
  color: var(--brand-primary);
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
}

.portfolio-input__chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  width: 18px;
  border-radius: 4px;
  background: transparent;
  color: currentColor;
  opacity: 0.6;
  transition: opacity 150ms, background 150ms;
}

.portfolio-input__chip-remove:hover {
  opacity: 1;
  background: color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

.portfolio-input__field-input {
  flex: 1;
  min-width: 180px;
  background: transparent;
  border: 0;
  outline: 0;
  font-size: 15px;
  font-weight: 400;
  color: var(--text-heading);
  font-family: var(--brand-font);
  letter-spacing: 0.01em;
}

.portfolio-input__field-input::placeholder {
  color: var(--text-muted);
}

.portfolio-input__submit {
  flex-shrink: 0;
  white-space: nowrap;
  height: 56px;
  padding: 0 24px;
  font-size: 15px;
}

.portfolio-input__error {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--brand-negative);
  margin-top: -2px;
}

.portfolio-input__suggestions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.portfolio-input__suggestions-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 400;
  margin-right: 2px;
}

.portfolio-input__suggestion {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
  font-family: var(--brand-font);
  color: var(--text-body);
  background: transparent;
  border: 1px solid var(--border-subtle);
  transition: all 150ms;
}

.portfolio-input__suggestion:hover {
  color: var(--text-heading);
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 6%, transparent);
}

.portfolio-input__demo-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--brand-primary);
  background: transparent;
  border: 1px dashed color-mix(in srgb, var(--brand-primary) 35%, transparent);
  transition: all 150ms;
  margin-left: 4px;
}

.portfolio-input__demo-btn:hover {
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border-style: solid;
}

/* Variant inline (mais compacto, usado em paginas internas) */
[data-variant='inline'] .portfolio-input__field {
  min-height: 48px;
  padding: 10px 14px;
}

[data-variant='inline'] .portfolio-input__submit {
  height: 48px;
}
</style>

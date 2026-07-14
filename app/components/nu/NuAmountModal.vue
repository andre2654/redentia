<script setup lang="ts">
// NuAmountModal — modal Nu reutilizável que pergunta um VALOR em R$ (usado no
// "Novo aporte" da home e da /carteira). Componente BURRO de chrome + máscara:
// recebe open/title/subtitle/labels e emite `confirm` com o valor numérico
// (reais, inteiro, > 0) ou `close`. Padrão visual dos outros modais Nu
// (NuDayModal): Teleport pro body, scrim escuro com blur, card claro radius,
// Escape/click-fora/cancelar fecham, scroll-lock, foco no input ao abrir,
// role=dialog acessível. SSR-safe (v-if só liga no cliente após o gatilho —
// nada teleporta no SSR). Só é montado onde o gatilho já é logado-only.
const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  subtitle?: string
  confirmLabel?: string
  cancelLabel?: string
}>(), {
  title: 'Novo aporte',
  subtitle: 'Quanto você quer aportar? A Redentia AI monta a distribuição pela sua carteira.',
  confirmLabel: 'Continuar no chat',
  cancelLabel: 'Cancelar',
})

const emit = defineEmits<{ close: []; confirm: [value: number] }>()

const inputRef = ref<HTMLInputElement | null>(null)
const titleId = useId()
const errId = useId()

// máscara BR: só dígitos → inteiro de reais → '1.234' (aporte é valor cheio,
// sem centavos). O número entra na pergunta já formatado em pt-BR.
const raw = ref('')
const touched = ref(false)

const amount = computed(() => {
  const digits = raw.value.replace(/\D/g, '')
  return digits ? Number.parseInt(digits, 10) : 0
})
const display = computed(() => (amount.value ? amount.value.toLocaleString('pt-BR') : ''))
const invalid = computed(() => amount.value <= 0)
const showError = computed(() => touched.value && invalid.value)

function onInput(e: Event) {
  raw.value = (e.target as HTMLInputElement).value.replace(/\D/g, '')
}

function confirm() {
  touched.value = true
  if (invalid.value) {
    inputRef.value?.focus()
    return
  }
  emit('confirm', amount.value)
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

// Reset ao abrir + scroll-lock + Escape + foco no input (mesmo padrão do
// NuDayModal). Sem animação de saída — v-if desmonta direto.
watch(() => props.open, (open) => {
  if (import.meta.server) return
  document.documentElement.style.overflow = open ? 'hidden' : ''
  if (open) {
    raw.value = ''
    touched.value = false
    document.addEventListener('keydown', onKey)
    nextTick(() => inputRef.value?.focus())
  } else {
    document.removeEventListener('keydown', onKey)
  }
})

onBeforeUnmount(() => {
  if (import.meta.server) return
  document.removeEventListener('keydown', onKey)
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="nam" @click="emit('close')">
      <form
        class="nam__card"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @click.stop
        @submit.prevent="confirm"
      >
        <div class="nam__head">
          <div>
            <h4 :id="titleId" class="nam__title">{{ title }}</h4>
            <p class="nam__sub">{{ subtitle }}</p>
          </div>
          <button type="button" class="nam__close" aria-label="Fechar" @click="emit('close')">✕</button>
        </div>

        <div class="nam__field" :class="{ 'nam__field--err': showError }">
          <span class="nam__prefix">R$</span>
          <input
            ref="inputRef"
            class="nam__input"
            :value="display"
            inputmode="numeric"
            autocomplete="off"
            placeholder="0"
            :aria-invalid="showError"
            :aria-describedby="showError ? errId : undefined"
            @input="onInput"
          >
        </div>
        <p v-if="showError" :id="errId" class="nam__err" role="alert">Informe um valor maior que zero.</p>

        <div class="nam__foot">
          <button type="button" class="nam__cancel" @click="emit('close')">{{ cancelLabel }}</button>
          <button type="submit" class="nam__confirm">{{ confirmLabel }}</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
.nam {
  position: fixed; inset: 0; z-index: 9999;
  background: var(--nu-day-backdrop);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 32px;
  animation: namfade .18s ease;
}
.nam__card {
  width: min(460px, 92vw);
  background: var(--nu-day-card); border-radius: var(--nu-r-card-lg);
  padding: 34px 34px 30px; box-shadow: var(--nu-shadow-day-modal);
  animation: namrise .24s cubic-bezier(.2, .8, .2, 1);
}
.nam__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; }
.nam__title { margin: 0; color: var(--nu-ink); font-size: 24px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.08; }
.nam__sub { margin: 9px 0 0; color: var(--nu-gray-2); font-size: 15px; font-weight: 500; line-height: 1.5; }
.nam__close {
  flex: 0 0 auto; width: 38px; height: 38px; border-radius: 50%; border: none;
  background: var(--nu-day-close); color: var(--nu-ink); font-size: 15px; font-weight: 800;
  cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .2s;
}
.nam__close:hover { background: var(--nu-day-close-hover); }

.nam__field {
  display: flex; align-items: center; gap: 10px; margin-top: 26px;
  background: var(--nu-white); border: 2px solid var(--nu-cream-2);
  border-radius: var(--nu-r-card); padding: 16px 20px;
  transition: border-color .18s;
}
.nam__field:focus-within { border-color: var(--nu-blue); }
.nam__field--err { border-color: var(--nu-red); }
.nam__prefix { color: var(--nu-gray); font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
.nam__input {
  flex: 1; min-width: 0; border: none; outline: none; background: transparent;
  color: var(--nu-ink); font-size: 32px; font-weight: 800; letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums; font-family: inherit;
}
.nam__input::placeholder { color: var(--nu-gray); opacity: .5; }
.nam__err { margin: 10px 2px 0; color: var(--nu-red-2); font-size: 13.5px; font-weight: 700; }

.nam__foot { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 28px; }
.nam__cancel {
  background: transparent; color: var(--nu-gray-2); border: none;
  border-radius: var(--nu-r-pill); padding: 13px 20px; font-size: 15px; font-weight: 800;
  font-family: inherit; cursor: pointer; transition: color .2s;
}
.nam__cancel:hover { color: var(--nu-ink); }
.nam__confirm {
  background: var(--nu-blue); color: var(--nu-white); border: none;
  border-radius: var(--nu-r-pill); padding: 13px 24px; font-size: 15px; font-weight: 800;
  font-family: inherit; cursor: pointer; transition: background .2s, transform .15s;
}
.nam__confirm:hover { background: var(--nu-blue-hover); transform: translateY(-1px); }

@keyframes namfade { from { opacity: 0; } to { opacity: 1; } }
@keyframes namrise { from { opacity: 0; transform: translateY(14px) scale(.98); } to { opacity: 1; transform: none; } }

@media (max-width: 760px) {
  .nam { padding: 18px; align-items: flex-end; }
  .nam__card { width: 100%; padding: 26px 22px 24px; }
  .nam__foot { justify-content: stretch; }
  .nam__cancel, .nam__confirm { flex: 1; text-align: center; }
}
</style>

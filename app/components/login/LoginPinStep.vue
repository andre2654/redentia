<script setup lang="ts">
// Etapa de verificação do PIN — o design só desenha a coleta do
// identificador; este passo estende a MESMA linguagem visual (h1 800 com
// tracking negativo, label 14/700, underline 2px, pill CTA, footer de
// alternância) pro código de 6 dígitos dos fluxos magic-pin (WhatsApp,
// expira em 5min) e magic-link (e-mail, 10min).
//
// UX: auto-advance por dígito, backspace volta, colar o OTP inteiro
// distribui (inclusive o autofill do iOS, que despeja os 6 no primeiro
// campo), auto-submit no 6º dígito. Erro do backend limpa os campos e
// devolve o foco pro primeiro.
const props = defineProps<{
  /** identificador já formatado: '(11) 90000-0000' ou 'voce@email.com' */
  identifier: string
  channel: 'whatsapp' | 'email'
  verifying: boolean
  error: string | null
  /** segundos restantes do cooldown de reenvio (0 = pode reenviar) */
  resendIn: number
}>()
const emit = defineEmits<{ submit: [pin: string]; resend: []; back: [] }>()

const DIGITS = 6
const digits = ref<string[]>(Array.from({ length: DIGITS }, () => ''))
const cells = ref<(HTMLInputElement | null)[]>([])
let lastSubmitted = ''

const pin = computed(() => digits.value.join(''))
const complete = computed(() => digits.value.every((d) => /^\d$/.test(d)))

const sentTo = computed(() =>
  props.channel === 'whatsapp'
    ? `Enviamos um código de 6 dígitos para o WhatsApp ${props.identifier}.`
    : `Enviamos um código de 6 dígitos para ${props.identifier}.`,
)
const expiryNote = computed(() =>
  props.channel === 'whatsapp' ? 'O código expira em 5 minutos.' : 'O código expira em 10 minutos.',
)
const backLabel = computed(() => (props.channel === 'whatsapp' ? 'Número errado?' : 'E-mail errado?'))

function setCell(el: unknown, i: number) {
  cells.value[i] = (el as HTMLInputElement | null) ?? null
}
function focusCell(i: number) {
  cells.value[Math.max(0, Math.min(DIGITS - 1, i))]?.focus()
}

function maybeSubmit() {
  if (!complete.value || props.verifying) return
  if (pin.value === lastSubmitted) return
  lastSubmitted = pin.value
  emit('submit', pin.value)
}

function onInput(i: number, e: Event) {
  const el = e.target as HTMLInputElement
  const ds = el.value.replace(/\D/g, '')
  if (!ds) {
    digits.value[i] = ''
    el.value = ''
    return
  }
  // Digitação normal (1 dígito) ou autofill/colagem despejada num campo só.
  const spread = ds.slice(0, DIGITS - i).split('')
  spread.forEach((d, k) => {
    digits.value[i + k] = d!
  })
  el.value = digits.value[i]!
  focusCell(i + spread.length)
  nextTick(maybeSubmit)
}

function onKeydown(i: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !digits.value[i] && i > 0) {
    e.preventDefault()
    digits.value[i - 1] = ''
    focusCell(i - 1)
  } else if (e.key === 'ArrowLeft' && i > 0) {
    e.preventDefault()
    focusCell(i - 1)
  } else if (e.key === 'ArrowRight' && i < DIGITS - 1) {
    e.preventDefault()
    focusCell(i + 1)
  }
}

function onPaste(e: ClipboardEvent) {
  e.preventDefault()
  const ds = (e.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, DIGITS)
  if (!ds) return
  digits.value = Array.from({ length: DIGITS }, (_, k) => ds[k] ?? '')
  focusCell(Math.min(ds.length, DIGITS - 1))
  nextTick(maybeSubmit)
}

// Erro do backend (código incorreto/expirado/bloqueado): limpa e refoca.
watch(
  () => props.error,
  (err) => {
    if (!err) return
    digits.value = Array.from({ length: DIGITS }, () => '')
    lastSubmitted = ''
    nextTick(() => focusCell(0))
  },
)

onMounted(() => focusCell(0))
</script>

<template>
  <div>
    <h1 class="lps__h1">Digite o código</h1>
    <p class="lps__sent">{{ sentTo }} {{ expiryNote }}</p>

    <div class="lps__label"><NuFieldLabel label="Código de verificação" /></div>
    <div class="lps__cells" @paste="onPaste">
      <input
        v-for="i in DIGITS"
        :key="i"
        :ref="(el) => setCell(el, i - 1)"
        :value="digits[i - 1]"
        type="text"
        inputmode="numeric"
        maxlength="6"
        :autocomplete="i === 1 ? 'one-time-code' : 'off'"
        class="lps__cell"
        :class="{ 'lps__cell--error': !!error }"
        :aria-label="`Dígito ${i} de 6`"
        @input="onInput(i - 1, $event)"
        @keydown="onKeydown(i - 1, $event)"
      >
    </div>
    <p v-if="error" class="lps__error">{{ error }}</p>

    <NuPillButton
      class="lps__cta"
      :disabled="!complete"
      :loading="verifying"
      @click="maybeSubmit"
    >
      {{ verifying ? 'Verificando…' : 'Confirmar' }}
    </NuPillButton>

    <div class="lps__resend">
      <button
        v-if="resendIn === 0"
        type="button"
        class="lps__resend-btn"
        :disabled="verifying"
        @click="$emit('resend')"
      >
        Reenviar código
      </button>
      <span v-else class="lps__resend-wait">Reenviar código em {{ resendIn }}s</span>
    </div>

    <NuInlineTextToggle class="lps__back" :label="backLabel" cta="Voltar" @click="$emit('back')" />
  </div>
</template>

<style scoped>
.lps__h1 {
  margin: 0; color: var(--nu-ink);
  font-size: clamp(32px, 3.4vw, 44px); font-weight: 800;
  letter-spacing: -0.04em; line-height: 1.05;
}
.lps__sent { margin: 14px 0 0; color: var(--nu-gray-2); font-size: 15px; font-weight: 600; line-height: 1.5; }
.lps__label { margin-top: clamp(36px, 5vh, 56px); }
.lps__cells { display: flex; gap: 10px; }
.lps__cell {
  flex: 1; min-width: 0; width: 100%;
  background: transparent; border: none;
  border-bottom: 2px solid var(--nu-underline);
  outline: none; border-radius: 0;
  padding: 12px 0 14px; text-align: center;
  color: var(--nu-ink); font-size: clamp(24px, 2.4vw, 30px); font-weight: 700;
  font-variant-numeric: tabular-nums;
  transition: border-color .2s;
}
.lps__cell:focus { border-bottom-color: var(--nu-blue); }
.lps__cell--error { border-bottom-color: var(--nu-red); }
.lps__error { margin: 12px 0 0; color: var(--nu-red); font-size: 14px; font-weight: 600; }
.lps__cta { margin-top: clamp(36px, 5vh, 52px); }
.lps__resend { margin-top: 26px; }
.lps__resend-btn {
  background: transparent; border: none; padding: 0;
  color: var(--nu-blue); font-size: 14.5px; font-weight: 800;
  cursor: pointer; font-family: inherit;
}
.lps__resend-btn:disabled { color: var(--nu-gray); cursor: default; }
.lps__resend-wait { color: var(--nu-gray); font-size: 14.5px; font-weight: 600; }
.lps__back { margin-top: clamp(32px, 5vh, 52px); }
</style>

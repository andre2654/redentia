<script setup lang="ts">
// O campo do código de 6 números do /login (LoginMinimo, 04/11/2026): os
// números grandes, cada um sobre um traço, e o traço da vez em azul. Um input
// de verdade, invisível, por cima das seis casas (como na folha de cadastro):
// o teclado numérico, o colar e o autofill do código do SMS/e-mail
// (one-time-code) caem nele inteiros. O comportamento é o do antigo
// LoginPinStep: no 6º número envia sozinho (uma vez por código), e o erro do
// backend limpa as casas e devolve o foco. 16 px no input: o iOS não dá zoom.
const props = withDefaults(defineProps<{
  verifying: boolean
  error: string | null
  rotulo?: string
}>(), { rotulo: 'Código de 6 números' })
const emit = defineEmits<{ submit: [pin: string] }>()

const DIGITOS = 6
const codigo = ref('')
const campo = ref<HTMLInputElement | null>(null)
const focado = ref(false)
let enviado = ''

function aoDigitar(e: Event) {
  const v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, DIGITOS)
  codigo.value = v
  ;(e.target as HTMLInputElement).value = v
  if (v.length === DIGITOS && !props.verifying && v !== enviado) {
    enviado = v
    emit('submit', v)
  }
}

// Enter com os 6 números confere de novo (o envio sozinho já foi uma vez)
function aoConfirmar() {
  if (codigo.value.length !== DIGITOS || props.verifying) return
  enviado = codigo.value
  emit('submit', codigo.value)
}

watch(() => props.error, (erro) => {
  if (!erro) return
  codigo.value = ''
  enviado = ''
  nextTick(() => campo.value?.focus())
})

onMounted(() => campo.value?.focus({ preventScroll: true }))
defineExpose({ focar: () => campo.value?.focus() })
</script>

<template>
  <div
    class="lco" :class="{ 'lco--erro': !!error, 'lco--foco': focado, 'lco--conferindo': verifying }"
    @click="campo?.focus()"
  >
    <span
      v-for="i in DIGITOS" :key="i" class="lco__casa"
      :class="{ 'lco__casa--vez': focado && !verifying && codigo.length === i - 1, 'lco__casa--cheia': !!codigo[i - 1] }"
      aria-hidden="true"
    >{{ codigo[i - 1] ?? '' }}</span>
    <input
      ref="campo" class="lco__campo" :value="codigo" type="text" inputmode="numeric" pattern="[0-9]*"
      autocomplete="one-time-code" maxlength="6" :aria-label="rotulo" :aria-invalid="!!error" :disabled="verifying"
      @input="aoDigitar" @keydown.enter.prevent="aoConfirmar" @focus="focado = true" @blur="focado = false"
    >
  </div>
</template>

<style scoped>
.lco { position: relative; display: flex; gap: 8px; cursor: text; }
.lco__casa {
  flex: 1; min-width: 0; height: 64px; display: grid; place-items: center; box-sizing: border-box;
  border-bottom: 2px solid var(--nu-cream-line); color: var(--nu-ink);
  font-size: clamp(34px, 10vw, 44px); font-weight: 600; letter-spacing: -0.02em; font-variant-numeric: tabular-nums;
  transition: border-color .2s;
}
.lco__casa--cheia { border-bottom-color: var(--nu-ink-30); }
.lco__casa--vez { border-bottom-color: var(--nu-blue); }
.lco--erro .lco__casa { border-bottom-color: var(--nu-red); }
/* o campo de verdade, invisível por cima das casas */
.lco__campo {
  position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; padding: 0; border: 0; outline: none;
  opacity: 0.01; background: transparent; color: transparent; caret-color: transparent; font-size: 16px; letter-spacing: 2em;
}
.lco__campo:disabled { cursor: default; }
/* o foco visível é o traço azul da vez (lco__casa--vez) */

.lco--conferindo .lco__casa { animation: lco-confere 1.1s ease-in-out infinite; }
.lco--conferindo .lco__casa:nth-child(2) { animation-delay: .08s; }
.lco--conferindo .lco__casa:nth-child(3) { animation-delay: .16s; }
.lco--conferindo .lco__casa:nth-child(4) { animation-delay: .24s; }
.lco--conferindo .lco__casa:nth-child(5) { animation-delay: .32s; }
.lco--conferindo .lco__casa:nth-child(6) { animation-delay: .4s; }
@keyframes lco-confere { 50% { opacity: .45; } }
@media (prefers-reduced-motion: reduce) {
  .lco__casa { animation: none !important; transition: none; }
}
</style>

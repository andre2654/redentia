<script setup lang="ts">
// O campo do código de 6 números do /login (LoginMinimo, 04/11/2026): os
// números grandes, cada um sobre um traço, e o traço da vez em azul. Um input
// de verdade, invisível, por cima das seis casas (como na folha de cadastro):
// o teclado numérico, o colar e o autofill do código do SMS/e-mail
// (one-time-code) caem nele inteiros. O comportamento é o do antigo
// LoginPinStep: no 6º número envia sozinho (uma vez por código), e o erro do
// backend limpa as casas e devolve o foco. 16 px no input: o iOS não dá zoom.
// Robustez (11/11/2026): cada número pousa na casa (fade + 6px), a casa da vez
// mostra o cursor e o anel que aperta de 4 para 1px; o erro deixa as casas
// vermelhas e a fila acena uma vez (só transform), sem mudar a altura de nada;
// conferindo, as casas respiram devagar. Movimento reduzido: tudo parado.
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
const acenando = ref(false)
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
  // o aceno roda de novo a cada erro (tira a classe e põe no quadro seguinte)
  acenando.value = false
  requestAnimationFrame(() => { acenando.value = true })
  nextTick(() => campo.value?.focus())
})

onMounted(() => campo.value?.focus({ preventScroll: true }))
defineExpose({ focar: () => campo.value?.focus() })
</script>

<template>
  <div
    class="lco" :class="{ 'lco--erro': !!error, 'lco--foco': focado, 'lco--conferindo': verifying, 'lco--acena': acenando }"
    @click="campo?.focus()" @animationend.self="acenando = false"
  >
    <span
      v-for="i in DIGITOS" :key="i" class="lco__casa"
      :class="{ 'lco__casa--vez': focado && !verifying && codigo.length === i - 1, 'lco__casa--cheia': !!codigo[i - 1] }"
      aria-hidden="true"
    ><span v-if="codigo[i - 1]" class="lco__num">{{ codigo[i - 1] }}</span></span>
    <input
      ref="campo" class="lco__campo" :value="codigo" type="text" inputmode="numeric" pattern="[0-9]*"
      autocomplete="one-time-code" maxlength="6" :aria-label="rotulo" :aria-invalid="!!error" :disabled="verifying"
      @input="aoDigitar" @keydown.enter.prevent="aoConfirmar" @focus="focado = true" @blur="focado = false"
    >
  </div>
</template>

<style scoped>
/* as seis casas na linguagem do campo da Aportou: brancas, borda de 1,5px,
   raio 16. A casa da vez acende no cobalto (é o foco visível do campo). */
.lco { position: relative; display: flex; gap: 8px; cursor: text; }
.lco__casa {
  position: relative; flex: 1; min-width: 0; height: 64px; display: grid; place-items: center; box-sizing: border-box;
  border: 1.5px solid var(--nu-borda-campo); border-radius: var(--nu-r-input); background: var(--nu-white); color: var(--nu-ink);
  font-size: clamp(26px, 7vw, 32px); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); font-variant-numeric: tabular-nums;
  outline: 3px solid transparent; outline-offset: 4px;
  transition: border-color var(--nu-dur-media) var(--nu-ease-cor), outline-color var(--nu-dur-rapida) var(--nu-ease-cor), outline-offset var(--nu-dur-media) var(--nu-ease-saida);
}
.lco:hover .lco__casa:not(.lco__casa--cheia) { border-color: color-mix(in srgb, var(--nu-borda-campo), var(--nu-ink) 30%); }
.lco__casa--cheia, .lco:hover .lco__casa--cheia { border-color: var(--nu-ink); }
.lco__casa--vez, .lco:hover .lco__casa--vez { border-color: var(--nu-blue); outline-color: var(--nu-blue); outline-offset: 1px; }
/* o número pousa na casa */
.lco__num { display: block; animation: lco-pousa var(--nu-dur-media) var(--nu-ease-saida) both; }
/* o cursor da casa da vez (o do campo de verdade é transparente) */
.lco__casa--vez::after {
  content: ''; position: absolute; left: 50%; top: 50%; width: 2px; height: 30px; margin: -15px 0 0 -1px; border-radius: 1px;
  background: var(--nu-blue); animation: lco-cursor calc(var(--nu-dur-entrada) * 1.5) steps(1) infinite;
}
/* o erro: as casas no vermelho e a fila acena uma vez, sem mudar a altura */
.lco--erro .lco__casa, .lco--erro:hover .lco__casa { border-color: var(--nu-red); }
.lco--erro .lco__casa--vez { outline-color: var(--nu-red); }
.lco--erro .lco__casa--vez::after { background: var(--nu-red); }
.lco--acena { animation: lco-acena var(--nu-dur-lenta) var(--nu-ease-cor); }
/* o campo de verdade, invisível por cima das casas */
.lco__campo {
  position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; padding: 0; border: 0; outline: none;
  opacity: 0.01; background: transparent; color: transparent; caret-color: transparent; font-size: 16px; letter-spacing: 2em;
}
.lco__campo:disabled { cursor: default; }
/* o foco visível é a casa da vez (lco__casa--vez) */

/* conferindo: as casas respiram devagar, uma depois da outra */
.lco--conferindo .lco__casa { animation: lco-confere calc(var(--nu-dur-entrada) * 1.6) var(--nu-ease-cor) infinite; }
.lco--conferindo .lco__casa:nth-child(2) { animation-delay: 60ms; }
.lco--conferindo .lco__casa:nth-child(3) { animation-delay: 120ms; }
.lco--conferindo .lco__casa:nth-child(4) { animation-delay: 180ms; }
.lco--conferindo .lco__casa:nth-child(5) { animation-delay: 240ms; }
.lco--conferindo .lco__casa:nth-child(6) { animation-delay: 300ms; }
@keyframes lco-confere { 50% { opacity: .58; } }
@keyframes lco-pousa { from { opacity: 0; transform: translateY(6px) scale(.94); } }
@keyframes lco-cursor { 50% { opacity: 0; } }
@keyframes lco-acena { 0%, 100% { transform: none; } 18% { transform: translateX(-6px); } 42% { transform: translateX(5px); } 66% { transform: translateX(-3px); } 84% { transform: translateX(1px); } }
@media (prefers-reduced-motion: reduce) {
  .lco, .lco__casa, .lco__num, .lco__casa--vez::after { animation: none !important; transition: none; }
}
</style>

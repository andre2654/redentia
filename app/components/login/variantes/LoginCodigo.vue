<script setup lang="ts">
// O campo do código de 6 números das três variações do /login (protótipo de
// 03/11/2026). Um input de verdade, invisível, por cima das seis casas (como
// na folha de cadastro): o teclado numérico, o colar e o autofill do código
// do SMS/e-mail (one-time-code) caem nele inteiros. O comportamento é o do
// LoginPinStep: no 6º número envia sozinho (uma vez por código), e o erro do
// backend limpa as casas e devolve o foco.
// `tom`: 'pilula' (dentro do anel iridescente), 'escuro' (sobre a noite) e
// 'caixas' (as casas de creme da folha). 16 px no input: o iOS não dá zoom.
const props = withDefaults(defineProps<{
  verifying: boolean
  error: string | null
  tom?: 'pilula' | 'escuro' | 'caixas'
  rotulo?: string
}>(), { tom: 'caixas', rotulo: 'Código de 6 números' })
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
    class="lco" :class="[`lco--${tom}`, { 'lco--erro': !!error, 'lco--foco': focado, 'lco--conferindo': verifying }]"
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
.lco { position: relative; display: flex; gap: 10px; cursor: text; }
.lco__casa {
  flex: 1; min-width: 0; display: grid; place-items: center; box-sizing: border-box;
  font-variant-numeric: tabular-nums; font-weight: 700; transition: border-color .2s, background .2s, box-shadow .2s;
}
/* o campo de verdade, invisível por cima das casas */
.lco__campo {
  position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; padding: 0; border: 0; outline: none;
  opacity: 0.01; background: transparent; color: transparent; caret-color: transparent; font-size: 16px; letter-spacing: 2em;
}
.lco__campo:disabled { cursor: default; }

/* caixas: as casas de creme da folha de cadastro */
.lco--caixas .lco__casa {
  height: 60px; border-radius: var(--nu-r-tile); background: var(--nu-white);
  box-shadow: inset 0 0 0 1.5px var(--nu-cream-line); color: var(--nu-ink); font-size: var(--nu-fs-h3);
}
.lco--caixas .lco__casa--vez { box-shadow: inset 0 0 0 2px var(--nu-blue); }
.lco--caixas.lco--erro .lco__casa { box-shadow: inset 0 0 0 1.5px var(--nu-red); }

/* escuro: traços de luz sobre a noite */
.lco--escuro .lco__casa {
  height: 60px; border-bottom: 2px solid var(--nu-white-18); color: var(--nu-agora-texto); font-size: clamp(26px, 2.6vw, 32px);
}
.lco--escuro .lco__casa--cheia { border-bottom-color: var(--nu-white-60); }
.lco--escuro .lco__casa--vez { border-bottom-color: var(--nu-agora-azul); box-shadow: 0 10px 18px -12px var(--nu-agora-azul); }
.lco--escuro.lco--erro .lco__casa { border-bottom-color: var(--nu-agora-vermelho); }

/* pilula: seis casas soltas dentro da barra do anel */
.lco--pilula { gap: 6px; padding: 0 6px; }
.lco--pilula .lco__casa { height: 44px; border-radius: 12px; color: var(--nu-ink); font-size: var(--nu-fs-2xl); }
.lco--pilula .lco__casa::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--nu-cream-line); grid-area: 1 / 1; }
.lco--pilula .lco__casa--cheia::after { display: none; }
.lco--pilula .lco__casa--vez::after { width: 2px; height: 26px; border-radius: 1px; background: var(--nu-blue); animation: lco-pisca 1s steps(1) infinite; }
.lco--pilula.lco--erro .lco__casa { color: var(--nu-red-text); }

.lco--conferindo .lco__casa { animation: lco-confere 1.1s ease-in-out infinite; }
.lco--conferindo .lco__casa:nth-child(2) { animation-delay: .08s; }
.lco--conferindo .lco__casa:nth-child(3) { animation-delay: .16s; }
.lco--conferindo .lco__casa:nth-child(4) { animation-delay: .24s; }
.lco--conferindo .lco__casa:nth-child(5) { animation-delay: .32s; }
.lco--conferindo .lco__casa:nth-child(6) { animation-delay: .4s; }

@keyframes lco-pisca { 50% { opacity: 0; } }
@keyframes lco-confere { 50% { opacity: .45; } }
@media (prefers-reduced-motion: reduce) {
  .lco__casa, .lco__casa::after { animation: none !important; transition: none; }
}
</style>

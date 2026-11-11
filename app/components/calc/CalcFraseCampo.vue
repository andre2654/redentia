<script setup lang="ts">
// Um campo da frase das calculadoras (21/10/2026): o valor aparece no meio da
// frase, em azul ("Tenho [35 anos], quero me aposentar aos [60]…"), e o toque
// abre um painel pequeno com o rótulo, − e +, o número exato para digitar, o
// trilho e os atalhos. No celular o painel sobe do pé da tela.
// Só um painel fica aberto por vez; Esc, "Pronto", um toque fora ou mudar o
// tamanho da janela fecham. O painel vai para o <body> (Teleport): a seção da
// calculadora entra com uma animação de transform que prende o position: fixed
// da folha do celular e fazia a página rolar até o pé da seção. No computador
// ele fica embaixo do valor, pela posição medida na hora de abrir.
// Aportou (11/11/2026): o valor é o selo azul da marca (--nu-blue-bg com a
// letra em --nu-blue-text); o número exato é um campo dos quadros (56px, borda
// 1,5px, raio 16, anel cobalto no foco); − e + são círculos de 44px; a folha
// do celular entra com nu-subir.
// `livre` (11/11/2026, a preço-teto): min e max são só a faixa do TRILHO, não
// o limite do valor. É a regra que os campos dela já tinham (dono, 14/07/2026:
// dá para digitar acima do teto do slider); só não desce de zero quando o
// mínimo é zero ou mais. `casas` fixa as casas decimais aceitas quando elas
// não são as do passo (campo de centavos com passo de 50 centavos).
const props = defineProps<{
  modelValue: number
  /** o nome do campo, no topo do painel e para o leitor de tela */
  rotulo: string
  min: number
  max: number
  passo: number
  /** o valor já formatado, como aparece na frase ("R$ 5.000", "60") */
  texto: string
  /** antes e depois do número exato no painel ("R$", "anos", "% a.a.") */
  prefixo?: string
  sufixo?: string
  atalhos?: { label: string; value: number }[]
  /** min e max valem só para o trilho: digitar, − e + não prendem na faixa */
  livre?: boolean
  /** casas decimais aceitas, quando não são as do passo */
  casas?: number
}>()
const emit = defineEmits<{ 'update:modelValue': [v: number] }>()

const meu = Symbol('campo')
const aberto = computed(() => campoAberto.value === meu)
const raiz = ref<HTMLElement | null>(null)
const botao = ref<HTMLButtonElement | null>(null)
const painel = ref<HTMLElement | null>(null)
const trilho = ref<HTMLInputElement | null>(null)
const posicao = ref<Record<string, string>>({})
const rascunho = ref('')
const LARGURA = 300

const casas = computed(() => {
  if (props.casas != null) return props.casas
  const s = String(props.passo)
  const i = s.indexOf('.')
  return i === -1 ? 0 : s.length - i - 1
})
const pct = computed(() => {
  const span = props.max - props.min
  return span > 0 ? Math.max(0, Math.min(100, ((props.modelValue - props.min) / span) * 100)) : 0
})
const prender = (v: number) => props.livre
  ? (props.min >= 0 ? Math.max(0, v) : v)
  : Math.min(props.max, Math.max(props.min, v))
const arredondar = (v: number) => Number(v.toFixed(casas.value))
const paraTexto = (v: number) => (casas.value ? v.toFixed(casas.value).replace(/0+$/, '').replace(/\.$/, '') : String(Math.round(v))).replace('.', ',')

function definir(v: number) {
  const n = arredondar(prender(v))
  if (n !== props.modelValue) emit('update:modelValue', n)
  rascunho.value = paraTexto(n)
}
function andar(dir: 1 | -1) {
  const alvo = props.modelValue + dir * props.passo
  // no campo livre o − para no mínimo do trilho; o + segue além do teto
  definir(props.livre && dir < 0 && props.modelValue > props.min ? Math.max(props.min, alvo) : alvo)
}
function arrastar(e: Event) {
  definir(Number((e.target as HTMLInputElement).value))
}
// "5.000" de quem digita no jeito brasileiro é cinco mil; "10,75" é dez e três quartos
function lerNumero(t: string): number | null {
  const limpo = t.trim().replace(/\s/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.').replace(/[^\d.-]/g, '')
  if (!limpo) return null
  const n = Number(limpo)
  return Number.isFinite(n) ? n : null
}
function digitar(e: Event) {
  rascunho.value = (e.target as HTMLInputElement).value
  const n = lerNumero(rascunho.value)
  // enquanto digita, só vale o que já está dentro do intervalo
  if (n !== null && (props.livre ? n === prender(n) : n >= props.min && n <= props.max)) emit('update:modelValue', arredondar(n))
}
function firmarRascunho() {
  const n = lerNumero(rascunho.value)
  definir(n === null ? props.modelValue : n)
}
const igual = (v: number) => Math.abs(props.modelValue - v) < 1e-9

async function abrir() {
  const r = botao.value?.getBoundingClientRect()
  if (r) {
    // embaixo do valor; perto da borda direita, alinhado pela direita dele
    const esquerda = r.left + LARGURA > window.innerWidth - 12 ? r.right - LARGURA : r.left
    posicao.value = {
      '--cfc-topo': `${r.bottom + window.scrollY + 12}px`,
      '--cfc-esquerda': `${Math.max(12, esquerda) + window.scrollX}px`,
    }
  }
  campoAberto.value = meu
  rascunho.value = paraTexto(props.modelValue)
  await nextTick()
  trilho.value?.focus({ preventScroll: true })
}
function fechar(devolverFoco: boolean) {
  if (!aberto.value) return
  firmarRascunho()
  campoAberto.value = null
  if (devolverFoco) botao.value?.focus()
}
function alternar() {
  if (aberto.value) fechar(true)
  else void abrir()
}
function foraDaqui(e: PointerEvent) {
  const alvo = e.target as Node
  if (aberto.value && !raiz.value?.contains(alvo) && !painel.value?.contains(alvo)) fechar(false)
}
function aoRedimensionar() {
  fechar(false)
}
watch(aberto, (a) => {
  if (import.meta.server) return
  if (a) {
    document.addEventListener('pointerdown', foraDaqui, true)
    window.addEventListener('resize', aoRedimensionar)
  }
  else {
    document.removeEventListener('pointerdown', foraDaqui, true)
    window.removeEventListener('resize', aoRedimensionar)
  }
})
onBeforeUnmount(() => {
  if (import.meta.server) return
  document.removeEventListener('pointerdown', foraDaqui, true)
  window.removeEventListener('resize', aoRedimensionar)
  if (aberto.value) campoAberto.value = null
})
</script>

<script lang="ts">
// um painel aberto por vez, entre todos os campos da página
const campoAberto = shallowRef<symbol | null>(null)
</script>

<template>
  <span ref="raiz" class="cfc">
    <button
      ref="botao" type="button" class="cfc__valor" :class="{ 'cfc__valor--on': aberto }"
      aria-haspopup="dialog" :aria-expanded="aberto" :aria-label="`${rotulo}: ${texto}. Mudar`" @click="alternar"
    >{{ texto }}</button>
    <Teleport to="body">
    <span
      v-if="aberto" ref="painel" class="cfc__painel" :style="posicao"
      role="dialog" :aria-label="rotulo" @keydown.esc.stop.prevent="fechar(true)"
    >
      <span class="cfc__rotulo">{{ rotulo }}</span>
      <span class="cfc__linha">
        <button type="button" class="cfc__passo" :aria-label="`Menos ${rotulo.toLowerCase()}`" :disabled="modelValue <= min" @click="andar(-1)">−</button>
        <label class="cfc__exato">
          <span v-if="prefixo" class="cfc__unidade">{{ prefixo }}</span>
          <input
            :value="rascunho" class="cfc__campo" type="text" inputmode="decimal" autocomplete="off"
            :aria-label="`${rotulo}, valor exato`" @input="digitar" @blur="firmarRascunho" @keydown.enter.prevent="fechar(true)"
          >
          <span v-if="sufixo" class="cfc__unidade">{{ sufixo }}</span>
        </label>
        <button type="button" class="cfc__passo" :aria-label="`Mais ${rotulo.toLowerCase()}`" :disabled="!livre && modelValue >= max" @click="andar(1)">+</button>
      </span>
      <input
        ref="trilho" type="range" class="cfc__trilho" :min="min" :max="max" :step="passo" :value="modelValue"
        :style="{ '--cfc-p': `${pct}%` }" :aria-label="rotulo" :aria-valuetext="texto" @input="arrastar"
      >
      <span v-if="atalhos?.length" class="cfc__atalhos">
        <button
          v-for="a in atalhos" :key="a.value" type="button" class="cfc__atalho" :class="{ 'cfc__atalho--on': igual(a.value) }"
          :aria-pressed="igual(a.value)" @click="definir(a.value)"
        >{{ a.label }}</button>
      </span>
      <button type="button" class="cfc__pronto" @click="fechar(true)">Pronto</button>
    </span>
    </Teleport>
  </span>
</template>

<style scoped>
.cfc { position: relative; white-space: nowrap; }
.cfc__valor {
  display: inline; margin: 0; padding: 0 0.32em 0.08em; border: 0; border-radius: 0.36em; cursor: pointer;
  font: inherit; letter-spacing: inherit; color: var(--nu-blue-text);
  background: var(--nu-blue-bg);
  box-shadow: inset 0 -2px 0 var(--nu-blue);
  transition: background .18s ease, color .18s ease, box-shadow .18s ease;
}
.cfc__valor:hover { background: color-mix(in srgb, var(--nu-blue) 18%, var(--nu-white)); }
.cfc__valor--on, .cfc__valor--on:hover { color: var(--nu-white); background: var(--nu-blue); box-shadow: none; }
.cfc__valor:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 2px; }

.cfc__painel {
  position: absolute; left: var(--cfc-esquerda, 12px); top: var(--cfc-topo, 12px); z-index: 90;
  display: flex; flex-direction: column; gap: 12px; width: 300px; padding: 18px 18px 16px;
  white-space: normal; text-align: left;
  background: var(--nu-white); border-radius: var(--nu-r-panel);
  box-shadow: var(--nu-shadow-float), 0 0 0 1px var(--nu-line-2);
  font-size: var(--nu-fs-md); font-weight: 500; letter-spacing: 0; line-height: 1.4; color: var(--nu-ink);
  animation: cfc-abre .22s var(--nu-ease-saida) both;
}
@keyframes cfc-abre { from { opacity: 0; transform: translateY(-6px) scale(.98); } }
.cfc__rotulo { color: var(--nu-ink); font-size: 15px; font-weight: var(--nu-w-medio); }
.cfc__linha { display: flex; align-items: center; gap: 10px; }
.cfc__passo {
  flex: none; width: 44px; height: 44px; border: 0; border-radius: 50%; cursor: pointer;
  display: grid; place-items: center; background: var(--nu-cream-2); color: var(--nu-ink);
  font: inherit; font-size: var(--nu-fs-xl); font-weight: var(--nu-w-medio);
  transition: background .2s, transform .15s var(--nu-ease-saida);
}
.cfc__passo:active:not(:disabled) { transform: scale(.94); }
.cfc__passo:hover:not(:disabled) { background: var(--nu-line-2); }
.cfc__passo:disabled { opacity: .4; cursor: default; }
.cfc__exato {
  flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; gap: 6px;
  height: 56px; padding: 0 12px; border-radius: var(--nu-r-input); border: 1.5px solid var(--nu-borda-campo);
  background: var(--nu-white); cursor: text;
}
.cfc__exato:focus-within { outline: 3px solid var(--nu-blue); outline-offset: 1px; border-color: var(--nu-blue); }
.cfc__unidade { flex: none; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.cfc__campo {
  width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; text-align: center;
  font: inherit; font-size: var(--nu-fs-xl); font-weight: var(--nu-w-forte); letter-spacing: -0.02em; color: var(--nu-ink);
  font-variant-numeric: tabular-nums;
}
.cfc__trilho {
  width: 100%; height: 22px; margin: 0; background: transparent; cursor: pointer;
  -webkit-appearance: none; appearance: none;
}
.cfc__trilho::-webkit-slider-runnable-track {
  height: 6px; border-radius: 999px;
  background: linear-gradient(to right, var(--nu-blue) var(--cfc-p), var(--nu-cream-2) var(--cfc-p));
}
.cfc__trilho::-moz-range-track { height: 6px; border-radius: 999px; background: var(--nu-cream-2); }
.cfc__trilho::-moz-range-progress { height: 6px; border-radius: 999px; background: var(--nu-blue); }
.cfc__trilho::-webkit-slider-thumb {
  -webkit-appearance: none; width: 22px; height: 22px; margin-top: -8px; border-radius: 50%;
  background: var(--nu-white); box-shadow: 0 0 0 3px var(--nu-blue), var(--nu-shadow-slider-thumb);
}
.cfc__trilho::-moz-range-thumb {
  width: 22px; height: 22px; border: 0; border-radius: 50%;
  background: var(--nu-white); box-shadow: 0 0 0 3px var(--nu-blue);
}
.cfc__trilho:focus-visible { outline: none; }
.cfc__trilho:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 3px var(--nu-blue), 0 0 0 7px color-mix(in srgb, var(--nu-blue) 25%, transparent); }
.cfc__atalhos { display: flex; flex-wrap: wrap; gap: 6px; }
.cfc__atalho {
  min-height: 36px; padding: 0 13px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  background: var(--nu-cream-2);
  font: inherit; font-size: var(--nu-fs-sm); font-weight: 600; color: var(--nu-gray-3);
  transition: background .2s, color .2s;
}
.cfc__atalho:hover { background: var(--nu-line-2); color: var(--nu-ink); }
.cfc__atalho--on, .cfc__atalho--on:hover { background: var(--nu-ink); color: var(--nu-white); }
.cfc__pronto {
  align-self: flex-end; min-height: 44px; padding: 0 22px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); font: inherit; font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio);
  transition: background .2s, transform .15s var(--nu-ease-saida);
}
.cfc__pronto:hover { background: var(--nu-blue-hover); }
.cfc__pronto:active { transform: scale(.98); }

/* no celular o painel sobe do pé da tela */
@media (max-width: 640px) {
  .cfc__painel {
    position: fixed; left: 12px; right: 12px; top: auto; bottom: calc(12px + env(safe-area-inset-bottom));
    width: auto; z-index: 80; border-radius: var(--nu-r-card);
    animation: nu-subir .32s var(--nu-ease-saida) both;
  }
  .cfc__atalho { min-height: 44px; padding: 0 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .cfc__painel { animation: none; }
  .cfc__valor { transition: none; }
}
</style>

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
// Robustez (11/11/2026, docs/aportou/robustez.md): o selo diz "isto se mexe"
// sem gritar. Em repouso, o fundo azul claro e um fio reto de 1,5px embaixo
// (não acompanha o raio); sob o ponteiro o fundo aprofunda e o fio engrossa;
// apertado, aprofunda mais; no foco, o anel de 3px; aberto, vira o cobalto
// cheio e o fio recolhe para o centro. O painel chega de cima, 6px e 98%, em
// --nu-dur-lenta --nu-ease-saida, a partir do canto do selo, e sai pelo mesmo
// caminho, mais rápido (--nu-dur-rapida); no celular a folha sobe do pé e
// desce para ele. O número exato vem com o ponto do milhar ("1.000", como no
// selo); − e + são desenhados (traço de 1,75px), os atalhos ficam numa grade
// de colunas iguais e o trilho ganha um halo no ponteiro e ao arrastar.
// `leitura` (a preço-teto, "Os dados desta conta"): o valor aparece como texto
// em carvão, no mesmo lugar e com o mesmo respiro do selo. Ao virar editável
// ("Usar meus números"), o selo ACENDE ali mesmo (o fundo e o fio entram, a
// letra vira cobalto) sem a linha se mexer; ao voltar, apaga pelo inverso.
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
  /** só para ler: o valor em texto, sem o selo (e sem painel) */
  leitura?: boolean
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
const LARGURA = 320

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
// a grade dos atalhos: colunas iguais; quatro curtos ("55", "5%") cabem numa linha, três médios também
const colunasDosAtalhos = computed(() => {
  const a = props.atalhos ?? []
  const maior = Math.max(0, ...a.map((x) => x.label.length))
  if (a.length === 4 && maior <= 5) return 4
  if (a.length === 3 && maior <= 8) return 3
  return 2
})
const prender = (v: number) => props.livre
  ? (props.min >= 0 ? Math.max(0, v) : v)
  : Math.min(props.max, Math.max(props.min, v))
const arredondar = (v: number) => Number(v.toFixed(casas.value))
// o número exato no jeito do selo: ponto no milhar, vírgula nos centavos, sem zero à toa
const paraTexto = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: casas.value, useGrouping: true })

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
    const pelaDireita = r.left + LARGURA > window.innerWidth - 12
    const esquerda = pelaDireita ? r.right - LARGURA : r.left
    posicao.value = {
      '--cfc-topo': `${r.bottom + window.scrollY + 12}px`,
      '--cfc-esquerda': `${Math.max(12, esquerda) + window.scrollX}px`,
      // o painel nasce do canto do selo
      '--cfc-origem': pelaDireita ? 'top right' : 'top left',
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
// a troca entre ler e editar: o selo acende ou apaga no lugar (só depois da primeira troca)
const trocou = ref(false)
watch(() => props.leitura, (agora) => {
  trocou.value = true
  if (agora) fechar(false)
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
    <span v-if="leitura" class="cfc__valor cfc__valor--leitura" :class="{ 'cfc__valor--apaga': trocou }">{{ texto }}</span>
    <button
      v-else ref="botao" type="button" class="cfc__valor" :class="{ 'cfc__valor--on': aberto, 'cfc__valor--acende': trocou }"
      aria-haspopup="dialog" :aria-expanded="aberto" :aria-label="`${rotulo}: ${texto}. Mudar`" @click="alternar"
    >{{ texto }}</button>
    <Teleport to="body">
    <Transition name="cfc-painel">
    <span
      v-if="aberto" ref="painel" class="cfc__painel" :style="posicao"
      role="dialog" :aria-label="rotulo" @keydown.esc.stop.prevent="fechar(true)"
    >
      <span class="cfc__rotulo">{{ rotulo }}</span>
      <span class="cfc__linha">
        <button type="button" class="cfc__passo" :aria-label="`Menos ${rotulo.toLowerCase()}`" :disabled="modelValue <= min" @click="andar(-1)">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5.5 12h13" /></svg>
        </button>
        <label class="cfc__exato">
          <span v-if="prefixo" class="cfc__unidade">{{ prefixo }}</span>
          <input
            :value="rascunho" class="cfc__campo" type="text" inputmode="decimal" autocomplete="off"
            :aria-label="`${rotulo}, valor exato`" @input="digitar" @blur="firmarRascunho" @keydown.enter.prevent="fechar(true)"
          >
          <span v-if="sufixo" class="cfc__unidade">{{ sufixo }}</span>
        </label>
        <button type="button" class="cfc__passo" :aria-label="`Mais ${rotulo.toLowerCase()}`" :disabled="!livre && modelValue >= max" @click="andar(1)">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5.5v13M5.5 12h13" /></svg>
        </button>
      </span>
      <input
        ref="trilho" type="range" class="cfc__trilho" :min="min" :max="max" :step="passo" :value="modelValue"
        :style="{ '--cfc-p': `${pct}%` }" :aria-label="rotulo" :aria-valuetext="texto" @input="arrastar"
      >
      <span v-if="atalhos?.length" class="cfc__atalhos" :style="{ '--cfc-colunas': colunasDosAtalhos }">
        <button
          v-for="a in atalhos" :key="a.value" type="button" class="cfc__atalho" :class="{ 'cfc__atalho--on': igual(a.value) }"
          :aria-pressed="igual(a.value)" @click="definir(a.value)"
        >{{ a.label }}</button>
      </span>
      <button type="button" class="cfc__pronto" @click="fechar(true)">Pronto</button>
    </span>
    </Transition>
    </Teleport>
  </span>
</template>

<style scoped>
.cfc { position: relative; white-space: nowrap; }
/* o selo: fundo azul claro e o fio reto embaixo (as variáveis trocam por estado; o fio é um fundo, para não acompanhar o raio) */
.cfc__valor {
  --cfc-fundo: var(--nu-blue-bg); --cfc-tinta: var(--nu-blue-text);
  --cfc-fio: color-mix(in srgb, var(--nu-blue) 62%, transparent); --cfc-fio-l: calc(100% - .5em); --cfc-fio-e: 1.5px;
  display: inline; margin: 0; padding: 0 0.32em 0.08em; border: 0; border-radius: 0.36em; cursor: pointer;
  font: inherit; letter-spacing: inherit; color: var(--cfc-tinta);
  background-color: var(--cfc-fundo);
  background-image: linear-gradient(var(--cfc-fio), var(--cfc-fio));
  background-repeat: no-repeat; background-position: 50% 100%; background-size: var(--cfc-fio-l) var(--cfc-fio-e);
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor), background-size var(--nu-dur-media) var(--nu-ease-saida);
}
.cfc__valor:hover { --cfc-fundo: color-mix(in srgb, var(--nu-blue) 16%, var(--nu-white)); --cfc-fio: var(--nu-blue); --cfc-fio-e: 2px; }
.cfc__valor:active { --cfc-fundo: color-mix(in srgb, var(--nu-blue) 24%, var(--nu-white)); transition-duration: var(--nu-dur-rapida); }
.cfc__valor--on, .cfc__valor--on:hover, .cfc__valor--on:active { --cfc-fundo: var(--nu-blue); --cfc-tinta: var(--nu-white); --cfc-fio-l: 0%; }
.cfc__valor:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 2px; }
/* só para ler: o texto em carvão no lugar do selo, com o mesmo respiro (a linha não se mexe na troca) */
/* (o botão é sempre uma caixa em linha: o texto também, para as duas terem a mesma altura) */
.cfc__valor--leitura { display: inline-block; --cfc-fundo: transparent; --cfc-tinta: var(--nu-ink); --cfc-fio-l: 0%; cursor: auto; }
.cfc__valor--acende { animation: cfc-acende var(--nu-dur-lenta) var(--nu-ease-saida) both; }
.cfc__valor--apaga { animation: cfc-apaga var(--nu-dur-media) var(--nu-ease-cor) both; }
@keyframes cfc-acende { from { background-color: transparent; background-size: 0% 1.5px; color: var(--nu-ink); } }
@keyframes cfc-apaga { from { background-color: var(--nu-blue-bg); color: var(--nu-blue-text); } }

.cfc__painel {
  position: absolute; left: var(--cfc-esquerda, 12px); top: var(--cfc-topo, 12px); z-index: 90;
  display: flex; flex-direction: column; gap: 12px; width: 320px; padding: 18px 18px 16px;
  white-space: normal; text-align: left; transform-origin: var(--cfc-origem, top left);
  background: var(--nu-white); border-radius: var(--nu-r-panel);
  box-shadow: var(--nu-shadow-float);
  font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); letter-spacing: 0; line-height: 1.4; color: var(--nu-ink);
}
/* chega de cima, a partir do canto do selo; sai pelo mesmo caminho, mais rápido */
.cfc-painel-enter-active { transition: opacity var(--nu-dur-media) var(--nu-ease-saida), transform var(--nu-dur-lenta) var(--nu-ease-saida); }
.cfc-painel-leave-active { transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-cor); }
.cfc-painel-enter-from, .cfc-painel-leave-to { opacity: 0; transform: translateY(-6px) scale(.98); }

.cfc__rotulo { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
.cfc__linha { display: flex; align-items: center; gap: 10px; }
.cfc__passo {
  flex: none; width: 44px; height: 44px; border: 0; border-radius: 50%; cursor: pointer; padding: 0;
  display: grid; place-items: center; background: var(--nu-cream-2); color: var(--nu-ink);
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida), opacity var(--nu-dur-media) var(--nu-ease-cor);
}
.cfc__passo svg { display: block; width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.9; stroke-linecap: round; }
.cfc__passo:hover:not(:disabled) { background: var(--nu-line-2); }
.cfc__passo:active:not(:disabled) { transform: scale(.94); }
.cfc__passo:disabled { opacity: .4; cursor: not-allowed; }
.cfc__exato {
  flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; gap: 6px;
  height: 56px; padding: 0 12px; border-radius: var(--nu-r-input); border: 1.5px solid var(--nu-borda-campo);
  background: var(--nu-white); cursor: text;
  transition: border-color var(--nu-dur-media) var(--nu-ease-cor);
}
.cfc__exato:hover { border-color: var(--nu-gray); }
.cfc__exato:focus-within { outline: 3px solid var(--nu-blue); outline-offset: 1px; border-color: var(--nu-blue); }
.cfc__unidade { flex: none; color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); }
.cfc__campo {
  width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; text-align: center;
  font: inherit; font-size: var(--nu-fs-xl); font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-titulo); color: var(--nu-ink);
  font-variant-numeric: tabular-nums; caret-color: var(--nu-blue);
}
/* o trilho: 6px, cobalto até o valor; o botão branco com o anel cobalto ganha um halo no ponteiro e ao arrastar */
.cfc__trilho {
  width: 100%; height: 22px; margin: 0; background: transparent; cursor: pointer;
  -webkit-appearance: none; appearance: none;
}
.cfc__trilho::-webkit-slider-runnable-track {
  height: 6px; border-radius: var(--nu-r-pill);
  background: linear-gradient(to right, var(--nu-blue) var(--cfc-p), var(--nu-cream-2) var(--cfc-p));
}
.cfc__trilho::-moz-range-track { height: 6px; border-radius: var(--nu-r-pill); background: var(--nu-cream-2); }
.cfc__trilho::-moz-range-progress { height: 6px; border-radius: var(--nu-r-pill); background: var(--nu-blue); }
.cfc__trilho::-webkit-slider-thumb {
  -webkit-appearance: none; width: 22px; height: 22px; margin-top: -8px; border-radius: 50%; cursor: grab;
  background: var(--nu-white); box-shadow: 0 0 0 3px var(--nu-blue), 0 0 0 3px transparent, var(--nu-shadow-slider-thumb);
  transition: box-shadow var(--nu-dur-media) var(--nu-ease-saida);
}
.cfc__trilho::-moz-range-thumb {
  width: 22px; height: 22px; border: 0; border-radius: 50%; cursor: grab;
  background: var(--nu-white); box-shadow: 0 0 0 3px var(--nu-blue);
}
.cfc__trilho:hover::-webkit-slider-thumb { box-shadow: 0 0 0 3px var(--nu-blue), 0 0 0 8px color-mix(in srgb, var(--nu-blue) 14%, transparent), var(--nu-shadow-slider-thumb); }
.cfc__trilho:active::-webkit-slider-thumb { cursor: grabbing; box-shadow: 0 0 0 3px var(--nu-blue), 0 0 0 10px color-mix(in srgb, var(--nu-blue) 20%, transparent), var(--nu-shadow-slider-thumb); }
.cfc__trilho:focus-visible { outline: none; }
.cfc__trilho:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 3px var(--nu-blue), 0 0 0 7px color-mix(in srgb, var(--nu-blue) 25%, transparent); }
.cfc__trilho:focus-visible::-moz-range-thumb { box-shadow: 0 0 0 3px var(--nu-blue), 0 0 0 7px color-mix(in srgb, var(--nu-blue) 25%, transparent); }
/* os atalhos: colunas iguais (a contagem vem do script) */
.cfc__atalhos { display: grid; grid-template-columns: repeat(var(--cfc-colunas, 2), minmax(0, 1fr)); gap: 6px; }
.cfc__atalho {
  min-height: 36px; padding: 0 10px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  background: var(--nu-cream-2); white-space: nowrap;
  font: inherit; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); color: var(--nu-gray-3);
  font-variant-numeric: tabular-nums; -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.cfc__atalho:hover { background: var(--nu-line-2); color: var(--nu-ink); }
.cfc__atalho:active { transform: scale(.97); }
.cfc__atalho--on, .cfc__atalho--on:hover { background: var(--nu-ink); color: var(--nu-white); }
.cfc__pronto {
  align-self: flex-end; min-height: 44px; padding: 0 22px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); font: inherit; font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.cfc__pronto:hover { background: var(--nu-blue-hover); }
.cfc__pronto:active { transform: scale(.98); }

/* no celular o painel sobe do pé da tela e desce para ele */
@media (max-width: 640px) {
  .cfc__painel {
    position: fixed; left: 12px; right: 12px; top: auto; bottom: calc(12px + env(safe-area-inset-bottom));
    width: auto; z-index: 80; border-radius: var(--nu-r-card); transform-origin: bottom center;
  }
  .cfc-painel-enter-from, .cfc-painel-leave-to { transform: translateY(24px); }
  .cfc__atalho { min-height: 44px; }
}
@media (prefers-reduced-motion: reduce) {
  .cfc-painel-enter-from, .cfc-painel-leave-to { transform: none; }
}
</style>

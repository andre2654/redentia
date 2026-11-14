<script setup lang="ts">
// O campo dos ativos na frase do simulador de ações (21/10/2026): os tickers
// aparecem no meio da frase, em azul ("em [ITUB4 e VALE3] há 2 anos"), e o
// toque abre um painel com a busca, os escolhidos (× tira) e o "Pronto". O
// mesmo jeito do CalcFraseCampo: o painel vai para o <body>, embaixo do valor
// no computador; no celular ele fica no alto da tela, para o teclado não
// cobrir a busca. Esc, um toque fora ou mudar o tamanho da janela fecham.
// `unico` (11/11/2026, a preço-teto): a conta é de UM ativo. Escolher troca o
// ativo e fecha o painel; não há lista de escolhidos nem limite, e o ativo da
// vez segue na lista (escolher de novo recarrega os números dele). O rótulo do
// painel, o texto da busca e o nome dos sugeridos vêm por prop, com os textos
// de sempre como padrão.
// Robustez (11/11/2026): o selo é o mesmo do CalcFraseCampo (fio reto, hover,
// apertado, foco, aberto) e o painel chega e sai pelo mesmo caminho dele. Na
// lista, o ativo da conta vem marcado (o estado atual à vista) e as setas do
// teclado andam pelos achados a partir da busca (Enter escolhe o primeiro).
interface Ativo {
  id: string
  label: string
  suffix?: string
}

const props = withDefaults(defineProps<{
  modelValue: Ativo[]
  /** todos os ativos que a busca acha (o /tickers-full) */
  ativos: Ativo[]
  carregando?: boolean
  /** os sugeridos com a busca vazia, por ticker */
  sugeridos?: string[]
  max?: number
  /** um ativo só: escolher troca e fecha */
  unico?: boolean
  /** o nome do campo, no topo do painel e para o leitor de tela */
  rotulo?: string
  placeholder?: string
  /** o nome da lista que aparece com a busca vazia */
  rotuloSugeridos?: string
}>(), { carregando: false, sugeridos: () => [], max: 10, unico: false, rotulo: 'Ativos da simulação', placeholder: 'Buscar ação, FII ou ETF', rotuloSugeridos: 'Sugestões' })
const emit = defineEmits<{ 'update:modelValue': [v: Ativo[]] }>()

const aberto = ref(false)
const raiz = ref<HTMLElement | null>(null)
const botao = ref<HTMLButtonElement | null>(null)
const painel = ref<HTMLElement | null>(null)
const busca = ref<HTMLInputElement | null>(null)
const posicao = ref<Record<string, string>>({})
const termo = ref('')
const LARGURA = 340

const texto = computed(() => {
  const t = props.modelValue.map((a) => a.label)
  if (!t.length) return 'um ativo'
  if (t.length === 1) return t[0]!
  if (t.length === 2) return `${t[0]} e ${t[1]}`
  if (t.length === 3) return `${t[0]}, ${t[1]} e ${t[2]}`
  return `${t[0]}, ${t[1]} e mais ${t.length - 2}`
})
const cheio = computed(() => !props.unico && props.modelValue.length >= props.max)

// com a busca vazia, os sugeridos; com texto, o ticker que começa com ele vem antes do nome que o contém
const achados = computed(() => {
  const escolhidos = new Set(props.modelValue.map((a) => a.id))
  const livres = props.unico ? props.ativos : props.ativos.filter((a) => !escolhidos.has(a.id))
  const t = termo.value.trim().toLowerCase()
  if (!t) {
    const porId = new Map(livres.map((a) => [a.id, a]))
    return props.sugeridos.map((id) => porId.get(id)).filter((a): a is Ativo => Boolean(a)).slice(0, 8)
  }
  const comeca = livres.filter((a) => a.label.toLowerCase().startsWith(t))
  const contem = livres.filter((a) => !a.label.toLowerCase().startsWith(t)
    && (a.label.toLowerCase().includes(t) || (a.suffix ?? '').toLowerCase().includes(t)))
  return [...comeca, ...contem].slice(0, 8)
})

function adicionar(a: Ativo) {
  if (props.unico) {
    emit('update:modelValue', [a])
    fechar(true)
    return
  }
  if (cheio.value || props.modelValue.some((x) => x.id === a.id)) return
  emit('update:modelValue', [...props.modelValue, a])
  termo.value = ''
  busca.value?.focus({ preventScroll: true })
}
function tirar(id: string) {
  emit('update:modelValue', props.modelValue.filter((a) => a.id !== id))
}
function adicionarPrimeiro() {
  const a = achados.value[0]
  if (a) adicionar(a)
}
// o ativo que já está na conta (um só): marcado na lista
const atual = computed(() => (props.unico ? props.modelValue[0]?.id ?? null : null))
// as setas andam pelos achados: da busca para o primeiro, entre eles, e de volta à busca
const lista = ref<HTMLElement | null>(null)
function itens(): HTMLButtonElement[] {
  return Array.from(lista.value?.querySelectorAll<HTMLButtonElement>('.cfa__item:not(:disabled)') ?? [])
}
function descerDaBusca() {
  itens()[0]?.focus()
}
function andarNaLista(e: KeyboardEvent) {
  const todos = itens()
  const i = todos.indexOf(document.activeElement as HTMLButtonElement)
  if (i < 0) return
  e.preventDefault()
  if (e.key === 'ArrowDown') todos[Math.min(todos.length - 1, i + 1)]?.focus()
  else if (i === 0) busca.value?.focus()
  else todos[i - 1]?.focus()
}

async function abrir() {
  const r = botao.value?.getBoundingClientRect()
  if (r) {
    const pelaDireita = r.left + LARGURA > window.innerWidth - 12
    const esquerda = pelaDireita ? r.right - LARGURA : r.left
    posicao.value = {
      '--cfa-topo': `${r.bottom + window.scrollY + 12}px`,
      '--cfa-esquerda': `${Math.max(12, esquerda) + window.scrollX}px`,
      '--cfa-origem': pelaDireita ? 'top right' : 'top left',
    }
  }
  aberto.value = true
  termo.value = ''
  await nextTick()
  busca.value?.focus({ preventScroll: true })
}
function fechar(devolverFoco: boolean) {
  if (!aberto.value) return
  aberto.value = false
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
  // no celular o teclado que abre muda a altura da janela: só a largura fecha
  if (window.innerWidth !== larguraAoAbrir) fechar(false)
}
let larguraAoAbrir = 0
watch(aberto, (a) => {
  if (import.meta.server) return
  if (a) {
    larguraAoAbrir = window.innerWidth
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
})
</script>

<template>
  <span ref="raiz" class="cfa">
    <button
      ref="botao" type="button" class="cfa__valor" :class="{ 'cfa__valor--on': aberto, 'cfa__valor--vazio': !modelValue.length }"
      aria-haspopup="dialog" :aria-expanded="aberto" :aria-label="`${unico ? rotulo : 'Ativos'}: ${texto}. Mudar`" @click="alternar"
    >{{ texto }}</button>
    <Teleport to="body">
      <Transition name="cfa-painel">
      <div
        v-if="aberto" ref="painel" class="cfa__painel" :style="posicao"
        role="dialog" :aria-label="rotulo" @keydown.esc.stop.prevent="fechar(true)"
      >
        <span class="cfa__rotulo">{{ rotulo }}</span>
        <div v-if="modelValue.length && !unico" class="cfa__escolhidos">
          <span v-for="a in modelValue" :key="a.id" class="cfa__escolhido">
            {{ a.label }}
            <button type="button" class="cfa__tirar" :aria-label="`Tirar ${a.label}`" @click="tirar(a.id)">×</button>
          </span>
        </div>
        <input
          ref="busca" v-model="termo" type="search" class="cfa__busca" :disabled="cheio"
          :placeholder="cheio ? `Até ${max} ativos por simulação` : placeholder"
          autocomplete="off" enterkeyhint="done" aria-label="Buscar ativo" @keydown.enter.prevent="adicionarPrimeiro" @keydown.down.prevent="descerDaBusca"
        >
        <div ref="lista" class="cfa__lista" @keydown.down="andarNaLista" @keydown.up="andarNaLista">
          <!-- a lista da B3 ainda chegando: o esqueleto das linhas (o leitor de tela ouve o aviso) -->
          <div v-if="carregando && !ativos.length" class="cfa__esqueleto" aria-busy="true">
            <span class="nu-sr">Carregando os ativos da B3…</span>
            <span v-for="i in 3" :key="i" class="cfa__esqueleto-linha"><NuSkeleton variant="line" width="52px" height="13px" /><NuSkeleton variant="line" :width="`${70 - i * 12}%`" height="11px" /></span>
          </div>
          <p v-else-if="!termo && achados.length" class="cfa__nota">{{ rotuloSugeridos }}</p>
          <button
            v-for="a in achados" :key="a.id" type="button" class="cfa__item" :class="{ 'cfa__item--atual': a.id === atual }"
            :aria-current="a.id === atual || undefined" :disabled="cheio" @click="adicionar(a)"
          >
            <b>{{ a.label }}</b>
            <span v-if="a.suffix" class="cfa__nome">{{ a.suffix }}</span>
            <svg v-if="a.id === atual" class="cfa__check" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </button>
          <p v-if="termo && !achados.length && !carregando" class="cfa__nota">Nenhum ativo com “{{ termo }}”.</p>
        </div>
        <button type="button" class="cfa__pronto" @click="fechar(true)">Pronto</button>
      </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style scoped>
.cfa { position: relative; white-space: nowrap; }
/* o mesmo selo dos campos da frase (CalcFraseCampo): fundo azul claro, fio reto, hover, apertado, foco, aberto */
.cfa__valor {
  --cfa-fundo: var(--nu-blue-bg); --cfa-tinta: var(--nu-blue-text);
  --cfa-fio: color-mix(in srgb, var(--nu-blue) 62%, transparent); --cfa-fio-l: calc(100% - .5em); --cfa-fio-e: 1.5px;
  display: inline; margin: 0; padding: 0 0.32em 0.08em; border: 0; border-radius: 0.36em; cursor: pointer;
  font: inherit; letter-spacing: inherit; color: var(--cfa-tinta);
  background-color: var(--cfa-fundo);
  background-image: linear-gradient(var(--cfa-fio), var(--cfa-fio));
  background-repeat: no-repeat; background-position: 50% 100%; background-size: var(--cfa-fio-l) var(--cfa-fio-e);
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), color var(--nu-dur-media) var(--nu-ease-cor), background-size var(--nu-dur-media) var(--nu-ease-saida);
}
.cfa__valor:hover { --cfa-fundo: color-mix(in srgb, var(--nu-blue) 16%, var(--nu-white)); --cfa-fio: var(--nu-blue); --cfa-fio-e: 2px; }
.cfa__valor:active { --cfa-fundo: color-mix(in srgb, var(--nu-blue) 24%, var(--nu-white)); transition-duration: var(--nu-dur-rapida); }
.cfa__valor--vazio { --cfa-tinta: var(--nu-gray-2); }
.cfa__valor--on, .cfa__valor--on:hover, .cfa__valor--on:active { --cfa-fundo: var(--nu-blue); --cfa-tinta: var(--nu-white); --cfa-fio-l: 0%; }
.cfa__valor:focus-visible { outline: 3px solid var(--nu-blue); outline-offset: 2px; }

.cfa__painel {
  position: absolute; left: var(--cfa-esquerda, 12px); top: var(--cfa-topo, 12px); z-index: 90;
  display: flex; flex-direction: column; gap: 12px; width: 340px; padding: 18px 18px 16px;
  transform-origin: var(--cfa-origem, top left);
  background: var(--nu-white); border-radius: var(--nu-r-panel);
  box-shadow: var(--nu-shadow-float);
  font-size: var(--nu-fs-md); font-weight: var(--nu-w-texto); letter-spacing: 0; line-height: 1.4; color: var(--nu-ink); text-align: left;
}
/* chega de cima, a partir do canto do selo; sai pelo mesmo caminho, mais rápido */
.cfa-painel-enter-active { transition: opacity var(--nu-dur-media) var(--nu-ease-saida), transform var(--nu-dur-lenta) var(--nu-ease-saida); }
.cfa-painel-leave-active { transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-cor); }
.cfa-painel-enter-from, .cfa-painel-leave-to { opacity: 0; transform: translateY(-6px) scale(.98); }
.cfa__rotulo { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); }
.cfa__escolhidos { display: flex; flex-wrap: wrap; gap: 6px; }
.cfa__escolhido {
  display: inline-flex; align-items: center; gap: 6px; padding: 5px 5px 5px 11px; border-radius: var(--nu-r-tag);
  background: var(--nu-ink); color: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-forte); letter-spacing: 0.04em;
}
.cfa__tirar {
  display: grid; place-items: center; width: 24px; height: 24px; padding: 0; border: 0; border-radius: 6px; cursor: pointer;
  background: var(--nu-white-18); color: var(--nu-white); font: inherit; font-size: var(--nu-fs-sm); line-height: 1;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor);
}
.cfa__tirar:hover { background: var(--nu-white-35); }
.cfa__busca {
  width: 100%; height: 56px; padding: 0 16px; border: 1.5px solid var(--nu-borda-campo); border-radius: var(--nu-r-input); outline: 0;
  background: var(--nu-white); caret-color: var(--nu-blue);
  font: inherit; font-size: 17px; font-weight: var(--nu-w-medio); color: var(--nu-ink);
  transition: border-color var(--nu-dur-media) var(--nu-ease-cor);
}
.cfa__busca:hover { border-color: var(--nu-gray); }
.cfa__busca:focus { outline: 3px solid var(--nu-blue); outline-offset: 1px; border-color: var(--nu-blue); }
.cfa__busca::placeholder { color: var(--nu-placeholder); font-weight: var(--nu-w-texto); }
.cfa__lista { display: flex; flex-direction: column; max-height: 264px; overflow-y: auto; margin: 0 -6px; }
.cfa__item {
  display: flex; align-items: center; gap: 10px; width: 100%; min-height: 44px; padding: 6px 10px; border: 0; border-radius: var(--nu-r-chip); cursor: pointer;
  background: transparent; text-align: left; font: inherit; color: var(--nu-ink);
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor);
}
.cfa__item:hover:not(:disabled), .cfa__item:focus-visible { background: var(--nu-cream-2); outline: none; }
.cfa__item:active:not(:disabled) { background: var(--nu-line-2); transition-duration: var(--nu-dur-rapida); }
.cfa__item:disabled { opacity: .45; cursor: default; }
.cfa__item b { flex: none; font-size: var(--nu-fs-sm); font-weight: var(--nu-w-forte); letter-spacing: 0.02em; }
.cfa__nome { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--nu-gray); font-size: var(--nu-fs-dense); }
/* o ativo da conta: o ticker em cobalto e o check à direita */
.cfa__item--atual b { color: var(--nu-blue-text); }
.cfa__check { flex: none; width: 18px; height: 18px; margin-left: auto; fill: none; stroke: var(--nu-blue); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
.cfa__esqueleto { display: flex; flex-direction: column; }
.cfa__esqueleto-linha { display: flex; align-items: center; gap: 12px; min-height: 44px; padding: 6px 10px; }
.cfa__nota { margin: 0; padding: 4px 10px; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-texto); }
.cfa__pronto {
  align-self: flex-end; min-height: 44px; padding: 0 22px; border: 0; border-radius: var(--nu-r-pill); cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); font: inherit; font-size: var(--nu-fs-md); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto);
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--nu-dur-media) var(--nu-ease-cor), transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.cfa__pronto:hover { background: var(--nu-blue-hover); }
.cfa__pronto:active { transform: scale(.98); }

/* no celular o painel fica no alto da tela (o teclado da busca cobriria o pé): desce de cima e volta para cima */
@media (max-width: 640px) {
  .cfa__painel {
    position: fixed; left: 12px; right: 12px; top: calc(12px + env(safe-area-inset-top)); bottom: auto;
    width: auto; max-height: calc(100dvh - 24px); overflow-y: auto; z-index: 80; transform-origin: top center;
  }
  .cfa-painel-enter-from, .cfa-painel-leave-to { transform: translateY(-16px); }
  .cfa__lista { max-height: 40dvh; }
}
@media (prefers-reduced-motion: reduce) {
  .cfa-painel-enter-from, .cfa-painel-leave-to { transform: none; }
}
</style>

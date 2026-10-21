<script setup lang="ts">
// O campo dos ativos na frase do simulador de ações (21/10/2026): os tickers
// aparecem no meio da frase, em azul ("em [ITUB4 e VALE3] há 2 anos"), e o
// toque abre um painel com a busca, os escolhidos (× tira) e o "Pronto". O
// mesmo jeito do CalcFraseCampo: o painel vai para o <body>, embaixo do valor
// no computador; no celular ele fica no alto da tela, para o teclado não
// cobrir a busca. Esc, um toque fora ou mudar o tamanho da janela fecham.
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
}>(), { carregando: false, sugeridos: () => [], max: 10 })
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
const cheio = computed(() => props.modelValue.length >= props.max)

// com a busca vazia, os sugeridos; com texto, o ticker que começa com ele vem antes do nome que o contém
const achados = computed(() => {
  const escolhidos = new Set(props.modelValue.map((a) => a.id))
  const livres = props.ativos.filter((a) => !escolhidos.has(a.id))
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

async function abrir() {
  const r = botao.value?.getBoundingClientRect()
  if (r) {
    const esquerda = r.left + LARGURA > window.innerWidth - 12 ? r.right - LARGURA : r.left
    posicao.value = {
      '--cfa-topo': `${r.bottom + window.scrollY + 12}px`,
      '--cfa-esquerda': `${Math.max(12, esquerda) + window.scrollX}px`,
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
      aria-haspopup="dialog" :aria-expanded="aberto" :aria-label="`Ativos: ${texto}. Mudar`" @click="alternar"
    >{{ texto }}</button>
    <Teleport to="body">
      <div
        v-if="aberto" ref="painel" class="cfa__painel" :style="posicao"
        role="dialog" aria-label="Ativos da simulação" @keydown.esc.stop.prevent="fechar(true)"
      >
        <span class="cfa__rotulo">Ativos da simulação</span>
        <div v-if="modelValue.length" class="cfa__escolhidos">
          <span v-for="a in modelValue" :key="a.id" class="cfa__escolhido">
            {{ a.label }}
            <button type="button" class="cfa__tirar" :aria-label="`Tirar ${a.label}`" @click="tirar(a.id)">×</button>
          </span>
        </div>
        <input
          ref="busca" v-model="termo" type="search" class="cfa__busca" :disabled="cheio"
          :placeholder="cheio ? `Até ${max} ativos por simulação` : 'Buscar ação, FII ou ETF'"
          autocomplete="off" enterkeyhint="done" aria-label="Buscar ativo" @keydown.enter.prevent="adicionarPrimeiro"
        >
        <div class="cfa__lista">
          <p v-if="carregando && !ativos.length" class="cfa__nota">Carregando os ativos da B3…</p>
          <p v-else-if="!termo && achados.length" class="cfa__nota">Sugestões</p>
          <button v-for="a in achados" :key="a.id" type="button" class="cfa__item" :disabled="cheio" @click="adicionar(a)">
            <b>{{ a.label }}</b>
            <span v-if="a.suffix" class="cfa__nome">{{ a.suffix }}</span>
          </button>
          <p v-if="termo && !achados.length && !carregando" class="cfa__nota">Nenhum ativo com “{{ termo }}”.</p>
        </div>
        <button type="button" class="cfa__pronto" @click="fechar(true)">Pronto</button>
      </div>
    </Teleport>
  </span>
</template>

<style scoped>
.cfa { position: relative; white-space: nowrap; }
/* o mesmo valor azul dos campos da frase (CalcFraseCampo) */
.cfa__valor {
  display: inline; margin: 0; padding: 0 0.32em 0.08em; border: 0; border-radius: 0.36em; cursor: pointer;
  font: inherit; letter-spacing: inherit; color: var(--nu-blue);
  background: color-mix(in srgb, var(--nu-blue) 9%, var(--nu-white));
  box-shadow: inset 0 -2px 0 color-mix(in srgb, var(--nu-blue) 55%, transparent);
  transition: background .18s ease, color .18s ease, box-shadow .18s ease;
}
.cfa__valor:hover { background: color-mix(in srgb, var(--nu-blue) 15%, var(--nu-white)); }
.cfa__valor--vazio { color: var(--nu-gray-2); }
.cfa__valor--on, .cfa__valor--on:hover { color: var(--nu-white); background: var(--nu-blue); box-shadow: none; }
.cfa__valor:focus-visible { outline: 3px solid color-mix(in srgb, var(--nu-blue) 45%, transparent); outline-offset: 2px; }

.cfa__painel {
  position: absolute; left: var(--cfa-esquerda, 12px); top: var(--cfa-topo, 12px); z-index: 90;
  display: flex; flex-direction: column; gap: 12px; width: 340px; padding: 18px 18px 16px;
  background: var(--nu-white); border-radius: 22px;
  box-shadow: 0 24px 60px -18px rgba(10, 10, 12, 0.38), 0 0 0 1px rgba(10, 10, 12, 0.05);
  font-size: var(--nu-fs-md); font-weight: 500; letter-spacing: 0; line-height: 1.4; color: var(--nu-ink); text-align: left;
  animation: cfa-abre .22s cubic-bezier(.2, .8, .2, 1) both;
}
@keyframes cfa-abre { from { opacity: 0; transform: translateY(-6px) scale(.98); } }
.cfa__rotulo { color: var(--nu-gray-2); font-size: var(--nu-fs-sm); font-weight: 700; }
.cfa__escolhidos { display: flex; flex-wrap: wrap; gap: 6px; }
.cfa__escolhido {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 6px 6px 12px; border-radius: 999px;
  background: var(--nu-ink); color: var(--nu-white); font-size: var(--nu-fs-dense); font-weight: 700;
}
.cfa__tirar {
  display: grid; place-items: center; width: 20px; height: 20px; padding: 0; border: 0; border-radius: 50%; cursor: pointer;
  background: var(--nu-white-18); color: var(--nu-white); font: inherit; font-size: var(--nu-fs-sm); line-height: 1;
}
.cfa__tirar:hover { background: var(--nu-white-35); }
.cfa__busca {
  width: 100%; padding: 11px 14px; border: 0; border-radius: 14px; outline: 0;
  box-shadow: inset 0 0 0 1.5px var(--nu-cream-2); background: var(--nu-white);
  font: inherit; font-size: var(--nu-fs-md); font-weight: 700; color: var(--nu-ink);
}
.cfa__busca:focus { box-shadow: inset 0 0 0 2px var(--nu-blue); }
.cfa__busca::placeholder { color: var(--nu-placeholder); font-weight: 500; }
.cfa__lista { display: flex; flex-direction: column; max-height: 264px; overflow-y: auto; margin: 0 -6px; }
.cfa__item {
  display: flex; align-items: baseline; gap: 10px; width: 100%; padding: 9px 10px; border: 0; border-radius: 12px; cursor: pointer;
  background: transparent; text-align: left; font: inherit; color: var(--nu-ink);
}
.cfa__item:hover:not(:disabled), .cfa__item:focus-visible { background: var(--nu-cream); outline: none; }
.cfa__item:disabled { opacity: .45; cursor: default; }
.cfa__item b { flex: none; font-size: var(--nu-fs-sm); font-weight: 800; }
.cfa__nome { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--nu-gray); font-size: var(--nu-fs-dense); }
.cfa__nota { margin: 0; padding: 4px 10px; color: var(--nu-gray); font-size: var(--nu-fs-dense); font-weight: 500; }
.cfa__pronto {
  align-self: flex-end; padding: 8px 16px; border: 0; border-radius: 999px; cursor: pointer;
  background: var(--nu-blue); color: var(--nu-white); font: inherit; font-size: var(--nu-fs-sm); font-weight: 700;
}

/* no celular o painel fica no alto da tela: o teclado da busca cobriria o pé */
@media (max-width: 640px) {
  .cfa__painel {
    position: fixed; left: 12px; right: 12px; top: calc(12px + env(safe-area-inset-top)); bottom: auto;
    width: auto; max-height: calc(100dvh - 24px); overflow-y: auto; z-index: 80;
  }
  .cfa__lista { max-height: 40dvh; }
}
@media (prefers-reduced-motion: reduce) {
  .cfa__painel { animation: none; }
  .cfa__valor { transition: none; }
}
</style>

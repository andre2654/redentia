<script lang="ts">
/** Uma opção do trilho. `valor` é o que o v-model recebe; `rotulo`, o que se lê. */
export interface OpcaoDoTrilho<V extends string | number = string | number> {
  valor: V
  rotulo: string
  /** o número ao lado do rótulo ("Ações 12"), em cinza */
  contagem?: number | null
  desabilitada?: boolean
  /** o rótulo por extenso para o leitor de tela quando o visível é abreviado ('1M' → '1 mês') */
  extenso?: string
  /** só com papel="tablist": o id do painel que a aba mostra (aria-controls) */
  controla?: string
}
</script>

<script setup lang="ts" generic="V extends string | number">
/**
 * NuTrilho: escolher UMA entre poucas (período, aba, tipo, filtro). O controle
 * segmentado da Aportou (11/11/2026, robustez), no lugar do MercadoTrilho e dos
 * seletores feitos à mão (1M/6M/12M, Ativos/No mundo/Na cadeia).
 *
 *   <NuTrilho v-model="periodo" :opcoes="[{ valor: '1mo', rotulo: '1M', extenso: '1 mês' }, …]" rotulo="Período do gráfico" />
 *   <NuTrilho v-model="tipo" :opcoes="tipos" tom="escuro" tamanho="p" />
 *
 * Props
 *   opcoes    { valor, rotulo, contagem?, desabilitada?, extenso?, controla? }[]
 *   modelValue / v-model   o valor da escolhida (string ou número; o tipo vem das opções)
 *   tom       claro (padrão): trilho --nu-cream-2, a escolhida carvão com letra branca ·
 *             escuro (sobre o carvão): trilho --nu-dark-chip, a escolhida --nu-creme com letra carvão
 *   tamanho   m (padrão): opção de 44px, 14,5px · p: opção de 36px, 13,5px (o toque segue com 44px)
 *   rotulo    o nome do grupo para o leitor de tela (aria-label); ou passe aria-labelledby
 *   largo     true: ocupa a largura (desconta a margem) e divide igual · 'celular': só até 760px
 *   papel     radiogroup (padrão: uma escolha, aria-checked) · tablist (abas que trocam
 *             um painel: aria-selected e aria-controls pela `controla` de cada opção)
 *   idBase    dá id às opções: `${idBase}-${valor}` (o painel aponta para a aba)
 *   ocupado   o dado novo ainda está chegando: não aceita outra escolha (aria-busy),
 *             sem apagar o trilho; a opção pedida fica acesa até o valor trocar
 * Evento: update:modelValue com o valor da opção escolhida.
 *
 * A pílula escolhida é UM indicador que desliza (translateX + largura medidos da
 * opção, --nu-dur-lenta --nu-ease-troca). Dentro dele vai um espelho dos
 * rótulos em branco, que fica parado enquanto a pílula anda: a letra troca de
 * cor exatamente onde a pílula passa. No servidor (e até o JS medir) quem pinta
 * a escolhida é o fundo da própria opção, no mesmo lugar: a hidratação não
 * pula. Um ResizeObserver remede quando a largura ou a fonte mudam (sem animar).
 * Teclado: Tab entra na escolhida; setas andam e escolhem (pulando as
 * desabilitadas), Home e End vão às pontas. Foco: o anel de 3px em volta da
 * pílula. No celular, quando não cabe, o trilho rola de lado por dentro (sem
 * barra, as pontas esmaecem) e a escolhida vem para a vista.
 * Em fundo quente (--nu-band) o creme do trilho some: quem usa escurece o trilho
 * com a variável `--ntr-trilho` (ex.: color-mix com 8% de --nu-ink, como na
 * /carteira). A caixa do trilho tem especificidade zero: a classe de quem usa
 * vence em display, largura e margem.
 */
const props = withDefaults(defineProps<{
  opcoes: readonly OpcaoDoTrilho<V>[]
  modelValue: V | null | undefined
  tom?: 'claro' | 'escuro'
  tamanho?: 'm' | 'p'
  rotulo?: string
  largo?: boolean | 'celular'
  papel?: 'radiogroup' | 'tablist'
  idBase?: string
  ocupado?: boolean
}>(), { tom: 'claro', tamanho: 'm', rotulo: undefined, largo: false, papel: 'radiogroup', idBase: undefined, ocupado: false })
const emit = defineEmits<{ 'update:modelValue': [valor: V] }>()

const trilho = ref<HTMLElement | null>(null)
const botoes: (HTMLButtonElement | null)[] = []
function guardar(el: unknown, i: number) { botoes[i] = (el as HTMLButtonElement | null) ?? null }

const escolhida = computed(() => props.opcoes.findIndex((o) => o.valor === props.modelValue))
/** a opção que recebe o Tab: a escolhida; sem ela (ou desabilitada), a primeira que aceita clique */
const tabulavel = computed(() => {
  const i = escolhida.value
  if (i >= 0 && !props.opcoes[i]!.desabilitada) return i
  return props.opcoes.findIndex((o) => !o.desabilitada)
})
const nomeDaOpcao = (o: OpcaoDoTrilho<V>) => (o.extenso ? (o.contagem != null ? `${o.extenso} (${o.contagem})` : o.extenso) : undefined)

/* ————— a medida ————— */
interface Medida { x: number; w: number }
const medidas = ref<Medida[]>([])
/** o JS mediu: o indicador assume o lugar do fundo da opção */
const medido = ref(false)
/** sem transição: na primeira medida e quando o tamanho muda (só a troca de escolha anima) */
const quieto = ref(true)
const rolaEsq = ref(false)
const rolaDir = ref(false)

/** Mede cada opção no sistema do conteúdo do trilho (soma o que já rolou). Falso se ele não está na tela. */
function medir(): boolean {
  const t = trilho.value
  if (!t) return false
  const caixa = t.getBoundingClientRect()
  if (caixa.width < 1) return false
  // um ancestral com scale (modal entrando) encolhe o retângulo: volta para o tamanho de layout
  const escala = caixa.width / (parseFloat(getComputedStyle(t).width) || caixa.width) || 1
  const k = Math.abs(escala - 1) < 0.002 ? 1 : escala
  medidas.value = props.opcoes.map((_, i) => {
    const r = botoes[i]?.getBoundingClientRect()
    return r ? { x: (r.left - caixa.left) / k - t.clientLeft + t.scrollLeft, w: r.width / k } : { x: 0, w: 0 }
  })
  return true
}
function pontas() {
  const t = trilho.value
  if (!t) return
  rolaEsq.value = t.scrollLeft > 1
  rolaDir.value = t.scrollLeft + t.clientWidth < t.scrollWidth - 1
}
/** Põe o indicador no lugar SEM animar (primeira medida, tamanho ou fonte que mudou). */
let assentando = 0
async function assentar() {
  const vez = ++assentando
  quieto.value = true
  if (!medir()) return
  medido.value = true
  pontas()
  await nextTick()
  void trilho.value?.offsetWidth // o navegador fixa o lugar novo com a transição desligada
  requestAnimationFrame(() => { if (vez === assentando) quieto.value = false })
}
const reduzido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
/** Traz a escolhida para a vista quando o trilho rola de lado (sem rolar a página). */
function trazerAVista(jeito: ScrollBehavior) {
  const t = trilho.value
  const m = medidas.value[escolhida.value]
  if (!t || !m || t.scrollWidth <= t.clientWidth + 1) return
  const folga = 24
  if (m.x - folga >= t.scrollLeft && m.x + m.w + folga <= t.scrollLeft + t.clientWidth) return
  const alvo = Math.max(0, Math.min(t.scrollWidth - t.clientWidth, m.x - (t.clientWidth - m.w) / 2))
  t.scrollTo({ left: alvo, behavior: reduzido() ? 'auto' : jeito })
}

let ro: ResizeObserver | null = null
function observar() {
  if (!ro || !trilho.value) return
  ro.disconnect()
  ro.observe(trilho.value)
  for (const b of botoes.slice(0, props.opcoes.length)) if (b) ro.observe(b)
}
onMounted(() => {
  void assentar().then(() => trazerAVista('auto'))
  ro = new ResizeObserver(() => { void assentar() })
  observar()
  // a fonte chega depois do primeiro desenho: as larguras mudam
  document.fonts?.ready.then(() => { void assentar() }).catch(() => {})
})
onBeforeUnmount(() => { ro?.disconnect(); ro = null })

// opções novas (contagem que chegou, opção que entrou): remede e observa as novas
watch(() => props.opcoes.map((o) => `${o.valor}\u0001${o.rotulo}\u0001${o.contagem ?? ''}`).join('\u0002'), async () => {
  botoes.length = props.opcoes.length
  await nextTick()
  observar()
  void assentar()
}, { flush: 'post' })

// a troca de escolha: o indicador anda sozinho (o estilo dele é reativo); aqui só a rolagem
watch(escolhida, async (agora, antes) => {
  if (!medido.value) return
  // de nenhuma escolhida para uma: aparece no lugar, sem vir deslizando da ponta
  if (antes < 0 && agora >= 0) await assentar()
  await nextTick()
  trazerAVista('smooth')
})

const estiloPilula = computed(() => {
  const m = medidas.value[escolhida.value]
  return medido.value && m ? { width: `${m.w}px`, transform: `translateX(${m.x}px)` } : undefined
})
const estiloEspelho = computed(() => {
  const m = medidas.value[escolhida.value]
  return m ? { transform: `translateX(${-m.x}px)` } : undefined
})
function estiloEco(i: number) {
  const m = medidas.value[i]
  return m ? { left: `${m.x}px`, width: `${m.w}px` } : undefined
}

/* ————— a escolha ————— */
/** a opção pedida enquanto quem usa ainda não trocou o valor (o dado chegando): resposta na hora */
const pedida = ref<V | null>(null)
watch(() => props.modelValue, () => { pedida.value = null })
watch(() => props.ocupado, (agora) => { if (!agora) pedida.value = null })
function escolher(i: number) {
  const o = props.opcoes[i]
  if (!o || o.desabilitada || props.ocupado || o.valor === props.modelValue) return
  pedida.value = o.valor
  emit('update:modelValue', o.valor)
  // quem usa não trocou o valor nem ficou ocupado (recusou a troca): nada fica aceso
  void nextTick(() => { if (!props.ocupado && props.modelValue !== o.valor) pedida.value = null })
}
function teclar(e: KeyboardEvent) {
  const livres = props.opcoes.map((o, i) => (o.desabilitada ? -1 : i)).filter((i) => i >= 0)
  if (!livres.length) return
  const aqui = botoes.findIndex((b) => b === document.activeElement)
  const pos = livres.indexOf(aqui >= 0 ? aqui : tabulavel.value)
  const vertical = props.papel === 'radiogroup'
  let prox: number
  if (e.key === 'ArrowRight' || (vertical && e.key === 'ArrowDown')) prox = livres[(pos + 1) % livres.length]!
  else if (e.key === 'ArrowLeft' || (vertical && e.key === 'ArrowUp')) prox = livres[(pos - 1 + livres.length) % livres.length]!
  else if (e.key === 'Home') prox = livres[0]!
  else if (e.key === 'End') prox = livres[livres.length - 1]!
  else return
  e.preventDefault()
  botoes[prox]?.focus({ preventScroll: true })
  escolher(prox)
}
</script>

<template>
  <div
    ref="trilho" class="ntr"
    :class="[`ntr--${tom}`, `ntr--${tamanho}`, {
      'ntr--largo': largo === true, 'ntr--largo-celular': largo === 'celular',
      'ntr--medido': medido, 'ntr--quieto': quieto, 'ntr--ocupado': ocupado,
      'ntr--rola-esq': rolaEsq, 'ntr--rola-dir': rolaDir,
    }]"
    :role="papel" :aria-label="rotulo" :aria-busy="ocupado || undefined"
    @keydown="teclar" @scroll.passive="pontas"
  >
    <!-- o indicador: desliza até a escolhida; o espelho dos rótulos (em branco) fica parado dentro dele -->
    <span class="ntr__pilula" :class="{ 'ntr__pilula--sem': escolhida < 0 }" :style="estiloPilula" aria-hidden="true">
      <span v-if="medido" class="ntr__espelho" :style="estiloEspelho">
        <span v-for="(o, i) in opcoes" :key="o.valor" class="ntr__eco" :style="estiloEco(i)">{{ o.rotulo }}<span v-if="o.contagem != null" class="ntr__n">{{ o.contagem }}</span></span>
      </span>
    </span>
    <button
      v-for="(o, i) in opcoes" :id="idBase ? `${idBase}-${o.valor}` : undefined" :key="o.valor" :ref="(el) => guardar(el, i)"
      type="button" class="ntr__op" :class="{ 'ntr__op--on': i === escolhida, 'ntr__op--pedida': pedida !== null && o.valor === pedida && i !== escolhida }"
      :role="papel === 'tablist' ? 'tab' : 'radio'"
      :aria-checked="papel === 'radiogroup' ? i === escolhida : undefined"
      :aria-selected="papel === 'tablist' ? i === escolhida : undefined"
      :aria-controls="papel === 'tablist' ? o.controla : undefined"
      :aria-label="nomeDaOpcao(o)" :tabindex="i === tabulavel ? 0 : -1" :disabled="o.desabilitada || undefined"
      @click="escolher(i)"
    >{{ o.rotulo }}<span v-if="o.contagem != null" class="ntr__n">{{ o.contagem }}</span></button>
  </div>
</template>

<style scoped>
.ntr {
  /* as cores (tom claro). Para o fundo em volta que pede outro trilho, quem usa põe --ntr-trilho */
  --ntr-fundo: var(--nu-cream-2); --ntr-fio: transparent; --ntr-pilula: var(--nu-ink);
  --ntr-tinta: var(--nu-gray-3); --ntr-tinta-hover: var(--nu-ink); --ntr-tinta-on: var(--nu-white);
  --ntr-n: var(--nu-gray); --ntr-n-on: var(--nu-on-dark-2);
  --ntr-hover: color-mix(in srgb, var(--nu-ink) 6%, transparent);
  --ntr-aperto: color-mix(in srgb, var(--nu-ink) 11%, transparent);
  --ntr-foco: var(--nu-blue);
  /* as medidas (tamanho m) */
  --ntr-h: 44px; --ntr-px: 18px; --ntr-fs: 14.5px; --ntr-in: 4px;
}
/* a caixa do trilho em :where (especificidade zero): a classe de quem usa sempre vence no
   layout (display, largura, margem), sem depender da ordem em que o CSS chega */
:where(.ntr) {
  position: relative; isolation: isolate; display: inline-flex; align-items: center; gap: 2px; max-width: 100%; vertical-align: top;
  padding: var(--ntr-in); border-radius: var(--nu-r-pill);
  background: var(--ntr-trilho, var(--ntr-fundo)); box-shadow: inset 0 0 0 1px var(--ntr-fio);
  overflow-x: auto; overflow-y: hidden; overscroll-behavior-x: contain; scrollbar-width: none;
  -webkit-tap-highlight-color: transparent;
}
.ntr::-webkit-scrollbar { display: none; }
.ntr--p { --ntr-h: 36px; --ntr-px: 14px; --ntr-fs: 13.5px; }
.ntr--escuro {
  --ntr-fundo: var(--nu-dark-chip); --ntr-fio: var(--nu-dark-chip-line); --ntr-pilula: var(--nu-creme);
  --ntr-tinta: var(--nu-on-dark); --ntr-tinta-hover: var(--nu-white); --ntr-tinta-on: var(--nu-ink);
  --ntr-n: var(--nu-on-dark-2); --ntr-n-on: var(--nu-gray);
  --ntr-hover: color-mix(in srgb, var(--nu-white) 8%, transparent);
  --ntr-aperto: color-mix(in srgb, var(--nu-white) 14%, transparent);
  --ntr-foco: var(--nu-blue-on-dark);
}
/* largo: a caixa estica (bloco, ou item de flex/grid em coluna) descontando a margem de quem usa;
   as opções dividem o espaço por igual e o respiro de cada lado encolhe */
:where(.ntr--largo) { display: flex; align-self: stretch; }
.ntr--largo .ntr__op { flex: 1 1 0; }
.ntr--largo.ntr--m { --ntr-px: 12px; }
.ntr--largo.ntr--p { --ntr-px: 10px; }
@media (max-width: 760px) {
  :where(.ntr--largo-celular) { display: flex; align-self: stretch; }
  .ntr--largo-celular .ntr__op { flex: 1 1 0; }
  .ntr--largo-celular.ntr--m { --ntr-px: 12px; }
  .ntr--largo-celular.ntr--p { --ntr-px: 10px; }
}

/* as opções: a letra (e a contagem) são as mesmas do espelho, para a troca não tremer. O botão
   herda a fonte inteira da página primeiro (o navegador dá a dele ao <button> e tira os números tabulares) */
.ntr__op { font: inherit; }
.ntr__op, .ntr__eco {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  font-size: var(--ntr-fs); font-weight: var(--nu-w-medio); letter-spacing: var(--nu-ls-texto); line-height: 1; white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.ntr__op {
  /* sem min-width: o mínimo da opção é o próprio texto com o respiro (no largo, ninguém espreme o rótulo) */
  position: relative; z-index: 1; flex: none; height: var(--ntr-h); padding: 0 var(--ntr-px);
  border: 0; border-radius: var(--nu-r-pill); background: transparent; color: var(--ntr-tinta); cursor: pointer;
  transition: color var(--nu-dur-media) var(--nu-ease-cor), background-color var(--nu-dur-media) var(--nu-ease-cor);
}
/* no tamanho p o desenho tem 36px e o toque, 44px (o respiro do trilho também é da opção) */
.ntr--p .ntr__op::before { content: ''; position: absolute; inset: calc(var(--ntr-in) * -1) 0; }
.ntr__n { color: var(--ntr-n); transition: color var(--nu-dur-media) var(--nu-ease-cor); }
.ntr__op:hover:not(:disabled) { color: var(--ntr-tinta-hover); background-color: var(--ntr-hover); }
.ntr__op:active:not(:disabled) { background-color: var(--ntr-aperto); transition-duration: var(--nu-dur-rapida); }
.ntr__op:disabled { opacity: .4; cursor: not-allowed; }
.ntr--ocupado .ntr__op:not(:disabled) { cursor: progress; }
/* pedida e ainda esperando o dado: fica acesa como no hover até a pílula vir */
.ntr__op--pedida { color: var(--ntr-tinta-hover); background-color: var(--ntr-hover); }
.ntr__op:focus-visible { outline: 3px solid var(--ntr-foco); outline-offset: -3px; }

/* antes do JS medir (o HTML do servidor): a escolhida pinta o próprio fundo, no lugar exato do indicador */
.ntr:not(.ntr--medido) .ntr__op--on, .ntr:not(.ntr--medido) .ntr__op--on:hover { background-color: var(--ntr-pilula); color: var(--ntr-tinta-on); }
.ntr:not(.ntr--medido) .ntr__op--on .ntr__n { color: var(--ntr-n-on); }

/* o indicador: acima das opções (a letra branca é a do espelho) e sem roubar o clique */
.ntr__pilula {
  position: absolute; z-index: 2; top: var(--ntr-in); left: 0; width: 0; height: var(--ntr-h);
  border-radius: var(--nu-r-pill); background: var(--ntr-pilula); overflow: hidden; pointer-events: none; visibility: hidden;
  transition: transform var(--nu-dur-lenta) var(--nu-ease-troca), width var(--nu-dur-lenta) var(--nu-ease-troca);
}
.ntr--medido .ntr__pilula { visibility: visible; }
.ntr--medido .ntr__pilula--sem { visibility: hidden; }
.ntr__espelho { position: absolute; top: 0; bottom: 0; left: 0; width: 0; transition: transform var(--nu-dur-lenta) var(--nu-ease-troca); }
.ntr__eco { position: absolute; top: 0; height: 100%; color: var(--ntr-tinta-on); }
.ntr__eco .ntr__n { color: var(--ntr-n-on); }
.ntr--quieto .ntr__pilula, .ntr--quieto .ntr__espelho { transition: none; }
/* o foco da escolhida é o anel em volta do indicador (ele cobre a opção) */
.ntr--medido .ntr__op--on:focus-visible { outline: none; }
.ntr--medido:has(.ntr__op--on:focus-visible) .ntr__pilula { outline: 3px solid var(--ntr-foco); outline-offset: 1px; }

/* rolando de lado: as pontas esmaecem onde ainda tem opção (a máscara usa só o alfa) */
.ntr--rola-dir { -webkit-mask-image: linear-gradient(90deg, var(--nu-ink) calc(100% - 36px), transparent); mask-image: linear-gradient(90deg, var(--nu-ink) calc(100% - 36px), transparent); }
.ntr--rola-esq { -webkit-mask-image: linear-gradient(90deg, transparent, var(--nu-ink) 36px); mask-image: linear-gradient(90deg, transparent, var(--nu-ink) 36px); }
.ntr--rola-esq.ntr--rola-dir {
  -webkit-mask-image: linear-gradient(90deg, transparent, var(--nu-ink) 36px, var(--nu-ink) calc(100% - 36px), transparent);
  mask-image: linear-gradient(90deg, transparent, var(--nu-ink) 36px, var(--nu-ink) calc(100% - 36px), transparent);
}
@media (max-width: 560px) { .ntr--m:not(.ntr--largo, .ntr--largo-celular) { --ntr-px: 15px; } }
</style>

<script setup lang="ts">
// A régua do mercado, "a bolsa inteira numa linha" (12/11/2026, a opção 1 do
// esboço que o dono aprovou). Numa linha de 44px: o estado da bolsa; UMA barra
// com as ações do Ibovespa, da que mais caiu à que mais subiu, a largura pelo
// peso no índice e a cor por quanto andou (a paleta --nu-mapa-*, validada; a
// conta em utils/reguaDaBolsa.ts); o número que a barra mostra ("71% do índice
// subiu na sexta"). O aviso de atraso da B3 saiu da linha (12/11/2026, o dono:
// a barra ganhou a largura) e mora no pé da dica de cada pedaço e no fim do
// aria-label da barra: "Cotações da B3 com 15 min de atraso." com a bolsa aberta,
// "Fechamento de sexta, 06/11." quando o dado é um fechamento (momentoDoDado).
//
// É a cena principal do palco da régua (NuReguaPalco, 12/11/2026): cada vez que
// ela entra, a barra se forma (os pedaços acendem da esquerda para a direita),
// os textos dos lados aparecem e, 15 segundos depois, somem num fade enquanto a
// barra cresce até a largura toda da coluna (a `fase`: 'oculta' fora de cena,
// 'textos', 'larga'). Na largura toda, os rótulos e a dica continuam. A barra
// segue focável fora de cena (o Tab da régua nunca some; o palco traz a cena
// dela de volta quando o foco entra).
//
// A barra é UM elemento (role="application" com o resumo no aria-label), não 76
// links: os pedaços são aria-hidden e nada aqui é <a>. O mouse e o foco pelo
// teclado acendem um pedaço (o contorno carvão) e a dica embaixo da régua; as
// setas andam entre eles (a dica é anunciada por aria-live), Enter abre a
// janelinha de espiar do ativo e Esc sai. Onde a janelinha não existe, o clique
// leva à página do ativo.
//
// Quem tem carteira e assina ganha, só no cliente e depois de montar, o ponto
// cobalto nas ações que tem e "Sua carteira +0,11% · tudo normal" à direita
// (useCarteiraNoTopo, com a regra do selo da home). Até lá, a régua é a do
// visitante; a troca é um fade, e o lugar do texto já vem reservado para quem
// entrou (a barra não pula).
//
// Movimento: a cada entrada os pedaços acendem da esquerda para a direita (o
// pregão acende, ~0,8 s); com a bolsa aberta, o dado que se renova troca as
// cores com transição e a barra escorre para a ordem nova (cada lugar muda de
// cor e de largura; os pontos da carteira andam junto). Movimento reduzido: sem
// cascata e sem crescer (o palco já entrega a fase 'larga').
import { momentoDoDado, type MercadoDoTopo } from '~/utils/topo'
import { estadoCurto, legendaDaCarteira, legendaDaRegua, pedacoNaPosicao, pedacosDaRegua, rotuloDaBarra as rotuloDe, type AcaoDoIndice, type PedacoDaRegua } from '~/utils/reguaDaBolsa'
import { frasesDoDia, seloDoDia } from '~/utils/diaDaCarteira'
import { avisosLiberados } from '~/utils/carteiraVisao'
import { FERIADOS_B3, agoraEmSP } from '~/utils/pregao'

const props = defineProps<{
  acoes: AcaoDoIndice[]
  /** o dia do pregão do dado (ibov.data) */
  data: string | null
  mercado: MercadoDoTopo
  agora: Date
  /** a fase da cena (o palco manda): fora de cena, com os textos dos lados, ou a barra na largura toda */
  fase: 'oculta' | 'textos' | 'larga'
  /** conta as entradas da cena: cada uma refaz a cascata */
  ciclo: number
  /** a cascata desta entrada (sem ela no movimento reduzido) */
  acender: boolean
}>()

const route = useRoute()
const espiar = useEspiarAtivo()
const { isAuthenticated, token } = useAuthState()

/* ————— a barra e o número ————— */
const estado = computed(() => props.mercado.estado)
const momento = computed(() => momentoDoDado(props.data, estado.value, props.agora))
const aoVivo = computed(() => momento.value.aoVivo)
const pedacos = computed(() => pedacosDaRegua(props.acoes, { aoVivo: aoVivo.value }))
const legenda = computed(() => legendaDaRegua(pedacos.value, momento.value))
const mercadoCurto = computed<MercadoDoTopo>(() => ({
  ...props.mercado,
  rotulo: estadoCurto(estado.value, !!FERIADOS_B3[agoraEmSP(props.agora).iso]),
}))

/* ————— a carteira de quem assina (só no cliente) ————— */
const cart = useCarteiraNoTopo()
const carteira = cart.carteira
const tickers = computed(() => new Set(carteira.value?.tickers ?? []))
const frases = computed(() => (carteira.value?.dia ? frasesDoDia(carteira.value.dia, estado.value, props.agora) : null))
const alerta = computed(() => !!carteira.value?.dia?.alerta)
const liberados = computed(() => avisosLiberados(estado.value))
const avisoDoMotor = computed(() => cart.aviso.urgente.value && liberados.value)
// o selo só sai quando é o final: o alerta do dia já decide; sem ele, espera o motor (se os avisos já valem)
const seloFinal = computed(() => alerta.value || !liberados.value || cart.aviso.consultado.value)
const legCarteira = computed(() => {
  if (!frases.value) return null
  const selo = seloFinal.value ? seloDoDia(frases.value, alerta.value, avisoDoMotor.value) : null
  return legendaDaCarteira(carteira.value?.dia?.carteiraPct, selo)
})
/** os pontos: o centro dos pedaços das ações que a pessoa tem */
const marcas = computed(() => pedacos.value.filter((p) => tickers.value.has(p.ticker)).map((p) => ({ ticker: p.ticker, centro: p.inicio + p.largura / 2 })))
/** quem entrou: o lugar do texto da carteira vem reservado desde a primeira pintura */
const reservar = ref(false)

watch(() => cart.estado.value === 'pronto' && liberados.value && !alerta.value, (pode) => { if (pode) void cart.aviso.consultar() }, { immediate: true })
watch(token, (novo, antigo) => {
  if (novo === antigo) return
  cart.esquecer()
  reservar.value = !!novo
  if (novo) void cart.carregar()
})

/* ————— o que o leitor de tela ouve ————— */
const idAjuda = useId()
/** o resumo, quantas são suas e, no fim, o aviso de atraso da B3 (ou a data do fechamento) */
const rotuloDaBarra = computed(() => (legenda.value ? rotuloDe(legenda.value, marcas.value.length) : ''))
const falada = ref('')

/* ————— o pedaço aceso: o ponteiro manda; sem ele, o teclado ————— */
const barra = ref<HTMLElement | null>(null)
const raiz = ref<HTMLElement | null>(null)
const ponteiro = ref<number | null>(null)
const teclado = ref<number | null>(null)
const indiceAtivo = computed(() => {
  const i = ponteiro.value ?? teclado.value
  return i != null && i < pedacos.value.length ? i : null
})
const ativo = computed<PedacoDaRegua | null>(() => (indiceAtivo.value != null ? pedacos.value[indiceAtivo.value]! : null))
const ativoEhSeu = computed(() => !!ativo.value && tickers.value.has(ativo.value.ticker))

function posicaoNaBarra(clientX: number): number {
  const r = barra.value?.getBoundingClientRect()
  if (!r || r.width <= 0) return -1
  const x = Math.max(0, Math.min(99.999, ((clientX - r.left) / r.width) * 100))
  return pedacoNaPosicao(pedacos.value, x)
}
function aoMover(e: PointerEvent) {
  if (e.pointerType === 'touch') return
  const i = posicaoNaBarra(e.clientX)
  ponteiro.value = i >= 0 ? i : null
}
function aoSair() { ponteiro.value = null }

function abrir(i: number, ev?: MouseEvent) {
  const p = pedacos.value[i]
  if (!p) return
  const destino = `/asset/${p.ticker}`
  // Cmd/Ctrl/Shift ou o botão do meio: a página do ativo em outra aba, como num link
  if (ev && (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button === 1)) { window.open(destino, '_blank', 'noopener'); return }
  // o próprio ativo da página: o link do site também não abre a janelinha
  if (route.path.toUpperCase() === destino.toUpperCase()) return
  if (espiar.disponivel()) void espiar.abrir(p.ticker, barra.value)
  else void navigateTo(destino)
}
function aoClicar(e: MouseEvent) {
  const i = posicaoNaBarra(e.clientX)
  if (i >= 0) abrir(i, e)
}
function aoClicarMeio(e: MouseEvent) {
  if (e.button !== 1) return
  const i = posicaoNaBarra(e.clientX)
  if (i >= 0) abrir(i, e)
}

function anunciar(i: number) {
  const p = pedacos.value[i]
  falada.value = p ? `${p.dica.falada}${tickers.value.has(p.ticker) ? ' Na sua carteira.' : ''}` : ''
}
function aoTeclar(e: KeyboardEvent) {
  const n = pedacos.value.length
  if (!n) return
  const atual = teclado.value
  let prox: number | null = null
  if (e.key === 'ArrowRight') prox = atual == null ? 0 : Math.min(n - 1, atual + 1)
  else if (e.key === 'ArrowLeft') prox = atual == null ? n - 1 : Math.max(0, atual - 1)
  else if (e.key === 'Home') prox = 0
  else if (e.key === 'End') prox = n - 1
  else if (e.key === 'Enter' || e.key === ' ') {
    if (atual == null) return
    e.preventDefault()
    abrir(atual)
    return
  } else if (e.key === 'Escape') {
    if (atual == null) return
    e.preventDefault()
    e.stopPropagation()
    teclado.value = null
    falada.value = ''
    return
  } else return
  e.preventDefault()
  ponteiro.value = null
  teclado.value = prox
  anunciar(prox)
}
function aoDesfocar() {
  teclado.value = null
  falada.value = ''
}

/* ————— a dica: embaixo da régua, centrada no pedaço, sem sair da coluna ————— */
const dicaEl = ref<HTMLElement | null>(null)
const dicaX = ref(0)
const dicaMedida = ref(false)
function medirDica() {
  const p = ativo.value
  const r = raiz.value?.getBoundingClientRect()
  const b = barra.value?.getBoundingClientRect()
  const w = dicaEl.value?.offsetWidth ?? 0
  if (!p || !r || !b || !w) return
  const centro = b.left - r.left + ((p.inicio + p.largura / 2) / 100) * b.width
  dicaX.value = Math.round(Math.max(0, Math.min(r.width - w, centro - w / 2)))
  dicaMedida.value = true
}
watch(ativo, async (p, antes) => {
  if (!p) { dicaMedida.value = false; return }
  if (!antes) dicaMedida.value = false
  await nextTick()
  medirDica()
})
// o dado que se renova com a dica aberta: ela acompanha o pedaço no lugar novo
watch(pedacos, async () => { if (ativo.value) { await nextTick(); medirDica() } })

/* ————— o pregão acende a cada entrada da cena (o palco conta o ciclo) ————— */
const acende = ref(false)
let tApaga: ReturnType<typeof setTimeout> | null = null
watch(() => props.ciclo, () => {
  if (tApaga) clearTimeout(tApaga)
  acende.value = props.acender
  if (props.acender) tApaga = setTimeout(() => { acende.value = false }, 1600)
}, { immediate: true })

/* ————— os textos dos lados: somem e a barra cresce até a largura da coluna ————— */
const ladoEsq = ref<HTMLElement | null>(null)
const ladoDir = ref<HTMLElement | null>(null)
const larguras = ref<{ esq: string | null; dir: string | null }>({ esq: null, dir: null })
watch(() => props.fase, async (fase, antes) => {
  if (fase === 'larga' && antes === 'textos') {
    // da largura natural para zero: a largura em px primeiro, e o zero no quadro seguinte (a transição precisa dos dois)
    larguras.value = { esq: `${ladoEsq.value?.scrollWidth ?? 0}px`, dir: `${ladoDir.value?.scrollWidth ?? 0}px` }
    await nextTick()
    void ladoEsq.value?.offsetWidth
    requestAnimationFrame(() => { larguras.value = { esq: '0px', dir: '0px' } })
  } else if (fase === 'larga') larguras.value = { esq: '0px', dir: '0px' }
  else larguras.value = { esq: null, dir: null }
}, { immediate: true })

onMounted(() => {
  reservar.value = isAuthenticated.value
  if (isAuthenticated.value) void cart.carregar()
})
onBeforeUnmount(() => { if (tApaga) clearTimeout(tApaga) })
</script>

<template>
  <div ref="raiz" class="nrb" :class="[`nrb--${fase}`, { 'nrb--acende': acende, 'nrb--reserva': reservar }]">
    <!-- à esquerda, o estado da bolsa (some na fase larga) -->
    <span ref="ladoEsq" class="nrb__lado nrb__lado--esq" :style="larguras.esq ? { width: larguras.esq } : undefined">
      <span :key="`e${ciclo}`" class="nrb__lado-in">
        <span class="nrb__estado">
          <NuTopoEstado :mercado="mercado" class="nrb__estado-longo" />
          <NuTopoEstado :mercado="mercadoCurto" class="nrb__estado-curto" />
        </span>
        <span class="nrb__fio" aria-hidden="true" />
      </span>
    </span>

    <!-- a barra: um elemento só, o resumo no aria-label, os pedaços aria-hidden -->
    <div
      ref="barra" class="nrb__barra" role="application" tabindex="0"
      aria-roledescription="barra das ações do Ibovespa" :aria-label="rotuloDaBarra" :aria-describedby="idAjuda"
      @pointermove="aoMover" @pointerleave="aoSair" @click="aoClicar" @auxclick="aoClicarMeio" @keydown="aoTeclar" @blur="aoDesfocar"
    >
      <!-- cada lugar da barra é um pedaço (a chave é a posição): no dado novo, a cor e a largura
           de cada lugar mudam com transição e a barra escorre para a ordem nova, sem buraco -->
      <div :key="`f${ciclo}`" class="nrb__faixa" aria-hidden="true">
        <span
          v-for="(p, i) in pedacos" :key="i" class="nrb__pedaco" :class="{ 'nrb__pedaco--clara': p.tinta === 'clara' }"
          :style="{ flexGrow: p.peso, backgroundColor: p.fundo, '--x': (p.inicio / 100).toFixed(4) }"
        ><span v-if="p.rotulo" class="nrb__rotulo">{{ p.ticker }}</span></span>
      </div>
      <div class="nrb__marcas" aria-hidden="true">
        <span v-for="m in marcas" :key="m.ticker" class="nrb__marca" :style="{ transform: `translateX(${m.centro.toFixed(3)}%)` }"><i /></span>
        <span v-if="ativo" class="nrb__foco" :style="{ transform: `translateX(${ativo.inicio.toFixed(3)}%)` }"><i :style="{ width: `calc(${ativo.largura.toFixed(3)}% + 6px)` }" /></span>
      </div>
    </div>
    <span :id="idAjuda" class="nu-sr">Use as setas para percorrer as ações e Enter para abrir o cartão de uma delas.</span>

    <!-- à direita, o número que a barra mostra; para quem assina, o dia da carteira no mesmo lugar (some na fase larga) -->
    <span ref="ladoDir" class="nrb__lado nrb__lado--dir" :style="larguras.dir ? { width: larguras.dir } : undefined"><span :key="`d${ciclo}`" class="nrb__lado-in">
    <div class="nrb__leg">
      <!-- quem entrou: o lugar do texto mais longo da carteira, sem dado nenhum (a barra não pula na troca) -->
      <span v-if="reservar" class="nrb__fantasma" aria-hidden="true"><span class="nrb__t-longo nrb__t-medio">Sua carteira </span><span class="nrb__t-curto">Você </span><b class="nrb__num">−00,00%</b><span class="nrb__t-longo"> · pede atenção</span><i class="nrb__cart-ponto" /></span>
      <Transition name="nrb-troca" mode="out-in">
        <NuxtLink v-if="legCarteira" key="carteira" to="/carteira" class="nrb__cart" :class="{ 'nrb__cart--atencao': legCarteira.atencao }" :aria-label="legCarteira.falada"><span class="nrb__t-longo nrb__t-medio">Sua carteira </span><span class="nrb__t-curto">Você </span><b class="nrb__num">{{ legCarteira.numero }}</b><Transition name="nrb-troca"><span v-if="legCarteira.estado" class="nrb__cart-estado nrb__t-longo"> · {{ legCarteira.estado }}</span></Transition><i v-if="legCarteira.atencao" class="nrb__cart-ponto" aria-hidden="true" /></NuxtLink>
        <span v-else-if="legenda" key="indice" class="nrb__ind">
          <b class="nrb__num">{{ legenda.numero }}</b><span class="nrb__t-longo">{{ ` ${legenda.longo}` }}</span><span class="nrb__t-medio">{{ ` ${legenda.medio}` }}</span><span class="nrb__t-curto">{{ ` ${legenda.curto}` }}</span>
        </span>
      </Transition>
    </div>
    </span></span>


    <!-- a dica do pedaço aceso (a voz dela é o aria-live abaixo; o aviso de atraso vai no aria-label da barra) -->
    <Transition name="nrb-dica">
      <div
        v-if="ativo" ref="dicaEl" class="nrb__dica" :class="{ 'nrb__dica--medida': dicaMedida }"
        :style="{ transform: `translateX(${dicaX}px)` }" aria-hidden="true"
      >
        <p class="nrb__dica-titulo"><b>{{ ativo.dica.titulo }}</b> <span class="nrb__dica-pct" :class="`nrb__dica-pct--${ativo.dica.tom}`">{{ ativo.dica.pct }}</span></p>
        <p class="nrb__dica-linha">{{ ativo.dica.linha }}</p>
        <p v-if="ativoEhSeu" class="nrb__dica-sua"><i aria-hidden="true" />Na sua carteira</p>
        <!-- o aviso de atraso da B3 (ou a data do fechamento): saiu da linha e mora aqui -->
        <p v-if="legenda" class="nrb__dica-nota">{{ legenda.nota }}</p>
      </div>
    </Transition>
    <span class="nu-sr" aria-live="polite">{{ falada }}</span>
  </div>
</template>

<style scoped>
.nrb {
  position: relative; flex: 1 1 auto; min-width: 0; height: 100%;
  display: flex; align-items: center;
  font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto);
}
/* os lados (o estado e o número): o respiro mora dentro deles, para a barra encostar na coluna quando eles somem */
.nrb__lado {
  flex: none; display: flex; align-items: center; height: 100%; overflow: hidden;
  transition: width var(--nu-dur-entrada) var(--nu-ease-saida), opacity var(--nu-dur-lenta) var(--nu-ease-cor);
}
.nrb__lado-in {
  display: flex; align-items: center; gap: 16px; white-space: nowrap;
  transition: transform var(--nu-dur-entrada) var(--nu-ease-saida), filter var(--nu-dur-lenta) var(--nu-ease-cor);
}
/* de que lado cada texto vem e para onde vai: para a borda dele */
.nrb__lado--esq .nrb__lado-in { --nrb-lado: -10px; }
.nrb__lado--dir .nrb__lado-in { --nrb-lado: 10px; }
.nrb__lado--esq .nrb__lado-in { padding-right: 16px; }
.nrb__lado--dir .nrb__lado-in { padding-left: 16px; }
/* fora de cena: os lados esperam a próxima entrada, invisíveis e fora do Tab */
.nrb--oculta .nrb__lado { opacity: 0; visibility: hidden; }
/* a cada entrada: a barra se forma e os textos chegam depois dela, da borda para dentro */
.nrb--textos .nrb__lado-in { animation: nrb-lado-entra var(--nu-dur-entrada) var(--nu-ease-saida) var(--nu-dur-lenta) both; }
@keyframes nrb-lado-entra { from { opacity: 0; transform: translateX(var(--nrb-lado)); filter: blur(3px); } }
/* a barra na largura toda (dono, 12/11/2026: "mais suave"): os textos saem para a
   borda, desfocando, e só então o lugar deles fecha, devagar, na curva que chega
   (a barra cresce sem tranco) */
.nrb--larga .nrb__lado {
  opacity: 0; visibility: hidden;
  transition: width var(--nu-dur-entrada) var(--nu-ease-saida) 140ms, opacity var(--nu-dur-lenta) var(--nu-ease-cor), visibility 0s calc(var(--nu-dur-entrada) + 140ms);
}
.nrb--larga .nrb__lado-in { transform: translateX(var(--nrb-lado)); filter: blur(3px); }
.nrb__estado { flex: none; display: inline-flex; }
.nrb__estado-curto { display: none; }
.nrb__fio { flex: none; width: 1px; height: 16px; background: var(--nu-line-2); }

/* ——— a barra ——— */
.nrb__barra {
  position: relative; flex: 1 1 auto; min-width: 48px; height: 18px;
  border-radius: var(--nu-r-tag-p); cursor: pointer; touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
/* o alvo do ponteiro é a altura toda da régua, não só os 18px da barra */
.nrb__barra::before { content: ''; position: absolute; inset: -13px 0; }
.nrb__faixa {
  position: relative; display: flex; width: 100%; height: 100%;
  border-radius: var(--nu-r-tag-p); overflow: hidden;
}
/* o dado que se renova: a cor troca e a largura escorre (uma linha só de flex; a barra
   inteira refaz o desenho a cada 2 minutos, no máximo) */
.nrb__pedaco {
  transition: background-color var(--nu-dur-lenta) var(--nu-ease-cor), color var(--nu-dur-lenta) var(--nu-ease-cor), flex-grow var(--nu-dur-lenta) var(--nu-ease-troca);
  flex: 0 1 0; min-width: 0; container-type: inline-size;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  color: var(--nu-ink);
}
.nrb__pedaco--clara { color: var(--nu-white); }
/* o ticker dentro: só no pedaço que tem uns 62px (a largura real, pelo container) */
/* o rótulo aparece e some em fade quando o pedaço passa dos 62px (a barra crescendo não estala) */
.nrb__rotulo {
  display: block; opacity: 0; transition: opacity var(--nu-dur-lenta) var(--nu-ease-cor); font-size: 11px; font-weight: var(--nu-w-forte); letter-spacing: var(--nu-ls-texto);
  line-height: 1; white-space: nowrap; pointer-events: none; user-select: none;
}
@container (min-width: 62px) { .nrb__rotulo { opacity: 1; } }

/* o pregão acende: da esquerda para a direita, pela posição do pedaço (uma vez
   por sessão), da areia do zero para a cor de cada um. É a cor que anima, não a
   opacidade nem o transform: cada pedaço numa camada própria deixava um fio
   claro entre eles durante a cascata. */
.nrb--acende .nrb__pedaco {
  animation: nrb-acende var(--nu-dur-media) var(--nu-ease-saida) both;
  animation-delay: calc(var(--x, 0) * var(--nu-dur-lenta));
}
@keyframes nrb-acende { from { background-color: var(--nu-mapa-zero); color: transparent; } }

/* os pontos da carteira e o contorno do pedaço aceso: por cima, sem o corte da faixa */
.nrb__marcas { position: absolute; inset: 0; pointer-events: none; }
.nrb__marca, .nrb__foco { position: absolute; inset: 0; }
.nrb__marca { transition: transform var(--nu-dur-lenta) var(--nu-ease-troca); animation: nu-surgir var(--nu-dur-media) var(--nu-ease-cor) both; }
.nrb__marca i {
  position: absolute; left: 0; top: -4px; width: 6px; height: 6px; margin-left: -3px; border-radius: 50%;
  background: var(--nu-blue); box-shadow: 0 0 0 1.5px var(--nu-page);
}
.nrb__foco i {
  position: absolute; top: -3px; bottom: -3px; left: -3px; min-width: 8px;
  border: 2px solid var(--nu-ink); border-radius: 4px; box-shadow: inset 0 0 0 1px var(--nu-page);
}

/* ——— o número da direita ——— */
.nrb__leg {
  flex: none; display: grid; align-items: center; justify-items: start;
  color: var(--nu-gray-2); white-space: nowrap; font-variant-numeric: tabular-nums;
}
.nrb__leg > * { grid-area: 1 / 1; }
.nrb__fantasma { visibility: hidden; }
.nrb__num { color: var(--nu-ink); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }
.nrb__t-medio, .nrb__t-curto { display: none; }
.nrb__t-longo.nrb__t-medio { display: inline; }
.nrb__cart {
  color: var(--nu-gray-2); text-decoration: underline; text-decoration-color: transparent; text-underline-offset: 3px;
  transition: color var(--nu-dur-media) var(--nu-ease-cor), text-decoration-color var(--nu-dur-media) var(--nu-ease-cor);
}
.nrb__cart:hover { color: var(--nu-ink); text-decoration-color: var(--nu-line); }
.nrb__cart--atencao .nrb__cart-estado { color: var(--nu-amber-text); font-weight: var(--nu-w-medio); }
/* no celular o "pede atenção" vira o ponto âmbar (a palavra segue no aria-label) */
.nrb__cart-ponto { display: none; width: 6px; height: 6px; margin-left: 5px; border-radius: 50%; background: var(--nu-amber); vertical-align: 1px; }
.nrb-troca-enter-active, .nrb-troca-leave-active { transition: opacity var(--nu-dur-media) var(--nu-ease-cor); }
.nrb-troca-enter-from, .nrb-troca-leave-to { opacity: 0; }

/* ——— a dica ——— */
.nrb__dica {
  position: absolute; top: calc(100% - 2px); left: 0; z-index: 5;
  padding: 10px 12px; border-radius: var(--nu-r-chip); background: var(--nu-white); box-shadow: var(--nu-shadow-float);
  white-space: nowrap; pointer-events: none; visibility: hidden;
  transition: transform var(--nu-dur-rapida) var(--nu-ease-saida);
}
.nrb__dica--medida { visibility: visible; }
.nrb__dica p { margin: 0; }
.nrb__dica-titulo { color: var(--nu-ink); font-size: var(--nu-fs-dense); line-height: 1.35; font-variant-numeric: tabular-nums; }
.nrb__dica-titulo b { font-weight: var(--nu-w-medio); }
.nrb__dica-pct { font-weight: var(--nu-w-medio); }
.nrb__dica-pct--up { color: var(--nu-green-text); }
.nrb__dica-pct--down { color: var(--nu-red-text); }
.nrb__dica-pct--flat { color: var(--nu-gray); }
.nrb__dica-linha { margin-top: 2px !important; color: var(--nu-gray); font-size: var(--nu-fs-xs); line-height: 1.4; font-variant-numeric: tabular-nums; }
.nrb__dica-sua { display: flex; align-items: center; gap: 6px; margin-top: 6px !important; color: var(--nu-blue-text); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); }
.nrb__dica-sua i { width: 6px; height: 6px; border-radius: 50%; background: var(--nu-blue); }
/* o pé: de quando é o dado (o aviso de atraso da B3), pequeno e cinza */
.nrb__dica-nota { margin-top: 6px !important; color: var(--nu-gray); font-size: var(--nu-fs-xs); line-height: 1.4; }
.nrb-dica-enter-active { transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor); }
.nrb-dica-leave-active { transition: opacity var(--nu-dur-rapida) var(--nu-ease-cor); }
.nrb-dica-enter-from, .nrb-dica-leave-to { opacity: 0; }

/* ——— tablet: o número no tamanho médio ("71% subiu na sexta") ——— */
@media (max-width: 1023px) {
  .nrb__lado-in { gap: 12px; }
  .nrb__lado--esq .nrb__lado-in { padding-right: 12px; }
  .nrb__lado--dir .nrb__lado-in { padding-left: 12px; }
  .nrb__t-longo { display: none; }
  .nrb__t-medio, .nrb__t-longo.nrb__t-medio { display: inline; }
}
/* ——— celular: "10h", a barra de 14px sem rótulo e "71% subiu" ——— */
@media (max-width: 640px) {
  .nrb { font-size: var(--nu-fs-xs); }
  .nrb__lado-in { gap: 10px; }
  .nrb__lado--esq .nrb__lado-in { padding-right: 10px; }
  .nrb__lado--dir .nrb__lado-in { padding-left: 10px; }
  .nrb__estado-longo, .nrb__fio { display: none; }
  .nrb__estado-curto { display: inline-flex; }
  .nrb__barra { height: 14px; min-width: 40px; }
  .nrb__barra::before { inset: -11px 0; }
  .nrb__rotulo { display: none !important; }
  .nrb__t-longo, .nrb__t-medio, .nrb__t-longo.nrb__t-medio { display: none; }
  .nrb__t-curto { display: inline; }
  .nrb__cart-ponto { display: inline-block; }
  .nrb__marca i { top: -4px; width: 5px; height: 5px; margin-left: -2.5px; }
}
@media (prefers-reduced-motion: reduce) {
  .nrb--acende .nrb__pedaco, .nrb__marca, .nrb--textos .nrb__lado-in { animation: none; }
  .nrb__pedaco, .nrb__marca, .nrb__dica, .nrb__cart, .nrb__lado, .nrb--larga .nrb__lado, .nrb__lado-in, .nrb__rotulo { transition: none; }
  .nrb--larga .nrb__lado-in { transform: none; filter: none; }
}
</style>

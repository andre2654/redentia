<script setup lang="ts">
// O mercado inteiro de uma vez, e o que importou (31/10/2026). Pedido do
// dono: passar a sensação de que a Redentia lê o mercado e de que a pessoa
// não precisa ver o mercado inteiro. É a mesma língua do leque da carteira
// (os 2.000 caminhos em cinza e três acesos): as 76 ações do Ibovespa, cada
// uma um ponto do tamanho do peso dela no índice e posto pela variação do
// dia, todas em cinza; acesas, só as cinco que explicam o dia (as três que
// fizeram o movimento e as duas que andaram contra), com o nome e os pontos.
// Peso × variação é a contribuição: ponto grande e longe do zero é o que
// mexeu no índice, e o olho chega lá sozinho.
// Hover (e toque) mostra qualquer ação; clicar leva à página dela. A tabela
// das 76 fica para o leitor de tela.
import type { BolsaDoDia, EmpresaDoDia } from '~/utils/bolsaDoDia'

const props = defineProps<{
  acoes: BolsaDoDia['acoes']
  pesos: { variacao: number; negativas: EmpresaDoDia[]; positivas: EmpresaDoDia[] }
  contagem: { altas: number; quedas: number; total: number } | null
  aoVivo: boolean
}>()
const emit = defineEmits<{ (e: 'clique'): void }>()

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pontos = (v: number) => {
  const n = Math.trunc(v)
  return n === 0 ? '0' : `${n > 0 ? '+' : '−'}${nf0.format(Math.abs(n))}`
}
const pct = (v: number) => (Math.abs(v) < 0.005 ? '0,00%' : `${v > 0 ? '+' : '−'}${nf2.format(Math.abs(v))}%`)
const CARDINAIS = ['Nenhuma', 'Uma', 'Duas', 'Três', 'Quatro', 'Cinco']

// as empresas acesas: as três que fizeram o dia e as duas que andaram contra
const queda = computed(() => props.pesos.variacao < 0)
const destaques = computed(() => [
  ...(queda.value ? props.pesos.negativas : props.pesos.positivas).slice(0, 3),
  ...(queda.value ? props.pesos.positivas : props.pesos.negativas).slice(0, 2),
])
const acesa = computed(() => new Map(destaques.value.map((d) => [d.nome, d])))
const cor = (pontosDaEmpresa: number) => (pontosDaEmpresa < 0 ? 'var(--nu-chart-queda)' : 'var(--nu-chart-alta)')

// a largura vem do navegador; no servidor, 520
const caixa = ref<HTMLElement | null>(null)
const largura = ref(520)
let observador: ResizeObserver | null = null
onMounted(() => {
  if (!caixa.value) return
  largura.value = caixa.value.clientWidth || 520
  observador = new ResizeObserver(([e]) => { if (e) largura.value = Math.max(260, Math.round(e.contentRect.width)) })
  observador.observe(caixa.value)
})
onBeforeUnmount(() => observador?.disconnect())

const M = { esq: 10, dir: 10 }
const LINHA_DE_ROTULO = 18
// o eixo vai da maior queda à maior alta do dia, em pontos percentuais inteiros,
// sempre com o zero dentro: a largura toda é do mercado
const dominio = computed(() => {
  const v = props.acoes.map((a) => a.pct)
  return { lo: Math.min(-1, Math.floor(Math.min(...v, 0))), hi: Math.max(1, Math.ceil(Math.max(...v, 0))) }
})
const X = (p: number) => M.esq + ((p - dominio.value.lo) / (dominio.value.hi - dominio.value.lo)) * (largura.value - M.esq - M.dir)
const raio = (peso: number) => 2.8 + Math.sqrt(Math.max(0, peso)) * (largura.value < 420 ? 2.1 : 2.9)

// o enxame: as maiores primeiro, cada uma desce ou sobe até não encostar em ninguém
const bolhas = computed(() => {
  const postas: { ticker: string; empresa: string; pct: number; pontos: number; peso: number; x: number; y: number; r: number; acesa: boolean }[] = []
  for (const a of [...props.acoes].sort((p, q) => q.peso - p.peso)) {
    const b = { ...a, x: X(a.pct), y: 0, r: raio(a.peso), acesa: acesa.value.has(a.empresa) }
    let k = 0
    while (postas.some((p) => Math.hypot(p.x - b.x, p.y - b.y) < p.r + b.r + 1.5) && k < 400) {
      k++
      b.y = (k % 2 ? 1 : -1) * Math.ceil(k / 2)
    }
    postas.push(b)
  }
  return postas
})
const meia = computed(() => Math.max(36, ...bolhas.value.map((b) => Math.abs(b.y) + b.r)) + 4)

// os rótulos das acesas: em cima as que fizeram o dia, embaixo as que andaram
// contra, em escada. Cada nome fica numa fila e sai do lado de fora da sua
// linha; a fila mais longe do enxame é a da bolha mais de fora, então nenhuma
// linha atravessa um nome.
const rotulos = computed(() => {
  const out: { empresa: string; ticker: string; texto: string; x: number; yb: number; fila: number; cor: string; cima: boolean; ancora: 'start' | 'end' }[] = []
  const grupos = [
    { cima: true, lista: destaques.value.slice(0, 3) },
    { cima: false, lista: destaques.value.slice(3) },
  ]
  for (const g of grupos) {
    const comBolha = g.lista
      .map((d) => ({ d, b: bolhas.value.find((b) => b.ticker === d.ticker) ?? bolhas.value.find((b) => b.empresa === d.nome) }))
      .filter((x): x is { d: EmpresaDoDia; b: NonNullable<typeof x.b> } => !!x.b)
    // do lado esquerdo do zero o nome sai para a direita da linha; do direito, para a esquerda
    const esquerda = comBolha.length ? comBolha.reduce((s, x) => s + x.b.x, 0) / comBolha.length < X(0) : true
    // a bolha mais de fora fica com a fila mais longe
    comBolha.sort((p, q) => (esquerda ? p.b.x - q.b.x : q.b.x - p.b.x))
    comBolha.forEach(({ d, b }, i) => {
      out.push({
        empresa: d.nome, ticker: d.ticker, texto: `${d.nome} ${pontos(d.pontos)}`,
        x: b.x, yb: b.y, fila: comBolha.length - 1 - i, cor: cor(d.pontos), cima: g.cima, ancora: esquerda ? 'start' : 'end',
      })
    })
  }
  return out
})
const filasEmCima = computed(() => 1 + Math.max(0, ...rotulos.value.filter((r) => r.cima).map((r) => r.fila)))
const filasEmBaixo = computed(() => (rotulos.value.some((r) => !r.cima) ? 1 + Math.max(0, ...rotulos.value.filter((r) => !r.cima).map((r) => r.fila)) : 0))
const topoDoEnxame = computed(() => filasEmCima.value * LINHA_DE_ROTULO + 14)
const centro = computed(() => topoDoEnxame.value + meia.value)
const baseDoEnxame = computed(() => centro.value + meia.value)
const ALTURA = computed(() => baseDoEnxame.value + 14 + filasEmBaixo.value * LINHA_DE_ROTULO + 26)
const yRotulo = (r: { cima: boolean; fila: number }) => (r.cima
  ? topoDoEnxame.value - 10 - r.fila * LINHA_DE_ROTULO
  : baseDoEnxame.value + 22 + r.fila * LINHA_DE_ROTULO)

// o cursor: a ação mais perto do ponteiro
const sob = ref<(typeof bolhas.value)[number] | null>(null)
function mover(e: PointerEvent) {
  if (!caixa.value) return
  const box = caixa.value.getBoundingClientRect()
  const px = e.clientX - box.left
  const py = e.clientY - box.top - centro.value
  let melhor: (typeof bolhas.value)[number] | null = null
  let dist = Infinity
  for (const b of bolhas.value) {
    const d = Math.hypot(b.x - px, b.y - py)
    if (d < dist && d < Math.max(14, b.r + 8)) { dist = d; melhor = b }
  }
  sob.value = melhor
}
function clicar() {
  if (!sob.value) return
  emit('clique')
  void navigateTo(`/asset/${sob.value.ticker}`)
}
function irPara(ticker: string, e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  emit('clique')
  void navigateTo(`/asset/${ticker}`)
}

const titulo = computed(() => `As ${props.acoes.length} ações do Ibovespa, de uma vez.`)
const sub = computed(() => `A Redentia olhou todas. ${CARDINAIS[destaques.value.length] ?? destaques.value.length} ${destaques.value.length === 1 ? 'explica' : 'explicam'} o dia${props.aoVivo ? ' até agora' : ''}.`)
</script>

<template>
  <figure class="hbm">
    <figcaption class="hbm__cabeca">
      <span class="hbm__titulo">{{ titulo }}</span>
      <span class="hbm__sub">{{ sub }}</span>
    </figcaption>

    <div
      ref="caixa" class="hbm__caixa" :style="{ height: `${ALTURA}px` }"
      @pointermove="mover" @pointerdown="mover" @pointerleave="sob = null" @click="clicar"
    >
      <svg :width="largura" :height="ALTURA" :viewBox="`0 0 ${largura} ${ALTURA}`" class="hbm__svg" aria-hidden="true">
        <!-- o zero -->
        <line :x1="X(0)" :x2="X(0)" :y1="topoDoEnxame" :y2="baseDoEnxame" class="hbm__zero" />
        <!-- todas as ações, em cinza; as acesas por cima -->
        <g :transform="`translate(0 ${centro})`">
          <circle v-for="b in bolhas.filter((x) => !x.acesa)" :key="b.ticker" :cx="b.x" :cy="b.y" :r="b.r" class="hbm__bolha" :class="{ 'hbm__bolha--sob': sob?.ticker === b.ticker }" />
          <circle v-for="b in bolhas.filter((x) => x.acesa)" :key="b.ticker" :cx="b.x" :cy="b.y" :r="b.r + 2" class="hbm__anel" />
          <circle v-for="b in bolhas.filter((x) => x.acesa)" :key="`${b.ticker}-c`" :cx="b.x" :cy="b.y" :r="b.r" :fill="cor(acesa.get(b.empresa)!.pontos)" />
        </g>
        <!-- os nomes das que explicam o dia -->
        <a v-for="r in rotulos" :key="r.empresa" :href="`/asset/${r.ticker}`" class="hbm__rotulo" @click.stop="irPara(r.ticker, $event)">
          <line :x1="r.x" :y1="centro + r.yb" :x2="r.x" :y2="yRotulo(r) - 4" :stroke="r.cor" class="hbm__fio" />
          <text :x="r.ancora === 'start' ? r.x + 6 : r.x - 6" :y="yRotulo(r)" :text-anchor="r.ancora" class="hbm__nome">{{ r.texto }}</text>
        </a>
        <!-- o eixo: quantas caíram e quantas subiram -->
        <text :x="M.esq" :y="ALTURA - 6" class="hbm__eixo">{{ contagem ? `${contagem.quedas} ${aoVivo ? 'caem' : 'caíram'}` : `${dominio.lo}%` }}</text>
        <text :x="X(0)" :y="ALTURA - 6" text-anchor="middle" class="hbm__eixo">0%</text>
        <text :x="largura - M.dir" :y="ALTURA - 6" text-anchor="end" class="hbm__eixo">{{ contagem ? `${contagem.altas} ${aoVivo ? 'sobem' : 'subiram'}` : `+${dominio.hi}%` }}</text>
      </svg>
      <div v-if="sob" class="hbm__dica" :class="{ 'hbm__dica--esq': sob.x > largura - 180 }" :style="{ left: `${sob.x}px`, top: `${Math.max(0, centro + sob.y - 58)}px` }">
        <strong class="hbm__dica-nome">{{ sob.empresa }} <span class="hbm__dica-ticker">{{ sob.ticker }}</span></strong>
        <span class="hbm__dica-num">{{ pct(sob.pct) }} · {{ pontos(sob.pontos) }} pontos</span>
      </div>
    </div>

    <table class="hbm__sr">
      <caption>As ações do Ibovespa no dia, com a variação e os pontos que cada uma somou ou tirou do índice</caption>
      <thead><tr><th>Ação</th><th>Variação</th><th>Pontos</th></tr></thead>
      <tbody><tr v-for="a in acoes" :key="a.ticker"><td>{{ a.empresa }} ({{ a.ticker }})</td><td>{{ pct(a.pct) }}</td><td>{{ pontos(a.pontos) }}</td></tr></tbody>
    </table>
  </figure>
</template>

<style scoped>
.hbm { margin: 0; min-width: 0; }
.hbm__cabeca { display: flex; flex-direction: column; gap: 4px; }
.hbm__titulo { color: var(--nu-ink); font-size: var(--nu-fs-md); font-weight: 700; }
.hbm__sub { color: var(--nu-gray); font-size: var(--nu-fs-sm); font-weight: 500; }
.hbm__caixa { position: relative; margin-top: 10px; touch-action: pan-y; cursor: pointer; }
.hbm__svg { display: block; overflow: visible; }
.hbm__zero { stroke: var(--nu-ink-30); stroke-width: 1; }
/* as que não explicam o dia: presentes, mas quietas */
.hbm__bolha { fill: var(--nu-ink); fill-opacity: .13; transition: fill-opacity .15s; }
.hbm__bolha--sob { fill-opacity: .45; }
.hbm__anel { fill: var(--nu-cream); }
.hbm__fio { stroke-width: 1.2; stroke-opacity: .6; }
.hbm__nome { fill: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 800; font-variant-numeric: tabular-nums; }
.hbm__rotulo:hover .hbm__nome { text-decoration: underline; }
.hbm__rotulo:focus-visible { outline: 2px solid var(--nu-blue); }
.hbm__eixo { fill: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; }
.hbm__dica {
  position: absolute; transform: translateX(10px); pointer-events: none; z-index: 1;
  display: flex; flex-direction: column; gap: 1px; padding: 8px 12px; border-radius: 10px;
  background: var(--nu-white); box-shadow: var(--nu-shadow-card); white-space: nowrap;
}
.hbm__dica--esq { transform: translateX(calc(-100% - 10px)); }
.hbm__dica-nome { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 800; }
.hbm__dica-ticker { color: var(--nu-gray); font-weight: 700; }
.hbm__dica-num { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; }
.hbm__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) {
  .hbm__bolha { transition: none; }
}
</style>

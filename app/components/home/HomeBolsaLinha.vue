<script setup lang="ts">
// A linha do pregão na bolsa do dia da home (31/10/2026; o dono achou a versão
// só de texto "texto demais, sem desenho"). O Ibovespa minuto a minuto da B3,
// no trilho das 10h ao fechamento, como a linha do Mercado nos apps: o
// fechamento anterior tracejado (a referência do dia), a linha na cor do
// sentido do dia, a área clara embaixo e o ponto na ponta. Sem o pregão
// minuto a minuto, a linha cai para os últimos fechamentos.
// Hover (e toque, e as setas do teclado) acha o minuto mais perto: a linha
// vertical, o ponto e o valor com a variação sobre o fechamento anterior.
// O SVG é desenhado na largura medida (os textos ficam no tamanho certo); a
// altura é fixa, então nada pula quando a largura chega.
// Desde 31/10/2026 (ideia do dono) a linha fica no azul-marinho da bolsa do
// dia e tem a leitura: `varredura` (0 a 1) passa uma linha clara da esquerda
// para a direita, com a hora que a Redentia está lendo; o que ela já leu fica
// aceso e o resto, apagado.
const props = defineProps<{
  intradia: { data: string; anterior: number; pontos: [number, number][] } | null
  diarias: { d: string; v: number }[]
  /** 17 ou 18: o fim do trilho */
  fechaAs: number
  /** a leitura da Redentia, de 0 a 1; null fora da leitura */
  varredura?: number | null
}>()

const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pts = (v: number) => nf0.format(Math.trunc(v))
const pct = (v: number) => (Math.abs(v) < 0.005 ? '0,00%' : `${v > 0 ? '+' : '−'}${nf2.format(Math.abs(v))}%`)
const hora = (m: number) => `${10 + Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`
const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const diaCurto = (iso: string) => `${DIAS[new Date(`${iso}T12:00:00Z`).getUTCDay()]} ${iso.slice(8, 10)}/${iso.slice(5, 7)}`

// os pontos: [x no domínio, valor, rótulo do tooltip]
const modo = computed(() => (props.intradia ? 'dia' : 'dias'))
const serie = computed<{ x: number; v: number; rotulo: string }[]>(() => props.intradia
  ? props.intradia.pontos.map(([m, v]) => ({ x: m, v, rotulo: hora(m) }))
  : props.diarias.map((p, i) => ({ x: i, v: p.v, rotulo: diaCurto(p.d) })))
const referencia = computed(() => props.intradia?.anterior ?? props.diarias[0]?.v ?? null)
// o trilho vai até o fechamento ou até o último ponto, o que vier depois (o
// leilão de fechamento acaba por volta das 17h18)
const xMax = computed(() => (props.intradia
  ? Math.max((props.fechaAs - 10) * 60, props.intradia.pontos[props.intradia.pontos.length - 1]?.[0] ?? 0)
  : Math.max(1, props.diarias.length - 1)))

// a largura vem do navegador; no servidor, 640
const caixa = ref<HTMLElement | null>(null)
const largura = ref(640)
let observador: ResizeObserver | null = null
onMounted(() => {
  if (!caixa.value) return
  largura.value = caixa.value.clientWidth || 640
  observador = new ResizeObserver(([e]) => { if (e) largura.value = Math.max(240, Math.round(e.contentRect.width)) })
  observador.observe(caixa.value)
})
onBeforeUnmount(() => observador?.disconnect())

// a mesma altura em toda largura: a caixa tem 240 no CSS e nada pula ao medir
const ALTURA = 240
const M = { topo: 16, dir: 72, base: 30, esq: 2 }
const geo = computed(() => {
  const s = serie.value
  if (s.length < 2) return null
  const vals = s.map((p) => p.v)
  if (referencia.value != null) vals.push(referencia.value)
  let lo = Math.min(...vals)
  let hi = Math.max(...vals)
  const folga = (hi - lo) * 0.12 || hi * 0.002
  lo -= folga
  hi += folga
  const w = largura.value - M.esq - M.dir
  const h = ALTURA - M.topo - M.base
  const X = (x: number) => M.esq + (x / xMax.value) * w
  const Y = (v: number) => M.topo + (1 - (v - lo) / (hi - lo)) * h
  const linha = s.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)} ${Y(p.v).toFixed(1)}`).join(' ')
  const ultimo = s[s.length - 1]!
  const area = `${linha} L${X(ultimo.x).toFixed(1)} ${M.topo + h} L${X(s[0]!.x).toFixed(1)} ${M.topo + h} Z`
  return { X, Y, linha, area, ultimo, base: M.topo + h, w }
})
const queda = computed(() => {
  const s = serie.value
  const ref0 = referencia.value
  return s.length > 0 && ref0 != null && s[s.length - 1]!.v < ref0
})
const cor = computed(() => (queda.value ? 'var(--nu-red-soft)' : 'var(--nu-green-soft)'))

// os rótulos do eixo: 10h, o meio e o fim (ou o primeiro e o último fechamento)
const marcas = computed(() => {
  if (!geo.value) return []
  if (modo.value === 'dia') {
    const fim = (props.fechaAs - 10) * 60
    return [{ x: 0, t: '10h', ancora: 'start' }, { x: fim / 2, t: `${10 + (props.fechaAs - 10) / 2}h`.replace('.5h', 'h30'), ancora: 'middle' }, { x: fim, t: `${props.fechaAs}h`, ancora: 'end' }]
  }
  const s = serie.value
  return [{ x: 0, t: s[0]!.rotulo, ancora: 'start' }, { x: s[s.length - 1]!.x, t: s[s.length - 1]!.rotulo, ancora: 'end' }]
})

// a leitura: onde está a linha da Redentia e que hora ela está lendo
const leitura = computed(() => {
  const g = geo.value
  const f = props.varredura
  if (!g || f == null) return null
  const x = M.esq + f * g.w
  const minuto = Math.round(f * xMax.value)
  return { x, rotulo: modo.value === 'dia' ? `lendo ${hora(Math.min(minuto, xMax.value))}` : 'lendo' }
})

// o cursor: o ponto mais perto do x do ponteiro
const cursor = ref<number | null>(null)
function mover(e: PointerEvent) {
  const g = geo.value
  if (!g || !caixa.value) return
  const rx = e.clientX - caixa.value.getBoundingClientRect().left
  const alvo = ((rx - M.esq) / g.w) * xMax.value
  let melhor = 0
  serie.value.forEach((p, i) => { if (Math.abs(p.x - alvo) < Math.abs(serie.value[melhor]!.x - alvo)) melhor = i })
  cursor.value = melhor
}
function tecla(e: KeyboardEvent) {
  const n = serie.value.length
  if (!n) return
  const passo = modo.value === 'dia' ? 5 : 1
  if (e.key === 'ArrowRight') cursor.value = Math.min(n - 1, (cursor.value ?? n - 1) + passo)
  else if (e.key === 'ArrowLeft') cursor.value = Math.max(0, (cursor.value ?? n - 1) - passo)
  else if (e.key === 'Escape') cursor.value = null
  else return
  e.preventDefault()
}
const ativo = computed(() => (cursor.value == null ? null : serie.value[cursor.value] ?? null))
const dica = computed(() => {
  const g = geo.value
  const p = ativo.value
  if (!g || !p) return null
  const ref0 = referencia.value
  const x = g.X(p.x)
  return {
    x, y: g.Y(p.v),
    titulo: p.rotulo,
    valor: `${pts(p.v)} pontos`,
    variacao: ref0 != null ? pct((p.v / ref0 - 1) * 100) : null,
    esquerda: x > largura.value - 170,
  }
})

// o resumo para o leitor de tela (a tabela da linha, em uma frase)
const resumo = computed(() => {
  const s = serie.value
  if (s.length < 2) return ''
  const min = s.reduce((a, b) => (b.v < a.v ? b : a))
  const max = s.reduce((a, b) => (b.v > a.v ? b : a))
  const ini = modo.value === 'dia' ? 'O Ibovespa abriu' : 'O Ibovespa começou'
  return `${ini} a ${pts(s[0]!.v)} pontos, foi a ${pts(min.v)} na mínima (${min.rotulo}) e a ${pts(max.v)} na máxima (${max.rotulo}), e terminou a ${pts(s[s.length - 1]!.v)}.`
})
</script>

<template>
  <figure class="hbl">
    <figcaption class="hbl__sr">{{ resumo }}</figcaption>
    <div
      ref="caixa" class="hbl__caixa" tabindex="0" role="img" :aria-label="resumo"
      @pointermove="mover" @pointerdown="mover" @pointerleave="cursor = null" @keydown="tecla" @blur="cursor = null"
    >
      <svg v-if="geo" :width="largura" :height="ALTURA" :viewBox="`0 0 ${largura} ${ALTURA}`" class="hbl__svg" aria-hidden="true">
        <defs>
          <linearGradient id="hbl-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" :stop-color="cor" stop-opacity="0.16" />
            <stop offset="1" :stop-color="cor" stop-opacity="0" />
          </linearGradient>
        </defs>
        <!-- o fechamento anterior: a referência do dia, tracejada -->
        <template v-if="referencia != null">
          <line :x1="M.esq" :x2="M.esq + geo.w" :y1="geo.Y(referencia)" :y2="geo.Y(referencia)" class="hbl__ref" />
          <text :x="M.esq + geo.w + 8" :y="geo.Y(referencia) + 4" class="hbl__ref-txt">{{ pts(referencia) }}</text>
        </template>
        <clipPath id="hbl-lido"><rect x="0" y="0" :width="leitura ? leitura.x : largura" :height="ALTURA" /></clipPath>
        <path :d="geo.area" fill="url(#hbl-area)" :clip-path="leitura ? 'url(#hbl-lido)' : undefined" />
        <!-- na leitura, o que falta ler fica apagado e o que já foi lido acende -->
        <path v-if="leitura" :d="geo.linha" fill="none" class="hbl__apagada" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
        <path :d="geo.linha" fill="none" :stroke="cor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" :clip-path="leitura ? 'url(#hbl-lido)' : undefined" />
        <!-- a ponta: o ponto com o anel de creme e o valor -->
        <template v-if="!leitura || leitura.x >= geo.X(geo.ultimo.x)">
          <circle :cx="geo.X(geo.ultimo.x)" :cy="geo.Y(geo.ultimo.v)" r="6" class="hbl__anel" />
          <circle :cx="geo.X(geo.ultimo.x)" :cy="geo.Y(geo.ultimo.v)" r="4" :fill="cor" />
          <text :x="geo.X(geo.ultimo.x) + 10" :y="geo.Y(geo.ultimo.v) + 4" class="hbl__fim">{{ pts(geo.ultimo.v) }}</text>
        </template>
        <!-- o eixo do tempo -->
        <line :x1="M.esq" :x2="M.esq + geo.w" :y1="geo.base" :y2="geo.base" class="hbl__eixo" />
        <text v-for="m in marcas" :key="m.t" :x="geo.X(m.x)" :y="ALTURA - 8" :text-anchor="m.ancora" class="hbl__marca">{{ m.t }}</text>
        <!-- a linha da leitura -->
        <template v-if="leitura">
          <line :x1="leitura.x" :x2="leitura.x" :y1="M.topo - 6" :y2="geo.base" class="hbl__leitor" />
          <text :x="leitura.x" :y="M.topo - 12" text-anchor="middle" class="hbl__leitor-txt">{{ leitura.rotulo }}</text>
        </template>
        <!-- o cursor -->
        <template v-if="dica">
          <line :x1="dica.x" :x2="dica.x" :y1="M.topo" :y2="geo.base" class="hbl__cursor" />
          <circle :cx="dica.x" :cy="dica.y" r="6" class="hbl__anel" />
          <circle :cx="dica.x" :cy="dica.y" r="4" :fill="cor" />
        </template>
      </svg>
      <div v-if="dica" class="hbl__dica" :class="{ 'hbl__dica--esq': dica.esquerda }" :style="{ left: `${dica.x}px`, top: `${Math.max(0, dica.y - 64)}px` }">
        <strong class="hbl__dica-valor">{{ dica.valor }}</strong>
        <span v-if="dica.variacao" class="hbl__dica-var">{{ dica.variacao }}</span>
        <span class="hbl__dica-tit">{{ dica.titulo }}</span>
      </div>
    </div>
  </figure>
</template>

<style scoped>
.hbl { margin: 0; min-width: 0; }
.hbl__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.hbl__caixa { position: relative; height: 240px; touch-action: pan-y; outline: none; border-radius: 8px; }
.hbl__caixa:focus-visible { box-shadow: 0 0 0 2px var(--nu-blue-soft); }
.hbl__svg { display: block; overflow: visible; }
.hbl__ref { stroke: var(--nu-cream-text-45); stroke-width: 1; stroke-dasharray: 3 4; }
.hbl__ref-txt, .hbl__marca { fill: var(--nu-cream-text-50); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; }
.hbl__fim { fill: var(--nu-cream-text); font-size: var(--nu-fs-sm); font-weight: 800; font-variant-numeric: tabular-nums; }
.hbl__eixo { stroke: var(--nu-cream-text-12); stroke-width: 1; }
.hbl__anel { fill: var(--nu-navy); }
.hbl__cursor { stroke: var(--nu-cream-text-45); stroke-width: 1; }
.hbl__apagada { stroke: var(--nu-cream-text-12); }
.hbl__leitor { stroke: var(--nu-cream-text); stroke-width: 1.5; filter: drop-shadow(0 0 6px var(--nu-blue-soft)); }
.hbl__leitor-txt { fill: var(--nu-cream-text); font-size: var(--nu-fs-xs); font-weight: 800; font-variant-numeric: tabular-nums; }
.hbl__dica {
  position: absolute; transform: translateX(10px); pointer-events: none; z-index: 1;
  display: flex; flex-direction: column; gap: 1px; padding: 8px 12px; border-radius: 10px;
  background: var(--nu-white); box-shadow: var(--nu-shadow-card); white-space: nowrap;
}
.hbl__dica--esq { transform: translateX(calc(-100% - 10px)); }
.hbl__dica-valor { color: var(--nu-ink); font-size: var(--nu-fs-sm); font-weight: 800; }
.hbl__dica-var, .hbl__dica-tit { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 700; font-variant-numeric: tabular-nums; }
</style>

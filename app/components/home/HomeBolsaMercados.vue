<script setup lang="ts">
// "O mercado" (31/10/2026, pedido do dono: "tudo junto"): Ibovespa, IFIX,
// dólar e Bitcoin no mesmo gráfico, cada um em % desde as 10h, numa escala
// só. De propósito parece um pouco confuso: é a deixa para "Parece confuso? A
// Redentia deixa mais simples." e o botão da leitura.
// O Ibovespa é a linha principal (creme, mais grossa); IFIX, dólar e Bitcoin
// levam o nome e o número no fim de cada linha (a cor nunca está sozinha).
// Sem brilho.
// Aportou (11/11/2026): as cores saíram do hex fixo para os tokens da marca
// sobre o carvão: Ibovespa no creme da paleta, IFIX no cobalto que lê sobre
// escuro, dólar no âmbar e Bitcoin na sálvia (todas acima de 5:1 no carvão).
// Antes eram azul, ocre e rosa validados contra daltonismo sobre o navy; a
// família nova não passou por essa validação (está no relatório da leva).
// A leitura (`varredura`, 0 a 1): uma faixa clara atravessa o dia, com a hora;
// o que ela já leu fica aceso e o resto, apagado.
// Hover, toque e as setas do teclado mostram os quatro naquele minuto.
// Robustez (11/11/2026): a dica é uma superfície que flutua (--nu-shadow-float,
// a sombra de menu e painel) e surge em 160 ms em vez de piscar; os pesos e o
// tracking dos rótulos vêm dos tokens.
import type { MercadoDoDia } from '~/utils/bolsaDoDia'

const props = defineProps<{
  mercados: MercadoDoDia[]
  /** 17 ou 18: o fim do trilho */
  fechaAs: number
  varredura?: number | null
}>()

const COR: Record<MercadoDoDia['id'], string> = { ibov: 'var(--nu-creme)', ifix: 'var(--nu-blue-on-dark)', dolar: 'var(--nu-amber)', btc: 'var(--nu-sage)' }
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pct = (v: number) => (Math.abs(v) < 0.005 ? '0,00%' : `${v > 0 ? '+' : '−'}${nf2.format(Math.abs(v))}%`)
const hora = (m: number) => `${10 + Math.floor(m / 60)}h${String(Math.max(0, m) % 60).padStart(2, '0')}`

// a ordem de desenho: o Ibovespa por cima
const series = computed(() => [...props.mercados].sort((a, b) => (a.id === 'ibov' ? 1 : b.id === 'ibov' ? -1 : 0)))
const xMax = computed(() => Math.max((props.fechaAs - 10) * 60, ...props.mercados.map((m) => m.pontos[m.pontos.length - 1]?.[0] ?? 0)))

const caixa = ref<HTMLElement | null>(null)
const largura = ref(900)
let observador: ResizeObserver | null = null
onMounted(() => {
  if (!caixa.value) return
  largura.value = caixa.value.clientWidth || 900
  observador = new ResizeObserver(([e]) => { if (e) largura.value = Math.max(260, Math.round(e.contentRect.width)) })
  observador.observe(caixa.value)
})
onBeforeUnmount(() => observador?.disconnect())

const ALTURA = 280
const M = computed(() => ({ topo: 34, dir: largura.value < 480 ? 92 : 128, base: 30, esq: 2 }))
const geo = computed(() => {
  if (!props.mercados.length) return null
  const vals = props.mercados.flatMap((m) => m.pontos.map((p) => p[1]))
  let lo = Math.min(0, ...vals)
  let hi = Math.max(0, ...vals)
  const folga = (hi - lo) * 0.1 || 0.2
  lo -= folga
  hi += folga
  const m = M.value
  const w = largura.value - m.esq - m.dir
  const h = ALTURA - m.topo - m.base
  const X = (x: number) => m.esq + (x / xMax.value) * w
  const Y = (v: number) => m.topo + (1 - (v - lo) / (hi - lo)) * h
  const caminhos = series.value.map((s) => ({
    ...s,
    d: s.pontos.map((p, i) => `${i ? 'L' : 'M'}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join(' '),
    fim: s.pontos[s.pontos.length - 1]!,
  }))
  // os rótulos do fim, empilhados com folga para não se atropelarem
  const rotulos = caminhos
    .map((c) => ({ id: c.id, nome: c.nome, final: c.final, y: Y(c.fim[1]), x: X(c.fim[0]) }))
    .sort((a, b) => a.y - b.y)
  for (let i = 1; i < rotulos.length; i++) rotulos[i]!.y = Math.max(rotulos[i]!.y, rotulos[i - 1]!.y + 34)
  return { X, Y, w, h, base: m.topo + h, caminhos, rotulos, zero: Y(0) }
})

const leitura = computed(() => {
  const g = geo.value
  const f = props.varredura
  if (!g || f == null) return null
  const x = M.value.esq + f * g.w
  return { x, rotulo: `lendo ${hora(Math.min(Math.round(f * xMax.value), xMax.value))}` }
})

// o cursor: os quatro no minuto mais perto do ponteiro
const cursor = ref<number | null>(null)
function mover(e: PointerEvent) {
  const g = geo.value
  if (!g || !caixa.value || leitura.value) return
  const rx = e.clientX - caixa.value.getBoundingClientRect().left
  cursor.value = Math.max(0, Math.min(xMax.value, Math.round(((rx - M.value.esq) / g.w) * xMax.value)))
}
function tecla(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') cursor.value = Math.min(xMax.value, (cursor.value ?? xMax.value) + 5)
  else if (e.key === 'ArrowLeft') cursor.value = Math.max(0, (cursor.value ?? xMax.value) - 5)
  else if (e.key === 'Escape') cursor.value = null
  else return
  e.preventDefault()
}
const dica = computed(() => {
  const g = geo.value
  const m = cursor.value
  if (!g || m == null) return null
  const linhas = props.mercados.map((s) => {
    let melhor = s.pontos[0]!
    for (const p of s.pontos) if (Math.abs(p[0] - m) < Math.abs(melhor[0] - m)) melhor = p
    return { id: s.id, nome: s.nome, v: melhor[1] }
  })
  const x = g.X(m)
  return { x, hora: hora(m), linhas, esquerda: x > largura.value - 220 }
})

const resumo = computed(() => props.mercados.map((m) => `${m.nome} ${pct(m.final)}`).join(', '))
</script>

<template>
  <figure class="hbm">
    <!-- a legenda: os quatro, com o número do dia -->
    <figcaption class="hbm__legenda">
      <span v-for="m in mercados" :key="m.id" class="hbm__chave"><i :style="{ background: COR[m.id] }" />{{ m.nome }} <strong>{{ pct(m.final) }}</strong></span>
      <span class="hbm__nota">desde as 10h</span>
    </figcaption>
    <div
      ref="caixa" class="hbm__caixa" tabindex="0" role="img" :aria-label="`O mercado desde as 10h: ${resumo}`"
      @pointermove="mover" @pointerdown="mover" @pointerleave="cursor = null" @keydown="tecla" @blur="cursor = null"
    >
      <svg v-if="geo" :width="largura" :height="ALTURA" :viewBox="`0 0 ${largura} ${ALTURA}`" class="hbm__svg" aria-hidden="true">
        <defs>
          <clipPath id="hbm-lido"><rect x="0" y="0" :width="leitura ? leitura.x : largura" :height="ALTURA" /></clipPath>
          <linearGradient id="hbm-rastro" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" class="hbm__rastro" stop-opacity="0" />
            <stop offset="1" class="hbm__rastro" stop-opacity="0.18" />
          </linearGradient>
        </defs>
        <!-- o zero: o nível das 10h -->
        <line :x1="M.esq" :x2="M.esq + geo.w" :y1="geo.zero" :y2="geo.zero" class="hbm__zero" />
        <!-- as linhas: na leitura, o que falta ler fica apagado -->
        <g v-for="c in geo.caminhos" :key="c.id">
          <path v-if="leitura" :d="c.d" fill="none" class="hbm__apagada" :stroke-width="c.id === 'ibov' ? 3 : 2" stroke-linejoin="round" stroke-linecap="round" />
          <path :d="c.d" fill="none" :stroke="COR[c.id]" :stroke-width="c.id === 'ibov' ? 3 : 2" stroke-linejoin="round" stroke-linecap="round" :clip-path="leitura ? 'url(#hbm-lido)' : undefined" />
        </g>
        <!-- o rótulo do zero vai por cima das linhas, que começam todas nele -->
        <text :x="M.esq + 4" :y="geo.zero - 6" class="hbm__zero-txt">nível das 10h</text>
        <!-- os nomes no fim de cada linha -->
        <template v-if="!leitura">
          <g v-for="r in geo.rotulos" :key="r.id">
            <circle :cx="r.x" :cy="geo.Y(geo.caminhos.find((c) => c.id === r.id)!.fim[1])" r="4" :fill="COR[r.id]" />
            <text :x="r.x + 12" :y="r.y - 2" class="hbm__fim-nome">{{ r.nome }}</text>
            <text :x="r.x + 12" :y="r.y + 14" class="hbm__fim-num">{{ pct(r.final) }}</text>
          </g>
        </template>
        <!-- o eixo do tempo -->
        <line :x1="M.esq" :x2="M.esq + geo.w" :y1="geo.base" :y2="geo.base" class="hbm__eixo" />
        <text :x="geo.X(0)" :y="ALTURA - 8" class="hbm__marca">10h</text>
        <text :x="geo.X(210)" :y="ALTURA - 8" text-anchor="middle" class="hbm__marca">13h30</text>
        <text :x="geo.X((fechaAs - 10) * 60)" :y="ALTURA - 8" text-anchor="end" class="hbm__marca">{{ fechaAs }}h</text>
        <!-- a leitura: a faixa que atravessa o dia -->
        <template v-if="leitura">
          <rect :x="Math.max(M.esq, leitura.x - 120)" :y="M.topo - 8" :width="Math.min(120, leitura.x - M.esq)" :height="geo.h + 8" fill="url(#hbm-rastro)" />
          <line :x1="leitura.x" :x2="leitura.x" :y1="M.topo - 8" :y2="geo.base" class="hbm__leitor" />
          <text :x="leitura.x" :y="M.topo - 16" text-anchor="middle" class="hbm__leitor-txt">{{ leitura.rotulo }}</text>
        </template>
        <!-- o cursor -->
        <line v-if="dica" :x1="dica.x" :x2="dica.x" :y1="M.topo" :y2="geo.base" class="hbm__cursor" />
      </svg>
      <div v-if="dica" class="hbm__dica" :class="{ 'hbm__dica--esq': dica.esquerda }" :style="{ left: `${dica.x}px` }">
        <span class="hbm__dica-hora">{{ dica.hora }}</span>
        <span v-for="l in dica.linhas" :key="l.id" class="hbm__dica-linha"><i :style="{ background: COR[l.id] }" /><strong>{{ pct(l.v) }}</strong> {{ l.nome }}</span>
      </div>
    </div>
  </figure>
</template>

<style scoped>
.hbm { margin: 0; min-width: 0; }
.hbm__legenda { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 20px; color: var(--nu-on-dark); font-size: 14.5px; font-weight: var(--nu-w-texto); letter-spacing: var(--nu-ls-texto); }
.hbm__chave { display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; }
.hbm__chave i { width: 14px; height: 3px; border-radius: 2px; }
.hbm__chave strong { color: var(--nu-white); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; }
.hbm__nota { color: var(--nu-on-dark-2); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio); }
.hbm__rastro { stop-color: var(--nu-blue-on-dark); }
.hbm__caixa { position: relative; height: 280px; margin-top: 12px; touch-action: pan-y; outline: none; border-radius: 8px; }
.hbm__caixa:focus-visible { box-shadow: 0 0 0 3px var(--nu-blue-on-dark); }
.hbm__svg { display: block; overflow: visible; }
.hbm__zero { stroke: var(--nu-cream-text-45); stroke-width: 1; stroke-dasharray: 3 4; }
.hbm__zero-txt, .hbm__marca { fill: var(--nu-on-dark-2); font-size: var(--nu-fs-dense); font-weight: var(--nu-w-medio); }
/* o rótulo do zero fica sob o começo das linhas: um contorno da cor do fundo o separa */
.hbm__zero-txt { paint-order: stroke; stroke: var(--nu-ink); stroke-width: 4px; stroke-linejoin: round; }
.hbm__eixo { stroke: var(--nu-cream-text-12); stroke-width: 1; }
.hbm__apagada { stroke: var(--nu-cream-text-12); }
.hbm__fim-nome { fill: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-forte); }
.hbm__fim-num { fill: var(--nu-on-dark); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-medio); font-variant-numeric: tabular-nums; }
.hbm__leitor { stroke: var(--nu-creme); stroke-width: 2; }
.hbm__leitor-txt { fill: var(--nu-white); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; }
.hbm__cursor { stroke: var(--nu-cream-text-45); stroke-width: 1; }
.hbm__dica {
  position: absolute; top: 34px; transform: translateX(12px); pointer-events: none; z-index: 2;
  display: flex; flex-direction: column; gap: 4px; padding: 10px 14px; border-radius: var(--nu-r-chip);
  background: var(--nu-white); box-shadow: var(--nu-shadow-float); white-space: nowrap;
  animation: nu-surgir var(--nu-dur-rapida) var(--nu-ease-cor) both;
}
.hbm__dica--esq { transform: translateX(calc(-100% - 12px)); }
.hbm__dica-hora { color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: var(--nu-w-medio); }
.hbm__dica-linha { display: inline-flex; align-items: center; gap: 7px; color: var(--nu-gray-3); font-size: var(--nu-fs-sm); font-weight: var(--nu-w-texto); }
.hbm__dica-linha i { width: 12px; height: 3px; border-radius: 2px; box-shadow: 0 0 0 1px var(--nu-ink-30); }
.hbm__dica-linha strong { min-width: 54px; color: var(--nu-ink); font-weight: var(--nu-w-forte); font-variant-numeric: tabular-nums; }
</style>

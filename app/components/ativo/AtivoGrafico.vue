<script setup lang="ts">
// O gráfico de preço do /asset (03/11/2026). Uma linha só do ativo e, por
// baixo, o IBOV rebaseado no mesmo ponto de partida (o que se lê é a distância
// entre os dois). Sai inteiro do servidor: o caminho, as marcas de preço e o
// ponto de hoje estão no HTML, numa caixa de altura fixa, então a hidratação
// não mexe em nada. A leitura é do cliente e flutua por cima, sem empurrar:
//  - mouse: passar mostra a mira (linha + ponto) e a dica com a data, o preço,
//    a variação desde o início do período e o IBOV no mesmo dia; arrastar com
//    o botão apertado MEDE entre dois pontos (o intervalo acende e a dica diz
//    a variação em R$ e em %, como no app Ações da Apple). A medida fica na
//    tela depois de soltar; um clique, Esc ou sair do gráfico a limpa;
//  - toque: um dedo faz a mira; dois dedos, ou segurar e arrastar, medem.
//    touch-action: pan-y deixa a rolagem vertical com a página: quando o
//    navegador toma o gesto, chega pointercancel e a leitura some (a mesma
//    regra do leque da /carteira, CarteiraLequeCaminhos);
//  - teclado: com o gráfico em foco, as setas movem a mira (Shift, de 10 em
//    10; Home e End vão às pontas), Enter marca o início de uma medida e Esc
//    limpa.
//   tom 'claro'  linha azul sobre branco ou creme
//   tom 'escuro' linha azul-clara sobre navy
//   tom 'luz'    a linha de luz da noite (o rodapé, o /login): o traço acende
//                até o ponto de hoje, com halo
// De borda a borda (o topo do /asset, TopoBolsa): a caixa vai até a beira da
// tela, mas o desenho mora numa área por dentro (.agr__plot), recuada por
// --agr-esq e --agr-dir. Os fios das marcas continuam de ponta a ponta; o ponto
// de hoje, o halo, o rótulo e os rótulos das marcas (recuados por
// --agr-rotulo-esq) cabem inteiros, com respiro. A mira lê pela área de
// dentro: o mouse ou o dedo na faixa da beira cai na ponta (o primeiro ou o
// último dia), então medir até as pontas continua fácil.
// viewBox literal: o :viewBox vira prop do DOM e o Vue reclama (NuFooterLinha).
import type { SeriesPoint } from '~/types/acao'
import type { LeituraDoGrafico } from '~/utils/ativoDirecoes'

const props = withDefaults(defineProps<{
  ativo: SeriesPoint[]
  ibov?: SeriesPoint[]
  ticker: string
  /** 'R$ 50,60', o rótulo do ponto de hoje */
  atual: string
  tom?: 'claro' | 'escuro' | 'luz'
  /** o período troca no cliente: a linha velha esmaece até a nova chegar */
  carregando?: boolean
  /** sem as marcas de preço */
  semMarcas?: boolean
  /** 'PETR4 em 12 meses', para o leitor de tela */
  rotulo?: string
}>(), { ibov: () => [], tom: 'claro', carregando: false, semMarcas: false, rotulo: '' })

const W = 1000
const H = 300
const c = computed(() => caminhosDoGrafico(props.ativo, props.ibov, W, H))
const marcas = computed(() => (props.semMarcas ? [] : marcasDePreco(c.value.lo, c.value.hi).map((v) => ({ v, top: (c.value.y(v) / H) * 100 }))))
const nf2 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const moeda = computed(() => (props.atual.trim().startsWith('US$') ? 'US$' : 'R$'))
const fmtMarca = (v: number) => `${moeda.value} ${Math.abs(v) >= 100 || Number.isInteger(v) ? nf0.format(v) : nf2.format(v)}`
const fmtPreco = (v: number) => `${moeda.value} ${nf2.format(v)}`
const fmtDelta = (v: number) => `${v > 0 ? '+' : v < 0 ? '-' : ''}${moeda.value} ${nf2.format(Math.abs(v))}`
const fimPct = computed(() => (c.value.fim ? { x: (c.value.fim.x / W) * 100, y: (c.value.fim.y / H) * 100 } : null))
const uid = useId()

/* ——— a geometria da leitura (a mesma conta do caminho: x pela data) ——— */
const xs = computed(() => {
  const n = props.ativo.length
  const t0 = Date.parse(props.ativo[0]?.t ?? '')
  const t1 = Date.parse(props.ativo[n - 1]?.t ?? '')
  return props.ativo.map((p, i) => {
    const ms = Date.parse(p.t)
    return Number.isFinite(ms) && t1 > t0 ? (ms - t0) / (t1 - t0) : i / Math.max(1, n - 1)
  })
})
const ultimo = computed(() => Math.max(0, props.ativo.length - 1))
function indiceDoX(f: number): number {
  const l = xs.value
  if (!l.length) return 0
  let a = 0
  let b = l.length - 1
  while (b - a > 1) {
    const m = (a + b) >> 1
    if (l[m]! < f) a = m
    else b = m
  }
  return f - l[a]! < l[b]! - f ? a : b
}
/** o IBOV no dia (ou no último pregão antes dele): as séries não batem dia a dia */
function ibovEm(t: string): number | null {
  const s = props.ibov
  if (!s.length) return null
  let r: number | null = null
  for (const p of s) {
    if (p.t <= t) r = p.v
    else break
  }
  return r ?? s[0]!.v
}
/**
 * A dica presa à mira sem sair da caixa: no meio, centrada; perto das pontas,
 * ancorada pela borda (a dica cresce para dentro), então ela cabe inteira em
 * qualquer largura, até no 375, sem depender de quanto o texto mede.
 */
function ancora(x: number): Record<string, string> {
  if (x < 25) return { left: `${x}%`, '--agr-dica-x': '-8px' }
  if (x > 75) return { left: `${x}%`, '--agr-dica-x': 'calc(-100% + 8px)' }
  return { left: `${x}%`, '--agr-dica-x': '-50%' }
}
const pct = (a: number, b: number) => (a ? ((b - a) / a) * 100 : 0)
const ponto = (i: number) => {
  const p = props.ativo[i]
  return p ? { x: (xs.value[i] ?? 0) * 100, y: (c.value.y(p.v) / H) * 100, p } : null
}

/* ——— o estado: a mira e a medida ——— */
const cursor = ref<number | null>(null)
const medida = ref<{ a: number; b: number } | null>(null)
const caixa = ref<HTMLElement | null>(null)
/** a área do desenho, por dentro do recuo: é por ela que o x vira dia */
const plot = ref<HTMLElement | null>(null)

const leitura = computed(() => {
  const i = cursor.value
  if (i == null || medida.value) return null
  const q = ponto(i)
  const a0 = props.ativo[0]
  if (!q || !a0) return null
  const v = pct(a0.v, q.p.v)
  const ib0 = ibovEm(a0.t)
  const ib = ibovEm(q.p.t)
  return {
    ...q,
    data: dataDoPonto(q.p.t), preco: fmtPreco(q.p.v), var: pctAtivo(v), dir: v < 0 ? 'down' : 'up',
    ibov: ib0 && ib != null ? pctAtivo(pct(ib0, ib)) : null,
  }
})
const medicao = computed(() => {
  const m = medida.value
  if (!m || m.a === m.b) return null
  const ini = ponto(Math.min(m.a, m.b))
  const fim = ponto(Math.max(m.a, m.b))
  if (!ini || !fim) return null
  const d = fim.p.v - ini.p.v
  const v = pct(ini.p.v, fim.p.v)
  const ib0 = ibovEm(ini.p.t)
  const ib1 = ibovEm(fim.p.t)
  return {
    ini, fim,
    de: dataDoPonto(ini.p.t), ate: dataDoPonto(fim.p.t),
    delta: fmtDelta(d), var: pctAtivo(v), dir: v < 0 ? 'down' : 'up',
    ibov: ib0 && ib1 != null ? pctAtivo(pct(ib0, ib1)) : null,
    centro: (ini.x + fim.x) / 2,
  }
})
/**
 * A leitura sobe para quem quer mostrá-la fora do gráfico (o preço grande do
 * topo acompanha a mira, como no app Ações): o dia sob a mira, ou o fim da
 * medida com a variação do intervalo; null quando não há leitura.
 */
const emit = defineEmits<{ leitura: [LeituraDoGrafico | null] }>()
watch([leitura, medicao], ([l, m]) => {
  if (m) emit('leitura', { preco: fmtPreco(m.fim.p.v), data: m.ate, var: m.var, dir: m.dir as 'up' | 'down', delta: m.delta, de: m.de, medida: true })
  else if (l) emit('leitura', { preco: l.preco, data: l.data, var: l.var, dir: l.dir as 'up' | 'down', medida: false })
  else emit('leitura', null)
})

/** o que o leitor de tela ouve (a mesma leitura da dica) */
const falado = computed(() => {
  if (medicao.value) {
    const m = medicao.value
    return `De ${m.de} a ${m.ate}: ${m.delta}, ${m.var}${m.ibov ? `; IBOV ${m.ibov}` : ''}.`
  }
  if (leitura.value) {
    const l = leitura.value
    return `${l.data}: ${l.preco}, ${l.var} desde o início do período${l.ibov ? `; IBOV ${l.ibov}` : ''}.`
  }
  return ''
})

function limpar() {
  cursor.value = null
  medida.value = null
}
// troca de período: a leitura antiga apontaria para outro dia
watch(() => props.ativo, limpar)

/* ——— mouse e toque ——— */
function indiceDoEvento(e: PointerEvent | { clientX: number }): number {
  const el = plot.value ?? caixa.value
  if (!el) return 0
  const r = el.getBoundingClientRect()
  return indiceDoX(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)))
}
const dedos = new Map<number, number>() // pointerId → clientX
let arrastando = false
let longo: ReturnType<typeof setTimeout> | null = null
let longoArmado = false
let inicioToque: { x: number; y: number } | null = null
function pararLongo() {
  if (longo) clearTimeout(longo)
  longo = null
}

function aoApertar(e: PointerEvent) {
  if (props.ativo.length < 2) return
  const i = indiceDoEvento(e)
  if (e.pointerType === 'touch') {
    dedos.set(e.pointerId, e.clientX)
    if (dedos.size === 2) {
      // dois dedos: a medida vai de um ao outro
      pararLongo()
      const [x1, x2] = [...dedos.values()]
      medida.value = { a: indiceDoEvento({ clientX: x1! }), b: indiceDoEvento({ clientX: x2! }) }
      return
    }
    medida.value = null
    cursor.value = i
    inicioToque = { x: e.clientX, y: e.clientY }
    longoArmado = false
    pararLongo()
    // segurar parado arma a medida: o próximo arrasto mede a partir daqui
    longo = setTimeout(() => {
      longoArmado = true
      medida.value = { a: cursor.value ?? i, b: cursor.value ?? i }
    }, 420)
    return
  }
  if (e.button !== 0) return
  e.preventDefault()
  caixa.value?.setPointerCapture?.(e.pointerId)
  arrastando = true
  medida.value = { a: i, b: i }
  cursor.value = i
}
function aoMover(e: PointerEvent) {
  if (props.ativo.length < 2) return
  const i = indiceDoEvento(e)
  if (e.pointerType === 'touch') {
    if (!dedos.has(e.pointerId)) return
    dedos.set(e.pointerId, e.clientX)
    if (inicioToque && Math.hypot(e.clientX - inicioToque.x, e.clientY - inicioToque.y) > 8 && !longoArmado) pararLongo()
    if (dedos.size === 2) {
      const [x1, x2] = [...dedos.values()]
      medida.value = { a: indiceDoEvento({ clientX: x1! }), b: indiceDoEvento({ clientX: x2! }) }
    } else if (longoArmado && medida.value) {
      medida.value = { a: medida.value.a, b: i }
    } else {
      cursor.value = i
    }
    return
  }
  cursor.value = i
  if (arrastando && medida.value) medida.value = { a: medida.value.a, b: i }
}
function aoSoltar(e: PointerEvent) {
  if (e.pointerType === 'touch') {
    dedos.delete(e.pointerId)
    pararLongo()
    longoArmado = false
    // no toque a leitura fica depois de soltar; sai com um toque fora
    return
  }
  arrastando = false
  // um clique sem arrasto não mede: limpa a medida anterior
  if (medida.value && medida.value.a === medida.value.b) medida.value = null
}
function aoCancelar(e: PointerEvent) {
  // a página tomou o gesto (rolagem vertical): nada fica preso
  dedos.delete(e.pointerId)
  pararLongo()
  longoArmado = false
  arrastando = false
  limpar()
}
function aoSair(e: PointerEvent) {
  if (e.pointerType === 'touch' || arrastando) return
  if (!caixa.value?.matches(':focus-visible')) limpar()
}
function toqueFora(e: PointerEvent) {
  if ((cursor.value != null || medida.value) && caixa.value && !caixa.value.contains(e.target as Node)) limpar()
}
onMounted(() => document.addEventListener('pointerdown', toqueFora, { passive: true }))
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', toqueFora)
  pararLongo()
})

/* ——— teclado ——— */
function aoFocar() {
  if (cursor.value == null && caixa.value?.matches(':focus-visible')) cursor.value = ultimo.value
}
function aoTeclar(e: KeyboardEvent) {
  if (props.ativo.length < 2) return
  const P = ultimo.value
  if (e.key === 'Escape') { limpar(); return }
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    const i = cursor.value ?? P
    medida.value = medida.value ? null : { a: i, b: i }
    cursor.value = i
    return
  }
  let t = cursor.value ?? P
  const passo = e.shiftKey ? 10 : 1
  switch (e.key) {
    case 'ArrowRight': case 'ArrowUp': t += passo; break
    case 'ArrowLeft': case 'ArrowDown': t -= passo; break
    case 'Home': t = 0; break
    case 'End': t = P; break
    default: return
  }
  e.preventDefault()
  t = Math.min(Math.max(t, 0), P)
  cursor.value = t
  if (medida.value) medida.value = { a: medida.value.a, b: t }
}
</script>

<template>
  <div
    ref="caixa" class="agr" :class="[`agr--${tom}`, { 'agr--carregando': carregando, 'agr--lendo': leitura || medicao }]"
    tabindex="0" role="group"
    :aria-label="`${rotulo || `Gráfico de ${ticker}`}. Setas movem a mira; Enter marca o início de uma medida.`"
    @pointerdown="aoApertar" @pointermove="aoMover" @pointerup="aoSoltar" @pointercancel="aoCancelar" @pointerleave="aoSair"
    @focus="aoFocar" @blur="limpar" @keydown="aoTeclar"
  >
    <span v-for="m in marcas" :key="m.v" class="agr__marca" :style="{ top: `${m.top}%` }" aria-hidden="true"><span class="agr__marca-t">{{ fmtMarca(m.v) }}</span></span>
    <div ref="plot" class="agr__plot">
    <svg class="agr__svg" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient :id="`${uid}-area`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" class="agr__stop-a" />
          <stop offset="1" class="agr__stop-b" />
        </linearGradient>
        <linearGradient :id="`${uid}-luz`" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" class="agr__luz-a" />
          <stop offset=".7" class="agr__luz-b" />
          <stop offset="1" class="agr__luz-c" />
        </linearGradient>
      </defs>
      <path v-if="tom !== 'luz'" :d="c.area" :fill="`url(#${uid}-area)`" class="agr__area" />
      <path v-if="c.ibov" :d="c.ibov" class="agr__ibov" />
      <path v-if="tom === 'luz'" :d="c.linha" class="agr__halo" />
      <path :d="c.linha" class="agr__linha" :stroke="tom === 'luz' ? `url(#${uid}-luz)` : undefined" />
    </svg>
    <template v-if="fimPct">
      <span class="agr__fim" :style="{ left: `${fimPct.x}%`, top: `${fimPct.y}%` }" aria-hidden="true" />
      <span class="agr__hoje" :class="{ 'agr__hoje--baixo': fimPct.y < 22 }" :style="{ top: `${fimPct.y}%` }">
        <span class="agr__hoje-r">{{ ticker }} hoje</span>
        <span class="agr__hoje-v">{{ atual }}</span>
      </span>
    </template>

    <!-- a medida: o intervalo aceso, as duas pontas e o quanto andou -->
    <template v-if="medicao">
      <span class="agr__faixa" :class="`agr__faixa--${medicao.dir}`" :style="{ left: `${medicao.ini.x}%`, width: `${Math.max(0.3, medicao.fim.x - medicao.ini.x)}%` }" aria-hidden="true" />
      <span class="agr__mira agr__mira--medida" :style="{ left: `${medicao.ini.x}%` }" aria-hidden="true" />
      <span class="agr__mira agr__mira--medida" :style="{ left: `${medicao.fim.x}%` }" aria-hidden="true" />
      <span class="agr__ponto" :style="{ left: `${medicao.ini.x}%`, top: `${medicao.ini.y}%` }" aria-hidden="true" />
      <span class="agr__ponto" :style="{ left: `${medicao.fim.x}%`, top: `${medicao.fim.y}%` }" aria-hidden="true" />
      <span class="agr__dica agr__dica--medida" :style="ancora(medicao.centro)" aria-hidden="true">
        <span class="agr__dica-d">{{ medicao.de }} → {{ medicao.ate }}</span>
        <span class="agr__dica-l">
          <span class="agr__dica-p" :class="`agr__dica-v--${medicao.dir}`">{{ medicao.delta }}</span>
          <span class="agr__dica-v" :class="`agr__dica-v--${medicao.dir}`">{{ medicao.var }}</span>
        </span>
        <span v-if="medicao.ibov" class="agr__dica-i">IBOV {{ medicao.ibov }}</span>
      </span>
    </template>

    <!-- a mira: um dia -->
    <template v-else-if="leitura">
      <span class="agr__mira" :style="{ left: `${leitura.x}%` }" aria-hidden="true" />
      <span class="agr__ponto" :style="{ left: `${leitura.x}%`, top: `${leitura.y}%` }" aria-hidden="true" />
      <span class="agr__dica" :style="ancora(leitura.x)" aria-hidden="true">
        <span class="agr__dica-d">{{ leitura.data }}</span>
        <span class="agr__dica-l">
          <span class="agr__dica-p">{{ leitura.preco }}</span>
          <span class="agr__dica-v" :class="`agr__dica-v--${leitura.dir}`">{{ leitura.var }}</span>
        </span>
        <span v-if="leitura.ibov" class="agr__dica-i">IBOV {{ leitura.ibov }}</span>
      </span>
    </template>
    </div>
    <span class="agr__sr" aria-live="polite">{{ falado }}</span>
  </div>
</template>

<style scoped>
.agr {
  position: relative; width: 100%; height: 100%; cursor: crosshair; outline: none; border-radius: 6px;
  /* a rolagem vertical é da página; o arrasto de lado é do gráfico */
  touch-action: pan-y; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent;
  transition: opacity .25s ease;
}
.agr:focus-visible { box-shadow: 0 0 0 2px var(--nu-blue-soft); }
.agr--carregando { opacity: .45; }
.agr__plot { position: absolute; top: 0; bottom: 0; left: var(--agr-esq, 0px); right: var(--agr-dir, 0px); pointer-events: none; }
.agr__svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.agr__linha { fill: none; stroke-width: 2.2; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.agr__ibov { fill: none; stroke-width: 1.3; stroke-dasharray: 3 4; vector-effect: non-scaling-stroke; }
.agr__halo { fill: none; stroke-width: 9; stroke-linejoin: round; vector-effect: non-scaling-stroke; opacity: .22; filter: blur(5px); }

.agr--claro .agr__linha { stroke: var(--nu-blue); }
.agr--claro .agr__ibov { stroke: var(--nu-sand); }
.agr--claro .agr__stop-a { stop-color: var(--nu-blue); stop-opacity: .12; }
.agr--claro .agr__stop-b { stop-color: var(--nu-blue); stop-opacity: 0; }
.agr--escuro .agr__linha { stroke: var(--nu-blue-soft); }
.agr--escuro .agr__ibov { stroke: var(--nu-cream-text-35); }
.agr--escuro .agr__stop-a { stop-color: var(--nu-blue); stop-opacity: .34; }
.agr--escuro .agr__stop-b { stop-color: var(--nu-blue); stop-opacity: 0; }
.agr--luz .agr__linha { stroke-width: 2; }
.agr--luz .agr__luz-a { stop-color: var(--nu-blue); stop-opacity: .35; }
.agr--luz .agr__luz-b { stop-color: var(--nu-blue-soft); stop-opacity: .9; }
.agr--luz .agr__luz-c { stop-color: var(--nu-white); stop-opacity: 1; }
.agr--luz .agr__halo { stroke: var(--nu-blue-soft); }
.agr--luz .agr__ibov { stroke: var(--nu-white-30); }

.agr__marca { position: absolute; left: 0; right: 0; height: 0; border-top: 1px solid; pointer-events: none; }
/* o rótulo fica em cima do fio, à esquerda, recuado da beira */
.agr__marca-t {
  position: absolute; left: var(--agr-rotulo-esq, 0px); bottom: 3px; white-space: nowrap;
  font-size: var(--nu-fs-xs); font-weight: 600; font-variant-numeric: tabular-nums;
}
.agr--claro .agr__marca { border-color: var(--nu-ink-04); }
.agr--claro .agr__marca-t { color: var(--nu-gray); }
.agr--escuro .agr__marca, .agr--luz .agr__marca { border-color: var(--nu-cream-text-08); }
.agr--escuro .agr__marca-t, .agr--luz .agr__marca-t { color: var(--nu-cream-text-50); }

.agr__fim {
  position: absolute; width: 11px; height: 11px; border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none;
  background: var(--nu-blue); box-shadow: 0 0 0 5px var(--nu-blue-tint);
}
.agr--escuro .agr__fim { background: var(--nu-blue-soft); box-shadow: 0 0 0 6px var(--nu-blue-soft-18); }
.agr--luz .agr__fim { background: var(--nu-white); box-shadow: 0 0 0 6px var(--nu-blue-soft-18), 0 0 22px 4px var(--nu-blue-soft); }

/* o rótulo de hoje fica DENTRO da caixa, encostado à direita: nunca vaza. Sem
   recuo (o ponto na beira), 18px para dentro; com recuo, a borda direita do
   rótulo alinha com o ponto */
.agr__hoje {
  position: absolute; right: max(0px, calc(18px - var(--agr-dir, 0px))); transform: translateY(calc(-100% - 14px)); pointer-events: none;
  display: flex; flex-direction: column; align-items: flex-end; gap: 2px; padding: 7px 11px; border-radius: var(--nu-r-chip);
  font-variant-numeric: tabular-nums; white-space: nowrap; transition: opacity .2s ease;
}
.agr--lendo .agr__hoje { opacity: 0; }
.agr__hoje--baixo { transform: translateY(14px); }
.agr__hoje-r { font-size: var(--nu-fs-xs); font-weight: 600; }
.agr__hoje-v { font-size: var(--nu-fs-sm); font-weight: 700; }
.agr--claro .agr__hoje { background: var(--nu-white); color: var(--nu-ink); box-shadow: 0 0 0 1px var(--nu-navy-06), var(--nu-shadow-card); }
.agr--claro .agr__hoje-r { color: var(--nu-gray); }
.agr--escuro .agr__hoje, .agr--luz .agr__hoje { background: var(--nu-navy-2); color: var(--nu-cream-text); box-shadow: 0 0 0 1px var(--nu-cream-text-12); }
.agr--escuro .agr__hoje-r, .agr--luz .agr__hoje-r { color: var(--nu-cream-text-55); }

/* a mira e a medida */
.agr__mira { position: absolute; top: 0; bottom: 0; width: 1px; transform: translateX(-.5px); pointer-events: none; background: var(--nu-ink-14); }
.agr--escuro .agr__mira, .agr--luz .agr__mira { background: var(--nu-cream-text-45); }
.agr__faixa { position: absolute; top: 0; bottom: 0; pointer-events: none; border-radius: 2px; }
.agr__faixa--up { background: color-mix(in srgb, var(--nu-green-soft) 14%, transparent); }
.agr__faixa--down { background: color-mix(in srgb, var(--nu-red-soft) 14%, transparent); }
.agr--claro .agr__faixa--up { background: var(--nu-green-tint); }
.agr--claro .agr__faixa--down { background: var(--nu-red-tint); }
.agr__ponto {
  position: absolute; width: 11px; height: 11px; border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none;
  background: var(--nu-white); box-shadow: 0 0 0 3px var(--nu-blue), 0 0 0 7px var(--nu-blue-28);
}
.agr__dica {
  position: absolute; top: 0; transform: translate(var(--agr-dica-x, -50%), calc(-100% - 10px)); pointer-events: none; z-index: 2;
  display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 12px; border-radius: var(--nu-r-chip); white-space: nowrap;
  background: var(--nu-navy-2); color: var(--nu-cream-text); font-variant-numeric: tabular-nums;
  box-shadow: 0 0 0 1px var(--nu-cream-text-12), var(--nu-shadow-chart-tip);
}
.agr--claro .agr__dica { background: var(--nu-navy); }
.agr__dica-d { color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 600; }
.agr__dica-l { display: flex; align-items: baseline; gap: 8px; }
.agr__dica-p { font-size: var(--nu-fs-md); font-weight: 700; }
.agr__dica-v { font-size: var(--nu-fs-sm); font-weight: 700; }
.agr__dica-v--up { color: var(--nu-green-soft); }
.agr__dica-v--down { color: var(--nu-red-soft); }
.agr__dica-i { color: var(--nu-cream-text-60); font-size: var(--nu-fs-xs); font-weight: 600; }
.agr__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { .agr, .agr__hoje { transition: none; } }
</style>

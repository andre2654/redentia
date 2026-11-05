<script setup lang="ts">
// Variação 1 da "Na cadeia" (CarteiraCadeia): a rede. As suas empresas com
// ligação ficam no anel de dentro, com a logo do tamanho do peso na carteira;
// as de fora, em volta, apagadas, perto das suas. Cada seta vai de quem vende
// para quem compra; a ligação entre duas suas é a azul, mais grossa, com o que
// circula escrito em cima. Passar o mouse numa logo ou numa seta acende as
// ligações dela; clicar abre as provas.
// Entra desenhando as setas uma vez (a luz percorre a azul); sem JS ou com
// Reduzir Movimento, já está desenhada.
import type { CadeiaDaCarteira, EmpresaDaCarteiraCadeia, LigacaoDaCadeia } from '~/utils/cadeiaDaCarteira'

const props = defineProps<{
  vm: CadeiaDaCarteira
  ligadas: EmpresaDaCarteiraCadeia[]
  tickerDe: Record<string, string>
  foco: string | null
  modo: 'parado' | 'esperando' | 'revelando'
}>()
const emit = defineEmits<{ foco: [id: string | null]; abrir: [id: string] }>()

const caixa = ref<HTMLElement | null>(null)
const W = ref(1000)
let ro: ResizeObserver | null = null
onMounted(() => {
  const el = caixa.value
  if (!el) return
  W.value = el.clientWidth || 1000
  ro = new ResizeObserver(([e]) => { if (e) W.value = Math.round(e.contentRect.width) })
  ro.observe(el)
})
onBeforeUnmount(() => ro?.disconnect())

const celular = computed(() => W.value < 600)
const H = computed(() => Math.round(W.value * (celular.value ? 1.2 : 0.44)))
/** o anel das suas (raios em px) */
const anel = computed(() => ({ rx: W.value * (celular.value ? 0.25 : 0.2), ry: H.value * (celular.value ? 0.25 : 0.27) }))

type No = { raiz: string; ticker: string; nome: string; minha: boolean; x: number; y: number; r: number; ang: number }
type Aresta = { l: LigacaoDaCadeia; d: string; interna: boolean; meio: { x: number; y: number }; peso: number; i: number }

const minhas = computed(() => new Set(props.ligadas.map((e) => e.raiz)))
const interna = (l: LigacaoDaCadeia) => minhas.value.has(l.vende) && minhas.value.has(l.compra)
const ligacoes = computed(() => [...props.vm.internas, ...props.vm.externas.flatMap((x) => x.ligacoes)])

const rad = (g: number) => (g * Math.PI) / 180

const nos = computed<No[]>(() => {
  const w = W.value
  const h = H.value
  const cx = w / 2
  const cy = h / 2
  const cel = celular.value

  // a ordem no anel: as ligadas entre si juntas (e centradas no alto), depois as outras pelo peso
  const adj = new Map<string, string[]>()
  for (const l of props.vm.internas) {
    adj.set(l.vende, [...(adj.get(l.vende) ?? []), l.compra])
    adj.set(l.compra, [...(adj.get(l.compra) ?? []), l.vende])
  }
  const ordem: EmpresaDaCarteiraCadeia[] = []
  const visto = new Set<string>()
  const porRaiz = new Map(props.ligadas.map((e) => [e.raiz, e]))
  for (const e of props.ligadas) {
    if (!adj.has(e.raiz) || visto.has(e.raiz)) continue
    const fila = [e.raiz]
    visto.add(e.raiz)
    while (fila.length) {
      const r = fila.shift()!
      ordem.push(porRaiz.get(r)!)
      for (const v of adj.get(r) ?? []) if (!visto.has(v) && porRaiz.has(v)) { visto.add(v); fila.push(v) }
    }
  }
  const nInt = ordem.length
  for (const e of props.ligadas) if (!visto.has(e.raiz)) ordem.push(e)
  const n = ordem.length

  const maxPeso = Math.max(...ordem.map((e) => e.peso), 0.0001)
  const [rMin, rMax] = cel ? [16, 23] : [25, 38]
  const { rx, ry } = anel.value
  const out: No[] = ordem.map((e, i) => {
    const ang = n === 1 ? -90 : nInt > 1 ? -90 + ((i - (nInt - 1) / 2) * 360) / n : -90 + (i * 360) / n
    const um = n === 1
    return {
      raiz: e.raiz, ticker: e.ticker, nome: e.nome, minha: true, ang,
      x: um ? cx : cx + rx * Math.cos(rad(ang)), y: um ? cy : cy + ry * Math.sin(rad(ang)),
      r: rMin + (rMax - rMin) * Math.sqrt(e.peso / maxPeso),
    }
  })
  const angDe = new Map(out.map((o) => [o.raiz, o.ang]))

  // as de fora: no ângulo médio das suas ligadas a ela, afastadas umas das outras
  const fora = props.vm.externas.map((x) => {
    const as = x.empresas.map((r) => angDe.get(r)).filter((a): a is number => a != null)
    const sx = as.reduce((s, a) => s + Math.cos(rad(a)), 0)
    const sy = as.reduce((s, a) => s + Math.sin(rad(a)), 0)
    let ang = as.length ? (Math.atan2(sy, sx) * 180) / Math.PI : -90
    if (n === 1) ang = -90
    return { x, ang }
  })
  if (n === 1) fora.forEach((f, i) => { f.ang = -90 + (i * 360) / Math.max(1, fora.length) })
  const gap = cel ? 40 : 30
  for (let it = 0; it < 40; it++) {
    fora.sort((a, b) => a.ang - b.ang)
    for (let i = 0; i < fora.length; i++) {
      const a = fora[i]!
      const b = fora[(i + 1) % fora.length]!
      if (a === b) continue
      let d = b.ang - a.ang
      if (d < 0) d += 360
      if (d < gap) { a.ang -= (gap - d) / 2; b.ang += (gap - d) / 2 }
    }
  }
  // as de fora: para fora do anel, na direção da sua, sem sair da caixa
  const d = cel ? 58 : 0.16 * w
  const rf = cel ? 14 : 19
  const folgaX = rf + (cel ? 26 : 34)
  const folgaY = rf + 24
  for (const f of fora) {
    const comp = f.x.compartilhada
    const k = comp ? 0.8 : 1
    // no celular a folga vai mais para cima e para baixo (de lado não há espaço)
    const x = cx + (rx + d * k * (cel ? 0.7 : 1)) * Math.cos(rad(f.ang))
    const y = cy + (ry + d * k * (cel ? 1.5 : 0.5)) * Math.sin(rad(f.ang))
    out.push({
      raiz: f.x.raiz, ticker: f.x.ticker, nome: f.x.nome, minha: false, ang: f.ang,
      x: Math.min(w - folgaX, Math.max(folgaX, x)), y: Math.min(h - folgaY, Math.max(rf + 4, y)), r: comp ? rf + 3 : rf,
    })
  }
  return out
})

const noDe = computed(() => new Map(nos.value.map((o) => [o.raiz, o])))

const arestas = computed<Aresta[]>(() => {
  const cx = W.value / 2
  const cy = H.value / 2
  const ids = new Set(ligacoes.value.map((l) => l.id))
  return ligacoes.value.flatMap((l, i) => {
    const a = noDe.value.get(l.vende)
    const b = noDe.value.get(l.compra)
    if (!a || !b) return []
    const int = interna(l)
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy) || 1
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    // as duas direções entre o mesmo par: cada uma de um lado
    const ida = ids.has(`${l.compra}>${l.vende}`)
    const px = -dy / len
    const py = dx / len
    let c1x = mx + px * len * (ida ? 0.2 : 0.06)
    let c1y = my + py * len * (ida ? 0.2 : 0.06)
    if (int && !ida) {
      // a interna se curva para dentro do anel
      c1x = mx + (cx - mx) * 0.32
      c1y = my + (cy - my) * 0.32
    }
    const enc = (o: No, folga: number) => {
      const vx = c1x - o.x
      const vy = c1y - o.y
      const vl = Math.hypot(vx, vy) || 1
      return { x: o.x + (vx / vl) * (o.r + folga), y: o.y + (vy / vl) * (o.r + folga) }
    }
    const s = enc(a, 4)
    const e = enc(b, 9)
    const meio = { x: 0.25 * s.x + 0.5 * c1x + 0.25 * e.x, y: 0.25 * s.y + 0.5 * c1y + 0.25 * e.y }
    const v = l.valor
    const peso = !v ? 0 : v.tipo === 'anual' ? 3 : v.tipo === 'contratado' ? 2 : 1
    return [{ l, d: `M${s.x.toFixed(1)} ${s.y.toFixed(1)} Q${c1x.toFixed(1)} ${c1y.toFixed(1)} ${e.x.toFixed(1)} ${e.y.toFixed(1)}`, interna: int, meio, peso, i }]
  })
})

/* ————— o que está aceso ————— */

const noMouse = ref<string | null>(null)
const focoL = computed(() => ligacoes.value.find((l) => l.id === props.foco) ?? null)
function acesa(a: Aresta): boolean {
  if (noMouse.value) return a.l.vende === noMouse.value || a.l.compra === noMouse.value
  return a.l.id === props.foco
}
function noAceso(o: No): boolean {
  if (noMouse.value) return o.raiz === noMouse.value || ligacoes.value.some((l) => (l.vende === noMouse.value && l.compra === o.raiz) || (l.compra === noMouse.value && l.vende === o.raiz))
  return !!focoL.value && (focoL.value.vende === o.raiz || focoL.value.compra === o.raiz)
}
const dentro = ref(false)
const algoAceso = computed(() => dentro.value && (!!noMouse.value || !!props.foco))

function entrarNo(o: No) {
  noMouse.value = o.raiz
  const l = ligacoes.value.filter((x) => x.vende === o.raiz || x.compra === o.raiz).sort((a, b) => Number(interna(b)) - Number(interna(a)))[0]
  if (l) emit('foco', l.id)
}
function sairNo() { noMouse.value = null }
const PONTAS = [
  { id: 'int', cor: '#2F6AFF' },
  { id: 'on', cor: '#0C1524' },
  { id: 'fora', cor: 'rgba(12, 21, 36, .4)' },
]
const curto = (s: string | null, n: number) => (!s ? '' : s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)
</script>

<template>
  <div
    ref="caixa" class="ccr" :class="[`ccr--${modo}`, { 'ccr--cel': celular, 'ccr--aceso': algoAceso }]"
    :style="{ height: `${H}px` }"
    @pointerenter="dentro = true" @pointerleave="dentro = false; noMouse = null"
    role="img" :aria-label="vm.frase"
  >
    <div class="ccr__luz" aria-hidden="true" />
    <svg class="ccr__svg" :viewBox="`0 0 ${W} ${H}`" :width="W" :height="H" aria-hidden="true">
      <!-- a ponta da seta em três tintas (context-stroke ainda não vale em todo navegador) -->
      <defs>
        <marker v-for="m in PONTAS" :id="`ccr-ponta-${m.id}`" :key="m.id" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
          <path d="M1 1.5 7.5 5 1 8.5" fill="none" :stroke="m.cor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </marker>
      </defs>
      <!-- o anel das suas, só uma linha de luz -->
      <ellipse
        v-if="ligadas.length > 1" class="ccr__anel"
        :cx="W / 2" :cy="H / 2" :rx="anel.rx" :ry="anel.ry"
      />
      <g v-for="a in arestas" :key="a.l.id" class="ccr__lig" :class="{ 'ccr__lig--int': a.interna, 'ccr__lig--on': acesa(a) }" :style="{ '--i': a.i }">
        <path class="ccr__aresta" :d="a.d" pathLength="1" :marker-end="`url(#ccr-ponta-${a.interna ? 'int' : acesa(a) ? 'on' : 'fora'})`" :style="{ '--w': a.interna ? 2.6 : 1.1 + a.peso * 0.35 }" />
        <path v-if="a.interna" class="ccr__pulso" :d="a.d" pathLength="1" />
        <path
          class="ccr__alvo" :d="a.d"
          @pointerenter="emit('foco', a.l.id)" @click="emit('abrir', a.l.id)"
        />
      </g>
    </svg>

    <!-- o que circula, escrito na seta azul (só no computador; no celular o cartão diz) -->
    <template v-if="!celular">
      <span
        v-for="a in arestas.filter((x) => x.interna || acesa(x))" :key="`r-${a.l.id}`"
        class="ccr__rotulo" :class="{ 'ccr__rotulo--int': a.interna, 'ccr__rotulo--on': acesa(a) }"
        :style="{ left: `${a.meio.x}px`, top: `${a.meio.y}px`, '--i': a.i }"
      >{{ curto(a.l.oQue, 30) || (a.l.valor ? a.l.valor.texto : 'ligação') }}</span>
    </template>

    <button
      v-for="(o, i) in nos" :key="o.raiz" type="button"
      class="ccr__no" :class="{ 'ccr__no--fora': !o.minha, 'ccr__no--on': noAceso(o), 'ccr__no--topo': !o.minha && o.y < H / 2 }"
      :style="{ left: `${o.x}px`, top: `${o.y}px`, '--r': `${o.r}px`, '--i': i }"
      :aria-label="`${o.nome} (${o.ticker})${o.minha ? ', na sua carteira' : ', fora da carteira'}`"
      @pointerenter="entrarNo(o)" @pointerleave="sairNo" @focus="entrarNo(o)" @blur="sairNo"
    >
      <span class="ccr__logo">
        <NuAssetLogo :ticker="o.ticker" :letter="o.ticker.charAt(0)" :tile-bg="o.minha ? 'var(--nu-tile-blue-bg)' : 'var(--nu-cream)'" :tile-fg="o.minha ? 'var(--nu-blue-deep)' : 'var(--nu-gray)'" :size="Math.round(o.r * 2)" :radius="Math.round(o.r * 2 * 0.27)" />
      </span>
      <span class="ccr__tk">{{ o.ticker }}</span>
    </button>

    <p class="ccr__legenda" aria-hidden="true">
      <span class="ccr__leg ccr__leg--int">entre as suas</span>
      <span class="ccr__leg">com empresas de fora</span>
      <span class="ccr__leg ccr__leg--seta">a seta vai de quem vende para quem compra</span>
    </p>
  </div>
</template>

<style scoped>
.ccr { position: relative; width: 100%; max-width: 1120px; margin: 0 auto 44px; --ease: cubic-bezier(.2, .8, .2, 1); --mola: cubic-bezier(.34, 1.56, .64, 1); }
/* atmosfera: uma luz azul bem baixa no centro do anel */
.ccr__luz {
  position: absolute; inset: 8% 18%; border-radius: 50%; pointer-events: none;
  background: radial-gradient(closest-side, color-mix(in srgb, #2F6AFF 9%, transparent), transparent 70%);
}
.ccr__svg { position: absolute; inset: 0; overflow: visible; }
.ccr__anel { fill: none; stroke: var(--nu-cream-2); stroke-width: 1; stroke-dasharray: 2 6; }

.ccr__aresta {
  fill: none; stroke: color-mix(in srgb, var(--nu-navy) 34%, transparent); stroke-width: var(--w); stroke-linecap: round;
  stroke-dasharray: 1; stroke-dashoffset: 0; transition: stroke .25s ease, opacity .25s ease;
}
.ccr__lig--int .ccr__aresta { stroke: #2F6AFF; }
.ccr--aceso .ccr__lig:not(.ccr__lig--on) .ccr__aresta { opacity: .28; }
.ccr__lig--on .ccr__aresta { stroke: var(--nu-navy); opacity: 1; }
.ccr__lig--int.ccr__lig--on .ccr__aresta { stroke: #2F6AFF; filter: drop-shadow(0 0 6px color-mix(in srgb, #2F6AFF 45%, transparent)); }
.ccr__pulso { fill: none; stroke: #fff; stroke-width: 2.2; stroke-linecap: round; stroke-dasharray: .07 1; stroke-dashoffset: 1.07; opacity: 0; }
.ccr__alvo { fill: none; stroke: transparent; stroke-width: 18; pointer-events: stroke; cursor: pointer; }

.ccr__no {
  position: absolute; transform: translate(-50%, -50%); padding: 0; border: 0; background: none; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 6px; font: inherit;
  transition: opacity .25s ease, filter .25s ease;
}
/* o rótulo fica embaixo sem empurrar a logo do centro */
.ccr__tk { position: absolute; top: calc(100% + 6px); left: 50%; transform: translateX(-50%); white-space: nowrap; color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: 800; letter-spacing: .01em; }
.ccr__no { width: calc(var(--r) * 2); height: calc(var(--r) * 2); }
/* a de fora na metade de cima tem o nome em cima: a seta chega por baixo */
.ccr__no--topo .ccr__tk { top: auto; bottom: calc(100% + 6px); }
.ccr__logo {
  display: block; border-radius: 27%; box-shadow: 0 0 0 1px var(--nu-navy-06), 0 14px 30px -14px rgba(12, 21, 36, .35);
  transition: transform .45s var(--mola), box-shadow .25s ease;
}
.ccr__no:hover .ccr__logo, .ccr__no--on .ccr__logo { transform: scale(1.08); box-shadow: 0 0 0 1px var(--nu-navy-06), 0 18px 40px -16px rgba(12, 21, 36, .45); }
.ccr__no:focus-visible { outline: none; }
.ccr__no:focus-visible .ccr__logo { box-shadow: 0 0 0 2px var(--nu-blue); }
.ccr__no--fora { opacity: .72; filter: saturate(.6); }
.ccr__no--fora .ccr__tk { color: var(--nu-gray); font-weight: 700; }
.ccr__no--fora.ccr__no--on, .ccr__no--fora:hover { opacity: 1; filter: none; }
.ccr--aceso .ccr__no:not(.ccr__no--on):not(:hover) { opacity: .42; }

.ccr__rotulo {
  position: absolute; transform: translate(-50%, -50%); white-space: nowrap; pointer-events: none;
  padding: 4px 10px; border-radius: var(--nu-r-pill); background: var(--nu-white);
  color: var(--nu-ink); font-size: var(--nu-fs-xs); font-weight: 700;
  box-shadow: 0 0 0 1px var(--nu-navy-06), 0 10px 24px -14px rgba(12, 21, 36, .4);
  transition: opacity .25s ease;
}
.ccr__rotulo--int { color: var(--nu-blue-text); }
.ccr--aceso .ccr__rotulo:not(.ccr__rotulo--on) { opacity: .35; }

.ccr__legenda { position: absolute; left: 0; right: 0; top: calc(100% + 6px); margin: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 18px; color: var(--nu-gray); font-size: var(--nu-fs-xs); font-weight: 600; pointer-events: none; }
.ccr__leg { display: inline-flex; align-items: center; gap: 7px; }
.ccr__leg::before { content: ''; width: 18px; height: 2px; border-radius: 2px; background: color-mix(in srgb, var(--nu-navy) 30%, transparent); }
.ccr__leg--int::before { height: 3px; background: #2F6AFF; }
.ccr__leg--seta::before { display: none; }
.ccr--cel { margin-bottom: 64px; }
.ccr--cel .ccr__leg--seta { flex-basis: 100%; justify-content: center; }

/* ——— a entrada: as logos sobem, as setas se desenham, a luz percorre a azul ——— */
.ccr--esperando .ccr__no, .ccr--esperando .ccr__rotulo { opacity: 0; }
.ccr--esperando .ccr__aresta { stroke-dashoffset: 1; }
.ccr--revelando .ccr__no { animation: ccr-no .7s var(--mola) both; animation-delay: calc(var(--i) * 70ms + 120ms); }
.ccr--revelando .ccr__aresta { animation: ccr-desenha .9s var(--ease) both; animation-delay: calc(var(--i) * 90ms + 420ms); }
.ccr--revelando .ccr__rotulo { animation: ccr-rotulo .5s var(--ease) both; animation-delay: calc(var(--i) * 90ms + 1100ms); }
.ccr--revelando .ccr__pulso { animation: ccr-pulso 1.6s cubic-bezier(.45, 0, .25, 1) 1.4s both; }
@keyframes ccr-no { from { opacity: 0; transform: translate(-50%, -50%) scale(.6); } }
@keyframes ccr-desenha { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes ccr-rotulo { from { opacity: 0; filter: blur(6px); } }
@keyframes ccr-pulso { 0% { opacity: 0; stroke-dashoffset: 1.07; } 15% { opacity: .95; } 85% { opacity: .95; } 100% { opacity: 0; stroke-dashoffset: 0; } }

@media (prefers-reduced-motion: reduce) {
  .ccr--revelando .ccr__no, .ccr--revelando .ccr__aresta, .ccr--revelando .ccr__rotulo, .ccr--revelando .ccr__pulso { animation: none; }
  .ccr__logo, .ccr__no { transition: none; }
}
</style>

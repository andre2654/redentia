<script setup lang="ts">
// Carteira própria: retorno acumulado desde a primeira rodada, num painel
// navy com a anatomia do NuPerformanceChart da tese ("A tese em números"):
// linha azul com brilho e área em degradê, Ibovespa tracejado em creme,
// Tesouro Selic pontilhado, pílula creme no fim da linha. Forma "ênfase": um
// modelo em destaque, os outros em creme apagado como contexto. Pílulas no
// topo escolhem o modelo.
// Movimento: ao entrar na tela as linhas se revelam da esquerda para a direita
// (clipPath que cresce); trocar de modelo faz a linha nova surgir; no hover
// (mouse ou toque: o toque simples já abre o cursor) um cursor vertical mostra
// data, modelo, Ibovespa e Tesouro Selic.
// Marcos: ponto fixo na linha em destaque. O do começo da arena (`marcos`) leva
// etiqueta ao lado do ponto. Os das rodadas mensais vêm em cada série (o número
// de alterações é de cada modelo): régua tracejada até o pé do gráfico, etiqueta
// só na rodada mais recente e as outras no cursor, para não amontoar.
// Tela cheia (dono, 16/10: "só o ícone, sem bordas, tudo chique e suave, com
// animações requintadas"): o ícone no canto superior direito leva o painel a
// ocupar a janela. A troca usa View Transition: a caixa cresce do lugar do
// painel até a tela e o conteúdo novo é revelado sem esticar o texto; sem a
// API (ou com movimento reduzido), um fade curto. Os quatro cantos do ícone
// giram e viram o "sair". Esc também sai. O lugar do painel guarda a altura
// para a página não pular por baixo.
// Em tela cheia (dono, 16/10: "deixe mostrando todas as linhas podendo ativar
// todos ou alguns") o destaque único dá lugar a todas as linhas, cada modelo com
// a sua cor; as pílulas viram interruptores, "Todos" liga ou desliga tudo, passar
// o mouse numa pílula realça a linha dela, e o cursor lista os ligados do maior
// para o menor retorno.
const props = defineProps<{
  labels: string[]
  ibov: number[]
  selic: number[]
  series: { id: string; name: string; values: number[]; marcos?: { i: number; label: string }[] }[]
  marcos?: { i: number; label: string }[]
  footnote?: string
}>()
const selected = defineModel<string>({ required: true })

const { el, revealClass } = useReveal(0.2)
const H = 320
const n = computed(() => props.labels.length)
const domain = computed(() => {
  const vals = [...props.ibov, ...props.selic, ...props.series.flatMap((s) => s.values)]
  let min = Math.min(...vals)
  let max = Math.max(...vals)
  // faixa mínima de 10 pontos: no começo da arena as diferenças são de décimos
  // (só o custo de montar a carteira) e não podem parecer um tombo no gráfico
  if (max - min < 10) { const mid = (max + min) / 2; min = mid - 5; max = mid + 5 }
  const span = max - min
  return { lo: min - span * 0.06, hi: max + span * 0.1 }
})
const Y = (v: number) => 14 + ((domain.value.hi - v) / (domain.value.hi - domain.value.lo)) * (H - 40)
const X = (i: number) => (i / Math.max(1, n.value - 1)) * 1000
const path = (arr: number[]) => arr.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('')
const sel = computed(() => props.series.find((s) => s.id === selected.value) ?? props.series[0])
const others = computed(() => props.series.filter((s) => s.id !== sel.value?.id))
const area = computed(() => (sel.value ? `${path(sel.value.values)}L1000,${H}L0,${H}Z` : ''))

const grid = computed(() => {
  const { lo, hi } = domain.value
  const step = [1, 2, 5, 10, 20, 25, 50].find((c) => (hi - lo) / c <= 4) ?? 50
  const out: { top: string; lbl: string }[] = []
  for (let m = Math.ceil(lo / step) * step; m < hi; m += step) {
    if (m <= lo) continue
    out.push({ top: `${((Y(m) / H) * 100).toFixed(2)}%`, lbl: `${m > 0 ? '+' : ''}${m}%` })
  }
  return out
})
const last = (arr: number[]) => arr[arr.length - 1] ?? 0
const endSel = computed(() => (sel.value ? last(sel.value.values) : 0))
const endIbov = computed(() => last(props.ibov))
const pills = computed(() => {
  const a = (Y(endSel.value) / H) * 100
  const b = (Y(endIbov.value) / H) * 100
  if (cheia.value) return { sel: a, ibov: b }
  const gap = 16
  if (Math.abs(a - b) >= gap) return { sel: a, ibov: b }
  const mid = (a + b) / 2
  return a < b ? { sel: mid - gap / 2, ibov: mid + gap / 2 } : { sel: mid + gap / 2, ibov: mid - gap / 2 }
})

const marks = computed(() => {
  const proprios = (sel.value?.marcos ?? []).filter((m) => m.i >= 0 && m.i < n.value)
  const todos = [
    ...(props.marcos ?? []).map((m) => ({ ...m, rodada: false, etiqueta: true })),
    ...proprios.map((m, k) => ({ ...m, rodada: true, etiqueta: !cheia.value && k === proprios.length - 1 })),
  ]
  return todos
    .filter((m) => m.i >= 0 && m.i < n.value)
    .map((m) => ({
      ...m,
      key: `${sel.value?.id}-${m.i}-${m.label}`,
      left: `${(X(m.i) / 10).toFixed(2)}%`,
      top: `${((Y(sel.value?.values[m.i] ?? 0) / H) * 100).toFixed(2)}%`,
      // perto da borda direita a etiqueta abre para a esquerda
      flip: m.i / Math.max(1, n.value - 1) > 0.6,
      // tela cheia: não há uma linha só para pôr o ponto da rodada; fica a régua
      ponto: !cheia.value || !m.rodada,
    }))
})

const cheia = ref(false)
const CORES = Array.from({ length: 10 }, (_, k) => `var(--nu-serie-${k + 1})`)
const cor = (id: string) => CORES[Math.max(0, props.series.findIndex((s) => s.id === id)) % CORES.length]!
const ativos = ref<string[]>([])
const realce = ref<string | null>(null)
const visiveis = computed(() => props.series.filter((s) => ativos.value.includes(s.id)))
const todosLigados = computed(() => ativos.value.length === props.series.length)
function alternarModelo(id: string) {
  ativos.value = ativos.value.includes(id) ? ativos.value.filter((x) => x !== id) : [...ativos.value, id]
}
function alternarTodos() {
  ativos.value = todosLigados.value ? [] : props.series.map((s) => s.id)
}
const vaga = ref<HTMLElement | null>(null)
const altura = ref(0)
// 'vt': View Transition em curso (o painel leva o nome da transição);
// 'fade': navegador sem a API, o painel só entra num fade curto
const modo = ref<'' | 'vt' | 'fade'>('')
type DocVT = Document & { startViewTransition?: (cb: () => Promise<void>) => { ready: Promise<void>; finished: Promise<void> } }
// mesma duração e curva do CSS da transição (::view-transition-group)
const VT_MS = 420
const VT_CURVA = 'cubic-bezier(.32, .72, 0, 1)'
async function alternar() {
  const abrir = !cheia.value
  const troca = async () => {
    if (abrir) {
      altura.value = vaga.value?.offsetHeight ?? 0
      ativos.value = props.series.map((s) => s.id)
    }
    hov.value = -1
    cheia.value = abrir
    await nextTick()
  }
  const doc = document as DocVT
  if (!doc.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    modo.value = 'fade'
    await troca()
    setTimeout(() => { modo.value = '' }, 400)
    return
  }
  modo.value = 'vt'
  await nextTick()
  try {
    const vt = doc.startViewTransition(troca)
    // o raio anima só na caixa da transição (22px do painel até 0 na tela, e
    // volta). Antes vinha de uma variável animada no html, que recalculava o
    // estilo da página inteira a cada quadro e travava a animação.
    vt.ready.then(() => {
      document.documentElement.animate(
        { borderRadius: abrir ? ['22px', '0px'] : ['0px', '22px'] },
        { duration: VT_MS, easing: VT_CURVA, pseudoElement: '::view-transition-group(blv-cheia)' },
      )
    }).catch(() => {})
    await vt.finished
  } finally {
    modo.value = ''
  }
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && cheia.value) alternar()
}
watch(cheia, (on) => {
  document.documentElement.classList.toggle('blv-travada', on)
  if (on) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.documentElement.classList.remove('blv-travada')
})

const hov = ref(-1)
function onMove(e: PointerEvent) {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  hov.value = Math.round(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * (n.value - 1))
}
const tip = computed(() => {
  const i = hov.value
  if (i < 0 || !sel.value) return null
  const frac = i / Math.max(1, n.value - 1)
  return {
    left: `${(frac * 100).toFixed(2)}%`,
    tipLeft: `${(Math.min(0.82, Math.max(0.18, frac)) * 100).toFixed(2)}%`,
    top: `${((Y(sel.value.values[i] ?? 0) / H) * 100).toFixed(2)}%`,
    date: props.labels[i],
    sel: fmtBench.signedPct(sel.value.values[i] ?? 0),
    ibov: fmtBench.signedPct(props.ibov[i] ?? 0),
    selic: fmtBench.signedPct(props.selic[i] ?? 0),
    marco: marks.value.find((m) => m.i === i && (!cheia.value || !m.rodada))?.label ?? '',
    linhas: cheia.value
      ? visiveis.value
        .map((s) => ({ id: s.id, name: s.name, v: s.values[i] ?? 0, cor: cor(s.id) }))
        .sort((a, b) => b.v - a.v)
        .map((l) => ({ ...l, txt: fmtBench.signedPct(l.v), top: `${((Y(l.v) / H) * 100).toFixed(2)}%` }))
      : [],
  }
})
</script>

<template>
  <div ref="vaga" class="blv-slot" :style="cheia ? { height: `${altura}px` } : undefined">
  <!-- em tela cheia o painel vai para o body: um ancestral com container query vira o
       bloco de contenção do position: fixed e o painel ficava com a altura da página -->
  <Teleport to="body" :disabled="!cheia">
  <div ref="el" class="blv" :class="[revealClass, { 'blv--cheia': cheia, 'blv--vt': modo === 'vt', 'blv--fade': modo === 'fade' }]">
    <div class="blv__top">
    <div v-if="cheia" class="blv__pick blv__pick--multi" role="group" aria-label="Modelos no gráfico">
      <button type="button" class="blv__pill" :class="{ 'blv__pill--on': todosLigados }" :aria-pressed="todosLigados" @click="alternarTodos">Todos</button>
      <button
        v-for="s in series" :key="s.id" type="button" class="blv__pill blv__pill--cor" :class="{ 'blv__pill--ativo': ativos.includes(s.id) }"
        :style="{ '--c': cor(s.id) }" :aria-pressed="ativos.includes(s.id)"
        @click="alternarModelo(s.id)" @pointerenter="realce = ativos.includes(s.id) ? s.id : null" @pointerleave="realce = null"
      ><i class="blv__pill-dot" />{{ s.name }}</button>
    </div>
    <div v-else class="blv__pick" role="radiogroup" aria-label="Modelo em destaque">
      <button
        v-for="s in series" :key="s.id" type="button" role="radio" class="blv__pill"
        :class="{ 'blv__pill--on': s.id === sel?.id }" :aria-checked="s.id === sel?.id" @click="selected = s.id"
      >{{ s.name }}</button>
    </div>
    <!-- estreito: as dez pílulas ocupavam quatro linhas; vira o mesmo seletor nativo do menu -->
    <label v-if="!cheia" class="blv__select">
      <span class="blv__select-lbl">Modelo em destaque</span>
      <span class="blv__select-val">{{ sel?.name }}</span>
      <svg class="blv__select-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      <select :value="sel?.id" aria-label="Modelo em destaque" @change="selected = ($event.target as HTMLSelectElement).value">
        <option v-for="s in series" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
    </label>
    <button
      type="button" class="blv__full" :aria-label="cheia ? 'Sair da tela cheia' : 'Ver o gráfico em tela cheia'" :aria-pressed="cheia"
      :title="cheia ? 'Sair da tela cheia' : 'Tela cheia'" @click="alternar"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path class="blv__full-c blv__full-c--1" d="M4 9V4h5" />
        <path class="blv__full-c blv__full-c--2" d="M15 4h5v5" />
        <path class="blv__full-c blv__full-c--3" d="M20 15v5h-5" />
        <path class="blv__full-c blv__full-c--4" d="M9 20H4v-5" />
      </svg>
    </button>
    </div>

    <div class="blv__legend" aria-hidden="true">
      <span v-if="!cheia"><i class="blv__sw blv__sw--sel" />{{ sel?.name }}</span>
      <span><i class="blv__sw blv__sw--ibov" />Ibovespa</span>
      <span><i class="blv__sw blv__sw--selic" />Tesouro Selic</span>
      <span v-if="!cheia"><i class="blv__sw blv__sw--other" />Outros modelos</span>
    </div>

    <div
      class="blv__plot" role="img"
      :aria-label="`Retorno acumulado: ${sel?.name} ${fmtBench.signedPct(endSel)}, Ibovespa ${fmtBench.signedPct(endIbov)}`"
      @pointerdown="onMove" @pointermove="onMove" @pointerleave="hov = -1"
    >
      <template v-for="g in grid" :key="g.lbl">
        <div class="blv__gridline" :style="{ top: g.top }" />
        <div class="blv__gridlbl" :style="{ top: g.top }">{{ g.lbl }}</div>
      </template>
      <svg viewBox="0 0 1000 320" preserveAspectRatio="none" class="blv__svg" aria-hidden="true">
        <defs>
          <linearGradient id="blv-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" class="blv__stop-a" />
            <stop offset="1" class="blv__stop-b" />
          </linearGradient>
          <clipPath id="blv-clip"><rect class="blv__clip" x="0" y="0" width="1000" height="320" /></clipPath>
        </defs>
        <g clip-path="url(#blv-clip)">
          <template v-if="!cheia">
            <path v-for="s in others" :key="s.id" :d="path(s.values)" fill="none" class="blv__other" stroke-width="1.4" vector-effect="non-scaling-stroke" stroke-linejoin="round" />
          </template>
          <path :d="path(selic)" fill="none" class="blv__selic" stroke-width="2" stroke-dasharray="1 6" vector-effect="non-scaling-stroke" stroke-linecap="round" />
          <path :d="path(ibov)" fill="none" class="blv__ibov" stroke-width="2" stroke-dasharray="7 7" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" />
          <template v-if="cheia">
            <path
              v-for="s in visiveis" :key="`m-${s.id}`" :d="path(s.values)" fill="none" class="blv__multi"
              :class="{ 'blv__multi--apaga': realce && realce !== s.id, 'blv__multi--realce': realce === s.id }" :style="{ stroke: cor(s.id), '--c': cor(s.id) }"
              stroke-width="2.4" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"
            />
          </template>
          <g v-else-if="sel" :key="sel.id" class="blv__selg">
            <path :d="area" fill="url(#blv-area)" />
            <path :d="path(sel.values)" fill="none" class="blv__glow" stroke-width="10" stroke-opacity=".28" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" />
            <path :d="path(sel.values)" fill="none" class="blv__sel" stroke-width="3.2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" />
          </g>
        </g>
      </svg>
      <div v-if="!cheia" class="blv__end blv__end--sel" :style="{ top: `${pills.sel}%` }">
        <span class="blv__end-lbl">{{ sel?.name }}</span>
        <span class="blv__end-val">{{ fmtBench.signedPct(endSel) }}</span>
      </div>
      <div class="blv__end blv__end--ibov" :style="{ top: `${pills.ibov}%` }">
        <span class="blv__end-lbl">Ibovespa</span>
        <span class="blv__end-val">{{ fmtBench.signedPct(endIbov) }}</span>
      </div>
      <template v-for="m in marks" :key="m.key">
        <div v-if="m.rodada" class="blv__rule" :style="{ left: m.left, top: m.top }" />
        <div class="blv__mark" :class="{ 'blv__mark--flip': m.flip }" :style="{ left: m.left, top: m.top }">
          <span v-if="m.ponto" class="blv__mark-dot" />
          <span v-if="m.etiqueta && !m.rodada" class="blv__mark-lbl">{{ m.label }}</span>
        </div>
        <span v-if="m.etiqueta && m.rodada" class="blv__mark-foot" :class="{ 'blv__mark-foot--flip': m.flip }" :style="{ left: m.left }">{{ m.label }}</span>
      </template>
      <template v-if="tip && cheia">
        <div class="blv__cross" :style="{ left: tip.left }" />
        <div v-for="l in tip.linhas" :key="l.id" class="blv__dot blv__dot--multi" :style="{ left: tip.left, top: l.top, '--c': l.cor }" />
        <div class="blv__tip blv__tip--multi" :style="{ left: `clamp(0px, calc(${tip.left} - 115px), calc(100% - 230px))` }">
          <div class="blv__tip-date">{{ tip.date }}</div>
          <div v-if="tip.marco" class="blv__tip-marco">{{ tip.marco }}</div>
          <ol class="blv__tip-list">
            <li v-for="l in tip.linhas" :key="l.id" :style="{ '--c': l.cor }"><i class="blv__tip-dot" /><span class="blv__tip-nome">{{ l.name }}</span><b>{{ l.txt }}</b></li>
          </ol>
          <div class="blv__tip-row">Ibovespa {{ tip.ibov }}</div>
          <div class="blv__tip-row">Tesouro Selic {{ tip.selic }}</div>
        </div>
      </template>
      <template v-else-if="tip">
        <div class="blv__cross" :style="{ left: tip.left }" />
        <div class="blv__dot" :style="{ left: tip.left, top: tip.top }" />
        <div class="blv__tip" :style="{ left: tip.tipLeft }">
          <div class="blv__tip-date">{{ tip.date }}</div>
          <div v-if="tip.marco" class="blv__tip-marco">{{ tip.marco }}</div>
          <div class="blv__tip-main">{{ tip.sel }}</div>
          <div class="blv__tip-row">Ibovespa {{ tip.ibov }}</div>
          <div class="blv__tip-row">Tesouro Selic {{ tip.selic }}</div>
        </div>
      </template>
    </div>
    <div class="blv__axis" aria-hidden="true"><span>{{ labels[0] }}</span><span>{{ labels[labels.length - 1] }}</span></div>
    <p v-if="footnote" class="blv__foot">{{ footnote }}</p>
  </div>
  </Teleport>
  </div>
</template>

<style scoped>
.blv { background: var(--nu-navy); border-radius: var(--nu-r-panel); padding: clamp(20px, 2.6vw, 32px); container-type: inline-size; }
.blv__top { display: flex; align-items: flex-start; gap: 16px; }
.blv__pick { flex: 1; min-width: 0; display: flex; gap: 6px; flex-wrap: wrap; }

/* ícone de tela cheia: só o traço, sem borda nem fundo */
.blv__full {
  flex-shrink: 0; display: grid; place-items: center; width: 36px; height: 36px; margin: -1px -8px 0 0; padding: 0;
  border: 0; background: none; border-radius: 50%; cursor: pointer; color: var(--nu-cream-text-55);
  transition: color .25s ease, transform .35s cubic-bezier(.22, 1, .36, 1);
}
.blv__full svg { width: 20px; height: 20px; overflow: visible; }
.blv__full:hover { color: var(--nu-cream-text); }
.blv__full:active { transform: scale(.9); }
.blv__full:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 0; }
/* cada canto gira no próprio centro: o "abrir" vira o "sair" */
.blv__full-c {
  transform-box: fill-box; transform-origin: center;
  transition: transform .55s cubic-bezier(.65, 0, .35, 1), translate .35s cubic-bezier(.22, 1, .36, 1);
}
.blv--cheia .blv__full-c { transform: rotate(180deg); }
/* hover: os cantos respiram para fora (abrir) ou para dentro (sair) */
.blv__full:hover .blv__full-c--1 { translate: -1.5px -1.5px; }
.blv__full:hover .blv__full-c--2 { translate: 1.5px -1.5px; }
.blv__full:hover .blv__full-c--3 { translate: 1.5px 1.5px; }
.blv__full:hover .blv__full-c--4 { translate: -1.5px 1.5px; }
.blv--cheia .blv__full:hover .blv__full-c--1 { translate: 1.5px 1.5px; }
.blv--cheia .blv__full:hover .blv__full-c--2 { translate: -1.5px 1.5px; }
.blv--cheia .blv__full:hover .blv__full-c--3 { translate: -1.5px -1.5px; }
.blv--cheia .blv__full:hover .blv__full-c--4 { translate: 1.5px -1.5px; }

/* tela cheia: o painel ocupa a janela e o gráfico cresce no espaço que sobra */
.blv--vt { view-transition-name: blv-cheia; }
/* durante a troca nada anima dentro do painel: a imagem nova da transição é ao
   vivo, e cada mudança (ícone girando, linhas surgindo, pílula do Ibovespa
   deslizando) redesenhava o painel inteiro a cada quadro */
.blv--vt *, .blv--vt *::before, .blv--vt *::after { transition: none !important; animation: none !important; }
.blv--cheia {
  position: fixed; inset: 0; z-index: 9990; border-radius: 0; display: flex; flex-direction: column;
  padding: max(24px, env(safe-area-inset-top)) clamp(20px, 4vw, 64px) max(24px, env(safe-area-inset-bottom));
  overflow: auto; overscroll-behavior: contain;
}
.blv--cheia .blv__plot { flex: 1; height: auto; min-height: 260px; }

/* pílulas da tela cheia: interruptores com a cor da linha */
.blv__pill--cor { display: inline-flex; align-items: center; gap: 8px; opacity: .5; }
.blv__pill--cor:hover { opacity: .85; }
.blv__pill-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  box-shadow: inset 0 0 0 1.5px var(--c); transition: background .25s ease, box-shadow .25s ease, transform .3s cubic-bezier(.22, 1, .36, 1);
}
.blv__pill--ativo, .blv__pill--ativo:hover {
  opacity: 1; color: var(--nu-cream-text);
  border-color: color-mix(in srgb, var(--c) 55%, transparent); background: color-mix(in srgb, var(--c) 12%, transparent);
}
.blv__pill--ativo .blv__pill-dot { background: var(--c); box-shadow: 0 0 10px var(--c); transform: scale(1.1); }
.blv__pill { transition: background .2s, color .2s, border-color .2s, transform .2s, opacity .2s; }

/* linhas da tela cheia: surgem suaves; a realçada engrossa, as outras recuam */
.blv__multi { animation: blv-pop .45s ease; transition: opacity .25s ease, stroke-width .25s ease; }
.blv__multi--apaga { opacity: .16; }
.blv__multi--realce { stroke-width: 3.6; filter: drop-shadow(0 0 6px var(--c, currentColor)); }
.blv__dot.blv__dot--multi { width: 10px; height: 10px; border: 2px solid var(--c); background: var(--nu-navy); box-shadow: 0 0 0 4px color-mix(in srgb, var(--c) 25%, transparent); }
.blv__tip--multi { transform: none; width: 230px; white-space: normal; }
.blv__tip-list { list-style: none; margin: 6px 0 8px; padding: 0; display: grid; gap: 4px; }
.blv__tip-list li { display: flex; align-items: center; gap: 8px; color: var(--nu-navy); font-size: var(--nu-fs-sm); font-weight: 500; }
.blv__tip-list b { margin-left: auto; font-weight: 800; font-variant-numeric: tabular-nums; }
.blv__tip-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--c); flex-shrink: 0; }
.blv__tip-nome { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.blv--cheia.blv--fade { animation: blv-cheia-in .35s cubic-bezier(.22, 1, .36, 1); }
@keyframes blv-cheia-in { from { opacity: 0; } }
.blv__pill {
  padding: 7px 13px; border-radius: var(--nu-r-pill); cursor: pointer; font-family: inherit;
  border: 1px solid var(--nu-cream-text-18); background: transparent;
  color: var(--nu-cream-text-78); font-size: var(--nu-fs-dense); font-weight: 700;
  transition: background .2s, color .2s, border-color .2s, transform .2s;
}
.blv__pill:hover { border-color: var(--nu-cream-text-45); color: var(--nu-cream-text); transform: translateY(-1px); }
.blv__pill--on, .blv__pill--on:hover { background: var(--nu-cream); border-color: var(--nu-cream); color: var(--nu-navy); }
.blv__pill:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }

.blv__legend {
  display: flex; gap: 6px 18px; flex-wrap: wrap; margin-top: 18px;
  color: var(--nu-cream-text-70); font-size: var(--nu-fs-sm); font-weight: 500;
}
.blv__legend span { display: inline-flex; align-items: center; gap: 8px; }
.blv__sw { display: inline-block; width: 18px; height: 3px; border-radius: 2px; }
.blv__sw--sel { background: var(--nu-tese-line); height: 4px; }
.blv__sw--ibov { background: repeating-linear-gradient(90deg, var(--nu-cream-text-65) 0 5px, transparent 5px 9px); }
.blv__sw--selic { background: repeating-linear-gradient(90deg, var(--nu-cream-text-55) 0 2px, transparent 2px 6px); }
.blv__sw--other { background: var(--nu-cream-text-30); height: 2px; }

.blv__plot { position: relative; height: clamp(240px, 30vw, 340px); margin-top: 14px; cursor: crosshair; touch-action: pan-y; }
.blv__svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.blv__selic { stroke: var(--nu-cream-text-55); }
.blv__other { stroke: var(--nu-cream-text-30); }
.blv__ibov { stroke: var(--nu-cream-text-65); }
.blv__glow { stroke: var(--nu-blue); }
.blv__sel { stroke: var(--nu-tese-line); }
.blv__stop-a { stop-color: var(--nu-blue); stop-opacity: .35; }
.blv__stop-b { stop-color: var(--nu-blue); stop-opacity: 0; }
.blv__gridline { position: absolute; left: 0; right: 0; height: 1px; background: var(--nu-cream-text-08); }
.blv__gridlbl {
  position: absolute; left: 0; transform: translateY(-120%);
  color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 500; font-variant-numeric: tabular-nums;
}
.blv__end {
  position: absolute; right: 0; transform: translateY(-50%); display: flex; flex-direction: column; align-items: flex-end;
  border-radius: 12px; padding: 6px 11px; white-space: nowrap; pointer-events: none; transition: top .4s ease;
}
.blv__end--sel { background: var(--nu-cream); box-shadow: var(--nu-shadow-chart-pill); }
.blv__end--ibov { background: var(--nu-navy-2); }
.blv__end-lbl { font-size: var(--nu-fs-xs); font-weight: 700; letter-spacing: .4px; text-transform: uppercase; }
.blv__end--sel .blv__end-lbl { color: var(--nu-navy-55); }
.blv__end--ibov .blv__end-lbl { color: var(--nu-cream-text-55); }
.blv__end-val { font-size: var(--nu-fs-md); font-weight: 800; font-variant-numeric: tabular-nums; }
.blv__end--sel .blv__end-val { color: var(--nu-navy); }
.blv__end--ibov .blv__end-val { color: var(--nu-cream-text); }
.blv__cross { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--nu-cream-text-30); pointer-events: none; }
.blv__dot {
  position: absolute; width: 14px; height: 14px; border-radius: 50%; background: var(--nu-white); border: 3px solid var(--nu-blue);
  box-shadow: 0 0 0 6px var(--nu-blue-28); transform: translate(-50%, -50%); pointer-events: none;
}
.blv__mark { position: absolute; width: 0; height: 0; pointer-events: none; z-index: 2; }
.blv__mark-dot {
  position: absolute; width: 12px; height: 12px; border-radius: 50%; transform: translate(-50%, -50%);
  background: var(--nu-cream); border: 3px solid var(--nu-blue); box-shadow: 0 0 0 5px var(--nu-blue-28);
}
.blv__mark-lbl {
  position: absolute; left: 12px; top: 12px; white-space: nowrap; border-radius: var(--nu-r-pill); padding: 4px 10px;
  background: var(--nu-cream); color: var(--nu-navy); font-size: var(--nu-fs-xs); font-weight: 700; box-shadow: var(--nu-shadow-chart-pill);
}
.blv__mark--flip .blv__mark-lbl { left: auto; right: 12px; }
.blv__rule { position: absolute; bottom: 0; width: 0; border-left: 1px dashed var(--nu-cream-text-30); pointer-events: none; }
.blv__mark-foot {
  position: absolute; bottom: 6px; transform: translateX(8px); white-space: nowrap; pointer-events: none; z-index: 2;
  border-radius: var(--nu-r-pill); padding: 3px 9px; background: var(--nu-navy-2); color: var(--nu-cream-text);
  font-size: var(--nu-fs-xs); font-weight: 700;
}
.blv__mark-foot--flip { transform: translateX(calc(-100% - 8px)); }
.blv__tip-marco { color: var(--nu-blue); font-size: var(--nu-fs-xs); font-weight: 700; margin-top: 2px; }
.blv__tip {
  position: absolute; top: 4px; transform: translateX(-50%); z-index: 3; background: var(--nu-cream);
  border-radius: var(--nu-r-tile); padding: 10px 14px; box-shadow: var(--nu-shadow-chart-tip); pointer-events: none; white-space: nowrap;
}
.blv__tip-date { color: var(--nu-navy-55); font-size: var(--nu-fs-xs); font-weight: 700; text-transform: uppercase; letter-spacing: .4px; }
.blv__tip-main { color: var(--nu-navy); font-size: var(--nu-fs-lg); font-weight: 800; font-variant-numeric: tabular-nums; }
.blv__tip-row { color: var(--nu-gray-2); font-size: var(--nu-fs-dense); font-weight: 500; font-variant-numeric: tabular-nums; }
.blv__axis { display: flex; justify-content: space-between; margin-top: 10px; color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 500; }
.blv__foot { margin: 14px 0 0; color: var(--nu-cream-text-55); font-size: var(--nu-fs-sm); font-weight: 500; }

/* ——— entrada: as linhas se revelam da esquerda; troca de modelo faz a nova surgir ——— */
.blv__clip { transform-box: fill-box; transform-origin: left; }
.is-pending .blv__clip { transform: scaleX(0); }
.is-in .blv__clip { transform: scaleX(1); transition: transform 1.4s cubic-bezier(.45, .05, .2, 1); }
.is-pending .blv__end, .is-pending .blv__mark, .is-pending .blv__rule, .is-pending .blv__mark-foot { opacity: 0; }
.is-in .blv__mark, .is-in .blv__rule, .is-in .blv__mark-foot { transition: opacity .4s ease .3s; }
.is-in .blv__end { transition: opacity .4s ease 1.1s, top .4s ease; }
.blv__selg { animation: blv-pop .45s ease; }
@keyframes blv-pop { from { opacity: 0; } to { opacity: 1; } }

.blv__select { display: none; }
@container (max-width: 640px) {
  .blv__pick { display: none; }
  .blv__top { align-items: center; gap: 10px; }
  /* tela cheia no celular: as pílulas correm numa linha só, com fade na borda */
  .blv__pick--multi {
    display: flex; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; padding: 2px 0;
    mask-image: linear-gradient(90deg, #000 88%, transparent);
  }
  .blv__pick--multi::-webkit-scrollbar { display: none; }
  .blv__pick--multi .blv__pill { flex-shrink: 0; }
  .blv__full { margin: 0 -6px 0 0; }
  .blv__select {
    position: relative; flex: 1; min-width: 0; display: flex; align-items: center; gap: 10px; height: 48px; padding: 0 14px;
    border-radius: var(--nu-r-input); border: 1px solid var(--nu-cream-text-18); color: var(--nu-cream-text);
  }
  .blv__select:has(select:focus-visible) { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }
  .blv__select-lbl { color: var(--nu-cream-text-55); font-size: var(--nu-fs-xs); font-weight: 700; text-transform: uppercase; letter-spacing: .4px; white-space: nowrap; }
  .blv__select-val { flex: 1; min-width: 0; font-size: var(--nu-fs-md); font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .blv__select-chev { width: 18px; height: 18px; flex-shrink: 0; color: var(--nu-cream-text-55); }
  .blv__select select { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; font-size: var(--nu-fs-md); }
}
/* celular: com o ícone ao lado, o rótulo espremia o nome do modelo ("Qw..."); o nome basta */
@container (max-width: 440px) {
  .blv__select-lbl { display: none; }
}
</style>

<style>
/* View Transition da tela cheia (pseudo-elementos da raiz: fora do scoped).
   A caixa cresce do painel até a tela; o conteúdo não estica, é revelado. */
html.blv-travada { overflow: hidden; }
/* a caixa é navy sólida: nada da página vaza enquanto ela cresce ou encolhe.
   O raio (22px → 0 e volta) é animado por JS só nesta caixa (VT_MS, VT_CURVA). */
::view-transition-group(blv-cheia) {
  animation-duration: .42s; animation-timing-function: cubic-bezier(.32, .72, 0, 1);
  overflow: clip; background: var(--nu-navy);
}
/* troca cruzada sem vão: os dois fades correm juntos e somam (plus-lighter),
   então o conteúdo nunca some no meio */
::view-transition-old(blv-cheia), ::view-transition-new(blv-cheia) {
  height: 100%; object-fit: none; object-position: left top; animation-duration: .26s;
}
/* a página por trás não muda à vista: sem crossfade dela, menos camada animando */
::view-transition-old(root), ::view-transition-new(root) { animation: none; }
</style>

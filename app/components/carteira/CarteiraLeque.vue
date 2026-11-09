<script setup lang="ts">
// O leque dos cenários (31/10/2026): o momento assinatura da /carteira, no
// desenho do Agora dos apps (IPhoneAgoraV2 · Simulação e MacAgoraFerramentas),
// traduzido para o navy do Nu.
//
// Este é o leque SEM os caminhos: o desenho de exemplo do /assinar e do
// paywall, e o recuo da /carteira quando a resposta não traz os 2.000
// caminhos (com eles, quem desenha é o CarteiraLequeCaminhos, em canvas).
// Desenha o que existe: a faixa de 80% (p10–p90) com o verde no alto e o
// vermelho embaixo, a de 50% (p25–p75) mais clara, um fio em cada quantil e,
// aceso no meio, o caminho real do motor (ou o p50). Nenhum caminho
// inventado. Na ponta, o sino dos finais e os três rótulos.
//
// Movimento: o leque abre da esquerda para a direita UMA vez, quando entra na
// tela (1,6 s), e os rótulos chegam depois. Nada fica em laço. Com movimento
// reduzido, aparece pronto.
//
// `fins` null = desenho de exemplo (o /assinar e o paywall): só os nomes
// otimista, meio e pessimista, sem número nenhum.
import type { FuturoDadosApi } from '~/types/assinatura'
import { desenharLeque, marcasDoEixo } from '~/utils/futuro'

const props = withDefaults(defineProps<{
  dados: FuturoDadosApi
  fins?: { otimista: string; meio: string; pessimista: string } | null
  /** rótulos do eixo, embaixo: 'hoje · R$ 66,2 mil', os anos do meio e '2031' */
  eixo?: { hoje: string; fim: string; anos?: string[] } | null
  /** altura no computador (no celular é menor) */
  altura?: number
  animar?: boolean
}>(), { fins: null, eixo: null, altura: 400, animar: true })

const uid = useId()
const raiz = ref<HTMLElement | null>(null)
const hojeEl = ref<HTMLElement | null>(null)
const largura = ref(960)
const larguraHoje = ref(150)
const celular = computed(() => largura.value < 600)
const h = computed(() => (celular.value ? Math.round(props.altura * 0.66) : props.altura))
// coluna dos rótulos à direita do sino (o número + o nome)
const colRotulos = computed(() => (props.fins ? (celular.value ? 96 : 156) : (celular.value ? 78 : 112)))
const larguraSino = computed(() => (celular.value ? 30 : 58))
const xFim = computed(() => Math.max(largura.value - colRotulos.value - larguraSino.value, 120))

const desenho = computed(() => desenharLeque(
  props.dados,
  { w: largura.value, h: h.value, xFim: xFim.value, sino: larguraSino.value, pad: 18 },
))

// rótulos sem encostar um no outro (o miolo estreito juntaria os três)
const rotulos = computed(() => {
  const d = desenho.value
  const gap = celular.value ? 40 : 50
  const itens = [
    { k: 'otimista' as const, y: d.y.otimista, nome: 'otimista' },
    { k: 'meio' as const, y: d.y.meio, nome: 'meio' },
    { k: 'pessimista' as const, y: d.y.pessimista, nome: 'pessimista' },
  ]
  const topo = 20
  const base = h.value - 20
  itens[0]!.y = Math.max(topo, Math.min(itens[0]!.y, itens[1]!.y - gap))
  itens[1]!.y = Math.max(itens[0]!.y + gap, itens[1]!.y)
  itens[2]!.y = Math.max(itens[1]!.y + gap, itens[2]!.y)
  if (itens[2]!.y > base) {
    const sobra = itens[2]!.y - base
    for (const it of itens) it.y -= sobra
  }
  return itens.map((it) => ({ ...it, valor: props.fins?.[it.k] ?? null }))
})

// anos do meio no eixo, só os que cabem sem encostar no "hoje · R$ X" (o
// "2027" caía em cima dele nas larguras médias) nem no ano final; no celular
// não cabem (as linhas verticais seguem marcando os anos)
const marcas = computed(() => {
  if (celular.value) return []
  const anos = props.eixo?.anos ?? []
  return marcasDoEixo(
    desenho.value.xAnos.map((x, i) => ({ x, rotulo: anos[i] ?? null })),
    { hojeDireita: larguraHoje.value, fimEsquerda: desenho.value.xFim - 22, meiaLargura: 20 },
  )
})
function medirHoje() {
  if (hojeEl.value) larguraHoje.value = hojeEl.value.offsetWidth || larguraHoje.value
}
watch(largura, () => nextTick(medirHoje))

/* ——— abre uma vez, quando aparece ——— */
const armado = ref(false)
const visivel = ref(false)
let io: IntersectionObserver | null = null
let ro: ResizeObserver | null = null

onMounted(() => {
  const el = raiz.value
  if (!el) return
  largura.value = Math.round(el.clientWidth) || largura.value
  medirHoje()
  document.fonts?.ready.then(medirHoje).catch(() => {})
  ro = new ResizeObserver(([e]) => {
    const w = Math.round(e?.contentRect.width ?? 0)
    if (w && Math.abs(w - largura.value) > 2) largura.value = w
  })
  ro.observe(el)

  const reduzido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!props.animar || reduzido || typeof IntersectionObserver === 'undefined') {
    visivel.value = true
    return
  }
  armado.value = true
  io = new IntersectionObserver((entradas) => {
    if (entradas.some((x) => x.isIntersecting)) {
      // um quadro depois do "armado" pintar, para a transição ter de onde sair
      requestAnimationFrame(() => requestAnimationFrame(() => { visivel.value = true }))
      io?.disconnect()
      io = null
    }
  }, { threshold: 0.3 })
  io.observe(el)
})
onBeforeUnmount(() => { io?.disconnect(); ro?.disconnect() })
</script>

<template>
  <div
    ref="raiz"
    class="clq"
    :class="{ 'clq--armado': armado, 'clq--visivel': visivel, 'clq--exemplo': !fins }"
    :style="{ height: `${h + (eixo ? 34 : 0)}px` }"
  >
    <div class="clq__traco">
      <svg :width="largura" :height="h" :viewBox="`0 0 ${largura} ${h}`" class="clq__svg" aria-hidden="true" focusable="false">
        <defs>
          <!-- a faixa de 80%: verde no alto, creme no miolo, vermelho embaixo -->
          <linearGradient :id="`${uid}-faixa`" gradientUnits="userSpaceOnUse" x1="0" x2="0" :y1="desenho.y.topo" :y2="desenho.y.base">
            <stop offset="0" class="clq__stop-alto" stop-opacity="0.34" />
            <stop offset="0.5" class="clq__stop-creme" stop-opacity="0.07" />
            <stop offset="1" class="clq__stop-baixo" stop-opacity="0.34" />
          </linearGradient>
          <linearGradient :id="`${uid}-sino`" gradientUnits="userSpaceOnUse" x1="0" x2="0" :y1="desenho.y.otimista" :y2="desenho.y.pessimista">
            <stop offset="0" class="clq__stop-alto" stop-opacity="0.5" />
            <stop offset="0.5" class="clq__stop-creme" stop-opacity="0.22" />
            <stop offset="1" class="clq__stop-baixo" stop-opacity="0.5" />
          </linearGradient>
          <!-- o leque nasce fino em "hoje" e ganha cor para a direita -->
          <linearGradient :id="`${uid}-nasce`" gradientUnits="userSpaceOnUse" :x1="desenho.xHoje" :x2="desenho.xFim" y1="0" y2="0">
            <stop offset="0" class="clq__stop-mascara" stop-opacity="0.25" />
            <stop offset="0.35" class="clq__stop-mascara" stop-opacity="0.85" />
            <stop offset="1" class="clq__stop-mascara" stop-opacity="1" />
          </linearGradient>
          <mask :id="`${uid}-mascara`" maskUnits="userSpaceOnUse" x="0" y="0" :width="largura" :height="h">
            <rect x="0" y="0" :width="desenho.xFim + 1" :height="h" :fill="`url(#${uid}-nasce)`" />
          </mask>
          <filter :id="`${uid}-brilho`" x="-10%" y="-40%" width="120%" height="180%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <!-- marcas dos anos -->
        <line
          v-for="m in desenho.xAnos" :key="`a-${m}`"
          :x1="m" :x2="m" y1="8" :y2="h - 8" class="clq__ano"
        />

        <g :mask="`url(#${uid}-mascara)`">
          <path :d="desenho.faixa80" :fill="`url(#${uid}-faixa)`" />
          <path :d="desenho.faixa50" class="clq__faixa50" />
          <path :d="desenho.linhas.p90" class="clq__fio clq__fio--alto" />
          <path :d="desenho.linhas.p75" class="clq__fio clq__fio--alto clq__fio--leve" />
          <path :d="desenho.linhas.p25" class="clq__fio clq__fio--baixo clq__fio--leve" />
          <path :d="desenho.linhas.p10" class="clq__fio clq__fio--baixo" />
        </g>

        <!-- a linha do meio, acesa (o caminho real do motor) -->
        <path :d="desenho.meio" class="clq__meio" :class="{ 'clq__meio--real': desenho.meioReal }" :filter="`url(#${uid}-brilho)`" fill="none" />

        <!-- o sino dos finais, na ponta -->
        <line :x1="desenho.xFim" :x2="desenho.xFim" y1="10" :y2="h - 10" class="clq__ponta" />
        <path :d="desenho.sino" :fill="`url(#${uid}-sino)`" class="clq__sino" />

        <!-- guias até os rótulos -->
        <line
          v-for="r in rotulos" :key="`g-${r.k}`"
          :x1="desenho.xFim" :x2="desenho.xFim + larguraSino + 6"
          :y1="desenho.y[r.k]" :y2="r.y"
          class="clq__guia"
        />
        <circle v-for="r in rotulos" :key="`p-${r.k}`" :cx="desenho.xFim" :cy="desenho.y[r.k]" r="4.5" :class="`clq__fim clq__fim--${r.k}`" />

        <!-- hoje -->
        <circle :cx="desenho.xHoje" :cy="desenho.y.hoje" r="11" class="clq__hoje-halo" />
        <circle :cx="desenho.xHoje" :cy="desenho.y.hoje" r="5.5" class="clq__hoje" />
      </svg>
    </div>

    <div class="clq__rotulos" :style="{ left: `${desenho.xFim + larguraSino + 12}px` }">
      <div
        v-for="r in rotulos" :key="r.k"
        class="clq__rotulo" :class="`clq__rotulo--${r.k}`"
        :style="{ top: `${r.y}px` }"
      >
        <span v-if="r.valor" class="clq__valor">{{ r.valor }}</span>
        <span class="clq__nome">{{ r.nome }}</span>
      </div>
    </div>

    <div v-if="eixo" class="clq__eixo" :style="{ top: `${h + 10}px` }">
      <span ref="hojeEl" class="clq__eixo-hoje">{{ eixo.hoje }}</span>
      <span v-for="m in marcas" :key="`r-${m.rotulo}`" class="clq__eixo-ano" :style="{ left: `${m.x}px` }">{{ m.rotulo }}</span>
      <span class="clq__eixo-fim" :style="{ left: `${desenho.xFim}px` }">{{ eixo.fim }}</span>
    </div>
  </div>
</template>

<style scoped>
.clq { position: relative; width: 100%; }
.clq__svg { display: block; overflow: visible; }
.clq__eixo { position: absolute; left: 0; right: 0; height: 20px; color: var(--nu-cream-text-55); font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums; }
.clq__eixo-hoje { position: absolute; left: 0; white-space: nowrap; }
.clq__eixo-ano { position: absolute; transform: translateX(-50%); white-space: nowrap; color: var(--nu-cream-text-35); font-weight: 500; }
.clq__eixo-fim { position: absolute; transform: translateX(-50%); white-space: nowrap; }

/* abre da esquerda para a direita, uma vez */
.clq__traco { width: 100%; }
.clq--armado .clq__traco { clip-path: inset(-20px 100% -20px -20px); }
.clq--armado.clq--visivel .clq__traco {
  clip-path: inset(-20px -40px -20px -20px);
  transition: clip-path 1.6s cubic-bezier(.22, .9, .24, 1);
}
.clq__rotulos { position: absolute; top: 0; right: 0; bottom: 0; }
.clq--armado .clq__rotulo { opacity: 0; transform: translate(-6px, -50%); }
.clq--armado.clq--visivel .clq__rotulo {
  opacity: 1; transform: translate(0, -50%);
  transition: opacity .5s ease 1.25s, transform .5s ease 1.25s;
}
.clq--armado .clq__eixo { opacity: 0; }
.clq--armado.clq--visivel .clq__eixo { opacity: 1; transition: opacity .5s ease .9s; }

.clq__stop-creme { stop-color: var(--nu-cream-text); }
/* a máscara lê luminância: branco = mostra */
.clq__stop-mascara { stop-color: var(--nu-white); }
.clq__stop-alto { stop-color: var(--nu-green-soft); }
.clq__stop-baixo { stop-color: var(--nu-red-soft); }

.clq__ano { stroke: var(--nu-cream-text-08); stroke-width: 1; }
.clq__faixa50 { fill: var(--nu-cream-text-10); }
.clq__fio { fill: none; stroke-width: 1.5; stroke-linejoin: round; }
.clq__fio--alto { stroke: var(--nu-green-soft); stroke-opacity: .8; }
.clq__fio--baixo { stroke: var(--nu-red-soft); stroke-opacity: .8; }
.clq__fio--leve { stroke-width: 1; stroke-opacity: .38; stroke-dasharray: 3 4; }
.clq__meio { stroke: var(--nu-cream-text); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
.clq__meio--real { stroke-width: 2.4; }
.clq__ponta { stroke: var(--nu-cream-text-14); stroke-width: 1; }
.clq__sino { stroke: var(--nu-cream-text-30); stroke-width: 1; }
.clq__guia { stroke: var(--nu-cream-text-30); stroke-width: 1; stroke-dasharray: 2 3; }
.clq__fim { stroke: var(--nu-navy); stroke-width: 2; }
.clq__fim--otimista { fill: var(--nu-green-soft); }
.clq__fim--meio { fill: var(--nu-cream-text); }
.clq__fim--pessimista { fill: var(--nu-red-soft); }
.clq__hoje-halo { fill: var(--nu-cream-text-12); }
.clq__hoje { fill: var(--nu-navy); stroke: var(--nu-cream-text); stroke-width: 2.5; }

.clq__rotulo {
  position: absolute; left: 0; transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 1px; white-space: nowrap;
}
.clq__valor { font-size: var(--nu-fs-xl); font-weight: 800; letter-spacing: -.01em; font-variant-numeric: tabular-nums; line-height: 1.15; }
.clq__nome { color: var(--nu-cream-text-55); font-size: var(--nu-fs-sm); font-weight: 700; }
.clq__rotulo--otimista .clq__valor { color: var(--nu-green-soft); }
.clq__rotulo--meio .clq__valor { color: var(--nu-cream-text); }
.clq__rotulo--pessimista .clq__valor { color: var(--nu-red-soft); }
/* desenho de exemplo: o nome sobe de papel (não há número) */
.clq--exemplo .clq__nome { font-size: var(--nu-fs-md); }
.clq--exemplo .clq__rotulo--otimista .clq__nome { color: var(--nu-green-soft); }
.clq--exemplo .clq__rotulo--meio .clq__nome { color: var(--nu-cream-text); }
.clq--exemplo .clq__rotulo--pessimista .clq__nome { color: var(--nu-red-soft); }

@media (max-width: 600px) {
  .clq__valor { font-size: var(--nu-fs-md); }
  .clq__nome { font-size: var(--nu-fs-xs); }
  .clq__eixo { font-size: var(--nu-fs-xs); }
}
</style>

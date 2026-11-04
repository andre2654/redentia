<script setup lang="ts">
// ESBOÇO 3 de 4 para o lugar dos anéis (03/11/2026, ?aneis=3 no dev): o
// losango da marca. O logo da Redentia são duas metades de losango, uma de
// cada lado; aqui a metade da esquerda é você e a da direita é a bolsa. A linha
// do meio é o zero: cada metade enche para cima na alta e para baixo na queda,
// como um vaso, até o seu % (a ponta de cima é +3%, a de baixo −3%). Lado a
// lado, as duas metades mostram o degrau na costura, e o chip diz o degrau em
// p.p. O rótulo de cada lado encosta na borda, na altura do nível. O provento é
// a peça pequena embaixo, a do pé do logo, que acende verde no dia em que cai
// um pagamento.
// Escala: 3% num dia comum, 6 ou 9 quando o dia passa disso; acima de 9 a
// metade enche até a ponta e ganha a seta (utils/placarDoDia.ts).
import { pctComSinal } from '~/utils/diaDaCarteira'
import { dicaDoDia, diferencaEmPP, escalaDoDia, posicaoNaEscala, ppComSinal, quemNaFrente } from '~/utils/placarDoDia'

const props = withDefaults(defineProps<{
  voce: number | null
  bolsa: number | null
  provento?: boolean
  proventoSub?: string | null
  esmaecido?: boolean
  carregando?: boolean
}>(), { provento: false, proventoSub: null, esmaecido: false, carregando: false })

const ROSA = 'var(--nu-agora-vermelho)'
const VERDE = 'var(--nu-agora-verde)'
const BRANCO = 'var(--nu-agora-texto)'
const corVoce = computed(() => (props.voce == null ? BRANCO : props.voce < 0 ? ROSA : VERDE))
const uid = `hlo${useId()}`

// o quadro: 320 × 206; o losango com centro em (160, 92), 76 de meia largura e 80 de meia altura
const CX = 160
const CY = 92
const W = 76
const H = 80
const COSTURA = 2.5
const ESQ = `M${CX - COSTURA} ${CY - H + 4} L${CX - W} ${CY} L${CX - COSTURA} ${CY + H - 4} Z`
const DIR = `M${CX + COSTURA} ${CY - H + 4} L${CX + W} ${CY} L${CX + COSTURA} ${CY + H - 4} Z`
/** a borda do losango na altura y (a meia largura ali) */
const meiaLargura = (y: number) => W * Math.max(0, 1 - Math.abs(y - CY) / H)

const escala = computed(() => escalaDoDia([props.voce, props.bolsa]))
const marcaRotulo = computed(() => `${escala.value}%`)
const nivel = (v: number | null, chave: 'voce' | 'bolsa', cor: string) => {
  if (v == null || props.carregando) return null
  const p = posicaoNaEscala(v, escala.value)
  const h = Math.max(1.5, Math.abs(p.f) * H)
  const sobe = v >= 0
  const y = sobe ? CY - h : CY + h
  // o rótulo encosta na borda, na altura do nível (sem sair do quadro)
  const yRotulo = Math.max(30, Math.min(176, y))
  // a borda mais larga do bloco do rótulo (o nome fica 24 acima do número)
  const borda = meiaLargura(Math.max(yRotulo - 24, Math.min(yRotulo + 8, CY)))
  return { chave, v, cor, h, sobe, y, passou: p.passou, yRotulo, xRotulo: chave === 'voce' ? CX - Math.max(borda, 8) - 10 : CX + Math.max(borda, 8) + 10 }
}
const nVoce = computed(() => nivel(props.voce, 'voce', corVoce.value))
const nBolsa = computed(() => nivel(props.bolsa, 'bolsa', BRANCO))

const diferenca = computed(() => diferencaEmPP(props.voce, props.bolsa))
const frente = computed(() => quemNaFrente(props.voce, props.bolsa))
const chip = computed(() => {
  const a = nVoce.value
  const b = nBolsa.value
  if (!a || !b || diferenca.value == null) return null
  // o chip fica na metade vazia do losango (acima do zero na queda, abaixo na
  // alta), preso por um fio na costura até o nível mais fundo
  // (um sobe e o outro cai: as duas metades cheias, o chip fica no zero)
  const juntos = a.sobe === b.sobe
  const y = !juntos ? CY : a.sobe ? CY + 28 : CY - 28
  return { y, juntos, ligaY: a.sobe ? Math.max(a.y, b.y) : Math.min(a.y, b.y), texto: ppComSinal(diferenca.value) }
})

const montado = ref(false)
onMounted(() => { requestAnimationFrame(() => { montado.value = true }) })
const visivel = computed(() => montado.value && !props.carregando)

const foco = ref<'voce' | 'bolsa' | 'provento' | null>(null)
const apagado = (c: 'voce' | 'bolsa' | 'provento') => foco.value != null && foco.value !== c
const dica = computed(() => {
  if (!foco.value || props.carregando) return null
  const texto = dicaDoDia(foco.value, props)
  if (!texto) return null
  // a dica fica logo abaixo do número do lado (o provento, acima da peça)
  const n = foco.value === 'voce' ? nVoce.value : foco.value === 'bolsa' ? nBolsa.value : null
  const x = foco.value === 'voce' ? 84 : foco.value === 'bolsa' ? 236 : CX
  const y = n ? Math.min(n.yRotulo + 16, 168) : 150
  return { texto, esquerda: `${Math.max(30, Math.min(70, ((x / 320) * 100)))}%`, topo: `${(y / 206) * 100}%` }
})

const falado = computed(() => {
  const p = (v: number | null) => (v == null ? 'sem dado' : `${v < 0 ? 'menos ' : ''}${Math.abs(v).toFixed(2).replace('.', ',')}%`)
  const q = frente.value ? `, ${frente.value.lider === 'empate' ? 'empatado com a bolsa' : `${frente.value.numero} ${frente.value.relacao}`}` : ''
  return `Você ${p(props.voce)}, bolsa ${p(props.bolsa)}${q}, ${props.provento ? 'caiu provento' : 'sem provento'}.`
})

function ir(destino: string, e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  void navigateTo(destino)
}
</script>

<template>
  <figure class="hlo" :class="{ 'hlo--esmaecido': esmaecido, 'hlo--carregando': carregando, 'hlo--visivel': visivel }">
    <figcaption class="hlo__sr">{{ falado }}</figcaption>
    <svg viewBox="0 0 320 206" class="hlo__svg" aria-hidden="true" @mouseleave="foco = null">
      <defs>
        <clipPath :id="`${uid}-esq`"><path :d="ESQ" /></clipPath>
        <clipPath :id="`${uid}-dir`"><path :d="DIR" /></clipPath>
      </defs>

      <!-- você e a bolsa: levam à /carteira -->
      <a href="/carteira" class="hlo__link" @click="ir('/carteira', $event)">
        <g
          v-for="lado in (['voce', 'bolsa'] as const)" :key="lado"
          class="hlo__grupo" :class="{ 'hlo__grupo--apagado': apagado(lado) }"
          @mouseenter="foco = lado"
        >
          <!-- o trilho da metade -->
          <path :d="lado === 'voce' ? ESQ : DIR" :fill="BRANCO" :fill-opacity="carregando ? 0.04 : 0.06" :stroke="BRANCO" :stroke-opacity="carregando ? 0.1 : 0.2" stroke-width="1.3" stroke-linejoin="round" />
          <!-- o nível -->
          <template v-for="n in [lado === 'voce' ? nVoce : nBolsa]" :key="lado">
            <g v-if="n" :clip-path="`url(#${uid}-${lado === 'voce' ? 'esq' : 'dir'})`">
              <g class="hlo__nivel" :style="{ transformOrigin: `${CX}px ${CY}px`, transitionDelay: lado === 'bolsa' ? '120ms' : '0ms' }">
                <rect :x="lado === 'voce' ? CX - W : CX" :y="n.sobe ? n.y : CY" :width="W" :height="n.h" :fill="n.cor" fill-opacity="0.88" />
                <!-- a superfície: a luz forte do nível -->
                <rect :x="lado === 'voce' ? CX - W : CX" :y="n.sobe ? n.y : n.y - 2.5" :width="W" height="2.5" :fill="n.cor" />
              </g>
            </g>
            <g v-if="n" class="hlo__rotulo">
              <path
                v-if="n.passou"
                :d="n.sobe ? `M${CX + (lado === 'voce' ? -9 : 9) - 4} ${CY - H + 2} l4 -5 l4 5` : `M${CX + (lado === 'voce' ? -9 : 9) - 4} ${CY + H - 2} l4 5 l4 -5`"
                fill="none" :stroke="n.cor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
              />
              <text :x="n.xRotulo" :y="n.yRotulo - 12" :text-anchor="lado === 'voce' ? 'end' : 'start'" class="hlo__nome" :fill="n.cor">{{ lado === 'voce' ? 'você' : 'bolsa' }}</text>
              <text :x="n.xRotulo" :y="n.yRotulo + 8" :text-anchor="lado === 'voce' ? 'end' : 'start'" class="hlo__num" :fill="n.cor">{{ pctComSinal(n.v) }}</text>
            </g>
          </template>
        </g>

        <!-- a diferença: o chip na costura, além do nível -->
        <g v-if="chip" class="hlo__dif" :class="{ 'hlo__grupo--apagado': foco === 'provento' }">
          <line v-if="chip.juntos" :x1="CX" :x2="CX" :y1="chip.ligaY" :y2="chip.y + (chip.y > chip.ligaY ? -17 : 17)" :stroke="corVoce" stroke-opacity="0.7" stroke-width="1.3" />
          <rect :x="CX - 50" :y="chip.y - 17" width="100" height="34" rx="12" fill="var(--nu-agora-bg)" :stroke="corVoce" stroke-opacity="0.7" stroke-width="1.3" />
          <text :x="CX" :y="chip.y - 2" text-anchor="middle" class="hlo__pp">{{ chip.texto }}</text>
          <text v-if="frente" :x="CX" :y="chip.y + 11" text-anchor="middle" class="hlo__relacao">{{ frente.lider === 'empate' ? 'empate' : frente.relacao }}</text>
        </g>
      </a>

      <!-- o zero e as pontas -->
      <line :x1="CX - W - 10" :y1="CY" :x2="CX + W + 10" :y2="CY" stroke="#fff" :stroke-opacity="carregando ? 0.2 : 0.55" stroke-width="1.5" stroke-dasharray="3 4" class="hlo__zero" />
      <template v-if="!carregando">
        <text :x="CX + W + 14" :y="CY + 4" class="hlo__marca">0</text>
        <text :x="CX + 10" :y="CY - H + 8" class="hlo__marca">+{{ marcaRotulo }}</text>
        <text :x="CX + 10" :y="CY + H - 1" class="hlo__marca">−{{ marcaRotulo }}</text>
      </template>

      <!-- o provento: a peça do pé do logo; leva à renda passiva -->
      <a href="/carteira#renda-passiva" class="hlo__link" @click="ir('/carteira#renda-passiva', $event)">
        <g class="hlo__grupo" :class="{ 'hlo__grupo--apagado': apagado('provento') }" @mouseenter="foco = 'provento'">
          <rect x="90" y="178" width="160" height="28" fill="transparent" />
          <path
            :d="`M${CX} 182 L${CX + 10} 193 L${CX} 204 L${CX - 10} 193 Z`"
            :fill="provento && !carregando ? VERDE : 'var(--nu-agora-bg)'" :stroke="carregando ? BRANCO : VERDE"
            :stroke-opacity="carregando ? 0.14 : provento ? 1 : 0.6" stroke-width="1.5" stroke-linejoin="round" class="hlo__peca"
          />
          <text v-if="!carregando" :x="CX" y="193.5" text-anchor="middle" dominant-baseline="central" class="hlo__cifrao" :fill="provento ? 'var(--nu-agora-bg)' : VERDE">$</text>
          <!-- o nome à esquerda da peça e o dia à direita, para caber em 375 -->
          <text v-if="!carregando" :x="CX - 16" y="197" text-anchor="end" class="hlo__prov" :fill="VERDE" font-weight="800">provento</text>
          <text v-if="!carregando && proventoSub" :x="CX + 16" y="197" class="hlo__prov hlo__prov-sub">{{ proventoSub }}</text>
        </g>
      </a>
    </svg>
    <div v-if="dica" class="hlo__dica" :style="{ left: dica.esquerda, top: dica.topo }" aria-hidden="true">{{ dica.texto }}</div>
  </figure>
</template>

<style scoped>
.hlo { position: relative; margin: 0; width: 100%; }
.hlo__svg { display: block; width: 100%; height: auto; overflow: visible; }
.hlo__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.hlo__link { cursor: pointer; outline: none; }
.hlo__link:focus-visible .hlo__grupo { filter: drop-shadow(0 0 3px var(--nu-agora-azul)); }

.hlo__nome { font-size: 12px; font-weight: 800; letter-spacing: -0.01em; }
.hlo__num { font-size: 20px; font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.hlo__pp { font-size: 12px; font-weight: 800; fill: var(--nu-agora-texto); font-variant-numeric: tabular-nums; }
.hlo__relacao { font-size: 11px; font-weight: 700; fill: var(--nu-agora-sub); }
.hlo__marca { font-size: 11px; font-weight: 700; fill: var(--nu-agora-sub); font-variant-numeric: tabular-nums; }
.hlo__cifrao { font-size: 10px; font-weight: 800; }
.hlo__prov { font-size: 12px; }
.hlo__prov-sub { fill: var(--nu-agora-sub); font-weight: 700; }

.hlo__grupo, .hlo__dif { transition: opacity .15s ease; }
.hlo__grupo--apagado { opacity: .3; }

/* a chegada: cada metade enche do zero até o nível, uma vez; depois os números */
.hlo__nivel { transform: scaleY(0); transition: transform .9s cubic-bezier(.2, .8, .2, 1); }
.hlo--visivel .hlo__nivel { transform: none; }
.hlo__rotulo, .hlo__dif { opacity: 0; transition: opacity .3s ease .8s; }
.hlo--visivel .hlo__rotulo, .hlo--visivel .hlo__dif { opacity: 1; }
.hlo--visivel .hlo__dif.hlo__grupo--apagado { opacity: .3; }

/* antes da abertura: o pregão anterior, esmaecido */
.hlo--esmaecido .hlo__nivel, .hlo--esmaecido .hlo__dif, .hlo--esmaecido .hlo__peca { opacity: .55; }

.hlo__dica {
  position: absolute; transform: translate(-50%, 0); pointer-events: none; width: max-content; max-width: 60%; text-align: center; text-wrap: balance; z-index: 1;
  padding: 7px 12px; border-radius: var(--nu-r-chip); background: var(--nu-agora-cartao); color: var(--nu-agora-texto);
  box-shadow: 0 0 0 1px var(--nu-agora-linha), 0 12px 28px -12px var(--nu-agora-bg);
  font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .hlo__nivel, .hlo__rotulo, .hlo__dif, .hlo__grupo { transition: none !important; }
}
</style>

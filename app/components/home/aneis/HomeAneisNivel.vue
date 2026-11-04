<script setup lang="ts">
// ESBOÇO 7 para o lugar dos anéis (04/11/2026, ?aneis=7 no dev): o nível
// sobreposto. Um logo inteiro da Redentia, partido no zero pela linha do
// meio: você é o preenchimento, que enche o logo todo (as quatro peças) do
// zero até o seu %, para cima na alta e para baixo na queda; a bolsa é só uma
// linha de nível branca que atravessa o logo na altura dela. A faixa entre a
// superfície de você e a linha da bolsa sai listrada: é a diferença, e o
// número dela em p.p. fica no miolo. A ponta do logo é a escala (3% num dia
// comum). O provento é um logo pequeno na linha de baixo, que acende verde.
import { pctComSinal } from '~/utils/diaDaCarteira'
import { LOGO, PECAS_DO_LOGO, transformDoLogo } from '~/utils/marcaRedentia'
import { dicaDoDia, diferencaEmPP, escalaDoDia, faladoDoDia, posicaoNaEscala, quemNaFrente } from '~/utils/placarDoDia'

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
const uid = `hnv${useId()}`
const PECAS = [PECAS_DO_LOGO.esquerda, PECAS_DO_LOGO.direita, PECAS_DO_LOGO.cima, PECAS_DO_LOGO.baixo]

// o quadro: 320 × 206; o logo de 172 com centro em (160, 92)
const CX = 160
const CY = 92
const TAM = 158
const K = TAM / LOGO.lado
const C = LOGO.centro
const TRANSFORM = transformDoLogo(CX, CY, TAM)
const fy = (u: number) => CY + (u - C) * K
const R = LOGO.raio * K
const MIOLO = LOGO.miolo * K
/** até onde o nível chega (a ponta, sem o canto): 100 do centro, nas unidades do logo */
const ALCANCE = 100

const escala = computed(() => escalaDoDia([props.voce, props.bolsa]))
const nivel = (v: number | null) => {
  if (v == null || props.carregando) return null
  const p = posicaoNaEscala(v, escala.value)
  const h = Math.max(1.5, Math.abs(p.f) * ALCANCE)
  const sobe = v >= 0
  return { v, h, sobe, y: sobe ? C - h : C + h, passou: p.passou }
}
const nVoce = computed(() => nivel(props.voce))
const nBolsa = computed(() => nivel(props.bolsa))
/** o rótulo encosta na borda de fora do logo, na altura do nível */
const rotulo = (yLogo: number, lado: -1 | 1) => {
  const y = Math.max(30, Math.min(172, fy(yLogo)))
  const perto = Math.max(y - 24, Math.min(y + 8, CY))
  const meia = Math.min(LOGO.raio, LOGO.raioVivo - Math.abs(perto - CY) / K) * K
  return { x: CX + lado * (meia + 8), y }
}
const rVoce = computed(() => (nVoce.value ? rotulo(nVoce.value.y, -1) : null))
const rBolsa = computed(() => (nBolsa.value ? rotulo(nBolsa.value.y, 1) : null))
const faixa = computed(() => {
  const a = nVoce.value
  const b = nBolsa.value
  if (!a || !b) return null
  const de = Math.min(a.y, b.y)
  const ate = Math.max(a.y, b.y)
  return ate - de < 0.5 ? null : { de, ate }
})
/** a linha da bolsa, esticada um pouco além da borda do logo */
const linhaBolsa = computed(() => {
  const b = nBolsa.value
  if (!b) return null
  const meia = Math.min(LOGO.raio, Math.max(0, LOGO.raioVivo - Math.abs(b.y - C))) * K
  return { y: fy(b.y), de: CX - meia - 6, ate: CX + meia + 6 }
})

const diferenca = computed(() => diferencaEmPP(props.voce, props.bolsa))
const frente = computed(() => quemNaFrente(props.voce, props.bolsa))
const palavra = computed(() => (!frente.value ? null : frente.value.lider === 'empate' ? 'empate' : frente.value.lider === 'voce' ? 'à frente' : 'atrás'))

const montado = ref(false)
onMounted(() => { requestAnimationFrame(() => { montado.value = true }) })
const visivel = computed(() => montado.value && !props.carregando)

const foco = ref<'voce' | 'bolsa' | 'provento' | null>(null)
const apagado = (c: 'voce' | 'bolsa' | 'provento') => foco.value != null && foco.value !== c
const dica = computed(() => {
  if (!foco.value || props.carregando) return null
  const texto = dicaDoDia(foco.value, props)
  if (!texto) return null
  const r = foco.value === 'voce' ? rVoce.value : foco.value === 'bolsa' ? rBolsa.value : null
  const x = foco.value === 'voce' ? 30 : foco.value === 'bolsa' ? 70 : 40
  const y = r ? Math.min(r.y + 16, 168) : 166
  return { texto, esquerda: `${x}%`, topo: `${(y / 206) * 100}%` }
})

const falado = computed(() => faladoDoDia(props.voce, props.bolsa, props.provento))

function ir(destino: string, e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  void navigateTo(destino)
}
</script>

<template>
  <figure class="hnv" :class="{ 'hnv--esmaecido': esmaecido, 'hnv--carregando': carregando, 'hnv--visivel': visivel }">
    <figcaption class="hnv__sr">{{ falado }}</figcaption>
    <svg viewBox="0 0 320 206" class="hnv__svg" aria-hidden="true" @mouseleave="foco = null">
      <defs>
        <!-- o logo inteiro, as quatro peças (um id por instância) -->
        <clipPath :id="`${uid}-logo`">
          <path v-for="(d, i) in PECAS" :key="i" :d="d" />
        </clipPath>
        <!-- a luz de você: mais forte na superfície, como o degradê das abas do logo -->
        <linearGradient :id="`${uid}-luz`" gradientUnits="userSpaceOnUse" x1="0" :y1="C" x2="0" :y2="nVoce ? nVoce.y : C">
          <stop offset="0" :stop-color="corVoce" stop-opacity=".45" />
          <stop offset="1" :stop-color="corVoce" />
        </linearGradient>
        <!-- a faixa da diferença: listras finas -->
        <pattern :id="`${uid}-listra`" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
          <rect width="7" height="7" fill="var(--nu-agora-bg)" fill-opacity=".35" />
          <rect width="2.6" height="7" :fill="BRANCO" fill-opacity=".8" />
        </pattern>
      </defs>

      <!-- você e a bolsa: levam à /carteira -->
      <a href="/carteira" class="hnv__link" @click="ir('/carteira', $event)">
        <g :transform="TRANSFORM">
          <!-- o trilho: o logo apagado -->
          <path v-for="(d, i) in PECAS" :key="i" :d="d" :fill="BRANCO" :fill-opacity="carregando ? 0.04 : 0.07" :stroke="BRANCO" :stroke-opacity="carregando ? 0.1 : 0.2" stroke-width="1.2" vector-effect="non-scaling-stroke" />
          <g :clip-path="`url(#${uid}-logo)`">
            <!-- você: o preenchimento -->
            <g v-if="nVoce" class="hnv__grupo" :class="{ 'hnv__grupo--apagado': apagado('voce') }" @mouseenter="foco = 'voce'">
              <g class="hnv__nivel" :style="{ transformOrigin: `${C}px ${C}px` }">
                <rect x="0" :y="nVoce.sobe ? nVoce.y : C" :width="LOGO.lado" :height="nVoce.h" :fill="`url(#${uid}-luz)`" />
                <rect x="0" :y="nVoce.sobe ? nVoce.y : nVoce.y - 3" :width="LOGO.lado" height="3" :fill="corVoce" />
              </g>
            </g>
            <!-- a diferença: a faixa entre a superfície e a linha da bolsa -->
            <rect v-if="faixa" x="0" :y="faixa.de" :width="LOGO.lado" :height="faixa.ate - faixa.de" :fill="`url(#${uid}-listra)`" class="hnv__faixa" :class="{ 'hnv__grupo--apagado': foco === 'provento' }" />
          </g>
        </g>

        <!-- a bolsa: só a linha de nível -->
        <g v-if="linhaBolsa" class="hnv__grupo" :class="{ 'hnv__grupo--apagado': apagado('bolsa') }" @mouseenter="foco = 'bolsa'">
          <rect :x="linhaBolsa.de" :y="linhaBolsa.y - 8" :width="linhaBolsa.ate - linhaBolsa.de" height="16" fill="transparent" />
          <line :x1="linhaBolsa.de" :x2="linhaBolsa.ate" :y1="linhaBolsa.y" :y2="linhaBolsa.y" :stroke="BRANCO" stroke-width="2.2" stroke-linecap="round" class="hnv__linha" />
        </g>

        <!-- os rótulos, na borda de fora, na altura de cada nível -->
        <g v-if="nVoce && rVoce" class="hnv__rotulo hnv__grupo" :class="{ 'hnv__grupo--apagado': apagado('voce') }" @mouseenter="foco = 'voce'">
          <text :x="rVoce.x" :y="rVoce.y - 12" text-anchor="end" class="hnv__nome" :fill="corVoce">você</text>
          <text :x="rVoce.x" :y="rVoce.y + 8" text-anchor="end" class="hnv__num" :fill="corVoce">{{ pctComSinal(nVoce.v) }}</text>
        </g>
        <g v-if="nBolsa && rBolsa" class="hnv__rotulo hnv__grupo" :class="{ 'hnv__grupo--apagado': apagado('bolsa') }" @mouseenter="foco = 'bolsa'">
          <text :x="rBolsa.x" :y="rBolsa.y - 12" class="hnv__nome" :fill="BRANCO">bolsa</text>
          <text :x="rBolsa.x" :y="rBolsa.y + 8" class="hnv__num" :fill="BRANCO">{{ pctComSinal(nBolsa.v) }}</text>
        </g>

        <!-- o miolo: a diferença em p.p. -->
        <g v-if="frente && !carregando" class="hnv__dif" :class="{ 'hnv__grupo--apagado': foco === 'provento' }">
          <text :x="CX" :y="CY + 1" text-anchor="middle" class="hnv__pp">{{ frente.numero }}</text>
          <text :x="CX" :y="CY + 14" text-anchor="middle" class="hnv__relacao" :fill="frente.lider === 'empate' ? 'var(--nu-agora-sub)' : corVoce">{{ palavra }}</text>
        </g>
      </a>

      <!-- o zero: a linha do meio, fora do miolo; e as pontas -->
      <line :x1="CX - R - 12" :x2="CX - MIOLO - 3" :y1="CY" :y2="CY" stroke="#fff" :stroke-opacity="carregando ? 0.2 : 0.5" stroke-width="1.4" stroke-dasharray="3 4" />
      <line :x1="CX + MIOLO + 3" :x2="CX + R + 12" :y1="CY" :y2="CY" stroke="#fff" :stroke-opacity="carregando ? 0.2 : 0.5" stroke-width="1.4" stroke-dasharray="3 4" />
      <template v-if="!carregando">
        <text :x="CX + 10" :y="fy(4) + 4" class="hnv__marca">+{{ escala }}%</text>
        <text :x="CX + 10" :y="fy(202) + 2" class="hnv__marca">−{{ escala }}%</text>
      </template>

      <!-- o provento: um logo pequeno na linha de baixo; leva à renda passiva -->
      <a href="/carteira#renda-passiva" class="hnv__link" @click="ir('/carteira#renda-passiva', $event)">
        <g class="hnv__grupo" :class="{ 'hnv__grupo--apagado': apagado('provento') }" @mouseenter="foco = 'provento'">
          <rect x="4" y="184" width="130" height="22" fill="transparent" />
          <g :transform="transformDoLogo(16, 195, 18)" class="hnv__moeda">
            <path
              v-for="(d, i) in PECAS" :key="i" :d="d"
              :fill="provento && !carregando ? VERDE : 'none'" :stroke="carregando ? BRANCO : VERDE"
              :stroke-opacity="carregando ? 0.14 : provento ? 1 : 0.6" stroke-width="1.1" vector-effect="non-scaling-stroke"
            />
          </g>
          <text v-if="!carregando" x="31" y="192" class="hnv__prov" :fill="VERDE" font-weight="800">provento</text>
          <text v-if="!carregando && proventoSub" x="31" y="205" class="hnv__prov hnv__prov-sub">{{ proventoSub }}</text>
        </g>
      </a>
    </svg>
    <div v-if="dica" class="hnv__dica" :style="{ left: dica.esquerda, top: dica.topo }" aria-hidden="true">{{ dica.texto }}</div>
  </figure>
</template>

<style scoped>
.hnv { position: relative; margin: 0; width: 100%; }
.hnv__svg { display: block; width: 100%; height: auto; overflow: visible; }
.hnv__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.hnv__link { cursor: pointer; outline: none; }
.hnv__link:focus-visible .hnv__grupo { filter: drop-shadow(0 0 3px var(--nu-agora-azul)); }

.hnv__nome { font-size: 12px; font-weight: 800; letter-spacing: -0.01em; }
.hnv__num { font-size: 18px; font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.hnv__pp { font-size: 12px; font-weight: 800; fill: var(--nu-agora-texto); font-variant-numeric: tabular-nums; }
.hnv__relacao { font-size: 11px; font-weight: 800; }
.hnv__marca { font-size: 11px; font-weight: 700; fill: var(--nu-agora-sub); font-variant-numeric: tabular-nums; }
.hnv__prov { font-size: 11px; }
.hnv__prov-sub { fill: var(--nu-agora-sub); font-weight: 700; }

.hnv__grupo, .hnv__dif, .hnv__faixa { transition: opacity .15s ease; }
.hnv__grupo--apagado { opacity: .3; }

/* a chegada: o logo enche do zero até o nível de você; depois a linha, a faixa e os números */
.hnv__nivel { transform: scaleY(0); transition: transform .9s cubic-bezier(.2, .8, .2, 1); }
.hnv--visivel .hnv__nivel { transform: none; }
.hnv__linha { stroke-dasharray: 400; stroke-dashoffset: 400; transition: stroke-dashoffset .6s ease .5s; }
.hnv--visivel .hnv__linha { stroke-dashoffset: 0; }
.hnv__rotulo, .hnv__dif, .hnv__faixa { opacity: 0; transition: opacity .3s ease .9s; }
.hnv--visivel .hnv__rotulo, .hnv--visivel .hnv__dif, .hnv--visivel .hnv__faixa { opacity: 1; }
.hnv--visivel .hnv__grupo--apagado { opacity: .3; }

/* antes da abertura: o pregão anterior, esmaecido */
.hnv--esmaecido .hnv__nivel, .hnv--esmaecido .hnv__linha, .hnv--esmaecido .hnv__faixa, .hnv--esmaecido .hnv__dif, .hnv--esmaecido .hnv__moeda { opacity: .55; }

.hnv__dica {
  position: absolute; transform: translate(-50%, 0); pointer-events: none; width: max-content; max-width: 60%; text-align: center; text-wrap: balance; z-index: 1;
  padding: 7px 12px; border-radius: var(--nu-r-chip); background: var(--nu-agora-cartao); color: var(--nu-agora-texto);
  box-shadow: 0 0 0 1px var(--nu-agora-linha), 0 12px 28px -12px var(--nu-agora-bg);
  font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .hnv__nivel, .hnv__linha, .hnv__rotulo, .hnv__dif, .hnv__faixa, .hnv__grupo { transition: none !important; }
}
</style>

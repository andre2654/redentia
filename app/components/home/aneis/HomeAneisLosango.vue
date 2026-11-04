<script setup lang="ts">
// ESBOÇO 3 para o lugar dos anéis (?aneis=3 no dev), o que o dono escolheu
// entre os quatro primeiros ("gostei de usarmos mais a logo da Redentia igual
// o 3, explore mais isso"). Refeito em 04/11 com as peças do logo de verdade
// (utils/marcaRedentia.ts): as duas metades (os chevrons) são os dois vasos,
// a da esquerda você e a da direita a bolsa; a linha do meio é o zero, e cada
// metade enche para cima na alta e para baixo na queda até o seu % (a ponta da
// metade é a escala, 3% num dia comum). O degradê é o do logo: claro na ponta
// de fora, mais escuro no eixo. As abas de cima e de baixo ficam por cima,
// como no logo; a de baixo acende verde no dia em que cai um provento. O
// miolo, o vão do meio, diz a diferença em p.p. O rótulo de cada lado encosta
// na borda de fora, na altura do nível.
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
const uid = `hlo${useId()}`

// o quadro: 320 × 206; o logo de 176 com centro em (160, 94)
const CX = 160
const CY = 94
const TAM = 156
const K = TAM / LOGO.lado
const C = LOGO.centro
const TRANSFORM = transformDoLogo(CX, CY, TAM)
/** do logo (206) para o quadro */
const fx = (u: number) => CX + (u - C) * K
const fy = (u: number) => CY + (u - C) * K
const MIOLO = LOGO.miolo * K
const R = LOGO.raio * K

const escala = computed(() => escalaDoDia([props.voce, props.bolsa]))
const nivel = (v: number | null, chave: 'voce' | 'bolsa', cor: string) => {
  if (v == null || props.carregando) return null
  const p = posicaoNaEscala(v, escala.value)
  // a ponta da metade é a escala: 80,25 do centro, nas unidades do logo
  const h = Math.max(1.5, Math.abs(p.f) * LOGO.alcanceDasMetades)
  const sobe = v >= 0
  const y = sobe ? C - h : C + h
  // o rótulo encosta na borda de fora, na altura do nível, sem sair do quadro
  const yRotulo = Math.max(30, Math.min(176, fy(y)))
  const perto = Math.max(yRotulo - 24, Math.min(yRotulo + 8, CY))
  const meia = Math.min(LOGO.raio, LOGO.raioVivo - Math.abs(perto - CY) / K) * K
  return { chave, v, cor, h, sobe, y, passou: p.passou, yRotulo, xRotulo: chave === 'voce' ? CX - meia - 8 : CX + meia + 8 }
}
const nVoce = computed(() => nivel(props.voce, 'voce', corVoce.value))
const nBolsa = computed(() => nivel(props.bolsa, 'bolsa', BRANCO))
const lados = computed(() => [
  { chave: 'voce' as const, peca: PECAS_DO_LOGO.esquerda, n: nVoce.value, x0: 0 },
  { chave: 'bolsa' as const, peca: PECAS_DO_LOGO.direita, n: nBolsa.value, x0: C },
])

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
  // logo abaixo do número do lado; o provento, acima da linha dele
  const n = foco.value === 'voce' ? nVoce.value : foco.value === 'bolsa' ? nBolsa.value : null
  const x = foco.value === 'voce' ? 30 : foco.value === 'bolsa' ? 70 : 50
  const y = n ? Math.min(n.yRotulo + 16, 168) : 150
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
  <figure class="hlo" :class="{ 'hlo--esmaecido': esmaecido, 'hlo--carregando': carregando, 'hlo--visivel': visivel }">
    <figcaption class="hlo__sr">{{ falado }}</figcaption>
    <svg viewBox="0 0 320 206" class="hlo__svg" aria-hidden="true" @mouseleave="foco = null">
      <defs>
        <!-- um id por instância: a página de dev põe várias juntas -->
        <clipPath :id="`${uid}-voce`"><path :d="PECAS_DO_LOGO.esquerda" /></clipPath>
        <clipPath :id="`${uid}-bolsa`"><path :d="PECAS_DO_LOGO.direita" /></clipPath>
        <!-- o degradê das metades do logo: claro na ponta de fora, escuro no eixo -->
        <linearGradient :id="`${uid}-voce-luz`" gradientUnits="userSpaceOnUse" x1="0" y1="0" :x2="C" y2="0">
          <stop offset="0" :stop-color="corVoce" />
          <stop offset="1" :stop-color="corVoce" stop-opacity=".55" />
        </linearGradient>
        <linearGradient :id="`${uid}-bolsa-luz`" gradientUnits="userSpaceOnUse" :x1="LOGO.lado" y1="0" :x2="C" y2="0">
          <stop offset="0" :stop-color="BRANCO" />
          <stop offset="1" :stop-color="BRANCO" stop-opacity=".55" />
        </linearGradient>
      </defs>

      <!-- você e a bolsa: levam à /carteira -->
      <a href="/carteira" class="hlo__link" @click="ir('/carteira', $event)">
        <g v-for="l in lados" :key="l.chave" class="hlo__grupo" :class="{ 'hlo__grupo--apagado': apagado(l.chave) }" @mouseenter="foco = l.chave">
          <g :transform="TRANSFORM">
            <!-- o trilho: a metade do logo -->
            <path :d="l.peca" :fill="BRANCO" :fill-opacity="carregando ? 0.04 : 0.07" :stroke="BRANCO" :stroke-opacity="carregando ? 0.1 : 0.2" stroke-width="1.2" vector-effect="non-scaling-stroke" />
            <!-- o nível -->
            <g v-if="l.n" :clip-path="`url(#${uid}-${l.chave})`">
              <g class="hlo__nivel" :style="{ transformOrigin: `${C}px ${C}px`, transitionDelay: l.chave === 'bolsa' ? '120ms' : '0ms' }">
                <rect :x="l.x0" :y="l.n.sobe ? l.n.y : C" :width="C" :height="l.n.h" :fill="`url(#${uid}-${l.chave}-luz)`" />
                <!-- a superfície: a luz forte do nível -->
                <rect :x="l.x0" :y="l.n.sobe ? l.n.y : l.n.y - 3" :width="C" height="3" :fill="l.n.cor" />
              </g>
            </g>
          </g>
          <g v-if="l.n" class="hlo__rotulo">
            <path
              v-if="l.n.passou"
              :d="l.n.sobe ? `M${fx(l.chave === 'voce' ? 84 : 122) - 4} ${fy(22) - 4} l4 -5 l4 5` : `M${fx(l.chave === 'voce' ? 84 : 122) - 4} ${fy(184) + 4} l4 5 l4 -5`"
              fill="none" :stroke="l.n.cor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
            />
            <text :x="l.n.xRotulo" :y="l.n.yRotulo - 12" :text-anchor="l.chave === 'voce' ? 'end' : 'start'" class="hlo__nome" :fill="l.n.cor">{{ l.chave === 'voce' ? 'você' : 'bolsa' }}</text>
            <text :x="l.n.xRotulo" :y="l.n.yRotulo + 8" :text-anchor="l.chave === 'voce' ? 'end' : 'start'" class="hlo__num" :fill="l.n.cor">{{ pctComSinal(l.n.v) }}</text>
          </g>
        </g>

        <!-- a aba de cima, por cima das metades, como no logo -->
        <g :transform="TRANSFORM">
          <path :d="PECAS_DO_LOGO.cima" fill="var(--nu-agora-bg)" />
          <path :d="PECAS_DO_LOGO.cima" :fill="BRANCO" :fill-opacity="carregando ? 0.05 : 0.1" :stroke="BRANCO" :stroke-opacity="carregando ? 0.1 : 0.22" stroke-width="1.2" vector-effect="non-scaling-stroke" />
        </g>

        <!-- o miolo: a diferença em p.p. -->
        <g v-if="frente && !carregando" class="hlo__dif" :class="{ 'hlo__grupo--apagado': foco === 'provento' }">
          <text :x="CX" :y="CY + 1" text-anchor="middle" class="hlo__pp">{{ frente.numero }}</text>
          <text :x="CX" :y="CY + 14" text-anchor="middle" class="hlo__relacao" :fill="frente.lider === 'empate' ? 'var(--nu-agora-sub)' : corVoce">{{ palavra }}</text>
        </g>
      </a>

      <!-- o zero: a linha do meio, fora do miolo -->
      <g class="hlo__zero">
        <line :x1="CX - R - 12" :x2="CX - MIOLO - 3" :y1="CY" :y2="CY" stroke="#fff" :stroke-opacity="carregando ? 0.2 : 0.55" stroke-width="1.5" stroke-dasharray="3 4" />
        <line :x1="CX + MIOLO + 3" :x2="CX + R + 12" :y1="CY" :y2="CY" stroke="#fff" :stroke-opacity="carregando ? 0.2 : 0.55" stroke-width="1.5" stroke-dasharray="3 4" />
      </g>
      <template v-if="!carregando">
        <text :x="fx(140)" :y="fy(22.8) + 3" class="hlo__marca">+{{ escala }}%</text>
        <text :x="fx(140)" :y="fy(183.3) + 8" class="hlo__marca">−{{ escala }}%</text>
      </template>

      <!-- o provento: a aba de baixo do logo; leva à renda passiva -->
      <a href="/carteira#renda-passiva" class="hlo__link" @click="ir('/carteira#renda-passiva', $event)">
        <g class="hlo__grupo" :class="{ 'hlo__grupo--apagado': apagado('provento') }" @mouseenter="foco = 'provento'">
          <rect x="90" y="186" width="140" height="20" fill="transparent" />
          <g :transform="TRANSFORM">
            <path :d="PECAS_DO_LOGO.baixo" fill="var(--nu-agora-bg)" />
            <path
              :d="PECAS_DO_LOGO.baixo"
              :fill="provento && !carregando ? VERDE : BRANCO" :fill-opacity="provento && !carregando ? 1 : carregando ? 0.05 : 0.1"
              :stroke="provento && !carregando ? VERDE : BRANCO" :stroke-opacity="carregando ? 0.1 : 0.22" stroke-width="1.2" vector-effect="non-scaling-stroke"
              class="hlo__peca"
            />
          </g>
          <text v-if="!carregando" :x="CX" :y="fy(190)" text-anchor="middle" dominant-baseline="central" class="hlo__cifrao" :fill="provento ? 'var(--nu-agora-bg)' : VERDE">$</text>
          <text v-if="!carregando" :x="CX - 6" y="201" text-anchor="end" class="hlo__prov" :fill="VERDE" font-weight="800">provento</text>
          <text v-if="!carregando && proventoSub" :x="CX + 6" y="201" class="hlo__prov hlo__prov-sub">{{ proventoSub }}</text>
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
.hlo__num { font-size: 18px; font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.hlo__pp { font-size: 12px; font-weight: 800; fill: var(--nu-agora-texto); font-variant-numeric: tabular-nums; }
.hlo__relacao { font-size: 11px; font-weight: 800; }
.hlo__marca { font-size: 11px; font-weight: 700; fill: var(--nu-agora-sub); font-variant-numeric: tabular-nums; }
.hlo__cifrao { font-size: 11px; font-weight: 800; }
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

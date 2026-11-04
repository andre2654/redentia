<script setup lang="ts">
// ESBOÇO 8 para o lugar dos anéis (04/11/2026, ?aneis=8 no dev): o miolo
// aceso. Dois logos da Redentia lado a lado, você à esquerda e a bolsa à
// direita; o logo fica quieto e o dado é o miolo, o vão do meio: ele acende
// de dentro para fora, com a área proporcional ao tamanho do dia (a raiz da
// fração da escala; o miolo todo é 3% num dia comum), na cor do sentido
// (rosa na queda, verde na alta; a bolsa em branco), com a seta do sentido no
// meio. É o mais emblemático dos esboços: o número embaixo de cada logo faz a
// leitura, o miolo dá o tamanho de relance. A diferença fica entre os dois
// logos, num chip em p.p. O provento é um logo pequeno na linha de baixo, com
// o miolo verde no dia em que cai um pagamento.
import { pctComSinal } from '~/utils/diaDaCarteira'
import { LOGO, PECAS_DO_LOGO, losangoArredondado, MIOLO_DO_LOGO, transformDoLogo } from '~/utils/marcaRedentia'
import { dicaDoDia, diferencaEmPP, escalaDoDia, faladoDoDia, posicaoNaEscala, ppComSinal, quemNaFrente } from '~/utils/placarDoDia'

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
const PECAS = [PECAS_DO_LOGO.esquerda, PECAS_DO_LOGO.direita, PECAS_DO_LOGO.cima, PECAS_DO_LOGO.baixo]

// o quadro: 320 × 206; os dois logos de 104 com centro em y = 92
const CY = 92
const TAM = 104
const X_VOCE = 72
const X_BOLSA = 248
const C = LOGO.centro

const escala = computed(() => escalaDoDia([props.voce, props.bolsa]))
const logo = (v: number | null, chave: 'voce' | 'bolsa', x: number, cor: string) => {
  const base = { chave, x, cor, v }
  if (v == null || props.carregando) return { ...base, luz: null }
  const p = posicaoNaEscala(v, escala.value)
  // a área do miolo aceso é proporcional ao dia: o lado cresce com a raiz
  const f = Math.sqrt(Math.abs(p.f))
  const r = Math.max(4, f * LOGO.mioloVivo)
  return {
    ...base,
    luz: { d: losangoArredondado(C, C, r, LOGO.cantoDoMiolo * (r / LOGO.mioloVivo)), sobe: v >= 0, neutro: Math.abs(v) < 0.005, passou: p.passou },
  }
}
const logos = computed(() => [
  logo(props.voce, 'voce', X_VOCE, corVoce.value),
  logo(props.bolsa, 'bolsa', X_BOLSA, BRANCO),
])

const diferenca = computed(() => diferencaEmPP(props.voce, props.bolsa))
const frente = computed(() => quemNaFrente(props.voce, props.bolsa))

const montado = ref(false)
onMounted(() => { requestAnimationFrame(() => { montado.value = true }) })
const visivel = computed(() => montado.value && !props.carregando)

const foco = ref<'voce' | 'bolsa' | 'provento' | null>(null)
const apagado = (c: 'voce' | 'bolsa' | 'provento') => foco.value != null && foco.value !== c
const dica = computed(() => {
  if (!foco.value || props.carregando) return null
  const texto = dicaDoDia(foco.value, props)
  if (!texto) return null
  const x = foco.value === 'voce' ? 30 : foco.value === 'bolsa' ? 70 : 50
  const y = foco.value === 'provento' ? 170 : 2
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
  <figure class="hmi" :class="{ 'hmi--esmaecido': esmaecido, 'hmi--carregando': carregando, 'hmi--visivel': visivel }">
    <figcaption class="hmi__sr">{{ falado }}</figcaption>
    <svg viewBox="0 0 320 206" class="hmi__svg" aria-hidden="true" @mouseleave="foco = null">
      <!-- você e a bolsa: levam à /carteira -->
      <a href="/carteira" class="hmi__link" @click="ir('/carteira', $event)">
        <g
          v-for="l in logos" :key="l.chave"
          v-show="carregando || l.v != null"
          class="hmi__grupo" :class="{ 'hmi__grupo--apagado': apagado(l.chave) }"
          @mouseenter="foco = l.chave"
        >
          <rect :x="l.x - 62" y="4" width="124" height="176" fill="transparent" />
          <text v-if="!carregando" :x="l.x" y="20" text-anchor="middle" class="hmi__nome" :fill="l.cor">{{ l.chave === 'voce' ? 'você' : 'bolsa' }}</text>
          <g :transform="transformDoLogo(l.x, CY, TAM)">
            <!-- o logo, quieto -->
            <path v-for="(d, i) in PECAS" :key="i" :d="d" :fill="BRANCO" :fill-opacity="carregando ? 0.05 : 0.13" :stroke="BRANCO" :stroke-opacity="carregando ? 0.1 : 0.24" stroke-width="1.2" vector-effect="non-scaling-stroke" />
            <!-- o miolo apagado e o aceso -->
            <path :d="MIOLO_DO_LOGO" fill="none" :stroke="BRANCO" :stroke-opacity="carregando ? 0.08 : 0.16" stroke-width="1" stroke-dasharray="2 3" vector-effect="non-scaling-stroke" />
            <g v-if="l.luz" class="hmi__luz" :style="{ transformOrigin: `${C}px ${C}px`, transitionDelay: l.chave === 'bolsa' ? '120ms' : '0ms', color: l.cor }">
              <path :d="l.luz.d" :fill="l.cor" />
              <!-- a seta do sentido, no meio do miolo -->
              <path
                v-if="!l.luz.neutro"
                :d="l.luz.sobe ? `M${C} ${C + 14} V${C - 14} M${C - 10} ${C - 4} L${C} ${C - 14} L${C + 10} ${C - 4}` : `M${C} ${C - 14} V${C + 14} M${C - 10} ${C + 4} L${C} ${C + 14} L${C + 10} ${C + 4}`"
                fill="none" stroke="var(--nu-agora-bg)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"
              />
            </g>
          </g>
          <text v-if="l.luz" :x="l.x" y="168" text-anchor="middle" class="hmi__num hmi__rotulo" :fill="l.cor">{{ pctComSinal(l.v!) }}{{ l.luz.passou ? ' ▸' : '' }}</text>
          <rect v-else-if="carregando" :x="l.x - 36" y="152" width="72" height="20" rx="8" :fill="BRANCO" fill-opacity="0.08" />
        </g>

        <!-- a diferença: entre os dois logos -->
        <g v-if="frente && !carregando" class="hmi__dif" :class="{ 'hmi__grupo--apagado': foco === 'provento' }">
          <rect x="126" :y="CY - 17" width="68" height="34" rx="12" fill="var(--nu-agora-bg)" :stroke="corVoce" stroke-opacity="0.7" stroke-width="1.3" />
          <text x="160" :y="CY - 2" text-anchor="middle" class="hmi__pp">{{ ppComSinal(diferenca!) }}</text>
          <text x="160" :y="CY + 11" text-anchor="middle" class="hmi__relacao">{{ frente.lider === 'empate' ? 'empate' : frente.relacao.replace(' da bolsa', '') }}</text>
        </g>
      </a>

      <!-- a escala: o miolo inteiro é a escala do dia -->
      <text v-if="!carregando" x="160" y="140" text-anchor="middle" class="hmi__marca">miolo cheio = {{ escala }}%</text>

      <!-- o provento: um logo pequeno com o miolo verde; leva à renda passiva -->
      <a href="/carteira#renda-passiva" class="hmi__link" @click="ir('/carteira#renda-passiva', $event)">
        <g class="hmi__grupo" :class="{ 'hmi__grupo--apagado': apagado('provento') }" @mouseenter="foco = 'provento'">
          <rect x="80" y="184" width="160" height="22" fill="transparent" />
          <g :transform="transformDoLogo(98, 195, 18)" class="hmi__moeda">
            <path v-for="(d, i) in PECAS" :key="i" :d="d" fill="none" :stroke="carregando ? BRANCO : VERDE" :stroke-opacity="carregando ? 0.14 : 0.7" stroke-width="1.1" vector-effect="non-scaling-stroke" />
            <path v-if="provento && !carregando" :d="MIOLO_DO_LOGO" :fill="VERDE" />
          </g>
          <text v-if="!carregando" x="113" y="199" class="hmi__prov">
            <tspan :fill="VERDE" font-weight="800">provento</tspan><tspan class="hmi__prov-sub" dx="5">{{ proventoSub ? `· ${proventoSub}` : '' }}</tspan>
          </text>
        </g>
      </a>
    </svg>
    <div v-if="dica" class="hmi__dica" :style="{ left: dica.esquerda, top: dica.topo }" aria-hidden="true">{{ dica.texto }}</div>
  </figure>
</template>

<style scoped>
.hmi { position: relative; margin: 0; width: 100%; }
.hmi__svg { display: block; width: 100%; height: auto; overflow: visible; }
.hmi__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.hmi__link { cursor: pointer; outline: none; }
.hmi__link:focus-visible .hmi__grupo { filter: drop-shadow(0 0 3px var(--nu-agora-azul)); }

.hmi__nome { font-size: 13px; font-weight: 800; letter-spacing: -0.01em; }
.hmi__num { font-size: 22px; font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.hmi__pp { font-size: 12px; font-weight: 800; fill: var(--nu-agora-texto); font-variant-numeric: tabular-nums; }
.hmi__relacao { font-size: 10.5px; font-weight: 700; fill: var(--nu-agora-sub); }
.hmi__marca { font-size: 10.5px; font-weight: 700; fill: var(--nu-agora-sub); }
.hmi__prov { font-size: 12px; }
.hmi__prov-sub { fill: var(--nu-agora-sub); font-weight: 700; }
.hmi__luz { filter: drop-shadow(0 0 8px color-mix(in srgb, currentColor 50%, transparent)); }

.hmi__grupo, .hmi__dif { transition: opacity .15s ease; }
.hmi__grupo--apagado { opacity: .3; }

/* a chegada: o miolo acende de dentro para fora, uma vez; depois os números */
.hmi__luz { transform: scale(0); transition: transform .8s cubic-bezier(.2, .8, .2, 1); }
.hmi--visivel .hmi__luz { transform: none; }
.hmi__rotulo, .hmi__dif { opacity: 0; transition: opacity .3s ease .75s; }
.hmi--visivel .hmi__rotulo, .hmi--visivel .hmi__dif { opacity: 1; }
.hmi--visivel .hmi__dif.hmi__grupo--apagado { opacity: .3; }

/* antes da abertura: o pregão anterior, esmaecido */
.hmi--esmaecido .hmi__luz, .hmi--esmaecido .hmi__dif, .hmi--esmaecido .hmi__moeda { opacity: .55; }

.hmi__dica {
  position: absolute; transform: translate(-50%, -100%); pointer-events: none; width: max-content; max-width: 60%; text-align: center; text-wrap: balance; z-index: 1;
  padding: 7px 12px; border-radius: var(--nu-r-chip); background: var(--nu-agora-cartao); color: var(--nu-agora-texto);
  box-shadow: 0 0 0 1px var(--nu-agora-linha), 0 12px 28px -12px var(--nu-agora-bg);
  font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .hmi__luz, .hmi__rotulo, .hmi__dif, .hmi__grupo { transition: none !important; }
}
</style>

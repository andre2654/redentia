<script setup lang="ts">
// ESBOÇO 6 para o lugar dos anéis (04/11/2026, ?aneis=6 no dev): a
// constelação. Duas fileiras de logos pequenos da Redentia, a de cima você e a
// de baixo a bolsa, com o zero no meio: os logos acendem para a esquerda na
// queda e para a direita na alta, cada um valendo uma fração fixa (0,25% num
// dia comum; 0,5% ou 0,75% quando o dia passa de 3% ou de 6%), e o último
// acende só em parte. Dá para contar: −1,44% são cinco logos e três quartos.
// A diferença fica entre as duas fileiras, bem onde elas terminam, num chip em
// p.p. O provento é o logo maior da linha de baixo, que acende verde.
import { pctComSinal } from '~/utils/diaDaCarteira'
import { PECAS_DO_LOGO, transformDoLogo } from '~/utils/marcaRedentia'
import { dicaDoDia, diferencaEmPP, escalaDoDia, faladoDoDia, losangosDoDia, ppComSinal, quemNaFrente } from '~/utils/placarDoDia'

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
const uid = `hco${useId()}`
const PECAS = [PECAS_DO_LOGO.esquerda, PECAS_DO_LOGO.direita, PECAS_DO_LOGO.cima, PECAS_DO_LOGO.baixo]

// o quadro: 320 × 206; o zero em x = 160; 12 logos de 9,6 por lado, de 11 em 11
const X0 = 160
const POR_LADO = 12
const PASSO = 11
const TAM = 10.2
const Y_VOCE = 76
const Y_BOLSA = 128
const xDoSlot = (lado: -1 | 1, i: number) => X0 + lado * (i + 0.5) * PASSO
const slots = (y: number) => ([-1, 1] as const).flatMap((lado) => Array.from({ length: POR_LADO }, (_, i) => ({ lado, i, x: xDoSlot(lado, i), y })))

const escala = computed(() => escalaDoDia([props.voce, props.bolsa]))
const unidade = computed(() => (escala.value / POR_LADO).toLocaleString('pt-BR'))
const fileira = (v: number | null, chave: 'voce' | 'bolsa', y: number, cor: string) => {
  if (v == null || props.carregando) return null
  const l = losangosDoDia(v, escala.value, POR_LADO)
  const lado: -1 | 1 = v < 0 ? -1 : 1
  const acesos = Array.from({ length: l.cheios }, (_, i) => ({ i, x: xDoSlot(lado, i) }))
  const parcial = l.fracao > 0 ? { i: l.cheios, x: xDoSlot(lado, l.cheios), fracao: l.fracao } : null
  const fim = X0 + lado * (l.cheios + l.fracao) * PASSO
  return { chave, v, y, cor, lado, acesos, parcial, fim, passou: l.passou }
}
const fVoce = computed(() => fileira(props.voce, 'voce', Y_VOCE, corVoce.value))
const fBolsa = computed(() => fileira(props.bolsa, 'bolsa', Y_BOLSA, BRANCO))
const fileiras = computed(() => [fVoce.value, fBolsa.value].filter((f): f is NonNullable<typeof f> => f != null))
/** o centro do rótulo, preso no quadro (o número de 20 tem ~11,5 por caractere) */
const xTexto = (x: number, v: number) => {
  const meia = Math.max(30, pctComSinal(v).length * 5.9)
  return Math.max(4 + meia, Math.min(316 - meia, x))
}

const diferenca = computed(() => diferencaEmPP(props.voce, props.bolsa))
const frente = computed(() => quemNaFrente(props.voce, props.bolsa))
const chip = computed(() => {
  const a = fVoce.value
  const b = fBolsa.value
  if (!a || !b || diferenca.value == null) return null
  return { x: Math.max(56, Math.min(264, (a.fim + b.fim) / 2)), texto: ppComSinal(diferenca.value) }
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
  const f = foco.value === 'voce' ? fVoce.value : foco.value === 'bolsa' ? fBolsa.value : null
  const x = f ? f.fim : 60
  const y = foco.value === 'voce' ? 2 : foco.value === 'bolsa' ? 180 : 168
  return { texto, esquerda: `${Math.max(30, Math.min(70, (x / 320) * 100))}%`, topo: `${(y / 206) * 100}%`, cima: foco.value !== 'bolsa' }
})

const falado = computed(() => faladoDoDia(props.voce, props.bolsa, props.provento))

function ir(destino: string, e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  void navigateTo(destino)
}
</script>

<template>
  <figure class="hco" :class="{ 'hco--esmaecido': esmaecido, 'hco--carregando': carregando, 'hco--visivel': visivel }">
    <figcaption class="hco__sr">{{ falado }}</figcaption>
    <svg viewBox="0 0 320 206" class="hco__svg" aria-hidden="true" @mouseleave="foco = null">
      <defs>
        <!-- o pedaço aceso do último logo de cada fileira, do lado do zero -->
        <template v-for="f in fileiras" :key="f.chave">
          <clipPath v-if="f.parcial" :id="`${uid}-${f.chave}`">
            <rect
              :x="f.lado < 0 ? f.parcial.x + TAM / 2 - f.parcial.fracao * TAM : f.parcial.x - TAM / 2"
              :y="f.y - TAM" :width="f.parcial.fracao * TAM" :height="TAM * 2"
            />
          </clipPath>
        </template>
      </defs>

      <!-- o zero: a linha entre os dois lados -->
      <line :x1="X0" :x2="X0" :y1="Y_VOCE - 12" :y2="Y_BOLSA + 12" stroke="#fff" :stroke-opacity="carregando ? 0.2 : 0.5" stroke-width="1.5" stroke-dasharray="3 3" />

      <!-- os trilhos: os 24 lugares de cada fileira, apagados -->
      <g v-for="y in [Y_VOCE, Y_BOLSA]" :key="y" :class="{ 'hco__grupo--apagado': (y === Y_VOCE && apagado('voce')) || (y === Y_BOLSA && apagado('bolsa')) }" class="hco__grupo">
        <g v-for="s in slots(y)" :key="`${s.lado}${s.i}`" :transform="transformDoLogo(s.x, s.y, TAM)">
          <path v-for="(d, i) in PECAS" :key="i" :d="d" :fill="BRANCO" :fill-opacity="carregando ? 0.06 : 0.11" />
        </g>
      </g>

      <!-- você e a bolsa: levam à /carteira -->
      <a href="/carteira" class="hco__link" @click="ir('/carteira', $event)">
        <g v-for="f in fileiras" :key="f.chave" class="hco__grupo" :class="{ 'hco__grupo--apagado': apagado(f.chave) }" @mouseenter="foco = f.chave">
          <rect x="0" :y="f.chave === 'voce' ? 26 : Y_BOLSA - 10" width="320" :height="f.chave === 'voce' ? Y_VOCE - 16 : 58" fill="transparent" />
          <g
            v-for="a in f.acesos" :key="a.i" class="hco__aceso"
            :style="{ transitionDelay: `${(f.chave === 'bolsa' ? 120 : 0) + a.i * 45}ms` }"
          >
            <g :transform="transformDoLogo(a.x, f.y, TAM)">
              <path v-for="(d, i) in PECAS" :key="i" :d="d" :fill="f.cor" />
            </g>
          </g>
          <g
            v-if="f.parcial" class="hco__aceso" :clip-path="`url(#${uid}-${f.chave})`"
            :style="{ transitionDelay: `${(f.chave === 'bolsa' ? 120 : 0) + f.parcial.i * 45}ms` }"
          >
            <g :transform="transformDoLogo(f.parcial.x, f.y, TAM)">
              <path v-for="(d, i) in PECAS" :key="i" :d="d" :fill="f.cor" />
            </g>
          </g>
          <path
            v-if="f.passou"
            :d="f.lado > 0 ? `M${X0 + POR_LADO * PASSO + 3} ${f.y - 4} l4 4 l-4 4` : `M${X0 - POR_LADO * PASSO - 3} ${f.y - 4} l-4 4 l4 4`"
            fill="none" :stroke="f.cor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="hco__rotulo"
          />
          <g class="hco__rotulo">
            <template v-if="f.chave === 'voce'">
              <text :x="xTexto(f.fim, f.v)" y="40" text-anchor="middle" class="hco__nome" :fill="f.cor">você</text>
              <text :x="xTexto(f.fim, f.v)" y="61" text-anchor="middle" class="hco__num" :fill="f.cor">{{ pctComSinal(f.v) }}</text>
            </template>
            <template v-else>
              <text :x="xTexto(f.fim, f.v)" y="158" text-anchor="middle" class="hco__num" :fill="f.cor">{{ pctComSinal(f.v) }}</text>
              <text :x="xTexto(f.fim, f.v)" y="173" text-anchor="middle" class="hco__nome" :fill="f.cor">bolsa</text>
            </template>
          </g>
        </g>

        <!-- a diferença: entre as fileiras, onde elas terminam -->
        <g v-if="chip" class="hco__dif" :class="{ 'hco__grupo--apagado': foco === 'provento' }">
          <rect :x="chip.x - 50" :y="(Y_VOCE + Y_BOLSA) / 2 - 16" width="100" height="32" rx="12" fill="var(--nu-agora-bg)" :stroke="corVoce" stroke-opacity="0.7" stroke-width="1.3" />
          <text :x="chip.x" :y="(Y_VOCE + Y_BOLSA) / 2 - 2" text-anchor="middle" class="hco__pp">{{ chip.texto }}</text>
          <text v-if="frente" :x="chip.x" :y="(Y_VOCE + Y_BOLSA) / 2 + 10" text-anchor="middle" class="hco__relacao">{{ frente.lider === 'empate' ? 'empate' : frente.relacao }}</text>
        </g>
      </a>

      <!-- a legenda: quanto vale cada logo -->
      <g v-if="!carregando" class="hco__legenda">
        <g :transform="transformDoLogo(244, 196, 9.6)">
          <path v-for="(d, i) in PECAS" :key="i" :d="d" :fill="BRANCO" fill-opacity=".6" />
        </g>
        <text x="252" y="200" class="hco__marca">= {{ unidade }}%</text>
      </g>

      <!-- o provento: o logo maior da linha de baixo; leva à renda passiva -->
      <a href="/carteira#renda-passiva" class="hco__link" @click="ir('/carteira#renda-passiva', $event)">
        <g class="hco__grupo" :class="{ 'hco__grupo--apagado': apagado('provento') }" @mouseenter="foco = 'provento'">
          <rect x="6" y="184" width="200" height="22" fill="transparent" />
          <g :transform="transformDoLogo(20, 195, 18)" class="hco__moeda">
            <path
              v-for="(d, i) in PECAS" :key="i" :d="d"
              :fill="provento && !carregando ? VERDE : 'none'" :stroke="carregando ? BRANCO : VERDE"
              :stroke-opacity="carregando ? 0.14 : provento ? 1 : 0.6" stroke-width="1.1" vector-effect="non-scaling-stroke"
            />
          </g>
          <text v-if="!carregando" x="36" y="199" class="hco__prov">
            <tspan :fill="VERDE" font-weight="800">provento</tspan><tspan class="hco__prov-sub" dx="5">{{ proventoSub ? `· ${proventoSub}` : '' }}</tspan>
          </text>
          <rect v-else x="36" y="189" width="110" height="12" rx="6" :fill="BRANCO" fill-opacity="0.08" />
        </g>
      </a>
    </svg>
    <div v-if="dica" class="hco__dica" :class="{ 'hco__dica--cima': dica.cima }" :style="{ left: dica.esquerda, top: dica.topo }" aria-hidden="true">{{ dica.texto }}</div>
  </figure>
</template>

<style scoped>
.hco { position: relative; margin: 0; width: 100%; }
.hco__svg { display: block; width: 100%; height: auto; overflow: visible; }
.hco__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.hco__link { cursor: pointer; outline: none; }
.hco__link:focus-visible .hco__grupo { filter: drop-shadow(0 0 3px var(--nu-agora-azul)); }

.hco__nome { font-size: 12px; font-weight: 800; letter-spacing: -0.01em; }
.hco__num { font-size: 20px; font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.hco__pp { font-size: 12px; font-weight: 800; fill: var(--nu-agora-texto); font-variant-numeric: tabular-nums; }
.hco__relacao { font-size: 10.5px; font-weight: 700; fill: var(--nu-agora-sub); }
.hco__marca { font-size: 11px; font-weight: 700; fill: var(--nu-agora-sub); font-variant-numeric: tabular-nums; }
.hco__prov { font-size: 12px; }
.hco__prov-sub { fill: var(--nu-agora-sub); font-weight: 700; }

.hco__grupo, .hco__dif { transition: opacity .15s ease; }
.hco__grupo--apagado { opacity: .3; }

/* a chegada: os logos acendem um por um, do zero para fora, uma vez */
.hco__aceso { opacity: 0; transition: opacity .25s ease; }
.hco--visivel .hco__aceso { opacity: 1; }
.hco__rotulo, .hco__dif { opacity: 0; transition: opacity .3s ease .7s; }
.hco--visivel .hco__rotulo, .hco--visivel .hco__dif { opacity: 1; }
.hco--visivel .hco__dif.hco__grupo--apagado { opacity: .3; }

/* antes da abertura: o pregão anterior, esmaecido */
.hco--esmaecido .hco__aceso, .hco--esmaecido .hco__dif, .hco--esmaecido .hco__moeda { opacity: .55; }

.hco__dica {
  position: absolute; transform: translate(-50%, 0); pointer-events: none; width: max-content; max-width: 60%; text-align: center; text-wrap: balance; z-index: 1;
  padding: 7px 12px; border-radius: var(--nu-r-chip); background: var(--nu-agora-cartao); color: var(--nu-agora-texto);
  box-shadow: 0 0 0 1px var(--nu-agora-linha), 0 12px 28px -12px var(--nu-agora-bg);
  font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums;
}
.hco__dica--cima { transform: translate(-50%, -100%); }

@media (prefers-reduced-motion: reduce) {
  .hco__aceso, .hco__rotulo, .hco__dif, .hco__grupo { transition: none !important; }
}
</style>

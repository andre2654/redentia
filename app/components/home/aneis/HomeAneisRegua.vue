<script setup lang="ts">
// ESBOÇO 1 de 4 para o lugar dos anéis (03/11/2026, ?aneis=1 no dev). O dono:
// "esse está muito perto do ícone de gym da Apple". A régua do zero: um eixo
// com o zero no centro, a queda à esquerda e a alta à direita. Dois marcadores
// de luz deslizam do zero até o seu %: você por cima do eixo (rosa na queda,
// verde na alta), a bolsa por baixo (branco). O trecho entre eles é a diferença,
// com o número em p.p. num chip sobre o eixo; quando o trecho é curto demais
// para caber o chip, ele sai para o lado, preso ao eixo. O provento é a moeda
// da linha de baixo, que acende verde no dia em que cai um pagamento.
// Escala: ±3% num dia comum (a linha do dia dos apps), 6 ou 9 quando o dia
// passa disso; acima de 9 o marcador fica na borda, com a seta (utils/placarDoDia.ts).
import { pctComSinal } from '~/utils/diaDaCarteira'
import { dicaDoDia, escalaDoDia, marcasDaEscala, posicaoNaEscala, ppComSinal, quemNaFrente, diferencaEmPP } from '~/utils/placarDoDia'

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
const uid = `hrg${useId()}`

// o quadro: 320 × 206; o eixo em y = 100, de 28 a 292, o zero em 160
const X0 = 160
const MEIO = 132
const EIXO = 100
/** o centro do chip da diferença, acima do eixo */
const CHIP_Y = 70
const escala = computed(() => escalaDoDia([props.voce, props.bolsa]))
const marcas = computed(() => marcasDaEscala(escala.value))
const xDe = (f: number) => X0 + f * MEIO
/** o texto não sai do quadro: o número de 22 tem ~12,5 por caractere ("+11,30%" mede ~88) */
const xTexto = (x: number, v: number | null = null) => {
  const meia = Math.max(40, (v == null ? 6 : pctComSinal(v).length) * 6.4)
  return Math.max(4 + meia, Math.min(316 - meia, x))
}

const montado = ref(false)
onMounted(() => { requestAnimationFrame(() => { montado.value = true }) })
const visivel = computed(() => montado.value && !props.carregando)

const marca = (v: number | null) => {
  if (v == null) return null
  const p = posicaoNaEscala(v, escala.value)
  return { x: xDe(p.f), passou: p.passou, lado: Math.sign(p.f) }
}
const mVoce = computed(() => (props.carregando ? null : marca(props.voce)))
const mBolsa = computed(() => (props.carregando ? null : marca(props.bolsa)))

// a diferença: o trecho no eixo e o chip com o número
const diferenca = computed(() => diferencaEmPP(props.voce, props.bolsa))
const frente = computed(() => quemNaFrente(props.voce, props.bolsa))
const chip = computed(() => {
  const a = mVoce.value
  const b = mBolsa.value
  if (!a || !b || diferenca.value == null) return null
  const meio = (a.x + b.x) / 2
  // o chip fica acima do eixo, no meio do trecho, preso a ele por um fio; se
  // ali ele cobriria a haste de você, sai para o lado com mais espaço
  const x = Math.abs(meio - a.x) >= 56 ? meio : a.x + (292 - a.x >= a.x - 28 ? 60 : -60)
  return {
    meio, x: Math.max(78, Math.min(242, x)),
    de: Math.min(a.x, b.x), ate: Math.max(a.x, b.x), texto: ppComSinal(diferenca.value),
  }
})

const foco = ref<'voce' | 'bolsa' | 'provento' | null>(null)
const apagado = (c: 'voce' | 'bolsa' | 'provento') => foco.value != null && foco.value !== c
const dica = computed(() => {
  if (!foco.value || props.carregando) return null
  const texto = dicaDoDia(foco.value, props)
  if (!texto) return null
  const x = foco.value === 'voce' ? mVoce.value?.x : foco.value === 'bolsa' ? mBolsa.value?.x : 92
  const y = foco.value === 'voce' ? 4 : foco.value === 'bolsa' ? 130 : 176
  return { texto, esquerda: `${Math.max(30, Math.min(70, ((Math.max(70, Math.min(250, x ?? X0)) / 320) * 100)))}%`, topo: `${(y / 206) * 100}%` }
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
  <figure class="hrg" :class="{ 'hrg--esmaecido': esmaecido, 'hrg--carregando': carregando, 'hrg--visivel': visivel }">
    <figcaption class="hrg__sr">{{ falado }}</figcaption>
    <svg viewBox="0 0 320 206" class="hrg__svg" aria-hidden="true" @mouseleave="foco = null">
      <defs>
        <!-- a haste de luz de cada marcador (um id por instância: a página de dev põe várias juntas) -->
        <linearGradient :id="`${uid}-voce`" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" :stop-color="corVoce" stop-opacity=".9" />
          <stop offset="1" :stop-color="corVoce" stop-opacity="0" />
        </linearGradient>
        <linearGradient :id="`${uid}-bolsa`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" :stop-color="BRANCO" stop-opacity=".9" />
          <stop offset="1" :stop-color="BRANCO" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- o eixo, as marcas e o zero -->
      <line x1="28" :y1="EIXO" x2="292" :y2="EIXO" :stroke="BRANCO" :stroke-opacity="carregando ? 0.12 : 0.24" stroke-width="2" stroke-linecap="round" />
      <g v-for="m in marcas" :key="m.f">
        <line
          :x1="xDe(m.f)" :x2="xDe(m.f)" :y1="m.f === 0 ? EIXO - 9 : EIXO - 4" :y2="m.f === 0 ? EIXO + 9 : EIXO + 4"
          :stroke="BRANCO" :stroke-opacity="m.f === 0 ? 0.6 : 0.24" :stroke-width="m.f === 0 ? 2 : 1.5" stroke-linecap="round"
        />
        <text
          v-if="!carregando && (m.f === 0 || Math.abs(m.f) === 1)"
          :x="xDe(m.f)" :y="EIXO + 24" text-anchor="middle" class="hrg__marca"
        >{{ m.rotulo }}</text>
      </g>

      <!-- carregando: o lugar dos números, sem número -->
      <template v-if="carregando">
        <rect x="104" y="24" width="80" height="22" rx="8" :fill="BRANCO" fill-opacity="0.08" />
        <rect x="136" y="148" width="80" height="22" rx="8" :fill="BRANCO" fill-opacity="0.08" />
      </template>

      <!-- você e a bolsa: levam à /carteira -->
      <a href="/carteira" class="hrg__link" @click="ir('/carteira', $event)">
        <!-- a diferença: o trecho entre os dois marcadores -->
        <g v-if="chip" class="hrg__dif" :class="{ 'hrg__grupo--apagado': foco === 'provento' }">
          <line :x1="chip.de" :x2="chip.ate" :y1="EIXO" :y2="EIXO" :stroke="corVoce" stroke-width="6" stroke-linecap="round" />
          <path :d="`M${chip.meio} ${EIXO - 5} L${chip.x} ${CHIP_Y + 17}`" fill="none" :stroke="corVoce" stroke-opacity="0.6" stroke-width="1.3" stroke-linecap="round" />
          <rect :x="chip.x - 50" :y="CHIP_Y - 17" width="100" height="34" rx="12" fill="var(--nu-agora-bg)" :stroke="corVoce" stroke-opacity="0.7" stroke-width="1.3" />
          <text :x="chip.x" :y="CHIP_Y - 2" text-anchor="middle" class="hrg__pp">{{ chip.texto }}</text>
          <text v-if="frente" :x="chip.x" :y="CHIP_Y + 11" text-anchor="middle" class="hrg__relacao">{{ frente.lider === 'empate' ? 'empate' : frente.relacao }}</text>
        </g>

        <!-- a bolsa, por baixo do eixo -->
        <g v-if="mBolsa" class="hrg__grupo" :class="{ 'hrg__grupo--apagado': apagado('bolsa') }" @mouseenter="foco = 'bolsa'">
          <rect :x="xTexto(mBolsa.x, bolsa) - 48" y="96" width="96" height="86" fill="transparent" />
          <g class="hrg__marcador" :style="{ transform: `translateX(${visivel ? mBolsa.x - X0 : 0}px)`, color: BRANCO }">
            <rect :x="X0 - 1.5" :y="EIXO" width="3" height="40" :fill="`url(#${uid}-bolsa)`" />
            <circle :cx="X0" :cy="EIXO" r="11" :fill="BRANCO" fill-opacity="0.14" />
            <circle :cx="X0" :cy="EIXO" r="5.5" :fill="BRANCO" />
            <path v-if="mBolsa.passou" :d="mBolsa.lado > 0 ? `M${X0 + 12} ${EIXO - 5} l6 5 l-6 5` : `M${X0 - 12} ${EIXO - 5} l-6 5 l6 5`" fill="none" :stroke="BRANCO" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </g>
          <g class="hrg__rotulo">
            <text :x="xTexto(mBolsa.x, bolsa)" y="162" text-anchor="middle" class="hrg__num" :fill="BRANCO">{{ pctComSinal(bolsa!) }}</text>
            <text :x="xTexto(mBolsa.x, bolsa)" y="178" text-anchor="middle" class="hrg__nome" :fill="BRANCO">bolsa</text>
          </g>
        </g>

        <!-- você, por cima do eixo -->
        <g v-if="mVoce" class="hrg__grupo" :class="{ 'hrg__grupo--apagado': apagado('voce') }" @mouseenter="foco = 'voce'">
          <rect :x="xTexto(mVoce.x, voce) - 48" y="4" width="96" height="100" fill="transparent" />
          <g class="hrg__marcador" :style="{ transform: `translateX(${visivel ? mVoce.x - X0 : 0}px)`, color: corVoce }">
            <rect :x="X0 - 1.5" :y="EIXO - 40" width="3" height="40" :fill="`url(#${uid}-voce)`" />
            <circle :cx="X0" :cy="EIXO" r="13" :fill="corVoce" fill-opacity="0.2" />
            <circle :cx="X0" :cy="EIXO" r="6.5" :fill="corVoce" />
            <path v-if="mVoce.passou" :d="mVoce.lado > 0 ? `M${X0 + 14} ${EIXO - 5} l6 5 l-6 5` : `M${X0 - 14} ${EIXO - 5} l-6 5 l6 5`" fill="none" :stroke="corVoce" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </g>
          <g class="hrg__rotulo">
            <text :x="xTexto(mVoce.x, voce)" y="20" text-anchor="middle" class="hrg__nome" :fill="corVoce">você</text>
            <text :x="xTexto(mVoce.x, voce)" y="43" text-anchor="middle" class="hrg__num" :fill="corVoce">{{ pctComSinal(voce!) }}</text>
          </g>
        </g>
      </a>

      <!-- o provento: a moeda da linha de baixo; leva à renda passiva -->
      <a href="/carteira#renda-passiva" class="hrg__link" @click="ir('/carteira#renda-passiva', $event)">
        <g class="hrg__grupo" :class="{ 'hrg__grupo--apagado': apagado('provento') }" @mouseenter="foco = 'provento'">
          <rect x="16" y="184" width="200" height="22" fill="transparent" />
          <circle cx="36" cy="195" r="9" :fill="provento && !carregando ? VERDE : 'none'" :stroke="carregando ? BRANCO : VERDE" :stroke-opacity="carregando ? 0.12 : provento ? 1 : 0.5" stroke-width="1.6" class="hrg__moeda" />
          <text v-if="!carregando" x="36" y="195.5" text-anchor="middle" dominant-baseline="central" class="hrg__cifrao" :fill="provento ? 'var(--nu-agora-bg)' : VERDE">$</text>
          <text v-if="!carregando" x="52" y="199" class="hrg__prov">
            <tspan :fill="VERDE" font-weight="800">provento</tspan><tspan class="hrg__prov-sub" dx="5">{{ proventoSub ? `· ${proventoSub}` : '' }}</tspan>
          </text>
          <rect v-else x="52" y="189" width="110" height="12" rx="6" :fill="BRANCO" fill-opacity="0.08" />
        </g>
      </a>
    </svg>
    <div v-if="dica" class="hrg__dica" :style="{ left: dica.esquerda, top: dica.topo }" aria-hidden="true">{{ dica.texto }}</div>
  </figure>
</template>

<style scoped>
.hrg { position: relative; margin: 0; width: 100%; }
.hrg__svg { display: block; width: 100%; height: auto; overflow: visible; }
.hrg__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.hrg__link { cursor: pointer; outline: none; }
.hrg__link:focus-visible .hrg__grupo { filter: drop-shadow(0 0 3px var(--nu-agora-azul)); }

/* o texto do desenho cresce com o quadro, como nos anéis (o quadro é de 320) */
.hrg__nome { font-size: 12px; font-weight: 800; letter-spacing: -0.01em; }
.hrg__num { font-size: 22px; font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.hrg__pp { font-size: 12px; font-weight: 800; fill: var(--nu-agora-texto); font-variant-numeric: tabular-nums; }
.hrg__relacao { font-size: 11px; font-weight: 700; fill: var(--nu-agora-sub); }
.hrg__marca { font-size: 11px; font-weight: 700; fill: var(--nu-agora-sub); font-variant-numeric: tabular-nums; }
.hrg__cifrao { font-size: 11px; font-weight: 800; }
.hrg__prov { font-size: 12px; }
.hrg__prov-sub { fill: var(--nu-agora-sub); font-weight: 700; }

.hrg__grupo, .hrg__dif { transition: opacity .15s ease; }
.hrg__grupo--apagado { opacity: .3; }

/* a chegada: os marcadores saem do zero e deslizam até o seu %; depois o trecho e os rótulos */
.hrg__marcador { transition: transform .8s cubic-bezier(.22, 1, .36, 1), opacity .2s ease; opacity: 0; }
.hrg--visivel .hrg__marcador { opacity: 1; }
.hrg__rotulo, .hrg__dif { opacity: 0; transition: opacity .3s ease .75s; }
.hrg--visivel .hrg__rotulo, .hrg--visivel .hrg__dif { opacity: 1; }
.hrg--visivel .hrg__dif.hrg__grupo--apagado { opacity: .3; }

/* antes da abertura: o pregão anterior, esmaecido */
.hrg--esmaecido .hrg__marcador, .hrg--esmaecido .hrg__dif, .hrg--esmaecido .hrg__moeda { opacity: .55; }

.hrg__dica {
  position: absolute; transform: translate(-50%, -100%); pointer-events: none; width: max-content; max-width: 60%; text-align: center; text-wrap: balance;
  padding: 7px 12px; border-radius: var(--nu-r-chip); background: var(--nu-agora-cartao); color: var(--nu-agora-texto);
  box-shadow: 0 0 0 1px var(--nu-agora-linha), 0 12px 28px -12px var(--nu-agora-bg);
  font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .hrg__marcador, .hrg__rotulo, .hrg__dif, .hrg__grupo { transition: none !important; }
}
</style>

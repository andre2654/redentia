<script setup lang="ts">
// ESBOÇO 5 para o lugar dos anéis (04/11/2026, ?aneis=5 no dev): o logo como
// ponteiro. Uma linha do zero com a queda à esquerda e a alta à direita; o
// logo da Redentia desliza sobre ela até o seu %. Você é o logo cheio, em rosa
// ou verde, pousado por cima da linha com a ponta de baixo no seu número; a
// bolsa é o logo vazado, em branco, pendurado por baixo com a ponta de cima no
// número dela. As duas pontas tocam a linha, e o trecho entre elas é a
// diferença, com o número em p.p. num chip. O provento é um logo pequeno na
// linha de baixo, que acende verde no dia em que cai um pagamento.
// Escala: 3% num dia comum, 6 ou 9 quando o dia passa disso; acima de 9 o logo
// para na borda e ganha a seta (utils/placarDoDia.ts).
import { pctComSinal } from '~/utils/diaDaCarteira'
import { LOGO, PECAS_DO_LOGO, transformDoLogo } from '~/utils/marcaRedentia'
import { dicaDoDia, diferencaEmPP, escalaDoDia, faladoDoDia, marcasDaEscala, posicaoNaEscala, ppComSinal, quemNaFrente } from '~/utils/placarDoDia'

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
const uid = `hpt${useId()}`
const PECAS = [PECAS_DO_LOGO.esquerda, PECAS_DO_LOGO.direita, PECAS_DO_LOGO.cima, PECAS_DO_LOGO.baixo]

// o quadro: 320 × 206; a linha em y = 102, de 28 a 292, o zero em 160
const X0 = 160
const MEIO = 132
const EIXO = 102
/** o lado do logo-ponteiro: 46 (a ponta fica a 23 do centro) */
const TAM = 46
const escala = computed(() => escalaDoDia([props.voce, props.bolsa]))
const marcas = computed(() => marcasDaEscala(escala.value))
const xDe = (f: number) => X0 + f * MEIO
/** o número de 20 tem ~11,5 por caractere: o rótulo não sai do quadro */
const xTexto = (x: number, v: number) => {
  const meia = Math.max(30, pctComSinal(v).length * 5.9)
  return Math.max(4 + meia, Math.min(316 - meia, x))
}

const montado = ref(false)
onMounted(() => { requestAnimationFrame(() => { montado.value = true }) })
const visivel = computed(() => montado.value && !props.carregando)

const marca = (v: number | null) => {
  if (v == null || props.carregando) return null
  const p = posicaoNaEscala(v, escala.value)
  return { x: xDe(p.f), passou: p.passou, lado: Math.sign(p.f), v }
}
const mVoce = computed(() => marca(props.voce))
const mBolsa = computed(() => marca(props.bolsa))

const diferenca = computed(() => diferencaEmPP(props.voce, props.bolsa))
const frente = computed(() => quemNaFrente(props.voce, props.bolsa))
// o chip fica sobre a linha; se ali cobriria um dos logos, sai para o lado com mais espaço
const chip = computed(() => {
  const a = mVoce.value
  const b = mBolsa.value
  if (!a || !b || diferenca.value == null) return null
  const meio = (a.x + b.x) / 2
  const livre = (x: number) => Math.abs(x - a.x) >= 50 + TAM / 2 + 4 && Math.abs(x - b.x) >= 50 + TAM / 2 + 4
  const lo = Math.min(a.x, b.x)
  const hi = Math.max(a.x, b.x)
  const opcoes = [meio, hi + 80, lo - 80].map((x) => Math.max(78, Math.min(242, x)))
  const x = opcoes.find(livre)
  // sem lugar livre na linha (os dois logos longe um do outro, no meio): o
  // chip desce para a linha de baixo, à direita, com o trecho na cor de você
  return x != null
    ? { x, y: EIXO, de: lo, ate: hi, texto: ppComSinal(diferenca.value) }
    : { x: 262, y: 192, de: lo, ate: hi, texto: ppComSinal(diferenca.value) }
})

const foco = ref<'voce' | 'bolsa' | 'provento' | null>(null)
const apagado = (c: 'voce' | 'bolsa' | 'provento') => foco.value != null && foco.value !== c
const dica = computed(() => {
  if (!foco.value || props.carregando) return null
  const texto = dicaDoDia(foco.value, props)
  if (!texto) return null
  const x = foco.value === 'voce' ? mVoce.value?.x : foco.value === 'bolsa' ? mBolsa.value?.x : 90
  const y = foco.value === 'voce' ? 2 : foco.value === 'bolsa' ? 186 : 170
  return { texto, esquerda: `${Math.max(30, Math.min(70, ((x ?? X0) / 320) * 100))}%`, topo: `${(y / 206) * 100}%`, cima: foco.value !== 'bolsa' }
})

const falado = computed(() => faladoDoDia(props.voce, props.bolsa, props.provento))

function ir(destino: string, e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  void navigateTo(destino)
}
</script>

<template>
  <figure class="hpt" :class="{ 'hpt--esmaecido': esmaecido, 'hpt--carregando': carregando, 'hpt--visivel': visivel }">
    <figcaption class="hpt__sr">{{ falado }}</figcaption>
    <svg viewBox="0 0 320 206" class="hpt__svg" aria-hidden="true" @mouseleave="foco = null">
      <defs>
        <!-- o degradê do logo, na cor de você: claro nas pontas, mais escuro no eixo -->
        <linearGradient :id="`${uid}-h`" gradientUnits="userSpaceOnUse" x1="0" y1="0" :x2="LOGO.lado" y2="0">
          <stop offset="0" :stop-color="corVoce" />
          <stop offset=".5" :stop-color="corVoce" stop-opacity=".62" />
          <stop offset="1" :stop-color="corVoce" />
        </linearGradient>
        <linearGradient :id="`${uid}-v`" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" :y2="LOGO.lado">
          <stop offset="0" :stop-color="corVoce" />
          <stop offset=".3" :stop-color="corVoce" stop-opacity=".78" />
          <stop offset=".7" :stop-color="corVoce" stop-opacity=".78" />
          <stop offset="1" :stop-color="corVoce" />
        </linearGradient>
      </defs>

      <!-- a linha do zero e as marcas -->
      <line x1="28" :y1="EIXO" x2="292" :y2="EIXO" :stroke="BRANCO" :stroke-opacity="carregando ? 0.12 : 0.24" stroke-width="2" stroke-linecap="round" />
      <g v-for="m in marcas" :key="m.f">
        <line
          :x1="xDe(m.f)" :x2="xDe(m.f)" :y1="m.f === 0 ? EIXO - 9 : EIXO - 4" :y2="m.f === 0 ? EIXO + 9 : EIXO + 4"
          :stroke="BRANCO" :stroke-opacity="m.f === 0 ? 0.6 : 0.24" :stroke-width="m.f === 0 ? 2 : 1.5" stroke-linecap="round"
        />
        <text v-if="!carregando && Math.abs(m.f) === 1" :x="xDe(m.f)" :y="EIXO + 20" text-anchor="middle" class="hpt__marca">{{ m.rotulo }}</text>
      </g>

      <!-- carregando: o lugar dos dois logos, vazados e parados no zero -->
      <template v-if="carregando">
        <g :transform="transformDoLogo(X0 - 34, EIXO - TAM / 2 - 1, TAM)">
          <path v-for="(d, i) in PECAS" :key="i" :d="d" fill="none" :stroke="BRANCO" stroke-opacity=".14" stroke-width="1.2" vector-effect="non-scaling-stroke" />
        </g>
        <g :transform="transformDoLogo(X0 + 34, EIXO + TAM / 2 + 1, TAM)">
          <path v-for="(d, i) in PECAS" :key="i" :d="d" fill="none" :stroke="BRANCO" stroke-opacity=".14" stroke-width="1.2" vector-effect="non-scaling-stroke" />
        </g>
      </template>

      <!-- você e a bolsa: levam à /carteira -->
      <a href="/carteira" class="hpt__link" @click="ir('/carteira', $event)">
        <!-- a diferença: o trecho entre as duas pontas e o chip -->
        <g v-if="chip" class="hpt__dif" :class="{ 'hpt__grupo--apagado': foco === 'provento' }">
          <line :x1="chip.de" :x2="chip.ate" :y1="EIXO" :y2="EIXO" :stroke="corVoce" stroke-width="5" stroke-linecap="round" />
          <rect :x="chip.x - 50" :y="chip.y - 16" width="100" height="32" rx="12" fill="var(--nu-agora-bg)" :stroke="corVoce" stroke-opacity="0.7" stroke-width="1.3" />
          <text :x="chip.x" :y="chip.y - 2" text-anchor="middle" class="hpt__pp">{{ chip.texto }}</text>
          <text v-if="frente" :x="chip.x" :y="chip.y + 10" text-anchor="middle" class="hpt__relacao">{{ frente.lider === 'empate' ? 'empate' : frente.relacao }}</text>
        </g>

        <!-- a bolsa: o logo vazado, pendurado por baixo da linha -->
        <g v-if="mBolsa" class="hpt__grupo" :class="{ 'hpt__grupo--apagado': apagado('bolsa') }" @mouseenter="foco = 'bolsa'">
          <rect :x="xTexto(mBolsa.x, mBolsa.v) - 44" :y="EIXO" width="88" height="86" fill="transparent" />
          <g class="hpt__marcador" :style="{ transform: `translateX(${visivel ? mBolsa.x - X0 : 0}px)` }">
            <g :transform="transformDoLogo(X0, EIXO + TAM / 2 + 1, TAM)">
              <path v-for="(d, i) in PECAS" :key="i" :d="d" :fill="BRANCO" fill-opacity=".06" :stroke="BRANCO" stroke-width="1.4" vector-effect="non-scaling-stroke" />
            </g>
            <path v-if="mBolsa.passou" :d="mBolsa.lado > 0 ? `M${X0 + 24} ${EIXO + 16} l6 5 l-6 5` : `M${X0 - 24} ${EIXO + 16} l-6 5 l6 5`" fill="none" :stroke="BRANCO" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </g>
          <g class="hpt__rotulo">
            <text :x="xTexto(mBolsa.x, mBolsa.v)" y="166" text-anchor="middle" class="hpt__num" :fill="BRANCO">{{ pctComSinal(mBolsa.v) }}</text>
            <text :x="xTexto(mBolsa.x, mBolsa.v)" y="181" text-anchor="middle" class="hpt__nome" :fill="BRANCO">bolsa</text>
          </g>
        </g>

        <!-- você: o logo cheio, pousado por cima da linha -->
        <g v-if="mVoce" class="hpt__grupo" :class="{ 'hpt__grupo--apagado': apagado('voce') }" @mouseenter="foco = 'voce'">
          <rect :x="xTexto(mVoce.x, mVoce.v) - 44" y="4" width="88" height="98" fill="transparent" />
          <g class="hpt__marcador" :style="{ transform: `translateX(${visivel ? mVoce.x - X0 : 0}px)` }">
            <g :transform="transformDoLogo(X0, EIXO - TAM / 2 - 1, TAM)" class="hpt__brilho" :style="{ color: corVoce }">
              <path :d="PECAS_DO_LOGO.esquerda" :fill="`url(#${uid}-h)`" />
              <path :d="PECAS_DO_LOGO.direita" :fill="`url(#${uid}-h)`" />
              <path :d="PECAS_DO_LOGO.cima" :fill="`url(#${uid}-v)`" />
              <path :d="PECAS_DO_LOGO.baixo" :fill="`url(#${uid}-v)`" />
            </g>
            <path v-if="mVoce.passou" :d="mVoce.lado > 0 ? `M${X0 + 24} ${EIXO - 26} l6 5 l-6 5` : `M${X0 - 24} ${EIXO - 26} l-6 5 l6 5`" fill="none" :stroke="corVoce" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </g>
          <g class="hpt__rotulo">
            <text :x="xTexto(mVoce.x, mVoce.v)" y="20" text-anchor="middle" class="hpt__nome" :fill="corVoce">você</text>
            <text :x="xTexto(mVoce.x, mVoce.v)" y="42" text-anchor="middle" class="hpt__num" :fill="corVoce">{{ pctComSinal(mVoce.v) }}</text>
          </g>
        </g>
      </a>

      <!-- o provento: um logo pequeno na linha de baixo; leva à renda passiva -->
      <a href="/carteira#renda-passiva" class="hpt__link" @click="ir('/carteira#renda-passiva', $event)">
        <g class="hpt__grupo" :class="{ 'hpt__grupo--apagado': apagado('provento') }" @mouseenter="foco = 'provento'">
          <rect x="14" y="186" width="210" height="20" fill="transparent" />
          <g :transform="transformDoLogo(30, 196, 18)" class="hpt__moeda">
            <path
              v-for="(d, i) in PECAS" :key="i" :d="d"
              :fill="provento && !carregando ? VERDE : 'none'" :stroke="carregando ? BRANCO : VERDE"
              :stroke-opacity="carregando ? 0.14 : provento ? 1 : 0.6" stroke-width="1.1" vector-effect="non-scaling-stroke"
            />
          </g>
          <text v-if="!carregando" x="46" y="200" class="hpt__prov">
            <tspan :fill="VERDE" font-weight="800">provento</tspan><tspan class="hpt__prov-sub" dx="5">{{ proventoSub ? `· ${proventoSub}` : '' }}</tspan>
          </text>
          <rect v-else x="46" y="190" width="110" height="12" rx="6" :fill="BRANCO" fill-opacity="0.08" />
        </g>
      </a>
    </svg>
    <div v-if="dica" class="hpt__dica" :class="{ 'hpt__dica--cima': dica.cima }" :style="{ left: dica.esquerda, top: dica.topo }" aria-hidden="true">{{ dica.texto }}</div>
  </figure>
</template>

<style scoped>
.hpt { position: relative; margin: 0; width: 100%; }
.hpt__svg { display: block; width: 100%; height: auto; overflow: visible; }
.hpt__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.hpt__link { cursor: pointer; outline: none; }
.hpt__link:focus-visible .hpt__grupo { filter: drop-shadow(0 0 3px var(--nu-agora-azul)); }

.hpt__nome { font-size: 12px; font-weight: 800; letter-spacing: -0.01em; }
.hpt__num { font-size: 20px; font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.hpt__pp { font-size: 12px; font-weight: 800; fill: var(--nu-agora-texto); font-variant-numeric: tabular-nums; }
.hpt__relacao { font-size: 10.5px; font-weight: 700; fill: var(--nu-agora-sub); }
.hpt__marca { font-size: 11px; font-weight: 700; fill: var(--nu-agora-sub); font-variant-numeric: tabular-nums; }
.hpt__prov { font-size: 12px; }
.hpt__prov-sub { fill: var(--nu-agora-sub); font-weight: 700; }
.hpt__brilho { filter: drop-shadow(0 0 6px color-mix(in srgb, currentColor 45%, transparent)); }

.hpt__grupo, .hpt__dif { transition: opacity .15s ease; }
.hpt__grupo--apagado { opacity: .3; }

/* a chegada: os dois logos saem do zero e deslizam até o seu %; depois o trecho e os números */
.hpt__marcador { transition: transform .85s cubic-bezier(.22, 1, .36, 1), opacity .2s ease; opacity: 0; }
.hpt--visivel .hpt__marcador { opacity: 1; }
.hpt__rotulo, .hpt__dif { opacity: 0; transition: opacity .3s ease .8s; }
.hpt--visivel .hpt__rotulo, .hpt--visivel .hpt__dif { opacity: 1; }
.hpt--visivel .hpt__dif.hpt__grupo--apagado { opacity: .3; }

/* antes da abertura: o pregão anterior, esmaecido */
.hpt--esmaecido .hpt__marcador, .hpt--esmaecido .hpt__dif, .hpt--esmaecido .hpt__moeda { opacity: .55; }

.hpt__dica {
  position: absolute; transform: translate(-50%, 0); pointer-events: none; width: max-content; max-width: 60%; text-align: center; text-wrap: balance; z-index: 1;
  padding: 7px 12px; border-radius: var(--nu-r-chip); background: var(--nu-agora-cartao); color: var(--nu-agora-texto);
  box-shadow: 0 0 0 1px var(--nu-agora-linha), 0 12px 28px -12px var(--nu-agora-bg);
  font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums;
}
.hpt__dica--cima { transform: translate(-50%, -100%); }

@media (prefers-reduced-motion: reduce) {
  .hpt__marcador, .hpt__rotulo, .hpt__dif, .hpt__grupo { transition: none !important; }
}
</style>

<script setup lang="ts">
// ESBOÇO 2 de 4 para o lugar dos anéis (03/11/2026, ?aneis=2 no dev): duas
// colunas de luz sobre um horizonte, no idioma de "A noite" do /benchmark-ia
// (BenchNoite). O horizonte é o zero, a linha de luz nas cores da barra; a
// coluna sobe na alta e desce na queda, com um reflexo fraco do outro lado.
// Você em rosa ou verde, a bolsa em branco, lado a lado na mesma régua: as duas
// pontas ganham um fio até um colchete à direita, que diz a diferença em p.p.
// O provento é a luz fina da esquerda: um ponto apagado no horizonte, que vira
// uma coluninha verde com o "$" no dia em que cai um pagamento.
// Escala: 3% num dia comum, 6 ou 9 quando o dia passa disso; acima de 9 a
// coluna para no teto e a ponta vira seta (utils/placarDoDia.ts).
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
const uid = `hcl${useId()}`

// o quadro: 320 × 206; o horizonte em y = 103; a coluna mais alta mede 70
const H0 = 103
const ALTURA = 70
const LARGURA = 38
const X_VOCE = 104
const X_BOLSA = 184
const X_COLCHETE = 218
const X_PROVENTO = 40

const escala = computed(() => escalaDoDia([props.voce, props.bolsa]))
const coluna = (v: number | null, x: number, cor: string, chave: 'voce' | 'bolsa') => {
  if (v == null || props.carregando) return null
  const p = posicaoNaEscala(v, escala.value)
  const h = Math.max(2, Math.abs(p.f) * ALTURA)
  const sobe = v >= 0
  return { chave, x, cor, h, sobe, passou: p.passou, ponta: sobe ? H0 - h : H0 + h, v }
}
const colunas = computed(() => [
  coluna(props.voce, X_VOCE, corVoce.value, 'voce'),
  coluna(props.bolsa, X_BOLSA, BRANCO, 'bolsa'),
].filter((c): c is NonNullable<typeof c> => c != null))
const cVoce = computed(() => colunas.value.find((c) => c.chave === 'voce') ?? null)
const cBolsa = computed(() => colunas.value.find((c) => c.chave === 'bolsa') ?? null)

const diferenca = computed(() => diferencaEmPP(props.voce, props.bolsa))
const frente = computed(() => quemNaFrente(props.voce, props.bolsa))
const colchete = computed(() => {
  const a = cVoce.value
  const b = cBolsa.value
  if (!a || !b || diferenca.value == null) return null
  const meio = (a.ponta + b.ponta) / 2
  return { de: a.ponta, ate: b.ponta, y: Math.max(26, Math.min(184, meio)), texto: ppComSinal(diferenca.value) }
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
  const c = foco.value === 'voce' ? cVoce.value : foco.value === 'bolsa' ? cBolsa.value : null
  const x = c ? c.x : X_PROVENTO + 40
  // a dica fica do lado vazio da coluna (acima do horizonte na queda)
  const y = c ? (c.sobe ? Math.min(H0 + 26, 186) : H0 - 30) : H0 - 44
  return { texto, esquerda: `${Math.max(30, Math.min(70, ((Math.max(80, Math.min(240, x)) / 320) * 100)))}%`, topo: `${(y / 206) * 100}%` }
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
  <figure class="hcl" :class="{ 'hcl--esmaecido': esmaecido, 'hcl--carregando': carregando, 'hcl--visivel': visivel }">
    <figcaption class="hcl__sr">{{ falado }}</figcaption>
    <svg viewBox="0 0 320 206" class="hcl__svg" aria-hidden="true" @mouseleave="foco = null">
      <defs>
        <!-- a luz de cada coluna e o reflexo (um id por instância: a página de dev põe várias juntas) -->
        <template v-for="c in colunas" :key="c.chave">
          <linearGradient :id="`${uid}-${c.chave}`" x1="0" :y1="c.sobe ? 1 : 0" x2="0" :y2="c.sobe ? 0 : 1">
            <stop offset="0" :stop-color="c.cor" stop-opacity=".35" />
            <stop offset="1" :stop-color="c.cor" stop-opacity=".95" />
          </linearGradient>
          <linearGradient :id="`${uid}-${c.chave}-reflexo`" x1="0" :y1="c.sobe ? 0 : 1" x2="0" :y2="c.sobe ? 1 : 0">
            <stop offset="0" :stop-color="c.cor" stop-opacity=".16" />
            <stop offset="1" :stop-color="c.cor" stop-opacity="0" />
          </linearGradient>
        </template>
        <linearGradient :id="`${uid}-provento`" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" :stop-color="VERDE" stop-opacity=".35" />
          <stop offset="1" :stop-color="VERDE" stop-opacity=".95" />
        </linearGradient>
        <linearGradient :id="`${uid}-horizonte`" gradientUnits="userSpaceOnUse" x1="4" y1="0" x2="316" y2="0">
          <stop offset="0" stop-color="var(--nu-chat-luz-1)" stop-opacity="0" />
          <stop offset=".22" stop-color="var(--nu-chat-luz-1)" />
          <stop offset=".5" stop-color="var(--nu-white-60)" />
          <stop offset=".78" stop-color="var(--nu-chat-luz-3)" />
          <stop offset="1" stop-color="var(--nu-chat-luz-3)" stop-opacity="0" />
        </linearGradient>
        <filter :id="`${uid}-brilho`" filterUnits="userSpaceOnUse" x="-10" :y="H0 - 30" width="340" height="60">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <!-- o horizonte: o zero -->
      <line x1="4" :y1="H0" x2="316" :y2="H0" :stroke="`url(#${uid}-horizonte)`" stroke-width="7" :filter="`url(#${uid}-brilho)`" :opacity="carregando ? 0.25 : 0.7" class="hcl__horizonte" />
      <line x1="4" :y1="H0" x2="316" :y2="H0" :stroke="`url(#${uid}-horizonte)`" stroke-width="1.6" :opacity="carregando ? 0.4 : 1" class="hcl__horizonte" />
      <text v-if="!carregando" x="6" :y="H0 - 7" class="hcl__zero">0</text>

      <!-- carregando: o lugar das colunas, parado e sem número -->
      <template v-if="carregando">
        <rect :x="X_VOCE - LARGURA / 2" :y="H0 + 2" :width="LARGURA" height="40" rx="6" :fill="BRANCO" fill-opacity="0.06" />
        <rect :x="X_BOLSA - LARGURA / 2" :y="H0 + 2" :width="LARGURA" height="40" rx="6" :fill="BRANCO" fill-opacity="0.06" />
      </template>

      <!-- você e a bolsa: levam à /carteira -->
      <a href="/carteira" class="hcl__link" @click="ir('/carteira', $event)">
        <!-- a diferença: o fio de cada ponta até o colchete -->
        <g v-if="colchete" class="hcl__dif" :class="{ 'hcl__grupo--apagado': foco === 'provento' }">
          <line :x1="X_VOCE + LARGURA / 2 + 3" :x2="X_COLCHETE" :y1="colchete.de" :y2="colchete.de" :stroke="corVoce" stroke-opacity="0.7" stroke-width="1.3" stroke-dasharray="2 3" />
          <line :x1="X_BOLSA + LARGURA / 2 + 3" :x2="X_COLCHETE" :y1="colchete.ate" :y2="colchete.ate" :stroke="BRANCO" stroke-opacity="0.7" stroke-width="1.3" stroke-dasharray="2 3" />
          <line :x1="X_COLCHETE" :x2="X_COLCHETE" :y1="colchete.de" :y2="colchete.ate" :stroke="corVoce" stroke-width="3" stroke-linecap="round" />
          <text :x="X_COLCHETE + 7" :y="colchete.y - 1" class="hcl__pp">{{ colchete.texto }}</text>
          <text v-if="frente" :x="X_COLCHETE + 7" :y="colchete.y + 13" class="hcl__relacao">{{ frente.lider === 'empate' ? 'empate' : frente.relacao }}</text>
        </g>

        <g
          v-for="c in colunas" :key="c.chave"
          class="hcl__grupo" :class="{ 'hcl__grupo--apagado': apagado(c.chave) }"
          :style="{ color: c.cor }"
          @mouseenter="foco = c.chave"
        >
          <rect :x="c.x - LARGURA / 2 - 6" y="6" :width="LARGURA + 12" height="194" fill="transparent" />
          <!-- o reflexo, do outro lado do horizonte -->
          <rect
            :x="c.x - LARGURA / 2" :y="c.sobe ? H0 : H0 - c.h * 0.4" :width="LARGURA" :height="c.h * 0.4"
            :fill="`url(#${uid}-${c.chave}-reflexo)`" class="hcl__reflexo"
          />
          <g class="hcl__pilar" :style="{ transformOrigin: `${c.x}px ${H0}px`, transitionDelay: c.chave === 'bolsa' ? '120ms' : '0ms' }">
            <rect
              :x="c.x - LARGURA / 2" :y="c.sobe ? c.ponta : H0" :width="LARGURA" :height="c.h"
              :fill="`url(#${uid}-${c.chave})`"
            />
            <!-- a ponta: a luz forte; no dia que passou do teto, uma seta -->
            <rect v-if="!c.passou" :x="c.x - LARGURA / 2" :y="c.sobe ? c.ponta : c.ponta - 2.5" :width="LARGURA" height="2.5" fill="currentColor" />
            <path
              v-else :d="c.sobe ? `M${c.x - LARGURA / 2} ${c.ponta + 6} L${c.x} ${c.ponta - 4} L${c.x + LARGURA / 2} ${c.ponta + 6}` : `M${c.x - LARGURA / 2} ${c.ponta - 6} L${c.x} ${c.ponta + 4} L${c.x + LARGURA / 2} ${c.ponta - 6}`"
              fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"
            />
          </g>
          <g class="hcl__rotulo">
            <text :x="c.x" :y="c.sobe ? c.ponta - 9 : c.ponta + 23" text-anchor="middle" class="hcl__num" fill="currentColor">{{ pctComSinal(c.v) }}</text>
            <text :x="c.x" :y="c.sobe ? H0 + 17 : H0 - 8" text-anchor="middle" class="hcl__nome" fill="currentColor">{{ c.chave === 'voce' ? 'você' : 'bolsa' }}</text>
          </g>
        </g>
      </a>

      <!-- o provento: a luz fina da esquerda; leva à renda passiva -->
      <a href="/carteira#renda-passiva" class="hcl__link" @click="ir('/carteira#renda-passiva', $event)">
        <g class="hcl__grupo" :class="{ 'hcl__grupo--apagado': apagado('provento') }" :style="{ color: VERDE }" @mouseenter="foco = 'provento'">
          <rect :x="X_PROVENTO - 34" y="40" width="68" height="160" fill="transparent" />
          <template v-if="provento && !carregando">
            <g class="hcl__pilar" :style="{ transformOrigin: `${X_PROVENTO}px ${H0}px` }">
              <rect :x="X_PROVENTO - 3" :y="H0 - 34" width="6" height="34" rx="1" :fill="`url(#${uid}-provento)`" />
            </g>
            <circle :cx="X_PROVENTO" :cy="H0 - 46" r="10" :fill="VERDE" class="hcl__moeda" />
            <text :x="X_PROVENTO" :y="H0 - 45.5" text-anchor="middle" dominant-baseline="central" class="hcl__cifrao" fill="var(--nu-agora-bg)">$</text>
          </template>
          <template v-else>
            <circle :cx="X_PROVENTO" :cy="H0" r="5" fill="var(--nu-agora-bg)" :stroke="carregando ? BRANCO : VERDE" :stroke-opacity="carregando ? 0.2 : 0.7" stroke-width="1.6" />
          </template>
          <g v-if="!carregando" class="hcl__rotulo">
            <text :x="X_PROVENTO" :y="H0 + 20" text-anchor="middle" class="hcl__nome" :fill="VERDE">provento</text>
            <text v-if="proventoSub" :x="X_PROVENTO" :y="H0 + 34" text-anchor="middle" class="hcl__sub">{{ proventoSub }}</text>
          </g>
        </g>
      </a>
    </svg>
    <div v-if="dica" class="hcl__dica" :style="{ left: dica.esquerda, top: dica.topo }" aria-hidden="true">{{ dica.texto }}</div>
  </figure>
</template>

<style scoped>
.hcl { position: relative; margin: 0; width: 100%; }
.hcl__svg { display: block; width: 100%; height: auto; overflow: visible; }
.hcl__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.hcl__link { cursor: pointer; outline: none; }
.hcl__link:focus-visible .hcl__grupo { filter: drop-shadow(0 0 3px var(--nu-agora-azul)); }

.hcl__nome { font-size: 12px; font-weight: 800; letter-spacing: -0.01em; }
.hcl__sub { font-size: 11px; font-weight: 700; fill: var(--nu-agora-sub); }
.hcl__num { font-size: 18px; font-weight: 800; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.hcl__pp { font-size: 13px; font-weight: 800; fill: var(--nu-agora-texto); font-variant-numeric: tabular-nums; }
.hcl__relacao { font-size: 11px; font-weight: 700; fill: var(--nu-agora-sub); }
.hcl__zero { font-size: 11px; font-weight: 700; fill: var(--nu-agora-sub); }
.hcl__cifrao { font-size: 12px; font-weight: 800; }

.hcl__grupo, .hcl__dif { transition: opacity .15s ease; }
.hcl__grupo--apagado { opacity: .3; }

/* a chegada: as colunas sobem (ou descem) do horizonte uma vez; depois os números */
.hcl__pilar { transform: scaleY(0); transition: transform .9s cubic-bezier(.2, .8, .2, 1); }
.hcl--visivel .hcl__pilar { transform: none; }
.hcl__reflexo, .hcl__moeda, .hcl__cifrao { opacity: 0; transition: opacity .4s ease .6s; }
.hcl--visivel .hcl__reflexo, .hcl--visivel .hcl__moeda, .hcl--visivel .hcl__cifrao { opacity: 1; }
.hcl__rotulo, .hcl__dif { opacity: 0; transition: opacity .3s ease .8s; }
.hcl--visivel .hcl__rotulo, .hcl--visivel .hcl__dif { opacity: 1; }
.hcl--visivel .hcl__dif.hcl__grupo--apagado { opacity: .3; }

/* antes da abertura: o pregão anterior, esmaecido */
.hcl--esmaecido .hcl__pilar, .hcl--esmaecido .hcl__dif, .hcl--esmaecido .hcl__moeda { opacity: .55; }

.hcl__dica {
  position: absolute; transform: translate(-50%, -50%); pointer-events: none; width: max-content; max-width: 60%; text-align: center; text-wrap: balance;
  padding: 7px 12px; border-radius: var(--nu-r-chip); background: var(--nu-agora-cartao); color: var(--nu-agora-texto);
  box-shadow: 0 0 0 1px var(--nu-agora-linha), 0 12px 28px -12px var(--nu-agora-bg);
  font-size: var(--nu-fs-sm); font-weight: 700; font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .hcl__pilar, .hcl__reflexo, .hcl__moeda, .hcl__cifrao, .hcl__rotulo, .hcl__dif, .hcl__grupo { transition: none !important; }
}
</style>

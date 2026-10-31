<script setup lang="ts">
// Os anéis do dia no site (31/10/2026): o mesmo desenho do relógio e do
// iPhone, o R2 dos apps ("a queda anda para trás", AneisR2.swift). Três anéis
// num quadro de 150: por fora você (o dia da carteira, rosa na queda, verde na
// alta), no meio a bolsa (o Ibovespa no mesmo dia de preço, branco) e por
// dentro o provento (o "$"; o anel vira um disco verde cheio no dia em que caiu
// um pagamento). O zero fica no alto; uma volta é 3% (a linha de aviso dos
// apps), no máximo uma volta, com um arco mínimo de 6° para o dia que andou
// pouco. Nome e número saem na ponta de cada arco, por um fio, como no Mac.
//
// Enche uma vez na chegada (700 ms, a bolsa 120 ms depois) e para; com
// movimento reduzido, nasce cheio. Hover num anel apaga os outros, como no Mac.
// Os números (fios, frações) vêm de utils/diaDaCarteira.ts, com teste.
import { fiosDoAnel, fracaoDoAnel } from '~/utils/diaDaCarteira'

const props = withDefaults(defineProps<{
  voce: number | null
  bolsa: number | null
  provento?: boolean
  /** o "nenhum na sexta" / "caiu hoje" do fio do provento */
  proventoSub?: string | null
  /** antes da abertura: o pregão anterior, esmaecido */
  esmaecido?: boolean
  /** até a assinatura chegar: só os trilhos, parados */
  carregando?: boolean
}>(), { provento: false, proventoSub: null, esmaecido: false, carregando: false })

const ROSA = 'var(--nu-agora-vermelho)'
const VERDE = 'var(--nu-agora-verde)'
const BRANCO = 'var(--nu-agora-texto)'

const corVoce = computed(() => (props.voce == null ? BRANCO : props.voce < 0 ? ROSA : VERDE))
const anel = (r: number, v: number | null) => {
  const f = fracaoDoAnel(v)
  return { r, f, cheio: f >= 0.9999, queda: (v ?? 0) < 0 }
}
const arcos = computed(() => [
  { chave: 'voce' as const, ...anel(64, props.voce), cor: corVoce.value, atraso: 0 },
  { chave: 'bolsa' as const, ...anel(44, props.bolsa), cor: BRANCO, atraso: 120 },
])
const fios = computed(() => (props.carregando ? [] : fiosDoAnel(props.voce, props.bolsa, props.proventoSub)))
const corDoFio = (c: string) => (c === 'voce' ? corVoce.value : c === 'bolsa' ? BRANCO : VERDE)

// a chegada: nasce vazio e enche no quadro seguinte ao da montagem (o anel só
// aparece com a assinatura confirmada, que chega pelo cliente)
const montado = ref(false)
onMounted(() => { requestAnimationFrame(() => { montado.value = true }) })
const visivel = computed(() => montado.value && !props.carregando)

const foco = ref<'voce' | 'bolsa' | 'provento' | null>(null)
const apagado = (c: 'voce' | 'bolsa' | 'provento') => foco.value != null && foco.value !== c

const falado = computed(() => {
  const p = (v: number | null) => (v == null ? 'sem dado' : `${v < 0 ? 'menos ' : ''}${Math.abs(v).toFixed(2).replace('.', ',')}%`)
  return `Você ${p(props.voce)}, bolsa ${p(props.bolsa)}, ${props.provento ? 'caiu provento' : 'sem provento'}.`
})

function ir(destino: string, e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  void navigateTo(destino)
}
</script>

<template>
  <figure class="han" :class="{ 'han--esmaecido': esmaecido, 'han--carregando': carregando, 'han--visivel': visivel }">
    <figcaption class="han__sr">{{ falado }}</figcaption>
    <svg viewBox="-74 -22 322 196" class="han__svg" aria-hidden="true" @mouseleave="foco = null">
      <!-- você e a bolsa: levam à /carteira -->
      <a href="/carteira" class="han__link" @click="ir('/carteira', $event)">
        <g
          v-for="a in arcos" :key="a.chave"
          class="han__grupo" :class="{ 'han__grupo--apagado': apagado(a.chave) }"
          @mouseenter="foco = a.chave"
        >
          <circle cx="75" cy="75" :r="a.r" fill="none" :stroke="carregando ? BRANCO : a.cor" :stroke-opacity="carregando ? 0.08 : a.chave === 'voce' ? 0.16 : 0.12" stroke-width="16" />
          <template v-if="!carregando && (a.chave === 'voce' ? voce != null : bolsa != null) && a.f > 0">
            <circle v-if="a.cheio" cx="75" cy="75" :r="a.r" fill="none" :stroke="a.cor" stroke-width="16" class="han__arco" :style="{ transitionDelay: `${a.atraso}ms` }" />
            <circle
              v-else cx="75" cy="75" :r="a.r" fill="none" :stroke="a.cor" stroke-width="16" stroke-linecap="round"
              pathLength="100" stroke-dasharray="100 100"
              :stroke-dashoffset="visivel ? 100 - a.f * 100 : 100"
              :transform="a.queda ? 'matrix(-1 0 0 1 150 0) rotate(-90 75 75)' : 'rotate(-90 75 75)'"
              class="han__arco" :style="{ transitionDelay: `${a.atraso}ms` }"
            />
          </template>
          <template v-for="f in fios.filter((x) => x.chave === a.chave)" :key="f.chave">
            <g class="han__rotulo">
              <path
                :d="`M${f.ponta.x} ${f.ponta.y} L${(f.esquerda ? -14 + 10 : 164 - 10)} ${f.y} L${f.esquerda ? -14 : 164} ${f.y}`"
                fill="none" :stroke="corDoFio(f.chave)" stroke-opacity="0.55" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"
              />
              <circle :cx="f.ponta.x" :cy="f.ponta.y" r="2.6" :fill="corDoFio(f.chave)" />
              <text :x="f.esquerda ? -18 : 168" :y="f.y - 2" :text-anchor="f.esquerda ? 'end' : 'start'" class="han__nome" :fill="corDoFio(f.chave)">{{ f.nome }}</text>
              <text :x="f.esquerda ? -18 : 168" :y="f.y + 13" :text-anchor="f.esquerda ? 'end' : 'start'" class="han__num" :fill="corDoFio(f.chave)">{{ f.sub }}</text>
            </g>
          </template>
        </g>
      </a>

      <!-- o provento: leva à renda passiva da /carteira -->
      <a href="/carteira#renda-passiva" class="han__link" @click="ir('/carteira#renda-passiva', $event)">
        <g class="han__grupo" :class="{ 'han__grupo--apagado': apagado('provento') }" @mouseenter="foco = 'provento'">
          <circle v-if="provento && !carregando" cx="75" cy="75" r="32" :fill="VERDE" class="han__disco" />
          <circle v-else cx="75" cy="75" r="24" fill="none" :stroke="carregando ? BRANCO : VERDE" :stroke-opacity="carregando ? 0.08 : 0.14" stroke-width="16" />
          <text v-if="!carregando" x="75" y="75.5" text-anchor="middle" dominant-baseline="central" class="han__cifrao" :fill="provento ? '#000' : VERDE" :fill-opacity="provento ? 1 : 0.75">$</text>
          <template v-for="f in fios.filter((x) => x.chave === 'provento')" :key="f.chave">
            <g class="han__rotulo">
              <path :d="`M${f.ponta.x} ${f.ponta.y} L${164 - 10} ${f.y} L164 ${f.y}`" fill="none" :stroke="VERDE" stroke-opacity="0.55" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
              <circle :cx="f.ponta.x" :cy="f.ponta.y" r="2.6" :fill="VERDE" />
              <text x="168" :y="f.y - 2" class="han__nome" :fill="VERDE">{{ f.nome }}</text>
              <text x="168" :y="f.y + 13" class="han__num" :fill="VERDE">{{ f.sub }}</text>
            </g>
          </template>
        </g>
      </a>

      <!-- o zero, no alto -->
      <line x1="75" y1="3" x2="75" y2="62" stroke="#fff" stroke-opacity="0.6" stroke-width="2" stroke-dasharray="3 4" class="han__zero" />
      <text v-if="!carregando" x="75" y="-9" text-anchor="middle" dominant-baseline="central" class="han__zero-txt">0</text>
    </svg>
  </figure>
</template>

<style scoped>
.han { margin: 0; width: 100%; }
.han__svg { display: block; width: 100%; height: auto; overflow: visible; }
.han__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.han__link { cursor: pointer; outline: none; }
.han__link:focus-visible .han__grupo { filter: drop-shadow(0 0 3px var(--nu-agora-azul)); }

/* o texto do desenho cresce com o anel, como nos apps (o quadro é de 322) */
.han__nome { font-size: 14px; font-weight: 800; letter-spacing: -0.01em; }
.han__num { font-size: 12px; font-weight: 700; opacity: .8; font-variant-numeric: tabular-nums; }
.han__cifrao { font-size: 17px; font-weight: 800; }
.han__zero-txt { font-size: 13px; font-weight: 700; fill: var(--nu-agora-sub); }

.han__grupo { transition: opacity .15s ease; }
.han__grupo--apagado { opacity: .35; }

/* a chegada: os arcos enchem, o disco do provento entra, os rótulos aparecem */
.han__arco { transition: stroke-dashoffset .7s cubic-bezier(.22, 1, .36, 1), opacity .2s ease; opacity: 0; }
.han--visivel .han__arco { opacity: 1; }
.han__disco { transform-origin: 75px 75px; transform: scale(.6); opacity: 0; transition: transform .45s cubic-bezier(.22, 1, .36, 1) .45s, opacity .3s ease .45s; }
.han--visivel .han__disco { transform: none; opacity: 1; }
.han__rotulo { opacity: 0; transition: opacity .3s ease .9s; }
.han--visivel .han__rotulo { opacity: 1; }

/* antes da abertura: o pregão anterior, esmaecido */
.han--esmaecido .han__arco, .han--esmaecido .han__disco { opacity: .6; }
.han--carregando .han__zero { stroke-opacity: .2; }

@media (prefers-reduced-motion: reduce) {
  .han__arco, .han__disco, .han__rotulo, .han__grupo { transition: none !important; }
}
</style>

<script setup lang="ts">
// Animação "Redentia lendo o mercado" — porte fiel do componente Claude Design
// (contrato de UX do refresh: docs/redentia-nu/PLANO-REFRESH-HOME-LOGIN.md).
//
// Loop autônomo: um feed de tokens (tile de ticker + palavras + pills de
// variação + ícone de doc) acende palavra a palavra (fase 'read'), pausa,
// faz morph pro lockup da marca (fase 'brand': texto sobe/borra, entra o azul
// cheio + logo + "Redentia" + tagline), espera e reinicia.
//
// UM componente, DOIS temas (PR-R1 navy no login; PR-R2 light no hero do
// /mercado). Feed, paleta e tamanhos vêm do mapa THEMES — nada de `if` de tema
// espalhado. O tema 'navy' é o DEFAULT e mantém EXATAMENTE os params do login;
// 'light' é a variante sobre card branco. As cores de terceiros (tiles de
// empresa) são hardcoded nos feeds de propósito (identidade de marca alheia);
// todo o resto sai de var(--nu-*).
//
// É SÓ o miolo animado (feed + overlay do lockup). O título "Redentia lendo o
// mercado", o contador de documentos e a tagline de rodapé ficam no PAI, pra
// reuso nos dois usos. O contador é derivado aqui (1240 + lidos*3) e espelhado
// pro pai via emit `doc` (+ `phase`, opcional).
//
// SSR/perf: no servidor renderiza o estado inicial (fase read, readN=0) sem
// timers; a animação só começa em onMounted (client) e é limpa no unmount.
// prefers-reduced-motion: mostra o feed inteiro estático, sem loop nem morph.
//
// DINÂMICA (correção do dono 2026-07-13): o feed deixa de ser só o SEED fixo e
// passa a ler os MAIORES MOVERS REAIS do dia via useMarketReading (mesma fonte
// do /mercado), com a LOGO real de cada empresa (icons.brapi.dev). SSR e 1º
// paint mostram o seed; o client hidrata os movers e troca o feed; fetch falha
// → seed. Os tokens do seed já carregam o ticker real, então a logo aparece
// mesmo antes de hidratar (e degrada pra letra quando não houver logo).
import { readingLogoEligible, readingLogoSrc, useMarketReading } from '~/composables/useMarketReading'
import type { ReadingToken } from '~/composables/useMarketReading'

type Token = ReadingToken

type Theme = 'navy' | 'light'

const props = withDefaults(
  defineProps<{
    /** tema visual: 'navy' (login, DEFAULT) | 'light' (hero do /mercado) */
    theme?: Theme
    /** ms por token lido (mín. 60, igual ao design) */
    readMs?: number
    /** tagline do lockup de marca */
    brandTagline?: string
  }>(),
  { theme: 'navy', readMs: 260, brandTagline: 'leu o mercado por você.' },
)

const emit = defineEmits<{
  /** contador "{doc} documentos analisados" — o pai renderiza no header */
  doc: [text: string]
  /** fase atual, caso o pai queira reagir ('read' | 'brand') */
  phase: [value: 'read' | 'brand']
}>()

// ————— feeds por tema —————
// As cores dos tiles de empresa (#0E8F4E, #E9B21E, …) são identidade de marca de
// TERCEIROS — ficam hardcoded de propósito (não são cor do design system Redentia).
// Hidratar com tickers reais é fase 2.
// Os tokens 'co' trazem o `ticker` real → a logo (icons.brapi.dev) aparece já no
// seed; `bg`/`fg` (cores de marca de terceiros, hardcoded de propósito) só valem
// como fallback de letra quando a logo não carrega.
const NAVY_FEED: Token[] = [
  { k: 'co', ticker: 'PETR4', bg: '#0E8F4E', fg: '#ffffff', tx: 'P' }, // Petrobras
  { k: 'w', t: 'Petrobras' }, { k: 'w', t: 'avança' }, { k: 'up', t: '+0,76%' }, { k: 'w', t: 'com o Brent em alta.' }, { k: 'doc' },
  { k: 'co', ticker: 'VALE3', bg: '#E9B21E', fg: '#0C1524', tx: 'V' }, // Vale
  { k: 'w', t: 'Vale' }, { k: 'w', t: 'cede' }, { k: 'dn', t: '-1,10%' }, { k: 'w', t: 'no minério de ferro.' },
  { k: 'co', ticker: 'ITUB4', bg: '#EC7000', fg: '#ffffff', tx: 'I' }, // Itaú
  { k: 'w', t: 'Itaú' }, { k: 'w', t: 'renova máxima' }, { k: 'up', t: '+1,32%.' }, { k: 'doc' },
  { k: 'co', ticker: 'ROXO34', bg: '#7A2FF0', fg: '#ffffff', tx: 'N' }, // Nubank
  { k: 'w', t: 'Nubank' }, { k: 'w', t: 'supera projeções' }, { k: 'up', t: '+2,04%' }, { k: 'w', t: 'no trimestre.' },
  { k: 'co', ticker: 'BBAS3', bg: '#0A66C2', fg: '#ffffff', tx: 'B' }, // Banco do Brasil
  { k: 'w', t: 'Banco do Brasil' }, { k: 'w', t: 'aprova dividendos.' }, { k: 'doc' },
  { k: 'co', ticker: 'WEGE3', bg: '#0F1115', fg: '#ffffff', tx: 'W' }, // WEG
  { k: 'w', t: 'WEG' }, { k: 'w', t: 'recua' }, { k: 'dn', t: '-0,44%' }, { k: 'w', t: 'após o balanço.' },
  { k: 'w', t: 'Ibovespa' }, { k: 'w', t: 'bate 197 mil pontos,' }, { k: 'up', t: '+0,91%.' },
]
// feed mais curto (20 tokens / 4 tickers) do card do hero do /mercado
const LIGHT_FEED: Token[] = [
  { k: 'co', ticker: 'PETR4', bg: '#0E8F4E', fg: '#ffffff', tx: 'P' }, // Petrobras
  { k: 'w', t: 'Petrobras' }, { k: 'w', t: 'avança' }, { k: 'up', t: '+0,76%' }, { k: 'w', t: 'com o Brent.' }, { k: 'doc' },
  { k: 'co', ticker: 'VALE3', bg: '#E9B21E', fg: '#0C1524', tx: 'V' }, // Vale
  { k: 'w', t: 'Vale' }, { k: 'w', t: 'cede' }, { k: 'dn', t: '-1,10%' }, { k: 'w', t: 'no minério.' },
  { k: 'co', ticker: 'ITUB4', bg: '#EC7000', fg: '#ffffff', tx: 'I' }, // Itaú
  { k: 'w', t: 'Itaú' }, { k: 'w', t: 'renova máxima' }, { k: 'up', t: '+1,32%.' }, { k: 'doc' },
  { k: 'w', t: 'Ibovespa' }, { k: 'w', t: 'bate 197 mil' }, { k: 'up', t: '+0,91%.' },
]

// ————— mapa de tema (feed + paleta + tamanhos + timing) —————
interface ThemeCfg {
  feed: Token[]
  /** cor da palavra por recência: [d<=0, d1, d2, d3, else] */
  wordRecency: readonly [string, string, string, string, string]
  wordBrand: string
  /** opacity das palavras/pills/tiles ainda não acesos */
  offOpacity: number
  pillUpBg: string; pillUpColor: string
  pillDnBg: string; pillDnColor: string
  pillBrandBg: string; pillBrandColor: string
  coBrandBg: string; coBrandFg: string
  docReadBg: string; docBrandBg: string
  docStrokeRead: string; docStrokeBrand: string
  textFontSize: string; textLineHeight: number
  /** pausa após ler tudo, antes do morph pra marca (ms) */
  brandPauseMs: number
}

const THEMES: Record<Theme, ThemeCfg> = {
  navy: {
    feed: NAVY_FEED,
    wordRecency: [
      'var(--nu-cream-text-24)', 'var(--nu-cream-text-50)',
      'var(--nu-cream-text-72)', 'var(--nu-cream-text-90)', 'var(--nu-cream-text)',
    ],
    wordBrand: 'var(--nu-white)',
    offOpacity: 0.16,
    pillUpBg: 'var(--nu-green-soft-16)', pillUpColor: 'var(--nu-green-soft)',
    pillDnBg: 'var(--nu-red-soft-16)', pillDnColor: 'var(--nu-red-soft)',
    pillBrandBg: 'var(--nu-white-18)', pillBrandColor: 'var(--nu-white)',
    coBrandBg: 'var(--nu-white)', coBrandFg: 'var(--nu-blue)',
    docReadBg: 'var(--nu-read-doc-bg)', docBrandBg: 'var(--nu-white-18)',
    docStrokeRead: 'var(--nu-grad-blue-2)', docStrokeBrand: 'var(--nu-white)',
    textFontSize: 'clamp(21px, 2.3vw, 29px)', textLineHeight: 1.55,
    brandPauseMs: 2600,
  },
  light: {
    feed: LIGHT_FEED,
    wordRecency: [
      'var(--nu-read-word-1)', 'var(--nu-read-word-2)',
      'var(--nu-read-word-3)', 'var(--nu-read-word-4)', 'var(--nu-ink)',
    ],
    wordBrand: 'var(--nu-blue)',
    offOpacity: 0.14,
    pillUpBg: 'var(--nu-green-bg)', pillUpColor: 'var(--nu-read-green)',
    pillDnBg: 'var(--nu-read-red-bg)', pillDnColor: 'var(--nu-read-red)',
    pillBrandBg: 'var(--nu-tile-blue-bg)', pillBrandColor: 'var(--nu-blue)',
    coBrandBg: 'var(--nu-blue)', coBrandFg: 'var(--nu-white)',
    docReadBg: 'var(--nu-read-doc-bg-light)', docBrandBg: 'var(--nu-blue-16)',
    docStrokeRead: 'var(--nu-blue)', docStrokeBrand: 'var(--nu-blue)',
    textFontSize: 'clamp(23px, 2.5vw, 32px)', textLineHeight: 1.52,
    brandPauseMs: 2400,
  },
}

const cfg = computed(() => THEMES[props.theme])

// Feed dinâmico: seed do tema (SSR-safe) → movers reais no client → seed se
// falhar. navy usa o feed longo (6 frases); light, o curto (4). O seed passado
// é o do tema, então SSR e 1º paint são idênticos ao que já existia.
const { feed, loading } = useMarketReading(cfg.value.feed, props.theme === 'navy' ? 6 : 4)
const tokens = computed(() => feed.value)
const total = computed(() => tokens.value.length)

// tom do skeleton por tema (navy no login; cream sobre o card branco do hero)
const skTone = computed<'navy' | 'cream'>(() => (props.theme === 'navy' ? 'navy' : 'cream'))
// larguras dos chips do skeleton do feed (2 "frases" ilustrativas, sem % falso)
const SK_CHIPS = [110, 74, 64, 146, 96, 120, 70] as const

// logos que falharam (404 na Brapi) → degradam pro tile de letra, por índice.
const logoFailed = reactive(new Set<number>())
function showLogo(tk: Token, i: number): boolean {
  return !isBrand.value && readingLogoEligible(tk.ticker) && !logoFailed.has(i)
}

const readN = ref(0)
const phase = ref<'read' | 'brand'>('read')
const isBrand = computed(() => phase.value === 'brand')

// _done do design: em brand tudo conta como lido
const done = computed(() => (isBrand.value ? total.value : readN.value))
const docText = computed(() => (1240 + done.value * 3).toLocaleString('pt-BR'))

// espelha o contador/fase pro pai (header + contador vivem lá)
watch(docText, (v) => emit('doc', v))
watch(phase, (v) => emit('phase', v))

// ————— estado visual de cada token —————
const seen = (i: number) => isBrand.value || i < readN.value

// wcol do design: cor por recência da palavra (mais recente = mais brilhante)
function wordColor(i: number): string {
  const c = cfg.value
  if (isBrand.value) return c.wordBrand
  const d = readN.value - i
  if (d <= 0) return c.wordRecency[0]
  if (d === 1) return c.wordRecency[1]
  if (d === 2) return c.wordRecency[2]
  if (d === 3) return c.wordRecency[3]
  return c.wordRecency[4]
}

const POP = 'opacity .45s ease, transform .5s cubic-bezier(.34,1.56,.64,1), background .5s ease, color .5s ease'

function wordStyle(i: number) {
  return {
    color: wordColor(i),
    opacity: seen(i) ? 1 : cfg.value.offOpacity,
    transition: 'color .6s ease, opacity .5s ease',
  }
}
function pillStyle(tk: Token, i: number) {
  const up = tk.k === 'up'
  const on = seen(i)
  const c = cfg.value
  return {
    display: 'inline-flex',
    alignItems: 'center',
    margin: '0 .16em',
    padding: '.05em .5em',
    borderRadius: '999px',
    fontSize: '.6em',
    fontWeight: 800,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    verticalAlign: '.16em',
    background: isBrand.value ? c.pillBrandBg : up ? c.pillUpBg : c.pillDnBg,
    color: isBrand.value ? c.pillBrandColor : up ? c.pillUpColor : c.pillDnColor,
    opacity: on ? 1 : c.offOpacity,
    transform: on ? 'scale(1)' : 'scale(.85)',
    transition: POP,
  }
}
function coStyle(tk: Token, i: number) {
  const on = seen(i)
  const c = cfg.value
  const logo = showLogo(tk, i)
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    flexShrink: 0,
    borderRadius: '50%',
    margin: '0 .28em 0 .06em',
    fontSize: '19px',
    fontWeight: 800,
    lineHeight: 1,
    verticalAlign: 'middle',
    overflow: 'hidden',
    // com logo → fundo neutro (a logo é a identidade); sem logo → tk.bg/tk.fg
    // (cor de marca de terceiro); no morph pra marca vira o tile Redentia.
    background: isBrand.value ? c.coBrandBg : logo ? 'var(--nu-white)' : tk.bg,
    color: isBrand.value ? c.coBrandFg : tk.fg,
    opacity: on ? 1 : c.offOpacity,
    transform: on ? 'scale(1)' : 'scale(.8)',
    transition: POP,
  }
}
function docStyle(i: number) {
  const on = seen(i)
  const c = cfg.value
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    flexShrink: 0,
    borderRadius: '50%',
    margin: '0 .24em 0 .04em',
    verticalAlign: 'middle',
    background: isBrand.value ? c.docBrandBg : c.docReadBg,
    opacity: on ? 1 : c.offOpacity,
    transform: on ? 'scale(1)' : 'scale(.8)',
    transition: POP,
  }
}
// stroke via CSS (custom properties não resolvem em atributo `stroke=`)
const docStroke = computed(() => (isBrand.value ? cfg.value.docStrokeBrand : cfg.value.docStrokeRead))

const textWrapStyle = computed(() => ({
  fontSize: cfg.value.textFontSize,
  fontWeight: 500,
  lineHeight: cfg.value.textLineHeight,
  letterSpacing: '-0.01em',
  width: '100%',
  transition: 'transform .85s cubic-bezier(.6,0,.15,1), opacity .7s ease, filter .7s ease',
  transform: isBrand.value ? 'translateY(-40px)' : 'none',
  opacity: isBrand.value ? 0 : 1,
  filter: isBrand.value ? 'blur(4px)' : 'none',
  willChange: 'transform, opacity',
}))
const lockupStyle = computed(() => ({
  transition: isBrand.value
    ? 'opacity .8s ease .3s, transform 1s cubic-bezier(.34,1.3,.5,1) .3s'
    : 'opacity .4s ease, transform .4s ease',
  opacity: isBrand.value ? 1 : 0,
  transform: isBrand.value ? 'scale(1) translateY(0)' : 'scale(.8) translateY(18px)',
}))

// ————— loop (client only) —————
let reader: ReturnType<typeof setInterval> | null = null
let readTo: ReturnType<typeof setTimeout> | null = null
let brandTo: ReturnType<typeof setTimeout> | null = null
function clearTimers() {
  if (reader) { clearInterval(reader); reader = null }
  if (readTo) { clearTimeout(readTo); readTo = null }
  if (brandTo) { clearTimeout(brandTo); brandTo = null }
}
function startRead() {
  clearTimers()
  readN.value = 0
  phase.value = 'read'
  const ms = Math.max(60, props.readMs)
  reader = setInterval(() => {
    if (phase.value !== 'read') return
    const n = readN.value + 1
    if (n >= total.value) {
      readN.value = total.value
      if (reader) { clearInterval(reader); reader = null }
      // lê tudo → pausa (por tema) → morph pra marca → espera ~5,2s → reinicia
      readTo = setTimeout(() => {
        phase.value = 'brand'
        brandTo = setTimeout(startRead, 5200)
      }, cfg.value.brandPauseMs)
    } else {
      readN.value = n
    }
  }, ms)
}

// Só arranca a animação quando o feed ASSENTA (loading=false: movers reais
// hidratados OU degrade pro seed). Enquanto carrega, o template mostra skeleton
// e nada anima — o feed com percentuais reais entra já pronto, sem piscar o seed.
function settle() {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    // acessibilidade: feed completo estático, sem loop nem morph de marca
    readN.value = total.value
    phase.value = 'read'
    emit('doc', docText.value)
    emit('phase', phase.value)
    return
  }
  emit('doc', docText.value)
  emit('phase', phase.value)
  startRead()
}

onMounted(() => {
  // se o feed já assentou (2ª página que reusa o useState), arranca na hora
  if (!loading.value) settle()
})
onBeforeUnmount(clearTimers)

// feed assentou → arranca a leitura do feed final (real ou degrade) por inteiro
watch(loading, (v) => {
  if (v || !import.meta.client) return
  settle()
})
</script>

<template>
  <div class="nmr">
    <!-- feed que acende palavra a palavra -->
    <div class="nmr__feed">
      <!-- skeleton enquanto o feed não assenta: 2 "frases" ilustrativas, sem
           percentual falso; some assim que os movers reais entram -->
      <div v-if="loading" class="nmr__sk" aria-hidden="true">
        <NuSkeleton :tone="skTone" variant="circle" width="38px" height="38px" />
        <NuSkeleton
          v-for="(w, i) in SK_CHIPS" :key="`skr${i}`"
          :tone="skTone" variant="line" :width="`${w}px`" height="22px" radius="chip"
        />
        <NuSkeleton :tone="skTone" variant="circle" width="32px" height="32px" />
      </div>
      <div v-else class="nmr__text" :style="textWrapStyle">
        <template v-for="(tk, i) in tokens" :key="i">
          <!-- espaço no VALOR (tk.t + ' '), como o DC: o Vue apara o espaço
               literal antes de </span> (whitespace condense) e cola as palavras -->
          <span v-if="tk.k === 'w'" :style="wordStyle(i)">{{ tk.t + ' ' }}</span>
          <span v-else-if="tk.k === 'up' || tk.k === 'dn'" :style="pillStyle(tk, i)">{{ tk.t }}</span>
          <span v-else-if="tk.k === 'co'" :style="coStyle(tk, i)">
            <img
              v-if="showLogo(tk, i)" class="nmr__logo-co"
              :src="readingLogoSrc(tk.ticker!)" :alt="tk.tx" loading="lazy"
              @error="logoFailed.add(i)"
            >
            <template v-else>{{ tk.tx }}</template>
          </span>
          <span v-else-if="tk.k === 'doc'" :style="docStyle(i)">
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              :style="{ stroke: docStroke }" stroke-width="2.4"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
            >
              <path d="M14 3v5h5" />
              <path d="M8 3h7l4.5 4.5V20a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
            </svg>
          </span>
        </template>
      </div>
    </div>

    <!-- overlay do lockup de marca (morph no fim do loop) -->
    <div class="nmr__brand" aria-hidden="true">
      <div class="nmr__fill" :style="{ opacity: isBrand ? 1 : 0 }" />
      <div class="nmr__lockup" :style="lockupStyle">
        <div class="nmr__glow" :style="{ opacity: isBrand ? 1 : 0 }" />
        <img class="nmr__logo" src="/logo-branca.svg" alt="Redentia" />
        <div class="nmr__word">Redentia</div>
        <div class="nmr__tag">{{ brandTagline }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* SEM position:relative de propósito (correção do dono 2026-07-13): o overlay
   do brand (.nmr__brand, absolute inset:0) deve subir até o CARD hospedeiro —
   o azul cobre o card INTEIRO (header/contador inclusos), não só a área do
   feed. CONTRATO: o card pai é o único ancestral posicionado na cadeia
   (.mh__anim no mercado, .nap no login); nada entre eles pode ter position. */
.nmr { width: 100%; }
/* logo real do ativo dentro do tile 'co' (icons.brapi.dev) — preenche o círculo */
.nmr__logo-co { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 50%; }
.nmr__feed {
  position: relative; width: 100%;
  min-height: clamp(150px, 16vh, 190px);
  display: flex; align-items: center;
}
/* skeleton do feed: chips shimmer no fluxo do texto (mesma altura de linha) */
.nmr__sk { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 12px; width: 100%; }
.nmr__brand {
  position: absolute; inset: 0; z-index: 5;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  pointer-events: none;
}
.nmr__fill { position: absolute; inset: 0; background: var(--nu-blue); transition: opacity .9s ease; pointer-events: none; }
.nmr__lockup {
  position: relative;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center;
}
.nmr__glow {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 74%; height: 74%; border-radius: 50%;
  background: var(--nu-read-glow); transition: opacity 1s ease; pointer-events: none;
}
.nmr__logo { width: clamp(84px, 10vw, 120px); height: auto; display: block; filter: var(--nu-read-logo-shadow); }
.nmr__word { margin-top: 18px; color: var(--nu-white); font-size: clamp(28px, 3vw, 40px); font-weight: 800; letter-spacing: -0.03em; line-height: 1; }
.nmr__tag { margin-top: 11px; color: var(--nu-white-82); font-size: clamp(15px, 1.6vw, 18px); font-weight: 700; }
</style>

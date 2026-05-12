<template>
  <div>
    <!-- ========== HERO: RADIOGRAPH (Redentia v3 reposicionada) ========== -->
    <!-- Headline de RESULTADO + input de tickers embutido na primeira dobra
         + Redent Score demo card como visual. Foco em B2C self-directed.
         B2B sai pra paginas dedicadas (/whitelabel, /api-portal, /assessores). -->
    <HomeHeroRadiograph
      v-if="brand.hero.variant === 'radiograph'"
      :ibov-series="ibovSeries"
      :ibov-last-price="ibovLastPrice"
      :ibov-indicator="ibovIndicator"
      :ibov-variation-color="ibovVariationColor"
      :ifix-last-price="ifixLastPrice"
      :ifix-indicator="ifixIndicator"
    />

    <!-- ========== HERO: QUIET (Redentia v2 premium, lightness as luxury) ========== -->
    <!-- Mantida para tenants white-label que querem o manifesto generico
         "Investir com inteligencia". Redentia base migrou para 'radiograph'. -->
    <HomeHeroQuiet
      v-if="brand.hero.variant === 'quiet'"
      :ibov-series="ibovSeries"
      :ibov-last-price="ibovLastPrice"
      :ibov-indicator="ibovIndicator"
      :ibov-variation-color="ibovVariationColor"
      :ifix-last-price="ifixLastPrice"
      :ifix-indicator="ifixIndicator"
    />

    <!-- ========== HERO: CENTERED (fallback minimal, manifesto generico) ========== -->
    <!-- Phase 4: Adicionado pra fix do Primo Rico (`hero.variant=centered`
         no DB sem v-if matching). Tambem o que `seedBrand` aponta default. -->
    <HomeHeroCentered
      v-if="brand.hero.variant === 'centered'"
      :ibov-series="ibovSeries"
      :ibov-last-price="ibovLastPrice"
      :ibov-indicator="ibovIndicator"
      :ibov-variation-color="ibovVariationColor"
      :ifix-last-price="ifixLastPrice"
      :ifix-indicator="ifixIndicator"
    />

    <!-- ========== HERO: MENTOR (Primo Rico, book-cover orange chunky) ========== -->
    <!-- Restored 2026-05-12. Foi deletado na Phase 4 como "experimental",
         mas e a identidade canonica do tenant Primo Rico (capa do livro
         "Do Mil ao Milhao"). Consome brand.hero.{badge,title,subtitle,
         founderQuote,trustIndicators,ctaLabel,ctaSecondaryLabel,ctaIcon}
         e brand.founder.{name,photo}. -->
    <HomeHeroMentor
      v-if="brand.hero.variant === 'mentor'"
      :ibov-series="ibovSeries"
      :ibov-last-price="ibovLastPrice"
      :ibov-indicator="ibovIndicator"
      :ibov-variation-color="ibovVariationColor"
      :ifix-last-price="ifixLastPrice"
      :ifix-indicator="ifixIndicator"
    />



    <!-- ========== HERO: SPLIT (Me Poupe, energetico, personalidade, pop) ========== -->
    <section v-if="brand.hero.variant === 'split'"  class="relative overflow-hidden">
      <!-- Background: dots + color splashes -->
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute right-0 top-0 h-[400px] w-[400px] rounded-full blur-3xl" :style="{ backgroundColor: `${brand.colors.primary}26` }" />
        <div class="absolute -left-20 bottom-0 h-[300px] w-[300px] rounded-full blur-3xl" :style="{ backgroundColor: `${brand.colors.secondary}1A` }" />
      </div>

      <div class="relative px-6 py-12 md:py-16">
        <div class="mx-auto flex max-w-6xl flex-col items-center gap-10 md:flex-row md:gap-16">
          <!-- Left: founder image (when hero.image is set) -->
          <div v-if="brand.hero.image" class="relative flex flex-1 items-end justify-center md:justify-start">
            <div class="absolute -inset-16 rounded-full blur-3xl" :style="{ backgroundColor: `${brand.colors.primary}15` }" />
            <NuxtImg
              :src="brand.hero.image"
              :alt="brand.founder.name"
              class="relative w-[15rem] max-w-none object-contain drop-shadow-2xl sm:w-[20rem] md:w-[25rem] lg:w-[30rem]"
            />
          </div>

          <!-- Text content -->
          <div class="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
            <!-- Badge energetico -->
            <div class="mb-6 inline-flex items-center gap-2 px-4 py-2 brand-card-sm" :style="{ backgroundColor: `${brand.colors.primary}1A`, border: `1px solid ${brand.colors.primary}33` }">
              <span class="text-sm font-semibold" :style="{ color: 'var(--brand-primary)' }">{{ brand.hero.badge }}</span>
            </div>

            <h2 class="mb-4 text-4xl leading-[1.1] sm:text-5xl md:text-6xl" :class="[brand.font.headingWeight, brand.font.headingStyle]" :style="{ color: 'var(--brand-text)' }">
              <template v-for="(line, idx) in brand.hero.title.split('\n')" :key="idx">
                <br v-if="idx > 0" />{{ line }}
              </template>
            </h2>

            <p class="mb-8 max-w-md text-base md:text-lg" :style="{ color: 'var(--brand-text-muted)' }">
              {{ brand.hero.subtitle }}
            </p>

            <!-- Founder quote -->
            <p class="mb-6 max-w-sm text-sm italic" :style="{ color: `${brand.colors.text}80` }">
              "{{ brand.hero.founderQuote }}"
              <span class="not-italic" :style="{ color: `${brand.colors.text}4D` }">, {{ brand.founder.name }}</span>
            </p>

            <!-- CTAs lado a lado, pill shape -->
            <div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <UButton to="/auth/register" color="secondary" size="xl" :icon="brand.hero.ctaIcon" class="group px-8 transition-[transform,opacity,box-shadow,background-color,border-color] duration-200 hover:scale-105">
                {{ brand.hero.ctaLabel }}
              </UButton>
              <UButton to="/auth/login" variant="ghost" size="xl" :style="{ color: 'var(--brand-text-muted)' }">
                {{ brand.hero.ctaSecondaryLabel }}
              </UButton>
            </div>

            <!-- Trust inline -->
            <div class="mt-8 flex flex-wrap items-center gap-4 text-xs" :style="{ color: `${brand.colors.text}66` }">
              <div v-for="(indicator, idx) in brand.hero.trustIndicators" :key="idx" class="flex items-center gap-1.5">
                <UIcon name="i-lucide-check-circle" class="h-3 w-3" :style="{ color: 'var(--brand-secondary)' }" />
                <span>{{ indicator }}</span>
              </div>
            </div>
          </div>

          <!-- Right: quote card fallback (when NO hero.image) -->
          <div v-if="!brand.hero.image" class="flex flex-1 flex-col items-center gap-4">
            <div class="w-full max-w-sm border p-6 backdrop-blur-sm brand-card" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
              <div class="mb-4 flex items-center gap-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-full" :style="{ backgroundColor: `${brand.colors.primary}26` }">
                  <BrandLogo variant="icon" class="h-7 w-7" />
                </div>
                <div>
                  <p class="text-sm font-semibold" :style="{ color: 'var(--brand-text)' }">{{ brand.founder.name }}</p>
                  <p class="text-xs" :style="{ color: 'var(--brand-text-muted)' }">{{ brand.founder.role }}</p>
                </div>
              </div>
              <p class="text-base italic leading-relaxed" :style="{ color: `${brand.colors.text}B3` }">"{{ brand.hero.founderQuote }}"</p>
            </div>
            <BrandLogo variant="full" class="h-8 opacity-40" />
          </div>
        </div>
      </div>
    </section>


    <!-- ========== HERO: MINIMAL (Sardinha, compacto, data-first, sem firula) ========== -->
    <section v-if="brand.hero.variant === 'minimal'" :style="{ borderColor: 'var(--brand-border)' }" class="relative overflow-hidden border-b">
      <div class="relative px-6 py-10 md:py-14">
        <div class="mx-auto max-w-5xl">
          <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-12">
            <!-- Left: brand + headline compact -->
            <div class="flex-1">
              <BrandLogo variant="full" class="mb-4 h-8 md:h-10" />
              <h2 class="mb-3 text-2xl leading-tight sm:text-3xl md:text-4xl" :class="[brand.font.headingWeight, brand.font.headingStyle]" :style="{ color: 'var(--brand-text)' }">
                <template v-for="(line, idx) in brand.hero.title.split('\n')" :key="idx">
                  <br v-if="idx > 0" />{{ line }}
                </template>
              </h2>
              <p class="mb-6 max-w-lg text-sm md:text-base" :style="{ color: 'var(--brand-text-muted)' }">
                {{ brand.hero.subtitle }}
              </p>
              <div class="flex items-center gap-3">
                <UButton to="/auth/register" color="secondary" size="lg" :icon="brand.hero.ctaIcon" class="transition-[transform,opacity,box-shadow,background-color,border-color] hover:scale-[1.02]">
                  {{ brand.hero.ctaLabel }}
                </UButton>
                <UButton to="/auth/login" variant="ghost" size="lg" :style="{ color: 'var(--brand-text-muted)' }">
                  {{ brand.hero.ctaSecondaryLabel }}
                </UButton>
              </div>
            </div>

            <!-- Right: key metrics preview -->
            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-2 border-l-2 pl-4 brand-card-sm" :style="{ borderColor: 'var(--brand-primary)' }">
                <div>
                  <p class="text-xs" :style="{ color: 'var(--brand-text-muted)' }">{{ brand.founder.name }}</p>
                  <p class="text-sm italic" :style="{ color: `${brand.colors.text}99` }">"{{ brand.hero.founderQuote }}"</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-4 text-xs" :style="{ color: 'var(--brand-text-muted)' }">
                <div v-for="(indicator, idx) in brand.hero.trustIndicators" :key="idx" class="flex items-center gap-1">
                  <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: 'var(--brand-primary)' }" />
                  <span>{{ indicator }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== HERO: INSTITUTIONAL (Assessoria, sobrio, profissional, confiavel) ========== -->
    <section v-if="brand.hero.variant === 'institutional'"  class="relative overflow-hidden px-4 pt-2 md:px-6">
      <!-- Container com imagem de fundo, mesma largura do header (sem padding proprio, usa o do layout) -->
      <div class="relative overflow-hidden rounded-2xl xl:rounded-3xl">
        <!-- Background image -->
        <div
          v-if="brand.hero.image"
          class="absolute inset-0 bg-cover bg-center bg-no-repeat"
          :style="{ backgroundImage: `url(${brand.hero.image})` }"
        />
        <!-- Overlay escuro para legibilidade -->
        <div class="absolute inset-0 bg-black/70" />
        <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />

        <div class="relative mx-auto max-w-4xl px-6 py-20 md:px-12 md:py-28 lg:py-32" style="color: #ffffff">
          <div class="flex flex-col items-center text-center">
            <!-- Logo -->
            <BrandLogo variant="full" class="mb-10 h-10 w-auto md:h-14" />

            <!-- Headline -->
            <h2
              :class="[brand.font.headingWeight]"
              class="mb-5 max-w-3xl text-3xl leading-[1.12] tracking-tight md:text-5xl lg:text-6xl"
              :style="{ fontFamily: `'${brand.font.family}', sans-serif`, color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }"
            >
              <template v-for="(line, i) in brand.hero.title.split('\n')" :key="i">
                {{ line }}<br v-if="i < brand.hero.title.split('\n').length - 1" />
              </template>
            </h2>

            <!-- Subtitulo -->
            <p
              class="mx-auto mb-10 max-w-xl text-base leading-relaxed md:text-lg"
              style="color: rgba(255,255,255,0.9); text-shadow: 0 1px 4px rgba(0,0,0,0.3)"
            >
              {{ brand.hero.subtitle }}
            </p>

            <!-- CTAs -->
            <div class="mb-14 flex flex-col items-center gap-3 sm:flex-row">
              <NuxtLink
                to="/auth/register"
                class="inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-sm font-semibold shadow-lg transition hover:opacity-90"
                :style="{ backgroundColor: 'var(--brand-primary)', color: 'var(--text-on-primary)', boxShadow: `0 8px 30px ${brand.colors.primary}30` }"
              >
                <UIcon :name="brand.hero.ctaIcon || 'i-lucide-briefcase'" class="size-4" />
                {{ brand.hero.ctaLabel }}
              </NuxtLink>
              <NuxtLink
                to="/auth/login"
                class="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-medium backdrop-blur-sm transition"
                style="border: 1px solid rgba(255,255,255,0.25); background: rgba(255,255,255,0.1); color: #ffffff"
                @mouseenter="($event.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)'"
                @mouseleave="($event.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'"
              >
                {{ brand.hero.ctaSecondaryLabel }}
              </NuxtLink>
            </div>

            <!-- Trust indicators -->
            <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:gap-x-8">
              <div
                v-for="(indicator, i) in brand.hero.trustIndicators"
                :key="i"
                class="flex items-center gap-2 text-xs md:text-sm"
                style="color: rgba(255,255,255,0.8); text-shadow: 0 1px 3px rgba(0,0,0,0.3)"
              >
                <span class="h-1 w-1 rounded-full" style="background: rgba(255,255,255,0.7)" />
                {{ indicator }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>




  </div>
</template>

<script setup lang="ts">
import type { IAsset } from '~/types/asset'
import { useFormat } from '~/composables/useFormat'

// Props alimentadas pela pagina pai (pages/index.vue) para passar ao
// hero variant 'quiet' o estado real do mercado, evitando que o
// componente faca seu proprio fetch e duplique requests.
type IbovPoint = { date: string; value: number; timestamp: number }
const props = withDefaults(
  defineProps<{
    ibovSeries?: IbovPoint[]
    ibovLastPrice?: number
    ibovIndicator?: string
    ibovVariationColor?: string
    ifixLastPrice?: number
    ifixIndicator?: string
  }>(),
  {
    ibovSeries: () => [] as IbovPoint[],
    ibovLastPrice: 0,
    ibovIndicator: '+0,00%',
    ibovVariationColor: undefined,
    ifixLastPrice: 0,
    ifixIndicator: '+0,00%',
  },
)

const ibovSeries = computed(() => props.ibovSeries)
const ibovLastPrice = computed(() => props.ibovLastPrice)
const ibovIndicator = computed(() => props.ibovIndicator)
const ibovVariationColor = computed(() => props.ibovVariationColor)
const ifixLastPrice = computed(() => props.ifixLastPrice)
const ifixIndicator = computed(() => props.ifixIndicator)

const brand = useBrand()
const failedLogos = useFailedLogos()
const fmt = useFormat()

// Gate for client-only renders (typewriter + market ticker), avoids
// SSR/hydration mismatches by rendering identical markup on both sides
// initially, then flipping to client content after mount.
const isMounted = ref(false)
onMounted(() => { isMounted.value = true })

// ==========================================================
// TERMINAL HERO (Redentia, Bloomberg-reimagined)
// ==========================================================

// Keyboard shortcut hint matches the platform. Defaults to '⌘' so the
// SSR and initial client paint align; a tiny mounted-time check
// switches it to 'Ctrl' on non-Mac platforms.
const shortcutModifier = ref('⌘')
onMounted(() => {
  if (typeof navigator !== 'undefined' && !/Mac|iP(hone|ad)/.test(navigator.platform)) {
    shortcutModifier.value = 'Ctrl'
  }
})

// Triggers the global QuickSearch by dispatching a synthetic ⌘K. The
// QuickSearch component listens for that exact key combo on document,
// so we don't need any shared state or imperative ref plumbing.
function openQuickSearch() {
  if (typeof document === 'undefined') return
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      ctrlKey: true,
      bubbles: true,
    }),
  )
}

// ==========================================================
// EDITORIAL HERO, Norte Capital "letter from your advisor"
// ==========================================================

// Full-spelled date, editorial style: "Sexta-feira, 10 de abril de 2026"
const editorialDate = computed(() => {
  try {
    const d = new Date()
    const full = d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    // Capitalize first letter ("sexta-feira" -> "Sexta-feira")
    return full.charAt(0).toUpperCase() + full.slice(1)
  } catch {
    return ''
  }
})

// Ritual items, Chapter II of the editorial home. Fictional but realistic.
const editorialRitual = [
  {
    title: 'Carta mensal do seu assessor',
    body: 'Toda primeira sexta-feira do mês, você recebe uma nota pessoal do seu assessor com o que aconteceu na sua carteira, o que foi revisado e o que está em análise. É uma carta, não um dashboard.',
  },
  {
    title: 'Reunião trimestral',
    body: 'A cada trimestre, nos encontramos, presencial ou por vídeo, para revisar a carteira à luz dos seus objetivos. Sem script, sem apresentação de vendas, sem tempo limitado.',
  },
  {
    title: 'Plataforma sempre aberta',
    body: 'Entre as conversas, você acompanha tudo aqui: carteira consolidada, proventos recebidos, próximos vencimentos e as últimas observações do seu assessor. O que importa, quando importa.',
  },
]

// Metrics narrated editorially instead of as vanity counters.
const editorialMetrics = [
  {
    label: 'Famílias atendidas',
    value: '84',
    unit: '',
    note: 'Limitamos o número de clientes por assessor. Quando chegamos ao limite, abrimos lista de espera.',
  },
  {
    label: 'Patrimônio sob consultoria',
    value: 'R$ 412',
    unit: 'mi',
    note: 'Ticket médio de R$ 4,9 milhões por família. Trabalhamos com patrimônios em construção e consolidados.',
  },
  {
    label: 'Anos de mercado',
    value: '18',
    unit: '',
    note: 'Assessoria fundada em 2008, durante a crise financeira. Atravessamos três ciclos completos ao lado dos nossos clientes.',
  },
]

// ==========================================================
// RESEARCH HERO, Investidor Sardinha "AUVP analyst desk"
// ==========================================================

const researchDate = computed(() => {
  try {
    const d = new Date()
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).replace(/^./, (c) => c.toUpperCase())
  } catch {
    return ''
  }
})

interface SardinhaMover {
  ticker: string
  name: string
  price: number
  change: number
}

const researchTopGainers = ref<SardinhaMover[]>([
  { ticker: 'PETR4', name: 'Petrobras PN', price: 38.45, change: 4.18 },
  { ticker: 'VALE3', name: 'Vale ON', price: 62.12, change: 3.76 },
  { ticker: 'WEGE3', name: 'WEG ON', price: 52.30, change: 3.24 },
  { ticker: 'ITUB4', name: 'Itaú Unibanco PN', price: 31.78, change: 2.85 },
  { ticker: 'BBAS3', name: 'Banco do Brasil ON', price: 28.90, change: 2.41 },
  { ticker: 'BBDC4', name: 'Bradesco PN', price: 14.22, change: 2.15 },
  { ticker: 'MGLU3', name: 'Magazine Luiza ON', price: 12.45, change: 1.98 },
  { ticker: 'B3SA3', name: 'B3 ON', price: 11.08, change: 1.76 },
  { ticker: 'RENT3', name: 'Localiza ON', price: 44.20, change: 1.52 },
  { ticker: 'SUZB3', name: 'Suzano ON', price: 56.78, change: 1.34 },
])

const researchTopLosers = ref<SardinhaMover[]>([
  { ticker: 'AMER3', name: 'Americanas ON', price: 1.28, change: -5.82 },
  { ticker: 'CVCB3', name: 'CVC ON', price: 3.45, change: -4.18 },
  { ticker: 'NTCO3', name: 'Natura ON', price: 13.22, change: -3.65 },
  { ticker: 'COGN3', name: 'Cogna ON', price: 2.08, change: -3.12 },
  { ticker: 'CYRE3', name: 'Cyrela ON', price: 21.40, change: -2.78 },
  { ticker: 'PRIO3', name: 'PetroRio ON', price: 42.15, change: -2.45 },
  { ticker: 'USIM5', name: 'Usiminas PNA', price: 7.80, change: -2.18 },
  { ticker: 'CSNA3', name: 'CSN ON', price: 14.60, change: -1.92 },
  { ticker: 'GOAU4', name: 'Metalúrgica Gerdau PN', price: 9.25, change: -1.65 },
  { ticker: 'MRFG3', name: 'Marfrig ON', price: 11.12, change: -1.48 },
])

const researchHeroMarket = computed(() => [
  { label: 'IBOVESPA', note: 'Índice de referência · pontos', value: '127.834', changePct: 1.12 },
  { label: 'IFIX', note: 'Fundos imobiliários · pontos', value: '3.410', changePct: 0.49 },
  { label: 'USD/BRL', note: 'Dólar comercial · fechamento', value: 'R$\u00A05,08', changePct: -0.34 },
  { label: 'Selic', note: 'Meta · ao ano', value: '10,50%', changePct: 0 },
  { label: 'CDI', note: '12 meses · acumulado', value: '11,28%', changePct: 0 },
])

const researchScreener = [
  { ticker: 'BBAS3', name: 'Banco do Brasil ON', sector: 'Bancos', pl: '5,4', pvp: '0,68', roe: '12,5%', dy: '7,7%' },
  { ticker: 'ITSA4', name: 'Itaúsa PN', sector: 'Holding financeira', pl: '7,1', pvp: '0,92', roe: '13,8%', dy: '6,9%' },
  { ticker: 'BBSE3', name: 'BB Seguridade ON', sector: 'Seguros', pl: '9,8', pvp: '2,12', roe: '42,1%', dy: '9,2%' },
  { ticker: 'TAEE11', name: 'Taesa Unit', sector: 'Energia elétrica', pl: '8,6', pvp: '1,45', roe: '17,2%', dy: '8,4%' },
  { ticker: 'VIVT3', name: 'Vivo ON', sector: 'Telecom', pl: '11,2', pvp: '1,08', roe: '10,6%', dy: '6,1%' },
  { ticker: 'EGIE3', name: 'Engie ON', sector: 'Energia elétrica', pl: '8,9', pvp: '2,34', roe: '26,4%', dy: '7,2%' },
  { ticker: 'KLBN11', name: 'Klabin Unit', sector: 'Papel e celulose', pl: '10,4', pvp: '1,82', roe: '17,8%', dy: '5,8%' },
  { ticker: 'WEGE3', name: 'WEG ON', sector: 'Bens industriais', pl: '14,6', pvp: '3,12', roe: '22,1%', dy: '2,4%' },
  { ticker: 'CPFE3', name: 'CPFL Energia ON', sector: 'Energia elétrica', pl: '9,2', pvp: '2,08', roe: '22,5%', dy: '6,5%' },
  { ticker: 'SAPR11', name: 'Sanepar Unit', sector: 'Saneamento', pl: '6,2', pvp: '0,96', roe: '15,4%', dy: '5,2%' },
]

const researchSectors = [
  { sector: 'Bancos', count: 18, avgPL: '6,8', avgDY: '7,2%', highlight: 'BBAS3 · ITSA4' },
  { sector: 'Energia elétrica', count: 24, avgPL: '9,4', avgDY: '6,8%', highlight: 'TAEE11 · EGIE3' },
  { sector: 'Saneamento', count: 6, avgPL: '7,1', avgDY: '5,4%', highlight: 'SAPR11 · SBSP3' },
  { sector: 'Telecom', count: 4, avgPL: '11,8', avgDY: '5,2%', highlight: 'VIVT3' },
  { sector: 'Bens industriais', count: 32, avgPL: '13,2', avgDY: '3,1%', highlight: 'WEGE3 · RAIL3' },
  { sector: 'Commodities', count: 28, avgPL: '8,5', avgDY: '4,8%', highlight: 'VALE3 · SUZB3' },
  { sector: 'Varejo', count: 41, avgPL: '18,6', avgDY: '2,4%', highlight: 'ASAI3 · LREN3' },
  { sector: 'Seguros', count: 8, avgPL: '10,1', avgDY: '6,9%', highlight: 'BBSE3 · PSSA3' },
]

const researchDividends = [
  { exDate: '12/04', payDate: '22/04', ticker: 'BBAS3', type: 'Dividendo', amount: '0,58', unitDY: '2,0%' },
  { exDate: '15/04', payDate: '28/04', ticker: 'TAEE11', type: 'Dividendo', amount: '0,84', unitDY: '2,6%' },
  { exDate: '17/04', payDate: '30/04', ticker: 'ITSA4', type: 'JCP', amount: '0,12', unitDY: '1,3%' },
  { exDate: '19/04', payDate: '05/05', ticker: 'BBSE3', type: 'Dividendo', amount: '1,20', unitDY: '3,2%' },
  { exDate: '22/04', payDate: '07/05', ticker: 'EGIE3', type: 'JCP', amount: '0,92', unitDY: '2,1%' },
  { exDate: '25/04', payDate: '12/05', ticker: 'VIVT3', type: 'Dividendo', amount: '0,65', unitDY: '1,5%' },
  { exDate: '29/04', payDate: '15/05', ticker: 'CPFE3', type: 'Dividendo', amount: '1,08', unitDY: '2,4%' },
  { exDate: '02/05', payDate: '19/05', ticker: 'KLBN11', type: 'Dividendo', amount: '0,42', unitDY: '1,8%' },
]

const researchAnalystNotes = [
  {
    ticker: 'BBAS3',
    date: '10 abr 2026',
    title: 'Banco do Brasil: o desconto do estatal está exagerado?',
    excerpt: 'Múltiplo de 5,4× lucros e DY de 7,7% colocam o BB em faixa historicamente barata frente a pares. Carteira rural segura a tese.',
    verdict: 'Passa nos filtros',
  },
  {
    ticker: 'ITSA4',
    date: '08 abr 2026',
    title: 'Itaúsa: a holding vale mais do que a soma das partes?',
    excerpt: 'Desconto persistente sobre NAV e exposição diversificada para além do Itaú. Veículo eficiente para exposição ao setor financeiro.',
    verdict: 'Passa nos filtros',
  },
  {
    ticker: 'WEGE3',
    date: '05 abr 2026',
    title: 'WEG: múltiplo esticado ou crescimento precificado?',
    excerpt: 'P/L de 14,6× reflete expectativa de crescimento consistente. ROE de 22% valida a tese de moat, mas exige convicção.',
    verdict: 'Neutro · estudar',
  },
  {
    ticker: 'MGLU3',
    date: '02 abr 2026',
    title: 'Magazine Luiza: value trap ou virada operacional?',
    excerpt: 'Margens pressionadas e endividamento elevado. Enquanto não houver melhora estrutural, não passa no filtro de qualidade.',
    verdict: 'Não passa',
  },
  {
    ticker: 'TAEE11',
    date: '28 mar 2026',
    title: 'Taesa: rendimento contratado e previsibilidade',
    excerpt: 'Concessões de transmissão de longo prazo e DY consistente. Clássico ativo de geração de caixa para quem busca renda passiva.',
    verdict: 'Passa nos filtros',
  },
]

const researchAUVPEcosystem = [
  {
    kind: 'CURSO · ESCOLA',
    title: 'AUVP Escola',
    body: 'O curso completo de análise fundamentalista. Mais de 90 horas de aula com Raul Sena, método proprietário e comunidade ativa de alunos. O ponto de partida pra quem quer ir além da plataforma.',
    cta: 'Conhecer a escola',
    url: 'https://auvp.com.br',
  },
  {
    kind: 'CONSULTORIA',
    title: 'AUVP Capital',
    body: 'Consultoria de investimentos registrada CVM, liderada pela equipe do Raul. Para quem já tem patrimônio formado e quer acompanhamento profissional baseado no mesmo método do canal.',
    cta: 'Falar com a Capital',
    url: 'https://auvpcapital.com.br',
  },
  {
    kind: 'PLATAFORMA',
    title: 'AUVP Analítica',
    body: 'Indicadores avançados, screener completo e comparativos de pares. A camada técnica que complementa o estudo iniciado aqui nesta página.',
    cta: 'Explorar ferramentas',
    url: 'https://analitica.auvp.com.br',
  },
  {
    kind: 'LIVRO',
    title: 'Investidor Sardinha · o livro',
    body: 'A síntese em papel do que o canal ensina há anos. Leitura obrigatória para quem prefere livro a vídeo, ou quer um material pra revisar sempre que o mercado testar sua convicção.',
    cta: 'Ver na Amazon',
    url: 'https://amzn.to/investidorsardinha',
  },
  {
    kind: 'CANAL · YOUTUBE',
    title: 'Investidor Sardinha no YouTube',
    body: 'Mais de 1,3 milhão de sardinhas estudando junto. Análises semanais, lives com convidados, tutoriais do método. O ponto de entrada original do ecossistema.',
    cta: 'Abrir o canal',
    url: 'https://youtube.com/@oraulsena',
  },
  {
    kind: 'COMUNIDADE',
    title: 'Grupo VIP · Telegram',
    body: 'Canal oficial com alertas, materiais exclusivos e debate diário da mesa de análise. Fechado para assinantes da plataforma e alunos AUVP.',
    cta: 'Entrar no grupo',
    url: 'https://t.me/investidorsardinha',
  },
]

function formatSardinhaPrice(n: number | string): string {
  return fmt.brl(n)
}

onMounted(async () => {
  if (brand.hero.variant !== 'research') return
  try {
    const service = useAssetsService()
    const [top, bottom] = await Promise.all([
      service.getTopStocks('top', 500_000),
      service.getTopStocks('bottom', 500_000),
    ])
    const toMover = (x: any): SardinhaMover => ({
      ticker: x?.ticker || x?.symbol || '',
      name: (x?.name || '').trim(),
      price: Number(x?.market_price) || 0,
      change: Number(x?.change_percent) || 0,
    })
    if (Array.isArray(top) && top.length >= 5) {
      researchTopGainers.value = top.slice(0, 10).map(toMover)
    }
    if (Array.isArray(bottom) && bottom.length >= 5) {
      researchTopLosers.value = bottom.slice(0, 10).map(toMover)
    }
  } catch {
    // keep seeded fallback
  }
})

// ==========================================================
// MENTOR HERO, Primo Rico "book-cover / masterclass"
// ==========================================================

const mentorArcaPillars = [
  {
    letter: 'A · AÇÕES',
    label: 'Patrimônio de longo prazo',
    description: 'Large caps, small caps e dividendos. Empresas que geram valor por décadas, não operações de curto prazo.',
    to: '/acoes',
  },
  {
    letter: 'R · REAL ESTATE',
    label: 'Renda passiva mensal',
    description: 'Fundos imobiliários com rendimento isento de imposto. Eficiência tributária que só a PF brasileira tem.',
    to: '/fiis',
  },
  {
    letter: 'C · CAIXA',
    label: 'Reserva estratégica',
    description: 'Tesouro Direto, CDB, LCI/LCA. A base que protege o patrimônio nos momentos em que o mercado testa sua convicção.',
    to: '/dividendos',
  },
  {
    letter: 'A · ATIVOS ALTERNATIVOS',
    label: 'Diversificação global',
    description: 'ETFs internacionais, BDRs e exposição externa. Risco controlado, retorno assimétrico, moeda forte.',
    to: '/etfs',
  },
]

const mentorStats = [
  { value: '7M+', label: 'Seguidores no ecossistema' },
  { value: '2M+', label: 'Livros vendidos' },
  { value: '15+', label: 'Anos no mercado' },
  { value: '12.500+', label: 'Ativos monitorados' },
]

// ==========================================================
// "Showtime", Me Poupe! TV-show variant helpers
// ==========================================================

const showtimeDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).toUpperCase()
})

const showtimeCharacters = [
  {
    name: 'Margarete',
    role: 'A MASCOTE',
    icon: 'i-lucide-utensils',
    quote: 'Mexe no dinheiro igual eu mexo na panela, com carinho e atenção!',
    body: 'A colher de pau que virou símbolo de quem cuida do próprio bolso. Na cozinha e nas finanças, ela é a chefe.',
    cta: 'Conhecer a Margarete',
  },
  {
    name: 'Sidnelson',
    role: 'O VILÃO',
    icon: 'i-lucide-credit-card',
    quote: 'Parcela em 12x sem juros que eu resolvo... (spoiler: não resolve)',
    body: 'O cara que vende crédito fácil, convence você a trocar o carro todo ano e adora um financiamento. Fuja dele.',
    cta: 'Como driblar o Sidnelson',
  },
  {
    name: 'Juro Composto',
    role: 'O SUPER-HERÓI',
    icon: 'i-lucide-trending-up',
    quote: 'Me dê tempo e paciência, eu devolvo liberdade financeira.',
    body: 'A oitava maravilha do mundo. Quando está do seu lado, trabalha pra você 24h. Quando está contra, te devora.',
    cta: 'Ver ele em ação',
  },
]

const showtimeQuestions = [
  {
    category: 'SOCORRO GERAL',
    icon: 'i-lucide-life-buoy',
    text: 'Tô devendo no cartão, começo por onde?',
  },
  {
    category: 'RESERVA DE EMERGÊNCIA',
    icon: 'i-lucide-shield-check',
    text: 'Quanto preciso pra me sentir segura?',
  },
  {
    category: 'PRIMEIROS INVESTIMENTOS',
    icon: 'i-lucide-sprout',
    text: 'Posso começar a investir com 100 reais?',
  },
  {
    category: 'APOSENTADORIA',
    icon: 'i-lucide-palm-tree',
    text: 'Como parar de depender do INSS?',
  },
  {
    category: 'FILHOS',
    icon: 'i-lucide-baby',
    text: 'Quanto guardar pra faculdade do meu filho?',
  },
  {
    category: 'CASA PRÓPRIA',
    icon: 'i-lucide-home',
    text: 'Financiar ou juntar e comprar à vista?',
  },
]

interface ShowtimeMover {
  ticker: string
  name: string
  change: number
}

const showtimeGainers = ref<ShowtimeMover[]>([
  { ticker: 'MGLU3', name: 'Magazine Luiza', change: 8.42 },
  { ticker: 'COGN3', name: 'Cogna Educação', change: 6.91 },
  { ticker: 'IRBR3', name: 'IRB Brasil RE', change: 5.77 },
  { ticker: 'AZUL4', name: 'Azul Linhas Aéreas', change: 5.34 },
  { ticker: 'CVCB3', name: 'CVC Brasil', change: 4.88 },
])

const showtimeLosers = ref<ShowtimeMover[]>([
  { ticker: 'VALE3', name: 'Vale', change: -3.21 },
  { ticker: 'PETR4', name: 'Petrobras PN', change: -2.87 },
  { ticker: 'BBAS3', name: 'Banco do Brasil', change: -2.54 },
  { ticker: 'ITUB4', name: 'Itaú Unibanco', change: -2.13 },
  { ticker: 'WEGE3', name: 'WEG', change: -1.98 },
])

onMounted(async () => {
  if (brand.hero.variant !== 'showtime') return
  try {
    const service = useAssetsService()
    const [top, bottom] = await Promise.all([
      service.getTopStocks('top', 500_000),
      service.getTopStocks('bottom', 500_000),
    ])
    const toMover = (x: any): ShowtimeMover => ({
      ticker: x?.ticker || x?.symbol || '',
      name: (x?.name || '').trim(),
      change: Number(x?.change_percent) || 0,
    })
    if (Array.isArray(top) && top.length >= 5) {
      showtimeGainers.value = top.slice(0, 5).map(toMover)
    }
    if (Array.isArray(bottom) && bottom.length >= 5) {
      showtimeLosers.value = bottom.slice(0, 5).map(toMover)
    }
  } catch {
    // keep seeded fallback
  }
})

const showtimeStories = [
  {
    name: 'Carla M.',
    initials: 'CM',
    role: 'Professora, 34 anos · São Paulo',
    quote: 'Comecei devendo R$ 18 mil no rotativo do cartão. Hoje tenho reserva de emergência e invisto todo mês. O que mudou? Parei de fingir que o problema não existia.',
    stats: [
      { value: 'R$ 0', label: 'Dívidas hoje' },
      { value: '14 meses', label: 'Pra virar o jogo' },
    ],
  },
  {
    name: 'Rafael & Bia',
    initials: 'RB',
    role: 'Casal, 29 e 27 anos · Belo Horizonte',
    quote: 'Casamos sem reserva, sem planejamento, achando que o amor bastava. Bastava nada! Hoje temos a casa quitada e o primeiro filho a caminho, sem susto.',
    stats: [
      { value: 'R$ 210k', label: 'Patrimônio' },
      { value: '3 anos', label: 'Do zero até aqui' },
    ],
  },
  {
    name: 'Dona Neide',
    initials: 'DN',
    role: 'Aposentada, 62 anos · Recife',
    quote: 'Achava que era tarde demais pra aprender. Aos 58 comecei a investir os R$ 500 que sobravam. Hoje vivo de renda passiva e ainda ajudo meus netos.',
    stats: [
      { value: 'R$ 2.8k', label: 'Renda passiva/mês' },
      { value: '4 anos', label: 'Investindo' },
    ],
  },
]

// Small roman-numeral helper, used for Chapter II ritual list prefix.
function romanNumeral(n: number): string {
  const romans: Record<number, string> = {
    1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
  }
  return romans[n] || String(n)
}

// ==========================================================
// "Pauta do dia", editorial market movers for Norte Capital
// ==========================================================

interface EditorialMover {
  ticker: string
  name: string
  price: number
  change: number
  note: string
}

const editorialMovers = ref<{ up: EditorialMover[]; down: EditorialMover[] }>({
  up: [
    { ticker: 'PETR4', name: 'Petrobras PN', price: 38.45, change: 2.18, note: 'movimento técnico na véspera do pagamento de JCP' },
    { ticker: 'WEGE3', name: 'WEG ON', price: 52.30, change: 1.24, note: 'expectativa do balanço 3T26' },
  ],
  down: [
    { ticker: 'VALE3', name: 'Vale ON', price: 62.12, change: -1.05, note: 'minério de ferro sob pressão no mercado asiático' },
    { ticker: 'BBDC4', name: 'Bradesco PN', price: 14.22, change: -0.85, note: 'dia de rebalanceamento no IBOV' },
  ],
})

onMounted(async () => {
  if (brand.hero.variant !== 'editorial') return
  try {
    const service = useAssetsService()
    const [top, bottom] = await Promise.all([
      service.getTopStocks('top', 500_000),
      service.getTopStocks('bottom', 500_000),
    ])
    const mapItem = (x: any, fallbackNote: string): EditorialMover => ({
      ticker: x?.ticker || x?.symbol || '',
      name: (x?.name || '').trim() || x?.ticker || '',
      price: Number(x?.market_price) || 0,
      change: Number(x?.change_percent) || 0,
      note: fallbackNote,
    })
    const upNotes = [
      'liderando as altas do pregão',
      'acumulando valorização na semana',
    ]
    const downNotes = [
      'sob pressão vendedora pontual',
      'ajuste técnico após alta recente',
    ]
    if (Array.isArray(top) && top.length >= 2) {
      editorialMovers.value.up = top
        .slice(0, 2)
        .map((t, i) => mapItem(t, upNotes[i] || upNotes[0]!))
    }
    if (Array.isArray(bottom) && bottom.length >= 2) {
      editorialMovers.value.down = bottom
        .slice(0, 2)
        .map((t, i) => mapItem(t, downNotes[i] || downNotes[0]!))
    }
  } catch {
    // keep seeded fallback
  }
})

function formatMoverPrice(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '-'
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
function formatMoverChange(n: number): string {
  if (!Number.isFinite(n)) return '-'
  const sign = n >= 0 ? '+' : '−'
  return `${sign}${Math.abs(n).toFixed(2).replace('.', ',')}%`
}

// ============================================================
// PLAYBOOK HERO, Saraiva Invest "calm method + author anchor"
// ============================================================

const playbookPillars = [
  {
    icon: 'i-lucide-flask-conical',
    title: 'Testa a tese',
    description: 'Antes de comprar qualquer ativo, rode o backtest nos últimos 10 anos. Se a tese não sobrevive ao histórico, ela não sobrevive ao futuro.',
    tag: 'Backtest',
  },
  {
    icon: 'i-lucide-search',
    title: 'Lê o balanço',
    description: 'P/L não é estratégia. Você precisa entender receita, dívida, margem, CAPEX e fluxo de caixa. O trabalho chato é onde mora a vantagem.',
    tag: 'Fundamentalista',
  },
  {
    icon: 'i-lucide-scale',
    title: 'Calcula o preço-teto',
    description: 'Método Bazin pra quem vive de dividendos, Graham pra quem olha crescimento. O preço-teto é seu gatilho, não o humor do mercado.',
    tag: 'Valuation',
  },
  {
    icon: 'i-lucide-timer',
    title: 'Deixa o tempo trabalhar',
    description: 'Juros compostos só funcionam com duas coisas: paciência e consistência. Nenhuma delas cabe num tweet. Ambas cabem num método.',
    tag: 'Composto',
  },
]

function onPhotoError(ev: Event) {
  // If the author photo isn't there yet, just hide the img so the
  // fallback sticker circle renders instead.
  const img = ev.target as HTMLImageElement
  img.style.display = 'none'
}

// ============================================================
// HOLDER HERO, editorial autoral
// ============================================================

const holderEditionDate = computed(() => {
  const d = new Date()
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
  return `${months[d.getMonth()]} ${d.getFullYear()}`
})

const holderTraderTable = ['', '']  // headers rendered inline
const holderTraderRows = [
  {
    trader: 'Olha o gráfico de 5 em 5 minutos.',
    holder: 'Olha o relatório anual uma vez por ano.',
  },
  {
    trader: 'Compra na euforia. Vende no pânico.',
    holder: 'Compra no pânico. Ignora a euforia.',
  },
  {
    trader: 'Quer estar certo todo dia.',
    holder: 'Aceita estar errado por meses.',
  },
  {
    trader: '10 anos · 4.000 trades · R$ 0.',
    holder: '10 anos · 12 posições · R$ 1M.',
  },
]

// Shared ref used by both playbook ranking rows and holderTickerCarousel.
// Fetched on mount (only when the variant needs it) via useAssetsService.
interface RankingBucket {
  stocks: IAsset[]
  etfs: IAsset[]
  reits: IAsset[]
  bdrs: IAsset[]
}
const topAssets = ref<{ top: RankingBucket; bottom: RankingBucket }>({
  top: { stocks: [], etfs: [], reits: [], bdrs: [] },
  bottom: { stocks: [], etfs: [], reits: [], bdrs: [] },
})

onMounted(async () => {
  if (brand.hero.variant !== 'playbook' && brand.hero.variant !== 'holder') return
  try {
    const service = useAssetsService()
    const [topStocks, bottomStocks, topReits] = await Promise.all([
      service.getTopStocks('top', 1_000_000),
      service.getTopStocks('bottom', 1_000_000),
      service.getTopReits('top', 1_000_000),
    ])
    topAssets.value = {
      top: {
        stocks: Array.isArray(topStocks) ? topStocks.slice(0, 8) : [],
        etfs: [],
        reits: Array.isArray(topReits) ? topReits.slice(0, 8) : [],
        bdrs: [],
      },
      bottom: {
        stocks: Array.isArray(bottomStocks) ? bottomStocks.slice(0, 8) : [],
        etfs: [],
        reits: [],
        bdrs: [],
      },
    }
  } catch {
    // keep seeded fallback
  }
})

const holderTickerCarousel = computed(() => {
  type T = { ticker: string; name: string; change: number }
  const out: T[] = []
  const seen = new Set<string>()
  const add = (s: any) => {
    const tk = (s?.ticker || '').toString().trim().toUpperCase()
    if (!tk || seen.has(tk)) return
    seen.add(tk)
    out.push({
      ticker: tk,
      name: (s?.name || '').toString().slice(0, 22),
      change: Number(s?.change_percent || 0),
    })
  }
  ;(topAssets.value?.top?.stocks || []).slice(0, 5).forEach(add)
  ;(topAssets.value?.top?.reits || []).slice(0, 3).forEach(add)
  ;(topAssets.value?.bottom?.stocks || []).slice(0, 4).forEach(add)
  ;(topAssets.value?.top?.stocks || []).slice(5, 7).forEach(add)

  if (out.length === 0) {
    return [
      { ticker: 'PETR4', name: 'Petrobras', change: 0.42 },
      { ticker: 'VALE3', name: 'Vale', change: -0.18 },
      { ticker: 'ITUB4', name: 'Itaú Unibanco', change: 1.12 },
      { ticker: 'BBAS3', name: 'Banco do Brasil', change: 0.84 },
      { ticker: 'WEGE3', name: 'WEG', change: 1.85 },
      { ticker: 'BBSE3', name: 'BB Seguridade', change: 0.27 },
      { ticker: 'EGIE3', name: 'Engie Brasil', change: -0.11 },
      { ticker: 'B3SA3', name: 'B3', change: 0.58 },
      { ticker: 'MXRF11', name: 'Maxi Renda', change: 0.31 },
      { ticker: 'KNCR11', name: 'Kinea Rendimentos', change: 0.12 },
    ]
  }
  return out
})

const holderPositions = [
  { ticker: 'ITUB4', sector: 'Bancos', thesis: 'Moat regulatório, 30M de clientes, ROE consistente acima de 18%.', since: '2014' },
  { ticker: 'WEGE3', sector: 'Indústria', thesis: 'A única indústria brasileira que compete em pé de igualdade no mundo.', since: '2016' },
  { ticker: 'BBSE3', sector: 'Seguros', thesis: 'Margem operacional altíssima. Payout altíssimo. Capex baixo.', since: '2018' },
  { ticker: 'EGIE3', sector: 'Energia', thesis: 'Geradora hidrelétrica com contratos longos. Boring is beautiful.', since: '2020' },
  { ticker: 'B3SA3', sector: 'Bolsa', thesis: 'Monopólio natural. Cobra até dos traders que perdem dinheiro.', since: '2021' },
]
</script>

<style scoped>
/* ========== TERMINAL HERO — QuickSearch pill replica ==========
   Mirrors the real floating QuickSearch pill: rounded-full glass
   surface, primary border on hover, soft glow ring. Hovering it
   gives the same affordance the real pill has so users intuit
   that clicking opens a real search. */
.qs-replica {
  cursor: pointer;
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  box-shadow: 0 12px 32px -12px rgba(0, 0, 0, 0.4);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}
.qs-replica:hover {
  border-color: var(--brand-primary, #f5b301) !important;
  box-shadow:
    0 12px 32px -12px rgba(0, 0, 0, 0.4),
    0 0 0 3px color-mix(in srgb, var(--brand-primary, #f5b301) 25%, transparent);
}
.qs-replica:focus-visible {
  border-color: var(--brand-primary, #f5b301) !important;
  box-shadow:
    0 12px 32px -12px rgba(0, 0, 0, 0.4),
    0 0 0 3px color-mix(in srgb, var(--brand-primary, #f5b301) 25%, transparent);
}

/* ========== PLAYBOOK HERO (Saraiva Invest) ========== */
.playbook-hero {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-feature-settings: 'ss01', 'cv11';
}

.playbook-hero .pb-title,
.playbook-hero .pb-manifesto,
.playbook-hero .pb-section-title,
.playbook-hero .pb-final-title,
.playbook-hero .pb-quote {
  font-family: 'Fredoka', 'Inter', system-ui, sans-serif;
  font-weight: 700;
}

.playbook-hero .pb-subtitle {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 400;
}

.playbook-hero .pb-eyebrow,
.playbook-hero .pb-badge-text {
  font-family: 'Fredoka', 'Inter', system-ui, sans-serif;
}

/* Sticker-style highlight, mimics the chunky white-stroke logo effect */
.playbook-hero .pb-sticker {
  display: inline-block;
  font-family: 'Fredoka', 'Inter', system-ui, sans-serif;
  font-weight: 700;
  position: relative;
  padding: 0 0.05em;
}

.playbook-hero .pb-sticker-outline {
  background: var(--sticker-bg, #F5F5F7);
  color: var(--sticker-fg, #0B0B0E) !important;
  padding: 0.02em 0.25em;
  border-radius: 0.15em;
  -webkit-text-stroke: 2px var(--sticker-fg, #0B0B0E);
  box-shadow:
    -3px 3px 0 var(--sticker-fg, #0B0B0E),
    0 0 0 4px var(--sticker-bg, #F5F5F7),
    -3px 3px 0 4px var(--sticker-fg, #0B0B0E);
  transform: rotate(-1.5deg);
}

/* Cabeça Quente sticker, red, hot, slightly tilted opposite way */
.playbook-hero .pb-sticker-hot {
  display: inline-block;
  background: #EF4444;
  color: #FFFFFF !important;
  padding: 0.02em 0.3em;
  border-radius: 0.15em;
  font-family: 'Fredoka', 'Inter', system-ui, sans-serif;
  font-weight: 700;
  box-shadow:
    -3px 3px 0 #0B0B0E,
    0 0 0 4px #FFFFFF,
    -3px 3px 0 4px #0B0B0E;
  transform: rotate(2deg);
}

/* Cabeça Fria sticker, amber, cold, tilted opposite */
.playbook-hero .pb-sticker-cold {
  display: inline-block;
  font-family: 'Fredoka', 'Inter', system-ui, sans-serif;
  font-weight: 700;
}

/* Villain card sweat drop animation */
@keyframes pb-sweat-drop {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.85; }
  50% { transform: translateY(6px) scale(0.85); opacity: 0.4; }
}

.playbook-hero .pb-sweat {
  animation: pb-sweat-drop 1.4s ease-in-out infinite;
}
.playbook-hero .pb-sweat-2 {
  animation-delay: 0.7s;
}

/* Villain card subtle pulse to feel "agitated" */
@keyframes pb-villain-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  50% { box-shadow: 0 0 60px -10px rgba(239, 68, 68, 0.3); }
}

.playbook-hero .pb-villain {
  animation: pb-villain-pulse 3s ease-in-out infinite;
}

/* Ranking row hover */
.playbook-hero .pb-ranking-row {
  transition: background-color 0.2s ease, transform 0.2s ease;
}
.playbook-hero .pb-ranking-row:hover {
  background-color: rgba(230, 126, 34, 0.08);
  transform: translateX(2px);
}

/* Ranking card subtle hover */
.playbook-hero .pb-ranking {
  transition: border-color 0.3s ease, transform 0.4s ease;
}
.playbook-hero .pb-ranking:hover {
  border-color: rgba(230, 126, 34, 0.5);
  transform: translateY(-2px);
}

/* Author photo ring, slow rotating stroke */
@keyframes pb-ring-rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.playbook-hero .pb-author-ring {
  animation: pb-ring-rotate 40s linear infinite;
  border-style: dashed;
}

/* Author photo subtle float */
@keyframes pb-author-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.playbook-hero .pb-author-photo {
  animation: pb-author-float 6s ease-in-out infinite;
}

/* Signature tag bobs gently */
@keyframes pb-tag-bob {
  0%, 100% { transform: rotate(-4deg) translateY(0); }
  50% { transform: rotate(-4deg) translateY(-4px); }
}

.playbook-hero .pb-signature-tag {
  animation: pb-tag-bob 5s ease-in-out infinite;
}

/* Pillar card hover lift */
.playbook-hero .pb-pillar {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.3s ease,
              background-color 0.3s ease;
}

.playbook-hero .pb-pillar:hover {
  border-color: var(--sticker-bg, rgba(230, 126, 34, 0.5)) !important;
}

/* Pill CTA hover */
.playbook-hero .pb-cta-primary {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* Responsive: smaller sticker effect on mobile */
@media (max-width: 768px) {
  .playbook-hero .pb-sticker-outline {
    box-shadow:
      -2px 2px 0 var(--sticker-fg, #0B0B0E),
      0 0 0 3px var(--sticker-bg, #F5F5F7),
      -2px 2px 0 3px var(--sticker-fg, #0B0B0E);
  }

  .playbook-hero .pb-author-ring,
  .playbook-hero .pb-author-circle {
    display: none !important;
  }
}

/* ========== HOLDER HERO (sentencious editorial) ========== */
.holder-hero {
  font-family: 'Spectral', 'Georgia', serif;
  font-feature-settings: 'kern', 'liga';
}

.holder-hero .hl-display {
  font-family: 'Anton', 'Bebas Neue', 'Inter', sans-serif !important;
  font-weight: 400;
  text-transform: uppercase;
}

.holder-hero .hl-serif {
  font-family: 'Spectral', 'Georgia', serif !important;
}

.holder-hero .hl-mono {
  font-family: 'JetBrains Mono', ui-monospace, 'Menlo', monospace !important;
}

/* Drop cap for first paragraph of doutrina */
.holder-hero .hl-drop-cap {
  font-family: 'Anton', 'Bebas Neue', sans-serif;
  font-size: 4em;
  line-height: 0.8;
  float: left;
  padding: 0.05em 0.12em 0 0;
  margin-top: 0.05em;
}

/* CTA primary, sharp flat rectangle, no border, no offset shadow */
.holder-hero .hl-cta-primary {
  border-radius: 0;
  letter-spacing: 0.18em;
  position: relative;
  transition: all 0.2s ease;
}
.holder-hero .hl-cta-primary:hover {
  filter: brightness(1.1);
}

/* Editorial portrait subtle hover lift */
.holder-hero .hl-portrait {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.holder-hero .hl-portrait:hover {
  transform: scale(1.02);
}

/* Marquee band, slow elegant horizontal scroll
   The track contains TWO copies of the ticker list rendered inline.
   We translate -50% so the second copy seamlessly takes over when the
   first scrolls out, no visible jump. */
.holder-hero .hl-marquee {
  position: relative;
  width: 100%;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent 0,
    #000 8%,
    #000 92%,
    transparent 100%
  );
  mask-image: linear-gradient(
    90deg,
    transparent 0,
    #000 8%,
    #000 92%,
    transparent 100%
  );
}

.holder-hero .hl-marquee-track {
  display: flex;
  align-items: center;
  width: max-content;
  animation: hl-marquee-scroll 60s linear infinite;
}

.holder-hero .hl-marquee-band:hover .hl-marquee-track {
  animation-play-state: paused;
}

.holder-hero .hl-marquee-item {
  flex-shrink: 0;
}

@keyframes hl-marquee-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* Typographic strip on top */
.holder-hero .hl-strip {
  font-family: 'JetBrains Mono', monospace;
}
</style>

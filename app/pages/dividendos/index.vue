<!--
  /dividendos — Editorial guide on dividends, Stripe-styled.

  Replaces the prior `prose prose-invert` + `font-bold` + `text-gray-*`
  treatment with the redentia-stripe-style typography system:
    - eyebrow (mono tabular, 0.18em, 11px) → display heading (weight
      300, clamp 28-44px, negative letter-spacing) → body large (17px,
      1.55 lh, color-mix on brand text).
    - Sub-headings 22-26px medium (500), not bold.
    - Strong terms via weight 500, not <strong> tags inheriting prose.
    - All colors derived from brand tokens via color-mix — no
      `text-gray-400`, no `text-white`, no hardcoded amber/yellow.

  The SEO content (FAQ + HowTo + BreadcrumbList structured data)
  stays identical, so Google sees no diff.
-->
<template>
  <NuxtLayout name="static" title="Dividendos">
    <section class="flex flex-col gap-16 px-6 py-10 md:py-14">
      <!-- ============ Hero ============ -->
      <header class="flex max-w-3xl flex-col gap-3">
        <span
          class="font-mono-tab text-[11px] font-medium uppercase"
          :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
        >Guia · Dividendos</span>
        <h1
          class="font-light"
          :style="{
            color: brand.colors.text,
            fontSize: 'clamp(32px, 5vw, 48px)',
            lineHeight: 1.05,
            letterSpacing: '-1.2px',
          }"
        >Dividendos: renda passiva com ações e FIIs</h1>
        <p
          class="max-w-2xl"
          :style="{
            fontSize: '17.5px',
            lineHeight: 1.55,
            color: `color-mix(in srgb, ${brand.colors.text} 72%, transparent)`,
          }"
        >Como construir uma carteira de dividendos e viver de renda passiva. As melhores ações e FIIs pagadores do Brasil, sem misticismo nem promessa de rentabilidade.</p>
      </header>

      <!-- ============ Section: O que são? ============ -->
      <section class="flex flex-col gap-5">
        <SectionHeading :brand="brand" eyebrow="01 · Conceito" title="O que são dividendos" />
        <p :style="bodyStyle" class="max-w-3xl">
          Dividendos são a parcela dos lucros que as empresas distribuem
          aos acionistas. Quando você compra uma ação, vira sócio da
          empresa e tem direito a parte dos lucros na forma de dividendos.
        </p>

        <!-- Highlight card -->
        <article
          class="flex flex-col gap-2 rounded-xl border p-5"
          :style="highlightCardStyle"
        >
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-check-circle-2"
              class="size-4"
              :style="{ color: brand.colors.positive }"
            />
            <span
              class="font-mono-tab text-[10.5px] font-medium uppercase"
              :style="{ letterSpacing: '0.18em', color: brand.colors.positive }"
            >Vantagem fiscal</span>
          </div>
          <h3
            class="text-[18px] font-medium"
            :style="{ color: brand.colors.text, letterSpacing: '-0.22px' }"
          >Isenção total de imposto de renda</h3>
          <p :style="bodyStyle">
            Dividendos de ações e FIIs são <span :style="strongStyle">100% isentos de IR</span> para pessoa física no Brasil. Todo valor que cair na conta é seu inteiro — vantagem grande pra construir renda passiva.
          </p>
        </article>
      </section>

      <!-- ============ Section: Como funcionam ============ -->
      <section class="flex flex-col gap-6">
        <SectionHeading :brand="brand" eyebrow="02 · Mecânica" title="Como funcionam os dividendos" />
        <ol class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <li
            v-for="(step, idx) in mechanicSteps"
            :key="step.title"
            class="flex flex-col gap-2 rounded-xl border p-5"
            :style="cardStyle"
          >
            <span
              class="font-mono-tab text-[10.5px] font-medium uppercase tabular-nums"
              :style="{
                letterSpacing: '0.18em',
                color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
              }"
            >Passo 0{{ idx + 1 }}</span>
            <h3
              class="text-[16px] font-medium"
              :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
            >{{ step.title }}</h3>
            <p :style="bodySmallStyle">{{ step.body }}</p>
          </li>
        </ol>
      </section>

      <!-- ============ Section: Tipos de proventos ============ -->
      <section class="flex flex-col gap-6">
        <SectionHeading :brand="brand" eyebrow="Glossário" title="Tipos de proventos (além de dividendos)" />
        <dl class="flex flex-col">
          <div
            v-for="t in proventoTypes"
            :key="t.term"
            class="grid grid-cols-1 gap-1.5 border-b py-4 last:border-b-0 md:grid-cols-[260px_1fr] md:gap-8 md:py-5"
            :style="{
              borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
            }"
          >
            <dt class="flex items-baseline gap-2">
              <span
                class="size-1 shrink-0 rounded-full"
                :style="{ backgroundColor: brand.colors.primary }"
              />
              <span
                class="text-[14.5px] font-medium"
                :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
              >{{ t.term }}</span>
            </dt>
            <dd :style="bodyStyle">{{ t.def }}</dd>
          </div>
        </dl>
      </section>

      <!-- ============ Section: Dividend Yield ============ -->
      <section class="flex flex-col gap-5">
        <SectionHeading :brand="brand" eyebrow="03 · Indicador" title="Dividend Yield, o medidor que importa" />
        <p :style="bodyStyle" class="max-w-3xl">
          O Dividend Yield (DY) é o percentual recebido em dividendos no
          ano, em relação ao preço atual da ação. Quanto maior o DY,
          maior a renda relativa — mas alto demais costuma ser sinal de
          preço caindo, não de generosidade.
        </p>

        <article
          class="flex flex-col gap-3 rounded-xl border p-5"
          :style="cardStyle"
        >
          <div
            class="font-mono-tab text-[14px] tabular-nums"
            :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
          >DY = (dividendos últimos 12 meses ÷ preço atual) × 100</div>
          <p :style="bodySmallStyle">
            <span :style="strongStyle">Exemplo:</span> ação a R$ 40 que pagou R$ 3,20 no ano = DY de 8%.
          </p>
          <hr
            class="my-1"
            :style="{
              border: 0,
              borderTop: `1px solid color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
            }"
          >
          <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div :style="bodySmallStyle">
              <span :style="strongStyle">DY bom em ações:</span> 4–8% ao ano
            </div>
            <div :style="bodySmallStyle">
              <span :style="strongStyle">DY bom em FIIs:</span> 8–12% ao ano
            </div>
          </div>
        </article>
      </section>

      <!-- ============ Section: Setores pagadores ============ -->
      <section class="flex flex-col gap-6">
        <SectionHeading :brand="brand" eyebrow="04 · Setores" title="Onde os dividendos vivem" />
        <p :style="bodyStyle" class="max-w-3xl">
          Setores tradicionalmente pagadores no Brasil — cada um com perfil de risco e DY característicos.
        </p>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          <article
            v-for="s in sectorBenchmarks"
            :key="s.name"
            class="flex flex-col gap-2 rounded-xl border p-4"
            :style="cardStyle"
          >
            <span
              class="font-mono-tab text-[10.5px] font-medium uppercase"
              :style="{
                letterSpacing: '0.16em',
                color: brand.colors.primary,
              }"
            >{{ s.dy }}</span>
            <h3
              class="text-[15px] font-medium"
              :style="{ color: brand.colors.text }"
            >{{ s.name }}</h3>
            <p
              class="font-mono-tab text-[12px] tabular-nums"
              :style="{
                color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)`,
              }"
            >{{ s.tickers }}</p>
          </article>
        </div>
      </section>

      <!-- ============ Section: Estratégia ============ -->
      <section class="flex flex-col gap-6">
        <SectionHeading :brand="brand" eyebrow="05 · Estratégia" title="Como viver de dividendos" />
        <ol class="flex flex-col gap-3">
          <li
            v-for="(step, idx) in strategySteps"
            :key="step.title"
            class="flex gap-4 rounded-xl border p-5"
            :style="cardStyle"
          >
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-lg font-mono-tab text-[14px] font-medium tabular-nums"
              :style="{
                backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 12%, transparent)`,
                color: brand.colors.primary,
              }"
            >{{ idx + 1 }}</span>
            <div class="flex flex-col gap-1">
              <h3
                class="text-[16px] font-medium"
                :style="{ color: brand.colors.text }"
              >{{ step.title }}</h3>
              <p :style="bodySmallStyle">{{ step.body }}</p>
            </div>
          </li>
        </ol>
      </section>

      <!-- ============ Section: Exemplo prático ============ -->
      <section class="flex flex-col gap-5">
        <SectionHeading :brand="brand" eyebrow="Exemplo" title="Como isso funciona na prática" />
        <article
          class="flex flex-col gap-3 rounded-xl border p-6"
          :style="highlightCardStyle"
        >
          <p :style="bodyStyle">
            João tem <span :style="strongStyle">R$ 300 mil</span> investidos em ações e FIIs com DY médio de 9% ao ano.
          </p>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div
              class="rounded-lg p-3"
              :style="{
                backgroundColor: `color-mix(in srgb, ${brand.colors.background} 50%, transparent)`,
              }"
            >
              <span
                class="font-mono-tab text-[10.5px] font-medium uppercase"
                :style="{
                  letterSpacing: '0.18em',
                  color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)`,
                }"
              >Renda anual</span>
              <div
                class="font-mono-tab text-[20px] font-light tabular-nums"
                :style="{
                  color: brand.colors.positive,
                  letterSpacing: '-0.02em',
                }"
              >R$ 27.000</div>
              <div
                class="font-mono-tab text-[11px] tabular-nums"
                :style="{
                  color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)`,
                }"
              >R$ 300.000 × 9%</div>
            </div>
            <div
              class="rounded-lg p-3"
              :style="{
                backgroundColor: `color-mix(in srgb, ${brand.colors.background} 50%, transparent)`,
              }"
            >
              <span
                class="font-mono-tab text-[10.5px] font-medium uppercase"
                :style="{
                  letterSpacing: '0.18em',
                  color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)`,
                }"
              >Renda mensal</span>
              <div
                class="font-mono-tab text-[20px] font-light tabular-nums"
                :style="{
                  color: brand.colors.positive,
                  letterSpacing: '-0.02em',
                }"
              >R$ 2.250</div>
              <div
                class="font-mono-tab text-[11px] tabular-nums"
                :style="{
                  color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)`,
                }"
              >R$ 27.000 ÷ 12</div>
            </div>
          </div>
          <p :style="bodySmallStyle">
            Os R$ 2.250 caem isentos de IR todo mês, sem João precisar fazer nada.
          </p>
        </article>
      </section>

      <!-- ============ Section: Cuidados ============ -->
      <section class="flex flex-col gap-5">
        <SectionHeading :brand="brand" eyebrow="Atenção" title="Cuidados antes de comprar por dividendos" />
        <ul class="flex flex-col gap-3">
          <li
            v-for="c in cautions"
            :key="c.title"
            class="flex gap-3 rounded-xl border p-4"
            :style="warnCardStyle"
          >
            <UIcon
              name="i-lucide-alert-triangle"
              class="mt-0.5 size-4 shrink-0"
              :style="{ color: brand.colors.warning || '#f59e0b' }"
            />
            <div class="flex flex-col gap-0.5">
              <h3
                class="text-[14.5px] font-medium"
                :style="{ color: brand.colors.text }"
              >{{ c.title }}</h3>
              <p :style="bodySmallStyle">{{ c.body }}</p>
            </div>
          </li>
        </ul>
      </section>

      <!-- ============ Section: Carteira de exemplo ============ -->
      <section class="flex flex-col gap-5">
        <SectionHeading :brand="brand" eyebrow="Composição" title="Carteira de dividendos de exemplo" />
        <article
          class="overflow-hidden rounded-xl border"
          :style="cardStyle"
        >
          <div
            v-for="(row, idx) in portfolioRows"
            :key="row.bucket"
            class="flex items-center justify-between gap-4 border-b px-5 py-3"
            :class="idx === portfolioRows.length - 1 ? '!border-b-0' : ''"
            :style="{
              borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
            }"
          >
            <div class="flex min-w-0 items-center gap-3">
              <span
                class="font-mono-tab text-[12px] font-medium tabular-nums"
                :style="{
                  color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)`,
                  width: '40px',
                }"
              >{{ row.weight }}</span>
              <span
                class="text-[14.5px]"
                :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
              >{{ row.bucket }}</span>
            </div>
            <span
              class="font-mono-tab text-[12px] tabular-nums"
              :style="{
                color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`,
              }"
            >{{ row.dy }}</span>
          </div>
          <div
            class="flex items-center justify-between gap-4 px-5 py-4"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 8%, transparent)`,
              borderTop: `1px solid color-mix(in srgb, ${brand.colors.primary} 30%, transparent)`,
            }"
          >
            <span
              class="text-[14.5px] font-medium"
              :style="{ color: brand.colors.text }"
            >Dividend Yield médio</span>
            <span
              class="font-mono-tab text-[15px] font-medium tabular-nums"
              :style="{ color: brand.colors.primary, letterSpacing: '-0.005em' }"
            >~8,5% ao ano</span>
          </div>
        </article>
      </section>

      <!-- ============ Featured links ============ -->
      <section class="flex flex-col gap-3">
        <NuxtLink
          v-for="link in featuredLinks"
          :key="link.to"
          :to="link.to"
          class="ranking-card group flex items-center justify-between gap-4 rounded-xl border p-5 transition-[border-color,background-color]"
          :style="cardStyle"
        >
          <div class="flex flex-col gap-1">
            <span
              class="font-mono-tab text-[10.5px] font-medium uppercase"
              :style="{
                letterSpacing: '0.18em',
                color: brand.colors.primary,
              }"
            >{{ link.eyebrow }}</span>
            <h3
              class="text-[18px] font-medium"
              :style="{ color: brand.colors.text, letterSpacing: '-0.22px' }"
            >{{ link.title }}</h3>
            <p :style="bodySmallStyle">{{ link.body }}</p>
          </div>
          <UIcon
            name="i-lucide-arrow-up-right"
            class="size-5 shrink-0 transition-[transform,opacity] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            :style="{ color: brand.colors.primary }"
          />
        </NuxtLink>
      </section>

      <!-- ============ FAQ ============ -->
      <section class="flex flex-col gap-5">
        <SectionHeading :brand="brand" eyebrow="FAQ" title="Perguntas frequentes" />
        <div class="flex flex-col gap-3">
          <details
            v-for="qa in faq"
            :key="qa.q"
            class="group rounded-xl border p-4 transition-[border-color]"
            :style="cardStyle"
          >
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-medium"
              :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
            >
              {{ qa.q }}
              <UIcon
                name="i-lucide-chevron-down"
                class="size-4 shrink-0 transition-transform group-open:rotate-180"
                :style="{ color: brand.colors.primary }"
              />
            </summary>
            <p class="mt-3" :style="bodySmallStyle">{{ qa.a }}</p>
          </details>
        </div>
      </section>

      <!-- ============ Bottom CTA ============ -->
      <MoleculesCtaSection
        title="Encontre os melhores pagadores de dividendos"
        description="Compare dividend yield, histórico de pagamentos e consistência."
        :buttons="[
          { label: 'Buscar ativos', to: '/search', icon: 'i-lucide-search', variant: 'primary' },
          { label: 'Calcular renda passiva', to: '/calculadora', icon: 'i-lucide-calculator', variant: 'outline' },
          { label: 'Glossário', to: '/glossario/dividendos', icon: 'i-lucide-book-open', variant: 'ghost' },
        ]"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
const brand = useBrand()

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title:
    `Dividendos: Guia Completo para Viver de Renda Passiva | ${brand.name}`,
  description:
    'Como construir uma carteira de dividendos e viver de renda passiva. Melhores ações e FIIs pagadores, estratégias, cálculos e dividend yield. Isenção de IR. Guia 2026.',
  path: '/dividendos',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Quanto preciso investir para receber R$ 1.000/mês em dividendos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Com dividend yield médio de 8% ao ano, você precisaria de aproximadamente R$ 150.000 investidos.',
          },
        },
        {
          '@type': 'Question',
          name: 'Dividendos pagam Imposto de Renda?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não! Dividendos de ações e rendimentos de FIIs são 100% isentos de Imposto de Renda para pessoas físicas.',
          },
        },
        {
          '@type': 'Question',
          name: 'Devo reinvestir dividendos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Se você ainda está acumulando patrimônio: sim! Reinvestir acelera o crescimento através dos juros compostos.',
          },
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Como Viver de Dividendos',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Calcule sua necessidade mensal',
          text: 'Defina quanto precisa receber por mês de renda passiva.',
        },
        {
          '@type': 'HowToStep',
          name: 'Defina dividend yield alvo',
          text: 'Estabeleça um dividend yield médio realista (6-9%).',
        },
        {
          '@type': 'HowToStep',
          name: 'Calcule patrimônio necessário',
          text: 'Divida necessidade anual pelo dividend yield.',
        },
        {
          '@type': 'HowToStep',
          name: 'Monte carteira diversificada',
          text: 'Combine ações pagadoras e FIIs para balancear risco e retorno.',
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: brand.url,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Dividendos',
          item: `${brand.url}/dividendos`,
        },
      ],
    },
  ],
})

// ---------- Style helpers (computed once for reuse) ----------

const bodyStyle = computed(() => ({
  fontSize: '16px',
  lineHeight: 1.55,
  color: `color-mix(in srgb, ${brand.colors.text} 75%, transparent)`,
}))

const bodySmallStyle = computed(() => ({
  fontSize: '14px',
  lineHeight: 1.55,
  color: `color-mix(in srgb, ${brand.colors.text} 68%, transparent)`,
}))

const strongStyle = computed(() => ({
  fontWeight: 500,
  color: brand.colors.text,
}))

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))

const highlightCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.positive} 6%, ${brand.colors.surface})`,
  borderColor: `color-mix(in srgb, ${brand.colors.positive} 28%, transparent)`,
}))

const warnCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.warning || '#f59e0b'} 6%, ${brand.colors.surface})`,
  borderColor: `color-mix(in srgb, ${brand.colors.warning || '#f59e0b'} 24%, transparent)`,
}))

// ---------- Editorial copy ----------

const mechanicSteps = [
  {
    title: 'Empresa anuncia dividendos',
    body: 'Conselho decide distribuir parte dos lucros e anuncia o valor por ação (ex: R$ 0,50 por ação).',
  },
  {
    title: 'Data-com (último dia com direito)',
    body: 'Quem tiver a ação até essa data tem direito ao provento. Tem que comprar no dia-com ou antes.',
  },
  {
    title: 'Data-ex (primeiro dia sem direito)',
    body: 'Dia útil seguinte à data-com. Quem comprar a partir daqui não recebe esse dividendo. O preço cai proporcionalmente.',
  },
  {
    title: 'Data de pagamento',
    body: 'Dividendo cai automático na conta da corretora. Pode levar de dias a semanas após a data-com.',
  },
]

const proventoTypes = [
  {
    term: 'Dividendos',
    def: 'Distribuição de lucros em dinheiro. Isento de IR para pessoa física.',
  },
  {
    term: 'JCP — Juros sobre Capital Próprio',
    def: 'Tributado em 15% na fonte, mas vantajoso pra empresa por ser dedutível do imposto sobre lucros.',
  },
  {
    term: 'Bonificação',
    def: 'Distribuição de novas ações aos acionistas existentes, em vez de pagamento em dinheiro. Não muda valor patrimonial.',
  },
  {
    term: 'Direitos de subscrição',
    def: 'Direito de comprar novas ações com desconto antes do mercado em geral.',
  },
] as const

const sectorBenchmarks = [
  { name: 'Bancos', tickers: 'ITUB4 · BBDC4 · BBAS3 · SANB11', dy: 'DY 6–10%' },
  { name: 'Energia elétrica', tickers: 'TAEE11 · ELET3 · CPLE6', dy: 'DY 8–12%' },
  { name: 'Seguradoras', tickers: 'BBSE3 · PSSA3', dy: 'DY 5–8%' },
  { name: 'Saneamento', tickers: 'SAPR11 · SBSP3', dy: 'DY 4–7%' },
] as const

const strategySteps = [
  {
    title: 'Calcule sua necessidade mensal',
    body: 'Quanto você precisa por mês? Ex: R$ 5.000/mês = R$ 60.000/ano.',
  },
  {
    title: 'Defina o dividend yield alvo',
    body: 'Use uma média realista pra carteira inteira — 6 a 9% é razoável misturando ações e FIIs.',
  },
  {
    title: 'Calcule o patrimônio necessário',
    body: 'Divida a necessidade anual pelo DY alvo. Ex: R$ 60.000 ÷ 0,08 = R$ 750.000.',
  },
  {
    title: 'Monte uma carteira diversificada',
    body: 'Cerca de 50% FIIs (renda mensal) + 50% ações pagadoras (renda + crescimento).',
  },
  {
    title: 'Reinvista no início',
    body: 'Enquanto está acumulando, reinveste tudo. Os juros compostos fazem o trabalho pesado.',
  },
  {
    title: 'No alvo, use a renda',
    body: 'Quando o patrimônio bate a meta, para de reinvestir e vive dos pagamentos mensais.',
  },
] as const

const cautions = [
  {
    title: 'DY alto nem sempre é bom',
    body: 'Costuma sinalizar preço caindo (empresa em crise), não generosidade. Olha o histórico antes de comprar pelo número.',
  },
  {
    title: 'Verifique sustentabilidade',
    body: 'A empresa consegue manter esses dividendos? Payout abaixo de 100% é o piso pra confiar na recorrência.',
  },
  {
    title: 'Consistência importa mais que pico',
    body: 'Empresas que pagam há 10+ anos sem cortar valem mais que dividendos esporádicos altos.',
  },
  {
    title: 'Não ignore crescimento',
    body: 'Empresa que só paga dividendos e não cresce pode estagnar. Equilibre yield com perspectiva de valorização.',
  },
] as const

const portfolioRows = [
  { bucket: 'Ações de bancos', weight: '20%', dy: 'DY ~7%' },
  { bucket: 'Ações de energia', weight: '15%', dy: 'DY ~9%' },
  { bucket: 'Ações de seguros', weight: '10%', dy: 'DY ~6%' },
  { bucket: 'FIIs de tijolo', weight: '25%', dy: 'DY ~10%' },
  { bucket: 'FIIs de papel', weight: '20%', dy: 'DY ~11%' },
  { bucket: 'Reserva (Tesouro Selic)', weight: '10%', dy: '—' },
] as const

const featuredLinks = [
  {
    to: '/search?group=stocks',
    eyebrow: 'Renda variável',
    title: 'Maiores pagadoras de dividendos (ações)',
    body: 'Bancos, elétricas, seguradoras e outras ações com alto dividend yield e histórico consistente.',
  },
  {
    to: '/search?group=reits',
    eyebrow: 'FIIs',
    title: 'FIIs com melhores dividendos',
    body: 'Fundos imobiliários com rendimentos mensais isentos de IR.',
  },
] as const

const faq = [
  {
    q: 'Quanto preciso investir para receber R$ 1.000/mês em dividendos?',
    a: 'Com dividend yield médio de 8% ao ano (FIIs), você precisaria de cerca de R$ 150.000 investidos (150.000 × 8% = 12.000/ano = 1.000/mês). Com ações (DY ~6%), precisaria de cerca de R$ 200.000.',
  },
  {
    q: 'Dividendos pagam Imposto de Renda?',
    a: 'Não. Dividendos de ações e rendimentos de FIIs são 100% isentos de IR para pessoas físicas. JCP (juros sobre capital próprio) tem retenção de 15% na fonte.',
  },
  {
    q: 'É melhor dividendos de ações ou FIIs?',
    a: 'FIIs geralmente pagam mais (8–12% vs 4–8% de ações) e com maior frequência (mensal). Ações têm potencial de valorização maior. O ideal é ter ambos: FIIs para renda mensal e ações para crescimento + renda.',
  },
  {
    q: 'Quando os dividendos caem na conta?',
    a: 'Cada empresa define a própria data. Geralmente entre 30 e 60 dias após a data-com. Os dividendos caem automaticamente na conta da corretora — você não precisa fazer nada.',
  },
  {
    q: 'Devo reinvestir dividendos?',
    a: 'Se você ainda está acumulando patrimônio: sim. Reinvestir acelera muito o crescimento via juros compostos. Quando atingir o objetivo de patrimônio, aí você usa os dividendos como renda.',
  },
  {
    q: 'Quais setores pagam melhores dividendos?',
    a: 'Bancos, energia elétrica, seguradoras e saneamento são os tradicionais. Empresas maduras com receita previsível tendem a pagar mais. Empresas em crescimento (tech, varejo) costumam pagar menos porque reinvestem no negócio.',
  },
] as const
</script>

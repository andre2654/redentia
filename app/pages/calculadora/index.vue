<!--
  /calculadora — Calculadoras index, Stripe-styled.

  The static layout already renders the centered display heading from
  the `title` prop (weight 300, clamp 36-56px) and applies the
  stripe-style cascade to h2/h3/p/strong inside `.static-content`. So
  the page itself just needs to provide structure + content with
  brand-bound colors — no `font-bold`, no `text-gray-*`.
-->
<template>
  <NuxtLayout name="static" title="Calculadoras Financeiras">
    <section class="flex flex-col gap-14 px-6 py-10">
      <!-- ============ Lead paragraph ============ -->
      <header class="mx-auto -mt-6 flex max-w-2xl flex-col items-center gap-3 text-center">
        <span
          class="font-mono-tab text-[11px] font-medium uppercase"
          :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
        >Ferramentas · Gratuitas</span>
        <p
          :style="{
            fontSize: '17.5px',
            lineHeight: 1.55,
            color: `color-mix(in srgb, ${brand.colors.text} 72%, transparent)`,
          }"
        >Simule investimentos, analise histórico real de ações e planeje seu patrimônio. Decisões com dados da B3, sem misticismo.</p>
      </header>

      <!-- ============ Cards das calculadoras ============ -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="calc in calculators"
          :key="calc.to"
          :to="calc.to"
          class="calc-card group flex flex-col gap-3 rounded-xl border p-6 transition-[border-color,background-color,box-shadow]"
          :style="cardStyle"
        >
          <div class="flex items-center justify-between">
            <span
              class="flex size-10 items-center justify-center rounded-lg"
              :style="{ backgroundColor: `color-mix(in srgb, ${calc.tint} 14%, transparent)` }"
            >
              <UIcon
                :name="calc.icon"
                class="size-5"
                :style="{ color: calc.tint }"
              />
            </span>
            <UIcon
              name="i-lucide-arrow-up-right"
              class="size-4 opacity-50 transition-[transform,opacity] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
              :style="{ color: brand.colors.primary }"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <span
              class="font-mono-tab text-[10.5px] font-medium uppercase"
              :style="{
                letterSpacing: '0.18em',
                color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
              }"
            >{{ calc.eyebrow }}</span>
            <h2
              class="!mt-0 !mb-0 text-[18px] font-medium"
              :style="{
                color: brand.colors.text,
                lineHeight: 1.25,
                letterSpacing: '-0.22px',
              }"
            >{{ calc.title }}</h2>
            <p
              class="!mb-0 text-[14px]"
              :style="{
                lineHeight: 1.55,
                color: `color-mix(in srgb, ${brand.colors.text} 68%, transparent)`,
              }"
            >{{ calc.body }}</p>
          </div>
          <span
            class="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium"
            :style="{ color: brand.colors.primary }"
          >
            {{ calc.cta }}
            <UIcon name="i-lucide-arrow-right" class="size-3.5" />
          </span>
        </NuxtLink>
      </div>

      <!-- ============ Por que usar ============ -->
      <section class="flex flex-col gap-6">
        <SectionHeading
          :brand="brand"
          eyebrow="Por que usar"
          title="O que separa essas calculadoras das genéricas"
        />
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <article
            v-for="r in reasons"
            :key="r.title"
            class="flex flex-col gap-2 rounded-xl border p-5"
            :style="cardStyle"
          >
            <UIcon
              :name="r.icon"
              class="size-5"
              :style="{ color: brand.colors.primary }"
            />
            <h3
              class="!mt-0 !mb-0 text-[15px] font-medium"
              :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
            >{{ r.title }}</h3>
            <p
              class="!mb-0 text-[13.5px]"
              :style="{
                lineHeight: 1.55,
                color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`,
              }"
            >{{ r.body }}</p>
          </article>
        </div>
      </section>

      <!-- ============ Como escolher ============ -->
      <section class="flex flex-col gap-6">
        <SectionHeading
          :brand="brand"
          eyebrow="Guia"
          title="Qual calculadora usar"
          lead="Cada ferramenta resolve um tipo diferente de pergunta. Aqui o atalho pra acertar de primeira."
        />
        <div class="flex flex-col gap-3">
          <article
            v-for="g in guides"
            :key="g.title"
            class="flex flex-col gap-2 rounded-xl border p-5 md:flex-row md:gap-6"
            :style="cardStyle"
          >
            <div class="md:w-[260px] md:shrink-0">
              <span
                class="font-mono-tab text-[10.5px] font-medium uppercase"
                :style="{
                  letterSpacing: '0.18em',
                  color: brand.colors.primary,
                }"
              >Use se…</span>
              <h3
                class="!mt-1 !mb-0 text-[16px] font-medium"
                :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
              >{{ g.title }}</h3>
            </div>
            <ul class="flex flex-1 flex-col gap-1.5">
              <li
                v-for="point in g.points"
                :key="point"
                class="flex items-start gap-2 text-[14px]"
                :style="{
                  lineHeight: 1.55,
                  color: `color-mix(in srgb, ${brand.colors.text} 70%, transparent)`,
                }"
              >
                <span
                  class="mt-2 size-1 shrink-0 rounded-full"
                  :style="{ backgroundColor: brand.colors.primary }"
                />
                <span>{{ point }}</span>
              </li>
            </ul>
          </article>
        </div>
      </section>

      <!-- ============ Dicas ============ -->
      <section class="flex flex-col gap-6">
        <SectionHeading
          :brand="brand"
          eyebrow="Boas práticas"
          title="Como tirar mais dessas ferramentas"
        />
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <article
            v-for="tip in tips"
            :key="tip.title"
            class="flex flex-col gap-2 rounded-xl border p-5"
            :style="cardStyle"
          >
            <span
              class="font-mono-tab text-[10.5px] font-medium uppercase"
              :style="{
                letterSpacing: '0.18em',
                color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
              }"
            >Dica</span>
            <h3
              class="!mt-0 !mb-0 text-[15.5px] font-medium"
              :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
            >{{ tip.title }}</h3>
            <p
              class="!mb-0 text-[14px]"
              :style="{
                lineHeight: 1.55,
                color: `color-mix(in srgb, ${brand.colors.text} 68%, transparent)`,
              }"
            >{{ tip.body }}</p>
          </article>
        </div>
      </section>

      <!-- ============ Bottom CTA ============ -->
      <MoleculesCtaSection
        title="Pronto pra começar a investir?"
        :description="`Cadastre-se na ${brand.name} pra ter análises com IA, acompanhamento de carteira e mais.`"
        primary-button-text="Criar conta grátis"
        primary-button-link="/auth/register"
        secondary-button-text="Conhecer a plataforma"
        secondary-button-link="/institucional/how-works"
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
  title: `Calculadoras Financeiras Gratuitas, Juros, Ações, Planejamento | ${brand.name}`,
  description:
    'Calculadoras gratuitas: simule juros compostos, analise investimentos em ações e planeje seu patrimônio. Ferramentas com dados reais da B3.',
  path: '/calculadora',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadora' },
  ],
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Calculadoras Financeiras Gratuitas',
    description:
      'Conjunto de calculadoras financeiras para simular investimentos, analisar ações e planejar patrimônio.',
    about: {
      '@type': 'FinancialProduct',
      name: 'Ferramentas de Investimento',
      description: 'Calculadoras para planejamento financeiro e análise de investimentos',
    },
  },
})

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))

const calculators = [
  {
    to: '/calculadora/preco-teto',
    icon: 'i-lucide-target',
    tint: '#fbbf24',
    eyebrow: 'Valuation',
    title: 'Preço Teto',
    body: 'Calcule o preço justo de ações usando Graham, Bazin, P/L setorial e valor patrimonial. Saiba se está barata ou cara.',
    cta: 'Usar calculadora',
  },
  {
    to: '/calculadora/aposentadoria',
    icon: 'i-lucide-piggy-bank',
    tint: '#34d399',
    eyebrow: 'Long-term',
    title: 'Aposentadoria',
    body: 'Calcule quanto investir pra se aposentar. Considera INSS, inflação, expectativa de vida e a regra dos 4%.',
    cta: 'Planejar aposentadoria',
  },
  {
    to: '/calculadora/dividend-yield',
    icon: 'i-lucide-coins',
    tint: '#fbbf24',
    eyebrow: 'Renda passiva',
    title: 'Dividend Yield',
    body: 'Calcule DY atual, projetado e histórico de ações e FIIs. Compare ativos e ache os melhores pagadores.',
    cta: 'Calcular DY',
  },
  {
    to: '/calculadora/quanto-investir',
    icon: 'i-lucide-wallet',
    tint: '#a78bfa',
    eyebrow: 'Aporte',
    title: 'Quanto Investir',
    body: 'Descubra quanto investir mensalmente pra atingir uma meta financeira. Aportes precisos, sem chute.',
    cta: 'Calcular aportes',
  },
  {
    to: '/calculadora/imposto-renda',
    icon: 'i-lucide-receipt-text',
    tint: '#f87171',
    eyebrow: 'Tributação',
    title: 'Imposto de Renda',
    body: 'Calcule IR sobre day trade e swing trade. Gera DARF automático, compensa prejuízos e fica em dia com a Receita.',
    cta: 'Calcular IR',
  },
  {
    to: '/calculadora/juros-compostos',
    icon: 'i-lucide-trending-up',
    tint: '#34d399',
    eyebrow: 'Simulação',
    title: 'Juros Compostos',
    body: 'Simule rendimento de investimentos ao longo do tempo. Inclui aportes mensais e gráfico de evolução.',
    cta: 'Usar calculadora',
  },
  {
    to: '/calculadora/acoes',
    icon: 'i-lucide-chart-line',
    tint: '#60a5fa',
    eyebrow: 'Backtest',
    title: 'Investimento em Ações',
    body: 'Quanto teria ganho investindo em ações específicas? Análise com dados históricos reais e dividendos reinvestidos.',
    cta: 'Usar simulador',
  },
  {
    to: '/calculadora/planejamento',
    icon: 'i-lucide-target',
    tint: '#fbbf24',
    eyebrow: 'Estratégia',
    title: 'Planejamento Patrimonial',
    body: 'Calcule quanto tempo e quanto investir pra atingir metas. Estratégias com dados reais da B3.',
    cta: 'Começar planejamento',
  },
] as const

const reasons = [
  {
    icon: 'i-lucide-circle-check',
    title: '100% gratuito',
    body: 'Todas as ferramentas livres, sem limite de uso ou cadastro pra abrir.',
  },
  {
    icon: 'i-lucide-database',
    title: 'Dados reais',
    body: 'Histórico real da B3, com dividendos e proventos por ticker.',
  },
  {
    icon: 'i-lucide-bar-chart-3',
    title: 'Gráficos vivos',
    body: 'Evolução do patrimônio em gráficos detalhados pra você ver o que aconteceu.',
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'Privacidade',
    body: 'Suas simulações ficam locais. Não compartilhamos seus dados.',
  },
] as const

const guides = [
  {
    title: 'Juros Compostos',
    points: [
      'Simular investimentos de longo prazo',
      'Entender o impacto de aportes mensais',
      'Comparar diferentes taxas de retorno',
      'Planejar renda fixa ou fundos',
    ],
  },
  {
    title: 'Simulador de Ações',
    points: [
      'Ver quanto teria ganho em ações específicas',
      'Analisar reinvestimento de dividendos',
      'Comparar desempenho entre ativos',
      'Montar carteira de ações ou FIIs',
    ],
  },
  {
    title: 'Planejamento Patrimonial',
    points: [
      'Tem uma meta financeira específica',
      'Quer saber quanto tempo até bater o objetivo',
      'Precisa de carteira recomendada com dados reais',
      'Decidir entre estratégia agressiva ou conservadora',
    ],
  },
] as const

const tips = [
  {
    title: 'Seja realista nas taxas',
    body: 'O mercado brasileiro renda historicamente entre 10% e 15% ao ano em ações, mas com volatilidade alta. Use 8-10% pra projeções conservadoras.',
  },
  {
    title: 'Considere a inflação',
    body: 'A inflação corrói poder de compra. Sempre olhe retornos reais (acima da inflação), não nominais.',
  },
  {
    title: 'Diversifique sempre',
    body: 'Use o simulador pra testar diferentes combinações de ativos. Carteira variada reduz risco sem matar retorno.',
  },
  {
    title: 'Revise periodicamente',
    body: 'Refaça suas simulações de 6 em 6 meses. Os parâmetros mudam (selic, inflação, sua renda) e a estratégia precisa acompanhar.',
  },
] as const
</script>

<style scoped>
.calc-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 28%, transparent) !important;
  background-color: color-mix(in srgb, var(--brand-primary) 4%, var(--brand-background)) !important;
  box-shadow:
    0 12px 28px -16px color-mix(in srgb, var(--brand-primary) 22%, transparent),
    0 4px 12px -6px rgba(0, 0, 0, 0.10);
}

@media (prefers-reduced-motion: reduce) {
  .calc-card,
  .calc-card:hover {
    transition: none;
  }
}
</style>

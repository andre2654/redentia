<template>
  <NuxtLayout :name="layoutName" title="Calculadora: Quanto Investir por Mês">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Back-link to parent listing -->
      <NuxtLink
        to="/calculadora"
        class="flex items-center gap-1 text-xs transition hover:opacity-80"
        :style="{ color: brand.colors.textMuted }"
      >
        <UIcon name="i-lucide-chevron-left" class="size-3" />
        Todas as calculadoras
      </NuxtLink>

      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-wallet" class="text-secondary h-8 w-8" />
          <h1
            class="font-light"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(28px, 4vw, 36px)',
              lineHeight: 1.05,
              letterSpacing: '-0.7px',
            }"
          >Calculadora: Quanto Investir por Mês para Sua Meta</h1>
        </div>
        <p class="text-base md:text-lg">
          Descubra quanto você precisa investir mensalmente para atingir sua meta financeira. Planeje seus aportes com base em prazo e rentabilidade esperada.
        </p>
      </div>

      <CalculatorMonthlyInvestment />

      <div class="max-w-none">
        <h2>Como Calcular Quanto Investir</h2>
        <p class="leading-relaxed">
          A maioria das calculadoras te pergunta "quanto você vai investir" e mostra "quanto vai ter". Esta faz o contrário: você define sua meta e prazo, e ela calcula exatamente quanto precisa investir mensalmente.
        </p>

        <h3>Exemplos de Metas Comuns</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">R$ 100.000 em 5 anos</h4>
            <p class="text-sm">
              A 10% a.a., você precisa investir <strong>R$ 1.288/mês</strong>
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">R$ 500.000 em 10 anos</h4>
            <p class="text-sm">
              A 10% a.a., você precisa investir <strong>R$ 2.412/mês</strong>
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">R$ 1 milhão em 15 anos</h4>
            <p class="text-sm">
              A 10% a.a., você precisa investir <strong>R$ 2.404/mês</strong>
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">R$ 2 milhões em 20 anos</h4>
            <p class="text-sm">
              A 10% a.a., você precisa investir <strong>R$ 2.642/mês</strong>
            </p>
          </div>
        </div>

        <h2>Perguntas Frequentes</h2>

        <div class="space-y-4">
          <details
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Quanto da minha renda devo investir?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Regra 50/30/20: 50% necessidades, 30% desejos, 20% investimentos. Mínimo: 10% da renda. Ideal: 20-30%. Agressivo (FIRE): 50-70%. Se ganha R$ 5.000: investir R$ 500 (mínimo) a R$ 1.500 (ideal). Aumente conforme sua renda cresce.
            </p>
          </details>

          <details
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between">
              E se eu não conseguir investir o valor calculado?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Você tem 3 opções: 1) Estender o prazo (mais tempo = menos aporte mensal), 2) Reduzir a meta, 3) Buscar investimentos com maior retorno (mais risco). Comece com o que você consegue. É melhor investir R$ 300/mês por 15 anos do que esperar "ter condições" de investir R$ 1.000. O tempo perdido não volta.
            </p>
          </details>
        </div>
      </div>

      <div
        class="flex flex-col gap-4 rounded-[30px] p-6"
        :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"
      >
        <h2>Outras Ferramentas</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            to="/calculadora/juros-compostos"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <UIcon name="i-lucide-trending-up" class="text-secondary size-8 shrink-0" />
            <div>
              <h3>Juros Compostos</h3>
              <p class="text-sm">Simule quanto vai ter</p>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/calculadora/aposentadoria"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <UIcon name="i-lucide-piggy-bank" class="text-secondary size-8 shrink-0" />
            <div>
              <h3>Aposentadoria</h3>
              <p class="text-sm">Planeje sua aposentadoria</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <MoleculesCtaSection
        :title="`Acompanhe suas metas na ${brand.name}`"
        description="Monitore o progresso das suas metas financeiras com gráficos e análises."
        :buttons="[
          { label: 'Criar conta grátis', to: '/auth/register', icon: 'i-lucide-arrow-right', variant: 'primary' },
          { label: 'Ver mais calculadoras', to: '/calculadora', variant: 'outline' },
        ]"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
const brand = useBrand()
const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'static'
)

usePageSeo({
  title: `Calculadora: Quanto Investir por Mês para Sua Meta | ${brand.name}`,
  description:
    'Descubra quanto você precisa investir mensalmente para atingir sua meta financeira. Calcule aportes necessários com base em prazo e rentabilidade esperada.',
  path: '/calculadora/quanto-investir',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadora' },
    { name: 'Quanto Investir', path: '/calculadora/quanto-investir' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: `Calculadora de Aporte Mensal ${brand.name}`,
      applicationCategory: 'FinanceApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
      operatingSystem: 'Web',
      description:
        'Calculadora gratuita para descobrir quanto investir mensalmente para atingir metas financeiras.',
      featureList: [
        'Cálculo de aporte necessário',
        'Análise de viabilidade',
        'Cenários alternativos',
        'Tabela de sensibilidade',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Quanto da minha renda devo investir?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Regra 50/30/20: 20% para investimentos. Mínimo: 10%. Ideal: 20-30%. Agressivo: 50-70%.',
          },
        },
      ],
    },
  ],
})

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})
</script>

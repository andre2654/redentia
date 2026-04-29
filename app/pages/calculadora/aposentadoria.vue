<template>
  <NuxtLayout :name="layoutName" title="Calculadora de Aposentadoria">
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
          <UIcon name="i-lucide-piggy-bank" class="text-secondary h-8 w-8" />
          <h1
            class="font-light"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(28px, 4vw, 36px)',
              lineHeight: 1.05,
              letterSpacing: '-0.7px',
            }"
          >Calculadora de Aposentadoria: Quanto Preciso para Me Aposentar?</h1>
        </div>
        <p class="text-base md:text-lg">
          Calcule quanto você precisa investir para se aposentar. Considere INSS, inflação, expectativa de vida e a regra dos 4%. Planeje seu FIRE (Financial Independence, Retire Early)!
        </p>
      </div>

      <CalculatorRetirement />

      <div class="max-w-none">
        <h2>Como Planejar sua Aposentadoria</h2>
        <p class="leading-relaxed">
          Aposentadoria não acontece por acaso, é resultado de planejamento e disciplina. Quanto mais cedo você começar a se planejar, mais confortável será sua aposentadoria e menos você precisará poupar mensalmente.
        </p>

        <h3>A Regra dos 4%</h3>
        <div class="brand-card border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg">
            Você pode sacar 4% do patrimônio por ano mantendo o capital indefinidamente
          </p>
          <div class="mt-4 space-y-2 text-sm">
            <p><strong>Exemplo:</strong> Com R$ 1 milhão investido, você pode sacar R$ 40.000/ano ou R$ 3.333/mês</p>
            <p><strong>Cálculo inverso:</strong> Para R$ 5.000/mês = R$ 5.000 × 12 ÷ 0.04 = <strong>R$ 1,5 milhão</strong></p>
          </div>
        </div>

        <h2>Movimento FIRE no Brasil</h2>
        <p class="leading-relaxed">
          FIRE (Financial Independence, Retire Early) é um movimento que prega independência financeira e aposentadoria antecipada. Os pilares são: viver abaixo das suas posses, investir agressivamente e ter um plano claro.
        </p>

        <div class="grid gap-4 md:grid-cols-3">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">Lean FIRE</h4>
            <p class="text-sm">
              Aposentar com o mínimo necessário, estilo de vida frugal. Meta: R$ 500-750k.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">Regular FIRE</h4>
            <p class="text-sm">
              Manter padrão de vida médio. Meta: R$ 1-2 milhões.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">Fat FIRE</h4>
            <p class="text-sm">
              Aposentar com alto padrão de vida. Meta: R$ 3 milhões+.
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
              Quanto preciso para me aposentar?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Multiplique sua despesa mensal desejada por 300 (regra dos 4%). Exemplo: Para R$ 5.000/mês, você precisa de R$ 1,5 milhão. Para R$ 10.000/mês, precisa de R$ 3 milhões. Ajuste pelo INSS que você vai receber.
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
              É possível se aposentar aos 40 anos no Brasil?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Sim, mas requer disciplina extrema. Você precisaria: 1) Poupar 50-70% da renda, 2) Começar cedo (20-25 anos), 3) Ter boa renda ou fazer side hustles, 4) Investir bem (12%+ a.a.), 5) Viver de forma frugal. É desafiador mas não impossível.
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
              Devo contar com o INSS no planejamento?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Depende da sua idade. Se você tem 40+ e contribui regularmente, pode contar com INSS como complemento. Se tem 20-30 anos, seja conservador, o sistema pode mudar muito até você se aposentar. Trate o INSS como bônus, não como pilar do seu plano.
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
            to="/calculadora/quanto-investir"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <UIcon name="i-lucide-wallet" class="text-secondary size-8 shrink-0" />
            <div>
              <h3>Quanto Investir por Mês</h3>
              <p class="text-sm">Calcule aportes para suas metas</p>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/calculadora/planejamento"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <UIcon name="i-lucide-target" class="text-secondary size-8 shrink-0" />
            <div>
              <h3>Planejamento Patrimonial</h3>
              <p class="text-sm">Carteira recomendada</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <MoleculesCtaSection
        title="Acompanhe seus investimentos"
        description="Monitore seu progresso rumo à aposentadoria com análises em tempo real."
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
  title: `Calculadora de Aposentadoria: Quanto Preciso para Me Aposentar? | ${brand.name}`,
  description:
    'Calcule quanto você precisa investir para se aposentar. Considere INSS, inflação, expectativa de vida e a regra dos 4%. Planeje seu FIRE e aposentadoria antecipada!',
  path: '/calculadora/aposentadoria',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadora' },
    { name: 'Aposentadoria', path: '/calculadora/aposentadoria' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: `Calculadora de Aposentadoria ${brand.name}`,
      applicationCategory: 'FinanceApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
      operatingSystem: 'Web',
      description:
        'Calculadora gratuita de aposentadoria com regra dos 4%, considerando INSS e inflação.',
      featureList: [
        'Regra dos 4%',
        'Ajuste por inflação',
        'Consideração de INSS',
        'Cenários alternativos',
        'Planejamento FIRE',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Quanto preciso para me aposentar?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Multiplique sua despesa mensal desejada por 300 (regra dos 4%). Para R$ 5.000/mês, você precisa de R$ 1,5 milhão.',
          },
        },
        {
          '@type': 'Question',
          name: 'É possível se aposentar aos 40 anos no Brasil?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim, mas requer poupar 50-70% da renda, começar cedo, investir bem e viver de forma frugal. É desafiador mas não impossível.',
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

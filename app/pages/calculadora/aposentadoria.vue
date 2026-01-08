<template>
  <NuxtLayout name="static" title="Calculadora de Aposentadoria">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm text-gray-400">
        <NuxtLink to="/" class="hover:text-white transition-colors">
          Home
        </NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
        <NuxtLink to="/calculadora" class="hover:text-white transition-colors">
          Calculadoras
        </NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
        <span class="text-white">Aposentadoria</span>
      </nav>

      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-piggy-bank" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">
            Calculadora de Aposentadoria: Quanto Preciso para Me Aposentar?
          </h1>
        </div>
        <p class="text-base text-gray-400 md:text-lg">
          Calcule quanto você precisa investir para se aposentar. Considere INSS, inflação, expectativa de vida e a regra dos 4%. Planeje seu FIRE (Financial Independence, Retire Early)!
        </p>
      </div>

      <CalculatorRetirement />

      <div class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold">Como Planejar sua Aposentadoria</h2>
        <p class="leading-relaxed text-gray-300">
          Aposentadoria não acontece por acaso - é resultado de planejamento e disciplina. Quanto mais cedo você começar a se planejar, mais confortável será sua aposentadoria e menos você precisará poupar mensalmente.
        </p>

        <h3 class="text-xl font-semibold">A Regra dos 4%</h3>
        <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg font-semibold">
            Você pode sacar 4% do patrimônio por ano mantendo o capital indefinidamente
          </p>
          <div class="mt-4 space-y-2 text-sm text-gray-300">
            <p><strong>Exemplo:</strong> Com R$ 1 milhão investido, você pode sacar R$ 40.000/ano ou R$ 3.333/mês</p>
            <p><strong>Cálculo inverso:</strong> Para R$ 5.000/mês = R$ 5.000 × 12 ÷ 0.04 = <strong>R$ 1,5 milhão</strong></p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Movimento FIRE no Brasil</h2>
        <p class="leading-relaxed text-gray-300">
          FIRE (Financial Independence, Retire Early) é um movimento que prega independência financeira e aposentadoria antecipada. Os pilares são: viver abaixo das suas posses, investir agressivamente e ter um plano claro.
        </p>

        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">Lean FIRE</h4>
            <p class="text-sm text-gray-300">
              Aposentar com o mínimo necessário, estilo de vida frugal. Meta: R$ 500-750k.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">Regular FIRE</h4>
            <p class="text-sm text-gray-300">
              Manter padrão de vida médio. Meta: R$ 1-2 milhões.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">Fat FIRE</h4>
            <p class="text-sm text-gray-300">
              Aposentar com alto padrão de vida. Meta: R$ 3 milhões+.
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Perguntas Frequentes</h2>
        
        <div class="space-y-4">
          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Quanto preciso para me aposentar?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Multiplique sua despesa mensal desejada por 300 (regra dos 4%). Exemplo: Para R$ 5.000/mês, você precisa de R$ 1,5 milhão. Para R$ 10.000/mês, precisa de R$ 3 milhões. Ajuste pelo INSS que você vai receber.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              É possível se aposentar aos 40 anos no Brasil?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Sim, mas requer disciplina extrema. Você precisaria: 1) Poupar 50-70% da renda, 2) Começar cedo (20-25 anos), 3) Ter boa renda ou fazer side hustles, 4) Investir bem (12%+ a.a.), 5) Viver de forma frugal. É desafiador mas não impossível.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Devo contar com o INSS no planejamento?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Depende da sua idade. Se você tem 40+ e contribui regularmente, pode contar com INSS como complemento. Se tem 20-30 anos, seja conservador - o sistema pode mudar muito até você se aposentar. Trate o INSS como bônus, não como pilar do seu plano.
            </p>
          </details>
        </div>
      </div>

      <div class="flex flex-col gap-4 rounded-[30px] bg-white/5 p-6">
        <h2 class="text-2xl font-bold">Outras Ferramentas</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            to="/calculadora/quanto-investir"
            class="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-secondary/50"
          >
            <UIcon name="i-lucide-wallet" class="text-secondary size-8 shrink-0" />
            <div>
              <h3 class="font-semibold">Quanto Investir por Mês</h3>
              <p class="text-sm text-gray-400">Calcule aportes para suas metas</p>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/calculadora/planejamento"
            class="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-secondary/50"
          >
            <UIcon name="i-lucide-target" class="text-secondary size-8 shrink-0" />
            <div>
              <h3 class="font-semibold">Planejamento Patrimonial</h3>
              <p class="text-sm text-gray-400">Carteira recomendada</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <MoleculesCtaSection
        title="Acompanhe seus investimentos"
        description="Monitore seu progresso rumo à aposentadoria com análises em tempo real."
        primary-button-text="Criar conta grátis"
        primary-button-link="/auth/register"
        secondary-button-text="Ver mais calculadoras"
        secondary-button-link="/calculadora"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
usePageSeo({
  title: 'Calculadora de Aposentadoria: Quanto Preciso para Me Aposentar? | Redentia',
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
      name: 'Calculadora de Aposentadoria Redentia',
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

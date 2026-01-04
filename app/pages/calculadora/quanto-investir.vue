<template>
  <NuxtLayout name="static" title="Calculadora: Quanto Investir por Mês">
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
        <span class="text-white">Quanto Investir</span>
      </nav>

      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-wallet" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">
            Calculadora: Quanto Investir por Mês para Sua Meta
          </h1>
        </div>
        <p class="text-base text-gray-400 md:text-lg">
          Descubra quanto você precisa investir mensalmente para atingir sua meta financeira. Planeje seus aportes com base em prazo e rentabilidade esperada.
        </p>
      </div>

      <CalculatorMonthlyInvestment />

      <div class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold">Como Calcular Quanto Investir</h2>
        <p class="leading-relaxed text-gray-300">
          A maioria das calculadoras te pergunta "quanto você vai investir" e mostra "quanto vai ter". Esta faz o contrário: você define sua meta e prazo, e ela calcula exatamente quanto precisa investir mensalmente.
        </p>

        <h3 class="text-xl font-semibold">Exemplos de Metas Comuns</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">R$ 100.000 em 5 anos</h4>
            <p class="text-sm text-gray-300">
              A 10% a.a., você precisa investir <strong>R$ 1.288/mês</strong>
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">R$ 500.000 em 10 anos</h4>
            <p class="text-sm text-gray-300">
              A 10% a.a., você precisa investir <strong>R$ 2.412/mês</strong>
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">R$ 1 milhão em 15 anos</h4>
            <p class="text-sm text-gray-300">
              A 10% a.a., você precisa investir <strong>R$ 2.404/mês</strong>
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">R$ 2 milhões em 20 anos</h4>
            <p class="text-sm text-gray-300">
              A 10% a.a., você precisa investir <strong>R$ 2.642/mês</strong>
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Perguntas Frequentes</h2>
        
        <div class="space-y-4">
          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Quanto da minha renda devo investir?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Regra 50/30/20: 50% necessidades, 30% desejos, 20% investimentos. Mínimo: 10% da renda. Ideal: 20-30%. Agressivo (FIRE): 50-70%. Se ganha R$ 5.000: investir R$ 500 (mínimo) a R$ 1.500 (ideal). Aumente conforme sua renda cresce.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              E se eu não conseguir investir o valor calculado?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Você tem 3 opções: 1) Estender o prazo (mais tempo = menos aporte mensal), 2) Reduzir a meta, 3) Buscar investimentos com maior retorno (mais risco). Comece com o que você consegue. É melhor investir R$ 300/mês por 15 anos do que esperar "ter condições" de investir R$ 1.000. O tempo perdido não volta.
            </p>
          </details>
        </div>
      </div>

      <div class="flex flex-col gap-4 rounded-[30px] bg-white/5 p-6">
        <h2 class="text-2xl font-bold">Outras Ferramentas</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            to="/calculadora/juros-compostos"
            class="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-secondary/50"
          >
            <UIcon name="i-lucide-trending-up" class="text-secondary size-8 shrink-0" />
            <div>
              <h3 class="font-semibold">Juros Compostos</h3>
              <p class="text-sm text-gray-400">Simule quanto vai ter</p>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/calculadora/aposentadoria"
            class="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-secondary/50"
          >
            <UIcon name="i-lucide-piggy-bank" class="text-secondary size-8 shrink-0" />
            <div>
              <h3 class="font-semibold">Aposentadoria</h3>
              <p class="text-sm text-gray-400">Planeje sua aposentadoria</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <MoleculesCtaSection
        title="Acompanhe suas metas na Redentia"
        description="Monitore o progresso das suas metas financeiras com gráficos e análises."
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
  title: 'Calculadora: Quanto Investir por Mês para Sua Meta | Redentia',
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
      name: 'Calculadora de Aporte Mensal Redentia',
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
})
</script>

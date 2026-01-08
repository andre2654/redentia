<template>
  <NuxtLayout name="static" title="Calculadoras Financeiras">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm text-gray-400">
        <NuxtLink to="/" class="hover:text-white transition-colors">
          Home
        </NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
        <span class="text-white">Calculadoras</span>
      </nav>

      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-calculator" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">
            Calculadoras Financeiras Gratuitas para Investidores
          </h1>
        </div>
        <p class="text-base text-gray-400 md:text-lg">
          Ferramentas gratuitas e completas para simular investimentos, analisar histórico de ações e planejar seu patrimônio. Tome decisões mais inteligentes com dados reais da B3.
        </p>
      </div>

      <!-- Calculadoras Cards -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Preço Teto -->
        <NuxtLink
          to="/calculadora/preco-teto"
          class="group flex flex-col gap-4 rounded-[30px] border border-white/10 bg-gradient-to-t from-white/10 to-transparent p-6 transition hover:border-secondary/50 hover:from-secondary/10"
        >
          <div class="flex items-center gap-3">
            <UIcon
              name="i-lucide-target"
              class="text-secondary size-8 transition group-hover:scale-110"
            />
            <h2 class="text-xl font-bold text-white">Preço Teto</h2>
          </div>
          <p class="text-sm text-gray-300">
            Calcule o preço justo de ações usando Graham, Bazin, P/L setorial e valor patrimonial. Descubra se uma ação está barata ou cara.
          </p>
          <div class="mt-auto flex items-center gap-2 text-sm font-semibold text-secondary">
            Usar calculadora
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </div>
        </NuxtLink>

        <!-- Aposentadoria -->
        <NuxtLink
          to="/calculadora/aposentadoria"
          class="group flex flex-col gap-4 rounded-[30px] border border-white/10 bg-gradient-to-t from-white/10 to-transparent p-6 transition hover:border-secondary/50 hover:from-secondary/10"
        >
          <div class="flex items-center gap-3">
            <UIcon
              name="i-lucide-piggy-bank"
              class="text-secondary size-8 transition group-hover:scale-110"
            />
            <h2 class="text-xl font-bold text-white">Aposentadoria</h2>
          </div>
          <p class="text-sm text-gray-300">
            Calcule quanto investir para se aposentar. Considere INSS, inflação, expectativa de vida e a regra dos 4%. Planeje seu FIRE!
          </p>
          <div class="mt-auto flex items-center gap-2 text-sm font-semibold text-secondary">
            Planejar aposentadoria
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </div>
        </NuxtLink>

        <!-- Dividend Yield -->
        <NuxtLink
          to="/calculadora/dividend-yield"
          class="group flex flex-col gap-4 rounded-[30px] border border-white/10 bg-gradient-to-t from-white/10 to-transparent p-6 transition hover:border-secondary/50 hover:from-secondary/10"
        >
          <div class="flex items-center gap-3">
            <UIcon
              name="i-lucide-coins"
              class="text-secondary size-8 transition group-hover:scale-110"
            />
            <h2 class="text-xl font-bold text-white">Dividend Yield</h2>
          </div>
          <p class="text-sm text-gray-300">
            Calcule DY atual, projetado e histórico de ações e FIIs. Compare ativos e encontre os melhores pagadores de dividendos.
          </p>
          <div class="mt-auto flex items-center gap-2 text-sm font-semibold text-secondary">
            Calcular DY
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </div>
        </NuxtLink>

        <!-- Quanto Investir -->
        <NuxtLink
          to="/calculadora/quanto-investir"
          class="group flex flex-col gap-4 rounded-[30px] border border-white/10 bg-gradient-to-t from-white/10 to-transparent p-6 transition hover:border-secondary/50 hover:from-secondary/10"
        >
          <div class="flex items-center gap-3">
            <UIcon
              name="i-lucide-wallet"
              class="text-secondary size-8 transition group-hover:scale-110"
            />
            <h2 class="text-xl font-bold text-white">Quanto Investir</h2>
          </div>
          <p class="text-sm text-gray-300">
            Descubra quanto você precisa investir mensalmente para atingir sua meta financeira. Planeje seus aportes com precisão.
          </p>
          <div class="mt-auto flex items-center gap-2 text-sm font-semibold text-secondary">
            Calcular aportes
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </div>
        </NuxtLink>

        <!-- Imposto de Renda -->
        <NuxtLink
          to="/calculadora/imposto-renda"
          class="group flex flex-col gap-4 rounded-[30px] border border-white/10 bg-gradient-to-t from-white/10 to-transparent p-6 transition hover:border-secondary/50 hover:from-secondary/10"
        >
          <div class="flex items-center gap-3">
            <UIcon
              name="i-lucide-receipt-text"
              class="text-secondary size-8 transition group-hover:scale-110"
            />
            <h2 class="text-xl font-bold text-white">Imposto de Renda</h2>
          </div>
          <p class="text-sm text-gray-300">
            Calcule IR sobre day trade e swing trade. Gere DARF automaticamente, compense prejuízos e fique em dia com a Receita.
          </p>
          <div class="mt-auto flex items-center gap-2 text-sm font-semibold text-secondary">
            Calcular IR
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </div>
        </NuxtLink>

        <!-- Juros Compostos -->
        <NuxtLink
          to="/calculadora/juros-compostos"
          class="group flex flex-col gap-4 rounded-[30px] border border-white/10 bg-gradient-to-t from-white/10 to-transparent p-6 transition hover:border-secondary/50 hover:from-secondary/10"
        >
          <div class="flex items-center gap-3">
            <UIcon
              name="i-lucide-trending-up"
              class="text-secondary size-8 transition group-hover:scale-110"
            />
            <h2 class="text-xl font-bold text-white">Juros Compostos</h2>
          </div>
          <p class="text-sm text-gray-300">
            Simule quanto seus investimentos vão render com juros compostos ao longo do tempo. Inclui aportes mensais e gráficos de evolução patrimonial.
          </p>
          <div class="mt-auto flex items-center gap-2 text-sm font-semibold text-secondary">
            Usar calculadora
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </div>
        </NuxtLink>

        <!-- Histórico de Ações -->
        <NuxtLink
          to="/calculadora/acoes"
          class="group flex flex-col gap-4 rounded-[30px] border border-white/10 bg-gradient-to-t from-white/10 to-transparent p-6 transition hover:border-secondary/50 hover:from-secondary/10"
        >
          <div class="flex items-center gap-3">
            <UIcon
              name="i-lucide-chart-line"
              class="text-secondary size-8 transition group-hover:scale-110"
            />
            <h2 class="text-xl font-bold text-white">Investimento em Ações</h2>
          </div>
          <p class="text-sm text-gray-300">
            Descubra quanto você teria ganho investindo em ações da B3. Análise com dados históricos reais, reinvestimento de dividendos e múltiplos ativos.
          </p>
          <div class="mt-auto flex items-center gap-2 text-sm font-semibold text-secondary">
            Usar simulador
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </div>
        </NuxtLink>

        <!-- Planejamento -->
        <NuxtLink
          to="/calculadora/planejamento"
          class="group flex flex-col gap-4 rounded-[30px] border border-white/10 bg-gradient-to-t from-white/10 to-transparent p-6 transition hover:border-secondary/50 hover:from-secondary/10"
        >
          <div class="flex items-center gap-3">
            <UIcon
              name="i-lucide-target"
              class="text-secondary size-8 transition group-hover:scale-110"
            />
            <h2 class="text-xl font-bold text-white">Planejamento Patrimonial</h2>
          </div>
          <p class="text-sm text-gray-300">
            Calcule quanto tempo e quanto investir para atingir suas metas financeiras. Estratégias personalizadas com dados históricos da B3.
          </p>
          <div class="mt-auto flex items-center gap-2 text-sm font-semibold text-secondary">
            Começar planejamento
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </div>
        </NuxtLink>
      </div>

      <!-- Por que usar nossas calculadoras -->
      <div class="flex flex-col gap-6 rounded-[30px] bg-white/5 p-6">
        <h2 class="text-2xl font-bold">Por que Usar Nossas Calculadoras?</h2>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div class="flex flex-col gap-2">
            <UIcon name="i-lucide-check-circle" class="text-secondary size-6" />
            <h3 class="font-semibold">100% Gratuito</h3>
            <p class="text-sm text-gray-400">
              Todas as ferramentas são gratuitas e sem limitações. Use quantas vezes quiser.
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <UIcon name="i-lucide-database" class="text-secondary size-6" />
            <h3 class="font-semibold">Dados Reais</h3>
            <p class="text-sm text-gray-400">
              Baseado em dados históricos reais da B3, incluindo dividendos e proventos.
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <UIcon name="i-lucide-bar-chart-3" class="text-secondary size-6" />
            <h3 class="font-semibold">Gráficos Interativos</h3>
            <p class="text-sm text-gray-400">
              Visualize a evolução dos seus investimentos em gráficos detalhados.
            </p>
          </div>
          <div class="flex flex-col gap-2">
            <UIcon name="i-lucide-shield-check" class="text-secondary size-6" />
            <h3 class="font-semibold">Privacidade</h3>
            <p class="text-sm text-gray-400">
              Suas simulações são privadas. Não compartilhamos seus dados.
            </p>
          </div>
        </div>
      </div>

      <!-- Conteúdo Educativo -->
      <div class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold">Como Usar as Calculadoras Financeiras</h2>
        <p class="leading-relaxed text-gray-300">
          Nossas calculadoras são ferramentas essenciais para quem quer investir com inteligência. Elas ajudam você a:
        </p>
        <ul class="space-y-2 text-gray-300">
          <li>Simular diferentes cenários de investimento antes de aplicar seu dinheiro</li>
          <li>Entender o poder dos juros compostos e do tempo no mercado</li>
          <li>Analisar o desempenho histórico real de ações e FIIs</li>
          <li>Planejar quanto investir mensalmente para atingir suas metas</li>
          <li>Comparar estratégias de rentabilidade vs segurança</li>
        </ul>

        <h3 class="text-xl font-semibold">Qual Calculadora Usar?</h3>
        <div class="space-y-4">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Use a Calculadora de Juros Compostos se:
            </h4>
            <ul class="text-sm text-gray-300">
              <li>Você quer simular investimentos de longo prazo</li>
              <li>Quer entender o impacto de aportes mensais</li>
              <li>Precisa comparar diferentes taxas de retorno</li>
              <li>Está planejando investimentos em renda fixa ou fundos</li>
            </ul>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Use o Simulador de Ações se:
            </h4>
            <ul class="text-sm text-gray-300">
              <li>Você quer ver quanto teria ganho investindo em ações específicas</li>
              <li>Precisa analisar o impacto de reinvestir dividendos</li>
              <li>Quer comparar o desempenho de diferentes ativos</li>
              <li>Está montando uma carteira de ações ou FIIs</li>
            </ul>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Use o Planejamento Patrimonial se:
            </h4>
            <ul class="text-sm text-gray-300">
              <li>Você tem uma meta financeira específica (ex: R$ 500.000)</li>
              <li>Quer saber quanto tempo levará para atingir seu objetivo</li>
              <li>Precisa de uma carteira recomendada baseada em dados reais</li>
              <li>Quer escolher entre estratégia agressiva ou conservadora</li>
            </ul>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Dicas para Melhores Resultados</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">Seja Realista</h4>
            <p class="text-sm text-gray-300">
              Use taxas de retorno realistas. O mercado brasileiro historicamente rende entre 10-15% ao ano em ações, mas com volatilidade.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">Considere a Inflação</h4>
            <p class="text-sm text-gray-300">
              Lembre-se que a inflação corrói o poder de compra. Considere retornos reais (acima da inflação).
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">Diversifique</h4>
            <p class="text-sm text-gray-300">
              Use o simulador de ações para testar diferentes combinações de ativos e reduzir riscos.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">Revise Regularmente</h4>
            <p class="text-sm text-gray-300">
              Refaça suas simulações periodicamente e ajuste sua estratégia conforme necessário.
            </p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <MoleculesCtaSection
        title="Pronto para começar a investir?"
        description="Cadastre-se na Redentia e tenha acesso a análises com IA, acompanhamento de carteira e muito mais."
        primary-button-text="Criar conta grátis"
        primary-button-link="/auth/register"
        secondary-button-text="Conhecer a plataforma"
        secondary-button-link="/redentia/how-works"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
usePageSeo({
  title: 'Calculadoras Financeiras Gratuitas - Juros, Ações, Planejamento | Redentia',
  description:
    'Use nossas calculadoras financeiras gratuitas: simule juros compostos, analise investimentos em ações e planeje seu patrimônio. Ferramentas completas para investidores.',
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

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})
</script>

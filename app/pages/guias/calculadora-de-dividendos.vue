<template>
  <NuxtLayout name="static" title="Calculadora de Dividendos">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-coins" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">
            Calculadora de Dividendos: Quanto Receber Mensalmente
          </h1>
        </div>
        <p class="text-base text-gray-400 md:text-lg">
          Aprenda a calcular quanto você precisa investir para atingir sua meta de renda passiva com dividendos. Fórmulas, exemplos práticos e estratégias.
        </p>
      </div>

      <!-- Conteúdo Educacional -->
      <div class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold">O que são Dividendos?</h2>
        <p class="leading-relaxed text-gray-300">
          Dividendos são parcelas do lucro de uma empresa distribuídas aos acionistas. Quando você possui ações de empresas ou FIIs que pagam bons dividendos, você cria uma fonte de renda passiva sem precisar vender seus ativos.
        </p>

        <h3 class="text-xl font-semibold">Por que Investir em Dividendos?</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Renda Passiva Recorrente
            </h4>
            <p class="text-sm text-gray-300">
              Receba dinheiro todo mês ou trimestre sem trabalhar. Ideal para complementar renda ou aposentadoria.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Crescimento Composto
            </h4>
            <p class="text-sm text-gray-300">
              Reinvestindo dividendos, você acelera o crescimento através do efeito "bola de neve".
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Proteção em Crises
            </h4>
            <p class="text-sm text-gray-300">
              Mesmo com a bolsa em queda, você continua recebendo dividendos de empresas sólidas.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Independência Financeira
            </h4>
            <p class="text-sm text-gray-300">
              Quando dividendos cobrem suas despesas, você alcança liberdade financeira.
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Como Calcular Dividendos</h2>

        <h3 class="text-xl font-semibold">Dividend Yield (DY)</h3>
        <p class="leading-relaxed text-gray-300">
          O Dividend Yield é o principal indicador para calcular quanto você recebe de dividendos. É calculado assim:
        </p>
        <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg font-semibold">
            DY = (Dividendos Anuais ÷ Preço da Ação) × 100
          </p>
          <p class="mt-3 text-center text-sm text-gray-300">
            Exemplo: Ação custa R$ 20 e paga R$ 1,20 em dividendos por ano
          </p>
          <p class="text-center text-sm font-semibold text-secondary">
            DY = (R$ 1,20 ÷ R$ 20) × 100 = 6% ao ano
          </p>
        </div>

        <h3 class="text-xl font-semibold">Quanto Preciso Investir?</h3>
        <p class="leading-relaxed text-gray-300">
          Para saber quanto investir para atingir uma meta de renda mensal, use esta fórmula:
        </p>
        <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg font-semibold">
            Capital Necessário = (Renda Mensal Desejada × 12) ÷ (DY ÷ 100)
          </p>
          <p class="mt-3 text-center text-sm text-gray-300">
            Exemplo: Quero R$ 3.000/mês com carteira de DY 6% ao ano
          </p>
          <p class="text-center text-sm font-semibold text-secondary">
            Capital = (R$ 3.000 × 12) ÷ 0,06 = R$ 600.000
          </p>
        </div>

        <h2 class="text-2xl font-bold">Exemplos Práticos</h2>

        <h3 class="text-xl font-semibold">Meta: R$ 500/mês</h3>
        <div class="space-y-3">
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Com DY de 6% ao ano</h4>
            <p class="text-sm text-gray-400">
              Capital necessário: <span class="font-semibold text-white">R$ 100.000</span>
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Com DY de 8% ao ano</h4>
            <p class="text-sm text-gray-400">
              Capital necessário: <span class="font-semibold text-white">R$ 75.000</span>
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Com DY de 10% ao ano (FIIs)</h4>
            <p class="text-sm text-gray-400">
              Capital necessário: <span class="font-semibold text-white">R$ 60.000</span>
            </p>
          </div>
        </div>

        <h3 class="text-xl font-semibold">Meta: R$ 3.000/mês (Renda Passiva Completa)</h3>
        <div class="space-y-3">
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Com DY de 6% ao ano</h4>
            <p class="text-sm text-gray-400">
              Capital necessário: <span class="font-semibold text-white">R$ 600.000</span>
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Com DY de 8% ao ano</h4>
            <p class="text-sm text-gray-400">
              Capital necessário: <span class="font-semibold text-white">R$ 450.000</span>
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Com DY de 10% ao ano (FIIs)</h4>
            <p class="text-sm text-gray-400">
              Capital necessário: <span class="font-semibold text-white">R$ 360.000</span>
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Melhores Pagadores de Dividendos</h2>

        <h3 class="text-xl font-semibold">Ações com Bons Dividendos</h3>
        <p class="leading-relaxed text-gray-300">
          Empresas tradicionalmente boas pagadoras de dividendos no Brasil:
        </p>
        <div class="space-y-3">
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-2 font-semibold">Setor Bancário</h4>
            <div class="mb-2 flex flex-wrap gap-1.5">
              <AtomsTickerEmbed ticker="ITUB4" size="sm" />
              <AtomsTickerEmbed ticker="BBDC4" size="sm" />
              <AtomsTickerEmbed ticker="BBAS3" size="sm" />
            </div>
            <p class="text-sm text-gray-400">
              DY médio: 5-7% ao ano
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-2 font-semibold">Energia Elétrica</h4>
            <div class="mb-2 flex flex-wrap gap-1.5">
              <AtomsTickerEmbed ticker="TAEE11" size="sm" />
              <AtomsTickerEmbed ticker="ELET3" size="sm" />
              <AtomsTickerEmbed ticker="CPLE6" size="sm" />
            </div>
            <p class="text-sm text-gray-400">
              DY médio: 6-9% ao ano
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-2 font-semibold">Saneamento</h4>
            <div class="mb-2 flex flex-wrap gap-1.5">
              <AtomsTickerEmbed ticker="SAPR11" size="sm" />
              <AtomsTickerEmbed ticker="SBSP3" size="sm" />
            </div>
            <p class="text-sm text-gray-400">
              DY médio: 4-6% ao ano
            </p>
          </div>
        </div>

        <h3 class="text-xl font-semibold">FIIs com Bons Dividendos</h3>
        <p class="leading-relaxed text-gray-300">
          Fundos imobiliários geralmente pagam dividendos mensais com DY mais alto:
        </p>
        <ul class="list-disc space-y-2 pl-6 text-gray-300">
          <li>Galpões logísticos: DY 8-10% ao ano</li>
          <li>Lajes corporativas: DY 7-9% ao ano</li>
          <li>Shopping centers: DY 6-8% ao ano</li>
          <li>FIIs de papel (CRIs): DY 9-11% ao ano</li>
        </ul>

        <h2 class="text-2xl font-bold">Estratégia de Reinvestimento</h2>
        <p class="leading-relaxed text-gray-300">
          O poder dos juros compostos pode acelerar muito seu crescimento patrimonial:
        </p>
        
        <h3 class="text-xl font-semibold">Exemplo Prático</h3>
        <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-5">
          <p class="mb-2 font-semibold">Investimento inicial: R$ 50.000</p>
          <p class="mb-2">Aporte mensal: R$ 1.000</p>
          <p class="mb-2">Dividend Yield: 8% ao ano</p>
          <p class="mb-4">Reinvestindo todos os dividendos:</p>
          <ul class="list-disc space-y-1 pl-6 text-sm text-gray-300">
            <li>Após 5 anos: ~R$ 150.000 (R$ 1.000/mês de dividendos)</li>
            <li>Após 10 anos: ~R$ 350.000 (R$ 2.300/mês de dividendos)</li>
            <li>Após 15 anos: ~R$ 650.000 (R$ 4.300/mês de dividendos)</li>
            <li>Após 20 anos: ~R$ 1.100.000 (R$ 7.300/mês de dividendos)</li>
          </ul>
        </div>

        <h2 class="text-2xl font-bold">Dicas para Maximizar Dividendos</h2>
        <div class="space-y-3">
          <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              1. Diversifique Entre Ações e FIIs
            </h4>
            <p class="text-sm text-gray-300">
              Ações têm potencial de crescimento, FIIs têm dividendos mais altos e frequentes. Combine ambos.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold">2. Reinvista no Início</h4>
            <p class="text-sm text-gray-300">
              Nos primeiros anos, reinvista 100% dos dividendos para acelerar o crescimento da carteira.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold">3. Acompanhe o Payout</h4>
            <p class="text-sm text-gray-300">
              Payout é o % do lucro distribuído. Payout muito alto (>80%) pode ser insustentável.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold">4. Prefira Consistência</h4>
            <p class="text-sm text-gray-300">
              Empresas que pagam dividendos consistentes há muitos anos são mais confiáveis que as que pagam muito mas irregularmente.
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Impostos sobre Dividendos</h2>
        <div class="rounded-xl border border-white/10 bg-white/5 p-5">
          <h3 class="mb-3 text-lg font-semibold">No Brasil</h3>
          <ul class="list-disc space-y-2 pl-6 text-gray-300">
            <li>
              <strong>Dividendos de ações:</strong> Isentos de IR para pessoa física
            </li>
            <li>
              <strong>Dividendos de FIIs:</strong> Isentos de IR se você tiver menos de 10% do fundo e o FII tiver mais de 50 cotistas
            </li>
            <li>
              <strong>JCP (Juros sobre Capital Próprio):</strong> Retém 15% de IR na fonte (mas também é dividendo)
            </li>
          </ul>
        </div>
      </div>

      <!-- CTA para Ferramentas -->
      <MoleculesCtaSection
        title="Use a Calculadora da Redentia"
        description="Simule seus investimentos e descubra quanto precisa para atingir suas metas"
        :buttons="[
          { label: 'Calculadora de Juros Compostos', to: '/calculadora', icon: 'i-lucide-calculator', variant: 'primary' },
          { label: 'Melhores Dividendos', to: '/dividendos', icon: 'i-lucide-coins', variant: 'outline' },
          { label: 'Buscar Ativos', to: '/search', icon: 'i-lucide-search', variant: 'ghost' },
        ]"
      />

      <!-- FAQ Section para SEO -->
      <div class="space-y-4">
        <h2 class="text-2xl font-bold">Perguntas Frequentes</h2>
        <div class="space-y-3">
          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              Quanto preciso investir para receber R$ 1.000/mês de dividendos?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              Com um Dividend Yield médio de 8% ao ano, você precisaria investir aproximadamente R$ 150.000. Com FIIs que rendem 10% ao ano, o valor cai para R$ 120.000.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              É melhor receber dividendos ou reinvestir?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              Depende do seu objetivo. Se está acumulando patrimônio, reinvista para acelerar o crescimento. Se já atingiu sua meta ou precisa da renda, pode usar os dividendos para suas despesas.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              Dividend Yield alto sempre é melhor?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              Não necessariamente. DY muito alto pode indicar empresa com problemas (ação desvalorizada) ou dividendo insustentável. Analise também a saúde financeira da empresa e histórico de pagamentos.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              Quando os dividendos são pagos?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              Varia por empresa. FIIs geralmente pagam mensalmente. Ações podem pagar mensal, trimestral ou semestralmente. Você precisa ter as ações na "data com" para ter direito ao recebimento.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              Posso viver de dividendos?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              Sim, é possível viver de dividendos. Você precisará de um capital significativo (geralmente R$ 500.000 a R$ 1.000.000 dependendo do seu custo de vida) e uma carteira diversificada de boas pagadoras.
            </p>
          </details>
        </div>
      </div>

      <!-- Navegação para Outros Guias -->
      <div class="border-t border-white/10 pt-8">
        <h3 class="mb-4 text-xl font-semibold">Continue Aprendendo</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink
            to="/guias/melhores-fiis-para-investir-em-2026"
            class="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-secondary/30"
          >
            <UIcon name="i-lucide-building-2" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="font-semibold group-hover:text-secondary">Melhores FIIs 2026</h4>
              <p class="text-xs text-gray-400">Fundos com bons dividendos</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>

          <NuxtLink
            to="/guias/como-investir-em-acoes-para-iniciantes"
            class="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-secondary/30"
          >
            <UIcon name="i-lucide-trending-up" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="font-semibold group-hover:text-secondary">Como Investir em Ações</h4>
              <p class="text-xs text-gray-400">Guia para iniciantes</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title:
    'Calculadora de Dividendos: Quanto Receber Mensalmente | Redentia',
  description:
    'Aprenda a calcular dividendos e quanto investir para atingir sua meta de renda passiva. Fórmulas, exemplos práticos, melhores pagadores e estratégias de reinvestimento.',
  path: '/guias/calculadora-de-dividendos',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Calculadora de Dividendos: Quanto Receber Mensalmente',
      description:
        'Guia completo sobre como calcular dividendos e planej ar renda passiva com investimentos',
      author: {
        '@type': 'Organization',
        name: 'Redentia',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Redentia',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.redentia.com.br/512x512.png',
        },
      },
      datePublished: '2026-01-04',
      dateModified: '2026-01-04',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Quanto preciso investir para receber R$ 1.000/mês de dividendos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Com um Dividend Yield médio de 8% ao ano, você precisaria investir aproximadamente R$ 150.000.',
          },
        },
        {
          '@type': 'Question',
          name: 'É melhor receber dividendos ou reinvestir?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Depende do objetivo. Se está acumulando patrimônio, reinvista. Se já atingiu sua meta, pode usar os dividendos.',
          },
        },
        {
          '@type': 'Question',
          name: 'Posso viver de dividendos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim, é possível. Você precisará de capital significativo (R$ 500k a R$ 1M dependendo do custo de vida) e carteira diversificada.',
          },
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
          item: 'https://www.redentia.com.br',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Guias',
          item: 'https://www.redentia.com.br/guias',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Calculadora de Dividendos',
          item: 'https://www.redentia.com.br/guias/calculadora-de-dividendos',
        },
      ],
    },
  ],
})
</script>

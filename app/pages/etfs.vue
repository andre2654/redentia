<template>
  <NuxtLayout name="static" title="ETFs">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-bar-chart-3" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">
            ETFs: Fundos de Índice
          </h1>
        </div>
        <p class="text-base text-gray-400 md:text-lg">
          Invista no Ibovespa, S&P 500 e outros índices com um único clique.
          Diversificação instantânea e taxas baixas. Descubra todos os ETFs da
          B3.
        </p>
      </div>

      <!-- Conteúdo Educacional -->
      <div class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold">O que são ETFs?</h2>
        <p class="leading-relaxed text-gray-300">
          ETF (Exchange Traded Fund) é um fundo de investimento que replica um
          índice de mercado e é negociado na bolsa como se fosse uma ação. Com
          um único ETF, você investe em dezenas ou centenas de empresas
          simultaneamente.
        </p>

        <div
          class="my-6 rounded-2xl border border-secondary/20 bg-secondary/10 p-6"
        >
          <h3 class="mb-3 text-xl font-semibold text-secondary">
            Diversificação Instantânea
          </h3>
          <p class="text-gray-300">
            Ao comprar uma cota de BOVA11 (ETF do Ibovespa), você está comprando
            todas as ~90 ações do índice na mesma proporção. Com R$ 100 você tem
            exposição a Vale, Petrobras, Itaú, Bradesco e todas as outras.
          </p>
        </div>

        <h3 class="text-xl font-semibold">Principais ETFs no Brasil</h3>
        <div class="space-y-4">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <div class="mb-3 flex items-center justify-between">
              <h4 class="text-lg font-semibold text-secondary">
                BOVA11 - Ibovespa
              </h4>
              <UBadge label="Mais Popular" color="secondary" />
            </div>
            <p class="mb-2 text-sm text-gray-300">
              Replica o Ibovespa. Ideal para quem quer investir "na bolsa
              brasileira" de forma diversificada.
            </p>
            <div class="text-sm text-gray-400">
              • ~90 ações das maiores empresas do Brasil
              • Alta liquidez
              • Taxa de administração: ~0,50% ao ano
            </div>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-3 text-lg font-semibold text-secondary">
              SMAL11 - Small Caps
            </h4>
            <p class="mb-2 text-sm text-gray-300">
              Replica índice de small caps. Para quem busca maior potencial de
              crescimento com mais risco.
            </p>
            <div class="text-sm text-gray-400">
              • Empresas pequenas e médias
              • Maior volatilidade
              • Potencial de retorno maior
            </div>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-3 text-lg font-semibold text-secondary">
              IVVB11 - S&P 500 em Reais
            </h4>
            <p class="mb-2 text-sm text-gray-300">
              Invista nas 500 maiores empresas americanas (Apple, Microsoft,
              Amazon) em reais.
            </p>
            <div class="text-sm text-gray-400">
              • Exposição internacional
              • Hedge cambial (dólar)
              • Empresas de tecnologia
            </div>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-3 text-lg font-semibold text-secondary">
              PIBB11 - IBrX-50
            </h4>
            <p class="mb-2 text-sm text-gray-300">
              Replica as 50 ações mais negociadas da B3. Alternativa ao BOVA11.
            </p>
            <div class="text-sm text-gray-400">
              • 50 empresas mais líquidas
              • Menor taxa que BOVA11
              • Rebalanceamento quadrimestral
            </div>
          </div>
        </div>

        <h3 class="text-xl font-semibold">Vantagens dos ETFs</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <div class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-trending-up" class="text-primary h-5 w-5" />
              <h4 class="font-semibold">Taxas Baixas</h4>
            </div>
            <p class="text-sm text-gray-300">
              Gestão passiva custa menos. Taxas de 0,20% a 0,80% ao ano, muito
              abaixo de fundos ativos (1,5-3%).
            </p>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <div class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-layers" class="text-primary h-5 w-5" />
              <h4 class="font-semibold">Diversificação Automática</h4>
            </div>
            <p class="text-sm text-gray-300">
              Uma cota = dezenas/centenas de ações. Diversificação que levaria
              milhares de reais para fazer sozinho.
            </p>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <div class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-zap" class="text-primary h-5 w-5" />
              <h4 class="font-semibold">Liquidez</h4>
            </div>
            <p class="text-sm text-gray-300">
              Compra e vende como ação normal, em segundos durante o pregão. Sem
              burocracia de fundos tradicionais.
            </p>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <div class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-eye" class="text-primary h-5 w-5" />
              <h4 class="font-semibold">Transparência Total</h4>
            </div>
            <p class="text-sm text-gray-300">
              Você sabe exatamente em quais ações o ETF investe. Composição
              pública e atualizada.
            </p>
          </div>
        </div>

        <h3 class="text-xl font-semibold">ETF vs Fundo de Ações</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-white/10">
                <th class="p-3 text-left">Característica</th>
                <th class="p-3 text-left">ETF</th>
                <th class="p-3 text-left">Fundo de Ações</th>
              </tr>
            </thead>
            <tbody class="text-gray-300">
              <tr class="border-b border-white/10">
                <td class="p-3">Taxa de administração</td>
                <td class="p-3 text-secondary">0,20-0,80%</td>
                <td class="p-3">1,5-3%</td>
              </tr>
              <tr class="border-b border-white/10">
                <td class="p-3">Objetivo</td>
                <td class="p-3 text-secondary">Replicar índice</td>
                <td class="p-3">Superar índice</td>
              </tr>
              <tr class="border-b border-white/10">
                <td class="p-3">Liquidez</td>
                <td class="p-3 text-secondary">Imediata (como ação)</td>
                <td class="p-3">D+4 ou mais</td>
              </tr>
              <tr class="border-b border-white/10">
                <td class="p-3">Transparência</td>
                <td class="p-3 text-secondary">Total</td>
                <td class="p-3">Parcial</td>
              </tr>
              <tr>
                <td class="p-3">Come-cotas</td>
                <td class="p-3 text-secondary">Isento</td>
                <td class="p-3">Sim (maio e nov)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="text-xl font-semibold">Para Quem são os ETFs?</h3>
        <ul class="list-disc space-y-2 pl-6 text-gray-300">
          <li>
            <strong>Iniciantes:</strong> Quer investir em ações mas não sabe
            quais escolher
          </li>
          <li>
            <strong>Investidores passivos:</strong> Não quer gastar tempo
            estudando empresas individuais
          </li>
          <li>
            <strong>Diversificadores:</strong> Quer exposição ampla ao mercado
          </li>
          <li>
            <strong>Longo prazo:</strong> Buy and hold em índices de mercado
          </li>
        </ul>
      </div>

      <!-- CTA -->
      <div
        class="from-secondary/20 flex flex-col gap-6 rounded-3xl bg-gradient-to-br to-transparent p-8"
      >
        <div class="text-center">
          <h2 class="mb-3 text-2xl font-bold">
            Compare Todos os ETFs da B3
          </h2>
          <p class="text-gray-300">
            Veja rentabilidade, taxas e composição de cada ETF disponível
          </p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <UButton
            to="/search?group=etfs"
            color="secondary"
            size="xl"
            icon="i-lucide-search"
          >
            Ver Todos os ETFs
          </UButton>
          <UButton
            to="/glossario/etf"
            color="white"
            variant="outline"
            size="xl"
            icon="i-lucide-book-open"
          >
            O que é ETF?
          </UButton>
        </div>
      </div>

      <!-- Link Destacado para Ver Todas -->
      <div class="border-t border-white/10 pt-8">
        <NuxtLink
          to="/search?group=etfs"
          class="group mx-auto flex max-w-2xl items-center justify-between rounded-2xl border border-secondary/30 bg-secondary/10 p-6 transition-all hover:border-secondary/50 hover:bg-secondary/20"
        >
          <div class="flex flex-col gap-1">
            <h3 class="text-xl font-bold group-hover:text-secondary transition-colors">
              Explorar Todos os ETFs Disponíveis
            </h3>
            <p class="text-sm text-gray-400">
              Compare BOVA11, IVVB11, SMAL11 e outros ETFs com dados atualizados
            </p>
          </div>
          <UIcon
            name="i-lucide-arrow-right"
            class="text-secondary h-8 w-8 transition-transform group-hover:translate-x-2"
          />
        </NuxtLink>
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
  title: 'ETFs: Guia Completo de Fundos de Índice no Brasil | Redentia',
  description:
    'Aprenda a investir em ETFs (BOVA11, IVVB11, SMAL11). Diversificação instantânea, taxas baixas e exposição a índices como Ibovespa e S&P 500. Compare todos os ETFs da B3.',
  path: '/etfs',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'ETFs: Guia Completo de Fundos de Índice no Brasil',
      description:
        'Aprenda o que são ETFs, como funcionam, principais ETFs brasileiros (BOVA11, IVVB11, SMAL11) e como investir.',
      author: {
        '@type': 'Organization',
        name: 'Redentia',
      },
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
          name: 'ETFs',
          item: 'https://www.redentia.com.br/etfs',
        },
      ],
    },
  ],
})
</script>

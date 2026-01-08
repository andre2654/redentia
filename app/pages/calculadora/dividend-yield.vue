<template>
  <NuxtLayout name="static" title="Calculadora de Dividend Yield">
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
        <span class="text-white">Dividend Yield</span>
      </nav>

      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-coins" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">
            Calculadora de Dividend Yield: DY Atual, Projetado e On Cost
          </h1>
        </div>
        <p class="text-base text-gray-400 md:text-lg">
          Calcule o dividend yield de ações e FIIs. Veja DY atual, projetado para os próximos anos e DY on cost (no seu preço de compra). Encontre os melhores pagadores de dividendos.
        </p>
      </div>

      <CalculatorDividendYield :assets="assets" :assets-loading="assetsLoading" />

      <div class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold">O que é Dividend Yield?</h2>
        <p class="leading-relaxed text-gray-300">
          Dividend Yield (DY) é um indicador que mostra quanto uma empresa paga em dividendos em relação ao preço da ação. É expresso em porcentagem anual e é fundamental para quem investe buscando renda passiva.
        </p>

        <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg font-semibold">
            Dividend Yield = (Dividendos Anuais ÷ Preço da Ação) × 100
          </p>
          <div class="mt-4 text-center text-sm text-gray-300">
            <p><strong>Exemplo:</strong> Ação custa R$ 25 e paga R$ 1,50/ano em dividendos</p>
            <p class="text-secondary font-semibold">DY = (1,50 ÷ 25) × 100 = 6% ao ano</p>
          </div>
        </div>

        <h3 class="text-xl font-semibold">DY On Cost - O Verdadeiro Retorno</h3>
        <p class="leading-relaxed text-gray-300">
          DY on cost é o dividend yield calculado sobre o seu preço de compra, não o preço atual. Se você comprou uma ação por R$ 20 e ela vale R$ 30 hoje, mas continua pagando R$ 1,50 de dividendo, seu DY on cost é 7,5% (1,50÷20), não 5% (1,50÷30).
        </p>
        <p class="leading-relaxed text-gray-300">
          Este é o conceito mais importante para investidores de dividendos! Com o tempo, conforme os dividendos crescem e você mantém seu preço de compra baixo, seu DY on cost pode chegar a 10%, 15% ou até 20% ao ano!
        </p>

        <h2 class="text-2xl font-bold">Perguntas Frequentes</h2>
        
        <div class="space-y-4">
          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Qual é um bom Dividend Yield?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Para ações: 4-8% é considerado bom. Menos de 3% é baixo, acima de 10% levanta suspeitas (pode ser ação em queda ou dividendo extraordinário). Para FIIs: 8-12% é a média. Acima de 12% investigue se é sustentável.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              DY alto é sempre melhor?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Não! DY muito alto pode indicar: 1) Preço da ação caiu muito (problema na empresa), 2) Dividendo extraordinário que não vai se repetir, 3) Payout insustentável (empresa distribui mais do que deveria). Sempre verifique se os dividendos são sustentáveis analisando o payout ratio e a saúde financeira.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              O que é Payout Ratio?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Payout é a porcentagem do lucro que a empresa distribui em dividendos. Payout = (Dividendos ÷ Lucro) × 100. Para ações: 40-60% é ideal (empresa equilibra dividendos e reinvestimento). Para FIIs: 95%+ é obrigatório por lei. Payout acima de 80% em ações é arriscado - empresa pode cortar dividendos se o lucro cair.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Como projetar DY futuro?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Use: DY Futuro = (LPA × Payout × Crescimento do Lucro) ÷ Preço Atual. Exemplo: LPA de R$ 3, payout 50%, crescimento 10% a.a., preço R$ 25. DY ano 1 = (3×1.1×0.5)÷25 = 6.6%. Ano 3 = (3×1.1³×0.5)÷25 = 8%. Com crescimento consistente, seu DY on cost cresce muito!
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Dividendos têm imposto de renda?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Dividendos de ações e FIIs são isentos de IR para pessoa física! Isso torna o retorno líquido excelente. JCP (Juros sobre Capital Próprio) têm 15% de IR retido na fonte, mas ainda assim são vantajosos. Esta isenção é um dos grandes atrativos do mercado brasileiro.
            </p>
          </details>
        </div>

        <h2 class="text-2xl font-bold">Média de DY por Tipo de Ativo</h2>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead class="bg-white/10">
              <tr>
                <th class="border border-white/20 px-4 py-2 text-left">Tipo de Ativo</th>
                <th class="border border-white/20 px-4 py-2 text-left">DY Típico</th>
                <th class="border border-white/20 px-4 py-2 text-left">Observações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-white/20 px-4 py-2 font-semibold">Ações Blue Chips</td>
                <td class="border border-white/20 px-4 py-2">4-8%</td>
                <td class="border border-white/20 px-4 py-2 text-sm text-gray-300">Bancos, energia, saneamento</td>
              </tr>
              <tr class="bg-white/5">
                <td class="border border-white/20 px-4 py-2 font-semibold">Ações Growth</td>
                <td class="border border-white/20 px-4 py-2">0-3%</td>
                <td class="border border-white/20 px-4 py-2 text-sm text-gray-300">Reinvestem lucro no crescimento</td>
              </tr>
              <tr>
                <td class="border border-white/20 px-4 py-2 font-semibold">FIIs Tijolo</td>
                <td class="border border-white/20 px-4 py-2">8-12%</td>
                <td class="border border-white/20 px-4 py-2 text-sm text-gray-300">Logística, lajes corporativas, shoppings</td>
              </tr>
              <tr class="bg-white/5">
                <td class="border border-white/20 px-4 py-2 font-semibold">FIIs Papel</td>
                <td class="border border-white/20 px-4 py-2">9-13%</td>
                <td class="border border-white/20 px-4 py-2 text-sm text-gray-300">CRIs, debêntures</td>
              </tr>
              <tr>
                <td class="border border-white/20 px-4 py-2 font-semibold">Small Caps</td>
                <td class="border border-white/20 px-4 py-2">2-6%</td>
                <td class="border border-white/20 px-4 py-2 text-sm text-gray-300">Foco em crescimento, DY menor</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex flex-col gap-4 rounded-[30px] bg-white/5 p-6">
        <h2 class="text-2xl font-bold">Outras Ferramentas</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            to="/calculadora/planejamento"
            class="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-secondary/50"
          >
            <UIcon name="i-lucide-target" class="text-secondary size-8 shrink-0" />
            <div>
              <h3 class="font-semibold">Planejamento Patrimonial</h3>
              <p class="text-sm text-gray-400">Carteira com foco em dividendos</p>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/calculadora/preco-teto"
            class="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-secondary/50"
          >
            <UIcon name="i-lucide-target" class="text-secondary size-8 shrink-0" />
            <div>
              <h3 class="font-semibold">Preço Teto</h3>
              <p class="text-sm text-gray-400">Veja se a ação está barata</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <MoleculesCtaSection
        title="Encontre as melhores pagadoras de dividendos"
        description="Compare dividend yield de todas as ações e FIIs da B3 em tempo real."
        primary-button-text="Ver ranking de dividendos"
        primary-button-link="/dividendos"
        secondary-button-text="Criar conta grátis"
        secondary-button-link="/auth/register"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAssetsService } from '~/services/assets'

const { getAssets } = useAssetsService()
const { data: assetsData, pending: assetsPending } = await useAsyncData(
  'assets-calculator-dividend-yield',
  () => getAssets()
)

const assets = computed(() => assetsData.value ?? [])
const assetsLoading = computed(() => assetsPending.value)

usePageSeo({
  title: 'Calculadora de Dividend Yield: DY Atual, Projetado e On Cost | Redentia',
  description:
    'Calcule o dividend yield de ações e FIIs. Veja DY histórico, projeções futuras e DY on cost. Compare ativos e encontre os melhores pagadores de dividendos.',
  path: '/calculadora/dividend-yield',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadora' },
    { name: 'Dividend Yield', path: '/calculadora/dividend-yield' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Calculadora de Dividend Yield Redentia',
      applicationCategory: 'FinanceApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
      operatingSystem: 'Web',
      description:
        'Calculadora gratuita de dividend yield para ações e FIIs com DY atual, projetado e on cost.',
      featureList: [
        'Cálculo de DY atual',
        'DY on cost (preço de compra)',
        'Projeção de DY futuro',
        'Comparação de ativos',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Qual é um bom Dividend Yield?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Para ações: 4-8% é considerado bom. Para FIIs: 8-12% é a média. DY muito alto pode indicar problemas.',
          },
        },
        {
          '@type': 'Question',
          name: 'O que é Payout Ratio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Payout é a porcentagem do lucro distribuída em dividendos. Para ações, 40-60% é ideal. Para FIIs, 95%+ é obrigatório.',
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

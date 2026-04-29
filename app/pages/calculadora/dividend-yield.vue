<template>
  <NuxtLayout :name="layoutName" title="Calculadora de Dividend Yield">
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
          <UIcon name="i-lucide-coins" class="text-secondary h-8 w-8" />
          <h1
            class="font-light"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(28px, 4vw, 36px)',
              lineHeight: 1.05,
              letterSpacing: '-0.7px',
            }"
          >Calculadora de Dividend Yield: DY Atual, Projetado e On Cost</h1>
        </div>
        <p class="text-base md:text-lg">
          Calcule o dividend yield de ações e FIIs. Veja DY atual, projetado para os próximos anos e DY on cost (no seu preço de compra). Encontre os melhores pagadores de dividendos.
        </p>
      </div>

      <CalculatorDividendYield :assets="assets" :assets-loading="assetsLoading" />

      <div class="max-w-none">
        <h2>O que é Dividend Yield?</h2>
        <p class="leading-relaxed">
          Dividend Yield (DY) é um indicador que mostra quanto uma empresa paga em dividendos em relação ao preço da ação. É expresso em porcentagem anual e é fundamental para quem investe buscando renda passiva.
        </p>

        <div class="brand-card border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg">
            Dividend Yield = (Dividendos Anuais ÷ Preço da Ação) × 100
          </p>
          <div class="mt-4 text-center text-sm">
            <p><strong>Exemplo:</strong> Ação custa R$ 25 e paga R$ 1,50/ano em dividendos</p>
            <p class="text-secondary">DY = (1,50 ÷ 25) × 100 = 6% ao ano</p>
          </div>
        </div>

        <h3>DY On Cost, O Verdadeiro Retorno</h3>
        <p class="leading-relaxed">
          DY on cost é o dividend yield calculado sobre o seu preço de compra, não o preço atual. Se você comprou uma ação por R$ 20 e ela vale R$ 30 hoje, mas continua pagando R$ 1,50 de dividendo, seu DY on cost é 7,5% (1,50÷20), não 5% (1,50÷30).
        </p>
        <p class="leading-relaxed">
          Este é o conceito mais importante para investidores de dividendos! Com o tempo, conforme os dividendos crescem e você mantém seu preço de compra baixo, seu DY on cost pode chegar a 10%, 15% ou até 20% ao ano!
        </p>

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
              Qual é um bom Dividend Yield?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Para ações: 4-8% é considerado bom. Menos de 3% é baixo, acima de 10% levanta suspeitas (pode ser ação em queda ou dividendo extraordinário). Para FIIs: 8-12% é a média. Acima de 12% investigue se é sustentável.
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
              DY alto é sempre melhor?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Não! DY muito alto pode indicar: 1) Preço da ação caiu muito (problema na empresa), 2) Dividendo extraordinário que não vai se repetir, 3) Payout insustentável (empresa distribui mais do que deveria). Sempre verifique se os dividendos são sustentáveis analisando o payout ratio e a saúde financeira.
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
              O que é Payout Ratio?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Payout é a porcentagem do lucro que a empresa distribui em dividendos. Payout = (Dividendos ÷ Lucro) × 100. Para ações: 40-60% é ideal (empresa equilibra dividendos e reinvestimento). Para FIIs: 95%+ é obrigatório por lei. Payout acima de 80% em ações é arriscado, empresa pode cortar dividendos se o lucro cair.
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
              Como projetar DY futuro?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Use: DY Futuro = (LPA × Payout × Crescimento do Lucro) ÷ Preço Atual. Exemplo: LPA de R$ 3, payout 50%, crescimento 10% a.a., preço R$ 25. DY ano 1 = (3×1.1×0.5)÷25 = 6.6%. Ano 3 = (3×1.1³×0.5)÷25 = 8%. Com crescimento consistente, seu DY on cost cresce muito!
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
              Dividendos têm imposto de renda?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Dividendos de ações e FIIs são isentos de IR para pessoa física! Isso torna o retorno líquido excelente. JCP (Juros sobre Capital Próprio) têm 15% de IR retido na fonte, mas ainda assim são vantajosos. Esta isenção é um dos grandes atrativos do mercado brasileiro.
            </p>
          </details>
        </div>

        <h2>Média de DY por Tipo de Ativo</h2>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead
              :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"
            >
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Tipo de Ativo</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">DY Típico</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Observações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Ações Blue Chips</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">4-8%</td>
                <td class="border px-4 py-2 text-sm" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Bancos, energia, saneamento</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Ações Growth</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">0-3%</td>
                <td class="border px-4 py-2 text-sm" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Reinvestem lucro no crescimento</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">FIIs Tijolo</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">8-12%</td>
                <td class="border px-4 py-2 text-sm" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Logística, lajes corporativas, shoppings</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">FIIs Papel</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">9-13%</td>
                <td class="border px-4 py-2 text-sm" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">CRIs, debêntures</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Small Caps</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">2-6%</td>
                <td class="border px-4 py-2 text-sm" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Foco em crescimento, DY menor</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        class="flex flex-col gap-4 rounded-[30px] p-6"
        :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"
      >
        <h2>Outras Ferramentas</h2>
        <div class="grid gap-4 md:grid-cols-2">
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
              <p class="text-sm">Carteira com foco em dividendos</p>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/calculadora/preco-teto"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <UIcon name="i-lucide-target" class="text-secondary size-8 shrink-0" />
            <div>
              <h3>Preço Teto</h3>
              <p class="text-sm">Veja se a ação está barata</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <MoleculesCtaSection
        title="Encontre as melhores pagadoras de dividendos"
        description="Compare dividend yield de todas as ações e FIIs da B3 em tempo real."
        :buttons="[
          { label: 'Ver ranking de dividendos', to: '/dividendos', icon: 'i-lucide-arrow-right', variant: 'primary' },
          { label: 'Criar conta grátis', to: '/auth/register', variant: 'outline' },
        ]"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAssetsService } from '~/services/assets'

const brand = useBrand()
const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'static'
)
const { getAssets } = useAssetsService()
const { data: assetsData, pending: assetsPending } = await useAsyncData(
  'assets-calculator-dividend-yield',
  () => getAssets()
)

const assets = computed(() => assetsData.value ?? [])
const assetsLoading = computed(() => assetsPending.value)

usePageSeo({
  title: `Calculadora de Dividend Yield: DY Atual, Projetado e On Cost | ${brand.name}`,
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
      name: `Calculadora de Dividend Yield ${brand.name}`,
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

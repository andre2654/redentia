<template>
  <NuxtLayout name="static" title="Ações">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-trending-up" aria-hidden="true" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl md:text-4xl" :class="[brand.font.headingWeight, brand.font.headingStyle]">
            Todas as Ações da B3
          </h1>
        </div>
        <p class="text-base md:text-lg">
          Descubra as melhores ações para investir, compare indicadores
          fundamentalistas e construa uma carteira de sucesso no mercado
          brasileiro.
        </p>
      </div>

      <!-- Conteúdo Educacional -->
      <div>
        <h2>O que são Ações?</h2>
        <p class="leading-relaxed">
          Ações são pequenas partes (frações) de uma empresa listada na bolsa
          de valores. Ao comprar uma ação, você se torna sócio da empresa e
          tem direito a receber parte dos lucros (dividendos) e participar do
          crescimento do valor da companhia.
        </p>

        <h3>Como Funcionam as Ações no Brasil</h3>
        <p class="leading-relaxed">
          No Brasil, as ações são negociadas na B3 (Brasil, Bolsa, Balcão) e
          podem ser de dois tipos principais:
        </p>
        <ul class="list-disc space-y-2 pl-6">
          <li>
            <strong>Ações Ordinárias (ON):</strong> Terminam em 3 (VALE3,
            PETR3) e dão direito a voto nas assembleias da empresa
          </li>
          <li>
            <strong>Ações Preferenciais (PN):</strong> Terminam em 4 (PETR4,
            ITUB4) e têm preferência no recebimento de dividendos, mas
            geralmente não dão direito a voto
          </li>
        </ul>

        <h3>
          Por que Investir em Ações?
        </h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="brand-card p-5" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, borderWidth: '1px', borderStyle: 'solid' }">
            <h4 class="mb-2 text-secondary">
              Potencial de Crescimento
            </h4>
            <p class="text-sm">
              Ações podem se valorizar significativamente ao longo do tempo,
              superando a inflação e renda fixa no longo prazo.
            </p>
          </div>
          <div class="brand-card p-5" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, borderWidth: '1px', borderStyle: 'solid' }">
            <h4 class="mb-2 text-secondary">
              Renda Passiva
            </h4>
            <p class="text-sm">
              Muitas empresas distribuem dividendos regularmente, gerando renda
              passiva para os acionistas sem precisar vender as ações.
            </p>
          </div>
          <div class="brand-card p-5" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, borderWidth: '1px', borderStyle: 'solid' }">
            <h4 class="mb-2 text-secondary">
              Proteção Contra Inflação
            </h4>
            <p class="text-sm">
              Empresas reajustam preços conforme a inflação, protegendo seu
              poder de compra no longo prazo.
            </p>
          </div>
          <div class="brand-card p-5" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, borderWidth: '1px', borderStyle: 'solid' }">
            <h4 class="mb-2 text-secondary">
              Participação nos Lucros
            </h4>
            <p class="text-sm">
              Como sócio, você se beneficia do crescimento e sucesso da empresa
              através da valorização das ações.
            </p>
          </div>
        </div>

        <h3>
          Como Escolher Boas Ações para Investir
        </h3>
        <p class="leading-relaxed">
          A análise fundamentalista é essencial para escolher ações de
          qualidade. Principais indicadores a observar:
        </p>
        <ul class="list-disc space-y-2 pl-6">
          <li>
            <strong>P/L (Preço sobre Lucro):</strong> Indica se a ação está
            cara ou barata em relação ao lucro
          </li>
          <li>
            <strong>ROE (Return on Equity):</strong> Mostra a eficiência da
            empresa em gerar lucro (busque > 15%)
          </li>
          <li>
            <strong>Dividend Yield:</strong> Percentual de dividendos em
            relação ao preço (bom > 4% ao ano)
          </li>
          <li>
            <strong>Dívida Líquida/EBITDA:</strong> Avalia endividamento
            (idealmente < 2x)
          </li>
          <li>
            <strong>Margem Líquida:</strong> Quanto a empresa lucra de cada
            venda (quanto maior, melhor)
          </li>
        </ul>

        <h3>
          Principais Setores da Bolsa Brasileira
        </h3>
        <div class="space-y-3">
          <div class="brand-card p-4" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, borderWidth: '1px', borderStyle: 'solid' }">
            <h4 class="mb-1">Financeiro (Bancos)</h4>
            <p class="text-sm">
              ITUB4, BBDC4, BBAS3 - Alta liquidez, bons pagadores de dividendos
            </p>
          </div>
          <div class="brand-card p-4" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, borderWidth: '1px', borderStyle: 'solid' }">
            <h4 class="mb-1">Commodities</h4>
            <p class="text-sm">
              VALE3, PETR4 - Expostas a preços internacionais, cíclicas
            </p>
          </div>
          <div class="brand-card p-4" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, borderWidth: '1px', borderStyle: 'solid' }">
            <h4 class="mb-1">Varejo</h4>
            <p class="text-sm">
              MGLU3, AMER3, LREN3 - Dependem do consumo interno, crescimento
            </p>
          </div>
          <div class="brand-card p-4" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, borderWidth: '1px', borderStyle: 'solid' }">
            <h4 class="mb-1">Utilities (Energia, Saneamento)</h4>
            <p class="text-sm">
              ELET3, TAEE11, SAPR11 - Previsíveis, bons dividendos
            </p>
          </div>
        </div>

        <h3>
          Estratégias para Investir em Ações
        </h3>
        <div class="space-y-3">
          <div class="brand-card border border-secondary/20 bg-secondary/10 p-5">
            <h4 class="mb-2 text-secondary">
              Buy and Hold (Longo Prazo)
            </h4>
            <p class="text-sm">
              Compre ações de empresas de qualidade e mantenha por anos.
              Estratégia preferida de Warren Buffett. Ideal para quem busca
              crescimento e dividendos consistentes.
            </p>
          </div>
          <div class="brand-card p-5" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, borderWidth: '1px', borderStyle: 'solid' }">
            <h4 class="mb-2">Carteira de Dividendos</h4>
            <p class="text-sm">
              Foco em empresas que pagam bons dividendos regularmente.
              Objetivo: renda passiva mensal ou trimestral.
            </p>
          </div>
          <div class="brand-card p-5" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, borderWidth: '1px', borderStyle: 'solid' }">
            <h4 class="mb-2">Diversificação Setorial</h4>
            <p class="text-sm">
              Distribua investimentos entre setores diferentes (bancos, varejo,
              energia, etc.) para reduzir riscos.
            </p>
          </div>
        </div>

        <h3>Riscos de Investir em Ações</h3>
        <div
          class="brand-card p-5"
          :style="{ borderColor: 'color-mix(in srgb, ' + (brand.colors.warning || '#f59e0b') + ' 25%, transparent)', backgroundColor: 'color-mix(in srgb, ' + (brand.colors.warning || '#f59e0b') + ' 8%, transparent)', borderWidth: '1px', borderStyle: 'solid' }"
        >
          <ul class="list-disc space-y-2 pl-6">
            <li>
              <strong>Volatilidade:</strong> Preços sobem e descem,
              especialmente no curto prazo
            </li>
            <li>
              <strong>Risco de empresa:</strong> Empresa pode ter resultados
              ruins ou até quebrar
            </li>
            <li>
              <strong>Risco de mercado:</strong> Toda bolsa pode cair em crises
              econômicas
            </li>
            <li>
              <strong>Perda de capital:</strong> Você pode perder parte ou todo
              o investimento
            </li>
          </ul>
          <p class="mt-3 text-sm" :style="{ color: brand.colors.warning || '#f59e0b' }">
            ⚠️ Importante: Invista apenas o que você pode deixar investido por
            pelo menos 5 anos. Nunca invista dinheiro que precisará no curto
            prazo.
          </p>
        </div>

        <h3>Como Começar a Investir em Ações</h3>
        <ol class="list-decimal space-y-2 pl-6">
          <li>
            <strong>Abra conta em uma corretora:</strong> XP, Rico, Inter, BTG,
            Clear, etc.
          </li>
          <li>
            <strong>Transfira dinheiro:</strong> TED/PIX da sua conta bancária
          </li>
          <li>
            <strong>Estude as empresas:</strong> Use a {{ brand.name }} para analisar
            indicadores
          </li>
          <li>
            <strong>Comece pequeno:</strong> R$ 100-500 para aprender
          </li>
          <li>
            <strong>Diversifique:</strong> Tenha pelo menos 5-10 empresas
            diferentes
          </li>
          <li>
            <strong>Pense em longo prazo:</strong> Paciência é fundamental
          </li>
        </ol>
      </div>

      <!-- Destaque para Simulador de Ações -->
      <div class="rounded-[30px] border border-secondary/30 bg-gradient-to-br from-secondary/10 to-secondary/5 p-8">
        <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div class="flex-1">
            <div class="mb-3 flex items-center gap-2">
              <UIcon name="i-lucide-chart-line" class="text-secondary h-8 w-8" />
              <h2>Simule Investimentos em Ações Reais</h2>
            </div>
            <p class="mb-4">
              Descubra quanto você teria ganho investindo em ações da B3. Use dados históricos reais, incluindo dividendos reinvestidos e performance de múltiplos ativos.
            </p>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <UIcon name="i-lucide-check" class="text-secondary size-4" />
                Dados históricos reais da B3
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-lucide-check" class="text-secondary size-4" />
                Reinvestimento automático de dividendos
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-lucide-check" class="text-secondary size-4" />
                Comparação de múltiplos ativos
              </li>
            </ul>
          </div>
          <div class="flex flex-col gap-3 md:w-auto">
            <UButton
              to="/calculadora/acoes"
              color="secondary"
              size="xl"
              icon="i-lucide-calculator"
              class="w-full md:w-auto"
            >
              Usar Simulador
            </UButton>
            <UButton
              to="/calculadora"
              color="white"
              variant="outline"
              size="lg"
              icon="i-lucide-trending-up"
              class="w-full md:w-auto"
            >
              Outras Calculadoras
            </UButton>
          </div>
        </div>
      </div>

      <!-- CTA para Ferramentas -->
      <MoleculesCtaSection
        :title="`Use as Ferramentas da ${brand.name}`"
        description="Encontre as melhores ações, compare indicadores e tome decisões informadas"
        :buttons="[
          { label: 'Buscar Ações', to: '/search?group=stocks', icon: 'i-lucide-search', variant: 'primary' },
          { label: 'Calculadoras', to: '/calculadora', icon: 'i-lucide-calculator', variant: 'outline' },
          { label: 'Glossário', to: '/glossario', icon: 'i-lucide-book-open', variant: 'ghost' },
        ]"
      />

      <!-- Link Destacado para Ver Todas -->
      <div class="pt-8" :style="{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: brand.colors.border }">
        <NuxtLink
          to="/search?group=stocks"
          class="group mx-auto flex max-w-2xl items-center justify-between rounded-2xl border border-secondary/30 bg-secondary/10 p-6 transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:border-secondary/50 hover:bg-secondary/20"
        >
          <div class="flex flex-col gap-1">
            <h3 class="group-hover:text-secondary transition-colors">
              Ver Todas as Ações da B3
            </h3>
            <p class="text-sm">
              Explore +500 ações com filtros avançados e indicadores em tempo real
            </p>
          </div>
          <UIcon
            name="i-lucide-arrow-right"
            aria-hidden="true"
            class="text-secondary h-8 w-8 transition-transform group-hover:translate-x-2"
          />
        </NuxtLink>
      </div>

      <!-- FAQ Section para SEO -->
      <div class="space-y-4">
        <h2>Perguntas Frequentes sobre Ações</h2>
        <div class="space-y-4">
          <details class="group brand-card p-4" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, borderWidth: '1px', borderStyle: 'solid' }">
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Quanto preciso para começar a investir em ações?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              É possível começar com menos de R$ 100. Muitas ações custam entre
              R$ 10-50, e você pode comprar no mercado fracionário (menos de
              100 ações). O importante é começar e ir aumentando conforme
              aprende.
            </p>
          </details>

          <details class="group brand-card p-4" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, borderWidth: '1px', borderStyle: 'solid' }">
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Qual a diferença entre ações ON e PN?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              ON (Ordinárias, final 3) dão direito a voto. PN (Preferenciais,
              final 4) têm preferência em dividendos mas geralmente não têm
              voto. Para pequenos investidores, PN costuma ser mais indicada
              por ter maior liquidez.
            </p>
          </details>

          <details class="group brand-card p-4" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, borderWidth: '1px', borderStyle: 'solid' }">
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Como recebo dividendos?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Os dividendos caem automaticamente na sua conta da corretora nas
              datas definidas pela empresa. Você não precisa fazer nada - basta
              ter as ações na data "com" (último dia para ter direito).
            </p>
          </details>

          <details class="group brand-card p-4" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, borderWidth: '1px', borderStyle: 'solid' }">
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Ações são seguras?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Ações têm risco de oscilação e perda. No curto prazo podem cair
              muito. Mas no longo prazo (10+ anos), historicamente superam
              inflação e renda fixa. A segurança vem da diversificação e prazo
              longo.
            </p>
          </details>

          <details class="group brand-card p-4" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, borderWidth: '1px', borderStyle: 'solid' }">
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Posso perder mais dinheiro do que investi?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Não em ações normais. O máximo que você pode perder é 100% do que
              investiu (se empresa quebrar). Diferente de alavancagem ou
              derivativos, onde pode perder mais.
            </p>
          </details>
        </div>
      </div>
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
  title:
    `Ações: Guia Completo para Investir na Bolsa de Valores | ${brand.name}`,
  description:
    'Descubra como investir em ações da B3. Guia completo com estratégias, indicadores fundamentalistas, melhores ações para iniciantes e análise de dividendos. Compare +500 ações.',
  path: '/acoes',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Quanto preciso para começar a investir em ações?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'É possível começar com menos de R$ 100. Muitas ações custam entre R$ 10-50, e você pode comprar no mercado fracionário (menos de 100 ações).',
          },
        },
        {
          '@type': 'Question',
          name: 'Qual a diferença entre ações ON e PN?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'ON (Ordinárias, final 3) dão direito a voto. PN (Preferenciais, final 4) têm preferência em dividendos mas geralmente não têm voto.',
          },
        },
        {
          '@type': 'Question',
          name: 'Como recebo dividendos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Os dividendos caem automaticamente na sua conta da corretora nas datas definidas pela empresa. Você não precisa fazer nada.',
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
          item: brand.url,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Ações',
          item: `${brand.url}/acoes`,
        },
      ],
    },
  ],
})
</script>

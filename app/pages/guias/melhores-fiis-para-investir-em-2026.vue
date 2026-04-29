<template>
  <NuxtLayout name="static" title="Melhores FIIs para Investir em 2026">
    <section class="static-content flex flex-col gap-8 px-6 py-8">
      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-building-2" class="text-secondary h-8 w-8" />
          <h1 class="md:text-4xl">
            Melhores FIIs para Investir em 2026
          </h1>
        </div>
        <p class="text-base md:text-lg">
          Descubra os fundos imobiliários mais promissores para 2026. Análise completa de segmentos, indicadores e estratégias para construir sua carteira de FIIs.
        </p>
      </div>

      <!-- Conteúdo Educacional -->
      <div class="flex flex-col gap-6 max-w-none">
        <h2>O que são Fundos Imobiliários (FIIs)?</h2>
        <p class="leading-relaxed">
          Fundos Imobiliários (FIIs) são investimentos coletivos em imóveis ou títulos do setor imobiliário. Ao comprar cotas de um FII, você se torna dono de uma fração de um portfólio de imóveis comerciais, shoppings, galpões logísticos ou recebíveis imobiliários.
        </p>

        <h3>Principais Vantagens dos FIIs</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-2 text-secondary">
              Renda Mensal Passiva
            </h4>
            <p class="text-sm">
              FIIs pagam dividendos mensais provenientes dos aluguéis dos imóveis. Ideal para quem busca renda recorrente.
            </p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-2 text-secondary">
              Isenção de IR
            </h4>
            <p class="text-sm">
              Os dividendos recebidos são isentos de imposto de renda para pessoa física, aumentando sua rentabilidade líquida.
            </p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-2 text-secondary">
              Diversificação
            </h4>
            <p class="text-sm">
              Com pouco dinheiro você investe em múltiplos imóveis de alto padrão, impossível comprar diretamente.
            </p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-2 text-secondary">
              Liquidez
            </h4>
            <p class="text-sm">
              Diferente de um imóvel físico, você pode vender suas cotas rapidamente na bolsa de valores.
            </p>
          </div>
        </div>

        <h2>Principais Segmentos de FIIs</h2>

        <h3>1. FIIs de Tijolo</h3>
        <p class="leading-relaxed">
          Investem diretamente em imóveis físicos e recebem aluguéis.
        </p>
        <div class="space-y-3">
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-2">Lajes Corporativas</h4>
            <div class="mb-2 flex flex-wrap gap-1.5">
              <AtomsTickerEmbed ticker="HGLG11" size="sm" />
              <AtomsTickerEmbed ticker="PVBI11" size="sm" />
            </div>
            <p class="text-sm">
              Edifícios comerciais de escritórios. Risco médio, contratos longos.
            </p>
          </div>
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-2">Shopping Centers</h4>
            <div class="mb-2 flex flex-wrap gap-1.5">
              <AtomsTickerEmbed ticker="VISC11" size="sm" />
              <AtomsTickerEmbed ticker="XPML11" size="sm" />
            </div>
            <p class="text-sm">
              Shoppings centers. Recebem aluguel + percentual sobre vendas.
            </p>
          </div>
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-2">Galpões Logísticos</h4>
            <div class="mb-2 flex flex-wrap gap-1.5">
              <AtomsTickerEmbed ticker="LVBI11" size="sm" />
              <AtomsTickerEmbed ticker="BRCO11" size="sm" />
            </div>
            <p class="text-sm">
              Armazéns e centros de distribuição. Crescimento com e-commerce.
            </p>
          </div>
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-2">Hospitais e Educação</h4>
            <div class="mb-2 flex flex-wrap gap-1.5">
              <AtomsTickerEmbed ticker="NSLU11" size="sm" />
            </div>
            <p class="text-sm">
              Hospitais, clínicas, universidades. Setores defensivos.
            </p>
          </div>
        </div>

        <h3>2. FIIs de Papel</h3>
        <p class="leading-relaxed">
          Investem em títulos e recebíveis do setor imobiliário (CRIs, LCIs).
        </p>
        <div class="space-y-3">
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-2">FIIs de CRI</h4>
            <div class="mb-2 flex flex-wrap gap-1.5">
              <AtomsTickerEmbed ticker="MXRF11" size="sm" />
              <AtomsTickerEmbed ticker="BTLG11" size="sm" />
            </div>
            <p class="text-sm">
              Certificados de Recebíveis Imobiliários. Renda previsível, sensível a juros.
            </p>
          </div>
        </div>

        <h3>3. Fundos de Fundos (FOFs)</h3>
        <p class="leading-relaxed">
          Investem em cotas de outros FIIs, oferecendo diversificação automática.
        </p>
        <div class="flex flex-wrap gap-2">
          <AtomsTickerEmbed ticker="KNCR11" size="sm" />
          <AtomsTickerEmbed ticker="RBRF11" size="sm" />
        </div>

        <h2>Como Escolher os Melhores FIIs</h2>

        <h3>Indicadores Fundamentalistas</h3>
        <ul class="list-disc space-y-2 pl-6">
          <li>
            <strong>Dividend Yield (DY):</strong> Percentual de dividendos sobre o preço da cota. Bom: acima de 0,7% ao mês (8,4% ao ano).
          </li>
          <li>
            <strong>Vacância:</strong> Percentual de imóveis vazios. Ideal: abaixo de 10%. Alta vacância = menos renda.
          </li>
          <li>
            <strong>P/VP (Preço sobre Valor Patrimonial):</strong> Compara preço com valor dos ativos. Abaixo de 1,0 pode indicar oportunidade.
          </li>
          <li>
            <strong>Liquidez:</strong> Volume de negociação diário. FIIs com mais de R$ 1 milhão/dia são mais líquidos.
          </li>
          <li>
            <strong>Qualidade dos Imóveis:</strong> Localização, idade, inquilinos. Prefira ativos classe A em boas localizações.
          </li>
        </ul>

        <h2>Estratégias para 2026</h2>

        <div class="space-y-3">
          <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-5">
            <h4 class="mb-2 text-secondary">
              Aproveite a Queda dos Juros
            </h4>
            <p class="text-sm">
              Com expectativa de queda na Selic em 2026, FIIs tendem a se valorizar. FIIs de tijolo se beneficiam mais que FIIs de papel.
            </p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-2">Foco em Logística</h4>
            <p class="text-sm">
              O crescimento do e-commerce mantém demanda forte por galpões logísticos. Setor com boas perspectivas de longo prazo.
            </p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-2">Diversifique Entre Segmentos</h4>
            <p class="text-sm">
              Monte uma carteira com FIIs de diferentes segmentos (logística, lajes, shoppings, papel) para reduzir riscos.
            </p>
          </div>
        </div>

        <h2>Perfis de Carteira de FIIs</h2>

        <h3>Carteira Conservadora (Foco em Renda)</h3>
        <ul class="list-disc space-y-2 pl-6">
          <li>50% FIIs de Papel (CRIs) - Renda previsível</li>
          <li>30% Lajes Corporativas - Contratos longos</li>
          <li>20% Fundos de Fundos - Diversificação</li>
        </ul>

        <h3>Carteira Moderada (Balanceada)</h3>
        <ul class="list-disc space-y-2 pl-6">
          <li>40% Galpões Logísticos - Crescimento</li>
          <li>30% Lajes Corporativas - Estabilidade</li>
          <li>20% Shopping Centers - Potencial de valorização</li>
          <li>10% FIIs de Papel - Renda fixa</li>
        </ul>

        <h3>Carteira Agressiva (Foco em Valorização)</h3>
        <ul class="list-disc space-y-2 pl-6">
          <li>50% Galpões Logísticos - Alto crescimento</li>
          <li>30% Shopping Centers - Recuperação pós-pandemia</li>
          <li>20% Lajes Corporativas Premium - Ocupação alta</li>
        </ul>

        <h2>Riscos dos FIIs</h2>
        <div
          class="rounded-xl border p-5"
          :style="{ borderColor: 'color-mix(in srgb, ' + (brand.colors.warning || '#f59e0b') + ' 25%, transparent)', backgroundColor: 'color-mix(in srgb, ' + (brand.colors.warning || '#f59e0b') + ' 8%, transparent)' }"
        >
          <ul class="list-disc space-y-2 pl-6">
            <li>
              <strong>Vacância:</strong> Imóveis vazios reduzem drasticamente os dividendos
            </li>
            <li>
              <strong>Inadimplência:</strong> Inquilinos podem deixar de pagar aluguel
            </li>
            <li>
              <strong>Desvalorização:</strong> Cotas podem cair abaixo do preço de compra
            </li>
            <li>
              <strong>Liquidez:</strong> FIIs pequenos podem ter dificuldade de venda
            </li>
            <li>
              <strong>Taxa de Juros:</strong> Selic alta torna FIIs menos atrativos
            </li>
          </ul>
          <p class="mt-3 text-sm" :style="{ color: brand.colors.warning || '#f59e0b' }">
            ⚠️ Importante: Diversifique sua carteira de FIIs entre diferentes segmentos e gestoras para reduzir riscos.
          </p>
        </div>

        <h2>Como Começar a Investir em FIIs</h2>
        <ol class="list-decimal space-y-2 pl-6">
          <li>
            <strong>Abra conta em uma corretora:</strong> Mesma conta usada para ações
          </li>
          <li>
            <strong>Estude os fundos:</strong> Analise relatórios gerenciais, DY, vacância
          </li>
          <li>
            <strong>Comece com valores pequenos:</strong> R$ 100-200 por FII
          </li>
          <li>
            <strong>Monte uma carteira diversificada:</strong> Mínimo de 5-8 FIIs diferentes
          </li>
          <li>
            <strong>Reinvista os dividendos:</strong> Compre mais cotas para acelerar crescimento
          </li>
          <li>
            <strong>Monitore mensalmente:</strong> Acompanhe dividendos e vacância
          </li>
        </ol>
      </div>

      <!-- CTA para Ferramentas -->
      <MoleculesCtaSection
        :title="`Explore FIIs na ${brand.name}`"
        description="Compare indicadores, analise dividendos e construa sua carteira ideal de FIIs"
        :buttons="[
          { label: 'Ver Todos os FIIs', to: '/fiis', icon: 'i-lucide-building-2', variant: 'primary' },
          { label: 'Buscar FIIs', to: '/search?group=reits', icon: 'i-lucide-search', variant: 'outline' },
          { label: 'Dividendos', to: '/dividendos', icon: 'i-lucide-coins', variant: 'ghost' },
        ]"
      />

      <!-- FAQ Section para SEO -->
      <div class="space-y-4">
        <h2>Perguntas Frequentes sobre FIIs</h2>
        <div class="space-y-4">
          <details class="group rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Qual o melhor FII para iniciantes?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Para iniciantes, Fundos de Fundos (FOFs) como KNCR11 e RBRF11 são ideais, pois oferecem diversificação automática. Galpões logísticos também são boas opções pela previsibilidade.
            </p>
          </details>

          <details class="group rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <summary class="cursor-pointer list-none flex items-center justify-between">
              FIIs pagam dividendos todo mês?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Sim, por lei os FIIs devem distribuir no mínimo 95% dos lucros semestralmente. Na prática, a maioria paga mensalmente. Os valores caem automaticamente na sua conta da corretora.
            </p>
          </details>

          <details class="group rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Quanto rende R$ 1.000 em FIIs por mês?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Com dividend yield médio de 0,8% ao mês, R$ 1.000 renderia aproximadamente R$ 8 mensais. Para viver de renda de R$ 3.000/mês, seria necessário investir cerca de R$ 375.000 em FIIs.
            </p>
          </details>

          <details class="group rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <summary class="cursor-pointer list-none flex items-center justify-between">
              FIIs são melhores que ações?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Não existe "melhor", são complementares. FIIs são ideais para renda passiva mensal, enquanto ações têm maior potencial de valorização. O ideal é ter ambos na carteira.
            </p>
          </details>

          <details class="group rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Posso perder dinheiro com FIIs?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Sim. As cotas podem se desvalorizar e os dividendos podem cair se aumentar a vacância ou inadimplência. Por isso é fundamental diversificar e investir em FIIs de qualidade.
            </p>
          </details>
        </div>
      </div>

      <!-- Navegação para Outros Guias -->
      <div class="border-t pt-8" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">
        <h3 class="mb-4">Continue Aprendendo</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink
            to="/guias/calculadora-de-dividendos"
            class="group flex items-center gap-3 rounded-xl border p-4 transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:border-secondary/30"
            :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"
          >
            <UIcon name="i-lucide-coins" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Calculadora de Dividendos</h4>
              <p class="text-xs">Calcule sua renda passiva</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>

          <NuxtLink
            to="/guias/small-caps-guia-completo"
            class="group flex items-center gap-3 rounded-xl border p-4 transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:border-secondary/30"
            :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"
          >
            <UIcon name="i-lucide-rocket" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Small Caps: Guia Completo</h4>
              <p class="text-xs">Ações de pequenas empresas</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>
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
    `Melhores FIIs para Investir em 2026: Guia Completo | ${brand.name}`,
  description:
    'Descubra os fundos imobiliários mais promissores de 2026. Análise de segmentos, indicadores, estratégias e carteiras recomendadas para iniciantes e avançados.',
  path: '/guias/melhores-fiis-para-investir-em-2026',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Melhores FIIs para Investir em 2026',
      description:
        'Guia completo sobre os melhores fundos imobiliários para investir em 2026',
      author: {
        '@type': 'Organization',
        name: brand.name,
      },
      publisher: {
        '@type': 'Organization',
        name: brand.name,
        logo: {
          '@type': 'ImageObject',
          url: `${brand.url}/512x512.png`,
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
          name: 'Qual o melhor FII para iniciantes?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Para iniciantes, Fundos de Fundos (FOFs) como KNCR11 e RBRF11 são ideais, pois oferecem diversificação automática.',
          },
        },
        {
          '@type': 'Question',
          name: 'FIIs pagam dividendos todo mês?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim, por lei os FIIs devem distribuir no mínimo 95% dos lucros semestralmente. Na prática, a maioria paga mensalmente.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quanto rende R$ 1.000 em FIIs por mês?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Com dividend yield médio de 0,8% ao mês, R$ 1.000 renderia aproximadamente R$ 8 mensais.',
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
          name: 'Guias',
          item: `${brand.url}/guias`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Melhores FIIs 2026',
          item: `${brand.url}/guias/melhores-fiis-para-investir-em-2026`,
        },
      ],
    },
  ],
})
</script>

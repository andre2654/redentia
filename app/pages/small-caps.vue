<template>
  <NuxtLayout name="static" title="Small Caps">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-rocket" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">
            Small Caps: Ações de Empresas Pequenas
          </h1>
        </div>
        <p class="text-base text-gray-400 md:text-lg">
          Descubra empresas com alto potencial de crescimento. Small caps podem
          se tornar as gigantes do futuro. Aprenda estratégias e riscos dessa
          classe de ativos.
        </p>
      </div>

      <!-- Conteúdo Educacional -->
      <div class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold">O que são Small Caps?</h2>
        <p class="leading-relaxed text-gray-300">
          Small Caps são ações de empresas com baixo valor de mercado
          (capitalização). No Brasil, geralmente considera-se small caps
          empresas com valor de mercado abaixo de R$ 2-5 bilhões.
        </p>

        <h3 class="text-xl font-semibold">Classificação por Tamanho</h3>
        <div class="space-y-3">
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">
              Mega Caps (> R$ 100 bilhões)
            </h4>
            <p class="text-sm text-gray-400">
              Vale, Petrobras, Itaú - Gigantes consolidadas
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Large Caps (R$ 10-100 bi)</h4>
            <p class="text-sm text-gray-400">
              Weg, Localiza, Magazine Luiza - Grandes empresas
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Mid Caps (R$ 2-10 bi)</h4>
            <p class="text-sm text-gray-400">
              Empresas médias em crescimento
            </p>
          </div>
          <div
            class="rounded-xl border border-secondary/20 bg-secondary/10 p-4"
          >
            <h4 class="mb-1 font-semibold text-secondary">
              Small Caps (< R$ 2 bi)
            </h4>
            <p class="text-sm text-gray-300">
              Empresas pequenas com alto potencial de crescimento
            </p>
          </div>
        </div>

        <h3 class="text-xl font-semibold">
          Por que Investir em Small Caps?
        </h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <div class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-trending-up" class="text-primary h-5 w-5" />
              <h4 class="font-semibold">Alto Potencial de Crescimento</h4>
            </div>
            <p class="text-sm text-gray-300">
              Pequenas empresas podem crescer 50-100% ao ano. Uma small cap de
              sucesso pode multiplicar seu investimento por 5x ou 10x.
            </p>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <div class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-target" class="text-primary h-5 w-5" />
              <h4 class="font-semibold">Pouca Cobertura de Analistas</h4>
            </div>
            <p class="text-sm text-gray-300">
              Menos analistas acompanham = maior chance de encontrar empresas
              subavaliadas antes do mercado descobrir.
            </p>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <div class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-award" class="text-primary h-5 w-5" />
              <h4 class="font-semibold">Futuras Blue Chips</h4>
            </div>
            <p class="text-sm text-gray-300">
              Magazine Luiza, Localiza e Weg eram small caps. Investir cedo em
              vencedoras gera retornos extraordinários.
            </p>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <div class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-shield" class="text-primary h-5 w-5" />
              <h4 class="font-semibold">Menor Competição</h4>
            </div>
            <p class="text-sm text-gray-300">
              Grandes fundos não investem em small caps (baixa liquidez). Menos
              competição para o investidor pessoa física.
            </p>
          </div>
        </div>

        <h3 class="text-xl font-semibold">Riscos das Small Caps</h3>
        <div
          class="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5"
        >
          <ul class="list-disc space-y-2 pl-6 text-gray-300">
            <li>
              <strong>Alta volatilidade:</strong> Preços oscilam muito (30-50%
              em poucos meses)
            </li>
            <li>
              <strong>Baixa liquidez:</strong> Difícil vender grandes volumes
              rapidamente
            </li>
            <li>
              <strong>Risco de descontinuidade:</strong> Empresas pequenas podem
              quebrar
            </li>
            <li>
              <strong>Menos informações:</strong> Cobertura limitada de
              analistas e mídia
            </li>
            <li>
              <strong>Maior sensibilidade a crises:</strong> Sofrem mais em
              recessões
            </li>
          </ul>
          <p class="mt-4 font-semibold text-yellow-400">
            ⚠️ Small caps NÃO são para iniciantes. Exigem mais conhecimento e
            tolerância a risco.
          </p>
        </div>

        <h3 class="text-xl font-semibold">
          Estratégias para Investir em Small Caps
        </h3>
        <ol class="list-decimal space-y-3 pl-6 text-gray-300">
          <li>
            <strong>Nunca concentre:</strong> Small caps devem ser no máximo
            20-30% da carteira
          </li>
          <li>
            <strong>Diversifique bastante:</strong> Tenha pelo menos 10-15
            small caps diferentes
          </li>
          <li>
            <strong>Estude MUITO:</strong> Analise fundamentos, gestão,
            mercado, concorrência
          </li>
          <li>
            <strong>Pense em 5-10 anos:</strong> Crescimento leva tempo
          </li>
          <li>
            <strong>Aceite volatilidade:</strong> Quedas de 30-40% são normais.
            Não venda no pânico
          </li>
          <li>
            <strong>Use o índice SMLL:</strong> ETF SMAL11 dá exposição
            diversificada a small caps
          </li>
        </ol>

        <h3 class="text-xl font-semibold">Como Identificar Boas Small Caps</h3>
        <p class="leading-relaxed text-gray-300">
          Procure estas características:
        </p>
        <ul class="list-disc space-y-2 pl-6 text-gray-300">
          <li>
            <strong>Crescimento de receita:</strong> > 20% ao ano
            consistentemente
          </li>
          <li>
            <strong>ROE alto:</strong> > 15-20% (eficiência na geração de
            lucro)
          </li>
          <li>
            <strong>Baixo endividamento:</strong> Dívida Líquida/EBITDA < 2x
          </li>
          <li>
            <strong>Margem em expansão:</strong> Margens aumentando =
            ganhando eficiência
          </li>
          <li>
            <strong>Mercado em crescimento:</strong> Empresa em setor com
            potencial
          </li>
          <li>
            <strong>Gestão competente:</strong> Fundadores/gestores com pele
            no jogo
          </li>
        </ul>

        <div
          class="my-6 rounded-2xl border border-secondary/20 bg-secondary/10 p-6"
        >
          <h3 class="mb-3 text-xl font-semibold text-secondary">
            Dica de Ouro
          </h3>
          <p class="text-gray-300">
            Use a ferramenta de busca da Redentia para filtrar empresas com
            valor de mercado < R$ 2 bilhões, ROE > 15%, crescimento de receita
            > 20% e baixo endividamento. Você encontrará as melhores candidatas.
          </p>
        </div>
      </div>

      <!-- CTA -->
      <MoleculesCtaSection
        title="Encontre Small Caps Promissoras"
        description="Use filtros avançados para descobrir empresas com potencial de crescimento"
        :buttons="[
          { label: 'Buscar Small Caps', to: '/search?mc_max=2000000000', icon: 'i-lucide-search', variant: 'primary' },
          { label: 'Saber Mais', to: '/glossario/small-caps', icon: 'i-lucide-book-open', variant: 'outline' },
        ]"
      />

      <!-- Link Destacado para Ver Todas -->
      <div class="border-t border-white/10 pt-8">
        <NuxtLink
          to="/search?mc_max=2000000000&group=stocks"
          class="group mx-auto flex max-w-2xl items-center justify-between rounded-2xl border border-secondary/30 bg-secondary/10 p-6 transition-all hover:border-secondary/50 hover:bg-secondary/20"
        >
          <div class="flex flex-col gap-1">
            <h3 class="text-xl font-bold group-hover:text-secondary transition-colors">
              Ver Todas as Small Caps
            </h3>
            <p class="text-sm text-gray-400">
              Filtre por valor de mercado, ROE, crescimento e encontre oportunidades
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
  title:
    'Small Caps: Como Investir em Ações de Empresas Pequenas | Redentia',
  description:
    'Descubra small caps com potencial de crescimento explosivo. Estratégias, riscos e como identificar as futuras blue chips do mercado brasileiro. Análise de +200 small caps.',
  path: '/small-caps',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Small Caps: Guia de Investimento em Empresas Pequenas',
      description:
        'Aprenda a investir em small caps, identifique empresas com potencial e entenda os riscos.',
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
          name: 'Small Caps',
          item: 'https://www.redentia.com.br/small-caps',
        },
      ],
    },
  ],
})
</script>

<template>
  <NuxtLayout name="static" title="Small Caps: Guia Completo">
    <section class="static-content flex flex-col gap-8 px-6 py-8">
      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-rocket" class="text-secondary h-8 w-8" />
          <h1 class="md:text-4xl">
            Small Caps: Guia Completo
          </h1>
        </div>
        <p class="text-base md:text-lg">
          Tudo sobre ações de pequenas empresas: o que são, como escolher, riscos envolvidos e estratégias para maximizar retornos investindo em small caps.
        </p>
      </div>

      <!-- Conteúdo Educacional -->
      <div class="flex flex-col gap-6 max-w-none">
        <h2>O que são Small Caps?</h2>
        <p class="leading-relaxed">
          Small Caps são ações de empresas com menor valor de mercado (capitalização de mercado). No Brasil, geralmente são consideradas small caps empresas com valor de mercado abaixo de R$ 2 bilhões.
        </p>

        <h3>Classificação por Tamanho</h3>
        <div class="space-y-3">
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-1">Large Caps (Grandes)</h4>
            <p class="text-sm">
              Valor de mercado > R$ 10 bilhões. Exemplos: PETR4, VALE3, ITUB4, B3SA3
            </p>
          </div>
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-1">Mid Caps (Médias)</h4>
            <p class="text-sm">
              Entre R$ 2 e R$ 10 bilhões. Exemplos: HAPV3, RADL3, RENT3
            </p>
          </div>
          <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-4">
            <h4 class="mb-1 text-secondary">Small Caps (Pequenas)</h4>
            <p class="text-sm">
              Abaixo de R$ 2 bilhões. Exemplos: GMAT3, EVEN3, SIMH3, TOTS3
            </p>
          </div>
        </div>

        <h2>Por que Investir em Small Caps?</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-2 text-secondary">
              Alto Potencial de Crescimento
            </h4>
            <p class="text-sm">
              Empresas pequenas têm mais espaço para crescer. Uma small cap que dobre de tamanho pode gerar retornos extraordinários.
            </p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-2 text-secondary">
              Menos Cobertura Analítica
            </h4>
            <p class="text-sm">
              Poucos analistas cobrem small caps, criando oportunidades para investidores que estudam.
            </p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-2 text-secondary">
              Diversificação
            </h4>
            <p class="text-sm">
              Acesso a setores e nichos não disponíveis nas large caps, como empresas regionais ou especializadas.
            </p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-2 text-secondary">
              Multiplos de Crescimento
            </h4>
            <p class="text-sm">
              Uma pequena empresa pode se tornar média ou grande, multiplicando o valor por 5x, 10x ou mais.
            </p>
          </div>
        </div>

        <h2>Riscos das Small Caps</h2>
        <div
          class="rounded-xl border p-5"
          :style="{ borderColor: 'color-mix(in srgb, ' + (brand.colors.warning || '#f59e0b') + ' 25%, transparent)', backgroundColor: 'color-mix(in srgb, ' + (brand.colors.warning || '#f59e0b') + ' 8%, transparent)' }"
        >
          <ul class="list-disc space-y-2 pl-6">
            <li>
              <strong>Maior Volatilidade:</strong> Oscilam muito mais que large caps, podendo cair 30-50% em crises
            </li>
            <li>
              <strong>Baixa Liquidez:</strong> Difícil vender grandes quantidades rapidamente sem afetar o preço
            </li>
            <li>
              <strong>Risco de Falência:</strong> Empresas pequenas têm mais risco de quebrar em crises econômicas
            </li>
            <li>
              <strong>Menos Informações:</strong> Menos relatórios, conferências e análises disponíveis
            </li>
            <li>
              <strong>Governança Fraca:</strong> Algumas têm estrutura de governança menos profissional
            </li>
            <li>
              <strong>Manipulação de Preço:</strong> Mais suscetíveis a esquemas de "pump and dump"
            </li>
          </ul>
          <p class="mt-3 text-sm" :style="{ color: brand.colors.warning || '#f59e0b' }">
            ⚠️ Importante: Small caps devem representar no máximo 10-20% de uma carteira conservadora ou 20-30% de uma carteira agressiva.
          </p>
        </div>

        <h2>Como Escolher Boas Small Caps</h2>

        <h3>1. Fundamentos Sólidos</h3>
        <p class="leading-relaxed">
          Priorize empresas com:
        </p>
        <ul class="list-disc space-y-2 pl-6">
          <li>
            <strong>Crescimento de Receita:</strong> Crescendo pelo menos 10% ao ano consistentemente
          </li>
          <li>
            <strong>Lucratividade:</strong> Empresas lucrativas (margem líquida > 5%) ou próximas de lucrar
          </li>
          <li>
            <strong>Baixo Endividamento:</strong> Dívida Líquida/EBITDA abaixo de 2x
          </li>
          <li>
            <strong>Geração de Caixa:</strong> Fluxo de caixa operacional positivo
          </li>
        </ul>

        <h3>2. Gestão Competente</h3>
        <p class="leading-relaxed">
          Em small caps, a qualidade da gestão é crucial:
        </p>
        <ul class="list-disc space-y-2 pl-6">
          <li>Pesquise o histórico dos executivos</li>
          <li>Verifique se os executivos possuem ações da empresa (skin in the game)</li>
          <li>Acompanhe apresentações de resultados e calls com investidores</li>
          <li>Analise a estratégia de crescimento apresentada</li>
        </ul>

        <h3>3. Setor em Crescimento</h3>
        <p class="leading-relaxed">
          Invista em empresas de setores com boas perspectivas:
        </p>
        <div class="space-y-3">
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-1">Tecnologia e SaaS</h4>
            <p class="text-sm">
              Software, tecnologia educacional, fintechs
            </p>
          </div>
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-1">Saúde e Farmacêutico</h4>
            <p class="text-sm">
              Clínicas, laboratórios, farmacêuticas
            </p>
          </div>
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-1">Agronegócio</h4>
            <p class="text-sm">
              Fertilizantes, sementes, máquinas agrícolas
            </p>
          </div>
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-1">Construção e Materiais</h4>
            <p class="text-sm">
              Construtoras regionais, materiais de construção
            </p>
          </div>
        </div>

        <h3>4. Valuation Atrativo</h3>
        <p class="leading-relaxed">
          Mesmo small caps precisam estar a preços razoáveis:
        </p>
        <ul class="list-disc space-y-2 pl-6">
          <li>
            <strong>P/L:</strong> Idealmente abaixo de 15x para empresas estabelecidas
          </li>
          <li>
            <strong>P/VP:</strong> Abaixo de 2x para empresas de crescimento, abaixo de 1x para value
          </li>
          <li>
            <strong>EV/EBITDA:</strong> Abaixo de 8-10x é considerado razoável
          </li>
        </ul>

        <h2>Estratégias para Investir em Small Caps</h2>

        <h3>1. Abordagem Buy and Hold</h3>
        <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-sm">
            Compre empresas de qualidade e mantenha por 3-5 anos. Deixe o crescimento acontecer naturalmente. Ideal para quem não quer acompanhar diariamente.
          </p>
        </div>

        <h3>2. Value Investing</h3>
        <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
          <p class="text-sm">
            Procure small caps subvalorizadas negociando abaixo do valor patrimonial ou com múltiplos muito baixos. Compre quando ninguém quer, venda quando todos querem.
          </p>
        </div>

        <h3>3. Growth Investing</h3>
        <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
          <p class="text-sm">
            Foque em empresas de alto crescimento, mesmo que os múltiplos sejam elevados. Aceita pagar mais por empresas que estão crescendo 30%, 50% ou 100% ao ano.
          </p>
        </div>

        <h3>4. Portfólio Diversificado de Small Caps</h3>
        <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
          <p class="text-sm">
            Monte um portfólio com 10-15 small caps de setores diferentes. Algumas vão falhar, mas as vencedoras compensam as perdedoras. Rebalanceie anualmente.
          </p>
        </div>

        <h2>Erros Comuns ao Investir em Small Caps</h2>
        <div class="space-y-3">
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h4 class="mb-1 text-red-400">1. Concentrar Demais</h4>
            <p class="text-sm">
              Colocar 50% da carteira em uma única small cap é receita para desastre
            </p>
          </div>
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h4 class="mb-1 text-red-400">2. Seguir Dicas de "Gurus"</h4>
            <p class="text-sm">
              Small caps são alvos de esquemas pump and dump. Sempre faça sua própria análise
            </p>
          </div>
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h4 class="mb-1 text-red-400">3. Ignorar Liquidez</h4>
            <p class="text-sm">
              Investir em ações com volume diário abaixo de R$ 100 mil pode dificultar vendas
            </p>
          </div>
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h4 class="mb-1 text-red-400">4. Não Ter Stop Loss Mental</h4>
            <p class="text-sm">
              Definir previamente em que ponto você sairá se a tese estiver errada evita perdas catastróficas
            </p>
          </div>
        </div>

        <h2>Onde Encontrar Small Caps</h2>
        <p class="leading-relaxed">
          Use ferramentas de screening para filtrar:
        </p>
        <ul class="list-disc space-y-2 pl-6">
          <li>Valor de mercado abaixo de R$ 2 bilhões</li>
          <li>ROE acima de 10%</li>
          <li>Crescimento de receita > 10% ao ano</li>
          <li>Dívida Líquida/EBITDA < 2x</li>
          <li>Volume diário médio > R$ 500 mil</li>
        </ul>

        <h2>Exemplos de Setores com Small Caps Promissoras</h2>
        <div class="space-y-3">
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-1">Varejo Regional</h4>
            <p class="text-sm">
              Redes locais de supermercados, farmácias ou vestuário com potencial de expansão
            </p>
          </div>
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-1">Educação</h4>
            <p class="text-sm">
              Escolas, universidades e plataformas de ensino digital
            </p>
          </div>
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-1">Utilities Regionais</h4>
            <p class="text-sm">
              Distribuidoras de energia, saneamento e gás de menor porte
            </p>
          </div>
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="mb-1">Industrial</h4>
            <p class="text-sm">
              Fabricantes de componentes, autopeças, químicos
            </p>
          </div>
        </div>

        <h2>Conclusão</h2>
        <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-6">
          <p class="mb-3 text-secondary">Small Caps: Alto Risco, Alto Retorno</p>
          <p class="leading-relaxed">
            Investir em small caps pode gerar <strong>retornos extraordinários</strong>, mas exige <strong>muito estudo, paciência e tolerância a volatilidade</strong>. Não são para todos os perfis.
          </p>
          <p class="mt-3 leading-relaxed">
            <strong>Adequado para:</strong> Investidores agressivos, com carteira já estabelecida em large caps, que podem dedicar tempo à pesquisa e aguentar oscilações de 30-50%.
          </p>
          <p class="mt-3 leading-relaxed">
            <strong>Não adequado para:</strong> Iniciantes, investidores conservadores ou quem precisa do dinheiro no curto/médio prazo.
          </p>
        </div>
      </div>

      <!-- CTA para Ferramentas -->
      <MoleculesCtaSection
        :title="`Encontre Small Caps na ${brand.name}`"
        description="Use nossos filtros para descobrir ações de pequenas empresas com potencial"
        :buttons="[
          { label: 'Ver Small Caps', to: '/small-caps', icon: 'i-lucide-rocket', variant: 'primary' },
          { label: 'Buscar Agora', to: '/search?mc_max=2000000000', icon: 'i-lucide-search', variant: 'outline' },
          { label: 'Todas as Ações', to: '/acoes', icon: 'i-lucide-trending-up', variant: 'ghost' },
        ]"
      />

      <!-- FAQ Section para SEO -->
      <div class="space-y-4">
        <h2>Perguntas Frequentes sobre Small Caps</h2>
        <div class="space-y-4">
          <details class="group rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <summary class="cursor-pointer list-none flex items-center justify-between">
              O que são small caps?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Small caps são ações de empresas com baixo valor de mercado, geralmente abaixo de R$ 2 bilhões no Brasil. São empresas menores com maior potencial de crescimento, mas também maior risco.
            </p>
          </details>

          <details class="group rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Quanto da carteira devo alocar em small caps?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Para carteiras conservadoras: máximo 10-20%. Para agressivas: até 30%. Nunca coloque todo seu dinheiro em small caps devido ao risco elevado.
            </p>
          </details>

          <details class="group rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Small caps rendem mais que large caps?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Historicamente sim, no longo prazo. Mas com muito mais volatilidade. Algumas small caps podem multiplicar 10x, mas outras podem ir a zero. A chave é diversificação.
            </p>
          </details>

          <details class="group rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Como identificar uma boa small cap?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Busque crescimento de receita consistente, lucratividade ou proximidade do lucro, baixo endividamento, gestão competente e setor em crescimento. Valuation atrativo também é importante.
            </p>
          </details>

          <details class="group rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Iniciantes devem investir em small caps?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Não é recomendado. Iniciantes devem começar com large caps mais estáveis para aprender. Small caps exigem experiência, capacidade de análise e tolerância a grandes oscilações.
            </p>
          </details>
        </div>
      </div>

      <!-- Navegação para Outros Guias -->
      <div class="border-t pt-8" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">
        <h3 class="mb-4">Continue Aprendendo</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink
            to="/guias/como-investir-em-acoes-para-iniciantes"
            class="group flex items-center gap-3 rounded-xl border p-4 transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:border-secondary/30"
            :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"
          >
            <UIcon name="i-lucide-trending-up" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Como Investir em Ações</h4>
              <p class="text-xs">Base para small caps</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>

          <NuxtLink
            to="/guias/analise-petr4-vale-a-pena-investir"
            class="group flex items-center gap-3 rounded-xl border p-4 transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:border-secondary/30"
            :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"
          >
            <UIcon name="i-lucide-chart-line" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Análise PETR4</h4>
              <p class="text-xs">Exemplo de large cap</p>
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
    `Small Caps: Guia Completo para Investir em Pequenas Empresas | ${brand.name}`,
  description:
    'Tudo sobre small caps: o que são, como escolher, riscos, estratégias e melhores setores. Guia completo para investir em ações de pequenas empresas com alto potencial.',
  path: '/guias/small-caps-guia-completo',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Small Caps: Guia Completo',
      description:
        'Guia completo sobre investimento em small caps - ações de pequenas empresas',
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
          name: 'O que são small caps?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Small caps são ações de empresas com baixo valor de mercado, geralmente abaixo de R$ 2 bilhões no Brasil.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quanto da carteira devo alocar em small caps?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Para carteiras conservadoras: máximo 10-20%. Para agressivas: até 30%.',
          },
        },
        {
          '@type': 'Question',
          name: 'Small caps rendem mais que large caps?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Historicamente sim, no longo prazo, mas com muito mais volatilidade e risco.',
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
          name: 'Small Caps',
          item: `${brand.url}/guias/small-caps-guia-completo`,
        },
      ],
    },
  ],
})
</script>

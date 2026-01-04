<template>
  <NuxtLayout name="static" title="Small Caps: Guia Completo">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-rocket" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">
            Small Caps: Guia Completo
          </h1>
        </div>
        <p class="text-base text-gray-400 md:text-lg">
          Tudo sobre ações de pequenas empresas: o que são, como escolher, riscos envolvidos e estratégias para maximizar retornos investindo em small caps.
        </p>
      </div>

      <!-- Conteúdo Educacional -->
      <div class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold">O que são Small Caps?</h2>
        <p class="leading-relaxed text-gray-300">
          Small Caps são ações de empresas com menor valor de mercado (capitalização de mercado). No Brasil, geralmente são consideradas small caps empresas com valor de mercado abaixo de R$ 2 bilhões.
        </p>

        <h3 class="text-xl font-semibold">Classificação por Tamanho</h3>
        <div class="space-y-3">
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Large Caps (Grandes)</h4>
            <p class="text-sm text-gray-400">
              Valor de mercado > R$ 10 bilhões. Exemplos: PETR4, VALE3, ITUB4, B3SA3
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Mid Caps (Médias)</h4>
            <p class="text-sm text-gray-400">
              Entre R$ 2 e R$ 10 bilhões. Exemplos: HAPV3, RADL3, RENT3
            </p>
          </div>
          <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-4">
            <h4 class="mb-1 font-semibold text-secondary">Small Caps (Pequenas)</h4>
            <p class="text-sm text-gray-300">
              Abaixo de R$ 2 bilhões. Exemplos: GMAT3, EVEN3, SIMH3, TOTS3
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Por que Investir em Small Caps?</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Alto Potencial de Crescimento
            </h4>
            <p class="text-sm text-gray-300">
              Empresas pequenas têm mais espaço para crescer. Uma small cap que dobre de tamanho pode gerar retornos extraordinários.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Menos Cobertura Analítica
            </h4>
            <p class="text-sm text-gray-300">
              Poucos analistas cobrem small caps, criando oportunidades para investidores que estudam.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Diversificação
            </h4>
            <p class="text-sm text-gray-300">
              Acesso a setores e nichos não disponíveis nas large caps, como empresas regionais ou especializadas.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Multiplos de Crescimento
            </h4>
            <p class="text-sm text-gray-300">
              Uma pequena empresa pode se tornar média ou grande, multiplicando o valor por 5x, 10x ou mais.
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Riscos das Small Caps</h2>
        <div
          class="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5"
        >
          <ul class="list-disc space-y-2 pl-6 text-gray-300">
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
          <p class="mt-3 text-sm font-semibold text-yellow-400">
            ⚠️ Importante: Small caps devem representar no máximo 10-20% de uma carteira conservadora ou 20-30% de uma carteira agressiva.
          </p>
        </div>

        <h2 class="text-2xl font-bold">Como Escolher Boas Small Caps</h2>

        <h3 class="text-xl font-semibold">1. Fundamentos Sólidos</h3>
        <p class="leading-relaxed text-gray-300">
          Priorize empresas com:
        </p>
        <ul class="list-disc space-y-2 pl-6 text-gray-300">
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

        <h3 class="text-xl font-semibold">2. Gestão Competente</h3>
        <p class="leading-relaxed text-gray-300">
          Em small caps, a qualidade da gestão é crucial:
        </p>
        <ul class="list-disc space-y-2 pl-6 text-gray-300">
          <li>Pesquise o histórico dos executivos</li>
          <li>Verifique se os executivos possuem ações da empresa (skin in the game)</li>
          <li>Acompanhe apresentações de resultados e calls com investidores</li>
          <li>Analise a estratégia de crescimento apresentada</li>
        </ul>

        <h3 class="text-xl font-semibold">3. Setor em Crescimento</h3>
        <p class="leading-relaxed text-gray-300">
          Invista em empresas de setores com boas perspectivas:
        </p>
        <div class="space-y-3">
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Tecnologia e SaaS</h4>
            <p class="text-sm text-gray-400">
              Software, tecnologia educacional, fintechs
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Saúde e Farmacêutico</h4>
            <p class="text-sm text-gray-400">
              Clínicas, laboratórios, farmacêuticas
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Agronegócio</h4>
            <p class="text-sm text-gray-400">
              Fertilizantes, sementes, máquinas agrícolas
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Construção e Materiais</h4>
            <p class="text-sm text-gray-400">
              Construtoras regionais, materiais de construção
            </p>
          </div>
        </div>

        <h3 class="text-xl font-semibold">4. Valuation Atrativo</h3>
        <p class="leading-relaxed text-gray-300">
          Mesmo small caps precisam estar a preços razoáveis:
        </p>
        <ul class="list-disc space-y-2 pl-6 text-gray-300">
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

        <h2 class="text-2xl font-bold">Estratégias para Investir em Small Caps</h2>

        <h3 class="text-xl font-semibold">1. Abordagem Buy and Hold</h3>
        <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-sm text-gray-300">
            Compre empresas de qualidade e mantenha por 3-5 anos. Deixe o crescimento acontecer naturalmente. Ideal para quem não quer acompanhar diariamente.
          </p>
        </div>

        <h3 class="text-xl font-semibold">2. Value Investing</h3>
        <div class="rounded-xl border border-white/10 bg-white/5 p-5">
          <p class="text-sm text-gray-300">
            Procure small caps subvalorizadas negociando abaixo do valor patrimonial ou com múltiplos muito baixos. Compre quando ninguém quer, venda quando todos querem.
          </p>
        </div>

        <h3 class="text-xl font-semibold">3. Growth Investing</h3>
        <div class="rounded-xl border border-white/10 bg-white/5 p-5">
          <p class="text-sm text-gray-300">
            Foque em empresas de alto crescimento, mesmo que os múltiplos sejam elevados. Aceita pagar mais por empresas que estão crescendo 30%, 50% ou 100% ao ano.
          </p>
        </div>

        <h3 class="text-xl font-semibold">4. Portfólio Diversificado de Small Caps</h3>
        <div class="rounded-xl border border-white/10 bg-white/5 p-5">
          <p class="text-sm text-gray-300">
            Monte um portfólio com 10-15 small caps de setores diferentes. Algumas vão falhar, mas as vencedoras compensam as perdedoras. Rebalanceie anualmente.
          </p>
        </div>

        <h2 class="text-2xl font-bold">Erros Comuns ao Investir em Small Caps</h2>
        <div class="space-y-3">
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h4 class="mb-1 font-semibold text-red-400">1. Concentrar Demais</h4>
            <p class="text-sm text-gray-300">
              Colocar 50% da carteira em uma única small cap é receita para desastre
            </p>
          </div>
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h4 class="mb-1 font-semibold text-red-400">2. Seguir Dicas de "Gurus"</h4>
            <p class="text-sm text-gray-300">
              Small caps são alvos de esquemas pump and dump. Sempre faça sua própria análise
            </p>
          </div>
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h4 class="mb-1 font-semibold text-red-400">3. Ignorar Liquidez</h4>
            <p class="text-sm text-gray-300">
              Investir em ações com volume diário abaixo de R$ 100 mil pode dificultar vendas
            </p>
          </div>
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <h4 class="mb-1 font-semibold text-red-400">4. Não Ter Stop Loss Mental</h4>
            <p class="text-sm text-gray-300">
              Definir previamente em que ponto você sairá se a tese estiver errada evita perdas catastróficas
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Onde Encontrar Small Caps</h2>
        <p class="leading-relaxed text-gray-300">
          Use ferramentas de screening para filtrar:
        </p>
        <ul class="list-disc space-y-2 pl-6 text-gray-300">
          <li>Valor de mercado abaixo de R$ 2 bilhões</li>
          <li>ROE acima de 10%</li>
          <li>Crescimento de receita > 10% ao ano</li>
          <li>Dívida Líquida/EBITDA < 2x</li>
          <li>Volume diário médio > R$ 500 mil</li>
        </ul>

        <h2 class="text-2xl font-bold">Exemplos de Setores com Small Caps Promissoras</h2>
        <div class="space-y-3">
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Varejo Regional</h4>
            <p class="text-sm text-gray-400">
              Redes locais de supermercados, farmácias ou vestuário com potencial de expansão
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Educação</h4>
            <p class="text-sm text-gray-400">
              Escolas, universidades e plataformas de ensino digital
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Utilities Regionais</h4>
            <p class="text-sm text-gray-400">
              Distribuidoras de energia, saneamento e gás de menor porte
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Industrial</h4>
            <p class="text-sm text-gray-400">
              Fabricantes de componentes, autopeças, químicos
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Conclusão</h2>
        <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-6">
          <p class="mb-3 font-semibold text-secondary">Small Caps: Alto Risco, Alto Retorno</p>
          <p class="leading-relaxed text-gray-300">
            Investir em small caps pode gerar <strong>retornos extraordinários</strong>, mas exige <strong>muito estudo, paciência e tolerância a volatilidade</strong>. Não são para todos os perfis.
          </p>
          <p class="mt-3 leading-relaxed text-gray-300">
            <strong>Adequado para:</strong> Investidores agressivos, com carteira já estabelecida em large caps, que podem dedicar tempo à pesquisa e aguentar oscilações de 30-50%.
          </p>
          <p class="mt-3 leading-relaxed text-gray-300">
            <strong>Não adequado para:</strong> Iniciantes, investidores conservadores ou quem precisa do dinheiro no curto/médio prazo.
          </p>
        </div>
      </div>

      <!-- CTA para Ferramentas -->
      <MoleculesCtaSection
        title="Encontre Small Caps na Redentia"
        description="Use nossos filtros para descobrir ações de pequenas empresas com potencial"
        :buttons="[
          { label: 'Ver Small Caps', to: '/small-caps', icon: 'i-lucide-rocket', variant: 'primary' },
          { label: 'Buscar Agora', to: '/search?mc_max=2000000000', icon: 'i-lucide-search', variant: 'outline' },
          { label: 'Todas as Ações', to: '/acoes', icon: 'i-lucide-trending-up', variant: 'ghost' },
        ]"
      />

      <!-- FAQ Section para SEO -->
      <div class="space-y-4">
        <h2 class="text-2xl font-bold">Perguntas Frequentes sobre Small Caps</h2>
        <div class="space-y-3">
          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              O que são small caps?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              Small caps são ações de empresas com baixo valor de mercado, geralmente abaixo de R$ 2 bilhões no Brasil. São empresas menores com maior potencial de crescimento, mas também maior risco.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              Quanto da carteira devo alocar em small caps?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              Para carteiras conservadoras: máximo 10-20%. Para agressivas: até 30%. Nunca coloque todo seu dinheiro em small caps devido ao risco elevado.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              Small caps rendem mais que large caps?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              Historicamente sim, no longo prazo. Mas com muito mais volatilidade. Algumas small caps podem multiplicar 10x, mas outras podem ir a zero. A chave é diversificação.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              Como identificar uma boa small cap?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              Busque crescimento de receita consistente, lucratividade ou proximidade do lucro, baixo endividamento, gestão competente e setor em crescimento. Valuation atrativo também é importante.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              Iniciantes devem investir em small caps?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              Não é recomendado. Iniciantes devem começar com large caps mais estáveis para aprender. Small caps exigem experiência, capacidade de análise e tolerância a grandes oscilações.
            </p>
          </details>
        </div>
      </div>

      <!-- Navegação para Outros Guias -->
      <div class="border-t border-white/10 pt-8">
        <h3 class="mb-4 text-xl font-semibold">Continue Aprendendo</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink
            to="/guias/como-investir-em-acoes-para-iniciantes"
            class="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-secondary/30"
          >
            <UIcon name="i-lucide-trending-up" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="font-semibold group-hover:text-secondary">Como Investir em Ações</h4>
              <p class="text-xs text-gray-400">Base para small caps</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>

          <NuxtLink
            to="/guias/analise-petr4-vale-a-pena-investir"
            class="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-secondary/30"
          >
            <UIcon name="i-lucide-chart-line" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="font-semibold group-hover:text-secondary">Análise PETR4</h4>
              <p class="text-xs text-gray-400">Exemplo de large cap</p>
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
    'Small Caps: Guia Completo para Investir em Pequenas Empresas | Redentia',
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
          name: 'Small Caps',
          item: 'https://www.redentia.com.br/guias/small-caps-guia-completo',
        },
      ],
    },
  ],
})
</script>

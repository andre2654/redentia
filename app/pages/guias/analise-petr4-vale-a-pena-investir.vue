<template>
  <NuxtLayout name="static" title="Análise PETR4">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-chart-line" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">
            Análise PETR4: Vale a Pena Investir?
          </h1>
        </div>
        <div class="flex items-center gap-2">
          <AtomsTickerEmbed ticker="PETR4" size="lg" />
          <span class="text-sm text-gray-400">Dados em tempo real</span>
        </div>
        <p class="text-base text-gray-400 md:text-lg">
          Análise completa das ações da Petrobras. Fundamentos, riscos, oportunidades e perspectivas para 2026. Tudo que você precisa saber antes de investir.
        </p>
      </div>

      <!-- Conteúdo Educacional -->
      <div class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold">Sobre a Petrobras</h2>
        <p class="leading-relaxed text-gray-300">
          A Petrobras (Petróleo Brasileiro S.A.) é uma das maiores empresas de energia do mundo e a maior empresa do Brasil. Atua principalmente na exploração, produção, refino e comercialização de petróleo e gás natural, sendo líder em exploração em águas profundas.
        </p>

        <h3 class="text-xl font-semibold">Dados da Empresa</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Ticker
            </h4>
            <p class="text-sm text-gray-300">
              PETR3 (ON) e PETR4 (PN) - PETR4 é mais líquida
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Setor
            </h4>
            <p class="text-sm text-gray-300">
              Petróleo, Gás e Combustíveis
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Listagem
            </h4>
            <p class="text-sm text-gray-300">
              B3, NYSE (PBR)
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Controle
            </h4>
            <p class="text-sm text-gray-300">
              Empresa de economia mista, controlada pelo Governo Federal
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Análise Fundamentalista</h2>

        <h3 class="text-xl font-semibold">Pontos Fortes</h3>
        <div class="space-y-3">
          <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-5">
            <h4 class="mb-2 font-semibold text-secondary">
              Líder em Exploração em Águas Profundas
            </h4>
            <p class="text-sm text-gray-300">
              A Petrobras é referência mundial em tecnologia de exploração no pré-sal, com custos de produção competitivos e reservas de alta qualidade.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold">Geração de Caixa Robusto</h4>
            <p class="text-sm text-gray-300">
              Alta capacidade de geração de caixa operacional, permitindo distribuição generosa de dividendos e redução de dívida.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold">Dividendos Atrativos</h4>
            <p class="text-sm text-gray-300">
              Historicamente paga dividendos elevados, com Dividend Yield frequentemente acima de 10% ao ano em períodos de petróleo alto.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold">Redução de Dívida</h4>
            <p class="text-sm text-gray-300">
              Vem reduzindo consistentemente sua dívida líquida nos últimos anos, melhorando a saúde financeira.
            </p>
          </div>
        </div>

        <h3 class="text-xl font-semibold">Pontos de Atenção</h3>
        <div
          class="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5"
        >
          <ul class="list-disc space-y-2 pl-6 text-gray-300">
            <li>
              <strong>Interferência Política:</strong> Como estatal, sofre influência do governo em decisões estratégicas, principalmente em preços de combustíveis
            </li>
            <li>
              <strong>Volatilidade do Petróleo:</strong> Resultados fortemente dependentes do preço internacional do barril de petróleo
            </li>
            <li>
              <strong>Riscos Regulatórios:</strong> Sujeita a mudanças em políticas de conteúdo local e regulações ambientais
            </li>
            <li>
              <strong>Exposição Cambial:</strong> Receitas em dólar, mas parte dos custos em real - sensível ao câmbio
            </li>
            <li>
              <strong>Transição Energética:</strong> Incerteza sobre demanda de longo prazo por combustíveis fósseis
            </li>
          </ul>
        </div>

        <h2 class="text-2xl font-bold">Indicadores Fundamentalistas (Referência)</h2>
        <p class="text-sm text-gray-400">
          <em>Nota: Os valores abaixo são ilustrativos. Consulte dados atualizados na Redentia.</em>
        </p>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">P/L (Preço/Lucro)</h4>
            <p class="text-sm text-gray-400">
              Geralmente entre 3-6, considerado baixo (barato)
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Dividend Yield</h4>
            <p class="text-sm text-gray-400">
              Varia com o petróleo, pode superar 15% em anos bons
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">ROE</h4>
            <p class="text-sm text-gray-400">
              Retorno sobre patrimônio geralmente acima de 20%
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Dívida Líquida/EBITDA</h4>
            <p class="text-sm text-gray-400">
              Tem melhorado, buscando níveis abaixo de 1,5x
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Perspectivas para 2026</h2>

        <h3 class="text-xl font-semibold">Cenário Positivo</h3>
        <div class="space-y-3">
          <div class="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
            <ul class="list-disc space-y-1 pl-6 text-sm text-gray-300">
              <li>Preço do petróleo mantém-se em patamares elevados (US$ 80-90/barril)</li>
              <li>Produção do pré-sal continua crescendo</li>
              <li>Governo mantém política de preços de paridade internacional (PPI)</li>
              <li>Dividendos extraordinários continuam sendo pagos</li>
              <li>Real valorizado aumenta poder de compra dos dividendos em dólar</li>
            </ul>
          </div>
        </div>

        <h3 class="text-xl font-semibold">Cenário Negativo</h3>
        <div class="space-y-3">
          <div class="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <ul class="list-disc space-y-1 pl-6 text-sm text-gray-300">
              <li>Queda acentuada no preço do petróleo (< US$ 60/barril)</li>
              <li>Intervenção do governo em preços de combustíveis</li>
              <li>Mudanças na política de dividendos por decisão política</li>
              <li>Aumento de custos operacionais ou acidentes</li>
              <li>Aceleração da transição energética reduz demanda por petróleo</li>
            </ul>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Para Quem PETR4 é Indicada?</h2>

        <h3 class="text-xl font-semibold">Perfil Ideal</h3>
        <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-5">
          <ul class="list-disc space-y-2 pl-6 text-gray-300">
            <li>Investidores que buscam <strong>dividendos elevados</strong></li>
            <li>Quem tem <strong>tolerância à volatilidade</strong> de curto prazo</li>
            <li>Investidores que acreditam no <strong>petróleo de longo prazo</strong></li>
            <li>Quem quer <strong>exposição ao dólar</strong> (receitas em USD)</li>
            <li>Perfil <strong>moderado a agressivo</strong></li>
          </ul>
        </div>

        <h3 class="text-xl font-semibold">Não é Ideal Para</h3>
        <div class="rounded-xl border border-white/10 bg-white/5 p-5">
          <ul class="list-disc space-y-2 pl-6 text-gray-300">
            <li>Investidores <strong>conservadores</strong> que não toleram riscos políticos</li>
            <li>Quem busca <strong>previsibilidade total</strong> nos dividendos</li>
            <li>Investidores contrários a <strong>combustíveis fósseis</strong> (ESG)</li>
            <li>Quem não aceita <strong>alta volatilidade</strong></li>
          </ul>
        </div>

        <h2 class="text-2xl font-bold">Estratégias de Investimento</h2>

        <h3 class="text-xl font-semibold">1. Buy and Hold com Dividendos</h3>
        <p class="leading-relaxed text-gray-300">
          Comprar PETR4 e manter no longo prazo, reinvestindo ou aproveitando os dividendos. Adequado para quem acredita no setor e aceita os riscos políticos.
        </p>

        <h3 class="text-xl font-semibold">2. Trading de Ciclos</h3>
        <p class="leading-relaxed text-gray-300">
          Comprar quando o petróleo está baixo e vender quando alto. Requer acompanhamento constante do mercado de commodities e timing.
        </p>

        <h3 class="text-xl font-semibold">3. Participação Moderada na Carteira</h3>
        <p class="leading-relaxed text-gray-300">
          Manter PETR4 como 5-15% da carteira total. Aproveita dividendos sem concentrar muito risco em uma única ação e setor.
        </p>

        <h2 class="text-2xl font-bold">Comparação com Pares</h2>
        <div class="space-y-3">
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-2 font-semibold">Setor de Petróleo no Brasil</h4>
            <div class="mb-2 flex flex-wrap gap-2">
              <AtomsTickerEmbed ticker="PETR4" size="sm" />
              <AtomsTickerEmbed ticker="PETR3" size="sm" />
              <AtomsTickerEmbed ticker="PRIO3" size="sm" />
            </div>
            <p class="text-sm text-gray-400">
              PETR4 tem maior escala e liquidez. PRIO3 é privada e mais ágil, mas menor. PETR3 tem direito a voto.
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Comparação Internacional</h4>
            <p class="text-sm text-gray-400">
              Exxon, Chevron têm menos risco político mas dividendos menores. PETR4 oferece mais retorno com mais risco.
            </p>
          </div>
        </div>

        <h2 class="text-2xl font-bold">Conclusão: Vale a Pena Investir?</h2>
        <div class="rounded-xl border border-secondary/20 bg-secondary/10 p-6">
          <p class="mb-3 font-semibold text-secondary">Veredito: DEPENDE DO SEU PERFIL</p>
          <p class="leading-relaxed text-gray-300">
            PETR4 é uma ação com <strong>alto potencial de dividendos</strong> e <strong>fundamentos sólidos</strong> em termos operacionais. No entanto, carrega <strong>riscos políticos significativos</strong> e <strong>volatilidade</strong> relacionada ao preço do petróleo.
          </p>
          <p class="mt-3 leading-relaxed text-gray-300">
            <strong>É adequada para:</strong> Carteiras diversificadas onde representa uma parcela moderada (5-15%), para investidores que aceitam volatilidade em troca de dividendos elevados.
          </p>
          <p class="mt-3 leading-relaxed text-gray-300">
            <strong>Não é adequada para:</strong> Investidores conservadores ou como posição única/majoritária na carteira.
          </p>
        </div>
      </div>

      <!-- CTA para Ferramentas -->
      <MoleculesCtaSection
        title="Analise PETR4 na Redentia"
        description="Acompanhe cotação em tempo real, indicadores atualizados e histórico de dividendos"
        :buttons="[
          { label: 'Ver PETR4 Agora', to: '/asset/petr4', icon: 'i-lucide-chart-line', variant: 'primary' },
          { label: 'Outras Ações', to: '/acoes', icon: 'i-lucide-trending-up', variant: 'outline' },
          { label: 'Dividendos', to: '/dividendos', icon: 'i-lucide-coins', variant: 'ghost' },
        ]"
      />

      <!-- FAQ Section para SEO -->
      <div class="space-y-4">
        <h2 class="text-2xl font-bold">Perguntas Frequentes sobre PETR4</h2>
        <div class="space-y-3">
          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              PETR4 paga bons dividendos?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              Sim, PETR4 é conhecida por pagar dividendos elevados. Em anos de petróleo alto, o Dividend Yield pode superar 15% ao ano. Porém, os valores variam conforme o preço do petróleo e decisões políticas.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              Qual a diferença entre PETR3 e PETR4?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              PETR3 são ações ordinárias (ON) com direito a voto. PETR4 são preferenciais (PN), sem voto mas com preferência em dividendos. PETR4 é mais líquida e preferida por pequenos investidores.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              PETR4 é um bom investimento para longo prazo?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              Pode ser, desde que você aceite a volatilidade e os riscos políticos. A empresa tem fundamentos operacionais sólidos e gera muito caixa. Ideal como parte (5-15%) de uma carteira diversificada.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              O governo pode mudar a política de dividendos da Petrobras?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              Sim, como empresa de economia mista controlada pelo governo, mudanças na administração ou prioridades políticas podem impactar a distribuição de dividendos. Este é um dos principais riscos.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              Quanto da minha carteira devo alocar em PETR4?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              Recomenda-se não concentrar mais de 10-15% da carteira total em uma única ação. Para PETR4, considerando os riscos específicos, 5-10% é uma alocação razoável para a maioria dos investidores.
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
              <p class="text-xs text-gray-400">Guia para iniciantes</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>

          <NuxtLink
            to="/guias/calculadora-de-dividendos"
            class="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-secondary/30"
          >
            <UIcon name="i-lucide-coins" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="font-semibold group-hover:text-secondary">Calculadora de Dividendos</h4>
              <p class="text-xs text-gray-400">Calcule sua renda passiva</p>
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
    'Análise PETR4: Vale a Pena Investir em 2026? | Redentia',
  description:
    'Análise completa de PETR4 (Petrobras). Fundamentos, indicadores, riscos políticos, perspectivas para 2026, dividendos e estratégias de investimento. Guia definitivo.',
  path: '/guias/analise-petr4-vale-a-pena-investir',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Análise PETR4: Vale a Pena Investir?',
      description:
        'Análise fundamentalista completa das ações da Petrobras (PETR4)',
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
          name: 'PETR4 paga bons dividendos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim, PETR4 é conhecida por pagar dividendos elevados. Em anos de petróleo alto, o Dividend Yield pode superar 15% ao ano.',
          },
        },
        {
          '@type': 'Question',
          name: 'Qual a diferença entre PETR3 e PETR4?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'PETR3 são ações ordinárias com direito a voto. PETR4 são preferenciais, sem voto mas com preferência em dividendos.',
          },
        },
        {
          '@type': 'Question',
          name: 'PETR4 é um bom investimento para longo prazo?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Pode ser, desde que você aceite volatilidade e riscos políticos. Ideal como 5-15% de uma carteira diversificada.',
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
          name: 'Análise PETR4',
          item: 'https://www.redentia.com.br/guias/analise-petr4-vale-a-pena-investir',
        },
      ],
    },
  ],
})
</script>

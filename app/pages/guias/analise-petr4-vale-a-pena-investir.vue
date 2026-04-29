<template>
  <NuxtLayout name="static" title="Análise PETR4">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-chart-line" class="text-secondary h-8 w-8" />
          <h1 :style="{ color: brand.colors.text }">
            Análise PETR4: Vale a Pena Investir?
          </h1>
        </div>
        <div class="flex items-center gap-2">
          <AtomsTickerEmbed ticker="PETR4" size="lg" />
          <span class="text-sm" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">Dados em tempo real</span>
        </div>
        <p class="text-base md:text-lg">
          Análise completa das ações da Petrobras. Fundamentos, riscos, oportunidades e perspectivas para 2026. Tudo que você precisa saber antes de investir.
        </p>
      </div>

      <!-- Conteúdo Educacional -->
      <div class="flex flex-col gap-6">
        <h2>Sobre a Petrobras</h2>
        <p>
          A Petrobras (Petróleo Brasileiro S.A.) é uma das maiores empresas de energia do mundo e a maior empresa do Brasil. Atua principalmente na exploração, produção, refino e comercialização de petróleo e gás natural, sendo líder em exploração em águas profundas.
        </p>

        <h3>Dados da Empresa</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="text-secondary">Ticker</h4>
            <p class="text-sm">
              PETR3 (ON) e PETR4 (PN) - PETR4 é mais líquida
            </p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="text-secondary">Setor</h4>
            <p class="text-sm">Petróleo, Gás e Combustíveis</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="text-secondary">Listagem</h4>
            <p class="text-sm">B3, NYSE (PBR)</p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4 class="text-secondary">Controle</h4>
            <p class="text-sm">Empresa de economia mista, controlada pelo Governo Federal</p>
          </div>
        </div>

        <h2>Análise Fundamentalista</h2>

        <h3>Pontos Fortes</h3>
        <div class="space-y-3">
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.primary + ' 25%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.primary + ' 8%, transparent)' }">
            <h4 class="text-secondary">Líder em Exploração em Águas Profundas</h4>
            <p class="text-sm">
              A Petrobras é referência mundial em tecnologia de exploração no pré-sal, com custos de produção competitivos e reservas de alta qualidade.
            </p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4>Geração de Caixa Robusto</h4>
            <p class="text-sm">
              Alta capacidade de geração de caixa operacional, permitindo distribuição generosa de dividendos e redução de dívida.
            </p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4>Dividendos Atrativos</h4>
            <p class="text-sm">
              Historicamente paga dividendos elevados, com Dividend Yield frequentemente acima de 10% ao ano em períodos de petróleo alto.
            </p>
          </div>
          <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4>Redução de Dívida</h4>
            <p class="text-sm">
              Vem reduzindo consistentemente sua dívida líquida nos últimos anos, melhorando a saúde financeira.
            </p>
          </div>
        </div>

        <h3>Pontos de Atenção</h3>
        <div
          class="rounded-xl border p-5"
          :style="{ borderColor: 'color-mix(in srgb, ' + (brand.colors.warning || '#f59e0b') + ' 25%, transparent)', backgroundColor: 'color-mix(in srgb, ' + (brand.colors.warning || '#f59e0b') + ' 8%, transparent)' }"
        >
          <ul>
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

        <h2>Indicadores Fundamentalistas (Referência)</h2>
        <p class="text-sm" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">
          <em>Nota: Os valores abaixo são ilustrativos. Consulte dados atualizados na {{ brand.name }}.</em>
        </p>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4>P/L (Preço/Lucro)</h4>
            <p class="text-sm" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">
              Geralmente entre 3-6, considerado baixo (barato)
            </p>
          </div>
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4>Dividend Yield</h4>
            <p class="text-sm" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">
              Varia com o petróleo, pode superar 15% em anos bons
            </p>
          </div>
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4>ROE</h4>
            <p class="text-sm" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">
              Retorno sobre patrimônio geralmente acima de 20%
            </p>
          </div>
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4>Dívida Líquida/EBITDA</h4>
            <p class="text-sm" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">
              Tem melhorado, buscando níveis abaixo de 1,5x
            </p>
          </div>
        </div>

        <h2>Perspectivas para 2026</h2>

        <h3>Cenário Positivo</h3>
        <div class="space-y-3">
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + (brand.colors.success || '#10b981') + ' 25%, transparent)', backgroundColor: 'color-mix(in srgb, ' + (brand.colors.success || '#10b981') + ' 8%, transparent)' }">
            <ul class="text-sm">
              <li>Preço do petróleo mantém-se em patamares elevados (US$ 80-90/barril)</li>
              <li>Produção do pré-sal continua crescendo</li>
              <li>Governo mantém política de preços de paridade internacional (PPI)</li>
              <li>Dividendos extraordinários continuam sendo pagos</li>
              <li>Real valorizado aumenta poder de compra dos dividendos em dólar</li>
            </ul>
          </div>
        </div>

        <h3>Cenário Negativo</h3>
        <div class="space-y-3">
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + (brand.colors.danger || '#ef4444') + ' 25%, transparent)', backgroundColor: 'color-mix(in srgb, ' + (brand.colors.danger || '#ef4444') + ' 8%, transparent)' }">
            <ul class="text-sm">
              <li>Queda acentuada no preço do petróleo (< US$ 60/barril)</li>
              <li>Intervenção do governo em preços de combustíveis</li>
              <li>Mudanças na política de dividendos por decisão política</li>
              <li>Aumento de custos operacionais ou acidentes</li>
              <li>Aceleração da transição energética reduz demanda por petróleo</li>
            </ul>
          </div>
        </div>

        <h2>Para Quem PETR4 é Indicada?</h2>

        <h3>Perfil Ideal</h3>
        <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.primary + ' 25%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.primary + ' 8%, transparent)' }">
          <ul>
            <li>Investidores que buscam <strong>dividendos elevados</strong></li>
            <li>Quem tem <strong>tolerância à volatilidade</strong> de curto prazo</li>
            <li>Investidores que acreditam no <strong>petróleo de longo prazo</strong></li>
            <li>Quem quer <strong>exposição ao dólar</strong> (receitas em USD)</li>
            <li>Perfil <strong>moderado a agressivo</strong></li>
          </ul>
        </div>

        <h3>Não é Ideal Para</h3>
        <div class="rounded-xl border p-5" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
          <ul>
            <li>Investidores <strong>conservadores</strong> que não toleram riscos políticos</li>
            <li>Quem busca <strong>previsibilidade total</strong> nos dividendos</li>
            <li>Investidores contrários a <strong>combustíveis fósseis</strong> (ESG)</li>
            <li>Quem não aceita <strong>alta volatilidade</strong></li>
          </ul>
        </div>

        <h2>Estratégias de Investimento</h2>

        <h3>1. Buy and Hold com Dividendos</h3>
        <p>
          Comprar PETR4 e manter no longo prazo, reinvestindo ou aproveitando os dividendos. Adequado para quem acredita no setor e aceita os riscos políticos.
        </p>

        <h3>2. Trading de Ciclos</h3>
        <p>
          Comprar quando o petróleo está baixo e vender quando alto. Requer acompanhamento constante do mercado de commodities e timing.
        </p>

        <h3>3. Participação Moderada na Carteira</h3>
        <p>
          Manter PETR4 como 5-15% da carteira total. Aproveita dividendos sem concentrar muito risco em uma única ação e setor.
        </p>

        <h2>Comparação com Pares</h2>
        <div class="space-y-3">
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4>Setor de Petróleo no Brasil</h4>
            <div class="mb-2 flex flex-wrap gap-2">
              <AtomsTickerEmbed ticker="PETR4" size="sm" />
              <AtomsTickerEmbed ticker="PETR3" size="sm" />
              <AtomsTickerEmbed ticker="PRIO3" size="sm" />
            </div>
            <p class="text-sm" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">
              PETR4 tem maior escala e liquidez. PRIO3 é privada e mais ágil, mas menor. PETR3 tem direito a voto.
            </p>
          </div>
          <div class="rounded-xl border p-4" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <h4>Comparação Internacional</h4>
            <p class="text-sm" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">
              Exxon, Chevron têm menos risco político mas dividendos menores. PETR4 oferece mais retorno com mais risco.
            </p>
          </div>
        </div>

        <h2>Conclusão: Vale a Pena Investir?</h2>
        <div class="rounded-xl border p-6" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.primary + ' 25%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.primary + ' 8%, transparent)' }">
          <p class="mb-3" :style="{ color: brand.colors.primary }"><strong>Veredito: DEPENDE DO SEU PERFIL</strong></p>
          <p>
            PETR4 é uma ação com <strong>alto potencial de dividendos</strong> e <strong>fundamentos sólidos</strong> em termos operacionais. No entanto, carrega <strong>riscos políticos significativos</strong> e <strong>volatilidade</strong> relacionada ao preço do petróleo.
          </p>
          <p class="mt-3">
            <strong>É adequada para:</strong> Carteiras diversificadas onde representa uma parcela moderada (5-15%), para investidores que aceitam volatilidade em troca de dividendos elevados.
          </p>
          <p class="mt-3">
            <strong>Não é adequada para:</strong> Investidores conservadores ou como posição única/majoritária na carteira.
          </p>
        </div>
      </div>

      <!-- CTA para Ferramentas -->
      <MoleculesCtaSection
        :title="`Analise PETR4 na ${brand.name}`"
        description="Acompanhe cotação em tempo real, indicadores atualizados e histórico de dividendos"
        :buttons="[
          { label: 'Ver PETR4 Agora', to: '/asset/petr4', icon: 'i-lucide-chart-line', variant: 'primary' },
          { label: 'Outras Ações', to: '/acoes', icon: 'i-lucide-trending-up', variant: 'outline' },
          { label: 'Dividendos', to: '/dividendos', icon: 'i-lucide-coins', variant: 'ghost' },
        ]"
      />

      <!-- FAQ Section para SEO -->
      <div class="space-y-4">
        <h2>Perguntas Frequentes sobre PETR4</h2>
        <div class="space-y-4">
          <details class="group rounded-xl border p-4 normal-static-link" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <summary class="cursor-pointer list-none flex items-center justify-between" :style="{ color: brand.colors.text }">
              PETR4 paga bons dividendos?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Sim, PETR4 é conhecida por pagar dividendos elevados. Em anos de petróleo alto, o Dividend Yield pode superar 15% ao ano. Porém, os valores variam conforme o preço do petróleo e decisões políticas.
            </p>
          </details>

          <details class="group rounded-xl border p-4 normal-static-link" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <summary class="cursor-pointer list-none flex items-center justify-between" :style="{ color: brand.colors.text }">
              Qual a diferença entre PETR3 e PETR4?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              PETR3 são ações ordinárias (ON) com direito a voto. PETR4 são preferenciais (PN), sem voto mas com preferência em dividendos. PETR4 é mais líquida e preferida por pequenos investidores.
            </p>
          </details>

          <details class="group rounded-xl border p-4 normal-static-link" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <summary class="cursor-pointer list-none flex items-center justify-between" :style="{ color: brand.colors.text }">
              PETR4 é um bom investimento para longo prazo?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Pode ser, desde que você aceite a volatilidade e os riscos políticos. A empresa tem fundamentos operacionais sólidos e gera muito caixa. Ideal como parte (5-15%) de uma carteira diversificada.
            </p>
          </details>

          <details class="group rounded-xl border p-4 normal-static-link" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <summary class="cursor-pointer list-none flex items-center justify-between" :style="{ color: brand.colors.text }">
              O governo pode mudar a política de dividendos da Petrobras?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Sim, como empresa de economia mista controlada pelo governo, mudanças na administração ou prioridades políticas podem impactar a distribuição de dividendos. Este é um dos principais riscos.
            </p>
          </details>

          <details class="group rounded-xl border p-4 normal-static-link" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }">
            <summary class="cursor-pointer list-none flex items-center justify-between" :style="{ color: brand.colors.text }">
              Quanto da minha carteira devo alocar em PETR4?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Recomenda-se não concentrar mais de 10-15% da carteira total em uma única ação. Para PETR4, considerando os riscos específicos, 5-10% é uma alocação razoável para a maioria dos investidores.
            </p>
          </details>
        </div>
      </div>

      <!-- Navegação para Outros Guias -->
      <div class="border-t pt-8" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">
        <h3>Continue Aprendendo</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink
            to="/guias/como-investir-em-acoes-para-iniciantes"
            class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:border-secondary/30"
            :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"
          >
            <UIcon name="i-lucide-trending-up" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Como Investir em Ações</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">Guia para iniciantes</p>
            </div>
            <UIcon name="i-lucide-arrow-right" class="h-5 w-5" />
          </NuxtLink>

          <NuxtLink
            to="/guias/calculadora-de-dividendos"
            class="normal-static-link group flex items-center gap-3 rounded-xl border p-4 transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:border-secondary/30"
            :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)', backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"
          >
            <UIcon name="i-lucide-coins" class="text-secondary h-6 w-6" />
            <div class="flex-1">
              <h4 class="group-hover:text-secondary">Calculadora de Dividendos</h4>
              <p class="text-xs" :style="{ color: 'color-mix(in srgb, ' + brand.colors.text + ' 60%, transparent)' }">Calcule sua renda passiva</p>
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
    `Análise PETR4: Vale a Pena Investir em 2026? | ${brand.name}`,
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
          name: 'Análise PETR4',
          item: `${brand.url}/guias/analise-petr4-vale-a-pena-investir`,
        },
      ],
    },
  ],
})
</script>

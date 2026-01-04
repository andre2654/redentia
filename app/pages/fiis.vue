<template>
  <NuxtLayout name="static" title="Fundos Imobiliários">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-building-2" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">
            Fundos Imobiliários (FIIs)
          </h1>
        </div>
        <p class="text-base text-gray-400 md:text-lg">
          Invista em imóveis de forma simples e acessível. Receba renda passiva
          mensal com dividendos isentos de IR. Descubra os melhores FIIs da B3.
        </p>
      </div>

      <!-- Conteúdo Educacional -->
      <div class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold">
          O que são Fundos Imobiliários (FIIs)?
        </h2>
        <p class="leading-relaxed text-gray-300">
          Fundos Imobiliários são uma forma de investir em grandes
          empreendimentos imobiliários sem precisar comprar um imóvel físico.
          Funcionam como um "condomínio de investidores" que, juntos, compram e
          administram ativos imobiliários como shoppings, escritórios, galpões
          logísticos e hospitais.
        </p>

        <div
          class="my-6 rounded-2xl border border-secondary/20 bg-secondary/10 p-6"
        >
          <h3 class="mb-3 text-xl font-semibold text-secondary">
            Grande Vantagem: Dividendos Isentos de IR!
          </h3>
          <p class="text-gray-300">
            Os rendimentos mensais de FIIs são
            <strong>100% isentos de Imposto de Renda</strong> para pessoas
            físicas. Isso torna FIIs muito atrativos para quem busca renda
            passiva.
          </p>
        </div>

        <h3 class="text-xl font-semibold">Tipos de FIIs</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 flex items-center gap-2 font-semibold text-secondary">
              <UIcon name="i-lucide-building" class="h-5 w-5" />
              Fundos de Tijolo
            </h4>
            <p class="mb-3 text-sm text-gray-300">
              Investem em imóveis físicos que são alugados para gerar renda.
            </p>
            <ul class="list-disc space-y-1 pl-5 text-sm text-gray-400">
              <li>Lajes corporativas (escritórios)</li>
              <li>Galpões logísticos</li>
              <li>Shopping centers</li>
              <li>Agências bancárias</li>
              <li>Hospitais e escolas</li>
            </ul>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 flex items-center gap-2 font-semibold text-secondary">
              <UIcon name="i-lucide-file-text" class="h-5 w-5" />
              Fundos de Papel
            </h4>
            <p class="mb-3 text-sm text-gray-300">
              Investem em títulos e recebíveis do setor imobiliário.
            </p>
            <ul class="list-disc space-y-1 pl-5 text-sm text-gray-400">
              <li>CRI (Certificados de Recebíveis Imobiliários)</li>
              <li>LCI (Letras de Crédito Imobiliário)</li>
              <li>Debêntures de empresas do setor</li>
              <li>Geralmente têm dividend yield mais alto</li>
            </ul>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 flex items-center gap-2 font-semibold text-secondary">
              <UIcon name="i-lucide-layers" class="h-5 w-5" />
              Fundos de Fundos (FOFs)
            </h4>
            <p class="text-sm text-gray-300">
              Investem em cotas de outros FIIs. Ideal para quem quer
              diversificação automática com um único fundo.
            </p>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 flex items-center gap-2 font-semibold text-secondary">
              <UIcon name="i-lucide-combine" class="h-5 w-5" />
              Fundos Híbridos
            </h4>
            <p class="text-sm text-gray-300">
              Combinam tijolo e papel. Diversificam entre imóveis físicos e
              recebíveis imobiliários.
            </p>
          </div>
        </div>

        <h3 class="text-xl font-semibold">
          Como Analisar Fundos Imobiliários
        </h3>
        <p class="leading-relaxed text-gray-300">
          Para escolher bons FIIs, analise estes indicadores principais:
        </p>
        <ul class="list-disc space-y-2 pl-6 text-gray-300">
          <li>
            <strong>Dividend Yield (DY):</strong> Busque FIIs com DY anual de
            8-12%. Cuidado com DY muito alto (> 15%) - pode ser insustentável
          </li>
          <li>
            <strong>Taxa de Vacância:</strong> Quanto menor, melhor. Acima de
            15% é preocupante para fundos de tijolo
          </li>
          <li>
            <strong>P/VP (Preço sobre Valor Patrimonial):</strong> < 1,0 =
            desconto. > 1,0 = prêmio. Analise o motivo
          </li>
          <li>
            <strong>Liquidez:</strong> Volume diário de negociação. FIIs
            líquidos facilitam compra/venda
          </li>
          <li>
            <strong>Qualidade dos ativos:</strong> Localização, inquilinos,
            contratos de longo prazo
          </li>
          <li>
            <strong>Histórico de dividendos:</strong> Consistência nos
            pagamentos ao longo dos anos
          </li>
        </ul>

        <h3 class="text-xl font-semibold">
          Vantagens de Investir em FIIs
        </h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <div class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-coins" class="text-primary h-5 w-5" />
              <h4 class="font-semibold">Renda Passiva Mensal</h4>
            </div>
            <p class="text-sm text-gray-300">
              FIIs são obrigados por lei a distribuir 95% dos lucros
              semestralmente. Na prática, maioria paga todo mês.
            </p>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <div class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-shield-check" class="text-primary h-5 w-5" />
              <h4 class="font-semibold">Isenção de IR</h4>
            </div>
            <p class="text-sm text-gray-300">
              Rendimentos mensais são 100% isentos de Imposto de Renda para
              pessoas físicas. Enorme vantagem.
            </p>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <div class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-zap" class="text-primary h-5 w-5" />
              <h4 class="font-semibold">Alta Liquidez</h4>
            </div>
            <p class="text-sm text-gray-300">
              Diferente de imóveis físicos, você vende FIIs em segundos no
              horário de pregão. Flexibilidade total.
            </p>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <div class="mb-2 flex items-center gap-2">
              <UIcon name="i-lucide-trending-up" class="text-primary h-5 w-5" />
              <h4 class="font-semibold">Acessibilidade</h4>
            </div>
            <p class="text-sm text-gray-300">
              Invista em shoppings, galpões e escritórios premium com R$ 100.
              Impossível comprar imóvel físico assim.
            </p>
          </div>
        </div>

        <h3 class="text-xl font-semibold">
          Riscos de Investir em FIIs
        </h3>
        <div
          class="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5"
        >
          <ul class="list-disc space-y-2 pl-6 text-gray-300">
            <li>
              <strong>Vacância:</strong> Imóveis podem ficar vazios, reduzindo
              dividendos
            </li>
            <li>
              <strong>Inadimplência:</strong> Inquilinos podem não pagar
              aluguéis
            </li>
            <li>
              <strong>Desvalorização:</strong> Preço da cota pode cair (mas
              dividendos continuam)
            </li>
            <li>
              <strong>Liquidez baixa:</strong> Alguns FIIs têm pouco volume de
              negociação
            </li>
            <li>
              <strong>Sensibilidade a juros:</strong> Quando Selic sobe muito,
              FIIs ficam menos atrativos
            </li>
          </ul>
        </div>

        <h3 class="text-xl font-semibold">
          Estratégia para Montar Carteira de FIIs
        </h3>
        <ol class="list-decimal space-y-2 pl-6 text-gray-300">
          <li>
            <strong>Diversifique entre tipos:</strong> Tenha tijolo E papel
            (50/50 ou 60/40)
          </li>
          <li>
            <strong>Diversifique entre setores:</strong> Logística, lajes,
            shoppings, CRIs
          </li>
          <li>
            <strong>Tenha pelo menos 8-12 FIIs diferentes:</strong> Reduz risco
            de concentração
          </li>
          <li>
            <strong>Priorize gestoras renomadas:</strong> Kinea, BTG,
            Bresco, XP, etc.
          </li>
          <li>
            <strong>Analise vacância e inquilinos:</strong> Qualidade importa
            mais que dividend yield alto
          </li>
          <li>
            <strong>Reinvista dividendos:</strong> Compre mais cotas com os
            rendimentos recebidos
          </li>
        </ol>

        <h3 class="text-xl font-semibold">
          Quanto Investir em FIIs?
        </h3>
        <p class="leading-relaxed text-gray-300">
          Uma carteira balanceada pode ter 20-30% em FIIs. Exemplo de alocação:
        </p>
        <ul class="list-disc space-y-1 pl-6 text-gray-300">
          <li>40% Renda Fixa (segurança)</li>
          <li>30% Ações (crescimento)</li>
          <li><strong>25% FIIs (renda passiva)</strong></li>
          <li>5% Internacional/Outros</li>
        </ul>
      </div>

      <!-- Destaque para Planejamento com FIIs -->
      <div class="rounded-[30px] border border-secondary/30 bg-gradient-to-br from-secondary/10 to-secondary/5 p-8">
        <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div class="flex-1">
            <div class="mb-3 flex items-center gap-2">
              <UIcon name="i-lucide-target" class="text-secondary h-8 w-8" />
              <h2 class="text-2xl font-bold">Monte sua Carteira de FIIs</h2>
            </div>
            <p class="mb-4 text-gray-300">
              Use nossas ferramentas para simular investimentos em FIIs e planejar sua renda passiva mensal com fundos imobiliários.
            </p>
            <ul class="space-y-2 text-sm text-gray-400">
              <li class="flex items-center gap-2">
                <UIcon name="i-lucide-check" class="text-secondary size-4" />
                Simulação com dados históricos reais
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-lucide-check" class="text-secondary size-4" />
                Projeção de dividendos mensais
              </li>
              <li class="flex items-center gap-2">
                <UIcon name="i-lucide-check" class="text-secondary size-4" />
                Diversificação automática por segmento
              </li>
            </ul>
          </div>
          <div class="flex flex-col gap-3 md:w-auto">
            <UButton
              to="/calculadora/planejamento"
              color="secondary"
              size="xl"
              icon="i-lucide-target"
              class="w-full md:w-auto"
            >
              Planejar Investimentos
            </UButton>
            <UButton
              to="/calculadora/acoes"
              color="white"
              variant="outline"
              size="lg"
              icon="i-lucide-chart-line"
              class="w-full md:w-auto"
            >
              Simular FIIs
            </UButton>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <MoleculesCtaSection
        title="Encontre os Melhores FIIs na Redentia"
        description="Compare dividend yield, vacância, P/VP e outros indicadores de todos os FIIs"
        :buttons="[
          { label: 'Ver Todos os FIIs', to: '/search?group=reits', icon: 'i-lucide-search', variant: 'primary' },
          { label: 'Saber Mais sobre FIIs', to: '/glossario/fii', icon: 'i-lucide-book-open', variant: 'outline' },
        ]"
      />

      <!-- Link Destacado para Ver Todas -->
      <div class="border-t border-white/10 pt-8">
        <NuxtLink
          to="/search?group=reits"
          class="group mx-auto flex max-w-2xl items-center justify-between rounded-2xl border border-secondary/30 bg-secondary/10 p-6 transition-all hover:border-secondary/50 hover:bg-secondary/20"
        >
          <div class="flex flex-col gap-1">
            <h3 class="text-xl font-bold group-hover:text-secondary transition-colors">
              Ver Todos os Fundos Imobiliários
            </h3>
            <p class="text-sm text-gray-400">
              Explore +300 FIIs com análise de dividend yield, vacância e indicadores completos
            </p>
          </div>
          <UIcon
            name="i-lucide-arrow-right"
            class="text-secondary h-8 w-8 transition-transform group-hover:translate-x-2"
          />
        </NuxtLink>
      </div>

      <!-- FAQ -->
      <div class="space-y-4">
        <h2 class="text-2xl font-bold">
          Perguntas Frequentes sobre FIIs
        </h2>
        <div class="space-y-4">
          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              FIIs pagam dividendos todo mês?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              A maioria dos FIIs paga dividendos mensalmente, mas por lei são
              obrigados a distribuir apenas semestralmente. Consulte o
              histórico de cada FII para verificar a frequência de pagamentos.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Qual o melhor FII para iniciantes?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Para iniciantes, recomenda-se fundos de fundos (FOFs) como HFOF11,
              XPML11 ou KFOF11, que já vêm diversificados. Também FIIs grandes
              e líquidos como HGLG11 (logística) ou MXRF11 (lajes corporativas).
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              É melhor tijolo ou papel?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Depende do momento e objetivo. Fundos de tijolo são mais estáveis
              e tangíveis. Fundos de papel geralmente pagam mais mas são mais
              sensíveis a juros. O ideal é ter os dois tipos na carteira.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Quanto preciso para começar a investir em FIIs?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Muitos FIIs custam entre R$ 80-150 por cota. Você pode começar com
              R$ 100-200 comprando 1-2 cotas. O importante é ir aumentando
              gradualmente e diversificando.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              FIIs são seguros?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              FIIs têm riscos (vacância, inadimplência, desvalorização), mas são
              menos voláteis que ações. A chave é diversificar e escolher fundos
              com boa gestão, bons inquilinos e imóveis em boas localizações.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5 p-4">
            <summary class="cursor-pointer font-semibold text-white list-none flex items-center justify-between">
              Qual o dividend yield ideal de um FII?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm text-gray-300">
              Um bom FII costuma ter dividend yield entre 8-12% ao ano (0,67-1%
              ao mês). Dividend yields muito altos (> 15%) podem indicar que o
              preço caiu por algum problema. Sempre analise a sustentabilidade.
            </p>
          </details>
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
    'Fundos Imobiliários (FIIs): Guia Completo para Iniciantes | Redentia',
  description:
    'Aprenda a investir em FIIs e receba renda passiva mensal com isenção de IR. Compare dividend yield, vacância e indicadores de +300 fundos imobiliários da B3.',
  path: '/fiis',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'FIIs pagam dividendos todo mês?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A maioria dos FIIs paga dividendos mensalmente, mas por lei são obrigados a distribuir apenas semestralmente.',
          },
        },
        {
          '@type': 'Question',
          name: 'Qual o melhor FII para iniciantes?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Para iniciantes, recomenda-se fundos de fundos (FOFs) como HFOF11, XPML11 ou KFOF11, que já vêm diversificados.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quanto preciso para começar a investir em FIIs?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Muitos FIIs custam entre R$ 80-150 por cota. Você pode começar com R$ 100-200.',
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
          name: 'Fundos Imobiliários',
          item: 'https://www.redentia.com.br/fiis',
        },
      ],
    },
  ],
})
</script>

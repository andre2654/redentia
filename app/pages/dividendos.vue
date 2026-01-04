<template>
  <NuxtLayout name="static" title="Dividendos">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-coins" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">
            Dividendos: Renda Passiva com Ações e FIIs
          </h1>
        </div>
        <p class="text-base text-gray-400 md:text-lg">
          Aprenda a construir uma carteira de dividendos e viver de renda
          passiva. Descubra as melhores ações e FIIs pagadores de dividendos do
          Brasil.
        </p>
      </div>

      <!-- Conteúdo Educacional -->
      <div class="prose prose-invert max-w-none">
        <h2 class="text-2xl font-bold">O que são Dividendos?</h2>
        <p class="leading-relaxed text-gray-300">
          Dividendos são a parcela dos lucros que as empresas distribuem aos
          seus acionistas. Quando você compra uma ação, se torna sócio da
          empresa e tem direito a receber parte dos lucros na forma de
          dividendos.
        </p>

        <div
          class="my-6 rounded-2xl border border-secondary/20 bg-secondary/10 p-6"
        >
          <h3 class="mb-3 text-xl font-semibold text-secondary">
            Isenção de Imposto de Renda
          </h3>
          <p class="text-gray-300">
            <strong>Dividendos de ações e FIIs são isentos de IR</strong> para
            pessoas físicas no Brasil. Todo valor que cair na sua conta é 100%
            seu. Enorme vantagem para construir renda passiva.
          </p>
        </div>

        <h3 class="text-xl font-semibold">Como Funcionam os Dividendos</h3>
        <div class="space-y-4">
          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold">1. Empresa Anuncia Dividendos</h4>
            <p class="text-sm text-gray-300">
              Empresa decide distribuir parte dos lucros e anuncia valor por
              ação (ex: R$ 0,50 por ação).
            </p>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold">
              2. Data COM (Último Dia com Direito)
            </h4>
            <p class="text-sm text-gray-300">
              Quem tiver a ação até essa data tem direito ao dividendo. Precisa
              comprar no dia COM ou antes.
            </p>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold">
              3. Data EX (Primeiro Dia sem Direito)
            </h4>
            <p class="text-sm text-gray-300">
              Dia seguinte à data COM. Quem comprar a partir daqui não recebe
              esse dividendo. Preço costuma cair proporcionalmente.
            </p>
          </div>

          <div class="rounded-xl border border-white/10 bg-white/5 p-5">
            <h4 class="mb-2 font-semibold">4. Data de Pagamento</h4>
            <p class="text-sm text-gray-300">
              Dividendo cai automaticamente na sua conta da corretora. Você não
              precisa fazer nada.
            </p>
          </div>
        </div>

        <h3 class="text-xl font-semibold">
          Tipos de Proventos (Além de Dividendos)
        </h3>
        <ul class="list-disc space-y-2 pl-6 text-gray-300">
          <li>
            <strong>Dividendos:</strong> Distribuição de lucros em dinheiro
            (100% isento de IR)
          </li>
          <li>
            <strong>JCP (Juros sobre Capital Próprio):</strong> Similar a
            dividendos, mas com 15% de IR retido na fonte
          </li>
          <li>
            <strong>Bonificação:</strong> Distribuição de novas ações gratuitas
          </li>
          <li>
            <strong>Direitos de Subscrição:</strong> Direito de comprar novas
            ações com desconto
          </li>
        </ul>

        <h3 class="text-xl font-semibold">
          Indicador Principal: Dividend Yield
        </h3>
        <p class="leading-relaxed text-gray-300">
          O Dividend Yield (DY) é o percentual que você recebe de dividendos em
          relação ao preço da ação.
        </p>
        <div class="rounded-xl border border-white/10 bg-white/5 p-5">
          <p class="mb-2 text-sm font-mono text-gray-300">
            DY = (Dividendos últimos 12 meses ÷ Preço atual) × 100
          </p>
          <p class="text-sm text-gray-400">
            Exemplo: Ação a R$ 40 que pagou R$ 3,20 no ano = DY de 8%
          </p>
        </div>

        <div class="my-4 space-y-2 text-gray-300">
          <p><strong>Bom DY para Ações:</strong> 4-8% ao ano</p>
          <p><strong>Bom DY para FIIs:</strong> 8-12% ao ano</p>
        </div>

        <h3 class="text-xl font-semibold">
          Melhores Ações Pagadoras de Dividendos
        </h3>
        <p class="leading-relaxed text-gray-300">
          Setores conhecidos por bons dividendos:
        </p>
        <div class="grid gap-3 md:grid-cols-2">
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Bancos</h4>
            <p class="text-sm text-gray-400">
              ITUB4, BBDC4, BBAS3, SANB11 - DY 6-10%
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Energia Elétrica</h4>
            <p class="text-sm text-gray-400">
              TAEE11, ELET3, CPLE6 - DY 8-12%
            </p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Seguradoras</h4>
            <p class="text-sm text-gray-400">BBSE3, PSSA3 - DY 5-8%</p>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 class="mb-1 font-semibold">Saneamento</h4>
            <p class="text-sm text-gray-400">SAPR11, SBSP3 - DY 4-7%</p>
          </div>
        </div>

        <h3 class="text-xl font-semibold">
          Estratégia: Viver de Dividendos
        </h3>
        <p class="leading-relaxed text-gray-300">
          Para viver de renda passiva com dividendos:
        </p>
        <ol class="list-decimal space-y-2 pl-6 text-gray-300">
          <li>
            <strong>Calcule sua necessidade mensal:</strong> Ex: R$ 5.000/mês =
            R$ 60.000/ano
          </li>
          <li>
            <strong>Defina dividend yield alvo:</strong> Ex: carteira com DY
            médio de 8% ao ano
          </li>
          <li>
            <strong>Calcule patrimônio necessário:</strong> R$ 60.000 ÷ 0,08 =
            R$ 750.000
          </li>
          <li>
            <strong>Monte carteira diversificada:</strong> 50% FIIs + 50%
            ações pagadoras
          </li>
          <li>
            <strong>Reinvista dividendos inicialmente:</strong> Acelera
            crescimento
          </li>
          <li>
            <strong>Quando atingir o valor:</strong> Pare de reinvestir e use
            os dividendos
          </li>
        </ol>

        <div
          class="my-6 rounded-2xl border border-secondary/20 bg-secondary/10 p-6"
        >
          <h3 class="mb-3 text-xl font-semibold text-secondary">
            Exemplo Prático
          </h3>
          <p class="mb-3 text-gray-300">
            João tem R$ 300 mil investidos em ações e FIIs com DY médio de 9%
            ao ano.
          </p>
          <p class="text-gray-300">
            Renda anual: R$ 300.000 × 9% = <strong>R$ 27.000</strong>
          </p>
          <p class="text-gray-300">
            Renda mensal: R$ 27.000 ÷ 12 = <strong>R$ 2.250/mês</strong>
          </p>
          <p class="mt-3 text-sm text-gray-400">
            100% isento de IR! Todo mês cai R$ 2.250 na conta sem fazer nada.
          </p>
        </div>

        <h3 class="text-xl font-semibold">Cuidados com Dividendos</h3>
        <div
          class="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-5"
        >
          <ul class="list-disc space-y-2 pl-6 text-gray-300">
            <li>
              <strong>Dividend yield alto nem sempre é bom:</strong> Pode
              indicar que preço caiu muito (empresa em crise)
            </li>
            <li>
              <strong>Verifique sustentabilidade:</strong> Empresa consegue
              manter esses dividendos? Payout < 100%?
            </li>
            <li>
              <strong>Consistência importa:</strong> Prefira empresas que pagam
              há muitos anos
            </li>
            <li>
              <strong>Não ignore crescimento:</strong> Empresa que só paga
              dividendos mas não cresce pode estagnar
            </li>
          </ul>
        </div>
      </div>

      <!-- CTA -->
      <div
        class="from-secondary/20 flex flex-col gap-6 rounded-3xl bg-gradient-to-br to-transparent p-8"
      >
        <div class="text-center">
          <h2 class="mb-3 text-2xl font-bold">
            Encontre os Melhores Pagadores de Dividendos
          </h2>
          <p class="text-gray-300">
            Compare dividend yield, histórico de pagamentos e consistência
          </p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-4">
          <UButton
            to="/search"
            color="secondary"
            size="xl"
            icon="i-lucide-search"
          >
            Buscar Ativos
          </UButton>
          <UButton
            to="/calculadora"
            color="white"
            variant="outline"
            size="xl"
            icon="i-lucide-calculator"
          >
            Calcular Renda Passiva
          </UButton>
          <UButton
            to="/glossario/dividendos"
            color="white"
            variant="ghost"
            size="xl"
            icon="i-lucide-book-open"
          >
            Glossário
          </UButton>
        </div>
      </div>

      <!-- Links Destacados -->
      <div class="space-y-4 border-t border-white/10 pt-8">
        <NuxtLink
          to="/search?group=stocks"
          class="group mx-auto flex max-w-2xl items-center justify-between rounded-2xl border border-secondary/30 bg-secondary/10 p-6 transition-all hover:border-secondary/50 hover:bg-secondary/20"
        >
          <div class="flex flex-col gap-1">
            <h3 class="text-xl font-bold group-hover:text-secondary transition-colors">
              Maiores Pagadoras de Dividendos (Ações)
            </h3>
            <p class="text-sm text-gray-400">
              Bancos, elétricas, seguradoras e outras ações com alto dividend yield
            </p>
          </div>
          <UIcon
            name="i-lucide-arrow-right"
            class="text-secondary h-8 w-8 transition-transform group-hover:translate-x-2"
          />
        </NuxtLink>

        <NuxtLink
          to="/search?group=reits"
          class="group mx-auto flex max-w-2xl items-center justify-between rounded-2xl border border-secondary/30 bg-secondary/10 p-6 transition-all hover:border-secondary/50 hover:bg-secondary/20"
        >
          <div class="flex flex-col gap-1">
            <h3 class="text-xl font-bold group-hover:text-secondary transition-colors">
              FIIs com Melhores Dividendos
            </h3>
            <p class="text-sm text-gray-400">
              Fundos imobiliários com rendimentos mensais isentos de IR
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
          Perguntas Frequentes sobre Dividendos
        </h2>
        <div class="space-y-3">
          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              Quanto preciso investir para receber R$ 1.000/mês em dividendos?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              Com dividend yield médio de 8% ao ano (FIIs), você precisaria de
              aproximadamente R$ 150.000 investidos (150.000 × 8% = 12.000/ano
              = 1.000/mês). Com ações (DY ~6%), precisaria de ~R$ 200.000.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              Dividendos pagam Imposto de Renda?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              NÃO! Dividendos de ações e rendimentos de FIIs são 100% isentos de
              Imposto de Renda para pessoas físicas. JCP (Juros sobre Capital
              Próprio) tem retenção de 15% na fonte.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              É melhor dividendos de ações ou FIIs?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              FIIs geralmente pagam mais (8-12% vs 4-8% de ações) e com maior
              frequência (mensal). Ações têm potencial de valorização maior. O
              ideal é ter ambos: FIIs para renda mensal e ações para
              crescimento + renda.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              Quando os dividendos caem na conta?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              Cada empresa define suas datas. Geralmente 30-60 dias após a data
              COM. Os dividendos caem automaticamente na sua conta da corretora,
              você não precisa fazer nada.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              Devo reinvestir dividendos?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              Se você ainda está acumulando patrimônio: SIM! Reinvestir acelera
              muito o crescimento (juros compostos). Quando atingir seu objetivo
              de patrimônio, aí você usa os dividendos como renda.
            </p>
          </details>

          <details class="group rounded-xl border border-white/10 bg-white/5">
            <summary
              class="cursor-pointer p-5 font-semibold hover:text-secondary"
            >
              Quais setores pagam melhores dividendos?
            </summary>
            <p class="px-5 pb-5 text-gray-300">
              Bancos, energia elétrica, seguradoras e saneamento são
              tradicionais pagadores. Empresas maduras com receita previsível
              tendem a pagar mais. Empresas em crescimento (tech, varejo)
              geralmente pagam menos porque reinvestem no negócio.
            </p>
          </details>
        </div>
      </div>

      <!-- Carteira de Dividendos -->
      <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 class="mb-4 text-xl font-semibold">
          Exemplo de Carteira de Dividendos
        </h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <span class="font-semibold">Ações de Bancos (20%)</span>
            <span class="text-sm text-gray-400">DY ~7%</span>
          </div>
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <span class="font-semibold">Ações de Energia (15%)</span>
            <span class="text-sm text-gray-400">DY ~9%</span>
          </div>
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <span class="font-semibold">Ações de Seguros (10%)</span>
            <span class="text-sm text-gray-400">DY ~6%</span>
          </div>
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <span class="font-semibold">FIIs de Tijolo (25%)</span>
            <span class="text-sm text-gray-400">DY ~10%</span>
          </div>
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <span class="font-semibold">FIIs de Papel (20%)</span>
            <span class="text-sm text-gray-400">DY ~11%</span>
          </div>
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <span class="font-semibold">Reserva (10%)</span>
            <span class="text-sm text-gray-400">Tesouro Selic</span>
          </div>
          <div class="mt-4 flex items-center justify-between border-t-2 border-secondary pt-3">
            <span class="text-lg font-bold">Dividend Yield Médio</span>
            <span class="text-lg font-bold text-secondary">~8,5% ao ano</span>
          </div>
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
    'Dividendos: Guia Completo para Viver de Renda Passiva | Redentia',
  description:
    'Aprenda a construir carteira de dividendos e viver de renda passiva. Melhores ações e FIIs pagadores, estratégias, cálculos e dividend yield. Isenção de IR. Guia 2026.',
  path: '/dividendos',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Quanto preciso investir para receber R$ 1.000/mês em dividendos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Com dividend yield médio de 8% ao ano, você precisaria de aproximadamente R$ 150.000 investidos.',
          },
        },
        {
          '@type': 'Question',
          name: 'Dividendos pagam Imposto de Renda?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não! Dividendos de ações e rendimentos de FIIs são 100% isentos de Imposto de Renda para pessoas físicas.',
          },
        },
        {
          '@type': 'Question',
          name: 'Devo reinvestir dividendos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Se você ainda está acumulando patrimônio: sim! Reinvestir acelera o crescimento através dos juros compostos.',
          },
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Como Viver de Dividendos',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Calcule sua necessidade mensal',
          text: 'Defina quanto precisa receber por mês de renda passiva.',
        },
        {
          '@type': 'HowToStep',
          name: 'Defina dividend yield alvo',
          text: 'Estabeleça um dividend yield médio realista (6-9%).',
        },
        {
          '@type': 'HowToStep',
          name: 'Calcule patrimônio necessário',
          text: 'Divida necessidade anual pelo dividend yield.',
        },
        {
          '@type': 'HowToStep',
          name: 'Monte carteira diversificada',
          text: 'Combine ações pagadoras e FIIs para balancear risco e retorno.',
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
          name: 'Dividendos',
          item: 'https://www.redentia.com.br/dividendos',
        },
      ],
    },
  ],
})
</script>

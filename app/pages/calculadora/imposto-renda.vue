<template>
  <NuxtLayout name="static" title="Calculadora de IR sobre Ações">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm">
        <NuxtLink to="/" class="transition-colors hover:text-secondary">
          Home
        </NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
        <NuxtLink to="/calculadora" class="transition-colors hover:text-secondary">
          Calculadoras
        </NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
        <span>Imposto de Renda</span>
      </nav>

      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-receipt-text" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl md:text-4xl" :class="[brand.font.headingWeight, brand.font.headingStyle]">
            Calculadora de IR sobre Ações: Day Trade e Swing Trade
          </h1>
        </div>
        <p class="text-base md:text-lg">
          Calcule o imposto de renda sobre suas operações com ações. Gere informações do DARF automaticamente, compense prejuízos e fique em dia com a Receita Federal.
        </p>
      </div>

      <CalculatorIncomeTax />

      <div class="max-w-none">
        <h2>Como Funciona o IR sobre Ações no Brasil</h2>
        <p class="leading-relaxed">
          No Brasil, o Imposto de Renda sobre operações com ações segue regras específicas que todo investidor precisa conhecer. O não pagamento resulta em multas pesadas e problemas com a Receita Federal.
        </p>

        <h3>Regras Principais</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">Swing Trade (Normal)</h4>
            <ul class="space-y-2 text-sm">
              <li>• Alíquota: <strong>15%</strong> sobre o lucro</li>
              <li>• Isenção: Vendas até <strong>R$ 20.000/mês</strong></li>
              <li>• Código DARF: <strong>6015</strong></li>
              <li>• Pode compensar prejuízos</li>
              <li>• Dividendos são isentos</li>
            </ul>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">Day Trade</h4>
            <ul class="space-y-2 text-sm">
              <li>• Alíquota: <strong>20%</strong> sobre o lucro</li>
              <li>• <strong>Sem isenção</strong> (qualquer valor)</li>
              <li>• Código DARF: <strong>8523</strong></li>
              <li>• 1% retido na fonte (crédito no IR)</li>
              <li>• Mais complexo de controlar</li>
            </ul>
          </div>
        </div>

        <h2>Passo a Passo para Pagar o DARF</h2>
        <div class="space-y-4">
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              1
            </div>
            <div>
              <h4>Calcule o Lucro do Mês</h4>
              <p class="text-sm">
                Some todas as vendas e subtraia os custos de compra. Não esqueça de incluir corretagem e taxas B3.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              2
            </div>
            <div>
              <h4>Verifique a Isenção</h4>
              <p class="text-sm">
                Para swing trade, se vendeu menos de R$ 20.000 no mês, você está isento (mas ainda precisa declarar no IRPF anual).
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              3
            </div>
            <div>
              <h4>Compense Prejuízos</h4>
              <p class="text-sm">
                Se você teve prejuízo em meses anteriores, pode compensar do lucro atual, reduzindo o IR devido.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              4
            </div>
            <div>
              <h4>Gere o DARF</h4>
              <p class="text-sm">
                Acesse o site da Receita Federal (Sicalc Web) ou use o app do seu banco. Código 6015 (swing) ou 8523 (day trade).
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              5
            </div>
            <div>
              <h4>Pague até o Último Dia Útil</h4>
              <p class="text-sm">
                O DARF vence no último dia útil do mês seguinte. Ex: Operações de janeiro, DARF vence fim de fevereiro.
              </p>
            </div>
          </div>
        </div>

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
              O que acontece se eu não pagar o IR?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Multa de 0,33% por dia de atraso (máximo 20%) + juros Selic + possível malha fina no IRPF. Em casos graves, crime contra ordem tributária. Sempre pague em dia, não vale o risco.
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
              Como funciona a isenção de R$ 20.000?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Se o total de vendas de ações no mês for até R$ 20.000, o lucro é isento de IR. Mas atenção: é sobre VENDAS, não lucro. Se você vendeu R$ 19.000 e lucrou R$ 5.000, está isento. Se vendeu R$ 21.000, mesmo que o lucro seja R$ 100, paga 15% de IR. Day trade não tem essa isenção.
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
              Posso compensar prejuízos de meses anteriores?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Sim! Prejuízos podem ser compensados indefinidamente nos meses seguintes. Exemplo: Prejuízo de R$ 3.000 em janeiro, lucro de R$ 5.000 em fevereiro = IR apenas sobre R$ 2.000. Mantenha um controle rigoroso dos prejuízos acumulados. Importante: prejuízos de swing não compensam day trade e vice-versa, são "gavetas" separadas.
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
              Tenho que declarar operações isentas no IRPF?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              SIM! Mesmo operações isentas (vendas abaixo de R$ 20k) devem ser declaradas no IRPF anual. Declare: saldo de ações no fim do ano, operações realizadas (mesmo isentas), dividendos recebidos (renda isenta), prejuízos acumulados. A Receita cruza dados com as corretoras, omitir pode gerar problemas.
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
              Corretagem e taxas podem ser deduzidas?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Sim! Corretagem, emolumentos B3, custódia e outras taxas relacionadas à operação podem ser deduzidas. Isso reduz o lucro tributável. Mantenha todas as notas de corretagem organizadas. Exemplo: Vendeu por R$ 10.000, comprou por R$ 8.000, pagou R$ 100 de taxas. Lucro tributável = R$ 10.000 - R$ 8.000 - R$ 100 = R$ 1.900.
            </p>
          </details>
        </div>

        <h2>Evite Estes Erros</h2>
        <div class="space-y-3">
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: 'color-mix(in srgb, #ef4444 25%, transparent)',
              backgroundColor: 'color-mix(in srgb, #ef4444 8%, transparent)',
            }"
          >
            <h4 class="mb-1" :style="{ color: '#f87171' }">Não Controlar as Operações</h4>
            <p class="text-sm">
              Use planilha ou software. Não dá para confiar apenas na memória ou esperar a corretora fazer tudo.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: 'color-mix(in srgb, #ef4444 25%, transparent)',
              backgroundColor: 'color-mix(in srgb, #ef4444 8%, transparent)',
            }"
          >
            <h4 class="mb-1" :style="{ color: '#f87171' }">Esquecer de Pagar o DARF</h4>
            <p class="text-sm">
              Multa de 0,33% ao dia. Configure lembretes! Último dia útil do mês seguinte.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: 'color-mix(in srgb, #ef4444 25%, transparent)',
              backgroundColor: 'color-mix(in srgb, #ef4444 8%, transparent)',
            }"
          >
            <h4 class="mb-1" :style="{ color: '#f87171' }">Não Declarar Operações Isentas</h4>
            <p class="text-sm">
              Mesmo isento, você DEVE declarar no IRPF anual. Omissão gera malha fina.
            </p>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              borderColor: 'color-mix(in srgb, #ef4444 25%, transparent)',
              backgroundColor: 'color-mix(in srgb, #ef4444 8%, transparent)',
            }"
          >
            <h4 class="mb-1" :style="{ color: '#f87171' }">Misturar Swing e Day Trade</h4>
            <p class="text-sm">
              São tratados separadamente. Prejuízo de um não compensa lucro do outro.
            </p>
          </div>
        </div>
      </div>

      <div
        class="flex flex-col gap-4 rounded-[30px] p-6"
        :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"
      >
        <h2>Outras Ferramentas</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            to="/calculadora/acoes"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <UIcon name="i-lucide-chart-line" class="text-secondary size-8 shrink-0" />
            <div>
              <h3>Simulador de Ações</h3>
              <p class="text-sm">Simule investimentos em ações</p>
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
              <p class="text-sm">Descubra se ação está barata</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <MoleculesCtaSection
        :title="`Controle seus investimentos na ${brand.name}`"
        description="Acompanhe sua carteira, receba alertas e tenha relatórios prontos para o IR."
        primary-button-text="Criar conta grátis"
        primary-button-link="/auth/register"
        secondary-button-text="Ver mais calculadoras"
        secondary-button-link="/calculadora"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
const brand = useBrand()

usePageSeo({
  title: `Calculadora de IR sobre Ações: Day Trade e Swing Trade | ${brand.name}`,
  description:
    'Calcule o imposto de renda sobre suas operações com ações. Gere DARF automaticamente, compense prejuízos e fique em dia com a Receita Federal. Códigos 6015 e 8523.',
  path: '/calculadora/imposto-renda',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadora' },
    { name: 'Imposto de Renda', path: '/calculadora/imposto-renda' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: `Calculadora de IR sobre Ações ${brand.name}`,
      applicationCategory: 'FinanceApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
      operatingSystem: 'Web',
      description:
        'Calculadora gratuita de imposto de renda sobre ações com geração de informações para DARF e compensação de prejuízos.',
      featureList: [
        'Cálculo de IR swing trade e day trade',
        'Informações para DARF',
        'Compensação de prejuízos',
        'Verificação de isenção',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'O que acontece se eu não pagar o IR?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Multa de 0,33% por dia de atraso (máximo 20%) mais juros Selic e possível malha fina no IRPF.',
          },
        },
        {
          '@type': 'Question',
          name: 'Como funciona a isenção de R$ 20.000?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Se o total de vendas de ações no mês for até R$ 20.000, o lucro é isento de IR. É sobre vendas, não lucro.',
          },
        },
        {
          '@type': 'Question',
          name: 'Posso compensar prejuízos de meses anteriores?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim! Prejuízos podem ser compensados indefinidamente nos meses seguintes. Mantenha controle rigoroso dos prejuízos acumulados.',
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

<template>
  <NuxtLayout name="static" title="Calculadora de Juros Compostos">
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
        <span>Juros Compostos</span>
      </nav>

      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-trending-up" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl md:text-4xl" :class="[brand.font.headingWeight, brand.font.headingStyle]">
            Calculadora de Juros Compostos: Simule Seu Investimento
          </h1>
        </div>
        <p class="text-base md:text-lg">
          Calcule quanto seus investimentos vão render com juros compostos ao longo do tempo. Simule aportes mensais, diferentes taxas de retorno e veja a evolução do seu patrimônio em gráficos interativos.
        </p>
        <p class="text-xs">
          Última atualização: {{ lastUpdatedText }} · Calculadora gratuita · Sem cadastro · Sem anúncios
        </p>
      </div>

      <!-- Calculadora -->
      <CalculatorCompound />

      <!-- Conteúdo Educacional -->
      <div class="max-w-none">
        <h2>O que são Juros Compostos?</h2>
        <p class="leading-relaxed">
          Juros compostos são os "juros sobre juros", ou seja, quando você ganha retorno não apenas sobre o capital inicial, mas também sobre os rendimentos acumulados. É o conceito mais poderoso das finanças pessoais e o segredo para construir riqueza a longo prazo.
        </p>
        <p class="leading-relaxed">
          Albert Einstein teria dito que "os juros compostos são a força mais poderosa do universo". E de fato, quando você entende como funcionam, percebe o impacto transformador que podem ter no seu patrimônio.
        </p>

        <h3>Por que Investir com Juros Compostos?</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              Efeito Bola de Neve
            </h4>
            <p class="text-sm">
              Quanto mais tempo seu dinheiro fica investido, maior é o efeito dos juros compostos. Os rendimentos geram novos rendimentos, criando um crescimento exponencial.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              Vantagem do Tempo
            </h4>
            <p class="text-sm">
              Começar cedo faz toda diferença. 10 anos a mais de investimento podem dobrar ou triplicar seu patrimônio final, mesmo com aportes menores.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              Aportes Regulares
            </h4>
            <p class="text-sm">
              Investir mensalmente acelera o crescimento. Cada novo aporte começa imediatamente a gerar juros compostos.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              Proteção Contra Inflação
            </h4>
            <p class="text-sm">
              Com taxas de retorno acima da inflação, seu poder de compra cresce ao longo do tempo, garantindo um futuro mais confortável.
            </p>
          </div>
        </div>

        <h2>Como Calcular Juros Compostos: Fórmula Completa</h2>

        <h3>Fórmula Matemática</h3>
        <p class="leading-relaxed">
          A fórmula básica dos juros compostos é:
        </p>
        <div class="brand-card border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg">
            M = C × (1 + i)ⁿ
          </p>
          <div class="mt-4 space-y-2 text-sm">
            <p><strong>M</strong> = Montante final (valor futuro)</p>
            <p><strong>C</strong> = Capital inicial</p>
            <p><strong>i</strong> = Taxa de juros por período</p>
            <p><strong>n</strong> = Número de períodos</p>
          </div>
        </div>

        <h3>Com Aportes Mensais</h3>
        <p class="leading-relaxed">
          Quando você faz aportes regulares, a fórmula se torna um pouco mais complexa:
        </p>
        <div class="brand-card border border-secondary/20 bg-secondary/10 p-5">
          <p class="text-center text-lg">
            M = C × (1 + i)ⁿ + P × [((1 + i)ⁿ - 1) / i]
          </p>
          <div class="mt-4 space-y-2 text-sm">
            <p><strong>P</strong> = Valor do aporte mensal</p>
            <p>Os demais valores seguem a mesma definição</p>
          </div>
        </div>

        <h2>Quanto Rende R$ 500 por Mês em Juros Compostos? (5, 10, 20 e 30 anos)</h2>
        <p class="leading-relaxed">
          A melhor forma de entender o poder dos juros compostos é ver o que acontece com o mesmo aporte em horizontes diferentes. Na tabela abaixo, simulamos R$ 500 investidos por mês a 10% ao ano (taxa próxima da média histórica da bolsa brasileira):
        </p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead
              :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"
            >
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Prazo</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Total Investido</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Montante Final</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Juros Acumulados</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Multiplicador</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">5 anos</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">R$ 30.000</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">R$ 38.753</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">R$ 8.753</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">1,29×</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">10 anos</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">R$ 60.000</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">R$ 102.422</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">R$ 42.422</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">1,71×</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">20 anos</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">R$ 120.000</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">R$ 379.684</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">R$ 259.684</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">3,16×</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">30 anos</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">R$ 180.000</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">R$ 1.130.244</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">R$ 950.244</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">6,28×</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-sm">
          Observe o salto entre 20 e 30 anos: dobrar o tempo triplica o resultado. Esse é o efeito exponencial dos juros compostos, ele não é linear, cresce cada vez mais rápido no final.
        </p>

        <h2>Exemplos Práticos de Juros Compostos</h2>

        <h3>Exemplo 1: Investimento Inicial sem Aportes</h3>
        <div class="space-y-3">
          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2">Cenário</h4>
            <ul class="text-sm">
              <li>Investimento inicial: R$ 10.000</li>
              <li>Taxa de juros: 10% ao ano</li>
              <li>Período: 20 anos</li>
              <li>Sem aportes mensais</li>
            </ul>
            <div class="mt-3 rounded-lg bg-secondary/20 p-3">
              <p class="text-sm">
                Resultado: R$ 67.275,00
              </p>
              <p class="text-xs">
                Ganho de R$ 57.275 (572% de rentabilidade)
              </p>
            </div>
          </div>
        </div>

        <h3>Exemplo 2: Com Aportes Mensais</h3>
        <div class="space-y-3">
          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2">Cenário</h4>
            <ul class="text-sm">
              <li>Investimento inicial: R$ 10.000</li>
              <li>Aporte mensal: R$ 500</li>
              <li>Taxa de juros: 10% ao ano</li>
              <li>Período: 20 anos</li>
            </ul>
            <div class="mt-3 rounded-lg bg-secondary/20 p-3">
              <p class="text-sm">
                Resultado: R$ 450.192,00
              </p>
              <p class="text-xs">
                Total investido: R$ 130.000 | Ganho: R$ 320.192
              </p>
            </div>
          </div>
        </div>

        <h3>Exemplo 3: Começando Cedo</h3>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">João - Começou aos 25 anos</h4>
            <ul class="text-sm">
              <li>Aporte mensal: R$ 500</li>
              <li>Até os 65 anos (40 anos)</li>
              <li>Taxa: 10% ao ano</li>
            </ul>
            <div class="mt-3 rounded-lg bg-secondary/20 p-3">
              <p class="text-sm">R$ 3.162.039,00</p>
              <p class="text-xs">Investido: R$ 240.000</p>
            </div>
          </div>
          <div
            class="brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2" :style="{ color: '#f87171' }">Maria - Começou aos 35 anos</h4>
            <ul class="text-sm">
              <li>Aporte mensal: R$ 500</li>
              <li>Até os 65 anos (30 anos)</li>
              <li>Taxa: 10% ao ano</li>
            </ul>
            <div
              class="mt-3 rounded-lg p-3"
              :style="{ backgroundColor: 'color-mix(in srgb, #ef4444 8%, transparent)' }"
            >
              <p class="text-sm">R$ 1.130.244,00</p>
              <p class="text-xs">Investido: R$ 180.000</p>
            </div>
          </div>
        </div>
        <p class="text-sm">
          João investiu apenas R$ 60.000 a mais, mas terminou com R$ 2 milhões a mais que Maria! Isso é o poder de começar cedo.
        </p>

        <h2>Juros Simples vs Juros Compostos</h2>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead
              :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"
            >
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Característica</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Juros Simples</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Juros Compostos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Cálculo</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Apenas sobre o capital inicial</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Sobre capital + rendimentos</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Crescimento</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Linear</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Exponencial</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Exemplo (R$ 1.000 a 10% a.a. por 10 anos)</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">R$ 2.000</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">R$ 2.594</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Uso comum</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Empréstimos de curto prazo</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)' }">Investimentos de longo prazo</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Como Usar a Calculadora de Juros Compostos</h2>
        <div class="space-y-4">
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              1
            </div>
            <div>
              <h4>Defina o Valor Inicial</h4>
              <p class="text-sm">
                Insira quanto você tem disponível para investir hoje. Pode ser zero se você ainda não tem capital inicial.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              2
            </div>
            <div>
              <h4>Configure os Aportes Mensais</h4>
              <p class="text-sm">
                Defina quanto você consegue investir por mês. Mesmo valores pequenos fazem grande diferença no longo prazo.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              3
            </div>
            <div>
              <h4>Escolha a Taxa de Juros</h4>
              <p class="text-sm">
                Use uma taxa realista. Para renda fixa, considere 10-13% a.a. Para ações, o histórico é de 12-15% a.a., mas com mais volatilidade.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              4
            </div>
            <div>
              <h4>Defina o Período</h4>
              <p class="text-sm">
                Quanto mais tempo, maior o efeito dos juros compostos. Pense no longo prazo: 10, 20 ou 30 anos.
              </p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
              5
            </div>
            <div>
              <h4>Analise os Resultados</h4>
              <p class="text-sm">
                Veja o montante final, total de juros ganhos e um gráfico mostrando a evolução do seu patrimônio mês a mês.
              </p>
            </div>
          </div>
        </div>

        <h2>Perguntas Frequentes sobre Juros Compostos</h2>

        <div class="space-y-4">
          <details
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Qual a diferença entre juros simples e compostos?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Juros simples são calculados apenas sobre o capital inicial, resultando em crescimento linear. Juros compostos incidem sobre o capital inicial + rendimentos acumulados, gerando crescimento exponencial. Por exemplo: R$ 1.000 a 10% a.a. por 10 anos rende R$ 2.000 com juros simples, mas R$ 2.594 com juros compostos.
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
              Qual é uma taxa de retorno realista para investimentos?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Depende do tipo de investimento. Renda fixa (Tesouro Direto, CDBs): 10-13% a.a. Fundos imobiliários: 8-12% a.a. + valorização. Ações: historicamente 12-15% a.a., mas com volatilidade. Diversificado (60% ações, 40% renda fixa): 10-12% a.a. Sempre considere o impacto da inflação nos retornos reais.
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
              É melhor investir tudo no início ou fazer aportes mensais?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Se você tem um valor grande disponível, investir tudo no início geralmente rende mais porque o dinheiro fica mais tempo aplicado. Porém, aportes mensais têm vantagens: reduzem risco de timing (você compra em diferentes momentos), facilitam a disciplina financeira e permitem começar mesmo sem muito capital. O ideal é combinar: investir o que tem disponível e manter aportes regulares.
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
              Quanto tempo leva para dobrar meu dinheiro?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Use a "Regra de 72": divida 72 pela taxa de juros anual para saber em quantos anos seu dinheiro dobra. Exemplos: a 6% a.a. = 12 anos (72÷6), a 10% a.a. = 7,2 anos (72÷10), a 12% a.a. = 6 anos (72÷12). Esta é uma aproximação, mas bem precisa para taxas entre 6% e 15%.
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
              Os impostos afetam os juros compostos?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Sim, e significativamente. No Brasil, rendimentos de renda fixa têm IR de 15-22,5% (quanto mais tempo investido, menor a alíquota). Ações têm 15% de IR sobre ganhos de capital (acima de R$ 20 mil por mês) e dividendos são isentos. FIIs têm dividendos isentos e 20% de IR sobre ganhos de capital. Idealmente, considere retornos líquidos (após impostos) nas suas simulações.
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
              Devo considerar a inflação no cálculo?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Absolutamente! A inflação corrói o poder de compra. Se você tem 10% de retorno mas a inflação é 5%, seu retorno real é cerca de 5%. Para metas de longo prazo, sempre use taxas reais (acima da inflação). No Brasil, considere inflação média de 4-6% a.a. e busque investimentos que rendam pelo menos 5-8% acima da inflação.
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
              Posso usar esta calculadora para qualquer tipo de investimento?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              A calculadora é ideal para investimentos com retorno previsível e constante, como renda fixa (Tesouro, CDB, LCI/LCA). Para ações, use taxas médias históricas, mas lembre-se que o mercado é volátil e não há garantia de retornos consistentes. Para análise precisa de ações específicas, use nosso Simulador de Investimento em Ações, que considera dados históricos reais.
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
              Qual o impacto de aumentar o aporte mensal em 20%?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              O impacto é maior do que você imagina! Se você investe R$ 500/mês a 10% a.a. por 20 anos, terá R$ 381 mil. Aumentando para R$ 600/mês (20% a mais), terá R$ 458 mil, um ganho de R$ 77 mil. A diferença cresce exponencialmente com o tempo. Pequenos aumentos nos aportes podem significar anos a mais de liberdade financeira.
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
              Com que frequência devo revisar meus investimentos?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Revise suas simulações e estratégia a cada 6-12 meses, ou quando houver mudanças significativas (aumento de renda, mudança de objetivos, alterações no mercado). Porém, evite mexer nos investimentos de longo prazo com frequência, isso pode prejudicar os juros compostos. Mantenha a disciplina e deixe o tempo trabalhar a seu favor.
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
              Qual a importância de começar a investir cedo?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              É fundamental! Cada ano a mais faz enorme diferença por causa dos juros compostos. Investindo R$ 300/mês a 10% a.a.: começando aos 25 até os 65 (40 anos) = R$ 1,9 milhão. Começando aos 35 até os 65 (30 anos) = R$ 679 mil. Começando aos 45 até os 65 (20 anos) = R$ 229 mil. Mesmo com valores menores, começar cedo é muito mais efetivo que investir valores maiores tarde.
            </p>
          </details>
        </div>

        <h2>Dicas para Maximizar Seus Juros Compostos</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              1. Comece Agora
            </h4>
            <p class="text-sm">
              O melhor momento para começar a investir foi há 10 anos. O segundo melhor momento é agora. Mesmo com valores pequenos, comece hoje.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              2. Seja Consistente
            </h4>
            <p class="text-sm">
              Aportes mensais regulares, mesmo que pequenos, têm impacto maior que investimentos irregulares de valores maiores.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              3. Reinvista os Rendimentos
            </h4>
            <p class="text-sm">
              Nunca retire os rendimentos. Deixe-os reinvestidos para maximizar o efeito dos juros compostos.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              4. Aumente os Aportes
            </h4>
            <p class="text-sm">
              Sempre que receber um aumento ou bônus, aumente proporcionalmente seus aportes mensais.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              5. Escolha Bons Investimentos
            </h4>
            <p class="text-sm">
              Busque investimentos com boa rentabilidade, baixas taxas de administração e adequados ao seu perfil de risco.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              6. Tenha Paciência
            </h4>
            <p class="text-sm">
              Os juros compostos são poderosos, mas precisam de tempo. Pense em décadas, não em meses.
            </p>
          </div>
        </div>
      </div>

      <!-- Calculadoras Relacionadas -->
      <div
        class="flex flex-col gap-4 rounded-[30px] p-6"
        :style="{ backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')' }"
      >
        <h2>Outras Calculadoras</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            to="/calculadora/acoes"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <UIcon
              name="i-lucide-chart-line"
              class="text-secondary size-8 shrink-0"
            />
            <div>
              <h3>Simulador de Ações</h3>
              <p class="text-sm">
                Analise investimentos em ações reais da B3
              </p>
            </div>
          </NuxtLink>
          <NuxtLink
            to="/calculadora/planejamento"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
              borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
            }"
          >
            <UIcon
              name="i-lucide-target"
              class="text-secondary size-8 shrink-0"
            />
            <div>
              <h3>Planejamento Patrimonial</h3>
              <p class="text-sm">
                Calcule quanto investir para suas metas
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Autoria e E-E-A-T -->
      <aside
        class="flex flex-col gap-3 rounded-2xl border p-6 md:flex-row md:items-center md:gap-6"
        :style="{
          backgroundColor: 'color-mix(in srgb, ' + brand.colors.surface + ' 55%, ' + brand.colors.background + ')',
          borderColor: 'color-mix(in srgb, ' + brand.colors.border + ' 50%, transparent)',
        }"
      >
        <div class="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary/20">
          <UIcon name="i-lucide-book-open-check" class="size-7 text-secondary" />
        </div>
        <div class="flex flex-col gap-1 text-sm">
          <p>
            Metodologia revisada pela equipe de análise da {{ brand.name }}
          </p>
          <p>
            Cálculos baseados nas fórmulas oficiais de matemática financeira (M = C × (1 + i)ⁿ) e em médias históricas do mercado brasileiro (CDI, Ibovespa, IPCA). As simulações assumem juros capitalizados mensalmente e reinvestimento integral dos rendimentos.
          </p>
          <p class="text-xs">
            Fontes: <a href="https://www.bcb.gov.br" target="_blank" rel="noopener nofollow" class="underline hover:text-secondary">Banco Central do Brasil</a>,
            <a href="https://www.b3.com.br" target="_blank" rel="noopener nofollow" class="underline hover:text-secondary">B3 (Brasil, Bolsa, Balcão)</a>,
            <a href="https://www.ibge.gov.br" target="_blank" rel="noopener nofollow" class="underline hover:text-secondary">IBGE</a>.
          </p>
        </div>
      </aside>

      <!-- CTA -->
      <MoleculesCtaSection
        title="Quer acompanhar seus investimentos reais?"
        :description="`Cadastre-se na ${brand.name} e monitore sua carteira com análises em tempo real e IA.`"
        primary-button-text="Criar conta grátis"
        primary-button-link="/auth/register"
        secondary-button-text="Ver mais guias"
        secondary-button-link="/guias"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
const brand = useBrand()

// Data de atualização dinâmica: 1º dia do mês corrente. Google usa
// dateModified como sinal de frescor; atualizar mensalmente mantém a página
// "fresca" sem trabalho manual. Se houver mudança real na calculadora, um
// bump em `CONTENT_VERSION` força refresh.
const CONTENT_VERSION = '2026-04-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
const lastUpdatedISO = lastUpdated.toISOString()

usePageSeo({
  title: `Calculadora de Juros Compostos: Simule Seu Investimento | ${brand.name}`,
  description:
    'Calcule quanto seus investimentos vão render com juros compostos. Simule aportes mensais, taxas de retorno e veja a evolução do seu patrimônio em gráficos interativos. Gratuito!',
  path: '/calculadora/juros-compostos',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadora' },
    { name: 'Juros Compostos', path: '/calculadora/juros-compostos' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: `Calculadora de Juros Compostos ${brand.name}`,
      applicationCategory: 'FinanceApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
      operatingSystem: 'Web',
      dateModified: lastUpdatedISO,
      description:
        'Calculadora gratuita de juros compostos para simular investimentos de longo prazo com aportes mensais. Mostra evolução patrimonial em gráficos interativos e tabela comparativa em diferentes prazos (5, 10, 20 e 30 anos).',
      featureList: [
        'Cálculo de juros compostos com aportes mensais',
        'Simulação de 5 a 40 anos',
        'Gráfico de evolução patrimonial mês a mês',
        'Comparação de cenários com diferentes taxas',
        'Regra de 72 integrada',
        'Tabela de rendimento por horizonte temporal',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Qual a diferença entre juros simples e compostos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Juros simples são calculados apenas sobre o capital inicial, resultando em crescimento linear. Juros compostos incidem sobre o capital inicial + rendimentos acumulados, gerando crescimento exponencial.',
          },
        },
        {
          '@type': 'Question',
          name: 'Qual é uma taxa de retorno realista para investimentos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Depende do tipo de investimento. Renda fixa: 10-13% a.a. Fundos imobiliários: 8-12% a.a. Ações: historicamente 12-15% a.a., mas com volatilidade.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quanto tempo leva para dobrar meu dinheiro?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Use a Regra de 72: divida 72 pela taxa de juros anual. Por exemplo, a 10% a.a., leva 7,2 anos para dobrar o capital.',
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

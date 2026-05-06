<template>
  <NuxtLayout :name="layoutName" title="Calculadora de Juros Compostos">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Back-link to parent listing -->
      <NuxtLink
        to="/calculadora"
        class="flex items-center gap-1 text-xs transition hover:opacity-80"
        :style="{ color: 'var(--brand-text-muted)' }"
      >
        <UIcon name="i-lucide-chevron-left" class="size-3" />
        Todas as calculadoras
      </NuxtLink>

      <!-- Hero Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-trending-up" class="text-secondary h-8 w-8" />
          <h1
            class="font-light"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(28px, 4vw, 36px)',
              lineHeight: 1.05,
              letterSpacing: '-0.7px',
            }"
          >Calculadora de Juros Compostos 2026: Simulador com Aportes Mensais</h1>
        </div>
        <p class="text-base md:text-lg" :style="{ color: 'var(--brand-text)' }">
          Juros compostos são os juros sobre juros, calculados pela fórmula M = C×(1+i)ⁿ. Exemplo: R$ 500 investidos por mês a 10,5% ao ano durante 20 anos viram R$ 410.000, sendo R$ 290.000 só de juros. Quanto maior o prazo, mais o rendimento cresce de forma exponencial.
        </p>
        <p class="text-base md:text-lg">
          Simule na hora quanto R$ 100, R$ 500 ou R$ 1.000 por mês rendem em 5, 10, 20 ou 30 anos. Calculadora gratuita com gráfico interativo, comparação entre cenários e ajuste de taxa, ideal pra planejar aposentadoria, reserva de emergência ou metas de longo prazo. Sem planilha, sem cadastro.
        </p>
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-check-circle" class="size-4" :style="{ color: 'var(--brand-positive)' }" />
            100% gratuito
          </span>
          <span>·</span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-zap" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
            Cálculo instantâneo
          </span>
          <span>·</span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-bar-chart-3" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
            Gráfico mês a mês
          </span>
          <span>·</span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-share-2" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
            Link compartilhável
          </span>
        </div>
        <p class="text-[11px]" :style="{ color: 'var(--brand-text-muted)' }">
          Última atualização: {{ lastUpdatedText }}
        </p>
      </div>

      <!-- Calculadora -->
      <CalculatorCompound />

      <!-- Cenarios populares (internal linking + deep-links) -->
      <!--
        Cada link e uma "landing page virtual" que o Google indexa
        independente. Compound.vue le `?monthly=`, `?rate=`, `?years=`
        e ja dispara o calculo no mount. Padrao identico aos popular
        tickers da preco-teto, adaptado pra long-tails de simulacao
        ("calculadora juros compostos R$ 500", "rendimento 10 anos",
        "quanto rende R$ 1000 por mes", etc).
      -->
      <div
        class="flex flex-col gap-3 rounded-[30px] border p-6"
        :style="{
          backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
          borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
        }"
      >
        <h2>Cenários populares de investimento</h2>
        <p class="text-sm">
          Veja na hora o resultado dos cenários mais buscados, basta clicar e a simulação carrega já preenchida.
        </p>
        <div class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          <NuxtLink
            v-for="s in popularScenarios"
            :key="s.label"
            :to="s.to"
            class="group flex flex-col gap-0.5 rounded-xl border px-3 py-3 transition hover:border-secondary/40 hover:bg-secondary/10"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <span class="flex items-center gap-1.5 text-sm font-medium">
              <UIcon :name="s.icon" class="size-4 text-secondary" />
              {{ s.label }}
            </span>
            <span class="text-[11px] line-clamp-1" :style="{ color: 'var(--brand-text-muted)' }">{{ s.sub }}</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Conteúdo Educacional -->
      <div class="max-w-none">
        <h2>Simulador de juros compostos grátis e online</h2>
        <p class="leading-relaxed">
          Use a calculadora acima para simular o rendimento de qualquer aporte com juros compostos em segundos. Ideal pra planejar aposentadoria, metas e reserva de longo prazo.
        </p>

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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              Proteção Contra Inflação
            </h4>
            <p class="text-sm">
              Com taxas de retorno acima da inflação, seu poder de compra cresce ao longo do tempo, garantindo um futuro mais confortável.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">
              Ibovespa: ~14% a.a. histórica
            </h4>
            <p class="text-sm">
              O índice Ibovespa, referência da bolsa brasileira, entregou cerca de 14% a.a. nos últimos 30 anos. É um benchmark útil pra calibrar a taxa real que você usa nas simulações de longo prazo.
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
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
            >
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Prazo</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Total Investido</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Montante Final</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Juros Acumulados</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Multiplicador</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">5 anos</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 30.000</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 38.753</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 8.753</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">1,29×</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">10 anos</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 60.000</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 102.422</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 42.422</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">1,71×</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">20 anos</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 120.000</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 379.684</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 259.684</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">3,16×</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">30 anos</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 180.000</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 1.130.244</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 950.244</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">6,28×</td>
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2" :style="{ color: 'var(--brand-negative)' }">Maria - Começou aos 35 anos</h4>
            <ul class="text-sm">
              <li>Aporte mensal: R$ 500</li>
              <li>Até os 65 anos (30 anos)</li>
              <li>Taxa: 10% ao ano</li>
            </ul>
            <div
              class="mt-3 rounded-lg p-3"
              :style="{ backgroundColor: `color-mix(in srgb, var(--brand-negative) 8%, transparent)` }"
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
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
            >
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Característica</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Juros Simples</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Juros Compostos</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Cálculo</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Apenas sobre o capital inicial</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Sobre capital + rendimentos</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Crescimento</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Linear</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Exponencial</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Exemplo (R$ 1.000 a 10% a.a. por 10 anos)</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 2.000</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 2.594</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Uso comum</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Empréstimos de curto prazo</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Investimentos de longo prazo</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Poupança vs Juros Compostos: Por Que a Poupança é o Pior Investimento</h2>
        <p class="leading-relaxed">
          A poupança rende 70% da Selic + TR (quando Selic está acima ou igual a 8,5%) ou 0,5% ao mês + TR (quando Selic abaixo de 8,5%). Em 2026 com Selic em 12%, poupança rende cerca de 6,5% a.a. Já o Tesouro Selic, considerado o investimento mais seguro do Brasil, rende próximo da Selic integral, ou seja, ~12% a.a. Mesmo após o IR, ainda ganha de longe da poupança.
        </p>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
            >
              <tr>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Investimento</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Taxa Bruta</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Após IR</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Total em 20 anos</th>
                <th class="border px-4 py-2 text-left" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Diferença vs Poupança</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Poupança</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">6,5% a.a.</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">6,5% (isenta)</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 244.000</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">base</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">Tesouro Selic</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">12% a.a.</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">10,2% (15% IR)</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 410.000</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">+R$ 166.000</td>
              </tr>
              <tr>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">CDB 110% CDI</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">13,2% a.a.</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">11,2% (15% IR)</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 460.000</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">+R$ 216.000</td>
              </tr>
              <tr :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 30%, transparent)' }">
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">LCI/LCA 95% CDI</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">11,4% a.a.</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">11,4% (isenta)</td>
                <td class="border px-4 py-2 text-secondary" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">R$ 472.000</td>
                <td class="border px-4 py-2" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)' }">+R$ 228.000</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-sm">
          Cenário: aporte de R$ 500/mês durante 20 anos. A poupança não acompanha a inflação na maioria dos cenários. Mesmo com a isenção de IR, perde pra Tesouro Selic e CDB com folga.
        </p>

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

        <h2>Tesouro Direto, CDB, LCI e LCA: Onde Aplicar Juros Compostos</h2>
        <p class="leading-relaxed">
          Os juros compostos só funcionam de verdade quando você aplica em produtos com retorno consistente. Os 4 mais usados no Brasil hoje:
        </p>
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">Tesouro Selic 2030</h4>
            <p class="text-sm">
              Liquidez diária, rende próximo da Selic, ideal pra reserva de emergência e capital que você pode precisar a qualquer momento. IR regressivo de 22,5% a 15% conforme o tempo.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">Tesouro IPCA+ 2035</h4>
            <p class="text-sm">
              Protege da inflação, juros reais ~6% acima do IPCA. Ideal pra metas de longo prazo (aposentadoria, faculdade dos filhos). Marcação a mercado pode oscilar antes do vencimento.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">CDB com liquidez diária</h4>
            <p class="text-sm">
              Costuma render 90-100% do CDI em bancos grandes. Conta com a proteção do FGC até R$ 250 mil por CPF e por instituição. Bom substituto pro Tesouro Selic em alguns cenários.
            </p>
          </div>
          <div
            class="brand-card border p-5"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <h4 class="mb-2 text-secondary">LCI/LCA</h4>
            <p class="text-sm">
              Costumam render 90-100% do CDI e são isentas de IR pra pessoa física. Carência de 90 dias a 3 anos, então só servem pra capital que você não vai mexer nesse prazo. Também cobertas pelo FGC.
            </p>
          </div>
        </div>

        <h2>Perguntas Frequentes sobre Juros Compostos</h2>

        <div class="space-y-4">
          <details
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Poupança ou Tesouro Selic: qual rende mais?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Tesouro Selic SEMPRE rende mais que poupança. Em 2026, com Selic em 12%, poupança rende 6,5% a.a. (70% da Selic + TR), Tesouro Selic rende ~12% a.a. (descontado 15% IR após 2 anos = 10,2% líquido). Em 20 anos com R$ 500/mês, a diferença passa de R$ 165 mil. A única vantagem da poupança é simplicidade extrema. Pra qualquer valor acima de R$ 100, Tesouro Selic é estritamente melhor.
            </p>
          </details>

          <details
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between">
              LCI e LCA valem a pena com juros compostos?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              Sim, especialmente pra investidor com IR alto. LCI/LCA são isentas, então 95% CDI rende como ~11,4% a.a. líquido. Comparado a CDB de 110% CDI (rende ~11,2% a.a. líquido após 15% IR), LCI/LCA empata ou ganha. Desvantagem: prazo de carência de 90 dias a 3 anos. Use pra capital que você não vai precisar nesse prazo.
            </p>
          </details>

          <details
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <summary class="cursor-pointer list-none flex items-center justify-between">
              Como funciona a Regra de 72?
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm">
              A Regra de 72 estima em quanto tempo seu dinheiro dobra: divida 72 pela taxa anual. A 6% a.a. = 12 anos. A 10% a.a. = 7,2 anos. A 12% a.a. = 6 anos. A 15% = 4,8 anos. É uma aproximação muito boa pra taxas entre 6% e 15%. Tripla? Use Regra de 114. Quadruplicar? Regra de 144.
            </p>
          </details>

          <details
            class="group brand-card border p-4"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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

      <!-- Rankings Relacionados -->
      <div
        class="mt-8 flex flex-col gap-4 rounded-[30px] p-6"
        :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
      >
        <div>
          <h2>Rankings Relacionados</h2>
          <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">
            Explore listas atualizadas diariamente com os melhores ativos da B3 para complementar sua análise.
          </p>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            v-for="r in relatedRankings"
            :key="r.to"
            :to="r.to"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
            }"
          >
            <UIcon :name="r.icon" class="text-secondary size-8 shrink-0" />
            <div>
              <h3>{{ r.title }}</h3>
              <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">{{ r.sub }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Calculadoras Relacionadas -->
      <div
        class="flex flex-col gap-4 rounded-[30px] p-6"
        :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))' }"
      >
        <h2>Outras Calculadoras</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <NuxtLink
            to="/calculadora/acoes"
            class="group flex items-center gap-4 brand-card border p-4 transition hover:border-secondary/50"
            :style="{
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
              backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
              borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
          backgroundColor: 'color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background))',
          borderColor: 'color-mix(in srgb, var(--brand-border) 50%, transparent)',
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
        :buttons="[
          { label: 'Criar conta grátis', to: '/auth/register', icon: 'i-lucide-arrow-right', variant: 'primary' },
          { label: 'Ver mais guias', to: '/guias', variant: 'outline' },
        ]"
      />
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
const brand = useBrand()
const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
)

// Rankings relacionados — pontes pra dividendos (uma das aplicacoes
// mais buscadas pra capitalizar) e maiores empresas da B3.
const relatedRankings = [
  {
    to: '/ranking/maiores-dividend-yield',
    icon: 'i-lucide-coins',
    title: 'Onde aplicar buscando dividendos',
    sub: 'Top 50 ações e FIIs por DY na B3',
  },
  {
    to: '/ranking/maiores-receitas',
    icon: 'i-lucide-banknote',
    title: 'Maiores empresas da B3',
    sub: 'Receita TTM ranqueada do maior pro menor',
  },
] as const

// Data de atualização dinâmica: 1º dia do mês corrente. Google usa
// dateModified como sinal de frescor; atualizar mensalmente mantém a página
// "fresca" sem trabalho manual. Se houver mudança real na calculadora, um
// bump em `CONTENT_VERSION` força refresh.
const CONTENT_VERSION = '2026-05-01'
const lastUpdated = new Date(CONTENT_VERSION)
const lastUpdatedText = lastUpdated.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})
const lastUpdatedISO = lastUpdated.toISOString()

// ====================================================================
// Cenarios populares — long-tail SEO via deep-links.
// Cada cenario combina aporte+prazo+taxa em uma URL canonica que o
// Compound.vue ja le no mount (via parseNumberParam) e dispara o
// calculo automaticamente. O Google indexa cada combinacao como
// "landing virtual" sem custo de duplicacao de pagina — sitemap+
// canonical apontam pra rota mae, mas snippets capturam queries
// "quanto rende R$ 500 por mes", "rendimento 10 anos 1000 reais", etc.
//
// Mantenha alinhado com os cenarios mais buscados no GSC. Atualizar
// periodicamente conforme novas queries emergem ("quanto rende
// 200 mil", "aposentadoria 5000 reais", etc).
// ====================================================================
const popularScenarios = [
  { label: 'R$ 100/mês por 30 anos', sub: 'Começando do zero', icon: 'i-lucide-sprout', to: '/calculadora/juros-compostos?initial=0&monthly=100&rate=10.5&years=30' },
  { label: 'R$ 500/mês por 20 anos', sub: 'Cenário clássico', icon: 'i-lucide-target', to: '/calculadora/juros-compostos?initial=0&monthly=500&rate=10.5&years=20' },
  { label: 'R$ 1.000/mês por 10 anos', sub: 'Médio prazo', icon: 'i-lucide-zap', to: '/calculadora/juros-compostos?initial=0&monthly=1000&rate=10.5&years=10' },
  { label: 'R$ 2.000/mês por 15 anos', sub: 'Acelerado', icon: 'i-lucide-rocket', to: '/calculadora/juros-compostos?initial=0&monthly=2000&rate=10.5&years=15' },
  { label: 'R$ 10.000 inicial + R$ 500/mês', sub: 'Com capital inicial', icon: 'i-lucide-piggy-bank', to: '/calculadora/juros-compostos?initial=10000&monthly=500&rate=10.5&years=20' },
  { label: 'R$ 50.000 inicial sem aporte', sub: 'Renda passiva', icon: 'i-lucide-wallet', to: '/calculadora/juros-compostos?initial=50000&monthly=0&rate=10.5&years=20' },
  { label: 'Aposentadoria — R$ 1.000/mês 35 anos', sub: 'Começando aos 30', icon: 'i-lucide-armchair', to: '/calculadora/juros-compostos?initial=0&monthly=1000&rate=10.5&years=35' },
  { label: '1 milhão em 20 anos', sub: 'Quanto investir por mês', icon: 'i-lucide-trophy', to: '/calculadora/juros-compostos?initial=0&monthly=1300&rate=10.5&years=20' },
  { label: 'Tesouro Selic — R$ 500/mês', sub: 'Taxa ~12% a.a.', icon: 'i-lucide-shield-check', to: '/calculadora/juros-compostos?initial=0&monthly=500&rate=12&years=20' },
  { label: 'Reserva de emergência', sub: 'R$ 300/mês por 2 anos', icon: 'i-lucide-life-buoy', to: '/calculadora/juros-compostos?initial=0&monthly=300&rate=12&years=2' },
  { label: 'CDB 110% CDI — R$ 1.000/mês', sub: 'Taxa ~13% a.a.', icon: 'i-lucide-landmark', to: '/calculadora/juros-compostos?initial=0&monthly=1000&rate=13&years=10' },
  { label: 'Bolsa B3 — R$ 500/mês', sub: 'Taxa histórica ~14% a.a.', icon: 'i-lucide-bar-chart-3', to: '/calculadora/juros-compostos?initial=0&monthly=500&rate=14&years=20' },
] as const

// FAQs duplicados aqui pra manter a fonte unica entre o HTML
// (renderizado nos `<details>`) e o FAQPage schema (mainEntity).
// Antes o schema tinha so 3 perguntas e o HTML 11 — Google ignora
// FAQs nao espelhados, perdendo rich snippet em 8 perguntas. Agora
// um array so popula os dois lados.
const faqItems = [
  {
    q: 'Qual a diferença entre juros simples e compostos?',
    a: 'Juros simples incidem apenas sobre o capital inicial, resultando em crescimento linear. Juros compostos incidem sobre o capital + rendimentos acumulados, gerando crescimento exponencial. Exemplo: R$ 1.000 a 10% a.a. por 10 anos rende R$ 2.000 com juros simples, mas R$ 2.594 com compostos. Em prazos longos a diferença é gigante.',
  },
  {
    q: 'Qual é uma taxa de retorno realista para investimentos no Brasil?',
    a: 'Depende do produto: Tesouro Selic e CDBs de bancões pagam ~CDI (12-13% a.a. em 2026). Tesouro IPCA+ paga IPCA + 6% a.a. (~10-12% nominal). FIIs costumam render 8-12% a.a. em dividendos + valorização. Bolsa B3 historicamente entrega 12-15% a.a., mas com forte volatilidade. Carteira diversificada (60% renda variável + 40% renda fixa) tende a 10-12% a.a. no longo prazo.',
  },
  {
    q: 'É melhor investir tudo no início ou fazer aportes mensais?',
    a: 'Se você tem um valor grande disponível, investir tudo no início geralmente rende mais porque o dinheiro fica mais tempo aplicado. Aportes mensais têm vantagens: reduzem risco de timing (você compra em diferentes momentos), facilitam disciplina financeira e permitem começar mesmo sem muito capital. O ideal é combinar: investir o que tem disponível + manter aportes regulares automáticos.',
  },
  {
    q: 'Quanto tempo leva para dobrar meu dinheiro? (Regra de 72)',
    a: 'Use a Regra de 72: divida 72 pela taxa de juros anual para saber em quantos anos seu dinheiro dobra. A 6% a.a. = 12 anos (72÷6). A 10% a.a. = 7,2 anos (72÷10). A 12% a.a. = 6 anos (72÷12). A 15% a.a. = 4,8 anos (72÷15). É uma aproximação muito precisa para taxas entre 6% e 15%.',
  },
  {
    q: 'Poupança ou Tesouro Selic: qual rende mais?',
    a: 'Tesouro Selic SEMPRE rende mais que poupança. Em 2026, com Selic em 12%, poupança rende 6,5% a.a. (70% da Selic + TR), Tesouro Selic rende ~12% a.a. (descontado 15% IR após 2 anos = 10,2% líquido). Em 20 anos com R$ 500/mês, a diferença passa de R$ 165 mil. A única vantagem da poupança é simplicidade extrema. Pra qualquer valor acima de R$ 100, Tesouro Selic é estritamente melhor.',
  },
  {
    q: 'LCI e LCA valem a pena com juros compostos?',
    a: 'Sim, especialmente pra investidor com IR alto. LCI/LCA são isentas, então 95% CDI rende como ~11,4% a.a. líquido. Comparado a CDB de 110% CDI (rende ~11,2% a.a. líquido após 15% IR), LCI/LCA empata ou ganha. Desvantagem: prazo de carência de 90 dias a 3 anos. Use pra capital que você não vai precisar nesse prazo.',
  },
  {
    q: 'Como funciona a Regra de 72?',
    a: 'A Regra de 72 estima em quanto tempo seu dinheiro dobra: divida 72 pela taxa anual. A 6% a.a. = 12 anos. A 10% a.a. = 7,2 anos. A 12% a.a. = 6 anos. A 15% = 4,8 anos. É uma aproximação muito boa pra taxas entre 6% e 15%. Tripla? Use Regra de 114. Quadruplicar? Regra de 144.',
  },
  {
    q: 'Os impostos afetam os juros compostos? Quanto?',
    a: 'Sim, e bastante. Renda fixa tem IR regressivo: 22,5% (até 180 dias) → 20% → 17,5% → 15% (após 720 dias). Ações têm 15% sobre ganho de capital se vendas mensais > R$ 20 mil; dividendos isentos. FIIs têm dividendos isentos e 20% sobre ganho de capital. LCI/LCA são isentos. Idealmente simule com retornos líquidos: subtraia ~15-20% nas projeções de longo prazo.',
  },
  {
    q: 'Devo considerar a inflação no cálculo dos juros compostos?',
    a: 'Absolutamente. Se você rende 10% mas a inflação foi 5%, seu retorno real é cerca de 5% (poder de compra). Para metas de longo prazo (aposentadoria, educação dos filhos), pense sempre em taxas reais (acima da inflação). No Brasil, inflação histórica média gira em 4-6% a.a. Busque retornos que entreguem pelo menos 5-8% acima da inflação após impostos.',
  },
  {
    q: 'Posso usar essa calculadora para qualquer tipo de investimento?',
    a: 'Sim, mas com escopos diferentes: para renda fixa (Tesouro, CDB, LCI/LCA) o resultado é bem preciso, já que a taxa é contratada. Para ações e FIIs, use médias históricas, mas lembre que o retorno real flutua, alguns anos sobem 30%, outros caem 20%. Para análise de ações específicas com dados reais use o nosso simulador de ações.',
  },
  {
    q: 'Qual o impacto de aumentar o aporte mensal em 20%?',
    a: 'Bem maior do que parece. Investindo R$ 500/mês a 10% a.a. por 20 anos: R$ 380 mil. Aumentando 20% para R$ 600/mês: R$ 458 mil. Diferença de R$ 78 mil. Em 30 anos a diferença passa de R$ 200 mil. Pequenos aumentos consistentes em aportes mensais valem mais do que grandes aportes esporádicos.',
  },
  {
    q: 'Com que frequência devo revisar meus investimentos?',
    a: 'Revise a estratégia geral a cada 6-12 meses ou em mudanças significativas (aumento de renda, novo objetivo, evento de mercado). Evite mexer em investimentos de longo prazo com frequência, isso quebra o efeito dos juros compostos e pode disparar IR. Mantenha a disciplina: aporte automático mensal + revisão semestral é o suficiente.',
  },
  {
    q: 'Qual a importância de começar a investir cedo?',
    a: 'Decisiva. R$ 300/mês a 10% a.a.: começando aos 25 até os 65 (40 anos) = R$ 1,9 milhão. Aos 35 até 65 (30 anos) = R$ 679 mil. Aos 45 até 65 (20 anos) = R$ 229 mil. Cada década perdida custa ~3x o valor final. Mesmo R$ 50/mês começando aos 20 supera R$ 500/mês começando aos 40, em montante final.',
  },
  {
    q: 'Como compartilhar uma simulação específica?',
    a: `Basta copiar a URL com os parâmetros: ${brand.url || 'https://redentia.com.br'}/calculadora/juros-compostos?initial=10000&monthly=500&rate=10.5&years=20 já abre a calculadora preenchida e calcula automaticamente. Útil pra mandar para o cônjuge, planejador financeiro ou salvar a meta nos favoritos.`,
  },
] as const

const pageTitle = `Calculadora de Juros Compostos 2026 - Grátis | ${brand.name}`
const pageDescription =
  'Calcule juros compostos com aportes mensais. Poupança vs Tesouro Selic vs CDB, regra de 72, simulação 5 a 30 anos. Gráfico interativo. Grátis.'

usePageSeo({
  title: pageTitle,
  description: pageDescription,
  path: '/calculadora/juros-compostos',
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Calculadoras', path: '/calculadora' },
    { name: 'Juros Compostos', path: '/calculadora/juros-compostos' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `Calculadora de Juros Compostos ${brand.name}`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
      dateModified: lastUpdatedISO,
      description:
        'Calculadora gratuita de juros compostos com aportes mensais. Mostra evolução patrimonial em gráfico interativo, tabela comparativa por horizonte (5, 10, 20, 30 anos), comparação simples vs compostos e cenários populares pré-preenchidos via URL.',
      featureList: [
        'Cálculo de juros compostos com aportes mensais',
        'Simulação de 1 a 40 anos',
        'Gráfico de evolução patrimonial mês a mês',
        'Comparação de cenários com taxas distintas',
        'Regra de 72 integrada',
        'Tabela de rendimento por horizonte temporal',
        'Deep-link compartilhável com inputs pré-preenchidos',
        'Cenários populares 1 clique (R$ 100, R$ 500, R$ 1.000/mês)',
        'Suporta capitalização ao ano e ao mês',
      ],
      about: [
        { '@type': 'Organization', name: 'Banco Central do Brasil', url: 'https://www.bcb.gov.br' },
        { '@type': 'Organization', name: 'B3', url: 'https://www.b3.com.br' },
        { '@type': 'Thing', name: 'Juros compostos' },
        { '@type': 'Thing', name: 'Regra de 72' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    },
  ],
})

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})
</script>

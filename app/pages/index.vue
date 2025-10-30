<template>
  <div class="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
    <!-- Hero Section -->
    <section class="relative overflow-hidden px-4 pb-20 pt-32 md:px-6 md:pb-32 md:pt-40">
      <!-- Animated background -->
      <div class="absolute inset-0">
        <div class="absolute inset-0 bg-gradient-to-br from-secondary/20 via-transparent to-blue-500/20 animate-gradient"></div>
        <div class="absolute inset-0 bg-[url('/assets/images/blue-bg.png')] bg-cover opacity-10"></div>
        <div class="absolute top-20 left-10 h-72 w-72 rounded-full bg-secondary/10 blur-3xl animate-pulse"></div>
        <div class="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div class="relative mx-auto max-w-7xl">
        <div class="flex flex-col items-center text-center">
          <div class="animate-fade-in-up">
            <IconLogoFull class="mb-6 h-12 fill-white md:mb-8 md:h-16" />
          </div>
          
          <h1 class="mb-4 max-w-5xl px-2 text-3xl font-bold text-white sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl xl:text-7xl !leading-[1] animate-fade-in-up delay-100">
            Invista com
            <br class="sm:hidden" />
            <span class="bg-gradient-to-r from-secondary via-green-400 to-secondary bg-clip-text text-transparent animate-gradient-x !leading-1">
              Inteligência Artificial
            </span>
          </h1>
          
          <p class="mb-6 max-w-2xl px-2 text-base leading-relaxed text-gray-300 sm:text-lg md:mb-8 md:text-xl animate-fade-in-up delay-200">
            Acompanhe seus investimentos, receba insights personalizados e tome decisões
            mais inteligentes com nossa assessoria de IA.
          </p>
          
          <div class="flex w-full flex-col items-center justify-center gap-3 px-4 sm:flex-row sm:gap-4 animate-fade-in-up delay-300">
            <UButton
              to="/auth/register"
              color="secondary"
              size="xl"
              icon="i-lucide-rocket"
              class="group w-full px-6 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-secondary/50 sm:w-auto sm:px-8"
            >
              Começar Gratuitamente
            </UButton>
            <UButton
              to="/auth/login"
              color="white"
              variant="outline"
              size="xl"
              icon="i-lucide-log-in"
              class="w-full px-6 transition-all hover:scale-105 hover:bg-white/10 sm:w-auto sm:px-8"
            >
              Fazer Login
            </UButton>
          </div>
          
          <div class="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400 sm:gap-6 sm:text-sm md:mt-12 md:gap-8 animate-fade-in-up delay-400">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-shield-check" class="text-secondary size-4 sm:size-5" />
              <span>100% Seguro</span>
            </div>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-zap" class="text-secondary size-4 sm:size-5" />
              <span class="whitespace-nowrap">Dados em Tempo Real</span>
            </div>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-users" class="text-secondary size-4 sm:size-5" />
              <span class="whitespace-nowrap">+10k Investidores</span>
            </div>
          </div>

          <!-- Animated stats -->
          <div class="mt-10 grid w-full max-w-3xl grid-cols-3 gap-4 px-4 sm:gap-6 md:mt-16 md:gap-8 animate-fade-in-up delay-500">
            <div class="text-center">
              <div class="text-2xl font-bold text-secondary mb-1 sm:text-3xl md:text-4xl md:mb-2" ref="statsCounter1">0</div>
              <div class="text-[10px] text-gray-400 sm:text-xs md:text-sm">Ativos Disponíveis</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-secondary mb-1 sm:text-3xl md:text-4xl md:mb-2" ref="statsCounter2">0M</div>
              <div class="text-[10px] text-gray-400 sm:text-xs md:text-sm">Em Volume</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-secondary mb-1 sm:text-3xl md:text-4xl md:mb-2" ref="statsCounter3">0%</div>
              <div class="text-[10px] text-gray-400 sm:text-xs md:text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <AtomsTickerCarousel class="w-full mt-5" no-control big />

    <!-- Market Overview Section -->
    <section class="px-4 py-12 md:px-6 md:py-20">
      <div class="mx-auto max-w-7xl">
        <div class="mb-12 text-center md:mb-16">
          <h2 class="mb-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:mb-4 md:text-4xl">
            Acompanhe o Mercado em Tempo Real
          </h2>
          <p class="text-sm text-gray-400 sm:text-base md:text-lg">
            Dados atualizados de ações, FIIs e muito mais
          </p>
        </div>

        <div class="mb-8 grid gap-6 md:mb-12 md:grid-cols-2 md:gap-8">
          <!-- IBOV Card -->
          <div class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/20 md:p-8">
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </div>
            
            <div class="relative flex flex-col gap-4">
              <div class="mb-2 flex items-center gap-2">
                <div class="h-2 w-2 animate-pulse rounded-full bg-green-500 shadow-lg shadow-green-500/50 md:h-3 md:w-3"></div>
                <span class="text-xs font-medium text-green-400 uppercase tracking-wider md:text-sm">Ao Vivo</span>
              </div>
              
              <h3 class="mb-1 text-xl font-bold text-white flex items-center gap-2 md:mb-2 md:text-2xl">
                IBOVESPA
                <UIcon name="i-lucide-trending-up" class="size-5 text-green-400 animate-bounce-subtle md:size-6" />
              </h3>
              
              <p class="mb-1 text-3xl font-bold text-green-400 tabular-nums sm:text-4xl md:text-5xl">
                {{ ibovIndicator }}
              </p>
              
              <p class="text-xs text-gray-400 leading-tight md:text-sm md:leading-normal">
                Índice Bovespa - principal indicador de desempenho das ações
              </p>
            </div>
          </div>

          <!-- IFIX Card -->
          <div class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 md:p-8">
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </div>
            
            <div class="relative flex flex-col gap-4">
              <div class="mb-2 flex items-center gap-2">
                <div class="h-2 w-2 animate-pulse rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 md:h-3 md:w-3"></div>
                <span class="text-xs font-medium text-blue-400 uppercase tracking-wider md:text-sm">Ao Vivo</span>
              </div>
              
              <h3 class="mb-1 text-xl font-bold text-white flex items-center gap-2 md:mb-2 md:text-2xl">
                IFIX
                <UIcon name="i-lucide-trending-up" class="size-5 text-blue-400 animate-bounce-subtle md:size-6" />
              </h3>
              
              <p class="mb-1 text-3xl font-bold text-blue-400 tabular-nums sm:text-4xl md:text-5xl">
                {{ ifixIndicator }}
              </p>
              
              <p class="text-xs text-gray-400 leading-tight md:text-sm md:leading-normal">
                Índice de Fundos Imobiliários - desempenho dos FIIs
              </p>
            </div>
          </div>
        </div>

        <!-- Chart Preview -->
        <div class="rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 backdrop-blur-xl md:p-8">
          <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h3 class="text-2xl font-semibold text-white">Cotação do IBOV</h3>
            <UButtonGroup orientation="horizontal" variant="soft">
              <UButton
                color="neutral"
                :variant="selectedTimeRange === 'month' ? 'soft' : 'link'"
                label="Mês"
                :disabled="loading"
                @click="selectedTimeRange = 'month'"
              />
              <UButton
                color="neutral"
                :variant="selectedTimeRange === 'year' ? 'soft' : 'link'"
                label="Ano"
                :disabled="loading"
                @click="selectedTimeRange = 'year'"
              />
              <UButton
                color="neutral"
                :variant="selectedTimeRange === '3years' ? 'soft' : 'link'"
                label="3 anos"
                :disabled="loading"
                @click="selectedTimeRange = '3years'"
              />
            </UButtonGroup>
          </div>
          <AtomsGraphLine
            :data="ibovChartData"
            :legend="ibovChartLabel"
            :height="350"
            :loading="loading"
          />
        </div>
      </div>
    </section>

    <!-- Interactive Calculator Section -->
    <section class="px-4 py-12 md:px-6 md:py-20">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 text-center md:mb-12">
          <div class="mb-3 flex items-center justify-center gap-2 md:mb-4">
            <UIcon name="i-lucide-calculator" class="text-secondary size-8 md:size-12" />
          </div>
          <h2 class="mb-2 text-2xl font-bold leading-tight text-white sm:text-3xl md:mb-4 md:text-4xl">
            Calculadora Inteligente
          </h2>
          <p class="text-sm text-gray-400 sm:text-base md:text-lg">
            Simule seus investimentos e veja quanto pode ganhar
          </p>
        </div>

        <div class="relative">
          <div
            v-if="showCalculatorOverlay"
            @click="redirectToLogin('calculadora')"
            class="absolute inset-0 z-10 flex cursor-pointer items-center justify-center rounded-2xl bg-black/60 backdrop-blur-md transition-all hover:bg-black/70 p-4 md:rounded-3xl"
          >
            <div class="text-center transform transition-all hover:scale-105 max-w-md">
              <div class="relative mb-4 md:mb-6">
                <div class="absolute inset-0 animate-ping opacity-20">
                  <UIcon name="i-lucide-lock" class="text-secondary mx-auto size-12 md:size-16" />
                </div>
                <UIcon name="i-lucide-lock" class="text-secondary mx-auto size-12 relative md:size-16" />
              </div>
              
              <h3 class="mb-2 text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl">
                Faça login para calcular
              </h3>
              <p class="mb-4 text-sm leading-relaxed text-gray-300 px-2 sm:text-base md:mb-6">
                Crie sua conta gratuitamente e acesse a calculadora completa com
                <span class="text-secondary font-semibold">histórico ilimitado</span>
              </p>
              
              <UButton
                to="/auth/register"
                color="secondary"
                size="xl"
                icon="i-lucide-sparkles"
                class="w-full px-6 transition-all hover:scale-110 hover:shadow-2xl hover:shadow-secondary/50 sm:w-auto sm:px-8"
              >
                Criar Conta Grátis
              </UButton>
              
              <p class="mt-3 text-xs text-gray-400 md:mt-4 md:text-sm">
                Sem cartão de crédito • Acesso imediato
              </p>
            </div>
          </div>

          <div
            class="rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 backdrop-blur-xl md:p-8"
            @click="showCalculatorOverlay = true"
          >
            <div class="mb-4 flex items-center gap-2 md:mb-6 md:gap-3">
              <UIcon name="i-lucide-trending-up" class="text-secondary size-5 md:size-6" />
              <h3 class="text-base font-bold text-white sm:text-lg md:text-xl">
                Simulação de Juros Compostos
              </h3>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <UFormField label="Valor Inicial (R$)" name="initialValue">
                <UInputNumber
                  :model-value="10000"
                  placeholder="10000"
                  size="lg"
                  variant="soft"
                  disabled
                  class="w-full"
                  :format-options="{
                    style: 'currency',
                    currency: 'BRL',
                  }"
                />
              </UFormField>

              <UFormField label="Aporte Mensal (R$)" name="monthlyValue">
                <UInputNumber
                  :model-value="500"
                  placeholder="500"
                  size="lg"
                  variant="soft"
                  disabled
                  class="w-full"
                  :format-options="{
                    style: 'currency',
                    currency: 'BRL',
                  }"
                />
              </UFormField>

              <UFormField label="Taxa de Juros (%)" name="interestRate">
                <UInput
                  :model-value="'10.5'"
                  type="number"
                  variant="soft"
                  placeholder="10.5"
                  size="lg"
                  disabled
                  class="flex-1"
                />
              </UFormField>

              <UFormField label="Período (Anos)" name="period">
                <UInput
                  :model-value="'10'"
                  type="number"
                  placeholder="10"
                  size="lg"
                  variant="soft"
                  disabled
                  class="flex-1"
                />
              </UFormField>
            </div>

            <UButton
              color="secondary"
              size="xl"
              block
              icon="i-lucide-calculator"
              class="mt-6"
              disabled
            >
              Calcular Simulação
            </UButton>

            <div class="mt-8 grid grid-cols-1 gap-4 opacity-50 md:grid-cols-3">
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4 backdrop-blur">
                <p class="text-[13px] font-extralight text-gray-400">
                  Total Investido
                </p>
                <p class="text-2xl font-bold text-white">R$ 70.000,00</p>
              </div>
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4 backdrop-blur">
                <p class="text-[13px] font-extralight text-gray-400">
                  Total de Juros
                </p>
                <p class="text-2xl font-bold text-green-400">R$ 48.562,31</p>
              </div>
              <div class="flex flex-col gap-2 rounded-2xl bg-white/5 p-4 backdrop-blur">
                <p class="text-[13px] font-extralight text-gray-400">Valor Final</p>
                <p class="text-secondary text-2xl font-bold">R$ 118.562,31</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- AI Chat Section -->
    <section class="px-4 py-12 md:px-6 md:py-20">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 text-center md:mb-12">
          <div class="mb-3 flex items-center justify-center gap-2 md:mb-4">
            <IconAi class="fill-secondary h-8 md:h-12" />
          </div>
          <h2 class="mb-2 text-2xl font-bold leading-tight text-white sm:text-3xl md:mb-4 md:text-4xl">
            Assessoria com Inteligência Artificial
          </h2>
          <p class="text-sm text-gray-400 sm:text-base md:text-lg">
            Tire dúvidas, compare ativos e receba análises personalizadas
          </p>
        </div>

        <div class="relative mx-auto max-w-4xl">
          <div
            v-if="showChatOverlay"
            @click="redirectToLogin('chat')"
            class="absolute inset-0 z-10 flex cursor-pointer items-center justify-center rounded-2xl bg-black/60 backdrop-blur-md transition-all hover:bg-black/70 p-4 md:rounded-3xl"
          >
            <div class="text-center transform transition-all hover:scale-105 max-w-md">
              <div class="relative mb-4 md:mb-6">
                <div class="absolute inset-0 animate-ping opacity-20">
                  <IconAi class="fill-secondary mx-auto h-12 md:h-16" />
                </div>
                <IconAi class="fill-secondary mx-auto h-12 relative md:h-16" />
              </div>
              
              <h3 class="mb-2 text-xl font-bold leading-tight text-white sm:text-2xl md:text-3xl">
                Converse com nossa IA
              </h3>
              <p class="mb-4 text-sm leading-relaxed text-gray-300 px-2 sm:text-base md:mb-6">
                Faça login e tenha acesso ilimitado à assessoria inteligente
              </p>
              
              <UButton
                to="/auth/login"
                color="secondary"
                size="xl"
                icon="i-lucide-message-circle"
                class="w-full px-6 transition-all hover:scale-110 hover:shadow-2xl hover:shadow-secondary/50 sm:w-auto sm:px-8"
              >
                Acessar Assessoria
              </UButton>
              
              <p class="mt-3 text-xs text-gray-400 md:mt-4 md:text-sm">
                Respostas instantâneas • Análises personalizadas
              </p>
            </div>
          </div>

          <div
            class="rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 backdrop-blur-xl md:p-8"
            @click="showChatOverlay = true"
          >
            <div class="mb-6 flex flex-col items-center gap-4">
              <h3 class="text-center text-2xl text-white">Faça alguma pergunta</h3>
              <p class="text-center text-[13px] font-light text-gray-400">
                Tire dúvidas sobre investimentos, compare ativos e peça análises em
                linguagem simples.
              </p>
            </div>

            <div class="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3">
              <button
                v-for="(suggestion, idx) in chatSuggestions"
                :key="idx"
                class="flex h-[120px] items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 p-3 text-[13px] font-medium opacity-70 hover:opacity-100 hover:from-white/20 transition-all"
                disabled
              >
                {{ suggestion }}
              </button>
            </div>

            <div class="space-y-4 opacity-60">
              <div class="flex items-start gap-3">
                <IconLogo class="mt-1 w-6 fill-white flex-shrink-0" />
                <div class="flex-1 rounded-lg bg-white/5 p-4 backdrop-blur">
                  <p class="text-sm text-white">
                    Olá! Sou a assistente virtual da Redentia. Como posso ajudar você
                    hoje?
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-6 w-full rounded-lg bg-black/20 p-4 backdrop-blur">
              <UTextarea
                placeholder="Faça qualquer pergunta..."
                size="md"
                rows="2"
                disabled
                class="w-full"
                :ui="{
                  base: 'text-[14px] bg-transparent ring-0 placeholder:text-white/40',
                }"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="px-4 py-12 md:px-6 md:py-20">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 text-center md:mb-12">
          <h2 class="mb-2 text-2xl font-bold leading-tight text-white sm:text-3xl md:mb-4 md:text-4xl">
            Tudo que você precisa para investir melhor
          </h2>
          <p class="text-sm text-gray-400 sm:text-base md:text-lg">
            Ferramentas profissionais ao seu alcance
          </p>
        </div>

        <div class="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <!-- Feature 1 -->
          <div class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer md:p-8">
            <div class="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="relative">
              <div class="mb-3 inline-flex items-center justify-center rounded-xl bg-purple-500/20 p-3 transition-all group-hover:scale-110 group-hover:rotate-3 md:mb-4 md:rounded-2xl md:p-4">
                <UIcon name="i-lucide-line-chart" class="text-purple-400 size-8 md:size-12" />
              </div>
              
              <h3 class="mb-1 text-lg font-bold text-white group-hover:text-purple-300 transition-colors md:mb-2 md:text-xl">
                Gráficos Avançados
              </h3>
              
              <p class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed md:text-base">
                Visualize o desempenho dos seus ativos com gráficos interativos e em tempo real
              </p>
              
              <div class="mt-3 flex items-center gap-2 text-purple-400 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 md:mt-4">
                <span class="text-xs font-medium md:text-sm">Saiba mais</span>
                <UIcon name="i-lucide-arrow-right" class="size-3 md:size-4" />
              </div>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500/10 to-transparent p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/20 cursor-pointer md:p-8">
            <div class="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="relative">
              <div class="mb-3 inline-flex items-center justify-center rounded-xl bg-green-500/20 p-3 transition-all group-hover:scale-110 group-hover:rotate-3 md:mb-4 md:rounded-2xl md:p-4">
                <UIcon name="i-lucide-wallet" class="text-green-400 size-8 md:size-12" />
              </div>
              
              <h3 class="mb-1 text-lg font-bold text-white group-hover:text-green-300 transition-colors md:mb-2 md:text-xl">
                Gestão de Carteira
              </h3>
              
              <p class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed md:text-base">
                Acompanhe todos os seus investimentos em um só lugar de forma simples
              </p>
              
              <div class="mt-3 flex items-center gap-2 text-green-400 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 md:mt-4">
                <span class="text-xs font-medium md:text-sm">Saiba mais</span>
                <UIcon name="i-lucide-arrow-right" class="size-3 md:size-4" />
              </div>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/10 to-transparent p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer md:p-8">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="relative">
              <div class="mb-3 inline-flex items-center justify-center rounded-xl bg-blue-500/20 p-3 transition-all group-hover:scale-110 group-hover:rotate-3 md:mb-4 md:rounded-2xl md:p-4">
                <UIcon name="i-lucide-trending-up" class="text-blue-400 size-8 md:size-12" />
              </div>
              
              <h3 class="mb-1 text-lg font-bold text-white group-hover:text-blue-300 transition-colors md:mb-2 md:text-xl">
                Análise de Dividendos
              </h3>
              
              <p class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed md:text-base">
                Acompanhe seus proventos e veja o histórico completo de pagamentos
              </p>
              
              <div class="mt-3 flex items-center gap-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 md:mt-4">
                <span class="text-xs font-medium md:text-sm">Saiba mais</span>
                <UIcon name="i-lucide-arrow-right" class="size-3 md:size-4" />
              </div>
            </div>
          </div>

          <!-- Feature 4 -->
          <div class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500/10 to-transparent p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-500/20 cursor-pointer md:p-8">
            <div class="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="relative">
              <div class="mb-3 inline-flex items-center justify-center rounded-xl bg-yellow-500/20 p-3 transition-all group-hover:scale-110 group-hover:rotate-3 md:mb-4 md:rounded-2xl md:p-4">
                <UIcon name="i-lucide-bell" class="text-yellow-400 size-8 md:size-12" />
              </div>
              
              <h3 class="mb-1 text-lg font-bold text-white group-hover:text-yellow-300 transition-colors md:mb-2 md:text-xl">
                Alertas Inteligentes
              </h3>
              
              <p class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed md:text-base">
                Receba notificações sobre mudanças importantes nos seus investimentos
              </p>
              
              <div class="mt-3 flex items-center gap-2 text-yellow-400 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 md:mt-4">
                <span class="text-xs font-medium md:text-sm">Saiba mais</span>
                <UIcon name="i-lucide-arrow-right" class="size-3 md:size-4" />
              </div>
            </div>
          </div>

          <!-- Feature 5 -->
          <div class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500/10 to-transparent p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/20 cursor-pointer md:p-8">
            <div class="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="relative">
              <div class="mb-3 inline-flex items-center justify-center rounded-xl bg-red-500/20 p-3 transition-all group-hover:scale-110 group-hover:rotate-3 md:mb-4 md:rounded-2xl md:p-4">
                <UIcon name="i-lucide-shield" class="text-red-400 size-8 md:size-12" />
              </div>
              
              <h3 class="mb-1 text-lg font-bold text-white group-hover:text-red-300 transition-colors md:mb-2 md:text-xl">
                Segurança Total
              </h3>
              
              <p class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed md:text-base">
                Seus dados protegidos com as melhores práticas de segurança
              </p>
              
              <div class="mt-3 flex items-center gap-2 text-red-400 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 md:mt-4">
                <span class="text-xs font-medium md:text-sm">Saiba mais</span>
                <UIcon name="i-lucide-arrow-right" class="size-3 md:size-4" />
              </div>
            </div>
          </div>

          <!-- Feature 6 -->
          <div class="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500/10 to-transparent p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-pink-500/20 cursor-pointer md:p-8">
            <div class="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="relative">
              <div class="mb-3 inline-flex items-center justify-center rounded-xl bg-pink-500/20 p-3 transition-all group-hover:scale-110 group-hover:rotate-3 md:mb-4 md:rounded-2xl md:p-4">
                <UIcon name="i-lucide-smartphone" class="text-pink-400 size-8 md:size-12" />
              </div>
              
              <h3 class="mb-1 text-lg font-bold text-white group-hover:text-pink-300 transition-colors md:mb-2 md:text-xl">
                App Mobile
              </h3>
              
              <p class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed md:text-base">
                Acesse de qualquer lugar com nosso aplicativo para iOS e Android
              </p>
              
              <div class="mt-3 flex items-center gap-2 text-pink-400 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 md:mt-4">
                <span class="text-xs font-medium md:text-sm">Saiba mais</span>
                <UIcon name="i-lucide-arrow-right" class="size-3 md:size-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Top Assets Preview -->
    <section class="px-4 py-12 md:px-6 md:py-20">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 text-center md:mb-12">
          <h2 class="mb-2 text-2xl font-bold leading-tight text-white sm:text-3xl md:mb-4 md:text-4xl">
            Principais Ativos do Dia
          </h2>
          <p class="text-sm text-gray-400 sm:text-base md:text-lg">
            Veja as maiores altas e baixas em tempo real
          </p>
        </div>

        <!-- Mobile: Scroll horizontal -->
        <div class="relative">
          <div class="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-10 md:hidden pointer-events-none"></div>
          <div class="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-10 md:hidden pointer-events-none"></div>
          
          <div class="flex gap-6 overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 pb-4 snap-x snap-mandatory scrollbar-hide">
            <!-- Top Stocks -->
            <div class="min-w-[300px] md:min-w-0 snap-center flex flex-col gap-3 rounded-3xl bg-gradient-to-br from-green-500/10 to-transparent p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/10">
              <div class="mb-2 flex items-center justify-between">
                <h3 class="text-[18px] font-bold text-white">Maiores Altas</h3>
                <UIcon name="i-lucide-trending-up" class="size-5 text-green-400" />
              </div>
              <div class="flex flex-col gap-2">
                <AtomsTicker
                  v-for="stock in topAssets.top.stocks.slice(0, 5)"
                  :key="stock?.ticker"
                  :stock="stock"
                />
              </div>
              <UButton
                to="/auth/register"
                color="neutral"
                variant="link"
                class="mt-2"
              >
                Ver todos →
              </UButton>
            </div>

            <!-- Top ETFs -->
            <div class="min-w-[300px] md:min-w-0 snap-center flex flex-col gap-3 rounded-3xl bg-gradient-to-br from-blue-500/10 to-transparent p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10">
              <div class="mb-2 flex items-center justify-between">
                <h3 class="text-[18px] font-bold text-white">ETFs em Alta</h3>
                <UIcon name="i-lucide-bar-chart-2" class="size-5 text-blue-400" />
              </div>
              <div class="flex flex-col gap-2">
                <AtomsTicker
                  v-for="stock in topAssets.top.etfs.slice(0, 5)"
                  :key="stock?.ticker"
                  :stock="stock"
                />
              </div>
              <UButton
                to="/auth/register"
                color="neutral"
                variant="link"
                class="mt-2"
              >
                Ver todos →
              </UButton>
            </div>

            <!-- Top REITs -->
            <div class="min-w-[300px] md:min-w-0 snap-center flex flex-col gap-3 rounded-3xl bg-gradient-to-br from-purple-500/10 to-transparent p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10">
              <div class="mb-2 flex items-center justify-between">
                <h3 class="text-[18px] font-bold text-white">FIIs em Destaque</h3>
                <UIcon name="i-lucide-building" class="size-5 text-purple-400" />
              </div>
              <div class="flex flex-col gap-2">
                <AtomsTicker
                  v-for="stock in topAssets.top.reits.slice(0, 5)"
                  :key="stock?.ticker"
                  :stock="stock"
                />
              </div>
              <UButton
                to="/auth/register"
                color="neutral"
                variant="link"
                class="mt-2"
              >
                Ver todos →
              </UButton>
            </div>

            <!-- Bottom Stocks -->
            <div class="min-w-[300px] md:min-w-0 snap-center flex flex-col gap-3 rounded-3xl bg-gradient-to-br from-red-500/10 to-transparent p-6 backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-red-500/10">
              <div class="mb-2 flex items-center justify-between">
                <h3 class="text-[18px] font-bold text-white">Maiores Baixas</h3>
                <UIcon name="i-lucide-trending-down" class="size-5 text-red-400" />
              </div>
              <div class="flex flex-col gap-2">
                <AtomsTicker
                  v-for="stock in topAssets.bottom.stocks.slice(0, 5)"
                  :key="stock?.ticker"
                  :stock="stock"
                />
              </div>
              <UButton
                to="/auth/register"
                color="neutral"
                variant="link"
                class="mt-2"
              >
                Ver todos →
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="px-4 py-12 md:px-6 md:py-20 hidden">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 text-center md:mb-12">
          <h2 class="mb-2 text-2xl font-bold leading-tight text-white sm:text-3xl md:mb-4 md:text-4xl">
            O que nossos usuários dizem
          </h2>
          <p class="text-sm text-gray-400 sm:text-base md:text-lg">
            Histórias reais de quem já usa a Redentia
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <div class="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-xl transition-all hover:shadow-xl md:p-8">
            <div class="mb-4 flex items-center gap-2">
              <div class="flex text-yellow-400">
                <UIcon name="i-lucide-star" class="size-5 fill-current" />
                <UIcon name="i-lucide-star" class="size-5 fill-current" />
                <UIcon name="i-lucide-star" class="size-5 fill-current" />
                <UIcon name="i-lucide-star" class="size-5 fill-current" />
                <UIcon name="i-lucide-star" class="size-5 fill-current" />
              </div>
            </div>
            <p class="mb-6 text-gray-300">
              "A calculadora de investimentos me ajudou a visualizar o crescimento do meu patrimônio. Incrível!"
            </p>
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-full bg-gradient-to-br from-secondary to-green-600"></div>
              <div>
                <p class="font-semibold text-white">Carlos Silva</p>
                <p class="text-sm text-gray-400">Investidor há 3 anos</p>
              </div>
            </div>
          </div>

          <div class="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-xl transition-all hover:shadow-xl md:p-8">
            <div class="mb-4 flex items-center gap-2">
              <div class="flex text-yellow-400">
                <UIcon name="i-lucide-star" class="size-5 fill-current" />
                <UIcon name="i-lucide-star" class="size-5 fill-current" />
                <UIcon name="i-lucide-star" class="size-5 fill-current" />
                <UIcon name="i-lucide-star" class="size-5 fill-current" />
                <UIcon name="i-lucide-star" class="size-5 fill-current" />
              </div>
            </div>
            <p class="mb-6 text-gray-300">
              "A IA responde todas as minhas dúvidas sobre investimentos de forma clara. Recomendo!"
            </p>
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
              <div>
                <p class="font-semibold text-white">Ana Paula</p>
                <p class="text-sm text-gray-400">Investidora iniciante</p>
              </div>
            </div>
          </div>

          <div class="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-xl transition-all hover:shadow-xl md:p-8">
            <div class="mb-4 flex items-center gap-2">
              <div class="flex text-yellow-400">
                <UIcon name="i-lucide-star" class="size-5 fill-current" />
                <UIcon name="i-lucide-star" class="size-5 fill-current" />
                <UIcon name="i-lucide-star" class="size-5 fill-current" />
                <UIcon name="i-lucide-star" class="size-5 fill-current" />
                <UIcon name="i-lucide-star" class="size-5 fill-current" />
              </div>
            </div>
            <p class="mb-6 text-gray-300">
              "Interface moderna e fácil de usar. Consigo acompanhar tudo em tempo real!"
            </p>
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-red-600"></div>
              <div>
                <p class="font-semibold text-white">Ricardo Mendes</p>
                <p class="text-sm text-gray-400">Day trader</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="px-4 py-12 md:px-6 md:py-20">
      <div class="mx-auto max-w-4xl">
        <div class="mb-8 text-center md:mb-12">
          <h2 class="mb-2 text-2xl font-bold leading-tight text-white sm:text-3xl md:mb-4 md:text-4xl">
            Perguntas Frequentes
          </h2>
          <p class="text-sm text-gray-400 sm:text-base md:text-lg">
            Tire suas dúvidas sobre a plataforma
          </p>
        </div>

        <UAccordion
          :items="faqItems"
          :ui="{
            wrapper: 'flex flex-col gap-4',
            item: {
              base: 'rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl transition-all hover:shadow-lg overflow-hidden',
              padding: 'p-6',
            },
          }"
        >
          <template #default="{ item, open }">
            <span class="text-white font-semibold text-left">{{ item.label }}</span>
          </template>

          <template #item="{ item }">
            <p class="text-gray-300 pt-4">{{ item.content }}</p>
          </template>
        </UAccordion>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="px-4 py-12 md:px-6 md:py-20">
      <div class="mx-auto max-w-4xl">
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/20 to-transparent p-8 text-center backdrop-blur-xl border border-secondary/30 md:rounded-3xl md:p-12">
          <!-- Animated background -->
          <div class="absolute inset-0 bg-gradient-to-r from-secondary/10 via-transparent to-blue-500/10 animate-gradient"></div>
          
          <div class="relative">
            <IconLogoFull class="mx-auto mb-4 h-10 fill-white md:mb-6 md:h-12" />
            <h2 class="mb-3 text-2xl font-bold leading-tight text-white sm:text-3xl md:mb-4 md:text-4xl">
              Pronto para começar a investir melhor?
            </h2>
            <p class="mb-6 text-base leading-relaxed text-gray-300 px-2 sm:text-lg md:mb-8 md:text-xl">
              Crie sua conta gratuitamente e tenha acesso a todas as ferramentas
            </p>
            <div class="flex w-full flex-col items-center justify-center gap-3 px-2 sm:flex-row sm:gap-4">
              <UButton
                to="/auth/register"
                color="secondary"
                size="xl"
                icon="i-lucide-user-plus"
                class="w-full px-6 transition-all hover:scale-110 hover:shadow-2xl hover:shadow-secondary/50 sm:w-auto sm:px-8"
              >
                Criar Conta Grátis
              </UButton>
              <UButton
                to="/auth/login"
                color="white"
                variant="outline"
                size="xl"
                icon="i-lucide-log-in"
                class="w-full px-6 transition-all hover:scale-105 sm:w-auto sm:px-8"
              >
                Já tenho conta
              </UButton>
            </div>
            <p class="mt-4 text-xs text-gray-400 md:mt-6 md:text-sm">
              Sem taxa de inscrição • Cancele quando quiser • Suporte 24/7
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script lang="ts" setup>
import type { ChartTimeRange } from '~/types/chart'

const { getTopStocks, getTopETFs, getTopReits, getTopBDRs, getIndiceHistoricPrices } = useAssetsService()

const selectedTimeRange = ref<ChartTimeRange>('month')
const loading = ref(true)
const loadingIndicators = ref(true)

const showCalculatorOverlay = ref(false)
const showChatOverlay = ref(false)

const chatSuggestions = [
  'Qual a diferença entre ações e FIIs?',
  'Como funcionam os dividendos?',
  'O que é diversificação?',
  'Quanto devo investir por mês?',
  'Como escolher boas ações?',
  'Vale a pena investir em ETFs?',
]

const faqItems = [
  {
    label: 'A plataforma é realmente gratuita?',
    content: 'Sim! Por enquanto A Redentia oferece acesso gratuito a todas as funcionalidades principais, incluindo gráficos em tempo real, calculadora de investimentos e assessoria de IA.',
  },
  {
    label: 'Como funciona a assessoria de IA?',
    content: 'Nossa IA é treinada com dados do mercado financeiro e pode responder dúvidas, comparar ativos e fornecer análises personalizadas em linguagem simples.',
  },
  {
    label: 'Os dados são atualizados em tempo real?',
    content: 'Sim! Todos os dados de ações, FIIs e índices são atualizados em tempo real durante o horário de funcionamento da bolsa.',
  },
  {
    label: 'Posso usar no celular?',
    content: 'Sim! A plataforma é totalmente responsiva e funciona perfeitamente em smartphones e tablets. Em breve teremos aplicativos nativos para iOS e Android.',
  },
  {
    label: 'Meus dados estão seguros?',
    content: 'Absolutamente! Utilizamos criptografia de ponta e seguimos as melhores práticas de segurança para proteger suas informações.',
  },
]

const topAssets = ref({
  loading: false,
  top: {
    stocks: [],
    etfs: [],
    reits: [],
    bdrs: [],
  },
  bottom: {
    stocks: [],
    etfs: [],
    reits: [],
    bdrs: [],
  },
})

interface ChartPoint {
  date: string
  value: number
  timestamp: number
}

interface IndiceData {
  name: string
  market_price: number
  price_at: string
}

const ibovChartData = ref<ChartPoint[]>([])
const ibovIndicator = ref('+0,00%')
const ifixIndicator = ref('+0,00%')

const ibovChartLabel = computed(() => [
  {
    label: 'IBOV',
    color: '#10b981',
    value: ibovChartData.value.length > 0 
      ? ibovChartData.value[ibovChartData.value.length - 1].value.toFixed(2)
      : '0'
  }
])

// Refs para os contadores animados
const statsCounter1 = ref<HTMLElement | null>(null)
const statsCounter2 = ref<HTMLElement | null>(null)
const statsCounter3 = ref<HTMLElement | null>(null)

function redirectToLogin(source: string) {
  navigateTo(`/auth/login?redirect=/${source === 'calculadora' ? 'calculadora' : 'help'}`)
}

async function fetchIbovChartData() {
  loading.value = true
  let period: '1mo' | 'ytd' | '3mo' | '12mo' | '3y' | '4y' | '5y' | 'full' = '1mo'
  if (selectedTimeRange.value === 'month') period = '1mo'
  else if (selectedTimeRange.value === 'year') period = '12mo'
  else if (selectedTimeRange.value === '3years') period = '3y'
  else if (selectedTimeRange.value === 'full') period = 'full'
  
  const data = await getIndiceHistoricPrices('ibov', period)
  
  ibovChartData.value = Array.isArray(data)
    ? data.map((item: IndiceData) => ({
        date: item.price_at,
        value: item.market_price,
        timestamp: new Date(item.price_at).getTime(),
      }))
    : []
  loading.value = false
}

async function fetchIndicatorsData() {
  loadingIndicators.value = true
  try {
    const [ibovData, ifixData] = await Promise.all([
      getIndiceHistoricPrices('ibov', '1mo'),
      getIndiceHistoricPrices('ifix', '1mo')
    ])

    if (Array.isArray(ibovData) && ibovData.length > 1) {
      const lastPrice = ibovData[ibovData.length - 1].market_price
      const previousPrice = ibovData[ibovData.length - 2].market_price
      const variation = ((lastPrice - previousPrice) / previousPrice) * 100
      ibovIndicator.value = `${variation >= 0 ? '+' : ''}${variation.toFixed(2)}%`
    }

    if (Array.isArray(ifixData) && ifixData.length > 1) {
      const lastPrice = ifixData[ifixData.length - 1].market_price
      const previousPrice = ifixData[ifixData.length - 2].market_price
      const variation = ((lastPrice - previousPrice) / previousPrice) * 100
      ifixIndicator.value = `${variation >= 0 ? '+' : ''}${variation.toFixed(2)}%`
    }
  } catch (error) {
    console.error('Erro ao buscar dados dos indicadores:', error)
  }
  loadingIndicators.value = false
}

// Animação dos contadores
function animateCounter(element: HTMLElement | null, target: number, suffix: string = '') {
  if (!element) return
  
  const duration = 2000
  const start = 0
  const increment = target / (duration / 16)
  let current = start

  const timer = setInterval(() => {
    current += increment
    if (current >= target) {
      current = target
      clearInterval(timer)
    }
    element.textContent = Math.floor(current) + suffix
  }, 16)
}

onMounted(async () => {
  fetchIbovChartData()
  fetchIndicatorsData()

  // Animar contadores quando aparecerem na tela
  setTimeout(() => {
    animateCounter(statsCounter1.value, 1200, '+')
    animateCounter(statsCounter2.value, 500, 'M+')
    animateCounter(statsCounter3.value, 99, '%')
  }, 500)

  const [
    [topStocks, bottomStocks],
    [topETFs, bottomETFs],
    [topReits, bottomReits],
    [topBDRs, bottomBDRs],
  ] = await Promise.all([
    Promise.all([
      getTopStocks('top', 1000000),
      getTopStocks('bottom', 1000000),
    ]),
    Promise.all([getTopETFs('top', 1000000), getTopETFs('bottom', 1000000)]),
    Promise.all([getTopReits('top', 1000000), getTopReits('bottom', 1000000)]),
    Promise.all([getTopBDRs('top', 1000000), getTopBDRs('bottom', 1000000)]),
  ])

  topAssets.value.top.stocks = topStocks
  topAssets.value.top.etfs = topETFs
  topAssets.value.top.reits = topReits
  topAssets.value.top.bdrs = topBDRs

  topAssets.value.bottom.stocks = bottomStocks
  topAssets.value.bottom.etfs = bottomETFs
  topAssets.value.bottom.reits = bottomReits
  topAssets.value.bottom.bdrs = bottomBDRs
})

watch(selectedTimeRange, () => {
  fetchIbovChartData()
})

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
  layoutTransition: {
    name: 'slide-in',
  },
})
</script>

<style scoped>
@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes gradient-x {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes scroll-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}

.animate-gradient-x {
  background-size: 300% auto;
  animation: gradient-x 3s linear infinite;
}

.bg-300 {
  background-size: 300% auto;
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.animate-bounce-subtle {
  animation: bounce-subtle 2s ease-in-out infinite;
}

.animate-scroll-left {
  animation: scroll-left 20s linear infinite;
}

.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }
.delay-400 { animation-delay: 400ms; }
.delay-500 { animation-delay: 500ms; }
.delay-1000 { animation-delay: 1000ms; }

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

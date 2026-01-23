<template>
  <NuxtLayout
    :name="layoutName"
    container-class="md:px-0"
    :header-bg="!isPriceVisible ? pageGradient : ''"
  >
    <template v-if="!isPriceVisible" #header-branding>
      <div class="flex items-center gap-3">
        <img
          v-if="asset?.logo"
          :src="asset.logo"
          :alt="`Logo de ${assetName}`"
          class="h-9 w-9 rounded-lg object-cover"
        />
        <div class="flex items-center gap-2">
          <span class="text-[25px] font-bold leading-tight text-white">{{
            tickerUpper
          }}</span>
          <div class="flex items-center gap-2 text-[20px] leading-tight">
            <span class="text-white/90">{{ formattedAssetPrice }}</span>
            <span
              v-if="dailyChangePercent !== null"
              class="text-[18px]"
              :class="[
                dailyChangePercent >= 0 ? 'text-green-400' : 'text-red-400',
              ]"
            >
              {{ dailyChangePercent }}%
            </span>
          </div>
        </div>
      </div>
    </template>
    <div class="relative z-10 flex flex-col pt-4">
      <div class="flex flex-col">
        <!-- Hero Section do Ativo -->
        <section class="border-b border-white/10 pb-6">
          <header
            class="mb-6 flex flex-col gap-4 max-md:px-4 md:flex-row md:items-center md:justify-between"
          >
            <div class="flex items-center gap-4">
              <USkeleton
                v-if="isLoadingAsset"
                class="h-14 w-14 rounded-2xl"
              />
              <img
                v-else-if="asset?.logo"
                :src="asset.logo"
                :alt="`Logo de ${assetName}`"
                class="h-14 w-14 rounded-2xl object-cover shadow-lg"
              />
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-3">
                  <h1 class="text-2xl font-bold text-white md:text-3xl">
                    {{ tickerUpper }}
                  </h1>
                  <!-- Badges de info rápida -->
                  <div v-if="!isLoadingAsset" class="flex items-center gap-2">
                    <span
                      v-if="asset?.sector"
                      class="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70"
                    >
                      {{ asset.sector }}
                    </span>
                  </div>
                </div>
                <div
                  ref="priceElement"
                  class="flex items-center gap-3 max-sm:flex-col max-sm:items-start"
                >
                  <USkeleton v-if="isLoadingAsset" class="h-6 w-[120px]" />
                  <template v-else>
                    <span class="text-3xl font-semibold tabular-nums text-white md:text-4xl">
                      R$ {{ asset?.market_price }}
                    </span>
                    <span
                      class="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium"
                      :class="[
                        asset?.change_percent >= 0
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400',
                      ]"
                    >
                      <UIcon
                        :name="asset?.change_percent >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
                        class="h-4 w-4"
                      />
                      {{ asset?.change_percent >= 0 ? '+' : '' }}{{ asset?.change_percent }}% hoje
                    </span>
                  </template>
                </div>
              </div>
            </div>
            <MoleculesPeriodSelector
              v-model="selectedTimeRange"
              :loading="isLoadingChart"
              class="max-md:w-full"
            />
          </header>
          <AtomsGraphLine
            :data="chartData"
            :legend="chartLabel"
            :height="320"
            :loading="isLoadingChart"
          />
        </section>

        <!-- Volatilidade -->
        <section v-if="!isLoadingAsset" class="border-b border-white/10 py-6 max-md:px-4">
          <div class="rounded-2xl bg-white/5 p-5 backdrop-blur-sm">
            <header class="mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-activity" class="h-5 w-5 text-white/60" />
              <h3 class="text-sm font-semibold text-white">Volatilidade do Ativo</h3>
            </header>
            <AtomsRiskMeter
              :risk="volatilityRisk"
              :period="volatilityPeriodLabel"
            />
          </div>
        </section>

        <!-- Asset Indicators -->
        <!-- Indicadores Fundamentalistas -->
        <section class="border-b border-white/10 py-8 max-md:px-4">
          <header class="mb-6 flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <UIcon name="i-lucide-bar-chart-3" class="h-5 w-5 text-white/60" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-white">Indicadores</h2>
              <p class="text-xs text-white/40">Métricas fundamentalistas de {{ tickerUpper }}</p>
            </div>
          </header>

          <!-- Basic Indicators Grid -->
          <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <template v-if="isLoadingFundamentus">
              <USkeleton
                v-for="i in 6"
                :key="`basic-loading-${i}`"
                class="h-24 w-full rounded-xl"
              />
            </template>
            <template v-else-if="basicIndicators">
              <MoleculesTickerIndicator
                name="P/L"
                :value="basicIndicators.pl"
                help-text="Preço sobre Lucro - indica quantos anos seriam necessários para recuperar o investimento."
              />
              <MoleculesTickerIndicator
                name="P/VPA"
                :value="basicIndicators.pvpa"
                help-text="Preço sobre Valor Patrimonial por Ação - compara o preço da ação com seu valor contábil."
              />
              <MoleculesTickerIndicator
                name="DY"
                :value="basicIndicators.dividendYield"
                help-text="Dividend Yield é a relação entre o dividendo pago por ação e o preço da ação."
              />
              <MoleculesTickerIndicator
                name="ROE"
                :value="basicIndicators.roe"
                help-text="Return on Equity - rentabilidade sobre o patrimônio líquido."
              />
              <MoleculesTickerIndicator
                name="ROA"
                :value="basicIndicators.roa"
                help-text="Return on Assets - rentabilidade sobre os ativos totais."
              />
              <MoleculesTickerIndicator
                name="Margem"
                :value="basicIndicators.netMargin"
                help-text="Percentual do lucro líquido em relação à receita total."
              />
            </template>
            <template v-else>
              <div
                class="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-8 text-center"
              >
                <UIcon name="i-lucide-bar-chart-3" class="mb-2 h-6 w-6 text-white/20" />
                <p class="text-sm text-white/40">Dados indisponíveis</p>
              </div>
            </template>
          </div>

          <!-- Smart Indicators -->
          <div v-if="intelligentIndicators || isLoadingFundamentus" class="mt-8">
            <div class="mb-4 flex items-center gap-2">
              <IconAi class="fill-secondary h-4 w-4" />
              <span class="text-sm font-medium text-white/60">Análise por IA</span>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <template v-if="isLoadingFundamentus">
                <USkeleton
                  v-for="i in 8"
                  :key="`smart-loading-${i}`"
                  class="h-28 w-full rounded-xl"
                />
              </template>
              <template v-else-if="intelligentIndicators">
                <MoleculesTickerIndicator
                  name="Endividamento (D/E)"
                  :value="intelligentIndicators.debtToEquity.value + '%'"
                  help-text="Relação entre dívida total e patrimônio líquido."
                  :help-text-with-tooltip="false"
                />
                <MoleculesTickerIndicator
                  name="Liquidez Corrente"
                  :value="intelligentIndicators.currentRatio.value"
                  help-text="Capacidade de pagamento de curto prazo."
                  :help-text-with-tooltip="false"
                />
                <MoleculesTickerIndicator
                  name="Rentabilidade (ROE)"
                  :value="intelligentIndicators.roe.value"
                  help-text="Retorno sobre o patrimônio líquido."
                  :help-text-with-tooltip="false"
                />
                <MoleculesTickerIndicator
                  name="Eficiência (ROA)"
                  :value="intelligentIndicators.roa.value"
                  help-text="Retorno sobre os ativos totais."
                  :help-text-with-tooltip="false"
                />
                <MoleculesTickerIndicator
                  name="Margem de Lucro"
                  :value="intelligentIndicators.profitMargin.value"
                  help-text="Lucro líquido sobre receita total."
                  :help-text-with-tooltip="false"
                />
                <MoleculesTickerIndicator
                  name="P/VPA"
                  :value="intelligentIndicators.priceToBook.value"
                  help-text="Preço dividido pelo valor patrimonial."
                  :help-text-with-tooltip="false"
                />
                <MoleculesTickerIndicator
                  name="P/L Projetado"
                  :value="intelligentIndicators.forwardPE.value"
                  help-text="P/L baseado em lucros estimados."
                  :help-text-with-tooltip="false"
                />
                <MoleculesTickerIndicator
                  name="Preço Teto (Bazin)"
                  :value="intelligentIndicators.bazinPrice.value"
                  help-text="Preço máximo pelo método Bazin."
                  :help-text-with-tooltip="false"
                />
              </template>
            </div>
          </div>
        </section>
      </div>

      <!-- Dividends Chart -->
      <section class="border-b border-white/10 py-8 max-md:px-4">
        <!-- Header da seção -->
        <header class="mb-6 flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-calendar-days" class="h-5 w-5 text-secondary" />
            <h2 class="text-lg font-semibold text-white">Dividendos</h2>
          </div>
          <p class="text-sm text-white/60">
            Histórico de pagamentos e probabilidade mensal de dividendos.
          </p>
        </header>

        <!-- MDI Card -->
        <div class="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/20">
                <IconAi class="fill-secondary h-5 w-5" />
              </div>
              <div>
                <h3 class="text-sm font-semibold text-white">Mapa de Dividendos</h3>
                <p class="text-xs text-white/40">Probabilidade de pagamento por mês</p>
              </div>
            </div>
            <div v-if="isLoadingDividends" class="flex items-center gap-2 text-xs text-white/40">
              <UIcon name="i-lucide-loader-2" class="h-4 w-4 animate-spin" />
              Analisando...
            </div>
            <div
              v-else-if="monthlyDividendProbability.referenceLabel"
              class="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60"
            >
              <UIcon name="i-lucide-calendar" class="h-3.5 w-3.5" />
              {{ monthlyDividendProbability.referenceLabel }}
            </div>
          </div>

          <!-- Grid -->
          <div class="p-4">
            <div
              v-if="isLoadingDividends"
              class="grid grid-cols-4 gap-2 md:grid-cols-6 lg:grid-cols-12"
            >
              <USkeleton
                v-for="month in 12"
                :key="`dividend-month-skeleton-${month}`"
                class="h-24 rounded-xl"
              />
            </div>
            <div
              v-else
              class="grid grid-cols-4 gap-2 md:grid-cols-6 lg:grid-cols-12"
            >
              <div
                v-for="item in monthlyDividendProbability.months"
                :key="item.label"
                :class="[
                  'group relative flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all duration-300',
                  item.highlight
                    ? 'border-secondary bg-gradient-to-br from-secondary/20 to-secondary/5 shadow-lg shadow-secondary/20'
                    : item.percentage > 50
                      ? 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent hover:border-green-500/50'
                      : item.percentage > 0
                        ? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        : 'border-white/5 bg-white/[0.02] opacity-60',
                ]"
              >
                <!-- Month label -->
                <span
                  :class="[
                    'text-[11px] font-semibold uppercase tracking-wider',
                    item.highlight ? 'text-secondary' : 'text-white/50',
                  ]"
                >
                  {{ item.label }}
                </span>

                <!-- Percentage -->
                <span
                  :class="[
                    'text-xl font-bold tabular-nums',
                    item.highlight
                      ? 'text-secondary'
                      : item.percentage > 50
                        ? 'text-green-400'
                        : item.percentage > 0
                          ? 'text-white'
                          : 'text-white/30',
                  ]"
                >
                  {{ item.formattedPercentage }}
                </span>

                <!-- Indicator -->
                <div
                  v-if="item.highlight"
                  class="flex items-center gap-1 rounded-full bg-secondary/20 px-2 py-0.5"
                >
                  <UIcon name="i-lucide-sparkles" class="h-3 w-3 text-secondary" />
                  <span class="text-[10px] font-medium text-secondary">Provável</span>
                </div>
                <div
                  v-else-if="item.percentage >= 80"
                  class="h-1 w-6 rounded-full bg-green-500/50"
                />
                <div
                  v-else-if="item.percentage >= 50"
                  class="h-1 w-4 rounded-full bg-green-500/30"
                />
                <div
                  v-else
                  class="h-1 w-2 rounded-full bg-white/10"
                />
              </div>
            </div>

            <!-- Legend -->
            <div class="mt-4 flex flex-wrap items-center justify-center gap-4 text-[10px] text-white/40">
              <div class="flex items-center gap-1.5">
                <div class="h-2 w-2 rounded-full bg-secondary" />
                <span>Mês atual</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="h-2 w-2 rounded-full bg-green-500" />
                <span>Alta probabilidade</span>
              </div>
              <div class="flex items-center gap-1.5">
                <div class="h-2 w-2 rounded-full bg-white/30" />
                <span>Baixa probabilidade</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Gráfico de Dividendos -->
        <AtomsGraphDividends
          :data="dividendsData"
          :loading="isLoadingDividends"
        />
      </section>

      <!-- Financial Statements -->
      <section class="border-b border-white/10 py-8 max-md:px-4">
        <header class="mb-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <UIcon name="i-lucide-bar-chart-3" class="h-5 w-5 text-white/60" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-white">Demonstrações Financeiras</h2>
              <p class="text-xs text-white/40">Último trimestre disponível</p>
            </div>
          </div>
        </header>

        <div
          v-if="
            cashFlowItems.length ||
            balanceItems.length ||
            incomeItems.length ||
            isLoadingFundamentus
          "
          class="grid gap-4 lg:grid-cols-3"
        >
          <AtomsGraphFinancialSummary
            title="Fluxo de Caixa"
            icon="i-lucide-arrow-right-left"
            :items="cashFlowItems"
            :is-loading="isLoadingFundamentus"
          />
          <AtomsGraphFinancialSummary
            title="Balanço Patrimonial"
            icon="i-lucide-scale"
            :items="balanceItems"
            :is-loading="isLoadingFundamentus"
          />
          <AtomsGraphFinancialSummary
            title="DRE"
            icon="i-lucide-trending-up"
            :items="incomeItems"
            :is-loading="isLoadingFundamentus"
          />
        </div>
        <div
          v-else
          class="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-12 text-center"
        >
          <UIcon name="i-lucide-file-x" class="mb-3 h-8 w-8 text-white/20" />
          <p class="text-sm text-white/40">Demonstrações indisponíveis</p>
        </div>
      </section>

      <!-- Buy & Hold Checklist -->
      <section class="border-b border-white/10 py-8 max-md:px-4">
        <div class="rounded-3xl bg-white/5 p-6 backdrop-blur-sm">
          <!-- Header com score -->
          <header class="mb-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <UIcon name="i-lucide-clipboard-check" class="h-5 w-5 text-white/60" />
                </div>
                <div>
                  <h2 class="text-lg font-semibold text-white">Checklist Buy & Hold</h2>
                  <p class="text-xs text-white/40">Critérios para investidores de longo prazo</p>
                </div>
              </div>

              <!-- Score -->
              <div v-if="!isLoadingFundamentus && buyAndHoldChecklist.length" class="flex items-center gap-2 text-sm text-white/50">
                <span class="font-medium text-white">{{ buyAndHoldChecklist.filter(i => i.status === 'pass').length }}</span>
                <span>de</span>
                <span>{{ buyAndHoldChecklist.length }} critérios</span>
              </div>
            </div>
          </header>

          <div v-if="isLoadingFundamentus" class="grid gap-2 md:grid-cols-2">
            <USkeleton
              v-for="index in 6"
              :key="`checklist-skeleton-${index}`"
              class="h-16 rounded-xl"
            />
          </div>
          <template v-else>
            <div
              v-if="buyAndHoldChecklist.length"
              class="grid gap-2 md:grid-cols-2"
            >
              <div
                v-for="item in buyAndHoldChecklist"
                :key="item.id"
                class="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 transition-all hover:bg-white/5"
              >
                <!-- Status Icon -->
                <div
                  :class="[
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                    item.status === 'pass'
                      ? 'bg-green-500/10 text-green-500'
                      : item.status === 'fail'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-white/5 text-white/30',
                  ]"
                >
                  <UIcon
                    :name="
                      item.status === 'pass'
                        ? 'i-lucide-check'
                        : item.status === 'fail'
                          ? 'i-lucide-x'
                          : 'i-lucide-minus'
                    "
                    class="h-4 w-4"
                  />
                </div>

                <!-- Content -->
                <div class="flex min-w-0 flex-1 flex-col">
                  <div class="flex items-center gap-1.5">
                    <span class="text-sm text-white/80">
                      {{ item.label }}
                    </span>
                    <UTooltip
                      v-if="item.tooltip"
                      :text="item.tooltip"
                      :delay-duration="0"
                    >
                      <button
                        type="button"
                        class="text-white/20 transition-colors hover:text-white/50"
                      >
                        <UIcon name="i-lucide-info" class="h-3 w-3" />
                      </button>
                    </UTooltip>
                  </div>
                  <p
                    v-if="item.detail"
                    class="truncate text-xs text-white/40"
                  >
                    {{ item.detail }}
                  </p>
                  <p
                    v-else-if="item.status === 'unknown'"
                    class="text-xs text-white/30"
                  >
                    Dados indisponíveis
                  </p>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div
              v-else
              class="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-12 text-center"
            >
              <UIcon name="i-lucide-clipboard-list" class="mb-3 h-8 w-8 text-white/20" />
              <p class="text-sm text-white/40">Checklist indisponível</p>
              <p class="text-xs text-white/20">Dados insuficientes para análise</p>
            </div>
          </template>
        </div>
      </section>

      <!-- Asset Info -->
      <section class="border-b border-white/10 py-8 max-md:px-4">
        <header class="mb-6 flex items-center gap-2">
          <UIcon name="i-lucide-building-2" class="h-5 w-5 text-white/60" />
          <h2 class="text-lg font-semibold text-white">Sobre a Empresa</h2>
        </header>

        <div class="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
          <div class="flex items-start gap-5">
            <USkeleton v-if="isLoadingAsset" class="h-16 w-16 flex-shrink-0 rounded-2xl" />
            <img
              v-else-if="asset?.logo"
              :src="asset.logo"
              :alt="`Logo de ${assetName}`"
              class="h-16 w-16 flex-shrink-0 rounded-2xl object-cover shadow-lg"
            />
            <div class="flex flex-1 flex-col gap-3">
              <USkeleton v-if="isLoadingAsset" class="h-6 w-48" />
              <template v-else>
                <h3 class="text-xl font-bold text-white">
                  {{ asset?.name }}
                </h3>
                <span class="text-sm text-white/60">{{ tickerUpper }}</span>
              </template>
            </div>
          </div>

          <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <USkeleton v-if="isLoadingAsset" class="h-12 rounded-xl" />
            <template v-else>
              <div v-if="asset?.sector" class="flex items-center gap-3 rounded-xl bg-white/5 p-4">
                <UIcon name="i-lucide-layers" class="h-5 w-5 text-secondary" />
                <div class="flex flex-col">
                  <span class="text-xs text-white/50">Setor</span>
                  <span class="text-sm font-medium text-white">{{ asset.sector }}</span>
                </div>
              </div>
              <div v-if="asset?.industry" class="flex items-center gap-3 rounded-xl bg-white/5 p-4">
                <UIcon name="i-lucide-factory" class="h-5 w-5 text-secondary" />
                <div class="flex flex-col">
                  <span class="text-xs text-white/50">Indústria</span>
                  <span class="text-sm font-medium text-white">{{ asset.industry }}</span>
                </div>
              </div>
              <div v-if="asset?.website" class="flex items-center gap-3 rounded-xl bg-white/5 p-4">
                <UIcon name="i-lucide-globe" class="h-5 w-5 text-secondary" />
                <div class="flex flex-col">
                  <span class="text-xs text-white/50">Site</span>
                  <a
                    :href="asset.website"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm font-medium text-secondary hover:underline"
                  >
                    Visitar site
                  </a>
                </div>
              </div>
            </template>
          </div>
        </div>
      </section>

      <!-- Seção de IA para não autenticados -->
      <section v-if="!authStore.isAuthenticated" class="border-t border-white/10 py-12 max-md:px-4">
        <div class="mx-auto max-w-4xl">
          <!-- Header -->
          <div class="mb-8 text-center">
            <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2">
              <IconAi class="fill-secondary h-4 w-4" />
              <span class="text-sm font-medium text-secondary">Assessoria Inteligente</span>
            </div>
            <h2 class="mb-3 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
              Dúvidas sobre {{ tickerUpper }}?
            </h2>
            <p class="text-white/60">
              Pergunte qualquer coisa. Nossa IA responde em segundos.
            </p>
          </div>

          <!-- Cards de sugestões clicáveis -->
          <div class="mb-8 grid gap-3 sm:grid-cols-3">
            <NuxtLink
              v-for="(item, idx) in [
                { icon: 'i-lucide-target', text: `Vale investir em ${tickerUpper}?`, desc: 'Análise de viabilidade' },
                { icon: 'i-lucide-calculator', text: 'Qual o preço teto?', desc: 'Método Bazin' },
                { icon: 'i-lucide-file-text', text: 'Relatório completo', desc: 'Análise fundamentalista' },
              ]"
              :key="idx"
              to="/auth/login"
              class="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-secondary/30 hover:bg-secondary/5"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors group-hover:bg-secondary/20">
                <UIcon :name="item.icon" class="h-5 w-5 text-white/60 transition-colors group-hover:text-secondary" />
              </div>
              <div>
                <p class="font-medium text-white">{{ item.text }}</p>
                <p class="text-sm text-white/50">{{ item.desc }}</p>
              </div>
              <div class="mt-auto flex items-center gap-1 text-sm text-white/40 transition-colors group-hover:text-secondary">
                <span>Perguntar</span>
                <UIcon name="i-lucide-arrow-right" class="h-4 w-4" />
              </div>
            </NuxtLink>
          </div>

          <!-- CTA -->
          <div class="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/10 to-transparent p-6 text-center md:p-8">
            <div class="flex items-center gap-3">
              <div class="flex -space-x-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 ring-2 ring-black">
                  <UIcon name="i-lucide-check" class="h-4 w-4 text-green-400" />
                </div>
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/20 ring-2 ring-black">
                  <UIcon name="i-lucide-zap" class="h-4 w-4 text-secondary" />
                </div>
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 ring-2 ring-black">
                  <UIcon name="i-lucide-sparkles" class="h-4 w-4 text-purple-400" />
                </div>
              </div>
              <span class="text-sm text-white/60">Mais de 10.000 análises realizadas</span>
            </div>
            <UButton
              to="/auth/login"
              color="secondary"
              size="xl"
              icon="i-lucide-message-circle"
              class="hover:shadow-secondary/50 w-full transition-all hover:scale-[1.02] hover:shadow-xl sm:w-auto"
            >
              Começar a Perguntar
            </UButton>
            <p class="flex items-center gap-2 text-xs text-white/40">
              <UIcon name="i-lucide-shield-check" class="h-3 w-3" />
              Gratuito • Sem cadastro de cartão
            </p>
          </div>
        </div>
      </section>

      <MoleculesChat
        v-else
        class="w-full bg-white/10"
        :suggestions="[
          'Me dê um relatório completo sobre a ação',
          'Por que devo investir neste ativo?',
          // caindo ou subindo, dependendo da variacao
          `Porque está ${ticker} ${
            dailyChangePercent && dailyChangePercent >= 0 ? 'subindo' : 'caindo'
          }`,
        ]"
        route-path="/ticker"
        :ticker="ticker"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { ChartTimeRange } from '~/types/chart'
import type {
  AssetMdiEntry,
  FundamentusApiResponse,
  FundamentusData,
} from '~/types/asset'
import { generateChartConfig } from '~/helpers/utils'
import { FastAverageColor } from 'fast-average-color'
import colorLib from '@kurkle/color'

const authStore = useAuthStore()
const route = useRoute()
const {
  assetHistoricPrices,
  getTickerDetails,
  getTickerDividends,
  getTickerFundamentus,
} = useAssetsService()

interface DividendData {
  ticker: string
  payment_date: string
  rate: string
  label?: string
  mdi?: AssetMdiEntry[]
}

const ticker = route.params.ticker as string
const {
  data: asset,
  pending: assetPending,
  error: assetError,
} = await useAsyncData(`asset-details-${ticker.toLowerCase()}`, () =>
  getTickerDetails(ticker)
)

if (assetError.value || !asset.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Asset not found',
    fatal: true,
  })
}

const blockChat = ref(false)
const isLoadingAsset = computed(() => assetPending.value)
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
)
const dividendsData = ref<DividendData[]>([])
const isLoadingDividends = ref(true)
const fundamentusData = ref<FundamentusApiResponse | null>(null)
const isLoadingFundamentus = ref(true)
const selectedTimeRange = ref<ChartTimeRange>('month')
const isLoadingChart = ref(true)
const pageGradient = ref('')
const priceElement = ref<HTMLElement | null>(null)
const isPriceVisible = ref(true)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry) {
        isPriceVisible.value = entry.isIntersecting
      }
    },
    { threshold: 0 }
  )
  if (priceElement.value) {
    observer.observe(priceElement.value)
  }

  onUnmounted(() => {
    observer.disconnect()
  })

  // Dados pesados (gráficos/dividendos/fundamentos) no client: reduz TTFB e custo de crawl do SSR
  fetchChartData()
  fetchDividendsData()
  fetchFundamentusData()
})

const chatSuggestions = [
  'Qual a diferença entre ações e FIIs?',
  'Como funcionam os dividendos?',
  'O que é diversificação?',
  'Quanto devo investir por mês?',
  'Como escolher boas ações?',
  'Vale a pena investir em ETFs?',
]

function handleChatCardClick() {
  blockChat.value = true
}

interface ChartPoint {
  date: string
  value: number
  timestamp: number
}
const chartData = ref<ChartPoint[]>([])

const volatilityRisk = computed(() => {
  if (!chartData.value.length) return 0
  const values = chartData.value.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)

  if (min === 0) return 0

  // Fórmula: (max - min) / min
  // Se variou 100% (dobrou ou caiu pela metade partindo do topo? não, variação total relativa ao fundo), risco é 100%
  const variation = ((max - min) / min) * 100

  return Math.min(variation, 100)
})

const volatilityPeriodLabel = computed(() => {
  const map: Record<string, string> = {
    month: 'último mês',
    year: 'último ano',
    '3years': 'últimos 3 anos',
    full: 'todo o período',
  }
  return map[selectedTimeRange.value] || 'período selecionado'
})

const runtimeConfig = useRuntimeConfig()
const baseSiteUrl = computed(() => {
  const url = runtimeConfig.public?.siteUrl || 'https://www.redentia.com.br'
  return url.endsWith('/') ? url.slice(0, -1) : url
})

const tickerUpper = computed(() => ticker.toUpperCase())
const assetName = computed(() => {
  const resolvedName = asset.value?.name
  return resolvedName ? String(resolvedName) : tickerUpper.value
})
const assetCurrentPrice = computed(() => {
  const price =
    safeNumber(asset.value?.market_price) ?? safeNumber(asset.value?.close)
  return price
})
const formattedAssetPrice = computed(() => {
  if (assetCurrentPrice.value === null) return null
  return `R$ ${assetCurrentPrice.value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
})
const dailyChangePercent = computed(() =>
  safeNumber(asset.value?.change_percent)
)
const dailyChangeSentence = computed(() => {
  if (dailyChangePercent.value === null) return null
  const absolute = Math.abs(dailyChangePercent.value).toFixed(2)
  const trend = dailyChangePercent.value >= 0 ? 'alta' : 'queda'
  return `${trend} de ${absolute}% hoje`
})
const yearChangeRaw = computed(() => {
  const fundamentusChange = safeNumber(
    fundamentusData.value?.key_statistics?.fifty_two_week_change
  )
  const tickerChange = safeNumber(
    (asset.value as { year_change_percent?: unknown } | undefined)
      ?.year_change_percent
  )
  return fundamentusChange ?? tickerChange
})
const yearChangePercent = computed(() => {
  if (yearChangeRaw.value === null) return null
  const normalized =
    Math.abs(yearChangeRaw.value) <= 1
      ? yearChangeRaw.value * 100
      : yearChangeRaw.value
  return normalized
})
const yearChangeSentence = computed(() => {
  if (yearChangePercent.value === null) return null
  const absolute = Math.abs(yearChangePercent.value).toFixed(2)
  const trend = yearChangePercent.value >= 0 ? 'alta' : 'queda'
  return `Nos últimos 12 meses, ${assetName.value} acumula ${trend} de ${absolute}%.`
})

const pageTitle = computed(
  () => `${tickerUpper.value} - ${assetName.value} - Cotação e Dividendos`
)

const pageDescription = computed(() => {
  const baseSentence = formattedAssetPrice.value
    ? `A cotação de ${assetName.value} (${tickerUpper.value}) hoje está em ${formattedAssetPrice.value}`
    : `Acompanhe a cotação de ${assetName.value} (${tickerUpper.value}) em tempo real`
  const intradaySegment = dailyChangeSentence.value
    ? `, com ${dailyChangeSentence.value}`
    : ''
  const yearSegment = yearChangeSentence.value
    ? `${yearChangeSentence.value} `
    : ''
  return `${baseSentence}${intradaySegment}. ${yearSegment}Explore dividendos, indicadores fundamentalistas e análises com IA na Redentia.`
})

const canonicalUrl = computed(
  () => `${baseSiteUrl.value}/asset/${ticker.toLowerCase()}`
)

const shareImage = computed(() => {
  const logo = asset.value?.logo
  if (typeof logo === 'string' && logo.length > 0) {
    if (logo.startsWith('http')) {
      return logo
    }
    return `${baseSiteUrl.value}${logo.startsWith('/') ? logo : `/${logo}`}`
  }
  return `${baseSiteUrl.value}/512x512.png`
})

async function updatePageGradient() {
  if (import.meta.server) return
  if (!asset.value?.logo) return

  try {
    const fac = new FastAverageColor()
    const logoUrl = asset.value.logo.startsWith('http')
      ? asset.value.logo
      : `${baseSiteUrl.value}${asset.value.logo.startsWith('/') ? asset.value.logo : `/${asset.value.logo}`}`

    const color = await fac.getColorAsync(logoUrl, {
      algorithm: 'dominant',
      ignoredColor: [
        [255, 255, 255, 255], // white
        [0, 0, 0, 255], // black
      ],
    })

    // Darken the color significantly to start the gradient
    const darkColor = colorLib(color.hex).darken(0.9).rgbString()

    // Diagonal gradient: Dark Color -> Black
    pageGradient.value = darkColor
  } catch (e) {
    console.error('Error extracting color', e)
    pageGradient.value = ''
  }
}

usePageSeo({
  title: () => pageTitle.value,
  description: () => pageDescription.value,
  path: `/asset/${ticker.toLowerCase()}`,
  image: () => shareImage.value,
})

const monthLabels = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

// Mantém apenas o label do chartConfig
const chartLabel = computed(
  () =>
    generateChartConfig({
      timeRange: selectedTimeRange.value,
      label: ticker.toUpperCase(),
      basePrice: asset.value?.close || 100,
    }).legend
)

async function fetchChartData() {
  isLoadingChart.value = true
  try {
    let period: '1mo' | 'ytd' | '3mo' | '12mo' | '3y' | '4y' | '5y' | 'full' =
      '1mo'
    if (selectedTimeRange.value === 'month') period = '1mo'
    else if (selectedTimeRange.value === 'year') period = '12mo'
    else if (selectedTimeRange.value === '3years') period = '3y'
    else if (selectedTimeRange.value === 'full') period = 'full'
    const data = await assetHistoricPrices(ticker, period)
    // Transforma para o formato aceito pelo gráfico
    chartData.value = Array.isArray(data)
      ? data.map((item) => ({
          date: item.price_at,
          value: item.market_price,
          timestamp: new Date(item.price_at).getTime(),
        }))
      : []
  } catch (error) {
    console.error('Error fetching chart data:', error)
    chartData.value = []
  } finally {
    isLoadingChart.value = false
  }
}

async function fetchDividendsData() {
  isLoadingDividends.value = true
  try {
    const data = await getTickerDividends(ticker)
    dividendsData.value = Array.isArray(data) ? data : []
  } catch {
    dividendsData.value = []
  }
  isLoadingDividends.value = false
}

function redirectToLogin(source: string) {
  navigateTo(
    `/auth/login?redirect=/${source === 'calculadora' ? 'calculadora' : 'help'}`
  )
}

async function fetchFundamentusData() {
  isLoadingFundamentus.value = true
  try {
    const data = await getTickerFundamentus(ticker)
    fundamentusData.value = data || null
  } catch {
    fundamentusData.value = null
  }
  isLoadingFundamentus.value = false
}

// Computed para transformar dados da API para formato dos gráficos
const transformedFundamentusData = computed((): FundamentusData | undefined => {
  if (!fundamentusData.value) return undefined

  const data = fundamentusData.value

  // Pega o período mais recente (primeiro item do array)
  const latestCashFlow =
    data.cash_flow?.quarterly?.[0] || data.cash_flow?.annual?.[0]
  const latestBalance =
    data.balance?.quarterly?.[0] || data.balance?.annual?.[0]
  const latestIncome = data.income?.quarterly?.[0] || data.income?.annual?.[0]

  return {
    // Indicadores básicos
    priceToEarnings: parseFloat(data.key_statistics?.forward_pe) || undefined,
    priceToBook: parseFloat(data.key_statistics?.price_to_book) || undefined,
    dividendYield: parseFloat(data.key_statistics?.dividend_yield) || undefined,
    roe: parseFloat(data.financial_data?.return_on_equity) || undefined,
    roa: parseFloat(data.financial_data?.return_on_assets) || undefined,
    netMargin: parseFloat(data.financial_data?.profit_margins) || undefined,

    // Demonstrações financeiras - usando dados mais recentes
    cashFlow: latestCashFlow
      ? {
          operatingCashFlow:
            parseFloat(latestCashFlow.operating_cash_flow) || undefined,
          investingCashFlow:
            parseFloat(latestCashFlow.investment_cash_flow) || undefined,
          financingCashFlow:
            parseFloat(latestCashFlow.financing_cash_flow) || undefined,
          freeCashFlow:
            parseFloat(data.financial_data?.free_cashflow) || undefined,
        }
      : undefined,

    balanceSheet: latestBalance
      ? {
          totalAssets: parseFloat(latestBalance.total_assets) || undefined,
          totalLiabilities: parseFloat(latestBalance.total_liab) || undefined,
          totalEquity: parseFloat(latestBalance.equity) || undefined,
          currentAssets: undefined, // Não disponível na estrutura atual
          currentLiabilities: undefined, // Não disponível na estrutura atual
          longTermDebt: latestBalance.long_term_debt
            ? parseFloat(latestBalance.long_term_debt)
            : undefined,
          cash: parseFloat(latestBalance.cash) || undefined,
        }
      : undefined,

    incomeStatement: latestIncome
      ? {
          totalRevenue: parseFloat(latestIncome.total_revenue) || undefined,
          grossProfit: parseFloat(latestIncome.gross_profit) || undefined,
          operatingIncome:
            parseFloat(latestIncome.operating_income) || undefined,
          netIncome: parseFloat(latestIncome.net_income) || undefined,
          ebitda: data.financial_data?.ebitda
            ? parseFloat(data.financial_data.ebitda)
            : undefined,
          operatingExpenses: undefined, // Não disponível diretamente, pode ser calculado
        }
      : undefined,
  }
})

const cashFlowItems = computed(() => {
  const cashFlow = transformedFundamentusData.value?.cashFlow
  if (!cashFlow) return []
  return [
    { label: 'Operacional', value: cashFlow.operatingCashFlow },
    { label: 'Investimento', value: cashFlow.investingCashFlow },
    { label: 'Financiamento', value: cashFlow.financingCashFlow },
    { label: 'Livre', value: cashFlow.freeCashFlow },
  ].flatMap((item) => {
    if (item.value === undefined || item.value === null) return []
    const numeric = Number(item.value)
    return Number.isFinite(numeric)
      ? [{ label: item.label, value: numeric }]
      : []
  })
})

const balanceItems = computed(() => {
  const balance = transformedFundamentusData.value?.balanceSheet
  if (!balance) return []
  return [
    { label: 'Ativos', value: balance.totalAssets },
    { label: 'Passivos', value: balance.totalLiabilities },
    { label: 'Patrimônio', value: balance.totalEquity },
    { label: 'Caixa', value: balance.cash },
    { label: 'Dívida LP', value: balance.longTermDebt },
  ].flatMap((item) => {
    if (item.value === undefined || item.value === null) return []
    const numeric = Number(item.value)
    return Number.isFinite(numeric)
      ? [{ label: item.label, value: numeric }]
      : []
  })
})

const incomeItems = computed(() => {
  const income = transformedFundamentusData.value?.incomeStatement
  if (!income) return []
  const derivedOperatingExpenses =
    income.operatingExpenses !== undefined && income.operatingExpenses !== null
      ? Number(income.operatingExpenses)
      : income.grossProfit !== undefined && income.operatingIncome !== undefined
        ? Number(income.grossProfit) - Number(income.operatingIncome)
        : undefined

  return [
    { label: 'Receita', value: income.totalRevenue },
    { label: 'Lucro Bruto', value: income.grossProfit },
    { label: 'Operacional', value: income.operatingIncome },
    { label: 'Lucro Líquido', value: income.netIncome },
    { label: 'EBITDA', value: income.ebitda },
    {
      label: 'Despesas',
      value:
        derivedOperatingExpenses !== undefined &&
        Number.isFinite(derivedOperatingExpenses)
          ? -Math.abs(derivedOperatingExpenses)
          : undefined,
    },
  ].flatMap((item) => {
    if (item.value === undefined || item.value === null) return []
    const numeric = Number(item.value)
    return Number.isFinite(numeric)
      ? [{ label: item.label, value: numeric }]
      : []
  })
})

// Computeds para indicadores inteligentes
const intelligentIndicators = computed(() => {
  if (!fundamentusData.value) return null

  const data = fundamentusData.value
  const stats = data.key_statistics
  const financial = data.financial_data

  // Cálculos de indicadores inteligentes com safeguards
  const debtToEquityRaw = safeNumber(financial?.debt_to_equity)
  const debtToEquityRatio = debtToEquityRaw ?? 0

  const totalCash = safeNumber(financial?.total_cash)
  const totalDebt = safeNumber(financial?.total_debt)
  const currentRatioRaw = totalCash !== null && totalDebt !== null && totalDebt !== 0
    ? totalCash / totalDebt
    : null
  const currentRatio = currentRatioRaw ?? 0

  const roeRaw = safeNumber(financial?.return_on_equity)
  const roe = roeRaw !== null ? roeRaw * 100 : 0

  const roaRaw = safeNumber(financial?.return_on_assets)
  const roa = roaRaw !== null ? roaRaw * 100 : 0

  const profitMarginRaw = safeNumber(financial?.profit_margins)
  const profitMargin = profitMarginRaw !== null ? profitMarginRaw * 100 : 0

  const priceToBookRaw = safeNumber(stats?.price_to_book)
  const priceToBook = priceToBookRaw ?? 0

  const forwardPERaw = safeNumber(stats?.forward_pe)
  const forwardPE = forwardPERaw ?? 0

  const bazinIndicatorPrice = bazinPrice.value

  // Classificações baseadas em benchmarks do mercado
  const getDebtRating = (ratio: number) => {
    if (ratio < 30) return { label: 'Baixo', color: 'text-green-400' }
    if (ratio < 60) return { label: 'Moderado', color: 'text-yellow-400' }
    return { label: 'Alto', color: 'text-red-400' }
  }

  const getROERating = (roeVal: number) => {
    if (roeVal > 15) return { label: 'Excelente', color: 'text-green-400' }
    if (roeVal > 10) return { label: 'Bom', color: 'text-yellow-400' }
    return { label: 'Baixo', color: 'text-red-400' }
  }

  const getPERating = (pe: number) => {
    if (pe < 10) return { label: 'Barato', color: 'text-green-400' }
    if (pe < 20) return { label: 'Justo', color: 'text-yellow-400' }
    return { label: 'Caro', color: 'text-red-400' }
  }

  return {
    debtToEquity: {
      value: debtToEquityRaw !== null ? formatIndicator(debtToEquityRaw, { decimals: 1 }) : '—',
      rating: getDebtRating(debtToEquityRatio),
    },
    currentRatio: {
      value: currentRatioRaw !== null ? formatIndicator(currentRatioRaw, { decimals: 2 }) : '—',
      rating:
        currentRatio > 1
          ? { label: 'Saudável', color: 'text-green-400' }
          : { label: 'Preocupante', color: 'text-red-400' },
    },
    roe: {
      value: roeRaw !== null ? formatIndicator(roeRaw, { decimals: 1, multiplier: 100, suffix: '%' }) : '—',
      rating: getROERating(roe),
    },
    roa: {
      value: roaRaw !== null ? formatIndicator(roaRaw, { decimals: 1, multiplier: 100, suffix: '%' }) : '—',
      rating:
        roa > 5
          ? { label: 'Bom', color: 'text-green-400' }
          : { label: 'Baixo', color: 'text-red-400' },
    },
    profitMargin: {
      value: profitMarginRaw !== null ? formatIndicator(profitMarginRaw, { decimals: 1, multiplier: 100, suffix: '%' }) : '—',
      rating:
        profitMargin > 10
          ? { label: 'Alta', color: 'text-green-400' }
          : { label: 'Baixa', color: 'text-red-400' },
    },
    priceToBook: {
      value: priceToBookRaw !== null ? formatIndicator(priceToBookRaw, { decimals: 2 }) : '—',
      rating:
        priceToBook < 1.5
          ? { label: 'Barato', color: 'text-green-400' }
          : { label: 'Caro', color: 'text-red-400' },
    },
    forwardPE: {
      value: forwardPERaw !== null ? formatIndicator(forwardPERaw, { decimals: 1 }) : '—',
      rating: getPERating(forwardPE),
    },
    bazinPrice: {
      value: bazinPriceDisplay.value,
      rating:
        bazinIndicatorPrice !== null
          ? {
              label: 'Referência Bazin',
              color: 'text-sky-400',
            }
          : undefined,
    },
  }
})

function extractMonthIndex(dateString: string | undefined) {
  if (!dateString) return null

  const parsedDate = new Date(dateString)
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.getUTCMonth()
  }

  const normalized = dateString.trim()
  const parts = normalized.includes('-')
    ? normalized.split('-')
    : normalized.split('/')

  if (parts.length >= 2) {
    const monthPart = parts[1]
    const monthIndex = Number.parseInt(monthPart, 10) - 1
    if (Number.isInteger(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
      return monthIndex
    }
  }

  return null
}

const highlightedMonthsCount = 3

function selectLatestRecord<T extends { period_end_date?: string }>(
  ...sources: Array<T[] | null | undefined>
): T | null {
  const withDates = sources
    .flatMap((items) => items ?? [])
    .map((item) => {
      const date = item?.period_end_date ? new Date(item.period_end_date) : null
      if (!date || Number.isNaN(date.getTime())) return null
      return { item, timestamp: date.getTime() }
    })
    .filter((entry): entry is { item: T; timestamp: number } => entry !== null)

  if (!withDates.length) return null

  withDates.sort((a, b) => b.timestamp - a.timestamp)
  return withDates[0].item
}

const aggregatedMdiEntries = computed<AssetMdiEntry[]>(() => {
  const fromDividends = dividendsData.value.find(
    (entry) => Array.isArray(entry.mdi) && entry.mdi.length
  )

  if (fromDividends?.mdi?.length) {
    return fromDividends.mdi
  }

  if (Array.isArray(asset.value?.mdi) && asset.value?.mdi.length) {
    return asset.value.mdi
  }

  return []
})

const bazinPrice = computed<number | null>(() => {
  if (!Array.isArray(dividendsData.value) || dividendsData.value.length === 0) {
    return null
  }

  const now = new Date()
  const cutoff = new Date(now)
  cutoff.setFullYear(cutoff.getFullYear() - 1)

  let total = 0

  for (const record of dividendsData.value) {
    const rate = safeNumber(record?.rate)
    if (!Number.isFinite(rate) || rate === null || rate <= 0) continue

    const paymentDate = record?.payment_date
      ? new Date(record.payment_date)
      : null
    if (!paymentDate || Number.isNaN(paymentDate.getTime())) continue

    if (paymentDate < cutoff || paymentDate > now) continue

    total += rate
  }

  if (total <= 0) return null

  const ceilingPrice = total * 16
  return Number.isFinite(ceilingPrice) ? ceilingPrice : null
})

const bazinPriceDisplay = computed(() => {
  const price = bazinPrice.value
  if (!Number.isFinite(price) || price === null) return '—'

  return `R$ ${price.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
})

const monthlyDividendProbability = computed(() => {
  const baseMonths = monthLabels.map((label) => ({
    label,
    percentage: 0,
    formattedPercentage: '0%',
    highlight: false,
  }))

  const aggregated = aggregatedMdiEntries.value
  if (aggregated.length) {
    const totalYears = safeNumber(aggregated[0]?.total_years) ?? null
    const monthsWithPercentages = baseMonths.map((month, index) => {
      const stats = aggregated.find((item) => item.month === index + 1)
      const occurrences = stats ? Number(stats.occurrences ?? 0) : 0
      const divisor =
        safeNumber(stats?.total_years) ??
        totalYears ??
        (occurrences > 0 ? occurrences : 0)
      const percentage =
        divisor && divisor > 0 ? (occurrences / divisor) * 100 : 0
      const formattedPercentage =
        percentage === 0
          ? '0%'
          : percentage < 10
            ? `${percentage.toFixed(1)}%`
            : `${Math.round(percentage)}%`

      return {
        ...month,
        percentage,
        formattedPercentage,
      }
    })

    const topMonths = monthsWithPercentages
      .filter((item) => item.percentage > 0)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, highlightedMonthsCount)
      .map((item) => item.label)

    const highlightSet = new Set(topMonths)

    const finalMonths = monthsWithPercentages.map((item) => ({
      ...item,
      highlight: highlightSet.has(item.label),
    }))

    const totalOccurrences = aggregated.reduce(
      (acc, item) => acc + Number(item.occurrences ?? 0),
      0
    )

    return {
      months: finalMonths,
      totalCount: totalYears ?? totalOccurrences,
      totalYears: totalYears ?? null,
      referenceLabel: totalYears
        ? `(Histórico de ${totalYears} anos)`
        : totalOccurrences
          ? `(Baseado em ${totalOccurrences} pagamentos)`
          : null,
    }
  }

  const records = dividendsData.value ?? []
  if (!records.length) {
    return {
      months: baseMonths,
      totalCount: 0,
      totalYears: null,
      referenceLabel: null,
    }
  }

  const counts = Array.from({ length: 12 }, () => 0)

  records.forEach((item) => {
    const monthIndex = extractMonthIndex(item.payment_date)
    if (monthIndex !== null) {
      counts[monthIndex] += 1
    }
  })

  const totalCount = counts.reduce((acc, value) => acc + value, 0)

  if (!totalCount) {
    return {
      months: baseMonths,
      totalCount,
      totalYears: null,
      referenceLabel: null,
    }
  }

  const monthsWithPercentages = baseMonths.map((month, index) => {
    const count = counts[index]
    const percentage = totalCount ? (count / totalCount) * 100 : 0
    const formattedPercentage =
      percentage === 0
        ? '0%'
        : percentage < 10
          ? `${percentage.toFixed(1)}%`
          : `${Math.round(percentage)}%`

    return {
      ...month,
      percentage,
      formattedPercentage,
    }
  })

  const topMonths = monthsWithPercentages
    .filter((item) => item.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, highlightedMonthsCount)
    .map((item) => item.label)

  const highlightSet = new Set(topMonths)

  const finalMonths = monthsWithPercentages.map((item) => ({
    ...item,
    highlight: highlightSet.has(item.label),
  }))

  return {
    months: finalMonths,
    totalCount,
    totalYears: null,
    referenceLabel:
      totalCount > 0 ? `(Baseado em ${totalCount} pagamentos)` : null,
  }
})

function safeNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null

  const trimmed = String(value).trim()
  if (!trimmed) return null

  const lastComma = trimmed.lastIndexOf(',')
  const lastDot = trimmed.lastIndexOf('.')
  const hasComma = lastComma !== -1
  const hasDot = lastDot !== -1

  let decimalSeparator: ',' | '.' | null = null
  if (hasComma && hasDot) {
    decimalSeparator = lastComma > lastDot ? ',' : '.'
  } else if (hasComma) {
    decimalSeparator = ','
  } else if (hasDot) {
    decimalSeparator = '.'
  }

  let standardized = trimmed
  if (decimalSeparator) {
    const thousandsSeparator = decimalSeparator === ',' ? '.' : ','
    const parts = standardized.split(thousandsSeparator)
    standardized = parts.join('')
    if (decimalSeparator === ',') {
      standardized = standardized.replace(',', '.')
    }
  }

  const parsed = Number.parseFloat(standardized)
  return Number.isFinite(parsed) ? parsed : null
}

// Helper para formatar indicadores de forma segura (nunca retorna NaN)
function formatIndicator(
  value: unknown,
  options: {
    decimals?: number
    multiplier?: number
    suffix?: string
    fallback?: string
  } = {}
): string {
  const { decimals = 1, multiplier = 1, suffix = '', fallback = '—' } = options
  const num = safeNumber(value)
  if (num === null) return fallback
  const result = num * multiplier
  if (!Number.isFinite(result)) return fallback
  return `${result.toFixed(decimals)}${suffix}`
}

// Computed para indicadores básicos com safeguards
const basicIndicators = computed(() => {
  if (!fundamentusData.value) return null
  const stats = fundamentusData.value.key_statistics
  const financial = fundamentusData.value.financial_data

  return {
    pl: formatIndicator(stats?.forward_pe, { decimals: 1 }),
    pvpa: formatIndicator(stats?.price_to_book, { decimals: 2 }),
    dividendYield: formatIndicator(stats?.dividend_yield, { decimals: 1, suffix: '%' }),
    roe: formatIndicator(financial?.return_on_equity, { decimals: 1, multiplier: 100, suffix: '%' }),
    roa: formatIndicator(financial?.return_on_assets, { decimals: 1, multiplier: 100, suffix: '%' }),
    netMargin: formatIndicator(financial?.profit_margins, { decimals: 1, multiplier: 100, suffix: '%' }),
  }
})

interface AnnualRecord {
  date: Date
  revenue: number | null
  netIncome: number | null
}

const annualIncomeRecords = computed<AnnualRecord[]>(() => {
  const annual = fundamentusData.value?.income?.annual ?? []

  return annual
    .map((item) => {
      const date = item.period_end_date ? new Date(item.period_end_date) : null
      if (!date || Number.isNaN(date.getTime())) return null

      return {
        date,
        revenue: safeNumber(item.total_revenue),
        netIncome: safeNumber(item.net_income),
      }
    })
    .filter((item): item is AnnualRecord => item !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
})

const latestBalanceSnapshot = computed(() =>
  selectLatestRecord(
    fundamentusData.value?.balance?.quarterly,
    fundamentusData.value?.balance?.annual
  )
)

type ChecklistStatus = 'pass' | 'fail' | 'unknown'

interface ChecklistItem {
  id: string
  label: string
  status: ChecklistStatus
  detail?: string | null
  tooltip?: string
}

const buyAndHoldChecklist = computed<ChecklistItem[]>(() => {
  const items: ChecklistItem[] = []

  if (!fundamentusData.value) return items

  const annual = annualIncomeRecords.value
  const today = new Date()
  const mdiEntries = aggregatedMdiEntries.value
  const totalYearsHistory = mdiEntries.length
    ? (safeNumber(mdiEntries[0]?.total_years) ?? null)
    : null

  const oldestAnnual = annual.at(-1)
  const firstAnnualDate = oldestAnnual?.date ?? null
  const availableYearsFromAnnual =
    firstAnnualDate !== null
      ? today.getFullYear() - firstAnnualDate.getFullYear() + 1
      : null
  const hasFiveYearsHistory =
    totalYearsHistory !== null
      ? totalYearsHistory >= 5
      : availableYearsFromAnnual !== null
        ? availableYearsFromAnnual >= 5
        : null
  const historyDetail =
    totalYearsHistory !== null
      ? `Histórico de ${totalYearsHistory} anos`
      : firstAnnualDate
        ? `Dados desde ${firstAnnualDate.getFullYear()}`
        : null

  let annualNeverNegative: boolean | null = null
  if (annual.length > 0) {
    if (annual.some((item) => item.netIncome === null)) {
      annualNeverNegative = null
    } else {
      annualNeverNegative = annual.every((item) => (item.netIncome ?? 0) >= 0)
    }
  }

  const dividendYieldRaw = safeNumber(
    fundamentusData.value.key_statistics?.dividend_yield
  )
  const dividendYieldValue = dividendYieldRaw !== null ? dividendYieldRaw : null
  const dividendYieldAboveFive =
    dividendYieldValue !== null ? dividendYieldValue >= 5 : null

  const roeRaw = safeNumber(
    fundamentusData.value.financial_data?.return_on_equity
  )
  const roeValue = roeRaw !== null ? roeRaw * 100 : null
  const roeAboveTen = roeValue !== null ? roeValue >= 10 : null

  const roaRaw = safeNumber(
    fundamentusData.value.financial_data?.return_on_assets
  )
  const roaValue = roaRaw !== null ? roaRaw * 100 : null
  const roaAboveFive = roaValue !== null ? roaValue >= 5 : null

  const balanceSnapshot = latestBalanceSnapshot.value
  const totalEquity = safeNumber(balanceSnapshot?.equity)
  const totalDebt = safeNumber(
    fundamentusData.value?.financial_data?.total_debt
  )
  const totalLiabilities = safeNumber(balanceSnapshot?.total_liab)
  const debtComparisonSource = totalDebt !== null ? totalDebt : totalLiabilities
  const debtBelowEquity =
    debtComparisonSource !== null && totalEquity !== null
      ? debtComparisonSource <= totalEquity
      : null

  const netMarginRaw = safeNumber(
    fundamentusData.value.financial_data?.profit_margins
  )
  const netMarginValue = netMarginRaw !== null ? netMarginRaw * 100 : null
  const netMarginPositive = netMarginValue !== null ? netMarginValue > 0 : null

  const freeCashFlowRaw = safeNumber(
    fundamentusData.value.financial_data?.free_cashflow
  )
  const freeCashFlowPositive =
    freeCashFlowRaw !== null ? freeCashFlowRaw > 0 : null

  const marketCapValue = safeNumber(
    (asset.value as { market_cap?: unknown } | undefined)?.market_cap
  )
  const marketCapAboveOneB =
    marketCapValue !== null ? marketCapValue >= 1_000_000_000 : null

  const recentDividendYears = new Set<number>()
  const dividendDataAvailable = dividendsData.value.length > 0
  const currentYear = today.getFullYear()
  const targetYears = Array.from(
    { length: 5 },
    (_, index) => currentYear - index
  )

  dividendsData.value.forEach((record) => {
    const date = record.payment_date ? new Date(record.payment_date) : null
    if (!date || Number.isNaN(date.getTime())) return
    const year = date.getFullYear()
    if (targetYears.includes(year)) {
      recentDividendYears.add(year)
    }
  })

  const paidDividendsLastFiveYears =
    targetYears.length > 0
      ? targetYears.every((year) => recentDividendYears.has(year))
      : null
  const sortedRecentDividendYears = Array.from(recentDividendYears).sort(
    (a, b) => a - b
  )

  const toStatus = (value: boolean | null | undefined): ChecklistStatus => {
    if (value === true) return 'pass'
    if (value === false) return 'fail'
    return 'unknown'
  }

  items.push({
    id: 'history',
    label: 'Mais de 5 anos de histórico',
    status: toStatus(hasFiveYearsHistory),
    detail: historyDetail,
    tooltip:
      'Verifica se há demonstrações anuais disponíveis há pelo menos 5 anos.',
  })

  items.push({
    id: 'dividends-five-years',
    label: 'Pagou dividendos nos últimos 5 anos',
    status: toStatus(dividendDataAvailable ? paidDividendsLastFiveYears : null),
    detail:
      dividendDataAvailable && sortedRecentDividendYears.length > 0
        ? `Pagamentos em: ${sortedRecentDividendYears.join(', ')} (${sortedRecentDividendYears.length}/5)`
        : dividendDataAvailable
          ? 'Sem pagamentos registrados no intervalo'
          : 'Histórico de dividendos indisponível',
    tooltip:
      'Verifica se houve pelo menos um pagamento de dividendos em cada um dos últimos 5 anos.',
  })

  items.push({
    id: 'annual-loss',
    label: 'Sem prejuízo em exercícios anuais recentes',
    status: toStatus(annualNeverNegative),
    detail:
      annualNeverNegative === false ? 'Há registros de prejuízo anual' : null,
    tooltip: 'Analisa os resultados fiscais anuais disponíveis.',
  })

  items.push({
    id: 'dividend-yield',
    label: 'Dividend Yield acima de 5%',
    status: toStatus(dividendYieldAboveFive),
    detail:
      dividendYieldValue !== null
        ? `Yield atual: ${dividendYieldValue.toFixed(1)}%`
        : null,
    tooltip: 'Usa o Dividend Yield informado pelo Fundamentus.',
  })

  items.push({
    id: 'roe',
    label: 'ROE acima de 10%',
    status: toStatus(roeAboveTen),
    detail: roeValue !== null ? `ROE atual: ${roeValue.toFixed(1)}%` : null,
    tooltip: 'Retorno sobre o patrimônio líquido da empresa.',
  })

  items.push({
    id: 'debt-equity',
    label: 'Dívida menor ou igual ao patrimônio',
    status: toStatus(debtBelowEquity),
    detail:
      debtComparisonSource !== null && totalEquity !== null
        ? `Dívida: R$ ${formatNumberToShort(debtComparisonSource)} • Patrimônio: R$ ${formatNumberToShort(totalEquity)}`
        : null,
    tooltip: 'Compara dívida total e patrimônio líquido mais recentes.',
  })

  items.push({
    id: 'market-cap',
    label: 'Market Cap maior que R$ 1B',
    status: toStatus(marketCapAboveOneB),
    detail:
      marketCapValue !== null
        ? `Market Cap: R$ ${formatNumberToShort(marketCapValue)}`
        : 'Market Cap indisponível',
    tooltip: 'Compara o valor de mercado atual com o patamar mínimo desejado.',
  })

  items.push({
    id: 'roa',
    label: 'ROA acima de 5%',
    status: toStatus(roaAboveFive),
    detail: roaValue !== null ? `ROA atual: ${roaValue.toFixed(1)}%` : null,
    tooltip: 'Retorno sobre os ativos totais da empresa.',
  })

  items.push({
    id: 'net-margin',
    label: 'Margem líquida positiva',
    status: toStatus(netMarginPositive),
    detail:
      netMarginValue !== null ? `Margem: ${netMarginValue.toFixed(1)}%` : null,
    tooltip: 'Verifica se a margem líquida consolidada está positiva.',
  })

  items.push({
    id: 'free-cashflow',
    label: 'Fluxo de caixa livre positivo',
    status: toStatus(freeCashFlowPositive),
    detail:
      freeCashFlowRaw !== null
        ? `FCF: R$ ${formatNumberToShort(freeCashFlowRaw)}`
        : 'Fluxo de caixa livre indisponível',
    tooltip: 'Verifica se a empresa gera caixa excedente após investimentos.',
  })

  return items
})

function formatNumberToShort(value: number): string {
  const absValue = Math.abs(value)
  if (absValue >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (absValue >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  if (absValue >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }
  return value.toFixed(0)
}

watch(
  () => asset.value?.logo,
  () => {
    updatePageGradient()
  },
  { immediate: true }
)

// Atualiza ao trocar o período
watch(selectedTimeRange, () => {
  fetchChartData()
})

definePageMeta({
  isPublicRoute: true,
  middleware: (to) => {
    const raw =
      typeof to.params.ticker === 'string' ? to.params.ticker : String(to.params.ticker || '')
    const normalized = raw.toLowerCase()
    if (raw && raw !== normalized) {
      return navigateTo(
        `/asset/${normalized}`,
        import.meta.server ? { redirectCode: 301 } : { replace: true }
      )
    }
  },
})
</script>

<template>
  <NuxtLayout
    :name="layoutName"
    container-class="md:px-0"
  >
    <div class="relative z-10 flex flex-col px-4 pt-4">
      <div class="flex flex-col">
        <!-- Terminal status bar — pinned context line for the asset -->
        <div
          class="-mx-4 mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-t px-4 py-2 font-mono-tab text-[10px] uppercase tracking-[0.18em]"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <span class="flex items-center gap-1.5" :style="{ color: brand.colors.primary }">
            <span class="relative flex size-1.5">
              <span class="absolute inline-flex size-1.5 animate-ping rounded-full opacity-75" :style="{ backgroundColor: brand.colors.primary }" />
              <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
            </span>
            [TICKER.QUOTE]
          </span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span :style="{ color: brand.colors.text }">{{ tickerUpper }}</span>
          <span v-if="asset?.name" :style="{ color: brand.colors.border }">·</span>
          <span v-if="asset?.name" class="truncate max-w-[240px]" :style="{ color: brand.colors.textMuted }">{{ asset.name }}</span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span :style="{ color: brand.colors.textMuted }">B3 · BOLSA BRASILEIRA</span>
          <span v-if="lastUpdateLabel" :style="{ color: brand.colors.border }">·</span>
          <span v-if="lastUpdateLabel" :style="{ color: brand.colors.textMuted }">UPDATE {{ lastUpdateLabel }}</span>
        </div>

        <!-- Hero Section do Ativo — 3-column terminal layout -->
        <section class="border-b pb-8" :style="{ borderColor: brand.colors.border }">
          <div class="grid gap-6 md:grid-cols-12 md:items-end">
            <!-- Col 1: Ticker + company name (serif display) -->
            <div class="flex items-center gap-4 md:col-span-4">
              <USkeleton
                v-if="isLoadingAsset"
                class="h-16 w-16 rounded-xl"
              />
              <img
                v-else-if="asset?.logo"
                :src="asset.logo"
                :alt="`Logo de ${assetName}`"
                class="h-16 w-16 rounded-xl object-cover"
              />
              <div class="flex min-w-0 flex-col gap-1">
                <span
                  class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
                  :style="{ color: brand.colors.primary }"
                >
                  [SYMBOL]
                </span>
                <h1
                  class="font-mono-tab text-3xl font-bold tracking-tight md:text-4xl"
                  :style="{ color: brand.colors.text }"
                >
                  {{ tickerUpper }}
                </h1>
                <p
                  class="truncate text-lg font-semibold leading-tight md:text-xl"
                  :style="{ color: brand.colors.text }"
                >
                  {{ asset?.name || assetName }}
                </p>
                <span
                  v-if="asset?.sector"
                  class="font-mono-tab text-[10px] uppercase tracking-[0.12em]"
                  :style="{ color: brand.colors.textMuted }"
                >
                  &gt; {{ asset.sector }}
                </span>
              </div>
            </div>

            <!-- Col 2: Price + change (monumental mono) -->
            <div class="flex flex-col gap-1 md:col-span-4">
              <span
                class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
                :style="{ color: brand.colors.primary }"
              >
                [LAST.PRICE]
              </span>
              <USkeleton v-if="isLoadingAsset" class="h-14 w-[200px]" />
              <template v-else>
                <div class="flex items-baseline gap-2">
                  <span
                    class="font-mono-tab text-[10px] font-normal opacity-60"
                    :style="{ color: brand.colors.textMuted }"
                  >
                    R$
                  </span>
                  <span
                    class="font-mono-tab text-5xl font-bold tabular-nums md:text-6xl"
                    :style="{
                      color: asset?.change_percent >= 0 ? brand.colors.positive : brand.colors.negative,
                    }"
                  >
                    {{ formatPriceNumber(asset?.market_price) }}
                  </span>
                </div>
                <div class="flex items-center gap-3 font-mono-tab text-sm">
                  <span
                    class="flex items-center gap-1 tabular-nums"
                    :style="{
                      color: asset?.change_percent >= 0 ? brand.colors.positive : brand.colors.negative,
                    }"
                  >
                    <UIcon
                      :name="asset?.change_percent >= 0 ? 'i-lucide-arrow-up-right' : 'i-lucide-arrow-down-right'"
                      class="h-3 w-3"
                    />
                    {{ asset?.change_percent >= 0 ? '+' : '' }}{{ Number(asset?.change_percent || 0).toFixed(2) }}%
                  </span>
                  <span :style="{ color: brand.colors.border }">·</span>
                  <span
                    class="text-[11px] uppercase tracking-[0.12em]"
                    :style="{ color: brand.colors.textMuted }"
                  >
                    HOJE
                  </span>
                </div>
              </template>
            </div>

            <!-- Col 3: Quick stats (tabular data cell) -->
            <div class="flex flex-col gap-1 md:col-span-4">
              <span
                class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
                :style="{ color: brand.colors.primary }"
              >
                [SESSION.STATS]
              </span>
              <div
                class="grid grid-cols-3 gap-px border font-mono-tab text-[11px]"
                :style="{
                  borderColor: brand.colors.border,
                  backgroundColor: brand.colors.border,
                }"
              >
                <div class="flex flex-col gap-0.5 px-3 py-2" :style="{ backgroundColor: brand.colors.surface }">
                  <span class="text-[9px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">VOL</span>
                  <span class="font-semibold tabular-nums" :style="{ color: brand.colors.text }">{{ formatVolumeShort(currentVolume) }}</span>
                </div>
                <div class="flex flex-col gap-0.5 px-3 py-2" :style="{ backgroundColor: brand.colors.surface }">
                  <span class="text-[9px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">M.CAP</span>
                  <span class="font-semibold tabular-nums" :style="{ color: brand.colors.text }">{{ formatMarketCapShort(asset?.market_cap) }}</span>
                </div>
                <div class="flex flex-col gap-0.5 px-3 py-2" :style="{ backgroundColor: brand.colors.surface }">
                  <span class="text-[9px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">DY</span>
                  <span class="font-semibold tabular-nums" :style="{ color: brand.colors.primary }">{{ formatDyShort(basicIndicators?.dividendYield) }}</span>
                </div>
                <div class="flex flex-col gap-0.5 px-3 py-2" :style="{ backgroundColor: brand.colors.surface }">
                  <span class="text-[9px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">P/L</span>
                  <span class="font-semibold tabular-nums" :style="{ color: brand.colors.text }">{{ basicIndicators?.pl || '—' }}</span>
                </div>
                <div class="flex flex-col gap-0.5 px-3 py-2" :style="{ backgroundColor: brand.colors.surface }">
                  <span class="text-[9px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">P/VP</span>
                  <span class="font-semibold tabular-nums" :style="{ color: brand.colors.text }">{{ basicIndicators?.pvpa || '—' }}</span>
                </div>
                <div class="flex flex-col gap-0.5 px-3 py-2" :style="{ backgroundColor: brand.colors.surface }">
                  <span class="text-[9px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">ROE</span>
                  <span class="font-semibold tabular-nums" :style="{ color: brand.colors.text }">{{ basicIndicators?.roe || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Chart with terminal-styled header -->
          <div class="mt-8">
            <div class="mb-3 flex items-end justify-between gap-4">
              <div class="flex flex-col gap-1">
                <span
                  class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
                  :style="{ color: brand.colors.primary }"
                >
                  [CHART.PRICE]
                </span>
                <span
                  class="font-mono-tab text-[11px] uppercase tracking-[0.12em]"
                  :style="{ color: brand.colors.textMuted }"
                >
                  &gt; HISTORICO DE COTACAO · {{ selectedTimeRange?.toString().toUpperCase() || 'PERIODO' }}
                </span>
              </div>
              <MoleculesPeriodSelector
                v-model="selectedTimeRange"
                :loading="isLoadingChart"
                class="max-md:w-full"
              />
            </div>
            <AtomsGraphLine
              :data="chartData"
              :legend="chartLabel"
              :height="360"
              :loading="isLoadingChart"
              :markers="chartMarkers"
              @marker-click="onMarkerClick"
            />
          </div>
        </section>

        <!-- Market Commentaries (AI-generated news/analysis) -->
        <section
          v-if="
            brand.features?.showMarketCommentaries !== false &&
            brand.assetPage.showMarketCommentaries !== false &&
            (commentaries.length > 0 || backfillStatus?.running)
          "
        >
          <MoleculesMarketCommentaries
            :commentaries="commentaries"
            :highlighted-date="highlightedCommentaryDate"
            :backfill-status="backfillStatus"
          />
        </section>

        <!-- Fundamentals + Volatility side by side (terminal panels) -->
        <section class="grid grid-cols-1 gap-6 border-b py-8 lg:grid-cols-3" :style="{ borderColor: brand.colors.border }">
          <!-- Col 1-2: Fundamentals register -->
          <div v-if="brand.assetPage.showIndicators" class="lg:col-span-2">
            <div class="mb-4 flex flex-col gap-1">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                [FUNDAMENTALS.SNAPSHOT]
              </span>
              <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
                Indicadores fundamentalistas
              </h2>
              <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
                &gt; METRICAS DE {{ tickerUpper }} · ULTIMA ATUALIZACAO DISPONIVEL
              </p>
            </div>

            <!-- Basic indicators register — 6 tight columns glued together -->
            <div
              v-if="isLoadingFundamentus"
              class="grid grid-cols-3 gap-px border md:grid-cols-6"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
            >
              <div v-for="i in 6" :key="`ind-load-${i}`" class="p-4" :style="{ backgroundColor: brand.colors.surface }">
                <USkeleton class="h-16 w-full" />
              </div>
            </div>
            <div
              v-else-if="basicIndicators"
              class="grid grid-cols-3 gap-px border md:grid-cols-6"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
            >
              <div
                v-for="(item, idx) in fundamentalsCells"
                :key="item.label"
                class="flex flex-col gap-1.5 px-4 py-4 transition-colors hover:brightness-110"
                :style="{ backgroundColor: brand.colors.surface }"
              >
                <div class="flex items-center justify-between">
                  <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                    [{{ String(idx + 1).padStart(2, '0') }}]
                  </span>
                  <UTooltip v-if="item.tooltip" :text="item.tooltip" :delay-duration="0">
                    <UIcon name="i-lucide-info" class="h-3 w-3 opacity-40" :style="{ color: brand.colors.textMuted }" />
                  </UTooltip>
                </div>
                <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
                  {{ item.label }}
                </span>
                <span class="font-mono-tab text-xl font-bold tabular-nums" :style="{ color: item.accent || brand.colors.text }">
                  {{ item.value || '—' }}
                </span>
              </div>
            </div>
            <div v-else class="border border-dashed p-6 text-center font-mono-tab text-[11px] uppercase tracking-wider" :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }">
              &gt; DATA UNAVAILABLE
            </div>

            <!-- Smart indicators register (AI analysis) -->
            <div v-if="brand.assetPage.showSmartIndicators && (intelligentIndicators || isLoadingFundamentus)" class="mt-4">
              <div class="mb-2 flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                <IconAi class="h-3 w-3" :style="{ fill: brand.colors.primary }" />
                <span>[AI.ANALYSIS]</span>
                <span :style="{ color: brand.colors.textMuted }">&gt; METRICAS INTERPRETADAS</span>
              </div>
              <div
                v-if="isLoadingFundamentus"
                class="grid grid-cols-2 gap-px border md:grid-cols-4"
                :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
              >
                <div v-for="i in 8" :key="`smart-load-${i}`" class="p-4" :style="{ backgroundColor: brand.colors.surface }">
                  <USkeleton class="h-16 w-full" />
                </div>
              </div>
              <div
                v-else-if="intelligentIndicators"
                class="grid grid-cols-2 gap-px border md:grid-cols-4"
                :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
              >
                <div
                  v-for="(item, idx) in smartCells"
                  :key="item.label"
                  class="flex flex-col gap-1.5 px-4 py-4"
                  :style="{ backgroundColor: brand.colors.surface }"
                >
                  <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                    [{{ String(idx + 1).padStart(2, '0') }}]
                  </span>
                  <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
                    {{ item.label }}
                  </span>
                  <span class="font-mono-tab text-base font-bold tabular-nums" :style="{ color: brand.colors.text }">
                    {{ item.value || '—' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Col 3: Volatility panel -->
          <div v-if="brand.assetPage.showVolatility" class="lg:col-span-1">
            <div class="mb-4 flex flex-col gap-1">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                [VOLATILITY.30D]
              </span>
              <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
                Volatilidade
              </h2>
              <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
                &gt; {{ volatilityPeriodLabel || 'JANELA DE 30 DIAS' }}
              </p>
            </div>
            <div class="border p-5" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
              <AtomsRiskMeter
                :risk="volatilityRisk"
                :period="volatilityPeriodLabel"
              />
            </div>
          </div>
        </section>
      </div>

      <!-- Dividends -->
      <section v-if="brand.assetPage.showDividendMap || brand.assetPage.showDividendChart" class="border-b py-8" :style="{ borderColor: brand.colors.border }">
        <!-- Terminal header -->
        <header class="mb-6 flex flex-col gap-1">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
            [DIVIDEND.CALENDAR]
          </span>
          <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
            Dividendos e proventos
          </h2>
          <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
            &gt; HISTORICO DE PAGAMENTOS · PROBABILIDADE MENSAL
          </p>
        </header>

        <!-- MDI Card — terminal dividend heatmap -->
        <div v-if="brand.assetPage.showDividendMap" class="mb-8 border" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <!-- Header: mono label + reference -->
          <div class="flex items-center justify-between border-b px-5 py-3" :style="{ borderColor: brand.colors.border }">
            <div class="flex flex-col gap-0.5">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                [DIVIDEND.HEATMAP]
              </span>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
                &gt; PROBABILIDADE MENSAL · BASELINE 10A
              </span>
            </div>
            <div v-if="isLoadingDividends" class="flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">
              <UIcon name="i-lucide-loader-2" class="h-3 w-3 animate-spin" />
              ANALISANDO
            </div>
            <span
              v-else-if="monthlyDividendProbability.referenceLabel"
              class="font-mono-tab text-[10px] uppercase tracking-[0.15em]"
              :style="{ color: brand.colors.textMuted }"
            >
              REF · {{ monthlyDividendProbability.referenceLabel }}
            </span>
          </div>

          <!-- Grid of 12 months, tight cells glued with gap-px -->
          <div
            v-if="isLoadingDividends"
            class="grid grid-cols-4 gap-px md:grid-cols-6 lg:grid-cols-12"
            :style="{ backgroundColor: brand.colors.border }"
          >
            <div v-for="month in 12" :key="`dividend-month-skeleton-${month}`" class="p-4" :style="{ backgroundColor: brand.colors.surface }">
              <USkeleton class="h-16 w-full" />
            </div>
          </div>
          <div
            v-else
            class="grid grid-cols-4 gap-px md:grid-cols-6 lg:grid-cols-12"
            :style="{ backgroundColor: brand.colors.border }"
          >
            <div
              v-for="item in monthlyDividendProbability.months"
              :key="item.label"
              class="group relative flex flex-col items-start gap-1.5 px-3 py-4 transition-colors"
              :style="monthCellStyle(item)"
            >
              <!-- Month label mono (top-left) -->
              <span
                class="font-mono-tab text-[9px] uppercase tracking-[0.18em]"
                :style="{ color: item.highlight ? brand.colors.primary : brand.colors.textMuted }"
              >
                [{{ item.label }}]
              </span>

              <!-- Percentage big mono -->
              <span
                class="font-mono-tab text-xl font-bold tabular-nums md:text-2xl"
                :style="{ color: monthCellAccent(item) }"
              >
                {{ item.formattedPercentage }}
              </span>

              <!-- Tiny bar indicator at the bottom — horizontal, width = percentage -->
              <div class="mt-auto h-[3px] w-full" :style="{ backgroundColor: brand.colors.border }">
                <div
                  class="h-full transition-all"
                  :style="{
                    width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                    backgroundColor: monthCellAccent(item),
                  }"
                />
              </div>
            </div>
          </div>

          <!-- Legend as terminal output -->
          <div
            class="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
            :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }"
          >
            <span>&gt; LEGENDA</span>
            <div class="flex items-center gap-5">
              <span class="flex items-center gap-1.5">
                <span class="inline-block size-2" :style="{ backgroundColor: brand.colors.primary }" />
                MES ATUAL
              </span>
              <span class="flex items-center gap-1.5">
                <span class="inline-block size-2" :style="{ backgroundColor: brand.colors.positive }" />
                ALTA PROBABILIDADE
              </span>
              <span class="flex items-center gap-1.5">
                <span class="inline-block size-2" :style="{ backgroundColor: brand.colors.border }" />
                BAIXA PROBABILIDADE
              </span>
            </div>
          </div>
        </div>

        <!-- Gráfico de Dividendos -->
        <AtomsGraphDividends
          v-if="brand.assetPage.showDividendChart"
          :data="dividendsData"
          :loading="isLoadingDividends"
        />
      </section>

      <!-- Financial Statements -->
      <section v-if="brand.assetPage.showFinancials" class="border-b py-8" :style="{ borderColor: brand.colors.border }">
        <header class="mb-6 flex flex-col gap-1">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
            [FINANCIALS.LATEST]
          </span>
          <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
            Demonstrações financeiras
          </h2>
          <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
            &gt; ULTIMO TRIMESTRE DISPONIVEL · FLUXO DE CAIXA · BALANCO · DRE
          </p>
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
          class="flex flex-col items-center justify-center brand-card border border-dashed py-12 text-center"
          :style="{ borderColor: brand.colors.border }"
        >
          <UIcon name="i-lucide-file-x" class="mb-3 h-8 w-8" :style="{ color: brand.colors.textMuted }" />
          <p class="text-sm" :style="{ color: brand.colors.textMuted }">Demonstrações indisponíveis</p>
        </div>
      </section>

      <!-- Buy & Hold Checklist -->
      <section v-if="brand.assetPage.showChecklist" class="border-b py-8" :style="{ borderColor: brand.colors.border }">
        <div class="border p-6" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <!-- Header terminal-style -->
          <header class="mb-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div class="flex flex-col gap-1">
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                  [QUALITY.CHECK]
                </span>
                <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
                  Checklist Buy & Hold
                </h2>
                <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
                  &gt; CRITERIOS PARA INVESTIDORES DE LONGO PRAZO
                </p>
              </div>

              <!-- Score as terminal register -->
              <div v-if="!isLoadingFundamentus && buyAndHoldChecklist.length" class="flex items-center gap-3 font-mono-tab">
                <span class="text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                  [SCORE]
                </span>
                <span class="text-3xl font-bold tabular-nums" :style="{ color: brand.colors.positive }">
                  {{ buyAndHoldChecklist.filter(i => i.status === 'pass').length }}
                </span>
                <span class="text-xl tabular-nums" :style="{ color: brand.colors.textMuted }">/</span>
                <span class="text-xl tabular-nums" :style="{ color: brand.colors.text }">
                  {{ buyAndHoldChecklist.length }}
                </span>
              </div>
            </div>
          </header>

          <div v-if="isLoadingFundamentus" class="grid gap-2 md:grid-cols-2">
            <USkeleton
              v-for="index in 6"
              :key="`checklist-skeleton-${index}`"
              class="h-16 brand-card"
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
                class="group flex items-center gap-3 brand-card border p-3 transition-all"
                :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
              >
                <!-- Status Icon -->
                <div
                  class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  :class="[
                    item.status === 'pass'
                      ? 'bg-green-500/10 text-green-500'
                      : item.status === 'fail'
                        ? 'bg-red-500/10 text-red-500'
                        : '',
                  ]"
                  :style="item.status === 'unknown' ? { backgroundColor: brand.colors.surface, color: brand.colors.textMuted } : {}"
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
                    <span class="text-sm" :style="{ color: brand.colors.text }">
                      {{ item.label }}
                    </span>
                    <UTooltip
                      v-if="item.tooltip"
                      :text="item.tooltip"
                      :delay-duration="0"
                    >
                      <button
                        type="button"
                        class="transition-colors"
                        :style="{ color: brand.colors.textMuted }"
                      >
                        <UIcon name="i-lucide-info" class="h-3 w-3" />
                      </button>
                    </UTooltip>
                  </div>
                  <p
                    v-if="item.detail"
                    class="text-xs leading-relaxed" :style="{ color: brand.colors.textMuted }"
                  >
                    {{ item.detail }}
                  </p>
                  <p
                    v-else-if="item.status === 'unknown'"
                    class="text-xs" :style="{ color: brand.colors.textMuted }"
                  >
                    Dados indisponíveis
                  </p>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div
              v-else
              class="flex flex-col items-center justify-center brand-card border border-dashed py-12 text-center"
              :style="{ borderColor: brand.colors.border }"
            >
              <UIcon name="i-lucide-clipboard-list" class="mb-3 h-8 w-8" :style="{ color: brand.colors.textMuted }" />
              <p class="text-sm" :style="{ color: brand.colors.textMuted }">Checklist indisponível</p>
              <p class="text-xs" :style="{ color: brand.colors.textMuted }">Dados insuficientes para análise</p>
            </div>
          </template>
        </div>
      </section>

      <!-- Company profile -->
      <section v-if="brand.assetPage.showCompanyInfo" class="border-b py-8" :style="{ borderColor: brand.colors.border }">
        <header class="mb-6 flex flex-col gap-1">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
            [COMPANY.PROFILE]
          </span>
          <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
            Sobre a empresa
          </h2>
          <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
            &gt; DADOS INSTITUCIONAIS · SETOR · INDUSTRIA
          </p>
        </header>

        <div class="border p-6" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <div class="flex items-start gap-5">
            <USkeleton v-if="isLoadingAsset" class="h-16 w-16 flex-shrink-0 rounded-xl" />
            <img
              v-else-if="asset?.logo"
              :src="asset.logo"
              :alt="`Logo de ${assetName}`"
              class="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
            />
            <div class="flex flex-1 flex-col gap-1">
              <USkeleton v-if="isLoadingAsset" class="h-6 w-48" />
              <template v-else>
                <h3 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
                  {{ asset?.name }}
                </h3>
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
                  {{ tickerUpper }} · CODIGO B3
                </span>
              </template>
            </div>
          </div>

          <div
            class="mt-6 grid grid-cols-1 gap-px border sm:grid-cols-2 lg:grid-cols-3"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
          >
            <USkeleton v-if="isLoadingAsset" class="h-16" />
            <template v-else>
              <div v-if="asset?.sector" class="flex flex-col gap-1 px-4 py-4" :style="{ backgroundColor: brand.colors.background }">
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                  [SETOR]
                </span>
                <span class="text-sm font-medium" :style="{ color: brand.colors.text }">{{ asset.sector }}</span>
              </div>
              <div v-if="asset?.industry" class="flex flex-col gap-1 px-4 py-4" :style="{ backgroundColor: brand.colors.background }">
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                  [INDUSTRIA]
                </span>
                <span class="text-sm font-medium" :style="{ color: brand.colors.text }">{{ asset.industry }}</span>
              </div>
              <div v-if="asset?.website" class="flex flex-col gap-1 px-4 py-4" :style="{ backgroundColor: brand.colors.background }">
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                  [WEBSITE]
                </span>
                <a
                  :href="asset.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm font-medium transition-colors hover:underline"
                  :style="{ color: brand.colors.primary }"
                >
                  {{ asset.website.replace(/^https?:\/\//, '').replace(/\/$/, '') }} →
                </a>
              </div>
            </template>
          </div>
        </div>
      </section>

      <!-- Seção de IA para não autenticados — terminal REPL style -->
      <section v-if="!authStore.isAuthenticated" class="border-t py-12" :style="{ borderColor: brand.colors.border }">
        <header class="mb-6 flex flex-col gap-1">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
            [AI.ASSISTANT]
          </span>
          <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
            Dúvidas sobre <span class="italic" :style="{ color: brand.colors.primary }">{{ tickerUpper }}</span>?
          </h2>
          <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
            &gt; PERGUNTE QUALQUER COISA · RESPOSTA EM ~3 SEGUNDOS
          </p>
        </header>

        <!-- Terminal-styled query cards — like recent commands list -->
        <div class="mb-6 grid gap-px border sm:grid-cols-3" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }">
          <NuxtLink
            v-for="(item, idx) in [
              { text: `Vale investir em ${tickerUpper}?`, desc: 'Analise de viabilidade' },
              { text: 'Qual o preço teto?', desc: 'Metodo Bazin' },
              { text: 'Relatório completo', desc: 'Analise fundamentalista' },
            ]"
            :key="idx"
            to="/auth/login"
            class="group flex flex-col gap-2 p-5 transition-colors hover:brightness-125"
            :style="{ backgroundColor: brand.colors.surface }"
          >
            <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
              [Q.{{ String(idx + 1).padStart(2, '0') }}]
            </span>
            <p class="text-base font-semibold leading-snug" :style="{ color: brand.colors.text }">
              <span :style="{ color: brand.colors.primary }">&gt;</span> {{ item.text }}
            </p>
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
              {{ item.desc }}
            </span>
            <span class="mt-auto flex items-center gap-1 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors" :style="{ color: brand.colors.textMuted }">
              PERGUNTAR →
            </span>
          </NuxtLink>
        </div>

        <!-- CTA as terminal keyboard key -->
        <div class="flex flex-col items-center gap-4 border p-6 md:p-8" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <UButton
            to="/auth/login"
            size="xl"
            class="group w-full font-mono-tab font-semibold uppercase tracking-wider transition-all hover:opacity-90 sm:w-auto"
            :style="{
              backgroundColor: brand.colors.primary,
              color: brand.colors.background,
            }"
          >
            <template #leading>
              <span class="font-mono-tab text-[10px] opacity-70">[F3]</span>
            </template>
            {{ brand.ai.ctaButton }}
          </UButton>
          <p class="flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">
            <UIcon name="i-lucide-shield-check" class="h-3 w-3" />
            GRATUITO · SEM CARTAO · RESPOSTA EM SEGUNDOS
          </p>
        </div>
      </section>

      <MoleculesChat
        v-else
        class="w-full" :style="{ backgroundColor: brand.colors.surface }"
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

const brand = useBrand()
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

onMounted(() => {
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
  const url = runtimeConfig.public?.siteUrl || brand.url
  return url.endsWith('/') ? url.slice(0, -1) : url
})

const tickerUpper = computed(() => ticker.toUpperCase())

// ==========================================================
// Terminal-style formatters (Redentia Bloomberg-reimagined hero)
// ==========================================================

function formatPriceNumber(value: unknown): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return '—'
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatVolumeShort(value: unknown): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num) || num <= 0) return '—'
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return String(Math.round(num))
}

function formatMarketCapShort(value: unknown): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num) || num <= 0) return '—'
  if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(1)}T`
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(0)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(0)}M`
  return num.toLocaleString('pt-BR')
}

function formatDyShort(value: unknown): string {
  if (value == null) return '—'
  const str = String(value).replace('%', '').trim()
  const num = Number(str)
  if (!Number.isFinite(num)) return '—'
  return `${num.toFixed(2)}%`
}

// Current volume — tries fundamentus first, then asset field
const currentVolume = computed(() => {
  const v = safeNumber(
    (fundamentusData.value as any)?.key_statistics?.volume
  )
  if (v !== null) return v
  return safeNumber((asset.value as any)?.volume) ?? 0
})

// "Last update" label for the status bar — tracks the latest price_at
const lastUpdateLabel = computed(() => {
  const rawDate = (asset.value as any)?.price_at || (asset.value as any)?.priceAt
  if (!rawDate) return ''
  try {
    const d = new Date(rawDate)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  } catch {
    return ''
  }
})

// Fundamentals register rows — maps basicIndicators into the terminal grid.
const fundamentalsCells = computed(() => {
  const ind = basicIndicators.value
  if (!ind) return []
  return [
    { label: 'P/L', value: ind.pl, tooltip: 'Preco sobre Lucro' },
    { label: 'P/VP', value: ind.pvpa, tooltip: 'Preco sobre Valor Patrimonial' },
    { label: 'DY', value: ind.dividendYield, tooltip: 'Dividend Yield 12M', accent: brand.colors.primary },
    { label: 'ROE', value: ind.roe, tooltip: 'Return on Equity' },
    { label: 'ROA', value: ind.roa, tooltip: 'Return on Assets' },
    { label: 'MG.LIQ', value: ind.netMargin, tooltip: 'Margem liquida' },
  ]
})

// Dividend heatmap cell styling — flat terminal look, no rounded/gradients.
// Cells share a border via gap-px on a bordered parent, so each cell is
// a simple rectangle filled with surface/background colors.
function monthCellStyle(item: any): Record<string, string> {
  if (item.highlight) {
    return {
      backgroundColor: brand.colors.primary + '1F', // ~12% amber tint
      borderLeft: `2px solid ${brand.colors.primary}`,
    }
  }
  if (item.percentage >= 80) {
    return {
      backgroundColor: brand.colors.positive + '14', // ~8% green tint
    }
  }
  if (item.percentage >= 50) {
    return {
      backgroundColor: brand.colors.positive + '0A', // ~4% green tint
    }
  }
  if (item.percentage > 0) {
    return { backgroundColor: brand.colors.surface }
  }
  return { backgroundColor: brand.colors.background }
}

function monthCellAccent(item: any): string {
  if (item.highlight) return brand.colors.primary
  if (item.percentage >= 80) return brand.colors.positive
  if (item.percentage >= 50) return brand.colors.text
  if (item.percentage > 0) return brand.colors.textMuted
  return brand.colors.border
}

// Smart/AI-interpreted indicators register
const smartCells = computed(() => {
  const ii = intelligentIndicators.value
  if (!ii) return []
  return [
    { label: 'D/E', value: (ii.debtToEquity?.value || '') + (ii.debtToEquity?.value ? '%' : '') },
    { label: 'LIQ.CORR', value: ii.currentRatio?.value },
    { label: 'ROE', value: ii.roe?.value },
    { label: 'ROA', value: ii.roa?.value },
    { label: 'MG.LUCRO', value: ii.profitMargin?.value },
    { label: 'P/VP', value: ii.priceToBook?.value },
    { label: 'P/L.FWD', value: ii.forwardPE?.value },
    { label: 'BAZIN', value: ii.bazinPrice?.value },
  ]
})

// ==========================================================
// Market Commentaries (AI-generated news/analysis)
// ==========================================================
const commentariesService = useCommentariesService()
const { data: commentariesData } = await useAsyncData(
  `commentaries-${ticker}`,
  () => commentariesService.forTicker(ticker),
  { default: () => [] }
)
const commentaries = computed(() => commentariesData.value || [])

const chartMarkers = computed(() =>
  commentaries.value.map((c) => ({
    date: c.date,
    title: c.title,
    changePercent: c.change_percent,
  }))
)

const highlightedCommentaryDate = ref<string | null>(null)

function onMarkerClick(date: string) {
  highlightedCommentaryDate.value = date
  // Scroll to the commentary element
  nextTick(() => {
    const el = document.getElementById(`commentary-${date}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Clear highlight after a few seconds
      setTimeout(() => {
        highlightedCommentaryDate.value = null
      }, 3000)
    }
  })
}

// ==========================================================
// Backfill: generate historical commentaries on first visit
// ==========================================================
interface BackfillStatus {
  running: boolean
  total: number
  current: number
  done: boolean
}

const backfillStatus = ref<BackfillStatus | null>(null)
let backfillPollTimer: ReturnType<typeof setInterval> | null = null

async function refreshCommentaries() {
  try {
    const fresh = await commentariesService.forTicker(ticker)
    commentariesData.value = fresh
  } catch {}
}

async function startBackfill() {
  try {
    // Fire and forget (don't await the POST — server runs it async)
    await $fetch<{ queued?: number; skipped?: boolean; reason?: string }>(
      '/api/commentaries/backfill-ticker',
      {
        method: 'POST',
        body: { ticker: tickerUpper.value },
      }
    ).catch(() => null)

    // Poll status every 3s
    let stableCount = 0
    backfillPollTimer = setInterval(async () => {
      try {
        const res = await $fetch<{ status: BackfillStatus; stale?: boolean }>(
          '/api/commentaries/backfill-status',
          { query: { ticker: tickerUpper.value } }
        )
        const status = res?.status
        if (!status) return

        // Only expose to UI if there's actual work
        if (status.total > 0 && !status.done) {
          backfillStatus.value = status
        }

        // Refresh commentaries list whenever progress increments
        if (status.current > 0) {
          await refreshCommentaries()
        }

        if (status.done || !status.running) {
          stableCount++
          // Wait one extra tick to catch the last saved commentary
          if (stableCount >= 2) {
            backfillStatus.value = null
            if (backfillPollTimer) {
              clearInterval(backfillPollTimer)
              backfillPollTimer = null
            }
          }
        }
      } catch {}
    }, 3000)

    // Hard timeout after 3 minutes
    setTimeout(
      () => {
        if (backfillPollTimer) {
          clearInterval(backfillPollTimer)
          backfillPollTimer = null
        }
        backfillStatus.value = null
      },
      3 * 60 * 1000
    )
  } catch {}
}

onMounted(() => {
  // Start backfill in background — but only if this tenant actually
  // shows market commentaries. Saves AI costs on tenants that disabled it.
  if (brand.features?.showMarketCommentaries === false) return
  if (brand.assetPage.showMarketCommentaries === false) return
  startBackfill()
})

onBeforeUnmount(() => {
  if (backfillPollTimer) {
    clearInterval(backfillPollTimer)
    backfillPollTimer = null
  }
})

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
  return `${baseSentence}${intradaySegment}. ${yearSegment}Explore dividendos, indicadores fundamentalistas e análises com IA na ${brand.name}.`
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

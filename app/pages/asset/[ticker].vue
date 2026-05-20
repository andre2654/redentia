<template>
  <NuxtLayout
    :name="layoutName"
    container-class="md:px-0"
  >
    <!-- ============ ALIAS BANNERS ============
         Quando o user chegou via código antigo (ex: /asset/EMBR3 que
         foi renomeada pra EMBJ3) ou ativo delisted (AZUL4), o backend
         retorna `meta` com a info. Renderizamos um aviso no topo
         da página antes do conteúdo principal. -->
    <div
      v-if="aliasFromQuery"
      class="mx-auto mb-3 max-w-6xl px-4 md:px-0"
    >
      <div
        class="flex items-center gap-2 rounded-md border px-3 py-2 text-[12.5px]"
        :style="{
          borderColor: 'color-mix(in srgb, var(--brand-primary) 30%, transparent)',
          background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)',
          color: 'var(--brand-text)',
        }"
      >
        <UIcon name="i-lucide-arrow-right-left" class="size-3.5 shrink-0" />
        <span>
          <strong>{{ aliasFromQuery }}</strong> foi renomeado para
          <strong>{{ tickerUpper }}</strong>.
          <span :style="{ color: 'var(--brand-text-muted)' }">
            Buscas pelo código antigo continuam funcionando.
          </span>
        </span>
      </div>
    </div>

    <div
      v-else-if="assetMeta?.delisted"
      class="mx-auto mb-3 max-w-6xl px-4 md:px-0"
    >
      <div
        class="flex items-center gap-2 rounded-md border px-3 py-2 text-[12.5px]"
        :style="{
          borderColor: 'color-mix(in srgb, var(--brand-negative) 30%, transparent)',
          background: 'color-mix(in srgb, var(--brand-negative) 6%, transparent)',
          color: 'var(--brand-text)',
        }"
      >
        <UIcon name="i-lucide-circle-x" class="size-3.5 shrink-0" :style="{ color: 'var(--brand-negative)' }" />
        <span>
          <strong>{{ tickerUpper }}</strong> está descontinuado{{ assetMeta.event_date ? ` desde ${formatDelistDate(assetMeta.event_date)}` : '' }}.
          <span :style="{ color: 'var(--brand-text-muted)' }">
            Últimos dados conhecidos abaixo, sem atualização.
          </span>
        </span>
      </div>
    </div>

    <!-- ========================================================
         VARIANT ROUTER
         Tenants podem trocar o layout inteiro da asset page via
         `assetPage.variant` no JSONB do tenant. Cada variant e um
         componente proprio em `components/asset/Asset{Variant}.vue`
         que consome utility classes .font-{variant}-* declaradas em
         main.css. Default (Redentia / Bloomberg terminal) renderiza
         se nenhum variant casa.
         ======================================================== -->

    <!-- MENTOR (Primo Rico, "masterclass / book-cover") -->
    <AssetMentor
      v-if="brand.assetPage?.variant === 'mentor'"
      :asset="asset"
      :ticker-upper="tickerUpper"
      :asset-name="assetName"
      :resolved-logo="resolvedLogo"
      :is-loading-asset="isLoadingAsset"
      :failed-logos="failedLogos"
      :format-price-number="formatPriceNumber"
      :basic-indicators="basicIndicators"
      :mentor-quick-stats="mentorQuickStats"
      :mentor-fundamentals-list="mentorFundamentalsList"
      :mentor-asset-quote="mentorAssetQuote"
      :mentor-thesis-text="mentorThesisText"
      :mentor-one-liner="mentorOneLiner"
    >
      <template #chart-controls>
        <MoleculesPeriodSelector v-model="selectedTimeRange" :loading="isLoadingChart" />
      </template>
      <template #chart>
        <AtomsGraphLine
          :data="chartData"
          :legend="chartLabel"
          :height="360"
          :loading="isLoadingChart"
          :markers="chartMarkers"
          @marker-click="onMarkerClick"
        />
      </template>
    </AssetMentor>

    <!-- SHOWTIME (Me Poupe!, "TV show / pop magazine") -->
    <AssetShowtime
      v-else-if="brand.assetPage?.variant === 'showtime'"
      :asset="asset"
      :ticker-upper="tickerUpper"
      :asset-name="assetName"
      :resolved-logo="resolvedLogo"
      :is-loading-asset="isLoadingAsset"
      :failed-logos="failedLogos"
      :format-price-number="formatPriceNumber"
      :showtime-quick-panel="showtimeQuickPanel"
      :showtime-indicator-cards="showtimeIndicatorCards"
      :asset-editorial-date="assetEditorialDate"
    >
      <template #chart-controls>
        <MoleculesPeriodSelector v-model="selectedTimeRange" :loading="isLoadingChart" />
      </template>
      <template #chart>
        <AtomsGraphLine
          :data="chartData"
          :legend="chartLabel"
          :height="320"
          :loading="isLoadingChart"
          :markers="chartMarkers"
          @marker-click="onMarkerClick"
        />
      </template>
    </AssetShowtime>

    <!-- DEFAULT: Redentia Bloomberg-terminal layout -->
    <div v-else class="relative z-10 flex flex-col px-4 pt-4">
      <div class="flex flex-col">
        <!-- Ticker header bar (minimalista: logo + ticker + stats inline + sparkline) -->
        <section class="border-b pb-8" :style="{ borderColor: brand.colors.border }">
          <MoleculesTickerHeaderBar
            :logo="resolvedLogo && !failedLogos.isFailed(resolvedLogo) ? resolvedLogo : undefined"
            :ticker="tickerUpper"
            :name="asset?.name || assetName"
            :badge="assetBadgeLabel"
            price-label="Preço"
            price-unit="R$"
            :price-value="formatPriceNumber(asset?.market_price)"
            :change-percent="asset?.change_percent"
            :stats="sessionStats"
            :sparkline="heroSparkline.line ? { line: heroSparkline.line, area: heroSparkline.area, color: heroAccent } : undefined"
            sparkline-label="30D"
          />

          <!-- Chart with unified toolbar -->
          <div ref="assetChartRef" class="mt-8">
            <AtomsGraphLine
              :data="chartData"
              :legend="chartLabel"
              :height="360"
              :mobile-height="250"
              :loading="isLoadingChart"
              :markers="chartMarkers"
              @marker-click="onMarkerClick"
            >
              <template #toolbar>
                <AtomsGraphToolbar
                  :show-fullscreen="true"
                  @screenshot="assetScreenshotRef?.open()"
                  @fullscreen="assetFullscreenRef?.open()"
                >
                  <template #extras>
                    <span
                      class="font-mono-tab text-[11px] uppercase tracking-[0.12em]"
                      :style="{ color: brand.colors.textMuted }"
                    >
                      Histórico de cotação
                    </span>
                  </template>
                  <template #period>
                    <MoleculesPeriodSelector
                      v-model="selectedTimeRange"
                      :loading="isLoadingChart"
                    />
                  </template>
                </AtomsGraphToolbar>
              </template>
            </AtomsGraphLine>
          </div>
        </section>

        <!-- Screenshot modal -->
        <AtomsGraphScreenshotModal
          ref="assetScreenshotRef"
          :title="tickerUpper"
          :subtitle="asset?.name || assetName"
          :price-label="`R$ ${formatPriceNumber(asset?.market_price)}`"
          :change-label="`${isPositive ? '+' : ''}${Number(asset?.change_percent || 0).toFixed(2)}%`"
          :is-positive="isPositive"
          :avatar-text="tickerUpper.slice(0, 2)"
          :capture-target="() => (assetChartRef as any)?.querySelector?.('[data-chart-capture-root]') ?? null"
        />

        <!-- Fullscreen chart dialog -->
        <AtomsGraphFullscreenDialog
          ref="assetFullscreenRef"
          :title="`${tickerUpper}, ${asset?.name || assetName}`"
          :subtitle="asset?.sector || 'Ações B3'"
          :change-label="`${isPositive ? '+' : ''}${Number(asset?.change_percent || 0).toFixed(2)}%`"
          :is-positive="isPositive"
        >
          <template #chart="{ expandedHeight }">
            <AtomsGraphLine
              :data="chartData"
              :legend="chartLabel"
              :height="expandedHeight"
              :mobile-height="expandedHeight"
              :loading="isLoadingChart"
              :markers="chartMarkers"
            >
              <template #toolbar>
                <AtomsGraphToolbar
                  :show-fullscreen="false"
                  :show-screenshot="false"
                >
                  <template #period>
                    <MoleculesPeriodSelector
                      v-model="selectedTimeRange"
                      :loading="isLoadingChart"
                    />
                  </template>
                </AtomsGraphToolbar>
              </template>
            </AtomsGraphLine>
          </template>
        </AtomsGraphFullscreenDialog>

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

        <!-- Imprensa (notícias dos portais financeiros que citam o ticker) -->
        <MoleculesNewsByTickerSection
          v-if="brand.assetPage.showNews"
          :ticker="tickerUpper"
        />

        <!-- Fundamentals + Volatility side by side (terminal panels) —
             only when scrape_extras is NOT available (otherwise the new
             fundamentals panel below covers these indicators + more). -->
        <section v-if="!scrapeExtras" class="grid grid-cols-1 gap-6 border-b py-8 lg:grid-cols-3" :style="{ borderColor: brand.colors.border }">
          <!-- Col 1-2: Fundamentals register -->
          <div v-if="brand.assetPage.showIndicators" class="lg:col-span-2">
            <div class="mb-4 flex flex-col gap-1">
              <h2 class="font-light" :style="{ color: brand.colors.text, fontSize: 'clamp(20px, 2.5vw, 26px)', lineHeight: 1.15, letterSpacing: '-0.3px' }">
                Indicadores fundamentalistas
              </h2>
              <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
                &gt; MÉTRICAS DE {{ tickerUpper }} · ÚLTIMA ATUALIZAÇÃO DISPONÍVEL
              </p>
            </div>

            <!-- Basic indicators register, 6 tight columns glued together -->
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
                <div class="flex items-center justify-end">
                  <UTooltip v-if="item.tooltip" :text="item.tooltip" :delay-duration="0">
                    <UIcon name="i-lucide-info" class="h-3 w-3 opacity-40" :style="{ color: brand.colors.textMuted }" />
                  </UTooltip>
                </div>
                <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
                  {{ item.label }}
                </span>
                <span class="font-mono-tab text-xl font-bold tabular-nums" :style="{ color: item.accent || brand.colors.text }">
                  {{ item.value || '-' }}
                </span>
              </div>
            </div>
            <div v-else class="border border-dashed p-6 text-center font-mono-tab text-[11px] uppercase tracking-wider" :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }">
              &gt; DATA UNAVAILABLE
            </div>

            <!-- Smart indicators register (AI analysis) — only when scrape is missing -->
            <div v-if="!scrapeExtras && brand.assetPage.showSmartIndicators && (intelligentIndicators || isLoadingFundamentus)" class="mt-4">
              <div class="mb-2 flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                <IconAi class="h-3 w-3" :style="{ fill: brand.colors.primary }" />
                <span>Análise IA</span>
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
                  <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
                    {{ item.label }}
                  </span>
                  <span class="font-mono-tab text-base font-bold tabular-nums" :style="{ color: brand.colors.text }">
                    {{ item.value || '-' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Col 3: Volatility + Analyst consensus panels -->
          <div class="lg:col-span-1 flex flex-col gap-8">
            <div v-if="brand.assetPage.showVolatility">
              <div class="mb-4 flex flex-col gap-1">
                <h2 class="font-light" :style="{ color: brand.colors.text, fontSize: 'clamp(20px, 2.5vw, 26px)', lineHeight: 1.15, letterSpacing: '-0.3px' }">
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

            <MoleculesAnalystConsensusCard v-if="brand.assetPage.showNews && !isForeignOrFii" :ticker="tickerUpper" />
          </div>
        </section>

        <!-- Fundamentals rich panels — FII / ETF / stock variant by asset_type -->
        <section v-if="scrapeExtras" class="border-b py-8" :style="{ borderColor: brand.colors.border }">
          <MoleculesStatusInvestFiiPanel v-if="scrapeExtras.asset_type === 'fii'" :extras="scrapeExtras" />
          <MoleculesStatusInvestEtfPanel v-else-if="scrapeExtras.asset_type === 'etf'" :extras="scrapeExtras" />
          <MoleculesStatusInvestPanel v-else :extras="scrapeExtras" />

          <!-- Volatility + Analyst consensus side by side (only when scrape panel is shown) -->
          <div class="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div v-if="brand.assetPage.showVolatility">
              <div class="mb-4 flex flex-col gap-1">
                <h3 class="text-[18px] font-medium" :style="{ color: brand.colors.text, letterSpacing: '-0.22px' }">
                  Volatilidade
                </h3>
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

            <MoleculesAnalystConsensusCard v-if="brand.assetPage.showNews && !isForeignOrFii" :ticker="tickerUpper" />
          </div>
        </section>
      </div>

      <!-- Dividends -->
      <section v-if="(brand.assetPage.showDividendMap || brand.assetPage.showDividendChart) && !isEtf" class="border-b py-8" :style="{ borderColor: brand.colors.border }">
        <!-- Terminal header -->
        <header class="mb-6 flex flex-col gap-1">
          <h2 class="font-light" :style="{ color: brand.colors.text, fontSize: 'clamp(20px, 2.5vw, 26px)', lineHeight: 1.15, letterSpacing: '-0.3px' }">
            Dividendos e proventos
          </h2>
          <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
            &gt; HISTÓRICO DE PAGAMENTOS{{ isForeignOrFii ? '' : ' · PROBABILIDADE MENSAL' }}
          </p>
        </header>

        <!-- MDI Card, terminal dividend heatmap — stock-only; FIIs distribute
             monthly, BDRs irregularly, so probability-by-month is noise there -->
        <div v-if="brand.assetPage.showDividendMap && !isForeignOrFii" class="mb-8 border" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <!-- Header: mono label + reference -->
          <div class="flex items-center justify-between border-b px-5 py-3" :style="{ borderColor: brand.colors.border }">
            <div class="flex flex-col gap-0.5">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                Histórico de dividendos
              </span>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
                &gt; PROBABILIDADE MENSAL · BASELINE 10A
              </span>
            </div>
            <div v-if="isLoadingDividends" class="flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">
              <UIcon name="i-lucide-loader-2" class="h-3 w-3 motion-safe:animate-spin" />
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
                {{ item.label }}
              </span>

              <!-- Percentage big mono -->
              <span
                class="font-mono-tab text-xl font-bold tabular-nums md:text-2xl"
                :style="{ color: monthCellAccent(item) }"
              >
                {{ item.formattedPercentage }}
              </span>

              <!-- Tiny bar indicator at the bottom, horizontal, width = percentage -->
              <div class="mt-auto h-[3px] w-full" :style="{ backgroundColor: brand.colors.border }">
                <div
                  class="h-full transition-[transform,opacity,box-shadow,background-color,border-color,filter]"
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

      <!-- Financial Statements — hidden for BDRs (foreign company) and ETFs
           (basket, not an operating company with DRE/balance) -->
      <section v-if="brand.assetPage.showFinancials && !isBdr && !isEtf" class="border-b py-8" :style="{ borderColor: brand.colors.border }">
        <header class="mb-6 flex flex-col gap-1">
          <h2 class="font-light" :style="{ color: brand.colors.text, fontSize: 'clamp(20px, 2.5vw, 26px)', lineHeight: 1.15, letterSpacing: '-0.3px' }">
            Demonstrações financeiras
          </h2>
          <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
            &gt; ÚLTIMO TRIMESTRE DISPONÍVEL{{ isFii ? ' · BALANÇO · DRE' : ' · FLUXO DE CAIXA · BALANÇO · DRE' }}
          </p>
        </header>

        <div
          v-if="
            cashFlowItems.length ||
            balanceItems.length ||
            incomeItems.length ||
            isLoadingFundamentus
          "
          class="grid gap-4"
          :class="isFii ? 'lg:grid-cols-2' : 'lg:grid-cols-3'"
        >
          <AtomsGraphFinancialSummary
            v-if="!isFii"
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

      <!-- Buy & Hold Checklist — stock, FII, or BDR variant. ETFs don't
           have per-fund fundamentals that map to these criteria. -->
      <section v-if="brand.assetPage.showChecklist && !isEtf" class="border-b py-8" :style="{ borderColor: brand.colors.border }">
        <div class="border p-6" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <!-- Header terminal-style -->
          <header class="mb-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div class="flex flex-col gap-1">
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                  Qualidade
                </span>
                <h2 class="font-light" :style="{ color: brand.colors.text, fontSize: 'clamp(20px, 2.5vw, 26px)', lineHeight: 1.15, letterSpacing: '-0.3px' }">
                  Checklist Buy & Hold
                </h2>
                <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
                  &gt; CRITERIOS PARA INVESTIDORES DE LONGO PRAZO
                </p>
              </div>

              <!-- Score as terminal register -->
              <div v-if="!isLoadingFundamentus && activeChecklist.length" class="flex items-center gap-3 font-mono-tab">
                <span class="text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                  Score
                </span>
                <span class="text-3xl font-light tabular-nums" :style="{ color: brand.colors.positive, letterSpacing: '-0.02em' }">
                  {{ activeChecklist.filter(i => i.status === 'pass').length }}
                </span>
                <span class="text-xl tabular-nums" :style="{ color: brand.colors.textMuted }">/</span>
                <span class="text-xl tabular-nums" :style="{ color: brand.colors.text }">
                  {{ activeChecklist.length }}
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
              v-if="activeChecklist.length"
              class="grid gap-2 md:grid-cols-2"
            >
              <div
                v-for="item in activeChecklist"
                :key="item.id"
                class="group flex items-center gap-3 brand-card border p-3 transition-[transform,opacity,box-shadow,background-color,border-color,filter]"
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
          <h2 class="font-light" :style="{ color: brand.colors.text, fontSize: 'clamp(20px, 2.5vw, 26px)', lineHeight: 1.15, letterSpacing: '-0.3px' }">
            Sobre a empresa
          </h2>
          <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
            &gt; DADOS INSTITUCIONAIS · SETOR · INDÚSTRIA
          </p>
        </header>

        <div class="border p-6" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <div class="flex items-start gap-5">
            <USkeleton v-if="isLoadingAsset" class="h-16 w-16 flex-shrink-0 rounded-xl" />
            <img
              v-else-if="resolvedLogo && !failedLogos.isFailed(resolvedLogo)"
              :src="resolvedLogo"
              :alt="`Logo de ${assetName}`"
              class="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
              @error="failedLogos.markFailed(resolvedLogo)"
            />
            <div
              v-else-if="!isLoadingAsset"
              class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl"
              :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 8%, transparent)`, color: brand.colors.textMuted }"
              aria-hidden="true"
            >
              <span class="font-mono-tab text-base font-bold">{{ tickerUpper.slice(0, 2) }}</span>
            </div>
            <div class="flex flex-1 flex-col gap-1">
              <USkeleton v-if="isLoadingAsset" class="h-6 w-48" />
              <template v-else>
                <h3 class="text-[18px] font-medium md:text-[20px]" :style="{ color: brand.colors.text, letterSpacing: '-0.22px' }">
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
                  Setor
                </span>
                <span class="text-sm font-medium" :style="{ color: brand.colors.text }">{{ asset.sector }}</span>
              </div>
              <div v-if="asset?.industry" class="flex flex-col gap-1 px-4 py-4" :style="{ backgroundColor: brand.colors.background }">
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                  Indústria
                </span>
                <span class="text-sm font-medium" :style="{ color: brand.colors.text }">{{ asset.industry }}</span>
              </div>
              <div v-if="asset?.website" class="flex flex-col gap-1 px-4 py-4" :style="{ backgroundColor: brand.colors.background }">
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                  Website
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

          <!-- Description completa da empresa, dentro do card. -->
          <div
            v-if="editorialDescriptionParagraphs.length"
            class="mt-6 flex flex-col gap-4"
          >
            <p
              v-for="(p, idx) in editorialDescriptionParagraphs"
              :key="idx"
              class="text-[15px] leading-[1.7]"
              :style="{ color: brand.colors.textMuted }"
            >{{ p }}</p>
          </div>

          <!-- Editorial completo (Tese, Comparacao, Trajetoria, FAQ)
               dentro do mesmo card pra manter toda a info da empresa
               num container unificado. -->
          <MoleculesAssetEditorial
            v-if="editorial"
            :editorial="editorial"
            :ticker-upper="tickerUpper"
            :asset-name="assetName"
          />
        </div>
      </section>

      <!-- Seção de IA para não autenticados, terminal REPL style -->
      <section v-if="!authStore.isAuthenticated" class="border-t py-12" :style="{ borderColor: brand.colors.border }">
        <header class="mb-6 flex flex-col gap-1">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
            Assistente IA
          </span>
          <h2 class="font-light" :style="{ color: brand.colors.text, fontSize: 'clamp(20px, 2.5vw, 26px)', lineHeight: 1.15, letterSpacing: '-0.3px' }">
            Dúvidas sobre <span class="italic" :style="{ color: brand.colors.primary }">{{ tickerUpper }}</span>?
          </h2>
          <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
            &gt; PERGUNTE QUALQUER COISA · RESPOSTA EM ~3 SEGUNDOS
          </p>
        </header>

        <!-- Terminal-styled query cards, like recent commands list -->
        <div class="mb-6 grid gap-px border sm:grid-cols-3" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }">
          <NuxtLink
            v-for="(item, idx) in [
              { text: `Vale investir em ${tickerUpper}?`, desc: 'Analise de viabilidade' },
              { text: 'Qual o preço teto?', desc: 'Método Bazin' },
              { text: 'Relatório completo', desc: 'Analise fundamentalista' },
            ]"
            :key="idx"
            to="/auth/login"
            class="group flex flex-col gap-2 p-5 transition-colors hover:brightness-125"
            :style="{ backgroundColor: brand.colors.surface }"
          >
            <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
              Pergunta {{ idx + 1 }}
            </span>
            <p class="text-base font-medium leading-snug" :style="{ color: brand.colors.text }">
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
            class="group w-full font-mono-tab font-semibold uppercase tracking-wider transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:opacity-90 sm:w-auto"
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

      <!-- Embedded AI chat removed — the page-level CTA above
           (Botão "Tire suas dúvidas com IA") now redirects to the
           dedicated /help chat surface via QuickSearch. -->
      <div v-else />
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
const failedLogos = useFailedLogos()
const authStore = useAuthStore()
const route = useRoute()
const {
  assetHistoricPrices,
  getTickerDetailsWithMeta,
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
  data: assetResponse,
  pending: assetPending,
  error: assetError,
} = await useAsyncData(`asset-details-${ticker.toLowerCase()}`, () =>
  getTickerDetailsWithMeta(ticker)
)

if (assetError.value || !assetResponse.value?.data) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Asset not found',
    fatal: true,
  })
}

// Backend retorna { data: <asset>, meta?: { alias_resolved_from, delisted, ... } }
// quando o ticker pesquisado é alias antigo. Mantemos `asset` apontando
// pro inner data pra todo o resto da página continuar funcionando, e
// expomos `assetMeta` separado pra banner + redirect.
const asset = computed(() => assetResponse.value?.data ?? null)
const assetMeta = computed(() => assetResponse.value?.meta ?? null)

// Rename/merger: backend já resolveu pro canônico, só precisamos atualizar
// a URL pra refletir. `replace: true` substitui no history (sem flash do
// /asset/EMBR3 ficando no botão "voltar"). Query `?from=EMBR3` permite
// a página destino mostrar banner explicando a renomeação.
if (
  process.client &&
  assetMeta.value?.alias_resolved_from &&
  asset.value?.ticker &&
  asset.value.ticker.toUpperCase() !== ticker.toUpperCase()
) {
  navigateTo(
    {
      path: `/asset/${String(asset.value.ticker).toLowerCase()}`,
      query: { from: ticker.toUpperCase() },
    },
    { replace: true },
  )
}

// Param `?from=EMBR3` setado pelo redirect quando o user chega via
// código antigo. Banner usa pra mostrar "EMBR3 foi renomeado para EMBJ3".
const aliasFromQuery = computed(() => {
  const f = route.query?.from
  if (typeof f === 'string' && f.length > 0) return f.toUpperCase()
  return null
})

// Formata "2025-05-01" → "mai/2025" pro banner de delisted ficar curto.
function formatDelistDate(iso: string | null): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
    return `${months[d.getMonth()]}/${d.getFullYear()}`
  } catch {
    return iso
  }
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
  if (!Number.isFinite(num)) return '-'
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatVolumeShort(value: unknown): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num) || num <= 0) return '-'
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return String(Math.round(num))
}

function formatMarketCapShort(value: unknown): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num) || num <= 0) return '-'
  if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(1)}T`
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(0)}B`
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(0)}M`
  return num.toLocaleString('pt-BR')
}

function formatDyShort(value: unknown): string {
  if (value == null) return '-'
  const str = String(value).replace('%', '').trim()
  const num = Number(str)
  if (!Number.isFinite(num)) return '-'
  return `${num.toFixed(2)}%`
}

// Current volume, tries fundamentus first, then asset field
const currentVolume = computed(() => {
  const v = safeNumber(
    (fundamentusData.value as any)?.key_statistics?.volume
  )
  if (v !== null) return v
  return safeNumber((asset.value as any)?.volume) ?? 0
})

// "Last update" label for the status bar, tracks the latest price_at
const lastUpdateLabel = computed(() => {
  const rawDate = (asset.value as any)?.price_at || (asset.value as any)?.priceAt
  if (!rawDate) return ''
  const d = new Date(rawDate)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
})

// Fundamentals register rows, maps basicIndicators into the terminal grid.
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

// Dividend heatmap cell styling, flat terminal look, no rounded/gradients.
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

// ==========================================================
// Editorial variant helpers (Norte Capital, advisor letter tone)
// ==========================================================

const assetEditorialDate = computed(() => {
  try {
    const d = new Date()
    const full = d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return full.charAt(0).toUpperCase() + full.slice(1)
  } catch {
    return ''
  }
})

// ==========================================================
// SHOWTIME VARIANT, Me Poupe! asset page helpers
// ==========================================================

// Quick panel on the cover (tilted card on the right)
const showtimeQuickPanel = computed(() => {
  const ind = basicIndicators.value
  const rows: { label: string; value: string; icon: string }[] = []

  rows.push({
    label: 'MARKET CAP',
    icon: 'i-lucide-landmark',
    value: formatMarketCapShort(asset.value?.market_cap) || '-',
  })
  rows.push({
    label: 'VOLUME HOJE',
    icon: 'i-lucide-activity',
    value: formatVolumeShort(currentVolume.value) || '-',
  })
  if (ind?.dividendYield) {
    rows.push({
      label: 'DIVIDENDOS',
      icon: 'i-lucide-piggy-bank',
      value: String(ind.dividendYield),
    })
  }
  if (ind?.pl) {
    rows.push({
      label: 'P/L',
      icon: 'i-lucide-calculator',
      value: String(ind.pl),
    })
  }
  return rows
})

// Indicator cards translated into Nath's voice
const showtimeIndicatorCards = computed(() => {
  const ind = basicIndicators.value
  const cards: { label: string; value: string; icon: string; explain: string }[] = []

  cards.push({
    label: 'DIVIDEND YIELD',
    value: ind?.dividendYield ? String(ind.dividendYield) : '-',
    icon: 'i-lucide-piggy-bank',
    explain: 'O quanto a empresa te paga por ano só por você ser dono dela. Quanto maior, mais dinheiro pingando.',
  })
  cards.push({
    label: 'P / L',
    value: ind?.pl ? String(ind.pl) : '-',
    icon: 'i-lucide-calculator',
    explain: 'Quantos anos de lucro custa comprar a empresa hoje. Abaixo de 15 costuma ser um bom sinal.',
  })
  cards.push({
    label: 'P / VPA',
    value: ind?.pvpa ? String(ind.pvpa) : '-',
    icon: 'i-lucide-scale',
    explain: 'Quanto você paga por cada real de patrimônio. Perto de 1 é a conta justa.',
  })
  cards.push({
    label: 'ROE',
    value: ind?.roe ? String(ind.roe) : '-',
    icon: 'i-lucide-trending-up',
    explain: 'O quanto a empresa gera de retorno pro dono. Acima de 10% é festa do aluguel!',
  })
  return cards
})

// ==========================================================
// Mentor variant helpers (Primo Rico, masterclass tone)
// ==========================================================

// Quick 4-stat block rendered in the hero right column.
const mentorQuickStats = computed(() => {
  const ind = basicIndicators.value
  if (!ind) return []
  return [
    { label: 'DIVIDEND YIELD', value: ind.dividendYield },
    { label: 'P/L', value: ind.pl },
    { label: 'P/VP', value: ind.pvpa },
    { label: 'ROE', value: ind.roe },
  ]
})

// Fundamentals list, 6 heavy rows with descriptive copy in the mentor tone.
const mentorFundamentalsList = computed(() => {
  const ind = basicIndicators.value
  if (!ind) return []
  return [
    {
      label: 'PREÇO / LUCRO',
      shortCode: 'P/L · Quantos anos pra pagar o investimento',
      description: 'Quanto mais baixo, mais descontado está o ativo em relação ao lucro gerado. Compare sempre com pares do mesmo setor.',
      value: ind.pl,
    },
    {
      label: 'PREÇO / VALOR PATRIMONIAL',
      shortCode: 'P/VP · O mercado paga acima ou abaixo do book value',
      description: 'Abaixo de 1 significa que o ativo negocia por menos do que vale no papel. Cuidado com value traps, entenda porquê está barato.',
      value: ind.pvpa,
    },
    {
      label: 'DIVIDEND YIELD',
      shortCode: 'DY 12M · Renda passiva em relação ao preço',
      description: 'Quanto o ativo distribui em proventos por ano como percentual do preço atual. Útil para comparar geradores de caixa.',
      value: ind.dividendYield,
    },
    {
      label: 'RETORNO SOBRE PATRIMÔNIO',
      shortCode: 'ROE · Eficiência do capital dos acionistas',
      description: 'Acima de 15% é sinal de gestão eficiente. Empresas que sustentam ROE alto por anos são as que constroem valor de verdade.',
      value: ind.roe,
    },
    {
      label: 'RETORNO SOBRE ATIVOS',
      shortCode: 'ROA · Eficiência sobre todos os ativos',
      description: 'Mede quanto a empresa gera de lucro sobre cada real de ativo. Menos manipulável que o ROE porque ignora a alavancagem.',
      value: ind.roa,
    },
    {
      label: 'MARGEM LÍQUIDA',
      shortCode: 'MG.LÍQ · Quanto sobra de cada real vendido',
      description: 'Percentual do lucro líquido sobre a receita total. Margens sustentáveis de dois dígitos indicam negócio com moat.',
      value: ind.netMargin,
    },
  ]
})

// Pull quote in the mentor variant, rotates between a few Thiago-esque lines
// based on the asset's change percent so it feels contextual without hitting AI.
const mentorAssetQuote = computed(() => {
  const pct = Number(asset.value?.change_percent)
  if (Number.isFinite(pct)) {
    if (pct < -3) return 'O mercado testa sua convicção todo dia. Tese não muda com 3% de queda.'
    if (pct < 0) return 'Preço oscila. Fundamento, não.'
    if (pct > 3) return 'Euforia não é motivo pra comprar. Nem sua ausência é motivo pra vender.'
  }
  return 'Patrimônio se constrói com consistência, não com sorte. Skin in the game.'
})

// Thesis text, a narrated paragraph that adapts to the basic indicators.
const mentorThesisText = computed(() => {
  const ind = basicIndicators.value
  const name = asset.value?.name || tickerUpper.value
  if (!ind) {
    return `${name} está no seu radar? Antes de qualquer decisão, entenda o negócio: como a empresa ganha dinheiro, quem são os concorrentes, qual a margem de segurança na tese. Os números são só a foto, a história é que importa.`
  }
  const pl = parseFloat(String(ind.pl).replace(',', '.'))
  const dy = parseFloat(String(ind.dividendYield).replace(',', '.').replace('%', ''))
  const parts: string[] = [`${name} negocia a ${ind.pl} vezes lucros`]
  if (Number.isFinite(pl) && pl < 10) parts.push(', múltiplo que, em ambientes normais, indica desconto em relação ao fluxo de caixa gerado')
  else if (Number.isFinite(pl) && pl > 20) parts.push(', múltiplo esticado que exige crescimento sustentado pra fazer sentido')
  if (Number.isFinite(dy) && dy >= 5) {
    parts.push(`e distribui ${ind.dividendYield} ao ano em proventos, acima do CDI em vários cenários`)
  }
  parts.push('.\n\nOlhe além do número: entenda o ciclo do setor, a consistência histórica dos resultados e o posicionamento competitivo. Nenhum indicador sozinho substitui pensamento.')
  return parts.join(' ')
})

// A punchy one-liner summary in the thesis section.
const mentorOneLiner = computed(() => {
  const ind = basicIndicators.value
  if (!ind) return 'Faça sua lição de casa antes de decidir.'
  const dy = parseFloat(String(ind.dividendYield).replace(',', '.').replace('%', ''))
  if (Number.isFinite(dy) && dy >= 6) return 'Gerador de caixa para quem busca renda passiva com disciplina.'
  const pl = parseFloat(String(ind.pl).replace(',', '.'))
  if (Number.isFinite(pl) && pl < 10) return 'Múltiplo descontado, vale entender se é oportunidade ou value trap.'
  return 'Um caso que merece estudo antes de virar posição.'
})

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

// ==========================================================
// Editorial content — description, tese, peers, history, FAQ
// extendida. Pages com editorial ficam ricas (~3.500 palavras
// vs 1.000 do template base) pra escapar do "Cópia sem
// canônica" do Google. Quando o ticker nao tem editorial
// gerado ainda, retorna null e o componente nao monta.
// ==========================================================
const apiBase = useRuntimeConfig().public.apiBaseUrl as string
interface AssetEditorialPayload {
  ticker: string
  description: string | null
  thesis_pros: string | null
  thesis_cons: string | null
  peers_comparison: string | null
  history_summary: string | null
  faq_extended: Array<{ question: string; answer: string }> | null
  generated_at: string | null
}
const { data: editorial } = await useAsyncData<AssetEditorialPayload | null>(
  `editorial-${ticker.toLowerCase()}`,
  async () => {
    try {
      return await $fetch<AssetEditorialPayload>(`${apiBase}/assets/${ticker.toLowerCase()}/editorial`)
    } catch {
      return null
    }
  },
  { default: () => null, server: true }
)

// Description completa da empresa pra mostrar dentro do card de
// "Sobre a empresa". A seccao "Sobre" foi removida do editorial
// abaixo pra evitar duplicacao — agora tudo sobre a identidade
// vive no card, e o editorial fica focado em analise.
const editorialDescriptionParagraphs = computed<string[]>(() => {
  const desc = editorial.value?.description
  if (!desc) return []
  return desc.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
})

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
    // Fire and forget (don't await the POST, server runs it async)
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
  // Start backfill in background, but only if this tenant actually
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
  if (!resolvedName) return tickerUpper.value
  // Brapi costuma devolver "BRASIL      ON      NM" com espacos multiplos
  // para alinhamento. Normaliza para evitar strings feias em title/meta.
  return String(resolvedName).replace(/\s+/g, ' ').trim()
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

const pageTitle = computed(() => {
  // Ticker primeiro, mais curto e direto. Meta Seobility: < 580px.
  // Formato anterior tinha 615px com preço + nome + 3 keywords; reduzido
  // removendo "e Análise" e encurtando o nome da empresa quando possível.
  const price = formattedAssetPrice.value
    ? ` ${formattedAssetPrice.value}`
    : ''
  return `${tickerUpper.value}${price} · ${assetName.value} | Cotação e Dividendos`
})

const pageDescription = computed(() => {
  // Meta Seobility: max 1000px (antes: 1435px). Encurtado removendo
  // redundâncias (nome da empresa já vem no title) e lista longa de
  // keywords no final. Mantém ticker + preço + variação + CTA curto.
  const priceSegment = formattedAssetPrice.value
    ? `hoje ${formattedAssetPrice.value}`
    : 'em tempo real'
  const intradaySegment = dailyChangeSentence.value
    ? `, ${dailyChangeSentence.value}`
    : ''
  const yearSegment = yearChangeSentence.value
    ? ` ${yearChangeSentence.value}.`
    : ''
  return `${tickerUpper.value}: cotação ${priceSegment}${intradaySegment}.${yearSegment} Dividendos, indicadores e análise com IA na ${brand.name}.`
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

// FAQPage expande a SERP com rich snippets (accordion). Perguntas escolhidas
// para bater o intent das pessoas que procuram o ticker: "o que eh", "paga
// dividendos", "qual a cotacao", "como investir", "qual o setor".
const faqStructuredData = computed(() => {
  const ticker = tickerUpper.value
  const name = assetName.value
  const price = formattedAssetPrice.value || 'variável conforme o pregão'
  const sector = asset.value?.sector || asset.value?.industry_category || null
  const divLastPaid =
    (dividendsData.value && dividendsData.value.length > 0)
      ? dividendsData.value[0]
      : null

  const faqs: Array<{ q: string; a: string }> = [
    {
      q: `O que é ${ticker}?`,
      a: `${ticker} é o código de negociação da ${name} na B3 (Bolsa de Valores brasileira).${sector ? ` A empresa atua no setor de ${sector}.` : ''} Esse ticker pode ser comprado através de qualquer corretora autorizada.`,
    },
    {
      q: `Qual a cotação de ${ticker} hoje?`,
      a: `A cotação atual de ${ticker} (${name}) é ${price}.${dailyChangeSentence.value ? ' No dia, ' + dailyChangeSentence.value + '.' : ''} Os preços são atualizados em tempo real durante o pregão da B3 (10h às 17h30).`,
    },
    {
      q: `${ticker} paga dividendos?`,
      a: divLastPaid
        ? `Sim, ${ticker} distribui dividendos aos acionistas. O último pagamento registrado foi em ${String(divLastPaid.payment_date || '').slice(0, 10)}. Consulte o histórico completo de dividendos, DY e MDI na página.`
        : `Consulte o histórico de dividendos, dividend yield e indicadores fundamentalistas de ${ticker} atualizados diariamente.`,
    },
    {
      q: `Como investir em ${ticker}?`,
      a: `Para investir em ${ticker} você precisa abrir conta em uma corretora autorizada a operar na B3, transferir recursos e comprar o ativo pelo home broker ou aplicativo da corretora. Lembre-se que investimento em renda variável envolve riscos de perda de capital.`,
    },
    {
      q: `Qual o setor de ${name}?`,
      a: sector
        ? `A ${name} (${ticker}) atua no setor de ${sector} na classificação setorial da B3.`
        : `${name} (${ticker}) é negociada na B3. Consulte os indicadores fundamentalistas e a ficha da companhia na página do ativo.`,
    },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  }
})

// NewsArticle para cada commentary mais recente (ate 5), marcando a pagina
// como fonte fresca no indice do Google. Ajuda em queries tipo "petr4 hoje".
//
// Normaliza datas pra ISO 8601 completo (YYYY-MM-DDTHH:mm:ss.sssZ). Datas
// vindas do backend como "2026-01-21" sao validas como Date mas o Semrush
// flag "structured data invalid" porque o Google espera o T+timezone.
const toIsoDate = (raw: unknown): string => {
  if (!raw) return new Date().toISOString()
  const s = String(raw)
  if (s.includes('T')) return s
  const d = new Date(s)
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}
const newsArticlesStructuredData = computed(() => {
  const arr = (commentaries.value || []) as any[]
  if (!arr || arr.length === 0) return []
  return arr.slice(0, 5).map((c) => ({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: c.title,
    description: (c.commentary || '').slice(0, 200),
    image: [shareImage.value || `${baseSiteUrl.value}/512x512.png`],
    datePublished: toIsoDate(c.date),
    dateModified: toIsoDate(c.updated_at || c.date),
    author: {
      '@type': 'Organization',
      name: brand.name,
      url: baseSiteUrl.value,
    },
    publisher: {
      '@type': 'Organization',
      name: brand.name,
      logo: {
        '@type': 'ImageObject',
        url: `${baseSiteUrl.value}/512x512.png`,
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${canonicalUrl.value}#commentary-${c.date}`,
    },
    about: {
      '@type': 'FinancialProduct',
      name: `${tickerUpper.value}, ${assetName.value}`,
    },
    isAccessibleForFree: true,
  }))
})

const financialProductStructuredData = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'FinancialProduct',
  name: `${tickerUpper.value}, ${assetName.value}`,
  alternateName: [tickerUpper.value, assetName.value].filter(Boolean),
  url: canonicalUrl.value,
  description: pageDescription.value,
  provider: {
    '@type': 'Organization',
    name: 'B3, Brasil, Bolsa, Balcão',
    url: 'https://www.b3.com.br',
  },
  offers: assetCurrentPrice.value
    ? {
        '@type': 'Offer',
        price: assetCurrentPrice.value,
        priceCurrency: 'BRL',
        priceValidUntil: new Date().toISOString().split('T')[0],
        availability: 'https://schema.org/InStock',
      }
    : undefined,
  image: shareImage.value,
}))

// Article schema "principal" quando o ticker tem editorial gerado.
// Diferente dos NewsArticles (commentaries do dia), esse Article
// agrega description + thesis num articleBody longo, sinalizando
// pro Google que a page tem conteudo aprofundado de autoria propria.
// usePageSeo normaliza image/publisher/author/datePublished
// automaticamente, entao basta o minimo aqui.
const articleStructuredData = computed(() => {
  const ed = editorial.value
  if (!ed) return null
  const body = [ed.description, ed.thesis_pros, ed.thesis_cons, ed.peers_comparison, ed.history_summary]
    .filter(Boolean)
    .join('\n\n')
  if (!body) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${tickerUpper.value} (${assetName.value}): análise completa, dividendos e tese de investimento`,
    description: pageDescription.value,
    articleBody: body.slice(0, 8000),
    datePublished: ed.generated_at,
    dateModified: ed.generated_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl.value,
    },
    about: {
      '@type': 'FinancialProduct',
      name: `${tickerUpper.value}, ${assetName.value}`,
    },
  }
})

const combinedStructuredData = computed(() => {
  const base: any[] = [financialProductStructuredData.value, faqStructuredData.value]
  if (articleStructuredData.value) base.push(articleStructuredData.value)
  return [...base, ...newsArticlesStructuredData.value]
})

usePageSeo({
  title: () => pageTitle.value,
  description: () => pageDescription.value,
  path: `/asset/${ticker.toLowerCase()}`,
  image: () => shareImage.value,
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Ativos', path: '/acoes' },
    { name: tickerUpper.value, path: `/asset/${ticker.toLowerCase()}` },
  ],
  structuredData: combinedStructuredData.value,
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
    // Transforma para o formato aceito pelo gráfico.
    // IMPORTANTE: `new Date('2026-05-18')` parseia como midnight UTC.
    // Em BRT (UTC-3) isso vira 17/mai 21h, e o tooltip mostra "17/mai"
    // pro último dia. Fix: construir como midday local pra ficar imune
    // ao TZ offset de -3 até -12 (ou seja, qualquer continente).
    chartData.value = Array.isArray(data)
      ? data.map((item) => {
          const iso = String(item.price_at || '').slice(0, 10)
          const [y, m, d] = iso.split('-').map(Number)
          const ts = (y && m && d)
            ? new Date(y, m - 1, d, 12, 0, 0).getTime()
            : new Date(item.price_at).getTime()
          return {
            date: item.price_at,
            value: item.market_price,
            timestamp: ts,
          }
        })
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
      value: debtToEquityRaw !== null ? formatIndicator(debtToEquityRaw, { decimals: 1 }) : '-',
      rating: getDebtRating(debtToEquityRatio),
    },
    currentRatio: {
      value: currentRatioRaw !== null ? formatIndicator(currentRatioRaw, { decimals: 2 }) : '-',
      rating:
        currentRatio > 1
          ? { label: 'Saudável', color: 'text-green-400' }
          : { label: 'Preocupante', color: 'text-red-400' },
    },
    roe: {
      value: roeRaw !== null ? formatIndicator(roeRaw, { decimals: 1, multiplier: 100, suffix: '%' }) : '-',
      rating: getROERating(roe),
    },
    roa: {
      value: roaRaw !== null ? formatIndicator(roaRaw, { decimals: 1, multiplier: 100, suffix: '%' }) : '-',
      rating:
        roa > 5
          ? { label: 'Bom', color: 'text-green-400' }
          : { label: 'Baixo', color: 'text-red-400' },
    },
    profitMargin: {
      value: profitMarginRaw !== null ? formatIndicator(profitMarginRaw, { decimals: 1, multiplier: 100, suffix: '%' }) : '-',
      rating:
        profitMargin > 10
          ? { label: 'Alta', color: 'text-green-400' }
          : { label: 'Baixa', color: 'text-red-400' },
    },
    priceToBook: {
      value: priceToBookRaw !== null ? formatIndicator(priceToBookRaw, { decimals: 2 }) : '-',
      rating:
        priceToBook < 1.5
          ? { label: 'Barato', color: 'text-green-400' }
          : { label: 'Caro', color: 'text-red-400' },
    },
    forwardPE: {
      value: forwardPERaw !== null ? formatIndicator(forwardPERaw, { decimals: 1 }) : '-',
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
  if (!Number.isFinite(price) || price === null) return '-'

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
  const { decimals = 1, multiplier = 1, suffix = '', fallback = '-' } = options
  const num = safeNumber(value)
  if (num === null) return fallback
  const result = num * multiplier
  if (!Number.isFinite(result)) return fallback
  return `${result.toFixed(decimals)}${suffix}`
}

// Computed para indicadores básicos com safeguards
const scrapeExtras = computed(() => {
  return (fundamentusData.value as any)?.scrape_extras ?? null
})

const isFii = computed(() => scrapeExtras.value?.asset_type === 'fii')
const isBdr = computed(() => scrapeExtras.value?.asset_type === 'bdr')
const isEtf = computed(() => scrapeExtras.value?.asset_type === 'etf')
// Gates stock-only sections (DRE/Balance/consensus/heatmap). BDRs/FIIs/ETFs
// don't have the Brazilian company financials the stock layout assumes.
const isForeignOrFii = computed(() => isFii.value || isBdr.value || isEtf.value)

/**
 * Top-of-page 6-cell register. Picks relevant metrics by asset type:
 *   - FII   : VPA / cotistas / rendimento mensal
 *   - BDR   : same layout as stock but ROE/margins come from the scrape
 *             (Brazilian KeyStatistic model is empty for BDR tickers)
 *   - ETF   : basket metrics (52w range, ratio, volume) instead of fundamentals
 *   - STOCK : classic VOL · M.CAP · DY · P/L · P/VP · ROE
 */
// Chart screenshot + toolbar refs
const assetChartRef = ref<HTMLElement | null>(null)
const assetScreenshotRef = ref<{ open: () => void; close: () => void } | null>(null)
const assetFullscreenRef = ref<{ open: () => void; close: () => void } | null>(null)

// Hero dashboard card state: gradient tint + accent color + sparkline
const isPositive = computed(() => Number(asset.value?.change_percent ?? 0) >= 0)
const heroAccent = computed(() => (isPositive.value ? brand.colors.positive : brand.colors.negative))

// Badge mostrado no ticker bar. Prioriza subcategoria FII (FIAGRO, etc),
// senão cai pro tipo do asset (STOCK, REIT, ETF, BDR).
const assetBadgeLabel = computed(() => {
  const extras = scrapeExtras.value as any
  if (extras?.fii?.segment) return String(extras.fii.segment).toUpperCase()
  return (asset.value?.type || '').toUpperCase() || undefined
})

// Build a normalized sparkline path from the last 30 days of chart data
const heroSparkline = computed(() => {
  const full = chartData.value || []
  // Take the last ~30 points (or whatever's available if shorter)
  const slice = full.slice(-30)
  const points = slice.map((p) => p.value).filter((v): v is number => Number.isFinite(v))
  const width = 120
  const height = 32
  if (points.length < 2) return { points, width, height, line: '', area: '' }
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const stepX = width / (points.length - 1)
  const coords = points.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * height
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  const line = `M ${coords.join(' L ')}`
  const area = `${line} L ${width},${height} L 0,${height} Z`
  return { points, width, height, line, area }
})

const sessionStats = computed(() => {
  const extras = scrapeExtras.value

  // ----- FII -----
  if (extras?.asset_type === 'fii') {
    const f = extras.fii
    return [
      { label: 'VOL', value: formatVolumeShort(currentVolume.value) },
      { label: 'COTISTAS', value: f.num_shareholders !== null ? Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(f.num_shareholders) : '-' },
      { label: 'DY', value: f.dividend_yield_12m !== null ? `${f.dividend_yield_12m.toFixed(2)}%` : '-', accent: brand.colors.primary },
      { label: 'VPA', value: f.book_value_per_share !== null ? `R$ ${f.book_value_per_share.toFixed(2)}` : '-' },
      { label: 'P/VP', value: f.price_to_book !== null ? f.price_to_book.toFixed(2) : '-' },
      { label: 'REND.MENSAL', value: f.monthly_income_avg_24m !== null ? `R$ ${f.monthly_income_avg_24m.toFixed(2)}` : '-' },
    ]
  }

  // ----- ETF -----
  if (extras?.asset_type === 'etf') {
    const e = extras.etf
    return [
      { label: 'VOL', value: formatVolumeShort(e.volume ?? currentVolume.value) },
      { label: 'COTISTAS', value: e.num_shareholders !== null ? Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(e.num_shareholders) : '-' },
      { label: 'VAR.12M', value: e.change_12m !== null ? `${e.change_12m >= 0 ? '+' : ''}${e.change_12m.toFixed(2)}%` : '-', accent: e.change_12m !== null ? (e.change_12m >= 0 ? brand.colors.positive : brand.colors.negative) : undefined },
      { label: 'MIN.52W', value: e.min_price_52_weeks !== null ? `R$ ${e.min_price_52_weeks.toFixed(2)}` : '-' },
      { label: 'MÁX.52W', value: e.max_price_52_weeks !== null ? `R$ ${e.max_price_52_weeks.toFixed(2)}` : '-' },
      { label: 'RATIO', value: e.ratio !== null ? String(e.ratio) : '-' },
    ]
  }

  // ----- BDR -----
  if (extras?.asset_type === 'bdr') {
    const v = extras.valuation
    const q = extras.quality
    return [
      { label: 'VOL', value: formatVolumeShort(currentVolume.value) },
      { label: 'M.CAP', value: formatMarketCapShort(v.market_cap) },
      { label: 'DY', value: v.dividend_yield !== null ? `${v.dividend_yield.toFixed(2)}%` : '-', accent: brand.colors.primary },
      { label: 'P/L', value: v.price_to_earnings !== null ? v.price_to_earnings.toFixed(2) : '-' },
      { label: 'P/VP', value: v.price_to_book !== null ? v.price_to_book.toFixed(2) : '-' },
      { label: 'ROE', value: q.return_on_equity !== null ? `${q.return_on_equity.toFixed(1)}%` : '-' },
    ]
  }

  // ----- STOCK (default) -----
  return [
    { label: 'VOL', value: formatVolumeShort(currentVolume.value) },
    { label: 'M.CAP', value: formatMarketCapShort((asset.value as { market_cap?: number } | undefined)?.market_cap) },
    { label: 'DY', value: formatDyShort(basicIndicators.value?.dividendYield), accent: brand.colors.primary },
    { label: 'P/L', value: basicIndicators.value?.pl || '-' },
    { label: 'P/VP', value: basicIndicators.value?.pvpa || '-' },
    { label: 'ROE', value: basicIndicators.value?.roe || '-' },
  ]
})

const resolvedLogo = computed<string | null>(() => {
  const scrape = scrapeExtras.value?.identity?.logo ?? null
  return resolveLogo(scrape, (asset.value as { logo?: string | null })?.logo ?? null)
})

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

/**
 * FII-specific checklist. FIIs are income vehicles, not operating companies —
 * criteria focus on yield consistency, governance indicators (shareholder
 * count, IFIX membership) and capital preservation (P/VP, recent drawdown)
 * rather than margins and debt-to-equity.
 */
const fiiChecklist = computed<ChecklistItem[]>(() => {
  const items: ChecklistItem[] = []
  const extras = scrapeExtras.value
  if (!extras || extras.asset_type !== 'fii') return items
  const f = extras.fii

  const toStatus = (v: boolean | null): ChecklistStatus =>
    v === true ? 'pass' : v === false ? 'fail' : 'unknown'

  items.push({
    id: 'fii-dy',
    label: 'Dividend Yield 12M acima de 7%',
    status: toStatus(f.dividend_yield_12m !== null ? f.dividend_yield_12m >= 7 : null),
    detail: f.dividend_yield_12m !== null ? `DY: ${f.dividend_yield_12m.toFixed(2)}%` : null,
    tooltip: 'Referência histórica do mercado brasileiro de FIIs (~8% a.a.).',
  })

  items.push({
    id: 'fii-pvp',
    label: 'P/VP entre 0,85 e 1,10',
    status: toStatus(
      f.price_to_book !== null ? f.price_to_book >= 0.85 && f.price_to_book <= 1.1 : null,
    ),
    detail: f.price_to_book !== null ? `P/VP: ${f.price_to_book.toFixed(2)}` : null,
    tooltip: 'Faixa equilibrada entre preço e patrimônio. Abaixo vira desconto; acima, ágio.',
  })

  items.push({
    id: 'fii-monthly-income',
    label: 'Distribui proventos mensalmente',
    status: toStatus(f.monthly_income_avg_24m !== null ? f.monthly_income_avg_24m > 0 : null),
    detail:
      f.monthly_income_avg_24m !== null
        ? `Média 24M: R$ ${f.monthly_income_avg_24m.toFixed(2)}/cota`
        : null,
    tooltip: 'FIIs de renda devem distribuir pelo menos 95% do resultado.',
  })

  // Count unique months with payments in the 12-month window ending this
  // month. The cutoff is set to the first day of 11 months ago so the set
  // covers exactly 12 distinct (year, month) buckets.
  const now = new Date()
  const cutoff = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  const paidMonths = new Set<string>()
  dividendsData.value.forEach((record) => {
    const raw = record.payment_date ? new Date(record.payment_date) : null
    if (!raw || Number.isNaN(raw.getTime()) || raw < cutoff) return
    paidMonths.add(`${raw.getFullYear()}-${raw.getMonth()}`)
  })
  const monthsPaid = Math.min(paidMonths.size, 12)
  const paid11of12 = dividendsData.value.length > 0 ? monthsPaid >= 11 : null

  items.push({
    id: 'fii-dividends-12m',
    label: 'Pagou em 11+ dos últimos 12 meses',
    status: toStatus(paid11of12),
    detail: dividendsData.value.length > 0 ? `${monthsPaid}/12 meses` : 'Histórico indisponível',
    tooltip: 'Fundos de qualidade distribuem quase todos os meses sem interromper.',
  })

  items.push({
    id: 'fii-shareholders',
    label: 'Mais de 10 mil cotistas',
    status: toStatus(f.num_shareholders !== null ? f.num_shareholders >= 10_000 : null),
    detail:
      f.num_shareholders !== null
        ? `${f.num_shareholders.toLocaleString('pt-BR')} cotistas`
        : null,
    tooltip: 'Pulverização adequada sugere liquidez e governança mais saudáveis.',
  })

  items.push({
    id: 'fii-ifix',
    label: 'Faz parte do IFIX',
    status: toStatus(f.ifix_share !== null ? f.ifix_share > 0 : null),
    detail:
      f.ifix_share !== null ? `Participação: ${f.ifix_share.toFixed(2)}%` : 'Fora do IFIX',
    tooltip: 'Inclusão no IFIX indica filtros mínimos de liquidez e volume.',
  })

  items.push({
    id: 'fii-change-12m',
    label: 'Variação 12M acima de -20%',
    status: toStatus(f.change_12m !== null ? f.change_12m > -20 : null),
    detail:
      f.change_12m !== null
        ? `${f.change_12m >= 0 ? '+' : ''}${f.change_12m.toFixed(1)}%`
        : null,
    tooltip: 'Evita fundos em forte tendência de queda recente.',
  })

  // Fund age from start date ("DD/MM/YYYY").
  let yearsOld: number | null = null
  if (f.fund_start_date) {
    const m = f.fund_start_date.match(/(\d{2})\/(\d{2})\/(\d{4})/)
    if (m) yearsOld = now.getFullYear() - parseInt(m[3], 10)
  }
  items.push({
    id: 'fii-age',
    label: 'Fundo com mais de 5 anos',
    status: toStatus(yearsOld !== null ? yearsOld >= 5 : null),
    detail: yearsOld !== null ? `${yearsOld} anos de histórico` : null,
    tooltip: 'Fundos mais antigos têm histórico de gestão e de distribuições mais confiável.',
  })

  return items
})

/**
 * BDR-specific checklist. BDRs are Brazilian receipts for foreign stocks —
 * we lean on the StatusInvest scrape values (which for BDRs cover P/L,
 * P/VP, margins and growth) rather than the Brazil-only KeyStatistic model.
 * Governance badges and 5y Brazilian dividend history don't apply.
 */
const bdrChecklist = computed<ChecklistItem[]>(() => {
  const items: ChecklistItem[] = []
  const extras = scrapeExtras.value
  if (!extras || extras.asset_type !== 'bdr') return items

  const toStatus = (v: boolean | null): ChecklistStatus =>
    v === true ? 'pass' : v === false ? 'fail' : 'unknown'

  const val = extras.valuation
  const q = extras.quality
  const lev = extras.leverage
  const g = extras.growth
  const mkt = extras.market

  // P/L — broader tolerance than Brazilian stocks because foreign tech
  // usually trades at higher multiples. Flag below 30.
  items.push({
    id: 'bdr-pl',
    label: 'P/L abaixo de 30',
    status: toStatus(val.price_to_earnings !== null ? val.price_to_earnings > 0 && val.price_to_earnings < 30 : null),
    detail: val.price_to_earnings !== null ? `P/L: ${val.price_to_earnings.toFixed(2)}` : null,
    tooltip: 'Múltiplo preço/lucro. Até 30 é razoável para empresas maduras e tech consolidadas.',
  })

  // ROE — foreign big-caps normally exceed 15%.
  items.push({
    id: 'bdr-roe',
    label: 'ROE acima de 15%',
    status: toStatus(q.return_on_equity !== null ? q.return_on_equity >= 15 : null),
    detail: q.return_on_equity !== null ? `ROE: ${q.return_on_equity.toFixed(1)}%` : null,
    tooltip: 'Retorno sobre patrimônio. Empresas globais de qualidade costumam superar 15%.',
  })

  // ROIC — key quality metric.
  items.push({
    id: 'bdr-roic',
    label: 'ROIC acima de 10%',
    status: toStatus(q.return_on_invested_capital !== null ? q.return_on_invested_capital >= 10 : null),
    detail: q.return_on_invested_capital !== null ? `ROIC: ${q.return_on_invested_capital.toFixed(1)}%` : null,
    tooltip: 'Retorno sobre capital investido. Acima de 10% indica que o capital gera valor acima do custo típico.',
  })

  // Net margin positive — foreign companies paying dividends tend to be
  // profitable; flag negative as risky.
  items.push({
    id: 'bdr-net-margin',
    label: 'Margem líquida positiva',
    status: toStatus(q.net_margin !== null ? q.net_margin > 0 : null),
    detail: q.net_margin !== null ? `Margem: ${q.net_margin.toFixed(1)}%` : null,
    tooltip: 'Verifica se a empresa é lucrativa considerando o último exercício.',
  })

  // Revenue CAGR 5y positive — ensures the business is growing.
  items.push({
    id: 'bdr-revenue-growth',
    label: 'Receita crescendo (CAGR 5A)',
    status: toStatus(g.revenue_cagr_5y !== null ? g.revenue_cagr_5y > 0 : null),
    detail: g.revenue_cagr_5y !== null ? `CAGR: ${g.revenue_cagr_5y.toFixed(1)}%/ano` : null,
    tooltip: 'Crescimento composto da receita nos últimos 5 anos.',
  })

  // Debt / equity — below 2 is considered healthy for foreign large-caps.
  items.push({
    id: 'bdr-leverage',
    label: 'Dív.Líquida/EBITDA abaixo de 3x',
    status: toStatus(lev.net_debt_to_ebitda !== null ? lev.net_debt_to_ebitda < 3 : null),
    detail: lev.net_debt_to_ebitda !== null ? `${lev.net_debt_to_ebitda.toFixed(2)}x` : null,
    tooltip: 'Alavancagem saudável: dívida líquida que é quitada em menos de 3 anos de geração de caixa.',
  })

  // Dividend Yield > 0 — BDR passes if it distributes any dividend.
  items.push({
    id: 'bdr-dy',
    label: 'Empresa distribui dividendos',
    status: toStatus(val.dividend_yield !== null ? val.dividend_yield > 0 : null),
    detail: val.dividend_yield !== null ? `DY: ${val.dividend_yield.toFixed(2)}%` : 'Sem pagamentos registrados',
    tooltip: 'BDRs repassam proventos da empresa estrangeira, geralmente trimestrais ou anuais.',
  })

  // Liquidity proxy: free float > 20% + big market cap.
  const bigMarketCap = val.market_cap !== null ? val.market_cap >= 10_000_000_000 : null
  items.push({
    id: 'bdr-size',
    label: 'Market Cap acima de US$ 10 bi (aprox)',
    status: toStatus(bigMarketCap),
    detail:
      val.market_cap !== null
        ? `MC equivalente: R$ ${formatNumberToShort(val.market_cap)}`
        : 'Market cap indisponível',
    tooltip: 'Large-caps têm liquidez consistente e cobertura global de analistas.',
  })

  // Price stability — penalize very recent drops over 30% in 52w.
  const priceVs52wMin =
    mkt.min_price_52_weeks !== null && mkt.price !== null && mkt.min_price_52_weeks > 0
      ? (mkt.price - mkt.min_price_52_weeks) / mkt.min_price_52_weeks
      : null
  items.push({
    id: 'bdr-price-52w',
    label: 'Preço atual sobre mínima 52s',
    status: toStatus(priceVs52wMin !== null ? priceVs52wMin > 0 : null),
    detail:
      priceVs52wMin !== null
        ? `${priceVs52wMin >= 0 ? '+' : ''}${(priceVs52wMin * 100).toFixed(1)}% sobre mín.`
        : null,
    tooltip: 'Evita ativos no fundo absoluto da janela de 52 semanas (potencial sinal de problema).',
  })

  return items
})

/**
 * Render the correct checklist depending on asset type.
 *   - FII       -> yield/governance/age criteria specific to real estate funds
 *   - BDR       -> scrape-based checks (P/L, ROE, ROIC, growth, leverage)
 *   - Stock     -> classic AUVP Buy & Hold criteria (KeyStatistic + dividends)
 */
const activeChecklist = computed(() => {
  if (isFii.value) return fiiChecklist.value
  if (isBdr.value) return bdrChecklist.value
  return buyAndHoldChecklist.value
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
      // Preserve query string when lowercasing the ticker, otherwise
      // params like ?brand=saraiva-invest get dropped on the redirect.
      return navigateTo(
        { path: `/asset/${normalized}`, query: to.query, hash: to.hash },
        import.meta.server ? { redirectCode: 301 } : { replace: true }
      )
    }
  },
})
</script>

<style scoped>
/* ========== PLAYBOOK ASSET PAGE (Saraiva Invest) ========== */
.pb-asset-root {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-feature-settings: 'ss01', 'cv11';
}

/* Sticker text styles, match the home hero */
.pb-asset-sticker {
  display: inline-block;
  font-family: 'Fredoka', 'Inter', system-ui, sans-serif;
  font-weight: 700;
}

.pb-asset-sticker-cold {
  display: inline-block;
}

.pb-asset-sticker-hot {
  display: inline-block;
  background: #EF4444;
  color: #FFFFFF !important;
  padding: 0.02em 0.3em;
  border-radius: 0.15em;
  font-family: 'Fredoka', 'Inter', system-ui, sans-serif;
  font-weight: 700;
  box-shadow:
    -3px 3px 0 #0B0B0E,
    0 0 0 4px #FFFFFF,
    -3px 3px 0 4px #0B0B0E;
  transform: rotate(2deg);
}

/* Villain card pulse */
@keyframes pb-asset-villain-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  50% { box-shadow: 0 0 60px -10px rgba(239, 68, 68, 0.25); }
}

.pb-asset-villain {
  animation: pb-asset-villain-pulse 3s ease-in-out infinite;
}

/* Sweat drops */
@keyframes pb-asset-sweat-drop {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.85; }
  50% { transform: translateY(5px) scale(0.85); opacity: 0.4; }
}

.pb-asset-sweat {
  animation: pb-asset-sweat-drop 1.4s ease-in-out infinite;
}
.pb-asset-sweat-2 {
  animation-delay: 0.7s;
}
</style>

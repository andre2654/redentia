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
          :previous-close="previousClosePrice"
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
          :previous-close="previousClosePrice"
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
        <section id="sec-resumo" :style="{ borderColor: 'var(--brand-border)' }">
          <MoleculesTickerHeaderBar
            :logo="resolvedLogo && !failedLogos.isFailed(resolvedLogo) ? resolvedLogo : undefined"
            :ticker="tickerUpper"
            :name="asset?.name || assetName"
            :badge="assetBadgeLabel"
            secondary-badge="B3"
            price-label="Preço atual"
            price-unit="R$ "
            :price-value="formatPriceNumber(asset?.market_price)"
            :change-percent="asset?.change_percent"
            :stats="sessionStats"
            :sparkline="heroSparkline.line ? { line: heroSparkline.line, area: heroSparkline.area, color: heroAccent } : undefined"
            sparkline-label="Desempenho 30 dias"
            :sparkline-change="heroSparkline30dChange"
          />

          <!-- Section nav (card abaixo do header). Anchor links pra cada
               seccao da page com tracking de active via IntersectionObserver. -->
          <nav
            class="asset-nav mt-4 flex items-center gap-1 overflow-x-auto rounded-[14px] border px-3 py-2"
            :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)', background: 'var(--bg-elevated)' }"
            aria-label="Secoes do ativo"
          >
            <a
              v-for="t in assetNavTabs"
              :key="t.id"
              :href="`#${t.id}`"
              :class="['asset-nav-tab', activeAssetSection === t.id ? 'is-active' : '']"
              @click="onAssetNavClick($event, t.id)"
            >{{ t.label }}</a>
          </nav>

          <!-- 2-col layout: Resumo Inteligente (esquerda) + Cotação (direita) -->
          <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <!-- ===== LEFT: Resumo Inteligente ===== -->
            <article
              class="resumo-card card-soft-bg flex flex-col gap-5 rounded-[14px] border px-6 py-6"
              :style="{ background: 'var(--bg-elevated)', borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
            >
              <header class="flex flex-col gap-2">
                <h2 class="text-[20px] font-medium leading-tight" :style="{ color: 'var(--text-heading)' }">Resumo Inteligente</h2>
                <p class="text-[13px]" :style="{ color: 'var(--text-muted)' }">
                  Análise rápida e objetiva para sua decisão.
                </p>
              </header>

              <!-- Score row: dial + band + summary -->
              <div
                class="resumo-score flex items-center gap-5 rounded-[12px] border px-5 py-5"
                :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }"
              >
                <div class="flex shrink-0 flex-col items-center gap-1">
                  <span class="text-[11px] font-medium" :style="{ color: 'var(--text-muted)' }">Redent Score</span>
                  <div class="relative">
                    <svg width="92" height="92" viewBox="0 0 92 92" aria-hidden="true">
                      <circle cx="46" cy="46" r="38" fill="none" :stroke="`color-mix(in srgb, var(--text-heading) 8%, transparent)`" stroke-width="7" />
                      <circle
                        cx="46" cy="46" r="38" fill="none"
                        :stroke="resumoScoreColor"
                        stroke-width="7"
                        stroke-linecap="round"
                        :stroke-dasharray="2 * Math.PI * 38"
                        :stroke-dashoffset="2 * Math.PI * 38 * (1 - resumoScore / 100)"
                        transform="rotate(-90 46 46)"
                        style="transition: stroke-dashoffset 600ms ease;"
                      />
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                      <span class="font-light tabular-nums text-[24px] leading-none" :style="{ color: 'var(--text-heading)' }">{{ resumoScore }}</span>
                      <span class="text-[10px]" :style="{ color: 'var(--text-muted)' }">/100</span>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <span class="text-[18px] font-medium leading-none" :style="{ color: resumoScoreColor }">{{ resumoScoreBand }}</span>
                  <p class="text-[13px] leading-snug" :style="{ color: 'var(--text-body)' }">
                    {{ resumoScoreSummary }}
                  </p>
                </div>
              </div>

              <!-- 3 sub-cards: Pontos fortes / Pontos de atencao / Perfil ideal -->
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div class="resumo-sub flex flex-col gap-2 rounded-[12px] border px-3.5 py-3" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }">
                  <header class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-check-circle-2" class="size-4" :style="{ color: 'var(--brand-positive)' }" />
                    <span class="text-[12px] font-semibold" :style="{ color: 'var(--text-heading)' }">Pontos fortes</span>
                  </header>
                  <ul class="flex flex-col gap-1">
                    <li v-for="(s, i) in resumoStrengths" :key="i" class="flex items-start gap-1.5 text-[11px] leading-snug" :style="{ color: 'var(--text-body)' }">
                      <UIcon name="i-lucide-check" class="mt-[2px] size-3 shrink-0" :style="{ color: 'var(--brand-positive)' }" />
                      <span>{{ s }}</span>
                    </li>
                  </ul>
                </div>
                <div class="resumo-sub flex flex-col gap-2 rounded-[12px] border px-3.5 py-3" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }">
                  <header class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-alert-circle" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
                    <span class="text-[12px] font-semibold" :style="{ color: 'var(--text-heading)' }">Pontos de atenção</span>
                  </header>
                  <ul class="flex flex-col gap-1">
                    <li v-for="(r, i) in resumoRisks" :key="i" class="flex items-start gap-1.5 text-[11px] leading-snug" :style="{ color: 'var(--text-body)' }">
                      <UIcon name="i-lucide-circle" class="mt-[3px] size-2 shrink-0" :style="{ color: 'var(--brand-primary)' }" />
                      <span>{{ r }}</span>
                    </li>
                  </ul>
                </div>
                <div class="resumo-sub flex flex-col gap-2 rounded-[12px] border px-3.5 py-3" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }">
                  <header class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-users" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
                    <span class="text-[12px] font-semibold" :style="{ color: 'var(--text-heading)' }">Perfil ideal</span>
                  </header>
                  <p class="text-[11px] leading-snug" :style="{ color: 'var(--text-body)' }">{{ resumoProfile }}</p>
                </div>
              </div>

              <!-- Movimentos notaveis (pílulas horizontais scrollaveis).
                   Carrossel com snap-x; user arrasta pra ver mais eventos.
                   Vive aqui dentro do card pra ancorar a narrativa AI ao
                   mesmo bloco do score. -->
              <div v-if="commentaries.length" class="flex flex-col gap-2">
                <header class="flex items-center justify-between gap-2">
                  <span class="text-[11px] font-semibold uppercase tracking-[0.14em]" :style="{ color: 'var(--text-muted)' }">Movimentos notáveis</span>
                  <span class="text-[11px] tabular-nums" :style="{ color: 'var(--text-muted)' }" translate="no">{{ commentaries.length }} {{ commentaries.length === 1 ? 'evento' : 'eventos' }}</span>
                </header>
                <div class="resumo-mov-rail -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1">
                  <div
                    v-for="(item, idx) in resumoCommentariesAll"
                    :key="item.id || `${item.date}-${idx}`"
                    class="resumo-mov-pill flex shrink-0 snap-start flex-col gap-1.5 rounded-[12px] border px-3.5 py-2.5"
                    :style="{
                      borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)',
                      background: 'var(--bg-base)',
                      width: '220px',
                    }"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-[11px] font-medium tabular-nums" :style="{ color: 'var(--text-muted)' }" translate="no">
                        {{ formatShortDate(item.date) }}
                      </span>
                      <span
                        class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
                        :style="{
                          background: `color-mix(in srgb, ${Number(item.change_percent) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'} 14%, transparent)`,
                          color: Number(item.change_percent) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)',
                        }"
                        translate="no"
                      >
                        {{ Number(item.change_percent) >= 0 ? '+' : '' }}{{ Number(item.change_percent).toFixed(2).replace('.', ',') }}%
                      </span>
                    </div>
                    <p class="line-clamp-2 text-[12px] leading-snug" :style="{ color: 'var(--text-heading)' }">{{ item.title }}</p>
                  </div>
                </div>
              </div>

              <NuxtLink
                :to="`/help?q=Análise completa de ${tickerUpper}`"
                class="inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-[13px] font-medium transition-opacity hover:opacity-80"
                :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 35%, transparent)', color: 'var(--text-heading)' }"
              >
                Ver análise completa
                <UIcon name="i-lucide-arrow-right" class="size-3.5" />
              </NuxtLink>
            </article>

            <!-- ===== RIGHT: Cotação ===== -->
            <article
              class="cotacao-card flex flex-col gap-4 rounded-[14px] border px-6 py-6"
              :style="{ background: 'var(--bg-elevated)', borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
            >
              <header class="flex flex-wrap items-center justify-between gap-3">
                <h2 class="text-[20px] font-medium leading-tight" :style="{ color: 'var(--text-heading)' }">Cotação</h2>
                <MoleculesPeriodSelector
                  v-model="selectedTimeRange"
                  :loading="isLoadingChart"
                  :dropdown="false"
                />
              </header>

              <div ref="assetChartRef">
                <AtomsGraphLine
                  :data="chartData"
                  :previous-close="previousClosePrice"
                  :legend="chartLabel"
                  :height="220"
                  :mobile-height="200"
                  :loading="isLoadingChart"
                  :markers="chartMarkers"
                  @marker-click="onMarkerClick"
                />
              </div>

              <!-- Fech. anterior strip -->
              <div
                v-if="previousClosePrice !== null"
                class="flex items-center justify-between rounded-[12px] border px-4 py-3"
                :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }"
              >
                <span class="text-[12px]" :style="{ color: 'var(--text-muted)' }">Fech. anterior</span>
                <span class="font-medium tabular-nums text-[14px]" :style="{ color: 'var(--text-heading)' }">R$ {{ previousClosePrice.toFixed(2).replace('.', ',') }}</span>
              </div>

              <!-- Stats grid 3x2 -->
              <div class="grid grid-cols-3 gap-3">
                <div
                  v-for="cs in cotacaoStats"
                  :key="cs.label"
                  class="flex flex-col gap-1.5 rounded-[12px] border px-3.5 py-3"
                  :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }"
                >
                  <span class="text-[11px]" :style="{ color: 'var(--text-muted)' }">{{ cs.label }}</span>
                  <span class="font-light tabular-nums text-[16px]" :style="{ color: 'var(--text-heading)', letterSpacing: '-0.02em' }">{{ cs.value }}</span>
                </div>
              </div>
            </article>
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
              :previous-close="previousClosePrice"
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

        <!-- (Market Commentaries movido pra dentro do card "Resumo
             Inteligente" como timeline minimalista de "Movimentos
             notáveis". Versao full-card aposentada.) -->

        <!-- Dividendos + Notícias (row dupla compacta) — movido pra cá
             pra aparecer logo apos o Resumo/Cotação, antes da analise. -->
        <section
          v-if="brand.assetPage.showNews || (brand.assetPage.showDividendMap || brand.assetPage.showDividendChart) && !isEtf"
          id="sec-dividendos"
          class="py-8"
        >
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <!-- ===== LEFT: Histórico de Dividendos ===== -->
            <article
              v-if="(brand.assetPage.showDividendMap || brand.assetPage.showDividendChart) && !isEtf"
              class="dividends-card flex flex-col gap-5 rounded-[14px] border px-6 py-6"
              :style="{ background: 'var(--bg-elevated)', borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
            >
              <header class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <h2 class="text-[18px] font-medium leading-tight" :style="{ color: 'var(--text-heading)' }">Histórico de Dividendos</h2>
                  <UIcon name="i-lucide-info" class="size-3.5" :style="{ color: 'var(--text-muted)' }" />
                </div>
                <p class="text-[12px]" :style="{ color: 'var(--text-muted)' }">Pagamentos dos últimos 12 meses</p>
              </header>

              <div class="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto]">
                <!-- 12-month bar chart inline -->
                <div class="dividends-bars">
                  <svg
                    v-if="dividendsByMonth.length"
                    viewBox="0 0 360 180"
                    preserveAspectRatio="none"
                    class="h-[180px] w-full"
                    aria-hidden="true"
                  >
                    <line v-for="(g, i) in [0, 40, 80, 120, 160]" :key="g" :x1="20" :x2="360" :y1="g" :y2="g" :stroke="`color-mix(in srgb, var(--brand-border) ${i === 0 ? 0 : 18}%, transparent)`" stroke-width="1" stroke-dasharray="2,2" />
                    <g v-for="(d, i) in dividendsByMonth" :key="d.label">
                      <rect :x="22 + i * 28" :y="160 - d.barHeight" :width="20" :height="d.barHeight" rx="3" :fill="'var(--brand-positive)'" />
                      <text :x="32 + i * 28" :y="176" text-anchor="middle" class="dividends-axis-label">{{ d.label }}</text>
                    </g>
                    <polyline v-if="dividendsByMonth.length > 1" :points="dyLinePoints" fill="none" stroke="var(--brand-primary)" stroke-width="2" stroke-linejoin="round" />
                    <circle v-for="(d, i) in dividendsByMonth" :key="`dot-${d.label}`" :cx="32 + i * 28" :cy="160 - d.dyY" r="3" fill="var(--brand-primary)" />
                  </svg>
                  <div v-else class="flex h-[180px] items-center justify-center">
                    <span class="text-[12px]" :style="{ color: 'var(--text-muted)' }">{{ isLoadingDividends ? 'Carregando…' : 'Sem pagamentos no período.' }}</span>
                  </div>
                  <div class="mt-3 flex items-center gap-4 text-[11px]" :style="{ color: 'var(--text-muted)' }">
                    <span class="inline-flex items-center gap-1.5">
                      <span class="block size-2 rounded-sm" :style="{ background: 'var(--brand-positive)' }" />
                      Dividendo por ação
                    </span>
                    <span class="inline-flex items-center gap-1.5">
                      <span class="block size-2 rounded-full" :style="{ background: 'var(--brand-primary)' }" />
                      Dividend Yield
                    </span>
                  </div>
                </div>

                <div
                  class="flex flex-col gap-3 rounded-[12px] border px-4 py-4 lg:min-w-[180px]"
                  :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }"
                >
                  <span class="text-[11px]" :style="{ color: 'var(--text-muted)' }">{{ nextDividendLabel }}</span>
                  <div class="flex flex-col gap-0.5">
                    <span class="font-light tabular-nums text-[28px] leading-none" :style="{ color: 'var(--text-heading)', letterSpacing: '-0.02em' }">
                      {{ nextDividendValue }}
                    </span>
                    <span class="text-[11px]" :style="{ color: 'var(--text-muted)' }">por ação</span>
                  </div>
                  <div v-if="nextDividendExDate || nextDividendPayDate" class="flex flex-col gap-2">
                    <div v-if="nextDividendExDate" class="flex flex-col gap-0.5">
                      <span class="text-[10px]" :style="{ color: 'var(--text-muted)' }">Data ex-dividendo</span>
                      <span class="font-medium tabular-nums text-[13px]" :style="{ color: 'var(--text-heading)' }">{{ nextDividendExDate }}</span>
                    </div>
                    <div v-if="nextDividendPayDate" class="flex flex-col gap-0.5">
                      <span class="text-[10px]" :style="{ color: 'var(--text-muted)' }">Data de pagamento</span>
                      <span class="font-medium tabular-nums text-[13px]" :style="{ color: 'var(--text-heading)' }">{{ nextDividendPayDate }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <NuxtLink
                :to="`/dividendos/${tickerUpper.toLowerCase()}`"
                class="inline-flex items-center gap-2 self-end rounded-full border px-4 py-2 text-[13px] font-medium transition-opacity hover:opacity-80"
                :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 35%, transparent)', color: 'var(--text-heading)' }"
              >
                Ver histórico completo
                <UIcon name="i-lucide-arrow-right" class="size-3.5" />
              </NuxtLink>
            </article>

            <!-- ===== RIGHT: Últimas notícias ===== -->
            <article
              v-if="brand.assetPage.showNews"
              id="sec-noticias"
              class="news-compact-card card-soft-bg flex flex-col gap-5 rounded-[14px] border px-6 py-6"
              :style="{ background: 'var(--bg-elevated)', borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
            >
              <header class="flex flex-col gap-1">
                <h2 class="text-[18px] font-medium leading-tight" :style="{ color: 'var(--text-heading)' }">Últimas notícias</h2>
                <p class="text-[12px]" :style="{ color: 'var(--text-muted)' }">Manchetes recentes citando o ticker.</p>
              </header>

              <ul v-if="tickerNewsTop.length" class="flex flex-col gap-4">
                <li
                  v-for="n in tickerNewsTop"
                  :key="n.id"
                  class="flex items-start gap-3"
                >
                  <a
                    :href="n.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border transition-opacity hover:opacity-80"
                    :style="{ borderColor: 'var(--border-subtle)', background: 'var(--bg-overlay)' }"
                  >
                    <img
                      v-if="n.image_url && !failedLogos.isFailed(n.image_url)"
                      :src="n.image_url"
                      :alt="n.title"
                      class="size-full object-cover"
                      @error="failedLogos.markFailed(n.image_url)"
                    />
                    <UIcon
                      v-else
                      name="i-lucide-newspaper"
                      class="size-5"
                      :style="{ color: 'var(--text-muted)' }"
                    />
                  </a>
                  <div class="flex min-w-0 flex-1 flex-col gap-1">
                    <a
                      :href="n.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="line-clamp-2 text-[14px] font-medium leading-snug transition-opacity hover:opacity-80"
                      :style="{ color: 'var(--text-heading)' }"
                    >{{ n.title }}</a>
                    <p class="text-[11px]" :style="{ color: 'var(--text-muted)' }">
                      <span class="capitalize">{{ n.source }}</span>
                      <span aria-hidden="true"> · </span>
                      {{ formatNewsDate(n.published_at) }}
                    </p>
                  </div>
                </li>
              </ul>
              <p v-else class="text-[13px]" :style="{ color: 'var(--text-muted)' }">Sem notícias no momento.</p>
            </article>
          </div>
        </section>

        <!-- Fundamentals + Volatility side by side (terminal panels) —
             only when scrape_extras is NOT available (otherwise the new
             fundamentals panel below covers these indicators + more). -->
        <section v-if="!scrapeExtras" id="sec-analise" class="grid grid-cols-1 gap-6 border-b py-8 lg:grid-cols-3" :style="{ borderColor: 'var(--brand-border)' }">
          <!-- Col 1-2: Fundamentals register -->
          <div v-if="brand.assetPage.showIndicators" class="lg:col-span-2">
            <div class="mb-4 flex flex-col gap-1">
              <h2 class="font-light" :style="{ color: 'var(--brand-text)', fontSize: 'clamp(20px, 2.5vw, 26px)', lineHeight: 1.15, letterSpacing: '-0.3px' }">
                Indicadores fundamentalistas
              </h2>
              <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: 'var(--brand-text-muted)' }">
                &gt; MÉTRICAS DE {{ tickerUpper }} · ÚLTIMA ATUALIZAÇÃO DISPONÍVEL
              </p>
            </div>

            <!-- Basic indicators register, 6 tight columns glued together -->
            <div
              v-if="isLoadingFundamentus"
              class="grid grid-cols-3 gap-px border md:grid-cols-6"
              :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-border)' }"
            >
              <div v-for="i in 6" :key="`ind-load-${i}`" class="p-4" :style="{ backgroundColor: 'var(--brand-surface)' }">
                <USkeleton class="h-16 w-full" />
              </div>
            </div>
            <div
              v-else-if="basicIndicators"
              class="grid grid-cols-3 gap-px border md:grid-cols-6"
              :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-border)' }"
            >
              <div
                v-for="item in fundamentalsCells"
                :key="item.label"
                class="flex flex-col gap-1.5 px-4 py-4 transition-colors hover:brightness-110"
                :style="{ backgroundColor: 'var(--brand-surface)' }"
              >
                <div class="flex items-center justify-end">
                  <UTooltip v-if="item.tooltip" :text="item.tooltip" :delay-duration="0">
                    <UIcon name="i-lucide-info" class="h-3 w-3 opacity-40" :style="{ color: 'var(--brand-text-muted)' }" />
                  </UTooltip>
                </div>
                <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: 'var(--brand-text-muted)' }">
                  {{ item.label }}
                </span>
                <span class="font-mono-tab text-xl font-bold tabular-nums" :style="{ color: item.accent || 'var(--brand-text)' }">
                  {{ item.value || '-' }}
                </span>
              </div>
            </div>
            <div v-else class="border border-dashed p-6 text-center font-mono-tab text-[11px] uppercase tracking-wider" :style="{ borderColor: 'var(--brand-border)', color: 'var(--brand-text-muted)' }">
              &gt; DATA UNAVAILABLE
            </div>

            <!-- Smart indicators register (AI analysis) — only when scrape is missing -->
            <div v-if="!scrapeExtras && brand.assetPage.showSmartIndicators && (intelligentIndicators || isLoadingFundamentus)" class="mt-4">
              <div class="mb-2 flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: 'var(--brand-primary)' }">
                <IconAi class="h-3 w-3" :style="{ fill: 'var(--brand-primary)' }" />
                <span>Análise IA</span>
                <span :style="{ color: 'var(--brand-text-muted)' }">&gt; METRICAS INTERPRETADAS</span>
              </div>
              <div
                v-if="isLoadingFundamentus"
                class="grid grid-cols-2 gap-px border md:grid-cols-4"
                :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-border)' }"
              >
                <div v-for="i in 8" :key="`smart-load-${i}`" class="p-4" :style="{ backgroundColor: 'var(--brand-surface)' }">
                  <USkeleton class="h-16 w-full" />
                </div>
              </div>
              <div
                v-else-if="intelligentIndicators"
                class="grid grid-cols-2 gap-px border md:grid-cols-4"
                :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-border)' }"
              >
                <div
                  v-for="item in smartCells"
                  :key="item.label"
                  class="flex flex-col gap-1.5 px-4 py-4"
                  :style="{ backgroundColor: 'var(--brand-surface)' }"
                >
                  <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: 'var(--brand-text-muted)' }">
                    {{ item.label }}
                  </span>
                  <span class="font-mono-tab text-base font-bold tabular-nums" :style="{ color: 'var(--brand-text)' }">
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
                <h2 class="font-light" :style="{ color: 'var(--brand-text)', fontSize: 'clamp(20px, 2.5vw, 26px)', lineHeight: 1.15, letterSpacing: '-0.3px' }">
                  Volatilidade
                </h2>
                <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: 'var(--brand-text-muted)' }">
                  &gt; {{ volatilityPeriodLabel || 'JANELA DE 30 DIAS' }}
                </p>
              </div>
              <div class="border p-5" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
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
        <section v-if="scrapeExtras" id="sec-analise-rich" class="py-8">
          <MoleculesStatusInvestFiiPanel v-if="scrapeExtras.asset_type === 'fii'" :extras="scrapeExtras" />
          <MoleculesStatusInvestEtfPanel v-else-if="scrapeExtras.asset_type === 'etf'" :extras="scrapeExtras" />

          <!-- Stock — 2-col redesign: Destaques + Indicadores essenciais -->
          <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
            <!-- LEFT: Destaques Fundamentais -->
            <article
              class="destaques-card card-soft-bg flex flex-col gap-5 rounded-[14px] border px-6 py-6"
              :style="{ background: 'var(--bg-elevated)', borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
            >
              <header class="flex flex-col gap-1">
                <h2 class="text-[18px] font-medium leading-tight" :style="{ color: 'var(--text-heading)' }">Destaques Fundamentais</h2>
              </header>

              <!-- 5 status pills (Rentabilidade / Crescimento / Endividamento / Valuation / Dividendo) -->
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <div
                  v-for="b in destaquesBadges"
                  :key="b.label"
                  class="flex flex-col items-start gap-1.5 rounded-[12px] border px-3 py-3"
                  :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }"
                >
                  <span
                    class="flex size-9 items-center justify-center rounded-full"
                    :style="{ background: `color-mix(in srgb, ${b.color} 14%, transparent)`, color: b.color }"
                    aria-hidden="true"
                  >
                    <UIcon :name="b.icon" class="size-4" />
                  </span>
                  <span class="text-[11px]" :style="{ color: 'var(--text-muted)' }">{{ b.label }}</span>
                  <span class="text-[13px] font-medium" :style="{ color: b.color }">{{ b.statusLabel }}</span>
                </div>
              </div>

              <!-- 5 stat cards (ROE / Receita / Lucro / Margem / Div.Líq./EBITDA) -->
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <div
                  v-for="s in destaquesStats"
                  :key="s.label"
                  class="flex flex-col gap-1 rounded-[12px] border px-3 py-3"
                  :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }"
                >
                  <span class="text-[11px]" :style="{ color: 'var(--text-muted)' }">{{ s.label }}</span>
                  <span
                    class="font-light tabular-nums text-[20px] leading-tight"
                    :style="{ color: 'var(--text-heading)', letterSpacing: '-0.02em' }"
                  >{{ s.value }}</span>
                  <span
                    v-if="s.caption"
                    class="text-[11px] font-medium"
                    :style="{ color: s.captionColor || 'var(--text-muted)' }"
                  >{{ s.caption }}</span>
                </div>
              </div>
            </article>

            <!-- RIGHT: Indicadores essenciais -->
            <article
              class="essenciais-card flex flex-col gap-5 rounded-[14px] border px-6 py-6"
              :style="{ background: 'var(--bg-elevated)', borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
            >
              <header>
                <h2 class="text-[18px] font-medium leading-tight" :style="{ color: 'var(--text-heading)' }">Indicadores essenciais</h2>
              </header>

              <ul class="flex flex-col">
                <li
                  v-for="it in indicadoresEssenciais"
                  :key="it.label"
                  class="flex items-center justify-between gap-3 border-t py-3 first:border-t-0 first:pt-0 last:pb-0"
                  :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 20%, transparent)' }"
                >
                  <span class="text-[13px]" :style="{ color: 'var(--text-muted)' }">{{ it.label }}</span>
                  <span class="font-medium tabular-nums text-[14px]" :style="{ color: 'var(--text-heading)' }">{{ it.value }}</span>
                </li>
              </ul>

              <NuxtLink
                :to="`/help?q=Indicadores completos de ${tickerUpper}`"
                class="inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-[13px] font-medium transition-opacity hover:opacity-80"
                :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 35%, transparent)', color: 'var(--text-heading)' }"
              >
                Ver todos os indicadores
                <UIcon name="i-lucide-arrow-right" class="size-3.5" />
              </NuxtLink>
            </article>
          </div>

          <!-- Volatility + Analyst consensus side by side (only when scrape panel is shown) -->
          <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <article
              v-if="brand.assetPage.showVolatility"
              class="volatility-card flex flex-col gap-5 rounded-[14px] border px-6 py-6"
              :style="{ background: 'var(--bg-elevated)', borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
            >
              <header class="flex flex-col gap-1">
                <h3 class="text-[18px] font-medium leading-tight" :style="{ color: 'var(--text-heading)' }">Volatilidade</h3>
                <p class="text-[12px]" :style="{ color: 'var(--text-muted)' }">
                  {{ (volatilityPeriodLabel || 'Janela de 30 dias').toLowerCase().replace(/^./, c => c.toUpperCase()) }}
                </p>
              </header>
              <AtomsRiskMeter
                :risk="volatilityRisk"
                :period="volatilityPeriodLabel"
              />
            </article>

            <MoleculesAnalystConsensusCard v-if="brand.assetPage.showNews && !isForeignOrFii" :ticker="tickerUpper" />
          </div>
        </section>
      </div>

      <!-- (Dividendos + Notícias movido pra logo apos o Resumo — perto
           do topo da page. Veja secao dentro do inner div acima.) -->

      <!-- Financial Statements — hidden for BDRs (foreign company) and ETFs
           (basket, not an operating company with DRE/balance) -->
      <section v-if="brand.assetPage.showFinancials && !isBdr && !isEtf" id="sec-financeiro" class="py-8">
        <header class="mb-6 flex flex-col gap-1">
          <h2 class="text-[24px] font-medium leading-tight" :style="{ color: 'var(--text-heading)', letterSpacing: '-0.02em' }">
            Demonstrações financeiras
          </h2>
          <p class="text-[13px]" :style="{ color: 'var(--text-muted)' }">
            Último trimestre disponível{{ isFii ? ' · Balanço · DRE' : ' · Fluxo de caixa · Balanço · DRE' }}
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
          :style="{ borderColor: 'var(--brand-border)' }"
        >
          <UIcon name="i-lucide-file-x" class="mb-3 h-8 w-8" :style="{ color: 'var(--brand-text-muted)' }" />
          <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">Demonstrações indisponíveis</p>
        </div>
      </section>

      <!-- Buy & Hold Checklist — stock, FII, or BDR variant. ETFs don't
           have per-fund fundamentals that map to these criteria. -->
      <section v-if="brand.assetPage.showChecklist && !isEtf" class="py-8">
        <article
          class="checklist-card flex flex-col gap-6 rounded-[14px] border px-6 py-6 md:px-8 md:py-8"
          :style="{ background: 'var(--bg-elevated)', borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
        >
          <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex flex-col gap-1">
              <h2 class="text-[20px] font-medium leading-tight" :style="{ color: 'var(--text-heading)' }">
                Checklist Buy &amp; Hold
              </h2>
              <p class="text-[13px]" :style="{ color: 'var(--text-muted)' }">
                Critérios para investidores de longo prazo.
              </p>
            </div>

            <!-- Score pill (v4 card style) -->
            <div
              v-if="!isLoadingFundamentus && activeChecklist.length"
              class="flex shrink-0 items-baseline gap-2 self-start rounded-[12px] border px-4 py-2.5"
              :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }"
            >
              <span class="text-[11px]" :style="{ color: 'var(--text-muted)' }">Score</span>
              <span
                class="font-light tabular-nums text-[22px] leading-none"
                :style="{ color: activeChecklist.filter(i => i.status === 'pass').length >= activeChecklist.length * 0.7 ? 'var(--brand-positive)' : 'var(--brand-primary)', letterSpacing: '-0.02em' }"
              >{{ activeChecklist.filter(i => i.status === 'pass').length }}</span>
              <span class="text-[14px] tabular-nums" :style="{ color: 'var(--text-muted)' }">/ {{ activeChecklist.length }}</span>
            </div>
          </header>

          <div v-if="isLoadingFundamentus" class="grid gap-2 md:grid-cols-2">
            <USkeleton
              v-for="index in 6"
              :key="`checklist-skeleton-${index}`"
              class="h-16 rounded-[12px]"
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
                class="group flex items-center gap-3 rounded-[12px] border px-3.5 py-3 transition-colors"
                :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }"
              >
                <!-- Status Icon -->
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-[10px]"
                  :style="{
                    background: item.status === 'pass'
                      ? 'color-mix(in srgb, var(--brand-positive) 14%, transparent)'
                      : item.status === 'fail'
                        ? 'color-mix(in srgb, var(--brand-negative) 14%, transparent)'
                        : 'color-mix(in srgb, var(--text-heading) 6%, transparent)',
                    color: item.status === 'pass'
                      ? 'var(--brand-positive)'
                      : item.status === 'fail'
                        ? 'var(--brand-negative)'
                        : 'var(--text-muted)',
                  }"
                >
                  <UIcon
                    :name="
                      item.status === 'pass'
                        ? 'i-lucide-check'
                        : item.status === 'fail'
                          ? 'i-lucide-x'
                          : 'i-lucide-minus'
                    "
                    class="size-4"
                  />
                </div>

                <!-- Content -->
                <div class="flex min-w-0 flex-1 flex-col">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[13px] font-medium" :style="{ color: 'var(--text-heading)' }">
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
                        :style="{ color: 'var(--text-muted)' }"
                      >
                        <UIcon name="i-lucide-info" class="size-3" />
                      </button>
                    </UTooltip>
                  </div>
                  <p
                    v-if="item.detail"
                    class="text-[11px] leading-relaxed" :style="{ color: 'var(--text-muted)' }"
                  >
                    {{ item.detail }}
                  </p>
                  <p
                    v-else-if="item.status === 'unknown'"
                    class="text-[11px]" :style="{ color: 'var(--text-muted)' }"
                  >
                    Dados indisponíveis
                  </p>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div
              v-else
              class="flex flex-col items-center justify-center rounded-[12px] border border-dashed py-12 text-center"
              :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }"
            >
              <UIcon name="i-lucide-clipboard-list" class="mb-3 h-8 w-8" :style="{ color: 'var(--text-muted)' }" />
              <p class="text-sm" :style="{ color: 'var(--text-muted)' }">Checklist indisponível</p>
              <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Dados insuficientes para análise</p>
            </div>
          </template>
        </article>
      </section>

      <!-- Company profile -->
      <section v-if="brand.assetPage.showCompanyInfo" id="sec-sobre" class="pb-8">
        <header class="mb-6 flex flex-col gap-1">
          <h2 class="text-[24px] font-medium leading-tight" :style="{ color: 'var(--text-heading)', letterSpacing: '-0.02em' }">
            Sobre a empresa
          </h2>
          <p class="text-[13px]" :style="{ color: 'var(--text-muted)' }">
            Perfil institucional, setor e descrição completa.
          </p>
        </header>

        <article
          class="sobre-card flex flex-col gap-6 rounded-[14px] border px-6 py-6 md:px-8 md:py-8"
          :style="{ background: 'var(--bg-elevated)', borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
        >
          <div class="flex items-start gap-5">
            <USkeleton v-if="isLoadingAsset" class="h-16 w-16 flex-shrink-0 rounded-[14px]" />
            <img
              v-else-if="resolvedLogo && !failedLogos.isFailed(resolvedLogo)"
              :src="resolvedLogo"
              :alt="`Logo de ${assetName}`"
              class="h-16 w-16 flex-shrink-0 rounded-[14px] object-cover"
              @error="failedLogos.markFailed(resolvedLogo)"
            />
            <div
              v-else-if="!isLoadingAsset"
              class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[14px]"
              :style="{ background: 'color-mix(in srgb, var(--text-heading) 6%, transparent)', color: 'var(--text-muted)' }"
              aria-hidden="true"
            >
              <span class="font-mono-tab text-base font-bold">{{ tickerUpper.slice(0, 2) }}</span>
            </div>
            <div class="flex flex-1 flex-col gap-1">
              <USkeleton v-if="isLoadingAsset" class="h-6 w-48" />
              <template v-else>
                <h3 class="text-[18px] font-medium leading-tight md:text-[20px]" :style="{ color: 'var(--text-heading)' }">
                  {{ formatCompanyName(asset?.name) }}
                </h3>
                <span class="text-[12px]" :style="{ color: 'var(--text-muted)' }">
                  {{ tickerUpper }} · Código B3
                </span>
              </template>
            </div>
          </div>

          <!-- Sub-cards: Setor / Indústria / Website -->
          <div
            v-if="!isLoadingAsset && (asset?.sector || asset?.industry || asset?.website)"
            class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div
              v-if="asset?.sector"
              class="flex flex-col gap-1 rounded-[12px] border px-4 py-3"
              :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }"
            >
              <span class="text-[11px]" :style="{ color: 'var(--text-muted)' }">Setor</span>
              <span class="text-[14px] font-medium" :style="{ color: 'var(--text-heading)' }">{{ asset.sector }}</span>
            </div>
            <div
              v-if="asset?.industry"
              class="flex flex-col gap-1 rounded-[12px] border px-4 py-3"
              :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }"
            >
              <span class="text-[11px]" :style="{ color: 'var(--text-muted)' }">Indústria</span>
              <span class="text-[14px] font-medium" :style="{ color: 'var(--text-heading)' }">{{ asset.industry }}</span>
            </div>
            <div
              v-if="asset?.website"
              class="flex flex-col gap-1 rounded-[12px] border px-4 py-3"
              :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }"
            >
              <span class="text-[11px]" :style="{ color: 'var(--text-muted)' }">Website</span>
              <a
                :href="asset.website"
                target="_blank"
                rel="noopener noreferrer"
                class="text-[14px] font-medium transition-opacity hover:opacity-80"
                :style="{ color: 'var(--brand-primary)' }"
              >
                {{ asset.website.replace(/^https?:\/\//, '').replace(/\/$/, '') }} →
              </a>
            </div>
          </div>

          <!-- Description completa da empresa, dentro do card. -->
          <div
            v-if="editorialDescriptionParagraphs.length"
            class="flex flex-col gap-4"
          >
            <p
              v-for="(p, idx) in editorialDescriptionParagraphs"
              :key="idx"
              class="text-[15px] leading-[1.7]"
              :style="{ color: 'var(--text-body)' }"
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
        </article>
      </section>

      <!-- Seção de IA para não autenticados — card editorial v4 -->
      <section v-if="!authStore.isAuthenticated" class="py-12">
        <header class="mb-6 flex flex-col gap-1">
          <span class="eyebrow">Assistente IA</span>
          <h2 class="text-[24px] font-medium leading-tight md:text-[28px]" :style="{ color: 'var(--text-heading)', letterSpacing: '-0.02em' }">
            Dúvidas sobre <em class="italic" :style="{ fontFamily: '\'Instrument Serif\', Georgia, serif', color: 'var(--brand-primary)' }">{{ tickerUpper }}</em>?
          </h2>
          <p class="text-[13px]" :style="{ color: 'var(--text-muted)' }">
            Pergunte qualquer coisa, resposta em ~3 segundos.
          </p>
        </header>

        <!-- Cards de perguntas pre-feitas -->
        <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <NuxtLink
            v-for="(item, idx) in [
              { text: `Vale investir em ${tickerUpper}?`, desc: 'Análise de viabilidade', icon: 'i-lucide-target' },
              { text: 'Qual o preço teto?', desc: 'Método Bazin', icon: 'i-lucide-calculator' },
              { text: 'Relatório completo', desc: 'Análise fundamentalista', icon: 'i-lucide-file-text' },
            ]"
            :key="idx"
            :to="`/help?q=${encodeURIComponent(item.text + ' (' + tickerUpper + ')')}`"
            class="group flex flex-col gap-3 rounded-[14px] border px-5 py-5 transition-all hover:-translate-y-0.5"
            :style="{ background: 'var(--bg-elevated)', borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
          >
            <span
              class="flex size-9 items-center justify-center rounded-[10px]"
              :style="{ background: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)', color: 'var(--brand-primary)' }"
              aria-hidden="true"
            >
              <UIcon :name="item.icon" class="size-4" />
            </span>
            <p class="text-[15px] font-medium leading-snug" :style="{ color: 'var(--text-heading)' }">
              {{ item.text }}
            </p>
            <span class="text-[11px]" :style="{ color: 'var(--text-muted)' }">{{ item.desc }}</span>
            <span
              class="mt-auto inline-flex items-center gap-1 text-[12px] font-medium transition-opacity group-hover:opacity-80"
              :style="{ color: 'var(--brand-text)' }"
            >
              Perguntar
              <UIcon name="i-lucide-arrow-right" class="size-3.5" />
            </span>
          </NuxtLink>
        </div>

        <!-- Card final com CTA -->
        <article
          class="ai-cta-card flex flex-col items-center gap-3 rounded-[14px] border px-6 py-8 text-center md:py-10"
          :style="{ background: 'var(--bg-elevated)', borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
        >
          <UButton
            to="/help"
            size="xl"
            class="group rounded-full px-6 py-3 text-[15px] font-semibold"
            :style="{
              backgroundColor: 'var(--brand-primary)',
              color: 'var(--text-on-primary)',
            }"
          >
            <UIcon name="i-lucide-sparkles" class="size-4" />
            {{ brand.ai.ctaButton }}
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </UButton>
          <p class="flex items-center gap-2 text-[12px]" :style="{ color: 'var(--text-muted)' }">
            <UIcon name="i-lucide-shield-check" class="size-3.5" />
            Gratuito · sem cartão · resposta em segundos
          </p>
        </article>
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

// Loose accessor for scrape_extras when reading groups across asset types
// without discriminating first (e.g. quality/growth/leverage for stocks AND
// fii/etf for funds). Values are always consumed via Number(...)/?? null, so
// `unknown` is safe here.
type LooseExtras = Record<string, Record<string, unknown> | undefined>

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
  import.meta.client &&
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

const _blockChat = ref(false)
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
  fetchVolatility1YSeries()
})

const _chatSuggestions = [
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
    (fundamentusData.value)?.key_statistics?.volume
  )
  if (v !== null) return v
  return safeNumber((asset.value)?.volume) ?? 0
})

// "Last update" label for the status bar, tracks the latest price_at
const _lastUpdateLabel = computed(() => {
  const rawDate = (asset.value)?.price_at || (asset.value)?.priceAt
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
    { label: 'DY', value: ind.dividendYield, tooltip: 'Dividend Yield 12M', accent: 'var(--brand-primary)' },
    { label: 'ROE', value: ind.roe, tooltip: 'Return on Equity' },
    { label: 'ROA', value: ind.roa, tooltip: 'Return on Assets' },
    { label: 'MG.LIQ', value: ind.netMargin, tooltip: 'Margem liquida' },
  ]
})

// Dividend heatmap cell styling, flat terminal look, no rounded/gradients.
// Cells share a border via gap-px on a bordered parent, so each cell is
// a simple rectangle filled with surface/background colors.
function _monthCellStyle(item: { highlight?: boolean; percentage?: number }): Record<string, string> {
  if (item.highlight) {
    return {
      backgroundColor: `color-mix(in srgb, var(--brand-primary) 12%, transparent)`,
      borderLeft: `2px solid var(--brand-primary)`,
    }
  }
  if (item.percentage >= 80) {
    return {
      backgroundColor: `color-mix(in srgb, var(--brand-positive) 8%, transparent)`,
    }
  }
  if (item.percentage >= 50) {
    return {
      backgroundColor: `color-mix(in srgb, var(--brand-positive) 4%, transparent)`,
    }
  }
  if (item.percentage > 0) {
    return { backgroundColor: 'var(--brand-surface)' }
  }
  return { backgroundColor: 'var(--brand-background)' }
}

function _monthCellAccent(item: { highlight?: boolean; percentage?: number }): string {
  if (item.highlight) return 'var(--brand-primary)'
  if (item.percentage >= 80) return 'var(--brand-positive)'
  if (item.percentage >= 50) return 'var(--brand-text)'
  if (item.percentage > 0) return 'var(--brand-text-muted)'
  return 'var(--brand-border)'
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
  } catch { /* ignore */ }
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
      } catch { /* ignore */ }
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
  } catch { /* ignore */ }
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
  const arr = commentaries.value || []
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
  const base: Record<string, unknown>[] = [financialProductStructuredData.value, faqStructuredData.value]
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

const _monthlyDividendProbability = computed(() => {
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
  return (fundamentusData.value)?.scrape_extras ?? null
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
const heroAccent = computed(() => (isPositive.value ? 'var(--brand-positive)' : 'var(--brand-negative)'))

// Badge mostrado no ticker bar. Prioriza subcategoria FII (FIAGRO, etc),
// senão cai pro tipo do asset (STOCK, REIT, ETF, BDR).
// Compacta múltiplos espaços do nome do ativo retornado pelo StatusInvest
// (ex: "PETROBRAS   PN      N2" → "PETROBRAS PN N2") pra renderizar limpo.
function formatCompanyName(raw: string | null | undefined): string {
  if (!raw) return ''
  return raw.replace(/\s+/g, ' ').trim()
}

// ===== Destaques Fundamentais (5 badges + 5 stat cards) =====
interface DestaqueBadge {
  label: string
  icon: string
  statusLabel: string
  color: string
}
interface DestaqueStat {
  label: string
  value: string
  caption?: string
  captionColor?: string
}

function fmtCompactBRL(n: unknown): string {
  const num = Number(n)
  if (!Number.isFinite(num) || num === 0) return '—'
  const abs = Math.abs(num)
  if (abs >= 1e12) return `R$ ${(num / 1e12).toFixed(2).replace('.', ',')}T`
  if (abs >= 1e9) return `R$ ${(num / 1e9).toFixed(2).replace('.', ',')}B`
  if (abs >= 1e6) return `R$ ${(num / 1e6).toFixed(2).replace('.', ',')}M`
  return `R$ ${num.toFixed(0)}`
}

const destaquesBadges = computed<DestaqueBadge[]>(() => {
  const extras = scrapeExtras.value as unknown as LooseExtras | null
  const quality = extras?.quality || {}
  const growth = extras?.growth || {}
  const leverage = extras?.leverage || {}
  const valuation = extras?.valuation || {}

  const roe = Number(quality.return_on_equity) || 0
  const revCagr = Number(growth.revenue_cagr_5y) || 0
  const ndEbitda = Number(leverage.net_debt_to_ebitda) || 0
  const pe = Number(valuation.price_to_earnings) || 0
  const dy = Number(valuation.dividend_yield) || 0

  const pos = 'var(--brand-positive)'
  const amber = 'var(--brand-primary)'
  const neg = 'var(--brand-negative)'

  return [
    {
      label: 'Rentabilidade',
      icon: 'i-lucide-trending-up',
      statusLabel: roe >= 15 ? 'Excelente' : roe >= 10 ? 'Boa' : roe >= 5 ? 'Moderada' : 'Atenção',
      color: roe >= 10 ? pos : roe >= 5 ? amber : neg,
    },
    {
      label: 'Crescimento',
      icon: 'i-lucide-bar-chart-3',
      statusLabel: revCagr >= 15 ? 'Forte' : revCagr >= 5 ? 'Moderado' : revCagr >= 0 ? 'Lento' : 'Negativo',
      color: revCagr >= 15 ? pos : revCagr >= 5 ? amber : neg,
    },
    {
      label: 'Endividamento',
      icon: 'i-lucide-shield',
      statusLabel: ndEbitda < 1 ? 'Bom' : ndEbitda < 2 ? 'Moderado' : ndEbitda < 3 ? 'Atenção' : 'Alto',
      color: ndEbitda < 1 ? pos : ndEbitda < 2 ? amber : neg,
    },
    {
      label: 'Valuation',
      icon: 'i-lucide-scale',
      statusLabel: pe > 0 && pe < 10 ? 'Atrativo' : pe < 20 ? 'Neutro' : 'Caro',
      color: pe > 0 && pe < 10 ? pos : pe < 20 ? amber : neg,
    },
    {
      label: 'Dividendo',
      icon: 'i-lucide-coins',
      statusLabel: dy >= 6 ? 'Excelente' : dy >= 3 ? 'Bom' : dy >= 1 ? 'Moderado' : 'Baixo',
      color: dy >= 6 ? pos : dy >= 3 ? amber : neg,
    },
  ]
})

const destaquesStats = computed<DestaqueStat[]>(() => {
  const extras = scrapeExtras.value as unknown as LooseExtras | null
  const fd = (fundamentusData.value)?.financial_data || {}
  const ks = (fundamentusData.value)?.key_statistics || {}
  const quality = extras?.quality || {}
  const growth = extras?.growth || {}
  const leverage = extras?.leverage || {}

  const roe = Number(quality.return_on_equity)
  const revenue = Number(fd.total_revenue)
  const margin = Number(quality.net_margin) // já em %
  const netIncome = Number.isFinite(revenue) && Number.isFinite(margin) ? (revenue * margin) / 100 : NaN
  const revCagr = Number(growth.revenue_cagr_5y)
  const earningsGrowth = Number(ks.earnings_annual_growth) * 100
  const ndEbitda = Number(leverage.net_debt_to_ebitda)

  const fmtPct = (n: number, digits = 1) => Number.isFinite(n) ? `${n.toFixed(digits).replace('.', ',')}%` : '—'
  const fmtNumber = (n: number, digits = 2) => Number.isFinite(n) ? n.toFixed(digits).replace('.', ',') : '—'
  const arrow = (n: number) => n >= 0 ? '↑' : '↓'

  return [
    {
      label: 'ROE',
      value: fmtPct(roe, 1),
      caption: roe >= 20 ? 'Excelente' : roe >= 12 ? 'Boa' : roe >= 5 ? 'Razoável' : roe > 0 ? 'Baixa' : 'Negativa',
      captionColor: roe >= 12 ? 'var(--brand-positive)' : roe >= 5 ? 'var(--brand-primary)' : 'var(--brand-negative)',
    },
    {
      label: 'Receita (12M)',
      value: fmtCompactBRL(revenue),
      caption: Number.isFinite(revCagr) ? `${arrow(revCagr)} ${Math.abs(revCagr).toFixed(1).replace('.', ',')}% a.a.` : '',
      captionColor: revCagr >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)',
    },
    {
      label: 'Lucro Líquido (12M)',
      value: fmtCompactBRL(netIncome),
      caption: Number.isFinite(earningsGrowth) ? `${arrow(earningsGrowth)} ${Math.abs(earningsGrowth).toFixed(1).replace('.', ',')}% a.a.` : '',
      captionColor: earningsGrowth >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)',
    },
    {
      label: 'Margem Líquida',
      value: fmtPct(margin, 1),
      caption: margin >= 15 ? 'Saudável' : margin >= 5 ? 'Aceitável' : margin > 0 ? 'Em queda' : 'Negativa',
      captionColor: margin >= 15 ? 'var(--brand-positive)' : margin >= 5 ? 'var(--brand-primary)' : 'var(--brand-negative)',
    },
    {
      label: 'Div. Líq./EBITDA',
      value: fmtNumber(ndEbitda, 2),
      caption: ndEbitda < 1 ? 'Confortável' : ndEbitda < 2 ? 'Moderado' : ndEbitda < 3 ? 'Atenção' : 'Alto',
      captionColor: ndEbitda < 1 ? 'var(--brand-positive)' : ndEbitda < 2 ? 'var(--brand-primary)' : 'var(--brand-negative)',
    },
  ]
})

const indicadoresEssenciais = computed<Array<{ label: string; value: string }>>(() => {
  const extras = scrapeExtras.value as unknown as LooseExtras | null
  const v = extras?.valuation || {}
  const ks = (fundamentusData.value)?.key_statistics || {}

  const fmtNum = (n: unknown, d = 2) => {
    const num = Number(n)
    return Number.isFinite(num) ? num.toFixed(d).replace('.', ',') : '—'
  }
  const fmtPct = (n: unknown) => {
    const num = Number(n)
    return Number.isFinite(num) ? `${num.toFixed(2).replace('.', ',')}%` : '—'
  }

  const payoutPct = Number(ks.payout_ratio) ? Number(ks.payout_ratio) * 100 : null

  return [
    { label: 'P/L', value: fmtNum(v.price_to_earnings, 2) },
    { label: 'P/VP', value: fmtNum(v.price_to_book, 2) },
    { label: 'EV/EBITDA', value: fmtNum(v.ev_ebitda, 2) },
    { label: 'Dividend Yield', value: fmtPct(v.dividend_yield) },
    { label: 'Payout', value: payoutPct !== null ? fmtPct(payoutPct) : '—' },
  ]
})

// ===== Dividendos compact card (12-month bars + dividend yield line) =====
interface DivByMonth {
  label: string
  value: number
  barHeight: number
  dy: number
  dyY: number
}
const dividendsByMonth = computed<DivByMonth[]>(() => {
  const list = (dividendsData.value || []) as DividendData[]
  if (!list.length) return []
  // Pega ultimos 12 meses agregados por mes
  const now = new Date()
  const buckets = new Map<string, { sum: number; key: string; date: Date }>()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets.set(key, { sum: 0, key, date: d })
  }
  for (const item of list) {
    const dt = new Date(item.payment_date)
    if (!Number.isFinite(dt.getTime())) continue
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
    if (!buckets.has(key)) continue
    const rate = parseFloat(String(item.rate || '0').replace(/[^\d.,-]/g, '').replace(',', '.'))
    if (Number.isFinite(rate)) buckets.get(key)!.sum += rate
  }
  const arr = Array.from(buckets.values())
  const max = Math.max(...arr.map((b) => b.sum), 0.01)
  const price = Number(asset.value?.market_price) || 1
  return arr.map((b) => {
    const dy = price > 0 ? (b.sum / price) * 100 * 12 : 0 // anualizado pra ilustrar
    const barHeight = Math.max(2, (b.sum / max) * 120)
    const dyMax = 12 // cap em 12% pra escala visual
    const dyY = Math.min(120, (Math.max(0, dy) / dyMax) * 120)
    return {
      label: b.date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase(),
      value: b.sum,
      barHeight,
      dy,
      dyY,
    }
  })
})
const dyLinePoints = computed(() => {
  return dividendsByMonth.value
    .map((d, i) => `${32 + i * 28},${160 - d.dyY}`)
    .join(' ')
})

// Próximo / último pagamento — pega o item mais recente. Se a data e
// futura, label "Próximo pagamento"; senão "Último pagamento".
const lastDividend = computed<DividendData | null>(() => {
  const list = (dividendsData.value || []) as DividendData[]
  if (!list.length) return null
  return [...list].sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())[0] || null
})
const nextDividendLabel = computed(() => {
  if (!lastDividend.value) return 'Último pagamento'
  return new Date(lastDividend.value.payment_date) > new Date() ? 'Próximo pagamento' : 'Último pagamento'
})
const nextDividendValue = computed(() => {
  if (!lastDividend.value) return '—'
  const rate = parseFloat(String(lastDividend.value.rate || '0').replace(/[^\d.,-]/g, '').replace(',', '.'))
  if (!Number.isFinite(rate)) return '—'
  return rate.toFixed(2).replace('.', ',')
})
const nextDividendExDate = computed(() => {
  // Sem ex-date no shape atual; deixa null pra esconder
  return ''
})
const nextDividendPayDate = computed(() => {
  if (!lastDividend.value) return ''
  try {
    const d = new Date(lastDividend.value.payment_date)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return ''
  }
})

// ===== Notícias compact card =====
interface TickerNewsItem {
  id: number
  url: string
  source: string
  title: string
  image_url: string | null
  published_at: string
}
const tickerNews = ref<TickerNewsItem[]>([])
const _activeNewsFilter = ref<'Todas' | 'Empresa' | 'Mercado' | 'Setor'>('Todas')
const tickerNewsTop = computed(() => tickerNews.value.slice(0, 3))

function formatNewsDate(iso: string): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return ''
  }
}

onMounted(async () => {
  try {
    const apiBase = useRuntimeConfig().public.apiBaseUrl as string
    const resp = await $fetch<{ data: TickerNewsItem[] }>(`${apiBase}/news/ticker/${tickerUpper.value}`, {
      query: { limit: 6 },
    })
    tickerNews.value = Array.isArray(resp?.data) ? resp.data : []
  } catch {
    tickerNews.value = []
  }
})

// Slice minimalista de commentaries pro card Resumo Inteligente.
// Top 4 mais recentes; cada item leva data, change %, titulo.
const _resumoCommentaries = computed(() => {
  const list = commentariesData.value || []
  return [...list]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)
})
// Lista completa (sem cap) pro carrossel horizontal — o user dá scroll
// lateral pra ver todos os eventos.
const resumoCommentariesAll = computed(() => {
  const list = commentariesData.value || []
  return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})
function formatShortDate(iso: string): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
  } catch {
    return iso
  }
}

// ===== Resumo Inteligente (card AI) =====
// Score 0-100 derivado dos indicadores basicos: ROE, DY, PL, debt.
// Não é o Redent Score oficial — é uma heurística simples pra preview.
const resumoScore = computed<number>(() => {
  const ind = basicIndicators.value
  if (!ind) return 70
  let score = 50
  // ROE: cada 1% acima de 5% adiciona 1 ponto (cap em 25)
  const roeStr = (ind.roe || '').replace('%', '').replace(',', '.')
  const roeN = parseFloat(roeStr)
  if (Number.isFinite(roeN) && roeN > 5) score += Math.min(25, Math.floor(roeN - 5))
  // DY: cada 1% adiciona 2 pontos (cap em 15)
  const dyStr = (ind.dividendYield || '').replace('%', '').replace(',', '.')
  const dyN = parseFloat(dyStr)
  if (Number.isFinite(dyN) && dyN > 0) score += Math.min(15, Math.floor(dyN * 2))
  // PL baixo é bom (cap 10)
  const plStr = (ind.pl || '').replace(',', '.')
  const plN = parseFloat(plStr)
  if (Number.isFinite(plN) && plN > 0 && plN < 15) score += 10
  return Math.max(0, Math.min(100, score))
})
const resumoScoreBand = computed(() => {
  const s = resumoScore.value
  if (s >= 80) return 'Excelente'
  if (s >= 65) return 'Boa'
  if (s >= 50) return 'Razoável'
  if (s >= 35) return 'Frágil'
  return 'Crítica'
})
const resumoScoreColor = computed(() => {
  const s = resumoScore.value
  if (s >= 65) return 'var(--brand-positive)'
  if (s >= 35) return 'var(--brand-primary)'
  return 'var(--brand-negative)'
})
const resumoScoreSummary = computed(() => {
  const ind = basicIndicators.value
  if (!ind) return 'Empresa com fundamentos sólidos e perfil interessante para a carteira.'
  const s = resumoScore.value
  if (s >= 80) return 'Empresa sólida, com boa geração de caixa e histórico consistente.'
  if (s >= 65) return 'Empresa sólida, com boa geração de caixa e histórico consistente de dividendos.'
  if (s >= 50) return 'Empresa estável, mas com pontos de atenção em rentabilidade ou crescimento.'
  return 'Empresa em momento desafiador — exige cautela e acompanhamento próximo.'
})
const resumoStrengths = computed<string[]>(() => {
  const ind = basicIndicators.value
  const out: string[] = []
  const roeN = parseFloat((ind?.roe || '').replace('%', '').replace(',', '.'))
  const dyN = parseFloat((ind?.dividendYield || '').replace('%', '').replace(',', '.'))
  const plN = parseFloat((ind?.pl || '').replace(',', '.'))
  if (Number.isFinite(roeN) && roeN >= 12) out.push('Boa rentabilidade (ROE)')
  if (Number.isFinite(dyN) && dyN >= 4) out.push('Dividend yield atrativo')
  if (Number.isFinite(plN) && plN > 0 && plN < 12) out.push('Múltiplo P/L atrativo')
  if (!out.length) out.push('Marca consolidada no setor', 'Histórico de pagamento de dividendos')
  if (out.length < 3) out.push('Líder em seu segmento')
  return out.slice(0, 3)
})
const resumoRisks = computed<string[]>(() => {
  const ind = basicIndicators.value
  const out: string[] = []
  const roeN = parseFloat((ind?.roe || '').replace('%', '').replace(',', '.'))
  const plN = parseFloat((ind?.pl || '').replace(',', '.'))
  if (Number.isFinite(roeN) && roeN < 8) out.push('Rentabilidade abaixo da média')
  if (Number.isFinite(plN) && plN > 25) out.push('Múltiplo P/L elevado')
  if (!out.length) {
    out.push('Endividamento acima da média', 'Margem líquida em queda', 'Crescimento moderado')
  }
  return out.slice(0, 3)
})
const resumoProfile = computed(() => {
  const sector = asset.value?.sector || ''
  if (/financial|bank/i.test(sector)) return 'Investidores que buscam renda recorrente e exposição ao setor financeiro.'
  if (/health/i.test(sector)) return 'Investidores que buscam renda recorrente e exposição ao setor de saúde.'
  if (/energy|oil|petroleum/i.test(sector)) return 'Investidores que buscam exposição a commodities e ciclos do petróleo.'
  if (/real estate|reit/i.test(sector)) return 'Investidores em busca de renda passiva via aluguéis e dividendos mensais.'
  return 'Investidores que buscam renda recorrente e empresas consolidadas.'
})

// ===== Cotação stats (Min 12M, Max 12M, Var 12M, Volatilidade, Free Float, Ações) =====
const previousClosePrice = computed<number | null>(() => {
  const cur = Number(asset.value?.market_price)
  const ch = Number(asset.value?.change_percent)
  if (!Number.isFinite(cur) || !Number.isFinite(ch) || ch === -100) return null
  return cur / (1 + ch / 100)
})

// Volatilidade 1A = stddev anualizada dos retornos diarios. Usa uma série
// dedicada de 12 meses, INDEPENDENTE do range do gráfico (que abre em 1 mês,
// curto demais pra anualizar — por isso a stat aparecia "—" por padrão).
// Anualiza com sqrt(252) (dias úteis B3). Volta '—' se a série de 1 ano vier
// curta (ticker novo/ilíquido).
const volatility1ySeries = ref<number[]>([])
async function fetchVolatility1YSeries() {
  try {
    const data = await assetHistoricPrices(ticker, '12mo')
    volatility1ySeries.value = Array.isArray(data)
      ? data.map((it) => Number(it.market_price)).filter((v) => Number.isFinite(v) && v > 0)
      : []
  } catch {
    volatility1ySeries.value = []
  }
}
const computedVolatility1Y = computed<number | null>(() => {
  const prices = volatility1ySeries.value
  if (prices.length < 30) return null
  const returns: number[] = []
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]))
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length - 1)
  const stdDaily = Math.sqrt(variance)
  return stdDaily * Math.sqrt(252) * 100
})

const cotacaoStats = computed<Array<{ label: string; value: string }>>(() => {
  const extras = scrapeExtras.value as unknown as LooseExtras | null
  const market = extras?.market || {}
  const fii = extras?.fii || {}
  const etf = extras?.etf || {}

  const min52 = market.min_price_52_weeks ?? fii.min_price_52_weeks ?? etf.min_price_52_weeks ?? null
  const max52 = market.max_price_52_weeks ?? fii.max_price_52_weeks ?? etf.max_price_52_weeks ?? null
  const var12m = Number((fundamentusData.value)?.key_statistics?.fifty_two_week_change ?? null) * 100
  const freeFloat = market.free_float ?? null
  const shares = market.shares_outstanding ?? null

  const fmtBRL = (n: unknown) => {
    const num = Number(n)
    return Number.isFinite(num) && num > 0 ? `R$ ${num.toFixed(2).replace('.', ',')}` : '—'
  }
  const fmtPctSigned = (n: unknown) => {
    const num = Number(n)
    if (!Number.isFinite(num) || num === 0) return '—'
    const sign = num >= 0 ? '+' : ''
    return `${sign}${num.toFixed(2).replace('.', ',')}%`
  }
  const fmtPctPlain = (n: unknown) => {
    const num = Number(n)
    return Number.isFinite(num) && num > 0 ? `${num.toFixed(1).replace('.', ',')}%` : '—'
  }
  const fmtCompactCount = (n: unknown) => {
    const num = Number(n)
    if (!Number.isFinite(num) || num <= 0) return '—'
    if (num >= 1e9) return `${(num / 1e9).toFixed(2).replace('.', ',')}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2).replace('.', ',')}M`
    return num.toLocaleString('pt-BR')
  }

  return [
    { label: 'Mín. 12M', value: fmtBRL(min52) },
    { label: 'Máx. 12M', value: fmtBRL(max52) },
    { label: 'Var. 12M', value: fmtPctSigned(var12m) },
    { label: 'Volatilidade (1A)', value: fmtPctPlain(computedVolatility1Y.value) },
    { label: 'Free float', value: fmtPctPlain(freeFloat) },
    { label: 'Ações em circulação', value: fmtCompactCount(shares) },
  ]
})

// ===== Asset section nav (Resumo / Análise / Financeiro / Dividendos / Notícias / Sobre) =====
const assetNavTabs = computed(() => {
  const tabs: Array<{ id: string; label: string }> = [
    { id: 'sec-resumo', label: 'Resumo' },
    { id: scrapeExtras.value ? 'sec-analise-rich' : 'sec-analise', label: 'Análise completa' },
  ]
  if (brand.assetPage.showFinancials && !isBdr.value && !isEtf.value) tabs.push({ id: 'sec-financeiro', label: 'Financeiro' })
  if ((brand.assetPage.showDividendMap || brand.assetPage.showDividendChart) && !isEtf.value) tabs.push({ id: 'sec-dividendos', label: 'Dividendos' })
  if (brand.assetPage.showNews) tabs.push({ id: 'sec-noticias', label: 'Notícias' })
  if (brand.assetPage.showCompanyInfo) tabs.push({ id: 'sec-sobre', label: 'Sobre a empresa' })
  return tabs
})
const activeAssetSection = ref<string>('sec-resumo')
let assetNavObserver: IntersectionObserver | null = null

function onAssetNavClick(e: MouseEvent, id: string) {
  e.preventDefault()
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 80
  window.scrollTo({ top, behavior: 'smooth' })
  activeAssetSection.value = id
}

onMounted(() => {
  // IntersectionObserver pra trackear qual section esta visivel e
  // marcar o tab correspondente como activo. rootMargin negativo no
  // topo conta a seccao como "entrou" so quando passa do header sticky.
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return
  assetNavObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible[0]) activeAssetSection.value = visible[0].target.id
    },
    { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
  )
  // Observa apos a hydratacao do DOM
  setTimeout(() => {
    for (const t of assetNavTabs.value) {
      const el = document.getElementById(t.id)
      if (el && assetNavObserver) assetNavObserver.observe(el)
    }
  }, 200)
})
onBeforeUnmount(() => {
  if (assetNavObserver) assetNavObserver.disconnect()
})

const assetBadgeLabel = computed(() => {
  const extras = scrapeExtras.value as unknown as LooseExtras | null
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

// 30d change for the header sparkline (first vs last of the 30-point slice),
// so its delta reflects the 30-day trend — not today's price move (which the
// price line already shows as "hoje").
const heroSparkline30dChange = computed<number | null>(() => {
  const p = heroSparkline.value.points
  if (p.length < 2) return null
  const first = p[0]
  const last = p[p.length - 1]
  if (first == null || last == null || first === 0) return null
  return ((last - first) / first) * 100
})

const sessionStats = computed(() => {
  const extras = scrapeExtras.value

  // ----- FII -----
  if (extras?.asset_type === 'fii') {
    const f = extras.fii
    return [
      { label: 'VOL', value: formatVolumeShort(currentVolume.value) },
      { label: 'COTISTAS', value: f.num_shareholders !== null ? Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(f.num_shareholders) : '-' },
      { label: 'DY', value: f.dividend_yield_12m !== null ? `${f.dividend_yield_12m.toFixed(2)}%` : '-', accent: 'var(--brand-primary)' },
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
      { label: 'VAR.12M', value: e.change_12m !== null ? `${e.change_12m >= 0 ? '+' : ''}${e.change_12m.toFixed(2)}%` : '-', accent: e.change_12m !== null ? (e.change_12m >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)') : undefined },
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
      { label: 'DY', value: v.dividend_yield !== null ? `${v.dividend_yield.toFixed(2)}%` : '-', accent: 'var(--brand-primary)' },
      { label: 'P/L', value: v.price_to_earnings !== null ? v.price_to_earnings.toFixed(2) : '-' },
      { label: 'P/VP', value: v.price_to_book !== null ? v.price_to_book.toFixed(2) : '-' },
      { label: 'ROE', value: q.return_on_equity !== null ? `${q.return_on_equity.toFixed(1)}%` : '-' },
    ]
  }

  // ----- STOCK (default) -----
  // 3 stats principais (matching design v4 hero): DY / P/L / Market Cap.
  // Cada um com caption descritivo abaixo do valor.
  return [
    { label: 'Dividend Yield', value: formatDyShort(basicIndicators.value?.dividendYield), caption: 'Últimos 12 meses', accent: 'var(--brand-primary)' },
    { label: 'P/L', value: basicIndicators.value?.pl || '-', caption: 'Preço / Lucro' },
    { label: 'Market Cap', value: formatMarketCapShort((asset.value as { market_cap?: number } | undefined)?.market_cap), caption: 'Valor de mercado' },
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


/* ========== DIVIDENDOS COMPACT CARD ========== */
.dividends-axis-label {
  font-family: ui-monospace, monospace;
  font-size: 10px;
  fill: var(--text-muted);
}

/* ========== NOTÍCIAS COMPACT CARD (filter pills) ========== */
.news-filter-pill {
  border-color: color-mix(in srgb, var(--brand-border) 30%, transparent);
  background: var(--bg-elevated);
  color: var(--text-body);
  cursor: pointer;
}
.news-filter-pill:hover {
  color: var(--text-heading);
  border-color: color-mix(in srgb, var(--brand-border) 50%, transparent);
}
.news-filter-pill.is-active {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: var(--text-on-primary);
}

/* ========== RESUMO MOVIMENTOS NOTÁVEIS (carrossel horizontal) ========== */
/* Scrollbar invisivel — user dá swipe/drag pra scrollar lateralmente,
   sem barra visivel poluindo o card. -ms- pro Edge legado, scrollbar-
   width: none pro Firefox, ::-webkit-scrollbar pro Chrome/Safari. */
.resumo-mov-rail {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.resumo-mov-rail::-webkit-scrollbar {
  display: none;
  height: 0;
  width: 0;
}
.resumo-mov-pill {
  transition: transform 150ms ease, border-color 150ms ease;
}
.resumo-mov-pill:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 30%, transparent) !important;
}

/* ========== ASSET SECTION NAV (card com tabs) ========== */
.asset-nav { scroll-behavior: smooth; }
.asset-nav-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-body);
  border-radius: 8px;
  transition: color 150ms, background 150ms;
  white-space: nowrap;
  text-decoration: none;
  flex-shrink: 0;
}
.asset-nav-tab:hover {
  color: var(--text-heading);
  background: color-mix(in srgb, var(--text-heading) 4%, transparent);
}
.asset-nav-tab.is-active {
  color: var(--brand-primary);
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
}
</style>

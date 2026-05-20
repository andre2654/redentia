<!--
  HOME ANÔNIMA — proposta de página completa pra visitante deslogado.

  Filosofia: "só o que importa", mas como tela inteira (não fragmento).
  6 seções editoriais, todas curadas, sem dashboard / sem widgetão.

    1. Hero editorial (o que aconteceu + por quê em 2 linhas)
    2. Trinity inline (3 indicadores chave horizontais)
    3. Por quê (3 cards "causa → consequência" com news matching)
    4. O dia em um traço (chart intraday do IBOV)
    5. O que olhar amanhã (3 eventos do calendário econômico)
    6. CTA (e na sua carteira?)

  Data: tudo fake, hardcoded. Vai virar dinâmico depois.
-->
<template>
  <NuxtLayout name="default" title="Hoje">
    <!-- ============ VIEW TOGGLE — Para você (/) | Mercado completo (/mercado-completo) ============ -->
    <div class="flex justify-center py-2">
      <MoleculesHomeViewToggle />
    </div>

    <!-- ============ HERO — Banner CTA "Do caos ao impacto" (full-bleed) ============ -->
    <header class="h-hero-shell">
      <MoleculesHomeIntelligenceBanner :full-bleed="true" />
    </header>

    <!-- ============ EVENTS BAR (full-bleed, glued ao hero) ============ -->
    <div class="h-events-bar">
      <div class="h-events-bar-inner">
        <span class="h-events-pill-icon">
          <UIcon name="i-lucide-sparkles" class="size-3.5" />
        </span>
        <p class="h-events-pill-text">4 fatores moveram o mercado hoje</p>
        <ul class="h-events-pill-chips">
          <li class="h-chip h-chip-oil">
            <UIcon name="i-lucide-droplet" class="size-3" />
            <span>Petróleo</span>
          </li>
          <li class="h-chip h-chip-juros">
            <UIcon name="i-lucide-percent" class="size-3" />
            <span>Juros futuros</span>
          </li>
          <li class="h-chip h-chip-consumo">
            <UIcon name="i-lucide-shopping-bag" class="size-3" />
            <span>Consumo doméstico</span>
          </li>
        </ul>
      </div>
    </div>

    <main class="h-dark-main">

      <!-- ============ BANNER: dados de D-1 (mercado fechado / feriado) ============
           Mesma lógica de /wallet/hoje: aparece quando o último as_of_date
           do IBOV != hoje em BRT. Wrapper compartilha max-width + margin
           auto da hp9-main pra alinhar com IBOVESPA HOJE abaixo. -->
      <div v-if="marketClosedBanner" class="hp9-stale-wrap">
        <div class="hp9-stale-banner">
          <UIcon name="i-lucide-clock" class="size-3.5" />
          <span>{{ marketClosedBanner }}</span>
        </div>
      </div>

      <!-- ============ IBOVESPA HOJE — DNA hp9-main (mesma estrutura da /wallet/hoje) ============ -->
      <!-- Dados reais via useHomeData (market/snapshot + indices/ibov/prices).
           Loading=true → skeletons; loading=false → swap por dados reais. -->
      <article class="hp9-main">
        <!-- LEFT: dados (eyebrow + mega + callouts + breakdown) -->
        <div class="hp9-main-left">
          <p class="calc-result-eyebrow">IBOVESPA hoje</p>
          <p v-if="homeLoading" class="calc-result-mega"><span class="wp8-skel wp8-skel-text-mega" /></p>
          <p v-else class="calc-result-mega">{{ formatNumberPtBR(home.ibov.value) }} <span class="hp9-unit">pts</span></p>
          <p class="calc-result-caption">
            <template v-if="homeLoading"><span class="wp8-skel wp8-skel-text-sm" /></template>
            <template v-else>
              <span :class="['hp9-delta-pct', home.ibov.changePct >= 0 ? 'pos' : 'neg']">
                <UIcon :name="home.ibov.changePct >= 0 ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'" class="size-3" />
                {{ formatChangePct(home.ibov.changePct) }}
              </span>
              · Hoje, <span :class="home.ibov.changePts >= 0 ? 'pos' : 'neg'">{{ formatChangePts(home.ibov.changePts) }}</span>
            </template>
          </p>

          <div class="hp9-snapshot">
            <!-- LEADS reais: derivados dos top losers/gainers da B3 (Sprint 2). -->
            <div class="hp9-snapshot-leads">
              <template v-if="homeLoading">
                <div v-for="n in 2" :key="`skel-lead-${n}`" class="hp9-lead hp9-lead-skel">
                  <span class="hp9-lead-icon"><span class="wp8-skel wp8-skel-circle" style="width: 18px; height: 18px;" /></span>
                  <p class="hp9-lead-text"><span class="wp8-skel wp8-skel-text-sm" style="width: 90%;" /></p>
                </div>
              </template>
              <template v-else>
                <div
                  v-for="(lead, i) in home.leads"
                  :key="`lead-${i}`"
                  :class="['hp9-lead', lead.tone === 'neg' ? 'hp9-lead-neg' : 'hp9-lead-pos']"
                >
                  <span class="hp9-lead-icon">
                    <UIcon :name="lead.tone === 'neg' ? 'i-lucide-trending-down' : 'i-lucide-trending-up'" class="size-4" />
                  </span>
                  <p class="hp9-lead-text" v-html="lead.html" />
                </div>
              </template>
            </div>

            <!-- BREAKDOWN: 3 mini cards (Petróleo / IPCA 12m / Dólar). Variação
                 do dia dos drivers reais (proxy editorial honesto enquanto não
                 temos factor attribution exato no backend). -->
            <div v-if="homeLoading" class="hp9-mini-grid">
              <div v-for="n in 3" :key="`skel-mini-${n}`" class="hp9-mini">
                <span class="hp9-mini-icon hp9-icon-neutral">
                  <span class="wp8-skel wp8-skel-circle" style="width: 16px; height: 16px;" />
                </span>
                <div class="hp9-mini-body">
                  <p class="hp9-mini-label"><span class="wp8-skel wp8-skel-text-sm" style="width: 80px;" /></p>
                  <p class="hp9-mini-sub"><span class="wp8-skel wp8-skel-chip" style="width: 50px;" /></p>
                </div>
              </div>
            </div>
            <div v-else class="hp9-mini-grid">
              <div v-for="f in home.miniFactors" :key="f.key" class="hp9-mini">
                <span :class="['hp9-mini-icon', `hp9-icon-${f.key}`]">
                  <UIcon :name="f.key === 'petroleo' ? 'i-lucide-droplet' : f.key === 'juros' ? 'i-lucide-percent' : 'i-lucide-dollar-sign'" class="size-4" />
                </span>
                <div class="hp9-mini-body">
                  <p class="hp9-mini-label">{{ f.label }}</p>
                  <p :class="['hp9-mini-sub', f.changePct >= 0 ? 'pos' : 'neg']">{{ f.display }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: série diária 30 dias + stats. NÃO é intraday — o
             endpoint /api/indices/ibov/prices?mode=1mo retorna closes
             diários. Cor e stat top-right refletem a variação do
             período (start→end), não o pct DE HOJE. -->
        <div class="hp9-main-right">
          <header class="hp9-chart-head">
            <div>
              <p class="calc-result-eyebrow">Últimos 30 dias</p>
              <h3 class="hp9-chart-title">Variação <em class="hp9-italic">no período.</em></h3>
            </div>
            <p v-if="homeLoading" class="hp9-chart-stat"><span class="wp8-skel wp8-skel-chip" style="width: 60px;" /></p>
            <p v-else :class="['hp9-chart-stat', home.chartStats.periodChangePct >= 0 ? 'pos' : 'neg']">{{ formatChangePct(home.chartStats.periodChangePct) }}</p>
          </header>

          <div v-if="homeLoading" class="hp9-curve">
            <span class="wp8-skel wp8-skel-curve" />
          </div>
          <div v-else class="hp9-curve">
            <svg
              ref="chartSvgRef"
              viewBox="0 0 800 240"
              preserveAspectRatio="none"
              class="hp9-chart-svg"
              @mousemove="onChartMouseMove"
              @mouseleave="onChartMouseLeave"
            >
              <defs>
                <linearGradient id="hp9-home-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" :stop-color="ibovChartColor" stop-opacity="0.22" />
                  <stop offset="100%" :stop-color="ibovChartColor" stop-opacity="0" />
                </linearGradient>
              </defs>
              <line v-for="y in [60, 120, 180]" :key="y" x1="0" :y1="y" x2="800" :y2="y" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="2 4" />
              <polygon :points="ibovChartGeom.polygon" fill="url(#hp9-home-grad)" />
              <polyline :points="ibovChartGeom.polyline" fill="none" :stroke="ibovChartColor" stroke-width="2" />

              <g v-if="hoverPoint" class="hp9-chart-hover">
                <line :x1="hoverPoint.x" y1="0" :x2="hoverPoint.x" y2="240" stroke="var(--text-heading)" stroke-width="1" stroke-dasharray="3 3" opacity="0.35" />
                <circle :cx="hoverPoint.x" :cy="hoverPoint.y" r="5" fill="var(--brand-positive)" stroke="var(--bg-default)" stroke-width="2" />
              </g>
            </svg>

            <div
              v-if="hoverPoint"
              class="hp9-chart-tip"
              :style="{ left: `${(hoverPoint.x / 800) * 100}%` }"
            >
              <p class="hp9-chart-tip-date">{{ hoverPoint.label }}</p>
              <p class="hp9-chart-tip-val">{{ formatNumberPtBR(hoverPoint.price) }}</p>
            </div>
          </div>

          <ul class="hp9-curve-stats">
            <li>
              <p class="hp9-cs-label">Início</p>
              <p v-if="homeLoading" class="hp9-cs-val"><span class="wp8-skel wp8-skel-kpi" /></p>
              <p v-else class="hp9-cs-val">{{ home.chartStats.open }}</p>
            </li>
            <li>
              <p class="hp9-cs-label">Mínima</p>
              <p v-if="homeLoading" class="hp9-cs-val"><span class="wp8-skel wp8-skel-kpi" /></p>
              <p v-else class="hp9-cs-val neg">{{ home.chartStats.worst }}</p>
            </li>
            <li>
              <p class="hp9-cs-label">Variação</p>
              <p v-if="homeLoading" class="hp9-cs-val"><span class="wp8-skel wp8-skel-kpi" /></p>
              <p v-else :class="['hp9-cs-val', home.chartStats.periodChangePct >= 0 ? 'pos' : 'neg']">{{ home.chartStats.close }}</p>
            </li>
            <li>
              <p class="hp9-cs-label">Hoje vs S&amp;P</p>
              <p v-if="homeLoading" class="hp9-cs-val"><span class="wp8-skel wp8-skel-kpi" /></p>
              <p v-else class="hp9-cs-val">{{ home.chartStats.deltaVsSp }}</p>
            </li>
          </ul>
        </div>
      </article>

      <!-- ============ BLOCO 1: ANÁLISE DO DIA ============ -->
      <section class="h-block">
        <header class="h-block-head">
          <p class="h-block-eyebrow">ANÁLISE DO DIA</p>
          <h2 class="h-block-h">
            Hoje, 3 fatores moveram <em>carteiras brasileiras</em>
          </h2>
        </header>

        <div class="h-block-body">
          <ul class="h-factors-grid">
            <li class="h-factor-card">
              <span class="h-factor-icon h-factor-icon-juros">
                <UIcon name="i-lucide-line-chart" class="size-5" />
              </span>
              <h3 class="h-factor-h">Juros</h3>
              <p class="h-factor-desc">
                Abertura dos juros futuros pressionou bancos, FIIs e títulos de maior duration.
              </p>
              <span class="h-factor-pill h-factor-pill-high">Alto impacto</span>
            </li>
            <li class="h-factor-card">
              <span class="h-factor-icon h-factor-icon-oil">
                <UIcon name="i-lucide-droplet" class="size-5" />
              </span>
              <h3 class="h-factor-h">Petróleo</h3>
              <p class="h-factor-desc">
                Queda do petróleo impactou empresas exportadoras e o setor de energia.
              </p>
              <span class="h-factor-pill h-factor-pill-medium">Médio impacto</span>
            </li>
            <li class="h-factor-card">
              <span class="h-factor-icon h-factor-icon-fx">
                <UIcon name="i-lucide-shield" class="size-5" />
              </span>
              <h3 class="h-factor-h">Dólar</h3>
              <p class="h-factor-desc">
                Moeda americana enfraqueceu e trouxe alívio parcial pra exportadoras.
              </p>
              <span class="h-factor-pill h-factor-pill-pos">Proteção parcial</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- ============ O QUE MAIS PESOU — DNA hp9-section (igual /wallet/hoje) ============ -->
      <section class="hp9-section">
        <header class="hp9-section-h">
          <h2 class="hp9-h2">O que mais <em class="hp9-italic">pesou.</em></h2>
          <p class="hp9-section-deck">
            A maior parte da queda veio de fatores macro, não de problemas das empresas.
            Cada linha aqui é uma força que moveu carteiras brasileiras hoje.
          </p>
        </header>
        <!-- Pílulas reais: derivadas dos top movers + Brent + Dólar (Sprint 2). -->
        <ul v-if="homeLoading" class="hp9-pesou-pills">
          <li v-for="n in 4" :key="`skel-pesou-${n}`" class="hp9-pesou-pill">
            <span class="hp9-pesou-pill-icon bg-petroleo">
              <span class="wp8-skel wp8-skel-circle" style="width: 20px; height: 20px;" />
            </span>
            <p class="hp9-pesou-pill-text">
              <span class="wp8-skel wp8-skel-text-sm" style="width: 90%; display: block; margin-bottom: 6px;" />
              <span class="wp8-skel wp8-skel-text-sm" style="width: 60%; display: block;" />
            </p>
          </li>
        </ul>
        <ul v-else class="hp9-pesou-pills">
          <li v-for="p in home.pesouPills" :key="p.key" class="hp9-pesou-pill">
            <span :class="['hp9-pesou-pill-icon', `bg-${p.key === 'losers' ? 'juros' : p.key === 'gainers' ? 'commodity' : p.key}`]">
              <UIcon :name="p.icon" class="size-5" />
            </span>
            <p class="hp9-pesou-pill-text" v-html="p.html" />
          </li>
        </ul>
      </section>

      <!-- ============ BLOCO 3: NOTÍCIAS REAIS por tema (feed + classificação client-side) ============
           News do /api/news/latest agrupadas via TICKER_THEME (mapping em
           useHomeData.ts). Ordem fixa por relevância editorial; "outros"
           vai pro fim. -->
      <section class="h-block">
        <header class="h-block-head">
          <p class="h-block-eyebrow">NOTICIÁRIO DO DIA</p>
          <h2 class="h-block-h">
            As notícias que <em>movimentaram o dia.</em>
          </h2>
          <p class="h-block-deck">
            Cada manchete é cruzada com os ativos que ela afeta e agrupada
            por tema (petróleo, juros, commodities, consumo, etc).
          </p>
        </header>

        <div class="h-block-body">
          <!-- Skeleton: 2 grupos com 3 cards cada -->
          <div v-if="homeLoading" class="h-news-themes">
            <article v-for="n in 2" :key="`skel-theme-${n}`" class="h-news-theme">
              <header class="h-news-theme-head">
                <span class="wp8-skel wp8-skel-circle" style="width: 24px; height: 24px;" />
                <span class="wp8-skel wp8-skel-text-sm" style="width: 140px;" />
              </header>
              <ul class="h-news-grid">
                <li v-for="m in 3" :key="`skel-news-${n}-${m}`" class="h-news-card">
                  <span class="wp8-skel wp8-skel-img-16x9" />
                  <div class="h-news-card-body">
                    <p class="h-news-card-title"><span class="wp8-skel wp8-skel-text-sm" style="width: 90%;" /></p>
                    <p class="h-news-card-meta"><span class="wp8-skel wp8-skel-chip" /></p>
                  </div>
                </li>
              </ul>
            </article>
          </div>
          <!-- News reais agrupadas por tema -->
          <div v-else-if="home.newsThemes.length" class="h-news-themes">
            <article v-for="theme in home.newsThemes" :key="theme.key" class="h-news-theme">
              <header class="h-news-theme-head">
                <span :class="['h-news-theme-icon', `h-news-theme-icon-${theme.key}`]">
                  <UIcon :name="theme.icon" class="size-4" />
                </span>
                <div>
                  <p class="h-news-theme-eyebrow">Tema</p>
                  <h3 class="h-news-theme-label"><em>{{ theme.label }}</em></h3>
                </div>
                <span class="h-news-theme-count">
                  {{ theme.count }} {{ theme.count === 1 ? 'notícia' : 'notícias' }}
                </span>
              </header>
              <ul class="h-news-grid">
                <li v-for="n in theme.items.slice(0, 3)" :key="n.id" class="h-news-card">
                  <a :href="n.url" target="_blank" rel="noopener" class="h-news-card-link">
                    <div v-if="n.imageUrl" class="h-news-card-img">
                      <img :src="n.imageUrl" :alt="n.title" loading="lazy" />
                    </div>
                    <div v-else class="h-news-card-img h-news-card-img-fallback" aria-hidden="true">
                      <UIcon name="i-lucide-newspaper" class="size-8" />
                    </div>
                    <div class="h-news-card-body">
                      <p v-if="n.tickers.length" class="h-news-card-tickers">
                        {{ n.tickers.slice(0, 3).join(' · ') }}
                      </p>
                      <h4 class="h-news-card-title">{{ n.title }}</h4>
                      <p v-if="n.excerpt" class="h-news-card-excerpt">{{ truncateText(n.excerpt, 140) }}</p>
                      <p class="h-news-card-meta">
                        <span>{{ formatNewsSource(n.source) }}</span>
                        <span class="h-news-card-dot" aria-hidden="true">·</span>
                        <span>{{ formatRelativeTime(n.publishedAt) }}</span>
                      </p>
                    </div>
                  </a>
                </li>
              </ul>
            </article>
          </div>
          <p v-else class="h-news-empty">
            Sem manchetes nas últimas horas. Volte daqui a pouco.
          </p>
        </div>
      </section>

      <!-- ============ BLOCO 4: MERCADO GERAL (IBOV lead + 4 índices + top movers) ============ -->
      <section class="h-block">
        <header class="h-block-head">
          <p class="h-block-eyebrow">MERCADO GERAL</p>
          <h2 class="h-block-h">
            Bolsa em queda, <em>veja os destaques.</em>
          </h2>
          <p class="h-block-deck">
            Ibovespa fechou em <strong class="h-pesou-amt-neg">−1,85%</strong>. Veja quem segurou
            o índice e quem foi a fundo nesta sexta.
          </p>
        </header>

        <div class="h-block-body">
          <!-- Linha 1: IBOV lead + 4 secundários (dados reais via useHomeData) -->
          <div class="h-market-hero">
            <article class="h-market-lead">
              <p class="h-market-lead-label">IBOVESPA</p>
              <p v-if="homeLoading" class="h-market-lead-val"><span class="wp8-skel wp8-skel-kpi" style="width: 180px;" /></p>
              <p v-else class="h-market-lead-val">{{ formatNumberPtBR(home.ibov.value) }}</p>
              <p v-if="homeLoading" class="h-market-lead-pct"><span class="wp8-skel wp8-skel-chip" style="width: 60px;" /></p>
              <p v-else :class="['h-market-lead-pct', home.ibov.changePct >= 0 ? 'h-pesou-amt-pos' : 'h-pesou-amt-neg']">
                <UIcon :name="home.ibov.changePct >= 0 ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'" class="size-4" />
                <span>{{ formatChangePct(home.ibov.changePct) }}</span>
              </p>
            </article>

            <ul class="h-market-secondary">
              <template v-if="homeLoading">
                <li v-for="n in 4" :key="`skel-mkt-${n}`" class="h-market-sec">
                  <p class="h-market-sec-label"><span class="wp8-skel wp8-skel-text-sm" /></p>
                  <div class="h-market-sec-vals">
                    <span class="h-market-sec-val"><span class="wp8-skel wp8-skel-chip" style="width: 80px;" /></span>
                  </div>
                </li>
              </template>
              <template v-else>
                <li v-for="ix in home.marketIndices.filter((i) => i.key !== 'ibov')" :key="ix.key" class="h-market-sec">
                  <p class="h-market-sec-label">{{ ix.label }}</p>
                  <div class="h-market-sec-vals">
                    <span class="h-market-sec-val">{{ formatIndexValue(ix) }}</span>
                    <span :class="['h-market-sec-pct', ix.changePct >= 0 ? 'h-pesou-amt-pos' : 'h-pesou-amt-neg']">
                      <UIcon :name="ix.changePct >= 0 ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'" class="size-3" />
                      <span>{{ formatChangePct(ix.changePct) }}</span>
                    </span>
                  </div>
                </li>
              </template>
            </ul>
          </div>

          <!-- Linha 2: top movers (gainers + losers) reais da B3
               Logo dos tickers vem do icons.brapi.dev/icons/{TICKER}.svg
               via AtomsTickerLogo (fallback pra iniciais se 404). -->
          <div class="h-market-mvr">
            <div class="h-market-mvr-col">
              <h3 class="h-market-mvr-h">Quem segurou <em>o índice.</em></h3>
              <ul>
                <template v-if="homeLoading">
                  <li v-for="n in 5" :key="`skel-up-${n}`">
                    <span class="wp8-skel wp8-skel-circle" style="width: 14px; height: 14px;" />
                    <span class="wp8-skel wp8-skel-circle" style="width: 22px; height: 22px;" />
                    <span class="h-market-mvr-tk"><span class="wp8-skel wp8-skel-text-sm" style="width: 60px;" /></span>
                    <span class="h-market-mvr-pct"><span class="wp8-skel wp8-skel-chip" /></span>
                  </li>
                </template>
                <template v-else>
                  <li v-for="t in home.topGainers" :key="`up-${t.ticker}`">
                    <UIcon name="i-lucide-arrow-up" class="size-3.5 h-pesou-amt-pos" />
                    <AtomsTickerLogo :ticker="t.ticker" :logo="`https://icons.brapi.dev/icons/${t.ticker}.svg`" :size="22" />
                    <span class="h-market-mvr-tk">{{ t.ticker }}</span>
                    <span class="h-market-mvr-pct h-pesou-amt-pos">{{ formatChangePct(t.pct) }}</span>
                  </li>
                </template>
              </ul>
            </div>
            <div class="h-market-mvr-col">
              <h3 class="h-market-mvr-h">Quem puxou <em>pra baixo.</em></h3>
              <ul>
                <template v-if="homeLoading">
                  <li v-for="n in 5" :key="`skel-dn-${n}`">
                    <span class="wp8-skel wp8-skel-circle" style="width: 14px; height: 14px;" />
                    <span class="wp8-skel wp8-skel-circle" style="width: 22px; height: 22px;" />
                    <span class="h-market-mvr-tk"><span class="wp8-skel wp8-skel-text-sm" style="width: 60px;" /></span>
                    <span class="h-market-mvr-pct"><span class="wp8-skel wp8-skel-chip" /></span>
                  </li>
                </template>
                <template v-else>
                  <li v-for="t in home.topLosers" :key="`dn-${t.ticker}`">
                    <UIcon name="i-lucide-arrow-down" class="size-3.5 h-pesou-amt-neg" />
                    <AtomsTickerLogo :ticker="t.ticker" :logo="`https://icons.brapi.dev/icons/${t.ticker}.svg`" :size="22" />
                    <span class="h-market-mvr-tk">{{ t.ticker }}</span>
                    <span class="h-market-mvr-pct h-pesou-amt-neg">{{ formatChangePct(t.pct) }}</span>
                  </li>
                </template>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- ============ RESUMO REDENTIA (card destacado, padronizado com /wallet/hoje) ============ -->
      <section class="resumo-card-wrap">
        <article class="resumo-card">
          <header class="resumo-card-head">
            <div class="resumo-card-brand">
              <img
                src="/brand/redentia/dark-logo-icon.png"
                alt="Redentia"
                class="resumo-card-logo"
              />
              <p class="resumo-card-cta">Resumo do dia · {{ formatTimeNow() }}</p>
            </div>
            <h2 class="resumo-card-h">
              A leitura do dia, <em>na sua linguagem.</em>
            </h2>
          </header>

          <blockquote v-if="homeLoading" class="resumo-card-quote">
            <span class="wp8-skel wp8-skel-text-sm" style="width: 95%; display: block; margin-bottom: 12px;" />
            <span class="wp8-skel wp8-skel-text-sm" style="width: 80%; display: block;" />
          </blockquote>
          <blockquote v-else class="resumo-card-quote">{{ home.resumo }}</blockquote>

          <p class="resumo-card-attribution">
            <span><strong>{{ home.topGainers.length + home.topLosers.length }}</strong> ativos com movimento</span>
            <span class="resumo-card-sep" aria-hidden="true">·</span>
            <span><strong>{{ home.marketIndices.length }}</strong> índices monitorados</span>
          </p>
        </article>
      </section>

    </main>

    <!-- ============ SEÇÕES PORTADAS DE /mercado-completo ============
         Apenas pra deslogado. Vivem entre o resumo e o CTA final. -->
    <MoleculesTestimonialsSection v-if="!authStore.isAuthenticated" class="-mt-[150px]" />

    <!-- ============ QS SHOWCASE — busca inteligente, depois das histórias de sucesso. -->
    <section
      v-if="!authStore.isAuthenticated"
      class="qs-showcase relative overflow-hidden"
      :style="{
        background: `linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--brand-primary) 5%, transparent) 50%, color-mix(in srgb, var(--brand-primary) 3%, transparent) 100%)`,
      }"
    >
      <!-- Radial subtle accent atrás -->
      <div
        class="pointer-events-none absolute inset-0"
        aria-hidden="true"
        :style="{ background: `radial-gradient(ellipse 50% 80% at 70% 50%, color-mix(in srgb, var(--brand-primary) 10%, transparent), transparent 65%)` }"
      />

      <div class="relative mx-auto grid max-w-6xl items-center gap-8 px-6 py-7 md:grid-cols-12 md:gap-12 md:py-9">
        <!-- Left: copy -->
        <div class="md:col-span-5">
          <p class="mb-3 text-[11px] font-medium uppercase tracking-[0.18em]" :style="{ color: 'var(--brand-primary)' }">
            Busca inteligente
          </p>
          <h2 class="text-[28px] font-light leading-tight tracking-[-0.025em] md:text-[34px]" :style="{ color: 'var(--text-heading)' }">
            Encontre qualquer coisa,
            <em class="font-['Instrument_Serif'] italic" :style="{ color: 'var(--brand-primary)' }">em segundos.</em>
          </h2>
          <p class="mt-3 text-[14px] leading-relaxed md:text-[15px]" :style="{ color: 'var(--text-body)' }">
            Um ticker, um fundo, uma dúvida. Pergunte do jeito que você pensa, e a busca entende: ações, FIIs, ETFs, cripto, tesouro, e até conceitos do mercado.
          </p>
          <!-- Atalho ⌘K só em desktop (mobile não tem teclado). -->
          <div class="mt-5 hidden md:inline-flex items-center gap-2 text-[12px]" :style="{ color: 'var(--text-muted)' }">
            <span>Aperte</span>
            <kbd
              class="inline-flex items-center gap-0.5 rounded-md border px-2 py-0.5 font-mono-tab text-[11px]"
              :style="{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-overlay)', color: 'var(--text-body)' }"
            >
              <span>{{ qsShortcutModifier }}</span>
              <span>K</span>
            </kbd>
            <span>de qualquer página</span>
          </div>
        </div>

        <!-- Right: QuickSearch dock em layout BENTO SPLIT.
             Card com 2 zonas: esquerda (⌘K context, 4 col) + direita (dock + chips, 8 col). -->
        <div class="md:col-span-7">
          <div
            class="grid grid-cols-12 gap-3 rounded-2xl border p-4"
            :style="{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }"
          >
            <!-- LEFT bento zone: ⌘K context (4 cols). Escondido no
                 mobile — atalho de teclado não faz sentido em touch. -->
            <div
              class="hidden md:flex flex-col justify-between gap-4 rounded-xl p-6 md:col-span-4"
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)' }"
            >
              <kbd
                class="self-start inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 font-mono-tab text-[14px] font-medium"
                :style="{
                  borderColor: 'color-mix(in srgb, var(--brand-primary) 30%, transparent)',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--brand-primary)',
                }"
              >
                <span>{{ qsShortcutModifier }}</span>
                <span>K</span>
              </kbd>
              <div>
                <p class="text-[12px] font-medium uppercase tracking-[0.14em]" :style="{ color: 'var(--brand-primary)' }">
                  Atalho global
                </p>
                <p class="mt-2 text-[14px] leading-snug" :style="{ color: 'var(--text-body)' }">
                  Aperte de qualquer página pra abrir a busca instantânea.
                </p>
              </div>
            </div>

            <!-- RIGHT bento zone: dock target + chips (8 cols).
                 bg dot grid pattern sutil pra dar textura editorial.
                 No mobile vira col-span-12 sozinho (left bento oculto). -->
            <div
              class="col-span-12 flex flex-col items-center gap-4 rounded-xl p-6 md:col-span-8"
              :style="{
                backgroundColor: 'var(--bg-base)',
                backgroundImage: 'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--text-heading) 10%, transparent) 1px, transparent 0)',
                backgroundSize: '16px 16px',
              }"
            >
              <MoleculesQuickSearchDock placeholder="Pergunte qualquer coisa." />
              <div class="flex flex-wrap items-center justify-center gap-2">
                <NuxtLink
                  v-for="ex in qsExamples"
                  :key="ex.query"
                  :to="`/search?q=${encodeURIComponent(ex.query)}`"
                  class="qs-example-chip"
                >
                  {{ ex.label }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <MoleculesHomeAiCta v-if="!authStore.isAuthenticated" />
    <MoleculesHomeFaqBlock v-if="!authStore.isAuthenticated" />

    <!-- ============ CTA FINAL (full-bleed) ============ -->
    <section class="h-final-cta">
      <div class="h-final-cta-pattern" aria-hidden="true" />
      <div class="h-final-cta-inner">
        <p class="h-final-cta-eyebrow">SEU /HOJE PERSONALIZADO</p>
        <h2 class="h-final-cta-h">
          E hoje, na <em>sua</em> carteira?
        </h2>
        <p class="h-final-cta-sub">
          Tudo isso que você acabou de ver — rodando nos <em>seus</em> ativos,
          com <em>seus</em> pesos e a <em>sua</em> exposição a cada fator. Em 2 minutos.
        </p>

        <div class="h-final-cta-actions">
          <NuxtLink to="/auth/register" class="h-final-cta-primary">
            <UIcon name="i-lucide-link-2" class="size-4" />
            <span>Conectar via Open Finance</span>
            <UIcon name="i-lucide-arrow-right" class="size-4 h-final-cta-arrow" />
          </NuxtLink>
          <NuxtLink to="/raio-x" class="h-final-cta-secondary">
            <UIcon name="i-lucide-message-square" class="size-3.5" />
            <span>Não tenho carteira ainda</span>
          </NuxtLink>
        </div>

        <ul class="h-final-cta-bullets">
          <li><UIcon name="i-lucide-shield-check" class="size-3.5" /> Regulamentado pelo Banco Central</li>
          <li><UIcon name="i-lucide-clock" class="size-3.5" /> 2 minutos pra conectar</li>
          <li><UIcon name="i-lucide-eye-off" class="size-3.5" /> Não vendemos seus dados</li>
          <li><UIcon name="i-lucide-x" class="size-3.5" /> Sem cartão</li>
        </ul>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

// Brand + auth: necessários pro qs-showcase (estilos dependem de
// brand.colors.primary, e o bloco só aparece pra deslogado).
const brand = useBrand()
const authStore = useAuthStore()

// qsShortcutModifier: ⌘ no Mac/iOS, Ctrl no resto. SSR-safe.
const qsShortcutModifier = computed(() => {
  if (typeof navigator === 'undefined') return '⌘'
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'
})

// Chips de exemplo abaixo do dock — variedade de queries que a busca aceita.
const qsExamples = [
  { label: 'PETR4', query: 'PETR4' },
  { label: 'Quem subiu hoje?', query: 'maiores altas' },
  { label: 'Tesouro IPCA+', query: 'tesouro ipca' },
  { label: 'Maiores dividendos', query: 'dividendos' },
  { label: 'Como diversificar?', query: 'diversificar carteira' },
]

// ============ DADOS REAIS DA HOME (padrão idêntico ao useHojeData) ============
// 3 endpoints públicos em paralelo: market/snapshot, indices/ibov/prices,
// news/latest. Inicia com loading=true → skeletons; ao terminar, troca
// por dados reais sem hydration mismatch.
const { data: home, loading: homeLoading } = useHomeData()

// Formata número grande pt-BR (ex: 177.284) sem decimais.
function formatNumberPtBR(v: number) {
  return v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}
function formatChangePct(v: number) {
  const sign = v >= 0 ? '+' : '−'
  return `${sign}${Math.abs(v).toFixed(2).replace('.', ',')}%`
}
function formatChangePts(v: number) {
  const sign = v >= 0 ? '+' : '−'
  return `${sign}${formatNumberPtBR(Math.abs(v))} pts`
}
function formatIndexValue(ix: { key: string; value: number }) {
  if (ix.key === 'dolar') return `R$ ${ix.value.toFixed(2).replace('.', ',')}`
  if (ix.key === 'brent') return `US$ ${ix.value.toFixed(2).replace('.', ',')}`
  return formatNumberPtBR(ix.value)
}

// Geometria da curva. viewBox = 800×240, plot entre y=20 e y=220.
// Expõe os pontos individuais (não só strings) pra o hover indexar e
// posicionar tooltip — mesmo pattern do chart de /wallet/hoje.
const ibovChartGeom = computed(() => {
  const series = home.value.ibov.series
  if (!series.length) return { points: [], polyline: '', polygon: '' }
  const prices = series.map((s) => s.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const stepX = series.length > 1 ? 800 / (series.length - 1) : 0
  const points = series.map((s, i) => {
    const x = i * stepX
    const y = 220 - ((s.price - min) / range) * 200
    return { x, y, price: s.price, date: s.date }
  })
  const polyline = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const polygon = `0,240 ${polyline} 800,240`
  return { points, polyline, polygon }
})

// Cor do chart baseada na variação DO PERÍODO (start→end da série), não
// no pct DE HOJE. Sem isso, dias em que IBOV sobe 0.1% mas a curva
// mensal está caindo 6% pintavam de verde — visualmente uma mentira.
const ibovChartColor = computed(() =>
  home.value.chartStats.periodChangePct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'
)

// Hover tooltip: mesmo pattern de /wallet/hoje (chartSvgRef + hoverIdx
// indexando os pontos da geometria). Posição do tip em % da largura.
const hoverIdx = ref<number | null>(null)
const chartSvgRef = ref<SVGSVGElement | null>(null)

function onChartMouseMove(e: MouseEvent) {
  const svg = chartSvgRef.value
  if (!svg) return
  const n = ibovChartGeom.value.points.length
  if (!n) return
  const rect = svg.getBoundingClientRect()
  const xRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  hoverIdx.value = Math.round(xRatio * (n - 1))
}
function onChartMouseLeave() {
  hoverIdx.value = null
}
const hoverPoint = computed(() => {
  if (hoverIdx.value === null) return null
  const p = ibovChartGeom.value.points[hoverIdx.value]
  if (!p) return null
  // "2026-04-29" → "29 abr" (compacto, sem o "de" do locale pt-BR).
  const MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
  const [, m, d] = p.date.slice(0, 10).split('-').map(Number)
  const label = `${String(d).padStart(2, '0')} ${MONTHS[(m ?? 1) - 1]}`
  return { x: p.x, y: p.y, price: p.price, label }
})

// Banner "mercado fechado": quando a data do último pregão (as_of_date do IBOV)
// é diferente de hoje em BRT (final de semana, feriado, antes da abertura).
// Mesma lógica do useHojeData.marketClosedBanner.
const marketClosedBanner = computed(() => {
  const todayStr = home.value.marketAsOfDate
  if (!todayStr) return null
  const tradingDay = new Date(`${todayStr}T12:00:00-03:00`)
  const now = new Date()
  const sameDay =
    tradingDay.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) ===
    now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  if (sameDay) return null
  const formatted = tradingDay.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
  return `Mercado fechado · dados do último pregão, ${formatted}`
})

// ============ HELPERS PRO NOTICIÁRIO ============
// Truncate sem cortar palavra
function truncateText(text: string, max: number): string {
  if (!text || text.length <= max) return text
  const cut = text.slice(0, max).replace(/\s+\S*$/, '')
  return `${cut}…`
}
// Map de source slug → nome editorial bonito
const NEWS_SOURCE_LABELS: Record<string, string> = {
  seu_dinheiro: 'Seu Dinheiro',
  infomoney: 'InfoMoney',
  valor: 'Valor Econômico',
  brazil_journal: 'Brazil Journal',
  bloomberg: 'Bloomberg',
  reuters: 'Reuters',
  folha: 'Folha',
  estadao: 'Estadão',
  exame: 'Exame',
  money_times: 'Money Times',
}
function formatNewsSource(source: string): string {
  if (!source) return 'Mercado'
  return NEWS_SOURCE_LABELS[source] ?? source.split('_').map((s) => s[0]?.toUpperCase() + s.slice(1)).join(' ')
}
// Horário "HHhMM" pt-BR pro eyebrow do Resumo ("Resumo Redentia · 17h48")
function formatTimeNow(): string {
  if (typeof window === 'undefined') return ''
  const d = new Date()
  return `${d.getHours().toString().padStart(2, '0')}h${d.getMinutes().toString().padStart(2, '0')}`
}
// "há 2h", "há 35min", "ontem" — relativo ao agora
function formatRelativeTime(iso: string): string {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diffMs = Date.now() - then
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min}min`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `há ${hr}h`
  const days = Math.floor(hr / 24)
  if (days === 1) return 'ontem'
  if (days < 7) return `há ${days}d`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}
</script>

<style scoped>
.pos { color: var(--brand-positive); }
.neg { color: var(--brand-negative); }

/* Após hero dark + events bar, página vira light editorial (estética /hoje).
   Sem background próprio: herda do wrapper de layout (xl:px-4 xl:pt-4) que
   é setado via :style="{ backgroundColor: contentBg }" no default.vue — assim
   a home segue a cor da marca igual /wallet/hoje (Redentia=#fff/#000, outros
   tenants seguem brand.colors.background). */
.h-dark-main {
  color: var(--text-body);
  padding: 72px 40px 96px;
}
@media (max-width: 767px) {
  .h-dark-main { padding: 48px 20px 64px; }
}

/* Shell full-bleed: banner ocupa 100% da largura, sem padding lateral */
.h-hero-shell {
  width: 100%;
}

/* ============ HERO DARK SPLIT (full-bleed) ============ */
.h-hero-dark {
  position: relative;
  overflow: hidden;
  background: radial-gradient(120% 80% at 30% 50%, color-mix(in srgb, var(--brand-primary) 8%, var(--bg-elevated)) 0%, var(--bg-elevated) 55%, var(--bg-base) 100%);
  color: var(--text-heading);
  padding: 80px 40px;
}
.h-hero-dark-pattern {
  position: absolute;
  left: -10%; top: 50%; transform: translateY(-50%);
  width: 50%; aspect-ratio: 1;
  background-image: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 30%, transparent) 1px, transparent 1.5px);
  background-size: 12px 12px;
  mask-image: radial-gradient(circle at center, #000 0%, transparent 65%);
  -webkit-mask-image: radial-gradient(circle at center, #000 0%, transparent 65%);
  opacity: 0.6;
  pointer-events: none;
}
.h-hero-dark-inner {
  position: relative;
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 56px;
  align-items: center;
}
@media (min-width: 1024px) {
  .h-hero-dark-inner { grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.1fr); gap: 64px; }
}

.h-hero-dark-left { min-width: 0; }
.h-hero-dark-h {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(40px, 5.4vw, 64px);
  font-weight: 300;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--text-heading);
  margin: 0 0 28px;
}
.h-hero-dark-h em {
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
}
.h-hero-dark-lead {
  font-size: clamp(15px, 1.3vw, 17px);
  line-height: 1.6;
  color: var(--text-body);
  margin: 0 0 32px;
  max-width: 540px;
}
.h-hero-dark-ctas {
  display: flex; flex-wrap: wrap; gap: 14px;
  margin-bottom: 28px;
}
.h-hero-dark-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px;
  background: var(--brand-primary);
  color: #fff;
  border-radius: 10px;
  font-size: 15px; font-weight: 600;
  text-decoration: none;
  transition: transform 150ms, box-shadow 150ms;
}
.h-hero-dark-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px -16px color-mix(in srgb, var(--brand-primary) 60%, transparent);
}
.h-hero-dark-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 22px;
  background: var(--bg-default);
  border: 1px solid var(--border-default);
  color: var(--text-heading);
  border-radius: 10px;
  font-size: 14.5px; font-weight: 500;
  cursor: pointer;
  transition: border-color 150ms, background 150ms;
}
.h-hero-dark-secondary:hover {
  border-color: var(--text-body);
  background: var(--bg-overlay);
}
.h-hero-dark-fine {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}
.h-hero-dark-fine-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--brand-primary);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand-primary) 22%, transparent);
  flex-shrink: 0;
}

/* DEMO CARD (right) */
.h-hero-dark-demo {
  position: relative;
  padding: 28px 28px 22px;
  background: var(--bg-default);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent);
  border-radius: 20px;
  box-shadow: 0 30px 80px -40px color-mix(in srgb, var(--text-heading) 30%, transparent);
}
.h-hero-dark-demo-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;
  margin-bottom: 18px;
}
@media (min-width: 720px) {
  .h-hero-dark-demo-grid { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 28px; }
}

.h-hero-dark-demo-main { min-width: 0; }
.h-hero-dark-demo-eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 12px;
}
.h-hero-dark-demo-eyebrow :deep(svg) { opacity: 0.6; }
.h-hero-dark-demo-mega {
  font-size: clamp(28px, 3.6vw, 42px);
  font-weight: 500;
  color: var(--text-heading);
  letter-spacing: -0.025em;
  margin: 0 0 12px;
  font-variant-numeric: tabular-nums;
  line-height: 1.05;
}
.h-hero-dark-demo-pill {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 6px 14px;
  background: color-mix(in srgb, var(--brand-negative) 12%, transparent);
  border-radius: 8px;
  margin-bottom: 22px;
  font-variant-numeric: tabular-nums;
}
.h-hero-dark-demo-pill-pct {
  font-size: 14px; font-weight: 600;
  color: var(--brand-negative);
}
.h-hero-dark-demo-pill-amount {
  font-size: 13px;
  color: var(--text-body);
}
.h-hero-dark-demo-impact {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--text-heading);
  margin: 0 0 10px;
}
.h-hero-dark-demo-impact strong {
  font-weight: 600;
  color: var(--brand-primary);
}
.h-hero-dark-demo-stat {
  font-size: 12.5px;
  color: var(--text-muted);
  margin: 0;
}

/* Factor cards (right column) */
.h-hero-dark-demo-factors {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column;
  gap: 8px;
}
.h-hero-dark-demo-factor {
  display: grid;
  grid-template-columns: 30px 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 10px 14px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
}
.h-hero-dark-demo-factor-icon {
  width: 30px; height: 30px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.h-hero-dark-demo-factor-icon-juros {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
}
.h-hero-dark-demo-factor-icon-oil {
  background: color-mix(in srgb, #d97706 14%, transparent);
  color: #d97706;
}
.h-hero-dark-demo-factor-icon-fx {
  background: color-mix(in srgb, var(--brand-positive) 14%, transparent);
  color: var(--brand-positive);
}
.h-hero-dark-demo-factor-label {
  font-size: 13.5px;
  color: var(--text-heading);
}
.h-hero-dark-demo-factor-val {
  font-size: 13.5px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.h-hero-dark-demo-factor-val.neg { color: var(--brand-negative); }
.h-hero-dark-demo-factor-val.pos { color: var(--brand-positive); }
.h-hero-dark-demo-factor-chev { color: var(--text-muted); }

/* Ask input no rodapé */
.h-hero-dark-demo-ask {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 12px 14px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  margin-top: 4px;
}
.h-hero-dark-demo-ask-icon { color: var(--brand-primary); }
.h-hero-dark-demo-ask-text {
  font-size: 13.5px;
  color: var(--text-muted);
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.h-hero-dark-demo-ask-send {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--brand-primary);
  color: #fff;
  border: 0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: opacity 150ms;
}
.h-hero-dark-demo-ask-send:hover { opacity: 0.88; }

@media (max-width: 1023px) {
  .h-hero-dark { padding: 56px 24px; margin-bottom: 64px; }
  .h-hero-dark-demo { padding: 22px 18px 18px; }
}
@media (max-width: 600px) {
  .h-hero-dark { padding: 40px 20px; }
}

/* ============ EVENTS BAR (full-bleed, glued ao hero, sem radius) ============ */
.h-events-bar {
  width: 100%;
  /* Mesmo background da .hp7-events-pill em /wallet/hoje:
     4% brand-primary mixed com bg-elevated + borda amber sutil. */
  background: color-mix(in srgb, var(--brand-primary) 4%, var(--bg-elevated));
  border-top: 1px solid color-mix(in srgb, var(--brand-primary) 14%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-primary) 14%, transparent);
  padding: 14px 40px;
}
.h-events-bar-inner {
  max-width: 1240px;
  margin: 0 auto;
  display: flex; align-items: center; gap: 14px;
  flex-wrap: wrap;
}
@media (max-width: 600px) {
  .h-events-bar { padding: 12px 20px; }
}
.h-events-pill-icon {
  width: 24px; height: 24px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, var(--brand-primary) 16%, transparent);
  color: var(--brand-primary);
  flex-shrink: 0;
}
.h-events-pill-text {
  font-size: 13.5px;
  color: var(--text-heading);
  margin: 0;
  font-weight: 400;
  flex: 1;
  min-width: 200px;
}
.h-events-pill-chips {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-wrap: wrap; gap: 8px;
}
.h-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 500;
}
.h-chip-oil {
  background: color-mix(in srgb, #d97706 8%, transparent);
  color: #b45309;
}
.h-chip-juros {
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  color: var(--brand-primary);
}
.h-chip-consumo {
  background: color-mix(in srgb, #8b5cf6 10%, transparent);
  color: #7c3aed;
}
.h-chip-global {
  background: color-mix(in srgb, #2563eb 8%, transparent);
  color: #2563eb;
}
@media (max-width: 600px) {
  .h-events-pill { padding: 12px 14px; }
}

/* ============ INTRADAY CHART CARD ============ */
.h-chart-card {
  padding: 28px 28px 24px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
}
.h-chart-card-head {
  display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 20px;
}
.h-chart-card-eyebrow {
  font-size: 10.5px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.16em;
  color: var(--text-muted);
  margin: 0 0 6px;
}
.h-chart-card-mega {
  font-size: clamp(28px, 3.4vw, 38px);
  font-weight: 400;
  color: var(--text-heading);
  margin: 0;
  letter-spacing: -0.025em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.h-chart-card-unit {
  font-size: 0.55em;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 4px;
  letter-spacing: 0.02em;
}
.h-chart-card-pct {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 16px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  margin: 0;
}
.h-chart-card-sep { color: var(--border-default); font-weight: 400; }
.h-chart-card-pts { font-weight: 500; color: var(--text-body); font-size: 13.5px; }
.h-chart-svgwrap {
  margin-bottom: 18px;
}
.h-chart-svg {
  display: block; width: 100%; height: 240px;
}
.h-chart-marks {
  list-style: none; padding: 0; margin: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
}
.h-chart-mark-time {
  font-size: 10.5px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.14em;
  color: var(--text-muted);
  margin: 0 0 4px;
}
.h-chart-mark-event {
  font-size: 13.5px;
  color: var(--text-heading);
  margin: 0 0 4px;
  font-weight: 500;
}
.h-chart-mark-delta {
  font-size: 12.5px;
  margin: 0;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 600px) {
  .h-chart-marks { grid-template-columns: 1fr; gap: 12px; }
}

/* ============ STALE BANNER — "mercado fechado · dados do último pregão" ============
   Mesma pílula sutil do /wallet/hoje. Aparece só quando as_of_date != hoje. */
/* Wrapper compartilha max-width + margin auto do .hp9-main pra alinhar a
   pílula com o IBOVESPA HOJE abaixo (sem cair pro padding raw da .h-dark-main). */
.hp9-stale-wrap {
  max-width: 1240px;
  margin: 0 auto 32px;
}
.hp9-stale-banner {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 12px; font-weight: 500;
  color: var(--text-muted);
  background: color-mix(in srgb, var(--text-muted) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--text-muted) 12%, transparent);
}

/* ============ IBOVESPA HOJE — DNA hp9-main (clone visual de /wallet/hoje) ============ */
.hp9-main {
  max-width: 1240px;
  margin: 0 auto 32px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}
@media (min-width: 1024px) {
  .hp9-main { grid-template-columns: 1fr 1fr; gap: 48px; }
}

/* LEFT */
.hp9-main-left { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.hp9-unit { font-size: 0.5em; color: var(--text-muted); font-weight: 400; letter-spacing: 0; }
.hp9-delta-pct {
  display: inline-flex; align-items: center; gap: 2px;
  font-weight: 600; font-variant-numeric: tabular-nums;
}

/* SNAPSHOT panel (leads + mini breakdown unidos num único canvas) */
.hp9-snapshot {
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  background: color-mix(in srgb, var(--text-heading) 1.5%, transparent);
  overflow: hidden;
}
.hp9-snapshot-leads {
  display: flex; flex-direction: column;
  padding: 6px; gap: 2px;
}
.hp9-lead {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 10px 12px;
  border-radius: 9px;
}
.hp9-lead-icon {
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.hp9-lead-text {
  font-size: 13px; line-height: 1.5;
  color: var(--text-heading); margin: 0;
}
.hp9-lead-text strong { font-weight: 600; }
.hp9-lead-neg { background: color-mix(in srgb, var(--brand-negative) 6%, transparent); }
.hp9-lead-neg .hp9-lead-icon { color: var(--brand-negative); }
.hp9-lead-pos { background: color-mix(in srgb, var(--brand-positive) 8%, transparent); }
.hp9-lead-pos .hp9-lead-icon { color: var(--brand-positive); }

/* Mini stats grid (3 fatores como minicards horizontais com hairline) */
.hp9-mini-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 0;
  border-top: 1px solid var(--border-subtle);
}
.hp9-mini {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 14px;
  border-right: 1px solid var(--border-subtle);
}
.hp9-mini:last-child { border-right: 0; }
.hp9-mini-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 8px;
  flex-shrink: 0;
}
.hp9-icon-juros    { background: color-mix(in srgb, var(--brand-primary) 12%, transparent); color: var(--brand-primary); }
.hp9-icon-petroleo { background: color-mix(in srgb, #d97706 12%, transparent); color: #d97706; }
.hp9-icon-dolar    { background: color-mix(in srgb, var(--brand-positive) 14%, transparent); color: var(--brand-positive); }
.hp9-icon-neutral  { background: var(--bg-overlay); color: var(--text-muted); }
.hp9-mini-label {
  font-size: 13px; font-weight: 600; color: var(--text-heading);
  margin: 0; line-height: 1.2; letter-spacing: -0.005em;
}
.hp9-mini-sub {
  font-size: 11px; color: var(--text-muted);
  margin: 2px 0 0; font-variant-numeric: tabular-nums; letter-spacing: 0.01em;
}
.hp9-mini-sub.neg { color: var(--brand-negative); font-weight: 500; }
.hp9-mini-sub.pos { color: var(--brand-positive); font-weight: 500; }

/* RIGHT — chart intraday */
.hp9-main-right {
  display: flex; flex-direction: column; gap: 16px;
  min-width: 0;
}
.hp9-chart-head {
  display: flex; justify-content: space-between; align-items: flex-end;
  flex-wrap: wrap; gap: 12px;
}
.hp9-chart-title {
  font-size: 18px; font-weight: 400; color: var(--text-heading);
  margin: 4px 0 0; letter-spacing: -0.015em;
}
.hp9-italic { font-family: Georgia, 'Times New Roman', serif; font-style: italic; color: var(--brand-primary); font-weight: 400; }
.hp9-chart-stat {
  font-size: 22px; font-weight: 500; margin: 0;
  font-variant-numeric: tabular-nums; letter-spacing: -0.02em;
}
.hp9-curve {
  position: relative; flex: 1;
  min-height: 180px;
  /* --bg-default fallback pra --bg-elevated (mesma justificativa da
     /wallet/hoje: o token não existe globalmente, garante tooltip
     opaco em vez de transparente). */
  --bg-default: var(--bg-elevated);
}
@media (min-width: 1024px) { .hp9-curve { min-height: 220px; } }
.hp9-curve svg { width: 100%; height: 100%; display: block; }
.hp9-chart-svg { cursor: crosshair; }
.hp9-chart-hover { pointer-events: none; }
.hp9-chart-tip {
  position: absolute;
  top: 6px;
  transform: translateX(-50%);
  background: var(--bg-default);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 10px 12px;
  box-shadow: 0 6px 18px -6px rgba(0,0,0,0.18);
  pointer-events: none;
  min-width: 140px;
  z-index: 5;
  transition: left 60ms linear;
}
.hp9-chart-tip-date {
  font-size: 11px; color: var(--text-muted); margin: 0 0 4px;
  font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase;
  font-variant-numeric: tabular-nums;
}
.hp9-chart-tip-val {
  font-size: 16px; font-weight: 500; color: var(--text-heading);
  margin: 0; font-variant-numeric: tabular-nums; letter-spacing: -0.01em;
}

.hp9-curve-stats {
  list-style: none; padding: 0; margin: 0;
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
}
@media (min-width: 1024px) { .hp9-curve-stats { grid-template-columns: repeat(4, 1fr); } }
.hp9-cs-label {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--text-muted); font-weight: 500; margin: 0 0 4px;
}
.hp9-cs-val {
  font-size: 14px; font-weight: 500; color: var(--text-heading);
  margin: 0; font-variant-numeric: tabular-nums; letter-spacing: -0.01em;
}

/* ============ HP9 SECTIONS (editorial, sem bordas entre blocos) ============ */
.hp9-section {
  max-width: 1240px;
  margin: 0 auto 56px;
}
@media (min-width: 1024px) { .hp9-section { margin-bottom: 72px; } }
.hp9-section-h { margin-bottom: 32px; }
.hp9-h2 {
  font-size: clamp(28px, 3.5vw, 40px);
  font-weight: 300;
  color: var(--text-heading);
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.hp9-section-deck {
  font-size: 15px;
  color: var(--text-body);
  margin: 16px 0 0;
  max-width: 60ch;
  line-height: 1.55;
}

/* ============ HP9 PESOU (4 pílulas editoriais em 2x2 grid) ============ */
.hp9-pesou-pills {
  list-style: none; padding: 0; margin: 0;
  display: grid; gap: 12px;
  grid-template-columns: 1fr;
}
@media (min-width: 768px) { .hp9-pesou-pills { grid-template-columns: repeat(2, 1fr); gap: 16px; } }
.hp9-pesou-pill {
  display: flex; align-items: center; gap: 16px;
  padding: 18px 22px;
  background: color-mix(in srgb, var(--text-heading) 4%, transparent);
  border-radius: 18px;
  transition: background-color 150ms;
}
.hp9-pesou-pill:hover {
  background: color-mix(in srgb, var(--text-heading) 6%, transparent);
}
.hp9-pesou-pill-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 12px;
  flex-shrink: 0;
}
.hp9-pesou-pill-icon.bg-juros     { background: color-mix(in srgb, var(--brand-primary) 16%, transparent); color: var(--brand-primary); }
.hp9-pesou-pill-icon.bg-petroleo  { background: color-mix(in srgb, #d97706 16%, transparent); color: #d97706; }
.hp9-pesou-pill-icon.bg-dolar     { background: color-mix(in srgb, var(--brand-positive) 16%, transparent); color: var(--brand-positive); }
.hp9-pesou-pill-icon.bg-global    { background: color-mix(in srgb, var(--brand-positive) 16%, transparent); color: var(--brand-positive); }
.hp9-pesou-pill-icon.bg-consumo   { background: color-mix(in srgb, #7c3aed 16%, transparent); color: #7c3aed; }
.hp9-pesou-pill-icon.bg-commodity { background: color-mix(in srgb, #b45309 16%, transparent); color: #b45309; }
.hp9-pesou-pill-text {
  font-size: 15px;
  line-height: 1.45;
  color: var(--text-body);
  margin: 0;
  letter-spacing: -0.005em;
}
.hp9-pesou-pill-text strong { color: var(--text-heading); font-weight: 600; }
.hp9-pesou-pill-text strong.pos { color: var(--brand-positive); }
.hp9-pesou-pill-text strong.neg { color: var(--brand-negative); }

.pos { color: var(--brand-positive); }
.neg { color: var(--brand-negative); }

/* ============ BLOCO BASE (label esquerda + conteúdo direita) — light editorial ============ */
.h-block {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 0 80px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}
@media (min-width: 960px) {
  .h-block {
    grid-template-columns: minmax(260px, 1fr) minmax(0, 2.6fr);
    gap: 56px;
    padding-bottom: 104px;
  }
}
/* (Divisor entre seções removido — sem border-top, só padding pra respiro)
   Inclui também o gap entre IBOVESPA (.hp9-main) e a 1ª .h-block (ANÁLISE DO DIA) */
.h-block + .h-block,
.hp9-main + .h-block { padding-top: 56px; }
@media (min-width: 960px) {
  .h-block + .h-block,
  .hp9-main + .h-block { padding-top: 80px; }
}
.h-block-head { min-width: 0; }
.h-block-eyebrow {
  font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.22em;
  color: var(--brand-primary);
  margin: 0 0 18px;
}
.h-block-h {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(28px, 3.4vw, 42px);
  font-weight: 300;
  color: var(--text-heading);
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.025em;
}
.h-block-h em { font-style: italic; font-weight: 400; color: var(--brand-primary); }
.h-block-deck {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-body);
  margin: 18px 0 0;
  max-width: 360px;
}
.h-block-body { min-width: 0; }

/* ============ BLOCO 1: FATORES (3 CARDS) ============ */
.h-factors-grid {
  list-style: none; padding: 0; margin: 0;
  display: grid; gap: 14px;
  grid-template-columns: 1fr;
}
@media (min-width: 720px) {
  .h-factors-grid { grid-template-columns: repeat(3, 1fr); gap: 18px; }
}
.h-factor-card {
  padding: 28px 28px 26px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  display: flex; flex-direction: column;
  gap: 12px;
  transition: border-color 150ms, transform 150ms;
}
.h-factor-card:hover {
  border-color: var(--border-default);
  transform: translateY(-2px);
}
.h-factor-icon {
  width: 64px; height: 64px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}
.h-factor-icon-juros {
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent);
  color: var(--brand-primary);
}
.h-factor-icon-oil {
  background: color-mix(in srgb, #d97706 10%, transparent);
  border: 1px solid color-mix(in srgb, #d97706 28%, transparent);
  color: #d97706;
}
.h-factor-icon-fx {
  background: color-mix(in srgb, var(--brand-positive) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-positive) 32%, transparent);
  color: var(--brand-positive);
}
.h-factor-h {
  font-size: 19px;
  font-weight: 500;
  color: var(--text-heading);
  margin: 0;
  letter-spacing: -0.012em;
}
.h-factor-desc {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--text-body);
  margin: 0 0 8px;
  flex: 1;
}
.h-factor-pill {
  display: inline-flex; align-items: center;
  padding: 5px 13px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  align-self: flex-start;
}
.h-factor-pill-high {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
}
.h-factor-pill-medium {
  background: color-mix(in srgb, #d97706 12%, transparent);
  color: #b45309;
}
.h-factor-pill-pos {
  background: color-mix(in srgb, var(--brand-positive) 12%, transparent);
  color: var(--brand-positive);
}

/* ============ BLOCO 2: PESOU (4 pills editoriais) ============ */
.h-pesou-amt-neg { color: var(--brand-negative); font-weight: 600; font-variant-numeric: tabular-nums; }
.h-pesou-amt-pos { color: var(--brand-positive); font-weight: 600; font-variant-numeric: tabular-nums; }
.h-pesou-pills {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column;
}
.h-pesou-pill {
  display: grid;
  grid-template-columns: 52px 1fr;
  gap: 22px;
  align-items: center;
  padding: 26px 0;
  border-top: 1px solid var(--border-subtle);
}
.h-pesou-pill:last-child { border-bottom: 1px solid var(--border-subtle); }
.h-pesou-icon {
  width: 52px; height: 52px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.h-pesou-icon-juros {
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  color: var(--brand-primary);
}
.h-pesou-icon-oil {
  background: color-mix(in srgb, #d97706 10%, transparent);
  color: #d97706;
}
.h-pesou-icon-global {
  background: color-mix(in srgb, #2563eb 10%, transparent);
  color: #2563eb;
}
.h-pesou-icon-fx {
  background: color-mix(in srgb, var(--brand-positive) 12%, transparent);
  color: var(--brand-positive);
}
.h-pesou-text {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(15px, 1.5vw, 18px);
  line-height: 1.55;
  color: var(--text-heading);
  margin: 0;
  font-weight: 300;
  letter-spacing: -0.005em;
}
.h-pesou-text strong { font-weight: 500; color: var(--text-heading); }
.h-pesou-text strong.h-pesou-amt-neg,
.h-pesou-text strong.h-pesou-amt-pos { font-weight: 600; }

/* ============ BLOCO 3: NOTICIÁRIO (bento de temas) ============ */
.h-theme {
  display: flex; flex-direction: column;
}
.h-theme + .h-theme {
  margin-top: 48px;
  padding-top: 48px;
  border-top: 1px solid var(--border-subtle);
}
.h-theme-head {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 14px;
  align-items: center;
  padding-bottom: 16px;
  margin-bottom: 20px;
}
.h-theme-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.h-theme-icon-oil {
  background: color-mix(in srgb, #d97706 10%, transparent);
  color: #d97706;
}
.h-theme-icon-juros {
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  color: var(--brand-primary);
}
.h-theme-text { min-width: 0; }
.h-theme-eyebrow {
  font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.18em;
  color: var(--text-muted);
  margin: 0 0 3px;
}
.h-theme-label {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(18px, 2vw, 22px);
  font-weight: 300;
  color: var(--text-heading);
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.015em;
}
.h-theme-label em { font-style: italic; font-weight: 400; }
.h-theme-meta { text-align: right; font-variant-numeric: tabular-nums; flex-shrink: 0; }
.h-theme-amount {
  font-size: clamp(14px, 1.6vw, 17px);
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.015em;
}
.h-theme-count {
  font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--text-muted);
  margin: 3px 0 0;
}

/* Bento (hero + minis) */
.h-bento {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 768px) {
  .h-bento { grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 20px; }
}
.h-bento-hero {
  display: flex; flex-direction: column;
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  overflow: hidden;
  background: var(--bg-base);
  transition: transform 200ms, box-shadow 200ms;
}
.h-bento-hero:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px -16px color-mix(in srgb, var(--text-heading) 18%, transparent);
}
.h-bento-hero-img {
  position: relative;
  width: 100%;
  aspect-ratio: 21 / 9;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.92);
}
.h-bento-img-oil {
  background: linear-gradient(135deg, #d97706 0%, #92400e 100%);
}
.h-bento-img-juros {
  background: linear-gradient(135deg, var(--brand-primary) 0%, #92400e 100%);
}
.h-bento-hero-body { padding: 14px 16px 16px; }
.h-bento-hero-impact {
  display: inline-flex; align-items: baseline; flex-wrap: wrap; gap: 6px;
  font-size: 10px; margin: 0 0 10px;
}
.h-bento-hero-impact > span:first-child { font-size: 14px; font-weight: 600; letter-spacing: -0.01em; }
.h-bento-pct { font-weight: 500; font-size: 11px; }
.h-bento-sep { color: var(--border-default); }
.h-bento-hero-headline {
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.32;
  color: var(--text-heading);
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.h-bento-hero-sum {
  font-size: 12.5px; line-height: 1.5;
  color: var(--text-body);
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.h-bento-hero-footer {
  font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--text-muted); font-weight: 500;
  margin: 0;
  display: inline-flex; flex-wrap: wrap; align-items: baseline; gap: 5px;
}
.h-bento-dot { color: var(--border-default); }
.h-bento-minis {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column;
  gap: 8px;
}
.h-bento-mini {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 12px;
  align-items: stretch;
  padding: 10px;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  background: var(--bg-base);
  transition: border-color 150ms, transform 150ms;
}
.h-bento-mini:hover { border-color: var(--border-default); transform: translateY(-1px); }
.h-bento-mini-img {
  position: relative;
  width: 56px; height: 56px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.92);
  flex-shrink: 0;
}
.h-bento-mini-body { min-width: 0; display: flex; flex-direction: column; gap: 3px; padding: 1px 0; }
.h-bento-mini-impact {
  font-size: 11.5px; font-weight: 600; margin: 0;
  font-variant-numeric: tabular-nums; letter-spacing: -0.005em;
  line-height: 1;
}
.h-bento-mini-headline {
  font-size: 12px; font-weight: 500;
  line-height: 1.32; color: var(--text-heading);
  margin: 0;
  letter-spacing: -0.005em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.h-bento-mini-meta {
  font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--text-muted); font-weight: 500;
  margin: 1px 0 0;
}

/* ============ BLOCO 4: MERCADO GERAL (IBOV lead + 4 secundários + top movers) ============ */
.h-market-hero {
  display: grid; grid-template-columns: 1fr; gap: 32px;
  padding-bottom: 36px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 36px;
}
@media (min-width: 768px) {
  .h-market-hero { grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: 56px; }
}
.h-market-lead { padding-top: 4px; }
.h-market-lead-label {
  font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.18em;
  color: var(--text-muted);
  margin: 0 0 14px;
}
.h-market-lead-val {
  font-size: clamp(48px, 6vw, 68px);
  font-weight: 300;
  color: var(--text-heading);
  margin: 0 0 14px;
  line-height: 1;
  letter-spacing: -0.035em;
  font-variant-numeric: tabular-nums;
}
.h-market-lead-pct {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 16px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  margin: 0;
}
.h-market-secondary {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column;
}
.h-market-sec {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-subtle);
}
.h-market-sec:first-child { padding-top: 0; }
.h-market-sec:last-child { border-bottom: 0; padding-bottom: 0; }
.h-market-sec-label {
  font-size: 14px;
  color: var(--text-body);
  margin: 0;
}
.h-market-sec-vals {
  display: inline-flex; align-items: baseline; gap: 18px;
  font-variant-numeric: tabular-nums;
}
.h-market-sec-val {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-heading);
  letter-spacing: -0.005em;
}
.h-market-sec-pct {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 13px;
  font-weight: 500;
  min-width: 80px;
  justify-content: flex-end;
}

/* Top movers split */
.h-market-mvr {
  display: grid; grid-template-columns: 1fr; gap: 32px;
}
@media (min-width: 768px) {
  .h-market-mvr { grid-template-columns: 1fr 1fr; gap: 56px; }
}
.h-market-mvr-col {}
.h-market-mvr-h {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(20px, 2.2vw, 24px);
  font-weight: 300;
  color: var(--text-heading);
  margin: 0 0 18px;
  line-height: 1.2;
  letter-spacing: -0.015em;
}
.h-market-mvr-h em { font-style: italic; font-weight: 400; color: var(--brand-primary); }
.h-market-mvr-col ul {
  list-style: none; padding: 0; margin: 0;
}
.h-market-mvr-col li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-subtle);
}
/* Ticker fica colado no logo (gap pequeno de 8px), pct vai pro canto direito */
.h-market-mvr-col li > .h-market-mvr-pct { margin-left: auto; }
.h-market-mvr-col li:last-child { border-bottom: 0; }
.h-market-mvr-tk {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-heading);
  letter-spacing: 0.02em;
}
.h-market-mvr-pct {
  font-size: 14px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

/* ============ BLOCO 5: METODOLOGIA (4 STEPS) light ============ */
.h-steps {
  list-style: none; padding: 28px 24px; margin: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  display: grid; gap: 24px;
  grid-template-columns: 1fr;
  align-items: start;
}
@media (min-width: 900px) {
  .h-steps {
    grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
    gap: 16px;
    padding: 32px 28px;
  }
}
.h-step {
  display: flex; flex-direction: column; gap: 12px;
  min-width: 0;
}
.h-step-icon {
  width: 44px; height: 44px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, #8b5cf6 10%, transparent);
  border: 1px solid color-mix(in srgb, #8b5cf6 30%, transparent);
  color: #7c3aed;
  flex-shrink: 0;
}
.h-step-body { min-width: 0; }
.h-step-num {
  font-size: 14px; font-weight: 600;
  color: var(--text-heading);
  margin: 0 0 4px;
}
.h-step-desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-body);
  margin: 0;
}
.h-step-arrow {
  align-self: center;
  color: var(--border-default);
  display: none;
}
@media (min-width: 900px) {
  .h-step-arrow { display: flex; align-items: center; justify-content: center; padding-top: 12px; }
}

/* ============ BLOCO 5: EDITORIAL + ASSESSORIA ============ */
.h-editorial-body {
  display: grid; grid-template-columns: 1fr; gap: 20px;
}
@media (min-width: 960px) {
  .h-editorial-body { grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr); gap: 24px; }
}
.h-news-list {
  list-style: none; padding: 0; margin: 0;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  overflow: hidden;
}
.h-news-row {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 18px;
  align-items: center;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border-subtle);
}
.h-news-row:last-child { border-bottom: 0; }
.h-news-icon {
  width: 44px; height: 44px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.h-news-icon-juros { color: var(--brand-primary); background: color-mix(in srgb, var(--brand-primary) 10%, transparent); }
.h-news-icon-oil { color: #d97706; background: color-mix(in srgb, #d97706 8%, transparent); }
.h-news-icon-fx { color: var(--brand-positive); background: color-mix(in srgb, var(--brand-positive) 10%, transparent); }
.h-news-body { min-width: 0; }
.h-news-h {
  font-size: 14.5px; font-weight: 500;
  color: var(--text-heading);
  margin: 0 0 4px;
  letter-spacing: -0.005em;
}
.h-news-meta {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}
.h-news-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.h-news-dot-neg { background: var(--brand-negative); }
.h-news-dot-pos { background: var(--brand-positive); }
.h-news-cta {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 8px 14px;
  font-size: 12.5px;
  color: var(--text-body);
  text-decoration: none;
  border-radius: 8px;
  transition: background 150ms, color 150ms;
  flex-shrink: 0;
  white-space: nowrap;
}
.h-news-cta:hover {
  background: var(--bg-overlay);
  color: var(--text-heading);
}
@media (max-width: 600px) {
  .h-news-row { grid-template-columns: 44px 1fr; }
  .h-news-cta { grid-column: 1 / -1; align-self: flex-start; padding-left: 0; }
}

/* Card assessoria com borda âmbar */
.h-advisor-card {
  position: relative;
  overflow: hidden;
  padding: 28px 28px 24px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 8%, var(--bg-elevated)) 0%, var(--bg-elevated) 100%);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 36%, transparent);
  border-radius: 16px;
  display: flex; flex-direction: column;
  gap: 12px;
}
.h-advisor-pattern {
  position: absolute;
  right: -30%; bottom: -30%;
  width: 200px; height: 200px;
  background-image: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 35%, transparent) 1px, transparent 1.5px);
  background-size: 10px 10px;
  mask-image: radial-gradient(circle at center, #000 0%, transparent 70%);
  -webkit-mask-image: radial-gradient(circle at center, #000 0%, transparent 70%);
  pointer-events: none;
}
.h-advisor-eyebrow {
  position: relative;
  font-size: 10.5px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.22em;
  color: var(--brand-primary);
  margin: 0 0 4px;
}
.h-advisor-h {
  position: relative;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 22px;
  font-weight: 300;
  color: var(--text-heading);
  margin: 0;
  line-height: 1.15;
  letter-spacing: -0.02em;
}
.h-advisor-h em { font-style: italic; font-weight: 400; color: var(--brand-primary); }
.h-advisor-desc {
  position: relative;
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-body);
  margin: 0 0 8px;
  flex: 1;
}
.h-advisor-cta {
  position: relative;
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 20px;
  background: #7c3aed;
  color: #fff;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 500;
  text-decoration: none;
  align-self: flex-start;
  transition: opacity 150ms, transform 150ms;
}
.h-advisor-cta:hover { opacity: 0.92; transform: translateY(-1px); }

/* ============ RESUMO REDENTIA (pull-quote) ============ */
.h-block-resumo .h-block-eyebrow { color: var(--brand-primary); }

/* ============ RESUMO CARD (padronizado entre /para-voce e /wallet/hoje)
   Panel destacado com bg cream sutil + logo Redentia + título serif.
   Variante /hoje adiciona .resumo-card-actions (search + CTA) ao final. */
.resumo-card-wrap {
  max-width: 1240px;
  margin: 0 auto;
  padding-bottom: 80px;
}
@media (min-width: 960px) { .resumo-card-wrap { padding-bottom: 104px; } }
.resumo-card {
  background: color-mix(in srgb, var(--brand-primary) 4%, var(--bg-elevated));
  border: 1px solid color-mix(in srgb, var(--brand-primary) 16%, transparent);
  border-radius: 20px;
  padding: 32px 28px;
  display: flex; flex-direction: column;
  gap: 20px;
}
@media (min-width: 768px) { .resumo-card { padding: 40px 48px; gap: 24px; } }

.resumo-card-head { display: flex; flex-direction: column; gap: 14px; }
.resumo-card-brand {
  display: inline-flex; align-items: center; gap: 10px;
}
.resumo-card-logo {
  width: 28px; height: 28px;
  display: block;
}
.resumo-card-cta {
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.22em;
  color: var(--brand-primary);
  margin: 0;
  display: inline-flex; align-items: baseline; gap: 6px;
}
.resumo-card-h {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(24px, 2.6vw, 32px);
  font-weight: 300;
  color: var(--text-heading);
  margin: 0;
  line-height: 1.15;
  letter-spacing: -0.02em;
}
.resumo-card-h em {
  font-style: italic; font-weight: 400;
  color: var(--brand-primary);
}
.resumo-card-quote {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(15px, 1.3vw, 17px);
  line-height: 1.65;
  color: var(--text-heading);
  margin: 0;
  padding-left: 14px;
  border-left: 3px solid color-mix(in srgb, var(--brand-primary) 38%, transparent);
}
.resumo-card-attribution {
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px;
  font-size: 12.5px;
  color: var(--text-muted);
  margin: 0;
  font-variant-numeric: tabular-nums;
}
.resumo-card-attribution strong {
  color: var(--text-heading);
  font-weight: 600;
}
.resumo-card-sep { opacity: 0.4; }
.h-resumo-quote {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(18px, 2.2vw, 26px);
  line-height: 1.55;
  color: var(--text-heading);
  font-weight: 300;
  font-style: italic;
  margin: 0 0 28px;
  padding-left: 24px;
  border-left: 3px solid var(--brand-primary);
  max-width: 720px;
}
.h-resumo-attribution {
  display: flex; flex-wrap: wrap; gap: 12px;
  font-size: 13px;
  color: var(--text-body);
  margin: 0;
  padding-left: 24px;
}
.h-resumo-attribution strong {
  color: var(--text-heading);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.h-resumo-sep { color: var(--border-default); }
.h-resumo-tag {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--brand-primary);
  padding: 3px 10px;
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  border-radius: 999px;
}

/* ============ CTA FINAL (full-bleed) ============ */
.h-final-cta {
  position: relative;
  overflow: hidden;
  padding: 96px 40px 112px;
  background: radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--brand-primary) 12%, var(--bg-elevated)) 0%, var(--bg-base) 70%);
  border-top: 1px solid var(--border-subtle);
}
.h-final-cta-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 22%, transparent) 1px, transparent 1.5px);
  background-size: 16px 16px;
  mask-image: radial-gradient(ellipse at top, #000 0%, transparent 60%);
  -webkit-mask-image: radial-gradient(ellipse at top, #000 0%, transparent 60%);
  opacity: 0.5;
  pointer-events: none;
}
.h-final-cta-inner {
  position: relative;
  max-width: 680px;
  margin: 0 auto;
  text-align: center;
}
.h-final-cta-eyebrow {
  font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.22em;
  color: var(--brand-primary);
  margin: 0 0 22px;
}
.h-final-cta-h {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(40px, 5.6vw, 60px);
  font-weight: 300;
  color: var(--text-heading);
  margin: 0 0 20px;
  line-height: 1.05;
  letter-spacing: -0.03em;
}
.h-final-cta-h em { font-style: italic; font-weight: 400; color: var(--brand-primary); }
.h-final-cta-sub {
  font-size: clamp(15px, 1.5vw, 17px);
  line-height: 1.6;
  color: var(--text-body);
  margin: 0 0 36px;
  max-width: 540px;
  margin-left: auto; margin-right: auto;
}
.h-final-cta-sub em { font-style: italic; color: var(--text-heading); font-weight: 500; }

.h-final-cta-actions {
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  margin-bottom: 36px;
}
.h-final-cta-primary {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 16px 32px;
  background: var(--brand-primary);
  color: #fff;
  border-radius: 999px;
  font-size: 15px; font-weight: 600;
  text-decoration: none;
  transition: transform 150ms, box-shadow 150ms;
  box-shadow: 0 8px 24px -10px color-mix(in srgb, var(--brand-primary) 50%, transparent);
}
.h-final-cta-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px -14px color-mix(in srgb, var(--brand-primary) 60%, transparent);
}
.h-final-cta-arrow { transition: transform 200ms; }
.h-final-cta-primary:hover .h-final-cta-arrow { transform: translateX(3px); }
.h-final-cta-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 18px;
  color: var(--text-body);
  font-size: 13.5px;
  text-decoration: none;
  border-radius: 999px;
}
.h-final-cta-secondary:hover { color: var(--text-heading); }

.h-final-cta-bullets {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-wrap: wrap; justify-content: center; gap: 22px;
  font-size: 12.5px;
  color: var(--text-muted);
}
.h-final-cta-bullets li {
  display: inline-flex; align-items: center; gap: 6px;
}
.h-final-cta-bullets li :deep(svg) { color: var(--brand-positive); }

@media (max-width: 767px) {
  .h-final-cta { padding: 64px 20px 80px; }
}

/* ============ QS SHOWCASE (chips de exemplo abaixo do dock) ============
   Portado de /mercado-completo. Pill discreto, hover anima borda+cor pra brand-primary. */
.qs-example-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background-color: var(--bg-elevated);
  color: var(--text-body);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.005em;
  white-space: nowrap;
  text-decoration: none;
  transition: border-color 200ms ease, color 200ms ease,
              background-color 200ms ease, transform 200ms ease;
}
.qs-example-chip:hover {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
  background-color: color-mix(in srgb, var(--brand-primary) 6%, var(--bg-elevated));
  transform: translateY(-1px);
}

/* ============ NOTICIÁRIO DO DIA — temas (header + grid de 3 cards) ============ */
.h-news-themes {
  display: flex; flex-direction: column;
  gap: 56px;
}
.h-news-theme {
  display: flex; flex-direction: column;
  gap: 18px;
}
.h-news-theme-head {
  display: flex; align-items: center; gap: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-subtle);
}
.h-news-theme-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
}
.h-news-theme-icon-petroleo  { background: color-mix(in srgb, #d97706 14%, transparent); color: #d97706; }
.h-news-theme-icon-juros     { background: color-mix(in srgb, var(--brand-primary) 14%, transparent); color: var(--brand-primary); }
.h-news-theme-icon-commodity { background: color-mix(in srgb, #b45309 14%, transparent); color: #b45309; }
.h-news-theme-icon-consumo   { background: color-mix(in srgb, #7c3aed 14%, transparent); color: #7c3aed; }
.h-news-theme-icon-global    { background: color-mix(in srgb, #2563eb 14%, transparent); color: #2563eb; }
.h-news-theme-icon-outros    { background: var(--bg-overlay); color: var(--text-muted); }
.h-news-theme-eyebrow {
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--text-muted);
  margin: 0 0 2px;
}
.h-news-theme-label {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 20px; font-weight: 400;
  color: var(--text-heading);
  margin: 0;
  letter-spacing: -0.01em;
}
.h-news-theme-label em { font-style: italic; color: var(--brand-primary); font-weight: 400; }
.h-news-theme-count {
  margin-left: auto;
  font-size: 12px; color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

/* ============ NOTICIÁRIO DO DIA (grid de news reais) ============ */
.h-news-grid {
  list-style: none; padding: 0; margin: 0;
  display: grid; gap: 24px;
  grid-template-columns: 1fr;
}
@media (min-width: 768px) { .h-news-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .h-news-grid { grid-template-columns: repeat(3, 1fr); } }
.h-news-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 200ms, transform 200ms, box-shadow 200ms;
}
.h-news-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 36%, transparent);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px -16px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}
.h-news-card-link {
  display: flex; flex-direction: column;
  text-decoration: none; color: inherit;
  height: 100%;
}
.h-news-card-img {
  aspect-ratio: 16 / 9;
  background: var(--bg-overlay);
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.h-news-card-img img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
}
.h-news-card-img-fallback {
  color: color-mix(in srgb, var(--brand-primary) 60%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 6%, var(--bg-elevated));
}
.h-news-card-body {
  padding: 16px 18px;
  display: flex; flex-direction: column; gap: 8px;
  flex: 1;
}
.h-news-card-tickers {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--brand-primary);
  margin: 0;
}
.h-news-card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0;
  line-height: 1.35;
  letter-spacing: -0.01em;
}
.h-news-card-excerpt {
  font-size: 13px;
  color: var(--text-body);
  margin: 0;
  line-height: 1.5;
}
.h-news-card-meta {
  display: flex; align-items: center; gap: 8px;
  font-size: 11.5px;
  color: var(--text-muted);
  margin: auto 0 0;
  font-variant-numeric: tabular-nums;
}
.h-news-card-dot { opacity: 0.5; }
.h-news-empty {
  font-size: 14px;
  color: var(--text-muted);
  text-align: center;
  padding: 32px 0;
  margin: 0;
}

/* ============ SKELETONS (mesmo shape do /wallet/hoje) ============ */
.wp8-skel {
  display: inline-block;
  background: linear-gradient(
    90deg,
    var(--bg-overlay) 0%,
    color-mix(in srgb, var(--bg-overlay) 50%, transparent) 50%,
    var(--bg-overlay) 100%
  );
  background-size: 200% 100%;
  animation: wp8-skel-shimmer 1.4s ease-in-out infinite;
  border-radius: 4px;
  vertical-align: middle;
}
@keyframes wp8-skel-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.wp8-skel-text-mega { display: block; height: 64px; width: 70%; }
.wp8-skel-text-sm   { display: inline-block; height: 12px; width: 40%; min-width: 80px; }
.wp8-skel-kpi       { display: inline-block; height: 28px; width: 80%; min-width: 60px; }
.wp8-skel-chip      { display: inline-block; height: 10px; width: 40px; }
.wp8-skel-curve     { display: block; width: 100%; height: 100%; min-height: 240px; border-radius: 6px; }
.wp8-skel-circle    { border-radius: 50%; }
.wp8-skel-img-16x9  { display: block; aspect-ratio: 16 / 9; width: 100%; border-radius: 0; }
</style>

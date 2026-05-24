<!--
  /wallet/hoje — snapshot do dia da carteira do usuário. Resumo
  editorial: o que mexeu na carteira hoje, ativos, notícias, mercado
  geral e histórico recente de impacto. Conteúdo herdado do mock
  useHojeMockData (backend ainda não tem endpoint dedicado).
-->
<template>
  <NuxtLayout name="default" title="Hoje">
    <!-- EMPTY STATE: sem positions. Só aparece depois do load (loading=false). -->
    <MoleculesEmptyConnectPrompt
      v-if="!loading && data.empty"
      eyebrow="/ Hoje"
      title="Conecte sua corretora pra ver o que"
      title-em="mexeu hoje."
      lead="A tela /hoje cruza suas posições com fatores macro (juros, petróleo, dólar) e notícias do dia. Sem posições, não conseguimos calcular impacto. Open Finance puxa tudo em minutos."
    />

    <div v-else class="hp7-shell">
      <!-- ============ 0. BANNER: dados de D-1 (mercado fechado / feriado) ============ -->
      <div v-if="marketClosedBanner" class="hp9-stale-banner">
        <UIcon name="i-lucide-clock" class="size-3.5" />
        <span>{{ marketClosedBanner }}</span>
      </div>

      <!-- ============ 1. EVENTS PILL — derivado de positions × factor_tags ============ -->
      <div v-if="loading" class="hp7-events-pill">
        <span class="hp7-events-icon">
          <UIcon name="i-lucide-sparkles" class="size-3.5" />
        </span>
        <p class="hp7-events-text"><span class="wp8-skel wp8-skel-text-sm" style="width: 220px;" /></p>
        <ul class="hp7-events-chips">
          <li v-for="n in 3" :key="`skel-chip-${n}`" class="hp7-chip hp7-chip-skel">
            <span class="wp8-skel wp8-skel-chip" />
          </li>
        </ul>
      </div>
      <div v-else-if="data.causalFactors.length" class="hp7-events-pill">
        <span class="hp7-events-icon">
          <UIcon name="i-lucide-sparkles" class="size-3.5" />
        </span>
        <p class="hp7-events-text">{{ data.causalFactors.length }} {{ data.causalFactors.length === 1 ? 'fator impactou' : 'fatores impactaram' }} sua carteira hoje</p>
        <ul class="hp7-events-chips">
          <li v-for="c in data.causalFactors.slice(0, 3)" :key="c.key" :class="['hp7-chip', `hp7-chip-${c.key}`]">
            <UIcon :name="c.icon" class="size-3" />
            {{ c.label }}
          </li>
        </ul>
      </div>

      <!-- ============ 2. WELCOME ============ -->
      <section class="hp7-welcome">
        <p class="hp7-welcome-eyebrow">BEM-VINDO DE VOLTA</p>
        <h1 class="hp7-welcome-h">
          <template v-if="loading">Olá, <span class="wp8-skel wp8-skel-text-md" style="width: 140px; vertical-align: baseline;" /></template>
          <template v-else>Olá, <em>{{ data.user.firstName }}.</em></template>
        </h1>
        <p class="hp7-welcome-sub">Veja o que realmente mexeu na sua carteira hoje.</p>
      </section>

      <!-- ============ 3. SUA CARTEIRA HOJE — DNA v8 + chart à direita ============ -->
      <article class="hp9-main">
        <!-- LEFT: dados (eyebrow + mega + callout + mini + CTAs) -->
        <div class="hp9-main-left">
          <p class="calc-result-eyebrow">Sua carteira hoje</p>

          <p v-if="loading" class="calc-result-mega"><span class="wp8-skel wp8-skel-text-mega" /></p>
          <p v-else class="calc-result-mega">{{ formatBRL(data.portfolio.totalValue) }}</p>

          <p class="calc-result-caption">
            <template v-if="loading"><span class="wp8-skel wp8-skel-text-sm" /></template>
            <template v-else>
              <span :class="['hp9-delta-pct', data.portfolio.dayChangePct >= 0 ? 'pos' : 'neg']">
                <UIcon :name="data.portfolio.dayChangePct >= 0 ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'" class="size-3" />
                {{ formatPct(data.portfolio.dayChangePct) }}
              </span>
              · Hoje, <span :class="data.portfolio.dayChangeAmount >= 0 ? 'pos' : 'neg'">{{ formatBRL(data.portfolio.dayChangeAmount) }}</span>
            </template>
          </p>

          <div class="hp9-snapshot">
            <!-- LEADS: callouts como banner rows compartilhando o canvas -->
            <div class="hp9-snapshot-leads">
              <!-- skeleton: 1 lead card placeholder -->
              <div v-if="loading" class="hp9-lead hp9-lead-skel">
                <span class="hp9-lead-icon"><span class="wp8-skel wp8-skel-circle" style="width: 18px; height: 18px;" /></span>
                <p class="hp9-lead-text"><span class="wp8-skel wp8-skel-text-sm" style="width: 260px;" /></p>
              </div>
              <!-- Principal impacto: derivado de causalFactors[0]. Negativo = "pressionou",
                   positivo = "ajudou". Frase composta a partir do top fator + top tickers. -->
              <div v-else-if="topFactor" :class="['hp9-lead', topFactor.impact >= 0 ? 'hp9-lead-pos' : 'hp9-lead-neg']">
                <span class="hp9-lead-icon">
                  <UIcon :name="topFactor.impact >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" class="size-4" />
                </span>
                <p class="hp9-lead-text" v-html="topFactorText" />
              </div>

              <div v-if="!loading && data.dividendsToday.total > 0" class="hp9-lead hp9-lead-pos">
                <span class="hp9-lead-icon">
                  <UIcon name="i-lucide-coins" class="size-4" />
                </span>
                <p class="hp9-lead-text">
                  <strong>Recebeu hoje:</strong> +{{ formatBRL(data.dividendsToday.total) }} de
                  <span class="hp9-lead-tickers">
                    <template v-for="(item, idx) in data.dividendsToday.items" :key="item.ticker"><span class="hp9-lead-ticker">{{ item.ticker }}</span><span v-if="idx < data.dividendsToday.items.length - 1">, </span></template></span>.
                </p>
              </div>
            </div>

            <!-- BREAKDOWN: top 3 fatores reais. Skeleton = 3 minis vazias -->
            <div v-if="loading" class="hp9-mini-grid">
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
            <div v-else-if="data.causalFactors.length" class="hp9-mini-grid">
              <div v-for="(c, idx) in data.causalFactors.slice(0, 3)" :key="c.key" class="hp9-mini">
                <span :class="['hp9-mini-icon', idx === 0 ? `hp9-icon-${c.key}` : 'hp9-icon-neutral']">
                  <UIcon :name="c.icon" class="size-4" />
                </span>
                <div class="hp9-mini-body">
                  <p class="hp9-mini-label">{{ c.label }}</p>
                  <p :class="['hp9-mini-sub', c.impact >= 0 ? 'pos' : 'neg']">
                    {{ c.impact >= 0 ? '+' : '' }}{{ formatBRL(c.impact, { compact: true }) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT: chart intraday -->
        <div class="hp9-main-right">
          <header class="hp9-chart-head">
            <div>
              <p class="calc-result-eyebrow">O dia em um traço</p>
              <h3 class="hp9-chart-title">Curva <em class="hp9-italic">intraday.</em></h3>
            </div>
            <p v-if="loading" class="hp9-chart-stat"><span class="wp8-skel wp8-skel-chip" style="width: 60px;" /></p>
            <p v-else :class="['hp9-chart-stat', data.portfolio.dayChangePct >= 0 ? 'pos' : 'neg']">
              {{ formatPct(data.portfolio.dayChangePct) }}
            </p>
          </header>

          <div v-if="loading" class="hp9-curve">
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
                <linearGradient id="hp9-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="var(--brand-negative)" stop-opacity="0.22" />
                  <stop offset="100%" stop-color="var(--brand-negative)" stop-opacity="0" />
                </linearGradient>
              </defs>
              <line v-for="y in [60, 120, 180]" :key="y" x1="0" :y1="y" x2="800" :y2="y" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="2 4" />
              <line :y1="zeroY" :y2="zeroY" x1="0" x2="800" stroke="var(--border-default)" stroke-dasharray="4 4" />
              <polygon :points="`0,${zeroY} ${curve} 800,${zeroY}`" fill="url(#hp9-grad)" />
              <polyline :points="curve" fill="none" stroke="var(--brand-negative)" stroke-width="2" />

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
              <p class="hp9-chart-tip-val">{{ formatPct(hoverPoint.value) }}</p>
            </div>
          </div>

          <ul class="hp9-curve-stats">
            <li>
              <p class="hp9-cs-label">Abertura</p>
              <p v-if="loading" class="hp9-cs-val"><span class="wp8-skel wp8-skel-kpi" /></p>
              <p v-else class="hp9-cs-val">10:00</p>
            </li>
            <li>
              <p class="hp9-cs-label">Pior momento</p>
              <p v-if="loading" class="hp9-cs-val"><span class="wp8-skel wp8-skel-kpi" /></p>
              <p v-else class="hp9-cs-val neg">-2,3%</p>
            </li>
            <li>
              <p class="hp9-cs-label">Fechamento</p>
              <p v-if="loading" class="hp9-cs-val"><span class="wp8-skel wp8-skel-kpi" /></p>
              <p v-else :class="['hp9-cs-val', data.portfolio.dayChangePct >= 0 ? 'pos' : 'neg']">{{ formatPct(data.portfolio.dayChangePct) }}</p>
            </li>
            <li>
              <p class="hp9-cs-label">Δ vs IBOV</p>
              <p v-if="loading" class="hp9-cs-val"><span class="wp8-skel wp8-skel-kpi" /></p>
              <p v-else :class="['hp9-cs-val', deltaVsIbov >= 0 ? 'pos' : 'neg']">{{ deltaVsIbov >= 0 ? '+' : '' }}{{ deltaVsIbov.toFixed(2).replace('.', ',') }} p.p.</p>
            </li>
          </ul>
        </div>
      </article>

      <!-- ============ 4. O QUE MAIS PESOU — editorial ============ -->
      <section class="hp9-section">
        <header class="hp9-section-h">
          <h2 class="hp9-h2">O que mais <em class="hp9-italic">pesou.</em></h2>
          <p class="hp9-section-deck">
            A maior parte da queda veio de fatores macro, não de problemas das empresas.
            Cada linha aqui é uma força que moveu a carteira.
          </p>
        </header>
        <ul v-if="loading" class="hp9-pesou-pills">
          <li v-for="n in 4" :key="`skel-pesou-${n}`" class="hp9-pesou-pill hp9-pesou-pill-skel">
            <span class="hp9-pesou-pill-icon">
              <span class="wp8-skel wp8-skel-circle" style="width: 20px; height: 20px;" />
            </span>
            <p class="hp9-pesou-pill-text">
              <span class="wp8-skel wp8-skel-text-sm" style="width: 90%; display: block; margin-bottom: 6px;" />
              <span class="wp8-skel wp8-skel-text-sm" style="width: 60%; display: block;" />
            </p>
          </li>
        </ul>
        <ul v-else class="hp9-pesou-pills">
          <li v-for="c in data.causalFactors.slice(0, 4)" :key="c.key" :class="['hp9-pesou-pill', `sev-${c.severity}`]">
            <span :class="['hp9-pesou-pill-icon', `bg-${c.key}`]">
              <UIcon :name="c.icon" class="size-5" />
            </span>
            <p class="hp9-pesou-pill-text" v-html="pillText(c)" />
          </li>
        </ul>
      </section>

      <!-- ============ 5. NOTÍCIAS — DNA h-block igual /para-voce (header esquerda + cards direita) ============ -->
      <section class="h-block">
        <header class="h-block-head">
          <p class="h-block-eyebrow">NOTICIÁRIO DO DIA</p>
          <h2 class="h-block-h">As notícias que <em>movimentaram o dia.</em></h2>
          <p v-if="loading" class="h-block-deck"><span class="wp8-skel wp8-skel-text-sm" style="width: 80%;" /></p>
          <p v-else-if="data.newsThemes.length" class="h-block-deck" v-html="newsLeadText" />
          <p v-else class="h-block-deck">
            Nenhuma notícia das últimas 24h afetou seus ativos. Vamos atualizar quando algo relevante aparecer.
          </p>
        </header>

        <div class="h-block-body">
          <!-- Loading: 2 grupos com 3 cards skeleton cada -->
          <div v-if="loading" class="h-news-themes">
            <article v-for="n in 2" :key="`skel-theme-${n}`" class="h-news-theme">
              <header class="h-news-theme-head">
                <span class="wp8-skel wp8-skel-circle" style="width: 36px; height: 36px;" />
                <div>
                  <p class="h-news-theme-eyebrow">Tema</p>
                  <h3 class="h-news-theme-label"><span class="wp8-skel wp8-skel-text-md" style="width: 160px;" /></h3>
                </div>
                <span class="h-news-theme-count"><span class="wp8-skel wp8-skel-chip" style="width: 60px;" /></span>
              </header>
              <ul class="h-news-grid">
                <li v-for="m in 3" :key="`skel-card-${n}-${m}`" class="h-news-card">
                  <span class="wp8-skel wp8-skel-img-16x9" />
                  <div class="h-news-card-body">
                    <p class="h-news-card-impact"><span class="wp8-skel wp8-skel-chip" style="width: 70px;" /></p>
                    <h4 class="h-news-card-title"><span class="wp8-skel wp8-skel-text-sm" style="width: 90%; display: block;" /></h4>
                    <p class="h-news-card-meta"><span class="wp8-skel wp8-skel-chip" /></p>
                  </div>
                </li>
              </ul>
            </article>
          </div>

          <!-- Rendered: themes com 3 cards uniformes (img top + body bottom + impacto financeiro) -->
          <div v-else-if="data.newsThemes.length" class="h-news-themes">
            <article v-for="theme in data.newsThemes" :key="theme.key" class="h-news-theme">
              <header class="h-news-theme-head">
                <span
                  :class="['h-news-theme-icon', `h-news-theme-icon-${theme.key}`]"
                  :style="theme.color ? { background: `color-mix(in srgb, ${theme.color} 14%, transparent)`, color: theme.color } : undefined"
                >
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
                  <component
                    :is="n.url ? 'a' : 'div'"
                    :href="n.url || undefined"
                    :target="n.url ? '_blank' : undefined"
                    :rel="n.url ? 'noopener' : undefined"
                    class="h-news-card-link"
                  >
                    <div :class="['h-news-card-img', `hp9-img-${n.image}`]" aria-hidden="true">
                      <NuxtImg
                        v-if="cleanImageUrl(n.image_url)"
                        :src="cleanImageUrl(n.image_url)"
                        :alt="n.headline"
                        loading="lazy"
                        class="hp9-news-img-real"
                        @error="(e) => { (e.target as HTMLElement).style.display = 'none' }"
                      />
                      <UIcon v-else :name="imageIcon(n.image)" class="size-8" />
                    </div>
                    <div class="h-news-card-body">
                      <p :class="['h-news-card-impact', n.impact >= 0 ? 'pos' : 'neg']">
                        {{ n.impact >= 0 ? '+' : '' }}{{ formatBRL(n.impact) }}
                      </p>
                      <p v-if="n.affectedAssets?.length" class="h-news-card-tickers">
                        {{ n.affectedAssets.slice(0, 3).join(' · ') }}
                      </p>
                      <h4 class="h-news-card-title">{{ n.headline }}</h4>
                      <p v-if="n.summary" class="h-news-card-excerpt">{{ truncateText(n.summary, 140) }}</p>
                      <p class="h-news-card-meta">
                        <span>{{ n.source }}</span>
                        <span class="h-news-card-dot" aria-hidden="true">·</span>
                        <span>{{ n.time }}</span>
                      </p>
                    </div>
                  </component>
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <!-- ============ 5b. RESUMO REDENTIA (card destacado, padronizado com /para-voce) ============ -->
      <section class="resumo-card-wrap">
        <article class="resumo-card">
          <header class="resumo-card-head">
            <div class="resumo-card-brand">
              <img
                src="/brand/redentia/dark-logo-icon.png"
                alt="Redentia"
                class="resumo-card-logo"
              />
              <p class="resumo-card-cta">
                <template v-if="loading">Resumo do dia · <span class="wp8-skel wp8-skel-chip" style="width: 50px;" /></template>
                <template v-else>Resumo do dia · {{ data.time }}</template>
              </p>
            </div>
            <h2 class="resumo-card-h">
              A leitura do dia, <em>na sua linguagem.</em>
            </h2>
          </header>

          <blockquote v-if="loading" class="resumo-card-quote">
            <span class="wp8-skel wp8-skel-text-sm" style="width: 100%; display: block; margin-bottom: 8px;" />
            <span class="wp8-skel wp8-skel-text-sm" style="width: 88%; display: block; margin-bottom: 8px;" />
            <span class="wp8-skel wp8-skel-text-sm" style="width: 60%; display: block;" />
          </blockquote>
          <blockquote v-else class="resumo-card-quote">{{ data.resumoAI }}</blockquote>

          <p v-if="loading" class="resumo-card-attribution">
            <span class="wp8-skel wp8-skel-chip" style="width: 110px;" />
            <span class="resumo-card-sep" aria-hidden="true">·</span>
            <span class="wp8-skel wp8-skel-chip" style="width: 110px;" />
            <span class="resumo-card-sep" aria-hidden="true">·</span>
            <span class="wp8-skel wp8-skel-chip" style="width: 130px;" />
          </p>
          <p v-else class="resumo-card-attribution">
            <span><strong>{{ data.resumoStats.macroPct }}%</strong> causa setorial</span>
            <span class="resumo-card-sep" aria-hidden="true">·</span>
            <span><strong>{{ data.resumoStats.specificPct }}%</strong> causa específica</span>
            <span class="resumo-card-sep" aria-hidden="true">·</span>
            <span><strong>{{ data.topMovers.length }}</strong> ativos com movimento</span>
          </p>

          <!-- /hoje exclusivo: search + CTA "continuar essa conversa" -->
          <div class="resumo-card-actions">
            <MoleculesQuickSearchDock placeholder="Pergunte algo sobre o dia." />
            <NuxtLink to="/help?q=por%20que%20minha%20carteira%20caiu%20hoje" class="resumo-card-cta-btn">
              <span>Continuar essa conversa</span>
              <UIcon name="i-lucide-arrow-right" class="size-4" />
            </NuxtLink>
          </div>
        </article>
      </section>

      <!-- ============ 6. SEUS ATIVOS — agrupados por impacto, colapsáveis ============ -->
      <section class="hp9-section">
        <header class="hp9-section-h">
          <h2 class="hp9-h2">Seus <em class="hp9-italic">ativos.</em></h2>
          <p class="hp9-section-deck">
            Agrupados pelo impacto do dia. Click no header pra expandir cada grupo.
          </p>
        </header>

        <div v-if="loading" class="wp8-pos-groups">
          <article v-for="n in 3" :key="`skel-grp-${n}`" class="wp8-pos-group">
            <div class="wp8-pos-head">
              <span class="wp8-pos-head-left">
                <UIcon name="i-lucide-chevron-right" class="wp8-pos-chev" />
                <span class="wp8-skel wp8-skel-text-sm" style="width: 90px;" />
                <span class="wp8-skel wp8-skel-chip" style="width: 50px;" />
              </span>
              <span class="wp8-pos-head-right">
                <span class="wp8-skel wp8-skel-kpi" style="width: 100px;" />
                <span class="wp8-skel wp8-skel-kpi" style="width: 70px;" />
                <span class="wp8-skel wp8-skel-kpi" style="width: 60px;" />
              </span>
            </div>
          </article>
        </div>
        <div v-else class="wp8-pos-groups">
          <article v-for="group in data.assetGroups" :key="group.key" class="wp8-pos-group">
            <button type="button" class="wp8-pos-head" @click="toggleAssetGroup(group.key)">
              <span class="wp8-pos-head-left">
                <UIcon name="i-lucide-chevron-right" :class="['wp8-pos-chev', { 'is-open': expandedAssetGroups.has(group.key) }]" />
                <span class="wp8-pos-type">{{ group.label }}</span>
                <span class="wp8-pos-count">{{ group.count }} {{ group.count === 1 ? 'ativo' : 'ativos' }}</span>
              </span>
              <span class="wp8-pos-head-right">
                <span class="wp8-pos-weight">
                  <span class="wp8-pos-weight-bar"><span :style="{ width: `${group.totalWeight}%`, background: group.color }" /></span>
                  <span class="wp8-pos-weight-num">{{ group.totalWeight.toFixed(1) }}%</span>
                </span>
                <span class="wp8-pos-value">{{ formatBRL(group.totalValue, { compact: true }) }}</span>
                <span :class="['wp8-pos-pnl', group.totalDayChange >= 0 ? 'pos' : 'neg']">
                  {{ group.totalDayChange >= 0 ? '+' : '' }}{{ formatBRL(group.totalDayChange, { compact: true }) }}
                </span>
                <span :class="['wp8-pos-pct', group.totalDayChangePct >= 0 ? 'pos' : 'neg']">
                  {{ formatPct(group.totalDayChangePct) }}
                </span>
              </span>
            </button>

            <div v-show="expandedAssetGroups.has(group.key)" class="wp8-pos-body">
              <div class="wp8-table-wrap">
                <table class="wp8-table">
                  <thead>
                    <tr>
                      <th class="left">Ticker</th>
                      <th class="left">Nome</th>
                      <th>Qtd</th>
                      <th>Atual</th>
                      <th>Valor</th>
                      <th>Peso</th>
                      <th>Hoje</th>
                      <th>%</th>
                      <th>P&amp;L</th>
                      <th>7d</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="p in group.positions" :key="p.ticker">
                      <td class="left strong">
                        <span class="wp8-ticker-cell">
                          <AtomsTickerLogo :ticker="p.ticker" :logo="p.logo" :size="20" />
                          <span>{{ p.ticker }}</span>
                        </span>
                      </td>
                      <td class="left muted">{{ p.name }}</td>
                      <td>{{ p.qty.toLocaleString('pt-BR') }}</td>
                      <td>{{ formatBRL(p.currentPrice) }}</td>
                      <td>{{ formatBRL(p.value) }}</td>
                      <td>
                        <span class="wp8-bar">
                          <span class="wp8-bar-fill" :style="{ width: `${p.weight}%` }" />
                        </span>
                        <span class="wp8-bar-num">{{ p.weight.toFixed(1) }}%</span>
                      </td>
                      <td :class="p.dayChange > 0 ? 'positive' : p.dayChange < 0 ? 'negative' : 'muted'">
                        {{ p.dayChange > 0 ? '+' : '' }}{{ formatBRL(p.dayChange) }}
                      </td>
                      <td :class="p.dayChangePct > 0 ? 'positive' : p.dayChangePct < 0 ? 'negative' : 'muted'">
                        {{ formatPct(p.dayChangePct) }}
                      </td>
                      <td :class="p.pnl >= 0 ? 'positive' : 'negative'">{{ p.pnl >= 0 ? '+' : '' }}{{ formatBRL(p.pnl) }}</td>
                      <td class="wp8-spark-cell">
                        <svg viewBox="0 0 60 20" class="wp8-spark">
                          <polyline :points="sparkPoints(p.sparkline, 60, 20)" fill="none" :stroke="p.pnl >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'" stroke-width="1.4" />
                        </svg>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- ============ 10. MERCADO GERAL — skeleton ============ -->
      <section v-if="loading" class="hp9-section hp9-market-section">
        <header class="hp9-section-h">
          <h2 class="hp9-h2">Mercado <em class="hp9-italic">geral.</em></h2>
          <p class="hp9-section-deck"><span class="wp8-skel wp8-skel-text-sm" style="width: 70%;" /></p>
        </header>
        <div class="hp9-market-hero">
          <article class="hp9-market-lead">
            <p class="hp9-market-lead-label"><span class="wp8-skel wp8-skel-chip" style="width: 80px;" /></p>
            <p class="hp9-market-lead-val"><span class="wp8-skel wp8-skel-text-md" style="width: 160px;" /></p>
            <p class="hp9-market-lead-pct"><span class="wp8-skel wp8-skel-chip" style="width: 70px;" /></p>
          </article>
          <ul class="hp9-market-secondary">
            <li v-for="n in 4" :key="`skel-ix-${n}`" class="hp9-market-sec">
              <div class="hp9-market-sec-lead">
                <span class="hp9-market-sec-icon"><span class="wp8-skel wp8-skel-circle" style="width: 14px; height: 14px;" /></span>
                <p class="hp9-market-sec-label"><span class="wp8-skel wp8-skel-chip" style="width: 70px;" /></p>
              </div>
              <div class="hp9-market-sec-row">
                <span class="hp9-market-sec-val"><span class="wp8-skel wp8-skel-chip" style="width: 60px;" /></span>
                <span class="hp9-market-sec-pct"><span class="wp8-skel wp8-skel-chip" style="width: 50px;" /></span>
              </div>
            </li>
          </ul>
        </div>
        <div class="hp9-market-mvr">
          <div v-for="col in 2" :key="`skel-mvr-${col}`" class="hp9-market-mvr-col">
            <p class="hp9-market-mvr-h"><span class="wp8-skel wp8-skel-text-sm" style="width: 140px;" /></p>
            <ul>
              <li v-for="n in 5" :key="`skel-mvr-${col}-${n}`">
                <span class="wp8-skel wp8-skel-circle" style="width: 14px; height: 14px;" />
                <span class="wp8-skel wp8-skel-circle" style="width: 22px; height: 22px;" />
                <span class="hp9-market-mvr-tk"><span class="wp8-skel wp8-skel-chip" style="width: 60px;" /></span>
                <span class="hp9-market-mvr-pct"><span class="wp8-skel wp8-skel-chip" style="width: 50px;" /></span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ============ 10. MERCADO GERAL — editorial com lead + secundários ============ -->
      <section v-else-if="data.marketIndices.length" class="hp9-section hp9-market-section">
        <header class="hp9-section-h">
          <h2 class="hp9-h2">Bolsa em queda, sua carteira <em class="hp9-italic">no mesmo passo.</em></h2>
          <p class="hp9-section-deck">
            Ibovespa fechou em <strong>{{ formatPct(data.marketIndices[0].changePct) }}</strong>.
            Sua carteira caiu <strong>{{ formatPct(data.portfolio.dayChangePct) }}</strong>,
            {{ vsIbovLabel }}.
          </p>
        </header>

        <!-- Lead index (IBOV) + 3 secundários compactos -->
        <div class="hp9-market-hero">
          <article class="hp9-market-lead">
            <p class="hp9-market-lead-label">{{ data.marketIndices[0].label }}</p>
            <p class="hp9-market-lead-val">{{ formatMarketValue(data.marketIndices[0]) }}</p>
            <p :class="['hp9-market-lead-pct', data.marketIndices[0].changePct >= 0 ? 'pos' : 'neg']">
              <UIcon :name="data.marketIndices[0].changePct >= 0 ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'" class="size-4" />
              {{ formatPct(data.marketIndices[0].changePct) }}
            </p>
          </article>

          <ul class="hp9-market-secondary">
            <li v-for="ix in data.marketIndices.slice(1)" :key="ix.key" class="hp9-market-sec">
              <div class="hp9-market-sec-lead">
                <span v-if="ix.icon" class="hp9-market-sec-icon">
                  <UIcon :name="`i-lucide-${ix.icon}`" class="size-4" />
                </span>
                <p class="hp9-market-sec-label">{{ ix.label }}</p>
              </div>
              <div class="hp9-market-sec-row">
                <span class="hp9-market-sec-val">{{ formatMarketValue(ix) }}</span>
                <span :class="['hp9-market-sec-pct', ix.changePct >= 0 ? 'pos' : 'neg']">
                  <UIcon :name="ix.changePct >= 0 ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'" class="size-3" />
                  {{ formatPct(ix.changePct) }}
                </span>
              </div>
            </li>
          </ul>
        </div>

        <!-- Top movers — editorial framing (logos via icons.brapi.dev) -->
        <div class="hp9-market-mvr">
          <div class="hp9-market-mvr-col">
            <p class="hp9-market-mvr-h">Quem segurou <em class="hp9-italic">o índice.</em></p>
            <ul>
              <li v-for="t in data.topGainers" :key="t.ticker">
                <UIcon name="i-lucide-arrow-up" class="size-3.5 pos" />
                <AtomsTickerLogo :ticker="t.ticker" :logo="`https://icons.brapi.dev/icons/${t.ticker}.svg`" :size="22" />
                <span class="hp9-market-mvr-tk">{{ t.ticker }}</span>
                <span class="hp9-market-mvr-pct pos">{{ formatPct(t.pct) }}</span>
              </li>
            </ul>
          </div>
          <div class="hp9-market-mvr-col">
            <p class="hp9-market-mvr-h">Quem puxou <em class="hp9-italic">pra baixo.</em></p>
            <ul>
              <li v-for="t in data.topLosers" :key="t.ticker">
                <UIcon name="i-lucide-arrow-down" class="size-3.5 neg" />
                <AtomsTickerLogo :ticker="t.ticker" :logo="`https://icons.brapi.dev/icons/${t.ticker}.svg`" :size="22" />
                <span class="hp9-market-mvr-tk">{{ t.ticker }}</span>
                <span class="hp9-market-mvr-pct neg">{{ formatPct(t.pct) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ============ 11. SEU HISTÓRICO DE IMPACTO — editorial ============ -->
      <section class="hp9-section">
        <header class="hp9-section-h">
          <h2 class="hp9-h2">Como você <em class="hp9-italic">tem reagido.</em></h2>
        </header>

        <ul v-if="loading" class="hp9-history">
          <li v-for="n in 4" :key="`skel-hist-${n}`" class="hp9-history-card">
            <header class="hp9-history-h">
              <p class="hp9-history-label"><span class="wp8-skel wp8-skel-chip" style="width: 60px;" /></p>
              <span class="hp9-history-pill"><span class="wp8-skel wp8-skel-chip" style="width: 80px;" /></span>
            </header>
            <p class="hp9-history-amt"><span class="wp8-skel wp8-skel-text-md" style="width: 140px;" /></p>
            <p class="hp9-history-pct"><span class="wp8-skel wp8-skel-chip" style="width: 70px;" /></p>
            <span class="wp8-skel wp8-skel-block" style="height: 40px; width: 100%; border-radius: 6px; margin-top: 12px;" />
          </li>
        </ul>
        <ul v-else class="hp9-history">
          <li v-for="h in data.history" :key="h.label" class="hp9-history-card">
            <header class="hp9-history-h">
              <p class="hp9-history-label">{{ h.label }}</p>
              <span :class="['hp9-history-pill', `sev-${h.severity}`]">Impacto {{ historyImpactLabel(h.severity) }}</span>
            </header>
            <p :class="['hp9-history-amt', h.amount >= 0 ? 'pos' : 'neg']">
              {{ h.amount >= 0 ? '+' : '' }}{{ formatBRL(h.amount) }}
            </p>
            <p :class="['hp9-history-pct', h.amount >= 0 ? 'pos' : 'neg']">{{ formatPct(h.pct) }}</p>
            <svg class="hp9-history-spark" viewBox="0 0 240 60" preserveAspectRatio="none">
              <polyline :points="sparkPoints(h.sparkline, 240, 60)" fill="none" :stroke="h.amount >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </li>
        </ul>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
// Day 4 Sprint 1: troca useHojeMockData() pelo composable real
// (useHojeData) que orquestra /api/portfolio/today, /portfolio/history
// e /market/snapshot. Cache 1h server-side por user (ADR-006).
//
// Empty state: user sem positions vê CTA para conectar corretora
// (mesmo padrão de wallet/index.vue).
//
// Sprint 2 vai popular: causalFactors, news, topMovers, resumoAI,
// foreignFlow, breadth, dividendsUpcoming.

// useHojeData agora é reativo: retorna { data, loading, refresh }.
// Inicial = emptyShape com loading=true, page renderiza skeletons enquanto
// fetcha em background. Ao terminar, troca por dados reais.
const { data: hojeData, loading } = useHojeData()
const data = computed(() => hojeData.value)
const assetsTable = computed(() => data.value.assetsTable)

// Estado de colapso dos 3 grupos da seção "Seus ativos".
// Inicia com os 2 primeiros expandidos (up + down) e flat colapsado
// porque os neutros são menos interessantes editorialmente.
const expandedAssetGroups = ref<Set<string>>(new Set(['up', 'down']))
function toggleAssetGroup(key: string) {
  if (expandedAssetGroups.value.has(key)) expandedAssetGroups.value.delete(key)
  else expandedAssetGroups.value.add(key)
  expandedAssetGroups.value = new Set(expandedAssetGroups.value)
}

// Banner "mercado fechado": quando price_dates.today < hoje (BR),
// mostra que estamos lendo o último pregão. Útil em finais de semana,
// feriados e na janela antes da abertura. Texto em pt-BR.
const marketClosedBanner = computed(() => {
  const todayStr = data.value.priceDates?.today
  if (!todayStr) return null
  // Date string vem como YYYY-MM-DD. Cria Date em BRT.
  const tradingDay = new Date(todayStr + 'T12:00:00-03:00')
  const now = new Date()
  // Em BRT, hoje termina às 23:59:59
  const sameDay =
    tradingDay.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) ===
    now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  if (sameDay) return null
  // Mostra "Mercado fechado · dados de sex, 15 mai"
  const formatted = tradingDay.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
  return `Mercado fechado · dados do último pregão, ${formatted}`
})

// Notícias: lead text editorial.
// Mostra o número de notícias e o impacto REAL agregado por tickers
// únicos (evita double-counting de múltiplas news sobre o mesmo evento).
const newsLeadText = computed(() => {
  const s = data.value.newsSummary
  if (!s || s.total === 0) return 'Sem notícias relevantes nas últimas 24 horas.'
  const parts: string[] = []
  if (s.countPositive > 0) {
    const v = formatBRL(s.totalPositive, { compact: true })
    parts.push(`<strong class="pos">+${v}</strong> em ${s.countPositive} ${s.countPositive === 1 ? 'notícia' : 'notícias'} positiva${s.countPositive === 1 ? '' : 's'}`)
  }
  if (s.countNegative > 0) {
    const v = formatBRL(s.totalNegative, { compact: true })
    parts.push(`<strong class="neg">${v}</strong> em ${s.countNegative} ${s.countNegative === 1 ? 'notícia' : 'notícias'} negativa${s.countNegative === 1 ? '' : 's'}`)
  }
  return `Nas últimas 24 horas, sua carteira moveu ${parts.join(' e ')}.`
})

function formatBRL(value: number, opts?: { compact?: boolean }) {
  if (opts?.compact) {
    const abs = Math.abs(value)
    const sign = value < 0 ? '-' : ''
    if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1_000_000).toFixed(2).replace('.', ',')} mi`
    if (abs >= 1_000) return `${sign}R$ ${(abs / 1_000).toFixed(2).replace('.', ',')} mil`
    return `${sign}R$ ${abs.toFixed(0)}`
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value)
}
function formatPct(value: number) {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2).replace('.', ',')}%`
}
/** Trunca texto sem cortar palavra. Usado no excerpt dos news cards. */
function truncateText(text: string, max: number): string {
  if (!text || text.length <= max) return text
  const cut = text.slice(0, max).replace(/\s+\S*$/, '')
  return `${cut}…`
}
function formatMarketValue(ix: { value: number; key: string }) {
  if (ix.key === 'dolar') return `R$ ${ix.value.toFixed(2).replace('.', ',')}`
  if (ix.key === 'brent') return `US$ ${ix.value.toFixed(2).replace('.', ',')}`
  return ix.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}
function pesouLabel(key: string) {
  const map: Record<string, string> = {
    juros: 'Juros futuros',
    petroleo: 'Petrobras',
    dolar: 'Dólar',
    global: 'Mercado externo',
  }
  return map[key] || key
}

// Texto rico das pills "O que mais pesou" — frase com strong nos pontos chave + valor colorido.
// Agora aceita os tickers reais que mais contribuíram (vindo do composable).
function pillText(c: { key: string; label?: string; impact: number; tickers?: string[] }) {
  const abs = Math.abs(c.impact)
  const compact = abs >= 1000 ? `${(abs / 1000).toFixed(2).replace('.', ',')}k` : abs.toFixed(0)
  const sign = c.impact >= 0 ? '+' : '-'
  const valClass = c.impact >= 0 ? 'pos' : 'neg'
  const v = `<strong class="${valClass}">${sign}R$ ${compact}</strong>`
  const tickerList = (c.tickers ?? []).slice(0, 2).join(' e ')
  const isPositive = c.impact >= 0
  const sentences: Record<string, { neg: string; pos: string }> = {
    juros: {
      neg: `Os <strong>juros futuros</strong> em alta pressionaram ${tickerList || 'sua exposição'} em ${v}.`,
      pos: `<strong>Juros</strong> a favor ajudaram ${tickerList || 'sua exposição'} em ${v}.`,
    },
    petroleo: {
      neg: `A <strong>queda do petróleo</strong> impactou ${tickerList || 'petroleiras'} em ${v}.`,
      pos: `A <strong>alta do petróleo</strong> ajudou ${tickerList || 'petroleiras'} em ${v}.`,
    },
    dolar: {
      neg: `O <strong>movimento do dólar</strong> pressionou ${tickerList || 'sua exposição cambial'} em ${v}.`,
      pos: `O <strong>movimento do dólar</strong> beneficiou ${tickerList || 'sua exposição cambial'} em ${v}.`,
    },
    commodity: {
      neg: `<strong>Commodities</strong> em queda pressionaram ${tickerList || 'mineradoras/papel'} em ${v}.`,
      pos: `<strong>Commodities</strong> em alta beneficiaram ${tickerList || 'mineradoras/papel'} em ${v}.`,
    },
    global: {
      neg: `O <strong>mercado externo</strong> em queda pressionou sua exposição internacional em ${v}.`,
      pos: `O <strong>mercado externo</strong> em alta ajudou sua exposição internacional em ${v}.`,
    },
    consumo: {
      neg: `<strong>Consumo doméstico</strong> sofreu, impactando ${tickerList || 'varejo'} em ${v}.`,
      pos: `<strong>Consumo doméstico</strong> reagiu bem, beneficiando ${tickerList || 'varejo'} em ${v}.`,
    },
  }
  const set = sentences[c.key]
  if (!set) return ''
  return isPositive ? set.pos : set.neg
}
function severityLabel(s: string) {
  if (s === 'high') return 'alto impacto'
  if (s === 'medium') return 'médio impacto'
  if (s === 'positive') return 'baixo impacto positivo'
  return 'baixo impacto'
}
function historyImpactLabel(s: string) {
  if (s === 'high') return 'alto'
  if (s === 'medium') return 'médio'
  if (s === 'positive') return 'baixo'
  return 'baixo'
}
/**
 * Normaliza URL de imagem do news_articles.image_url:
 *   - Desescapa `&amp;` que vem do scraping HTML
 *   - Aceita só URLs absolutas (https)
 */
function cleanImageUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  const url = raw.replace(/&amp;/g, '&').trim()
  if (!/^https?:\/\//i.test(url)) return null
  return url
}
function imageIcon(key: string) {
  const map: Record<string, string> = {
    building: 'i-lucide-landmark',
    oil: 'i-lucide-droplet',
    dollar: 'i-lucide-dollar-sign',
    mining: 'i-lucide-mountain',
  }
  return map[key] || 'i-lucide-newspaper'
}
function factorIcon(f: string) {
  const map: Record<string, string> = {
    juros: 'i-lucide-percent',
    petroleo: 'i-lucide-droplet',
    dolar: 'i-lucide-dollar-sign',
    setor: 'i-lucide-tag',
  }
  return map[f] || 'i-lucide-tag'
}
function sparkPoints(arr: number[], w = 80, h = 24) {
  const min = Math.min(...arr, 0)
  const max = Math.max(...arr, 0)
  const range = max - min || 1
  return arr.map((v, i) => {
    const x = (i / (arr.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

// Top fator do dia: alimenta o callout "Principal impacto"
const topFactor = computed(() => data.value.causalFactors[0] ?? null)
const topFactorText = computed(() => {
  const f = topFactor.value
  if (!f) return ''
  const abs = Math.abs(f.impact)
  const compact = abs >= 1000 ? `${(abs / 1000).toFixed(2).replace('.', ',')}k` : abs.toFixed(0)
  const valClass = f.impact >= 0 ? 'pos' : 'neg'
  const v = `<strong class="${valClass}">${f.impact >= 0 ? '+' : '-'}R$ ${compact}</strong>`
  const action = f.impact >= 0 ? 'ajudou' : 'pressionou'
  const tickers = (f.tickers ?? []).slice(0, 2).join(' e ')
  const target = tickers ? `<span class="hp9-lead-tickers">${tickers}</span>` : 'sua carteira'
  return `<strong>Principal impacto:</strong> ${f.label.toLowerCase()} ${action} ${target} em ${v}.`
})

// Curva do hero (intraday mock por enquanto). Geometria + tooltip
// hover replicando o pattern de /wallet/index.vue (chartSvgRef +
// hoverIdx + hoverPoint computed). Empty-state safe: serie vazia
// vira [0, 0] pra não quebrar SVG.
const ibovChangePct = computed(() =>
  data.value.marketIndices.find((ix) => ix.key === 'ibov')?.changePct ?? 0
)
const deltaVsIbov = computed(() => data.value.portfolio.dayChangePct - ibovChangePct.value)
const vsIbovLabel = computed(() => {
  const abs = Math.abs(deltaVsIbov.value)
  if (abs < 0.25) return 'em linha com o índice'
  const val = abs.toFixed(2).replace('.', ',')
  return deltaVsIbov.value < 0 ? `${val} p.p. abaixo do índice` : `${val} p.p. acima do índice`
})

const CHART_W = 800
const CHART_H = 240
const PREGAO_START_MIN = 10 * 60 // 10:00
const PREGAO_END_MIN = 17 * 60 + 30 // 17:30

const curveData = computed(() => {
  const arr = data.value.intradayCurve.length >= 2 ? data.value.intradayCurve : [0, 0]
  const min = Math.min(...arr, 0.2)
  const max = Math.max(...arr, -0.2)
  const range = max - min || 1
  const n = arr.length
  const pregaoMin = PREGAO_END_MIN - PREGAO_START_MIN
  const points = arr.map((v, i) => {
    const x = (i / (n - 1)) * CHART_W
    const y = CHART_H - ((v - min) / range) * CHART_H * 0.9 - CHART_H * 0.05
    const minute = PREGAO_START_MIN + (i / (n - 1)) * pregaoMin
    const hh = Math.floor(minute / 60)
    const mm = Math.floor(minute % 60)
    const label = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
    return { x, y, value: v, label }
  })
  const zero = CHART_H - ((0 - min) / range) * CHART_H * 0.9 - CHART_H * 0.05
  return { points, zeroY: zero, n, min, max }
})

const curve = computed(() =>
  curveData.value.points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
)
const zeroY = computed(() => curveData.value.zeroY.toFixed(1))

// Tooltip hover (mesmo pattern de /wallet/index)
const hoverIdx = ref<number | null>(null)
const chartSvgRef = ref<SVGSVGElement | null>(null)

function onChartMouseMove(e: MouseEvent) {
  const svg = chartSvgRef.value
  if (!svg) return
  const rect = svg.getBoundingClientRect()
  const n = curveData.value.n
  if (!n) return
  const xRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  hoverIdx.value = Math.round(xRatio * (n - 1))
}
function onChartMouseLeave() {
  hoverIdx.value = null
}
const hoverPoint = computed(() =>
  hoverIdx.value === null ? null : curveData.value.points[hoverIdx.value] ?? null,
)

definePageMeta({ layout: 'default' })
</script>

<style scoped>
.pos { color: var(--brand-positive); }
.neg { color: var(--brand-negative); }

/* ============ SKELETONS (mesmo shape do wallet/index.vue) ============ */
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
.wp8-skel-text-md { display: inline-block; height: 18px; width: 60%; min-width: 120px; }
.wp8-skel-text-sm { display: inline-block; height: 12px; width: 40%; min-width: 80px; }
.wp8-skel-kpi { display: inline-block; height: 28px; width: 80%; min-width: 60px; }
.wp8-skel-chip { display: inline-block; height: 10px; width: 40px; }
.wp8-skel-curve { display: block; width: 100%; height: 100%; min-height: 240px; border-radius: 6px; }
.wp8-skel-block { display: block; width: 100%; border-radius: 8px; background-size: 200% 100%; animation: wp8-skel-shimmer 1.4s ease-in-out infinite; background: linear-gradient(90deg, var(--bg-overlay) 0%, color-mix(in srgb, var(--bg-overlay) 50%, transparent) 50%, var(--bg-overlay) 100%); background-size: 200% 100%; }
.wp8-skel-img-16x9 { aspect-ratio: 21 / 9; border-radius: 12px; }
.wp8-skel-img-square { aspect-ratio: 1; border-radius: 7px; }
.wp8-skel-circle { border-radius: 50%; }

.hp7-shell {
  width: 100%;
  margin: 0 auto;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}
@media (min-width: 768px) { .hp7-shell { padding: 24px 32px; } }

/* ============ EVENTS PILL ============ */
.hp7-events-pill {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px;
  background: color-mix(in srgb, var(--brand-primary) 4%, var(--bg-elevated));
  border: 1px solid color-mix(in srgb, var(--brand-primary) 14%, transparent);
  border-radius: 999px;
  margin-bottom: 32px;
  flex-wrap: nowrap;
  overflow-x: auto;
}
.hp7-events-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
  color: var(--brand-primary); flex-shrink: 0;
}
.hp7-events-text {
  font-size: 12px; color: var(--text-heading); margin: 0;
  flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font-weight: 500;
}
.hp7-events-chips {
  display: flex; gap: 6px; list-style: none; padding: 0; margin: 0; flex-shrink: 0;
}
.hp7-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px; font-weight: 500;
  white-space: nowrap;
}
.hp7-chip-juros {
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  color: var(--brand-primary);
}
.hp7-chip-petroleo {
  background: color-mix(in srgb, #d97706 12%, transparent);
  color: #d97706;
}
.hp7-chip-dolar {
  background: color-mix(in srgb, var(--brand-positive) 14%, transparent);
  color: var(--brand-positive);
}
.hp7-chip-commodity {
  background: color-mix(in srgb, #b45309 12%, transparent);
  color: #b45309;
}
.hp7-chip-global {
  background: color-mix(in srgb, #2563eb 12%, transparent);
  color: #2563eb;
}
.hp7-chip-consumo {
  background: color-mix(in srgb, #7c3aed 12%, transparent);
  color: #7c3aed;
}

/* ============ WELCOME ============ */
.hp7-welcome { text-align: center; margin-bottom: 32px; }
.hp7-welcome-eyebrow {
  font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--brand-primary); font-weight: 600; margin: 0 0 12px;
}
.hp7-welcome-h {
  font-size: clamp(36px, 7vw, 44px); font-weight: 400;
  letter-spacing: -0.025em; color: var(--text-heading); margin: 0;
  line-height: 1.1;
}
.hp7-welcome-h em {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic; color: var(--brand-primary); font-weight: 500;
}
.hp7-welcome-sub {
  font-size: 14px; color: var(--text-muted); margin: 16px 0 0;
  line-height: 1.5;
}

/* ============ MAIN — DNA v8 + chart à direita (sem borda/padding) ============ */
.hp9-main {
  background: transparent;
  border: 0;
  padding: 0;
  margin-bottom: 32px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}
@media (min-width: 1024px) {
  .hp9-main {
    grid-template-columns: 1fr 1fr;
    gap: 48px;
  }
}

/* LEFT column */
.hp9-main-left { display: flex; flex-direction: column; gap: 16px; }

.hp9-main-left :deep(.calc-result-mega) { margin: 0; }
.hp9-main-left :deep(.calc-result-caption) {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  margin: 0;
}
.hp9-delta-pct {
  display: inline-flex; align-items: center; gap: 2px;
  font-weight: 600; font-variant-numeric: tabular-nums;
}

/* ============ SNAPSHOT PANEL — unifica leads (callouts) + breakdown (mini stats)
   num único container editorial. Substituiu .hp9-callout + .hp9-mini-grid soltos. */
.hp9-snapshot {
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  background: color-mix(in srgb, var(--text-heading) 1.5%, transparent);
  overflow: hidden;
}

/* LEADS area — callouts colados, dividindo o canvas */
.hp9-snapshot-leads {
  display: flex; flex-direction: column;
  padding: 6px;
  gap: 2px;
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
.hp9-lead-neg {
  background: color-mix(in srgb, var(--brand-negative) 6%, transparent);
}
.hp9-lead-neg .hp9-lead-icon { color: var(--brand-negative); }
.hp9-lead-pos {
  background: color-mix(in srgb, var(--brand-positive) 8%, transparent);
}
.hp9-lead-pos .hp9-lead-icon { color: var(--brand-positive); }
.hp9-lead-tickers { color: var(--text-body); }
.hp9-lead-ticker {
  font-weight: 600; color: var(--text-heading);
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}

/* MINI STATS — agora dentro do snapshot, com hairline top de separação dos leads */
.hp9-mini-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 0;
  border-top: 1px solid var(--border-subtle);
}
.hp9-mini {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 14px;
  background: transparent;
  border: 0; border-radius: 0;
  border-right: 1px solid var(--border-subtle);
}
.hp9-mini:last-child { border-right: 0; }
.hp9-mini-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 8px;
  flex-shrink: 0;
}
.hp9-icon-juros { background: color-mix(in srgb, var(--brand-primary) 12%, transparent); color: var(--brand-primary); }
.hp9-icon-petroleo { background: color-mix(in srgb, #d97706 12%, transparent); color: #d97706; }
.hp9-icon-dolar { background: color-mix(in srgb, var(--brand-positive) 14%, transparent); color: var(--brand-positive); }
.hp9-icon-commodity { background: color-mix(in srgb, #b45309 12%, transparent); color: #b45309; }
.hp9-icon-global { background: color-mix(in srgb, #2563eb 12%, transparent); color: #2563eb; }
.hp9-icon-consumo { background: color-mix(in srgb, #7c3aed 12%, transparent); color: #7c3aed; }
.hp9-icon-neutral { background: var(--bg-overlay); color: var(--text-muted); }
.hp9-mini-label {
  font-size: 13px; font-weight: 600; color: var(--text-heading);
  margin: 0; letter-spacing: -0.005em;
  line-height: 1.2;
}
.hp9-mini-sub {
  font-size: 11px; color: var(--text-muted);
  margin: 2px 0 0; font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
}
.hp9-mini-sub.neg { color: var(--brand-negative); font-weight: 500; }

/* RIGHT column — chart */
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
}
@media (min-width: 1024px) { .hp9-curve { min-height: 220px; } }
.hp9-curve svg { width: 100%; height: 100%; display: block; }

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

/* ============ HP9 SECTIONS (editorial, com italic serif) ============ */
.hp9-section { margin-bottom: 56px; }
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
/* ============ HP9 PESOU — pills com texto rico ============ */
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
.hp9-pesou-pill-icon.bg-juros { background: color-mix(in srgb, var(--brand-primary) 16%, transparent); color: var(--brand-primary); }
.hp9-pesou-pill-icon.bg-petroleo { background: color-mix(in srgb, #d97706 16%, transparent); color: #d97706; }
.hp9-pesou-pill-icon.bg-dolar { background: color-mix(in srgb, var(--brand-positive) 16%, transparent); color: var(--brand-positive); }
.hp9-pesou-pill-icon.bg-global { background: color-mix(in srgb, var(--brand-positive) 16%, transparent); color: var(--brand-positive); }

.hp9-pesou-pill-text {
  font-size: 15px;
  line-height: 1.45;
  color: var(--text-body);
  margin: 0;
  letter-spacing: -0.005em;
}
.hp9-pesou-pill-text :deep(strong) {
  color: var(--text-heading);
  font-weight: 600;
}
.hp9-pesou-pill-text :deep(strong.pos) { color: var(--brand-positive); }
.hp9-pesou-pill-text :deep(strong.neg) { color: var(--brand-negative); }

/* ============ HP9 NEWS (3-col editorial cards grandes) ============ */
.hp9-news { list-style: none; padding: 0; margin: 0; display: grid; gap: 24px; }
@media (min-width: 768px) { .hp9-news { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .hp9-news { grid-template-columns: repeat(3, 1fr); } }
.hp9-news-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  overflow: hidden;
  display: flex; flex-direction: column;
  transition: transform 200ms, box-shadow 200ms;
}
.hp9-news-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px -16px color-mix(in srgb, var(--text-heading) 18%, transparent);
}
.hp9-news-img {
  width: 100%;
  aspect-ratio: 16/9;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255, 255, 255, 0.92);
}
.hp9-img-building { background: linear-gradient(135deg, #4a5568, #2d3748); }
.hp9-img-oil { background: linear-gradient(135deg, #c05621, #9c4221); }
.hp9-img-dollar { background: linear-gradient(135deg, #38a169, #276749); }
.hp9-img-mining { background: linear-gradient(135deg, #92400e, #44403c); }
.hp9-news-img-real {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
}
.hp9-news-img {
  position: relative;
}
.hp9-news-empty {
  font-size: 14px;
  color: var(--text-muted);
  padding: 24px 0;
  border-top: 1px solid var(--border-subtle);
  margin: 0;
}

/* === Card body (estilo /para-voce, img top + body bottom) === */
.hp9-news-card-link {
  display: flex; flex-direction: column;
  text-decoration: none; color: inherit;
  height: 100%;
}
.hp9-news-card-body {
  padding: 16px 18px;
  display: flex; flex-direction: column; gap: 8px;
  flex: 1;
}
.hp9-news-card-impact {
  display: inline-flex; align-items: baseline;
  font-size: 14px; font-weight: 600;
  font-variant-numeric: tabular-nums;
  margin: 0;
}
.hp9-news-card-impact.pos { color: var(--brand-positive); }
.hp9-news-card-impact.neg { color: var(--brand-negative); }
.hp9-news-card-tickers {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--brand-primary);
  margin: 0;
}
.hp9-news-card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0;
  line-height: 1.35;
  letter-spacing: -0.01em;
}
.hp9-news-card-excerpt {
  font-size: 13px;
  color: var(--text-body);
  margin: 0;
  line-height: 1.5;
}
.hp9-news-card-meta {
  display: flex; align-items: center; gap: 8px;
  font-size: 11.5px;
  color: var(--text-muted);
  margin: auto 0 0;
  font-variant-numeric: tabular-nums;
}
.hp9-news-card-dot { opacity: 0.5; }

/* ============ H-BLOCK (2-col grid: header esquerda + body direita)
   Portado verbatim de /para-voce. Usado pela seção NOTICIÁRIO DO DIA. */
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

/* === NOTICIÁRIO temas agrupados (header de tema + grid de 3 cards) === */
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
/* Cores default (override por :style inline quando theme.color veio do BE) */
.h-news-theme-icon-petroleo  { background: color-mix(in srgb, #d97706 14%, transparent); color: #d97706; }
.h-news-theme-icon-juros     { background: color-mix(in srgb, var(--brand-primary) 14%, transparent); color: var(--brand-primary); }
.h-news-theme-icon-commodity { background: color-mix(in srgb, #b45309 14%, transparent); color: #b45309; }
.h-news-theme-icon-consumo   { background: color-mix(in srgb, #7c3aed 14%, transparent); color: #7c3aed; }
.h-news-theme-icon-global    { background: color-mix(in srgb, #2563eb 14%, transparent); color: #2563eb; }
.h-news-theme-icon-dolar     { background: color-mix(in srgb, var(--brand-positive) 14%, transparent); color: var(--brand-positive); }
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

/* === Grid 3-col + cards uniformes (img top + body bottom + impact pill) === */
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
  position: relative;
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
.h-news-card-body {
  padding: 16px 18px;
  display: flex; flex-direction: column; gap: 8px;
  flex: 1;
}
.h-news-card-impact {
  display: inline-flex; align-items: baseline;
  font-size: 14px; font-weight: 600;
  font-variant-numeric: tabular-nums;
  margin: 0;
}
.h-news-card-impact.pos { color: var(--brand-positive); }
.h-news-card-impact.neg { color: var(--brand-negative); }
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

/* ============ HP9 CHART HOVER — copiado literal do /wallet/index ============ */
.hp9-curve { position: relative; }
.hp9-chart-svg { cursor: crosshair; }
.hp9-chart-hover { pointer-events: none; }

/* Tooltip flutuante sobre o chart (literal de .wp8-chart-tip).
 * Note: --bg-default não é definida no projeto, então o /wallet renderiza
 * o tooltip transparente mas se beneficia do fundo branco do CalcUiShell
 * por trás. Na /hoje o hero não tem esse fundo branco, então definimos
 * --bg-default localmente apontando pra --bg-elevated (= #FFF nesse
 * tenant) pra garantir paridade visual com o /wallet. */
.hp9-curve { --bg-default: var(--bg-elevated); }
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
.hp9-chart-tip-date { font-size: 11px; color: var(--text-muted); margin: 0 0 4px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; font-variant-numeric: tabular-nums; }
.hp9-chart-tip-val { font-size: 16px; font-weight: 500; color: var(--text-heading); margin: 0; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }

/* ============ HP9 STALE BANNER — mercado fechado / dados de D-1 ============ */
.hp9-stale-banner {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  margin: 0 0 24px;
  border-radius: 999px;
  font-size: 12px; font-weight: 500;
  color: var(--text-muted);
  background: color-mix(in srgb, var(--text-muted) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--text-muted) 12%, transparent);
}

/* ============ HP9 NEWS THEMES — bento layout por tema (petróleo, juros, etc) ============ */
.hp9-themes { display: flex; flex-direction: column; gap: 40px; }
@media (min-width: 1024px) { .hp9-themes { gap: 52px; } }

.hp9-theme { display: flex; flex-direction: column; }

.hp9-theme-head {
  display: grid;
  grid-template-columns: 32px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 0 0 12px;
  margin-bottom: 14px;
}
.hp9-theme-icon {
  width: 32px; height: 32px; border-radius: 9px;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.hp9-theme-icon .iconify { font-size: 16px; }
.hp9-theme-text { min-width: 0; }
.hp9-theme-eyebrow {
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.16em;
  color: var(--text-muted); font-weight: 600; margin: 0 0 2px;
}
.hp9-theme-label {
  font-size: clamp(15px, 1.6vw, 18px); font-weight: 300;
  letter-spacing: -0.015em; color: var(--text-heading); margin: 0; line-height: 1.2;
}
.hp9-theme-label em { font-weight: 400; }
.hp9-theme-meta { text-align: right; font-variant-numeric: tabular-nums; flex-shrink: 0; }
.hp9-theme-amount {
  font-size: clamp(13px, 1.4vw, 15px); font-weight: 500;
  margin: 0; letter-spacing: -0.015em;
}
.hp9-theme-amount.pos { color: var(--brand-positive); }
.hp9-theme-amount.neg { color: var(--brand-negative); }
.hp9-theme-count {
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--text-muted); margin: 2px 0 0;
}
@media (max-width: 767px) {
  .hp9-theme-head { grid-template-columns: 28px 1fr auto; gap: 10px; padding: 0 0 10px; margin-bottom: 12px; }
  .hp9-theme-icon { width: 28px; height: 28px; border-radius: 8px; }
}


/* ============ HP9 NEWS — 1 hero + 3 minis por grupo (legacy, unused) ============ */
.hp9-news-stacks {
  display: flex; flex-direction: column;
  gap: 56px;
}
@media (min-width: 1024px) { .hp9-news-stacks { gap: 72px; } }

.hp9-news-stack-group { display: flex; flex-direction: column; }

/* Band header (sem hairlines, design mais clean) */
.hp9-news-band-head {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 0 0 20px;
  margin-bottom: 24px;
}
.hp9-news-band-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.hp9-news-band-text { min-width: 0; }
.hp9-news-band-eyebrow {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.18em;
  color: var(--text-muted); font-weight: 600; margin: 0 0 4px;
}
.hp9-news-band-title {
  font-size: clamp(20px, 2.4vw, 26px); font-weight: 300;
  letter-spacing: -0.02em; color: var(--text-heading); margin: 0; line-height: 1.15;
}
.hp9-news-band-title em { font-weight: 400; }
.hp9-news-band-meta { text-align: right; font-variant-numeric: tabular-nums; flex-shrink: 0; }
.hp9-news-band-amount {
  font-size: clamp(16px, 2vw, 20px); font-weight: 500;
  margin: 0; letter-spacing: -0.02em;
}
.hp9-news-band-amount.pos { color: var(--brand-positive); }
.hp9-news-band-amount.neg { color: var(--brand-negative); }
.hp9-news-band-count {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--text-muted); margin: 4px 0 0;
}
@media (max-width: 767px) {
  .hp9-news-band-head { grid-template-columns: 36px 1fr auto; gap: 12px; padding: 16px 0; margin-bottom: 20px; }
  .hp9-news-band-icon { width: 36px; height: 36px; border-radius: 10px; }
}

/* HERO: card grande com imagem 16:9 acima do texto */
.hp9-news-hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 28px;
}
@media (min-width: 768px) {
  .hp9-news-hero {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    gap: 32px;
    align-items: center;
  }
}
@media (min-width: 1024px) {
  .hp9-news-hero { gap: 48px; }
}

.hp9-news-hero-img {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 16px;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255, 255, 255, 0.92);
  box-shadow: 0 24px 48px -32px color-mix(in srgb, var(--text-heading) 28%, transparent);
}
.hp9-news-hero-img-real {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; display: block;
}
.hp9-news-hero-body { min-width: 0; }

.hp9-news-hero-impact {
  display: inline-flex; align-items: baseline; flex-wrap: wrap; gap: 6px;
  font-size: 12px;
  margin: 0 0 14px;
  font-variant-numeric: tabular-nums;
}
.hp9-news-hero-impact.pos .hp9-news-hero-amount,
.hp9-news-hero-impact.pos .hp9-news-hero-pct { color: var(--brand-positive); }
.hp9-news-hero-impact.neg .hp9-news-hero-amount,
.hp9-news-hero-impact.neg .hp9-news-hero-pct { color: var(--brand-negative); }
.hp9-news-hero-amount {
  font-size: 18px; font-weight: 600; letter-spacing: -0.01em;
}
.hp9-news-hero-pct { font-weight: 500; }
.hp9-news-hero-sep { color: var(--border-default); }
.hp9-news-hero-portfolio { color: var(--text-muted); }

.hp9-news-hero-headline {
  font-size: clamp(20px, 2.4vw, 28px);
  font-weight: 400;
  letter-spacing: -0.022em;
  line-height: 1.2;
  color: var(--text-heading);
  margin: 0 0 14px;
}
.hp9-news-hero-sum {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-body);
  margin: 0 0 16px;
  max-width: 54ch;
  /* limita a 3 linhas pra hero não estourar */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.hp9-news-hero-footer {
  display: inline-flex; flex-wrap: wrap; align-items: baseline; gap: 6px;
  font-size: 11px;
  margin: 0;
  text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--text-muted);
  font-weight: 500;
}
.hp9-news-hero-dot { color: var(--border-default); }
.hp9-news-hero-tickers { letter-spacing: 0.06em; font-variant-numeric: tabular-nums; }

/* MINIS: 3 cards compactos em grid horizontal */
.hp9-news-minis {
  list-style: none; padding: 0; margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  border-top: 1px solid var(--border-subtle);
  padding-top: 24px;
}
@media (min-width: 768px) {
  .hp9-news-minis { grid-template-columns: repeat(3, 1fr); gap: 20px; }
}

.hp9-news-mini {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px;
  align-items: start;
  min-width: 0;
}
.hp9-news-mini-img {
  position: relative;
  width: 72px; height: 72px;
  border-radius: 10px;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255, 255, 255, 0.92);
  flex-shrink: 0;
}
.hp9-news-mini-img-real {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; display: block;
}
.hp9-news-mini-body { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.hp9-news-mini-impact {
  font-size: 13px; font-weight: 600; margin: 0;
  font-variant-numeric: tabular-nums; letter-spacing: -0.005em;
  line-height: 1;
}
.hp9-news-mini-impact.pos { color: var(--brand-positive); }
.hp9-news-mini-impact.neg { color: var(--brand-negative); }
.hp9-news-mini-headline {
  font-size: 13px; font-weight: 500;
  line-height: 1.35;
  color: var(--text-heading);
  margin: 0;
  letter-spacing: -0.005em;
  /* clamp 2 linhas */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.hp9-news-mini-meta {
  display: flex; flex-direction: column; gap: 2px;
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--text-muted); font-weight: 500;
  margin: 2px 0 0;
}
.hp9-news-mini-tickers { letter-spacing: 0.06em; font-variant-numeric: tabular-nums; }
.hp9-news-body {
  display: flex; flex-direction: column; gap: 12px;
  padding: 24px;
  flex: 1;
}
.hp9-news-flag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
  align-self: flex-start;
}
.hp9-news-flag.sev-high {
  background: color-mix(in srgb, var(--brand-negative) 12%, transparent);
  color: var(--brand-negative);
}
.hp9-news-flag.sev-medium {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
}
.hp9-news-flag.sev-positive {
  background: color-mix(in srgb, var(--brand-positive) 14%, transparent);
  color: var(--brand-positive);
}
.hp9-news-h {
  font-size: 19px; font-weight: 500;
  letter-spacing: -0.012em; line-height: 1.25;
  color: var(--text-heading); margin: 0;
}
.hp9-news-sum {
  font-size: 14px; color: var(--text-body);
  line-height: 1.6; margin: 0;
  flex: 1;
}
.hp9-news-stats {
  display: flex; gap: 16px; align-items: center;
  padding-top: 16px; border-top: 1px solid var(--border-subtle);
  margin-top: auto;
}
.hp9-news-imp-card {
  padding: 10px 14px; border-radius: 12px;
  flex-shrink: 0;
}
.hp9-news-imp-card.sev-high { background: color-mix(in srgb, var(--brand-negative) 8%, transparent); }
.hp9-news-imp-card.sev-medium { background: color-mix(in srgb, var(--brand-primary) 7%, transparent); }
.hp9-news-imp-card.sev-positive { background: color-mix(in srgb, var(--brand-positive) 8%, transparent); }
.hp9-news-imp-amt {
  font-size: 16px; font-weight: 600; margin: 0;
  font-variant-numeric: tabular-nums; letter-spacing: -0.01em;
}
.hp9-news-imp-card.sev-high .hp9-news-imp-amt,
.hp9-news-imp-card.sev-high .hp9-news-imp-pct { color: var(--brand-negative); }
.hp9-news-imp-card.sev-medium .hp9-news-imp-amt,
.hp9-news-imp-card.sev-medium .hp9-news-imp-pct { color: var(--brand-negative); }
.hp9-news-imp-card.sev-positive .hp9-news-imp-amt,
.hp9-news-imp-card.sev-positive .hp9-news-imp-pct { color: var(--brand-positive); }
.hp9-news-imp-pct {
  font-size: 12px; margin: 2px 0 0;
  font-variant-numeric: tabular-nums;
  display: inline-flex; align-items: center; gap: 2px;
}
.hp9-news-meta {
  font-size: 12px; color: var(--text-muted);
  line-height: 1.4; margin: 0;
}
.hp9-news-meta-strong { font-weight: 600; }
.hp9-news-tickers {
  font-variant-numeric: tabular-nums; letter-spacing: 0.04em;
  color: var(--text-muted); font-weight: 500;
}

/* ============ RESUMO CARD (padronizado com /para-voce) ============
   Card destacado com bg cream sutil + logo Redentia + título serif.
   /hoje exclusivo: actions row com QuickSearch + CTA "continuar conversa". */
.resumo-card-wrap {
  margin-bottom: 56px;
}
@media (min-width: 1024px) { .resumo-card-wrap { margin-bottom: 72px; } }
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
.resumo-card-h em { font-style: italic; font-weight: 400; color: var(--brand-primary); }
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
  font-size: 12.5px; color: var(--text-muted);
  margin: 0;
  font-variant-numeric: tabular-nums;
}
.resumo-card-attribution strong { color: var(--text-heading); font-weight: 600; }
.resumo-card-sep { opacity: 0.4; }

/* Actions row (exclusivo /hoje): QuickSearch dock + CTA "continuar conversa" */
.resumo-card-actions {
  display: flex; align-items: center; gap: 14px;
  flex-wrap: wrap;
  padding-top: 18px;
  border-top: 1px solid color-mix(in srgb, var(--brand-primary) 14%, transparent);
  margin-top: 6px;
}
.resumo-card-actions > :first-child { flex: 1 1 240px; min-width: 0; }
.resumo-card-actions .qs-dock { margin-left: 0; margin-right: 0; }

.resumo-card-cta-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 20px;
  background: var(--text-heading);
  color: var(--bg-base);
  border-radius: 999px;
  font-size: 13.5px; font-weight: 600;
  text-decoration: none;
  flex-shrink: 0;
  transition: transform 200ms, box-shadow 200ms;
  box-shadow: 0 6px 16px -8px color-mix(in srgb, var(--text-heading) 40%, transparent);
}
.resumo-card-cta-btn :deep(*) { color: var(--bg-base); }
.resumo-card-cta-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -10px color-mix(in srgb, var(--text-heading) 50%, transparent);
}

/* ============ WP8 POS GROUPS (idêntico ao wallet/index.vue) ============ */
.wp8-pos-groups { display: flex; flex-direction: column; border-top: 1px solid var(--border-subtle); }
.wp8-pos-group { border-bottom: 1px solid var(--border-subtle); }
.wp8-pos-group:last-child { border-bottom: 0; }
.wp8-pos-head {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 18px 0;
  background: transparent;
  border: 0;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  color: inherit;
  transition: background 150ms;
}
@media (min-width: 1024px) { .wp8-pos-head { gap: 24px; } }
.wp8-pos-head:hover { background: color-mix(in srgb, var(--brand-primary) 3%, transparent); }
.wp8-pos-head-left { display: inline-flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.wp8-pos-head-right { display: inline-flex; align-items: center; gap: 8px 16px; flex-wrap: wrap; justify-content: flex-end; font-variant-numeric: tabular-nums; }
@media (min-width: 1024px) { .wp8-pos-head-right { gap: 16px 28px; } }
.wp8-pos-chev { color: var(--text-muted); transition: transform 200ms ease-out; flex-shrink: 0; align-self: center; width: 16px; height: 16px; }
.wp8-pos-chev.is-open { transform: rotate(90deg); color: var(--brand-primary); }
.wp8-pos-type { font-size: 16px; font-weight: 500; color: var(--text-heading); letter-spacing: -0.012em; }
@media (min-width: 768px) { .wp8-pos-type { font-size: 18px; } }
.wp8-pos-count { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); font-weight: 500; }
.wp8-pos-weight { display: none; align-items: center; gap: 8px; }
@media (min-width: 1024px) { .wp8-pos-weight { display: inline-flex; } }
.wp8-pos-weight-bar { display: inline-block; width: 80px; height: 4px; background: var(--bg-overlay); border-radius: 999px; overflow: hidden; }
.wp8-pos-weight-bar span { display: block; height: 100%; border-radius: 999px; }
.wp8-pos-weight-num { font-size: 12px; color: var(--text-muted); min-width: 42px; text-align: right; }
.wp8-pos-value { font-size: 15px; color: var(--text-heading); font-weight: 500; letter-spacing: -0.01em; text-align: right; }
@media (min-width: 1024px) { .wp8-pos-value { min-width: 80px; } }
.wp8-pos-pnl { font-size: 13px; font-weight: 500; text-align: right; }
@media (min-width: 1024px) { .wp8-pos-pnl { font-size: 14px; min-width: 80px; } }
.wp8-pos-pnl.pos, .wp8-pos-pct.pos { color: var(--brand-positive); }
.wp8-pos-pnl.neg, .wp8-pos-pct.neg { color: var(--brand-negative); }
.wp8-pos-pct { font-size: 12px; min-width: 56px; text-align: right; }
@media (min-width: 1024px) { .wp8-pos-pct { font-size: 13px; } }
.wp8-pos-body { padding: 0 0 16px; }
.wp8-pos-body .wp8-table-wrap { border-top: 0; }

/* ============ WP8 TABLE (idêntico ao wallet/index.vue) ============ */
.wp8-table-wrap { overflow-x: auto; border-top: 1px solid var(--border-subtle); }
.wp8-table { width: 100%; border-collapse: collapse; font-size: 13px; font-variant-numeric: tabular-nums; }
.wp8-table thead th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); font-weight: 500; padding: 14px 10px; text-align: right; border-bottom: 1px solid var(--border-subtle); white-space: nowrap; }
.wp8-table th.left { text-align: left; }
.wp8-table tbody td { padding: 14px 10px; text-align: right; border-bottom: 1px solid var(--border-subtle); color: var(--text-body); white-space: nowrap; }
.wp8-table tbody tr:last-child td { border-bottom: 0; }
.wp8-table tbody tr:hover td { background: color-mix(in srgb, var(--brand-primary) 4%, transparent); }
.wp8-table td.left { text-align: left; }
.wp8-table td.strong { color: var(--text-heading); font-weight: 600; letter-spacing: 0.04em; }
.wp8-table td.muted { color: var(--text-muted); }
.wp8-table td.positive { color: var(--brand-positive); font-weight: 500; }
.wp8-table td.negative { color: var(--brand-negative); font-weight: 500; }
.wp8-bar { display: inline-block; width: 60px; height: 4px; background: var(--bg-overlay); border-radius: 999px; vertical-align: middle; margin-right: 8px; overflow: hidden; }
.wp8-bar-fill { display: block; height: 100%; background: var(--brand-primary); border-radius: 999px; }
.wp8-bar-num { color: var(--text-body); font-size: 12px; }
.wp8-spark-cell { padding: 0 8px !important; }
.wp8-spark { width: 60px; height: 20px; vertical-align: middle; }

/* Ticker cell com logo no estilo wallet */
.wp8-ticker-cell { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }

/* ============ HP9 TABLE (ativos) — estilo wallet wp8-table ============ */
.hp9-table-wrap { overflow-x: auto; border-top: 1px solid var(--border-subtle); }
.hp9-table { width: 100%; border-collapse: collapse; font-size: 13px; font-variant-numeric: tabular-nums; }
.hp9-table thead th {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--text-muted); font-weight: 500;
  padding: 14px 10px; text-align: right;
  border-bottom: 1px solid var(--border-subtle);
  white-space: nowrap;
}
.hp9-table th.left { text-align: left; }
.hp9-table tbody td {
  padding: 14px 10px; text-align: right;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-body); white-space: nowrap;
}
.hp9-table tbody tr:last-child td { border-bottom: 0; }
.hp9-table tbody tr:hover td { background: color-mix(in srgb, var(--brand-primary) 4%, transparent); }
.hp9-table td.left { text-align: left; }
.hp9-table td.strong { color: var(--text-heading); font-weight: 600; letter-spacing: 0.04em; }
.hp9-table td.muted { color: var(--text-muted); }
.hp9-table td.positive { color: var(--brand-positive); font-weight: 500; }
.hp9-table td.negative { color: var(--brand-negative); font-weight: 500; }
.hp9-bar { display: inline-block; width: 60px; height: 4px; background: var(--bg-overlay); border-radius: 999px; vertical-align: middle; margin-right: 8px; overflow: hidden; }
.hp9-bar-fill { display: block; height: 100%; background: var(--brand-primary); border-radius: 999px; }
.hp9-bar-num { color: var(--text-body); font-size: 12px; }
.hp9-spark-cell { padding: 0 8px !important; }
.hp9-spark { width: 60px; height: 20px; vertical-align: middle; }

/* Mobile: esconde NOME, QTD, ATUAL, PESO, DY, 7d */
@media (max-width: 767px) {
  .hp9-table thead th:nth-child(2),
  .hp9-table tbody td:nth-child(2),
  .hp9-table thead th:nth-child(3),
  .hp9-table tbody td:nth-child(3),
  .hp9-table thead th:nth-child(4),
  .hp9-table tbody td:nth-child(4),
  .hp9-table thead th:nth-child(6),
  .hp9-table tbody td:nth-child(6),
  .hp9-table thead th:nth-child(9),
  .hp9-table tbody td:nth-child(9),
  .hp9-table thead th:nth-child(10),
  .hp9-table tbody td:nth-child(10) { display: none; }
  .hp9-table thead th, .hp9-table tbody td { padding: 12px 8px; font-size: 12px; }
  .hp9-table td.strong { font-size: 13px; }
}

/* ============ HP9 HISTORY — sem card chrome, só hairline dividers ============ */
.hp9-history {
  list-style: none; padding: 0; margin: 0;
  display: grid; grid-template-columns: 1fr; gap: 0;
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
}
@media (min-width: 768px) { .hp9-history { grid-template-columns: repeat(3, 1fr); } }
.hp9-history-card {
  padding: 24px 20px;
  background: transparent;
  border: 0;
  border-radius: 0;
  display: flex; flex-direction: column; gap: 6px;
  border-bottom: 1px solid var(--border-subtle);
}
.hp9-history-card:last-child { border-bottom: 0; }
@media (min-width: 768px) {
  .hp9-history-card {
    border-bottom: 0;
    border-right: 1px solid var(--border-subtle);
  }
  .hp9-history-card:last-child { border-right: 0; }
}
.hp9-history-h {
  display: flex; justify-content: space-between; align-items: center;
  gap: 8px; margin-bottom: 12px;
}
.hp9-history-label {
  font-size: 15px; font-weight: 600; color: var(--text-heading);
  margin: 0; letter-spacing: -0.005em;
}
.hp9-history-pill {
  display: inline-block; padding: 4px 12px; border-radius: 999px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.01em;
  white-space: nowrap;
}
.hp9-history-pill.sev-high { background: color-mix(in srgb, var(--brand-negative) 12%, transparent); color: var(--brand-negative); }
.hp9-history-pill.sev-medium { background: color-mix(in srgb, var(--brand-primary) 14%, transparent); color: var(--brand-primary); }
.hp9-history-pill.sev-positive { background: color-mix(in srgb, var(--brand-positive) 14%, transparent); color: var(--brand-positive); }
.hp9-history-pill.sev-low { background: var(--bg-overlay); color: var(--text-muted); }
.hp9-history-amt {
  font-size: clamp(28px, 3.5vw, 40px); font-weight: 500;
  margin: 0; font-variant-numeric: tabular-nums; letter-spacing: -0.025em;
  line-height: 1.05;
}
.hp9-history-pct {
  font-size: 14px; font-weight: 500; margin: 4px 0 0;
  font-variant-numeric: tabular-nums;
}
.hp9-history-spark {
  width: 100%; height: 48px; margin-top: 8px;
}

/* ============ SECTIONS LEGACY ============ */
.hp7-section { margin-bottom: 36px; }
.hp7-section-h {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 14px; gap: 8px;
}
.hp7-h2 {
  font-size: 16px; font-weight: 600; color: var(--text-heading);
  margin: 0; display: inline-flex; align-items: center; gap: 6px;
  letter-spacing: -0.01em;
}
/* ============ PESOU LIST ============ */
.hp7-pesou { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
.hp7-pesou-row {
  display: grid; grid-template-columns: 40px 1fr auto; gap: 12px; align-items: center;
  padding: 14px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
}
.hp7-pesou-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 10px;
}
.hp7-pesou-icon.bg-juros { background: color-mix(in srgb, var(--brand-primary) 12%, transparent); color: var(--brand-primary); }
.hp7-pesou-icon.bg-petroleo { background: color-mix(in srgb, #d97706 12%, transparent); color: #d97706; }
.hp7-pesou-icon.bg-dolar { background: color-mix(in srgb, var(--brand-positive) 14%, transparent); color: var(--brand-positive); }
.hp7-pesou-icon.bg-global { background: color-mix(in srgb, var(--brand-positive) 14%, transparent); color: var(--brand-positive); }
.hp7-pesou-label { font-size: 14px; font-weight: 600; color: var(--text-heading); margin: 0; letter-spacing: -0.005em; }
.hp7-pesou-note { font-size: 12px; color: var(--text-muted); margin: 4px 0 0; line-height: 1.4; }
.hp7-pesou-impact {
  font-size: 14px; font-weight: 600; margin: 0;
  font-variant-numeric: tabular-nums; letter-spacing: -0.01em;
  display: inline-flex; align-items: center; gap: 2px;
}

/* ============ NEWS ============ */
.hp7-news { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
.hp7-news-card {
  display: grid; grid-template-columns: 80px 1fr auto; gap: 12px;
  padding: 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
}
.hp7-news-img {
  width: 80px; height: 80px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255, 255, 255, 0.95); flex-shrink: 0;
}
.hp7-img-building { background: linear-gradient(135deg, #6b7280, #374151); }
.hp7-img-oil { background: linear-gradient(135deg, #d97706, #92400e); }
.hp7-img-dollar { background: linear-gradient(135deg, #16a34a, #14532d); }
.hp7-img-mining { background: linear-gradient(135deg, #92400e, #44403c); }
.hp7-news-body { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.hp7-news-h { font-size: 13px; font-weight: 600; line-height: 1.3; color: var(--text-heading); margin: 0; letter-spacing: -0.01em; }
.hp7-news-flag {
  display: inline-block; padding: 2px 8px; border-radius: 999px;
  font-size: 10px; font-weight: 600; align-self: flex-start;
  letter-spacing: 0.01em;
}
.hp7-news-flag.sev-high {
  background: color-mix(in srgb, var(--brand-negative) 12%, transparent);
  color: var(--brand-negative);
}
.hp7-news-flag.sev-medium {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
}
.hp7-news-flag.sev-positive {
  background: color-mix(in srgb, var(--brand-positive) 14%, transparent);
  color: var(--brand-positive);
}
.hp7-news-impacted {
  font-size: 11px; color: var(--text-muted); margin: 4px 0 0; line-height: 1.4;
}
.hp7-news-impacted span { font-weight: 600; }
.hp7-news-affected {
  font-size: 11px; color: var(--text-muted); margin: 2px 0 0;
}
.hp7-news-right {
  display: flex; flex-direction: column; gap: 8px;
  align-items: stretch; justify-content: space-between;
  min-width: 96px;
}
.hp7-news-imp-card {
  padding: 8px 10px; border-radius: 10px;
  text-align: center;
}
.hp7-news-imp-card.sev-high { background: color-mix(in srgb, var(--brand-negative) 8%, transparent); }
.hp7-news-imp-card.sev-medium { background: color-mix(in srgb, var(--brand-primary) 7%, transparent); }
.hp7-news-imp-card.sev-positive { background: color-mix(in srgb, var(--brand-positive) 8%, transparent); }
.hp7-news-imp-amt {
  font-size: 13px; font-weight: 600; margin: 0;
  font-variant-numeric: tabular-nums; letter-spacing: -0.01em;
}
.hp7-news-imp-card.sev-high .hp7-news-imp-amt,
.hp7-news-imp-card.sev-high .hp7-news-imp-pct { color: var(--brand-negative); }
.hp7-news-imp-card.sev-medium .hp7-news-imp-amt,
.hp7-news-imp-card.sev-medium .hp7-news-imp-pct { color: var(--brand-negative); }
.hp7-news-imp-card.sev-positive .hp7-news-imp-amt,
.hp7-news-imp-card.sev-positive .hp7-news-imp-pct { color: var(--brand-positive); }
.hp7-news-imp-pct {
  font-size: 11px; margin: 2px 0 0; font-variant-numeric: tabular-nums;
  display: inline-flex; align-items: center; gap: 2px; justify-content: center;
}
.hp7-news-cta {
  display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  padding: 6px 10px; background: transparent;
  border: 1px solid var(--border-default); border-radius: 8px;
  font-family: inherit; font-size: 10px; line-height: 1.2;
  color: var(--text-heading); cursor: pointer;
  font-weight: 500; text-align: center;
}
.hp7-news-cta:hover { border-color: var(--brand-primary); color: var(--brand-primary); }

/* hp7-asset-* removidos — substituídos pela tabela hp9-table acima */

/* ============ IA CHIPS ============ */
.hp7-ia-chips { list-style: none; padding: 0; margin: 0 0 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.hp7-ia-chip {
  font-family: inherit; font-size: 11px; line-height: 1.3;
  padding: 10px 12px; border-radius: 12px;
  background: var(--bg-elevated);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
  color: var(--text-heading); cursor: pointer; text-align: center;
  font-weight: 500;
  transition: all 150ms;
  width: 100%;
}
.hp7-ia-chip:hover {
  background: color-mix(in srgb, var(--brand-primary) 6%, transparent);
  border-color: var(--brand-primary);
}

/* ============ DARK COMPOSER ============ */
.hp7-composer {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 14px 14px 18px;
  background: linear-gradient(135deg, var(--text-heading), #2a1a4a);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.7);
}
.hp7-composer-spark { color: var(--brand-primary); }
.hp7-composer-placeholder {
  flex: 1; font-size: 13px; margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}
.hp7-composer-btn {
  width: 36px; height: 36px; border-radius: 999px;
  background: #fff; color: var(--text-heading); border: 0;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
}

/* ============ RESUMO REDENTIA ============ */
.hp7-resumo {
  display: grid; grid-template-columns: 56px 1fr auto; gap: 16px; align-items: flex-start;
  padding: 20px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 5%, var(--bg-elevated)), var(--bg-elevated));
  border: 1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent);
  border-radius: 16px;
  margin-bottom: 36px;
}
.hp7-resumo-logo {
  display: inline-flex; align-items: center; justify-content: center;
  width: 56px; height: 56px; border-radius: 12px;
  background: var(--text-heading); color: var(--brand-primary);
  flex-shrink: 0;
}
.hp7-resumo-title {
  font-size: 14px; font-weight: 600; color: var(--text-heading);
  margin: 0 0 6px; letter-spacing: -0.005em;
}
.hp7-resumo-text {
  font-size: 13px; line-height: 1.55; color: var(--text-body); margin: 0 0 10px;
}
.hp7-resumo-link {
  display: inline-flex; align-items: center; gap: 4px;
  font-family: inherit; font-size: 12px; font-weight: 600;
  color: var(--brand-primary); background: transparent; border: 0;
  cursor: pointer; padding: 0;
}
.hp7-resumo-sparkle {
  display: inline-flex; align-items: center; justify-content: center;
  width: 56px; height: 56px; border-radius: 12px;
  background: linear-gradient(135deg, var(--text-heading), #2a1a4a);
  color: var(--brand-primary); flex-shrink: 0;
}

/* ============ HP9 MARKET — lead hero + secundários compactos ============ */
.hp9-market-hero {
  display: grid; grid-template-columns: 1fr; gap: 32px;
  margin: 0 0 48px;
  padding-top: 32px;
  border-top: 1px solid var(--border-subtle);
}
@media (min-width: 768px) {
  .hp9-market-hero {
    grid-template-columns: 1.1fr 1fr;
    gap: 64px;
    padding-top: 40px;
  }
}

/* LEAD: IBOV com mega number, ancorando a seção */
.hp9-market-lead {
  display: flex; flex-direction: column; gap: 4px;
}
.hp9-market-lead-label {
  font-size: 11px; color: var(--text-muted);
  letter-spacing: 0.14em; text-transform: uppercase;
  font-weight: 600; margin: 0;
}
.hp9-market-lead-val {
  font-size: clamp(40px, 5.5vw, 72px);
  font-weight: 300; color: var(--text-heading);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.035em; line-height: 1;
  margin: 8px 0 0;
}
.hp9-market-lead-pct {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 16px; font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  margin: 12px 0 0;
}

/* SECONDARY: 3 índices stacked com hairlines */
.hp9-market-secondary {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column;
  align-self: stretch; justify-content: center;
}
.hp9-market-sec {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 14px 0;
  border-bottom: 1px solid var(--border-subtle);
}
.hp9-market-sec:first-child { padding-top: 0; }
.hp9-market-sec:last-child { border-bottom: 0; padding-bottom: 0; }
.hp9-market-sec-lead {
  display: flex; align-items: center; gap: 12px;
  flex-shrink: 0;
}
.hp9-market-sec-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 8px;
  background: var(--bg-overlay);
  color: var(--text-muted);
  flex-shrink: 0;
}
.hp9-market-sec-label {
  font-size: 13px; color: var(--text-muted);
  font-weight: 500; margin: 0;
  letter-spacing: 0.01em;
}
.hp9-market-sec-row {
  display: flex; align-items: baseline; gap: 14px;
  font-variant-numeric: tabular-nums;
}
.hp9-market-sec-val {
  font-size: 17px; font-weight: 500; color: var(--text-heading);
  letter-spacing: -0.015em;
}
.hp9-market-sec-pct {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 13px; font-weight: 600;
  letter-spacing: -0.005em;
  min-width: 70px; justify-content: flex-end;
}

/* Maiores altas / baixas — 2-col com hairline */
.hp9-market-mvr {
  display: grid; grid-template-columns: 1fr; gap: 0;
}
@media (min-width: 768px) { .hp9-market-mvr { grid-template-columns: 1fr 1fr; } }
.hp9-market-mvr-col {
  padding: 0;
}
.hp9-market-mvr-col + .hp9-market-mvr-col {
  border-top: 1px solid var(--border-subtle);
  padding-top: 24px;
  margin-top: 24px;
}
@media (min-width: 768px) {
  .hp9-market-mvr-col:first-child {
    padding-right: 48px;
  }
  .hp9-market-mvr-col + .hp9-market-mvr-col {
    border-top: 0; padding-top: 0; margin-top: 0;
    border-left: 1px solid var(--border-subtle);
    padding-left: 48px;
  }
}
.hp9-market-mvr-h {
  font-size: clamp(20px, 1.6vw, 22px);
  font-weight: 400;
  color: var(--text-heading);
  letter-spacing: -0.015em;
  line-height: 1.25;
  margin: 0 0 20px;
}
.hp9-market-mvr-col ul { list-style: none; padding: 0; margin: 0; }
.hp9-market-mvr-col li {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-subtle);
  font-variant-numeric: tabular-nums;
}
.hp9-market-mvr-col li:last-child { border-bottom: 0; }
.hp9-market-mvr-tk {
  flex: 1;
  font-size: 16px; font-weight: 600;
  color: var(--text-heading); letter-spacing: 0.02em;
}
.hp9-market-mvr-pct {
  font-size: 16px; font-weight: 600;
  font-variant-numeric: tabular-nums; letter-spacing: -0.005em;
}

/* hp7-history-* removidos — substituídos por hp9-history-* acima */

/* Mobile-first scaling on smaller screens */
@media (max-width: 380px) {
  .hp7-news-card { grid-template-columns: 60px 1fr; }
  .hp7-news-right { grid-column: 1 / -1; flex-direction: row; align-items: center; min-width: 0; }
  .hp7-news-imp-card { flex: 1; }
  .hp7-news-cta { flex: 1; padding: 8px; }
  .hp7-asset { grid-template-columns: 28px 1fr auto; }
  .hp7-asset-spark, .hp7-asset-tag { display: none; }
}
</style>

<!--
  V3 — Editorial cream (inspirado em V1, identidade serif italic).

  Diferenças vs V1:
    1. Cream theme #FAF6EE com warm grays e amber honey-toned
    2. Display typography editorial — Instrument Serif italic em
       displays massive (h1 "Olá, andre.", patrimônio R$ 505k, "Curva intraday.")
    3. Topbar centralizado: R avatar | REDENTIA tracking 0.3em | bell outline
    4. Patrimônio HERO em serif italic huge amber + cents muted gray
    5. Impact card com light pink bg + red circle icon
    6. Factor chips pastel (amber/purple/peach) com dot + label + amount
    7. Sparkle ✨ divider hairline (editorial signature)
    8. Bottom nav flat 5-tab com underline TOP no active
    9. Sticky search bar bottom "Quem caiu hoje?" + ⌘K

  V1 base inalterada — overrides apenas em CSS tokens + Home redesign.

  ============ V1 ORIGINAL ============
  V8 — Responsivo (mobile + desktop em UMA arquivo só).

  ESTRATÉGIA RESPONSIVA:
    < 1024px (mobile/tablet) → shell 480px centered, amber flood hero
      com search embutido, floating menu glassmorphic bottom, asset
      list em linhas simples.
    ≥ 1024px (desktop)       → shell grid sidebar+main, sidebar 280px
      esquerda com nav agrupada, topbar com search pill, asset list
      vira TABELA real, grids 2/3-col aproveitam real estate.

  Data fontes:
    - useResultadoStats / useMockTrades (swing 12m + day 7d)
    - Carteira: composição donut + KPIs + lista ativos + proventos
    - Notificações Nubank carousel pattern
-->
<template>
  <div class="mx-shell">

    <!-- ============ SIDEBAR (desktop only) ============ -->
    <aside class="mx-sidebar">
      <div class="mx-logo">
        <span class="mx-logo-mark">R</span>
        <span class="mx-logo-name">redentia</span>
        <span class="mx-logo-tag">Beta</span>
      </div>

      <nav class="mx-sb-nav">
        <section v-for="g in navGroups" :key="g.label" class="mx-sb-group">
          <p class="mx-sb-h">{{ g.label }}</p>
          <button
            v-for="item in g.items"
            :key="item.label"
            class="mx-sb-item"
            :class="{ 'mx-sb-active': activeTab === item.label }"
            @click="setTab(item.label)"
          >
            <UIcon :name="item.icon" class="size-[18px]" />
            <span class="mx-sb-label">{{ item.label }}</span>
            <span v-if="item.badge" class="mx-sb-badge">{{ item.badge }}</span>
          </button>
        </section>
      </nav>

      <article class="mx-sb-pro">
        <span class="mx-sb-pro-tag">Redent Pro</span>
        <p class="mx-sb-pro-body">Análise institucional ao seu alcance.</p>
        <button class="mx-sb-pro-cta">Conhecer →</button>
      </article>

      <footer class="mx-sb-foot">
        <span class="mx-sb-avatar">A</span>
        <div class="mx-sb-foot-meta">
          <p class="mx-sb-foot-name">Andre Saraiva</p>
          <p class="mx-sb-foot-email">ai@8figureagency.co</p>
        </div>
        <UIcon name="i-lucide-chevrons-up-down" class="size-4 mx-sb-foot-chev" />
      </footer>
    </aside>

    <!-- ============ MAIN ============ -->
    <main class="mx-main">

      <!-- TOPBAR DESKTOP -->
      <header class="mx-topbar-d">
        <div class="mx-topbar-d-title">
          <p class="mx-eyebrow">{{ today }}</p>
          <h1 class="mx-page-title">{{ activeTab }}</h1>
        </div>
        <div class="mx-topbar-d-actions">
          <div class="mx-search-d">
            <UIcon name="i-lucide-sparkles" class="size-4 mx-search-d-icon" />
            <input type="search" placeholder="Pergunte ou pesquise..." />
            <kbd class="mx-kbd">⌘K</kbd>
          </div>
          <button class="mx-icon-d" aria-label="Notificações">
            <UIcon name="i-lucide-bell" class="size-5" />
            <span class="mx-icon-d-dot" />
          </button>
          <button class="mx-icon-d" aria-label="Configurações" @click="menuOpen = true">
            <UIcon name="i-lucide-settings" class="size-5" />
          </button>
        </div>
      </header>

      <!-- ============ ASSET DETAIL (drill-down) ============ -->
      <template v-if="activeAsset">
        <!-- Asset header com back -->
        <header class="mx-asset-head">
          <button class="mx-asset-back" @click="activeAsset = null">
            <UIcon name="i-lucide-chevron-left" class="size-5" />
            <span>Voltar</span>
          </button>
          <div class="mx-asset-head-meta">
            <span class="mx-asset-head-tag">{{ assetMeta(activeAsset).type }}</span>
            <span class="mx-mut">·</span>
            <span class="mx-mut">{{ assetMeta(activeAsset).sector }}</span>
          </div>
        </header>

        <!-- Hero do ativo (price + change + sparkline) -->
        <section class="mx-section">
          <div class="mx-wallet-card mx-asset-hero">
            <header class="mx-asset-hero-head">
              <span class="mx-asset-mark">{{ activeAsset.charAt(0) }}</span>
              <div>
                <p class="mx-asset-tk-big">{{ activeAsset }}</p>
                <p class="mx-asset-name">{{ assetMeta(activeAsset).name }}</p>
              </div>
            </header>
            <div class="mx-asset-hero-body">
              <div>
                <p class="mx-asset-price">{{ assetMock.price }}</p>
                <p class="mx-asset-delta" :class="assetMock.changePct >= 0 ? 'mx-pos' : 'mx-neg'">
                  <UIcon :name="assetMock.changePct >= 0 ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'" class="size-4" />
                  {{ Math.abs(assetMock.changePct).toFixed(2) }}%
                  <span class="mx-mut">· {{ assetMock.changeAbs }} hoje</span>
                </p>
              </div>
              <svg viewBox="0 0 200 60" preserveAspectRatio="none" class="mx-asset-spark">
                <path :d="sparkPath(assetMock.sparkline, 200, 60)" fill="none"
                      :stroke="assetMock.changePct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'"
                      stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
              </svg>
            </div>
            <dl class="mx-asset-quick">
              <div><dt>Abertura</dt><dd>{{ assetMock.open }}</dd></div>
              <div><dt>Máximo</dt><dd class="mx-pos">{{ assetMock.high }}</dd></div>
              <div><dt>Mínimo</dt><dd class="mx-neg">{{ assetMock.low }}</dd></div>
              <div><dt>Volume</dt><dd>{{ assetMock.volume }}</dd></div>
              <div><dt>Market cap</dt><dd>{{ assetMock.marketCap }}</dd></div>
              <div><dt>Fech. ant.</dt><dd>{{ assetMock.prevClose }}</dd></div>
            </dl>
          </div>
        </section>

        <!-- Cotação histórica chart com period selector -->
        <section class="mx-section">
          <div class="mx-wallet-card">
            <header class="mx-wallet-card-head">
              <div>
                <h3 class="mx-wallet-card-title">Cotação histórica</h3>
                <p class="mx-evolucao-deck">
                  <strong>{{ assetMock.price }}</strong>
                  <span :class="assetMock.changePct >= 0 ? 'mx-pos' : 'mx-neg'">
                    {{ assetMock.changePct >= 0 ? '↑' : '↓' }} {{ Math.abs(assetMock.changePct).toFixed(2) }}%
                  </span>
                  <span class="mx-mut">· últimos 12 meses</span>
                </p>
              </div>
              <div class="mx-evolucao-periods">
                <button v-for="(p, i) in chartPeriods" :key="p"
                        class="mx-evolucao-period"
                        :class="{ 'mx-evolucao-period-active': assetPeriodIdx === i }"
                        @click="assetPeriodIdx = i">{{ p }}</button>
              </div>
            </header>
            <div class="mx-evolucao-chart">
              <svg viewBox="0 0 800 220" preserveAspectRatio="none" class="mx-evolucao-svg">
                <defs>
                  <linearGradient id="mxAssetGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" :stop-color="assetMock.changePct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'" stop-opacity="0.32" />
                    <stop offset="100%" :stop-color="assetMock.changePct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <path :d="assetSvg.area" fill="url(#mxAssetGrad)" />
                <path :d="assetSvg.line" fill="none"
                      :stroke="assetMock.changePct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'"
                      stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
                <circle v-for="(c, i) in assetSvg.coords" :key="i"
                        :cx="c.x" :cy="c.y" r="3"
                        fill="var(--bg-elevated)"
                        :stroke="assetMock.changePct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'"
                        stroke-width="1.5" />
              </svg>
              <ul class="mx-evolucao-labels">
                <li v-for="p in assetMock.chartPoints" :key="p.label">{{ p.label }}</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Indicadores fundamentalistas (6 células) -->
        <section class="mx-section">
          <div class="mx-wallet-card">
            <header class="mx-wallet-card-head">
              <div>
                <h3 class="mx-wallet-card-title">Indicadores fundamentalistas</h3>
                <p class="mx-mut" style="margin: 2px 0 0; font-size: 13px;">Métricas de {{ activeAsset }} · última atualização disponível</p>
              </div>
            </header>
            <ul class="mx-fund-grid">
              <li v-for="f in assetMock.fundamentos" :key="f.label" class="mx-fund-cell"
                  :class="{ 'mx-fund-cell-hi': f.highlight }">
                <p class="mx-fund-label">{{ f.label }}</p>
                <p class="mx-fund-value" :class="{ 'mx-amber': f.highlight }">{{ f.value }}</p>
                <p class="mx-fund-tip">{{ f.tooltip }}</p>
              </li>
            </ul>
          </div>
        </section>

        <!-- Buy & Hold checklist + heatmap dividendos (2-col desktop) -->
        <section class="mx-grid mx-grid-2-d">
          <!-- Checklist -->
          <section class="mx-section">
            <div class="mx-wallet-card">
              <header class="mx-wallet-card-head">
                <div>
                  <h3 class="mx-wallet-card-title">Buy &amp; Hold</h3>
                  <p class="mx-checklist-deck">
                    Score <strong class="mx-pos">{{ assetMock.checklist.filter(c => c.pass === true).length }}</strong>
                    <span class="mx-mut">de {{ assetMock.checklist.length }} critérios</span>
                  </p>
                </div>
              </header>
              <ul class="mx-checklist">
                <li v-for="c in assetMock.checklist" :key="c.criteria" class="mx-checklist-row">
                  <span class="mx-checklist-icon"
                        :class="c.pass === true ? 'mx-cl-pass' : c.pass === false ? 'mx-cl-fail' : 'mx-cl-na'">
                    <UIcon :name="c.pass === true ? 'i-lucide-check' : c.pass === false ? 'i-lucide-x' : 'i-lucide-minus'" class="size-3" />
                  </span>
                  <div class="mx-checklist-body">
                    <p class="mx-checklist-criteria">{{ c.criteria }}</p>
                    <p class="mx-checklist-detail">{{ c.detail }}</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <!-- Dividend heatmap mensal -->
          <section class="mx-section">
            <div class="mx-wallet-card">
              <header class="mx-wallet-card-head">
                <div>
                  <h3 class="mx-wallet-card-title">Dividendos</h3>
                  <p class="mx-mut" style="margin: 2px 0 0; font-size: 13px;">Probabilidade mensal · baseline 10 anos</p>
                </div>
              </header>
              <ul class="mx-div-grid">
                <li v-for="d in assetMock.dividendMonths" :key="d.month" class="mx-div-cell"
                    :class="{ 'mx-div-cell-hi': d.highlight }">
                  <p class="mx-div-month">{{ d.month }}</p>
                  <p class="mx-div-pct">{{ d.pct }}%</p>
                  <div class="mx-div-bar"><span :style="{ width: d.pct + '%' }" /></div>
                  <p class="mx-div-value">{{ d.value }}</p>
                </li>
              </ul>
            </div>
          </section>
        </section>

        <!-- Sobre + Tese (2-col desktop) -->
        <section class="mx-grid mx-grid-2-d">
          <section class="mx-section">
            <div class="mx-wallet-card">
              <header class="mx-wallet-card-head">
                <h3 class="mx-wallet-card-title">Sobre {{ activeAsset }}</h3>
                <span class="mx-wallet-card-meta">{{ assetMeta(activeAsset).type }}</span>
              </header>
              <p class="mx-about-body">{{ assetMock.description }}</p>
              <dl class="mx-about-meta">
                <div><dt>Setor</dt><dd>{{ assetMeta(activeAsset).sector }}</dd></div>
                <div><dt>Categoria</dt><dd>{{ assetMeta(activeAsset).type }}</dd></div>
                <div><dt>Bolsa</dt><dd>B3 / NYSE</dd></div>
              </dl>
            </div>
          </section>

          <section class="mx-section">
            <div class="mx-wallet-card">
              <header class="mx-wallet-card-head">
                <h3 class="mx-wallet-card-title">Tese de investimento</h3>
              </header>
              <p class="mx-about-body">{{ assetMock.thesis }}</p>
            </div>
          </section>
        </section>

        <!-- Peers comparison table -->
        <section class="mx-section">
          <div class="mx-wallet-card">
            <header class="mx-wallet-card-head">
              <h3 class="mx-wallet-card-title">Comparação com pares</h3>
              <span class="mx-wallet-card-meta">{{ assetMock.peers.length }} ativos</span>
            </header>
            <table class="mx-asset-table">
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th class="mx-tn mx-r">P/L</th>
                  <th class="mx-tn mx-r">P/VP</th>
                  <th class="mx-tn mx-r">DY</th>
                  <th class="mx-tn mx-r">ROE</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in assetMock.peers" :key="p.ticker"
                    :class="{ 'mx-peer-hi': p.highlight }"
                    style="cursor: pointer"
                    @click="openAsset(p.ticker)">
                  <td><strong>{{ p.ticker }}</strong></td>
                  <td class="mx-tn mx-r">{{ p.pl }}</td>
                  <td class="mx-tn mx-r">{{ p.pvp }}</td>
                  <td class="mx-tn mx-r mx-amber">{{ p.dy }}</td>
                  <td class="mx-tn mx-r">{{ p.roe }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Notícias do ticker -->
        <section class="mx-section">
          <div class="mx-wallet-card">
            <header class="mx-wallet-card-head">
              <div>
                <h3 class="mx-wallet-card-title">Notícias de {{ activeAsset }}</h3>
                <p class="mx-mut" style="margin: 2px 0 0; font-size: 13px;">{{ assetMock.news.length }} manchetes nas últimas 24h</p>
              </div>
              <button class="mx-list-link">Ver todas</button>
            </header>
            <ul class="mx-mn-list">
              <li v-for="n in assetMock.news" :key="n.id" class="mx-mn-row">
                <p class="mx-mn-headline">{{ n.headline }}</p>
                <p class="mx-mn-meta"><span class="mx-mut">{{ n.source }} · {{ n.time }}</span></p>
              </li>
            </ul>
          </div>
        </section>
      </template>

      <!-- ============ INÍCIO ============ -->
      <template v-else-if="activeTab === 'Início'">
        <!-- ============ APPBAR (R seal | REDENTIA | bell) ============ -->
        <header class="v3h-appbar">
          <button class="v3h-seal" aria-label="Conta">R</button>
          <p class="v3h-appbar-title">Redentia</p>
          <button class="v3h-iconbtn" aria-label="Notificações">
            <UIcon name="i-lucide-bell" class="size-4" />
          </button>
        </header>

        <!-- ============ HERO greeting ============ -->
        <section class="v3h-hero">
          <p class="v3h-label-mono v3h-gold">Bem-vindo de volta</p>
          <h1 class="v3h-editorial-h">Olá, <span class="v3h-it">andre.</span></h1>
          <p class="v3h-body-sans">Veja o que realmente mexeu na sua carteira hoje.</p>
        </section>

        <!-- ============ PATRIMÔNIO display ============ -->
        <section class="v3h-patrim">
          <p class="v3h-label-mono">Sua carteira hoje</p>
          <span class="v3h-n-hero">R$ 505.206<span class="v3h-dec">,63</span></span>
          <p class="v3h-delta v3h-neg-c">
            <UIcon name="i-lucide-arrow-down" class="size-3.5" />
            −0,66%
            <span class="v3h-mut">· Hoje, <span class="v3h-neg-c">−R$ 3.370,97</span></span>
          </p>
        </section>

        <!-- ============ RIBBON Principal impacto ============ -->
        <article class="v3h-ribbon">
          <span class="v3h-ribbon-ic">↓</span>
          <p class="v3h-ribbon-text">
            <b>Principal impacto:</b> juros futuros pressionou <b>ITSA4</b> e <b>CPLE3</b> em <b class="v3h-neg-c">−R$ 2,07k</b>.
          </p>
        </article>

        <!-- ============ FACTOR pills row ============ -->
        <div class="v3h-pills-row">
          <span class="v3h-pill v3h-amber">
            <span class="v3h-dot" />
            Juros futuros
            <span class="v3h-dim">−R$ 2,07k</span>
          </span>
          <span class="v3h-pill v3h-lilac">
            <span class="v3h-dot" />
            Consumo doméstico
            <span class="v3h-dim">−R$ 499</span>
          </span>
          <span class="v3h-pill v3h-peach">
            <span class="v3h-dot" />
            Petróleo
            <span class="v3h-dim">−R$ 481</span>
          </span>
          <span class="v3h-pill">
            <span class="v3h-dot" />
            Câmbio
            <span class="v3h-dim">−R$ 218</span>
          </span>
          <span class="v3h-pill">
            <span class="v3h-dot" />
            Setor saúde
            <span class="v3h-dim">−R$ 96</span>
          </span>
        </div>

        <!-- Ornament ✦ -->
        <div class="v3h-ornament">
          <span class="v3h-ornament-line" />
          <span class="v3h-ornament-o">✦</span>
          <span class="v3h-ornament-line" />
        </div>

        <!-- ============ ATALHOS shortcuts row ============ -->
        <section class="v3h-pad">
          <p class="v3h-label-mono">Atalhos</p>
        </section>
        <div class="v3h-shortcuts">
          <button class="v3h-shortcut">
            <UIcon name="i-lucide-sparkles" class="size-5 v3h-shortcut-ic" />
            <span class="v3h-shortcut-lbl">Chat IA</span>
          </button>
          <button class="v3h-shortcut">
            <UIcon name="i-lucide-calculator" class="size-5 v3h-shortcut-ic" />
            <span class="v3h-shortcut-lbl">Calculadoras</span>
          </button>
          <button class="v3h-shortcut">
            <UIcon name="i-lucide-calendar" class="size-5 v3h-shortcut-ic" />
            <span class="v3h-shortcut-lbl">Calendário</span>
          </button>
          <button class="v3h-shortcut">
            <UIcon name="i-lucide-trophy" class="size-5 v3h-shortcut-ic" />
            <span class="v3h-shortcut-lbl">Rankings</span>
          </button>
          <button class="v3h-shortcut">
            <UIcon name="i-lucide-grid-2x2" class="size-5 v3h-shortcut-ic" />
            <span class="v3h-shortcut-lbl">Setores</span>
          </button>
          <button class="v3h-shortcut">
            <UIcon name="i-lucide-book" class="size-5 v3h-shortcut-ic" />
            <span class="v3h-shortcut-lbl">Guias</span>
          </button>
          <button class="v3h-shortcut">
            <UIcon name="i-lucide-building-2" class="size-5 v3h-shortcut-ic" />
            <span class="v3h-shortcut-lbl">Open Finance</span>
          </button>
        </div>

        <!-- Ornament -->
        <div class="v3h-ornament">
          <span class="v3h-ornament-line" />
          <span class="v3h-ornament-o">✦</span>
          <span class="v3h-ornament-line" />
        </div>

        <!-- ============ INTRADAY curve ============ -->
        <section class="v3h-pad">
          <p class="v3h-label-mono">O dia em um traço</p>
          <header class="v3h-intra-head">
            <h2 class="v3h-editorial-h-md">Curva <span class="v3h-it">intraday.</span></h2>
            <span class="v3h-n-sm v3h-neg-c">−0,66%</span>
          </header>
          <svg viewBox="0 0 800 160" preserveAspectRatio="none" class="v3h-intra-chart">
            <defs>
              <linearGradient id="v3hIntraGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="var(--neg)" stop-opacity="0.18" />
                <stop offset="100%" stop-color="var(--neg)" stop-opacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="80" x2="800" y2="80" stroke="var(--rule-2)" stroke-width="1" stroke-dasharray="3 5" opacity="0.5" />
            <path d="M0,28 L40,32 L80,42 L120,38 L160,52 L200,58 L240,54 L280,68 L320,74 L360,72 L400,86 L440,92 L480,98 L520,108 L560,118 L600,122 L640,136 L680,144 L720,148 L760,152 L800,158 L800,160 L0,160 Z" fill="url(#v3hIntraGrad)" />
            <path d="M0,28 L40,32 L80,42 L120,38 L160,52 L200,58 L240,54 L280,68 L320,74 L360,72 L400,86 L440,92 L480,98 L520,108 L560,118 L600,122 L640,136 L680,144 L720,148 L760,152 L800,158"
                  fill="none" stroke="var(--neg)" stroke-width="2"
                  stroke-linejoin="round" stroke-linecap="round" />
          </svg>
          <dl class="v3h-intra-stats">
            <div class="v3h-intra-stat">
              <span class="v3h-label-mono">Abertura</span>
              <span class="v3h-intra-stat-val">10:00</span>
            </div>
            <div class="v3h-intra-stat v3h-center">
              <span class="v3h-label-mono">Pior</span>
              <span class="v3h-intra-stat-val v3h-neg-c">−2,3%</span>
            </div>
            <div class="v3h-intra-stat v3h-center">
              <span class="v3h-label-mono">Fech.</span>
              <span class="v3h-intra-stat-val v3h-neg-c">−0,66%</span>
            </div>
            <div class="v3h-intra-stat">
              <span class="v3h-label-mono">Δ vs IBOV</span>
              <span class="v3h-intra-stat-val v3h-pos-c">+0,89 p.p.</span>
            </div>
          </dl>
        </section>

        <!-- Ornament -->
        <div class="v3h-ornament">
          <span class="v3h-ornament-line" />
          <span class="v3h-ornament-o">✦</span>
          <span class="v3h-ornament-line" />
        </div>

        <!-- ============ PRÓXIMOS proventos ============ -->
        <section class="v3h-pad">
          <p class="v3h-label-mono">Próximos proventos</p>
          <h3 class="v3h-editorial-h-md" style="margin-top: 4px;">5 pagamentos previstos</h3>
          <span class="v3h-n-hero">R$ 662<span class="v3h-dec">,50</span></span>
          <ul class="v3h-events">
            <li class="v3h-ev">
              <div class="v3h-ev-date"><span class="v3h-ev-d">22</span><span class="v3h-ev-m">mai</span></div>
              <div><span class="v3h-ev-tk">BBAS3</span><span class="v3h-tag v3h-tag-div">DIV</span></div>
              <span class="v3h-ev-amount">+R$ 84,20</span>
            </li>
            <li class="v3h-ev">
              <div class="v3h-ev-date"><span class="v3h-ev-d">28</span><span class="v3h-ev-m">mai</span></div>
              <div><span class="v3h-ev-tk">PETR4</span><span class="v3h-tag v3h-tag-jcp">JCP</span></div>
              <span class="v3h-ev-amount">+R$ 240,50</span>
            </li>
            <li class="v3h-ev">
              <div class="v3h-ev-date"><span class="v3h-ev-d">5</span><span class="v3h-ev-m">jun</span></div>
              <div><span class="v3h-ev-tk">HGLG11</span><span class="v3h-tag v3h-tag-div">DIV</span></div>
              <span class="v3h-ev-amount">+R$ 102,40</span>
            </li>
            <li class="v3h-ev">
              <div class="v3h-ev-date"><span class="v3h-ev-d">12</span><span class="v3h-ev-m">jun</span></div>
              <div><span class="v3h-ev-tk">ITSA4</span><span class="v3h-tag v3h-tag-jcp">JCP</span></div>
              <span class="v3h-ev-amount">+R$ 145,80</span>
            </li>
          </ul>
        </section>

        <!-- Ornament -->
        <div class="v3h-ornament">
          <span class="v3h-ornament-line" />
          <span class="v3h-ornament-o">✦</span>
          <span class="v3h-ornament-line" />
        </div>

        <!-- ============ MOVIMENTOS do dia ============ -->
        <section class="v3h-pad">
          <p class="v3h-label-mono">Movimentos do dia</p>
          <h3 class="v3h-editorial-h-md" style="margin-top: 4px;">Quem subiu, quem <span class="v3h-it">caiu.</span></h3>
          <div class="v3h-movers">
            <div>
              <p class="v3h-label-mono v3h-pos">Altas</p>
              <ul class="v3h-movers-list">
                <li class="v3h-mover-row"><div class="v3h-mover-left"><span class="v3h-asset">P</span><span class="v3h-mover-tk">PETR4</span></div><span class="v3h-mover-pct v3h-pos-c">+2,14%</span></li>
                <li class="v3h-mover-row"><div class="v3h-mover-left"><span class="v3h-asset">V</span><span class="v3h-mover-tk">VALE3</span></div><span class="v3h-mover-pct v3h-pos-c">+1,32%</span></li>
                <li class="v3h-mover-row"><div class="v3h-mover-left"><span class="v3h-asset">H</span><span class="v3h-mover-tk">HGLG11</span></div><span class="v3h-mover-pct v3h-pos-c">+0,84%</span></li>
              </ul>
            </div>
            <div>
              <p class="v3h-label-mono">Quedas</p>
              <ul class="v3h-movers-list">
                <li class="v3h-mover-row"><div class="v3h-mover-left"><span class="v3h-asset">I</span><span class="v3h-mover-tk">ITSA4</span></div><span class="v3h-mover-pct v3h-neg-c">−2,41%</span></li>
                <li class="v3h-mover-row"><div class="v3h-mover-left"><span class="v3h-asset">C</span><span class="v3h-mover-tk">CPLE3</span></div><span class="v3h-mover-pct v3h-neg-c">−1,87%</span></li>
                <li class="v3h-mover-row"><div class="v3h-mover-left"><span class="v3h-asset">F</span><span class="v3h-mover-tk">FLRY3</span></div><span class="v3h-mover-pct v3h-neg-c">−1,12%</span></li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Ornament -->
        <div class="v3h-ornament">
          <span class="v3h-ornament-line" />
          <span class="v3h-ornament-o">✦</span>
          <span class="v3h-ornament-line" />
        </div>

        <!-- ============ CURADORIA notícias ============ -->
        <section class="v3h-pad">
          <p class="v3h-label-mono">Curadoria · 4 notícias</p>
          <h3 class="v3h-editorial-h-md" style="margin-top: 4px;">O que <span class="v3h-it">ler hoje.</span></h3>
          <p class="v3h-body-sans">Filtramos só o que mexe com a sua carteira.</p>
          <ul class="v3h-news-list">
            <li class="v3h-news-card">
              <p class="v3h-news-meta"><span>Valor</span><span>· 2h</span></p>
              <p class="v3h-news-headline">Curva de juros longa volta a abrir após ata do Copom</p>
              <p class="v3h-news-tags"><span class="v3h-news-tag">ITSA4</span><span class="v3h-news-tag">CPLE3</span></p>
            </li>
            <li class="v3h-news-card">
              <p class="v3h-news-meta"><span>InfoMoney</span><span>· 5h</span></p>
              <p class="v3h-news-headline">Brent +3,2% com tensão no Oriente Médio reaviva petróleo</p>
              <p class="v3h-news-tags"><span class="v3h-news-tag">PETR4</span></p>
            </li>
            <li class="v3h-news-card">
              <p class="v3h-news-meta"><span>Bloomberg</span><span>· 6h</span></p>
              <p class="v3h-news-headline">Vacância de logístico cai a 9% e CRI volta a aquecer</p>
              <p class="v3h-news-tags"><span class="v3h-news-tag">HGLG11</span><span class="v3h-news-tag">KNRI11</span></p>
            </li>
            <li class="v3h-news-card">
              <p class="v3h-news-meta"><span>Estadão</span><span>· 9h</span></p>
              <p class="v3h-news-headline">Minério de ferro encerra semana acima de US$ 110</p>
              <p class="v3h-news-tags"><span class="v3h-news-tag">VALE3</span></p>
            </li>
          </ul>
          <button class="v3h-btn-ghost" style="margin-top: 14px;">Ver todas →</button>
        </section>

        <!-- Ornament -->
        <div class="v3h-ornament">
          <span class="v3h-ornament-line" />
          <span class="v3h-ornament-o">✦</span>
          <span class="v3h-ornament-line" />
        </div>

        <!-- ============ SUGESTÕES da IA · 3 passos ============ -->
        <section class="v3h-pad">
          <p class="v3h-label-mono v3h-gold">Sugestões da IA · maio</p>
          <h3 class="v3h-editorial-h-md" style="margin-top: 4px;">Três passos <span class="v3h-it">pra cuidar.</span></h3>
          <p class="v3h-body-sans">Curadas pela Redent.IA com base na sua carteira atual.</p>
          <ul class="v3h-sug-list">
            <li class="v3h-sug">
              <span class="v3h-sug-num">I.</span>
              <div>
                <p class="v3h-sug-title">Reduzir exposição bancária</p>
                <p class="v3h-sug-body">ITUB4 + BBDC4 somam 18% das ações BR — acima do alvo de 12%.</p>
                <button class="v3h-pill-outline">rebalancear →</button>
              </div>
            </li>
            <li class="v3h-sug">
              <span class="v3h-sug-num">II.</span>
              <div>
                <p class="v3h-sug-title">Aproveitar CDB 112% CDI</p>
                <p class="v3h-sug-body">Banco emissor com rating AAA, liquidez diária e isenção de IR no curto.</p>
                <button class="v3h-pill-outline">ver oferta →</button>
              </div>
            </li>
            <li class="v3h-sug">
              <span class="v3h-sug-num">III.</span>
              <div>
                <p class="v3h-sug-title">Aumentar FIIs de papel</p>
                <p class="v3h-sug-body">Spread CDI+ acima da média histórica; bom momento de entrada.</p>
                <button class="v3h-pill-outline">simular →</button>
              </div>
            </li>
          </ul>
        </section>

        <!-- Ornament -->
        <div class="v3h-ornament">
          <span class="v3h-ornament-line" />
          <span class="v3h-ornament-o">✦</span>
          <span class="v3h-ornament-line" />
        </div>

        <!-- ============ BENCHMARKS ============ -->
        <section class="v3h-pad">
          <p class="v3h-label-mono">Mês até agora</p>
          <header class="v3h-intra-head">
            <h3 class="v3h-editorial-h-md">Frente aos <span class="v3h-it">benchmarks.</span></h3>
            <span class="v3h-n-sm v3h-pos-c">+1,2pp</span>
          </header>
          <svg viewBox="0 0 800 50" preserveAspectRatio="none" class="v3h-bench-chart">
            <path d="M0,32 L80,30 L160,28 L240,25 L320,22 L400,20 L480,17 L560,14 L640,10 L720,8 L800,5"
                  fill="none" stroke="var(--gold)" stroke-width="2" stroke-linejoin="round" />
            <path d="M0,38 L80,36 L160,35 L240,33 L320,30 L400,28 L480,26 L560,23 L640,21 L720,18 L800,16"
                  fill="none" stroke="var(--ink-2)" stroke-width="1.5" stroke-linejoin="round" opacity="0.4" stroke-dasharray="2 3" />
            <path d="M0,42 L80,40 L160,38 L240,36 L320,33 L400,31 L480,29 L560,27 L640,25 L720,23 L800,20"
                  fill="none" stroke="var(--mut-2)" stroke-width="1.5" stroke-linejoin="round" opacity="0.4" stroke-dasharray="2 3" />
          </svg>
          <div class="v3h-bench-row">
            <span class="v3h-bench-item"><span class="v3h-ldot" /><span>Você</span><span class="v3h-pos-c"><strong>+2,4%</strong></span></span>
            <span class="v3h-bench-item"><span class="v3h-ldot" /><span class="v3h-mut">IBOV</span><span class="v3h-pos-c">+1,2%</span></span>
            <span class="v3h-bench-item"><span class="v3h-ldot" /><span class="v3h-mut">CDI</span><span class="v3h-pos-c">+0,9%</span></span>
          </div>
        </section>

        <!-- Ornament -->
        <div class="v3h-ornament">
          <span class="v3h-ornament-line" />
          <span class="v3h-ornament-o">✦</span>
          <span class="v3h-ornament-line" />
        </div>

        <!-- ============ HIGHLIGHT panel Raio-X ============ -->
        <article class="v3h-highlight">
          <div class="v3h-highlight-body">
            <p class="v3h-label-mono v3h-gold">Análise completa</p>
            <h3 class="v3h-editorial-h" style="font-size: clamp(36px, 8vw, 52px); margin: 8px 0 0;">Raio-X <span class="v3h-it">da carteira.</span></h3>
            <p class="v3h-body-sans">Aprofunde nas 9 dimensões, veja onde estão os riscos e receba um plano em texto corrido.</p>
            <div style="display: flex; align-items: center; gap: 16px; margin-top: 16px; flex-wrap: wrap;">
              <button class="v3h-btn-gold">
                <UIcon name="i-lucide-radar" class="size-4" />
                Refazer análise
              </button>
              <span class="v3h-label-mono">Última: 3d atrás</span>
            </div>
          </div>
        </article>

        <!-- ============ CARTA mensal ============ -->
        <article class="v3h-carta">
          <div>
            <p class="v3h-label-mono v3h-gold">Edição IV · novembro</p>
            <h3 class="v3h-editorial-h-sm" style="margin: 6px 0 0;">Sua carta <span class="v3h-it">já chegou.</span></h3>
            <p class="v3h-body-sans">Análise do mês, dividendos previstos e 3 sugestões pra ajustar sem se afobar.</p>
            <button class="v3h-btn-ghost" style="margin-top: 12px;">Ler agora →</button>
          </div>
          <span class="v3h-seal-ring">RDT</span>
        </article>

        <!-- Spacer pra search + tabbar -->
        <div style="height: 200px;" aria-hidden="true"></div>

        <!-- ============ SEARCH FAB sticky ============ -->
        <button class="v3h-search-fab">
          <UIcon name="i-lucide-search" class="size-4" style="color: var(--mut);" />
          <span class="v3h-search-fab-ph">Quem caiu hoje?</span>
          <span class="v3h-search-fab-kbd">⌘K</span>
        </button>

        <!-- ============ TABBAR 5 tabs ============ -->
        <nav class="v3h-tabbar">
          <div class="v3h-tab-wrap">
            <span class="v3h-tab-active-bar" />
            <button class="v3h-tab v3h-tab-active">
              <UIcon name="i-lucide-clock-3" class="size-5" />
              <span class="v3h-tab-lbl">Hoje</span>
            </button>
          </div>
          <div class="v3h-tab-wrap">
            <button class="v3h-tab" @click="setTab('Carteira')">
              <UIcon name="i-lucide-wallet" class="size-5" />
              <span class="v3h-tab-lbl">Carteira</span>
            </button>
          </div>
          <div class="v3h-tab-wrap">
            <button class="v3h-tab" @click="setTab('Raio-X')">
              <UIcon name="i-lucide-compass" class="size-5" />
              <span class="v3h-tab-lbl">Raio-X</span>
            </button>
          </div>
          <div class="v3h-tab-wrap">
            <button class="v3h-tab" @click="setTab('Carta')">
              <UIcon name="i-lucide-mail" class="size-5" />
              <span class="v3h-tab-lbl">Carta</span>
            </button>
          </div>
          <div class="v3h-tab-wrap">
            <button class="v3h-tab" @click="setTab('Chat')">
              <UIcon name="i-lucide-message-circle" class="size-5" />
              <span class="v3h-tab-lbl">Chat</span>
            </button>
          </div>
        </nav>
      </template>
      <!-- ============ CARTEIRA (Figma blueprint editorial) ============ -->
      <template v-else-if="activeTab === 'Carteira'">
        <header class="v3h-appbar">
          <button class="v3h-seal" aria-label="Conta">R</button>
          <p class="v3h-appbar-title">Redentia</p>
          <button class="v3h-iconbtn" aria-label="Notificações">
            <UIcon name="i-lucide-bell" class="size-4" />
          </button>
        </header>

        <section class="v3h-hero">
          <p class="v3h-label-mono v3h-gold">Sua carteira · 2 bancos sincronizados</p>
          <h1 class="v3h-editorial-h" style="font-size: clamp(40px, 9vw, 60px);">
            Patrimônio hoje, projeções e <span class="v3h-it">renda passiva.</span>
          </h1>
          <p class="v3h-body-sans">
            29 ativos sincronizados via Open Finance. Análise IA, Raio-X em 9 dimensões e curva comparada com IBOV.
          </p>
          <div class="v3h-mini-pills">
            <span class="v3h-mini-pill"><span class="v3h-mini-dot v3h-mini-dot-gold" />100% Open Finance</span>
            <span class="v3h-mini-pill">Sync 3d</span>
            <span class="v3h-mini-pill">3 classes</span>
          </div>
        </section>

        <section class="v3h-patrim">
          <p class="v3h-label-mono">Patrimônio total · 19 de mai. de 2026</p>
          <span class="v3h-n-hero">R$ 509.867</span>
          <p class="v3h-delta v3h-neg-c">
            <UIcon name="i-lucide-arrow-down" class="size-3.5" />
            −1,20%
            <span class="v3h-mut">· −R$ 6.360,50 desde jan/25</span>
          </p>
          <button class="v3h-btn-gold" style="margin-top: 16px;">
            <UIcon name="i-lucide-play" class="size-4" />
            Ver Highlights
          </button>
        </section>

        <section class="v3h-pad" style="margin-top: 22px;">
          <div class="v3h-stats-grid">
            <div class="v3h-stat-card">
              <p class="v3h-label-mono">Resultado</p>
              <p class="v3h-stat-val v3h-pos-c">+R$ 8.420</p>
              <p class="v3h-label-mono">12 meses</p>
            </div>
            <div class="v3h-stat-card">
              <p class="v3h-label-mono">Renda projetada 12m</p>
              <p class="v3h-stat-val">R$ 8,7k</p>
              <p class="v3h-label-mono">dividendos + JCP</p>
            </div>
            <div class="v3h-stat-card">
              <p class="v3h-label-mono">Redentia Score</p>
              <p class="v3h-stat-val">76<span class="v3h-mut" style="font-size: 0.5em;">/100</span></p>
              <p class="v3h-label-mono">9 dimensões</p>
            </div>
            <div class="v3h-stat-card">
              <p class="v3h-label-mono">Ativos</p>
              <p class="v3h-stat-val">29</p>
              <p class="v3h-label-mono">3 classes</p>
            </div>
          </div>
        </section>

        <div class="v3h-ornament">
          <span class="v3h-ornament-line" />
          <span class="v3h-ornament-o">✦</span>
          <span class="v3h-ornament-line" />
        </div>

        <section class="v3h-pad">
          <p class="v3h-label-mono">Composição · por classe</p>
          <h3 class="v3h-editorial-h-md" style="margin-top: 4px;">Por <span class="v3h-it">classe.</span></h3>
          <ul class="v3h-composicao-list">
            <li class="v3h-comp-row">
              <span class="v3h-comp-tag v3h-amber"><span class="v3h-dot" />STOCK</span>
              <div class="v3h-comp-bar"><span style="width: 41.1%; background: var(--gold);" /></div>
              <div class="v3h-comp-val">
                <span class="v3h-comp-val-money">R$ 209,3</span>
                <span class="v3h-comp-val-pct">41.1%</span>
              </div>
            </li>
            <li class="v3h-comp-row">
              <span class="v3h-comp-tag v3h-lilac"><span class="v3h-dot" />REIT</span>
              <div class="v3h-comp-bar"><span style="width: 39.5%; background: var(--chip-lilac-ink);" /></div>
              <div class="v3h-comp-val">
                <span class="v3h-comp-val-money">R$ 201,3</span>
                <span class="v3h-comp-val-pct">39.5%</span>
              </div>
            </li>
            <li class="v3h-comp-row">
              <span class="v3h-comp-tag v3h-peach"><span class="v3h-dot" />TREASURY</span>
              <div class="v3h-comp-bar"><span style="width: 19.5%; background: var(--chip-peach-ink);" /></div>
              <div class="v3h-comp-val">
                <span class="v3h-comp-val-money">R$ 99,3</span>
                <span class="v3h-comp-val-pct">19.5%</span>
              </div>
            </li>
          </ul>
        </section>

        <div class="v3h-ornament">
          <span class="v3h-ornament-line" />
          <span class="v3h-ornament-o">✦</span>
          <span class="v3h-ornament-line" />
        </div>

        <section class="v3h-pad">
          <p class="v3h-label-mono">Patrimônio · 90 dias</p>
          <header class="v3h-intra-head">
            <h3 class="v3h-editorial-h-md">Evolução <span class="v3h-it">no período.</span></h3>
            <span class="v3h-n-sm v3h-pos-c">+15,9%</span>
          </header>
          <div class="v3h-period-pills">
            <button class="v3h-period-pill">30d</button>
            <button class="v3h-period-pill v3h-period-pill-active">90d</button>
            <button class="v3h-period-pill">6m</button>
            <button class="v3h-period-pill">12m</button>
            <button class="v3h-period-pill">Tudo</button>
          </div>
          <svg viewBox="0 0 800 160" preserveAspectRatio="none" class="v3h-intra-chart">
            <defs>
              <linearGradient id="v3hCartGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="var(--gold)" stop-opacity="0.22" />
                <stop offset="100%" stop-color="var(--gold)" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,120 L60,118 L120,110 L180,105 L240,95 L300,88 L360,82 L420,75 L480,62 L540,55 L600,42 L660,35 L720,28 L800,18 L800,160 L0,160 Z" fill="url(#v3hCartGrad)" />
            <path d="M0,120 L60,118 L120,110 L180,105 L240,95 L300,88 L360,82 L420,75 L480,62 L540,55 L600,42 L660,35 L720,28 L800,18" fill="none" stroke="var(--gold)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
            <path d="M0,128 L60,126 L120,122 L180,120 L240,115 L300,112 L360,108 L420,104 L480,98 L540,95 L600,90 L660,86 L720,82 L800,78" fill="none" stroke="var(--mut-2)" stroke-width="1.5" stroke-linejoin="round" opacity="0.5" stroke-dasharray="3 4" />
          </svg>
          <div class="v3h-bench-row" style="margin-top: 10px;">
            <span class="v3h-bench-item"><span class="v3h-ldot" />Sua carteira <strong class="v3h-pos-c">+15,9%</strong></span>
            <span class="v3h-bench-item"><span class="v3h-ldot" />IBOV <span class="v3h-mut">+8,2%</span></span>
          </div>
        </section>

        <div class="v3h-ornament">
          <span class="v3h-ornament-line" />
          <span class="v3h-ornament-o">✦</span>
          <span class="v3h-ornament-line" />
        </div>

        <section class="v3h-pad">
          <p class="v3h-label-mono">Suas posições · 29 ativos</p>
          <header class="v3h-intra-head">
            <h3 class="v3h-editorial-h-md">Detalhe <span class="v3h-it">por ativo.</span></h3>
            <button class="v3h-btn-ghost">Expandir tudo</button>
          </header>
          <ul class="v3h-pos-groups">
            <li class="v3h-pos-group">
              <span class="v3h-pos-group-tag v3h-amber"><span class="v3h-dot" />Ações BR</span>
              <span class="v3h-pos-group-count v3h-mut">13 ativos</span>
              <span class="v3h-pos-group-pct v3h-neg-c">−0,90%</span>
              <UIcon name="i-lucide-chevron-down" class="size-4 v3h-pos-group-chev" />
            </li>
            <li class="v3h-pos-group">
              <span class="v3h-pos-group-tag v3h-lilac"><span class="v3h-dot" />FIIs</span>
              <span class="v3h-pos-group-count v3h-mut">13 ativos</span>
              <span class="v3h-pos-group-pct v3h-neg-c">−1,90%</span>
              <UIcon name="i-lucide-chevron-down" class="size-4 v3h-pos-group-chev" />
            </li>
            <li class="v3h-pos-group">
              <span class="v3h-pos-group-tag v3h-peach"><span class="v3h-dot" />Tesouro</span>
              <span class="v3h-pos-group-count v3h-mut">3 ativos</span>
              <span class="v3h-pos-group-pct v3h-neg-c">−0,60%</span>
              <UIcon name="i-lucide-chevron-down" class="size-4 v3h-pos-group-chev" />
            </li>
          </ul>
        </section>

        <div class="v3h-ornament">
          <span class="v3h-ornament-line" />
          <span class="v3h-ornament-o">✦</span>
          <span class="v3h-ornament-line" />
        </div>

        <section class="v3h-pad">
          <p class="v3h-label-mono">Renda passiva · 12 meses</p>
          <header class="v3h-intra-head">
            <h3 class="v3h-editorial-h-md">Projeção <span class="v3h-it">de proventos.</span></h3>
            <span class="v3h-label-mono">total R$ 8,7k</span>
          </header>
          <div class="v3h-renda-split">
            <span class="v3h-renda-pill"><span class="v3h-renda-dot" style="background: var(--gold);" />64,2% <span class="v3h-mut">Ações</span></span>
            <span class="v3h-renda-pill"><span class="v3h-renda-dot" style="background: var(--chip-lilac-ink);" />35,8% <span class="v3h-mut">Outros</span></span>
          </div>
          <div class="v3h-renda-chart">
            <div v-for="m in rendaPassiva" :key="m.month" class="v3h-renda-col">
              <div class="v3h-renda-bar-area">
                <div class="v3h-renda-bar" :class="{ 'v3h-renda-bar-hi': m.hi }" :style="{ height: m.pct + '%' }" />
              </div>
              <span class="v3h-renda-label">{{ m.month }}</span>
            </div>
          </div>
          <div class="v3h-renda-stats">
            <div class="v3h-renda-stat">
              <span class="v3h-label-mono">Maior mês</span>
              <span class="v3h-renda-stat-val">R$ 2,3k <span class="v3h-mut">jan</span></span>
            </div>
            <div class="v3h-renda-stat">
              <span class="v3h-label-mono">Média mensal</span>
              <span class="v3h-renda-stat-val">R$ 1,1k</span>
            </div>
            <div class="v3h-renda-stat">
              <span class="v3h-label-mono">Total 12m</span>
              <span class="v3h-renda-stat-val v3h-pos-c">R$ 12,7k</span>
            </div>
          </div>
        </section>

        <div class="v3h-ornament">
          <span class="v3h-ornament-line" />
          <span class="v3h-ornament-o">✦</span>
          <span class="v3h-ornament-line" />
        </div>

        <section class="v3h-pad">
          <p class="v3h-label-mono">Próximos 60 dias</p>
          <h3 class="v3h-editorial-h-md" style="margin-top: 4px;">6 pagamentos <span class="v3h-it">à caminho.</span></h3>
          <ul class="v3h-events" style="margin-top: 18px;">
            <li class="v3h-ev">
              <div class="v3h-ev-date"><span class="v3h-ev-d">14</span><span class="v3h-ev-m">mai</span></div>
              <div><span class="v3h-ev-tk">RANI3</span><span class="v3h-tag v3h-tag-div">Dividendo</span></div>
              <span class="v3h-ev-amount">+R$ 272,06</span>
            </li>
            <li class="v3h-ev">
              <div class="v3h-ev-date"><span class="v3h-ev-d">18</span><span class="v3h-ev-m">mai</span></div>
              <div><span class="v3h-ev-tk">MCCI11</span><span class="v3h-tag v3h-tag-div">Rendimento</span></div>
              <span class="v3h-ev-amount">+R$ 225,00</span>
            </li>
            <li class="v3h-ev">
              <div class="v3h-ev-date"><span class="v3h-ev-d">22</span><span class="v3h-ev-m">mai</span></div>
              <div><span class="v3h-ev-tk">CPTS11</span><span class="v3h-tag v3h-tag-div">Rendimento</span></div>
              <span class="v3h-ev-amount">+R$ 197,73</span>
            </li>
            <li class="v3h-ev">
              <div class="v3h-ev-date"><span class="v3h-ev-d">28</span><span class="v3h-ev-m">mai</span></div>
              <div><span class="v3h-ev-tk">TAEE11</span><span class="v3h-tag v3h-tag-div">Dividendo</span></div>
              <span class="v3h-ev-amount">+R$ 545,32</span>
            </li>
            <li class="v3h-ev">
              <div class="v3h-ev-date"><span class="v3h-ev-d">02</span><span class="v3h-ev-m">jun</span></div>
              <div><span class="v3h-ev-tk">VALE3</span><span class="v3h-tag v3h-tag-jcp">JCP</span></div>
              <span class="v3h-ev-amount">+R$ 25,04</span>
            </li>
            <li class="v3h-ev">
              <div class="v3h-ev-date"><span class="v3h-ev-d">10</span><span class="v3h-ev-m">jun</span></div>
              <div><span class="v3h-ev-tk">PETR4</span><span class="v3h-tag v3h-tag-jcp">JCP</span></div>
              <span class="v3h-ev-amount">+R$ 123,06</span>
            </li>
          </ul>
        </section>

        <div class="v3h-ornament">
          <span class="v3h-ornament-line" />
          <span class="v3h-ornament-o">✦</span>
          <span class="v3h-ornament-line" />
        </div>

        <article class="v3h-highlight">
          <div class="v3h-highlight-body">
            <p class="v3h-label-mono v3h-gold">Resultado · 12 meses</p>
            <h3 class="v3h-editorial-h" style="font-size: clamp(36px, 8vw, 52px); margin: 8px 0 0;">
              <span class="v3h-pos-c">+R$ 8.420</span> <span class="v3h-it">em 12 meses.</span>
            </h3>
            <p class="v3h-body-sans">
              Acima do IBOV em 4,8 pp e do CDI em 6,2 pp. Veja o detalhe consolidado por classe.
            </p>
            <button class="v3h-btn-gold" style="margin-top: 16px;">
              Ver mais
              <UIcon name="i-lucide-arrow-right" class="size-4" />
            </button>
          </div>
        </article>

        <div style="height: 200px;" aria-hidden="true"></div>

        <button class="v3h-search-fab">
          <UIcon name="i-lucide-search" class="size-4" style="color: var(--mut);" />
          <span class="v3h-search-fab-ph">Quem caiu hoje?</span>
          <span class="v3h-search-fab-kbd">⌘K</span>
        </button>

        <nav class="v3h-tabbar">
          <div class="v3h-tab-wrap">
            <button class="v3h-tab" @click="setTab('Início')">
              <UIcon name="i-lucide-clock-3" class="size-5" />
              <span class="v3h-tab-lbl">Hoje</span>
            </button>
          </div>
          <div class="v3h-tab-wrap">
            <span class="v3h-tab-active-bar" />
            <button class="v3h-tab v3h-tab-active">
              <UIcon name="i-lucide-wallet" class="size-5" />
              <span class="v3h-tab-lbl">Carteira</span>
            </button>
          </div>
          <div class="v3h-tab-wrap">
            <button class="v3h-tab" @click="setTab('Raio-X')">
              <UIcon name="i-lucide-compass" class="size-5" />
              <span class="v3h-tab-lbl">Raio-X</span>
            </button>
          </div>
          <div class="v3h-tab-wrap">
            <button class="v3h-tab" @click="setTab('Carta')">
              <UIcon name="i-lucide-mail" class="size-5" />
              <span class="v3h-tab-lbl">Carta</span>
            </button>
          </div>
          <div class="v3h-tab-wrap">
            <button class="v3h-tab" @click="setTab('Chat')">
              <UIcon name="i-lucide-message-circle" class="size-5" />
              <span class="v3h-tab-lbl">Chat</span>
            </button>
          </div>
        </nav>
      </template>

      <!-- ============ CARTA mensal (Figma blueprint) ============ -->
      <template v-else-if="activeTab === 'Carta'">
        <header class="v3h-appbar">
          <button class="v3h-seal" aria-label="Conta">R</button>
          <p class="v3h-appbar-title">Redentia</p>
          <button class="v3h-iconbtn" aria-label="Notificações">
            <UIcon name="i-lucide-bell" class="size-4" />
          </button>
        </header>

        <section class="v3h-carta-hero">
          <div class="v3h-carta-meta-row">
            <p class="v3h-label-mono v3h-gold">Edição IV · Outubro 2026</p>
            <p class="v3h-label-mono">SP · 04 out</p>
          </div>
          <h1 class="v3h-editorial-h" style="font-size: clamp(48px, 10vw, 72px); margin-top: 28px;">
            Caro <span class="v3h-it">André,</span>
          </h1>
          <p class="v3h-carta-body">
            Outubro tratou bem a sua carteira. O retorno no mês foi de
            <b class="v3h-pos-c">+4,82%</b>, à frente do IBOV em
            <b>1,84 ponto percentual</b> e do CDI em <b>3,21 pontos</b>.
            Os destaques vieram dos seus ativos de <b>commodities</b>
            e da alocação em <b>FIIs de papel</b>.
          </p>

          <div class="v3h-carta-stats">
            <div class="v3h-stat-card">
              <p class="v3h-label-mono">Retorno do mês</p>
              <p class="v3h-stat-val v3h-pos-c">+4,82%</p>
              <p class="v3h-label-mono">vs +3,0% IBOV</p>
            </div>
            <div class="v3h-stat-card">
              <p class="v3h-label-mono">Dividendos</p>
              <p class="v3h-stat-val">R$ 487</p>
              <p class="v3h-label-mono">recebidos out</p>
            </div>
            <div class="v3h-stat-card">
              <p class="v3h-label-mono">Fatos relevantes</p>
              <p class="v3h-stat-val">7</p>
              <p class="v3h-label-mono">na sua carteira</p>
            </div>
          </div>

          <p class="v3h-carta-body" style="margin-top: 28px;">
            Nesta edição da sua carta, você encontra a análise completa
            do mês, a curadoria de notícias que mexeram com seus ativos,
            os <b>dividendos que vão cair em novembro</b>, e três
            sugestões da nossa IA pra ajustar a carteira sem se afobar.
          </p>
        </section>

        <div class="v3h-ornament">
          <span class="v3h-ornament-line" />
          <span class="v3h-ornament-o">✦</span>
          <span class="v3h-ornament-line" />
        </div>

        <section class="v3h-pad">
          <p class="v3h-label-mono">Nesta edição</p>
          <ul class="v3h-toc">
            <li class="v3h-toc-item">
              <span class="v3h-toc-num">I.</span>
              <div class="v3h-toc-body">
                <p class="v3h-toc-title">Performance do mês</p>
                <p class="v3h-toc-sub">vs. IBOV, CDI &amp; IFIX</p>
              </div>
              <UIcon name="i-lucide-arrow-up-right" class="size-4 v3h-toc-arr" />
            </li>
            <li class="v3h-toc-item">
              <span class="v3h-toc-num">II.</span>
              <div class="v3h-toc-body">
                <p class="v3h-toc-title">Dividendos recebidos &amp; YTD</p>
                <p class="v3h-toc-sub">total R$ 4.620 no ano</p>
              </div>
              <UIcon name="i-lucide-arrow-up-right" class="size-4 v3h-toc-arr" />
            </li>
            <li class="v3h-toc-item">
              <span class="v3h-toc-num">III.</span>
              <div class="v3h-toc-body">
                <p class="v3h-toc-title">Eventos &amp; fatos relevantes</p>
                <p class="v3h-toc-sub">da carteira em outubro</p>
              </div>
              <UIcon name="i-lucide-arrow-up-right" class="size-4 v3h-toc-arr" />
            </li>
            <li class="v3h-toc-item">
              <span class="v3h-toc-num">IV.</span>
              <div class="v3h-toc-body">
                <p class="v3h-toc-title">Três sugestões da IA</p>
                <p class="v3h-toc-sub">pra próximo mês</p>
              </div>
              <UIcon name="i-lucide-arrow-up-right" class="size-4 v3h-toc-arr" />
            </li>
            <li class="v3h-toc-item">
              <span class="v3h-toc-num">V.</span>
              <div class="v3h-toc-body">
                <p class="v3h-toc-title">Calendário de novembro</p>
                <p class="v3h-toc-sub">datas-com &amp; pagamentos</p>
              </div>
              <UIcon name="i-lucide-arrow-up-right" class="size-4 v3h-toc-arr" />
            </li>
          </ul>
        </section>

        <div class="v3h-ornament">
          <span class="v3h-ornament-line" />
          <span class="v3h-ornament-o">✦</span>
          <span class="v3h-ornament-line" />
        </div>

        <article class="v3h-carta-closing">
          <div>
            <p class="v3h-carta-sign">Com afeto e disciplina,</p>
            <p class="v3h-editorial-h-sm" style="margin-top: 8px;">Redentia</p>
            <p class="v3h-body-sans" style="margin-top: 6px;">A IA que cuida da sua carteira</p>
          </div>
          <span class="v3h-seal-ring">RDT</span>
        </article>

        <div class="v3h-pad" style="margin-top: 28px;">
          <button class="v3h-btn-gold">
            Ler análise completa
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </button>
        </div>

        <div style="height: 200px;" aria-hidden="true"></div>

        <button class="v3h-search-fab">
          <UIcon name="i-lucide-search" class="size-4" style="color: var(--mut);" />
          <span class="v3h-search-fab-ph">Quem caiu hoje?</span>
          <span class="v3h-search-fab-kbd">⌘K</span>
        </button>

        <nav class="v3h-tabbar">
          <div class="v3h-tab-wrap">
            <button class="v3h-tab" @click="setTab('Início')">
              <UIcon name="i-lucide-clock-3" class="size-5" />
              <span class="v3h-tab-lbl">Hoje</span>
            </button>
          </div>
          <div class="v3h-tab-wrap">
            <button class="v3h-tab" @click="setTab('Carteira')">
              <UIcon name="i-lucide-wallet" class="size-5" />
              <span class="v3h-tab-lbl">Carteira</span>
            </button>
          </div>
          <div class="v3h-tab-wrap">
            <button class="v3h-tab" @click="setTab('Raio-X')">
              <UIcon name="i-lucide-compass" class="size-5" />
              <span class="v3h-tab-lbl">Raio-X</span>
            </button>
          </div>
          <div class="v3h-tab-wrap">
            <span class="v3h-tab-active-bar" />
            <button class="v3h-tab v3h-tab-active">
              <UIcon name="i-lucide-mail" class="size-5" />
              <span class="v3h-tab-lbl">Carta</span>
            </button>
          </div>
          <div class="v3h-tab-wrap">
            <button class="v3h-tab" @click="setTab('Chat')">
              <UIcon name="i-lucide-message-circle" class="size-5" />
              <span class="v3h-tab-lbl">Chat</span>
            </button>
          </div>
        </nav>
      </template>

      <!-- ============ RESULTADO (swing + day) ============ -->
      <template v-else-if="activeTab === 'Resultado'">
        <header class="mx-topbar-m mx-hide-d">
          <div class="mx-topbar-m-brand">
            <button class="mx-icon-btn mx-icon-back" aria-label="Voltar" @click="setTab('Início')">
              <UIcon name="i-lucide-chevron-left" class="size-5" />
            </button>
            <span class="mx-topbar-m-title">Resultado</span>
          </div>
          <div class="mx-topbar-m-icons">
            <button class="mx-icon-btn" aria-label="Menu" @click="menuOpen = true">
              <UIcon name="i-lucide-menu" class="size-5" />
            </button>
          </div>
        </header>

        <!-- Mode toggle Swing / Day -->
        <section class="mx-section mx-mode-section">
          <div class="mx-mode-toggle">
            <button
              class="mx-mode-btn"
              :class="{ 'mx-mode-btn-active': resultMode === 'swing' }"
              @click="resultMode = 'swing'"
            >
              <UIcon name="i-lucide-trending-up" class="size-4" />
              <span>Swing</span>
              <span class="mx-mode-cap">12m</span>
            </button>
            <button
              class="mx-mode-btn"
              :class="{ 'mx-mode-btn-active': resultMode === 'day' }"
              @click="resultMode = 'day'"
            >
              <UIcon name="i-lucide-zap" class="size-4" />
              <span>Day Trade</span>
              <span class="mx-mode-cap">7d</span>
            </button>
          </div>
        </section>

        <!-- Mega P&L flood (similar to patrimônio flood) -->
        <section class="mx-flood mx-flood-result">
          <p class="mx-flood-label">P&amp;L realizado · {{ activeResult.periodLabel }}</p>
          <p class="mx-flood-val" :class="activeResult.totalPnl >= 0 ? '' : 'mx-flood-neg'">
            {{ activeResult.totalPnl >= 0 ? '+' : '' }}{{ formatBRL(activeResult.totalPnl) }}
          </p>
          <p class="mx-flood-delta">
            <UIcon name="i-lucide-trending-up" class="size-3.5" />
            <strong>{{ activeResult.wins }} wins · {{ activeResult.losses }} losses</strong>
            <span class="mx-flood-delta-sub">· sequência {{ activeResult.longestWinStreak }} verdes</span>
          </p>
        </section>

        <!-- KPIs grid (3 cards) -->
        <section class="mx-grid mx-grid-3-d">
          <article class="mx-section">
            <div class="mx-wallet-card mx-kpi-result-card">
              <p class="mx-kpi-label">Profit factor</p>
              <p class="mx-kpi-val" :class="activeResult.profitFactor >= 2 ? 'mx-pos' : ''">
                {{ activeResult.profitFactor.toFixed(1) }}
              </p>
              <p class="mx-kpi-context mx-show-d">
                Razão ganho/perda. <strong>{{ activeResult.profitFactor >= 2 ? 'Forte.' : 'Em desenvolvimento.' }}</strong>
              </p>
            </div>
          </article>
          <article class="mx-section">
            <div class="mx-wallet-card mx-kpi-result-card">
              <p class="mx-kpi-label">Win rate</p>
              <p class="mx-kpi-val">{{ activeResult.winRate }}<span class="mx-kpi-suf">%</span></p>
              <p class="mx-kpi-context mx-show-d">
                <strong>{{ activeResult.wins }}</strong> de {{ activeResult.wins + activeResult.losses }} trades fechados positivos.
              </p>
            </div>
          </article>
          <article class="mx-section">
            <div class="mx-wallet-card mx-kpi-result-card">
              <p class="mx-kpi-label">R/R médio</p>
              <p class="mx-kpi-val">{{ activeResult.rrRatio }}</p>
              <p class="mx-kpi-context mx-show-d">
                Cada R$ {{ activeResult.rrRatio }} ganho pra cada R$ 1 perdido.
              </p>
            </div>
          </article>
        </section>

        <!-- Métricas avançadas (Sharpe / Sortino / Max DD / Recovery / Vol) -->
        <section class="mx-section">
          <div class="mx-wallet-card">
            <header class="mx-wallet-card-head">
              <h3 class="mx-wallet-card-title">Métricas avançadas</h3>
              <span class="mx-wallet-card-meta">{{ activeResult.periodLabel }}</span>
            </header>
            <dl class="mx-ext-kpis">
              <div>
                <dt>Sharpe</dt>
                <dd>{{ activeExtKpis.sharpe }}</dd>
              </div>
              <div>
                <dt>Sortino</dt>
                <dd>{{ activeExtKpis.sortino }}</dd>
              </div>
              <div>
                <dt>Max DD</dt>
                <dd class="mx-neg">{{ activeExtKpis.maxDD }}</dd>
              </div>
              <div>
                <dt>Recovery</dt>
                <dd class="mx-amber">{{ activeExtKpis.recovery }}</dd>
              </div>
              <div>
                <dt>Volatilidade</dt>
                <dd>{{ activeExtKpis.vol }}</dd>
              </div>
            </dl>
          </div>
        </section>

        <!-- Win/Loss donut + breakdown -->
        <section class="mx-section">
          <div class="mx-wallet-card">
            <header class="mx-wallet-card-head">
              <h3 class="mx-wallet-card-title">Vencedores vs. perdedores</h3>
              <span class="mx-wallet-card-meta">{{ activeResult.totalTrades }} trades</span>
            </header>
            <div class="mx-wl-grid">
              <svg viewBox="0 0 200 200" class="mx-wl-donut">
                <g transform="translate(100,100)">
                  <circle r="80" fill="none" stroke="var(--bg-base)" stroke-width="22" />
                  <circle r="80" fill="none" stroke="var(--brand-positive)" stroke-width="22"
                    :stroke-dasharray="`${(activeResult.wins / (activeResult.totalTrades || 1)) * 502.6} 502.6`"
                    transform="rotate(-90)" />
                  <circle r="80" fill="none" stroke="var(--brand-negative)" stroke-width="22"
                    :stroke-dasharray="`${(activeResult.losses / (activeResult.totalTrades || 1)) * 502.6} 502.6`"
                    :stroke-dashoffset="-((activeResult.wins / (activeResult.totalTrades || 1)) * 502.6)"
                    transform="rotate(-90)" />
                </g>
                <text x="100" y="98" text-anchor="middle" class="mx-wl-num">{{ activeResult.winRate }}%</text>
                <text x="100" y="118" text-anchor="middle" class="mx-wl-cap">acerto</text>
              </svg>
              <ul class="mx-wl-list">
                <li>
                  <span class="mx-wl-dot mx-pos-bg" />
                  <div class="mx-wl-info">
                    <p class="mx-wl-name">Vencedores</p>
                    <p class="mx-wl-sub">+{{ formatBRL(activeResult.winsValue) }} · média +{{ formatBRL(activeResult.avgWin) }}</p>
                  </div>
                  <p class="mx-wl-val mx-pos">{{ activeResult.wins }}</p>
                </li>
                <li>
                  <span class="mx-wl-dot mx-neg-bg" />
                  <div class="mx-wl-info">
                    <p class="mx-wl-name">Perdedores</p>
                    <p class="mx-wl-sub">{{ formatBRL(activeResult.lossesValue) }} · média {{ formatBRL(activeResult.avgLoss) }}</p>
                  </div>
                  <p class="mx-wl-val mx-neg">{{ activeResult.losses }}</p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Extremos -->
        <section class="mx-section">
          <div class="mx-wallet-card">
            <header class="mx-wallet-card-head">
              <h3 class="mx-wallet-card-title">Extremos do período</h3>
            </header>
            <div class="mx-extremes-grid">
              <div>
                <p class="mx-kpi-label">Maior win</p>
                <p class="mx-kpi-val mx-pos">+{{ formatBRL(activeResult.bestTrade) }}</p>
              </div>
              <div>
                <p class="mx-kpi-label">Maior loss</p>
                <p class="mx-kpi-val mx-neg">{{ formatBRL(activeResult.worstTrade) }}</p>
              </div>
              <div>
                <p class="mx-kpi-label">{{ resultMode === 'day' ? 'Holding médio' : 'Trade médio' }}</p>
                <p class="mx-kpi-val">{{ activeResult.holdingLabel }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Equity / Period chart -->
        <section class="mx-section">
          <div class="mx-wallet-card">
            <header class="mx-wallet-card-head">
              <h3 class="mx-wallet-card-title">{{ resultMode === 'swing' ? 'Curva mensal' : 'Performance por hora' }}</h3>
              <span class="mx-wallet-card-meta">{{ activeResult.periodLabel }}</span>
            </header>
            <div class="mx-equity-chart" :style="{ '--cols': activeResult.equity.length }">
              <div v-for="b in activeResult.equity" :key="b.label" class="mx-equity-col">
                <div class="mx-equity-area">
                  <div
                    class="mx-equity-bar"
                    :class="b.pnl < 0 ? 'mx-equity-bar-neg' : 'mx-equity-bar-pos'"
                    :style="{ height: (Math.abs(b.pnl) / activeResult.equityMaxAbs * 100) + '%' }"
                  />
                </div>
                <span class="mx-equity-label">{{ b.label }}</span>
              </div>
            </div>
            <p class="mx-equity-legend">
              <span class="mx-equity-legend-dot mx-pos-bg" /> positivo
              <span class="mx-equity-legend-dot mx-neg-bg" /> negativo
            </p>
          </div>
        </section>

        <!-- Heatmap mensal (6 meses, dia-a-dia) -->
        <section class="mx-section">
          <div class="mx-wallet-card">
            <header class="mx-wallet-card-head">
              <div>
                <h3 class="mx-wallet-card-title">Heatmap mensal</h3>
                <p class="mx-hm-deck">
                  <strong class="mx-pos">{{ heatmapStats.wins }} dias verdes</strong>
                  <span class="mx-mut">·</span>
                  <strong class="mx-neg">{{ heatmapStats.losses }} vermelhos</strong>
                  <span class="mx-mut">de {{ heatmapStats.total }} pregões</span>
                </p>
              </div>
              <span class="mx-wallet-card-meta">6 meses</span>
            </header>
            <div class="mx-hm-grid">
              <div v-for="m in heatmap" :key="m.month" class="mx-hm-row">
                <span class="mx-hm-month">{{ m.month }}</span>
                <div class="mx-hm-cells">
                  <span
                    v-for="d in m.days"
                    :key="`${m.month}-${d.day}`"
                    class="mx-hm-cell"
                    :class="`mx-hm-${heatmapLevel(d.pnl, d.weekend)}`"
                    :title="d.weekend ? `${d.day} ${m.month} · pregão fechado` : `${d.day} ${m.month} · ${d.pnl >= 0 ? '+' : ''}R$ ${d.pnl}`"
                  />
                </div>
              </div>
            </div>
            <div class="mx-hm-legend">
              <span class="mx-mut">Menos</span>
              <span class="mx-hm-cell mx-hm-loss-strong" />
              <span class="mx-hm-cell mx-hm-loss-soft" />
              <span class="mx-hm-cell mx-hm-flat" />
              <span class="mx-hm-cell mx-hm-win-soft" />
              <span class="mx-hm-cell mx-hm-win-mid" />
              <span class="mx-hm-cell mx-hm-win-strong" />
              <span class="mx-mut">Mais</span>
            </div>
          </div>
        </section>

        <!-- Top trades -->
        <section class="mx-section">
          <header class="mx-list-head">
            <h2 class="mx-section-h2 mx-list-h">Top trades do período</h2>
            <button class="mx-list-link">Ver todos</button>
          </header>
          <ul class="mx-trades-list">
            <li v-for="t in activeResult.topTrades" :key="t.id" class="mx-trade-row" @click="openAsset(t.ticker)">
              <span class="mx-trade-mark" :class="t.pnl >= 0 ? 'mx-trade-mark-pos' : 'mx-trade-mark-neg'">
                {{ t.ticker.charAt(0) }}
              </span>
              <div class="mx-trade-meta">
                <p class="mx-trade-tk">{{ t.ticker }}</p>
                <p class="mx-trade-sub">{{ t.timeLabel }} · {{ t.holdLabel }}</p>
              </div>
              <p class="mx-trade-pnl" :class="t.pnl >= 0 ? 'mx-pos' : 'mx-neg'">
                {{ t.pnl >= 0 ? '+' : '' }}{{ formatBRL(t.pnl) }}
              </p>
            </li>
          </ul>
        </section>
      </template>

      <!-- ============ HOJE ============ -->
      <template v-else-if="activeTab === 'Hoje'">
        <!-- HERO MOBILE: amber flood (mesmo padrão do Início) -->
        <section class="mx-hero-m">
          <header class="mx-topbar-m">
            <div class="mx-topbar-m-brand">
              <span class="mx-brand-mark">R</span>
              <span class="mx-brand-name">redentia</span>
              <span class="mx-brand-tag">Beta</span>
            </div>
            <div class="mx-topbar-m-icons">
              <button class="mx-icon-btn" aria-label="Notificações">
                <UIcon name="i-lucide-bell" class="size-5" />
                <span class="mx-badge">3</span>
              </button>
              <button class="mx-icon-btn" aria-label="Menu" @click="menuOpen = true">
                <UIcon name="i-lucide-menu" class="size-5" />
              </button>
            </div>
          </header>

          <p class="mx-greeting-m">Olá, <strong>Andre</strong>. <span class="mx-greeting-m-sub">Bom dia.</span></p>

          <div class="mx-search-wrap">
            <button class="mx-search-pill" aria-label="Pergunte ou pesquise">
              <UIcon name="i-lucide-sparkles" class="size-5 mx-search-icon" />
              <span class="mx-search-placeholder">Pergunte ou pesquise</span>
              <kbd class="mx-search-kbd">⌘K</kbd>
            </button>
          </div>
        </section>

        <!-- HERO DESKTOP (mesma estrutura do Início) -->
        <section class="mx-hero-d mx-show-d">
          <p class="mx-eyebrow">Bom dia</p>
          <h2 class="mx-hero-title">Olá, <span style="font-weight: 700">Andre</span>.</h2>
          <p class="mx-hero-sub">
            <strong>3 fatores</strong> impactaram sua carteira hoje. Análise completa abaixo.
          </p>
        </section>

        <!-- Pill banner: fatores que impactaram -->
        <section class="mx-section">
          <div class="mx-hoje-events-pill">
            <span class="mx-hoje-events-icon"><UIcon name="i-lucide-sparkles" class="size-4" /></span>
            <p class="mx-hoje-events-text"><strong>{{ causalFactors.length }} fatores</strong> impactaram sua carteira hoje</p>
            <ul class="mx-hoje-events-chips">
              <li v-for="c in causalFactors" :key="c.key" class="mx-hoje-chip" :class="`mx-hoje-chip-${c.key}`">
                <UIcon :name="c.icon" class="size-4" />
                <span>{{ c.label }}</span>
              </li>
            </ul>
          </div>
        </section>

        <!-- Sua carteira hoje (mega + curve, 2-col desktop) -->
        <section class="mx-grid mx-hoje-main">
          <!-- LEFT: mega value + lead reason + mini factors -->
          <article class="mx-section">
            <div class="mx-wallet-card mx-hoje-main-left">
              <header class="mx-wallet-card-head">
                <h3 class="mx-wallet-card-title">Sua carteira hoje</h3>
                <span class="mx-wallet-card-meta">{{ hojeTime }}</span>
              </header>
              <p class="mx-hoje-mega">R$ {{ hojeCarteira.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
              <p class="mx-hoje-delta">
                <span class="mx-hoje-delta-pct mx-neg">
                  <UIcon name="i-lucide-arrow-down" class="size-4" />
                  {{ Math.abs(hojeCarteira.dayChangePct).toFixed(2) }}%
                </span>
                <span class="mx-mut">· Hoje</span>
                <span class="mx-neg">−R$ {{ Math.abs(hojeCarteira.dayChangeAmount).toLocaleString('pt-BR') }}</span>
              </p>

              <div class="mx-hoje-leads">
                <div class="mx-hoje-lead mx-hoje-lead-neg">
                  <span class="mx-hoje-lead-icon">
                    <UIcon name="i-lucide-trending-down" class="size-4" />
                  </span>
                  <p class="mx-hoje-lead-text">
                    <strong>Principal impacto:</strong> juros futuros pressionaram <strong>ITUB4 e BBDC4</strong> em <strong class="mx-neg">−R$ 1.820</strong>.
                  </p>
                </div>
                <div class="mx-hoje-lead mx-hoje-lead-pos">
                  <span class="mx-hoje-lead-icon">
                    <UIcon name="i-lucide-coins" class="size-4" />
                  </span>
                  <p class="mx-hoje-lead-text">
                    <strong>Recebeu hoje:</strong> +R$ 84,20 de dividendo de <span class="mx-amber">BBAS3</span>.
                  </p>
                </div>
              </div>

              <ul class="mx-hoje-mini">
                <li v-for="c in causalFactors" :key="c.key" class="mx-hoje-mini-row">
                  <span class="mx-hoje-mini-icon" :class="`mx-hoje-mini-icon-${c.key}`">
                    <UIcon :name="c.icon" class="size-4" />
                  </span>
                  <div class="mx-hoje-mini-meta">
                    <p class="mx-hoje-mini-label">{{ c.label }}</p>
                    <p class="mx-hoje-mini-sub" :class="c.impact >= 0 ? 'mx-pos' : 'mx-neg'">
                      {{ c.impact >= 0 ? '+' : '−' }}R$ {{ Math.abs(c.impact).toLocaleString('pt-BR') }}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </article>

          <!-- RIGHT: intraday curve (mesma estrutura do Evolução) -->
          <article class="mx-section">
            <div class="mx-wallet-card mx-hoje-main-right">
              <header class="mx-wallet-card-head">
                <div>
                  <h3 class="mx-wallet-card-title">Curva intraday</h3>
                  <p class="mx-evolucao-deck">
                    <span class="mx-neg"><strong>{{ intradayStats.close }}</strong></span>
                    <span class="mx-mut">no dia · pico {{ intradayStats.max }} · vale {{ intradayStats.min }}</span>
                  </p>
                </div>
                <span class="mx-wallet-card-meta">{{ hojeTime }}</span>
              </header>
              <div class="mx-evolucao-chart">
                <svg viewBox="0 0 800 220" preserveAspectRatio="none" class="mx-evolucao-svg">
                  <defs>
                    <linearGradient id="mxHojeGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stop-color="var(--brand-primary)" stop-opacity="0.35" />
                      <stop offset="100%" stop-color="var(--brand-primary)" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <path :d="intradaySvg.area" fill="url(#mxHojeGrad)" />
                  <path :d="intradaySvg.line" fill="none" stroke="var(--brand-primary)" stroke-width="2"
                        stroke-linejoin="round" stroke-linecap="round" />
                  <circle v-for="(c, i) in intradaySvg.coords" :key="i"
                          :cx="c.x" :cy="c.y" r="3"
                          fill="var(--bg-elevated)"
                          stroke="var(--brand-primary)"
                          stroke-width="1.5"
                          class="mx-evolucao-dot" />
                </svg>
                <ul class="mx-hoje-labels">
                  <li v-for="p in intradayPoints" :key="p.label">{{ p.label }}</li>
                </ul>
              </div>
              <dl class="mx-evolucao-stats">
                <div>
                  <dt>Máximo</dt>
                  <dd>{{ intradayStats.max }}</dd>
                </div>
                <div>
                  <dt>Mínimo</dt>
                  <dd class="mx-neg">{{ intradayStats.min }}</dd>
                </div>
                <div>
                  <dt>Fechamento</dt>
                  <dd class="mx-neg">{{ intradayStats.close }}</dd>
                </div>
                <div>
                  <dt>vs IBOV</dt>
                  <dd class="mx-neg">{{ intradayStats.vsIbov }}</dd>
                </div>
              </dl>
            </div>
          </article>
        </section>

        <!-- O que pesou + Notícias do dia (2-col desktop, stack mobile) -->
        <section class="mx-grid mx-grid-2-d">
          <!-- O que mais pesou -->
          <section class="mx-section">
            <div class="mx-wallet-card">
              <header class="mx-wallet-card-head">
                <div>
                  <h3 class="mx-wallet-card-title">O que mais pesou</h3>
                  <p class="mx-pesou-deck">A maior parte da queda veio de fatores macro, não dos seus ativos.</p>
                </div>
              </header>
              <ul class="mx-pesou-list">
                <li v-for="p in pesouPills" :key="p.key" class="mx-pesou-row">
                  <span class="mx-pesou-icon" :class="`mx-pesou-icon-${p.key}`">
                    <UIcon :name="p.icon" class="size-4" />
                  </span>
                  <div class="mx-pesou-body">
                    <p class="mx-pesou-factor">{{ p.factor }}</p>
                    <p class="mx-pesou-desc">{{ p.desc }}</p>
                    <p class="mx-pesou-tickers">{{ p.tickers.join(' · ') }}</p>
                  </div>
                  <p class="mx-pesou-amount" :class="p.impact >= 0 ? 'mx-pos' : 'mx-neg'">
                    {{ p.impact >= 0 ? '+' : '−' }}R$ {{ Math.abs(p.impact).toLocaleString('pt-BR') }}
                  </p>
                </li>
              </ul>
            </div>
          </section>

          <!-- Notícias do dia -->
          <section class="mx-section">
            <div class="mx-wallet-card">
              <header class="mx-wallet-card-head">
                <div>
                  <h3 class="mx-wallet-card-title">Notícias do dia</h3>
                  <p class="mx-news-deck">
                    <strong class="mx-pos">+R$ 380</strong>
                    <span class="mx-mut">em 1 positiva</span>
                    <span class="mx-mut">·</span>
                    <strong class="mx-neg">−R$ 1.720</strong>
                    <span class="mx-mut">em 3 negativas</span>
                  </p>
                </div>
                <button class="mx-list-link">Ver todas</button>
              </header>
              <ul class="mx-news-list">
                <li v-for="n in hojeNews" :key="n.id" class="mx-news-row">
                  <span class="mx-news-icon" :class="`mx-news-icon-${n.themeKey}`">
                    <UIcon :name="n.icon" class="size-4" />
                  </span>
                  <div class="mx-news-body">
                    <p class="mx-news-theme">
                      {{ n.theme }}
                      <span class="mx-news-time">· {{ n.time }}</span>
                    </p>
                    <h4 class="mx-news-title">{{ n.headline }}</h4>
                    <p class="mx-news-source">
                      <span class="mx-news-tickers" v-if="n.tickers.length">{{ n.tickers.join(' · ') }}</span>
                      <span class="mx-mut">·</span>
                      <span class="mx-mut">{{ n.source }}</span>
                    </p>
                  </div>
                  <p class="mx-news-impact" :class="n.impact >= 0 ? 'mx-pos' : 'mx-neg'">
                    {{ n.impact >= 0 ? '+' : '−' }}R$ {{ Math.abs(n.impact).toLocaleString('pt-BR') }}
                  </p>
                </li>
              </ul>
            </div>
          </section>
        </section>

        <!-- Resumo Redentia AI (alinhado ao pattern wallet-card) -->
        <section class="mx-section">
          <div class="mx-wallet-card">
            <header class="mx-wallet-card-head">
              <h3 class="mx-wallet-card-title">
                <UIcon name="i-lucide-sparkles" class="size-4 mx-resumo-spark" />
                Resumo do dia
              </h3>
              <span class="mx-wallet-card-meta">{{ hojeTime }}</span>
            </header>
            <p class="mx-resumo-body">{{ resumoAI }}</p>
            <footer class="mx-resumo-foot">
              <p class="mx-resumo-meta">
                <span><strong>{{ resumoStats.macroPct }}%</strong> causa setorial</span>
                <span class="mx-mut">·</span>
                <span><strong>{{ resumoStats.specificPct }}%</strong> causa específica</span>
                <span class="mx-mut">·</span>
                <span><strong>{{ resumoStats.movers }}</strong> ativos com movimento</span>
              </p>
              <button class="mx-list-link">Continuar conversa →</button>
            </footer>
          </div>
        </section>

        <!-- Mercado geral -->
        <section class="mx-section">
          <header class="mx-list-head">
            <div>
              <h2 class="mx-section-h2 mx-list-h">Bolsa em queda, sua carteira no mesmo passo</h2>
              <p class="mx-mut" style="margin: 2px 0 0; font-size: 13px;">
                Ibovespa fechou em <strong>−1,42%</strong>. Sua carteira caiu <strong>−2,05%</strong>, 0,63 p.p. abaixo do índice.
              </p>
            </div>
          </header>
          <div class="mx-market-hero">
            <article class="mx-market-lead">
              <p class="mx-market-lead-label">{{ marketIndices[0].label }}</p>
              <p class="mx-market-lead-val">{{ marketIndices[0].valueLabel }}</p>
              <p class="mx-market-lead-pct mx-neg">
                <UIcon name="i-lucide-arrow-down" class="size-4" />
                {{ Math.abs(marketIndices[0].changePct).toFixed(2) }}%
              </p>
            </article>
            <ul class="mx-market-secondary">
              <li v-for="ix in marketIndices.slice(1)" :key="ix.key" class="mx-market-sec">
                <div class="mx-market-sec-lead">
                  <span class="mx-market-sec-icon"><UIcon :name="ix.icon" class="size-4" /></span>
                  <p class="mx-market-sec-label">{{ ix.label }}</p>
                </div>
                <div class="mx-market-sec-row">
                  <span class="mx-market-sec-val">{{ ix.valueLabel }}</span>
                  <span class="mx-market-sec-pct" :class="ix.changePct >= 0 ? 'mx-pos' : 'mx-neg'">
                    <UIcon :name="ix.changePct >= 0 ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'" class="size-4" />
                    {{ Math.abs(ix.changePct).toFixed(2) }}%
                  </span>
                </div>
              </li>
            </ul>
          </div>
          <div class="mx-market-mvr">
            <div class="mx-market-mvr-col">
              <p class="mx-market-mvr-h">Quem segurou o índice</p>
              <ul>
                <li v-for="t in topGainers" :key="t.ticker">
                  <UIcon name="i-lucide-arrow-up" class="size-4 mx-pos" />
                  <span class="mx-market-mvr-tk">{{ t.ticker }}</span>
                  <span class="mx-market-mvr-pct mx-pos">+{{ t.pct.toFixed(2) }}%</span>
                </li>
              </ul>
            </div>
            <div class="mx-market-mvr-col">
              <p class="mx-market-mvr-h">Quem puxou pra baixo</p>
              <ul>
                <li v-for="t in topLosers" :key="t.ticker">
                  <UIcon name="i-lucide-arrow-down" class="size-4 mx-neg" />
                  <span class="mx-market-mvr-tk">{{ t.ticker }}</span>
                  <span class="mx-market-mvr-pct mx-neg">{{ t.pct.toFixed(2) }}%</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Histórico -->
        <section class="mx-section">
          <header class="mx-list-head">
            <h2 class="mx-section-h2 mx-list-h">Seu histórico</h2>
          </header>
          <ul class="mx-hist-list">
            <li v-for="h in hojeHistory" :key="h.label" class="mx-hist-card">
              <header class="mx-hist-h">
                <p class="mx-hist-label">{{ h.label }}</p>
                <span class="mx-hist-pill" :class="`mx-hist-sev-${h.severity}`">
                  {{ h.severity === 'high' ? 'Alto impacto' : h.severity === 'positive' ? 'Positivo' : 'Médio impacto' }}
                </span>
              </header>
              <p class="mx-hist-amt" :class="h.amount >= 0 ? 'mx-pos' : 'mx-neg'">
                {{ h.amount >= 0 ? '+' : '−' }}R$ {{ Math.abs(h.amount).toLocaleString('pt-BR') }}
              </p>
              <p class="mx-hist-pct" :class="h.pct >= 0 ? 'mx-pos' : 'mx-neg'">
                {{ h.pct >= 0 ? '+' : '−' }}{{ Math.abs(h.pct).toFixed(2) }}%
              </p>
              <svg viewBox="0 0 240 60" preserveAspectRatio="none" class="mx-hist-spark">
                <path :d="sparkPath(h.sparkline, 240, 60)" fill="none"
                      stroke="var(--brand-primary)"
                      stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
              </svg>
            </li>
          </ul>
        </section>
      </template>

      <!-- ============ MERCADO ============ -->
      <template v-else-if="activeTab === 'Mercado'">
        <!-- Hero header com indicador live -->
        <section class="mx-section mx-mercado-hero">
          <p class="mx-eyebrow mx-mercado-live">
            <span class="mx-live-dot" /> Ao vivo · {{ mercadoTime }}
          </p>
          <h2 class="mx-mercado-h1">Mercado em tempo real</h2>
          <p class="mx-mercado-sub">
            Altas, baixas e oportunidades. Atualização instantânea, dados de pregão.
          </p>
        </section>

        <!-- Featured tickers (horizontal scroll) -->
        <section class="mx-section-flush">
          <div class="mx-mercado-featured">
            <article v-for="f in mercadoFeatured" :key="f.ticker"
                     class="mx-featured-card" :class="{ 'mx-featured-card-index': f.isIndex }"
                     @click="openAsset(f.ticker)">
              <header class="mx-featured-head">
                <span class="mx-featured-mark">{{ f.ticker.charAt(0) }}</span>
                <div class="mx-featured-meta">
                  <p class="mx-featured-tk">{{ f.ticker }}</p>
                  <p class="mx-featured-name">{{ f.name }}</p>
                </div>
                <span v-if="f.tag" class="mx-featured-tag">{{ f.tag }}</span>
              </header>
              <p class="mx-featured-price">{{ f.valueLabel }}</p>
              <p class="mx-featured-delta" :class="f.changePct >= 0 ? 'mx-pos' : 'mx-neg'">
                <UIcon :name="f.changePct >= 0 ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'" class="size-3.5" />
                {{ Math.abs(f.changePct).toFixed(2) }}%
                <span v-if="f.sub" class="mx-featured-sub">· {{ f.sub }}</span>
              </p>
              <svg viewBox="0 0 100 32" preserveAspectRatio="none" class="mx-featured-spark">
                <path :d="sparkPath(f.sparkline, 100, 32)" fill="none"
                      :stroke="f.changePct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'"
                      stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
              </svg>
            </article>
          </div>
        </section>

        <!-- Charts grandes IBOV + IFIX (2-col desktop, stack mobile) -->
        <section class="mx-grid mx-grid-2-d">
          <!-- IBOV -->
          <section class="mx-section">
            <div class="mx-wallet-card">
              <header class="mx-wallet-card-head">
                <div>
                  <h3 class="mx-wallet-card-title">Ibovespa</h3>
                  <p class="mx-evolucao-deck">
                    <strong>{{ ibovChart.current }}</strong>
                    <span :class="ibovChart.changePct >= 0 ? 'mx-pos' : 'mx-neg'">
                      {{ ibovChart.changePct >= 0 ? '↑' : '↓' }} {{ Math.abs(ibovChart.changePct).toFixed(2) }}%
                    </span>
                    <span class="mx-mut">· {{ ibovChart.changeAbs }}</span>
                  </p>
                </div>
                <div class="mx-evolucao-periods">
                  <button v-for="(p, i) in chartPeriods" :key="p"
                          class="mx-evolucao-period"
                          :class="{ 'mx-evolucao-period-active': ibovPeriodIdx === i }"
                          @click="ibovPeriodIdx = i">{{ p }}</button>
                </div>
              </header>
              <div class="mx-evolucao-chart">
                <svg viewBox="0 0 800 220" preserveAspectRatio="none" class="mx-evolucao-svg">
                  <defs>
                    <linearGradient id="mxIbovGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" :stop-color="ibovChart.changePct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'" stop-opacity="0.32" />
                      <stop offset="100%" :stop-color="ibovChart.changePct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <path :d="ibovSvg.area" fill="url(#mxIbovGrad)" />
                  <path :d="ibovSvg.line" fill="none"
                        :stroke="ibovChart.changePct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'"
                        stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
                  <circle v-for="(c, i) in ibovSvg.coords" :key="i"
                          :cx="c.x" :cy="c.y" r="3"
                          fill="var(--bg-elevated)"
                          :stroke="ibovChart.changePct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'"
                          stroke-width="1.5" />
                </svg>
                <ul class="mx-evolucao-labels">
                  <li v-for="p in ibovChart.points" :key="p.label">{{ p.label }}</li>
                </ul>
              </div>
              <dl class="mx-evolucao-stats">
                <div><dt>Abertura</dt><dd>{{ ibovChart.open }}</dd></div>
                <div><dt>Máximo</dt><dd class="mx-pos">{{ ibovChart.high }}</dd></div>
                <div><dt>Mínimo</dt><dd class="mx-neg">{{ ibovChart.low }}</dd></div>
                <div><dt>Volume</dt><dd>{{ ibovChart.volume }}</dd></div>
              </dl>
            </div>
          </section>

          <!-- IFIX -->
          <section class="mx-section">
            <div class="mx-wallet-card">
              <header class="mx-wallet-card-head">
                <div>
                  <h3 class="mx-wallet-card-title">IFIX</h3>
                  <p class="mx-evolucao-deck">
                    <strong>{{ ifixChart.current }}</strong>
                    <span :class="ifixChart.changePct >= 0 ? 'mx-pos' : 'mx-neg'">
                      {{ ifixChart.changePct >= 0 ? '↑' : '↓' }} {{ Math.abs(ifixChart.changePct).toFixed(2) }}%
                    </span>
                    <span class="mx-mut">· {{ ifixChart.changeAbs }}</span>
                  </p>
                </div>
                <div class="mx-evolucao-periods">
                  <button v-for="(p, i) in chartPeriods" :key="p"
                          class="mx-evolucao-period"
                          :class="{ 'mx-evolucao-period-active': ifixPeriodIdx === i }"
                          @click="ifixPeriodIdx = i">{{ p }}</button>
                </div>
              </header>
              <div class="mx-evolucao-chart">
                <svg viewBox="0 0 800 220" preserveAspectRatio="none" class="mx-evolucao-svg">
                  <defs>
                    <linearGradient id="mxIfixGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" :stop-color="ifixChart.changePct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'" stop-opacity="0.32" />
                      <stop offset="100%" :stop-color="ifixChart.changePct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <path :d="ifixSvg.area" fill="url(#mxIfixGrad)" />
                  <path :d="ifixSvg.line" fill="none"
                        :stroke="ifixChart.changePct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'"
                        stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
                  <circle v-for="(c, i) in ifixSvg.coords" :key="i"
                          :cx="c.x" :cy="c.y" r="3"
                          fill="var(--bg-elevated)"
                          :stroke="ifixChart.changePct >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'"
                          stroke-width="1.5" />
                </svg>
                <ul class="mx-evolucao-labels">
                  <li v-for="p in ifixChart.points" :key="p.label">{{ p.label }}</li>
                </ul>
              </div>
              <dl class="mx-evolucao-stats">
                <div><dt>Abertura</dt><dd>{{ ifixChart.open }}</dd></div>
                <div><dt>Máximo</dt><dd class="mx-pos">{{ ifixChart.high }}</dd></div>
                <div><dt>Mínimo</dt><dd class="mx-neg">{{ ifixChart.low }}</dd></div>
                <div><dt>Volume</dt><dd>{{ ifixChart.volume }}</dd></div>
              </dl>
            </div>
          </section>
        </section>

        <!-- Maiores altas/baixas com tabs por classe -->
        <section class="mx-section">
          <div class="mx-wallet-card">
            <header class="mx-wallet-card-head">
              <div>
                <h3 class="mx-wallet-card-title">Maiores altas e baixas</h3>
                <p class="mx-mut" style="margin: 2px 0 0; font-size: 13px;">
                  Top 5 de cada lado · atualizado agora
                </p>
              </div>
              <button class="mx-list-link">Ver todos</button>
            </header>
            <div class="mx-movers-tabs">
              <button v-for="(t, i) in moversTabs" :key="t"
                      class="mx-movers-tab"
                      :class="{ 'mx-movers-tab-active': moversTabIdx === i }"
                      @click="moversTabIdx = i">{{ t }}</button>
            </div>
            <div class="mx-movers-grid">
              <div class="mx-movers-col">
                <p class="mx-movers-h mx-pos">Maiores altas</p>
                <ul class="mx-movers-list">
                  <li v-for="m in moversAltas[moversTabs[moversTabIdx]]" :key="m.ticker"
                      class="mx-movers-row" @click="openAsset(m.ticker)">
                    <span class="mx-movers-mark">{{ m.ticker.charAt(0) }}</span>
                    <div class="mx-movers-meta">
                      <p class="mx-movers-tk">{{ m.ticker }}</p>
                      <p class="mx-movers-name">{{ m.name }}</p>
                    </div>
                    <div class="mx-movers-right">
                      <p class="mx-movers-price">{{ m.priceLabel }}</p>
                      <p class="mx-movers-pct mx-pos">+{{ m.changePct.toFixed(2) }}%</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="mx-movers-col">
                <p class="mx-movers-h mx-neg">Maiores baixas</p>
                <ul class="mx-movers-list">
                  <li v-for="m in moversBaixas[moversTabs[moversTabIdx]]" :key="m.ticker"
                      class="mx-movers-row" @click="openAsset(m.ticker)">
                    <span class="mx-movers-mark">{{ m.ticker.charAt(0) }}</span>
                    <div class="mx-movers-meta">
                      <p class="mx-movers-tk">{{ m.ticker }}</p>
                      <p class="mx-movers-name">{{ m.name }}</p>
                    </div>
                    <div class="mx-movers-right">
                      <p class="mx-movers-price">{{ m.priceLabel }}</p>
                      <p class="mx-movers-pct mx-neg">{{ m.changePct.toFixed(2) }}%</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- Criptomoedas (horizontal scroll) -->
        <section class="mx-section">
          <header class="mx-list-head">
            <div>
              <h2 class="mx-section-h2 mx-list-h">Criptomoedas</h2>
              <p class="mx-mut" style="margin: 2px 0 0; font-size: 13px;">
                Top 7 por market cap · cotações em real, atualizadas a cada minuto.
              </p>
            </div>
            <button class="mx-list-link">Ver todas</button>
          </header>
          <div class="mx-crypto-list">
            <article v-for="c in cryptos" :key="c.ticker"
                     class="mx-crypto-card" :class="{ 'mx-crypto-card-hi': c.highlight }">
              <header class="mx-crypto-head">
                <span class="mx-crypto-mark">{{ c.ticker.slice(0, 2) }}</span>
                <div class="mx-crypto-meta">
                  <p class="mx-crypto-tk">{{ c.ticker }}</p>
                  <p class="mx-crypto-name">#{{ c.rank }} · {{ c.name }}</p>
                </div>
              </header>
              <p class="mx-crypto-price">{{ c.priceLabel }}</p>
              <p class="mx-crypto-delta" :class="c.changePct > 0 ? 'mx-pos' : c.changePct < 0 ? 'mx-neg' : 'mx-mut'">
                <UIcon v-if="c.changePct !== 0" :name="c.changePct > 0 ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'" class="size-3.5" />
                {{ c.changePct === 0 ? '0,00' : (c.changePct > 0 ? '+' : '−') + Math.abs(c.changePct).toFixed(2) }}%
              </p>
              <div v-if="c.highlight" class="mx-crypto-extra">
                <span class="mx-mut">MCap</span> <strong>{{ c.mcap }}</strong>
                <span class="mx-mut">· Vol</span> <strong>{{ c.vol24h }}</strong>
                <span class="mx-mut">· Dom</span> <strong>{{ c.dominance }}</strong>
              </div>
            </article>
          </div>
        </section>

        <!-- Tesouro Direto (4 grupos) -->
        <section class="mx-section">
          <header class="mx-list-head">
            <div>
              <h2 class="mx-section-h2 mx-list-h">Tesouro Direto</h2>
              <p class="mx-mut" style="margin: 2px 0 0; font-size: 13px;">
                Títulos públicos do governo · atualização diária.
              </p>
            </div>
            <button class="mx-list-link">Ver todos</button>
          </header>
          <div class="mx-tesouro-grid">
            <article v-for="g in tesouroGroups" :key="g.key" class="mx-wallet-card mx-tesouro-card">
              <header class="mx-wallet-card-head">
                <h3 class="mx-wallet-card-title">{{ g.label }}</h3>
                <span class="mx-wallet-card-meta">{{ g.items.length }} títulos</span>
              </header>
              <ul class="mx-tesouro-list">
                <li v-for="t in g.items" :key="t.name" class="mx-tesouro-row">
                  <div class="mx-tesouro-info">
                    <p class="mx-tesouro-name">{{ t.name }}</p>
                    <p class="mx-tesouro-venc">Venc {{ t.venc }} · <span class="mx-amber">{{ t.rate }}</span></p>
                  </div>
                  <p class="mx-tesouro-price">{{ t.priceLabel }}</p>
                </li>
              </ul>
            </article>
          </div>
        </section>

        <!-- Notícias do mercado (grouped by ticker) -->
        <section class="mx-section">
          <div class="mx-wallet-card">
            <header class="mx-wallet-card-head">
              <div>
                <h3 class="mx-wallet-card-title">Notícias do mercado</h3>
                <p class="mx-mut" style="margin: 2px 0 0; font-size: 13px;">
                  Últimas 24h, agrupadas por ticker · 6 fontes, atualizado há 18min.
                </p>
              </div>
              <button class="mx-list-link">Ver todas</button>
            </header>
            <div class="mx-mn-groups">
              <article v-for="g in mercadoNoticiasGroups" :key="g.ticker" class="mx-mn-group">
                <header class="mx-mn-group-head">
                  <span class="mx-mn-group-tk">{{ g.ticker }}</span>
                  <span class="mx-mn-group-count">{{ g.count }} notícias</span>
                </header>
                <ul class="mx-mn-list">
                  <li v-for="n in g.items" :key="n.id" class="mx-mn-row">
                    <p class="mx-mn-headline">{{ n.headline }}</p>
                    <p class="mx-mn-meta"><span class="mx-mut">{{ n.source }} · {{ n.time }}</span></p>
                  </li>
                </ul>
              </article>
            </div>
          </div>
        </section>
      </template>

      <!-- ============ PLACEHOLDER ============ -->
      <template v-else>
        <section class="mx-section" style="text-align: center; padding-top: 80px">
          <p class="mx-label" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em">Em construção</p>
          <h2 class="mx-page-title" style="margin-top: 8px">{{ activeTab }}</h2>
        </section>
      </template>
    </main>

    <!-- ============ FLOATING MENU (mobile only) ============ -->
    <nav class="mx-floating-menu" :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }">
      <div class="mx-floating-inner">
        <button
          v-for="t in mobileTabs"
          :key="t.label"
          class="mx-floating-tab"
          :class="{ 'mx-floating-tab-active': activeTab === t.label }"
          :aria-label="t.label"
          @click="setTab(t.label)"
        >
          <UIcon :name="t.icon" class="size-5" />
        </button>
      </div>
    </nav>

    <!-- Bottom sheet menu -->
    <Transition name="mx-bd">
      <div v-if="menuOpen" class="mx-sheet-bd" @click="menuOpen = false" />
    </Transition>
    <Transition name="mx-sheet">
      <div v-if="menuOpen" class="mx-sheet" :style="{ paddingBottom: 'env(safe-area-inset-bottom)' }">
        <div class="mx-sheet-handle" />
        <header class="mx-sheet-head">
          <span aria-hidden="true" />
          <h2 class="mx-sheet-title">Menu</h2>
          <button class="mx-icon-btn" style="color: var(--text-muted)" @click="menuOpen = false">
            <UIcon name="i-lucide-x" class="size-5" />
          </button>
        </header>
        <nav class="mx-sheet-nav">
          <section v-for="g in navGroups" :key="g.label" class="mx-sheet-group">
            <p class="mx-sheet-group-h">{{ g.label }}</p>
            <a v-for="item in g.items" :key="item.label" class="mx-sheet-item" @click="setTab(item.label); menuOpen = false">
              <UIcon :name="item.icon" class="size-5 mx-sheet-item-icon" />
              <span class="mx-sheet-item-label">{{ item.label }}</span>
              <UIcon name="i-lucide-chevron-right" class="size-4 mx-sheet-chevron" />
            </a>
          </section>
        </nav>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({ layout: false })

const activeTab = ref<string>('Início')
const activeAsset = ref<string | null>(null)
const assetPeriodIdx = ref(2)

function openAsset(ticker: string) {
  activeAsset.value = ticker
  if (typeof window !== 'undefined') window.scrollTo(0, 0)
}
function setTab(label: string) {
  activeAsset.value = null
  activeTab.value = label
}

// Metadados por ticker (dynamic name/sector quando clica)
const tickerMetas: Record<string, { name: string; sector: string; type: string }> = {
  PETR4:  { name: 'Petrobras PN',        sector: 'Petróleo & Gás · Brasil', type: 'Ação' },
  VALE3:  { name: 'Vale ON',              sector: 'Mineração · Brasil',      type: 'Ação' },
  BBAS3:  { name: 'Banco do Brasil ON',   sector: 'Financeiro · Brasil',     type: 'Ação' },
  ITSA4:  { name: 'Itaúsa PN',            sector: 'Holding · Brasil',         type: 'Ação' },
  BBDC4:  { name: 'Bradesco PN',          sector: 'Financeiro · Brasil',     type: 'Ação' },
  ITUB4:  { name: 'Itaú Unibanco PN',     sector: 'Financeiro · Brasil',     type: 'Ação' },
  PRIO3:  { name: 'PRIO ON',               sector: 'Petróleo & Gás · Brasil', type: 'Ação' },
  CSAN3:  { name: 'Cosan ON',              sector: 'Energia · Brasil',         type: 'Ação' },
  IBOV:   { name: 'Ibovespa',              sector: 'Índice · B3',              type: 'Índice' },
  AAPL34: { name: 'Apple DRN',             sector: 'Tecnologia · EUA',         type: 'BDR' },
  TSLA34: { name: 'Tesla DRN',             sector: 'Automotivo · EUA',         type: 'BDR' },
  HGLG11: { name: 'HG Logística',          sector: 'FII Logístico · Brasil',  type: 'FII' },
  KNRI11: { name: 'Kinea Renda Imob.',    sector: 'FII Híbrido · Brasil',    type: 'FII' },
  MGLU3:  { name: 'Magazine Luiza ON',    sector: 'Varejo · Brasil',          type: 'Ação' },
  WEGE3:  { name: 'WEG ON',                sector: 'Bens Industriais · Brasil', type: 'Ação' },
  RECV3:  { name: 'PetroRecsa ON',         sector: 'Petróleo & Gás · Brasil', type: 'Ação' },
}
function assetMeta(ticker: string) {
  return tickerMetas[ticker] || { name: `${ticker} ON`, sector: 'Diversos', type: 'Ação' }
}

// Dados mockados (compartilhados, só ticker/name/sector mudam)
const assetMock = {
  price: 'R$ 38,42', changePct: 1.19, changeAbs: '+R$ 0,45',
  open: 'R$ 37,98', high: 'R$ 38,52', low: 'R$ 37,80',
  prevClose: 'R$ 37,97', volume: 'R$ 248 mi', marketCap: 'R$ 502 bi',
  sparkline: [0, 0.18, 0.42, 0.32, 0.65, 0.78, 0.95, 1.08, 1.19],
  chartPoints: [
    { label: 'jun', value: 32.40 }, { label: 'jul', value: 33.80 },
    { label: 'ago', value: 35.10 }, { label: 'set', value: 34.50 },
    { label: 'out', value: 35.80 }, { label: 'nov', value: 36.20 },
    { label: 'dez', value: 35.40 }, { label: 'jan', value: 36.80 },
    { label: 'fev', value: 37.20 }, { label: 'mar', value: 37.80 },
    { label: 'abr', value: 38.20 }, { label: 'mai', value: 38.42 },
  ],
  fundamentos: [
    { label: 'P/L',    value: '4,2x',  tooltip: 'Preço sobre lucro' },
    { label: 'P/VP',   value: '0,9x',  tooltip: 'Preço sobre valor patrimonial' },
    { label: 'DY',     value: '8,2%',  tooltip: 'Dividend yield 12m',           highlight: true },
    { label: 'ROE',    value: '14,8%', tooltip: 'Return on equity' },
    { label: 'ROA',    value: '8,1%',  tooltip: 'Return on assets' },
    { label: 'MG.LÍQ', value: '24,5%', tooltip: 'Margem líquida' },
  ],
  checklist: [
    { criteria: 'Market cap > R$ 1B',         detail: 'R$ 502 bi · 502× threshold',           pass: true },
    { criteria: 'DY > 5%',                     detail: '8,2% em 12 meses',                    pass: true },
    { criteria: 'ROE > 10%',                   detail: '14,8% · acima do setor',              pass: true },
    { criteria: 'P/L < 15x',                   detail: '4,2x · desconto vs pares',            pass: true },
    { criteria: 'Margem líquida > 10%',        detail: '24,5% consistente nos últimos 3a',   pass: true },
    { criteria: 'Histórico 5a dividendos',     detail: '5 de 5 anos pagos',                   pass: true },
    { criteria: 'Dívida líq/EBITDA < 2x',      detail: '0,8x · alavancagem saudável',         pass: true },
    { criteria: 'Caixa livre positivo',        detail: 'R$ 84 bi em 12m',                     pass: true },
    { criteria: 'Crescimento receita 3a > 0',  detail: '−4% · queda recente',                 pass: false },
    { criteria: 'P/VP < 1,5x',                 detail: '0,9x · abaixo do book value',         pass: true },
    { criteria: 'Beta < 1,2',                  detail: '1,06 · pouco acima do mercado',       pass: false },
    { criteria: 'Setor cíclico de baixo',     detail: 'Petróleo em ciclo de baixa',          pass: null },
  ],
  dividendMonths: [
    { month: 'JAN', pct:  12, value: 'R$ 0,32' },
    { month: 'FEV', pct:   0, value: '−' },
    { month: 'MAR', pct:  85, value: 'R$ 1,84', highlight: true },
    { month: 'ABR', pct:   8, value: 'R$ 0,24' },
    { month: 'MAI', pct:   0, value: '−' },
    { month: 'JUN', pct:  78, value: 'R$ 1,42', highlight: true },
    { month: 'JUL', pct:   4, value: 'R$ 0,12' },
    { month: 'AGO', pct:   2, value: '−' },
    { month: 'SET', pct:  92, value: 'R$ 2,18', highlight: true },
    { month: 'OUT', pct:   8, value: 'R$ 0,28' },
    { month: 'NOV', pct:   0, value: '−' },
    { month: 'DEZ', pct:  68, value: 'R$ 1,24', highlight: true },
  ],
  description: 'Petrobras é a maior produtora de petróleo do Brasil e uma das maiores do mundo. A companhia atua em exploração, produção, refino, comercialização, transporte e distribuição de derivados de petróleo, gás natural e biocombustíveis. Listada na B3 e NYSE, é controlada pela União Federal e tem operações em mais de 20 países.',
  thesis: 'PETR4 oferece exposição direta ao ciclo do petróleo brasileiro com vantagem competitiva no pré-sal (custos abaixo de US$ 30/bbl). Pagadora consistente de dividendos com yield acima de 8% e múltiplo P/L de 4,2x — entre os mais baratos do setor globalmente. Riscos: interferência política, oscilação cambial e volatilidade do barril Brent.',
  peers: [
    { ticker: 'PETR4', pl: '4,2x', pvp: '0,9x', dy: '8,2%', roe: '14,8%', highlight: true },
    { ticker: 'PRIO3', pl: '5,8x', pvp: '1,4x', dy: '4,1%', roe: '22,3%' },
    { ticker: 'RECV3', pl: '6,2x', pvp: '1,1x', dy: '3,8%', roe: '12,6%' },
    { ticker: 'CSAN3', pl: '8,4x', pvp: '1,2x', dy: '5,4%', roe: '10,2%' },
  ],
  news: [
    { id: 1, headline: 'Petrobras anuncia novo plano de capex 2027 mantido em R$ 102 bi',         source: 'Valor', time: '28min' },
    { id: 2, headline: 'JPMorgan eleva títulos da Braskem para compra após subir ação',           source: 'Folha', time: '1h' },
    { id: 3, headline: 'Itaú BBA inclui PETR4 em carteira recomendada para próxima semana',       source: 'InfoMoney', time: '2h' },
    { id: 4, headline: 'Pre-sal supera marca de 3 milhões de bpd em produção mensal',              source: 'Reuters', time: '3h' },
  ],
}

const assetSvg = computed(() => buildChartSvg(assetMock.chartPoints))
const filterIdx = ref(0)
const menuOpen = ref(false)
const showBalance = ref(true)
const resultMode = ref<'swing' | 'day'>('swing')
const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

function formatBRL(n: number): string {
  return 'R$ ' + Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// ============ NAV ============
const mobileTabs = [
  { label: 'Início',    icon: 'i-lucide-home' },
  { label: 'Hoje',      icon: 'i-lucide-sparkles' },
  { label: 'Carteira',  icon: 'i-lucide-wallet' },
  { label: 'Resultado', icon: 'i-lucide-trending-up' },
]

const navGroups = [
  { label: 'Geral', items: [
    { label: 'Início',    icon: 'i-lucide-home' },
    { label: 'Carteira',  icon: 'i-lucide-wallet' },
    { label: 'Resultado', icon: 'i-lucide-trending-up' },
    { label: 'Hoje',      icon: 'i-lucide-sparkles', badge: 'novo' },
    { label: 'Raio-X',    icon: 'i-lucide-radar' },
    { label: 'Chat',      icon: 'i-lucide-message-circle' },
  ]},
  { label: 'Investir', items: [
    { label: 'Mercado',       icon: 'i-lucide-bar-chart-3' },
    { label: 'Tesouro',       icon: 'i-lucide-landmark' },
    { label: 'Cripto',        icon: 'i-lucide-bitcoin' },
    { label: 'Calculadoras',  icon: 'i-lucide-calculator' },
  ]},
  { label: 'Mais', items: [
    { label: 'Notícias',      icon: 'i-lucide-newspaper' },
    { label: 'Configurações', icon: 'i-lucide-settings' },
  ]},
]

const quickChips = [
  { label: 'Pix',     icon: 'i-lucide-zap' },
  { label: 'Pagar',   icon: 'i-lucide-credit-card' },
  { label: 'Cartões', icon: 'i-lucide-wallet' },
]

const services = [
  { label: 'Hoje',           icon: 'i-lucide-sparkles' },
  { label: 'Raio-X',         icon: 'i-lucide-radar' },
  { label: 'Tesouro Direto', icon: 'i-lucide-landmark' },
  { label: 'Cripto',         icon: 'i-lucide-bitcoin' },
  { label: 'Calculadoras',   icon: 'i-lucide-calculator' },
  { label: 'Mercado',        icon: 'i-lucide-bar-chart-3' },
]

const notifications = [
  { id: 1, title: 'Declaração de IR 2026',    description: 'Sua declaração já pode ser baixada.',   date: '14 mai' },
  { id: 2, title: 'Rentabilidade de novembro', description: 'Sua carteira fechou em +R$ 1.840.',     date: '12 mai' },
  { id: 3, title: 'Dividendo BBAS3',           description: 'Crédito de R$ 84,20 na sua conta.',     date: '10 mai' },
  { id: 4, title: 'Alerta PETR4',              description: 'Aproximou do stop-loss R$ 36,20.',      date: '08 mai' },
]

const discover = [
  { title: 'Hoje',           body: 'Resumo diário em 1 min.',     icon: 'i-lucide-sparkles',         bg: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)', accent: 'var(--brand-primary)' },
  { title: 'Chat IA',        body: 'Pergunte sobre seus ativos.',  icon: 'i-lucide-message-circle',  bg: 'color-mix(in srgb, #6B8E7F 14%, transparent)',              accent: '#6B8E7F' },
  { title: 'Tesouro Direto', body: 'Aplique com 0% de taxa.',      icon: 'i-lucide-landmark',         bg: 'color-mix(in srgb, var(--brand-positive) 14%, transparent)', accent: 'var(--brand-positive)' },
]

// ============ CARTEIRA ============
const filterPills = ['Todos', 'Ações', 'FIIs', 'Tesouro', 'Cripto', 'ETFs']

const allocation = [
  { name: 'Ações BR',  pct: 42, value: 'R$ 59.800', color: 'var(--brand-primary)' },
  { name: 'FIIs',      pct: 24, value: 'R$ 34.170', color: '#6B8E7F' },
  { name: 'Tesouro',   pct: 18, value: 'R$ 25.628', color: '#7C8DB5' },
  { name: 'Cripto',    pct:  9, value: 'R$ 12.814', color: '#C2715A' },
  { name: 'ETFs Int.', pct:  7, value: 'R$ 9.968',  color: 'var(--brand-positive)' },
]

const donutSegments = (() => {
  const total = 490
  let offset = 0
  return allocation.map(a => {
    const length = (a.pct / 100) * total
    const seg = { color: a.color, length, offset }
    offset += length
    return seg
  })
})()

const miniSegments = (() => {
  const total = 239
  let offset = 0
  return allocation.map(a => {
    const length = (a.pct / 100) * total
    const seg = { color: a.color, length, offset }
    offset += length
    return seg
  })
})()

const detailedAssets = [
  { ticker: 'PETR4', sector: 'Petróleo & Gás · BR',  qty: '498', pm: 'R$ 36,42', quote: 'R$ 38,42', weight: '14%', total: 'R$ 19.140', delta: '+R$ 233', delta12m: '+12,4%' },
  { ticker: 'BBAS3', sector: 'Financeiro · BR',      qty: '430', pm: 'R$ 27,88', quote: 'R$ 28,90', weight:  '9%', total: 'R$ 12.420', delta: '+R$ 281', delta12m:  '+8,1%' },
  { ticker: 'VALE3', sector: 'Mineração · BR',       qty: '165', pm: 'R$ 64,84', quote: 'R$ 64,10', weight:  '7%', total: 'R$ 10.580', delta: '−R$ 120', delta12m:  '−2,3%', deltaNeg: true },
  { ticker: 'ITSA4', sector: 'Financeiro · BR',      qty: '820', pm: 'R$ 10,28', quote: 'R$ 11,18', weight:  '6%', total: 'R$ 8.460',  delta: '+R$ 145', delta12m: '+14,2%' },
]

// Proventos chart
const proventosBars = [
  { month: 'NOV', value: 480 },
  { month: 'DEZ', value: 720 },
  { month: 'JAN', value: 540 },
  { month: 'FEV', value: 890 },
  { month: 'MAR', value: 620 },
  { month: 'ABR', value: 410 },
]
const proventosMax = Math.max(...proventosBars.map(b => b.value))
const proventosTotal = proventosBars.reduce((s, b) => s + b.value, 0)
const proventosTotalLabel = proventosTotal.toLocaleString('pt-BR')

// ============ EVOLUÇÃO DO PATRIMÔNIO ============
const evolucaoPeriods = ['1M', '3M', '6M', '12M', 'Tudo']
const evolucaoPeriodIdx = ref(3)
const evolucaoPoints = [
  { label: 'jun', value: 134000 },
  { label: 'jul', value: 135800 },
  { label: 'ago', value: 132100 },
  { label: 'set', value: 134200 },
  { label: 'out', value: 138500 },
  { label: 'nov', value: 140200 },
  { label: 'dez', value: 137800 },
  { label: 'jan', value: 139600 },
  { label: 'fev', value: 141200 },
  { label: 'mar', value: 143800 },
  { label: 'abr', value: 145200 },
  { label: 'mai', value: 142380 },
]
const evolucaoSvg = computed(() => {
  const w = 800, h = 200
  const values = evolucaoPoints.map(p => p.value)
  const min = Math.min(...values), max = Math.max(...values)
  const range = max - min || 1
  const step = w / (evolucaoPoints.length - 1)
  const coords = evolucaoPoints.map((p, i) => ({
    x: i * step,
    y: h - ((p.value - min) / range) * (h * 0.85) - 14,
  }))
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
  const area = `M0,${h} ${coords.map(c => `L${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')} L${w},${h} Z`
  return { line, area, coords }
})
const evolucaoStats = {
  max: 'R$ 145.200',
  min: 'R$ 132.100',
  vol: '14,2%',
  deltaPct: '+6,28%',
}

// ============ OPEN FINANCE ============
const banks = [
  { id: 1, name: 'Nubank',           type: 'Conta digital',  balance: 'R$ 12.480',  lastSync: 'há 2min',  initial: 'N' },
  { id: 2, name: 'Banco do Brasil',  type: 'Investimentos',  balance: 'R$ 89.420',  lastSync: 'há 12min', initial: 'BB' },
  { id: 3, name: 'XP Investimentos', type: 'Corretora',      balance: 'R$ 40.480',  lastSync: 'há 1h',    initial: 'XP' },
]
const openFinanceLastSync = 'há 12 minutos'

// ============ PRÓXIMOS PROVENTOS ESTIMADOS ============
const upcomingDividends = [
  { id: 1, ticker: 'BBAS3',  type: 'DIV', day: '22', month: 'mai', amount: 84.20 },
  { id: 2, ticker: 'PETR4',  type: 'JCP', day: '28', month: 'mai', amount: 240.50 },
  { id: 3, ticker: 'HGLG11', type: 'DIV', day: '05', month: 'jun', amount: 102.40 },
  { id: 4, ticker: 'ITSA4',  type: 'JCP', day: '12', month: 'jun', amount: 145.80 },
  { id: 5, ticker: 'KNRI11', type: 'DIV', day: '18', month: 'jun', amount: 89.60 },
]
const upcomingTotal = upcomingDividends.reduce((s, d) => s + d.amount, 0)

// ============ RESULTADO — Heatmap + Extended KPIs ============
const extendedKpis = {
  swing: { sharpe: '1,24', sortino: '1,62', maxDD: '−8,2%', recovery: '2,8', vol: '14,2%' },
  day:   { sharpe: '0,92', sortino: '1,18', maxDD: '−4,8%', recovery: '1,4', vol: '22,5%' },
}
const activeExtKpis = computed(() => resultMode.value === 'swing' ? extendedKpis.swing : extendedKpis.day)

const heatmap = (() => {
  const months = ['Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai']
  return months.map((m, mi) => {
    const days = []
    for (let d = 1; d <= 30; d++) {
      const dow = (d + mi * 3) % 7
      const weekend = dow >= 5
      if (weekend) {
        days.push({ day: d, pnl: 0, weekend: true })
      } else {
        const r = ((d * 17 + mi * 31) % 23) - 8
        days.push({ day: d, pnl: r * 50, weekend: false })
      }
    }
    return { month: m, days }
  })
})()

// ============ HOJE ============
const hojeTime = '14:32'

const causalFactors = [
  { key: 'juros',    label: 'Juros futuros', icon: 'i-lucide-percent',     impact: -1820, severity: 'high',     tickers: ['ITUB4', 'BBDC4'] },
  { key: 'petroleo', label: 'Petróleo',       icon: 'i-lucide-fuel',        impact: -1240, severity: 'medium',   tickers: ['PETR4', 'PRIO3'] },
  { key: 'dolar',    label: 'Dólar/Real',     icon: 'i-lucide-dollar-sign',impact:   380, severity: 'positive', tickers: ['VALE3', 'CSAN3'] },
]

const hojeCarteira = {
  totalValue: 184750.42,
  dayChangeAmount: -3868,
  dayChangePct: -2.05,
}

// Intraday curve — mesmos 8 pontos horários do pregão (mesma estrutura do Evolução)
const intradayPoints = [
  { label: '10h', value:  0.00 },
  { label: '11h', value: -0.40 },
  { label: '12h', value: -0.60 },
  { label: '13h', value: -1.10 },
  { label: '14h', value: -2.30 }, // mínimo do dia
  { label: '15h', value: -1.80 },
  { label: '16h', value: -1.95 },
  { label: '17h', value: -2.05 }, // fechamento
]

const intradaySvg = computed(() => {
  const w = 800, h = 200
  const values = intradayPoints.map(p => p.value)
  const min = Math.min(...values), max = Math.max(...values)
  const range = max - min || 1
  const step = w / (intradayPoints.length - 1)
  const coords = intradayPoints.map((p, i) => ({
    x: i * step,
    y: h - ((p.value - min) / range) * (h * 0.85) - 14,
  }))
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
  const area = `M0,${h} ${coords.map(c => `L${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')} L${w},${h} Z`
  return { line, area, coords }
})

const intradayStats = {
  max: '0,00%',
  min: '−2,30%',
  close: '−2,05%',
  vsIbov: '−0,63 p.p.',
}

// Pesou — fatores estruturados (alinhado ao pattern das notícias)
const pesouPills = [
  { key: 'juros',    icon: 'i-lucide-percent',       factor: 'Juros futuros', desc: 'Em alta após Copom, pressionou os bancos.',  tickers: ['ITUB4', 'BBDC4'], impact: -1820 },
  { key: 'petroleo', icon: 'i-lucide-fuel',          factor: 'Petróleo',      desc: 'Queda do Brent derrubou o setor de óleo.',    tickers: ['PETR4', 'PRIO3'], impact: -1240 },
  { key: 'dolar',    icon: 'i-lucide-dollar-sign',   factor: 'Dólar firme',   desc: 'Beneficiou exportadoras com receita em USD.', tickers: ['VALE3', 'CSAN3'], impact:   380 },
  { key: 'setor',    icon: 'i-lucide-trending-down', factor: 'Varejo',        desc: 'Setor caiu junto com o mercado.',              tickers: ['MGLU3'],          impact:  -480 },
]

// Notícias do dia
const hojeNews = [
  { id: 1, themeKey: 'macro',       theme: 'Macro · Juros',      icon: 'i-lucide-percent',       headline: 'Copom mantém Selic em 11,75% e sinaliza cautela com inflação de serviços',  source: 'Valor Econômico', time: '13:42', impact: -820, tickers: ['ITUB4', 'BBDC4', 'BBAS3'] },
  { id: 2, themeKey: 'commodities', theme: 'Commodities · Óleo', icon: 'i-lucide-fuel',          headline: 'Petróleo Brent recua 1,2% com tensões geopolíticas no Oriente Médio',      source: 'Reuters',          time: '10:24', impact: -640, tickers: ['PETR4', 'PRIO3'] },
  { id: 3, themeKey: 'mineracao',   theme: 'Mineração',          icon: 'i-lucide-mountain',      headline: 'Vale revisa guidance de produção do 4T para cima após ganho de eficiência', source: 'InfoMoney',        time: '09:48', impact:  380, tickers: ['VALE3'] },
  { id: 4, themeKey: 'inflacao',    theme: 'Macro · Inflação',   icon: 'i-lucide-bar-chart-3',  headline: 'IPCA de abril vem em 0,38%, acima do consenso de 0,32% do mercado',           source: 'Folha',            time: '11:18', impact: -260, tickers: ['MGLU3', 'VVAR3'] },
]

// Resumo Redentia AI
const resumoAI = 'O dia foi puxado pelo movimento de juros futuros — quase metade da queda da sua carteira veio de ITUB4 e BBDC4, que reagiram à decisão do Copom. PETR4 também pesou com queda do petróleo, compensado parcialmente por VALE3 e CSAN3 com o dólar firme. Sem novidades específicas para seus ativos individuais.'
const resumoStats = { macroPct: 78, specificPct: 22, movers: 8 }

// Mercado geral
const marketIndices = [
  { key: 'ibov',  label: 'Ibovespa',  valueLabel: '137.182',  changePct: -1.42, icon: 'i-lucide-bar-chart-3' },
  { key: 'dolar', label: 'Dólar/BRL', valueLabel: 'R$ 5,4225', changePct: -0.21, icon: 'i-lucide-dollar-sign' },
  { key: 'brent', label: 'Brent',     valueLabel: 'US$ 78,40', changePct: -1.18, icon: 'i-lucide-fuel' },
  { key: 'sp500', label: 'S&P 500',   valueLabel: '5.824',    changePct: 0.32, icon: 'i-lucide-globe' },
]
const topGainers = [
  { ticker: 'VALE3', pct: 1.24 },
  { ticker: 'CSAN3', pct: 0.82 },
  { ticker: 'RAIL3', pct: 0.61 },
]
const topLosers = [
  { ticker: 'ITUB4', pct: -2.84 },
  { ticker: 'BBDC4', pct: -2.42 },
  { ticker: 'MGLU3', pct: -1.96 },
]

// Histórico (sparklines deterministas)
const hojeHistory = [
  { label: 'Hoje',        amount: -3868, pct: -2.05, severity: 'high',     sparkline: [0, -0.4, -0.8, -0.6, -1.2, -1.5, -1.4, -1.8, -2.05] },
  { label: 'Ontem',       amount:  1840, pct:  0.98, severity: 'positive', sparkline: [0,  0.2,  0.5,  0.3,  0.6,  0.8,  0.7,  0.9,  0.98] },
  { label: 'Últimos 7d',  amount: -2640, pct: -1.41, severity: 'medium',   sparkline: [0,  0.5,  0.2, -0.4, -0.8, -1.1, -0.9, -1.3, -1.41] },
]

// ============ MERCADO ============
const mercadoTime = '14:58'

const chartPeriods = ['1D', '5D', '1M', '6M', '1A']
const ibovPeriodIdx = ref(2)
const ifixPeriodIdx = ref(2)

function buildChartSvg(points: Array<{ value: number }>) {
  const w = 800, h = 200
  const values = points.map(p => p.value)
  const min = Math.min(...values), max = Math.max(...values)
  const range = max - min || 1
  const step = w / (points.length - 1)
  const coords = points.map((p, i) => ({
    x: i * step,
    y: h - ((p.value - min) / range) * (h * 0.85) - 14,
  }))
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
  const area = `M0,${h} ${coords.map(c => `L${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')} L${w},${h} Z`
  return { line, area, coords }
}

const ibovChart = {
  current:    '176.881,70',
  changePct:  -0.23,
  changeAbs:  '−402 pts',
  open:       '177.283',
  high:       '177.520',
  low:        '176.640',
  volume:     'R$ 24,8 bi',
  points: [
    { label: 'jun', value: 165400 },
    { label: 'jul', value: 168200 },
    { label: 'ago', value: 170100 },
    { label: 'set', value: 169500 },
    { label: 'out', value: 172800 },
    { label: 'nov', value: 174200 },
    { label: 'dez', value: 173100 },
    { label: 'jan', value: 175400 },
    { label: 'fev', value: 176200 },
    { label: 'mar', value: 177500 },
    { label: 'abr', value: 178100 },
    { label: 'mai', value: 176881 },
  ],
}
const ibovSvg = computed(() => buildChartSvg(ibovChart.points))

const ifixChart = {
  current:    '3.420,18',
  changePct:  0.41,
  changeAbs:  '+14 pts',
  open:       '3.418',
  high:       '3.428',
  low:        '3.412',
  volume:     'R$ 380 mi',
  points: [
    { label: 'jun', value: 3280 },
    { label: 'jul', value: 3310 },
    { label: 'ago', value: 3295 },
    { label: 'set', value: 3340 },
    { label: 'out', value: 3360 },
    { label: 'nov', value: 3380 },
    { label: 'dez', value: 3365 },
    { label: 'jan', value: 3390 },
    { label: 'fev', value: 3402 },
    { label: 'mar', value: 3415 },
    { label: 'abr', value: 3408 },
    { label: 'mai', value: 3420 },
  ],
}
const ifixSvg = computed(() => buildChartSvg(ifixChart.points))

const mercadoFeatured = [
  { ticker: 'IBOV',   name: 'Ibovespa',         tag: 'B3',      valueLabel: '176.881,70',  changePct: -0.23, sub: '−402,00 pts',  prevClose: '177.283,83',  isIndex: true,
    sparkline: [0, 0.12, 0.05, -0.08, -0.10, -0.05, -0.15, -0.18, -0.23] },
  { ticker: 'PETR4',  name: 'Petrobras PN N2',  tag: 'Ação',    valueLabel: 'R$ 46,01',     changePct:  1.19,
    sparkline: [0, 0.18, 0.42, 0.32, 0.65, 0.78, 0.95, 1.08, 1.19] },
  { ticker: 'VALE3',  name: 'Vale ON NM',       tag: 'Ação',    valueLabel: 'R$ 82,01',     changePct: -2.21,
    sparkline: [0, -0.32, -0.68, -1.10, -1.45, -1.72, -1.92, -2.10, -2.21] },
  { ticker: 'AAPL34', name: 'Apple DRN',        tag: 'BDR',     valueLabel: 'R$ 73,93',     changePct: -2.29,
    sparkline: [0, -0.25, -0.45, -0.92, -1.32, -1.68, -1.92, -2.15, -2.29] },
  { ticker: 'TSLA34', name: 'Tesla DRN',        tag: 'BDR',     valueLabel: 'R$ 64,12',     changePct: -3.42,
    sparkline: [0, -0.55, -1.20, -1.78, -2.18, -2.62, -2.95, -3.22, -3.42] },
]

const moversTabs = ['Ações', 'ETFs', 'FIIs', 'BDRs']
const moversTabIdx = ref(0)

const moversAltas: Record<string, Array<{ ticker: string; name: string; priceLabel: string; changePct: number }>> = {
  'Ações': [
    { ticker: 'PATI3', name: 'Panatlantica ON',     priceLabel: 'R$ 33,00', changePct: 5.74 },
    { ticker: 'CSMG3', name: 'Copasa ON NM',         priceLabel: 'R$ 53,41', changePct: 3.31 },
    { ticker: 'RECV3', name: 'PetroRecsa ON NM',     priceLabel: 'R$ 12,42', changePct: 3.07 },
    { ticker: 'CSED3', name: 'Cruzeiro Edu ON NM',   priceLabel: 'R$  4,20', changePct: 2.94 },
    { ticker: 'LIGT3', name: 'Light S/A ON NM',       priceLabel: 'R$  4,03', changePct: 2.54 },
  ],
  'ETFs': [
    { ticker: 'PACB11', name: 'BTG Inf Long F11',     priceLabel: 'R$  11,06', changePct: 2.12 },
    { ticker: 'ARGE11', name: 'Investo Arge CI',      priceLabel: 'R$  11,57', changePct: 1.49 },
    { ticker: 'CORN11', name: 'BB ETF Milho CI',      priceLabel: 'R$   7,43', changePct: 1.09 },
    { ticker: 'B5MB11', name: 'Brad IMA-B5 MF11',     priceLabel: 'R$ 130,80', changePct: 0.72 },
    { ticker: 'IMBB11', name: 'Brad IMA-B F11',       priceLabel: 'R$ 149,05', changePct: 0.52 },
  ],
  'FIIs': [
    { ticker: 'MCEM11', name: 'FII MCem CI ER',       priceLabel: 'R$  49,95', changePct: 19.58 },
    { ticker: 'IBBP11', name: 'FII IBBP CI',          priceLabel: 'R$   8,22', changePct: 2.75 },
    { ticker: 'BLMG11', name: 'FII Blue Log CI',      priceLabel: 'R$  31,45', changePct: 1.39 },
    { ticker: 'JSRE11', name: 'FII JS Real CI ER',    priceLabel: 'R$  60,94', changePct: 1.33 },
    { ticker: 'FCFL11', name: 'FII Campus FL CI',     priceLabel: 'R$ 126,33', changePct: 1.06 },
  ],
  'BDRs': [
    { ticker: 'E2ST34', name: 'Elastic NV DRN',       priceLabel: 'R$  22,24', changePct: 12.55 },
    { ticker: 'D1EX34', name: 'Dexcom Inc DRN',       priceLabel: 'R$   6,36', changePct:  9.47 },
    { ticker: 'R2BL34', name: 'Roblox Corp DRN',      priceLabel: 'R$  23,50', changePct:  8.34 },
    { ticker: 'N1OW34', name: 'ServiceNow DRN',       priceLabel: 'R$  10,21', changePct:  7.47 },
    { ticker: 'A1PA34', name: 'Apa Corp DRN',         priceLabel: 'R$ 196,42', changePct:  6.35 },
  ],
}

const moversBaixas: Record<string, Array<{ ticker: string; name: string; priceLabel: string; changePct: number }>> = {
  'Ações': [
    { ticker: 'BAZA3', name: 'Amazônia ON',           priceLabel: 'R$ 73,14', changePct: -11.08 },
    { ticker: 'DASA3', name: 'Dasa ON NM',             priceLabel: 'R$  3,12', changePct:  -8.50 },
    { ticker: 'BHIA3', name: 'Casas Bahia ON NM',      priceLabel: 'R$  1,55', changePct:  -7.19 },
    { ticker: 'LJQQ3', name: 'Quero-Quero ON NM',      priceLabel: 'R$  1,37', changePct:  -6.80 },
    { ticker: 'ETER3', name: 'Eternit ON NM',          priceLabel: 'R$  3,63', changePct:  -5.71 },
  ],
  'ETFs': [
    { ticker: 'DEFI11', name: 'DeFi Hash CI',         priceLabel: 'R$ 12,35', changePct: -11.22 },
    { ticker: 'META11', name: 'Meta Hash CI',          priceLabel: 'R$  7,63', changePct:  -7.96 },
    { ticker: 'QSOL11', name: 'QR Solana CI',          priceLabel: 'R$  5,16', changePct:  -6.86 },
    { ticker: 'SOLH11', name: 'Solana Hash CI',        priceLabel: 'R$ 11,77', changePct:  -6.74 },
    { ticker: 'ETHE11', name: 'Ether Hash CI',         priceLabel: 'R$ 30,39', changePct:  -6.49 },
  ],
  'FIIs': [
    { ticker: 'CACR11', name: 'Cartesia FII CI ER',   priceLabel: 'R$ 36,80', changePct: -4.66 },
    { ticker: 'RZAK11', name: 'FII Riza AKN CI',       priceLabel: 'R$ 82,29', changePct: -3.51 },
    { ticker: 'PVBI11', name: 'FII PVBI VBI CI ER',    priceLabel: 'R$ 74,53', changePct: -3.14 },
    { ticker: 'RZAT11', name: 'FII Arctium CI',        priceLabel: 'R$ 96,07', changePct: -2.95 },
    { ticker: 'EMET11', name: 'FII Emet CI',           priceLabel: 'R$ 10,37', changePct: -2.72 },
  ],
  'BDRs': [
    { ticker: 'S2GM34', name: 'Sigma Lithm DRN',      priceLabel: 'R$    24,25', changePct: -13.85 },
    { ticker: 'M1KT34', name: 'MarketAxess DRN',       priceLabel: 'R$    14,12', changePct: -11.31 },
    { ticker: 'M2PM34', name: 'MP Materials DRN',      priceLabel: 'R$    55,49', changePct: -10.50 },
    { ticker: 'S1RP34', name: 'Sarepta Ther DRN',      priceLabel: 'R$     4,29', changePct:  -9.87 },
    { ticker: 'S1TX34', name: 'Seagate Hold DRN ED',  priceLabel: 'R$ 3.659,39', changePct:  -9.86 },
  ],
}

const cryptos = [
  { ticker: 'BTC',  name: 'Bitcoin',     rank: 1, priceLabel: 'R$ 397.143,36', changePct:  0.00, mcap: 'R$ 8 tri',  vol24h: 'R$ 87,2 bi',  dominance: '60.2%', highlight: true },
  { ticker: 'ETH',  name: 'Ethereum',    rank: 2, priceLabel: 'R$ 11.106,93',  changePct:  0.33 },
  { ticker: 'USDT', name: 'Tether USDt', rank: 3, priceLabel: 'R$ 5,08',        changePct:  0.00 },
  { ticker: 'BNB',  name: 'BNB',         rank: 4, priceLabel: 'R$ 3.319,95',   changePct: -0.50 },
  { ticker: 'XRP',  name: 'XRP',         rank: 5, priceLabel: 'R$ 7,18',        changePct: -0.08 },
  { ticker: 'USDC', name: 'USDC',        rank: 6, priceLabel: 'R$ 5,08',        changePct:  0.00 },
  { ticker: 'SOL',  name: 'Solana',      rank: 7, priceLabel: 'R$ 438,79',     changePct: -0.41 },
]

const tesouroGroups = [
  {
    key: 'ipca', label: 'IPCA+',
    items: [
      { name: 'IPCA+ 2026',                          venc: '08/26', rate: 'IPCA+ 9,62%', priceLabel: 'R$ 4.588' },
      { name: 'IPCA+ Juros Semestrais 2026',         venc: '08/26', rate: 'IPCA+ 9,62%', priceLabel: 'R$ 4.723' },
      { name: 'IPCA+ 2029',                          venc: '05/29', rate: 'IPCA+ 7,80%', priceLabel: 'R$ 3.747' },
      { name: 'IPCA+ Juros Semestrais 2030',         venc: '08/30', rate: 'IPCA+ 7,83%', priceLabel: 'R$ 4.462' },
    ],
  },
  {
    key: 'selic', label: 'Selic',
    items: [
      { name: 'Selic 2027',                          venc: '02/27', rate: 'SELIC + 0,01%', priceLabel: 'R$ 18.985' },
      { name: 'Selic 2028',                          venc: '02/28', rate: 'SELIC + 0,02%', priceLabel: 'R$ 18.977' },
      { name: 'Selic 2029',                          venc: '02/29', rate: 'SELIC + 0,05%', priceLabel: 'R$ 18.958' },
      { name: 'Selic 2031',                          venc: '02/31', rate: 'SELIC + 0,08%', priceLabel: 'R$ 18.905' },
    ],
  },
  {
    key: 'pre', label: 'Prefixado',
    items: [
      { name: 'Prefixado 2027',                      venc: '12/26', rate: '13,90%', priceLabel: 'R$ 920' },
      { name: 'Prefixado Juros Semestrais 2027',     venc: '12/26', rate: '13,97%', priceLabel: 'R$ 1.012' },
      { name: 'Prefixado 2028',                      venc: '12/27', rate: '13,75%', priceLabel: 'R$ 809' },
      { name: 'Prefixado 2029',                      venc: '12/28', rate: '13,82%', priceLabel: 'R$ 710' },
    ],
  },
  {
    key: 'igpm', label: 'IGP-M+',
    items: [
      { name: 'IGPM+ Juros Semestrais 2031',         venc: '12/30', rate: 'IGPM+ 7,98%', priceLabel: 'R$ 7.895' },
    ],
  },
]

const mercadoNoticiasGroups = [
  {
    ticker: 'PETR4', count: 6,
    items: [
      { id: 1, headline: 'Compre Petrobras (PETR4), Prio (PRIO3) e outras 9 ações para ganhar mais de 9% nesta semana', source: 'Itaú BBA', time: '28min' },
      { id: 2, headline: 'JPMorgan eleva títulos da Braskem para compra após subir ação',                                source: 'Folha',    time: '1h' },
      { id: 3, headline: 'O espaço para revisões positivas na Bolsa após o 1T26, segundo a Ágora',                       source: 'InfoMoney', time: '2h' },
    ],
  },
  {
    ticker: 'B3SA3', count: 3,
    items: [
      { id: 4, headline: 'HSRE11, TRXF11, GARE11 puxam aporte estrangeiro em FIIs na B3; entenda o movimento', source: 'Valor', time: '1h' },
      { id: 5, headline: 'Copasa: TCE-MG libera andamento de privatização; ação CSMG3 reabre com alta de 5%',  source: 'O Globo', time: '2h' },
    ],
  },
  {
    ticker: 'BBDC3', count: 3,
    items: [
      { id: 6, headline: 'Paris assume Anbima e planeja regras de transparência na venda de papéis bancários',           source: 'Valor', time: '44min' },
      { id: 7, headline: 'Bradesco (BBDC4) ou Santander (SANB11)? Veja qual banco é o preferido após balanços',          source: 'Suno',  time: '2h' },
    ],
  },
  {
    ticker: 'CSAN3', count: 3,
    items: [
      { id: 8, headline: 'Mercado muda de humor e Cosan sobe forte após sinalização sobre Rumo e Raízen',                source: 'InfoMoney',  time: '2h' },
      { id: 9, headline: 'Levantamento aponta as ações favoritas do agro em maio; veja qual lidera',                     source: 'Money Times', time: '4h' },
    ],
  },
]

function sparkPath(values: number[], w: number, h: number): string {
  const min = Math.min(...values), max = Math.max(...values)
  const range = max - min || 1
  const step = w / (values.length - 1)
  return values.map((v, i) => {
    const x = i * step
    const y = h - ((v - min) / range) * (h * 0.85) - h * 0.075
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

function heatmapLevel(pnl: number, weekend: boolean): string {
  if (weekend) return 'weekend'
  if (pnl === 0) return 'flat'
  if (pnl < -200) return 'loss-strong'
  if (pnl < 0)    return 'loss-soft'
  if (pnl < 200)  return 'win-soft'
  if (pnl < 500)  return 'win-mid'
  return 'win-strong'
}

const heatmapStats = computed(() => {
  const allDays = heatmap.flatMap(m => m.days.filter(d => !d.weekend))
  const wins = allDays.filter(d => d.pnl > 0).length
  const losses = allDays.filter(d => d.pnl < 0).length
  return { wins, losses, total: allDays.length }
})

const operations = [
  { id: 1, dir: 'in',  title: 'Compra PETR4',    date: '14 mai · 14:32', val: '+R$ 1.821' },
  { id: 2, dir: 'in',  title: 'Dividendo BBAS3', date: '12 mai · 09:00', val: '+R$ 84,20' },
  { id: 3, dir: 'out', title: 'Venda VALE3',     date: '10 mai · 16:14', val: '−R$ 3.205' },
  { id: 4, dir: 'in',  title: 'Aporte mensal',   date: '05 mai · 08:00', val: '+R$ 5.000' },
]

// V3 Carteira — renda passiva 12 meses (jun..mai)
const rendaPassiva = [
  { month: 'JUN', pct: 32 },
  { month: 'JUL', pct: 48 },
  { month: 'AGO', pct: 38 },
  { month: 'SET', pct: 62 },
  { month: 'OUT', pct: 55 },
  { month: 'NOV', pct: 72 },
  { month: 'DEZ', pct: 68 },
  { month: 'JAN', pct: 100, hi: true },
  { month: 'FEV', pct: 58 },
  { month: 'MAR', pct: 78 },
  { month: 'ABR', pct: 65 },
  { month: 'MAI', pct: 70 },
]

// ============ RESULTADO (Swing + Day) ============
// Dados sintéticos pra demo. No real, vem de
// useResultadoStats + useDayTradeStats hidratados via
// useMockTrades / API portfolio/results.

const swingResult = {
  periodLabel: '12 meses',
  totalPnl: 18400,
  totalTrades: 47,
  wins: 31,
  losses: 16,
  winRate: 66,
  profitFactor: 2.4,
  rrRatio: '1.92',
  avgWin: 920,
  avgLoss: -480,
  winsValue: 28520,
  lossesValue: -10120,
  longestWinStreak: 6,
  bestTrade: 4820,
  worstTrade: -1240,
  holdingLabel: '12 dias',
  equity: [
    { label: 'Jun', pnl: 1240 },
    { label: 'Jul', pnl: 2160 },
    { label: 'Ago', pnl: -840 },
    { label: 'Set', pnl: 1820 },
    { label: 'Out', pnl: 3420 },
    { label: 'Nov', pnl: 2840 },
    { label: 'Dez', pnl: -620 },
    { label: 'Jan', pnl: 1980 },
    { label: 'Fev', pnl: 1140 },
    { label: 'Mar', pnl: 2620 },
    { label: 'Abr', pnl: 1840 },
    { label: 'Mai', pnl: 800 },
  ],
  topTrades: [
    { id: 's1', ticker: 'PETR4', timeLabel: '14 abr', holdLabel: '12d', pnl: 4820 },
    { id: 's2', ticker: 'WEGE3', timeLabel: '22 mar', holdLabel: '8d',  pnl: 3240 },
    { id: 's3', ticker: 'BBAS3', timeLabel: '08 fev', holdLabel: '18d', pnl: 2840 },
    { id: 's4', ticker: 'ITSA4', timeLabel: '01 fev', holdLabel: '14d', pnl: 2120 },
    { id: 's5', ticker: 'MGLU3', timeLabel: '12 jan', holdLabel: '6d',  pnl: -1240 },
  ],
}

const dayResult = {
  periodLabel: 'últimos 7 dias',
  totalPnl: 1240,
  totalTrades: 14,
  wins: 9,
  losses: 5,
  winRate: 64,
  profitFactor: 1.8,
  rrRatio: '1.55',
  avgWin: 340,
  avgLoss: -220,
  winsValue: 3060,
  lossesValue: -1100,
  longestWinStreak: 4,
  bestTrade: 820,
  worstTrade: -340,
  holdingLabel: '32 min',
  equity: [
    { label: '10h', pnl: 240 },
    { label: '11h', pnl: -120 },
    { label: '12h', pnl: 80 },
    { label: '13h', pnl: 380 },
    { label: '14h', pnl: 420 },
    { label: '15h', pnl: -180 },
    { label: '16h', pnl: 280 },
    { label: '17h', pnl: 140 },
  ],
  topTrades: [
    { id: 'd1', ticker: 'WINM26', timeLabel: '14:32', holdLabel: '18min', pnl: 820 },
    { id: 'd2', ticker: 'PETR4',  timeLabel: '11:08', holdLabel: '42min', pnl: 480 },
    { id: 'd3', ticker: 'VALE3',  timeLabel: '15:24', holdLabel: '28min', pnl: 380 },
    { id: 'd4', ticker: 'BBAS3',  timeLabel: '10:48', holdLabel: '15min', pnl: 220 },
    { id: 'd5', ticker: 'WINM26', timeLabel: '15:02', holdLabel: '12min', pnl: -340 },
  ],
}

const activeResult = computed(() => {
  const r = resultMode.value === 'swing' ? swingResult : dayResult
  const equityMaxAbs = Math.max(...r.equity.map(e => Math.abs(e.pnl))) || 1
  return { ...r, equityMaxAbs }
})
</script>

<style scoped>
/* ============ V3 EDITORIAL CREAM (tokens Figma) ============ */

/* Importa Newsreader serif e Inter pro look editorial */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@500;600&display=swap');

/* Override CSS vars APENAS dentro do shell — não afeta outras pages */
.mx-shell {
  /* Cream paper */
  --paper:          #F4EDD9;
  --paper-soft:     #FAF6EA;
  --paper-2:        #EFE7D0;
  --paper-deep:     #ECE3CC;
  /* Ink */
  --ink:            #1A1F2E;
  --ink-2:          #2D323D;
  --ink-soft:       #4A4D55;
  /* Muted */
  --mut:            #7A7468;
  --mut-2:          #9C9787;
  --dim:            #B8B19D;
  /* Gold (brand) */
  --gold:           #B7873A;
  --gold-deep:      #8A6018;
  --gold-hi:        #D1A75A;
  --gold-soft:      #E8D9B0;
  --gold-tint:      rgba(183, 135, 58, .12);
  /* Sign */
  --neg:            #B12424;
  --neg-soft:       #F2DBDB;
  --pos:            #1B7A4A;
  --pos-soft:       #E0EDDD;
  /* Chips */
  --chip-amber-ink: #8A6018;
  --chip-lilac:     #E5DCED;
  --chip-lilac-ink: #5B4A7A;
  --chip-peach:     #F5D9C0;
  --chip-peach-ink: #8A4A18;
  /* Rules */
  --rule:           rgba(26, 31, 46, .10);
  --rule-2:         rgba(26, 31, 46, .18);
  /* Radii */
  --r-sm:           10px;
  --r-md:           14px;
  --r-lg:           20px;
  /* Fontes */
  --f-serif:        'Newsreader', ui-serif, Georgia, serif;
  --f-sans:         'Inter', ui-sans-serif, system-ui, sans-serif;
  --f-mono:         'JetBrains Mono', ui-monospace, monospace;

  /* Mapeia tokens do V1 pros do V3 (auto-cascade pras outras views) */
  --bg-base:        var(--paper);
  --bg-overlay:     var(--paper-2);
  --bg-elevated:    var(--paper-soft);
  --text-heading:   var(--ink);
  --text-body:      var(--ink-soft);
  --text-muted:     var(--mut);
  --border-subtle:  var(--rule);
  --border-default: var(--rule-2);

  font-family: var(--f-sans);
  color: var(--ink-soft);
  background: var(--paper);
}

/* ============ V3 HOME (Figma blueprint) ============ */
.v3h-appbar {
  display: grid; grid-template-columns: 36px 1fr 36px;
  align-items: center; gap: 12px;
  padding: 14px 18px;
  background: var(--paper);
  position: sticky; top: 0; z-index: 20;
  border-bottom: 1px solid var(--rule);
}
.v3h-seal {
  width: 36px; height: 36px; border-radius: 999px;
  background: radial-gradient(circle at 35% 30%,
    color-mix(in srgb, var(--gold-hi) 75%, white) 0%,
    var(--gold) 65%,
    var(--gold-deep) 100%);
  color: white;
  display: inline-flex; align-items: center; justify-content: center;
  font-family: var(--f-serif);
  font-style: italic;
  font-size: 16px; font-weight: 400;
  box-shadow: inset 0 0 0 1.5px rgba(255,255,255,0.22);
}
.v3h-appbar-title {
  justify-self: center;
  font-family: var(--f-mono);
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--mut);
}
.v3h-iconbtn {
  width: 36px; height: 36px; border-radius: 999px;
  border: 1px solid var(--rule-2);
  background: transparent;
  color: var(--ink);
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 150ms ease;
}
.v3h-iconbtn:hover { background: var(--paper-2); }

.v3h-pad { padding: 0 22px; }
.v3h-hero { padding: 28px 22px 4px; }
.v3h-label-mono {
  font-family: var(--f-mono);
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--mut);
  display: block;
}
.v3h-gold { color: var(--gold) !important; }
.v3h-pos { color: var(--pos); }
.v3h-mut { color: var(--mut); font-weight: 500; }
.v3h-neg-c { color: var(--neg); }
.v3h-pos-c { color: var(--pos); }

.v3h-editorial-h {
  font-family: var(--f-serif);
  font-size: clamp(52px, 12vw, 76px);
  font-weight: 400;
  color: var(--ink);
  letter-spacing: -0.025em;
  line-height: 1;
  margin: 14px 0 0;
}
.v3h-editorial-h .v3h-it { font-style: italic; color: var(--gold); }
.v3h-editorial-h-md {
  font-family: var(--f-serif);
  font-size: clamp(32px, 6.5vw, 44px);
  font-weight: 400;
  color: var(--ink);
  letter-spacing: -0.02em;
  line-height: 1.05;
}
.v3h-editorial-h-md .v3h-it { font-style: italic; color: var(--gold); }
.v3h-editorial-h-sm {
  font-family: var(--f-serif);
  font-size: 26px;
  font-weight: 400;
  color: var(--ink);
  letter-spacing: -0.015em;
  line-height: 1.1;
}
.v3h-editorial-h-sm .v3h-it { font-style: italic; color: var(--gold); }
.v3h-body-sans {
  font-size: 15px;
  line-height: 1.5;
  color: var(--mut);
  margin: 14px 0 0;
}

.v3h-patrim { padding: 26px 22px 6px; }
.v3h-n-hero {
  font-family: var(--f-serif);
  font-size: clamp(50px, 12vw, 74px);
  font-weight: 400;
  color: var(--gold);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
  line-height: 0.95;
  margin: 10px 0 0;
  display: block;
}
.v3h-n-hero .v3h-dec { color: var(--mut); font-size: 0.85em; }
.v3h-delta {
  display: inline-flex; align-items: center; gap: 6px;
  margin: 14px 0 0;
  font-size: 14px; font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.v3h-ribbon {
  display: grid; grid-template-columns: 32px 1fr;
  align-items: center; gap: 12px;
  margin: 22px 22px 0;
  padding: 14px 16px;
  background: var(--neg-soft);
  border: 1px solid rgba(177, 36, 36, 0.18);
  border-radius: var(--r-md);
}
.v3h-ribbon-ic {
  width: 32px; height: 32px; border-radius: 999px;
  background: var(--neg);
  color: white;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700;
}
.v3h-ribbon-text {
  margin: 0;
  font-size: 14px; line-height: 1.5;
  color: var(--ink);
}
.v3h-ribbon-text b { font-weight: 700; }

.v3h-pills-row {
  display: flex; gap: 8px;
  margin: 20px 22px 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.v3h-pills-row::-webkit-scrollbar { display: none; }
.v3h-pill {
  display: inline-flex; align-items: center; gap: 7px;
  flex-shrink: 0;
  padding: 7px 14px 7px 10px;
  border-radius: 999px;
  background: var(--paper-2);
  border: 1px solid var(--rule-2);
  font-size: 13px; font-weight: 600;
  color: var(--ink-2);
  font-variant-numeric: tabular-nums;
}
.v3h-pill .v3h-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--mut); }
.v3h-pill .v3h-dim { margin-left: 4px; color: var(--mut); font-weight: 500; }
.v3h-pill.v3h-amber {
  background: var(--gold-soft);
  border-color: rgba(138, 96, 24, 0.18);
  color: var(--chip-amber-ink);
}
.v3h-pill.v3h-amber .v3h-dot { background: var(--gold); }
.v3h-pill.v3h-amber .v3h-dim { color: rgba(138, 96, 24, 0.6); }
.v3h-pill.v3h-lilac {
  background: var(--chip-lilac);
  border-color: rgba(91, 74, 122, 0.18);
  color: var(--chip-lilac-ink);
}
.v3h-pill.v3h-lilac .v3h-dot { background: var(--chip-lilac-ink); }
.v3h-pill.v3h-lilac .v3h-dim { color: rgba(91, 74, 122, 0.6); }
.v3h-pill.v3h-peach {
  background: var(--chip-peach);
  border-color: rgba(138, 74, 24, 0.18);
  color: var(--chip-peach-ink);
}
.v3h-pill.v3h-peach .v3h-dot { background: var(--chip-peach-ink); }
.v3h-pill.v3h-peach .v3h-dim { color: rgba(138, 74, 24, 0.6); }

.v3h-ornament {
  display: grid; grid-template-columns: 1fr auto 1fr;
  align-items: center; gap: 16px;
  margin: 32px 22px;
  color: var(--gold);
}
.v3h-ornament-line { height: 1px; background: var(--rule); }
.v3h-ornament-o { font-size: 12px; color: var(--gold); }

.v3h-shortcuts {
  display: flex; gap: 10px;
  padding: 4px 22px 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.v3h-shortcuts::-webkit-scrollbar { display: none; }
.v3h-shortcut {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  flex-shrink: 0;
  width: 76px;
  padding: 14px 8px 12px;
  background: var(--paper-soft);
  border: 1px solid var(--rule);
  border-radius: var(--r-md);
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease;
}
.v3h-shortcut:hover { background: var(--paper-2); border-color: var(--rule-2); }
.v3h-shortcut-ic { color: var(--gold); }
.v3h-shortcut-lbl {
  font-size: 11px; font-weight: 500;
  color: var(--ink);
  text-align: center;
  line-height: 1.2;
}

.v3h-intra-head {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 12px;
  margin: 10px 0 0;
}
.v3h-n-sm {
  font-size: 16px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.v3h-intra-chart { width: 100%; height: 160px; display: block; margin: 16px 0 0; }
.v3h-intra-stats {
  display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 12px;
  margin: 16px 0 0;
  padding-top: 14px;
  border-top: 1px solid var(--rule);
}
.v3h-intra-stat { display: flex; flex-direction: column; gap: 4px; }
.v3h-intra-stat.v3h-center { align-items: center; }
.v3h-intra-stat:last-child { align-items: flex-end; }
.v3h-intra-stat-val {
  font-size: 14px; font-weight: 700;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.v3h-events { display: flex; flex-direction: column; margin: 16px 0 0; }
.v3h-ev {
  display: grid; grid-template-columns: 44px 1fr auto;
  align-items: center; gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid var(--rule);
}
.v3h-ev:last-child { border-bottom: 0; }
.v3h-ev-date {
  display: flex; flex-direction: column; align-items: center;
  padding: 6px 0;
  background: var(--paper-soft);
  border: 1px solid var(--rule);
  border-radius: var(--r-sm);
}
.v3h-ev-d {
  font-family: var(--f-serif);
  font-size: 18px; font-weight: 400;
  color: var(--ink);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.v3h-ev-m {
  margin-top: 2px;
  font-family: var(--f-mono);
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--mut);
}
.v3h-ev-tk {
  font-family: var(--f-mono);
  font-size: 13px; font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--ink);
}
.v3h-tag {
  display: inline-block;
  margin-left: 8px;
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 5px;
  border: 1px solid;
}
.v3h-tag.v3h-tag-div {
  background: var(--pos-soft);
  border-color: rgba(27, 122, 74, 0.18);
  color: var(--pos);
}
.v3h-tag.v3h-tag-jcp {
  background: var(--gold-tint);
  border-color: rgba(138, 96, 24, 0.18);
  color: var(--chip-amber-ink);
}
.v3h-ev-amount {
  font-size: 14px; font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--pos);
}

.v3h-movers {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin: 16px 0 0;
}
.v3h-movers-list { margin-top: 10px; }
.v3h-mover-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--rule);
}
.v3h-mover-row:last-child { border-bottom: 0; }
.v3h-mover-left { display: inline-flex; align-items: center; gap: 8px; }
.v3h-asset {
  width: 26px; height: 26px; border-radius: 999px;
  background: var(--paper-2);
  border: 1px solid var(--rule);
  color: var(--ink);
  display: inline-flex; align-items: center; justify-content: center;
  font-family: var(--f-serif);
  font-style: italic;
  font-size: 13px; font-weight: 400;
}
.v3h-mover-tk {
  font-family: var(--f-mono);
  font-size: 13px; font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--ink);
}
.v3h-mover-pct {
  font-size: 13px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.v3h-news-list { margin-top: 16px; }
.v3h-news-card {
  padding: 14px 0;
  border-bottom: 1px solid var(--rule);
}
.v3h-news-card:last-child { border-bottom: 0; }
.v3h-news-meta {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--f-mono);
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--mut);
  margin-bottom: 6px;
}
.v3h-news-headline {
  margin: 0 0 8px;
  font-size: 15px; font-weight: 500;
  line-height: 1.4;
  color: var(--ink);
  letter-spacing: -0.005em;
}
.v3h-news-tags { display: inline-flex; gap: 6px; flex-wrap: wrap; }
.v3h-news-tag {
  font-family: var(--f-mono);
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.04em;
  padding: 3px 7px;
  border-radius: 4px;
  background: var(--paper-2);
  border: 1px solid var(--rule);
  color: var(--ink-2);
}

.v3h-sug-list { margin-top: 18px; }
.v3h-sug {
  display: grid; grid-template-columns: 32px 1fr;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid var(--rule);
}
.v3h-sug:last-child { border-bottom: 0; }
.v3h-sug-num {
  font-family: var(--f-serif);
  font-style: italic;
  font-size: 22px; font-weight: 400;
  color: var(--gold);
  line-height: 1;
}
.v3h-sug-title {
  font-size: 15px; font-weight: 600;
  color: var(--ink);
  letter-spacing: -0.005em;
  margin: 0 0 4px;
}
.v3h-sug-body {
  margin: 0 0 10px;
  font-size: 13px; line-height: 1.45;
  color: var(--mut);
}
.v3h-pill-outline {
  display: inline-flex; align-items: center;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--rule-2);
  border-radius: 999px;
  font-size: 12px; font-weight: 600;
  color: var(--ink);
  cursor: pointer;
}
.v3h-pill-outline:hover { border-color: var(--gold); color: var(--gold); }

.v3h-bench-chart { width: 100%; height: 50px; display: block; margin: 16px 0 12px; }
.v3h-bench-row { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 10px; }
.v3h-bench-item {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.v3h-ldot { width: 8px; height: 8px; border-radius: 999px; }
.v3h-bench-item:nth-child(1) .v3h-ldot { background: var(--gold); }
.v3h-bench-item:nth-child(2) .v3h-ldot { background: var(--ink-2); }
.v3h-bench-item:nth-child(3) .v3h-ldot { background: var(--mut-2); }

.v3h-highlight {
  display: flex; flex-direction: column; gap: 14px;
  margin: 0 22px;
  padding: 22px;
  background: linear-gradient(135deg, var(--gold-soft) 0%, var(--paper-2) 100%);
  border: 1px solid rgba(138, 96, 24, 0.20);
  border-radius: var(--r-lg);
  position: relative;
  overflow: hidden;
}
.v3h-highlight::before {
  content: '';
  position: absolute; top: -50%; right: -10%;
  width: 240px; height: 240px;
  background: radial-gradient(circle, var(--gold-tint) 0%, transparent 65%);
  pointer-events: none;
}
.v3h-highlight-body { position: relative; z-index: 1; }
.v3h-btn-gold {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 18px;
  background: var(--gold);
  color: var(--paper-soft);
  border-radius: 999px;
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: background 200ms ease, transform 150ms ease;
}
.v3h-btn-gold:hover { background: var(--gold-deep); transform: translateY(-1px); }
.v3h-btn-ghost {
  display: inline-flex; align-items: center; gap: 6px;
  background: transparent;
  color: var(--ink);
  font-size: 13px; font-weight: 600;
  cursor: pointer;
}
.v3h-btn-ghost:hover { color: var(--gold); }

.v3h-carta {
  display: grid; grid-template-columns: 1fr 60px;
  align-items: start; gap: 16px;
  margin: 32px 22px 0;
  padding: 22px;
  background: var(--paper-soft);
  border: 1px solid var(--rule);
  border-radius: var(--r-lg);
}
.v3h-seal-ring {
  width: 60px; height: 60px; border-radius: 999px;
  border: 2px solid var(--gold);
  color: var(--gold);
  display: inline-flex; align-items: center; justify-content: center;
  font-family: var(--f-mono);
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.14em;
}

.v3h-search-fab {
  position: fixed;
  bottom: 80px;
  left: 16px; right: 16px;
  z-index: 30;
  display: flex; align-items: center; gap: 10px;
  padding: 13px 18px;
  background: var(--paper-soft);
  border: 1px solid var(--rule-2);
  border-radius: 999px;
  box-shadow: 0 12px 32px -10px rgba(26, 31, 46, 0.20);
  cursor: pointer;
  transition: border-color 150ms ease, transform 150ms ease;
}
@media (min-width: 1024px) {
  .v3h-search-fab { left: 50%; transform: translateX(-50%); width: 520px; right: auto; bottom: 96px; }
  .v3h-search-fab:hover { transform: translateX(-50%) translateY(-1px); }
}
.v3h-search-fab:hover { border-color: var(--gold); }
.v3h-search-fab-ph { flex: 1; font-size: 14px; color: var(--mut); }
.v3h-search-fab-kbd {
  font-family: var(--f-mono);
  font-size: 11px;
  padding: 3px 7px;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-radius: 5px;
  color: var(--mut);
}

.v3h-tabbar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 40;
  display: grid; grid-template-columns: repeat(5, 1fr);
  padding: 8px 0 max(8px, env(safe-area-inset-bottom));
  background: rgba(244, 237, 217, 0.92);
  backdrop-filter: blur(14px);
  border-top: 1px solid var(--rule);
}
@media (min-width: 1024px) {
  .v3h-tabbar {
    left: 50%; transform: translateX(-50%); right: auto;
    width: 520px; bottom: 18px;
    border-radius: 999px;
    border: 1px solid var(--rule);
    padding: 6px;
    background: var(--paper-soft);
  }
}
.v3h-tab-wrap { position: relative; display: flex; justify-content: center; }
.v3h-tab-active-bar {
  position: absolute;
  top: 0; left: 30%; right: 30%;
  height: 2px;
  background: var(--gold);
  border-radius: 0 0 999px 999px;
}
.v3h-tab {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 8px 6px 4px;
  background: transparent;
  color: var(--mut);
  cursor: pointer;
}
.v3h-tab-active { color: var(--gold); }
.v3h-tab-lbl {
  font-family: var(--f-mono);
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.10em;
  text-transform: uppercase;
}

/* ============ V3 CARTEIRA (extensão Figma) ============ */
.v3h-mini-pills {
  display: flex; gap: 8px; flex-wrap: wrap;
  margin-top: 18px;
}
.v3h-mini-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 11px;
  background: var(--paper-2);
  border: 1px solid var(--rule);
  border-radius: 999px;
  font-family: var(--f-mono);
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mut);
}
.v3h-mini-dot {
  width: 5px; height: 5px; border-radius: 999px;
  background: var(--mut);
}
.v3h-mini-dot-gold { background: var(--gold); }

.v3h-stats-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 1px;
  margin: 0;
  background: var(--rule);
  border-radius: var(--r-md);
  overflow: hidden;
}
@media (min-width: 768px) { .v3h-stats-grid { grid-template-columns: repeat(4, 1fr); } }
.v3h-stat-card {
  display: flex; flex-direction: column; gap: 6px;
  padding: 14px 16px;
  background: var(--paper-soft);
}
.v3h-stat-val {
  font-family: var(--f-serif);
  font-size: 22px; font-weight: 400;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  line-height: 1;
  letter-spacing: -0.015em;
  margin: 4px 0 0;
}

.v3h-composicao-list {
  list-style: none; padding: 0; margin: 18px 0 0;
}
.v3h-comp-row {
  display: grid; grid-template-columns: 120px 1fr 90px;
  align-items: center; gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid var(--rule);
}
.v3h-comp-row:last-child { border-bottom: 0; }
.v3h-comp-tag {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  font-family: var(--f-mono);
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
}
.v3h-comp-tag.v3h-amber {
  background: var(--gold-soft);
  color: var(--chip-amber-ink);
  border: 1px solid rgba(138, 96, 24, 0.18);
}
.v3h-comp-tag.v3h-amber .v3h-dot { background: var(--gold); width: 6px; height: 6px; border-radius: 999px; }
.v3h-comp-tag.v3h-lilac {
  background: var(--chip-lilac);
  color: var(--chip-lilac-ink);
  border: 1px solid rgba(91, 74, 122, 0.18);
}
.v3h-comp-tag.v3h-lilac .v3h-dot { background: var(--chip-lilac-ink); width: 6px; height: 6px; border-radius: 999px; }
.v3h-comp-tag.v3h-peach {
  background: var(--chip-peach);
  color: var(--chip-peach-ink);
  border: 1px solid rgba(138, 74, 24, 0.18);
}
.v3h-comp-tag.v3h-peach .v3h-dot { background: var(--chip-peach-ink); width: 6px; height: 6px; border-radius: 999px; }
.v3h-comp-bar {
  height: 6px;
  background: var(--paper-2);
  border-radius: 999px;
  overflow: hidden;
}
.v3h-comp-bar span {
  display: block; height: 100%;
}
.v3h-comp-val { text-align: right; display: flex; flex-direction: column; gap: 2px; }
.v3h-comp-val-money {
  font-family: var(--f-serif);
  font-size: 15px; font-weight: 400;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.v3h-comp-val-pct {
  font-family: var(--f-mono);
  font-size: 11px; font-weight: 600;
  color: var(--mut);
  font-variant-numeric: tabular-nums;
}

.v3h-period-pills {
  display: flex; gap: 6px;
  margin: 14px 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.v3h-period-pills::-webkit-scrollbar { display: none; }
.v3h-period-pill {
  padding: 5px 12px;
  background: transparent;
  border: 1px solid var(--rule-2);
  border-radius: 999px;
  font-family: var(--f-mono);
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--mut);
  cursor: pointer;
}
.v3h-period-pill-active {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--paper-soft);
}

.v3h-pos-groups {
  list-style: none; padding: 0; margin: 16px 0 0;
}
.v3h-pos-group {
  display: grid; grid-template-columns: 140px 1fr auto 20px;
  align-items: center; gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid var(--rule);
}
.v3h-pos-group:last-child { border-bottom: 0; }
.v3h-pos-group-tag {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px; font-weight: 600;
}
.v3h-pos-group-tag.v3h-amber { background: var(--gold-soft); color: var(--chip-amber-ink); border: 1px solid rgba(138, 96, 24, 0.18); }
.v3h-pos-group-tag.v3h-amber .v3h-dot { background: var(--gold); width: 6px; height: 6px; border-radius: 999px; }
.v3h-pos-group-tag.v3h-lilac { background: var(--chip-lilac); color: var(--chip-lilac-ink); border: 1px solid rgba(91, 74, 122, 0.18); }
.v3h-pos-group-tag.v3h-lilac .v3h-dot { background: var(--chip-lilac-ink); width: 6px; height: 6px; border-radius: 999px; }
.v3h-pos-group-tag.v3h-peach { background: var(--chip-peach); color: var(--chip-peach-ink); border: 1px solid rgba(138, 74, 24, 0.18); }
.v3h-pos-group-tag.v3h-peach .v3h-dot { background: var(--chip-peach-ink); width: 6px; height: 6px; border-radius: 999px; }
.v3h-pos-group-count {
  font-family: var(--f-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
}
.v3h-pos-group-pct {
  font-size: 14px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.v3h-pos-group-chev {
  color: var(--mut);
}

.v3h-renda-split {
  display: flex; gap: 10px; flex-wrap: wrap;
  margin: 12px 0 16px;
}
.v3h-renda-pill {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--ink);
}
.v3h-renda-dot { width: 8px; height: 8px; border-radius: 999px; }

.v3h-renda-chart {
  display: grid; grid-template-columns: repeat(12, 1fr);
  gap: 6px;
  height: 130px;
  margin: 8px 0 0;
}
.v3h-renda-col {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  height: 100%;
}
.v3h-renda-bar-area {
  width: 100%;
  flex: 1;
  display: flex;
  align-items: flex-end;
}
.v3h-renda-bar {
  width: 100%;
  background: var(--paper-2);
  border-radius: 4px;
  min-height: 4px;
}
.v3h-renda-bar-hi { background: var(--gold); }
.v3h-renda-label {
  font-family: var(--f-mono);
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--mut);
}

.v3h-renda-stats {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin: 18px 0 0;
  padding-top: 14px;
  border-top: 1px solid var(--rule);
}
.v3h-renda-stat { display: flex; flex-direction: column; gap: 4px; }
.v3h-renda-stat:nth-child(2) { align-items: center; }
.v3h-renda-stat:last-child { align-items: flex-end; }
.v3h-renda-stat-val {
  font-family: var(--f-serif);
  font-size: 17px; font-weight: 400;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

/* ============ V3 CARTA (Figma blueprint) ============ */
.v3h-carta-hero {
  padding: 32px 22px 0;
}
.v3h-carta-meta-row {
  display: flex; justify-content: space-between; align-items: baseline;
  gap: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--rule);
}
.v3h-carta-body {
  margin: 22px 0 0;
  font-family: var(--f-serif);
  font-size: 17px;
  line-height: 1.6;
  color: var(--ink-soft);
  letter-spacing: -0.005em;
}
.v3h-carta-body b { font-weight: 500; color: var(--ink); }

.v3h-carta-stats {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
  margin: 28px 0 0;
  background: var(--rule);
  border-radius: var(--r-md);
  overflow: hidden;
}

.v3h-toc {
  list-style: none; padding: 0; margin: 16px 0 0;
}
.v3h-toc-item {
  display: grid; grid-template-columns: 36px 1fr 18px;
  align-items: center; gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid var(--rule);
  cursor: pointer;
}
.v3h-toc-item:last-child { border-bottom: 0; }
.v3h-toc-item:hover .v3h-toc-arr { transform: translate(2px, -2px); color: var(--gold); }
.v3h-toc-num {
  font-family: var(--f-serif);
  font-style: italic;
  font-size: 28px; font-weight: 400;
  color: var(--gold);
  line-height: 1;
}
.v3h-toc-body { min-width: 0; }
.v3h-toc-title {
  margin: 0;
  font-family: var(--f-serif);
  font-size: 18px; font-weight: 400;
  color: var(--ink);
  letter-spacing: -0.015em;
}
.v3h-toc-sub {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--mut);
  letter-spacing: 0.02em;
}
.v3h-toc-arr {
  color: var(--mut);
  transition: transform 180ms ease, color 180ms ease;
}

.v3h-carta-closing {
  display: grid; grid-template-columns: 1fr auto;
  align-items: center; gap: 16px;
  margin: 0 22px;
  padding: 22px;
  background: var(--paper-soft);
  border: 1px solid var(--rule);
  border-radius: var(--r-lg);
}
.v3h-carta-sign {
  margin: 0;
  font-family: var(--f-serif);
  font-style: italic;
  font-size: 16px;
  color: var(--mut);
}

/* Esconder o floating menu antigo na V3 */
.mx-floating-menu { display: none !important; }

/* ============ V8 RESPONSIVE ============ */

.mx-shell {
  min-height: 100vh;
  background: var(--bg-base);
  color: var(--text-body);
  position: relative;
}

.mx-pos { color: var(--brand-positive); }
.mx-neg { color: var(--brand-negative); }
.mx-amber { color: var(--brand-primary); }
.mx-mut { color: var(--text-muted); }
.mx-text-heading { color: var(--text-heading); }
.mx-tn  { font-variant-numeric: tabular-nums; }
.mx-r   { text-align: right; }

.mx-pos-bg { background: var(--brand-positive); }
.mx-neg-bg { background: var(--brand-negative); }

.mx-eyebrow {
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--text-muted);
  margin: 0;
}

.mx-kbd {
  font-family: monospace; font-size: 10px;
  padding: 3px 7px; border-radius: 5px;
  background: var(--bg-base);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
}

/* ============ MOBILE/DESKTOP VISIBILITY ============ */
.mx-show-d { display: none !important; }

@media (max-width: 1023.98px) {
  /* Shell fluido — escala 100% da largura do viewport até o breakpoint desktop */
  .mx-sidebar     { display: none !important; }
  .mx-topbar-d    { display: none !important; }
}

@media (min-width: 1024px) {
  .mx-shell {
    display: grid;
    grid-template-columns: 280px 1fr;
  }
  .mx-show-d           { display: revert !important; }
  .mx-grid-2.mx-show-d { display: grid !important; }
  .mx-grid-3.mx-show-d { display: grid !important; }
  .mx-hide-d           { display: none !important; }
  .mx-topbar-m         { display: none !important; }
  .mx-hero-m           { display: none !important; }
  .mx-floating-menu    { display: none !important; }
  .mx-sb-pro           { display: block !important; }
  .mx-feature-orange-list { display: flex !important; }
}

/* ============ SIDEBAR (desktop) ============ */
.mx-sidebar {
  position: sticky; top: 0;
  height: 100vh;
  display: flex; flex-direction: column;
  padding: 24px 18px;
  background: var(--bg-elevated);
  border-right: 1px solid var(--border-subtle);
}
.mx-logo {
  display: flex; align-items: center; gap: 10px;
  padding: 4px 12px 22px;
}
.mx-logo-mark {
  width: 32px; height: 32px; border-radius: 10px;
  background: var(--brand-primary);
  color: white;
  font-size: 16px; font-weight: 800;
  display: inline-flex; align-items: center; justify-content: center;
  letter-spacing: -0.02em;
}
.mx-logo-name {
  font-size: 16px; font-weight: 600;
  color: var(--text-heading);
  letter-spacing: -0.02em;
}
.mx-logo-tag {
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 2px 7px; border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
}

.mx-sb-nav { flex: 1; overflow-y: auto; padding-right: 4px; }
.mx-sb-nav::-webkit-scrollbar { width: 6px; }
.mx-sb-nav::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 999px; }

.mx-sb-group { margin-bottom: 18px; }
.mx-sb-h {
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-muted);
  margin: 0 12px 6px;
}
.mx-sb-item {
  display: flex; align-items: center; gap: 12px;
  width: 100%;
  padding: 9px 12px;
  border-radius: 10px;
  background: transparent;
  color: var(--text-body);
  font-size: 14px; font-weight: 500;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
  text-align: left;
}
.mx-sb-item:hover { background: color-mix(in srgb, var(--text-heading) 5%, transparent); color: var(--text-heading); }
.mx-sb-active {
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  color: var(--brand-primary);
  font-weight: 700;
}
.mx-sb-active:hover { background: color-mix(in srgb, var(--brand-primary) 16%, transparent); color: var(--brand-primary); }
.mx-sb-label { flex: 1; }
.mx-sb-badge {
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 2px 7px; border-radius: 999px;
  background: var(--brand-primary);
  color: white;
}
.mx-sb-pro {
  display: none;
  margin: 12px 4px 14px;
  padding: 14px 16px;
  background: var(--brand-primary);
  color: white;
  border-radius: 14px;
}
.mx-sb-pro-tag {
  display: inline-block;
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase;
  padding: 3px 8px; border-radius: 999px;
  background: rgba(255,255,255,0.22);
  margin-bottom: 8px;
}
.mx-sb-pro-body {
  margin: 0 0 10px;
  font-size: 13px; line-height: 1.4;
  color: white;
  font-weight: 600;
}
.mx-sb-pro-cta {
  display: inline-flex; align-items: center;
  font-size: 12px; font-weight: 700;
  color: white;
  background: rgba(255,255,255,0.18);
  padding: 7px 12px; border-radius: 999px;
  cursor: pointer;
  transition: background-color 150ms ease;
}
.mx-sb-pro-cta:hover { background: rgba(255,255,255,0.30); }

.mx-sb-foot {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 150ms ease;
}
.mx-sb-foot:hover { background: color-mix(in srgb, var(--text-heading) 5%, transparent); }
.mx-sb-avatar {
  width: 36px; height: 36px; border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
  color: var(--brand-primary);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700;
}
.mx-sb-foot-meta { flex: 1; min-width: 0; }
.mx-sb-foot-name { margin: 0; font-size: 13px; font-weight: 600; color: var(--text-heading); }
.mx-sb-foot-email {
  margin: 0; font-size: 11px; color: var(--text-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mx-sb-foot-chev { color: var(--text-muted); }

/* ============ MAIN ============ */
.mx-main { min-width: 0; padding-bottom: 120px; }
@media (min-width: 1024px) {
  .mx-main {
    padding: 28px 36px 60px;
    max-width: 1280px;
    display: flex; flex-direction: column;
    gap: 24px;
  }
}

/* ============ TOPBAR DESKTOP ============ */
.mx-topbar-d {
  display: flex; align-items: center; justify-content: space-between;
  gap: 24px;
}
.mx-topbar-d-title { display: flex; flex-direction: column; gap: 4px; }
.mx-page-title {
  font-size: 24px; font-weight: 700;
  color: var(--text-heading);
  letter-spacing: -0.015em;
  margin: 0;
}
.mx-topbar-d-actions { display: flex; align-items: center; gap: 10px; }
.mx-search-d {
  display: flex; align-items: center; gap: 10px;
  width: 340px;
  padding: 9px 14px;
  background: var(--bg-overlay);
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  transition: border-color 150ms ease;
}
.mx-search-d:focus-within {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, var(--border-subtle));
  background: var(--bg-elevated);
}
.mx-search-d-icon { color: var(--brand-primary); }
.mx-search-d input {
  flex: 1; background: transparent;
  border: 0; outline: 0;
  font-size: 13px;
  color: var(--text-heading);
}
.mx-search-d input::placeholder { color: var(--text-muted); }

.mx-icon-d {
  position: relative;
  width: 40px; height: 40px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 999px;
  color: var(--text-heading);
  background: var(--bg-overlay);
  cursor: pointer;
  transition: background-color 150ms ease;
}
.mx-icon-d:hover { background: var(--bg-elevated); }
.mx-icon-d-dot {
  position: absolute; top: 9px; right: 9px;
  width: 8px; height: 8px; border-radius: 999px;
  background: var(--brand-primary);
}

/* ============ HERO MOBILE (amber flood) ============ */
.mx-hero-m {
  background: var(--brand-primary);
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
  padding-bottom: 22px;
}
.mx-topbar-m {
  display: flex; align-items: center; justify-content: space-between;
  padding: 50px 20px 16px;
}
.mx-hero-m .mx-topbar-m { padding: 50px 20px 14px; }
.mx-topbar-m-brand { display: flex; align-items: center; gap: 8px; }
.mx-brand-mark {
  width: 32px; height: 32px; border-radius: 10px;
  background: var(--brand-primary);
  color: white;
  font-size: 16px; font-weight: 800;
  display: inline-flex; align-items: center; justify-content: center;
}
.mx-brand-name {
  font-size: 16px; font-weight: 600;
  color: var(--text-heading);
  letter-spacing: -0.02em;
}
.mx-brand-tag {
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 2px 7px; border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  margin-left: 2px;
}
.mx-hero-m .mx-brand-mark { background: white; color: var(--brand-primary); }
.mx-hero-m .mx-brand-name { color: white; }
.mx-hero-m .mx-brand-tag { background: rgba(255,255,255,0.18); color: white; }
.mx-topbar-m-title {
  font-size: 17px; font-weight: 700;
  color: var(--text-heading);
  letter-spacing: -0.01em;
}
.mx-topbar-m-icons { display: flex; align-items: center; gap: 4px; }

.mx-icon-btn {
  position: relative;
  width: 40px; height: 40px;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--text-heading);
  border-radius: 999px;
  transition: background-color 150ms ease;
}
.mx-icon-btn:hover { background: var(--bg-overlay); }
.mx-icon-back { width: 32px; height: 32px; }
.mx-hero-m .mx-icon-btn { color: white; }
.mx-hero-m .mx-icon-btn:hover { background: rgba(255,255,255,0.14); }
.mx-badge {
  position: absolute; top: 4px; right: 4px;
  min-width: 16px; height: 16px; border-radius: 999px;
  background: var(--brand-primary); color: white;
  font-size: 9px; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0 4px;
}
.mx-hero-m .mx-badge { background: white; color: var(--brand-primary); }

.mx-greeting-m {
  margin: 0;
  padding: 4px 20px 14px;
  font-size: 14px;
  color: white;
}
.mx-greeting-m strong { font-weight: 700; color: white; }
.mx-greeting-m-sub { color: rgba(255,255,255,0.72); }

.mx-search-wrap { padding: 0 20px; }
.mx-search-pill {
  display: flex; align-items: center; gap: 12px;
  width: 100%;
  padding: 14px 18px;
  background: white;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 8px 18px -8px rgba(0,0,0,0.20);
  transition: transform 180ms ease, box-shadow 180ms ease;
}
.mx-search-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px -8px rgba(0,0,0,0.24);
}
.mx-search-icon { color: var(--brand-primary); flex-shrink: 0; }
.mx-search-placeholder {
  flex: 1; text-align: left;
  font-size: 15px; font-weight: 500;
  color: var(--text-muted);
}
.mx-search-kbd {
  font-family: monospace; font-size: 10px;
  padding: 4px 8px; border-radius: 6px;
  background: var(--bg-overlay);
  color: var(--text-muted);
}

/* ============ HERO DESKTOP ============ */
.mx-hero-d { padding: 12px 0 4px; }
.mx-hero-title {
  font-size: 36px; font-weight: 400;
  color: var(--text-heading);
  letter-spacing: -0.025em;
  margin: 6px 0 6px;
  line-height: 1.1;
}
.mx-hero-sub {
  margin: 0;
  font-size: 15px;
  color: var(--text-body);
  line-height: 1.5;
  max-width: 60ch;
}

/* ============ SECTIONS / GRID ============ */
.mx-section { padding: 16px 20px; }
.mx-section-conta { padding-top: 18px; padding-bottom: 8px; }
.mx-section-flush { padding: 18px 0; }
.mx-pad-x { padding-left: 20px; padding-right: 20px; }
.mx-tiles-section { padding-top: 8px; padding-bottom: 8px; }
.mx-rule { border: 0; border-top: 1px solid var(--border-subtle); margin: 16px 0; }
.mx-mode-section { padding-bottom: 4px; padding-top: 12px; }

@media (min-width: 1024px) {
  .mx-section { padding: 0; }
  .mx-section-conta { padding: 0; }
  .mx-section-flush { padding: 0; }
  .mx-pad-x { padding: 0; }
  .mx-tiles-section { padding: 0; }
  .mx-rule { display: none; }
}

.mx-section-h {
  margin: 0 0 14px;
  font-size: 13px; font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.06em; text-transform: uppercase;
}

.mx-grid { display: grid; gap: 16px; }
.mx-grid-2 { grid-template-columns: 1fr; }
.mx-grid-3 { grid-template-columns: 1fr; }
@media (min-width: 1024px) {
  .mx-grid-2 { grid-template-columns: 1fr 1fr; }
  .mx-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
  .mx-grid-2-d { grid-template-columns: 1fr 1fr; gap: 16px; }
  .mx-grid-3-d { grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
}
@media (max-width: 1100px) and (min-width: 1024px) {
  .mx-grid-3 { grid-template-columns: 1fr 1fr; }
}

.mx-label {
  font-size: 13px; font-weight: 500;
  color: var(--text-muted);
  margin: 0;
}

.mx-section-h2 {
  margin: 0 0 14px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-heading);
  letter-spacing: -0.01em;
}
.mx-list-head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.mx-list-h { margin: 0; }
.mx-list-link {
  background: transparent;
  font-size: 13px; font-weight: 600;
  color: var(--brand-primary);
  cursor: pointer;
}
.mx-list-link:hover { text-decoration: underline; }
.mx-list-add {
  width: 32px; height: 32px; border-radius: 999px;
  background: var(--bg-overlay);
  color: var(--text-heading);
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.mx-list-more {
  margin-top: 14px;
  display: flex; align-items: center; gap: 4px;
  background: transparent;
  font-size: 13px; font-weight: 600;
  color: var(--brand-primary);
  cursor: pointer;
}

/* ============ MOBILE SALDO ============ */
.mx-balance-row {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%;
  padding: 4px 0;
  background: transparent;
  cursor: pointer;
}
.mx-balance {
  font-size: clamp(32px, 9vw, 40px);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
  line-height: 1.05;
}
.mx-cents { font-size: 0.55em; font-weight: 600; color: var(--text-muted); }
.mx-balance-hidden {
  display: inline-block;
  width: 200px; height: 28px;
  border-radius: 999px;
  background: var(--bg-overlay);
}
.mx-balance-chevron { color: var(--text-heading); }

/* ============ CHIPS PEACH ============ */
.mx-chips {
  display: flex; gap: 10px;
  padding: 8px 20px 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.mx-chips::-webkit-scrollbar { display: none; }
.mx-chip {
  display: inline-flex; align-items: center; gap: 6px;
  flex-shrink: 0;
  padding: 10px 18px;
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  color: color-mix(in srgb, var(--brand-primary) 80%, black 20%);
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease;
}
.mx-chip:hover { background: color-mix(in srgb, var(--brand-primary) 18%, transparent); }

/* ============ TILES ============ */
.mx-tiles {
  display: flex; gap: 10px;
  padding: 18px 20px 0;
  overflow-x: auto;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
  scroll-padding-inline-start: 20px;
}
.mx-tiles::-webkit-scrollbar { display: none; }
@media (min-width: 1024px) {
  .mx-tiles {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    padding: 0;
    overflow: visible;
  }
}
.mx-tile {
  flex-shrink: 0;
  width: 124px; height: 124px;
  padding: 14px;
  background: var(--bg-overlay);
  border-radius: 16px;
  display: flex; flex-direction: column; justify-content: space-between;
  text-align: left;
  scroll-snap-align: start;
  cursor: pointer;
  transition: background-color 150ms ease, transform 200ms ease;
}
@media (min-width: 1024px) {
  .mx-tile { width: auto; height: auto; min-height: 110px; }
  .mx-tile:hover { transform: translateY(-2px); }
}
.mx-tile:hover { background: color-mix(in srgb, var(--brand-primary) 8%, var(--bg-overlay)); }
.mx-tile-icon { color: var(--text-heading); align-self: flex-start; }
.mx-tile-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-heading);
  letter-spacing: -0.005em;
}

/* ============ INVESTIMENTOS MINI (mobile preview) ============ */
.mx-invest-preview {
  display: grid; grid-template-columns: 68px 1fr 20px;
  align-items: center; gap: 14px;
  width: 100%;
  padding: 16px 18px;
  background: var(--bg-overlay);
  border-radius: 16px;
  cursor: pointer;
}
.mx-invest-donut-wrap { width: 60px; height: 60px; }
.mx-invest-donut { width: 100%; height: 100%; }
.mx-invest-label {
  margin: 0;
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--text-muted);
}
.mx-invest-val {
  margin: 4px 0 2px;
  font-size: 19px; font-weight: 700;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.015em;
}
.mx-invest-sub { margin: 0; font-size: 12px; color: var(--text-muted); }
.mx-invest-chev { color: var(--text-muted); }

/* ============ NOTIFICAÇÕES CAROUSEL (mobile) ============ */
.mx-notif-carousel {
  display: flex; gap: 12px;
  padding: 0 20px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline-start: 20px;
  scrollbar-width: none;
}
.mx-notif-carousel::-webkit-scrollbar { display: none; }
.mx-notif-card {
  flex-shrink: 0;
  width: 260px;
  padding: 16px 18px;
  background: var(--bg-overlay);
  border-radius: 14px;
  scroll-snap-align: start;
}
.mx-notif-card-head {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}
.mx-notif-card-title {
  margin: 0;
  font-size: 14px; font-weight: 700;
  color: var(--text-heading);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  min-width: 0; flex: 1;
}
.mx-notif-card-date {
  margin: 0;
  font-size: 11px; font-weight: 500;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap; flex-shrink: 0;
}
.mx-notif-card-desc {
  margin: 0;
  font-size: 13px; line-height: 1.45;
  color: var(--text-body);
}

/* ============ NOTIFICAÇÕES LIST (desktop) ============ */
.mx-notif-list-d { list-style: none; padding: 0; margin: 0; }
.mx-notif-row-d {
  display: grid; grid-template-columns: 1fr auto;
  align-items: start; gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--text-heading) 5%, transparent);
}
.mx-notif-row-d:last-child { border-bottom: 0; }
.mx-notif-row-d:first-child { padding-top: 0; }
.mx-notif-title-d {
  margin: 0;
  font-size: 13px; font-weight: 700;
  color: var(--text-heading);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mx-notif-desc-d {
  margin: 2px 0 0;
  font-size: 12px; line-height: 1.4;
  color: var(--text-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mx-notif-date-d {
  margin: 0;
  font-size: 11px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

/* ============ CARD (desktop) ============ */
.mx-card {
  background: var(--bg-overlay);
  border-radius: 18px;
  padding: 22px;
}
.mx-card-head {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}
.mx-card-title {
  margin: 0;
  font-size: 16px; font-weight: 700;
  color: var(--text-heading);
  letter-spacing: -0.005em;
}

/* ============ SALDO CARD AMBER (desktop 3-col) ============ */
.mx-saldo-card {
  background: var(--brand-primary);
  color: white;
  border-radius: 18px;
  padding: 22px;
  display: flex; flex-direction: column;
}
.mx-saldo-eyebrow {
  margin: 0;
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: rgba(255,255,255,0.85);
}
.mx-saldo-val {
  margin: 10px 0 8px;
  font-size: 30px; font-weight: 700;
  letter-spacing: -0.025em;
  color: white;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.mx-saldo-cents { font-size: 0.55em; color: rgba(255,255,255,0.7); font-weight: 600; }
.mx-saldo-delta {
  display: inline-flex; align-items: center; gap: 6px;
  margin: 0 0 18px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: white;
}
.mx-saldo-mut { color: rgba(255,255,255,0.7); }
.mx-saldo-cta {
  display: inline-flex; align-items: center; gap: 8px;
  align-self: flex-start;
  padding: 9px 16px;
  background: color-mix(in srgb, var(--brand-primary) 70%, black 30%);
  color: white;
  border-radius: 999px;
  font-size: 13px; font-weight: 700;
  cursor: pointer;
  transition: transform 150ms ease, background-color 200ms ease;
  margin-top: auto;
}
.mx-saldo-cta:hover {
  transform: translateY(-1px);
  background: color-mix(in srgb, var(--brand-primary) 55%, black 45%);
}

/* ============ FEATURE DARK ============ */
.mx-feature-dark {
  position: relative;
  overflow: hidden;
  padding: 26px 22px;
  background: #1A0A2E;
  border-radius: 20px;
  color: white;
  isolation: isolate;
}
@media (min-width: 1024px) {
  .mx-feature-dark { padding: 22px; display: flex; flex-direction: column; }
}
.mx-feature-dark-glow {
  position: absolute;
  inset: -30% -10% auto auto;
  width: 240px; height: 240px;
  background: radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 35%, transparent) 0%, transparent 65%);
  pointer-events: none;
  z-index: -1;
}
.mx-feature-dark-tag {
  display: inline-block;
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.16em; text-transform: uppercase;
  padding: 5px 10px;
  background: color-mix(in srgb, var(--brand-primary) 22%, transparent);
  color: var(--brand-primary);
  border-radius: 999px;
  margin-bottom: 14px;
  align-self: flex-start;
}
.mx-feature-dark-title {
  margin: 0 0 8px;
  font-size: 26px; font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: white;
}
.mx-feature-dark-title em {
  font-family: 'Instrument Serif', Georgia, serif;
  font-style: italic;
  font-weight: 400;
  font-size: 1.12em;
  color: var(--brand-primary);
}
.mx-feature-dark-body {
  margin: 0 0 18px;
  font-size: 14px; line-height: 1.5;
  color: rgba(255,255,255,0.72);
  max-width: 36ch;
}
@media (min-width: 1024px) {
  .mx-feature-dark-title { font-size: 22px; }
  .mx-feature-dark-body { font-size: 13px; flex: 1; }
}
.mx-feature-dark-cta {
  display: inline-flex; align-items: center; gap: 8px;
  align-self: flex-start;
  padding: 11px 20px;
  background: var(--brand-primary);
  color: #1A0A2E;
  border-radius: 999px;
  font-size: 14px; font-weight: 700;
  cursor: pointer;
  transition: transform 150ms ease, box-shadow 150ms ease;
}
.mx-feature-dark-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px -8px color-mix(in srgb, var(--brand-primary) 50%, transparent);
}

/* ============ FEATURE ORANGE ============ */
.mx-feature-orange {
  padding: 26px 22px;
  background: var(--brand-primary);
  color: white;
  border-radius: 20px;
}
@media (min-width: 1024px) {
  .mx-feature-orange {
    display: grid; grid-template-columns: 1.6fr 1fr;
    gap: 28px; align-items: center;
    padding: 30px 32px;
    border-radius: 22px;
  }
}
.mx-feature-orange-tag {
  display: inline-block;
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.16em; text-transform: uppercase;
  padding: 5px 10px;
  background: rgba(255,255,255,0.22);
  color: white;
  border-radius: 999px;
  margin-bottom: 14px;
}
.mx-feature-orange-title {
  margin: 0 0 4px;
  font-size: 18px; font-weight: 700;
  line-height: 1.3;
  color: white;
  letter-spacing: -0.01em;
}
.mx-feature-orange-body {
  margin: 0 0 12px;
  font-size: 13px; line-height: 1.4;
  color: rgba(255,255,255,0.85);
}
@media (min-width: 1024px) {
  .mx-feature-orange-title { font-size: 26px; margin-bottom: 10px; letter-spacing: -0.02em; line-height: 1.15; }
  .mx-feature-orange-body { font-size: 14px; line-height: 1.5; margin-bottom: 20px; }
}
.mx-feature-orange-cta {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 20px;
  background: color-mix(in srgb, var(--brand-primary) 70%, black 30%);
  color: white;
  border-radius: 999px;
  font-size: 14px; font-weight: 700;
  cursor: pointer;
  transition: transform 150ms ease, background-color 200ms ease;
}
.mx-feature-orange-cta:hover {
  transform: translateY(-1px);
  background: color-mix(in srgb, var(--brand-primary) 55%, black 45%);
}
.mx-feature-orange-list {
  display: none;
  list-style: none; padding: 0; margin: 0;
  flex-direction: column; gap: 12px;
}
.mx-feature-orange-list li {
  display: inline-flex; align-items: center; gap: 10px;
  font-size: 14px; font-weight: 500;
  color: rgba(255,255,255,0.92);
}
.mx-feature-orange-list svg { color: rgba(255,255,255,0.75); flex-shrink: 0; }

/* ============ DISCOVER mobile carousel + desktop list ============ */
.mx-discover {
  display: flex; gap: 12px;
  padding: 0 20px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}
.mx-discover::-webkit-scrollbar { display: none; }
.mx-discover-card {
  flex-shrink: 0;
  width: 200px;
  border-radius: 16px;
  background: var(--bg-overlay);
  scroll-snap-align: start;
  overflow: hidden;
  display: flex; flex-direction: column;
}
.mx-discover-thumb {
  height: 92px;
  display: flex; align-items: center; justify-content: center;
}
.mx-discover-title { font-size: 14px; font-weight: 700; color: var(--text-heading); margin: 12px 14px 4px; }
.mx-discover-body { font-size: 12px; line-height: 1.45; color: var(--text-muted); margin: 0 14px 14px; }

.mx-discover-d-list { list-style: none; padding: 0; margin: 0; }
.mx-discover-d-row {
  display: grid; grid-template-columns: 40px 1fr 16px;
  align-items: center; gap: 14px;
  padding: 10px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--text-heading) 5%, transparent);
  cursor: pointer;
}
.mx-discover-d-row:last-child { border-bottom: 0; padding-bottom: 0; }
.mx-discover-d-row:first-child { padding-top: 0; }
.mx-discover-d-row:hover .mx-discover-d-arr { transform: translateX(3px); color: var(--brand-primary); }
.mx-discover-d-icon {
  width: 40px; height: 40px; border-radius: 12px;
  display: inline-flex; align-items: center; justify-content: center;
}
.mx-discover-d-t { margin: 0; font-size: 14px; font-weight: 700; color: var(--text-heading); }
.mx-discover-d-b { margin: 2px 0 0; font-size: 12px; color: var(--text-muted); }
.mx-discover-d-arr { color: var(--text-muted); transition: transform 180ms ease, color 180ms ease; }

/* ============ FLOOD CARTEIRA / RESULTADO ============ */
.mx-flood {
  padding: 0 20px 26px;
  background: var(--brand-primary);
  color: white;
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
}
@media (min-width: 1024px) {
  .mx-flood {
    border-radius: 22px;
    padding: 34px 36px;
  }
}
.mx-flood-result {
  /* Mobile: keep flush top. Desktop: standard padding. */
  padding-top: 0;
}
@media (min-width: 1024px) {
  .mx-flood-result { padding-top: 34px; }
}
.mx-flood-label {
  margin: 0;
  padding-top: 8px;
  font-size: 12px; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(255,255,255,0.85);
}
@media (min-width: 1024px) { .mx-flood-label { padding-top: 0; font-size: 11px; letter-spacing: 0.16em; } }
.mx-flood-val {
  margin: 10px 0 8px;
  font-size: clamp(34px, 9vw, 42px);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: white;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.mx-flood-neg { color: white; }
@media (min-width: 1024px) {
  .mx-flood-val { font-size: 56px; letter-spacing: -0.035em; margin: 12px 0 8px; }
}
.mx-flood-cents { font-size: 0.55em; color: rgba(255,255,255,0.65); font-weight: 600; }
@media (min-width: 1024px) { .mx-flood-cents { font-size: 0.45em; } }
.mx-flood-hidden { letter-spacing: 0.05em; }
.mx-flood-delta {
  margin: 0;
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px;
  color: white;
  font-variant-numeric: tabular-nums;
}
@media (min-width: 1024px) { .mx-flood-delta { font-size: 14px; } }
.mx-flood-delta strong { font-weight: 700; }
.mx-flood-delta-sub { color: rgba(255,255,255,0.7); }
/* Flood bank pills (saldo de cada conta Open Finance — substitui CTAs antigos) */
.mx-flood-banks {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin-top: 20px;
}
.mx-flood-bank {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 5px 14px 5px 5px;
  background: rgba(255,255,255,0.18);
  border-radius: 999px;
  color: white;
  cursor: pointer;
  transition: background-color 150ms ease, transform 150ms ease;
}
.mx-flood-bank:hover { background: rgba(255,255,255,0.28); transform: translateY(-1px); }
.mx-flood-bank-mark {
  width: 26px; height: 26px; border-radius: 999px;
  background: white;
  color: var(--brand-primary);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 800;
  letter-spacing: -0.005em;
  flex-shrink: 0;
}
.mx-flood-bank-mark-add {
  background: rgba(255,255,255,0.22);
  color: white;
}
.mx-flood-bank-meta {
  display: inline-flex; align-items: baseline; gap: 6px;
  font-variant-numeric: tabular-nums;
}
.mx-flood-bank-name {
  font-size: 12px; font-weight: 500;
  color: rgba(255,255,255,0.85);
}
.mx-flood-bank-val {
  font-size: 13px; font-weight: 700;
  color: white;
  letter-spacing: -0.005em;
}
.mx-flood-bank-add .mx-flood-bank-name { color: white; font-weight: 600; }

/* ============ FILTER PILLS ============ */
.mx-filter-pills {
  display: flex; gap: 8px;
  padding: 18px 20px 4px;
  overflow-x: auto;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
}
@media (min-width: 1024px) {
  .mx-filter-pills { padding: 4px 0; margin-top: -4px; }
}
.mx-filter-pills::-webkit-scrollbar { display: none; }
.mx-filter-pill {
  flex-shrink: 0;
  padding: 8px 16px;
  background: var(--bg-overlay);
  color: var(--text-muted);
  border-radius: 999px;
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}
.mx-filter-pill:hover { color: var(--text-heading); }
.mx-filter-pill-active {
  background: var(--text-heading);
  color: var(--bg-base);
}

/* ============ WALLET CARD ============ */
.mx-wallet-card {
  background: var(--bg-overlay);
  border-radius: 16px;
  padding: 18px;
}
@media (min-width: 1024px) {
  .mx-wallet-card { padding: 22px; border-radius: 18px; }
}
.mx-wallet-card-head {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
}
.mx-wallet-card-title {
  margin: 0;
  font-size: 16px; font-weight: 700;
  color: var(--text-heading);
  letter-spacing: -0.005em;
}
.mx-wallet-card-meta {
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--text-muted);
}

.mx-kpis-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; }
.mx-kpi {
  padding: 0 12px;
  border-right: 1px solid color-mix(in srgb, var(--text-heading) 6%, transparent);
}
.mx-kpi:first-child { padding-left: 0; }
.mx-kpi:last-child { padding-right: 0; border-right: 0; }
.mx-kpi-label {
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-muted); margin: 0;
}
.mx-kpi-val {
  font-size: 20px; font-weight: 700;
  font-variant-numeric: tabular-nums;
  margin: 6px 0 0;
  letter-spacing: -0.015em;
  color: var(--text-heading);
}
.mx-kpi-suf { font-size: 11px; font-weight: 500; color: var(--text-muted); margin-left: 2px; }

.mx-alloc-list { list-style: none; padding: 0; margin: 0; }
.mx-alloc-row {
  display: grid; grid-template-columns: 14px 1fr auto auto;
  align-items: baseline; gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--text-heading) 6%, transparent);
}
.mx-alloc-row:last-child { border-bottom: 0; padding-bottom: 0; }
.mx-alloc-dot { width: 10px; height: 10px; border-radius: 999px; align-self: center; }
.mx-alloc-name { font-size: 14px; color: var(--text-heading); font-weight: 500; }
.mx-alloc-val { font-size: 13px; color: var(--text-muted); font-variant-numeric: tabular-nums; }
@media (min-width: 1024px) { .mx-alloc-val { font-size: 11px; } }
.mx-alloc-pct {
  font-size: 13px; font-weight: 700;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
  min-width: 38px; text-align: right;
}

/* Donut wrap desktop */
.mx-invest-d-row {
  display: grid; grid-template-columns: 180px 1fr;
  gap: 24px;
  align-items: center;
}
.mx-donut-wrap { position: relative; width: 180px; height: 180px; }
.mx-donut { width: 100%; height: 100%; }
.mx-donut-center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.mx-donut-label { margin: 0; font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text-muted); }
.mx-donut-val {
  margin: 4px 0 0;
  font-size: 22px; font-weight: 700;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

/* ============ ASSET LIST (mobile rows) ============ */
.mx-asset-list { list-style: none; padding: 0; margin: 0; }
.mx-asset-row {
  display: grid; grid-template-columns: 40px 1fr auto;
  align-items: center; gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--text-heading) 5%, transparent);
}
.mx-asset-row:last-child { border-bottom: 0; }
.mx-asset-mark {
  width: 40px; height: 40px; border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  color: var(--brand-primary);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 700;
}
.mx-asset-tk { margin: 0; font-size: 15px; font-weight: 700; color: var(--text-heading); }
.mx-asset-meta { margin: 2px 0 0; font-size: 12px; color: var(--text-muted); font-variant-numeric: tabular-nums; }
.mx-asset-right { text-align: right; }
.mx-asset-total {
  margin: 0;
  font-size: 15px; font-weight: 700;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
}
.mx-asset-delta {
  margin: 2px 0 0;
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 12px; font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* ============ ASSET TABLE (desktop) ============ */
.mx-asset-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.mx-asset-table th {
  padding: 10px 12px;
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-muted);
  text-align: left;
  border-bottom: 1px solid color-mix(in srgb, var(--text-heading) 8%, transparent);
}
.mx-asset-table td {
  padding: 14px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--text-heading) 5%, transparent);
  color: var(--text-body);
}
.mx-asset-table tbody tr:last-child td { border-bottom: 0; }
.mx-asset-table tbody tr:hover { background: color-mix(in srgb, var(--brand-primary) 4%, transparent); }
.mx-table-tk { display: inline-flex; align-items: center; gap: 10px; }
.mx-table-avatar {
  width: 30px; height: 30px; border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
}
.mx-asset-table strong { color: var(--text-heading); font-weight: 700; }

/* ============ PROVENTOS ============ */
.mx-proventos-card {
  background: var(--bg-overlay);
  border-radius: 16px;
  padding: 20px;
}
.mx-proventos-period { margin: 0; font-size: 13px; color: var(--text-muted); }
.mx-proventos-val {
  display: inline-flex; align-items: center; gap: 10px;
  margin: 10px 0 8px;
  font-size: 30px; font-weight: 700;
  color: var(--text-heading);
  letter-spacing: -0.025em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.mx-proventos-dot { width: 10px; height: 10px; border-radius: 999px; background: var(--brand-primary); }
.mx-proventos-delta {
  display: inline-flex; align-items: center; flex-wrap: wrap; gap: 6px;
  margin: 0;
  font-size: 13px;
  color: var(--brand-positive);
  font-variant-numeric: tabular-nums;
}
.mx-proventos-delta strong { font-weight: 700; }
.mx-proventos-delta-sub { color: var(--text-muted); font-weight: 400; }
.mx-proventos-chart {
  display: grid; grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-top: 22px;
}
.mx-proventos-bar-col { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.mx-proventos-bar-area { width: 100%; height: 140px; display: flex; align-items: flex-end; }
.mx-proventos-bar {
  width: 100%;
  background: var(--brand-primary);
  border-radius: 8px;
  min-height: 10px;
  transition: opacity 180ms ease, transform 180ms ease;
  cursor: pointer;
}
.mx-proventos-bar:hover { opacity: 0.85; transform: translateY(-2px); }
.mx-proventos-bar-active { background: color-mix(in srgb, var(--brand-primary) 92%, black 8%); }
.mx-proventos-bar-label {
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

/* ============ OPERAÇÕES ============ */
.mx-ops-list { list-style: none; padding: 0; margin: 0; }
.mx-ops-row {
  display: grid; grid-template-columns: 36px 1fr auto;
  align-items: center; gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--text-heading) 5%, transparent);
}
.mx-ops-row:last-child { border-bottom: 0; }
.mx-ops-icon {
  width: 36px; height: 36px; border-radius: 999px;
  display: inline-flex; align-items: center; justify-content: center;
}
.mx-ops-in { background: color-mix(in srgb, var(--brand-positive) 14%, transparent); color: var(--brand-positive); }
.mx-ops-out { background: color-mix(in srgb, var(--text-heading) 8%, transparent); color: var(--text-heading); }
.mx-ops-title { margin: 0; font-size: 14px; font-weight: 600; color: var(--text-heading); }
.mx-ops-sub { margin: 2px 0 0; font-size: 12px; color: var(--text-muted); }
.mx-ops-val { margin: 0; font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; }

/* ============ RESULTADO ============ */
.mx-mode-toggle {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 5px;
  background: var(--bg-overlay);
  border-radius: 999px;
}
.mx-mode-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 14px;
  background: transparent;
  color: var(--text-muted);
  border-radius: 999px;
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: background-color 200ms ease, color 200ms ease;
}
.mx-mode-btn:hover { color: var(--text-heading); }
.mx-mode-btn-active {
  background: var(--bg-elevated);
  color: var(--text-heading);
  font-weight: 700;
  box-shadow: 0 2px 8px -4px rgba(0,0,0,0.1);
}
.mx-mode-cap {
  font-size: 10px; font-weight: 600;
  padding: 1px 6px; border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  letter-spacing: 0.06em; text-transform: uppercase;
}

.mx-kpi-result-card {
  padding: 18px 20px;
}
.mx-kpi-result-card .mx-kpi-label { margin-bottom: 8px; }
.mx-kpi-result-card .mx-kpi-val { font-size: 26px; margin: 0; }
.mx-kpi-context {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

/* Win/Loss donut */
.mx-wl-grid {
  display: grid; grid-template-columns: 140px 1fr;
  gap: 18px;
  align-items: center;
}
@media (min-width: 1024px) { .mx-wl-grid { grid-template-columns: 180px 1fr; gap: 24px; } }
.mx-wl-donut { width: 140px; height: 140px; }
@media (min-width: 1024px) { .mx-wl-donut { width: 180px; height: 180px; } }
.mx-wl-num {
  font-size: 28px; font-weight: 700;
  fill: var(--text-heading);
  font-variant-numeric: tabular-nums;
}
.mx-wl-cap {
  font-size: 10px; font-weight: 700;
  fill: var(--text-muted);
  letter-spacing: 0.14em; text-transform: uppercase;
}
.mx-wl-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; }
.mx-wl-list li {
  display: grid; grid-template-columns: 10px 1fr auto;
  align-items: center; gap: 12px;
}
.mx-wl-dot { width: 10px; height: 10px; border-radius: 999px; }
.mx-wl-info { min-width: 0; }
.mx-wl-name { margin: 0; font-size: 13px; font-weight: 700; color: var(--text-heading); }
.mx-wl-sub { margin: 2px 0 0; font-size: 11px; color: var(--text-muted); font-variant-numeric: tabular-nums; }
.mx-wl-val { margin: 0; font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums; }

/* Extremes grid */
.mx-extremes-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.mx-extremes-grid > div { padding-right: 12px; border-right: 1px solid color-mix(in srgb, var(--text-heading) 6%, transparent); }
.mx-extremes-grid > div:last-child { border-right: 0; padding-right: 0; }

/* Equity bars chart */
.mx-equity-chart {
  display: grid;
  grid-template-columns: repeat(var(--cols, 12), 1fr);
  gap: 6px;
  align-items: center;
  height: 180px;
  margin-top: 8px;
  position: relative;
}
.mx-equity-chart::before {
  content: '';
  position: absolute; left: 0; right: 0; top: 50%;
  height: 1px;
  background: color-mix(in srgb, var(--text-heading) 6%, transparent);
}
.mx-equity-col {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  height: 100%;
  position: relative;
}
.mx-equity-area {
  width: 100%;
  flex: 1;
  display: flex; flex-direction: column;
  justify-content: center;
  position: relative;
}
.mx-equity-bar {
  width: 100%;
  border-radius: 6px;
  min-height: 4px;
  transition: opacity 180ms ease;
}
.mx-equity-bar:hover { opacity: 0.85; }
.mx-equity-bar-pos {
  background: var(--brand-positive);
  align-self: flex-end;
  margin-top: auto;
  margin-bottom: 50%;
}
.mx-equity-bar-neg {
  background: var(--brand-negative);
  align-self: flex-start;
  margin-bottom: auto;
  margin-top: 50%;
}
.mx-equity-label {
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  margin-top: 4px;
}
.mx-equity-legend {
  margin: 14px 0 0;
  display: inline-flex; align-items: center; gap: 16px;
  font-size: 11px; font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.06em; text-transform: uppercase;
}
.mx-equity-legend-dot {
  display: inline-block;
  width: 8px; height: 8px; border-radius: 999px;
  margin-right: 4px;
}

/* Top trades */
.mx-trades-list { list-style: none; padding: 0; margin: 0; }
.mx-trade-row {
  display: grid; grid-template-columns: 36px 1fr auto;
  align-items: center; gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--text-heading) 5%, transparent);
}
.mx-trade-row:last-child { border-bottom: 0; }
.mx-trade-mark {
  width: 36px; height: 36px; border-radius: 999px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700;
}
.mx-trade-mark-pos { background: color-mix(in srgb, var(--brand-positive) 14%, transparent); color: var(--brand-positive); }
.mx-trade-mark-neg { background: color-mix(in srgb, var(--brand-negative) 14%, transparent); color: var(--brand-negative); }
.mx-trade-tk { margin: 0; font-size: 14px; font-weight: 700; color: var(--text-heading); letter-spacing: 0.005em; }
.mx-trade-sub { margin: 2px 0 0; font-size: 12px; color: var(--text-muted); font-variant-numeric: tabular-nums; }
.mx-trade-pnl { margin: 0; font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; }

/* ============ EVOLUÇÃO DO PATRIMÔNIO ============ */
.mx-evolucao-deck {
  margin: 4px 0 0;
  font-size: 12px;
  display: inline-flex; align-items: center; gap: 6px;
  flex-wrap: wrap;
  font-variant-numeric: tabular-nums;
}
.mx-evolucao-periods {
  display: flex; gap: 4px;
  padding: 3px;
  background: var(--bg-base);
  border-radius: 999px;
}
.mx-evolucao-period {
  padding: 5px 10px;
  background: transparent;
  border: 0;
  color: var(--text-muted);
  font-size: 11px; font-weight: 600;
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
}
.mx-evolucao-period:hover { color: var(--text-heading); }
.mx-evolucao-period-active {
  background: var(--text-heading);
  color: var(--bg-base);
}
.mx-evolucao-chart {
  margin: 14px 0 4px;
  position: relative;
}
.mx-evolucao-svg {
  width: 100%;
  height: 140px;
  display: block;
}
@media (min-width: 1024px) { .mx-evolucao-svg { height: 180px; } }
.mx-evolucao-labels {
  list-style: none; padding: 0; margin: 6px 0 0;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.mx-evolucao-labels li { text-align: center; font-weight: 600; }
.mx-evolucao-stats {
  display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 8px;
  margin: 16px 0 0;
  padding-top: 14px;
  border-top: 1px solid color-mix(in srgb, var(--text-heading) 6%, transparent);
}
.mx-evolucao-stats > div { display: flex; flex-direction: column; gap: 2px; }
.mx-evolucao-stats dt {
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-muted);
}
.mx-evolucao-stats dd {
  margin: 0;
  font-size: 14px; font-weight: 700;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.005em;
}

/* ============ PRÓXIMOS PROVENTOS ============ */
.mx-up-deck {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.mx-up-list { list-style: none; padding: 0; margin: 0; }
.mx-up-row {
  display: grid; grid-template-columns: 44px 1fr auto;
  align-items: center; gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--text-heading) 5%, transparent);
}
.mx-up-row:last-child { border-bottom: 0; }
.mx-up-date {
  display: flex; flex-direction: column;
  align-items: center;
  width: 44px; padding: 6px 0;
  background: var(--bg-base);
  border-radius: 8px;
}
.mx-up-day {
  font-size: 15px; font-weight: 800;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.mx-up-month {
  margin-top: 2px;
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--text-muted);
}
.mx-up-meta {
  display: flex; flex-direction: column; gap: 3px;
  min-width: 0;
}
.mx-up-tk {
  margin: 0;
  font-size: 14px; font-weight: 700;
  color: var(--text-heading);
  letter-spacing: 0.005em;
}
.mx-up-type {
  display: inline-block;
  align-self: flex-start;
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  padding: 2px 6px; border-radius: 4px;
}
.mx-up-type-div {
  background: color-mix(in srgb, var(--brand-positive) 14%, transparent);
  color: var(--brand-positive);
}
.mx-up-type-jcp {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
}
.mx-up-amount {
  margin: 0;
  font-size: 14px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* ============ MÉTRICAS AVANÇADAS (Resultado) ============ */
.mx-ext-kpis {
  display: grid; grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin: 0;
}
@media (max-width: 640px) { .mx-ext-kpis { grid-template-columns: repeat(3, 1fr); gap: 12px 8px; } }
.mx-ext-kpis > div {
  display: flex; flex-direction: column; gap: 4px;
  padding: 0 8px;
  border-right: 1px solid color-mix(in srgb, var(--text-heading) 6%, transparent);
}
.mx-ext-kpis > div:first-child { padding-left: 0; }
.mx-ext-kpis > div:last-child { border-right: 0; padding-right: 0; }
@media (max-width: 640px) { .mx-ext-kpis > div { border-right: 0; padding: 0; } }
.mx-ext-kpis dt {
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-muted);
}
.mx-ext-kpis dd {
  margin: 0;
  font-size: 18px; font-weight: 700;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.015em;
}

/* ============ HEATMAP MENSAL (Resultado) ============ */
.mx-hm-deck {
  margin: 4px 0 0;
  font-size: 12px;
  display: inline-flex; align-items: center; gap: 6px;
  flex-wrap: wrap;
}
.mx-hm-grid {
  display: flex; flex-direction: column; gap: 6px;
  margin: 14px 0 0;
}
.mx-hm-row {
  display: grid; grid-template-columns: 32px 1fr;
  align-items: center; gap: 10px;
}
.mx-hm-month {
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.mx-hm-cells {
  display: grid;
  grid-template-columns: repeat(30, 1fr);
  gap: 3px;
}
.mx-hm-cell {
  aspect-ratio: 1 / 1;
  border-radius: 2px;
  background: var(--bg-base);
  transition: transform 150ms ease;
  cursor: pointer;
}
.mx-hm-cell:hover { transform: scale(1.35); }
.mx-hm-weekend     { background: var(--bg-base); opacity: 0.4; cursor: default; }
.mx-hm-flat        { background: var(--bg-base); }
.mx-hm-loss-strong { background: color-mix(in srgb, var(--brand-negative) 75%, transparent); }
.mx-hm-loss-soft   { background: color-mix(in srgb, var(--brand-negative) 32%, transparent); }
.mx-hm-win-soft    { background: color-mix(in srgb, var(--brand-positive) 28%, transparent); }
.mx-hm-win-mid     { background: color-mix(in srgb, var(--brand-positive) 55%, transparent); }
.mx-hm-win-strong  { background: var(--brand-positive); }

.mx-hm-legend {
  display: inline-flex; align-items: center; gap: 4px;
  margin: 14px 0 0;
  padding-top: 12px;
  border-top: 1px solid color-mix(in srgb, var(--text-heading) 6%, transparent);
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
}
.mx-hm-legend .mx-hm-cell {
  width: 14px; height: 14px;
  aspect-ratio: auto;
  cursor: default;
}
.mx-hm-legend .mx-hm-cell:hover { transform: none; }

/* ============ HOJE ============ */

/* Events pill banner */
.mx-hoje-events-pill {
  display: flex; align-items: center; flex-wrap: wrap; gap: 10px;
  padding: 10px 14px;
  background: var(--bg-overlay);
  border-radius: 12px;
}
.mx-hoje-events-icon {
  width: 28px; height: 28px; border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  flex-shrink: 0;
}
.mx-hoje-events-text {
  margin: 0;
  font-size: 13px;
  color: var(--text-body);
}
.mx-hoje-events-chips {
  list-style: none; padding: 0; margin: 0;
  display: inline-flex; flex-wrap: wrap; gap: 6px;
  margin-left: auto;
}
.mx-hoje-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.02em;
}
.mx-hoje-chip-juros    { background: color-mix(in srgb, var(--brand-primary) 14%, transparent); color: var(--brand-primary); }
.mx-hoje-chip-petroleo { background: color-mix(in srgb, #C2715A 16%, transparent); color: #C2715A; }
.mx-hoje-chip-dolar    { background: color-mix(in srgb, var(--brand-positive) 16%, transparent); color: var(--brand-positive); }

/* Main hero: carteira hoje (2-col desktop) */
.mx-hoje-main {
  grid-template-columns: 1fr;
}
@media (min-width: 1024px) {
  .mx-hoje-main { grid-template-columns: 1.05fr 1fr; gap: 16px; }
}

.mx-hoje-mega {
  margin: 10px 0 8px;
  font-size: clamp(34px, 6vw, 46px);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.mx-hoje-delta {
  display: inline-flex; align-items: center; gap: 8px;
  flex-wrap: wrap;
  margin: 0;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.mx-hoje-delta-pct {
  display: inline-flex; align-items: center; gap: 4px;
  font-weight: 700;
}

/* Lead cards */
.mx-hoje-leads {
  display: flex; flex-direction: column; gap: 8px;
  margin: 18px 0 0;
}
.mx-hoje-lead {
  display: grid; grid-template-columns: 28px 1fr;
  align-items: start; gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--bg-base);
}
.mx-hoje-lead-icon {
  width: 28px; height: 28px; border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
}
.mx-hoje-lead-neg .mx-hoje-lead-icon {
  background: color-mix(in srgb, var(--brand-negative) 12%, transparent);
  color: var(--brand-negative);
}
.mx-hoje-lead-pos .mx-hoje-lead-icon {
  background: color-mix(in srgb, var(--brand-positive) 12%, transparent);
  color: var(--brand-positive);
}
.mx-hoje-lead-text {
  margin: 0;
  font-size: 13px; line-height: 1.5;
  color: var(--text-body);
}
.mx-hoje-lead-text strong { color: var(--text-heading); font-weight: 700; }

/* Mini factors row */
.mx-hoje-mini {
  list-style: none; padding: 14px 0 0; margin: 14px 0 0;
  border-top: 1px solid color-mix(in srgb, var(--text-heading) 6%, transparent);
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
}
.mx-hoje-mini-row {
  display: grid; grid-template-columns: 28px 1fr;
  align-items: center; gap: 8px;
}
.mx-hoje-mini-icon {
  width: 28px; height: 28px; border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.mx-hoje-mini-icon-juros    { background: color-mix(in srgb, var(--brand-primary) 14%, transparent); color: var(--brand-primary); }
.mx-hoje-mini-icon-petroleo { background: color-mix(in srgb, #C2715A 16%, transparent); color: #C2715A; }
.mx-hoje-mini-icon-dolar    { background: color-mix(in srgb, var(--brand-positive) 16%, transparent); color: var(--brand-positive); }
.mx-hoje-mini-meta { min-width: 0; }
.mx-hoje-mini-label {
  margin: 0;
  font-size: 11px; font-weight: 600;
  color: var(--text-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mx-hoje-mini-sub {
  margin: 2px 0 0;
  font-size: 12px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* Right: intraday curve — usa as classes do Evolução (.mx-evolucao-chart/-svg/-dot/-stats),
   só sobrescreve a grade de labels pra 8 colunas (horas do pregão). */
.mx-hoje-main-right {
  display: flex; flex-direction: column;
}
.mx-hoje-labels {
  list-style: none; padding: 0; margin: 6px 0 0;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.mx-hoje-labels li { text-align: center; font-weight: 600; }

/* O QUE PESOU — mesma estrutura de rows das Notícias */
.mx-pesou-deck {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}
.mx-pesou-list { list-style: none; padding: 0; margin: 0; }
.mx-pesou-row {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  align-items: start;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--text-heading) 6%, transparent);
}
.mx-pesou-row:first-child { padding-top: 0; }
.mx-pesou-row:last-child { border-bottom: 0; padding-bottom: 0; }
.mx-pesou-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.mx-pesou-icon-juros    { background: color-mix(in srgb, var(--brand-primary) 14%, transparent); color: var(--brand-primary); }
.mx-pesou-icon-petroleo { background: color-mix(in srgb, #C2715A 16%, transparent); color: #C2715A; }
.mx-pesou-icon-dolar    { background: color-mix(in srgb, var(--brand-positive) 16%, transparent); color: var(--brand-positive); }
.mx-pesou-icon-setor    { background: color-mix(in srgb, var(--brand-negative) 14%, transparent); color: var(--brand-negative); }
.mx-pesou-body { min-width: 0; }
.mx-pesou-factor {
  margin: 0 0 2px;
  font-size: 14px; font-weight: 700;
  color: var(--text-heading);
  letter-spacing: -0.005em;
}
.mx-pesou-desc {
  margin: 0 0 4px;
  font-size: 13px; line-height: 1.45;
  color: var(--text-body);
}
.mx-pesou-tickers {
  margin: 0;
  font-size: 12px; font-weight: 700;
  color: var(--brand-primary);
  letter-spacing: 0.02em;
}
.mx-pesou-amount {
  margin: 0;
  font-size: 14px; font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* Notícias do dia (rows com icon themed + body + impact) */
.mx-news-deck {
  display: inline-flex; align-items: center; flex-wrap: wrap; gap: 6px;
  margin: 4px 0 0;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.mx-news-deck strong { font-weight: 700; }
.mx-news-list { list-style: none; padding: 0; margin: 0; }
.mx-news-row {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  align-items: start;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--text-heading) 6%, transparent);
}
.mx-news-row:first-child { padding-top: 0; }
.mx-news-row:last-child { border-bottom: 0; padding-bottom: 0; }
.mx-news-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.mx-news-icon-macro       { background: color-mix(in srgb, #7C8DB5 16%, transparent); color: #7C8DB5; }
.mx-news-icon-commodities { background: color-mix(in srgb, #C2715A 16%, transparent); color: #C2715A; }
.mx-news-icon-mineracao   { background: color-mix(in srgb, var(--brand-positive) 14%, transparent); color: var(--brand-positive); }
.mx-news-icon-inflacao    { background: color-mix(in srgb, var(--brand-primary) 14%, transparent); color: var(--brand-primary); }
.mx-news-body { min-width: 0; }
.mx-news-theme {
  margin: 0 0 4px;
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-muted);
}
.mx-news-time { color: var(--text-muted); font-weight: 600; margin-left: 2px; }
.mx-news-title {
  margin: 0 0 6px;
  font-size: 14px; font-weight: 600;
  line-height: 1.4;
  color: var(--text-heading);
  letter-spacing: -0.005em;
}
.mx-news-source {
  display: inline-flex; align-items: center; flex-wrap: wrap; gap: 6px;
  margin: 0;
  font-size: 12px;
}
.mx-news-tickers {
  font-weight: 700;
  color: var(--brand-primary);
  letter-spacing: 0.02em;
}
.mx-news-impact {
  margin: 0;
  font-size: 14px; font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* Resumo Redentia AI (mesmo pattern dos demais wallet-cards) */
.mx-resumo-spark {
  color: var(--brand-primary);
  margin-right: 6px;
  vertical-align: -2px;
}
.mx-resumo-body {
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-body);
}
.mx-resumo-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 14px;
  border-top: 1px solid color-mix(in srgb, var(--text-heading) 6%, transparent);
}
.mx-resumo-meta {
  display: inline-flex; align-items: center; flex-wrap: wrap; gap: 8px;
  margin: 0;
  font-size: 12px;
  color: var(--text-body);
  font-variant-numeric: tabular-nums;
}
.mx-resumo-meta strong { font-weight: 700; color: var(--text-heading); }

/* Mercado snapshot */
.mx-market-hero {
  display: grid; grid-template-columns: 1fr;
  gap: 16px;
  margin: 14px 0 0;
}
@media (min-width: 768px) { .mx-market-hero { grid-template-columns: 1.2fr 1fr; } }
.mx-market-lead {
  padding: 18px;
  background: var(--bg-overlay);
  border-radius: 14px;
}
.mx-market-lead-label {
  margin: 0;
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-muted);
}
.mx-market-lead-val {
  margin: 8px 0 6px;
  font-size: 28px; font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
}
.mx-market-lead-pct {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 15px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.mx-market-secondary {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 8px;
}
.mx-market-sec {
  display: grid; grid-template-columns: 1fr auto;
  align-items: center; gap: 8px;
  padding: 10px 14px;
  background: var(--bg-overlay);
  border-radius: 12px;
}
.mx-market-sec-lead { display: inline-flex; align-items: center; gap: 8px; }
.mx-market-sec-icon {
  width: 24px; height: 24px; border-radius: 6px;
  background: color-mix(in srgb, var(--text-heading) 6%, transparent);
  color: var(--text-heading);
  display: inline-flex; align-items: center; justify-content: center;
}
.mx-market-sec-label {
  margin: 0; font-size: 12px; font-weight: 600;
  color: var(--text-body);
}
.mx-market-sec-row { display: inline-flex; align-items: baseline; gap: 8px; }
.mx-market-sec-val {
  font-size: 13px; font-weight: 700;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
}
.mx-market-sec-pct {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 12px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.mx-market-mvr {
  display: grid; grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 16px;
}
@media (min-width: 768px) { .mx-market-mvr { grid-template-columns: 1fr 1fr; } }
.mx-market-mvr-col {
  padding: 16px;
  background: var(--bg-overlay);
  border-radius: 14px;
}
.mx-market-mvr-h {
  margin: 0 0 10px;
  font-size: 12px; font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  text-transform: uppercase;
}
.mx-market-mvr-col ul { list-style: none; padding: 0; margin: 0; }
.mx-market-mvr-col li {
  display: grid; grid-template-columns: 18px 1fr auto;
  align-items: center; gap: 8px;
  padding: 6px 0;
  font-variant-numeric: tabular-nums;
}
.mx-market-mvr-tk {
  font-size: 13px; font-weight: 700;
  color: var(--text-heading);
}
.mx-market-mvr-pct {
  font-size: 13px; font-weight: 700;
}

/* Histórico */
.mx-hist-list {
  list-style: none; padding: 0; margin: 14px 0 0;
  display: grid; grid-template-columns: 1fr;
  gap: 10px;
}
@media (min-width: 1024px) { .mx-hist-list { grid-template-columns: 1fr 1fr 1fr; } }
.mx-hist-card {
  padding: 16px;
  background: var(--bg-overlay);
  border-radius: 14px;
  display: grid;
  grid-template-columns: 1fr 80px;
  gap: 12px;
  align-items: center;
}
@media (min-width: 1024px) { .mx-hist-card { grid-template-columns: 1fr; gap: 8px; } }
.mx-hist-h {
  grid-column: 1 / -1;
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px;
}
.mx-hist-label {
  margin: 0;
  font-size: 13px; font-weight: 600;
  color: var(--text-heading);
}
.mx-hist-pill {
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  padding: 3px 7px; border-radius: 999px;
}
.mx-hist-sev-high     { background: color-mix(in srgb, var(--brand-negative) 14%, transparent); color: var(--brand-negative); }
.mx-hist-sev-medium   { background: color-mix(in srgb, var(--text-heading) 8%, transparent); color: var(--text-body); }
.mx-hist-sev-positive { background: color-mix(in srgb, var(--brand-positive) 14%, transparent); color: var(--brand-positive); }
.mx-hist-amt {
  margin: 0;
  font-size: 22px; font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  line-height: 1;
}
.mx-hist-pct {
  margin: 2px 0 0;
  font-size: 12px; font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.mx-hist-spark {
  width: 100%; height: 50px;
  display: block;
}
@media (min-width: 1024px) {
  .mx-hist-spark { height: 60px; }
}

/* ============ ASSET DETAIL ============ */
.mx-featured-card,
.mx-movers-row,
.mx-asset-row,
.mx-trade-row {
  cursor: pointer;
  transition: background-color 150ms ease;
}
.mx-asset-row:hover,
.mx-movers-row:hover,
.mx-trade-row:hover {
  background: color-mix(in srgb, var(--brand-primary) 5%, transparent);
}
.mx-featured-card:hover { background: color-mix(in srgb, var(--brand-primary) 7%, var(--bg-overlay)); }

/* Header drill-down */
.mx-asset-head {
  display: flex; align-items: center; flex-wrap: wrap; gap: 14px;
  padding: 16px 20px 4px;
}
@media (min-width: 1024px) { .mx-asset-head { padding: 0; } }
.mx-asset-back {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 12px 6px 8px;
  background: var(--bg-overlay);
  color: var(--text-heading);
  border-radius: 999px;
  font-size: 13px; font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease;
}
.mx-asset-back:hover { background: color-mix(in srgb, var(--brand-primary) 12%, var(--bg-overlay)); }
.mx-asset-head-meta {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
}
.mx-asset-head-tag {
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  padding: 3px 8px; border-radius: 4px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
}

/* Asset hero card */
.mx-asset-hero { display: flex; flex-direction: column; gap: 14px; }
.mx-asset-hero-head { display: flex; align-items: center; gap: 12px; }
.mx-asset-mark {
  width: 44px; height: 44px; border-radius: 12px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 800;
  flex-shrink: 0;
}
.mx-asset-tk-big {
  margin: 0;
  font-size: 18px; font-weight: 800;
  color: var(--text-heading);
  letter-spacing: 0.01em;
}
.mx-asset-name {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--text-muted);
}
.mx-asset-hero-body {
  display: grid; grid-template-columns: 1fr auto;
  align-items: end; gap: 16px;
}
.mx-asset-price {
  margin: 0;
  font-size: clamp(28px, 5vw, 36px);
  font-weight: 700;
  color: var(--text-heading);
  letter-spacing: -0.025em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.mx-asset-delta {
  display: inline-flex; align-items: center; gap: 6px;
  margin: 8px 0 0;
  font-size: 13px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.mx-asset-spark {
  width: 120px; height: 50px;
  display: block;
}
@media (min-width: 768px) { .mx-asset-spark { width: 180px; height: 60px; } }

.mx-asset-quick {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 12px 16px;
  margin: 14px 0 0;
  padding-top: 14px;
  border-top: 1px solid color-mix(in srgb, var(--text-heading) 6%, transparent);
}
@media (min-width: 768px) { .mx-asset-quick { grid-template-columns: repeat(6, 1fr); } }
.mx-asset-quick > div { display: flex; flex-direction: column; gap: 2px; }
.mx-asset-quick dt {
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-muted);
}
.mx-asset-quick dd {
  margin: 0;
  font-size: 14px; font-weight: 700;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.005em;
}

/* Fundamentos grid (6 cells) */
.mx-fund-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  margin: 4px 0 0;
  background: color-mix(in srgb, var(--text-heading) 6%, transparent);
  border-radius: 12px;
  overflow: hidden;
  list-style: none; padding: 0;
}
@media (min-width: 768px) { .mx-fund-grid { grid-template-columns: repeat(6, 1fr); } }
.mx-fund-cell {
  padding: 14px;
  background: var(--bg-overlay);
  display: flex; flex-direction: column; gap: 4px;
  transition: background-color 150ms ease;
}
.mx-fund-cell:hover { background: color-mix(in srgb, var(--brand-primary) 7%, var(--bg-overlay)); }
.mx-fund-cell-hi { background: color-mix(in srgb, var(--brand-primary) 8%, var(--bg-overlay)); }
.mx-fund-label {
  margin: 0;
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-muted);
}
.mx-fund-value {
  margin: 0;
  font-size: 18px; font-weight: 700;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.015em;
}
.mx-fund-tip {
  margin: 0;
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.02em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* Checklist */
.mx-checklist-deck {
  margin: 4px 0 0;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.mx-checklist-deck strong { font-weight: 800; font-size: 14px; }
.mx-checklist { list-style: none; padding: 0; margin: 0; }
.mx-checklist-row {
  display: grid; grid-template-columns: 24px 1fr;
  align-items: start; gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--text-heading) 5%, transparent);
}
.mx-checklist-row:last-child { border-bottom: 0; padding-bottom: 0; }
.mx-checklist-row:first-child { padding-top: 0; }
.mx-checklist-icon {
  width: 22px; height: 22px; border-radius: 999px;
  display: inline-flex; align-items: center; justify-content: center;
  margin-top: 1px;
  flex-shrink: 0;
}
.mx-cl-pass { background: color-mix(in srgb, var(--brand-positive) 14%, transparent); color: var(--brand-positive); }
.mx-cl-fail { background: color-mix(in srgb, var(--brand-negative) 14%, transparent); color: var(--brand-negative); }
.mx-cl-na   { background: color-mix(in srgb, var(--text-heading) 8%, transparent); color: var(--text-muted); }
.mx-checklist-body { min-width: 0; }
.mx-checklist-criteria {
  margin: 0;
  font-size: 13px; font-weight: 600;
  color: var(--text-heading);
  letter-spacing: -0.005em;
}
.mx-checklist-detail {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

/* Dividend heatmap (12 monthly cells) */
.mx-div-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  margin: 4px 0 0;
  background: color-mix(in srgb, var(--text-heading) 6%, transparent);
  border-radius: 12px;
  overflow: hidden;
  list-style: none; padding: 0;
}
@media (min-width: 480px) { .mx-div-grid { grid-template-columns: repeat(6, 1fr); } }
@media (min-width: 1024px) { .mx-div-grid { grid-template-columns: repeat(6, 1fr); } }
.mx-div-cell {
  padding: 10px;
  background: var(--bg-overlay);
  display: flex; flex-direction: column; gap: 4px;
}
.mx-div-cell-hi { background: color-mix(in srgb, var(--brand-positive) 10%, var(--bg-overlay)); }
.mx-div-month {
  margin: 0;
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--text-muted);
}
.mx-div-pct {
  margin: 0;
  font-size: 14px; font-weight: 700;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
}
.mx-div-bar {
  height: 3px;
  background: color-mix(in srgb, var(--text-heading) 8%, transparent);
  border-radius: 999px;
  overflow: hidden;
}
.mx-div-bar span {
  display: block; height: 100%;
  background: var(--brand-primary);
}
.mx-div-cell-hi .mx-div-bar span { background: var(--brand-positive); }
.mx-div-value {
  margin: 0;
  font-size: 10px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

/* Sobre + Tese */
.mx-about-body {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-body);
}
.mx-about-meta {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin: 16px 0 0;
  padding-top: 14px;
  border-top: 1px solid color-mix(in srgb, var(--text-heading) 6%, transparent);
}
.mx-about-meta > div { display: flex; flex-direction: column; gap: 2px; }
.mx-about-meta dt {
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--text-muted);
}
.mx-about-meta dd {
  margin: 0;
  font-size: 13px; font-weight: 600;
  color: var(--text-heading);
}

/* Peers table */
.mx-peer-hi { background: color-mix(in srgb, var(--brand-primary) 8%, transparent); }
.mx-peer-hi strong { color: var(--brand-primary); }

/* ============ MERCADO ============ */
.mx-mercado-hero { padding-top: 22px; padding-bottom: 8px; }
.mx-mercado-live {
  display: inline-flex; align-items: center; gap: 6px;
  margin: 0 0 8px;
}
.mx-live-dot {
  width: 6px; height: 6px; border-radius: 999px;
  background: var(--brand-positive);
  box-shadow: 0 0 6px var(--brand-positive);
  animation: mxLivePulse 2s ease-in-out infinite;
}
@keyframes mxLivePulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
.mx-mercado-h1 {
  margin: 0;
  font-size: clamp(22px, 3.5vw, 28px);
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--text-heading);
}
.mx-mercado-sub {
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--text-body);
  max-width: 56ch;
}

/* Featured tickers row (scroll horizontal sempre — igual ao crypto carousel) */
.mx-mercado-featured {
  display: flex; gap: 12px;
  padding: 6px 20px 6px;
  overflow-x: auto;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
  scroll-padding-inline-start: 20px;
}
@media (min-width: 1024px) {
  .mx-mercado-featured { padding: 6px 0; scroll-padding-inline-start: 0; }
}
.mx-mercado-featured::-webkit-scrollbar { display: none; }
.mx-featured-card {
  flex-shrink: 0;
  width: 200px;
  padding: 16px;
  background: var(--bg-overlay);
  border-radius: 14px;
  scroll-snap-align: start;
  display: flex; flex-direction: column; gap: 4px;
}
.mx-featured-card-index {
  background: color-mix(in srgb, var(--brand-primary) 8%, var(--bg-overlay));
}
.mx-featured-head {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 8px;
}
.mx-featured-mark {
  width: 32px; height: 32px; border-radius: 10px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800;
  flex-shrink: 0;
}
.mx-featured-meta { flex: 1; min-width: 0; }
.mx-featured-tk {
  margin: 0;
  font-size: 13px; font-weight: 700;
  color: var(--text-heading);
  letter-spacing: 0.005em;
}
.mx-featured-name {
  margin: 1px 0 0;
  font-size: 10px;
  color: var(--text-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mx-featured-tag {
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  padding: 2px 6px; border-radius: 4px;
  background: color-mix(in srgb, var(--text-heading) 6%, transparent);
  color: var(--text-muted);
  flex-shrink: 0;
}
.mx-featured-price {
  margin: 0;
  font-size: 19px; font-weight: 700;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.015em;
  line-height: 1.1;
}
.mx-featured-delta {
  display: inline-flex; align-items: center; flex-wrap: wrap; gap: 4px;
  margin: 4px 0 0;
  font-size: 12px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.mx-featured-sub { color: var(--text-muted); font-weight: 500; }
.mx-featured-spark {
  width: 100%; height: 32px;
  margin-top: 8px;
  display: block;
}

/* Movers tabs + grid */
.mx-movers-tabs {
  display: flex; gap: 6px;
  margin: 4px 0 14px;
  overflow-x: auto;
  scrollbar-width: none;
}
.mx-movers-tabs::-webkit-scrollbar { display: none; }
.mx-movers-tab {
  padding: 6px 12px;
  background: var(--bg-base);
  color: var(--text-muted);
  border-radius: 999px;
  font-size: 12px; font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease, color 150ms ease;
  flex-shrink: 0;
}
.mx-movers-tab:hover { color: var(--text-heading); }
.mx-movers-tab-active {
  background: var(--text-heading);
  color: var(--bg-base);
}

.mx-movers-grid {
  display: grid; grid-template-columns: 1fr;
  gap: 24px;
}
@media (min-width: 768px) {
  .mx-movers-grid { grid-template-columns: 1fr 1fr; gap: 28px; }
}
.mx-movers-h {
  margin: 0 0 10px;
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
}
.mx-movers-list { list-style: none; padding: 0; margin: 0; }
.mx-movers-row {
  display: grid; grid-template-columns: 32px 1fr auto;
  align-items: center; gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--text-heading) 5%, transparent);
}
.mx-movers-row:last-child { border-bottom: 0; padding-bottom: 0; }
.mx-movers-row:first-of-type { padding-top: 0; }
.mx-movers-mark {
  width: 32px; height: 32px; border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  color: var(--brand-primary);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800;
}
.mx-movers-meta { min-width: 0; }
.mx-movers-tk {
  margin: 0;
  font-size: 13px; font-weight: 700;
  color: var(--text-heading);
  letter-spacing: 0.005em;
}
.mx-movers-name {
  margin: 1px 0 0;
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mx-movers-right { text-align: right; }
.mx-movers-price {
  margin: 0;
  font-size: 13px; font-weight: 600;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
}
.mx-movers-pct {
  margin: 1px 0 0;
  font-size: 12px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* Crypto cards (scroll horizontal) */
.mx-crypto-list {
  display: flex; gap: 12px;
  padding: 6px 0;
  overflow-x: auto;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
}
.mx-crypto-list::-webkit-scrollbar { display: none; }
.mx-crypto-card {
  flex-shrink: 0;
  width: 200px;
  padding: 16px;
  background: var(--bg-overlay);
  border-radius: 14px;
  scroll-snap-align: start;
  display: flex; flex-direction: column; gap: 4px;
}
.mx-crypto-card-hi {
  width: 280px;
  background: color-mix(in srgb, var(--brand-primary) 6%, var(--bg-overlay));
}
.mx-crypto-head {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 6px;
}
.mx-crypto-mark {
  width: 32px; height: 32px; border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800;
  letter-spacing: -0.01em;
  flex-shrink: 0;
}
.mx-crypto-meta { min-width: 0; flex: 1; }
.mx-crypto-tk {
  margin: 0;
  font-size: 13px; font-weight: 700;
  color: var(--text-heading);
}
.mx-crypto-name {
  margin: 1px 0 0;
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.02em;
}
.mx-crypto-price {
  margin: 0;
  font-size: 18px; font-weight: 700;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.015em;
}
.mx-crypto-delta {
  display: inline-flex; align-items: center; gap: 4px;
  margin: 2px 0 0;
  font-size: 12px; font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.mx-crypto-extra {
  margin: 10px 0 0;
  padding-top: 10px;
  border-top: 1px solid color-mix(in srgb, var(--text-heading) 6%, transparent);
  font-size: 11px;
  color: var(--text-body);
  font-variant-numeric: tabular-nums;
  display: flex; flex-wrap: wrap; gap: 4px;
}
.mx-crypto-extra strong { color: var(--text-heading); font-weight: 700; }

/* Tesouro Direto cards */
.mx-tesouro-grid {
  display: grid; grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 14px;
}
@media (min-width: 768px) { .mx-tesouro-grid { grid-template-columns: 1fr 1fr; } }
.mx-tesouro-card { padding: 16px; }
.mx-tesouro-list { list-style: none; padding: 0; margin: 0; }
.mx-tesouro-row {
  display: grid; grid-template-columns: 1fr auto;
  align-items: center; gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--text-heading) 5%, transparent);
}
.mx-tesouro-row:last-child { border-bottom: 0; padding-bottom: 0; }
.mx-tesouro-row:first-child { padding-top: 0; }
.mx-tesouro-info { min-width: 0; }
.mx-tesouro-name {
  margin: 0;
  font-size: 13px; font-weight: 600;
  color: var(--text-heading);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mx-tesouro-venc {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.mx-tesouro-price {
  margin: 0;
  font-size: 14px; font-weight: 700;
  color: var(--text-heading);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* Notícias do mercado agrupadas */
.mx-mn-groups {
  display: flex; flex-direction: column; gap: 16px;
  margin-top: 4px;
}
.mx-mn-group {
  padding-top: 14px;
  border-top: 1px solid color-mix(in srgb, var(--text-heading) 6%, transparent);
}
.mx-mn-group:first-child { padding-top: 0; border-top: 0; }
.mx-mn-group-head {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 10px;
}
.mx-mn-group-tk {
  font-size: 11px; font-weight: 800;
  letter-spacing: 0.04em;
  padding: 3px 8px; border-radius: 5px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
}
.mx-mn-group-count {
  font-size: 11px; font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.04em;
}
.mx-mn-list { list-style: none; padding: 0; margin: 0; }
.mx-mn-row {
  padding: 10px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--text-heading) 4%, transparent);
}
.mx-mn-row:last-child { border-bottom: 0; padding-bottom: 0; }
.mx-mn-row:first-child { padding-top: 0; }
.mx-mn-headline {
  margin: 0;
  font-size: 14px; font-weight: 600;
  line-height: 1.4;
  color: var(--text-heading);
  letter-spacing: -0.005em;
}
.mx-mn-meta {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

/* ============ FLOATING MENU (mobile) ============ */
.mx-floating-menu {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 40;
}
.mx-floating-inner {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.90);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 999px;
  box-shadow:
    0 24px 48px -14px rgba(26, 10, 46, 0.20),
    0 8px 20px -6px rgba(26, 10, 46, 0.10),
    inset 0 1px 0 rgba(255,255,255,0.7);
}
.mx-floating-tab {
  width: 52px; height: 52px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 999px;
  color: var(--text-muted);
  background: transparent;
  cursor: pointer;
  transition: background-color 200ms ease, color 200ms ease, transform 200ms ease;
}
.mx-floating-tab:hover { color: var(--text-heading); background: rgba(255, 255, 255, 0.5); }
.mx-floating-tab:active { transform: scale(0.92); }
.mx-floating-tab-active { background: var(--brand-primary); color: white; }
.mx-floating-tab-active:hover { background: var(--brand-primary); color: white; }

/* ============ BOTTOM SHEET MENU ============ */
.mx-sheet-bd {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4); backdrop-filter: blur(6px);
  z-index: 80;
}
.mx-sheet {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: var(--bg-base);
  border-top-left-radius: 24px; border-top-right-radius: 24px;
  border-top: 1px solid var(--border-subtle);
  max-height: 85vh;
  overflow-y: auto;
  scrollbar-width: none;
  z-index: 90;
}
@media (min-width: 1024px) {
  .mx-sheet { display: none; }
  .mx-sheet-bd { display: none; }
}
.mx-sheet-handle {
  width: 40px; height: 4px;
  background: var(--border-default);
  border-radius: 999px;
  margin: 12px auto 0;
}
.mx-sheet-head {
  display: grid; grid-template-columns: 40px 1fr 40px;
  align-items: center;
  padding: 14px 16px 6px;
}
.mx-sheet-title {
  justify-self: center;
  font-size: 16px; font-weight: 700;
  color: var(--text-heading);
  margin: 0;
}
.mx-sheet-nav { padding: 8px 12px 28px; }
.mx-sheet-group { padding: 12px 0 4px; }
.mx-sheet-group-h {
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-muted);
  margin: 0 0 4px;
  padding: 0 8px;
}
.mx-sheet-item {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 8px;
  border-radius: 12px;
  font-size: 15px; color: var(--text-heading);
  font-weight: 500;
  cursor: pointer;
}
.mx-sheet-item:hover { background: var(--bg-overlay); }
.mx-sheet-item-label { flex: 1; }
.mx-sheet-chevron { color: var(--text-muted); }

.mx-bd-enter-active { transition: opacity 320ms cubic-bezier(0.4, 0, 0.2, 1); }
.mx-bd-leave-active { transition: opacity 240ms cubic-bezier(0.4, 0, 1, 1); }
.mx-bd-enter-from, .mx-bd-leave-to { opacity: 0; }
.mx-sheet-enter-active { transition: transform 540ms cubic-bezier(0.16, 1, 0.3, 1); }
.mx-sheet-leave-active { transition: transform 360ms cubic-bezier(0.4, 0, 0.6, 1); }
.mx-sheet-enter-from, .mx-sheet-leave-to { transform: translateY(100%); }
</style>

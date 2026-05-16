<!--
  V8 — Wallet inspirada nas calculadoras V5.
  Reusa CalcUiShell: status strip, atmospheric blur, split 2x2 com bordas internas.
  - Hero (top-left): identity + headline italic + lead + chips
  - Result (top-right): MEGA patrimônio + delta + KPIs (renda 12m, score, ativos)
  - Form (bottom-left): composição (donut + legend) + status Open Finance
  - Chart (bottom-right): curva 90d vs IBOV
  Abaixo do shell: bancos, tabela posições, raio-X, renda + eventos.
-->
<template>
  <NuxtLayout name="default" title="Preview Wallet · V8 Calc style">
    <!-- EMPTY STATE — apos carregar, se nao tem positions, mostra
         um card editorial calc-style com CTA pra /integracoes. -->
    <section v-if="!loading && !positionsReal.length" class="wp8-empty">
      <div class="wp8-empty-inner">
        <p class="calc-eyebrow">Carteira vazia</p>
        <h1 class="wp8-empty-title">
          Conecte sua corretora e veja sua carteira <em class="calc-italic">em tempo real.</em>
        </h1>
        <p class="wp8-empty-lead">
          Open Finance puxa posições, saldos e dividendos automaticamente. Sem planilhas, sem inputs manuais.
          Em alguns minutos seu Raio-X em 9 dimensões fica pronto.
        </p>
        <div class="wp8-empty-ctas">
          <NuxtLink to="/integracoes" class="wp8-result-btn">
            <UIcon name="i-lucide-link-2" class="size-4" />
            <span>Conectar Open Finance</span>
            <UIcon name="i-lucide-arrow-right" class="size-4 wp8-result-arrow" />
          </NuxtLink>
          <NuxtLink to="/help?intent=import-portfolio" class="wp8-result-btn wp8-result-btn--ghost">
            <UIcon name="i-lucide-message-square" class="size-4" />
            <span>Importar via chat</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <CalcUiShell
      v-else
      :last-updated="lastUpdated"
    >
      <!-- HERO -->
      <template #hero>
        <p class="calc-eyebrow">
          <template v-if="loading"><span class="wp8-skel wp8-skel-text-sm" /></template>
          <template v-else>Sua carteira · {{ openFinanceStatus.bankCount }} bancos sincronizados</template>
        </p>
        <h1 class="calc-title">
          Patrimônio hoje, projeções e
          <em class="calc-italic">renda passiva.</em>
        </h1>
        <p class="calc-lead">
          <template v-if="loading">
            Sincronizando seus ativos via Open Finance. Análise IA, Raio-X em 9 dimensões e curva comparada com IBOV — tudo num único painel editorial.
          </template>
          <template v-else>
            {{ positions.length }} ativos sincronizados via Open Finance. Análise IA, Raio-X em 9 dimensões e curva comparada com IBOV — tudo num único painel editorial.
          </template>
        </p>
        <ul class="calc-chips">
          <li><span class="dot positive" /> 100% Open Finance</li>
          <li v-if="loading"><span class="dot" /> <span class="wp8-skel wp8-skel-chip" /></li>
          <li v-else><span class="dot" /> Sync {{ openFinanceStatus.lastSync }}</li>
          <li v-if="loading"><span class="dot" /> <span class="wp8-skel wp8-skel-chip" /></li>
          <li v-else><span class="dot" /> {{ allocationByType.length }} classes</li>
          <li v-if="loading"><span class="dot" /> <span class="wp8-skel wp8-skel-chip" /></li>
          <li v-else><span class="dot" /> Renda 12m {{ formatBRL(dividendForecast12m, { compact: true }) }}</li>
        </ul>

        <div class="wp8-hero-ctas">
          <button type="button" class="wp8-highlights-btn" @click="openHighlights">
            <span class="wp8-highlights-play">
              <UIcon name="i-lucide-play" class="size-3.5" />
            </span>
            <span>Ver Highlights</span>
            <UIcon name="i-lucide-arrow-right" class="size-4 wp8-highlights-arrow" />
          </button>

          <NuxtLink to="/wallet/resultado" class="wp8-result-btn">
            <UIcon name="i-lucide-bar-chart-3" class="size-4" />
            <span>Resultado consolidado</span>
            <UIcon name="i-lucide-arrow-right" class="size-4 wp8-result-arrow" />
          </NuxtLink>
        </div>
      </template>

      <!-- RESULT — MEGA patrimônio + KPIs -->
      <template #result>
        <p class="calc-result-eyebrow">Patrimônio total · {{ today }}</p>
        <p v-if="loading" class="calc-result-mega"><span class="wp8-skel wp8-skel-text-mega" /></p>
        <p v-else class="calc-result-mega">{{ formatBRL(totalEquity) }}</p>
        <p class="calc-result-caption">
          <template v-if="loading"><span class="wp8-skel wp8-skel-text-sm" /></template>
          <template v-else>
            <span :class="totalPnl >= 0 ? 'positive' : 'negative'">
              {{ totalPnl >= 0 ? '↑' : '↓' }} {{ totalPnl >= 0 ? '+' : '' }}{{ formatBRL(totalPnl) }} ({{ formatPct(totalPnlPct) }})
            </span>
            <span> · desde jan/25</span>
          </template>
        </p>

        <div class="calc-result-divider" />

        <dl class="calc-kpis">
          <div>
            <dt>Renda projetada 12m</dt>
            <dd v-if="loading"><span class="wp8-skel wp8-skel-kpi" /></dd>
            <dd v-else class="primary">{{ formatBRL(dividendForecast12m, { compact: true }) }}</dd>
          </div>
          <div>
            <dt>Redentia Score</dt>
            <dd v-if="loading"><span class="wp8-skel wp8-skel-kpi" /></dd>
            <dd v-else class="positive">{{ portfolioScore }}<span class="wp-kpi-suf">/100</span></dd>
          </div>
          <div>
            <dt>Ativos</dt>
            <dd v-if="loading"><span class="wp8-skel wp8-skel-kpi" /></dd>
            <dd v-else>{{ positions.length }}</dd>
          </div>
        </dl>
      </template>

      <!-- FORM area → COMPOSIÇÃO + open finance status -->
      <template #form>
        <p class="calc-result-eyebrow">Composição · por classe</p>
        <div class="wp8-compose">
          <svg viewBox="0 0 200 200" class="wp8-donut">
            <g transform="translate(100,100)">
              <circle r="80" fill="none" stroke="var(--bg-overlay)" stroke-width="20" />
              <template v-if="!loading">
                <circle v-for="(seg, idx) in donutSegments" :key="idx"
                  r="80" fill="none" :stroke="seg.color" stroke-width="20"
                  :stroke-dasharray="`${seg.length} ${502.6 - seg.length}`"
                  :stroke-dashoffset="seg.offset" transform="rotate(-90)" />
              </template>
            </g>
            <text x="100" y="92" text-anchor="middle" class="wp8-donut-num">{{ loading ? '—' : allocationByType.length }}</text>
            <text x="100" y="115" text-anchor="middle" class="wp8-donut-cap">classes</text>
          </svg>

          <ul v-if="loading" class="wp8-legend">
            <li v-for="n in 4" :key="n">
              <span class="wp8-dot" :style="{ background: 'var(--bg-overlay)' }" />
              <span class="wp8-leg-name"><span class="wp8-skel wp8-skel-text-sm" /></span>
              <span class="wp8-leg-val"><span class="wp8-skel wp8-skel-chip" /></span>
              <span class="wp8-leg-pct"><span class="wp8-skel wp8-skel-chip" /></span>
            </li>
          </ul>
          <ul v-else class="wp8-legend">
            <li v-for="a in allocationByType.slice(0, 4)" :key="a.label">
              <span class="wp8-dot" :style="{ background: dotColor(a.label) }" />
              <span class="wp8-leg-name">{{ a.label }}</span>
              <span class="wp8-leg-val">{{ formatBRL(a.value, { compact: true }) }}</span>
              <span class="wp8-leg-pct">{{ a.pct.toFixed(1) }}%</span>
            </li>
          </ul>
        </div>

        <div class="calc-result-divider" />

        <div class="wp8-of-block">
          <p class="calc-result-eyebrow" style="margin-bottom: 12px;">Open Finance</p>
          <p class="wp8-of-status">
            <span class="wp8-of-dot positive" />
            <span v-if="loading"><span class="wp8-skel wp8-skel-text-sm" /></span>
            <span v-else><strong>{{ openFinanceStatus.bankCount }} bancos</strong> conectados · última sync <strong>{{ openFinanceStatus.lastSync }}</strong></span>
          </p>
          <p class="wp8-of-meta">
            Próxima sincronização automática em 6h. Toque em qualquer banco abaixo para forçar atualização.
          </p>
        </div>
      </template>

      <!-- CHART → PATRIMÔNIO 90D (real data, com tooltip) -->
      <template #chart>
        <header class="wp8-chart-head">
          <div>
            <p class="calc-result-eyebrow">Patrimônio · 90 dias</p>
            <h3 class="wp8-chart-title">Evolução <em class="calc-italic">no período.</em></h3>
          </div>
          <div class="wp8-legend-inline">
            <span class="wp8-legi">
              <span class="wp8-dot pos" />
              {{ loading ? '—' : formatBRL(patrimonioChart.last, { compact: true }) }}
            </span>
            <span class="wp8-legi muted" :class="{ 'is-neg': patrimonioChart.deltaPct < 0 }">
              {{ loading ? '' : formatPct(patrimonioChart.deltaPct) }}
            </span>
          </div>
        </header>

        <div class="wp8-curve">
          <div v-if="loading || !patrimonioChart.n" class="wp8-skel wp8-skel-curve" />
          <svg
            v-else
            ref="chartSvgRef"
            viewBox="0 0 800 280"
            preserveAspectRatio="none"
            class="wp8-chart-svg"
            @mousemove="onChartMouseMove"
            @mouseleave="onChartMouseLeave"
          >
            <defs>
              <linearGradient id="wp8-curve-g" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="var(--brand-positive)" stop-opacity="0.22" />
                <stop offset="100%" stop-color="var(--brand-positive)" stop-opacity="0" />
              </linearGradient>
            </defs>
            <line v-for="y in [56, 112, 168, 224]" :key="y" x1="0" :y1="y" x2="800" :y2="y" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="2 4" />
            <polygon :points="`0,280 ${patrimonioPath} 800,280`" fill="url(#wp8-curve-g)" />
            <polyline :points="patrimonioPath" fill="none" stroke="var(--brand-positive)" stroke-width="2" />

            <g v-if="hoverPoint" class="wp8-chart-hover">
              <line :x1="hoverPoint.x" y1="0" :x2="hoverPoint.x" y2="280" stroke="var(--text-heading)" stroke-width="1" stroke-dasharray="3 3" opacity="0.35" />
              <circle :cx="hoverPoint.x" :cy="hoverPoint.y" r="5" fill="var(--brand-positive)" stroke="var(--bg-default)" stroke-width="2" />
            </g>
          </svg>

          <div
            v-if="hoverPoint && !loading"
            class="wp8-chart-tip"
            :style="{ left: `${(hoverPoint.x / 800) * 100}%` }"
          >
            <p class="wp8-chart-tip-date">{{ formatChartDate(hoverPoint.date) }}</p>
            <p class="wp8-chart-tip-val">{{ formatBRL(hoverPoint.value) }}</p>
          </div>
        </div>

        <ul class="wp8-curve-stats">
          <li>
            <p class="wp8-cs-label">Patrimônio máx.</p>
            <p v-if="loading" class="wp8-cs-val"><span class="wp8-skel wp8-skel-kpi" /></p>
            <p v-else class="wp8-cs-val">{{ formatBRL(patrimonioKpis.high, { compact: true }) }}</p>
          </li>
          <li>
            <p class="wp8-cs-label">Patrimônio mín.</p>
            <p v-if="loading" class="wp8-cs-val"><span class="wp8-skel wp8-skel-kpi" /></p>
            <p v-else class="wp8-cs-val">{{ formatBRL(patrimonioKpis.low, { compact: true }) }}</p>
          </li>
          <li>
            <p class="wp8-cs-label">Volatilidade</p>
            <p v-if="loading" class="wp8-cs-val"><span class="wp8-skel wp8-skel-kpi" /></p>
            <p v-else class="wp8-cs-val">{{ patrimonioKpis.vol.toFixed(2).replace('.', ',') }}</p>
          </li>
          <li>
            <p class="wp8-cs-label">Variação 90d</p>
            <p v-if="loading" class="wp8-cs-val"><span class="wp8-skel wp8-skel-kpi" /></p>
            <p v-else class="wp8-cs-val" :class="patrimonioKpis.deltaPct >= 0 ? 'positive' : 'negative'">
              {{ formatPct(patrimonioKpis.deltaPct) }}
            </p>
          </li>
        </ul>
      </template>
    </CalcUiShell>

    <!-- ============ SEÇÕES ABAIXO DO SHELL ============ -->
    <section v-if="loading || positionsReal.length" class="wp8-rail">
      <!-- BANCOS Open Finance -->
      <section class="wp8-section">
        <header class="wp8-head">
          <div>
            <p class="calc-eyebrow">Contas conectadas</p>
            <h2 class="wp8-h2">Open Finance <em class="calc-italic">strip.</em></h2>
          </div>
          <div class="wp8-head-actions">
            <p v-if="loading" class="wp8-head-meta"><span class="wp8-skel wp8-skel-text-sm" /></p>
            <p v-else class="wp8-head-meta">{{ bankAccounts.length }} bancos · sync {{ openFinanceStatus.lastSync }}</p>
            <NuxtLink to="/integracoes" class="wp8-head-link">
              Gerenciar integrações
              <UIcon name="i-lucide-arrow-right" class="size-3.5" />
            </NuxtLink>
          </div>
        </header>

        <div class="wp8-banks">
          <template v-if="loading">
            <article v-for="n in 3" :key="`skel-bank-${n}`" class="wp8-bank">
              <p class="wp8-bank-name"><span class="wp8-skel wp8-skel-text-sm" /></p>
              <p class="wp8-bank-type"><span class="wp8-skel wp8-skel-chip" /></p>
              <p class="wp8-bank-balance"><span class="wp8-skel wp8-skel-kpi" /></p>
              <p class="wp8-bank-sync"><span class="wp8-skel wp8-skel-chip" /></p>
            </article>
          </template>
          <template v-else>
            <article v-for="b in bankAccounts" :key="b.id" class="wp8-bank">
              <p class="wp8-bank-name">{{ b.bank }}</p>
              <p class="wp8-bank-type">{{ b.type }}</p>
              <p class="wp8-bank-balance">{{ formatBRL(b.balance) }}</p>
              <p class="wp8-bank-sync">sync {{ b.lastSync }}</p>
            </article>
          </template>

          <!-- Add new account cell (sempre visivel) -->
          <NuxtLink to="/integracoes" class="wp8-bank wp8-bank-add">
            <span class="wp8-bank-add-icon">
              <UIcon name="i-lucide-plus" class="size-5" />
            </span>
            <p class="wp8-bank-add-title">Conectar banco</p>
            <p class="wp8-bank-add-sub">Itaú, Nubank, Bradesco, Santander e mais 30+</p>
          </NuxtLink>
        </div>
      </section>

      <!-- POSIÇÕES — agrupadas por classe, colapsável -->
      <section class="wp8-section">
        <header class="wp8-head">
          <div>
            <p class="calc-eyebrow">
              <template v-if="loading">Carregando suas posições…</template>
              <template v-else>Suas posições · {{ positions.length }} ativos</template>
            </p>
            <h2 class="wp8-h2">Por <em class="calc-italic">classe.</em></h2>
          </div>
          <div class="wp8-head-actions">
            <button v-if="!loading" type="button" class="wp8-head-link wp8-head-link--ghost" @click="toggleAllGroups">
              {{ allGroupsOpen ? 'Recolher tudo' : 'Expandir tudo' }}
              <UIcon :name="allGroupsOpen ? 'i-lucide-chevrons-up' : 'i-lucide-chevrons-down'" class="size-3.5" />
            </button>
          </div>
        </header>

        <div v-if="loading" class="wp8-pos-groups">
          <article v-for="n in 3" :key="`skel-pos-${n}`" class="wp8-pos-group">
            <div class="wp8-pos-head" style="cursor: default;">
              <div class="wp8-pos-head-left">
                <span class="wp8-skel wp8-skel-text-sm" style="width: 120px;" />
                <span class="wp8-skel wp8-skel-chip" style="width: 60px;" />
              </div>
              <div class="wp8-pos-head-right">
                <span class="wp8-skel wp8-skel-kpi" style="width: 80px;" />
                <span class="wp8-skel wp8-skel-kpi" style="width: 60px;" />
              </div>
            </div>
          </article>
        </div>
        <div v-else class="wp8-pos-groups">
          <article v-for="group in positionGroups" :key="group.type" class="wp8-pos-group">
            <button type="button" class="wp8-pos-head" @click="toggleGroup(group.type)">
              <div class="wp8-pos-head-left">
                <UIcon name="i-lucide-chevron-right" :class="['wp8-pos-chev', { 'is-open': expandedGroups.has(group.type) }]" />
                <span class="wp8-pos-type">{{ group.label }}</span>
                <span class="wp8-pos-count">{{ group.positions.length }} {{ group.positions.length === 1 ? 'ativo' : 'ativos' }}</span>
              </div>
              <div class="wp8-pos-head-right">
                <span class="wp8-pos-weight">
                  <span class="wp8-pos-weight-bar"><span :style="{ width: `${group.totalWeight}%`, background: group.color }" /></span>
                  <span class="wp8-pos-weight-num">{{ group.totalWeight.toFixed(1) }}%</span>
                </span>
                <span class="wp8-pos-value">{{ formatBRL(group.totalValue, { compact: true }) }}</span>
                <span :class="['wp8-pos-pnl', group.totalPnl >= 0 ? 'pos' : 'neg']">
                  {{ group.totalPnl >= 0 ? '+' : '' }}{{ formatBRL(group.totalPnl, { compact: true }) }}
                </span>
                <span :class="['wp8-pos-pct', group.totalPnlPct >= 0 ? 'pos' : 'neg']">
                  {{ formatPct(group.totalPnlPct) }}
                </span>
              </div>
            </button>

            <div v-show="expandedGroups.has(group.type)" class="wp8-pos-body">
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
                      <th>P&L</th>
                      <th>%</th>
                      <th>DY</th>
                      <th>7d</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="p in group.positions" :key="p.ticker">
                      <td class="left strong">{{ p.ticker }}</td>
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
                      <td :class="p.pnl >= 0 ? 'positive' : 'negative'">{{ p.pnl >= 0 ? '+' : '' }}{{ formatBRL(p.pnl) }}</td>
                      <td :class="p.pnlPct >= 0 ? 'positive' : 'negative'">{{ formatPct(p.pnlPct) }}</td>
                      <td class="muted">{{ p.dividendYield.toFixed(1) }}%</td>
                      <td class="wp8-spark-cell">
                        <svg viewBox="0 0 60 20" class="wp8-spark">
                          <polyline :points="sparkline(p.sparkline, 60, 20)" fill="none" :stroke="p.pnl >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'" stroke-width="1.4" />
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

      <!-- RAIO-X 9 DIMENSÕES -->
      <section class="wp8-section">
        <header class="wp8-head">
          <div>
            <p class="calc-eyebrow">Análise IA · 9 dimensões</p>
            <h2 class="wp8-h2">Raio-X <em class="calc-italic">da carteira.</em></h2>
          </div>
          <p class="wp8-head-meta">Atualizado a cada rebalanceamento</p>
        </header>

        <!-- Loading: skeletons enquanto carrega a analysis -->
        <div v-if="loading" class="wp8-raiox-split">
          <div class="wp8-snowflake">
            <div class="wp8-skel wp8-skel-snowflake" />
            <div class="wp8-snowflake-meta">
              <p class="calc-result-eyebrow" style="margin-bottom: 6px;">Score geral</p>
              <p class="wp8-sf-score"><span class="wp8-skel wp8-skel-kpi" style="display: inline-block; width: 90px; height: 48px;" /></p>
              <p class="wp8-sf-status"><span class="wp8-skel wp8-skel-text-sm" /></p>
            </div>
          </div>
          <div class="wp8-rx-insights">
            <article v-for="n in 3" :key="`skel-ins-${n}`" class="wp8-ins">
              <p class="wp8-ins-tag"><span class="wp8-skel wp8-skel-chip" /></p>
              <h4 class="wp8-ins-h"><span class="wp8-skel wp8-skel-text-sm" /></h4>
              <p class="wp8-ins-note"><span class="wp8-skel wp8-skel-text-sm" style="width: 80%;" /></p>
            </article>
          </div>
        </div>

        <!-- Empty state: carteira importada mas Raio-X ainda nao foi gerado.
             CTA roteia pro /help?intent=analyze-portfolio (o chat dispara
             o pipeline de análise e ao terminar invalida o cache, popula
             `analysis` em portfolio_analyses e o user volta pra cá pra ver). -->
        <div v-else-if="!raioXDimensions.length" class="wp8-rx-empty">
          <div class="wp8-rx-empty-shape" aria-hidden="true">
            <svg viewBox="-130 -130 260 260" class="wp8-snowflake-svg">
              <circle cx="0" cy="0" r="60" fill="none" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="2 5" opacity="0.6" />
              <circle cx="0" cy="0" r="120" fill="none" stroke="var(--border-subtle)" stroke-width="1" />
              <line v-for="i in 9" :key="i" x1="0" y1="0"
                :x2="Math.cos((i * 2 * Math.PI / 9) - Math.PI / 2) * 120"
                :y2="Math.sin((i * 2 * Math.PI / 9) - Math.PI / 2) * 120"
                stroke="var(--border-subtle)" stroke-width="1" opacity="0.4" />
            </svg>
          </div>
          <div class="wp8-rx-empty-body">
            <p class="calc-eyebrow">Raio-X ainda não gerado</p>
            <h3 class="wp8-rx-empty-h">
              Análise IA das suas <em class="calc-italic">9 dimensões</em>
            </h3>
            <p class="wp8-rx-empty-lead">
              Avalia diversificação, concentração, risco, setores, renda passiva, crescimento, valuation, volatilidade e liquidez. Inclui insights acionáveis sobre o que melhorar.
            </p>
            <div class="wp8-rx-empty-ctas">
              <NuxtLink to="/help?intent=analyze-portfolio" class="wp8-result-btn">
                <UIcon name="i-lucide-sparkles" class="size-4" />
                <span>Gerar Raio-X</span>
                <UIcon name="i-lucide-arrow-right" class="size-4 wp8-result-arrow" />
              </NuxtLink>
              <span class="wp8-rx-empty-hint">Leva ~30 segundos · IA analisa cada posição da carteira</span>
            </div>
          </div>
        </div>

        <div v-else class="wp8-raiox-split">
          <!-- SNOWFLAKE — minimalista (sem dots, sem labels textuais nas pontas) -->
          <div class="wp8-snowflake">
            <svg viewBox="-130 -130 260 260" class="wp8-snowflake-svg">
              <!-- rings (apenas 50% e 100%, sutis) -->
              <circle cx="0" cy="0" r="60" fill="none" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="2 5" opacity="0.6" />
              <circle cx="0" cy="0" r="120" fill="none" stroke="var(--border-subtle)" stroke-width="1" />

              <!-- axes muito sutis -->
              <line v-for="(d, i) in raioXDimensions" :key="`axis-${i}`"
                x1="0" y1="0"
                :x2="Math.cos((i * 2 * Math.PI / raioXDimensions.length) - Math.PI / 2) * 120"
                :y2="Math.sin((i * 2 * Math.PI / raioXDimensions.length) - Math.PI / 2) * 120"
                stroke="var(--border-subtle)" stroke-width="1" opacity="0.4" />

              <!-- snowflake polygon -->
              <polygon :points="snowflakePoints" fill="color-mix(in srgb, var(--brand-primary) 14%, transparent)" stroke="var(--brand-primary)" stroke-width="1.2" />
            </svg>

            <div class="wp8-snowflake-meta">
              <p class="calc-result-eyebrow" style="margin-bottom: 6px;">Score geral</p>
              <p class="wp8-sf-score">{{ Math.round(raioXDimensions.reduce((a, b) => a + b.score, 0) / raioXDimensions.length) }}<span class="wp-kpi-suf">/100</span></p>
              <p class="wp8-sf-status">{{ greenCount }} de 9 dimensões verdes · 0 vermelhas</p>
            </div>
          </div>

          <!-- INSIGHTS editoriais (3 cards) -->
          <div class="wp8-rx-insights">
            <article v-if="bestDimension" class="wp8-ins">
              <p class="wp8-ins-tag pos">Maior força</p>
              <h4 class="wp8-ins-h">{{ bestDimension.name }} <span class="wp8-ins-score pos">{{ bestDimension.score }}</span></h4>
              <p class="wp8-ins-note">{{ bestDimension.summary }}</p>
            </article>

            <article v-if="worstDimension" class="wp8-ins">
              <p class="wp8-ins-tag neutral">Precisa atenção</p>
              <h4 class="wp8-ins-h">{{ worstDimension.name }} <span class="wp8-ins-score neutral">{{ worstDimension.score }}</span></h4>
              <p class="wp8-ins-note">{{ worstDimension.summary }}</p>
            </article>

            <article v-if="opportunityDimension" class="wp8-ins">
              <p class="wp8-ins-tag accent">Oportunidade</p>
              <h4 class="wp8-ins-h">{{ opportunityDimension.name }} <span class="wp8-ins-score accent">{{ opportunityDimension.score }}</span></h4>
              <p class="wp8-ins-note">{{ opportunityDimension.summary }}</p>
            </article>
          </div>
        </div>

        <!-- grid horizontal: as 9 dimensões em cells editoriais. Loading: 9 skels. -->
        <ul v-if="loading" class="wp8-rx-grid">
          <li v-for="n in 9" :key="`skel-rx-${n}`" class="wp8-rx-cell">
            <p class="wp8-rx-cell-score"><span class="wp8-skel wp8-skel-kpi" /></p>
            <p class="wp8-rx-cell-name"><span class="wp8-skel wp8-skel-chip" /></p>
            <span class="wp8-rx-cell-bar"><span class="wp8-rx-cell-fill" style="background: var(--bg-overlay); width: 100%;" /></span>
          </li>
        </ul>
        <ul v-else-if="raioXDimensions.length" class="wp8-rx-grid">
          <li v-for="d in raioXDimensions" :key="d.name" class="wp8-rx-cell">
            <p class="wp8-rx-cell-score"
              :class="d.status === 'good' ? 'pos' : d.status === 'medium' ? 'neutral' : 'neg'">
              {{ d.score }}
            </p>
            <p class="wp8-rx-cell-name">{{ d.name }}</p>
            <span class="wp8-rx-cell-bar">
              <span class="wp8-rx-cell-fill"
                :class="d.status === 'good' ? 'pos' : d.status === 'medium' ? 'neutral' : 'neg'"
                :style="{ width: `${d.score}%` }" />
            </span>
          </li>
        </ul>
      </section>

      <!-- STRESS TEST · 3 CENÁRIOS -->
      <section class="wp8-section">
        <header class="wp8-head">
          <div>
            <p class="calc-eyebrow">Stress test · 3 cenários</p>
            <h2 class="wp8-h2">Como sua carteira sobreviveria a <em class="calc-italic">crises reais.</em></h2>
          </div>
          <p class="wp8-head-meta">Baseado em IBOV, S&P 500, IFIX e IMA-B</p>
        </header>

        <p class="wp8-stress-lead">
          Estimativa do impacto em dois cenários históricos e uma projeção futura, baseados no comportamento real dos índices nesses períodos.
        </p>

        <div class="wp8-stress-grid">
          <article v-for="s in stressScenarios" :key="s.name" class="wp8-stress-cell" :class="`wp8-stress-cell--${s.type}`">
            <p class="wp8-stress-tag" :class="`wp8-stress-tag--${s.type}`">
              {{ s.tag }} <span class="wp8-stress-period">· {{ s.period }}</span>
            </p>

            <h3 class="wp8-stress-name">{{ s.name }}</h3>

            <p class="wp8-stress-impact-val">{{ s.portfolioImpact.toFixed(1).replace('.', ',') }}%</p>

            <p class="wp8-stress-meta">
              IBOV {{ s.ibov.toFixed(1).replace('.', ',') }}% · <span class="wp8-stress-cash">R$ {{ s.moneyLoss.toLocaleString('pt-BR') }}</span> a menos
            </p>

            <p class="wp8-stress-time">
              Choque {{ s.duration }} · Recuperação {{ s.recovery }}
            </p>
          </article>
        </div>
      </section>

      <!-- RENDA 12 MESES + EVENTOS -->
      <section class="wp8-section wp8-renda">
        <header class="wp8-head">
          <div>
            <p class="calc-eyebrow">Renda passiva · 12 meses</p>
            <h2 class="wp8-h2">Projeção <em class="calc-italic">de proventos.</em></h2>
          </div>
          <p class="wp8-head-meta">Baseado nos últimos 12 meses · total {{ formatBRL(dividendForecast12m, { compact: true }) }}</p>
        </header>

        <div class="wp8-renda-grid">
          <!-- BAR CHART 12m -->
          <div class="wp8-bars-wrap">
            <header class="wp8-bars-head">
              <p class="calc-result-eyebrow">Mensal projetado · por classe</p>
              <!-- LEGEND toggleable -->
              <ul class="wp8-legend-toggle">
                <li v-for="c in allClasses" :key="c.key">
                  <button
                    type="button"
                    :class="['wp8-leg-btn', { 'is-off': !visibleClasses.has(c.key) }]"
                    @click="toggleClass(c.key)"
                  >
                    <span class="wp8-leg-swatch" :style="{ background: visibleClasses.has(c.key) ? c.color : 'transparent', borderColor: c.color }" />
                    <span class="wp8-leg-label">{{ c.label }}</span>
                    <span class="wp8-leg-pct">{{ classBreakdown[c.key].pct.toFixed(1) }}%</span>
                  </button>
                </li>
              </ul>
            </header>

            <div class="wp8-bars-svg" @mouseleave="hoveredMonthIdx = null">
              <svg viewBox="0 0 720 200" preserveAspectRatio="none">
                <!-- baseline ticks -->
                <line v-for="y in [50, 100, 150]" :key="y" x1="0" :y1="y" x2="720" :y2="y" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="2 4" />
                <!-- stacked bars + invisible hit area -->
                <g v-for="(m, idx) in dividendMonths" :key="idx" :transform="`translate(${idx * 60 + 22}, 0)`">
                  <g v-for="(seg) in monthStack(idx)" :key="seg.key">
                    <rect
                      :x="seg.x"
                      :y="seg.y"
                      :width="seg.width"
                      :height="seg.height"
                      :fill="seg.color"
                      :class="['wp8-bar-seg', hoveredMonthIdx === idx ? 'is-hovered' : (hoveredMonthIdx !== null ? 'is-dimmed' : '')]"
                    />
                  </g>
                  <!-- hit area que cobre toda altura da coluna -->
                  <rect
                    x="-12"
                    y="0"
                    width="40"
                    height="200"
                    fill="transparent"
                    class="wp8-bar-hit"
                    @mouseenter="hoveredMonthIdx = idx"
                    @click="openMonthDetail(idx)"
                  />
                </g>
              </svg>
              <ul class="wp8-bars-axis">
                <li v-for="(m, idx) in dividendMonths" :key="m.label" :class="hoveredMonthIdx === idx ? 'is-active' : ''">{{ m.label }}</li>
              </ul>

              <!-- Tooltip — mesmo padrão do calendar/heatmap (2 linhas: data·valor + CTA) -->
              <div
                v-if="hoveredMonthIdx !== null"
                class="wp8-bars-tip"
                :style="{ left: `${(hoveredMonthIdx * 60 + 22 + 8) / 720 * 100}%` }"
                role="tooltip"
              >
                {{ dividendMonths[hoveredMonthIdx].label }} · {{ formatBRL(filteredMonths[hoveredMonthIdx].value, { compact: true }) }}<br>Clique para ver detalhes
              </div>
            </div>

            <dl class="wp8-bars-kpis">
              <div>
                <dt>Maior mês</dt>
                <dd>{{ formatBRL(maxMonthInfo.value, { compact: true }) }} <span class="wp8-kpi-cap">{{ maxMonthInfo.label }}</span></dd>
              </div>
              <div>
                <dt>Menor mês</dt>
                <dd>{{ formatBRL(minMonthInfo.value, { compact: true }) }} <span class="wp8-kpi-cap">{{ minMonthInfo.label }}</span></dd>
              </div>
              <div>
                <dt>Média mensal</dt>
                <dd>{{ formatBRL(avgMonth, { compact: true }) }}</dd>
              </div>
              <div>
                <dt>Total 12 meses</dt>
                <dd class="wp8-kpi-pos">{{ formatBRL(totalFiltered, { compact: true }) }}</dd>
              </div>
            </dl>
          </div>

          <!-- EVENTOS próximos -->
          <div class="wp8-events-wrap">
            <p class="calc-result-eyebrow" style="margin-bottom: 16px;">Próximos 60 dias</p>
            <ul v-if="loading" class="wp8-events">
              <li v-for="n in 5" :key="`skel-ev-${n}`">
                <div class="wp8-ev-date">
                  <span class="wp8-ev-day"><span class="wp8-skel wp8-skel-kpi" style="width: 32px;" /></span>
                  <span class="wp8-ev-mo"><span class="wp8-skel wp8-skel-chip" /></span>
                </div>
                <div class="wp8-ev-body">
                  <p class="wp8-ev-tk"><span class="wp8-skel wp8-skel-text-sm" /></p>
                  <p class="wp8-ev-kind"><span class="wp8-skel wp8-skel-chip" /></p>
                </div>
                <p class="wp8-ev-val"><span class="wp8-skel wp8-skel-kpi" style="width: 80px;" /></p>
              </li>
            </ul>
            <ul v-else-if="upcomingDividends.length" class="wp8-events">
              <li v-for="e in upcomingDividends.slice(0, 6)" :key="`${e.ticker}-${e.date}`">
                <div class="wp8-ev-date">
                  <span class="wp8-ev-day">{{ Number(e.date.split('-')[2]) }}</span>
                  <span class="wp8-ev-mo">{{ monthLabel(e.date.split('-')[1]).toLowerCase() }}</span>
                </div>
                <div class="wp8-ev-body">
                  <p class="wp8-ev-tk">{{ e.ticker }}</p>
                  <p class="wp8-ev-kind">{{ e.type }}</p>
                </div>
                <p class="wp8-ev-val positive">+{{ formatBRL(e.amount) }}</p>
              </li>
            </ul>
            <p v-else class="wp8-of-meta" style="margin-top: 8px;">
              Sem dividendos previstos para os próximos 60 dias.
            </p>
          </div>
        </div>
      </section>

    </section>

    <!-- CTA full-bleed: background amarelado + dados do resultado + Ver mais.
         Esconde no empty state — sem positions nao faz sentido mostrar o
         "Resultado +X em 12m". -->
    <section v-if="!loading && positionsReal.length" class="wp8-cta-fullbleed">
      <div class="wp8-cta-atmo wp8-cta-atmo--top" aria-hidden="true" />
      <div class="wp8-cta-atmo wp8-cta-atmo--bottom" aria-hidden="true" />

      <div class="wp8-cta-inner">
        <header class="wp8-cta-head">
          <div>
            <p class="calc-eyebrow">Resultado · 12 meses</p>
            <h2 class="wp8-cta-h">
              Resultado:
              <em class="calc-italic">+{{ formatBRL(swingStats.realizedPnl + dayTradeStats.totalPnl, { compact: true }) }}</em>
              em 12 meses.
            </h2>
          </div>

          <NuxtLink to="/wallet/resultado" class="wp8-cta-primary">
            <span>Ver mais</span>
            <UIcon name="i-lucide-arrow-right" class="size-4 wp8-cta-arrow" />
          </NuxtLink>
        </header>

        <div class="wp8-cta-data">
          <article class="wp8-cta-block">
            <p class="wp8-cta-block-tag">Swing · 12 meses</p>
            <p class="wp8-cta-block-mega pos">+{{ formatBRL(swingStats.realizedPnl, { compact: true }) }}</p>
            <p class="wp8-cta-block-meta">
              <span>{{ swingStats.winRate }}% win</span>
              <span class="sep">·</span>
              <span>PF {{ swingStats.profitFactor.toFixed(1) }}</span>
              <span class="sep">·</span>
              <span>{{ swingStats.totalTrades }} trades</span>
            </p>
          </article>

          <article class="wp8-cta-block">
            <p class="wp8-cta-block-tag">Day trade · 7 dias</p>
            <p class="wp8-cta-block-mega pos">+{{ formatBRL(dayTradeStats.totalPnl, { compact: true }) }}</p>
            <p class="wp8-cta-block-meta">
              <span>{{ dayTradeStats.winRate }}% win</span>
              <span class="sep">·</span>
              <span>PF {{ dayTradeStats.profitFactor.toFixed(1) }}</span>
              <span class="sep">·</span>
              <span>{{ dayTradeStats.count }} trades</span>
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- MODAL · detalhes do mês (proventos por ticker) — mesmo styling do modal do resultado -->
    <Teleport to="body">
      <Transition name="wp8r-modal-fade">
        <div v-if="activeMonthDetail" class="wp8r-modal-overlay" @click="closeMonthDetail">
          <article class="wp8r-modal" @click.stop>
            <header class="wp8r-modal-head">
              <div>
                <p class="calc-eyebrow">Proventos · {{ monthDetailLabelLong }}</p>
                <h3 class="wp8r-modal-h">
                  <span class="pos">+{{ formatBRL(activeMonthDetail.total) }}</span>&nbsp;<em class="calc-italic">no mês.</em>
                </h3>
              </div>
              <button type="button" class="wp8r-modal-close" @click="closeMonthDetail" aria-label="Fechar">
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </header>

            <!-- KPIs do mês -->
            <dl class="wp8r-modal-kpis">
              <div>
                <dt>Pagamentos</dt>
                <dd>{{ activeMonthDetail.entries.length }}</dd>
              </div>
              <div>
                <dt>Tickers</dt>
                <dd>{{ new Set(activeMonthDetail.entries.map(e => e.ticker)).size }}</dd>
              </div>
              <div>
                <dt>Classes</dt>
                <dd>{{ monthDetailGroups.filter(g => !g.isFuture).length }}</dd>
              </div>
            </dl>

            <!-- Lista agrupada por classe — collapsible -->
            <div v-if="monthDetailGroups.length" class="wp8r-modal-body">
              <p class="calc-result-eyebrow" style="margin-bottom: 12px;">Por classe</p>
              <ul class="wp8r-modal-groups">
                <li
                  v-for="g in monthDetailGroups"
                  :key="g.key"
                  class="wp8r-modal-group"
                  :class="{ 'is-open': expandedClasses.has(g.key), 'is-future': g.isFuture }"
                >
                  <button
                    type="button"
                    class="wp8r-modal-group-head"
                    @click="toggleClassExpand(g.key)"
                    :aria-expanded="expandedClasses.has(g.key)"
                  >
                    <span class="wp8r-modal-group-dot" :style="{ background: g.color }" />
                    <span class="wp8r-modal-group-title">
                      <span class="wp8r-modal-group-name">{{ g.label }}</span>
                      <span class="wp8r-modal-group-count">
                        {{ g.entries.length }} {{ g.entries.length === 1 ? 'pagamento' : 'pagamentos' }}
                        <span v-if="g.isFuture"> · projeção</span>
                      </span>
                    </span>
                    <span class="wp8r-modal-group-total" :class="g.isFuture ? 'projected' : 'pos'">
                      <span v-if="g.isFuture" class="approx-sym">~</span>{{ formatBRL(g.total) }}
                    </span>
                    <UIcon
                      name="i-lucide-chevron-down"
                      class="size-4 wp8r-modal-group-chev"
                    />
                  </button>
                  <ul v-show="expandedClasses.has(g.key)" class="wp8r-modal-trades">
                    <li v-for="e in g.entries" :key="`${g.key}-${e.ticker}-${e.amount}`" class="wp8r-modal-trade">
                      <span class="wp8r-modal-trade-dot" :class="g.isFuture ? 'projected' : 'pos'" :style="{ background: g.color }" />
                      <div class="wp8r-modal-trade-body">
                        <p class="wp8r-modal-trade-tk">{{ e.ticker }}</p>
                        <p class="wp8r-modal-trade-meta">
                          {{ e.type }}<span v-if="g.isFuture"> · estimativa</span>
                        </p>
                      </div>
                      <p class="wp8r-modal-trade-pnl" :class="g.isFuture ? 'projected' : 'pos'">
                        <span v-if="g.isFuture" class="approx-sym">~</span>{{ formatBRL(e.amount) }}
                      </p>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>

            <!-- Empty -->
            <div v-else class="wp8r-modal-empty">
              <UIcon name="i-lucide-inbox" class="size-6 wp8r-modal-empty-icon" />
              <p class="wp8r-modal-empty-h">Nenhum provento projetado neste mês</p>
              <p class="wp8r-modal-empty-sub">
                A projeção é baseada nos pagamentos dos últimos 12 meses. Meses com baixa cobertura aparecem zerados.
              </p>
            </div>

            <footer class="wp8r-modal-foot">
              <button type="button" class="wp8-head-link wp8-head-link--ghost" @click="closeMonthDetail">
                Fechar
              </button>
            </footer>
          </article>
        </div>
      </Transition>
    </Teleport>

    <!-- Raio-X Highlights: cinematic story mode (Spotify-Wrapped style) -->
    <RaioXHighlights
      :open="highlightsOpen"
      :analysis="analysis"
      :report="report"
      :positions="positionsReal"
      :total-value="totalEquity"
      :user-name="userFirstName"
      :equity-curve="equityCurveForHighlights"
      @close="highlightsOpen = false"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { UnifiedPosition } from '~/services/portfolio'
import type { PortfolioAnalysis, WalletGoal } from '~/services/walletData'
import type { PluggyConnection, PluggyAccount, AccountTotals } from '~/services/pluggy'
import type { EquityCurvePoint, IncomeMonthBucket, IncomeEntry } from '~/services/portfolioTrades'
import { analyzePortfolio, type PortfolioReport } from '~/composables/usePortfolioScore'
import RaioXHighlights from '~/components/molecules/wallet/raio-x-highlights/RaioXHighlights.vue'

// Shape do template — adaptamos UnifiedPosition (real, do backend) pra este
// formato menos cru pra simplificar bindings nos cards/grids.
type WalletPosition = {
  ticker: string
  name: string
  type: 'STOCK' | 'REIT' | 'ETF' | 'BDR' | 'CRYPTO' | 'TREASURY' | 'FIXED'
  sector: string
  qty: number
  avgPrice: number
  currentPrice: number
  value: number          // qty * currentPrice
  weight: number         // % da carteira
  pnl: number            // value - (qty * avgPrice)
  pnlPct: number
  dividendYield: number
  sparkline: number[]
}

type WalletDividendEvent = {
  date: string
  ticker: string
  type: 'dividendo' | 'jcp' | 'rendimento'
  amount: number
  status: 'previsto' | 'recebido'
}

const wallet = useWalletDataService()
const pluggy = usePluggyService()
const tradesService = usePortfolioTradesService()
const assets = useAssetsService()

// =================== STATE ===================
const loading = ref(true)
const positionsReal = ref<UnifiedPosition[]>([])
const goals = ref<WalletGoal[]>([])
const analysis = ref<PortfolioAnalysis | null>(null)
const connections = ref<PluggyConnection[]>([])
const bankAccountsReal = ref<PluggyAccount[]>([])
const accountTotals = ref<AccountTotals | null>(null)
const equityCurveReal = ref<number[]>([])
const equityCurveDates = ref<string[]>([])
const dividendEvents = ref<WalletDividendEvent[]>([])
const incomeMonthsReal = ref<IncomeMonthBucket[]>([])

// =================== FORMATTERS (inline, mesmo shape do mock) ===================
function formatBRL(value: number, opts?: { compact?: boolean }) {
  if (!Number.isFinite(value)) return 'R$ 0'
  if (opts?.compact) {
    const abs = Math.abs(value)
    const sign = value < 0 ? '-' : ''
    if (abs >= 1e6) return `${sign}R$ ${(abs / 1e6).toFixed(1)}M`
    if (abs >= 1e3) return `${sign}R$ ${(abs / 1e3).toFixed(1)}k`
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
function formatPct(value: number, withSign = true) {
  if (!Number.isFinite(value)) return '0%'
  const sign = value >= 0 && withSign ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

// =================== MAP REAL DATA -> TEMPLATE SHAPE ===================
// O template usa um shape `WalletPosition` (ticker/name/type/sector/qty/
// avgPrice/currentPrice/value/weight/pnl/pnlPct/dividendYield/sparkline).
// Mapeamos UnifiedPosition (real) -> WalletPosition (template). Sparkline
// nao vem do backend ainda, deixamos um array fake-flat pra nao quebrar
// o SVG (todos iguais = linha reta).
// TODO: backend nao expoe sparkline 7d por ativo nem dividend_yield ainda.
const positions = computed<WalletPosition[]>(() => {
  const total = positionsReal.value.reduce((sum, p) => {
    const v = p.current_value ?? p.quantity * (p.current_price ?? p.average_price)
    return sum + v
  }, 0)
  return positionsReal.value.map((p) => {
    const currentPrice = p.current_price ?? p.average_price
    const value = p.current_value ?? p.quantity * currentPrice
    const cost = p.quantity * p.average_price
    const pnl = value - cost
    const pnlPct = cost ? (pnl / cost) * 100 : 0
    const weight = total ? (value / total) * 100 : 0
    // Map UnifiedAssetClass -> tipo do template. TREASURY vira Tesouro/Renda Fixa.
    const type: WalletPosition['type'] = (() => {
      switch (p.asset_class) {
        case 'STOCK': return 'STOCK'
        case 'REIT': return 'REIT'
        case 'ETF': return 'ETF'
        case 'BDR': return 'BDR'
        case 'CRYPTO': return 'CRYPTO'
        case 'TREASURY': return 'TREASURY'
        default: return 'STOCK'
      }
    })()
    return {
      ticker: p.ticker,
      name: p.name ?? p.ticker,
      type,
      sector: p.sector ?? '—',
      qty: p.quantity,
      avgPrice: p.average_price,
      currentPrice,
      value,
      weight,
      pnl,
      pnlPct,
      dividendYield: 0, // TODO: backend nao expoe DY 12m por posicao ainda
      sparkline: [1, 1, 1, 1, 1, 1, 1], // TODO: backend nao expoe sparkline 7d ainda
    }
  })
})

// totalEquity ← derivado de positions reais
const totalEquity = computed(() =>
  positions.value.reduce((sum, p) => sum + p.value, 0),
)
const totalCost = computed(() =>
  positions.value.reduce((sum, p) => sum + p.qty * p.avgPrice, 0),
)
const totalPnl = computed(() => totalEquity.value - totalCost.value)
const totalPnlPct = computed(() => (totalCost.value ? (totalPnl.value / totalCost.value) * 100 : 0))

// portfolioScore ← do analysis (fallback 0). Mesma logica da /wallet real.
const portfolioScore = computed(() => analysis.value?.score ?? 0)

// allocationByType ← derivada de positions agrupando por type
const allocationByType = computed(() => {
  if (!totalEquity.value) return []
  const groups: Record<string, number> = {}
  for (const p of positions.value) {
    groups[p.type] = (groups[p.type] || 0) + p.value
  }
  return Object.entries(groups)
    .map(([type, value]) => ({
      label: type,
      value,
      pct: (value / totalEquity.value) * 100,
    }))
    .sort((a, b) => b.value - a.value)
})

// bankAccounts ← adapta PluggyAccount pro shape do template
// (id/bank/type/balance/lastSync). Cartoes de credito (negative balance)
// ficam de fora pra nao confundir o user no preview.
const bankAccounts = computed(() => {
  return bankAccountsReal.value
    .filter((a) => a.type !== 'CREDIT')
    .map((a) => ({
      id: String(a.id),
      bank: a.institution?.name ?? a.name,
      type: a.type === 'INVESTMENT' ? 'Investim.' : 'Corrente',
      balance: a.balance,
      lastSync: formatSyncRelative(a.last_synced_at),
    }))
})

function formatSyncRelative(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000)
  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h`
  const diffD = Math.floor(diffH / 24)
  return `${diffD}d`
}

// openFinanceStatus ← derivado de connections.length + last sync mais recente
const openFinanceStatus = computed(() => {
  const lastSyncIso = connections.value
    .map((c) => c.last_synced_at)
    .filter((x): x is string => !!x)
    .sort()
    .pop() ?? null
  return {
    connected: connections.value.length > 0,
    bankCount: connections.value.length,
    lastSync: formatSyncRelative(lastSyncIso),
    pendingItems: 0,
  }
})

// raioXDimensions ← do analysis.dimensions, mapeado pro shape do template.
// Status derivado do score (>=80 = good, 60-79 = medium, <60 = bad).
// TODO: backend nao expoe `status` explicito na dimension — derivamos.
const raioXDimensions = computed(() => {
  const dims = analysis.value?.dimensions ?? []
  if (!dims.length) return []
  return dims.map((d) => ({
    name: d.label,
    score: d.value,
    status: d.value >= 80 ? 'good' : d.value >= 60 ? 'medium' : 'bad',
    summary: d.note,
  }))
})

// equityCurve ← do tradesService.getEquityCurve(), pego os ultimos 90 pontos
// pra bater com o shape do mock (array de numbers). Vazio enquanto carrega.
const equityCurve = computed(() => equityCurveReal.value)

// upcomingDividends ← shape WalletDividendEvent ja gerado no loadDividends
const upcomingDividends = computed(() => dividendEvents.value)

// swingStats / dayTradeStats ← placeholder com zeros por enquanto.
// TODO: integrar com trades service (period 12m / 7d) no card CTA.
const swingStats = computed(() => ({
  realizedPnl: 0,
  unrealizedPnl: totalPnl.value,
  income12m: 0,
  winRate: 0,
  profitFactor: 0,
  avgWin: 0,
  avgLoss: 0,
  bestTrade: 0,
  worstTrade: 0,
  totalTrades: 0,
}))
const dayTradeStats = computed(() => ({
  count: 0,
  winRate: 0,
  profitFactor: 0,
  totalPnl: 0,
  avgWin: 0,
  avgLoss: 0,
  bestTrade: 0,
  worstTrade: 0,
}))

// dividendForecast12m — sem endpoint dedicado ainda. Derivamos como
// sum(amount) dos upcomingDividends * 12 / 2 (aproximacao linear sobre
// janela de 60d ~ 2 meses). TODO: backend deveria expor projecao 12m.
const dividendForecast12m = computed(() => {
  const sum60d = dividendEvents.value.reduce((acc, e) => acc + e.amount, 0)
  return sum60d * 6 // 60d -> 12m (linear extrapolation)
})

// =================== LOADERS ===================
async function loadAll() {
  // Guard: preview pode rodar sem auth — se nao tem token, pula
  // todas as queries (authFetch redirecionaria pra `/` em 401).
  // Resultado: skeleton breve -> empty state com CTA pra /integracoes.
  const authStore = useAuthStore()
  if (!authStore.token) return

  // Dispara em paralelo, cada query tem proprio .catch defensivo —
  // se uma falha, as outras seguem firme.
  await Promise.all([
    wallet.getPositions().then((v) => { positionsReal.value = v }).catch(() => {}),
    wallet.getGoals().then((v) => { goals.value = v }).catch(() => {}),
    wallet.getPortfolioAnalysis().then((v) => { analysis.value = v }).catch(() => { analysis.value = null }),
    pluggy.listConnections().then((v) => { connections.value = v }).catch(() => { connections.value = [] }),
  ])

  // Disparos secundarios nao-bloqueantes — equity curve, banks, dividends
  // dependem de positions ja estarem carregadas (dividendos so faz sentido
  // se tem ativos).
  void loadEquityCurve()
  void loadBankAccounts()
  void loadDividends()
  void loadIncome()
}

async function loadEquityCurve() {
  try {
    const resp = await tradesService.getEquityCurve()
    const points = resp.data ?? []
    // Patrimonio REAL = position_value (qty * price corrente). Backend pode
    // ainda nao ter o campo (deploy pendente) — fallback pra `equity` que
    // pelo menos nao quebra o chart.
    equityCurveReal.value = points.map((p: EquityCurvePoint) =>
      typeof p.position_value === 'number' ? p.position_value : p.equity,
    )
    equityCurveDates.value = points.map((p: EquityCurvePoint) => p.date)
  } catch {
    equityCurveReal.value = []
    equityCurveDates.value = []
  }
}

async function loadBankAccounts() {
  try {
    const resp = await pluggy.listAccounts()
    bankAccountsReal.value = resp.data
    accountTotals.value = resp.totals
  } catch {
    bankAccountsReal.value = []
    accountTotals.value = null
  }
}

async function loadDividends() {
  if (!positionsReal.value.length) {
    dividendEvents.value = []
    return
  }
  try {
    const groups = await assets.getUpcomingDividends(60, 300)
    if (!Array.isArray(groups)) {
      dividendEvents.value = []
      return
    }
    const userTickers = new Set(positionsReal.value.map((p) => p.ticker.toUpperCase()))
    const events: WalletDividendEvent[] = []
    interface DivItem { ticker?: string; rate?: string | number; label?: string }
    for (const group of groups as Array<{ date: string; items: DivItem[] }>) {
      const items: DivItem[] = Array.isArray(group?.items) ? group.items : []
      for (const it of items) {
        const ticker = (it.ticker || '').toUpperCase()
        if (!userTickers.has(ticker)) continue
        const pos = positionsReal.value.find((p) => p.ticker.toUpperCase() === ticker)
        const qty = pos?.quantity || 0
        const rate = Number(it.rate) || 0
        const kindLabel = (it.label || '').toUpperCase()
        const type: WalletDividendEvent['type'] = kindLabel.includes('JCP') || kindLabel.includes('JUROS')
          ? 'jcp'
          : kindLabel.includes('REND') || kindLabel.includes('AMORT')
            ? 'rendimento'
            : 'dividendo'
        events.push({
          date: group.date,
          ticker,
          type,
          amount: rate * qty,
          status: 'previsto',
        })
      }
    }
    events.sort((a, b) => a.date.localeCompare(b.date))
    dividendEvents.value = events.slice(0, 12)
  } catch {
    dividendEvents.value = []
  }
}

/**
 * Carrega proventos realizados (dividendos/JCP/income) dos últimos 12 meses
 * agrupados por mês. Alimenta o bar chart de renda passiva + modal de detalhes.
 */
async function loadIncome() {
  try {
    const resp = await tradesService.listIncome()
    incomeMonthsReal.value = resp.months ?? []
  } catch {
    incomeMonthsReal.value = []
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await loadAll()
  } finally {
    loading.value = false
  }

  // ESC fecha o modal de detalhes do mês
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && activeMonthDetail.value) closeMonthDetail()
  }
  window.addEventListener('keydown', escHandler)
  onUnmounted(() => window.removeEventListener('keydown', escHandler))
})

// =================== STATIC PRESENTATION HELPERS ===================
// `today` / `lastUpdated` permanecem hardcoded — sao apenas labels
// editoriais do shell. (Poderiamos derivar de Date.now() mas o V8 usa
// como "ultimo update do sistema" mesmo.)
const today = computed(() => new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }))
const lastUpdated = computed(() => {
  const now = new Date()
  const date = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${date} · ${time}`
})

// =================== CHART: Patrimonio (90 dias) ===================
// Recorta a equity curve pros ultimos 90 dias calendario. Sem isso, o
// baseline pegaria o primeiro trade da vida e produziria range absurdo.
const CHART_W = 800
const CHART_H = 280
const CHART_WINDOW_DAYS = 90

const equityCurveSlice = computed(() => {
  const vals = equityCurveReal.value
  const dates = equityCurveDates.value
  if (!vals.length || vals.length !== dates.length) return { vals: [] as number[], dates: [] as string[] }
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - CHART_WINDOW_DAYS)
  const cutoffISO = cutoff.toISOString().slice(0, 10)
  let startIdx = dates.findIndex((d) => d >= cutoffISO)
  if (startIdx < 0) startIdx = 0
  return { vals: vals.slice(startIdx), dates: dates.slice(startIdx) }
})

// Projeta a curva no SVG. Y-axis usa min/max do proprio patrimonio
// (sem normalizar por %), com 8% padding pra dar respiro vertical.
const patrimonioChart = computed(() => {
  const eqVals = equityCurveSlice.value.vals
  const eqDates = equityCurveSlice.value.dates
  if (!eqVals.length) return { points: [], n: 0, deltaPct: 0, first: 0, last: 0 }
  const min = Math.min(...eqVals)
  const max = Math.max(...eqVals)
  const range = max - min || 1
  const pad = range * 0.08
  const yMin = min - pad
  const yRange = range + pad * 2
  const n = eqVals.length
  const points = eqVals.map((v, i) => ({
    x: (i / Math.max(1, n - 1)) * CHART_W,
    y: CHART_H - ((v - yMin) / yRange) * CHART_H,
    value: v,
    date: eqDates[i],
  }))
  const first = eqVals[0]
  const last = eqVals[n - 1]
  const deltaPct = first > 0 ? ((last - first) / first) * 100 : 0
  return { points, n, deltaPct, first, last }
})

const patrimonioPath = computed(() =>
  patrimonioChart.value.points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
)

// Tooltip
const hoverIdx = ref<number | null>(null)
const chartSvgRef = ref<SVGSVGElement | null>(null)

function onChartMouseMove(e: MouseEvent) {
  const svg = chartSvgRef.value
  if (!svg) return
  const rect = svg.getBoundingClientRect()
  const n = patrimonioChart.value.n
  if (!n) return
  const xRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  hoverIdx.value = Math.round(xRatio * (n - 1))
}
function onChartMouseLeave() {
  hoverIdx.value = null
}
const hoverPoint = computed(() =>
  hoverIdx.value === null ? null : patrimonioChart.value.points[hoverIdx.value] ?? null,
)

function formatChartDate(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`
}

// KPIs derivados da janela 90d
const patrimonioKpis = computed(() => {
  const eq = equityCurveSlice.value.vals
  if (eq.length < 2) return { high: 0, low: 0, vol: 0, deltaPct: 0 }
  const high = Math.max(...eq)
  const low = Math.min(...eq)
  const rets: number[] = []
  for (let i = 1; i < eq.length; i++) {
    const prev = eq[i - 1]
    if (prev <= 0) continue
    rets.push(((eq[i] - prev) / prev) * 100)
  }
  const mean = rets.length ? rets.reduce((a, r) => a + r, 0) / rets.length : 0
  const variance = rets.length ? rets.reduce((a, r) => a + (r - mean) ** 2, 0) / rets.length : 0
  const vol = Math.sqrt(variance)
  return { high, low, vol, deltaPct: patrimonioChart.value.deltaPct }
})

// 12 meses renda passiva — REAL (passados + atual) + PROJEÇÃO (atual + futuros)
type ClassKey = 'FIIs' | 'Acoes' | 'ETF' | 'Outros'
type ClassBuckets = Record<ClassKey, number>

const allClasses: { key: ClassKey; label: string; color: string }[] = [
  { key: 'FIIs',   label: 'FIIs',     color: 'var(--brand-positive)' },
  { key: 'Acoes',  label: 'Ações',    color: 'var(--brand-primary)' },
  { key: 'ETF',    label: 'ETF intl.', color: '#3b82f6' },
  { key: 'Outros', label: 'Outros',   color: 'var(--text-muted)' },
]

// Cor cinza usada pra "projeção" (o que ainda nao foi recebido).
// Visualmente diferencia realizado x projetado em meses correntes/futuros.
const PROJECTED_COLOR = 'color-mix(in srgb, var(--text-muted) 35%, transparent)'

// Mapeia asset_class do backend pro bucket do bar chart.
// REIT -> FIIs, STOCK -> Acoes, ETF -> ETF, resto (BDR/TREASURY/CRYPTO/null) -> Outros.
function assetClassToKey(asset_class?: string | null): ClassKey {
  switch ((asset_class || '').toUpperCase()) {
    case 'REIT': return 'FIIs'
    case 'STOCK': return 'Acoes'
    case 'ETF': return 'ETF'
    default: return 'Outros'
  }
}

// Mapeia o `type` do WalletDividendEvent (upcoming) pra classe — como o
// dividendEvents nao traz asset_class, derivamos da posicao em positionsReal.
function classKeyForTicker(ticker: string): ClassKey {
  const pos = positionsReal.value.find((p) => p.ticker.toUpperCase() === ticker.toUpperCase())
  return assetClassToKey(pos?.asset_class)
}

const MONTH_LABELS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

interface DividendMonth {
  label: string
  monthKey: string // YYYY-MM
  byClass: ClassBuckets       // realized (de incomeMonthsReal)
  byClassProjected: ClassBuckets // upcoming (de dividendEvents)
  isFuture: boolean
  isCurrent: boolean
  isPast: boolean
}

function emptyBuckets(): ClassBuckets {
  return { FIIs: 0, Acoes: 0, ETF: 0, Outros: 0 }
}

// Janela rolling de 12 meses (11 passados + atual). Junta o que ja foi pago
// (`incomeMonthsReal`) com a projecao (`dividendEvents`) por classe.
const dividendMonths = computed<DividendMonth[]>(() => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-indexed
  const currentKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`

  // Indexa real e projecao por YYYY-MM pra match rapido.
  const realByMonth = new Map<string, IncomeMonthBucket>()
  for (const b of incomeMonthsReal.value) realByMonth.set(b.month, b)

  const projectedByMonth = new Map<string, ClassBuckets>()
  for (const ev of dividendEvents.value) {
    const key = ev.date.slice(0, 7) // YYYY-MM
    if (!projectedByMonth.has(key)) projectedByMonth.set(key, emptyBuckets())
    const buckets = projectedByMonth.get(key)!
    const cls = classKeyForTicker(ev.ticker)
    buckets[cls] += ev.amount
  }

  const result: DividendMonth[] = []
  // Vai de -11 ate 0 → 12 meses, terminando no mes atual.
  for (let offset = -11; offset <= 0; offset++) {
    const d = new Date(currentYear, currentMonth + offset, 1)
    const y = d.getFullYear()
    const m = d.getMonth()
    const key = `${y}-${String(m + 1).padStart(2, '0')}`
    const label = MONTH_LABELS_PT[m]!

    // Realized: soma de entries por classe.
    const byClass = emptyBuckets()
    const bucket = realByMonth.get(key)
    if (bucket) {
      for (const e of bucket.entries) {
        byClass[assetClassToKey(e.asset_class)] += e.amount
      }
    }

    // Projected: dos upcoming dividends que caem neste mes.
    const byClassProjected = projectedByMonth.get(key) ?? emptyBuckets()

    result.push({
      label,
      monthKey: key,
      byClass,
      byClassProjected,
      isFuture: key > currentKey,
      isCurrent: key === currentKey,
      isPast: key < currentKey,
    })
  }
  return result
})

const visibleClasses = ref<Set<ClassKey>>(new Set(['FIIs', 'Acoes', 'ETF', 'Outros']))
const hoveredMonthIdx = ref<number | null>(null)

/* ===== MODAL: detalhes do mês (proventos por ticker) ===== */
type MonthDividendEntry = { ticker: string; type: 'dividendo' | 'jcp' | 'rendimento'; amount: number; classKey: ClassKey; isProjected: boolean }
const activeMonthDetail = ref<{ idx: number; label: string; entries: MonthDividendEntry[]; total: number } | null>(null)

// Mapeia IncomeSide -> rotulo PT-BR ('dividendo' | 'jcp' | 'rendimento').
function sideToType(side: IncomeEntry['side']): MonthDividendEntry['type'] {
  if (side === 'JCP') return 'jcp'
  if (side === 'INCOME') return 'rendimento'
  return 'dividendo'
}

function openMonthDetail(idx: number) {
  const m = dividendMonths.value[idx]
  if (!m) return

  // Realized entries: vem de incomeMonthsReal.entries (paginado por mes).
  const bucket = incomeMonthsReal.value.find((b) => b.month === m.monthKey)
  const realizedEntries: MonthDividendEntry[] = (bucket?.entries ?? []).map((e) => ({
    ticker: e.ticker,
    type: sideToType(e.side),
    amount: e.amount,
    classKey: assetClassToKey(e.asset_class),
    isProjected: false,
  }))

  // Para meses futuros (ou correntes com projecao remanescente), juntamos
  // os dividendEvents que caem neste mes.
  const projectedEntries: MonthDividendEntry[] = []
  if (!m.isPast) {
    for (const ev of dividendEvents.value) {
      if (ev.date.slice(0, 7) !== m.monthKey) continue
      projectedEntries.push({
        ticker: ev.ticker,
        type: ev.type as MonthDividendEntry['type'],
        amount: ev.amount,
        classKey: classKeyForTicker(ev.ticker),
        isProjected: true,
      })
    }
  }

  // Se for mes passado puro, usamos so realized.
  // Se for futuro sem realized, usamos so projected.
  // Mes corrente: junta ambos (realized + projected pra fechar o mes).
  const entries = m.isFuture && realizedEntries.length === 0
    ? projectedEntries
    : m.isPast
      ? realizedEntries
      : [...realizedEntries, ...projectedEntries]

  const total = entries
    .filter((e) => visibleClasses.value.has(e.classKey))
    .reduce((a, e) => a + e.amount, 0)

  activeMonthDetail.value = { idx, label: m.label, entries, total }
  hoveredMonthIdx.value = null
  if (typeof document !== 'undefined') document.body.style.overflow = 'hidden'
}

function closeMonthDetail() {
  activeMonthDetail.value = null
  if (typeof document !== 'undefined') document.body.style.overflow = ''
}

type ModalGroup = {
  key: string
  label: string
  color: string
  entries: MonthDividendEntry[]
  total: number
  isFuture: boolean
}

const monthDetailGroups = computed<ModalGroup[]>(() => {
  if (!activeMonthDetail.value) return []
  const all = activeMonthDetail.value.entries
  const realized = all.filter(e => !e.isProjected)
  const projected = all.filter(e => e.isProjected)

  // Realized: agrupado por classe (FIIs, Acoes, etc), ordenado por valor.
  const realizedGroups: ModalGroup[] = allClasses.map(c => {
    const entries = realized
      .filter(e => e.classKey === c.key)
      .sort((a, b) => b.amount - a.amount)
    const total = entries.reduce((a, e) => a + e.amount, 0)
    return { key: c.key, label: c.label, color: c.color, entries, total, isFuture: false }
  }).filter(g => g.entries.length > 0)
  // entre as classes realized: ordena por total DESC
  realizedGroups.sort((a, b) => b.total - a.total)

  // Futuro: TODOS os projetados (de qualquer classe) num grupo unico,
  // entries ordenados por valor DESC. Vai sempre no fim.
  const futureGroup: ModalGroup | null = projected.length > 0
    ? {
        key: '__future__',
        label: 'Futuro',
        color: PROJECTED_COLOR,
        entries: [...projected].sort((a, b) => b.amount - a.amount),
        total: projected.reduce((a, e) => a + e.amount, 0),
        isFuture: true,
      }
    : null

  return futureGroup ? [...realizedGroups, futureGroup] : realizedGroups
})

// Estado de expand/collapse por grupo no modal (classe ou '__future__').
// Default: todas fechadas. Reseta toda vez que abre um novo mes.
const expandedClasses = ref<Set<string>>(new Set())
watch(activeMonthDetail, (m) => {
  if (m) {
    expandedClasses.value = new Set()
  }
})
function toggleClassExpand(key: string) {
  const next = new Set(expandedClasses.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedClasses.value = next
}

function classColor(key: ClassKey) {
  return allClasses.find(c => c.key === key)?.color ?? 'var(--text-muted)'
}
function classLabelOf(key: ClassKey) {
  return allClasses.find(c => c.key === key)?.label ?? key
}

const monthDetailLabelLong = computed(() => {
  if (!activeMonthDetail.value) return ''
  const long: Record<string, string> = {
    Jan: 'Janeiro', Fev: 'Fevereiro', Mar: 'Março', Abr: 'Abril',
    Mai: 'Maio', Jun: 'Junho', Jul: 'Julho', Ago: 'Agosto',
    Set: 'Setembro', Out: 'Outubro', Nov: 'Novembro', Dez: 'Dezembro',
  }
  return long[activeMonthDetail.value.label] ?? activeMonthDetail.value.label
})

function toggleClass(key: ClassKey) {
  const next = new Set(visibleClasses.value)
  if (next.has(key)) {
    if (next.size > 1) next.delete(key) // mantém pelo menos uma visível
  } else {
    next.add(key)
  }
  visibleClasses.value = next
}

/* ============ POSITIONS: grouped + collapsible ============ */
const positionTypeMeta: Record<string, { label: string; color: string; order: number }> = {
  STOCK:    { label: 'Ações',      color: 'var(--brand-primary)',  order: 1 },
  REIT:     { label: 'FIIs',       color: 'var(--brand-positive)', order: 2 },
  TREASURY: { label: 'Tesouro',    color: '#8b5cf6',               order: 3 },
  ETF:      { label: 'ETFs',       color: '#3b82f6',               order: 4 },
  BDR:      { label: 'BDRs',       color: '#a78bfa',               order: 5 },
  CRYPTO:   { label: 'Cripto',     color: '#f59e0b',               order: 6 },
  FIXED:    { label: 'Renda Fixa', color: '#8b5cf6',               order: 7 },
}

const positionGroups = computed(() => {
  const groups: Record<string, WalletPosition[]> = {}
  for (const p of positions.value) {
    if (!groups[p.type]) groups[p.type] = []
    groups[p.type]!.push(p)
  }
  return Object.entries(groups).map(([type, items]) => {
    const meta = positionTypeMeta[type] ?? { label: type, color: 'var(--text-muted)', order: 99 }
    const totalValue = items.reduce((a, p) => a + p.value, 0)
    const totalCost = items.reduce((a, p) => a + (p.avgPrice * p.qty), 0)
    const totalPnl = totalValue - totalCost
    const totalPnlPct = totalCost ? (totalPnl / totalCost) * 100 : 0
    const totalWeight = items.reduce((a, p) => a + p.weight, 0)
    return {
      type,
      label: meta.label,
      color: meta.color,
      order: meta.order,
      positions: [...items].sort((a, b) => b.weight - a.weight),
      totalValue,
      totalPnl,
      totalPnlPct,
      totalWeight,
    }
  }).sort((a, b) => a.order - b.order)
})

const expandedGroups = ref<Set<string>>(new Set(['STOCK', 'REIT']))

function toggleGroup(type: string) {
  const next = new Set(expandedGroups.value)
  if (next.has(type)) next.delete(type)
  else next.add(type)
  expandedGroups.value = next
}

const allGroupsOpen = computed(() => positionGroups.value.every(g => expandedGroups.value.has(g.type)))

function toggleAllGroups() {
  if (allGroupsOpen.value) {
    expandedGroups.value = new Set()
  } else {
    expandedGroups.value = new Set(positionGroups.value.map(g => g.type))
  }
}

const dotColor = (label: string) => {
  const map: Record<string, string> = {
    STOCK: 'var(--brand-primary)',
    REIT: 'var(--brand-positive)',
    ETF: '#3b82f6',
    BDR: '#a78bfa',
    CRYPTO: '#f59e0b',
    FIXED: '#8b5cf6',
  }
  return map[label] || 'var(--brand-primary)'
}

// donut segments
const donutSegments = computed(() => {
  const C = 502.6
  let offset = 0
  return allocationByType.value.map(a => {
    const length = (a.pct / 100) * C
    const seg = { color: dotColor(a.label), length, offset }
    offset -= length
    return seg
  })
})

// Total por mes considerando classes visiveis = realized + projected.
// Pra mes passado: projected costuma ser 0 (dividendEvents so cobre 60d futuros).
// Pra mes corrente: realized = ate hoje, projected = upcoming ate fim do mes.
// Pra mes futuro: realized = 0, projected = upcoming.
const filteredMonths = computed(() =>
  dividendMonths.value.map((m) => {
    let total = 0
    for (const c of allClasses) {
      if (!visibleClasses.value.has(c.key)) continue
      total += m.byClass[c.key] + m.byClassProjected[c.key]
    }
    return { label: m.label, value: total }
  }),
)

const maxMonthValue = computed(() => Math.max(...filteredMonths.value.map((m) => m.value), 1))

// breakdown total por classe (sempre todas, para mostrar % no toggle).
// Considera realized + projected — porcentagens batem com o que aparece no bar.
const classBreakdown = computed(() => {
  const totalAll = dividendMonths.value.reduce((sum, m) => {
    return sum + allClasses.reduce((a, c) => a + m.byClass[c.key] + m.byClassProjected[c.key], 0)
  }, 0)
  const result: Record<ClassKey, { value: number; pct: number }> = {} as any
  for (const c of allClasses) {
    const val = dividendMonths.value.reduce(
      (a, m) => a + m.byClass[c.key] + m.byClassProjected[c.key],
      0,
    )
    result[c.key] = { value: val, pct: totalAll ? (val / totalAll) * 100 : 0 }
  }
  return result
})

// helper para o SVG: gera os segments stacked de um mês (de baixo pra cima).
// Cada classe visivel gera 1-2 segmentos:
//  - "realized" (cor da classe) → o que ja foi pago
//  - "projected" (cinza) → o que ainda falta receber (so se positivo)
//
// Estados visuais:
//  - mes PASSADO: 100% colored (so realized, sem gray)
//  - mes FUTURO: 100% gray (sem realized, tudo projected)
//  - mes CORRENTE: parcial colored (realized) + topo gray (projected)
// Stack agora separa em 2 passes:
//   Pass 1: TODOS os realized, empilhados de baixo (colored, full width 16px)
//   Pass 2: TODOS os projected, empilhados em cima (gray, 12px wide com 2px de
//   padding em cada lado pra mostrar uma "moldura" leve)
function monthStack(idx: number) {
  const m = dividendMonths.value[idx]
  if (!m) return []
  const max = maxMonthValue.value
  const stack: { key: string; x: number; y: number; width: number; height: number; color: string }[] = []
  let cumulative = 0

  // Pass 1: realized colored stacking (bottom-up, 12px wide com 2px inset)
  for (const c of allClasses) {
    if (!visibleClasses.value.has(c.key)) continue
    const realized = m.byClass[c.key]
    if (realized <= 0) continue
    const h = (realized / max) * 180
    const y = 200 - ((cumulative + realized) / max) * 180
    stack.push({ key: `${c.key}-r`, x: 2, y, width: 12, height: h, color: c.color })
    cumulative += realized
  }

  // Pass 2: projected gray stacking on top (20px wide centrado, "moldura" 4px cada lado)
  for (const c of allClasses) {
    if (!visibleClasses.value.has(c.key)) continue
    const projected = m.byClassProjected[c.key]
    if (projected <= 0) continue
    const h = (projected / max) * 180
    const y = 200 - ((cumulative + projected) / max) * 180
    stack.push({ key: `${c.key}-p`, x: -2, y, width: 20, height: h, color: PROJECTED_COLOR })
    cumulative += projected
  }

  return stack
}

// KPIs derivados — usam realized + projected (filteredMonths ja inclui ambos).
const maxMonthInfo = computed(() => [...filteredMonths.value].sort((a, b) => b.value - a.value)[0])
const minMonthInfo = computed(() => [...filteredMonths.value].sort((a, b) => a.value - b.value)[0])
const avgMonth = computed(() => filteredMonths.value.reduce((a, m) => a + m.value, 0) / filteredMonths.value.length)
const totalFiltered = computed(() => filteredMonths.value.reduce((a, m) => a + m.value, 0))

// snowflake (radar) — 9 axes, score/100 mapeado pra raio 140
const snowflakePoints = computed(() => {
  const dims = raioXDimensions.value
  if (!dims.length) return ''
  const N = dims.length
  return dims.map((d, i) => {
    const angle = (i * 2 * Math.PI / N) - Math.PI / 2
    const r = (d.score / 100) * 140
    return `${(Math.cos(angle) * r).toFixed(1)},${(Math.sin(angle) * r).toFixed(1)}`
  }).join(' ')
})

const greenCount = computed(() => raioXDimensions.value.filter((d) => d.status === 'good').length)

// insights editoriais
const bestDimension = computed(() => [...raioXDimensions.value].sort((a, b) => b.score - a.score)[0])
const worstDimension = computed(() => [...raioXDimensions.value].sort((a, b) => a.score - b.score)[0])
// "oportunidade" = segunda menor pra dar uma direção acionável
const opportunityDimension = computed(() => [...raioXDimensions.value].sort((a, b) => a.score - b.score)[1])

// stress test scenarios
const stressScenarios = [
  {
    type: 'real',
    tag: 'Crise real',
    period: 'Fev-Mar 2020',
    year: '2020',
    icon: 'i-lucide-virus',
    iconColor: 'red',
    name: 'Pandemia COVID-19',
    description: 'Choque global de liquidez com lockdowns simultâneos. IBOV cedeu 45% em pouco mais de um mês, S&P 500 perdeu 34%, FIIs caíram 34%.',
    portfolioImpact: -33.4,
    ibov: -45.0,
    moneyLoss: 169988,
    classes: [
      { name: 'Ações', value: -45.0 },
      { name: 'FIIs', value: -34.0 },
      { name: 'Tesouro', value: -8.0 },
    ],
    duration: '32 dias',
    recovery: '~5 meses',
  },
  {
    type: 'real',
    tag: 'Crise real',
    period: 'Set 2008 - Mar 2009',
    year: '2008',
    icon: 'i-lucide-trending-down',
    iconColor: 'red',
    name: 'Crise do Subprime',
    description: 'Colapso bancário global após a falência do Lehman Brothers. IBOV recuou 54%, S&P 500 perdeu 57%, recuperação total levou anos.',
    portfolioImpact: -37.7,
    ibov: -54.0,
    moneyLoss: 191873,
    classes: [
      { name: 'Ações', value: -54.0 },
      { name: 'FIIs', value: -38.0 },
      { name: 'Tesouro', value: -3.0 },
    ],
    duration: '6 meses',
    recovery: '2,5 anos',
  },
  {
    type: 'projection',
    tag: 'Projeção futura',
    period: 'Projeção 2026-2027',
    year: '2026?',
    icon: 'i-lucide-server',
    iconColor: 'blue',
    name: 'Estouro da bolha de IA',
    description: 'Cenário hipotético: tese de hyperscalers (Nvidia, Microsoft, Meta) é revisada bruscamente. BDRs e ETFs internacionais sofrem mais; FIIs e Tesouro tendem a oferecer abrigo.',
    portfolioImpact: -13.2,
    ibov: -25.0,
    moneyLoss: 67181,
    classes: [
      { name: 'Ações', value: -25.0 },
      { name: 'FIIs', value: -10.0 },
      { name: 'Tesouro', value: 5.0 },
    ],
    duration: '~12 meses',
    recovery: '18-24 meses',
  },
]


// Helpers — curve & sparkline
function curve(arr: number[], w: number, h: number) {
  if (!arr?.length) return ''
  const min = Math.min(...arr)
  const max = Math.max(...arr)
  const range = max - min || 1
  return arr.map((v, i) => {
    const x = (i / (arr.length - 1)) * w
    const y = h - ((v - min) / range) * h * 0.92 - h * 0.04
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

function sparkline(arr: number[], w: number, h: number) {
  return curve(arr, w, h)
}

function monthLabel(m: string) {
  const map = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
  return map[Number(m) - 1] || m
}

// ============ Raio-X Highlights (cinematic story mode) ============
// Modal Spotify-Wrapped style. Mesma logica do /wallet.
const highlightsOpen = ref(false)
const authStoreHighlights = useAuthStore()
const brandHighlights = useBrand()

const userFirstName = computed(() => {
  const name = authStoreHighlights.me?.name || ''
  return name.split(/\s+/)[0] || ''
})

// PortfolioReport deterministico - alimenta slides com monthlyDividendsTotal etc.
const report = computed<PortfolioReport | null>(() => {
  if (!positionsReal.value.length) return null
  const inputs = positionsReal.value.map((p) => {
    const v = p.current_value ?? p.quantity * (p.current_price ?? p.average_price)
    return { ticker: p.ticker, weight: v }
  })
  return analyzePortfolio(inputs, brandHighlights.colors.primary)
})

// Equity curve no shape esperado pelo componente: { date, value }[].
const equityCurveForHighlights = computed(() =>
  equityCurveReal.value.map((v, i) => ({
    date: equityCurveDates.value[i] ?? '',
    value: v,
  })),
)

function openHighlights() {
  highlightsOpen.value = true
}
</script>

<style scoped>
/* ============= SKELETONS ============= */
/* Usados enquanto loading=true. Substituem qualquer valor textual ou
   bloco grande (donut, curva, snowflake) por uma barra com shimmer
   subtil. Mantém o layout estável durante o load. */
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
.wp8-skel-text-sm { display: inline-block; height: 12px; width: 40%; min-width: 80px; }
.wp8-skel-kpi { display: inline-block; height: 28px; width: 80%; min-width: 60px; }
.wp8-skel-chip { display: inline-block; height: 10px; width: 40px; }
.wp8-skel-curve { display: block; width: 100%; height: 100%; min-height: 240px; border-radius: 6px; }
.wp8-skel-snowflake { width: 100%; max-width: 320px; aspect-ratio: 1; border-radius: 50%; margin: 0 auto; }

/* ============= EMPTY STATE ============= */
.wp8-empty { max-width: 720px; margin: 0 auto; padding: 80px 24px; }
.wp8-empty-inner { display: flex; flex-direction: column; gap: 16px; text-align: left; }
.wp8-empty-title {
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 300;
  color: var(--text-heading);
  margin: 8px 0 0;
  letter-spacing: -0.025em;
  line-height: 1.15;
}
.wp8-empty-lead {
  font-size: 16px;
  color: var(--text-body);
  margin: 12px 0 24px;
  line-height: 1.6;
  max-width: 56ch;
}
.wp8-empty-ctas { display: flex; flex-wrap: wrap; gap: 12px; }

/* --- KPI helpers (extends global .calc-kpis) --- */
.wp-kpi-suf { font-size: 0.5em; opacity: 0.55; margin-left: 4px; font-weight: 400; }
:deep(.calc-kpis dd.primary) { color: var(--brand-primary); }
:deep(.calc-kpis dd.negative) { color: var(--brand-negative); }

/* --- Hero CTAs group --- */
.wp8-hero-ctas { display: inline-flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
.wp8-hero-ctas .wp8-highlights-btn { margin-top: 0; }

/* --- Resultado consolidado button (primário sólido) ---
   Dark-mode safe: bg=--text-heading (dark light / light dark), text=--bg-base
   (light light / dark dark) — sempre contraste correto. Hover usa --brand-primary
   (amber em ambos modos) com --text-on-primary que e flipped por modo. */
.wp8-result-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px 8px 14px;
  background: var(--text-heading);
  border: 1px solid var(--text-heading);
  border-radius: 999px;
  color: var(--bg-base);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.005em;
  transition: all 200ms ease-out;
}
.wp8-result-btn :deep(*) { color: var(--bg-base); flex-shrink: 0; transition: transform 200ms; }
.wp8-result-btn:hover {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: var(--text-on-primary);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--brand-primary) 60%, transparent);
}
.wp8-result-btn:hover :deep(*) { color: var(--text-on-primary); }
.wp8-result-btn:hover .wp8-result-arrow { transform: translateX(3px); }
.wp8-result-arrow { opacity: 0.75; }
.wp8-result-btn:hover .wp8-result-arrow { opacity: 1; }

/* Variant: ghost — bg tinted orange, mantém mesmo tamanho do primary */
.wp8-result-btn.wp8-result-btn--ghost {
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
  color: var(--brand-primary);
}
.wp8-result-btn.wp8-result-btn--ghost :deep(*) { color: var(--brand-primary); }
.wp8-result-btn.wp8-result-btn--ghost:hover {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  border-color: var(--brand-primary);
  color: var(--brand-primary);
  box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--brand-primary) 40%, transparent);
}
.wp8-result-btn.wp8-result-btn--ghost:hover :deep(*) { color: var(--brand-primary); }

/* --- Highlights button (editorial chamativo: pill com tint + play circle + arrow) --- */
.wp8-highlights-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 28px;
  padding: 8px 16px 8px 8px;
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--brand-primary);
  letter-spacing: -0.005em;
  transition: all 200ms ease-out;
  position: relative;
}
.wp8-highlights-btn:hover {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  border-color: var(--brand-primary);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--brand-primary) 50%, transparent);
}

.wp8-highlights-play {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: var(--brand-primary);
  color: var(--text-on-primary);
  flex-shrink: 0;
  transition: transform 200ms;
}
.wp8-highlights-play :deep(*) { color: var(--text-on-primary); margin-left: 1px; }
.wp8-highlights-btn:hover .wp8-highlights-play { transform: scale(1.08); }
.wp8-highlights-btn:hover .wp8-highlights-play :deep(*) { animation: wp8-play-pulse 1.2s ease-in-out infinite; }
@keyframes wp8-play-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.wp8-highlights-arrow { color: var(--brand-primary); transition: transform 200ms; flex-shrink: 0; opacity: 0.7; }
.wp8-highlights-btn:hover .wp8-highlights-arrow { transform: translateX(3px); opacity: 1; }

/* ============= COMPOSIÇÃO BLOCK (form area) ============= */
.wp8-compose {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 16px;
  align-items: center;
}
@media (min-width: 640px) {
  .wp8-compose { grid-template-columns: 140px 1fr; gap: 24px; }
}
@media (min-width: 1024px) {
  .wp8-compose { grid-template-columns: 160px 1fr; gap: 32px; }
}
.wp8-donut { width: 100%; height: auto; }
.wp8-donut-num { font-size: 28px; font-weight: 300; fill: var(--text-heading); font-variant-numeric: tabular-nums; }
.wp8-donut-cap { font-size: 9px; fill: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }

.wp8-legend { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.wp8-legend li { display: grid; grid-template-columns: 8px 1fr auto; gap: 10px; align-items: center; font-size: 12px; }
@media (min-width: 1024px) { .wp8-legend li { grid-template-columns: 8px 1fr auto auto; font-size: 13px; } }
.wp8-dot { width: 8px; height: 8px; border-radius: 999px; }
.wp8-leg-name { color: var(--text-heading); font-weight: 500; letter-spacing: 0.04em; }
.wp8-leg-val { color: var(--text-body); font-variant-numeric: tabular-nums; font-size: 12px; display: none; }
@media (min-width: 1024px) { .wp8-leg-val { display: inline; } }
.wp8-leg-pct { color: var(--text-muted); font-variant-numeric: tabular-nums; font-size: 12px; min-width: 40px; text-align: right; }

/* OF block under composition */
.wp8-of-block { display: flex; flex-direction: column; gap: 8px; }
.wp8-of-status { display: flex; align-items: center; gap: 10px; margin: 0; font-size: 14px; color: var(--text-heading); }
.wp8-of-status strong { font-weight: 500; }
.wp8-of-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--brand-positive); box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand-positive) 18%, transparent); flex-shrink: 0; }
.wp8-of-meta { font-size: 13px; color: var(--text-muted); margin: 0; line-height: 1.55; }

/* ============= CHART block ============= */
.wp8-chart-head { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
.wp8-chart-title { font-size: 18px; font-weight: 400; color: var(--text-heading); margin: 4px 0 0; letter-spacing: -0.015em; }
.wp8-legend-inline { display: flex; gap: 16px; font-size: 12px; font-variant-numeric: tabular-nums; }
.wp8-legi { display: inline-flex; align-items: center; gap: 6px; color: var(--text-heading); font-weight: 500; }
.wp8-legi.muted { color: var(--text-muted); font-weight: 400; }
.wp8-dot.pos { background: var(--brand-positive); }
.wp8-dot.neutral { background: var(--text-muted); }

.wp8-curve { position: relative; height: 240px; margin: 8px 0 24px; }
@media (min-width: 1024px) { .wp8-curve { height: 280px; } }
.wp8-curve svg { width: 100%; height: 100%; display: block; }
.wp8-chart-svg { cursor: crosshair; }
.wp8-chart-hover { pointer-events: none; }
.wp8-legi.is-neg { color: var(--brand-negative); }

/* Tooltip flutuante sobre o chart */
.wp8-chart-tip {
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
.wp8-chart-tip-date { font-size: 11px; color: var(--text-muted); margin: 0 0 4px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; font-variant-numeric: tabular-nums; }
.wp8-chart-tip-val { font-size: 16px; font-weight: 500; color: var(--text-heading); margin: 0; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }

.wp8-curve-stats { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px 24px; }
@media (min-width: 768px) { .wp8-curve-stats { grid-template-columns: repeat(4, 1fr); } }
.wp8-cs-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); font-weight: 500; margin: 0 0 4px; }
.wp8-cs-val { font-size: 16px; font-weight: 500; color: var(--text-heading); margin: 0; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
.wp8-cs-val.positive { color: var(--brand-positive); }
.wp8-cs-val.negative { color: var(--brand-negative); }

/* ============= RAIL (sections below shell) ============= */
.wp8-rail { max-width: 1440px; margin: 0 auto; padding: 0 16px; }
@media (min-width: 768px) { .wp8-rail { padding: 0 32px; } }

.wp8-section { padding: 40px 0 0; border-top: 1px solid var(--border-subtle); }
@media (min-width: 1024px) { .wp8-section { padding: 48px 0 0; } }

.wp8-head { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px; margin-bottom: 32px; }
.wp8-h2 { font-size: clamp(24px, 3vw, 32px); font-weight: 300; color: var(--text-heading); margin: 0; letter-spacing: -0.02em; line-height: 1.15; }
.wp8-head-meta { font-size: 12px; color: var(--text-muted); margin: 0; letter-spacing: 0.04em; }
.wp8-head-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.wp8-head-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--brand-primary);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.01em;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent);
  padding-bottom: 2px;
  transition: border-color 150ms;
}
.wp8-head-link :deep(*) { color: var(--brand-primary); transition: transform 150ms; }
.wp8-head-link:hover { border-bottom-color: var(--brand-primary); }
.wp8-head-link:hover :deep(*) { transform: translateX(2px); }

/* ============= BANKS ============= */
.wp8-banks { display: grid; grid-template-columns: 1fr; gap: 0; border-top: 1px solid var(--border-subtle); }
@media (min-width: 640px) { .wp8-banks { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1024px) { .wp8-banks { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1280px) { .wp8-banks { grid-template-columns: repeat(5, 1fr); } }
.wp8-bank { padding: 20px; border-right: 0; border-bottom: 1px solid var(--border-subtle); }
.wp8-bank:last-child { border-bottom: 0; }
@media (min-width: 640px) {
  .wp8-bank { border-right: 1px solid var(--border-subtle); padding: 22px; }
  .wp8-bank:nth-child(2n) { border-right: 0; }
}
@media (min-width: 1024px) {
  .wp8-bank { padding: 24px; }
  .wp8-bank:nth-child(2n) { border-right: 1px solid var(--border-subtle); }
  .wp8-bank:nth-child(3n) { border-right: 0; }
}
@media (min-width: 1280px) {
  .wp8-bank:nth-child(3n) { border-right: 1px solid var(--border-subtle); }
  .wp8-bank:nth-child(5n) { border-right: 0; }
  .wp8-bank { border-bottom: 0; }
}
.wp8-bank-name { font-size: 14px; font-weight: 500; color: var(--text-heading); margin: 0; letter-spacing: -0.01em; }
.wp8-bank-type { font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); margin: 4px 0 12px; font-weight: 500; }
.wp8-bank-balance { font-size: 22px; font-weight: 300; color: var(--text-heading); margin: 0; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.wp8-bank-sync { font-size: 11px; color: var(--text-muted); margin: 8px 0 0; }

/* Add new account cell */
.wp8-bank-add {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  text-decoration: none;
  background: color-mix(in srgb, var(--brand-primary) 2%, transparent);
  transition: all 150ms ease-out;
  position: relative;
}
.wp8-bank-add:hover {
  background: color-mix(in srgb, var(--brand-primary) 6%, transparent);
}
.wp8-bank-add-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px dashed color-mix(in srgb, var(--brand-primary) 50%, transparent);
  border-radius: 50%;
  color: var(--brand-primary);
  transition: all 150ms ease-out;
  margin-bottom: 4px;
}
.wp8-bank-add:hover .wp8-bank-add-icon {
  border-color: var(--brand-primary);
  background: var(--brand-primary);
  color: var(--text-on-primary);
  transform: rotate(90deg);
}
.wp8-bank-add-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--brand-primary);
  margin: 0;
  letter-spacing: -0.01em;
}
.wp8-bank-add-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}

/* ============= POSITIONS GROUPS (collapsible) ============= */
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

.wp8-pos-chev { color: var(--text-muted); transition: transform 200ms ease-out; flex-shrink: 0; align-self: center; }
.wp8-pos-chev.is-open { transform: rotate(90deg); color: var(--brand-primary); }

.wp8-pos-type { font-size: 16px; font-weight: 500; color: var(--text-heading); letter-spacing: -0.012em; }
@media (min-width: 768px) { .wp8-pos-type { font-size: 18px; } }
.wp8-pos-count { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); font-weight: 500; }

/* Weight bar: hidden mobile (já mostra na linha de baixo via value+pct) */
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
.wp8-pos-pct { font-size: 12px; }
@media (min-width: 1024px) { .wp8-pos-pct { font-size: 13px; } }
.wp8-pos-pnl.neg, .wp8-pos-pct.neg { color: var(--brand-negative); }
.wp8-pos-pct { font-size: 13px; min-width: 56px; text-align: right; }

.wp8-pos-body { padding: 0 0 16px; }
.wp8-pos-body .wp8-table-wrap { border-top: 0; }

.wp8-head-link--ghost { color: var(--text-muted); border-bottom-color: var(--border-default); font-weight: 500; background: transparent; border: 0; border-bottom: 1px solid var(--border-default); padding-bottom: 2px; cursor: pointer; font-family: inherit; }
.wp8-head-link--ghost:deep(*) { color: var(--text-muted); }
.wp8-head-link--ghost:hover { color: var(--text-heading); border-bottom-color: var(--text-muted); }
.wp8-head-link--ghost:hover:deep(*) { color: var(--text-heading); }

/* ============= TABLE ============= */
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

/* Mobile: esconde colunas menos críticas (NOME, QTD, ATUAL, PESO, %, DY, 7d) */
@media (max-width: 767px) {
  .wp8-table thead th:nth-child(2),    /* Nome */
  .wp8-table tbody td:nth-child(2),
  .wp8-table thead th:nth-child(3),    /* Qtd */
  .wp8-table tbody td:nth-child(3),
  .wp8-table thead th:nth-child(4),    /* Atual */
  .wp8-table tbody td:nth-child(4),
  .wp8-table thead th:nth-child(6),    /* Peso */
  .wp8-table tbody td:nth-child(6),
  .wp8-table thead th:nth-child(9),    /* DY */
  .wp8-table tbody td:nth-child(9),
  .wp8-table thead th:nth-child(10),   /* 7d sparkline */
  .wp8-table tbody td:nth-child(10) { display: none; }
  .wp8-table thead th, .wp8-table tbody td { padding: 12px 8px; font-size: 12px; }
  .wp8-table td.strong { font-size: 13px; }
}

/* ============= RAIO-X · SNOWFLAKE minimal + INSIGHTS ============= */
.wp8-raiox-split { display: grid; grid-template-columns: 1fr; gap: 40px; border-top: 1px solid var(--border-subtle); padding-top: 40px; }
@media (min-width: 1024px) { .wp8-raiox-split { grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; } }

/* Empty state quando carteira foi importada mas Raio-X ainda nao rodou */
.wp8-rx-empty { display: grid; grid-template-columns: 1fr; gap: 32px; border-top: 1px solid var(--border-subtle); padding: 40px 0; align-items: center; }
@media (min-width: 1024px) { .wp8-rx-empty { grid-template-columns: 1fr 1.2fr; gap: 64px; padding: 56px 0; } }
.wp8-rx-empty-shape { display: flex; justify-content: center; align-items: center; opacity: 0.45; }
.wp8-rx-empty-shape .wp8-snowflake-svg { width: 100%; max-width: 280px; height: auto; aspect-ratio: 1; }
.wp8-rx-empty-body { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
.wp8-rx-empty-h { font-size: clamp(24px, 3vw, 32px); font-weight: 300; color: var(--text-heading); margin: 6px 0 0; letter-spacing: -0.02em; line-height: 1.15; max-width: 18ch; }
.wp8-rx-empty-lead { font-size: 14px; line-height: 1.6; color: var(--text-body); margin: 0; max-width: 56ch; }
.wp8-rx-empty-ctas { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px; margin-top: 12px; }
.wp8-rx-empty-hint { font-size: 12px; color: var(--text-muted); letter-spacing: 0.02em; }

/* SNOWFLAKE compacto */
.wp8-snowflake { position: relative; display: flex; flex-direction: column; align-items: center; gap: 20px; }
.wp8-snowflake-svg { width: 100%; max-width: 320px; height: auto; aspect-ratio: 1; }
.wp8-snowflake-meta { text-align: center; }
.wp8-sf-score { font-size: 56px; font-weight: 300; line-height: 1; color: var(--brand-primary); margin: 0; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; text-shadow: 0 8px 32px color-mix(in srgb, var(--brand-primary) 22%, transparent); }
.wp8-sf-status { font-size: 13px; color: var(--text-muted); margin: 10px 0 0; letter-spacing: 0.02em; }

/* INSIGHTS editoriais (3 cards verticais) */
.wp8-rx-insights { display: flex; flex-direction: column; gap: 0; }
.wp8-ins { padding: 20px 0; border-bottom: 1px solid var(--border-subtle); }
.wp8-ins:first-child { padding-top: 0; }
.wp8-ins:last-child { border-bottom: 0; padding-bottom: 0; }
.wp8-ins-tag { font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; font-weight: 500; margin: 0 0 8px; }
.wp8-ins-tag.pos { color: var(--brand-positive); }
.wp8-ins-tag.neutral { color: var(--brand-primary); }
.wp8-ins-tag.accent { color: var(--text-muted); }
.wp8-ins-h { font-size: 18px; font-weight: 400; color: var(--text-heading); margin: 0 0 6px; letter-spacing: -0.015em; display: flex; align-items: baseline; gap: 12px; }
.wp8-ins-score { font-size: 22px; font-weight: 300; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.wp8-ins-score.pos { color: var(--brand-positive); }
.wp8-ins-score.neutral { color: var(--brand-primary); }
.wp8-ins-score.accent { color: var(--text-muted); }
.wp8-ins-note { font-size: 13px; color: var(--text-muted); margin: 0; line-height: 1.55; max-width: 56ch; }

/* Grid editorial 9 dimensões — cells com border interna estilo jornal */
.wp8-rx-grid { list-style: none; padding: 0; margin: 40px 0 0; display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-top: 1px solid var(--border-subtle); border-left: 1px solid var(--border-subtle); }
@media (min-width: 768px) { .wp8-rx-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) { .wp8-rx-grid { grid-template-columns: repeat(9, 1fr); } }
.wp8-rx-cell { padding: 20px 16px; border-right: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 6px; transition: background 200ms; }
.wp8-rx-cell:hover { background: color-mix(in srgb, var(--brand-primary) 3%, transparent); }
.wp8-rx-cell-score { font-size: 28px; font-weight: 300; line-height: 1; letter-spacing: -0.025em; font-variant-numeric: tabular-nums; margin: 0; }
.wp8-rx-cell-score.pos { color: var(--brand-positive); }
.wp8-rx-cell-score.neutral { color: var(--brand-primary); }
.wp8-rx-cell-score.neg { color: var(--brand-negative); }
.wp8-rx-cell-name { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); font-weight: 500; margin: 0; line-height: 1.3; }
.wp8-rx-cell-bar { display: block; height: 2px; width: 100%; background: var(--bg-overlay); margin-top: 6px; border-radius: 999px; overflow: hidden; }
.wp8-rx-cell-fill { display: block; height: 100%; border-radius: 999px; }
.wp8-rx-cell-fill.pos { background: var(--brand-positive); }
.wp8-rx-cell-fill.neutral { background: var(--brand-primary); }
.wp8-rx-cell-fill.neg { background: var(--brand-negative); }

/* ============= STRESS TEST · minimal editorial ============= */
.wp8-stress-lead { font-size: 14px; line-height: 1.6; color: var(--text-muted); max-width: 64ch; margin: 0 0 32px; }

.wp8-stress-grid { display: grid; grid-template-columns: 1fr; gap: 0; border-top: 1px solid var(--border-subtle); }
@media (min-width: 1024px) { .wp8-stress-grid { grid-template-columns: repeat(3, 1fr); } }

.wp8-stress-cell { padding: 28px 32px 28px 0; border-right: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 8px; }
.wp8-stress-cell:last-child { border-right: 0; padding-right: 0; }
@media (max-width: 1023px) { .wp8-stress-cell { padding: 28px 0; border-right: 0; border-bottom: 1px solid var(--border-subtle); } .wp8-stress-cell:last-child { border-bottom: 0; } }
@media (min-width: 1024px) { .wp8-stress-cell + .wp8-stress-cell { padding-left: 32px; } }

.wp8-stress-tag { font-size: 10px; text-transform: uppercase; letter-spacing: 0.18em; font-weight: 500; margin: 0 0 4px; }
.wp8-stress-tag--real { color: var(--brand-negative); }
.wp8-stress-tag--projection { color: #3b82f6; }
.wp8-stress-period { color: var(--text-muted); letter-spacing: 0.12em; }

.wp8-stress-name { font-size: 18px; font-weight: 500; color: var(--text-heading); margin: 0; letter-spacing: -0.012em; line-height: 1.2; }

.wp8-stress-impact-val { font-size: clamp(40px, 5vw, 56px); font-weight: 300; line-height: 1; color: var(--brand-negative); margin: 12px 0 4px; letter-spacing: -0.04em; font-variant-numeric: tabular-nums; }
.wp8-stress-cell--projection .wp8-stress-impact-val { color: #3b82f6; }

.wp8-stress-meta { font-size: 13px; color: var(--text-muted); margin: 0; font-variant-numeric: tabular-nums; }
.wp8-stress-cash { color: var(--text-heading); font-weight: 500; }

.wp8-stress-time { font-size: 12px; color: var(--text-muted); margin: 8px 0 0; letter-spacing: 0.02em; font-variant-numeric: tabular-nums; }

/* ============= RENDA ============= */
.wp8-renda-grid { display: grid; grid-template-columns: 1fr; gap: 32px; border-top: 1px solid var(--border-subtle); padding-top: 32px; }
@media (min-width: 1024px) { .wp8-renda-grid { grid-template-columns: 1.6fr 1fr; gap: 56px; } }

/* Bar chart — SVG editorial */
.wp8-bars-svg { position: relative; }
.wp8-bars-svg svg { width: 100%; height: 200px; display: block; }
.wp8-bars-axis { list-style: none; padding: 0; margin: 8px 0 0; display: grid; grid-template-columns: repeat(12, 1fr); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); font-weight: 500; }
.wp8-bars-axis li { text-align: center; transition: color 150ms; }
.wp8-bars-axis li.is-active { color: var(--text-heading); font-weight: 600; }
.wp8-bars-meta { font-size: 13px; color: var(--text-muted); margin: 24px 0 0; line-height: 1.55; }
.wp8-bars-meta strong { color: var(--text-heading); font-weight: 500; }

/* Bar segments — hover/dim states */
.wp8-bar-seg { transition: opacity 150ms ease-out; }
.wp8-bar-seg.is-dimmed { opacity: 0.32; }
.wp8-bar-seg.is-hovered { opacity: 1; }
.wp8-bar-hit { cursor: pointer; }

/* Tooltip do bar chart — MESMO padrão do calendar/heatmap (.wp8r-cellable::after) */
.wp8-bars-tip {
  position: absolute;
  bottom: calc(100% + 12px);
  transform: translateX(-50%);
  padding: 8px 12px;
  background: var(--text-heading);
  color: var(--bg-base);
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0.01em;
  text-transform: none;
  text-align: center;
  border-radius: 6px;
  width: max-content;
  pointer-events: none;
  z-index: 11;
  box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--text-heading) 30%, transparent);
  animation: wp8-tip-in 150ms ease-out;
}
.wp8-bars-tip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--text-heading);
}
@keyframes wp8-tip-in {
  from { opacity: 0; transform: translateX(-50%) translateY(4px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* ============= MODAL · MESMO padrão usado no resultado (.wp8r-modal-*) ============= */
.wp8r-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
  background: color-mix(in srgb, var(--text-heading) 38%, transparent);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
@media (min-width: 640px) {
  .wp8r-modal-overlay { align-items: center; padding: 24px; }
}

.wp8r-modal {
  width: 100%;
  max-width: 560px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  background: var(--bg-base);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  box-shadow: 0 32px 64px -16px color-mix(in srgb, var(--text-heading) 30%, transparent);
  padding: 28px 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
@media (min-width: 640px) { .wp8r-modal { padding: 36px 36px 28px; gap: 28px; } }

.wp8r-modal-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.wp8r-modal-h {
  font-size: clamp(24px, 3vw, 30px);
  font-weight: 300;
  color: var(--text-heading);
  margin: 6px 0 0;
  letter-spacing: -0.02em;
  line-height: 1.15;
}
.wp8r-modal-h .pos { color: var(--brand-positive); }
.wp8r-modal-h .neg { color: var(--brand-negative); }
.wp8r-modal-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 150ms;
  flex-shrink: 0;
}
.wp8r-modal-close :deep(*) { color: var(--text-muted); }
.wp8r-modal-close:hover { background: var(--bg-elevated); border-color: var(--text-muted); color: var(--text-heading); }
.wp8r-modal-close:hover :deep(*) { color: var(--text-heading); }

.wp8r-modal-kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 24px;
  margin: 0;
  padding: 16px 0;
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
}
.wp8r-modal-kpis dt { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); font-weight: 500; margin: 0 0 4px; }
.wp8r-modal-kpis dd { font-size: 20px; font-weight: 300; color: var(--text-heading); margin: 0; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }

.wp8r-modal-body { display: flex; flex-direction: column; gap: 12px; }

/* Grupos collapsiveis por classe */
.wp8r-modal-groups { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0; }
.wp8r-modal-group { border-bottom: 1px solid var(--border-subtle); }
.wp8r-modal-group:last-child { border-bottom: 0; }
.wp8r-modal-group-head {
  display: grid;
  grid-template-columns: 10px 1fr auto 18px;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px 0;
  background: transparent;
  border: 0;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: opacity 150ms;
}
.wp8r-modal-group-head:hover { opacity: 0.85; }
.wp8r-modal-group-dot { width: 8px; height: 8px; border-radius: 999px; }
.wp8r-modal-group-title { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.wp8r-modal-group-name { font-size: 14px; font-weight: 600; color: var(--text-heading); letter-spacing: 0.01em; }
.wp8r-modal-group-count { font-size: 11px; color: var(--text-muted); font-variant-numeric: tabular-nums; letter-spacing: 0.04em; text-transform: lowercase; }
.wp8r-modal-group-total { font-size: 15px; font-weight: 500; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; color: var(--brand-positive); }
.wp8r-modal-group-chev { color: var(--text-muted); transition: transform 200ms ease; }
.wp8r-modal-group.is-open .wp8r-modal-group-chev { transform: rotate(180deg); }

.wp8r-modal-trades { list-style: none; padding: 0 0 14px 24px; margin: 0; display: flex; flex-direction: column; gap: 0; }
.wp8r-modal-trade {
  display: grid;
  grid-template-columns: 8px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-subtle);
}
.wp8r-modal-trade:last-child { border-bottom: 0; }
.wp8r-modal-trade-dot { width: 8px; height: 8px; border-radius: 999px; }
.wp8r-modal-trade-tk { font-size: 14px; font-weight: 600; color: var(--text-heading); margin: 0; letter-spacing: 0.04em; }
.wp8r-modal-trade-meta { font-size: 12px; color: var(--text-muted); margin: 4px 0 0; font-variant-numeric: tabular-nums; text-transform: capitalize; }
.wp8r-modal-trade-pnl { font-size: 15px; font-weight: 500; margin: 0; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
.wp8r-modal-trade-pnl.pos { color: var(--brand-positive); }
.wp8r-modal-trade-pnl.neg { color: var(--brand-negative); }
.wp8r-modal-trade-pnl.projected { color: var(--text-muted); font-weight: 400; }
.wp8r-modal-trade-dot.projected { opacity: 0.55; }

/* Grupo Futuro — visualmente muted pra deixar claro que e projecao */
.wp8r-modal-group.is-future { border-top: 1px solid var(--border-subtle); margin-top: 4px; }
.wp8r-modal-group.is-future .wp8r-modal-group-name { color: var(--text-muted); font-weight: 500; }
.wp8r-modal-group.is-future .wp8r-modal-group-dot { opacity: 0.55; }
.wp8r-modal-group-total.projected { color: var(--text-muted); font-weight: 400; }
.approx-sym { letter-spacing: 0.04em; margin-right: 1px; opacity: 0.7; }

.wp8r-modal-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 0 8px; text-align: center; }
.wp8r-modal-empty-icon { color: var(--text-muted); opacity: 0.5; margin-bottom: 4px; }
.wp8r-modal-empty-h { font-size: 15px; font-weight: 500; color: var(--text-heading); margin: 0; }
.wp8r-modal-empty-sub { font-size: 13px; color: var(--text-muted); margin: 0; max-width: 40ch; line-height: 1.55; }

.wp8r-modal-foot { display: flex; justify-content: flex-end; padding-top: 4px; }
.wp8r-modal-foot .wp8-head-link--ghost { font-size: 13px; }

/* Ghost link button (mesmo do resultado) */
.wp8-head-link--ghost {
  display: inline-flex; align-items: center; gap: 6px;
  color: var(--text-muted); background: transparent; border: 0;
  border-bottom: 1px solid var(--border-default); padding-bottom: 2px;
  cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 500; letter-spacing: 0.01em;
}
.wp8-head-link--ghost:deep(*) { color: var(--text-muted); }
.wp8-head-link--ghost:hover { color: var(--text-heading); border-bottom-color: var(--text-muted); }
.wp8-head-link--ghost:hover:deep(*) { color: var(--text-heading); }

/* Fade animation */
.wp8r-modal-fade-enter-active, .wp8r-modal-fade-leave-active { transition: opacity 200ms ease-out; }
.wp8r-modal-fade-enter-active .wp8r-modal,
.wp8r-modal-fade-leave-active .wp8r-modal { transition: transform 200ms ease-out, opacity 200ms ease-out; }
.wp8r-modal-fade-enter-from, .wp8r-modal-fade-leave-to { opacity: 0; }
.wp8r-modal-fade-enter-from .wp8r-modal, .wp8r-modal-fade-leave-to .wp8r-modal { transform: translateY(20px); opacity: 0; }

/* KPIs strip abaixo das barras */
.wp8-bars-kpis { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px 32px; margin: 28px 0 0; padding: 24px 0 0; border-top: 1px solid var(--border-subtle); }
@media (min-width: 768px) { .wp8-bars-kpis { grid-template-columns: repeat(4, 1fr); gap: 32px; } }
.wp8-bars-kpis dt { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); font-weight: 500; margin: 0 0 6px; }
.wp8-bars-kpis dd { font-size: 22px; font-weight: 300; letter-spacing: -0.02em; color: var(--text-heading); margin: 0; font-variant-numeric: tabular-nums; display: flex; align-items: baseline; gap: 8px; }
.wp8-kpi-cap { font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); }
.wp8-kpi-pos { color: var(--brand-positive); }

/* Breakdown por classe */
/* Legend toggleable acima do chart */
.wp8-bars-head { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
.wp8-legend-toggle { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.wp8-leg-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  color: var(--text-heading);
  transition: all 150ms;
}
.wp8-leg-btn:hover { border-color: var(--border-default); background: var(--bg-elevated); }
.wp8-leg-btn.is-off { opacity: 0.5; color: var(--text-muted); }
.wp8-leg-btn.is-off:hover { opacity: 0.75; }
.wp8-leg-swatch { width: 10px; height: 10px; border-radius: 999px; border: 1.5px solid; flex-shrink: 0; transition: all 150ms; }
.wp8-leg-label { font-weight: 500; letter-spacing: -0.005em; }
.wp8-leg-pct { color: var(--text-muted); font-variant-numeric: tabular-nums; font-size: 11px; letter-spacing: 0.02em; }

/* Events — typographic, sem pill */
.wp8-events { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0; }
.wp8-events li { display: grid; grid-template-columns: 56px 1fr auto; gap: 20px; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--border-subtle); }
.wp8-events li:first-child { padding-top: 0; }
.wp8-events li:last-child { border-bottom: 0; }
.wp8-ev-date { display: flex; flex-direction: column; align-items: flex-start; line-height: 1; }
.wp8-ev-day { font-size: 26px; font-weight: 300; color: var(--text-heading); letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.wp8-ev-mo { font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--text-muted); margin-top: 4px; font-weight: 500; }
.wp8-ev-tk { font-size: 14px; font-weight: 500; color: var(--text-heading); margin: 0; letter-spacing: 0.04em; }
.wp8-ev-kind { font-size: 11px; color: var(--text-muted); margin: 4px 0 0; text-transform: capitalize; }
.wp8-ev-val { font-size: 15px; font-weight: 400; margin: 0; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
.wp8-ev-val.positive { color: var(--brand-positive); }

/* ============= CTA ============= */
/* ============= CTA · full-bleed amarelado ============= */
/* Truque viewport-edge: position + left + width 100vw fazem o elemento
   escapar do padding do parent e ocupar toda a largura da viewport sem
   precisar de negative margin nem reestruturação do DOM. */
.wp8-cta-fullbleed {
  position: relative;
  width: 100%;
  padding: 30px 0;
  background: #f1e19e4a;
  overflow: hidden;
}
/* Apenas no xl+ o parent (content-area da default.vue) tem xl:px-4 (16px).
   Escapamos esses 16px de cada lado via width + left, sem usar margin. */
@media (min-width: 1280px) {
  .wp8-cta-fullbleed {
    width: calc(100% + 32px);
    left: -16px;
  }
}

.wp8-cta-atmo { position: absolute; pointer-events: none; filter: blur(200px); z-index: 0; }
.wp8-cta-atmo--top {
  top: -10%; right: -5%; width: 55%; height: 70%;
  opacity: 0.55;
  background: radial-gradient(ellipse, color-mix(in srgb, var(--brand-primary) 30%, transparent), transparent 60%);
}
.wp8-cta-atmo--bottom {
  bottom: -20%; left: -10%; width: 50%; height: 60%;
  opacity: 0.4;
  background: radial-gradient(ellipse, color-mix(in srgb, #fbbf24 30%, transparent), transparent 60%);
}

.wp8-cta-inner {
  position: relative;
  z-index: 1;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 16px;
}
@media (min-width: 768px) { .wp8-cta-inner { padding: 0 32px; } }

.wp8-cta-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 32px;
  margin-bottom: 56px;
}
.wp8-cta-head > div { max-width: 56ch; }

.wp8-cta-h {
  font-size: clamp(28px, 3.6vw, 44px);
  font-weight: 300;
  color: var(--text-heading);
  margin: 8px 0 0;
  letter-spacing: -0.025em;
  line-height: 1.1;
}

/* Primary CTA pill sólido — usa tokens dark-aware (--bg-base flipa por modo) */
.wp8-cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 22px 14px 24px;
  background: var(--text-heading);
  border: 1px solid var(--text-heading);
  border-radius: 999px;
  color: var(--bg-base);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.005em;
  transition: all 200ms ease-out;
  box-shadow: 0 12px 32px -12px color-mix(in srgb, var(--text-heading) 50%, transparent);
  align-self: flex-end;
  flex-shrink: 0;
}
.wp8-cta-primary :deep(*) { color: var(--bg-base); flex-shrink: 0; transition: transform 200ms; }
.wp8-cta-primary:hover {
  background: var(--brand-primary);
  border-color: var(--brand-primary);
  color: var(--text-on-primary);
  transform: translateY(-2px);
  box-shadow: 0 16px 40px -8px color-mix(in srgb, var(--brand-primary) 60%, transparent);
}
.wp8-cta-primary:hover :deep(*) { color: var(--text-on-primary); }
.wp8-cta-primary:hover .wp8-cta-arrow { transform: translateX(4px); }

/* Data: 2 blocks minimalistas separados por divider sutil */
.wp8-cta-data {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px 0;
  border-top: 1px solid color-mix(in srgb, var(--text-heading) 10%, transparent);
  padding-top: 40px;
}
@media (min-width: 768px) {
  .wp8-cta-data {
    grid-template-columns: 1fr 1fr;
    gap: 0;
  }
  .wp8-cta-block:first-child {
    padding-right: 48px;
    border-right: 1px solid color-mix(in srgb, var(--text-heading) 10%, transparent);
  }
  .wp8-cta-block:last-child { padding-left: 48px; }
}

.wp8-cta-block { display: flex; flex-direction: column; gap: 8px; }
.wp8-cta-block-tag {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--text-muted);
  font-weight: 500;
  margin: 0;
}
.wp8-cta-block-mega {
  font-size: clamp(40px, 5vw, 64px);
  font-weight: 300;
  line-height: 1;
  letter-spacing: -0.035em;
  font-variant-numeric: tabular-nums;
  margin: 4px 0 4px;
}
.wp8-cta-block-mega.pos { color: var(--brand-positive); }
.wp8-cta-block-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 14px;
  color: var(--text-body);
  margin: 0;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.005em;
}
.wp8-cta-block-meta .sep { color: var(--text-muted); opacity: 0.6; }
</style>

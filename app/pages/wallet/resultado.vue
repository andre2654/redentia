<!--
  V8 — Resultado consolidado (Swing + Day Trade).
  Mesma DNA do V8 wallet: CalcUiShell split 2x2, atmospheric blur,
  italic serif accents, snowflake/grids editoriais, stacked bars,
  full-bleed amarelado pra CTA.

  Services reais: usePortfolioTradesService + usePluggyService.
  Backend retorna MockTrade pareado FIFO, adaptamos pra shape interno
  `AdaptedTrade` (declarado abaixo) que o template consome. Toggle de
  modo via useResultMode() (compartilhado), mapping pequeno:
  'swing' ↔ 'carteira', 'day' ↔ 'day-trade'.

  Tres estados de render: empty (sem auth ou sem connection),
  loading (skeletons), loaded (render normal).
-->
<template>
  <NuxtLayout name="default" title="Resultado · Swing + Day Trade">
    <!-- EMPTY STATE — sem auth ou sem connection Pluggy ativa. Sem
         historico de operacoes nao tem como gerar metricas. Mesma DNA
         do empty state do v8/index.vue. -->
    <section v-if="!loading && (!isAuthed || !hasConnection)" class="wp8-empty">
      <div class="wp8-empty-inner">
        <p class="calc-eyebrow">Resultado vazio</p>
        <h1 class="wp8-empty-title">
          Conecte sua corretora e veja seu resultado <em class="calc-italic">em tempo real.</em>
        </h1>
        <p class="wp8-empty-lead">
          O Resultado é montado a partir das suas operações reais. Open Finance puxa o histórico (até 12 meses)
          automaticamente. Sem conexão, não temos trades pra calcular P&amp;L, win rate, profit factor ou heatmap.
        </p>
        <div class="wp8-empty-ctas">
          <NuxtLink to="/settings/integracoes" class="wp8-result-btn">
            <UIcon name="i-lucide-link-2" class="size-4" />
            <span>Conectar Open Finance</span>
            <UIcon name="i-lucide-arrow-right" class="size-4 wp8-result-arrow" />
          </NuxtLink>
          <NuxtLink to="/help?intent=import-portfolio" class="wp8-highlights-btn">
            <span class="wp8-highlights-play">
              <UIcon name="i-lucide-message-square" class="size-3.5" />
            </span>
            <span>Importar via chat</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <CalcUiShell
      v-else
      back-to="/wallet"
      back-label="Voltar pra carteira"
      :last-updated="lastUpdated"
    >
      <!-- HERO -->
      <template #hero>
        <p class="calc-eyebrow">Resultado · {{ mode === 'swing' ? '12 meses' : 'últimos 7 dias' }}</p>
        <h1 class="calc-title">
          Quanto sua disciplina rendeu em
          <em class="calc-italic">{{ mode === 'swing' ? 'Swing.' : 'Day Trade.' }}</em>
        </h1>
        <p class="calc-lead">
          P&L realizado, win rate, profit factor e curva consolidada. Heatmap mensal e tabela completa de operações abaixo.
        </p>

        <!-- Mode toggle Swing / Day -->
        <div class="wp8r-mode">
          <button
            type="button"
            :class="['wp8r-mode-btn', { 'is-active': mode === 'swing' }]"
            @click="setModeLocal('swing')"
          >
            <UIcon name="i-lucide-trending-up" class="size-3.5" />
            <span>Swing</span>
            <span class="wp8r-mode-cap">12m</span>
          </button>
          <button
            type="button"
            :class="['wp8r-mode-btn', { 'is-active': mode === 'day' }]"
            @click="setModeLocal('day')"
          >
            <UIcon name="i-lucide-zap" class="size-3.5" />
            <span>Day Trade</span>
            <span class="wp8r-mode-cap">7d</span>
          </button>
        </div>

        <ul class="calc-chips">
          <li v-if="loading"><span class="dot positive" /> <span class="wp8r-skel wp8r-skel-chip" /> trades</li>
          <li v-else><span class="dot positive" /> {{ active.totalTrades }} trades</li>
          <li v-if="loading"><span class="dot" /> <span class="wp8r-skel wp8r-skel-chip" /> win rate</li>
          <li v-else><span class="dot" /> {{ active.winRate }}% win rate</li>
          <li v-if="loading"><span class="dot" /> PF <span class="wp8r-skel wp8r-skel-chip" /></li>
          <li v-else><span class="dot" /> PF {{ active.profitFactor.toFixed(1) }}</li>
          <li v-if="loading"><span class="dot" /> R/R <span class="wp8r-skel wp8r-skel-chip" /></li>
          <li v-else><span class="dot" /> R/R {{ rrRatio }}</li>
        </ul>
      </template>

      <!-- RESULT — Mega P&L + KPIs -->
      <template #result>
        <p class="calc-result-eyebrow">P&L realizado · {{ today }}</p>
        <p v-if="loading" class="calc-result-mega"><span class="wp8r-skel wp8r-skel-text-mega" /></p>
        <p v-else :class="['calc-result-mega', active.totalPnl >= 0 ? 'wp8r-mega-pos' : 'wp8r-mega-neg']">
          {{ active.totalPnl >= 0 ? '+' : '' }}{{ formatBRL(active.totalPnl) }}
        </p>
        <p class="calc-result-caption">
          <template v-if="loading"><span class="wp8r-skel wp8r-skel-text-sm" /></template>
          <template v-else>
            <span :class="active.totalPnl >= 0 ? 'positive' : 'negative'">
              {{ active.totalPnl >= 0 ? '↑' : '↓' }}
              {{ winCount }} wins · {{ lossCount }} losses
            </span>
            <span> · sequência {{ longestWinStreak }} verdes seguidos</span>
          </template>
        </p>

        <div class="calc-result-divider" />

        <dl class="calc-kpis">
          <div>
            <dt>Profit factor</dt>
            <dd v-if="loading"><span class="wp8r-skel wp8r-skel-kpi" /></dd>
            <dd v-else :class="active.profitFactor >= 2 ? 'positive' : ''">{{ active.profitFactor.toFixed(1) }}</dd>
          </div>
          <div>
            <dt>Win rate</dt>
            <dd v-if="loading"><span class="wp8r-skel wp8r-skel-kpi" /></dd>
            <dd v-else>{{ active.winRate }}%</dd>
          </div>
          <div>
            <dt>R/R médio</dt>
            <dd v-if="loading"><span class="wp8r-skel wp8r-skel-kpi" /></dd>
            <dd v-else>{{ rrRatio }}</dd>
          </div>
        </dl>
      </template>

      <!-- FORM area → Vencedores vs Perdedores -->
      <template #form>
        <p class="calc-result-eyebrow">Vencedores vs. perdedores</p>

        <div class="wp8r-wl-grid">
          <!-- Donut win/loss -->
          <div v-if="loading" class="wp8r-skel wp8r-skel-snowflake" />
          <svg v-else viewBox="0 0 200 200" class="wp8r-wl-donut">
            <g transform="translate(100,100)">
              <circle r="80" fill="none" stroke="var(--bg-overlay)" stroke-width="20" />
              <!-- wins arc -->
              <circle r="80" fill="none" stroke="var(--brand-positive)" stroke-width="20"
                :stroke-dasharray="`${(winCount / (active.totalTrades || 1)) * 502.6} 502.6`"
                transform="rotate(-90)" />
              <!-- losses arc -->
              <circle r="80" fill="none" stroke="var(--brand-negative)" stroke-width="20"
                :stroke-dasharray="`${(lossCount / (active.totalTrades || 1)) * 502.6} 502.6`"
                :stroke-dashoffset="-((winCount / (active.totalTrades || 1)) * 502.6)"
                transform="rotate(-90)" />
            </g>
            <text x="100" y="94" text-anchor="middle" class="wp8r-wl-num">{{ active.winRate }}%</text>
            <text x="100" y="118" text-anchor="middle" class="wp8r-wl-cap">acerto</text>
          </svg>

          <ul class="wp8r-wl-list">
            <li>
              <span class="wp8r-wl-dot pos" />
              <div>
                <p class="wp8r-wl-name">Vencedores</p>
                <p v-if="loading" class="wp8r-wl-sub"><span class="wp8r-skel wp8r-skel-text-sm" /></p>
                <p v-else class="wp8r-wl-sub">+{{ formatBRL(winsValue) }} · média +{{ formatBRL(active.avgWin) }}</p>
              </div>
              <p v-if="loading" class="wp8r-wl-val pos"><span class="wp8r-skel wp8r-skel-kpi" /></p>
              <p v-else class="wp8r-wl-val pos">{{ winCount }}</p>
            </li>
            <li>
              <span class="wp8r-wl-dot neg" />
              <div>
                <p class="wp8r-wl-name">Perdedores</p>
                <p v-if="loading" class="wp8r-wl-sub"><span class="wp8r-skel wp8r-skel-text-sm" /></p>
                <p v-else class="wp8r-wl-sub">{{ formatBRL(lossesValue) }} · média {{ formatBRL(active.avgLoss) }}</p>
              </div>
              <p v-if="loading" class="wp8r-wl-val neg"><span class="wp8r-skel wp8r-skel-kpi" /></p>
              <p v-else class="wp8r-wl-val neg">{{ lossCount }}</p>
            </li>
          </ul>
        </div>

        <div class="calc-result-divider" />

        <div class="wp8r-extremes">
          <p class="calc-result-eyebrow" style="margin-bottom: 12px;">Extremos do período</p>
          <dl class="calc-kpis">
            <div>
              <dt>Maior win</dt>
              <dd v-if="loading"><span class="wp8r-skel wp8r-skel-kpi" /></dd>
              <dd v-else class="positive">+{{ formatBRL(active.bestTrade) }}</dd>
            </div>
            <div>
              <dt>Maior loss</dt>
              <dd v-if="loading"><span class="wp8r-skel wp8r-skel-kpi" /></dd>
              <dd v-else class="negative">{{ formatBRL(active.worstTrade) }}</dd>
            </div>
            <div>
              <dt>Sequência verde</dt>
              <dd v-if="loading"><span class="wp8r-skel wp8r-skel-kpi" /></dd>
              <dd v-else>{{ longestWinStreak }}</dd>
            </div>
          </dl>
        </div>
      </template>

      <!-- CHART → Equity curve -->
      <template #chart>
        <header class="wp8r-chart-head">
          <div>
            <p class="calc-result-eyebrow">Curva de resultado</p>
            <h3 class="wp8r-chart-title">P&L acumulado <em class="calc-italic">{{ mode === 'swing' ? '· 90 dias' : '· 7 dias' }}</em></h3>
          </div>
          <p v-if="loading" class="wp8r-chart-stat"><span class="wp8r-skel wp8r-skel-kpi" style="display: inline-block; width: 120px; height: 28px;" /></p>
          <p v-else class="wp8r-chart-stat" :class="active.totalPnl >= 0 ? 'pos' : 'neg'">
            {{ active.totalPnl >= 0 ? '+' : '' }}{{ formatBRL(active.totalPnl, { compact: true }) }}
          </p>
        </header>

        <div class="wp8r-curve">
          <div v-if="loading" class="wp8r-skel wp8r-skel-curve" />
          <svg
            v-else
            ref="chartSvgRef"
            viewBox="0 0 800 240"
            preserveAspectRatio="none"
            class="wp8r-chart-svg"
            @mousemove="onChartMouseMove"
            @mouseleave="onChartMouseLeave"
          >
            <defs>
              <linearGradient :id="`wp8r-g-${mode}`" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" :stop-color="curveColor" stop-opacity="0.28" />
                <stop offset="100%" :stop-color="curveColor" stop-opacity="0" />
              </linearGradient>
            </defs>
            <!-- baseline ticks -->
            <line v-for="y in [48, 96, 144, 192]" :key="y" x1="0" :y1="y" x2="800" :y2="y" stroke="var(--border-subtle)" stroke-width="1" stroke-dasharray="2 4" />
            <!-- zero line (P&L=0) -->
            <line :y1="zeroY" :y2="zeroY" x1="0" x2="800" stroke="var(--border-default)" stroke-width="1" stroke-dasharray="4 4" opacity="0.7" />
            <polygon :points="`0,${zeroY} ${curve(cumulativeCurve, 800, 240)} 800,${zeroY}`" :fill="`url(#wp8r-g-${mode})`" />
            <polyline :points="curve(cumulativeCurve, 800, 240)" fill="none" :stroke="curveColor" stroke-width="1.8" />
            <!-- HOVER: linha vertical + ponto -->
            <g v-if="chartHoverPoint" class="wp8r-chart-hover">
              <line :x1="chartHoverPoint.x" y1="0" :x2="chartHoverPoint.x" y2="240" stroke="var(--text-heading)" stroke-width="1" stroke-dasharray="3 3" opacity="0.35" />
              <circle :cx="chartHoverPoint.x" :cy="chartHoverPoint.y" r="5" :fill="curveColor" stroke="var(--bg-default)" stroke-width="2" />
            </g>
          </svg>

          <!-- TOOLTIP HTML overlay -->
          <div
            v-if="chartHoverPoint && !loading"
            class="wp8r-chart-tip"
            :style="{ left: `${(chartHoverPoint.x / 800) * 100}%` }"
          >
            <p class="wp8r-chart-tip-date">{{ formatChartDate(chartHoverPoint.date) }}</p>
            <p class="wp8r-chart-tip-val" :class="chartHoverPoint.value >= 0 ? 'pos' : 'neg'">
              {{ chartHoverPoint.value >= 0 ? '+' : '' }}{{ formatBRL(chartHoverPoint.value) }}
            </p>
          </div>
        </div>

        <ul class="wp8r-curve-stats">
          <li>
            <p class="wp8r-cs-label">Max drawdown</p>
            <p v-if="loading" class="wp8r-cs-val"><span class="wp8r-skel wp8r-skel-kpi" /></p>
            <p v-else class="wp8r-cs-val neg">{{ formatPct(maxDrawdown) }}</p>
          </li>
          <li>
            <p class="wp8r-cs-label">Melhor dia</p>
            <p v-if="loading" class="wp8r-cs-val"><span class="wp8r-skel wp8r-skel-kpi" /></p>
            <p v-else class="wp8r-cs-val pos">+{{ formatBRL(bestDay) }}</p>
          </li>
          <li>
            <p class="wp8r-cs-label">Pior dia</p>
            <p v-if="loading" class="wp8r-cs-val"><span class="wp8r-skel wp8r-skel-kpi" /></p>
            <p v-else class="wp8r-cs-val neg">{{ formatBRL(worstDay) }}</p>
          </li>
          <li>
            <p class="wp8r-cs-label">Sharpe</p>
            <p v-if="loading" class="wp8r-cs-val"><span class="wp8r-skel wp8r-skel-kpi" /></p>
            <p v-else class="wp8r-cs-val">{{ sharpe.toFixed(2) }}</p>
          </li>
        </ul>
      </template>
    </CalcUiShell>

    <!-- ============ Sections below the shell ============
         Rail completo renderiza durante loading (com skeletons) E quando
         user esta autenticado E tem conexao Pluggy. Quando empty state
         (sem auth ou sem connection apos loading), nao mostra rail. -->
    <section v-if="loading || (isAuthed && hasConnection)" class="wp8r-rail">

      <!-- ESTATÍSTICAS detalhadas (grid editorial) -->
      <section class="wp8r-section">
        <header class="wp8r-head">
          <div>
            <p class="calc-eyebrow">Estatísticas · {{ mode === 'swing' ? 'swing 12m' : 'day trade 7d' }}</p>
            <h2 class="wp8r-h2">Performance <em class="calc-italic">detalhada.</em></h2>
          </div>
          <p v-if="loading" class="wp8r-head-meta"><span class="wp8r-skel wp8r-skel-text-sm" /></p>
          <p v-else class="wp8r-head-meta">Calculado sobre {{ active.totalTrades }} operações fechadas</p>
        </header>

        <ul class="wp8r-stats-grid">
          <li class="wp8r-stat">
            <p v-if="loading" class="wp8r-stat-val"><span class="wp8r-skel wp8r-skel-kpi" /></p>
            <p v-else class="wp8r-stat-val pos">+{{ formatBRL(active.avgWin) }}</p>
            <p class="wp8r-stat-label">Média de win</p>
            <span class="wp8r-stat-bar"><span class="wp8r-stat-fill pos" :style="{ width: '70%' }" /></span>
          </li>
          <li class="wp8r-stat">
            <p v-if="loading" class="wp8r-stat-val"><span class="wp8r-skel wp8r-skel-kpi" /></p>
            <p v-else class="wp8r-stat-val neg">{{ formatBRL(active.avgLoss) }}</p>
            <p class="wp8r-stat-label">Média de loss</p>
            <span class="wp8r-stat-bar"><span class="wp8r-stat-fill neg" :style="{ width: '35%' }" /></span>
          </li>
          <li class="wp8r-stat">
            <p v-if="loading" class="wp8r-stat-val"><span class="wp8r-skel wp8r-skel-kpi" /></p>
            <p v-else class="wp8r-stat-val">{{ rrRatio }}</p>
            <p class="wp8r-stat-label">Risk/reward</p>
            <span class="wp8r-stat-bar"><span class="wp8r-stat-fill neutral" :style="{ width: `${Math.min(Number(rrRatio) * 25, 100)}%` }" /></span>
          </li>
          <li class="wp8r-stat">
            <p v-if="loading" class="wp8r-stat-val"><span class="wp8r-skel wp8r-skel-kpi" /></p>
            <p v-else class="wp8r-stat-val pos">+{{ formatBRL(active.bestTrade) }}</p>
            <p class="wp8r-stat-label">Maior win</p>
            <span class="wp8r-stat-bar"><span class="wp8r-stat-fill pos" :style="{ width: '90%' }" /></span>
          </li>
          <li class="wp8r-stat">
            <p v-if="loading" class="wp8r-stat-val"><span class="wp8r-skel wp8r-skel-kpi" /></p>
            <p v-else class="wp8r-stat-val neg">{{ formatBRL(active.worstTrade) }}</p>
            <p class="wp8r-stat-label">Maior loss</p>
            <span class="wp8r-stat-bar"><span class="wp8r-stat-fill neg" :style="{ width: '45%' }" /></span>
          </li>
          <li class="wp8r-stat">
            <p v-if="loading" class="wp8r-stat-val"><span class="wp8r-skel wp8r-skel-kpi" /></p>
            <p v-else class="wp8r-stat-val">{{ longestWinStreak }}</p>
            <p class="wp8r-stat-label">Maior streak</p>
            <span class="wp8r-stat-bar"><span class="wp8r-stat-fill pos" :style="{ width: `${Math.min(longestWinStreak * 15, 100)}%` }" /></span>
          </li>
          <li class="wp8r-stat">
            <p v-if="loading" class="wp8r-stat-val"><span class="wp8r-skel wp8r-skel-kpi" /></p>
            <p v-else class="wp8r-stat-val">{{ active.profitFactor.toFixed(1) }}</p>
            <p class="wp8r-stat-label">Profit factor</p>
            <span class="wp8r-stat-bar"><span class="wp8r-stat-fill pos" :style="{ width: `${Math.min(active.profitFactor * 25, 100)}%` }" /></span>
          </li>
          <li class="wp8r-stat">
            <p v-if="loading" class="wp8r-stat-val"><span class="wp8r-skel wp8r-skel-kpi" /></p>
            <p v-else class="wp8r-stat-val">{{ sharpe.toFixed(2) }}</p>
            <p class="wp8r-stat-label">Sharpe</p>
            <span class="wp8r-stat-bar"><span class="wp8r-stat-fill neutral" :style="{ width: `${Math.min(sharpe * 30, 100)}%` }" /></span>
          </li>
        </ul>
      </section>

      <!-- HEATMAP (calendar 6m for swing, week heatmap for day) -->
      <section class="wp8r-section wp8r-section--padded">
        <header class="wp8r-head">
          <div>
            <p class="calc-eyebrow">Heatmap · {{ mode === 'swing' ? '6 meses' : 'semana padrão' }}</p>
            <h2 class="wp8r-h2">{{ mode === 'swing' ? 'Calendário' : 'Performance por horário' }} <em class="calc-italic">de P&L.</em></h2>
          </div>
          <p v-if="loading" class="wp8r-head-meta"><span class="wp8r-skel wp8r-skel-text-sm" /></p>
          <p v-else class="wp8r-head-meta">
            {{ greenDaysCount }} dias verdes · {{ redDaysCount }} dias vermelhos · passe o mouse para detalhes
          </p>
        </header>

        <!-- Loading skeleton: bloco de cells fake -->
        <div v-if="loading" class="wp8r-skel wp8r-skel-heatmap" />

        <!-- SWING: calendar 6m -->
        <div v-else-if="mode === 'swing'" class="wp8r-cal">
          <div v-for="(month, mi) in heatmap6mGrouped" :key="mi" class="wp8r-cal-mo">
            <p class="wp8r-cal-mo-label">{{ month.label }}</p>
            <div class="wp8r-cal-grid">
              <button
                v-for="(cell, ci) in month.cells"
                :key="ci"
                type="button"
                :class="['wp8r-hm-cell', 'wp8r-cellable', heatmapLevel(cell.pnl)]"
                :data-tip-main="`${formatCellDate(cell.date)} · ${cell.pnl >= 0 ? '+' : ''}R$ ${Math.abs(cell.pnl).toLocaleString('pt-BR')}`"
                @click="openCellDetail(cell)"
              />
            </div>
          </div>
        </div>

        <!-- DAY: week heatmap -->
        <div v-else class="wp8r-week">
          <table class="wp8r-week-grid">
            <thead>
              <tr>
                <th></th>
                <th v-for="d in weekHeatmap" :key="d.day">{{ d.day }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(hour, hi) in weekHeatmap[0].cells" :key="hi">
                <th>{{ hour.hour }}</th>
                <td v-for="(d, di) in weekHeatmap" :key="di"
                  :class="['wp8r-cellable', heatmapLevel(weekHeatmap[di].cells[hi].pnl)]"
                  :data-tip-main="`${d.day} ${weekHeatmap[di].cells[hi].hour} · ${weekHeatmap[di].cells[hi].pnl >= 0 ? '+' : ''}R$ ${Math.abs(weekHeatmap[di].cells[hi].pnl).toLocaleString('pt-BR')}`"
                  @click="openHourDetail(d, weekHeatmap[di].cells[hi])"
                >
                  {{ weekHeatmap[di].cells[hi].pnl > 100 ? '+' : weekHeatmap[di].cells[hi].pnl < -50 ? '-' : '' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Legenda integrada como footer -->
        <footer class="wp8r-hm-foot">
          <ul class="wp8r-hm-legend">
            <li><span class="wp8r-hm-sq lvl-neg" /> Loss</li>
            <li><span class="wp8r-hm-sq lvl-flat" /> Neutro</li>
            <li><span class="wp8r-hm-sq lvl-pos1" /> Win sutil</li>
            <li><span class="wp8r-hm-sq lvl-pos2" /> Win moderado</li>
            <li><span class="wp8r-hm-sq lvl-pos3" /> Win forte</li>
          </ul>
        </footer>
      </section>

      <!-- TRADES TABLE (colapsável por período) -->
      <section class="wp8r-section wp8r-section--historico">
        <header class="wp8r-head">
          <div>
            <p class="calc-eyebrow">
              <template v-if="loading">Operações fechadas · <span class="wp8r-skel wp8r-skel-chip" /> trades</template>
              <template v-else>Operações fechadas · {{ activeTrades.length }} trades</template>
            </p>
            <h2 class="wp8r-h2">Histórico <em class="calc-italic">completo.</em></h2>
          </div>
          <div class="wp8-head-actions">
            <button v-if="!loading" type="button" class="wp8-head-link wp8-head-link--ghost" @click="toggleAllPeriods">
              {{ allPeriodsOpen ? 'Recolher tudo' : 'Expandir tudo' }}
              <UIcon :name="allPeriodsOpen ? 'i-lucide-chevrons-up' : 'i-lucide-chevrons-down'" class="size-3.5" />
            </button>
          </div>
        </header>

        <!-- Loading: 3 skeleton rows -->
        <div v-if="loading" class="wp8r-trade-groups">
          <article v-for="i in 3" :key="`tg-skel-${i}`" class="wp8r-tg">
            <div class="wp8r-tg-head" style="cursor: default;">
              <div class="wp8r-tg-left">
                <span class="wp8r-skel wp8r-skel-text-sm" style="width: 120px;" />
                <span class="wp8r-skel wp8r-skel-chip" style="width: 60px;" />
              </div>
              <div class="wp8r-tg-right">
                <span class="wp8r-skel wp8r-skel-kpi" style="width: 80px;" />
                <span class="wp8r-skel wp8r-skel-kpi" style="width: 60px;" />
              </div>
            </div>
          </article>
        </div>

        <!-- Loaded: tabela real (com possivel empty-inline state) -->
        <div v-else-if="tradeGroups.length === 0" class="wp8r-trade-empty">
          <UIcon name="i-lucide-inbox" class="size-6 wp8r-trade-empty-icon" />
          <p class="wp8r-trade-empty-h">Sem operações no período</p>
          <p class="wp8r-trade-empty-sub">
            {{ mode === 'swing' ? 'Nenhuma operação swing fechada nos últimos 12 meses.' : 'Nenhuma operação day trade nos últimos 7 dias.' }}
          </p>
        </div>

        <div v-else class="wp8r-trade-groups">
          <article v-for="group in tradeGroups" :key="group.key" class="wp8r-tg">
            <button type="button" class="wp8r-tg-head" @click="togglePeriod(group.key)">
              <div class="wp8r-tg-left">
                <UIcon name="i-lucide-chevron-right" :class="['wp8r-tg-chev', { 'is-open': expandedPeriods.has(group.key) }]" />
                <span class="wp8r-tg-period">{{ group.label }}</span>
                <span class="wp8r-tg-count">{{ group.trades.length }} {{ group.trades.length === 1 ? 'trade' : 'trades' }}</span>
              </div>
              <div class="wp8r-tg-right">
                <span class="wp8r-tg-stat">
                  <span class="wp8r-tg-stat-eb">Win rate</span>
                  <span class="wp8r-tg-stat-val">{{ Math.round(group.winRate) }}%</span>
                </span>
                <span class="wp8r-tg-stat">
                  <span class="wp8r-tg-stat-eb">P&L</span>
                  <span :class="['wp8r-tg-stat-val', group.totalPnl >= 0 ? 'pos' : 'neg']">
                    {{ group.totalPnl >= 0 ? '+' : '' }}{{ formatBRL(group.totalPnl) }}
                  </span>
                </span>
              </div>
            </button>

            <div v-show="expandedPeriods.has(group.key)" class="wp8r-tg-body">
              <div class="wp8r-table-wrap">
                <table class="wp8r-table">
                  <thead>
                    <tr>
                      <th class="left">Data</th>
                      <th class="left">Ticker</th>
                      <th>Qtd</th>
                      <th>Preço</th>
                      <th>Volume</th>
                      <th v-if="mode === 'day'">Janela</th>
                      <th>P&L</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="t in group.trades" :key="t.id">
                      <td class="left muted">{{ formatTradeDate(t.date) }}</td>
                      <td class="left strong">
                        <span class="ticker-cell">
                          <img
                            :src="`https://icons.brapi.dev/icons/${t.ticker.toUpperCase()}.svg`"
                            :alt="t.ticker"
                            class="ticker-logo"
                            @error="($event.target as HTMLImageElement).style.display = 'none'"
                          />
                          <span>{{ t.ticker }}</span>
                        </span>
                      </td>
                      <td>{{ t.qty }}</td>
                      <td>{{ formatBRL(t.price) }}</td>
                      <td class="muted">{{ formatBRL(t.volume) }}</td>
                      <td v-if="mode === 'day'" class="muted">{{ t.enterTime }}–{{ t.exitTime }}</td>
                      <td :class="(t.result ?? 0) >= 0 ? 'positive' : 'negative'">
                        {{ (t.result ?? 0) >= 0 ? '+' : '' }}{{ formatBRL(t.result ?? 0) }}
                      </td>
                      <td :class="(t.result ?? 0) >= 0 ? 'positive' : 'negative'">
                        {{ formatPct(((t.result ?? 0) / t.volume) * 100) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- INSIGHTS -->
      <!-- TODO: insights ainda usam texto hardcoded (VALE3, PETR4, Energia).
           Quando backend expor analise IA por trade (correlacao setor/horario),
           trocar pra dinamico. Por enquanto mantemos como placeholder. -->
      <section class="wp8r-section">
        <header class="wp8r-head">
          <div>
            <p class="calc-eyebrow">Análise IA · 3 insights</p>
            <h2 class="wp8r-h2">O que os números <em class="calc-italic">dizem.</em></h2>
          </div>
        </header>

        <div v-if="loading" class="wp8r-insights">
          <article v-for="i in 3" :key="`ins-skel-${i}`" class="wp8r-ins">
            <p class="wp8r-ins-tag"><span class="wp8r-skel wp8r-skel-chip" /></p>
            <h4 class="wp8r-ins-h"><span class="wp8r-skel wp8r-skel-text-sm" /></h4>
            <p class="wp8r-ins-note"><span class="wp8r-skel wp8r-skel-text-sm" style="width: 80%;" /></p>
          </article>
        </div>

        <div v-else class="wp8r-insights">
          <article class="wp8r-ins">
            <p class="wp8r-ins-tag pos">Maior força</p>
            <h4 class="wp8r-ins-h">Sua média de win é <strong>{{ active.avgLoss ? (active.avgWin / Math.abs(active.avgLoss)).toFixed(1) : '—' }}x</strong> maior que a média de loss</h4>
            <p class="wp8r-ins-note">
              Risk/reward de {{ rrRatio }}:1, você arrisca pouco pra ganhar muito. Mantenha o stop curto.
            </p>
          </article>

          <article class="wp8r-ins">
            <p class="wp8r-ins-tag neutral">Atenção</p>
            <h4 class="wp8r-ins-h">{{ mode === 'swing' ? 'Posição em VALE3 foi seu único trade negativo' : 'Performance cai depois das 14h' }}</h4>
            <p class="wp8r-ins-note">
              {{ mode === 'swing' ? 'Mineração e ciclos de commodities são mais voláteis. Reduza tamanho ou use ordens stop-loss mais apertadas.' : 'Considere fechar operações até 13h e evitar entradas no fim do pregão.' }}
            </p>
          </article>

          <article class="wp8r-ins">
            <p class="wp8r-ins-tag accent">Oportunidade</p>
            <h4 class="wp8r-ins-h">{{ mode === 'swing' ? 'Setor de Energia (TAEE11, CPLE6) tem 100% de win rate' : 'PETR4 te deu 4 wins em 5 trades' }}</h4>
            <p class="wp8r-ins-note">
              {{ mode === 'swing' ? 'Considere aumentar exposição em utilities. Setor previsível com bons retornos.' : 'Seu setup em PETR4 tá afiado. Continue replicando o padrão.' }}
            </p>
          </article>
        </div>
      </section>
    </section>

    <!-- MODAL · detalhes da célula (transações do dia) -->
    <Teleport to="body">
      <Transition name="wp8r-modal-fade">
        <div v-if="activeCellDetail" class="wp8r-modal-overlay" @click="closeCellDetail">
          <article class="wp8r-modal" @click.stop>
            <header class="wp8r-modal-head">
              <div>
                <p class="calc-eyebrow">{{ activeCellDetail.eyebrow }}</p>
                <h3 class="wp8r-modal-h">
                  <span :class="activeCellDetail.pnl >= 0 ? 'pos' : 'neg'">
                    {{ activeCellDetail.pnl >= 0 ? '+' : '' }}{{ formatBRL(activeCellDetail.pnl) }}
                  </span>&nbsp;<em class="calc-italic">no dia.</em>
                </h3>
              </div>
              <button type="button" class="wp8r-modal-close" @click="closeCellDetail" aria-label="Fechar">
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </header>

            <!-- KPIs do dia -->
            <dl class="wp8r-modal-kpis">
              <div>
                <dt>Operações</dt>
                <dd>{{ cellTrades.length }}</dd>
              </div>
              <div>
                <dt>Win rate</dt>
                <dd>{{ cellWinRate }}%</dd>
              </div>
              <div>
                <dt>Volume</dt>
                <dd>{{ formatBRL(cellVolume, { compact: true }) }}</dd>
              </div>
            </dl>

            <!-- Trades do dia -->
            <div v-if="cellTrades.length > 0" class="wp8r-modal-body">
              <p class="calc-result-eyebrow" style="margin-bottom: 16px;">Operações fechadas</p>
              <ul class="wp8r-modal-trades">
                <li v-for="t in cellTrades" :key="t.id" class="wp8r-modal-trade">
                  <span class="wp8r-modal-trade-dot" :class="(t.result ?? 0) >= 0 ? 'pos' : 'neg'" />
                  <div class="wp8r-modal-trade-body">
                    <p class="wp8r-modal-trade-tk">{{ t.ticker }}</p>
                    <p class="wp8r-modal-trade-meta">
                      {{ t.qty }} {{ t.qty === 1 ? 'cota' : 'cotas' }} · {{ formatBRL(t.price) }}
                      <span v-if="t.enterTime"> · {{ t.enterTime }}–{{ t.exitTime }}</span>
                    </p>
                  </div>
                  <p :class="['wp8r-modal-trade-pnl', (t.result ?? 0) >= 0 ? 'pos' : 'neg']">
                    {{ (t.result ?? 0) >= 0 ? '+' : '' }}{{ formatBRL(t.result ?? 0) }}
                  </p>
                </li>
              </ul>
            </div>

            <!-- Empty state -->
            <div v-else class="wp8r-modal-empty">
              <UIcon name="i-lucide-inbox" class="size-6 wp8r-modal-empty-icon" />
              <p class="wp8r-modal-empty-h">Sem operações fechadas neste {{ activeCellDetail.kind === 'cell' ? 'dia' : 'horário' }}</p>
              <p class="wp8r-modal-empty-sub">
                O P&L de {{ activeCellDetail.pnl >= 0 ? '+' : '' }}{{ formatBRL(activeCellDetail.pnl) }} vem da variação dos ativos em carteira, sem trade fechado.
              </p>
            </div>

            <footer class="wp8r-modal-foot">
              <button type="button" class="wp8-head-link wp8-head-link--ghost" @click="closeCellDetail">
                Fechar
              </button>
            </footer>
          </article>
        </div>
      </Transition>
    </Teleport>
  </NuxtLayout>
</template>

<script setup lang="ts">
/**
 * Resultado — versao com dados reais.
 *
 * Services:
 *   - usePortfolioTradesService().listTrades('all') → trades pareados
 *     via FIFO (kind, resultAmount, ticker, quantity, openPrice,
 *     closePrice, openedAt, closedAt, volume).
 *   - usePortfolioTradesService().getEquityCurve() → curva equity
 *     diaria (mark-to-market).
 *   - usePluggyService().listConnections() → checa se user tem Open
 *     Finance ativo (gate pro empty state).
 *
 * Toggle de modo (swing/day) usa useResultMode() compartilhado.
 * Mapping: 'swing' ↔ 'carteira', 'day' ↔ 'day-trade'.
 *
 * Skeletons cobrem o intervalo entre `loading=true` (mount inicial) e
 * dados chegando. Empty state quando user nao tem auth ou conexao.
 */
import type { MockTrade } from '~/composables/useMockTrades'
import type { PluggyConnection } from '~/services/pluggy'
import type { EquityCurvePoint } from '~/services/portfolioTrades'

// =================== SERVICES ===================
const tradesService = usePortfolioTradesService()
const pluggy = usePluggyService()
const authStore = useAuthStore()
const { mode: resultMode, setMode, hydrate } = useResultMode()

// =================== STATE ===================
const loading = ref(true)
const hasConnection = ref(false)
const tradesReal = ref<MockTrade[]>([])
const equityCurveReal = ref<number[]>([])
const equityCurveDates = ref<string[]>([])
const isAuthed = computed(() => !!authStore.token)

const today = '30 abr 2026' // TODO: backend deveria expor data do ultimo trade fechado
const lastUpdated = '30 abr 2026 · 16:42' // TODO: idem — derivar do meta.to dos trades

// =================== MODE (toggle) ===================
// Template usa 'swing' | 'day'. useResultMode usa 'carteira' | 'day-trade'.
// Mapping bidirecional.
const mode = computed<'swing' | 'day'>(() =>
  resultMode.value === 'day-trade' ? 'day' : 'swing',
)
function setModeLocal(next: 'swing' | 'day') {
  setMode(next === 'day' ? 'day-trade' : 'carteira')
}

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

// =================== MAP MockTrade -> shape do template ===================
// Shape `AdaptedTrade` interno (date/qty/price/volume/result/style/
// enterTime/exitTime). MockTrade do backend tem campos equivalentes mas
// com nomes diferentes — mapeamos no `tradesAdapted` computed abaixo.
interface AdaptedTrade {
  id: string
  date: string          // YYYY-MM-DD (de closedAt ou openedAt)
  ticker: string
  qty: number
  price: number          // closePrice ?? openPrice
  volume: number
  result?: number        // resultAmount ?? undefined
  style: 'day' | 'swing' | 'hold'
  enterTime?: string     // HH:mm de openedAt
  exitTime?: string      // HH:mm de closedAt
}

function isoToDate(iso: string): string {
  return iso.slice(0, 10)
}
function isoToTime(iso: string): string {
  // ISO → HH:mm. Defensivo pra parses estranhos.
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return d.toTimeString().slice(0, 5)
  } catch {
    return ''
  }
}

const tradesAdapted = computed<AdaptedTrade[]>(() => {
  return tradesReal.value.map((t) => {
    const closedIso = t.closedAt ?? t.openedAt
    return {
      id: t.id,
      date: isoToDate(closedIso),
      ticker: t.ticker,
      qty: t.quantity,
      price: t.closePrice ?? t.openPrice,
      volume: t.volume,
      result: t.resultAmount ?? undefined,
      style: t.kind,
      enterTime: t.kind === 'day' ? isoToTime(t.openedAt) : undefined,
      exitTime: t.kind === 'day' && t.closedAt ? isoToTime(t.closedAt) : undefined,
    }
  })
})

// =================== STATS COMPUTED ===================
// Filtra trades por estilo (swing vs day) e calcula stats agregados via
// reduce/filter. Substitui swingStats/dayTradeStats hardcoded do mock.
const activeTrades = computed<AdaptedTrade[]>(() =>
  tradesAdapted.value.filter(t => mode.value === 'swing' ? t.style === 'swing' : t.style === 'day'),
)

const swingStatsReal = computed(() => computeStats(tradesAdapted.value.filter(t => t.style === 'swing')))
const dayTradeStatsReal = computed(() => computeStats(tradesAdapted.value.filter(t => t.style === 'day')))

function computeStats(items: AdaptedTrade[]) {
  const closed = items.filter(t => Number.isFinite(t.result))
  const wins = closed.filter(t => (t.result ?? 0) > 0)
  const losses = closed.filter(t => (t.result ?? 0) < 0)
  const winsSum = wins.reduce((a, t) => a + (t.result ?? 0), 0)
  const lossesSum = losses.reduce((a, t) => a + (t.result ?? 0), 0)
  const totalPnl = winsSum + lossesSum
  const totalTrades = closed.length
  const winRate = totalTrades ? Math.round((wins.length / totalTrades) * 100) : 0
  const profitFactor = lossesSum !== 0 ? Math.abs(winsSum / lossesSum) : (winsSum > 0 ? winsSum : 0)
  const avgWin = wins.length ? winsSum / wins.length : 0
  const avgLoss = losses.length ? lossesSum / losses.length : 0
  const bestTrade = wins.length ? Math.max(...wins.map(t => t.result ?? 0)) : 0
  const worstTrade = losses.length ? Math.min(...losses.map(t => t.result ?? 0)) : 0
  return { totalPnl, winRate, profitFactor, avgWin, avgLoss, bestTrade, worstTrade, totalTrades }
}

const active = computed(() => mode.value === 'swing' ? swingStatsReal.value : dayTradeStatsReal.value)

const winCount = computed(() => activeTrades.value.filter(t => (t.result ?? 0) > 0).length)
const lossCount = computed(() => activeTrades.value.filter(t => (t.result ?? 0) < 0).length)
const winsValue = computed(() => activeTrades.value.filter(t => (t.result ?? 0) > 0).reduce((a, t) => a + (t.result ?? 0), 0))
const lossesValue = computed(() => activeTrades.value.filter(t => (t.result ?? 0) < 0).reduce((a, t) => a + (t.result ?? 0), 0))
const rrRatio = computed(() => {
  const al = Math.abs(active.value.avgLoss)
  if (!al) return '—'
  return (active.value.avgWin / al).toFixed(2)
})

const longestWinStreak = computed(() => {
  const sorted = [...activeTrades.value].sort((a, b) => a.date.localeCompare(b.date))
  let max = 0, cur = 0
  for (const t of sorted) {
    if ((t.result ?? 0) > 0) { cur++; max = Math.max(max, cur) }
    else cur = 0
  }
  return max
})

// =================== EQUITY CURVE ===================
// Equity curve real vem do endpoint /portfolio/equity-curve (mark-to-
// market diario). Pega ate ~90 ultimos pontos pra bater com o shape do
// chart. Fallback: deriva uma curva acumulada do P&L dos trades quando
// equityCurveReal nao chegou ainda.
const cumulativeCurve = computed(() => {
  // Se tem equity curve real, usa
  if (equityCurveReal.value.length > 0) {
    const last90 = equityCurveReal.value.slice(-90)
    // Normaliza pra comecar em 0 (P&L acumulado relativo ao primeiro ponto)
    const base = last90[0] ?? 0
    return last90.map(v => v - base)
  }
  // Fallback: deriva do P&L acumulado dos trades
  const sorted = [...activeTrades.value].sort((a, b) => a.date.localeCompare(b.date))
  let cum = 0
  const arr: number[] = [0]
  for (const t of sorted) {
    cum += t.result ?? 0
    arr.push(cum)
  }
  return arr
})

// Datas alinhadas com cumulativeCurve (mesmo length, mesmo idx).
const cumulativeCurveDates = computed(() => {
  if (equityCurveReal.value.length > 0) {
    return equityCurveDates.value.slice(-90)
  }
  // Fallback path: gera dates dos trades + 1 entrada inicial pro baseline 0.
  const sorted = [...activeTrades.value].sort((a, b) => a.date.localeCompare(b.date))
  if (!sorted.length) return [] as string[]
  return [sorted[0]!.date, ...sorted.map(t => t.date)]
})

// Hover state + handlers pro tooltip do chart de P&L.
const chartHoverIdx = ref<number | null>(null)
const chartSvgRef = ref<SVGSVGElement | null>(null)

function onChartMouseMove(e: MouseEvent) {
  const svg = chartSvgRef.value
  if (!svg) return
  const n = cumulativeCurve.value.length
  if (!n) return
  const rect = svg.getBoundingClientRect()
  const xRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  chartHoverIdx.value = Math.round(xRatio * (n - 1))
}
function onChartMouseLeave() {
  chartHoverIdx.value = null
}

// Coords do ponto ativo em SVG-space (viewBox 800x240).
const chartHoverPoint = computed(() => {
  if (chartHoverIdx.value === null) return null
  const arr = cumulativeCurve.value
  if (!arr.length) return null
  const idx = chartHoverIdx.value
  const min = Math.min(...arr, 0)
  const max = Math.max(...arr, 0)
  const range = max - min || 1
  const v = arr[idx] ?? 0
  const x = (idx / Math.max(1, arr.length - 1)) * 800
  const y = 240 - ((v - min) / range) * 240 * 0.92 - 240 * 0.04
  return { x, y, value: v, date: cumulativeCurveDates.value[idx] ?? '' }
})

function formatChartDate(iso: string) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`
}

const curveColor = computed(() => active.value.totalPnl >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)')
const zeroY = computed(() => {
  const arr = cumulativeCurve.value
  const min = Math.min(...arr, 0)
  const max = Math.max(...arr, 0)
  const range = max - min || 1
  return 240 - ((0 - min) / range) * 240 * 0.92 - 240 * 0.04
})

const maxDrawdown = computed(() => {
  const arr = cumulativeCurve.value
  let peak = arr[0] ?? 0
  let maxDD = 0
  for (const v of arr) {
    if (v > peak) peak = v
    const dd = peak ? ((v - peak) / Math.abs(peak)) * 100 : 0
    if (dd < maxDD) maxDD = dd
  }
  return maxDD
})

const bestDay = computed(() => activeTrades.value.length ? Math.max(...activeTrades.value.map(t => t.result ?? 0), 0) : 0)
const worstDay = computed(() => activeTrades.value.length ? Math.min(...activeTrades.value.map(t => t.result ?? 0), 0) : 0)
const sharpe = computed(() => {
  const vals = activeTrades.value.map(t => t.result ?? 0)
  if (!vals.length) return 0
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length
  const std = Math.sqrt(vals.reduce((a, b) => a + (b - avg) ** 2, 0) / vals.length) || 1
  return avg / std
})

// =================== HEATMAP (derivado de trades reais) ===================
// Backend nao expoe heatmap dia-a-dia direto. Agregamos do tradesAdapted:
//   - swing: por dia (YYYY-MM-DD), sum dos result. Janela 180 dias (6m).
//   - day: por dia-da-semana + hora aproximada do enterTime.
type HeatmapCell = { date: string; pnl: number; isWeekend: boolean }

const heatmap6m = computed<HeatmapCell[]>(() => {
  // Mapa de date → sum(result) somente trades swing
  const byDate: Record<string, number> = {}
  for (const t of tradesAdapted.value) {
    if (t.style !== 'swing') continue
    if (!Number.isFinite(t.result)) continue
    byDate[t.date] = (byDate[t.date] || 0) + (t.result ?? 0)
  }
  // Gera grid 180 dias atras
  const cells: HeatmapCell[] = []
  const today = new Date()
  for (let i = 180; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    const dateStr = d.toISOString().slice(0, 10)
    cells.push({
      date: dateStr,
      pnl: byDate[dateStr] || 0,
      isWeekend,
    })
  }
  return cells
})

const weekHeatmap = computed(() => {
  // 5 dias (Seg-Sex) × 8 horas (9h-16h). Agrega day-trades por
  // dayOfWeek + hora do enterTime.
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
  const hours = ['09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h']
  // Mapa dayIdx + hourIdx → sum
  const buckets: number[][] = days.map(() => hours.map(() => 0))
  for (const t of tradesAdapted.value) {
    if (t.style !== 'day') continue
    if (!Number.isFinite(t.result)) continue
    if (!t.enterTime) continue
    const dayDate = new Date(t.date + 'T00:00:00')
    const dow = dayDate.getDay() // 0=dom, 1=seg...
    if (dow < 1 || dow > 5) continue
    const dayIdx = dow - 1
    const hour = parseInt(t.enterTime.split(':')[0] || '0', 10)
    if (hour < 9 || hour > 16) continue
    const hourIdx = hour - 9
    buckets[dayIdx][hourIdx] += t.result ?? 0
  }
  return days.map((day, di) => ({
    day,
    cells: hours.map((hour, hi) => ({ hour, pnl: buckets[di][hi] })),
  }))
})

// Heatmap helpers
function heatmapLevel(pnl: number) {
  if (pnl < -50) return 'lvl-neg'
  if (pnl < 30) return 'lvl-flat'
  if (pnl < 100) return 'lvl-pos1'
  if (pnl < 250) return 'lvl-pos2'
  return 'lvl-pos3'
}

function formatCellDate(d: string) {
  const [, m, day] = d.split('-')
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${Number(day)} ${months[Number(m) - 1]}`
}

const greenDaysCount = computed(() => {
  if (mode.value === 'swing') {
    return heatmap6m.value.filter(c => !c.isWeekend && c.pnl > 30).length
  }
  return weekHeatmap.value.reduce((a, d) => a + d.cells.filter(c => c.pnl > 30).length, 0)
})

const redDaysCount = computed(() => {
  if (mode.value === 'swing') {
    return heatmap6m.value.filter(c => !c.isWeekend && c.pnl < -50).length
  }
  return weekHeatmap.value.reduce((a, d) => a + d.cells.filter(c => c.pnl < -50).length, 0)
})

const heatmap6mGrouped = computed(() => {
  // Gera labels dos ultimos 6 meses a partir da data atual (mais recente
  // à direita). Substitui a label hardcoded ['NOV','DEZ','JAN',...] do
  // mock por algo deterministico.
  const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
  const cells = heatmap6m.value
  const months: { label: string; cells: { date: string; pnl: number }[] }[] = []
  // Agrupa por YYYY-MM
  const byMonth: Record<string, { date: string; pnl: number }[]> = {}
  for (const c of cells) {
    if (c.isWeekend) continue
    const key = c.date.slice(0, 7) // YYYY-MM
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push({ date: c.date, pnl: c.pnl })
  }
  const sortedKeys = Object.keys(byMonth).sort()
  for (const k of sortedKeys) {
    const monthIdx = parseInt(k.split('-')[1] || '1', 10) - 1
    months.push({ label: monthNames[monthIdx] || k, cells: byMonth[k] })
  }
  // Mantem ate 6 ultimos (caso menos meses no dataset, mostra menos)
  return months.slice(-6)
})

/* ===== MODAL: detalhes do dia / horário ===== */
type ActiveCellDetail = { kind: 'cell'; date: string; pnl: number; eyebrow: string } | { kind: 'hour'; day: string; hour: string; pnl: number; eyebrow: string }
const activeCellDetail = ref<ActiveCellDetail | null>(null)

function openCellDetail(cell: { date: string; pnl: number }) {
  activeCellDetail.value = {
    kind: 'cell',
    date: cell.date,
    pnl: cell.pnl,
    eyebrow: `Detalhe do dia · ${formatCellDate(cell.date)}`,
  }
  if (typeof document !== 'undefined') document.body.style.overflow = 'hidden'
}

function openHourDetail(d: { day: string }, cell: { hour: string; pnl: number }) {
  activeCellDetail.value = {
    kind: 'hour',
    day: d.day,
    hour: cell.hour,
    pnl: cell.pnl,
    eyebrow: `Detalhe · ${d.day} às ${cell.hour}`,
  }
  if (typeof document !== 'undefined') document.body.style.overflow = 'hidden'
}

function closeCellDetail() {
  activeCellDetail.value = null
  if (typeof document !== 'undefined') document.body.style.overflow = ''
}

const cellTrades = computed<AdaptedTrade[]>(() => {
  const detail = activeCellDetail.value
  if (!detail) return []
  if (detail.kind === 'cell') {
    return tradesAdapted.value.filter(t => t.date === detail.date)
  }
  // hour mode: filter by day-of-week + hour range
  const dayMap: Record<string, number> = { Seg: 1, Ter: 2, Qua: 3, Qui: 4, Sex: 5 }
  const targetDay = dayMap[detail.day]
  const targetHour = parseInt(detail.hour)
  return tradesAdapted.value.filter(t => {
    const date = new Date(t.date + 'T00:00:00')
    if (date.getDay() !== targetDay) return false
    if (!t.enterTime) return false
    const hour = parseInt(t.enterTime.split(':')[0])
    return Math.abs(hour - targetHour) <= 1
  })
})

const cellWinRate = computed(() => {
  if (!cellTrades.value.length) return 0
  const wins = cellTrades.value.filter(t => (t.result ?? 0) > 0).length
  return Math.round((wins / cellTrades.value.length) * 100)
})

const cellVolume = computed(() => cellTrades.value.reduce((a, t) => a + t.volume, 0))

// Trade groups (colapsable) — by month for swing, by day for day-trade
const tradeGroups = computed(() => {
  const groups: Record<string, { key: string; label: string; trades: AdaptedTrade[]; totalPnl: number; winRate: number }> = {}
  for (const t of activeTrades.value) {
    const key = mode.value === 'swing' ? t.date.slice(0, 7) : t.date
    if (!groups[key]) {
      groups[key] = { key, label: formatGroupLabel(key), trades: [], totalPnl: 0, winRate: 0 }
    }
    groups[key].trades.push(t)
    groups[key].totalPnl += t.result ?? 0
  }
  for (const k in groups) {
    const wins = groups[k].trades.filter(t => (t.result ?? 0) > 0).length
    groups[k].winRate = (wins / groups[k].trades.length) * 100
  }
  return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key))
})

const expandedPeriods = ref<Set<string>>(new Set())

// Open the first group by default whenever mode changes
watch(tradeGroups, (g) => {
  if (g.length > 0) expandedPeriods.value = new Set([g[0].key])
}, { immediate: true })

function togglePeriod(key: string) {
  const next = new Set(expandedPeriods.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedPeriods.value = next
}

const allPeriodsOpen = computed(() => tradeGroups.value.every(g => expandedPeriods.value.has(g.key)))

function toggleAllPeriods() {
  if (allPeriodsOpen.value) {
    expandedPeriods.value = new Set()
  } else {
    expandedPeriods.value = new Set(tradeGroups.value.map(g => g.key))
  }
}

function formatGroupLabel(key: string) {
  if (mode.value === 'swing') {
    // key is YYYY-MM
    const [y, m] = key.split('-')
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${months[Number(m) - 1]} ${y}`
  }
  // key is YYYY-MM-DD
  const [, m, d] = key.split('-')
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${Number(d)} ${months[Number(m) - 1]}`
}

function formatTradeDate(d: string) {
  const [, m, day] = d.split('-')
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  return `${Number(day)} ${months[Number(m) - 1]}`
}

function curve(arr: number[], w: number, h: number) {
  if (!arr?.length) return ''
  const min = Math.min(...arr, 0)
  const max = Math.max(...arr, 0)
  const range = max - min || 1
  return arr.map((v, i) => {
    const x = (i / (arr.length - 1)) * w
    const y = h - ((v - min) / range) * h * 0.92 - h * 0.04
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

// =================== LOADERS ===================
async function loadAll() {
  // Guard: preview pode rodar sem auth — se nao tem token, pula
  // todas as queries (authFetch redirecionaria pra `/` em 401).
  // Resultado: skeleton breve -> empty state com CTA pra /integracoes.
  if (!authStore.token) return

  // Em paralelo: trades + connections. Cada um com catch defensivo.
  // Catch retorna shape compatible (data com array vazio) — meta nao
  // e usado neste page, entao stub minimalista.
  const [tradesResp, connections] = await Promise.all([
    tradesService.listTrades('all').catch((err) => {
      console.warn('[v8 resultado] listTrades failed', err)
      return {
        data: [] as MockTrade[],
        meta: {
          period: 'all',
          from: null,
          to: '',
          total_trades: 0,
          closed_trades: 0,
          open_trades: 0,
          income_entries: 0,
        },
      }
    }),
    pluggy.listConnections().catch((): PluggyConnection[] => []),
  ])

  // Map flexivel: backend canonical retorna `data`, mas mantemos
  // fallback pra `trades` caso a API evolua o naming. `?? []` final
  // protege em casos de catch (shape sem data).
  tradesReal.value = (tradesResp as { trades?: MockTrade[]; data?: MockTrade[] }).trades
    ?? tradesResp.data
    ?? []
  hasConnection.value = connections.length > 0

  // Equity curve em paralelo (nao bloqueante)
  void tradesService.getEquityCurve()
    .then((resp) => {
      const points = resp.data ?? []
      equityCurveReal.value = points.map((p: EquityCurvePoint) => p.equity)
      equityCurveDates.value = points.map((p: EquityCurvePoint) => p.date)
    })
    .catch(() => {
      equityCurveReal.value = []
      equityCurveDates.value = []
    })
}

// ESC fecha o modal
onMounted(async () => {
  hydrate()
  loading.value = true
  try {
    await loadAll()
  } finally {
    loading.value = false
  }

  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && activeCellDetail.value) closeCellDetail()
  }
  window.addEventListener('keydown', handler)
  onUnmounted(() => window.removeEventListener('keydown', handler))
})
</script>

<style scoped>
/* ============= SKELETONS ============= */
/* Usados enquanto loading=true. Substituem qualquer valor textual ou
   bloco grande (donut, curva, snowflake) por uma barra com shimmer
   subtil. Mantém o layout estável durante o load. Mesma DNA do
   .wp8-skel-* do v8/index.vue, renomeado pra wp8r-skel-* (resultado). */
.wp8r-skel {
  display: inline-block;
  background: linear-gradient(
    90deg,
    var(--bg-overlay) 0%,
    color-mix(in srgb, var(--bg-overlay) 50%, transparent) 50%,
    var(--bg-overlay) 100%
  );
  background-size: 200% 100%;
  animation: wp8r-skel-shimmer 1.4s ease-in-out infinite;
  border-radius: 4px;
  vertical-align: middle;
}
@keyframes wp8r-skel-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.wp8r-skel-text-mega { display: block; height: 64px; width: 70%; }
.wp8r-skel-text-sm { display: inline-block; height: 12px; width: 40%; min-width: 80px; }
.wp8r-skel-kpi { display: inline-block; height: 28px; width: 80%; min-width: 60px; }
.wp8r-skel-chip { display: inline-block; height: 10px; width: 40px; }
.wp8r-skel-curve { display: block; width: 100%; height: 100%; min-height: 240px; border-radius: 6px; }
.wp8r-skel-snowflake { width: 100%; max-width: 320px; aspect-ratio: 1; border-radius: 50%; }
.wp8r-skel-heatmap { display: block; width: 100%; height: 240px; border-radius: 6px; margin-top: 24px; }

/* ============= EMPTY STATE (sem auth ou sem connection) ============= */
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

/* Reused button styles (espelhados do v8/index.vue) — dark-mode safe */
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

.wp8-highlights-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 18px 8px 8px;
  background: transparent;
  border: 1px solid var(--border-default);
  border-radius: 999px;
  color: var(--text-heading);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.005em;
  cursor: pointer;
  font-family: inherit;
  transition: all 200ms ease-out;
}
.wp8-highlights-btn :deep(*) { color: var(--text-heading); flex-shrink: 0; }
.wp8-highlights-btn:hover {
  border-color: var(--text-heading);
  transform: translateY(-1px);
}
.wp8-highlights-play {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 45%, transparent);
}
.wp8-highlights-play :deep(*) { color: var(--brand-primary); }

/* ============= TRADE EMPTY INLINE ============= */
.wp8r-trade-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  padding: 48px 24px;
  border-top: 1px solid var(--border-subtle);
}
.wp8r-trade-empty-icon { color: var(--text-muted); opacity: 0.5; margin-bottom: 4px; }
.wp8r-trade-empty-h { font-size: 15px; font-weight: 500; color: var(--text-heading); margin: 0; }
.wp8r-trade-empty-sub { font-size: 13px; color: var(--text-muted); margin: 0; max-width: 44ch; line-height: 1.55; }

/* ============= MODE TOGGLE ============= */
.wp8r-mode { display: inline-flex; gap: 6px; padding: 4px; margin: 28px 0 16px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 999px; }
.wp8r-mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: 0;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  font-family: inherit;
  transition: all 200ms;
}
.wp8r-mode-btn :deep(*) { color: var(--text-muted); flex-shrink: 0; }
.wp8r-mode-btn:hover { color: var(--text-heading); }
.wp8r-mode-btn:hover :deep(*) { color: var(--text-heading); }
/* Active: bg=--text-heading (flipa por modo), text=--bg-base (oposto do heading) */
.wp8r-mode-btn.is-active { background: var(--text-heading); color: var(--bg-base); box-shadow: 0 2px 8px -2px color-mix(in srgb, var(--text-heading) 30%, transparent); }
.wp8r-mode-btn.is-active :deep(*) { color: var(--bg-base); }
.wp8r-mode-cap { font-size: 11px; opacity: 0.6; font-weight: 400; }

/* ============= RESULT MEGA color overrides ============= */
.calc-result-mega.wp8r-mega-pos { color: var(--brand-positive); text-shadow: 0 8px 32px color-mix(in srgb, var(--brand-positive) 22%, transparent); }
.calc-result-mega.wp8r-mega-neg { color: var(--brand-negative); text-shadow: 0 8px 32px color-mix(in srgb, var(--brand-negative) 22%, transparent); }

/* ============= WIN/LOSS (form area) ============= */
.wp8r-wl-grid { display: grid; grid-template-columns: 140px 1fr; gap: 24px; align-items: center; }
@media (min-width: 1024px) { .wp8r-wl-grid { grid-template-columns: 160px 1fr; gap: 32px; } }
.wp8r-wl-donut { width: 100%; height: auto; }
.wp8r-wl-num { font-size: 28px; font-weight: 300; fill: var(--text-heading); font-variant-numeric: tabular-nums; }
.wp8r-wl-cap { font-size: 9px; fill: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }

.wp8r-wl-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; }
.wp8r-wl-list li { display: grid; grid-template-columns: 10px 1fr auto; gap: 12px; align-items: center; }
.wp8r-wl-dot { width: 10px; height: 10px; border-radius: 999px; }
.wp8r-wl-dot.pos { background: var(--brand-positive); }
.wp8r-wl-dot.neg { background: var(--brand-negative); }
.wp8r-wl-name { font-size: 14px; font-weight: 500; color: var(--text-heading); margin: 0; }
.wp8r-wl-sub { font-size: 12px; color: var(--text-muted); margin: 2px 0 0; font-variant-numeric: tabular-nums; }
.wp8r-wl-val { font-size: 26px; font-weight: 300; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; margin: 0; }
.wp8r-wl-val.pos { color: var(--brand-positive); }
.wp8r-wl-val.neg { color: var(--brand-negative); }

.wp8r-extremes { padding-top: 4px; }

/* ============= CHART (curve + stats) ============= */
.wp8r-chart-head { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
.wp8r-chart-title { font-size: 18px; font-weight: 400; color: var(--text-heading); margin: 4px 0 0; letter-spacing: -0.015em; }
.wp8r-chart-stat { font-size: 22px; font-weight: 500; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; margin: 0; }
.wp8r-chart-stat.pos { color: var(--brand-positive); }
.wp8r-chart-stat.neg { color: var(--brand-negative); }

.wp8r-curve { position: relative; height: 240px; margin: 8px 0 24px; }
.wp8r-curve svg { width: 100%; height: 100%; display: block; }
.wp8r-chart-svg { cursor: crosshair; }
.wp8r-chart-hover { pointer-events: none; }

.wp8r-chart-tip {
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
.wp8r-chart-tip-date { font-size: 11px; color: var(--text-muted); margin: 0 0 4px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; font-variant-numeric: tabular-nums; }
.wp8r-chart-tip-val { font-size: 16px; font-weight: 500; margin: 0; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
.wp8r-chart-tip-val.pos { color: var(--brand-positive); }
.wp8r-chart-tip-val.neg { color: var(--brand-negative); }

.wp8r-curve-stats {
  list-style: none;
  padding: 0;
  margin: 24px 0 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (min-width: 768px) {
  .wp8r-curve-stats { grid-template-columns: repeat(4, 1fr); }
}
.wp8r-curve-stats > li {
  position: relative;
  padding: 16px 18px 18px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
  border-radius: 14px;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 90px;
}
@media (min-width: 768px) { .wp8r-curve-stats { grid-template-columns: repeat(4, 1fr); } }
.wp8r-cs-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: var(--text-muted); font-weight: 500; margin: 0; }
.wp8r-cs-val { font-size: 22px; font-weight: 300; color: var(--text-heading); margin: auto 0 0; font-variant-numeric: tabular-nums; letter-spacing: -0.025em; line-height: 1; }
.wp8r-cs-val.pos { color: var(--brand-positive); }
.wp8r-cs-val.neg { color: var(--brand-negative); }

/* ============= RAIL ============= */
.wp8r-rail { max-width: 1440px; margin: 0 auto; padding: 0 16px 0; }
@media (min-width: 768px) { .wp8r-rail { padding: 0 32px 0; } }

.wp8r-section { padding: 48px 0 0; border-top: 1px solid var(--border-subtle); }
@media (min-width: 1024px) { .wp8r-section { padding: 56px 0 0; } }
.wp8r-section:last-child { padding-bottom: 64px; }

/* section com padding em cima E embaixo (heatmap precisa) */
.wp8r-section--padded { padding-bottom: 48px; }
@media (min-width: 1024px) { .wp8r-section--padded { padding-bottom: 56px; } }

.wp8r-head { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px; margin-bottom: 32px; }
.wp8r-h2 { font-size: clamp(24px, 3vw, 32px); font-weight: 300; color: var(--text-heading); margin: 0; letter-spacing: -0.02em; line-height: 1.15; }
.wp8r-head-meta { font-size: 12px; color: var(--text-muted); margin: 0; letter-spacing: 0.04em; }

/* ============= STATS GRID ============= */
.wp8r-stats-grid {
  list-style: none; padding: 0; margin: 24px 0 0;
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
  border-top: none; border-left: none;
}
@media (min-width: 768px) { .wp8r-stats-grid { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 1024px) { .wp8r-stats-grid { grid-template-columns: repeat(7, 1fr); } }
.wp8r-stat {
  padding: 16px 18px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
  border-radius: 14px;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 96px;
}
.wp8r-stat-val { font-size: clamp(20px, 2.4vw, 26px); font-weight: 300; letter-spacing: -0.025em; font-variant-numeric: tabular-nums; margin: 0; color: var(--text-heading); white-space: nowrap; }
.wp8r-stat-val.pos { color: var(--brand-positive); }
.wp8r-stat-val.neg { color: var(--brand-negative); }
.wp8r-stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); font-weight: 500; margin: 0; }
.wp8r-stat-bar { display: block; height: 2px; background: var(--bg-overlay); margin-top: 8px; border-radius: 999px; overflow: hidden; }
.wp8r-stat-fill { display: block; height: 100%; border-radius: 999px; }
.wp8r-stat-fill.pos { background: var(--brand-positive); }
.wp8r-stat-fill.neg { background: var(--brand-negative); }
.wp8r-stat-fill.neutral { background: var(--brand-primary); }

/* ============= HEATMAP ============= */
.lvl-neg { background: var(--brand-negative); }
.lvl-flat { background: var(--bg-overlay); }
.lvl-pos1 { background: color-mix(in srgb, var(--brand-positive) 35%, transparent); }
.lvl-pos2 { background: color-mix(in srgb, var(--brand-positive) 60%, transparent); }
.lvl-pos3 { background: var(--brand-positive); }

/* CALENDAR 6m */
.wp8r-cal { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; border-top: none; padding-top: 0; }
@media (min-width: 768px) { .wp8r-cal { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) { .wp8r-cal { grid-template-columns: repeat(6, 1fr); } }
.wp8r-cal-mo-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--text-muted); font-weight: 500; margin: 0 0 12px; }
.wp8r-cal-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 3px; }

/* CELL base — calendar e week share o mesmo selector pra tooltip e hover */
.wp8r-hm-cell {
  aspect-ratio: 1 / 1;
  border-radius: 2px;
  border: 0;
  padding: 0;
}

/* tudo que faz hover/tooltip vem de .wp8r-cellable (compartilhado) */
.wp8r-cellable {
  position: relative;
  cursor: pointer;
  transition: transform 150ms ease-out, box-shadow 150ms ease-out;
}
.wp8r-cellable:hover {
  z-index: 10;
  box-shadow:
    0 0 0 2px var(--bg-base),
    0 0 0 3.5px var(--brand-primary),
    0 6px 20px -4px color-mix(in srgb, var(--brand-primary) 50%, transparent);
}
.wp8r-hm-cell.wp8r-cellable:hover { transform: scale(1.3); }
.wp8r-hm-cell.wp8r-cellable:hover::after { transform: translateX(-50%) translateY(0) scale(0.77); transform-origin: bottom center; }
.wp8r-hm-cell.wp8r-cellable:hover::before { transform: translateX(-50%) scale(0.77); transform-origin: bottom center; }

.wp8r-week-grid td.wp8r-cellable:hover { transform: scale(1.1); }
.wp8r-week-grid td.wp8r-cellable:hover::after { transform: translateX(-50%) translateY(0) scale(0.91); transform-origin: bottom center; }
.wp8r-week-grid td.wp8r-cellable:hover::before { transform: translateX(-50%) scale(0.91); transform-origin: bottom center; }

.wp8r-cellable::after {
  content: attr(data-tip-main) '\A' 'Clique para ver detalhes';
  white-space: pre;
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
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
  opacity: 0;
  transition: opacity 150ms, transform 150ms;
  z-index: 11;
  box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--text-heading) 30%, transparent);
}
.wp8r-cellable::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--text-heading);
  opacity: 0;
  transition: opacity 150ms;
  z-index: 11;
  pointer-events: none;
}
.wp8r-cellable:hover::after,
.wp8r-cellable:hover::before {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* WEEK */
.wp8r-week { overflow-x: auto; border-top: 1px solid var(--border-subtle); padding-top: 16px; }
.wp8r-week-grid { width: 100%; border-collapse: separate; border-spacing: 4px; font-size: 11px; font-variant-numeric: tabular-nums; }
.wp8r-week-grid thead th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); font-weight: 500; padding: 6px 0; }
.wp8r-week-grid tbody th { font-size: 10px; color: var(--text-muted); font-weight: 500; padding: 0 8px; text-align: right; }
.wp8r-week-grid td {
  padding: 0; height: 32px; min-width: 60px; border-radius: 3px; text-align: center;
  font-weight: 600; color: var(--text-heading);
}
.wp8r-week-grid td.lvl-neg { color: var(--brand-negative); }
.wp8r-week-grid td.lvl-pos1, .wp8r-week-grid td.lvl-pos2, .wp8r-week-grid td.lvl-pos3 { color: var(--brand-positive); }

/* HEATMAP FOOTER (legenda integrada) */
.wp8r-hm-foot {
  margin-top: 0;
  padding-top: 20px;
}
.wp8r-hm-legend {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-wrap: wrap; gap: 4px 20px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  font-weight: 500;
}
.wp8r-hm-legend li { display: inline-flex; align-items: center; gap: 8px; }
.wp8r-hm-sq { width: 12px; height: 12px; border-radius: 2px; display: inline-block; }

/* ============= TRADE GROUPS (colapsável) ============= */
.wp8r-trade-groups { display: flex; flex-direction: column; gap: 10px; border-top: none; margin-top: 16px; }
.wp8r-tg {
  border: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
  border-radius: 12px;
  background: var(--bg-elevated);
  overflow: hidden;
  transition: border-color 200ms;
}
.wp8r-tg:hover {
  border-color: color-mix(in srgb, var(--brand-border) 50%, transparent);
}
.wp8r-tg-head {
  display: grid; grid-template-columns: 1fr auto;
  align-items: center; gap: 24px;
  width: 100%; padding: 18px 16px;
  background: transparent; border: 0; cursor: pointer; text-align: left;
  font-family: inherit; color: inherit;
  transition: background 150ms;
}
.wp8r-tg-head:hover { background: color-mix(in srgb, var(--brand-primary) 3%, transparent); }
.wp8r-tg-left { display: inline-flex; align-items: baseline; gap: 12px; }
.wp8r-tg-chev { color: var(--text-muted); transition: transform 200ms ease-out; flex-shrink: 0; align-self: center; }
.wp8r-tg-chev.is-open { transform: rotate(90deg); color: var(--brand-primary); }
.wp8r-tg-period { font-size: 17px; font-weight: 500; color: var(--text-heading); letter-spacing: -0.012em; }
.wp8r-tg-count { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); font-weight: 500; }
.wp8r-tg-right { display: inline-flex; align-items: baseline; gap: 28px; font-variant-numeric: tabular-nums; }
.wp8r-tg-stat { display: inline-flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.wp8r-tg-stat-eb { font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); font-weight: 500; }
.wp8r-tg-stat-val { font-size: 15px; font-weight: 500; color: var(--text-heading); letter-spacing: -0.01em; }
.wp8r-tg-stat-val.pos { color: var(--brand-positive); }
.wp8r-tg-stat-val.neg { color: var(--brand-negative); }

.wp8r-tg-body { padding: 0 0 16px; }

/* ============= TABLE ============= */
.wp8r-table-wrap { overflow-x: auto; }
.wp8r-table { width: 100%; border-collapse: collapse; font-size: 13px; font-variant-numeric: tabular-nums; }
.wp8r-table thead th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); font-weight: 500; padding: 12px 12px; text-align: right; border-bottom: 1px solid var(--border-subtle); white-space: nowrap; }
.wp8r-table th.left { text-align: left; }
.wp8r-table tbody td { padding: 12px 12px; text-align: right; border-bottom: 1px solid var(--border-subtle); color: var(--text-body); }
.wp8r-table tbody tr:last-child td { border-bottom: 0; }
.wp8r-table tbody tr:hover td { background: color-mix(in srgb, var(--brand-primary) 4%, transparent); }
.wp8r-table td.left { text-align: left; }
.wp8r-table td.strong { color: var(--text-heading); font-weight: 600; letter-spacing: 0.04em; }
.wp8r-table td.muted { color: var(--text-muted); }
.wp8r-table td.positive { color: var(--brand-positive); font-weight: 500; }
.wp8r-table td.negative { color: var(--brand-negative); font-weight: 500; }

/* Ghost link header */
.wp8-head-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.wp8-head-link--ghost {
  display: inline-flex; align-items: center; gap: 6px;
  color: var(--text-muted); background: transparent; border: 0;
  border-bottom: 1px solid var(--border-default); padding-bottom: 2px;
  cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 500; letter-spacing: 0.01em;
}
.wp8-head-link--ghost :deep(*) { color: var(--text-muted); }
.wp8-head-link--ghost:hover { color: var(--text-heading); border-bottom-color: var(--text-muted); }
.wp8-head-link--ghost:hover :deep(*) { color: var(--text-heading); }

/* ============= INSIGHTS ============= */
.wp8r-insights {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 16px;
  border-top: none;
}
@media (min-width: 1024px) { .wp8r-insights { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) { .wp8r-insights { grid-template-columns: repeat(3, 1fr); } }
.wp8r-ins {
  padding: 20px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
  border-radius: 14px;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
@media (min-width: 1024px) {
  .wp8r-ins:not(:last-child) { border-right: 1px solid var(--border-subtle); padding-right: 32px; }
  .wp8r-ins + .wp8r-ins { padding-left: 32px; }
  .wp8r-ins { border-bottom: 0; }
}
.wp8r-ins-tag { font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; font-weight: 500; margin: 0; }
.wp8r-ins-tag.pos { color: var(--brand-positive); }
.wp8r-ins-tag.neutral { color: var(--brand-primary); }
.wp8r-ins-tag.accent { color: var(--text-muted); }
.wp8r-ins-h { font-size: 18px; font-weight: 400; color: var(--text-heading); margin: 4px 0 0; letter-spacing: -0.015em; line-height: 1.3; }
.wp8r-ins-h strong { font-weight: 600; color: var(--brand-positive); }
.wp8r-ins-note { font-size: 13px; color: var(--text-muted); margin: 4px 0 0; line-height: 1.55; }

/* ============= CTA FULL-BLEED (mesma DNA do wallet) ============= */
/* Escape do padding do parent via position + width 100vw — sem negative margin. */
.wp8r-cta-fullbleed {
  position: relative;
  width: 100%;
  margin-top: 48px;
  padding: 30px 0;
  background: #f1e19e4a;
  overflow: hidden;
}
/* Apenas no xl+ o parent (content-area da default.vue) tem xl:px-4 (16px).
   Escapamos esses 16px de cada lado via width + left, sem usar margin. */
@media (min-width: 1280px) {
  .wp8r-cta-fullbleed {
    width: calc(100% + 32px);
    left: -16px;
  }
}

.wp8r-cta-atmo { position: absolute; pointer-events: none; filter: blur(200px); z-index: 0; }
.wp8r-cta-atmo--top {
  top: -10%; right: -5%; width: 55%; height: 70%;
  opacity: 0.55;
  background: radial-gradient(ellipse, color-mix(in srgb, var(--brand-primary) 30%, transparent), transparent 60%);
}
.wp8r-cta-atmo--bottom {
  bottom: -20%; left: -10%; width: 50%; height: 60%;
  opacity: 0.4;
  background: radial-gradient(ellipse, color-mix(in srgb, #fbbf24 30%, transparent), transparent 60%);
}

.wp8r-cta-inner { position: relative; z-index: 1; max-width: 1440px; margin: 0 auto; padding: 0 16px; }
@media (min-width: 768px) { .wp8r-cta-inner { padding: 0 32px; } }

.wp8r-cta-head { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 32px; margin-bottom: 56px; }
.wp8r-cta-head > div { max-width: 56ch; }
.wp8r-cta-h {
  font-size: clamp(28px, 3.6vw, 44px);
  font-weight: 300;
  color: var(--text-heading);
  margin: 8px 0 0;
  letter-spacing: -0.025em;
  line-height: 1.1;
}

.wp8r-cta-primary {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 14px 22px 14px 24px;
  background: var(--text-heading); border: 1px solid var(--text-heading); border-radius: 999px;
  color: var(--bg-base); text-decoration: none; font-size: 15px; font-weight: 500; letter-spacing: -0.005em;
  transition: all 200ms ease-out;
  box-shadow: 0 12px 32px -12px color-mix(in srgb, var(--text-heading) 50%, transparent);
  align-self: flex-end; flex-shrink: 0;
}
.wp8r-cta-primary :deep(*) { color: var(--bg-base); flex-shrink: 0; transition: transform 200ms; }
.wp8r-cta-primary:hover {
  background: var(--brand-primary); border-color: var(--brand-primary); color: var(--text-on-primary);
  transform: translateY(-2px);
  box-shadow: 0 16px 40px -8px color-mix(in srgb, var(--brand-primary) 60%, transparent);
}
.wp8r-cta-primary:hover :deep(*) { color: var(--text-on-primary); }
.wp8r-cta-primary:hover .wp8r-cta-arrow { transform: translateX(4px); }

.wp8r-cta-data {
  display: grid; grid-template-columns: 1fr; gap: 32px 0;
  border-top: 1px solid color-mix(in srgb, var(--text-heading) 10%, transparent);
  padding-top: 40px;
}
@media (min-width: 768px) {
  .wp8r-cta-data { grid-template-columns: 1fr 1fr; gap: 0; }
  .wp8r-cta-block:first-child { padding-right: 48px; border-right: 1px solid color-mix(in srgb, var(--text-heading) 10%, transparent); }
  .wp8r-cta-block:last-child { padding-left: 48px; }
}
.wp8r-cta-block { display: flex; flex-direction: column; gap: 8px; }
.wp8r-cta-block-tag { font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: var(--text-muted); font-weight: 500; margin: 0; }
.wp8r-cta-block-mega {
  font-size: clamp(40px, 5vw, 64px);
  font-weight: 300;
  line-height: 1;
  letter-spacing: -0.035em;
  font-variant-numeric: tabular-nums;
  margin: 4px 0 4px;
  color: var(--text-heading);
}
.wp8r-cta-block-mega.pos { color: var(--brand-positive); }
.wp8r-cta-block-meta { display: flex; flex-wrap: wrap; gap: 8px; font-size: 14px; color: var(--text-body); margin: 0; font-variant-numeric: tabular-nums; letter-spacing: -0.005em; }
.wp8r-cta-block-meta .sep { color: var(--text-muted); opacity: 0.6; }
.wp8r-cta-block-meta .pos { color: var(--brand-positive); font-weight: 500; }

/* =================================================================
   FUNDAÇÃO IDENTITY (replicando padrão da /wallet/index.vue).
   Vide design/IDENTITY.md secções 3 e 4.

   - tira grid 2x2 do CalcUiShell → stack column
   - cada cui-shell-block-* vira card (radius 14, border 30%, padding 24)
   - wp8r-rail vira flex column sem max-width
   - wp8r-section vira card uniforme
   - tira atmospheric blur e meta border do shell
   ================================================================= */

/* Shell: limpa overflow + atmosférico */
:deep(.cui-shell) { overflow: visible; }
:deep(.cui-shell-atmo) { display: none !important; opacity: 0 !important; }

/* Split: stack mobile / hero+result lado a lado no desktop. */
:deep(.cui-shell-split) {
  display: flex !important;
  flex-direction: column;
  gap: 16px;
  padding: 0;
}
@media (min-width: 1024px) {
  :deep(.cui-shell-split) {
    display: grid !important;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "hero result"
      "form chart";
  }
  :deep(.cui-shell-block-hero) { grid-area: hero !important; }
  :deep(.cui-shell-block-result) { grid-area: result !important; }
  :deep(.cui-shell-block-form) { grid-area: form !important; }
  :deep(.cui-shell-block-chart) { grid-area: chart !important; }
}

/* Cada bloco do shell vira card autocontido */
:deep(.cui-shell-block-hero),
:deep(.cui-shell-block-result),
:deep(.cui-shell-block-form),
:deep(.cui-shell-block-chart),
:deep(.cui-shell-hero),
:deep(.cui-shell-result),
:deep(.cui-shell-form),
:deep(.cui-shell-chart) {
  padding: 24px !important;
  border: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent) !important;
  border-radius: 14px !important;
  background: var(--bg-elevated) !important;
  max-width: none !important;
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent) !important;
  border-right: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent) !important;
  order: unset !important;
}

/* Status strip (back nav) sem border-bottom */
:deep(.cui-shell-status) {
  border-bottom: none;
  padding: 16px 0;
}

/* Meta "Última atualização" — sem border-top, padding-top zero */
:deep(.cui-shell-meta) {
  margin-top: 32px !important;
  padding-top: 0;
  border-top: none;
  position: relative;
  z-index: 1;
}

/* Tira text-shadow (glow) do hero number */
:deep(.cui-shell-block-result .calc-result-mega) {
  text-shadow: none;
}

/* Card result: tira divider, transforma 3 KPIs em sub-cards horizontais
   (Profit Factor / Win Rate / R/R Médio). Mesma recipe da wallet. */
:deep(.cui-shell-block-result .calc-result-divider) {
  display: none;
}
:deep(.cui-shell-block-result .calc-kpis) {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 32px;
}
@media (max-width: 768px) {
  :deep(.cui-shell-block-result .calc-kpis) { grid-template-columns: 1fr; }
}
:deep(.cui-shell-block-result .calc-kpis > div) {
  position: relative;
  padding: 20px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
  border-radius: 14px;
  background: transparent;
  min-height: 110px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
:deep(.cui-shell-block-result .calc-kpis dt) {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--text-muted);
  line-height: 1.4;
  margin: 0;
}
:deep(.cui-shell-block-result .calc-kpis dd) {
  font-size: 28px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: -0.025em;
  font-variant-numeric: tabular-nums;
  color: var(--text-heading);
  margin: auto 0 0;
}
:deep(.cui-shell-block-result .calc-kpis dd.positive) {
  color: var(--brand-positive);
}
:deep(.cui-shell-block-result .calc-kpis dd.negative) {
  color: var(--brand-negative);
}

/* Card form (Vencedores vs Perdedores + Extremos): tira divider entre
   as duas partes e transforma KPIs de extremos em sub-cards horizontais. */
:deep(.cui-shell-block-form .calc-result-divider) {
  display: none;
}
:deep(.cui-shell-block-form .wp8r-extremes) {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
}
:deep(.cui-shell-block-form .calc-kpis) {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
}
@media (max-width: 768px) {
  :deep(.cui-shell-block-form .calc-kpis) { grid-template-columns: 1fr; }
}
:deep(.cui-shell-block-form .calc-kpis > div) {
  position: relative;
  padding: 20px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
  border-radius: 14px;
  background: transparent;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
:deep(.cui-shell-block-form .calc-kpis dt) {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--text-muted);
  margin: 0;
}
:deep(.cui-shell-block-form .calc-kpis dd) {
  font-size: 24px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: -0.025em;
  font-variant-numeric: tabular-nums;
  color: var(--text-heading);
  margin: auto 0 0;
}
:deep(.cui-shell-block-form .calc-kpis dd.positive) { color: var(--brand-positive); }
:deep(.cui-shell-block-form .calc-kpis dd.negative) { color: var(--brand-negative); }

/* Sections abaixo do shell — flex column sem max-width */
.wp8r-rail {
  max-width: none;
  margin: 16px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

/* Cada wp8r-section vira card uniforme */
.wp8r-section {
  padding: 24px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
  border-radius: 14px;
  background: var(--bg-elevated);
  margin: 0;
}

/* Variant Histórico — bg amber 4% sutil + border amber 18%, igual ao
   "Por classe" da wallet. Sub-cards (.wp8r-tg) ficam brancos contrastando. */
.wp8r-section--historico {
  background: color-mix(in srgb, var(--brand-primary) 4%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent) !important;
}

/* Logo do ticker na coluna da tabela. Brapi CDN serve SVG real pra
   ações líquidas; pra FIIs/menores @error oculta sem quebrar layout. */
.ticker-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ticker-logo {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--bg-overlay);
  object-fit: contain;
  flex-shrink: 0;
}

/* Empty state também vira card */
.wp8-empty {
  max-width: none;
  margin: 0;
  padding: 0;
}
.wp8-empty-inner {
  padding: 48px 32px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
  border-radius: 14px;
  background: var(--bg-elevated);
}
</style>

<style>
/* ============= MODAL — detalhe da célula ============= */
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
.wp8r-modal-trades { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0; }
.wp8r-modal-trade {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-subtle);
}
.wp8r-modal-trade:last-child { border-bottom: 0; }
.wp8r-modal-trade-dot { width: 8px; height: 8px; border-radius: 999px; }
.wp8r-modal-trade-dot.pos { background: var(--brand-positive); }
.wp8r-modal-trade-dot.neg { background: var(--brand-negative); }
.wp8r-modal-trade-tk { font-size: 14px; font-weight: 600; color: var(--text-heading); margin: 0; letter-spacing: 0.04em; }
.wp8r-modal-trade-meta { font-size: 12px; color: var(--text-muted); margin: 4px 0 0; font-variant-numeric: tabular-nums; }
.wp8r-modal-trade-pnl { font-size: 15px; font-weight: 500; margin: 0; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
.wp8r-modal-trade-pnl.pos { color: var(--brand-positive); }
.wp8r-modal-trade-pnl.neg { color: var(--brand-negative); }

.wp8r-modal-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 0 8px; text-align: center; }
.wp8r-modal-empty-icon { color: var(--text-muted); opacity: 0.5; margin-bottom: 4px; }
.wp8r-modal-empty-h { font-size: 15px; font-weight: 500; color: var(--text-heading); margin: 0; }
.wp8r-modal-empty-sub { font-size: 13px; color: var(--text-muted); margin: 0; max-width: 40ch; line-height: 1.55; }

.wp8r-modal-foot { display: flex; justify-content: flex-end; padding-top: 4px; }
.wp8r-modal-foot .wp8-head-link--ghost { font-size: 13px; }

/* Fade animation */
.wp8r-modal-fade-enter-active, .wp8r-modal-fade-leave-active { transition: opacity 200ms ease-out; }
.wp8r-modal-fade-enter-active .wp8r-modal,
.wp8r-modal-fade-leave-active .wp8r-modal { transition: transform 200ms ease-out, opacity 200ms ease-out; }
.wp8r-modal-fade-enter-from, .wp8r-modal-fade-leave-to { opacity: 0; }
.wp8r-modal-fade-enter-from .wp8r-modal, .wp8r-modal-fade-leave-to .wp8r-modal { transform: translateY(20px); opacity: 0; }
</style>

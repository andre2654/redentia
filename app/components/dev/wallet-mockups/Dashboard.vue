<!--
  Wallet Dashboard mockup — populated state.

  All numbers come from a real B3 CEI export (parsed in MockData.ts).
  Visual language: stripe-style (weight 300 displays, mono-tab numerics,
  color-mix tints, eyebrows + display + body hierarchy).

  Sections rendered in order:
    1. Hero: total value + variation + import action
    2. Hero metrics grid (4 cards)
    3. Allocation (class + sectors + geography)
    4. Positions table (with filters)
    5. Goals + Watchlist (side-by-side)
    6. Dividend calendar (next 60 days)
    7. Raio-X preview (3 strengths + 3 risks + CTA)
    8. Upcoming events
-->
<template>
  <div class="flex flex-col gap-10 px-6 py-8">
    <!-- ============ 1. Hero ============ -->
    <header class="flex flex-col gap-3">
      <span
        class="font-mono-tab text-[11px] font-medium uppercase"
        :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
      >Carteira · Atualizada agora</span>
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div class="flex min-w-0 flex-col gap-1">
          <h1
            class="font-light tabular-nums"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(40px, 5.5vw, 56px)',
              lineHeight: 1.0,
              letterSpacing: '-1.5px',
            }"
          >{{ formatBRL(TOTAL_VALUE) }}</h1>
          <div class="mt-1 flex flex-wrap items-baseline gap-3">
            <span
              class="font-mono-tab text-[15px] tabular-nums"
              :style="{ color: brand.colors.positive }"
            >+{{ formatBRL(PNL_TOTAL) }}</span>
            <span
              class="rounded-md px-2 py-0.5 font-mono-tab text-[12px] font-medium tabular-nums"
              :style="{
                backgroundColor: `color-mix(in srgb, ${brand.colors.positive} 16%, transparent)`,
                color: brand.colors.positive,
              }"
            >{{ formatPct(PNL_PCT) }}</span>
            <span
              class="font-mono-tab text-[12.5px]"
              :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
            >{{ POSITIONS_COUNT }} ativos · YTD {{ formatPct(YTD_PCT) }} · {{ formatPct(VS_CDI_PCT) }} vs CDI</span>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-medium transition-[background-color]"
            :style="{
              borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
              color: brand.colors.text,
            }"
          >
            <UIcon name="i-lucide-rotate-ccw" class="size-4" />
            Atualizar dados
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-[background-color]"
            :style="{
              backgroundColor: brand.colors.primary,
              color: brand.colors.background,
              boxShadow: `0 8px 18px -10px color-mix(in srgb, ${brand.colors.primary} 60%, transparent)`,
            }"
          >
            <UIcon name="i-lucide-sparkles" class="size-4" />
            Atualizar via chat
          </button>
        </div>
      </div>
    </header>

    <!-- ============ 2. Hero metrics grid ============ -->
    <section class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <!-- Card: Patrimônio com sparkline -->
      <article class="metric-card flex flex-col gap-2 rounded-xl border p-5" :style="cardStyle">
        <span class="mock-eyebrow">Patrimônio</span>
        <div
          class="font-mono-tab text-[24px] font-light tabular-nums"
          :style="{ color: brand.colors.text, letterSpacing: '-0.4px' }"
        >{{ formatBRL(TOTAL_VALUE) }}</div>
        <svg viewBox="0 0 200 36" class="h-8 w-full">
          <defs>
            <linearGradient id="m1" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" :stop-color="brand.colors.positive" stop-opacity="0.32" />
              <stop offset="100%" :stop-color="brand.colors.positive" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,28 L18,26 L36,30 L54,22 L72,24 L90,18 L108,20 L126,12 L144,15 L162,10 L180,7 L200,9"
            :stroke="brand.colors.positive"
            stroke-width="1.5"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M0,28 L18,26 L36,30 L54,22 L72,24 L90,18 L108,20 L126,12 L144,15 L162,10 L180,7 L200,9 L200,36 L0,36 Z"
            fill="url(#m1)"
          />
        </svg>
        <span class="mock-meta">12 meses · contra CDI: {{ formatPct(VS_CDI_PCT) }}</span>
      </article>

      <!-- Card: Score de saúde -->
      <article class="metric-card flex flex-col gap-2 rounded-xl border p-5" :style="cardStyle">
        <span class="mock-eyebrow">Score de saúde</span>
        <div class="flex items-baseline gap-2">
          <div
            class="font-mono-tab text-[40px] font-light tabular-nums leading-none"
            :style="{ color: brand.colors.text, letterSpacing: '-0.04em' }"
          >{{ SCORE }}</div>
          <span
            class="font-mono-tab text-[12px] tabular-nums"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
          >/100</span>
        </div>
        <span
          class="font-mono-tab text-[10.5px] font-medium uppercase"
          :style="{
            letterSpacing: '0.16em',
            color: brand.colors.positive,
          }"
        >Boa</span>
        <div
          class="mt-1 h-1.5 w-full rounded-full"
          :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 7%, transparent)` }"
        >
          <div
            class="h-full rounded-full"
            :style="{
              width: SCORE + '%',
              background: `linear-gradient(90deg, ${brand.colors.primary} 0%, ${brand.colors.positive} 100%)`,
            }"
          />
        </div>
        <span class="mock-meta">9 dimensões avaliadas</span>
      </article>

      <!-- Card: Dividendos -->
      <article class="metric-card flex flex-col gap-2 rounded-xl border p-5" :style="cardStyle">
        <span class="mock-eyebrow">Dividendos · 12m</span>
        <div
          class="font-mono-tab text-[24px] font-light tabular-nums"
          :style="{ color: brand.colors.text, letterSpacing: '-0.4px' }"
        >{{ formatBRL(DIVIDEND_FORECAST_12M) }}</div>
        <div class="flex items-center gap-2">
          <span
            class="font-mono-tab text-[11px] tabular-nums"
            :style="{ color: brand.colors.positive }"
          >R$ 2.368/mês médio</span>
        </div>
        <span class="mock-meta">DY médio 7,4% · acima do CDI</span>
      </article>

      <!-- Card: Performance vs benchmarks -->
      <article class="metric-card flex flex-col gap-2 rounded-xl border p-5" :style="cardStyle">
        <span class="mock-eyebrow">Performance · 12m</span>
        <div
          class="font-mono-tab text-[24px] font-light tabular-nums"
          :style="{ color: brand.colors.positive, letterSpacing: '-0.4px' }"
        >{{ formatPct(PNL_PCT) }}</div>
        <div class="flex flex-col gap-0.5">
          <div
            v-for="b in BENCHMARKS.filter((x) => x.label !== 'Sua carteira').slice(0, 3)"
            :key="b.label"
            class="flex items-center justify-between text-[11px]"
          >
            <span :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }">{{ b.label }}</span>
            <span
              class="font-mono-tab tabular-nums"
              :style="{ color: b.return_12m_pct >= 0 ? brand.colors.positive : brand.colors.negative }"
            >{{ formatPct(b.return_12m_pct) }}</span>
          </div>
        </div>
      </article>
    </section>

    <!-- ============ 3. Allocation ============ -->
    <section class="flex flex-col gap-5">
      <SectionHeading
        :brand="brand"
        eyebrow="Alocação"
        title="Como sua carteira está distribuída"
      />
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <!-- Donut: por classe -->
        <article class="flex flex-col gap-4 rounded-xl border p-5" :style="cardStyle">
          <div class="flex items-baseline justify-between">
            <span class="mock-eyebrow">Por classe</span>
            <span
              class="font-mono-tab text-[10.5px]"
              :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
            >4 classes</span>
          </div>
          <div class="flex items-center gap-4">
            <!-- Donut SVG -->
            <svg viewBox="0 0 100 100" class="size-28 shrink-0">
              <circle cx="50" cy="50" r="40" fill="none" stroke-width="14" :stroke="`color-mix(in srgb, ${brand.colors.text} 8%, transparent)`" />
              <g v-for="(slice, i) in donutSlices" :key="i">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke-width="14"
                  :stroke="slice.color"
                  :stroke-dasharray="slice.dasharray"
                  :stroke-dashoffset="slice.offset"
                  transform="rotate(-90 50 50)"
                  stroke-linecap="butt"
                />
              </g>
            </svg>
            <div class="flex flex-1 flex-col gap-1.5">
              <div
                v-for="row in ALLOCATION_BY_CLASS"
                :key="row.label"
                class="flex items-center justify-between gap-2 text-[12.5px]"
              >
                <div class="flex items-center gap-2">
                  <span class="size-2 shrink-0 rounded-full" :style="{ backgroundColor: row.color }" />
                  <span :style="{ color: brand.colors.text }">{{ row.label }}</span>
                </div>
                <span
                  class="font-mono-tab tabular-nums"
                  :style="{ color: `color-mix(in srgb, ${brand.colors.text} 70%, transparent)` }"
                >{{ row.weight_pct.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </article>

        <!-- Setores -->
        <article class="flex flex-col gap-4 rounded-xl border p-5" :style="cardStyle">
          <div class="flex items-baseline justify-between">
            <span class="mock-eyebrow">Por setor</span>
            <span
              class="font-mono-tab text-[10.5px]"
              :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
            >Top 6 de {{ ALLOCATION_BY_SECTOR.length }}</span>
          </div>
          <ul class="flex flex-col gap-2">
            <li
              v-for="row in ALLOCATION_BY_SECTOR.slice(0, 6)"
              :key="row.sector"
              class="flex items-center gap-3"
            >
              <span class="flex-1 truncate text-[12.5px]" :style="{ color: brand.colors.text }">{{ row.sector }}</span>
              <div
                class="h-1.5 w-24 overflow-hidden rounded-full"
                :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 7%, transparent)` }"
              >
                <div
                  class="h-full rounded-full"
                  :style="{
                    width: Math.min(row.weight_pct * 4, 100) + '%',
                    backgroundColor: brand.colors.primary,
                  }"
                />
              </div>
              <span
                class="w-12 shrink-0 text-right font-mono-tab text-[11px] tabular-nums"
                :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)` }"
              >{{ row.weight_pct.toFixed(1) }}%</span>
            </li>
          </ul>
        </article>

        <!-- Geográfica -->
        <article class="flex flex-col gap-3 rounded-xl border p-5" :style="cardStyle">
          <span class="mock-eyebrow">Geografia</span>
          <div class="flex items-baseline gap-2">
            <span
              class="font-mono-tab text-[20px] font-light tabular-nums"
              :style="{ color: brand.colors.text, letterSpacing: '-0.3px' }"
            >98,2%</span>
            <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">Brasil</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span
              class="font-mono-tab text-[16px] font-light tabular-nums"
              :style="{ color: brand.colors.text, letterSpacing: '-0.2px' }"
            >1,8%</span>
            <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">Internacional (GOLD11)</span>
          </div>
          <div
            class="mt-2 flex h-2 w-full overflow-hidden rounded-full"
            :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 7%, transparent)` }"
          >
            <div class="h-full" :style="{ width: '98.2%', backgroundColor: brand.colors.primary }" />
            <div class="h-full" :style="{ width: '1.8%', backgroundColor: brand.colors.positive }" />
          </div>
          <p
            class="mt-2 text-[12.5px]"
            :style="{
              color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`,
              lineHeight: 1.5,
            }"
          >Risco cambial alto: queda de 30% no real reduziria patrimônio em ~4,6%. Considere IVVB11 ou BDRs pra hedge.</p>
        </article>
      </div>
    </section>

    <!-- ============ 4. Posições table ============ -->
    <section class="flex flex-col gap-5">
      <div class="flex flex-wrap items-baseline justify-between gap-3">
        <SectionHeading
          :brand="brand"
          eyebrow="Posições"
          title="Seus ativos, ordenados por peso"
        />
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="cls in classFilters"
            :key="cls.value"
            type="button"
            class="rounded-md px-2.5 py-1 font-mono-tab text-[10.5px] font-medium uppercase tabular-nums"
            :style="{
              letterSpacing: '0.16em',
              backgroundColor:
                activeClass === cls.value
                  ? `color-mix(in srgb, ${brand.colors.primary} 16%, transparent)`
                  : 'transparent',
              color:
                activeClass === cls.value
                  ? brand.colors.primary
                  : `color-mix(in srgb, ${brand.colors.text} 60%, transparent)`,
              border: `1px solid ${
                activeClass === cls.value
                  ? `color-mix(in srgb, ${brand.colors.primary} 30%, transparent)`
                  : `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`
              }`,
            }"
            @click="activeClass = cls.value"
          >{{ cls.label }} · {{ cls.count }}</button>
        </div>
      </div>

      <article
        class="overflow-hidden rounded-xl border"
        :style="cardStyle"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr
                :style="{
                  borderBottom: `1px solid color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
                }"
              >
                <th class="th">Ativo</th>
                <th class="th">Setor</th>
                <th class="th th-num">Qtde</th>
                <th class="th th-num">Médio</th>
                <th class="th th-num">Atual</th>
                <th class="th th-num">Variação</th>
                <th class="th th-num">DY 12m</th>
                <th class="th th-num">Peso</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in filteredPositions.slice(0, 12)"
                :key="p.ticker"
                class="position-row"
                :style="{
                  borderBottom: `1px solid color-mix(in srgb, ${brand.colors.border} 25%, transparent)`,
                }"
              >
                <td class="td">
                  <div class="flex items-center gap-2.5">
                    <span
                      class="flex size-7 shrink-0 items-center justify-center rounded-md font-mono-tab text-[10px] font-medium"
                      :style="{
                        backgroundColor: `color-mix(in srgb, ${p.logoBg || brand.colors.primary} 18%, transparent)`,
                        color: p.logoBg || brand.colors.primary,
                      }"
                    >{{ p.ticker.slice(0, 4) }}</span>
                    <div class="flex min-w-0 flex-col leading-tight">
                      <span class="font-mono-tab text-[12.5px] font-medium" :style="{ color: brand.colors.text }">{{ p.ticker }}</span>
                      <span class="truncate text-[10.5px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }">
                        {{ p.name }}
                        <span
                          v-if="p.is_loaned"
                          class="ml-1 rounded px-1 py-0.5 font-mono-tab text-[9px] font-medium"
                          :style="{
                            backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
                            color: brand.colors.primary,
                          }"
                        >BTC</span>
                      </span>
                    </div>
                  </div>
                </td>
                <td class="td">
                  <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)` }">{{ p.sector }}</span>
                </td>
                <td class="td td-num">{{ p.quantity.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) }}</td>
                <td class="td td-num">{{ formatBRL2(p.average_price) }}</td>
                <td class="td td-num">{{ formatBRL2(p.current_price) }}</td>
                <td class="td td-num">
                  <span
                    :style="{ color: p.pnl_pct >= 0 ? brand.colors.positive : brand.colors.negative }"
                  >{{ formatPct(p.pnl_pct) }}</span>
                </td>
                <td class="td td-num">{{ p.dy_12m_pct ? p.dy_12m_pct.toFixed(1) + '%' : '—' }}</td>
                <td class="td td-num">
                  <span class="inline-flex items-center gap-1">
                    {{ p.weight_pct.toFixed(2) }}%
                    <div
                      class="h-1 w-12 overflow-hidden rounded-full"
                      :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 7%, transparent)` }"
                    >
                      <div class="h-full rounded-full" :style="{ width: Math.min(p.weight_pct * 6, 100) + '%', backgroundColor: brand.colors.primary }" />
                    </div>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <button
          type="button"
          class="flex w-full items-center justify-center gap-1.5 px-4 py-3 text-[12.5px] font-medium transition-[background-color]"
          :style="{
            color: brand.colors.primary,
            backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 4%, transparent)`,
            borderTop: `1px solid color-mix(in srgb, ${brand.colors.border} 30%, transparent)`,
          }"
        >
          Ver todas as {{ filteredPositions.length }} posições
          <UIcon name="i-lucide-arrow-down" class="size-3" />
        </button>
      </article>
    </section>

    <!-- ============ 5. Goals + Watchlist ============ -->
    <section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Goals -->
      <article class="flex flex-col gap-4 rounded-xl border p-6" :style="cardStyle">
        <div class="flex items-baseline justify-between">
          <SectionHeading
            :brand="brand"
            eyebrow="Metas · Definidas no chat"
            title="Onde você quer chegar"
            size="md"
          />
          <button
            type="button"
            class="font-mono-tab text-[10.5px] font-medium uppercase"
            :style="{ letterSpacing: '0.16em', color: brand.colors.primary }"
          >+ Nova meta</button>
        </div>
        <div class="flex flex-col gap-4">
          <div v-for="goal in GOALS" :key="goal.id" class="flex flex-col gap-1.5 border-b pb-4 last:border-b-0 last:pb-0" :style="{ borderColor: `color-mix(in srgb, ${brand.colors.border} 35%, transparent)` }">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[14px] font-medium" :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }">{{ goal.title }}</span>
              <span
                class="rounded-md px-2 py-0.5 font-mono-tab text-[10px] font-medium uppercase"
                :style="{
                  letterSpacing: '0.14em',
                  backgroundColor: goal.classification === 'achieved'
                    ? `color-mix(in srgb, ${brand.colors.positive} 14%, transparent)`
                    : `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
                  color: goal.classification === 'achieved' ? brand.colors.positive : brand.colors.primary,
                }"
              >{{ goal.classification === 'achieved' ? 'Atingida' : 'Realista' }}</span>
            </div>
            <div class="flex items-baseline justify-between font-mono-tab text-[12.5px] tabular-nums" :style="{ color: brand.colors.text }">
              <span>{{ formatBRL(goal.current_progress) }} <span :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }">/ {{ formatBRL(goal.target_value) }}</span></span>
              <span :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)` }">{{ ((goal.current_progress / goal.target_value) * 100).toFixed(1) }}%</span>
            </div>
            <div
              class="h-1.5 w-full overflow-hidden rounded-full"
              :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 7%, transparent)` }"
            >
              <div
                class="h-full rounded-full"
                :style="{
                  width: Math.min((goal.current_progress / goal.target_value) * 100, 100) + '%',
                  background: goal.classification === 'achieved'
                    ? brand.colors.positive
                    : `linear-gradient(90deg, ${brand.colors.primary} 0%, ${brand.colors.positive} 100%)`,
                }"
              />
            </div>
            <p class="mt-1 text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ goal.note }}</p>
          </div>
        </div>
      </article>

      <!-- Watchlist -->
      <article class="flex flex-col gap-4 rounded-xl border p-6" :style="cardStyle">
        <div class="flex items-baseline justify-between">
          <SectionHeading
            :brand="brand"
            eyebrow="Watchlist · Vigiando"
            title="Ativos que você acompanha"
            size="md"
          />
          <button
            type="button"
            class="font-mono-tab text-[10.5px] font-medium uppercase"
            :style="{ letterSpacing: '0.16em', color: brand.colors.primary }"
          >+ Adicionar</button>
        </div>
        <ul class="flex flex-col">
          <li
            v-for="(w, i) in WATCHLIST"
            :key="w.ticker"
            class="flex items-center gap-3 py-2.5"
            :style="{ borderBottom: i < WATCHLIST.length - 1 ? `1px solid color-mix(in srgb, ${brand.colors.border} 30%, transparent)` : 'none' }"
          >
            <span class="font-mono-tab text-[13px] font-medium w-16" :style="{ color: brand.colors.text }">{{ w.ticker }}</span>
            <span class="flex-1 truncate text-[11.5px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }">{{ w.name }} · {{ w.sector }}</span>
            <span class="font-mono-tab text-[12px] tabular-nums" :style="{ color: brand.colors.text }">{{ formatBRL2(w.current_price) }}</span>
            <span
              class="font-mono-tab text-[11.5px] tabular-nums w-14 text-right"
              :style="{ color: w.change_pct >= 0 ? brand.colors.positive : brand.colors.negative }"
            >{{ formatPct(w.change_pct) }}</span>
          </li>
        </ul>
      </article>
    </section>

    <!-- ============ 6. Dividend calendar ============ -->
    <section class="flex flex-col gap-5">
      <div class="flex flex-wrap items-baseline justify-between gap-3">
        <SectionHeading
          :brand="brand"
          eyebrow="Proventos · Próximos 60 dias"
          title="O que vai cair na conta"
        />
        <div class="flex items-baseline gap-2">
          <span class="text-[12.5px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">Total estimado</span>
          <span class="font-mono-tab text-[16px] font-medium tabular-nums" :style="{ color: brand.colors.positive, letterSpacing: '-0.2px' }">{{ formatBRL(dividendNext60Total) }}</span>
        </div>
      </div>

      <article class="overflow-hidden rounded-xl border" :style="cardStyle">
        <ul>
          <li
            v-for="(d, i) in DIVIDEND_CALENDAR_NEXT_60D"
            :key="`${d.ticker}-${d.payment_date}`"
            class="flex items-center gap-4 px-5 py-3"
            :style="{ borderBottom: i < DIVIDEND_CALENDAR_NEXT_60D.length - 1 ? `1px solid color-mix(in srgb, ${brand.colors.border} 25%, transparent)` : 'none' }"
          >
            <div class="flex w-14 shrink-0 flex-col items-center" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">
              <span class="font-mono-tab text-[10px] font-medium uppercase" :style="{ letterSpacing: '0.14em', color: brand.colors.primary }">{{ formatMonthShort(d.payment_date) }}</span>
              <span class="font-mono-tab text-[18px] font-light tabular-nums" :style="{ color: brand.colors.text, letterSpacing: '-0.02em' }">{{ formatDay(d.payment_date) }}</span>
            </div>
            <div class="flex min-w-0 flex-1 flex-col leading-tight">
              <div class="flex items-center gap-2">
                <span class="font-mono-tab text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ d.ticker }}</span>
                <span class="rounded px-1.5 py-0.5 font-mono-tab text-[10px] font-medium uppercase" :style="{ letterSpacing: '0.14em', backgroundColor: `color-mix(in srgb, ${labelColor(d.kind)} 14%, transparent)`, color: labelColor(d.kind) }">{{ d.kind }}</span>
              </div>
              <span class="text-[11px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }">{{ d.name }}</span>
            </div>
            <span class="font-mono-tab text-[14px] tabular-nums" :style="{ color: brand.colors.positive, letterSpacing: '-0.005em' }">+{{ formatBRL2(d.amount) }}</span>
          </li>
        </ul>
      </article>
    </section>

    <!-- ============ 7. Raio-X preview ============ -->
    <section class="flex flex-col gap-5">
      <div class="flex flex-wrap items-baseline justify-between gap-3">
        <SectionHeading
          :brand="brand"
          eyebrow="Raio-X · Análise da carteira"
          title="O que está saudável e o que precisa de atenção"
        />
        <button
          type="button"
          class="inline-flex items-center gap-1.5 font-mono-tab text-[11px] font-medium uppercase"
          :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
        >Ver raio-x completo
          <UIcon name="i-lucide-arrow-right" class="size-3" />
        </button>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <!-- Strengths -->
        <article class="flex flex-col gap-3 rounded-xl border p-5" :style="strengthCardStyle">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-circle-check" class="size-4" :style="{ color: brand.colors.positive }" />
            <span class="mock-eyebrow !text-[10.5px]" :style="{ color: brand.colors.positive }">Pontos fortes</span>
          </div>
          <ul class="flex flex-col gap-3">
            <li v-for="s in STRENGTHS.slice(0, 3)" :key="s.title" class="flex flex-col gap-0.5">
              <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ s.title }}</span>
              <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ s.body }}</span>
            </li>
          </ul>
        </article>

        <!-- Risks -->
        <article class="flex flex-col gap-3 rounded-xl border p-5" :style="warnCardStyle">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-alert-triangle" class="size-4" :style="{ color: brand.colors.warning || '#f59e0b' }" />
            <span class="mock-eyebrow !text-[10.5px]" :style="{ color: brand.colors.warning || '#f59e0b' }">Riscos</span>
          </div>
          <ul class="flex flex-col gap-3">
            <li v-for="r in RISKS.slice(0, 3)" :key="r.title" class="flex flex-col gap-0.5">
              <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ r.title }}</span>
              <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ r.body }}</span>
            </li>
          </ul>
        </article>

        <!-- Recommendations -->
        <article class="flex flex-col gap-3 rounded-xl border p-5" :style="cardStyle">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-sparkles" class="size-4" :style="{ color: brand.colors.primary }" />
            <span class="mock-eyebrow !text-[10.5px]" :style="{ color: brand.colors.primary }">Recomendações</span>
          </div>
          <ul class="flex flex-col gap-3">
            <li v-for="r in RECOMMENDATIONS" :key="r.title" class="flex flex-col gap-0.5">
              <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ r.title }}</span>
              <span class="text-[12px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }">{{ r.body }}</span>
            </li>
          </ul>
          <button
            type="button"
            class="mt-1 inline-flex items-center gap-1 self-start font-mono-tab text-[11px] font-medium uppercase"
            :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
          >Conversar no chat
            <UIcon name="i-lucide-arrow-up-right" class="size-3" />
          </button>
        </article>
      </div>
    </section>

    <!-- ============ 8. Próximos eventos ============ -->
    <section class="flex flex-col gap-5">
      <SectionHeading
        :brand="brand"
        eyebrow="Próximos eventos"
        title="Tudo que merece sua atenção nos próximos meses"
      />
      <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
        <article
          v-for="(e, i) in NEXT_EVENTS"
          :key="i"
          class="flex items-center gap-3 rounded-lg border p-3"
          :style="cardStyle"
        >
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-md"
            :style="{
              backgroundColor: `color-mix(in srgb, ${eventTint(e.kind)} 14%, transparent)`,
            }"
          >
            <UIcon :name="eventIcon(e.kind)" class="size-4" :style="{ color: eventTint(e.kind) }" />
          </span>
          <div class="flex flex-1 flex-col leading-tight">
            <span class="text-[13px] font-medium" :style="{ color: brand.colors.text }">{{ e.label }}</span>
            <span class="font-mono-tab text-[11px] tabular-nums" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }">{{ formatDateLong(e.date) }}</span>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  POSITIONS,
  POSITIONS_COUNT,
  TOTAL_VALUE,
  PNL_TOTAL,
  PNL_PCT,
  YTD_PCT,
  VS_CDI_PCT,
  SCORE,
  ALLOCATION_BY_CLASS,
  ALLOCATION_BY_SECTOR,
  GOALS,
  WATCHLIST,
  DIVIDEND_CALENDAR_NEXT_60D,
  DIVIDEND_FORECAST_12M,
  STRENGTHS,
  RISKS,
  RECOMMENDATIONS,
  BENCHMARKS,
  NEXT_EVENTS,
  formatBRL,
  formatBRL2,
  formatPct,
} from './MockData'

const brand = useBrand()

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))

const strengthCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.positive} 5%, ${brand.colors.surface})`,
  borderColor: `color-mix(in srgb, ${brand.colors.positive} 22%, transparent)`,
}))

const warnCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.warning || '#f59e0b'} 5%, ${brand.colors.surface})`,
  borderColor: `color-mix(in srgb, ${brand.colors.warning || '#f59e0b'} 22%, transparent)`,
}))

// Donut math: each slice's stroke-dasharray + offset, computed from
// weight_pct. A circle with r=40 has circumference ≈ 251.33.
const CIRC = 2 * Math.PI * 40

const donutSlices = computed(() => {
  let cumulative = 0
  return ALLOCATION_BY_CLASS.map((row) => {
    const len = (row.weight_pct / 100) * CIRC
    const slice = {
      color: row.color,
      dasharray: `${len} ${CIRC - len}`,
      offset: -cumulative,
    }
    cumulative += len
    return slice
  })
})

// Class filter pills
const activeClass = ref<'ALL' | 'STOCK' | 'REIT' | 'ETF' | 'TREASURY'>('ALL')
const classFilters = computed(() => [
  { value: 'ALL' as const, label: 'Todos', count: POSITIONS.length },
  { value: 'STOCK' as const, label: 'Ações', count: POSITIONS.filter((p) => p.asset_class === 'STOCK').length },
  { value: 'REIT' as const, label: 'FIIs', count: POSITIONS.filter((p) => p.asset_class === 'REIT').length },
  { value: 'ETF' as const, label: 'ETF', count: POSITIONS.filter((p) => p.asset_class === 'ETF').length },
  { value: 'TREASURY' as const, label: 'Tesouro', count: POSITIONS.filter((p) => p.asset_class === 'TREASURY').length },
])

const filteredPositions = computed(() => {
  const sorted = POSITIONS.slice().sort((a, b) => b.weight_pct - a.weight_pct)
  if (activeClass.value === 'ALL') return sorted
  return sorted.filter((p) => p.asset_class === activeClass.value)
})

const dividendNext60Total = computed(() =>
  DIVIDEND_CALENDAR_NEXT_60D.reduce((s, d) => s + d.amount, 0),
)

// ============ Format helpers ============

function formatDay(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return String(d.getDate()).padStart(2, '0')
}
function formatMonthShort(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toLowerCase()
}
function formatDateLong(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    .replace(/^./, (c) => c.toUpperCase())
}

function labelColor(kind: string): string {
  if (kind === 'JCP') return brand.colors.warning || '#f59e0b'
  if (kind === 'Dividendo') return brand.colors.positive
  return brand.colors.primary
}

function eventTint(kind: 'ex' | 'pay' | 'earnings' | 'rotate' | 'maturity'): string {
  switch (kind) {
    case 'pay': return brand.colors.positive
    case 'ex': return brand.colors.primary
    case 'earnings': return '#a78bfa'
    case 'rotate': return '#60a5fa'
    case 'maturity': return brand.colors.warning || '#f59e0b'
  }
}
function eventIcon(kind: 'ex' | 'pay' | 'earnings' | 'rotate' | 'maturity'): string {
  switch (kind) {
    case 'pay': return 'i-lucide-coins'
    case 'ex': return 'i-lucide-calendar-clock'
    case 'earnings': return 'i-lucide-bar-chart-3'
    case 'rotate': return 'i-lucide-repeat'
    case 'maturity': return 'i-lucide-flag'
  }
}
</script>

<style scoped>
.mock-eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.mock-meta {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.metric-card {
  transition: border-color 160ms ease-out, background-color 160ms ease-out;
}
.metric-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 28%, transparent);
}
.position-row:hover {
  background-color: color-mix(in srgb, var(--brand-primary) 4%, transparent);
}
.th {
  padding: 10px 16px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.th-num {
  text-align: right;
}
.td {
  padding: 12px 16px;
  font-size: 12.5px;
  color: var(--brand-text);
}
.td-num {
  text-align: right;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
}
</style>

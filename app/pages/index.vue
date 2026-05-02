<template>
  <NuxtLayout :name="layoutName" title="Visão geral">
    <div class="flex flex-col">
    <!-- Hero — always rendered in SSR (was wrapped in ClientOnly before, which
         caused a 0.578 CLS spike when the ~700px hero popped in after hydration,
         pushing every other section down).
         The auth store's persisted state hasn't hydrated from localStorage at
         SSR time, so `authStore.isAuthenticated` reads its initial value of
         `false` — matching what we want for the marketing landing where 95%+
         of visitors are unauth. After Pinia hydrates on client, authed users
         briefly see the hero before it hides via reactivity (acceptable trade
         since auth users on / is an edge case; the layout switches to
         `default` anyway). -->
    <HomeHero
      v-if="showSection('hero') && !authStore.isAuthenticated"
      :style="{ order: sectionOrder('hero') }"
      :ibov-series="ibovChartData"
      :ibov-last-price="ibovLastPrice"
      :ibov-indicator="ibovIndicator"
      :ibov-variation-color="ibovVariationColor"
      :ifix-last-price="ifixLastPrice"
      :ifix-indicator="ifixIndicator"
    />

    <!-- Ticker rail logo abaixo do hero. Banda full-bleed (zero
         padding lateral, sem max-width, sem cantos arredondados) que
         se cola visualmente na base do hero como uma "régua" de
         mercado. Apenas border-bottom de 1 px pra separar da seção
         seguinte. Duas instâncias do carrossel porque a variante big
         renderiza logos + preço maiores no desktop; mobile usa a
         versão compacta. -->
    <div
      class="w-full border-b py-4"
      style="background: var(--bg-elevated); border-bottom-color: var(--border-subtle);"
    >
      <AtomsTickerCarousel
        class="w-full max-md:hidden"
        big
        no-control
        :items="tickerCarouselItems"
      />
      <AtomsTickerCarousel
        class="w-full md:hidden"
        no-control
        :items="tickerCarouselItems"
      />
    </div>

    <!-- BRIDGE: conector visual entre o hero e a secao seguinte (mercado).
         Linha vertical amber decrescente + eyebrow "Mercado ao vivo" +
         chevron com bounce sutil. Aparece em DOM order logo apos o hero
         (sem order explicito → default 0, mesmo do hero, resolve por DOM). -->
    <div
      v-if="!authStore.isAuthenticated"
      class="qs-bridge relative flex items-center justify-center pt-6 pb-2 md:pt-8 md:pb-3"
      aria-hidden="true"
    >
      <!-- Linha vertical fading no centro -->
      <div
        class="absolute left-1/2 top-0 h-[60%] w-px -translate-x-1/2"
        :style="{ background: `linear-gradient(180deg, color-mix(in srgb, ${brand.colors.primary} 30%, transparent), transparent 100%)` }"
      />
      <!-- Cluster: eyebrow + chevron animado -->
      <div class="relative flex flex-col items-center gap-1.5 px-4" :style="{ backgroundColor: 'var(--bg-base)' }">
        <span class="text-[10px] font-medium uppercase tracking-[0.18em]" :style="{ color: 'var(--text-muted)' }">
          Mercado ao vivo
        </span>
        <UIcon
          name="i-lucide-chevron-down"
          class="size-4 motion-safe:animate-bounce"
          :style="{ color: 'var(--brand-primary)', animationDuration: '2.4s' }"
        />
      </div>
    </div>

    <!-- Calculadora de Impacto / Poder do Tempo -->
    <MoleculesWealthProjection v-if="showSection('wealthCalculator') && brand.wealthCalculator && !authStore.isAuthenticated" :style="{ order: sectionOrder('wealthCalculator') }" />

    <!-- Personagens / Universo da marca -->
    <MoleculesCharacterShowcase v-if="showSection('characters') && brand.characters && !authStore.isAuthenticated" :style="{ order: sectionOrder('characters') }" />

    <!-- Checklist / Roteiro do Investidor -->
    <MoleculesInvestorChecklist v-if="showSection('investorChecklist') && brand.investorChecklist && !authStore.isAuthenticated" :style="{ order: sectionOrder('investorChecklist') }" />

    <!-- Seção de Mercado ao Vivo — quiet style (lightness as luxury). -->
    <div v-if="showSection('market')" :style="{ order: sectionOrder('market') }" class="flex h-auto flex-col gap-6 pt-12 md:pt-16">
      <!-- Editorial data band: ambient amber radial + floating chart/ticker card -->
      <div class="relative flex flex-col gap-10">
        <!-- Move 2: ambient amber radial glow (offset top-center, behind data) -->
        <div
          class="pointer-events-none absolute inset-x-0 -top-16 -z-10 h-[640px] overflow-hidden"
          aria-hidden="true"
        >
          <div
            class="mx-auto h-full w-[110%] max-w-[1280px] -translate-y-8"
            :style="{ background: `radial-gradient(ellipse 60% 80% at 50% 0%, color-mix(in srgb, ${brand.colors.primary} 28%, transparent), transparent 65%)`, filter: 'blur(160px)' }"
          />
        </div>

        <!-- BENTO LAYOUT: IBOV grande (col 1-8 × row 1-2) + 4 ticker cards
             menores (PETR4, VALE3, AAPL34, TSLA34) num 2x2 a direita. Mobile
             colapsa em coluna unica com IBOV no topo + 2x2 abaixo. -->
        <div class="market-bento grid grid-cols-2 gap-4 px-4 md:grid-cols-12 md:grid-rows-2 md:px-0">
          <!-- Move 3: chart + ticker rail unificados em card flutuante premium
               Header e palette adaptados do hero card (live preview) — peach gradient
               interno, "Ao vivo · {clock}" + B3 pill, asset name + big number + change pill,
               linha "Hoje, ... pts" no estilo do quiet hero.
               Bento: span 2 cols (mobile) / 8 cols + 2 rows (md+). -->
          <article
            class="ibov-editorial-card relative col-span-2 overflow-hidden rounded-2xl border transition-shadow duration-300 md:col-span-8 md:row-span-2"
          style="background: var(--bg-elevated); border-color: var(--border-subtle); box-shadow: var(--shadow-card);"
        >
          <!-- Atmospheric peach radial bg, top-right offset (mesma direção do hero) -->
          <div
            class="pointer-events-none absolute inset-0"
            aria-hidden="true"
            :style="{
              background: `radial-gradient(ellipse 70% 60% at 90% -10%, color-mix(in srgb, ${brand.colors.primary} 22%, transparent), transparent 65%)`,
            }"
          />
          <!-- Sutil rose secundário, bottom-left, equilibra a composição -->
          <div
            class="pointer-events-none absolute inset-0"
            aria-hidden="true"
            :style="{
              background: `radial-gradient(ellipse 50% 50% at 5% 110%, color-mix(in srgb, ${brand.colors.primary} 10%, transparent), transparent 60%)`,
            }"
          />

          <!-- Chart header (hero card style) + chart -->
          <div class="relative flex w-full flex-col gap-5 px-5 pb-5 pt-6 md:px-7 md:pb-6 md:pt-7">
            <!-- Status line: dot Ao vivo · clock + B3 pill -->
            <header class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-[13px]" style="color: var(--text-muted);">
                <span class="relative flex size-2" aria-hidden="true">
                  <span
                    v-if="marketStatus.animate"
                    class="absolute inline-flex h-full w-full rounded-full opacity-70 motion-safe:animate-ping"
                    :style="{ backgroundColor: marketStatus.color }"
                  />
                  <span class="relative inline-flex size-2 rounded-full" :style="{ backgroundColor: marketStatus.color }" />
                </span>
                <span class="font-medium" style="color: var(--text-body);" translate="no">{{ marketStatus.label }}</span>
                <span style="color: var(--text-muted);" aria-hidden="true">·</span>
                <span class="tabular-nums" style="color: var(--text-muted);" translate="no">{{ ibovClock || '—' }}</span>
              </div>
              <span
                class="rounded-md px-2 py-0.5 text-[11px] font-medium tabular-nums"
                style="background: color-mix(in srgb, var(--text-heading) 6%, transparent); color: var(--text-label);"
                translate="no"
              >B3</span>
            </header>

            <!-- Asset name + ticker -->
            <div class="flex items-baseline gap-2">
              <h3 class="text-[16px] font-medium" style="color: var(--text-heading);" translate="no">Ibovespa</h3>
              <span class="text-[14px]" style="color: var(--text-muted);" translate="no">IBOV</span>
            </div>

            <!-- Linha principal: big number + change pill + period
                 selector compacto, todos no mesmo eixo horizontal.
                 `dropdown` força o select pequeno (em vez do segmented
                 de 4 pílulas) pra a row caber bem mesmo em narrow card.
                 `Hoje, -X pts` segue na linha de baixo dentro do
                 mesmo wrapper. -->
            <div class="flex w-full flex-col gap-1.5">
              <div class="flex flex-wrap items-center gap-3">
                <p
                  class="font-light leading-none tabular-nums text-[28px] md:text-[44px]"
                  style="color: var(--text-heading); letter-spacing: -0.03em;"
                  aria-label="Cotação atual do IBOV"
                  translate="no"
                >
                  {{ fmt.brl(ibovLastPrice) }}
                </p>
                <span
                  class="rounded-md px-2 py-1 text-[12px] font-medium tabular-nums"
                  :style="{
                    backgroundColor: `color-mix(in srgb, ${ibovVariationColor} 16%, transparent)`,
                    color: ibovVariationColor,
                  }"
                  translate="no"
                >{{ ibovIndicator }}</span>
                <MoleculesPeriodSelector
                  v-model="selectedTimeRange"
                  :loading="loading"
                  :dropdown="true"
                  class="ml-auto"
                />
              </div>
              <p
                v-if="ibovDeltaPtsFormatted"
                class="text-[12px]"
                style="color: var(--text-muted);"
                translate="no"
              >
                Hoje, <span class="tabular-nums" :style="{ color: ibovVariationColor }">{{ ibovDeltaPtsFormatted }}</span>
              </p>
            </div>

            <AtomsGraphLine
              :data="ibovChartData"
              :legend="ibovChartLabel"
              :height="280"
              :loading="loading"
            />
          </div>
          <!-- Ticker rail moved out of the card. Lives below the bento
               as a full-width band (see end of `.market-bento` block).
               This way the IBOV card stays a focused price-explorer
               surface and the rail doesn't compete for attention with
               the chart. -->
        </article>

          <!-- Mini bento ticker cards (PETR4, VALE3, AAPL34, TSLA34).
               Cada um span col-2 row-1 (md+), mobile span col-1 row-1 (col-span-1 = 1 das 2 cols mobile).
               Layout interno: header com logo+ticker+nome / preco grande / change pill+sparkline. -->
          <NuxtLink
            v-for="ticker in bentoTickers"
            :key="ticker.code"
            :to="`/asset/${ticker.code.toLowerCase()}`"
            class="bento-ticker group relative col-span-1 overflow-hidden rounded-2xl border transition-all hover:-translate-y-0.5 md:col-span-2 md:row-span-1"
            :style="{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
            }"
          >
            <!-- Accent radial sutil tinted pela direcao -->
            <div
              class="pointer-events-none absolute inset-0"
              aria-hidden="true"
              :style="{
                background: `radial-gradient(ellipse 70% 60% at 90% -20%, color-mix(in srgb, ${ticker.change >= 0 ? brand.colors.positive : brand.colors.negative} 14%, transparent), transparent 65%)`,
              }"
            />
            <div class="relative flex h-full flex-col justify-between gap-3 p-4">
              <!-- Top: logo + ticker + nome -->
              <header class="flex items-center gap-2.5">
                <div
                  class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border"
                  :style="{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-overlay)' }"
                >
                  <img
                    v-if="ticker.logo"
                    :src="ticker.logo"
                    :alt="`Logo ${ticker.code}`"
                    class="size-full object-cover"
                    @error="$event.target.style.display='none'"
                  />
                  <span
                    v-else
                    class="font-mono-tab text-[9px] font-bold"
                    :style="{ color: 'var(--text-muted)' }"
                  >{{ ticker.code.slice(0, 2) }}</span>
                </div>
                <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span class="truncate text-[14px] font-medium leading-none" :style="{ color: 'var(--text-heading)' }" translate="no">{{ ticker.code }}</span>
                  <span class="truncate text-[10px]" :style="{ color: 'var(--text-muted)' }">{{ ticker.name }}</span>
                </div>
              </header>

              <!-- Mini sparkline SVG: amber stroke + soft fill que segue a direcao -->
              <svg
                viewBox="0 0 120 32"
                preserveAspectRatio="none"
                class="h-8 w-full"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient :id="`bento-fill-${ticker.code}`" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" :stop-color="ticker.change >= 0 ? brand.colors.positive : brand.colors.negative" stop-opacity="0.18" />
                    <stop offset="100%" :stop-color="ticker.change >= 0 ? brand.colors.positive : brand.colors.negative" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <path
                  :d="bentoSparklineArea(ticker.sparkline)"
                  :fill="`url(#bento-fill-${ticker.code})`"
                />
                <path
                  :d="bentoSparklineLine(ticker.sparkline)"
                  fill="none"
                  :stroke="ticker.change >= 0 ? brand.colors.positive : brand.colors.negative"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  vector-effect="non-scaling-stroke"
                />
              </svg>

              <!-- Bottom: preco grande + change pill -->
              <div class="flex items-end justify-between gap-2">
                <p
                  class="font-light leading-none tabular-nums text-[20px]"
                  :style="{ color: 'var(--text-heading)', letterSpacing: '-0.02em' }"
                  translate="no"
                >{{ ticker.price }}</p>
                <span
                  class="rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums"
                  :style="{
                    backgroundColor: `color-mix(in srgb, ${ticker.change >= 0 ? brand.colors.positive : brand.colors.negative} 14%, transparent)`,
                    color: ticker.change >= 0 ? brand.colors.positive : brand.colors.negative,
                  }"
                  translate="no"
                >{{ ticker.change >= 0 ? '+' : '' }}{{ ticker.change.toFixed(2) }}%</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>


      <div class="flex items-end justify-between gap-4 px-4 pt-10 md:px-0">
        <div class="flex flex-col gap-2">
          <span class="eyebrow">Mercado ao vivo</span>
          <h2 class="font-light leading-tight text-[28px] md:text-[36px]" style="color: var(--text-heading); letter-spacing: -0.025em;">
            {{ brand.homeTexts.marketTitle }}
          </h2>
          <p class="text-[14px] leading-relaxed" style="color: var(--text-body);">
            {{ brand.homeTexts.marketSubtitle }}
          </p>
        </div>
        <!-- View toggle: padrao oficial AtomsSegmented (design/IDENTITY.md secao 3.3) -->
        <AtomsSegmented
          v-model="viewMode"
          :options="[
            { value: 'list', label: 'List', icon: 'i-lucide-list', ariaLabel: 'Visualização em lista' },
            { value: 'map', label: 'Map', icon: 'i-lucide-grid-2x2', ariaLabel: 'Visualização em mapa de calor' },
          ]"
          aria-label="Modo de visualização dos rankings"
          hide-label-on-mobile
        />
      </div>

      <div v-if="showMap" class="mb-6 flex flex-col">
        <!-- Treemap filter: AtomsSegmented oficial (design/IDENTITY.md secao 3.3) -->
        <div class="mx-auto mb-5 mt-6 max-md:mx-6">
          <AtomsSegmented
            v-model="treemapFilter"
            :options="[
              { value: 'all', label: 'Todos' },
              { value: 'positive', label: 'Altas' },
              { value: 'negative', label: 'Baixas' },
            ]"
            aria-label="Filtro do mapa de calor"
          />
        </div>
        <LazyAtomsGraphTreemap
          :data="stocksData"
          :height="550"
          :show-positive="
            treemapFilter === 'all' || treemapFilter === 'positive'
          "
          :show-negative="
            treemapFilter === 'all' || treemapFilter === 'negative'
          "
        />
      </div>
      <template v-else>
        <!-- Maiores Altas -->
        <UCarousel
          v-slot="{ item }"
          class="w-full"
          loop
          :items="assetCategories"
          :ui="{ item: 'basis-1/1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4', container: 'bg-transparent' }"
        >
          <div
            class="flex w-full flex-col gap-2 px-2 py-4"
            :class="rankingCardClass"
            :style="rankingCardStyle(brand.colors.positive)"
          >
            <!-- Header quiet: eyebrow positive sutil + h3 normal weight, ver todos como link inline -->
            <div class="mb-4 flex items-end justify-between border-b pb-3" style="border-color: var(--border-subtle);">
              <div class="flex flex-col gap-1">
                <span class="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em]" :style="{ color: 'var(--brand-positive)' }" translate="no">
                  <UIcon name="i-lucide-trending-up" class="h-3 w-3" aria-hidden="true" />
                  Maiores altas
                </span>
                <h3 class="text-[15px] font-medium leading-tight" style="color: var(--text-heading);">{{ item.label }}</h3>
              </div>
              <NuxtLink
                :to="{ path: '/search', query: rankingLinkQueries.top[item.key] }"
                class="inline-flex items-center gap-1 text-[12px] font-medium transition-colors hover:underline"
                :style="{ color: 'var(--brand-primary)' }"
                :aria-label="`Ver todos ${item.label} em alta`"
              >
                <span>Ver todos</span>
                <UIcon name="i-lucide-arrow-right" class="h-3 w-3" aria-hidden="true" />
              </NuxtLink>
            </div>
            <!-- Lista -->
            <div class="flex flex-col">
              <AtomsTickerListItem
                v-for="stock in sliceRanking(topAssets.top[item.key])"
                :key="stock?.ticker"
                :stock="stock"
                class="border-b"
                :style="{ borderColor: brand.colors.border }"
              />
            </div>
          </div>
        </UCarousel>

        <!-- Maiores Baixas -->
        <UCarousel
          v-slot="{ item }"
          class="w-full"
          loop
          :items="assetCategories"
          :ui="{ item: 'basis-1/1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4', container: 'bg-transparent' }"
        >
          <div
            class="flex w-full flex-col gap-2 px-2 py-4"
            :class="rankingCardClass"
            :style="rankingCardStyle(brand.colors.negative)"
          >
            <!-- Header quiet: eyebrow negative sutil + h3 normal, ver todos link -->
            <div class="mb-4 flex items-end justify-between border-b pb-3" style="border-color: var(--border-subtle);">
              <div class="flex flex-col gap-1">
                <span class="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em]" :style="{ color: 'var(--brand-negative)' }" translate="no">
                  <UIcon name="i-lucide-trending-down" class="h-3 w-3" aria-hidden="true" />
                  Maiores baixas
                </span>
                <h3 class="text-[15px] font-medium leading-tight" style="color: var(--text-heading);">{{ item.label }}</h3>
              </div>
              <NuxtLink
                :to="{ path: '/search', query: rankingLinkQueries.bottom[item.key] }"
                class="inline-flex items-center gap-1 text-[12px] font-medium transition-colors hover:underline"
                :style="{ color: 'var(--brand-primary)' }"
                :aria-label="`Ver todos ${item.label} em queda`"
              >
                <span>Ver todos</span>
                <UIcon name="i-lucide-arrow-right" class="h-3 w-3" aria-hidden="true" />
              </NuxtLink>
            </div>
            <!-- Lista -->
            <div class="flex flex-col">
              <AtomsTickerListItem
                v-for="stock in sliceRanking(topAssets.bottom[item.key])"
                :key="stock?.ticker"
                :stock="stock"
                class="border-b"
                :style="{ borderColor: brand.colors.border }"
              />
            </div>
          </div>
        </UCarousel>
      </template>

      <!-- Crypto rankings — depois dos filtros inteligentes pra manter o
           ritmo: primeiro a grid do B3, depois atalhos, depois cripto,
           depois tesouro. Só renderiza pra tenants que tão na variante
           terminal (Redentia) porque o bloco tá dentro desse v-if. -->
      <LazyMoleculesCryptoRankings />

      <!-- Tesouro Direto — após rankings + filtros inteligentes -->
      <div class="px-4 md:px-0">
        <LazyMoleculesTesouroSection />
      </div>
    </div>


    <!-- QuickSearch showcase: banner largo + altura modesta vendendo a busca
         inteligente. Demonstra o ⌘K rotacionando queries reais com results
         vivos. Edge-to-edge na largura (escapa do main padding via -mx-4).
         Posicionado logo antes das noticias — bridge abaixo conecta as 2. -->
    <section
      v-if="!authStore.isAuthenticated"
      class="qs-showcase relative overflow-hidden border-t md:-mx-4"
      :style="{
        order: (sectionOrder('news') ?? 0) - 1,
        borderColor: 'var(--border-subtle)',
        background: `linear-gradient(180deg, transparent 0%, color-mix(in srgb, ${brand.colors.primary} 5%, transparent) 50%, color-mix(in srgb, ${brand.colors.primary} 3%, transparent) 100%)`,
      }"
    >
      <!-- Radial subtle accent atras -->
      <div
        class="pointer-events-none absolute inset-0"
        aria-hidden="true"
        :style="{ background: `radial-gradient(ellipse 50% 80% at 70% 50%, color-mix(in srgb, ${brand.colors.primary} 10%, transparent), transparent 65%)` }"
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
          <div class="mt-5 inline-flex items-center gap-2 text-[12px]" :style="{ color: 'var(--text-muted)' }">
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

        <!-- Right: QuickSearch demo (mockup live) -->
        <div class="md:col-span-7">
          <div
            class="qs-mock relative rounded-2xl border p-2 backdrop-blur-md"
            :style="{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'color-mix(in srgb, var(--bg-elevated) 94%, transparent)',
              boxShadow: `0 30px 60px -25px color-mix(in srgb, ${brand.colors.primary} 24%, transparent), 0 8px 24px -12px rgba(0,0,0,0.08)`,
            }"
          >
            <!-- Search input com query rotacionando -->
            <div class="flex items-center gap-3 rounded-xl px-4 py-3" :style="{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }">
              <UIcon name="i-lucide-search" class="size-4 shrink-0" :style="{ color: 'var(--text-muted)' }" />
              <span class="flex-1 truncate text-[14px]" :style="{ color: 'var(--text-heading)' }" translate="no">
                {{ qsCurrentDemo.query }}<span class="qs-cursor" :style="{ backgroundColor: 'var(--brand-primary)' }" aria-hidden="true" />
              </span>
              <kbd
                class="inline-flex shrink-0 items-center gap-0.5 rounded-md border px-2 py-0.5 font-mono-tab text-[10px]"
                :style="{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-overlay)', color: 'var(--text-muted)' }"
                aria-hidden="true"
              >
                <span>{{ qsShortcutModifier }}</span>
                <span>K</span>
              </kbd>
            </div>

            <!-- Results animados, troca conforme a query -->
            <Transition name="qs-results" mode="out-in">
              <ul :key="qsActiveDemoIdx" class="mt-2 flex flex-col gap-0.5 px-1 py-1">
                <li
                  v-for="result in qsCurrentDemo.results.slice(0, 2)"
                  :key="result.title"
                  class="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
                  :style="{ backgroundColor: result.highlight ? `color-mix(in srgb, ${brand.colors.primary} 8%, transparent)` : 'transparent' }"
                >
                  <span
                    class="flex size-7 shrink-0 items-center justify-center rounded-md text-[11px] font-medium"
                    :style="{
                      backgroundColor: `color-mix(in srgb, ${result.color} 14%, transparent)`,
                      color: result.color,
                    }"
                  >{{ result.icon }}</span>
                  <div class="flex min-w-0 flex-1 flex-col">
                    <span class="truncate text-[13px] font-medium leading-none" :style="{ color: 'var(--text-heading)' }" translate="no">{{ result.title }}</span>
                    <span class="mt-1 truncate text-[11px]" :style="{ color: 'var(--text-muted)' }">{{ result.subtitle }}</span>
                  </div>
                  <span
                    v-if="result.value"
                    class="font-mono-tab text-[12px] tabular-nums"
                    :style="{ color: result.valueColor || 'var(--text-body)' }"
                    translate="no"
                  >{{ result.value }}</span>
                </li>
              </ul>
            </Transition>

            <!-- Footer mock: hint + atalho enter -->
            <div class="mt-1 flex items-center justify-between border-t px-3 py-2 text-[11px]" :style="{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }">
              <span class="inline-flex items-center gap-1.5">
                <UIcon name="i-lucide-sparkles" class="size-3" :style="{ color: 'var(--brand-primary)' }" />
                Resultados ao vivo, sem digitar a página inteira
              </span>
              <span class="inline-flex items-center gap-1">
                <kbd class="rounded border px-1.5 py-0.5 font-mono-tab text-[10px]" :style="{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-overlay)' }">↵</kbd>
                <span>abrir</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- News Section — feed de notícias de mercado (apenas Redentia por enquanto) -->
    <MoleculesNewsSection v-if="showSection('news')" :style="{ order: sectionOrder('news') }" class="px-4 md:px-0" />

    <!-- Metrics Section com contador gigante -->
    <MoleculesMetricsSection v-if="showSection('metrics') && !authStore.isAuthenticated" :style="{ order: sectionOrder('metrics') }" />

    <!-- Feature Tabs por perfil -->
    <MoleculesFeatureTabs v-if="showSection('featureTabs') && !authStore.isAuthenticated" :style="{ order: sectionOrder('featureTabs') }" class="mt-8" />

    <!-- Marquee de Tags em movimento -->
    <LazyAtomsMarqueeFeatures v-if="showSection('marquee') && !authStore.isAuthenticated" :style="{ order: sectionOrder('marquee') }" />

    <!-- Conteudo Educacional -->
    <MoleculesEducationalContent v-if="showSection('educational')" :style="{ order: sectionOrder('educational') }" class="mt-12" />

    <!-- Produtos e Cursos (Netflix-style) -->
    <MoleculesProductsCarousel v-if="showSection('products')" :style="{ order: sectionOrder('products') }" class="mt-12" />

    <!-- Seção Invista por Categoria -->
    <section v-if="showSection('categories')" :style="{ order: sectionOrder('categories') }" class="mt-12 px-6 pt-6">
      <div class="flex flex-col gap-6">
        <div class="text-center">
          <p class="mb-2 text-xs uppercase tracking-[0.2em]" :style="{ color: brand.colors.textMuted }">
            {{ brand.homeTexts.categoriesEyebrow }}
          </p>
          <h2 class="mb-2 text-2xl md:text-3xl" :class="[brand.font.headingWeight, brand.font.headingStyle]" :style="{ color: brand.colors.text }">
            {{ brand.homeTexts.categoriesTitle }}
          </h2>
          <p class="text-sm md:text-base" :style="{ color: brand.colors.textMuted }">
            {{ brand.homeTexts.categoriesSubtitle }}
          </p>
        </div>

        <div class="grid gap-4" :class="categoryGridCols">
          <!-- Variant: icon-left (Primo Rico, icon beside title, description, CTA) -->
          <template v-if="brand.homePage.categoryCard.variant === 'icon-left'">
            <NuxtLink
              v-for="cat in brand.homePage.categories"
              :key="cat.to"
              :to="cat.to"
              class="group flex flex-col gap-3 border p-6 transition-[transform,opacity,box-shadow,background-color,border-color,filter] brand-card"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
            >
              <div class="flex items-center gap-3">
                <div class="bg-secondary/20 p-3 brand-pill">
                  <UIcon :name="cat.icon" class="text-secondary h-6 w-6" />
                </div>
                <h3 class="text-[18px] font-medium group-hover:text-secondary" :style="{ color: brand.colors.text, letterSpacing: '-0.22px' }">{{ cat.label }}</h3>
              </div>
              <p v-if="cat.description" class="text-sm" :style="{ color: brand.colors.textMuted }">
                {{ cat.description }}
              </p>
              <div class="flex items-center gap-2 text-secondary text-sm font-medium">
                <span>{{ cat.cta }}</span>
                <UIcon name="i-lucide-arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </NuxtLink>
          </template>

          <!-- Variant: icon-top (Me Poupe, icon centered above, spacious, friendly) -->
          <template v-else-if="brand.homePage.categoryCard.variant === 'icon-top'">
            <NuxtLink
              v-for="cat in brand.homePage.categories"
              :key="cat.to"
              :to="cat.to"
              class="group flex flex-col items-center gap-4 border p-8 text-center transition-[transform,opacity,box-shadow,background-color,border-color,filter] brand-card"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
            >
              <div class="bg-secondary/20 p-4 brand-pill">
                <UIcon :name="cat.icon" class="text-secondary h-8 w-8" />
              </div>
              <h3 class="text-[18px] font-medium group-hover:text-secondary" :style="{ color: brand.colors.text, letterSpacing: '-0.22px' }">{{ cat.label }}</h3>
              <p v-if="cat.description" class="text-sm" :style="{ color: brand.colors.textMuted }">
                {{ cat.description }}
              </p>
              <span class="mt-auto flex items-center gap-1 text-secondary text-sm font-semibold">
                {{ cat.cta }}
                <UIcon name="i-lucide-arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </NuxtLink>
          </template>

          <!-- Variant: minimal (Sardinha, compact, left border accent, no icon) -->
          <template v-else>
            <NuxtLink
              v-for="cat in brand.homePage.categories"
              :key="cat.to"
              :to="cat.to"
              class="category-minimal group flex items-center justify-between border-l-2 py-3 pl-4 pr-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              :style="{ borderLeftColor: brand.colors.primary, '--hover-bg': `${brand.colors.textMuted}0D` } as Record<string, string>"
            >
              <span class="text-sm font-medium" :style="{ color: brand.colors.text }">{{ cat.label }}</span>
              <span class="flex items-center gap-1 text-xs font-medium" :style="{ color: brand.colors.primary }">
                {{ cat.cta }}
                <UIcon name="i-lucide-chevron-right" class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </NuxtLink>
          </template>
        </div>
      </div>
    </section>

    <!-- Seção Blog / Guias Educacionais - Bento grid editorial -->
    <section v-if="showSection('guides')" :style="{ order: sectionOrder('guides') }" class="px-4 pt-12 md:px-0">
      <header class="mb-8 flex flex-col gap-2">
        <span class="eyebrow">Guias e estudos</span>
        <h2 class="font-light leading-tight text-[28px] md:text-[36px]" style="color: var(--text-heading); letter-spacing: -0.025em;">
          {{ brand.homeTexts.guidesTitle }}
        </h2>
        <p class="text-[14px] leading-relaxed" style="color: var(--text-body);">
          {{ guidesHero.length + guidesMedium.length + guidesTiles.length }} estudos disponíveis, 4 trilhas ativas e ferramentas para aprofundar.
        </p>
      </header>

      <!-- Bento: hero (2x2) + 4 medium + 8 compact tiles -->
      <div class="bento-guides grid gap-px" :style="{ backgroundColor: brand.colors.border }">
        <!-- HERO card: col-span 2, row-span 2 -->
        <NuxtLink
          :to="guidesHero[0].to"
          class="bento-guides-hero group relative flex flex-col justify-between overflow-hidden p-6 transition-[transform,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset md:p-10"
          :style="{ backgroundColor: brand.colors.surface }"
          :aria-label="`Ler ${guidesHero[0].titulo}`"
        >
          <!-- Ambient radial glow -->
          <div
            class="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
            :style="{ background: `radial-gradient(ellipse at 80% 20%, ${brand.colors.primary}22, transparent 60%), radial-gradient(ellipse at 20% 90%, ${brand.colors.primary}10, transparent 55%)` }"
            aria-hidden="true"
          />
          <!-- Top row: eyebrow categoria + arrow circle -->
          <div class="relative flex items-start justify-between gap-4">
            <span class="eyebrow" translate="no">
              Estudo em destaque · {{ guidesHero[0].categoria }}
            </span>
            <div
              class="flex size-10 items-center justify-center rounded-md transition-all duration-200 group-hover:translate-x-1 group-hover:-translate-y-px"
              style="background-color: var(--brand-primary); color: #fff;"
              aria-hidden="true"
            >
              <UIcon name="i-lucide-arrow-up-right" class="size-5" />
            </div>
          </div>

          <!-- Middle: icon + title + description -->
          <div class="relative flex flex-col gap-5">
            <div
              class="flex size-14 items-center justify-center rounded-lg md:size-16"
              style="background-color: color-mix(in srgb, var(--brand-primary) 14%, transparent); color: var(--brand-primary);"
              aria-hidden="true"
            >
              <UIcon :name="guidesHero[0].icon" class="size-7 md:size-8" />
            </div>
            <div class="flex flex-col gap-3">
              <h3
                class="font-light leading-[1.1] text-[28px] sm:text-[32px] md:text-[40px]"
                style="color: var(--text-heading); letter-spacing: -0.025em;"
              >
                {{ guidesHero[0].titulo }}
              </h3>
              <p
                class="max-w-xl text-[15px] leading-relaxed md:text-[16px]"
                style="color: var(--text-body);"
              >
                {{ guidesHero[0].descricao }}
              </p>
            </div>
          </div>

          <!-- Bottom metadata: caption sem mono -->
          <div class="relative flex items-center gap-3 text-[12px]" style="color: var(--text-muted);">
            <span class="inline-flex items-center gap-1.5" translate="no">
              <UIcon name="i-lucide-clock" class="size-3" aria-hidden="true" />
              {{ guidesHero[0].tempoLeitura }} min de leitura
            </span>
            <span aria-hidden="true">·</span>
            <span translate="no">Atualizado 04 jan 2026</span>
          </div>
        </NuxtLink>

        <!-- 4 medium cards: 1 col each -->
        <NuxtLink
          v-for="(guide, idx) in guidesMedium"
          :key="`gm-${guide.to}`"
          :to="guide.to"
          class="bento-guides-medium group relative flex flex-col justify-between gap-4 overflow-hidden p-5 transition-[transform,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
          :style="{ backgroundColor: brand.colors.surface }"
          :aria-label="`Ler ${guide.titulo}`"
        >
          <div class="flex items-start justify-between gap-3">
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-lg transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-300 group-hover:scale-110"
              :style="{ backgroundColor: `${brand.colors.primary}14`, color: brand.colors.primary }"
              aria-hidden="true"
            >
              <UIcon :name="guide.icon" class="size-5" />
            </div>
          </div>

          <h3
            class="line-clamp-2 text-[15px] font-medium leading-snug transition-colors"
            style="color: var(--text-heading);"
          >
            {{ guide.titulo }}
          </h3>

          <div class="flex items-center justify-between gap-2 text-[12px]" style="color: var(--text-muted);">
            <span translate="no">{{ guide.categoria }}</span>
            <span class="inline-flex items-center gap-1" translate="no">
              {{ guide.tempoLeitura }} min
              <UIcon
                name="i-lucide-arrow-up-right"
                class="size-3 opacity-0 transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                :style="{ color: brand.colors.primary }"
                aria-hidden="true"
              />
            </span>
          </div>
        </NuxtLink>

        <!-- 8 compact tiles (full row on bottom, 4 cols each row) -->
        <NuxtLink
          v-for="guide in guidesTiles"
          :key="`gt-${guide.to}`"
          :to="guide.to"
          class="bento-guides-tile group relative flex items-center gap-3 overflow-hidden p-3 transition-[transform,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
          :style="{ backgroundColor: brand.colors.surface }"
          :aria-label="`Abrir ${guide.titulo}`"
        >
          <div
            class="flex size-8 shrink-0 items-center justify-center rounded-md transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-300 group-hover:scale-110"
            :style="{ backgroundColor: `${brand.colors.primary}14`, color: brand.colors.primary }"
            aria-hidden="true"
          >
            <UIcon :name="guide.icon" class="size-4" />
          </div>
          <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <h4
              class="line-clamp-1 text-[13px] font-medium leading-snug transition-colors"
              style="color: var(--text-heading);"
            >
              {{ guide.titulo }}
            </h4>
            <span
              class="text-[11px]"
              style="color: var(--text-muted);"
              translate="no"
            >
              {{ guide.tempoLeitura }} min · {{ guide.categoria }}
            </span>
          </div>
          <UIcon
            name="i-lucide-arrow-up-right"
            class="size-3.5 shrink-0 opacity-0 transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
            :style="{ color: brand.colors.primary }"
            aria-hidden="true"
          />
        </NuxtLink>
      </div>

      <!-- CTA: ver todos — quiet ghost button (rounded-md, sem mono, sem uppercase) -->
      <div class="mt-8 flex justify-center">
        <NuxtLink
          to="/guias"
          class="group quiet-btn-ghost"
        >
          <UIcon name="i-lucide-book-open" class="size-4" aria-hidden="true" />
          <span>Ver todos os guias</span>
          <UIcon
            name="i-lucide-arrow-right"
            class="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </NuxtLink>
      </div>
    </section>

    <!-- Testimonials Section -->
    <MoleculesTestimonialsSection v-if="showSection('testimonials') && !authStore.isAuthenticated" :style="{ order: sectionOrder('testimonials') }" class="mt-12" />

    <!-- Seção de IA -->
    <section v-if="showSection('aiCta') && !authStore.isAuthenticated" :style="{ order: sectionOrder('aiCta'), borderColor: brand.colors.border }" class="border-t px-4 pt-16 md:px-6">
      <div class="mx-auto max-w-5xl">
        <!-- Header -->
        <div class="mb-10 text-center">
          <div class="mb-4 inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 brand-pill">
            <IconAi class="fill-secondary h-4 w-4" />
            <span class="text-sm font-medium text-secondary">{{ brand.homeTexts.aiCtaEyebrow }}</span>
          </div>
          <h2 class="mb-3 text-2xl md:text-3xl lg:text-4xl" :class="[brand.font.headingWeight, brand.font.headingStyle]" :style="{ color: brand.colors.text }">
            {{ brand.homeTexts.aiCtaTitle }}
          </h2>
          <p class="mx-auto max-w-xl" :style="{ color: brand.colors.textMuted }">
            {{ brand.homeTexts.aiCtaSubtitle }}
          </p>
        </div>

        <!-- Grid de sugestões clicáveis -->
        <div class="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="(item, idx) in brand.homeTexts.aiCtaQuestions"
            :key="idx"
            to="/auth/login"
            class="group flex flex-col gap-4 border p-5 transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-200 brand-card"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
          >
            <div class="flex items-center justify-between">
              <div class="flex h-10 w-10 items-center justify-center transition-colors group-hover:bg-secondary/20 brand-card-sm" :style="{ backgroundColor: `${brand.colors.text}10` }">
                <UIcon :name="item.icon" class="h-5 w-5 transition-colors group-hover:text-secondary" :style="{ color: brand.colors.textMuted }" />
              </div>
              <span class="px-2 py-1 text-xs brand-pill transition-colors group-hover:bg-secondary/10 group-hover:text-secondary/80" :style="{ backgroundColor: `${brand.colors.text}08`, color: brand.colors.textMuted }">
                {{ item.category }}
              </span>
            </div>
            <p class="font-medium" :style="{ color: brand.colors.text }">{{ item.question }}</p>
            <div class="mt-auto flex items-center gap-1 text-sm transition-colors group-hover:text-secondary" :style="{ color: brand.colors.textMuted }">
              <span>Perguntar</span>
              <UIcon name="i-lucide-arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </NuxtLink>
        </div>

        <!-- CTA Box -->
        <div class="relative overflow-hidden border bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent p-6 md:p-8 brand-card" :style="{ borderColor: brand.colors.border }">
          <!-- Background glow -->
          <div class="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
          <div class="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full blur-3xl" :style="{ backgroundColor: `${brand.colors.primary}1A` }" />

          <div class="relative flex flex-col items-center gap-6 text-center">
            <!-- Mock chat preview -->
            <div class="w-full max-w-md rounded-xl border p-4" :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.background}80` }">
              <div class="flex items-start gap-3">
                <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary/20">
                  <IconAi class="fill-secondary h-4 w-4" />
                </div>
                <div class="flex-1 text-left">
                  <p class="text-sm" :style="{ color: `${brand.colors.text}CC` }">
                    {{ brand.ai.ctaGreeting }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="flex items-center gap-6 text-sm" :style="{ color: brand.colors.textMuted }">
              <template v-for="(feature, fIdx) in brand.ai.ctaFeatures" :key="fIdx">
                <div v-if="fIdx > 0" class="h-4 w-px" :style="{ backgroundColor: `${brand.colors.text}20` }" :class="{ 'hidden sm:block': fIdx >= 2 }" />
                <div class="flex items-center gap-2" :class="{ 'hidden sm:flex': fIdx >= 2 }">
                  <UIcon :name="['i-lucide-zap', 'i-lucide-brain', 'i-lucide-infinity'][fIdx] || 'i-lucide-sparkles'" class="h-4 w-4 text-primary" />
                  <span>{{ feature }}</span>
                </div>
              </template>
            </div>

            <!-- CTA Button -->
            <UButton
              to="/auth/login"
              color="secondary"
              size="xl"
              icon="i-lucide-message-circle"
              class="group w-full transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-secondary/25 sm:w-auto"
            >
              {{ brand.ai.ctaButton }}
              <template #trailing>
                <UIcon name="i-lucide-arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </template>
            </UButton>

            <!-- Trust -->
            <p class="flex items-center gap-2 text-xs" :style="{ color: `rgb(var(--brand-overlay) / 0.4)` }">
              <UIcon name="i-lucide-shield-check" class="h-3 w-3" />
              100% gratuito • Sem cadastro de cartão
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== DEVELOPER PRODUCTS · API + CREATIVE (Redentia terminal only) ========== -->
    <!--
      One unified section hosting both API and Creative CTAs as
      side-by-side cards. Half the vertical footprint of the old
      two-section layout and keeps the developer-tools story in
      a single scroll.
    -->
    <section
      v-if="showSection('apiProduct') && !authStore.isAuthenticated && brand.hero.variant === 'terminal'"
      :style="{ order: sectionOrder('apiProduct'), borderColor: brand.colors.border, backgroundColor: brand.colors.background }"
      class="api-product-section relative mt-16 overflow-hidden border-t"
    >
      <!-- Atmospheric layers: scanlines + grid + amber sweep -->
      <div class="pointer-events-none absolute inset-0">
        <div
          class="absolute inset-0 opacity-[0.035]"
          :style="{ backgroundImage: `linear-gradient(${brand.colors.text} 1px, transparent 1px), linear-gradient(90deg, ${brand.colors.text} 1px, transparent 1px)`, backgroundSize: '48px 48px' }"
        />
        <div
          class="absolute inset-x-0 top-0 h-px"
          :style="{ background: `linear-gradient(90deg, transparent, ${brand.colors.primary}80, transparent)` }"
        />
        <div
          class="absolute -right-32 top-32 h-[520px] w-[520px] rounded-full blur-3xl opacity-25"
          :style="{ background: `radial-gradient(circle, ${brand.colors.primary}, transparent 65%)` }"
        />
        <div
          class="absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full blur-3xl opacity-15"
          :style="{ background: `radial-gradient(circle, ${brand.colors.primary}, transparent 70%)` }"
        />
      </div>

      <!-- ============ MASTHEAD ============ -->
      <div class="relative mx-auto max-w-7xl px-6 pt-20 md:px-10 md:pt-28">
        <div class="flex flex-wrap items-end justify-between gap-6 border-b pb-8" :style="{ borderColor: `${brand.colors.border}80` }">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.22em]">
              <span class="flex items-center gap-1.5" :style="{ color: brand.colors.primary }">
                <span class="relative flex size-1.5">
                  <span class="absolute inline-flex size-1.5 motion-safe:animate-ping rounded-full opacity-75" :style="{ backgroundColor: brand.colors.primary }" />
                  <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
                </span>
                DEVELOPERS.SHIPPED
              </span>
              <span :style="{ color: brand.colors.border }">/</span>
              <span :style="{ color: brand.colors.textMuted }">2026.04 · BUILD 2</span>
            </div>
            <h2
              class="font-display max-w-2xl text-[44px] leading-[0.92] tracking-tight sm:text-[60px] md:text-[80px]"
              :style="{ color: brand.colors.text }"
            >
              Pegue os dados.
              <br />
              <span class="italic" :style="{ color: brand.colors.primary }">Faça outra coisa.</span>
            </h2>
          </div>
          <p class="max-w-sm text-sm leading-relaxed md:text-[15px]" :style="{ color: brand.colors.textMuted }">
            Três produtos abertos: a <span :style="{ color: brand.colors.text }">plataforma</span> que você está vendo é só uma das interfaces. Pegue os dados em JSON, em PNG pronto pro feed, ou em widget pra embedar no seu site.
          </p>
        </div>
      </div>

      <!-- ============ PRODUCT 01, API ============ -->
      <a
        href="https://api.redentia.com.br"
        target="_blank"
        rel="noopener"
        class="api-row group relative block border-b transition-colors"
        :style="{ borderColor: `${brand.colors.border}60` }"
      >
        <div class="relative mx-auto grid max-w-7xl grid-cols-12 gap-6 px-6 py-16 md:gap-10 md:px-10 md:py-24">
          <!-- Numero gigante outline -->
          <div class="col-span-12 md:col-span-2">
            <div
              class="font-display select-none text-[120px] leading-[0.8] tracking-tighter md:text-[180px]"
              :style="{
                color: 'transparent',
                WebkitTextStroke: `1.5px ${brand.colors.primary}50`,
              }"
            >
              01
            </div>
          </div>

          <!-- Conteudo -->
          <div class="col-span-12 md:col-span-5 md:pl-4">
            <div class="mb-5 flex flex-wrap items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.2em]">
              <span class="rounded-full border px-2.5 py-1" :style="{ borderColor: `${brand.colors.primary}80`, color: brand.colors.primary, backgroundColor: `${brand.colors.primary}10` }">
                PUBLIC BETA
              </span>
              <span :style="{ color: brand.colors.textMuted }">REDENTIA.API/V1</span>
            </div>

            <h3
              class="font-display text-[40px] leading-[0.95] tracking-tight md:text-[64px]"
              :style="{ color: brand.colors.text }"
            >
              Os dados em
              <span class="italic" :style="{ color: brand.colors.primary }">JSON.</span>
            </h3>

            <p class="mt-5 max-w-md text-[14px] leading-relaxed md:text-[15px]" :style="{ color: brand.colors.textMuted }">
              Preços, fundamentos completos, dividendos e commentaries via REST. Schemas estáveis, latência sub-50&nbsp;ms, autenticação por API key. Pronta pra rodar em produção amanhã.
            </p>

            <!-- Stats inline -->
            <div class="mt-8 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded border" :style="{ borderColor: `${brand.colors.border}80`, backgroundColor: `${brand.colors.border}40` }">
              <div class="flex flex-col gap-0.5 px-3 py-3" :style="{ backgroundColor: `${brand.colors.surface}` }">
                <span class="font-mono-tab text-[20px] tabular-nums leading-none md:text-[24px]" :style="{ color: brand.colors.primary }">50+</span>
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">ENDPOINTS</span>
              </div>
              <div class="flex flex-col gap-0.5 px-3 py-3" :style="{ backgroundColor: `${brand.colors.surface}` }">
                <span class="font-mono-tab text-[20px] tabular-nums leading-none md:text-[24px]" :style="{ color: brand.colors.primary }">42<span class="text-[12px]">ms</span></span>
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">P50 LAT.</span>
              </div>
              <div class="flex flex-col gap-0.5 px-3 py-3" :style="{ backgroundColor: `${brand.colors.surface}` }">
                <span class="font-mono-tab text-[20px] tabular-nums leading-none md:text-[24px]" :style="{ color: brand.colors.primary }">99.9<span class="text-[12px]">%</span></span>
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">UPTIME</span>
              </div>
            </div>

            <div class="mt-10 inline-flex items-center gap-3 border-b pb-1 font-mono-tab text-[11px] uppercase tracking-[0.2em] transition-colors" :style="{ color: brand.colors.primary, borderColor: brand.colors.primary }">
              <span>PEGAR API KEY</span>
              <span class="transition-transform group-hover:translate-x-2">→</span>
            </div>
          </div>

          <!-- Terminal mockup -->
          <div class="col-span-12 md:col-span-5">
            <div
              class="terminal-window overflow-hidden rounded-lg border shadow-2xl"
              :style="{
                borderColor: `${brand.colors.border}`,
                backgroundColor: `${brand.colors.background}F5`,
                boxShadow: `0 30px 80px -30px ${brand.colors.primary}40, 0 0 0 1px ${brand.colors.border}40`,
              }"
            >
              <!-- Title bar -->
              <div class="flex items-center justify-between border-b px-4 py-2.5" :style="{ borderColor: `${brand.colors.border}80`, backgroundColor: `${brand.colors.surface}80` }">
                <div class="flex items-center gap-1.5">
                  <span class="size-2.5 rounded-full" style="background: #ff5f57" />
                  <span class="size-2.5 rounded-full" style="background: #febc2e" />
                  <span class="size-2.5 rounded-full" style="background: #28c840" />
                </div>
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">~/redentia/api</span>
                <span class="font-mono-tab text-[10px]" :style="{ color: brand.colors.textMuted }">●●●</span>
              </div>

              <!-- Body -->
              <div class="px-5 py-4 font-mono-tab text-[12px] leading-[1.65] md:text-[13px]">
                <div class="flex items-center gap-2">
                  <span :style="{ color: brand.colors.positive }">$</span>
                  <span :style="{ color: brand.colors.text }">curl https://api.redentia.com.br/v1/tickers/<span :style="{ color: brand.colors.primary }">PETR4</span></span>
                </div>
                <div class="mt-1.5 flex items-center gap-2" :style="{ color: brand.colors.textMuted }">
                  <span :style="{ color: brand.colors.positive }">→</span>
                  <span :style="{ color: brand.colors.positive }">200 OK</span>
                  <span :style="{ color: brand.colors.border }">·</span>
                  <span>42 ms</span>
                  <span :style="{ color: brand.colors.border }">·</span>
                  <span>1.4 KB</span>
                </div>

                <div class="mt-3 rounded border-l-2 py-1 pl-3" :style="{ borderColor: brand.colors.primary, backgroundColor: `${brand.colors.primary}08` }">
                  <div :style="{ color: brand.colors.text }">{</div>
                  <div class="pl-4">
                    <span :style="{ color: brand.colors.primary }">"symbol"</span><span :style="{ color: brand.colors.textMuted }">: </span><span :style="{ color: brand.colors.positive }">"PETR4"</span>,
                  </div>
                  <div class="pl-4">
                    <span :style="{ color: brand.colors.primary }">"price"</span><span :style="{ color: brand.colors.textMuted }">: </span><span :style="{ color: brand.colors.text }">38.42</span>,
                  </div>
                  <div class="pl-4">
                    <span :style="{ color: brand.colors.primary }">"market_cap"</span><span :style="{ color: brand.colors.textMuted }">: </span><span :style="{ color: brand.colors.text }">501823000000</span>,
                  </div>
                  <div class="pl-4">
                    <span :style="{ color: brand.colors.primary }">"dividend_yield"</span><span :style="{ color: brand.colors.textMuted }">: </span><span :style="{ color: brand.colors.text }">0.142</span>,
                  </div>
                  <div class="pl-4">
                    <span :style="{ color: brand.colors.primary }">"updated_at"</span><span :style="{ color: brand.colors.textMuted }">: </span><span :style="{ color: brand.colors.positive }">"2026-04-11T14:32:18Z"</span>
                  </div>
                  <div :style="{ color: brand.colors.text }">}</div>
                </div>

                <div class="mt-3 flex items-center gap-2">
                  <span :style="{ color: brand.colors.positive }">$</span>
                  <span class="inline-block h-3 w-1.5 motion-safe:animate-pulse" :style="{ backgroundColor: brand.colors.primary }" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </a>

      <!-- ============ PRODUCT 02, CREATIVE ============ -->
      <a
        href="https://creative.redentia.com.br"
        target="_blank"
        rel="noopener"
        class="api-row group relative block transition-colors"
      >
        <div class="relative mx-auto grid max-w-7xl grid-cols-12 gap-6 px-6 py-16 md:gap-10 md:px-10 md:py-24">
          <!-- Creative thumbs first on desktop (asymmetric flip) -->
          <div class="order-2 col-span-12 md:order-1 md:col-span-5">
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="(thumb, i) in creativeThumbs"
                :key="thumb.slug"
                class="creative-tile relative aspect-square overflow-hidden rounded-lg border transition-transform"
                :style="{
                  borderColor: `${brand.colors.border}`,
                  backgroundColor: `${brand.colors.surface}`,
                  boxShadow: `0 20px 50px -25px ${brand.colors.primary}30`,
                  transform: i % 2 === 0 ? 'translateY(-12px)' : 'translateY(12px)',
                }"
              >
                <div
                  class="absolute inset-0"
                  :style="{ background: `radial-gradient(circle at 30% 20%, ${brand.colors.primary}25, transparent 60%)` }"
                />
                <!-- Frame label top -->
                <div class="absolute inset-x-0 top-0 flex items-center justify-between px-3 py-2 font-mono-tab text-[8px] uppercase tracking-[0.18em]">
                  <span :style="{ color: brand.colors.primary }">{{ thumb.eyebrow || '·' }}</span>
                  <span :style="{ color: brand.colors.textMuted }">1080²</span>
                </div>
                <!-- Center icon -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <UIcon :name="thumb.icon" class="size-10" :style="{ color: brand.colors.primary }" />
                </div>
                <!-- Bottom label -->
                <div class="absolute inset-x-0 bottom-0 px-3 py-2 font-mono-tab text-[9px] uppercase tracking-[0.16em]" :style="{ color: brand.colors.text }">
                  {{ thumb.label }}
                </div>
              </div>
            </div>
          </div>

          <!-- Conteudo -->
          <div class="order-1 col-span-12 md:order-2 md:col-span-5 md:pl-4">
            <div class="mb-5 flex flex-wrap items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.2em]">
              <span class="rounded-full px-2.5 py-1" :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }">
                NEW · GRÁTIS
              </span>
              <span :style="{ color: brand.colors.textMuted }">REDENTIA.CREATIVE</span>
            </div>

            <h3
              class="font-display text-[40px] leading-[0.95] tracking-tight md:text-[64px]"
              :style="{ color: brand.colors.text }"
            >
              Os dados no
              <span class="italic" :style="{ color: brand.colors.primary }">feed.</span>
            </h3>

            <p class="mt-5 max-w-md text-[14px] leading-relaxed md:text-[15px]" :style="{ color: brand.colors.textMuted }">
              Cards, rankings e mockups com dados reais, prontos pra tirar print e postar. Growth races, spotlights de ativo, notificações iPhone, top gainers. Tudo em 1080×1080.
            </p>

            <!-- Stats inline -->
            <div class="mt-8 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded border" :style="{ borderColor: `${brand.colors.border}80`, backgroundColor: `${brand.colors.border}40` }">
              <div class="flex flex-col gap-0.5 px-3 py-3" :style="{ backgroundColor: `${brand.colors.surface}` }">
                <span class="font-mono-tab text-[20px] tabular-nums leading-none md:text-[24px]" :style="{ color: brand.colors.primary }">20+</span>
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">TEMPLATES</span>
              </div>
              <div class="flex flex-col gap-0.5 px-3 py-3" :style="{ backgroundColor: `${brand.colors.surface}` }">
                <span class="font-mono-tab text-[20px] tabular-nums leading-none md:text-[24px]" :style="{ color: brand.colors.primary }">1080²</span>
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">FORMATO</span>
              </div>
              <div class="flex flex-col gap-0.5 px-3 py-3" :style="{ backgroundColor: `${brand.colors.surface}` }">
                <span class="font-mono-tab text-[20px] tabular-nums leading-none md:text-[24px]" :style="{ color: brand.colors.primary }">PNG</span>
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">EXPORT</span>
              </div>
            </div>

            <div class="mt-10 inline-flex items-center gap-3 border-b pb-1 font-mono-tab text-[11px] uppercase tracking-[0.2em] transition-colors" :style="{ color: brand.colors.primary, borderColor: brand.colors.primary }">
              <span>ABRIR STUDIO</span>
              <span class="transition-transform group-hover:translate-x-2">→</span>
            </div>
          </div>

          <!-- Numero gigante outline na direita -->
          <div class="order-3 col-span-12 flex justify-end md:col-span-2">
            <div
              class="font-display select-none text-[120px] leading-[0.8] tracking-tighter md:text-[180px]"
              :style="{
                color: 'transparent',
                WebkitTextStroke: `1.5px ${brand.colors.primary}50`,
              }"
            >
              02
            </div>
          </div>
        </div>
      </a>

      <!-- ============ PRODUCT 03, EMBED ============ -->
      <a
        href="https://embed.redentia.com.br"
        target="_blank"
        rel="noopener"
        class="api-row group relative block border-t transition-colors"
        :style="{ borderColor: `${brand.colors.border}60` }"
      >
        <div class="relative mx-auto grid max-w-7xl grid-cols-12 gap-6 px-6 py-16 md:gap-10 md:px-10 md:py-24">
          <!-- Numero gigante outline -->
          <div class="col-span-12 md:col-span-2">
            <div
              class="font-display select-none text-[120px] leading-[0.8] tracking-tighter md:text-[180px]"
              :style="{
                color: 'transparent',
                WebkitTextStroke: `1.5px ${brand.colors.primary}50`,
              }"
            >
              03
            </div>
          </div>

          <!-- Conteudo -->
          <div class="col-span-12 md:col-span-5 md:pl-4">
            <div class="mb-5 flex flex-wrap items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.2em]">
              <span class="rounded-full px-2.5 py-1" :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }">
                NEW · GRÁTIS
              </span>
              <span :style="{ color: brand.colors.textMuted }">REDENTIA.EMBED</span>
            </div>

            <h3
              class="font-display text-[40px] leading-[0.95] tracking-tight md:text-[64px]"
              :style="{ color: brand.colors.text }"
            >
              Os dados no
              <span class="italic" :style="{ color: brand.colors.primary }">seu site.</span>
            </h3>

            <p class="mt-5 max-w-md text-[14px] leading-relaxed md:text-[15px]" :style="{ color: brand.colors.textMuted }">
              Widgets gratuitos de cotações, rankings, mapas de calor e calculadoras pra embedar em blog, newsletter ou dashboard. Um iframe, zero cadastro, sempre atualizado em tempo real.
            </p>

            <!-- Stats inline -->
            <div class="mt-8 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded border" :style="{ borderColor: `${brand.colors.border}80`, backgroundColor: `${brand.colors.border}40` }">
              <div class="flex flex-col gap-0.5 px-3 py-3" :style="{ backgroundColor: `${brand.colors.surface}` }">
                <span class="font-mono-tab text-[20px] tabular-nums leading-none md:text-[24px]" :style="{ color: brand.colors.primary }">8</span>
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">WIDGETS</span>
              </div>
              <div class="flex flex-col gap-0.5 px-3 py-3" :style="{ backgroundColor: `${brand.colors.surface}` }">
                <span class="font-mono-tab text-[20px] tabular-nums leading-none md:text-[24px]" :style="{ color: brand.colors.primary }">iframe</span>
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">HTML PADRÃO</span>
              </div>
              <div class="flex flex-col gap-0.5 px-3 py-3" :style="{ backgroundColor: `${brand.colors.surface}` }">
                <span class="font-mono-tab text-[20px] tabular-nums leading-none md:text-[24px]" :style="{ color: brand.colors.primary }">0</span>
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">CADASTRO</span>
              </div>
            </div>

            <div class="mt-10 inline-flex items-center gap-3 border-b pb-1 font-mono-tab text-[11px] uppercase tracking-[0.2em] transition-colors" :style="{ color: brand.colors.primary, borderColor: brand.colors.primary }">
              <span>VER WIDGETS</span>
              <span class="transition-transform group-hover:translate-x-2">→</span>
            </div>
          </div>

          <!-- Iframe code mockup -->
          <div class="col-span-12 md:col-span-5">
            <div
              class="terminal-window overflow-hidden rounded-lg border shadow-2xl"
              :style="{
                borderColor: `${brand.colors.border}`,
                backgroundColor: `${brand.colors.background}F5`,
                boxShadow: `0 30px 80px -30px ${brand.colors.primary}40, 0 0 0 1px ${brand.colors.border}40`,
              }"
            >
              <div class="flex items-center justify-between border-b px-4 py-2.5" :style="{ borderColor: `${brand.colors.border}80`, backgroundColor: `${brand.colors.surface}80` }">
                <div class="flex items-center gap-1.5">
                  <span class="size-2.5 rounded-full" style="background: #ff5f57" />
                  <span class="size-2.5 rounded-full" style="background: #febc2e" />
                  <span class="size-2.5 rounded-full" style="background: #28c840" />
                </div>
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">~/blog/post-petr4.html</span>
                <span class="font-mono-tab text-[10px]" :style="{ color: brand.colors.textMuted }">●●●</span>
              </div>

              <div class="px-5 py-4 font-mono-tab text-[12px] leading-[1.65] md:text-[13px]">
                <div :style="{ color: brand.colors.textMuted }">
                  <span :style="{ color: brand.colors.text }">&lt;!--</span> cotação PETR4 no meu blog <span :style="{ color: brand.colors.text }">--&gt;</span>
                </div>
                <div class="mt-3 rounded border-l-2 py-1 pl-3" :style="{ borderColor: brand.colors.primary, backgroundColor: `${brand.colors.primary}08` }">
                  <div :style="{ color: brand.colors.text }">
                    <span :style="{ color: brand.colors.primary }">&lt;iframe</span>
                  </div>
                  <div class="pl-4">
                    <span :style="{ color: brand.colors.primary }">src</span><span :style="{ color: brand.colors.textMuted }">=</span><span :style="{ color: brand.colors.positive }">"https://embed.redentia.com.br/</span>
                  </div>
                  <div class="pl-8">
                    <span :style="{ color: brand.colors.positive }">ticker/small?ticker=PETR4"</span>
                  </div>
                  <div class="pl-4">
                    <span :style="{ color: brand.colors.primary }">width</span><span :style="{ color: brand.colors.textMuted }">=</span><span :style="{ color: brand.colors.positive }">"320"</span>
                    <span :style="{ color: brand.colors.primary }"> height</span><span :style="{ color: brand.colors.textMuted }">=</span><span :style="{ color: brand.colors.positive }">"80"</span>
                  </div>
                  <div class="pl-4">
                    <span :style="{ color: brand.colors.primary }">frameborder</span><span :style="{ color: brand.colors.textMuted }">=</span><span :style="{ color: brand.colors.positive }">"0"</span>
                    <span :style="{ color: brand.colors.primary }"> loading</span><span :style="{ color: brand.colors.textMuted }">=</span><span :style="{ color: brand.colors.positive }">"lazy"</span><span :style="{ color: brand.colors.primary }">&gt;</span>
                  </div>
                  <div :style="{ color: brand.colors.primary }">&lt;/iframe&gt;</div>
                </div>

                <div class="mt-3 flex items-center gap-2 text-[11px]" :style="{ color: brand.colors.textMuted }">
                  <span :style="{ color: brand.colors.positive }">✓</span>
                  <span>cole, salve, publique. pronto.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a>
    </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { IAsset } from '~/types/asset'
import type { ChartTimeRange } from '~/types/chart'
import { useFormat } from '~/composables/useFormat'

const brand = useBrand()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const fmt = useFormat()

// Creative studio thumbnails, used in the redentia home CTA section.
// Each entry links to a pre-filled creative template on the
// creative.redentia.com.br subdomain.
const creativeThumbs = [
  { slug: 'growth-race', path: '/growth-race?tickers=PETR4,VALE3,ITUB4&reinvest=true', icon: 'i-lucide-trending-up', eyebrow: 'NOVO', label: 'Growth Race', isNew: true },
  { slug: 'asset-spotlight', path: '/asset-spotlight?ticker=PETR4', icon: 'i-lucide-star', eyebrow: 'DESTAQUE', label: 'Spotlight', isNew: false },
  { slug: 'ranking-top', path: '/ranking/top', icon: 'i-lucide-trophy', eyebrow: 'RANKING', label: 'Top Altas', isNew: false },
  { slug: 'market-updates', path: '/market-updates?format=square', icon: 'i-lucide-bell', eyebrow: 'UPDATE', label: 'Notificação', isNew: false },
]


type HomeSectionId = typeof brand.homeSections[number]['id']
const sectionIndexMap = computed(() => new Map(brand.homeSections.map((s, i) => [s.id, i])))
function showSection(id: HomeSectionId) {
  const section = brand.homeSections.find(s => s.id === id)
  if (!section) return false
  return section.visible
}
function sectionOrder(id: HomeSectionId) {
  return sectionIndexMap.value.get(id) ?? 99
}

const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
)


const runtimeConfig = useRuntimeConfig()
const siteUrl = computed(() => {
  const url = runtimeConfig.public?.siteUrl || brand.url
  return url.endsWith('/') ? url.slice(0, -1) : url
})
const canonicalUrl = computed(() => `${siteUrl.value}/`)
const metaDescription = brand.seo.description
const navigationLinks = computed(() => [
  {
    name: 'Assessoria com IA',
    url: `${siteUrl.value}/help`,
  },
  {
    name: 'Calculadora de juros compostos',
    url: `${siteUrl.value}/calculadora`,
  },
  {
    name: 'Todas as ações',
    url: `${siteUrl.value}/search?group=stocks`,
  },
  {
    name: 'Todos os FIIs',
    url: `${siteUrl.value}/search?group=reits`,
  },
  {
    name: 'PETR4',
    url: `${siteUrl.value}/asset/petr4`,
  },
  {
    name: 'BBAS3',
    url: `${siteUrl.value}/asset/bbas3`,
  },
])

usePageSeo({
  title: brand.seo.title,
  description: metaDescription,
  path: '/',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: brand.name,
      url: siteUrl.value,
      logo: `${siteUrl.value}${brand.logo.icon512}`,
      sameAs: Object.values(brand.social).filter(Boolean),
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: brand.email,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: brand.name,
      url: siteUrl.value,
      description: metaDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl.value}/search?globalFilter={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `Navegação principal da ${brand.name}`,
      itemListElement: navigationLinks.value.map((item, index) => ({
        '@type': 'SiteNavigationElement',
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
  ],
})

const {
  getTopStocks,
  getTopETFs,
  getTopReits,
  getTopBDRs,
  getIndiceHistoricPrices,
  getTickerDetails,
  assetHistoricPrices,
} = useAssetsService()

const loading = ref(false)
const blockChat = ref(false)

// Deep-linked home state. URL is the single source of truth for the
// market view (range, map/list, heat filter). `replace` avoids polluting
// history with every toggle while keeping shareable links working.
const VALID_RANGES: ChartTimeRange[] = ['month', 'year', '3years', 'full']
const VALID_FILTERS = ['all', 'positive', 'negative'] as const
type TreemapFilter = typeof VALID_FILTERS[number]

function replaceQuery(patch: Record<string, string | undefined>) {
  const next = { ...route.query }
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) delete next[k]
    else next[k] = v
  }
  router.replace({ query: next })
}

const selectedTimeRange = computed<ChartTimeRange>({
  get() {
    const q = String(route.query.range ?? 'month') as ChartTimeRange
    return VALID_RANGES.includes(q) ? q : 'month'
  },
  set(value) {
    replaceQuery({ range: value === 'month' ? undefined : value })
  },
})

const showMap = computed<boolean>({
  get() {
    return String(route.query.view ?? '') === 'map'
  },
  set(value) {
    replaceQuery({ view: value ? 'map' : undefined })
  },
})

// Adapter para AtomsSegmented que usa string discriminada em vez de boolean.
const viewMode = computed<'list' | 'map'>({
  get() {
    return showMap.value ? 'map' : 'list'
  },
  set(value) {
    showMap.value = value === 'map'
  },
})

const treemapFilter = computed<TreemapFilter>({
  get() {
    const q = String(route.query.filter ?? 'all') as TreemapFilter
    return (VALID_FILTERS as readonly string[]).includes(q) ? q : 'all'
  },
  set(value) {
    replaceQuery({ filter: value === 'all' ? undefined : value })
  },
})

const rankingLinkQueries = {
  top: {
    stocks: { ch_min: 0, group: 'stocks', reit: 0, bdr: 0 },
    etfs: { ch_min: 0, group: 'etfs', reit: 0, bdr: 0 },
    reits: { ch_min: 0, group: 'reits', stock: 0, bdr: 0 },
    bdrs: { ch_min: 0, group: 'bdrs', stock: 0, reit: 0 },
  },
  bottom: {
    stocks: { ch_max: 0, group: 'stocks', reit: 0, bdr: 0 },
    etfs: { ch_max: 0, group: 'etfs', reit: 0, bdr: 0 },
    reits: { ch_max: 0, group: 'reits', stock: 0, bdr: 0 },
    bdrs: { ch_max: 0, group: 'bdrs', stock: 0, reit: 0 },
  },
} as const

const assetCategories = [
  { key: 'stocks', label: 'Ações' },
  { key: 'etfs', label: 'ETFs' },
  { key: 'reits', label: 'Reits' },
  { key: 'bdrs', label: 'BDRs' },
] as const

interface ChartPoint {
  date: string
  value: number
  timestamp: number
}

interface TreemapEntry {
  symbol: string
  name: string
  price: number
  change: number
  category: 'acoes' | 'fiis'
  sector?: string
}

interface RankingBucket {
  stocks: IAsset[]
  etfs: IAsset[]
  reits: IAsset[]
  bdrs: IAsset[]
}

interface HomeMarketData {
  rankings: {
    top: RankingBucket
    bottom: RankingBucket
  }
  treemap: TreemapEntry[]
  ibovSeries: IndiceData[]
  ifixSeries: IndiceData[]
}

const stocksData = ref<TreemapEntry[]>([])
const { requestPermission, token: fcmToken } = useFirebaseNotifications()

const topAssets = ref<{
  top: RankingBucket
  bottom: RankingBucket
}>({
  top: {
    stocks: [],
    etfs: [],
    reits: [],
    bdrs: [],
  },
  bottom: {
    stocks: [],
    etfs: [],
    reits: [],
    bdrs: [],
  },
})

const RANKING_LIMIT = 8
const TREEMAP_LIMIT = 200

// Ranking card variant helpers
const rankingCardClass = computed(() => {
  const v = brand.homePage.rankingCard.variant
  if (v === 'card') return 'mx-2 brand-card-md border p-4'
  if (v === 'border-left') return 'mx-1 border-l-2 pl-4'
  return ''
})

function rankingCardStyle(accentColor: string) {
  const v = brand.homePage.rankingCard.variant
  if (v === 'card') return { borderColor: brand.colors.border, backgroundColor: brand.colors.surface }
  if (v === 'border-left') return { borderColor: accentColor }
  return {}
}

function sliceRanking(items: any[] | undefined) {
  if (!items) return []
  return items.slice(0, brand.homePage.rankingCard.itemsPerCategory)
}

const categoryGridCols = computed(() => {
  const cols = brand.homePage.categoryCard.columns
  if (cols === 2) return 'sm:grid-cols-2'
  return 'sm:grid-cols-2 lg:grid-cols-3'
})

// Guides bento data. 1 hero (featured study), 4 medium (pillar guides),
// 8 compact tiles (quick tools). Split this way to build visual hierarchy
// instead of 13 identical cards. Kept inline for SSR-friendliness; if the
// list grows, move to a CMS/content collection.
interface GuideEntry {
  titulo: string
  descricao: string
  to: string
  icon: string
  categoria: string
  tempoLeitura: number
}

const guidesHero: GuideEntry[] = [
  {
    titulo: 'Como investir em ações',
    descricao: 'Guia completo para iniciantes começarem a investir na bolsa de valores. Da abertura de conta até estratégias avançadas, com exemplos reais e passo a passo.',
    to: '/guias/como-investir-em-acoes-para-iniciantes',
    icon: 'i-lucide-trending-up',
    categoria: 'Ações',
    tempoLeitura: 8,
  },
]

const guidesMedium: GuideEntry[] = [
  {
    titulo: 'Melhores FIIs 2026',
    descricao: 'Fundos imobiliários mais promissores com análise de segmentos e indicadores.',
    to: '/guias/melhores-fiis-para-investir-em-2026',
    icon: 'i-lucide-building-2',
    categoria: 'FIIs',
    tempoLeitura: 10,
  },
  {
    titulo: 'Análise PETR4',
    descricao: 'Vale a pena investir em Petrobras? Análise fundamentalista completa.',
    to: '/guias/analise-petr4-vale-a-pena-investir',
    icon: 'i-lucide-chart-line',
    categoria: 'Análise',
    tempoLeitura: 12,
  },
  {
    titulo: 'Small caps: guia completo',
    descricao: 'Ações de pequenas empresas: como escolher, riscos e estratégias.',
    to: '/guias/small-caps-guia-completo',
    icon: 'i-lucide-rocket',
    categoria: 'Ações',
    tempoLeitura: 9,
  },
  {
    titulo: 'Calculadora de dividendos',
    descricao: 'Calcule quanto investir para atingir sua meta de renda passiva.',
    to: '/guias/calculadora-de-dividendos',
    icon: 'i-lucide-coins',
    categoria: 'Dividendos',
    tempoLeitura: 7,
  },
]

const guidesTiles: GuideEntry[] = [
  {
    titulo: 'Juros compostos',
    descricao: 'Simule quanto seus investimentos renderão.',
    to: '/calculadora/juros-compostos',
    icon: 'i-lucide-trending-up',
    categoria: 'Ferramenta',
    tempoLeitura: 5,
  },
  {
    titulo: 'Simulador de ações',
    descricao: 'Quanto você teria ganho investindo na B3.',
    to: '/calculadora/acoes',
    icon: 'i-lucide-chart-line',
    categoria: 'Ferramenta',
    tempoLeitura: 5,
  },
  {
    titulo: 'Planejamento patrimonial',
    descricao: 'Calcule quanto investir para atingir suas metas.',
    to: '/calculadora/planejamento',
    icon: 'i-lucide-target',
    categoria: 'Ferramenta',
    tempoLeitura: 5,
  },
  {
    titulo: 'Preço teto',
    descricao: 'Graham e Bazin para saber se uma ação está cara.',
    to: '/calculadora/preco-teto',
    icon: 'i-lucide-shield-check',
    categoria: 'Ferramenta',
    tempoLeitura: 5,
  },
  {
    titulo: 'Aposentadoria / FIRE',
    descricao: 'Planeje sua aposentadoria considerando INSS e inflação.',
    to: '/calculadora/aposentadoria',
    icon: 'i-lucide-piggy-bank',
    categoria: 'Ferramenta',
    tempoLeitura: 5,
  },
  {
    titulo: 'Dividend yield',
    descricao: 'DY atual, projetado e on cost.',
    to: '/calculadora/dividend-yield',
    icon: 'i-lucide-percent',
    categoria: 'Ferramenta',
    tempoLeitura: 4,
  },
  {
    titulo: 'Quanto investir / mês',
    descricao: 'Meta financeira em aporte mensal.',
    to: '/calculadora/quanto-investir',
    icon: 'i-lucide-wallet',
    categoria: 'Ferramenta',
    tempoLeitura: 4,
  },
  {
    titulo: 'IR sobre ações',
    descricao: 'Swing trade, day trade e DARF.',
    to: '/calculadora/imposto-renda',
    icon: 'i-lucide-receipt-text',
    categoria: 'Ferramenta',
    tempoLeitura: 4,
  },
]

// Aguarda os dados para SSR correto (evita hydration mismatch)
const { data: homeMarketData } = await useAsyncData<HomeMarketData>(
  'home-market-data',
  async () => {
    const [
      [topStocks, bottomStocks],
      [topETFs, bottomETFs],
      [topReits, bottomReits],
      [topBDRs, bottomBDRs],
      ibovSeries,
      ifixSeries,
    ] = await Promise.all([
      Promise.all([
        getTopStocks('top', 1000000),
        getTopStocks('bottom', 1000000),
      ]),
      Promise.all([getTopETFs('top', 1000000), getTopETFs('bottom', 1000000)]),
      Promise.all([
        getTopReits('top', 1000000),
        getTopReits('bottom', 1000000),
      ]),
      Promise.all([getTopBDRs('top', 1000000), getTopBDRs('bottom', 1000000)]),
      getIndiceHistoricPrices('ibov', '1mo'),
      getIndiceHistoricPrices('ifix', '1mo'),
    ])

    const clamp = (items: IAsset[] = []) =>
      Array.isArray(items) ? items.slice(0, RANKING_LIMIT) : []

    return {
      rankings: {
        top: {
          stocks: clamp(topStocks),
          etfs: clamp(topETFs),
          reits: clamp(topReits),
          bdrs: clamp(topBDRs),
        },
        bottom: {
          stocks: clamp(bottomStocks),
          etfs: clamp(bottomETFs),
          reits: clamp(bottomReits),
          bdrs: clamp(bottomBDRs),
        },
      },
      treemap: buildTreemapDataset(
        topStocks,
        bottomStocks,
        topReits,
        bottomReits
      ),
      ibovSeries: Array.isArray(ibovSeries) ? ibovSeries : [],
      ifixSeries: Array.isArray(ifixSeries) ? ifixSeries : [],
    }
  },
  {
    // `dedupe: 'defer'` collapses parallel/repeated calls to this same
    // key into one in-flight promise instead of refetching. `getCachedData`
    // hydrates from the SSR payload on first client render and reuses
    // the in-memory copy across client navigations — no extra round-trip
    // when the user comes back to /. Stale data is fine: rankings update
    // in 24h cycles, not seconds.
    dedupe: 'defer',
    getCachedData: (key, nuxtApp) => {
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
    },
  }
)

interface IndiceData {
  name: string
  market_price: number
  price_at: string
}

// Helper functions (declaradas antes das computed properties)
function coerceNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function calculateSeriesStats(series?: IndiceData[]) {
  if (!Array.isArray(series) || series.length < 2) return null
  const lastPrice = coerceNumber(series[series.length - 1].market_price)
  const previousPrice = coerceNumber(series[series.length - 2].market_price)
  if (previousPrice === 0) return null
  const variation = ((lastPrice - previousPrice) / previousPrice) * 100
  return { lastPrice, variation }
}

function formatVariation(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

const ibovChartData = ref<ChartPoint[]>([])

// Status do mercado (B3: 10h-17h dias uteis, timezone America/Sao_Paulo)
const marketStatus = computed(() => {
  const series = homeMarketData.value?.ibovSeries
  const lastEntry = Array.isArray(series) && series.length > 0 ? series[series.length - 1] : null
  const lastPriceAt = lastEntry?.price_at ?? ''

  // Hora atual em Sao Paulo
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  const day = now.getDay() // 0=dom, 6=sab
  const hour = now.getHours()

  // Data de hoje formatada YYYY-MM-DD
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  // Formatar ultima atualizacao
  const lastUpdateFormatted = lastPriceAt
    ? new Date(lastPriceAt + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    : ''

  // Fim de semana
  if (day === 0 || day === 6) {
    return { label: 'Fechado', color: '#71717a', animate: false, lastUpdate: lastUpdateFormatted }
  }

  // Dia util, antes do mercado
  if (hour < 10) {
    return { label: 'Pre-mercado', color: '#eab308', animate: true, lastUpdate: lastUpdateFormatted }
  }

  // Dia util, horario de mercado
  if (hour >= 10 && hour < 17) {
    // Se nao tem dado de hoje, provavelmente e feriado
    if (lastPriceAt && lastPriceAt < todayStr) {
      return { label: 'Feriado', color: '#f97316', animate: false, lastUpdate: lastUpdateFormatted }
    }
    return { label: 'Ao Vivo', color: '#22c55e', animate: true, lastUpdate: lastUpdateFormatted }
  }

  // Dia util, apos mercado
  return { label: 'Fechado', color: '#71717a', animate: false, lastUpdate: lastUpdateFormatted }
})

// Computed properties para SSR correto (evita hydration mismatch)
const ibovIndicator = computed(() => {
  const stats = calculateSeriesStats(homeMarketData.value?.ibovSeries)
  return stats ? formatVariation(stats.variation) : '+0,00%'
})

const ibovLastPrice = computed(() => {
  const stats = calculateSeriesStats(homeMarketData.value?.ibovSeries)
  return stats?.lastPrice ?? 0
})

const ifixIndicator = computed(() => {
  const stats = calculateSeriesStats(homeMarketData.value?.ifixSeries)
  return stats ? formatVariation(stats.variation) : '+0,00%'
})

const ifixLastPrice = computed(() => {
  const stats = calculateSeriesStats(homeMarketData.value?.ifixSeries)
  return stats?.lastPrice ?? 0
})

const ibovVariationColor = computed(() => {
  const stats = calculateSeriesStats(homeMarketData.value?.ibovSeries)
  if (!stats || stats.variation === 0) return brand.colors.textMuted
  return stats.variation > 0 ? brand.colors.positive : brand.colors.negative
})

const ifixVariationColor = computed(() => {
  const stats = calculateSeriesStats(homeMarketData.value?.ifixSeries)
  if (!stats || stats.variation === 0) return brand.colors.textMuted
  return stats.variation > 0 ? brand.colors.positive : brand.colors.negative
})

// QuickSearch showcase: queries rotacionando com results coerentes pra
// vender a busca inteligente. Auto-cycle a cada 3.2s, pausa em hover.
const qsShortcutModifier = computed(() => {
  if (typeof navigator === 'undefined') return '⌘'
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'
})

interface QsResult {
  icon: string
  color: string
  title: string
  subtitle: string
  value?: string
  valueColor?: string
  highlight?: boolean
}

interface QsDemo {
  query: string
  results: QsResult[]
}

const qsDemos = computed<QsDemo[]>(() => [
  {
    query: 'PETR4',
    results: [
      { icon: '◉', color: brand.colors.positive, title: 'PETR4', subtitle: 'Petrobras PN · Petróleo & Gás', value: 'R$ 38,42 +2.84%', valueColor: brand.colors.positive, highlight: true },
      { icon: '◯', color: brand.colors.primary, title: 'PETR3', subtitle: 'Petrobras ON', value: 'R$ 41,10 +2.61%', valueColor: brand.colors.positive },
      { icon: '▦', color: 'var(--text-muted)', title: 'PETR.US', subtitle: 'Petrobras BDR · NYSE', value: 'US$ 14,82', valueColor: 'var(--text-body)' },
    ],
  },
  {
    query: 'Quem subiu hoje?',
    results: [
      { icon: '↑', color: brand.colors.positive, title: 'GOAU4', subtitle: 'Metalúrgica Gerdau', value: '+3,70%', valueColor: brand.colors.positive, highlight: true },
      { icon: '↑', color: brand.colors.positive, title: 'GGBR4', subtitle: 'Gerdau PN', value: '+3,50%', valueColor: brand.colors.positive },
      { icon: '↑', color: brand.colors.positive, title: 'PLPL3', subtitle: 'Plano & Plano', value: '+3,47%', valueColor: brand.colors.positive },
    ],
  },
  {
    query: 'Tesouro IPCA+ 2035',
    results: [
      { icon: '⊞', color: brand.colors.primary, title: 'Tesouro IPCA+ 2035', subtitle: 'Renda fixa · Atrelado à inflação', value: 'IPCA + 6,52%', valueColor: brand.colors.primary, highlight: true },
      { icon: '⊞', color: brand.colors.primary, title: 'Tesouro IPCA+ 2029', subtitle: 'Renda fixa · Curto prazo', value: 'IPCA + 6,31%' },
      { icon: '⊞', color: brand.colors.primary, title: 'Tesouro IPCA+ 2045', subtitle: 'Renda fixa · Longo prazo', value: 'IPCA + 6,68%' },
    ],
  },
  {
    query: 'Como diversificar carteira?',
    results: [
      { icon: '✦', color: brand.colors.primary, title: 'Pergunte à IA Redentia', subtitle: 'Resposta personalizada com sua carteira', value: 'Abrir →', valueColor: brand.colors.primary, highlight: true },
      { icon: '📖', color: 'var(--text-muted)', title: 'Guia: Diversificação', subtitle: 'Conceito · 8 min de leitura' },
      { icon: '🧮', color: 'var(--text-muted)', title: 'Calculadora de alocação', subtitle: 'Ferramenta · Distribua por classe' },
    ],
  },
  {
    query: 'Maiores dividendos',
    results: [
      { icon: '◑', color: brand.colors.positive, title: 'BBSE3', subtitle: 'BB Seguridade · DY 12 meses', value: '8,42%', valueColor: brand.colors.positive, highlight: true },
      { icon: '◑', color: brand.colors.positive, title: 'TAEE11', subtitle: 'Taesa · Geração de energia', value: '7,98%', valueColor: brand.colors.positive },
      { icon: '◑', color: brand.colors.positive, title: 'CMIG4', subtitle: 'Cemig · Energia elétrica', value: '7,64%', valueColor: brand.colors.positive },
    ],
  },
])

const qsActiveDemoIdx = ref(0)
const qsCurrentDemo = computed<QsDemo>(() => qsDemos.value[qsActiveDemoIdx.value])
let qsTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  qsTimer = setInterval(() => {
    qsActiveDemoIdx.value = (qsActiveDemoIdx.value + 1) % qsDemos.value.length
  }, 3200)
})
onBeforeUnmount(() => {
  if (qsTimer) clearInterval(qsTimer)
})

// Bento mini-tickers: dados REAIS via useAsyncData. 4 fetches paralelos
// (details + 1mo history) por ticker, com fallback gracioso pra zero se
// o backend falhar pra algum dos 4. Roda no SSR.
interface BentoTickerData {
  code: string
  name: string
  price: number
  change: number
  sparkline: number[]
}

const BENTO_CODES = ['PETR4', 'VALE3', 'AAPL34', 'TSLA34'] as const
const BENTO_FALLBACK_NAMES: Record<string, string> = {
  PETR4: 'Petrobras PN',
  VALE3: 'Vale ON',
  AAPL34: 'Apple BDR',
  TSLA34: 'Tesla BDR',
}

// Bento cards are decorative ("PETR4 +2.84%" with a sparkline). To keep
// the 8 ticker fetches OFF the SSR critical path we initialize with stub
// data (4 cards rendered immediately, in both SSR and client) and only
// fire the actual fetch on mount. SSR HTML and client hydration see the
// SAME 4 cards — no mismatch. After mount, the fetcher runs once on the
// client and the values fill in without any DOM structural change.
//
// SEO impact: zero. Every numeric value is also indexed at /asset/petr4
// etc., which Googlebot crawls separately. The home doesn't claim ranking
// on "PETR4 R$ 38,42" anyway — that page's H1 is the value prop hero.
const bentoStubs = (): BentoTickerData[] =>
  BENTO_CODES.map((code) => ({
    code,
    name: BENTO_FALLBACK_NAMES[code] || code,
    price: 0,
    change: 0,
    sparkline: [50, 50],
  }))

const bentoTickerRaw = ref<BentoTickerData[]>(bentoStubs())

onMounted(async () => {
  const results = await Promise.all(
    BENTO_CODES.map(async (code) => {
      try {
        const [details, history] = await Promise.all([
          getTickerDetails(code).catch(() => null),
          assetHistoricPrices(code, '1mo').catch(() => null),
        ])
        const d: any = details || {}
        const price = coerceNumber(d.market_price ?? d.close)
        const change = coerceNumber(d.change_percent ?? d.change)
        const name = (d.name as string) || BENTO_FALLBACK_NAMES[code] || code
        const histArr = Array.isArray(history) ? history : []
        const points = histArr
          .map((p: any) => coerceNumber(p?.market_price ?? p?.close))
          .filter((v: number) => Number.isFinite(v) && v > 0)
        // Sample ~15 points pra sparkline (mantem forma da curva sem ruido).
        let sparkline: number[] = points
        if (points.length > 15) {
          const step = (points.length - 1) / 14
          sparkline = Array.from({ length: 15 }, (_, i) => points[Math.round(i * step)])
        }
        if (sparkline.length < 2) sparkline = [price || 50, price || 50]
        return { code, name, price, change, sparkline }
      } catch {
        return {
          code,
          name: BENTO_FALLBACK_NAMES[code] || code,
          price: 0,
          change: 0,
          sparkline: [50, 50],
        }
      }
    })
  )
  bentoTickerRaw.value = results
})

const bentoTickers = computed(() =>
  (bentoTickerRaw.value || []).map((t) => ({
    code: t.code,
    name: t.name,
    price: t.price > 0
      ? `R$ ${t.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : '—',
    change: t.change,
    logo: `https://icons.brapi.dev/icons/${t.code}.svg`,
    sparkline: t.sparkline,
  }))
)

// Helpers SVG sparkline para os bento tickers (viewBox 120×32).
function bentoSparklineLine(pts: number[]): string {
  if (!pts.length) return ''
  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const range = max - min || 1
  const stepX = 120 / (pts.length - 1)
  const pad = 3
  return pts.map((v, i) => {
    const x = i * stepX
    const y = 32 - pad - ((v - min) / range) * (32 - pad * 2)
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
}
function bentoSparklineArea(pts: number[]): string {
  const line = bentoSparklineLine(pts)
  if (!line) return ''
  const last = (pts.length - 1) * (120 / (pts.length - 1))
  return `${line} L ${last.toFixed(1)} 32 L 0 32 Z`
}

// Live clock para o card editorial (HH:MM em America/Sao_Paulo, atualiza a cada 30s)
const ibovClock = ref('')
function updateIbovClock() {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
  ibovClock.value = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
let ibovClockTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  updateIbovClock()
  ibovClockTimer = setInterval(updateIbovClock, 30_000)
})
onBeforeUnmount(() => {
  if (ibovClockTimer) clearInterval(ibovClockTimer)
})

// Delta intradiario do IBOV em pontos (ultimo - penultimo) para a linha "Hoje, ... pts"
const ibovDeltaPtsFormatted = computed(() => {
  const series = homeMarketData.value?.ibovSeries
  if (!Array.isArray(series) || series.length < 2) return ''
  const last = coerceNumber(series[series.length - 1].market_price)
  const prev = coerceNumber(series[series.length - 2].market_price)
  const delta = last - prev
  if (!Number.isFinite(delta)) return ''
  const sign = delta >= 0 ? '+' : ''
  return `${sign}${fmt.number(Math.round(delta))} pts`
})

const chatSuggestions = [
  'Qual a diferença entre ações e FIIs?',
  'Como funcionam os dividendos?',
  'O que é diversificação?',
  'Quanto devo investir por mês?',
  'Como escolher boas ações?',
  'Vale a pena investir em ETFs?',
]

const tickerCarouselItems = computed(() =>
  topAssets.value.top.stocks.slice(0, 40).map((asset) => {
    const priceNum = coerceNumber(asset.market_price ?? asset.close)
    const price = priceNum > 0
      ? `R$ ${priceNum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : ''
    return {
      logo: asset.logo || '/default-logo.png',
      ticker: asset.ticker,
      change: `${coerceNumber(asset.change_percent ?? asset.change).toFixed(2)}%`,
      price,
    }
  })
)

watchEffect(() => {
  const payload = homeMarketData.value
  if (!payload) return

  topAssets.value = payload.rankings
  stocksData.value = payload.treemap

  if (!ibovChartData.value.length && payload.ibovSeries.length) {
    ibovChartData.value = mapIndiceSeries(payload.ibovSeries)
  }
  
  // Desbloqueia os botões assim que os dados forem carregados
  if (loading.value) {
    loading.value = false
  }
})

function mapIndiceSeries(data: IndiceData[]): ChartPoint[] {
  return data.map((item) => ({
    date: item.price_at,
    value: coerceNumber(item.market_price),
    timestamp: new Date(item.price_at).getTime(),
  }))
}

function buildTreemapDataset(
  topStocks: IAsset[] = [],
  bottomStocks: IAsset[] = [],
  topReits: IAsset[] = [],
  bottomReits: IAsset[] = []
): TreemapEntry[] {
  const limitPerGroup = Math.max(1, Math.floor(TREEMAP_LIMIT / 4))
  const dataset: TreemapEntry[] = []

  const pushAssets = (items: IAsset[], category: 'acoes' | 'fiis') => {
    if (!Array.isArray(items)) return
    items.slice(0, limitPerGroup).forEach((asset) => {
      if (!asset?.ticker) return
      dataset.push({
        symbol: asset.ticker,
        name: asset.name,
        price: coerceNumber(asset.market_price ?? asset.close),
        change: coerceNumber(asset.change_percent ?? asset.change),
        category,
        sector: asset.sector || undefined,
      })
    })
  }

  pushAssets(topStocks, 'acoes')
  pushAssets(bottomStocks, 'acoes')
  pushAssets(topReits, 'fiis')
  pushAssets(bottomReits, 'fiis')

  return dataset
}

function handleChatCardClick() {
  blockChat.value = true
}

const ibovChartLabel = computed(() => {
  const lastPoint =
    ibovChartData.value.length > 0
      ? ibovChartData.value[ibovChartData.value.length - 1]
      : null

  return [
    {
      label: 'IBOV',
      color: brand.chartColors.positive,
      value: lastPoint ? lastPoint.value.toFixed(2) : '0',
    },
  ]
})

async function fetchIbovChartData(
  range: ChartTimeRange = selectedTimeRange.value
) {
  loading.value = true
  let period: '1mo' | 'ytd' | '3mo' | '12mo' | '3y' | '4y' | '5y' | 'full' =
    '1mo'
  if (range === 'year') period = '12mo'
  else if (range === '3years') period = '3y'
  else if (range === 'full') period = 'full'

  const data = await getIndiceHistoricPrices('ibov', period)
  ibovChartData.value = mapIndiceSeries(Array.isArray(data) ? data : [])
  loading.value = false
}

function redirectToLogin(source: string) {
  navigateTo(
    `/auth/login?redirect=/${source === 'calculadora' ? 'calculadora' : 'help'}`
  )
}

watch(selectedTimeRange, (range) => {
  if (range === 'month' && homeMarketData.value?.ibovSeries?.length) {
    ibovChartData.value = mapIndiceSeries(homeMarketData.value.ibovSeries)
    loading.value = false
    return
  }

  fetchIbovChartData(range)
})


definePageMeta({
  isPublicRoute: true,
})
</script>

<style scoped>
/* QuickSearch showcase ====================================================
   - cursor blink ao lado da query mock
   - results entry transition (fade + slide) na troca de demo */
.qs-cursor {
  display: inline-block;
  width: 1px;
  height: 14px;
  margin-left: 2px;
  vertical-align: middle;
  animation: qs-cursor-blink 1s steps(2) infinite;
}
@keyframes qs-cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.qs-results-enter-active,
.qs-results-leave-active {
  transition: opacity 280ms ease, transform 280ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.qs-results-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.qs-results-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.carousel-container {
  box-shadow: 0px 0px 80px 0px rgba(55, 77, 60, 0.6);
}

.category-minimal:hover,
.category-minimal:focus-visible {
  background-color: var(--hover-bg, transparent);
}

/* ========== BENTO GUIDES ==========
   Responsive grid:
   - mobile: 1 col stack
   - md: 2 cols — hero spans 2 cols row 1, mediums fill row 2 (2×2)
   - lg: 4 cols — hero 2×2, mediums flank it (cols 3-4 × rows 1-2),
     8 compact tiles fill rows 3-4 (4 cols × 2 rows)
*/
.bento-guides {
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .bento-guides {
    grid-template-columns: repeat(2, 1fr);
  }
  .bento-guides-hero {
    grid-column: span 2;
  }
}
@media (min-width: 1024px) {
  .bento-guides {
    grid-template-columns: repeat(4, 1fr);
    grid-auto-flow: row dense;
  }
  .bento-guides-hero {
    grid-column: span 2;
    grid-row: span 2;
    min-height: 420px;
  }
  .bento-guides-medium {
    min-height: 200px;
  }
}

.bento-guides-hero:hover,
.bento-guides-medium:hover,
.bento-guides-tile:hover {
  transform: translateY(-1px);
}
.bento-guides-hero::after,
.bento-guides-medium::after,
.bento-guides-tile::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 0 1px transparent;
  transition: box-shadow 0.2s ease;
}
.bento-guides-hero:hover::after,
.bento-guides-hero:focus-visible::after,
.bento-guides-medium:hover::after,
.bento-guides-medium:focus-visible::after,
.bento-guides-tile:hover::after,
.bento-guides-tile:focus-visible::after {
  box-shadow: inset 0 0 0 1px var(--brand-primary, #f59e0b);
}

/* ========== API PRODUCT SECTION ========== */
.api-product-section .api-row {
  position: relative;
}
.api-product-section .api-row::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, var(--brand-primary, #f59e0b)0a, transparent);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}
.api-product-section .api-row:hover::before {
  opacity: 1;
}
.api-product-section .creative-tile {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.api-product-section .api-row:hover .creative-tile {
  transform: translateY(0) !important;
}
.api-product-section .terminal-window {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.api-product-section .api-row:hover .terminal-window {
  transform: translateY(-4px);
}

</style>

<template>
  <NuxtLayout :name="layoutName" title="Visão geral">
    <div class="flex flex-col">
    <!-- View toggle: Para você (/para-voce) | Mercado completo (/).
         Após swap 2026-05-17: esta página agora é a /, e a "Para você"
         editorial migrou pra /para-voce. Toggle só aparece quando o
         tenant ativou a flag `features.showParaVoce` no admin. -->
    <div v-if="brand.features?.showParaVoce" class="flex justify-center py-2">
      <MoleculesHomeViewToggle />
    </div>

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
         versão compacta.

         Gate: tenants podem esconder a régua via `brand.features.showTickerRail`
         (Me Poupe! por exemplo fica fora do tom pop magazine com o ticker
         de mercado direto debaixo do hero). Default true mantem behavior. -->
    <div
      v-if="showTickerRail"
      class="w-full py-4"
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

    <!-- AUTH GREETING: introducao curta pra usuarios logados. O checklist
         de onboarding (proximos passos) foi movido pra sidebar via
         layouts/default.vue + useOnboardingChecklist composable. -->
    <section
      v-if="authStore.isAuthenticated"
      class="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-10 text-center md:px-6 md:pt-16"
    >
      <p class="eyebrow mb-3" :style="{ color: 'var(--brand-primary)' }">
        BEM-VINDO DE VOLTA
      </p>
      <h1
        class="max-w-3xl text-[32px] font-light leading-[1.08] tracking-[-0.022em] md:text-[48px]"
        :style="{ color: 'var(--text-heading)' }"
      >
        Olá,
        <span class="italic" style="font-family: 'Instrument Serif', serif; color: var(--brand-primary)">{{ userFirstName }}</span>.
      </h1>
      <p
        class="mt-3 max-w-xl !text-[14px] leading-relaxed"
        :style="{ color: 'var(--text-body)' }"
      >
        Veja o que mudou na sua carteira e no mercado nas últimas horas. Tudo em um piscar de olhos.
      </p>
    </section>


    <!-- Calculadora de Impacto / Poder do Tempo -->
    <MoleculesWealthProjection v-if="showSection('wealthCalculator') && brand.wealthCalculator && !authStore.isAuthenticated" :style="{ order: sectionOrder('wealthCalculator') }" />

    <!-- Personagens / Universo da marca -->
    <MoleculesCharacterShowcase v-if="showSection('characters') && brand.characters && !authStore.isAuthenticated" :style="{ order: sectionOrder('characters') }" />

    <!-- Checklist / Roteiro do Investidor -->
    <MoleculesInvestorChecklist v-if="showSection('investorChecklist') && brand.investorChecklist && !authStore.isAuthenticated" :style="{ order: sectionOrder('investorChecklist') }" />

    <!-- Seção de Mercado ao Vivo — quiet style (lightness as luxury). -->
    <div v-if="showSection('market')" :style="{ order: sectionOrder('market') }" class="flex h-auto flex-col gap-6 pt-4 md:px-4 md:pt-6">
      <!-- Editorial data band: ambient amber radial + floating chart/ticker card -->
      <div class="relative flex flex-col gap-4">
        <!-- Move 2: ambient amber radial glow (offset top-center, behind data) -->
        <div
          class="pointer-events-none absolute inset-x-0 -top-16 -z-10 h-[640px] overflow-hidden"
          aria-hidden="true"
        >
          <div
            class="mx-auto h-full w-[110%] max-w-[1280px] -translate-y-8"
            :style="{ background: `radial-gradient(ellipse 60% 80% at 50% 0%, color-mix(in srgb, var(--brand-primary) 28%, transparent), transparent 65%)`, filter: 'blur(160px)' }"
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
            class="ibov-editorial-card relative col-span-2 overflow-hidden rounded-[14px] border md:col-span-8 md:row-span-2"
            style="background: var(--bg-elevated); border-color: color-mix(in srgb, var(--brand-border) 30%, transparent);"
          >
            <!-- Chart header + chart, sem atmospheric blur -->
            <div class="relative flex w-full flex-col gap-5 px-5 pb-5 pt-6 md:px-7 md:pb-6 md:pt-7">
              <!-- Header: IBOVESPA (IBOV) · Ao Vivo + period selector -->
              <header class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-2 text-[13px]">
                  <span class="font-semibold tracking-wide" style="color: var(--text-heading);" translate="no">
                    IBOVESPA (IBOV)
                  </span>
                  <span aria-hidden="true" style="color: var(--text-muted);">·</span>
                  <span class="inline-flex items-center gap-1.5" style="color: var(--text-muted);">
                    <span class="relative flex size-2" aria-hidden="true">
                      <span
                        v-if="marketStatus.animate"
                        class="absolute inline-flex h-full w-full rounded-full opacity-70 motion-safe:animate-ping"
                        :style="{ backgroundColor: marketStatus.color }"
                      />
                      <span class="relative inline-flex size-2 rounded-full" :style="{ backgroundColor: marketStatus.color }" />
                    </span>
                    <span translate="no">{{ marketStatus.label }}</span>
                  </span>
                </div>
                <MoleculesPeriodSelector
                  v-model="selectedTimeRange"
                  :loading="loading"
                  :dropdown="false"
                />
              </header>

              <!-- Big number + delta inline (sem chip) -->
              <div class="flex w-full flex-col gap-1.5">
                <div class="flex flex-wrap items-baseline gap-3">
                  <p
                    class="font-light leading-none tabular-nums text-[28px] md:text-[44px]"
                    style="color: var(--text-heading); letter-spacing: -0.03em;"
                    aria-label="Cotação atual do IBOV"
                    translate="no"
                  >
                    {{ fmt.brl(ibovLastPrice).replace(/^R\$\s*/, '') }}
                  </p>
                  <span
                    class="font-medium tabular-nums text-[15px]"
                    :style="{ color: ibovVariationColor }"
                    translate="no"
                  >
                    {{ ibovIndicator }}
                  </span>
                </div>
                <p
                  v-if="ibovDeltaPtsFormatted"
                  class="text-[12px]"
                  style="color: var(--text-muted);"
                  translate="no"
                >
                  Hoje, <span class="tabular-nums" :style="{ color: ibovVariationColor }">{{ ibovDeltaPtsFormatted }} pts</span>
                  <span v-if="ibovPrevClose !== null" aria-hidden="true"> · </span>
                  <template v-if="ibovPrevClose !== null">Fech. anterior: <span class="tabular-nums">{{ fmt.brl(ibovPrevClose).replace(/^R\$\s*/, '') }}</span></template>
                </p>
              </div>

              <AtomsGraphLine
                :data="ibovChartData"
                :legend="ibovChartLabel"
                :height="200"
                :loading="loading"
              />
            </div>
          </article>

          <!-- Mercado agora — narrativa setorial/macro do dia.
               Reusa o `pesouPills` do /para-voce (top mover, brent, dolar). -->
          <aside
            class="market-now relative col-span-2 overflow-hidden rounded-[14px] border md:col-span-4 md:row-span-2"
            :style="{
              background: 'var(--bg-elevated)',
              borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)',
            }"
          >
            <div class="flex h-full flex-col gap-4 px-5 py-5 md:px-6 md:py-6">
              <header class="flex items-center justify-between">
                <span class="eyebrow">Mercado agora</span>
                <NuxtLink
                  to="/para-voce"
                  class="text-[12px] font-medium transition-colors hover:opacity-80"
                  :style="{ color: 'var(--brand-text)' }"
                >Análise completa →</NuxtLink>
              </header>

              <!-- Skeleton enquanto pesouPills carrega -->
              <ul v-if="homeNarrativeLoading || !homeNarrative.pesouPills.length" class="flex flex-1 flex-col gap-3">
                <li
                  v-for="n in 4"
                  :key="`skel-mn-${n}`"
                  class="flex items-start gap-3 rounded-[12px] border px-3.5 py-3"
                  :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }"
                >
                  <span
                    class="block h-9 w-9 shrink-0 rounded-[10px]"
                    :style="{ background: 'color-mix(in srgb, var(--text-heading) 4%, transparent)' }"
                  />
                  <div class="flex flex-1 flex-col gap-1.5">
                    <span
                      class="block h-3 rounded"
                      :style="{ background: 'color-mix(in srgb, var(--text-heading) 6%, transparent)', width: '90%' }"
                    />
                    <span
                      class="block h-3 rounded"
                      :style="{ background: 'color-mix(in srgb, var(--text-heading) 6%, transparent)', width: '55%' }"
                    />
                  </div>
                </li>
              </ul>

              <ul v-else class="flex flex-1 flex-col gap-3">
                <li
                  v-for="p in homeNarrative.pesouPills.slice(0, 4)"
                  :key="p.key"
                  :class="['market-now-pill flex items-start gap-3 rounded-[12px] border px-3.5 py-3 transition-colors', `market-now-pill--${p.key}`]"
                  :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }"
                >
                  <span
                    :class="['market-now-icon flex size-9 shrink-0 items-center justify-center rounded-[10px]', `market-now-icon--${p.key}`]"
                  >
                    <UIcon :name="p.icon" class="size-[18px]" />
                  </span>
                  <p
                    class="market-now-text text-[13px] leading-snug"
                    :style="{ color: 'var(--text-body)' }"
                    v-html="p.html"
                  />
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <!-- Linha horizontal de ticker cards (PETR4 / VALE3 / AAPL34 / TSLA34)
             + CTA "Ver mais ativos". Card único com divisores verticais
             entre os tickers, no estilo do reference editorial. -->
        <div
          class="ticker-row mx-4 grid grid-cols-2 overflow-hidden rounded-[14px] border md:mx-0 md:flex md:items-stretch"
          :style="{
            background: 'var(--bg-elevated)',
            borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)',
          }"
        >
          <NuxtLink
            v-for="(ticker, idx) in bentoTickers"
            :key="ticker.code"
            :to="`/asset/${ticker.code.toLowerCase()}`"
            :class="[
              'ticker-row-item group relative flex items-center gap-3 px-4 py-4 transition-colors md:flex-1 md:gap-4 md:px-5 md:py-5',
              idx > 0 ? 'ticker-row-item--divider' : '',
            ]"
          >
            <div
              class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border md:size-11"
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
                class="font-mono-tab text-[10px] font-bold"
                :style="{ color: 'var(--text-muted)' }"
              >{{ ticker.code.slice(0, 2) }}</span>
            </div>
            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <span
                class="truncate text-[14px] font-medium leading-none"
                :style="{ color: 'var(--text-heading)' }"
                translate="no"
              >{{ ticker.code }}</span>
              <span
                class="truncate text-[11px] leading-none"
                :style="{ color: 'var(--text-muted)' }"
              >{{ ticker.name }}</span>
              <div class="mt-1 flex items-baseline gap-2">
                <span
                  class="text-[13px] tabular-nums leading-none"
                  :style="{ color: 'var(--text-body)' }"
                  translate="no"
                >{{ ticker.price }}</span>
                <span
                  class="text-[12px] font-medium tabular-nums leading-none"
                  :style="{ color: ticker.change >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)' }"
                  translate="no"
                >{{ ticker.change >= 0 ? '+' : '' }}{{ ticker.change.toFixed(2) }}%</span>
              </div>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/search"
            class="ticker-row-cta col-span-2 flex items-center justify-center gap-2 border-t px-5 py-4 text-[13px] font-medium transition-colors md:col-span-1 md:flex-shrink-0 md:border-l md:border-t-0 md:px-6"
            :style="{
              color: 'var(--text-heading)',
              borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)',
            }"
          >
            Ver mais ativos
            <UIcon name="i-lucide-arrow-right" class="size-4" />
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
        <!-- Variant router: cada tenant pode trocar o visual do ranking
             completo (altas + baixas) via brand.hero.variant. Default
             eh o layout quiet Redentia abaixo. -->
        <MoleculesHomeRankingsMentor
          v-if="brand.hero?.variant === 'mentor'"
          :asset-categories="assetCategories"
          :top-assets="topAssets"
          :ranking-link-queries="rankingLinkQueries"
          :slice-ranking="sliceRanking"
        />
        <MoleculesHomeRankingsShowtime
          v-else-if="brand.hero?.variant === 'showtime'"
          :asset-categories="assetCategories"
          :top-assets="topAssets"
          :ranking-link-queries="rankingLinkQueries"
          :slice-ranking="sliceRanking"
        />
        <template v-else>
          <!-- Maiores Altas (default Redentia quiet) -->
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
              :style="rankingCardStyle('var(--brand-positive)')"
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
                  style="border-color: var(--brand-border);"
                />
              </div>
            </div>
          </UCarousel>

          <!-- Maiores Baixas (default Redentia quiet) -->
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
              :style="rankingCardStyle('var(--brand-negative)')"
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
                  style="border-color: var(--brand-border);"
                />
              </div>
            </div>
          </UCarousel>
        </template>
      </template>

      <!-- Crypto rankings — depois dos filtros inteligentes pra manter o
           ritmo: primeiro a grid do B3, depois atalhos, depois cripto,
           depois tesouro.

           Gate: tenants podem desativar o bloco via brand.features.showCrypto
           (Me Poupe! por exemplo nao quer cripto na home — fora do tom
           "TV pop magazine"). Default true mantem behavior atual. -->
      <LazyMoleculesCryptoRankings v-if="showCrypto" />

      <!-- Tesouro Direto — após rankings + filtros inteligentes -->
      <div class="px-4 md:px-0">
        <LazyMoleculesTesouroSection />
      </div>
    </div>


    <!-- QuickSearch showcase: banner largo + altura modesta vendendo a busca
         inteligente. Demonstra o ⌘K rotacionando queries reais com results
         vivos. Edge-to-edge na largura (parent não tem mais padding pra
         escapar — sem -mx-4). Posicionado logo antes das noticias — bridge
         abaixo conecta as 2. -->
    <section
      v-if="!authStore.isAuthenticated"
      class="qs-showcase relative overflow-hidden"
      :style="{
        order: (sectionOrder('news') ?? 0) - 1,
        background: `linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--brand-primary) 5%, transparent) 50%, color-mix(in srgb, var(--brand-primary) 3%, transparent) 100%)`,
      }"
    >
      <!-- Radial subtle accent atras -->
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

        <!-- Right: QuickSearch dock target em layout BENTO SPLIT (V3).
             Card com 2 zonas internas: esquerda (4 col) com contexto +
             atalho ⌘K destacado; direita (8 col) com bg dot pattern e
             o dock + chips. O pill flutuante do bottom encaixa na
             zona direita via Teleport+FLIP quando o user rola até aqui. -->
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
                 bg dot grid pattern sutil pra dar textura editorial. -->
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

    <!-- News Section — feed de notícias de mercado (apenas Redentia por enquanto) -->
    <MoleculesNewsSection v-if="showSection('news')" :style="{ order: sectionOrder('news') }" class="px-4 md:px-4" />

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
          <p class="mb-2 text-xs uppercase tracking-[0.2em]" :style="{ color: 'var(--brand-text-muted)' }">
            {{ brand.homeTexts.categoriesEyebrow }}
          </p>
          <h2 class="mb-2 text-2xl md:text-3xl" :class="[brand.font.headingWeight, brand.font.headingStyle]" :style="{ color: 'var(--brand-text)' }">
            {{ brand.homeTexts.categoriesTitle }}
          </h2>
          <p class="text-sm md:text-base" :style="{ color: 'var(--brand-text-muted)' }">
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
              :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }"
            >
              <div class="flex items-center gap-3">
                <div class="bg-secondary/20 p-3 brand-pill">
                  <UIcon :name="cat.icon" class="text-secondary h-6 w-6" />
                </div>
                <h3 class="text-[18px] font-medium group-hover:text-secondary" :style="{ color: 'var(--brand-text)', letterSpacing: '-0.22px' }">{{ cat.label }}</h3>
              </div>
              <p v-if="cat.description" class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">
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
              :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }"
            >
              <div class="bg-secondary/20 p-4 brand-pill">
                <UIcon :name="cat.icon" class="text-secondary h-8 w-8" />
              </div>
              <h3 class="text-[18px] font-medium group-hover:text-secondary" :style="{ color: 'var(--brand-text)', letterSpacing: '-0.22px' }">{{ cat.label }}</h3>
              <p v-if="cat.description" class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">
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
              :style="{ borderLeftColor: 'var(--brand-primary)', '--hover-bg': 'color-mix(in srgb, var(--brand-text-muted) 5%, transparent)' } as Record<string, string>"
            >
              <span class="text-sm font-medium" :style="{ color: 'var(--brand-text)' }">{{ cat.label }}</span>
              <span class="flex items-center gap-1 text-xs font-medium" :style="{ color: 'var(--brand-primary)' }">
                {{ cat.cta }}
                <UIcon name="i-lucide-chevron-right" class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </NuxtLink>
          </template>
        </div>
      </div>
    </section>

    <!-- Seção Blog / Guias Educacionais - Bento grid editorial -->
    <section v-if="showSection('guides')" :style="{ order: sectionOrder('guides') }" class="px-4 pt-12 md:px-4">
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
      <div class="bento-guides grid gap-px" :style="{ backgroundColor: 'var(--brand-border)' }">
        <!-- HERO card: col-span 2, row-span 2 -->
        <NuxtLink
          :to="guidesHero[0].to"
          class="bento-guides-hero group relative flex flex-col justify-between overflow-hidden p-6 transition-[transform,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset md:p-10"
          :style="{ backgroundColor: 'var(--brand-surface)' }"
          :aria-label="`Ler ${guidesHero[0].titulo}`"
        >
          <!-- Ambient radial glow -->
          <div
            class="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
            :style="{ background: `radial-gradient(ellipse at 80% 20%, ${'var(--brand-primary)'}22, transparent 60%), radial-gradient(ellipse at 20% 90%, color-mix(in srgb, var(--brand-primary) 6%, transparent), transparent 55%)` }"
            aria-hidden="true"
          />
          <!-- Top row: eyebrow categoria + arrow circle -->
          <div class="relative flex items-start justify-between gap-4">
            <span class="eyebrow" translate="no">
              Estudo em destaque · {{ guidesHero[0].categoria }}
            </span>
            <div
              class="flex size-10 items-center justify-center rounded-md transition-all duration-200 group-hover:translate-x-1 group-hover:-translate-y-px"
              style="background-color: var(--brand-primary); color: var(--text-on-primary);"
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
          :style="{ backgroundColor: 'var(--brand-surface)' }"
          :aria-label="`Ler ${guide.titulo}`"
        >
          <div class="flex items-start justify-between gap-3">
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-lg transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-300 group-hover:scale-110"
              :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-primary)' }"
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
                :style="{ color: 'var(--brand-primary)' }"
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
          :style="{ backgroundColor: 'var(--brand-surface)' }"
          :aria-label="`Abrir ${guide.titulo}`"
        >
          <div
            class="flex size-8 shrink-0 items-center justify-center rounded-md transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-300 group-hover:scale-110"
            :style="{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-primary)' }"
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
            :style="{ color: 'var(--brand-primary)' }"
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

    <!-- Seção de IA (extraída pra componente reutilizável) -->
    <MoleculesHomeAiCta
      v-if="showSection('aiCta') && !authStore.isAuthenticated"
      :style="{ order: sectionOrder('aiCta') }"
    />

    <!-- ========== DEVELOPER PRODUCTS · API + Creative + Embed (componente reutilizável) ========== -->
    <MoleculesHomeApiProduct
      v-if="showSection('apiProduct') && !authStore.isAuthenticated"
      :style="{ order: sectionOrder('apiProduct') }"
    />

    <!-- ============ FAQ home pública (componente reutilizável) ============ -->
    <MoleculesHomeFaqBlock
      v-if="showSection('faq') && !authStore.isAuthenticated"
      :style="{ order: sectionOrder('faq') }"
    />
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

// Primeiro nome do usuario logado, capitalizado. Usado no greeting da
// home autenticada ("Olá, André."). Fallback "investidor" cobre o caso
// raro de `me` ainda nao ter hidratado de localStorage no exato momento
// do render (Pinia hydration roda apos mount).
const userFirstName = computed(() => {
  const raw = (authStore.me?.name ?? '').trim()
  if (!raw) return 'investidor'
  const first = raw.split(/\s+/)[0] ?? ''
  if (!first) return 'investidor'
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
})

// Onboarding checklist movido pra sidebar (default.vue) via composable
// useOnboardingChecklist. A home autenticada agora so renderiza o
// greeting; o "que fazer agora" vive sticky no canto.

// (creativeThumbs movido pra MoleculesHomeApiProduct;
//  homeFaqItems + resolvedFaqItems movidos pra MoleculesHomeFaqBlock)


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

// Driver narrative ("Mercado agora" card) — reusa o pesouPills do
// /para-voce. Lista 3-4 forças setoriais/macro que estão movendo o
// índice agora (gainers/losers + Brent + Dólar).
const { data: homeNarrative, loading: homeNarrativeLoading } = useHomeData()

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
  if (v === 'card') return { borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }
  if (v === 'border-left') return { borderColor: accentColor }
  return {}
}

function sliceRanking(items: any[] | undefined) {
  if (!items) return []
  return items.slice(0, brand.homePage.rankingCard.itemsPerCategory)
}

// Crypto rankings gate: tenants podem desativar o bloco inteiro via
// `brand.features.showCrypto: false` (ex: Me Poupe! fica fora do tom).
// Default = true pra preservar behavior atual.
const showCrypto = computed(() => {
  return (brand as any).features?.showCrypto !== false
})

// Ticker rail gate: regua de tickers ao vivo debaixo do hero. Me Poupe!
// nao usa (visual showtime ja tem propria gramatica). Default true.
const showTickerRail = computed(() => {
  return (brand as any).features?.showTickerRail !== false
})

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
  if (!stats || stats.variation === 0) return 'var(--brand-text-muted)'
  return stats.variation > 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'
})

const ifixVariationColor = computed(() => {
  const stats = calculateSeriesStats(homeMarketData.value?.ifixSeries)
  if (!stats || stats.variation === 0) return 'var(--brand-text-muted)'
  return stats.variation > 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'
})

// qsShortcutModifier ainda é usado pelo hint "Aperte ⌘K" da copy esquerda.
// O mockup rotacionando (qsDemos / qsCurrentDemo / qsActiveDemoIdx / qsTimer)
// foi removido — a coluna direita agora hospeda o dock real do QuickSearch.
const qsShortcutModifier = computed(() => {
  if (typeof navigator === 'undefined') return '⌘'
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'
})

// Chips de exemplo abaixo do dock — mostram variedade de queries que
// a busca aceita (ticker, natural language, instrumento, conceito).
// Clicar leva pra /search?q=… que abre os resultados completos.
const qsExamples = [
  { label: 'PETR4', query: 'PETR4' },
  { label: 'Quem subiu hoje?', query: 'maiores altas' },
  { label: 'Tesouro IPCA+', query: 'tesouro ipca' },
  { label: 'Maiores dividendos', query: 'dividendos' },
  { label: 'Como diversificar?', query: 'diversificar carteira' },
]

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
const ibovDeltaPtsRaw = computed(() => {
  const series = homeMarketData.value?.ibovSeries
  if (!Array.isArray(series) || series.length < 2) return null
  const last = coerceNumber(series[series.length - 1].market_price)
  const prev = coerceNumber(series[series.length - 2].market_price)
  const delta = last - prev
  if (!Number.isFinite(delta)) return null
  return delta
})

const ibovDeltaPtsFormatted = computed(() => {
  const delta = ibovDeltaPtsRaw.value
  if (delta === null) return ''
  const sign = delta >= 0 ? '+' : ''
  return `${sign}${fmt.number(Math.round(delta))}`
})

const ibovPrevClose = computed(() => {
  const delta = ibovDeltaPtsRaw.value
  if (delta === null) return null
  return ibovLastPrice.value - delta
})

const chatSuggestions = [
  'Qual a diferença entre ações e FIIs?',
  'Como funcionam os dividendos?',
  'O que é diversificação?',
  'Quanto devo investir por mês?',
  'Como escolher boas ações?',
  'Vale a pena investir em ETFs?',
]

// Combina altas + baixas de todas as classes (stocks/reits/etfs/bdrs) num
// único pool de tickers pro rail, deduplicando por ticker. Antes usávamos
// só top.stocks (~8 items), o que deixava o carousel com buracos em telas
// largas. Com 4 classes × 2 (top + bottom) × 8 = até 64 candidatos.
const tickerCarouselItems = computed(() => {
  const pool = [
    ...topAssets.value.top.stocks,
    ...topAssets.value.bottom.stocks,
    ...topAssets.value.top.reits,
    ...topAssets.value.bottom.reits,
    ...topAssets.value.top.etfs,
    ...topAssets.value.bottom.etfs,
    ...topAssets.value.top.bdrs,
    ...topAssets.value.bottom.bdrs,
  ]
  const seen = new Set<string>()
  const out: { logo: string; ticker: string; change: string; price: string }[] = []
  for (const asset of pool) {
    if (!asset?.ticker || seen.has(asset.ticker)) continue
    seen.add(asset.ticker)
    const priceNum = coerceNumber(asset.market_price ?? asset.close)
    const price = priceNum > 0
      ? `R$ ${priceNum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : ''
    out.push({
      logo: asset.logo || '/default-logo.png',
      ticker: asset.ticker,
      change: `${coerceNumber(asset.change_percent ?? asset.change).toFixed(2)}%`,
      price,
    })
  }
  return out
})

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
/* Exemplo chips abaixo do QuickSearch dock na home.
   Pill discreto, hover anima borda e cor pra brand-primary. */
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
  box-shadow: inset 0 0 0 1px var(--brand-primary, var(--brand-warning));
}

/* ========== API PRODUCT SECTION ========== */
.api-product-section .api-row {
  position: relative;
}
.api-product-section .api-row::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, var(--brand-primary, var(--brand-warning))0a, transparent);
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

/* ========== MERCADO AGORA (driver narrative card a direita do IBOV) ========== */
.market-now-pill:hover {
  background: color-mix(in srgb, var(--text-heading) 3%, transparent);
}
.market-now-icon--losers,
.market-now-icon--juros {
  background: color-mix(in srgb, var(--brand-negative) 14%, transparent);
  color: var(--brand-negative);
}
.market-now-icon--gainers,
.market-now-icon--commodity {
  background: color-mix(in srgb, var(--brand-positive) 14%, transparent);
  color: var(--brand-positive);
}
.market-now-icon--petroleo {
  background: color-mix(in srgb, #d97706 14%, transparent);
  color: #d97706;
}
.market-now-icon--dolar,
.market-now-icon--global {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
}
.market-now-icon--consumo {
  background: color-mix(in srgb, #7c3aed 14%, transparent);
  color: #7c3aed;
}
.market-now-text :deep(strong) { color: var(--text-heading); font-weight: 600; }
.market-now-text :deep(strong.pos) { color: var(--brand-positive); }
.market-now-text :deep(strong.neg) { color: var(--brand-negative); }

/* ========== TICKER ROW (linha horizontal de tickers + CTA) ========== */
.ticker-row-item--divider {
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 20%, transparent);
}
@media (min-width: 768px) {
  .ticker-row-item--divider {
    border-top: none;
    border-left: 1px solid color-mix(in srgb, var(--brand-border) 20%, transparent);
  }
}
.ticker-row-item:hover {
  background: color-mix(in srgb, var(--text-heading) 3%, transparent);
}
.ticker-row-cta:hover {
  background: color-mix(in srgb, var(--brand-primary) 6%, transparent);
  color: var(--brand-primary);
}

</style>

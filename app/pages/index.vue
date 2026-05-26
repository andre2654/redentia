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
            class="market-now card-soft-bg relative col-span-2 overflow-hidden rounded-[14px] border md:col-span-4 md:row-span-2"
            :style="{
              background: 'var(--bg-elevated)',
              borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)',
            }"
          >
            <div class="flex h-full flex-col gap-4 px-5 py-5 md:px-6 md:py-6">
              <header class="flex items-center justify-between">
                <span class="eyebrow">Mercado agora</span>
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


      <!-- ============ EXPLORAR O MERCADO ============
           Header compacto + tabs de categoria + 5 mini-listas
           (maiores altas / baixas / mais negociadas / dividend yield / market cap).
           Refatorado do bloco "Mercado ao vivo" original (que mostrava
           treemap + carousels). Pattern: pill tabs no estilo /wallet,
           cards com border 30% e bg-elevated. -->
      <section class="explore-market flex flex-col gap-5 px-4 pt-10 md:px-0">
        <header class="flex items-center justify-between gap-4">
          <span class="eyebrow">Explorar o mercado</span>
          <NuxtLink
            to="/search"
            class="inline-flex items-center gap-1 text-[13px] font-medium transition-opacity hover:opacity-80"
            :style="{ color: 'var(--brand-text)' }"
          >
            Ver tudo
            <UIcon name="i-lucide-arrow-right" class="size-3.5" />
          </NuxtLink>
        </header>

        <!-- Category tabs (pill-style) -->
        <div class="explore-tabs flex flex-wrap items-center gap-2">
          <button
            v-for="cat in exploreCategoriesList"
            :key="cat.key"
            type="button"
            :class="['explore-tab rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors', selectedExploreCategory === cat.key ? 'explore-tab--active' : '']"
            @click="selectedExploreCategory = cat.key"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- 5 listas grid (1 col mobile / 2 tablet / 5 desktop) -->
        <div class="explore-lists grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <article
            v-for="list in exploreLists"
            :key="list.key"
            class="explore-list-card flex flex-col gap-4 rounded-[14px] border px-5 py-5"
            :style="{ background: 'var(--bg-elevated)', borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
          >
            <h3 class="text-[13px] font-medium" :style="{ color: 'var(--text-heading)' }">{{ list.title }}</h3>

            <ul v-if="list.items.length" class="flex flex-col gap-3">
              <li
                v-for="item in list.items"
                :key="item.ticker"
                class="flex items-center justify-between gap-2"
              >
                <NuxtLink
                  :to="item.href"
                  class="flex min-w-0 flex-1 items-center gap-2 transition-opacity hover:opacity-80"
                >
                  <span
                    class="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-md border"
                    :style="{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-overlay)' }"
                  >
                    <img
                      v-if="item.logo && !failedExploreLogos.isFailed(item.logo)"
                      :src="item.logo"
                      :alt="`Logo ${item.ticker}`"
                      class="size-full object-cover"
                      loading="lazy"
                      @error="failedExploreLogos.markFailed(item.logo)"
                    />
                    <span
                      v-else
                      class="font-mono-tab text-[8px] font-bold"
                      :style="{ color: 'var(--text-muted)' }"
                    >{{ item.ticker.slice(0, 2) }}</span>
                  </span>
                  <span
                    class="truncate text-[13px] font-medium leading-none"
                    :style="{ color: 'var(--text-heading)' }"
                    translate="no"
                  >{{ item.ticker }}</span>
                </NuxtLink>
                <span
                  class="shrink-0 tabular-nums text-[13px] leading-none"
                  :style="{ color: item.colorVar ?? 'var(--text-body)' }"
                  translate="no"
                >{{ item.value }}</span>
              </li>
            </ul>
            <p v-else class="text-[12px]" :style="{ color: 'var(--text-muted)' }">
              Sem dados ainda
            </p>
          </article>
        </div>
      </section>

      <!-- ============ MAPA DE SETORES + INSIGHTS DA REDENTIA ============
           Dois cards lado-a-lado. Esquerda: heatmap de setores com
           magnitude do dia. Direita: 3 insights AI (causalFactors do
           useHomeData, mesma fonte do /para-voce). -->
      <section class="market-insights grid grid-cols-1 gap-4 px-4 md:grid-cols-2 md:px-0">
        <!-- LEFT: Mapa de setores -->
        <article
          class="sectors-card card-soft-bg flex flex-col gap-5 rounded-[14px] border px-5 py-5 md:px-6 md:py-6"
          :style="{ background: 'var(--bg-elevated)', borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
        >
          <header class="flex items-start justify-between gap-3">
            <div class="flex flex-col gap-1">
              <span class="eyebrow">Mapa de setores</span>
              <h3 class="text-[18px] font-medium leading-tight" :style="{ color: 'var(--text-heading)' }">Desempenho do dia</h3>
            </div>
            <NuxtLink
              to="/setor"
              class="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium transition-opacity hover:opacity-80"
              :style="{ color: 'var(--brand-text)' }"
            >
              Ver todos setores
              <UIcon name="i-lucide-arrow-right" class="size-3.5" />
            </NuxtLink>
          </header>

          <div
            v-if="sectorHeatmap.length"
            class="sectors-grid grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
          >
            <NuxtLink
              v-for="t in sectorHeatmap"
              :key="t.key"
              :to="`/setor/${t.key.toLowerCase().replace(/\s+/g, '-')}/comparativo`"
              class="sector-tile relative flex flex-col gap-2 rounded-[12px] border px-3 py-3 transition-opacity hover:opacity-90"
              :style="{ background: sectorTileStyle(t.changePct).background, borderColor: sectorTileStyle(t.changePct).borderColor }"
            >
              <UIcon
                :name="t.icon"
                class="size-4"
                :style="{ color: sectorTileStyle(t.changePct).accentColor }"
              />
              <div class="flex flex-col gap-0.5">
                <span class="truncate text-[12px] font-medium leading-tight" :style="{ color: 'var(--text-heading)' }">{{ t.label }}</span>
                <span
                  class="text-[13px] font-medium tabular-nums leading-none"
                  :style="{ color: sectorTileStyle(t.changePct).accentColor }"
                  translate="no"
                >{{ formatPctSigned(t.changePct) }}</span>
              </div>
            </NuxtLink>
          </div>
          <p v-else class="text-[12px]" :style="{ color: 'var(--text-muted)' }">
            Sem dados de setor ainda.
          </p>
        </article>

        <!-- RIGHT: Insights da Redentia -->
        <article
          class="insights-card flex flex-col gap-5 rounded-[14px] border px-5 py-5 md:px-6 md:py-6"
          :style="{ background: 'var(--bg-elevated)', borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
        >
          <header class="flex items-start justify-between gap-3">
            <div class="flex flex-col gap-1">
              <span class="eyebrow">Insights da Redent.IA</span>
              <h3 class="text-[18px] font-medium leading-tight" :style="{ color: 'var(--text-heading)' }">Fatores movendo carteiras</h3>
            </div>
          </header>

          <ul v-if="homeNarrativeLoading || !insightPills.length" class="flex flex-col gap-4">
            <li v-for="n in 3" :key="`ins-skel-${n}`" class="flex items-start gap-3">
              <span class="block size-11 shrink-0 rounded-full" :style="{ background: 'color-mix(in srgb, var(--text-heading) 5%, transparent)' }" />
              <div class="flex flex-1 flex-col gap-1.5">
                <span class="block h-3.5 rounded" :style="{ background: 'color-mix(in srgb, var(--text-heading) 6%, transparent)', width: '70%' }" />
                <span class="block h-3 rounded" :style="{ background: 'color-mix(in srgb, var(--text-heading) 6%, transparent)', width: '92%' }" />
              </div>
            </li>
          </ul>
          <ul v-else class="flex flex-col gap-4">
            <li
              v-for="ins in insightPills"
              :key="ins.key"
              class="flex items-start gap-3"
            >
              <span
                class="flex size-11 shrink-0 items-center justify-center rounded-full"
                :style="{ background: ins.iconBg }"
              >
                <UIcon :name="ins.icon" class="size-5" :style="{ color: ins.iconColor }" />
              </span>
              <div class="flex min-w-0 flex-1 flex-col gap-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h4 class="text-[14px] font-medium leading-tight" :style="{ color: 'var(--text-heading)' }">{{ ins.title }}</h4>
                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    :style="{
                      background: `color-mix(in srgb, ${ins.pillColorVar} 14%, transparent)`,
                      color: ins.pillColorVar,
                    }"
                  >{{ ins.pillLabel }}</span>
                </div>
                <p class="text-[12px] leading-snug" :style="{ color: 'var(--text-body)' }">
                  {{ ins.description }}
                </p>
              </div>
            </li>
          </ul>
        </article>
      </section>

      <!-- Crypto rankings — depois dos filtros inteligentes pra manter o
           ritmo: primeiro a grid do B3, depois atalhos, depois cripto,
           depois tesouro.

           Gate: tenants podem desativar o bloco via brand.features.showCrypto
           (Me Poupe! por exemplo nao quer cripto na home — fora do tom
           "TV pop magazine"). Default true mantem behavior atual. -->
      <!-- ============ TESOURO + NOTÍCIAS (row dupla compacta) ============
           Dois cards lado-a-lado: Tesouro Direto (esquerda, 3 mini-tabelas
           IPCA/SELIC/Prefixado) + Notícias do mercado (direita, top 4
           manchetes recentes). Substituem as 2 secoes full-width antigas. -->
      <section class="market-extra grid grid-cols-1 gap-4 px-4 md:grid-cols-2 md:px-0">
        <!-- LEFT: Tesouro Direto -->
        <article
          class="tesouro-card flex flex-col gap-5 rounded-[14px] border px-5 py-5 md:px-6 md:py-6"
          :style="{ background: 'var(--bg-elevated)', borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
        >
          <header class="flex items-start justify-between gap-3">
            <div class="flex flex-col gap-1">
              <span class="eyebrow">Renda fixa pública</span>
              <h3 class="text-[18px] font-medium leading-tight" :style="{ color: 'var(--text-heading)' }">Tesouro Direto</h3>
            </div>
            <NuxtLink
              to="/search?group=tesouro"
              class="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium transition-opacity hover:opacity-80"
              :style="{ color: 'var(--brand-text)' }"
            >
              Ver todos
              <UIcon name="i-lucide-arrow-right" class="size-3.5" />
            </NuxtLink>
          </header>

          <!-- Hero strip: destaque do IPCA+ com maior taxa, ancorando
               visualmente o topo do card antes das 3 sub-listas. -->
          <NuxtLink
            v-if="!tesouroLoading && tesouroHero"
            :to="`/tesouro/${tesouroHero.slug}`"
            class="tesouro-hero relative flex items-center justify-between gap-4 overflow-hidden rounded-[12px] border px-4 py-3.5 transition-opacity hover:opacity-90"
            :style="{
              background: `linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 8%, var(--bg-elevated)) 0%, color-mix(in srgb, var(--brand-primary) 2%, var(--bg-elevated)) 100%)`,
              borderColor: 'color-mix(in srgb, var(--brand-primary) 28%, transparent)',
            }"
          >
            <div class="flex flex-col gap-1">
              <span
                class="text-[10px] font-semibold uppercase tracking-[0.16em]"
                :style="{ color: 'var(--brand-primary)' }"
              >Maior taxa hoje</span>
              <div class="flex items-baseline gap-2">
                <span class="text-[15px] font-medium" :style="{ color: 'var(--text-heading)' }">{{ shortTesouroName(tesouroHero.name) }}</span>
                <span class="text-[11px]" :style="{ color: 'var(--text-muted)' }" translate="no">
                  Venc {{ formatTesouroMaturity(tesouroHero.maturity_date) }}
                </span>
              </div>
            </div>
            <div class="flex flex-col items-end gap-0.5 text-right">
              <span
                class="text-[20px] font-light tabular-nums leading-none"
                :style="{ color: 'var(--brand-primary)', letterSpacing: '-0.01em' }"
                translate="no"
              >{{ formatTesouroRate(tesouroHero) }}</span>
              <span class="text-[10px]" :style="{ color: 'var(--text-muted)' }">ao ano</span>
            </div>
          </NuxtLink>

          <!-- 3 sub-cards horizontais: IPCA / SELIC / Prefixado -->
          <div v-if="tesouroLoading" class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <div
              v-for="n in 3"
              :key="`tes-skel-${n}`"
              class="flex flex-col gap-2 rounded-[12px] border px-3.5 py-3"
              :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }"
            >
              <span class="block h-3 w-1/2 rounded" :style="{ background: 'color-mix(in srgb, var(--text-heading) 8%, transparent)' }" />
              <span v-for="m in 5" :key="m" class="block h-3 rounded" :style="{ background: 'color-mix(in srgb, var(--text-heading) 6%, transparent)' }" />
            </div>
          </div>
          <div v-else class="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
            <div
              v-for="g in tesouroGroups"
              :key="g.key"
              class="tesouro-group flex flex-col gap-3 rounded-[12px] border px-3.5 py-3.5"
              :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)' }"
            >
              <header class="flex items-center justify-between gap-2 border-b pb-2.5" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 20%, transparent)' }">
                <div class="flex items-center gap-2">
                  <span class="block size-1.5 rounded-full" :style="{ background: g.accent }" />
                  <span class="text-[13px] font-medium" :style="{ color: 'var(--text-heading)' }">{{ g.label }}</span>
                </div>
                <span
                  class="text-[10px]"
                  :style="{ color: 'var(--text-muted)' }"
                  translate="no"
                >{{ g.items.length }} {{ g.items.length === 1 ? 'título' : 'títulos' }}</span>
              </header>
              <ul v-if="g.items.length" class="flex flex-col gap-2.5">
                <li
                  v-for="it in g.items"
                  :key="it.slug"
                >
                  <NuxtLink
                    :to="`/tesouro/${it.slug}`"
                    class="flex items-center justify-between gap-2 transition-opacity hover:opacity-80"
                  >
                    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span
                        class="truncate text-[12px] font-medium leading-none"
                        :style="{ color: 'var(--text-heading)' }"
                      >{{ shortTesouroName(it.name) }}</span>
                      <span
                        v-if="it.maturity_date"
                        class="text-[10px] leading-none tabular-nums"
                        :style="{ color: 'var(--text-muted)' }"
                        translate="no"
                      >Venc {{ formatTesouroMaturity(it.maturity_date) }}</span>
                    </div>
                    <span
                      class="shrink-0 text-[12px] font-medium tabular-nums leading-none"
                      :style="{ color: g.accent }"
                      translate="no"
                    >{{ formatTesouroRate(it) }}</span>
                  </NuxtLink>
                </li>
              </ul>
              <p v-else class="text-[12px]" :style="{ color: 'var(--text-muted)' }">
                Sem títulos.
              </p>
            </div>
          </div>
        </article>

        <!-- RIGHT: Notícias do mercado (top 4) -->
        <article
          class="news-card card-soft-bg flex flex-col gap-5 rounded-[14px] border px-5 py-5 md:px-6 md:py-6"
          :style="{ background: 'var(--bg-elevated)', borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
        >
          <header class="flex items-start justify-between gap-3">
            <div class="flex flex-col gap-1">
              <span class="eyebrow">Notícias do mercado</span>
              <h3 class="text-[18px] font-medium leading-tight" :style="{ color: 'var(--text-heading)' }">Últimas 24h</h3>
            </div>
          </header>

          <ul v-if="homeNewsLoading" class="flex flex-col gap-4">
            <li v-for="n in 4" :key="`news-skel-${n}`" class="flex items-start gap-3">
              <span class="block size-10 shrink-0 rounded-full" :style="{ background: 'color-mix(in srgb, var(--text-heading) 5%, transparent)' }" />
              <div class="flex min-w-0 flex-1 flex-col gap-1.5">
                <span class="block h-3 rounded" :style="{ background: 'color-mix(in srgb, var(--text-heading) 6%, transparent)', width: '92%' }" />
                <span class="block h-3 rounded" :style="{ background: 'color-mix(in srgb, var(--text-heading) 6%, transparent)', width: '48%' }" />
              </div>
            </li>
          </ul>
          <ul v-else-if="recentHomeNews.length" class="flex flex-col gap-4">
            <li
              v-for="n in recentHomeNews"
              :key="n.id"
              class="flex items-start gap-3"
            >
              <a
                :href="n.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border"
                :style="{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-overlay)' }"
              >
                <img
                  v-if="n.image_url"
                  :src="n.image_url"
                  :alt="n.title"
                  class="size-full object-cover"
                  @error="$event.target.style.display='none'"
                />
                <UIcon
                  v-else
                  name="i-lucide-newspaper"
                  class="size-4"
                  :style="{ color: 'var(--text-muted)' }"
                />
              </a>
              <div class="flex min-w-0 flex-1 flex-col gap-1">
                <a
                  :href="n.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="line-clamp-2 text-[13px] leading-snug transition-opacity hover:opacity-80"
                  :style="{ color: 'var(--text-heading)' }"
                >{{ n.title }}</a>
                <p class="text-[11px]" :style="{ color: 'var(--text-muted)' }">
                  {{ relativeTimeShort(n.published_at) }} <span aria-hidden="true">·</span> {{ n.source }}
                </p>
              </div>
            </li>
          </ul>
          <p v-else class="text-[13px]" :style="{ color: 'var(--text-muted)' }">
            Sem notícias agora.
          </p>
        </article>
      </section>
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

    <!-- (NewsSection foi movido pra dentro do bento principal — agora vive
         lado-a-lado com Tesouro Direto no row "TESOURO + NOTÍCIAS",
         dentro da section .market-extra acima.) -->

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

    <!-- Seção Guias: Estudo em destaque + Em alta na Redentia
         Refatorado do bento (1 hero + 4 medium + 8 tiles) pra layout
         editorial 2-col: featured study (esquerda, dark com gradient +
         insight strip) + lista numerada (1-4) na direita. -->
    <section v-if="showSection('guides')" :style="{ order: sectionOrder('guides') }" class="px-4 pt-12 md:px-4">
      <header class="mb-6 flex flex-col gap-2 md:mb-8">
        <span class="eyebrow">Guias e estudos</span>
        <h2
          class="font-light leading-tight text-[28px] md:text-[36px]"
          :style="{ color: 'var(--text-heading)', letterSpacing: '-0.025em' }"
        >
          Aprenda do <em class="italic" :style="{ fontFamily: '\'Instrument Serif\', Georgia, serif', color: 'var(--brand-primary)' }">jeito Redentia.</em>
        </h2>
        <p class="text-[14px] leading-relaxed" :style="{ color: 'var(--text-body)' }">
          Estudos profundos, análises de ativos e ferramentas para tomar decisões com mais clareza.
        </p>
      </header>

      <div class="guides-row grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        <!-- LEFT COLUMN: Estudo em destaque (card escuro) + Insight da IA
             (pill claro abaixo). Wrapper de coluna pra manter os 2 cards
             empilhados na mesma coluna do grid. -->
        <div class="flex flex-col gap-4">
        <!-- Estudo em destaque (featured study, dark editorial) -->
        <NuxtLink
          :to="guidesHero[0].to"
          class="guide-featured group relative flex flex-col justify-between overflow-hidden rounded-[14px] border p-6 pb-16 transition-all duration-300 md:min-h-[460px] md:p-8 md:pb-20"
          :style="{
            background: `linear-gradient(135deg, #0F0B18 0%, #1A1423 60%, #0F0B18 100%)`,
            borderColor: 'color-mix(in srgb, var(--brand-primary) 18%, transparent)',
          }"
          :aria-label="`Ler ${guidesHero[0].titulo}`"
        >
          <!-- Ambient amber/purple radial glow -->
          <div
            class="pointer-events-none absolute inset-0 opacity-80"
            :style="{ background: `radial-gradient(ellipse at 78% 30%, color-mix(in srgb, var(--brand-primary) 22%, transparent), transparent 55%), radial-gradient(ellipse at 12% 85%, color-mix(in srgb, #7c3aed 14%, transparent), transparent 55%)` }"
            aria-hidden="true"
          />
          <!-- 3D-ish chart silhouette on the right (decorative SVG) -->
          <svg
            class="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 opacity-70 md:block"
            width="280" height="240" viewBox="0 0 280 240" fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="featGrad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--brand-primary)" stop-opacity="0.55"/>
                <stop offset="100%" stop-color="var(--brand-primary)" stop-opacity="0.05"/>
              </linearGradient>
              <linearGradient id="featGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.45"/>
                <stop offset="100%" stop-color="#7c3aed" stop-opacity="0.05"/>
              </linearGradient>
            </defs>
            <ellipse cx="170" cy="190" rx="100" ry="14" fill="color-mix(in srgb, var(--brand-primary) 12%, transparent)"/>
            <rect x="90" y="120" width="34" height="70" rx="3" fill="url(#featGrad2)" stroke="color-mix(in srgb, #7c3aed 50%, transparent)" stroke-width="0.5"/>
            <rect x="130" y="80" width="34" height="110" rx="3" fill="url(#featGrad1)" stroke="color-mix(in srgb, var(--brand-primary) 50%, transparent)" stroke-width="0.5"/>
            <rect x="170" y="40" width="34" height="150" rx="3" fill="url(#featGrad1)" stroke="color-mix(in srgb, var(--brand-primary) 65%, transparent)" stroke-width="0.5"/>
            <rect x="210" y="100" width="34" height="90" rx="3" fill="url(#featGrad2)" stroke="color-mix(in srgb, #7c3aed 50%, transparent)" stroke-width="0.5"/>
          </svg>

          <!-- Top: eyebrow + arrow icon -->
          <div class="relative flex items-start justify-between gap-4">
            <span
              class="text-[11px] font-semibold uppercase tracking-[0.18em]"
              :style="{ color: 'color-mix(in srgb, var(--brand-primary) 80%, white)' }"
              translate="no"
            >Estudo em destaque</span>
            <div
              class="flex size-9 items-center justify-center rounded-full transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              :style="{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.85)' }"
              aria-hidden="true"
            >
              <UIcon name="i-lucide-arrow-up-right" class="size-4" />
            </div>
          </div>

          <!-- Middle: category pill + title + description -->
          <div class="relative mt-6 flex max-w-[420px] flex-col gap-4 md:mt-0">
            <span
              class="self-start rounded-full border px-3 py-1 text-[11px] font-medium"
              :style="{
                borderColor: 'rgba(255,255,255,0.16)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.85)',
              }"
              translate="no"
            >{{ guidesHero[0].categoria }}</span>
            <h3
              class="font-light leading-[1.08] text-[26px] sm:text-[30px] md:text-[34px]"
              style="font-family: 'Instrument Serif', Georgia, serif; color: rgba(255,255,255,0.96); letter-spacing: -0.02em;"
            >
              {{ guidesHero[0].titulo }}
            </h3>
            <p
              class="text-[14px] leading-relaxed md:text-[15px]"
              :style="{ color: 'rgba(255,255,255,0.62)' }"
            >
              {{ guidesHero[0].descricao }}
            </p>
            <div class="flex items-center gap-3 text-[11px]" :style="{ color: 'rgba(255,255,255,0.5)' }">
              <span class="inline-flex items-center gap-1.5" translate="no">
                <UIcon name="i-lucide-clock" class="size-3" aria-hidden="true" />
                Leitura de {{ guidesHero[0].tempoLeitura }} min
              </span>
              <span aria-hidden="true">·</span>
              <span translate="no">Atualizado em 04 mai 2026</span>
            </div>
          </div>

        </NuxtLink>

        <!-- Insight da IA — pill claro, fora do card escuro (mesma coluna).
             margin-top negativo pra sobrepor o card escuro acima (efeito
             editorial de cartão flutuando sobre o hero). z-10 garante que
             o pill fique na frente da borda do card. -->
        <div
          class="guide-insight relative z-10 mx-auto -mt-[50px] flex w-max max-w-[80%] items-center gap-3 rounded-full border px-4 py-2.5 shadow-lg"
          :style="{ background: 'var(--bg-elevated)', borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
        >
          <div class="flex items-center gap-2 border-r pr-3" :style="{ borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }">
            <span
              class="flex size-6 shrink-0 items-center justify-center rounded-full"
              :style="{ background: 'color-mix(in srgb, var(--brand-primary) 14%, transparent)', color: 'var(--brand-primary)' }"
              aria-hidden="true"
            >
              <UIcon name="i-lucide-sparkles" class="size-3" />
            </span>
            <span class="text-[11px] font-semibold" :style="{ color: 'var(--text-heading)' }">Insight da IA</span>
          </div>
          <p class="text-[11px] leading-snug" :style="{ color: 'var(--text-body)' }">
            Carteiras mais diversificadas e com foco em qualidade tendem a se recuperar
            <span :style="{ color: 'var(--brand-primary)', fontWeight: 600 }">2,3×</span> mais rápido após crises.
          </p>
        </div>
        </div>

        <!-- RIGHT: Em alta na Redentia -->
        <article
          class="guides-trending flex flex-col gap-5 rounded-[14px] border px-5 py-5 md:px-6 md:py-6"
          :style="{ background: 'var(--bg-elevated)', borderColor: 'color-mix(in srgb, var(--brand-border) 30%, transparent)' }"
        >
          <header class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2">
              <span
                class="flex size-8 items-center justify-center rounded-md"
                :style="{ background: 'color-mix(in srgb, var(--brand-primary) 14%, transparent)', color: 'var(--brand-primary)' }"
                aria-hidden="true"
              >
                <UIcon name="i-lucide-trending-up" class="size-4" />
              </span>
              <h3 class="text-[16px] font-medium leading-tight" :style="{ color: 'var(--text-heading)' }">Em alta na Redentia</h3>
            </div>
            <NuxtLink
              to="/guias"
              class="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium transition-opacity hover:opacity-80"
              :style="{ color: 'var(--brand-text)' }"
            >
              Ver todos
              <UIcon name="i-lucide-arrow-right" class="size-3.5" />
            </NuxtLink>
          </header>

          <ul class="flex flex-col gap-4">
            <li
              v-for="(guide, idx) in guidesMedium.slice(0, 6)"
              :key="`trend-${guide.to}`"
              class="flex items-start gap-3"
            >
              <span
                class="flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                :style="{
                  background: 'var(--brand-primary)',
                  color: 'var(--text-on-primary)',
                }"
                aria-hidden="true"
              >{{ idx + 1 }}</span>
              <NuxtLink
                :to="guide.to"
                class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border transition-opacity hover:opacity-80"
                :style="{ borderColor: 'var(--border-subtle)', background: 'color-mix(in srgb, var(--brand-primary) 8%, var(--bg-overlay))', color: 'var(--brand-primary)' }"
                :aria-label="`Abrir ${guide.titulo}`"
              >
                <UIcon :name="guide.icon" class="size-5" />
              </NuxtLink>
              <div class="flex min-w-0 flex-1 flex-col gap-1">
                <NuxtLink
                  :to="guide.to"
                  class="line-clamp-2 text-[14px] font-medium leading-snug transition-opacity hover:opacity-80"
                  :style="{ color: 'var(--text-heading)' }"
                >{{ guide.titulo }}</NuxtLink>
                <p class="line-clamp-2 text-[12px] leading-snug" :style="{ color: 'var(--text-muted)' }">
                  {{ guide.descricao }}
                </p>
              </div>
              <div class="flex shrink-0 flex-col items-end gap-1">
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-medium"
                  :style="{
                    background: `color-mix(in srgb, var(--brand-primary) 12%, transparent)`,
                    color: 'var(--brand-text)',
                  }"
                  translate="no"
                >{{ guide.categoria }}</span>
                <span class="text-[11px]" :style="{ color: 'var(--text-muted)' }" translate="no">
                  {{ guide.tempoLeitura }} min de leitura
                </span>
              </div>
            </li>
          </ul>
        </article>
      </div>

    </section>

    <!-- ========== Premium Memos · Estudos editoriais profundos ==========
         Cards menores em grid abaixo da seção Guias. Diferenciados dos
         guias comuns por: (a) categoria "Premium Memo" no pill, (b) tint
         amber sutil no background, (c) Instrument Serif italic na palavra
         âncora do título, (d) header com eyebrow + subtitle editorial. -->
    <section v-if="showSection('guides')" :style="{ order: sectionOrder('guides') }" class="px-4 pt-12 md:px-4">
      <header class="mb-6 flex flex-col gap-2 md:mb-8">
        <span class="eyebrow">Estudos premium</span>
        <h2
          class="font-light leading-tight text-[24px] md:text-[30px]"
          :style="{ color: 'var(--text-heading)', letterSpacing: '-0.025em' }"
        >
          Memos editoriais para quem quer ir
          <em class="italic" :style="{ fontFamily: '\'Instrument Serif\', Georgia, serif', color: 'var(--brand-primary)' }">fundo.</em>
        </h2>
        <p class="text-[14px] leading-relaxed max-w-[640px]" :style="{ color: 'var(--text-body)' }">
          Análises densas com dados primários, precedentes históricos e perspectiva contraintuitiva. Cada memo é um mini-relatório de banco de investimento condensado.
        </p>
      </header>

      <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="memo in premiumMemos" :key="memo.to" class="contents">
          <NuxtLink
            :to="memo.to"
            class="memo-card group relative flex h-full flex-col gap-4 overflow-hidden rounded-[14px] border p-6 transition-all duration-300 hover:-translate-y-0.5"
            :style="{
              background: `linear-gradient(155deg, color-mix(in srgb, var(--brand-primary) 4%, var(--bg-elevated)) 0%, var(--bg-elevated) 65%)`,
              borderColor: 'color-mix(in srgb, var(--brand-primary) 22%, transparent)',
            }"
            :aria-label="`Ler memo: ${memo.titulo}`"
          >
            <!-- Subtle radial glow no canto superior direito -->
            <div
              class="pointer-events-none absolute inset-0 opacity-60"
              :style="{ background: `radial-gradient(ellipse at 100% 0%, color-mix(in srgb, var(--brand-primary) 10%, transparent), transparent 60%)` }"
              aria-hidden="true"
            />

            <!-- Top row: ícone + pill categoria + arrow -->
            <div class="relative flex items-start justify-between gap-2">
              <span
                class="flex size-10 shrink-0 items-center justify-center rounded-full"
                :style="{
                  background: 'color-mix(in srgb, var(--brand-primary) 14%, transparent)',
                  color: 'var(--brand-primary)',
                }"
                aria-hidden="true"
              >
                <UIcon :name="memo.icon" class="size-5" />
              </span>
              <div
                class="flex size-8 items-center justify-center rounded-full transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                :style="{
                  background: 'color-mix(in srgb, var(--text-heading) 6%, transparent)',
                  color: 'var(--text-muted)',
                }"
                aria-hidden="true"
              >
                <UIcon name="i-lucide-arrow-up-right" class="size-3.5" />
              </div>
            </div>

            <!-- Pill Premium Memo -->
            <span
              class="relative self-start rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
              :style="{
                borderColor: 'color-mix(in srgb, var(--brand-primary) 28%, transparent)',
                background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                color: 'var(--brand-primary)',
              }"
              translate="no"
            >Premium Memo</span>

            <!-- Título com Instrument Serif italic na palavra-âncora -->
            <h3
              class="relative font-light leading-[1.15] text-[18px] md:text-[20px]"
              :style="{ color: 'var(--text-heading)', letterSpacing: '-0.01em', fontFamily: '\'Instrument Serif\', Georgia, serif' }"
            >
              {{ memo.titulo }}
            </h3>

            <!-- Descrição curta -->
            <p
              class="relative line-clamp-3 text-[13px] leading-relaxed"
              :style="{ color: 'var(--text-body)' }"
            >
              {{ memo.descricao }}
            </p>

            <!-- Footer: tempo de leitura -->
            <div
              class="relative mt-auto flex items-center gap-2 border-t pt-3 text-[11px]"
              :style="{
                borderColor: 'color-mix(in srgb, var(--brand-border) 25%, transparent)',
                color: 'var(--text-muted)',
              }"
            >
              <UIcon name="i-lucide-clock" class="size-3" aria-hidden="true" />
              <span translate="no">{{ memo.tempoLeitura }} min de leitura</span>
              <span class="ml-auto text-[12px] font-medium transition-opacity group-hover:opacity-100" :style="{ color: 'var(--brand-primary)', opacity: 0.85 }">
                Ler estudo →
              </span>
            </div>
          </NuxtLink>
        </li>
      </ul>
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
import { useTesouroService, type TesouroItem } from '~/services/tesouro'
import { isPlaceholderLogo as isPlaceholderLogoUtil } from '~/utils/logo'

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
  getTopDividendYield,
} = useAssetsService()

// Driver narrative ("Mercado agora" card) — reusa o pesouPills do
// /para-voce. Lista 3-4 forças setoriais/macro que estão movendo o
// índice agora (gainers/losers + Brent + Dólar).
const { data: homeNarrative, loading: homeNarrativeLoading } = useHomeData()

// ============ TESOURO + NOTÍCIAS (row dupla compacta) ============
// Cards lado-a-lado abaixo de "Explorar o mercado". Substituem os
// componentes full-width antigos (LazyMoleculesTesouroSection +
// MoleculesNewsSection) — agora condensados em duas listas pequenas.
const { listTesouros } = useTesouroService()
const tesouroItems = ref<TesouroItem[]>([])
const tesouroLoading = ref(true)

interface HomeNewsArticle {
  id: number
  source: string
  url: string
  title: string
  image_url: string | null
  tickers: string[]
  published_at: string
}
const homeNewsArticles = ref<HomeNewsArticle[]>([])
const homeNewsLoading = ref(true)

onMounted(async () => {
  // Tesouro
  try {
    tesouroItems.value = await listTesouros()
  } catch {
    tesouroItems.value = []
  } finally {
    tesouroLoading.value = false
  }
  // News
  try {
    const runtimeCfg = useRuntimeConfig()
    const apiBase = runtimeCfg.public.apiBaseUrl as string
    const resp = await $fetch<{ data: HomeNewsArticle[] }>(`${apiBase}/news/latest`, {
      query: { limit: 10 },
    })
    homeNewsArticles.value = resp?.data ?? []
  } catch {
    homeNewsArticles.value = []
  } finally {
    homeNewsLoading.value = false
  }
})

// 3 grupos de tesouro (IPCA+, SELIC, Prefixado) com 5 items cada.
// 5 = sweet spot pra preencher a coluna sem ficar comprida demais e
// fica visualmente balanceada com o card de Notícias do lado.
const tesouroGroups = computed(() => {
  const all = tesouroItems.value ?? []
  const by = (frag: string) =>
    all.filter((i) => i.indexer?.toLowerCase().includes(frag.toLowerCase())).slice(0, 5)
  return [
    { key: 'IPCA', label: 'IPCA+', accent: 'var(--brand-primary)', items: by('ipca') },
    { key: 'SELIC', label: 'SELIC', accent: 'var(--brand-positive)', items: by('selic') },
    { key: 'PREFIXADO', label: 'Prefixado', accent: 'var(--brand-text)', items: by('prefixado') },
  ]
})

// Titulo destacado pro topo do card — pega o IPCA+ com maior taxa pra
// servir de "headline hero" que ancora visualmente.
const tesouroHero = computed(() => {
  const all = tesouroItems.value ?? []
  const ipcas = all.filter((i) => i.indexer?.toLowerCase().includes('ipca'))
  if (!ipcas.length) return null
  const sorted = [...ipcas].sort((a, b) => (b.rate_numeric ?? 0) - (a.rate_numeric ?? 0))
  return sorted[0]
})

function formatTesouroRate(item: TesouroItem): string {
  if (!item.rate) return '—'
  return (
    item.rate
      .replace('IPCA +', 'IPCA+')
      .replace('IGPM +', 'IGPM+')
      .replace(/SELIC\s*\+\s*/, 'SELIC+')
      .replace(/\s+/g, ' ') + '%'
  )
}
function shortTesouroName(raw: string): string {
  return raw
    .replace('Tesouro ', '')
    .replace(/\s+\|.*$/, '')
    .replace('com Juros Semestrais', 'JS')
}
function formatTesouroMaturity(iso: string | null): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' })
  } catch {
    return ''
  }
}

// News top 4 — sem agrupamento, ordem cronológica decrescente.
const recentHomeNews = computed(() => {
  const all = homeNewsArticles.value ?? []
  return [...all]
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 4)
})

function relativeTimeShort(iso: string): string {
  if (!iso) return ''
  const now = Date.now()
  const t = new Date(iso).getTime()
  if (!Number.isFinite(t)) return ''
  const diffMin = Math.max(1, Math.round((now - t) / 60000))
  if (diffMin < 60) return `${diffMin}min`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `${diffH}h`
  const diffD = Math.round(diffH / 24)
  return `${diffD}d`
}

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

// Categorias do novo bloco "Explorar o mercado" (5 lists × 5 categorias).
// Label "FIIs" em vez de "Reits" pra consistência com o vocabulário BR.
type ExploreCategory = 'stocks' | 'etfs' | 'reits' | 'bdrs' | 'crypto'
const exploreCategoriesList: { key: ExploreCategory; label: string }[] = [
  { key: 'stocks', label: 'Ações' },
  { key: 'etfs', label: 'ETFs' },
  { key: 'reits', label: 'FIIs' },
  { key: 'bdrs', label: 'BDRs' },
  { key: 'crypto', label: 'Criptomoedas' },
]
const selectedExploreCategory = ref<ExploreCategory>('stocks')

// Dividend yield carregado lazy por categoria pra não bloquear SSR.
// Stocks/ETFs/REITs têm endpoint próprio; BDRs e crypto não.
const dyByCategory = ref<Record<ExploreCategory, IAsset[]>>({
  stocks: [],
  etfs: [],
  reits: [],
  bdrs: [],
  crypto: [],
})
const dyLoading = ref<Record<ExploreCategory, boolean>>({
  stocks: false,
  etfs: false,
  reits: false,
  bdrs: false,
  crypto: false,
})

// ============ Crypto data (categoria nova) ============
// Endpoint /api/crypto retorna shape rico: symbol, name, image, price_brl,
// market_cap_brl, change_24h_pct, market_cap_dominance_pct, etc.
interface CryptoAsset {
  id: string
  symbol: string
  name: string
  image: string | null
  rank: number
  price_brl: number | null
  market_cap_brl: number | null
  volume_24h_brl: number | null
  change_24h_pct: number | null
  change_7d_pct: number | null
  market_cap_dominance_pct: number | null
}
const cryptoAssets = ref<CryptoAsset[]>([])
const cryptoLoading = ref(false)
async function loadCryptoAssets() {
  if (cryptoAssets.value.length || cryptoLoading.value) return
  cryptoLoading.value = true
  try {
    const runtimeCfg = useRuntimeConfig()
    const apiBase = runtimeCfg.public.apiBaseUrl as string
    const resp = await $fetch<{ data: CryptoAsset[] }>(`${apiBase}/crypto`, {
      query: { limit: 50 },
    })
    cryptoAssets.value = Array.isArray(resp?.data) ? resp.data : []
  } catch (err) {
    console.warn('[explore] crypto fetch failed', err)
    cryptoAssets.value = []
  } finally {
    cryptoLoading.value = false
  }
}
async function loadDividendYieldFor(cat: ExploreCategory) {
  if (cat === 'bdrs' || cat === 'crypto') return
  if (dyByCategory.value[cat].length || dyLoading.value[cat]) return
  dyLoading.value[cat] = true
  try {
    const typeMap: Partial<Record<ExploreCategory, 'STOCK' | 'ETF' | 'REIT'>> = {
      stocks: 'STOCK',
      etfs: 'ETF',
      reits: 'REIT',
    }
    const type = typeMap[cat]
    if (!type) return
    const items = await getTopDividendYield(type, 5)
    dyByCategory.value[cat] = Array.isArray(items) ? items : []
  } catch (err) {
    console.warn('[explore] DY fetch failed', cat, err)
  } finally {
    dyLoading.value[cat] = false
  }
}
watch(
  selectedExploreCategory,
  (cat) => {
    if (cat === 'crypto') loadCryptoAssets()
    else loadDividendYieldFor(cat)
  },
  { immediate: true }
)

// Helpers de formatação compacta para os mini-cards do "Explorar".
function formatCompactBRL(value: number | null | undefined): string {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return '—'
  if (n >= 1e12) return `R$ ${(n / 1e12).toFixed(2).replace('.', ',')} tri`
  if (n >= 1e9) return `R$ ${(n / 1e9).toFixed(2).replace('.', ',')} bi`
  if (n >= 1e6) return `R$ ${(n / 1e6).toFixed(2).replace('.', ',')} mi`
  if (n >= 1e3) return `R$ ${(n / 1e3).toFixed(0)} mil`
  return `R$ ${n.toFixed(2).replace('.', ',')}`
}
function formatPctSigned(value: number | null | undefined): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2).replace('.', ',')}%`
}
function pickTicker(asset: any): string {
  return (asset?.ticker || asset?.stock || '').toString().toUpperCase()
}
function pickChange(asset: any): number {
  return Number(asset?.change_percent ?? asset?.change ?? 0) || 0
}

// 5 listas pra categoria selecionada.
// - Ações/ETFs/FIIs/BDRs: derivadas de topAssets (rankings top+bottom dedupados)
//   + endpoint /rankings/top-dividend-yield pro card de DY.
// - Crypto: usa /api/crypto (snapshot rico com image, price_brl, mcap, etc).
interface ExploreItem {
  ticker: string
  logo?: string | null
  value: string
  colorVar?: string
  href: string
}
interface ExploreList {
  key: string
  title: string
  items: ExploreItem[]
}

// Logo pra um ativo. Ordem: campo logo explícito → brapi CDN fallback.
// Usa o util compartilhado isPlaceholderLogo pra detectar o placeholder
// genérico `icons.brapi.dev/icons/BRAPI.svg` que o backend devolve quando
// nao tem logo de verdade. Combinado com useFailedLogos no template
// (img.onerror -> markFailed) cobre tambem o caso de 404 do CDN.
const failedExploreLogos = useFailedLogos()
function assetLogoUrl(a: any): string | null {
  if (a?.logo && !isPlaceholderLogoUtil(a.logo)) return a.logo
  if (a?.scrape_logo && !isPlaceholderLogoUtil(a.scrape_logo)) return a.scrape_logo
  const t = pickTicker(a)
  if (t) return `https://icons.brapi.dev/icons/${t}.svg`
  return null
}

const exploreListsRaw = computed<ExploreList[]>(() => {
  const cat = selectedExploreCategory.value

  // ----- CRYPTO -----
  if (cat === 'crypto') {
    const all = cryptoAssets.value || []
    const withChange = all.filter((c) => c.change_24h_pct !== null)
    const gainers = [...withChange]
      .sort((a, b) => (b.change_24h_pct ?? 0) - (a.change_24h_pct ?? 0))
      .slice(0, 5)
    const losers = [...withChange]
      .sort((a, b) => (a.change_24h_pct ?? 0) - (b.change_24h_pct ?? 0))
      .slice(0, 5)
    const byMcap = [...all]
      .filter((c) => Number(c.market_cap_brl) > 0)
      .sort((a, b) => (b.market_cap_brl ?? 0) - (a.market_cap_brl ?? 0))
      .slice(0, 5)
    const byPrice = [...all]
      .filter((c) => Number(c.price_brl) > 0)
      .sort((a, b) => (b.price_brl ?? 0) - (a.price_brl ?? 0))
      .slice(0, 5)
    const byVolatility = [...withChange]
      .sort((a, b) => Math.abs(b.change_24h_pct ?? 0) - Math.abs(a.change_24h_pct ?? 0))
      .slice(0, 5)
    const mapCryptoItem = (c: CryptoAsset, valueField: 'change' | 'price' | 'mcap'): ExploreItem => {
      const ch = Number(c.change_24h_pct ?? 0)
      let value = '—'
      let colorVar: string | undefined
      if (valueField === 'change') {
        value = formatPctSigned(ch)
        colorVar = ch >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'
      } else if (valueField === 'price') {
        value = formatCompactBRL(Number(c.price_brl ?? 0))
      } else {
        value = formatCompactBRL(Number(c.market_cap_brl ?? 0))
      }
      return {
        ticker: c.symbol,
        logo: c.image,
        value,
        colorVar,
        href: `/crypto/${(c.id || c.symbol || '').toLowerCase()}`,
      }
    }
    return [
      { key: 'top', title: 'Maiores altas', items: gainers.map((c) => mapCryptoItem(c, 'change')) },
      { key: 'bottom', title: 'Maiores baixas', items: losers.map((c) => mapCryptoItem(c, 'change')) },
      { key: 'expensive', title: 'Mais caras', items: byPrice.map((c) => mapCryptoItem(c, 'price')) },
      { key: 'cap', title: 'Maior market cap', items: byMcap.map((c) => mapCryptoItem(c, 'mcap')) },
      { key: 'vol', title: 'Mais voláteis', items: byVolatility.map((c) => mapCryptoItem(c, 'change')) },
    ]
  }

  // ----- AÇÕES / ETFs / FIIs / BDRs -----
  const top = topAssets.value.top[cat] || []
  const bottom = topAssets.value.bottom[cat] || []
  const all = [...top, ...bottom]
  const dedupedByTicker = new Map<string, IAsset>()
  for (const a of all) {
    const k = pickTicker(a)
    if (k && !dedupedByTicker.has(k)) dedupedByTicker.set(k, a)
  }
  const unique = Array.from(dedupedByTicker.values())

  const mostVolatile = [...unique]
    .sort((a, b) => Math.abs(pickChange(b)) - Math.abs(pickChange(a)))
    .slice(0, 5)
  const mostExpensive = [...unique]
    .filter((a) => Number(a.market_price) > 0)
    .sort((a, b) => (Number(b.market_price) || 0) - (Number(a.market_price) || 0))
    .slice(0, 5)
  const dyItems = (dyByCategory.value[cat] || []).slice(0, 5)

  const mapAssetItem = (a: any, value: string, colorVar?: string): ExploreItem => {
    const ticker = pickTicker(a)
    return {
      ticker,
      logo: assetLogoUrl(a),
      value,
      colorVar,
      href: `/asset/${ticker.toLowerCase()}`,
    }
  }

  return [
    {
      key: 'top',
      title: 'Maiores altas',
      items: top.slice(0, 5).map((a) => mapAssetItem(a, formatPctSigned(pickChange(a)), 'var(--brand-positive)')),
    },
    {
      key: 'bottom',
      title: 'Maiores baixas',
      items: bottom.slice(0, 5).map((a) => mapAssetItem(a, formatPctSigned(pickChange(a)), 'var(--brand-negative)')),
    },
    {
      key: 'expensive',
      title: 'Mais caras',
      items: mostExpensive.map((a) => mapAssetItem(a, formatCompactBRL(Number(a.market_price) || 0))),
    },
    {
      key: 'dy',
      title: cat === 'bdrs' ? 'Mais voláteis (BDRs)' : 'Maior dividend yield',
      items:
        cat === 'bdrs'
          ? mostVolatile.map((a) =>
              mapAssetItem(
                a,
                formatPctSigned(pickChange(a)),
                pickChange(a) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'
              )
            )
          : dyItems.map((a: any) => {
              // Endpoint pode retornar DY em % (ex: 12.5) ou fração (0.125).
              const raw = Number(a.dividend_yield ?? 0)
              const pct = raw > 0 && raw <= 1 ? raw * 100 : raw
              return mapAssetItem(a, formatPctSigned(pct), 'var(--brand-positive)')
            }),
    },
    {
      key: 'vol',
      title: 'Mais voláteis',
      items: mostVolatile.map((a) =>
        mapAssetItem(
          a,
          formatPctSigned(pickChange(a)),
          pickChange(a) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'
        )
      ),
    },
  ]
})

// Filtra listas vazias — quando uma categoria não tem dados (ex: ETFs
// sem dividend yield no endpoint), o card simplesmente desaparece e o
// grid reflowa pras colunas restantes em vez de mostrar "Sem dados".
const exploreLists = computed<ExploreList[]>(() =>
  exploreListsRaw.value.filter((l) => l.items.length > 0)
)

// ============ MAPA DE SETORES (heatmap) + INSIGHTS DA REDENTIA ============
// Sector heatmap derivado dos topAssets (top+bottom de stocks+reits) agregado
// client-side: para cada setor, media simples do change_percent.
// Cards coloridos por intensidade (verde/vermelho), com nome PT e icone.

// Mapping EN→PT + icone lucide pra cada setor que o StatusInvest retorna.
// Quando o setor nao tem mapping, exibimos o nome cru e icone default.
const SECTOR_META: Record<string, { label: string; icon: string }> = {
  'Financial Services': { label: 'Financeiro', icon: 'i-lucide-landmark' },
  'Energy': { label: 'Petróleo e Gás', icon: 'i-lucide-fuel' },
  'Basic Materials': { label: 'Materiais Básicos', icon: 'i-lucide-hammer' },
  'Industrials': { label: 'Bens Industriais', icon: 'i-lucide-factory' },
  'Consumer Cyclical': { label: 'Consumo Cíclico', icon: 'i-lucide-shopping-bag' },
  'Consumer Defensive': { label: 'Consumo Defensivo', icon: 'i-lucide-shopping-cart' },
  'Utilities': { label: 'Utilities', icon: 'i-lucide-zap' },
  'Real Estate': { label: 'Imobiliário', icon: 'i-lucide-building' },
  'Healthcare': { label: 'Saúde', icon: 'i-lucide-heart-pulse' },
  'Technology': { label: 'Tecnologia', icon: 'i-lucide-cpu' },
  'Communication Services': { label: 'Comunicações', icon: 'i-lucide-radio' },
}
interface SectorTile {
  key: string
  label: string
  icon: string
  changePct: number
  tickerCount: number
}
const sectorHeatmap = computed<SectorTile[]>(() => {
  const buckets = new Map<string, { sum: number; count: number }>()
  const pools = [
    ...(topAssets.value.top.stocks || []),
    ...(topAssets.value.bottom.stocks || []),
    ...(topAssets.value.top.reits || []),
    ...(topAssets.value.bottom.reits || []),
  ]
  for (const a of pools) {
    const sector = (a as any)?.sector
    if (!sector || typeof sector !== 'string') continue
    const change = pickChange(a)
    if (!Number.isFinite(change)) continue
    const b = buckets.get(sector) || { sum: 0, count: 0 }
    b.sum += change
    b.count += 1
    buckets.set(sector, b)
  }
  const tiles: SectorTile[] = []
  for (const [key, { sum, count }] of buckets) {
    if (count < 1) continue
    const meta = SECTOR_META[key]
    tiles.push({
      key,
      label: meta?.label || key,
      icon: meta?.icon || 'i-lucide-circle',
      changePct: sum / count,
      tickerCount: count,
    })
  }
  // Ordena por magnitude do impacto (positivo ou negativo)
  return tiles.sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 12)
})

// Cor de fundo do tile baseada no sinal+intensidade do change.
// Usa color-mix pra modular opacidade conforme a magnitude do movimento.
function sectorTileStyle(change: number) {
  const abs = Math.min(Math.abs(change), 3) // satura em 3%
  const intensity = Math.round(8 + (abs / 3) * 18) // 8% a 26% mix
  const accent = change >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)'
  return {
    background: `color-mix(in srgb, ${accent} ${intensity}%, var(--bg-elevated))`,
    borderColor: `color-mix(in srgb, ${accent} ${Math.round(intensity * 1.5)}%, transparent)`,
    accentColor: accent,
  }
}

// Severity → label pill humano-amigável (Risco / Oportunidade / Tendência).
// Mapeia a magnitude + sinal do impact em vez do severity bruto.
interface InsightPill {
  key: string
  icon: string
  iconBg: string
  iconColor: string
  title: string
  description: string
  pillLabel: 'Risco' | 'Oportunidade' | 'Tendência'
  pillColorVar: string
}
const FACTOR_KEY_PALETTE: Record<string, { bg: string; color: string }> = {
  juros: { bg: 'color-mix(in srgb, #7c3aed 14%, transparent)', color: '#7c3aed' },
  petroleo: { bg: 'color-mix(in srgb, #d97706 14%, transparent)', color: '#d97706' },
  oil: { bg: 'color-mix(in srgb, #d97706 14%, transparent)', color: '#d97706' },
  dolar: { bg: 'color-mix(in srgb, var(--brand-primary) 14%, transparent)', color: 'var(--brand-primary)' },
  fx: { bg: 'color-mix(in srgb, var(--brand-primary) 14%, transparent)', color: 'var(--brand-primary)' },
  commodity: { bg: 'color-mix(in srgb, #b45309 14%, transparent)', color: '#b45309' },
  consumo: { bg: 'color-mix(in srgb, #7c3aed 14%, transparent)', color: '#7c3aed' },
  global: { bg: 'color-mix(in srgb, var(--brand-positive) 14%, transparent)', color: 'var(--brand-positive)' },
}
function buildInsightNarrative(f: any): string {
  const tickers = Array.isArray(f.tickers) ? f.tickers.slice(0, 3).join(', ') : ''
  const verb = (f.impact ?? 0) >= 0 ? 'sustentaram' : 'pressionaram'
  switch (f.key) {
    case 'petroleo':
      return `Ações expostas a petróleo ${verb} o índice${tickers ? ` — destaques: ${tickers}.` : '.'}`
    case 'dolar':
      return `Exportadoras e companhias com receita em dólar ${verb} o índice${tickers ? ` — destaques: ${tickers}.` : '.'}`
    case 'juros':
      return `Bancos, FIIs e ativos sensíveis a juros ${verb} o índice${tickers ? ` — destaques: ${tickers}.` : '.'}`
    case 'commodity':
      return `Mineradoras, papel e proteína animal ${verb} o índice${tickers ? ` — destaques: ${tickers}.` : '.'}`
    case 'global':
      return `BDRs e empresas internacionalizadas ${verb} o índice${tickers ? ` — destaques: ${tickers}.` : '.'}`
    case 'consumo':
      return `Varejo, alimentos e serviços de consumo doméstico ${verb} o índice${tickers ? ` — destaques: ${tickers}.` : '.'}`
    default:
      return `${f.label} ${verb} ${f.affectedCount ?? 0} ativos do índice${tickers ? ` — destaques: ${tickers}.` : '.'}`
  }
}
const insightPills = computed<InsightPill[]>(() => {
  const factors = homeNarrative.value?.causalFactors || []
  return factors.slice(0, 3).map((f: any) => {
    const palette = FACTOR_KEY_PALETTE[f.key] || { bg: 'color-mix(in srgb, var(--text-heading) 6%, transparent)', color: 'var(--text-body)' }
    let pillLabel: InsightPill['pillLabel'] = 'Tendência'
    let pillColorVar = 'var(--brand-primary)'
    if (f.severity === 'high' && (f.impact ?? 0) < 0) {
      pillLabel = 'Risco'
      pillColorVar = 'var(--brand-negative)'
    } else if ((f.impact ?? 0) > 0) {
      pillLabel = 'Oportunidade'
      pillColorVar = 'var(--brand-positive)'
    }
    return {
      key: f.key,
      icon: f.icon || 'i-lucide-trending-up',
      iconBg: palette.bg,
      iconColor: palette.color,
      title: f.label,
      description: buildInsightNarrative(f),
      pillLabel,
      pillColorVar,
    }
  })
})

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

// guidesHero: ESTUDO EM DESTAQUE (card grande dark). 1 item só.
// Rotação cascata: o novo guide (gerado pela skill /generate-redentia-guide
// ou /generate-premium-memo) entra aqui. O item antigo desce pra
// guidesMedium[0]. Cresce indefinidamente até hit max de guidesMedium (6),
// quando o último é removido.
const guidesHero: GuideEntry[] = [
  {
    titulo: 'Redent Score 0-100: a nota que faltava pra sua carteira',
    descricao: '60 milhões investem no Brasil em 2025 (ANBIMA), mas só 17% diversificam. O Redent Score mede 9 dimensões (Markowitz, Sharpe) e devolve uma nota objetiva: Crítica, Em Atenção, Boa ou Excelente.',
    to: '/guias/redent-score-0-100-explicado',
    icon: 'i-lucide-gauge',
    categoria: 'Guia Redentia',
    tempoLeitura: 14,
  },
]

const guidesMedium: GuideEntry[] = [
  {
    titulo: 'Open Finance: carteira espalhada?',
    descricao: 'Brasil tem 100M+ clientes no Open Finance em 2026. Consentimento regulado pelo BCB consolida sua carteira em 2 minutos, sem planilha, sem senha.',
    to: '/guias/open-finance-carteira-espalhada',
    icon: 'i-lucide-network',
    categoria: 'Guia Redentia',
    tempoLeitura: 13,
  },
  {
    titulo: 'Como investir em ações',
    descricao: 'Guia completo para iniciantes começarem a investir na bolsa de valores. Da abertura de conta até estratégias avançadas, com exemplos reais e passo a passo.',
    to: '/guias/como-investir-em-acoes-para-iniciantes',
    icon: 'i-lucide-trending-up',
    categoria: 'Ações',
    tempoLeitura: 8,
  },
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

// Premium Memos — estudos editoriais profundos publicados em /guias/<slug>.
// Cada item espelha o memo gerado pela skill /generate-premium-memo. Mantém
// a ordem cronológica reversa (mais recente primeiro). Quando um novo memo
// for publicado, adicionar no topo desse array.
const premiumMemos: GuideEntry[] = [
  {
    titulo: 'Poupança vs Tesouro IPCA+ 2026',
    descricao: 'Selic em 14,5%, IPCA+ paga 6,95% real e LCI/LCA pagam 13% isento. Por que o PF deixa metade do retorno na mesa.',
    to: '/guias/poupanca-vs-tesouro-ipca-mais-2026',
    icon: 'i-lucide-piggy-bank',
    categoria: 'Premium Memo',
    tempoLeitura: 14,
  },
  {
    titulo: 'Como ganhar 40-60% em renda fixa',
    descricao: 'Aconteceu 4 vezes em 25 anos. A janela abriu hoje. Os 3 pilares: ciclo, mecânica e execução em Tesouro IPCA+.',
    to: '/guias/como-ganhar-40-60-renda-fixa-2026',
    icon: 'i-lucide-trending-up',
    categoria: 'Premium Memo',
    tempoLeitura: 16,
  },
  {
    titulo: 'A hora certa de vender ações',
    descricao: 'Apenas 4% das ações geram todo o ganho. Buffett saiu 4 vezes em 60 anos e acertou. Os 5 gatilhos para vender.',
    to: '/guias/hora-certa-de-vender-acoes',
    icon: 'i-lucide-trending-down',
    categoria: 'Premium Memo',
    tempoLeitura: 15,
  },
  {
    titulo: 'Raio X da carteira em crise',
    descricao: 'Diversificação não é proteção. Em março de 2020, Ibov vs S&P 500 chegou a 0,91. Estrutura, correlação, liquidez.',
    to: '/guias/raio-x-da-carteira-em-crise',
    icon: 'i-lucide-shield-alert',
    categoria: 'Premium Memo',
    tempoLeitura: 12,
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

/* ========== EXPLORAR O MERCADO (tabs pill + 5 mini-listas) ========== */
.explore-tab {
  border-color: color-mix(in srgb, var(--brand-border) 30%, transparent);
  background: var(--bg-elevated);
  color: var(--text-body);
  cursor: pointer;
}
.explore-tab:hover {
  color: var(--text-heading);
  border-color: color-mix(in srgb, var(--brand-border) 50%, transparent);
}
.explore-tab--active {
  background: var(--bg-overlay);
  border-color: color-mix(in srgb, var(--brand-primary) 40%, var(--brand-border));
  color: var(--text-heading);
}
.explore-list-card { min-height: 240px; }

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

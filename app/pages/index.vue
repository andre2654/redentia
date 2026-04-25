<template>
  <NuxtLayout :name="layoutName" title="Visão geral">
    <div class="flex flex-col">
    <!-- Hero (10 variants) - extracted to standalone component for maintainability.
         Wrapped in ClientOnly so authStore.isAuthenticated won't cause SSR/client
         hydration mismatches when Pinia persisted state hydrates from localStorage
         only on the client. -->
    <ClientOnly>
      <HomeHero v-if="showSection('hero') && !authStore.isAuthenticated" :style="{ order: sectionOrder('hero') }" />
    </ClientOnly>


    <!-- Social Proof - Logos de corretoras -->
    <MoleculesTrustedBy v-if="showSection('trustBar') && !authStore.isAuthenticated" :style="{ order: sectionOrder('trustBar') }" class="mt-8" />

    <!-- Calculadora de Impacto / Poder do Tempo -->
    <MoleculesWealthProjection v-if="showSection('wealthCalculator') && brand.wealthCalculator && !authStore.isAuthenticated" :style="{ order: sectionOrder('wealthCalculator') }" />

    <!-- Personagens / Universo da marca -->
    <MoleculesCharacterShowcase v-if="showSection('characters') && brand.characters && !authStore.isAuthenticated" :style="{ order: sectionOrder('characters') }" />

    <!-- Checklist / Roteiro do Investidor -->
    <MoleculesInvestorChecklist v-if="showSection('investorChecklist') && brand.investorChecklist && !authStore.isAuthenticated" :style="{ order: sectionOrder('investorChecklist') }" />

    <!-- Seção de Mercado ao Vivo (Prioridade) -->
    <div v-if="showSection('market')" :style="{ order: sectionOrder('market') }" class="flex h-auto flex-col gap-4 pt-10">
      <div class="flex flex-col gap-8">
        <div class="flex flex-col gap-6 px-4 md:px-0">
          <!-- Terminal-style market status line -->
          <div class="flex flex-wrap items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.18em]" role="status" aria-live="polite">
            <span
              class="flex items-center gap-1.5"
              :style="{ color: marketStatus.color }"
            >
              <span
                class="relative flex size-1.5"
                aria-hidden="true"
              >
                <span
                  v-if="marketStatus.animate"
                  class="absolute inline-flex size-1.5 rounded-full opacity-75 motion-safe:animate-ping"
                  :style="{ backgroundColor: marketStatus.color }"
                />
                <span
                  class="relative inline-flex size-1.5 rounded-full"
                  :style="{ backgroundColor: marketStatus.color }"
                />
              </span>
              <span translate="no">{{ marketStatus.label }}</span>
            </span>
            <span :style="{ color: brand.colors.border }" aria-hidden="true">·</span>
            <span :style="{ color: brand.colors.textMuted }" translate="no">B3 · BOLSA BRASILEIRA</span>
            <span v-if="marketStatus.lastUpdate" :style="{ color: brand.colors.border }" aria-hidden="true">·</span>
            <span v-if="marketStatus.lastUpdate" :style="{ color: brand.colors.textMuted }" translate="no">
              UPDATE {{ marketStatus.lastUpdate }}
            </span>
          </div>

          <!-- Index readouts as terminal cells, mono, large, tabular -->
          <div class="flex flex-wrap gap-8 md:gap-12">
            <div class="flex flex-col gap-1">
              <span
                class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
                :style="{ color: brand.colors.primary }"
                translate="no"
              >
                IBOVESPA
              </span>
              <p
                class="font-mono-tab text-3xl font-bold tabular-nums sm:text-4xl md:text-5xl"
                :style="{ color: ibovVariationColor }"
                aria-label="Variação do IBOVESPA"
              >
                {{ ibovIndicator }}
              </p>
              <p class="font-mono-tab text-[11px] tabular-nums" :style="{ color: brand.colors.textMuted }" translate="no">
                {{ fmt.number(ibovLastPrice) }} PTS
              </p>
            </div>

            <div class="flex flex-col gap-1">
              <span
                class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
                :style="{ color: brand.colors.primary }"
                translate="no"
              >
                IFIX
              </span>
              <p
                class="font-mono-tab text-3xl font-bold tabular-nums sm:text-4xl md:text-5xl"
                :style="{ color: ifixVariationColor }"
                aria-label="Variação do IFIX"
              >
                {{ ifixIndicator }}
              </p>
              <p class="font-mono-tab text-[11px] tabular-nums" :style="{ color: brand.colors.textMuted }" translate="no">
                {{ fmt.number(ifixLastPrice) }} PTS
              </p>
            </div>
          </div>
        </div>

      </div>

      <div class="flex w-full flex-col">
        <div class="flex w-full items-end justify-between gap-4 px-4 pt-6 md:px-0">
          <div class="flex flex-col gap-1">
            <span
              class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
              :style="{ color: brand.colors.primary }"
              translate="no"
            >
              IBOV.CHART
            </span>
            <p
              class="font-mono-tab text-3xl font-bold tabular-nums md:text-4xl"
              :style="{ color: brand.colors.text }"
              aria-label="Cotação atual do IBOV"
              translate="no"
            >
              {{ fmt.brl(ibovLastPrice) }}
            </p>
          </div>
          <MoleculesPeriodSelector
            v-model="selectedTimeRange"
            :loading="loading"
          />
        </div>
        <AtomsGraphLine
          :data="ibovChartData"
          :legend="ibovChartLabel"
          :height="350"
          :loading="loading"
        />
      </div>

      <!-- Ticker Carousel com bordas sutis -->
      <div class="border-y py-4" :style="{ borderColor: brand.colors.border }">
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


      <div class="flex items-end justify-between gap-4 px-4 pt-8 md:px-0">
        <div class="flex flex-col gap-1">
          <span
            class="font-mono-tab text-[10px] uppercase tracking-[0.2em]"
            :style="{ color: brand.colors.primary }"
          >
            LIVE.MARKET
          </span>
          <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
            {{ brand.homeTexts.marketTitle }}
          </h2>
          <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
            &gt; {{ brand.homeTexts.marketSubtitle }}
          </p>
        </div>
        <!-- View toggle as terminal-style segmented control -->
        <div class="flex items-center gap-0 border font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ borderColor: brand.colors.border }" role="group" aria-label="Modo de visualização dos rankings">
          <button
            type="button"
            class="flex cursor-pointer items-center gap-1.5 px-3 py-2 transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
            :style="!showMap ? { backgroundColor: brand.colors.primary, color: brand.colors.background } : { color: brand.colors.textMuted }"
            :aria-pressed="!showMap"
            aria-label="Visualização em lista"
            @click="showMap = false"
          >
            <UIcon name="i-lucide-list" class="h-3 w-3" aria-hidden="true" />
            <span class="max-sm:hidden">LIST</span>
          </button>
          <button
            type="button"
            class="flex cursor-pointer items-center gap-1.5 border-l px-3 py-2 transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
            :style="showMap ? { backgroundColor: brand.colors.primary, color: brand.colors.background, borderColor: brand.colors.border } : { color: brand.colors.textMuted, borderColor: brand.colors.border }"
            :aria-pressed="showMap"
            aria-label="Visualização em mapa de calor"
            @click="showMap = true"
          >
            <UIcon name="i-lucide-grid-2x2" class="h-3 w-3" aria-hidden="true" />
            <span class="max-sm:hidden">MAP</span>
          </button>
        </div>
      </div>

      <div v-if="showMap" class="mb-6 flex flex-col">
        <div class="mx-auto mb-5 mt-6 flex items-center gap-1 rounded-lg p-1 max-md:mx-6" :style="{ borderColor: brand.colors.border, border: `1px solid ${brand.colors.border}`, backgroundColor: `${brand.colors.text}05` }" role="group" aria-label="Filtro do mapa de calor">
          <button
            type="button"
            class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
            :style="treemapFilter === 'all' ? { backgroundColor: `${brand.colors.text}15`, color: brand.colors.text } : { color: brand.colors.textMuted }"
            :aria-pressed="treemapFilter === 'all'"
            @click="treemapFilter = 'all'"
          >
            Todos
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
            :style="treemapFilter === 'positive' ? { backgroundColor: `${brand.colors.text}15`, color: brand.colors.text } : { color: brand.colors.textMuted }"
            :aria-pressed="treemapFilter === 'positive'"
            @click="treemapFilter = 'positive'"
          >
            Altas
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-[background-color,color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
            :style="treemapFilter === 'negative' ? { backgroundColor: `${brand.colors.text}15`, color: brand.colors.text } : { color: brand.colors.textMuted }"
            :aria-pressed="treemapFilter === 'negative'"
            @click="treemapFilter = 'negative'"
          >
            Baixas
          </button>
        </div>
        <AtomsGraphTreemap
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
            <!-- Header, terminal register style -->
            <div class="mb-3 flex items-center justify-between border-b pb-2" :style="{ borderColor: brand.colors.border }">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-trending-up" class="h-3 w-3" :style="{ color: brand.colors.positive }" aria-hidden="true" />
                <div class="flex flex-col">
                  <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.positive }" translate="no">
                    TOP {{ (item.key || '').toString().toUpperCase() }}
                  </span>
                  <h3 class="font-mono-tab text-[11px] font-semibold uppercase tracking-wider" :style="{ color: brand.colors.text }">{{ item.label }} / MAIORES ALTAS</h3>
                </div>
              </div>
              <NuxtLink
                :to="{ path: '/search', query: rankingLinkQueries.top[item.key] }"
                class="flex items-center gap-1 font-mono-tab text-[10px] uppercase tracking-[0.12em] transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                :style="{ color: brand.colors.textMuted }"
                :aria-label="`Ver todos ${item.label} em alta`"
              >
                <span aria-hidden="true">VER TUDO</span>
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
            <!-- Header, terminal register style -->
            <div class="mb-3 flex items-center justify-between border-b pb-2" :style="{ borderColor: brand.colors.border }">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-trending-down" class="h-3 w-3" :style="{ color: brand.colors.negative }" aria-hidden="true" />
                <div class="flex flex-col">
                  <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.negative }" translate="no">
                    BOT {{ (item.key || '').toString().toUpperCase() }}
                  </span>
                  <h3 class="font-mono-tab text-[11px] font-semibold uppercase tracking-wider" :style="{ color: brand.colors.text }">{{ item.label }} / MAIORES BAIXAS</h3>
                </div>
              </div>
              <NuxtLink
                :to="{ path: '/search', query: rankingLinkQueries.bottom[item.key] }"
                class="flex items-center gap-1 font-mono-tab text-[10px] uppercase tracking-[0.12em] transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                :style="{ color: brand.colors.textMuted }"
                :aria-label="`Ver todos ${item.label} em queda`"
              >
                <span aria-hidden="true">VER TUDO</span>
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
      <MoleculesCryptoRankings />

      <!-- Tesouro Direto — após rankings + filtros inteligentes -->
      <div class="px-4 md:px-0">
        <MoleculesTesouroSection />
      </div>
    </div>


    <!-- News Section — feed de notícias de mercado (apenas Redentia por enquanto) -->
    <MoleculesNewsSection v-if="showSection('news')" :style="{ order: sectionOrder('news') }" class="mt-6 px-4 md:px-0" />

    <!-- Metrics Section com contador gigante -->
    <MoleculesMetricsSection v-if="showSection('metrics') && !authStore.isAuthenticated" :style="{ order: sectionOrder('metrics') }" />

    <!-- Feature Tabs por perfil -->
    <MoleculesFeatureTabs v-if="showSection('featureTabs') && !authStore.isAuthenticated" :style="{ order: sectionOrder('featureTabs') }" class="mt-8" />

    <!-- Marquee de Tags em movimento -->
    <AtomsMarqueeFeatures v-if="showSection('marquee') && !authStore.isAuthenticated" :style="{ order: sectionOrder('marquee') }" />

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
                <h3 class="text-xl font-bold group-hover:text-secondary" :style="{ color: brand.colors.text }">{{ cat.label }}</h3>
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
              <h3 class="text-lg font-bold group-hover:text-secondary" :style="{ color: brand.colors.text }">{{ cat.label }}</h3>
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
    <section v-if="showSection('guides')" :style="{ order: sectionOrder('guides'), borderColor: brand.colors.border }" class="mt-12 border-t px-4 pt-12 md:px-0">
      <header class="mb-6 flex flex-col gap-1">
        <div class="flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.18em]">
          <span :style="{ color: brand.colors.primary }" translate="no">GUIDES.INDEX</span>
          <span aria-hidden="true" :style="{ color: brand.colors.border }">·</span>
          <span :style="{ color: brand.colors.textMuted }">{{ guidesHero.length + guidesMedium.length + guidesTiles.length }} ESTUDOS DISPONÍVEIS</span>
        </div>
        <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
          {{ brand.homeTexts.guidesTitle }}
        </h2>
        <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
          &gt; 1 ESTUDO EM DESTAQUE · 4 TRILHAS ATIVAS · FERRAMENTAS RÁPIDAS
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
          <!-- Grid texture -->
          <div
            class="pointer-events-none absolute inset-0 opacity-[0.05]"
            :style="{ backgroundImage: `linear-gradient(${brand.colors.text} 1px, transparent 1px), linear-gradient(90deg, ${brand.colors.text} 1px, transparent 1px)`, backgroundSize: '48px 48px' }"
            aria-hidden="true"
          />

          <!-- Top row: kicker + arrow -->
          <div class="relative flex items-start justify-between gap-4">
            <span
              class="inline-flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.18em]"
              :style="{ color: brand.colors.primary }"
              translate="no"
            >
              ESTUDO.DESTAQUE · {{ guidesHero[0].categoria.toUpperCase() }}
            </span>
            <div
              class="flex size-10 items-center justify-center rounded-full transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-300 group-hover:translate-x-1 group-hover:translate-y-[-1px]"
              :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
              aria-hidden="true"
            >
              <UIcon name="i-lucide-arrow-up-right" class="size-5" />
            </div>
          </div>

          <!-- Middle: icon + title + description -->
          <div class="relative flex flex-col gap-5">
            <div
              class="flex size-16 items-center justify-center rounded-2xl md:size-20"
              :style="{ backgroundColor: `${brand.colors.primary}1A`, color: brand.colors.primary }"
              aria-hidden="true"
            >
              <UIcon :name="guidesHero[0].icon" class="size-8 md:size-10" />
            </div>
            <div class="flex flex-col gap-3">
              <h3
                class="text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl"
                :style="{ color: brand.colors.text }"
              >
                {{ guidesHero[0].titulo }}
              </h3>
              <p
                class="max-w-xl text-sm leading-relaxed md:text-base"
                :style="{ color: `${brand.colors.text}B3` }"
              >
                {{ guidesHero[0].descricao }}
              </p>
            </div>
          </div>

          <!-- Bottom metadata -->
          <div class="relative flex items-center gap-4 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">
            <span class="inline-flex items-center gap-1.5" translate="no">
              <UIcon name="i-lucide-clock" class="size-3" aria-hidden="true" />
              {{ guidesHero[0].tempoLeitura }}&nbsp;MIN LEITURA
            </span>
            <span aria-hidden="true">·</span>
            <span translate="no">ATUALIZADO 04&nbsp;JAN&nbsp;2026</span>
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
            class="line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-secondary"
            :style="{ color: brand.colors.text }"
          >
            {{ guide.titulo }}
          </h3>

          <div class="flex items-center justify-between gap-2 font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
            <span translate="no">{{ guide.categoria.toUpperCase() }}</span>
            <span class="inline-flex items-center gap-1" translate="no">
              {{ guide.tempoLeitura }}&nbsp;MIN
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
              class="line-clamp-1 text-xs font-semibold leading-snug transition-colors group-hover:text-secondary"
              :style="{ color: brand.colors.text }"
            >
              {{ guide.titulo }}
            </h4>
            <span
              class="font-mono-tab text-[9px] uppercase tracking-[0.12em]"
              :style="{ color: brand.colors.textMuted }"
              translate="no"
            >
              {{ guide.tempoLeitura }}&nbsp;MIN · {{ guide.categoria.toUpperCase() }}
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

      <!-- CTA: ver todos -->
      <div class="mt-6 flex justify-center">
        <NuxtLink
          to="/guias"
          class="group inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-mono-tab text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          :style="{
            borderColor: brand.colors.border,
            color: brand.colors.text,
            backgroundColor: brand.colors.surface,
          }"
        >
          <UIcon name="i-lucide-book-open" class="size-3.5" aria-hidden="true" />
          <span>Ver todos os guias</span>
          <UIcon
            name="i-lucide-arrow-right"
            class="size-3.5 transition-transform group-hover:translate-x-0.5"
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

const chatSuggestions = [
  'Qual a diferença entre ações e FIIs?',
  'Como funcionam os dividendos?',
  'O que é diversificação?',
  'Quanto devo investir por mês?',
  'Como escolher boas ações?',
  'Vale a pena investir em ETFs?',
]

const tickerCarouselItems = computed(() =>
  topAssets.value.top.stocks.slice(0, 40).map((asset) => ({
    logo: asset.logo || '/default-logo.png',
    ticker: asset.ticker,
    change: `${coerceNumber(asset.change_percent ?? asset.change).toFixed(2)}%`,
  }))
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

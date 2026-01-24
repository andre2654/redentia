<template>
  <NuxtLayout :name="layoutName" title="Visão geral">
    <h1 class="sr-only">
      Redentia: invista em ações e fundos imobiliários com IA
    </h1>
    <!-- Hero Section -->
    <section v-if="!authStore.isAuthenticated" class="relative overflow-hidden">
      <!-- Background effects -->
      <div class="pointer-events-none absolute inset-0">
        <div class="from-secondary/30 absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b to-transparent blur-3xl" />
        <div class="bg-secondary/20 absolute left-1/4 top-20 h-64 w-64 rounded-full blur-3xl" />
        <div class="absolute right-1/4 top-32 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div class="relative px-6 py-16 text-center md:py-20">
        <!-- Announcement badge -->
        <div class="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
          <span class="flex h-2 w-2">
            <span class="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75" />
            <span class="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span class="text-sm text-white/80">Novo: Assessoria com IA agora disponível</span>
          <UIcon name="i-lucide-arrow-right" class="h-3 w-3 text-white/50" />
        </div>

        <!-- Logo -->
        <IconLogoFull class="mx-auto mb-8 h-10 fill-white md:h-14" />

        <!-- Headline -->
        <h2 class="mx-auto mb-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
          Invista com inteligência.
          <span class="bg-gradient-to-r from-secondary to-blue-400 bg-clip-text text-transparent">
            Resultados reais.
          </span>
        </h2>

        <!-- Subtitle -->
        <p class="mx-auto mb-10 max-w-xl text-base text-white/60 md:text-lg">
          Análises fundamentalistas, calculadoras financeiras e assessoria com IA.
          <span class="font-medium text-white/80">Tudo 100% gratuito.</span>
        </p>

        <!-- CTAs -->
        <div class="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <UButton
            to="/auth/register"
            color="secondary"
            size="xl"
            icon="i-lucide-sparkles"
            class="group w-full px-8 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-secondary/25 sm:w-auto"
          >
            Começar Agora
            <template #trailing>
              <UIcon name="i-lucide-arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </template>
          </UButton>
          <UButton
            to="/auth/login"
            color="white"
            variant="ghost"
            size="xl"
            class="w-full text-white/70 transition-all hover:bg-white/10 hover:text-white sm:w-auto"
          >
            Já tenho conta
          </UButton>
        </div>

        <!-- Trust indicators -->
        <div class="mt-12 flex flex-col items-center gap-6">
          <div class="flex items-center gap-8 text-sm text-white/50">
            <div class="flex items-center gap-2">
              <div class="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                <UIcon name="i-lucide-shield-check" class="h-3 w-3 text-green-400" />
              </div>
              <span>Criptografado</span>
            </div>
            <div class="hidden h-4 w-px bg-white/20 sm:block" />
            <div class="flex items-center gap-2">
              <div class="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/20">
                <UIcon name="i-lucide-zap" class="h-3 w-3 text-secondary" />
              </div>
              <span>Sempre grátis</span>
            </div>
            <div class="hidden h-4 w-px bg-white/20 sm:block" />
            <div class="flex items-center gap-2">
              <div class="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20">
                <UIcon name="i-lucide-credit-card" class="h-3 w-3 text-purple-400" />
              </div>
              <span>Sem cartão</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Social Proof - Logos de corretoras -->
    <MoleculesTrustedBy v-if="!authStore.isAuthenticated" class="mt-8" />

    <!-- Seção de Mercado ao Vivo (Prioridade) -->
    <div class="flex h-auto flex-col gap-4 pt-6">
      <div class="flex flex-col gap-8">
        <div class="flex flex-col gap-4 px-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span
                class="h-2 w-2 animate-pulse rounded-full bg-green-400 shadow-lg shadow-green-500/50 md:h-3 md:w-3"
              />
              <span
                class="text-xs font-medium uppercase tracking-wider text-green-400 md:text-sm"
                >Ao Vivo</span
              >
              <span class="text-xs text-gray-500">
                • Atualizado agora
              </span>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="flex flex-col gap-2">
              <h3
                class="font-regular mb-1 flex items-center gap-2 text-xl text-white md:mb-2 md:text-2xl"
              >
                IBOVESPA
              </h3>
              <p
                class="mb-1 text-3xl font-semibold tabular-nums text-white sm:text-4xl md:text-5xl"
              >
                {{ ibovIndicator }}
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <h3
                class="font-regular mb-1 flex items-center gap-2 text-xl text-white md:mb-2 md:text-2xl"
              >
                IFIX
              </h3>
              <p
                class="mb-1 text-3xl font-semibold tabular-nums text-white sm:text-4xl md:text-5xl"
              >
                {{ ifixIndicator }}
              </p>
            </div>
          </div>
        </div>

        <MoleculesSearchAssets
          class="w-full rounded-none bg-white/10 py-4 md:rounded-full"
        />
      </div>

      <div class="flex w-full flex-col">
        <div class="flex w-full items-center justify-between p-6 pb-0">
          <div class="flex flex-col gap-4">
            <h2 class="text-[30px] font-semibold">
              {{
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(ibovLastPrice)
              }}
            </h2>
            <p class="mb-4 opacity-70">Cotação do IBOV</p>
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
      <div class="border-y border-white/10 py-4">
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

      <div class="flex flex-col px-6">
        <h2 class="text-[18px] font-bold">O mercado em tempo real</h2>
        <p class="text-[13px] font-extralight">
          Altas, baixas e oportunidades. Atualização instantânea.
        </p>
        <button
          type="button"
          class="mt-3 flex max-w-fit cursor-pointer items-center gap-3 rounded-full border px-4 py-2.5 transition-all duration-200"
          :class="[
            showMap
              ? 'border-secondary/50 bg-secondary/10 hover:bg-secondary/20'
              : 'border-white/10 bg-white/5 hover:bg-white/10',
          ]"
          @click="showMap = !showMap"
        >
          <UIcon
            name="i-lucide-map"
            class="h-4 w-4"
            :class="showMap ? 'text-secondary' : 'text-white/60'"
          />
          <span
            class="select-none text-sm font-medium"
            :class="showMap ? 'text-secondary' : 'text-white/70'"
          >
            Mostrar mapa
          </span>
          <div
            class="relative h-5 w-9 rounded-full transition-colors duration-200"
            :class="showMap ? 'bg-secondary' : 'bg-gray-600'"
          >
            <div
              class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200"
              :class="showMap ? 'translate-x-4' : 'translate-x-0.5'"
            />
          </div>
        </button>
      </div>

      <div v-if="showMap" class="mb-6 flex flex-col">
        <UButtonGroup
          orientation="horizontal"
          variant="soft"
          class="mx-auto mb-5 mt-6 max-md:px-6"
        >
          <UButton
            color="neutral"
            :variant="treemapFilter === 'all' ? 'soft' : 'link'"
            label="Todos"
            @click="treemapFilter = 'all'"
          />
          <UButton
            color="neutral"
            :variant="treemapFilter === 'positive' ? 'soft' : 'link'"
            label="Altas"
            @click="treemapFilter = 'positive'"
          />
          <UButton
            color="neutral"
            :variant="treemapFilter === 'negative' ? 'soft' : 'link'"
            label="Baixas"
            @click="treemapFilter = 'negative'"
          />
        </UButtonGroup>
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
          <div class="flex w-full flex-col gap-2 px-2 py-4">
            <!-- Header -->
            <div class="mb-2 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-trending-up" class="h-5 w-5 text-emerald-400" />
                <div>
                  <h2 class="text-base font-bold text-white">{{ item.label }}</h2>
                  <p class="text-xs text-white/50">Maiores altas</p>
                </div>
              </div>
              <NuxtLink
                :to="{ path: '/search', query: rankingLinkQueries.top[item.key] }"
                class="flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white"
              >
                Ver todos
                <UIcon name="i-lucide-arrow-right" class="h-4 w-4" />
              </NuxtLink>
            </div>
            <!-- Lista -->
            <div class="flex flex-col divide-y divide-white/5">
              <AtomsTickerListItem
                v-for="stock in topAssets.top[item.key]"
                :key="stock?.ticker"
                :stock="stock"
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
          <div class="flex w-full flex-col gap-2 px-2 py-4">
            <!-- Header -->
            <div class="mb-2 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-trending-down" class="h-5 w-5 text-red-400" />
                <div>
                  <h2 class="text-base font-bold text-white">{{ item.label }}</h2>
                  <p class="text-xs text-white/50">Maiores baixas</p>
                </div>
              </div>
              <NuxtLink
                :to="{ path: '/search', query: rankingLinkQueries.bottom[item.key] }"
                class="flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white"
              >
                Ver todos
                <UIcon name="i-lucide-arrow-right" class="h-4 w-4" />
              </NuxtLink>
            </div>
            <!-- Lista -->
            <div class="flex flex-col divide-y divide-white/5">
              <AtomsTickerListItem
                v-for="stock in topAssets.bottom[item.key]"
                :key="stock?.ticker"
                :stock="stock"
              />
            </div>
          </div>
        </UCarousel>
      </template>

      <!-- Filtros Inteligentes -->
      <div class="flex flex-col gap-4 px-6 py-6">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-sparkles" class="h-5 w-5 text-emerald-400" />
          <h2 class="text-lg font-semibold text-white">Filtros inteligentes</h2>
        </div>
        <div class="flex flex-wrap gap-2">
          <NuxtLink
            :to="{ path: '/search', query: { p_max: 20 } }"
            class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-white"
          >
            Preço até R$ 20
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { mc_max: 2000000000 } }"
            class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-white"
          >
            Small Caps (MC ≤ R$ 2 bi)
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { ch_min: 0 } }"
            class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-white"
          >
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-trending-up" class="h-3.5 w-3.5 text-emerald-400" />
              Alta no dia
            </span>
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { ch_max: 0 } }"
            class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-white"
          >
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-trending-down" class="h-3.5 w-3.5 text-red-400" />
              Queda no dia
            </span>
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { stock: 0, bdr: 0 } }"
            class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-all hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-white"
          >
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-building-2" class="h-3.5 w-3.5 text-blue-400" />
              Somente FIIs
            </span>
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { stock: 0, reit: 0 } }"
            class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-all hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-white"
          >
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-globe" class="h-3.5 w-3.5 text-purple-400" />
              Somente BDRs
            </span>
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { p_min: 10, p_max: 50 } }"
            class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-white"
          >
            Preço R$ 10 - R$ 50
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { dy_min: 6 } }"
            class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-all hover:border-yellow-500/50 hover:bg-yellow-500/10 hover:text-white"
          >
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-coins" class="h-3.5 w-3.5 text-yellow-400" />
              DY acima de 6%
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>


    <!-- Metrics Section com contador gigante -->
    <MoleculesMetricsSection v-if="!authStore.isAuthenticated" />

    <!-- Feature Tabs por perfil -->
    <MoleculesFeatureTabs v-if="!authStore.isAuthenticated" class="mt-8" />

    <!-- Marquee de Tags em movimento -->
    <AtomsMarqueeFeatures v-if="!authStore.isAuthenticated" />

    <!-- Seção Invista por Categoria -->
    <section class="mt-12 border-t border-white/10 px-6 pt-12">
      <div class="flex flex-col gap-6">
        <div class="text-center">
          <p class="mb-2 text-xs uppercase tracking-[0.2em] text-gray-500">
            Explore por categoria
          </p>
          <h2 class="mb-2 text-2xl font-bold md:text-3xl">
            Encontre seu próximo investimento
          </h2>
          <p class="text-sm text-gray-400 md:text-base">
            Tudo que você precisa. Nada que você não precisa.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Ações -->
          <NuxtLink
            to="/acoes"
            class="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-secondary/50 hover:bg-secondary/10"
          >
            <div class="flex items-center gap-3">
              <div class="rounded-full bg-secondary/20 p-3">
                <UIcon name="i-lucide-trending-up" class="text-secondary h-6 w-6" />
              </div>
              <h3 class="text-xl font-bold group-hover:text-secondary">Ações</h3>
            </div>
            <p class="text-sm text-gray-400">
              Invista nas maiores empresas do Brasil. Potencial de crescimento e
              dividendos.
            </p>
            <div class="flex items-center gap-2 text-secondary text-sm font-medium">
              <span>Explorar ações</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </div>
          </NuxtLink>

          <!-- FIIs -->
          <NuxtLink
            to="/fiis"
            class="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-secondary/50 hover:bg-secondary/10"
          >
            <div class="flex items-center gap-3">
              <div class="rounded-full bg-secondary/20 p-3">
                <UIcon name="i-lucide-building-2" class="text-secondary h-6 w-6" />
              </div>
              <h3 class="text-xl font-bold group-hover:text-secondary">FIIs</h3>
            </div>
            <p class="text-sm text-gray-400">
              Renda passiva mensal com fundos imobiliários. Dividendos isentos de
              IR.
            </p>
            <div class="flex items-center gap-2 text-secondary text-sm font-medium">
              <span>Explorar FIIs</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </div>
          </NuxtLink>

          <!-- ETFs -->
          <NuxtLink
            to="/etfs"
            class="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-secondary/50 hover:bg-secondary/10"
          >
            <div class="flex items-center gap-3">
              <div class="rounded-full bg-secondary/20 p-3">
                <UIcon name="i-lucide-bar-chart-3" class="text-secondary h-6 w-6" />
              </div>
              <h3 class="text-xl font-bold group-hover:text-secondary">ETFs</h3>
            </div>
            <p class="text-sm text-gray-400">
              Diversificação instantânea. Invista no Ibovespa e S&P 500 com um
              clique.
            </p>
            <div class="flex items-center gap-2 text-secondary text-sm font-medium">
              <span>Explorar ETFs</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </div>
          </NuxtLink>

          <!-- Small Caps -->
          <NuxtLink
            to="/small-caps"
            class="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-secondary/50 hover:bg-secondary/10"
          >
            <div class="flex items-center gap-3">
              <div class="rounded-full bg-secondary/20 p-3">
                <UIcon name="i-lucide-rocket" class="text-secondary h-6 w-6" />
              </div>
              <h3 class="text-xl font-bold group-hover:text-secondary">
                Small Caps
              </h3>
            </div>
            <p class="text-sm text-gray-400">
              Empresas pequenas com alto potencial de crescimento. Risco maior,
              retorno maior.
            </p>
            <div class="flex items-center gap-2 text-secondary text-sm font-medium">
              <span>Explorar small caps</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </div>
          </NuxtLink>

          <!-- Dividendos -->
          <NuxtLink
            to="/dividendos"
            class="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-secondary/50 hover:bg-secondary/10"
          >
            <div class="flex items-center gap-3">
              <div class="rounded-full bg-secondary/20 p-3">
                <UIcon name="i-lucide-coins" class="text-secondary h-6 w-6" />
              </div>
              <h3 class="text-xl font-bold group-hover:text-secondary">
                Dividendos
              </h3>
            </div>
            <p class="text-sm text-gray-400">
              Construa renda passiva mensal. Descubra os melhores pagadores de
              dividendos.
            </p>
            <div class="flex items-center gap-2 text-secondary text-sm font-medium">
              <span>Explorar dividendos</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </div>
          </NuxtLink>

          <!-- BDRs -->
          <NuxtLink
            to="/search?group=bdrs"
            class="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-secondary/50 hover:bg-secondary/10"
          >
            <div class="flex items-center gap-3">
              <div class="rounded-full bg-secondary/20 p-3">
                <UIcon name="i-lucide-globe" class="text-secondary h-6 w-6" />
              </div>
              <h3 class="text-xl font-bold group-hover:text-secondary">BDRs</h3>
            </div>
            <p class="text-sm text-gray-400">
              Invista em empresas estrangeiras (Apple, Google, Amazon) em reais.
            </p>
            <div class="flex items-center gap-2 text-secondary text-sm font-medium">
              <span>Explorar BDRs</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Seção Blog / Guias Educacionais -->
    <section class="mt-12 border-t border-white/10 px-6 pt-12">
      <div class="flex flex-col gap-8">
        <div class="text-center">
          <div class="mb-3 flex items-center justify-center gap-2">
            <UIcon name="i-lucide-newspaper" class="text-secondary h-6 w-6" />
          </div>
          <h2 class="mb-2 text-2xl font-bold md:text-3xl">
            Conhecimento que gera resultados
          </h2>
          <p class="text-sm text-gray-400 md:text-base">
            Guias práticos, análises e estratégias. Aprenda em minutos.
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <MoleculesBlogCard
            titulo="Como Investir em Ações"
            descricao="Guia completo para iniciantes começarem a investir na bolsa de valores. Aprenda desde a abertura de conta até estratégias avançadas de investimento."
            to="/guias/como-investir-em-acoes-para-iniciantes"
            icon="i-lucide-trending-up"
            categoria="Ações"
            data="4 Jan 2026"
            :tempo-leitura="8"
          />

          <MoleculesBlogCard
            titulo="Melhores FIIs 2026"
            descricao="Fundos imobiliários mais promissores para este ano. Análise completa de segmentos, indicadores e estratégias para construir sua carteira ideal."
            to="/guias/melhores-fiis-para-investir-em-2026"
            icon="i-lucide-building-2"
            categoria="FIIs"
            data="4 Jan 2026"
            :tempo-leitura="10"
          />

          <MoleculesBlogCard
            titulo="Calculadora de Dividendos"
            descricao="Aprenda a calcular quanto investir para atingir sua meta de renda passiva. Fórmulas, exemplos práticos e estratégias de reinvestimento."
            to="/guias/calculadora-de-dividendos"
            icon="i-lucide-coins"
            categoria="Dividendos"
            data="4 Jan 2026"
            :tempo-leitura="7"
          />

          <MoleculesBlogCard
            titulo="Análise PETR4"
            descricao="Vale a pena investir em Petrobras? Análise fundamentalista completa com riscos, oportunidades e perspectivas para 2026."
            to="/guias/analise-petr4-vale-a-pena-investir"
            icon="i-lucide-chart-line"
            categoria="Análises"
            data="4 Jan 2026"
            :tempo-leitura="12"
          />

          <MoleculesBlogCard
            titulo="Small Caps: Guia Completo"
            descricao="Tudo sobre ações de pequenas empresas: como escolher, riscos envolvidos e estratégias para maximizar retornos com small caps."
            to="/guias/small-caps-guia-completo"
            icon="i-lucide-rocket"
            categoria="Ações"
            data="4 Jan 2026"
            :tempo-leitura="9"
          />

          <MoleculesBlogCard
            titulo="Calculadora de Juros Compostos"
            descricao="Simule quanto seus investimentos renderão com juros compostos. Ferramenta gratuita com gráficos e projeções detalhadas."
            to="/calculadora/juros-compostos"
            icon="i-lucide-trending-up"
            categoria="Ferramentas"
            data="4 Jan 2026"
            :tempo-leitura="5"
          />

          <MoleculesBlogCard
            titulo="Simulador de Ações"
            descricao="Descubra quanto você teria ganho investindo em ações da B3. Dados históricos reais com dividendos reinvestidos."
            to="/calculadora/acoes"
            icon="i-lucide-chart-line"
            categoria="Ferramentas"
            data="4 Jan 2026"
            :tempo-leitura="5"
          />

          <MoleculesBlogCard
            titulo="Planejamento Patrimonial"
            descricao="Calcule quanto investir para atingir suas metas financeiras. Receba carteira recomendada personalizada."
            to="/calculadora/planejamento"
            icon="i-lucide-target"
            categoria="Ferramentas"
            data="4 Jan 2026"
            :tempo-leitura="5"
          />

          <MoleculesBlogCard
            titulo="Preço Teto: Graham e Bazin"
            descricao="Descubra se uma ação está barata ou cara usando as fórmulas de Benjamin Graham e Décio Bazin."
            to="/calculadora/preco-teto"
            icon="i-lucide-target"
            categoria="Ferramentas"
            data="4 Jan 2026"
            :tempo-leitura="5"
          />

          <MoleculesBlogCard
            titulo="Calculadora de Aposentadoria"
            descricao="Planeje sua aposentadoria ou FIRE. Calcule quanto precisa investir considerando INSS e inflação."
            to="/calculadora/aposentadoria"
            icon="i-lucide-piggy-bank"
            categoria="Ferramentas"
            data="4 Jan 2026"
            :tempo-leitura="5"
          />

          <MoleculesBlogCard
            titulo="Dividend Yield"
            descricao="Calcule DY atual, projetado e on cost. Encontre as melhores ações e FIIs pagadores de dividendos."
            to="/calculadora/dividend-yield"
            icon="i-lucide-coins"
            categoria="Ferramentas"
            data="4 Jan 2026"
            :tempo-leitura="4"
          />

          <MoleculesBlogCard
            titulo="Quanto Investir por Mês"
            descricao="Descubra quanto você precisa investir mensalmente para atingir qualquer meta financeira."
            to="/calculadora/quanto-investir"
            icon="i-lucide-wallet"
            categoria="Ferramentas"
            data="4 Jan 2026"
            :tempo-leitura="4"
          />

          <MoleculesBlogCard
            titulo="Imposto de Renda sobre Ações"
            descricao="Calcule IR de swing trade e day trade. Gere DARF e compense prejuízos corretamente."
            to="/calculadora/imposto-renda"
            icon="i-lucide-receipt-text"
            categoria="Ferramentas"
            data="4 Jan 2026"
            :tempo-leitura="4"
          />

          <!-- Card CTA para ver todos -->
          <NuxtLink
            to="/guias"
            class="group flex flex-col items-center justify-center gap-4 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/10 to-secondary/5 p-8 transition-all hover:border-secondary/50 hover:from-secondary/20"
          >
            <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/30">
              <UIcon name="i-lucide-book-open" class="text-secondary h-7 w-7" />
            </div>
            <div class="text-center">
              <h3 class="mb-2 text-xl font-bold group-hover:text-secondary">
                Ver todos os guias
              </h3>
              <p class="text-sm text-gray-400">
                Mais conteúdo educacional sobre investimentos
              </p>
            </div>
            <div class="flex items-center gap-2 text-secondary text-sm font-medium">
              <span>Explorar</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="h-4 w-4 transition-transform group-hover:translate-x-2"
              />
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <MoleculesTestimonialsSection v-if="!authStore.isAuthenticated" class="mt-12" />

    <!-- Seção de IA -->
    <section v-if="!authStore.isAuthenticated" class="mt-12 border-t border-white/10 px-4 pt-16 md:px-6">
      <div class="mx-auto max-w-5xl">
        <!-- Header -->
        <div class="mb-10 text-center">
          <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2">
            <IconAi class="fill-secondary h-4 w-4" />
            <span class="text-sm font-medium text-secondary">Assessoria com IA</span>
          </div>
          <h2 class="mb-3 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
            Tire suas dúvidas em segundos
          </h2>
          <p class="mx-auto max-w-xl text-white/60">
            Pergunte qualquer coisa sobre investimentos. Nossa IA responde instantaneamente.
          </p>
        </div>

        <!-- Grid de sugestões clicáveis -->
        <div class="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="(item, idx) in [
              { icon: 'i-lucide-scale', question: 'Qual a diferença entre ações e FIIs?', category: 'Conceitos' },
              { icon: 'i-lucide-coins', question: 'Como funcionam os dividendos?', category: 'Renda Passiva' },
              { icon: 'i-lucide-pie-chart', question: 'O que é diversificação?', category: 'Estratégia' },
              { icon: 'i-lucide-wallet', question: 'Quanto devo investir por mês?', category: 'Planejamento' },
              { icon: 'i-lucide-search', question: 'Como escolher boas ações?', category: 'Análise' },
              { icon: 'i-lucide-trending-up', question: 'Vale a pena investir em ETFs?', category: 'Produtos' },
            ]"
            :key="idx"
            to="/auth/login"
            class="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-secondary/30 hover:bg-secondary/5"
          >
            <div class="flex items-center justify-between">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition-colors group-hover:bg-secondary/20">
                <UIcon :name="item.icon" class="h-5 w-5 text-white/60 transition-colors group-hover:text-secondary" />
              </div>
              <span class="rounded-full bg-white/5 px-2 py-1 text-xs text-white/40 transition-colors group-hover:bg-secondary/10 group-hover:text-secondary/80">
                {{ item.category }}
              </span>
            </div>
            <p class="font-medium text-white">{{ item.question }}</p>
            <div class="mt-auto flex items-center gap-1 text-sm text-white/40 transition-colors group-hover:text-secondary">
              <span>Perguntar</span>
              <UIcon name="i-lucide-arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </NuxtLink>
        </div>

        <!-- CTA Box -->
        <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent p-6 md:p-8">
          <!-- Background glow -->
          <div class="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
          <div class="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

          <div class="relative flex flex-col items-center gap-6 text-center">
            <!-- Mock chat preview -->
            <div class="w-full max-w-md rounded-xl border border-white/10 bg-black/30 p-4">
              <div class="flex items-start gap-3">
                <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary/20">
                  <IconAi class="fill-secondary h-4 w-4" />
                </div>
                <div class="flex-1 text-left">
                  <p class="text-sm text-white/80">
                    Olá! Sou sua assessora de investimentos. Posso ajudar com análises, tirar dúvidas e dar recomendações personalizadas.
                  </p>
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="flex items-center gap-6 text-sm text-white/50">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-zap" class="h-4 w-4 text-yellow-400" />
                <span>Resposta em ~3s</span>
              </div>
              <div class="h-4 w-px bg-white/20" />
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-brain" class="h-4 w-4 text-purple-400" />
                <span>IA Treinada</span>
              </div>
              <div class="hidden h-4 w-px bg-white/20 sm:block" />
              <div class="hidden items-center gap-2 sm:flex">
                <UIcon name="i-lucide-infinity" class="h-4 w-4 text-secondary" />
                <span>Ilimitado</span>
              </div>
            </div>

            <!-- CTA Button -->
            <UButton
              to="/auth/login"
              color="secondary"
              size="xl"
              icon="i-lucide-message-circle"
              class="group w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-secondary/25 sm:w-auto"
            >
              Começar a Perguntar
              <template #trailing>
                <UIcon name="i-lucide-arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </template>
            </UButton>

            <!-- Trust -->
            <p class="flex items-center gap-2 text-xs text-white/40">
              <UIcon name="i-lucide-shield-check" class="h-3 w-3" />
              100% gratuito • Sem cadastro de cartão
            </p>
          </div>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { IAsset } from '~/types/asset'
import type { ChartTimeRange } from '~/types/chart'

const authStore = useAuthStore()
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
)

const runtimeConfig = useRuntimeConfig()
const siteUrl = computed(() => {
  const url = runtimeConfig.public?.siteUrl || 'https://www.redentia.com.br'
  return url.endsWith('/') ? url.slice(0, -1) : url
})
const canonicalUrl = computed(() => `${siteUrl.value}/`)
const metaDescription =
  'Use a Redentia para investir com inteligência: acompanhe ações, FIIs e índices em tempo real, receba análises com IA e utilize calculadoras avançadas.'
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
  title: 'Redentia: invista em ações e fundos imobiliários com IA',
  description: metaDescription,
  path: '/',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Redentia',
      url: siteUrl.value,
      logo: `${siteUrl.value}/512x512.png`,
      sameAs: [
        'https://www.instagram.com/redentia.app',
        'https://twitter.com/redentia_app',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'contato@redentia.com.br',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Redentia',
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
      name: 'Navegação principal da Redentia',
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

const selectedTimeRange = ref<ChartTimeRange>('month')
const showMap = ref(false)
const loading = ref(false)
const blockChat = ref(false)
const treemapFilter = ref<'all' | 'positive' | 'negative'>('all')

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

// Removido o await - agora carrega de forma não-bloqueante
const { data: homeMarketData } = useAsyncData<HomeMarketData>(
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

const ibovChartData = ref<ChartPoint[]>([])
const ibovIndicator = ref('+0,00%')
const ibovLastPrice = ref(0)
const ifixIndicator = ref('+0,00%')

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

  updateIndicatorsFromSeries(payload.ibovSeries, payload.ifixSeries)

  if (!ibovChartData.value.length && payload.ibovSeries.length) {
    ibovChartData.value = mapIndiceSeries(payload.ibovSeries)
  }
  
  // Desbloqueia os botões assim que os dados forem carregados
  if (loading.value) {
    loading.value = false
  }
})

function coerceNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function mapIndiceSeries(data: IndiceData[]): ChartPoint[] {
  return data.map((item) => ({
    date: item.price_at,
    value: coerceNumber(item.market_price),
    timestamp: new Date(item.price_at).getTime(),
  }))
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

function updateIndicatorsFromSeries(
  ibovSeries: IndiceData[],
  ifixSeries: IndiceData[]
) {
  const ibovStats = calculateSeriesStats(ibovSeries)
  if (ibovStats) {
    ibovLastPrice.value = ibovStats.lastPrice
    ibovIndicator.value = formatVariation(ibovStats.variation)
  }

  const ifixStats = calculateSeriesStats(ifixSeries)
  if (ifixStats) {
    ifixIndicator.value = formatVariation(ifixStats.variation)
  }
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
      color: '#10b981',
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
</style>

<template>
  <NuxtLayout :name="layoutName" title="Visão geral">
    <h1 class="sr-only">
      {{ brand.seo.title }}
    </h1>
    <div class="flex flex-col">
    <!-- ========== HERO: CENTERED (Primo Rico — premium, espacoso, aspiracional) ========== -->
    <section v-if="showSection('hero') && !authStore.isAuthenticated && brand.hero.variant === 'centered'" :style="{ order: sectionOrder('hero') }" class="relative overflow-hidden">
      <!-- Background: gradient sutil, premium -->
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full blur-3xl" :style="{ background: `radial-gradient(ellipse at center top, ${brand.colors.secondary}4D, transparent)` }" />
        <div class="absolute left-1/4 top-20 h-64 w-64 rounded-full blur-3xl" :style="{ backgroundColor: `${brand.colors.secondary}33` }" />
      </div>

      <div class="relative px-6 py-20 text-center md:py-28">
        <!-- Badge -->
        <div class="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm" :style="{ borderColor: `${brand.colors.text}15`, backgroundColor: `${brand.colors.text}08` }">
          <span class="flex h-2 w-2">
            <span class="absolute inline-flex h-2 w-2 animate-ping rounded-full opacity-75" :style="{ backgroundColor: brand.colors.primary }" />
            <span class="relative inline-flex h-2 w-2 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
          </span>
          <span class="text-sm" :style="{ color: `${brand.colors.text}CC` }">{{ brand.hero.badge }}</span>
        </div>

        <BrandLogo variant="full" class="mx-auto mb-10 h-10 md:h-14" />

        <h2 class="mx-auto mb-6 max-w-3xl text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-6xl" :class="[brand.font.headingWeight, brand.font.headingStyle]" :style="{ color: brand.colors.text }">
          <template v-for="(line, idx) in brand.hero.title.split('\n')" :key="idx">
            <br v-if="idx > 0" />{{ line }}
          </template>
        </h2>

        <p class="mx-auto mb-10 max-w-xl text-base md:text-lg" :style="{ color: brand.colors.textMuted }">
          {{ brand.hero.subtitle }}
        </p>

        <!-- CTAs -->
        <div class="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <UButton to="/auth/register" color="secondary" size="xl" :icon="brand.hero.ctaIcon" class="group w-full px-8 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-secondary/25 sm:w-auto">
            {{ brand.hero.ctaLabel }}
            <template #trailing>
              <UIcon name="i-lucide-arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </template>
          </UButton>
          <UButton to="/auth/login" variant="ghost" size="xl" class="w-full transition-all sm:w-auto" :style="{ color: brand.colors.textMuted }">
            {{ brand.hero.ctaSecondaryLabel }}
          </UButton>
        </div>

        <!-- Founder quote -->
        <div class="mt-14 flex flex-col items-center gap-3">
          <p class="text-sm italic" :style="{ color: `${brand.colors.text}4D` }">"{{ brand.hero.founderQuote }}"</p>
          <span class="text-xs" :style="{ color: `${brand.colors.text}33` }">— {{ brand.founder.name }}</span>
        </div>

        <!-- Trust indicators -->
        <div class="mt-8 flex items-center justify-center gap-8 text-sm" :style="{ color: `${brand.colors.text}66` }">
          <template v-for="(indicator, idx) in brand.hero.trustIndicators" :key="idx">
            <div v-if="idx > 0" class="hidden h-4 w-px sm:block" :style="{ backgroundColor: `${brand.colors.text}15` }" />
            <div class="flex items-center gap-2">
              <UIcon :name="trustIndicatorStyles[idx % trustIndicatorStyles.length].icon" class="h-3 w-3" :class="trustIndicatorStyles[idx % trustIndicatorStyles.length].text" />
              <span>{{ indicator }}</span>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- ========== HERO: SPLIT (Me Poupe — energetico, personalidade, pop) ========== -->
    <section v-if="showSection('hero') && !authStore.isAuthenticated && brand.hero.variant === 'split'" :style="{ order: sectionOrder('hero') }" class="relative overflow-hidden">
      <!-- Background: dots + color splashes -->
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute right-0 top-0 h-[400px] w-[400px] rounded-full blur-3xl" :style="{ backgroundColor: `${brand.colors.primary}26` }" />
        <div class="absolute -left-20 bottom-0 h-[300px] w-[300px] rounded-full blur-3xl" :style="{ backgroundColor: `${brand.colors.secondary}1A` }" />
      </div>

      <div class="relative px-6 py-12 md:py-16">
        <div class="mx-auto flex max-w-6xl flex-col items-center gap-10 md:flex-row md:gap-16">
          <!-- Left: founder image (when hero.image is set) -->
          <div v-if="brand.hero.image" class="relative flex flex-1 items-end justify-center md:justify-start">
            <div class="absolute -inset-16 rounded-full blur-3xl" :style="{ backgroundColor: `${brand.colors.primary}15` }" />
            <img
              :src="brand.hero.image"
              :alt="brand.founder.name"
              class="relative w-[15rem] max-w-none object-contain drop-shadow-2xl sm:w-[20rem] md:w-[25rem] lg:w-[30rem]"
            />
          </div>

          <!-- Text content -->
          <div class="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
            <!-- Badge energetico -->
            <div class="mb-6 inline-flex items-center gap-2 px-4 py-2 brand-card-sm" :style="{ backgroundColor: `${brand.colors.primary}1A`, border: `1px solid ${brand.colors.primary}33` }">
              <span class="text-sm font-semibold" :style="{ color: brand.colors.primary }">{{ brand.hero.badge }}</span>
            </div>

            <h2 class="mb-4 text-4xl leading-[1.1] sm:text-5xl md:text-6xl" :class="[brand.font.headingWeight, brand.font.headingStyle]" :style="{ color: brand.colors.text }">
              <template v-for="(line, idx) in brand.hero.title.split('\n')" :key="idx">
                <br v-if="idx > 0" />{{ line }}
              </template>
            </h2>

            <p class="mb-8 max-w-md text-base md:text-lg" :style="{ color: brand.colors.textMuted }">
              {{ brand.hero.subtitle }}
            </p>

            <!-- Founder quote -->
            <p class="mb-6 max-w-sm text-sm italic" :style="{ color: `${brand.colors.text}80` }">
              "{{ brand.hero.founderQuote }}"
              <span class="not-italic" :style="{ color: `${brand.colors.text}4D` }"> — {{ brand.founder.name }}</span>
            </p>

            <!-- CTAs lado a lado, pill shape -->
            <div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <UButton to="/auth/register" color="secondary" size="xl" :icon="brand.hero.ctaIcon" class="group px-8 transition-all duration-200 hover:scale-105">
                {{ brand.hero.ctaLabel }}
              </UButton>
              <UButton to="/auth/login" variant="ghost" size="xl" :style="{ color: brand.colors.textMuted }">
                {{ brand.hero.ctaSecondaryLabel }}
              </UButton>
            </div>

            <!-- Trust inline -->
            <div class="mt-8 flex flex-wrap items-center gap-4 text-xs" :style="{ color: `${brand.colors.text}66` }">
              <div v-for="(indicator, idx) in brand.hero.trustIndicators" :key="idx" class="flex items-center gap-1.5">
                <UIcon name="i-lucide-check-circle" class="h-3 w-3" :style="{ color: brand.colors.secondary }" />
                <span>{{ indicator }}</span>
              </div>
            </div>
          </div>

          <!-- Right: quote card fallback (when NO hero.image) -->
          <div v-if="!brand.hero.image" class="flex flex-1 flex-col items-center gap-4">
            <div class="w-full max-w-sm border p-6 backdrop-blur-sm brand-card" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
              <div class="mb-4 flex items-center gap-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-full" :style="{ backgroundColor: `${brand.colors.primary}26` }">
                  <BrandLogo variant="icon" class="h-7 w-7" />
                </div>
                <div>
                  <p class="text-sm font-semibold" :style="{ color: brand.colors.text }">{{ brand.founder.name }}</p>
                  <p class="text-xs" :style="{ color: brand.colors.textMuted }">{{ brand.founder.role }}</p>
                </div>
              </div>
              <p class="text-base italic leading-relaxed" :style="{ color: `${brand.colors.text}B3` }">"{{ brand.hero.founderQuote }}"</p>
            </div>
            <BrandLogo variant="full" class="h-8 opacity-40" />
          </div>
        </div>
      </div>
    </section>

    <!-- ========== HERO: MINIMAL (Sardinha — compacto, data-first, sem firula) ========== -->
    <section v-if="showSection('hero') && !authStore.isAuthenticated && brand.hero.variant === 'minimal'" :style="{ order: sectionOrder('hero'), borderColor: brand.colors.border }" class="relative overflow-hidden border-b">
      <div class="relative px-6 py-10 md:py-14">
        <div class="mx-auto max-w-5xl">
          <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-12">
            <!-- Left: brand + headline compact -->
            <div class="flex-1">
              <BrandLogo variant="full" class="mb-4 h-8 md:h-10" />
              <h2 class="mb-3 text-2xl leading-tight sm:text-3xl md:text-4xl" :class="[brand.font.headingWeight, brand.font.headingStyle]" :style="{ color: brand.colors.text }">
                <template v-for="(line, idx) in brand.hero.title.split('\n')" :key="idx">
                  <br v-if="idx > 0" />{{ line }}
                </template>
              </h2>
              <p class="mb-6 max-w-lg text-sm md:text-base" :style="{ color: brand.colors.textMuted }">
                {{ brand.hero.subtitle }}
              </p>
              <div class="flex items-center gap-3">
                <UButton to="/auth/register" color="secondary" size="lg" :icon="brand.hero.ctaIcon" class="transition-all hover:scale-[1.02]">
                  {{ brand.hero.ctaLabel }}
                </UButton>
                <UButton to="/auth/login" variant="ghost" size="lg" :style="{ color: brand.colors.textMuted }">
                  {{ brand.hero.ctaSecondaryLabel }}
                </UButton>
              </div>
            </div>

            <!-- Right: key metrics preview -->
            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-2 border-l-2 pl-4 brand-card-sm" :style="{ borderColor: brand.colors.primary }">
                <div>
                  <p class="text-xs" :style="{ color: brand.colors.textMuted }">{{ brand.founder.name }}</p>
                  <p class="text-sm italic" :style="{ color: `${brand.colors.text}99` }">"{{ brand.hero.founderQuote }}"</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-4 text-xs" :style="{ color: brand.colors.textMuted }">
                <div v-for="(indicator, idx) in brand.hero.trustIndicators" :key="idx" class="flex items-center gap-1">
                  <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
                  <span>{{ indicator }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== HERO: INSTITUTIONAL (Assessoria — sobrio, profissional, confiavel) ========== -->
    <section v-if="showSection('hero') && !authStore.isAuthenticated && brand.hero.variant === 'institutional'" :style="{ order: sectionOrder('hero') }" class="relative overflow-hidden px-4 pt-2 md:px-6">
      <!-- Container com imagem de fundo — mesma largura do header (sem padding proprio, usa o do layout) -->
      <div class="relative overflow-hidden rounded-2xl xl:rounded-3xl">
        <!-- Background image -->
        <div
          v-if="brand.hero.image"
          class="absolute inset-0 bg-cover bg-center bg-no-repeat"
          :style="{ backgroundImage: `url(${brand.hero.image})` }"
        />
        <!-- Overlay escuro para legibilidade -->
        <div class="absolute inset-0 bg-black/70" />
        <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />

        <div class="relative mx-auto max-w-4xl px-6 py-20 md:px-12 md:py-28 lg:py-32" style="color: #ffffff">
          <div class="flex flex-col items-center text-center">
            <!-- Logo -->
            <BrandLogo variant="full" class="mb-10 h-10 w-auto md:h-14" />

            <!-- Headline -->
            <h2
              :class="[brand.font.headingWeight]"
              class="mb-5 max-w-3xl text-3xl leading-[1.12] tracking-tight md:text-5xl lg:text-6xl"
              :style="{ fontFamily: `'${brand.font.family}', sans-serif`, color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }"
            >
              <template v-for="(line, i) in brand.hero.title.split('\n')" :key="i">
                {{ line }}<br v-if="i < brand.hero.title.split('\n').length - 1" />
              </template>
            </h2>

            <!-- Subtitulo -->
            <p
              class="mx-auto mb-10 max-w-xl text-base leading-relaxed md:text-lg"
              style="color: rgba(255,255,255,0.9); text-shadow: 0 1px 4px rgba(0,0,0,0.3)"
            >
              {{ brand.hero.subtitle }}
            </p>

            <!-- CTAs -->
            <div class="mb-14 flex flex-col items-center gap-3 sm:flex-row">
              <NuxtLink
                to="/auth/register"
                class="inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-sm font-semibold shadow-lg transition hover:opacity-90"
                :style="{ backgroundColor: brand.colors.primary, color: '#ffffff', boxShadow: `0 8px 30px ${brand.colors.primary}30` }"
              >
                <UIcon :name="brand.hero.ctaIcon || 'i-lucide-briefcase'" class="size-4" />
                {{ brand.hero.ctaLabel }}
              </NuxtLink>
              <NuxtLink
                to="/auth/login"
                class="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-medium backdrop-blur-sm transition"
                style="border: 1px solid rgba(255,255,255,0.25); background: rgba(255,255,255,0.1); color: #ffffff"
                @mouseenter="($event.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)'"
                @mouseleave="($event.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'"
              >
                {{ brand.hero.ctaSecondaryLabel }}
              </NuxtLink>
            </div>

            <!-- Trust indicators -->
            <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:gap-x-8">
              <div
                v-for="(indicator, i) in brand.hero.trustIndicators"
                :key="i"
                class="flex items-center gap-2 text-xs md:text-sm"
                style="color: rgba(255,255,255,0.8); text-shadow: 0 1px 3px rgba(0,0,0,0.3)"
              >
                <span class="h-1 w-1 rounded-full" style="background: rgba(255,255,255,0.7)" />
                {{ indicator }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Social Proof - Logos de corretoras -->
    <MoleculesTrustedBy v-if="showSection('trustBar') && !authStore.isAuthenticated" :style="{ order: sectionOrder('trustBar') }" class="mt-8" />

    <!-- Calculadora de Impacto / Poder do Tempo -->
    <MoleculesWealthProjection v-if="showSection('wealthCalculator') && brand.wealthCalculator && !authStore.isAuthenticated" :style="{ order: sectionOrder('wealthCalculator') }" />

    <!-- Personagens / Universo da marca -->
    <MoleculesCharacterShowcase v-if="showSection('characters') && brand.characters && !authStore.isAuthenticated" :style="{ order: sectionOrder('characters') }" />

    <!-- Checklist / Roteiro do Investidor -->
    <MoleculesInvestorChecklist v-if="showSection('investorChecklist') && brand.investorChecklist && !authStore.isAuthenticated" :style="{ order: sectionOrder('investorChecklist') }" />

    <!-- Seção de Mercado ao Vivo (Prioridade) -->
    <div v-if="showSection('market')" :style="{ order: sectionOrder('market') }" class="flex h-auto flex-col gap-4 pt-6">
      <div class="flex flex-col gap-8">
        <div class="flex flex-col gap-4 px-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span
                class="h-2 w-2 rounded-full md:h-3 md:w-3"
                :class="{ 'animate-pulse': marketStatus.animate }"
                :style="{ backgroundColor: marketStatus.color, boxShadow: marketStatus.animate ? `0 0 12px ${marketStatus.color}80` : 'none' }"
              />
              <span
                class="text-xs font-medium uppercase tracking-wider md:text-sm"
                :style="{ color: marketStatus.color }"
              >{{ marketStatus.label }}</span>
              <span v-if="marketStatus.lastUpdate" class="text-xs" :style="{ color: brand.colors.textMuted }">
                • Atualizado em {{ marketStatus.lastUpdate }}
              </span>
            </div>
          </div>
          <div class="flex gap-8">
            <div class="flex flex-col gap-1">
              <h3
                class="font-regular flex items-center gap-2 text-xl md:text-2xl"
                :style="{ color: brand.colors.text }"
              >
                IBOVESPA
              </h3>
              <p
                class="text-3xl font-semibold tabular-nums sm:text-4xl md:text-5xl"
                :style="{ color: ibovVariationColor }"
              >
                {{ ibovIndicator }}
              </p>
              <p class="text-sm tabular-nums" :style="{ color: brand.colors.textMuted }">
                R$ {{ ibovLastPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </p>
            </div>

            <div class="flex flex-col gap-1">
              <h3
                class="font-regular flex items-center gap-2 text-xl md:text-2xl"
                :style="{ color: brand.colors.text }"
              >
                IFIX
              </h3>
              <p
                class="text-3xl font-semibold tabular-nums sm:text-4xl md:text-5xl"
                :style="{ color: ifixVariationColor }"
              >
                {{ ifixIndicator }}
              </p>
              <p class="text-sm tabular-nums" :style="{ color: brand.colors.textMuted }">
                R$ {{ ifixLastPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </p>
            </div>
          </div>
        </div>

        <MoleculesSearchAssets
          class="w-full rounded-none py-4 md:rounded-full"
          :style="{ backgroundColor: `${brand.colors.text}10` }"
        />
      </div>

      <div class="flex w-full flex-col">
        <div class="flex w-full items-center justify-between p-6 pb-0">
          <div class="flex flex-col gap-4">
            <h2 class="text-[30px] font-semibold" :style="{ color: brand.colors.text }">
              {{
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(ibovLastPrice)
              }}
            </h2>
            <p class="mb-4" :style="{ color: brand.colors.textMuted }">Cotação do IBOV</p>
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

      <div class="flex items-center justify-between gap-4 px-6">
        <div class="flex flex-col">
          <h2 class="text-[18px]" :class="brand.font.headingWeight" :style="{ color: brand.colors.text }">{{ brand.homeTexts.marketTitle }}</h2>
          <p class="text-[13px] font-extralight" :style="{ color: brand.colors.textMuted }">
            {{ brand.homeTexts.marketSubtitle }}
          </p>
        </div>
        <div class="flex items-center gap-1 rounded-lg p-1" :style="{ borderColor: brand.colors.border, border: `1px solid ${brand.colors.border}`, backgroundColor: `${brand.colors.text}05` }">
          <button
            type="button"
            class="flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all"
            :style="!showMap ? { backgroundColor: `${brand.colors.text}15`, color: brand.colors.text } : { color: brand.colors.textMuted }"
            @click="showMap = false"
          >
            <UIcon name="i-lucide-list" class="h-3.5 w-3.5" />
            <span class="max-sm:hidden">Lista</span>
          </button>
          <button
            type="button"
            class="flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all"
            :style="showMap ? { backgroundColor: `${brand.colors.text}15`, color: brand.colors.text } : { color: brand.colors.textMuted }"
            @click="showMap = true"
          >
            <UIcon name="i-lucide-grid-2x2" class="h-3.5 w-3.5" />
            <span class="max-sm:hidden">Mapa</span>
          </button>
        </div>
      </div>

      <div v-if="showMap" class="mb-6 flex flex-col">
        <div class="mx-auto mb-5 mt-6 flex items-center gap-1 rounded-lg p-1 max-md:mx-6" :style="{ borderColor: brand.colors.border, border: `1px solid ${brand.colors.border}`, backgroundColor: `${brand.colors.text}05` }">
          <button
            type="button"
            class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-all"
            :style="treemapFilter === 'all' ? { backgroundColor: `${brand.colors.text}15`, color: brand.colors.text } : { color: brand.colors.textMuted }"
            @click="treemapFilter = 'all'"
          >
            Todos
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-all"
            :style="treemapFilter === 'positive' ? { backgroundColor: `${brand.colors.text}15`, color: brand.colors.text } : { color: brand.colors.textMuted }"
            @click="treemapFilter = 'positive'"
          >
            Altas
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-all"
            :style="treemapFilter === 'negative' ? { backgroundColor: `${brand.colors.text}15`, color: brand.colors.text } : { color: brand.colors.textMuted }"
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
            <!-- Header -->
            <div class="mb-2 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div
                  v-if="brand.homePage.rankingCard.showIcon"
                  class="flex items-center justify-center"
                  :class="brand.homePage.rankingCard.iconStyle === 'pill' ? 'h-8 w-8 brand-pill' : ''"
                  :style="brand.homePage.rankingCard.iconStyle === 'pill' ? { backgroundColor: `${brand.colors.positive}20` } : {}"
                >
                  <UIcon name="i-lucide-trending-up" class="h-5 w-5" :style="{ color: brand.colors.positive }" />
                </div>
                <div>
                  <h2 class="text-base" :class="brand.font.headingWeight" :style="{ color: brand.colors.text }">{{ item.label }}</h2>
                  <p class="text-xs" :style="{ color: brand.colors.textMuted }">Maiores altas</p>
                </div>
              </div>
              <NuxtLink
                :to="{ path: '/search', query: rankingLinkQueries.top[item.key] }"
                class="flex items-center gap-1 text-sm transition-colors"
                :style="{ color: brand.colors.textMuted }"
              >
                Ver todos
                <UIcon name="i-lucide-arrow-right" class="h-4 w-4" />
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
            <!-- Header -->
            <div class="mb-2 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div
                  v-if="brand.homePage.rankingCard.showIcon"
                  class="flex items-center justify-center"
                  :class="brand.homePage.rankingCard.iconStyle === 'pill' ? 'h-8 w-8 brand-pill' : ''"
                  :style="brand.homePage.rankingCard.iconStyle === 'pill' ? { backgroundColor: `${brand.colors.negative}20` } : {}"
                >
                  <UIcon name="i-lucide-trending-down" class="h-5 w-5" :style="{ color: brand.colors.negative }" />
                </div>
                <div>
                  <h2 class="text-base" :class="brand.font.headingWeight" :style="{ color: brand.colors.text }">{{ item.label }}</h2>
                  <p class="text-xs" :style="{ color: brand.colors.textMuted }">Maiores baixas</p>
                </div>
              </div>
              <NuxtLink
                :to="{ path: '/search', query: rankingLinkQueries.bottom[item.key] }"
                class="flex items-center gap-1 text-sm transition-colors"
                :style="{ color: brand.colors.textMuted }"
              >
                Ver todos
                <UIcon name="i-lucide-arrow-right" class="h-4 w-4" />
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

      <!-- Filtros Inteligentes -->
      <div class="flex flex-col gap-4 px-6 py-6">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-sparkles" class="h-5 w-5" :style="{ color: brand.colors.primary }" />
          <h2 class="text-lg font-semibold" :style="{ color: brand.colors.text }">{{ brand.homeTexts.filtersTitle }}</h2>
        </div>
        <div class="flex flex-wrap gap-2">
          <NuxtLink
            :to="{ path: '/search', query: { p_max: 20 } }"
            class="brand-pill border px-4 py-2 text-sm transition-all"
            :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.text}08`, color: brand.colors.textMuted }"
          >
            Preço até R$ 20
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { mc_max: 2000000000 } }"
            class="brand-pill border px-4 py-2 text-sm transition-all"
            :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.text}08`, color: brand.colors.textMuted }"
          >
            Small Caps (MC ≤ R$ 2 bi)
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { ch_min: 0 } }"
            class="brand-pill border px-4 py-2 text-sm transition-all"
            :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.text}08`, color: brand.colors.textMuted }"
          >
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-trending-up" class="h-3.5 w-3.5" :style="{ color: brand.colors.positive }" />
              Alta no dia
            </span>
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { ch_max: 0 } }"
            class="brand-pill border px-4 py-2 text-sm transition-all"
            :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.text}08`, color: brand.colors.textMuted }"
          >
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-trending-down" class="h-3.5 w-3.5" :style="{ color: brand.colors.negative }" />
              Queda no dia
            </span>
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { stock: 0, bdr: 0 } }"
            class="brand-pill border px-4 py-2 text-sm transition-all"
            :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.text}08`, color: brand.colors.textMuted }"
          >
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-building-2" class="h-3.5 w-3.5" :style="{ color: brand.colors.secondary }" />
              Somente FIIs
            </span>
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { stock: 0, reit: 0 } }"
            class="brand-pill border px-4 py-2 text-sm transition-all"
            :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.text}08`, color: brand.colors.textMuted }"
          >
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-globe" class="h-3.5 w-3.5" :style="{ color: brand.colors.secondary }" />
              Somente BDRs
            </span>
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { p_min: 10, p_max: 50 } }"
            class="brand-pill border px-4 py-2 text-sm transition-all"
            :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.text}08`, color: brand.colors.textMuted }"
          >
            Preço R$ 10 - R$ 50
          </NuxtLink>
          <NuxtLink
            :to="{ path: '/search', query: { dy_min: 6 } }"
            class="brand-pill border px-4 py-2 text-sm transition-all"
            :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.text}08`, color: brand.colors.textMuted }"
          >
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-coins" class="h-3.5 w-3.5" :style="{ color: brand.colors.primary }" />
              DY acima de 6%
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>


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
          <!-- Variant: icon-left (Primo Rico — icon beside title, description, CTA) -->
          <template v-if="brand.homePage.categoryCard.variant === 'icon-left'">
            <NuxtLink
              v-for="cat in brand.homePage.categories"
              :key="cat.to"
              :to="cat.to"
              class="group flex flex-col gap-3 border p-6 transition-all brand-card"
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

          <!-- Variant: icon-top (Me Poupe — icon centered above, spacious, friendly) -->
          <template v-else-if="brand.homePage.categoryCard.variant === 'icon-top'">
            <NuxtLink
              v-for="cat in brand.homePage.categories"
              :key="cat.to"
              :to="cat.to"
              class="group flex flex-col items-center gap-4 border p-8 text-center transition-all brand-card"
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

          <!-- Variant: minimal (Sardinha — compact, left border accent, no icon) -->
          <template v-else>
            <NuxtLink
              v-for="cat in brand.homePage.categories"
              :key="cat.to"
              :to="cat.to"
              class="group flex items-center justify-between border-l-2 py-3 pl-4 pr-2 transition-colors"
              :style="{ borderLeftColor: brand.colors.primary }"
              @mouseenter="$event.currentTarget.style.backgroundColor = brand.colors.textMuted + '0D'"
              @mouseleave="$event.currentTarget.style.backgroundColor = 'transparent'"
            >
              <span class="text-sm font-medium" :style="{ color: brand.colors.text }">{{ cat.label }}</span>
              <span class="flex items-center gap-1 text-xs font-medium" :style="{ color: brand.colors.primary }">
                {{ cat.cta }}
                <UIcon name="i-lucide-chevron-right" class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </NuxtLink>
          </template>
        </div>
      </div>
    </section>

    <!-- Seção Blog / Guias Educacionais -->
    <section v-if="showSection('guides')" :style="{ order: sectionOrder('guides'), borderColor: brand.colors.border }" class="mt-12 border-t px-6 pt-12">
      <div class="flex flex-col gap-8">
        <div class="text-center">
          <div class="mb-3 flex items-center justify-center gap-2">
            <UIcon name="i-lucide-newspaper" class="text-secondary h-6 w-6" />
          </div>
          <h2 class="mb-2 text-2xl md:text-3xl" :class="[brand.font.headingWeight, brand.font.headingStyle]" :style="{ color: brand.colors.text }">
            {{ brand.homeTexts.guidesTitle }}
          </h2>
          <p class="text-sm md:text-base" :style="{ color: brand.colors.textMuted }">
            {{ brand.homeTexts.guidesSubtitle }}
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
            class="group flex flex-col items-center justify-center gap-4 border border-secondary/30 bg-gradient-to-br from-secondary/10 to-secondary/5 p-8 transition-all hover:border-secondary/50 hover:from-secondary/20 brand-card"
          >
            <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/30">
              <UIcon name="i-lucide-book-open" class="text-secondary h-7 w-7" />
            </div>
            <div class="text-center">
              <h3 class="mb-2 text-xl font-bold group-hover:text-secondary">
                Ver todos os guias
              </h3>
              <p class="text-sm" :style="{ color: brand.colors.textMuted }">
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
    <MoleculesTestimonialsSection v-if="showSection('testimonials') && !authStore.isAuthenticated" :style="{ order: sectionOrder('testimonials') }" class="mt-12" />

    <!-- Seção de IA -->
    <section v-if="showSection('aiCta') && !authStore.isAuthenticated" :style="{ order: sectionOrder('aiCta'), borderColor: brand.colors.border }" class="mt-12 border-t px-4 pt-16 md:px-6">
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
            class="group flex flex-col gap-4 border p-5 transition-all duration-200 brand-card"
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
              class="group w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-secondary/25 sm:w-auto"
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
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { IAsset } from '~/types/asset'
import type { ChartTimeRange } from '~/types/chart'

const brand = useBrand()
const authStore = useAuthStore()

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

const trustIndicatorStyles = [
  { bg: 'bg-secondary/20', text: 'text-secondary', icon: 'i-lucide-shield-check' },
  { bg: 'bg-primary/20', text: 'text-primary', icon: 'i-lucide-zap' },
  { bg: 'bg-secondary/20', text: 'text-secondary', icon: 'i-lucide-credit-card' },
]
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
</style>

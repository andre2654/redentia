<template>
  <NuxtLayout
    :name="layoutName"
    :title="authStore.isAuthenticated ? 'Busca avançada' : false"
    :hide-search-bar="authStore.isAuthenticated"
  >
    <!-- TERMINAL VARIANT (Redentia), dense Bloomberg layout -->
    <div
      v-if="terminalVariant"
      class="flex flex-col"
      :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
    >
      <!-- Status bar top -->
      <div
        class="flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-4 py-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
        :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted, backgroundColor: brand.colors.surface }"
      >
        <span>{{ isCryptoMode ? 'CRYPTO' : isTesouroMode ? 'TESOURO DIRETO' : 'B3' }}</span>
        <span :style="{ color: brand.colors.border }">·</span>
        <span class="tabular-nums">{{ isCryptoMode ? cryptoItems.length : isTesouroMode ? tesouroItems.length : allAssets.length }} UNIVERSE</span>
        <span :style="{ color: brand.colors.border }">·</span>
        <span class="tabular-nums" :style="{ color: brand.colors.text }">{{ resultsCount }} RESULTS</span>
        <span v-if="!isTesouroMode && !isCryptoMode" :style="{ color: brand.colors.border }">·</span>
        <span v-if="!isTesouroMode && !isCryptoMode" class="tabular-nums" :style="{ color: activeFiltersCount > 0 ? brand.colors.primary : brand.colors.textMuted }">
          {{ activeFiltersCount }} FILTERS
        </span>
        <span class="ml-auto flex items-center gap-3">
          <span class="inline-flex items-center gap-1.5">
            <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: brand.colors.positive }" />
            <span>LIVE · {{ lastUpdatedLabel }}</span>
          </span>
        </span>
      </div>

      <!-- Hero title -->
      <div class="border-b px-4 py-8 md:py-12" :style="{ borderColor: brand.colors.border }">
        <h1
          class="mt-2 text-3xl font-bold tracking-tight md:text-5xl"
          :class="brand.font.headingWeight"
          :style="{ color: brand.colors.text, fontFamily: brandFontStack }"
        >
          BUSCA AVANÇADA
        </h1>
        <p class="mt-2 font-mono-tab text-[11px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
          &gt; FILTROS FUNDAMENTALISTAS + TECNICOS · COMBINE QUALQUER NUMERO DE CRITERIOS
        </p>
      </div>

      <!-- Search input (sticky) -->
      <div
        class="sticky top-0 z-20 flex items-center gap-3 border-b px-4 py-3 font-mono-tab"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background }"
      >
        <span class="text-[11px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
          &gt; QUERY
        </span>
        <label for="global-search-input-terminal" class="sr-only">Buscar por ticker ou nome da companhia</label>
        <input
          id="global-search-input-terminal"
          v-model="globalFilter"
          type="search"
          autocomplete="off"
          spellcheck="false"
          placeholder="BUSCAR POR TICKER OU NOME DA COMPANHIA…"
          class="flex-1 bg-transparent py-1 font-mono-tab text-[14px] uppercase tracking-wide outline-none placeholder:opacity-40 focus-visible:ring-2 focus-visible:ring-offset-1"
          :style="{ color: brand.colors.text, caretColor: brand.colors.primary }"
        />
        <button
          v-if="globalFilter.length > 0"
          type="button"
          class="inline-flex cursor-pointer items-center gap-1 text-[11px] uppercase tracking-wide opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          :style="{ color: brand.colors.textMuted }"
          aria-label="Limpar busca"
          @click="globalFilter = ''"
        >
          CLEAR ×
        </button>
        <span class="hidden items-center gap-1 text-[10px] lg:flex" :style="{ color: brand.colors.textMuted }">
          <kbd class="border px-1.5 py-0.5 font-mono-tab" :style="{ borderColor: brand.colors.border }">⌘</kbd>
          <kbd class="border px-1.5 py-0.5 font-mono-tab" :style="{ borderColor: brand.colors.border }">K</kbd>
        </span>
      </div>

      <!-- Ticker strip -->
      <div class="border-b py-2" :style="{ borderColor: brand.colors.border }">
        <AtomsTickerCarousel class="px-4" no-control />
      </div>

      <!-- FILTERS PANEL: 4-col grid, tight, no rounded corners (disabled in tesouro mode) -->
      <div
        class="border-b transition-opacity"
        :style="{ borderColor: brand.colors.border, opacity: (isTesouroMode || isCryptoMode) ? 0.4 : 1, pointerEvents: (isTesouroMode || isCryptoMode) ? 'none' : 'auto' }"
      >
        <div
          class="flex items-center gap-2 border-b px-4 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.18em]"
          :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted, backgroundColor: brand.colors.surface }"
        >
          <span :style="{ color: brand.colors.primary }">Filtros</span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span>RANGE + GROUP + MDI</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          <!-- Market cap -->
          <div class="border-b p-4 xl:border-b-0 xl:border-r" :style="{ borderColor: brand.colors.border }">
            <div class="mb-2 flex items-baseline justify-between font-mono-tab text-[10px] uppercase tracking-[0.12em]">
              <span :style="{ color: brand.colors.primary }">Market Cap</span>
              <span :style="{ color: brand.colors.textMuted }">R$</span>
            </div>
            <div class="mb-2 font-mono-tab tabular-nums text-[12px]" :style="{ color: brand.colors.text }">
              {{ formatCurrencyBRL(marketCapRange[0]) }}
              <span :style="{ color: brand.colors.textMuted }">→</span>
              {{ formatCurrencyBRL(marketCapRange[1]) }}
            </div>
            <USlider v-model="marketCapRange" :min="minMax.mcMin" :max="minMax.mcMax" :step="minMax.mcStep" />
          </div>

          <!-- Price -->
          <div class="border-b p-4 xl:border-b-0 xl:border-r" :style="{ borderColor: brand.colors.border }">
            <div class="mb-2 flex items-baseline justify-between font-mono-tab text-[10px] uppercase tracking-[0.12em]">
              <span :style="{ color: brand.colors.primary }">Preço</span>
              <span :style="{ color: brand.colors.textMuted }">R$</span>
            </div>
            <div class="mb-2 font-mono-tab tabular-nums text-[12px]" :style="{ color: brand.colors.text }">
              <template v-if="!assetsLoading">
                {{ formatCurrencyBRL(priceRange[0]) }}
                <span :style="{ color: brand.colors.textMuted }">→</span>
                {{ formatCurrencyBRL(priceRange[1]) }}
              </template>
              <template v-else>...</template>
            </div>
            <USlider v-model="priceRange" :min="minMax.priceMin" :max="minMax.priceMax" :step="0.01" :disabled="assetsLoading" />
          </div>

          <!-- Change -->
          <div class="border-b p-4 xl:border-b-0 xl:border-r" :style="{ borderColor: brand.colors.border }">
            <div class="mb-2 flex items-baseline justify-between font-mono-tab text-[10px] uppercase tracking-[0.12em]">
              <span :style="{ color: brand.colors.primary }">Variação</span>
              <span :style="{ color: brand.colors.textMuted }">INTRADAY</span>
            </div>
            <div class="mb-2 font-mono-tab tabular-nums text-[12px]" :style="{ color: brand.colors.text }">
              <template v-if="!assetsLoading">
                <span :style="{ color: changeRange[0] < 0 ? brand.colors.negative : brand.colors.text }">
                  {{ formatPercent(changeRange[0]) }}
                </span>
                <span :style="{ color: brand.colors.textMuted }">→</span>
                <span :style="{ color: changeRange[1] > 0 ? brand.colors.positive : brand.colors.text }">
                  {{ formatPercent(changeRange[1]) }}
                </span>
              </template>
              <template v-else>...</template>
            </div>
            <USlider v-model="changeRange" :min="minMax.changeMin" :max="minMax.changeMax" :step="0.1" :disabled="assetsLoading" />
          </div>

          <!-- Group -->
          <div class="p-4">
            <div class="mb-2 font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.primary }">
              Tipo
            </div>
            <div class="flex flex-col gap-2">
              <label class="inline-flex cursor-pointer items-center gap-2 font-mono-tab text-[11px] uppercase tracking-wide">
                <input v-model="showStock" type="checkbox" class="accent-current" :disabled="assetsLoading || isTesouroMode || isCryptoMode" />
                <span :style="{ color: brand.colors.text }">STOCK</span>
              </label>
              <label class="inline-flex cursor-pointer items-center gap-2 font-mono-tab text-[11px] uppercase tracking-wide">
                <input v-model="showReit" type="checkbox" class="accent-current" :disabled="assetsLoading || isTesouroMode || isCryptoMode" />
                <span :style="{ color: brand.colors.text }">REIT</span>
              </label>
              <label class="inline-flex cursor-pointer items-center gap-2 font-mono-tab text-[11px] uppercase tracking-wide">
                <input v-model="showBdr" type="checkbox" class="accent-current" :disabled="assetsLoading || isTesouroMode || isCryptoMode" />
                <span :style="{ color: brand.colors.text }">BDR</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- MDI ROW: 3 columns (disabled in tesouro mode) -->
      <div
        class="border-b transition-opacity"
        :style="{ borderColor: brand.colors.border, opacity: (isTesouroMode || isCryptoMode) ? 0.4 : 1, pointerEvents: (isTesouroMode || isCryptoMode) ? 'none' : 'auto' }"
      >
        <div
          class="flex items-center gap-2 border-b px-4 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.18em]"
          :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted, backgroundColor: brand.colors.surface }"
        >
          <span :style="{ color: brand.colors.primary }">MDI</span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span>MONTHLY DIVIDEND INDEX</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3">
          <div class="border-b p-4 md:border-b-0 md:border-r" :style="{ borderColor: brand.colors.border }">
            <div class="mb-2 font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.primary }">
              Ocorrências
            </div>
            <p class="mb-3 font-mono-tab text-[10px] uppercase leading-relaxed" :style="{ color: brand.colors.textMuted }">
              &gt; MES COM MAIOR RECORRENCIA DE DIVIDENDOS
            </p>
            <USelectMenu
              v-model="mdiOccurrenceFilter"
              :items="mdiMonthOptions"
              label-key="label"
              value-key="value"
              size="sm"
            />
          </div>
          <div class="border-b p-4 md:border-b-0 md:border-r" :style="{ borderColor: brand.colors.border }">
            <div class="mb-2 font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.primary }">
              Mês destaque
            </div>
            <p class="mb-3 font-mono-tab text-[10px] uppercase leading-relaxed" :style="{ color: brand.colors.textMuted }">
              &gt; MES DE MAIOR PROBABILIDADE DE PAGAMENTO
            </p>
            <USelectMenu
              v-model="mdiStarFilter"
              :items="mdiMonthOptions"
              label-key="label"
              value-key="value"
              size="sm"
            />
          </div>
          <div class="p-4">
            <div class="mb-2 font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.primary }">
              Filtro MDI
            </div>
            <p class="mb-3 font-mono-tab text-[10px] uppercase leading-relaxed" :style="{ color: brand.colors.textMuted }">
              &gt; FILTRAR SO ATIVOS COM HISTORICO MDI
            </p>
            <label class="inline-flex cursor-pointer items-center gap-2 font-mono-tab text-[11px] uppercase tracking-wide">
              <input v-model="onlyWithMdi" type="checkbox" class="accent-current" />
              <span :style="{ color: brand.colors.text }">ONLY-WITH-MDI</span>
            </label>
          </div>
        </div>
      </div>

      <!-- TESOURO.MODULE: toggle + indexer picker (disabled in crypto mode) -->
      <div
        class="border-b transition-opacity"
        :style="{ borderColor: brand.colors.border, opacity: isCryptoMode ? 0.4 : 1, pointerEvents: isCryptoMode ? 'none' : 'auto' }"
      >
        <div
          class="flex items-center gap-2 border-b px-4 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.18em]"
          :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted, backgroundColor: brand.colors.surface }"
        >
          <span :style="{ color: brand.colors.primary }">Tesouro</span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span>RENDA FIXA GOVERNAMENTAL</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3">
          <!-- Mode toggle -->
          <div class="border-b p-4 md:border-b-0 md:border-r" :style="{ borderColor: brand.colors.border }">
            <div class="mb-2 font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.primary }">
              Modo
            </div>
            <p class="mb-3 font-mono-tab text-[10px] uppercase leading-relaxed" :style="{ color: brand.colors.textMuted }">
              &gt; EXIBIR TÍTULOS DO TESOURO DIRETO
            </p>
            <NuxtLink
              :to="isTesouroMode ? { path: '/search' } : { path: '/search', query: { indexer: 'IPCA' } }"
              class="inline-flex cursor-pointer items-center gap-2 font-mono-tab text-[11px] uppercase tracking-wide"
            >
              <input type="checkbox" class="accent-current pointer-events-none" :checked="isTesouroMode" readonly />
              <span :style="{ color: brand.colors.text }">
                {{ isTesouroMode ? 'TESOURO ATIVO' : 'ATIVAR TESOURO' }}
              </span>
            </NuxtLink>
          </div>

          <!-- Indexer picker -->
          <div class="border-b p-4 md:border-b-0 md:border-r" :style="{ borderColor: brand.colors.border }">
            <div class="mb-2 font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.primary }">
              Indexador
            </div>
            <p class="mb-3 font-mono-tab text-[10px] uppercase leading-relaxed" :style="{ color: brand.colors.textMuted }">
              &gt; ESCOLHA O INDEXADOR
            </p>
            <div
              class="flex flex-wrap items-center gap-px"
              :style="{ opacity: isTesouroMode ? 1 : 0.4, pointerEvents: isTesouroMode ? 'auto' : 'none', backgroundColor: brand.colors.border }"
            >
              <NuxtLink
                v-for="chip in tesouroIndexers"
                :key="chip.key"
                :to="{ path: '/search', query: { indexer: chip.key } }"
                class="flex items-center gap-2 px-3 py-1.5 font-mono-tab text-[11px] uppercase tracking-wide transition-colors"
                :style="{
                  backgroundColor: tesouroIndexer === chip.key ? brand.colors.surface : brand.colors.background,
                  color: tesouroIndexer === chip.key ? chip.color : brand.colors.textMuted,
                }"
              >
                <span>{{ chip.label }}</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Info -->
          <div class="p-4">
            <div class="mb-2 font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.primary }">
              Informações
            </div>
            <p class="mb-3 font-mono-tab text-[10px] uppercase leading-relaxed" :style="{ color: brand.colors.textMuted }">
              <template v-if="isTesouroMode">
                &gt; EXIBINDO {{ tesouroItems.length }} TÍTULOS · FILTROS DE AÇÃO DESABILITADOS
              </template>
              <template v-else>
                &gt; ATIVE PARA LISTAR TÍTULOS PÚBLICOS · ATUALIZAÇÃO DIÁRIA
              </template>
            </p>
          </div>
        </div>
      </div>

      <!-- CRYPTO.MODULE: toggle + sort picker (disabled in tesouro mode) -->
      <div
        class="border-b transition-opacity"
        :style="{ borderColor: brand.colors.border, opacity: isTesouroMode ? 0.4 : 1, pointerEvents: isTesouroMode ? 'none' : 'auto' }"
      >
        <div
          class="flex items-center gap-2 border-b px-4 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.18em]"
          :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted, backgroundColor: brand.colors.surface }"
        >
          <span :style="{ color: brand.colors.primary }">Cripto</span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span>CRIPTOMOEDAS GLOBAIS</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3">
          <!-- Mode toggle -->
          <div class="border-b p-4 md:border-b-0 md:border-r" :style="{ borderColor: brand.colors.border }">
            <div class="mb-2 font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.primary }">
              Modo
            </div>
            <p class="mb-3 font-mono-tab text-[10px] uppercase leading-relaxed" :style="{ color: brand.colors.textMuted }">
              &gt; EXIBIR UNIVERSO DE CRIPTOATIVOS
            </p>
            <NuxtLink
              :to="isCryptoMode ? { path: '/search' } : { path: '/search', query: { crypto: '1' } }"
              class="inline-flex cursor-pointer items-center gap-2 font-mono-tab text-[11px] uppercase tracking-wide"
            >
              <input type="checkbox" class="accent-current pointer-events-none" :checked="isCryptoMode" readonly />
              <span :style="{ color: brand.colors.text }">
                {{ isCryptoMode ? 'CRYPTO ATIVO' : 'ATIVAR CRYPTO' }}
              </span>
            </NuxtLink>
          </div>

          <!-- Sort picker -->
          <div class="border-b p-4 md:border-b-0 md:border-r" :style="{ borderColor: brand.colors.border }">
            <div class="mb-2 font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.primary }">
              Ordenação
            </div>
            <p class="mb-3 font-mono-tab text-[10px] uppercase leading-relaxed" :style="{ color: brand.colors.textMuted }">
              &gt; ORDENAR POR
            </p>
            <div
              class="flex flex-wrap items-center gap-px"
              :style="{ opacity: isCryptoMode ? 1 : 0.4, pointerEvents: isCryptoMode ? 'auto' : 'none', backgroundColor: brand.colors.border }"
            >
              <NuxtLink
                v-for="opt in cryptoSortOptions"
                :key="opt.key"
                :to="{ path: '/search', query: { crypto: '1', sort: opt.key } }"
                class="flex items-center gap-2 px-3 py-1.5 font-mono-tab text-[11px] uppercase tracking-wide transition-colors"
                :style="{
                  backgroundColor: cryptoSort === opt.key ? brand.colors.surface : brand.colors.background,
                  color: cryptoSort === opt.key ? brand.colors.primary : brand.colors.textMuted,
                }"
              >
                <span>{{ opt.label }}</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Info -->
          <div class="p-4">
            <div class="mb-2 font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.primary }">
              Informações
            </div>
            <p class="mb-3 font-mono-tab text-[10px] uppercase leading-relaxed" :style="{ color: brand.colors.textMuted }">
              <template v-if="isCryptoMode">
                &gt; EXIBINDO {{ cryptoItems.length }} ATIVOS · BRL · ATUALIZAÇÃO A CADA 15 MIN
              </template>
              <template v-else>
                &gt; ATIVE PARA LISTAR O TOP 200 · PREÇO EM BRL E USD
              </template>
            </p>
          </div>
        </div>
      </div>

      <!-- RESULTS TABLE -->
      <div>
        <div
          class="flex flex-wrap items-center gap-2 border-b px-4 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.18em]"
          :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted, backgroundColor: brand.colors.surface }"
        >
          <span class="tabular-nums" :style="{ color: brand.colors.text }">
            {{ resultsCount }} {{ isCryptoMode ? 'ATIVOS' : isTesouroMode ? 'TÍTULOS' : 'MATCHES' }}
          </span>
          <template v-if="!isTesouroMode && !isCryptoMode">
            <span :style="{ color: brand.colors.border }">·</span>
            <span>PAGE {{ currentPage }} / {{ totalPages }}</span>
          </template>
          <span class="ml-auto" :style="{ color: brand.colors.textMuted }">
            {{ isCryptoMode ? 'CLICK ROW TO OPEN CRYPTO' : isTesouroMode ? 'CLICK ROW TO OPEN TITLE' : 'CLICK ROW TO OPEN ASSET' }}
          </span>
        </div>

        <!-- Column header: CRYPTO -->
        <div
          v-if="isCryptoMode"
          class="hidden md:grid gap-2 border-b px-4 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.18em]"
          :style="{
            borderColor: brand.colors.border,
            color: brand.colors.textMuted,
            gridTemplateColumns: '0.5fr 1fr 2fr 1fr 1fr 1.2fr',
          }"
        >
          <span>#</span>
          <span>SYMBOL</span>
          <span>NAME</span>
          <span class="text-right">PRICE</span>
          <span class="text-right">%CHG 24H</span>
          <span class="text-right">MCAP</span>
        </div>

        <!-- Column header: TESOURO -->
        <div
          v-else-if="isTesouroMode"
          class="hidden md:grid gap-2 border-b px-4 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.18em]"
          :style="{
            borderColor: brand.colors.border,
            color: brand.colors.textMuted,
            gridTemplateColumns: '1fr 2.5fr 1fr 1.2fr 1.2fr',
          }"
        >
          <span>INDEXER</span>
          <span>TITULO</span>
          <span class="text-right">VENCIMENTO</span>
          <span class="text-right">TAXA</span>
          <span class="text-right">COMPRA</span>
        </div>

        <!-- Column header: EQUITY -->
        <div
          v-else
          class="hidden md:grid gap-2 border-b px-4 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.18em]"
          :style="{
            borderColor: brand.colors.border,
            color: brand.colors.textMuted,
            gridTemplateColumns: '1fr 2fr 1fr 1fr 1.2fr 1fr',
          }"
        >
          <span>TICKER</span>
          <span>NAME</span>
          <span class="text-right">PRICE</span>
          <span class="text-right">%CHG</span>
          <span class="text-right">MCAP</span>
          <span class="text-right">MDI</span>
        </div>

        <!-- CRYPTO MODE: loading + rows -->
        <template v-if="isCryptoMode">
          <div v-if="cryptoLoading">
            <div
              v-for="i in 8"
              :key="`cr-sk-${i}`"
              class="grid gap-2 border-b px-4 py-2.5 font-mono-tab tabular-nums"
              :style="{
                borderColor: brand.colors.border,
                gridTemplateColumns: '0.5fr 1fr 2fr 1fr 1fr 1.2fr',
              }"
            >
              <USkeleton class="h-4 w-8" />
              <USkeleton class="h-4 w-16" />
              <USkeleton class="h-4 w-40" />
              <USkeleton class="h-4 w-20 justify-self-end" />
              <USkeleton class="h-4 w-14 justify-self-end" />
              <USkeleton class="h-4 w-20 justify-self-end" />
            </div>
          </div>
          <div v-else-if="filteredCryptoItems.length">
            <NuxtLink
              v-for="coin in filteredCryptoItems"
              :key="coin.id"
              :to="`/crypto/${coin.symbol.toLowerCase()}`"
              class="grid items-center gap-2 border-b px-4 py-2 font-mono-tab text-[12px] tabular-nums transition-colors hover:bg-[var(--row-hover)]"
              :style="{
                borderColor: brand.colors.border,
                gridTemplateColumns: '0.5fr 1fr 2fr 1fr 1fr 1.2fr',
                textDecoration: 'none',
                color: brand.colors.text,
                '--row-hover': hexWithAlpha(brand.colors.primary, '14'),
              }"
            >
              <span :style="{ color: brand.colors.textMuted }">{{ coin.rank ?? '—' }}</span>
              <span class="flex items-center gap-2">
                <img
                  v-if="coin.image && !failedLogos.isFailed(coin.image)"
                  :src="coin.image"
                  :alt="coin.symbol"
                  class="h-5 w-5 shrink-0 object-contain"
                  @error="failedLogos.markFailed(coin.image)"
                />
                <span class="truncate font-bold" :style="{ color: brand.colors.primary }">
                  {{ coin.symbol }}
                </span>
              </span>
              <span class="truncate text-[11px] uppercase" :style="{ color: brand.colors.text }">
                {{ coin.name }}
              </span>
              <span class="text-right">
                {{ formatCurrencyBRL(coin.price_brl) }}
              </span>
              <span
                class="text-right"
                :style="{ color: (coin.change_24h_pct ?? 0) >= 0 ? positiveColor : negativeColor }"
              >
                {{ (coin.change_24h_pct ?? 0) >= 0 ? '+' : '' }}{{ (coin.change_24h_pct ?? 0).toFixed(2) }}%
              </span>
              <span class="text-right">
                {{ formatCurrencyBRL(coin.market_cap_brl) }}
              </span>
            </NuxtLink>
          </div>
          <div
            v-else
            class="flex flex-col items-center justify-center gap-2 border-b px-4 py-16 font-mono-tab text-[11px] uppercase tracking-[0.15em]"
            :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }"
          >
            <span :style="{ color: brand.colors.primary }">Sem resultados</span>
            <span>NENHUM ATIVO CRIPTO</span>
          </div>
        </template>

        <!-- TESOURO MODE: loading + rows -->
        <template v-else-if="isTesouroMode">
          <div v-if="tesouroLoading">
            <div
              v-for="i in 8"
              :key="`td-sk-${i}`"
              class="grid gap-2 border-b px-4 py-2.5 font-mono-tab tabular-nums"
              :style="{
                borderColor: brand.colors.border,
                gridTemplateColumns: '1fr 2.5fr 1fr 1.2fr 1.2fr',
              }"
            >
              <USkeleton class="h-4 w-16" />
              <USkeleton class="h-4 w-48" />
              <USkeleton class="h-4 w-20 justify-self-end" />
              <USkeleton class="h-4 w-16 justify-self-end" />
              <USkeleton class="h-4 w-20 justify-self-end" />
            </div>
          </div>
          <div v-else-if="filteredTesouroItems.length">
            <NuxtLink
              v-for="title in filteredTesouroItems"
              :key="title.slug"
              :to="`/tesouro/${title.slug}`"
              class="grid items-center gap-2 border-b px-4 py-2 font-mono-tab text-[12px] tabular-nums transition-colors hover:bg-[var(--row-hover)]"
              :style="{
                borderColor: brand.colors.border,
                gridTemplateColumns: '1fr 2.5fr 1fr 1.2fr 1.2fr',
                textDecoration: 'none',
                color: brand.colors.text,
                '--row-hover': hexWithAlpha(brand.colors.primary, '14'),
              }"
            >
              <span class="flex items-center">
                <span
                  class="inline-flex items-center px-1.5 py-0.5 text-[10px] uppercase tracking-[0.15em]"
                  :style="{
                    color: activeTesouroIndexer?.color,
                    border: `1px solid ${activeTesouroIndexer?.color}40`,
                  }"
                >
                  {{ activeTesouroIndexer?.label }}
                </span>
              </span>
              <span class="truncate text-[11px] uppercase" :style="{ color: brand.colors.text }">
                {{ prettyTesouroName(title.name) }}
              </span>
              <span class="text-right" :style="{ color: brand.colors.textMuted }">
                {{ formatTesouroMaturity(title.maturity_date) }}
              </span>
              <span class="text-right font-bold" :style="{ color: brand.colors.primary }">
                {{ formatTesouroRate(title) }}
              </span>
              <span class="text-right">
                {{ formatCurrencyBRL(title.price_buy) }}
              </span>
            </NuxtLink>
          </div>
          <div
            v-else
            class="flex flex-col items-center justify-center gap-2 border-b px-4 py-16 font-mono-tab text-[11px] uppercase tracking-[0.15em]"
            :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }"
          >
            <span :style="{ color: brand.colors.primary }">Sem resultados</span>
            <span>NENHUM TÍTULO NESTA CATEGORIA</span>
          </div>
        </template>

        <!-- EQUITY MODE: loading + rows -->
        <div v-else-if="assetsLoading" class="divide-y" :style="{ '--divide-color': brand.colors.border }">
          <div
            v-for="i in 8"
            :key="`tsk-${i}`"
            class="grid gap-2 border-b px-4 py-2.5 font-mono-tab tabular-nums"
            :style="{
              borderColor: brand.colors.border,
              gridTemplateColumns: '1fr 2fr 1fr 1fr 1.2fr 1fr',
            }"
          >
            <USkeleton class="h-4 w-16" />
            <USkeleton class="h-4 w-40" />
            <USkeleton class="h-4 w-14 justify-self-end" />
            <USkeleton class="h-4 w-12 justify-self-end" />
            <USkeleton class="h-4 w-16 justify-self-end" />
            <USkeleton class="h-4 w-12 justify-self-end" />
          </div>
        </div>

        <!-- EQUITY MODE: Rows -->
        <template v-else>
          <div v-if="paginatedData.length">
            <NuxtLink
              v-for="asset in paginatedData"
              :key="asset.ticker || asset.stock"
              :to="`/asset/${String(asset.ticker || asset.stock || '').toLowerCase()}`"
              class="grid items-center gap-2 border-b px-4 py-2 font-mono-tab text-[12px] tabular-nums transition-colors hover:bg-[var(--row-hover)]"
              :style="{
                borderColor: brand.colors.border,
                gridTemplateColumns: '1fr 2fr 1fr 1fr 1.2fr 1fr',
                textDecoration: 'none',
                color: brand.colors.text,
                '--row-hover': hexWithAlpha(brand.colors.primary, '14'),
              }"
            >
              <span class="flex items-center gap-2">
                <img
                  v-if="getAssetLogo(asset)"
                  :src="getAssetLogo(asset) || ''"
                  :alt="asset.ticker || asset.stock"
                  class="h-5 w-5 shrink-0 border object-cover"
                  :style="{ borderColor: brand.colors.border }"
                  @error="markAssetLogoFailed(asset)"
                />
                <span class="truncate font-bold" :style="{ color: brand.colors.primary }">
                  {{ asset.ticker || asset.stock }}
                </span>
              </span>
              <span class="truncate text-[11px] uppercase" :style="{ color: brand.colors.text }">
                {{ asset.name }}
              </span>
              <span class="text-right">
                {{ formatCurrencyBRL(getAssetPrice(asset)) }}
              </span>
              <span
                class="text-right"
                :style="{ color: getAssetChange(asset) >= 0 ? positiveColor : negativeColor }"
              >
                {{ getAssetChange(asset) >= 0 ? '+' : '' }}{{ getAssetChange(asset).toFixed(2) }}%
              </span>
              <span class="text-right">
                {{ formatCurrencyBRL(asset.market_cap) }}
              </span>
              <span class="flex items-center justify-end gap-1 text-right text-[10px] uppercase" :style="{ color: brand.colors.textMuted }">
                <template v-if="getMdiLabels(asset.mdi).occurrenceLabel || getMdiLabels(asset.mdi).starLabel">
                  <span v-if="getMdiLabels(asset.mdi).occurrenceLabel">
                    {{ getMdiLabels(asset.mdi).occurrenceLabel }}
                  </span>
                  <span v-if="getMdiLabels(asset.mdi).starLabel" :style="{ color: brand.colors.secondary }">
                    ★ {{ getMdiLabels(asset.mdi).starLabel }}
                  </span>
                </template>
                <template v-else>-</template>
              </span>
            </NuxtLink>
          </div>
          <div
            v-else
            class="flex flex-col items-center justify-center gap-2 border-b px-4 py-16 font-mono-tab text-[11px] uppercase tracking-[0.15em]"
            :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }"
          >
            <span :style="{ color: brand.colors.primary }">Sem resultados</span>
            <span>NENHUM ATIVO CASA COM OS FILTROS ATUAIS</span>
          </div>
        </template>

        <!-- Pagination (equity only) -->
        <div
          v-if="!isTesouroMode && !isCryptoMode && !assetsLoading && resultsCount > itemsPerPage"
          class="flex flex-wrap items-center gap-3 px-4 py-3 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
          :style="{ color: brand.colors.textMuted }"
        >
          <span>
            {{ (currentPage - 1) * itemsPerPage + 1 }}–{{
              Math.min(currentPage * itemsPerPage, resultsCount)
            }}
            OF
            {{ resultsCount }}
          </span>
          <span class="ml-auto flex items-center gap-2">
            <button
              type="button"
              class="border px-2 py-1 uppercase tracking-wide transition-colors disabled:opacity-40"
              :style="{
                borderColor: brand.colors.border,
                color: currentPage > 1 ? brand.colors.text : brand.colors.textMuted,
              }"
              :disabled="currentPage <= 1"
              @click="currentPage = Math.max(1, currentPage - 1)"
            >
              ← PREV
            </button>
            <span class="tabular-nums">
              PAGE {{ currentPage }} / {{ totalPages }}
            </span>
            <button
              type="button"
              class="border px-2 py-1 uppercase tracking-wide transition-colors disabled:opacity-40"
              :style="{
                borderColor: brand.colors.border,
                color: currentPage < totalPages ? brand.colors.text : brand.colors.textMuted,
              }"
              :disabled="currentPage >= totalPages"
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
            >
              NEXT →
            </button>
          </span>
        </div>
      </div>
    </div>

    <!-- DEFAULT VARIANT (all non-terminal tenants) -->
    <div v-else class="relative flex flex-col gap-12 pb-16 pt-6">
      <!-- Background effects: derivados do brand primary/secondary para
           garantir que a atmosfera da pagina acompanhe o tenant. Terminal
           (Redentia) mostra um grid CRT sutil em vez de gradiente. -->
      <div v-if="!terminalVariant" class="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          class="absolute -top-[20%] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[120px]"
          :style="{ backgroundColor: bgGlowPrimary }"
        />
        <div
          class="absolute right-[10%] top-[20%] h-[300px] w-[300px] rounded-full blur-[100px]"
          :style="{ backgroundColor: bgGlowSecondary }"
        />
      </div>
      <div
        v-else
        class="pointer-events-none absolute inset-0 overflow-hidden"
        :style="{
          backgroundImage: terminalGridBg,
          backgroundSize: '48px 48px',
          opacity: 0.35,
          maskImage:
            'radial-gradient(ellipse at top, black 0%, black 40%, transparent 80%)',
        }"
      />

      <section class="relative z-10 max-md:px-4">
        <div class="mx-auto flex w-full flex-col gap-6">
          <!-- Hero title: estilo varia por tenant variant -->
          <div class="flex flex-col gap-2">
            <span
              v-if="terminalVariant"
              class="font-mono-tab text-[10px] uppercase tracking-[0.22em]"
              :style="{ color: brand.colors.primary }"
            >
              Busca
            </span>
            <span
              v-else
              class="text-xs font-medium uppercase tracking-[0.3em]"
              :style="{ color: secondaryMuted }"
            >
              Busca
            </span>
            <h1
              class="text-3xl tracking-tight md:text-5xl"
              :class="[brand.font.headingWeight, brand.font.headingStyle]"
              :style="{ color: brand.colors.text, fontFamily: brandFontStack }"
            >
              <template v-if="terminalVariant">Busca avançada, Terminal de ativos</template>
              <template v-else>Encontre ativos com precisão</template>
            </h1>
            <p
              class="text-sm md:text-base"
              :class="terminalVariant ? 'font-mono-tab text-[12px] uppercase tracking-[0.12em]' : ''"
              :style="{ color: brand.colors.textMuted }"
            >
              <template v-if="terminalVariant">
                &gt; Combine indicadores tecnicos e fundamentalistas. Acoes, FIIs, BDRs e ETFs.
              </template>
              <template v-else>
                Combine indicadores técnicos e fundamentais para identificar
                oportunidades em ações, FIIs, BDRs e ETFs.
              </template>
            </p>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div
              class="brand-card border p-4 backdrop-blur-md transition-colors sm:p-5"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
            >
              <span class="text-[10px] font-medium uppercase tracking-wider sm:text-xs" :style="{ color: secondaryMuted }">Resultados</span>
              <p class="mt-1 text-2xl font-semibold sm:text-3xl" :style="{ color: brand.colors.text }">
                {{ resultsCount }}
              </p>
              <p class="text-[11px] sm:text-xs" :style="{ color: brand.colors.textMuted }">Ativos nos filtros.</p>
            </div>
            <div
              class="brand-card border p-4 backdrop-blur-md transition-colors sm:p-5"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
            >
              <span class="text-[10px] font-medium uppercase tracking-wider sm:text-xs" :style="{ color: secondaryMuted }">Filtros ativos</span>
              <p class="mt-1 text-2xl font-semibold sm:text-3xl" :style="{ color: brand.colors.text }">
                {{ activeFiltersCount }}
              </p>
              <p class="text-[11px] sm:text-xs" :style="{ color: brand.colors.textMuted }">Modificados.</p>
            </div>
            <div
              class="brand-card border p-4 backdrop-blur-md transition-colors sm:p-5"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
            >
              <span class="text-[10px] font-medium uppercase tracking-wider sm:text-xs" :style="{ color: secondaryMuted }">Atualização</span>
              <p class="mt-1 text-2xl font-semibold sm:text-3xl" :style="{ color: brand.colors.text }">
                {{ lastUpdatedLabel }}
              </p>
              <p class="text-[11px] sm:text-xs" :style="{ color: brand.colors.textMuted }">API {{ brand.name }}.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="relative z-10 max-md:px-4">
        <AtomsTickerCarousel
          class="mx-auto hidden w-full brand-pill px-6 py-3 md:flex"
          :style="{ backgroundColor: brand.colors.surface }"
          :fade-color="brand.colors.surface"
          big
          no-control
        />
        <AtomsTickerCarousel
          class="mx-auto w-full brand-pill px-3 py-2 md:hidden"
          :style="{ backgroundColor: brand.colors.surface }"
          :fade-color="brand.colors.surface"
          no-control
        />
      </section>

      <section class="relative z-10 max-md:px-4">
        <div class="mx-auto flex w-full flex-col gap-8">
          <div
            class="rounded-4xl border p-6 shadow-lg backdrop-blur-md"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
          >
            <div class="flex flex-col gap-6" :style="{ color: brand.colors.text }">
              <div class="flex flex-col gap-2">
                <span
                  class="text-xs font-medium uppercase tracking-[0.3em]"
                  :class="terminalVariant ? 'font-mono-tab' : ''"
                  :style="{ color: terminalVariant ? primaryStrong : secondaryMuted }"
                >
                  <template v-if="terminalVariant">Filtros</template>
                  <template v-else>Filtros avançados</template>
                </span>
                <h2 class="text-2xl font-semibold" :style="{ color: brand.colors.text }">Personalize sua análise</h2>
                <p class="text-sm" :style="{ color: brand.colors.textMuted }">
                  Ajuste ranges numéricos, selecione grupos de ativos e combine
                  com buscas rápidas.
                </p>
              </div>

              <AtomsFormInput
                id="global-search-input"
                v-model="globalFilter"
                placeholder="Buscar por nome ou ticker..."
                size="lg"
                variant="soft"
                icon="i-lucide-search"
                class="w-full"
                :ui="{
                  base: `border text-[${brand.colors.text}] placeholder:text-[${brand.colors.textMuted}]`,
                  style: `border-color: ${brand.colors.border}; background-color: ${brand.colors.background}`,
                }"
              >
                <template #trailing>
                  <div class="flex items-center gap-2 max-lg:hidden">
                    <UKbd value="meta" variant="link" color="neutral" />
                    <UKbd value="K" variant="link" color="neutral" />
                  </div>
                </template>
              </AtomsFormInput>

              <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div
                  class="flex flex-col gap-3 brand-card border p-4"
                  :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
                >
                  <div
                    class="flex items-center justify-between text-sm font-semibold"
                  >
                    <span>Market Cap (R$)</span>
                  </div>
                  <span class="text-xs font-light" :style="{ color: brand.colors.textMuted }">
                    {{ formatCurrencyBRL(marketCapRange[0]) }} -
                    {{ formatCurrencyBRL(marketCapRange[1]) }}
                  </span>
                  <USlider
                    v-model="marketCapRange"
                    :min="minMax.mcMin"
                    :max="minMax.mcMax"
                    :step="minMax.mcStep"
                  />
                </div>

                <div
                  class="flex flex-col gap-3 brand-card border p-4"
                  :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
                >
                  <div
                    class="flex items-center justify-between text-sm font-semibold"
                  >
                    <span>Preço (R$)</span>
                  </div>
                  <span class="text-xs font-light" :style="{ color: brand.colors.textMuted }">
                    <template v-if="!assetsLoading">
                      {{ formatCurrencyBRL(priceRange[0]) }} -
                      {{ formatCurrencyBRL(priceRange[1]) }}
                    </template>
                    <template v-else>...</template>
                  </span>
                  <USlider
                    v-model="priceRange"
                    :min="minMax.priceMin"
                    :max="minMax.priceMax"
                    :step="0.01"
                    :disabled="assetsLoading"
                  />
                </div>

                <div
                  class="flex flex-col gap-3 brand-card border p-4"
                  :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
                >
                  <div
                    class="flex items-center justify-between text-sm font-semibold"
                  >
                    <span>Variação (%)</span>
                  </div>
                  <span class="text-xs font-light" :style="{ color: brand.colors.textMuted }">
                    <template v-if="!assetsLoading">
                      {{ formatPercent(changeRange[0]) }} -
                      {{ formatPercent(changeRange[1]) }}
                    </template>
                    <template v-else>...</template>
                  </span>
                  <USlider
                    v-model="changeRange"
                    :min="minMax.changeMin"
                    :max="minMax.changeMax"
                    :step="0.1"
                    :disabled="assetsLoading"
                  />
                </div>

                <div
                  class="flex flex-col gap-4 brand-card border p-4"
                  :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
                >
                  <div class="text-sm font-semibold">Grupo</div>
                  <div class="flex flex-wrap items-center gap-3">
                    <UCheckbox
                      v-model="showStock"
                      label="Ação"
                      :disabled="assetsLoading"
                    />
                    <UCheckbox
                      v-model="showReit"
                      label="REIT"
                      :disabled="assetsLoading"
                    />
                    <UCheckbox
                      v-model="showBdr"
                      label="BDR"
                      :disabled="assetsLoading"
                    />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div
                  class="flex flex-col gap-4 brand-card border p-4"
                  :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
                >
                  <div class="flex flex-col gap-1">
                    <span class="text-sm font-semibold" :style="{ color: brand.colors.text }">
                      MDI, Ocorrência principal
                    </span>
                    <p class="text-xs" :style="{ color: brand.colors.textMuted }">
                      Mostra ativos cujo mês com maior recorrência de dividendos
                      coincide com o selecionado.
                    </p>
                  </div>
                  <UButtonGroup
                    orientation="horizontal"
                    variant="soft"
                    class="hidden flex-wrap gap-2 md:flex"
                  >
                    <UButton
                      v-for="option in mdiMonthOptions"
                      :key="`mdi-occ-${option.value}`"
                      color="neutral"
                      :variant="
                        mdiOccurrenceFilter === option.value ? 'soft' : 'link'
                      "
                      :label="option.label"
                      class="min-w-[72px]"
                      @click="mdiOccurrenceFilter = option.value"
                    />
                  </UButtonGroup>
                  <USelectMenu
                    v-model="mdiOccurrenceFilter"
                    :items="mdiMonthOptions"
                    label-key="label"
                    value-key="value"
                    class="md:hidden"
                  />
                </div>

                <div
                  class="flex flex-col gap-4 brand-card border p-4"
                  :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
                >
                  <div class="flex flex-col gap-1">
                    <span class="text-sm font-semibold" :style="{ color: brand.colors.text }">
                      MDI, Maior probabilidade
                    </span>
                    <p class="text-xs" :style="{ color: brand.colors.textMuted }">
                      Filtra conforme o mês com maior indicação de pagamento
                      (estrela).
                    </p>
                  </div>
                  <UButtonGroup
                    orientation="horizontal"
                    variant="soft"
                    class="hidden flex-wrap gap-2 md:flex"
                  >
                    <UButton
                      v-for="option in mdiMonthOptions"
                      :key="`mdi-star-${option.value}`"
                      color="neutral"
                      :variant="
                        mdiStarFilter === option.value ? 'soft' : 'link'
                      "
                      :label="option.label"
                      class="min-w-[72px]"
                      @click="mdiStarFilter = option.value"
                    />
                  </UButtonGroup>
                  <USelectMenu
                    v-model="mdiStarFilter"
                    :items="mdiMonthOptions"
                    label-key="label"
                    value-key="value"
                    class="md:hidden"
                  />
                </div>

                <div
                  class="flex flex-col justify-between gap-4 brand-card border p-4"
                :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
                >
                  <div class="flex flex-col gap-1">
                    <span class="text-sm font-semibold" :style="{ color: brand.colors.text }">
                      Dados MDI
                    </span>
                    <p class="text-xs" :style="{ color: brand.colors.textMuted }">
                      Garanta que apenas ativos com histórico MDI sejam
                      exibidos.
                    </p>
                  </div>
                  <UCheckbox
                    v-model="onlyWithMdi"
                    label="Somente com informações MDI"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            class="brand-card border p-4 shadow-lg backdrop-blur-md sm:p-6"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
          >
            <div class="flex flex-col gap-4" :style="{ color: brand.colors.text }">
              <div class="flex flex-col gap-1">
                <span
                  class="text-[10px] font-medium uppercase tracking-wider sm:text-xs"
                  :class="terminalVariant ? 'font-mono-tab tracking-[0.22em]' : ''"
                  :style="{ color: terminalVariant ? primaryStrong : secondaryMuted }"
                >
                  <template v-if="terminalVariant">Resultados</template>
                  <template v-else>Resultados</template>
                </span>
                <h2 class="flex items-center gap-2 text-xl font-semibold sm:text-2xl">
                  Ativos encontrados
                  <IconAi class="h-5 w-5 shrink-0 sm:h-6 sm:w-6" :style="{ fill: brand.colors.secondary }" aria-hidden="true" />
                </h2>
                <p class="text-xs sm:text-sm" :style="{ color: brand.colors.textMuted }">
                  Toque no card para ver detalhes.
                </p>
              </div>

              <div
                v-if="assetsLoading"
                class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                <USkeleton
                  v-for="i in 6"
                  :key="`asset-skeleton-${i}`"
                  class="h-36 w-full rounded-xl sm:h-40"
                />
              </div>

              <template v-else>
                <div
                  v-if="paginatedData.length"
                  class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  <NuxtLink
                    v-for="asset in paginatedData"
                    :key="asset.ticker || asset.stock"
                    :to="`/asset/${String(asset.ticker || asset.stock || '').toLowerCase()}`"
                    class="group flex flex-col gap-3 brand-card border p-4 transition-[transform,opacity,box-shadow,background-color,border-color,filter] active:scale-[0.99] sm:gap-4 sm:p-5"
                    :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex min-w-0 flex-1 items-center gap-3">
                        <img
                          v-if="getAssetLogo(asset)"
                          :src="getAssetLogo(asset) || ''"
                          :alt="asset.ticker || asset.stock"
                          class="h-10 w-10 shrink-0 rounded-xl border object-cover sm:h-11 sm:w-11"
                          :style="{ borderColor: brand.colors.border }"
                          @error="markAssetLogoFailed(asset)"
                        />
                        <BrandLogo
                          v-else
                          variant="icon"
                          class="h-10 w-10 shrink-0 rounded-xl border p-2 sm:h-11 sm:w-11"
                          :style="{ borderColor: brand.colors.border }"
                        />
                        <div class="min-w-0 flex-1">
                          <p class="truncate font-semibold" :style="{ color: brand.colors.text }">
                            {{ asset.ticker || asset.stock }}
                          </p>
                          <p class="truncate text-xs sm:text-sm" :style="{ color: brand.colors.textMuted }">
                            {{ asset.name }}
                          </p>
                        </div>
                      </div>
                      <span
                        class="shrink-0 brand-card-sm px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide sm:text-xs"
                        :style="{ backgroundColor: brand.colors.border, color: brand.colors.textMuted }"
                      >
                        {{ getAssetTypeLabel(asset.type) }}
                      </span>
                    </div>

                    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
                      <span class="font-medium" :style="{ color: brand.colors.text }">
                        {{ formatCurrencyBRL(getAssetPrice(asset)) }}
                      </span>
                      <span
                        class="inline-flex items-center gap-1 font-medium tabular-nums"
                        :style="{ color: getAssetChange(asset) >= 0 ? positiveColor : negativeColor }"
                      >
                        <IconArrowFinanceUp
                          :class="['h-4 w-4 sm:h-5 sm:w-5', getAssetChange(asset) >= 0 ? '' : 'rotate-180']"
                          :style="{ fill: getAssetChange(asset) >= 0 ? positiveColor : negativeColor }"
                        />
                        {{ getAssetChange(asset) >= 0 ? '+' : '' }}{{ getAssetChange(asset).toFixed(2) }}%
                      </span>
                    </div>

                    <div
                      v-if="getMdiLabels(asset.mdi).occurrenceLabel || getMdiLabels(asset.mdi).starLabel"
                      class="flex flex-wrap gap-2"
                    >
                      <span
                        v-if="getMdiLabels(asset.mdi).occurrenceLabel"
                        class="brand-card-sm px-2 py-1 text-[10px] sm:text-xs"
                        :style="{ backgroundColor: brand.colors.border, color: brand.colors.textMuted }"
                      >
                        {{ getMdiLabels(asset.mdi).occurrenceLabel }}
                      </span>
                      <span
                        v-if="getMdiLabels(asset.mdi).starLabel"
                        class="inline-flex items-center gap-1 brand-card-sm px-2 py-1 text-[10px] sm:text-xs"
                        :style="{ color: brand.colors.secondary, backgroundColor: hexWithAlpha(brand.colors.secondary, '1A') }"
                      >
                        <IconAi class="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" :style="{ fill: brand.colors.secondary }" aria-hidden="true" />
                        {{ getMdiLabels(asset.mdi).starLabel }}
                      </span>
                    </div>

                    <p class="mt-auto text-[10px] sm:text-xs" :style="{ color: brand.colors.textMuted }">
                      MC {{ formatCurrencyBRL(asset.market_cap) }}
                    </p>
                  </NuxtLink>
                </div>

                <div
                  v-else
                  class="brand-card border py-12 text-center text-sm sm:py-16"
                  :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.textMuted }"
                >
                  Nenhum ativo encontrado com os filtros atuais.
                </div>
              </template>
            </div>

            <div
              v-if="!assetsLoading && resultsCount > itemsPerPage"
              class="mt-6 flex justify-center border-t pt-4"
              :style="{ borderColor: brand.colors.border }"
            >
              <UPagination
                :page="currentPage"
                :items-per-page="itemsPerPage"
                :total="resultsCount"
                @update:page="(page) => (currentPage = page)"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { AssetMdiEntry, IAsset } from '~/types/asset'
import { useTesouroService, type TesouroItem } from '~/services/tesouro'
import { useCryptoService, type CryptoAssetItem } from '~/services/crypto'

definePageMeta({
  isPublicRoute: true,
})

const brand = useBrand()
const { getAssets } = useAssetsService()
const authStore = useAuthStore()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const siteUrl = computed(() => {
  const url = runtimeConfig.public?.siteUrl || brand.url
  return url.endsWith('/') ? url.slice(0, -1) : url
})

const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'unauthenticated'
)

// ---- Brand-aware cosmetics ----
// Evitamos classes Tailwind hardcoded (`bg-primary/10`, `text-secondary/70`)
// porque nao respeitam o tenant ativo: a opacity fica certa mas a cor
// eh sempre a mesma do Redentia. Em vez disso resolvemos em runtime via
// `useBrand()` e alpha suffix (+opacidade hex).
function hexWithAlpha(hex: string, alpha: string): string {
  if (!hex) return hex
  const trimmed = hex.trim()
  if (trimmed.startsWith('#') && (trimmed.length === 7 || trimmed.length === 4)) {
    return trimmed + alpha
  }
  return trimmed
}

const terminalVariant = computed(() => brand.hero?.variant === 'terminal')
const editorialVariant = computed(() =>
  ['research', 'editorial', 'holder', 'mentor', 'playbook'].includes(
    brand.hero?.variant as string,
  ),
)

const bgGlowPrimary = computed(() => hexWithAlpha(brand.colors.primary, '1A')) // ~10%
const bgGlowSecondary = computed(() => hexWithAlpha(brand.colors.secondary, '14')) // ~8%
const secondaryMuted = computed(() => hexWithAlpha(brand.colors.secondary, 'B3')) // ~70%
const primaryStrong = computed(() => brand.colors.primary)
const positiveColor = computed(() => brand.colors.positive)
const negativeColor = computed(() => brand.colors.negative)
const brandFontStack = computed(() => {
  const f = brand.font?.family || 'Inter'
  return `'${f}', system-ui, sans-serif`
})
const terminalGridBg = computed(() => {
  const c = hexWithAlpha(brand.colors.border, '55')
  return `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`
})

const { data: assetsDataset, pending: assetsPending } = await useAsyncData<
  IAsset[]
>('search-assets', async () => {
  const response = await getAssets()
  if (Array.isArray(response)) {
    return response
  }
  const nested = (response as { data?: IAsset[] } | undefined)?.data
  return Array.isArray(nested) ? nested : []
})

const allAssets = ref<IAsset[]>([])
const data = ref<IAsset[]>([])
const assetsLoading = computed(() => assetsPending.value)
const lastUpdatedAt = ref<Date | null>(null)

const globalFilter = ref('')

function goToAsset(ticker: string) {
  router.push(`/asset/${ticker.toLowerCase()}`)
}

defineShortcuts({
  meta_k: () => {
    focusGlobalSearch()
  },
})

function focusGlobalSearch() {
  const el = document.getElementById(
    'global-search-input'
  ) as HTMLInputElement | null
  el?.focus()
}

const monthShortNames = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
] as const
const currentMonthNumber = new Date().getMonth() + 1

const mdiMonthOptions = computed(() => [
  { label: 'Todos os meses', value: 'any' as const },
  ...monthShortNames.map((label, index) => ({
    label,
    value: String(index + 1) as `${number}`,
  })),
])

function toFiniteNumber(value: unknown) {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function getMonthLabel(monthNumber: number) {
  const monthIndex = (((monthNumber - 1) % 12) + 12) % 12
  return monthShortNames[monthIndex] ?? `M${monthNumber}`
}

function getOrderedMonths(startingMonth: number) {
  const months: number[] = []
  for (let i = 0; i < 12; i++) {
    months.push(((startingMonth + i - 1) % 12) + 1)
  }
  return months
}

interface OccurrenceHighlight {
  month: number
  monthLabel: string
  percentage: number | null
}

interface StarHighlight {
  month: number
  monthLabel: string
}

function getMdiHighlights(entries?: AssetMdiEntry[] | null) {
  if (!entries?.length) {
    return { occurrence: null, star: null }
  }

  const monthMap = new Map<number, AssetMdiEntry>()
  for (const entry of entries) {
    const month = toFiniteNumber(entry?.month)
    if (!month) {
      continue
    }
    if (!monthMap.has(month)) {
      monthMap.set(month, entry)
    }
  }

  if (!monthMap.size) {
    return { occurrence: null, star: null }
  }

  const orderedMonths = getOrderedMonths(currentMonthNumber)

  let occurrence: OccurrenceHighlight | null = null
  for (const month of orderedMonths) {
    const entry = monthMap.get(month)
    if (!entry) {
      continue
    }
    const occurrences = toFiniteNumber(entry.occurrences) ?? 0
    const totalYears = toFiniteNumber(entry.total_years) ?? 0
    if (occurrences > 0) {
      const percentage =
        totalYears > 0 ? (occurrences / totalYears) * 100 : null
      occurrence = {
        month,
        monthLabel: getMonthLabel(month),
        percentage,
      }
      break
    }
  }

  const sumRates = entries
    .map((entry) => toFiniteNumber(entry.sum_rate))
    .filter((value): value is number => value !== null)

  const averageSumRate =
    sumRates.length > 0
      ? sumRates.reduce((acc, value) => acc + value, 0) / sumRates.length
      : null

  let star: StarHighlight | null = null
  const getStarForMonth = (month: number): StarHighlight | null => {
    const entry = monthMap.get(month)
    if (!entry) {
      return null
    }
    const sumRate = toFiniteNumber(entry.sum_rate)
    if (
      averageSumRate === null ||
      sumRate === null ||
      sumRate < averageSumRate
    ) {
      return null
    }
    return {
      month,
      monthLabel: getMonthLabel(month),
    }
  }

  if (averageSumRate !== null) {
    if (occurrence) {
      star = getStarForMonth(occurrence.month)
      if (!star) {
        const startIndex = orderedMonths.indexOf(occurrence.month)
        for (let offset = 1; offset < 12; offset++) {
          const month = orderedMonths[(startIndex + offset) % 12]
          if (month === occurrence.month) {
            continue
          }
          const candidate = getStarForMonth(month)
          if (candidate) {
            star = candidate
            break
          }
        }
      }
    } else {
      for (const month of orderedMonths) {
        const candidate = getStarForMonth(month)
        if (candidate) {
          star = candidate
          break
        }
      }
    }
  }

  return {
    occurrence,
    star,
  }
}

interface MdiLabelSegments {
  occurrenceLabel: string | null
  starLabel: string | null
}

function getMdiLabels(entries?: AssetMdiEntry[] | null): MdiLabelSegments {
  const { occurrence, star } = getMdiHighlights(entries)
  if (!occurrence && !star) {
    return { occurrenceLabel: null, starLabel: null }
  }

  if (occurrence && star && occurrence.month === star.month) {
    return {
      occurrenceLabel: null,
      starLabel: `${star.monthLabel} (maior chance)`,
    }
  }

  return {
    occurrenceLabel: occurrence
      ? `${occurrence.monthLabel} (${occurrence.percentage !== null ? `${Math.round(occurrence.percentage)}%` : '0%'})`
      : null,
    starLabel: star ? `${star.monthLabel} (maior chance)` : null,
  }
}

// Filtros avançados controlados por URL
const route = useRoute()
// Sliders (ranges)
const marketCapRange = ref<number[]>([0, 1_000_000_000_000])
const priceRange = ref<number[]>([0, 1000])
const changeRange = ref<number[]>([-20, 20])
const minMax = {
  mcMin: 0,
  mcMax: 1_000_000_000_000,
  mcStep: 1_000_000,
  priceMin: 0,
  priceMax: 1_000,
  changeMin: -50,
  changeMax: 50,
}
const showStock = ref(true)
const showReit = ref(true)
const showBdr = ref(true)
type GroupFilter = 'stocks' | 'etfs' | 'reits' | 'bdrs'
const groupFilter = ref<GroupFilter | null>(null)
const mdiOccurrenceFilter = ref<'any' | `${number}`>('any')
const mdiStarFilter = ref<'any' | `${number}`>('any')
const onlyWithMdi = ref(false)
const canonicalUrl = computed(() => {
  const groupParam =
    typeof route.query.group === 'string'
      ? route.query.group.toLowerCase()
      : null
  if (groupParam === 'stocks' || groupParam === 'reits') {
    return `${siteUrl.value}/search?group=${groupParam}`
  }
  return `${siteUrl.value}/search`
})
const metaTitle = computed(() => {
  if (groupFilter.value === 'reits') {
    return `Todos os FIIs listados na B3 | ${brand.name}`
  }
  if (groupFilter.value === 'stocks') {
    return `Todas as ações da B3 | ${brand.name}`
  }
  return `Busca avançada de ações, FIIs e BDRs | ${brand.name}`
})
const metaDescription = computed(() => {
  if (groupFilter.value === 'reits') {
    return `Explore todos os fundos imobiliários listados na B3, filtre por preço, dividendos e encontre oportunidades com a ajuda da ${brand.name}.`
  }
  if (groupFilter.value === 'stocks') {
    return `Veja todas as ações negociadas na B3, acompanhe preços, market cap e variações diárias com filtros inteligentes da ${brand.name}.`
  }
  return `Busque investimentos na B3 com filtros avançados da ${brand.name}: encontre ações, FIIs, ETFs e BDRs com dados em tempo real.`
})

usePageSeo({
  title: () => metaTitle.value,
  description: () => metaDescription.value,
  path: '/search',
  robots: () =>
    Object.keys(route.query || {}).length > 0 ? 'noindex,follow' : 'index,follow',
})

function normalizeBool(v: unknown, def = true) {
  if (v === undefined) return def
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') return v === '1' || v.toLowerCase() === 'true'
  return def
}

function readFiltersFromUrl() {
  const q = route.query
  const toNum = (v: unknown, fallback: number) => {
    const n = typeof v === 'string' || typeof v === 'number' ? Number(v) : NaN
    return Number.isFinite(n) ? n : fallback
  }
  const parseMonthFilter = (v: unknown): 'any' | `${number}` => {
    const n = typeof v === 'string' || typeof v === 'number' ? Number(v) : NaN
    if (Number.isFinite(n) && n >= 1 && n <= 12) {
      return String(n) as `${number}`
    }
    return 'any'
  }
  marketCapRange.value = [
    toNum(q.mc_min, minMax.mcMin),
    toNum(q.mc_max, minMax.mcMax),
  ]
  priceRange.value = [
    toNum(q.p_min, minMax.priceMin),
    toNum(q.p_max, minMax.priceMax),
  ]
  changeRange.value = [
    toNum(q.ch_min, minMax.changeMin),
    toNum(q.ch_max, minMax.changeMax),
  ]
  showStock.value = normalizeBool(q.stock, true)
  showReit.value = normalizeBool(q.reit, true)
  showBdr.value = normalizeBool(q.bdr, true)
  mdiOccurrenceFilter.value = parseMonthFilter(q.mdi_occurrence)
  mdiStarFilter.value = parseMonthFilter(q.mdi_star)
  onlyWithMdi.value = normalizeBool(q.mdi_only, false)

  const groupParam =
    typeof q.group === 'string' ? (q.group as string).toLowerCase() : null
  switch (groupParam) {
    case 'stocks':
      showStock.value = true
      showReit.value = false
      showBdr.value = false
      groupFilter.value = 'stocks'
      break
    case 'etfs':
      showStock.value = true
      showReit.value = false
      showBdr.value = false
      groupFilter.value = 'etfs'
      break
    case 'reits':
      showStock.value = false
      showReit.value = true
      showBdr.value = false
      groupFilter.value = 'reits'
      break
    case 'bdrs':
      showStock.value = false
      showReit.value = false
      showBdr.value = true
      groupFilter.value = 'bdrs'
      break
    default:
      groupFilter.value = null
      break
  }
}

function buildQueryFromFilters() {
  const q: Record<string, any> = {}
  if (marketCapRange.value?.length === 2) {
    const [a, b] = marketCapRange.value
    if (a > minMax.mcMin) q.mc_min = a
    if (b < minMax.mcMax) q.mc_max = b
  }
  if (priceRange.value?.length === 2) {
    const [a, b] = priceRange.value
    if (a > minMax.priceMin) q.p_min = a
    if (b < minMax.priceMax) q.p_max = b
  }
  if (changeRange.value?.length === 2) {
    const [a, b] = changeRange.value
    if (a > minMax.changeMin) q.ch_min = a
    if (b < minMax.changeMax) q.ch_max = b
  }
  if (!showStock.value) q.stock = '0'
  if (!showReit.value) q.reit = '0'
  if (!showBdr.value) q.bdr = '0'
  if (mdiOccurrenceFilter.value !== 'any') {
    q.mdi_occurrence = Number(mdiOccurrenceFilter.value)
  }
  if (mdiStarFilter.value !== 'any') {
    q.mdi_star = Number(mdiStarFilter.value)
  }
  if (onlyWithMdi.value) {
    q.mdi_only = '1'
  }
  return q
}

// Dados filtrados
const filteredData = computed(() => {
  if (assetsLoading.value) return []
  const allowedTypes = new Set<string>()
  if (showStock.value) {
    allowedTypes.add('STOCK')
    if (groupFilter.value === 'etfs') {
      allowedTypes.add('ETF')
    }
  } else if (groupFilter.value === 'etfs') {
    allowedTypes.add('ETF')
  }
  if (showReit.value) {
    allowedTypes.add('REIT')
    allowedTypes.add('FUND')
  }
  if (showBdr.value) {
    allowedTypes.add('BDR')
  }

  const toNum = (v: unknown) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }

  const mcMin = marketCapRange.value?.[0]
  const mcMax = marketCapRange.value?.[1]
  const prMin = priceRange.value?.[0]
  const prMax = priceRange.value?.[1]
  const chMin = changeRange.value?.[0]
  const chMax = changeRange.value?.[1]
  const occurrenceFilter =
    mdiOccurrenceFilter.value === 'any'
      ? null
      : Number(mdiOccurrenceFilter.value)
  const starFilter =
    mdiStarFilter.value === 'any' ? null : Number(mdiStarFilter.value)

  return data.value.filter((it) => {
    // tipo
    const normalizedType = (it.type || '').toString().toUpperCase()
    if (allowedTypes.size && !allowedTypes.has(normalizedType)) return false
    const applyEtfOnly =
      groupFilter.value === 'etfs' &&
      showStock.value &&
      !showReit.value &&
      !showBdr.value
    if (applyEtfOnly && normalizedType !== 'ETF') return false
    // market cap
    if (mcMin !== undefined && it.market_cap < mcMin) return false
    if (mcMax !== undefined && it.market_cap > mcMax) return false
    // preço atual
    const price = it.market_price ?? it.close
    if (prMin !== undefined && price < prMin) return false
    if (prMax !== undefined && price > prMax) return false
    // variação percentual
    const change = it.change_percent ?? it.change
    if (chMin !== undefined && change < chMin) return false
    if (chMax !== undefined && change > chMax) return false
    const highlights = getMdiHighlights(it.mdi)
    if (onlyWithMdi.value && !(Array.isArray(it.mdi) && it.mdi.length > 0)) {
      return false
    }
    if (
      occurrenceFilter !== null &&
      highlights.occurrence?.month !== occurrenceFilter
    ) {
      return false
    }
    if (starFilter !== null && highlights.star?.month !== starFilter) {
      return false
    }
    return true
  })
})

// TESOURO DIRETO mode: activated when route has ?indexer=IPCA|SELIC|PREFIXADO|IGPM
const { listTesouros: loadTesouros } = useTesouroService()

const tesouroIndexers = computed(() => [
  { key: 'IPCA', label: 'IPCA+', title: 'Indexados à inflação', color: brand.colors.primary },
  { key: 'SELIC', label: 'SELIC', title: 'Pós-fixados', color: brand.colors.positive },
  { key: 'PREFIXADO', label: 'PRÉ', title: 'Taxa fixa', color: brand.colors.text },
  { key: 'IGPM', label: 'IGPM+', title: 'Indexados ao IGPM', color: brand.colors.textMuted },
])

const tesouroIndexer = computed<string | null>(() => {
  const q = route.query.indexer
  if (typeof q !== 'string') return null
  const upper = q.toUpperCase()
  return tesouroIndexers.value.some((t) => t.key === upper) ? upper : null
})

const isTesouroMode = computed(() => tesouroIndexer.value !== null)

const activeTesouroIndexer = computed(() =>
  tesouroIndexers.value.find((t) => t.key === tesouroIndexer.value) ?? null
)

const tesouroItems = ref<TesouroItem[]>([])
const tesouroLoading = ref(false)

async function fetchTesouro() {
  if (!isTesouroMode.value) {
    tesouroItems.value = []
    return
  }
  tesouroLoading.value = true
  try {
    tesouroItems.value = await loadTesouros(tesouroIndexer.value || undefined)
  } catch {
    tesouroItems.value = []
  } finally {
    tesouroLoading.value = false
  }
}

watch(tesouroIndexer, fetchTesouro, { immediate: true })

const filteredTesouroItems = computed(() => {
  const q = globalFilter.value?.toLowerCase().trim()
  if (!q) return tesouroItems.value
  return tesouroItems.value.filter(
    (t) => t.name.toLowerCase().includes(q) || (t.indexer || '').toLowerCase().includes(q),
  )
})

function formatTesouroMaturity(iso: string | null): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return iso
  }
}

function formatTesouroRate(item: TesouroItem): string {
  if (!item.rate) return '-'
  return item.rate
    .replace('IPCA +', 'IPCA+')
    .replace('IGPM +', 'IGPM+')
    .replace(/SELIC\s*\+\s*/, 'SELIC+')
    .replace(/\s+/g, ' ') + '%'
}

function prettyTesouroName(raw: string): string {
  return raw.replace('Tesouro ', '').replace(/\s+\|.*$/, '')
}

// CRYPTO mode: activated when route has ?crypto=1
const { listCryptos: loadCryptos } = useCryptoService()

const cryptoSortOptions = computed(() => [
  { key: 'RANK', label: 'RANK' },
  { key: 'MCAP', label: 'MCAP' },
  { key: 'UP', label: '24H+' },
  { key: 'DOWN', label: '24H-' },
])

const cryptoSort = computed<string>(() => {
  const q = route.query.sort
  if (typeof q !== 'string') return 'RANK'
  const upper = q.toUpperCase()
  return cryptoSortOptions.value.some((o) => o.key === upper) ? upper : 'RANK'
})

const isCryptoMode = computed(() => route.query.crypto === '1')

const cryptoItems = ref<CryptoAssetItem[]>([])
const cryptoLoading = ref(false)

async function fetchCryptos() {
  if (!isCryptoMode.value) {
    cryptoItems.value = []
    return
  }
  cryptoLoading.value = true
  try {
    cryptoItems.value = await loadCryptos(200)
  } catch {
    cryptoItems.value = []
  } finally {
    cryptoLoading.value = false
  }
}

watch(isCryptoMode, fetchCryptos, { immediate: true })

const filteredCryptoItems = computed(() => {
  let arr = [...cryptoItems.value]
  const q = globalFilter.value?.toLowerCase().trim()
  if (q) {
    arr = arr.filter(
      (c) => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    )
  }
  switch (cryptoSort.value) {
    case 'MCAP':
      arr.sort((a, b) => (b.market_cap_brl ?? 0) - (a.market_cap_brl ?? 0))
      break
    case 'UP':
      arr.sort((a, b) => (b.change_24h_pct ?? -Infinity) - (a.change_24h_pct ?? -Infinity))
      break
    case 'DOWN':
      arr.sort((a, b) => (a.change_24h_pct ?? Infinity) - (b.change_24h_pct ?? Infinity))
      break
    default:
      arr.sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999))
  }
  return arr
})

const resultsCount = computed(() => {
  if (isCryptoMode.value) return filteredCryptoItems.value.length
  if (isTesouroMode.value) return filteredTesouroItems.value.length
  return filteredData.value.length
})

const itemsPerPage = ref(12)
const currentPage = ref(1)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredData.value.slice(start, start + itemsPerPage.value)
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(resultsCount.value / itemsPerPage.value || 1))
)

watch(
  assetsDataset,
  (newAssets) => {
    if (!Array.isArray(newAssets)) return
    allAssets.value = newAssets
    data.value = newAssets
    lastUpdatedAt.value = new Date()
    currentPage.value = 1
    readFiltersFromUrl()
  },
  { immediate: true }
)

const activeFiltersCount = computed(() => {
  let count = 0
  if (
    marketCapRange.value?.[0] > minMax.mcMin ||
    marketCapRange.value?.[1] < minMax.mcMax
  ) {
    count++
  }
  if (
    priceRange.value?.[0] > minMax.priceMin ||
    priceRange.value?.[1] < minMax.priceMax
  ) {
    count++
  }
  if (
    changeRange.value?.[0] > minMax.changeMin ||
    changeRange.value?.[1] < minMax.changeMax
  ) {
    count++
  }
  if (!showStock.value || !showReit.value || !showBdr.value) {
    count++
  }
  if (groupFilter.value) {
    count++
  }
  if (globalFilter.value?.trim()) {
    count++
  }
  if (onlyWithMdi.value) {
    count++
  }
  if (mdiOccurrenceFilter.value !== 'any') {
    count++
  }
  if (mdiStarFilter.value !== 'any') {
    count++
  }
  return count
})

const lastUpdatedLabel = computed(() => {
  if (!lastUpdatedAt.value) return '--:--'
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(lastUpdatedAt.value)
})

watch(filteredData, () => {
  currentPage.value = 1
})

watch(totalPages, (value) => {
  if (currentPage.value > value) {
    currentPage.value = value
  }
  if (currentPage.value < 1) {
    currentPage.value = 1
  }
})

function formatCurrencyBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n || 0)
}
function formatPercent(n: number) {
  const num = Number(n || 0)
  return `${num.toFixed(1)}%`
}
watch(
  () => route.query,
  () => {
    readFiltersFromUrl()
  },
  { deep: true }
)

function getAssetTypeLabel(type?: string | null) {
  const normalized = (type || '').toString().toUpperCase()
  switch (normalized) {
    case 'STOCK':
      return 'Ação'
    case 'ETF':
      return 'ETF'
    case 'REIT':
      return 'REIT'
    case 'FUND':
      return 'FII'
    case 'BDR':
      return 'BDR'
    default:
      return 'Ativo'
  }
}

function getAssetPrice(asset: IAsset) {
  if (typeof asset.market_price === 'number') return asset.market_price
  if (typeof asset.close === 'number') return asset.close
  return 0
}

function getAssetChange(asset: IAsset) {
  if (typeof asset.change_percent === 'number') return asset.change_percent
  if (typeof asset.change === 'number') return asset.change
  return 0
}

const failedLogos = useFailedLogos()
function getAssetLogo(asset: IAsset) {
  const url = resolveLogo(null, asset.logo)
  if (!url || failedLogos.isFailed(url)) return null
  return url
}
function markAssetLogoFailed(asset: IAsset) {
  failedLogos.markFailed(asset.logo)
}
</script>

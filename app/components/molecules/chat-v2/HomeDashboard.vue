<!--
  HomeDashboard — primary "new chat" surface for authenticated users.

  Visual language: Redentia × Stripe-style — weight 300 display, italic
  serif gancho, eyebrow amber 11px tracking 0.18em, tabular nums on
  numbers, amber-tinted shadows on cards, 4-8px button radius.
  See `.claude/skills/redentia-stripe-style/SKILL.md`.

  Sections:
  1. Hero greeting — "Bom dia, X. ● ativa" with eyebrow + italic-serif
     gancho. The pulsing dot signals "assistente ativo".
  2. Stat cards — IBOV, goal progress, decisions, watchlists. Each is
     a clickable surface with explicit "→ pergunte" hover affordance.
  3. News carousel — only news that mention tickers, with one card
     per group rendered as "minimized" (~160px) so the strip has
     visual rhythm and signals scrollability. Click reveals a small
     action menu (impact / summary / source).
  4. Starter chips — 4 quick-fire questions, prominently placed below
     the news so users still have a one-click path even on a busy
     dashboard.

  Data sources (all already used elsewhere):
  - IBOV: useAssetsService().getIndiceHistoricPrices('ibov', '1mo')
  - Goal: useGoals().activeGoals (priority by status)
  - Decisions: useDecisions().pending count
  - Watchlists: useWatchlist().watches count
  - Memories (for portfolio exposure %): useMemories()
  - News: GET ${apiBase}/news/latest?limit=80 — same as home page.
    Filtered to articles where tickers.length > 0.

  Emits `start(question)` like EmptyState. The parent help.vue routes
  it to chat.send().
-->
<template>
  <!-- The dashboard is the only scrollable surface when there are no
       messages — Thread.vue handles its own scroll once messages exist.
       `h-full overflow-y-auto` makes vertical scroll work inside the
       layout's flexbox column.
       pb-40/md:pb-48 reserves vertical space for the composer overlay
       so the last section doesn't sit underneath the input pill. -->
  <div
    ref="dashRef"
    class="home-dashboard relative mx-auto flex h-full w-full max-w-5xl flex-col gap-10 overflow-y-auto px-4 pb-40 pt-8 md:gap-12 md:px-6 md:pb-48 md:pt-12"
    @scroll="onDashScroll"
  >
    <!-- Atmospheric radial — subtle amber glow offset top-right (stripe-style) -->
    <div
      class="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div
        class="absolute right-[-15%] top-[-20%] h-[60%] w-[55%]"
        :style="{
          background: `radial-gradient(ellipse, color-mix(in srgb, var(--brand-primary) 22%, transparent), transparent 60%)`,
          filter: 'blur(160px)',
          opacity: 0.55,
        }"
      />
    </div>

    <!-- ============ 1. Hero greeting ============ -->
    <header class="flex flex-col gap-4">
      <!-- Display headline with italic serif gancho -->
      <h1
        class="hero-headline font-light leading-[1.05] text-[28px] tracking-[-0.6px] md:text-[44px] md:tracking-[-1.2px] lg:text-[56px] lg:tracking-[-1.6px]"
        :style="{ color: 'var(--brand-text)' }"
      >
        {{ greeting.salutation }}<template v-if="greeting.name">, {{ greeting.name }}</template>.
        <br />
        Vamos
        <em
          class="hero-headline-em font-normal italic"
          :style="{
            color: 'var(--brand-primary)',
            fontFamily: `'Instrument Serif', 'Cormorant Garamond', Georgia, serif`,
          }"
        >investir</em
        ><span :style="{ color: 'var(--brand-primary)' }">.</span>
      </h1>

      <p
        class="max-w-[58ch] text-[15px] leading-[1.6] md:text-[16px]"
        :style="{ color: 'var(--brand-text-muted)' }"
      >
        Pergunte qualquer coisa, ou comece pelas notícias e dados do mercado abaixo.
      </p>
    </header>

    <!-- ============ 2. Stat cards ============ -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <!-- IBOV -->
      <button
        type="button"
        class="stat-card group relative flex flex-col gap-3 rounded-lg p-5 text-left transition-[transform,border-color,background-color,box-shadow]"
        :style="cardStyle"
        @click="$emit('start', 'Como está o IBOV hoje? Mostre o gráfico recente e o contexto macro.')"
      >
        <div class="flex items-center gap-2">
          <span
            class="flex size-7 items-center justify-center rounded-md"
            :style="{ backgroundColor: `color-mix(in srgb, var(--brand-primary) 14%, transparent)` }"
          >
            <UIcon
              name="i-lucide-trending-up"
              class="size-3.5"
              :style="{ color: 'var(--brand-primary)' }"
              aria-hidden="true"
            />
          </span>
          <span
            class="font-mono-tab text-[10.5px] font-medium uppercase tracking-[0.16em]"
            :style="{ color: 'var(--brand-text-muted)' }"
          >IBOV hoje</span>
        </div>

        <div class="flex flex-col gap-1.5">
          <span
            class="font-light tabular-nums leading-none text-[26px] tracking-[-0.6px] md:text-[30px]"
            :style="{ color: 'var(--brand-text)' }"
            translate="no"
          >{{ ibovDisplay.value }}</span>
          <span
            class="font-mono-tab text-[12px] font-medium tabular-nums"
            :style="{ color: ibovDisplay.color }"
            translate="no"
          >{{ ibovDisplay.indicator }}</span>
        </div>

        <!-- Sparkline -->
        <svg
          v-if="ibovSpark.path"
          :viewBox="`0 0 ${SPARK_W} ${SPARK_H}`"
          class="absolute inset-x-4 bottom-3 h-7 w-[calc(100%-2rem)] opacity-70"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path
            :d="ibovSpark.path"
            fill="none"
            :stroke="ibovDisplay.color"
            stroke-width="1.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

      </button>

      <!-- Goal progress -->
      <button
        type="button"
        class="stat-card group relative flex flex-col gap-3 rounded-lg p-5 text-left transition-[transform,border-color,background-color,box-shadow]"
        :style="cardStyle"
        @click="onGoalClick"
      >
        <div class="flex items-center gap-2">
          <span
            class="flex size-7 items-center justify-center rounded-md"
            :style="{ backgroundColor: `color-mix(in srgb, var(--brand-primary) 14%, transparent)` }"
          >
            <UIcon
              name="i-lucide-target"
              class="size-3.5"
              :style="{ color: 'var(--brand-primary)' }"
              aria-hidden="true"
            />
          </span>
          <span
            class="font-mono-tab text-[10.5px] font-medium uppercase tracking-[0.16em]"
            :style="{ color: 'var(--brand-text-muted)' }"
          >{{ goalLabel }}</span>
        </div>

        <div class="flex flex-col gap-2">
          <span
            class="font-light tabular-nums leading-tight text-[20px] tracking-[-0.4px] md:text-[24px]"
            :style="{ color: 'var(--brand-text)' }"
            translate="no"
          >{{ goalDisplay.value }}</span>

          <div v-if="goalDisplay.hasGoal" class="flex flex-col gap-1">
            <div
              class="h-1 w-full overflow-hidden rounded-full"
              :style="{ backgroundColor: `color-mix(in srgb, var(--brand-text) 8%, transparent)` }"
            >
              <div
                class="h-full rounded-full transition-[width]"
                :style="{
                  width: `${Math.min(100, Math.max(0, goalDisplay.percent))}%`,
                  backgroundColor: goalDisplay.color,
                }"
              />
            </div>
            <span
              class="font-mono-tab text-[12px] font-medium tabular-nums"
              :style="{ color: goalDisplay.color }"
            >{{ goalDisplay.percent }}% concluído</span>
          </div>
          <span
            v-else
            class="font-mono-tab text-[12px]"
            :style="{ color: 'var(--brand-text-muted)' }"
          >Defina sua meta</span>
        </div>
      </button>

      <!-- Decisions -->
      <button
        type="button"
        class="stat-card group relative flex flex-col gap-3 rounded-lg p-5 text-left transition-[transform,border-color,background-color,box-shadow]"
        :style="cardStyle"
        @click="$emit('start', 'Mostre minhas decisões pendentes e o status de cada uma.')"
      >
        <div class="flex items-center gap-2">
          <span
            class="flex size-7 items-center justify-center rounded-md"
            :style="{ backgroundColor: `color-mix(in srgb, var(--brand-primary) 14%, transparent)` }"
          >
            <UIcon
              name="i-lucide-briefcase"
              class="size-3.5"
              :style="{ color: 'var(--brand-primary)' }"
              aria-hidden="true"
            />
          </span>
          <span
            class="font-mono-tab text-[10.5px] font-medium uppercase tracking-[0.16em]"
            :style="{ color: 'var(--brand-text-muted)' }"
          >Decisões</span>
        </div>

        <div class="flex flex-col gap-1.5">
          <span
            class="font-light tabular-nums leading-none text-[26px] tracking-[-0.6px] md:text-[30px]"
            :style="{ color: 'var(--brand-text)' }"
            translate="no"
          >{{ decisionsCount }}</span>
          <span
            class="font-mono-tab text-[12px] font-medium tabular-nums"
            :style="{
              color: decisionsCount > 0
                ? 'var(--brand-primary)'
                : 'var(--brand-text-muted)',
            }"
          >{{ decisionsCount === 1 ? 'decisão ativa' : 'decisões ativas' }}</span>
        </div>
      </button>

      <!-- Watchlists -->
      <button
        type="button"
        class="stat-card group relative flex flex-col gap-3 rounded-lg p-5 text-left transition-[transform,border-color,background-color,box-shadow]"
        :style="cardStyle"
        @click="$emit('start', 'Mostre minhas watchlists ativas e os gatilhos atuais.')"
      >
        <div class="flex items-center gap-2">
          <span
            class="flex size-7 items-center justify-center rounded-md"
            :style="{ backgroundColor: `color-mix(in srgb, var(--brand-primary) 14%, transparent)` }"
          >
            <UIcon
              name="i-lucide-star"
              class="size-3.5"
              :style="{ color: 'var(--brand-primary)' }"
              aria-hidden="true"
            />
          </span>
          <span
            class="font-mono-tab text-[10.5px] font-medium uppercase tracking-[0.16em]"
            :style="{ color: 'var(--brand-text-muted)' }"
          >Watchlists</span>
        </div>

        <div class="flex flex-col gap-1.5">
          <span
            class="font-light tabular-nums leading-none text-[26px] tracking-[-0.6px] md:text-[30px]"
            :style="{ color: 'var(--brand-text)' }"
            translate="no"
          >{{ watchlistsCount }}</span>
          <span
            class="font-mono-tab text-[12px] font-medium tabular-nums"
            :style="{
              color: watchlistsCount > 0
                ? 'var(--brand-primary)'
                : 'var(--brand-text-muted)',
            }"
          >{{ watchlistsCount === 1 ? 'watchlist ativa' : 'watchlists ativas' }}</span>
        </div>
      </button>
    </div>

    <!-- ============ 2.5. Asset chip marquee ============
         Minimalist auto-scroll marquee of ticker chips. Each chip is
         just [TICKER] [±X.XX%] — no logo, no price label. Full-bleed
         edges with mask-image fade so the cut-off reads as intentional
         "more behind" rather than clipped content. The strip is also
         drag-scrollable and click-able (click any chip → /asset/X).
         Items are duplicated so the marquee loops seamlessly. -->
    <!-- Marquee constrained to the same width as the stat cards above.
         shrink-0 keeps the band at its natural height inside the
         flex-col dashboard. -mt pulls it tight against the cards. The
         band uses overflow-x: clip + overflow-y: visible so the
         action menu opened from a ticker chip can bleed out below
         (regular `overflow: hidden` would clip it).

         The band creates its own stacking context (because of
         overflow-x: clip), so even with the inner menu at z-50, the
         menu paints UNDER any later-DOM siblings (the news grid).
         When a menu opens, we promote the band itself above the news
         section by toggling .is-menu-open → z-index 50. -->
    <div
      v-if="tickerChips.length > 0"
      class="ticker-chips-band relative -mt-7 shrink-0 md:-mt-9"
      :class="openTickerMenu ? 'is-menu-open' : ''"
      @mouseenter="marqueePaused = true"
      @mouseleave="marqueePaused = false"
    >
      <div
        class="ticker-chips-track flex w-max items-center gap-2"
        :class="isMarqueePaused ? 'is-paused' : ''"
      >
        <div
          v-for="(t, idx) in tickerChipsLooped"
          :key="`${t.ticker}-${idx}`"
          class="ticker-chip-wrap relative shrink-0"
        >
          <button
            type="button"
            class="ticker-chip group inline-flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 font-mono-tab text-[12.5px] font-medium tabular-nums leading-none transition-[border-color,background-color,box-shadow]"
            :class="openTickerMenu?.idx === idx ? 'is-active' : ''"
            :style="chipStyle"
            :aria-expanded="openTickerMenu?.idx === idx"
            :aria-label="`Ações para ${t.ticker}`"
            @click.stop="toggleTickerMenu(idx, t.ticker)"
          >
            <AtomsTickerLogo
              :ticker="t.ticker"
              :logo="t.logo ?? undefined"
              :size="20"
              class="shrink-0"
            />
            <span class="font-semibold" :style="{ color: 'var(--brand-text)' }" translate="no">{{ t.ticker }}</span>
            <span :style="{ color: changeColor(t.change) }" translate="no">{{ formatChange(t.change) }}</span>
          </button>

          <!-- Action menu — same affordance as the news card menu.
               Mounted below the chip; the marquee auto-pauses while
               the menu is open. z-50 keeps it above the composer
               (z-30) and the news cards (z-20) — anything below z-50
               in the layout shouldn't intercept the popover. -->
          <Transition name="news-menu">
            <div
              v-if="openTickerMenu?.idx === idx"
              class="ticker-menu absolute left-1/2 top-full z-50 mt-2 flex w-[220px] -translate-x-1/2 flex-col overflow-hidden rounded-lg shadow-lg"
              :style="{
                backgroundColor: 'var(--brand-surface)',
                border: `1px solid color-mix(in srgb, var(--brand-border) 60%, transparent)`,
              }"
              @click.stop
            >
              <button
                type="button"
                class="news-menu-item flex items-center gap-2 px-3 py-2.5 text-left text-[13px] font-medium transition-colors"
                :style="{ color: 'var(--brand-text)' }"
                @click.stop="onAskAnalysis(t)"
              >
                <UIcon name="i-lucide-bar-chart-3" class="size-3.5" :style="{ color: 'var(--brand-primary)' }" />
                <span class="flex-1">Análise completa</span>
                <span
                  class="rounded px-1.5 py-0.5 font-mono-tab text-[9.5px] font-semibold uppercase tracking-[0.14em]"
                  :style="{
                    backgroundColor: `color-mix(in srgb, var(--brand-primary) 16%, transparent)`,
                    color: 'var(--brand-primary)',
                  }"
                >MAX</span>
              </button>
              <button
                type="button"
                class="news-menu-item flex items-center gap-2 px-3 py-2.5 text-left text-[13px] transition-colors"
                :style="{
                  color: 'var(--brand-text)',
                  borderTop: `1px solid color-mix(in srgb, var(--brand-border) 35%, transparent)`,
                }"
                @click.stop="onAskPortfolioFit(t)"
              >
                <UIcon name="i-lucide-pie-chart" class="size-3.5" :style="{ color: 'var(--brand-primary)' }" />
                <span class="flex-1">Faz sentido pra mim?</span>
                <span
                  class="rounded px-1.5 py-0.5 font-mono-tab text-[9.5px] font-semibold uppercase tracking-[0.14em]"
                  :style="{
                    backgroundColor: `color-mix(in srgb, var(--brand-primary) 16%, transparent)`,
                    color: 'var(--brand-primary)',
                  }"
                >MAX</span>
              </button>
              <button
                type="button"
                class="news-menu-item flex items-center gap-2 px-3 py-2.5 text-left text-[13px] transition-colors"
                :style="{
                  color: 'var(--brand-text)',
                  borderTop: `1px solid color-mix(in srgb, var(--brand-border) 35%, transparent)`,
                }"
                @click.stop="onAddWatch(t)"
              >
                <UIcon name="i-lucide-bell-plus" class="size-3.5" :style="{ color: 'var(--brand-primary)' }" />
                Adicionar à watchlist
              </button>
              <NuxtLink
                :to="`/asset/${t.ticker.toLowerCase()}`"
                class="news-menu-item flex items-center gap-2 px-3 py-2.5 text-left text-[13px] transition-colors"
                :style="{
                  color: 'var(--brand-text-muted)',
                  borderTop: `1px solid color-mix(in srgb, var(--brand-border) 35%, transparent)`,
                }"
                @click.stop="closeTickerMenu"
              >
                <UIcon name="i-lucide-external-link" class="size-3.5" />
                Abrir página do ativo
              </NuxtLink>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- ============ 3. News grid (vertical) ============ -->
    <section class="flex flex-col gap-4">
      <header class="flex flex-col gap-1.5">
        <span
          class="font-mono-tab text-[11px] font-medium uppercase tracking-[0.18em]"
          :style="{ color: 'var(--brand-primary)' }"
        >Notícias</span>
        <h2
          class="font-light tracking-[-0.4px] text-[20px] leading-tight md:text-[24px]"
          :style="{ color: 'var(--brand-text)' }"
        >
          E insights pra <em
            class="font-normal italic"
            :style="{
              color: 'var(--brand-primary)',
              fontFamily: `'Instrument Serif', 'Cormorant Garamond', Georgia, serif`,
            }"
          >você</em>.
        </h2>
      </header>

      <!-- Loading skeleton (initial fetch) -->
      <div v-if="newsLoading" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="i in 6"
          :key="`skel-${i}`"
          class="aspect-[4/3] animate-pulse rounded-2xl"
          :style="{ backgroundColor: `color-mix(in srgb, var(--brand-text) 5%, transparent)` }"
        />
      </div>

      <!-- Vertical news grid — uniform tiles. Progressive reveal on
           scroll: a sentinel at the bottom triggers IntersectionObserver
           which fetches the next page from the server. -->
      <div
        v-else-if="displayedItems.length > 0"
        class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <article
          v-for="n in displayedItems"
          :key="n.id"
          class="news-card group relative flex aspect-[4/3] cursor-pointer flex-col justify-end overflow-hidden rounded-2xl transition-[transform,box-shadow,border-color] duration-300"
          :style="{
            backgroundColor: 'var(--brand-surface)',
            border: `1px solid color-mix(in srgb, var(--brand-border) 45%, transparent)`,
          }"
        >
          <!-- Background image -->
          <NuxtImg
            v-if="n.image_url && !failedImages[n.id]"
            :src="n.image_url"
            :alt="n.title"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            sizes="sm:100vw md:33vw"
            class="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
            @error="failedImages[n.id] = true"
          />
          <div
            v-else
            class="absolute inset-0"
            :style="{ background: `linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 28%, transparent), color-mix(in srgb, var(--brand-surface) 90%, transparent))` }"
            aria-hidden="true"
          />
          <!-- Gradient overlay — gets noticeably lighter on hover so the
               photo "reveals" itself when the user is engaging with the
               card. Lighter on hover doubles as the click affordance
               (no more mouse-icon needed). -->
          <div
            class="news-overlay absolute inset-0 transition-opacity duration-300"
            aria-hidden="true"
          />

          <!-- Top-left: ticker tag -->
          <div
            v-if="primaryTicker(n)"
            class="absolute left-3 top-3 z-10 flex items-center gap-1.5"
          >
            <span
              class="rounded-md px-2 py-0.5 font-mono-tab text-[11px] font-medium tracking-tight backdrop-blur-md"
              style="color: white; background-color: rgba(0, 0, 0, 0.6);"
              translate="no"
            >{{ primaryTicker(n) }}</span>
            <span
              v-if="exposureFor(n) !== null"
              class="rounded-md px-2 py-0.5 font-mono-tab text-[11px] font-medium tabular-nums backdrop-blur-md"
              :style="{ color: 'white', backgroundColor: `color-mix(in srgb, var(--brand-primary) 70%, rgba(0,0,0,0.6))` }"
              translate="no"
            >{{ exposureFor(n)!.toFixed(1) }}%</span>
          </div>

          <!-- Bottom: title + meta -->
          <div class="relative z-10 flex flex-col gap-2 p-4">
            <h3
              class="line-clamp-3 text-[14px] font-medium leading-snug md:text-[15px]"
              style="color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.7);"
            >{{ n.title }}</h3>

            <!-- Meta row — backdrop pill keeps text legible over any image -->
            <div
              class="news-meta inline-flex max-w-fit flex-wrap items-center gap-x-2 gap-y-1 rounded-md px-2 py-1 font-mono-tab text-[11.5px] font-medium"
              style="background-color: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px);"
            >
              <span style="color: rgba(255, 255, 255, 0.95);" translate="no">{{ formatRelativeTime(n.published_at) }}</span>
              <span style="color: rgba(255, 255, 255, 0.4);" aria-hidden="true">·</span>
              <span style="color: rgba(255, 255, 255, 0.95);">
                Impacto
                <span class="ml-0.5 font-semibold" :style="{ color: impactColor(n) }">{{ impactLabel(n) }}</span>
              </span>
            </div>
          </div>

          <!-- Action layer -->
          <button
            type="button"
            class="absolute inset-0 z-20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
            :style="{ '--tw-ring-color': 'var(--brand-primary)' } as never"
            :aria-label="`Abrir ações da notícia ${n.title}`"
            @click.stop="toggleMenu(n.id)"
          />

          <!-- Action menu (popover) -->
          <Transition name="news-menu">
            <div
              v-if="openMenuId === n.id"
              class="absolute inset-x-3 bottom-3 z-30 flex flex-col overflow-hidden rounded-lg shadow-lg"
              :style="{
                backgroundColor: 'var(--brand-surface)',
                border: `1px solid color-mix(in srgb, var(--brand-border) 60%, transparent)`,
              }"
            >
              <button
                type="button"
                class="news-menu-item flex items-center gap-2 px-3 py-2.5 text-left text-[13px] font-medium transition-colors"
                :style="{ color: 'var(--brand-text)' }"
                @click.stop="onAskImpact(n)"
              >
                <UIcon name="i-lucide-pie-chart" class="size-3.5" :style="{ color: 'var(--brand-primary)' }" />
                Impacto na minha carteira
              </button>
              <button
                type="button"
                class="news-menu-item flex items-center gap-2 px-3 py-2.5 text-left text-[13px] transition-colors"
                :style="{
                  color: 'var(--brand-text)',
                  borderTop: `1px solid color-mix(in srgb, var(--brand-border) 35%, transparent)`,
                }"
                @click.stop="onAskSummary(n)"
              >
                <UIcon name="i-lucide-file-text" class="size-3.5" :style="{ color: 'var(--brand-primary)' }" />
                Resumir notícia
              </button>
              <a
                :href="n.url"
                target="_blank"
                rel="noopener noreferrer"
                class="news-menu-item flex items-center gap-2 px-3 py-2.5 text-left text-[13px] transition-colors"
                :style="{
                  color: 'var(--brand-text-muted)',
                  borderTop: `1px solid color-mix(in srgb, var(--brand-border) 35%, transparent)`,
                }"
                @click.stop="closeMenu"
              >
                <UIcon name="i-lucide-external-link" class="size-3.5" />
                Abrir fonte original
              </a>
            </div>
          </Transition>
        </article>

        <!-- Trailing skeletons while a server fetch is in flight.
             Filling 3 grid cells keeps the rhythm intact during load. -->
        <template v-if="newsLoadingMore">
          <div
            v-for="i in 3"
            :key="`load-${i}`"
            class="aspect-[4/3] animate-pulse rounded-2xl"
            :style="{ backgroundColor: `color-mix(in srgb, var(--brand-text) 5%, transparent)` }"
            aria-label="Carregando mais notícias"
          />
        </template>
      </div>

      <!-- Sentinel — invisible observer target. When this enters the
           viewport (user scrolled to the bottom of the news grid), the
           IntersectionObserver fires and we reveal more cards / fetch
           the next page from the server. The 1px height keeps it from
           occupying visible space. -->
      <div
        v-if="!isExhausted && displayedItems.length > 0"
        ref="sentinelRef"
        class="news-sentinel h-px w-full"
        aria-hidden="true"
      />

      <!-- End-of-feed marker — quiet stop signal once everything is
           loaded. Centered, muted, dashed border — reads as resolution. -->
      <div
        v-if="isExhausted && displayedItems.length > 6"
        class="flex flex-col items-center justify-center gap-2 rounded-lg px-4 py-6 text-center"
        :style="{
          color: 'var(--brand-text-muted)',
          border: `1px dashed color-mix(in srgb, var(--brand-border) 45%, transparent)`,
        }"
        aria-label="Fim do feed"
      >
        <UIcon name="i-lucide-check-circle-2" class="size-4 opacity-60" aria-hidden="true" />
        <span class="font-mono-tab text-[10.5px] font-medium uppercase tracking-[0.16em]">Fim do feed</span>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="rounded-lg px-4 py-6 text-center text-[14px] font-light"
        :style="{
          color: 'var(--brand-text-muted)',
          border: `1px dashed color-mix(in srgb, var(--brand-border) 45%, transparent)`,
        }"
      >
        Sem notícias com tickers no feed agora.
      </div>
    </section>

    <!-- Footnote — minimal mode badge tucked at the very end so the
         feed reads as the main thing. Starter chips moved up next to
         the composer so they're visible without scrolling. -->
    <p
      class="text-center font-mono-tab text-[10.5px] font-medium uppercase tracking-[0.18em]"
      :style="{ color: `color-mix(in srgb, var(--brand-text-muted) 70%, transparent)` }"
    >
      <template v-if="tier === 'max'">Redentia MAX · análise rigorosa</template>
      <template v-else>Redentia Basic · Redentia MAX</template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useGoals } from '~/composables/useGoals'
import { useDecisions } from '~/composables/useDecisions'
import { useWatchlist } from '~/composables/useWatchlist'
import { useMemories } from '~/composables/useMemories'

const { getIndiceHistoricPrices, getTopStocks } = useAssetsService()

withDefaults(
  defineProps<{
    tier?: 'basic' | 'max'
  }>(),
  { tier: 'basic' },
)

const emit = defineEmits<{
  /**
   * Send a starter question to the chat. Optional `tier` hint forces
   * the chat to switch (e.g. ticker actions like "Análise completa"
   * are MAX-only because they trigger multi-tool research). When
   * omitted, the chat keeps whatever tier is currently selected.
   */
  start: [question: string, tier?: 'basic' | 'max']
  'open-goal': []
}>()

const authStore = useAuthStore()
const runtimeConfig = useRuntimeConfig()
const apiBase = runtimeConfig.public.apiBaseUrl as string

// ---- Greeting -------------------------------------------------------------
const greeting = computed(() => {
  const name = authStore.me?.name?.split(' ')[0] ?? null
  const hour = new Date().getHours()
  const salutation = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  return { salutation, name }
})

// ---- Card style (DRY) -----------------------------------------------------
// Stripe-style: amber-tinted shadow, 1px subtle border, 8px radius.
const cardStyle = computed(() => ({
  backgroundColor: 'var(--brand-surface)',
  border: `1px solid color-mix(in srgb, var(--brand-border) 40%, transparent)`,
  color: 'var(--brand-text)',
  boxShadow: `color-mix(in srgb, var(--brand-primary) 8%, transparent) 0px 18px 32px -22px, rgba(0,0,0,0.06) 0px 8px 16px -10px`,
}))

// ---- IBOV -----------------------------------------------------------------
interface IndicePoint {
  market_price: number | string
  price_at?: string
}

const ibovSeries = ref<IndicePoint[]>([])

onMounted(async () => {
  try {
    const data = await getIndiceHistoricPrices('ibov', '1mo')
    ibovSeries.value = Array.isArray(data) ? (data as IndicePoint[]) : []
  } catch {
    /* fail silent */
  }
})

const ibovDisplay = computed(() => {
  const series = ibovSeries.value
  if (series.length < 2) {
    return {
      value: '—',
      indicator: '0,00%',
      color: 'var(--brand-text-muted)' as string,
    }
  }
  const last = Number(series[series.length - 1]!.market_price)
  const prev = Number(series[series.length - 2]!.market_price)
  const variation = prev !== 0 ? ((last - prev) / prev) * 100 : 0
  const positive = variation > 0
  const negative = variation < 0
  return {
    value: new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(last),
    indicator: `${positive ? '+' : ''}${variation.toFixed(2)}%`,
    color: positive
      ? 'var(--brand-positive)'
      : negative
        ? 'var(--brand-negative)'
        : 'var(--brand-text-muted)',
  }
})

const SPARK_W = 100
const SPARK_H = 24
const ibovSpark = computed(() => {
  const series = ibovSeries.value
  if (series.length < 2) return { path: '' }
  const points = series.slice(-30).map((p) => Number(p.market_price))
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const step = SPARK_W / Math.max(1, points.length - 1)
  const path = points
    .map((p, i) => {
      const x = (i * step).toFixed(2)
      const y = (SPARK_H - ((p - min) / range) * SPARK_H).toFixed(2)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
  return { path }
})

// ---- Goal -----------------------------------------------------------------
const goalsState = useGoals()
onMounted(async () => {
  if (!goalsState.loaded.value) {
    try { await goalsState.refresh() } catch { /* silent */ }
  }
})

const activeGoal = computed(() => {
  const order: Record<string, number> = {
    on_track: 0,
    at_risk: 1,
    unfeasible: 2,
  }
  return [...goalsState.activeGoals.value]
    .filter((g) => g.status !== 'hit')
    .sort((a, b) => {
      const sa = order[a.status ?? ''] ?? 99
      const sb = order[b.status ?? ''] ?? 99
      if (sa !== sb) return sa - sb
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })[0] ?? null
})

const goalLabel = computed(() => {
  const g = activeGoal.value
  if (!g) return 'Meta'
  if (g.name && g.name.length <= 24) return g.name
  return 'Meta'
})

const goalDisplay = computed(() => {
  const g = activeGoal.value
  if (!g) {
    return {
      hasGoal: false as const,
      value: '—',
      percent: 0,
      color: 'var(--brand-text-muted)' as string,
    }
  }
  const target = Number(g.targetAmount)
  const current = Number(g.currentAmount)
  const percent = target > 0 ? Math.round((current / target) * 100) : 0
  const color = g.status === 'unfeasible'
    ? 'var(--brand-negative)'
    : g.status === 'at_risk'
      ? 'var(--brand-warning, var(--brand-primary))'
      : 'var(--brand-positive)'
  return {
    hasGoal: true as const,
    value: formatCompactBRL(target),
    percent,
    color,
  }
})

function onGoalClick() {
  if (activeGoal.value) {
    emit(
      'start',
      `Como tá minha meta "${activeGoal.value.name}"? Faça um diagnóstico do progresso e do que precisa pra fechar até a data alvo.`,
    )
  } else {
    emit('open-goal')
  }
}

// ---- Decisions ------------------------------------------------------------
const decisionsState = useDecisions()
onMounted(async () => {
  if (!decisionsState.loaded.value) {
    try { await decisionsState.refresh() } catch { /* silent */ }
  }
})
const decisionsCount = computed(() => decisionsState.pending.value.length)

// ---- Watchlists -----------------------------------------------------------
const watchState = useWatchlist()
onMounted(async () => {
  if (!watchState.loaded.value) {
    try { await watchState.refresh() } catch { /* silent */ }
  }
})
const watchlistsCount = computed(() => watchState.watches.value.length)

// ---- Ticker chips marquee ------------------------------------------------
// Tiny chip-style ticker strip below the stat cards. Reuses the existing
// asset service (`getTopStocks`) — same source the marketing home uses
// for its big carousel. Capped at 30 because the chips are small and the
// strip becomes meaningless beyond ~30 items on a single horizontal line.
interface TickerChipData {
  ticker: string
  change: number
  logo: string | null
}

const tickerChips = ref<TickerChipData[]>([])

// Fetched on mount (CSR). We tried `await useAsyncData` here for SSR-
// safety but the top-level await blocks the component on layouts that
// don't wrap us in Suspense — in `/help` (the chat page) that meant
// the dashboard simply didn't render. CSR-only is the right trade-off
// for a "live ticker" anyway: SSR data would be stale by the time it
// reaches the user.
onMounted(async () => {
  try {
    const data = await getTopStocks('top', 100000)
    tickerChips.value = (Array.isArray(data) ? data : [])
      .slice(0, 30)
      .map((a) => {
        // The asset list endpoint returns `ticker` (e.g. PETR4) and
        // `change_percent` (number). Some payloads expose `stock`
        // instead of `ticker`; fall through both.
        const sym = String(
          (a as { ticker?: string; stock?: string }).ticker ??
            (a as { stock?: string }).stock ??
            '',
        ).toUpperCase()
        const change =
          typeof a.change_percent === 'number'
            ? a.change_percent
            : typeof a.change === 'number'
              ? a.change
              : Number(a.change_percent ?? a.change ?? 0) || 0
        return {
          ticker: sym,
          change,
          logo: typeof a.logo === 'string' && a.logo.length > 0 ? a.logo : null,
        }
      })
      .filter((t) => !!t.ticker)
  } catch {
    tickerChips.value = []
  }
})

// Pause-on-hover state for the auto-marquee.
const marqueePaused = ref(false)

// Open ticker menu state. Keyed by chip index (looped list) so we can
// pinpoint exactly which on-screen chip has the menu — important
// because each ticker appears twice in the looped track and we don't
// want to flash menus on both copies. Also tracks the ticker symbol
// so the action handlers can reference it without re-resolving.
const openTickerMenu = ref<{ idx: number; ticker: string } | null>(null)

// The marquee freezes while a ticker menu is open. Otherwise the chip
// would slide out from under the popover mid-interaction.
const isMarqueePaused = computed(
  () => marqueePaused.value || openTickerMenu.value !== null,
)

// White-card chip style — solid surface + subtle border + amber-tinted
// lift shadow. Same family as the stat cards above so the marquee
// reads as a sibling row, not a separate ribbon.
const chipStyle = computed(() => ({
  backgroundColor: 'var(--brand-surface)',
  border: `1px solid color-mix(in srgb, var(--brand-border) 40%, transparent)`,
  boxShadow: `color-mix(in srgb, var(--brand-primary) 6%, transparent) 0px 6px 14px -10px, rgba(0,0,0,0.05) 0px 3px 8px -6px`,
}))

// Duplicate the chip list so the CSS keyframe can scroll the track from
// 0% → -50% (one full set's width) and loop seamlessly without a visible
// jump. Without doubling, the track snaps back to the start and reads
// as broken.
const tickerChipsLooped = computed<TickerChipData[]>(() => {
  const arr = tickerChips.value
  if (arr.length === 0) return []
  return [...arr, ...arr]
})

function formatChange(v: number): string {
  if (!Number.isFinite(v)) return '0,00%'
  const sign = v > 0 ? '+' : ''
  return `${sign}${v.toFixed(2).replace('.', ',')}%`
}
function changeColor(v: number): string {
  if (v > 0) return 'var(--brand-positive)'
  if (v < 0) return 'var(--brand-negative)'
  return 'var(--brand-text-muted)'
}

// ---- Portfolio composition (for exposure %) -------------------------------
const memState = useMemories()
onMounted(async () => {
  if (!memState.loaded.value) {
    try { await memState.refresh() } catch { /* silent */ }
  }
})

interface PortfolioWeights {
  byTicker: Record<string, number>
}

const portfolioWeights = computed<PortfolioWeights>(() => {
  const out: Record<string, number> = {}
  for (const m of memState.memories.value) {
    if (m.key !== 'carteira_atual_composicao') continue
    const v = m.value as unknown
    if (!v || typeof v !== 'object') continue
    const obj = v as Record<string, unknown>
    for (const cls of Object.values(obj)) {
      if (!cls || typeof cls !== 'object') continue
      const c = cls as { peso?: number; principais?: string[] }
      const classWeight = Number(c.peso ?? 0)
      const tickers = Array.isArray(c.principais) ? c.principais : []
      if (classWeight <= 0 || tickers.length === 0) continue
      const perTicker = classWeight / tickers.length
      for (const t of tickers) {
        const k = String(t).toUpperCase()
        out[k] = (out[k] ?? 0) + perTicker
      }
    }
  }
  return { byTicker: out }
})

// ---- News -----------------------------------------------------------------
interface NewsArticle {
  id: number
  source: string
  title: string
  url: string
  excerpt: string | null
  image_url: string | null
  author: string | null
  category: string | null
  tickers: string[]
  published_at: string
  scraped_at: string
}

const newsLoading = ref(false)
const newsLoadingMore = ref(false)
const newsArticles = ref<NewsArticle[]>([])
const failedImages = reactive<Record<number, boolean>>({})
const hasMoreOnServer = ref(true)
const visibleCount = ref(8) // progressive reveal — first batch shown
const PAGE_SIZE = 8

const SERVER_LATEST_LIMIT = 100 // max the /news/latest endpoint accepts
const SERVER_PAGE_LIMIT = 40    // batch size for offset-paginated /news

onMounted(async () => {
  newsLoading.value = true
  try {
    // First fetch: /news/latest is server-side ranked by published_at and
    // filters articles without tickers when `with_tickers=1`. Cap at 100
    // (Laravel max). Anything more comes from /news with offset.
    const resp = await $fetch<{ data: NewsArticle[] }>(`${apiBase}/news/latest`, {
      query: { limit: SERVER_LATEST_LIMIT, with_tickers: 1 },
    })
    newsArticles.value = resp?.data ?? []
    // If the first page didn't fill the cap, the server has nothing more.
    if (newsArticles.value.length < SERVER_LATEST_LIMIT) {
      hasMoreOnServer.value = false
    }
  } catch {
    newsArticles.value = []
  } finally {
    newsLoading.value = false
  }
})

/**
 * Load the next page from the server. Uses `/news` (index endpoint)
 * with offset = current articles count. Filters client-side for
 * `tickers.length > 0` since `/news` doesn't yet expose `with_tickers`
 * — the over-fetch is bounded by SERVER_PAGE_LIMIT.
 *
 * No-op when already loading or the server is exhausted.
 */
async function loadMoreFromServer(): Promise<void> {
  if (newsLoadingMore.value || !hasMoreOnServer.value) return
  newsLoadingMore.value = true
  try {
    const resp = await $fetch<{ data: NewsArticle[]; meta?: { returned?: number } }>(
      `${apiBase}/news`,
      { query: { limit: SERVER_PAGE_LIMIT, offset: newsArticles.value.length } },
    )
    const incoming = resp?.data ?? []
    const tickered = incoming.filter(
      (a) => Array.isArray(a.tickers) && a.tickers.length > 0,
    )
    // Dedupe by id so a server overlap doesn't duplicate cards.
    const knownIds = new Set(newsArticles.value.map((a) => a.id))
    const fresh = tickered.filter((a) => !knownIds.has(a.id))
    if (fresh.length > 0) newsArticles.value.push(...fresh)
    // Server exhausted when it returns less than a full page.
    if ((resp?.meta?.returned ?? incoming.length) < SERVER_PAGE_LIMIT) {
      hasMoreOnServer.value = false
    }
  } catch {
    /* silent — keep what we have */
  } finally {
    newsLoadingMore.value = false
  }
}

// All filtered + ranked news. No cap — we paginate via `visibleCount`.
// User-held tickers are scored higher so the first cards in view are
// the most relevant; everything else is recency-ordered.
const newsItems = computed<NewsArticle[]>(() => {
  const withTickers = newsArticles.value.filter(
    (a) => Array.isArray(a.tickers) && a.tickers.length > 0,
  )
  const userTickers = new Set(Object.keys(portfolioWeights.value.byTicker))
  const scored = withTickers.map((a) => {
    let score = 0
    for (const t of a.tickers) if (userTickers.has(t)) score += 10
    score += -new Date(a.published_at).getTime() / 1e10
    return { a, score }
  })
  scored.sort((x, y) => y.score - x.score)
  return scored.map((s) => s.a)
})

// What's actually rendered — sliced by progressive reveal cursor.
const displayedItems = computed<NewsArticle[]>(() =>
  newsItems.value.slice(0, visibleCount.value),
)

// "We've shown everything we can" — used to decide whether to show a
// trailing skeleton card while fetching more.
const isExhausted = computed(
  () => !hasMoreOnServer.value && visibleCount.value >= newsItems.value.length,
)

function primaryTicker(n: NewsArticle): string | null {
  if (!n.tickers || n.tickers.length === 0) return null
  const userTickers = portfolioWeights.value.byTicker
  for (const t of n.tickers) if (userTickers[t]) return t
  return n.tickers[0] ?? null
}

function exposureFor(n: NewsArticle): number | null {
  const t = primaryTicker(n)
  if (!t) return null
  const w = portfolioWeights.value.byTicker[t]
  return typeof w === 'number' && w > 0 ? w : null
}

// Impact heuristic — keyword density on title.
const HIGH_IMPACT_RE =
  /\b(crash|despenca|colapso|rebaixa|rebaixou|disparou|crise|venda massiva|ruptura|recess[aã]o|d[ií]vida|fraude|lucro recorde|colapsa)\b/i
const MED_IMPACT_RE =
  /\b(queda|caiu|recua|cai|alta|sobe|subiu|valoriza|desvaloriza|ganha|perde|acelera|esfria|reportou|anuncia|anunciou|fechou|pagar dividendo|jcp|relat[oó]rio)\b/i

function impactLabel(n: NewsArticle): string {
  if (HIGH_IMPACT_RE.test(n.title)) return 'Alto'
  if (MED_IMPACT_RE.test(n.title)) return 'Médio'
  return 'Baixo'
}
function impactColor(n: NewsArticle): string {
  const lvl = impactLabel(n)
  if (lvl === 'Alto') return 'var(--brand-negative, #ef4444)'
  if (lvl === 'Médio') return 'var(--brand-warning, var(--brand-primary))'
  return 'rgba(255, 255, 255, 0.85)'
}

// ---- Infinite scroll (vertical grid) -------------------------------------
// Strategy: an invisible sentinel div at the bottom of the news grid is
// observed via IntersectionObserver. When it intersects the dashboard's
// scroll viewport (i.e. the user reached the end of what's rendered),
// we (a) reveal more from the in-memory pool and (b) when the pool is
// nearly exhausted, fetch the next page from the server. Falls back to
// a manual scroll handler for browsers that lack IntersectionObserver.
const dashRef = ref<HTMLElement | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function tryLoadMore(): void {
  // Reveal more from local pool first (cheap, instant).
  if (visibleCount.value < newsItems.value.length) {
    visibleCount.value = Math.min(
      newsItems.value.length,
      visibleCount.value + PAGE_SIZE,
    )
  }
  // If the pool is almost exhausted, ask the server for the next batch.
  if (
    newsItems.value.length - visibleCount.value < PAGE_SIZE &&
    hasMoreOnServer.value
  ) {
    void loadMoreFromServer()
  }
}

/**
 * Fallback scroll listener on the dashboard's own scroll viewport.
 * IntersectionObserver handles the common case (sentinel enters view),
 * but when the dashboard is shorter than the screen the sentinel is
 * already visible and never "enters" — so we also poll on scroll.
 */
function onDashScroll(): void {
  const el = dashRef.value
  if (!el) return
  // Within 200px of the bottom?
  const remaining = el.scrollHeight - el.scrollTop - el.clientHeight
  if (remaining > 200) return
  tryLoadMore()
}

function setupObserver(): void {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return
  if (observer) observer.disconnect()
  const target = sentinelRef.value
  const root = dashRef.value
  if (!target || !root) return
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) tryLoadMore()
      }
    },
    {
      root,
      // Pre-trigger 240px before the sentinel actually shows up so the
      // next batch is waiting when the user reaches that point.
      rootMargin: '0px 0px 240px 0px',
      threshold: 0,
    },
  )
  observer.observe(target)
}

// Re-attach the observer whenever the sentinel ref changes (it gets
// re-mounted when the news list goes from empty → populated, or when
// it disappears at end-of-feed).
watch(sentinelRef, () => {
  void nextTick(() => setupObserver())
})

onMounted(() => {
  void nextTick(() => setupObserver())
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})

// ---- News action menu -----------------------------------------------------
const openMenuId = ref<number | null>(null)

function toggleMenu(id: number) {
  openMenuId.value = openMenuId.value === id ? null : id
}
function closeMenu() {
  openMenuId.value = null
}

function onAskImpact(n: NewsArticle) {
  closeMenu()
  const t = primaryTicker(n)
  const ctx = t ? `(${t}) ` : ''
  emit(
    'start',
    `Notícia: "${n.title}" ${ctx}— Qual o impacto na minha carteira? Considere a exposição atual e se preciso reagir.`,
  )
}

function onAskSummary(n: NewsArticle) {
  closeMenu()
  emit(
    'start',
    `Resuma a notícia "${n.title}" em 3 bullets: o que aconteceu, por que importa, e o que observar nos próximos dias.`,
  )
}

function onDocClick(ev: MouseEvent) {
  const target = ev.target as Element | null
  if (!target || !target.closest('.news-card')) closeMenu()
  // Same dismiss behavior for the ticker menu — click anywhere outside
  // a chip-wrap closes the popover. The handlers on the menu items
  // themselves use `@click.stop` so picking an option doesn't double-
  // dismiss.
  if (!target || !target.closest('.ticker-chip-wrap')) closeTickerMenu()
}
function onKey(ev: KeyboardEvent) {
  if (ev.key === 'Escape') {
    closeMenu()
    closeTickerMenu()
  }
}

// ---- Ticker chip menu actions --------------------------------------------
function toggleTickerMenu(idx: number, ticker: string) {
  if (openTickerMenu.value?.idx === idx) {
    openTickerMenu.value = null
  } else {
    openTickerMenu.value = { idx, ticker }
  }
}
function closeTickerMenu() {
  openTickerMenu.value = null
}

function onAskAnalysis(t: TickerChipData) {
  closeTickerMenu()
  // MAX-only: full multi-tool research (view_asset + dividend_history +
  // technical_analysis + macro_snapshot + search_news). Basic tier
  // would skip half of these, so we force MAX to make the answer
  // worth the user's click.
  emit(
    'start',
    `Faça uma análise completa de ${t.ticker}: fundamentos, gráfico recente, dividendos, contexto macro e tese atual.`,
    'max',
  )
}

function onAskPortfolioFit(t: TickerChipData) {
  closeTickerMenu()
  // MAX-only: needs to read carteira_atual_composicao memory + run
  // verify_asset_composition + portfolio_expected_return. Basic
  // doesn't load the full portfolio framework.
  emit(
    'start',
    `${t.ticker} faz sentido pra minha carteira hoje? Considere minha exposição atual e se traz papel novo ou redundante.`,
    'max',
  )
}

function onAddWatch(t: TickerChipData) {
  closeTickerMenu()
  emit(
    'start',
    `Adicione ${t.ticker} à minha watchlist com gatilho de queda 8% em 7 dias e me avise quando bater.`,
  )
}
onMounted(() => {
  if (typeof window !== 'undefined') {
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onKey)
  }
})
onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    document.removeEventListener('click', onDocClick)
    document.removeEventListener('keydown', onKey)
  }
})

// ---- Helpers --------------------------------------------------------------
function formatCompactBRL(value: number): string {
  if (!Number.isFinite(value) || value === 0) return 'R$ 0'
  const abs = Math.abs(value)
  if (abs >= 1e9) return `R$ ${(value / 1e9).toFixed(1).replace('.', ',')} bi`
  if (abs >= 1e6) return `R$ ${(value / 1e6).toFixed(1).replace('.', ',')} mi`
  if (abs >= 1e3) return `R$ ${(value / 1e3).toFixed(0)} mil`
  return `R$ ${value.toFixed(0)}`
}

function formatRelativeTime(iso: string): string {
  const ts = new Date(iso).getTime()
  if (!Number.isFinite(ts)) return ''
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `${min}min atrás`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h atrás`
  const d = Math.floor(h / 24)
  return `${d}d atrás`
}
</script>

<style scoped>
/* ---- Hero ------------------------------------------------------------- */
.hero-headline {
  /* Stripe-style: light weight + large size + tight tracking */
  font-feature-settings: 'tnum';
}

/* ---- Stat cards ------------------------------------------------------- */
.stat-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 45%, transparent) !important;
  background-color: color-mix(in srgb, var(--brand-primary) 4%, var(--brand-surface)) !important;
  transform: translateY(-1px);
  box-shadow:
    color-mix(in srgb, var(--brand-primary) 16%, transparent) 0px 24px 40px -22px,
    rgba(0, 0, 0, 0.08) 0px 12px 20px -10px !important;
}

/* ---- Ticker chips marquee --------------------------------------------- */
/* Edge fade horizontally via pseudo-elements (NOT mask-image) because
   mask applies to ALL descendants, which would hide the ticker action
   menu that bleeds below the band. Pseudo-elements paint OVER the
   chips at the edges without clipping anything outside the band's
   vertical bounds. */
.ticker-chips-band {
  overflow-x: hidden;          /* fallback */
  overflow-x: clip;            /* preferred — establishes a clipping
                                  context for X without forcing Y to auto */
  overflow-y: visible;
  /* The shadows on the chips spill above/below the band's content
     box. Padding-y gives them room without changing the visual gap. */
  padding-block: 6px;
}
/* When a chip menu is open, lift the entire band's stacking context
   above the news grid below. Without this, the band's overflow-x: clip
   creates a stacking context that traps the menu underneath later
   sibling elements regardless of inner z-index. */
.ticker-chips-band.is-menu-open {
  z-index: 50;
}
.ticker-chips-band::before,
.ticker-chips-band::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 36px;
  pointer-events: none;
  z-index: 2;
}
.ticker-chips-band::before {
  left: 0;
  background: linear-gradient(
    to right,
    var(--brand-background, #fff),
    transparent
  );
}
.ticker-chips-band::after {
  right: 0;
  background: linear-gradient(
    to left,
    var(--brand-background, #fff),
    transparent
  );
}

/* Auto-scroll marquee — loops because the track contains 2× the items
   and we translate by exactly half the track's width per cycle. */
.ticker-chips-track {
  animation: ticker-chips-scroll 60s linear infinite;
}
.ticker-chips-track.is-paused {
  animation-play-state: paused;
}
@keyframes ticker-chips-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@media (prefers-reduced-motion: reduce) {
  .ticker-chips-track { animation: none; }
}

.ticker-chip:hover,
.ticker-chip.is-active {
  border-color: color-mix(in srgb, var(--brand-primary) 55%, transparent) !important;
  background-color: color-mix(in srgb, var(--brand-primary) 6%, var(--brand-surface)) !important;
  box-shadow:
    color-mix(in srgb, var(--brand-primary) 18%, transparent) 0px 10px 22px -12px,
    rgba(0, 0, 0, 0.08) 0px 5px 12px -6px !important;
}

/* ---- News carousel ---------------------------------------------------- */
.news-strip {
  /* Hide scrollbar — keep scroll functionality */
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.news-strip::-webkit-scrollbar {
  display: none;
}

.news-card--normal {
  min-width: 280px;
  width: 280px;
}
.news-card--minimized {
  min-width: 160px;
  width: 160px;
}
@media (max-width: 640px) {
  .news-card--normal { min-width: 78vw; width: 78vw; }
  .news-card--minimized { min-width: 50vw; width: 50vw; }
}

.news-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 60%, transparent) !important;
  transform: translateY(-1px);
  box-shadow:
    color-mix(in srgb, var(--brand-primary) 18%, transparent) 0px 24px 40px -22px,
    rgba(0, 0, 0, 0.20) 0px 12px 20px -10px;
}

/* News overlay — dark gradient at rest for legibility, lighter on
   hover so the photograph reveals itself. The "lighter on engage"
   doubles as a click affordance (the user feels the card waking up).
   Two stops: bottom is always dark enough for the title text to read;
   top fades. The gradient softens on hover. */
.news-overlay {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.92) 0%,
    rgba(0, 0, 0, 0.55) 45%,
    rgba(0, 0, 0, 0.10) 100%
  );
}
.news-card:hover .news-overlay {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0.32) 45%,
    rgba(0, 0, 0, 0.02) 100%
  );
}

.news-arrow:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent) !important;
  background-color: color-mix(in srgb, var(--brand-primary) 8%, var(--brand-surface)) !important;
}

.news-menu-item:hover {
  background-color: color-mix(in srgb, var(--brand-primary) 8%, transparent) !important;
}

.news-menu-enter-active,
.news-menu-leave-active {
  transition: opacity 140ms ease, transform 140ms ease;
}
.news-menu-enter-from,
.news-menu-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (prefers-reduced-motion: reduce) {
  .stat-card:hover,
  .news-card:hover {
    transform: none;
  }
}
</style>

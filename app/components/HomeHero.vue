<template>
  <div>
    <!-- ========== HERO: RADIOGRAPH (Redentia v3 reposicionada) ========== -->
    <!-- Headline de RESULTADO + input de tickers embutido na primeira dobra
         + Redent Score demo card como visual. Foco em B2C self-directed.
         B2B sai pra paginas dedicadas (/whitelabel, /api-portal, /assessores). -->
    <HomeHeroRadiograph
      v-if="brand.hero.variant === 'radiograph'"
      :ibov-series="ibovSeries"
      :ibov-last-price="ibovLastPrice"
      :ibov-indicator="ibovIndicator"
      :ibov-variation-color="ibovVariationColor"
      :ifix-last-price="ifixLastPrice"
      :ifix-indicator="ifixIndicator"
    />

    <!-- ========== HERO: QUIET (Redentia v2 premium, lightness as luxury) ========== -->
    <!-- Mantida para tenants white-label que querem o manifesto generico
         "Investir com inteligencia". Redentia base migrou para 'radiograph'. -->
    <HomeHeroQuiet
      v-if="brand.hero.variant === 'quiet'"
      :ibov-series="ibovSeries"
      :ibov-last-price="ibovLastPrice"
      :ibov-indicator="ibovIndicator"
      :ibov-variation-color="ibovVariationColor"
      :ifix-last-price="ifixLastPrice"
      :ifix-indicator="ifixIndicator"
    />

    <!-- ========== HERO: TERMINAL (Redentia v2, Bloomberg-reimagined) ========== -->
    <section v-if="brand.hero.variant === 'terminal'"  class="relative overflow-hidden">
      <!-- Live market ticker, rendered only after mount so the scroll animation
           and fetch don't fight with SSR hydration. Reserved space kept the same
           to prevent layout shift. -->
      <div class="h-9 border-y" :style="{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-surface)' }">
        <AtomsMarketTicker v-if="isMounted" class="!border-0" />
      </div>

      <!-- Background depth: warm amber radial + faint grid + scanlines -->
      <div class="pointer-events-none absolute inset-0 top-9">
        <!-- Ambient amber glow from top-center -->
        <div class="absolute left-1/2 top-0 h-[540px] w-[900px] -translate-x-1/2 rounded-full blur-3xl opacity-60" :style="{ background: `radial-gradient(ellipse at center top, var(--brand-primary)33, transparent 60%)` }" />
        <!-- Terminal-style grid overlay (tight 32px grid) -->
        <div class="absolute inset-0 opacity-[0.04]" :style="{ backgroundImage: `linear-gradient(var(--brand-text) 1px, transparent 1px), linear-gradient(90deg, var(--brand-text) 1px, transparent 1px)`, backgroundSize: '32px 32px' }" />
        <!-- Horizontal scanlines (1px stripes), CRT texture -->
        <div class="absolute inset-0 opacity-30" :style="{ backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, var(--brand-text)04 2px, var(--brand-text)04 3px)` }" />
      </div>

      <div class="relative mx-auto max-w-6xl px-6 pb-20 pt-16 md:pb-28 md:pt-20">
        <!-- Terminal status line: [MARKET.LIVE] + timestamp + version -->
        <div class="mb-8 flex flex-wrap items-center justify-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.18em]">
          <span class="flex items-center gap-1.5" :style="{ color: 'var(--brand-primary)' }">
            <span class="relative flex size-1.5" aria-hidden="true">
              <span class="absolute inline-flex size-1.5 rounded-full opacity-75 motion-safe:animate-ping" :style="{ backgroundColor: 'var(--brand-primary)' }" />
              <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: 'var(--brand-primary)' }" />
            </span>
            <span translate="no">{{ brand.hero.badge }}</span>
          </span>
          <span :style="{ color: 'var(--brand-border)' }" aria-hidden="true">·</span>
          <span :style="{ color: 'var(--brand-text-muted)' }" translate="no">B3 · SESSÃO ABERTA</span>
          <span :style="{ color: 'var(--brand-border)' }" aria-hidden="true">·</span>
          <span :style="{ color: 'var(--brand-text-muted)' }" translate="no">REDENTIA v2.1</span>
        </div>

        <!-- Display serif headline, editorial scale, high contrast -->
        <h1
          class="font-display mx-auto mb-6 max-w-4xl text-center text-[56px] leading-[0.95] tracking-tight sm:text-[72px] md:text-[96px] lg:text-[120px]"
          :style="{ color: 'var(--brand-text)' }"
        >
          Investir com
          <span class="italic" :style="{ color: 'var(--brand-primary)' }">inteligência.</span>
        </h1>

        <!-- Subtitle: mono eyebrow feel -->
        <p
          class="mx-auto mb-10 max-w-2xl text-center text-sm leading-relaxed md:text-base"
          :style="{ color: 'var(--brand-text-muted)' }"
        >
          {{ brand.hero.subtitle }}
        </p>

        <!-- Replica of the floating QuickSearch pill. It's purely
             decorative — clicking it dispatches ⌘K which opens the
             real global search. We mirror the same visuals (rounded
             full, translucent surface, search icon, ⌘K kbd) so users
             learn what the floating pill is by recognising it here. -->
        <button
          type="button"
          class="qs-replica mx-auto flex w-full max-w-md items-center gap-2 rounded-full border px-4 py-3 text-left transition-[border-color,box-shadow,background-color] focus-visible:outline-none"
          :style="{
            borderColor: `color-mix(in srgb, var(--brand-border) 70%, transparent)`,
            backgroundColor: `color-mix(in srgb, var(--brand-surface) 85%, transparent)`,
            color: 'var(--brand-text)',
          }"
          aria-label="Abrir busca rápida"
          @click="openQuickSearch"
        >
          <UIcon
            name="i-lucide-search"
            class="size-4 shrink-0"
            :style="{ color: 'var(--brand-text-muted)' }"
            aria-hidden="true"
          />
          <span class="flex-1 truncate text-sm" :style="{ color: 'var(--brand-text-muted)' }">
            Buscar ativos
          </span>
          <kbd
            class="font-mono-tab inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] tabular-nums"
            :style="{
              borderColor: `color-mix(in srgb, var(--brand-border) 70%, transparent)`,
              color: 'var(--brand-text-muted)',
              backgroundColor: 'var(--brand-background)',
            }"
            aria-hidden="true"
          >
            <span>{{ shortcutModifier }}</span>
            <span>K</span>
          </kbd>
        </button>

      </div>
    </section>

    <!-- ========== HERO: SHOWTIME (Me Poupe!, TV show / pop magazine) ========== -->
    <section
      v-if="brand.hero.variant === 'showtime'"
      :style="{ backgroundColor: 'var(--brand-background)', color: 'var(--brand-text)' }"
      class="relative overflow-hidden"
    >
      <!-- Decorative background: yellow blob + dots -->
      <div class="pointer-events-none absolute inset-0">
        <div
          class="absolute -left-40 top-20 h-[520px] w-[520px] rounded-full blur-3xl opacity-25"
          :style="{ backgroundColor: 'var(--brand-primary)' }"
        />
        <div
          class="absolute right-0 top-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-20"
          :style="{ backgroundColor: 'var(--brand-neutral)' }"
        />
        <div
          class="absolute inset-0 opacity-[0.08]"
          :style="{
            backgroundImage: `radial-gradient(var(--brand-text) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }"
        />
      </div>

      <!-- TOP STRIP: "No ar" lower-third + date badge -->
      <div class="relative flex items-center justify-between gap-3 px-6 pt-6 md:px-10 md:pt-10">
        <span class="lower-third">
          {{ brand.hero.badge }}
        </span>
        <span
          class="font-showtime-label hidden sm:inline-block"
          :style="{ color: `var(--brand-text)99` }"
        >
          {{ showtimeDate }}
        </span>
      </div>

      <!-- HERO: headline + founder photo -->
      <div class="relative mx-auto max-w-6xl px-6 pb-10 pt-10 md:grid md:grid-cols-12 md:gap-8 md:px-10 md:pb-16 md:pt-16">
        <!-- Text column -->
        <div class="md:col-span-7">
          <h1
            class="font-showtime-display chunky-shadow"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(3rem, 7vw, 6rem)',
            }"
          >
            <template v-for="(line, idx) in brand.hero.title.split('\n')" :key="idx">
              <br v-if="idx > 0" />
              <span v-if="idx === brand.hero.title.split('\n').length - 1" :style="{ color: 'var(--brand-primary)' }">{{ line }}</span>
              <span v-else>{{ line }}</span>
            </template>
          </h1>

          <!-- Yellow scribble rule -->
          <div class="scribble-rule mt-8 max-w-xs" />

          <p
            class="font-showtime-body mt-6 max-w-xl"
            :style="{ color: `${brand.colors.text}E6`, fontSize: 'clamp(1rem, 1.4vw, 1.25rem)' }"
          >
            {{ brand.hero.subtitle }}
          </p>

          <!-- CTAs -->
          <div class="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
            <NuxtLink
              to="/auth/register"
              class="group relative inline-flex items-center gap-3 px-8 py-4 font-showtime-label transition-transform hover:-translate-y-0.5"
              :style="{
                backgroundColor: brand.colors.primary,
                color: brand.colors.background,
                borderRadius: '14px',
                boxShadow: `0 6px 0 ${brand.colors.secondary}, 0 16px 40px ${brand.colors.primary}55`,
              }"
            >
              <UIcon name="i-lucide-sparkles" class="size-4" />
              <span>{{ brand.hero.ctaLabel.toUpperCase() }}</span>
              <span class="transition-transform group-hover:translate-x-1">→</span>
            </NuxtLink>
            <NuxtLink
              to="/auth/login"
              class="font-showtime-body text-base underline underline-offset-4 transition-opacity hover:opacity-70"
              :style="{ color: `${brand.colors.text}CC`, textDecorationColor: brand.colors.primary }"
            >
              {{ brand.hero.ctaSecondaryLabel }}
            </NuxtLink>
          </div>

          <!-- Trust indicators as sticker-style chips -->
          <div class="mt-10 flex flex-wrap items-center gap-3">
            <div
              v-for="indicator in brand.hero.trustIndicators"
              :key="indicator"
              class="inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 font-showtime-label text-[10px]"
              :style="{
                borderColor: `${brand.colors.primary}70`,
                backgroundColor: `${brand.colors.primary}15`,
                color: brand.colors.text,
              }"
            >
              <span
                class="inline-block size-1.5 rounded-full"
                :style="{ backgroundColor: brand.colors.primary }"
              />
              {{ indicator }}
            </div>
          </div>
        </div>

        <!-- Photo column -->
        <div class="relative mt-10 flex items-center justify-center md:col-span-5 md:mt-0">
          <!-- Yellow circle backdrop -->
          <div
            class="absolute inset-0 m-auto aspect-square w-[86%] rounded-full"
            :style="{
              background: `radial-gradient(circle at 30% 30%, ${brand.colors.primary}, ${brand.colors.secondary})`,
              boxShadow: `0 20px 60px ${brand.colors.primary}55`,
            }"
          />
          <!-- Founder photo -->
          <NuxtImg
            v-if="brand.hero.image"
            :src="brand.hero.image"
            :alt="`${brand.founder?.name || 'Nathalia Arcuri'}, Me Poupe!`"
            width="420"
            height="520"
            loading="eager"
            fetchpriority="high"
            decoding="async"
            class="relative z-10 h-auto w-full max-w-[420px] object-contain"
          />

          <!-- Sticker: "NOVO!" rotated -->
          <span
            class="sticker-badge absolute right-2 top-4 z-20 text-xs"
            style="transform: rotate(12deg);"
          >
            NOVO!
          </span>

          <!-- Margarete mascot peeking from the side -->
          <NuxtImg
            src="/brand/mepoupe/margarete.svg"
            alt="Mascote Margarete"
            width="128"
            height="128"
            loading="eager"
            decoding="async"
            class="absolute -left-2 bottom-6 z-20 h-32 md:h-40"
            style="transform: rotate(-18deg);"
          />
        </div>
      </div>

      <!-- QUADRO 1, Elenco / Characters -->
      <div class="relative py-20 md:py-24" :style="{ backgroundColor: brand.colors.surface }">
        <div class="mx-auto max-w-6xl px-6 md:px-10">
          <div class="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span class="lower-third">QUADRO 01 · O ELENCO</span>
              <h2
                class="font-showtime-display mt-5"
                :style="{
                  color: brand.colors.text,
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                }"
              >
                A <span class="highlighter" :style="{ color: brand.colors.primary }">galera</span> que faz<br />
                o programa acontecer.
              </h2>
              <p class="font-showtime-body mt-4 max-w-xl text-base" :style="{ color: `${brand.colors.text}CC` }">
                Os personagens que viraram icônicos na comunidade Me Poupe!, alguns ajudam, outro (você sabe quem) só atrapalha.
              </p>
            </div>
          </div>

          <!-- Character cards in tilted frames -->
          <div class="grid gap-8 md:grid-cols-3">
            <div
              v-for="(char, idx) in showtimeCharacters"
              :key="char.name"
              class="showtime-frame relative overflow-visible rounded-[28px] p-6"
              :class="idx % 2 === 0 ? 'showtime-frame--tilt-left' : 'showtime-frame--tilt-right'"
              :style="{ backgroundColor: brand.colors.background }"
            >
              <div class="washi-tape" />

              <!-- Circular character icon -->
              <div
                class="mx-auto mb-4 flex size-24 items-center justify-center rounded-full"
                :style="{
                  background: `radial-gradient(circle at 30% 30%, ${brand.colors.primary}, ${brand.colors.secondary})`,
                  boxShadow: `0 8px 24px ${brand.colors.primary}55`,
                }"
              >
                <UIcon
                  :name="char.icon"
                  class="size-12"
                  :style="{ color: brand.colors.background }"
                />
              </div>

              <div class="text-center">
                <span class="font-showtime-label" :style="{ color: brand.colors.primary }">
                  {{ char.role }}
                </span>
                <h3
                  class="font-showtime-display mt-2"
                  :style="{ color: brand.colors.text, fontSize: '2rem' }"
                >
                  {{ char.name }}
                </h3>
                <p
                  class="font-showtime-body mt-3 italic"
                  :style="{ color: `${brand.colors.text}B3`, fontSize: '14px' }"
                >
                  "{{ char.quote }}"
                </p>
                <p class="font-showtime-body mt-4 text-sm" :style="{ color: `${brand.colors.text}CC` }">
                  {{ char.body }}
                </p>
                <NuxtLink
                  to="/help"
                  class="mt-5 inline-flex items-center gap-1 font-showtime-label transition-transform hover:translate-x-1"
                  :style="{ color: brand.colors.primary }"
                >
                  {{ char.cta }} →
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- QUADRO 2, Na_th IA -->
      <div class="relative py-20 md:py-24">
        <div class="mx-auto max-w-6xl px-6 md:grid md:grid-cols-12 md:gap-10 md:px-10">
          <div class="md:col-span-5">
            <span class="lower-third">QUADRO 02 · PERGUNTE A NATH</span>
            <h2
              class="font-showtime-display mt-5"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
              }"
            >
              Pergunta sem medo,<br />
              <span class="highlighter" :style="{ color: brand.colors.primary }">criatura!</span>
            </h2>
            <p class="font-showtime-body mt-6 text-base" :style="{ color: `${brand.colors.text}CC` }">
              A <strong :style="{ color: brand.colors.primary }">Na_th IA</strong> responde qualquer dúvida sobre dinheiro como sua melhor amiga explicaria. Sem jargão, sem julgamento, sem cara feia. E fica disponível 24h, até de madrugada, quando bate aquela crise existencial sobre o boleto.
            </p>
            <div class="mt-8 flex flex-wrap items-center gap-3">
              <div
                class="inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 font-showtime-label text-[10px]"
                :style="{
                  borderColor: `${brand.colors.primary}70`,
                  backgroundColor: `${brand.colors.primary}15`,
                  color: brand.colors.text,
                }"
              >
                ⚡ RESPOSTA EM ~3s
              </div>
              <div
                class="inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 font-showtime-label text-[10px]"
                :style="{
                  borderColor: `${brand.colors.primary}70`,
                  backgroundColor: `${brand.colors.primary}15`,
                  color: brand.colors.text,
                }"
              >
                💛 SEM JULGAMENTO
              </div>
              <div
                class="inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 font-showtime-label text-[10px]"
                :style="{
                  borderColor: `${brand.colors.primary}70`,
                  backgroundColor: `${brand.colors.primary}15`,
                  color: brand.colors.text,
                }"
              >
                ∞ ILIMITADO
              </div>
            </div>
          </div>

          <div class="mt-10 md:col-span-6 md:col-start-7 md:mt-0">
            <div class="flex flex-col gap-4">
              <NuxtLink
                v-for="(q, idx) in showtimeQuestions"
                :key="q.text"
                to="/help"
                class="showtime-frame relative flex cursor-pointer items-start gap-3 rounded-2xl p-5 transition-transform hover:-translate-y-1"
                :class="idx % 2 === 0 ? 'showtime-frame--tilt-left' : 'showtime-frame--tilt-right'"
                :style="{ backgroundColor: brand.colors.surface }"
              >
                <span
                  class="flex size-10 shrink-0 items-center justify-center rounded-xl"
                  :style="{
                    backgroundColor: `${brand.colors.primary}25`,
                    color: brand.colors.primary,
                  }"
                >
                  <UIcon :name="q.icon" class="size-5" />
                </span>
                <span class="flex min-w-0 flex-1 flex-col">
                  <span
                    class="font-showtime-label"
                    :style="{ color: `${brand.colors.text}80` }"
                  >
                    {{ q.category }}
                  </span>
                  <span
                    class="font-showtime-body mt-1 text-base font-semibold"
                    :style="{ color: brand.colors.text }"
                  >
                    {{ q.text }}
                  </span>
                </span>
                <span class="font-showtime-label" :style="{ color: brand.colors.primary }">
                  →
                </span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Wooden spoon divider -->
      <div class="flex items-center justify-center gap-6 py-6" :style="{ backgroundColor: brand.colors.surface }">
        <div
          class="h-[2px] max-w-[180px] flex-1"
          :style="{ backgroundColor: `${brand.colors.primary}55` }"
        />
        <NuxtImg
          src="/brand/mepoupe/margarete.svg"
          alt="Margarete"
          class="h-16"
          style="transform: rotate(90deg);"
        />
        <div
          class="h-[2px] max-w-[180px] flex-1"
          :style="{ backgroundColor: `${brand.colors.primary}55` }"
        />
      </div>

      <!-- QUADRO 3, O Placar da Bolsa (Rankings) -->
      <div class="relative overflow-hidden py-20 md:py-24">
        <!-- Confetti dots background -->
        <div class="pointer-events-none absolute inset-0 opacity-20">
          <div class="absolute left-[8%] top-[12%] size-3 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
          <div class="absolute left-[18%] top-[34%] size-2 rounded-full" :style="{ backgroundColor: brand.colors.secondary }" />
          <div class="absolute left-[85%] top-[20%] size-4 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
          <div class="absolute left-[72%] top-[60%] size-2 rounded-full" :style="{ backgroundColor: brand.colors.positive }" />
          <div class="absolute left-[30%] top-[82%] size-3 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
          <div class="absolute left-[90%] top-[88%] size-2 rounded-full" :style="{ backgroundColor: brand.colors.secondary }" />
        </div>

        <div class="relative mx-auto max-w-6xl px-6 md:px-10">
          <div class="mb-12 text-center">
            <span class="lower-third">QUADRO 03 · O PLACAR DA BOLSA</span>
            <h2
              class="font-showtime-display mt-5"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              }"
            >
              Quem tá bombando<br />
              <span class="highlighter" :style="{ color: brand.colors.primary }">e quem tá tomando chá de sumiço</span>
            </h2>
            <p class="font-showtime-body mx-auto mt-6 max-w-2xl text-base" :style="{ color: `${brand.colors.text}CC` }">
              Nem todo dia é dia de festa, criatura. Mas saber o que subiu e o que desceu é o primeiro passo pra entender o mercado, sem entrar em pânico.
            </p>
          </div>

          <div class="grid gap-8 md:grid-cols-2">
            <!-- As Queridinhas (gainers) -->
            <div
              class="showtime-frame showtime-frame--tilt-left relative rounded-[28px] p-6"
              :style="{ backgroundColor: brand.colors.surface }"
            >
              <div class="washi-tape" />
              <div class="mb-5 flex items-center gap-3">
                <div
                  class="flex size-12 items-center justify-center rounded-full text-2xl"
                  :style="{ backgroundColor: `${brand.colors.positive}25` }"
                >
                  🚀
                </div>
                <div>
                  <span class="font-showtime-label" :style="{ color: brand.colors.positive }">
                    AS QUERIDINHAS DE HOJE
                  </span>
                  <h3
                    class="font-showtime-display"
                    :style="{ color: brand.colors.text, fontSize: '1.5rem' }"
                  >
                    Subiram mais
                  </h3>
                </div>
              </div>

              <ul class="flex flex-col gap-3">
                <li
                  v-for="(row, idx) in showtimeGainers"
                  :key="`gain-${row.ticker}`"
                  class="flex items-center gap-3 rounded-2xl p-3 transition-transform hover:translate-x-1"
                  :style="{ backgroundColor: brand.colors.background }"
                >
                  <span
                    class="flex size-7 shrink-0 items-center justify-center rounded-full font-showtime-label text-[11px]"
                    :style="{ backgroundColor: `${brand.colors.primary}25`, color: brand.colors.primary }"
                  >
                    {{ idx + 1 }}
                  </span>
                  <div class="min-w-0 flex-1">
                    <div
                      class="font-showtime-body truncate text-base font-bold"
                      :style="{ color: brand.colors.text }"
                    >
                      {{ row.ticker }}
                    </div>
                    <div
                      class="font-showtime-body truncate text-[11px]"
                      :style="{ color: `${brand.colors.text}80` }"
                    >
                      {{ row.name || '-' }}
                    </div>
                  </div>
                  <span
                    class="font-showtime-label shrink-0 rounded-full px-3 py-1 text-[11px]"
                    :style="{
                      backgroundColor: `${brand.colors.positive}20`,
                      color: brand.colors.positive,
                    }"
                  >
                    +{{ row.change.toFixed(2) }}%
                  </span>
                </li>
              </ul>

              <NuxtLink
                to="/ranking/maiores-altas-mes"
                class="mt-5 inline-flex items-center gap-1 font-showtime-label"
                :style="{ color: brand.colors.primary }"
              >
                Ver o ranking completo →
              </NuxtLink>
            </div>

            <!-- As Chatas (losers) -->
            <div
              class="showtime-frame showtime-frame--tilt-right relative rounded-[28px] p-6"
              :style="{ backgroundColor: brand.colors.surface }"
            >
              <div class="washi-tape" />
              <div class="mb-5 flex items-center gap-3">
                <div
                  class="flex size-12 items-center justify-center rounded-full text-2xl"
                  :style="{ backgroundColor: `${brand.colors.negative}25` }"
                >
                  😬
                </div>
                <div>
                  <span class="font-showtime-label" :style="{ color: brand.colors.negative }">
                    CAIU FEIO HOJE
                  </span>
                  <h3
                    class="font-showtime-display"
                    :style="{ color: brand.colors.text, fontSize: '1.5rem' }"
                  >
                    Caíram mais
                  </h3>
                </div>
              </div>

              <ul class="flex flex-col gap-3">
                <li
                  v-for="(row, idx) in showtimeLosers"
                  :key="`lose-${row.ticker}`"
                  class="flex items-center gap-3 rounded-2xl p-3 transition-transform hover:translate-x-1"
                  :style="{ backgroundColor: brand.colors.background }"
                >
                  <span
                    class="flex size-7 shrink-0 items-center justify-center rounded-full font-showtime-label text-[11px]"
                    :style="{ backgroundColor: `${brand.colors.primary}25`, color: brand.colors.primary }"
                  >
                    {{ idx + 1 }}
                  </span>
                  <div class="min-w-0 flex-1">
                    <div
                      class="font-showtime-body truncate text-base font-bold"
                      :style="{ color: brand.colors.text }"
                    >
                      {{ row.ticker }}
                    </div>
                    <div
                      class="font-showtime-body truncate text-[11px]"
                      :style="{ color: `${brand.colors.text}80` }"
                    >
                      {{ row.name || '-' }}
                    </div>
                  </div>
                  <span
                    class="font-showtime-label shrink-0 rounded-full px-3 py-1 text-[11px]"
                    :style="{
                      backgroundColor: `${brand.colors.negative}20`,
                      color: brand.colors.negative,
                    }"
                  >
                    {{ row.change.toFixed(2) }}%
                  </span>
                </li>
              </ul>

              <NuxtLink
                to="/ranking/maiores-baixas-mes"
                class="mt-5 inline-flex items-center gap-1 font-showtime-label"
                :style="{ color: brand.colors.primary }"
              >
                Ver o ranking completo →
              </NuxtLink>
            </div>
          </div>

          <!-- Margarete comment strip below rankings -->
          <div
            class="mt-10 flex items-start gap-4 rounded-3xl border-2 border-dashed p-5"
            :style="{
              borderColor: `${brand.colors.primary}60`,
              backgroundColor: `${brand.colors.primary}10`,
            }"
          >
            <NuxtImg src="/brand/mepoupe/margarete.svg" alt="" role="presentation" width="56" height="56" loading="lazy" decoding="async" class="h-14 shrink-0" />
            <p class="font-showtime-body text-sm italic" :style="{ color: `${brand.colors.text}CC` }">
              <strong :style="{ color: brand.colors.primary }">Margarete diz:</strong>
              subiu muito? Respira. Caiu muito? Respira de novo. Investir não é torcer pra time de futebol, criatura, é uma maratona de 20 anos. O importante é continuar aportando todo mês.
            </p>
          </div>
        </div>
      </div>

      <!-- QUADRO 4, Histórias reais -->
      <div class="relative py-20 md:py-24" :style="{ backgroundColor: brand.colors.surface }">
        <div class="mx-auto max-w-6xl px-6 md:px-10">
          <div class="mb-12">
            <span class="lower-third">QUADRO 04 · HISTÓRIAS REAIS</span>
            <h2
              class="font-showtime-display mt-5"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              }"
            >
              Gente igual a você que<br />
              <span class="highlighter" :style="{ color: brand.colors.primary }">dominou o próprio dinheiro.</span>
            </h2>
          </div>

          <div class="grid gap-8 md:grid-cols-3">
            <div
              v-for="(story, idx) in showtimeStories"
              :key="story.name"
              class="showtime-frame rounded-[24px] p-6"
              :class="idx === 1 ? 'showtime-frame--tilt-right' : 'showtime-frame--tilt-left'"
              :style="{ backgroundColor: brand.colors.background }"
            >
              <p
                class="font-showtime-body text-base italic leading-relaxed"
                :style="{ color: `${brand.colors.text}E6` }"
              >
                "{{ story.quote }}"
              </p>
              <div class="mt-6 grid grid-cols-2 gap-4 border-t pt-4" :style="{ borderColor: `${brand.colors.text}15` }">
                <div v-for="stat in story.stats" :key="stat.label" class="flex flex-col">
                  <span
                    class="font-showtime-display"
                    :style="{ color: brand.colors.primary, fontSize: '1.75rem' }"
                  >
                    {{ stat.value }}
                  </span>
                  <span
                    class="font-showtime-body text-[11px]"
                    :style="{ color: `${brand.colors.text}80` }"
                  >
                    {{ stat.label }}
                  </span>
                </div>
              </div>
              <div class="mt-5 flex items-center gap-3">
                <div
                  class="flex size-10 items-center justify-center rounded-full font-showtime-label"
                  :style="{
                    backgroundColor: brand.colors.primary,
                    color: brand.colors.background,
                  }"
                >
                  {{ story.initials }}
                </div>
                <div class="flex flex-col">
                  <span
                    class="font-showtime-body text-sm font-semibold"
                    :style="{ color: brand.colors.text }"
                  >
                    {{ story.name }}
                  </span>
                  <span
                    class="font-showtime-body text-[11px]"
                    :style="{ color: `${brand.colors.text}80` }"
                  >
                    {{ story.role }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CLOSING BUMPER -->
      <div class="relative py-24 md:py-32">
        <div class="mx-auto max-w-4xl px-6 text-center md:px-10">
          <span class="lower-third">FIM DO PROGRAMA · ATÉ O PRÓXIMO!</span>
          <h2
            class="font-showtime-display chunky-shadow mt-8"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(3rem, 8vw, 7rem)',
            }"
          >
            BORA COMEÇAR,<br />
            <span :style="{ color: brand.colors.primary }">CRIATURA?</span>
          </h2>
          <p
            class="font-showtime-body mt-8 text-lg italic"
            :style="{ color: `${brand.colors.text}CC` }"
          >
            "{{ brand.hero.founderQuote }}"
          </p>
          <p class="font-showtime-label mt-2" :style="{ color: `${brand.colors.text}80` }">
           , {{ brand.founder?.name || 'NATHALIA ARCURI' }}
          </p>

          <div class="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <NuxtLink
              to="/auth/register"
              class="group relative inline-flex items-center gap-3 px-10 py-5 font-showtime-label transition-transform hover:-translate-y-0.5"
              :style="{
                backgroundColor: brand.colors.primary,
                color: brand.colors.background,
                borderRadius: '16px',
                fontSize: '13px',
                boxShadow: `0 6px 0 ${brand.colors.secondary}, 0 20px 50px ${brand.colors.primary}60`,
              }"
            >
              <UIcon name="i-lucide-sparkles" class="size-4" />
              <span>CRIAR MINHA CONTA</span>
              <span class="transition-transform group-hover:translate-x-1">→</span>
            </NuxtLink>
            <span
              class="font-showtime-label"
              :style="{ color: `${brand.colors.text}66` }"
            >
              GRÁTIS · SEM CARTÃO · SEM SIDNELSON
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== HERO: SPLIT (Me Poupe, energetico, personalidade, pop) ========== -->
    <section v-if="brand.hero.variant === 'split'"  class="relative overflow-hidden">
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
            <NuxtImg
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
              <span class="not-italic" :style="{ color: `${brand.colors.text}4D` }">, {{ brand.founder.name }}</span>
            </p>

            <!-- CTAs lado a lado, pill shape -->
            <div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <UButton to="/auth/register" color="secondary" size="xl" :icon="brand.hero.ctaIcon" class="group px-8 transition-[transform,opacity,box-shadow,background-color,border-color] duration-200 hover:scale-105">
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

    <!-- ========== HERO: RESEARCH (Investidor Sardinha, AUVP data-heavy analyst desk) ========== -->
    <section
      v-if="brand.hero.variant === 'research'"
      :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
      class="relative"
    >
      <!-- Paper masthead -->
      <div class="border-b" :style="{ borderColor: brand.colors.border }">
        <div class="mx-auto flex max-w-6xl items-start justify-between gap-6 px-6 pt-10 md:px-10 md:pt-12">
          <div class="flex flex-col gap-0.5">
            <span class="font-academic-label" :style="{ color: brand.colors.primary }">
              {{ brand.hero.badge }}
            </span>
            <span class="font-academic-body text-[12px] italic" :style="{ color: brand.colors.textMuted }">
              {{ researchDate }}
            </span>
          </div>
          <span class="font-academic-mono text-[11px] uppercase tabular-nums" :style="{ color: brand.colors.textMuted }">
            B3 · BOLSA DE VALORES DE SÃO PAULO
          </span>
        </div>
      </div>

      <!-- Cover block: compact title + key market numbers on the right -->
      <div class="mx-auto max-w-6xl px-6 py-14 md:grid md:grid-cols-12 md:gap-10 md:px-10 md:py-20">
        <div class="md:col-span-7">
          <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">
            mesa de análise AUVP
          </span>
          <h1
            class="font-academic-display mt-6"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(2.75rem, 5.5vw, 4.75rem)',
            }"
          >
            <template v-for="(line, idx) in brand.hero.title.split('\n')" :key="idx">
              <br v-if="idx > 0" />
              <span v-if="idx === 1" class="italic" :style="{ color: brand.colors.primary }">{{ line }}</span>
              <span v-else>{{ line }}</span>
            </template>
          </h1>
          <p class="font-academic-body mt-6 max-w-xl" :style="{ color: brand.colors.text, fontSize: '16px' }">
            <span class="red-pen">Os dados abaixo não são opinião.</span> São o que a mesa olhou hoje. Se quiser o método por trás de cada leitura, o caminho é a <span class="red-pen-underline">AUVP Escola</span>.
          </p>
          <div class="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <NuxtLink
              to="/auth/register"
              class="group inline-flex items-center gap-3 border-2 px-5 py-2.5 font-academic-label transition-colors"
              :style="{
                backgroundColor: brand.colors.primary,
                color: brand.colors.background,
                borderColor: brand.colors.primary,
              }"
            >
              <span>{{ brand.hero.ctaLabel.toUpperCase() }}</span>
              <span>→</span>
            </NuxtLink>
            <a
              href="https://auvp.com.br"
              target="_blank"
              rel="noopener noreferrer"
              class="font-academic-body text-base italic transition-opacity hover:opacity-70"
              :style="{ color: brand.colors.text }"
            >
              Conhecer a AUVP Escola <span :style="{ color: brand.colors.primary }">→</span>
            </a>
          </div>
        </div>

        <!-- Right: market key figures as a compact paper panel -->
        <div class="mt-10 md:col-span-5 md:mt-0">
          <div
            class="border p-6"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
          >
            <div class="flex items-start justify-between">
              <span class="font-academic-label" :style="{ color: brand.colors.primary }">
                Panorama do pregão
              </span>
              <span class="font-academic-mono text-[10px] uppercase tabular-nums" :style="{ color: brand.colors.textMuted }">
                {{ researchDate }}
              </span>
            </div>
            <dl class="mt-6 flex flex-col divide-y" :style="{ borderColor: brand.colors.border }">
              <div
                v-for="row in researchHeroMarket"
                :key="row.label"
                class="flex items-baseline justify-between py-3"
                :style="{ borderColor: brand.colors.border }"
              >
                <dt class="flex flex-col">
                  <span class="font-academic-display text-[15px]" :style="{ color: brand.colors.text }">
                    {{ row.label }}
                  </span>
                  <span class="font-academic-body text-[11px] italic" :style="{ color: brand.colors.textMuted }">
                    {{ row.note }}
                  </span>
                </dt>
                <dd class="text-right">
                  <span class="font-academic-display tabular-nums text-xl" :style="{ color: brand.colors.text }">
                    {{ row.value }}
                  </span>
                  <br />
                  <span
                    class="font-academic-mono text-[11px] tabular-nums"
                    :style="{ color: (row.changePct || 0) >= 0 ? brand.colors.positive : brand.colors.primary }"
                  >
                    {{ (row.changePct || 0) >= 0 ? '+' : '' }}{{ (row.changePct || 0).toFixed(2).replace('.', ',') }}%
                  </span>
                </dd>
              </div>
            </dl>
            <p class="font-academic-body mt-5 text-[11px] italic" :style="{ color: brand.colors.textMuted }">
              Dados de fechamento do último pregão. Atualização diária às 19h.
            </p>
          </div>
        </div>
      </div>

      <hr class="dashed-rule mx-auto max-w-6xl" />

      <!-- §1 Radar do dia: top 10 altas + baixas -->
      <div class="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
        <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span class="font-academic-label" :style="{ color: brand.colors.primary }">
              §1 · Radar do pregão
            </span>
            <h2 class="font-academic-display mt-2 text-3xl md:text-4xl" :style="{ color: brand.colors.text }">
              Quem subiu, quem caiu
            </h2>
            <p class="font-academic-body mt-3 max-w-2xl text-[13px] italic" :style="{ color: brand.colors.textMuted }">
              Movimentos do último pregão. Esta é a <span class="red-pen">leitura do radar</span>, não uma recomendação, variações de curto prazo rara­mente alteram uma tese de longo prazo.<sup class="footnote-marker">¹</sup>
            </p>
          </div>
          <NuxtLink
            to="/acoes"
            class="font-academic-body text-[13px] italic transition-opacity hover:opacity-70"
            :style="{ color: brand.colors.text }"
          >
            Ver todas as ações <span :style="{ color: brand.colors.primary }">→</span>
          </NuxtLink>
        </div>

        <div class="grid gap-10 md:grid-cols-2">
          <!-- Top altas -->
          <div>
            <div class="mb-3 flex items-baseline justify-between">
              <span class="font-academic-label" :style="{ color: brand.colors.text }">
                ↗ Maiores altas
              </span>
              <span class="font-academic-mono text-[11px] tabular-nums" :style="{ color: brand.colors.textMuted }">
                TOP 10
              </span>
            </div>
            <table class="w-full border-t font-academic-body text-[13px]" :style="{ borderColor: brand.colors.text }">
              <thead>
                <tr class="border-b" :style="{ borderColor: brand.colors.border }">
                  <th class="font-academic-label py-2 text-left" :style="{ color: brand.colors.textMuted }">§</th>
                  <th class="font-academic-label py-2 text-left" :style="{ color: brand.colors.textMuted }">Ticker</th>
                  <th class="font-academic-label py-2 text-right" :style="{ color: brand.colors.textMuted }">Preço</th>
                  <th class="font-academic-label py-2 text-right" :style="{ color: brand.colors.textMuted }">Δ</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, idx) in researchTopGainers"
                  :key="`up-${row.ticker}`"
                  class="border-b"
                  :style="{ borderColor: brand.colors.border }"
                >
                  <td class="py-2.5 pr-2">
                    <span class="font-academic-mono text-[11px] tabular-nums" :style="{ color: brand.colors.textMuted }">
                      {{ String(idx + 1).padStart(2, '0') }}
                    </span>
                  </td>
                  <td class="py-2.5">
                    <NuxtLink
                      :to="`/asset/${row.ticker.toLowerCase()}`"
                      class="flex flex-col"
                    >
                      <span class="font-academic-display text-[15px]" :style="{ color: brand.colors.text }">
                        {{ row.ticker }}
                      </span>
                      <span v-if="row.name" class="font-academic-body truncate text-[11px] italic" :style="{ color: brand.colors.textMuted }">
                        {{ row.name }}
                      </span>
                    </NuxtLink>
                  </td>
                  <td class="py-2.5 text-right">
                    <span class="font-academic-mono tabular-nums" :style="{ color: brand.colors.text }">
                      {{ formatSardinhaPrice(row.price) }}
                    </span>
                  </td>
                  <td class="py-2.5 text-right">
                    <span class="font-academic-mono tabular-nums" :style="{ color: brand.colors.positive }">
                      +{{ Number(row.change || 0).toFixed(2).replace('.', ',') }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Top baixas -->
          <div>
            <div class="mb-3 flex items-baseline justify-between">
              <span class="font-academic-label" :style="{ color: brand.colors.text }">
                ↘ Maiores baixas
              </span>
              <span class="font-academic-mono text-[11px] tabular-nums" :style="{ color: brand.colors.textMuted }">
                TOP 10
              </span>
            </div>
            <table class="w-full border-t font-academic-body text-[13px]" :style="{ borderColor: brand.colors.text }">
              <thead>
                <tr class="border-b" :style="{ borderColor: brand.colors.border }">
                  <th class="font-academic-label py-2 text-left" :style="{ color: brand.colors.textMuted }">§</th>
                  <th class="font-academic-label py-2 text-left" :style="{ color: brand.colors.textMuted }">Ticker</th>
                  <th class="font-academic-label py-2 text-right" :style="{ color: brand.colors.textMuted }">Preço</th>
                  <th class="font-academic-label py-2 text-right" :style="{ color: brand.colors.textMuted }">Δ</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, idx) in researchTopLosers"
                  :key="`down-${row.ticker}`"
                  class="border-b"
                  :style="{ borderColor: brand.colors.border }"
                >
                  <td class="py-2.5 pr-2">
                    <span class="font-academic-mono text-[11px] tabular-nums" :style="{ color: brand.colors.textMuted }">
                      {{ String(idx + 1).padStart(2, '0') }}
                    </span>
                  </td>
                  <td class="py-2.5">
                    <NuxtLink
                      :to="`/asset/${row.ticker.toLowerCase()}`"
                      class="flex flex-col"
                    >
                      <span class="font-academic-display text-[15px]" :style="{ color: brand.colors.text }">
                        {{ row.ticker }}
                      </span>
                      <span v-if="row.name" class="font-academic-body truncate text-[11px] italic" :style="{ color: brand.colors.textMuted }">
                        {{ row.name }}
                      </span>
                    </NuxtLink>
                  </td>
                  <td class="py-2.5 text-right">
                    <span class="font-academic-mono tabular-nums" :style="{ color: brand.colors.text }">
                      {{ formatSardinhaPrice(row.price) }}
                    </span>
                  </td>
                  <td class="py-2.5 text-right">
                    <span class="font-academic-mono tabular-nums" :style="{ color: brand.colors.primary }">
                      {{ Number(row.change || 0).toFixed(2).replace('.', ',') }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <hr class="dashed-rule mx-auto max-w-6xl" />

      <!-- §2 Screener fundamentalista AUVP -->
      <div
        class="py-16 md:py-20"
        :style="{ backgroundColor: brand.colors.surface }"
      >
        <div class="mx-auto max-w-6xl px-6 md:px-10">
          <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span class="font-academic-label" :style="{ color: brand.colors.primary }">
                §2 · Screener fundamentalista
              </span>
              <h2 class="font-academic-display mt-2 text-3xl md:text-4xl" :style="{ color: brand.colors.text }">
                O que passa no filtro AUVP
              </h2>
              <p class="font-academic-body mt-3 max-w-2xl text-[13px] italic" :style="{ color: brand.colors.textMuted }">
                Ações que atravessaram os <span class="red-pen">quatro filtros do método</span>: ROE ≥ 10%, margem líquida ≥ 10%, dívida sob controle e múltiplo razoável.<sup class="footnote-marker">²</sup>
              </p>
            </div>
            <NuxtLink
              to="/ranking/maiores-dividend-yield"
              class="font-academic-body text-[13px] italic transition-opacity hover:opacity-70"
              :style="{ color: brand.colors.text }"
            >
              Expandir screener <span :style="{ color: brand.colors.primary }">→</span>
            </NuxtLink>
          </div>

          <table class="w-full border-t font-academic-body text-[13px]" :style="{ borderColor: brand.colors.text }">
            <thead>
              <tr class="border-b" :style="{ borderColor: brand.colors.border }">
                <th class="font-academic-label py-3 text-left" :style="{ color: brand.colors.textMuted }">§</th>
                <th class="font-academic-label py-3 text-left" :style="{ color: brand.colors.textMuted }">Ticker</th>
                <th class="hidden font-academic-label py-3 text-left md:table-cell" :style="{ color: brand.colors.textMuted }">Setor</th>
                <th class="font-academic-label py-3 text-right" :style="{ color: brand.colors.textMuted }">P/L</th>
                <th class="font-academic-label py-3 text-right" :style="{ color: brand.colors.textMuted }">P/VP</th>
                <th class="font-academic-label py-3 text-right" :style="{ color: brand.colors.textMuted }">ROE</th>
                <th class="font-academic-label py-3 text-right" :style="{ color: brand.colors.textMuted }">DY</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, idx) in researchScreener"
                :key="`screener-${row.ticker}`"
                class="border-b"
                :style="{ borderColor: brand.colors.border }"
              >
                <td class="py-3 pr-2">
                  <span class="font-academic-mono text-[11px] tabular-nums" :style="{ color: brand.colors.textMuted }">
                    2.{{ idx + 1 }}
                  </span>
                </td>
                <td class="py-3">
                  <NuxtLink :to="`/asset/${row.ticker.toLowerCase()}`" class="flex flex-col">
                    <span class="font-academic-display text-[15px]" :style="{ color: brand.colors.text }">
                      {{ row.ticker }}
                    </span>
                    <span class="font-academic-body truncate text-[11px] italic" :style="{ color: brand.colors.textMuted }">
                      {{ row.name }}
                    </span>
                  </NuxtLink>
                </td>
                <td class="hidden py-3 md:table-cell">
                  <span class="font-academic-body text-[12px]" :style="{ color: brand.colors.textMuted }">
                    {{ row.sector }}
                  </span>
                </td>
                <td class="py-3 text-right">
                  <span class="font-academic-mono tabular-nums" :style="{ color: brand.colors.text }">
                    {{ row.pl }}
                  </span>
                </td>
                <td class="py-3 text-right">
                  <span class="font-academic-mono tabular-nums" :style="{ color: brand.colors.text }">
                    {{ row.pvp }}
                  </span>
                </td>
                <td class="py-3 text-right">
                  <span class="font-academic-mono tabular-nums" :style="{ color: brand.colors.text }">
                    {{ row.roe }}
                  </span>
                </td>
                <td class="py-3 text-right">
                  <span class="font-academic-mono tabular-nums font-semibold" :style="{ color: brand.colors.primary }">
                    {{ row.dy }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <p class="font-academic-body mt-4 text-[11px] italic" :style="{ color: brand.colors.textMuted }">
            Critério de corte aplicado: ROE ≥ 10%, margem líquida ≥ 10%, D/E ≤ 1,0 e P/L ≤ 15. Dados do último fechamento disponível.
          </p>
        </div>
      </div>

      <hr class="dashed-rule mx-auto max-w-6xl" />

      <!-- §3 Setores comparativos -->
      <div class="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
        <div class="mb-8">
          <span class="font-academic-label" :style="{ color: brand.colors.primary }">
            §3 · Setores em análise
          </span>
          <h2 class="font-academic-display mt-2 text-3xl md:text-4xl" :style="{ color: brand.colors.text }">
            O mercado visto por setor
          </h2>
          <p class="font-academic-body mt-3 max-w-2xl text-[13px] italic" :style="{ color: brand.colors.textMuted }">
            Médias setoriais em tempo real. Comparar empresas isoladamente sem contextualizar pelo setor é <span class="red-pen-underline">erro de iniciante</span>.
          </p>
        </div>

        <table class="w-full border-t font-academic-body text-[13px]" :style="{ borderColor: brand.colors.text }">
          <thead>
            <tr class="border-b" :style="{ borderColor: brand.colors.border }">
              <th class="font-academic-label py-3 text-left" :style="{ color: brand.colors.textMuted }">§</th>
              <th class="font-academic-label py-3 text-left" :style="{ color: brand.colors.textMuted }">Setor</th>
              <th class="font-academic-label py-3 text-right" :style="{ color: brand.colors.textMuted }">Empresas</th>
              <th class="font-academic-label py-3 text-right" :style="{ color: brand.colors.textMuted }">P/L médio</th>
              <th class="font-academic-label py-3 text-right" :style="{ color: brand.colors.textMuted }">DY médio</th>
              <th class="hidden font-academic-label py-3 text-right md:table-cell" :style="{ color: brand.colors.textMuted }">Destaque</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in researchSectors"
              :key="row.sector"
              class="border-b"
              :style="{ borderColor: brand.colors.border }"
            >
              <td class="py-3 pr-2">
                <span class="font-academic-mono text-[11px] tabular-nums" :style="{ color: brand.colors.textMuted }">
                  3.{{ idx + 1 }}
                </span>
              </td>
              <td class="py-3">
                <span class="font-academic-display text-[15px]" :style="{ color: brand.colors.text }">
                  {{ row.sector }}
                </span>
              </td>
              <td class="py-3 text-right">
                <span class="font-academic-mono tabular-nums" :style="{ color: brand.colors.text }">
                  {{ row.count }}
                </span>
              </td>
              <td class="py-3 text-right">
                <span class="font-academic-mono tabular-nums" :style="{ color: brand.colors.text }">
                  {{ row.avgPL }}
                </span>
              </td>
              <td class="py-3 text-right">
                <span class="font-academic-mono tabular-nums" :style="{ color: brand.colors.primary }">
                  {{ row.avgDY }}
                </span>
              </td>
              <td class="hidden py-3 text-right md:table-cell">
                <span class="font-academic-body text-[12px] italic" :style="{ color: brand.colors.textMuted }">
                  {{ row.highlight }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr class="dashed-rule mx-auto max-w-6xl" />

      <!-- §4 Calendário de proventos -->
      <div
        class="py-16 md:py-20"
        :style="{ backgroundColor: brand.colors.surface }"
      >
        <div class="mx-auto max-w-6xl px-6 md:px-10">
          <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span class="font-academic-label" :style="{ color: brand.colors.primary }">
                §4 · Calendário de proventos
              </span>
              <h2 class="font-academic-display mt-2 text-3xl md:text-4xl" :style="{ color: brand.colors.text }">
                Próximos pagamentos
              </h2>
              <p class="font-academic-body mt-3 max-w-2xl text-[13px] italic" :style="{ color: brand.colors.textMuted }">
                Janela dos próximos 30 dias. Proventos isentos ficam em <span class="red-pen">destaque vermelho</span>; JCP é tributado na fonte.
              </p>
            </div>
            <NuxtLink
              to="/dividendos/calendario"
              class="font-academic-body text-[13px] italic transition-opacity hover:opacity-70"
              :style="{ color: brand.colors.text }"
            >
              Ver calendário completo <span :style="{ color: brand.colors.primary }">→</span>
            </NuxtLink>
          </div>

          <table class="w-full border-t font-academic-body text-[13px]" :style="{ borderColor: brand.colors.text }">
            <thead>
              <tr class="border-b" :style="{ borderColor: brand.colors.border }">
                <th class="font-academic-label py-3 text-left" :style="{ color: brand.colors.textMuted }">Data-com</th>
                <th class="font-academic-label py-3 text-left" :style="{ color: brand.colors.textMuted }">Data-pag</th>
                <th class="font-academic-label py-3 text-left" :style="{ color: brand.colors.textMuted }">Ticker</th>
                <th class="font-academic-label py-3 text-left" :style="{ color: brand.colors.textMuted }">Tipo</th>
                <th class="font-academic-label py-3 text-right" :style="{ color: brand.colors.textMuted }">Valor</th>
                <th class="hidden font-academic-label py-3 text-right md:table-cell" :style="{ color: brand.colors.textMuted }">DY unit.</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in researchDividends"
                :key="`${row.ticker}-${row.exDate}`"
                class="border-b"
                :style="{ borderColor: brand.colors.border }"
              >
                <td class="py-3 pr-4">
                  <span class="font-academic-mono tabular-nums" :style="{ color: brand.colors.text }">
                    {{ row.exDate }}
                  </span>
                </td>
                <td class="py-3 pr-4">
                  <span class="font-academic-mono tabular-nums" :style="{ color: brand.colors.textMuted }">
                    {{ row.payDate }}
                  </span>
                </td>
                <td class="py-3">
                  <span class="font-academic-display text-[15px]" :style="{ color: brand.colors.text }">
                    {{ row.ticker }}
                  </span>
                </td>
                <td class="py-3">
                  <span
                    class="font-academic-label"
                    :style="{ color: row.type === 'Dividendo' ? brand.colors.primary : brand.colors.textMuted }"
                  >
                    {{ row.type }}
                  </span>
                </td>
                <td class="py-3 text-right">
                  <span class="font-academic-mono tabular-nums" :style="{ color: brand.colors.text }">
                    R$ {{ row.amount }}
                  </span>
                </td>
                <td class="hidden py-3 text-right md:table-cell">
                  <span class="font-academic-mono tabular-nums" :style="{ color: brand.colors.primary }">
                    {{ row.unitDY }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <hr class="dashed-rule mx-auto max-w-6xl" />

      <!-- §5 Notas do professor (últimas análises publicadas) -->
      <div class="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
        <div class="mb-8">
          <span class="font-academic-label" :style="{ color: brand.colors.primary }">
            §5 · Notas do professor
          </span>
          <h2 class="font-academic-display mt-2 text-3xl md:text-4xl" :style="{ color: brand.colors.text }">
            Últimas análises publicadas
          </h2>
          <p class="font-academic-body mt-3 max-w-2xl text-[13px] italic" :style="{ color: brand.colors.textMuted }">
            Anotações recentes da mesa. Cada título leva para o estudo completo do ativo.
          </p>
        </div>

        <ol class="flex flex-col">
          <li
            v-for="(note, idx) in researchAnalystNotes"
            :key="note.ticker"
            class="grid items-start gap-4 border-t py-5 md:grid-cols-12 md:gap-8"
            :style="{ borderColor: brand.colors.border }"
          >
            <div class="md:col-span-1">
              <span class="font-academic-mono text-[11px] tabular-nums" :style="{ color: brand.colors.textMuted }">
                5.{{ idx + 1 }}
              </span>
            </div>
            <div class="md:col-span-2">
              <span class="font-academic-display text-lg" :style="{ color: brand.colors.text }">
                {{ note.ticker }}
              </span>
              <span class="mt-0.5 block font-academic-mono text-[10px] uppercase tabular-nums" :style="{ color: brand.colors.textMuted }">
                {{ note.date }}
              </span>
            </div>
            <div class="md:col-span-6">
              <NuxtLink
                :to="`/asset/${note.ticker.toLowerCase()}`"
                class="font-academic-display text-lg transition-opacity hover:opacity-70"
                :style="{ color: brand.colors.text }"
              >
                {{ note.title }}
              </NuxtLink>
              <p class="font-academic-body mt-1 text-[13px] italic" :style="{ color: brand.colors.textMuted }">
                {{ note.excerpt }}
              </p>
            </div>
            <div class="md:col-span-3 md:text-right">
              <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">Veredicto</span>
              <span class="mt-1 block font-academic-display text-[15px]" :style="{ color: brand.colors.primary }">
                {{ note.verdict }}
              </span>
            </div>
          </li>
        </ol>
      </div>

      <hr class="dashed-rule mx-auto max-w-6xl" />

      <!-- §6 Ecossistema AUVP -->
      <div class="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-24">
        <div class="mb-10">
          <span class="font-academic-label" :style="{ color: brand.colors.primary }">
            §6 · Ecossistema AUVP
          </span>
          <h2 class="font-academic-display mt-2 text-3xl md:text-4xl" :style="{ color: brand.colors.text }">
            Continuar o estudo vai muito além desta página
          </h2>
          <p class="font-academic-body mt-4 max-w-2xl" :style="{ color: brand.colors.text, fontSize: '15px' }">
            A plataforma é o <span class="red-pen">terminal de dados</span>. O método, a comunidade e a escola são o que transformam dados em decisão. Tudo isso vive dentro da AUVP.
          </p>
        </div>

        <div class="grid gap-px border" :style="{ borderColor: brand.colors.text, backgroundColor: brand.colors.text }">
          <div class="grid md:grid-cols-2" :style="{ gap: '1px', backgroundColor: brand.colors.text }">
            <a
              v-for="(item, idx) in researchAUVPEcosystem"
              :key="item.title"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex flex-col gap-3 border-0 p-8 transition-colors md:p-10"
              :style="{ backgroundColor: brand.colors.background }"
              @mouseenter="($event.currentTarget as HTMLElement).style.backgroundColor = brand.colors.surface"
              @mouseleave="($event.currentTarget as HTMLElement).style.backgroundColor = brand.colors.background"
            >
              <div class="flex items-start justify-end">
                <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">
                  {{ item.kind }}
                </span>
              </div>
              <h3
                class="font-academic-display"
                :style="{
                  color: brand.colors.text,
                  fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                  lineHeight: '1.05',
                }"
              >
                {{ item.title }}
              </h3>
              <p class="font-academic-body" :style="{ color: brand.colors.text, fontSize: '14px' }">
                {{ item.body }}
              </p>
              <div class="mt-2 flex items-center gap-3 border-t pt-4" :style="{ borderColor: brand.colors.border }">
                <span class="font-academic-label transition-transform group-hover:translate-x-1" :style="{ color: brand.colors.primary }">
                  {{ item.cta }} →
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- §7 Closing: signature + founder quote + footnotes -->
      <div
        class="py-20 md:py-24"
        :style="{ backgroundColor: brand.colors.surface, borderTop: `1px solid ${brand.colors.border}` }"
      >
        <div class="mx-auto max-w-6xl px-6 md:px-10">
          <span class="font-academic-label" :style="{ color: brand.colors.primary }">
            Considerações finais
          </span>
          <h2
            class="font-academic-display mt-4"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)',
            }"
          >
            A única verdade possível <span class="italic" :style="{ color: brand.colors.primary }">é o conhecimento.</span>
          </h2>

          <blockquote
            class="font-academic-body mt-8 max-w-3xl border-l-2 pl-6 italic"
            :style="{
              color: brand.colors.text,
              borderColor: brand.colors.primary,
              fontSize: '18px',
            }"
          >
            "{{ brand.hero.founderQuote }}"
          </blockquote>

          <div class="mt-14 flex flex-wrap items-start justify-between gap-6 border-t pt-10" :style="{ borderColor: brand.colors.border }">
            <div class="flex flex-col gap-1">
              <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">
                Assinado por
              </span>
              <span class="font-academic-display text-2xl" :style="{ color: brand.colors.text }">
                {{ brand.founder?.name || 'Raul Sena' }}
              </span>
              <span class="font-academic-body text-[13px] italic" :style="{ color: brand.colors.textMuted }">
                Fundador · AUVP, A Única Verdade Possível
              </span>
            </div>
            <div class="flex flex-col items-end gap-3">
              <NuxtLink
                to="/auth/register"
                class="inline-flex items-center gap-3 border-2 px-5 py-2.5 font-academic-label transition-colors"
                :style="{
                  backgroundColor: brand.colors.primary,
                  color: brand.colors.background,
                  borderColor: brand.colors.primary,
                }"
              >
                <span>ACESSAR A PLATAFORMA</span>
                <span>→</span>
              </NuxtLink>
              <a
                href="https://auvp.com.br"
                target="_blank"
                rel="noopener noreferrer"
                class="font-academic-body text-[13px] italic transition-opacity hover:opacity-70"
                :style="{ color: brand.colors.text }"
              >
                Conhecer a AUVP Escola <span :style="{ color: brand.colors.primary }">→</span>
              </a>
            </div>
          </div>

          <!-- Footnotes -->
          <div class="mt-14 border-t pt-6" :style="{ borderColor: brand.colors.border }">
            <span class="font-academic-label" :style="{ color: brand.colors.textMuted }">
              Notas de rodapé
            </span>
            <ol class="mt-4 flex flex-col gap-3">
              <li class="font-academic-body text-[12px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
                <sup class="footnote-marker">¹</sup> Variação diária é ruído. O analista olha o radar do pregão para checar contexto, não para tomar decisão.
              </li>
              <li class="font-academic-body text-[12px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
                <sup class="footnote-marker">²</sup> Os filtros do método AUVP são detalhados no curso AUVP Escola, cada corte tem justificativa histórica e comparativa.
              </li>
              <li class="font-academic-body text-[12px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
                <sup class="footnote-marker">³</sup> Esta publicação não constitui recomendação de compra ou venda. AUVP não opera aconselhamento individualizado, oferece método e plataforma de estudo.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== HERO: MINIMAL (Sardinha, compacto, data-first, sem firula) ========== -->
    <section v-if="brand.hero.variant === 'minimal'" :style="{ borderColor: brand.colors.border }" class="relative overflow-hidden border-b">
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
                <UButton to="/auth/register" color="secondary" size="lg" :icon="brand.hero.ctaIcon" class="transition-[transform,opacity,box-shadow,background-color,border-color] hover:scale-[1.02]">
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

    <!-- ========== HERO: INSTITUTIONAL (Assessoria, sobrio, profissional, confiavel) ========== -->
    <section v-if="brand.hero.variant === 'institutional'"  class="relative overflow-hidden px-4 pt-2 md:px-6">
      <!-- Container com imagem de fundo, mesma largura do header (sem padding proprio, usa o do layout) -->
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

    <!-- ========== HERO: MENTOR (Primo Rico, book-cover / masterclass aesthetic) ========== -->
    <section
      v-if="brand.hero.variant === 'mentor'"
      :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
      class="relative overflow-hidden"
    >
      <!-- Top tape: thick orange strip with "MANUAL DO PRIMO" breadcrumb -->
      <div
        class="relative flex items-center gap-4 px-6 py-3 md:px-10"
        :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
      >
        <span class="font-mentor-eyebrow">{{ brand.hero.badge }}</span>
        <span class="flex-1 border-t" :style="{ borderColor: `${brand.colors.background}40` }" />
        <span class="font-mentor-eyebrow">DO MIL AO MILHÃO · A ESCOLHA É SUA</span>
      </div>

      <!-- HERO, asymmetric split: portrait left, text right -->
      <div class="relative grid gap-0 md:grid-cols-12">
        <!-- Portrait column (decorative B&W placeholder with orange blend) -->
        <div
          class="relative aspect-[4/5] overflow-hidden md:col-span-5 md:aspect-auto md:min-h-[720px]"
          :style="{ backgroundColor: brand.colors.tertiary }"
        >
          <!-- Photo layer: high-contrast B&W with orange multiply overlay -->
          <div
            v-if="brand.founder?.photo"
            class="absolute inset-0 bg-cover bg-center"
            :style="{
              backgroundImage: `url(${brand.founder.photo})`,
              filter: 'grayscale(100%) contrast(1.15) brightness(0.85)',
            }"
          />
          <!-- Grain + vignette -->
          <div
            class="absolute inset-0 opacity-30"
            :style="{
              background: `radial-gradient(ellipse at 40% 30%, transparent 30%, ${brand.colors.background} 95%)`,
            }"
          />
          <!-- Orange bottom wash -->
          <div
            class="absolute inset-x-0 bottom-0 h-2/3"
            :style="{
              background: `linear-gradient(to top, ${brand.colors.primary}CC, ${brand.colors.primary}33 40%, transparent)`,
              mixBlendMode: 'multiply',
            }"
          />
          <!-- Bottom-left: founder name plate -->
          <div class="absolute bottom-6 left-6 right-6 flex flex-col gap-1">
            <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
              SEU MENTOR
            </span>
            <span
              class="font-mentor-display text-3xl md:text-4xl"
              :style="{ color: brand.colors.background + 'F2' }"
            >
              {{ brand.founder?.name || 'Thiago Nigro' }}
            </span>
            <span
              class="font-mentor-eyebrow mt-1"
              :style="{ color: `${brand.colors.background}99` }"
            >
              {{ brand.founder?.role || 'Educador financeiro' }}
            </span>
          </div>
          <!-- Vertical orange ticker on the far right edge of the image -->
          <div
            class="absolute right-0 top-0 h-full w-1"
            :style="{ backgroundColor: brand.colors.primary }"
          />
        </div>

        <!-- Text column: massive uppercase headline, body, CTAs -->
        <div class="flex flex-col justify-center px-6 py-16 md:col-span-7 md:px-14 md:py-20">
          <span
            class="font-mentor-eyebrow"
            :style="{ color: brand.colors.primary }"
          >
            CAPÍTULO I · CONSTRUÇÃO DE PATRIMÔNIO
          </span>
          <h1
            class="font-mentor-display mt-6 leading-[0.85]"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(3.5rem, 8vw, 8rem)',
            }"
          >
            <template v-for="(line, idx) in brand.hero.title.split('\n')" :key="idx">
              <br v-if="idx > 0" />
              <span
                v-if="idx === 1"
                :style="{ color: brand.colors.primary }"
              >{{ line }}</span>
              <span v-else>{{ line }}</span>
            </template>
          </h1>

          <!-- Chunky 4px orange rule -->
          <hr
            class="mentor-rule mt-8 max-w-[5rem]"
            :style="{ backgroundColor: brand.colors.primary }"
          />

          <p
            class="mt-8 max-w-xl text-base leading-relaxed md:text-lg"
            :style="{ color: `${brand.colors.text}CC` }"
          >
            {{ brand.hero.subtitle }}
          </p>

          <!-- CTAs: solid orange block + underlined secondary -->
          <div class="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
            <NuxtLink
              to="/auth/register"
              class="group inline-flex items-center gap-3 px-8 py-4 font-mentor-eyebrow text-[12px] transition-transform hover:-translate-y-0.5"
              :style="{
                backgroundColor: brand.colors.primary,
                color: brand.colors.background,
                letterSpacing: '0.15em',
              }"
            >
              <span>{{ brand.hero.ctaLabel.toUpperCase() }}</span>
              <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
            </NuxtLink>
            <NuxtLink
              to="/auth/login"
              class="font-mentor-eyebrow border-b pb-1 transition-opacity hover:opacity-70"
              :style="{
                color: brand.colors.text,
                borderColor: `${brand.colors.text}40`,
              }"
            >
              {{ brand.hero.ctaSecondaryLabel.toUpperCase() }}
            </NuxtLink>
          </div>

          <!-- Trust indicators as numbered stats, big and chunky -->
          <div class="mt-16 grid grid-cols-2 gap-8 border-t pt-8 md:grid-cols-4" :style="{ borderColor: `${brand.colors.text}15` }">
            <div
              v-for="(indicator, i) in brand.hero.trustIndicators"
              :key="indicator"
              class="flex flex-col gap-1"
            >
              <span
                class="font-mentor-eyebrow"
                :style="{ color: brand.colors.primary }"
              >
                {{ String(i + 1).padStart(2, '0') }}
              </span>
              <span
                class="text-sm font-bold leading-tight md:text-base"
                :style="{ color: brand.colors.text, textTransform: 'uppercase', letterSpacing: '0.02em' }"
              >
                {{ indicator }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Monumental pull quote, the founder line -->
      <div
        class="relative border-t border-b py-20 md:py-28"
        :style="{
          borderColor: `${brand.colors.text}15`,
          backgroundColor: brand.colors.surface,
        }"
      >
        <div class="mx-auto max-w-6xl px-6 md:px-10">
          <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
            O LIVRO · DO MIL AO MILHÃO
          </span>
          <blockquote
            class="font-mentor-quote mt-6 leading-[0.95]"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(2.5rem, 6.5vw, 6rem)',
            }"
          >
            "{{ brand.hero.founderQuote || brand.founder?.signaturePhrase || 'Liberdade ou mediocridade. A escolha é sua.' }}"
          </blockquote>
          <div class="mt-10 flex items-center gap-4">
            <div class="h-[2px] w-12" :style="{ backgroundColor: brand.colors.primary }" />
            <span class="font-mentor-eyebrow" :style="{ color: `${brand.colors.text}99` }">
              {{ (brand.founder?.name || 'THIAGO NIGRO').toUpperCase() }} · AUTOR DO BEST-SELLER
            </span>
          </div>
        </div>
      </div>

      <!-- Chapter II: Method ARCA, 4 pillars -->
      <div class="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <div class="mb-12 flex flex-col gap-3">
          <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
            CAPÍTULO II
          </span>
          <h2
            class="font-mentor-display"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            }"
          >
            O MÉTODO ARCA
          </h2>
          <p class="mt-2 max-w-2xl text-base" :style="{ color: `${brand.colors.text}B3` }">
            Quatro pilares que sustentam uma carteira de longo prazo. Não é fórmula mágica, é disciplina aplicada.
          </p>
        </div>

        <!-- 4 ARCA pillars as numbered blocks -->
        <div class="grid gap-0 border" :style="{ borderColor: `${brand.colors.text}15` }">
          <div
            v-for="(pillar, idx) in mentorArcaPillars"
            :key="pillar.letter"
            class="group relative grid items-start gap-6 border-t px-6 py-8 transition-colors md:grid-cols-12 md:gap-10 md:px-10 md:py-10"
            :class="idx === 0 && '!border-t-0'"
            :style="{ borderColor: `${brand.colors.text}15` }"
            @mouseenter="($event.currentTarget as HTMLElement).style.backgroundColor = `${brand.colors.primary}0D`"
            @mouseleave="($event.currentTarget as HTMLElement).style.backgroundColor = 'transparent'"
          >
            <!-- Numeric prefix -->
            <div class="md:col-span-1">
              <span
                class="font-mentor-display text-5xl md:text-6xl"
                :style="{ color: brand.colors.primary }"
              >
                {{ String(idx + 1).padStart(2, '0') }}
              </span>
            </div>
            <!-- Letter + label -->
            <div class="md:col-span-3 md:pl-2">
              <span
                class="font-mentor-display text-3xl md:text-4xl"
                :style="{ color: brand.colors.text }"
              >
                {{ pillar.letter }}
              </span>
              <span
                class="mt-1 block font-mentor-eyebrow"
                :style="{ color: `${brand.colors.text}80` }"
              >
                {{ pillar.label }}
              </span>
            </div>
            <!-- Description -->
            <div class="md:col-span-6 md:pl-4">
              <p class="text-base leading-relaxed md:text-lg" :style="{ color: `${brand.colors.text}CC` }">
                {{ pillar.description }}
              </p>
            </div>
            <!-- CTA -->
            <div class="md:col-span-2 md:pl-2">
              <NuxtLink
                :to="pillar.to"
                class="group/link inline-flex items-center gap-2 border-b pb-1 font-mentor-eyebrow transition-colors"
                :style="{
                  color: brand.colors.text,
                  borderColor: brand.colors.primary,
                }"
              >
                <span>EXPLORAR</span>
                <span class="inline-block transition-transform group-hover/link:translate-x-1" :style="{ color: brand.colors.primary }">→</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats row, chunky numbered cards -->
      <div
        class="border-t border-b py-16 md:py-20"
        :style="{
          borderColor: `${brand.colors.text}15`,
          backgroundColor: brand.colors.surface,
        }"
      >
        <div class="mx-auto max-w-6xl px-6 md:px-10">
          <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
            OS NÚMEROS
          </span>
          <div class="mt-8 grid gap-px md:grid-cols-4" :style="{ backgroundColor: `${brand.colors.text}18` }">
            <div
              v-for="(stat, idx) in mentorStats"
              :key="stat.label"
              class="flex flex-col gap-2 px-6 py-8 md:py-10"
              :style="{ backgroundColor: brand.colors.surface }"
            >
              <span
                class="font-mentor-display tabular-nums"
                :style="{
                  color: brand.colors.text,
                  fontSize: 'clamp(2.5rem, 4.5vw, 4rem)',
                }"
              >
                {{ stat.value }}
              </span>
              <span
                class="text-xs font-bold uppercase tracking-wider"
                :style="{ color: `${brand.colors.text}99` }"
              >
                {{ stat.label }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Closing CTA: monumental "A ESCOLHA É SUA" -->
      <div class="mx-auto max-w-6xl px-6 py-24 text-center md:px-10 md:py-32">
        <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
          CAPÍTULO FINAL
        </span>
        <h2
          class="font-mentor-display mt-6"
          :style="{
            color: brand.colors.text,
            fontSize: 'clamp(3rem, 10vw, 10rem)',
          }"
        >
          A ESCOLHA
          <br />
          <span :style="{ color: brand.colors.primary }">É SUA.</span>
        </h2>
        <p
          class="mx-auto mt-8 max-w-xl text-base md:text-lg"
          :style="{ color: `${brand.colors.text}B3` }"
        >
          Você pode continuar reagindo ao mercado, ou pode começar a construir. Não existe meio-termo.
        </p>
        <div class="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
          <NuxtLink
            to="/auth/register"
            class="group inline-flex items-center gap-3 px-10 py-5 font-mentor-eyebrow text-[13px] transition-transform hover:-translate-y-0.5"
            :style="{
              backgroundColor: brand.colors.primary,
              color: brand.colors.background,
              letterSpacing: '0.18em',
            }"
          >
            <span>COMEÇAR AGORA</span>
            <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
          </NuxtLink>
          <span class="font-mentor-eyebrow" :style="{ color: `${brand.colors.text}66` }">
            GRÁTIS · SEM CARTÃO · ACESSO IMEDIATO
          </span>
        </div>
      </div>
    </section>

    <!-- ========== HERO: EDITORIAL (Norte Capital, letter from your advisor, private-bank tone) ========== -->
    <section
      v-if="brand.hero.variant === 'editorial'"
      :style="{ backgroundColor: brand.colors.background }"
      class="relative"
    >
      <!-- Page header strip: eyebrow + date + "page number" counter -->
      <header
        class="mx-auto flex max-w-5xl items-start justify-between px-6 pt-10 md:px-12 md:pt-14"
      >
        <div class="flex flex-col gap-0.5">
          <span
            class="font-small-caps text-[11px]"
            :style="{ color: brand.colors.textMuted }"
          >
            Norte Capital &nbsp;·&nbsp; Assessoria de Investimentos
          </span>
          <span
            class="font-editorial-body text-[12px] italic"
            :style="{ color: brand.colors.textMuted }"
          >
            {{ editorialDate }}
          </span>
        </div>
        <span
          class="font-editorial-body text-[11px] italic tabular-nums"
          :style="{ color: brand.colors.textMuted }"
        >
          Carta Mensal · {{ editorialDate }}
        </span>
      </header>

      <!-- Opening: tagline as oversized display serif -->
      <div class="mx-auto max-w-5xl px-6 pb-6 pt-16 md:px-12 md:pt-24">
        <h1
          class="font-editorial-display max-w-4xl leading-[0.92] tracking-tight"
          :style="{ color: brand.colors.text, fontSize: 'clamp(3.5rem, 9vw, 7.5rem)' }"
        >
          <template v-for="(line, idx) in brand.hero.title.split('\n')" :key="idx">
            <br v-if="idx > 0" />
            <span v-if="idx === 1" class="italic" :style="{ color: brand.colors.secondary }">{{ line }}</span>
            <span v-else>{{ line }}</span>
          </template>
        </h1>

        <hr class="hairline-rule my-10 max-w-[8rem]" />

        <p
          class="font-editorial-body max-w-2xl"
          :style="{ color: brand.colors.text, fontSize: 'clamp(1.15rem, 1.4vw, 1.35rem)' }"
        >
          {{ brand.hero.subtitle }}
        </p>

        <!-- CTAs: the primary reads like an invitation, not a signup button.
             Underlined text links instead of beefy pills. -->
        <div class="mt-10 flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-10">
          <NuxtLink
            to="/auth/register"
            class="group inline-flex items-center gap-3 border-b pb-1 font-editorial-body text-lg transition-colors"
            :style="{
              borderColor: brand.colors.secondary,
              color: brand.colors.text,
            }"
            @mouseenter="($event.currentTarget as HTMLElement).style.borderColor = brand.colors.text"
            @mouseleave="($event.currentTarget as HTMLElement).style.borderColor = brand.colors.secondary"
          >
            <span>{{ brand.hero.ctaLabel }}</span>
            <span class="inline-block transition-transform group-hover:translate-x-1" :style="{ color: brand.colors.secondary }">-→</span>
          </NuxtLink>
          <NuxtLink
            to="/auth/login"
            class="font-editorial-body text-lg italic transition-opacity hover:opacity-70"
            :style="{ color: brand.colors.textMuted }"
          >
            {{ brand.hero.ctaSecondaryLabel }}
          </NuxtLink>
        </div>
      </div>

      <!-- ===== Chapter I: Como trabalhamos ===== -->
      <div class="mx-auto max-w-5xl px-6 pb-20 pt-16 md:grid md:grid-cols-12 md:gap-10 md:px-12">
        <div class="md:col-span-4">
          <span
            class="font-small-caps text-[11px]"
            :style="{ color: brand.colors.secondary }"
          >
            Capítulo I
          </span>
          <h2
            class="font-editorial-display mt-1 text-3xl leading-tight md:text-4xl"
            :style="{ color: brand.colors.text }"
          >
            Como trabalhamos
          </h2>
        </div>
        <div class="mt-6 md:col-span-7 md:col-start-6 md:mt-0">
          <p
            class="font-editorial-body dropcap"
            :style="{ color: brand.colors.text, fontSize: '1.15rem' }"
          >
            Nossa equipe de oito assessores certificados CFA atende um número limitado de famílias. Cada carteira é construída a partir de uma conversa, sobre seus objetivos, seu horizonte, suas obrigações de médio prazo, e não a partir de um formulário preenchido na pressa.
          </p>
          <p
            class="font-editorial-body mt-6"
            :style="{ color: brand.colors.text, fontSize: '1.15rem' }"
          >
            Uma vez construída, sua carteira é revisada trimestralmente em reunião presencial ou por vídeo. Entre as reuniões, você acompanha tudo por esta plataforma, recebe a <em>carta mensal</em> do seu assessor e pode falar conosco quando precisar, sem secretária eletrônica e sem fila de atendimento.
          </p>
        </div>
      </div>

      <hr class="hairline-rule mx-auto max-w-5xl" />

      <!-- ===== Chapter II: Ritual ===== -->
      <div class="mx-auto max-w-5xl px-6 py-20 md:grid md:grid-cols-12 md:gap-10 md:px-12">
        <div class="md:col-span-4">
          <span
            class="font-small-caps text-[11px]"
            :style="{ color: brand.colors.secondary }"
          >
            Capítulo II
          </span>
          <h2
            class="font-editorial-display mt-1 text-3xl leading-tight md:text-4xl"
            :style="{ color: brand.colors.text }"
          >
            Ritual mensal
          </h2>
        </div>
        <div class="mt-6 md:col-span-7 md:col-start-6 md:mt-0">
          <!-- Three numbered "ritual" items as an editorial list with roman numerals -->
          <ol class="flex flex-col gap-6">
            <li
              v-for="(item, idx) in editorialRitual"
              :key="item.title"
              class="flex gap-5 border-t pt-6"
              :style="{ borderColor: `color-mix(in srgb, ${brand.colors.text} 10%, transparent)` }"
            >
              <span
                class="font-editorial-display text-3xl italic leading-none"
                :style="{ color: brand.colors.secondary }"
              >
                {{ romanNumeral(idx + 1) }}
              </span>
              <div class="flex flex-col gap-1.5">
                <h3
                  class="font-editorial-display text-xl"
                  :style="{ color: brand.colors.text }"
                >
                  {{ item.title }}
                </h3>
                <p
                  class="font-editorial-body"
                  :style="{ color: brand.colors.text, fontSize: '1rem' }"
                >
                  {{ item.body }}
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>

      <hr class="hairline-rule mx-auto max-w-5xl" />

      <!-- ===== Chapter III: Números que importam ===== -->
      <div class="mx-auto max-w-5xl px-6 py-20 md:px-12">
        <div class="mb-10 flex flex-col gap-1">
          <span
            class="font-small-caps text-[11px]"
            :style="{ color: brand.colors.secondary }"
          >
            Capítulo III
          </span>
          <h2
            class="font-editorial-display text-3xl leading-tight md:text-4xl"
            :style="{ color: brand.colors.text }"
          >
            Números que importam
          </h2>
        </div>

        <!-- Narrative metrics, oldstyle figures in serif, inline with prose -->
        <div class="grid gap-10 md:grid-cols-3">
          <div v-for="metric in editorialMetrics" :key="metric.label" class="flex flex-col gap-3">
            <span
              class="font-small-caps text-[10px]"
              :style="{ color: brand.colors.textMuted }"
            >
              {{ metric.label }}
            </span>
            <div class="flex items-baseline gap-2">
              <span
                class="font-editorial-display font-serif-numeric text-6xl leading-none"
                :style="{ color: brand.colors.text }"
              >
                {{ metric.value }}
              </span>
              <span
                class="font-editorial-display text-2xl italic"
                :style="{ color: brand.colors.secondary }"
              >
                {{ metric.unit }}
              </span>
            </div>
            <p
              class="font-editorial-body italic"
              :style="{ color: brand.colors.textMuted, fontSize: '0.95rem' }"
            >
              {{ metric.note }}
            </p>
          </div>
        </div>
      </div>

      <hr class="hairline-rule mx-auto max-w-5xl" />

      <!-- ===== Chapter IV: Pauta do dia ===== -->
      <div class="mx-auto max-w-5xl px-6 py-20 md:grid md:grid-cols-12 md:gap-10 md:px-12">
        <div class="md:col-span-4">
          <span
            class="font-small-caps text-[11px]"
            :style="{ color: brand.colors.secondary }"
          >
            Capítulo IV
          </span>
          <h2
            class="font-editorial-display mt-1 text-3xl leading-tight md:text-4xl"
            :style="{ color: brand.colors.text }"
          >
            Pauta do dia
          </h2>
          <p
            class="font-editorial-body mt-4 italic"
            :style="{ color: brand.colors.textMuted, fontSize: '0.95rem' }"
          >
            Uma leitura editorial do pregão, curada pela mesa. Não é recomendação nem alerta, apenas o que vale comentar hoje.
          </p>
        </div>

        <div class="mt-6 md:col-span-7 md:col-start-6 md:mt-0">
          <!-- Positive movers -->
          <div class="mb-10">
            <span
              class="font-small-caps text-[11px]"
              :style="{ color: brand.colors.text }"
            >
              Altas em destaque
            </span>
            <ul class="mt-4 flex flex-col gap-5">
              <li
                v-for="mover in editorialMovers.up"
                :key="`up-${mover.ticker}`"
                class="flex flex-col gap-1 border-t pt-4"
                :style="{ borderColor: `color-mix(in srgb, ${brand.colors.text} 10%, transparent)` }"
              >
                <div class="flex items-baseline justify-between gap-4">
                  <div class="flex items-baseline gap-3">
                    <span
                      class="font-editorial-display text-2xl italic"
                      :style="{ color: brand.colors.secondary }"
                    >
                     ,
                    </span>
                    <span
                      class="font-editorial-display text-xl"
                      :style="{ color: brand.colors.text }"
                    >
                      {{ mover.name || mover.ticker }}
                    </span>
                    <span
                      class="font-editorial-body text-[11px] italic"
                      :style="{ color: brand.colors.textMuted }"
                    >
                      {{ mover.ticker }}
                    </span>
                  </div>
                  <div class="flex items-baseline gap-3">
                    <span
                      class="font-serif-numeric text-lg"
                      :style="{ color: brand.colors.text }"
                    >
                      {{ formatMoverPrice(mover.price) }}
                    </span>
                    <span
                      class="font-serif-numeric text-lg italic"
                      :style="{ color: brand.colors.positive }"
                    >
                      {{ formatMoverChange(mover.change) }}
                    </span>
                  </div>
                </div>
                <p
                  class="font-editorial-body italic pl-8"
                  :style="{ color: brand.colors.textMuted, fontSize: '0.95rem' }"
                >
                  {{ mover.note }}
                </p>
              </li>
            </ul>
          </div>

          <!-- Negative movers -->
          <div>
            <span
              class="font-small-caps text-[11px]"
              :style="{ color: brand.colors.text }"
            >
              Quedas em destaque
            </span>
            <ul class="mt-4 flex flex-col gap-5">
              <li
                v-for="mover in editorialMovers.down"
                :key="`down-${mover.ticker}`"
                class="flex flex-col gap-1 border-t pt-4"
                :style="{ borderColor: `color-mix(in srgb, ${brand.colors.text} 10%, transparent)` }"
              >
                <div class="flex items-baseline justify-between gap-4">
                  <div class="flex items-baseline gap-3">
                    <span
                      class="font-editorial-display text-2xl italic"
                      :style="{ color: brand.colors.secondary }"
                    >
                     ,
                    </span>
                    <span
                      class="font-editorial-display text-xl"
                      :style="{ color: brand.colors.text }"
                    >
                      {{ mover.name || mover.ticker }}
                    </span>
                    <span
                      class="font-editorial-body text-[11px] italic"
                      :style="{ color: brand.colors.textMuted }"
                    >
                      {{ mover.ticker }}
                    </span>
                  </div>
                  <div class="flex items-baseline gap-3">
                    <span
                      class="font-serif-numeric text-lg"
                      :style="{ color: brand.colors.text }"
                    >
                      {{ formatMoverPrice(mover.price) }}
                    </span>
                    <span
                      class="font-serif-numeric text-lg italic"
                      :style="{ color: brand.colors.negative }"
                    >
                      {{ formatMoverChange(mover.change) }}
                    </span>
                  </div>
                </div>
                <p
                  class="font-editorial-body italic pl-8"
                  :style="{ color: brand.colors.textMuted, fontSize: '0.95rem' }"
                >
                  {{ mover.note }}
                </p>
              </li>
            </ul>
          </div>

          <!-- Quiet footnote + discrete link to the client's own portfolio -->
          <p
            class="font-editorial-body mt-10 italic"
            :style="{ color: brand.colors.textMuted, fontSize: '0.85rem' }"
          >
            Acompanhamento editorial. Para movimentações em tempo real,
            <NuxtLink
              to="/wallet"
              class="border-b pb-[1px] transition-colors"
              :style="{
                color: brand.colors.text,
                borderColor: `color-mix(in srgb, ${brand.colors.text} 40%, transparent)`,
              }"
            >consulte sua carteira</NuxtLink>.
          </p>
        </div>
      </div>

      <hr class="hairline-rule mx-auto max-w-5xl" />

      <!-- ===== Closing: advisor signature + CTA ===== -->
      <div class="mx-auto max-w-5xl px-6 py-24 md:grid md:grid-cols-12 md:gap-10 md:px-12">
        <div class="md:col-span-7">
          <p
            class="font-editorial-display leading-[1.15]"
            :style="{ color: brand.colors.text, fontSize: 'clamp(1.75rem, 3vw, 2.75rem)' }"
          >
            Se tudo isso ressoa com a forma como você quer cuidar do seu patrimônio, <em :style="{ color: brand.colors.secondary }">converse conosco.</em>
          </p>
          <p
            class="font-editorial-body mt-6 max-w-lg italic"
            :style="{ color: brand.colors.textMuted, fontSize: '1rem' }"
          >
            Uma primeira conversa de 45 minutos, sem custo e sem compromisso. Você explica o que procura, nós explicamos como trabalhamos. Se fizer sentido, seguimos adiante.
          </p>
          <div class="mt-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-10">
            <NuxtLink
              to="/auth/register"
              class="group inline-flex items-center gap-3 border-b pb-1 font-editorial-body text-lg transition-colors"
              :style="{
                borderColor: brand.colors.secondary,
                color: brand.colors.text,
              }"
              @mouseenter="($event.currentTarget as HTMLElement).style.borderColor = brand.colors.text"
              @mouseleave="($event.currentTarget as HTMLElement).style.borderColor = brand.colors.secondary"
            >
              <span>Agendar uma conversa</span>
              <span :style="{ color: brand.colors.secondary }">-→</span>
            </NuxtLink>
            <span
              class="font-editorial-body text-[12px] italic"
              :style="{ color: brand.colors.textMuted }"
            >
              Ou ligue: (11) 4000-2780
            </span>
          </div>
        </div>
        <div class="mt-14 md:col-span-4 md:col-start-9 md:mt-0">
          <AtomsAdvisorSignature
            name="Marcelo Oliveira, CFA"
            role="Sócio-fundador · Norte Capital"
            closing="Atenciosamente,"
          />
        </div>
      </div>

      <!-- Bottom strip: page number echo + compliance note -->
      <div
        class="mx-auto flex max-w-5xl items-center justify-between border-t px-6 py-6 font-editorial-body text-[11px] italic md:px-12"
        :style="{
          borderColor: `color-mix(in srgb, ${brand.colors.text} 12%, transparent)`,
          color: brand.colors.textMuted,
        }"
      >
        <span>Credenciada CVM · Ancord · Certificações CFA</span>
        <span class="tabular-nums">001 / 012</span>
      </div>
    </section>

    <!-- ========== HERO: PLAYBOOK (Saraiva Invest, calm method + author photo + sticker accents) ========== -->
    <!--
      Playbook variant: dark profundo + amber Claude + Fredoka chunky
      sticker highlights + foto do autor como âncora. Mix de cientista
      calmo (B) + nômade paciente (C). Catchphrase "cabeça fria".

      Estrutura:
        §1  Topo: badge "CABEÇA FRIA" + título + manifesto + CTAs + trust indicators
        §2  Photo anchor: foto do autor dentro de círculo amber (mimica logo)
        §3  Manifesto em 3 linhas grandes ("Não existe atalho. / Existe método...")
        §4  4 pilares do método (cards com número outline + title + body)
        §5  Signature quote assinada
        §6  CTA final ("começar o método")
    -->
    <section
      v-if="brand.hero.variant === 'playbook'"
      
      class="playbook-hero relative overflow-hidden"
    >
      <!-- Atmospheric background layers -->
      <div class="pointer-events-none absolute inset-0">
        <!-- Big amber radial glow from top -->
        <div
          class="absolute -top-40 left-1/2 h-[720px] w-[1200px] -translate-x-1/2 rounded-full blur-3xl opacity-25"
          :style="{ background: `radial-gradient(ellipse at center, ${brand.colors.primary}, transparent 65%)` }"
        />
        <!-- Second glow bottom-right -->
        <div
          class="absolute -right-40 bottom-0 h-[520px] w-[520px] rounded-full blur-3xl opacity-15"
          :style="{ background: `radial-gradient(circle, ${brand.colors.primary}, transparent 70%)` }"
        />
        <!-- Subtle dot grid -->
        <div
          class="absolute inset-0 opacity-[0.04]"
          :style="{
            backgroundImage: `radial-gradient(${brand.colors.text} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }"
        />
      </div>

      <!-- ============================================================
           §1 · HERO TOP, asymmetric: copy left, author photo right
           ============================================================ -->
      <div class="relative mx-auto max-w-7xl px-6 pb-20 pt-20 md:px-10 md:pb-28 md:pt-28">
        <div class="grid grid-cols-12 gap-8 md:gap-12 lg:gap-16">
          <!-- LEFT: copy -->
          <div class="col-span-12 lg:col-span-7">
            <!-- Catchphrase pill -->
            <div
              class="pb-badge mb-8 inline-flex items-center gap-2.5 rounded-full px-5 py-2"
              :style="{
                backgroundColor: brand.colors.primary,
                color: brand.colors.background,
                boxShadow: `0 8px 30px -8px ${brand.colors.primary}80, 0 0 0 3px ${brand.colors.background}, 0 0 0 5px ${brand.colors.primary}40`,
              }"
            >
              <span class="relative flex size-1.5">
                <span class="absolute inline-flex size-1.5 rounded-full opacity-75 motion-safe:animate-ping" :style="{ backgroundColor: brand.colors.background }" />
                <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: brand.colors.background }" />
              </span>
              <span class="pb-badge-text text-[11px] font-bold uppercase tracking-[0.15em]">
                {{ brand.hero.badge }}
              </span>
            </div>

            <!-- Title -->
            <h1
              class="pb-title mb-8 leading-[0.92] tracking-tight"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(2.75rem, 7vw, 6.5rem)',
              }"
            >
              <template v-for="(line, idx) in brand.hero.title.split('\n')" :key="idx">
                <br v-if="idx > 0" />
                <span v-if="idx === 1">
                  Sem <span class="pb-sticker" :style="{ color: brand.colors.primary }">grito.</span>
                  <br />
                  Sem <span class="pb-sticker pb-sticker-outline" :style="{ '--sticker-bg': brand.colors.text, '--sticker-fg': brand.colors.background }">guru.</span>
                </span>
                <span v-else>{{ line }}</span>
              </template>
            </h1>

            <!-- Subtitle -->
            <p class="pb-subtitle mb-10 max-w-2xl text-[16px] leading-[1.65] md:text-[18px]" :style="{ color: `${brand.colors.text}C0` }">
              {{ brand.hero.subtitle }}
            </p>

            <!-- CTAs -->
            <div class="mb-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <NuxtLink
                to="/auth/register"
                class="pb-cta-primary group inline-flex items-center gap-3 rounded-full px-8 py-4 text-[14px] font-bold transition-[transform,opacity,box-shadow,background-color,border-color] hover:-translate-y-0.5"
                :style="{
                  backgroundColor: brand.colors.primary,
                  color: brand.colors.background,
                  boxShadow: `0 16px 50px -16px ${brand.colors.primary}A0, 0 0 0 2px ${brand.colors.background}, 0 0 0 4px ${brand.colors.primary}`,
                }"
              >
                <UIcon :name="brand.hero.ctaIcon" class="size-4" />
                {{ brand.hero.ctaLabel }}
                <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
              </NuxtLink>
              <NuxtLink
                to="/auth/login"
                class="inline-flex items-center gap-2 px-2 py-2 text-[14px] font-semibold transition-opacity hover:opacity-70"
                :style="{ color: brand.colors.text }"
              >
                <span class="border-b-2 pb-0.5" :style="{ borderColor: brand.colors.text }">{{ brand.hero.ctaSecondaryLabel }}</span>
              </NuxtLink>
            </div>

            <!-- Trust indicators row -->
            <div class="flex flex-wrap items-center gap-x-5 gap-y-3 border-t pt-6" :style="{ borderColor: `${brand.colors.border}80` }">
              <div
                v-for="(t, i) in brand.hero.trustIndicators"
                :key="i"
                class="flex items-center gap-2 text-[12px] font-medium"
                :style="{ color: `${brand.colors.text}A0` }"
              >
                <UIcon name="i-lucide-check-circle-2" class="size-3.5" :style="{ color: brand.colors.primary }" />
                {{ t }}
              </div>
            </div>
          </div>

          <!-- RIGHT: author photo, aspect-ratio preserved, contained -->
          <div class="col-span-12 flex items-center justify-center lg:col-span-5">
            <div class="pb-author relative flex aspect-square w-full max-w-[520px] items-center justify-center">
              <!-- Amber circle behind -->
              <div
                class="pb-author-circle absolute left-1/2 top-1/2 aspect-square w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                :style="{
                  backgroundColor: brand.colors.primary,
                  boxShadow: `0 40px 100px -30px ${brand.colors.primary}A0`,
                }"
              />
              <!-- Rotating dashed stroke ring (subtle, sits around photo) -->
              <div
                class="pb-author-ring absolute left-1/2 top-1/2 aspect-square w-[102%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                :style="{ borderColor: `${brand.colors.primary}30` }"
              />
              <!-- Photo, preserves natural aspect ratio, never stretches -->
              <NuxtImg
                v-if="brand.hero.image"
                :src="brand.hero.image"
                :alt="brand.founder.name"
                class="pb-author-photo relative z-10 h-full w-full object-contain"
                @error="onPhotoError"
              />
              <!-- Fallback sticker (if photo missing) -->
              <div
                v-else
                class="relative z-10 flex aspect-square w-[82%] items-center justify-center rounded-full"
                :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
              >
                <div class="text-center">
                  <div class="text-[120px] font-black leading-none">AS</div>
                  <div class="mt-2 text-[14px] font-bold uppercase tracking-[0.2em]">{{ brand.founder.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           §2 · MANIFESTO, big 3-line pull quote
           ============================================================ -->
      <div class="relative border-y" :style="{ borderColor: `${brand.colors.border}`, backgroundColor: `${brand.colors.surface}60` }">
        <div class="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
          <div class="mb-8 flex items-center gap-3">
            <span class="h-px w-12" :style="{ backgroundColor: brand.colors.primary }" />
            <span class="pb-eyebrow text-[11px] font-bold uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
              O Manifesto
            </span>
          </div>
          <div
            class="pb-manifesto leading-[0.95] tracking-tight"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(2.5rem, 6.5vw, 5.75rem)',
            }"
          >
            Não existe atalho.<br />
            Existe <span class="pb-sticker" :style="{ color: brand.colors.primary }">método</span>,
            <span class="pb-sticker" :style="{ color: brand.colors.primary }">paciência</span><br />
            e <span class="pb-sticker pb-sticker-outline" :style="{ '--sticker-bg': brand.colors.text, '--sticker-fg': brand.colors.background }">juros compostos.</span>
          </div>
          <div class="mt-12 flex items-center gap-4 text-[13px]" :style="{ color: brand.colors.textMuted }">
            <div class="h-px flex-1 max-w-20" :style="{ backgroundColor: `${brand.colors.border}` }" />
            <span class="font-medium italic">, {{ brand.founder.name }}</span>
          </div>
        </div>
      </div>

      <!-- ============================================================
           §2.5 · CABEÇA QUENTE vs CABEÇA FRIA, character + rankings
           ============================================================
           Mostra os 3 rankings do dia (top altas, top baixas, top FIIs)
           framing eles como o que o "Cabeça Quente" entra em pânico
           olhando, e a Saraiva (cabeça fria) responde com calma. Usa
           homeMarketData.topAssets que já é fetched pra todos os tenants.
      -->
      <div class="relative overflow-hidden">
        <!-- Background flame glow on left side (Cabeça Quente lives here) -->
        <div class="pointer-events-none absolute inset-0">
          <div
            class="absolute -left-32 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full blur-3xl opacity-[0.18]"
            :style="{ background: `radial-gradient(circle, #EF4444, transparent 65%)` }"
          />
          <div
            class="absolute -right-20 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full blur-3xl opacity-15"
            :style="{ background: `radial-gradient(circle, ${brand.colors.primary}, transparent 65%)` }"
          />
        </div>

        <div class="relative mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <!-- Section header -->
          <div class="mb-16 grid items-end gap-8 md:grid-cols-12">
            <div class="md:col-span-7">
              <div class="pb-eyebrow mb-4 text-[11px] font-bold uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
               , Personagens
              </div>
              <h2
                class="leading-[0.95] tracking-tight"
                :style="{
                  color: brand.colors.text,
                  fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                  fontFamily: `'Fredoka', 'Inter', sans-serif`,
                  fontWeight: 700,
                }"
              >
                <span class="pb-sticker pb-sticker-cold" :style="{ color: brand.colors.primary }">Cabeça Fria</span> vs.<br />
                <span class="pb-sticker pb-sticker-hot">Cabeça Quente.</span>
              </h2>
            </div>
            <p class="text-[15px] leading-relaxed md:col-span-5" :style="{ color: `${brand.colors.text}B0` }">
              Dois jeitos de ler o mesmo ranking. Um respira fundo e segura a posição por 10 anos. O outro vende tudo em pânico no fim do dia. <strong :style="{ color: brand.colors.text }">Adivinha qual deles fica rico.</strong>
            </p>
          </div>

          <!-- The villain "card", Cabeça Quente in panic -->
          <div
            class="pb-villain mb-10 flex flex-col items-start gap-6 rounded-3xl border-2 p-8 md:flex-row md:items-center md:gap-10 md:p-12"
            :style="{
              borderColor: '#EF4444',
              backgroundColor: 'rgba(239, 68, 68, 0.06)',
            }"
          >
            <!-- Character avatar (sticker style) -->
            <div class="pb-villain-avatar relative shrink-0">
              <div
                class="flex size-24 items-center justify-center rounded-full md:size-32"
                :style="{
                  backgroundColor: '#EF4444',
                  boxShadow: '0 0 0 4px #0B0B0E, 0 0 0 7px #EF4444, 0 20px 40px -10px rgba(239, 68, 68, 0.6)',
                }"
              >
                <UIcon name="i-lucide-flame" class="size-12 text-white md:size-16" />
              </div>
              <!-- Sweat drops -->
              <div class="pb-sweat absolute -right-2 top-2 size-3 rounded-full bg-blue-300 opacity-80"></div>
              <div class="pb-sweat pb-sweat-2 absolute -left-3 top-6 size-2 rounded-full bg-blue-300 opacity-80"></div>
            </div>

            <div class="flex-1">
              <div class="text-[10px] font-bold uppercase tracking-[0.2em]" style="color: #EF4444;">
                O VILÃO · NÃO FAÇA ISSO
              </div>
              <div class="pb-villain-name mt-2 text-[28px] font-black leading-none md:text-[40px]" :style="{ color: brand.colors.text, fontFamily: `'Fredoka', sans-serif` }">
                Cabeça Quente.
              </div>
              <div class="pb-villain-quote mt-4 text-[15px] italic md:text-[17px]" :style="{ color: `${brand.colors.text}D0` }">
                "CAIU 2%?! VENDE TUDO! SUBIU 3%?! COMPRA MAIS! CADÊ A IA?! AINDA DÁ TEMPO?!"
              </div>
              <div class="mt-3 text-[13px]" :style="{ color: brand.colors.textMuted }">
                Checa o gráfico de 5 em 5 minutos. Já vendeu PETR4 3 vezes só em abril. Segue 40 gurus no Twitter.
              </div>
            </div>
          </div>

          <!-- 3 rankings, what the Cabeça Quente sees and panics about -->
          <div class="grid gap-5 md:grid-cols-3">
            <!-- TOP ALTAS -->
            <div
              class="pb-ranking flex flex-col gap-4 rounded-3xl border p-6 md:p-7"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
            >
              <div class="flex items-center justify-between">
                <div class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                  Top Altas do Dia
                </div>
                <UIcon name="i-lucide-trending-up" class="size-4" :style="{ color: brand.colors.positive }" />
              </div>
              <!-- Cabeça Quente reaction -->
              <div class="flex items-start gap-2 rounded-xl border px-3 py-2.5" style="border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.08);">
                <UIcon name="i-lucide-flame" class="size-3.5 shrink-0 mt-0.5" style="color: #EF4444;" />
                <span class="text-[11px] font-bold leading-tight" style="color: #EF4444;">
                  "PERDI A CORRIDA! COMPRA TUDO!"
                </span>
              </div>
              <!-- Items -->
              <div class="flex flex-col gap-2.5 pt-1">
                <NuxtLink
                  v-for="(stock, i) in (topAssets.top.stocks || []).slice(0, 5)"
                  :key="'top-' + (stock?.ticker || i)"
                  :to="`/asset/${stock?.ticker?.toLowerCase()}`"
                  class="pb-ranking-row flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors"
                  :style="{ color: brand.colors.text }"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="text-[10px] font-bold tabular-nums w-4" :style="{ color: brand.colors.textMuted }">{{ i + 1 }}</span>
                    <NuxtImg
                      v-if="stock?.logo && !failedLogos.isFailed(stock.logo)"
                      :src="stock.logo"
                      :alt="stock?.ticker"
                      class="size-7 rounded-md object-cover"
                      :style="{ backgroundColor: brand.colors.background }"
                      @error="failedLogos.markFailed(stock.logo)"
                    />
                    <div
                      v-else
                      class="flex size-7 items-center justify-center rounded-md text-[9px] font-bold"
                      :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
                    >
                      {{ (stock?.ticker || '??').slice(0, 2) }}
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="text-[12px] font-bold leading-none">{{ stock?.ticker || '-' }}</span>
                      <span class="text-[10px] truncate" :style="{ color: brand.colors.textMuted }">
                        {{ (stock?.name || '').slice(0, 18) }}
                      </span>
                    </div>
                  </div>
                  <span class="text-[12px] font-bold tabular-nums" :style="{ color: brand.colors.positive }">
                    +{{ Number(stock?.change_percent || 0).toFixed(1) }}%
                  </span>
                </NuxtLink>
              </div>
              <!-- Cabeça Fria counter -->
              <div class="mt-auto flex items-start gap-2 border-t pt-4" :style="{ borderColor: brand.colors.border }">
                <UIcon name="i-lucide-snowflake" class="size-3.5 shrink-0 mt-0.5" :style="{ color: brand.colors.primary }" />
                <span class="text-[11px] leading-snug" :style="{ color: brand.colors.textMuted }">
                  <strong :style="{ color: brand.colors.primary }">Cabeça fria:</strong> +5% num dia é ruído. Mostra o mesmo ativo daqui a 5 anos.
                </span>
              </div>
            </div>

            <!-- TOP BAIXAS -->
            <div
              class="pb-ranking flex flex-col gap-4 rounded-3xl border p-6 md:p-7"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
            >
              <div class="flex items-center justify-between">
                <div class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                  Top Quedas do Dia
                </div>
                <UIcon name="i-lucide-trending-down" class="size-4" :style="{ color: brand.colors.negative }" />
              </div>
              <div class="flex items-start gap-2 rounded-xl border px-3 py-2.5" style="border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.08);">
                <UIcon name="i-lucide-flame" class="size-3.5 shrink-0 mt-0.5" style="color: #EF4444;" />
                <span class="text-[11px] font-bold leading-tight" style="color: #EF4444;">
                  "VAI ZERAR! VENDE TUDO AGORA!"
                </span>
              </div>
              <div class="flex flex-col gap-2.5 pt-1">
                <NuxtLink
                  v-for="(stock, i) in (topAssets.bottom.stocks || []).slice(0, 5)"
                  :key="'bot-' + (stock?.ticker || i)"
                  :to="`/asset/${stock?.ticker?.toLowerCase()}`"
                  class="pb-ranking-row flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors"
                  :style="{ color: brand.colors.text }"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="text-[10px] font-bold tabular-nums w-4" :style="{ color: brand.colors.textMuted }">{{ i + 1 }}</span>
                    <NuxtImg
                      v-if="stock?.logo && !failedLogos.isFailed(stock.logo)"
                      :src="stock.logo"
                      :alt="stock?.ticker"
                      class="size-7 rounded-md object-cover"
                      :style="{ backgroundColor: brand.colors.background }"
                      @error="failedLogos.markFailed(stock.logo)"
                    />
                    <div
                      v-else
                      class="flex size-7 items-center justify-center rounded-md text-[9px] font-bold"
                      :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
                    >
                      {{ (stock?.ticker || '??').slice(0, 2) }}
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="text-[12px] font-bold leading-none">{{ stock?.ticker || '-' }}</span>
                      <span class="text-[10px] truncate" :style="{ color: brand.colors.textMuted }">
                        {{ (stock?.name || '').slice(0, 18) }}
                      </span>
                    </div>
                  </div>
                  <span class="text-[12px] font-bold tabular-nums" :style="{ color: brand.colors.negative }">
                    {{ Number(stock?.change_percent || 0).toFixed(1) }}%
                  </span>
                </NuxtLink>
              </div>
              <div class="mt-auto flex items-start gap-2 border-t pt-4" :style="{ borderColor: brand.colors.border }">
                <UIcon name="i-lucide-snowflake" class="size-3.5 shrink-0 mt-0.5" :style="{ color: brand.colors.primary }" />
                <span class="text-[11px] leading-snug" :style="{ color: brand.colors.textMuted }">
                  <strong :style="{ color: brand.colors.primary }">Cabeça fria:</strong> queda boa é desconto. Estuda os fundamentos antes de fugir.
                </span>
              </div>
            </div>

            <!-- TOP FIIS -->
            <div
              class="pb-ranking flex flex-col gap-4 rounded-3xl border p-6 md:p-7"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
            >
              <div class="flex items-center justify-between">
                <div class="text-[10px] font-bold uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                  Top FIIs do Dia
                </div>
                <UIcon name="i-lucide-building-2" class="size-4" :style="{ color: brand.colors.primary }" />
              </div>
              <div class="flex items-start gap-2 rounded-xl border px-3 py-2.5" style="border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.08);">
                <UIcon name="i-lucide-flame" class="size-3.5 shrink-0 mt-0.5" style="color: #EF4444;" />
                <span class="text-[11px] font-bold leading-tight" style="color: #EF4444;">
                  "MAS O DY DESSE TÁ ALTO! ENTRA TODOS!"
                </span>
              </div>
              <div class="flex flex-col gap-2.5 pt-1">
                <NuxtLink
                  v-for="(reit, i) in (topAssets.top.reits || []).slice(0, 5)"
                  :key="'reit-' + (reit?.ticker || i)"
                  :to="`/asset/${reit?.ticker?.toLowerCase()}`"
                  class="pb-ranking-row flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors"
                  :style="{ color: brand.colors.text }"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="text-[10px] font-bold tabular-nums w-4" :style="{ color: brand.colors.textMuted }">{{ i + 1 }}</span>
                    <NuxtImg
                      v-if="reit?.logo && !failedLogos.isFailed(reit.logo)"
                      :src="reit.logo"
                      :alt="reit?.ticker"
                      class="size-7 rounded-md object-cover"
                      :style="{ backgroundColor: brand.colors.background }"
                      @error="failedLogos.markFailed(reit.logo)"
                    />
                    <div
                      v-else
                      class="flex size-7 items-center justify-center rounded-md text-[9px] font-bold"
                      :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
                    >
                      {{ (reit?.ticker || '??').slice(0, 2) }}
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="text-[12px] font-bold leading-none">{{ reit?.ticker || '-' }}</span>
                      <span class="text-[10px] truncate" :style="{ color: brand.colors.textMuted }">
                        {{ (reit?.name || '').slice(0, 18) }}
                      </span>
                    </div>
                  </div>
                  <span class="text-[12px] font-bold tabular-nums" :style="{ color: brand.colors.positive }">
                    +{{ Number(reit?.change_percent || 0).toFixed(1) }}%
                  </span>
                </NuxtLink>
              </div>
              <div class="mt-auto flex items-start gap-2 border-t pt-4" :style="{ borderColor: brand.colors.border }">
                <UIcon name="i-lucide-snowflake" class="size-3.5 shrink-0 mt-0.5" :style="{ color: brand.colors.primary }" />
                <span class="text-[11px] leading-snug" :style="{ color: brand.colors.textMuted }">
                  <strong :style="{ color: brand.colors.primary }">Cabeça fria:</strong> DY alto sem histórico de 5 anos é armadilha. Olha consistência.
                </span>
              </div>
            </div>
          </div>

          <!-- Bottom: the calm hero (Cabeça Fria / Saraiva) responds -->
          <div
            class="pb-hero-card mt-10 flex flex-col items-start gap-6 rounded-3xl border-2 p-8 md:flex-row md:items-center md:gap-10 md:p-12"
            :style="{
              borderColor: brand.colors.primary,
              backgroundColor: `${brand.colors.primary}08`,
            }"
          >
            <!-- Hero avatar (Saraiva photo or sticker) -->
            <div class="shrink-0">
              <NuxtImg
                v-if="brand.hero.image"
                :src="brand.hero.image"
                :alt="brand.founder.name"
                class="size-24 rounded-full object-cover md:size-32"
                :style="{
                  backgroundColor: brand.colors.primary,
                  boxShadow: `0 0 0 4px ${brand.colors.background}, 0 0 0 7px ${brand.colors.primary}, 0 20px 40px -10px ${brand.colors.primary}80`,
                }"
              />
              <div
                v-else
                class="flex size-24 items-center justify-center rounded-full md:size-32"
                :style="{
                  backgroundColor: brand.colors.primary,
                  boxShadow: `0 0 0 4px ${brand.colors.background}, 0 0 0 7px ${brand.colors.primary}, 0 20px 40px -10px ${brand.colors.primary}80`,
                }"
              >
                <UIcon name="i-lucide-snowflake" class="size-12 md:size-16" :style="{ color: brand.colors.background }" />
              </div>
            </div>

            <div class="flex-1">
              <div class="text-[10px] font-bold uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
                O HERÓI · O QUE FAZER
              </div>
              <div class="mt-2 text-[28px] font-black leading-none md:text-[40px]" :style="{ color: brand.colors.text, fontFamily: `'Fredoka', sans-serif` }">
                Cabeça Fria.
              </div>
              <div class="mt-4 text-[15px] italic md:text-[17px]" :style="{ color: `${brand.colors.text}D0` }">
                "Calma. O mercado tá aberto há 200 anos e vai continuar aberto amanhã. Hoje é só um dia."
              </div>
              <div class="mt-6 flex flex-wrap gap-3">
                <NuxtLink
                  to="/auth/register"
                  class="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-bold transition-[transform,opacity,box-shadow,background-color,border-color] hover:-translate-y-0.5"
                  :style="{
                    backgroundColor: brand.colors.primary,
                    color: brand.colors.background,
                    boxShadow: `0 8px 24px -8px ${brand.colors.primary}80`,
                  }"
                >
                  <UIcon name="i-lucide-snowflake" class="size-3.5" />
                  Quero ser cabeça fria
                  <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
                </NuxtLink>
                <NuxtLink
                  to="/calculadora/juros-compostos"
                  class="inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-[12px] font-bold transition-opacity hover:opacity-70"
                  :style="{
                    borderColor: brand.colors.border,
                    color: brand.colors.text,
                  }"
                >
                  Ver juros compostos →
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           §3 · 4 PILARES DO MÉTODO
           ============================================================ -->
      <div class="relative">
        <div class="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <div class="mb-14 grid items-end gap-8 md:grid-cols-12">
            <div class="md:col-span-7">
              <div class="pb-eyebrow mb-4 text-[11px] font-bold uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
               , 4 pilares
              </div>
              <h2
                class="pb-section-title leading-[0.95] tracking-tight"
                :style="{
                  color: brand.colors.text,
                  fontSize: 'clamp(2.25rem, 5vw, 4rem)',
                }"
              >
                O playbook em <span class="pb-sticker" :style="{ color: brand.colors.primary }">4 passos.</span>
              </h2>
            </div>
            <p class="text-[15px] leading-relaxed md:col-span-5" :style="{ color: `${brand.colors.text}B0` }">
              Zero promessa de retorno. Zero palpite. Só o método que eu uso no meu próprio processo, aberto pra você aplicar.
            </p>
          </div>

          <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="(pillar, idx) in playbookPillars"
              :key="pillar.title"
              class="pb-pillar group relative flex flex-col gap-5 overflow-hidden rounded-3xl border p-8 transition-[transform,opacity,box-shadow,background-color,border-color] hover:-translate-y-1 md:p-10"
              :style="{
                borderColor: brand.colors.border,
                backgroundColor: brand.colors.surface,
              }"
            >
              <!-- Big number outline background -->
              <div
                class="pointer-events-none absolute -right-4 -top-8 select-none text-[160px] font-black leading-none"
                :style="{
                  color: 'transparent',
                  WebkitTextStroke: `1.5px ${brand.colors.primary}40`,
                }"
              >
                {{ idx + 1 }}
              </div>

              <div
                class="relative flex size-12 items-center justify-center rounded-2xl"
                :style="{ backgroundColor: `${brand.colors.primary}20`, color: brand.colors.primary }"
              >
                <UIcon :name="pillar.icon" class="size-6" />
              </div>

              <h3 class="relative text-[20px] font-bold leading-tight tracking-tight" :style="{ color: brand.colors.text }">
                {{ pillar.title }}
              </h3>

              <p class="relative text-[13px] leading-relaxed" :style="{ color: brand.colors.textMuted }">
                {{ pillar.description }}
              </p>

              <div class="relative mt-auto inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em]" :style="{ color: brand.colors.primary }">
                <span>{{ pillar.tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           §4 · SIGNATURE QUOTE, big pull quote with sticker author
           ============================================================ -->
      <div class="relative overflow-hidden border-y" :style="{ borderColor: `${brand.colors.border}`, backgroundColor: `${brand.colors.background}` }">
        <div class="pointer-events-none absolute inset-0">
          <div
            class="absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-20"
            :style="{ background: `radial-gradient(ellipse, ${brand.colors.primary}, transparent 60%)` }"
          />
        </div>

        <div class="relative mx-auto max-w-5xl px-6 py-24 md:px-10 md:py-32">
          <div class="mb-8 text-center">
            <div class="inline-block">
              <div class="text-[80px] leading-none" :style="{ color: brand.colors.primary }">"</div>
            </div>
          </div>
          <blockquote
            class="pb-quote text-center leading-[1.2]"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
            }"
          >
            {{ brand.hero.founderQuote }}
          </blockquote>
          <div class="mt-12 flex justify-center">
            <div
              class="pb-quote-author inline-flex items-center gap-3 rounded-full px-6 py-3"
              :style="{
                backgroundColor: brand.colors.primary,
                color: brand.colors.background,
                boxShadow: `0 0 0 3px ${brand.colors.background}, 0 0 0 6px ${brand.colors.primary}, 0 20px 40px -15px ${brand.colors.primary}A0`,
              }"
            >
              <NuxtImg v-if="brand.hero.image" :src="brand.hero.image" :alt="brand.founder.name" width="40" height="40" loading="lazy" decoding="async" class="size-10 rounded-full object-cover" />
              <div class="flex flex-col">
                <span class="text-[13px] font-bold leading-tight">{{ brand.founder.name }}</span>
                <span class="text-[10px] font-medium uppercase tracking-[0.1em] opacity-70">{{ brand.founder.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           §5 · FINAL CTA, simpler, direct
           ============================================================ -->
      <div class="relative">
        <div class="mx-auto max-w-5xl px-6 py-24 text-center md:px-10 md:py-32">
          <div class="pb-eyebrow mb-6 text-[11px] font-bold uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
           , Começar hoje
          </div>
          <h2
            class="pb-final-title leading-[0.92] tracking-tight"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            }"
          >
            Sua carteira em<br />
            <span class="pb-sticker" :style="{ color: brand.colors.primary }">modo método.</span>
          </h2>
          <p class="mx-auto mt-8 max-w-xl text-[16px] leading-relaxed" :style="{ color: `${brand.colors.text}B0` }">
            Grátis pra sempre. Sem cartão, sem trial, sem pegadinha. Você entra e começa hoje.
          </p>
          <div class="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <NuxtLink
              to="/auth/register"
              class="pb-cta-primary group inline-flex items-center gap-3 rounded-full px-10 py-5 text-[15px] font-bold transition-[transform,opacity,box-shadow,background-color,border-color] hover:-translate-y-0.5"
              :style="{
                backgroundColor: brand.colors.primary,
                color: brand.colors.background,
                boxShadow: `0 20px 60px -15px ${brand.colors.primary}A0, 0 0 0 2px ${brand.colors.background}, 0 0 0 4px ${brand.colors.primary}`,
              }"
            >
              <UIcon name="i-lucide-flask-conical" class="size-4" />
              Começar o método
              <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
            </NuxtLink>
          </div>
          <p class="mt-10 text-[11px] font-bold uppercase tracking-[0.2em]" :style="{ color: brand.colors.textMuted }">
            cabeça fria · sem grito · sem guru
          </p>
        </div>
      </div>
    </section>

    <!-- ========== HERO: HOLDER (refined editorial, minimal, sober) ========== -->
    <!--
      Holder variant, REFINED: removido todos os §, texto cortado pela
      metade, Anton reservado APENAS para o wordmark "HOLDER." e o selo
      "HOLD." Tudo o resto em IBM Plex Serif (display + body) ou
      JetBrains Mono (labels + numbers). Mais whitespace, menos texto.

      Estrutura mais sucinta:
        Top strip, chapter index minimal
        Hero split, title serif + portrait
        Wordmark band, "HOLDER." gigante (única peça em Anton)
        Manifesto, 2 parágrafos (era 4)
        Trader vs Holder, 4 linhas (era 7)
        Posições, 5 (era 7)
        Closing quote + selo HOLD.
    -->
    <section
      v-if="brand.hero.variant === 'holder'"
      
      class="holder-hero relative overflow-hidden"
    >
      <!-- ============================================================
           Top strip, chapter index
           ============================================================ -->
      <div
        class="hl-strip relative z-10 border-b"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background }"
      >
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 md:px-10">
          <div class="flex items-center gap-4">
            <span class="hl-mono text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
              Hold
            </span>
            <span class="hl-mono text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
              EDIÇÃO 01 · {{ holderEditionDate }}
            </span>
          </div>
          <div class="flex items-center gap-4">
            <span class="hl-mono text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
              06 CAPÍTULOS
            </span>
            <span class="hl-mono text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
              ⊕
            </span>
          </div>
        </div>
      </div>

      <!-- ============================================================
           1.01 · HERO SPLIT, manifesto + editorial portrait
           ============================================================ -->
      <div class="relative">
        <div class="mx-auto grid max-w-7xl grid-cols-12 gap-0 px-6 md:px-10">
          <!-- LEFT: manifesto + giant headline -->
          <div class="col-span-12 flex flex-col justify-center border-b py-20 lg:col-span-7 lg:border-b-0 lg:border-r lg:py-32 lg:pr-16" :style="{ borderColor: brand.colors.border }">
            <!-- Chapter number -->
            <div class="hl-mono mb-6 text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.textMuted }">
              01 · O Manifesto
            </div>

            <!-- Serif sentencious title, refined: lighter weight + more space -->
            <h1
              class="hl-serif mb-10 leading-[1.1] tracking-tight"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                fontFamily: `'Spectral', 'Georgia', serif`,
                fontWeight: 400,
              }"
            >
              <template v-for="(line, idx) in brand.hero.title.split('\n')" :key="idx">
                <br v-if="idx > 0" />
                <span v-if="idx === 1" class="italic" :style="{ color: brand.colors.primary, fontWeight: 500 }">{{ line }}</span>
                <span v-else>{{ line }}</span>
              </template>
            </h1>

            <!-- Subtitle in serif -->
            <p
              class="hl-serif mb-12 max-w-xl text-[16px] leading-[1.65] md:text-[18px]"
              :style="{
                color: `${brand.colors.text}C0`,
                fontFamily: `'Spectral', 'Georgia', serif`,
              }"
            >
              {{ brand.hero.subtitle }}
            </p>

            <!-- CTAs (sharp, sober, no pill) -->
            <div class="mb-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <NuxtLink
                to="/auth/register"
                class="hl-cta-primary group inline-flex items-center gap-3 px-7 py-4 text-[12px] font-bold uppercase tracking-[0.18em] transition-[transform,opacity,box-shadow,background-color,border-color] hover:-translate-y-0.5"
                :style="{
                  backgroundColor: brand.colors.primary,
                  color: brand.colors.text,
                }"
              >
                <UIcon :name="brand.hero.ctaIcon" class="size-4" />
                {{ brand.hero.ctaLabel }}
                <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
              </NuxtLink>
              <NuxtLink
                to="/auth/login"
                class="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
                :style="{ color: brand.colors.text }"
              >
                <span class="border-b-2 pb-1" :style="{ borderColor: brand.colors.text }">{{ brand.hero.ctaSecondaryLabel }}</span>
              </NuxtLink>
            </div>

            <!-- Trust indicators, minimal, sober -->
            <div class="flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-6" :style="{ borderColor: brand.colors.border }">
              <div
                v-for="(t, i) in brand.hero.trustIndicators"
                :key="i"
                class="hl-mono flex items-center gap-2 text-[10px] uppercase tracking-[0.18em]"
                :style="{ color: brand.colors.textMuted }"
              >
                <span :style="{ color: brand.colors.primary }">·</span>
                {{ t }}
              </div>
            </div>
          </div>

          <!-- RIGHT: editorial portrait, full-bleed, tall -->
          <div class="col-span-12 flex items-stretch justify-center lg:col-span-5">
            <div class="relative h-full min-h-[520px] w-full overflow-hidden lg:min-h-[760px]">
              <!-- Vertical "H." mark top-left, like the asset cover -->
              <div
                class="hl-display absolute left-6 top-6 z-10 select-none text-[80px] leading-none md:left-10 md:top-10 md:text-[100px]"
                :style="{
                  color: brand.colors.primary,
                  fontFamily: `'Anton', 'Bebas Neue', sans-serif`,
                  fontWeight: 400,
                }"
              >
                H.
              </div>

              <!-- Photo full-bleed -->
              <NuxtImg
                v-if="brand.hero.image"
                :src="brand.hero.image"
                :alt="brand.founder.name"
                class="hl-portrait absolute inset-0 h-full w-full object-cover object-top"
                @error="onPhotoError"
              />
              <!-- Fallback solid block -->
              <div
                v-else
                class="absolute inset-0 flex items-end justify-center pb-16"
                :style="{ backgroundColor: brand.colors.surface }"
              >
                <div
                  class="hl-display text-[100px] leading-none md:text-[140px]"
                  :style="{
                    color: brand.colors.primary,
                    fontFamily: `'Anton', 'Bebas Neue', sans-serif`,
                  }"
                >
                  HOLDER.
                </div>
              </div>

              <!-- Subtle gradient bottom for legibility -->
              <div class="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           1.02 · TICKER CAROUSEL, elegant horizontal marquee
           ============================================================
           Substitui o "HOLDER." gigante por um carrossel sutil de
           tickers do dia. Estilo elegante (Spectral + JetBrains Mono),
           loop infinito, sem hype. Movimento lento e calmo, igual o
           pitch da marca.
      -->
      <div class="hl-marquee-band relative overflow-hidden border-y" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background }">
        <div class="hl-marquee py-8 md:py-10">
          <div class="hl-marquee-track">
            <!-- Render the ticker list TWICE so the loop is seamless -->
            <template v-for="copy in [0, 1]" :key="copy">
              <div
                v-for="(t, i) in holderTickerCarousel"
                :key="copy + '-' + (t.ticker || i)"
                class="hl-marquee-item flex items-baseline gap-3 px-8"
              >
                <span
                  class="hl-mono text-[14px] tabular-nums md:text-[16px]"
                  :style="{
                    color: brand.colors.primary,
                    fontFamily: `'JetBrains Mono', monospace`,
                    letterSpacing: '0.03em',
                  }"
                >
                  {{ t.ticker }}
                </span>
                <span
                  class="hl-serif italic text-[14px] md:text-[16px]"
                  :style="{
                    color: `${brand.colors.text}A0`,
                    fontFamily: `'Spectral', 'Georgia', serif`,
                  }"
                >
                  {{ t.name }}
                </span>
                <span
                  class="hl-mono text-[14px] tabular-nums md:text-[16px]"
                  :style="{
                    color: (t.change ?? 0) >= 0 ? brand.colors.positive : brand.colors.negative,
                    fontFamily: `'JetBrains Mono', monospace`,
                  }"
                >
                  {{ (t.change ?? 0) >= 0 ? '+' : '' }}{{ Number(t.change || 0).toFixed(2) }}%
                </span>
                <span
                  class="hl-mono text-[12px] md:text-[14px]"
                  :style="{ color: `${brand.colors.text}50`, fontFamily: `'JetBrains Mono', monospace` }"
                >
                  ·
                </span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- ============================================================
           2.01 · MANIFESTO LONG-FORM (4 parágrafos sentenciosos)
           ============================================================ -->
      <div class="relative">
        <div class="mx-auto grid max-w-6xl grid-cols-12 gap-12 px-6 py-24 md:px-10 md:py-32">
          <div class="col-span-12 md:col-span-3">
            <div class="hl-mono mb-3 text-[10px] uppercase tracking-[0.22em] sticky top-24" :style="{ color: brand.colors.primary }">
              02 · A Doutrina
            </div>
          </div>
          <div class="col-span-12 md:col-span-9">
            <div class="hl-serif flex flex-col gap-8 text-[19px] leading-[1.7] md:text-[22px]" :style="{ color: brand.colors.text, fontFamily: `'Spectral', 'Georgia', serif` }">
              <p>
                Quem compra ação olha pro gráfico. Quem compra empresa olha pro balanço. <em :style="{ color: brand.colors.primary }">A primeira é apostar. A segunda é investir.</em>
              </p>
              <p>
                Eu não dou sinal de compra. Eu te ensino a pensar como dono de negócio, e quando você internalizar, não precisa mais de mim.
              </p>
            </div>
            <!-- Signature -->
            <div class="hl-mono mt-16 flex items-center gap-4 text-[11px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.textMuted }">
              <span class="h-px flex-1 max-w-12" :style="{ backgroundColor: brand.colors.border }" />
              <span :style="{ color: brand.colors.primary }">, @holder</span>
              <span class="h-px flex-1" :style="{ backgroundColor: brand.colors.border }" />
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           3.01 · TRADER vs HOLDER, comparative table
           ============================================================ -->
      <div class="relative border-y" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
        <div class="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <div class="mb-14">
            <div class="hl-mono mb-3 text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
              03 · Comparativo
            </div>
            <h2
              class="hl-serif leading-[1.1]"
              :style="{
                color: brand.colors.text,
                fontFamily: `'Spectral', 'Georgia', serif`,
                fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)',
                fontWeight: 400,
              }"
            >
              Trader vs.<br />
              <em :style="{ color: brand.colors.primary, fontWeight: 500 }">Holder.</em>
            </h2>
            <p class="hl-serif mt-6 max-w-xl text-[16px] italic" :style="{ color: brand.colors.textMuted, fontFamily: `'Spectral', 'Georgia', serif` }">
              Dois jeitos de existir no mercado. Apenas um sobrevive a um ciclo completo.
            </p>
          </div>

          <div class="grid gap-px overflow-hidden border" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }">
            <div class="grid gap-px md:grid-cols-2">
              <div
                v-for="(row, idx) in holderTraderTable"
                :key="'col-header-' + idx"
                class="hl-mono px-6 py-5 text-[11px] uppercase tracking-[0.18em]"
                :class="idx === 1 ? 'border-l-2' : ''"
                :style="{
                  backgroundColor: brand.colors.background,
                  borderColor: idx === 1 ? brand.colors.primary : 'transparent',
                  color: idx === 1 ? brand.colors.primary : brand.colors.textMuted,
                }"
              >
                {{ idx === 0 ? 'TRADER' : 'HOLDER' }}
              </div>
            </div>
            <div
              v-for="(row, idx) in holderTraderRows"
              :key="'row-' + idx"
              class="grid gap-px md:grid-cols-2"
            >
              <div class="px-6 py-5 text-[14px]" :style="{ backgroundColor: brand.colors.background, color: brand.colors.textMuted, fontFamily: `'Spectral', 'Georgia', serif` }">
                {{ row.trader }}
              </div>
              <div class="border-l-2 px-6 py-5 text-[14px]" :style="{ backgroundColor: brand.colors.background, borderColor: brand.colors.primary, color: brand.colors.text, fontFamily: `'Spectral', 'Georgia', serif` }">
                <strong :style="{ color: brand.colors.primary }">→</strong> {{ row.holder }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           4.01 · § POSIÇÕES, mostradas só no quarter
           ============================================================ -->
      <div class="relative">
        <div class="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
          <div class="mb-12 grid items-end gap-8 md:grid-cols-12">
            <div class="md:col-span-7">
              <div class="hl-mono mb-3 text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
                04 · Posições
              </div>
              <h2
                class="hl-serif leading-[1.1]"
                :style="{
                  color: brand.colors.text,
                  fontFamily: `'Spectral', 'Georgia', serif`,
                  fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                  fontWeight: 400,
                }"
              >
                Eu detenho<br />
                <em :style="{ color: brand.colors.primary, fontWeight: 500 }">apenas estas.</em>
              </h2>
            </div>
            <p class="hl-serif text-[15px] italic md:col-span-5" :style="{ color: brand.colors.textMuted, fontFamily: `'Spectral', 'Georgia', serif` }">
              Eu revelo a carteira inteira uma vez por trimestre. Sempre as mesmas. Quase nunca trocadas. A última vez que mudei algo foi há oito meses.
            </p>
          </div>

          <!-- Position cards, minimal, sharp -->
          <div class="grid gap-0 border" :style="{ borderColor: brand.colors.border }">
            <div
              v-for="(pos, idx) in holderPositions"
              :key="pos.ticker"
              class="grid grid-cols-12 items-center gap-4 border-b px-6 py-6 last:border-b-0 md:px-10"
              :style="{ borderColor: brand.colors.border }"
            >
              <!-- Index -->
              <div class="col-span-1 hl-mono text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
                {{ String(idx + 1).padStart(2, '0') }}
              </div>
              <!-- Ticker -->
              <div class="col-span-3 md:col-span-2">
                <div class="hl-mono text-[20px] tabular-nums md:text-[24px]" :style="{ color: brand.colors.primary, fontFamily: `'JetBrains Mono', monospace`, letterSpacing: '0.02em' }">
                  {{ pos.ticker }}
                </div>
              </div>
              <!-- Name + thesis -->
              <div class="col-span-8 md:col-span-7">
                <div class="hl-mono text-[10px] uppercase tracking-[0.16em]" :style="{ color: brand.colors.primary }">
                  {{ pos.sector }}
                </div>
                <div class="hl-serif mt-1 text-[14px] italic md:text-[15px]" :style="{ color: brand.colors.text, fontFamily: `'Spectral', 'Georgia', serif` }">
                  "{{ pos.thesis }}"
                </div>
              </div>
              <!-- Held since -->
              <div class="col-span-12 md:col-span-2 md:text-right">
                <div class="hl-mono text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
                  Detido desde
                </div>
                <div class="hl-mono mt-0.5 text-[15px] tabular-nums" :style="{ color: brand.colors.text }">
                  {{ pos.since }}
                </div>
              </div>
            </div>
          </div>

          <p class="hl-mono mt-8 text-center text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.textMuted }">
            ⊕ próxima revelação · Q3 · 30 jun
          </p>
        </div>
      </div>

      <!-- ============================================================
           5.01 · § POR QUÊ, long-form intro
           ============================================================ -->
      <div class="relative border-y" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
        <div class="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
          <div class="grid grid-cols-12 gap-12">
            <div class="col-span-12 md:col-span-3">
              <div class="hl-mono mb-3 text-[10px] uppercase tracking-[0.22em] sticky top-24" :style="{ color: brand.colors.primary }">
                05 · Por Quê
              </div>
            </div>
            <div class="col-span-12 md:col-span-9">
              <h2
                class="hl-serif leading-[1.1]"
                :style="{
                  color: brand.colors.text,
                  fontFamily: `'Spectral', 'Georgia', serif`,
                  fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
                  fontWeight: 400,
                }"
              >
                Por que ainda<br />
                <em :style="{ color: brand.colors.primary, fontWeight: 500 }">detenho ITUB4.</em>
              </h2>
              <p class="hl-serif mt-10 text-[19px] leading-[1.7]" :style="{ color: `${brand.colors.text}D0`, fontFamily: `'Spectral', 'Georgia', serif` }">
                Comprei a R$&nbsp;26,80 em 2014. Hoje a R$&nbsp;46. <em :style="{ color: brand.colors.primary }">A parte do gráfico é a menos importante</em>, o que importa são os 9 anos de dividendos pagos no meio do caminho, sem precisar vender uma posição.
              </p>
              <NuxtLink
                to="#"
                class="hl-mono mt-12 inline-flex items-center gap-3 border-b-2 pb-2 text-[11px] uppercase tracking-[0.22em]"
                :style="{ color: brand.colors.primary, borderColor: brand.colors.primary }"
              >
                Continuar leitura →
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           6.01 · QUOTE FINAL + ASSINATURA
           ============================================================ -->
      <div class="relative">
        <div class="mx-auto max-w-5xl px-6 py-24 text-center md:px-10 md:py-32">
          <div class="hl-mono mb-8 text-[10px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.primary }">
            06 · Assinatura
          </div>
          <blockquote
            class="hl-serif italic leading-[1.25]"
            :style="{
              color: brand.colors.text,
              fontFamily: `'Spectral', 'Georgia', serif`,
              fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
              fontWeight: 400,
            }"
          >
            "{{ brand.hero.founderQuote }}"
          </blockquote>
          <div class="hl-mono mt-12 flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.22em]" :style="{ color: brand.colors.textMuted }">
            <span class="h-px w-12" :style="{ backgroundColor: brand.colors.border }" />
            <span :style="{ color: brand.colors.primary }">, @holder</span>
            <span class="h-px w-12" :style="{ backgroundColor: brand.colors.border }" />
          </div>

          <div class="mt-16">
            <NuxtLink
              to="/auth/register"
              class="hl-cta-primary group inline-flex items-center gap-3 px-10 py-5 text-[12px] font-bold uppercase tracking-[0.18em] transition-[transform,opacity,box-shadow,background-color,border-color] hover:-translate-y-0.5"
              :style="{
                backgroundColor: brand.colors.primary,
                color: brand.colors.text,
              }"
            >
              <UIcon name="i-lucide-anchor" class="size-4" />
              Tornar-se holder
              <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
            </NuxtLink>
          </div>

          <p class="hl-display mt-16 text-[60px] leading-none md:text-[80px]" :style="{ color: brand.colors.primary, fontFamily: `'Anton', sans-serif`, letterSpacing: '0.02em' }">
            HOLD.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { IAsset } from '~/types/asset'
import { useFormat } from '~/composables/useFormat'

// Props alimentadas pela pagina pai (pages/index.vue) para passar ao
// hero variant 'quiet' o estado real do mercado, evitando que o
// componente faca seu proprio fetch e duplique requests.
type IbovPoint = { date: string; value: number; timestamp: number }
const props = withDefaults(
  defineProps<{
    ibovSeries?: IbovPoint[]
    ibovLastPrice?: number
    ibovIndicator?: string
    ibovVariationColor?: string
    ifixLastPrice?: number
    ifixIndicator?: string
  }>(),
  {
    ibovSeries: () => [] as IbovPoint[],
    ibovLastPrice: 0,
    ibovIndicator: '+0,00%',
    ibovVariationColor: undefined,
    ifixLastPrice: 0,
    ifixIndicator: '+0,00%',
  },
)

const ibovSeries = computed(() => props.ibovSeries)
const ibovLastPrice = computed(() => props.ibovLastPrice)
const ibovIndicator = computed(() => props.ibovIndicator)
const ibovVariationColor = computed(() => props.ibovVariationColor)
const ifixLastPrice = computed(() => props.ifixLastPrice)
const ifixIndicator = computed(() => props.ifixIndicator)

const brand = useBrand()
const failedLogos = useFailedLogos()
const fmt = useFormat()

// Gate for client-only renders (typewriter + market ticker), avoids
// SSR/hydration mismatches by rendering identical markup on both sides
// initially, then flipping to client content after mount.
const isMounted = ref(false)
onMounted(() => { isMounted.value = true })

// ==========================================================
// TERMINAL HERO (Redentia, Bloomberg-reimagined)
// ==========================================================

// Keyboard shortcut hint matches the platform. Defaults to '⌘' so the
// SSR and initial client paint align; a tiny mounted-time check
// switches it to 'Ctrl' on non-Mac platforms.
const shortcutModifier = ref('⌘')
onMounted(() => {
  if (typeof navigator !== 'undefined' && !/Mac|iP(hone|ad)/.test(navigator.platform)) {
    shortcutModifier.value = 'Ctrl'
  }
})

// Triggers the global QuickSearch by dispatching a synthetic ⌘K. The
// QuickSearch component listens for that exact key combo on document,
// so we don't need any shared state or imperative ref plumbing.
function openQuickSearch() {
  if (typeof document === 'undefined') return
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      ctrlKey: true,
      bubbles: true,
    }),
  )
}

// ==========================================================
// EDITORIAL HERO, Norte Capital "letter from your advisor"
// ==========================================================

// Full-spelled date, editorial style: "Sexta-feira, 10 de abril de 2026"
const editorialDate = computed(() => {
  try {
    const d = new Date()
    const full = d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    // Capitalize first letter ("sexta-feira" -> "Sexta-feira")
    return full.charAt(0).toUpperCase() + full.slice(1)
  } catch {
    return ''
  }
})

// Ritual items, Chapter II of the editorial home. Fictional but realistic.
const editorialRitual = [
  {
    title: 'Carta mensal do seu assessor',
    body: 'Toda primeira sexta-feira do mês, você recebe uma nota pessoal do seu assessor com o que aconteceu na sua carteira, o que foi revisado e o que está em análise. É uma carta, não um dashboard.',
  },
  {
    title: 'Reunião trimestral',
    body: 'A cada trimestre, nos encontramos, presencial ou por vídeo, para revisar a carteira à luz dos seus objetivos. Sem script, sem apresentação de vendas, sem tempo limitado.',
  },
  {
    title: 'Plataforma sempre aberta',
    body: 'Entre as conversas, você acompanha tudo aqui: carteira consolidada, proventos recebidos, próximos vencimentos e as últimas observações do seu assessor. O que importa, quando importa.',
  },
]

// Metrics narrated editorially instead of as vanity counters.
const editorialMetrics = [
  {
    label: 'Famílias atendidas',
    value: '84',
    unit: '',
    note: 'Limitamos o número de clientes por assessor. Quando chegamos ao limite, abrimos lista de espera.',
  },
  {
    label: 'Patrimônio sob consultoria',
    value: 'R$ 412',
    unit: 'mi',
    note: 'Ticket médio de R$ 4,9 milhões por família. Trabalhamos com patrimônios em construção e consolidados.',
  },
  {
    label: 'Anos de mercado',
    value: '18',
    unit: '',
    note: 'Assessoria fundada em 2008, durante a crise financeira. Atravessamos três ciclos completos ao lado dos nossos clientes.',
  },
]

// ==========================================================
// RESEARCH HERO, Investidor Sardinha "AUVP analyst desk"
// ==========================================================

const researchDate = computed(() => {
  try {
    const d = new Date()
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).replace(/^./, (c) => c.toUpperCase())
  } catch {
    return ''
  }
})

interface SardinhaMover {
  ticker: string
  name: string
  price: number
  change: number
}

const researchTopGainers = ref<SardinhaMover[]>([
  { ticker: 'PETR4', name: 'Petrobras PN', price: 38.45, change: 4.18 },
  { ticker: 'VALE3', name: 'Vale ON', price: 62.12, change: 3.76 },
  { ticker: 'WEGE3', name: 'WEG ON', price: 52.30, change: 3.24 },
  { ticker: 'ITUB4', name: 'Itaú Unibanco PN', price: 31.78, change: 2.85 },
  { ticker: 'BBAS3', name: 'Banco do Brasil ON', price: 28.90, change: 2.41 },
  { ticker: 'BBDC4', name: 'Bradesco PN', price: 14.22, change: 2.15 },
  { ticker: 'MGLU3', name: 'Magazine Luiza ON', price: 12.45, change: 1.98 },
  { ticker: 'B3SA3', name: 'B3 ON', price: 11.08, change: 1.76 },
  { ticker: 'RENT3', name: 'Localiza ON', price: 44.20, change: 1.52 },
  { ticker: 'SUZB3', name: 'Suzano ON', price: 56.78, change: 1.34 },
])

const researchTopLosers = ref<SardinhaMover[]>([
  { ticker: 'AMER3', name: 'Americanas ON', price: 1.28, change: -5.82 },
  { ticker: 'CVCB3', name: 'CVC ON', price: 3.45, change: -4.18 },
  { ticker: 'NTCO3', name: 'Natura ON', price: 13.22, change: -3.65 },
  { ticker: 'COGN3', name: 'Cogna ON', price: 2.08, change: -3.12 },
  { ticker: 'CYRE3', name: 'Cyrela ON', price: 21.40, change: -2.78 },
  { ticker: 'PRIO3', name: 'PetroRio ON', price: 42.15, change: -2.45 },
  { ticker: 'USIM5', name: 'Usiminas PNA', price: 7.80, change: -2.18 },
  { ticker: 'CSNA3', name: 'CSN ON', price: 14.60, change: -1.92 },
  { ticker: 'GOAU4', name: 'Metalúrgica Gerdau PN', price: 9.25, change: -1.65 },
  { ticker: 'MRFG3', name: 'Marfrig ON', price: 11.12, change: -1.48 },
])

const researchHeroMarket = computed(() => [
  { label: 'IBOVESPA', note: 'Índice de referência · pontos', value: '127.834', changePct: 1.12 },
  { label: 'IFIX', note: 'Fundos imobiliários · pontos', value: '3.410', changePct: 0.49 },
  { label: 'USD/BRL', note: 'Dólar comercial · fechamento', value: 'R$\u00A05,08', changePct: -0.34 },
  { label: 'Selic', note: 'Meta · ao ano', value: '10,50%', changePct: 0 },
  { label: 'CDI', note: '12 meses · acumulado', value: '11,28%', changePct: 0 },
])

const researchScreener = [
  { ticker: 'BBAS3', name: 'Banco do Brasil ON', sector: 'Bancos', pl: '5,4', pvp: '0,68', roe: '12,5%', dy: '7,7%' },
  { ticker: 'ITSA4', name: 'Itaúsa PN', sector: 'Holding financeira', pl: '7,1', pvp: '0,92', roe: '13,8%', dy: '6,9%' },
  { ticker: 'BBSE3', name: 'BB Seguridade ON', sector: 'Seguros', pl: '9,8', pvp: '2,12', roe: '42,1%', dy: '9,2%' },
  { ticker: 'TAEE11', name: 'Taesa Unit', sector: 'Energia elétrica', pl: '8,6', pvp: '1,45', roe: '17,2%', dy: '8,4%' },
  { ticker: 'VIVT3', name: 'Vivo ON', sector: 'Telecom', pl: '11,2', pvp: '1,08', roe: '10,6%', dy: '6,1%' },
  { ticker: 'EGIE3', name: 'Engie ON', sector: 'Energia elétrica', pl: '8,9', pvp: '2,34', roe: '26,4%', dy: '7,2%' },
  { ticker: 'KLBN11', name: 'Klabin Unit', sector: 'Papel e celulose', pl: '10,4', pvp: '1,82', roe: '17,8%', dy: '5,8%' },
  { ticker: 'WEGE3', name: 'WEG ON', sector: 'Bens industriais', pl: '14,6', pvp: '3,12', roe: '22,1%', dy: '2,4%' },
  { ticker: 'CPFE3', name: 'CPFL Energia ON', sector: 'Energia elétrica', pl: '9,2', pvp: '2,08', roe: '22,5%', dy: '6,5%' },
  { ticker: 'SAPR11', name: 'Sanepar Unit', sector: 'Saneamento', pl: '6,2', pvp: '0,96', roe: '15,4%', dy: '5,2%' },
]

const researchSectors = [
  { sector: 'Bancos', count: 18, avgPL: '6,8', avgDY: '7,2%', highlight: 'BBAS3 · ITSA4' },
  { sector: 'Energia elétrica', count: 24, avgPL: '9,4', avgDY: '6,8%', highlight: 'TAEE11 · EGIE3' },
  { sector: 'Saneamento', count: 6, avgPL: '7,1', avgDY: '5,4%', highlight: 'SAPR11 · SBSP3' },
  { sector: 'Telecom', count: 4, avgPL: '11,8', avgDY: '5,2%', highlight: 'VIVT3' },
  { sector: 'Bens industriais', count: 32, avgPL: '13,2', avgDY: '3,1%', highlight: 'WEGE3 · RAIL3' },
  { sector: 'Commodities', count: 28, avgPL: '8,5', avgDY: '4,8%', highlight: 'VALE3 · SUZB3' },
  { sector: 'Varejo', count: 41, avgPL: '18,6', avgDY: '2,4%', highlight: 'ASAI3 · LREN3' },
  { sector: 'Seguros', count: 8, avgPL: '10,1', avgDY: '6,9%', highlight: 'BBSE3 · PSSA3' },
]

const researchDividends = [
  { exDate: '12/04', payDate: '22/04', ticker: 'BBAS3', type: 'Dividendo', amount: '0,58', unitDY: '2,0%' },
  { exDate: '15/04', payDate: '28/04', ticker: 'TAEE11', type: 'Dividendo', amount: '0,84', unitDY: '2,6%' },
  { exDate: '17/04', payDate: '30/04', ticker: 'ITSA4', type: 'JCP', amount: '0,12', unitDY: '1,3%' },
  { exDate: '19/04', payDate: '05/05', ticker: 'BBSE3', type: 'Dividendo', amount: '1,20', unitDY: '3,2%' },
  { exDate: '22/04', payDate: '07/05', ticker: 'EGIE3', type: 'JCP', amount: '0,92', unitDY: '2,1%' },
  { exDate: '25/04', payDate: '12/05', ticker: 'VIVT3', type: 'Dividendo', amount: '0,65', unitDY: '1,5%' },
  { exDate: '29/04', payDate: '15/05', ticker: 'CPFE3', type: 'Dividendo', amount: '1,08', unitDY: '2,4%' },
  { exDate: '02/05', payDate: '19/05', ticker: 'KLBN11', type: 'Dividendo', amount: '0,42', unitDY: '1,8%' },
]

const researchAnalystNotes = [
  {
    ticker: 'BBAS3',
    date: '10 abr 2026',
    title: 'Banco do Brasil: o desconto do estatal está exagerado?',
    excerpt: 'Múltiplo de 5,4× lucros e DY de 7,7% colocam o BB em faixa historicamente barata frente a pares. Carteira rural segura a tese.',
    verdict: 'Passa nos filtros',
  },
  {
    ticker: 'ITSA4',
    date: '08 abr 2026',
    title: 'Itaúsa: a holding vale mais do que a soma das partes?',
    excerpt: 'Desconto persistente sobre NAV e exposição diversificada para além do Itaú. Veículo eficiente para exposição ao setor financeiro.',
    verdict: 'Passa nos filtros',
  },
  {
    ticker: 'WEGE3',
    date: '05 abr 2026',
    title: 'WEG: múltiplo esticado ou crescimento precificado?',
    excerpt: 'P/L de 14,6× reflete expectativa de crescimento consistente. ROE de 22% valida a tese de moat, mas exige convicção.',
    verdict: 'Neutro · estudar',
  },
  {
    ticker: 'MGLU3',
    date: '02 abr 2026',
    title: 'Magazine Luiza: value trap ou virada operacional?',
    excerpt: 'Margens pressionadas e endividamento elevado. Enquanto não houver melhora estrutural, não passa no filtro de qualidade.',
    verdict: 'Não passa',
  },
  {
    ticker: 'TAEE11',
    date: '28 mar 2026',
    title: 'Taesa: rendimento contratado e previsibilidade',
    excerpt: 'Concessões de transmissão de longo prazo e DY consistente. Clássico ativo de geração de caixa para quem busca renda passiva.',
    verdict: 'Passa nos filtros',
  },
]

const researchAUVPEcosystem = [
  {
    kind: 'CURSO · ESCOLA',
    title: 'AUVP Escola',
    body: 'O curso completo de análise fundamentalista. Mais de 90 horas de aula com Raul Sena, método proprietário e comunidade ativa de alunos. O ponto de partida pra quem quer ir além da plataforma.',
    cta: 'Conhecer a escola',
    url: 'https://auvp.com.br',
  },
  {
    kind: 'CONSULTORIA',
    title: 'AUVP Capital',
    body: 'Consultoria de investimentos registrada CVM, liderada pela equipe do Raul. Para quem já tem patrimônio formado e quer acompanhamento profissional baseado no mesmo método do canal.',
    cta: 'Falar com a Capital',
    url: 'https://auvpcapital.com.br',
  },
  {
    kind: 'PLATAFORMA',
    title: 'AUVP Analítica',
    body: 'Indicadores avançados, screener completo e comparativos de pares. A camada técnica que complementa o estudo iniciado aqui nesta página.',
    cta: 'Explorar ferramentas',
    url: 'https://analitica.auvp.com.br',
  },
  {
    kind: 'LIVRO',
    title: 'Investidor Sardinha · o livro',
    body: 'A síntese em papel do que o canal ensina há anos. Leitura obrigatória para quem prefere livro a vídeo, ou quer um material pra revisar sempre que o mercado testar sua convicção.',
    cta: 'Ver na Amazon',
    url: 'https://amzn.to/investidorsardinha',
  },
  {
    kind: 'CANAL · YOUTUBE',
    title: 'Investidor Sardinha no YouTube',
    body: 'Mais de 1,3 milhão de sardinhas estudando junto. Análises semanais, lives com convidados, tutoriais do método. O ponto de entrada original do ecossistema.',
    cta: 'Abrir o canal',
    url: 'https://youtube.com/@oraulsena',
  },
  {
    kind: 'COMUNIDADE',
    title: 'Grupo VIP · Telegram',
    body: 'Canal oficial com alertas, materiais exclusivos e debate diário da mesa de análise. Fechado para assinantes da plataforma e alunos AUVP.',
    cta: 'Entrar no grupo',
    url: 'https://t.me/investidorsardinha',
  },
]

function formatSardinhaPrice(n: number | string): string {
  return fmt.brl(n)
}

onMounted(async () => {
  if (brand.hero.variant !== 'research') return
  try {
    const service = useAssetsService()
    const [top, bottom] = await Promise.all([
      service.getTopStocks('top', 500_000),
      service.getTopStocks('bottom', 500_000),
    ])
    const toMover = (x: any): SardinhaMover => ({
      ticker: x?.ticker || x?.symbol || '',
      name: (x?.name || '').trim(),
      price: Number(x?.market_price) || 0,
      change: Number(x?.change_percent) || 0,
    })
    if (Array.isArray(top) && top.length >= 5) {
      researchTopGainers.value = top.slice(0, 10).map(toMover)
    }
    if (Array.isArray(bottom) && bottom.length >= 5) {
      researchTopLosers.value = bottom.slice(0, 10).map(toMover)
    }
  } catch {
    // keep seeded fallback
  }
})

// ==========================================================
// MENTOR HERO, Primo Rico "book-cover / masterclass"
// ==========================================================

const mentorArcaPillars = [
  {
    letter: 'A · AÇÕES',
    label: 'Patrimônio de longo prazo',
    description: 'Large caps, small caps e dividendos. Empresas que geram valor por décadas, não operações de curto prazo.',
    to: '/acoes',
  },
  {
    letter: 'R · REAL ESTATE',
    label: 'Renda passiva mensal',
    description: 'Fundos imobiliários com rendimento isento de imposto. Eficiência tributária que só a PF brasileira tem.',
    to: '/fiis',
  },
  {
    letter: 'C · CAIXA',
    label: 'Reserva estratégica',
    description: 'Tesouro Direto, CDB, LCI/LCA. A base que protege o patrimônio nos momentos em que o mercado testa sua convicção.',
    to: '/dividendos',
  },
  {
    letter: 'A · ATIVOS ALTERNATIVOS',
    label: 'Diversificação global',
    description: 'ETFs internacionais, BDRs e exposição externa. Risco controlado, retorno assimétrico, moeda forte.',
    to: '/etfs',
  },
]

const mentorStats = [
  { value: '7M+', label: 'Seguidores no ecossistema' },
  { value: '2M+', label: 'Livros vendidos' },
  { value: '15+', label: 'Anos no mercado' },
  { value: '12.500+', label: 'Ativos monitorados' },
]

// ==========================================================
// "Showtime", Me Poupe! TV-show variant helpers
// ==========================================================

const showtimeDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).toUpperCase()
})

const showtimeCharacters = [
  {
    name: 'Margarete',
    role: 'A MASCOTE',
    icon: 'i-lucide-utensils',
    quote: 'Mexe no dinheiro igual eu mexo na panela, com carinho e atenção!',
    body: 'A colher de pau que virou símbolo de quem cuida do próprio bolso. Na cozinha e nas finanças, ela é a chefe.',
    cta: 'Conhecer a Margarete',
  },
  {
    name: 'Sidnelson',
    role: 'O VILÃO',
    icon: 'i-lucide-credit-card',
    quote: 'Parcela em 12x sem juros que eu resolvo... (spoiler: não resolve)',
    body: 'O cara que vende crédito fácil, convence você a trocar o carro todo ano e adora um financiamento. Fuja dele.',
    cta: 'Como driblar o Sidnelson',
  },
  {
    name: 'Juro Composto',
    role: 'O SUPER-HERÓI',
    icon: 'i-lucide-trending-up',
    quote: 'Me dê tempo e paciência, eu devolvo liberdade financeira.',
    body: 'A oitava maravilha do mundo. Quando está do seu lado, trabalha pra você 24h. Quando está contra, te devora.',
    cta: 'Ver ele em ação',
  },
]

const showtimeQuestions = [
  {
    category: 'SOCORRO GERAL',
    icon: 'i-lucide-life-buoy',
    text: 'Tô devendo no cartão, começo por onde?',
  },
  {
    category: 'RESERVA DE EMERGÊNCIA',
    icon: 'i-lucide-shield-check',
    text: 'Quanto preciso pra me sentir segura?',
  },
  {
    category: 'PRIMEIROS INVESTIMENTOS',
    icon: 'i-lucide-sprout',
    text: 'Posso começar a investir com 100 reais?',
  },
  {
    category: 'APOSENTADORIA',
    icon: 'i-lucide-palm-tree',
    text: 'Como parar de depender do INSS?',
  },
  {
    category: 'FILHOS',
    icon: 'i-lucide-baby',
    text: 'Quanto guardar pra faculdade do meu filho?',
  },
  {
    category: 'CASA PRÓPRIA',
    icon: 'i-lucide-home',
    text: 'Financiar ou juntar e comprar à vista?',
  },
]

interface ShowtimeMover {
  ticker: string
  name: string
  change: number
}

const showtimeGainers = ref<ShowtimeMover[]>([
  { ticker: 'MGLU3', name: 'Magazine Luiza', change: 8.42 },
  { ticker: 'COGN3', name: 'Cogna Educação', change: 6.91 },
  { ticker: 'IRBR3', name: 'IRB Brasil RE', change: 5.77 },
  { ticker: 'AZUL4', name: 'Azul Linhas Aéreas', change: 5.34 },
  { ticker: 'CVCB3', name: 'CVC Brasil', change: 4.88 },
])

const showtimeLosers = ref<ShowtimeMover[]>([
  { ticker: 'VALE3', name: 'Vale', change: -3.21 },
  { ticker: 'PETR4', name: 'Petrobras PN', change: -2.87 },
  { ticker: 'BBAS3', name: 'Banco do Brasil', change: -2.54 },
  { ticker: 'ITUB4', name: 'Itaú Unibanco', change: -2.13 },
  { ticker: 'WEGE3', name: 'WEG', change: -1.98 },
])

onMounted(async () => {
  if (brand.hero.variant !== 'showtime') return
  try {
    const service = useAssetsService()
    const [top, bottom] = await Promise.all([
      service.getTopStocks('top', 500_000),
      service.getTopStocks('bottom', 500_000),
    ])
    const toMover = (x: any): ShowtimeMover => ({
      ticker: x?.ticker || x?.symbol || '',
      name: (x?.name || '').trim(),
      change: Number(x?.change_percent) || 0,
    })
    if (Array.isArray(top) && top.length >= 5) {
      showtimeGainers.value = top.slice(0, 5).map(toMover)
    }
    if (Array.isArray(bottom) && bottom.length >= 5) {
      showtimeLosers.value = bottom.slice(0, 5).map(toMover)
    }
  } catch {
    // keep seeded fallback
  }
})

const showtimeStories = [
  {
    name: 'Carla M.',
    initials: 'CM',
    role: 'Professora, 34 anos · São Paulo',
    quote: 'Comecei devendo R$ 18 mil no rotativo do cartão. Hoje tenho reserva de emergência e invisto todo mês. O que mudou? Parei de fingir que o problema não existia.',
    stats: [
      { value: 'R$ 0', label: 'Dívidas hoje' },
      { value: '14 meses', label: 'Pra virar o jogo' },
    ],
  },
  {
    name: 'Rafael & Bia',
    initials: 'RB',
    role: 'Casal, 29 e 27 anos · Belo Horizonte',
    quote: 'Casamos sem reserva, sem planejamento, achando que o amor bastava. Bastava nada! Hoje temos a casa quitada e o primeiro filho a caminho, sem susto.',
    stats: [
      { value: 'R$ 210k', label: 'Patrimônio' },
      { value: '3 anos', label: 'Do zero até aqui' },
    ],
  },
  {
    name: 'Dona Neide',
    initials: 'DN',
    role: 'Aposentada, 62 anos · Recife',
    quote: 'Achava que era tarde demais pra aprender. Aos 58 comecei a investir os R$ 500 que sobravam. Hoje vivo de renda passiva e ainda ajudo meus netos.',
    stats: [
      { value: 'R$ 2.8k', label: 'Renda passiva/mês' },
      { value: '4 anos', label: 'Investindo' },
    ],
  },
]

// Small roman-numeral helper, used for Chapter II ritual list prefix.
function romanNumeral(n: number): string {
  const romans: Record<number, string> = {
    1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
  }
  return romans[n] || String(n)
}

// ==========================================================
// "Pauta do dia", editorial market movers for Norte Capital
// ==========================================================

interface EditorialMover {
  ticker: string
  name: string
  price: number
  change: number
  note: string
}

const editorialMovers = ref<{ up: EditorialMover[]; down: EditorialMover[] }>({
  up: [
    { ticker: 'PETR4', name: 'Petrobras PN', price: 38.45, change: 2.18, note: 'movimento técnico na véspera do pagamento de JCP' },
    { ticker: 'WEGE3', name: 'WEG ON', price: 52.30, change: 1.24, note: 'expectativa do balanço 3T26' },
  ],
  down: [
    { ticker: 'VALE3', name: 'Vale ON', price: 62.12, change: -1.05, note: 'minério de ferro sob pressão no mercado asiático' },
    { ticker: 'BBDC4', name: 'Bradesco PN', price: 14.22, change: -0.85, note: 'dia de rebalanceamento no IBOV' },
  ],
})

onMounted(async () => {
  if (brand.hero.variant !== 'editorial') return
  try {
    const service = useAssetsService()
    const [top, bottom] = await Promise.all([
      service.getTopStocks('top', 500_000),
      service.getTopStocks('bottom', 500_000),
    ])
    const mapItem = (x: any, fallbackNote: string): EditorialMover => ({
      ticker: x?.ticker || x?.symbol || '',
      name: (x?.name || '').trim() || x?.ticker || '',
      price: Number(x?.market_price) || 0,
      change: Number(x?.change_percent) || 0,
      note: fallbackNote,
    })
    const upNotes = [
      'liderando as altas do pregão',
      'acumulando valorização na semana',
    ]
    const downNotes = [
      'sob pressão vendedora pontual',
      'ajuste técnico após alta recente',
    ]
    if (Array.isArray(top) && top.length >= 2) {
      editorialMovers.value.up = top
        .slice(0, 2)
        .map((t, i) => mapItem(t, upNotes[i] || upNotes[0]!))
    }
    if (Array.isArray(bottom) && bottom.length >= 2) {
      editorialMovers.value.down = bottom
        .slice(0, 2)
        .map((t, i) => mapItem(t, downNotes[i] || downNotes[0]!))
    }
  } catch {
    // keep seeded fallback
  }
})

function formatMoverPrice(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '-'
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
function formatMoverChange(n: number): string {
  if (!Number.isFinite(n)) return '-'
  const sign = n >= 0 ? '+' : '−'
  return `${sign}${Math.abs(n).toFixed(2).replace('.', ',')}%`
}

// ============================================================
// PLAYBOOK HERO, Saraiva Invest "calm method + author anchor"
// ============================================================

const playbookPillars = [
  {
    icon: 'i-lucide-flask-conical',
    title: 'Testa a tese',
    description: 'Antes de comprar qualquer ativo, rode o backtest nos últimos 10 anos. Se a tese não sobrevive ao histórico, ela não sobrevive ao futuro.',
    tag: 'Backtest',
  },
  {
    icon: 'i-lucide-search',
    title: 'Lê o balanço',
    description: 'P/L não é estratégia. Você precisa entender receita, dívida, margem, CAPEX e fluxo de caixa. O trabalho chato é onde mora a vantagem.',
    tag: 'Fundamentalista',
  },
  {
    icon: 'i-lucide-scale',
    title: 'Calcula o preço-teto',
    description: 'Método Bazin pra quem vive de dividendos, Graham pra quem olha crescimento. O preço-teto é seu gatilho, não o humor do mercado.',
    tag: 'Valuation',
  },
  {
    icon: 'i-lucide-timer',
    title: 'Deixa o tempo trabalhar',
    description: 'Juros compostos só funcionam com duas coisas: paciência e consistência. Nenhuma delas cabe num tweet. Ambas cabem num método.',
    tag: 'Composto',
  },
]

function onPhotoError(ev: Event) {
  // If the author photo isn't there yet, just hide the img so the
  // fallback sticker circle renders instead.
  const img = ev.target as HTMLImageElement
  img.style.display = 'none'
}

// ============================================================
// HOLDER HERO, editorial autoral
// ============================================================

const holderEditionDate = computed(() => {
  const d = new Date()
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
  return `${months[d.getMonth()]} ${d.getFullYear()}`
})

const holderTraderTable = ['', '']  // headers rendered inline
const holderTraderRows = [
  {
    trader: 'Olha o gráfico de 5 em 5 minutos.',
    holder: 'Olha o relatório anual uma vez por ano.',
  },
  {
    trader: 'Compra na euforia. Vende no pânico.',
    holder: 'Compra no pânico. Ignora a euforia.',
  },
  {
    trader: 'Quer estar certo todo dia.',
    holder: 'Aceita estar errado por meses.',
  },
  {
    trader: '10 anos · 4.000 trades · R$ 0.',
    holder: '10 anos · 12 posições · R$ 1M.',
  },
]

// Shared ref used by both playbook ranking rows and holderTickerCarousel.
// Fetched on mount (only when the variant needs it) via useAssetsService.
interface RankingBucket {
  stocks: IAsset[]
  etfs: IAsset[]
  reits: IAsset[]
  bdrs: IAsset[]
}
const topAssets = ref<{ top: RankingBucket; bottom: RankingBucket }>({
  top: { stocks: [], etfs: [], reits: [], bdrs: [] },
  bottom: { stocks: [], etfs: [], reits: [], bdrs: [] },
})

onMounted(async () => {
  if (brand.hero.variant !== 'playbook' && brand.hero.variant !== 'holder') return
  try {
    const service = useAssetsService()
    const [topStocks, bottomStocks, topReits] = await Promise.all([
      service.getTopStocks('top', 1_000_000),
      service.getTopStocks('bottom', 1_000_000),
      service.getTopReits('top', 1_000_000),
    ])
    topAssets.value = {
      top: {
        stocks: Array.isArray(topStocks) ? topStocks.slice(0, 8) : [],
        etfs: [],
        reits: Array.isArray(topReits) ? topReits.slice(0, 8) : [],
        bdrs: [],
      },
      bottom: {
        stocks: Array.isArray(bottomStocks) ? bottomStocks.slice(0, 8) : [],
        etfs: [],
        reits: [],
        bdrs: [],
      },
    }
  } catch {
    // keep seeded fallback
  }
})

const holderTickerCarousel = computed(() => {
  type T = { ticker: string; name: string; change: number }
  const out: T[] = []
  const seen = new Set<string>()
  const add = (s: any) => {
    const tk = (s?.ticker || '').toString().trim().toUpperCase()
    if (!tk || seen.has(tk)) return
    seen.add(tk)
    out.push({
      ticker: tk,
      name: (s?.name || '').toString().slice(0, 22),
      change: Number(s?.change_percent || 0),
    })
  }
  ;(topAssets.value?.top?.stocks || []).slice(0, 5).forEach(add)
  ;(topAssets.value?.top?.reits || []).slice(0, 3).forEach(add)
  ;(topAssets.value?.bottom?.stocks || []).slice(0, 4).forEach(add)
  ;(topAssets.value?.top?.stocks || []).slice(5, 7).forEach(add)

  if (out.length === 0) {
    return [
      { ticker: 'PETR4', name: 'Petrobras', change: 0.42 },
      { ticker: 'VALE3', name: 'Vale', change: -0.18 },
      { ticker: 'ITUB4', name: 'Itaú Unibanco', change: 1.12 },
      { ticker: 'BBAS3', name: 'Banco do Brasil', change: 0.84 },
      { ticker: 'WEGE3', name: 'WEG', change: 1.85 },
      { ticker: 'BBSE3', name: 'BB Seguridade', change: 0.27 },
      { ticker: 'EGIE3', name: 'Engie Brasil', change: -0.11 },
      { ticker: 'B3SA3', name: 'B3', change: 0.58 },
      { ticker: 'MXRF11', name: 'Maxi Renda', change: 0.31 },
      { ticker: 'KNCR11', name: 'Kinea Rendimentos', change: 0.12 },
    ]
  }
  return out
})

const holderPositions = [
  { ticker: 'ITUB4', sector: 'Bancos', thesis: 'Moat regulatório, 30M de clientes, ROE consistente acima de 18%.', since: '2014' },
  { ticker: 'WEGE3', sector: 'Indústria', thesis: 'A única indústria brasileira que compete em pé de igualdade no mundo.', since: '2016' },
  { ticker: 'BBSE3', sector: 'Seguros', thesis: 'Margem operacional altíssima. Payout altíssimo. Capex baixo.', since: '2018' },
  { ticker: 'EGIE3', sector: 'Energia', thesis: 'Geradora hidrelétrica com contratos longos. Boring is beautiful.', since: '2020' },
  { ticker: 'B3SA3', sector: 'Bolsa', thesis: 'Monopólio natural. Cobra até dos traders que perdem dinheiro.', since: '2021' },
]
</script>

<style scoped>
/* ========== TERMINAL HERO — QuickSearch pill replica ==========
   Mirrors the real floating QuickSearch pill: rounded-full glass
   surface, primary border on hover, soft glow ring. Hovering it
   gives the same affordance the real pill has so users intuit
   that clicking opens a real search. */
.qs-replica {
  cursor: pointer;
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  box-shadow: 0 12px 32px -12px rgba(0, 0, 0, 0.4);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}
.qs-replica:hover {
  border-color: var(--brand-primary, #f5b301) !important;
  box-shadow:
    0 12px 32px -12px rgba(0, 0, 0, 0.4),
    0 0 0 3px color-mix(in srgb, var(--brand-primary, #f5b301) 25%, transparent);
}
.qs-replica:focus-visible {
  border-color: var(--brand-primary, #f5b301) !important;
  box-shadow:
    0 12px 32px -12px rgba(0, 0, 0, 0.4),
    0 0 0 3px color-mix(in srgb, var(--brand-primary, #f5b301) 25%, transparent);
}

/* ========== PLAYBOOK HERO (Saraiva Invest) ========== */
.playbook-hero {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-feature-settings: 'ss01', 'cv11';
}

.playbook-hero .pb-title,
.playbook-hero .pb-manifesto,
.playbook-hero .pb-section-title,
.playbook-hero .pb-final-title,
.playbook-hero .pb-quote {
  font-family: 'Fredoka', 'Inter', system-ui, sans-serif;
  font-weight: 700;
}

.playbook-hero .pb-subtitle {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 400;
}

.playbook-hero .pb-eyebrow,
.playbook-hero .pb-badge-text {
  font-family: 'Fredoka', 'Inter', system-ui, sans-serif;
}

/* Sticker-style highlight, mimics the chunky white-stroke logo effect */
.playbook-hero .pb-sticker {
  display: inline-block;
  font-family: 'Fredoka', 'Inter', system-ui, sans-serif;
  font-weight: 700;
  position: relative;
  padding: 0 0.05em;
}

.playbook-hero .pb-sticker-outline {
  background: var(--sticker-bg, #F5F5F7);
  color: var(--sticker-fg, #0B0B0E) !important;
  padding: 0.02em 0.25em;
  border-radius: 0.15em;
  -webkit-text-stroke: 2px var(--sticker-fg, #0B0B0E);
  box-shadow:
    -3px 3px 0 var(--sticker-fg, #0B0B0E),
    0 0 0 4px var(--sticker-bg, #F5F5F7),
    -3px 3px 0 4px var(--sticker-fg, #0B0B0E);
  transform: rotate(-1.5deg);
}

/* Cabeça Quente sticker, red, hot, slightly tilted opposite way */
.playbook-hero .pb-sticker-hot {
  display: inline-block;
  background: #EF4444;
  color: #FFFFFF !important;
  padding: 0.02em 0.3em;
  border-radius: 0.15em;
  font-family: 'Fredoka', 'Inter', system-ui, sans-serif;
  font-weight: 700;
  box-shadow:
    -3px 3px 0 #0B0B0E,
    0 0 0 4px #FFFFFF,
    -3px 3px 0 4px #0B0B0E;
  transform: rotate(2deg);
}

/* Cabeça Fria sticker, amber, cold, tilted opposite */
.playbook-hero .pb-sticker-cold {
  display: inline-block;
  font-family: 'Fredoka', 'Inter', system-ui, sans-serif;
  font-weight: 700;
}

/* Villain card sweat drop animation */
@keyframes pb-sweat-drop {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.85; }
  50% { transform: translateY(6px) scale(0.85); opacity: 0.4; }
}

.playbook-hero .pb-sweat {
  animation: pb-sweat-drop 1.4s ease-in-out infinite;
}
.playbook-hero .pb-sweat-2 {
  animation-delay: 0.7s;
}

/* Villain card subtle pulse to feel "agitated" */
@keyframes pb-villain-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  50% { box-shadow: 0 0 60px -10px rgba(239, 68, 68, 0.3); }
}

.playbook-hero .pb-villain {
  animation: pb-villain-pulse 3s ease-in-out infinite;
}

/* Ranking row hover */
.playbook-hero .pb-ranking-row {
  transition: background-color 0.2s ease, transform 0.2s ease;
}
.playbook-hero .pb-ranking-row:hover {
  background-color: rgba(230, 126, 34, 0.08);
  transform: translateX(2px);
}

/* Ranking card subtle hover */
.playbook-hero .pb-ranking {
  transition: border-color 0.3s ease, transform 0.4s ease;
}
.playbook-hero .pb-ranking:hover {
  border-color: rgba(230, 126, 34, 0.5);
  transform: translateY(-2px);
}

/* Author photo ring, slow rotating stroke */
@keyframes pb-ring-rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.playbook-hero .pb-author-ring {
  animation: pb-ring-rotate 40s linear infinite;
  border-style: dashed;
}

/* Author photo subtle float */
@keyframes pb-author-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.playbook-hero .pb-author-photo {
  animation: pb-author-float 6s ease-in-out infinite;
}

/* Signature tag bobs gently */
@keyframes pb-tag-bob {
  0%, 100% { transform: rotate(-4deg) translateY(0); }
  50% { transform: rotate(-4deg) translateY(-4px); }
}

.playbook-hero .pb-signature-tag {
  animation: pb-tag-bob 5s ease-in-out infinite;
}

/* Pillar card hover lift */
.playbook-hero .pb-pillar {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.3s ease,
              background-color 0.3s ease;
}

.playbook-hero .pb-pillar:hover {
  border-color: var(--sticker-bg, rgba(230, 126, 34, 0.5)) !important;
}

/* Pill CTA hover */
.playbook-hero .pb-cta-primary {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* Responsive: smaller sticker effect on mobile */
@media (max-width: 768px) {
  .playbook-hero .pb-sticker-outline {
    box-shadow:
      -2px 2px 0 var(--sticker-fg, #0B0B0E),
      0 0 0 3px var(--sticker-bg, #F5F5F7),
      -2px 2px 0 3px var(--sticker-fg, #0B0B0E);
  }

  .playbook-hero .pb-author-ring,
  .playbook-hero .pb-author-circle {
    display: none !important;
  }
}

/* ========== HOLDER HERO (sentencious editorial) ========== */
.holder-hero {
  font-family: 'Spectral', 'Georgia', serif;
  font-feature-settings: 'kern', 'liga';
}

.holder-hero .hl-display {
  font-family: 'Anton', 'Bebas Neue', 'Inter', sans-serif !important;
  font-weight: 400;
  text-transform: uppercase;
}

.holder-hero .hl-serif {
  font-family: 'Spectral', 'Georgia', serif !important;
}

.holder-hero .hl-mono {
  font-family: 'JetBrains Mono', ui-monospace, 'Menlo', monospace !important;
}

/* Drop cap for first paragraph of doutrina */
.holder-hero .hl-drop-cap {
  font-family: 'Anton', 'Bebas Neue', sans-serif;
  font-size: 4em;
  line-height: 0.8;
  float: left;
  padding: 0.05em 0.12em 0 0;
  margin-top: 0.05em;
}

/* CTA primary, sharp flat rectangle, no border, no offset shadow */
.holder-hero .hl-cta-primary {
  border-radius: 0;
  letter-spacing: 0.18em;
  position: relative;
  transition: all 0.2s ease;
}
.holder-hero .hl-cta-primary:hover {
  filter: brightness(1.1);
}

/* Editorial portrait subtle hover lift */
.holder-hero .hl-portrait {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.holder-hero .hl-portrait:hover {
  transform: scale(1.02);
}

/* Marquee band, slow elegant horizontal scroll
   The track contains TWO copies of the ticker list rendered inline.
   We translate -50% so the second copy seamlessly takes over when the
   first scrolls out, no visible jump. */
.holder-hero .hl-marquee {
  position: relative;
  width: 100%;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent 0,
    #000 8%,
    #000 92%,
    transparent 100%
  );
  mask-image: linear-gradient(
    90deg,
    transparent 0,
    #000 8%,
    #000 92%,
    transparent 100%
  );
}

.holder-hero .hl-marquee-track {
  display: flex;
  align-items: center;
  width: max-content;
  animation: hl-marquee-scroll 60s linear infinite;
}

.holder-hero .hl-marquee-band:hover .hl-marquee-track {
  animation-play-state: paused;
}

.holder-hero .hl-marquee-item {
  flex-shrink: 0;
}

@keyframes hl-marquee-scroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* Typographic strip on top */
.holder-hero .hl-strip {
  font-family: 'JetBrains Mono', monospace;
}
</style>

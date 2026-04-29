<!--
  Sidebar mockups showcase.

  Goal: 4 distinct sidebar redesigns for the logged-in platform shell,
  each optimizing for a different priority. The user picks one and we
  promote the winner into `layouts/default.vue`.

  Design directions:
    1. Mission Control     - portfolio snapshot + market strip, data-rich
    2. Library             - Spotify-style "biblioteca" with counts
    3. Live Feed           - Bloomberg-lite with watchlist sparklines
    4. Smart Context       - content adapts to current section

  Page is dev-only. Open at /dev/sidebar-mockups to compare.
-->
<template>
  <div
    class="min-h-screen w-full"
    :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
  >
    <!-- ===== Page header ===== -->
    <header class="sticky top-0 z-30 backdrop-blur-xl">
      <div
        class="border-b"
        :style="{
          backgroundColor: `color-mix(in srgb, ${brand.colors.background} 88%, transparent)`,
          borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
        }"
      >
        <div class="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-4">
          <div class="flex items-center gap-3">
            <BrandLogo variant="icon" class="h-7 w-auto" />
            <div class="flex flex-col leading-tight">
              <span
                class="text-[10.5px] font-medium uppercase"
                :style="{
                  letterSpacing: '0.18em',
                  color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
                  fontFamily: 'var(--font-mono, JetBrains Mono, ui-monospace, monospace)',
                }"
              >Sidebar mockups</span>
              <span
                class="text-[15px] font-medium"
                :style="{ color: brand.colors.text, letterSpacing: '-0.01em' }"
              >
                Escolha a base que vai virar a sidebar oficial
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="text-[12px]"
              :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
            >
              {{ mockups[active - 1].name }}
            </span>
            <span
              class="rounded-md px-2 py-1 font-mono-tab text-[11px] font-medium"
              :style="{
                backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
                color: brand.colors.primary,
              }"
            >
              {{ active }} / {{ mockups.length }}
            </span>
          </div>
        </div>
        <!-- Tab switcher -->
        <nav class="mx-auto flex max-w-[1400px] items-stretch gap-0 px-6">
          <button
            v-for="(m, i) in mockups"
            :key="m.id"
            type="button"
            class="mockup-tab group flex flex-1 flex-col items-start gap-0.5 border-b-2 px-4 py-2.5 text-left transition-[color,border-color]"
            :style="{
              borderColor:
                active === i + 1
                  ? brand.colors.primary
                  : 'transparent',
              color:
                active === i + 1
                  ? brand.colors.text
                  : `color-mix(in srgb, ${brand.colors.text} 55%, transparent)`,
            }"
            @click="active = i + 1"
          >
            <span
              class="font-mono-tab text-[10px] font-medium uppercase"
              :style="{ letterSpacing: '0.2em', opacity: active === i + 1 ? 0.9 : 0.6 }"
            >
              0{{ i + 1 }}
            </span>
            <span class="text-[13px] font-medium" :style="{ letterSpacing: '-0.005em' }">
              {{ m.name }}
            </span>
          </button>
        </nav>
      </div>
    </header>

    <!-- ===== Mockup canvas ===== -->
    <div class="mx-auto max-w-[1400px] px-6 py-8">
      <!-- Description band above the mockup -->
      <div
        class="mb-6 rounded-xl border p-5"
        :style="{
          backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 50%, ${brand.colors.background})`,
          borderColor: `color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
        }"
      >
        <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            class="font-mono-tab text-[10.5px] font-medium uppercase"
            :style="{
              letterSpacing: '0.18em',
              color: brand.colors.primary,
            }"
          >Conceito</span>
          <h2
            class="text-[20px] font-medium"
            :style="{ color: brand.colors.text, letterSpacing: '-0.015em' }"
          >
            {{ currentMockup.name }}
          </h2>
          <span
            class="text-[14px]"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)` }"
          >
            — {{ currentMockup.tagline }}
          </span>
        </div>
        <p
          class="mt-3 max-w-3xl text-[14px] leading-relaxed"
          :style="{ color: `color-mix(in srgb, ${brand.colors.text} 75%, transparent)` }"
        >
          {{ currentMockup.description }}
        </p>
        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <div
            class="rounded-lg border p-3"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.positive} 8%, transparent)`,
              borderColor: `color-mix(in srgb, ${brand.colors.positive} 20%, transparent)`,
            }"
          >
            <div
              class="font-mono-tab text-[10px] font-medium uppercase"
              :style="{
                letterSpacing: '0.2em',
                color: brand.colors.positive,
              }"
            >Pontos fortes</div>
            <ul class="mt-2 space-y-1 text-[13px]" :style="{ color: brand.colors.text }">
              <li v-for="p in currentMockup.pros" :key="p" class="flex items-start gap-2">
                <span
                  class="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                  :style="{ backgroundColor: brand.colors.positive }"
                />
                <span>{{ p }}</span>
              </li>
            </ul>
          </div>
          <div
            class="rounded-lg border p-3"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.negative} 8%, transparent)`,
              borderColor: `color-mix(in srgb, ${brand.colors.negative} 20%, transparent)`,
            }"
          >
            <div
              class="font-mono-tab text-[10px] font-medium uppercase"
              :style="{
                letterSpacing: '0.2em',
                color: brand.colors.negative,
              }"
            >Tradeoffs</div>
            <ul class="mt-2 space-y-1 text-[13px]" :style="{ color: brand.colors.text }">
              <li v-for="c in currentMockup.cons" :key="c" class="flex items-start gap-2">
                <span
                  class="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                  :style="{ backgroundColor: brand.colors.negative }"
                />
                <span>{{ c }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Live mockup frame -->
      <div
        class="overflow-hidden rounded-2xl border shadow-2xl"
        :style="{
          borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
          boxShadow: `0 30px 60px -30px color-mix(in srgb, ${brand.colors.primary} 22%, transparent), 0 18px 36px -18px rgba(0,0,0,0.18)`,
        }"
      >
        <!-- Frame chrome bar -->
        <div
          class="flex items-center gap-2 border-b px-4 py-2.5"
          :style="{
            backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 35%, ${brand.colors.background})`,
            borderColor: `color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
          }"
        >
          <div class="flex gap-1.5">
            <span class="size-2.5 rounded-full" style="background:#ff5f57"></span>
            <span class="size-2.5 rounded-full" style="background:#febc2e"></span>
            <span class="size-2.5 rounded-full" style="background:#28c840"></span>
          </div>
          <div class="flex-1" />
          <span
            class="font-mono-tab text-[11px]"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
          >app.redentia.com.br</span>
          <div class="flex-1" />
        </div>

        <!-- Mockup viewport: 720px tall, sidebar + faux main -->
        <div
          class="flex h-[720px] w-full"
          :style="{ backgroundColor: brand.colors.background }"
        >
          <!-- ============ MOCKUP 1: MISSION CONTROL ============ -->
          <template v-if="active === 1">
            <aside
              class="flex h-full w-[280px] shrink-0 flex-col border-r"
              :style="{
                backgroundColor: brand.colors.surface,
                borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
              }"
            >
              <!-- Brand -->
              <div class="shrink-0 px-4 pt-5 pb-3">
                <BrandLogo variant="full" class="h-7 w-auto" />
              </div>

              <!-- Portfolio snapshot — the headline change -->
              <div class="shrink-0 px-3 pb-3">
                <div
                  class="rounded-xl border p-3"
                  :style="{
                    backgroundColor: `color-mix(in srgb, ${brand.colors.background} 60%, transparent)`,
                    borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
                    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${brand.colors.primary} 6%, transparent)`,
                  }"
                >
                  <div class="flex items-center justify-between">
                    <span
                      class="font-mono-tab text-[10px] font-medium uppercase"
                      :style="{
                        letterSpacing: '0.18em',
                        color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
                      }"
                    >Patrimônio</span>
                    <span
                      class="flex items-center gap-1 font-mono-tab text-[10.5px]"
                      :style="{ color: brand.colors.positive }"
                    >
                      <span class="inline-block size-1.5 rounded-full" :style="{ backgroundColor: brand.colors.positive }" />
                      LIVE
                    </span>
                  </div>
                  <div
                    class="mt-1.5 font-mono-tab text-[22px] font-light tabular-nums"
                    :style="{ color: brand.colors.text, letterSpacing: '-0.02em' }"
                  >
                    R$ 487.230,42
                  </div>
                  <div class="mt-1 flex items-center gap-2">
                    <span
                      class="font-mono-tab text-[12px] tabular-nums"
                      :style="{ color: brand.colors.positive }"
                    >+R$ 5.812,30</span>
                    <span
                      class="rounded px-1.5 py-0.5 font-mono-tab text-[10.5px] font-medium tabular-nums"
                      :style="{
                        backgroundColor: `color-mix(in srgb, ${brand.colors.positive} 16%, transparent)`,
                        color: brand.colors.positive,
                      }"
                    >+1,21%</span>
                    <span
                      class="ml-auto font-mono-tab text-[10.5px]"
                      :style="{ color: `color-mix(in srgb, ${brand.colors.text} 45%, transparent)` }"
                    >hoje</span>
                  </div>
                  <!-- Mini sparkline -->
                  <svg viewBox="0 0 200 32" class="mt-2 h-7 w-full">
                    <defs>
                      <linearGradient id="spark1" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" :stop-color="brand.colors.positive" stop-opacity="0.35" />
                        <stop offset="100%" :stop-color="brand.colors.positive" stop-opacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,22 L18,20 L36,24 L54,16 L72,18 L90,12 L108,14 L126,9 L144,11 L162,7 L180,5 L200,8"
                      :stroke="brand.colors.positive"
                      stroke-width="1.5"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M0,22 L18,20 L36,24 L54,16 L72,18 L90,12 L108,14 L126,9 L144,11 L162,7 L180,5 L200,8 L200,32 L0,32 Z"
                      fill="url(#spark1)"
                    />
                  </svg>
                </div>
              </div>

              <!-- AI CTA -->
              <div class="shrink-0 px-3 pb-3">
                <button
                  type="button"
                  class="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13.5px] font-medium"
                  :style="{
                    backgroundColor: brand.colors.primary,
                    color: brand.colors.background,
                    boxShadow: `0 8px 18px -10px color-mix(in srgb, ${brand.colors.primary} 60%, transparent), 0 4px 10px -6px rgba(0,0,0,0.10)`,
                  }"
                >
                  <UIcon name="i-lucide-sparkles" class="size-4" />
                  <span class="flex-1">Falar com IA</span>
                  <kbd
                    class="rounded px-1 py-0 font-mono-tab text-[10px]"
                    :style="{
                      backgroundColor: `color-mix(in srgb, ${brand.colors.background} 30%, transparent)`,
                    }"
                  >⌘K</kbd>
                </button>
              </div>

              <!-- Quick actions: 2x2 grid -->
              <div class="shrink-0 px-3 pb-3">
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="qa in mockup1QuickActions"
                    :key="qa.label"
                    type="button"
                    class="flex flex-col items-start gap-1.5 rounded-lg border px-2.5 py-2 text-left transition-colors"
                    :style="{
                      backgroundColor: `color-mix(in srgb, ${brand.colors.background} 40%, transparent)`,
                      borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
                    }"
                  >
                    <span
                      class="flex size-7 items-center justify-center rounded-md"
                      :style="{ backgroundColor: `color-mix(in srgb, ${qa.tint} 14%, transparent)` }"
                    >
                      <UIcon :name="qa.icon" class="size-4" :style="{ color: qa.tint }" />
                    </span>
                    <div class="flex w-full flex-col leading-tight">
                      <span
                        class="text-[12px] font-medium"
                        :style="{ color: brand.colors.text }"
                      >{{ qa.label }}</span>
                      <span
                        class="font-mono-tab text-[10px] tabular-nums"
                        :style="{ color: `color-mix(in srgb, ${brand.colors.text} 45%, transparent)` }"
                      >{{ qa.meta }}</span>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Categorized nav -->
              <nav
                class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3"
                style="scrollbar-width: none"
              >
                <section v-for="g in mockup1NavGroups" :key="g.label" class="flex flex-col gap-0.5">
                  <span
                    class="px-2.5 pb-1 font-mono-tab text-[10px] font-medium uppercase"
                    :style="{
                      letterSpacing: '0.2em',
                      color: `color-mix(in srgb, ${brand.colors.text} 45%, transparent)`,
                    }"
                  >{{ g.label }}</span>
                  <button
                    v-for="item in g.items"
                    :key="item.label"
                    type="button"
                    class="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors"
                    :class="item.active ? 'is-active' : ''"
                    :style="
                      item.active
                        ? {
                            backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 12%, transparent)`,
                            color: brand.colors.text,
                          }
                        : {
                            color: `color-mix(in srgb, ${brand.colors.text} 78%, transparent)`,
                          }
                    "
                  >
                    <UIcon :name="item.icon" class="size-3.5 shrink-0" />
                    <span class="flex-1 text-[13px]">{{ item.label }}</span>
                    <span
                      v-if="item.badge"
                      class="rounded-md px-1.5 py-0.5 font-mono-tab text-[10px] tabular-nums"
                      :style="{
                        backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
                        color: brand.colors.primary,
                      }"
                    >{{ item.badge }}</span>
                  </button>
                </section>
              </nav>

              <!-- Market strip footer -->
              <div
                class="flex shrink-0 items-stretch gap-px border-t"
                :style="{
                  borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${brand.colors.border} 18%, transparent)`,
                }"
              >
                <div
                  v-for="m in marketStrip"
                  :key="m.label"
                  class="flex flex-1 flex-col items-center gap-0.5 px-2 py-1.5"
                  :style="{ backgroundColor: brand.colors.surface }"
                >
                  <span
                    class="font-mono-tab text-[9px] font-medium uppercase"
                    :style="{
                      letterSpacing: '0.18em',
                      color: `color-mix(in srgb, ${brand.colors.text} 45%, transparent)`,
                    }"
                  >{{ m.label }}</span>
                  <span
                    class="font-mono-tab text-[11px] tabular-nums"
                    :style="{ color: brand.colors.text }"
                  >{{ m.value }}</span>
                  <span
                    class="font-mono-tab text-[9.5px] tabular-nums"
                    :style="{ color: m.up ? brand.colors.positive : brand.colors.negative }"
                  >{{ m.change }}</span>
                </div>
              </div>

              <!-- User row -->
              <div
                class="flex shrink-0 items-center gap-2 border-t px-3 py-2.5"
                :style="{ borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)` }"
              >
                <span
                  class="flex size-7 items-center justify-center rounded-full"
                  :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 18%, transparent)`, color: brand.colors.primary }"
                >
                  <span class="text-[11px] font-medium">SS</span>
                </span>
                <div class="flex min-w-0 flex-1 flex-col leading-tight">
                  <span class="truncate text-[12.5px] font-medium" :style="{ color: brand.colors.text }">Saraiva</span>
                  <span
                    class="truncate font-mono-tab text-[9.5px] uppercase"
                    :style="{ letterSpacing: '0.16em', color: `color-mix(in srgb, ${brand.colors.text} 45%, transparent)` }"
                  >Plano gratuito</span>
                </div>
                <button
                  type="button"
                  class="flex size-7 items-center justify-center rounded-md"
                  :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
                >
                  <UIcon name="i-lucide-log-out" class="size-3.5" />
                </button>
              </div>
            </aside>
            <DevFauxMain :brand="brand" :title="currentMockup.name" />
          </template>

          <!-- ============ MOCKUP 2: LIBRARY (Spotify-style) ============ -->
          <template v-if="active === 2">
            <aside
              class="flex h-full w-[300px] shrink-0 flex-col border-r"
              :style="{
                backgroundColor: brand.colors.surface,
                borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
              }"
            >
              <!-- Compact brand -->
              <div class="flex shrink-0 items-center justify-between px-4 pt-5 pb-2">
                <BrandLogo variant="full" class="h-6 w-auto" />
                <button
                  type="button"
                  class="flex size-7 items-center justify-center rounded-md transition-colors"
                  :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
                >
                  <UIcon name="i-lucide-bell" class="size-4" />
                </button>
              </div>

              <!-- Search bar prominent -->
              <div class="shrink-0 px-3 pb-3 pt-2">
                <label
                  class="flex items-center gap-2 rounded-lg border px-3 py-2"
                  :style="{
                    backgroundColor: `color-mix(in srgb, ${brand.colors.background} 60%, transparent)`,
                    borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
                  }"
                >
                  <UIcon
                    name="i-lucide-search"
                    class="size-3.5 shrink-0"
                    :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
                  />
                  <span
                    class="flex-1 text-[13px]"
                    :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
                  >Buscar PETR4, FIIs, calculadoras…</span>
                  <kbd
                    class="rounded px-1.5 py-0.5 font-mono-tab text-[10px]"
                    :style="{
                      backgroundColor: `color-mix(in srgb, ${brand.colors.text} 7%, transparent)`,
                      color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)`,
                    }"
                  >⌘K</kbd>
                </label>
              </div>

              <!-- "Sua biblioteca" header -->
              <div class="flex shrink-0 items-center justify-between px-4 pb-2 pt-1">
                <h3
                  class="text-[14px] font-medium"
                  :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
                >Sua biblioteca</h3>
                <button
                  type="button"
                  class="flex size-6 items-center justify-center rounded-md"
                  :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
                >
                  <UIcon name="i-lucide-plus" class="size-3.5" />
                </button>
              </div>

              <!-- Filter chips -->
              <div class="flex shrink-0 flex-wrap gap-1.5 px-3 pb-3">
                <button
                  v-for="(c, i) in libraryChips"
                  :key="c"
                  type="button"
                  class="rounded-full px-2.5 py-0.5 text-[11.5px] font-medium transition-colors"
                  :style="
                    i === 0
                      ? {
                          backgroundColor: `color-mix(in srgb, ${brand.colors.text} 90%, transparent)`,
                          color: brand.colors.surface,
                        }
                      : {
                          backgroundColor: `color-mix(in srgb, ${brand.colors.text} 6%, transparent)`,
                          color: `color-mix(in srgb, ${brand.colors.text} 75%, transparent)`,
                        }
                  "
                >{{ c }}</button>
              </div>

              <!-- Library items list -->
              <div
                class="flex min-h-0 flex-1 flex-col gap-px overflow-y-auto px-2 pb-3"
                style="scrollbar-width: none"
              >
                <button
                  v-for="item in libraryItems"
                  :key="item.label"
                  type="button"
                  class="flex items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors"
                  :class="item.active ? 'lib-active' : ''"
                  :style="
                    item.active
                      ? {
                          backgroundColor: `color-mix(in srgb, ${brand.colors.text} 6%, transparent)`,
                        }
                      : {}
                  "
                >
                  <span
                    class="flex size-9 shrink-0 items-center justify-center rounded-md"
                    :style="{
                      backgroundColor: `color-mix(in srgb, ${item.tint} 15%, transparent)`,
                      color: item.tint,
                    }"
                  >
                    <UIcon :name="item.icon" class="size-4" />
                  </span>
                  <div class="flex min-w-0 flex-1 flex-col leading-tight">
                    <span
                      class="truncate text-[13px] font-medium"
                      :style="{ color: brand.colors.text }"
                    >{{ item.label }}</span>
                    <span
                      class="truncate font-mono-tab text-[10.5px]"
                      :style="{
                        color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
                      }"
                    >
                      {{ item.kind }} · {{ item.meta }}
                    </span>
                  </div>
                  <span
                    v-if="item.count"
                    class="font-mono-tab text-[11px] tabular-nums"
                    :style="{
                      color: `color-mix(in srgb, ${brand.colors.text} 45%, transparent)`,
                    }"
                  >{{ item.count }}</span>
                </button>
              </div>

              <!-- Footer: AI sticky CTA + user -->
              <div class="shrink-0 px-3 pb-3 pt-1">
                <button
                  type="button"
                  class="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium"
                  :style="{
                    backgroundColor: brand.colors.primary,
                    color: brand.colors.background,
                    boxShadow: `0 8px 18px -10px color-mix(in srgb, ${brand.colors.primary} 60%, transparent)`,
                  }"
                >
                  <UIcon name="i-lucide-sparkles" class="size-3.5" />
                  Pergunta pra IA
                </button>
              </div>
              <div
                class="flex shrink-0 items-center gap-2 border-t px-3 py-2.5"
                :style="{ borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)` }"
              >
                <span
                  class="flex size-7 items-center justify-center rounded-full"
                  :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 18%, transparent)`, color: brand.colors.primary }"
                >
                  <span class="text-[11px] font-medium">SS</span>
                </span>
                <div class="flex min-w-0 flex-1 flex-col leading-tight">
                  <span class="truncate text-[12.5px] font-medium" :style="{ color: brand.colors.text }">Saraiva</span>
                  <span
                    class="truncate font-mono-tab text-[9.5px] uppercase"
                    :style="{ letterSpacing: '0.16em', color: `color-mix(in srgb, ${brand.colors.text} 45%, transparent)` }"
                  >Plano gratuito</span>
                </div>
                <button
                  type="button"
                  class="flex size-7 items-center justify-center rounded-md"
                  :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
                >
                  <UIcon name="i-lucide-settings" class="size-3.5" />
                </button>
              </div>
            </aside>
            <DevFauxMain :brand="brand" :title="currentMockup.name" />
          </template>

          <!-- ============ MOCKUP 3: LIVE FEED (Bloomberg-lite) ============ -->
          <template v-if="active === 3">
            <aside
              class="flex h-full w-[300px] shrink-0 flex-col border-r"
              :style="{
                backgroundColor: brand.colors.surface,
                borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
              }"
            >
              <!-- Compact brand + IA inline -->
              <div class="flex shrink-0 items-center justify-between gap-2 px-4 pt-4 pb-3">
                <BrandLogo variant="full" class="h-6 w-auto" />
                <button
                  type="button"
                  class="flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium"
                  :style="{
                    backgroundColor: brand.colors.primary,
                    color: brand.colors.background,
                  }"
                >
                  <UIcon name="i-lucide-sparkles" class="size-3" />
                  IA
                </button>
              </div>

              <!-- Live ticker marquee -->
              <div
                class="shrink-0 overflow-hidden border-y py-1"
                :style="{
                  borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${brand.colors.background} 60%, transparent)`,
                }"
              >
                <div class="flex items-center gap-3 whitespace-nowrap px-3 font-mono-tab text-[11px] tabular-nums">
                  <span
                    v-for="t in liveTicker"
                    :key="t.label"
                    class="flex items-center gap-1.5"
                  >
                    <span :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }">{{ t.label }}</span>
                    <span :style="{ color: brand.colors.text }">{{ t.value }}</span>
                    <span :style="{ color: t.up ? brand.colors.positive : brand.colors.negative }">{{ t.change }}</span>
                    <span
                      class="opacity-30"
                      :style="{ color: brand.colors.text }"
                    >·</span>
                  </span>
                </div>
              </div>

              <!-- Section: Watchlist with sparklines -->
              <section class="shrink-0 px-3 pb-3 pt-3">
                <div class="mb-2 flex items-center justify-between px-1">
                  <span
                    class="font-mono-tab text-[10px] font-medium uppercase"
                    :style="{
                      letterSpacing: '0.2em',
                      color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
                    }"
                  >Watchlist</span>
                  <button
                    type="button"
                    class="font-mono-tab text-[10px]"
                    :style="{ color: brand.colors.primary }"
                  >Editar</button>
                </div>
                <div class="flex flex-col gap-px">
                  <button
                    v-for="w in watchlist"
                    :key="w.ticker"
                    type="button"
                    class="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors"
                  >
                    <span
                      class="flex size-7 items-center justify-center rounded-md font-mono-tab text-[10px] font-medium"
                      :style="{
                        backgroundColor: `color-mix(in srgb, ${w.tint} 15%, transparent)`,
                        color: w.tint,
                      }"
                    >{{ w.ticker.slice(0, 4) }}</span>
                    <div class="flex min-w-0 flex-col leading-tight">
                      <span
                        class="truncate font-mono-tab text-[12px] font-medium"
                        :style="{ color: brand.colors.text }"
                      >{{ w.ticker }}</span>
                      <span
                        class="truncate text-[10px]"
                        :style="{
                          color: `color-mix(in srgb, ${brand.colors.text} 48%, transparent)`,
                        }"
                      >{{ w.name }}</span>
                    </div>
                    <svg viewBox="0 0 60 18" class="h-4 w-12">
                      <path
                        :d="w.spark"
                        :stroke="w.up ? brand.colors.positive : brand.colors.negative"
                        stroke-width="1.2"
                        fill="none"
                        stroke-linecap="round"
                      />
                    </svg>
                    <div class="flex flex-col items-end leading-tight">
                      <span
                        class="font-mono-tab text-[11.5px] tabular-nums"
                        :style="{ color: brand.colors.text }"
                      >{{ w.price }}</span>
                      <span
                        class="font-mono-tab text-[10px] tabular-nums"
                        :style="{ color: w.up ? brand.colors.positive : brand.colors.negative }"
                      >{{ w.change }}</span>
                    </div>
                  </button>
                </div>
              </section>

              <!-- Tighter nav: just labels, denser -->
              <nav
                class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto border-t px-3 py-3"
                :style="{ borderColor: `color-mix(in srgb, ${brand.colors.border} 30%, transparent)` }"
                style="scrollbar-width: none"
              >
                <section v-for="g in mockup3NavGroups" :key="g.label" class="flex flex-col gap-px">
                  <span
                    class="px-1 pb-1 font-mono-tab text-[10px] font-medium uppercase"
                    :style="{
                      letterSpacing: '0.2em',
                      color: `color-mix(in srgb, ${brand.colors.text} 45%, transparent)`,
                    }"
                  >{{ g.label }}</span>
                  <button
                    v-for="item in g.items"
                    :key="item"
                    type="button"
                    class="flex items-center gap-2 rounded px-2 py-1 text-left text-[12.5px] transition-colors"
                    :style="{
                      color: `color-mix(in srgb, ${brand.colors.text} 78%, transparent)`,
                    }"
                  >
                    <span
                      class="size-1 rounded-full"
                      :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 30%, transparent)` }"
                    />
                    {{ item }}
                  </button>
                </section>
              </nav>

              <!-- User row -->
              <div
                class="flex shrink-0 items-center gap-2 border-t px-3 py-2.5"
                :style="{ borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)` }"
              >
                <span
                  class="flex size-7 items-center justify-center rounded-full"
                  :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 18%, transparent)`, color: brand.colors.primary }"
                >
                  <span class="text-[11px] font-medium">SS</span>
                </span>
                <div class="flex min-w-0 flex-1 flex-col leading-tight">
                  <span class="truncate text-[12.5px] font-medium" :style="{ color: brand.colors.text }">Saraiva</span>
                  <span
                    class="truncate font-mono-tab text-[9.5px]"
                    :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
                  >R$ 487k · +1,21%</span>
                </div>
                <span
                  class="rounded px-1.5 py-0.5 font-mono-tab text-[10px] font-medium"
                  :style="{
                    backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
                    color: brand.colors.primary,
                  }"
                >Free</span>
              </div>
            </aside>
            <DevFauxMain :brand="brand" :title="currentMockup.name" />
          </template>

          <!-- ============ MOCKUP 4: SMART CONTEXT ============ -->
          <template v-if="active === 4">
            <aside
              class="flex h-full w-[280px] shrink-0 flex-col border-r"
              :style="{
                backgroundColor: brand.colors.surface,
                borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
              }"
            >
              <!-- Brand -->
              <div class="shrink-0 px-4 pt-5 pb-3">
                <BrandLogo variant="full" class="h-7 w-auto" />
              </div>

              <!-- AI CTA -->
              <div class="shrink-0 px-3 pb-3">
                <button
                  type="button"
                  class="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[13.5px] font-medium"
                  :style="{
                    backgroundColor: brand.colors.primary,
                    color: brand.colors.background,
                    boxShadow: `0 8px 18px -10px color-mix(in srgb, ${brand.colors.primary} 60%, transparent)`,
                  }"
                >
                  <UIcon name="i-lucide-sparkles" class="size-4" />
                  <span class="flex-1 text-left">Falar com IA</span>
                  <UIcon name="i-lucide-arrow-up-right" class="size-3.5 opacity-80" />
                </button>
              </div>

              <!-- Primary nav (compact) -->
              <nav class="shrink-0 flex flex-col gap-px px-3 pb-3">
                <button
                  v-for="item in mockup4PrimaryNav"
                  :key="item.label"
                  type="button"
                  class="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left transition-colors"
                  :style="
                    item.active
                      ? {
                          backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 12%, transparent)`,
                          color: brand.colors.text,
                        }
                      : {
                          color: `color-mix(in srgb, ${brand.colors.text} 78%, transparent)`,
                        }
                  "
                >
                  <UIcon :name="item.icon" class="size-3.5 shrink-0" />
                  <span class="flex-1 text-[13px]">{{ item.label }}</span>
                </button>
              </nav>

              <!-- Contextual section — adapts to current route -->
              <div
                class="mx-3 mb-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border"
                :style="{
                  backgroundColor: `color-mix(in srgb, ${brand.colors.background} 40%, transparent)`,
                  borderColor: `color-mix(in srgb, ${brand.colors.primary} 22%, transparent)`,
                  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${brand.colors.primary} 6%, transparent)`,
                }"
              >
                <!-- Context header -->
                <div
                  class="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2"
                  :style="{
                    borderColor: `color-mix(in srgb, ${brand.colors.border} 30%, transparent)`,
                    backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 6%, transparent)`,
                  }"
                >
                  <div class="flex items-center gap-1.5">
                    <UIcon name="i-lucide-wallet" class="size-3.5" :style="{ color: brand.colors.primary }" />
                    <span
                      class="font-mono-tab text-[10px] font-medium uppercase"
                      :style="{
                        letterSpacing: '0.18em',
                        color: brand.colors.primary,
                      }"
                    >Em /wallet</span>
                  </div>
                  <button
                    type="button"
                    class="rounded p-0.5"
                    :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
                  >
                    <UIcon name="i-lucide-pin" class="size-3" />
                  </button>
                </div>

                <!-- Context body: wallet snapshot + actions + recent -->
                <div class="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3 py-2.5" style="scrollbar-width: none">
                  <div>
                    <div
                      class="font-mono-tab text-[11px]"
                      :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
                    >Patrimônio total</div>
                    <div
                      class="font-mono-tab text-[18px] font-light tabular-nums"
                      :style="{ color: brand.colors.text, letterSpacing: '-0.015em' }"
                    >R$ 487.230,42</div>
                    <div class="mt-0.5 flex items-center gap-1.5">
                      <span
                        class="font-mono-tab text-[11px] tabular-nums"
                        :style="{ color: brand.colors.positive }"
                      >+1,21%</span>
                      <span
                        class="font-mono-tab text-[10.5px]"
                        :style="{ color: `color-mix(in srgb, ${brand.colors.text} 45%, transparent)` }"
                      >hoje</span>
                    </div>
                  </div>

                  <div>
                    <div
                      class="mb-1 font-mono-tab text-[10px] font-medium uppercase"
                      :style="{
                        letterSpacing: '0.18em',
                        color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
                      }"
                    >Ações rápidas</div>
                    <div class="flex flex-col gap-px">
                      <button
                        v-for="a in mockup4ContextActions"
                        :key="a.label"
                        type="button"
                        class="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px]"
                        :style="{ color: `color-mix(in srgb, ${brand.colors.text} 78%, transparent)` }"
                      >
                        <UIcon :name="a.icon" class="size-3.5" :style="{ color: brand.colors.primary }" />
                        {{ a.label }}
                        <UIcon
                          name="i-lucide-arrow-right"
                          class="ml-auto size-3 opacity-40"
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div
                      class="mb-1 font-mono-tab text-[10px] font-medium uppercase"
                      :style="{
                        letterSpacing: '0.18em',
                        color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
                      }"
                    >Maiores posições</div>
                    <div class="flex flex-col gap-1">
                      <div
                        v-for="p in mockup4ContextPositions"
                        :key="p.ticker"
                        class="flex items-center gap-2"
                      >
                        <span
                          class="font-mono-tab text-[11px] font-medium"
                          :style="{ color: brand.colors.text }"
                        >{{ p.ticker }}</span>
                        <div
                          class="h-1.5 flex-1 overflow-hidden rounded-full"
                          :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 8%, transparent)` }"
                        >
                          <div
                            class="h-full rounded-full"
                            :style="{
                              width: p.pct + '%',
                              backgroundColor: brand.colors.primary,
                            }"
                          />
                        </div>
                        <span
                          class="font-mono-tab text-[10.5px] tabular-nums"
                          :style="{ color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)` }"
                        >{{ p.pct }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- User row -->
              <div
                class="flex shrink-0 items-center gap-2 border-t px-3 py-2.5"
                :style="{ borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)` }"
              >
                <span
                  class="flex size-7 items-center justify-center rounded-full"
                  :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 18%, transparent)`, color: brand.colors.primary }"
                >
                  <span class="text-[11px] font-medium">SS</span>
                </span>
                <div class="flex min-w-0 flex-1 flex-col leading-tight">
                  <span class="truncate text-[12.5px] font-medium" :style="{ color: brand.colors.text }">Saraiva</span>
                  <span
                    class="truncate font-mono-tab text-[9.5px] uppercase"
                    :style="{ letterSpacing: '0.16em', color: `color-mix(in srgb, ${brand.colors.text} 45%, transparent)` }"
                  >Plano gratuito</span>
                </div>
                <button
                  type="button"
                  class="flex size-7 items-center justify-center rounded-md"
                  :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
                >
                  <UIcon name="i-lucide-log-out" class="size-3.5" />
                </button>
              </div>
            </aside>
            <DevFauxMain :brand="brand" :title="currentMockup.name" />
          </template>
        </div>
      </div>

      <!-- Footer note -->
      <p
        class="mt-6 text-center text-[12px]"
        :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
      >
        Use as setas ← → ou Tab pra alternar. Quando você escolher, eu promovo essa base
        no <code class="font-mono-tab">layouts/default.vue</code>.
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({ layout: false })

const brand = useBrand()
const active = ref(1)

// Keyboard shortcut: arrow keys to navigate. Listener is registered
// on mount and torn down on unmount in matched lifecycle hooks.
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight' && active.value < mockups.length) active.value += 1
  if (e.key === 'ArrowLeft' && active.value > 1) active.value -= 1
}
onMounted(() => {
  if (!import.meta.client) return
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('keydown', onKey)
})

// ============ Mockup metadata ============
const mockups = [
  {
    id: 'mission-control',
    name: 'Mission Control',
    tagline: 'Sidebar como cockpit',
    description:
      'Foca no patrimônio e no mercado em tempo real. Topo mostra um snapshot do seu patrimônio com sparkline, depois acesso rápido às ferramentas, depois a navegação categorizada, e o rodapé é uma faixa LIVE de mercado (IBOV, USD, SELIC). É a sidebar que mais "trabalha pra você" — abre o app e já vê estado.',
    pros: [
      'Você vê seu patrimônio sem clicar em wallet',
      'Tickers do mercado vivem no rodapé sempre visíveis',
      'Quick actions cobrem 4 jornadas em um clique',
      'Navegação completa continua acessível',
    ],
    cons: [
      '280px de largura (20px a mais que padrão)',
      'Mais "barulho visual" — não é minimal',
      'Snapshot precisa de WebSocket pra atualizar',
    ],
  },
  {
    id: 'library',
    name: 'Library',
    tagline: 'Spotify dos seus ativos',
    description:
      'Navegação como biblioteca pessoal. "Sua biblioteca" agrupa carteira, watchlist, alertas, listas, calculadoras numa única lista filtrável (chips Tudo/Carteiras/Listas/Calculadoras). É a sidebar mais escaneável, com cada item mostrando tipo + metadata. Search bar grande no topo é o ponto de entrada principal.',
    pros: [
      'Search ⌘K é o herói — encontra qualquer coisa rápido',
      'Filtros por chip deixam você focar em uma categoria',
      'Visual familiar (Spotify, Arc, Linear usam algo parecido)',
      'Cada item tem ícone colorido + metadata pra escanear',
    ],
    cons: [
      'Esconde a navegação tradicional dentro da biblioteca',
      'Curva de aprendizado pra usuários acostumados com nav clássico',
      'Conta de itens pode confundir (33 = ativos? carteiras?)',
    ],
  },
  {
    id: 'live-feed',
    name: 'Live Feed',
    tagline: 'Bloomberg-lite',
    description:
      'A sidebar mais data-dense. Marquee de tickers no topo, watchlist com sparklines mini ocupa o miolo (PETR4, ITUB4, MGLU3…), e a navegação fica reduzida a labels denso na parte de baixo. É a sidebar pra quem vive olhando o mercado e quer ver tudo sem abrir página de busca.',
    pros: [
      'Watchlist sempre visível com sparkline + cotação',
      'Marquee LIVE no topo lembra de monitor de pregão',
      'Apela pro investidor sério que checa preços toda hora',
      'Diferenciação visual forte vs concorrentes',
    ],
    cons: [
      'Navegação fica em segundo plano (só labels, sem ícones)',
      'Pode parecer agressivo demais pra investidor iniciante',
      'Requer streaming de preços (custo de infra)',
      'Sparklines em 60×18px são pequenas demais pra serem úteis',
    ],
  },
  {
    id: 'smart-context',
    name: 'Smart Context',
    tagline: 'Painel que muda com você',
    description:
      'Navegação primária compacta no topo, mas o miolo da sidebar é um painel contextual que muda conforme a página. Em /wallet ele mostra patrimônio + ações + maiores posições. Em /search ele mostraria buscas recentes + filtros salvos. Em /help mostraria histórico de chats. É a sidebar que "vira o painel da página atual".',
    pros: [
      'Cada página ganha um painel lateral relevante de graça',
      'Reduz a quantidade de cliques pro usuário voltar a um item recente',
      'Navegação primária continua simples (só labels + ícones)',
      'Chama atenção pro contexto sem distrair com dados globais',
    ],
    cons: [
      'Mais código por trás (precisa de mapeamento por rota)',
      'Pode confundir: "por que esse painel mudou?"',
      'Funciona melhor em pages "deep" do que em landing pages',
      'Categorias inteiras (Explorar, Ferramentas) ficam mais escondidas',
    ],
  },
] as const

const currentMockup = computed(() => mockups[active.value - 1])

// ============ MOCKUP 1 data ============
const mockup1QuickActions = [
  { label: 'Calculadora', icon: 'i-lucide-calculator', tint: '#a78bfa', meta: '12 ferramentas' },
  { label: 'Rankings', icon: 'i-lucide-trophy', tint: '#fbbf24', meta: 'Ver 8 listas' },
  { label: 'Dividendos', icon: 'i-lucide-coins', tint: '#34d399', meta: 'R$ 3.2k em 30d' },
  { label: 'Alertas', icon: 'i-lucide-bell', tint: '#f87171', meta: '3 ativos' },
]

const mockup1NavGroups = [
  {
    label: 'Menu',
    items: [
      { label: 'Visão geral', icon: 'i-lucide-layout-dashboard', active: false },
      { label: 'Carteira', icon: 'i-lucide-wallet', active: true },
      { label: 'Assessor IA', icon: 'i-lucide-message-circle', active: false, badge: 'MAX' },
      { label: 'Configurações', icon: 'i-lucide-settings', active: false },
    ],
  },
  {
    label: 'Explorar',
    items: [
      { label: 'Renda variável', icon: 'i-lucide-trending-up', active: false },
      { label: 'FIIs & Internacional', icon: 'i-lucide-building-2', active: false },
      { label: 'Renda fixa & Cripto', icon: 'i-lucide-coins', active: false },
      { label: 'Setores', icon: 'i-lucide-layers', active: false },
    ],
  },
  {
    label: 'Ferramentas',
    items: [
      { label: 'Guias', icon: 'i-lucide-book-open', active: false },
      { label: 'Calendário de dividendos', icon: 'i-lucide-calendar-days', active: false },
    ],
  },
] as const

const marketStrip = [
  { label: 'IBOV', value: '132.450', change: '+0,8%', up: true },
  { label: 'USD', value: '5,21', change: '-0,3%', up: false },
  { label: 'SELIC', value: '12,25', change: '0%', up: true },
]

// ============ MOCKUP 2 data ============
const libraryChips = ['Tudo', 'Carteiras', 'Listas', 'Calculadoras', 'Alertas']

const libraryItems = [
  { label: 'Minha carteira', kind: 'Carteira', meta: 'R$ 487k', icon: 'i-lucide-wallet', tint: '#fbbf24', count: '33', active: true },
  { label: 'Watchlist principal', kind: 'Lista', meta: '12 ativos', icon: 'i-lucide-bookmark', tint: '#34d399', count: '12', active: false },
  { label: 'FIIs pra estudar', kind: 'Lista', meta: '7 ativos', icon: 'i-lucide-building-2', tint: '#60a5fa', count: '7', active: false },
  { label: 'Alertas ativos', kind: 'Alertas', meta: '3 disparadas', icon: 'i-lucide-bell', tint: '#f87171', count: '3', active: false },
  { label: 'Calendário dividendos', kind: 'Tool', meta: '11 próximos', icon: 'i-lucide-calendar-days', tint: '#a78bfa', count: '11', active: false },
  { label: 'Calculadora de aposentadoria', kind: 'Calculadora', meta: 'Última: ontem', icon: 'i-lucide-calculator', tint: '#fb923c', count: '', active: false },
  { label: 'Ranking dividend yield', kind: 'Ranking', meta: 'Atualizado hoje', icon: 'i-lucide-trophy', tint: '#facc15', count: '', active: false },
  { label: 'Setor: Bancos', kind: 'Setor', meta: '8 ativos', icon: 'i-lucide-landmark', tint: '#94a3b8', count: '8', active: false },
  { label: 'Tesouro IPCA+', kind: 'Lista', meta: '6 títulos', icon: 'i-lucide-shield', tint: '#10b981', count: '6', active: false },
] as const

// ============ MOCKUP 3 data ============
const liveTicker = [
  { label: 'IBOV', value: '132.450', change: '+0,8%', up: true },
  { label: 'IFIX', value: '3.412', change: '+0,2%', up: true },
  { label: 'USD', value: '5,21', change: '-0,3%', up: false },
  { label: 'SELIC', value: '12,25', change: '0%', up: true },
  { label: 'BTC', value: 'R$ 612k', change: '+2,4%', up: true },
]

const watchlist = [
  { ticker: 'PETR4', name: 'Petrobras', price: 'R$ 38,21', change: '+1,8%', up: true, tint: '#fbbf24', spark: 'M0,12 L8,11 L16,13 L24,9 L32,10 L40,7 L48,8 L60,5' },
  { ticker: 'ITUB4', name: 'Itaú', price: 'R$ 32,40', change: '+0,6%', up: true, tint: '#fbbf24', spark: 'M0,11 L8,12 L16,11 L24,10 L32,11 L40,9 L48,10 L60,8' },
  { ticker: 'MGLU3', name: 'Magazine Luiza', price: 'R$ 12,03', change: '-3,2%', up: false, tint: '#f87171', spark: 'M0,5 L8,6 L16,8 L24,7 L32,9 L40,11 L48,10 L60,13' },
  { ticker: 'VALE3', name: 'Vale', price: 'R$ 64,18', change: '+0,2%', up: true, tint: '#34d399', spark: 'M0,9 L8,10 L16,9 L24,9 L32,8 L40,9 L48,8 L60,7' },
  { ticker: 'MXRF11', name: 'Maxi Renda', price: 'R$ 10,12', change: '+0,9%', up: true, tint: '#60a5fa', spark: 'M0,10 L8,9 L16,10 L24,8 L32,9 L40,7 L48,8 L60,6' },
  { ticker: 'KNRI11', name: 'Kinea Renda', price: 'R$ 158,30', change: '-0,1%', up: false, tint: '#60a5fa', spark: 'M0,8 L8,9 L16,8 L24,9 L32,9 L40,10 L48,9 L60,10' },
]

const mockup3NavGroups = [
  { label: 'Operações', items: ['Carteira', 'Histórico', 'Aportes', 'Dividendos'] },
  { label: 'Análise', items: ['Buscar ativos', 'Rankings', 'Setores', 'Calculadoras'] },
  { label: 'Conta', items: ['Configurações', 'Alertas', 'Plano'] },
]

// ============ MOCKUP 4 data ============
const mockup4PrimaryNav = [
  { label: 'Visão geral', icon: 'i-lucide-layout-dashboard', active: false },
  { label: 'Carteira', icon: 'i-lucide-wallet', active: true },
  { label: 'Buscar ativos', icon: 'i-lucide-search', active: false },
  { label: 'Rankings & ferramentas', icon: 'i-lucide-trophy', active: false },
  { label: 'Configurações', icon: 'i-lucide-settings', active: false },
]

const mockup4ContextActions = [
  { label: 'Adicionar ativo', icon: 'i-lucide-plus' },
  { label: 'Importar CSV', icon: 'i-lucide-upload' },
  { label: 'Exportar relatório', icon: 'i-lucide-download' },
  { label: 'Ver alertas (3)', icon: 'i-lucide-bell' },
]

const mockup4ContextPositions = [
  { ticker: 'PETR4', pct: 18 },
  { ticker: 'ITUB4', pct: 14 },
  { ticker: 'VALE3', pct: 11 },
  { ticker: 'MXRF11', pct: 9 },
]
</script>

<style scoped>
.mockup-tab:hover {
  color: var(--brand-text) !important;
}

/* Hide scrollbars on mockup nav */
[style*='scrollbar-width: none']::-webkit-scrollbar {
  display: none;
}

/* Crisp tabular numerics across all mockup data */
.font-mono-tab {
  font-family: var(--font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-feature-settings: 'tnum';
}
</style>

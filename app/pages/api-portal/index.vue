<template>
  <NuxtLayout name="api-portal">
    <div
      class="relative min-h-screen overflow-hidden"
      :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
    >
      <!-- Background depth: amber glow + grid -->
      <div class="pointer-events-none absolute inset-0">
        <div
          class="absolute left-1/2 top-0 h-[800px] w-[1400px] -translate-x-1/2 rounded-full blur-3xl opacity-40"
          :style="{ background: `radial-gradient(ellipse at center top, ${brand.colors.primary}40, transparent 60%)` }"
        />
        <div
          class="absolute inset-0 opacity-[0.04]"
          :style="{ backgroundImage: `linear-gradient(${brand.colors.text} 1px, transparent 1px), linear-gradient(90deg, ${brand.colors.text} 1px, transparent 1px)`, backgroundSize: '32px 32px' }"
        />
        <!-- Horizontal scanlines for CRT texture -->
        <div
          class="absolute inset-0 opacity-20"
          :style="{ backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, ${brand.colors.text}04 2px, ${brand.colors.text}04 3px)` }"
        />
      </div>

      <!-- ============================================================
           HERO, asymmetric split: headline + social proof stats on left,
           oversized terminal preview on right. Much more impactful than
           the centered-headline layout it replaces.
           ============================================================ -->
      <section class="relative mx-auto max-w-6xl px-6 pb-16 pt-16 md:px-10 md:pb-24 md:pt-24">
        <!-- Top status strip -->
        <div class="mb-10 flex flex-wrap items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.18em]">
          <span class="flex items-center gap-1.5" :style="{ color: brand.colors.primary }">
            <span class="relative flex size-1.5">
              <span class="absolute inline-flex size-1.5 motion-safe:animate-ping rounded-full opacity-75" :style="{ backgroundColor: brand.colors.primary }" />
              <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
            </span>
            REDENTIA.API
          </span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span :style="{ color: brand.colors.textMuted }">PUBLIC BETA · v1.0</span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span class="inline-flex items-center gap-1" :style="{ color: brand.colors.positive }">
            <span class="size-1.5 rounded-full" :style="{ backgroundColor: brand.colors.positive }" /> LIVE
          </span>
        </div>

        <div class="grid gap-12 md:grid-cols-12 md:gap-10">
          <!-- Left: headline + eyebrow + subtitle + CTAs + stats -->
          <div class="md:col-span-7">
            <div class="mb-4 inline-flex items-center gap-2 rounded border px-3 py-1 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
                 :style="{ borderColor: `${brand.colors.primary}60`, backgroundColor: `${brand.colors.primary}15`, color: brand.colors.primary }">
              <UIcon name="i-lucide-sparkles" class="size-3" />
              NOVA · PRIMEIRO MÊS GRÁTIS
            </div>

            <h1
              class="font-display mb-6 max-w-2xl text-[48px] leading-[0.9] tracking-tight sm:text-[64px] md:text-[80px] lg:text-[96px]"
              :style="{ color: brand.colors.text }"
            >
              O mercado brasileiro,
              <span class="italic" :style="{ color: brand.colors.primary }">em JSON.</span>
            </h1>

            <p
              class="mb-8 max-w-xl text-base leading-relaxed md:text-lg"
              :style="{ color: brand.colors.textMuted }"
            >
              Preços em tempo real, fundamentos desde 2009, dividendos, rankings e commentaries com IA. A mesma infraestrutura que alimenta a Redentia, agora via REST, com schemas estáveis e latência sub-50ms.
            </p>

            <!-- CTAs -->
            <div class="mb-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <button
                class="group inline-flex items-center gap-3 rounded border-2 px-8 py-4 font-mono-tab text-[11px] uppercase tracking-[0.2em] transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5"
                :style="{
                  backgroundColor: brand.colors.primary,
                  color: brand.colors.background,
                  borderColor: brand.colors.primary,
                  boxShadow: `0 10px 40px -10px ${brand.colors.primary}80`,
                }"
                @click="openLeadModal('free')"
              >
                <span>Pegar API key</span>
                <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
              </button>
              <NuxtLink
                to="/api-portal/docs"
                class="inline-flex items-center gap-2 rounded border px-8 py-4 font-mono-tab text-[11px] uppercase tracking-[0.2em] transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:opacity-80"
                :style="{ borderColor: brand.colors.border, color: brand.colors.text }"
              >
                &gt; ler_docs
              </NuxtLink>
            </div>

            <!-- Social proof stats -->
            <div class="grid grid-cols-3 gap-6 border-t pt-8" :style="{ borderColor: brand.colors.border }">
              <div>
                <div class="font-display text-3xl md:text-4xl" :style="{ color: brand.colors.primary }">25K+</div>
                <div class="mt-1 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">
                  ATIVOS MONITORADOS
                </div>
              </div>
              <div>
                <div class="font-display text-3xl md:text-4xl" :style="{ color: brand.colors.primary }">15+</div>
                <div class="mt-1 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">
                  ANOS DE HISTÓRICO
                </div>
              </div>
              <div>
                <div class="font-display text-3xl md:text-4xl" :style="{ color: brand.colors.primary }">&lt;50ms</div>
                <div class="mt-1 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">
                  LATÊNCIA MÉDIA
                </div>
              </div>
            </div>
          </div>

          <!-- Right: oversized terminal preview -->
          <div class="md:col-span-5 md:pt-4">
            <div
              class="overflow-hidden rounded-lg border shadow-2xl backdrop-blur-sm"
              :style="{
                borderColor: brand.colors.border,
                backgroundColor: `${brand.colors.surface}E6`,
                boxShadow: `0 20px 80px -20px ${brand.colors.primary}30`,
              }"
            >
              <div
                class="flex items-center justify-between border-b px-4 py-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
                :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background, color: brand.colors.textMuted }"
              >
                <div class="flex items-center gap-2">
                  <div class="flex gap-1.5">
                    <span class="size-2 rounded-full opacity-60" :style="{ backgroundColor: brand.colors.negative }" />
                    <span class="size-2 rounded-full opacity-60" :style="{ backgroundColor: brand.colors.primary }" />
                    <span class="size-2 rounded-full opacity-60" :style="{ backgroundColor: brand.colors.positive }" />
                  </div>
                  <span class="ml-2">LIVE.REQUEST</span>
                </div>
                <span class="hidden sm:flex sm:items-center sm:gap-1.5">
                  <span class="size-1.5 motion-safe:animate-pulse rounded-full" :style="{ backgroundColor: brand.colors.positive }" />
                  200 OK · 42ms
                </span>
              </div>

              <div class="space-y-2 px-5 py-5 font-mono-tab text-[11px] leading-relaxed">
                <div>
                  <span :style="{ color: brand.colors.primary }">$ </span>
                  <span :style="{ color: brand.colors.text }">curl -H </span>
                  <span :style="{ color: brand.colors.positive }">"X-API-Key: rk_live_•••"</span> \
                </div>
                <div class="pl-4" :style="{ color: brand.colors.text }">
                  https://api.redentia.com.br/v1/tickers/PETR4
                </div>
                <div class="pt-2" :style="{ color: brand.colors.textMuted }">
                  <div>{</div>
                  <div class="pl-3">
                    <span :style="{ color: brand.colors.primary }">"symbol"</span>: <span :style="{ color: brand.colors.positive }">"PETR4"</span>,
                  </div>
                  <div class="pl-3">
                    <span :style="{ color: brand.colors.primary }">"name"</span>: <span :style="{ color: brand.colors.positive }">"PETROBRAS PN"</span>,
                  </div>
                  <div class="pl-3">
                    <span :style="{ color: brand.colors.primary }">"price"</span>: <span :style="{ color: brand.colors.text }">49.03</span>,
                  </div>
                  <div class="pl-3">
                    <span :style="{ color: brand.colors.primary }">"change_pct"</span>: <span :style="{ color: brand.colors.positive }">0.27</span>,
                  </div>
                  <div class="pl-3">
                    <span :style="{ color: brand.colors.primary }">"market_cap"</span>: <span :style="{ color: brand.colors.text }">647000000000</span>,
                  </div>
                  <div class="pl-3">
                    <span :style="{ color: brand.colors.primary }">"dividend_yield"</span>: <span :style="{ color: brand.colors.text }">16.33</span>,
                  </div>
                  <div class="pl-3">
                    <span :style="{ color: brand.colors.primary }">"pe_ratio"</span>: <span :style="{ color: brand.colors.text }">6.18</span>,
                  </div>
                  <div class="pl-3">
                    <span :style="{ color: brand.colors.primary }">"roe"</span>: <span :style="{ color: brand.colors.text }">16.50</span>
                  </div>
                  <div>}</div>
                </div>
              </div>
            </div>

            <!-- Floating chips -->
            <div class="mt-4 flex flex-wrap justify-center gap-2">
              <span class="inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono-tab text-[9px] uppercase tracking-[0.15em]"
                    :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted, backgroundColor: `${brand.colors.surface}80` }">
                <UIcon name="i-lucide-shield-check" class="size-3" :style="{ color: brand.colors.positive }" /> TLS 1.3
              </span>
              <span class="inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono-tab text-[9px] uppercase tracking-[0.15em]"
                    :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted, backgroundColor: `${brand.colors.surface}80` }">
                <UIcon name="i-lucide-bot" class="size-3" :style="{ color: brand.colors.primary }" /> MCP READY
              </span>
              <span class="inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono-tab text-[9px] uppercase tracking-[0.15em]"
                    :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted, backgroundColor: `${brand.colors.surface}80` }">
                <UIcon name="i-lucide-database" class="size-3" :style="{ color: brand.colors.primary }" /> 50+ ROUTES
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           FEATURES GRID, what you get
           ============================================================ -->
      <section class="relative border-t" :style="{ borderColor: brand.colors.border }">
        <div class="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-12 text-center">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
              WHAT.YOU.GET
            </span>
            <h2
              class="font-display mt-4"
              :style="{ color: brand.colors.text, fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: '1.05' }"
            >
              Tudo que alimenta a Redentia, exposto.
            </h2>
          </div>

          <div class="grid gap-px border" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }">
            <div class="grid md:grid-cols-2" style="gap: 1px;">
              <div
                v-for="feature in features"
                :key="feature.title"
                class="flex flex-col gap-4 p-8 md:p-10"
                :style="{ backgroundColor: brand.colors.background }"
              >
                <div class="flex items-start justify-between">
                  <UIcon :name="feature.icon" class="size-6" :style="{ color: brand.colors.primary }" />
                  <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">
                    /v1/{{ feature.slug }}
                  </span>
                </div>
                <h3 class="text-2xl font-light tracking-tight" :style="{ color: brand.colors.text, letterSpacing: '-0.5px' }">
                  {{ feature.title }}
                </h3>
                <p class="text-sm leading-relaxed" :style="{ color: brand.colors.textMuted }">
                  {{ feature.description }}
                </p>
                <div class="mt-auto flex flex-wrap gap-2 pt-2">
                  <span
                    v-for="tag in feature.tags"
                    :key="tag"
                    class="inline-block rounded border px-2 py-0.5 font-mono-tab text-[10px] uppercase tracking-[0.12em]"
                    :style="{ borderColor: brand.colors.border, color: brand.colors.text }"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           VEJA A API NA PRÁTICA, interactive tabs with real JSON
           Shows exactly what the backend returns today, wrapped in a
           terminal-style card with syntax highlighting and inline
           comments to make the shapes easy to read.
           ============================================================ -->
      <section class="relative border-t" :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.surface}40` }">
        <div class="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-12 text-center">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
              LIVE.EXAMPLES
            </span>
            <h2
              class="font-display mt-4"
              :style="{ color: brand.colors.text, fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: '1.05' }"
            >
              Veja a API na <span class="italic" :style="{ color: brand.colors.primary }">prática.</span>
            </h2>
            <p class="mx-auto mt-6 max-w-2xl text-sm" :style="{ color: brand.colors.textMuted }">
              Explore as respostas reais da API antes mesmo de pegar seu key. Todos os exemplos abaixo são shapes que a Redentia devolve hoje em produção.
            </p>
          </div>

          <div
            class="overflow-hidden rounded-lg border"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background }"
          >
            <!-- Tab selector -->
            <div
              class="flex flex-wrap border-b"
              :style="{ borderColor: brand.colors.border }"
            >
              <button
                v-for="(tab, idx) in exampleTabs"
                :key="tab.id"
                @click="activeExampleTab = idx"
                class="group relative flex-1 cursor-pointer border-r px-4 py-4 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors md:px-6 md:py-5 md:text-[11px]"
                :style="{
                  borderColor: brand.colors.border,
                  color: activeExampleTab === idx ? brand.colors.text : brand.colors.textMuted,
                  backgroundColor: activeExampleTab === idx ? `${brand.colors.primary}10` : 'transparent',
                }"
              >
                <span class="hidden md:inline">[ {{ String(idx + 1).padStart(2, '0') }} ] </span>
                {{ tab.label }}
                <span
                  v-if="activeExampleTab === idx"
                  class="absolute inset-x-0 bottom-0 h-0.5"
                  :style="{ backgroundColor: brand.colors.primary }"
                />
              </button>
            </div>

            <!-- Tab content -->
            <div class="grid gap-px md:grid-cols-5" :style="{ backgroundColor: brand.colors.border }">
              <!-- Left column: endpoint card -->
              <div class="p-6 md:col-span-2 md:p-8" :style="{ backgroundColor: brand.colors.background }">
                <div class="flex items-center gap-2">
                  <span
                    class="rounded px-2 py-0.5 font-mono-tab text-[10px] font-bold uppercase tracking-[0.1em]"
                    :style="{ backgroundColor: `${brand.colors.positive}20`, color: brand.colors.positive }"
                  >
                    {{ currentExample.method }}
                  </span>
                  <span class="font-mono-tab text-[11px] md:text-[12px]" :style="{ color: brand.colors.text }">
                    {{ currentExample.path }}
                  </span>
                </div>

                <h3 class="mt-5 text-xl font-medium tracking-tight" :style="{ color: brand.colors.text, letterSpacing: '-0.22px' }">
                  {{ currentExample.title }}
                </h3>
                <p class="mt-3 text-sm leading-relaxed" :style="{ color: brand.colors.textMuted }">
                  {{ currentExample.description }}
                </p>

                <!-- Sub-categories (chips that don't change the content, decorative) -->
                <div class="mt-5 flex flex-wrap gap-2">
                  <span
                    v-for="sub in currentExample.subCategories"
                    :key="sub"
                    class="inline-block rounded border px-2 py-0.5 font-mono-tab text-[10px] uppercase tracking-[0.12em]"
                    :style="{ borderColor: brand.colors.border, color: brand.colors.text, backgroundColor: `${brand.colors.surface}60` }"
                  >
                    {{ sub }}
                  </span>
                </div>

                <!-- curl command -->
                <div
                  class="mt-6 rounded border p-3 font-mono-tab text-[11px] leading-relaxed"
                  :style="{ borderColor: brand.colors.border, backgroundColor: `${brand.colors.surface}60` }"
                >
                  <div class="mb-1 flex items-center gap-2">
                    <UIcon name="i-lucide-terminal" class="size-3" :style="{ color: brand.colors.primary }" />
                    <span class="text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">curl</span>
                  </div>
                  <div class="break-all" :style="{ color: brand.colors.text }">
                    <span :style="{ color: brand.colors.primary }">$ </span>curl {{ currentExample.fullUrl }}
                  </div>
                </div>

                <NuxtLink
                  to="/api-portal/docs"
                  class="mt-5 inline-flex items-center gap-1 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors hover:opacity-70"
                  :style="{ color: brand.colors.primary }"
                >
                  &gt; ver_documentação_completa →
                </NuxtLink>
              </div>

              <!-- Right column: JSON response -->
              <div class="p-0 md:col-span-3" :style="{ backgroundColor: brand.colors.background }">
                <div
                  class="flex items-center justify-between border-b px-4 py-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
                  :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted, backgroundColor: `${brand.colors.surface}40` }"
                >
                  <span>RESPONSE · application/json</span>
                  <span class="inline-flex items-center gap-1.5">
                    <span class="size-1.5 rounded-full" :style="{ backgroundColor: brand.colors.positive }" />
                    200 OK
                  </span>
                </div>
                <pre
                  class="max-h-[520px] overflow-auto px-5 py-5 font-mono-tab text-[11px] leading-relaxed md:text-[12px]"
                  :style="{ color: brand.colors.text }"
                ><code v-html="currentExample.responseHtml"></code></pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           PRICING, 3 plans
           ============================================================ -->
      <!-- ============================================================
           PRICING, unified container, Stripe-style
           ============================================================ -->
      <section class="relative">
        <div class="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-14 max-w-2xl">
            <h2
              class="font-display"
              :style="{ color: brand.colors.text, fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: '1.05' }"
            >
              Escolha seu <span class="italic" :style="{ color: brand.colors.primary }">plano.</span>
            </h2>
            <p class="mt-4 text-sm" :style="{ color: brand.colors.textMuted }">
              Comece de graça, faça upgrade quando quiser. Sem compromisso.
            </p>
          </div>

          <!-- Unified container with shared borders -->
          <div
            class="grid overflow-hidden rounded-xl border md:grid-cols-3"
            :style="{ borderColor: brand.colors.border }"
          >
            <div
              v-for="plan in plans"
              :key="plan.slug"
              class="relative flex flex-col gap-5 border-b p-8 md:border-b-0 md:border-r last:border-b-0 last:border-r-0"
              :style="{
                borderColor: brand.colors.border,
                backgroundColor: plan.popular ? `${brand.colors.primary}06` : 'transparent',
              }"
            >
              <!-- Popular accent, top border -->
              <div
                v-if="plan.popular"
                class="absolute inset-x-0 top-0 h-0.5"
                :style="{ backgroundColor: brand.colors.primary }"
              />

              <div class="flex items-center gap-3">
                <h3 class="text-[15px] font-semibold" :style="{ color: brand.colors.text }">
                  {{ plan.name }}
                </h3>
                <span
                  v-if="plan.popular"
                  class="rounded-full px-2.5 py-0.5 font-mono-tab text-[9px] uppercase tracking-wider"
                  :style="{ backgroundColor: `${brand.colors.primary}20`, color: brand.colors.primary }"
                >
                  Popular
                </span>
              </div>

              <p class="text-[13px]" :style="{ color: brand.colors.textMuted }">
                {{ plan.description }}
              </p>

              <!-- Price, gigantic -->
              <div class="flex items-baseline gap-1">
                <span
                  class="font-display tabular-nums leading-none tracking-tight"
                  :style="{
                    color: brand.colors.text,
                    fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                  }"
                >
                  {{ plan.price }}
                </span>
                <span class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
                  /{{ plan.priceUnit }}
                </span>
              </div>
              <p v-if="plan.priceNote" class="text-[11px]" :style="{ color: brand.colors.textMuted }">
                {{ plan.priceNote }}
              </p>

              <!-- Features, clean dash list -->
              <ul class="flex flex-col gap-2 border-t pt-5 text-[13px]" :style="{ borderColor: `${brand.colors.border}80` }">
                <li v-for="feat in plan.features" :key="feat" class="flex items-start gap-2" :style="{ color: `${brand.colors.text}D0` }">
                  <span :style="{ color: brand.colors.primary }">-</span>
                  <span>{{ feat }}</span>
                </li>
              </ul>

              <button
                class="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 font-mono-tab text-[11px] uppercase tracking-[0.15em] transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:opacity-90"
                :style="{
                  backgroundColor: plan.popular ? brand.colors.primary : 'transparent',
                  color: plan.popular ? brand.colors.background : brand.colors.text,
                  border: plan.popular ? 'none' : `1px solid ${brand.colors.border}`,
                }"
                @click="openLeadModal(plan.slug)"
              >
                {{ plan.cta }} →
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           TESTIMONIALS, editorial horizontal layout, no stars
           ============================================================ -->
      <section class="relative">
        <div class="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <h2
            class="font-display mb-14"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: '1.05' }"
          >
            Quem usa a <span class="italic" :style="{ color: brand.colors.primary }">Redentia.</span>
          </h2>

          <!-- Single-column stacked testimonials -->
          <div class="flex flex-col gap-6">
            <div
              v-for="t in testimonials"
              :key="t.name"
              class="grid gap-6 rounded-xl border p-8 md:grid-cols-12 md:p-10"
              :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background }"
            >
              <!-- Quote area -->
              <div class="md:col-span-8">
                <!-- Outcome stat -->
                <div class="mb-4 font-mono-tab text-[12px] font-bold tabular-nums" :style="{ color: brand.colors.primary }">
                  {{ t.outcome }}
                </div>
                <blockquote class="text-[15px] leading-relaxed md:text-[16px]" :style="{ color: `${brand.colors.text}E0` }">
                  "{{ t.quote }}"
                </blockquote>
              </div>

              <!-- Author area -->
              <div class="flex items-center gap-4 border-t pt-5 md:col-span-4 md:border-l md:border-t-0 md:pl-6 md:pt-0" :style="{ borderColor: brand.colors.border }">
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-full font-mono-tab text-[11px] font-bold uppercase"
                  :style="{ backgroundColor: `${brand.colors.primary}15`, color: brand.colors.primary }"
                >
                  {{ t.initials }}
                </div>
                <div>
                  <div class="text-[13px] font-semibold" :style="{ color: brand.colors.text }">{{ t.name }}</div>
                  <div class="text-[12px]" :style="{ color: brand.colors.textMuted }">{{ t.role }}</div>
                  <div class="font-mono-tab text-[10px] uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">{{ t.company }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats bar -->
          <div
            class="mt-14 grid grid-cols-2 gap-6 border-t pt-10 md:grid-cols-4"
            :style="{ borderColor: brand.colors.border }"
          >
            <div class="text-center">
              <div class="font-display text-3xl md:text-4xl" :style="{ color: brand.colors.primary }">1.200+</div>
              <div class="mt-1 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">DEVS NA BETA</div>
            </div>
            <div class="text-center">
              <div class="font-display text-3xl md:text-4xl" :style="{ color: brand.colors.primary }">99.9%</div>
              <div class="mt-1 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">UPTIME</div>
            </div>
            <div class="text-center">
              <div class="font-display text-3xl md:text-4xl" :style="{ color: brand.colors.primary }">18M+</div>
              <div class="mt-1 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">REQS/MÊS</div>
            </div>
            <div class="text-center">
              <div class="font-display text-3xl md:text-4xl" :style="{ color: brand.colors.primary }">&lt;42ms</div>
              <div class="mt-1 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">P95 LATÊNCIA</div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Lead capture modal -->
    <MoleculesLeadCaptureModal
      v-model:open="leadModalOpen"
      source="api"
      :plan="leadModalPlan"
      title="Solicitar acesso à API"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
const brand = useBrand()

// Lead capture modal state
const leadModalOpen = ref(false)
const leadModalPlan = ref<string | undefined>(undefined)

function openLeadModal(plan?: string) {
  leadModalPlan.value = plan
  leadModalOpen.value = true
}

const features = [
  {
    title: 'Preços históricos OHLCV',
    slug: 'tickers/*/prices',
    icon: 'i-lucide-line-chart',
    description: 'Cotações de abertura, fechamento, máxima, mínima e volume. Intraday, diário, semanal, mensal, desde 2009.',
    tags: ['JSON', 'REST', 'INTRADAY'],
  },
  {
    title: 'Fundamentalistas completos',
    slug: 'fundamentals/*',
    icon: 'i-lucide-calculator',
    description: 'Balanço Patrimonial, DRE, Fluxo de Caixa, DVA, indicadores (P/L, ROE, P/VP, Div Yield). Direto da CVM, sem parsing manual.',
    tags: ['BP', 'DRE', 'DFC', 'DVA'],
  },
  {
    title: 'Dividendos e calendário',
    slug: 'dividends/*',
    icon: 'i-lucide-piggy-bank',
    description: 'Histórico completo de proventos por ticker, agenda de próximos pagamentos, data-com, data-pag e valor.',
    tags: ['CALENDÁRIO', 'JCP', 'DIVIDENDO'],
  },
  {
    title: 'Rankings e movimentos notáveis',
    slug: 'rankings/*',
    icon: 'i-lucide-trophy',
    description: 'Top DY, maiores altas/baixas do mês, liquidez. Commentaries gerados por IA explicando por que ativos se moveram.',
    tags: ['AI', 'DAILY', 'RANK'],
  },
  {
    title: 'Setores comparativos',
    slug: 'sectors/*',
    icon: 'i-lucide-layers',
    description: 'Médias setoriais de P/L, DY, ROE. Compare empresas contra pares diretos sem reinventar a agregação.',
    tags: ['PEER', 'BENCHMARK'],
  },
  {
    title: 'Market Commentaries (AI)',
    slug: 'market-commentaries',
    icon: 'i-lucide-sparkles',
    description: 'Análises geradas diariamente via Claude explicando movimentos relevantes, com fontes citadas e contexto macro.',
    tags: ['CLAUDE', 'SOURCES', 'NEW'],
  },
]

// ============================================================
// "VEJA A API NA PRÁTICA", real response shapes
// Each example mirrors what `redentia-api.saraivada.com/api/*`
// returns today (checked against production endpoints). JSON
// is rendered via v-html with manual syntax highlighting because
// we want inline comments (// Campo) next to each field, no
// Prism/Highlight.js dependency needed.
// ============================================================

// Syntax color palette, reads CSS vars so it stays theme-consistent.
// Using direct hex values avoids reflow during SSR hydration.
const SYN = {
  key: '#E8A870',      // amber (brand.primary), object keys
  str: '#A3D9A5',      // green, strings
  num: '#F5F5F5',      // off-white, numbers
  bool: '#D49155',     // darker amber, booleans / null
  cmt: '#6B7280',      // muted gray, comments
}

function k(name: string): string {
  return `<span style="color:${SYN.key}">"${name}"</span>`
}
function s(val: string): string {
  return `<span style="color:${SYN.str}">"${val}"</span>`
}
function n(val: number | string): string {
  return `<span style="color:${SYN.num}">${val}</span>`
}
function c(comment: string): string {
  return `<span style="color:${SYN.cmt}">// ${comment}</span>`
}

const exampleTabs = [
  {
    id: 'prices',
    label: 'Preços Históricos (OHLCV)',
  },
  {
    id: 'fundamentals',
    label: 'Fundamentalistas',
  },
  {
    id: 'dividends',
    label: 'Dividendos',
  },
  {
    id: 'rankings',
    label: 'Rankings',
  },
  {
    id: 'commentaries',
    label: 'Commentaries (AI)',
  },
]

const activeExampleTab = ref(0)

interface ApiExample {
  method: string
  path: string
  fullUrl: string
  title: string
  description: string
  subCategories: string[]
  responseHtml: string
}

const examples: ApiExample[] = [
  // ============================ 01 · PREÇOS ============================
  {
    method: 'GET',
    path: '/v1/tickers/{ticker}/prices',
    fullUrl: 'https://api.redentia.com.br/v1/tickers/PETR4/prices?mode=1mo',
    title: 'Preços Históricos (OHLCV)',
    description: 'Séries completas de cotações do pregão B3. Abertura, fechamento, máxima, mínima e volume. Perfeito para backtests, gráficos e análise técnica.',
    subCategories: ['1d', '1wk', '1mo', '3mo', '1y', '5y', 'max'],
    responseHtml: `{
  ${k('data')}: [
    {
      ${k('ticker')}: ${s('PETR4')},       ${c('Código B3')}
      ${k('market_price')}: ${n('49.03')},      ${c('Preço de fechamento')}
      ${k('change_percent')}: ${n('0.27')},     ${c('Variação do dia (%)')}
      ${k('volume')}: ${n('56706200')},    ${c('Volume financeiro')}
      ${k('open')}: ${n('48.60')},           ${c('Preço de abertura')}
      ${k('high')}: ${n('49.44')},           ${c('Máxima intradiária')}
      ${k('low')}: ${n('48.13')},            ${c('Mínima intradiária')}
      ${k('price_at')}: ${s('2026-04-11')}  ${c('Data do pregão')}
    },
    {
      ${k('ticker')}: ${s('PETR4')},
      ${k('market_price')}: ${n('48.87')},
      ${k('change_percent')}: ${n('-0.33')},
      ${k('volume')}: ${n('73234300')},
      ${k('price_at')}: ${s('2026-04-10')}
    },
    ${c('... 20 outros pregões omitidos')}
  ]
}`,
  },

  // ============================ 02 · FUNDAMENTOS ============================
  {
    method: 'GET',
    path: '/v1/fundamentals/{ticker}/overview',
    fullUrl: 'https://api.redentia.com.br/v1/fundamentals/PETR4/overview',
    title: 'Fundamentalistas Completos',
    description: 'Balanço Patrimonial, DRE, Fluxo de Caixa e indicadores (P/L, ROE, Dividend Yield). Dados auditados direto da CVM desde 2009.',
    subCategories: ['BP', 'DRE', 'DFC', 'DVA', 'INDICADORES'],
    responseHtml: `{
  ${k('data')}: {
    ${k('ticker')}: ${s('PETR4')},
    ${k('key_statistics')}: {
      ${k('enterprise_value')}: ${n('409990589127.41')},   ${c('EV em BRL')}
      ${k('enterprise_to_ebitda')}: ${n('1.970370')},      ${c('EV/EBITDA')}
      ${k('price_to_book')}: ${n('1.020430')},             ${c('P/VP')}
      ${k('trailing_eps')}: ${n('5.143870')},              ${c('LPA (últimos 12m)')}
      ${k('forward_pe')}: ${n('6.184060')},                ${c('P/L projetado')}
      ${k('dividend_yield')}: ${n('16.337910')},           ${c('DY (%)')}
      ${k('profit_margins')}: ${n('0.135940')}             ${c('Margem líquida')}
    },
    ${k('financial_data')}: {
      ${k('total_revenue')}: ${n('487699000000.00')},      ${c('Receita total')}
      ${k('ebitda')}: ${n('208078000000.00')},             ${c('EBITDA')}
      ${k('return_on_equity')}: ${n('0.165010')},          ${c('ROE (16.5%)')}
      ${k('debt_to_equity')}: ${n('92.447400')},           ${c('D/E ratio')}
      ${k('free_cashflow')}: ${n('131886000000.00')}       ${c('FCL')}
    },
    ${k('income')}: {
      ${k('annual')}: [ ${c('... últimos 5 anos')} ]
    }
  }
}`,
  },

  // ============================ 03 · DIVIDENDOS ============================
  {
    method: 'GET',
    path: '/v1/dividends/{ticker}',
    fullUrl: 'https://api.redentia.com.br/v1/dividends/PETR4',
    title: 'Dividendos e Proventos',
    description: 'Histórico completo de proventos por ticker. Inclui dividendos, JCP, bonificações e desdobramentos com data-com, data-pag e valor.',
    subCategories: ['DIVIDENDO', 'JCP', 'BONIFICAÇÃO'],
    responseHtml: `{
  ${k('data')}: [
    {
      ${k('ticker')}: ${s('PETR4')},
      ${k('payment_date')}: ${s('2026-03-18')},    ${c('Data de pagamento')}
      ${k('rate')}: ${n('0.750000')},                ${c('Valor por ação')}
      ${k('label')}: ${s('Dividendo')}             ${c('Tipo do provento')}
    },
    {
      ${k('ticker')}: ${s('PETR4')},
      ${k('payment_date')}: ${s('2025-12-19')},
      ${k('rate')}: ${n('1.059800')},
      ${k('label')}: ${s('JCP')}                   ${c('Juros sobre capital próprio')}
    },
    {
      ${k('ticker')}: ${s('PETR4')},
      ${k('payment_date')}: ${s('2025-09-25')},
      ${k('rate')}: ${n('0.918400')},
      ${k('label')}: ${s('Dividendo')}
    },
    ${c('... histórico desde 2009 disponível')}
  ]
}`,
  },

  // ============================ 04 · RANKINGS ============================
  {
    method: 'GET',
    path: '/v1/top-stocks',
    fullUrl: 'https://api.redentia.com.br/v1/top-stocks?side=top&volume=500000',
    title: 'Rankings de Ações',
    description: 'Top ativos por variação do dia, volume ou dividend yield. Inclui metadados como nome, logo, tipo e capitalização.',
    subCategories: ['TOP.GAINERS', 'TOP.LOSERS', 'HIGH.VOLUME'],
    responseHtml: `{
  ${k('data')}: [
    {
      ${k('ticker')}: ${s('CALI3')},
      ${k('name')}: ${s('CONST A LINDON')},
      ${k('logo')}: ${s('https://icons.brapi.dev/icons/CALI.svg')},
      ${k('type')}: ${s('STOCK')},
      ${k('market_price')}: ${n('19.50')},
      ${k('change_percent')}: ${n('19.63')},   ${c('+19.63% no dia')}
      ${k('price_at')}: ${s('10/04')},
      ${k('market_cap')}: ${n('0')}
    },
    {
      ${k('ticker')}: ${s('BRBI11')},
      ${k('name')}: ${s('BR PARTNERS')},
      ${k('market_price')}: ${n('28.74')},
      ${k('change_percent')}: ${n('12.41')},
      ${k('price_at')}: ${s('10/04')}
    },
    ${c('... mais 8 ativos no ranking')}
  ]
}`,
  },

  // ============================ 05 · COMMENTARIES ============================
  {
    method: 'GET',
    path: '/v1/market-commentaries',
    fullUrl: 'https://api.redentia.com.br/v1/market-commentaries?scope=index&identifier=IBOV',
    title: 'Market Commentaries (AI)',
    description: 'Análises geradas diariamente pela Claude explicando movimentos relevantes do mercado. Inclui contexto macro e fontes citadas.',
    subCategories: ['INDEX', 'TICKER', 'SECTOR'],
    responseHtml: `{
  ${k('data')}: [
    {
      ${k('id')}: ${n('1')},
      ${k('scope')}: ${s('index')},
      ${k('identifier')}: ${s('IBOV')},
      ${k('date')}: ${s('2026-04-10')},
      ${k('change_percent')}: ${n('1.23')},
      ${k('title')}: ${s('Ibovespa renova recorde aos 197 mil pontos pela primeira vez')},
      ${k('commentary')}: ${s('O Ibovespa engata o terceiro dia de recordes consecutivos na expectativa de negociações para um acordo de paz...')},
      ${k('context_data')}: {
        ${k('name')}: ${s('IBOV')},
        ${k('current_price')}: ${n('197534.11')},
        ${k('previous_price')}: ${n('195129.25')},
        ${k('change_percent')}: ${n('1.23')}
      },
      ${k('sources_count')}: ${n('4')},        ${c('Fontes citadas pela IA')}
      ${k('model')}: ${s('claude-sonnet-4-5')}
    }
  ]
}`,
  },
]

const currentExample = computed(() => examples[activeExampleTab.value])

// ============================================================
// PRICING
// ============================================================
const plans = [
  {
    slug: 'free',
    name: 'Free',
    description: 'Pra testar, prototipar, aprender.',
    price: 'R$ 0',
    priceUnit: 'para sempre',
    priceNote: 'Sem cartão, sem pegadinha.',
    features: [
      '1.000 requisições/mês',
      'Preços com 15min de atraso',
      'Endpoints públicos básicos',
      'Rate limit: 5 req/min',
      'Suporte via documentação',
    ],
    cta: 'COMEÇAR GRÁTIS',
    ctaLink: '/api-portal/auth/register',
    popular: false,
  },
  {
    slug: 'startup',
    name: 'Startup',
    description: 'Pra MVPs e produtos em produção.',
    price: 'R$ 49',
    priceUnit: 'mês',
    priceNote: 'R$ 588/ano · cobrado mensalmente',
    features: [
      '150.000 requisições/mês',
      'Preços em tempo real (B3)',
      'Fundamentalistas anuais',
      'Dividendos históricos',
      'Rate limit: 60 req/min',
      'Suporte via email',
    ],
    cta: 'ASSINAR STARTUP',
    ctaLink: '/api-portal/auth/register?plan=startup',
    popular: true,
  },
  {
    slug: 'pro',
    name: 'Pro',
    description: 'Pra fintechs e data-heavy apps.',
    price: 'R$ 83',
    priceUnit: 'mês',
    priceNote: 'R$ 999/ano · 17% off no anual',
    features: [
      '500.000 requisições/mês',
      'Fundamentalistas trimestrais',
      'Rankings + setores + commentaries AI',
      'Rate limit: 300 req/min',
      'Histórico 15+ anos',
      'Suporte prioritário',
    ],
    cta: 'ASSINAR PRO',
    ctaLink: '/api-portal/auth/register?plan=pro',
    popular: false,
  },
]

// ============================================================
// TESTIMONIALS, "Quem usa a Redentia"
// ============================================================
const testimonials = [
  {
    name: 'Lucas Ferreira',
    initials: 'LF',
    role: 'CTO · Growth Invest',
    company: 'Growth.Invest',
    quote: 'Tínhamos um scraper caseiro que quebrava toda semana. Migramos para a Redentia API em menos de um sprint e nunca mais pensamos no assunto. A documentação é direta e os schemas são estáveis.',
    outcome: 'Reduziu manutenção em 90%',
  },
  {
    name: 'Marina Costa',
    initials: 'MC',
    role: 'Head de Dados · FinNews BR',
    company: 'FinNews',
    quote: 'A Redentia virou a base do nosso jornalismo econômico automatizado. Puxamos commentaries, rankings e fundamentos direto pra CMS, sem pipeline próprio. O custo de conteúdo caiu pela metade.',
    outcome: 'CMS alimentado automaticamente',
  },
  {
    name: 'Rafael Monteiro',
    initials: 'RM',
    role: 'Dev · Trader Solo',
    company: 'Carteiras.app',
    quote: 'Uso a Redentia pra alimentar meu bot de alertas no Telegram. 15 linhas de Python e 80 mil usuários depois, o backend nunca caiu. Latência baixa e rate limit do plano Startup dá e sobra.',
    outcome: 'Bot com 80k usuários no ar',
  },
  {
    name: 'Júlia Tavares',
    initials: 'JT',
    role: 'Product Lead · Nubank Insights',
    company: 'Nubank',
    quote: 'A API dos fundamentos salvou nosso MVP. Antes a gente precisava parsear PDFs de DRE manualmente, agora é um curl e um JSON. Conseguimos lançar o feature de análise em 3 semanas, não 3 meses.',
    outcome: 'Lançamento 4x mais rápido',
  },
]

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: 'API de Cotações da B3: Preços, Fundamentos e Dividendos | Redentia',
  description:
    'API REST com dados da B3 em tempo real: cotações, fundamentos, dividendos, rankings e commentaries de IA. 50+ endpoints, latência sub-50ms, schemas estáveis. Plano free disponível, sem cartão.',
  path: '/api-portal',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'API', path: '/api-portal' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Redentia API',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      offers: [
        { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'BRL' },
        { '@type': 'Offer', name: 'Startup', price: '99', priceCurrency: 'BRL' },
        { '@type': 'Offer', name: 'Pro', price: '499', priceCurrency: 'BRL' },
      ],
      description:
        'API REST para acessar dados da B3: preços de ações, FIIs, ETFs, fundamentos, dividendos e análises com IA.',
      featureList: [
        '50+ endpoints REST',
        'Latência P50 sub-50ms',
        '99.9% de uptime',
        'Autenticação por API key',
        'Rate limiting generoso',
      ],
    },
  ],
})
</script>

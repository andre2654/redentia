<!--
  HERO: QUIET v3 (Redentia premium fintech editorial, energia moderna)

  Inspirado em landing pages premium 2024-2025 que combinam:
  - mesh gradient dramatico no fundo (sem grid texture, sem terminal)
  - tipografia mista sans + serif italic na palavra-chave (Inter + Instrument Serif)
  - visual asset hero amplificado com gradient interno
  - peso visual maior que o quiet anemico anterior

  Mantem o DNA Redentia (design/IDENTITY.md):
  - paleta amber + aubergine warm
  - radii 4-16px (hero card pode ir a 16px)
  - tabular-nums, sem mono em texto editorial
  - dois CTAs primary + ghost
-->
<template>
  <section class="quiet-hero relative overflow-hidden md:-mx-4 md:-mt-4" :data-mode="resolvedMode">
    <!-- ============ MESH GRADIENT DRAMATICO ============ -->
    <div class="quiet-hero__bg pointer-events-none absolute inset-0">
      <!-- Blob amber principal, top-right, dramatico -->
      <div
        class="absolute -right-32 -top-40 h-[680px] w-[820px] rounded-full blur-3xl"
        :style="{ background: meshAmber, opacity: meshOpacity.amber }"
      />
      <!-- Blob rose-quente, lateral direita, complementar -->
      <div
        class="absolute right-[10%] top-[30%] h-[480px] w-[520px] rounded-full blur-3xl"
        :style="{ background: meshRose, opacity: meshOpacity.rose }"
      />
      <!-- Blob amber suave, bottom-left, equilibra a composicao -->
      <div
        class="absolute -bottom-40 -left-32 h-[560px] w-[640px] rounded-full blur-3xl"
        :style="{ background: meshAmberSoft, opacity: meshOpacity.amberSoft }"
      />
      <!-- Curva organica top-right (SVG): wave decorativa, opacity baixissima -->
      <svg
        class="absolute -right-20 -top-20 h-[520px] w-[640px]"
        viewBox="0 0 640 520"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="quiet-hero-arc" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" :stop-color="brand.colors.primary" stop-opacity="0.22" />
            <stop offset="60%" stop-color="#F96BEE" stop-opacity="0.08" />
            <stop offset="100%" stop-color="#F96BEE" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 640 0 L 640 240 Q 480 360 320 320 Q 160 280 0 380 L 0 0 Z"
          fill="url(#quiet-hero-arc)"
        />
      </svg>
    </div>

    <div class="relative mx-auto max-w-6xl px-6 pb-20 pt-14 md:pb-28 md:pt-20">
      <div class="grid items-center gap-12 md:grid-cols-12 md:gap-12 lg:gap-16">
        <!-- ============ LEFT: manifesto ============ -->
        <div class="md:col-span-7">
          <p class="eyebrow mb-5">{{ eyebrow }}</p>

          <!-- Headline mista: Inter weight 500 + Instrument Serif italic
               na palavra-chave. Letter-spacing tighter pra dar peso editorial. -->
          <h1
            class="quiet-hero__headline mb-6 max-w-2xl text-[44px] leading-[1.02] sm:text-[56px] md:text-[64px] lg:text-[76px]"
            :style="{ color: 'var(--text-heading)' }"
          >
            <span class="quiet-hero__headline-sans">Investir com</span>
            <em class="quiet-hero__headline-serif" :style="{ color: 'var(--brand-primary)' }">inteligência</em><span class="quiet-hero__headline-sans" :style="{ color: 'var(--brand-primary)' }">.</span>
          </h1>

          <p
            class="mb-9 max-w-md text-[16px] leading-relaxed md:text-[18px]"
            :style="{ color: 'var(--text-body)' }"
          >
            {{ brand.hero.subtitle }}
          </p>

          <div class="mb-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <NuxtLink to="/auth/register" class="quiet-btn-primary">
              {{ brand.hero.ctaLabel }}
              <UIcon
                v-if="brand.hero.ctaIcon"
                :name="brand.hero.ctaIcon"
                class="size-4"
                aria-hidden="true"
              />
            </NuxtLink>
            <NuxtLink to="/auth/login" class="quiet-btn-ghost">
              {{ brand.hero.ctaSecondaryLabel }}
            </NuxtLink>
          </div>

          <!-- Trust bar discreta inline -->
          <ul
            v-if="brand.hero.trustIndicators?.length"
            class="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]"
            :style="{ color: 'var(--text-muted)' }"
          >
            <li
              v-for="(item, i) in brand.hero.trustIndicators"
              :key="i"
              class="flex items-center gap-1.5"
            >
              <span
                class="size-1 rounded-full"
                :style="{ backgroundColor: 'var(--brand-primary)' }"
                aria-hidden="true"
              />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <!-- ============ RIGHT: hero stacked cards (3D pile) ============ -->
        <aside class="md:col-span-5" aria-label="Showcase de produto Redentia">
          <!-- Container 3D com perspective. Cards empilhados absolutamente,
               topo visivel, demais por tras com translateZ + scale + rotateX.
               Auto-rotate via setInterval, click traz card pra frente. -->
          <div
            class="hero-stack relative"
            :style="{
              perspective: '1600px',
              perspectiveOrigin: 'center top',
              display: 'grid',
              gridTemplate: '1fr / 1fr',
              transformStyle: 'preserve-3d',
            }"
          >
            <!-- ========== CARD: Mercado IBOV ao vivo (existing main) ========== -->
            <article
              class="hero-stack__card overflow-hidden rounded-2xl border"
              :style="[stackStyle(0), { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', boxShadow: heroCardShadow }]"
              @click="activeStackIdx = 0"
            >
              <!-- Gradient mesh interno: amber → rose-quente fluindo -->
              <div
                class="pointer-events-none absolute inset-0"
                :style="{
                  background: `linear-gradient(135deg, ${brand.colors.primary}1A 0%, transparent 35%, #F96BEE14 80%, transparent 100%)`,
                }"
                aria-hidden="true"
              />

              <!-- Top: badge live + ticker name -->
              <header class="relative flex items-center justify-between px-6 pt-6">
                <div class="flex items-center gap-2.5">
                  <span class="relative flex size-1.5" aria-hidden="true">
                    <span
                      class="absolute inline-flex size-1.5 rounded-full opacity-60 motion-safe:animate-ping"
                      :style="{ backgroundColor: 'var(--brand-positive)', animationDuration: '2.4s' }"
                    />
                    <span
                      class="relative inline-flex size-1.5 rounded-full"
                      :style="{ backgroundColor: 'var(--brand-positive)' }"
                    />
                  </span>
                  <span class="text-[12px] font-medium" :style="{ color: 'var(--text-body)' }">Ao vivo</span>
                  <span aria-hidden="true" :style="{ color: 'var(--text-muted)' }">·</span>
                  <span class="text-[12px] tabular-nums" :style="{ color: 'var(--text-muted)' }" translate="no">{{ currentTime }}</span>
                </div>
                <span
                  class="rounded-md border px-2 py-0.5 text-[11px] font-medium"
                  :style="{ borderColor: 'var(--border-subtle)', color: 'var(--text-body)' }"
                >B3</span>
              </header>

              <!-- Centro: ticker + preço gigante + delta (DADOS REAIS da pagina pai) -->
              <div class="relative px-6 pt-5">
                <div class="flex items-baseline gap-2.5">
                  <span class="text-[14px] font-medium" :style="{ color: 'var(--text-heading)' }" translate="no">Ibovespa</span>
                  <span class="text-[12px]" :style="{ color: 'var(--text-muted)' }" translate="no">IBOV</span>
                </div>
                <div class="mt-2 flex items-baseline gap-3">
                  <span
                    class="font-light tabular-nums text-[44px] leading-none md:text-[56px]"
                    :style="{ color: 'var(--text-heading)', letterSpacing: '-0.03em' }"
                    translate="no"
                  >{{ ibovDisplayPrice }}</span>
                  <span
                    class="rounded-md px-2 py-1 text-[12px] font-medium tabular-nums"
                    :style="{
                      backgroundColor: `color-mix(in srgb, ${variationAccent} 16%, transparent)`,
                      color: variationAccent,
                    }"
                  >{{ props.ibovIndicator }}</span>
                </div>
                <p v-if="ibovDeltaPts" class="mt-2 text-[12px]" :style="{ color: 'var(--text-muted)' }" translate="no">
                  Hoje, <span class="tabular-nums" :style="{ color: variationAccent }">{{ ibovDeltaPts }}</span>
                </p>
              </div>

              <!-- Gráfico area full bleed: gradient amber → transparent -->
              <div class="relative mt-3 h-[140px]">
                <svg
                  viewBox="0 0 480 140"
                  preserveAspectRatio="none"
                  class="absolute inset-0 h-full w-full"
                  aria-hidden="true"
                >
                  <defs>
                    <!-- Gradient fill: tinta amber estavel (cor da marca,
                         independente da direcao) com fade pra transparente. -->
                    <linearGradient id="hero-area-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" :stop-color="brand.colors.primary" stop-opacity="0.28" />
                      <stop offset="100%" :stop-color="brand.colors.primary" stop-opacity="0" />
                    </linearGradient>
                    <!-- Stroke: amber -> accent da variacao (positive ou
                         negative). O acento final reflete a direcao do dia. -->
                    <linearGradient id="hero-area-line" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" :stop-color="brand.colors.primary" />
                      <stop offset="100%" :stop-color="strokeEndColor" />
                    </linearGradient>
                  </defs>
                  <path :d="heroAreaPath" fill="url(#hero-area-fill)" />
                  <path
                    :d="heroLinePath"
                    fill="none"
                    stroke="url(#hero-area-line)"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    vector-effect="non-scaling-stroke"
                  />
                </svg>
                <!-- Marker dot no fim da curva. Cor segue o accent da
                     variacao (positive verde se subindo, negative vermelho
                     se caindo) pra reforcar visualmente a direcao. -->
                <div
                  class="absolute size-3 rounded-full"
                  :style="{
                    right: '0px',
                    top: `${markerTopPct}%`,
                    transform: 'translate(50%, -50%)',
                    backgroundColor: variationAccent,
                    boxShadow: `0 0 0 4px color-mix(in srgb, ${variationAccent} 24%, transparent)`,
                  }"
                  aria-hidden="true"
                />
              </div>

              <!-- Footer: 3 mini chips de outros indicadores -->
              <footer
                class="relative flex items-center divide-x border-t"
                :style="{ borderColor: 'var(--border-subtle)' }"
              >
                <NuxtLink
                  v-for="chip in chips"
                  :key="chip.label"
                  :to="chip.href"
                  class="flex flex-1 flex-col items-start gap-0.5 px-4 py-3 transition-colors hover:bg-[var(--bg-overlay)]"
                  :style="{ borderColor: 'var(--border-subtle)' }"
                >
                  <span class="text-[10px] font-medium uppercase tracking-[0.1em]" :style="{ color: 'var(--text-muted)' }">
                    {{ chip.label }}
                  </span>
                  <div class="flex items-baseline gap-1.5">
                    <span class="text-[14px] font-light tabular-nums" :style="{ color: 'var(--text-heading)', letterSpacing: '-0.01em' }" translate="no">
                      {{ chip.value }}
                    </span>
                    <span class="text-[10px] font-medium tabular-nums" :style="{ color: chip.change >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)' }">
                      {{ chip.change >= 0 ? '+' : '' }}{{ chip.change.toFixed(2) }}%
                    </span>
                  </div>
                </NuxtLink>
              </footer>
            </article>

            <!-- ========== CARD: Top Ações ========== -->
            <article
              class="hero-stack__card overflow-hidden rounded-2xl border"
              :style="[stackStyle(1), { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', boxShadow: heroCardShadow }]"
              @click="activeStackIdx = 1"
            >
              <div
                class="pointer-events-none absolute inset-0"
                :style="{ background: `linear-gradient(135deg, ${brand.colors.positive}14 0%, transparent 40%, ${brand.colors.primary}10 100%)` }"
                aria-hidden="true"
              />
              <header class="relative flex items-center justify-between px-6 pt-6">
                <div class="flex items-center gap-2">
                  <span class="size-1.5 rounded-full" :style="{ backgroundColor: 'var(--brand-positive)' }" aria-hidden="true" />
                  <span class="text-[12px] font-medium" :style="{ color: 'var(--text-body)' }">Top ações</span>
                  <span aria-hidden="true" :style="{ color: 'var(--text-muted)' }">·</span>
                  <span class="text-[12px]" :style="{ color: 'var(--text-muted)' }">Hoje</span>
                </div>
                <span
                  class="rounded-md border px-2 py-0.5 text-[11px] font-medium"
                  :style="{ borderColor: 'var(--border-subtle)', color: 'var(--text-body)' }"
                >B3</span>
              </header>
              <div class="relative px-6 pt-5">
                <h3 class="font-light text-[28px] leading-tight md:text-[32px]" :style="{ color: 'var(--text-heading)', letterSpacing: '-0.025em' }">
                  Quem subiu <em class="font-['Instrument_Serif'] italic" :style="{ color: 'var(--brand-primary)' }">hoje.</em>
                </h3>
                <p class="mt-1 text-[12px]" :style="{ color: 'var(--text-muted)' }">Maiores altas do dia, em tempo real</p>
              </div>
              <ul class="relative mt-4 flex flex-col">
                <li
                  v-for="(stock, i) in topStocksMock"
                  :key="stock.ticker"
                  class="flex items-center gap-3 border-t px-6 py-3"
                  :style="{ borderColor: i === 0 ? 'var(--border-subtle)' : 'var(--border-subtle)' }"
                >
                  <span
                    class="flex size-8 items-center justify-center rounded-md text-[11px] font-mono-tab font-bold"
                    :style="{ backgroundColor: 'var(--bg-overlay)', color: 'var(--text-label)', border: '1px solid var(--border-subtle)' }"
                  >{{ stock.ticker.slice(0, 2) }}</span>
                  <div class="flex flex-1 flex-col">
                    <span class="text-[13px] font-medium leading-none" :style="{ color: 'var(--text-heading)' }" translate="no">{{ stock.ticker }}</span>
                    <span class="mt-1 text-[10px]" :style="{ color: 'var(--text-muted)' }" translate="no">{{ stock.name }}</span>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class="text-[13px] font-light tabular-nums leading-none" :style="{ color: 'var(--text-heading)' }" translate="no">{{ stock.price }}</span>
                    <span class="mt-1 text-[11px] font-medium tabular-nums" :style="{ color: 'var(--brand-positive)' }">+{{ stock.change }}%</span>
                  </div>
                </li>
              </ul>
            </article>

            <!-- ========== CARD: Assessoria IA (chat) ========== -->
            <article
              class="hero-stack__card overflow-hidden rounded-2xl border"
              :style="[stackStyle(2), { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', boxShadow: heroCardShadow }]"
              @click="activeStackIdx = 2"
            >
              <div
                class="pointer-events-none absolute inset-0"
                :style="{ background: `radial-gradient(ellipse 70% 60% at 100% 0%, ${brand.colors.primary}1F, transparent 60%), radial-gradient(ellipse 60% 50% at 0% 100%, #F96BEE12, transparent 65%)` }"
                aria-hidden="true"
              />
              <header class="relative flex items-center justify-between px-6 pt-6">
                <div class="flex items-center gap-2">
                  <span
                    class="flex size-6 items-center justify-center rounded-md"
                    :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 18%, transparent)`, color: 'var(--brand-primary)' }"
                  >
                    <UIcon name="i-lucide-sparkles" class="size-3.5" />
                  </span>
                  <span class="text-[12px] font-medium" :style="{ color: 'var(--text-body)' }">Assessoria IA</span>
                  <span aria-hidden="true" :style="{ color: 'var(--text-muted)' }">·</span>
                  <span class="text-[12px]" :style="{ color: 'var(--brand-positive)' }">Online</span>
                </div>
              </header>
              <div class="relative px-6 pt-5">
                <h3 class="font-light text-[28px] leading-tight md:text-[32px]" :style="{ color: 'var(--text-heading)', letterSpacing: '-0.025em' }">
                  Pergunte <em class="font-['Instrument_Serif'] italic" :style="{ color: 'var(--brand-primary)' }">qualquer coisa.</em>
                </h3>
              </div>
              <div class="relative flex flex-col gap-3 px-6 pt-4">
                <!-- User bubble -->
                <div class="flex justify-end">
                  <div
                    class="max-w-[78%] rounded-2xl rounded-br-sm px-3.5 py-2 text-[12px]"
                    :style="{ backgroundColor: 'var(--bg-overlay)', color: 'var(--text-heading)', border: '1px solid var(--border-subtle)' }"
                  >Quanto rende o Tesouro IPCA+ 2035?</div>
                </div>
                <!-- AI bubble -->
                <div class="flex justify-start">
                  <div
                    class="max-w-[88%] rounded-2xl rounded-bl-sm px-3.5 py-2 text-[12px] leading-relaxed"
                    :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 10%, transparent)`, color: 'var(--text-heading)', border: '1px solid color-mix(in srgb, ' + brand.colors.primary + ' 22%, transparent)' }"
                  >
                    O <strong>Tesouro IPCA+ 2035</strong> paga <span class="font-medium tabular-nums" :style="{ color: 'var(--brand-primary)' }">IPCA + 6,52% a.a.</span>, garantindo retorno acima da inflação até 2035.
                  </div>
                </div>
              </div>
              <div class="relative mt-auto flex flex-wrap gap-2 px-6 pb-6 pt-4">
                <span
                  v-for="hint in chatHints"
                  :key="hint"
                  class="rounded-full border px-2.5 py-1 text-[11px]"
                  :style="{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }"
                >{{ hint }}</span>
              </div>
            </article>

            <!-- ========== CARD: Tesouro Direto ========== -->
            <article
              class="hero-stack__card overflow-hidden rounded-2xl border"
              :style="[stackStyle(3), { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', boxShadow: heroCardShadow }]"
              @click="activeStackIdx = 3"
            >
              <div
                class="pointer-events-none absolute inset-0"
                :style="{ background: `linear-gradient(160deg, ${brand.colors.primary}14 0%, transparent 50%, transparent 100%)` }"
                aria-hidden="true"
              />
              <header class="relative flex items-center justify-between px-6 pt-6">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-landmark" class="size-3.5" :style="{ color: 'var(--brand-primary)' }" />
                  <span class="text-[12px] font-medium" :style="{ color: 'var(--text-body)' }">Tesouro Direto</span>
                  <span aria-hidden="true" :style="{ color: 'var(--text-muted)' }">·</span>
                  <span class="text-[12px]" :style="{ color: 'var(--text-muted)' }">Atualizado hoje</span>
                </div>
              </header>
              <div class="relative px-6 pt-5">
                <h3 class="font-light text-[28px] leading-tight md:text-[32px]" :style="{ color: 'var(--text-heading)', letterSpacing: '-0.025em' }">
                  Renda fixa <em class="font-['Instrument_Serif'] italic" :style="{ color: 'var(--brand-primary)' }">protegida.</em>
                </h3>
                <p class="mt-1 text-[12px]" :style="{ color: 'var(--text-muted)' }">Títulos públicos com retorno garantido</p>
              </div>
              <ul class="relative mt-4 flex flex-col">
                <li
                  v-for="bond in tesouroMock"
                  :key="bond.name"
                  class="flex items-center justify-between gap-3 border-t px-6 py-3"
                  :style="{ borderColor: 'var(--border-subtle)' }"
                >
                  <div class="flex flex-col">
                    <span class="text-[13px] font-medium leading-none" :style="{ color: 'var(--text-heading)' }" translate="no">{{ bond.name }}</span>
                    <span class="mt-1 text-[10px]" :style="{ color: 'var(--text-muted)' }">Vence em {{ bond.year }}</span>
                  </div>
                  <span class="font-light tabular-nums text-[18px]" :style="{ color: 'var(--brand-primary)', letterSpacing: '-0.02em' }">{{ bond.rate }}</span>
                </li>
              </ul>
            </article>

            <!-- ========== CARD: Carteira ========== -->
            <article
              class="hero-stack__card overflow-hidden rounded-2xl border"
              :style="[stackStyle(4), { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', boxShadow: heroCardShadow }]"
              @click="activeStackIdx = 4"
            >
              <div
                class="pointer-events-none absolute inset-0"
                :style="{ background: `radial-gradient(ellipse 80% 60% at 50% -20%, ${brand.colors.primary}1A, transparent 60%)` }"
                aria-hidden="true"
              />
              <header class="relative flex items-center justify-between px-6 pt-6">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-wallet" class="size-3.5" :style="{ color: 'var(--brand-primary)' }" />
                  <span class="text-[12px] font-medium" :style="{ color: 'var(--text-body)' }">Sua carteira</span>
                  <span aria-hidden="true" :style="{ color: 'var(--text-muted)' }">·</span>
                  <span class="text-[12px]" :style="{ color: 'var(--text-muted)' }">12 ativos</span>
                </div>
                <span
                  class="rounded-md px-2 py-0.5 text-[11px] font-medium tabular-nums"
                  :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.positive} 16%, transparent)`, color: 'var(--brand-positive)' }"
                >+8,42%</span>
              </header>
              <div class="relative px-6 pt-5">
                <span class="text-[12px]" :style="{ color: 'var(--text-muted)' }">Patrimônio total</span>
                <p class="mt-1 font-light tabular-nums text-[44px] leading-none md:text-[52px]" :style="{ color: 'var(--text-heading)', letterSpacing: '-0.03em' }" translate="no">
                  R$ 152.430
                </p>
                <p class="mt-2 text-[12px]" :style="{ color: 'var(--text-muted)' }">
                  Hoje, <span class="tabular-nums" :style="{ color: 'var(--brand-positive)' }">+R$ 1.847</span>
                </p>
              </div>
              <div class="relative mt-6 px-6">
                <div class="flex h-2 w-full overflow-hidden rounded-full" :style="{ backgroundColor: 'var(--bg-overlay)' }">
                  <div class="h-full" :style="{ width: '52%', backgroundColor: 'var(--brand-primary)' }" />
                  <div class="h-full" :style="{ width: '28%', backgroundColor: 'var(--brand-positive)' }" />
                  <div class="h-full" :style="{ width: '20%', backgroundColor: '#F96BEE' }" />
                </div>
                <div class="mt-4 flex items-center divide-x" :style="{ borderColor: 'var(--border-subtle)' }">
                  <div class="flex flex-1 flex-col gap-0.5 pr-3">
                    <span class="text-[10px] font-medium uppercase tracking-[0.1em]" :style="{ color: 'var(--text-muted)' }">Ações</span>
                    <span class="text-[14px] font-light tabular-nums" :style="{ color: 'var(--text-heading)' }">52%</span>
                  </div>
                  <div class="flex flex-1 flex-col gap-0.5 px-3" :style="{ borderColor: 'var(--border-subtle)' }">
                    <span class="text-[10px] font-medium uppercase tracking-[0.1em]" :style="{ color: 'var(--text-muted)' }">FIIs</span>
                    <span class="text-[14px] font-light tabular-nums" :style="{ color: 'var(--text-heading)' }">28%</span>
                  </div>
                  <div class="flex flex-1 flex-col gap-0.5 pl-3" :style="{ borderColor: 'var(--border-subtle)' }">
                    <span class="text-[10px] font-medium uppercase tracking-[0.1em]" :style="{ color: 'var(--text-muted)' }">RF</span>
                    <span class="text-[14px] font-light tabular-nums" :style="{ color: 'var(--text-heading)' }">20%</span>
                  </div>
                </div>
              </div>
            </article>

            <!-- Indicador da posicao do stack (dots) -->
            <div class="absolute -bottom-8 left-1/2 z-50 flex -translate-x-1/2 gap-1.5">
              <button
                v-for="(_, i) in 5"
                :key="i"
                type="button"
                class="size-1.5 rounded-full transition-all"
                :style="{
                  backgroundColor: activeStackIdx === i ? 'var(--brand-primary)' : 'var(--border-strong)',
                  width: activeStackIdx === i ? '20px' : '6px',
                }"
                :aria-label="`Ir para card ${i + 1}`"
                @click="activeStackIdx = i"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type IbovPoint = { date: string; value: number; timestamp: number }

// Props vem da pagina pai (pages/index.vue) via HomeHero. Defaults
// preservam comportamento anterior caso o componente seja usado fora
// da home (reusabilidade) ou enquanto o fetch ainda nao retornou.
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

const brand = useBrand()
const colorMode = useColorMode()
const fmt = useFormat()

const resolvedMode = computed<'light' | 'dark'>(() => {
  if (colorMode.value === 'light' || colorMode.value === 'dark') return colorMode.value
  return brand.defaultMode === 'light' ? 'light' : 'dark'
})

const eyebrow = computed(() => brand.header?.subtitle || 'Plataforma de investimentos')

// ----------------------------------------------------------------
// Mesh gradient: 3 blobs amber/rose. Light = saturado dramatico.
// Dark = mesma composicao mas opacity reduzida pra nao saturar canvas.
// ----------------------------------------------------------------
const meshAmber = computed(() =>
  `radial-gradient(circle, ${brand.colors.primary} 0%, transparent 70%)`,
)
const meshAmberSoft = computed(() =>
  `radial-gradient(circle, ${brand.colors.primary} 0%, transparent 70%)`,
)
const meshRose = computed(() =>
  `radial-gradient(circle, #F96BEE 0%, transparent 70%)`,
)
const meshOpacity = computed(() => {
  if (resolvedMode.value === 'light') {
    return { amber: 0.45, amberSoft: 0.18, rose: 0.18 }
  }
  return { amber: 0.18, amberSoft: 0.08, rose: 0.08 }
})

// Sombra do hero card: light tem amber-tinted dramatica, dark tem
// elevacao por inner border + ambient
const heroCardShadow = computed(() => {
  if (resolvedMode.value === 'light') {
    return `0 40px 60px -30px color-mix(in srgb, ${brand.colors.primary} 28%, transparent), 0 18px 36px -18px rgba(0,0,0,0.10)`
  }
  return `0 40px 80px -30px rgba(0,0,0,0.7), 0 0 0 1px color-mix(in srgb, ${brand.colors.primary} 8%, transparent)`
})

// Background do mini card secundario (depth): em dark fica mais opaco
// pra se destacar do canvas escuro.
const miniBg = computed(() =>
  resolvedMode.value === 'light'
    ? 'color-mix(in srgb, var(--bg-elevated) 92%, transparent)'
    : 'var(--bg-overlay)',
)

// ----------------------------------------------------------------
// Stack 3D state — 5 cards rotacionando automaticamente a cada 4s.
// Card 0 = topo (visivel cheio), demais com translateZ + scale + rotateX
// crescente conforme a profundidade.
// ----------------------------------------------------------------
const STACK_TOTAL = 5
const activeStackIdx = ref(0)
let stackTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  stackTimer = setInterval(() => {
    activeStackIdx.value = (activeStackIdx.value + 1) % STACK_TOTAL
  }, 4500)
})
onBeforeUnmount(() => {
  if (stackTimer) clearInterval(stackTimer)
})

// Calcula transform/opacity/zIndex para cada card baseado na sua
// posicao relativa ao topo. pos=0 e o topo, pos cresce indo pra tras.
// Usa grid-area: 1/1 — todos os cards ocupam a mesma celula, container
// se ajusta a altura do MAIOR card (cada card mantem sua altura natural).
// Rotacao 3D combina rotateX (tilt back) + rotateY (giro lateral) pro
// efeito "fan girando" durante a transicao.
function stackStyle(absoluteIdx: number) {
  const pos = (absoluteIdx - activeStackIdx.value + STACK_TOTAL) % STACK_TOTAL
  const visiblePos = Math.min(pos, 3) // limite a 4 layers visiveis (0..3); 4 fica escondido

  const translateX = visiblePos * 14   // offset lateral (fan effect)
  const translateY = visiblePos * 16
  const translateZ = -visiblePos * 80
  const scale = 1 - visiblePos * 0.045
  const rotateX = visiblePos * 2       // tilt back (eixo X)
  const rotateY = visiblePos * 5       // giro lateral (eixo Y) - ALMA do efeito 3D
  const rotateZ = visiblePos * -1.5    // leve inclinacao no plano (eixo Z)

  let opacity = 1
  if (pos === 1) opacity = 0.92
  else if (pos === 2) opacity = 0.7
  else if (pos === 3) opacity = 0.4
  else if (pos === 4) opacity = 0 // ja saiu, esperando voltar pelo backstage

  const zIndex = STACK_TOTAL - pos

  return {
    gridArea: '1 / 1',
    alignSelf: 'start',
    transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) scale(${scale}) rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`,
    opacity,
    zIndex,
    pointerEvents: pos === 0 ? 'auto' : 'none',
    transition: 'transform 850ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 700ms ease',
    transformOrigin: 'center center',
    transformStyle: 'preserve-3d',
    backfaceVisibility: 'hidden',
    cursor: 'pointer',
    willChange: 'transform, opacity',
  } as Record<string, string | number>
}

// Mock data para os cards de showcase. Sao mockados de proposito —
// a funcao do hero e mostrar QUE A PLATAFORMA TEM essas features,
// nao puxar dado real (que viraria custo de fetch sem ROI).
const topStocksMock = [
  { ticker: 'GOAU4', name: 'Metalúrgica Gerdau', price: 'R$ 9,80', change: '3,70' },
  { ticker: 'PETR4', name: 'Petrobras PN', price: 'R$ 38,42', change: '2,84' },
  { ticker: 'VALE3', name: 'Vale ON', price: 'R$ 65,20', change: '2,12' },
]

const chatHints = [
  'Como diversificar?',
  'IPCA+ vs Prefixado',
  'Vale a pena ETF?',
]

const tesouroMock = [
  { name: 'Tesouro Selic', year: '2031', rate: '11,75%' },
  { name: 'Tesouro IPCA+', year: '2035', rate: 'IPCA+6,52%' },
  { name: 'Prefixado', year: '2027', rate: '11,28%' },
]

// ----------------------------------------------------------------
// Live clock (atualiza a cada 30s no client)
// ----------------------------------------------------------------
const currentTime = ref('14:32')
function updateClock() {
  const d = new Date()
  currentTime.value = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
let clockTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 30_000)
})
onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
})

// ----------------------------------------------------------------
// Gráfico hero — usa serie REAL do IBOV vinda das props. Se a serie
// nao chegou ainda (SSR sem cache, fetch falhou, etc.), cai em mock
// trending-up estatico para manter a composicao visual.
// ----------------------------------------------------------------
const HERO_FALLBACK_POINTS = [62, 58, 65, 70, 68, 72, 75, 73, 78, 82, 80, 85, 88, 86, 92]
const heroPoints = computed<number[]>(() => {
  if (props.ibovSeries.length >= 2) {
    // Pode ser uma serie longa (300+ dias). Reduzimos para ~30 pontos
    // sem perder a forma da curva: pegamos cada N-esimo elemento.
    const series = props.ibovSeries.map(p => p.value).filter(v => Number.isFinite(v))
    const target = 30
    if (series.length <= target) return series
    const step = Math.ceil(series.length / target)
    const sampled: number[] = []
    for (let i = 0; i < series.length; i += step) sampled.push(series[i])
    if (sampled[sampled.length - 1] !== series[series.length - 1]) {
      sampled.push(series[series.length - 1])
    }
    return sampled
  }
  return HERO_FALLBACK_POINTS
})

// Stroke gradient: troca rose por negative quando o IBOV esta caindo
// para a curva refletir a direcao do dia. Usa props.ibovIndicator que
// tem o sinal '+'/'-' embutido na string formatada.
const isUp = computed(() => !props.ibovIndicator?.trim().startsWith('-'))
const variationAccent = computed(() => {
  if (props.ibovVariationColor) return props.ibovVariationColor
  return isUp.value ? 'var(--brand-positive)' : 'var(--brand-negative)'
})

// SVG <stop stop-color> nao resolve var(--brand-*) entao precisamos do hex.
// Usamos o hex direto do brand.colors quando o ibovVariationColor nao
// vem como hex puro (ex. 'var(...)') ou esta ausente.
const strokeEndColor = computed(() => {
  if (props.ibovVariationColor && props.ibovVariationColor.startsWith('#')) {
    return props.ibovVariationColor
  }
  return isUp.value ? brand.colors.positive : brand.colors.negative
})

// Display do preço gigante: usa BRL formatter com numero compacto pra
// caber no card sem quebrar (128.420 vs 128.420,55 ocupa espacos diferentes).
const ibovDisplayPrice = computed(() => {
  if (!props.ibovLastPrice) return '—'
  return fmt.number(Math.round(props.ibovLastPrice))
})

// Delta absoluto em pts: variacao INTRADAY (last - penultimate) igual a
// logica de calculateSeriesStats no pages/index.vue. Garante que sinal
// e magnitude batem com props.ibovIndicator (ex. "-0.51%" + "-962 pts").
const ibovDeltaPts = computed(() => {
  if (props.ibovSeries.length < 2) return ''
  const last = props.ibovSeries[props.ibovSeries.length - 1].value
  const prev = props.ibovSeries[props.ibovSeries.length - 2].value
  const delta = last - prev
  if (!Number.isFinite(delta)) return ''
  const sign = delta >= 0 ? '+' : ''
  return `${sign}${fmt.number(Math.round(delta))} pts`
})

const chartW = 480
const chartH = 140

const heroLinePath = computed(() => {
  const pts = heroPoints.value
  if (pts.length < 2) return ''
  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const range = max - min || 1
  const stepX = chartW / (pts.length - 1)
  const pad = 12
  return pts.map((v, i) => {
    const x = i * stepX
    const y = chartH - pad - ((v - min) / range) * (chartH - pad * 2)
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
})

// Posicao do marker dot: calculada a partir do ULTIMO ponto real do gráfico
// pra que o dot encoste exatamente no fim da linha (em vez de hardcode top).
const markerTopPct = computed(() => {
  const pts = heroPoints.value
  if (pts.length < 2) return 50
  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const range = max - min || 1
  const pad = 12
  const lastValue = pts[pts.length - 1]
  const y = chartH - pad - ((lastValue - min) / range) * (chartH - pad * 2)
  return (y / chartH) * 100
})

const heroAreaPath = computed(() => {
  const pts = heroPoints.value
  if (pts.length < 2) return ''
  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const range = max - min || 1
  const stepX = chartW / (pts.length - 1)
  const pad = 12
  const linePts = pts.map((v, i) => {
    const x = i * stepX
    const y = chartH - pad - ((v - min) / range) * (chartH - pad * 2)
    return { x, y }
  })
  const line = linePts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const last = linePts[linePts.length - 1]
  return `${line} L ${last.x.toFixed(1)} ${chartH} L 0 ${chartH} Z`
})

// ----------------------------------------------------------------
// Chips no footer do hero card: 3 indicadores compactos.
// IFIX vem das props (real); Dolar e Selic ficam como mock por enquanto
// (a pagina pai ainda nao expoe esses indices). Quando o backend tiver,
// adicionamos novas props e plugamos aqui.
// ----------------------------------------------------------------
const chips = computed(() => {
  const ifixChangeNum = parseFloat(
    (props.ifixIndicator || '+0,00%').replace(/[^0-9,\-+]/g, '').replace(',', '.'),
  ) || 0
  return [
    {
      label: 'IFIX',
      value: props.ifixLastPrice ? fmt.number(Math.round(props.ifixLastPrice)) : '—',
      change: ifixChangeNum,
      href: '/asset/ifix',
    },
    { label: 'Dólar', value: 'R$ 5,12', change: -0.38, href: '/asset/usd-brl' },
    { label: 'Selic', value: '11,75%', change: 0.0, href: '/tesouro' },
  ]
})
</script>

<style scoped>
/* Headline mista: sans Inter weight 500 + Instrument Serif italic na palavra-chave.
   Letter-spacing negativo dramatico pra dar peso editorial premium.
   Os fallbacks garantem que se a Instrument Serif nao carregar, o glyph cai
   pra Didot/Times mantendo o italic editorial. */
.quiet-hero__headline {
  font-weight: 500;
  letter-spacing: -0.04em;
}
.quiet-hero__headline-sans {
  font-family: var(--brand-font);
  font-style: normal;
  font-weight: 500;
}
.quiet-hero__headline-serif {
  font-family: 'Instrument Serif', 'Didot', 'Tiempos Headline', 'Times New Roman', serif;
  font-style: italic;
  font-weight: 400;
  /* Optical scale: serif italic precisa rodar 8-12% maior pra alinhar com o sans */
  font-size: 1.1em;
  line-height: 0.9;
  margin-right: 0.04em;
}

/* Hero card: leve micro-tilt no hover pra dar interatividade sem ser ruidoso */
.quiet-hero__main {
  transition: transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 400ms ease-out;
}
.quiet-hero__visual:hover .quiet-hero__main {
  transform: translateY(-4px);
}

/* Mini card secundario sobrepoe a parte de baixo do principal: micro-tilt
   contrario ao do principal pra criar a sensacao de "stack" */
.quiet-hero__mini {
  transform: rotate(-3deg);
  transition: transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.quiet-hero__visual:hover .quiet-hero__mini {
  transform: rotate(-2deg) translateY(2px);
}
</style>

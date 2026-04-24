<template>
  <NuxtLayout name="api-portal">
    <div
      class="wl-root relative min-h-screen overflow-hidden"
      :style="{ backgroundColor: C.background, color: C.text, fontFamily: F.body }"
    >
      <!-- ============================================================
           HEADER · sticky thin nav
           ============================================================ -->
      <header
        class="sticky top-0 z-40 border-b backdrop-blur-xl"
        :style="{ borderColor: `${C.border}80`, backgroundColor: `${C.background}D0` }"
      >
        <div class="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-6 md:px-10">
          <NuxtLink to="/whitelabel" class="flex items-center gap-3">
            <BrandLogo variant="icon" class="size-7" />
            <span class="font-mono-tab text-[12px] uppercase tracking-[0.18em]" :style="{ color: C.text }">
              REDENTIA<span :style="{ color: C.primary }">.WHITELABEL</span>
            </span>
          </NuxtLink>
          <nav class="hidden items-center gap-7 md:flex">
            <a href="#manifesto" class="text-[13px] transition-colors hover:opacity-70" :style="{ color: C.textMuted }">
              Manifesto
            </a>
            <a href="#tenants" class="text-[13px] transition-colors hover:opacity-70" :style="{ color: C.textMuted }">
              Quem já usa
            </a>
            <a href="#stack" class="text-[13px] transition-colors hover:opacity-70" :style="{ color: C.textMuted }">
              O que vem
            </a>
            <a href="#pricing" class="text-[13px] transition-colors hover:opacity-70" :style="{ color: C.textMuted }">
              Investimento
            </a>
          </nav>
          <div class="flex-1" />
          <button
            class="inline-flex items-center gap-2 rounded-full border-2 px-5 py-2 text-[12px] font-medium transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5"
            :style="{
              backgroundColor: C.primary,
              color: C.background,
              borderColor: C.primary,
              boxShadow: `0 6px 24px -8px ${C.primary}A0`,
            }"
            @click="openLeadModal()"
          >
            Falar com o time →
          </button>
        </div>
      </header>

      <!-- ============================================================
           HERO, Linear-style editorial: headline breathes, no noise
           ============================================================ -->
      <section class="relative overflow-hidden">
        <!-- Single radial glow, no dot grids, no scanlines -->
        <div class="pointer-events-none absolute inset-0">
          <div
            class="absolute left-1/2 top-0 h-[800px] w-[1200px] -translate-x-1/2 rounded-full blur-3xl opacity-20"
            :style="{ background: `radial-gradient(ellipse at center, ${C.primary}, transparent 65%)` }"
          />
        </div>

        <div class="relative mx-auto max-w-5xl px-6 pb-20 pt-24 md:px-10 md:pb-28 md:pt-32">
          <!-- Pill badge -->
          <div class="mb-10 flex justify-center lg:justify-start">
            <div class="inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5" :style="{ borderColor: `${C.primary}40`, backgroundColor: `${C.primary}08` }">
              <span class="relative flex size-1.5">
                <span class="absolute inline-flex size-1.5 motion-safe:animate-ping rounded-full opacity-75" :style="{ backgroundColor: C.primary }" />
                <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: C.primary }" />
              </span>
              <span class="text-[11px] font-medium uppercase tracking-[0.2em]" :style="{ color: C.primary }">
                5 marcas no ar
              </span>
            </div>
          </div>

          <!-- Title, huge, clean, let it breathe -->
          <h1
            class="mb-8 text-center leading-[0.88] tracking-tighter lg:text-left"
            :style="{
              color: C.text,
              fontFamily: F.display,
              fontSize: 'clamp(3.5rem, 9vw, 8.5rem)',
            }"
          >
            Sua marca,<br />
            <span class="italic" :style="{ color: C.primary }">nossa infra.</span>
          </h1>

          <!-- Subtitle, centered on mobile, left on desktop -->
          <p class="mx-auto mb-14 max-w-xl text-center text-[17px] leading-[1.6] md:text-[19px] lg:mx-0 lg:text-left" :style="{ color: `${C.text}C0` }">
            Plataforma de investimentos completa em <strong :style="{ color: C.text }">menos de 7 dias</strong>, com seu logo, suas cores, seu domínio. Sem time de engenharia.
          </p>

          <!-- CTAs -->
          <div class="mb-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
            <button
              class="group inline-flex items-center gap-3 rounded-full px-8 py-4 text-[14px] font-semibold transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5"
              :style="{
                backgroundColor: C.primary,
                color: C.background,
                boxShadow: `0 16px 50px -16px ${C.primary}A0`,
              }"
              @click="openLeadModal()"
            >
              Quero meu white-label
              <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
            </button>
            <a
              href="#tenants"
              class="inline-flex items-center gap-2 px-2 py-2 text-[14px] font-medium transition-opacity hover:opacity-70"
              :style="{ color: C.text }"
            >
              <span class="border-b pb-0.5" :style="{ borderColor: C.text }">Ver quem já usa</span>
              <span>↓</span>
            </a>
          </div>

          <!-- Tenant logo strip, clean, Vercel "trusted by" style -->
          <div class="border-t pt-10" :style="{ borderColor: `${C.border}60` }">
            <p class="mb-6 text-center text-[11px] uppercase tracking-[0.22em] lg:text-left" :style="{ color: C.textMuted }">
              Mesma infra, 5 identidades radicalmente distintas
            </p>
            <div class="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 lg:justify-start">
              <span
                v-for="t in tenants.filter(t => t.slug !== 'your-brand')"
                :key="t.slug"
                class="text-[20px] leading-none tracking-tight transition-opacity hover:opacity-100 md:text-[24px]"
                style="opacity: 0.5;"
                :style="{
                  color: t.accent,
                  fontFamily: t.font,
                  fontWeight: t.weight,
                  fontStyle: t.italic ? 'italic' : 'normal',
                }"
              >
                {{ t.name }}
              </span>
            </div>
          </div>

          <!-- Stats row, with Lucide icons, not emojis -->
          <div class="mt-14 grid grid-cols-3 gap-8">
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-layers" class="mt-0.5 size-5 shrink-0" :style="{ color: C.primary }" />
              <div>
                <div class="text-[14px] font-semibold" :style="{ color: C.text }">Stack completa</div>
                <div class="text-[12px]" :style="{ color: C.textMuted }">Frontend + backend + dados B3</div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-zap" class="mt-0.5 size-5 shrink-0" :style="{ color: C.primary }" />
              <div>
                <div class="text-[14px] font-semibold" :style="{ color: C.text }">Deploy em 7 dias</div>
                <div class="text-[12px]" :style="{ color: C.textMuted }">Da call ao ar em uma semana</div>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-palette" class="mt-0.5 size-5 shrink-0" :style="{ color: C.primary }" />
              <div>
                <div class="text-[14px] font-semibold" :style="{ color: C.text }">100% custom</div>
                <div class="text-[12px]" :style="{ color: C.textMuted }">Cores, fontes, hero, domínio</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           MANIFESTO STRIP, editorial pull quote
           ============================================================ -->
      <section
        id="manifesto"
        class="relative border-b"
        :style="{ borderColor: `${C.border}`, backgroundColor: C.surfaceLight }"
      >
        <div class="mx-auto max-w-5xl px-6 py-24 text-center md:px-10 md:py-32">
          <div class="text-[60px] leading-none" :style="{ color: C.primary, fontFamily: F.display }">"</div>
          <p
            class="-mt-6 italic"
            :style="{
              color: C.text,
              fontFamily: F.display,
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              lineHeight: '1.2',
            }"
          >
            Construir uma plataforma de investimentos do zero é caro, lento e arriscado.<br />
            <span :style="{ color: C.primary }">Nós já fizemos isso.</span> Agora é só vestir a sua marca.
          </p>
          <div class="mx-auto mt-10 inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.2em]" :style="{ color: C.textMuted }">
            <span class="h-px w-12" :style="{ backgroundColor: C.border }" />
            <span>O time da Redentia</span>
            <span class="h-px w-12" :style="{ backgroundColor: C.border }" />
          </div>
        </div>
      </section>

      <!-- ============================================================
           TENANTS GALLERY, visual showcase, full-width tiles
           ============================================================ -->
      <section
        id="tenants"
        class="relative border-b"
        :style="{ borderColor: `${C.border}` }"
      >
        <div class="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <div class="mb-16 grid items-end gap-8 md:grid-cols-12">
            <div class="md:col-span-7">
              <div class="text-[12px] uppercase tracking-[0.22em]" :style="{ color: C.primary }">, Casos no ar</div>
              <h2
                class="mt-4 leading-[0.95] tracking-tight"
                :style="{
                  color: C.text,
                  fontFamily: F.display,
                  fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                }"
              >
                Cinco marcas.<br />
                <span class="italic" :style="{ color: C.primary }">Uma infraestrutura.</span>
              </h2>
            </div>
            <p class="text-[15px] leading-relaxed md:col-span-5" :style="{ color: `${C.text}B0` }">
              Cada tenant tem identidade visual radicalmente distinta, Bloomberg, carta editorial, masterclass, paper acadêmico, programa de TV. Mesmo backend, mesmos dados, mesmas calculadoras. <strong :style="{ color: C.text }">A diferença é só a casca.</strong>
            </p>
          </div>

          <!-- Bento grid with live iframe previews -->
          <div class="grid grid-cols-1 gap-5 md:grid-cols-6 md:gap-6">
            <a
              v-for="(tenant, idx) in tenants"
              :key="tenant.slug"
              :href="tenant.url"
              :target="tenant.url.startsWith('http') ? '_blank' : undefined"
              :rel="tenant.url.startsWith('http') ? 'noopener' : undefined"
              class="tenant-tile group relative block overflow-hidden rounded-2xl border transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-1"
              :class="bentoSpan(idx)"
              :style="{
                borderColor: `${C.border}`,
                backgroundColor: tenant.bg,
                color: tenant.fg,
                boxShadow: `0 20px 60px -30px rgba(0,0,0,0.7)`,
                minHeight: bentoMinHeight(idx),
              }"
            >
              <!-- Live iframe preview (client-only to avoid SSR issues) -->
              <ClientOnly>
                <div
                  v-if="tenant.iframeSrc"
                  class="absolute inset-0 overflow-hidden"
                >
                  <iframe
                    :src="tenant.iframeSrc"
                    class="iframe-preview pointer-events-none absolute left-0 top-0 origin-top-left border-0"
                    :style="{
                      width: '1440px',
                      height: '900px',
                      transform: `scale(${bentoIframeScale(idx)})`,
                    }"
                    loading="lazy"
                    tabindex="-1"
                    aria-hidden="true"
                  />
                  <!-- Gradient overlay, fade to bg at bottom + darken for readability -->
                  <div
                    class="absolute inset-0"
                    :style="{
                      background: `linear-gradient(180deg, ${tenant.bg}20 0%, ${tenant.bg}40 40%, ${tenant.bg}D0 80%, ${tenant.bg} 100%)`,
                    }"
                  />
                </div>
                <template #fallback>
                  <!-- SSR fallback: accent gradient like before -->
                  <div
                    class="pointer-events-none absolute inset-0 opacity-50"
                    :style="{ background: `radial-gradient(circle at 70% 20%, ${tenant.accent}30, transparent 60%)` }"
                  />
                </template>
              </ClientOnly>

              <!-- Fallback for "your-brand" (no iframe) -->
              <div
                v-if="!tenant.iframeSrc"
                class="pointer-events-none absolute inset-0"
                :style="{ background: `radial-gradient(circle at 50% 30%, ${tenant.accent}15, transparent 60%)` }"
              />

              <!-- Content overlay -->
              <div class="relative z-10 flex h-full flex-col justify-between p-7 md:p-9">
                <!-- Top label row -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em]" :style="{ color: tenant.accent }">
                    <span class="size-1.5 rounded-full" :style="{ backgroundColor: tenant.accent }" />
                    {{ tenant.variant }}
                  </div>
                  <span
                    v-if="tenant.slug !== 'your-brand'"
                    class="rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.15em] backdrop-blur-sm"
                    :style="{ borderColor: `${tenant.fg}40`, color: `${tenant.fg}B0`, backgroundColor: `${tenant.bg}80` }"
                  >
                    Live
                  </span>
                </div>

                <!-- Spacer, pushes footer to bottom -->
                <div class="flex-1" />

                <!-- Footer -->
                <div class="flex items-end justify-between gap-4 border-t pt-4" :style="{ borderColor: `${tenant.fg}20` }">
                  <div>
                    <div
                      class="text-[18px] font-bold leading-tight tracking-tight md:text-[22px]"
                      :style="{
                        color: tenant.fg,
                        fontFamily: tenant.font,
                        fontStyle: tenant.italic ? 'italic' : 'normal',
                        fontWeight: tenant.weight,
                      }"
                    >
                      {{ tenant.name }}
                    </div>
                    <div class="mt-1 text-[11px] tabular-nums" :style="{ color: `${tenant.fg}80` }">
                      {{ tenant.domain }}
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] backdrop-blur-sm transition-[transform,opacity,box-shadow,background-color,border-color,filter] group-hover:translate-x-1" :style="{ color: tenant.accent, borderColor: `${tenant.accent}40`, backgroundColor: `${tenant.bg}80` }">
                    {{ tenant.slug === 'your-brand' ? 'Reservar' : 'Visitar' }} →
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      <!-- ============================================================
           STACK INCLUDED, features in colored cards
           ============================================================ -->
      <section
        id="stack"
        class="relative border-b"
        :style="{ borderColor: `${C.border}`, backgroundColor: C.surfaceLight }"
      >
        <div class="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <div class="mb-16">
            <div class="text-[12px] uppercase tracking-[0.22em]" :style="{ color: C.primary }">, O que vem no pacote</div>
            <h2
              class="mt-4 max-w-3xl leading-[0.95] tracking-tight"
              :style="{
                color: C.text,
                fontFamily: F.display,
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              }"
            >
              Tudo o que a Redentia tem.<br />
              <span class="italic" :style="{ color: C.primary }">Vestido com a sua marca.</span>
            </h2>
          </div>

          <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="(feat, idx) in features"
              :key="feat.title"
              class="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-7 transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-1"
              :style="{
                borderColor: `${C.border}`,
                backgroundColor: idx % 4 === 0 ? `${C.primary}08` : C.background,
              }"
            >
              <div
                class="flex size-12 items-center justify-center rounded-xl"
                :style="{ backgroundColor: `${C.primary}20`, color: C.primary }"
              >
                <UIcon :name="feat.icon" class="size-6" />
              </div>
              <h3 class="text-[18px] font-bold leading-tight tracking-tight" :style="{ color: C.text }">
                {{ feat.title }}
              </h3>
              <p class="text-[13px] leading-relaxed" :style="{ color: C.textMuted }">
                {{ feat.description }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           HOW IT WORKS, 3 step horizontal timeline
           ============================================================ -->
      <section class="relative border-b" :style="{ borderColor: `${C.border}` }">
        <div class="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <div class="mb-16 grid items-end gap-8 md:grid-cols-12">
            <div class="md:col-span-8">
              <div class="text-[12px] uppercase tracking-[0.22em]" :style="{ color: C.primary }">, Como funciona</div>
              <h2
                class="mt-4 leading-[0.95] tracking-tight"
                :style="{
                  color: C.text,
                  fontFamily: F.display,
                  fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                }"
              >
                Da call ao ar em<br />
                <span class="italic" :style="{ color: C.primary }">uma semana.</span>
              </h2>
            </div>
            <p class="text-[15px] md:col-span-4" :style="{ color: `${C.text}B0` }">
              Sem milestones de 6 meses. Sem reunião de descoberta de 3 semanas. A gente prefere mostrar do que falar.
            </p>
          </div>

          <div class="relative grid gap-8 md:grid-cols-3 md:gap-12">
            <!-- Connector line desktop -->
            <div class="absolute left-0 right-0 top-8 hidden h-px md:block" :style="{ background: `linear-gradient(90deg, transparent, ${C.primary}50, transparent)` }" />

            <div
              v-for="(step, idx) in steps"
              :key="idx"
              class="relative flex flex-col gap-5"
            >
              <!-- Step number circle -->
              <div
                class="relative z-10 flex size-16 items-center justify-center rounded-full border-2 text-[24px] font-bold tabular-nums"
                :style="{
                  borderColor: C.primary,
                  backgroundColor: C.background,
                  color: C.primary,
                  fontFamily: F.display,
                }"
              >
                {{ idx + 1 }}
              </div>

              <div class="text-[11px] font-medium uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                {{ step.duration }}
              </div>
              <h3 class="text-[24px] font-bold leading-tight tracking-tight" :style="{ color: C.text }">
                {{ step.title }}
              </h3>
              <p class="text-[14px] leading-relaxed" :style="{ color: C.textMuted }">
                {{ step.description }}
              </p>
              <div class="flex flex-wrap gap-2 pt-2">
                <span
                  v-for="d in step.deliverables"
                  :key="d"
                  class="rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]"
                  :style="{ borderColor: `${C.border}`, color: C.textMuted }"
                >
                  {{ d }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           PERSONAS, who it's for, big editorial cards
           ============================================================ -->
      <section class="relative border-b" :style="{ borderColor: `${C.border}`, backgroundColor: C.surfaceLight }">
        <div class="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <div class="mb-16 max-w-3xl">
            <div class="text-[12px] uppercase tracking-[0.22em]" :style="{ color: C.primary }">, Pra quem é</div>
            <h2
              class="mt-4 leading-[0.95] tracking-tight"
              :style="{
                color: C.text,
                fontFamily: F.display,
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              }"
            >
              Se você fala com<br />
              <span class="italic" :style="{ color: C.primary }">investidores</span>, é pra você.
            </h2>
          </div>

          <div class="grid gap-6 md:grid-cols-3">
            <div
              v-for="(persona, idx) in personas"
              :key="persona.name"
              class="relative flex flex-col gap-5 overflow-hidden rounded-3xl border p-8 md:p-10"
              :style="{
                borderColor: `${C.border}`,
                backgroundColor: C.background,
              }"
            >
              <div
                class="absolute right-0 top-0 size-32 rounded-full opacity-30 blur-3xl"
                :style="{ background: C.primary }"
              />
              <div class="relative z-10">
                <div class="mb-5 inline-flex size-14 items-center justify-center rounded-2xl" :style="{ backgroundColor: `${C.primary}20`, color: C.primary }">
                  <UIcon :name="persona.icon" class="size-7" />
                </div>
                <h3 class="text-[24px] font-bold tracking-tight" :style="{ color: C.text }">
                  {{ persona.name }}
                </h3>
                <p class="mt-3 text-[14px] leading-relaxed" :style="{ color: `${C.text}B0` }">
                  {{ persona.pitch }}
                </p>
                <ul class="mt-6 flex flex-col gap-2.5">
                  <li
                    v-for="bullet in persona.bullets"
                    :key="bullet"
                    class="flex items-start gap-2 text-[13px]"
                    :style="{ color: C.text }"
                  >
                    <UIcon name="i-lucide-check-circle-2" class="mt-0.5 size-4 shrink-0" :style="{ color: C.primary }" />
                    <span>{{ bullet }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           PRICING, Stripe-style unified container
           ============================================================ -->
      <section
        id="pricing"
        class="relative"
      >
        <div class="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-16 max-w-2xl">
            <h2
              class="leading-[0.95] tracking-tight"
              :style="{
                color: C.text,
                fontFamily: F.display,
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              }"
            >
              Sem letrinha miúda.
            </h2>
            <p class="mt-6 text-[16px] leading-relaxed" :style="{ color: C.textMuted }">
              Deploy + setup + suporte + atualizações inclusos. Assina mensal, cancela quando quiser.
            </p>
          </div>

          <!-- Unified container with shared borders -->
          <div
            class="grid overflow-hidden rounded-xl border md:grid-cols-3"
            :style="{ borderColor: C.border }"
          >
            <div
              v-for="plan in plans"
              :key="plan.slug"
              class="relative flex flex-col gap-6 border-b p-8 md:border-b-0 md:border-r md:p-10 last:border-b-0 last:border-r-0"
              :style="{
                borderColor: C.border,
                backgroundColor: plan.popular ? `${C.primary}06` : 'transparent',
              }"
            >
              <!-- Popular accent, top border only -->
              <div
                v-if="plan.popular"
                class="absolute inset-x-0 top-0 h-0.5"
                :style="{ backgroundColor: C.primary }"
              />

              <div class="flex items-center gap-3">
                <h3 class="text-[15px] font-semibold" :style="{ color: C.text }">
                  {{ plan.name }}
                </h3>
                <span
                  v-if="plan.popular"
                  class="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  :style="{ backgroundColor: `${C.primary}20`, color: C.primary }"
                >
                  Popular
                </span>
              </div>

              <p class="text-[13px] leading-relaxed" :style="{ color: C.textMuted }">
                {{ plan.description }}
              </p>

              <!-- Price, gigantic numbers, tiny unit -->
              <div class="flex items-baseline gap-1">
                <span
                  class="tabular-nums leading-none tracking-tight"
                  :style="{
                    color: C.text,
                    fontFamily: F.display,
                    fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                  }"
                >
                  {{ plan.price }}
                </span>
                <span class="text-[12px]" :style="{ color: C.textMuted }">
                  /{{ plan.priceUnit }}
                </span>
              </div>
              <p v-if="plan.priceNote" class="text-[12px]" :style="{ color: C.textMuted }">
                {{ plan.priceNote }}
              </p>

              <!-- Features, clean list, no card wrapping -->
              <ul class="flex flex-col gap-2.5 border-t pt-6 text-[13px]" :style="{ borderColor: `${C.border}80` }">
                <li v-for="feat in plan.features" :key="feat" class="flex items-start gap-2" :style="{ color: `${C.text}D0` }">
                  <span :style="{ color: C.primary }">-</span>
                  <span>{{ feat }}</span>
                </li>
              </ul>

              <button
                class="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-[13px] font-semibold transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:opacity-90"
                :style="{
                  backgroundColor: plan.popular ? C.primary : 'transparent',
                  color: plan.popular ? C.background : C.text,
                  border: plan.popular ? 'none' : `1px solid ${C.border}`,
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
           FAQ, clean dividers, no cards
           ============================================================ -->
      <section class="relative">
        <div class="mx-auto max-w-4xl px-6 py-20 md:px-10 md:py-28">
          <h2
            class="mb-14 leading-[0.95] tracking-tight"
            :style="{
              color: C.text,
              fontFamily: F.display,
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
            }"
          >
            Perguntas frequentes.
          </h2>

          <div>
            <details
              v-for="(faq, idx) in faqs"
              :key="faq.q"
              class="group border-b py-6"
              :style="{ borderColor: `${C.border}60` }"
            >
              <summary class="flex cursor-pointer items-center justify-between gap-6 text-[16px] font-medium md:text-[17px]" :style="{ color: C.text }">
                {{ faq.q }}
                <UIcon
                  name="i-lucide-chevron-down"
                  class="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
                  :style="{ color: C.textMuted }"
                />
              </summary>
              <p class="mt-4 max-w-3xl text-[14px] leading-relaxed md:text-[15px]" :style="{ color: C.textMuted }">
                {{ faq.a }}
              </p>
            </details>
          </div>
        </div>
      </section>

      <!-- ============================================================
           FINAL CTA, full bleed editorial
           ============================================================ -->
      <section
        id="cta"
        class="relative overflow-hidden"
        :style="{ backgroundColor: C.background }"
      >
        <div class="pointer-events-none absolute inset-0">
          <div
            class="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-25"
            :style="{ background: `radial-gradient(circle, ${C.primary}, transparent 60%)` }"
          />
        </div>

        <div class="relative mx-auto max-w-4xl px-6 py-28 text-center md:px-10 md:py-36">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em]" :style="{ borderColor: `${C.primary}50`, backgroundColor: `${C.primary}10`, color: C.primary }">
            <span class="size-1.5 motion-safe:animate-pulse rounded-full" :style="{ backgroundColor: C.primary }" />
            Vagas pra abril · 2 slots
          </div>
          <h2
            class="leading-[0.92] tracking-tight"
            :style="{
              color: C.text,
              fontFamily: F.display,
              fontSize: 'clamp(2.75rem, 7vw, 6rem)',
            }"
          >
            Sua plataforma<br />
            <span class="italic" :style="{ color: C.primary }">existe daqui a 7 dias.</span>
          </h2>
          <p class="mx-auto mt-8 max-w-xl text-[16px]" :style="{ color: `${C.text}B0` }">
            Fale direto com o time. Primeira call em 24h, protótipo navegável em 72h, produção em 1 semana. Sem proposta de 40 páginas.
          </p>
          <div class="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <button
              class="group inline-flex items-center gap-3 rounded-full px-10 py-5 text-[15px] font-semibold transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5"
              :style="{
                backgroundColor: C.primary,
                color: C.background,
                boxShadow: `0 20px 60px -15px ${C.primary}90`,
              }"
              @click="openLeadModal()"
            >
              Quero meu white-label
              <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
            </button>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-2 px-2 py-2 text-[14px] font-medium transition-opacity hover:opacity-70"
              :style="{ color: C.text }"
            >
              <UIcon name="i-lucide-message-circle" class="size-4" />
              <span class="border-b pb-0.5" :style="{ borderColor: C.text }">WhatsApp</span>
            </a>
          </div>

          <p class="mt-16 text-[12px] tracking-wider" :style="{ color: C.textMuted }">
            whitelabel@redentia.com.br · redentia.com.br/whitelabel
          </p>
        </div>
      </section>
    </div>

    <!-- Lead capture modal -->
    <MoleculesLeadCaptureModal
      v-model:open="leadModalOpen"
      source="whitelabel"
      :plan="leadModalPlan"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
// ============================================================
// Lead capture modal state
// ============================================================
const leadModalOpen = ref(false)
const leadModalPlan = ref<string | undefined>(undefined)

function openLeadModal(plan?: string) {
  leadModalPlan.value = plan
  leadModalOpen.value = true
}

// ============================================================
// Redentia Whitelabel, landing page
//
// Hardcoded to the Redentia terminal identity (amber + charcoal)
// because this page is a self-contained sales funnel meant to
// convert visitors INTO tenants. It never inherits a tenant's
// colors the way the rest of the platform does.
// ============================================================

const C = {
  primary: '#F5A623',
  positive: '#00D395',
  background: '#0A0B0E',
  surface: '#14161C',
  surfaceLight: '#0F1116',
  border: '#2A2E39',
  text: '#E8EAED',
  textMuted: '#8B92A7',
  accent2: '#6366F1',
}

const F = {
  body: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  display: "'Instrument Serif', 'Times New Roman', serif",
  mono: "'JetBrains Mono', monospace",
}

// ============================================================
// Bento grid sizing helpers, used by tenant gallery to break
// out of the boring 3-col grid into an editorial collage.
// Order: redentia (large), norte (small), primo (small),
// sardinha (large), me-poupe (small), your-brand (small).
// ============================================================
function bentoSpan(idx: number) {
  // 6-col grid; 0=large(4), 1=small(2), 2=small(2), 3=large(4), 4=small(2), 5=small(2)
  const map: Record<number, string> = {
    0: 'md:col-span-4',
    1: 'md:col-span-2',
    2: 'md:col-span-3',
    3: 'md:col-span-3',
    4: 'md:col-span-2',
    5: 'md:col-span-4',
  }
  return map[idx] || 'md:col-span-2'
}

function bentoMinHeight(idx: number) {
  return idx === 0 || idx === 5 ? '420px' : '380px'
}

function bentoTitleSize(idx: number) {
  if (idx === 0 || idx === 5) return 'clamp(2.5rem, 4.5vw, 3.75rem)'
  return 'clamp(1.75rem, 3vw, 2.5rem)'
}

function bentoIframeScale(idx: number) {
  // Scale 1440px iframe to fit card width
  // Large cards (col-span-4) ≈ ~620px → scale 0.43
  // Medium cards (col-span-3) ≈ ~465px → scale 0.32
  // Small cards (col-span-2) ≈ ~310px → scale 0.22
  const map: Record<number, number> = {
    0: 0.43, // col-span-4
    1: 0.22, // col-span-2
    2: 0.32, // col-span-3
    3: 0.32, // col-span-3
    4: 0.22, // col-span-2
    5: 0.43, // col-span-4
  }
  return map[idx] ?? 0.32
}

// ============================================================
// Tenants gallery, 5 live brands on Redentia infrastructure.
// Each preview card mimics the tenant's signature visual voice:
// its primary color, its font family, its hero tagline.
// ============================================================
const tenants = [
  {
    slug: 'redentia',
    name: 'Redentia',
    domain: 'redentia.com.br',
    variant: 'TERMINAL',
    eyebrow: 'BLOOMBERG REIMAGINED',
    previewTitle: 'Investir com inteligência.',
    description: 'O tenant-mãe. Bloomberg terminal reimaginado, amber, monospace, dados por primeiro.',
    url: 'https://redentia.com.br',
    iframeSrc: 'https://www.redentia.com.br/',
    bg: '#0A0B0E',
    fg: '#E8EAED',
    accent: '#F5A623',
    font: "'Instrument Serif', serif",
    italic: false,
    weight: 400,
  },
  {
    slug: 'norte-capital',
    name: 'Norte Capital',
    domain: 'norte-capital.com.br',
    variant: 'EDITORIAL',
    eyebrow: 'PRIVATE BANK LETTER',
    previewTitle: 'Estimado investidor.',
    description: 'Assessoria fictícia em formato carta editorial de private bank. Fraunces italic, papel ivory, serif voice.',
    url: 'https://redentia.com.br/?brand=norte-capital',
    iframeSrc: 'https://www.redentia.com.br/asset/petr4?brand=norte-capital',
    bg: '#F7F5EF',
    fg: '#1C2133',
    accent: '#8B6F3D',
    font: "'Fraunces', serif",
    italic: true,
    weight: 400,
  },
  {
    slug: 'primo-rico',
    name: 'Primo Rico',
    domain: 'primorico.com.br',
    variant: 'MENTOR',
    eyebrow: 'MASTERCLASS',
    previewTitle: 'Liberdade ou mediocridade.',
    description: 'Thiago Nigro em formato manual do autor. Fraunces display, tape orange, quote do fundador.',
    url: 'https://redentia.com.br/?brand=primo-rico',
    iframeSrc: 'https://www.redentia.com.br/?brand=primo-rico',
    bg: '#0F0D0B',
    fg: '#F4EDE4',
    accent: '#FF6B35',
    font: "'Fraunces', serif",
    italic: false,
    weight: 700,
  },
  {
    slug: 'investidor-sardinha',
    name: 'Investidor Sardinha',
    domain: 'auvp.com.br',
    variant: 'RESEARCH',
    eyebrow: 'AUVP PAPER',
    previewTitle: 'A única verdade possível.',
    description: 'Raul Sena / AUVP em formato paper acadêmico. IBM Plex serif, § marcadores, red-pen notes.',
    url: 'https://redentia.com.br/?brand=investidor-sardinha',
    iframeSrc: 'https://www.redentia.com.br/asset/vale3?brand=investidor-sardinha',
    bg: '#F6F1E8',
    fg: '#1F1A12',
    accent: '#C84B31',
    font: "'IBM Plex Serif', serif",
    italic: true,
    weight: 400,
  },
  {
    slug: 'me-poupe',
    name: 'Me Poupe!',
    domain: 'mepoupe.com',
    variant: 'SHOWTIME',
    eyebrow: 'PROGRAMA DE TV',
    previewTitle: 'Chega de dinheirofobia.',
    description: 'Nathalia Arcuri em formato programa de TV pop. Poppins 900, amarelo sticker, Margarete mascote.',
    url: 'https://redentia.com.br/?brand=me-poupe',
    iframeSrc: 'https://www.redentia.com.br/?brand=me-poupe',
    bg: '#1A0A2E',
    fg: '#FFFFFF',
    accent: '#FACC15',
    font: "'Poppins', sans-serif",
    italic: false,
    weight: 900,
  },
  {
    slug: 'your-brand',
    name: 'Sua marca aqui',
    domain: 'sua-marca.com.br',
    variant: 'CUSTOM',
    eyebrow: 'SEU VISUAL · 100%',
    previewTitle: 'O próximo slot é seu.',
    description: 'Deploy em 1 semana. Identidade visual 100% custom, domínio próprio, zero mention de "Redentia".',
    url: '#cta',
    iframeSrc: '',
    bg: '#14161C',
    fg: '#E8EAED',
    accent: '#F5A623',
    font: "'Instrument Serif', serif",
    italic: true,
    weight: 400,
  },
]

// ============================================================
// HOW IT WORKS, 3 steps
// ============================================================
const steps = [
  {
    title: 'Briefing visual',
    duration: 'DIA 1',
    description: 'Call de 60 minutos pra entender seu público, sua voz, seu visual. Mostramos os 5 tenants no ar e você escolhe direções de referência.',
    deliverables: ['CALL 60min', 'BENCHMARKS', 'BRIEFING'],
  },
  {
    title: 'Protótipo clicável',
    duration: 'DIAS 2–3',
    description: 'Desenhamos o hero, a home, a asset page e o auth com o seu visual. Você navega num ambiente real, não num Figma estático.',
    deliverables: ['FIGMA', 'PREVIEW URL', '3 VARIANTS'],
  },
  {
    title: 'Deploy em produção',
    duration: 'DIAS 4–7',
    description: 'Seu domínio conectado, certificado TLS, brand config no banco, CDN configurada. A gente aperta o botão e o ar é seu.',
    deliverables: ['DOMÍNIO', 'TLS', 'CDN', 'ANALYTICS'],
  },
]

// ============================================================
// FEATURES INCLUDED
// ============================================================
const features = [
  {
    icon: 'i-lucide-palette',
    title: 'Identidade visual 100% sua',
    description: 'Cores, fontes, hero variant, layout das páginas, copys, tudo controlado pelo seu brand config. Zero "powered by Redentia".',
  },
  {
    icon: 'i-lucide-database',
    title: 'Dados da B3 em tempo real',
    description: 'Preços, fundamentos (BP/DRE/DFC/DVA), dividendos, setores comparativos. Direto da fonte, sem você precisar se preocupar.',
  },
  {
    icon: 'i-lucide-wallet',
    title: 'Consolidador de carteira',
    description: 'Import via Excel ou Open Finance, rentabilidade ponderada, análise por classe de ativo, alertas de rebalance.',
  },
  {
    icon: 'i-lucide-sparkles',
    title: 'IA treinada em renda variável',
    description: 'Chat próprio com conhecimento do mercado brasileiro. Responde em segundos, cita fontes, sabe a teoria e a prática.',
  },
  {
    icon: 'i-lucide-calculator',
    title: '8 calculadoras prontas',
    description: 'Juros compostos, preço teto (Graham/Bazin), aposentadoria, dividend yield, planejamento, quanto investir por mês.',
  },
  {
    icon: 'i-lucide-image',
    title: 'Redentia Creative incluso',
    description: 'Templates de conteúdo pra redes sociais com seus dados. Growth races, rankings, spotlights, tudo pra tirar print e postar.',
  },
  {
    icon: 'i-lucide-bell',
    title: 'Notificações push',
    description: 'PWA instalável, push notifications via Firebase, alertas de dividendos, preços-alvo e movimentos notáveis.',
  },
  {
    icon: 'i-lucide-users',
    title: 'Multi-usuário com roles',
    description: 'Investidor, assessor, admin. Assessores podem gerenciar carteiras de clientes; admins vêem tudo. Controle de acesso incluso.',
  },
]

// ============================================================
// PERSONAS, who it's for
// ============================================================
const personas = [
  {
    icon: 'i-lucide-megaphone',
    name: 'Influenciadores',
    pitch: 'Você tem audiência em renda variável e quer monetizar além de AdSense e cursos. Lance seu próprio app sem ter CTO.',
    bullets: [
      'Converter seguidor em usuário recorrente',
      'Distribuir conteúdo exclusivo dentro do app',
      'Revenue share ou assinatura recorrente',
    ],
  },
  {
    icon: 'i-lucide-briefcase',
    name: 'Assessorias',
    pitch: 'Você é uma assessoria e precisa de uma plataforma pros clientes que NÃO seja a do banco. Portal white-label com a sua marca.',
    bullets: [
      'Sua marca no portal do cliente',
      'Consolidação via Open Finance',
      'Controle de acesso por assessor',
    ],
  },
  {
    icon: 'i-lucide-zap',
    name: 'Fintechs',
    pitch: 'Você está validando um produto no espaço de investimentos e precisa de MVP em semanas. Branca a plataforma, testa a tese, depois custom.',
    bullets: [
      'MVP em 1 semana, não em 6 meses',
      'Infra pronta pra escalar',
      'Time-to-market absurdamente curto',
    ],
  },
]

// ============================================================
// PRICING
// ============================================================
const plans = [
  {
    slug: 'starter',
    name: 'Starter',
    description: 'Pra influenciadores validando a tese.',
    price: 'R$ 2.500',
    priceUnit: 'mês',
    priceNote: 'Setup único: R$ 5.000',
    features: [
      'Até 500 usuários ativos',
      'Domínio customizado + TLS',
      '1 variant visual completo',
      'Dados da B3 em tempo real',
      'Consolidador de carteira',
      'Suporte por email',
    ],
    cta: 'Começar',
    popular: false,
  },
  {
    slug: 'growth',
    name: 'Growth',
    description: 'Pra quem já tem audiência e quer escalar.',
    price: 'R$ 6.800',
    priceUnit: 'mês',
    priceNote: 'Setup único: R$ 8.000',
    features: [
      'Até 10.000 usuários ativos',
      'Tudo do Starter, mais:',
      'Variants visuais ilimitados',
      'Redentia Creative incluso',
      '8 calculadoras + IA',
      'Notificações push',
      'Analytics dashboard',
      'Suporte prioritário',
    ],
    cta: 'Escolher Growth',
    popular: true,
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    description: 'Pra fintechs e assessorias grandes.',
    price: 'Custom',
    priceUnit: 'tier',
    priceNote: 'Contrato anual · negociado',
    features: [
      'Usuários ilimitados',
      'Tudo do Growth, mais:',
      'API REST dedicada',
      'SLA 99.9% com multa',
      'Deploy em cloud própria',
      'Suporte 24/7 via Slack',
      'Feature requests priorizadas',
    ],
    cta: 'Falar com sales',
    popular: false,
  },
]

// ============================================================
// FAQ, short objection handling
// ============================================================
const faqs = [
  {
    q: 'Eu sou dono dos dados dos meus usuários?',
    a: 'Sim, 100%. O banco é segregado por tenant, e qualquer dado coletado pertence à sua marca. Você pode exportar a base completa quando quiser, sem multa, sem ressentimento.',
  },
  {
    q: 'Posso trocar de visual depois do deploy?',
    a: 'Pode. O brand config fica no banco e atualiza ao vivo. Mudanças leves (cor, fonte) são instantâneas; mudanças estruturais (variant da hero) entram no próximo deploy.',
  },
  {
    q: 'O que acontece se eu cancelar?',
    a: 'Você tem 30 dias pra exportar tudo (banco de dados, brand config, ativos do design). Depois disso, o tenant é desativado mas a base fica arquivada por 90 dias caso você mude de ideia.',
  },
  {
    q: 'Vocês têm limites de chamadas à API?',
    a: 'O plano Starter cobre até 100k chamadas/dia, Growth 1M/dia, Enterprise sem limite. Cache inteligente reduz chamadas em 80%, na prática quase ninguém estoura.',
  },
  {
    q: 'Posso usar minha cloud (AWS, GCP, etc)?',
    a: 'No Enterprise, sim. Subimos a stack inteira na sua conta e cobramos só a licença. Você fica responsável pela infra; nós fornecemos updates e suporte.',
  },
  {
    q: 'A Redentia aparece em algum lugar do meu app?',
    a: 'Em lugar nenhum. Nem favicon, nem footer, nem meta tag. O nome só existe no contrato e na NF que entra na sua contabilidade.',
  },
]

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: 'Plataforma White-label para Assessoria de Investimentos | Redentia',
  description:
    'Plataforma white-label pronta para assessorias, influencers e fintechs: dados da B3, consolidador, IA, calculadoras e creative studio com sua marca, seu domínio, suas cores. Deploy em 1 semana.',
  path: '/whitelabel',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'White-label', path: '/whitelabel' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Redentia White-label',
      serviceType: 'Plataforma white-label de investimentos',
      provider: { '@type': 'Organization', name: 'Redentia' },
      areaServed: { '@type': 'Country', name: 'Brasil' },
      description:
        'Plataforma SaaS white-label para assessorias de investimento, influencers e fintechs operarem com marca própria em cima da infra Redentia.',
      audience: {
        '@type': 'BusinessAudience',
        audienceType: 'Assessores de investimento, influencers financeiros, fintechs',
      },
    },
  ],
})
</script>

<style scoped>
.wl-root {
  font-feature-settings: 'ss01', 'cv11';
}

/* Tenant tile hover */
.tenant-tile {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
}
.tenant-tile:hover {
  transform: translateY(-4px);
}

/* Focus rings */
.wl-root a:focus-visible,
.wl-root button:focus-visible {
  outline: 2px solid #F5A623;
  outline-offset: 4px;
  border-radius: 8px;
}
</style>

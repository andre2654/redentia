<template>
  <NuxtLayout name="api-portal">
    <div
      class="relative min-h-screen overflow-hidden"
      :style="{ backgroundColor: C.background, color: C.text, fontFamily: F.body }"
    >
      <!-- Background depth: amber glow + grid + scanlines -->
      <div class="pointer-events-none absolute inset-0">
        <div
          class="absolute left-1/2 top-0 h-[900px] w-[1600px] -translate-x-1/2 rounded-full blur-3xl opacity-40"
          :style="{ background: `radial-gradient(ellipse at center top, ${C.primary}40, transparent 60%)` }"
        />
        <div
          class="absolute inset-0 opacity-[0.04]"
          :style="{ backgroundImage: `linear-gradient(${C.text} 1px, transparent 1px), linear-gradient(90deg, ${C.text} 1px, transparent 1px)`, backgroundSize: '32px 32px' }"
        />
        <div
          class="absolute inset-0 opacity-20"
          :style="{ backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, ${C.text}04 2px, ${C.text}04 3px)` }"
        />
      </div>

      <!-- ============================================================
           HEADER
           ============================================================ -->
      <header
        class="sticky top-0 z-40 border-b backdrop-blur-xl"
        :style="{ borderColor: C.border, backgroundColor: `${C.background}CC` }"
      >
        <div class="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 md:px-6">
          <NuxtLink to="/whitelabel" class="flex items-center gap-2">
            <div
              class="flex size-7 items-center justify-center rounded"
              :style="{ backgroundColor: C.primary, color: C.background }"
            >
              <UIcon name="i-lucide-layers" class="size-4" />
            </div>
            <span class="font-mono-tab text-[11px] font-bold uppercase tracking-[0.15em]" :style="{ color: C.text }">
              REDENTIA<span :style="{ color: C.primary }">.WHITELABEL</span>
            </span>
          </NuxtLink>
          <nav class="hidden items-center gap-5 md:flex">
            <a href="#como-funciona" class="font-mono-tab text-[11px] uppercase tracking-[0.15em] transition-colors hover:opacity-70" :style="{ color: C.textMuted }">
              Como funciona
            </a>
            <a href="#tenants" class="font-mono-tab text-[11px] uppercase tracking-[0.15em] transition-colors hover:opacity-70" :style="{ color: C.textMuted }">
              Quem já usa
            </a>
            <a href="#pricing" class="font-mono-tab text-[11px] uppercase tracking-[0.15em] transition-colors hover:opacity-70" :style="{ color: C.textMuted }">
              Preços
            </a>
          </nav>
          <div class="flex-1" />
          <a
            href="#cta"
            class="inline-flex items-center gap-2 rounded border-2 px-4 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.18em] transition-all hover:-translate-y-0.5"
            :style="{
              backgroundColor: C.primary,
              color: C.background,
              borderColor: C.primary,
            }"
          >
            <UIcon name="i-lucide-arrow-right" class="size-3" />
            Falar com o time
          </a>
        </div>
      </header>

      <!-- ============================================================
           HERO
           ============================================================ -->
      <section class="relative mx-auto max-w-6xl px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
        <div class="mb-8 flex flex-wrap items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.18em]">
          <span class="flex items-center gap-1.5" :style="{ color: C.primary }">
            <span class="relative flex size-1.5">
              <span class="absolute inline-flex size-1.5 animate-ping rounded-full opacity-75" :style="{ backgroundColor: C.primary }" />
              <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: C.primary }" />
            </span>
            [WHITE.LABEL]
          </span>
          <span :style="{ color: C.border }">·</span>
          <span :style="{ color: C.textMuted }">5 TENANTS · 100% NO AR</span>
          <span :style="{ color: C.border }">·</span>
          <span :style="{ color: C.textMuted }">DEPLOY EM HORAS</span>
        </div>

        <h1
          class="mb-6 max-w-4xl text-[48px] leading-[0.9] tracking-tight sm:text-[64px] md:text-[84px] lg:text-[104px]"
          :style="{ color: C.text, fontFamily: F.display }"
        >
          Sua marca em cima da
          <span class="italic" :style="{ color: C.primary }">Redent.IA.</span>
        </h1>

        <p class="mb-10 max-w-2xl text-base leading-relaxed md:text-lg" :style="{ color: C.textMuted }">
          Infraestrutura de consolidação de carteira, dados da B3, fundamentalistas, rankings e IA — com o seu logo, suas cores, sua fonte, seu domínio. A gente cuida do backend, você cuida do conteúdo e da audiência.
        </p>

        <div class="mb-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <a
            href="#cta"
            class="group inline-flex items-center gap-3 rounded border-2 px-8 py-4 font-mono-tab text-[11px] uppercase tracking-[0.2em] transition-all hover:-translate-y-0.5"
            :style="{
              backgroundColor: C.primary,
              color: C.background,
              borderColor: C.primary,
              boxShadow: `0 10px 40px -10px ${C.primary}80`,
            }"
          >
            <span>[ QUERO UM WHITE LABEL</span>
            <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
            <span>]</span>
          </a>
          <a
            href="#tenants"
            class="inline-flex items-center gap-2 rounded border px-8 py-4 font-mono-tab text-[11px] uppercase tracking-[0.2em] transition-all hover:opacity-80"
            :style="{ borderColor: C.border, color: C.text }"
          >
            &gt; ver casos no ar
          </a>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-2 gap-8 border-t pt-10 md:grid-cols-4" :style="{ borderColor: C.border }">
          <div>
            <div class="text-3xl md:text-5xl" :style="{ color: C.primary, fontFamily: F.display }">5</div>
            <div class="mt-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">TENANTS NO AR</div>
          </div>
          <div>
            <div class="text-3xl md:text-5xl" :style="{ color: C.primary, fontFamily: F.display }">25K+</div>
            <div class="mt-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">ATIVOS MONITORADOS</div>
          </div>
          <div>
            <div class="text-3xl md:text-5xl" :style="{ color: C.primary, fontFamily: F.display }">&lt;1sem</div>
            <div class="mt-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">DO BRIEFING AO AR</div>
          </div>
          <div>
            <div class="text-3xl md:text-5xl" :style="{ color: C.primary, fontFamily: F.display }">100%</div>
            <div class="mt-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">CUSTOM BRANDING</div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           TENANTS GALLERY — social proof with 5 live tenants
           ============================================================ -->
      <section
        id="tenants"
        class="relative border-t"
        :style="{ borderColor: C.border, backgroundColor: `${C.surface}40` }"
      >
        <div class="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-12 text-center">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
              [ LIVE.TENANTS ]
            </span>
            <h2
              class="mt-4"
              :style="{
                color: C.text,
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                lineHeight: '1.05',
                fontFamily: F.display,
              }"
            >
              5 marcas. Uma infraestrutura.
            </h2>
            <p class="mx-auto mt-4 max-w-2xl text-sm md:text-base" :style="{ color: C.textMuted }">
              Cada tenant tem sua própria identidade visual radicalmente distinta — Bloomberg terminal, carta editorial, masterclass book cover, paper acadêmico, programa de TV. A infraestrutura é uma só.
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <a
              v-for="tenant in tenants"
              :key="tenant.slug"
              :href="tenant.url"
              target="_blank"
              rel="noopener"
              class="group relative overflow-hidden rounded-lg border transition-all hover:-translate-y-1"
              :style="{
                borderColor: C.border,
                backgroundColor: `${C.surface}E6`,
                boxShadow: `0 10px 40px -20px ${C.primary}30`,
              }"
            >
              <!-- Preview canvas (mimics tenant's signature color + font) -->
              <div
                class="relative aspect-[16/10] overflow-hidden border-b p-6"
                :style="{ borderColor: C.border, backgroundColor: tenant.bg }"
              >
                <div
                  class="absolute inset-0 opacity-40"
                  :style="{ background: `radial-gradient(ellipse at 50% 0%, ${tenant.accent}40, transparent 60%)` }"
                />
                <div class="relative flex h-full flex-col justify-between">
                  <div class="flex items-center justify-between">
                    <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: tenant.accent }">
                      {{ tenant.variant }}
                    </span>
                    <span class="font-mono-tab text-[9px]" :style="{ color: `${tenant.fg}80` }">
                      {{ tenant.eyebrow }}
                    </span>
                  </div>
                  <div>
                    <div
                      class="text-2xl leading-[1.05] tracking-tight md:text-[28px]"
                      :style="{ color: tenant.fg, fontFamily: tenant.font, fontStyle: tenant.italic ? 'italic' : 'normal', fontWeight: tenant.weight }"
                    >
                      {{ tenant.previewTitle }}
                    </div>
                    <div class="mt-2 font-mono-tab text-[10px]" :style="{ color: `${tenant.fg}70` }">
                      {{ tenant.name }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Card body -->
              <div class="flex flex-col gap-3 p-5">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-bold tracking-tight" :style="{ color: C.text }">
                    {{ tenant.name }}
                  </h3>
                  <span
                    class="rounded border px-1.5 py-0.5 font-mono-tab text-[9px] uppercase"
                    :style="{ borderColor: `${C.positive}60`, backgroundColor: `${C.positive}15`, color: C.positive }"
                  >
                    LIVE
                  </span>
                </div>
                <p class="text-[13px] leading-relaxed" :style="{ color: C.textMuted }">
                  {{ tenant.description }}
                </p>
                <div class="mt-auto flex items-center gap-2 border-t pt-3 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ borderColor: C.border }">
                  <span :style="{ color: C.textMuted }">{{ tenant.domain }}</span>
                  <span class="flex-1" />
                  <span :style="{ color: C.primary }">VER →</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      <!-- ============================================================
           HOW IT WORKS
           ============================================================ -->
      <section
        id="como-funciona"
        class="relative border-t"
        :style="{ borderColor: C.border }"
      >
        <div class="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-12">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
              [ HOW.IT.WORKS ]
            </span>
            <h2
              class="mt-4"
              :style="{
                color: C.text,
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                lineHeight: '1.05',
                fontFamily: F.display,
              }"
            >
              3 passos. 1 semana. Seu white label <span class="italic" :style="{ color: C.primary }">no ar.</span>
            </h2>
          </div>

          <div class="grid gap-px border" :style="{ borderColor: C.border, backgroundColor: C.border }">
            <div class="grid md:grid-cols-3" style="gap: 1px;">
              <div
                v-for="(step, idx) in steps"
                :key="idx"
                class="flex flex-col gap-4 p-8 md:p-10"
                :style="{ backgroundColor: C.background }"
              >
                <div class="flex items-center justify-between">
                  <div
                    class="flex size-10 items-center justify-center rounded-full border font-mono-tab text-[14px] font-bold"
                    :style="{ borderColor: C.primary, color: C.primary }"
                  >
                    {{ idx + 1 }}
                  </div>
                  <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
                    {{ step.duration }}
                  </span>
                </div>
                <h3 class="text-xl font-bold tracking-tight" :style="{ color: C.text }">
                  {{ step.title }}
                </h3>
                <p class="text-sm leading-relaxed" :style="{ color: C.textMuted }">
                  {{ step.description }}
                </p>
                <div class="mt-auto flex flex-wrap gap-2 pt-2">
                  <span
                    v-for="d in step.deliverables"
                    :key="d"
                    class="rounded border px-2 py-0.5 font-mono-tab text-[9px] uppercase tracking-[0.12em]"
                    :style="{ borderColor: C.border, color: C.text }"
                  >
                    {{ d }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           WHAT YOU GET — features grid
           ============================================================ -->
      <section
        class="relative border-t"
        :style="{ borderColor: C.border, backgroundColor: `${C.surface}40` }"
      >
        <div class="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-12 text-center">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
              [ STACK.INCLUDED ]
            </span>
            <h2
              class="mt-4"
              :style="{
                color: C.text,
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                lineHeight: '1.05',
                fontFamily: F.display,
              }"
            >
              O que vem no pacote.
            </h2>
          </div>

          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="feat in features"
              :key="feat.title"
              class="flex flex-col gap-3 rounded-lg border p-6"
              :style="{ borderColor: C.border, backgroundColor: `${C.background}CC` }"
            >
              <UIcon :name="feat.icon" class="size-6" :style="{ color: C.primary }" />
              <h3 class="text-lg font-bold tracking-tight" :style="{ color: C.text }">
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
           WHO IT'S FOR — personas
           ============================================================ -->
      <section
        class="relative border-t"
        :style="{ borderColor: C.border }"
      >
        <div class="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-12">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
              [ PRA.QUEM.É ]
            </span>
            <h2
              class="mt-4 max-w-3xl"
              :style="{
                color: C.text,
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                lineHeight: '1.05',
                fontFamily: F.display,
              }"
            >
              Se você tem audiência em investimentos — a Redentia é <span class="italic" :style="{ color: C.primary }">sua</span>.
            </h2>
          </div>

          <div class="grid gap-6 md:grid-cols-3">
            <div
              v-for="persona in personas"
              :key="persona.name"
              class="relative flex flex-col gap-4 rounded-lg border p-8"
              :style="{ borderColor: C.border, backgroundColor: `${C.surface}E6` }"
            >
              <div class="flex items-center gap-3">
                <div
                  class="flex size-10 items-center justify-center rounded-lg"
                  :style="{ backgroundColor: `${C.primary}20`, color: C.primary }"
                >
                  <UIcon :name="persona.icon" class="size-5" />
                </div>
                <h3 class="text-lg font-bold tracking-tight" :style="{ color: C.text }">
                  {{ persona.name }}
                </h3>
              </div>
              <p class="text-sm leading-relaxed" :style="{ color: C.textMuted }">
                {{ persona.pitch }}
              </p>
              <ul class="flex flex-col gap-2 pt-2">
                <li
                  v-for="bullet in persona.bullets"
                  :key="bullet"
                  class="flex items-start gap-2 text-[13px]"
                  :style="{ color: C.text }"
                >
                  <UIcon name="i-lucide-check" class="mt-0.5 size-4 shrink-0" :style="{ color: C.primary }" />
                  <span>{{ bullet }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           PRICING — 3 tiers
           ============================================================ -->
      <section
        id="pricing"
        class="relative border-t"
        :style="{ borderColor: C.border, backgroundColor: `${C.surface}40` }"
      >
        <div class="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-12 text-center">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
              [ PRICING ]
            </span>
            <h2
              class="mt-4"
              :style="{
                color: C.text,
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                lineHeight: '1.05',
                fontFamily: F.display,
              }"
            >
              Escolha o tier.
            </h2>
            <p class="mx-auto mt-4 max-w-xl text-sm" :style="{ color: C.textMuted }">
              Todos os planos incluem deploy, setup inicial e suporte. Sem surpresa no boleto.
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-3">
            <div
              v-for="(plan, idx) in plans"
              :key="plan.slug"
              class="relative flex flex-col gap-5 rounded-lg border p-8"
              :style="{
                borderColor: plan.popular ? C.primary : C.border,
                backgroundColor: `${C.surface}E6`,
                boxShadow: plan.popular ? `0 10px 40px -10px ${C.primary}60` : 'none',
              }"
            >
              <span
                v-if="plan.popular"
                class="absolute -top-3 left-1/2 -translate-x-1/2 rounded border px-3 py-1 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
                :style="{ backgroundColor: C.primary, color: C.background, borderColor: C.primary }"
              >
                MAIS POPULAR
              </span>

              <div class="flex items-center justify-between">
                <span class="font-mono-tab text-[11px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                  [ {{ plan.slug.toUpperCase() }} ]
                </span>
                <span class="font-mono-tab text-[10px]" :style="{ color: C.textMuted }">
                  {{ String(idx + 1).padStart(2, '0') }}/03
                </span>
              </div>

              <h3 class="text-3xl font-bold tracking-tight" :style="{ color: C.text }">
                {{ plan.name }}
              </h3>
              <p class="text-[13px]" :style="{ color: C.textMuted }">
                {{ plan.description }}
              </p>

              <div class="border-y py-5" :style="{ borderColor: C.border }">
                <div class="flex items-baseline gap-1">
                  <span class="text-4xl tabular-nums md:text-5xl" :style="{ color: C.text, fontFamily: F.display }">
                    {{ plan.price }}
                  </span>
                  <span class="font-mono-tab text-[11px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
                    /{{ plan.priceUnit }}
                  </span>
                </div>
                <p v-if="plan.priceNote" class="mt-2 text-xs" :style="{ color: C.textMuted }">
                  {{ plan.priceNote }}
                </p>
              </div>

              <ul class="flex flex-col gap-3 text-sm">
                <li v-for="feat in plan.features" :key="feat" class="flex items-start gap-2" :style="{ color: C.text }">
                  <UIcon name="i-lucide-check" class="mt-0.5 size-4 shrink-0" :style="{ color: C.primary }" />
                  <span>{{ feat }}</span>
                </li>
              </ul>

              <a
                href="#cta"
                class="mt-auto inline-flex w-full items-center justify-center gap-2 rounded border-2 px-6 py-3 font-mono-tab text-[11px] uppercase tracking-[0.18em] transition-all hover:-translate-y-0.5"
                :style="{
                  backgroundColor: plan.popular ? C.primary : 'transparent',
                  color: plan.popular ? C.background : C.text,
                  borderColor: plan.popular ? C.primary : C.border,
                }"
              >
                {{ plan.cta }}
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           FINAL CTA
           ============================================================ -->
      <section
        id="cta"
        class="relative border-t"
        :style="{ borderColor: C.border }"
      >
        <div class="mx-auto max-w-4xl px-6 py-20 text-center md:px-10 md:py-28">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
            [ READY.TO.SHIP ]
          </span>
          <h2
            class="mt-4"
            :style="{
              color: C.text,
              fontSize: 'clamp(2.25rem, 5vw, 4.5rem)',
              lineHeight: '1',
              fontFamily: F.display,
            }"
          >
            Seu white label é o próximo.
          </h2>
          <p class="mx-auto mt-6 max-w-xl text-sm" :style="{ color: C.textMuted }">
            Fale direto com o time. Primeira call de briefing em 24h, protótipo em 3 dias, produção em 1 semana.
          </p>
          <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:whitelabel@redentia.com.br"
              class="group inline-flex items-center gap-3 rounded border-2 px-10 py-5 font-mono-tab text-[12px] uppercase tracking-[0.2em] transition-all hover:-translate-y-0.5"
              :style="{
                backgroundColor: C.primary,
                color: C.background,
                borderColor: C.primary,
                boxShadow: `0 10px 40px -10px ${C.primary}80`,
              }"
            >
              <span>[ FALAR COM O TIME</span>
              <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
              <span>]</span>
            </a>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-2 font-mono-tab text-[11px] uppercase tracking-[0.2em] transition-opacity hover:opacity-70"
              :style="{ color: C.textMuted }"
            >
              &gt; whatsapp →
            </a>
          </div>

          <p class="mt-12 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
            WHITELABEL@REDENTIA.COM.BR · REDENTIA.COM.BR
          </p>
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
// ============================================================
// Redentia Whitelabel — landing page
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
  border: '#2A2E39',
  text: '#E8EAED',
  textMuted: '#8B92A7',
}

const F = {
  body: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  display: "'Instrument Serif', 'Times New Roman', serif",
  mono: "'JetBrains Mono', monospace",
}

// ============================================================
// Tenants gallery — 5 live brands on Redentia infrastructure.
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
    description: 'O tenant-mãe. Bloomberg terminal reimaginado — amber, monospace, dados por primeiro.',
    url: 'https://redentia.com.br',
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
    previewTitle: 'Estimado investidor, sua carta.',
    description: 'Assessoria fictícia no estilo carta editorial de private bank. Fraunces italic, papel ivory, serif voice.',
    url: 'https://redentia.com.br/?brand=norte-capital',
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
    eyebrow: 'MASTERCLASS BOOK COVER',
    previewTitle: 'Liberdade ou mediocridade.',
    description: 'Thiago Nigro em formato "manual do autor". Fraunces display, tape orange, quote do fundador.',
    url: 'https://redentia.com.br/?brand=primo-rico',
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
    previewTitle: 'A única verdade possível é o conhecimento.',
    description: 'Raul Sena / AUVP em formato paper acadêmico. IBM Plex serif, § marcadores, red-pen notes.',
    url: 'https://redentia.com.br/?brand=investidor-sardinha',
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
    eyebrow: 'TV SHOW · EP 001',
    previewTitle: 'Chega de dinheirofobia, criatura!',
    description: 'Nathalia Arcuri em formato programa de TV pop. Poppins 900, amarelo sticker, Margarete mascote.',
    url: 'https://redentia.com.br/?brand=me-poupe',
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
    bg: '#14161C',
    fg: '#E8EAED',
    accent: '#F5A623',
    font: "'Inter', sans-serif",
    italic: true,
    weight: 400,
  },
]

// ============================================================
// HOW IT WORKS — 3 steps
// ============================================================
const steps = [
  {
    title: 'Briefing visual',
    duration: 'DIA 1',
    description: 'Call de 60 minutos pra entender seu público, sua voz, seu visual. Mostramos os 5 tenants no ar e você escolhe direções de referência.',
    deliverables: ['CALL 60min', 'BENCHMARKS', 'BRIEFING DOC'],
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
    description: 'Cores, fontes, hero variant, layout das páginas, copys — tudo controlado pelo seu brand config. Zero "powered by Redentia".',
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
    icon: 'i-lucide-terminal',
    title: 'API REST (opcional)',
    description: 'Se quiser revender dados pro seu ecossistema, ligamos a sua subconta da Redentia API. Rate limit seu, cobrança sua.',
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
// PERSONAS — who it's for
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
    pitch: 'Você é uma assessoria e precisa de uma plataforma pros clientes que NÃO seja a do banco/corretora. Portal white-label com a sua marca.',
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
    priceNote: 'Deploy único R$ 5.000',
    features: [
      'Até 500 usuários ativos',
      'Domínio customizado + TLS',
      '1 variant visual (hero + asset page)',
      'Dados da B3 em tempo real',
      'Consolidador de carteira básico',
      'Suporte por email',
    ],
    cta: 'COMEÇAR',
    popular: false,
  },
  {
    slug: 'growth',
    name: 'Growth',
    description: 'Pra quem já tem audiência e quer escalar.',
    price: 'R$ 6.800',
    priceUnit: 'mês',
    priceNote: 'Deploy único R$ 8.000',
    features: [
      'Até 10.000 usuários ativos',
      'Tudo do Starter +',
      'Variants visuais ilimitados',
      'Redentia Creative incluso',
      '8 calculadoras + IA',
      'Notificações push',
      'Analytics dashboard',
      'Suporte prioritário',
    ],
    cta: 'ESCOLHER GROWTH',
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
      'Tudo do Growth +',
      'API REST dedicada',
      'SLA 99.9% com multa',
      'Deploy em cloud própria',
      'Suporte 24/7 via Slack',
      'Feature requests priorizadas',
    ],
    cta: 'FALAR COM SALES',
    popular: false,
  },
]

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: 'Redentia Whitelabel — sua marca em cima da nossa infra',
  description: 'Plataforma white-label de investimentos: dados da B3, consolidador, IA, calculadoras e creative studio — com o seu logo, suas cores, seu domínio. Deploy em 1 semana.',
  path: '/whitelabel',
})
</script>

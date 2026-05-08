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
            <a href="#plataforma" class="text-[13px] transition-colors hover:opacity-70" :style="{ color: C.textMuted }">
              Plataforma
            </a>
            <a href="#redacao" class="text-[13px] transition-colors hover:opacity-70" :style="{ color: C.textMuted }">
              Redação
            </a>
            <a href="#tenants" class="text-[13px] transition-colors hover:opacity-70" :style="{ color: C.textMuted }">
              Quem já usa
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
           HERO, tight + focused
           ============================================================ -->
      <section class="relative overflow-hidden">
        <div class="pointer-events-none absolute inset-0">
          <div
            class="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full blur-3xl opacity-20"
            :style="{ background: `radial-gradient(ellipse at center, ${C.primary}, transparent 65%)` }"
          />
        </div>

        <div class="relative mx-auto max-w-4xl px-6 pb-14 pt-16 text-center md:px-10 md:pb-20 md:pt-24">
          <!-- Pill badge -->
          <div class="mb-7 flex justify-center">
            <div class="inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5" :style="{ borderColor: `${C.primary}40`, backgroundColor: `${C.primary}08` }">
              <span class="relative flex size-1.5">
                <span class="absolute inline-flex size-1.5 motion-safe:animate-ping rounded-full opacity-75" :style="{ backgroundColor: C.primary }" />
                <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: C.primary }" />
              </span>
              <span class="text-[11px] font-medium uppercase tracking-[0.2em]" :style="{ color: C.primary }">
                Plataforma + Redação · 5 marcas no ar
              </span>
            </div>
          </div>

          <!-- Title, tighter -->
          <h1
            class="mb-6 leading-[0.9] tracking-tighter"
            :style="{
              color: C.text,
              fontFamily: F.display,
              fontSize: 'clamp(2.75rem, 6.5vw, 5.5rem)',
            }"
          >
            Sua marca,<br />
            <span class="italic" :style="{ color: C.primary }">nossa infra e redação.</span>
          </h1>

          <!-- Subtitle, sharper -->
          <p class="mx-auto mb-9 max-w-xl text-[15px] leading-[1.55] md:text-[17px]" :style="{ color: `${C.text}B0` }">
            Plataforma de investimentos no seu domínio em 7 dias. Redação financeira no seu visual. Os dois, ou só um.
          </p>

          <!-- CTAs -->
          <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              class="group inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-[14px] font-semibold transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5"
              :style="{
                backgroundColor: C.primary,
                color: C.background,
                boxShadow: `0 14px 40px -14px ${C.primary}A0`,
              }"
              @click="openLeadModal()"
            >
              Falar com o time
              <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
            </button>
            <a
              href="#plataforma"
              class="inline-flex items-center gap-2 px-2 py-2 text-[14px] font-medium transition-opacity hover:opacity-70"
              :style="{ color: C.text }"
            >
              <span class="border-b pb-0.5" :style="{ borderColor: C.text }">Ver o produto</span>
              <span>↓</span>
            </a>
          </div>
        </div>
      </section>

      <!-- ============================================================
           DOIS PRODUTOS, the map of the offer
           ============================================================ -->
      <section class="relative border-b" :style="{ borderColor: C.border }">
        <div class="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-12 max-w-3xl">
            <div class="text-[12px] uppercase tracking-[0.22em]" :style="{ color: C.primary }">, Como a Redentia atua</div>
            <h2
              class="mt-4 leading-[0.95] tracking-tight"
              :style="{
                color: C.text,
                fontFamily: F.display,
                fontSize: 'clamp(2.25rem, 5vw, 4rem)',
              }"
            >
              Dois produtos.<br />
              <span class="italic" :style="{ color: C.primary }">Pode pegar um, pode pegar os dois.</span>
            </h2>
            <p class="mt-6 text-[15px] leading-relaxed" :style="{ color: `${C.text}B0` }">
              Cada produto resolve um problema. A plataforma resolve "não tenho infra pra investidor". A redação resolve "não tenho conteúdo pra essa infra". Compram juntos pelo combo, ou separados, do jeito que fizer sentido pra você.
            </p>
          </div>

          <div class="grid gap-5 md:grid-cols-2 md:gap-6">
            <!-- Card Produto 01 -->
            <a
              href="#plataforma"
              class="group relative flex flex-col gap-6 overflow-hidden rounded-3xl border p-8 transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-1 md:p-10"
              :style="{ borderColor: C.border, backgroundColor: C.surface }"
            >
              <div
                class="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full opacity-25 blur-3xl transition-opacity group-hover:opacity-40"
                :style="{ background: C.primary }"
              />
              <div class="relative">
                <div class="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em]" :style="{ color: C.primary, fontFamily: F.mono }">
                  <span class="rounded-full border px-2.5 py-0.5 tabular-nums" :style="{ borderColor: `${C.primary}50`, color: C.primary }">PRODUTO 01</span>
                  <span>Plataforma</span>
                </div>
                <h3
                  class="mt-5 leading-[0.95] tracking-tight"
                  :style="{
                    color: C.text,
                    fontFamily: F.display,
                    fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                  }"
                >
                  Sua plataforma de<br />
                  investimentos<br />
                  <span class="italic" :style="{ color: C.primary }">no ar em 7 dias.</span>
                </h3>
                <p class="mt-5 text-[14px] leading-relaxed" :style="{ color: `${C.text}B0` }">
                  Frontend + backend + dados B3 + IA + calculadoras + creative. Seu domínio, suas cores, seu logo. Tudo o que a Redentia tem, vestido com a sua marca.
                </p>
                <ul class="mt-6 flex flex-col gap-2.5 text-[13px]">
                  <li class="flex items-start gap-2" :style="{ color: `${C.text}D0` }">
                    <UIcon name="i-lucide-check-circle-2" class="mt-0.5 size-4 shrink-0" :style="{ color: C.primary }" />
                    <span>Identidade visual 100% custom</span>
                  </li>
                  <li class="flex items-start gap-2" :style="{ color: `${C.text}D0` }">
                    <UIcon name="i-lucide-check-circle-2" class="mt-0.5 size-4 shrink-0" :style="{ color: C.primary }" />
                    <span>Dados da B3 em tempo real, calculadoras, IA</span>
                  </li>
                  <li class="flex items-start gap-2" :style="{ color: `${C.text}D0` }">
                    <UIcon name="i-lucide-check-circle-2" class="mt-0.5 size-4 shrink-0" :style="{ color: C.primary }" />
                    <span>Da call ao deploy em 7 dias</span>
                  </li>
                  <li class="flex items-start gap-2" :style="{ color: `${C.text}D0` }">
                    <UIcon name="i-lucide-check-circle-2" class="mt-0.5 size-4 shrink-0" :style="{ color: C.primary }" />
                    <span>Zero menção de "Redentia" no produto final</span>
                  </li>
                </ul>
                <div class="mt-8 flex items-center gap-2 text-[13px] font-semibold" :style="{ color: C.primary }">
                  <span class="border-b transition-[transform,opacity,box-shadow,background-color,border-color,filter] group-hover:translate-x-1" :style="{ borderColor: C.primary }">Ver detalhes da plataforma</span>
                  <span>↓</span>
                </div>
              </div>
            </a>

            <!-- Card Produto 02 -->
            <a
              href="#redacao"
              class="group relative flex flex-col gap-6 overflow-hidden rounded-3xl border p-8 transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-1 md:p-10"
              :style="{ borderColor: C.border, backgroundColor: C.surface }"
            >
              <div
                class="pointer-events-none absolute -left-20 -bottom-20 size-72 rounded-full opacity-25 blur-3xl transition-opacity group-hover:opacity-40"
                :style="{ background: C.primary }"
              />
              <div class="relative">
                <div class="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em]" :style="{ color: C.primary, fontFamily: F.mono }">
                  <span class="rounded-full border px-2.5 py-0.5 tabular-nums" :style="{ borderColor: `${C.primary}50`, color: C.primary }">PRODUTO 02</span>
                  <span>Redação</span>
                </div>
                <h3
                  class="mt-5 leading-[0.95] tracking-tight"
                  :style="{
                    color: C.text,
                    fontFamily: F.display,
                    fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                  }"
                >
                  Conteúdo financeiro<br />
                  pronto, com a<br />
                  <span class="italic" :style="{ color: C.primary }">sua marca em cima.</span>
                </h3>
                <p class="mt-5 text-[14px] leading-relaxed" :style="{ color: `${C.text}B0` }">
                  Notícias agregadas de 15 feeds, editoriais únicos por ativo, carrosseis pra redes, briefing diário. Saída por API, RSS ou direto no white-label.
                </p>
                <ul class="mt-6 flex flex-col gap-2.5 text-[13px]">
                  <li class="flex items-start gap-2" :style="{ color: `${C.text}D0` }">
                    <UIcon name="i-lucide-check-circle-2" class="mt-0.5 size-4 shrink-0" :style="{ color: C.primary }" />
                    <span>15 feeds, 7 fontes, atualizadas a cada 10 min</span>
                  </li>
                  <li class="flex items-start gap-2" :style="{ color: `${C.text}D0` }">
                    <UIcon name="i-lucide-check-circle-2" class="mt-0.5 size-4 shrink-0" :style="{ color: C.primary }" />
                    <span>Editoriais originais ~1.800 palavras por ticker</span>
                  </li>
                  <li class="flex items-start gap-2" :style="{ color: `${C.text}D0` }">
                    <UIcon name="i-lucide-check-circle-2" class="mt-0.5 size-4 shrink-0" :style="{ color: C.primary }" />
                    <span>Carrosseis e news posts no padrão visual da sua marca</span>
                  </li>
                  <li class="flex items-start gap-2" :style="{ color: `${C.text}D0` }">
                    <UIcon name="i-lucide-check-circle-2" class="mt-0.5 size-4 shrink-0" :style="{ color: C.primary }" />
                    <span>Briefing diário 06h pra alimentar sua newsletter</span>
                  </li>
                </ul>
                <div class="mt-8 flex items-center gap-2 text-[13px] font-semibold" :style="{ color: C.primary }">
                  <span class="border-b transition-[transform,opacity,box-shadow,background-color,border-color,filter] group-hover:translate-x-1" :style="{ borderColor: C.primary }">Ver detalhes da redação</span>
                  <span>↓</span>
                </div>
              </div>
            </a>
          </div>

          <!-- Combo note -->
          <div
            class="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border p-5 sm:flex-row"
            :style="{ borderColor: `${C.primary}40`, backgroundColor: `${C.primary}08` }"
          >
            <UIcon name="i-lucide-package" class="size-4" :style="{ color: C.primary }" />
            <span class="text-[13px] tracking-wide" :style="{ color: C.text }">
              Combo Plataforma + Redação:
              <strong :style="{ color: C.primary }">15% off</strong>
              no total quando contratados juntos.
            </span>
            <span class="text-[11px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
              · ver no pricing
            </span>
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
                      class="text-[18px] leading-tight tracking-tight md:text-[22px]"
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
           PRODUTO 01, Plataforma — feature grid (no live components)
           ============================================================ -->
      <section
        id="plataforma"
        class="relative border-b"
        :style="{ borderColor: `${C.border}`, backgroundColor: C.surfaceLight }"
      >
        <div class="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <div class="mb-16 grid items-end gap-8 md:grid-cols-12">
            <div class="md:col-span-7">
              <div class="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em]" :style="{ color: C.primary, fontFamily: F.mono }">
                <span class="rounded-full border px-2.5 py-0.5 tabular-nums" :style="{ borderColor: `${C.primary}50`, color: C.primary }">PRODUTO 01</span>
                <span class="h-px w-8" :style="{ backgroundColor: C.border }" />
                <span>Plataforma white-label</span>
              </div>
              <h2
                class="mt-4 leading-[0.95] tracking-tight"
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
            <p class="text-[15px] leading-relaxed md:col-span-5" :style="{ color: `${C.text}B0` }">
              Frontend, backend, dados da B3, IA, calculadoras, consolidador, creative. Mesmo stack que serve as 5 marcas no ar, com a sua identidade na frente.
            </p>
          </div>

          <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="(feat, idx) in features"
              :key="feat.title"
              class="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-7 transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-1"
              :style="{
                borderColor: C.border,
                backgroundColor: idx % 4 === 0 ? `${C.primary}08` : C.background,
              }"
            >
              <div
                class="flex size-12 items-center justify-center rounded-xl"
                :style="{ backgroundColor: `${C.primary}20`, color: C.primary }"
              >
                <UIcon :name="feat.icon" class="size-6" />
              </div>
              <h3 class="text-[18px] font-medium leading-tight tracking-tight" :style="{ color: C.text, letterSpacing: '-0.005em' }">
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
           PRODUTO 2, Redação / Newsroom-as-a-service
           ============================================================ -->
      <section
        id="redacao"
        class="relative overflow-hidden border-b"
        :style="{ borderColor: C.border }"
      >
        <div class="pointer-events-none absolute inset-0">
          <div
            class="absolute right-0 top-0 h-[600px] w-[600px] rounded-full blur-3xl opacity-15"
            :style="{ background: `radial-gradient(circle at top right, ${C.primary}, transparent 60%)` }"
          />
        </div>

        <div class="relative mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <!-- Section header -->
          <div class="mb-16 grid items-end gap-8 md:grid-cols-12">
            <div class="md:col-span-7">
              <div class="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em]" :style="{ color: C.primary, fontFamily: F.mono }">
                <span class="rounded-full border px-2.5 py-0.5 tabular-nums" :style="{ borderColor: `${C.primary}50`, color: C.primary }">PRODUTO 02</span>
                <span class="h-px w-8" :style="{ backgroundColor: C.border }" />
                <span>Redação / newsroom-as-a-service</span>
              </div>
              <h2
                class="mt-4 leading-[0.95] tracking-tight"
                :style="{
                  color: C.text,
                  fontFamily: F.display,
                  fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                }"
              >
                Jornalismo que<br />
                <span class="italic" :style="{ color: C.primary }">cabe na sua marca.</span>
              </h2>
            </div>
            <p class="text-[15px] leading-relaxed md:col-span-5" :style="{ color: `${C.text}B0` }">
              Notícias, análises e editoriais escritos por uma redação profissional, com horário de fechamento. Mesmo padrão do app principal, vestido com a sua identidade. Saída via API, RSS, painel ou direto no white-label.
            </p>
          </div>

          <!-- Sources strip, slim -->
          <div class="mb-20 border-y py-8" :style="{ borderColor: `${C.border}80` }">
            <p class="mb-5 text-[11px] uppercase tracking-[0.22em]" :style="{ color: C.textMuted }">
              Fontes monitoradas em tempo real · 15 feeds, 7 fontes
            </p>
            <div class="flex flex-wrap items-center gap-x-7 gap-y-2.5">
              <span
                v-for="src in sources"
                :key="src"
                class="text-[15px] leading-none tracking-tight"
                :style="{ color: `${C.text}A0`, fontFamily: F.display, fontStyle: 'italic' }"
              >
                {{ src }}
              </span>
            </div>
          </div>

          <!-- Formats grid -->
          <div class="mb-20">
            <div class="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <h3
                class="leading-[1] tracking-tight"
                :style="{
                  color: C.text,
                  fontFamily: F.display,
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                }"
              >
                Cinco formatos editoriais
              </h3>
              <span class="text-[11px] uppercase tracking-[0.2em]" :style="{ color: C.textMuted }">
                Mesma voz, mesmo padrão · saídas diferentes
              </span>
            </div>

            <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="(fmt, idx) in formats"
                :key="fmt.title"
                class="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-7 transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-1"
                :class="idx === 0 || idx === 4 ? 'lg:col-span-2' : ''"
                :style="{
                  borderColor: C.border,
                  backgroundColor: C.surface,
                }"
              >
                <div class="relative z-10 flex h-full flex-col">
                  <div class="mb-4 flex items-center gap-3">
                    <span
                      class="tabular-nums text-[11px] font-medium uppercase tracking-[0.18em]"
                      :style="{ color: C.primary, fontFamily: F.mono }"
                    >
                      Nº {{ String(idx + 1).padStart(2, '0') }}
                    </span>
                    <span class="h-px flex-1" :style="{ backgroundColor: `${C.border}80` }" />
                    <span class="text-[10px] uppercase tracking-[0.2em]" :style="{ color: C.textMuted }">
                      {{ fmt.cadence }}
                    </span>
                  </div>
                  <h4
                    class="text-[24px] leading-[1.05] tracking-tight md:text-[28px]"
                    :style="{ color: C.text, fontFamily: F.display }"
                  >
                    {{ fmt.title }}
                  </h4>
                  <p class="mt-3 text-[14px] leading-relaxed" :style="{ color: `${C.text}B0` }">
                    {{ fmt.description }}
                  </p>
                  <div class="mt-auto flex items-center justify-between border-t pt-5" :style="{ borderColor: `${C.border}80`, marginTop: '1.25rem' }">
                    <span class="text-[11px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
                      {{ fmt.distribution }}
                    </span>
                    <span class="text-[11px] tabular-nums" :style="{ color: C.primary, fontFamily: F.mono }">
                      {{ fmt.spec }}
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <!-- Distribution channels -->
          <div class="mb-20">
            <div class="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <h3
                class="leading-[1] tracking-tight"
                :style="{
                  color: C.text,
                  fontFamily: F.display,
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                }"
              >
                Três canais de saída
              </h3>
              <span class="text-[11px] uppercase tracking-[0.2em]" :style="{ color: C.textMuted }">
                A redação escreve uma vez · roda em todo lugar
              </span>
            </div>

            <div class="grid gap-5 md:grid-cols-3">
              <div
                v-for="ch in channels"
                :key="ch.name"
                class="relative flex flex-col gap-5 overflow-hidden rounded-3xl border p-8"
                :style="{ borderColor: C.border, backgroundColor: C.surface }"
              >
                <div class="flex items-center gap-3">
                  <UIcon :name="ch.icon" class="size-5" :style="{ color: C.primary }" />
                  <span class="text-[11px] uppercase tracking-[0.2em]" :style="{ color: C.primary, fontFamily: F.mono }">
                    {{ ch.kicker }}
                  </span>
                </div>
                <h4 class="text-[24px] leading-tight tracking-tight" :style="{ color: C.text, fontFamily: F.display }">
                  {{ ch.name }}
                </h4>
                <p class="text-[14px] leading-relaxed" :style="{ color: `${C.text}B0` }">
                  {{ ch.description }}
                </p>
                <div class="mt-auto flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
                  <span class="size-1.5 rounded-full" :style="{ backgroundColor: C.primary }" />
                  {{ ch.metric }}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- ============================================================
           PRICING, single 3-plan grid (Só Plataforma · Combo · Só Redação)
           ============================================================ -->
      <section
        id="pricing"
        class="relative"
      >
        <div class="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-12 max-w-2xl">
            <div class="text-[11px] uppercase tracking-[0.22em]" :style="{ color: C.primary, fontFamily: F.mono }">
              , Investimento
            </div>
            <h2
              class="mt-3 leading-[0.95] tracking-tight"
              :style="{
                color: C.text,
                fontFamily: F.display,
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              }"
            >
              Pegue um.<br />
              <span class="italic" :style="{ color: C.primary }">Pegue os dois com 15% off.</span>
            </h2>
            <p class="mt-5 text-[14px] leading-relaxed" :style="{ color: C.textMuted }">
              Mensal, sem fidelidade. Setup, deploy, suporte e atualizações inclusos.
            </p>
          </div>

          <div
            class="grid overflow-hidden rounded-2xl border md:grid-cols-3"
            :style="{ borderColor: C.border }"
          >
            <div
              v-for="plan in unifiedPlans"
              :key="plan.slug"
              class="relative flex flex-col gap-5 border-b p-7 md:border-b-0 md:border-r md:p-9 last:border-b-0 last:border-r-0"
              :style="{
                borderColor: C.border,
                backgroundColor: plan.popular ? `${C.primary}08` : 'transparent',
              }"
            >
              <div
                v-if="plan.popular"
                class="absolute inset-x-0 top-0 h-0.5"
                :style="{ backgroundColor: C.primary }"
              />

              <div class="flex items-center gap-3">
                <span
                  class="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] tabular-nums"
                  :style="{ borderColor: `${C.primary}50`, color: C.primary, fontFamily: F.mono }"
                >
                  {{ plan.tag }}
                </span>
                <h3 class="text-[15px] font-medium" :style="{ color: C.text }">
                  {{ plan.name }}
                </h3>
                <span
                  v-if="plan.popular"
                  class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  :style="{ backgroundColor: `${C.primary}20`, color: C.primary }"
                >
                  Combo
                </span>
              </div>

              <p class="text-[13px] leading-relaxed" :style="{ color: C.textMuted }">
                {{ plan.description }}
              </p>

              <div class="flex items-baseline gap-1">
                <span
                  class="tabular-nums leading-none tracking-tight"
                  :style="{
                    color: C.text,
                    fontFamily: F.display,
                    fontSize: 'clamp(2.5rem, 4.5vw, 3.5rem)',
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

              <ul class="flex flex-col gap-2 border-t pt-5 text-[13px]" :style="{ borderColor: `${C.border}80` }">
                <li v-for="feat in plan.features" :key="feat" class="flex items-start gap-2" :style="{ color: `${C.text}D0` }">
                  <UIcon name="i-lucide-check" class="mt-0.5 size-3.5 shrink-0" :style="{ color: C.primary }" />
                  <span>{{ feat }}</span>
                </li>
              </ul>

              <button
                class="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-semibold transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:opacity-90"
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
// PRODUTO 01, feature grid (no live components)
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
// REDACAO / PRODUTO 02 — sources, formats, channels
// ============================================================
const sources = [
  'InfoMoney',
  'Valor Investe',
  'Brazil Journal',
  'Money Times',
  'Seu Dinheiro',
  'Suno',
  'CNN Brasil',
  'B3 Comunicados',
  'CVM',
  'Bacen',
]

const formats = [
  {
    title: 'Editoriais por ativo',
    description: 'Texto único de 1.500 a 2.000 palavras pra cada ticker coberto. Tese, peers, histórico, FAQ. Construído pra rankear no Google e ensinar de verdade.',
    cadence: 'Por ticker',
    distribution: 'SEO · long-form',
    spec: '~1.800 palavras',
  },
  {
    title: 'News headlines',
    description: 'Post unitário 1080×1350 com manchete editorial, dek e CTA. Distribuído no Instagram, X e LinkedIn no mesmo dia que a notícia rompe.',
    cadence: 'Diário',
    distribution: 'Instagram · X · LinkedIn',
    spec: '1080×1350',
  },
  {
    title: 'Carrosseis didáticos',
    description: 'Carrossel de 8 a 12 slides. Tema profundo, narrativa que prende, dado por trás de cada afirmação. Mais salvo que dado de oração da família.',
    cadence: 'Semanal',
    distribution: 'Instagram · LinkedIn',
    spec: '1080×1350',
  },
  {
    title: 'Briefing do dia',
    description: 'Email matinal de 5 minutos com o que move o mercado, fechamento dos EUA, prévia do dia, agenda macro e três tickers pra ficar de olho.',
    cadence: '06h diariamente',
    distribution: 'Email · App',
    spec: '~600 palavras',
  },
  {
    title: 'Análises long-form',
    description: 'Reportagem mais profunda, 2.500+ palavras. Setor inteiro, comparação multi-empresa, deep-dive em balanço, narrativa de tese. Sai quando vale, não quando enche.',
    cadence: 'Quinzenal',
    distribution: 'Site · Newsletter',
    spec: '~3.000 palavras',
  },
]

const channels = [
  {
    icon: 'i-lucide-app-window',
    kicker: 'Canal #1',
    name: 'Dentro do app',
    description: 'A redação alimenta o feed, o asset page, o briefing in-app e o chat com IA. Conteúdo que dá contexto pro número que o usuário acabou de ver.',
    metric: 'Render direto no produto',
  },
  {
    icon: 'i-lucide-share-2',
    kicker: 'Canal #2',
    name: 'Redes sociais',
    description: 'Instagram, X e LinkedIn no mesmo dia. Carrossel, news headline, citação. Identidade visual da sua marca, voz editorial firme.',
    metric: 'Posts diários · 3 plataformas',
  },
  {
    icon: 'i-lucide-tag',
    kicker: 'Canal #3',
    name: 'White-label',
    description: 'Tenants da Redentia recebem a mesma redação vestida com a marca deles. Plugado por API, RSS ou painel. Mesmo padrão, branding diferente.',
    metric: 'Plugado em 5 marcas hoje',
  },
]

// ============================================================
// PRICING, single 3-plan grid (Só Redação · Combo · Só Plataforma)
// ============================================================
const unifiedPlans = [
  {
    slug: 'newsroom',
    tag: '02',
    name: 'Só Redação',
    description: 'Conteúdo agregado e originais com a sua marca.',
    price: 'R$ 1.800',
    priceUnit: 'mês',
    priceNote: 'Setup zero · saída por API/RSS',
    features: [
      '15 feeds, dedup, tagging por ticker',
      'Atualização a cada 10 min',
      'Suporte por email',
    ],
    cta: 'Quero a redação',
    popular: false,
  },
  {
    slug: 'combo',
    tag: '01 + 02',
    name: 'Combo Plataforma + Redação',
    description: 'Os dois produtos com 15% off no total.',
    price: 'R$ 8.900',
    priceUnit: 'mês',
    priceNote: 'Setup R$ 11.000 · deploy em 7 dias',
    features: [
      'Plataforma white-label completa',
      'Redação plugada na sua marca',
      'Editoriais + carrosseis + briefing',
      'Suporte prioritário em Slack',
    ],
    cta: 'Quero o combo',
    popular: true,
  },
  {
    slug: 'platform',
    tag: '01',
    name: 'Só Plataforma',
    description: 'Frontend, backend, dados B3, calculadoras, IA.',
    price: 'R$ 6.800',
    priceUnit: 'mês',
    priceNote: 'Setup R$ 8.000 · deploy em 7 dias',
    features: [
      'Identidade 100% custom + domínio',
      'Dados B3 + 8 calculadoras + IA',
      'Multi-usuário e push',
    ],
    cta: 'Quero a plataforma',
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
    q: 'A Redentia aparece em algum lugar do meu app?',
    a: 'Em lugar nenhum. Nem favicon, nem footer, nem meta tag. O nome só existe no contrato e na NF que entra na sua contabilidade.',
  },
  {
    q: 'Preciso contratar a plataforma pra ter a redação?',
    a: 'Não. Os dois produtos são independentes. Você pode pegar só a redação pra alimentar o seu site, suas redes ou sua newsletter, mesmo sem ter tenant white-label conosco. Quem pega os dois ganha 15% off no combo.',
  },
  {
    q: 'O conteúdo da redação é original ou agregado?',
    a: 'Os dois. Agregamos 15 feeds RSS com dedup e tagging por ticker. Originamos editoriais por ativo, carrosseis, news posts e briefing diário escritos pela equipe. Tudo separado e sinalizado, nunca passamos agregação como original.',
  },
  {
    q: 'O que acontece se eu cancelar?',
    a: 'Você tem 30 dias pra exportar tudo (banco de dados, brand config, ativos do design). Depois disso, o tenant é desativado mas a base fica arquivada por 90 dias caso você mude de ideia.',
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

<template>
  <NuxtLayout name="api-portal">
    <div
      class="rd-root relative min-h-screen overflow-hidden"
      :style="{ backgroundColor: C.background, color: C.text, fontFamily: F.body }"
    >
      <!-- ============================================================
           HEADER
           ============================================================ -->
      <header
        class="sticky top-0 z-40 border-b backdrop-blur-xl"
        :style="{ borderColor: `${C.border}80`, backgroundColor: `${C.background}D0` }"
      >
        <div class="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-6 md:px-10">
          <NuxtLink to="/redacao" class="flex items-center gap-3">
            <BrandLogo variant="icon" class="size-7" />
            <span class="font-mono-tab text-[12px] uppercase tracking-[0.18em]" :style="{ color: C.text }">
              REDENTIA<span :style="{ color: C.primary }">.REDACAO</span>
            </span>
          </NuxtLink>
          <nav class="hidden items-center gap-7 md:flex">
            <a href="#manifesto" class="text-[13px] transition-colors hover:opacity-70" :style="{ color: C.textMuted }">
              Manifesto
            </a>
            <a href="#cobertura" class="text-[13px] transition-colors hover:opacity-70" :style="{ color: C.textMuted }">
              Cobertura
            </a>
            <a href="#formatos" class="text-[13px] transition-colors hover:opacity-70" :style="{ color: C.textMuted }">
              Formatos
            </a>
            <a href="#distribuicao" class="text-[13px] transition-colors hover:opacity-70" :style="{ color: C.textMuted }">
              Distribuição
            </a>
            <NuxtLink to="/whitelabel" class="text-[13px] transition-colors hover:opacity-70" :style="{ color: C.textMuted }">
              White-label
            </NuxtLink>
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
            Falar com a redação →
          </button>
        </div>
      </header>

      <!-- ============================================================
           HERO, masthead-style
           ============================================================ -->
      <section class="relative overflow-hidden">
        <div class="pointer-events-none absolute inset-0">
          <div
            class="absolute left-1/2 top-0 h-[700px] w-[1100px] -translate-x-1/2 rounded-full blur-3xl opacity-15"
            :style="{ background: `radial-gradient(ellipse at center, ${C.primary}, transparent 65%)` }"
          />
        </div>

        <div class="relative mx-auto max-w-6xl px-6 pb-20 pt-20 md:px-10 md:pb-28 md:pt-28">
          <!-- Masthead bar -->
          <div
            class="mb-12 flex flex-col items-center justify-between gap-3 border-y py-4 sm:flex-row"
            :style="{ borderColor: `${C.border}80` }"
          >
            <div class="flex items-center gap-4 text-[11px] uppercase tracking-[0.22em]" :style="{ color: C.textMuted }">
              <span :style="{ color: C.primary }">Edição #{{ editionNumber }}</span>
              <span class="h-px w-8" :style="{ backgroundColor: C.border }" />
              <span>{{ todayLabel }}</span>
            </div>
            <div class="flex items-center gap-4 text-[11px] uppercase tracking-[0.22em]" :style="{ color: C.textMuted }">
              <span class="relative flex size-1.5">
                <span class="absolute inline-flex size-1.5 motion-safe:animate-ping rounded-full opacity-75" :style="{ backgroundColor: C.primary }" />
                <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: C.primary }" />
              </span>
              <span :style="{ color: C.primary }">No ar agora</span>
              <span class="h-px w-8" :style="{ backgroundColor: C.border }" />
              <span>15 feeds · 7 fontes</span>
            </div>
          </div>

          <!-- Eyebrow -->
          <div class="mb-8 text-center text-[11px] uppercase tracking-[0.32em]" :style="{ color: C.primary, fontFamily: F.mono }">
            ⎯⎯ A redação financeira da Redentia ⎯⎯
          </div>

          <!-- Title -->
          <h1
            class="mb-10 text-center leading-[0.86] tracking-tighter"
            :style="{
              color: C.text,
              fontFamily: F.display,
              fontSize: 'clamp(3rem, 9vw, 8rem)',
            }"
          >
            Jornalismo que<br />
            <span class="italic" :style="{ color: C.primary }">cabe na sua carteira.</span>
          </h1>

          <!-- Subtitle -->
          <p class="mx-auto mb-14 max-w-2xl text-center text-[18px] leading-[1.55] md:text-[20px]" :style="{ color: `${C.text}C0` }">
            Notícias, análises e editoriais de mercado escritos pra investidor brasileiro, sem coluna social, sem hype, sem dois meta-parágrafos antes do número. Lemos as fontes pra você ler menos.
          </p>

          <!-- CTAs -->
          <div class="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <NuxtLink
              to="/help"
              class="group inline-flex items-center gap-3 rounded-full px-8 py-4 text-[14px] font-semibold transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5"
              :style="{
                backgroundColor: C.primary,
                color: C.background,
                boxShadow: `0 16px 50px -16px ${C.primary}A0`,
              }"
            >
              Ler a edição de hoje
              <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
            </NuxtLink>
            <a
              href="#formatos"
              class="inline-flex items-center gap-2 px-2 py-2 text-[14px] font-medium transition-opacity hover:opacity-70"
              :style="{ color: C.text }"
            >
              <span class="border-b pb-0.5" :style="{ borderColor: C.text }">Ver formatos editoriais</span>
              <span>↓</span>
            </a>
          </div>

          <!-- Numbers strip -->
          <div
            class="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border md:grid-cols-4"
            :style="{ borderColor: C.border, backgroundColor: C.border }"
          >
            <div
              v-for="stat in heroStats"
              :key="stat.label"
              class="flex flex-col gap-2 p-6 md:p-8"
              :style="{ backgroundColor: C.background }"
            >
              <div
                class="tabular-nums leading-none tracking-tight"
                :style="{
                  color: C.text,
                  fontFamily: F.display,
                  fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                }"
              >
                {{ stat.value }}
              </div>
              <div class="text-[11px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
                {{ stat.label }}
              </div>
              <div class="text-[12px] leading-relaxed" :style="{ color: `${C.text}A0` }">
                {{ stat.note }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           MANIFESTO
           ============================================================ -->
      <section
        id="manifesto"
        class="relative border-y"
        :style="{ borderColor: C.border, backgroundColor: C.surfaceLight }"
      >
        <div class="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-12 md:gap-16 md:px-10 md:py-32">
          <div class="md:col-span-5">
            <div class="text-[12px] uppercase tracking-[0.22em]" :style="{ color: C.primary }">, Manifesto</div>
            <h2
              class="mt-4 leading-[0.95] tracking-tight"
              :style="{
                color: C.text,
                fontFamily: F.display,
                fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
              }"
            >
              Não somos influencer, não somos sell-side.<br />
              <span class="italic" :style="{ color: C.primary }">Somos redação.</span>
            </h2>
          </div>
          <div class="space-y-6 text-[15px] leading-relaxed md:col-span-7" :style="{ color: `${C.text}D0` }">
            <p>
              <span
                class="float-left mr-3 mt-1 leading-[0.85]"
                :style="{
                  color: C.primary,
                  fontFamily: F.display,
                  fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                }"
              >O</span>
              investidor brasileiro convive com dois extremos: o relatório do banco que ninguém lê e o stories do influencer que ninguém deveria ler. No meio, falta uma redação. Profissional, factual, com horário de fechamento.
            </p>
            <p>
              A Redentia escreve sobre mercado como jornal sério deveria escrever, com data, hora, fonte e contexto, mas com a leveza de quem entende que o leitor está na fila do banco ou no Uber. Texto curto. Número antes do adjetivo. Conclusão na primeira linha.
            </p>
            <p>
              Cobrimos 15 feeds, 7 fontes, mais de 100 tickers. Originamos editoriais por ativo, carrosseis, posts de notícia e o briefing do dia. Tudo escrito por uma redação que conhece a B3 melhor que a Faria Lima conhece a Faria Lima.
            </p>
            <div class="flex items-center gap-3 pt-4 text-[12px] uppercase tracking-[0.2em]" :style="{ color: C.textMuted }">
              <span class="h-px w-12" :style="{ backgroundColor: C.border }" />
              <span>Redação Redentia</span>
              <span class="h-px w-12" :style="{ backgroundColor: C.border }" />
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           COBERTURA, what we cover
           ============================================================ -->
      <section
        id="cobertura"
        class="relative border-b"
        :style="{ borderColor: C.border }"
      >
        <div class="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <div class="mb-16 grid items-end gap-8 md:grid-cols-12">
            <div class="md:col-span-7">
              <div class="text-[12px] uppercase tracking-[0.22em]" :style="{ color: C.primary }">, O que cobrimos</div>
              <h2
                class="mt-4 leading-[0.95] tracking-tight"
                :style="{
                  color: C.text,
                  fontFamily: F.display,
                  fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                }"
              >
                Da Selic ao small cap<br />
                <span class="italic" :style="{ color: C.primary }">de 200 milhões.</span>
              </h2>
            </div>
            <p class="text-[15px] leading-relaxed md:col-span-5" :style="{ color: `${C.text}B0` }">
              Renda variável brasileira primeiro. Macro quando importa pro investidor PF. Crypto e renda fixa entram quando o número justifica, não quando a manchete clica.
            </p>
          </div>

          <div class="grid gap-px overflow-hidden rounded-2xl border md:grid-cols-3" :style="{ borderColor: C.border, backgroundColor: C.border }">
            <div
              v-for="beat in beats"
              :key="beat.title"
              class="flex flex-col gap-4 p-7 md:p-9"
              :style="{ backgroundColor: C.background }"
            >
              <UIcon :name="beat.icon" class="size-6" :style="{ color: C.primary }" />
              <h3 class="text-[20px] font-medium leading-tight tracking-tight" :style="{ color: C.text, letterSpacing: '-0.005em' }">
                {{ beat.title }}
              </h3>
              <p class="text-[13px] leading-relaxed" :style="{ color: C.textMuted }">
                {{ beat.description }}
              </p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span
                  v-for="tag in beat.tags"
                  :key="tag"
                  class="rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]"
                  :style="{ borderColor: C.border, color: C.textMuted }"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <!-- Sources strip -->
          <div class="mt-12 border-t pt-10" :style="{ borderColor: `${C.border}60` }">
            <p class="mb-6 text-[11px] uppercase tracking-[0.22em]" :style="{ color: C.textMuted }">
              Fontes monitoradas em tempo real
            </p>
            <div class="flex flex-wrap items-center gap-x-8 gap-y-3">
              <span
                v-for="src in sources"
                :key="src"
                class="text-[16px] leading-none tracking-tight"
                :style="{ color: `${C.text}A0`, fontFamily: F.display, fontStyle: 'italic' }"
              >
                {{ src }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           FORMATOS, editorial product line
           ============================================================ -->
      <section
        id="formatos"
        class="relative border-b"
        :style="{ borderColor: C.border, backgroundColor: C.surfaceLight }"
      >
        <div class="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <div class="mb-16 max-w-3xl">
            <div class="text-[12px] uppercase tracking-[0.22em]" :style="{ color: C.primary }">, Formatos editoriais</div>
            <h2
              class="mt-4 leading-[0.95] tracking-tight"
              :style="{
                color: C.text,
                fontFamily: F.display,
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              }"
            >
              Cinco formatos.<br />
              <span class="italic" :style="{ color: C.primary }">Uma redação só.</span>
            </h2>
            <p class="mt-6 text-[15px] leading-relaxed" :style="{ color: `${C.text}B0` }">
              Texto longo pra Google. Carrossel pra Instagram. Post unitário pra X. Editorial por ativo pra SEO de cauda longa. Briefing pro app. Mesma voz, mesmo padrão.
            </p>
          </div>

          <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <article
              v-for="(fmt, idx) in formats"
              :key="fmt.title"
              class="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-7 transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-1"
              :class="idx === 0 || idx === 4 ? 'lg:col-span-2' : ''"
              :style="{
                borderColor: C.border,
                backgroundColor: C.background,
              }"
            >
              <div
                class="absolute right-0 top-0 size-32 rounded-full opacity-20 blur-3xl"
                :style="{ background: C.primary }"
              />
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
                <h3
                  class="text-[26px] leading-[1.05] tracking-tight md:text-[30px]"
                  :style="{ color: C.text, fontFamily: F.display }"
                >
                  {{ fmt.title }}
                </h3>
                <p class="mt-3 text-[14px] leading-relaxed" :style="{ color: `${C.text}B0` }">
                  {{ fmt.description }}
                </p>
                <ul class="mt-5 flex flex-col gap-2 text-[13px]" :style="{ color: `${C.text}D0` }">
                  <li v-for="b in fmt.bullets" :key="b" class="flex items-start gap-2">
                    <UIcon name="i-lucide-check" class="mt-0.5 size-4 shrink-0" :style="{ color: C.primary }" />
                    <span>{{ b }}</span>
                  </li>
                </ul>
                <div class="mt-auto flex items-center justify-between border-t pt-5" :style="{ borderColor: `${C.border}80`, marginTop: '1.5rem' }">
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
      </section>

      <!-- ============================================================
           FRONT PAGE, live news from /api/news/latest
           ============================================================ -->
      <section class="relative border-b" :style="{ borderColor: C.border }">
        <div class="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <!-- Editorial masthead for the live edition -->
          <div
            class="mb-12 flex flex-col items-start justify-between gap-6 border-b pb-8 md:flex-row md:items-end md:gap-12"
            :style="{ borderColor: `${C.border}80` }"
          >
            <div class="max-w-3xl">
              <div class="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em]" :style="{ color: C.primary, fontFamily: F.mono }">
                <span class="relative flex size-1.5">
                  <span class="absolute inline-flex size-1.5 motion-safe:animate-ping rounded-full opacity-75" :style="{ backgroundColor: C.primary }" />
                  <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: C.primary }" />
                </span>
                <span>, A primeira página · ao vivo</span>
              </div>
              <h2
                class="mt-4 leading-[0.95] tracking-tight"
                :style="{
                  color: C.text,
                  fontFamily: F.display,
                  fontSize: 'clamp(2.25rem, 5.5vw, 4.5rem)',
                }"
              >
                Manchetes desta hora,<br />
                <span class="italic" :style="{ color: C.primary }">do mercado pra você.</span>
              </h2>
              <p class="mt-6 max-w-2xl text-[15px] leading-relaxed" :style="{ color: `${C.text}B0` }">
                Feed monitorado em tempo real. As notícias abaixo vêm direto da redação, agrupadas pelos tickers que movem o dia. Mesmo conteúdo que serve o app principal, exposto aqui pra você ver o ritmo da casa.
              </p>
            </div>
            <div class="flex flex-col items-start gap-2 text-[11px] uppercase tracking-[0.2em] md:items-end md:text-right" :style="{ color: C.textMuted }">
              <span class="tabular-nums" :style="{ color: C.primary, fontFamily: F.mono }">edição #{{ editionNumber }}</span>
              <span>{{ todayLabel }}</span>
              <span>15 feeds · 7 fontes · 100+ tickers</span>
            </div>
          </div>

          <!-- Live news section, same component used on the home page -->
          <!-- Vars overridden to keep the news block consistent with the dark amber masthead -->
          <div
            class="rd-news"
            :style="{
              '--brand-primary': C.primary,
              '--brand-text': C.text,
              '--brand-text-muted': C.textMuted,
              '--brand-surface': C.surface,
              '--brand-surface-hover': C.surfaceLight,
              '--brand-border': C.border,
              '--text-heading': C.text,
              '--text-body': C.textMuted,
              '--text-muted': C.textMuted,
              '--bg-elevated': C.surface,
              '--border-default': C.border,
              '--border-subtle': `${C.border}80`,
              '--text-on-primary': C.background,
            }"
          >
            <MoleculesNewsSection />
          </div>
        </div>
      </section>

      <!-- ============================================================
           DISTRIBUICAO, where it ships
           ============================================================ -->
      <section
        id="distribuicao"
        class="relative border-b"
        :style="{ borderColor: C.border, backgroundColor: C.surfaceLight }"
      >
        <div class="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <div class="mb-16 grid items-end gap-8 md:grid-cols-12">
            <div class="md:col-span-7">
              <div class="text-[12px] uppercase tracking-[0.22em]" :style="{ color: C.primary }">, Distribuição</div>
              <h2
                class="mt-4 leading-[0.95] tracking-tight"
                :style="{
                  color: C.text,
                  fontFamily: F.display,
                  fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                }"
              >
                A mesma redação,<br />
                <span class="italic" :style="{ color: C.primary }">três canais de saída.</span>
              </h2>
            </div>
            <p class="text-[15px] leading-relaxed md:col-span-5" :style="{ color: `${C.text}B0` }">
              O texto sai uma vez e roda em todo lugar: dentro do app, nas redes sociais e na plataforma white-label do tenant que contratou. Mesmo padrão, mesma fonte, marca diferente.
            </p>
          </div>

          <div class="grid gap-5 md:grid-cols-3">
            <div
              v-for="ch in channels"
              :key="ch.name"
              class="relative flex flex-col gap-5 overflow-hidden rounded-3xl border p-8 md:p-9"
              :style="{ borderColor: C.border, backgroundColor: C.background }"
            >
              <div class="flex items-center gap-3">
                <UIcon :name="ch.icon" class="size-5" :style="{ color: C.primary }" />
                <span class="text-[11px] uppercase tracking-[0.2em]" :style="{ color: C.primary }">
                  {{ ch.kicker }}
                </span>
              </div>
              <h3
                class="text-[28px] leading-tight tracking-tight"
                :style="{ color: C.text, fontFamily: F.display }"
              >
                {{ ch.name }}
              </h3>
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
      </section>

      <!-- ============================================================
           PRINCIPIOS, editorial line
           ============================================================ -->
      <section class="relative border-b" :style="{ borderColor: C.border }">
        <div class="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
          <div class="mb-12 max-w-3xl">
            <div class="text-[12px] uppercase tracking-[0.22em]" :style="{ color: C.primary }">, Linha editorial</div>
            <h2
              class="mt-4 leading-[0.95] tracking-tight"
              :style="{
                color: C.text,
                fontFamily: F.display,
                fontSize: 'clamp(2.25rem, 5vw, 4rem)',
              }"
            >
              Seis regras que<br />
              <span class="italic" :style="{ color: C.primary }">não negociamos.</span>
            </h2>
          </div>

          <div class="grid gap-px overflow-hidden rounded-2xl border md:grid-cols-2" :style="{ borderColor: C.border, backgroundColor: C.border }">
            <div
              v-for="(p, idx) in principles"
              :key="p.title"
              class="flex gap-5 p-7 md:p-8"
              :style="{ backgroundColor: C.background }"
            >
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-full border tabular-nums text-[14px]"
                :style="{ borderColor: `${C.primary}80`, color: C.primary, fontFamily: F.display }"
              >
                {{ idx + 1 }}
              </div>
              <div>
                <h3 class="text-[16px] font-medium tracking-tight" :style="{ color: C.text }">
                  {{ p.title }}
                </h3>
                <p class="mt-2 text-[13px] leading-relaxed" :style="{ color: C.textMuted }">
                  {{ p.body }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           NEWSROOM-AS-A-SERVICE, B2B pitch
           ============================================================ -->
      <section
        class="relative overflow-hidden border-b"
        :style="{ borderColor: C.border, backgroundColor: C.surface }"
      >
        <div class="pointer-events-none absolute inset-0">
          <div
            class="absolute right-0 top-0 h-[600px] w-[600px] rounded-full blur-3xl opacity-15"
            :style="{ background: `radial-gradient(circle, ${C.primary}, transparent 60%)` }"
          />
        </div>
        <div class="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-12 md:gap-16 md:px-10 md:py-32">
          <div class="md:col-span-5">
            <div class="text-[12px] uppercase tracking-[0.22em]" :style="{ color: C.primary }">, Newsroom-as-a-service</div>
            <h2
              class="mt-4 leading-[0.95] tracking-tight"
              :style="{
                color: C.text,
                fontFamily: F.display,
                fontSize: 'clamp(2.25rem, 5vw, 4rem)',
              }"
            >
              Plug a redação<br />
              <span class="italic" :style="{ color: C.primary }">na sua marca.</span>
            </h2>
            <p class="mt-6 text-[15px] leading-relaxed" :style="{ color: `${C.text}B0` }">
              Você tem audiência ou base de clientes mas não tem redação? A Redentia pode entregar conteúdo financeiro completo no seu domínio: agregação de notícias com curadoria, editoriais únicos por ticker, carrosseis sociais semanais, briefing diário pra newsletter.
            </p>
            <p class="mt-4 text-[15px] leading-relaxed" :style="{ color: `${C.text}B0` }">
              Mesmo padrão jornalístico do app principal, vestido com a sua identidade. Saída via API, RSS ou painel.
            </p>
            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                class="group inline-flex items-center justify-center gap-3 rounded-full px-6 py-3.5 text-[13px] font-semibold transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5"
                :style="{
                  backgroundColor: C.primary,
                  color: C.background,
                  boxShadow: `0 12px 40px -16px ${C.primary}A0`,
                }"
                @click="openLeadModal('newsroom')"
              >
                Quero a redação na minha marca
                <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
              </button>
              <NuxtLink
                to="/whitelabel"
                class="inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3.5 text-[13px] font-medium transition-opacity hover:opacity-70"
                :style="{ borderColor: C.border, color: C.text }"
              >
                Ver plataforma white-label →
              </NuxtLink>
            </div>
          </div>

          <div class="md:col-span-7">
            <div
              class="grid gap-px overflow-hidden rounded-2xl border md:grid-cols-2"
              :style="{ borderColor: C.border, backgroundColor: C.border }"
            >
              <div
                v-for="d in deliverables"
                :key="d.title"
                class="flex flex-col gap-3 p-7"
                :style="{ backgroundColor: C.background }"
              >
                <div class="flex items-center gap-3">
                  <UIcon :name="d.icon" class="size-5" :style="{ color: C.primary }" />
                  <span class="text-[10px] uppercase tracking-[0.2em]" :style="{ color: C.primary }">
                    {{ d.tag }}
                  </span>
                </div>
                <h3 class="text-[18px] font-medium leading-tight tracking-tight" :style="{ color: C.text }">
                  {{ d.title }}
                </h3>
                <p class="text-[13px] leading-relaxed" :style="{ color: C.textMuted }">
                  {{ d.body }}
                </p>
                <div class="mt-2 text-[11px] uppercase tracking-[0.16em]" :style="{ color: C.textMuted, fontFamily: F.mono }">
                  {{ d.cadence }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================
           PRICING / planos
           ============================================================ -->
      <section class="relative border-b" :style="{ borderColor: C.border }">
        <div class="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-28">
          <div class="mb-14 max-w-2xl">
            <h2
              class="leading-[0.95] tracking-tight"
              :style="{
                color: C.text,
                fontFamily: F.display,
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              }"
            >
              Pacotes da redação.
            </h2>
            <p class="mt-6 text-[15px] leading-relaxed" :style="{ color: C.textMuted }">
              Pode contratar só conteúdo, só infra ou os dois. Mensal, sem fidelidade.
            </p>
          </div>

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
              <div
                v-if="plan.popular"
                class="absolute inset-x-0 top-0 h-0.5"
                :style="{ backgroundColor: C.primary }"
              />
              <div class="flex items-center gap-3">
                <h3 class="text-[15px] font-medium" :style="{ color: C.text }">
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
              <div class="flex items-baseline gap-1">
                <span
                  class="tabular-nums leading-none tracking-tight"
                  :style="{
                    color: C.text,
                    fontFamily: F.display,
                    fontSize: 'clamp(2.75rem, 5vw, 4rem)',
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
           FAQ
           ============================================================ -->
      <section class="relative border-b" :style="{ borderColor: C.border }">
        <div class="mx-auto max-w-4xl px-6 py-20 md:px-10 md:py-28">
          <h2
            class="mb-14 leading-[0.95] tracking-tight"
            :style="{
              color: C.text,
              fontFamily: F.display,
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            }"
          >
            Perguntas que vocês fazem.
          </h2>
          <div>
            <details
              v-for="faq in faqs"
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
           FINAL CTA
           ============================================================ -->
      <section class="relative overflow-hidden" :style="{ backgroundColor: C.background }">
        <div class="pointer-events-none absolute inset-0">
          <div
            class="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-25"
            :style="{ background: `radial-gradient(circle, ${C.primary}, transparent 60%)` }"
          />
        </div>
        <div class="relative mx-auto max-w-4xl px-6 py-28 text-center md:px-10 md:py-36">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em]" :style="{ borderColor: `${C.primary}50`, backgroundColor: `${C.primary}10`, color: C.primary }">
            <span class="size-1.5 motion-safe:animate-pulse rounded-full" :style="{ backgroundColor: C.primary }" />
            Próxima edição em poucas horas
          </div>
          <h2
            class="leading-[0.92] tracking-tight"
            :style="{
              color: C.text,
              fontFamily: F.display,
              fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
            }"
          >
            A redação<br />
            <span class="italic" :style="{ color: C.primary }">não dorme. Você devia.</span>
          </h2>
          <p class="mx-auto mt-8 max-w-xl text-[16px]" :style="{ color: `${C.text}B0` }">
            Acompanhe o mercado em parágrafo curto, manchete honesta, número antes do adjetivo. Pelo app ou pela sua própria marca.
          </p>
          <div class="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <NuxtLink
              to="/help"
              class="group inline-flex items-center gap-3 rounded-full px-10 py-5 text-[15px] font-semibold transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:-translate-y-0.5"
              :style="{
                backgroundColor: C.primary,
                color: C.background,
                boxShadow: `0 20px 60px -15px ${C.primary}90`,
              }"
            >
              Ler a edição de hoje
              <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
            </NuxtLink>
            <button
              class="inline-flex items-center gap-2 px-2 py-2 text-[14px] font-medium transition-opacity hover:opacity-70"
              :style="{ color: C.text }"
              @click="openLeadModal('newsroom')"
            >
              <UIcon name="i-lucide-newspaper" class="size-4" />
              <span class="border-b pb-0.5" :style="{ borderColor: C.text }">Falar com a redação</span>
            </button>
          </div>
          <p class="mt-16 text-[12px] tracking-wider" :style="{ color: C.textMuted }">
            redacao@redentia.com.br · redentia.com.br/redacao
          </p>
        </div>
      </section>
    </div>

    <MoleculesLeadCaptureModal
      v-model:open="leadModalOpen"
      source="other"
      :plan="leadModalPlan"
      title="Falar com a redação"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
const leadModalOpen = ref(false)
const leadModalPlan = ref<string | undefined>(undefined)

function openLeadModal(plan?: string) {
  leadModalPlan.value = plan
  leadModalOpen.value = true
}

const C = {
  primary: '#F5A623',
  background: '#0A0B0E',
  surface: '#14161C',
  surfaceLight: '#0F1116',
  border: '#2A2E39',
  text: '#E8EAED',
  textMuted: '#8B92A7',
}

const F = {
  body: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  display: "'Instrument Serif', 'Times New Roman', serif",
  mono: "'JetBrains Mono', monospace",
}

function computeEdition() {
  const start = new Date('2025-01-01').getTime()
  return Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24))
}
function computeTodayLabel() {
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const d = new Date()
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`
}

const editionNumber = ref<number | string>('—')
const todayLabel = ref('')

onMounted(() => {
  editionNumber.value = computeEdition()
  todayLabel.value = computeTodayLabel()
})

const heroStats = [
  { value: '15', label: 'Feeds RSS', note: 'Monitorados a cada 10 minutos' },
  { value: '7', label: 'Fontes', note: 'InfoMoney, Valor, Brazil Journal, Suno…' },
  { value: '100+', label: 'Tickers', note: 'Empresas e setores acompanhados' },
  { value: '24/7', label: 'Cobertura', note: 'Pré-mercado, intraday, after-hours' },
]

const beats = [
  {
    icon: 'i-lucide-trending-up',
    title: 'Renda variável',
    description: 'Ações, ETFs e FIIs da B3. Dividendos, balanços, fato relevante, recompras, M&A. A casa lê o RI antes do release sair.',
    tags: ['Ações', 'FIIs', 'ETFs', 'Dividendos'],
  },
  {
    icon: 'i-lucide-globe',
    title: 'Macro Brasil',
    description: 'Selic, IPCA, fiscal, câmbio, atividade. O que muda na curva de juros e como isso pinga na carteira do PF.',
    tags: ['Selic', 'IPCA', 'Câmbio', 'Fiscal'],
  },
  {
    icon: 'i-lucide-banknote',
    title: 'Renda fixa',
    description: 'Tesouro Direto, CDBs, debêntures. Quando o pré-fixado paga prêmio. Quando o IPCA+ não compensa o risco. Sem clickbait.',
    tags: ['Tesouro', 'CDB', 'IPCA+', 'CRI/CRA'],
  },
  {
    icon: 'i-lucide-bitcoin',
    title: 'Cripto seletivo',
    description: 'BTC e ETH com lente de ativo, não com lente de torcida. Stablecoins, ETFs spot, regulação CVM/Receita.',
    tags: ['BTC', 'ETF spot', 'Stablecoin'],
  },
  {
    icon: 'i-lucide-globe-2',
    title: 'Bolsas globais',
    description: 'S&P 500, Nasdaq, T-bond e dólar. Big Tech, Fed, eleições. Foco no que afeta o investidor brasileiro com BDR ou exposição.',
    tags: ['S&P', 'NASDAQ', 'Fed', 'BDR'],
  },
  {
    icon: 'i-lucide-newspaper',
    title: 'Bastidores do mercado',
    description: 'IPOs, follow-ons, OPAs, mudanças de management. Quem comprou, quem vendeu. Conteúdo que você só lê em call do buy-side.',
    tags: ['IPO', 'M&A', 'OPA', 'Buy-side'],
  },
]

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
    bullets: [
      'Tese de investimento sem cliché de release',
      'Peers comparados com número, não opinião',
      'FAQ baseado em busca real do investidor PF',
    ],
  },
  {
    title: 'News headlines',
    description: 'Post unitário 1080×1350 com manchete editorial, dek e CTA. Distribuído no Instagram, X e LinkedIn no mesmo dia que a notícia rompe.',
    cadence: 'Diário',
    distribution: 'Instagram · X · LinkedIn',
    spec: '1080×1350',
    bullets: [
      'Manchete factual, sem caps lock e sem hype',
      'Dek explica em 2 linhas o que muda pra carteira',
      'Hashtags por ticker e setor afetado',
    ],
  },
  {
    title: 'Carrosseis didáticos',
    description: 'Carrossel de 8 a 12 slides. Tema profundo, narrativa que prende, dado por trás de cada afirmação. Mais salvo que dado de oração da família.',
    cadence: 'Semanal',
    distribution: 'Instagram · LinkedIn',
    spec: '1080×1350',
    bullets: [
      'Hook que justifica o swipe pro slide 2',
      'CTA final pro app sem jeito de panfleto',
      'Cada número checado em fonte primária',
    ],
  },
  {
    title: 'Briefing do dia',
    description: 'Email matinal de 5 minutos com o que move o mercado, fechamento da véspera nos EUA, prévia do dia, agenda macro e três tickers pra ficar de olho.',
    cadence: '06h diariamente',
    distribution: 'Email · App',
    spec: '~600 palavras',
    bullets: [
      'Antes do mercado abrir, sempre',
      'Agenda macro do Brasil e EUA',
      'Três tickers em destaque com motivo',
    ],
  },
  {
    title: 'Análises long-form',
    description: 'Reportagem mais profunda, 2.500+ palavras. Setor inteiro, comparação multi-empresa, deep-dive em balanço, narrativa de tese. Sai quando vale, não quando enche.',
    cadence: 'Quinzenal',
    distribution: 'Site · Newsletter',
    spec: '~3.000 palavras',
    bullets: [
      'Sai quando há matéria, não pra cumprir tabela',
      'Citações de release, balanço, transcript',
      'SEO long-tail e backlink natural',
    ],
  },
]

const channels = [
  {
    icon: 'i-lucide-app-window',
    kicker: 'Canal #1',
    name: 'Dentro do app',
    description: 'A redação alimenta o feed, o asset page, o briefing in-app e o chat com IA. Conteúdo que dá contexto pro número que o usuário acabou de ver.',
    metric: 'Render direto no produto Redentia',
  },
  {
    icon: 'i-lucide-share-2',
    kicker: 'Canal #2',
    name: 'Redes sociais',
    description: 'Instagram, X e LinkedIn no mesmo dia. Carrossel, news headline, citação. Identidade visual amarela inconfundível, voz editorial firme.',
    metric: 'Posts diários · 3 plataformas',
  },
  {
    icon: 'i-lucide-tag',
    kicker: 'Canal #3',
    name: 'White-label',
    description: 'Tenants da Redentia recebem a mesma redação vestida com a marca deles. Texto plugado por API, RSS ou painel. Mesmo padrão, branding diferente.',
    metric: 'Plugado em 5 marcas hoje',
  },
]

const principles = [
  {
    title: 'Número antes do adjetivo',
    body: 'Se a ação caiu 4,2%, isso vem antes do "forte queda". Adjetivo é tempero. Número é fato.',
  },
  {
    title: 'Conclusão na primeira linha',
    body: 'Lede não é introdução. É manchete em forma de parágrafo. Se o leitor parou ali, ele já sabe o que importa.',
  },
  {
    title: 'Sem hype, sem clickbait',
    body: 'Não escrevemos "BOMBA NA B3" nem "VOCÊ NÃO VAI ACREDITAR". Quem escreve assim merece ser bloqueado. A redação respeita o leitor.',
  },
  {
    title: 'Toda fonte vai pra base',
    body: 'Cada matéria tem URL de origem registrada. Auditável. Se o leitor quiser ir até o release da CVM, o link está lá.',
  },
  {
    title: 'Cobertura > opinião',
    body: 'Não somos coluna. Somos cobertura. Opinião só quando o repórter assina e separa explicitamente análise de notícia.',
  },
  {
    title: 'Curto antes de longo',
    body: 'Texto curto que diz tudo é melhor que texto longo que diz quase. Se cabe em três parágrafos, três parágrafos.',
  },
]

const deliverables = [
  {
    icon: 'i-lucide-rss',
    tag: 'Conteúdo agregado',
    title: 'Notícias com curadoria',
    body: '15 feeds rastreados, deduplicados, classificados por ticker e setor. Você recebe o filtrado, não o cru.',
    cadence: 'Atualiza a cada 10 minutos',
  },
  {
    icon: 'i-lucide-file-text',
    tag: 'Original',
    title: 'Editoriais por ativo',
    body: '1.500 a 2.000 palavras únicas por ticker. Cobre os tickers mais buscados pela sua audiência primeiro.',
    cadence: 'Lote inicial em 30 dias',
  },
  {
    icon: 'i-lucide-image',
    tag: 'Visual',
    title: 'Carrosseis e news posts',
    body: 'Templates redesenhados com a sua paleta. Você recebe PNGs prontos pra postar e o texto da legenda.',
    cadence: '5 a 8 peças por semana',
  },
  {
    icon: 'i-lucide-mail',
    tag: 'Email',
    title: 'Briefing branded',
    body: 'Newsletter matinal com a sua identidade visual no template. Saída via API ou direta no seu ESP.',
    cadence: 'Diário, 06h',
  },
]

const plans = [
  {
    slug: 'feed',
    name: 'Feed',
    description: 'Pra quem quer só o conteúdo bruto, sem branding.',
    price: 'R$ 1.800',
    priceUnit: 'mês',
    priceNote: 'Sem setup',
    features: [
      'Acesso à API de notícias agregadas',
      '15 feeds com dedup e tagging por ticker',
      'Atualização a cada 10 minutos',
      'Exportação em RSS ou JSON',
      'Suporte por email',
    ],
    cta: 'Assinar Feed',
    popular: false,
  },
  {
    slug: 'newsroom',
    name: 'Newsroom',
    description: 'A redação inteira, com a sua marca.',
    price: 'R$ 7.500',
    priceUnit: 'mês',
    priceNote: 'Setup único: R$ 6.000',
    features: [
      'Tudo do Feed, mais:',
      'Editoriais únicos por ticker (lote inicial)',
      'Carrosseis e news posts no seu visual',
      'Briefing diário branded',
      'API + painel + saída por RSS',
      'Suporte prioritário em Slack',
    ],
    cta: 'Quero a Newsroom',
    popular: true,
  },
  {
    slug: 'editorial-anchor',
    name: 'Editorial Anchor',
    description: 'Pra mídia, finfluencer ou casa que quer linha editorial dedicada.',
    price: 'Custom',
    priceUnit: 'tier',
    priceNote: 'Contrato anual · negociado',
    features: [
      'Tudo da Newsroom, mais:',
      'Repórter dedicado meio-período',
      'Pauta colaborativa semanal',
      'Análises long-form a cada 15 dias',
      'Direito de republicação cruzada',
      'Plantão de last-minute em fato relevante',
    ],
    cta: 'Falar com a redação',
    popular: false,
  },
]

const faqs = [
  {
    q: 'O conteúdo é original ou agregado?',
    a: 'Os dois. Agregamos 15 feeds RSS com dedup e tagging (canal Feed). Originamos editoriais por ativo, carrosseis, news posts e briefing diário, escritos pela equipe (canal Newsroom). Tudo separado e sinalizado: nunca passamos agregação como original.',
  },
  {
    q: 'Quem escreve?',
    a: 'Time interno de jornalistas e analistas com experiência em buy-side, sell-side e mídia financeira. Modelos de IA entram como assistente de pesquisa e síntese, mas todo texto publicado passa por revisão humana e checagem de fonte primária.',
  },
  {
    q: 'Posso reescrever ou só republicar?',
    a: 'Depende do plano. Feed dá direito de leitura e referência (com link de fonte). Newsroom inclui licença de republicação no seu domínio com a sua marca. Editorial Anchor permite até co-edição da pauta com o seu time.',
  },
  {
    q: 'Quão rápido sai uma manchete?',
    a: 'Notícia de fato relevante ou número macro relevante (Copom, CPI, payroll) entra no feed em até 5 minutos depois da publicação na fonte primária. News post visual fica pronto em até 2 horas. Editorial long-form é planejado, não reativo.',
  },
  {
    q: 'A redação cobre cripto?',
    a: 'Cobrimos BTC, ETH, ETFs spot, regulação CVM e impacto fiscal. Não cobrimos altcoin obscura, NFT pump, nem rugpull semanal. Se isso é um deal-breaker, a Redentia provavelmente não é pra você.',
  },
  {
    q: 'Como funciona o cancelamento?',
    a: 'Mensal, sem fidelidade. Cancelando, você mantém acesso até o fim do ciclo pago. Editoriais por ativo já entregues no plano Newsroom continuam licenciados pra você por 12 meses, mesmo após cancelamento.',
  },
]

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: 'Redação Redentia · Jornalismo financeiro com cobertura da B3',
  description:
    'A redação financeira da Redentia: 15 feeds, 7 fontes, editoriais por ativo, carrosseis, news posts e briefing diário. Conteúdo original com padrão jornalístico, disponível também em white-label para sua marca.',
  path: '/redacao',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Redação', path: '/redacao' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsMediaOrganization',
      name: 'Redação Redentia',
      url: 'https://redentia.com.br/redacao',
      description:
        'Redação financeira da Redentia, com cobertura de renda variável, macro Brasil, renda fixa e mercados globais para o investidor pessoa física brasileiro.',
      areaServed: { '@type': 'Country', name: 'Brasil' },
      knowsLanguage: 'pt-BR',
    },
  ],
})
</script>

<style scoped>
.rd-root {
  font-feature-settings: 'ss01', 'cv11';
}

.rd-root a:focus-visible,
.rd-root button:focus-visible {
  outline: 2px solid #F5A623;
  outline-offset: 4px;
  border-radius: 8px;
}
</style>

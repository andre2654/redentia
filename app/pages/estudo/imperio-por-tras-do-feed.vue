<template>
  <NuxtLayout name="api-portal">
    <div
      class="relative min-h-screen overflow-hidden"
      :style="{ backgroundColor: C.background, color: C.text, fontFamily: F.body }"
    >
      <!-- Ambient depth: grid + radial amber glow + horizontal ticker lines -->
      <div class="pointer-events-none absolute inset-0">
        <div
          class="absolute left-1/2 top-0 h-[800px] w-[1400px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          :style="{ background: `radial-gradient(ellipse at center top, ${C.primary}40, transparent 60%)` }"
        />
        <div
          class="absolute inset-0 opacity-[0.04]"
          :style="{
            backgroundImage: `linear-gradient(${C.text} 1px, transparent 1px), linear-gradient(90deg, ${C.text} 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }"
        />
        <div
          class="absolute inset-0 opacity-20"
          :style="{
            backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, ${C.text}04 2px, ${C.text}04 3px)`,
          }"
        />
      </div>

      <!-- HEADER -->
      <header
        class="sticky top-0 z-40 border-b backdrop-blur-xl"
        :style="{ borderColor: C.border, backgroundColor: `${C.background}CC` }"
      >
        <div class="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 md:px-6">
          <a :href="mainSiteHref" class="flex items-center gap-2">
            <div
              class="flex size-7 items-center justify-center rounded"
              :style="{ backgroundColor: C.primary, color: C.background }"
            >
              <UIcon name="i-lucide-book-open" class="size-4" />
            </div>
            <span
              class="font-mono-tab text-[11px] font-bold uppercase tracking-[0.15em]"
              :style="{ color: C.text }"
            >
              REDENT<span :style="{ color: C.primary }">.IA</span>
            </span>
          </a>
          <nav class="hidden items-center gap-5 md:flex">
            <NuxtLink
              to="/estudo"
              class="font-mono-tab text-[11px] uppercase tracking-[0.15em] transition-colors hover:opacity-70"
              :style="{ color: C.textMuted }"
            >
              Estudos
            </NuxtLink>
            <span :style="{ color: C.border }">·</span>
            <span
              class="font-mono-tab text-[11px] uppercase tracking-[0.15em]"
              :style="{ color: C.text }"
            >
              {{ ebook.plainTitle }}
            </span>
          </nav>
          <div class="flex-1" />
          <a
            :href="mainSiteHref"
            class="inline-flex items-center gap-2 font-mono-tab text-[11px] uppercase tracking-[0.15em] transition-colors hover:opacity-70"
            :style="{ color: C.textMuted }"
          >
            <UIcon name="i-lucide-arrow-left" class="size-3" />
            Voltar pro site
          </a>
        </div>
      </header>

      <!-- §1 · HERO, cover reveal -->
      <section class="relative mx-auto max-w-6xl px-6 pb-20 pt-16 md:px-10 md:pt-24">
        <div class="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-start lg:gap-20">
          <!-- LEFT: Copy -->
          <div>
            <div class="mb-8 flex flex-wrap items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.18em]">
              <span class="flex items-center gap-1.5" :style="{ color: C.primary }">
                <span class="relative flex size-1.5">
                  <span
                    class="absolute inline-flex size-1.5 motion-safe:animate-ping rounded-full opacity-75"
                    :style="{ backgroundColor: C.primary }"
                  />
                  <span
                    class="relative inline-flex size-1.5 rounded-full"
                    :style="{ backgroundColor: C.primary }"
                  />
                </span>
                {{ ebook.eyebrow }}
              </span>
              <span :style="{ color: C.border }">·</span>
              <span :style="{ color: C.textMuted }">{{ ebook.edition.toUpperCase() }}</span>
            </div>

            <h1
              class="mb-8 text-[44px] leading-[0.95] tracking-tight sm:text-[60px] md:text-[76px] lg:text-[84px]"
              :style="{ color: C.text, fontFamily: F.display }"
            >
              {{ ebook.title }}<br />
              <em :style="{ color: C.primary }">{{ ebook.titleAccent }}</em>
            </h1>

            <p
              class="mb-6 max-w-xl text-[15px] leading-[1.7] md:text-[17px]"
              :style="{ color: C.textMuted }"
            >
              {{ ebook.subtitle }}
            </p>

            <!-- Author byline + freshness signal. "Last updated" shown
                 prominently because dated content ranks and gets cited
                 more than undated content across both Google and LLMs. -->
            <div class="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono-tab text-[11px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
              <span class="inline-flex items-center gap-2">
                <UIcon name="i-lucide-file-pen-line" class="size-3.5" :style="{ color: C.primary }" />
                <span>POR <strong :style="{ color: C.text }">{{ ebook.seo.authorName.toUpperCase() }}</strong></span>
              </span>
              <span :style="{ color: C.border }">·</span>
              <time :datetime="ebook.publishedAt">
                PUBLICADO {{ formatDate(ebook.publishedAt) }}
              </time>
              <span :style="{ color: C.border }">·</span>
              <time :datetime="ebook.updatedAt" :style="{ color: C.primary }">
                ATUALIZADO {{ formatDate(ebook.updatedAt) }}
              </time>
            </div>

            <!-- Meta chips -->
            <div class="mb-10 flex flex-wrap items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.15em]">
              <span
                class="inline-flex items-center gap-2 rounded-sm border px-2.5 py-1.5"
                :style="{ borderColor: C.border, color: C.textMuted }"
              >
                <UIcon name="i-lucide-file-text" class="size-3" :style="{ color: C.primary }" />
                {{ ebook.pages }} PÁGINAS
              </span>
              <span
                class="inline-flex items-center gap-2 rounded-sm border px-2.5 py-1.5"
                :style="{ borderColor: C.border, color: C.textMuted }"
              >
                <UIcon name="i-lucide-clock" class="size-3" :style="{ color: C.primary }" />
                ~{{ ebook.readingMinutes }} MIN DE LEITURA
              </span>
              <span
                class="inline-flex items-center gap-2 rounded-sm border px-2.5 py-1.5"
                :style="{ borderColor: C.border, color: C.textMuted }"
              >
                <UIcon name="i-lucide-download" class="size-3" :style="{ color: C.primary }" />
                PDF · GRATUITO
              </span>
            </div>

            <!-- Inline CTA: anchor to form -->
            <a
              href="#baixar"
              class="group inline-flex items-center gap-3 rounded-sm px-6 py-4 font-mono-tab text-[12px] font-bold uppercase tracking-[0.15em] transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:opacity-90"
              :style="{ backgroundColor: C.primary, color: C.background }"
            >
              [F1] BAIXAR O ESTUDO AGORA
              <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform group-hover:translate-x-1" />
            </a>
            <p class="mt-3 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
              &gt; GRATUITO · SEM CARTÃO · LINK DIRETO POR EMAIL
            </p>
          </div>

          <!-- RIGHT: Cover, real image when available, CSS mockup as fallback -->
          <div class="relative">
            <img
              v-if="ebook.coverImage"
              :src="ebook.coverImage"
              :alt="`Capa: ${ebook.title} ${ebook.titleAccent}`"
              class="relative aspect-[1/1.35] w-full max-w-[420px] rounded-sm border object-cover shadow-2xl"
              :style="{
                borderColor: C.border,
                boxShadow: `0 40px 80px -20px ${C.primary}20, 0 0 0 1px ${C.border}`,
              }"
            />
            <!-- CSS mockup fallback, kept identical to the previous hardcoded design
                 so tenants can remove `coverImage` at any time without losing visual. -->
            <div
              v-else
              class="relative aspect-[1/1.35] w-full max-w-[420px] overflow-hidden rounded-sm border shadow-2xl"
              :style="{
                borderColor: C.border,
                background: `linear-gradient(135deg, ${C.surface} 0%, ${C.surfaceHover} 100%)`,
                boxShadow: `0 40px 80px -20px ${C.primary}20, 0 0 0 1px ${C.border}`,
              }"
            >
              <div
                class="absolute inset-0 opacity-[0.06]"
                :style="{
                  backgroundImage: `linear-gradient(${C.text} 1px, transparent 1px), linear-gradient(90deg, ${C.text} 1px, transparent 1px)`,
                  backgroundSize: '24px 24px',
                }"
              />
              <div
                class="absolute -left-16 top-0 h-[400px] w-[400px] rounded-full opacity-30 blur-3xl"
                :style="{ background: C.primary }"
              />

              <div class="relative flex h-full flex-col p-7 md:p-9">
                <header class="mb-auto flex items-start justify-between">
                  <div class="flex items-center gap-2">
                    <div
                      class="flex size-6 items-center justify-center rounded"
                      :style="{ backgroundColor: C.primary, color: C.background }"
                    >
                      <UIcon name="i-lucide-flame" class="size-3.5" />
                    </div>
                    <span
                      class="font-mono-tab text-[10px] font-bold uppercase tracking-[0.15em]"
                      :style="{ color: C.text }"
                    >
                      REDENT<span :style="{ color: C.primary }">.IA</span>
                    </span>
                  </div>
                  <div class="text-right font-mono-tab text-[9px] uppercase leading-tight tracking-[0.18em]" :style="{ color: C.textMuted }">
                    <div :style="{ color: C.primary }">● MARKET RESEARCH</div>
                    <div>EDIÇÃO 01 · ABRIL</div>
                  </div>
                </header>

                <div class="my-8">
                  <span
                    class="inline-block border px-2 py-1 font-mono-tab text-[9px] uppercase tracking-[0.15em]"
                    :style="{ borderColor: C.border, color: C.textMuted }"
                  >
                    [ESTUDO] · FINFLUENCERS
                  </span>
                </div>

                <h2
                  class="mb-auto text-[38px] leading-[0.95] tracking-tight sm:text-[44px]"
                  :style="{ color: C.text, fontFamily: F.display }"
                >
                  O império<br />
                  por trás do<br />
                  <em :style="{ color: C.primary }">feed.</em>
                </h2>

                <footer class="mt-10 border-t pt-4" :style="{ borderColor: C.border }">
                  <div class="grid grid-cols-2 gap-3 font-mono-tab text-[9px] uppercase tracking-[0.15em]">
                    <div>
                      <div :style="{ color: C.textMuted }">VAL. GRUPO PRIMO</div>
                      <div class="text-[16px] font-semibold" :style="{ color: C.primary, fontFamily: F.body }">R$ 1,138 bi</div>
                    </div>
                    <div>
                      <div :style="{ color: C.textMuted }">CASES ANALISADOS</div>
                      <div class="text-[16px] font-semibold" :style="{ color: C.primary, fontFamily: F.body }">45+</div>
                    </div>
                  </div>
                </footer>
              </div>
            </div>

          </div>
        </div>

        <!-- Hero stats bar -->
        <div
          class="mt-20 grid gap-px overflow-hidden rounded-sm border md:grid-cols-4"
          :style="{ borderColor: C.border, backgroundColor: C.border }"
        >
          <div
            v-for="stat in ebook.heroStats"
            :key="stat.label"
            class="flex flex-col gap-2 p-5"
            :style="{ backgroundColor: C.surface }"
          >
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
              {{ stat.label.toUpperCase() }}
            </span>
            <span class="text-[22px] font-semibold leading-none tracking-tight md:text-[26px]" :style="{ color: C.primary }">
              {{ stat.value }}
            </span>
            <span v-if="stat.context" class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
              {{ stat.context.toUpperCase() }}
            </span>
          </div>
        </div>
      </section>

      <!-- §1.5 · RADAR FINFLUENCE, 8 categorias × 33 nomes.
           High-value SEO section: each category name + notable-names list
           is an extractable block that matches "Thiago Nigro grupo primo",
           "quem são os finfluencers de fiis", "ARK Invest AUM" type queries.
           AI engines treat this as an entity list and tend to cite it
           verbatim in "Who are the top Brazilian finfluencers?" answers. -->
      <section
        v-if="ebook.categories && ebook.categories.length > 0"
        class="relative border-y"
        :style="{ borderColor: C.border, backgroundColor: `${C.surface}80` }"
      >
        <div class="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-10">
            <div>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                [RADAR FINFLUENCE · BR 2026]
              </span>
              <h2 class="mt-3 text-[36px] leading-tight tracking-tight md:text-[52px]" :style="{ color: C.text, fontFamily: F.display }">
                33 nomes, <em :style="{ color: C.primary }">8 territórios.</em>
              </h2>
            </div>
            <p class="max-w-md text-[14px] leading-[1.7]" :style="{ color: C.textMuted }">
              Os finfluencers brasileiros não são uma massa homogênea. Dividem-se em territórios com lógicas econômicas, audiências e graus de capitalização completamente diferentes. Este radar condensa os 33 com maior relevância estratégica.
            </p>
          </div>

          <div class="grid gap-px overflow-hidden rounded-sm border md:grid-cols-2 lg:grid-cols-4" :style="{ borderColor: C.border, backgroundColor: C.border }">
            <article
              v-for="cat in ebook.categories"
              :key="cat.slug"
              class="flex flex-col gap-3 p-6 transition-colors hover:brightness-110 md:p-7"
              :style="{ backgroundColor: C.background }"
            >
              <header class="flex items-baseline justify-between gap-3">
                <h3 class="text-[20px] font-semibold leading-tight md:text-[22px]" :style="{ color: C.text }">
                  {{ cat.name }}
                </h3>
                <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
                  {{ String(cat.notableNames.length).padStart(2, '0') }} NOMES
                </span>
              </header>
              <p class="text-[13px] leading-[1.6]" :style="{ color: C.textMuted }">
                {{ cat.description }}
              </p>
              <ul class="mt-auto flex flex-wrap gap-1.5 font-mono-tab text-[10px] uppercase tracking-[0.12em]">
                <li
                  v-for="name in cat.notableNames"
                  :key="name"
                  class="rounded-sm border px-2 py-0.5"
                  :style="{ borderColor: C.border, color: C.text }"
                >
                  {{ name }}
                </li>
              </ul>
            </article>
          </div>

          <p class="mt-10 max-w-3xl font-mono-tab text-[11px] uppercase leading-[1.6] tracking-[0.12em]" :style="{ color: C.textMuted }">
            &gt; FONTE: RADAR FINFLUENCE REDENTIA · BASE ANBIMA FINFLUENCE 9ª ED. · 1S 2025 · 803 PERFIS MONITORADOS EM 15 NICHOS · RECORTE EDITORIAL PARA OS 33 COM MAIOR RELEVÂNCIA ESTRATÉGICA.
          </p>
        </div>
      </section>

      <!-- §2 · QUOTE ABERTURA -->
      <section class="relative mx-auto max-w-5xl px-6 py-20 md:px-10 md:py-28">
        <div class="border-l-2 pl-8 md:pl-12" :style="{ borderColor: C.primary }">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
            [TESE CENTRAL]
          </span>
          <blockquote
            class="mt-4 text-[26px] font-light leading-[1.3] tracking-tight md:text-[36px] lg:text-[44px]"
            :style="{ color: C.text, fontFamily: F.display }"
          >
            Afiliação tem <em :style="{ color: C.primary }">teto.</em> Plataforma tem <em :style="{ color: C.primary }">múltiplo.</em>
          </blockquote>
          <p class="mt-6 max-w-2xl text-[15px] leading-[1.7]" :style="{ color: C.textMuted }">
            Em cinco anos, a creator economy financeira brasileira saiu do modelo puramente publicitário para uma camada de gestoras, consultorias, fintechs e research houses que transacionam em valuations bilionários e movimentam mais de R$ 25 bilhões em ativos sob influência.
          </p>
        </div>
      </section>

      <!-- §3 · PARA QUEM -->
      <section class="relative mx-auto max-w-6xl border-t px-6 py-20 md:px-10 md:py-28" :style="{ borderColor: C.border }">
        <div class="grid gap-14 lg:grid-cols-[0.9fr_1.3fr] lg:gap-20">
          <div>
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
              [AUDIÊNCIA]
            </span>
            <h2 class="mt-3 text-[36px] leading-tight tracking-tight md:text-[52px]" :style="{ color: C.text, fontFamily: F.display }">
              Para quem é <em :style="{ color: C.primary }">este estudo.</em>
            </h2>
            <p class="mt-5 text-[14px] leading-[1.7]" :style="{ color: C.textMuted }">
              Escrito para quem vai tomar decisões estratégicas, ou defender teses, em cima desse mercado nos próximos 18 meses.
            </p>
          </div>
          <ul class="flex flex-col divide-y" :style="{ borderColor: C.border }">
            <li
              v-for="(who, idx) in ebook.forWho"
              :key="idx"
              class="flex items-start gap-4 py-5 first:pt-0 last:pb-0"
              :style="{ borderColor: C.border }"
            >
              <span
                class="mt-1 font-mono-tab text-[10px] uppercase tracking-[0.18em]"
                :style="{ color: C.primary }"
              >
                [0{{ idx + 1 }}]
              </span>
              <p class="flex-1 text-[15px] leading-[1.6]" :style="{ color: C.text }">{{ who }}</p>
            </li>
          </ul>
        </div>
      </section>

      <!-- §4 · SUMÁRIO (oito capítulos) -->
      <section class="relative border-y" :style="{ borderColor: C.border, backgroundColor: `${C.surface}80` }">
        <div class="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-10">
            <div>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                [SUMÁRIO · 08 CAPÍTULOS]
              </span>
              <h2 class="mt-3 text-[36px] leading-tight tracking-tight md:text-[52px]" :style="{ color: C.text, fontFamily: F.display }">
                O que você vai <em :style="{ color: C.primary }">encontrar.</em>
              </h2>
            </div>
            <p class="max-w-md text-[14px] leading-[1.7]" :style="{ color: C.textMuted }">
              Cada capítulo é denso em números primários: press releases, earnings calls, bancos de dados de M&amp;A e documentos regulatórios. Quando há estimativa, a metodologia está indicada.
            </p>
          </div>

          <div class="grid gap-px overflow-hidden rounded-sm border md:grid-cols-2" :style="{ borderColor: C.border, backgroundColor: C.border }">
            <article
              v-for="chapter in ebook.chapters"
              :key="chapter.number"
              class="flex gap-5 p-6 transition-colors hover:brightness-110 md:p-8"
              :style="{ backgroundColor: C.background }"
            >
              <span
                class="shrink-0 text-[42px] leading-none tracking-tight"
                :style="{ color: C.primary, fontFamily: F.display }"
              >
                {{ chapter.number }}
              </span>
              <div class="flex-1">
                <div class="mb-2 flex items-center gap-3 font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
                  <span>CAP. {{ chapter.number }}</span>
                  <span :style="{ color: C.border }">·</span>
                  <span>PÁG. {{ chapter.page }}</span>
                </div>
                <h3 class="mb-2 text-[18px] font-semibold leading-snug" :style="{ color: C.text }">
                  {{ chapter.title }}
                </h3>
                <p class="text-[13px] leading-[1.6]" :style="{ color: C.textMuted }">
                  {{ chapter.summary }}
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- §5 · INSIGHTS CHAVE -->
      <section class="relative mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <div class="mb-14 max-w-2xl">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
            [PRÉVIA · 3 INSIGHTS]
          </span>
          <h2 class="mt-3 text-[36px] leading-tight tracking-tight md:text-[52px]" :style="{ color: C.text, fontFamily: F.display }">
            O que ninguém <em :style="{ color: C.primary }">diz em conferência.</em>
          </h2>
        </div>

        <div class="flex flex-col gap-10 md:gap-14">
          <article
            v-for="(insight, idx) in ebook.insights"
            :key="idx"
            class="grid gap-6 border-t pt-10 md:grid-cols-[auto_1fr] md:gap-12"
            :style="{ borderColor: C.border }"
          >
            <div class="md:w-[280px]">
              <div class="mb-2 font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
                [INSIGHT {{ String(idx + 1).padStart(2, '0') }}]
              </div>
              <div
                class="mb-3 text-[48px] leading-none tracking-tight md:text-[64px]"
                :style="{ color: C.primary, fontFamily: F.display }"
              >
                {{ insight.value }}
              </div>
              <div class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.text }">
                {{ insight.label }}
              </div>
            </div>
            <div class="flex items-center">
              <p class="text-[16px] leading-[1.7] md:text-[18px]" :style="{ color: C.text }">
                <span :style="{ color: C.primary }">&gt;</span> {{ insight.quote }}
              </p>
            </div>
          </article>
        </div>
      </section>

      <!-- §6 · FONTES -->
      <section class="relative border-t" :style="{ borderColor: C.border }">
        <div class="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
          <div class="grid gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-14">
            <div>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                [METODOLOGIA]
              </span>
              <h3 class="mt-3 text-[22px] leading-tight" :style="{ color: C.text, fontFamily: F.display }">
                Fontes primárias.
              </h3>
            </div>
            <ul class="flex flex-col gap-2.5">
              <li
                v-for="src in ebook.sources"
                :key="src"
                class="flex items-start gap-3 font-mono-tab text-[11px] uppercase tracking-[0.12em]"
                :style="{ color: C.textMuted }"
              >
                <span :style="{ color: C.primary }">&gt;</span>
                <span>{{ src }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- §6.5 · FAQ, answered questions block.
           Every Q/A here is also injected as FAQPage JSON-LD in the head.
           This is the single highest-leverage SEO block on the page:
             · Google renders FAQ rich results in SERPs (expandable)
             · Each question matches a real long-tail query pattern
             · ChatGPT/Perplexity/AI Overviews extract answers verbatim
               and cite the page — Princeton GEO measured +30-40% citation
               uplift when pages surface Q/A + statistics + sources. -->
      <section
        v-if="ebook.faqs && ebook.faqs.length > 0"
        id="perguntas-frequentes"
        class="relative border-t"
        :style="{ borderColor: C.border }"
      >
        <div class="mx-auto max-w-5xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-14 max-w-3xl">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
              [PERGUNTAS FREQUENTES]
            </span>
            <h2 class="mt-3 text-[36px] leading-tight tracking-tight md:text-[52px]" :style="{ color: C.text, fontFamily: F.display }">
              O que <em :style="{ color: C.primary }">todo mundo pergunta.</em>
            </h2>
            <p class="mt-5 text-[14px] leading-[1.7]" :style="{ color: C.textMuted }">
              As dez perguntas mais buscadas sobre finfluencers brasileiros, valuations e estrutura regulatória, respondidas com dados do estudo.
            </p>
          </div>

          <div class="flex flex-col divide-y" :style="{ borderColor: C.border }">
            <details
              v-for="(faq, idx) in ebook.faqs"
              :key="idx"
              class="group py-6"
              :style="{ borderColor: C.border }"
            >
              <summary
                class="flex cursor-pointer items-start justify-between gap-6 text-[18px] font-semibold leading-snug md:text-[22px]"
                :style="{ color: C.text, fontFamily: F.display }"
              >
                <span class="flex-1">{{ faq.question }}</span>
                <span
                  class="mt-1 shrink-0 font-mono-tab text-[14px] transition-transform group-open:rotate-45"
                  :style="{ color: C.primary }"
                >+</span>
              </summary>
              <p class="mt-4 max-w-3xl text-[15px] leading-[1.7]" :style="{ color: C.textMuted }">
                {{ faq.answer }}
              </p>
            </details>
          </div>
        </div>
      </section>

      <!-- §7 · LEAD CAPTURE FORM -->
      <section id="baixar" class="relative scroll-mt-20 border-t" :style="{ borderColor: C.border, backgroundColor: `${C.surface}80` }">
        <div class="mx-auto max-w-4xl px-6 py-20 md:px-10 md:py-28">
          <div class="mb-12 text-center">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
              [ACESSO GRATUITO]
            </span>
            <h2 class="mt-3 text-[36px] leading-tight tracking-tight md:text-[56px]" :style="{ color: C.text, fontFamily: F.display }">
              Receba o PDF <em :style="{ color: C.primary }">agora.</em>
            </h2>
            <p class="mx-auto mt-5 max-w-xl text-[14px] leading-[1.7]" :style="{ color: C.textMuted }">
              Deixa teu email que a gente manda o link direto. Sem spam, sem sequência de 12 emails pra te empurrar uma mentoria. Só o estudo e, eventualmente, a próxima edição quando sair.
            </p>
          </div>

          <form
            class="mx-auto flex max-w-xl flex-col gap-4"
            @submit.prevent="handleSubmit"
          >
            <div class="grid gap-4 md:grid-cols-2">
              <label class="flex flex-col gap-2">
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
                  &gt; NOME *
                </span>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="Como vamos te chamar"
                  class="rounded-sm border bg-transparent px-4 py-3 text-[14px] outline-none transition-colors focus:border-[var(--c-primary)]"
                  :style="{ borderColor: C.border, color: C.text, '--c-primary': C.primary } as any"
                  :disabled="submitting"
                />
              </label>
              <label class="flex flex-col gap-2">
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
                  &gt; EMAIL *
                </span>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="seu@email.com.br"
                  class="rounded-sm border bg-transparent px-4 py-3 text-[14px] outline-none transition-colors focus:border-[var(--c-primary)]"
                  :style="{ borderColor: C.border, color: C.text, '--c-primary': C.primary } as any"
                  :disabled="submitting"
                />
              </label>
            </div>
            <label class="flex flex-col gap-2">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
                &gt; EMPRESA / PROJETO
              </span>
              <input
                v-model="form.company"
                type="text"
                placeholder="Opcional, pra gente entender quem está lendo"
                class="rounded-sm border bg-transparent px-4 py-3 text-[14px] outline-none transition-colors focus:border-[var(--c-primary)]"
                :style="{ borderColor: C.border, color: C.text, '--c-primary': C.primary } as any"
                :disabled="submitting"
              />
            </label>

            <div v-if="error" class="rounded-sm border px-4 py-3 text-[13px]" :style="{ borderColor: C.negative, color: C.negative }">
              {{ error }}
            </div>

            <button
              type="submit"
              :disabled="submitting || success"
              class="mt-2 inline-flex items-center justify-center gap-3 rounded-sm px-6 py-4 font-mono-tab text-[12px] font-bold uppercase tracking-[0.15em] transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              :style="{ backgroundColor: C.primary, color: C.background }"
            >
              <UIcon v-if="submitting" name="i-lucide-loader-2" class="size-4 motion-safe:animate-spin" />
              <UIcon v-else-if="success" name="i-lucide-check" class="size-4" />
              <UIcon v-else name="i-lucide-download" class="size-4" />
              <span v-if="success">LINK ENVIADO, CONFIRA SEU EMAIL</span>
              <span v-else-if="submitting">ENVIANDO...</span>
              <span v-else>[ENTER] BAIXAR O PDF</span>
            </button>

            <p class="text-center font-mono-tab text-[10px] uppercase leading-[1.6] tracking-[0.15em]" :style="{ color: C.textMuted }">
              &gt; AO BAIXAR, VOCÊ CONCORDA COM NOSSA
              <NuxtLink to="/institucional/privacy" class="underline transition-colors hover:opacity-70" :style="{ color: C.primary }">
                POLÍTICA DE PRIVACIDADE
              </NuxtLink>
            </p>
          </form>

          <!-- Success state, primary download + email confirmation -->
          <div v-if="success" class="mx-auto mt-12 max-w-xl rounded-sm border p-8" :style="{ borderColor: C.primary, backgroundColor: `${C.primary}10` }">
            <div class="mb-4 flex items-center gap-3">
              <UIcon name="i-lucide-check-circle-2" class="size-6" :style="{ color: C.primary }" />
              <h3 class="text-[20px] font-semibold" :style="{ color: C.text }">Pronto, é seu.</h3>
            </div>
            <p class="mb-6 text-[14px] leading-[1.7]" :style="{ color: C.textMuted }">
              Baixa direto aí embaixo. Também enviamos o link pro email <strong :style="{ color: C.text }">{{ submittedEmail }}</strong> pra você achar depois.
            </p>
            <a
              :href="ebook.downloadHref"
              :download="`redentia-${ebook.slug}.pdf`"
              class="group inline-flex items-center gap-3 rounded-sm px-6 py-3 font-mono-tab text-[12px] font-bold uppercase tracking-[0.15em] transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:opacity-90"
              :style="{ backgroundColor: C.primary, color: C.background }"
            >
              <UIcon name="i-lucide-download" class="size-4" />
              BAIXAR O PDF ({{ ebook.pages }} PÁGINAS)
              <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      <!-- §8 · AUTHOR / ABOUT REDENTIA FOOTER -->
      <section class="relative border-t" :style="{ borderColor: C.border }">
        <div class="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
          <div class="grid gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
            <div>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                [OFERECIMENTO]
              </span>
              <h3 class="mt-3 text-[28px] leading-tight tracking-tight md:text-[36px]" :style="{ color: C.text, fontFamily: F.display }">
                Redentia é o <em :style="{ color: C.primary }">ecossistema de investimentos com IA</em> que nasceu deste estudo.
              </h3>
              <p class="mt-5 text-[14px] leading-[1.7]" :style="{ color: C.textMuted }">
                A tese do ebook é a tese que construímos: quando o creator vira plataforma, ele precisa de infra. Dados B3 em tempo real, IA treinada em renda variável, consolidador de carteira, creative studio, ferramentas de análise. É isso que a Redentia entrega, em white-label, pronto em menos de uma semana.
              </p>
              <div class="mt-6 flex flex-wrap gap-3">
                <a
                  :href="mainSiteHref"
                  class="inline-flex items-center gap-2 rounded-sm border px-4 py-2.5 font-mono-tab text-[11px] uppercase tracking-[0.15em] transition-colors hover:opacity-80"
                  :style="{ borderColor: C.border, color: C.text }"
                >
                  <UIcon name="i-lucide-external-link" class="size-3" :style="{ color: C.primary }" />
                  CONHECER A PLATAFORMA
                </a>
                <a
                  href="https://whitelabel.redentia.com.br"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-2 rounded-sm border px-4 py-2.5 font-mono-tab text-[11px] uppercase tracking-[0.15em] transition-colors hover:opacity-80"
                  :style="{ borderColor: C.border, color: C.text }"
                >
                  <UIcon name="i-lucide-briefcase" class="size-3" :style="{ color: C.primary }" />
                  WHITELABEL
                </a>
              </div>
            </div>
            <div class="flex flex-col justify-end gap-3 font-mono-tab text-[11px] uppercase tracking-[0.15em] md:items-end md:text-right" :style="{ color: C.textMuted }">
              <div>REDENTIA · {{ publishedYear }}</div>
              <div>INVESTIR COM INTELIGÊNCIA</div>
              <a href="mailto:contato@redentia.com.br" class="underline transition-colors hover:opacity-70" :style="{ color: C.primary }">
                CONTATO@REDENTIA.COM.BR
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F, REDENTIA_GOOGLE_FONT_HREF } from '~/utils/redentiaCreativeColors'
import { findEbook } from '~/utils/ebooks'

const ebook = findEbook('imperio-por-tras-do-feed')!

const mainSiteHref = useMainSiteHref()

const publishedYear = new Date(ebook.publishedAt).getFullYear()

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
}

// Form state
const form = reactive({
  name: '',
  email: '',
  company: '',
})
const submitting = ref(false)
const success = ref(false)
const error = ref<string | null>(null)
const submittedEmail = ref('')

async function handleSubmit() {
  if (submitting.value || success.value) return
  error.value = null
  submitting.value = true

  try {
    const runtimeConfig = useRuntimeConfig()
    const apiBase = runtimeConfig.public.apiBaseUrl as string
    await $fetch(`${apiBase}/leads`, {
      method: 'POST',
      body: {
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim() || null,
        source: 'ebook',
        metadata: {
          ebook_slug: ebook.slug,
          ebook_title: `${ebook.title} ${ebook.titleAccent}`,
        },
      },
    })
    submittedEmail.value = form.email.trim()
    success.value = true
    // Scroll success panel into view
    await nextTick()
    const target = document.getElementById('baixar')
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch (e: any) {
    error.value =
      e?.data?.message ||
      e?.data?.errors?.email?.[0] ||
      'Não foi possível registrar seu email. Tenta de novo em instantes.'
  } finally {
    submitting.value = false
  }
}

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

// ==========================================================
// SEO: JSON-LD structured data
// ==========================================================
// Three schemas stacked in the head so both classic search engines and
// AI search (ChatGPT, Perplexity, Google AI Overviews) can extract the
// study's metadata, Q&A pairs and breadcrumb trail cleanly:
//
//   1. Article           → Article schema with author, publisher, dates
//                         and image. Feeds Google Top Stories + Bing news
//                         and gives LLMs an unambiguous "this is a study,
//                         published on X, updated on Y" signal.
//   2. FAQPage          → Each Q/A pair is extractable verbatim by AI
//                         engines. Princeton GEO (2024) measured 30-40%
//                         citation uplift when pages surface statistics +
//                         Q/A answers with sources.
//   3. BreadcrumbList    → Hub → Landing hierarchy. Helps SERP rendering
//                         and makes the /estudo hub discoverable from the
//                         rich result.
//
// All three are emitted as separate <script type="application/ld+json">
// blocks — stacking them as a single @graph also works but keeps them
// siloed so individual validators (Rich Results Test, Schema.org
// validator) don't flag the Article missing properties required by FAQ.
const SITE_ORIGIN = 'https://estudo.redentia.com.br'
const MAIN_SITE_ORIGIN = 'https://redentia.com.br'
const pageUrl = `${SITE_ORIGIN}/${ebook.slug}`
const coverUrl = ebook.coverImage ? `${SITE_ORIGIN}${ebook.coverImage}` : undefined
const ogImageUrl = ebook.ogImage
  ? `${SITE_ORIGIN}${ebook.ogImage}`
  : coverUrl

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: ebook.plainTitle,
  description: ebook.seo.description,
  url: pageUrl,
  image: coverUrl ? [coverUrl] : undefined,
  datePublished: ebook.publishedAt,
  dateModified: ebook.updatedAt,
  inLanguage: 'pt-BR',
  isAccessibleForFree: true,
  keywords: ebook.seo.keywords.join(', '),
  wordCount: ebook.pages * 300, // rough estimate, ~300 words/page
  author: {
    '@type': 'Organization',
    name: ebook.seo.authorName,
    url: MAIN_SITE_ORIGIN,
  },
  publisher: {
    '@type': 'Organization',
    name: ebook.seo.publisherName,
    url: MAIN_SITE_ORIGIN,
    logo: {
      '@type': 'ImageObject',
      url: `${MAIN_SITE_ORIGIN}/brand/logo-icon.svg`,
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': pageUrl,
  },
  about: ebook.seo.keywords.slice(0, 6).map((kw) => ({
    '@type': 'Thing',
    name: kw,
  })),
}

const faqSchema = ebook.faqs && ebook.faqs.length > 0
  ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: ebook.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    }
  : null

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Redentia',
      item: MAIN_SITE_ORIGIN,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Estudos',
      item: SITE_ORIGIN,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: ebook.plainTitle,
      item: pageUrl,
    },
  ],
}

useHead({
  title: ebook.seo.title,
  htmlAttrs: { lang: 'pt-BR' },
  meta: [
    { name: 'description', content: ebook.seo.description },
    { name: 'keywords', content: ebook.seo.keywords.join(', ') },
    { name: 'author', content: ebook.seo.authorName },
    { name: 'robots', content: 'index,follow,max-image-preview:large,max-snippet:-1' },
    // Open Graph
    { property: 'og:title', content: ebook.seo.title },
    { property: 'og:description', content: ebook.seo.description },
    { property: 'og:type', content: 'article' },
    { property: 'og:url', content: pageUrl },
    { property: 'og:site_name', content: 'Redentia Estudo' },
    { property: 'og:locale', content: 'pt_BR' },
    ...(ogImageUrl ? [
      { property: 'og:image', content: ogImageUrl },
      { property: 'og:image:alt', content: `Capa: ${ebook.plainTitle}` },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '1350' },
    ] : []),
    { property: 'article:published_time', content: ebook.publishedAt },
    { property: 'article:modified_time', content: ebook.updatedAt },
    { property: 'article:author', content: ebook.seo.authorName },
    { property: 'article:section', content: 'Market Research' },
    ...ebook.seo.keywords.slice(0, 6).map((tag) => ({ property: 'article:tag', content: tag })),
    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: ebook.seo.title },
    { name: 'twitter:description', content: ebook.seo.description },
    ...(ogImageUrl ? [{ name: 'twitter:image', content: ogImageUrl }] : []),
  ],
  link: [
    { rel: 'canonical', href: pageUrl },
    { rel: 'stylesheet', href: REDENTIA_GOOGLE_FONT_HREF },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(articleSchema),
    },
    ...(faqSchema ? [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify(faqSchema),
    }] : []),
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(breadcrumbSchema),
    },
  ],
})
</script>

<style scoped>
.font-mono-tab {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-feature-settings: 'tnum' 1;
}

input:focus {
  outline: none !important;
  box-shadow: none !important;
}
</style>

<template>
  <NuxtLayout name="api-portal">
    <div
      class="relative min-h-screen overflow-hidden"
      :style="{ backgroundColor: C.background, color: C.text, fontFamily: F.body }"
    >
      <!-- Background depth -->
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
      </div>

      <!-- HEADER -->
      <header
        class="sticky top-0 z-40 border-b backdrop-blur-xl"
        :style="{ borderColor: C.border, backgroundColor: `${C.background}CC` }"
      >
        <div class="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 md:px-6">
          <NuxtLink to="/estudo" class="flex items-center gap-2">
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
              REDENT<span :style="{ color: C.primary }">.ESTUDO</span>
            </span>
          </NuxtLink>
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

      <!-- HERO -->
      <section class="relative mx-auto max-w-6xl px-6 pb-12 pt-16 md:px-10 md:pb-20 md:pt-24">
        <div class="mb-8 flex flex-wrap items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.18em]">
          <span class="flex items-center gap-1.5" :style="{ color: C.primary }">
            <span class="relative flex size-1.5">
              <span
                class="absolute inline-flex size-1.5 animate-ping rounded-full opacity-75"
                :style="{ backgroundColor: C.primary }"
              />
              <span
                class="relative inline-flex size-1.5 rounded-full"
                :style="{ backgroundColor: C.primary }"
              />
            </span>
            [REDENT.ESTUDO]
          </span>
          <span :style="{ color: C.border }">·</span>
          <span :style="{ color: C.textMuted }">MARKET RESEARCH · GRATUITO</span>
        </div>

        <h1
          class="mb-6 max-w-3xl text-[48px] leading-[0.95] tracking-tight sm:text-[64px] md:text-[80px] lg:text-[96px]"
          :style="{ color: C.text, fontFamily: F.display }"
        >
          Estudos de quem <em :style="{ color: C.primary }">mapeia o mercado</em> antes de opinar.
        </h1>

        <p class="max-w-2xl text-[15px] leading-[1.7] md:text-[17px]" :style="{ color: C.textMuted }">
          Market research denso, com fontes primárias, números de press release e valuations públicos. Publicamos uma edição por vez, quando o assunto merece. Tudo aqui é gratuito e sem gated funil de 12 emails.
        </p>
      </section>

      <!-- LIST -->
      <section class="relative mx-auto max-w-6xl border-t px-6 py-20 md:px-10 md:py-28" :style="{ borderColor: C.border }">
        <div class="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
              [CATÁLOGO · {{ String(ebooks.length).padStart(2, '0') }} EDIÇÕES]
            </span>
            <h2 class="mt-3 text-[32px] leading-tight tracking-tight md:text-[44px]" :style="{ color: C.text, fontFamily: F.display }">
              Edições disponíveis.
            </h2>
          </div>
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
            &gt; PRÓXIMA EDIÇÃO: MAI/2026
          </span>
        </div>

        <div class="flex flex-col gap-6">
          <NuxtLink
            v-for="ebook in ebooks"
            :key="ebook.slug"
            :to="`/estudo/${ebook.slug}`"
            class="group grid gap-8 rounded-sm border p-6 transition-all hover:brightness-110 md:grid-cols-[0.6fr_1.4fr] md:p-10"
            :style="{ borderColor: C.border, backgroundColor: C.surface }"
          >
            <!-- Mini cover, real image when available, CSS mockup fallback -->
            <img
              v-if="ebook.coverImage"
              :src="ebook.coverImage"
              :alt="`Capa: ${ebook.title} ${ebook.titleAccent}`"
              class="relative aspect-[1/1.35] w-full max-w-[260px] rounded-sm border object-cover"
              :style="{ borderColor: C.border }"
            />
            <div
              v-else
              class="relative aspect-[1/1.35] w-full max-w-[260px] overflow-hidden rounded-sm border"
              :style="{
                borderColor: C.border,
                background: `linear-gradient(135deg, ${C.surface} 0%, ${C.surfaceHover} 100%)`,
              }"
            >
              <div
                class="absolute inset-0 opacity-[0.06]"
                :style="{
                  backgroundImage: `linear-gradient(${C.text} 1px, transparent 1px), linear-gradient(90deg, ${C.text} 1px, transparent 1px)`,
                  backgroundSize: '16px 16px',
                }"
              />
              <div
                class="absolute -left-10 top-0 h-[300px] w-[300px] rounded-full opacity-30 blur-2xl"
                :style="{ background: C.primary }"
              />
              <div class="relative flex h-full flex-col p-5">
                <div class="mb-auto flex items-center gap-1.5 font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: C.primary }">
                  <UIcon name="i-lucide-flame" class="size-3" />
                  REDENT.IA
                </div>
                <h3
                  class="text-[22px] leading-[0.95] tracking-tight"
                  :style="{ color: C.text, fontFamily: F.display }"
                >
                  {{ ebook.title }}<br />
                  <em :style="{ color: C.primary }">{{ ebook.titleAccent }}</em>
                </h3>
                <div class="mt-5 flex items-center justify-between font-mono-tab text-[8px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
                  <span>ED. {{ ebook.edition.split(' ')[1] || '01' }}</span>
                  <span>{{ ebook.pages }}p</span>
                </div>
              </div>
            </div>

            <!-- Copy -->
            <div class="flex flex-col gap-4">
              <div class="flex flex-wrap items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
                <span :style="{ color: C.primary }">{{ ebook.eyebrow }}</span>
                <span :style="{ color: C.border }">·</span>
                <span>{{ ebook.edition.toUpperCase() }}</span>
              </div>

              <h3 class="text-[32px] leading-tight tracking-tight md:text-[42px]" :style="{ color: C.text, fontFamily: F.display }">
                {{ ebook.title }} <em :style="{ color: C.primary }">{{ ebook.titleAccent }}</em>
              </h3>

              <p class="max-w-xl text-[14px] leading-[1.7]" :style="{ color: C.textMuted }">
                {{ ebook.description }}
              </p>

              <div class="mt-2 flex flex-wrap items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
                <span class="inline-flex items-center gap-1.5">
                  <UIcon name="i-lucide-file-text" class="size-3" :style="{ color: C.primary }" />
                  {{ ebook.pages }} PÁGINAS
                </span>
                <span :style="{ color: C.border }">·</span>
                <span class="inline-flex items-center gap-1.5">
                  <UIcon name="i-lucide-clock" class="size-3" :style="{ color: C.primary }" />
                  ~{{ ebook.readingMinutes }} MIN
                </span>
                <span :style="{ color: C.border }">·</span>
                <span class="inline-flex items-center gap-1.5">
                  <UIcon name="i-lucide-download" class="size-3" :style="{ color: C.primary }" />
                  PDF GRATUITO
                </span>
              </div>

              <div class="mt-4 inline-flex items-center gap-2 font-mono-tab text-[11px] uppercase tracking-[0.15em] transition-colors group-hover:opacity-80" :style="{ color: C.primary }">
                LER A LANDING COMPLETA
                <UIcon name="i-lucide-arrow-right" class="size-3 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Footer explicativo -->
      <section class="relative mx-auto max-w-4xl border-t px-6 py-16 text-center md:py-20" :style="{ borderColor: C.border }">
        <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
          [SOBRE O FORMATO]
        </span>
        <h3 class="mx-auto mt-3 max-w-2xl text-[22px] leading-tight md:text-[32px]" :style="{ color: C.text, fontFamily: F.display }">
          Por que a gente publica isso <em :style="{ color: C.primary }">de graça.</em>
        </h3>
        <p class="mx-auto mt-5 max-w-xl text-[14px] leading-[1.7]" :style="{ color: C.textMuted }">
          Porque a Redentia é um ecossistema de investimentos com IA, a gente vive de quem usa o produto, não de quem baixa o PDF. Se o estudo te ajudar a tomar uma decisão melhor, considere a plataforma. Caso contrário, é seu, leva e usa.
        </p>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F, REDENTIA_GOOGLE_FONT_HREF } from '~/utils/redentiaCreativeColors'
import { EBOOKS } from '~/utils/ebooks'

const ebooks = EBOOKS
const mainSiteHref = useMainSiteHref()

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

// Hub-level structured data — CollectionPage wrapping an ItemList of
// every ebook currently in the catalog. Keeps the hub eligible for
// sitelinks search results and lets AI engines discover all ebooks in
// one cached JSON-LD parse instead of crawling each landing.
const SITE_ORIGIN = 'https://estudo.redentia.com.br'
const MAIN_SITE_ORIGIN = 'https://redentia.com.br'
const hubUrl = `${SITE_ORIGIN}/`

const collectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': hubUrl,
  url: hubUrl,
  name: 'Redentia Estudo',
  description:
    'Catálogo de market research gratuito sobre finfluencers, creator-led asset managers e o varejo digital de investimentos no Brasil.',
  inLanguage: 'pt-BR',
  publisher: {
    '@type': 'Organization',
    name: 'Redentia',
    url: MAIN_SITE_ORIGIN,
    logo: {
      '@type': 'ImageObject',
      url: `${MAIN_SITE_ORIGIN}/brand/logo-icon.svg`,
    },
  },
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: ebooks.length,
    itemListElement: ebooks.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_ORIGIN}/${e.slug}`,
      name: e.plainTitle,
    })),
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Redentia', item: MAIN_SITE_ORIGIN },
    { '@type': 'ListItem', position: 2, name: 'Estudos', item: SITE_ORIGIN },
  ],
}

useHead({
  title: 'Redentia Estudo: Market research gratuito sobre finfluencers e creator economy financeira',
  htmlAttrs: { lang: 'pt-BR' },
  meta: [
    {
      name: 'description',
      content:
        'Estudos gratuitos da Redentia sobre finfluencers brasileiros, creator-led asset managers, valuations bilionários e o varejo digital de investimentos. Dados primários, múltiplos reais, 60+ fontes públicas.',
    },
    {
      name: 'keywords',
      content: 'redentia estudo, market research finfluencers, creator economy financeira, influenciadores financeiros brasil, valuations finfluencers',
    },
    { name: 'robots', content: 'index,follow,max-image-preview:large,max-snippet:-1' },
    { property: 'og:title', content: 'Redentia Estudo: Market research gratuito' },
    {
      property: 'og:description',
      content:
        'Estudos gratuitos sobre a creator economy financeira brasileira. Valuations, múltiplos e receitas reais de 45+ cases.',
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: hubUrl },
    { property: 'og:site_name', content: 'Redentia Estudo' },
    { property: 'og:locale', content: 'pt_BR' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
  link: [
    { rel: 'canonical', href: hubUrl },
    { rel: 'stylesheet', href: REDENTIA_GOOGLE_FONT_HREF },
  ],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(collectionSchema) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(breadcrumbSchema) },
  ],
})
</script>

<style scoped>
.font-mono-tab {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-feature-settings: 'tnum' 1;
}
</style>

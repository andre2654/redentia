<!--
  AtomsDevPortalFooter — minimal terminal-style footer used by the
  developer-facing portals (api / creative / whitelabel / backoffice).
  Visually distinct from the main consumer footer (which has glossary,
  notifications CTA, etc) — these are surfaces for developers and
  resellers, so the footer stays out of the way.
-->

<template>
  <footer
    class="relative mt-16 border-t"
    :style="{
      borderColor: `${brand.colors.border}80`,
      backgroundColor: `${brand.colors.background}`,
      color: brand.colors.textMuted,
    }"
  >
    <!-- Top accent line -->
    <div
      class="absolute inset-x-0 top-0 h-px"
      :style="{ background: `linear-gradient(90deg, transparent, ${brand.colors.primary}80, transparent)` }"
    />

    <div class="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
      <!-- Top row: brand + cross-product nav -->
      <div class="grid gap-10 md:grid-cols-12 md:gap-12">
        <!-- Brand block -->
        <div class="md:col-span-5">
          <a :href="mainSiteHref" class="inline-flex items-center gap-3">
            <BrandLogo variant="icon" class="size-7" />
            <span
              class="font-mono-tab text-[14px] uppercase tracking-[0.18em]"
              :style="{ color: brand.colors.text }"
            >
              {{ brand.shortName }}<span :style="{ color: brand.colors.primary }">.{{ productLabel }}</span>
            </span>
          </a>
          <p class="mt-4 max-w-sm text-[13px] leading-relaxed">
            {{ description }}
          </p>

          <!-- Status pill -->
          <div class="mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ borderColor: `${brand.colors.border}`, color: brand.colors.textMuted }">
            <span class="relative flex size-1.5">
              <span class="absolute inline-flex size-1.5 animate-ping rounded-full opacity-75" :style="{ backgroundColor: brand.colors.positive }" />
              <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: brand.colors.positive }" />
            </span>
            <span :style="{ color: brand.colors.positive }">ALL SYSTEMS</span>
            <span :style="{ color: brand.colors.border }">·</span>
            <span>99.9% UPTIME</span>
          </div>
        </div>

        <!-- Cross-product nav -->
        <div class="md:col-span-7">
          <p class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
            ECOSSISTEMA REDENTIA
          </p>
          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <a
              v-for="link in crossLinks"
              :key="link.slug"
              :href="link.href"
              class="group block border-l pl-4 transition-colors"
              :style="{ borderColor: `${brand.colors.border}` }"
              :target="link.external ? '_blank' : undefined"
              :rel="link.external ? 'noopener' : undefined"
            >
              <div class="flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.primary }">
                <span>{{ link.tag }}</span>
                <span class="transition-transform group-hover:translate-x-1">→</span>
              </div>
              <div class="mt-1 font-mono-tab text-[13px]" :style="{ color: brand.colors.text }">
                {{ link.title }}
              </div>
              <div class="text-[12px]" :style="{ color: brand.colors.textMuted }">
                {{ link.subtitle }}
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="mt-12 border-t pt-6" :style="{ borderColor: `${brand.colors.border}80` }">
        <div class="flex flex-wrap items-center justify-between gap-4 font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: brand.colors.textMuted }">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>© {{ year }} {{ brand.name }}</span>
            <span :style="{ color: brand.colors.border }">·</span>
            <NuxtLink to="/legal/terms" class="transition-colors hover:opacity-80" :style="{ color: brand.colors.text }">TERMOS</NuxtLink>
            <NuxtLink to="/legal/privacy" class="transition-colors hover:opacity-80" :style="{ color: brand.colors.text }">PRIVACIDADE</NuxtLink>
            <a href="mailto:contato@redentia.com.br" class="transition-colors hover:opacity-80" :style="{ color: brand.colors.text }">CONTATO</a>
          </div>
          <div class="flex items-center gap-3">
            <span>BUILD 2026.04</span>
            <span :style="{ color: brand.colors.border }">·</span>
            <span :style="{ color: brand.colors.positive }">v1.0</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const brand = useBrand()
// Footer logo links back to the main Redentia site. On subdomains
// (api., creative., etc.) this resolves to an absolute URL so the
// host actually changes — otherwise a NuxtLink `to="/"` would do an
// SPA nav that keeps the user on the same subdomain.
const mainSiteHref = useMainSiteHref()
const route = useRoute()

// Detect which "product" we're rendering inside so we can adapt the
// brand label and the description.
const productSlug = computed<'api' | 'creative' | 'whitelabel' | 'backoffice' | 'admin'>(() => {
  const p = route.path
  if (p.startsWith('/api-portal')) return 'api'
  if (p.startsWith('/creative')) return 'creative'
  if (p.startsWith('/whitelabel')) return 'whitelabel'
  if (p.startsWith('/backoffice')) return 'backoffice'
  return 'api'
})

const productLabel = computed(() => ({
  api: 'API',
  creative: 'CREATIVE',
  whitelabel: 'WHITELABEL',
  backoffice: 'ADMIN',
  admin: 'ADMIN',
}[productSlug.value]))

const description = computed(() => ({
  api: 'A mesma inteligência que move a Redentia, agora em JSON. Endpoints REST para preços, fundamentos, dividendos e commentaries.',
  creative: 'Cards, rankings e mockups com dados reais — prontos pra tirar print e postar nas redes. PNG 1080×1080, sem fricção.',
  whitelabel: 'A plataforma inteira sob a sua marca: dados, IA, design system, calculadoras e checklist do investidor.',
  backoffice: 'Painel administrativo da Redentia. Gerencie tenants, usuários, conteúdo e operação.',
  admin: 'Painel administrativo da Redentia. Gerencie tenants, usuários, conteúdo e operação.',
}[productSlug.value]))

const crossLinks = computed(() => {
  const all = [
    {
      slug: 'main',
      tag: '[CORE]',
      title: 'redentia.com.br',
      subtitle: 'Terminal de mercado com IA',
      href: 'https://www.redentia.com.br',
      external: true,
    },
    {
      slug: 'api',
      tag: '[API]',
      title: 'api.redentia.com.br',
      subtitle: 'REST API para devs',
      href: 'https://api.redentia.com.br',
      external: true,
    },
    {
      slug: 'creative',
      tag: '[CREATIVE]',
      title: 'creative.redentia.com.br',
      subtitle: 'Studio de criativos',
      href: 'https://creative.redentia.com.br',
      external: true,
    },
    {
      slug: 'whitelabel',
      tag: '[WHITE-LABEL]',
      title: 'whitelabel.redentia.com.br',
      subtitle: 'Plataforma sob sua marca',
      href: 'https://whitelabel.redentia.com.br',
      external: true,
    },
  ]
  // Filtra o produto atual pra não mostrar link pra si mesmo
  return all.filter(l => l.slug !== productSlug.value)
})

const year = new Date().getFullYear()
</script>

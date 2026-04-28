<!--
  AtomsDevPortalFooter, minimal terminal-style footer used by the
  developer-facing portals (api / creative / whitelabel / backoffice).
  Visually distinct from the main consumer footer (which has glossary,
  notifications CTA, etc), these are surfaces for developers and
  resellers, so the footer stays out of the way.
-->

<template>
  <footer
    class="relative mt-16 border-t"
    :style="{
      borderColor: `var(--brand-border)80`,
      backgroundColor: `var(--brand-background)`,
      color: 'var(--brand-text-muted)',
    }"
  >
    <!-- Top accent line -->
    <div
      class="absolute inset-x-0 top-0 h-px"
      :style="{ background: `linear-gradient(90deg, transparent, var(--brand-primary)80, transparent)` }"
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
              :style="{ color: 'var(--brand-text)' }"
            >
              {{ brand.shortName }}<span :style="{ color: 'var(--brand-primary)' }">.{{ productLabel }}</span>
            </span>
          </a>
          <p class="mt-4 max-w-sm text-[13px] leading-relaxed">
            {{ description }}
          </p>

          <!-- Status pill -->
          <div class="mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ borderColor: `var(--brand-border)`, color: 'var(--brand-text-muted)' }">
            <span class="relative flex size-1.5">
              <span class="absolute inline-flex size-1.5 motion-safe:animate-ping rounded-full opacity-75" :style="{ backgroundColor: 'var(--brand-positive)' }" />
              <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: 'var(--brand-positive)' }" />
            </span>
            <span :style="{ color: 'var(--brand-positive)' }">ALL SYSTEMS</span>
            <span :style="{ color: 'var(--brand-border)' }">·</span>
            <span>99.9% UPTIME</span>
          </div>
        </div>

        <!-- Cross-product nav -->
        <div class="md:col-span-7">
          <p class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: 'var(--brand-primary)' }">
            ECOSSISTEMA REDENTIA
          </p>
          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <a
              v-for="link in crossLinks"
              :key="link.slug"
              :href="link.href"
              class="group block border-l pl-4 transition-colors"
              :style="{ borderColor: `var(--brand-border)` }"
              :target="link.external ? '_blank' : undefined"
              :rel="link.external ? 'noopener' : undefined"
            >
              <div class="flex items-center gap-2 font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: 'var(--brand-primary)' }">
                <span>{{ link.tag }}</span>
                <span class="transition-transform group-hover:translate-x-1">→</span>
              </div>
              <div class="mt-1 font-mono-tab text-[13px]" :style="{ color: 'var(--brand-text)' }">
                {{ link.title }}
              </div>
              <div class="text-[12px]" :style="{ color: 'var(--brand-text-muted)' }">
                {{ link.subtitle }}
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="mt-12 border-t pt-6" :style="{ borderColor: `var(--brand-border)80` }">
        <div class="flex flex-wrap items-center justify-between gap-4 font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: 'var(--brand-text-muted)' }">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>© {{ year }} {{ brand.name }}</span>
            <span :style="{ color: 'var(--brand-border)' }">·</span>
            <NuxtLink to="/legal/terms" class="transition-colors hover:opacity-80" :style="{ color: 'var(--brand-text)' }">TERMOS</NuxtLink>
            <NuxtLink to="/legal/privacy" class="transition-colors hover:opacity-80" :style="{ color: 'var(--brand-text)' }">PRIVACIDADE</NuxtLink>
            <a href="mailto:contato@redentia.com.br" class="transition-colors hover:opacity-80" :style="{ color: 'var(--brand-text)' }">CONTATO</a>
          </div>
          <div class="flex items-center gap-3">
            <span>BUILD 2026.04</span>
            <span :style="{ color: 'var(--brand-border)' }">·</span>
            <span :style="{ color: 'var(--brand-positive)' }">v1.0</span>
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
// host actually changes, otherwise a NuxtLink `to="/"` would do an
// SPA nav that keeps the user on the same subdomain.
const mainSiteHref = useMainSiteHref()
const route = useRoute()

// Detect which "product" we're rendering inside so we can adapt the
// brand label and the description.
const productSlug = computed<'api' | 'creative' | 'embed' | 'whitelabel' | 'backoffice' | 'admin'>(() => {
  const p = route.path
  if (p.startsWith('/api-portal')) return 'api'
  if (p.startsWith('/creative')) return 'creative'
  if (p.startsWith('/embed')) return 'embed'
  if (p.startsWith('/whitelabel')) return 'whitelabel'
  if (p.startsWith('/backoffice')) return 'backoffice'
  return 'api'
})

const productLabel = computed(() => ({
  api: 'API',
  creative: 'CREATIVE',
  embed: 'EMBED',
  whitelabel: 'WHITELABEL',
  backoffice: 'ADMIN',
  admin: 'ADMIN',
}[productSlug.value]))

const description = computed(() => ({
  api: 'A mesma inteligência que move a Redentia, agora em JSON. Endpoints REST para preços, fundamentos, dividendos e commentaries.',
  creative: 'Cards, rankings e mockups com dados reais, prontos pra tirar print e postar nas redes. PNG 1080×1080, sem fricção.',
  embed: 'Widgets gratuitos de cotação, calculadoras e rankings prontos pra copiar e colar no seu site. Um iframe, zero cadastro.',
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
      subtitle: 'Ecossistema de investimentos com IA',
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
      slug: 'embed',
      tag: '[EMBED]',
      title: 'embed.redentia.com.br',
      subtitle: 'Widgets e iframes pro seu site',
      href: 'https://embed.redentia.com.br',
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

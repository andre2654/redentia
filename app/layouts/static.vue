<template>
  <div
    class="selection:bg-primary min-h-screen font-sans selection:text-black"
    :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
  >
    <!-- Header -->
    <header
      class="fixed top-0 z-50 w-full border-b backdrop-blur-xl"
      :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background + '80' }"
    >
      <div
        class="mx-auto flex h-20 max-w-7xl items-center justify-between px-6"
      >
        <NuxtLink
          to="/"
          class="group flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <BrandLogo
            variant="full"
            class="h-8 w-auto transition-transform group-hover:scale-105 md:h-9"
          />
        </NuxtLink>
        <UButton
          to="/"
          variant="ghost"
          color="neutral"
          icon="i-lucide-arrow-left"
          class="hidden sm:flex"
        >
          Voltar para o site
        </UButton>
      </div>
    </header>

    <main class="relative px-6 pb-20 pt-32">
      <!-- Background Effects -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          class="bg-primary/10 absolute -top-[20%] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[120px]"
        />
        <div
          class="bg-secondary/5 absolute right-[10%] top-[20%] h-[300px] w-[300px] rounded-full blur-[100px]"
        />
      </div>

      <div class="relative z-10 mx-auto max-w-4xl">
        <!-- Title — Stripe-style display heading.
             Weight 300, negative letter-spacing, clamp() so it
             scales gracefully across viewports. No gradient mask
             (the audit flagged it as adding noise without info). -->
        <h1
          v-if="title"
          class="mb-12 text-center font-light"
          :style="{
            color: brand.colors.text,
            fontSize: 'clamp(36px, 6vw, 56px)',
            lineHeight: 1.05,
            letterSpacing: '-1.4px',
          }"
        >{{ title }}</h1>

        <!-- Content -->
        <div
          class="static-content"
          :style="{
            color: `color-mix(in srgb, ${brand.colors.text} 75%, transparent)`,
          }"
        >
          <slot />
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script lang="ts" setup>
const brand = useBrand()

defineProps({
  title: {
    type: String,
    default: '',
  },
  showLogo: {
    type: Boolean,
    default: true,
  },
})
</script>

<style>
@reference "../assets/css/main.css";

/* ============================================================
   Static layout content cascade — Stripe-style.

   Replaces the prior `font-bold` / `text-3xl` / `text-2xl` h-tags
   with the stripe-style scale: weight 300 light on display
   headings, weight 500 medium on sub-headings, negative letter-
   spacing on the larger sizes, brand-bound colors via CSS vars.

   Body text gets a slightly muted color via color-mix on the
   brand text token — keeps reading comfortable without the
   washed-out feel of `text-gray-400`.
   ============================================================ */

/* Hide h1 inside content if it duplicates the layout's <h1>
   rendered from the `title` prop. */
.static-content h1 {
  @apply hidden;
}

.static-content h2 {
  @apply mb-4 mt-12 font-light;
  color: var(--brand-text);
  font-size: clamp(26px, 3.5vw, 32px);
  line-height: 1.15;
  letter-spacing: -0.6px;
}

.static-content h3 {
  @apply mb-3 mt-8 font-medium;
  color: var(--brand-text);
  font-size: clamp(18px, 2.4vw, 22px);
  line-height: 1.25;
  letter-spacing: -0.22px;
}

.static-content h4 {
  @apply mb-2 mt-6 font-medium;
  color: var(--brand-text);
  font-size: 16px;
  line-height: 1.3;
  letter-spacing: -0.005em;
}

.static-content p {
  @apply mb-5;
  font-size: 16px;
  line-height: 1.6;
}

.static-content strong {
  font-weight: 500;
  color: var(--brand-text);
}

.static-content ul {
  @apply mb-6 list-disc space-y-2 pl-6;
  font-size: 16px;
  line-height: 1.6;
}

.static-content li {
  @apply pl-1;
}

/* Inline links only — limit to anchors inside paragraphs / lists /
   headings, so card-wrapper NuxtLinks (which contain rich layout
   children) don't pick up the underline + brand color. Cards opt
   into their own visual treatment via component classes. */
.static-content :where(p, li, h1, h2, h3, h4, h5, h6, dt, dd) a:not(.normal-static-link) {
  color: var(--brand-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
  transition: opacity 150ms ease-out;
}
.static-content :where(p, li, h1, h2, h3, h4, h5, h6, dt, dd) a:not(.normal-static-link):hover {
  opacity: 0.8;
}
</style>

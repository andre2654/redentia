<!--
  CtaSection — bottom-of-page conversion block.

  Stripe-styled: weight-300 display heading, brand-bound text colors
  via color-mix (no `text-white`/`text-gray-*` literals — those go
  invisible in light mode), brand surface background with a subtle
  amber-tinted border so it reads as a deliberate stop without
  shouting at the reader.
-->
<template>
  <section
    class="cta-section relative overflow-hidden rounded-2xl border p-8"
    :style="{
      backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 60%, ${brand.colors.background})`,
      borderColor: `color-mix(in srgb, ${brand.colors.primary} 22%, transparent)`,
      boxShadow: `0 1px 0 0 color-mix(in srgb, ${brand.colors.primary} 14%, transparent) inset, 0 24px 60px -32px color-mix(in srgb, ${brand.colors.primary} 22%, transparent)`,
    }"
  >
    <!-- Subtle radial glow tinted by brand primary, top-right corner.
         Decorative; pointer-events-none so nothing here intercepts
         clicks on the buttons below. -->
    <div
      class="cta-glow pointer-events-none absolute inset-0"
      :style="{
        backgroundImage: `radial-gradient(ellipse 60% 80% at 100% 0%, color-mix(in srgb, ${brand.colors.primary} 14%, transparent) 0%, transparent 60%)`,
      }"
      aria-hidden="true"
    />

    <div class="relative flex flex-col items-center gap-5 text-center">
      <span
        class="font-mono-tab text-[11px] font-medium uppercase"
        :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
      >Próximos passos</span>

      <h2
        class="max-w-2xl font-light"
        :style="{
          color: brand.colors.text,
          fontSize: 'clamp(24px, 3.4vw, 32px)',
          lineHeight: 1.15,
          letterSpacing: '-0.5px',
        }"
      >{{ title }}</h2>

      <p
        v-if="description"
        class="max-w-xl"
        :style="{
          fontSize: '16px',
          lineHeight: 1.55,
          color: `color-mix(in srgb, ${brand.colors.text} 70%, transparent)`,
        }"
      >{{ description }}</p>

      <div class="mt-2 flex flex-wrap items-center justify-center gap-3">
        <UButton
          v-for="(button, index) in buttons"
          :key="index"
          class="normal-static-link"
          :to="button.to"
          :color="button.variant === 'primary' ? 'primary' : 'neutral'"
          :variant="
            button.variant === 'outline'
              ? 'outline'
              : button.variant === 'ghost'
                ? 'ghost'
                : 'solid'
          "
          size="lg"
          :icon="button.icon"
        >
          {{ button.label }}
        </UButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface CtaButton {
  label: string
  to: string
  icon?: string
  variant?: 'primary' | 'outline' | 'ghost'
}

interface Props {
  title: string
  description?: string
  buttons: CtaButton[]
}

defineProps<Props>()

const brand = useBrand()
</script>

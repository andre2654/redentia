<!--
  SectionHeading — eyebrow + display heading combo, stripe-style.

  The eyebrow is a mono tabular UPPERCASE micro-label (11px, 0.18em
  tracking, primary color). The heading sits below in weight 300
  with negative letter-spacing — same recipe Stripe uses to introduce
  a section without shouting.

  Sizes follow the platform-fundamentals scale via clamp() so the
  heading shrinks gracefully on mobile.

  Usage:
    <SectionHeading :brand="brand" eyebrow="01 · Conceito" title="O que são" />
-->
<template>
  <header class="flex max-w-3xl flex-col gap-2">
    <span
      class="font-mono-tab text-[11px] font-medium uppercase"
      :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
    >{{ eyebrow }}</span>
    <component
      :is="level"
      class="font-light"
      :style="{
        color: brand.colors.text,
        fontSize: titleSize,
        lineHeight: 1.1,
        letterSpacing: titleTracking,
      }"
    >{{ title }}</component>
    <p
      v-if="lead"
      class="max-w-2xl"
      :style="{
        fontSize: '17px',
        lineHeight: 1.55,
        color: `color-mix(in srgb, ${brand.colors.text} 72%, transparent)`,
      }"
    >{{ lead }}</p>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  brand: any
  eyebrow: string
  title: string
  /** Optional lead paragraph rendered below the heading. */
  lead?: string
  /** Heading element — h2 by default. Use h3 for nested sections. */
  level?: 'h1' | 'h2' | 'h3' | 'h4'
  /** Size variant — `lg` (32-44px, top-of-page) or `md` (24-30px, subsection). */
  size?: 'lg' | 'md'
}
const props = withDefaults(defineProps<Props>(), {
  level: 'h2',
  size: 'md',
  lead: '',
})

const titleSize = computed(() =>
  props.size === 'lg' ? 'clamp(28px, 4vw, 36px)' : 'clamp(22px, 2.6vw, 28px)',
)
const titleTracking = computed(() =>
  props.size === 'lg' ? '-0.6px' : '-0.4px',
)
</script>

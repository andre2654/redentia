<template>
  <section
    class="relative border-y py-14"
    :style="{
      borderColor: brand.colors.border,
      backgroundColor: brand.colors.surface,
    }"
  >
    <!-- Faint grid overlay to match hero -->
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.03]"
      :style="{
        backgroundImage: `linear-gradient(${brand.colors.text} 1px, transparent 1px), linear-gradient(90deg, ${brand.colors.text} 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      }"
    />

    <div class="relative mx-auto max-w-6xl px-6">
      <!-- Terminal-style label -->
      <div class="mb-10 flex items-center justify-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.22em]">
        <span
          class="h-px flex-1 max-w-[60px]"
          :style="{ backgroundColor: brand.colors.border }"
        />
        <span :style="{ color: brand.colors.primary }">Recursos</span>
        <span :style="{ color: brand.colors.textMuted }">, {{ brand.trustBar.text }}</span>
        <span
          class="h-px flex-1 max-w-[60px]"
          :style="{ backgroundColor: brand.colors.border }"
        />
      </div>

      <!-- Pillar grid, terminal cards with bracketed index prefix -->
      <ul
        class="mx-auto grid max-w-5xl grid-cols-2 gap-px border sm:grid-cols-3 lg:grid-cols-6"
        :style="{
          borderColor: brand.colors.border,
          backgroundColor: brand.colors.border,
        }"
      >
        <li
          v-for="(pillar, idx) in brand.trustBar.partners"
          :key="pillar"
          class="group flex flex-col items-start gap-3 p-5 transition-colors"
          :style="{
            backgroundColor: hovered === idx ? brand.colors.surfaceHover : brand.colors.surface,
          }"
          @mouseenter="hovered = idx"
          @mouseleave="hovered = -1"
        >
          <div class="flex w-full items-start justify-end">
            <UIcon
              :name="pillarIcons[idx % pillarIcons.length]"
              class="size-4 transition-colors"
              :style="{ color: hovered === idx ? brand.colors.primary : brand.colors.textMuted }"
            />
          </div>
          <span
            class="text-[12px] font-medium leading-snug"
            :style="{ color: brand.colors.text }"
          >
            {{ pillar }}
          </span>
        </li>
      </ul>

      <!-- Footnote as terminal output -->
      <p
        class="font-mono-tab mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.15em]"
        :style="{ color: brand.colors.textMuted }"
      >
        <span :style="{ color: brand.colors.primary }">&gt;</span>
        <template v-for="(part, i) in footnoteParts" :key="part">
          <span v-if="i > 0" :style="{ color: brand.colors.border }">·</span>
          <span>{{ part }}</span>
        </template>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
const brand = useBrand()

const hovered = ref(-1)

// Rotating icon pool, each pillar gets a distinct lucide icon.
const pillarIcons = [
  'i-lucide-layers',
  'i-lucide-radio',
  'i-lucide-sparkles',
  'i-lucide-calculator',
  'i-lucide-wallet',
  'i-lucide-bell',
  'i-lucide-chart-line',
  'i-lucide-shield',
]

const footnoteParts = computed(() =>
  (brand.trustBar.footnote || '').split(/\s*·\s*/).filter(Boolean)
)
</script>

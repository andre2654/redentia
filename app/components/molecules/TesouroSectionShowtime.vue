<!--
  TESOURO SECTION: SHOWTIME variant (Me Poupe!, TV pop magazine)

  Lower-third "QUADRO · GRANA SEGURA", título com highlighter, cards em
  showtime-frame com washi-tape, lista de títulos em chips com hover translate.
-->
<template>
  <section class="showtime-tesouro pt-12 md:pt-16">
    <header class="mb-8 flex flex-col gap-4 px-6 md:px-0">
      <span class="lower-third self-start">QUADRO · GRANA SEGURA</span>
      <h2
        class="font-showtime-display chunky-shadow"
        :style="{
          color: 'var(--brand-text)',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        }"
      >
        A <span class="highlighter" :style="{ color: 'var(--brand-primary)' }">grana segura</span><br />
        que rende sem susto.
      </h2>
      <p
        class="font-showtime-body max-w-xl text-base"
        :style="{ color: 'color-mix(in srgb, var(--brand-text) 80%, transparent)' }"
      >
        Tesouro Direto descomplicado, criatura. O dinheiro do governo te pagando juros, atualizado todo dia.
      </p>
    </header>

    <UCarousel
      v-slot="{ item, index }"
      class="w-full px-2 pb-4 md:px-0"
      loop
      :items="indexerSlides"
      :ui="{ item: 'basis-1/1 md:basis-1/3 xl:basis-1/4', container: 'bg-transparent gap-4' }"
    >
      <article
        class="showtime-frame relative flex w-full flex-col rounded-[24px] p-5"
        :class="index % 2 === 0 ? 'showtime-frame--tilt-left' : 'showtime-frame--tilt-right'"
        :style="{ backgroundColor: 'var(--brand-surface)' }"
      >
        <div class="washi-tape" />

        <header class="mb-4 flex items-start justify-between gap-3 border-b pb-3" :style="{ borderColor: 'color-mix(in srgb, var(--brand-text) 10%, transparent)' }">
          <div class="flex flex-col gap-1">
            <span class="font-showtime-label" :style="{ color: item.color }">
              ★ TD · {{ String(item.label).toUpperCase() }}
            </span>
            <h3
              class="font-showtime-display"
              :style="{
                color: 'var(--brand-text)',
                fontSize: 'clamp(1.15rem, 1.6vw, 1.4rem)',
              }"
            >
              {{ item.title }}
            </h3>
          </div>
          <NuxtLink
            :to="{ path: '/search', query: item.query }"
            class="font-showtime-label inline-flex items-center gap-1 transition-transform hover:translate-x-0.5"
            :style="{ color: 'var(--brand-primary)' }"
          >
            VER MAIS →
          </NuxtLink>
        </header>

        <div class="flex flex-col gap-1.5">
          <NuxtLink
            v-for="title in item.items.slice(0, 5)"
            :key="title.slug"
            :to="`/tesouro/${title.slug}`"
            class="group flex items-center justify-between gap-2 rounded-xl border-2 border-dashed px-3 py-2.5 transition-all hover:translate-x-1"
            :style="{ borderColor: `${item.color}30`, backgroundColor: `${item.color}08` }"
          >
            <div class="flex min-w-0 flex-1 flex-col">
              <span
                class="font-showtime-body text-[13px] font-bold leading-tight"
                :style="{ color: 'var(--brand-text)' }"
              >
                {{ prettyName(title.name) }}
              </span>
              <span
                class="font-showtime-label !text-[10px]"
                :style="{ color: 'color-mix(in srgb, var(--brand-text) 50%, transparent)' }"
              >
                VENCE {{ formatMaturity(title.maturity_date) }}
              </span>
            </div>
            <div class="flex flex-shrink-0 flex-col items-end">
              <span
                class="font-showtime-display tabular-nums"
                :style="{
                  color: item.color,
                  fontSize: 'clamp(0.95rem, 1.2vw, 1.1rem)',
                }"
              >
                {{ formatRate(title) }}
              </span>
              <span
                class="tabular-nums mt-0.5 text-[10.5px]"
                :style="{ color: 'color-mix(in srgb, var(--brand-text) 50%, transparent)' }"
              >
                {{ formatMoney(title.price_buy) }}
              </span>
            </div>
          </NuxtLink>

          <div
            v-if="!item.items.length"
            class="font-showtime-body py-6 text-center text-[12px] italic"
            :style="{ color: 'color-mix(in srgb, var(--brand-text) 50%, transparent)' }"
          >
            Sem titulos por aqui, criatura.
          </div>
        </div>
      </article>
    </UCarousel>
  </section>
</template>

<script setup lang="ts">
const brand = useBrand() as any

defineProps<{
  indexerSlides: any[]
  prettyName: (raw: string) => string
  formatRate: (item: any) => string
  formatMoney: (v: number | null) => string
  formatMaturity: (iso: string | null) => string
}>()
</script>

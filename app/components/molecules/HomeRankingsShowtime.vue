<!--
  HOME RANKINGS: SHOWTIME variant (Me Poupe!, TV pop magazine)

  Substitui o ranking quiet da Redentia por "quadros de programa": lower-third
  amarelo pulsando "QUADRO · QUEM SUBIU HOJE", título com highlighter na
  palavra-chave, cards em showtime-frame (border bold + sombra amber, slight
  tilt alternado) com washi-tape no canto.
-->
<template>
  <div class="showtime-rankings flex flex-col gap-14">
    <!-- MAIORES ALTAS -->
    <section>
      <header class="mb-8 flex flex-col gap-4 px-6 md:px-0">
        <span class="lower-third self-start">QUADRO · QUEM SUBIU HOJE</span>
        <h2
          class="font-showtime-display chunky-shadow"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          }"
        >
          Quem é que tá<br />
          <span class="highlighter" :style="{ color: 'var(--brand-positive)' }">bombando, criatura?</span>
        </h2>
      </header>

      <UCarousel
        v-slot="{ item, index }"
        class="w-full px-2 pb-4 md:px-0"
        loop
        :items="assetCategories"
        :ui="{ item: 'basis-1/1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4', container: 'bg-transparent gap-4' }"
      >
        <article
          class="showtime-frame relative flex w-full flex-col rounded-[24px] p-5"
          :class="index % 2 === 0 ? 'showtime-frame--tilt-left' : 'showtime-frame--tilt-right'"
          :style="{ backgroundColor: 'var(--brand-surface)' }"
        >
          <div class="washi-tape" />

          <header class="mb-4 flex items-start justify-between gap-3 border-b pb-3" :style="{ borderColor: 'color-mix(in srgb, var(--brand-text) 10%, transparent)' }">
            <div class="flex flex-col gap-1">
              <span class="font-showtime-label" :style="{ color: 'var(--brand-positive)' }">
                ↗ {{ item.label.toUpperCase() }}
              </span>
              <h3
                class="font-showtime-display"
                :style="{
                  color: 'var(--brand-text)',
                  fontSize: 'clamp(1.25rem, 1.8vw, 1.5rem)',
                }"
              >
                {{ item.label }}
              </h3>
            </div>
            <NuxtLink
              :to="{ path: '/search', query: rankingLinkQueries.top[item.key] }"
              class="font-showtime-label inline-flex items-center gap-1 transition-transform hover:translate-x-0.5"
              :style="{ color: 'var(--brand-primary)' }"
              :aria-label="`Ver todos ${item.label} em alta`"
            >
              VER MAIS →
            </NuxtLink>
          </header>

          <div class="flex flex-col gap-1">
            <AtomsTickerListItem
              v-for="stock in sliceRanking(topAssets.top[item.key])"
              :key="stock?.ticker"
              :stock="stock"
              class="rounded-lg px-2 py-1.5 transition-transform hover:translate-x-1"
              :style="{ backgroundColor: 'transparent' }"
            />
          </div>
        </article>
      </UCarousel>
    </section>

    <!-- MAIORES BAIXAS -->
    <section>
      <header class="mb-8 flex flex-col gap-4 px-6 md:px-0">
        <span class="lower-third self-start">QUADRO · QUEM DEU RUIM</span>
        <h2
          class="font-showtime-display chunky-shadow"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          }"
        >
          Os <span class="highlighter" :style="{ color: 'var(--brand-negative)' }">tombos do dia</span><br />
          em câmera lenta.
        </h2>
      </header>

      <UCarousel
        v-slot="{ item, index }"
        class="w-full px-2 pb-4 md:px-0"
        loop
        :items="assetCategories"
        :ui="{ item: 'basis-1/1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4', container: 'bg-transparent gap-4' }"
      >
        <article
          class="showtime-frame relative flex w-full flex-col rounded-[24px] p-5"
          :class="index % 2 === 0 ? 'showtime-frame--tilt-right' : 'showtime-frame--tilt-left'"
          :style="{ backgroundColor: 'var(--brand-surface)' }"
        >
          <div class="washi-tape" />

          <header class="mb-4 flex items-start justify-between gap-3 border-b pb-3" :style="{ borderColor: 'color-mix(in srgb, var(--brand-text) 10%, transparent)' }">
            <div class="flex flex-col gap-1">
              <span class="font-showtime-label" :style="{ color: 'var(--brand-negative)' }">
                ↘ {{ item.label.toUpperCase() }}
              </span>
              <h3
                class="font-showtime-display"
                :style="{
                  color: 'var(--brand-text)',
                  fontSize: 'clamp(1.25rem, 1.8vw, 1.5rem)',
                }"
              >
                {{ item.label }}
              </h3>
            </div>
            <NuxtLink
              :to="{ path: '/search', query: rankingLinkQueries.bottom[item.key] }"
              class="font-showtime-label inline-flex items-center gap-1 transition-transform hover:translate-x-0.5"
              :style="{ color: 'var(--brand-primary)' }"
              :aria-label="`Ver todos ${item.label} em queda`"
            >
              VER MAIS →
            </NuxtLink>
          </header>

          <div class="flex flex-col gap-1">
            <AtomsTickerListItem
              v-for="stock in sliceRanking(topAssets.bottom[item.key])"
              :key="stock?.ticker"
              :stock="stock"
              class="rounded-lg px-2 py-1.5 transition-transform hover:translate-x-1"
              :style="{ backgroundColor: 'transparent' }"
            />
          </div>
        </article>
      </UCarousel>
    </section>
  </div>
</template>

<script setup lang="ts">
const brand = useBrand() as any

defineProps<{
  assetCategories: Array<{ key: string; label: string }>
  topAssets: { top: Record<string, any[]>; bottom: Record<string, any[]> }
  rankingLinkQueries: { top: Record<string, any>; bottom: Record<string, any> }
  sliceRanking: (list: any[] | undefined) => any[]
}>()
</script>

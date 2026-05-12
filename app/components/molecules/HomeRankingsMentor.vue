<!--
  HOME RANKINGS: MENTOR variant (Primo Rico, book-cover masterclass)

  Substitui o ranking quiet padrão da Redentia por um layout editorial
  de "capítulo de livro" — tape laranja no topo de cada quadro com
  "CAPÍTULO · MAIORES ALTAS · ACOES", categoria em font-mentor-display
  chunky uppercase, faixa lateral amber, ticker list sem cards. Cada
  categoria (Ações / ETFs / Reits / BDRs) renderiza em UCarousel mantendo
  responsive layout, mas com gramática visual do mentor.

  Props passados pelo pai (pages/index.vue) — helpers ja existentes lá.
-->
<template>
  <div class="mentor-rankings flex flex-col gap-12">
    <!-- MAIORES ALTAS -->
    <section>
      <header class="mentor-rankings__header mb-8 flex items-end justify-between gap-6 px-6 md:px-0">
        <div class="flex flex-col gap-3">
          <span class="font-mentor-eyebrow" :style="{ color: brand.colors.positive }">
            CAPÍTULO V · ELES SUBIRAM HOJE
          </span>
          <h2
            class="font-mentor-display"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
            }"
          >
            MAIORES ALTAS
          </h2>
        </div>
        <hr class="mentor-rule hidden flex-1 md:block" :style="{ backgroundColor: brand.colors.positive, opacity: 0.6 }" />
      </header>

      <UCarousel
        v-slot="{ item }"
        class="w-full"
        loop
        :items="assetCategories"
        :ui="{ item: 'basis-1/1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4', container: 'bg-transparent' }"
      >
        <article
          class="mentor-rankings__card relative flex w-full flex-col px-2 py-4"
        >
          <!-- Faixa lateral amber: ritmo editorial de margem de livro -->
          <span
            class="absolute left-2 top-4 bottom-4 w-[3px]"
            :style="{ backgroundColor: brand.colors.positive }"
            aria-hidden="true"
          />

          <!-- Tape header: eyebrow + categoria CHUNKY -->
          <header class="mb-5 pl-4">
            <span class="font-mentor-eyebrow block" :style="{ color: brand.colors.positive }">
              ALTAS · {{ item.label.toUpperCase() }}
            </span>
            <h3
              class="font-mentor-display mt-2"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(1.5rem, 2.4vw, 2rem)',
                lineHeight: '0.92',
              }"
            >
              {{ item.label }}
            </h3>
          </header>

          <!-- Lista -->
          <div class="flex flex-col pl-4">
            <AtomsTickerListItem
              v-for="stock in sliceRanking(topAssets.top[item.key])"
              :key="stock?.ticker"
              :stock="stock"
              class="border-b py-2"
              :style="{ borderColor: `${brand.colors.text}1A` }"
            />
          </div>

          <!-- Footer link "ver todos" estilo editorial -->
          <footer class="mt-5 pl-4">
            <NuxtLink
              :to="{ path: '/search', query: rankingLinkQueries.top[item.key] }"
              class="font-mentor-eyebrow inline-flex items-center gap-2 transition-opacity hover:opacity-70"
              :style="{ color: brand.colors.primary }"
              :aria-label="`Ver todos ${item.label} em alta`"
            >
              VER QUADRO COMPLETO
              <span aria-hidden="true">→</span>
            </NuxtLink>
          </footer>
        </article>
      </UCarousel>
    </section>

    <!-- MAIORES BAIXAS -->
    <section>
      <header class="mentor-rankings__header mb-8 flex items-end justify-between gap-6 px-6 md:px-0">
        <div class="flex flex-col gap-3">
          <span class="font-mentor-eyebrow" :style="{ color: brand.colors.negative }">
            CAPÍTULO VI · ELES CAÍRAM HOJE
          </span>
          <h2
            class="font-mentor-display"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
            }"
          >
            MAIORES BAIXAS
          </h2>
        </div>
        <hr class="mentor-rule hidden flex-1 md:block" :style="{ backgroundColor: brand.colors.negative, opacity: 0.6 }" />
      </header>

      <UCarousel
        v-slot="{ item }"
        class="w-full"
        loop
        :items="assetCategories"
        :ui="{ item: 'basis-1/1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4', container: 'bg-transparent' }"
      >
        <article
          class="mentor-rankings__card relative flex w-full flex-col px-2 py-4"
        >
          <span
            class="absolute left-2 top-4 bottom-4 w-[3px]"
            :style="{ backgroundColor: brand.colors.negative }"
            aria-hidden="true"
          />

          <header class="mb-5 pl-4">
            <span class="font-mentor-eyebrow block" :style="{ color: brand.colors.negative }">
              BAIXAS · {{ item.label.toUpperCase() }}
            </span>
            <h3
              class="font-mentor-display mt-2"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(1.5rem, 2.4vw, 2rem)',
                lineHeight: '0.92',
              }"
            >
              {{ item.label }}
            </h3>
          </header>

          <div class="flex flex-col pl-4">
            <AtomsTickerListItem
              v-for="stock in sliceRanking(topAssets.bottom[item.key])"
              :key="stock?.ticker"
              :stock="stock"
              class="border-b py-2"
              :style="{ borderColor: `${brand.colors.text}1A` }"
            />
          </div>

          <footer class="mt-5 pl-4">
            <NuxtLink
              :to="{ path: '/search', query: rankingLinkQueries.bottom[item.key] }"
              class="font-mentor-eyebrow inline-flex items-center gap-2 transition-opacity hover:opacity-70"
              :style="{ color: brand.colors.primary }"
              :aria-label="`Ver todos ${item.label} em queda`"
            >
              VER QUADRO COMPLETO
              <span aria-hidden="true">→</span>
            </NuxtLink>
          </footer>
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

<style scoped>
.mentor-rankings__card {
  min-height: 280px;
}
</style>

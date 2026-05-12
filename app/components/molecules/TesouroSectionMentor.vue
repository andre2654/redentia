<!--
  TESOURO SECTION: MENTOR variant (Primo Rico, book-cover masterclass)

  Mesma estrutura editorial dos rankings mentor: capítulo, headline chunky
  uppercase, faixa lateral amber, listas em "página de livro". Cada
  indexador (IPCA+/SELIC/PRÉ/IGPM+) vira um sub-capítulo no UCarousel.
-->
<template>
  <section class="tesouro-mentor pt-12 md:pt-16">
    <header class="mb-8 flex items-end justify-between gap-6 px-6 md:px-0">
      <div class="flex flex-col gap-3">
        <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
          CAPÍTULO VII · A BASE DO PATRIMÔNIO
        </span>
        <h2
          class="font-mentor-display"
          :style="{
            color: brand.colors.text,
            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
          }"
        >
          TESOURO DIRETO
        </h2>
        <p
          class="max-w-xl text-base leading-relaxed"
          :style="{ color: `${brand.colors.text}B3` }"
        >
          Renda fixa pública: o alicerce do método ARCA. Atualização diária, sem ruído.
        </p>
      </div>
      <hr class="mentor-rule hidden flex-1 md:block" :style="{ backgroundColor: brand.colors.primary, opacity: 0.6 }" />
    </header>

    <UCarousel
      v-slot="{ item }"
      class="w-full"
      loop
      :items="indexerSlides"
      :ui="{ item: 'basis-1/1 md:basis-1/3 xl:basis-1/4', container: 'bg-transparent' }"
    >
      <article class="tesouro-mentor__card relative flex w-full flex-col px-2 py-4">
        <!-- Faixa lateral amber editorial -->
        <span
          class="absolute left-2 top-4 bottom-4 w-[3px]"
          :style="{ backgroundColor: item.color }"
          aria-hidden="true"
        />

        <header class="mb-5 pl-4">
          <span class="font-mentor-eyebrow block" :style="{ color: item.color }">
            TD · {{ String(item.label).toUpperCase() }}
          </span>
          <h3
            class="font-mentor-display mt-2"
            :style="{
              color: brand.colors.text,
              fontSize: 'clamp(1.5rem, 2.4vw, 2rem)',
              lineHeight: '0.92',
            }"
          >
            {{ item.title }}
          </h3>
        </header>

        <div class="flex flex-col pl-4">
          <NuxtLink
            v-for="title in item.items.slice(0, 5)"
            :key="title.slug"
            :to="`/tesouro/${title.slug}`"
            class="group flex items-center justify-between gap-3 border-b py-3 transition-colors"
            :style="{ borderColor: `${brand.colors.text}1A` }"
            @mouseenter="(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = `${brand.colors.primary}0D`)"
            @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')"
          >
            <div class="flex min-w-0 flex-1 flex-col">
              <span class="font-mentor-eyebrow" :style="{ color: `${brand.colors.text}80`, letterSpacing: '0.12em' }">
                VENC {{ formatMaturity(title.maturity_date) }}
              </span>
              <span
                class="font-mentor-display mt-1 truncate"
                :style="{
                  color: brand.colors.text,
                  fontSize: 'clamp(1rem, 1.2vw, 1.15rem)',
                  lineHeight: '1',
                  letterSpacing: '-0.01em',
                }"
              >
                {{ prettyName(title.name) }}
              </span>
            </div>
            <div class="flex flex-shrink-0 flex-col items-end">
              <span
                class="font-mentor-display tabular-nums"
                :style="{
                  color: item.color,
                  fontSize: 'clamp(1.05rem, 1.5vw, 1.35rem)',
                  letterSpacing: '-0.02em',
                }"
              >
                {{ formatRate(title) }}
              </span>
              <span class="tabular-nums mt-0.5 text-[11px]" :style="{ color: `${brand.colors.text}80` }">
                {{ formatMoney(title.price_buy) }}
              </span>
            </div>
          </NuxtLink>

          <div
            v-if="!item.items.length"
            class="py-6 text-center text-[12px]"
            :style="{ color: `${brand.colors.text}80` }"
          >
            Sem títulos disponíveis
          </div>
        </div>

        <footer class="mt-5 pl-4">
          <NuxtLink
            :to="{ path: '/search', query: item.query }"
            class="font-mentor-eyebrow inline-flex items-center gap-2 transition-opacity hover:opacity-70"
            :style="{ color: brand.colors.primary }"
          >
            VER QUADRO COMPLETO
            <span aria-hidden="true">→</span>
          </NuxtLink>
        </footer>
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

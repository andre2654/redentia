<!--
  TESOURO PAGE: SHOWTIME variant (Me Poupe!, "TV show / pop magazine")

  Renda fixa explicada em tom de programa de TV. Lower-third "EM FOCO",
  headline "A grana segura do tesouro", taxa em destaque chunky-shadow,
  card ficha técnica tilted com washi-tape.
-->
<template>
  <div
    class="relative z-10 flex flex-col overflow-hidden"
    :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
  >
    <!-- Top: lower-third + date -->
    <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 pt-10 md:px-10 md:pt-12">
      <span class="lower-third">EM FOCO · {{ indexerLabel }}</span>
      <span class="font-showtime-label hidden sm:inline" :style="{ color: `${brand.colors.text}80` }">
        {{ showtimeDate }}
      </span>
    </div>

    <!-- SHOW COVER -->
    <div class="relative mx-auto w-full max-w-6xl px-6 pb-10 pt-8 md:grid md:grid-cols-12 md:gap-10 md:px-10 md:pb-14 md:pt-12">
      <div class="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
        <div class="absolute left-[6%] top-[15%] size-3 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
        <div class="absolute right-[12%] top-[8%] size-4 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
        <div class="absolute right-[30%] top-[55%] size-2 rounded-full" :style="{ backgroundColor: brand.colors.positive }" />
      </div>

      <div class="relative md:col-span-7">
        <span class="font-showtime-label" :style="{ color: brand.colors.primary }">
          RENDA FIXA · {{ indexerLabel }}
        </span>

        <h1
          class="font-showtime-display chunky-shadow mt-3"
          :style="{
            color: brand.colors.text,
            fontSize: 'clamp(2.5rem, 5.5vw, 5rem)',
          }"
        >
          A grana segura<br />
          <span class="highlighter" :style="{ color: brand.colors.primary }">do tesouro!</span>
        </h1>

        <p class="font-showtime-body mt-5 max-w-xl text-base" :style="{ color: `${brand.colors.text}CC` }">
          O <strong :style="{ color: brand.colors.primary }">{{ paperName }}</strong> em linguagem de gente: quanto rende, quanto custa, quando vence. Sem letra miúda.
        </p>

        <div class="mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">
            TAXA OFERECIDA
          </span>
          <span
            class="font-showtime-display tabular-nums"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }"
          >
            {{ data?.rate ?? '—' }}<span class="text-[0.5em] opacity-70">%</span>
          </span>
          <span
            v-if="maturityDate"
            class="font-showtime-label rounded-full px-4 py-2 !text-[12px]"
            :style="{
              backgroundColor: `${brand.colors.primary}25`,
              color: brand.colors.primary,
            }"
          >
            VENCE {{ maturityDate }}
          </span>
        </div>
      </div>

      <!-- Right: ficha técnica card tilted -->
      <div class="relative mt-10 md:col-span-5 md:mt-0">
        <div
          class="showtime-frame showtime-frame--tilt-right relative rounded-[28px] p-6"
          :style="{ backgroundColor: brand.colors.surface }"
        >
          <div class="washi-tape" />
          <span class="font-showtime-label" :style="{ color: brand.colors.primary }">
            FICHA TÉCNICA
          </span>
          <h3 class="font-showtime-display mt-2" :style="{ color: brand.colors.text, fontSize: '1.5rem' }">
            O preço do papel
          </h3>
          <dl class="mt-5 flex flex-col gap-3">
            <div v-if="data?.price_buy != null" class="flex items-center justify-between">
              <dt class="font-showtime-label !text-[11px]" :style="{ color: `${brand.colors.text}80` }">
                COMPRA HOJE
              </dt>
              <dd class="font-showtime-body tabular-nums text-sm font-bold" :style="{ color: brand.colors.text }">
                {{ formatMoney(data.price_buy) }}
              </dd>
            </div>
            <div v-if="data?.price_sell != null" class="flex items-center justify-between">
              <dt class="font-showtime-label !text-[11px]" :style="{ color: `${brand.colors.text}80` }">
                VENDA
              </dt>
              <dd class="font-showtime-body tabular-nums text-sm font-bold" :style="{ color: brand.colors.positive }">
                {{ formatMoney(data.price_sell) }}
              </dd>
            </div>
            <div v-if="indexerLabel" class="flex items-center justify-between">
              <dt class="font-showtime-label !text-[11px]" :style="{ color: `${brand.colors.text}80` }">
                INDEXADOR
              </dt>
              <dd class="font-showtime-body tabular-nums text-sm font-bold" :style="{ color: brand.colors.text }">
                {{ indexerLabel }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <slot />

    <!-- CLOSING BUMPER -->
    <div class="relative py-20 md:py-28" :style="{ backgroundColor: brand.colors.surface }">
      <div class="mx-auto max-w-4xl px-6 text-center md:px-10">
        <span class="lower-third">BORA LÁ, CRIATURA!</span>
        <h2
          class="font-showtime-display chunky-shadow mt-6"
          :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 6vw, 5rem)' }"
        >
          Vale a pena pra<br />
          <span class="highlighter" :style="{ color: brand.colors.primary }">você?</span>
        </h2>
        <p class="font-showtime-body mt-6 text-base" :style="{ color: `${brand.colors.text}CC` }">
          A {{ aiName }} simula o quanto esse papel rende pro seu objetivo. Sem palpite, com matematica.
        </p>
        <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <NuxtLink
            to="/help"
            class="font-showtime-label group inline-flex items-center gap-3 rounded-full px-10 py-5 transition-transform hover:-translate-y-0.5"
            :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
          >
            <UIcon name="i-lucide-sparkles" class="size-5" />
            SIMULAR COM A {{ aiName.toUpperCase() }}
            <span class="transition-transform group-hover:translate-x-1">→</span>
          </NuxtLink>
          <NuxtLink
            to="/"
            class="font-showtime-label text-sm underline underline-offset-4 transition-opacity hover:opacity-70"
            :style="{ color: brand.colors.text }"
          >
            Voltar pro programa
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const brand = useBrand() as any

defineProps<{
  data?: any
  paperName: string
  indexerLabel: string
  maturityDate?: string
  formatMoney: (n: number | null | undefined) => string
}>()

const aiName = computed(() => brand.ai?.name || 'Na_th IA')

const showtimeDate = computed(() => {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).toUpperCase()
})
</script>

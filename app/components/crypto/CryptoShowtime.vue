<!--
  CRYPTO PAGE: SHOWTIME variant (Me Poupe!, "TV show / pop magazine")

  Versao crypto do AssetShowtime. Lower-third "EM FOCO", headline divertida
  "Cripto sem mistério, criatura!", chart em showtime-frame, closing
  bumper convidando a falar com a Na_th IA.
-->
<template>
  <div
    class="relative z-10 flex flex-col overflow-hidden"
    :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
  >
    <!-- Top: lower-third + date -->
    <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 pt-10 md:px-10 md:pt-12">
      <span class="lower-third">EM FOCO · {{ symbolUpper }}</span>
      <span class="font-showtime-label hidden sm:inline" :style="{ color: `${brand.colors.text}80` }">
        {{ showtimeDate }}
      </span>
    </div>

    <!-- SHOW COVER: headline + price + tilted FICHA TECNICA -->
    <div class="relative mx-auto w-full max-w-6xl px-6 pb-10 pt-8 md:grid md:grid-cols-12 md:gap-10 md:px-10 md:pb-14 md:pt-12">
      <div class="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
        <div class="absolute left-[6%] top-[15%] size-3 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
        <div class="absolute left-[22%] top-[70%] size-2 rounded-full" :style="{ backgroundColor: brand.colors.secondary || brand.colors.primary }" />
        <div class="absolute right-[12%] top-[8%] size-4 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
      </div>

      <div class="relative md:col-span-7">
        <div class="mb-4 flex items-center gap-3">
          <div
            v-if="crypto?.image"
            class="flex size-14 items-center justify-center overflow-hidden rounded-2xl p-1"
            :style="{ backgroundColor: brand.colors.surface, border: `2px solid ${brand.colors.primary}40` }"
          >
            <img :src="crypto.image" :alt="crypto?.name || symbolUpper" class="size-full object-contain" />
          </div>
          <span class="font-showtime-label" :style="{ color: brand.colors.primary }">
            CRIPTO · {{ symbolUpper }}{{ crypto?.rank ? ` · #${crypto.rank}` : '' }}
          </span>
        </div>

        <h1
          class="font-showtime-display chunky-shadow"
          :style="{
            color: brand.colors.text,
            fontSize: 'clamp(2.5rem, 5.5vw, 5rem)',
          }"
        >
          Cripto sem mistério,<br />
          <span class="highlighter" :style="{ color: brand.colors.primary }">criatura!</span>
        </h1>

        <p v-if="crypto?.name" class="font-showtime-body mt-5 max-w-xl text-base" :style="{ color: `${brand.colors.text}CC` }">
          A ficha completa do <strong :style="{ color: brand.colors.primary }">{{ crypto.name }}</strong>, sem jargão, sem cara feia. Bora entender o que ta rolando, criatura?
        </p>

        <div class="mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">
            PREÇO AGORA
          </span>
          <span
            class="font-showtime-display tabular-nums"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }"
          >
            R$ {{ formatPriceNumber(crypto?.price_brl) }}
          </span>
          <span
            class="font-showtime-label rounded-full px-4 py-2 !text-[12px]"
            :style="{
              backgroundColor: changePositive ? `${brand.colors.positive}25` : `${brand.colors.negative}25`,
              color: changePositive ? brand.colors.positive : brand.colors.negative,
            }"
          >
            {{ changePositive ? '+' : '' }}{{ Number(crypto?.change_24h_pct || 0).toFixed(2) }}% em 24h
          </span>
        </div>
      </div>

      <!-- Right: tilted FICHA TECNICA card -->
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
            O que ta rolando
          </h3>
          <dl class="mt-5 flex flex-col gap-3">
            <div v-if="crypto?.market_cap_brl != null" class="flex items-center justify-between">
              <dt class="font-showtime-label !text-[11px]" :style="{ color: `${brand.colors.text}80` }">
                MARKET CAP
              </dt>
              <dd class="font-showtime-body tabular-nums text-sm font-bold" :style="{ color: brand.colors.text }">
                R$ {{ formatLargeNumber(crypto.market_cap_brl) }}
              </dd>
            </div>
            <div v-if="crypto?.volume_24h_brl != null" class="flex items-center justify-between">
              <dt class="font-showtime-label !text-[11px]" :style="{ color: `${brand.colors.text}80` }">
                VOLUME 24H
              </dt>
              <dd class="font-showtime-body tabular-nums text-sm font-bold" :style="{ color: brand.colors.text }">
                R$ {{ formatLargeNumber(crypto.volume_24h_brl) }}
              </dd>
            </div>
            <div v-if="crypto?.rank" class="flex items-center justify-between">
              <dt class="font-showtime-label !text-[11px]" :style="{ color: `${brand.colors.text}80` }">
                RANKING
              </dt>
              <dd class="font-showtime-body tabular-nums text-sm font-bold" :style="{ color: brand.colors.text }">
                #{{ crypto.rank }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <!-- QUADRO 01: chart trajetoria -->
    <div class="relative py-16 md:py-20" :style="{ backgroundColor: brand.colors.surface }">
      <div class="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span class="lower-third">QUADRO 01 · A MONTANHA RUSSA</span>
            <h2
              class="font-showtime-display mt-4"
              :style="{ color: brand.colors.text, fontSize: 'clamp(2rem, 4vw, 3rem)' }"
            >
              Como o <span class="highlighter" :style="{ color: brand.colors.primary }">{{ symbolUpper }}</span> andou
            </h2>
          </div>
          <slot name="chart-controls" />
        </div>

        <div
          class="showtime-frame rounded-[28px] p-5"
          :style="{ backgroundColor: brand.colors.background, transform: 'none' }"
        >
          <slot name="chart" />
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
          Cripto da onde<br />
          <span class="highlighter" :style="{ color: brand.colors.primary }">na sua carteira?</span>
        </h2>
        <p class="font-showtime-body mt-6 text-base" :style="{ color: `${brand.colors.text}CC` }">
          A {{ aiName }} te ajuda a entender se {{ symbolUpper }} faz sentido pra você, criatura. Sem palpite, com dados.
        </p>
        <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <NuxtLink
            to="/help"
            class="font-showtime-label group inline-flex items-center gap-3 rounded-full px-10 py-5 transition-transform hover:-translate-y-0.5"
            :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
          >
            <UIcon name="i-lucide-sparkles" class="size-5" />
            FALAR COM A {{ aiName.toUpperCase() }}
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

const props = defineProps<{
  crypto?: any
  symbolUpper: string
  formatPriceNumber: (n: number | null | undefined) => string
}>()

const changePositive = computed(() => Number(props.crypto?.change_24h_pct ?? 0) >= 0)

const aiName = computed(() => brand.ai?.name || 'Na_th IA')

const showtimeDate = computed(() => {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).toUpperCase()
})

function formatLargeNumber(n: number | null | undefined): string {
  if (n == null) return '-'
  if (n >= 1e12) return (n / 1e12).toFixed(2) + ' tri'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + ' bi'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + ' mi'
  return n.toLocaleString('pt-BR')
}
</script>

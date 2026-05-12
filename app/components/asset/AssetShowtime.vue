<!--
  ASSET PAGE: SHOWTIME variant (Me Poupe!, "TV show / pop magazine")

  Restaurado 2026-05-12 do commit `0bca1f2` (linhas 1002-1349). Estrutura
  em "quadros" de programa de TV: lower-third "EM FOCO", show cover com
  highlighter, narration strip da Margarete, quadros 01-04 (chart,
  indicadores, dividendos, empresa) e closing bumper "BORA LA, CRIATURA!".

  Tipografia via .font-showtime-display/label/body, .chunky-shadow,
  .highlighter, .lower-third, .showtime-frame--tilt-left/right, .washi-tape
  (utility classes em main.css). Paleta via var(--brand-*).
-->
<template>
  <div
    class="relative z-10 flex flex-col overflow-hidden"
    :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
  >
    <!-- Top: lower-third "EM FOCO · TICKER" + date -->
    <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 pt-10 md:px-10 md:pt-12">
      <span class="lower-third">EM FOCO · {{ tickerUpper }}</span>
      <span class="font-showtime-label hidden sm:inline" :style="{ color: `${brand.colors.text}80` }">
        {{ assetEditorialDate }}
      </span>
    </div>

    <!-- SHOW COVER: "A ficha da {asset}" + giant price + tilted FICHA TECNICA -->
    <div class="relative mx-auto w-full max-w-6xl px-6 pb-10 pt-8 md:grid md:grid-cols-12 md:gap-10 md:px-10 md:pb-14 md:pt-12">
      <!-- Decorative confetti -->
      <div class="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
        <div class="absolute left-[6%] top-[15%] size-3 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
        <div class="absolute left-[22%] top-[70%] size-2 rounded-full" :style="{ backgroundColor: brand.colors.secondary || brand.colors.primary }" />
        <div class="absolute right-[12%] top-[8%] size-4 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
        <div class="absolute right-[30%] top-[55%] size-2 rounded-full" :style="{ backgroundColor: brand.colors.positive }" />
      </div>

      <!-- Left: headline + price -->
      <div class="relative md:col-span-7">
        <div class="mb-4 flex items-center gap-3">
          <div
            v-if="resolvedLogo && !failedLogos?.isFailed?.(resolvedLogo)"
            class="flex size-14 items-center justify-center overflow-hidden rounded-2xl p-1"
            :style="{ backgroundColor: brand.colors.surface, border: `2px solid ${brand.colors.primary}40` }"
          >
            <img
              :src="resolvedLogo"
              :alt="assetName || tickerUpper"
              class="size-full object-contain"
              @error="failedLogos?.markFailed?.(resolvedLogo)"
            />
          </div>
          <span class="font-showtime-label" :style="{ color: brand.colors.primary }">
            {{ assetTypeLabel }} · {{ tickerUpper }}
          </span>
        </div>

        <h1
          class="font-showtime-display chunky-shadow"
          :style="{
            color: brand.colors.text,
            fontSize: 'clamp(2.5rem, 5.5vw, 5rem)',
          }"
        >
          A ficha da<br />
          <span class="highlighter" :style="{ color: brand.colors.primary }">{{ assetName || tickerUpper }}</span>
        </h1>

        <p v-if="!isLoadingAsset && asset?.sector" class="font-showtime-body mt-5 max-w-xl text-base" :style="{ color: `${brand.colors.text}CC` }">
          Setor: <strong :style="{ color: brand.colors.primary }">{{ asset.sector }}</strong>{{ asset?.industry ? ' · ' + asset.industry : '' }}. Tudo que você precisa saber desse bicho num lugar só, criatura, sem jargão, sem cara feia.
        </p>

        <div class="mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">
            PREÇO AGORA
          </span>
          <span
            class="font-showtime-display tabular-nums"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }"
          >
            R$ {{ formatPriceNumber(asset?.market_price) }}
          </span>
          <span
            v-if="!isLoadingAsset"
            class="font-showtime-label rounded-full px-4 py-2 !text-[12px]"
            :style="{
              backgroundColor: Number(asset?.change_percent) >= 0 ? `${brand.colors.positive}25` : `${brand.colors.negative}25`,
              color: Number(asset?.change_percent) >= 0 ? brand.colors.positive : brand.colors.negative,
            }"
          >
            {{ Number(asset?.change_percent) >= 0 ? '+' : '' }}{{ Number(asset?.change_percent || 0).toFixed(2).replace('.', ',') }}% hoje
          </span>
        </div>
      </div>

      <!-- Right: quick stats card tilted with washi-tape -->
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
            O pregão de hoje
          </h3>
          <dl class="mt-5 flex flex-col gap-3">
            <div v-for="row in showtimeQuickPanel" :key="row.label" class="flex items-center justify-between">
              <dt class="font-showtime-label !text-[11px] flex items-center gap-2" :style="{ color: `${brand.colors.text}80` }">
                <UIcon :name="row.icon" class="size-3.5" :style="{ color: brand.colors.primary }" />
                {{ row.label }}
              </dt>
              <dd class="font-showtime-body tabular-nums text-sm font-bold" :style="{ color: brand.colors.text }">
                {{ row.value }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <!-- Margarete narration strip -->
    <div v-if="mascotImage" class="mx-auto w-full max-w-6xl px-6 pb-8 md:px-10">
      <div
        class="flex items-start gap-4 rounded-3xl border-2 border-dashed p-5"
        :style="{ borderColor: `${brand.colors.primary}60`, backgroundColor: `${brand.colors.primary}10` }"
      >
        <img :src="mascotImage" alt="Mascote" class="h-14 shrink-0" />
        <p class="font-showtime-body text-sm italic" :style="{ color: `${brand.colors.text}CC` }">
          <strong :style="{ color: brand.colors.primary }">{{ mascotName }} diz:</strong>
          olha só, criatura, esses números ficam subindo e descendo todo dia, é normal. O importante não é o preço de HOJE, é o fundamento. Vamos destrinchar tudo aqui embaixo, beleza?
        </p>
      </div>
    </div>

    <!-- QUADRO 01: chart (slot) -->
    <div class="relative py-16 md:py-20" :style="{ backgroundColor: brand.colors.surface }">
      <div class="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span class="lower-third">QUADRO 01 · COMO ESSE BICHO ANDOU</span>
            <h2
              class="font-showtime-display mt-4"
              :style="{ color: brand.colors.text, fontSize: 'clamp(2rem, 4vw, 3rem)' }"
            >
              A montanha-russa do<br />
              <span class="highlighter" :style="{ color: brand.colors.primary }">{{ tickerUpper }}</span>
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

    <!-- Wooden spoon divider (mascote rotated 90deg) -->
    <div v-if="mascotImage" class="flex items-center justify-center gap-6 py-6">
      <div class="h-[2px] max-w-[180px] flex-1" :style="{ backgroundColor: `${brand.colors.primary}55` }" />
      <img :src="mascotImage" alt="Mascote" class="h-16" style="transform: rotate(90deg);" />
      <div class="h-[2px] max-w-[180px] flex-1" :style="{ backgroundColor: `${brand.colors.primary}55` }" />
    </div>

    <!-- QUADRO 02: Indicadores como cartoes colecionaveis -->
    <div v-if="brand.assetPage?.showIndicators !== false && showtimeIndicatorCards.length > 0" class="relative py-16 md:py-20">
      <div class="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div class="mb-10 text-center">
          <span class="lower-third">QUADRO 02 · O QUE OS NÚMEROS DIZEM</span>
          <h2
            class="font-showtime-display mt-5"
            :style="{ color: brand.colors.text, fontSize: 'clamp(2rem, 4vw, 3rem)' }"
          >
            Indicadores traduzidos<br />
            <span class="highlighter" :style="{ color: brand.colors.primary }">pra gente normal</span>
          </h2>
          <p class="font-showtime-body mx-auto mt-6 max-w-2xl text-base" :style="{ color: `${brand.colors.text}CC` }">
            Esses nomes parecem coisa de outro planeta mas são só ferramentas pra entender se a empresa é saudável. Respira, criatura. Vamos com calma.
          </p>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(card, idx) in showtimeIndicatorCards"
            :key="card.label"
            class="showtime-frame relative rounded-[24px] p-5"
            :class="idx % 2 === 0 ? 'showtime-frame--tilt-left' : 'showtime-frame--tilt-right'"
            :style="{ backgroundColor: brand.colors.surface }"
          >
            <div class="washi-tape" />
            <div
              class="mb-4 flex size-12 items-center justify-center rounded-full"
              :style="{ backgroundColor: `${brand.colors.primary}25` }"
            >
              <UIcon :name="card.icon" class="size-6" :style="{ color: brand.colors.primary }" />
            </div>
            <span class="font-showtime-label" :style="{ color: `${brand.colors.text}80` }">
              {{ card.label }}
            </span>
            <div
              class="font-showtime-display mt-1 tabular-nums"
              :style="{ color: brand.colors.text, fontSize: '2rem' }"
            >
              {{ card.value }}
            </div>
            <p class="font-showtime-body mt-3 !text-[12px] italic" :style="{ color: `${brand.colors.text}B3` }">
              &ldquo;{{ card.explain }}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- QUADRO 03: Dividendos (slot pro pai injetar HTML ou via prop) -->
    <slot name="dividends" />

    <!-- QUADRO 04: Sobre a empresa -->
    <div v-if="brand.assetPage?.showCompanyInfo !== false && asset?.description" class="relative py-16 md:py-20">
      <div class="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div class="grid gap-10 md:grid-cols-12">
          <div class="md:col-span-5">
            <span class="lower-third">QUADRO 04 · QUEM É ESSA EMPRESA</span>
            <h2
              class="font-showtime-display mt-5"
              :style="{ color: brand.colors.text, fontSize: 'clamp(2rem, 4vw, 3rem)' }"
            >
              Afinal, o que a<br />
              <span class="highlighter" :style="{ color: brand.colors.primary }">{{ assetName }}</span> faz?
            </h2>
            <p class="font-showtime-body mt-5 text-base" :style="{ color: `${brand.colors.text}CC` }">
              Antes de investir no bicho, você precisa saber o que ele come, onde dorme e como ganha dinheiro, criatura. Regra número 1 da Nath.
            </p>
          </div>
          <div class="md:col-span-7">
            <div
              class="showtime-frame showtime-frame--tilt-right rounded-[28px] p-6"
              :style="{ backgroundColor: brand.colors.surface }"
            >
              <div class="washi-tape" />
              <p class="font-showtime-body text-[15px] leading-relaxed" :style="{ color: `${brand.colors.text}E6` }">
                {{ asset.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Extras slot (Buy & Hold checklist, news, etc) -->
    <slot />

    <!-- CLOSING BUMPER: "Ficou com dúvida, criatura?" + CTA Na_th IA -->
    <div class="relative py-20 md:py-28" :style="{ backgroundColor: brand.colors.surface }">
      <div class="mx-auto max-w-4xl px-6 text-center md:px-10">
        <span class="lower-third">BORA LÁ, CRIATURA!</span>
        <h2
          class="font-showtime-display chunky-shadow mt-6"
          :style="{ color: brand.colors.text, fontSize: 'clamp(2.5rem, 6vw, 5rem)' }"
        >
          Ficou com dúvida,<br />
          <span class="highlighter" :style="{ color: brand.colors.primary }">criatura?</span>
        </h2>
        <p class="font-showtime-body mt-6 text-base" :style="{ color: `${brand.colors.text}CC` }">
          A {{ aiName }} tá acordada 24h pra te ajudar a entender qualquer coisa sobre o {{ tickerUpper }}. Pergunte sem medo.
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
  asset?: any
  tickerUpper: string
  assetName?: string
  resolvedLogo?: string | null
  isLoadingAsset?: boolean
  failedLogos?: { isFailed?: (url: string) => boolean; markFailed?: (url: string) => void }
  formatPriceNumber: (n: number | null | undefined) => string
  showtimeQuickPanel: Array<{ label: string; value: string; icon: string }>
  showtimeIndicatorCards: Array<{ label: string; value: string; icon: string; explain: string }>
  assetEditorialDate?: string
}>()

const assetTypeLabel = computed(() => {
  const t = (props.asset?.type || 'AÇÃO').toString().toUpperCase()
  return t === 'REIT' ? 'FUNDO IMOBILIÁRIO' : 'AÇÃO'
})

// Mascote da brand (Margarete pra Me Poupe). Cada tenant pode setar seu
// proprio mascote via brand.mascot.{image, name}.
const mascotImage = computed(() => {
  return brand.mascot?.image || '/brand/mepoupe/margarete.svg'
})
const mascotName = computed(() => brand.mascot?.name || 'Margarete')

// AI assistant name — vem do brand pra cada tenant ter seu proprio (Na_th IA
// pro Me Poupe, Assessor Patrimonial pro Primo Rico — embora aqui o tenant
// usa showtime so o Me Poupe).
const aiName = computed(() => {
  return brand.ai?.name || 'Na_th IA'
})
</script>

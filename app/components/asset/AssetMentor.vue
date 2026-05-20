<!--
  ASSET PAGE: MENTOR variant (Primo Rico, "masterclass / book-cover")

  Restaurado 2026-05-12 do commit `0bca1f2` (linhas 624-1001). Foi deletado
  na Phase 4 quando achamos que nenhum tenant usava `assetPage.variant`,
  mas o Primo Rico tinha `variant: "mentor"` no JSONB e a deleção causou
  perda de identidade. Agora cada variant e um componente proprio plugado
  via `<asset/AssetMentor>` na page pai por `v-if`.

  Layout: capitulos editoriais I-IV + Capitulo Final.
    I.   FICHA TECNICA (hero assimetrico 4/8: logo+setor | TICKER+preco)
    II.  A TRAJETORIA  (chart historico)
    III. AS METRICAS QUE IMPORTAM (fundamentals em grid numerado)
    IV.  A TESE (thesis text + resumo em 1 linha)
    Final. DECIDA COM DADOS. (CTA closing)

  Tipografia via .font-mentor-display, .font-mentor-eyebrow, .font-mentor-quote,
  .mentor-rule (utility classes em main.css). Cores via var(--brand-*).
-->
<template>
  <div
    class="relative z-10 flex flex-col"
    :style="{ backgroundColor: 'var(--brand-background)', color: 'var(--brand-text)' }"
  >
    <!-- Top tape: thick orange strip with "MANUAL DO PRIMO · FICHA TECNICA" -->
    <div
      class="relative flex items-center gap-4 px-6 py-3 md:px-10"
      :style="{ backgroundColor: 'var(--brand-primary)', color: 'var(--brand-background)' }"
    >
      <span class="font-mentor-eyebrow">MANUAL DO PRIMO · FICHA TÉCNICA</span>
      <span class="flex-1 border-t" :style="{ borderColor: 'color-mix(in srgb, var(--brand-background) 25%, transparent)' }" />
      <span class="font-mentor-eyebrow">{{ tickerUpper }} · {{ assetTypeLabel }}</span>
    </div>

    <!-- HERO: asymmetric split with oversized ticker + price -->
    <div class="relative grid gap-0 md:grid-cols-12">
      <!-- Left column: logo + sector/industry -->
      <div
        class="relative flex flex-col justify-end px-6 py-10 md:col-span-4 md:px-10 md:py-14"
        :style="{ backgroundColor: 'var(--brand-tertiary)' || 'var(--brand-surface)' }"
      >
        <!-- Vertical orange strip on right edge -->
        <div class="absolute right-0 top-0 h-full w-1" :style="{ backgroundColor: 'var(--brand-primary)' }" />
        <img
          v-if="resolvedLogo && !isLoadingAsset && !failedLogos?.isFailed?.(resolvedLogo)"
          :src="resolvedLogo"
          :alt="assetName || tickerUpper"
          class="mb-6 h-20 w-20 rounded-2xl object-cover shadow-2xl"
          @error="failedLogos?.markFailed?.(resolvedLogo)"
        />
        <span class="font-mentor-eyebrow" :style="{ color: 'var(--brand-primary)' }">
          O ATIVO
        </span>
        <h1
          class="font-mentor-display mt-2"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(2.5rem, 4.5vw, 4rem)',
            lineHeight: '0.85',
          }"
        >
          {{ assetName || tickerUpper }}
        </h1>
        <div class="mt-6 flex flex-col gap-1">
          <span class="font-mentor-eyebrow" :style="{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }">
            SETOR
          </span>
          <span class="text-sm font-semibold uppercase" :style="{ color: 'color-mix(in srgb, var(--brand-text) 80%, transparent)' }">
            {{ asset?.sector || '-' }}
          </span>
        </div>
        <div v-if="asset?.industry" class="mt-4 flex flex-col gap-1">
          <span class="font-mentor-eyebrow" :style="{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }">
            INDÚSTRIA
          </span>
          <span class="text-sm font-semibold uppercase" :style="{ color: 'color-mix(in srgb, var(--brand-text) 80%, transparent)' }">
            {{ asset.industry }}
          </span>
        </div>
      </div>

      <!-- Right column: price monumental + change + stats -->
      <div class="flex flex-col justify-center px-6 py-14 md:col-span-8 md:px-14 md:py-20">
        <span class="font-mentor-eyebrow" :style="{ color: 'var(--brand-primary)' }">
          CAPÍTULO I · COTAÇÃO DE HOJE
        </span>

        <!-- Massive ticker as headline -->
        <h2
          class="font-mentor-display mt-4"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(4rem, 8.5vw, 8.5rem)',
            lineHeight: '0.85',
          }"
        >
          {{ tickerUpper }}
        </h2>

        <!-- Price block -->
        <div class="mt-8 flex flex-wrap items-baseline gap-6">
          <div class="flex flex-col">
            <span class="font-mentor-eyebrow" :style="{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }">
              PREÇO ATUAL
            </span>
            <div class="mt-2 flex items-baseline gap-3">
              <span class="font-mentor-display text-xl" :style="{ color: 'color-mix(in srgb, var(--brand-text) 50%, transparent)' }">
                R$
              </span>
              <span
                class="font-mentor-display tabular-nums"
                :style="{
                  color: 'var(--brand-text)',
                  fontSize: 'clamp(3rem, 6vw, 5.5rem)',
                }"
              >
                {{ formatPriceNumber(asset?.market_price) }}
              </span>
            </div>
          </div>

          <div class="flex flex-col">
            <span class="font-mentor-eyebrow" :style="{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }">
              HOJE
            </span>
            <span
              class="font-mentor-display mt-2 tabular-nums"
              :style="{
                color: Number(asset?.change_percent) >= 0 ? 'var(--brand-positive)' : 'var(--brand-negative)',
                fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              }"
            >
              {{ Number(asset?.change_percent) >= 0 ? '+' : '' }}{{ Number(asset?.change_percent || 0).toFixed(2).replace('.', ',') }}%
            </span>
          </div>
        </div>

        <!-- Chunky orange rule -->
        <hr class="mentor-rule mt-10 max-w-[6rem]" :style="{ backgroundColor: 'var(--brand-primary)' }" />

        <!-- Quick stats: 4 blocks (DY/PL/PVP/ROE) -->
        <div
          class="mt-10 grid gap-px"
          :class="basicIndicators ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'"
          :style="{ backgroundColor: `${'var(--brand-text)'}18` }"
        >
          <template v-if="basicIndicators">
            <div
              v-for="item in mentorQuickStats"
              :key="item.label"
              class="flex flex-col gap-2 px-5 py-6"
              :style="{ backgroundColor: 'var(--brand-background)' }"
            >
              <span
                class="font-mentor-display tabular-nums"
                :style="{
                  color: 'var(--brand-text)',
                  fontSize: 'clamp(1.75rem, 2.5vw, 2.25rem)',
                }"
              >
                {{ item.value || '-' }}
              </span>
              <span
                class="text-[10px] font-bold uppercase tracking-wider"
                :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }"
              >
                {{ item.label }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- CAPITULO II: A TRAJETORIA (chart) -->
    <div
      class="border-t border-b py-16 md:py-20"
      :style="{ borderColor: 'color-mix(in srgb, var(--brand-text) 8%, transparent)', backgroundColor: 'var(--brand-surface)' }"
    >
      <div class="mx-auto max-w-6xl px-6 md:px-10">
        <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div class="flex flex-col gap-2">
            <span class="font-mentor-eyebrow" :style="{ color: 'var(--brand-primary)' }">
              CAPÍTULO II
            </span>
            <h2
              class="font-mentor-display"
              :style="{
                color: 'var(--brand-text)',
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              }"
            >
              A TRAJETÓRIA
            </h2>
          </div>
          <!-- Chart period selector slot — pai passa via #chart-controls -->
          <slot name="chart-controls" />
        </div>
        <!-- Chart slot — pai injeta o componente de grafico (AtomsGraphLine, etc) -->
        <slot name="chart" />
      </div>
    </div>

    <!-- CAPITULO de pausa: PAUSA PARA REFLEXAO (pull quote) -->
    <div
      class="border-b py-20 md:py-24"
      :style="{ borderColor: 'color-mix(in srgb, var(--brand-text) 8%, transparent)' }"
    >
      <div class="mx-auto max-w-6xl px-6 md:px-10">
        <span class="font-mentor-eyebrow" :style="{ color: 'var(--brand-primary)' }">
          PAUSA PARA REFLEXÃO
        </span>
        <blockquote
          class="font-mentor-quote mt-6 leading-[0.9]"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(2rem, 5.5vw, 5rem)',
          }"
        >
          &ldquo;{{ mentorAssetQuote }}&rdquo;
        </blockquote>
        <div class="mt-8 flex items-center gap-4">
          <div class="h-[2px] w-12" :style="{ backgroundColor: 'var(--brand-primary)' }" />
          <span class="font-mentor-eyebrow" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">
            {{ (brand.founder?.name || 'THIAGO NIGRO').toUpperCase() }} · {{ founderTagline }}
          </span>
        </div>
      </div>
    </div>

    <!-- CAPITULO III: AS METRICAS QUE IMPORTAM (fundamentals numerados) -->
    <div v-if="brand.assetPage?.showIndicators !== false" class="mx-auto w-full max-w-6xl px-6 py-20 md:px-10 md:py-28">
      <div class="mb-12 flex flex-col gap-3">
        <span class="font-mentor-eyebrow" :style="{ color: 'var(--brand-primary)' }">
          CAPÍTULO III
        </span>
        <h2
          class="font-mentor-display"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
          }"
        >
          AS MÉTRICAS QUE IMPORTAM
        </h2>
        <p class="max-w-2xl text-base" :style="{ color: 'color-mix(in srgb, var(--brand-text) 70%, transparent)' }">
          Os números que um investidor disciplinado olha antes de apertar o botão. Sem ruído, sem hype.
        </p>
      </div>

      <!-- Fundamentals list: 6 numbered rows, chunky -->
      <div class="grid gap-0 border" :style="{ borderColor: 'color-mix(in srgb, var(--brand-text) 8%, transparent)' }">
        <div
          v-for="(item, idx) in mentorFundamentalsList"
          :key="item.label"
          class="group grid items-start gap-6 border-t px-6 py-6 transition-colors md:grid-cols-12 md:gap-10 md:px-10 md:py-8"
          :class="idx === 0 && '!border-t-0'"
          :style="{ borderColor: 'color-mix(in srgb, var(--brand-text) 8%, transparent)' }"
          @mouseenter="onRowEnter"
          @mouseleave="onRowLeave"
        >
          <div class="md:col-span-1">
            <span
              class="font-mentor-display"
              :style="{ color: 'var(--brand-primary)', fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }"
            >
              {{ String(idx + 1).padStart(2, '0') }}
            </span>
          </div>
          <div class="md:col-span-4 md:pl-2">
            <span
              class="font-mentor-display"
              :style="{ color: 'var(--brand-text)', fontSize: 'clamp(1.5rem, 2.2vw, 2rem)', lineHeight: '0.9' }"
            >
              {{ item.label }}
            </span>
            <span
              class="mt-2 block font-mentor-eyebrow"
              :style="{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }"
            >
              {{ item.shortCode }}
            </span>
          </div>
          <div class="md:col-span-5 md:pl-2">
            <p class="text-sm leading-relaxed md:text-base" :style="{ color: 'color-mix(in srgb, var(--brand-text) 80%, transparent)' }">
              {{ item.description }}
            </p>
          </div>
          <div class="md:col-span-2 md:text-right">
            <span
              class="font-mentor-display tabular-nums"
              :style="{ color: 'var(--brand-text)', fontSize: 'clamp(2rem, 3.5vw, 3rem)' }"
            >
              {{ item.value || '-' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- CAPITULO IV: A TESE -->
    <div
      v-if="mentorThesisText"
      class="border-t border-b py-20 md:py-24"
      :style="{ borderColor: 'color-mix(in srgb, var(--brand-text) 8%, transparent)', backgroundColor: 'var(--brand-surface)' }"
    >
      <div class="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-12 md:px-10">
        <div class="md:col-span-4">
          <span class="font-mentor-eyebrow" :style="{ color: 'var(--brand-primary)' }">
            CAPÍTULO IV
          </span>
          <h2
            class="font-mentor-display mt-3"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              lineHeight: '0.9',
            }"
          >
            A TESE
          </h2>
        </div>
        <div class="md:col-span-8">
          <p
            class="text-lg leading-relaxed md:text-xl"
            :style="{ color: 'color-mix(in srgb, var(--brand-text) 90%, transparent)' }"
          >
            {{ mentorThesisText }}
          </p>
          <hr class="mentor-rule mt-10 max-w-[4rem]" :style="{ backgroundColor: 'var(--brand-primary)' }" />
          <p class="mt-8 font-mentor-eyebrow" :style="{ color: 'color-mix(in srgb, var(--brand-text) 50%, transparent)' }">
            RESUMO EM UMA LINHA
          </p>
          <p
            class="font-mentor-display mt-2 leading-tight"
            :style="{
              color: 'var(--brand-text)',
              fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
            }"
          >
            {{ mentorOneLiner }}
          </p>
        </div>
      </div>
    </div>

    <!-- Default slot for extras (Buy & Hold checklist, news, dividend chart, etc) -->
    <slot />

    <!-- CAPITULO FINAL: DECIDA COM DADOS -->
    <div class="mx-auto max-w-6xl px-6 py-24 text-center md:px-10 md:py-32">
      <span class="font-mentor-eyebrow" :style="{ color: 'var(--brand-primary)' }">
        CAPÍTULO FINAL
      </span>
      <h2
        class="font-mentor-display mt-6"
        :style="{
          color: 'var(--brand-text)',
          fontSize: 'clamp(3rem, 9vw, 9rem)',
        }"
      >
        DECIDA
        <br />
        <span :style="{ color: 'var(--brand-primary)' }">COM DADOS.</span>
      </h2>
      <p class="mx-auto mt-8 max-w-xl text-base md:text-lg" :style="{ color: 'color-mix(in srgb, var(--brand-text) 70%, transparent)' }">
        Fundamentos, não opinião. Paciência, não timing. Método ARCA, não sorte.
      </p>
      <div class="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
        <NuxtLink
          to="/auth/register"
          class="group inline-flex items-center gap-3 px-10 py-5 transition-transform hover:-translate-y-0.5"
          :style="{
            backgroundColor: 'var(--brand-primary)',
            color: 'var(--brand-background)',
          }"
        >
          <span class="font-mentor-eyebrow !text-[13px]" style="letter-spacing: 0.18em;">COMEÇAR A CONSTRUIR</span>
          <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
        </NuxtLink>
        <span class="font-mentor-eyebrow" :style="{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }">
          GRÁTIS · SEM CARTÃO · ACESSO IMEDIATO
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const brand = useBrand() as any

// Props — all values that vary per asset come from parent page. Helpers
// (mentorQuickStats, mentorFundamentalsList, mentorAssetQuote, mentorThesisText,
// mentorOneLiner) are computeds already declared in pages/asset/[ticker].vue —
// parent passes them down. Keeping the components dumb avoids duplicating logic.
const props = defineProps<{
  asset?: any
  tickerUpper: string
  assetName?: string
  resolvedLogo?: string | null
  isLoadingAsset?: boolean
  failedLogos?: { isFailed?: (url: string) => boolean; markFailed?: (url: string) => void }
  formatPriceNumber: (n: number | null | undefined) => string
  basicIndicators?: any
  mentorQuickStats: Array<{ label: string; value: string }>
  mentorFundamentalsList: Array<{ label: string; shortCode: string; description: string; value: string }>
  mentorAssetQuote: string
  mentorThesisText: string
  mentorOneLiner?: string
  founderTagline?: string
}>()

const assetTypeLabel = computed(() => {
  const t = (props.asset?.type || 'AÇÃO').toString().toUpperCase()
  return t === 'REIT' ? 'FII' : 'AÇÃO'
})

const founderTagline = computed(() => {
  return props.founderTagline || 'DO MIL AO MILHÃO'
})

function onRowEnter(e: MouseEvent) {
  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'color-mix(in srgb, var(--brand-primary) 5%, transparent)'
}
function onRowLeave(e: MouseEvent) {
  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
}
</script>

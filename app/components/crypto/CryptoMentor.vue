<!--
  CRYPTO PAGE: MENTOR variant (Primo Rico, "book-cover masterclass")

  Versao simplificada do AssetMentor para o universo cripto. Mantem a
  estrutura editorial (top tape "MANUAL DO PRIMO · ATIVO DIGITAL", grid 4/8
  com ticker monumental + preço, capitulo II de chart) mas dispensa a parte
  de fundamentals (P/L, ROE etc. nao fazem sentido em cripto).

  Tipografia via utility classes .font-mentor-* declaradas em main.css.
-->
<template>
  <div
    class="relative z-10 flex flex-col"
    :style="{ backgroundColor: 'var(--brand-background)', color: 'var(--brand-text)' }"
  >
    <!-- Top tape: faixa laranja editorial -->
    <div
      class="relative flex items-center gap-4 px-6 py-3 md:px-10"
      :style="{ backgroundColor: 'var(--brand-primary)', color: 'var(--brand-background)' }"
    >
      <span class="font-mentor-eyebrow">MANUAL DO PRIMO · ATIVO DIGITAL</span>
      <span class="flex-1 border-t" :style="{ borderColor: 'color-mix(in srgb, var(--brand-background) 25%, transparent)' }" />
      <span class="font-mentor-eyebrow">{{ symbolUpper }} · CRIPTO</span>
    </div>

    <!-- HERO grid 4/8: logo+identidade | symbol monumental + price -->
    <div class="relative grid gap-0 md:grid-cols-12">
      <!-- Left: logo + rank/categoria -->
      <div
        class="relative flex flex-col justify-end px-6 py-10 md:col-span-4 md:px-10 md:py-14"
        :style="{ backgroundColor: 'var(--brand-tertiary)' || 'var(--brand-surface)' }"
      >
        <div class="absolute right-0 top-0 h-full w-1" :style="{ backgroundColor: 'var(--brand-primary)' }" />
        <img
          v-if="crypto?.image"
          :src="crypto.image"
          :alt="crypto?.name || symbolUpper"
          class="mb-6 h-20 w-20 rounded-[14px] object-cover"
        />
        <span class="font-mentor-eyebrow" :style="{ color: 'var(--brand-primary)' }">
          O ATIVO DIGITAL
        </span>
        <h1
          class="font-mentor-display mt-2"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(2.5rem, 4.5vw, 4rem)',
            lineHeight: '0.85',
          }"
        >
          {{ crypto?.name || symbolUpper }}
        </h1>
        <div v-if="crypto?.rank" class="mt-6 flex flex-col gap-1">
          <span class="font-mentor-eyebrow" :style="{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }">
            RANKING GLOBAL
          </span>
          <span class="text-sm font-semibold uppercase" :style="{ color: 'color-mix(in srgb, var(--brand-text) 80%, transparent)' }">
            #{{ crypto.rank }} POR MARKET CAP
          </span>
        </div>
      </div>

      <!-- Right: symbol monumental + price -->
      <div class="flex flex-col justify-center px-6 py-14 md:col-span-8 md:px-14 md:py-20">
        <span class="font-mentor-eyebrow" :style="{ color: 'var(--brand-primary)' }">
          CAPÍTULO I · COTAÇÃO ATUAL
        </span>
        <h2
          class="font-mentor-display mt-4"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(4rem, 8.5vw, 8.5rem)',
            lineHeight: '0.85',
          }"
        >
          {{ symbolUpper }}
        </h2>

        <div class="mt-8 flex flex-wrap items-baseline gap-6">
          <div class="flex flex-col">
            <span class="font-mentor-eyebrow" :style="{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }">
              PREÇO BRL
            </span>
            <div class="mt-2 flex items-baseline gap-3">
              <span class="font-mentor-display text-xl" :style="{ color: 'color-mix(in srgb, var(--brand-text) 50%, transparent)' }">
                R$
              </span>
              <span
                class="font-mentor-display tabular-nums"
                :style="{
                  color: 'var(--brand-text)',
                  fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                }"
              >
                {{ formatPriceNumber(crypto?.price_brl) }}
              </span>
            </div>
          </div>

          <div class="flex flex-col">
            <span class="font-mentor-eyebrow" :style="{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }">
              24H
            </span>
            <span
              class="font-mentor-display mt-2 tabular-nums"
              :style="{
                color: changePositive ? 'var(--brand-positive)' : 'var(--brand-negative)',
                fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              }"
            >
              {{ changePositive ? '+' : '' }}{{ Number(crypto?.change_24h_pct || 0).toFixed(2) }}%
            </span>
          </div>
        </div>

        <hr class="mentor-rule mt-10 max-w-[6rem]" :style="{ backgroundColor: 'var(--brand-primary)' }" />
      </div>
    </div>

    <!-- CAPITULO II: chart trajetoria (via slot) -->
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
          <slot name="chart-controls" />
        </div>
        <slot name="chart" />
      </div>
    </div>

    <!-- Pull quote about crypto -->
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
            fontSize: 'clamp(2rem, 5vw, 4.5rem)',
          }"
        >
          &ldquo;CRIPTO E ATIVO DE RISCO. ALOCAÇÃO PEQUENA, CONVICÇÃO ALTA.&rdquo;
        </blockquote>
        <div class="mt-8 flex items-center gap-4">
          <div class="h-[2px] w-12" :style="{ backgroundColor: 'var(--brand-primary)' }" />
          <span class="font-mentor-eyebrow" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">
            {{ (brand.founder?.name || 'THIAGO NIGRO').toUpperCase() }} · MÉTODO ARCA
          </span>
        </div>
      </div>
    </div>

    <!-- Slot pra extras (related cards, news, etc) -->
    <slot />

    <!-- Closing CTA -->
    <div class="mx-auto max-w-6xl px-6 py-24 text-center md:px-10 md:py-32">
      <span class="font-mentor-eyebrow" :style="{ color: 'var(--brand-primary)' }">
        CAPÍTULO FINAL
      </span>
      <h2
        class="font-mentor-display mt-6"
        :style="{
          color: 'var(--brand-text)',
          fontSize: 'clamp(3rem, 8vw, 8rem)',
        }"
      >
        DIVERSIFIQUE
        <br />
        <span :style="{ color: 'var(--brand-primary)' }">COM MÉTODO.</span>
      </h2>
      <p class="mx-auto mt-8 max-w-xl text-base md:text-lg" :style="{ color: 'color-mix(in srgb, var(--brand-text) 70%, transparent)' }">
        Cripto e a quarta ponta do ARCA: Ativos Alternativos. Pequena exposicao, alto retorno assimetrico.
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
          <span class="font-mentor-eyebrow !text-[13px]" style="letter-spacing: 0.18em;">MONTAR CARTEIRA ARCA</span>
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
import type { CryptoAssetItem } from '~/services/crypto'

// Only the founder name is read off the (loose tenant JSON) brand config here.
interface MentorBrand {
  founder?: { name?: string }
}

const brand = useBrand() as MentorBrand

const props = defineProps<{
  crypto?: CryptoAssetItem | null
  symbolUpper: string
  formatPriceNumber: (n: number | null | undefined) => string
}>()

const changePositive = computed(() => Number(props.crypto?.change_24h_pct ?? 0) >= 0)
</script>

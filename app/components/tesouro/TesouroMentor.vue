<!--
  TESOURO PAGE: MENTOR variant (Primo Rico, "book-cover masterclass")

  Tesouro Direto e renda fixa — base solida do ARCA (C = Caixa). O variant
  mentor enfatiza esse papel "alicerce" com tape "MANUAL DO PRIMO · RENDA FIXA",
  capitulo I com nome do papel monumental + taxa em destaque, capitulo II
  para tabela compra/venda + vencimento.
-->
<template>
  <div
    class="relative z-10 flex flex-col"
    :style="{ backgroundColor: 'var(--brand-background)', color: 'var(--brand-text)' }"
  >
    <!-- Top tape -->
    <div
      class="relative flex items-center gap-4 px-6 py-3 md:px-10"
      :style="{ backgroundColor: 'var(--brand-primary)', color: 'var(--brand-background)' }"
    >
      <span class="font-mentor-eyebrow">MANUAL DO PRIMO · RENDA FIXA</span>
      <span class="flex-1 border-t" :style="{ borderColor: 'color-mix(in srgb, var(--brand-background) 25%, transparent)' }" />
      <span class="font-mentor-eyebrow">{{ indexerLabel }}</span>
    </div>

    <!-- HERO grid 4/8 -->
    <div class="relative grid gap-0 md:grid-cols-12">
      <!-- Left: indexador + vencimento -->
      <div
        class="relative flex flex-col justify-end px-6 py-10 md:col-span-4 md:px-10 md:py-14"
        :style="{ backgroundColor: 'var(--brand-tertiary)' || 'var(--brand-surface)' }"
      >
        <div class="absolute right-0 top-0 h-full w-1" :style="{ backgroundColor: 'var(--brand-primary)' }" />
        <span class="font-mentor-eyebrow" :style="{ color: 'var(--brand-primary)' }">
          O PAPEL
        </span>
        <h1
          class="font-mentor-display mt-2"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(2rem, 4vw, 3.25rem)',
            lineHeight: '0.85',
          }"
        >
          {{ paperName }}
        </h1>
        <div class="mt-6 flex flex-col gap-1">
          <span class="font-mentor-eyebrow" :style="{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }">
            INDEXADOR
          </span>
          <span class="text-sm font-semibold uppercase" :style="{ color: 'color-mix(in srgb, var(--brand-text) 80%, transparent)' }">
            {{ indexerLabel }}
          </span>
        </div>
        <div v-if="maturityDate" class="mt-4 flex flex-col gap-1">
          <span class="font-mentor-eyebrow" :style="{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }">
            VENCIMENTO
          </span>
          <span class="text-sm font-semibold uppercase" :style="{ color: 'color-mix(in srgb, var(--brand-text) 80%, transparent)' }">
            {{ maturityDate }}
          </span>
        </div>
      </div>

      <!-- Right: taxa monumental -->
      <div class="flex flex-col justify-center px-6 py-14 md:col-span-8 md:px-14 md:py-20">
        <span class="font-mentor-eyebrow" :style="{ color: 'var(--brand-primary)' }">
          CAPÍTULO I · A TAXA QUE TE PAGA
        </span>

        <h2
          class="font-mentor-display mt-4"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(4rem, 9vw, 9rem)',
            lineHeight: '0.85',
          }"
        >
          {{ data?.rate ?? '—' }}<span class="text-[0.4em] opacity-70">%</span>
        </h2>

        <div class="mt-8 flex flex-wrap items-baseline gap-6">
          <div v-if="data?.price_buy != null" class="flex flex-col">
            <span class="font-mentor-eyebrow" :style="{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }">
              COMPRA HOJE
            </span>
            <span
              class="font-mentor-display tabular-nums mt-2"
              :style="{
                color: 'var(--brand-text)',
                fontSize: 'clamp(2rem, 3vw, 2.75rem)',
              }"
            >
              {{ formatMoney(data.price_buy) }}
            </span>
          </div>

          <div v-if="data?.price_sell != null" class="flex flex-col">
            <span class="font-mentor-eyebrow" :style="{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }">
              VENDA
            </span>
            <span
              class="font-mentor-display tabular-nums mt-2"
              :style="{
                color: 'var(--brand-positive)',
                fontSize: 'clamp(2rem, 3vw, 2.75rem)',
              }"
            >
              {{ formatMoney(data.price_sell) }}
            </span>
          </div>
        </div>

        <hr class="mentor-rule mt-10 max-w-[6rem]" :style="{ backgroundColor: 'var(--brand-primary)' }" />
      </div>
    </div>

    <!-- Pull quote -->
    <div
      class="border-t border-b py-20 md:py-24"
      :style="{ borderColor: 'color-mix(in srgb, var(--brand-text) 8%, transparent)', backgroundColor: 'var(--brand-surface)' }"
    >
      <div class="mx-auto max-w-6xl px-6 md:px-10">
        <span class="font-mentor-eyebrow" :style="{ color: 'var(--brand-primary)' }">
          PAUSA PARA REFLEXÃO
        </span>
        <blockquote
          class="font-mentor-quote mt-6 leading-[0.9]"
          :style="{
            color: 'var(--brand-text)',
            fontSize: 'clamp(1.75rem, 4.5vw, 4rem)',
          }"
        >
          &ldquo;RENDA FIXA NÃO ENRIQUECE NINGUÉM. PROTEGE.&rdquo;
        </blockquote>
        <div class="mt-8 flex items-center gap-4">
          <div class="h-[2px] w-12" :style="{ backgroundColor: 'var(--brand-primary)' }" />
          <span class="font-mentor-eyebrow" :style="{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }">
            {{ (brand.founder?.name || 'THIAGO NIGRO').toUpperCase() }} · MÉTODO ARCA
          </span>
        </div>
      </div>
    </div>

    <!-- Slot pra extras -->
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
        PROTEJA
        <br />
        <span :style="{ color: 'var(--brand-primary)' }">A BASE.</span>
      </h2>
      <p class="mx-auto mt-8 max-w-xl text-base md:text-lg" :style="{ color: 'color-mix(in srgb, var(--brand-text) 70%, transparent)' }">
        Renda fixa e a primeira camada do patrimonio. Reserva de emergencia + caixa estrategico antes de qualquer aventura.
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
const brand = useBrand() as any

defineProps<{
  data?: any
  paperName: string
  indexerLabel: string
  maturityDate?: string
  formatMoney: (n: number | null | undefined) => string
}>()
</script>

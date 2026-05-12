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
    :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }"
  >
    <!-- Top tape -->
    <div
      class="relative flex items-center gap-4 px-6 py-3 md:px-10"
      :style="{ backgroundColor: brand.colors.primary, color: brand.colors.background }"
    >
      <span class="font-mentor-eyebrow">MANUAL DO PRIMO · RENDA FIXA</span>
      <span class="flex-1 border-t" :style="{ borderColor: `${brand.colors.background}40` }" />
      <span class="font-mentor-eyebrow">{{ indexerLabel }}</span>
    </div>

    <!-- HERO grid 4/8 -->
    <div class="relative grid gap-0 md:grid-cols-12">
      <!-- Left: indexador + vencimento -->
      <div
        class="relative flex flex-col justify-end px-6 py-10 md:col-span-4 md:px-10 md:py-14"
        :style="{ backgroundColor: brand.colors.tertiary || brand.colors.surface }"
      >
        <div class="absolute right-0 top-0 h-full w-1" :style="{ backgroundColor: brand.colors.primary }" />
        <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
          O PAPEL
        </span>
        <h1
          class="font-mentor-display mt-2"
          :style="{
            color: brand.colors.text,
            fontSize: 'clamp(2rem, 4vw, 3.25rem)',
            lineHeight: '0.85',
          }"
        >
          {{ paperName }}
        </h1>
        <div class="mt-6 flex flex-col gap-1">
          <span class="font-mentor-eyebrow" :style="{ color: `${brand.colors.text}66` }">
            INDEXADOR
          </span>
          <span class="text-sm font-semibold uppercase" :style="{ color: `${brand.colors.text}CC` }">
            {{ indexerLabel }}
          </span>
        </div>
        <div v-if="maturityDate" class="mt-4 flex flex-col gap-1">
          <span class="font-mentor-eyebrow" :style="{ color: `${brand.colors.text}66` }">
            VENCIMENTO
          </span>
          <span class="text-sm font-semibold uppercase" :style="{ color: `${brand.colors.text}CC` }">
            {{ maturityDate }}
          </span>
        </div>
      </div>

      <!-- Right: taxa monumental -->
      <div class="flex flex-col justify-center px-6 py-14 md:col-span-8 md:px-14 md:py-20">
        <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
          CAPÍTULO I · A TAXA QUE TE PAGA
        </span>

        <h2
          class="font-mentor-display mt-4"
          :style="{
            color: brand.colors.text,
            fontSize: 'clamp(4rem, 9vw, 9rem)',
            lineHeight: '0.85',
          }"
        >
          {{ data?.rate ?? '—' }}<span class="text-[0.4em] opacity-70">%</span>
        </h2>

        <div class="mt-8 flex flex-wrap items-baseline gap-6">
          <div v-if="data?.price_buy != null" class="flex flex-col">
            <span class="font-mentor-eyebrow" :style="{ color: `${brand.colors.text}66` }">
              COMPRA HOJE
            </span>
            <span
              class="font-mentor-display tabular-nums mt-2"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(2rem, 3vw, 2.75rem)',
              }"
            >
              {{ formatMoney(data.price_buy) }}
            </span>
          </div>

          <div v-if="data?.price_sell != null" class="flex flex-col">
            <span class="font-mentor-eyebrow" :style="{ color: `${brand.colors.text}66` }">
              VENDA
            </span>
            <span
              class="font-mentor-display tabular-nums mt-2"
              :style="{
                color: brand.colors.positive,
                fontSize: 'clamp(2rem, 3vw, 2.75rem)',
              }"
            >
              {{ formatMoney(data.price_sell) }}
            </span>
          </div>
        </div>

        <hr class="mentor-rule mt-10 max-w-[6rem]" :style="{ backgroundColor: brand.colors.primary }" />
      </div>
    </div>

    <!-- Pull quote -->
    <div
      class="border-t border-b py-20 md:py-24"
      :style="{ borderColor: `${brand.colors.text}15`, backgroundColor: brand.colors.surface }"
    >
      <div class="mx-auto max-w-6xl px-6 md:px-10">
        <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
          PAUSA PARA REFLEXÃO
        </span>
        <blockquote
          class="font-mentor-quote mt-6 leading-[0.9]"
          :style="{
            color: brand.colors.text,
            fontSize: 'clamp(1.75rem, 4.5vw, 4rem)',
          }"
        >
          &ldquo;RENDA FIXA NÃO ENRIQUECE NINGUÉM. PROTEGE.&rdquo;
        </blockquote>
        <div class="mt-8 flex items-center gap-4">
          <div class="h-[2px] w-12" :style="{ backgroundColor: brand.colors.primary }" />
          <span class="font-mentor-eyebrow" :style="{ color: `${brand.colors.text}99` }">
            {{ (brand.founder?.name || 'THIAGO NIGRO').toUpperCase() }} · MÉTODO ARCA
          </span>
        </div>
      </div>
    </div>

    <!-- Slot pra extras -->
    <slot />

    <!-- Closing CTA -->
    <div class="mx-auto max-w-6xl px-6 py-24 text-center md:px-10 md:py-32">
      <span class="font-mentor-eyebrow" :style="{ color: brand.colors.primary }">
        CAPÍTULO FINAL
      </span>
      <h2
        class="font-mentor-display mt-6"
        :style="{
          color: brand.colors.text,
          fontSize: 'clamp(3rem, 8vw, 8rem)',
        }"
      >
        PROTEJA
        <br />
        <span :style="{ color: brand.colors.primary }">A BASE.</span>
      </h2>
      <p class="mx-auto mt-8 max-w-xl text-base md:text-lg" :style="{ color: `${brand.colors.text}B3` }">
        Renda fixa e a primeira camada do patrimonio. Reserva de emergencia + caixa estrategico antes de qualquer aventura.
      </p>
      <div class="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
        <NuxtLink
          to="/auth/register"
          class="group inline-flex items-center gap-3 px-10 py-5 transition-transform hover:-translate-y-0.5"
          :style="{
            backgroundColor: brand.colors.primary,
            color: brand.colors.background,
          }"
        >
          <span class="font-mentor-eyebrow !text-[13px]" style="letter-spacing: 0.18em;">MONTAR CARTEIRA ARCA</span>
          <span class="inline-block transition-transform group-hover:translate-x-1">→</span>
        </NuxtLink>
        <span class="font-mentor-eyebrow" :style="{ color: `${brand.colors.text}66` }">
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

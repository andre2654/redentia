<!--
  FauxMain — placeholder "main content area" used inside the sidebar
  mockups page. Renders a faux dashboard layout (hero + grid of cards)
  so each sidebar mockup is shown next to a realistic looking content
  area, instead of an empty void. Visual density is intentionally low
  so the sidebar stays the focus.
-->
<template>
  <div
    class="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden"
    :style="{ backgroundColor: brand.colors.background }"
  >
    <!-- Faux header -->
    <header
      class="flex shrink-0 items-center justify-between border-b px-6 py-3"
      :style="{
        borderColor: `color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${brand.colors.background} 88%, transparent)`,
      }"
    >
      <div class="flex flex-col leading-tight">
        <span
          class="font-mono-tab text-[10px] font-medium uppercase"
          :style="{
            letterSpacing: '0.2em',
            color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
          }"
        >Carteira</span>
        <h1
          class="text-[18px] font-medium"
          :style="{ color: brand.colors.text, letterSpacing: '-0.015em' }"
        >Visão geral</h1>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-md px-3 py-1.5 text-[12px] font-medium"
          :style="{
            backgroundColor: `color-mix(in srgb, ${brand.colors.text} 7%, transparent)`,
            color: brand.colors.text,
          }"
        >Filtros</button>
        <button
          type="button"
          class="rounded-md px-3 py-1.5 text-[12px] font-medium"
          :style="{
            backgroundColor: brand.colors.primary,
            color: brand.colors.background,
          }"
        >Adicionar ativo</button>
      </div>
    </header>

    <!-- Faux content -->
    <div class="grid min-h-0 flex-1 grid-cols-3 gap-4 overflow-y-auto p-6" style="scrollbar-width: thin">
      <!-- Hero card -->
      <div
        class="col-span-3 flex flex-col gap-3 rounded-xl border p-5"
        :style="{
          backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 60%, ${brand.colors.background})`,
          borderColor: `color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
        }"
      >
        <div class="flex items-baseline justify-between gap-3">
          <div>
            <div
              class="font-mono-tab text-[10.5px] font-medium uppercase"
              :style="{
                letterSpacing: '0.2em',
                color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
              }"
            >Patrimônio total</div>
            <div
              class="mt-1 font-mono-tab text-[36px] font-light tabular-nums"
              :style="{ color: brand.colors.text, letterSpacing: '-0.03em' }"
            >R$ 487.230,42</div>
            <div class="mt-1 flex items-baseline gap-3">
              <span
                class="font-mono-tab text-[14px] tabular-nums"
                :style="{ color: brand.colors.positive }"
              >+R$ 5.812,30</span>
              <span
                class="rounded-md px-2 py-0.5 font-mono-tab text-[11px] font-medium tabular-nums"
                :style="{
                  backgroundColor: `color-mix(in srgb, ${brand.colors.positive} 16%, transparent)`,
                  color: brand.colors.positive,
                }"
              >+1,21% hoje</span>
            </div>
          </div>
          <div class="hidden flex-col items-end gap-1 lg:flex">
            <div
              class="font-mono-tab text-[10.5px] font-medium uppercase"
              :style="{
                letterSpacing: '0.2em',
                color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
              }"
            >Mockup ativo</div>
            <div
              class="text-[14px] font-medium"
              :style="{ color: brand.colors.text }"
            >{{ title }}</div>
          </div>
        </div>
        <!-- Big sparkline -->
        <svg viewBox="0 0 600 80" class="h-20 w-full">
          <defs>
            <linearGradient id="herospark" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" :stop-color="brand.colors.primary" stop-opacity="0.32" />
              <stop offset="100%" :stop-color="brand.colors.primary" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,55 L40,52 L80,58 L120,46 L160,48 L200,40 L240,44 L280,32 L320,36 L360,28 L400,22 L440,30 L480,18 L520,22 L560,12 L600,16"
            :stroke="brand.colors.primary"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M0,55 L40,52 L80,58 L120,46 L160,48 L200,40 L240,44 L280,32 L320,36 L360,28 L400,22 L440,30 L480,18 L520,22 L560,12 L600,16 L600,80 L0,80 Z"
            fill="url(#herospark)"
          />
        </svg>
      </div>

      <!-- Faux metric cards -->
      <div
        v-for="card in cards"
        :key="card.label"
        class="flex flex-col gap-2 rounded-xl border p-4"
        :style="{
          backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 50%, ${brand.colors.background})`,
          borderColor: `color-mix(in srgb, ${brand.colors.border} 30%, transparent)`,
        }"
      >
        <div
          class="font-mono-tab text-[10px] font-medium uppercase"
          :style="{
            letterSpacing: '0.2em',
            color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
          }"
        >{{ card.label }}</div>
        <div
          class="font-mono-tab text-[20px] font-light tabular-nums"
          :style="{ color: brand.colors.text, letterSpacing: '-0.015em' }"
        >{{ card.value }}</div>
        <div
          class="font-mono-tab text-[11px] tabular-nums"
          :style="{ color: card.up ? brand.colors.positive : brand.colors.negative }"
        >{{ card.change }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  brand: ReturnType<typeof useBrand>
  title: string
}>()

const cards = [
  { label: 'Renda variável', value: 'R$ 312k', change: '+1,8% hoje', up: true },
  { label: 'FIIs', value: 'R$ 98k', change: '+0,4% hoje', up: true },
  { label: 'Renda fixa', value: 'R$ 64k', change: '+0,02% hoje', up: true },
  { label: 'Cripto', value: 'R$ 13k', change: '+2,4% hoje', up: true },
  { label: 'Dividendos 30d', value: 'R$ 3.214', change: '+R$ 412 vs mês ant.', up: true },
  { label: 'CDI ano', value: '11,8%', change: 'Sua carteira: 14,2%', up: true },
]
</script>

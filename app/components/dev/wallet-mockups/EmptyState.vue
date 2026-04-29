<!--
  Wallet empty state — first-time visit, no positions yet.

  Single hero with one clear CTA: "Import via chat". The XLSX upload is
  GONE from this surface; everything import-related lives in the chat.
  Below the CTA, three tiny info cards explain what happens after
  import (raio-x, dividendos, watchlist).
-->
<template>
  <div class="flex flex-col items-center gap-12 px-6 py-16">
    <!-- Hero -->
    <header class="flex max-w-xl flex-col items-center gap-4 text-center">
      <span
        class="font-mono-tab text-[11px] font-medium uppercase"
        :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
      >Carteira</span>
      <h1
        class="font-light"
        :style="{
          color: brand.colors.text,
          fontSize: 'clamp(32px, 5vw, 44px)',
          lineHeight: 1.05,
          letterSpacing: '-1.2px',
        }"
      >Cadê seus ativos?</h1>
      <p
        class="max-w-md"
        :style="{
          fontSize: '17px',
          lineHeight: 1.55,
          color: `color-mix(in srgb, ${brand.colors.text} 72%, transparent)`,
        }"
      >Importe sua carteira pelo chat e a gente faz o resto. Você fala, manda a planilha do CEI ou colado, a IA processa e popula tudo aqui.</p>

      <div class="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-[14px] font-medium"
          :style="{
            backgroundColor: brand.colors.primary,
            color: brand.colors.background,
            boxShadow: `0 12px 24px -10px color-mix(in srgb, ${brand.colors.primary} 70%, transparent), 0 4px 10px -6px rgba(0,0,0,0.10)`,
          }"
        >
          <UIcon name="i-lucide-sparkles" class="size-4" />
          Importar via chat
          <UIcon name="i-lucide-arrow-up-right" class="size-3.5 opacity-80" />
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-[14px] font-medium transition-[background-color]"
          :style="{
            borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
            color: brand.colors.text,
          }"
        >
          <UIcon name="i-lucide-help-circle" class="size-4" />
          Como baixar do CEI
        </button>
      </div>
    </header>

    <!-- "What happens after import" preview cards -->
    <section class="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
      <article
        v-for="card in afterImportCards"
        :key="card.title"
        class="flex flex-col gap-3 rounded-xl border p-5"
        :style="cardStyle"
      >
        <span
          class="flex size-9 items-center justify-center rounded-lg"
          :style="{ backgroundColor: `color-mix(in srgb, ${card.tint} 14%, transparent)` }"
        >
          <UIcon :name="card.icon" class="size-5" :style="{ color: card.tint }" />
        </span>
        <span
          class="font-mono-tab text-[10.5px] font-medium uppercase"
          :style="{
            letterSpacing: '0.18em',
            color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
          }"
        >Depois do import</span>
        <h3
          class="text-[16px] font-medium"
          :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }"
        >{{ card.title }}</h3>
        <p
          class="text-[13px]"
          :style="{
            lineHeight: 1.55,
            color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`,
          }"
        >{{ card.body }}</p>
      </article>
    </section>

    <!-- Trust signals row -->
    <ul
      class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px]"
      :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
    >
      <li class="flex items-center gap-2">
        <span class="size-1 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
        Dados criptografados
      </li>
      <li class="flex items-center gap-2">
        <span class="size-1 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
        Não compartilhamos com terceiros
      </li>
      <li class="flex items-center gap-2">
        <span class="size-1 rounded-full" :style="{ backgroundColor: brand.colors.primary }" />
        Análise sem viés comercial
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const brand = useBrand()

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))

const afterImportCards = [
  {
    title: 'Raio-X completo da carteira',
    body: 'Score 0-100 em 9 dimensões: diversificação, qualidade, renda, hedge cambial, volatilidade, macro. Identifica riscos e oportunidades.',
    icon: 'i-lucide-radar',
    tint: '#fbbf24',
  },
  {
    title: 'Calendário de proventos vivo',
    body: 'Próximos pagamentos de dividendos, JCP e rendimentos com valor estimado. Total esperado nos próximos 12 meses.',
    icon: 'i-lucide-calendar-days',
    tint: '#34d399',
  },
  {
    title: 'Watchlist + metas integradas',
    body: 'Defina objetivos no chat (aposentadoria, reserva, casa) e veja o progresso aqui. Watchlist atualizada em tempo real.',
    icon: 'i-lucide-target',
    tint: '#a78bfa',
  },
] as const
</script>

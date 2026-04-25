<!--
  EmptyState — tier-aware hero with starter chips.

  Behaviour shifts with the active tier:
  - Basic: subtitle = "Cotações, fundamentos…" + 4 short starters
    (everyday questions).
  - MAX: subtitle = "Análise rigorosa, multi-passo…" + 4 deeper
    starters (portfolio construction, stress tests, validation
    queries) — matches the kind of work MAX is for.

  Starters can be overridden per tenant via brand.ai.aiCtaQuestions
  (Basic) and brand.ai.aiCtaQuestionsMax (MAX). When MAX-specific
  ones aren't supplied, we fall back to a curated default that
  showcases the rigor of the tier.
-->
<template>
  <div class="flex h-full items-center justify-center px-5 py-10 md:px-8">
    <div class="flex w-full max-w-2xl flex-col items-center gap-10 text-center">
      <!-- Brand mark — full lockup, sits as the visual anchor -->
      <BrandLogo variant="full" mode="auto" class="h-10 w-auto" />

      <!-- Greeting -->
      <div class="flex flex-col gap-3">
        <h1
          class="font-display text-[34px] font-semibold leading-[1.05] tracking-tight md:text-[42px]"
          :style="{ color: brand.colors.text }"
        >
          {{ heading }}
        </h1>
        <p
          class="text-[15px] leading-relaxed md:text-[16px]"
          :style="{ color: brand.colors.textMuted }"
        >
          {{ subtitle }}
        </p>
      </div>

      <!-- Starter chips -->
      <div class="grid w-full grid-cols-1 gap-2 md:grid-cols-2">
        <button
          v-for="(q, i) in starters"
          :key="i"
          type="button"
          class="chat-starter group relative flex items-start gap-3 rounded-2xl px-4 py-3.5 text-left text-[14px] leading-snug transition-[background-color,border-color,transform]"
          :style="{
            backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 50%, transparent)`,
            border: `1px solid color-mix(in srgb, ${brand.colors.border} 30%, transparent)`,
            color: brand.colors.text,
          }"
          @click="$emit('start', q.question)"
        >
          <UIcon
            :name="q.icon ?? 'i-lucide-sparkles'"
            class="mt-0.5 size-4 shrink-0"
            :style="{ color: brand.colors.primary }"
            aria-hidden="true"
          />
          <span class="line-clamp-2 flex-1">{{ q.question }}</span>
          <UIcon
            :name="tier === 'max' ? 'i-lucide-sparkles' : 'i-lucide-arrow-up-right'"
            class="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-60"
            :style="{ color: tier === 'max' ? brand.colors.primary : brand.colors.textMuted }"
            aria-hidden="true"
          />
        </button>
      </div>

      <!-- Footnote — tier-aware -->
      <p
        class="font-mono-tab text-[10.5px] uppercase tracking-[0.18em] transition-colors"
        :style="{
          color: tier === 'max'
            ? `color-mix(in srgb, ${brand.colors.primary} 80%, transparent)`
            : `color-mix(in srgb, ${brand.colors.textMuted} 70%, transparent)`,
        }"
      >
        <template v-if="tier === 'max'">Redentia MAX · análise rigorosa</template>
        <template v-else>Redentia Basic · Redentia MAX</template>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    tier?: 'basic' | 'max'
  }>(),
  { tier: 'basic' },
)

defineEmits<{
  start: [question: string]
}>()

const brand = useBrand()

interface StarterChip {
  question: string
  icon?: string
  category?: string
}

const heading = computed(() => {
  if (props.tier === 'max') {
    return brand.ai?.chatTitleMax ?? brand.ai?.chatTitle ?? 'Análise profunda'
  }
  return brand.ai?.chatTitle ?? 'Pergunte qualquer coisa'
})

const subtitle = computed(() => {
  if (props.tier === 'max') {
    return (
      brand.ai?.chatSubtitleMax ??
      'Análise multi-passo, validação cruzada, framework de carteira de 9 camadas. Cada número é checado via tools antes de virar resposta.'
    )
  }
  return (
    brand.ai?.chatSubtitle ??
    'Cotações, fundamentos, dividendos, comparativos, planilhas — tudo em um só lugar.'
  )
})

// Starter chips — tier-aware, brand-overridable.
const STARTERS_BASIC: StarterChip[] = [
  { question: 'Como está o IBOV hoje?', icon: 'i-lucide-trending-up' },
  { question: 'Compare PETR4 vs VALE3', icon: 'i-lucide-scale' },
  { question: 'Quais FIIs pagam mais dividendos?', icon: 'i-lucide-coins' },
  { question: 'Simular R$ 500/mês a 8% por 20 anos', icon: 'i-lucide-calculator' },
]

const STARTERS_MAX: StarterChip[] = [
  {
    question: 'Monte uma carteira para R$ 500 mil em 15 anos com perfil moderado',
    icon: 'i-lucide-layers',
  },
  {
    question:
      'Faça stress test: minha carteira aguenta crash do S&P 500 + alta de 5pp na Selic?',
    icon: 'i-lucide-shield-alert',
  },
  {
    question:
      'Compare PETR4, VALE3 e ITUB4 em valuation, dividendos e cenário macro atual',
    icon: 'i-lucide-bar-chart-3',
  },
  {
    question:
      'Quero R$ 10 milhões em 18 anos. Que CAGR isso exige e a meta é factível?',
    icon: 'i-lucide-target',
  },
]

const starters = computed<StarterChip[]>(() => {
  const brandList = (props.tier === 'max'
    ? (brand.ai as { aiCtaQuestionsMax?: StarterChip[] } | undefined)?.aiCtaQuestionsMax
    : (brand.ai?.aiCtaQuestions as StarterChip[] | undefined)) ?? []
  if (brandList.length > 0) return brandList.slice(0, 4)
  return props.tier === 'max' ? STARTERS_MAX : STARTERS_BASIC
})
</script>

<style scoped>
.chat-starter:hover {
  border-color: color-mix(in srgb, currentColor 22%, transparent) !important;
  background-color: color-mix(in srgb, currentColor 5%, transparent) !important;
  transform: translateY(-1px);
}

@media (prefers-reduced-motion: reduce) {
  .chat-starter:hover {
    transform: none;
  }
}
</style>

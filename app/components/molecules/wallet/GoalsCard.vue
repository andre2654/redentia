<!--
  GoalsCard — Metas pulled from /api/goals.

  Empty-aware: shows a CTA card to define a goal in the chat when
  the user has none. Otherwise renders progress bars + classification
  badges.
-->
<template>
  <article class="flex flex-col gap-4 rounded-xl border p-6" :style="cardStyle">
    <div class="flex items-baseline justify-between">
      <SectionHeading
        :brand="brand"
        eyebrow="Metas · Definidas no chat"
        title="Onde você quer chegar"
        size="md"
      />
      <NuxtLink
        to="/help?intent=set-goal"
        class="font-mono-tab text-[10.5px] font-medium uppercase"
        :style="{ letterSpacing: '0.16em', color: brand.colors.primary }"
      >+ Nova meta</NuxtLink>
    </div>
    <div v-if="!goals.length" class="flex flex-col gap-2 py-4">
      <p class="text-[13px]" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 70%, transparent)`, lineHeight: 1.5 }">
        Defina uma meta no chat (aposentadoria, reserva de emergência, casa) e ela aparece aqui com o progresso atualizado.
      </p>
      <NuxtLink
        to="/help?intent=set-goal"
        class="inline-flex items-center gap-1.5 self-start font-mono-tab text-[11px] font-medium uppercase"
        :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
      >Definir minha primeira meta
        <UIcon name="i-lucide-arrow-up-right" class="size-3" />
      </NuxtLink>
    </div>
    <div v-else class="flex flex-col gap-4">
      <div
        v-for="goal in goals"
        :key="goal.id"
        class="flex flex-col gap-1.5 border-b pb-4 last:border-b-0 last:pb-0"
        :style="{ borderColor: `color-mix(in srgb, ${brand.colors.border} 35%, transparent)` }"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-[14px] font-medium" :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }">{{ goal.title }}</span>
          <span
            class="rounded-md px-2 py-0.5 font-mono-tab text-[10px] font-medium uppercase"
            :style="{
              letterSpacing: '0.14em',
              backgroundColor: badgeBg(goal.classification),
              color: badgeColor(goal.classification),
            }"
          >{{ classificationLabel(goal.classification) }}</span>
        </div>
        <div class="flex items-baseline justify-between font-mono-tab text-[12.5px] tabular-nums" :style="{ color: brand.colors.text }">
          <span>{{ maskedBRL(goal.current_progress || 0) }} <span :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }">/ {{ maskedBRL(goal.target_value) }}</span></span>
          <span :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)` }">{{ progressPct(goal).toFixed(1) }}%</span>
        </div>
        <div
          class="h-1.5 w-full overflow-hidden rounded-full"
          :style="{ backgroundColor: `color-mix(in srgb, ${brand.colors.text} 7%, transparent)` }"
        >
          <div
            class="h-full rounded-full"
            :style="{
              width: Math.min(progressPct(goal), 100) + '%',
              background: goal.classification === 'achieved'
                ? brand.colors.positive
                : `linear-gradient(90deg, ${brand.colors.primary} 0%, ${brand.colors.positive} 100%)`,
            }"
          />
        </div>
        <p
          v-if="goal.note"
          class="mt-1 text-[12px]"
          :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)`, lineHeight: 1.5 }"
        >{{ goal.note }}</p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { WalletGoal } from '~/services/walletData'

interface Props {
  goals: WalletGoal[]
}
defineProps<Props>()

const brand = useBrand()

const cardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))

function progressPct(goal: WalletGoal): number {
  if (!goal.target_value) return 0
  return ((goal.current_progress || 0) / goal.target_value) * 100
}

function classificationLabel(c?: string): string {
  switch (c) {
    case 'achieved': return 'Atingida'
    case 'realistic': return 'Realista'
    case 'aggressive': return 'Agressiva'
    case 'unfeasible': return 'Inviável'
    default: return c ? c : 'Em curso'
  }
}

function badgeColor(c?: string): string {
  if (c === 'achieved') return brand.colors.positive
  if (c === 'unfeasible') return brand.colors.negative
  if (c === 'aggressive') return (brand.colors as { warning?: string }).warning || '#f59e0b'
  return brand.colors.primary
}
function badgeBg(c?: string): string {
  return `color-mix(in srgb, ${badgeColor(c)} 14%, transparent)`
}

// Mascarar metas (current + target) quando reveal=false. Goals
// expoem aspiracao financeira do user — privacidade igual a do
// patrimonio. Progresso % fica visivel (ratio nao expoe R$).
const interfaceStore = useInterfaceStore()

function formatBRL(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n)
}
function maskedBRL(n: number): string {
  if (!interfaceStore.revealAmount) return 'R$ ••••••'
  return formatBRL(n)
}
</script>

<!--
  PricingCard — usado na /pricing pra renderizar Pro ou Max.

  Props:
    - plan: IPlan
    - cycle: 'monthly' | 'yearly'
    - highlighted: bool (Max recebe true via prop)
    - onStartTrial(planId): trial gratis 7d sem cartao (apenas Pro)
    - onCheckout(planId, cycle): inicia checkout Stripe
-->
<template>
  <article
    class="quiet-card relative flex flex-col gap-5 p-6"
    :class="{ 'pricing-card--highlighted': highlighted }"
    :style="cardStyle"
  >
    <!-- Badge "MAIS COMPLETO" no Max -->
    <span
      v-if="highlighted"
      class="quiet-badge quiet-badge--brand absolute -top-3 left-6 flex items-center gap-1"
      style="gap: 4px"
    >
      <UIcon name="i-lucide-crown" class="size-3" aria-hidden="true" />
      MAIS COMPLETO
    </span>

    <header class="flex flex-col gap-1">
      <h3 class="text-2xl font-light tracking-tight" :style="{ color: 'var(--text-heading, var(--brand-text))' }">
        {{ plan.name }}
      </h3>
      <p v-if="plan.description" class="text-[13.5px] leading-relaxed" :style="{ color: 'var(--text-body, var(--brand-text-muted))' }">
        {{ plan.description }}
      </p>
    </header>

    <div class="flex flex-col gap-1">
      <div class="flex items-baseline gap-1">
        <span class="text-4xl font-light tabular-nums tracking-tight" :style="{ color: 'var(--text-heading, var(--brand-text))' }">
          R$ {{ formattedDisplayPrice }}
        </span>
        <span class="text-sm" :style="{ color: 'var(--text-body, var(--brand-text-muted))' }">
          /mês
        </span>
      </div>
      <p v-if="cycle === 'yearly'" class="text-xs" :style="{ color: 'var(--text-body, var(--brand-text-muted))' }">
        Cobrado R$ {{ formattedYearly }} anuais (10 meses pra pagar 12)
      </p>
      <p v-else-if="plan.price_brl_yearly" class="text-xs" :style="{ color: 'var(--brand-primary)' }">
        Mude pra anual e ganhe 2 meses
      </p>
    </div>

    <ul class="flex flex-col gap-2.5">
      <li
        v-for="feat in featuresLabels"
        :key="feat.key"
        class="flex items-start gap-2 text-[13.5px] leading-snug"
        :style="{ color: 'var(--text-body, var(--brand-text))' }"
      >
        <UIcon
          name="i-lucide-check"
          class="size-[16px] shrink-0"
          :style="{ color: 'var(--brand-primary)', marginTop: '2px' }"
          aria-hidden="true"
        />
        <span v-html="feat.label" />
      </li>
    </ul>

    <footer class="mt-auto flex flex-col gap-2 pt-2">
      <button
        v-if="plan.trial_days && cycle === 'monthly'"
        type="button"
        class="quiet-btn-primary"
        :disabled="busy"
        @click="$emit('start-trial', plan.id)"
      >
        <UIcon
          v-if="busy"
          name="i-lucide-loader-2"
          class="size-4 motion-safe:animate-spin"
          aria-hidden="true"
        />
        {{ busy ? 'Iniciando…' : `Começar trial ${plan.trial_days} dias grátis` }}
      </button>
      <button
        v-else
        type="button"
        class="quiet-btn-primary"
        :disabled="busy"
        @click="$emit('checkout', plan.id, cycle)"
      >
        <UIcon
          v-if="busy"
          name="i-lucide-loader-2"
          class="size-4 motion-safe:animate-spin"
          aria-hidden="true"
        />
        {{ busy ? 'Carregando…' : `Assinar ${plan.name}` }}
      </button>

      <button
        v-if="plan.trial_days && cycle === 'monthly'"
        type="button"
        class="quiet-btn-ghost text-xs"
        @click="$emit('checkout', plan.id, cycle)"
      >
        ou assinar direto sem trial
      </button>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IPlan } from '~/types/plan'

interface Props {
  plan: IPlan
  cycle: 'monthly' | 'yearly'
  highlighted?: boolean
  busy?: boolean
}
const props = withDefaults(defineProps<Props>(), { highlighted: false, busy: false })

defineEmits<{
  (e: 'start-trial', planId: number): void
  (e: 'checkout', planId: number, cycle: 'monthly' | 'yearly'): void
}>()

const cardStyle = computed(() => {
  if (!props.highlighted) return {}
  return {
    borderColor: 'color-mix(in srgb, var(--brand-primary) 38%, transparent)',
    boxShadow: 'var(--shadow-card-hover)',
  }
})

const monthly = computed(() => parseFloat(props.plan.price_brl_monthly ?? '0'))
const yearly = computed(() => parseFloat(props.plan.price_brl_yearly ?? '0'))

const formattedDisplayPrice = computed(() => {
  const value = props.cycle === 'yearly'
    ? (yearly.value / 12)
    : monthly.value
  return formatBRL(value)
})

const formattedYearly = computed(() => formatBRL(yearly.value))

function formatBRL(n: number) {
  if (!Number.isFinite(n)) return '0,00'
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const featuresLabels = computed(() => {
  const limits = props.plan.limits ?? {}
  const features = props.plan.features ?? []
  const isMax = props.plan.slug === 'max'

  const items: Array<{ key: string; label: string }> = []

  // Caps de chat sempre destacados primeiro
  if (limits.max_chat_daily !== undefined) {
    items.push({
      key: 'max-chat',
      label: limits.max_chat_daily === -1
        ? '<strong>Análises profundas ilimitadas</strong>'
        : `<strong>${limits.max_chat_daily} análises profundas/dia</strong>`,
    })
  }
  if (limits.basic_chat_daily !== undefined) {
    items.push({
      key: 'basic-chat',
      label: limits.basic_chat_daily === -1
        ? 'Chat ilimitado'
        : `${limits.basic_chat_daily} perguntas no chat/dia`,
    })
  }
  if (limits.watchlist_total !== undefined) {
    items.push({
      key: 'watchlist',
      label: limits.watchlist_total === -1
        ? 'Watchlist ilimitada'
        : `Watchlist com até ${limits.watchlist_total} ativos`,
    })
  }

  if (features.includes('compare_assets')) items.push({ key: 'compare', label: 'Comparativo de ativos' })
  if (features.includes('historical_portfolio')) items.push({ key: 'history', label: 'Histórico ilimitado de carteira' })
  if (features.includes('news_impact')) items.push({ key: 'news', label: 'Análise de impacto de notícias' })
  if (features.includes('xlsx_export')) items.push({ key: 'xlsx', label: 'Export XLSX' })
  if (features.includes('rebalance_simulator')) items.push({ key: 'rebal', label: 'Simulador de rebalanceamento' })
  if (features.includes('thesis_tracking')) items.push({ key: 'thesis', label: 'Acompanhamento de teses' })
  if (features.includes('weekly_report')) items.push({ key: 'weekly', label: 'Relatório semanal por email' })
  if (features.includes('priority_processing')) items.push({ key: 'prio', label: 'Prioridade no processamento' })

  return items
})
</script>

<style scoped>
.pricing-card--highlighted {
  position: relative;
}
</style>

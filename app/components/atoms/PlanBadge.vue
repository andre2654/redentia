<!--
  PlanBadge — chip pequeno indicando plano + status do user logado.

  Renderiza:
    - "Pro" / "Max"           -> active
    - "Pro · 5 dias restantes" -> trialing (com countdown)
    - nada                    -> sem sub OU billing.enabled=false
-->
<template>
  <span
    v-if="visible"
    class="quiet-badge"
    :class="badgeClass"
    :style="badgeStyle"
    :title="tooltip"
  >
    <UIcon
      v-if="isMax"
      name="i-lucide-crown"
      class="size-[12px]"
      aria-hidden="true"
    />
    <UIcon
      v-else-if="isTrial"
      name="i-lucide-clock"
      class="size-[12px]"
      aria-hidden="true"
    />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const ent = useEntitlements()

const isBillingEnabled = computed(() => ent.isBillingEnabled())
const slug = computed(() => ent.planSlug())
const status = computed(() => ent.subscriptionStatus())
const trialDays = computed(() => ent.trialDaysRemaining())

const visible = computed(() => {
  if (!isBillingEnabled.value) return false
  return Boolean(slug.value)
})

const isMax = computed(() => slug.value === 'max')
const isPro = computed(() => slug.value === 'pro')
const isTrial = computed(() => status.value === 'trialing')

const label = computed(() => {
  const planLabel = isMax.value ? 'Max' : (isPro.value ? 'Pro' : (slug.value ?? ''))
  if (isTrial.value && trialDays.value !== null) {
    if (trialDays.value <= 0) return `${planLabel} · trial expira hoje`
    if (trialDays.value === 1) return `${planLabel} · 1 dia restante`
    return `${planLabel} · ${trialDays.value} dias restantes`
  }
  return planLabel
})

const tooltip = computed(() => {
  if (isTrial.value) return 'Trial em andamento, adicione cartão pra continuar'
  return `Plano ${label.value}`
})

const badgeClass = computed(() => {
  if (isMax.value) return 'quiet-badge--brand'
  if (isPro.value) return 'quiet-badge--neutral'
  return 'quiet-badge--neutral'
})

const badgeStyle = computed(() => {
  if (isMax.value) {
    return {
      gap: '4px',
    }
  }
  return {
    gap: '4px',
  }
})
</script>

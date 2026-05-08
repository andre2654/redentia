<!--
  UpgradeModal — modal global de upgrade.

  Montado uma vez em app.vue. Estado controlado pelo composable
  `useUpgradeModal()`. Aberto automaticamente quando:
    - Frontend recebe 422 com `plan_required`
    - Chat-service emite `{{max:UPGRADE}}` marker
    - User tenta acao gated (botao desabilitado clicado)

  Bypass automatico se tenant.config.billing.enabled=false (composable
  faz no-op em open()).
-->
<template>
  <Teleport to="body">
    <dialog
      ref="dialogEl"
      class="upgrade-modal relative w-full max-w-md rounded-xl border p-0 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      :style="{
        borderColor: 'var(--border-strong, var(--brand-border))',
        backgroundColor: 'var(--bg-elevated, var(--brand-surface))',
        color: 'var(--text-body, var(--brand-text))',
        boxShadow: 'var(--shadow-popover)',
      }"
      @close="onClose"
      @cancel="onClose"
    >
      <div v-if="payload" class="flex flex-col gap-5 p-6">
        <header class="flex flex-col gap-2">
          <span class="eyebrow flex items-center gap-2">
            <UIcon name="i-lucide-sparkles" class="size-3" aria-hidden="true" />
            {{ eyebrowLabel }}
          </span>
          <h2 class="text-xl font-light tracking-tight" :style="{ color: 'var(--text-heading, var(--brand-text))' }">
            {{ title }}
          </h2>
          <p class="text-[14px] leading-relaxed" :style="{ color: 'var(--text-body, var(--brand-text-muted))' }">
            {{ message }}
          </p>
        </header>

        <ul v-if="features.length" class="flex flex-col gap-2">
          <li
            v-for="feat in features"
            :key="feat"
            class="flex items-start gap-2 text-[13.5px] leading-snug"
            :style="{ color: 'var(--text-body, var(--brand-text))' }"
          >
            <UIcon
              name="i-lucide-check"
              class="size-[16px] shrink-0"
              :style="{ color: 'var(--brand-primary)', marginTop: '2px' }"
              aria-hidden="true"
            />
            <span>{{ feat }}</span>
          </li>
        </ul>

        <footer class="flex flex-col gap-2 sm:flex-row-reverse">
          <button
            type="button"
            class="quiet-btn-primary flex-1"
            @click="onUpgrade"
          >
            {{ ctaLabel }}
            <UIcon name="i-lucide-arrow-right" class="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="quiet-btn-ghost"
            @click="close"
          >
            Agora não
          </button>
        </footer>
      </div>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'

const { isOpen, payload, close } = useUpgradeModal()
const router = useRouter()

const dialogEl = ref<HTMLDialogElement | null>(null)

watch(isOpen, async (open) => {
  await nextTick()
  if (!dialogEl.value) return
  if (open) {
    if (!dialogEl.value.open) dialogEl.value.showModal()
  } else if (dialogEl.value.open) {
    dialogEl.value.close()
  }
})

function onClose() {
  if (isOpen.value) close()
}

function onUpgrade() {
  const plan = payload.value?.suggestedPlan
  const target = plan ? `/pricing?plan=${plan}` : '/pricing'
  close()
  router.push(target)
}

const eyebrowLabel = computed(() => {
  const plan = payload.value?.suggestedPlan
  if (plan === 'max') return 'Disponível no Max'
  if (plan === 'pro') return 'Disponível no Pro'
  return 'Faça upgrade'
})

const title = computed(() => {
  if (payload.value?.customTitle) return payload.value.customTitle
  switch (payload.value?.reason) {
    case 'limit-reached':
      return 'Você atingiu o limite do dia'
    case 'feature-locked':
      return 'Essa feature precisa do Max'
    case 'subscription-needed':
      return 'Pra usar essa área você precisa de uma assinatura'
    case 'trial-ended':
      return 'Seu trial acabou'
    default:
      return 'Faça upgrade'
  }
})

const message = computed(() => {
  if (payload.value?.customMessage) return payload.value.customMessage
  switch (payload.value?.reason) {
    case 'limit-reached':
      return payload.value?.key === 'max_chat_daily'
        ? 'Aguarde até meia-noite ou aumente seu cap diário com o plano Max.'
        : 'Aguarde a próxima janela ou desbloqueie acesso ilimitado.'
    case 'feature-locked':
      return 'Esse recurso está disponível no plano Max. Faça upgrade pra liberar agora.'
    case 'subscription-needed':
      return 'Comece com 7 dias grátis no Pro, sem cartão de crédito.'
    case 'trial-ended':
      return 'Continue com Pro ou Max pra manter sua carteira viva.'
    default:
      return 'Desbloqueie tudo com Pro ou Max.'
  }
})

const ctaLabel = computed(() => {
  if (payload.value?.reason === 'subscription-needed' || payload.value?.reason === 'trial-ended') {
    return 'Ver planos'
  }
  if (payload.value?.suggestedPlan === 'max') return 'Fazer upgrade pra Max'
  if (payload.value?.suggestedPlan === 'pro') return 'Fazer upgrade pra Pro'
  return 'Ver planos'
})

const features = computed<string[]>(() => {
  const plan = payload.value?.suggestedPlan
  if (plan === 'max') {
    return [
      '8 análises profundas por dia',
      'Watchlist ilimitada',
      'Simulador de rebalanceamento',
      'Relatório semanal por email',
    ]
  }
  if (plan === 'pro') {
    return [
      '4 análises profundas por dia',
      'Watchlist com até 25 ativos',
      'Comparativo de ativos',
      'Histórico ilimitado de carteira',
    ]
  }
  return []
})
</script>

<style scoped>
.upgrade-modal {
  margin: auto;
}
.upgrade-modal::backdrop {
  background: rgba(0, 0, 0, 0.6);
}
</style>

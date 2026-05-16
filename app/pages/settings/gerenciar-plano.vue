<!--
  /settings/billing — current plan + invoices + portal Stripe + cancel.

  - Skip total se billing.enabled=false (redirect /settings)
  - Renderiza PlanBadge + status detalhado + 3 acoes principais
-->
<template>
  <NuxtLayout :title="'Assinatura'">
    <div v-if="loading" class="settings-billing__loading">
      <UIcon name="i-lucide-loader-2" class="size-6 motion-safe:animate-spin" :style="{ color: 'var(--brand-primary)' }" />
    </div>
    <div v-else class="settings-billing">
      <NuxtLink to="/settings" class="settings-billing__back">
        <UIcon name="i-lucide-arrow-left" class="size-3.5" aria-hidden="true" />
        <span>Voltar para configurações do usuário</span>
      </NuxtLink>
      <header class="settings-billing__header">
        <span class="eyebrow">Assinatura</span>
        <h1 class="settings-billing__title">Plano atual</h1>
      </header>

      <div class="quiet-card settings-billing__card">
        <div class="settings-billing__plan-row">
          <div class="settings-billing__plan-info">
            <AtomsPlanBadge />
            <p class="settings-billing__status">{{ statusLabel }}</p>
          </div>
        </div>

        <dl class="settings-billing__meta">
          <div v-if="trialEndsAt">
            <dt>Trial expira em</dt>
            <dd>{{ formatDate(trialEndsAt) }}</dd>
          </div>
          <div v-if="periodEnd">
            <dt>Próxima cobrança</dt>
            <dd>{{ formatDate(periodEnd) }}</dd>
          </div>
        </dl>

        <div class="settings-billing__actions">
          <button type="button" class="quiet-btn-primary" :disabled="busy" @click="openPortal">
            <UIcon
              v-if="busy"
              name="i-lucide-loader-2"
              class="size-4 motion-safe:animate-spin"
              aria-hidden="true"
            />
            Gerenciar pagamento
          </button>
          <NuxtLink to="/pricing" class="quiet-btn-ghost">
            Trocar de plano
          </NuxtLink>
          <button
            v-if="canCancel"
            type="button"
            class="quiet-btn-ghost"
            :disabled="busy"
            @click="onCancel"
          >
            Cancelar assinatura
          </button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

definePageMeta({ layout: 'default' })
// Paywall vive em middleware/requires-subscription.global.ts.

usePageSeo({
  title: 'Assinatura',
  description: 'Gerenciar plano e pagamento',
  path: '/settings/billing',
  robots: 'noindex,nofollow',
})

const ent = useEntitlements()
const billingService = useBillingService()
const router = useRouter()
const toast = useToast()

const loading = ref(true)
const busy = ref(false)

onMounted(async () => {
  await ent.refresh(true)
  if (!ent.isBillingEnabled()) {
    router.replace('/settings')
    return
  }
  loading.value = false
})

const trialEndsAt = computed(() => ent.trialEndsAt())
const periodEnd = computed(() => ent.snapshot.value?.subscription?.current_period_end ?? null)
const status = computed(() => ent.subscriptionStatus())

const statusLabel = computed(() => {
  switch (status.value) {
    case 'trialing': return 'Em trial, adicione um cartão pra continuar quando o período acabar.'
    case 'active': return 'Ativa.'
    case 'past_due': return 'Pagamento pendente, atualize o cartão.'
    case 'canceled': return 'Cancelada.'
    case 'incomplete': return 'Pagamento incompleto.'
    default: return ''
  }
})

const canCancel = computed(() => ['active', 'trialing', 'past_due'].includes(status.value ?? ''))

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch { return iso }
}

async function openPortal() {
  busy.value = true
  try {
    const data = await billingService.createPortal()
    const payload = (data as any)?.data ?? data
    if (payload?.portal_url) {
      window.location.href = payload.portal_url
      return
    }
  } catch (err: any) {
    toast.add({ title: 'Não foi possível abrir o portal', description: err?.data?.message ?? 'Tente novamente.', color: 'error' })
  } finally {
    busy.value = false
  }
}

async function onCancel() {
  if (!confirm('Cancelar a assinatura no fim do período atual?')) return
  busy.value = true
  try {
    await billingService.cancel(true)
    await ent.refresh(true)
    toast.add({ title: 'Assinatura cancelada', description: 'Acesso continua até o fim do período pago.', color: 'info' })
  } catch (err: any) {
    toast.add({ title: 'Erro ao cancelar', description: err?.data?.message ?? 'Tente novamente.', color: 'error' })
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.settings-billing {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px 24px;
  width: 100%;
}
.settings-billing__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}
.settings-billing__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  text-decoration: none;
  width: fit-content;
  transition: color 150ms;
}
.settings-billing__back:hover {
  color: var(--brand-primary);
}
.settings-billing__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.settings-billing__title {
  font-family: var(--brand-font);
  font-size: 28px;
  font-weight: 300;
  letter-spacing: -0.02em;
  color: var(--text-heading, var(--brand-text));
  margin: 0;
}
.settings-billing__card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.settings-billing__plan-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.settings-billing__plan-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.settings-billing__status {
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--text-body, var(--brand-text-muted));
  margin: 0;
}
.settings-billing__meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 0;
  padding: 16px 0;
  border-top: 1px solid var(--border-subtle, var(--brand-border));
  border-bottom: 1px solid var(--border-subtle, var(--brand-border));
}
.settings-billing__meta dt {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-body, var(--brand-text-muted));
  margin-bottom: 4px;
}
.settings-billing__meta dd {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-heading, var(--brand-text));
  margin: 0;
}
.settings-billing__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>

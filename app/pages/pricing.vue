<!--
  /pricing — pricing page do tenant atual.

  - Renderiza Pro e Max do tenant atual via GET /api/plans
  - Toggle Mensal / Anual (anual = 10 meses pra pagar 12)
  - Trial Pro 7d sem cartao via POST /api/billing/start-trial
  - Checkout via POST /api/billing/checkout (redirect Stripe)
  - Se tenant.config.billing.enabled === false: redireciona pra /
  - Toast inicial se ?reason=needs-subscription (vindo do middleware)
-->
<template>
  <NuxtLayout
    name="landing"
    title="Planos"
    :hide-footer="false"
  >
    <div class="pricing-page">
      <!-- Hero -->
      <section class="pricing-hero">
        <span class="eyebrow">Planos {{ tenantName }}</span>
        <h1 class="pricing-hero__title">
          Carteira que<br />
          <span style="color: var(--brand-primary)">se analisa sozinha.</span>
        </h1>
        <p class="pricing-hero__sub">
          Sem mensalidade da corretora. Sem cobrança por trade. Você paga pra ter um copiloto
          que entende sua carteira e te avisa quando algo importa.
        </p>

        <!-- Cycle toggle -->
        <div class="pricing-toggle" role="group" aria-label="Ciclo de cobrança">
          <button
            type="button"
            :class="['pricing-toggle__btn', { 'is-active': cycle === 'monthly' }]"
            @click="cycle = 'monthly'"
          >
            Mensal
          </button>
          <button
            type="button"
            :class="['pricing-toggle__btn', { 'is-active': cycle === 'yearly' }]"
            @click="cycle = 'yearly'"
          >
            Anual
            <span class="pricing-toggle__badge">−17%</span>
          </button>
        </div>
      </section>

      <!-- Loading -->
      <section v-if="loading" class="pricing-loading">
        <UIcon name="i-lucide-loader-2" class="size-8 motion-safe:animate-spin" :style="{ color: 'var(--brand-primary)' }" />
      </section>

      <!-- Cards -->
      <section v-else-if="plans.length" class="pricing-cards">
        <MoleculesPricingCard
          v-for="plan in sortedPlans"
          :key="plan.id"
          :plan="plan"
          :cycle="cycle"
          :highlighted="plan.slug === 'max'"
          :busy="busyPlanId === plan.id"
          @start-trial="onStartTrial"
          @checkout="onCheckout"
        />
      </section>

      <!-- Empty (tenant sem billing — improvável, redirect server-side já cuida) -->
      <section v-else class="pricing-loading">
        <p :style="{ color: 'var(--text-body, var(--brand-text-muted))' }">
          Esta plataforma não tem planos pagos.
        </p>
      </section>

      <!-- FAQ -->
      <section class="pricing-faq">
        <h2 class="pricing-faq__title">Perguntas frequentes</h2>
        <div class="pricing-faq__list">
          <details v-for="item in faq" :key="item.q" class="pricing-faq__item">
            <summary class="pricing-faq__q">{{ item.q }}</summary>
            <p class="pricing-faq__a" v-html="item.a" />
          </details>
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { IPlan } from '~/types/plan'

definePageMeta({
  layout: 'landing',
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: 'Planos',
  description: 'Conheça os planos da Redentia — Pro e Max',
  path: '/pricing',
})

const route = useRoute()
const router = useRouter()
const brand = useBrand()
const billingService = useBillingService()
const toast = useToast()

const cycle = ref<'monthly' | 'yearly'>('monthly')
const plans = ref<IPlan[]>([])
const tenantName = ref(brand.name)
const billingEnabled = ref(true)
const loading = ref(true)
const busyPlanId = ref<number | null>(null)

const sortedPlans = computed(() => [...plans.value].sort((a, b) => a.sort_order - b.sort_order))

const faq = [
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. Cancele direto pelo portal Stripe (em /settings/billing) ou no Atendimento. Sua assinatura segue ativa até o fim do período já pago.',
  },
  {
    q: 'Como funciona o trial?',
    a: 'O Pro tem 7 dias grátis sem precisar de cartão. Se você não adicionar pagamento até o fim, sua conta volta pro estado anterior automaticamente. Sem cobrança surpresa.',
  },
  {
    q: 'Quando posso pedir reembolso?',
    a: 'Em até 7 dias da contratação, conforme o CDC. Reembolsos integrais, sem perguntas.',
  },
  {
    q: 'Aceitam PIX e boleto?',
    a: 'Sim, no plano anual. Cobrança mensal só aceita cartão (PIX recorrente ainda não é nativo no Brasil).',
  },
  {
    q: 'O que acontece se meu cartão falhar?',
    a: 'Você tem 3 dias de janela pra atualizar o cartão sem perder acesso. Avisamos por email assim que detectamos a falha.',
  },
]

async function loadPlans() {
  loading.value = true
  try {
    const slug = brand.slug
    const data = await billingService.listPublicPlans(slug)
    const payload = (data as any)?.data ?? data
    plans.value = payload.plans ?? []
    tenantName.value = payload.tenant?.name ?? brand.name
    billingEnabled.value = Boolean(payload.billing_enabled)

    if (!billingEnabled.value) {
      router.replace('/')
    }
  } catch (err) {
    console.warn('[pricing] failed to load plans', err)
    plans.value = []
  } finally {
    loading.value = false
  }
}

async function onStartTrial(planId: number) {
  const auth = useAuthStore()
  if (!auth.token) {
    router.push({ path: '/auth/register', query: { redirect: '/pricing', plan: String(planId) } })
    return
  }
  busyPlanId.value = planId
  try {
    await billingService.startTrial(planId)
    toast.add({ title: 'Trial iniciado', description: '7 dias grátis liberados na sua conta.', color: 'success' })
    router.push('/wallet')
  } catch (err: any) {
    toast.add({ title: 'Não foi possível iniciar o trial', description: err?.data?.message ?? 'Tente novamente.', color: 'error' })
  } finally {
    busyPlanId.value = null
  }
}

async function onCheckout(planId: number, c: 'monthly' | 'yearly') {
  const auth = useAuthStore()
  if (!auth.token) {
    router.push({ path: '/auth/register', query: { redirect: '/pricing', plan: String(planId), cycle: c } })
    return
  }
  busyPlanId.value = planId
  try {
    const data = await billingService.createCheckout({ plan_id: planId, cycle: c })
    const payload = (data as any)?.data ?? data
    if (payload?.checkout_url) {
      window.location.href = payload.checkout_url
      return
    }
    toast.add({ title: 'Erro ao iniciar checkout', color: 'error' })
  } catch (err: any) {
    toast.add({ title: 'Não foi possível iniciar checkout', description: err?.data?.message ?? 'Tente novamente.', color: 'error' })
  } finally {
    busyPlanId.value = null
  }
}

onMounted(() => {
  if (route.query.reason === 'needs-subscription') {
    toast.add({
      title: 'Pra acessar essa área você precisa de uma assinatura',
      description: 'Comece com 7 dias grátis no Pro, sem cartão.',
      color: 'info',
    })
  }
  loadPlans()
})
</script>

<style scoped>
.pricing-page {
  display: flex;
  flex-direction: column;
  gap: 64px;
  padding: 56px 24px 80px;
  max-width: 1100px;
  margin: 0 auto;
}

.pricing-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.pricing-hero__title {
  font-family: var(--brand-font);
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 300;
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: var(--text-heading, var(--brand-text));
  margin: 0;
}

.pricing-hero__sub {
  max-width: 560px;
  font-size: 16px;
  line-height: 1.55;
  color: var(--text-body, var(--brand-text-muted));
  margin: 0;
}

.pricing-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  padding: 4px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle, var(--brand-border));
  background: var(--bg-elevated, var(--brand-surface));
}

.pricing-toggle__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  background: transparent;
  border: 0;
  font-family: var(--brand-font);
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--text-body, var(--brand-text-muted));
  cursor: pointer;
  transition: background 150ms, color 150ms;
}

.pricing-toggle__btn.is-active {
  background: var(--brand-primary);
  color: #1A0A2E;
}

.pricing-toggle__btn:focus-visible {
  outline: none;
  box-shadow: var(--shadow-ring-focus);
}

.pricing-toggle__badge {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 2px 5px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.08);
}

.pricing-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

.pricing-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 720px) {
  .pricing-cards {
    grid-template-columns: 1fr 1fr;
    max-width: 760px;
    margin: 0 auto;
    width: 100%;
  }
}

.pricing-faq {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
}

.pricing-faq__title {
  font-family: var(--brand-font);
  font-size: 24px;
  font-weight: 300;
  letter-spacing: -0.018em;
  color: var(--text-heading, var(--brand-text));
  margin: 0 0 8px;
  text-align: center;
}

.pricing-faq__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pricing-faq__item {
  border: 1px solid var(--border-subtle, var(--brand-border));
  border-radius: 8px;
  padding: 14px 16px;
  background: var(--bg-elevated, var(--brand-surface));
}

.pricing-faq__q {
  cursor: pointer;
  font-size: 14.5px;
  font-weight: 500;
  color: var(--text-heading, var(--brand-text));
  list-style: none;
}

.pricing-faq__q::-webkit-details-marker { display: none; }

.pricing-faq__a {
  margin-top: 10px;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--text-body, var(--brand-text-muted));
}
</style>

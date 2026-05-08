<!--
  /pricing — pricing page do tenant atual.

  Layout impactante inspirado em /raio-x: hero com glow amber atmosférico,
  headline grande com italic, mockup visual à direita, cards de planos com
  presença, comparativa rica, FAQ no rodapé.

  Fluxo:
    - Renderiza Pro e Max do tenant atual via GET /api/plans
    - Toggle Mensal / Anual (anual = 10 meses pra pagar 12)
    - Trial Pro 7d sem cartao via POST /api/billing/start-trial (precisa login)
    - Checkout via POST /api/billing/checkout (redirect Stripe)
    - Se tenant.config.billing.enabled === false: redireciona pra /
    - Toast inicial se ?reason=needs-subscription (vindo do middleware paywall)
-->
<template>
  <NuxtLayout :title="'Planos'">
    <div class="lp">
    <!-- ============ HERO ============ -->
    <section class="lp-hero">
      <!-- Atmospheric amber radial -->
      <div
        class="lp-hero__glow"
        aria-hidden="true"
        :style="{
          background: `radial-gradient(ellipse 70% 60% at 50% 0%, color-mix(in srgb, ${brand.colors.primary} 26%, transparent), transparent 65%)`,
        }"
      />

      <div class="lp-container">
        <div class="lp-hero__grid">
          <!-- LEFT: copy + toggle -->
          <div class="lp-hero__copy">
            <p class="lp-eyebrow lp-eyebrow--pulsing">
              <span class="lp-eyebrow__dot" aria-hidden="true" />
              PLANOS {{ tenantName.toUpperCase() }}
            </p>

            <h1 class="lp-hero__headline">
              Saber por que sua carteira mexe<span class="lp-hero__dots">…</span>
              <span class="lp-hero__italic">tem preço.</span>
            </h1>

            <p class="lp-hero__subhead">
              Análise contínua, alertas em tempo real e <strong>plano de ação</strong>
              gerado por IA. Comece com 7 dias grátis.
            </p>

            <p class="lp-hero__lead">
              Sem fidelidade, cancela quando quiser. Aceitamos cartão, PIX e boleto no anual.
            </p>

            <!-- Cycle toggle -->
            <div class="lp-cycle" role="group" aria-label="Ciclo de cobrança">
              <button
                type="button"
                :class="['lp-cycle__btn', { 'is-active': cycle === 'monthly' }]"
                @click="cycle = 'monthly'"
              >
                Mensal
              </button>
              <button
                type="button"
                :class="['lp-cycle__btn', { 'is-active': cycle === 'yearly' }]"
                @click="cycle = 'yearly'"
              >
                Anual
                <span class="lp-cycle__badge">2 meses grátis</span>
              </button>
            </div>

            <!-- Trust row -->
            <ul class="lp-hero__trust">
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                7 dias grátis no Pro
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Sem cartão pra começar
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Reembolso 7 dias (CDC)
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Cancele em 1 click
              </li>
            </ul>
          </div>

          <!-- RIGHT: floating "value stack" mockup -->
          <div class="lp-hero__visual">
            <span class="lp-hero__tombstone" aria-hidden="true">R$</span>

            <div class="lp-stack">
              <!-- Top: AI insight -->
              <div class="lp-stack__card lp-stack__card--top">
                <span class="lp-stack__eyebrow" :style="{ color: brand.colors.primary }">RAIO-X · AGORA</span>
                <p class="lp-stack__title">Sua carteira recuou 1,8% hoje</p>
                <p class="lp-stack__sub">PETR4 puxou. Selic em alta favorece bancos.</p>
                <div class="lp-stack__row">
                  <span class="lp-stack__chip lp-stack__chip--red">−1,8%</span>
                  <span class="lp-stack__chip lp-stack__chip--neutral">Score 72</span>
                </div>
              </div>

              <!-- Middle: action -->
              <div class="lp-stack__card lp-stack__card--mid">
                <span class="lp-stack__eyebrow" :style="{ color: brand.colors.primary }">SUGESTÃO DA IA</span>
                <p class="lp-stack__title">Reduzir 4% em PETR4 e levar pra ITSA4.</p>
                <p class="lp-stack__sub">Diversifica setor + aumenta dividendo esperado em R$ 1.240/ano.</p>
              </div>

              <!-- Bottom: alerts -->
              <div class="lp-stack__card lp-stack__card--bottom">
                <span class="lp-stack__eyebrow" :style="{ color: brand.colors.primary }">ALERTAS ATIVOS</span>
                <ul class="lp-stack__alerts">
                  <li>
                    <span class="lp-stack__pulse" :style="{ background: brand.colors.primary }" />
                    Dividendo MXRF11 cai amanhã
                  </li>
                  <li>
                    <span class="lp-stack__pulse" :style="{ background: brand.colors.positive || '#10b981' }" />
                    ITUB4 superou consenso de lucro
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ PLAN CARDS ============ -->
    <section class="lp-plans">
      <div class="lp-container">
        <header class="lp-section-head reveal-on-scroll">
          <p class="lp-eyebrow">ESCOLHA SEU PLANO</p>
          <h2 class="lp-section-title">
            Comece grátis.
            <span class="lp-section-title__italic">Suba quando quiser.</span>
          </h2>
        </header>

        <!-- Loading -->
        <div v-if="loading" class="lp-loading">
          <UIcon name="i-lucide-loader-2" class="size-8 motion-safe:animate-spin" :style="{ color: brand.colors.primary }" />
        </div>

        <div v-else-if="!plans.length" class="lp-loading">
          <p :style="{ color: 'var(--brand-text-muted)' }">
            Esta plataforma não tem planos pagos.
          </p>
        </div>

        <div v-else class="lp-plans__grid">
          <article
            v-for="plan in sortedPlans"
            :key="plan.id"
            :class="['lp-plan', { 'lp-plan--highlighted': plan.slug === 'max' }]"
          >
            <div
              v-if="plan.slug === 'max'"
              class="lp-plan__halo"
              aria-hidden="true"
              :style="{
                background: `radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, ${brand.colors.primary} 20%, transparent), transparent 70%)`,
              }"
            />

            <span
              v-if="plan.slug === 'max'"
              class="lp-plan__badge"
              :style="{ background: brand.colors.primary, color: '#1A0A2E' }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">
                <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
              </svg>
              MAIS COMPLETO
            </span>

            <header class="lp-plan__header">
              <h3 class="lp-plan__name">{{ plan.name }}</h3>
              <p v-if="plan.description" class="lp-plan__desc">
                {{ plan.description }}
              </p>
            </header>

            <div class="lp-plan__price">
              <span class="lp-plan__currency">R$</span>
              <span class="lp-plan__amount">{{ formatBRL(displayPrice(plan)) }}</span>
              <span class="lp-plan__period">/mês</span>
            </div>
            <p v-if="cycle === 'yearly'" class="lp-plan__price-sub">
              Cobrado R$ {{ formatBRL(yearlyPrice(plan)) }} anual (10 meses pra pagar 12)
            </p>
            <p v-else-if="plan.price_brl_yearly" class="lp-plan__price-sub" :style="{ color: brand.colors.primary }">
              ou R$ {{ formatBRL(yearlyPrice(plan) / 12) }}/mês no anual
            </p>

            <ul class="lp-plan__features">
              <li v-for="feat in featuresLabels(plan)" :key="feat.key">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span v-html="feat.label" />
              </li>
            </ul>

            <footer class="lp-plan__cta">
              <button
                v-if="plan.trial_days && cycle === 'monthly'"
                type="button"
                class="lp-cta lp-cta--primary"
                :disabled="busyPlanId === plan.id"
                @click="onStartTrial(plan.id)"
              >
                <UIcon
                  v-if="busyPlanId === plan.id"
                  name="i-lucide-loader-2"
                  class="size-4 motion-safe:animate-spin"
                />
                <span>{{ busyPlanId === plan.id ? 'Iniciando…' : `Começar ${plan.trial_days} dias grátis` }}</span>
                <svg v-if="busyPlanId !== plan.id" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </button>
              <button
                v-else
                type="button"
                class="lp-cta lp-cta--primary"
                :disabled="busyPlanId === plan.id"
                @click="onCheckout(plan.id, cycle)"
              >
                <UIcon
                  v-if="busyPlanId === plan.id"
                  name="i-lucide-loader-2"
                  class="size-4 motion-safe:animate-spin"
                />
                <span>{{ busyPlanId === plan.id ? 'Carregando…' : `Assinar ${plan.name}` }}</span>
              </button>

              <button
                v-if="plan.trial_days && cycle === 'monthly'"
                type="button"
                class="lp-cta lp-cta--ghost"
                @click="onCheckout(plan.id, cycle)"
              >
                ou assinar direto sem trial
              </button>
            </footer>
          </article>
        </div>
      </div>
    </section>

    <!-- ============ COMPARATIVA ============ -->
    <section v-if="plans.length" class="lp-compare">
      <div class="lp-container">
        <header class="lp-section-head reveal-on-scroll">
          <p class="lp-eyebrow">DETALHES</p>
          <h2 class="lp-section-title">
            O que muda entre Pro e Max.
          </h2>
        </header>

        <div class="lp-compare__table">
          <div class="lp-compare__row lp-compare__row--head">
            <span class="lp-compare__cell lp-compare__cell--label" />
            <span
              v-for="p in sortedPlans"
              :key="p.id"
              :class="['lp-compare__cell', 'lp-compare__cell--plan', { 'is-highlighted': p.slug === 'max' }]"
            >
              {{ p.name }}
            </span>
          </div>
          <div
            v-for="row in compareRows"
            :key="row.key"
            class="lp-compare__row"
          >
            <span class="lp-compare__cell lp-compare__cell--label">{{ row.label }}</span>
            <span
              v-for="p in sortedPlans"
              :key="p.id"
              :class="['lp-compare__cell', 'lp-compare__cell--value', { 'is-highlighted': p.slug === 'max' }]"
              v-html="row.value(p)"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ============ FAQ ============ -->
    <section class="lp-faq">
      <div class="lp-container">
        <header class="lp-section-head reveal-on-scroll">
          <p class="lp-eyebrow">PERGUNTAS FREQUENTES</p>
          <h2 class="lp-section-title">
            Sem letra miúda.
          </h2>
        </header>

        <div class="lp-faq__list">
          <details v-for="item in faq" :key="item.q" class="lp-faq__item">
            <summary class="lp-faq__q">
              {{ item.q }}
              <svg class="lp-faq__chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </summary>
            <p class="lp-faq__a" v-html="item.a" />
          </details>
        </div>
      </div>
    </section>

    <!-- ============ CTA FINAL ============ -->
    <section v-if="plans.length" class="lp-final">
      <div
        class="lp-final__glow"
        aria-hidden="true"
        :style="{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, color-mix(in srgb, ${brand.colors.primary} 22%, transparent), transparent 70%)`,
        }"
      />
      <div class="lp-container lp-final__inner">
        <p class="lp-eyebrow lp-eyebrow--center">7 DIAS GRÁTIS</p>
        <h2 class="lp-section-title">
          A IA que cuida<br />
          <span class="lp-section-title__italic">da sua carteira agora.</span>
        </h2>
        <p class="lp-final__lead">
          Sem fidelidade. Sem cartão pra começar. Resultado em 2 minutos.
        </p>
        <button
          type="button"
          class="lp-cta lp-cta--primary lp-cta--big"
          :disabled="!proPlan || busyPlanId === proPlan?.id"
          @click="proPlan && onStartTrial(proPlan.id)"
        >
          <UIcon
            v-if="proPlan && busyPlanId === proPlan.id"
            name="i-lucide-loader-2"
            class="size-5 motion-safe:animate-spin"
          />
          <span>Começar trial Pro de 7 dias</span>
          <svg v-if="!proPlan || busyPlanId !== proPlan.id" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
          </svg>
        </button>
      </div>
    </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { IPlan } from '~/types/plan'

definePageMeta({
  layout: 'default',
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const route = useRoute()
const router = useRouter()
const brand = useBrand()
const billingService = useBillingService()
const toast = useToast()

usePageSeo({
  title: `Planos | ${brand.name}`,
  description: 'Pro e Max — comece com 7 dias grátis. Sem cartão pra começar, cancele quando quiser.',
  path: '/pricing',
})

const cycle = ref<'monthly' | 'yearly'>('monthly')
const plans = ref<IPlan[]>([])
const tenantName = ref(brand.name)
const billingEnabled = ref(true)
const loading = ref(true)
const busyPlanId = ref<number | null>(null)

const sortedPlans = computed(() => [...plans.value].sort((a, b) => a.sort_order - b.sort_order))
const proPlan = computed(() => plans.value.find((p) => p.slug === 'pro') || null)

const faq = [
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. Cancele direto pelo portal Stripe (em /settings/gerenciar-plano) ou no atendimento. Sua assinatura segue ativa até o fim do período já pago — sem multa, sem fidelidade.',
  },
  {
    q: 'Como funciona o trial?',
    a: 'O Pro tem 7 dias grátis sem precisar de cartão. Se você não adicionar pagamento até o fim do trial, sua conta volta pro estado anterior automaticamente. Sem cobrança surpresa.',
  },
  {
    q: 'Quando posso pedir reembolso?',
    a: 'Em até 7 dias da contratação, conforme o CDC. Reembolso integral, sem perguntas chatas.',
  },
  {
    q: 'Aceitam PIX e boleto?',
    a: 'Sim, no plano anual. A cobrança mensal só aceita cartão (PIX recorrente ainda não é nativo no Brasil).',
  },
  {
    q: 'O que acontece se meu cartão falhar?',
    a: 'Você tem 3 dias de janela pra atualizar o cartão sem perder acesso. Avisamos por email assim que detectamos a falha.',
  },
  {
    q: 'O que vem em cada plano?',
    a: 'Pro inclui análise contínua + raio-x ilimitado (dentro do cap diário) + watchlist com 25 ativos + comparativo + histórico + alertas de notícia. Max adiciona simulador de rebalanceamento, relatório semanal automático por email, acompanhamento profundo de teses e watchlist ilimitada.',
  },
]

const compareRows = [
  {
    key: 'chat-max',
    label: 'Análises profundas com IA / dia',
    value: (p: IPlan) => `<strong class="tabular-nums">${p.limits?.max_chat_daily ?? 0}</strong>`,
  },
  {
    key: 'chat-basic',
    label: 'Chat com IA / dia (perguntas rápidas)',
    value: (p: IPlan) => p.limits?.basic_chat_daily === -1 ? 'Ilimitado' : `<span class="tabular-nums">${p.limits?.basic_chat_daily ?? 0}</span>`,
  },
  {
    key: 'watchlist',
    label: 'Watchlist (ativos monitorados)',
    value: (p: IPlan) => p.limits?.watchlist_total === -1 ? 'Ilimitada' : `<span class="tabular-nums">${p.limits?.watchlist_total ?? 0}</span>`,
  },
  {
    key: 'compare',
    label: 'Comparativo de ativos',
    value: (p: IPlan) => p.features?.includes('compare_assets') ? checkSvg() : dashSvg(),
  },
  {
    key: 'history',
    label: 'Histórico ilimitado de carteira',
    value: (p: IPlan) => p.features?.includes('historical_portfolio') ? checkSvg() : dashSvg(),
  },
  {
    key: 'news',
    label: 'Análise de impacto de notícia',
    value: (p: IPlan) => p.features?.includes('news_impact') ? checkSvg() : dashSvg(),
  },
  {
    key: 'xlsx',
    label: 'Export XLSX',
    value: (p: IPlan) => p.features?.includes('xlsx_export') ? checkSvg() : dashSvg(),
  },
  {
    key: 'rebal',
    label: 'Simulador de rebalanceamento',
    value: (p: IPlan) => p.features?.includes('rebalance_simulator') ? checkSvg() : dashSvg(),
  },
  {
    key: 'thesis',
    label: 'Acompanhamento de teses',
    value: (p: IPlan) => p.features?.includes('thesis_tracking') ? checkSvg() : dashSvg(),
  },
  {
    key: 'weekly',
    label: 'Relatório semanal por email',
    value: (p: IPlan) => p.features?.includes('weekly_report') ? checkSvg() : dashSvg(),
  },
]

function checkSvg() {
  return `<span class="lp-compare__check"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>`
}
function dashSvg() {
  return `<span class="lp-compare__dash">—</span>`
}

function formatBRL(n: number) {
  if (!Number.isFinite(n)) return '0,00'
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function monthlyPrice(p: IPlan) { return parseFloat(p.price_brl_monthly ?? '0') }
function yearlyPrice(p: IPlan) { return parseFloat(p.price_brl_yearly ?? '0') }

function displayPrice(p: IPlan) {
  return cycle.value === 'yearly' ? yearlyPrice(p) / 12 : monthlyPrice(p)
}

function featuresLabels(plan: IPlan) {
  const limits = plan.limits ?? {}
  const features = plan.features ?? []
  const items: Array<{ key: string; label: string }> = []

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
      label: limits.basic_chat_daily === -1 ? 'Chat ilimitado' : `${limits.basic_chat_daily} perguntas no chat/dia`,
    })
  }
  if (limits.watchlist_total !== undefined) {
    items.push({
      key: 'watchlist',
      label: limits.watchlist_total === -1 ? 'Watchlist ilimitada' : `Watchlist com até ${limits.watchlist_total} ativos`,
    })
  }
  if (features.includes('compare_assets')) items.push({ key: 'compare', label: 'Comparativo de ativos' })
  if (features.includes('historical_portfolio')) items.push({ key: 'history', label: 'Histórico ilimitado de carteira' })
  if (features.includes('news_impact')) items.push({ key: 'news', label: 'Análise de impacto de notícias' })
  if (features.includes('xlsx_export')) items.push({ key: 'xlsx', label: 'Export XLSX' })
  if (features.includes('rebalance_simulator')) items.push({ key: 'rebal', label: 'Simulador de rebalanceamento' })
  if (features.includes('thesis_tracking')) items.push({ key: 'thesis', label: 'Acompanhamento profundo de teses' })
  if (features.includes('weekly_report')) items.push({ key: 'weekly', label: 'Relatório semanal por email' })
  if (features.includes('priority_processing')) items.push({ key: 'prio', label: 'Prioridade no processamento' })

  return items
}

async function loadPlans() {
  loading.value = true
  try {
    const slug = brand.slug
    const data = await billingService.listPublicPlans(slug)
    const payload = (data as any)?.data ?? data
    plans.value = payload.plans ?? []
    tenantName.value = payload.tenant?.name ?? brand.name
    billingEnabled.value = Boolean(payload.billing_enabled)
    if (!billingEnabled.value) router.replace('/')
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
/* ============================================================
   PRICING — design system inspirado em /raio-x
   Hero massive + glow amber atmosférico + cards com presença +
   comparativa rica + FAQ + CTA repetido. Mesmo DNA visual da
   /raio-x pra dar sensação de continuidade pro user.
   ============================================================ */

.lp { width: 100%; position: relative; overflow-x: hidden; }

.lp-plans, .lp-compare, .lp-faq, .lp-final {
  content-visibility: auto;
  contain-intrinsic-size: 1px 800px;
}

.lp-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
@media (min-width: 768px) { .lp-container { padding: 0 40px; } }

/* ============ EYEBROW ============ */
.lp-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.lp-eyebrow--center { text-align: center; justify-content: center; display: flex; }
.lp-eyebrow--pulsing .lp-eyebrow__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 25%, transparent);
  animation: lp-pulse 2.4s ease-in-out infinite;
}
@keyframes lp-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
}

/* ============ SECTION TITLE ============ */
.lp-section-title {
  font-size: 32px;
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--brand-text);
  margin: 12px 0 0;
  text-wrap: balance;
}
@media (min-width: 768px) { .lp-section-title { font-size: 48px; } }

.lp-section-title__italic {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
  display: block;
}

.lp-section-head {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 48px;
}
@media (min-width: 768px) { .lp-section-head { margin-bottom: 64px; } }

/* ============ HERO ============ */
.lp-hero {
  position: relative;
  padding: 56px 0 72px;
  isolation: isolate;
}
@media (min-width: 768px) { .lp-hero { padding: 88px 0 112px; } }

.lp-hero__glow {
  position: absolute;
  inset: -120px -10% auto -10%;
  height: 720px;
  filter: blur(60px);
  z-index: -1;
  pointer-events: none;
  opacity: 0.85;
  will-change: opacity;
  transform: translateZ(0);
}

.lp-hero__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;
  align-items: center;
}
@media (min-width: 1024px) {
  .lp-hero__grid {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    gap: 64px;
  }
}

.lp-hero__copy { display: flex; flex-direction: column; gap: 18px; }

.lp-hero__headline {
  font-size: 38px;
  font-weight: 300;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--brand-text);
  margin: 6px 0 0;
  text-wrap: balance;
}
@media (min-width: 768px) { .lp-hero__headline { font-size: 60px; } }

.lp-hero__dots { color: color-mix(in srgb, var(--brand-text) 50%, transparent); }
.lp-hero__italic {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
  display: block;
  margin-top: 4px;
}

.lp-hero__subhead {
  font-size: 18px;
  line-height: 1.5;
  color: var(--brand-text);
  margin: 0;
  font-weight: 400;
}
.lp-hero__subhead strong { color: var(--brand-primary); font-weight: 600; }
@media (min-width: 768px) { .lp-hero__subhead { font-size: 21px; } }

.lp-hero__lead {
  font-size: 14.5px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
  margin: 0;
  max-width: 540px;
}

.lp-hero__trust {
  list-style: none;
  margin: 6px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}
.lp-hero__trust li { display: inline-flex; align-items: center; gap: 6px; }
.lp-hero__trust svg { color: var(--brand-positive, #10b981); }

/* Cycle toggle */
.lp-cycle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 60%, transparent);
  background: color-mix(in srgb, var(--brand-surface) 65%, var(--brand-background));
  width: fit-content;
}
.lp-cycle__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 8px;
  background: transparent;
  border: 0;
  font-family: var(--brand-font);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
  cursor: pointer;
  transition: background 180ms, color 180ms;
}
.lp-cycle__btn.is-active {
  background: var(--brand-primary);
  color: #1A0A2E;
}
.lp-cycle__btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 35%, transparent);
}
.lp-cycle__badge {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 2px 6px;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.12);
  text-transform: uppercase;
}

/* ============ HERO VISUAL — value stack ============ */
.lp-hero__visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 520px;
}

.lp-hero__tombstone {
  position: absolute;
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: clamp(180px, 22vw, 280px);
  font-weight: 400;
  color: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  pointer-events: none;
  user-select: none;
  z-index: -1;
  letter-spacing: -0.04em;
}

.lp-stack {
  position: relative;
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.lp-stack__card {
  position: relative;
  border-radius: 18px;
  background: var(--brand-surface);
  border: 1px solid color-mix(in srgb, var(--brand-border) 60%, transparent);
  padding: 18px 20px;
  box-shadow:
    0 18px 48px -16px color-mix(in srgb, var(--brand-primary) 22%, transparent),
    0 8px 24px -8px rgba(0, 0, 0, 0.16);
  display: flex;
  flex-direction: column;
  gap: 6px;
  will-change: transform;
}
@media (min-width: 1024px) {
  .lp-stack__card--top { transform: translateX(-12px); }
  .lp-stack__card--mid { transform: translateX(8px); }
  .lp-stack__card--bottom { transform: translateX(-4px); }
}

.lp-stack__eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.lp-stack__title {
  font-size: 15.5px;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: -0.012em;
  color: var(--brand-text);
  margin: 0;
}

.lp-stack__sub {
  font-size: 12.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  margin: 0;
}

.lp-stack__row {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.lp-stack__chip {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: -0.005em;
}
.lp-stack__chip--red {
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 12%, transparent);
  color: var(--brand-negative, #dc2626);
}
.lp-stack__chip--neutral {
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
}

.lp-stack__alerts {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: color-mix(in srgb, var(--brand-text) 80%, transparent);
}
.lp-stack__alerts li {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.lp-stack__pulse {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  flex-shrink: 0;
  animation: lp-pulse 2.4s ease-in-out infinite;
}

/* ============ PLANS ============ */
.lp-plans {
  padding: 64px 0 32px;
}
@media (min-width: 768px) { .lp-plans { padding: 88px 0 48px; } }

.lp-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

.lp-plans__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  max-width: 880px;
  margin: 0 auto;
}
@media (min-width: 768px) {
  .lp-plans__grid {
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }
}

.lp-plan {
  position: relative;
  border-radius: 22px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 60%, transparent);
  background: var(--brand-surface);
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: border-color 200ms, transform 200ms, box-shadow 200ms;
  isolation: isolate;
}
.lp-plan:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
  transform: translateY(-2px);
}

.lp-plan--highlighted {
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
  box-shadow:
    0 24px 64px -20px color-mix(in srgb, var(--brand-primary) 32%, transparent),
    0 12px 32px -10px rgba(0, 0, 0, 0.18);
}

.lp-plan__halo {
  position: absolute;
  inset: -60px -20% auto -20%;
  height: 220px;
  filter: blur(50px);
  z-index: -1;
  pointer-events: none;
  opacity: 0.7;
}

.lp-plan__badge {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  box-shadow: 0 8px 20px -6px color-mix(in srgb, var(--brand-primary) 50%, transparent);
}

.lp-plan__header { display: flex; flex-direction: column; gap: 6px; }
.lp-plan__name {
  font-family: var(--brand-font);
  font-weight: 300;
  font-size: 28px;
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--brand-text);
  margin: 0;
}
.lp-plan__desc {
  font-size: 13.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  margin: 0;
}

.lp-plan__price {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}
.lp-plan__currency {
  font-size: 18px;
  font-weight: 400;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.lp-plan__amount {
  font-family: var(--brand-font);
  font-weight: 300;
  font-size: 56px;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--brand-text);
  font-variant-numeric: tabular-nums;
}
.lp-plan__period {
  font-size: 14px;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}
.lp-plan__price-sub {
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  margin: 0;
}

.lp-plan__features {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 1;
}
.lp-plan__features li {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  font-size: 13.5px;
  line-height: 1.45;
  color: color-mix(in srgb, var(--brand-text) 88%, transparent);
}
.lp-plan__features li svg {
  color: var(--brand-primary);
  flex-shrink: 0;
  margin-top: 4px;
}
.lp-plan__features li strong { color: var(--brand-text); }

.lp-plan__cta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: auto;
}

/* ============ CTA buttons ============ */
.lp-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 22px;
  border-radius: 12px;
  border: 0;
  font-family: var(--brand-font);
  font-size: 14.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  cursor: pointer;
  transition: transform 200ms, filter 200ms, box-shadow 200ms, background 200ms;
  white-space: nowrap;
}
.lp-cta:disabled { opacity: 0.55; cursor: not-allowed; }

.lp-cta--primary {
  background: var(--brand-primary);
  color: #1A0A2E;
  box-shadow: 0 14px 32px -12px color-mix(in srgb, var(--brand-primary) 65%, transparent);
}
.lp-cta--primary:hover:not(:disabled) {
  filter: brightness(0.94);
  transform: translateY(-1px);
  box-shadow: 0 18px 40px -12px color-mix(in srgb, var(--brand-primary) 75%, transparent);
}

.lp-cta--ghost {
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--brand-border) 60%, transparent);
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
  font-size: 12.5px;
  font-weight: 500;
}
.lp-cta--ghost:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
  color: var(--brand-primary);
}

.lp-cta--big {
  padding: 18px 32px;
  font-size: 16px;
  border-radius: 14px;
}

/* ============ COMPARATIVA ============ */
.lp-compare {
  padding: 32px 0 64px;
}

.lp-compare__table {
  max-width: 900px;
  margin: 0 auto;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  overflow: hidden;
  background: var(--brand-surface);
}

.lp-compare__row {
  display: grid;
  grid-template-columns: 1.6fr repeat(2, minmax(0, 1fr));
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
}
.lp-compare__row:first-child { border-top: 0; }

.lp-compare__row--head .lp-compare__cell {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  padding: 16px 20px;
  background: color-mix(in srgb, var(--brand-surface) 60%, var(--brand-background));
}

.lp-compare__cell {
  padding: 14px 20px;
  font-size: 13.5px;
  display: flex;
  align-items: center;
}

.lp-compare__cell--label {
  color: color-mix(in srgb, var(--brand-text) 80%, transparent);
}
.lp-compare__cell--value, .lp-compare__cell--plan {
  justify-content: center;
  text-align: center;
  color: var(--brand-text);
  border-left: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
}
.lp-compare__cell--plan {
  font-weight: 500;
  color: var(--brand-text);
  text-transform: none;
  letter-spacing: -0.005em;
  font-size: 14px;
  font-family: var(--brand-font);
}
.lp-compare__cell.is-highlighted {
  background: color-mix(in srgb, var(--brand-primary) 6%, transparent);
}
.lp-compare__cell--plan.is-highlighted {
  color: var(--brand-primary);
}

:deep(.lp-compare__check) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
}
:deep(.lp-compare__dash) {
  color: color-mix(in srgb, var(--brand-text) 35%, transparent);
  font-weight: 500;
}

/* ============ FAQ ============ */
.lp-faq { padding: 32px 0 64px; }

.lp-faq__list {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lp-faq__item {
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  background: var(--brand-surface);
  padding: 0;
  overflow: hidden;
  transition: border-color 180ms;
}
.lp-faq__item[open] {
  border-color: color-mix(in srgb, var(--brand-primary) 30%, transparent);
}

.lp-faq__q {
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: var(--brand-text);
  list-style: none;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.lp-faq__q::-webkit-details-marker { display: none; }
.lp-faq__chevron {
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  transition: transform 200ms;
  flex-shrink: 0;
}
.lp-faq__item[open] .lp-faq__chevron {
  transform: rotate(180deg);
  color: var(--brand-primary);
}
.lp-faq__a {
  margin: 0;
  padding: 0 20px 18px;
  font-size: 13.5px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}

/* ============ CTA FINAL ============ */
.lp-final {
  position: relative;
  padding: 88px 0 112px;
  isolation: isolate;
  text-align: center;
  overflow: hidden;
}

.lp-final__glow {
  position: absolute;
  inset: 0;
  filter: blur(80px);
  z-index: -1;
  pointer-events: none;
  opacity: 0.7;
}

.lp-final__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.lp-final__lead {
  margin: 0;
  font-size: 16px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
  max-width: 480px;
}

@media (max-width: 640px) {
  .lp-hero__visual { min-height: 360px; }
  .lp-stack { gap: 10px; }
  .lp-stack__card { padding: 14px 16px; }
}
</style>

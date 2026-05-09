<!--
  /admin/billing — receita consolidada por tenant.

  Visual: usa o admin design system. Stats card grande no topo, tabela
  de tenants billing-on com ativar/desativar inline + atalhos pra Planos
  e Assinantes do tenant especifico.
-->
<template>
  <NuxtLayout name="admin-panel">
    <div class="admin-page">
      <!-- ============ HEADER ============ -->
      <header class="admin-page__head">
        <div class="admin-page__head-left">
          <span class="admin-page__eyebrow">
            <UIcon name="i-lucide-credit-card" />
            Billing
          </span>
          <h1 class="admin-page__title">Receita e assinantes.</h1>
          <p class="admin-page__lead">
            MRR consolidado, conversões de trial e tenants com billing habilitado.
          </p>
        </div>
      </header>

      <!-- ============ KPI CARDS ============ -->
      <div class="admin-grid admin-grid--3">
        <article class="admin-card admin-card--accent billing-kpi">
          <span class="billing-kpi__label">MRR (R$)</span>
          <p class="billing-kpi__value">{{ stats ? formatBRL(stats.mrr_brl) : '—' }}</p>
          <p class="billing-kpi__sub">Soma mensal de todos os tenants pagantes</p>
        </article>
        <article class="admin-card billing-kpi">
          <span class="billing-kpi__label">Assinantes pagos</span>
          <p class="billing-kpi__value">{{ stats?.paying_users ?? '—' }}</p>
          <p class="billing-kpi__sub">Status active no Stripe</p>
        </article>
        <article class="admin-card billing-kpi">
          <span class="billing-kpi__label">Em trial</span>
          <p class="billing-kpi__value">{{ stats?.trial_users ?? '—' }}</p>
          <p class="billing-kpi__sub">Trialing (com ou sem cartão)</p>
        </article>
      </div>

      <!-- ============ TENANTS BILLING ============ -->
      <section class="admin-section">
        <div class="admin-section__head">
          <div class="admin-section__head-left">
            <span class="admin-section__eyebrow">
              <UIcon name="i-lucide-building-2" />
              Tenants
            </span>
            <h2 class="admin-section__title">Quem está cobrando hoje</h2>
          </div>
        </div>

        <div v-if="loading" class="admin-loading">
          <span class="admin-loading__icon">
            <UIcon name="i-lucide-loader-2" class="size-4 motion-safe:animate-spin" />
          </span>
          <span class="admin-loading__title">Carregando tenants…</span>
        </div>

        <div v-else-if="!tenantsBilling.length" class="admin-empty">
          <span class="admin-empty__icon">
            <UIcon name="i-lucide-piggy-bank" class="size-4" />
          </span>
          <span class="admin-empty__title">Nenhum tenant com billing</span>
          <span class="admin-empty__sub">
            Habilite no editor de cada tenant em <code>config.billing.enabled</code>.
          </span>
        </div>

        <div v-else class="admin-table">
          <div class="admin-table__scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Slug</th>
                  <th scope="col">Nome</th>
                  <th scope="col" class="admin-table__center">Status</th>
                  <th scope="col" class="admin-table__right">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in tenantsBilling" :key="t.id">
                  <td>
                    <span class="billing-slug">{{ t.slug }}</span>
                  </td>
                  <td>
                    <span class="admin-table__primary-name">{{ t.name }}</span>
                  </td>
                  <td class="admin-table__center">
                    <span
                      class="admin-badge"
                      :class="t.config?.billing?.enabled ? 'admin-badge--positive' : 'admin-badge--warning'"
                    >
                      {{ t.config?.billing?.enabled ? 'Ativo' : 'Desativado' }}
                    </span>
                  </td>
                  <td class="admin-table__right">
                    <div class="admin-actions">
                      <button
                        type="button"
                        :disabled="togglingId === t.id"
                        class="admin-btn admin-btn--xs"
                        :class="t.config?.billing?.enabled ? 'admin-btn--danger' : 'admin-btn--ghost'"
                        :style="!t.config?.billing?.enabled ? 'color: var(--brand-positive, #10b981); border-color: color-mix(in srgb, var(--brand-positive, #10b981) 35%, transparent);' : ''"
                        @click="onToggleBilling(t)"
                      >
                        <UIcon
                          v-if="togglingId === t.id"
                          name="i-lucide-loader-2"
                          class="size-3 motion-safe:animate-spin"
                        />
                        <UIcon
                          v-else
                          :name="t.config?.billing?.enabled ? 'i-lucide-pause' : 'i-lucide-play'"
                          class="size-3"
                        />
                        {{ t.config?.billing?.enabled ? 'Desativar' : 'Ativar' }}
                      </button>
                      <NuxtLink
                        :to="`/admin/tenants/${t.id}/plans`"
                        class="admin-btn admin-btn--ghost admin-btn--xs"
                      >
                        <UIcon name="i-lucide-package" class="size-3" />
                        Planos
                      </NuxtLink>
                      <NuxtLink
                        :to="`/admin/tenants/${t.id}/subscriptions`"
                        class="admin-btn admin-btn--ghost admin-btn--xs"
                      >
                        <UIcon name="i-lucide-users" class="size-3" />
                        Assinantes
                      </NuxtLink>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { ISubscriptionStats } from '~/types/subscription'

definePageMeta({ middleware: ['admin-panel'] })

const billing = useAdminBillingService()
const tenantsService = useTenantsService()
const toast = useToast()

const stats = ref<ISubscriptionStats | null>(null)
const tenantsBilling = ref<any[]>([])
const loading = ref(true)
const togglingId = ref<number | null>(null)

function formatBRL(n: number) {
  if (!Number.isFinite(n)) return '0,00'
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function onToggleBilling(t: any) {
  const next = !t.config?.billing?.enabled
  const verb = next ? 'ATIVAR' : 'DESATIVAR'
  const warning = next
    ? 'Atenção: users sem subscription ativa serão bouncados pra /pricing.'
    : 'Atenção: tudo será liberado (unlimited synthetic) pros users desse tenant.'
  if (!confirm(`${verb} billing pro tenant "${t.name}"?\n\n${warning}`)) return

  togglingId.value = t.id
  try {
    const newConfig = { ...(t.config || {}) }
    newConfig.billing = {
      ...(newConfig.billing || {}),
      enabled: next,
      currency: newConfig.billing?.currency || 'BRL',
      trial_days_pro: newConfig.billing?.trial_days_pro ?? 7,
    }
    const resp = await tenantsService.update(t.id, { config: newConfig })
    const updated = (resp as any)?.data || resp
    const idx = tenantsBilling.value.findIndex((x) => x.id === t.id)
    if (idx >= 0) tenantsBilling.value[idx] = updated
    toast.add({ title: next ? 'Billing ativado' : 'Billing desativado', color: next ? 'success' : 'info' })
  } catch (err: any) {
    toast.add({ title: 'Erro ao alternar billing', description: err?.data?.message ?? 'Tente novamente.', color: 'error' })
  } finally {
    togglingId.value = null
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const [statsResp, tenantsResp] = await Promise.all([
      billing.stats().catch(() => null),
      tenantsService.list({ active: true, page: 1 }).catch(() => null),
    ])
    stats.value = (statsResp as any)?.data ?? statsResp
    const allTenants = ((tenantsResp as any)?.data?.data ?? (tenantsResp as any)?.data ?? []) as any[]
    tenantsBilling.value = allTenants.filter((t) => t.config?.billing && (t.config.billing.enabled || t.config.billing.currency))
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.billing-kpi { gap: 6px; }
.billing-kpi__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.billing-kpi__value {
  margin: 4px 0 2px;
  font-family: var(--brand-font);
  font-weight: 200;
  font-size: clamp(28px, 3vw, 36px);
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: var(--brand-text);
  font-variant-numeric: tabular-nums;
}
.billing-kpi__sub {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

.billing-slug {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--brand-primary);
  letter-spacing: -0.005em;
}
</style>

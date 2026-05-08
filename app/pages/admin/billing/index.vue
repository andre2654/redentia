<template>
  <NuxtLayout name="admin-panel">
    <div class="mx-auto flex max-w-6xl flex-col gap-6">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">Billing</span>
          <h1 class="mt-2 text-[28px] leading-tight md:text-[36px]" :style="{ color: C.text, fontFamily: F.display }">
            Receita e assinantes.
          </h1>
        </div>
      </header>

      <!-- Stats consolidadas -->
      <div class="grid gap-4 md:grid-cols-3">
        <article class="rounded-sm border p-5" :style="{ borderColor: C.border, backgroundColor: C.surface }">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">MRR (R$)</span>
          <p class="mt-2 text-[32px] tabular-nums" :style="{ color: C.text, fontFamily: F.display }">
            {{ stats ? formatBRL(stats.mrr_brl) : '—' }}
          </p>
          <p class="mt-1 text-[12px]" :style="{ color: C.textMuted }">Soma mensal de todos os tenants pagantes</p>
        </article>
        <article class="rounded-sm border p-5" :style="{ borderColor: C.border, backgroundColor: C.surface }">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">Assinantes pagos</span>
          <p class="mt-2 text-[32px] tabular-nums" :style="{ color: C.text, fontFamily: F.display }">
            {{ stats?.paying_users ?? '—' }}
          </p>
          <p class="mt-1 text-[12px]" :style="{ color: C.textMuted }">Status active (Stripe)</p>
        </article>
        <article class="rounded-sm border p-5" :style="{ borderColor: C.border, backgroundColor: C.surface }">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">Em trial</span>
          <p class="mt-2 text-[32px] tabular-nums" :style="{ color: C.text, fontFamily: F.display }">
            {{ stats?.trial_users ?? '—' }}
          </p>
          <p class="mt-1 text-[12px]" :style="{ color: C.textMuted }">Trialing (sem cartão ou com cartão)</p>
        </article>
      </div>

      <!-- Tenants com billing on -->
      <section class="flex flex-col gap-3">
        <h2 class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
          Tenants com billing
        </h2>
        <div v-if="loading" class="rounded-sm border p-6 text-center" :style="{ borderColor: C.border, color: C.textMuted }">
          <UIcon name="i-lucide-loader-2" class="size-5 motion-safe:animate-spin" />
        </div>
        <div v-else-if="!tenantsBilling.length" class="rounded-sm border p-6 text-center text-[13px]" :style="{ borderColor: C.border, color: C.textMuted }">
          Nenhum tenant com billing ativado. Habilite no editor de cada tenant (config.billing.enabled).
        </div>
        <div v-else class="overflow-hidden rounded-sm border" :style="{ borderColor: C.border }">
          <table class="w-full text-left">
            <thead class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted, backgroundColor: C.surface }">
              <tr>
                <th class="px-4 py-3">SLUG</th>
                <th class="px-4 py-3">NOME</th>
                <th class="px-4 py-3 text-center">BILLING</th>
                <th class="px-4 py-3 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in tenantsBilling" :key="t.id" class="border-t" :style="{ borderColor: C.border, backgroundColor: C.surface }">
                <td class="px-4 py-3 font-mono-tab text-[12px]" :style="{ color: C.primary }">{{ t.slug }}</td>
                <td class="px-4 py-3 text-[13px]" :style="{ color: C.text }">{{ t.name }}</td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="font-mono-tab text-[10px] uppercase rounded-sm border px-2 py-0.5"
                    :style="{ borderColor: t.config?.billing?.enabled ? C.positive : '#f59e0b', color: t.config?.billing?.enabled ? C.positive : '#f59e0b' }"
                  >
                    {{ t.config?.billing?.enabled ? 'ATIVO' : 'CONFIGURADO MAS DESATIVADO' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <button
                    type="button"
                    :disabled="togglingId === t.id"
                    class="font-mono-tab text-[10px] uppercase tracking-[0.15em] rounded-sm border px-3 py-1.5 mr-2 disabled:opacity-50"
                    :style="{ borderColor: t.config?.billing?.enabled ? C.negative : C.positive, color: t.config?.billing?.enabled ? C.negative : C.positive }"
                    @click="onToggleBilling(t)"
                  >
                    <UIcon
                      v-if="togglingId === t.id"
                      name="i-lucide-loader-2"
                      class="size-3 motion-safe:animate-spin"
                    />
                    {{ t.config?.billing?.enabled ? 'DESATIVAR' : 'ATIVAR' }}
                  </button>
                  <NuxtLink
                    :to="`/admin/tenants/${t.id}/plans`"
                    class="font-mono-tab text-[10px] uppercase tracking-[0.15em] rounded-sm border px-3 py-1.5 mr-2"
                    :style="{ borderColor: C.primary, color: C.primary }"
                  >
                    PLANOS
                  </NuxtLink>
                  <NuxtLink
                    :to="`/admin/tenants/${t.id}/subscriptions`"
                    class="font-mono-tab text-[10px] uppercase tracking-[0.15em] rounded-sm border px-3 py-1.5"
                    :style="{ borderColor: C.primary, color: C.primary }"
                  >
                    ASSINANTES
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F } from '~/utils/redentiaCreativeColors'
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
    // Atualiza inline pra evitar refetch da lista inteira
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

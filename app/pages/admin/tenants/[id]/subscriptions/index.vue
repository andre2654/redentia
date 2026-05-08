<template>
  <NuxtLayout name="admin-panel">
    <div class="mx-auto flex max-w-6xl flex-col gap-6">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
            Assinantes
          </span>
          <h1 class="mt-2 text-[28px] leading-tight md:text-[36px]" :style="{ color: C.text, fontFamily: F.display }">
            {{ tenant?.name || 'Carregando…' }}
          </h1>
          <div class="mt-2 flex gap-3 text-[12px]" :style="{ color: C.textMuted }">
            <NuxtLink :to="`/admin/tenants/${tenantId}`" class="hover:underline">← Editor do tenant</NuxtLink>
            <NuxtLink :to="`/admin/tenants/${tenantId}/plans`" class="hover:underline">Planos →</NuxtLink>
          </div>
        </div>
      </header>

      <!-- Filtros -->
      <div class="flex flex-wrap items-center gap-3">
        <select v-model="statusFilter" class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none" :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }" @change="refresh">
          <option value="">Todos os status</option>
          <option value="trialing">Trial</option>
          <option value="active">Ativa</option>
          <option value="past_due">Pagamento pendente</option>
          <option value="canceled">Cancelada</option>
          <option value="incomplete">Incompleta</option>
        </select>
        <select v-model="cycleFilter" class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none" :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }" @change="refresh">
          <option value="">Mensal + Anual</option>
          <option value="monthly">Mensal</option>
          <option value="yearly">Anual</option>
        </select>
        <button
          type="button"
          class="font-mono-tab text-[10px] uppercase tracking-[0.15em] rounded-sm border px-3 py-1.5"
          :style="{ borderColor: C.primary, color: C.primary }"
          @click="onOverrideOpen"
        >
          + APLICAR OVERRIDE
        </button>
      </div>

      <!-- Tabela -->
      <div class="overflow-hidden rounded-sm border" :style="{ borderColor: C.border }">
        <table class="w-full text-left">
          <thead class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted, backgroundColor: C.surface }">
            <tr>
              <th class="px-4 py-3">USER</th>
              <th class="px-4 py-3">PLANO</th>
              <th class="px-4 py-3">CICLO</th>
              <th class="px-4 py-3 text-center">STATUS</th>
              <th class="px-4 py-3 tabular-nums">PERÍODO ATÉ</th>
              <th class="px-4 py-3 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="p-8 text-center" :style="{ color: C.textMuted }">
                <UIcon name="i-lucide-loader-2" class="size-5 motion-safe:animate-spin" />
              </td>
            </tr>
            <tr v-else-if="!items.length">
              <td colspan="6" class="p-8 text-center text-[13px]" :style="{ color: C.textMuted }">
                Nenhum assinante encontrado.
              </td>
            </tr>
            <tr
              v-for="sub in items"
              v-else
              :key="sub.id"
              class="border-t transition-colors"
              :style="{ borderColor: C.border, backgroundColor: C.surface }"
            >
              <td class="px-4 py-3 text-[13px]" :style="{ color: C.text }">
                <div class="flex flex-col">
                  <span>{{ sub.user?.name || '—' }}</span>
                  <span class="text-[11px]" :style="{ color: C.textMuted }">{{ sub.user?.email || '—' }}</span>
                </div>
              </td>
              <td class="px-4 py-3 font-mono-tab text-[12px]" :style="{ color: C.primary }">
                {{ sub.plan?.slug || '—' }}
              </td>
              <td class="px-4 py-3 text-[12px]" :style="{ color: C.textMuted }">{{ sub.billing_cycle }}</td>
              <td class="px-4 py-3 text-center">
                <span
                  class="font-mono-tab text-[10px] uppercase rounded-sm border px-2 py-0.5"
                  :style="{ borderColor: statusColor(sub.status), color: statusColor(sub.status) }"
                >{{ sub.status }}</span>
              </td>
              <td class="px-4 py-3 text-[12px] tabular-nums" :style="{ color: C.textMuted }">
                {{ formatDate(sub.current_period_end) }}
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  type="button"
                  class="font-mono-tab text-[10px] uppercase tracking-[0.15em] rounded-sm border px-2 py-1"
                  :style="{ borderColor: C.primary, color: C.primary }"
                  @click="onOverrideForUser(sub)"
                >
                  OVERRIDE
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Override modal -->
    <dialog
      ref="overrideEl"
      class="rounded-sm border p-0 backdrop:bg-black/70"
      :style="{ borderColor: C.border, backgroundColor: C.surface, color: C.text, maxWidth: '480px', width: '92vw' }"
    >
      <form v-if="overrideForm" class="flex flex-col gap-4 p-6" @submit.prevent="onOverrideSave">
        <header>
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">Aplicar override manual</span>
          <h2 class="mt-1 text-[20px]" :style="{ color: C.text, fontFamily: F.display }">
            Plano grátis pra um user
          </h2>
          <p class="mt-1 text-[12px]" :style="{ color: C.textMuted }">
            Override tem precedência sobre subscription real.
          </p>
        </header>

        <label class="flex flex-col gap-2">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">USER ID</span>
          <input v-model.number="overrideForm.user_id" type="number" required class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none tabular-nums" :style="{ borderColor: C.border, color: C.text }" />
        </label>
        <label class="flex flex-col gap-2">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">PLANO</span>
          <select v-model.number="overrideForm.plan_id" required class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none" :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }">
            <option v-for="p in plans" :key="p.id" :value="p.id">{{ p.name }} ({{ p.slug }})</option>
          </select>
        </label>
        <label class="flex flex-col gap-2">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">MOTIVO *</span>
          <input v-model="overrideForm.reason" type="text" required maxlength="255" placeholder="founder / amigo / influencer X" class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none" :style="{ borderColor: C.border, color: C.text }" />
        </label>
        <label class="flex flex-col gap-2">
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">EXPIRA EM (opcional)</span>
          <input v-model="overrideForm.expires_at" type="datetime-local" class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none tabular-nums" :style="{ borderColor: C.border, color: C.text }" />
          <span class="text-[11px]" :style="{ color: C.textMuted }">Vazio = sem expiração</span>
        </label>

        <footer class="flex justify-end gap-2 pt-2">
          <button type="button" class="font-mono-tab text-[10px] uppercase tracking-[0.15em] rounded-sm border px-4 py-2" :style="{ borderColor: C.border, color: C.text }" @click="closeOverride">CANCELAR</button>
          <button type="submit" :disabled="overrideSaving" class="font-mono-tab text-[10px] uppercase tracking-[0.15em] rounded-sm px-4 py-2 disabled:opacity-60" :style="{ backgroundColor: C.primary, color: C.background }">
            {{ overrideSaving ? 'SALVANDO…' : 'APLICAR' }}
          </button>
        </footer>
      </form>
    </dialog>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F } from '~/utils/redentiaCreativeColors'
import type { ISubscription } from '~/types/subscription'
import type { IPlan } from '~/types/plan'

definePageMeta({ middleware: ['admin-panel'] })

const route = useRoute()
const tenantId = computed(() => Number(route.params.id))
const tenantsService = useTenantsService()
const billing = useAdminBillingService()
const toast = useToast()

const tenant = ref<any>(null)
const items = ref<ISubscription[]>([])
const plans = ref<IPlan[]>([])
const loading = ref(true)
const statusFilter = ref('')
const cycleFilter = ref<'monthly' | 'yearly' | ''>('')

const overrideEl = ref<HTMLDialogElement | null>(null)
const overrideForm = ref<{
  user_id: number | null
  plan_id: number | null
  reason: string
  expires_at: string | null
} | null>(null)
const overrideSaving = ref(false)

async function loadAll() {
  loading.value = true
  try {
    const t = await tenantsService.show(tenantId.value)
    tenant.value = (t as any)?.data ?? t
    const p = await billing.listPlans(tenantId.value)
    plans.value = ((p as any)?.data?.plans ?? (p as any)?.plans ?? []) as IPlan[]
    await refresh()
  } finally {
    loading.value = false
  }
}

async function refresh() {
  try {
    const params: any = {}
    if (statusFilter.value) params.status = statusFilter.value
    if (cycleFilter.value) params.cycle = cycleFilter.value
    const r = await billing.listSubscriptions(tenantId.value, params)
    items.value = ((r as any)?.data?.data ?? (r as any)?.data ?? []) as ISubscription[]
  } catch {
    items.value = []
  }
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return iso }
}

function statusColor(s: string) {
  switch (s) {
    case 'active': return C.positive
    case 'trialing': return C.primary
    case 'past_due':
    case 'incomplete': return '#f59e0b'
    case 'canceled':
    default: return C.textMuted
  }
}

async function onOverrideOpen() {
  overrideForm.value = { user_id: null, plan_id: plans.value[0]?.id ?? null, reason: '', expires_at: null }
  await nextTick()
  overrideEl.value?.showModal()
}

async function onOverrideForUser(sub: ISubscription) {
  overrideForm.value = {
    user_id: sub.user_id,
    plan_id: sub.plan?.id ?? plans.value[0]?.id ?? null,
    reason: '',
    expires_at: null,
  }
  await nextTick()
  overrideEl.value?.showModal()
}

function closeOverride() {
  overrideEl.value?.close()
  overrideForm.value = null
}

async function onOverrideSave() {
  if (!overrideForm.value) return
  if (!overrideForm.value.user_id || !overrideForm.value.plan_id || !overrideForm.value.reason.trim()) {
    toast.add({ title: 'Preencha user_id, plano e motivo', color: 'error' })
    return
  }
  overrideSaving.value = true
  try {
    await billing.applyOverride(tenantId.value, overrideForm.value.user_id, {
      plan_id: overrideForm.value.plan_id,
      reason: overrideForm.value.reason.trim(),
      expires_at: overrideForm.value.expires_at || null,
    })
    toast.add({ title: 'Override aplicado', color: 'success' })
    closeOverride()
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Erro', description: err?.data?.message ?? 'Tente novamente.', color: 'error' })
  } finally {
    overrideSaving.value = false
  }
}

onMounted(loadAll)
</script>

<!--
  /admin/tenants/[id]/subscriptions — assinantes do tenant.

  Visual: usa o admin design system. Tabela com user (nome+email),
  plano, ciclo, status colorido, period_end. Filtros por status/cycle
  e modal pra aplicar override manual (gratis pra founder/amigo/etc).
-->
<template>
  <NuxtLayout name="admin-panel">
    <div class="admin-page">
      <!-- ============ HEADER ============ -->
      <header class="admin-page__head">
        <div class="admin-page__head-left">
          <span class="admin-page__eyebrow">
            <UIcon name="i-lucide-users" />
            Assinantes
          </span>
          <h1 class="admin-page__title">{{ tenant?.name || 'Carregando…' }}</h1>
          <div class="sub-page__nav">
            <NuxtLink :to="`/admin/tenants/${tenantId}`" class="sub-page__nav-link">
              <UIcon name="i-lucide-arrow-left" class="size-3" />
              Editor do tenant
            </NuxtLink>
            <span class="admin-stat__sep" />
            <NuxtLink :to="`/admin/tenants/${tenantId}/plans`" class="sub-page__nav-link">
              Planos
              <UIcon name="i-lucide-arrow-right" class="size-3" />
            </NuxtLink>
          </div>
        </div>
      </header>

      <!-- ============ TOOLBAR ============ -->
      <div class="admin-toolbar">
        <div class="admin-toolbar__group">
          <select v-model="statusFilter" class="admin-select" @change="refresh">
            <option value="">Todos os status</option>
            <option value="trialing">Trial</option>
            <option value="active">Ativa</option>
            <option value="past_due">Pagamento pendente</option>
            <option value="canceled">Cancelada</option>
            <option value="incomplete">Incompleta</option>
          </select>
          <select v-model="cycleFilter" class="admin-select" @change="refresh">
            <option value="">Mensal + Anual</option>
            <option value="monthly">Mensal</option>
            <option value="yearly">Anual</option>
          </select>
        </div>
        <div class="admin-toolbar__spacer" />
        <button
          type="button"
          class="admin-btn admin-btn--ghost admin-btn--sm"
          style="color: var(--brand-primary); border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);"
          @click="onOverrideOpen"
        >
          <UIcon name="i-lucide-shield-plus" class="size-3.5" />
          Aplicar override
        </button>
      </div>

      <!-- ============ TABLE ============ -->
      <div class="admin-table">
        <div class="admin-table__scroll">
          <table>
            <caption class="sr-only">Lista de assinantes do tenant</caption>
            <thead>
              <tr>
                <th scope="col">User</th>
                <th scope="col">Plano</th>
                <th scope="col">Ciclo</th>
                <th scope="col" class="admin-table__center">Status</th>
                <th scope="col">Período até</th>
                <th scope="col" class="admin-table__right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6">
                  <div class="admin-loading">
                    <span class="admin-loading__icon">
                      <UIcon name="i-lucide-loader-2" class="size-4 motion-safe:animate-spin" />
                    </span>
                    <span class="admin-loading__title">Carregando assinantes…</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="!items.length">
                <td colspan="6">
                  <div class="admin-empty">
                    <span class="admin-empty__icon">
                      <UIcon name="i-lucide-user-x" class="size-4" />
                    </span>
                    <span class="admin-empty__title">Nenhum assinante</span>
                    <span class="admin-empty__sub">Tente outros filtros ou aguarde os primeiros checkouts.</span>
                  </div>
                </td>
              </tr>
              <tr v-for="sub in items" v-else :key="sub.id">
                <td>
                  <div class="admin-table__primary">
                    <span class="admin-table__primary-name">{{ sub.user?.name || '—' }}</span>
                    <span class="admin-table__primary-sub">{{ sub.user?.email || '—' }}</span>
                  </div>
                </td>
                <td>
                  <span class="sub-plan-slug">{{ sub.plan?.slug || '—' }}</span>
                </td>
                <td class="admin-table__cell-muted">{{ sub.billing_cycle }}</td>
                <td class="admin-table__center">
                  <span class="admin-badge" :class="statusBadgeClass(sub.status)">
                    {{ sub.status }}
                  </span>
                </td>
                <td class="admin-table__cell-muted">
                  {{ formatDate(sub.current_period_end) }}
                </td>
                <td class="admin-table__right">
                  <button
                    type="button"
                    class="admin-btn admin-btn--ghost admin-btn--xs"
                    style="color: var(--brand-primary); border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);"
                    @click="onOverrideForUser(sub)"
                  >
                    <UIcon name="i-lucide-shield-plus" class="size-3" />
                    Override
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ============ OVERRIDE MODAL ============ -->
    <dialog ref="overrideEl" class="sub-modal">
      <form v-if="overrideForm" class="sub-modal__form" @submit.prevent="onOverrideSave">
        <header class="sub-modal__head">
          <div>
            <span class="admin-page__eyebrow">Aplicar override manual</span>
            <h2 class="sub-modal__title">Plano grátis pra um user</h2>
            <p class="sub-modal__sub">
              Override tem precedência sobre subscription real (founder, amigo, influencer, etc).
            </p>
          </div>
          <button
            type="button"
            class="admin-actions__icon-btn"
            aria-label="Fechar"
            @click="closeOverride"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </header>

        <div class="sub-modal__fields">
          <label class="sub-field">
            <span class="sub-field__label">User ID</span>
            <input
              v-model.number="overrideForm.user_id"
              type="number"
              required
              class="admin-input"
              style="font-variant-numeric: tabular-nums;"
            />
          </label>
          <label class="sub-field">
            <span class="sub-field__label">Plano</span>
            <select v-model.number="overrideForm.plan_id" required class="admin-select">
              <option v-for="p in plans" :key="p.id" :value="p.id">{{ p.name }} ({{ p.slug }})</option>
            </select>
          </label>
          <label class="sub-field">
            <span class="sub-field__label">Motivo <span class="sub-field__required">*</span></span>
            <input
              v-model="overrideForm.reason"
              type="text"
              required
              maxlength="255"
              placeholder="founder / amigo / influencer X"
              class="admin-input"
            />
          </label>
          <label class="sub-field">
            <span class="sub-field__label">
              Expira em
              <span class="sub-field__hint">vazio = sem expiração</span>
            </span>
            <input
              v-model="overrideForm.expires_at"
              type="datetime-local"
              class="admin-input"
              style="font-variant-numeric: tabular-nums;"
            />
          </label>
        </div>

        <footer class="sub-modal__actions">
          <button type="button" class="admin-btn admin-btn--ghost" @click="closeOverride">Cancelar</button>
          <button
            type="submit"
            :disabled="overrideSaving"
            class="admin-btn admin-btn--primary"
          >
            <UIcon v-if="overrideSaving" name="i-lucide-loader-2" class="size-3.5 motion-safe:animate-spin" />
            {{ overrideSaving ? 'Salvando…' : 'Aplicar' }}
          </button>
        </footer>
      </form>
    </dialog>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
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

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'active': return 'admin-badge--positive'
    case 'trialing': return 'admin-badge--accent'
    case 'past_due':
    case 'incomplete': return 'admin-badge--warning'
    case 'canceled':
    default: return ''
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

<style scoped>
.sub-page__nav {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
.sub-page__nav-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--brand-primary);
  text-decoration: none;
  transition: opacity 150ms;
}
.sub-page__nav-link:hover { opacity: 0.78; }

.sub-plan-slug {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--brand-primary);
}

/* ============ MODAL ============ */
.sub-modal {
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  border-radius: 14px;
  padding: 0;
  background: var(--brand-background);
  color: var(--brand-text);
  max-width: 520px;
  width: 92vw;
  box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.5);
}
.sub-modal::backdrop {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}
.sub-modal__form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 22px;
}
.sub-modal__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.sub-modal__title {
  margin: 4px 0 0;
  font-family: var(--brand-font);
  font-size: 20px;
  font-weight: 500;
  letter-spacing: -0.018em;
  color: var(--brand-text);
}
.sub-modal__sub {
  margin: 4px 0 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.sub-modal__fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sub-modal__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.sub-field { display: flex; flex-direction: column; gap: 6px; }
.sub-field__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.sub-field__required {
  color: var(--brand-primary);
  font-size: 11px;
  letter-spacing: 0;
}
.sub-field__hint {
  text-transform: none;
  letter-spacing: 0.04em;
  font-weight: 400;
  font-size: 10px;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}
</style>

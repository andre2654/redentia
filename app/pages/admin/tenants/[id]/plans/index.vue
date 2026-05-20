<!--
  /admin/tenants/[id]/plans — planos do tenant.

  Visual: usa o admin design system. Cards de plano com header (slug +
  status), grid de pricing (mensal / anual / trial / Stripe), features
  como chips, limits em <details> JSON. Modal de editor com form
  unificado pra create/edit.
-->
<template>
  <NuxtLayout name="admin-panel">
    <div class="admin-page">
      <!-- ============ HEADER ============ -->
      <header class="admin-page__head">
        <div class="admin-page__head-left">
          <span class="admin-page__eyebrow">
            <UIcon name="i-lucide-package" />
            Planos do tenant
          </span>
          <h1 class="admin-page__title">{{ tenant?.name || 'Carregando…' }}</h1>
          <div class="plan-page__nav">
            <NuxtLink :to="`/admin/tenants/${tenantId}`" class="plan-page__nav-link">
              <UIcon name="i-lucide-arrow-left" class="size-3" />
              Editor do tenant
            </NuxtLink>
            <span class="admin-stat__sep" />
            <NuxtLink :to="`/admin/tenants/${tenantId}/subscriptions`" class="plan-page__nav-link">
              Assinantes
              <UIcon name="i-lucide-arrow-right" class="size-3" />
            </NuxtLink>
          </div>
        </div>
        <div class="admin-page__actions">
          <span v-if="!billingEnabled" class="admin-stat admin-stat--negative">
            <UIcon name="i-lucide-alert-triangle" class="size-3" />
            Billing desativado
          </span>
          <button
            type="button"
            class="admin-btn admin-btn--primary"
            @click="onCreate"
          >
            <UIcon name="i-lucide-plus" class="size-4" />
            Novo plano
          </button>
        </div>
      </header>

      <!-- ============ LOADING / EMPTY ============ -->
      <div v-if="loading" class="admin-loading">
        <span class="admin-loading__icon">
          <UIcon name="i-lucide-loader-2" class="size-4 motion-safe:animate-spin" />
        </span>
        <span class="admin-loading__title">Carregando planos…</span>
      </div>

      <div v-else-if="!plans.length" class="admin-empty">
        <span class="admin-empty__icon">
          <UIcon name="i-lucide-package" class="size-4" />
        </span>
        <span class="admin-empty__title">Nenhum plano cadastrado</span>
        <span class="admin-empty__sub">Comece criando o primeiro plano pra esse tenant.</span>
        <button
          type="button"
          class="admin-btn admin-btn--ghost admin-btn--sm"
          style="margin-top: 6px; color: var(--brand-primary); border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);"
          @click="onCreate"
        >
          <UIcon name="i-lucide-plus" class="size-3.5" />
          Criar primeiro
        </button>
      </div>

      <!-- ============ PLAN CARDS ============ -->
      <div v-else class="admin-grid admin-grid--2">
        <article
          v-for="plan in plans"
          :key="plan.id"
          class="admin-card plan-card"
          :class="{ 'plan-card--inactive': !plan.is_active }"
        >
          <header class="plan-card__head">
            <div class="plan-card__title">
              <span
                class="plan-card__slug"
                :style="{ color: plan.is_active ? 'var(--brand-primary)' : 'color-mix(in srgb, var(--brand-text) 50%, transparent)' }"
              >{{ plan.slug }}</span>
              <h2 class="plan-card__name">{{ plan.name }}</h2>
              <p v-if="plan.description" class="plan-card__desc">
                {{ plan.description }}
              </p>
            </div>
            <span
              class="admin-badge"
              :class="plan.is_active ? 'admin-badge--positive' : 'admin-badge--negative'"
            >
              {{ plan.is_active ? 'Ativo' : 'Inativo' }}
            </span>
          </header>

          <dl class="plan-card__pricing">
            <div>
              <dt>Mensal</dt>
              <dd>{{ plan.price_brl_monthly ? `R$ ${formatBRL(plan.price_brl_monthly)}` : '—' }}</dd>
            </div>
            <div>
              <dt>Anual</dt>
              <dd>{{ plan.price_brl_yearly ? `R$ ${formatBRL(plan.price_brl_yearly)}` : '—' }}</dd>
            </div>
            <div>
              <dt>Trial</dt>
              <dd>{{ plan.trial_days != null ? `${plan.trial_days} dias` : '—' }}</dd>
            </div>
            <div>
              <dt>Stripe</dt>
              <dd :style="{ color: plan.stripe_price_id_monthly ? 'var(--brand-positive, #10b981)' : 'var(--brand-negative, #ef4444)' }">
                {{ plan.stripe_price_id_monthly ? 'OK' : 'sem price IDs' }}
              </dd>
            </div>
          </dl>

          <div v-if="(plan.features || []).length" class="plan-card__features">
            <span
              v-for="feat in (plan.features || [])"
              :key="feat"
              class="admin-badge"
            >{{ feat }}</span>
          </div>

          <details class="plan-card__limits">
            <summary>Limits</summary>
            <pre>{{ JSON.stringify(plan.limits, null, 2) }}</pre>
          </details>

          <footer class="plan-card__actions">
            <button
              type="button"
              class="admin-btn admin-btn--ghost admin-btn--xs"
              style="color: var(--brand-primary); border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);"
              @click="onEdit(plan)"
            >
              <UIcon name="i-lucide-pencil" class="size-3" />
              Editar
            </button>
            <button
              type="button"
              class="admin-btn admin-btn--ghost admin-btn--xs"
              :style="!plan.is_active ? 'color: var(--brand-positive, #10b981); border-color: color-mix(in srgb, var(--brand-positive, #10b981) 35%, transparent);' : ''"
              @click="onToggleActive(plan)"
            >
              <UIcon :name="plan.is_active ? 'i-lucide-pause' : 'i-lucide-play'" class="size-3" />
              {{ plan.is_active ? 'Desativar' : 'Ativar' }}
            </button>
            <button
              type="button"
              class="admin-btn admin-btn--danger admin-btn--xs"
              @click="onDelete(plan)"
            >
              <UIcon name="i-lucide-trash-2" class="size-3" />
              Deletar
            </button>
          </footer>
        </article>
      </div>
    </div>

    <!-- ============ EDITOR MODAL ============ -->
    <dialog
      ref="editorEl"
      class="plan-modal"
    >
      <form v-if="editing" class="plan-modal__form" @submit.prevent="onSave">
        <header class="plan-modal__head">
          <div class="plan-modal__head-text">
            <span class="admin-page__eyebrow">
              {{ editing.id ? 'Editar plano' : 'Novo plano' }}
            </span>
            <h2 class="plan-modal__title">{{ editing.name || editing.slug || 'Plano sem nome' }}</h2>
          </div>
          <button
            type="button"
            class="admin-actions__icon-btn"
            aria-label="Fechar"
            @click="closeEditor"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </header>

        <div class="plan-modal__grid">
          <label class="plan-field">
            <span class="plan-field__label">Slug <span class="plan-field__required">*</span></span>
            <input v-model="editing.slug" type="text" required pattern="[\-_a-z0-9]+" maxlength="60" class="admin-input" style="font-family: 'JetBrains Mono', monospace;" />
          </label>
          <label class="plan-field">
            <span class="plan-field__label">Nome <span class="plan-field__required">*</span></span>
            <input v-model="editing.name" type="text" required maxlength="80" class="admin-input" />
          </label>
          <label class="plan-field plan-modal__grid-full">
            <span class="plan-field__label">Descrição</span>
            <textarea v-model="editing.description" rows="2" class="admin-input" style="resize: vertical;" />
          </label>
          <label class="plan-field">
            <span class="plan-field__label">Preço mensal (R$)</span>
            <input v-model.number="editing.price_brl_monthly" type="number" step="0.01" min="0" class="admin-input" style="font-variant-numeric: tabular-nums;" />
          </label>
          <label class="plan-field">
            <span class="plan-field__label">Preço anual (R$)</span>
            <input v-model.number="editing.price_brl_yearly" type="number" step="0.01" min="0" class="admin-input" style="font-variant-numeric: tabular-nums;" />
          </label>
          <label class="plan-field">
            <span class="plan-field__label">Stripe price mensal</span>
            <input v-model="editing.stripe_price_id_monthly" type="text" placeholder="price_xxx" class="admin-input" style="font-family: 'JetBrains Mono', monospace; font-size: 12px;" />
          </label>
          <label class="plan-field">
            <span class="plan-field__label">Stripe price anual</span>
            <input v-model="editing.stripe_price_id_yearly" type="text" placeholder="price_xxx" class="admin-input" style="font-family: 'JetBrains Mono', monospace; font-size: 12px;" />
          </label>
          <label class="plan-field">
            <span class="plan-field__label">Trial dias</span>
            <input v-model.number="editing.trial_days" type="number" min="0" max="365" class="admin-input" style="font-variant-numeric: tabular-nums;" />
          </label>
          <label class="plan-field">
            <span class="plan-field__label">Sort order</span>
            <input v-model.number="editing.sort_order" type="number" class="admin-input" style="font-variant-numeric: tabular-nums;" />
          </label>
          <label class="plan-field plan-modal__grid-full">
            <span class="plan-field__label">
              Features
              <span class="plan-field__hint">slugs separadas por vírgula</span>
            </span>
            <input v-model="featuresInput" type="text" placeholder="compare_assets, weekly_report, …" class="admin-input" style="font-family: 'JetBrains Mono', monospace; font-size: 12px;" />
          </label>
          <label class="plan-field plan-modal__grid-full">
            <span class="plan-field__label">Limits (JSON)</span>
            <textarea v-model="limitsInput" rows="5" class="admin-input" style="font-family: 'JetBrains Mono', monospace; font-size: 12px; resize: vertical;" />
          </label>
          <label class="plan-field plan-field--inline plan-modal__grid-full">
            <input v-model="editing.is_active" type="checkbox" class="plan-field__checkbox" />
            <span>Plano ativo</span>
          </label>
        </div>

        <footer class="plan-modal__actions">
          <button
            type="button"
            class="admin-btn admin-btn--ghost"
            @click="closeEditor"
          >Cancelar</button>
          <button
            type="submit"
            :disabled="saving"
            class="admin-btn admin-btn--primary"
          >
            <UIcon v-if="saving" name="i-lucide-loader-2" class="size-3.5 motion-safe:animate-spin" />
            {{ saving ? 'Salvando…' : (editing.id ? 'Salvar' : 'Criar') }}
          </button>
        </footer>
      </form>
    </dialog>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import type { IPlan, IPlanPayload } from '~/types/plan'

definePageMeta({ middleware: ['admin-panel'] })

const route = useRoute()
const tenantId = computed(() => Number(route.params.id))
const tenantsService = useTenantsService()
const billing = useAdminBillingService()
const toast = useToast()

const tenant = ref<any>(null)
const plans = ref<IPlan[]>([])
const loading = ref(true)
const editing = ref<Partial<IPlan> | null>(null)
const editorEl = ref<HTMLDialogElement | null>(null)
const saving = ref(false)
const featuresInput = ref('')
const limitsInput = ref('{}')

const billingEnabled = computed(() => Boolean(tenant.value?.config?.billing?.enabled))

async function loadAll() {
  loading.value = true
  try {
    const t = await tenantsService.show(tenantId.value)
    tenant.value = (t as any)?.data ?? t
    const p = await billing.listPlans(tenantId.value)
    plans.value = ((p as any)?.data?.plans ?? (p as any)?.plans ?? []) as IPlan[]
  } catch {
    toast.add({ title: 'Erro carregando planos', color: 'error' })
  } finally {
    loading.value = false
  }
}

function formatBRL(n: number | string | null) {
  const num = typeof n === 'string' ? parseFloat(n) : (n ?? 0)
  return Number.isFinite(num) ? num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'
}

async function onCreate() {
  editing.value = {
    slug: '',
    name: '',
    description: '',
    price_brl_monthly: null,
    price_brl_yearly: null,
    trial_days: null,
    features: [],
    limits: {},
    is_active: true,
    sort_order: plans.value.length * 10,
  }
  featuresInput.value = ''
  limitsInput.value = '{\n  "basic_chat_daily": 30,\n  "max_chat_daily": 4,\n  "watchlist_total": 25\n}'
  await nextTick()
  editorEl.value?.showModal()
}

async function onEdit(plan: IPlan) {
  editing.value = { ...plan }
  featuresInput.value = (plan.features || []).join(', ')
  limitsInput.value = JSON.stringify(plan.limits ?? {}, null, 2)
  await nextTick()
  editorEl.value?.showModal()
}

function closeEditor() {
  editorEl.value?.close()
  editing.value = null
}

async function onSave() {
  if (!editing.value) return
  let parsedLimits: Record<string, number> = {}
  try {
    parsedLimits = JSON.parse(limitsInput.value || '{}')
  } catch {
    toast.add({ title: 'JSON de limits inválido', color: 'error' })
    return
  }
  const features = featuresInput.value.split(',').map((s) => s.trim()).filter(Boolean)

  saving.value = true
  try {
    const payload: IPlanPayload = {
      slug: editing.value.slug as string,
      name: editing.value.name as string,
      description: editing.value.description ?? null,
      price_brl_monthly: editing.value.price_brl_monthly as any,
      price_brl_yearly: editing.value.price_brl_yearly as any,
      stripe_price_id_monthly: editing.value.stripe_price_id_monthly ?? null,
      stripe_price_id_yearly: editing.value.stripe_price_id_yearly ?? null,
      trial_days: (editing.value.trial_days as any) || null,
      features,
      limits: parsedLimits,
      is_active: !!editing.value.is_active,
      sort_order: (editing.value.sort_order as any) || 0,
    }
    if (editing.value.id) {
      await billing.updatePlan(tenantId.value, editing.value.id, payload)
    } else {
      await billing.createPlan(tenantId.value, payload)
    }
    toast.add({ title: 'Plano salvo', color: 'success' })
    closeEditor()
    await loadAll()
  } catch (err: any) {
    toast.add({ title: 'Erro ao salvar', description: err?.data?.message ?? 'Tente novamente.', color: 'error' })
  } finally {
    saving.value = false
  }
}

async function onToggleActive(plan: IPlan) {
  try {
    await billing.updatePlan(tenantId.value, plan.id, { is_active: !plan.is_active })
    await loadAll()
  } catch (err: any) {
    toast.add({ title: 'Erro ao alternar', description: err?.data?.message ?? '', color: 'error' })
  }
}

async function onDelete(plan: IPlan) {
  if (!confirm(`Deletar plano "${plan.name}"? Se houver assinantes, vai falhar, desative em vez de deletar.`)) return
  try {
    await billing.deletePlan(tenantId.value, plan.id)
    await loadAll()
  } catch (err: any) {
    toast.add({ title: 'Erro ao deletar', description: err?.data?.message ?? 'Plano tem assinantes, use desativar.', color: 'error' })
  }
}

onMounted(loadAll)
</script>

<style scoped>
.plan-page__nav {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
.plan-page__nav-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--brand-primary);
  text-decoration: none;
  transition: opacity 150ms;
}
.plan-page__nav-link:hover { opacity: 0.78; }

/* ============ PLAN CARD ============ */
.plan-card {
  gap: 14px;
  transition: border-color 200ms, box-shadow 200ms;
}
.plan-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 30%, transparent);
}
.plan-card--inactive {
  opacity: 0.65;
}

.plan-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.plan-card__title { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.plan-card__slug {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.plan-card__name {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 19px;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: var(--brand-text);
}
.plan-card__desc {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

.plan-card__pricing {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 0;
  padding: 12px 0;
  border-top: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.plan-card__pricing > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.plan-card__pricing dt {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.plan-card__pricing dd {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 15px;
  font-weight: 500;
  color: var(--brand-text);
  font-variant-numeric: tabular-nums;
}

.plan-card__features {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.plan-card__limits {
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.plan-card__limits summary {
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  user-select: none;
}
.plan-card__limits summary:hover {
  color: var(--brand-primary);
}
.plan-card__limits pre {
  margin: 8px 0 0;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  line-height: 1.55;
  color: var(--brand-text);
  overflow-x: auto;
  font-variant-numeric: tabular-nums;
}

.plan-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 4px;
}

/* ============ MODAL ============ */
.plan-modal {
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  border-radius: 14px;
  padding: 0;
  background: var(--brand-background);
  color: var(--brand-text);
  max-width: 760px;
  width: 92vw;
  box-shadow: 0 30px 80px -20px var(--shadow-ambient);
}
.plan-modal::backdrop {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}
.plan-modal__form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 22px;
}
.plan-modal__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.plan-modal__head-text { display: flex; flex-direction: column; gap: 4px; }
.plan-modal__title {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.018em;
  color: var(--brand-text);
}

.plan-modal__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 600px) {
  .plan-modal__grid { grid-template-columns: repeat(2, 1fr); }
}
.plan-modal__grid-full { grid-column: 1 / -1; }
.plan-modal__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.plan-field { display: flex; flex-direction: column; gap: 6px; }
.plan-field__label {
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
.plan-field__required {
  color: var(--brand-primary);
  font-size: 11px;
  letter-spacing: 0;
}
.plan-field__hint {
  text-transform: none;
  letter-spacing: 0.04em;
  font-weight: 400;
  font-size: 10px;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}
.plan-field--inline {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--brand-text);
}
.plan-field__checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--brand-primary);
  cursor: pointer;
}
</style>

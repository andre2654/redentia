<template>
  <NuxtLayout name="admin-panel">
    <div class="mx-auto flex max-w-6xl flex-col gap-6">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
            Planos do tenant
          </span>
          <h1 class="mt-2 text-[28px] leading-tight md:text-[36px]" :style="{ color: C.text, fontFamily: F.display }">
            {{ tenant?.name || 'Carregando…' }}
          </h1>
          <div class="mt-2 flex gap-3 text-[12px]" :style="{ color: C.textMuted }">
            <NuxtLink :to="`/admin/tenants/${tenantId}`" class="hover:underline">← Editor do tenant</NuxtLink>
            <NuxtLink :to="`/admin/tenants/${tenantId}/subscriptions`" class="hover:underline">Assinantes →</NuxtLink>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span
            v-if="!billingEnabled"
            class="font-mono-tab text-[10px] uppercase tracking-[0.18em] rounded-sm border px-3 py-1.5"
            :style="{ borderColor: C.negative, color: C.negative }"
          >
            BILLING DESATIVADO NESSE TENANT
          </span>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-sm px-4 py-2.5 font-mono-tab text-[11px] font-bold uppercase tracking-[0.15em] transition hover:opacity-90"
            :style="{ backgroundColor: C.primary, color: C.background }"
            @click="onCreate"
          >
            <UIcon name="i-lucide-plus" class="size-4" />
            NOVO PLANO
          </button>
        </div>
      </header>

      <div v-if="loading" class="rounded-sm border p-8 text-center" :style="{ borderColor: C.border, color: C.textMuted }">
        <UIcon name="i-lucide-loader-2" class="size-5 motion-safe:animate-spin" />
      </div>

      <div v-else-if="!plans.length" class="rounded-sm border p-8 text-center text-[13px]" :style="{ borderColor: C.border, color: C.textMuted }">
        Nenhum plano cadastrado nesse tenant.
        <button
          type="button"
          class="mt-4 inline-flex items-center gap-2 rounded-sm border px-4 py-2 font-mono-tab text-[11px] uppercase"
          :style="{ borderColor: C.primary, color: C.primary }"
          @click="onCreate"
        >
          + CRIAR PRIMEIRO
        </button>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2">
        <article
          v-for="plan in plans"
          :key="plan.id"
          class="flex flex-col gap-4 rounded-sm border p-5"
          :style="{ borderColor: C.border, backgroundColor: C.surface }"
        >
          <header class="flex items-start justify-between gap-2">
            <div>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: plan.is_active ? C.primary : C.textMuted }">
                {{ plan.slug }}
              </span>
              <h2 class="mt-1 text-[20px]" :style="{ color: C.text, fontFamily: F.display }">{{ plan.name }}</h2>
              <p v-if="plan.description" class="mt-1 text-[12.5px] leading-snug" :style="{ color: C.textMuted }">
                {{ plan.description }}
              </p>
            </div>
            <span
              class="font-mono-tab text-[10px] uppercase rounded-sm border px-2 py-0.5"
              :style="{ borderColor: plan.is_active ? C.positive : C.negative, color: plan.is_active ? C.positive : C.negative }"
            >
              {{ plan.is_active ? 'ATIVO' : 'INATIVO' }}
            </span>
          </header>

          <dl class="grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <dt class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">Mensal</dt>
              <dd class="tabular-nums" :style="{ color: C.text }">
                {{ plan.price_brl_monthly ? `R$ ${formatBRL(plan.price_brl_monthly)}` : '—' }}
              </dd>
            </div>
            <div>
              <dt class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">Anual</dt>
              <dd class="tabular-nums" :style="{ color: C.text }">
                {{ plan.price_brl_yearly ? `R$ ${formatBRL(plan.price_brl_yearly)}` : '—' }}
              </dd>
            </div>
            <div>
              <dt class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">Trial dias</dt>
              <dd class="tabular-nums" :style="{ color: C.text }">{{ plan.trial_days ?? '—' }}</dd>
            </div>
            <div>
              <dt class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">Stripe</dt>
              <dd :style="{ color: plan.stripe_price_id_monthly ? C.positive : C.negative }">
                {{ plan.stripe_price_id_monthly ? 'OK' : 'sem price IDs' }}
              </dd>
            </div>
          </dl>

          <div class="flex flex-wrap gap-2">
            <span
              v-for="feat in (plan.features || [])"
              :key="feat"
              class="font-mono-tab text-[9.5px] uppercase tracking-[0.12em] rounded-sm border px-2 py-0.5"
              :style="{ borderColor: C.border, color: C.textMuted }"
            >{{ feat }}</span>
          </div>

          <details class="text-[12px]" :style="{ color: C.textMuted }">
            <summary class="cursor-pointer font-mono-tab text-[10px] uppercase tracking-[0.15em]">limits</summary>
            <pre class="mt-2 overflow-x-auto rounded-sm border p-2 tabular-nums" :style="{ borderColor: C.border, color: C.text }">{{ JSON.stringify(plan.limits, null, 2) }}</pre>
          </details>

          <footer class="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              class="font-mono-tab text-[10px] uppercase tracking-[0.15em] rounded-sm border px-3 py-1.5 hover:opacity-80"
              :style="{ borderColor: C.primary, color: C.primary }"
              @click="onEdit(plan)"
            >
              EDITAR
            </button>
            <button
              type="button"
              class="font-mono-tab text-[10px] uppercase tracking-[0.15em] rounded-sm border px-3 py-1.5 hover:opacity-80"
              :style="{ borderColor: C.border, color: C.text }"
              @click="onToggleActive(plan)"
            >
              {{ plan.is_active ? 'DESATIVAR' : 'ATIVAR' }}
            </button>
            <button
              type="button"
              class="font-mono-tab text-[10px] uppercase tracking-[0.15em] rounded-sm border px-3 py-1.5 hover:opacity-80"
              :style="{ borderColor: C.negative, color: C.negative }"
              @click="onDelete(plan)"
            >
              DELETAR
            </button>
          </footer>
        </article>
      </div>
    </div>

    <!-- Editor inline (modal-like) -->
    <dialog
      ref="editorEl"
      class="rounded-sm border p-0 backdrop:bg-black/70"
      :style="{ borderColor: C.border, backgroundColor: C.surface, color: C.text, maxWidth: '720px', width: '92vw' }"
    >
      <form v-if="editing" class="flex flex-col gap-4 p-6" @submit.prevent="onSave">
        <header class="flex items-start justify-between">
          <div>
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
              {{ editing.id ? 'Editar plano' : 'Novo plano' }}
            </span>
            <h2 class="mt-1 text-[22px]" :style="{ color: C.text, fontFamily: F.display }">
              {{ editing.name || editing.slug || 'Plano sem nome' }}
            </h2>
          </div>
          <button type="button" :style="{ color: C.textMuted }" @click="closeEditor">✕</button>
        </header>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="flex flex-col gap-2">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">SLUG *</span>
            <input v-model="editing.slug" type="text" required pattern="[-_a-z0-9]+" maxlength="60" class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none" :style="{ borderColor: C.border, color: C.text }" />
          </label>
          <label class="flex flex-col gap-2">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">NOME *</span>
            <input v-model="editing.name" type="text" required maxlength="80" class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none" :style="{ borderColor: C.border, color: C.text }" />
          </label>
          <label class="flex flex-col gap-2 md:col-span-2">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">DESCRIÇÃO</span>
            <textarea v-model="editing.description" rows="2" class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none" :style="{ borderColor: C.border, color: C.text }" />
          </label>
          <label class="flex flex-col gap-2">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">PREÇO MENSAL R$</span>
            <input v-model.number="editing.price_brl_monthly" type="number" step="0.01" min="0" class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none tabular-nums" :style="{ borderColor: C.border, color: C.text }" />
          </label>
          <label class="flex flex-col gap-2">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">PREÇO ANUAL R$</span>
            <input v-model.number="editing.price_brl_yearly" type="number" step="0.01" min="0" class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none tabular-nums" :style="{ borderColor: C.border, color: C.text }" />
          </label>
          <label class="flex flex-col gap-2">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">STRIPE PRICE MENSAL</span>
            <input v-model="editing.stripe_price_id_monthly" type="text" placeholder="price_xxx" class="rounded-sm border bg-transparent px-3 py-2 font-mono-tab text-[12px] outline-none" :style="{ borderColor: C.border, color: C.text }" />
          </label>
          <label class="flex flex-col gap-2">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">STRIPE PRICE ANUAL</span>
            <input v-model="editing.stripe_price_id_yearly" type="text" placeholder="price_xxx" class="rounded-sm border bg-transparent px-3 py-2 font-mono-tab text-[12px] outline-none" :style="{ borderColor: C.border, color: C.text }" />
          </label>
          <label class="flex flex-col gap-2">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">TRIAL DIAS</span>
            <input v-model.number="editing.trial_days" type="number" min="0" max="365" class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none tabular-nums" :style="{ borderColor: C.border, color: C.text }" />
          </label>
          <label class="flex flex-col gap-2">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">SORT ORDER</span>
            <input v-model.number="editing.sort_order" type="number" class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none tabular-nums" :style="{ borderColor: C.border, color: C.text }" />
          </label>
          <label class="flex flex-col gap-2 md:col-span-2">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">FEATURES (slugs separadas por vírgula)</span>
            <input v-model="featuresInput" type="text" placeholder="compare_assets, weekly_report, …" class="rounded-sm border bg-transparent px-3 py-2 font-mono-tab text-[12px] outline-none" :style="{ borderColor: C.border, color: C.text }" />
          </label>
          <label class="flex flex-col gap-2 md:col-span-2">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">LIMITS (JSON)</span>
            <textarea v-model="limitsInput" rows="4" class="rounded-sm border bg-transparent px-3 py-2 font-mono-tab text-[12px] outline-none" :style="{ borderColor: C.border, color: C.text }" />
          </label>
          <label class="flex items-center gap-2 md:col-span-2">
            <input v-model="editing.is_active" type="checkbox" class="size-4" />
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.text }">PLANO ATIVO</span>
          </label>
        </div>

        <footer class="flex justify-end gap-2 pt-2">
          <button type="button" class="font-mono-tab text-[10px] uppercase tracking-[0.15em] rounded-sm border px-4 py-2" :style="{ borderColor: C.border, color: C.text }" @click="closeEditor">CANCELAR</button>
          <button type="submit" :disabled="saving" class="font-mono-tab text-[10px] uppercase tracking-[0.15em] rounded-sm px-4 py-2 disabled:opacity-60" :style="{ backgroundColor: C.primary, color: C.background }">
            {{ saving ? 'SALVANDO…' : (editing.id ? 'SALVAR' : 'CRIAR') }}
          </button>
        </footer>
      </form>
    </dialog>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F } from '~/utils/redentiaCreativeColors'
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
  } catch (err) {
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
  if (!confirm(`Deletar plano "${plan.name}"? Se houver assinantes, vai falhar — desative em vez de deletar.`)) return
  try {
    await billing.deletePlan(tenantId.value, plan.id)
    await loadAll()
  } catch (err: any) {
    toast.add({ title: 'Erro ao deletar', description: err?.data?.message ?? 'Plano tem assinantes — use desativar.', color: 'error' })
  }
}

onMounted(loadAll)
</script>

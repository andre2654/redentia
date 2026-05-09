<template>
  <div class="admin-page admin-page--narrow tenant-editor">
    <!-- ============ HEADER ============ -->
    <header class="admin-page__head">
      <div class="admin-page__head-left">
        <span class="admin-page__eyebrow">
          <UIcon name="i-lucide-building-2" />
          {{ isNew ? 'Novo tenant' : 'Editar tenant' }}
        </span>
        <h1 class="admin-page__title">
          {{ form.name || form.slug || 'Tenant sem nome' }}
        </h1>
        <p class="admin-page__lead">
          Configure brand, domínio, billing e o JSON de config completo.
        </p>
      </div>
      <div class="admin-page__actions">
        <NuxtLink
          v-if="!isNew && props.initial?.id"
          :to="`/admin/tenants/${props.initial?.id}/plans`"
          class="admin-btn admin-btn--ghost admin-btn--sm"
        >
          <UIcon name="i-lucide-package" class="size-3.5" />
          Planos
        </NuxtLink>
        <NuxtLink
          v-if="!isNew && props.initial?.id"
          :to="`/admin/tenants/${props.initial?.id}/subscriptions`"
          class="admin-btn admin-btn--ghost admin-btn--sm"
        >
          <UIcon name="i-lucide-users" class="size-3.5" />
          Assinantes
        </NuxtLink>
        <NuxtLink
          to="/admin/tenants"
          class="admin-btn admin-btn--ghost admin-btn--sm"
        >
          <UIcon name="i-lucide-arrow-left" class="size-3.5" />
          Voltar
        </NuxtLink>
      </div>
    </header>

    <!-- ============ FORM ============ -->
    <form class="tenant-editor__form" @submit.prevent="handleSubmit">
      <!-- Basic info -->
      <section class="admin-section">
        <div class="admin-section__head">
          <div class="admin-section__head-left">
            <span class="admin-section__eyebrow">
              <UIcon name="i-lucide-info" />
              Identificação
            </span>
            <h2 class="admin-section__title">Slug, nome e domínio</h2>
          </div>
        </div>

        <div class="admin-card">
          <div class="tenant-grid">
            <label class="tenant-field">
              <span class="tenant-field__label">
                Slug
                <span class="tenant-field__required">*</span>
              </span>
              <input
                v-model="form.slug"
                type="text"
                required
                pattern="[\-a-z0-9]+"
                maxlength="60"
                :disabled="!isNew"
                class="admin-input"
                style="font-family: 'JetBrains Mono', monospace;"
              />
              <span v-if="!isNew" class="tenant-field__hint">
                Slug imutável após criação.
              </span>
            </label>
            <label class="tenant-field">
              <span class="tenant-field__label">
                Nome
                <span class="tenant-field__required">*</span>
              </span>
              <input
                v-model="form.name"
                type="text"
                required
                maxlength="120"
                class="admin-input"
              />
            </label>
            <label class="tenant-field tenant-grid--full">
              <span class="tenant-field__label">Domínio custom (opcional)</span>
              <input
                v-model="form.domain"
                type="text"
                placeholder="exemplo.com.br"
                class="admin-input"
                style="font-family: 'JetBrains Mono', monospace;"
              />
            </label>
            <label class="tenant-field tenant-field--inline tenant-grid--full">
              <input v-model="form.is_active" type="checkbox" class="tenant-field__checkbox" />
              <span>Tenant ativo</span>
            </label>
          </div>
        </div>
      </section>

      <!-- Billing -->
      <section class="admin-section">
        <div class="admin-section__head">
          <div class="admin-section__head-left">
            <span class="admin-section__eyebrow">
              <UIcon name="i-lucide-credit-card" />
              Billing
            </span>
            <h2 class="admin-section__title">Pricing page e paywall</h2>
          </div>
          <span
            class="admin-badge"
            :class="billingEnabled ? 'admin-badge--positive' : ''"
          >
            <span class="admin-stat__dot" :style="{ backgroundColor: billingEnabled ? 'var(--brand-positive, #10b981)' : 'currentColor' }" />
            {{ billingEnabled ? 'Habilitado' : 'Desligado' }}
          </span>
        </div>

        <div class="admin-card" :class="{ 'admin-card--accent': billingEnabled }">
          <label class="tenant-field tenant-field--inline">
            <input
              type="checkbox"
              class="tenant-field__checkbox"
              :checked="billingEnabled"
              @change="toggleBilling(($event.target as HTMLInputElement).checked)"
            />
            <span>Billing habilitado (pricing page ativa, paywall em /wallet e /help)</span>
          </label>
          <p
            v-if="!billingEnabled"
            class="tenant-billing__caption"
          >
            <UIcon name="i-lucide-info" class="size-3.5" />
            Off: tudo liberado pros users desse tenant (unlimited synthetic).
          </p>
          <p
            v-else
            class="tenant-billing__caption tenant-billing__caption--warn"
          >
            <UIcon name="i-lucide-alert-triangle" class="size-3.5" />
            Atenção: users sem subscription ativa são bouncados pra <code>/pricing</code>.
          </p>

          <div v-if="billingEnabled" class="tenant-grid tenant-billing__fields">
            <label class="tenant-field">
              <span class="tenant-field__label">Moeda</span>
              <input
                type="text"
                :value="billingCurrency"
                maxlength="3"
                placeholder="BRL"
                class="admin-input"
                style="font-family: 'JetBrains Mono', monospace; text-transform: uppercase;"
                @change="setBillingField('currency', ($event.target as HTMLInputElement).value.toUpperCase())"
              />
            </label>
            <label class="tenant-field">
              <span class="tenant-field__label">Dias de trial do Pro</span>
              <input
                type="number"
                :value="billingTrialDays"
                min="0"
                max="365"
                class="admin-input"
                style="font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums;"
                @change="setBillingField('trial_days_pro', Number(($event.target as HTMLInputElement).value) || 0)"
              />
            </label>
          </div>
        </div>
      </section>

      <!-- Config JSON -->
      <section class="admin-section">
        <div class="admin-section__head">
          <div class="admin-section__head-left">
            <span class="admin-section__eyebrow">
              <UIcon name="i-lucide-braces" />
              Config (JSON)
            </span>
            <h2 class="admin-section__title">Brand config completo</h2>
          </div>
          <span v-if="configError" class="admin-badge admin-badge--negative">
            <UIcon name="i-lucide-alert-circle" class="size-3" />
            {{ configError }}
          </span>
          <span v-else-if="configValidAt" class="admin-badge admin-badge--positive">
            <UIcon name="i-lucide-check" class="size-3" />
            JSON válido
          </span>
        </div>

        <div class="admin-card admin-card__padless">
          <textarea
            v-model="configText"
            rows="20"
            class="tenant-config__textarea"
            :class="{ 'tenant-config__textarea--error': configError }"
            spellcheck="false"
            @input="validateConfig"
          />
        </div>
        <p class="tenant-billing__caption">
          <UIcon name="i-lucide-info" class="size-3.5" />
          Campos obrigatórios: <code>colors.primary</code>, <code>colors.background</code>, <code>colors.text</code>, <code>font.family</code>. Demais são opcionais.
        </p>
      </section>

      <!-- Error -->
      <div v-if="error" class="admin-error">
        <UIcon name="i-lucide-alert-circle" class="size-4 shrink-0" />
        {{ error }}
      </div>

      <!-- Actions -->
      <div class="tenant-editor__actions">
        <button
          type="submit"
          :disabled="submitting || !!configError"
          class="admin-btn admin-btn--primary"
        >
          <UIcon v-if="submitting" name="i-lucide-loader-2" class="size-4 motion-safe:animate-spin" />
          <UIcon v-else :name="isNew ? 'i-lucide-plus' : 'i-lucide-save'" class="size-4" />
          {{ isNew ? 'Criar tenant' : 'Salvar alterações' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ initial: any; isNew: boolean }>()
const emit = defineEmits<{ (e: 'saved', tenant: any): void }>()

const tenantsService = useTenantsService()

const form = reactive({
  slug: props.initial.slug || '',
  name: props.initial.name || '',
  domain: props.initial.domain || '',
  is_active: props.initial.is_active ?? true,
})

const configText = ref(JSON.stringify(props.initial.config || {}, null, 2))
const configError = ref<string | null>(null)
const configValidAt = ref<number | null>(Date.now())
const submitting = ref(false)
const error = ref<string | null>(null)

const parsedConfig = computed(() => {
  try { return JSON.parse(configText.value) || {} } catch { return {} }
})
const billingEnabled = computed(() => Boolean(parsedConfig.value?.billing?.enabled))
const billingCurrency = computed(() => parsedConfig.value?.billing?.currency || 'BRL')
const billingTrialDays = computed(() => Number(parsedConfig.value?.billing?.trial_days_pro ?? 7))

function toggleBilling(enabled: boolean) {
  let parsed: any = {}
  try { parsed = JSON.parse(configText.value) } catch { parsed = {} }
  parsed.billing = parsed.billing || {}
  parsed.billing.enabled = enabled
  if (parsed.billing.currency === undefined) parsed.billing.currency = 'BRL'
  if (parsed.billing.trial_days_pro === undefined) parsed.billing.trial_days_pro = 7
  configText.value = JSON.stringify(parsed, null, 2)
  validateConfig()
}

function setBillingField(key: 'currency' | 'trial_days_pro', value: any) {
  let parsed: any = {}
  try { parsed = JSON.parse(configText.value) } catch { parsed = {} }
  parsed.billing = parsed.billing || {}
  parsed.billing[key] = value
  configText.value = JSON.stringify(parsed, null, 2)
  validateConfig()
}

function validateConfig() {
  try {
    JSON.parse(configText.value)
    configError.value = null
    configValidAt.value = Date.now()
  } catch (e: any) {
    configError.value = e.message?.replace(/^\w+ SyntaxError: /i, '') || 'JSON inválido'
    configValidAt.value = null
  }
}

async function handleSubmit() {
  validateConfig()
  if (configError.value) return
  submitting.value = true
  error.value = null

  try {
    const body: any = {
      slug: form.slug,
      name: form.name,
      domain: form.domain || null,
      is_active: form.is_active,
      config: JSON.parse(configText.value),
    }
    if (!props.isNew) delete body.slug

    const resp = props.isNew
      ? await tenantsService.create(body)
      : await tenantsService.update(props.initial.id, body)

    const saved = (resp as any)?.data || resp
    emit('saved', saved)
  } catch (e: any) {
    const messages = e?.data?.errors
      ? Object.values(e.data.errors).flat().join(' · ')
      : (e?.data?.message || e?.message || 'Erro ao salvar tenant.')
    error.value = messages
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.tenant-editor__form {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.tenant-editor__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.tenant-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
@media (min-width: 600px) {
  .tenant-grid { grid-template-columns: repeat(2, 1fr); }
}
.tenant-grid--full { grid-column: 1 / -1; }

.tenant-field { display: flex; flex-direction: column; gap: 6px; }
.tenant-field__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.tenant-field__required {
  color: var(--brand-primary);
  font-size: 11px;
  letter-spacing: 0;
}
.tenant-field__hint {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.tenant-field--inline {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--brand-text);
}
.tenant-field__checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--brand-primary);
  cursor: pointer;
}

.tenant-billing__caption {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.tenant-billing__caption--warn {
  color: var(--brand-warning);
}
.tenant-billing__caption code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  padding: 1px 5px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  color: var(--brand-text);
}
.tenant-billing__fields {
  margin-top: 12px;
}

.tenant-config__textarea {
  width: 100%;
  display: block;
  border: 0;
  background: color-mix(in srgb, var(--brand-text) 1.5%, transparent);
  color: var(--brand-text);
  padding: 14px 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.55;
  outline: none;
  resize: vertical;
  min-height: 360px;
  border-radius: 11px;
}
.tenant-config__textarea--error {
  border: 1px solid color-mix(in srgb, var(--brand-negative, #ef4444) 50%, transparent);
}
.tenant-config__textarea:focus {
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
}
</style>

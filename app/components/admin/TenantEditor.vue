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

      <!-- Assets (Phase 2) — only shown for existing tenants -->
      <!-- Upload precisa de tenant.id, entao nao aparece no /new (admin
           cria o tenant primeiro com slug + nome, depois faz upload). -->
      <section v-if="!isNew && props.initial?.id" class="admin-section">
        <div class="admin-section__head">
          <div class="admin-section__head-left">
            <span class="admin-section__eyebrow">
              <UIcon name="i-lucide-image" />
              Assets
            </span>
            <h2 class="admin-section__title">Logos, favicons e imagens</h2>
          </div>
        </div>

        <div class="admin-card">
          <div class="tenant-assets__group">
            <h3 class="tenant-assets__group-title">Logos por modo</h3>
            <p class="tenant-assets__group-hint">
              Versões diferentes pra fundos claros (logo escuro) e escuros (logo claro). Sem isso, o frontend cai em pill colorido como fallback.
            </p>
            <div class="tenant-assets__grid tenant-assets__grid--logos">
              <TenantAssetUploader
                :tenant-id="props.initial.id"
                asset-slot="fullLight"
                label="Logo full · light surface"
                hint="Ex: logo preto pra renderizar sobre fundo claro"
                surface-hint="light"
                :model-value="logoUrl('fullLight')"
                @uploaded="onAssetUploaded"
                @removed="onAssetRemoved"
              />
              <TenantAssetUploader
                :tenant-id="props.initial.id"
                asset-slot="fullDark"
                label="Logo full · dark surface"
                hint="Ex: logo branco pra renderizar sobre fundo escuro"
                surface-hint="dark"
                :model-value="logoUrl('fullDark')"
                @uploaded="onAssetUploaded"
                @removed="onAssetRemoved"
              />
              <TenantAssetUploader
                :tenant-id="props.initial.id"
                asset-slot="iconLight"
                label="Icon · light surface"
                surface-hint="light"
                :model-value="logoUrl('iconLight')"
                @uploaded="onAssetUploaded"
                @removed="onAssetRemoved"
              />
              <TenantAssetUploader
                :tenant-id="props.initial.id"
                asset-slot="iconDark"
                label="Icon · dark surface"
                surface-hint="dark"
                :model-value="logoUrl('iconDark')"
                @uploaded="onAssetUploaded"
                @removed="onAssetRemoved"
              />
            </div>
          </div>

          <div class="tenant-assets__group">
            <h3 class="tenant-assets__group-title">Favicon e PWA</h3>
            <p class="tenant-assets__group-hint">
              Aba do browser, home screen iOS, manifest PWA.
            </p>
            <div class="tenant-assets__grid">
              <TenantAssetUploader
                :tenant-id="props.initial.id"
                asset-slot="favicon"
                label="Favicon (PNG)"
                hint="Min 32×32, ideal 192×192"
                :model-value="logoUrl('favicon')"
                @uploaded="onAssetUploaded"
                @removed="onAssetRemoved"
              />
              <TenantAssetUploader
                :tenant-id="props.initial.id"
                asset-slot="faviconIco"
                label="Favicon (.ico)"
                hint="Browser legacy, multi-size"
                :model-value="logoUrl('faviconIco')"
                @uploaded="onAssetUploaded"
                @removed="onAssetRemoved"
              />
              <TenantAssetUploader
                :tenant-id="props.initial.id"
                asset-slot="appleTouchIcon"
                label="Apple touch icon"
                hint="180×180 PNG, iOS home screen"
                :model-value="logoUrl('appleTouchIcon')"
                @uploaded="onAssetUploaded"
                @removed="onAssetRemoved"
              />
              <TenantAssetUploader
                :tenant-id="props.initial.id"
                asset-slot="icon192"
                label="PWA 192"
                hint="192×192 PNG, manifest"
                :model-value="logoUrl('icon192')"
                @uploaded="onAssetUploaded"
                @removed="onAssetRemoved"
              />
              <TenantAssetUploader
                :tenant-id="props.initial.id"
                asset-slot="icon512"
                label="PWA 512"
                hint="512×512 PNG, splash screen"
                :model-value="logoUrl('icon512')"
                @uploaded="onAssetUploaded"
                @removed="onAssetRemoved"
              />
            </div>
          </div>

          <div class="tenant-assets__group">
            <h3 class="tenant-assets__group-title">Social + email</h3>
            <p class="tenant-assets__group-hint">
              Open Graph (compartilhamento em redes) e logo flat usado em emails transacionais.
            </p>
            <div class="tenant-assets__grid">
              <TenantAssetUploader
                :tenant-id="props.initial.id"
                asset-slot="og"
                label="Open Graph"
                hint="1200×630 PNG, preview em links"
                :model-value="logoUrl('og')"
                @uploaded="onAssetUploaded"
                @removed="onAssetRemoved"
              />
              <TenantAssetUploader
                :tenant-id="props.initial.id"
                asset-slot="email"
                label="Email logo"
                hint="PNG flat (256–512 px largura)"
                :model-value="logoUrl('email')"
                @uploaded="onAssetUploaded"
                @removed="onAssetRemoved"
              />
            </div>
          </div>
        </div>

        <p class="tenant-billing__caption">
          <UIcon name="i-lucide-info" class="size-3.5" />
          Upload sobrescreve a versão anterior do mesmo slot. Cap 2MB. SVG bloqueado (use o JSON cru pra path estático).
        </p>
      </section>

      <!-- Identity extras + SEO + suporte -->
      <section class="admin-section">
        <div class="admin-section__head">
          <div class="admin-section__head-left">
            <span class="admin-section__eyebrow">
              <UIcon name="i-lucide-id-card" />
              Identidade + SEO
            </span>
            <h2 class="admin-section__title">Tagline, meta tags, suporte</h2>
          </div>
        </div>
        <div class="admin-card">
          <SeoIdentityForm :config="parsedConfig" @change="setConfigPath" />
        </div>
      </section>

      <!-- Brand colors -->
      <section class="admin-section">
        <div class="admin-section__head">
          <div class="admin-section__head-left">
            <span class="admin-section__eyebrow">
              <UIcon name="i-lucide-palette" />
              Cores
            </span>
            <h2 class="admin-section__title">Paleta base + gradient</h2>
          </div>
        </div>
        <div class="admin-card">
          <ColorsForm :colors="parsedConfig.colors" @change="setConfigPath" />
        </div>
      </section>

      <!-- Theme + multi-mode -->
      <section class="admin-section">
        <div class="admin-section__head">
          <div class="admin-section__head-left">
            <span class="admin-section__eyebrow">
              <UIcon name="i-lucide-contrast" />
              Theme
            </span>
            <h2 class="admin-section__title">Modo dark/light, radius, animation</h2>
          </div>
        </div>
        <div class="admin-card">
          <ThemeForm
            :default-mode="parsedConfig.defaultMode"
            :theme="parsedConfig.theme"
            :themes="parsedConfig.themes"
            @change="setConfigPath"
          />
        </div>
      </section>

      <!-- Hero -->
      <section class="admin-section">
        <div class="admin-section__head">
          <div class="admin-section__head-left">
            <span class="admin-section__eyebrow">
              <UIcon name="i-lucide-megaphone" />
              Hero
            </span>
            <h2 class="admin-section__title">Headline + CTA da home</h2>
          </div>
        </div>
        <div class="admin-card">
          <HeroForm :hero="parsedConfig.hero" @change="setConfigPath" />
        </div>
      </section>

      <!-- Home sections -->
      <section class="admin-section">
        <div class="admin-section__head">
          <div class="admin-section__head-left">
            <span class="admin-section__eyebrow">
              <UIcon name="i-lucide-layout-list" />
              Secoes da home
            </span>
            <h2 class="admin-section__title">Ordem + visibilidade</h2>
          </div>
        </div>
        <div class="admin-card">
          <HomeSectionsForm :home-sections="parsedConfig.homeSections" @change="setConfigPath" />
        </div>
      </section>

      <!-- Features -->
      <section class="admin-section">
        <div class="admin-section__head">
          <div class="admin-section__head-left">
            <span class="admin-section__eyebrow">
              <UIcon name="i-lucide-toggle-right" />
              Features
            </span>
            <h2 class="admin-section__title">Liga/desliga produtos</h2>
          </div>
        </div>
        <div class="admin-card">
          <FeaturesForm :features="parsedConfig.features" @change="setConfigPath" />
        </div>
      </section>

      <!-- Config JSON cru — escape hatch -->
      <section class="admin-section">
        <details class="tenant-config__details" :open="!!configError">
          <summary class="tenant-config__summary">
            <UIcon name="i-lucide-braces" class="size-4" />
            <span class="admin-section__title" style="margin: 0;">Avancado: JSON cru</span>
            <span v-if="configError" class="admin-badge admin-badge--negative">
              <UIcon name="i-lucide-alert-circle" class="size-3" />
              {{ configError }}
            </span>
            <span v-else-if="configValidAt" class="admin-badge admin-badge--positive">
              <UIcon name="i-lucide-check" class="size-3" />
              valido
            </span>
          </summary>
          <p class="tenant-billing__caption" style="margin: 10px 0;">
            <UIcon name="i-lucide-info" class="size-3.5" />
            Editor cru pro JSONB completo. Use pra campos nao expostos pelos forms acima (footer, nav labels, voice, etc). Mudancas refletem nos forms estruturados.
          </p>
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
        </details>
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
import TenantAssetUploader from './TenantAssetUploader.vue'
import SeoIdentityForm from './tenant-editor/SeoIdentityForm.vue'
import ColorsForm from './tenant-editor/ColorsForm.vue'
import ThemeForm from './tenant-editor/ThemeForm.vue'
import HeroForm from './tenant-editor/HeroForm.vue'
import HomeSectionsForm from './tenant-editor/HomeSectionsForm.vue'
import FeaturesForm from './tenant-editor/FeaturesForm.vue'

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

/**
 * Path atual de um slot de logo. Le do JSON config, NAO do form.
 * Se o admin uploadou e nao salvou ainda, ja vamos ler dali.
 */
function logoUrl(slot: string): string | null {
  return parsedConfig.value?.logo?.[slot] ?? null
}

/**
 * Apos upload bem-sucedido, sincroniza `config.logo[slot]` no JSON do
 * form. Backend ja persistiu o tenant (ele faz o update direto), mas
 * precisamos refletir no editor pra que o admin veja o path novo
 * sem reload. Reusa `setConfigPath` (Phase 3 helper).
 */
function onAssetUploaded(payload: { slot: string; url: string }) {
  setConfigPath(`logo.${payload.slot}`, payload.url)
}

function onAssetRemoved(payload: { slot: string }) {
  setConfigPath(`logo.${payload.slot}`, null)
}

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

/**
 * Generic config writer pra structured forms (Phase 3). Recebe
 * dot-notation path tipo `colors.primary` ou `theme.borderRadius` e
 * grava em `parsedConfig` profundo, depois re-serializa pro
 * `configText`. JSON cru continua como fonte unica + escape hatch.
 *
 * Suporta:
 *   - 'colors.primary' -> parsedConfig.colors.primary
 *   - 'themes.light.background' -> parsedConfig.themes.light.background
 *   - Tambem auto-cria objetos intermediarios faltando.
 *
 * Pra remover uma chave, passa `value=null`. Pra arrays substituir
 * inteiros (ex: homeSections), passa o array novo direto.
 */
function setConfigPath(path: string, value: any) {
  let parsed: any = {}
  try { parsed = JSON.parse(configText.value) } catch { parsed = {} }
  const parts = path.split('.')
  let cur = parsed
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] === undefined || cur[parts[i]] === null || typeof cur[parts[i]] !== 'object') {
      cur[parts[i]] = {}
    }
    cur = cur[parts[i]]
  }
  const leaf = parts[parts.length - 1]
  if (value === null || value === undefined) {
    delete cur[leaf]
  } else {
    cur[leaf] = value
  }
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

/* Phase 3: collapsible JSON cru */
.tenant-config__details {
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  border-radius: 11px;
  background: color-mix(in srgb, var(--brand-text) 1%, transparent);
}
.tenant-config__details[open] {
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
}
.tenant-config__summary {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
  list-style: none;
}
.tenant-config__summary::-webkit-details-marker {
  display: none;
}
.tenant-config__summary::before {
  content: '';
  width: 8px;
  height: 8px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: rotate(-45deg);
  transition: transform 0.15s ease;
  margin-right: 2px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.tenant-config__details[open] .tenant-config__summary::before {
  transform: rotate(45deg);
}

/* Phase 2: assets section */
.tenant-assets__group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}
.tenant-assets__group:last-child {
  border-bottom: 0;
  padding-bottom: 0;
  margin-bottom: 0;
}
.tenant-assets__group-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
  color: var(--brand-text);
}
.tenant-assets__group-hint {
  font-size: 12px;
  margin: 0 0 8px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.tenant-assets__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-top: 4px;
}
.tenant-assets__grid--logos {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
</style>

<template>
  <div class="asset-uploader">
    <div class="asset-uploader__head">
      <span class="asset-uploader__label">{{ label }}</span>
      <span v-if="hint" class="asset-uploader__hint">{{ hint }}</span>
    </div>

    <div
      class="asset-uploader__slot"
      :class="{
        'asset-uploader__slot--dragging': dragging,
        'asset-uploader__slot--has-asset': !!previewUrl,
        'asset-uploader__slot--dark': surfaceHint === 'dark',
        'asset-uploader__slot--error': !!error,
      }"
      @drop.prevent="onDrop"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
    >
      <!-- Preview -->
      <img
        v-if="previewUrl"
        :src="previewUrl"
        :alt="`${slot} preview`"
        class="asset-uploader__preview"
      />
      <UIcon
        v-else
        name="i-lucide-image-plus"
        class="asset-uploader__placeholder"
      />

      <!-- Hidden input -->
      <input
        ref="fileInput"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/x-icon,.ico"
        class="asset-uploader__input"
        @change="onFileChange"
      />

      <!-- Loading overlay -->
      <div v-if="uploading" class="asset-uploader__loading">
        <UIcon name="i-lucide-loader-2" class="size-4 motion-safe:animate-spin" />
        <span>Enviando…</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="asset-uploader__actions">
      <button
        type="button"
        :disabled="uploading"
        class="admin-btn admin-btn--ghost admin-btn--sm"
        @click="fileInput?.click()"
      >
        <UIcon name="i-lucide-upload" class="size-3.5" />
        {{ previewUrl ? 'Trocar' : 'Enviar' }}
      </button>
      <button
        v-if="previewUrl && !uploading"
        type="button"
        class="admin-btn admin-btn--ghost admin-btn--sm asset-uploader__remove"
        @click="onRemove"
      >
        <UIcon name="i-lucide-trash-2" class="size-3.5" />
        Remover
      </button>
    </div>

    <p v-if="error" class="asset-uploader__error">
      <UIcon name="i-lucide-alert-circle" class="size-3" />
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
type AssetSlot =
  | 'fullLight' | 'fullDark' | 'iconLight' | 'iconDark'
  | 'favicon' | 'faviconIco' | 'appleTouchIcon'
  | 'icon192' | 'icon512'
  | 'og' | 'email'

const props = defineProps<{
  tenantId: number
  assetSlot: AssetSlot
  label: string
  hint?: string
  /** URL atual do asset (vinda do config.logo[slot]). */
  modelValue?: string | null
  /**
   * Hint visual pra colorir o slot. 'dark' renderiza o slot com fundo
   * escuro pra previews de logos light (white-on-dark). Sem isso o
   * logo branco fica invisivel sobre cream.
   */
  surfaceHint?: 'light' | 'dark'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', url: string | null): void
  (e: 'uploaded', payload: { slot: AssetSlot; url: string }): void
  (e: 'removed', payload: { slot: AssetSlot }): void
}>()

const tenantsService = useTenantsService()
const config = useRuntimeConfig()
const apiBase = (config.public?.apiBaseUrl as string || '').replace(/\/api\/?$/, '')

const fileInput = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const uploading = ref(false)
const error = ref<string | null>(null)

/**
 * URL de preview. Se for path absoluto (`/storage/...`), prepend o
 * dominio do API pra que o `<img>` carregue (admin pode estar em
 * outro origin). Se ja for absoluto, usa direto.
 */
const previewUrl = computed(() => {
  const v = props.modelValue
  if (!v) return null
  if (/^https?:/.test(v)) return v
  if (v.startsWith('/storage/')) return `${apiBase}${v}`
  // Path estatico do bundle frontend (e.g. '/brand/logo-icon.svg').
  // Renderiza relativo ao admin host — Vercel serve esses paths.
  return v
})

const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon']

function validateFile(file: File): string | null {
  if (!ALLOWED.includes(file.type) && !/\.(png|jpe?g|webp|ico)$/i.test(file.name)) {
    return 'Formato nao suportado. Use PNG, JPG, WebP ou ICO.'
  }
  if (/\.(svg|svgz)$/i.test(file.name) || file.type === 'image/svg+xml') {
    return 'SVG nao suportado (risco XSS). Converta pra PNG primeiro.'
  }
  if (file.size > MAX_SIZE) {
    return `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 2MB.`
  }
  return null
}

async function uploadFile(file: File) {
  error.value = null
  const validationError = validateFile(file)
  if (validationError) {
    error.value = validationError
    return
  }

  uploading.value = true
  try {
    const resp = await tenantsService.uploadAsset(props.tenantId, props.assetSlot, file)
    const url = resp?.data?.url
    if (!url) throw new Error('Resposta invalida do backend')
    emit('update:modelValue', url)
    emit('uploaded', { slot: props.assetSlot, url })
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Falha no upload'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function onFileChange(ev: Event) {
  const target = ev.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) uploadFile(file)
}

function onDrop(ev: DragEvent) {
  dragging.value = false
  const file = ev.dataTransfer?.files?.[0]
  if (file) uploadFile(file)
}

async function onRemove() {
  if (!confirm('Remover esse asset?')) return
  error.value = null
  uploading.value = true
  try {
    await tenantsService.deleteAsset(props.tenantId, props.assetSlot)
    emit('update:modelValue', null)
    emit('removed', { slot: props.assetSlot })
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Falha ao remover'
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.asset-uploader {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.asset-uploader__head {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.asset-uploader__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-heading, currentColor);
}

.asset-uploader__hint {
  font-size: 11px;
  color: var(--text-muted, rgba(0, 0, 0, 0.5));
}

.asset-uploader__slot {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 96px;
  padding: 12px;
  border: 1px dashed var(--border-default, rgba(0, 0, 0, 0.15));
  border-radius: 8px;
  background-color: var(--bg-elevated, rgba(0, 0, 0, 0.02));
  transition: all 0.15s ease;
  overflow: hidden;
}

.asset-uploader__slot--dark {
  background-color: #14161C;
  border-color: rgba(255, 255, 255, 0.12);
}

.asset-uploader__slot--dragging {
  border-color: var(--brand-primary, currentColor);
  border-style: solid;
  background-color: color-mix(in srgb, var(--brand-primary, currentColor) 8%, transparent);
}

.asset-uploader__slot--error {
  border-color: var(--brand-negative, #ef4444);
}

.asset-uploader__preview {
  max-width: 100%;
  max-height: 80px;
  width: auto;
  height: auto;
  object-fit: contain;
}

.asset-uploader__placeholder {
  width: 24px;
  height: 24px;
  color: var(--text-muted, rgba(0, 0, 0, 0.4));
}

.asset-uploader__slot--dark .asset-uploader__placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.asset-uploader__input {
  display: none;
}

.asset-uploader__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 12px;
}

.asset-uploader__actions {
  display: flex;
  gap: 6px;
}

.asset-uploader__remove {
  color: var(--brand-negative, #ef4444);
}

.asset-uploader__error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--brand-negative, #ef4444);
  margin: 0;
}
</style>

<!--
  ImageUploadField — input de imagem com upload real (multipart) ou
  URL externa. Substitui o UInput simples nos editors de comunicacao.

  Comportamento:
    1. Estado vazio: dropzone com botao "Escolher arquivo" + link
       "ou colar URL". Aceita drag-and-drop direto.
    2. Upload em progresso: progress overlay no dropzone.
    3. Estado preenchido: thumbnail + nome do arquivo + acoes (substituir,
       remover). Mantem campo URL escondido pra fallback (admin pode
       editar manualmente).
    4. URL mode: input pra colar URL externa, com toggle de volta pra
       upload se quiser.

  Cleanup:
    - Quando admin clica "remover" e a URL e nossa (storage interno),
      chama service.deleteImage() pra apagar do servidor antes de zerar
      o v-model.
    - Quando admin substitui (upload novo OU cola URL nova), o backend
      faz cleanup no save via lifecycle hooks (model `updating`).
-->
<template>
  <div class="image-upload">
    <!-- Estado preenchido: preview + acoes -->
    <div v-if="modelValue && !isUploading" class="image-upload__filled">
      <div class="image-upload__preview">
        <img
          :src="modelValue"
          :alt="alt"
          class="image-upload__img"
          @error="onImgError"
        />
        <div v-if="imgErrored" class="image-upload__error-overlay">
          <UIcon name="i-lucide-image-off" class="size-5" />
          <span>URL inacessível</span>
        </div>
      </div>
      <div class="image-upload__filled-meta">
        <div class="image-upload__filled-info">
          <span class="image-upload__filled-source" :data-kind="sourceKind">
            <UIcon :name="sourceKindIcon" class="size-3" />
            {{ sourceKindLabel }}
          </span>
          <code class="image-upload__filled-url">{{ shortUrl }}</code>
        </div>
        <div class="image-upload__filled-actions">
          <button
            type="button"
            class="image-upload__action"
            :disabled="isUploading"
            @click="triggerFilePicker"
          >
            <UIcon name="i-lucide-upload" class="size-3" />
            Substituir
          </button>
          <button
            type="button"
            class="image-upload__action image-upload__action--secondary"
            @click="toggleUrlMode"
          >
            <UIcon name="i-lucide-link" class="size-3" />
            Editar URL
          </button>
          <button
            type="button"
            class="image-upload__action image-upload__action--danger"
            :disabled="removing"
            @click="onRemove"
          >
            <UIcon
              :name="removing ? 'i-lucide-loader-2' : 'i-lucide-trash-2'"
              class="size-3"
              :class="{ 'motion-safe:animate-spin': removing }"
            />
            Remover
          </button>
        </div>
      </div>
      <!-- URL editor (toggle) -->
      <Transition name="image-upload-slide">
        <div v-if="urlMode" class="image-upload__url-editor">
          <UIcon name="i-lucide-link" class="size-4 image-upload__url-icon" />
          <UInput
            :model-value="modelValue"
            placeholder="https://..."
            size="md"
            class="image-upload__url-input"
            @update:model-value="onUrlInput"
          />
          <button type="button" class="image-upload__url-close" @click="urlMode = false">
            <UIcon name="i-lucide-x" class="size-3" />
          </button>
        </div>
      </Transition>
    </div>

    <!-- Estado vazio: dropzone + URL paste -->
    <div v-else-if="!modelValue && !isUploading" class="image-upload__empty">
      <!-- Modo URL paste -->
      <div v-if="urlMode" class="image-upload__url-mode">
        <UIcon name="i-lucide-link" class="size-4 image-upload__url-icon" />
        <UInput
          :model-value="''"
          placeholder="Cole a URL da imagem"
          size="md"
          class="image-upload__url-input"
          @update:model-value="onUrlInput"
        />
        <button type="button" class="image-upload__url-close" @click="urlMode = false">
          <UIcon name="i-lucide-arrow-left" class="size-3" />
          Upload
        </button>
      </div>

      <!-- Modo upload (default) -->
      <div
        v-else
        class="image-upload__dropzone"
        :class="{ 'image-upload__dropzone--drag': isDragging }"
        @dragenter.prevent.stop="onDragEnter"
        @dragover.prevent.stop="isDragging = true"
        @dragleave.prevent.stop="onDragLeave"
        @drop.prevent.stop="onDrop"
        @click="triggerFilePicker"
      >
        <UIcon name="i-lucide-image-up" class="size-7 image-upload__dropzone-icon" />
        <span class="image-upload__dropzone-title">
          Arraste uma imagem ou <span class="image-upload__dropzone-cta">clique pra escolher</span>
        </span>
        <span class="image-upload__dropzone-hint">
          PNG, JPG, WEBP, GIF · até 5MB
        </span>
        <button
          type="button"
          class="image-upload__url-link"
          @click.stop="urlMode = true"
        >
          ou colar URL externa
        </button>
      </div>
    </div>

    <!-- Estado de upload em progresso -->
    <div v-else class="image-upload__loading">
      <div class="image-upload__loading-spin">
        <UIcon name="i-lucide-loader-2" class="size-5 motion-safe:animate-spin" />
      </div>
      <span class="image-upload__loading-label">Enviando imagem…</span>
      <span v-if="uploadFileName" class="image-upload__loading-file">{{ uploadFileName }}</span>
    </div>

    <!-- Mensagem de erro (se upload falhou) -->
    <Transition name="image-upload-fade">
      <div v-if="errorMsg" class="image-upload__error-msg">
        <UIcon name="i-lucide-alert-circle" class="size-3.5" />
        {{ errorMsg }}
      </div>
    </Transition>

    <!-- Hidden input file (acionado pelo button + drag drop) -->
    <input
      ref="fileInputEl"
      type="file"
      accept="image/png,image/jpeg,image/webp,image/gif"
      class="image-upload__hidden-file"
      @change="onFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string | null
  alt?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [string | null]
}>()

const service = useAdminCommunicationsService()

const fileInputEl = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const isDragging = ref(false)
const removing = ref(false)
const uploadFileName = ref<string | null>(null)
const errorMsg = ref<string | null>(null)
const imgErrored = ref(false)
const urlMode = ref(false)

// Reset erro quando modelValue muda externamente
watch(() => props.modelValue, () => { imgErrored.value = false })

// =================================================================
// Source detection — distingue uploads internos (nossos) de URLs
// externas pra UI dar feedback diferente (badge "Servidor" vs "Externo")
// =================================================================
const sourceKind = computed<'internal' | 'external' | 'unknown'>(() => {
  const u = props.modelValue || ''
  if (!u) return 'unknown'
  // Internal: contem /storage/communications/ (nosso path)
  if (u.includes('/storage/communications/')) return 'internal'
  if (/^https?:\/\//i.test(u)) return 'external'
  return 'unknown'
})
const sourceKindLabel = computed(() => {
  if (sourceKind.value === 'internal') return 'Servidor'
  if (sourceKind.value === 'external') return 'URL externa'
  return 'Local'
})
const sourceKindIcon = computed(() => {
  if (sourceKind.value === 'internal') return 'i-lucide-hard-drive'
  if (sourceKind.value === 'external') return 'i-lucide-globe'
  return 'i-lucide-link'
})

const shortUrl = computed(() => {
  const u = props.modelValue || ''
  if (!u) return ''
  if (u.length <= 60) return u
  // Mostra dominio + ... + ultimas 30 chars
  try {
    const parsed = new URL(u, window.location.origin)
    const last = u.slice(-30)
    return `${parsed.host}/…${last}`
  } catch {
    return u.slice(0, 30) + '…' + u.slice(-25)
  }
})

// =================================================================
// File picker
// =================================================================
function triggerFilePicker(): void {
  errorMsg.value = null
  fileInputEl.value?.click()
}

function onFileChange(e: Event): void {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  void uploadFile(file)
  input.value = '' // reset pra permitir re-upload do mesmo arquivo
}

// =================================================================
// Drag and drop
// =================================================================
function onDragEnter(): void { isDragging.value = true }
function onDragLeave(e: DragEvent): void {
  // So sai do estado dragging quando sai da area completamente. Ignora
  // dragleave em filhos.
  if ((e.target as HTMLElement).contains(e.relatedTarget as Node)) return
  isDragging.value = false
}
function onDrop(e: DragEvent): void {
  isDragging.value = false
  errorMsg.value = null
  const file = e.dataTransfer?.files?.[0]
  if (file) void uploadFile(file)
}

// =================================================================
// Upload
// =================================================================
const MAX_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

async function uploadFile(file: File): Promise<void> {
  // Validacao client-side antes de gastar bytes na rede.
  if (!ALLOWED_MIMES.includes(file.type)) {
    errorMsg.value = 'Formato inválido. Use PNG, JPG, WEBP ou GIF.'
    return
  }
  if (file.size > MAX_BYTES) {
    errorMsg.value = `Arquivo grande demais (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo 5MB.`
    return
  }

  isUploading.value = true
  uploadFileName.value = file.name
  errorMsg.value = null

  try {
    // Antes de subir um arquivo novo, deleta a midia anterior se for
    // nossa (o backend tambem faz isso via hook updating quando salvar,
    // mas aqui evitamos orfaos no caso do admin abandonar a edicao
    // sem salvar). URLs externas o backend ignora.
    if (props.modelValue && sourceKind.value === 'internal') {
      try {
        await service.deleteImage(props.modelValue)
      } catch {
        /* falha no delete nao deve bloquear upload novo — log silencioso */
      }
    }

    const result = await service.uploadImage(file)
    emit('update:modelValue', result.url)
    urlMode.value = false
  } catch (e: any) {
    errorMsg.value = e?.data?.message || e?.message || 'Falha ao enviar imagem.'
  } finally {
    isUploading.value = false
    uploadFileName.value = null
  }
}

// =================================================================
// Remove (deleta do servidor se for nossa)
// =================================================================
async function onRemove(): Promise<void> {
  if (!props.modelValue) return
  removing.value = true
  errorMsg.value = null
  try {
    if (sourceKind.value === 'internal') {
      await service.deleteImage(props.modelValue)
    }
    emit('update:modelValue', null)
    urlMode.value = false
  } catch (e: any) {
    errorMsg.value = e?.data?.message || 'Falha ao remover imagem.'
  } finally {
    removing.value = false
  }
}

// =================================================================
// URL paste mode
// =================================================================
function toggleUrlMode(): void {
  urlMode.value = !urlMode.value
}
function onUrlInput(value: string): void {
  errorMsg.value = null
  emit('update:modelValue', value || null)
}

function onImgError(): void {
  imgErrored.value = true
}
</script>

<style scoped>
.image-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-upload__hidden-file {
  display: none;
}

/* =========================================================
   Dropzone (estado vazio)
   ========================================================= */
.image-upload__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 28px 20px;
  border-radius: 10px;
  border: 1.5px dashed color-mix(in srgb, var(--brand-text) 18%, transparent);
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
  cursor: pointer;
  transition: border-color 150ms, background 150ms;
  text-align: center;
}
.image-upload__dropzone:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 45%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 4%, transparent);
}
.image-upload__dropzone--drag {
  border-color: var(--brand-primary);
  border-style: solid;
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
}
.image-upload__dropzone-icon {
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  margin-bottom: 4px;
}
.image-upload__dropzone--drag .image-upload__dropzone-icon { color: var(--brand-primary); }
.image-upload__dropzone-title {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: color-mix(in srgb, var(--brand-text) 85%, transparent);
}
.image-upload__dropzone-cta {
  color: var(--brand-primary);
  font-weight: 600;
}
.image-upload__dropzone-hint {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  letter-spacing: 0.04em;
}
.image-upload__url-link {
  margin-top: 6px;
  background: transparent;
  border: 0;
  font-size: 11px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: color-mix(in srgb, var(--brand-text) 25%, transparent);
}
.image-upload__url-link:hover {
  color: var(--brand-primary);
  text-decoration-color: var(--brand-primary);
}

/* =========================================================
   URL paste mode (no estado vazio + no estado preenchido)
   ========================================================= */
.image-upload__url-mode,
.image-upload__url-editor {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 6px 0 12px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  transition: border-color 150ms, box-shadow 150ms;
}
.image-upload__url-editor { margin-top: 6px; }
.image-upload__url-mode:focus-within,
.image-upload__url-editor:focus-within {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}
.image-upload__url-icon {
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  flex-shrink: 0;
}
.image-upload__url-input { flex: 1; }
.image-upload__url-input :deep(input) {
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  padding-left: 0 !important;
}
.image-upload__url-close {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms, color 150ms;
  flex-shrink: 0;
}
.image-upload__url-close:hover {
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  color: var(--brand-text);
}

/* =========================================================
   Estado preenchido (preview + meta + actions)
   ========================================================= */
.image-upload__filled {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}
.image-upload__preview {
  position: relative;
  border-radius: 7px;
  overflow: hidden;
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-upload__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.image-upload__error-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: color-mix(in srgb, #ef4444 15%, transparent);
  color: #fca5a5;
  font-size: 11.5px;
  font-style: italic;
}

.image-upload__filled-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 4px;
  flex-wrap: wrap;
}
.image-upload__filled-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.image-upload__filled-source {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 7px;
  border-radius: 5px;
  border: 1px solid;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  flex-shrink: 0;
}
.image-upload__filled-source[data-kind='internal'] {
  color: #34d399;
  background: color-mix(in srgb, #10b981 12%, transparent);
  border-color: color-mix(in srgb, #10b981 35%, transparent);
}
.image-upload__filled-source[data-kind='external'] {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  border-color: rgba(56, 189, 248, 0.35);
}
.image-upload__filled-source[data-kind='unknown'] {
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
  border-color: color-mix(in srgb, var(--brand-text) 12%, transparent);
}
.image-upload__filled-url {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}
.image-upload__filled-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.image-upload__action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 9px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms, color 150ms, border-color 150ms;
}
.image-upload__action:hover {
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 30%, transparent);
  color: var(--brand-primary);
}
.image-upload__action--secondary:hover {
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  border-color: color-mix(in srgb, var(--brand-text) 20%, transparent);
  color: var(--brand-text);
}
.image-upload__action--danger:hover {
  background: color-mix(in srgb, #ef4444 12%, transparent);
  border-color: color-mix(in srgb, #ef4444 35%, transparent);
  color: #fca5a5;
}
.image-upload__action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* =========================================================
   Loading state
   ========================================================= */
.image-upload__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 20px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-primary) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent);
}
.image-upload__loading-spin { color: var(--brand-primary); }
.image-upload__loading-label {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--brand-text);
}
.image-upload__loading-file {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  max-width: 80%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* =========================================================
   Error message
   ========================================================= */
.image-upload__error-msg {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  background: color-mix(in srgb, #ef4444 12%, transparent);
  color: #fca5a5;
  font-size: 11.5px;
}

/* =========================================================
   Transitions
   ========================================================= */
.image-upload-fade-enter-active,
.image-upload-fade-leave-active {
  transition: opacity 200ms;
}
.image-upload-fade-enter-from,
.image-upload-fade-leave-to {
  opacity: 0;
}
.image-upload-slide-enter-active,
.image-upload-slide-leave-active {
  transition: opacity 200ms, max-height 220ms, transform 200ms;
  overflow: hidden;
}
.image-upload-slide-enter-from,
.image-upload-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
}
.image-upload-slide-enter-to,
.image-upload-slide-leave-from {
  opacity: 1;
  max-height: 80px;
}
</style>

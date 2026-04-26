<!--
  Composer pill — premium tier-aware design.

  Two visual modes:

  - **Basic**: clean, neutral, fast-feeling. Subtle border, single-tone
    surface. Reads as "default tool".

  - **MAX**: PREMIUM. The whole pill transforms — animated gradient
    border that slowly rotates, soft inner glow tinted to brand
    primary, "MAX" watermark inside, sparkle send button, slightly
    elevated shadow. Feels expensive without being cartoonish.

  The toggle is the only knob — old focus_mode chips and the
  "Profunda" toggle are gone. Backend auto-detects intent.
-->
<template>
  <div class="chat-composer-wrap pointer-events-none absolute inset-x-0 bottom-0 z-10 px-5 pt-10 md:px-8" :style="{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }">
    <!-- Background fade so messages don't overlap composer harshly -->
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-32"
      :style="{
        background: `linear-gradient(to top, ${brand.colors.background} 30%, transparent)`,
      }"
      aria-hidden="true"
    />

    <!-- Gradient halo behind the pill (only visible on MAX) -->
    <Transition name="chat-max-halo">
      <div
        v-if="isMax"
        class="chat-max-halo pointer-events-none absolute inset-x-0 bottom-3 mx-auto max-w-3xl"
        :style="{
          height: '120px',
          background: `radial-gradient(ellipse 70% 100% at 50% 100%, ${brand.colors.primary}26 0%, transparent 70%)`,
          filter: 'blur(24px)',
        }"
        aria-hidden="true"
      />
    </Transition>

    <div
      class="chat-composer pointer-events-auto relative mx-auto flex max-w-3xl flex-col gap-2 px-5 pb-3 pt-4 transition-all duration-300"
      :class="['chat-composer', isMax ? 'is-max' : 'is-basic', dragOver ? 'is-drag-over' : '']"
      :style="composerStyle"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <!-- Drag-drop overlay -->
      <Transition name="chat-drop-overlay">
        <div
          v-if="dragOver"
          class="chat-drop-overlay pointer-events-none absolute inset-0 flex items-center justify-center rounded-[28px] text-[14px] font-semibold"
          :style="{
            backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
            border: `2px dashed ${brand.colors.primary}`,
            color: brand.colors.primary,
            zIndex: 5,
          }"
          aria-hidden="true"
        >
          <UIcon name="i-lucide-upload-cloud" class="mr-2 size-5" />
          Solte para anexar
        </div>
      </Transition>
      <!-- Animated gradient ring (rendered via ::before on .is-max) -->

      <!-- MAX watermark badge — top-right inside the pill -->
      <Transition name="chat-max-badge">
        <span
          v-if="isMax"
          class="chat-max-badge pointer-events-none absolute right-4 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.18em]"
          :style="{
            background: `linear-gradient(135deg, ${brand.colors.primary} 0%, color-mix(in srgb, ${brand.colors.primary} 60%, ${brand.colors.text}) 100%)`,
            color: brand.colors.background,
            boxShadow: `0 4px 12px -4px ${brand.colors.primary}66`,
          }"
        >
          <UIcon name="i-lucide-sparkles" class="size-2.5" />
          MAX
        </span>
      </Transition>

      <!-- Attachment chips (above the textarea) -->
      <ul
        v-if="attachments.length > 0"
        class="flex flex-wrap gap-1.5 pb-1"
        :aria-label="`${attachments.length} arquivo(s) anexado(s)`"
      >
        <li
          v-for="att in attachments"
          :key="att.id"
          class="chat-attach-chip group inline-flex max-w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-[12px]"
          :style="{
            backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 70%, transparent)`,
            border: `1px solid color-mix(in srgb, ${brand.colors.border} 45%, transparent)`,
            color: brand.colors.text,
          }"
        >
          <UIcon
            :name="attachIcon(att)"
            class="size-3.5 shrink-0"
            :style="{ color: brand.colors.primary }"
          />
          <span class="max-w-[180px] truncate">{{ att.name }}</span>
          <span
            class="shrink-0 font-mono-tab text-[10px] uppercase tracking-[0.12em]"
            :style="{ color: brand.colors.textMuted }"
          >
            {{ humanSize(att.size) }}
          </span>
          <button
            type="button"
            class="ml-1 inline-flex size-4 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/10"
            :aria-label="`Remover ${att.name}`"
            @click="removeAttachment(att.id)"
          >
            <UIcon name="i-lucide-x" class="size-3" />
          </button>
        </li>
      </ul>

      <!-- Per-attachment error (file too big / unsupported / parse failure) -->
      <div
        v-if="attachError"
        role="alert"
        class="rounded-lg px-3 py-1.5 text-[11.5px]"
        :style="{
          backgroundColor: `color-mix(in srgb, ${brand.colors.negative} 8%, transparent)`,
          border: `1px solid color-mix(in srgb, ${brand.colors.negative} 30%, transparent)`,
          color: brand.colors.negative,
        }"
      >
        {{ attachError }}
      </div>

      <!-- Textarea row -->
      <div class="flex items-start gap-3">
        <textarea
          ref="textareaRef"
          v-model="value"
          rows="1"
          :placeholder="placeholder"
          class="chat-textarea min-h-[28px] max-h-[200px] flex-1 resize-none border-0 bg-transparent text-[16px] leading-relaxed outline-none"
          :class="isMax ? 'pr-16' : ''"
          :style="{ color: brand.colors.text }"
          :disabled="disabled"
          @input="autosize"
          @focus="focused = true"
          @blur="focused = false"
          @keydown.enter.exact.prevent="onEnter"
          @paste="onPaste"
        />
      </div>

      <!-- Bottom row: attach + tier picker + spacer + send/stop -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Hidden file input — paperclip button triggers it -->
        <input
          ref="fileInputRef"
          type="file"
          multiple
          :accept="acceptString"
          class="hidden"
          @change="onFilePickerChange"
        />
        <button
          type="button"
          :disabled="disabled || attachments.length >= MAX_ATTACHMENTS"
          class="chat-attach-btn mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          :style="{
            backgroundColor: `color-mix(in srgb, ${brand.colors.text} 5%, transparent)`,
            color: brand.colors.textMuted,
          }"
          :title="
            attachments.length >= MAX_ATTACHMENTS
              ? `Máximo ${MAX_ATTACHMENTS} arquivos por mensagem`
              : 'Anexar arquivo (PDF, XLSX, TXT, MD, imagens)'
          "
          aria-label="Anexar arquivo"
          @click="fileInputRef?.click()"
        >
          <UIcon name="i-lucide-paperclip" class="size-4" />
        </button>

        <div
          class="chat-tier-group inline-flex items-center gap-0.5 rounded-full p-0.5"
          :style="{
            backgroundColor: isMax
              ? `color-mix(in srgb, ${brand.colors.primary} 8%, transparent)`
              : `color-mix(in srgb, ${brand.colors.text} 5%, transparent)`,
            border: isMax
              ? `1px solid color-mix(in srgb, ${brand.colors.primary} 22%, transparent)`
              : '1px solid transparent',
          }"
          role="radiogroup"
          aria-label="Modelo Redentia"
        >
          <button
            v-for="opt in tierOptions"
            :key="opt.value"
            type="button"
            role="radio"
            :aria-checked="tier === opt.value"
            :disabled="props.tierLocked && tier !== opt.value"
            class="chat-tier-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40"
            :style="tierBtnStyle(opt.value)"
            :title="props.tierLocked && tier !== opt.value
              ? 'Tier travado nesta conversa — abra uma Nova conversa para mudar'
              : opt.tagline"
            @click="onTierClick(opt.value)"
          >
            <UIcon
              v-if="opt.icon"
              :name="opt.icon"
              class="size-3"
              :style="
                tier === opt.value && opt.value === 'max'
                  ? { color: brand.colors.primary }
                  : tier === opt.value
                    ? { color: brand.colors.text }
                    : { color: 'inherit' }
              "
            />
            {{ opt.label }}
          </button>
        </div>

        <div class="flex-1" />

        <!-- Send / Stop -->
        <button
          v-if="!isStreaming"
          type="button"
          :disabled="disabled || !canSend"
          class="chat-send mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-full transition-all"
          :class="isMax ? 'chat-send-max' : ''"
          :style="sendButtonStyle"
          aria-label="Enviar"
          @click="submit"
        >
          <UIcon
            :name="isMax && canSend ? 'i-lucide-sparkles' : 'i-lucide-arrow-up'"
            class="size-4"
          />
        </button>
        <button
          v-else
          type="button"
          class="chat-stop mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors"
          :style="{
            backgroundColor: brand.colors.text,
            color: brand.colors.background,
          }"
          aria-label="Parar"
          @click="$emit('stop')"
        >
          <span
            class="inline-block size-3 rounded-[3px]"
            :style="{ backgroundColor: brand.colors.background }"
          />
        </button>
      </div>
    </div>

    <!-- Disclaimer / sub-line -->
    <p
      class="mx-auto mt-2 max-w-3xl text-center font-mono-tab text-[10px] uppercase tracking-[0.16em] transition-colors"
      :style="{
        color: isMax
          ? `color-mix(in srgb, ${brand.colors.primary} 70%, ${brand.colors.textMuted})`
          : `color-mix(in srgb, ${brand.colors.textMuted} 65%, transparent)`,
      }"
    >
      <template v-if="isMax">
        Redentia MAX · análise rigorosa · cada número validado
      </template>
      <template v-else>
        Não é recomendação de investimento · A IA pode errar — confira informações sensíveis
      </template>
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { ChatAttachment, ChatAttachmentKind } from '~/composables/useChatStream'

export type ChatTier = 'basic' | 'max'

const props = defineProps<{
  disabled?: boolean
  isStreaming?: boolean
  /**
   * Once a session has started, the tier is sticky — switching mid-
   * conversation is misleading because the backend ignores it. The
   * picker becomes informational (selected one stays highlighted,
   * the other is dimmed and click-disabled).
   */
  tierLocked?: boolean
}>()

const tier = defineModel<ChatTier>('tier', { default: 'basic' })

const emit = defineEmits<{
  send: [message: string, attachments: ChatAttachment[]]
  stop: []
}>()

const brand = useBrand()
const value = ref('')
const focused = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const isMax = computed(() => tier.value === 'max')

const tierOptions: Array<{
  value: ChatTier
  label: string
  tagline: string
  icon?: string
}> = [
  {
    value: 'basic',
    label: 'Basic',
    tagline: 'Respostas rápidas e diretas',
    icon: 'i-lucide-zap',
  },
  {
    value: 'max',
    label: 'MAX',
    tagline: 'Análise rigorosa, multi-passo, com verificação cruzada',
    icon: 'i-lucide-sparkles',
  },
]

const placeholder = computed(() =>
  isMax.value
    ? 'Pergunte algo complexo. Eu valido cada número antes de responder…'
    : 'Pergunte sobre qualquer ativo, faça simulações…',
)

// =============================================================
// Attachments
// =============================================================
const fileInputRef = ref<HTMLInputElement | null>(null)
const attachments = ref<ChatAttachment[]>([])
const attachError = ref<string | null>(null)
const dragOver = ref(false)
let dragDepth = 0

const MAX_ATTACHMENTS = 5
const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB per file
const MAX_TOTAL_BYTES = 20 * 1024 * 1024 // 20 MB total
const MAX_TEXT_CHARS = 200_000 // Truncate big text files client-side

// MIME → kind classification. Anything not in this map is rejected.
const MIME_TO_KIND: Record<string, ChatAttachmentKind> = {
  'text/plain': 'text',
  'text/markdown': 'text',
  'text/csv': 'text',
  'text/x-markdown': 'text',
  'application/json': 'text',
  'application/pdf': 'binary',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'binary',
  'application/vnd.ms-excel': 'binary',
  'application/vnd.apple.numbers': 'binary',
  'application/x-iwork-numbers-sffnumbers': 'binary',
  'application/zip': 'binary', // .numbers shows up as zip on some browsers
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'image/heic': 'image',
}

// Used by the <input type="file" accept="..."> attribute.
const acceptString =
  '.txt,.md,.markdown,.csv,.json,.pdf,.xlsx,.xls,.numbers,image/png,image/jpeg,image/webp,image/gif,image/heic'

function classifyByName(name: string, fallbackMime: string): { mime: string; kind: ChatAttachmentKind } | null {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  // Prefer the extension over the browser-supplied MIME because Safari
  // tags .numbers files as application/octet-stream.
  if (ext === 'pdf') return { mime: 'application/pdf', kind: 'binary' }
  if (ext === 'xlsx' || ext === 'xls')
    return { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', kind: 'binary' }
  if (ext === 'numbers') return { mime: 'application/vnd.apple.numbers', kind: 'binary' }
  if (ext === 'txt') return { mime: 'text/plain', kind: 'text' }
  if (ext === 'md' || ext === 'markdown') return { mime: 'text/markdown', kind: 'text' }
  if (ext === 'csv') return { mime: 'text/csv', kind: 'text' }
  if (ext === 'json') return { mime: 'application/json', kind: 'text' }
  if (ext === 'png') return { mime: 'image/png', kind: 'image' }
  if (ext === 'jpg' || ext === 'jpeg') return { mime: 'image/jpeg', kind: 'image' }
  if (ext === 'webp') return { mime: 'image/webp', kind: 'image' }
  if (ext === 'gif') return { mime: 'image/gif', kind: 'image' }
  if (ext === 'heic') return { mime: 'image/heic', kind: 'image' }
  // Fall back to MIME map for files without a sensible extension.
  const k = MIME_TO_KIND[fallbackMime]
  return k ? { mime: fallbackMime, kind: k } : null
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

function attachIcon(att: ChatAttachment): string {
  if (att.kind === 'image') return 'i-lucide-image'
  if (att.mime === 'application/pdf') return 'i-lucide-file-text'
  if (att.mime.includes('spreadsheet') || att.mime.includes('excel') || att.mime.includes('numbers'))
    return 'i-lucide-table'
  if (att.mime === 'text/markdown') return 'i-lucide-file-code'
  if (att.mime === 'application/json') return 'i-lucide-braces'
  return 'i-lucide-file'
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(typeof r.result === 'string' ? r.result : '')
    r.onerror = () => reject(r.error ?? new Error('read failed'))
    r.readAsText(file)
  })
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => {
      const result = r.result as string
      // FileReader returns "data:<mime>;base64,<...>"; we want only the
      // base64 payload — the backend already knows the MIME from the
      // attachment record.
      const idx = result.indexOf(',')
      resolve(idx >= 0 ? result.slice(idx + 1) : result)
    }
    r.onerror = () => reject(r.error ?? new Error('read failed'))
    r.readAsDataURL(file)
  })
}

async function ingestFile(file: File) {
  attachError.value = null
  if (attachments.value.length >= MAX_ATTACHMENTS) {
    attachError.value = `Máximo de ${MAX_ATTACHMENTS} arquivos por mensagem.`
    return
  }
  if (file.size > MAX_FILE_BYTES) {
    attachError.value = `${file.name} passa de 10MB. Reduza o arquivo.`
    return
  }
  const totalAfter = attachments.value.reduce((s, a) => s + a.size, 0) + file.size
  if (totalAfter > MAX_TOTAL_BYTES) {
    attachError.value = 'Total de anexos passa de 20MB. Remova algum.'
    return
  }
  const cls = classifyByName(file.name, file.type || '')
  if (!cls) {
    attachError.value = `Formato de "${file.name}" não suportado. Use PDF, XLSX, TXT, MD, CSV, JSON ou imagem.`
    return
  }
  try {
    const content =
      cls.kind === 'text' ? (await readAsText(file)).slice(0, MAX_TEXT_CHARS) : await readAsBase64(file)
    attachments.value.push({
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      mime: cls.mime,
      size: file.size,
      kind: cls.kind,
      content,
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Input] file read failed', err)
    attachError.value = `Não consegui ler "${file.name}".`
  }
}

async function ingestFiles(files: FileList | File[]) {
  // Sequential — keeps the per-file cap easy to reason about and lets us
  // stop early when the total cap is hit.
  for (const f of Array.from(files)) {
    if (attachments.value.length >= MAX_ATTACHMENTS) break
    await ingestFile(f)
  }
}

function removeAttachment(id: string) {
  attachments.value = attachments.value.filter((a) => a.id !== id)
  attachError.value = null
}

async function onFilePickerChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) await ingestFiles(input.files)
  input.value = '' // allow re-selecting the same file
}

function onDragEnter(e: DragEvent) {
  if (!e.dataTransfer || !Array.from(e.dataTransfer.types ?? []).includes('Files')) return
  dragDepth++
  dragOver.value = true
}
function onDragOver(e: DragEvent) {
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
}
function onDragLeave() {
  dragDepth--
  if (dragDepth <= 0) {
    dragDepth = 0
    dragOver.value = false
  }
}
async function onDrop(e: DragEvent) {
  dragDepth = 0
  dragOver.value = false
  if (e.dataTransfer?.files) await ingestFiles(e.dataTransfer.files)
}

async function onPaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items
  if (!items) return
  const files: File[] = []
  for (const item of Array.from(items)) {
    if (item.kind === 'file') {
      const f = item.getAsFile()
      if (f) files.push(f)
    }
  }
  if (files.length > 0) {
    e.preventDefault()
    await ingestFiles(files)
  }
}

const canSend = computed(
  () => (value.value.trim().length > 0 || attachments.value.length > 0) && !props.disabled,
)

const composerStyle = computed(() => {
  if (isMax.value) {
    return {
      // Solid surface — gradient border lives in ::before via CSS
      backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 96%, transparent)`,
      borderRadius: '28px',
      // Halo + lifted shadow tinted with brand primary
      boxShadow: focused.value
        ? `0 18px 60px -12px color-mix(in srgb, ${brand.colors.primary} 42%, transparent), 0 0 0 4px color-mix(in srgb, ${brand.colors.primary} 18%, transparent)`
        : `0 12px 48px -16px color-mix(in srgb, ${brand.colors.primary} 30%, transparent)`,
      // CSS vars consumed by the ::before gradient ring
      '--ring-c1': brand.colors.primary,
      '--ring-c2': `color-mix(in srgb, ${brand.colors.primary} 30%, ${brand.colors.text})`,
      '--ring-c3': `color-mix(in srgb, ${brand.colors.primary} 80%, ${brand.colors.background})`,
    } as Record<string, string>
  }
  return {
    backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 95%, transparent)`,
    borderRadius: '28px',
    border: `1px solid ${focused.value ? brand.colors.primary : `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`}`,
    boxShadow: focused.value
      ? `0 12px 40px -8px rgba(0,0,0,0.18), 0 0 0 4px color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`
      : '0 12px 40px -16px rgba(0,0,0,0.18)',
  } as Record<string, string>
})

function onTierClick(value: ChatTier) {
  if (props.tierLocked && tier.value !== value) return
  tier.value = value
}

function tierBtnStyle(value: ChatTier) {
  const active = tier.value === value
  if (!active) {
    return {
      color: `color-mix(in srgb, ${brand.colors.textMuted} 90%, transparent)`,
    } as Record<string, string>
  }
  if (value === 'max') {
    return {
      background: `linear-gradient(135deg, color-mix(in srgb, ${brand.colors.primary} 18%, ${brand.colors.surface}) 0%, color-mix(in srgb, ${brand.colors.primary} 8%, ${brand.colors.surface}) 100%)`,
      color: brand.colors.primary,
      boxShadow: `0 1px 2px color-mix(in srgb, ${brand.colors.primary} 30%, transparent), inset 0 0 0 1px color-mix(in srgb, ${brand.colors.primary} 35%, transparent)`,
    } as Record<string, string>
  }
  return {
    backgroundColor: brand.colors.surface,
    color: brand.colors.text,
    boxShadow: `0 1px 2px color-mix(in srgb, ${brand.colors.text} 10%, transparent)`,
  } as Record<string, string>
}

const sendButtonStyle = computed(() => {
  if (!canSend.value) {
    return {
      backgroundColor: `color-mix(in srgb, ${brand.colors.border} 70%, transparent)`,
      color: brand.colors.textMuted,
    } as Record<string, string>
  }
  if (isMax.value) {
    return {
      background: `linear-gradient(135deg, ${brand.colors.primary} 0%, color-mix(in srgb, ${brand.colors.primary} 70%, ${brand.colors.text}) 100%)`,
      color: brand.colors.background,
      boxShadow: `0 6px 16px -4px color-mix(in srgb, ${brand.colors.primary} 50%, transparent), inset 0 1px 0 0 color-mix(in srgb, white 30%, transparent)`,
    } as Record<string, string>
  }
  return {
    backgroundColor: brand.colors.primary,
    color: brand.colors.background,
  } as Record<string, string>
})

function autosize() {
  const ta = textareaRef.value
  if (!ta) return
  ta.style.height = 'auto'
  ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`
}

async function onEnter(e: KeyboardEvent) {
  if (e.shiftKey) {
    const ta = textareaRef.value
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    value.value = value.value.slice(0, start) + '\n' + value.value.slice(end)
    await nextTick()
    ta.selectionStart = ta.selectionEnd = start + 1
    autosize()
    return
  }
  submit()
}

function submit() {
  if (!canSend.value) return
  const message = value.value.trim()
  // Snapshot the chips, then clear — emit after so the parent gets a
  // stable list and our reactive ref doesn't double-fire.
  const files = attachments.value.slice()
  attachments.value = []
  attachError.value = null
  emit('send', message, files)
  value.value = ''
  nextTick(() => autosize())
}

watch(value, () => {
  nextTick(() => autosize())
})
</script>

<style scoped>
.chat-textarea::placeholder {
  color: color-mix(in srgb, currentColor 45%, transparent);
}

.chat-send:not(:disabled):hover {
  filter: brightness(1.06);
  transform: translateY(-0.5px);
}
.chat-send:disabled {
  cursor: not-allowed;
}
.chat-stop:hover {
  filter: brightness(0.92);
}
.chat-tier-btn:hover {
  filter: brightness(1.06);
}

/* ============================================================
   MAX MODE — animated gradient ring around the composer pill.
   Implementation: a pseudo-element that sits BEHIND the pill,
   rotates a conic gradient slowly, and is masked to a thin
   1.5px ring via two background-clip layers. Pure CSS, no JS.
   ============================================================ */
.chat-composer.is-max {
  position: relative;
  isolation: isolate;
}

.chat-composer.is-max::before {
  content: '';
  position: absolute;
  inset: -1.5px;
  border-radius: inherit;
  padding: 1.5px;
  background: conic-gradient(
    from var(--ring-angle, 0deg),
    var(--ring-c1, currentColor),
    var(--ring-c2, currentColor),
    var(--ring-c3, currentColor),
    var(--ring-c2, currentColor),
    var(--ring-c1, currentColor)
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  z-index: -1;
  animation: chat-ring-rotate 6s linear infinite;
  pointer-events: none;
}

@keyframes chat-ring-rotate {
  from { --ring-angle: 0deg; }
  to   { --ring-angle: 360deg; }
}

@property --ring-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

/* Subtle lift on focus when MAX */
.chat-composer.is-max:has(.chat-textarea:focus) {
  transform: translateY(-1px);
}

.chat-send-max:not(:disabled):hover {
  filter: brightness(1.10) saturate(1.10);
}

/* Halo + badge transitions */
.chat-max-halo-enter-active,
.chat-max-halo-leave-active {
  transition: opacity 320ms ease;
}
.chat-max-halo-enter-from,
.chat-max-halo-leave-to {
  opacity: 0;
}

.chat-max-badge-enter-active,
.chat-max-badge-leave-active {
  transition:
    opacity 220ms ease,
    transform 220ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.chat-max-badge-enter-from,
.chat-max-badge-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.92);
}

/* Reduced-motion: kill the ring rotation */
@media (prefers-reduced-motion: reduce) {
  .chat-composer.is-max::before {
    animation: none;
  }
}
</style>

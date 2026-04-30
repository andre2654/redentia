<!--
  Composer pill — tier-aware, restraint-first.

  Restraint pass (audit follow-up):
  - Removed animated 6s conic gradient ring on MAX. Replaced with a
    flat 1px brand-tinted border so MAX still reads as distinct but
    nothing moves.
  - Removed radial halo blur behind the pill (24px filter on every
    paint). Tier identity now lives in a single subtle border tone.
  - Removed "MAX" badge gradient + sparkle. Tier identifier is the
    pill toggle below — no need for a redundant decoration on top.
  - Send button gradient flattened to a solid brand fill.

  Basic and MAX now share the same shape; only border colour and
  send-button intensity change. Speed of paint > visual signature.
-->
<template>
  <!-- z-30 keeps the composer above interactive surfaces in the thread
       below it (e.g. the news-card action layer at z-20 in the home
       dashboard). Without this, scrolling content that visually overlaps
       the composer area would intercept clicks meant for the input. -->
  <div class="chat-composer-wrap pointer-events-none absolute inset-x-0 bottom-0 z-30 px-5 pt-10 md:px-8" :style="{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }">
    <!-- Background fade so messages don't overlap composer harshly -->
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-32"
      :style="{
        background: `linear-gradient(to top, var(--brand-background) 30%, transparent)`,
      }"
      aria-hidden="true"
    />

    <!-- Thinking indicator — Manus-style. Sits literally above the
         composer pill, sharing the same horizontal max-width so it
         reads as the same surface. Only renders when streaming. -->
    <ChatV2ThinkingIndicator
      v-if="isStreaming && streamingMessage"
      :reasoning="streamingMessage.reasoning ?? ''"
      :tool-calls="streamingMessage.toolCalls ?? []"
    />

    <!-- Starter chips — only when the conversation is empty. They sit
         right above the composer pill so the user sees a curated
         entry point even on the first visit, without scrolling. The
         emit hits the same `start` event the dashboard uses, which
         help.vue routes to chat.send(). -->
    <ChatV2StarterChips
      v-if="showStarters"
      :tier="tier"
      class="mb-2"
      @start="(q: string) => $emit('starter', q)"
    />

    <div
      class="chat-composer pointer-events-auto relative mx-auto flex max-w-3xl flex-col gap-2 px-5 pb-3 pt-4 transition-[border-color,box-shadow] duration-200"
      :class="[isMax ? 'is-max' : 'is-basic', dragOver ? 'is-drag-over' : '']"
      :style="composerStyle"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <!--
        Asset picker popover. Sits above the composer pill via
        `position: absolute; bottom: 100%`. Opened by:
          (a) the @-symbol toolbar button (no initial query), OR
          (b) typing `@` in the textarea (initial query = whatever
              the user typed after the @, kept in sync via
              `pickerTrigger.prefix`).
      -->
      <ChatV2AssetPickerPopover
        :open="pickerOpen"
        :initial-query="pickerInitialQuery"
        @select="onAssetPicked"
        @close="closePicker"
        @query-change="onPickerQueryChange"
      />

      <!-- Drag-drop overlay -->
      <Transition name="chat-drop-overlay">
        <div
          v-if="dragOver"
          class="chat-drop-overlay pointer-events-none absolute inset-0 flex items-center justify-center rounded-[28px] text-[14px] font-semibold"
          :style="{
            backgroundColor: `color-mix(in srgb, var(--brand-primary) 12%, transparent)`,
            border: `1.5px dashed var(--brand-primary)`,
            color: 'var(--brand-primary)',
            zIndex: 5,
          }"
          aria-hidden="true"
        >
          <UIcon name="i-lucide-upload-cloud" class="mr-2 size-5" />
          Solte para anexar
        </div>
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
            backgroundColor: `color-mix(in srgb, var(--brand-surface) 70%, transparent)`,
            border: `1px solid color-mix(in srgb, var(--brand-border) 45%, transparent)`,
            color: 'var(--brand-text)',
          }"
        >
          <UIcon
            :name="attachIcon(att)"
            class="size-3.5 shrink-0"
            :style="{ color: 'var(--brand-primary)' }"
          />
          <span class="max-w-[180px] truncate">{{ att.name }}</span>
          <span
            class="shrink-0 font-mono-tab text-[10px] uppercase tracking-[0.12em]"
            :style="{ color: 'var(--brand-text-muted)' }"
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
          backgroundColor: `color-mix(in srgb, var(--brand-negative) 8%, transparent)`,
          border: `1px solid color-mix(in srgb, var(--brand-negative) 30%, transparent)`,
          color: 'var(--brand-negative)',
        }"
      >
        {{ attachError }}
      </div>

      <!--
        Contenteditable composer — replaces the previous <textarea>
        so picked assets can render INLINE as chips at the caret
        position (not as a separate row above). Editing model:
          - The div is the source of truth for what the user has
            typed. We mirror its `innerText` into the reactive
            `value` ref on every `input` so the existing
            send/canSend/watcher logic keeps working.
          - Asset chips are rendered as `contenteditable=false`
            spans inline with the prose; the browser treats each
            chip as a single atomic unit — Backspace deletes the
            whole chip, arrow keys jump over it.
          - Auto-grow comes from `min-height` + natural box growth
            (no JS autosize needed for contenteditable).
          - Placeholder is faked via `:empty:before { content }`.
        Submit-time serialization (see `submit()`) walks the DOM
        and concatenates text + ticker codes from chip data attrs
        so the chat-service sees a flat string with bare tickers.
      -->
      <div class="flex items-start gap-3">
        <div
          ref="editorRef"
          contenteditable="true"
          role="textbox"
          aria-multiline="true"
          :data-placeholder="placeholder"
          class="chat-editor min-h-[28px] max-h-[200px] flex-1 overflow-y-auto resize-none border-0 bg-transparent text-[16px] leading-relaxed outline-none"
          :class="{ 'is-empty': isEditorEmpty, 'is-disabled': disabled }"
          :style="{ color: 'var(--brand-text)' }"
          :contenteditable="!disabled"
          @input="onEditorInput"
          @focus="focused = true"
          @blur="focused = false"
          @keydown.enter.exact.prevent="onEnter"
          @keydown.escape="onTextareaEscape"
          @keyup="onTextareaKeyup"
          @click="onTextareaClick"
          @paste="onEditorPaste"
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
            backgroundColor: `color-mix(in srgb, var(--brand-text) 5%, transparent)`,
            color: 'var(--brand-text-muted)',
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

        <!--
          Asset picker button — opens the AssetPickerPopover with no
          prefix. The popover is also opened automatically when the
          user types `@` in the textarea (see `onTextInput`); this
          button is for users who don't know about the keyboard
          shortcut. Same visual vocabulary as the paperclip so the
          two affordances read as a pair.
        -->
        <button
          type="button"
          :disabled="disabled"
          class="chat-attach-btn mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          :class="{ 'is-active': pickerOpen }"
          :style="{
            backgroundColor: pickerOpen
              ? `color-mix(in srgb, var(--brand-primary) 14%, transparent)`
              : `color-mix(in srgb, var(--brand-text) 5%, transparent)`,
            color: pickerOpen ? 'var(--brand-primary)' : 'var(--brand-text-muted)',
          }"
          title="Inserir ativo (ou digite @ no campo)"
          aria-label="Inserir ativo"
          @click="togglePickerFromButton"
        >
          <UIcon name="i-lucide-at-sign" class="size-4" />
        </button>

        <div
          class="chat-tier-group inline-flex items-center gap-0.5 rounded-full p-0.5"
          :style="{
            backgroundColor: isMax
              ? `color-mix(in srgb, var(--brand-primary) 8%, transparent)`
              : `color-mix(in srgb, var(--brand-text) 5%, transparent)`,
            border: isMax
              ? `1px solid color-mix(in srgb, var(--brand-primary) 22%, transparent)`
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
                  ? { color: 'var(--brand-primary)' }
                  : tier === opt.value
                    ? { color: 'var(--brand-text)' }
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
            backgroundColor: 'var(--brand-text)',
            color: 'var(--brand-background)',
          }"
          aria-label="Parar"
          @click="$emit('stop')"
        >
          <span
            class="inline-block size-3 rounded-[3px]"
            :style="{ backgroundColor: 'var(--brand-background)' }"
          />
        </button>
      </div>
    </div>

    <!-- Disclaimer / sub-line -->
    <p
      class="mx-auto mt-2 max-w-3xl text-center font-mono-tab text-[10px] uppercase tracking-[0.16em] transition-colors"
      :style="{
        color: isMax
          ? `color-mix(in srgb, var(--brand-primary) 70%, var(--brand-text-muted))`
          : `color-mix(in srgb, var(--brand-text-muted) 65%, transparent)`,
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type {
  ChatAttachment,
  ChatAttachmentKind,
  ChatMessage,
} from '~/composables/useChatStream'
import type { AssetSearchItem } from '~/composables/useAssetSearch'

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
  /**
   * The active assistant message (the one currently being streamed),
   * passed in so the ThinkingIndicator that lives directly above the
   * composer pill can read live reasoning + tool-call state without
   * having to subscribe through the layout.
   */
  streamingMessage?: ChatMessage | null
  /**
   * Render starter-question chips above the composer pill. The parent
   * sets this true when the conversation is empty so users get a
   * curated entry point inline with the input instead of having to
   * scroll up to find suggestions.
   */
  showStarters?: boolean
}>()

const tier = defineModel<ChatTier>('tier', { default: 'basic' })

const emit = defineEmits<{
  send: [message: string, attachments: ChatAttachment[]]
  stop: []
  starter: [question: string]
}>()

const brand = useBrand()
// `value` mirrors the editor's serialized prose (innerText with
// chip text expanded inline). Reactive so canSend / watchers /
// the existing submit() pipeline keep working without changes.
const value = ref('')
const focused = ref(false)
const editorRef = ref<HTMLDivElement | null>(null)
const isEditorEmpty = computed(() => value.value.trim().length === 0)

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
  () =>
    (value.value.trim().length > 0 || attachments.value.length > 0)
    && !props.disabled,
)

const composerStyle = computed(() => {
  // Stripe-style highlight: amber-tinted ambient shadow at rest so the
  // composer reads as the page's focal point. Border tightens + ring
  // expands on focus. Shape (radius, surface) is shared between tiers;
  // tier identity is carried by border tint only.
  const borderColor = isMax.value
    ? `color-mix(in srgb, ${brand.colors.primary} ${focused.value ? 75 : 55}%, transparent)`
    : focused.value
      ? brand.colors.primary
      : `color-mix(in srgb, ${brand.colors.primary} 22%, ${brand.colors.border})`
  const ringTint = focused.value
    ? `0 0 0 3px color-mix(in srgb, ${brand.colors.primary} ${isMax.value ? 22 : 18}%, transparent)`
    : ''
  // Resting state: amber-tinted lift shadow (stripe pattern) + soft
  // dark base. Combined they create a clear "this is where you type"
  // affordance even when nothing is focused.
  const baseShadow = `0 24px 50px -22px color-mix(in srgb, ${brand.colors.primary} 22%, transparent), 0 12px 24px -12px rgba(0,0,0,0.16)`
  return {
    // Solid surface — not translucent. Earlier 96/98% blended values
    // read as washed-out over the page background, especially in light
    // mode. Keeping the composer fully opaque sharpens its presence as
    // the page's primary interactive surface.
    backgroundColor: brand.colors.surface,
    borderRadius: '28px',
    border: `1px solid ${borderColor}`,
    boxShadow: ringTint ? `${baseShadow}, ${ringTint}` : baseShadow,
  } as Record<string, string>
})

function onTierClick(value: ChatTier) {
  if (props.tierLocked && tier.value !== value) return
  tier.value = value
}

function tierBtnStyle(value: ChatTier) {
  // One shape, two tones — flat fill, no gradients, no inset shadows.
  // Active state: solid surface + 1px brand border for MAX, solid
  // surface for Basic. Inactive: text-muted only.
  const active = tier.value === value
  if (!active) {
    return {
      color: `color-mix(in srgb, ${brand.colors.textMuted} 90%, transparent)`,
    } as Record<string, string>
  }
  if (value === 'max') {
    return {
      backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 12%, ${brand.colors.surface})`,
      color: brand.colors.primary,
      boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${brand.colors.primary} 35%, transparent)`,
    } as Record<string, string>
  }
  return {
    backgroundColor: brand.colors.surface,
    color: brand.colors.text,
    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${brand.colors.border} 60%, transparent)`,
  } as Record<string, string>
}

const sendButtonStyle = computed(() => {
  // Solid fill, no gradient. Disabled state uses muted border tone.
  if (!canSend.value) {
    return {
      backgroundColor: `color-mix(in srgb, ${brand.colors.border} 70%, transparent)`,
      color: brand.colors.textMuted,
    } as Record<string, string>
  }
  return {
    backgroundColor: brand.colors.primary,
    color: brand.colors.background,
  } as Record<string, string>
})

// ---- Editor model (contenteditable) -----------------------------
//
// Serializes the editor's DOM into a flat string. Walks children
// in order and concatenates:
//   - text nodes verbatim
//   - chip elements as their `data-ticker` attribute (the ticker
//     code, e.g. "PETR4")
//   - <br> as "\n"
//   - any other element's textContent as a fallback
//
// The result is what we put into `value.value` (so canSend, the
// watcher, etc. keep working) AND what we send to the chat-service
// on submit. The agent's TickerProse extension already turns bare
// tickers (PETR4, VALE3) into live chips on the receiving end —
// so no new wire protocol is needed.
function serializeEditor(): string {
  const root = editorRef.value
  if (!root) return ''
  const out: string[] = []
  const walk = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      out.push(node.textContent ?? '')
      return
    }
    if (node instanceof HTMLElement) {
      if (node.tagName === 'BR') {
        out.push('\n')
        return
      }
      if (node.classList.contains('chat-mention')) {
        const tk = node.dataset.ticker
        if (tk) out.push(tk)
        return
      }
      // Default: recurse into children so nested formatting (a
      // contenteditable with stray inline elements from paste, etc.)
      // contributes its text.
      node.childNodes.forEach(walk)
    }
  }
  root.childNodes.forEach(walk)
  return out.join('')
}

/** Sync the reactive `value` with the editor's serialized prose.
 *  Called on every `input` event from the contenteditable div. */
function syncValueFromEditor(): void {
  value.value = serializeEditor()
}

async function onEnter(e: KeyboardEvent) {
  // When the asset picker is open, Enter is reserved for confirming
  // the highlighted asset row — defer to the popover's own handler.
  if (pickerOpen.value) return
  if (e.shiftKey) {
    // Shift+Enter inserts a soft newline. We use execCommand so
    // the contenteditable handles caret placement natively across
    // browsers (some emit a <br>, others a <div>; both work for
    // serialize).
    const root = editorRef.value
    if (!root) return
    document.execCommand('insertLineBreak')
    syncValueFromEditor()
    return
  }
  submit()
}

/**
 * Handle paste so users dropping rich HTML (formatted text from
 * Google Docs, Word, etc.) don't end up with random font-family /
 * color overrides leaking into the contenteditable. We grab plain
 * text only and insert it at the caret via execCommand —
 * preserves undo history natively.
 */
function onEditorPaste(e: ClipboardEvent): void {
  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain') ?? ''
  if (!text) return
  document.execCommand('insertText', false, text)
  syncValueFromEditor()
}

// ----- Asset picker (`@` trigger) -----------------------------------
//
// Track the open/closed state of the AssetPickerPopover plus the
// position in the textarea where an `@` was typed. When the user is
// actively writing the prefix (e.g. `@petr`), we keep the picker's
// initialQuery in sync with whatever sits between the `@` and the
// caret. Selecting an item replaces the entire `@<prefix>` substring
// with the chosen ticker.
//
// Why a position-based parser (and not just regex on value):
//   - Lets us tell `@PETR4` (a typed-out trigger) apart from `email
//     @gmail.com` (an in-the-middle @-sign).
//   - Survives multi-line input (\n followed by `@…`) without
//     constraint on whitespace.
//   - Closes the picker the moment the user types a space / new
//     line / non-word character, exactly when the prefix is "done".
const pickerOpen = ref(false)
const pickerInitialQuery = ref('')
// Index of the `@` symbol in the textarea value. -1 when not in
// trigger mode (button-opened picker, or no `@` typed yet).
const pickerTriggerStart = ref(-1)

// ---- Asset @-trigger detection (Selection API) ------------------
//
// Track where the user typed `@` in the editor so the picker's
// query stays in sync as they keep typing. The trigger anchor is
// stored as a (Node, offset) pair from the live caret — that's
// resilient to editor mutations (chip insertion, line breaks) in
// a way that a string-index offset isn't.
//
// `triggerAnchor`:
//   - Set on detection: points at the `@` symbol's text node +
//     the offset of the `@` character.
//   - Read on each text-input + arrow-key keyup, recomputing the
//     prefix from anchor → caret.
//   - Cleared when the picker closes or when the prefix breaks.
//
// `triggerEnd` is computed on demand (caret position at evaluation
// time), so it doesn't need its own ref.
const triggerAnchor = ref<{ node: Node; offset: number } | null>(null)

/**
 * Snapshot of the editor's last known Range while it had focus.
 * Used by the asset picker's button-mode insertion path: when the
 * user clicks the toolbar `@` button, focus moves to the popover
 * input and `window.getSelection()` no longer points at the editor.
 * We listen to `selectionchange` on `document` and re-capture the
 * range as long as the editor is the active focused element. The
 * picker reads from `lastEditorRange` to know where to drop the
 * chip when the popover-mediated click happens later.
 */
let lastEditorRange: Range | null = null

function captureEditorSelection(): void {
  const root = editorRef.value
  if (!root) return
  const sel = typeof window !== 'undefined' ? window.getSelection() : null
  if (!sel || sel.rangeCount === 0) return
  const r = sel.getRangeAt(0)
  if (!root.contains(r.startContainer)) return
  // Clone so subsequent caret moves don't mutate the snapshot.
  lastEditorRange = r.cloneRange()
}

onMounted(() => {
  if (typeof document === 'undefined') return
  document.addEventListener('selectionchange', captureEditorSelection)
})

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('selectionchange', captureEditorSelection)
})

/** Word-char delimiter: anything else breaks the `@` chain. */
function isPrefixChar(ch: string): boolean {
  return /[A-Za-zÀ-ÿ0-9/.-]/.test(ch)
}

/** Get the caret position as a Range — null when there's no
 *  selection inside the editor (e.g. focus elsewhere). */
function getEditorRange(): Range | null {
  const sel = typeof window !== 'undefined' ? window.getSelection() : null
  if (!sel || sel.rangeCount === 0) return null
  const r = sel.getRangeAt(0)
  const root = editorRef.value
  if (!root) return null
  // Only honor selections whose ANCHOR is inside the editor.
  if (!root.contains(r.startContainer)) return null
  return r.cloneRange()
}

function evaluateAtTrigger(): void {
  const range = getEditorRange()
  if (!range) {
    closePickerIfTriggered()
    return
  }
  // Walk backward from the caret in the same text node looking for
  // an `@`. If we leave the text node (e.g. cross into a chip span
  // or a <br>), the trigger chain breaks — same effect as hitting
  // a non-prefix char.
  const node = range.startContainer
  if (node.nodeType !== Node.TEXT_NODE) {
    closePickerIfTriggered()
    return
  }
  const text = node.textContent ?? ''
  const caret = range.startOffset
  let i = caret - 1
  while (i >= 0) {
    const ch = text[i]
    if (ch === '@') {
      // Boundary check on the char before the `@` — must be start
      // of node OR whitespace OR newline. Letters / digits before
      // = email-style usage, not a mention.
      const before = i === 0 ? ' ' : text[i - 1]
      if (before === ' ' || before === '\n' || before === '\t') {
        const prefix = text.slice(i + 1, caret)
        if ([...prefix].every(isPrefixChar)) {
          triggerAnchor.value = { node, offset: i }
          pickerInitialQuery.value = prefix
          if (!pickerOpen.value) pickerOpen.value = true
          return
        }
      }
      break
    }
    if (!ch || !isPrefixChar(ch)) break
    i--
  }
  closePickerIfTriggered()
}

/** Close the picker only when it was opened by an `@` trigger.
 *  Button-opened pickers (triggerAnchor=null) stay open through
 *  caret moves so the user can browse the list freely. */
function closePickerIfTriggered(): void {
  if (triggerAnchor.value) {
    triggerAnchor.value = null
    pickerOpen.value = false
    pickerInitialQuery.value = ''
  }
}

function onEditorInput(): void {
  syncValueFromEditor()
  evaluateAtTrigger()
}

function onTextareaKeyup(e: KeyboardEvent): void {
  if (
    e.key === 'ArrowLeft'
    || e.key === 'ArrowRight'
    || e.key === 'ArrowUp'
    || e.key === 'ArrowDown'
    || e.key === 'Home'
    || e.key === 'End'
  ) {
    evaluateAtTrigger()
  }
}

function onTextareaClick(): void {
  evaluateAtTrigger()
}

function onTextareaEscape(): void {
  if (pickerOpen.value) closePicker()
}

function togglePickerFromButton(): void {
  if (pickerOpen.value) {
    closePicker()
    return
  }
  triggerAnchor.value = null
  pickerInitialQuery.value = ''
  pickerOpen.value = true
}

function closePicker(): void {
  pickerOpen.value = false
  triggerAnchor.value = null
  pickerInitialQuery.value = ''
}

/** Mirror the popover's query back into the editor when in `@`
 *  trigger mode — rewrites the text between the `@` anchor and the
 *  current caret. Button-mode (no anchor) leaves the editor alone. */
function onPickerQueryChange(next: string): void {
  const anchor = triggerAnchor.value
  if (!anchor) return
  const root = editorRef.value
  if (!root) return
  const node = anchor.node
  if (node.nodeType !== Node.TEXT_NODE) return
  const sel = window.getSelection()
  if (!sel) return
  // Take the current selection (caret) end as the right boundary.
  const r = sel.rangeCount > 0 ? sel.getRangeAt(0) : null
  if (!r || r.startContainer !== node) return
  const text = node.textContent ?? ''
  const before = text.slice(0, anchor.offset + 1) // include the @
  const after = text.slice(r.startOffset)
  node.textContent = `${before}${next}${after}`
  // Restore caret to right after the new query.
  const newRange = document.createRange()
  const newCaret = anchor.offset + 1 + next.length
  newRange.setStart(node, newCaret)
  newRange.setEnd(node, newCaret)
  sel.removeAllRanges()
  sel.addRange(newRange)
  syncValueFromEditor()
}

/**
 * Build the chip element for an asset. The chip is `contenteditable=
 * false` so the browser treats it as a single atomic glyph — Backspace
 * deletes the whole chip, arrow keys jump over it, selection skips it.
 *
 * Markup mirrors the live TickerChip used in chat answers (logo +
 * mono ticker) but slimmer because it lives inside the composer and
 * shouldn't compete visually with the user's prose. Brand-tinted
 * background via `--brand-primary` so it tints per tenant.
 */
function buildChipNode(item: AssetSearchItem): HTMLElement {
  const chip = document.createElement('span')
  chip.className = 'chat-mention'
  chip.contentEditable = 'false'
  chip.setAttribute('spellcheck', 'false')
  chip.dataset.ticker = item.ticker
  chip.setAttribute('data-asset-kind', item.kind)
  // Logo: render initials when no logo URL — keeps the chip lean
  // even before the icon CDN responds. Falls through to text if the
  // logo fails to load (we mirror useFailedLogos's failure pattern
  // by listening to the img onerror at runtime).
  if (item.logo) {
    const img = document.createElement('img')
    img.className = 'chat-mention__logo'
    img.src = item.logo
    img.width = 16
    img.height = 16
    img.alt = ''
    img.setAttribute('aria-hidden', 'true')
    img.addEventListener('error', () => {
      img.style.display = 'none'
    })
    chip.appendChild(img)
  }
  const code = document.createElement('span')
  code.className = 'chat-mention__code'
  code.textContent = item.ticker
  chip.appendChild(code)
  return chip
}

/**
 * Insert a chip at the editor caret. Two paths:
 *
 *   - **Trigger mode**: replace the `@<prefix>` text range with the
 *     chip + a trailing space. Caret lands after the space.
 *   - **Button mode**: insert the chip at `lastEditorRange` (last
 *     known caret while editor had focus) + a trailing space.
 *
 * Why we don't read window.getSelection() at click time:
 * Clicking the popover row moves the live selection INTO the
 * popover input. The previous version used that range as the END
 * of the deletion slice, silently normalising a reversed range
 * and leaving `@<prefix>` intact while the chip landed at the
 * start of the editor. Trigger mode now derives endOffset by
 * scanning forward inside the anchor's text node — no Selection
 * dependency.
 */
function onAssetPicked(item: AssetSearchItem): void {
  const root = editorRef.value
  if (!root) {
    closePicker()
    return
  }
  const anchor = triggerAnchor.value
  let range: Range
  if (anchor) {
    const node = anchor.node
    if (node.nodeType !== Node.TEXT_NODE || !root.contains(node)) {
      closePicker()
      return
    }
    const text = node.textContent ?? ''
    let endOffset = anchor.offset + 1 // skip the `@`
    while (endOffset < text.length && isPrefixChar(text[endOffset]!)) {
      endOffset++
    }
    range = document.createRange()
    range.setStart(node, anchor.offset)
    range.setEnd(node, endOffset)
    range.deleteContents()
  } else if (lastEditorRange) {
    range = lastEditorRange.cloneRange()
  } else {
    range = document.createRange()
    range.selectNodeContents(root)
    range.collapse(false)
  }

  const chip = buildChipNode(item)
  const trailing = document.createTextNode(' ')
  // insertNode collapses the range to AFTER the inserted node,
  // so chaining inserts the trailing space right after the chip.
  range.insertNode(chip)
  range.collapse(false)
  range.insertNode(trailing)

  // Restore focus + caret AFTER trailing space. Doing this AFTER
  // the DOM mutation avoids fighting the popover for ownership of
  // window.getSelection().
  root.focus()
  const after = document.createRange()
  after.setStartAfter(trailing)
  after.collapse(true)
  const sel = window.getSelection()
  if (sel) {
    sel.removeAllRanges()
    sel.addRange(after)
  }
  syncValueFromEditor()
  closePicker()
}

function submit() {
  if (!canSend.value) return
  // serializeEditor() expands chips into their ticker codes inline
  // with the prose, so the message we emit carries everything the
  // user intended. Trim outer whitespace; preserve internal breaks.
  const message = serializeEditor().trim()
  const files = attachments.value.slice()
  attachments.value = []
  attachError.value = null
  emit('send', message, files)
  // Clear editor — set empty content + reset value mirror.
  if (editorRef.value) {
    editorRef.value.innerHTML = ''
  }
  value.value = ''
}

/**
 * Public API exposed to the parent (help.vue):
 *   - `setValue(text)` — replaces ALL editor content with plain
 *     text. Used by "edit last question" — click a past prose-only
 *     question and the composer rehydrates with that text.
 *     Note: this method assumes the input is plain text. If the
 *     original message had ticker chips, they come back as bare
 *     ticker codes (PETR4 etc.) and the user can re-pick them via
 *     `@` if they want chip rendering.
 *   - `focus()` — moves keyboard focus into the editor after a
 *     prefill so the user can type immediately.
 *   - `insertAtCursor(text)` — inserts plain text at the caret.
 *     Reserved for future flows (e.g. quick-insert from a sidebar
 *     button); not used by the @ picker (that path goes through
 *     `onAssetPicked` which inserts a real chip element).
 */
function setValue(next: string): void {
  const root = editorRef.value
  if (root) {
    root.textContent = next
  }
  value.value = next
}

function focus(): void {
  const root = editorRef.value
  if (!root) return
  root.focus()
  // Place caret at end so prefill text stays put — focus alone
  // can land the caret at start in some browsers.
  const sel = window.getSelection()
  if (!sel) return
  const r = document.createRange()
  r.selectNodeContents(root)
  r.collapse(false)
  sel.removeAllRanges()
  sel.addRange(r)
}

function insertAtCursor(text: string): void {
  const root = editorRef.value
  if (!root) {
    value.value = `${value.value}${text}`
    return
  }
  root.focus()
  document.execCommand('insertText', false, text)
  syncValueFromEditor()
  void nextTick(() => {
    editorRef.value?.focus()
  })
}

defineExpose({
  setValue,
  focus,
  insertAtCursor,
})
</script>

<style scoped>
/*
  Contenteditable composer styling. The div behaves as a
  multi-line textarea visually but supports inline chips because
  it's `contenteditable=true`. Placeholder via :empty + data-attr
  so it stays in sync with the bound prop.
*/
.chat-editor {
  white-space: pre-wrap;     /* honor user line breaks */
  word-break: break-word;    /* long URLs / unbroken strings wrap */
  caret-color: var(--brand-text);
}
.chat-editor.is-disabled {
  pointer-events: none;
  opacity: 0.6;
}
.chat-editor.is-empty:before {
  content: attr(data-placeholder);
  color: color-mix(in srgb, currentColor 45%, transparent);
  pointer-events: none;
}
/* Hide the placeholder when caret enters even if value is still ""
   (browsers like Safari mark an empty editor with a phantom <br>;
   we don't want to flash placeholder over that). */
.chat-editor:focus.is-empty:before {
  opacity: 0.5;
}

/*
  Inline mention chip — rendered into the contenteditable as a
  contenteditable=false span. Browser treats it as a single atomic
  glyph: arrow keys jump over it, Backspace deletes the whole
  thing, selections highlight it as one unit.
  Visually picks the brand-primary tint so it reads as "this is an
  asset reference, not prose." Same vocabulary as the live
  TickerChip in chat answers — keeps the user oriented.
*/
.chat-editor :deep(.chat-mention) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px 1px 2px;
  margin: 0 1px;
  border-radius: 9999px;
  background-color: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent);
  color: var(--brand-text);
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  line-height: 1.3;
  user-select: all;
  cursor: default;
  vertical-align: baseline;
  transition: background-color 140ms ease-out, border-color 140ms ease-out;
}
.chat-editor :deep(.chat-mention:hover) {
  background-color: color-mix(in srgb, var(--brand-primary) 22%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 45%, transparent);
}
.chat-editor :deep(.chat-mention__logo) {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  object-fit: cover;
  background-color: color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.chat-editor :deep(.chat-mention__code) {
  display: inline-block;
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

/* MAX mode — quiet visual identity:
     - 1px brand-tinted border (set inline via composerStyle)
     - subtle focus ring (color-mix tint)
   No animations, no halo, no rotating gradient. */
.chat-send-max:not(:disabled):hover {
  filter: brightness(1.06);
}
</style>

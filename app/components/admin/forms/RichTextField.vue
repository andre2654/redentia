<!--
  RichTextField — wrapper sobre TipTap (ProseMirror) pra rich text
  authored em comunicacoes (banner, anuncio, modal, email).

  3 levels (controlam quais extensions/buttons disponiveis):
    - inline: bold, italic, link — Enter NAO quebra paragrafo (single line).
              Pra banner, faixa de uma linha.
    - basic:  + listas (ul/ol), heading 3-4, blockquote.
              Pra anuncio, CTA, modal.
    - full:   + headings completos, code, image, hr.
              Pra email body.

  Output: HTML string (compativel com `body` text column atual).
  Storage: HTML cru — no render side, sempre passar por sanitizeHtml().

  Atalhos: Ctrl+B/I/K (TipTap nativo), Ctrl+Z undo, Ctrl+Shift+Z redo.

  Props:
    - modelValue: string  (HTML)
    - level?: 'inline' | 'basic' | 'full'  (default 'basic')
    - placeholder?: string
    - maxLength?: number  (limite em caracteres de TEXTO, nao de HTML)

  Emits: update:modelValue
-->
<template>
  <div class="rich-field" :class="`rich-field--${level}`">
    <!-- Toolbar -->
    <div class="rich-field__toolbar" role="toolbar" aria-label="Formatação">
      <button
        type="button"
        class="rich-field__btn"
        :class="{ 'rich-field__btn--active': editor?.isActive('bold') }"
        title="Negrito (Ctrl+B)"
        :disabled="!editor"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        <span class="rich-field__btn-label rich-field__btn-label--bold">B</span>
      </button>
      <button
        type="button"
        class="rich-field__btn"
        :class="{ 'rich-field__btn--active': editor?.isActive('italic') }"
        title="Itálico (Ctrl+I)"
        :disabled="!editor"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        <span class="rich-field__btn-label rich-field__btn-label--italic">I</span>
      </button>
      <button
        v-if="level === 'full'"
        type="button"
        class="rich-field__btn"
        :class="{ 'rich-field__btn--active': editor?.isActive('strike') }"
        title="Riscado"
        :disabled="!editor"
        @click="editor?.chain().focus().toggleStrike().run()"
      >
        <UIcon name="i-lucide-strikethrough" class="size-3.5" />
      </button>

      <span class="rich-field__sep" aria-hidden="true" />

      <button
        type="button"
        class="rich-field__btn"
        :class="{ 'rich-field__btn--active': editor?.isActive('link') }"
        title="Link (Ctrl+K)"
        :disabled="!editor"
        @click="onLink"
      >
        <UIcon name="i-lucide-link" class="size-3.5" />
      </button>

      <!-- BASIC + FULL: listas + heading + blockquote -->
      <template v-if="level !== 'inline'">
        <span class="rich-field__sep" aria-hidden="true" />
        <button
          type="button"
          class="rich-field__btn"
          :class="{ 'rich-field__btn--active': editor?.isActive('bulletList') }"
          title="Lista com marcadores"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleBulletList().run()"
        >
          <UIcon name="i-lucide-list" class="size-3.5" />
        </button>
        <button
          type="button"
          class="rich-field__btn"
          :class="{ 'rich-field__btn--active': editor?.isActive('orderedList') }"
          title="Lista numerada"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleOrderedList().run()"
        >
          <UIcon name="i-lucide-list-ordered" class="size-3.5" />
        </button>
        <button
          type="button"
          class="rich-field__btn"
          :class="{ 'rich-field__btn--active': editor?.isActive('blockquote') }"
          title="Citação"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleBlockquote().run()"
        >
          <UIcon name="i-lucide-quote" class="size-3.5" />
        </button>
      </template>

      <!-- FULL: headings -->
      <template v-if="level === 'full'">
        <span class="rich-field__sep" aria-hidden="true" />
        <button
          type="button"
          class="rich-field__btn"
          :class="{ 'rich-field__btn--active': editor?.isActive('heading', { level: 2 }) }"
          title="Título grande"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          <UIcon name="i-lucide-heading-2" class="size-3.5" />
        </button>
        <button
          type="button"
          class="rich-field__btn"
          :class="{ 'rich-field__btn--active': editor?.isActive('heading', { level: 3 }) }"
          title="Subtítulo"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          <UIcon name="i-lucide-heading-3" class="size-3.5" />
        </button>
        <button
          type="button"
          class="rich-field__btn"
          :class="{ 'rich-field__btn--active': editor?.isActive('codeBlock') }"
          title="Bloco de código"
          :disabled="!editor"
          @click="editor?.chain().focus().toggleCodeBlock().run()"
        >
          <UIcon name="i-lucide-code-2" class="size-3.5" />
        </button>
      </template>

      <span class="rich-field__spacer" />

      <!-- Undo/redo -->
      <button
        type="button"
        class="rich-field__btn"
        title="Desfazer (Ctrl+Z)"
        :disabled="!editor || !editor.can().undo()"
        @click="editor?.chain().focus().undo().run()"
      >
        <UIcon name="i-lucide-undo-2" class="size-3.5" />
      </button>
      <button
        type="button"
        class="rich-field__btn"
        title="Refazer (Ctrl+Shift+Z)"
        :disabled="!editor || !editor.can().redo()"
        @click="editor?.chain().focus().redo().run()"
      >
        <UIcon name="i-lucide-redo-2" class="size-3.5" />
      </button>
    </div>

    <!-- Editor body -->
    <EditorContent
      :editor="editor"
      class="rich-field__content"
      :class="{ 'rich-field__content--inline': level === 'inline' }"
    />

    <!-- Footer com counter (se maxLength) -->
    <div v-if="maxLength" class="rich-field__footer">
      <span
        class="rich-field__counter"
        :class="{ 'rich-field__counter--warn': textLength > maxLength * 0.9 }"
      >
        {{ textLength }}/{{ maxLength }}
      </span>
    </div>

    <!-- Link modal -->
    <Teleport to="body">
      <Transition name="rich-modal">
        <div v-if="linkOpen" class="rich-modal__backdrop" @click.self="closeLink" @keydown.esc="closeLink">
          <div class="rich-modal__panel" role="dialog" aria-modal="true">
            <h3 class="rich-modal__title">{{ existingLink ? 'Editar link' : 'Inserir link' }}</h3>
            <label class="rich-modal__field">
              <span class="rich-modal__label">URL</span>
              <input
                ref="urlInputRef"
                v-model="linkUrl"
                type="url"
                class="rich-modal__input"
                placeholder="https://... ou /pricing"
                @keydown.enter.prevent="confirmLink"
              />
            </label>
            <div class="rich-modal__actions">
              <button
                v-if="existingLink"
                type="button"
                class="rich-modal__btn rich-modal__btn--danger"
                @click="removeLink"
              >
                <UIcon name="i-lucide-unlink" class="size-3.5" />
                Remover
              </button>
              <span class="rich-modal__spacer" />
              <button type="button" class="rich-modal__btn rich-modal__btn--ghost" @click="closeLink">
                Cancelar
              </button>
              <button type="button" class="rich-modal__btn rich-modal__btn--primary" @click="confirmLink">
                Inserir
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Document } from '@tiptap/extension-document'
import { sanitizeHtml, htmlToText } from '~/utils/sanitizeHtml'

type Level = 'inline' | 'basic' | 'full'

const props = withDefaults(defineProps<{
  modelValue: string
  level?: Level
  placeholder?: string
  maxLength?: number
}>(), {
  level: 'basic',
  placeholder: '',
  maxLength: undefined,
})

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const editor = ref<Editor | null>(null) as unknown as { value: Editor | null }
const linkOpen = ref(false)
const linkUrl = ref('')
const existingLink = ref(false)
const urlInputRef = ref<HTMLInputElement | null>(null)

// =================================================================
// Document customizado pro level=inline (single line)
// =================================================================
// Pro banner (faixa de 1 linha), Document so aceita um unico bloco
// inline. Enter dentro nao cria novo paragrafo — vira no-op.
const InlineDocument = Document.extend({
  content: 'block',
})

// =================================================================
// Build extensions list por level
// =================================================================
function buildExtensions() {
  const isInline = props.level === 'inline'

  const starterKitOpts: any = {
    // No level=inline desabilita extensoes de bloco que nao fazem sentido
    heading: isInline ? false : (props.level === 'full' ? { levels: [1, 2, 3, 4] } : { levels: [3, 4] }),
    bulletList: isInline ? false : {},
    orderedList: isInline ? false : {},
    blockquote: isInline ? false : {},
    codeBlock: props.level === 'full' ? {} : false,
    horizontalRule: props.level === 'full' ? {} : false,
    // Bold/italic/strike sempre on (strike so usado no full)
    strike: props.level === 'full' ? {} : false,
    // History (undo/redo) sempre on
  }

  if (isInline) {
    // Replace o Document do starterKit por nosso InlineDocument
    starterKitOpts.document = false
  }

  const exts: any[] = [
    StarterKit.configure(starterKitOpts),
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      protocols: ['http', 'https', 'mailto', 'tel'],
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer',
        class: 'rich-link',
      },
    }),
    Placeholder.configure({
      placeholder: props.placeholder || 'Comece a digitar…',
      emptyEditorClass: 'is-empty',
    }),
  ]

  if (isInline) {
    exts.push(InlineDocument)
  }

  return exts
}

// =================================================================
// Lifecycle: cria editor uma vez. Re-cria so quando level muda
// (raro — geralmente fixo no contexto pai).
// =================================================================
function initEditor() {
  editor.value = new Editor({
    content: props.modelValue || '',
    extensions: buildExtensions(),
    editorProps: {
      attributes: {
        class: 'rich-field__editor',
      },
    },
    onUpdate: ({ editor: ed }) => {
      // Output HTML — vazio se editor so tem placeholder
      const html = ed.isEmpty ? '' : ed.getHTML()
      emit('update:modelValue', html)
    },
  })
}

initEditor()

// Sync external modelValue → editor quando NAO somos a fonte da
// mudanca (evita loop). TipTap re-renderiza so se o conteudo
// realmente difere.
watch(() => props.modelValue, (next) => {
  if (!editor.value) return
  const current = editor.value.getHTML()
  if (next !== current && next !== '<p></p>') {
    editor.value.commands.setContent(next || '', { emitUpdate: false })
  }
})

watch(() => props.level, () => {
  // Se level mudar em runtime, recria editor (usecase raro)
  if (editor.value) {
    editor.value.destroy()
    editor.value = null
  }
  initEditor()
})

onBeforeUnmount(() => {
  editor.value?.destroy()
  editor.value = null
})

// =================================================================
// Computeds
// =================================================================
const textLength = computed(() => htmlToText(props.modelValue).length)

// =================================================================
// Link handling
// =================================================================
function onLink() {
  if (!editor.value) return
  const prev = editor.value.getAttributes('link').href as string | undefined
  linkUrl.value = prev || ''
  existingLink.value = !!prev
  linkOpen.value = true
  nextTick(() => urlInputRef.value?.focus())
}

function closeLink() { linkOpen.value = false }

function confirmLink() {
  const ed = editor.value
  if (!ed) return
  const url = (linkUrl.value || '').trim()
  if (!url) return closeLink()

  // Validacao basica de URL — bloqueia javascript:/data:/etc
  if (!/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url)) {
    // Auto-prefix https:// se admin esquecer e o input parece dominio
    if (/^[a-z0-9.-]+\.[a-z]{2,}/i.test(url)) {
      ed.chain().focus().extendMarkRange('link').setLink({ href: `https://${url}` }).run()
    } else {
      // URL invalida — ignora
    }
  } else {
    ed.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }
  closeLink()
}

function removeLink() {
  editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
  closeLink()
}

defineExpose({ editor })
</script>

<style scoped>
.rich-field {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--brand-text, #fff) 12%, transparent);
  background: color-mix(in srgb, var(--brand-text, #fff) 4%, transparent);
  overflow: hidden;
  transition: border-color 150ms, box-shadow 150ms;
}
.rich-field:focus-within {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}

/* TOOLBAR */
.rich-field__toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 4px 6px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text, #fff) 8%, transparent);
  background: color-mix(in srgb, var(--brand-text, #fff) 3%, transparent);
}
.rich-field__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  padding: 0 7px;
  border: 0;
  background: transparent;
  border-radius: 5px;
  color: color-mix(in srgb, var(--brand-text, #fff) 70%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms;
}
.rich-field__btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--brand-text, #fff) 8%, transparent);
  color: var(--brand-text, #fff);
}
.rich-field__btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.rich-field__btn--active {
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
  color: var(--brand-primary);
}
.rich-field__btn-label {
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
}
.rich-field__btn-label--bold { font-weight: 800; }
.rich-field__btn-label--italic {
  font-family: 'Instrument Serif', Georgia, serif;
  font-style: italic;
  font-weight: 500;
}
.rich-field__sep {
  width: 1px;
  height: 16px;
  background: color-mix(in srgb, var(--brand-text, #fff) 12%, transparent);
  margin: 0 4px;
}
.rich-field__spacer { flex: 1; }

/* CONTENT */
.rich-field__content {
  position: relative;
}
.rich-field__content :deep(.rich-field__editor) {
  min-height: 64px;
  padding: 10px 12px;
  outline: none;
  color: var(--brand-text, #fff);
  font-family: var(--brand-font);
  font-size: 13px;
  line-height: 1.55;
  word-wrap: break-word;
}
.rich-field__content--inline :deep(.rich-field__editor) {
  min-height: 36px;
  padding: 8px 12px;
}
.rich-field__content--inline :deep(.rich-field__editor p) {
  margin: 0;
}

/* Editor element styles */
.rich-field__content :deep(p) {
  margin: 0 0 8px;
  line-height: 1.55;
}
.rich-field__content :deep(p:last-child) { margin-bottom: 0; }
.rich-field__content :deep(strong) {
  font-weight: 600;
  color: var(--brand-text, #fff);
}
.rich-field__content :deep(em) {
  font-style: italic;
  font-family: 'Instrument Serif', Georgia, serif;
}
.rich-field__content :deep(s) { text-decoration: line-through; }
.rich-field__content :deep(.rich-link),
.rich-field__content :deep(a) {
  color: var(--brand-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  cursor: text;
}
.rich-field__content :deep(ul),
.rich-field__content :deep(ol) {
  margin: 6px 0;
  padding-left: 22px;
}
.rich-field__content :deep(li) {
  margin: 2px 0;
}
.rich-field__content :deep(blockquote) {
  margin: 8px 0;
  padding: 6px 12px;
  border-left: 3px solid color-mix(in srgb, var(--brand-primary) 40%, transparent);
  color: color-mix(in srgb, var(--brand-text, #fff) 75%, transparent);
  font-style: italic;
}
.rich-field__content :deep(h1),
.rich-field__content :deep(h2),
.rich-field__content :deep(h3),
.rich-field__content :deep(h4) {
  font-family: var(--brand-font);
  font-weight: 500;
  letter-spacing: -0.012em;
  margin: 12px 0 6px;
  color: var(--brand-text, #fff);
}
.rich-field__content :deep(h2) { font-size: 18px; }
.rich-field__content :deep(h3) { font-size: 15px; }
.rich-field__content :deep(h4) { font-size: 13.5px; font-weight: 600; }
.rich-field__content :deep(code) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  background: color-mix(in srgb, var(--brand-text, #fff) 8%, transparent);
  padding: 1px 5px;
  border-radius: 4px;
}
.rich-field__content :deep(pre) {
  margin: 8px 0;
  padding: 10px 12px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--brand-text, #fff) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text, #fff) 8%, transparent);
  overflow-x: auto;
}
.rich-field__content :deep(pre code) {
  background: transparent;
  padding: 0;
  font-size: 11.5px;
  line-height: 1.55;
}

/* Placeholder */
.rich-field__content :deep(p.is-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: color-mix(in srgb, var(--brand-text, #fff) 40%, transparent);
  pointer-events: none;
  height: 0;
}

/* FOOTER */
.rich-field__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 4px 8px;
  border-top: 1px solid color-mix(in srgb, var(--brand-text, #fff) 6%, transparent);
}
.rich-field__counter {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  color: color-mix(in srgb, var(--brand-text, #fff) 40%, transparent);
  letter-spacing: 0.04em;
}
.rich-field__counter--warn { color: var(--brand-warning); }

/* LINK MODAL */
.rich-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
}
.rich-modal__panel {
  width: 100%;
  max-width: 420px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-radius: 14px;
  background: var(--brand-surface, #1a1a1a);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent);
  box-shadow: 0 24px 64px -16px var(--shadow-ambient);
}
.rich-modal__title {
  margin: 0 0 4px;
  font-family: var(--brand-font);
  font-size: 16px;
  font-weight: 500;
  color: var(--brand-text, #fff);
}
.rich-modal__field { display: flex; flex-direction: column; gap: 4px; }
.rich-modal__label {
  font-size: 11px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text, #fff) 70%, transparent);
}
.rich-modal__input {
  padding: 9px 12px;
  border-radius: 7px;
  border: 1px solid color-mix(in srgb, var(--brand-text, #fff) 14%, transparent);
  background: color-mix(in srgb, var(--brand-text, #fff) 4%, transparent);
  color: var(--brand-text, #fff);
  font-family: var(--brand-font);
  font-size: 13px;
  outline: none;
  transition: border-color 150ms, box-shadow 150ms;
}
.rich-modal__input:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}
.rich-modal__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}
.rich-modal__spacer { flex: 1; }
.rich-modal__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: filter 150ms, background 150ms;
}
.rich-modal__btn--ghost {
  background: transparent;
  border-color: color-mix(in srgb, var(--brand-text, #fff) 14%, transparent);
  color: color-mix(in srgb, var(--brand-text, #fff) 75%, transparent);
}
.rich-modal__btn--ghost:hover {
  background: color-mix(in srgb, var(--brand-text, #fff) 6%, transparent);
}
.rich-modal__btn--primary {
  background: var(--brand-primary);
  color: var(--text-on-primary, var(--text-heading));
  border-color: var(--brand-primary);
}
.rich-modal__btn--primary:hover { filter: brightness(1.05); }
.rich-modal__btn--danger {
  background: transparent;
  color: var(--brand-negative, #ef4444);
  border-color: color-mix(in srgb, var(--brand-negative, #ef4444) 30%, transparent);
}
.rich-modal__btn--danger:hover {
  background: color-mix(in srgb, var(--brand-negative, #ef4444) 10%, transparent);
}

.rich-modal-enter-active, .rich-modal-leave-active { transition: opacity 180ms ease; }
.rich-modal-enter-from, .rich-modal-leave-to { opacity: 0; }
.rich-modal-enter-active .rich-modal__panel,
.rich-modal-leave-active .rich-modal__panel { transition: transform 200ms ease; }
.rich-modal-enter-from .rich-modal__panel { transform: translateY(8px) scale(0.97); }
.rich-modal-leave-to .rich-modal__panel { transform: translateY(4px) scale(0.99); }
</style>

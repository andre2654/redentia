<template>
  <div
    :class="[
      'flex gap-3 px-[30px]',
      message.type === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start',
    ]"
  >
    <!-- Bot Header + Content (grouped) -->
    <div v-if="message.type === 'bot'" class="flex flex-col gap-2 max-w-[70%]">
      <!-- Bot Avatar + Title -->
      <div class="flex items-center gap-2">
        <IconLogo class="w-6 fill-white flex-shrink-0" />
        <span class="text-[17px] font-semibold">ASSESSORIA REDENTIA:</span>
      </div>

      <!-- Message Content -->
      <div class="rounded-lg border border-white/20 bg-white/10 py-3 px-4">
        <div
          class="prose prose-sm dark:prose-invert max-w-none"
          v-html="renderedContent"
        />
      </div>

      <!-- Timestamp -->
      <small class="text-xs text-white/60">
        {{ formattedTime }}
      </small>
    </div>

    <!-- User Message -->
    <div v-else class="flex flex-col gap-2 max-w-[70%]">
      <div class="rounded-lg bg-primary-500 text-white py-3 px-4">
        <p class="text-[14px]">
          {{ message.content }}
        </p>
      </div>

      <!-- Timestamp -->
      <small class="text-xs text-white/60 text-right">
        {{ formattedTime }}
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'
import type { IChatMessage } from '~/types/ai'

// ==================== PROPS ====================

const props = defineProps<{
  message: IChatMessage
}>()

// ==================== EMITS ====================

const emit = defineEmits<{
  action: [text: string]
}>()

// ==================== COMPUTED ====================

const renderedContent = computed(() => {
  if (props.message.type === 'bot') {
    try {
      // Configure marked for better markdown rendering
      marked.setOptions({
        breaks: true,
        gfm: true,
      })

      // Convert markdown to HTML
      const rawHtml = marked.parse(props.message.content)

      // Sanitize HTML to prevent XSS
      return DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li',
          'blockquote',
          'a',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
      })
    } catch (error) {
      console.error('Failed to render markdown:', error)
      return props.message.content
    }
  }
  return props.message.content
})

const formattedTime = computed(() => {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(props.message.timestamp)
  } catch {
    return ''
  }
})
</script>

<style scoped>
/* Markdown prose styling */
.prose {
  font-size: 14px;
  line-height: 1.6;
}

.prose p {
  margin: 0.5em 0;
}

.prose p:first-child {
  margin-top: 0;
}

.prose p:last-child {
  margin-bottom: 0;
}

.prose strong {
  font-weight: 600;
}

.prose em {
  font-style: italic;
}

.prose code {
  background: rgba(0, 0, 0, 0.2);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
  font-family: 'Courier New', monospace;
}

.prose pre {
  background: rgba(0, 0, 0, 0.3);
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.75em 0;
}

.prose pre code {
  background: none;
  padding: 0;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  margin: 1em 0 0.5em;
  font-weight: 600;
  line-height: 1.3;
}

.prose h1 { font-size: 1.5em; }
.prose h2 { font-size: 1.3em; }
.prose h3 { font-size: 1.15em; }
.prose h4 { font-size: 1em; }

.prose ul, .prose ol {
  margin: 0.75em 0;
  padding-left: 1.5em;
}

.prose li {
  margin: 0.25em 0;
}

.prose blockquote {
  border-left: 3px solid rgba(255, 255, 255, 0.3);
  padding-left: 1em;
  margin: 0.75em 0;
  font-style: italic;
  opacity: 0.9;
}

.prose a {
  color: #60a5fa;
  text-decoration: underline;
}

.prose a:hover {
  color: #93c5fd;
}

.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75em 0;
}

.prose th, .prose td {
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5em;
  text-align: left;
}

.prose th {
  background: rgba(255, 255, 255, 0.1);
  font-weight: 600;
}
</style>

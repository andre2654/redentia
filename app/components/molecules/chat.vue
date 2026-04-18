<template>
  <div
    class="flex h-full min-h-0 flex-col overflow-hidden xl:rounded-[30px]"
  >
    <!-- Scrollable area: suggestions + messages. Grows to fill available
         space so the input sticks at the bottom without clipping. -->
    <div class="flex min-h-0 flex-1 flex-col items-center gap-10 overflow-y-auto px-4 pb-6 pt-[70px]">
      <!-- Suggestions Section -->
      <div class="flex flex-col items-center gap-5">
        <div class="flex flex-col items-center gap-2">
          <BrandLogo variant="icon" class="h-10 w-10 opacity-80" />
          <h2 class="text-center text-2xl font-semibold">{{ brand.ai.chatTitle }}</h2>
          <p class="max-w-md text-center text-[13px] font-light" :style="{ color: brand.colors.textMuted }">
            {{ brand.ai.chatSubtitle }}
          </p>
        </div>
        <div class="flex w-full max-w-[600px] flex-col gap-2">
          <button
            v-for="(suggestion, idx) in suggestions"
            :key="idx"
            class="suggestion-btn group flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-[13px] font-medium transition-all duration-200"
            :style="{ borderColor: brand.colors.border, color: brand.colors.text }"
            @click="sendSuggestion(suggestion)"
          >
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/10 transition-colors group-hover:bg-secondary/20">
              <UIcon :name="suggestionIcons[idx % suggestionIcons.length]" class="size-4 text-secondary" />
            </div>
            <span>{{ suggestion }}</span>
            <UIcon name="i-lucide-arrow-right" class="ml-auto size-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-60" />
          </button>
        </div>
      </div>

      <!-- Chat Messages -->
      <div class="flex w-full flex-col gap-3">
      <AtomsChatMessage
        v-for="message in internalMessages"
        :key="message.id"
        :message="message"
        @action="handleAction"
      />

      <!-- Typing Indicator - Only shows when loading (prevents duplication) -->
      <div
        v-if="isLoading"
        class="mr-auto flex w-fit flex-col items-start gap-2 px-[30px]"
      >
        <div class="flex items-center gap-2">
          <BrandLogo variant="icon" class="h-6 w-6" />
          <span class="text-[17px] font-semibold">{{ brand.ai.typingLabel }}</span>
        </div>
        <div
          class="rounded-lg border border-[rgb(var(--brand-overlay)_/_0.2)] bg-[rgb(var(--brand-overlay)_/_0.1)] py-3 pl-4 pr-7"
        >
          <span class="inline-flex items-center gap-1">
            <span class="dot" />
            <span class="dot" />
            <span class="dot" />
          </span>
        </div>
        <small class="text-xs text-[rgb(var(--brand-overlay)_/_0.6)]">digitando…</small>
      </div>
      </div>
    </div>

    <!-- Input Area -->
    <div
      class="flex w-full flex-col gap-3 bg-[rgb(var(--brand-overlay)_/_0.1)] p-3 pb-6 backdrop-blur-[99px]"
      v-bind="textareaContainerProps"
    >
      <div
        v-if="ticker && routePath === '/ticker'"
        class="px-2 text-sm opacity-70"
      >
        Sobre {{ ticker }}:
      </div>
      <UTextarea
        v-model="inputValue"
        :placeholder="brand.ai.placeholder"
        size="md"
        :rows="4"
        autoresize
        :ui="{
          base: 'text-[14px] max-h-[200px] bg-transparent hover:!bg-transparent focus:!bg-transparent focus-visible:!bg-transparent ring-0 !border-0 !shadow-none placeholder:text-[rgb(var(--brand-overlay)_/_0.4)]',
        }"
        @keydown.enter.prevent="sendMessage"
      />

      <AtomsButton
        class="ml-auto flex h-[30px] w-[30px] items-center justify-center rounded-full p-0"
        size="md"
        color="neutral"
        variant="soft"
        :disabled="!canSend"
        :ui="{
          base: '!flex !items-center !justify-center bg-[var(--brand-surface-hover)] !p-0',
          leadingIcon: 'text-[var(--brand-text-muted)] m-0 w-5 h-5 shrink-0',
        }"
        icon="i-heroicons-outline-arrow-sm-right"
        @click="sendMessage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IChatMessage } from '~/types/ai'

const brand = useBrand()

const suggestionIcons = [
  'i-lucide-file-text',
  'i-lucide-coins',
  'i-lucide-trending-up',
  'i-lucide-bar-chart-3',
  'i-lucide-search',
  'i-lucide-lightbulb',
]

// ==================== TYPES ====================

type RoutePath = '/help' | '/ticker'

// ==================== PROPS ====================

const props = defineProps<{
  suggestions?: string[]
  messages?: IChatMessage[]
  routePath: RoutePath
  ticker?: string
}>()

// ==================== CONSTANTS ====================

const REQUEST_TIMEOUT = 600000 // 10 minutes
const HISTORY_LIMIT = 6
const HISTORY_MAX_CHARS = 800
const ERROR_MESSAGES = {
  timeout: 'A requisição excedeu o tempo limite. Tente novamente.',
  network: 'Erro de conexão. Verifique sua internet e tente novamente.',
  server: 'Ocorreu um erro no servidor. Tente novamente.',
  noResponse: 'Não consegui gerar uma resposta. Tente novamente.',
  generic: 'Ocorreu um erro inesperado. Tente novamente.',
} as const

// ==================== STATE ====================

const inputValue = ref('')
const isLoading = ref(false)
const internalMessages = shallowRef<IChatMessage[]>([])
const messageIndex = new Map<string, IChatMessage>()

// ==================== COMPUTED ====================

const canSend = computed(() => {
  return inputValue.value.trim().length > 0 && !isLoading.value
})

const allAttrs = useAttrs()
const textareaContainerProps = computed(() =>
  Object.fromEntries(
    Object.entries(allAttrs)
      .filter(([key]) => key.startsWith('textarea-container-'))
      .map(([key, value]) => [key.replace('textarea-container-', ''), value])
  )
)

// ==================== LIFECYCLE ====================

onMounted(() => {
  loadMessages()
})

// ==================== METHODS ====================

function loadMessages(): void {
  const msgs = props.messages || []
  messageIndex.clear()
  msgs.forEach((m) => messageIndex.set(m.id, m))
  internalMessages.value = msgs
}

function generateId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  }
}

function addMessage(message: IChatMessage): void {
  messageIndex.set(message.id, message)
  internalMessages.value = [...internalMessages.value, message]
}

function updateMessage(id: string, updates: Partial<IChatMessage>): void {
  const msg = messageIndex.get(id)
  if (msg) {
    Object.assign(msg, updates)
    triggerRef(internalMessages)
  }
}

function getMessageById(id: string): IChatMessage | undefined {
  return messageIndex.get(id)
}

/**
 * Build contextual prompt for ticker route
 */
function buildContextualPrompt(text: string): string {
  if (props.routePath === '/ticker' && props.ticker) {
    return `Sobre o ativo ${props.ticker}: ${text}`
  }
  return text
}

/**
 * Handle suggestion click
 */
function sendSuggestion(text: string): void {
  inputValue.value = text
  sendMessage()
}

/**
 * Handle action click from message
 */
function handleAction(text: string): void {
  inputValue.value = text
  sendMessage()
}

/**
 * Send a message
 */
async function sendMessage(): Promise<void> {
  const text = inputValue.value.trim()

  if (!canSend.value) return

  // Create user message (display original text without context)
  const userMessage: IChatMessage = {
    id: generateId(),
    content: text,
    type: 'user',
    timestamp: new Date(),
  }

  addMessage(userMessage)
  inputValue.value = ''

  // Build contextual prompt for API
  const contextualPrompt = buildContextualPrompt(text)

  await fetchBotResponse(contextualPrompt)
}

/**
 * Fetch bot response from internal API with streaming
 */
async function fetchBotResponse(prompt: string): Promise<void> {
  isLoading.value = true
  const botMessageId = generateId()
  let messageAdded = false
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  const buildHistory = () => {
    const msgs = internalMessages.value
    const end = msgs.length - 1
    const start = Math.max(0, end - HISTORY_LIMIT)

    const result = []
    for (let i = start; i < end; i++) {
      const m = msgs[i]
      if (typeof m.content === 'string' && m.content.trim().length > 0) {
        result.push({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.content.trim().slice(0, HISTORY_MAX_CHARS),
        })
      }
    }
    return result
  }

  const ensureMessage = () => {
    if (!messageAdded) {
      const botMessage: IChatMessage = {
        id: botMessageId,
        content: '',
        type: 'bot',
        timestamp: new Date(),
      }
      addMessage(botMessage)
      messageAdded = true
      isLoading.value = false
    }
  }

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        route: props.routePath,
        ticker: props.ticker,
        history: buildHistory(),
      }),
      signal: controller.signal,
    })

    if (!response.body) throw new Error('No response body')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const event = JSON.parse(line)

          if (event.type === 'data') {
            ensureMessage()
            updateMessage(botMessageId, { structuredData: event.content })
          } else if (event.type === 'status') {
            ensureMessage()
            updateMessage(botMessageId, { status: event.content })
          } else if (event.type === 'suggestions') {
            ensureMessage()
            updateMessage(botMessageId, { suggestions: event.content })
          } else if (event.type === 'content') {
            ensureMessage()
            const currentMsg = getMessageById(botMessageId)
            updateMessage(botMessageId, { content: (currentMsg?.content || '') + event.content })
          } else if (event.type === 'related-tickers') {
            ensureMessage()
            const currentMsg = getMessageById(botMessageId)
            const sd = currentMsg?.structuredData || { status: 'success', type: 'text' }
            updateMessage(botMessageId, {
              structuredData: { ...sd, relatedTickers: event.content },
            })
          } else if (event.type === 'tool-used') {
            ensureMessage()
            const currentMsg = getMessageById(botMessageId)
            const sd = currentMsg?.structuredData || { status: 'success', type: 'text' }
            const toolsUsed = sd.toolsUsed || []
            toolsUsed.push(event.content)
            updateMessage(botMessageId, {
              structuredData: { ...sd, toolsUsed },
            })
          } else if (event.type === 'meta') {
            ensureMessage()
            const currentMsg = getMessageById(botMessageId)
            if (currentMsg?.structuredData) {
              const sd = currentMsg.structuredData
              updateMessage(botMessageId, {
                structuredData: {
                  ...sd,
                  meta: { ...(sd.meta || {}), ...(event.content || {}) },
                },
              })
            }
          } else if (event.type === 'error') {
            ensureMessage()
            updateMessage(botMessageId, { content: event.content })
          }
        } catch (e) {
          console.warn('Error parsing stream line', e)
        }
      }
    }
  } catch (error) {
    handleStreamError(error, botMessageId)
  } finally {
    clearTimeout(timeoutId)
    isLoading.value = false
  }
}

/**
 * Handle streaming errors
 */
function handleStreamError(error: unknown, botMessageId: string): void {
  console.error('Request error:', error)

  let errorMessage = ERROR_MESSAGES.generic

  if (error instanceof Error) {
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      errorMessage = ERROR_MESSAGES.timeout
    } else if (error.message.includes('HTTP')) {
      errorMessage = ERROR_MESSAGES.server
    } else if (error.message.includes('fetch')) {
      errorMessage = ERROR_MESSAGES.network
    }
  }

  const existing = getMessageById(botMessageId)
  if (existing) {
    updateMessage(botMessageId, {
      content: existing.content + '\n\n' + errorMessage,
    })
  } else {
    const botMessage: IChatMessage = {
      id: botMessageId,
      content: errorMessage,
      type: 'bot',
      timestamp: new Date(),
    }
    addMessage(botMessage)
  }
}
</script>

<style scoped>
.suggestion-btn {
  background: var(--brand-surface, transparent);
}
.suggestion-btn:hover {
  background: var(--brand-surface-hover, rgba(255, 255, 255, 0.05));
  border-color: var(--brand-secondary, var(--ui-secondary)) !important;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  background: rgb(var(--brand-overlay) / 0.8);
  animation: blink 1.4s infinite both;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%,
  80%,
  100% {
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
}
</style>

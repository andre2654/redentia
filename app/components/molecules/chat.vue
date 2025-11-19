<template>
  <div
    class="flex flex-col items-center justify-between gap-[100px] overflow-hidden md:rounded-[30px]"
  >
    <!-- Suggestions Section -->
    <div class="flex flex-col items-center justify-center gap-4 px-3 pt-[70px]">
      <h2 class="text-center text-2xl">Faça alguma pergunta</h2>
      <p class="text-center text-[13px] font-light opacity-60">
        Tire dúvidas sobre investimentos, compare ativos e peça análises em
        linguagem simples.
      </p>
      <div class="grid max-w-[800px] grid-cols-2 gap-3 md:grid-cols-3">
        <button
          v-for="(suggestion, idx) in suggestions"
          :key="idx"
          class="glass flex h-[130px] items-center justify-center rounded-lg bg-gradient-to-t from-white/10 to-transparent p-3 text-[13px] font-medium transition-colors hover:from-white/20"
          @click="sendSuggestion(suggestion)"
        >
          {{ suggestion }}
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
          <IconLogo class="w-6 fill-white" />
          <span class="text-[17px] font-semibold">ASSESSORIA REDENTIA:</span>
        </div>
        <div
          class="rounded-lg border border-white/20 bg-white/10 py-3 pl-4 pr-7"
        >
          <span class="inline-flex items-center gap-1">
            <span class="dot" />
            <span class="dot" />
            <span class="dot" />
          </span>
        </div>
        <small class="text-xs text-white/60">digitando…</small>
      </div>
    </div>

    <!-- Input Area -->
    <div
      class="flex w-full flex-col gap-3 bg-black/10 p-3 pb-6 backdrop-blur-[99px] dark:bg-white/10"
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
        placeholder="Faça qualquer pesquisa..."
        size="md"
        :rows="4"
        autoresize
        :ui="{
          base: 'text-[14px] max-h-[200px] bg-transparent ring-0 placeholder:text-black/40 dark:placeholder:text-white/40',
        }"
        @keydown.enter.prevent="sendMessage"
      />

      <AtomsButton
        class="ml-auto h-[30px] w-[30px] rounded-full"
        size="md"
        color="neutral"
        variant="soft"
        :disabled="!canSend"
        :ui="{
          base: 'bg-[#E9E6E6]',
          leadingIcon: 'text-[#999595] w-6 h-6 -ml-2',
        }"
        icon="i-heroicons-outline-arrow-sm-right"
        @click="sendMessage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IChatMessage } from '~/types/ai'

// ==================== TYPES ====================

interface N8nStreamEvent {
  type: 'item' | 'end' | string
  content?: string
}

type RoutePath = '/help' | '/ticker'

// ==================== PROPS ====================

const props = defineProps<{
  suggestions?: string[]
  messages?: IChatMessage[]
  routePath: RoutePath
  ticker?: string
}>()

// ==================== CONSTANTS ====================

const CHAT_STORAGE_KEY = 'redentia_chat_help'
const WEBHOOK_URL = 'https://n8n.saraivada.com/webhook/redentia-assessor'
const REQUEST_TIMEOUT = 600000 // 10 minutes
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
const internalMessages = ref<IChatMessage[]>([])
const pendingBotMessageId = ref<string | null>(null) // Track pending message

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

watch(
  internalMessages,
  (messages) => {
    if (props.routePath === '/help') {
      saveMessages(messages)
    }
  },
  { deep: true }
)

// ==================== METHODS ====================

/**
 * Load messages from localStorage (only for /help route)
 */
function loadMessages(): void {
  if (props.routePath === '/help') {
    try {
      const cached = localStorage.getItem(CHAT_STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        internalMessages.value = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
        return
      }
    } catch (error) {
      console.warn('Failed to load cached messages:', error)
    }
  }

  internalMessages.value = props.messages || []
}

/**
 * Save messages to localStorage
 */
function saveMessages(messages: IChatMessage[]): void {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
  } catch (error) {
    console.warn('Failed to save messages to localStorage:', error)
  }
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  }
}

/**
 * Add a message to the chat
 */
function addMessage(message: IChatMessage): void {
  internalMessages.value = [...internalMessages.value, message]
}

/**
 * Update a specific message
 */
function updateMessage(id: string, updates: Partial<IChatMessage>): void {
  internalMessages.value = internalMessages.value.map((msg) =>
    msg.id === id ? { ...msg, ...updates } : msg
  )
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

  await streamBotResponse(contextualPrompt)
}

/**
 * Stream bot response from n8n webhook
 */
async function streamBotResponse(prompt: string): Promise<void> {
  isLoading.value = true

  const botMessageId = generateId()
  pendingBotMessageId.value = botMessageId

  // DON'T create bot message yet - wait for first content

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        route: props.routePath,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    if (!response.body) {
      throw new Error('Response body is null')
    }

    await processStream(response.body, botMessageId)

    // Ensure message has content
    const finalMessage = internalMessages.value.find(
      (m) => m.id === botMessageId
    )
    if (!finalMessage) {
      // Message was never created (no content received)
      const botMessage: IChatMessage = {
        id: botMessageId,
        content: ERROR_MESSAGES.noResponse,
        type: 'bot',
        timestamp: new Date(),
      }
      addMessage(botMessage)
    } else if (!finalMessage?.content?.trim()) {
      // Message exists but has no content
      updateMessage(botMessageId, { content: ERROR_MESSAGES.noResponse })
    }
  } catch (error) {
    handleStreamError(error, botMessageId)
  } finally {
    clearTimeout(timeoutId)
    isLoading.value = false
    pendingBotMessageId.value = null // Clear pending reference
  }
}

/**
 * Process the stream from n8n
 */
async function processStream(
  body: ReadableStream<Uint8Array>,
  botMessageId: string
): Promise<void> {
  const reader = body.getReader()
  const decoder = new TextDecoder()

  let buffer = ''
  let accumulatedContent = ''
  let messageCreated = false

  try {
    while (true) {
      const { value, done } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const { events, remaining } = parseN8nEvents(buffer)
      buffer = remaining

      for (const event of events) {
        if (event.type === 'item' && typeof event.content === 'string') {
          accumulatedContent += event.content

          // Create message on first content received
          if (!messageCreated && pendingBotMessageId.value === botMessageId) {
            const botMessage: IChatMessage = {
              id: botMessageId,
              content: accumulatedContent,
              type: 'bot',
              timestamp: new Date(),
            }
            addMessage(botMessage)
            messageCreated = true
            isLoading.value = false
            await nextTick()
          }
          // Update UI progressively - only if this is still the pending message
          else if (
            messageCreated &&
            pendingBotMessageId.value === botMessageId
          ) {
            updateMessage(botMessageId, { content: accumulatedContent })
            await nextTick()
          }
        }

        if (event.type === 'end') {
          if (accumulatedContent.trim()) {
            updateMessage(botMessageId, { content: accumulatedContent.trim() })
          }
          return
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

/**
 * Parse n8n stream events from buffer
 */
function parseN8nEvents(input: string): {
  events: N8nStreamEvent[]
  remaining: string
} {
  const events: N8nStreamEvent[] = []
  let depth = 0
  let startIndex = -1
  let inString = false
  let escaped = false

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    // Handle escape sequences
    if (escaped) {
      escaped = false
      continue
    }

    // Track string boundaries
    if (inString) {
      if (char === '\\') {
        escaped = true
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
      continue
    }

    // Track JSON object boundaries
    if (char === '{') {
      if (depth === 0) startIndex = i
      depth++
    } else if (char === '}') {
      depth--
      if (depth === 0 && startIndex !== -1) {
        const jsonString = input.slice(startIndex, i + 1)
        try {
          const event = JSON.parse(jsonString) as N8nStreamEvent
          events.push(event)
        } catch (error) {
          console.warn('Failed to parse n8n event:', jsonString, error)
        }
        startIndex = -1
      }
    }
  }

  // Return parsed events and remaining incomplete JSON
  const remaining = startIndex !== -1 ? input.slice(startIndex) : ''

  return { events, remaining }
}

/**
 * Handle streaming errors
 */
function handleStreamError(error: unknown, botMessageId: string): void {
  console.error('Stream error:', error)

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

  // Check if message exists before updating
  const existingMessage = internalMessages.value.find(
    (m) => m.id === botMessageId
  )
  if (existingMessage) {
    updateMessage(botMessageId, { content: errorMessage })
  } else {
    // Create error message if it doesn't exist
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
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  background: rgba(255, 255, 255, 0.8);
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

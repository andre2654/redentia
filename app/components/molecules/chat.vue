<template>
  <div
    class="flex flex-col items-center justify-between gap-[100px] overflow-hidden xl:rounded-[30px]"
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
      class="flex w-full flex-col gap-3 bg-white/10 p-3 pb-6 backdrop-blur-[99px]"
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
          base: 'text-[14px] max-h-[200px] bg-transparent hover:!bg-transparent focus:!bg-transparent focus-visible:!bg-transparent ring-0 !border-0 !shadow-none placeholder:text-white/40',
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
          base: '!flex !items-center !justify-center bg-[#E9E6E6] !p-0',
          leadingIcon: 'text-[#999595] m-0 w-5 h-5 shrink-0',
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
const internalMessages = ref<IChatMessage[]>([])

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

/**
 * Load messages from props
 */
function loadMessages(): void {
  internalMessages.value = props.messages || []
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
    // internalMessages already contains the current user message at the end.
    // We must NOT duplicate it; we only send the previous messages.
    const prior = internalMessages.value.slice(0, -1)
    const last = prior.slice(-HISTORY_LIMIT)

    return last
      .filter((m) => typeof m.content === 'string' && m.content.trim().length > 0)
      .map((m) => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content.trim().slice(0, HISTORY_MAX_CHARS),
      }))
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
            // Update structured data
            // Ensure we are passing the content object which matches IAgentResponse
            updateMessage(botMessageId, { structuredData: event.content })
          } else if (event.type === 'status') {
            ensureMessage()
            updateMessage(botMessageId, { status: event.content })
          } else if (event.type === 'suggestions') {
            ensureMessage()
            updateMessage(botMessageId, { suggestions: event.content })
          } else if (event.type === 'content') {
            ensureMessage()
            // Append text content
            const currentMsg = internalMessages.value.find(
              (m) => m.id === botMessageId
            )
            const newContent = (currentMsg?.content || '') + event.content

            // Check for recommendation tag in content
            // Simple check: if content starts with REC: ...
            // We might want to strip it from display or keep it

            updateMessage(botMessageId, { content: newContent })
          } else if (event.type === 'related-tickers') {
            ensureMessage()
            const currentMsg = internalMessages.value.find(
              (m) => m.id === botMessageId
            )
            const currentStructuredData = currentMsg?.structuredData || {
              status: 'success',
              type: 'text',
            }

            updateMessage(botMessageId, {
              structuredData: {
                ...currentStructuredData,
                relatedTickers: event.content,
              },
            })
          } else if (event.type === 'tool-used') {
            ensureMessage()
            const currentMsg = internalMessages.value.find(
              (m) => m.id === botMessageId
            )
            const currentStructuredData = currentMsg?.structuredData || {
              status: 'success',
              type: 'text',
            }

            const toolsUsed = currentStructuredData.toolsUsed || []
            toolsUsed.push(event.content)

            updateMessage(botMessageId, {
              structuredData: {
                ...currentStructuredData,
                toolsUsed,
              },
            })
          } else if (event.type === 'meta') {
            ensureMessage()
            const currentMsg = internalMessages.value.find(
              (m) => m.id === botMessageId
            )

            // Prefer attaching meta to structuredData when available.
            // For pure text answers, the UI can still infer REC from message.content.
            if (currentMsg?.structuredData) {
              const currentStructuredData = currentMsg.structuredData
              updateMessage(botMessageId, {
                structuredData: {
                  ...currentStructuredData,
                  meta: {
                    ...(currentStructuredData.meta || {}),
                    ...(event.content || {}),
                  },
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

  const existing = internalMessages.value.find((m) => m.id === botMessageId)
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

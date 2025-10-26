<template>
  <div
    class="flex flex-col items-center justify-between gap-[100px] overflow-hidden md:rounded-[30px]"
  >
    <div class="flex flex-col items-center justify-center gap-4 px-3 pt-[70px]">
      <h2 class="text-center text-2xl">Faça alguma pergunta</h2>
      <p class="text-center text-[13px] font-light opacity-60">
        Tire dúvidas sobre investimentos, compare ativos e peça análises em
        linguagem simples.
      </p>
      <div class="grid max-w-[800px] grid-cols-2 gap-3 md:grid-cols-3">
        <div v-for="(suggestion, idx) in suggestions" :key="idx" class="mb-2">
          <button
            class="glass flex h-[130px] items-center justify-center rounded-lg bg-gradient-to-t from-white/10 to-transparent p-3 text-[13px] font-medium hover:from-white/20"
            size="md"
            color="neutral"
            variant="soft"
            @click="onSendSuggestion(suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>

    <!-- Chat content -->
    <div class="flex w-full flex-col gap-3">
      <div v-for="message in internalMessages" :key="message.id">
        <AtomsChatMessage :message="message" @action="onActionClick" />
      </div>

      <!-- Loading bubble -->
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

    <div
      class="flex w-full flex-col gap-3 bg-black/10 p-3 pb-6 backdrop-blur-[99px] dark:bg-white/10"
      v-bind="textareaContainerProps"
    >
      <div
        v-if="props.ticker && props.routePath === '/ticker'"
        class="px-2 text-sm opacity-70"
      >
        Sobre {{ props.ticker }}:
      </div>
      <UTextarea
        placeholder="Faça qualquer pesquisa..."
        size="md"
        rows="4"
        :ui="{
          base: 'text-[14px] max-h-[200px] bg-transparent ring-0 placeholder:text-black/40 dark:placeholder:text-white/40',
        }"
        v-model="inputValue"
        autoresize
        @keydown.enter.prevent="trySend()"
      />

      <AtomsButton
        class="ml-auto h-[30px] w-[30px] rounded-full"
        size="md"
        color="neutral"
        variant="soft"
        :ui="{
          base: 'bg-[#E9E6E6]',
          leadingIcon: 'text-[#999595] w-6 h-6 -ml-2',
        }"
        icon="i-heroicons-outline-arrow-sm-right"
        @click="trySend()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IChatMessage } from '~/types/ai'

const props = defineProps<{
  suggestions?: string[]
  messages?: IChatMessage[]
  routePath: '/help' | '/ticker'
  ticker?: string
}>()

const allAttrs = useAttrs()

const textareaContainerProps = Object.fromEntries(
  Object.entries(allAttrs)
    .filter(([k]) => k.startsWith('textarea-container-'))
    .map(([k, v]) => [k.replace('textarea-container-', ''), v])
)

const inputValue = ref('')
const isLoading = ref(false)
const internalMessages = ref<IChatMessage[]>([])
const CHAT_HELP_STORAGE_KEY = 'redentia_chat_help'

onMounted(() => {
  // Carrega do cache apenas no /help
  if (props.routePath === '/help') {
    try {
      const raw = localStorage.getItem(CHAT_HELP_STORAGE_KEY)
      if (raw) {
        const parsed: any[] = JSON.parse(raw)
        internalMessages.value = parsed.map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }))
      } else if (props.messages?.length) {
        internalMessages.value = props.messages
      }
    } catch {
      internalMessages.value = props.messages || []
    }
  } else {
    internalMessages.value = props.messages || []
  }
})

watch(
  internalMessages,
  (val) => {
    if (props.routePath === '/help') {
      try {
        localStorage.setItem(CHAT_HELP_STORAGE_KEY, JSON.stringify(val))
      } catch {}
    }
  },
  { deep: true }
)

function uuid() {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }
}

function onSendSuggestion(text: string) {
  inputValue.value = text
  trySend()
}

async function trySend() {
  const text = (inputValue.value || '').trim()
  if (!text || isLoading.value) return

  // Adiciona contexto do ticker se estiver na página /ticker
  let contextualText = text
  if (props.routePath === '/ticker' && props.ticker) {
    contextualText = `Sobre o ativo ${props.ticker}: ${text}`
  }

  // Adiciona mensagem do usuário (sem o contexto visível)
  const userMsg: IChatMessage = {
    id: uuid(),
    content: text,
    type: 'user',
    timestamp: new Date(),
  }
  internalMessages.value = [...internalMessages.value, userMsg]
  inputValue.value = ''

  // Streaming IA (envia com contexto)
  startStreamingRequest(contextualText)
}

async function startStreamingRequest(prompt: string) {
  isLoading.value = true

  const botId = uuid()
  const placeholder: IChatMessage = {
    id: botId,
    content: '',
    type: 'bot',
    timestamp: new Date(),
  }
  internalMessages.value = [...internalMessages.value, placeholder]

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort('timeout'), 600000)

  try {
    const res = await fetch(
      'https://n8n.saraivada.com/webhook/redentia-assessor',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: prompt, route: props.routePath }),
        signal: controller.signal,
      }
    )

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    if (!res.body) {
      throw new Error('Resposta sem stream')
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    let buffer = ''
    let accumulatedMessage = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Extrai eventos n8n do buffer
      const { events, rest } = extractN8nEvents(buffer)
      buffer = rest

      for (const event of events) {
        if (event?.type === 'item' && typeof event.content === 'string') {
          // Acumula o texto diretamente (agora é string pura, não JSON)
          accumulatedMessage += event.content

          // Atualiza progressivamente na UI
          isLoading.value = false
          updateBotMessage(botId, { content: accumulatedMessage })
          await nextTick()
        }

        if (event?.type === 'end') {
          // Finaliza com a mensagem completa
          if (accumulatedMessage.trim()) {
            updateBotMessage(botId, { content: accumulatedMessage.trim() })
          }
          break
        }
      }
    }

    // Fallback se não chegou mensagem
    const currentMsg = internalMessages.value.find((m) => m.id === botId)
    if (!currentMsg?.content) {
      updateBotMessage(botId, {
        content: 'Não consegui gerar uma resposta. Tente novamente.',
      })
    }
  } catch (err) {
    console.error('Erro no streaming:', err)
    updateBotMessage(botId, {
      content: 'Ocorreu um erro ao contactar a assessoria. Tente novamente.',
    })
  } finally {
    clearTimeout(timeout)
    isLoading.value = false
  }
}

function extractN8nEvents(input: string): { events: any[]; rest: string } {
  const events: any[] = []
  let depth = 0
  let start = -1
  let inString = false
  let escape = false

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (escape) {
      escape = false
      continue
    }

    if (inString) {
      if (char === '\\') {
        escape = true
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
      continue
    }

    if (char === '{') {
      if (depth === 0) start = i
      depth++
    } else if (char === '}') {
      depth--
      if (depth === 0 && start !== -1) {
        const objStr = input.slice(start, i + 1)
        try {
          const event = JSON.parse(objStr)
          events.push(event)
        } catch {
          // Ignora JSONs inválidos
        }
        start = -1
      }
    }
  }

  // Retorna eventos parseados e o resto do buffer (JSON incompleto)
  const rest = start !== -1 ? input.slice(start) : ''
  return { events, rest }
}

function updateBotMessage(id: string, data: Partial<IChatMessage>) {
  internalMessages.value = internalMessages.value.map((m) =>
    m.id === id ? { ...m, ...data } : m
  )
}

function onActionClick(text: string) {
  inputValue.value = text
  trySend()
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

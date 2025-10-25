<template>
  <div
    class="flex flex-col items-center justify-between gap-[100px] rounded-[30px]"
  >
    <div class="flex flex-col items-center justify-center gap-4 px-3 pt-[70px]">
      <h2 class="text-center text-2xl">Faça alguma pergunta</h2>
      <p class="text-center text-[13px] font-light opacity-60">
        Tire dúvidas sobre investimentos, compare ativos e peça análises em linguagem simples.
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
      <div v-if="isLoading" class="flex w-fit flex-col gap-2 px-[30px] mr-auto items-start">
        <div class="flex items-center gap-2">
          <IconLogo class="w-6 fill-white" />
          <span class="text-[17px] font-semibold">ASSESSORIA REDENTIA:</span>
        </div>
        <div class="rounded-lg border border-white/20 bg-white/10 py-3 pl-4 pr-7">
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
      class="sticky bottom-0 flex w-full flex-col gap-3 rounded-b-[30px] bg-black/10 p-3 pb-6 backdrop-blur-[99px] dark:bg-white/10"
      v-bind="textareaContainerProps"
    >
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
        localStorage.setItem(
          CHAT_HELP_STORAGE_KEY,
          JSON.stringify(val)
        )
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

  // Adiciona mensagem do usuário
  const userMsg: IChatMessage = {
    id: uuid(),
    content: text,
    type: 'user',
    timestamp: new Date(),
  }
  internalMessages.value = [...internalMessages.value, userMsg]
  inputValue.value = ''

  // Chama IA
  isLoading.value = true
  try {
    const resp: any = await $fetch(
      'https://n8n.saraivada.com/webhook/redentia-assessor',
      {
        method: 'POST',
        body: {
          message: text,
          route: props.routePath,
        },
        timeout: 600000,
      }
    )

    const botText = (resp && resp.output.message) || 'Não consegui gerar uma resposta agora.'
    const botMsg: IChatMessage = {
      id: uuid(),
      content: botText,
      type: 'bot',
      timestamp: new Date(),
      actions: Array.isArray(resp.output?.actions) ? resp.output.actions : undefined,
    }
    internalMessages.value = [...internalMessages.value, botMsg]
    // Futuro: resp.actions pode virar botões de ação
  } catch (e) {
    const botMsg: IChatMessage = {
      id: uuid(),
      content: 'Ocorreu um erro ao contactar a assessoria. Tente novamente.',
      type: 'bot',
      timestamp: new Date(),
    }
    internalMessages.value = [...internalMessages.value, botMsg]
  } finally {
    isLoading.value = false
    nextTick(() => {
      try {
        const el = document.scrollingElement || document.documentElement
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      } catch {}
    })
  }
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
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
}
</style>

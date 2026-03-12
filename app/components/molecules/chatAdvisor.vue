<template>
  <div class="flex h-full flex-col overflow-hidden rounded-[30px]" :style="{ background: `linear-gradient(to bottom, ${brand.colors.surface}, ${brand.colors.background})`, color: brand.colors.text }">
    <!-- Header alinhado ao estilo da IA -->
    <div class="flex shrink-0 items-center gap-3 border-b px-5 py-4" :style="{ borderColor: brand.colors.border }">
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-secondary" :style="{ backgroundColor: brand.colors.surfaceHover }">
        {{ otherUserName.charAt(0).toUpperCase() }}
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-[13px] font-medium uppercase tracking-wide" :style="{ color: brand.colors.textMuted }">
          Conversa
        </p>
        <p class="truncate text-[15px] font-semibold" :style="{ color: brand.colors.text }">
          {{ otherUserName }}
        </p>
      </div>
      <NuxtLink
        v-if="investorDetailHref"
        :to="investorDetailHref"
        class="flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-[13px] font-medium transition hover:opacity-80"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surfaceHover, color: brand.colors.textMuted }"
      >
        <UIcon name="i-lucide-user-cog" class="h-4 w-4" />
        Ver detalhes
      </NuxtLink>
    </div>

    <!-- Área de mensagens -->
    <div ref="listRef" class="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex gap-2"
        :class="msg.sender_id === myId ? 'justify-end' : 'justify-start'"
      >
        <!-- Avatar só nas mensagens recebidas -->
        <div
          v-if="msg.sender_id !== myId"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium"
          :style="{ backgroundColor: brand.colors.surfaceHover, color: brand.colors.textMuted }"
        >
          {{ otherUserName.charAt(0).toUpperCase() }}
        </div>
        <div
          v-else
          class="w-8 shrink-0"
        />
        <div
          class="max-w-[78%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed"
          :class="msg.sender_id === myId ? 'rounded-br-lg shadow-sm' : 'rounded-bl-lg border'"
          :style="msg.sender_id === myId
            ? { backgroundColor: 'color-mix(in srgb, ' + brand.colors.primary + ' 25%, transparent)', color: brand.colors.text }
            : { borderColor: brand.colors.border, backgroundColor: brand.colors.surfaceHover, color: brand.colors.text }"
        >
          <p class="whitespace-pre-wrap">{{ msg.body }}</p>
          <p class="mt-1.5 text-[11px]" :style="{ color: brand.colors.textMuted }">
            {{ formatDate(msg.created_at) }}
          </p>
        </div>
      </div>
      <div v-if="loading" class="flex justify-center py-6">
        <UIcon name="i-lucide-loader-2" class="h-6 w-6 animate-spin text-secondary" />
      </div>
      <div
        v-if="!loading && messages.length === 0"
        class="flex flex-col items-center justify-center gap-2 py-12 text-center"
      >
        <div class="flex h-12 w-12 items-center justify-center rounded-full" :style="{ backgroundColor: brand.colors.surfaceHover }">
          <UIcon name="i-lucide-message-circle" class="h-6 w-6" :style="{ color: brand.colors.textMuted }" />
        </div>
        <p class="text-[14px]" :style="{ color: brand.colors.textMuted }">
          Nenhuma mensagem ainda.
        </p>
        <p class="text-[13px]" :style="{ color: brand.colors.textMuted, opacity: 0.7 }">
          Envie uma mensagem para {{ otherUserName }}.
        </p>
      </div>
    </div>

    <!-- Input idêntico ao do chat com IA -->
    <form
      class="flex w-full shrink-0 flex-col gap-3 p-3 pb-6 backdrop-blur-[99px]"
      :style="{ backgroundColor: brand.colors.surfaceHover }"
      @submit.prevent="sendMessage"
    >
      <UTextarea
        v-model="inputValue"
        placeholder="Faça qualquer pesquisa..."
        size="md"
        :rows="4"
        autoresize
        class="w-full resize-none"
        :ui="{
          base: 'text-[14px] max-h-[200px] bg-transparent hover:!bg-transparent focus:!bg-transparent focus-visible:!bg-transparent ring-0 !border-0 !shadow-none placeholder:text-[var(--brand-text-muted)]',
        }"
        @keydown.enter.prevent="sendMessage"
      />
      <UButton
        type="submit"
        class="ml-auto flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[var(--brand-surface-hover)] p-0"
        color="neutral"
        variant="soft"
        :disabled="!inputValue.trim() || sending"
        :loading="sending"
        :icon="sending ? 'i-lucide-loader-2' : 'i-heroicons-outline-arrow-sm-right'"
        :ui="{ base: '!flex !items-center !justify-center !p-0', leadingIcon: 'text-[var(--brand-text-muted)] m-0 w-5 h-5 shrink-0' }"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import type { ApiMessage } from '~/services/messages'

const brand = useBrand()

const props = defineProps<{
  /** ID do outro participante (assessor ou investidor) */
  otherUserId: number
  otherUserName: string
  myId: number
  /** Se preenchido (assessor vendo investidor), exibe botão "Ver detalhes" no header */
  investorDetailHref?: string
}>()

const { getThread, send } = useMessagesService()
const messages = ref<ApiMessage[]>([])
const loading = ref(true)
const sending = ref(false)
const inputValue = ref('')
const listRef = ref<HTMLElement | null>(null)

async function load() {
  loading.value = true
  try {
    const resp = await getThread(props.otherUserId)
    messages.value = resp.messages ?? []
    nextTick(() => {
      listRef.value?.scrollTo(0, listRef.value.scrollHeight)
    })
  } catch {
    messages.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.otherUserId, load, { immediate: true })

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

async function sendMessage() {
  const body = inputValue.value.trim()
  if (!body || sending.value) return
  sending.value = true
  try {
    const resp = await send(props.otherUserId, body)
    messages.value.push(resp.message)
    inputValue.value = ''
    nextTick(() => {
      listRef.value?.scrollTo(0, listRef.value.scrollHeight)
    })
  } catch (e: any) {
    showErrorNotification('Erro ao enviar', e?.data?.message ?? 'Tente novamente.')
  } finally {
    sending.value = false
  }
}
</script>

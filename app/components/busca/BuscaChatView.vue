<script setup lang="ts">
// Modo chat do /busca — view navy full-height abaixo do header sticky:
// header do chat, estado vazio com sugestões, mensagens (markdown + fontes +
// follow-ups na última), typing dots, composer sticky e drawer de histórico.
// Estado do chat vem do useNuChat (useState — o MESMO contexto da página).
// Contrato de UX: Redentia Busca Nu.dc.html (linhas 95-214).
import { BUSCA_SUGESTOES } from '~/composables/useBuscaIndex'

const props = defineProps<{ histOpen: boolean }>()
const emit = defineEmits<{
  (e: 'update:histOpen', v: boolean): void
  (e: 'exit'): void
}>()

const {
  messages, streaming, thinking, sessionId, sessions, loadingSessionId,
  send, newConversation, openSession, deleteSession,
} = useNuChat()

const cq = ref('')

const chatVazio = computed(() => messages.value.length === 0 && !streaming.value && !loadingSessionId.value)

/** placeholder do assistant (sem texto, sem erro) fica fora do render — o
 *  typing dots é o ÚNICO indicador do design; evita avatar fantasma e a
 *  bolha órfã de turno que só teve tools. */
const visibleMessages = computed(() =>
  messages.value.filter((m) => m.role === 'user' || m.content !== '' || m.error))
const lastAssistantId = computed(() => {
  for (let i = messages.value.length - 1; i >= 0; i--) {
    if (messages.value[i]!.role === 'assistant') return messages.value[i]!.id
  }
  return null
})

/* ——— auto-scroll (duplo rAF do design; deltas só se o user está no fim) ——— */
function scrollBot(smooth = true) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
    })
  })
}
function nearBottom(): boolean {
  return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 220
}
watch(() => messages.value.length, () => scrollBot(true))
watch(
  () => messages.value[messages.value.length - 1]?.content.length ?? 0,
  () => { if (nearBottom()) scrollBot(false) },
)
// só rola no mount se já há conversa (chat vazio fica no topo, com o ticker à vista)
onMounted(() => { if (messages.value.length) scrollBot(false) })

function onSend() {
  const t = cq.value.trim()
  if (!t || streaming.value) return
  cq.value = ''
  void send(t)
}

function onFollowup(t: string) {
  if (streaming.value) return
  void send(t)
}

function novaConversa() {
  newConversation() // aborta o stream ativo (contrato PR9)
  emit('update:histOpen', false)
}

async function abrirSessao(id: string) {
  emit('update:histOpen', false)
  await openSession(id)
  scrollBot(false)
}
</script>

<template>
  <div class="bcv">
    <BuscaChatHeader
      :tem-hist="sessions.length > 0"
      :hist-open="props.histOpen"
      @hist="emit('update:histOpen', true)"
      @nova="novaConversa"
      @sair="emit('exit')"
    />

    <BuscaHistoryDrawer
      :open="props.histOpen"
      :sessions="sessions"
      :active-id="sessionId"
      @close="emit('update:histOpen', false)"
      @nova="novaConversa"
      @open-session="abrirSessao"
      @delete-session="deleteSession"
    />

    <!-- role=log + aria-live: o leitor de tela anuncia a resposta da IA à
         medida que streama (antes só o "digitando" era anunciado e a resposta
         vinha em silêncio). polite = não interrompe o que o usuário digita. -->
    <div class="bcv__body" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Conversa com a Redentia AI">
      <div v-if="chatVazio" class="bcv__empty">
        <img src="/logo-branca.svg" alt="Redentia" class="bcv__empty-logo">
        <div class="bcv__empty-title">Pergunte qualquer coisa.</div>
        <div class="bcv__empty-sub">Sobre um ativo, sua carteira, as teses ou o mercado de hoje.</div>
        <div class="bcv__empty-sugs">
          <button
            v-for="s in BUSCA_SUGESTOES" :key="s" type="button" class="bcv__chip"
            @click="onFollowup(s)"
          >{{ s }}</button>
        </div>
      </div>

      <BuscaChatMessage
        v-for="m in visibleMessages" :key="m.id" :msg="m"
        :show-followups="m.id === lastAssistantId && !streaming"
        @followup="onFollowup"
      />

      <BuscaTypingDots v-if="thinking || loadingSessionId" />
    </div>

    <BuscaChatComposer v-model="cq" :disabled="streaming" @send="onSend" />
  </div>
</template>

<style scoped>
.bcv {
  background: var(--nu-navy);
  min-height: calc(100vh - var(--nuh-h, 76px));
  display: flex; flex-direction: column;
}
.bcv__body {
  flex: 1; width: 100%; max-width: 880px; margin: 0 auto;
  padding: clamp(22px, 3vw, 38px) clamp(22px, 4vw, 40px) 10px;
}

.bcv__empty { text-align: center; padding: clamp(36px, 8vh, 80px) 0; }
.bcv__empty-logo { width: 46px; height: 46px; display: inline-block; object-fit: contain; opacity: .95; }
.bcv__empty-title {
  color: var(--nu-cream-text); font-size: clamp(21px, 2.2vw, 26px);
  font-weight: 800; margin-top: 18px;
}
.bcv__empty-sub { color: var(--nu-cream-text-55); font-size: 15px; font-weight: 500; margin-top: 8px; }
.bcv__empty-sugs {
  display: flex; align-items: center; justify-content: center; gap: 9px;
  flex-wrap: wrap; margin-top: 26px;
}
.bcv__chip {
  background: transparent; color: var(--nu-cream-text);
  border: 1.5px solid var(--nu-cream-text-35); border-radius: var(--nu-r-pill);
  padding: 10px 18px; font-size: 13.5px; font-weight: 700; cursor: pointer;
  transition: background .2s, border-color .2s;
}
.bcv__chip:hover { background: var(--nu-cream-text-10); border-color: var(--nu-cream-text-70); }
.bcv__chip:focus-visible { outline: 2px solid var(--nu-blue-soft); outline-offset: 2px; }
</style>

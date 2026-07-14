<script setup lang="ts">
// /busca — busca instantânea client-side + chat Redentia AI (PR9, ÚLTIMA
// tela do Redentia Nu). Contrato de UX: designs/Redentia Busca Nu.dc.html.
//
// Dois modos mutuamente exclusivos (estado chatMode, refletido em ?chat=1
// via router.replace) + drawer de histórico por cima do chat.
// Decisões fechadas do PR9:
//  - Anônimo: a BUSCA funciona 100%; QUALQUER gatilho de chat (Perguntar à
//    IA, Abrir o chat, chip, conversa recente, deep-link ?chat=1) →
//    /login?redirect=/busca. Logado: tudo liberado.
//  - Tier 'basic' + tenant 'redentia' fixos; label sempre "Redentia AI".
//  - Histórico vem do banco via chat-service (fonte de verdade) — nada de
//    thread em localStorage.
//  - Atalhos: '/' foca a busca (fora de campos de texto); Escape em cascata
//    (drawer → chat → limpa a query), sempre com blur.
import { BUSCA_SUGESTOES } from '~/composables/useBuscaIndex'
import type { BuscaType } from '~/composables/useBuscaIndex'

const VALID_TIPOS: BuscaType[] = ['todos', 'acoes', 'fiis', 'bdrs', 'cripto', 'tesouro']

usePageSeo({
  title: 'Busca',
  description: 'Busque ativos, teses e guias da Redentia, ou pergunte qualquer coisa à Redentia AI.',
  noindex: true, // página-ferramenta (rota já é private/no-store)
})

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuthState()
const chat = useNuChat()
const index = useBuscaIndex()

/* ——— estado dos 3 modos ——— */
const qParam = route.query.q
const q = ref(typeof qParam === 'string' ? qParam : '')
const chatMode = ref(route.query.chat === '1')
const histOpen = ref(false)

/* ——— filtro de tipo (pills), refletido em ?tipo= ——— */
const tipo = computed<BuscaType>(() => {
  const t = String(route.query.tipo ?? '')
  return (VALID_TIPOS as string[]).includes(t) ? (t as BuscaType) : 'todos'
})
function setTipo(t: BuscaType) {
  index.resetBrowse() // nova pill começa do topo da lista
  const query = { ...route.query } as Record<string, any>
  if (t === 'todos') delete query.tipo
  else query.tipo = t
  router.replace({ query })
  index.ensureType(t) // garante a fonte do tipo (assets/crypto/tesouro), lazy
}

// Deep-link ?chat=1 é gatilho de chat: anônimo vai pro login (SSR-side,
// sem flash — o cookie nu:token é visível no servidor). Preserva a rota
// INTEIRA (incl. ?q=) pra pergunta sobreviver ao login.
if (chatMode.value && !isAuthenticated.value) {
  await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`, { replace: true })
}

// Modo chat esconde o footer global (o design não tem footer no chat; o
// layout é intocável — a página estampa uma classe no <html>).
useHead({ htmlAttrs: { class: computed(() => (chatMode.value ? 'nu-busca-chat' : '')) } })

// ?chat=1 acompanha o estado sem recarregar (deep-link estável).
watch(chatMode, (on) => {
  const query = { ...route.query } as Record<string, any>
  if (on) query.chat = '1'
  else delete query.chat
  router.replace({ query })
  if (!on) histOpen.value = false
})

/* ——— resultados live ———
   sem query + tipo específico → LISTA NAVEGÁVEL (browse); senão → busca. */
const browseMode = computed(() => !q.value.trim() && tipo.value !== 'todos')
const results = computed(() => index.search(q.value, tipo.value))
const browseVM = computed(() => index.browse(tipo.value))

const recents = computed(() =>
  chat.sessions.value.slice(0, 3).map((s) => {
    const t = (s.title ?? '').trim() || 'Conversa sem título'
    return {
      id: s.id,
      title: t.length > 44 ? `${t.slice(0, 44)}…` : t,
      time: relAgo(s.updatedAt),
    }
  }),
)

/* ——— gate de auth (decisão fechada: gatilho de chat exige login) ——— */
function gate(run: () => void) {
  if (!isAuthenticated.value) {
    void navigateTo(`/login?redirect=${encodeURIComponent('/busca')}`)
    return
  }
  run()
}

function askAi() {
  const question = q.value.trim() || 'O que a Redentia AI pode fazer?'
  gate(() => {
    chatMode.value = true
    void chat.send(question)
    q.value = ''
  })
}

function abrirChat() {
  gate(() => { chatMode.value = true })
}

function suggest(t: string) {
  gate(() => {
    chatMode.value = true
    void chat.send(t)
  })
}

function openRecent(id: string) {
  gate(() => {
    chatMode.value = true
    void chat.openSession(id)
  })
}

function sairChat() {
  chat.stop() // X aborta o stream ativo (contrato PR9)
  chatMode.value = false
}

/* ——— atalhos de teclado ——— */
const hero = ref<{ focusInput: () => void } | null>(null)

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || (el as HTMLElement).isContentEditable
}

function onKey(e: KeyboardEvent) {
  if (e.key === '/' && !chatMode.value && !isTypingTarget(document.activeElement)) {
    e.preventDefault()
    hero.value?.focusInput()
    return
  }
  if (e.key === 'Escape') {
    if (histOpen.value) histOpen.value = false
    else if (chatMode.value) sairChat()
    else q.value = ''
    ;(document.activeElement as HTMLElement | null)?.blur?.()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  // ?q= pré-preenchido já pede o universo completo (B3 + cripto + tesouro)
  if (q.value.trim()) index.ensureUniverse()
  // ?tipo= deep-linkado já pede a fonte daquele tipo
  if (tipo.value !== 'todos') index.ensureType(tipo.value)
  // histórico do banco (anônimo não tem sessão — nem chama)
  if (isAuthenticated.value) void chat.loadSessions()

  // Deep-link ?chat=1&q= AUTO-ENVIA a pergunta ao chegar — é o contrato dos
  // atalhos "Novo aporte"/"Rebalancear carteira" da carteira (useAporteChat).
  // Só logado: o anônimo com ?chat=1 já foi mandado pro login no setup.
  // Nova conversa pra a pergunta não se misturar num thread antigo; limpa o
  // ?q= da URL pra um refresh não reenviar (o ?chat=1 fica).
  if (chatMode.value && q.value.trim() && isAuthenticated.value) {
    const question = q.value.trim()
    q.value = ''
    chat.newConversation()
    void chat.send(question)
    const query = { ...route.query } as Record<string, any>
    delete query.q
    void router.replace({ query })
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  chat.stop() // sair da rota no meio do streaming não deixa fetch órfão
})
</script>

<template>
  <div class="bp">
    <BuscaChatView
      v-if="chatMode"
      v-model:hist-open="histOpen"
      @exit="sairChat"
    />

    <template v-else>
      <BuscaSearchHero
        ref="hero"
        v-model="q"
        :sugestoes="BUSCA_SUGESTOES"
        :recents="recents"
        @ask="askAi"
        @open-chat="abrirChat"
        @suggest="suggest"
        @open-recent="openRecent"
        @activate="index.ensureUniverse()"
      />
      <BuscaTypeFilters :model-value="tipo" @update:model-value="setTipo" />
      <BuscaBrowseList v-if="browseMode" :browse="browseVM" @more="index.showMore()" />
      <BuscaResults v-else :results="results" />
    </template>
  </div>
</template>

<style>
/* modo chat: o footer global some (o design não tem footer no chat; o layout
   é intocável, então a página esconde via classe estampada no <html>) */
html.nu-busca-chat .nu-shell > footer { display: none; }
</style>

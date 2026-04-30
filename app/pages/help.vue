<!--
  /help — full-screen Redentia chat (Perplexity-style takeover).

  Single canonical AI chat surface. Replaces both the legacy /help
  (which previously hosted MoleculesChat + MoleculesChatAdvisor with
  tabs) and the interim /chat page. QuickSearch and any other entry
  point should now redirect here with `?q=` for auto-send.

  Auth model:
  - Public route (SEO-indexable). Unauthenticated users see a CTA
    card that points them to /auth/login?redirect=/help.
  - Sending a message requires authentication — the composer is
    only mounted when authStore.isAuthenticated is true. Server-side
    chat-service also rejects anonymous /stream POSTs.
-->
<template>
  <!-- Unauthenticated: full landing showcase. Animated chat demo,
       "como funciona" stages, diferenciais, repeat CTA. Lives in the
       standard public layout (header + footer preserved for SEO and
       global nav). All animation logic + content in the component. -->
  <NuxtLayout
    v-if="!authStore.isAuthenticated"
    name="unauthenticated"
    title="Assessoria com IA"
    :hide-footer="false"
  >
    <h1 class="sr-only">Assessoria com IA | {{ brand.name }}</h1>
    <ChatV2ShowcaseLanding
      :cta-label="brand.voice?.ctaPrimary"
      @start="redirectToLogin"
    />
  </NuxtLayout>

  <!-- Authenticated: Perplexity-style takeover (no layout chrome) -->
  <ChatV2Layout
    v-else
    :sidebar-open="sidebarOpen"
    :sidebar-collapsed="sidebarCollapsed"
    :artifact-open="artifactOpen"
    :tier="tier"
    @close-sidebar="onCloseSidebar"
    @close-artifact="artifactOpen = false"
  >
    <template #sidebar>
      <ChatV2Sidebar
        :sessions="sessionList"
        :active-id="chat.sessionId.value"
        :show-goals-and-decisions="authStore.isAuthenticated"
        @new="onNewConversation"
        @select="onSelectSession"
        @delete="onDeleteSession"
        @open-panel="onOpenPanel"
      />
    </template>

    <template #thread>
      <div class="relative flex h-full min-w-0 flex-1 flex-col">
        <!-- Mobile-only top bar -->
        <div
          class="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 xl:hidden"
        >
          <button
            type="button"
            class="flex size-9 items-center justify-center rounded-full backdrop-blur-md transition-colors"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 70%, transparent)`,
              border: `1px solid color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
              color: brand.colors.text,
            }"
            aria-label="Abrir conversas"
            @click="sidebarOpen = true"
          >
            <UIcon name="i-lucide-panel-left" class="size-4" />
          </button>

          <ChatV2NotificationBell
            :unread-count="alertsState.unreadCount.value"
            @open="notificationsOpen = true"
          />

          <NuxtLink
            to="/"
            class="flex size-9 items-center justify-center rounded-full backdrop-blur-md transition-colors"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 70%, transparent)`,
              border: `1px solid color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
              color: brand.colors.text,
            }"
            aria-label="Voltar para a home"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </NuxtLink>
        </div>

        <!-- Desktop top-LEFT: re-open sidebar button (only when collapsed) -->
        <div
          v-if="sidebarCollapsed"
          class="absolute left-5 top-5 z-10 hidden items-center gap-2 xl:flex"
        >
          <button
            type="button"
            class="flex size-9 items-center justify-center rounded-full transition-colors"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 80%, transparent)`,
              border: `1px solid color-mix(in srgb, ${brand.colors.border} 45%, transparent)`,
              color: brand.colors.text,
            }"
            aria-label="Mostrar conversas"
            @click="sidebarCollapsed = false"
          >
            <UIcon name="i-lucide-panel-left" class="size-4" />
          </button>
        </div>

        <!-- Desktop top-right cluster: bell + close -->
        <div class="absolute right-5 top-5 z-10 hidden items-center gap-2 xl:flex">
          <ChatV2NotificationBell
            :unread-count="alertsState.unreadCount.value"
            @open="notificationsOpen = true"
          />
          <NuxtLink
            to="/"
            class="flex size-9 items-center justify-center rounded-full transition-colors"
            :style="{ color: brand.colors.textMuted }"
            aria-label="Fechar chat"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </NuxtLink>
        </div>

        <!-- Thread or empty state -->
        <!-- Goal badge intentionally removed — the active goal is
             accessible via the Painel sidebar button + drawer; a
             separate pill on top of every conversation was redundant
             chrome. -->

        <ChatV2Thread
          v-if="chat.messages.value.length > 0"
          ref="threadRef"
          :messages="chat.messages.value"
          @send-followup="onSendFollowup"
          @open-artifact="onOpenArtifact"
          @confirm-execution="onConfirmExecution"
          @cancel-pre-execute="onCancelPreExecute"
          @select-alert="onSelectAlertInline"
          @dismiss-alert="onDismissAlert"
          @confirm-proposal="onConfirmProposal"
          @skip-proposal="onSkipProposal"
          @regenerate="onRegenerate"
          @edit-question="onEditQuestion"
        />
        <!-- Authenticated users see the rich dashboard (real IBOV, goal
             progress, decisions/watchlist counts, personalized news with
             "ask impact" affordance). Unauthenticated never reaches here
             (the unauthenticated branch above renders a separate showcase
             landing). -->
        <ChatV2HomeDashboard
          v-else
          :tier="tier"
          :has-wallet="hasWallet"
          @start="onStarterChip"
          @start-import="onStartImport"
          @open-goal="goalSetupOpen = true"
        />

        <!--
          Scroll-to-bottom FAB. Lives here (not inside ChatV2Thread)
          so it sits in the SAME column container as the composer
          pill — both are `absolute bottom-x left-1/2 translate-x(-50%)`
          inside this `relative flex flex-col` wrapper, so they
          inherit the same horizontal center. Visibility + click
          handler come from Thread via `defineExpose({ showScrollFab,
          scrollToBottom })`. Sits AFTER the v-if/v-else pair so the
          Vue compiler still sees them as adjacent siblings (the
          Transition wrapper here would otherwise break adjacency
          and trip the "v-else has no adjacent v-if" error).
        -->
        <Transition name="chat-fab">
          <button
            v-if="threadRef?.showScrollFab"
            type="button"
            class="chat-scroll-fab"
            aria-label="Rolar para o final"
            @click="threadRef?.scrollToBottom()"
          >
            <UIcon name="i-lucide-arrow-down" class="size-[18px]" />
          </button>
        </Transition>

        <!-- Composer — also hosts the ThinkingIndicator inline (see
             Input.vue). The indicator only mounts while streaming and
             reads reasoning + tool calls off the active assistant
             message we pass in here, so it visually attaches to the
             composer pill (Manus pattern). -->
        <ChatV2Input
          ref="composerRef"
          v-model:tier="tier"
          :disabled="chat.isStreaming.value"
          :is-streaming="chat.isStreaming.value"
          :tier-locked="chat.messages.value.length > 0"
          :streaming-message="chat.lastAssistant.value"
          :show-starters="chat.messages.value.length === 0"
          @send="onSend"
          @stop="chat.stop"
          @starter="onStarterChip"
        />
      </div>
    </template>

    <template #artifact>
      <ChatV2ArtifactPanel
        v-if="activeArtifact"
        :artifact="activeArtifact"
        @close="onCloseArtifact"
      />
    </template>
  </ChatV2Layout>

  <!-- Goal setup modal — Teleports itself to body, so it can live
       outside the layout slots. -->
  <ChatV2GoalSetupModal
    :open="goalSetupOpen"
    @close="goalSetupOpen = false"
    @created="onGoalCreated"
  />

  <!-- Goal detail drawer — opens when the user clicks a goal in the
       sidebar OR clicks the goal badge above the conversation. -->
  <ChatV2GoalDetailDrawer
    :open="goalDetailOpen"
    :goal="goalDetailGoal"
    @close="closeGoalDetail"
    @archived="onGoalArchived"
  />

  <!-- Decision detail drawer — opens from the Painel drawer's Decisões
       tab OR from clicking the inline DecisionCard's "Ver detalhes". -->
  <ChatV2DecisionDetailDrawer
    :open="decisionDetailOpen"
    :decision="decisionDetailDecision"
    @close="closeDecisionDetail"
    @removed="onDecisionRemoved"
    @go-to-session="onJumpToDecisionSession"
  />

  <!-- Audit drawer — single scrollable view of metas / decisões /
       watch / memória / atividade. The Alertas section moved to its
       own NotificationsDrawer (see below) — alerts are time-sensitive
       and deserve a dedicated quick-access surface, not a tab buried
       inside an audit panel. -->
  <ChatV2PanelDrawer
    :open="panelOpen"
    :initial-section="panelInitialSection"
    @close="panelOpen = false"
    @new-goal="onNewGoalFromPanel"
    @select-goal="onSelectGoalFromPanel"
    @select-decision="onSelectDecisionFromPanel"
    @chat-prompt="onChatPromptFromPanel"
  />

  <!-- Notifications drawer — opens from the bell button at the top
       of the chat. Routes alert clicks the same way the old Painel
       Alertas tab did (jump to source session, or seed a follow-up
       turn referencing the ticker). -->
  <ChatV2NotificationsDrawer
    :open="notificationsOpen"
    :alerts="alertsState.alerts.value"
    :loading="alertsState.loading.value"
    @close="notificationsOpen = false"
    @select="onSelectAlertFromBell"
    @dismiss="(id) => alertsState.dismiss(id)"
    @dismiss-all="() => alertsState.dismissAll()"
    @mark-read="(id) => alertsState.markRead(id)"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ChatArtifact, ChatAttachment, ChatProposalData } from '~/composables/useChatStream'

definePageMeta({
  // Public route — Authenticated users get the chat takeover; the
  // unauthenticated branch above renders inside the standard layout
  // for SEO purposes. We disable Nuxt's layout system globally so
  // the takeover can own 100% of the viewport when logged in.
  isPublicRoute: true,
  layout: false,
})

const route = useRoute()
const brand = useBrand()
const authStore = useAuthStore()

// ---- State ------------------------------------------------------
const tier = ref<'basic' | 'max'>('basic')

// Reference to the Thread so this page can drive the scroll-to-bottom
// FAB (rendered as a sibling of the composer to inherit the same
// horizontal center). Type is opaque on purpose — we only touch the
// `showScrollFab` ref + `scrollToBottom()` method exposed by the
// component via `defineExpose`.
const threadRef = ref<{
  showScrollFab: boolean
  scrollToBottom: () => void
} | null>(null)

// Reference to the composer so we can drive it from outside —
// specifically for the "edit last question" affordance (prefill +
// focus) and the upcoming asset-picker (`@` trigger inserts a
// ticker at the caret).
const composerRef = ref<{
  setValue: (text: string) => void
  focus: () => void
  insertAtCursor: (text: string) => void
} | null>(null)
const sidebarOpen = ref(false)
// Desktop-only: when true, the sidebar is hidden entirely (collapsed
// by the user clicking the « button). Mobile uses `sidebarOpen` instead.
const sidebarCollapsed = ref(false)
const artifactOpen = ref(false)
const activeArtifact = ref<ChatArtifact | null>(null)
const sessionList = ref<Array<{ id: string; title: string | null; createdAt: string; tier?: 'basic' | 'max'; goalId?: string | null }>>([])

// ---- Goals + Decisions ------------------------------------------
// Goals/Decisions only make sense when authenticated. Composables are
// safe to call regardless (they short-circuit when no auth token).
const goalSetupOpen = ref(false)
const goalDetailOpen = ref(false)
const goalDetailId = ref<string | null>(null)
const decisionDetailOpen = ref(false)
const decisionDetailId = ref<string | null>(null)
// Audit drawer — single comprehensive view of everything the agent
// has access to (goals, decisions, watchlist, alerts, long-term
// memory, recent activity). The sidebar shows compact counters per
// section and routes the click through `initial-section` so the
// drawer scrolls to the right block.
const panelOpen = ref(false)
const panelInitialSection = ref<
  'goals' | 'decisions' | 'watchlist' | 'memory' | 'activity'
>('goals')

// Notifications drawer — separate from the audit panel. Bell button
// at the top of the chat opens this; bell shows unread badge driven
// by alertsState.unreadCount.
const notificationsOpen = ref(false)
const { goals, refresh: refreshGoals, linkSession, unlinkSession, findById: findGoalById } = useGoals()
const {
  refresh: refreshDecisions,
  findById: findDecisionById,
} = useDecisions()
const goalDetailGoal = computed(() => findGoalById(goalDetailId.value))
const decisionDetailDecision = computed(() => findDecisionById(decisionDetailId.value))
// Active goal id is computed AFTER `chat` is initialised below — we
// declare the refs early but bind the actual session.id reactivity
// after the composable is available.

const routeContext = computed<{ type: 'asset' | 'crypto' | 'tesouro' | 'home' | null; ticker?: string } | null>(
  () => null,
)

const chat = useChatStream({
  tenantSlug: brand.slug ?? 'redentia',
  tier,
  routeContext,
})

// Goal anchoring state — kept around so the goal-link side effect of
// `onSelectGoal` (auto-anchor when clicking a goal in the panel
// drawer if the active session has none yet) keeps working. The
// previous goal badge above the conversation is gone, so we no
// longer materialise the goal object itself in the template.
const activeGoalId = computed<string | null>(() => {
  const sid = chat.sessionId.value
  if (!sid) return null
  const session = sessionList.value.find((s) => s.id === sid)
  return session?.goalId ?? null
})

usePageSeo({
  title: `Assessoria com IA | ${brand.name}`,
  description:
    `Converse com a IA da ${brand.name}: tire dúvidas sobre investimentos, monte sua carteira com framework de 9 camadas, valide metas, compare ativos.`,
  path: '/help',
})

// ---- Load session list ------------------------------------------
async function refreshSessionList() {
  if (!authStore.isAuthenticated) {
    sessionList.value = []
    return
  }
  try {
    const r = await $fetch<{
      sessions: Array<{
        id: string
        title: string | null
        createdAt?: string
        created_at?: string
        tier?: string
        goalId?: string | null
        goal_id?: string | null
      }>
    }>('/api/chat/sessions', {
      headers: { ...authHeaders(), ...chatClientIdHeaders() },
    })
    sessionList.value = (r.sessions ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      createdAt: s.createdAt ?? s.created_at ?? new Date().toISOString(),
      tier: s.tier === 'max' ? 'max' : 'basic',
      goalId: s.goalId ?? s.goal_id ?? null,
    }))
  } catch {
    sessionList.value = []
  }
}

// ---- Handlers ---------------------------------------------------
function onSend(message: string, attachments: ChatAttachment[] = []) {
  if (!authStore.isAuthenticated) {
    redirectToLogin()
    return
  }
  if (attachments.length > 0) {
    void chat
      .send({ text: message, attachments })
      .then(refreshSessionList)
    return
  }
  void chat.send(message).then(refreshSessionList)
}

function onSendFollowup(
  message:
    | string
    | {
        text: string
        formId?: string
        fields?: Array<{ id: string; label: string; value: string }>
        formTitle?: string
      },
) {
  if (!authStore.isAuthenticated) {
    redirectToLogin()
    return
  }
  void chat.send(message)
}

function onStarterChip(message: string, requestedTier?: 'basic' | 'max') {
  if (!authStore.isAuthenticated) {
    redirectToLogin()
    return
  }
  // Some starter actions (HomeDashboard ticker menu's "Análise completa"
  // and "Faz sentido pra mim?") emit a tier hint because they only make
  // sense in MAX (multi-tool research, portfolio framework). Honor the
  // hint by switching the picker before sending so the badge reflects
  // the actual tier the answer was generated under.
  if (requestedTier && requestedTier !== tier.value) {
    tier.value = requestedTier
  }
  void chat.send(message).then(refreshSessionList)
}

async function onNewConversation() {
  chat.reset()
  sidebarOpen.value = false
}

// ============================================================
// Wallet detection for HomeDashboard
// ============================================================
// When the user has no positions yet, the dashboard collapses
// Meta/Decisões/Watchlists into a single "Importar carteira" card.
// We refetch on mount and after a `portfolio.imported` SSE event
// would refresh the page (MVP: just on mount).
const hasWallet = ref(true) // optimistic default — flip if fetch returns empty
async function loadHasWallet() {
  if (!authStore.isAuthenticated) {
    hasWallet.value = false
    return
  }
  try {
    const portfolioService = usePortfolioService()
    const resp = await portfolioService.getPositions()
    hasWallet.value = (resp?.positions?.length || 0) > 0
  } catch {
    // 401 / network failure → assume empty so the import card surfaces.
    hasWallet.value = false
  }
}
onMounted(loadHasWallet)

// ============================================================
// Single-click portfolio import from the home dashboard
// ============================================================
// User picks an XLSX in the import card → we build a ChatAttachment,
// force MAX tier, dispatch the chat send with a pre-filled prompt.
// The chat-service auto-import detection (filename match
// `/posicao.*\.xlsx|carteira.*\.xlsx/i`) catches it and runs the
// full import_portfolio flow without the user having to type or
// confirm anything.
async function onStartImport(file: File) {
  if (!authStore.isAuthenticated) {
    redirectToLogin()
    return
  }
  try {
    // Read file as base64 (binary attachment).
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    const chunkSize = 0x8000
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize)
      binary += String.fromCharCode.apply(
        null,
        Array.from(chunk) as unknown as number[],
      )
    }
    const base64 = btoa(binary)

    const attachment: ChatAttachment = {
      id: `cei-${Date.now()}`,
      name: file.name,
      mime:
        file.type ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: file.size,
      kind: 'binary',
      content: base64,
    }

    // Force MAX so the agent runs full enrichment + raio-x analysis.
    if (tier.value !== 'max') tier.value = 'max'

    void chat
      .send({
        text: 'Importei minha carteira do CEI. Faz o raio-x completo: classifica os ativos, monta as 9 dimensões, identifica forças e riscos, sugere ajustes. Salva tudo.',
        attachments: [attachment],
      })
      .then(refreshSessionList)
      .then(() => { hasWallet.value = true })
  } catch (e) {
    console.error('Failed to read CEI file', e)
  }
}

async function onSelectSession(id: string) {
  // CRITICAL: if a stream is in flight, abort it before swapping
  // sessions. Switching mid-stream leaves the SSE reader trying to
  // mutate a message that's about to be replaced by loadSession() —
  // which corrupts the new conversation (the still-running tool
  // events from the OLD turn land on the NEW history). Calling
  // stop() flips the AbortController and the stream cleans up.
  if (chat.isStreaming.value) {
    chat.stop()
  }
  // Clear local UI state for the previous session so we don't carry
  // over stale "pending decision" cards or in-flight forms.
  await chat.loadSession(id)
  sidebarOpen.value = false
}

async function onDeleteSession(id: string) {
  try {
    await $fetch(`/api/chat/sessions/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders(), ...chatClientIdHeaders() },
    })
    await refreshSessionList()
    if (chat.sessionId.value === id) chat.reset()
  } catch {
    /* ignore */
  }
}

function onOpenArtifact(artifact: ChatArtifact) {
  activeArtifact.value = artifact
  artifactOpen.value = true
}

function onCloseArtifact() {
  artifactOpen.value = false
  activeArtifact.value = null
}

function redirectToLogin() {
  navigateTo('/auth/login?redirect=/help')
}

// Showcase chips — preview of what the chat does. Mirrors the MAX
// starter chips so the unauthenticated visitor sees the full
// product surface they're locked out of, not generic copy.
const showcase = [
  { question: 'Monte uma carteira para R$ 500 mil em 15 anos', icon: 'i-lucide-layers' },
  { question: 'Stress test: minha carteira aguenta crash do S&P 500?', icon: 'i-lucide-shield-alert' },
  { question: 'Compare PETR4, VALE3 e ITUB4 em valuation e dividendos', icon: 'i-lucide-bar-chart-3' },
  { question: 'R$ 10 mi em 18 anos: que CAGR exige? É factível?', icon: 'i-lucide-target' },
] as const

/**
 * Returns Authorization: Bearer ${token} when the user is logged in.
 * Forwarded to the chat-service so identity is resolved against
 * Laravel /api/auth/me. The page itself gates rendering on
 * authStore.isAuthenticated, but these calls also fire from inside
 * the gate so the helper stays trivially safe to call.
 */
function authHeaders(): Record<string, string> {
  return authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}
}

// ---- Auto-send `?q=` and `?intent=` -----------------------------
// QuickSearch and other entry points push the user here with `?q=…`
// (literal query) or `?intent=…` (semantic action — "rodar raio-x",
// "adicionar watchlist", etc.). Intents are mapped to a pre-formatted
// prompt so the agent immediately calls the right tool without the
// user having to type anything. Some intents also force MAX tier
// (raio-x analysis runs on Kimi K2-thinking; basic isn't enough).
//
// Intents whose `prompt` is `null` only need to land on the chat
// surface (e.g. file-import — the user still has to attach the
// XLSX). Everything else dispatches automatically.
type IntentSpec = {
  prompt: string | null
  tier?: 'basic' | 'max'
}
const INTENT_MAP: Record<string, IntentSpec> = {
  // Both intents trigger `import_portfolio({mode:'reanalyze'})` on the
  // chat-service side. The keywords below ("rodar análise", "fazer
  // raio-x") match the patterns wired in `llm/prompts/base.ts` so the
  // LLM doesn't ask the user for the XLSX again — it reuses the
  // already-imported carteira and only reruns the analysis pipeline.
  'analyze-portfolio': {
    prompt:
      'Quero rodar análise completa da minha carteira agora — fazer o raio-x. Pega as posições já importadas, classifica os ativos, monta as 9 dimensões (concentração, qualidade, valuation, dividendos, geografia, macro, etc.), identifica forças e riscos principais, sugere ajustes prioritários e salva o snapshot.',
    tier: 'max',
  },
  'reanalyze-portfolio': {
    prompt:
      'Reanalisar minha carteira agora — fazer raio-x novamente, atualizar análise. Pega o snapshot mais recente das posições, roda o pipeline com preços e dados atuais, salva por cima do snapshot anterior.',
    tier: 'max',
  },
  'portfolio-review': {
    prompt:
      'Faz uma revisão rápida da minha carteira: posições atuais, alertas em aberto, e 1-2 ajustes prioritários se houver.',
  },
  'add-watchlist': {
    prompt:
      'Quero adicionar ativos à minha watchlist. Olha minha carteira e me sugere 3-5 tickers que faria sentido acompanhar (correlação útil, complemento de classe ou geografia, ou potencial de valuation). Lista os candidatos com tese curta de cada um.',
  },
  'set-goal': {
    prompt:
      'Quero definir uma nova meta financeira. Abre o formulário guiado pra eu preencher.',
  },
  // No-prompt intents — just bring the user to the chat. Useful when
  // the action requires the user to attach a file or type something.
  'import-portfolio': { prompt: null },
}

async function runIntent(intent: string): Promise<boolean> {
  const spec = INTENT_MAP[intent]
  if (!spec) return false
  if (spec.tier && tier.value !== spec.tier) tier.value = spec.tier
  if (!spec.prompt) return true // landed only — caller already cleared the URL
  void chat.send(spec.prompt).then(refreshSessionList)
  return true
}

onMounted(async () => {
  if (!authStore.isAuthenticated) return
  await refreshSessionList()
  const q = String(route.query.q ?? '').trim()
  const intent = String(route.query.intent ?? '').trim()
  if (q) {
    window.history.replaceState({}, '', '/help')
    void chat.send(q).then(refreshSessionList)
    return
  }
  if (intent) {
    window.history.replaceState({}, '', '/help')
    await runIntent(intent)
  }
})

/**
 * `MaxFeatureChip` (rendered in chat answers when Basic refuses a
 * MAX-only feature) dispatches this CustomEvent on click. We:
 *   1. Switch the tier picker to MAX immediately so the badge
 *      reflects the new state.
 *   2. Re-send the user's previous message so the gated feature
 *      gets executed at the right tier without the user having to
 *      retype.
 *
 * Listening on `window` is the simplest way to bridge a chip that's
 * mounted via createVNode + render (deep inside the markdown) back
 * to the page-level state without threading callbacks through the
 * composable chain.
 */
function handleRequestMax() {
  if (tier.value !== 'max') tier.value = 'max'
  // Find the most recent user message in the thread and replay it.
  const msgs = chat.messages.value
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i]
    if (m && m.role === 'user' && typeof m.content === 'string' && m.content.trim()) {
      void chat.send(m.content).then(refreshSessionList)
      return
    }
  }
}

onMounted(() => {
  if (typeof window === 'undefined') return
  window.addEventListener('redentia:request-max', handleRequestMax as EventListener)
})
onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('redentia:request-max', handleRequestMax as EventListener)
})

watch(
  () => route.query.q,
  (q) => {
    if (!authStore.isAuthenticated) return
    if (typeof q === 'string' && q.trim()) {
      window.history.replaceState({}, '', '/help')
      void chat.send(q).then(refreshSessionList)
    }
  },
)

// Same idea for `?intent=` — covers the case where the user is
// already on /help (e.g. came back to a previous tab) and clicks a
// "Rodar análise" / "Reanalisar" link from /wallet which only changes
// the query string. Without this watch, useRoute() updates but
// nothing fires until a hard reload.
watch(
  () => route.query.intent,
  async (intent) => {
    if (!authStore.isAuthenticated) return
    if (typeof intent === 'string' && intent.trim()) {
      window.history.replaceState({}, '', '/help')
      await runIntent(intent.trim())
    }
  },
)

// ---- Goals + Decisions handlers ----------------------------------
async function onSelectGoal(goal: { id: string }) {
  // Clicking a goal in the sidebar opens the detail drawer. Anchoring
  // the conversation to a goal happens via an explicit "Ancorar nesta
  // conversa" button inside the drawer (not yet wired — short-cut: if
  // the conversation has no goal anchored, anchor it on click; if it
  // already has one, just open detail).
  goalDetailId.value = goal.id
  goalDetailOpen.value = true

  const sid = chat.sessionId.value
  if (sid && !activeGoalId.value) {
    try {
      await linkSession(goal.id, sid)
      sessionList.value = sessionList.value.map((s) =>
        s.id === sid ? { ...s, goalId: goal.id } : s,
      )
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[help] link goal failed', err)
    }
  }
}

function closeGoalDetail() {
  goalDetailOpen.value = false
  // Keep `goalDetailId` until close transition finishes so the drawer
  // doesn't flash empty during the slide-out animation.
  setTimeout(() => {
    if (!goalDetailOpen.value) goalDetailId.value = null
  }, 320)
}

function onGoalArchived(goalId: string) {
  // If the archived goal was anchored to the active session, drop the
  // local anchor immediately so the badge disappears without waiting
  // for a refresh.
  sessionList.value = sessionList.value.map((s) =>
    s.goalId === goalId ? { ...s, goalId: null } : s,
  )
}

function openGoalDetail(goalId: string) {
  goalDetailId.value = goalId
  goalDetailOpen.value = true
}

async function onUnlinkGoal() {
  const sid = chat.sessionId.value
  const gid = activeGoalId.value
  if (!sid || !gid) return
  try {
    await unlinkSession(gid, sid)
    sessionList.value = sessionList.value.map((s) =>
      s.id === sid ? { ...s, goalId: null } : s,
    )
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[help] unlink goal failed', err)
  }
}

async function onGoalCreated(goal: { id: string }) {
  await refreshGoals()
  // If there's an active session, anchor immediately so the badge
  // shows up without an extra click.
  if (chat.sessionId.value) {
    await onSelectGoal({ id: goal.id })
  }
}

function onSelectDecision(d: { id: string; sessionId: string | null }) {
  // Click on a decision row in the sidebar opens the detail drawer.
  // Jump-to-session happens via the drawer's "Abrir conversa" button —
  // single-click jump-to-session was confusing when the user just
  // wanted to read the thesis without losing the current chat.
  decisionDetailId.value = d.id
  decisionDetailOpen.value = true
}

function closeDecisionDetail() {
  decisionDetailOpen.value = false
  setTimeout(() => {
    if (!decisionDetailOpen.value) decisionDetailId.value = null
  }, 320)
}

function onDecisionRemoved(_id: string) {
  // Decision is already gone from the cache (composable handled it).
  // Refresh sessionList in case the active session showed a card that
  // referenced this decision so it disappears too.
  void refreshSessionList()
}

async function onJumpToDecisionSession(sessionId: string) {
  closeDecisionDetail()
  // Reuse the standard session-switch path so the in-flight stream
  // (if any) gets aborted cleanly before loading the new conversation.
  await onSelectSession(sessionId)
}

// ---- Watchlist + alerts handlers --------------------------------
const watchlistState = useWatchlist()
const alertsState = useAlerts()

// ---- Audit drawer handlers --------------------------------------
function onOpenPanel(
  section: 'goals' | 'decisions' | 'watchlist' | 'alerts' | 'memory' | 'activity' = 'goals',
) {
  // The audit panel no longer hosts an Alertas section — clicks
  // from the sidebar's Alertas counter are redirected to the
  // notifications drawer.
  if (section === 'alerts') {
    notificationsOpen.value = true
    return
  }
  panelInitialSection.value = section
  panelOpen.value = true
}

function onNewGoalFromPanel() {
  panelOpen.value = false
  goalSetupOpen.value = true
}

function onSelectGoalFromPanel(goal: { id: string }) {
  panelOpen.value = false
  // Same behaviour as the old sidebar click: open the goal detail
  // drawer; if the active session has no goal, anchor it.
  void onSelectGoal(goal)
}

function onSelectDecisionFromPanel(decision: { id: string; sessionId: string | null }) {
  panelOpen.value = false
  decisionDetailId.value = decision.id
  decisionDetailOpen.value = true
}

/**
 * Smart-action shortcut from any audit card (Repensar tese, Achar
 * caminhos para meta inviável, Revisar watch, Contraproposta, …).
 * Closes the drawer + dispatches the pre-built prompt as a regular
 * user turn so the answer streams in the active conversation.
 */
function onChatPromptFromPanel(text: string) {
  panelOpen.value = false
  if (!authStore.isAuthenticated || !text.trim()) return
  void chat.send(text)
}

function onSelectAlertFromBell(alert: { id: string; ticker: string | null; sessionId: string | null }) {
  notificationsOpen.value = false
  void alertsState.markRead(alert.id)
  if (alert.sessionId) {
    void onSelectSession(alert.sessionId)
    return
  }
  if (alert.ticker) {
    void chat.send(
      `Recebi um alerta de watchlist para ${alert.ticker}. Pode me explicar o que mudou e se devo agir?`,
    )
  }
}

function onSelectAlertInline(alert: { id: string; ticker: string | null }) {
  // Inline AlertCard click — same behaviour as sidebar minus session
  // jump (we're already in the source session by definition).
  void alertsState.markRead(alert.id)
  if (alert.ticker) {
    void chat.send(
      `Vamos olhar de perto ${alert.ticker} — o alerta acabou de disparar. Análise rápida.`,
    )
  }
}

function onDismissAlert(id: string) {
  void alertsState.dismiss(id)
}

// ---- Action bar handlers ----------------------------------------
/**
 * "Regenerar" clicked under an answer. Drops the last assistant
 * turn from the local thread and re-fires the preceding user
 * question — the new turn replaces the old one. Backend has no
 * dedicated regenerate endpoint; we just resend the same prose.
 */
async function onRegenerate(_messageId: string): Promise<void> {
  if (chat.isStreaming.value) return
  await chat.regenerateLast()
  await refreshSessionList()
}

/**
 * "Editar pergunta" clicked on the last user message. Strips the
 * question (and its assistant reply, if any) from the thread,
 * then prefills the composer with the original content + focuses
 * the textarea. The user re-fires manually after editing.
 */
function onEditQuestion(payload: { messageId: string; content: string }): void {
  if (chat.isStreaming.value) return
  // Strip locally so the composer becomes the source of truth for
  // the next turn. `popLastUserTurn` is idempotent — calling it
  // when the thread doesn't end on a user-then-assistant pair is
  // a no-op, so the explicit message id from the event is the
  // ground truth even if the composable's internal state lags.
  const stripped = chat.popLastUserTurn()
  const prefill = stripped ?? payload.content
  composerRef.value?.setValue(prefill)
  // Wait a tick so the textarea autosizes before focus — focus
  // before autosize would put the caret at the wrong line on
  // multi-line questions.
  void nextTick(() => {
    composerRef.value?.focus()
  })
}

// ---- Pre-execution co-pilot handlers ----------------------------
function onConfirmExecution(decisionId: string) {
  // The user has checked all critical items and clicked "Executei".
  // We don't need to call the tool ourselves — the cleaner UX is to
  // let the agent confirm, persist the snapshot, and write the
  // memory entry. We just nudge it with a structured message.
  if (!authStore.isAuthenticated) return
  void chat.send(
    `Confirmo: executei a operação. Por favor, chame confirm_execution para a decisão ${decisionId}.`,
  )
}

function onCancelPreExecute(_decisionId: string) {
  // User backed out — no backend mutation needed. The decision
  // stays in `pending` so they can retry later. Just close the
  // card by removing it from the message client-side.
  // (Actually keeping it is fine; the user can re-check next time.)
}

// ---- Action proposal handlers ----------------------------------
// Triggered when the user clicks Confirmar / Pular on an inline
// ActionProposalCard (rendered for every `action.propose` SSE event).
// Confirmar → flip the card state + send a structured follow-up
// telling the agent to call the underlying tool with the original
// args on the next turn. Pular → flip + send a brief acknowledgement
// so the agent doesn't repropose the same action mid-conversation.
function onConfirmProposal(proposal: ChatProposalData) {
  if (!authStore.isAuthenticated) return
  chat.markProposal(proposal.proposalId, 'confirmed')
  const argsJson = JSON.stringify(proposal.args ?? {})
  void chat.send(
    `✓ Confirmado: chame ${proposal.kind} com ${argsJson}. (proposta ${proposal.proposalId.slice(0, 8)})`,
  )
}

function onSkipProposal(proposal: ChatProposalData) {
  chat.markProposal(proposal.proposalId, 'skipped')
  if (!authStore.isAuthenticated) return
  void chat.send(
    `✗ Pulei a proposta ${proposal.proposalId.slice(0, 8)} (${proposal.kind}). Não precisa repetir essa sugestão agora.`,
  )
}

// Refresh goals + decisions + watchlist + alerts caches whenever
// auth flips on so logged-in users see state without extra nav.
watch(
  () => authStore.isAuthenticated,
  (auth) => {
    if (auth) {
      void refreshGoals()
      void refreshDecisions()
      void watchlistState.refresh()
      void alertsState.refresh()
    }
  },
  { immediate: true },
)
</script>

<style scoped>
/* ============================================================
   Premium hero card — animated gradient ring (rotating conic).
   Same visual vocabulary as the MAX composer so the unauth
   experience reads as a premium product preview, not an empty
   state. Pure CSS, no JS, GPU-friendly.
   ============================================================ */
.chat-unauth-card {
  position: relative;
  isolation: isolate;
}

.chat-unauth-card::before {
  content: '';
  position: absolute;
  inset: -1.5px;
  border-radius: inherit;
  padding: 1.5px;
  background: conic-gradient(
    from var(--unauth-ring-angle, 0deg),
    var(--ring-c1, currentColor),
    var(--ring-c2, currentColor),
    var(--ring-c3, currentColor),
    var(--ring-c2, currentColor),
    var(--ring-c1, currentColor)
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  z-index: -1;
  animation: chat-unauth-ring-rotate 8s linear infinite;
  pointer-events: none;
  opacity: 0.85;
}

@keyframes chat-unauth-ring-rotate {
  from { --unauth-ring-angle: 0deg; }
  to   { --unauth-ring-angle: 360deg; }
}

@property --unauth-ring-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

/* Top accent line — gentle shine that pans across the page top */
.chat-unauth-topline {
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--topline-c, currentColor) 30%,
    var(--topline-c, currentColor) 70%,
    transparent 100%
  );
  background-size: 220% 100%;
  background-position: -100% 0;
  animation: chat-unauth-topline-shine 9s ease-in-out infinite;
  opacity: 0.55;
}

@keyframes chat-unauth-topline-shine {
  0%, 100% { background-position: -100% 0; }
  50%      { background-position: 200% 0; }
}

/* CTA button hover/active — explicit transitions, no `transition: all` */
.chat-unauth-cta:hover {
  filter: brightness(1.07) saturate(1.1);
  transform: translateY(-1px);
}
.chat-unauth-cta:active {
  transform: translateY(0);
}

/* Showcase chip subtle hover */
.chat-unauth-chip {
  transition: background-color 200ms ease, border-color 200ms ease;
}
.chat-unauth-chip:hover {
  background-color: color-mix(in srgb, currentColor 5%, transparent) !important;
  border-color: color-mix(in srgb, currentColor 14%, transparent) !important;
}

/* Focus-visible for the CTA — the only interactive element here */
.chat-unauth-cta:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--brand-primary, currentColor) 80%, white);
  outline-offset: 4px;
  border-radius: 9999px;
}

/* touch-action: manipulation on every interactive */
.chat-unauth-cta,
.chat-unauth-chip {
  touch-action: manipulation;
}

/* Honor reduced motion — kill the rotation + shimmer */
@media (prefers-reduced-motion: reduce) {
  .chat-unauth-card::before,
  .chat-unauth-topline {
    animation: none !important;
  }
  .chat-unauth-cta:hover {
    transform: none;
  }
}

/*
  Scroll-to-bottom FAB. Rendered as a sibling of <ChatV2Input>
  inside the chat column wrapper (`relative flex h-full flex-col`).
  Both elements use the same horizontal anchor — `left: 50%` +
  `translateX(-50%)` — so the FAB lines up perfectly with the
  composer pill's center, regardless of sidebar width or screen
  size.
  `bottom: 9rem` lands ~2rem above the composer pill (which sits
  at bottom:0 with ~6-7rem of pill height + safe-area padding).
  z-index 35 sits above the composer (z-30) so a hover on the
  FAB is always clickable but only covers a 44px circle of the
  pill area.
*/
.chat-scroll-fab {
  position: absolute;
  bottom: 9rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 35;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--brand-surface) 92%, transparent);
  color: var(--brand-text);
  border: 1px solid color-mix(in srgb, var(--brand-border) 60%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow:
    0 12px 28px -14px color-mix(in srgb, var(--brand-primary) 30%, transparent),
    0 4px 10px -6px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  pointer-events: auto;
  transition:
    background-color 160ms ease-out,
    border-color 160ms ease-out,
    transform 160ms ease-out,
    box-shadow 160ms ease-out;
}

.chat-scroll-fab:hover {
  background: var(--brand-surface);
  border-color: color-mix(in srgb, var(--brand-primary) 45%, transparent);
  box-shadow:
    0 16px 36px -16px color-mix(in srgb, var(--brand-primary) 45%, transparent),
    0 6px 12px -8px rgba(0, 0, 0, 0.22);
  transform: translateX(-50%) translateY(-2px);
}

.chat-scroll-fab:active {
  transform: translateX(-50%) translateY(0);
}

.chat-scroll-fab:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 3px;
}

.chat-fab-enter-active,
.chat-fab-leave-active {
  transition:
    opacity 200ms ease,
    transform 220ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.chat-fab-enter-from,
.chat-fab-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}

@media (prefers-reduced-motion: reduce) {
  .chat-scroll-fab,
  .chat-fab-enter-active,
  .chat-fab-leave-active {
    transition: opacity 100ms;
  }
  .chat-fab-enter-from,
  .chat-fab-leave-to {
    transform: translateX(-50%);
  }
}
</style>

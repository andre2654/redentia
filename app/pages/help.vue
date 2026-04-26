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
  <!-- Unauthenticated: premium product preview matching the MAX
       chat visual identity. Animated gradient ring + halo + showcase
       chips + premium CTA. Stays inside the unauthenticated layout
       so SEO/header chrome is preserved. -->
  <NuxtLayout
    v-if="!authStore.isAuthenticated"
    name="unauthenticated"
    title="Assessoria com IA"
    :hide-footer="false"
  >
    <h1 class="sr-only">Assessoria com IA | {{ brand.name }}</h1>

    <div
      class="chat-unauth-stage relative flex min-h-[calc(100vh-10rem)] w-full items-center justify-center overflow-hidden px-5 py-12 md:px-8 md:py-16"
    >
      <!-- Ambient radial gradient — same visual vocabulary as the
           MAX chat shell. Decorative, aria-hidden. -->
      <div
        class="pointer-events-none absolute inset-0"
        :style="{
          background: `radial-gradient(ellipse 70% 45% at 50% 0%, color-mix(in srgb, ${brand.colors.primary} 18%, transparent) 0%, transparent 65%), radial-gradient(ellipse 60% 40% at 50% 100%, color-mix(in srgb, ${brand.colors.primary} 12%, transparent) 0%, transparent 65%)`,
        }"
        aria-hidden="true"
      />

      <!-- Animated top accent line — echoes the MAX layout's
           "you're inside premium" cue. -->
      <div
        class="chat-unauth-topline pointer-events-none absolute inset-x-0 top-0 h-[2px]"
        :style="{ '--topline-c': brand.colors.primary } as any"
        aria-hidden="true"
      />

      <!-- Hero card with animated gradient ring -->
      <article
        class="chat-unauth-card relative flex w-full max-w-2xl flex-col items-center gap-7 rounded-[28px] px-6 py-10 text-center backdrop-blur-md md:px-10 md:py-12"
        :style="{
          backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 92%, transparent)`,
          color: brand.colors.text,
          boxShadow: `0 24px 80px -24px color-mix(in srgb, ${brand.colors.primary} 35%, transparent), 0 0 0 1px color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
          '--ring-c1': brand.colors.primary,
          '--ring-c2': `color-mix(in srgb, ${brand.colors.primary} 30%, ${brand.colors.text})`,
          '--ring-c3': `color-mix(in srgb, ${brand.colors.primary} 80%, ${brand.colors.background})`,
        } as any"
      >
        <!-- MAX accent pill at top -->
        <span
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono-tab text-[10px] font-bold uppercase tracking-[0.2em]"
          :style="{
            background: `linear-gradient(135deg, ${brand.colors.primary} 0%, color-mix(in srgb, ${brand.colors.primary} 70%, ${brand.colors.text}) 100%)`,
            color: brand.colors.background,
            boxShadow: `0 6px 16px -4px color-mix(in srgb, ${brand.colors.primary} 50%, transparent)`,
          }"
        >
          <UIcon name="i-lucide-sparkles" class="size-3" aria-hidden="true" />
          Redentia MAX disponível
        </span>

        <!-- Brand lockup — full art -->
        <BrandLogo variant="full" mode="auto" class="h-10 w-auto md:h-12" />

        <!-- Heading + subtitle -->
        <div class="flex flex-col gap-3">
          <h2
            class="font-display text-[30px] font-semibold leading-[1.05] tracking-tight md:text-[42px]"
            :style="{ color: brand.colors.text }"
          >
            {{ brand.ai?.welcomeTitle ?? 'Conversar com a inteligência da Redentia' }}
          </h2>
          <p
            class="text-[14px] leading-relaxed md:text-[16px]"
            :style="{ color: brand.colors.textMuted }"
          >
            {{ brand.ai?.welcomeSubtitle ?? 'Análise multi-passo, validação cruzada, framework de carteira de 9 camadas. Cada número checado via tools antes de virar resposta.' }}
          </p>
        </div>

        <!-- Showcase chips — preview of what's behind the wall.
             role="list" + aria-hidden because they're not actionable
             when unauthenticated; the CTA below is the real entry. -->
        <ul
          class="grid w-full grid-cols-1 gap-2 md:grid-cols-2"
          aria-label="Exemplos do que você pode perguntar"
        >
          <li
            v-for="(q, i) in showcase"
            :key="i"
            class="chat-unauth-chip flex items-start gap-3 rounded-2xl px-4 py-3.5 text-left text-[13px] leading-snug md:text-[14px]"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 75%, transparent)`,
              border: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
              color: `color-mix(in srgb, ${brand.colors.text} 88%, transparent)`,
            }"
          >
            <UIcon
              :name="q.icon"
              class="mt-0.5 size-4 shrink-0"
              :style="{ color: brand.colors.primary }"
              aria-hidden="true"
            />
            <span class="min-w-0 flex-1">{{ q.question }}</span>
          </li>
        </ul>

        <!-- Primary CTA — gradient with sparkle + arrow.
             Real <button> for keyboard accessibility + focus-visible. -->
        <button
          type="button"
          class="chat-unauth-cta inline-flex items-center gap-2 rounded-full px-7 py-3 text-[15px] font-semibold transition-[transform,filter,box-shadow]"
          :style="{
            background: `linear-gradient(135deg, ${brand.colors.primary} 0%, color-mix(in srgb, ${brand.colors.primary} 70%, ${brand.colors.text}) 100%)`,
            color: brand.colors.background,
            boxShadow: `0 16px 32px -10px color-mix(in srgb, ${brand.colors.primary} 60%, transparent), inset 0 1px 0 0 color-mix(in srgb, white 30%, transparent)`,
          }"
          @click="redirectToLogin"
        >
          <UIcon name="i-lucide-sparkles" class="size-4" aria-hidden="true" />
          {{ brand.voice?.ctaPrimary ?? 'Entrar para conversar' }}
          <UIcon name="i-lucide-arrow-right" class="size-4" aria-hidden="true" />
        </button>

        <!-- Sub-line — reassurance, not boilerplate -->
        <p
          class="font-mono-tab text-[10.5px] uppercase tracking-[0.18em]"
          :style="{ color: `color-mix(in srgb, ${brand.colors.textMuted} 70%, transparent)` }"
        >
          {{ brand.ai?.ctaFeatures?.join(' · ') ?? 'Acesso gratuito · Sem cartão · Resposta em segundos' }}
        </p>
      </article>
    </div>
  </NuxtLayout>

  <!-- Authenticated: Perplexity-style takeover (no layout chrome) -->
  <ChatV2Layout
    v-else
    :sidebar-open="sidebarOpen"
    :artifact-open="artifactOpen"
    :tier="tier"
    @close-sidebar="sidebarOpen = false"
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

        <!-- Desktop close button (top-right) -->
        <NuxtLink
          to="/"
          class="absolute right-5 top-5 z-10 hidden size-9 items-center justify-center rounded-full transition-colors xl:flex"
          :style="{ color: brand.colors.textMuted }"
          aria-label="Fechar chat"
        >
          <UIcon name="i-lucide-x" class="size-4" />
        </NuxtLink>

        <!-- Thread or empty state -->
        <!-- Goal badge intentionally removed — the active goal is
             accessible via the Painel sidebar button + drawer; a
             separate pill on top of every conversation was redundant
             chrome. -->

        <ChatV2Thread
          v-if="chat.messages.value.length > 0"
          :messages="chat.messages.value"
          @send-followup="onSendFollowup"
          @open-artifact="onOpenArtifact"
          @confirm-execution="onConfirmExecution"
          @cancel-pre-execute="onCancelPreExecute"
          @select-alert="onSelectAlertInline"
          @dismiss-alert="onDismissAlert"
        />
        <ChatV2EmptyState
          v-else
          :tier="tier"
          @start="onStarterChip"
        />

        <!-- Composer -->
        <ChatV2Input
          v-model:tier="tier"
          :disabled="chat.isStreaming.value"
          :is-streaming="chat.isStreaming.value"
          :tier-locked="chat.messages.value.length > 0"
          @send="onSend"
          @stop="chat.stop"
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

  <!-- Painel drawer — single audit / overview surface for goals,
       decisions, watchlist, alerts, and the agent memory. Replaces
       the old four sidebar sections. -->
  <ChatV2PanelDrawer
    :open="panelOpen"
    :initial-tab="panelInitialTab"
    @close="panelOpen = false"
    @new-goal="onNewGoalFromPanel"
    @select-goal="onSelectGoalFromPanel"
    @select-decision="onSelectDecisionFromPanel"
    @select-alert="onSelectAlertFromPanel"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { ChatArtifact, ChatAttachment } from '~/composables/useChatStream'

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
const sidebarOpen = ref(false)
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
// Painel drawer — consolidated overview / audit. Stays out of the
// sidebar; opens on demand. `panelInitialTab` lets us route the user
// straight to a relevant tab (e.g. open Memória from a "ver minha
// memória" follow-up button — TODO).
const panelOpen = ref(false)
const panelInitialTab = ref<'goals' | 'decisions' | 'watchlist' | 'alerts' | 'memory'>('goals')
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

function onStarterChip(message: string) {
  if (!authStore.isAuthenticated) {
    redirectToLogin()
    return
  }
  void chat.send(message).then(refreshSessionList)
}

async function onNewConversation() {
  chat.reset()
  sidebarOpen.value = false
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

// ---- Auto-send `?q=` --------------------------------------------
// QuickSearch and other entry points push the user here with the
// query in the URL. If logged in, dispatch immediately. If not,
// the auth gate above shows; the query is preserved through the
// login redirect (via `redirect=/help` keeping the original URL
// in history).
onMounted(async () => {
  if (!authStore.isAuthenticated) return
  await refreshSessionList()
  const q = String(route.query.q ?? '').trim()
  if (q) {
    window.history.replaceState({}, '', '/help')
    void chat.send(q).then(refreshSessionList)
  }
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

// ---- Painel drawer handlers ------------------------------------
function onOpenPanel() {
  // Default to the tab with pending items; otherwise Metas.
  const pendingDec = useDecisions().decisions.value.filter(
    (d) => d.status === 'pending',
  ).length
  const unreadAlerts = alertsState.alerts.value.filter((a) => a.readAt == null).length
  if (unreadAlerts > 0) panelInitialTab.value = 'alerts'
  else if (pendingDec > 0) panelInitialTab.value = 'decisions'
  else panelInitialTab.value = 'goals'
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

function onSelectAlertFromPanel(alert: { id: string; ticker: string | null; sessionId: string | null }) {
  panelOpen.value = false
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
</style>

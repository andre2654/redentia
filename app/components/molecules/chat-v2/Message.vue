<!--
  ChatV2Message — Perplexity-style turn rendering.

  Two halves:
    1) USER question — large heading at the top of the turn.
    2) ASSISTANT answer — sectioned: Fontes / Resposta / Sugestões.
       No bubbles. No avatars. Just typography + thin section labels.
-->
<template>
  <article class="chat-turn">
    <!-- USER — FORM RESPONSE (one-line pill, expandable) -->
    <div
      v-if="message.role === 'user' && message.meta?.kind === 'form_response'"
      class="chat-form-response inline-flex max-w-full flex-col gap-2"
    >
      <button
        type="button"
        class="chat-form-response-pill inline-flex max-w-fit items-center gap-2 self-start rounded-full px-3 py-1.5 text-[12.5px] transition-colors"
        :style="{
          backgroundColor: `color-mix(in srgb, var(--brand-surface) 60%, transparent)`,
          border: `1px solid color-mix(in srgb, var(--brand-border) 35%, transparent)`,
          color: 'var(--brand-text-muted)',
        }"
        @click="formResponseOpen = !formResponseOpen"
      >
        <UIcon
          name="i-lucide-check"
          class="size-3.5"
          :style="{ color: 'var(--brand-positive)' }"
        />
        <span class="font-mono-tab text-[10.5px] uppercase tracking-[0.16em]">
          Respostas enviadas{{ message.meta.fields ? ` · ${message.meta.fields.length}` : '' }}
        </span>
        <UIcon
          :name="formResponseOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-3 opacity-70"
        />
      </button>
      <ul
        v-if="formResponseOpen"
        class="chat-form-response-list flex flex-col gap-1 rounded-xl px-4 py-3"
        :style="{
          backgroundColor: `color-mix(in srgb, var(--brand-surface) 50%, transparent)`,
          border: `1px solid color-mix(in srgb, var(--brand-border) 30%, transparent)`,
        }"
      >
        <li
          v-for="f in (message.meta.fields ?? [])"
          :key="f.id"
          class="flex items-baseline gap-2 text-[12.5px]"
        >
          <span
            class="shrink-0"
            :style="{ color: 'var(--brand-text-muted)' }"
          >{{ f.label }}:</span>
          <span
            class="font-medium tabular-nums"
            :style="{ color: 'var(--brand-text)' }"
          >{{ f.value }}</span>
        </li>
      </ul>
    </div>

    <!-- USER — REGULAR QUESTION (heading style) -->
    <div
      v-else-if="message.role === 'user'"
      class="flex flex-col gap-3"
    >
      <!-- Attachments -->
      <ul
        v-if="message.meta?.attachments && message.meta.attachments.length > 0"
        class="flex flex-wrap gap-1.5"
        :aria-label="`${message.meta.attachments.length} arquivo(s) anexado(s)`"
      >
        <li
          v-for="att in message.meta.attachments"
          :key="att.id ?? att.name"
          class="chat-attach-chip-static inline-flex max-w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-[12px]"
          :style="{
            backgroundColor: `color-mix(in srgb, var(--brand-surface) 70%, transparent)`,
            border: `1px solid color-mix(in srgb, var(--brand-border) 45%, transparent)`,
            color: 'var(--brand-text)',
          }"
        >
          <UIcon
            :name="attachIconStatic(att)"
            class="size-3.5 shrink-0"
            :style="{ color: 'var(--brand-primary)' }"
          />
          <span class="max-w-[200px] truncate">{{ att.name }}</span>
          <span
            class="shrink-0 font-mono-tab text-[10px] uppercase tracking-[0.12em]"
            :style="{ color: 'var(--brand-text-muted)' }"
          >
            {{ humanSizeStatic(att.size) }}
          </span>
        </li>
      </ul>
      <div
        v-if="message.content"
        class="chat-question font-display text-[26px] font-semibold leading-tight tracking-tight md:text-[32px]"
        :style="{ color: 'var(--brand-text)' }"
      >
        {{ message.content }}
      </div>
    </div>

    <!-- ASSISTANT TURN -->
    <div v-else class="flex flex-col gap-5 md:gap-6">
      <!-- ===== Tool hover-stack (replaces ActionGroupList) =====
           Compact one-row strip of overlapping circular avatars (one
           per inline tool call). Hover any avatar to swap the status
           label; click to expand a detail row with args + result
           preview. Tools that own a dedicated card (decisions,
           scenarios, forms, artifacts) are filtered out and render
           further down. -->
      <ChatV2ToolStack
        v-if="message.toolCalls.length > 0"
        :tool-calls="message.toolCalls"
      />

      <!-- Citations are still surfaced through SourceRail elsewhere
           when present; we no longer wrap them inside the research
           panel. (Citations array carries `[N]` chip metadata; the
           old ResearchPanel had a "Fontes" tab that is now redundant
           because each citation is already an inline chip in the
           markdown.) -->

      <!-- ===== Resposta ===== -->
      <section v-if="message.content || message.status === 'streaming'">
        <ChatV2SectionLabel
          icon="i-lucide-sparkles"
          label="Resposta"
          :badge="message.tierLabel ?? tierLabelFromTier(message.tier)"
        />
        <div
          ref="answerRef"
          class="chat-answer text-[16.5px] leading-[1.7]"
          :style="{ color: 'var(--brand-text)' }"
        >
          <!-- Cold-start status ticker — between "user sent" and "first
               reasoning / tool / content chunk arrives" the answer area
               used to show only a blinking yellow cursor, which read
               as "frozen". Now we show:
                 - pulsing amber dot
                 - status text that auto-cycles ("Lendo IBOV…" →
                   "Cruzando macro…" → "Sintetizando…")
                 - elapsed-time counter on the right (transparency)
                 - 3 skeleton lines hinting at where the answer lands
               Disappears the moment anything streams. -->
          <div
            v-if="isWaitingForFirstChunk"
            class="chat-thinking-inline flex flex-col gap-3 py-1"
            role="status"
            aria-live="polite"
          >
            <div class="flex items-center gap-3">
              <span class="relative inline-flex size-2 shrink-0">
                <span
                  class="chat-thinking-pulse absolute inline-flex h-full w-full rounded-full"
                  :style="{ backgroundColor: 'var(--brand-primary)' }"
                  aria-hidden="true"
                />
                <span
                  class="relative inline-flex size-2 rounded-full"
                  :style="{ backgroundColor: 'var(--brand-primary)' }"
                  aria-hidden="true"
                />
              </span>
              <Transition name="chat-status-text" mode="out-in">
                <span
                  :key="tickerKey"
                  class="chat-status-breathe min-w-0 flex-1 truncate text-[13px] font-medium"
                  :style="{ color: 'var(--brand-text)' }"
                >{{ tickerText }}</span>
              </Transition>
              <span
                class="ml-auto font-mono-tab text-[10.5px] tabular-nums"
                :style="{ color: 'var(--brand-text-muted)' }"
              >{{ elapsedFmt }}</span>
            </div>
            <div class="flex flex-col gap-2">
              <span
                v-for="(w, i) in [85, 70, 92]"
                :key="`skel-${i}`"
                class="chat-thinking-skel block h-[10px] rounded-full"
                :style="{
                  width: `${w}%`,
                  backgroundColor: `color-mix(in srgb, var(--brand-text) 6%, transparent)`,
                  animationDelay: `${i * 120}ms`,
                }"
              />
            </div>
          </div>
          <ChatV2StreamingText
            v-else
            :content="renderedMarkdown"
            :streaming="message.status === 'streaming'"
          />
        </div>
      </section>

      <!-- ===== Inline forms (rendered when ask_form fires) ===== -->
      <section v-if="(message.forms ?? []).length > 0" class="flex flex-col gap-3">
        <ChatV2InlineForm
          v-for="form in (message.forms ?? [])"
          :key="form.formId"
          :form="form"
          @submit="$emit('send-followup', $event)"
        />
      </section>

      <!-- ===== Decision cards (one per register_decision call) ===== -->
      <section
        v-if="(message.decisions ?? []).length > 0"
        class="flex flex-col gap-3"
        aria-label="Recomendações registradas"
      >
        <ChatV2DecisionCard
          v-for="d in (message.decisions ?? [])"
          :key="d.decisionId"
          :decision="d"
          @ask-alt="$emit('send-followup', `Pode propor uma alternativa para a recomendação de ${d.type === 'sell' ? 'venda' : d.type === 'buy' ? 'compra' : 'rebalance'} de ${d.ticker ?? 'ativo'}? Mantém a tese mas tente outro caminho.`)"
        />
      </section>

      <!-- ===== Pre-execution checklists (co-piloto) ===== -->
      <section
        v-if="(message.preExecutes ?? []).length > 0"
        class="flex flex-col gap-3"
        aria-label="Checklists pré-execução"
      >
        <ChatV2PreExecuteCard
          v-for="p in (message.preExecutes ?? [])"
          :key="p.decisionId"
          :data="p"
          @confirm="(id) => $emit('confirm-execution', id)"
          @cancel="(id) => $emit('cancel-pre-execute', id)"
        />
      </section>

      <!-- ===== What-if scenario cards ===== -->
      <section
        v-if="(message.scenarios ?? []).length > 0"
        class="flex flex-col gap-3"
        aria-label="Cenários simulados"
      >
        <ChatV2ScenarioCard
          v-for="(s, idx) in (message.scenarios ?? [])"
          :key="`${s.goalId ?? 'free'}-${idx}`"
          :data="s"
        />
      </section>

      <!-- Action proposals: rendered INLINE inside the prose by
           useProposalProse (replaces `{{propose}}` markers with
           ActionProposalChip components). If the model forgets the
           marker, the composable appends a fallback chip row at the
           end of the answer wrapper. No block-level card here — the
           user explicitly wanted the affordance to feel as light as a
           ticker chip. -->

      <!-- ===== Watchlist alerts (inline) ===== -->
      <section
        v-if="(message.alerts ?? []).length > 0"
        class="flex flex-col gap-2"
        aria-label="Alertas"
      >
        <ChatV2AlertCard
          v-for="a in (message.alerts ?? [])"
          :key="a.alertId"
          :alert="alertToFull(a)"
          @select="(full) => $emit('select-alert', full)"
          @dismiss="(id) => $emit('dismiss-alert', id)"
        />
      </section>

      <!-- ===== Asset cards ===== -->
      <section v-if="message.assetCards.length > 0" class="flex flex-col gap-2">
        <ChatV2AssetCard
          v-for="card in message.assetCards"
          :key="card.ticker"
          :card="card"
        />
      </section>

      <!-- ===== Artifacts (cards) ===== -->
      <section v-if="message.artifacts.length > 0" class="flex flex-col gap-2">
        <button
          v-for="art in message.artifacts"
          :key="art.id"
          type="button"
          class="chat-artifact-card group flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-all"
          :style="{
            backgroundColor: `color-mix(in srgb, var(--brand-surface) 60%, transparent)`,
            border: `1px solid color-mix(in srgb, var(--brand-border) 35%, transparent)`,
            color: 'var(--brand-text)',
          }"
          @click="$emit('open-artifact', art)"
        >
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-xl"
            :style="{
              backgroundColor: `color-mix(in srgb, var(--brand-primary) 16%, transparent)`,
              color: 'var(--brand-primary)',
            }"
          >
            <UIcon :name="artifactIcon(art.type)" class="size-5" />
          </span>
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="truncate text-[14px] font-semibold">{{ art.title }}</span>
            <span
              class="font-mono-tab text-[10.5px] uppercase tracking-[0.16em]"
              :style="{ color: 'var(--brand-text-muted)' }"
            >
              {{ artifactLabel(art.type) }}{{ art.filename ? ' · ' + art.filename : '' }}
            </span>
          </div>
          <span
            v-if="art.downloadUrl"
            class="font-mono-tab text-[11px] font-semibold uppercase tracking-[0.12em]"
            :style="{ color: 'var(--brand-primary)' }"
          >
            Abrir →
          </span>
        </button>
      </section>

      <!-- ===== Sugestões (Related) ===== -->
      <section
        v-if="isLast && message.followups && message.followups.length > 0 && message.status === 'complete'"
      >
        <ChatV2SectionLabel
          :icon="message.tier === 'max' ? 'i-lucide-sparkles' : 'i-lucide-list-plus'"
          :label="message.tier === 'max' ? 'Sugestões MAX' : 'Sugestões'"
        />
        <ChatV2FollowupChips
          :suggestions="message.followups"
          :tier="message.tier"
          @select="$emit('send-followup', $event)"
        />
      </section>

      <!-- Error -->
      <div
        v-if="message.status === 'error'"
        class="rounded-2xl px-4 py-3 text-[13px]"
        :style="{
          border: `1px solid color-mix(in srgb, var(--brand-negative) 40%, transparent)`,
          backgroundColor: `color-mix(in srgb, var(--brand-negative) 8%, transparent)`,
          color: 'var(--brand-negative)',
        }"
      >
        {{ message.error ?? 'Erro ao gerar resposta. Tente novamente.' }}
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { marked } from 'marked'
import type {
  ChatMessage,
  ChatArtifact,
  ChatAlertData,
  ChatProposalData,
} from '~/composables/useChatStream'
import type { ChatAlert } from '~/composables/useAlerts'
import { ensureTickerProseSetup, useTickerProse } from '~/composables/useTickerProse'
import { ensureProposalProseSetup, useProposalProse } from '~/composables/useProposalProse'
import { ensureChartProseSetup, useChartProse } from '~/composables/useChartProse'
import { ensureMaxFeatureProseSetup, useMaxFeatureProse } from '~/composables/useMaxFeatureProse'

// Register the marked ticker extension once (idempotent). Must run
// before the first `renderMarkdown` call so PETR4 / VALE3 / KNRI11
// in the prose are wrapped as `.ticker-mount` placeholders.
ensureTickerProseSetup()
// Same idea for `{{propose}}` markers — replaced by inline
// ActionProposalChip components after the markdown is rendered.
ensureProposalProseSetup()
// And `{{chart:TICKER:PERIOD}}` — replaced by live <InlineChart>.
ensureChartProseSetup()
// And `{{max:LABEL}}` — Basic mode renders this in place of features
// gated behind MAX (chart, watchlist, scenarios, decisions, full
// analysis, etc). Click → switches tier + re-asks.
ensureMaxFeatureProseSetup()

// DOMPurify sanitization runs **only on the client**. The
// `isomorphic-dompurify` package transitively pulls in `jsdom` for
// SSR — and on Vercel's serverless runtime jsdom fails to load
// because parse5 is ESM-only and jsdom uses require(). Result was
// a hard 500 every time someone refreshed `/help`.
//
// Strategy:
//   1. SSR + first hydrate frame: render markdown WITHOUT sanitization.
//      Content is generated by our own backend (the LLM is sandboxed),
//      not arbitrary user-pasted HTML, so the practical XSS surface is
//      tiny.
//   2. Client (after mount): dynamically import DOMPurify and re-render
//      the markdown through it. The watcher below bumps a counter that
//      the computed depends on so we get a re-render once the sanitizer
//      is ready.
let domPurify: { sanitize: (s: string, opts?: Record<string, unknown>) => string } | null = null
const sanitizerReady = ref(0)

if (import.meta.client) {
  // Lazy — happens after hydration, so it can't break SSR.
  void import('isomorphic-dompurify')
    .then((mod) => {
      domPurify = mod.default
      sanitizerReady.value++
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('[Message] DOMPurify failed to load — running unsanitized', err)
    })
}

const props = defineProps<{
  message: ChatMessage
  isLast: boolean
}>()

const emit = defineEmits<{
  'send-followup': [message: string]
  'open-artifact': [artifact: ChatArtifact]
  'confirm-execution': [decisionId: string]
  'cancel-pre-execute': [decisionId: string]
  'select-alert': [alert: ChatAlert]
  'dismiss-alert': [id: string]
  'confirm-proposal': [proposal: ChatProposalData]
  'skip-proposal': [proposal: ChatProposalData]
}>()

/** Adapt the lightweight inline alert payload (from `alert.fired`) to
 *  the full ChatAlert shape that AlertCard expects. The inline event
 *  doesn't carry readAt/sessionId/createdAt — we synthesize them so
 *  the card renders without breaking the prop contract. */
function alertToFull(a: ChatAlertData): ChatAlert {
  return {
    id: a.alertId,
    source: a.source,
    kind: a.kind,
    severity: a.severity,
    ticker: a.ticker ?? null,
    title: a.title,
    body: a.body,
    data: a.data ?? {},
    sessionId: null,
    decisionId: null,
    readAt: null,
    createdAt: new Date().toISOString(),
  }
}

const brand = useBrand()

// User-form-response pill: collapsed by default, click to see all answers.
const formResponseOpen = ref(false)

/**
 * True between "user sent the message" and "first text content
 * chunk arrived". While true, the answer slot shows a status ticker
 * (pulsing dot + breathing curated text + elapsed timer + skeletons)
 * instead of an empty box.
 *
 * We deliberately do NOT check `toolCalls.length === 0` (MAX emits a
 * `synthesizing_analysis` tool.start at run-start) NOR `reasoning ===
 * ''` (Kimi K2-thinking streams reasoning_content first, before any
 * content). Both cases would silently hide the ticker and leave the
 * answer area blank for several seconds while the agent does work
 * behind the scenes. The reasoning is shown inside the floating
 * ThinkingIndicator above the composer; the curated breathing
 * status text belongs HERE in the answer slot. Both vanish only
 * once `content` actually starts streaming.
 */
const isWaitingForFirstChunk = computed(
  () =>
    props.message.status === 'streaming' &&
    !props.message.content,
)

// ---- Status ticker (cold-start "thinking" state) -------------------------
// Two-phase status text inside the breathing ticker:
//   1. Pre-reasoning  → cycle through curated generic phrases at 1.6s,
//      reassuring the user something is happening. Used for the brief
//      window between message-send and the first reasoning chunk.
//   2. Reasoning streaming → show the LATEST complete sentence
//      ("trecho") from `message.reasoning`. As the model thinks, the
//      ticker text updates with what it's actually thinking about
//      right now — but always a clean, finished sentence (not a raw
//      mid-word dump).
const STATUS_TICKER_FALLBACKS = [
  'Lendo cotações…',
  'Cruzando dados de macro…',
  'Buscando notícias recentes…',
  'Validando números…',
  'Sintetizando análise…',
] as const

// Generic-phrase cursor (used when reasoning is empty).
const fallbackTickerIndex = ref(0)

/**
 * Pull the latest "good" sentence from reasoning_content. Heuristics:
 *   - split by sentence terminator (`. `, `! `, `? `, newline)
 *   - skip fragments shorter than 12 chars (mid-thought noise)
 *   - skip empty / whitespace-only chunks
 *   - cap to 120 chars (one ticker line)
 *   - return the LAST sentence so the text updates as reasoning grows
 */
function latestReasoningExcerpt(reasoning: string): string | null {
  if (!reasoning) return null
  const cleaned = reasoning.replace(/\s+/g, ' ').trim()
  if (cleaned.length < 12) return null
  // Split keeping the terminator (so we can test "is this a complete
  // sentence?" — we ignore the last fragment if it doesn't end with
  // punctuation, since it's still being typed).
  const parts = cleaned.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean)
  if (parts.length === 0) return null
  // Walk from the end backwards, find the most recent sentence ≥ 12 chars.
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]!
    // The very last entry may be incomplete (no terminator yet) — only
    // accept it if it already has enough substance.
    const isComplete = /[.!?]$/.test(p)
    if (!isComplete && i === parts.length - 1 && p.length < 32) continue
    if (p.length < 12) continue
    // Strip leading filler words common in reasoning chains.
    const stripped = p.replace(
      /^(hmm,?|ah,?|ok,?|bom,?|certo,?|ent[aã]o,?|aliás,?|aliás\.?)\s+/i,
      '',
    )
    return stripped.length > 120 ? `${stripped.slice(0, 117).trim()}…` : stripped
  }
  return null
}

const reasoningExcerpt = computed<string | null>(() =>
  latestReasoningExcerpt(props.message.reasoning ?? ''),
)

// What the ticker actually displays — reasoning trecho when available,
// generic fallback while we wait for reasoning to start.
const tickerText = computed<string>(() => {
  if (reasoningExcerpt.value) return reasoningExcerpt.value
  return STATUS_TICKER_FALLBACKS[fallbackTickerIndex.value]
})

// Vue Transition keys. Whenever the visible text changes (either the
// fallback cursor advances OR a new reasoning sentence completes),
// the key flips and the crossfade plays.
const tickerKey = computed<string>(() =>
  reasoningExcerpt.value
    ? `r:${reasoningExcerpt.value.slice(0, 40)}`
    : `f:${fallbackTickerIndex.value}`,
)

const elapsedMs = ref(0)
const elapsedFmt = computed(() => {
  const s = elapsedMs.value / 1000
  if (s < 10) return `${s.toFixed(1)}s`
  return `${Math.floor(s)}s`
})

let _tickerInterval: ReturnType<typeof setInterval> | null = null
let _elapsedInterval: ReturnType<typeof setInterval> | null = null
let _waitStartedAt = 0

watch(
  isWaitingForFirstChunk,
  (waiting) => {
    if (waiting) {
      // Start fresh — reset both counters when the ticker comes alive.
      fallbackTickerIndex.value = 0
      elapsedMs.value = 0
      _waitStartedAt = Date.now()
      if (_tickerInterval) clearInterval(_tickerInterval)
      if (_elapsedInterval) clearInterval(_elapsedInterval)
      _tickerInterval = setInterval(() => {
        fallbackTickerIndex.value =
          (fallbackTickerIndex.value + 1) % STATUS_TICKER_FALLBACKS.length
      }, 1600)
      _elapsedInterval = setInterval(() => {
        elapsedMs.value = Date.now() - _waitStartedAt
      }, 100)
    } else {
      if (_tickerInterval) {
        clearInterval(_tickerInterval)
        _tickerInterval = null
      }
      if (_elapsedInterval) {
        clearInterval(_elapsedInterval)
        _elapsedInterval = null
      }
    }
  },
  { immediate: true },
)
onBeforeUnmount(() => {
  if (_tickerInterval) clearInterval(_tickerInterval)
  if (_elapsedInterval) clearInterval(_elapsedInterval)
})

// Wrapper ref for the assistant answer DIV. The watcher that mounts
// `<TickerChip>` instances into the rendered prose lives at the
// bottom of this script (after `renderedMarkdown` is declared) since
// `const` bindings are in TDZ until their declaration line.
const answerRef = ref<HTMLElement | null>(null)
const tickerProse = useTickerProse()
const chartProse = useChartProse()
const maxFeatureProse = useMaxFeatureProse()
const proposalProse = useProposalProse({
  proposals: () => props.message.proposals ?? [],
  // Suppress the fallback chip row while the message is still
  // streaming — wait for the `{{propose}}` marker to actually arrive
  // in the text stream so the chip mounts inline from the start
  // instead of flashing at the bottom and snapping into place a tick
  // later.
  isStreaming: () => props.message.status === 'streaming',
  onConfirm: (p) => emit('confirm-proposal', p),
  onSkip: (p) => emit('skip-proposal', p),
})

// (Research panel state was extracted into ChatV2ResearchPanel — it
// owns its own open/closed state, group-by-family logic, and live
// progress text. This component now only routes data into it.)

// Public tier label — REDENTIA BASIC / REDENTIA MAX. Used as the
// model-badge in the "Resposta" header. We deliberately don't show
// the underlying provider name (Kimi, Claude, etc.) — the product
// surface is purely Redentia.
function tierLabelFromTier(tier: 'basic' | 'max' | undefined): string | undefined {
  if (tier === 'max') return 'Redentia MAX'
  if (tier === 'basic') return 'Redentia Basic'
  return undefined
}

// ---- Attachment chip helpers ------------------------------------
// Mirrors the Input.vue helpers but type-narrowed for the persisted
// shape (no `content` field; we only have name/mime/size/kind/preview).
function attachIconStatic(att: { kind?: string; mime: string }): string {
  if (att.kind === 'image' || att.mime.startsWith('image/')) return 'i-lucide-image'
  if (att.mime === 'application/pdf') return 'i-lucide-file-text'
  if (
    att.mime.includes('spreadsheet') ||
    att.mime.includes('excel') ||
    att.mime.includes('numbers')
  )
    return 'i-lucide-table'
  if (att.mime === 'text/markdown') return 'i-lucide-file-code'
  if (att.mime === 'application/json') return 'i-lucide-braces'
  return 'i-lucide-file'
}

function humanSizeStatic(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 1024) return `${bytes ?? 0}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

// Depends on `sanitizerReady` so the computed re-runs once DOMPurify
// finishes its dynamic import on the client (otherwise the first
// render would stay unsanitized forever).
const renderedMarkdown = computed(() => {
  // touch the ref so Vue tracks the dependency
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  sanitizerReady.value
  return renderMarkdown(props.message.content)
})

// After every markdown re-render, walk the answer wrapper for the
// marked extension's `.ticker-mount[data-ticker]` placeholders and
// mount live `<TickerChip>` components into them. Idempotent —
// already-mounted placeholders are skipped via a `data-mounted`
// flag inside `useTickerProse`. Uses `flush: 'post'` so the DOM is
// already up-to-date when the watcher runs (v-html applies during
// the component update phase).
watch(
  () => renderedMarkdown.value,
  () => {
    void nextTick(() => {
      tickerProse.mountIn(answerRef.value)
      chartProse.mountIn(answerRef.value)
      maxFeatureProse.mountIn(answerRef.value)
      proposalProse.mountIn(answerRef.value)
    })
  },
  { flush: 'post', immediate: true },
)
// Re-run the proposal mount step whenever the underlying proposals
// list changes (new proposal arrives via SSE) OR the message status
// transitions (streaming → complete). The streaming flag gates the
// fallback chip row — flipping to complete is what allows the
// fallback to render in case the model forgot the `{{propose}}`
// marker. The chip props read the reactive proposal object so state
// flips (pending → confirmed) re-render automatically without
// re-mount.
watch(
  [
    () => (props.message.proposals ?? []).length,
    () => props.message.status,
  ],
  () => {
    void nextTick(() => proposalProse.mountIn(answerRef.value))
  },
  { flush: 'post' },
)
onBeforeUnmount(() => {
  tickerProse.cleanup()
  chartProse.cleanup()
  maxFeatureProse.cleanup()
  proposalProse.cleanup()
})

function renderMarkdown(text: string): string {
  if (!text) return ''
  // Parse markdown → HTML, then (when available) sanitize, then add
  // our extras (citation chips, code/link/cite classes, etc.).
  // Pass options inline (instead of marked.setOptions at module level)
  // to avoid a "marked is not defined" Vite/setup ordering bug.
  // GFM = tables, strikethrough, autolinks. breaks = single \n → <br>.
  // Note: we deliberately DO NOT strip artifact URLs here. The agent
  // hides the download URL from the LLM's tool-result context (so
  // it can't accidentally repeat the link as prose), but if the LLM
  // genuinely wants to link to something — even an artifact — the
  // frontend must respect it.
  const repaired = repairTableSeparators(text)
  const rawHtml = marked.parse(repaired, { async: false, gfm: true, breaks: true }) as string
  // domPurify is null during SSR and during the brief window between
  // mount and the dynamic import resolving — fall through with the raw
  // marked HTML in those cases. Content is generated by our own backend.
  const safe = domPurify
    ? domPurify.sanitize(rawHtml, {
        // `data-ticker` is what the marked ticker extension stamps on
        // the placeholder span — it's how `useTickerProse` finds the
        // mount points after sanitisation. Without ADD_ATTR, DOMPurify
        // strips data-* attributes by default. Same goes for
        // `data-period` on the chart-mount placeholder.
        ADD_ATTR: ['target', 'rel', 'data-ticker', 'data-period', 'data-label'],
      })
    : rawHtml
  return decorateHtml(safe)
}

/**
 * Repair off-by-one mistakes in markdown table separators before
 * Marked sees them. The model occasionally emits separators with the
 * wrong number of cells (e.g. header has 3 columns but the separator
 * row reads `|---|---|---|---|` — 4 cells). GFM rejects the table
 * outright in that case and the whole block falls through as a
 * paragraph, which is what showed up as raw `| Métrica | …` text in
 * the chat answer.
 *
 * Strategy: scan for separator-shaped lines (only `|`, `:`, `-`,
 * spaces between pipes), look at the line above for a header row,
 * count cells, regenerate the separator at the header's cardinality
 * if they don't match.
 *
 * Idempotent + conservative: if the previous line doesn't look like
 * a header, or if cells already match, we leave the source alone.
 */
function repairTableSeparators(md: string): string {
  if (!md.includes('|')) return md // fast path for non-table answers
  const lines = md.split('\n')
  const SEP_RE = /^\s*\|[\s|:-]+\|\s*$/
  const HEADER_RE = /^\s*\|.*\|\s*$/
  for (let i = 1; i < lines.length; i++) {
    const sepLine = lines[i]!
    if (!SEP_RE.test(sepLine)) continue
    if (!/-/.test(sepLine)) continue
    const headerLine = lines[i - 1]!
    if (!HEADER_RE.test(headerLine)) continue
    // Cell count = number of pipes minus 1 (leading + trailing share
    // a pair). `.split('|').slice(1, -1).length` gives the cells
    // between the bookend pipes.
    const headerCells = headerLine.trim().split('|').slice(1, -1).length
    const sepCells = sepLine.trim().split('|').slice(1, -1).length
    if (headerCells === 0 || headerCells === sepCells) continue
    lines[i] = '|' + ' --- |'.repeat(headerCells)
  }
  return lines.join('\n')
}

// Post-process the sanitized HTML to:
//   - turn [N] text inside any element into clickable citation chips,
//   - tag <a> with our chat-link class + target=_blank,
//   - tag <pre><code> with our chat-codeblock class,
//   - tag inline <code> with our chat-inline-code class,
//   - tag <table> with our chat-table class.
// We do this on the HTML string so we don't fight Marked's tokenizer.
function decorateHtml(html: string): string {
  return html
    // Citations [N] → sup chip. Only matches in text nodes (not inside
    // attributes), since marked renders text content escaped.
    .replace(/\[(\d+)\]/g, '<sup class="chat-citation-ref">$1</sup>')
    // <a ...> → add chat-link class + open in new tab
    .replace(/<a\s+href="([^"]+)"([^>]*)>/g, (_, href, rest) => {
      const hasClass = /class=/.test(rest)
      const cls = hasClass
        ? rest.replace(/class="([^"]*)"/, 'class="$1 chat-link"')
        : ` class="chat-link"`
      const hasTarget = /target=/.test(rest)
      const target = hasTarget ? '' : ' target="_blank" rel="noopener noreferrer"'
      return `<a href="${href}"${cls}${target}>`
    })
    // <pre><code> → chat-codeblock wrapper class on <pre>
    .replace(/<pre><code(\s+class="[^"]*")?>/g, (_m, klass) => {
      return `<pre class="chat-codeblock"><code${klass ?? ''}>`
    })
    // Inline <code> (not inside <pre>) → chat-inline-code. Marked emits
    // bare <code> for inline; we already handled <pre><code> above by
    // putting them in a class-laden <pre>, so the remaining <code> are
    // inline. Add our class to those.
    .replace(/<code>/g, '<code class="chat-inline-code">')
    // <table> → wrap in a horizontally-scrollable shell so wide
    // tables (10+ columns from carteira analysis, comparativos, etc)
    // don't blow past the answer column width. The wrap owns the
    // border + rounded corners; the table inside keeps its intrinsic
    // min-width so columns stay readable instead of being squeezed.
    .replace(/<table>/g, '<div class="chat-table-wrap"><table class="chat-table">')
    .replace(/<\/table>/g, '</table></div>')
}

function artifactIcon(type: ChatArtifact['type']): string {
  if (type === 'spreadsheet') return 'i-lucide-file-spreadsheet'
  if (type === 'report') return 'i-lucide-file-text'
  if (type === 'comparison') return 'i-lucide-table'
  return 'i-lucide-file'
}

function artifactLabel(type: ChatArtifact['type']): string {
  if (type === 'spreadsheet') return 'Planilha'
  if (type === 'report') return 'Relatório'
  if (type === 'comparison') return 'Comparativo'
  if (type === 'portfolio') return 'Carteira'
  return 'Documento'
}
</script>

<style scoped>
.chat-turn {
  /* Big top spacing between turns is set by Thread.vue's gap */
}

.chat-question {
  word-break: break-word;
}

/* Cold-start status ticker — pulsing dot ring + skeleton shimmer.
   The dot is one solid + one ping ring (matches the live-tape pattern
   in the dashboard). Skeletons soft-pulse 0.6 ↔ 1 with staggered
   delays. Honours prefers-reduced-motion. */
.chat-thinking-pulse {
  animation: chat-thinking-ping-keys 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
  opacity: 0.6;
}
@keyframes chat-thinking-ping-keys {
  75%, 100% { transform: scale(2.4); opacity: 0; }
}
.chat-thinking-skel {
  animation: chat-thinking-skel-keys 1.6s ease-in-out infinite;
}
@keyframes chat-thinking-skel-keys {
  0%, 100% { opacity: 0.6; }
  50%      { opacity: 1; }
}
.chat-status-text-enter-active,
.chat-status-text-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}
.chat-status-text-enter-from { opacity: 0; transform: translateY(3px); }
.chat-status-text-leave-to { opacity: 0; transform: translateY(-3px); }

/* Breathing glow on the status phrase — opacity oscillates 1 ↔ 0.55
   on a 2.4s ease-in-out cycle. Communicates "alive, working" without
   the chrome of a shimmer or a stack. Casa com a quiet identity da
   Redentia. */
.chat-status-breathe {
  animation: chat-status-breathe-keys 2.4s ease-in-out infinite;
}
@keyframes chat-status-breathe-keys {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
}

@media (prefers-reduced-motion: reduce) {
  .chat-thinking-pulse,
  .chat-thinking-skel,
  .chat-status-breathe,
  .chat-status-text-enter-active,
  .chat-status-text-leave-active {
    animation: none;
    transition: none;
  }
}

.chat-artifact-card:hover {
  border-color: color-mix(in srgb, currentColor 20%, transparent) !important;
  background-color: color-mix(in srgb, currentColor 4%, transparent) !important;
}

.chat-answer :deep(p) {
  margin: 0 0 0.95em 0;
}
.chat-answer :deep(p:last-child) {
  margin-bottom: 0;
}
.chat-answer :deep(ul),
.chat-answer :deep(ol) {
  margin: 0.4em 0 1em 1.4em;
  display: flex;
  flex-direction: column;
  gap: 0.35em;
}
.chat-answer :deep(ul) { list-style: disc; }
.chat-answer :deep(ol) { list-style: decimal; }

.chat-answer :deep(.chat-h1),
.chat-answer :deep(.chat-h2),
.chat-answer :deep(.chat-h3) {
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 1.4em 0 0.5em 0;
}
.chat-answer :deep(.chat-h1) { font-size: 22px; }
.chat-answer :deep(.chat-h2) { font-size: 19px; }
.chat-answer :deep(.chat-h3) { font-size: 17px; }

.chat-answer :deep(.chat-codeblock) {
  background: color-mix(in srgb, currentColor 5%, transparent);
  border: 1px solid color-mix(in srgb, currentColor 8%, transparent);
  border-radius: 12px;
  padding: 14px 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre;
  margin: 0.8em 0;
}
.chat-answer :deep(.chat-inline-code) {
  background: color-mix(in srgb, currentColor 8%, transparent);
  border-radius: 4px;
  padding: 1px 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9em;
}
.chat-answer :deep(.chat-link) {
  color: var(--brand-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
  text-decoration-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
}
.chat-answer :deep(.chat-link:hover) {
  text-decoration-color: var(--brand-primary);
}
.chat-answer :deep(.chat-citation-ref) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  margin: 0 1px 0 2px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
  color: var(--brand-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  vertical-align: super;
  line-height: 1;
  cursor: pointer;
  transition: background 140ms ease;
}
.chat-answer :deep(.chat-citation-ref:hover) {
  background: color-mix(in srgb, var(--brand-primary) 28%, transparent);
}

/* Headings rendered by marked (instead of our manual h1/h2/h3 classes) */
.chat-answer :deep(h1),
.chat-answer :deep(h2),
.chat-answer :deep(h3),
.chat-answer :deep(h4) {
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 1.4em 0 0.5em 0;
  line-height: 1.3;
}
.chat-answer :deep(h1) { font-size: 22px; }
.chat-answer :deep(h2) { font-size: 19px; }
.chat-answer :deep(h3) { font-size: 17px; }
.chat-answer :deep(h4) { font-size: 15px; opacity: 0.85; }

/* Tables — wrapped in a horizontally-scrollable shell.
   The wrap owns the border + rounded corners + the scroll container.
   The inner table keeps its intrinsic min-width so columns stay
   readable; when the natural width exceeds the answer column, the
   wrap scrolls horizontally instead of squashing cells. */
.chat-answer :deep(.chat-table-wrap) {
  margin: 0.9em 0;
  border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
  border-radius: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  /* Scrollbar visible but slim — gives a hint of scrollability while
     keeping the chat looking clean. Hidden on Firefox where the slim
     scrollbar already feels right with `scrollbar-width: thin`. */
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, currentColor 22%, transparent) transparent;
  -webkit-overflow-scrolling: touch;
  /* Soft fade on the right edge to hint "more columns →" when content
     overflows. Mask only kicks in visually when there's overflow because
     the gradient covers a relative percentage of the wrap. */
  -webkit-mask-image: linear-gradient(
    to right,
    black 0,
    black calc(100% - 24px),
    color-mix(in srgb, black 40%, transparent) 100%
  );
  mask-image: linear-gradient(
    to right,
    black 0,
    black calc(100% - 24px),
    color-mix(in srgb, black 40%, transparent) 100%
  );
}
.chat-answer :deep(.chat-table-wrap)::-webkit-scrollbar {
  height: 6px;
}
.chat-answer :deep(.chat-table-wrap)::-webkit-scrollbar-track {
  background: transparent;
}
.chat-answer :deep(.chat-table-wrap)::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, currentColor 22%, transparent);
  border-radius: 4px;
}
.chat-answer :deep(.chat-table-wrap)::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, currentColor 35%, transparent);
}

.chat-answer :deep(.chat-table) {
  /* Use intrinsic content width — never below the wrap, never compress
     columns to fit. If wider, the wrap scrolls. */
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14.5px;
}
.chat-answer :deep(.chat-table thead) {
  background: color-mix(in srgb, currentColor 4%, transparent);
}
.chat-answer :deep(.chat-table th),
.chat-answer :deep(.chat-table td) {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid color-mix(in srgb, currentColor 8%, transparent);
  vertical-align: top;
  font-variant-numeric: tabular-nums;
}
.chat-answer :deep(.chat-table th) {
  font-weight: 600;
  font-size: 12.5px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: color-mix(in srgb, currentColor 70%, transparent);
}
.chat-answer :deep(.chat-table tbody tr:last-child td) {
  border-bottom: 0;
}
.chat-answer :deep(.chat-table tbody tr:hover) {
  background: color-mix(in srgb, currentColor 3%, transparent);
}

/* Blockquote */
.chat-answer :deep(blockquote) {
  border-left: 3px solid color-mix(in srgb, var(--brand-primary) 60%, transparent);
  padding: 0.4em 0 0.4em 1em;
  margin: 0.9em 0;
  color: color-mix(in srgb, currentColor 80%, transparent);
  font-style: italic;
}
.chat-answer :deep(blockquote > p) {
  margin: 0;
}

/* HR */
.chat-answer :deep(hr) {
  border: 0;
  height: 1px;
  background: color-mix(in srgb, currentColor 12%, transparent);
  margin: 1.4em 0;
}

/* Strong & em */
.chat-answer :deep(strong) { font-weight: 600; }
.chat-answer :deep(em) { font-style: italic; }

/* Chart mount placeholder — the marker `{{chart:X:Y}}` is matched as
   inline (so it can appear mid-paragraph), but the rendered chart is
   a block-level card. Force the host span to break the inline flow so
   the chart claims a full row. */
.chat-answer :deep(.chart-mount) {
  display: block;
  width: 100%;
  margin: 0.75em 0;
}
.chat-answer :deep(.chart-mount[data-mounted="1"]) {
  font-size: 0; /* hide any whitespace around the mount */
}
</style>

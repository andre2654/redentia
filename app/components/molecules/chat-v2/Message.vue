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
          backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 60%, transparent)`,
          border: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
          color: brand.colors.textMuted,
        }"
        @click="formResponseOpen = !formResponseOpen"
      >
        <UIcon
          name="i-lucide-check"
          class="size-3.5"
          :style="{ color: brand.colors.positive }"
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
          backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 50%, transparent)`,
          border: `1px solid color-mix(in srgb, ${brand.colors.border} 30%, transparent)`,
        }"
      >
        <li
          v-for="f in (message.meta.fields ?? [])"
          :key="f.id"
          class="flex items-baseline gap-2 text-[12.5px]"
        >
          <span
            class="shrink-0"
            :style="{ color: brand.colors.textMuted }"
          >{{ f.label }}:</span>
          <span
            class="font-medium tabular-nums"
            :style="{ color: brand.colors.text }"
          >{{ f.value }}</span>
        </li>
      </ul>
    </div>

    <!-- USER — REGULAR QUESTION (heading style) -->
    <div
      v-else-if="message.role === 'user'"
      class="chat-question font-display text-[26px] font-semibold leading-tight tracking-tight md:text-[32px]"
      :style="{ color: brand.colors.text }"
    >
      {{ message.content }}
    </div>

    <!-- ASSISTANT TURN -->
    <div v-else class="flex flex-col gap-7 md:gap-8">
      <!-- ===== Pesquisa: Fontes + Tools combinados, colapsáveis ===== -->
      <section
        v-if="message.citations.length > 0 || message.toolCalls.length > 0"
        class="chat-research"
      >
        <button
          type="button"
          class="chat-research-header flex w-full items-center justify-between gap-3 rounded-lg px-1 py-1 text-left transition-colors"
          @click="researchOpen = !researchOpen"
        >
          <div class="flex items-center gap-2">
            <UIcon
              :name="researchOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
              class="size-3.5 shrink-0 transition-transform"
              :style="{ color: brand.colors.textMuted }"
            />
            <span
              class="font-mono-tab text-[10.5px] uppercase tracking-[0.16em]"
              :style="{ color: brand.colors.textMuted }"
            >
              Pesquisa
              <template v-if="message.citations.length > 0">
                · {{ message.citations.length }} fontes
              </template>
              <template v-if="message.toolCalls.length > 0">
                · {{ message.toolCalls.length }} {{ message.toolCalls.length === 1 ? 'ferramenta' : 'ferramentas' }}
              </template>
            </span>
          </div>
          <span
            v-if="!researchOpen && researchPreview"
            class="line-clamp-1 max-w-[60%] text-[12px]"
            :style="{ color: brand.colors.textMuted }"
          >
            {{ researchPreview }}
          </span>
        </button>

        <div v-if="researchOpen" class="mt-3 flex flex-col gap-4">
          <!-- Tools -->
          <div v-if="message.toolCalls.length > 0" class="flex flex-wrap gap-1.5">
            <ChatV2ToolCallCard
              v-for="tc in message.toolCalls"
              :key="tc.callId"
              :tool-call="tc"
            />
          </div>
          <!-- Fontes -->
          <ChatV2SourceRail
            v-if="message.citations.length > 0"
            :citations="message.citations"
          />
        </div>
      </section>

      <!-- ===== Resposta ===== -->
      <section v-if="message.content || message.status === 'streaming'">
        <ChatV2SectionLabel
          icon="i-lucide-sparkles"
          label="Resposta"
          :badge="message.tierLabel ?? tierLabelFromTier(message.tier)"
        />
        <div
          class="chat-answer text-[16.5px] leading-[1.7]"
          :style="{ color: brand.colors.text }"
        >
          <ChatV2StreamingText
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
            backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 60%, transparent)`,
            border: `1px solid color-mix(in srgb, ${brand.colors.border} 35%, transparent)`,
            color: brand.colors.text,
          }"
          @click="$emit('open-artifact', art)"
        >
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-xl"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 16%, transparent)`,
              color: brand.colors.primary,
            }"
          >
            <UIcon :name="artifactIcon(art.type)" class="size-5" />
          </span>
          <div class="flex min-w-0 flex-1 flex-col">
            <span class="truncate text-[14px] font-semibold">{{ art.title }}</span>
            <span
              class="font-mono-tab text-[10.5px] uppercase tracking-[0.16em]"
              :style="{ color: brand.colors.textMuted }"
            >
              {{ artifactLabel(art.type) }}{{ art.filename ? ' · ' + art.filename : '' }}
            </span>
          </div>
          <span
            v-if="art.downloadUrl"
            class="font-mono-tab text-[11px] font-semibold uppercase tracking-[0.12em]"
            :style="{ color: brand.colors.primary }"
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
          border: `1px solid color-mix(in srgb, ${brand.colors.negative} 40%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${brand.colors.negative} 8%, transparent)`,
          color: brand.colors.negative,
        }"
      >
        {{ message.error ?? 'Erro ao gerar resposta. Tente novamente.' }}
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'
import type { ChatMessage, ChatArtifact } from '~/composables/useChatStream'

const props = defineProps<{
  message: ChatMessage
  isLast: boolean
}>()

defineEmits<{
  'send-followup': [message: string]
  'open-artifact': [artifact: ChatArtifact]
}>()

const brand = useBrand()

// Research section starts collapsed by default — keeps the thread
// minimal. Auto-opens while a tool is still running so the user sees
// progress in real time.
const researchOpen = ref(false)

// User-form-response pill: collapsed by default, click to see all answers.
const formResponseOpen = ref(false)

// One-line preview shown next to "Pesquisa" when collapsed: the most
// relevant tool currently running, or the title of the first source.
const researchPreview = computed(() => {
  const running = props.message.toolCalls.find((t) => t.status === 'running')
  if (running) return `Executando ${running.name.replaceAll('_', ' ')}…`
  const firstCite = props.message.citations[0]
  if (firstCite?.source?.title) return firstCite.source.title
  if (props.message.toolCalls.length > 0) {
    return props.message.toolCalls.map((t) => t.name.split('_')[0]).slice(0, 3).join(' · ')
  }
  return ''
})

// Auto-open while any tool is still running so the user sees the
// progress without having to expand it manually. Once everything is
// done it stays closed (user can expand by clicking).
watch(
  () => props.message.toolCalls.some((t) => t.status === 'running'),
  (anyRunning) => {
    if (anyRunning) researchOpen.value = true
  },
  { immediate: true },
)

// Public tier label — REDENTIA BASIC / REDENTIA MAX. Used as the
// model-badge in the "Resposta" header. We deliberately don't show
// the underlying provider name (Kimi, Claude, etc.) — the product
// surface is purely Redentia.
function tierLabelFromTier(tier: 'basic' | 'max' | undefined): string | undefined {
  if (tier === 'max') return 'Redentia MAX'
  if (tier === 'basic') return 'Redentia Basic'
  return undefined
}

const renderedMarkdown = computed(() => renderMarkdown(props.message.content))

function renderMarkdown(text: string): string {
  if (!text) return ''
  // Parse markdown → HTML, then sanitize, then add our extras
  // (citation chips, code/link/cite classes, etc.).
  // Pass options inline (instead of marked.setOptions at module level)
  // to avoid a "marked is not defined" Vite/setup ordering bug.
  // GFM = tables, strikethrough, autolinks. breaks = single \n → <br>.
  const rawHtml = marked.parse(text, { async: false, gfm: true, breaks: true }) as string
  const safe = DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ['target', 'rel'],
  })
  return decorateHtml(safe)
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
    // <table> → chat-table for our scoped styles
    .replace(/<table>/g, '<table class="chat-table">')
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

/* Tables */
.chat-answer :deep(.chat-table) {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 0.9em 0;
  font-size: 14.5px;
  border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
  border-radius: 12px;
  overflow: hidden;
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
</style>

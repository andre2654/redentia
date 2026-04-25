<!--
  Sidebar — Linear minimalism with Stripe-grade polish.

  Design philosophy:
  - One screen of pixels you'd hang on a wall. Nothing decorative
    that doesn't communicate. But every essential gets a touch of
    craft: a hairline horizon, a soft active glow, a subtle ⌘K
    kbd cap, a sparkle that actually sparkles.
  - Single accent color, single weight scale. The active row uses a
    2px left bar + a faint primary tint behind it (~5%) — hierarchy
    without volume.
  - Hover reveals secondary affordances (date, delete). Default
    state is title-only.
  - MAX is a glyph next to the title with a soft radial glow — not a
    pill. The glyph itself sells the tier.
  - Dates collapse to relative ("3h", "2d", "12 jan"). tabular-nums.

  WIG compliance:
  - aria-label on every icon-only control
  - focus-visible outline on every interactive
  - explicit transition properties (no `transition: all`)
  - touch-action: manipulation
  - prefers-reduced-motion guard
  - min-w-0 on flex children with truncating text
  - `…` ellipsis, tabular-nums, Intl for long-tail dates
  - <nav>, <h3>, aria-current, aria-hidden on decorative
-->
<template>
  <div class="chat-sidebar flex h-full min-h-0 flex-col">
    <!-- Ambient gradient — sits behind everything, very subtle -->
    <div
      class="pointer-events-none absolute inset-0"
      :style="{
        background: `radial-gradient(ellipse 80% 30% at 50% 0%, color-mix(in srgb, ${brand.colors.primary} 6%, transparent) 0%, transparent 60%)`,
      }"
      aria-hidden="true"
    />

    <!-- Brand row — full lockup (logo + wordmark in one asset). The
         BrandLogo `full` variant ships separate dark/light artwork
         per tenant, so it always reads correctly on whatever surface
         the sidebar is rendered on. -->
    <header class="relative flex flex-shrink-0 items-center px-4 pb-5 pt-6">
      <BrandLogo
        variant="full"
        mode="auto"
        class="chat-brand-mark h-8 w-auto"
        aria-hidden="true"
      />
    </header>

    <!-- Primary action: ghost row with kbd hint -->
    <button
      type="button"
      class="chat-new group relative mx-2 mb-1 flex items-center gap-2.5 rounded-md px-3 py-1.5 text-left text-[13px] transition-[background-color,color]"
      :style="{ color: `color-mix(in srgb, ${brand.colors.text} 78%, transparent)` }"
      aria-label="Nova conversa"
      @click="$emit('new')"
    >
      <UIcon
        name="i-lucide-plus"
        class="size-3.5 shrink-0 transition-transform duration-200 group-hover:rotate-90"
        aria-hidden="true"
      />
      <span>Nova conversa</span>
      <kbd
        v-if="shortcutLabel"
        class="ml-auto hidden rounded px-1.5 py-[1px] font-mono-tab text-[9.5px] tracking-wider transition-colors sm:inline-flex"
        :style="{
          color: brand.colors.textMuted,
          border: `1px solid color-mix(in srgb, ${brand.colors.border} 45%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${brand.colors.text} 3%, transparent)`,
        }"
      >
        {{ shortcutLabel }}
      </kbd>
    </button>

    <!-- Search — only when it earns its place -->
    <label
      v-if="sessions.length > 8"
      class="chat-search mx-2 mb-2 flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors"
    >
      <UIcon
        name="i-lucide-search"
        class="size-3.5 shrink-0"
        :style="{ color: brand.colors.textMuted }"
        aria-hidden="true"
      />
      <input
        v-model="searchQuery"
        type="text"
        aria-label="Buscar conversas"
        placeholder="Buscar"
        autocomplete="off"
        spellcheck="false"
        class="chat-search-input min-w-0 flex-1 border-0 bg-transparent text-[12.5px] outline-none"
        :style="{ color: brand.colors.text }"
      />
      <button
        v-if="searchQuery"
        type="button"
        class="chat-search-clear shrink-0 rounded-sm p-0.5 transition-colors"
        :style="{ color: brand.colors.textMuted }"
        aria-label="Limpar busca"
        @click="searchQuery = ''"
      >
        <UIcon name="i-lucide-x" class="size-3" aria-hidden="true" />
      </button>
    </label>

    <!-- Horizon hairline — a soft separator that fades at the edges,
         just enough to give the threads list a top margin without
         a hard division. Pure ornament that earns its pixel. -->
    <div
      class="chat-horizon mx-4 mt-1 h-px shrink-0"
      :style="{
        backgroundImage: `linear-gradient(90deg, transparent 0%, color-mix(in srgb, ${brand.colors.border} 70%, transparent) 50%, transparent 100%)`,
      }"
      aria-hidden="true"
    />

    <!-- Threads -->
    <nav
      class="chat-threads relative flex-1 overflow-y-auto pb-6 pt-2"
      aria-label="Histórico de conversas"
    >
      <p
        v-if="sessions.length === 0"
        class="px-5 pt-8 text-[12px] leading-relaxed"
        :style="{ color: brand.colors.textMuted }"
      >
        Suas conversas aparecem aqui.
      </p>

      <p
        v-else-if="visibleSessions.length === 0"
        class="px-5 pt-6 text-[12px]"
        :style="{ color: brand.colors.textMuted }"
      >
        Nada bate com&nbsp;<span class="font-medium" :style="{ color: brand.colors.text }">{{ searchQuery }}</span>.
      </p>

      <template v-for="group in groupedSessions" :key="group.label">
        <h3
          v-if="group.items.length > 0"
          class="mb-1 mt-5 flex items-center gap-2 px-5 font-mono-tab text-[10px] uppercase tracking-[0.18em]"
          :style="{ color: `color-mix(in srgb, ${brand.colors.textMuted} 55%, transparent)` }"
        >
          <span>{{ group.label }}</span>
          <span
            class="h-px flex-1"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.border} 25%, transparent)`,
            }"
            aria-hidden="true"
          />
          <span
            class="font-mono-tab tabular-nums"
            :style="{ color: `color-mix(in srgb, ${brand.colors.textMuted} 45%, transparent)` }"
          >
            {{ group.items.length }}
          </span>
        </h3>
        <ul v-if="group.items.length > 0" class="flex flex-col">
          <li
            v-for="session in group.items"
            :key="session.id"
            class="group/sess relative"
            :class="[
              activeId === session.id ? 'is-active' : '',
              session.tier === 'max' ? 'is-max' : '',
            ]"
          >
            <!-- Active row pad — soft tonal background.
                 MAX gets a richer gradient AND an animated shimmer
                 sweeping across (the shimmer lives in CSS as a
                 ::before on .is-active.is-max). -->
            <span
              v-if="activeId === session.id"
              class="chat-sess-pad pointer-events-none absolute inset-x-2 inset-y-0.5 overflow-hidden rounded-md"
              :style="{
                background: session.tier === 'max'
                  ? `linear-gradient(90deg, color-mix(in srgb, ${brand.colors.primary} 14%, transparent) 0%, color-mix(in srgb, ${brand.colors.primary} 4%, transparent) 60%, transparent 100%)`
                  : `linear-gradient(90deg, color-mix(in srgb, ${brand.colors.primary} 8%, transparent) 0%, transparent 80%)`,
              }"
              aria-hidden="true"
            />
            <!-- Left accent bar — heavier glow when MAX -->
            <span
              v-if="activeId === session.id"
              class="chat-sess-bar pointer-events-none absolute left-0 top-1/2 h-4 -translate-y-1/2 rounded-r-full"
              :style="session.tier === 'max'
                ? {
                    width: '2.5px',
                    background: `linear-gradient(180deg, ${brand.colors.primary} 0%, color-mix(in srgb, ${brand.colors.primary} 70%, ${brand.colors.text}) 100%)`,
                    boxShadow: `0 0 10px color-mix(in srgb, ${brand.colors.primary} 80%, transparent)`,
                  }
                : {
                    width: '2px',
                    backgroundColor: brand.colors.primary,
                    boxShadow: `0 0 6px color-mix(in srgb, ${brand.colors.primary} 60%, transparent)`,
                  }"
              aria-hidden="true"
            />
            <button
              type="button"
              class="chat-sess relative flex w-full items-center gap-2 rounded-md px-4 py-1.5 text-left text-[13px] transition-[background-color,color]"
              :style="activeId === session.id
                ? { color: brand.colors.text, fontWeight: '500' }
                : { color: `color-mix(in srgb, ${brand.colors.text} 80%, transparent)` }"
              :aria-current="activeId === session.id ? 'page' : undefined"
              :data-tier="session.tier"
              @click="$emit('select', session.id)"
            >
              <!-- Tier marker — a tiny glowing dot for MAX, only on
                   inactive rows. Active row gets the full gradient
                   treatment instead, so the dot would be redundant. -->
              <span
                v-if="session.tier === 'max' && activeId !== session.id"
                class="chat-sess-dot relative size-1.5 shrink-0 rounded-full"
                :style="{
                  backgroundColor: brand.colors.primary,
                  boxShadow: `0 0 6px color-mix(in srgb, ${brand.colors.primary} 70%, transparent)`,
                }"
                aria-label="Conversa Redentia MAX"
              />
              <span class="min-w-0 flex-1 truncate">
                {{ session.title ?? 'Sem título' }}
              </span>
              <!-- Hover-revealed date -->
              <span
                class="chat-sess-meta hidden shrink-0 font-mono-tab text-[10px] tabular-nums"
                :style="{ color: `color-mix(in srgb, ${brand.colors.textMuted} 70%, transparent)` }"
              >
                {{ formatRelativeDate(session.createdAt) }}
              </span>
              <!-- Hover-revealed delete -->
              <span
                role="button"
                tabindex="0"
                class="chat-sess-del hidden size-5 shrink-0 items-center justify-center rounded-sm transition-colors"
                :style="{ color: brand.colors.textMuted }"
                aria-label="Excluir conversa"
                @click.stop="$emit('delete', session.id)"
                @keydown.enter.stop.prevent="$emit('delete', session.id)"
                @keydown.space.stop.prevent="$emit('delete', session.id)"
              >
                <UIcon name="i-lucide-trash-2" class="size-3" aria-hidden="true" />
              </span>
            </button>
          </li>
        </ul>
      </template>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface Session {
  id: string
  title: string | null
  createdAt: string
  tier?: 'basic' | 'max'
}

const props = defineProps<{
  sessions: Session[]
  activeId: string | null
}>()

defineEmits<{
  new: []
  select: [id: string]
  delete: [id: string]
}>()

const brand = useBrand()
const searchQuery = ref('')

// Detect platform for keyboard hint (Mac shows ⌘, others Ctrl).
const shortcutLabel = ref('')
onMounted(() => {
  const isMac =
    typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '')
  shortcutLabel.value = isMac ? '⌘K' : 'Ctrl K'
})

const visibleSessions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.sessions
  return props.sessions.filter((s) => (s.title ?? '').toLowerCase().includes(q))
})

const groupedSessions = computed(() => {
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 7)

  const groups = {
    Hoje: [] as Session[],
    'Esta semana': [] as Session[],
    Anteriores: [] as Session[],
  }

  for (const s of visibleSessions.value) {
    const d = new Date(s.createdAt)
    if (d >= today) groups.Hoje.push(s)
    else if (d >= weekAgo) groups['Esta semana'].push(s)
    else groups.Anteriores.push(s)
  }

  return Object.entries(groups).map(([label, items]) => ({ label, items }))
})

function formatRelativeDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `${diffMin}m`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD}d`
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d)
}

// ⌘K / Ctrl+K focuses the search input when present.
function onKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    const input = document.querySelector<HTMLInputElement>('.chat-search-input')
    if (input) {
      e.preventDefault()
      input.focus()
    }
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.chat-sidebar {
  position: relative;
  -webkit-tap-highlight-color: transparent;
}

/* Brand mark — subtle hover lift on the logo itself */
.chat-brand-mark {
  transition: transform 240ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.chat-sidebar:hover .chat-brand-mark {
  transform: scale(1.04);
}
@media (prefers-reduced-motion: reduce) {
  .chat-brand-mark { transition: none !important; }
}

/* Touch + keyboard niceties */
.chat-new,
.chat-sess,
.chat-search,
.chat-search-clear,
.chat-sess-del {
  touch-action: manipulation;
}

/* Visible focus only via keyboard navigation */
.chat-new:focus-visible,
.chat-sess:focus-visible,
.chat-search-input:focus-visible,
.chat-search-clear:focus-visible,
.chat-sess-del:focus-visible {
  outline: 2px solid var(--brand-primary, currentColor);
  outline-offset: 2px;
  border-radius: 6px;
}

/* Hover states — explicit transitions, single property */
.chat-new:hover {
  background-color: color-mix(in srgb, currentColor 6%, transparent);
  color: var(--brand-text, currentColor);
}

.chat-sess:hover {
  background-color: color-mix(in srgb, currentColor 5%, transparent);
}

.chat-search:focus-within {
  background-color: color-mix(in srgb, currentColor 5%, transparent);
}

.chat-search-input::placeholder {
  color: color-mix(in srgb, currentColor 40%, transparent);
}

.chat-search-clear:hover {
  background-color: color-mix(in srgb, currentColor 8%, transparent);
}

/* Hover reveal — date + delete only show on row hover/focus.
   `display: none` keeps them out of the tab order until needed. */
.chat-sess-meta,
.chat-sess-del {
  display: none;
}
.group\/sess:hover .chat-sess-meta,
.group\/sess:focus-within .chat-sess-meta {
  display: inline-block;
}
.group\/sess:hover .chat-sess-del,
.group\/sess:focus-within .chat-sess-del {
  display: inline-flex;
}
.chat-sess-del:hover {
  background-color: color-mix(in srgb, currentColor 10%, transparent);
}

/* MAX dot subtle breathe — barely-perceptible glow on inactive rows.
   Communicates "this conversation is MAX" without an icon. */
.chat-sess-dot::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 9999px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--brand-primary, currentColor) 45%, transparent) 0%,
    transparent 70%
  );
  opacity: 0.4;
  animation: chat-max-breathe 4s ease-in-out infinite;
  pointer-events: none;
}
@keyframes chat-max-breathe {
  0%,
  100% { opacity: 0.25; transform: scale(0.85); }
  50%  { opacity: 0.95; transform: scale(1.25); }
}

/* Active + MAX row — animated horizontal shimmer that sweeps slowly
   across the gradient pad. This is the "incrível" detail: the row
   gently shines, signalling premium tier without an icon or pill. */
.is-active.is-max .chat-sess-pad::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--brand-primary, currentColor) 22%, transparent) 45%,
    color-mix(in srgb, var(--brand-primary, currentColor) 35%, transparent) 50%,
    color-mix(in srgb, var(--brand-primary, currentColor) 22%, transparent) 55%,
    transparent 100%
  );
  background-size: 220% 100%;
  background-position: -100% 0;
  animation: chat-max-shimmer 4.8s ease-in-out infinite;
  pointer-events: none;
  mix-blend-mode: screen;
}
@keyframes chat-max-shimmer {
  0%   { background-position: -120% 0; opacity: 0; }
  20%  { opacity: 1; }
  80%  { opacity: 1; }
  100% { background-position: 220% 0; opacity: 0; }
}

/* Active + MAX — a hairline at the top edge of the row, like a card
   accent. Adds depth without a heavy border. */
.is-active.is-max .chat-sess::before {
  content: '';
  position: absolute;
  inset: 0 8px auto 8px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--brand-primary, currentColor) 60%, transparent) 25%,
    color-mix(in srgb, var(--brand-primary, currentColor) 60%, transparent) 75%,
    transparent 100%
  );
  pointer-events: none;
  border-radius: 1px;
}

/* Honor reduced motion */
@media (prefers-reduced-motion: reduce) {
  .chat-new,
  .chat-sess,
  .chat-search,
  .chat-search-clear,
  .chat-sess-del,
  .chat-sess-dot::after,
  .is-active.is-max .chat-sess-pad::after {
    transition: none !important;
    animation: none !important;
  }
  .chat-new .iconify {
    transition: none !important;
  }
}

/* Slim, refined scrollbar */
.chat-threads {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, currentColor 14%, transparent) transparent;
}
.chat-threads::-webkit-scrollbar {
  width: 5px;
}
.chat-threads::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
  border-radius: 3px;
}
.chat-threads::-webkit-scrollbar-thumb:hover {
  background-color: color-mix(in srgb, currentColor 22%, transparent);
}
</style>

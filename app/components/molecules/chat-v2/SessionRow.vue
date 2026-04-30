<!--
  SessionRow — single session entry for the sidebar list. Handles:
    - Click to select (delegated to parent via emit).
    - Hover actions row: pin/unpin, rename, delete.
    - Inline rename: double-click on the title (or press the
      pencil action) replaces it with an input field. Saves on
      Enter / blur. Esc cancels. Empty title falls back to
      "Sem título" again.

  Shared between the "Fixados" section and the recency-grouped
  sections so pin + rename behaviour stays consistent regardless
  of where the session lives in the list.
-->
<template>
  <div
    class="session-row group relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors"
    :style="rowStyle"
    role="button"
    tabindex="0"
    @click="onActivate"
    @keydown.enter="onActivate"
    @dblclick.stop="startRename"
  >
    <!-- Active indicator / icon -->
    <span
      v-if="active"
      class="size-1.5 shrink-0 rounded-full"
      :style="{ backgroundColor: 'var(--brand-primary)' }"
      aria-hidden="true"
    />
    <UIcon
      v-else-if="session.pinned"
      name="i-lucide-pin"
      class="size-3 shrink-0"
      :style="{ color: 'var(--brand-primary)' }"
      aria-hidden="true"
    />
    <UIcon
      v-else
      name="i-lucide-message-circle"
      class="size-3 shrink-0"
      :style="{ color: 'var(--brand-text-muted)' }"
      aria-hidden="true"
    />

    <!-- Title — read-only span OR editable input -->
    <input
      v-if="renaming"
      ref="inputRef"
      v-model="draftTitle"
      type="text"
      class="session-row__input min-w-0 flex-1 rounded-sm bg-transparent px-1 py-0 text-[13px]"
      :style="{ color: 'var(--brand-text)', outline: `1.5px solid var(--brand-primary)` }"
      :placeholder="placeholder"
      maxlength="120"
      @click.stop
      @keydown.enter.prevent="commitRename"
      @keydown.escape.prevent="cancelRename"
      @blur="commitRename"
    />
    <span
      v-else
      class="min-w-0 flex-1 truncate text-[13px]"
      :style="{ color: 'var(--brand-text)' }"
    >{{ session.title ?? placeholder }}</span>

    <!-- Date / hover actions: date is the resting state, action row
         only appears on hover/focus-within. -->
    <span
      v-if="!renaming"
      class="session-row__date font-mono-tab text-[10.5px] tabular-nums shrink-0 transition-opacity"
      :style="{ color: active ? 'var(--brand-primary)' : 'var(--brand-text-muted)' }"
    >{{ relativeDate }}</span>

    <!--
      Hover actions: pin, rename, delete. Sit on top of the date
      via absolute positioning so they appear in-place when the
      user hovers / focuses the row. Each button stops propagation
      so clicking doesn't trigger the row's `select` emit.
    -->
    <div
      v-if="!renaming"
      class="session-row__actions"
      role="group"
      aria-label="Ações da conversa"
    >
      <button
        type="button"
        class="session-action"
        :class="{ 'is-active': session.pinned }"
        :aria-label="session.pinned ? 'Desafixar' : 'Fixar'"
        @click.stop="$emit('pin', session.id, !session.pinned)"
      >
        <UIcon
          :name="session.pinned ? 'i-lucide-pin-off' : 'i-lucide-pin'"
          class="size-3"
        />
      </button>
      <button
        type="button"
        class="session-action"
        aria-label="Renomear"
        @click.stop="startRename"
      >
        <UIcon name="i-lucide-pencil" class="size-3" />
      </button>
      <button
        type="button"
        class="session-action session-action--danger"
        aria-label="Apagar conversa"
        @click.stop="$emit('delete', session.id)"
      >
        <UIcon name="i-lucide-x" class="size-3" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Session {
  id: string
  title: string | null
  createdAt: string
  pinned?: boolean
}

const props = defineProps<{
  session: Session
  active: boolean
  /** Pre-formatted relative date string (e.g. "5min", "Hoje").
   *  Pre-computing in the parent keeps the formatter logic in one
   *  place and avoids re-doing it per row on every Vue tick. */
  relativeDate: string
  /** Placeholder shown when the session has no title set yet —
   *  matches the parent's existing fallback ("Sem título"). */
  placeholder?: string
}>()

const emit = defineEmits<{
  select: [id: string]
  delete: [id: string]
  pin: [id: string, pinned: boolean]
  rename: [id: string, title: string]
}>()

const placeholder = computed(() => props.placeholder ?? 'Sem título')

const renaming = ref(false)
const draftTitle = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const rowStyle = computed(() => {
  const isActive = props.active
  return {
    backgroundColor: isActive
      ? 'color-mix(in srgb, var(--brand-primary) 10%, transparent)'
      : 'transparent',
  }
})

function onActivate(): void {
  if (renaming.value) return
  emit('select', props.session.id)
}

function startRename(): void {
  if (renaming.value) return
  draftTitle.value = props.session.title ?? ''
  renaming.value = true
  // Focus + select on next tick so the input has rendered.
  void nextTick(() => {
    inputRef.value?.focus()
    inputRef.value?.select()
  })
}

function commitRename(): void {
  if (!renaming.value) return // Esc may have already closed
  const next = draftTitle.value.trim()
  renaming.value = false
  // Empty title or unchanged title — no API call. We use null to
  // restore the "Sem título" fallback when the user clears the
  // input intentionally; the parent decides whether to send null
  // to the backend or just ignore.
  if (next === (props.session.title ?? '')) return
  if (next.length === 0) return
  emit('rename', props.session.id, next)
}

function cancelRename(): void {
  renaming.value = false
  draftTitle.value = ''
}
</script>

<style scoped>
.session-row:hover {
  background-color: color-mix(in srgb, var(--brand-text) 4%, transparent);
}

.session-row__input {
  /* Match the size + line-height of the read-only title so the
     row doesn't jump when toggling. */
  border: none;
  font-family: var(--brand-font, system-ui);
  font-size: 13px;
  line-height: 1.3;
}

/* Hide the date on hover so the action row can take its slot
   without jumping the layout. */
.session-row:hover .session-row__date,
.session-row:focus-within .session-row__date {
  opacity: 0;
}

.session-row__actions {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 1px;
  padding: 2px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--brand-surface) 92%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-border) 40%, transparent);
  opacity: 0;
  pointer-events: none;
  transition: opacity 140ms ease-out;
}
.session-row:hover .session-row__actions,
.session-row:focus-within .session-row__actions {
  opacity: 1;
  pointer-events: auto;
}

.session-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  cursor: pointer;
  transition: background-color 120ms, color 120ms;
}
.session-action:hover {
  background-color: color-mix(in srgb, var(--brand-text) 10%, transparent);
  color: var(--brand-text);
}
.session-action.is-active {
  color: var(--brand-primary);
}
.session-action--danger:hover {
  background-color: color-mix(in srgb, var(--brand-negative) 14%, transparent);
  color: var(--brand-negative);
}
</style>

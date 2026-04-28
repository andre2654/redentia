<!--
  NotificationBell — floating bell + unread-count badge that lives at
  the top-right corner of the chat thread. Click opens the dedicated
  NotificationsDrawer.

  Was previously folded into the Painel audit drawer's "Alertas" tab.
  User feedback: "tirar o alerta da auditoria e ter um lugar dedicado"
  — alerts deserve their own quick-access surface because they're
  time-sensitive (price moves, decision revisits) and shouldn't be
  buried two clicks deep behind an audit panel that's mostly history.

  Visual restraint:
  - Same 36px round button shape as the close `X` next to it (so they
    read as a pair, not a soup of buttons).
  - Badge is a tight pill in brand-primary, only mounted when count
    > 0. Up to "9+" displayed; the actual count lives in the drawer.
  - No glow, no decorative animation. The badge appearing IS the
    signal.

  WIG compliance:
  - real <button>, aria-label that varies with count
  - focus-visible ring
  - touch-action: manipulation
-->
<template>
  <button
    type="button"
    class="notification-bell relative inline-flex size-9 items-center justify-center rounded-full backdrop-blur-md transition-colors"
    :style="{
      backgroundColor: `color-mix(in srgb, var(--brand-surface) 70%, transparent)`,
      border: `1px solid color-mix(in srgb, var(--brand-border) 40%, transparent)`,
      color: 'var(--brand-text)',
    }"
    :aria-label="ariaLabel"
    @click="$emit('open')"
  >
    <UIcon name="i-lucide-bell" class="size-4" />
    <span
      v-if="unreadCount > 0"
      class="notification-bell-badge font-mono-tab absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9.5px] font-bold tabular-nums leading-none"
      :style="{
        backgroundColor: 'var(--brand-primary)',
        color: 'var(--brand-background)',
      }"
      aria-hidden="true"
    >{{ displayCount }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  unreadCount: number
}>()

defineEmits<{ open: [] }>()

const brand = useBrand()

const displayCount = computed(() => (props.unreadCount > 9 ? '9+' : String(props.unreadCount)))

const ariaLabel = computed(() =>
  props.unreadCount > 0
    ? `Notificações, ${props.unreadCount} não lida(s)`
    : 'Notificações',
)
</script>

<style scoped>
.notification-bell {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.notification-bell:hover {
  background-color: color-mix(in srgb, currentColor 6%, transparent);
}
.notification-bell:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-primary, #f5a300);
}
</style>

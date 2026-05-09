<!--
  InboxBell — botao de sino global. So o trigger; o drawer e
  `<MoleculesInboxDrawer />` montado uma unica vez no app.vue. Click
  abre o drawer compartilhado via `useInbox().openDrawer()`.

  O badge mostra unread count unificado (chat alerts + admin notices).
  Off pra users nao autenticados.
-->
<template>
  <button
    v-if="authStore.isAuthenticated"
    type="button"
    class="inbox-bell"
    :aria-label="ariaLabel"
    @click="inbox.openDrawer()"
  >
    <UIcon name="i-lucide-bell" class="size-4" />
    <span v-if="unreadCount > 0" class="inbox-bell__badge" aria-hidden="true">
      {{ displayCount }}
    </span>
  </button>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const inbox = useInbox()

const unreadCount = inbox.unreadCount

const displayCount = computed(() => unreadCount.value > 9 ? '9+' : String(unreadCount.value))
const ariaLabel = computed(() => unreadCount.value
  ? `Inbox · ${unreadCount.value} não lida(s)`
  : 'Inbox')
</script>

<style scoped>
.inbox-bell {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms, border-color 150ms;
}
.inbox-bell:hover {
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  color: var(--brand-text);
  border-color: color-mix(in srgb, var(--brand-text) 22%, transparent);
}
.inbox-bell__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1;
  background: var(--brand-primary);
  color: var(--text-on-primary);
  font-variant-numeric: tabular-nums;
}
</style>

<!--
  InboxDrawer — drawer global de notificacoes. Mount unico no app.vue
  (level top da app), abre via `useInbox().openDrawer()` de qualquer
  surface (sino do chat em /help, sino do platform sidebar, etc).

  Lista unificada: alerts (chat) + notices (admin), ordenados por data
  desc. Cada item carrega `kind` pra renderizar com chips visuais
  diferentes (severity dot pros alerts, icon pros notices).
-->
<template>
  <Teleport to="body">
    <Transition name="inbox-drawer">
      <div
        v-if="authStore.isAuthenticated && open"
        class="inbox-drawer"
        @keydown.esc="inbox.closeDrawer()"
      >
        <button
          type="button"
          class="inbox-drawer__backdrop"
          aria-label="Fechar inbox"
          @click="inbox.closeDrawer()"
        />
        <aside class="inbox-drawer__panel" @click.stop>
          <header class="inbox-drawer__head">
            <div class="inbox-drawer__head-text">
              <span class="inbox-drawer__eyebrow">Inbox</span>
              <h2 class="inbox-drawer__title">Notificações</h2>
            </div>
            <div class="inbox-drawer__head-actions">
              <button
                v-if="items.length"
                type="button"
                class="inbox-drawer__clear"
                @click="onClearAll"
              >
                Limpar tudo
              </button>
              <button
                type="button"
                class="inbox-drawer__close"
                aria-label="Fechar"
                @click="inbox.closeDrawer()"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>
          </header>

          <div class="inbox-drawer__body">
            <div v-if="loading && !items.length" class="inbox-drawer__state">
              <UIcon name="i-lucide-loader-2" class="size-4 motion-safe:animate-spin" />
              Carregando…
            </div>
            <div v-else-if="!items.length" class="inbox-drawer__empty">
              <span class="inbox-drawer__empty-icon">
                <UIcon name="i-lucide-inbox" class="size-5" />
              </span>
              <span class="inbox-drawer__empty-title">Inbox vazio</span>
              <span class="inbox-drawer__empty-sub">
                Quando algo importante acontecer, vai aparecer aqui.
              </span>
            </div>
            <ul v-else class="inbox-drawer__list">
              <li
                v-for="item in items"
                :key="item.id"
                class="inbox-item"
                :class="{ 'inbox-item--unread': !item.readAt }"
              >
                <button
                  type="button"
                  class="inbox-item__main"
                  @click="onItemClick(item)"
                >
                  <span class="inbox-item__visual">
                    <span
                      v-if="item.kind === 'alert'"
                      class="inbox-item__dot"
                      :style="{ backgroundColor: severityColor(item.severity) }"
                      aria-hidden="true"
                    />
                    <UIcon
                      v-else
                      :name="item.icon || 'i-lucide-megaphone'"
                      class="inbox-item__icon size-3.5"
                    />
                  </span>
                  <div class="inbox-item__copy">
                    <header class="inbox-item__header">
                      <span class="inbox-item__title">{{ item.title }}</span>
                      <span class="inbox-item__source" :data-kind="item.kind">
                        {{ item.kind === 'alert' ? 'Alerta' : 'Aviso' }}
                      </span>
                    </header>
                    <p v-if="item.body" class="inbox-item__body">{{ item.body }}</p>
                    <footer class="inbox-item__footer">
                      <span v-if="item.ticker" class="inbox-item__ticker">{{ item.ticker }}</span>
                      <span v-if="item.linkLabel" class="inbox-item__cta">
                        <UIcon name="i-lucide-arrow-up-right" class="size-3" />
                        {{ item.linkLabel }}
                      </span>
                      <span class="inbox-item__time">{{ formatRelative(item.createdAt) }}</span>
                    </footer>
                  </div>
                </button>
                <button
                  type="button"
                  class="inbox-item__dismiss"
                  :aria-label="`Dispensar: ${item.title}`"
                  @click="inbox.dismissItem(item)"
                >
                  <UIcon name="i-lucide-x" class="size-3" />
                </button>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { InboxItem } from '~/composables/useInbox'

const authStore = useAuthStore()
const router = useRouter()
const inbox = useInbox()

const items = inbox.items
const loading = inbox.loading
const open = inbox.drawerOpen

// Refresh + auto-mark-read quando o drawer abre
watch(open, async (isOpen) => {
  if (!isOpen) return
  await inbox.refresh()
  items.value.forEach(item => {
    if (!item.readAt) inbox.markRead(item)
  })
})

async function onItemClick(item: InboxItem) {
  await inbox.markRead(item)
  if (item.kind === 'alert' && item.sessionId) {
    inbox.closeDrawer()
    router.push(`/help?session=${item.sessionId}`)
    return
  }
  if (item.kind === 'notice' && item.linkUrl) {
    const cfg = useRuntimeConfig()
    const baseURL = cfg.public.apiBaseUrl as string
    const id = (item.raw as { id: number }).id
    $fetch(`${baseURL}/communications/${id}/click`, {
      method: 'POST',
      headers: authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {},
    }).catch(() => null)
    if (item.linkUrl.startsWith('/')) {
      inbox.closeDrawer()
      router.push(item.linkUrl)
    } else {
      window.open(item.linkUrl, '_blank', 'noopener')
    }
  }
}

async function onClearAll() {
  await inbox.dismissAll()
}

function severityColor(s: string | null): string {
  if (s === 'critical') return 'var(--brand-negative, #ef4444)'
  if (s === 'warning') return 'var(--brand-warning)'
  return 'var(--brand-primary)'
}

function formatRelative(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'agora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

// Polling de notices fica responsabilidade do drawer global pra
// garantir que o badge funcione mesmo quando nenhum bell esta na tela
// (ex: em paginas que nao montam InboxBell mas o user ainda esta
// logado).
onMounted(() => {
  if (authStore.isAuthenticated) {
    inbox.startNoticePolling()
    inbox.alertsApi.refresh()
  }
})
onBeforeUnmount(() => {
  inbox.stopNoticePolling()
})
watch(() => authStore.isAuthenticated, (next) => {
  if (next) {
    inbox.startNoticePolling()
    inbox.alertsApi.refresh()
  } else {
    inbox.stopNoticePolling()
  }
})
</script>

<style scoped>
.inbox-drawer {
  position: fixed;
  inset: 0;
  z-index: 60;
}
.inbox-drawer__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  border: 0;
  cursor: pointer;
}
.inbox-drawer__panel {
  position: absolute;
  inset: 0 0 0 auto;
  width: 100%;
  max-width: 420px;
  background: var(--brand-background);
  border-left: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: -20px 0 50px -16px var(--shadow-amber-near);
}
.inbox-drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}
.inbox-drawer__head-text { display: flex; flex-direction: column; gap: 2px; }
.inbox-drawer__head-actions { display: inline-flex; align-items: center; gap: 8px; }
.inbox-drawer__eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.inbox-drawer__title {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: var(--brand-text);
}
.inbox-drawer__clear {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 14%, transparent);
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms, border-color 150ms;
}
.inbox-drawer__clear:hover {
  color: var(--brand-text);
  border-color: color-mix(in srgb, var(--brand-text) 28%, transparent);
}
.inbox-drawer__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms;
}
.inbox-drawer__close:hover {
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  color: var(--brand-text);
}
.inbox-drawer__body { flex: 1; overflow-y: auto; padding: 8px 0; }

.inbox-drawer__state {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 24px;
  font-size: 13px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.inbox-drawer__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 56px 24px;
  text-align: center;
}
.inbox-drawer__empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  color: var(--brand-primary);
}
.inbox-drawer__empty-title {
  font-family: var(--brand-font);
  font-size: 15px;
  font-weight: 500;
  color: var(--brand-text);
}
.inbox-drawer__empty-sub {
  font-size: 13px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  max-width: 280px;
  line-height: 1.5;
}

.inbox-drawer__list { list-style: none; margin: 0; padding: 0; }

/* ============ INBOX ITEM ============ */
.inbox-item {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 4px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 4%, transparent);
  transition: background 150ms;
}
.inbox-item:hover { background: color-mix(in srgb, var(--brand-primary) 5%, transparent); }
.inbox-item--unread { background: color-mix(in srgb, var(--brand-primary) 6%, transparent); }
.inbox-item__main {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 4px 12px 18px;
  background: transparent;
  border: 0;
  text-align: left;
  cursor: pointer;
}
.inbox-item__visual {
  flex-shrink: 0;
  margin-top: 4px;
  width: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.inbox-item__dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
}
.inbox-item__icon { color: color-mix(in srgb, var(--brand-text) 55%, transparent); }
.inbox-item--unread .inbox-item__icon { color: var(--brand-primary); }
.inbox-item__copy { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.inbox-item__header {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.inbox-item__title {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--brand-text);
  line-height: 1.35;
}
.inbox-item--unread .inbox-item__title { font-weight: 600; }
.inbox-item__source {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 1px 6px;
  border-radius: 3px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 14%, transparent);
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
.inbox-item__source[data-kind='notice'] {
  color: var(--brand-primary);
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
}
.inbox-item__body {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.45;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}
.inbox-item__footer {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.inbox-item__ticker {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 2px 6px;
  border-radius: 3px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 14%, transparent);
  color: var(--brand-text);
}
.inbox-item__cta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.inbox-item__time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  font-variant-numeric: tabular-nums;
}
.inbox-item__dismiss {
  display: inline-flex;
  align-items: flex-start;
  padding: 14px 14px 0 0;
  border: 0;
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  cursor: pointer;
  opacity: 0;
  transition: opacity 150ms, color 150ms;
}
.inbox-item:hover .inbox-item__dismiss,
.inbox-item:focus-within .inbox-item__dismiss { opacity: 1; }
.inbox-item__dismiss:hover { color: var(--brand-negative, #ef4444); }

.inbox-drawer-enter-active,
.inbox-drawer-leave-active { transition: opacity 200ms; }
.inbox-drawer-enter-active .inbox-drawer__panel,
.inbox-drawer-leave-active .inbox-drawer__panel {
  transition: transform 240ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.inbox-drawer-enter-from,
.inbox-drawer-leave-to { opacity: 0; }
.inbox-drawer-enter-from .inbox-drawer__panel,
.inbox-drawer-leave-to .inbox-drawer__panel { transform: translateX(100%); }
</style>

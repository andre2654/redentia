<!--
  /admin/leads — captured marketing leads.

  Visual: usa o admin design system (assets/css/admin.css). Tabela com
  hover/zebra, drawer lateral pra detail (refetch on open pra metadata
  fresca). Filtros operam tambem como query params pra que o admin
  bookmarke uma view (ex: "whitelabel últimos 7d") e mande pro time.
-->
<template>
  <NuxtLayout name="admin-panel">
    <div class="admin-page">
      <!-- ============ HEADER ============ -->
      <header class="admin-page__head">
        <div class="admin-page__head-left">
          <span class="admin-page__eyebrow">
            <UIcon name="i-lucide-magnet" />
            Leads
          </span>
          <h1 class="admin-page__title">Capturas das landings.</h1>
          <p class="admin-page__lead">
            Whitelabel, API, ebooks e creative em um lugar. Clique numa linha pra ver metadata.
          </p>
        </div>
        <div class="admin-page__actions">
          <span class="admin-stat">
            <span class="admin-stat__dot" />
            <span class="admin-stat__value">{{ stats?.total ?? 0 }}</span>
            total
            <template v-if="stats">
              <span class="admin-stat__sep" />
              <span class="admin-stat__value">+{{ stats.last_7d }}</span>
              em 7d
            </template>
          </span>
        </div>
      </header>

      <!-- ============ TOOLBAR ============ -->
      <div class="admin-toolbar">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por nome, email ou empresa..."
          class="admin-input admin-input--flex"
          @input="debouncedRefresh"
        />
        <div class="admin-toolbar__group">
          <select v-model="sourceFilter" class="admin-select" @change="refresh">
            <option value="">Todas as origens</option>
            <option value="whitelabel">Whitelabel</option>
            <option value="api">API</option>
            <option value="creative">Creative</option>
            <option value="ebook">Ebook</option>
            <option value="other">Outras</option>
          </select>
          <input v-model="since" type="date" class="admin-input" @change="refresh" />
          <input v-model="until" type="date" class="admin-input" @change="refresh" />
        </div>
      </div>

      <!-- ============ TABLE ============ -->
      <div class="admin-table">
        <div class="admin-table__scroll">
          <table>
            <caption class="sr-only">Lista de leads capturados</caption>
            <thead>
              <tr>
                <th scope="col">Capturado</th>
                <th scope="col">Nome / Email</th>
                <th scope="col">Empresa</th>
                <th scope="col">Contato</th>
                <th scope="col" class="admin-table__center">Origem</th>
                <th scope="col" class="admin-table__right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6">
                  <div class="admin-loading">
                    <span class="admin-loading__icon">
                      <UIcon name="i-lucide-loader-2" class="size-4 motion-safe:animate-spin" />
                    </span>
                    <span class="admin-loading__title">Carregando leads…</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="6">
                  <div class="admin-empty">
                    <span class="admin-empty__icon">
                      <UIcon name="i-lucide-inbox" class="size-4" />
                    </span>
                    <span class="admin-empty__title">Nenhum lead encontrado</span>
                    <span class="admin-empty__sub">Tente outros filtros ou aguarde novas capturas.</span>
                  </div>
                </td>
              </tr>
              <tr
                v-for="lead in items"
                v-else
                :key="lead.id"
                class="admin-table__row-clickable"
                @click="openDetail(lead)"
              >
                <td class="admin-table__cell-muted">
                  {{ formatDate(lead.created_at) }}
                </td>
                <th scope="row">
                  <div class="admin-table__primary">
                    <span class="admin-table__primary-name">{{ lead.name }}</span>
                    <span class="admin-table__primary-sub">{{ lead.email }}</span>
                  </div>
                </th>
                <td>
                  {{ lead.company || '—' }}
                </td>
                <td class="admin-table__cell-muted">
                  {{ lead.phone || '—' }}
                </td>
                <td class="admin-table__center">
                  <span class="admin-badge" :class="sourceBadgeClass(lead.source)">
                    {{ lead.source }}
                  </span>
                </td>
                <td class="admin-table__right" @click.stop>
                  <div class="admin-actions">
                    <button
                      type="button"
                      :disabled="busyIds.has(lead.id)"
                      class="admin-btn admin-btn--ghost admin-btn--xs"
                      @click="copyEmail(lead.email)"
                    >
                      <UIcon name="i-lucide-copy" class="size-3" />
                      Copiar email
                    </button>
                    <button
                      type="button"
                      :disabled="busyIds.has(lead.id)"
                      class="admin-btn admin-btn--danger admin-btn--xs"
                      @click="handleDelete(lead)"
                    >
                      <UIcon name="i-lucide-trash-2" class="size-3" />
                      Deletar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============ PAGINATION ============ -->
      <div v-if="meta && meta.last_page > 1" class="admin-pagination">
        <span class="admin-pagination__info">
          Página <strong>{{ meta.current_page }}</strong> de {{ meta.last_page }}
          <span class="admin-stat__sep" />
          <strong>{{ meta.total }}</strong> resultados
        </span>
        <div class="admin-actions">
          <button
            type="button"
            class="admin-btn admin-btn--ghost admin-btn--sm"
            :disabled="meta.current_page <= 1 || loading"
            @click="changePage(meta.current_page - 1)"
          >
            <UIcon name="i-lucide-chevron-left" class="size-3.5" />
            Anterior
          </button>
          <button
            type="button"
            class="admin-btn admin-btn--ghost admin-btn--sm"
            :disabled="meta.current_page >= meta.last_page || loading"
            @click="changePage(meta.current_page + 1)"
          >
            Próxima
            <UIcon name="i-lucide-chevron-right" class="size-3.5" />
          </button>
        </div>
      </div>

      <div v-if="error" class="admin-error">
        <UIcon name="i-lucide-alert-circle" class="size-4 shrink-0" />
        {{ error }}
      </div>
    </div>

    <!-- ============ DETAIL DRAWER ============ -->
    <Teleport to="body">
      <Transition name="lead-drawer">
        <div
          v-if="selected"
          class="fixed inset-0 z-50"
          @keydown.esc="closeDetail"
        >
          <button
            type="button"
            class="lead-drawer__backdrop"
            aria-label="Fechar detalhe"
            @click="closeDetail"
          />
          <aside class="lead-drawer__panel" @click.stop>
            <header class="lead-drawer__head">
              <span class="admin-page__eyebrow">
                Lead #{{ selected.id }}
              </span>
              <button
                type="button"
                class="admin-actions__icon-btn"
                aria-label="Fechar"
                @click="closeDetail"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </header>
            <div class="lead-drawer__body">
              <section class="lead-drawer__hero">
                <h2 class="lead-drawer__name">{{ selected.name }}</h2>
                <a
                  :href="`mailto:${selected.email}`"
                  class="lead-drawer__email"
                >
                  <UIcon name="i-lucide-mail" class="size-3.5" />
                  {{ selected.email }}
                </a>
              </section>

              <dl class="lead-drawer__grid">
                <div>
                  <dt>Origem</dt>
                  <dd>{{ selected.source }}</dd>
                </div>
                <div>
                  <dt>Plano</dt>
                  <dd>{{ selected.plan || '—' }}</dd>
                </div>
                <div>
                  <dt>Empresa</dt>
                  <dd>{{ selected.company || '—' }}</dd>
                </div>
                <div>
                  <dt>Telefone</dt>
                  <dd>{{ selected.phone || '—' }}</dd>
                </div>
                <div class="lead-drawer__grid-full">
                  <dt>Capturado em</dt>
                  <dd>{{ formatFullDate(selected.created_at) }}</dd>
                </div>
              </dl>

              <section v-if="selected.message" class="lead-drawer__section">
                <h3>Mensagem</h3>
                <p class="lead-drawer__message">{{ selected.message }}</p>
              </section>

              <section v-if="selected.metadata && Object.keys(selected.metadata).length > 0" class="lead-drawer__section">
                <h3>Metadata</h3>
                <pre class="lead-drawer__metadata">{{ JSON.stringify(selected.metadata, null, 2) }}</pre>
              </section>
            </div>
          </aside>
        </div>
      </Transition>
    </Teleport>

    <MoleculesConfirmDialog ref="confirmDialogRef" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { ILead, ILeadStats, LeadSource } from '~/types/lead'

definePageMeta({ middleware: ['admin-panel'] })

const leadsService = useLeadsService()
const items = ref<ILead[]>([])
const meta = ref<{ current_page: number; last_page: number; per_page: number; total: number } | null>(null)
const stats = ref<ILeadStats | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const sourceFilter = ref<'' | LeadSource>('')
const since = ref('')
const until = ref('')
const page = ref(1)

const busyIds = reactive(new Set<number>())
const selected = ref<ILead | null>(null)
const confirmDialogRef = ref<{
  open: (opts: {
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'destructive' | 'default'
  }) => Promise<boolean>
} | null>(null)

async function refresh() {
  loading.value = true
  error.value = null
  try {
    const params: Record<string, string | number> = { page: page.value }
    if (search.value) params.search = search.value
    if (sourceFilter.value) params.source = sourceFilter.value
    if (since.value) params.since = since.value
    if (until.value) params.until = until.value
    const resp = await leadsService.list(params)
    items.value = resp.data ?? []
    meta.value = resp.meta ?? null
  } catch (e) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err?.data?.message || err?.message || 'Erro ao carregar leads.'
    items.value = []
  } finally {
    loading.value = false
  }
}

async function refreshStats() {
  try {
    stats.value = await leadsService.stats()
  } catch {
    /* non-blocking */
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
function debouncedRefresh() {
  if (searchTimer) clearTimeout(searchTimer)
  page.value = 1
  searchTimer = setTimeout(refresh, 300)
}

function changePage(next: number) {
  page.value = next
  refresh()
}

async function openDetail(lead: ILead) {
  selected.value = lead
  try {
    const resp = await leadsService.show(lead.id)
    if (resp?.data) selected.value = resp.data
  } catch {
    /* keep optimistic row */
  }
}

function closeDetail() {
  selected.value = null
}

async function copyEmail(email: string) {
  try {
    await navigator.clipboard.writeText(email)
  } catch {
    /* clipboard not available, silent fail */
  }
}

async function handleDelete(lead: ILead) {
  const ok = await confirmDialogRef.value?.open({
    title: `Deletar o lead "${lead.name}"?`,
    description: `Email: ${lead.email}. Essa ação não pode ser desfeita.`,
    confirmLabel: 'Deletar',
    cancelLabel: 'Cancelar',
    variant: 'destructive',
  })
  if (!ok) return
  busyIds.add(lead.id)
  try {
    await leadsService.remove(lead.id)
    items.value = items.value.filter((i) => i.id !== lead.id)
    if (meta.value) meta.value.total = Math.max(0, meta.value.total - 1)
    if (selected.value?.id === lead.id) closeDetail()
  } catch (e) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err?.data?.message || err?.message || 'Erro ao deletar lead.'
  } finally {
    busyIds.delete(lead.id)
  }
}

function sourceBadgeClass(source: LeadSource): string {
  const map: Record<LeadSource, string> = {
    whitelabel: 'admin-badge--accent',
    api: 'admin-badge--positive',
    creative: '',
    ebook: '',
    other: '',
  }
  return map[source] ?? ''
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function formatFullDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })
}

onMounted(() => {
  refresh()
  refreshStats()
})
</script>

<style scoped>
.admin-table__row-clickable { cursor: pointer; }

.admin-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
.admin-pagination__info {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.admin-pagination__info strong {
  color: var(--brand-text);
  font-weight: 600;
}

.admin-error {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--brand-negative, #ef4444) 40%, transparent);
  background: color-mix(in srgb, var(--brand-negative, #ef4444) 8%, transparent);
  color: var(--brand-negative, #ef4444);
  font-size: 13px;
}

/* ============ DRAWER ============ */
.lead-drawer__backdrop {
  position: fixed;
  inset: 0;
  background: var(--shadow-ambient);
  border: 0;
  cursor: pointer;
}
.lead-drawer__panel {
  position: fixed;
  inset: 0 0 0 auto;
  z-index: 10;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-left: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  background: var(--brand-background);
}
.lead-drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
}
.lead-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.lead-drawer__hero { display: flex; flex-direction: column; gap: 4px; }
.lead-drawer__name {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.018em;
  color: var(--brand-text);
}
.lead-drawer__email {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--brand-primary);
  text-decoration: none;
}
.lead-drawer__email:hover { text-decoration: underline; text-underline-offset: 2px; }

.lead-drawer__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin: 0;
}
.lead-drawer__grid > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.lead-drawer__grid dt {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.lead-drawer__grid dd {
  margin: 0;
  font-size: 13px;
  color: var(--brand-text);
}
.lead-drawer__grid-full { grid-column: span 2; }

.lead-drawer__section h3 {
  margin: 0 0 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.lead-drawer__message {
  margin: 0;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  font-size: 13px;
  line-height: 1.55;
  color: var(--brand-text);
}
.lead-drawer__metadata {
  margin: 0;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  overflow-x: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  line-height: 1.55;
  color: var(--brand-text);
}

.lead-drawer-enter-active,
.lead-drawer-leave-active { transition: opacity 200ms ease-out; }
.lead-drawer-enter-active .lead-drawer__panel,
.lead-drawer-leave-active .lead-drawer__panel { transition: transform 240ms cubic-bezier(0.2, 0.7, 0.3, 1); }
.lead-drawer-enter-from,
.lead-drawer-leave-to { opacity: 0; }
.lead-drawer-enter-from .lead-drawer__panel,
.lead-drawer-leave-to .lead-drawer__panel { transform: translateX(20px); }
</style>

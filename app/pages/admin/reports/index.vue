<!--
  /admin/reports — user-submitted reports triage.

  Same visual contract as /admin/leads and /admin/users. Each row
  expands into a side drawer that shows the full description plus
  inline triage controls (status, priority, admin note). Filters
  for status / type / priority cover the day-to-day "what should I
  fix today" loop without needing pagination juggling.

  The triage controls write through immediately: changing the
  status select fires a PATCH; setting status=resolved auto-stamps
  resolved_at server-side. Admin note has its own save button so
  long edits don't fire on every keystroke.
-->
<template>
  <NuxtLayout name="admin-panel">
    <div class="admin-page">
      <header class="admin-page__head">
        <div class="admin-page__head-left">
          <span class="admin-page__eyebrow">
            <UIcon name="i-lucide-life-buoy" />
            Reports
          </span>
          <h1 class="admin-page__title">Problemas reportados.</h1>
          <p class="admin-page__lead">
            Triagem de bugs, sugestões e dúvidas dos usuários. Clique numa linha pra ver detalhes.
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
          <span v-if="stats && stats.open > 0" class="admin-stat admin-stat--accent">
            <UIcon name="i-lucide-alert-circle" class="size-3" />
            <span class="admin-stat__value">{{ stats.open }}</span>
            abertos
          </span>
        </div>
      </header>

      <!-- ============ TOOLBAR ============ -->
      <div class="admin-toolbar">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por título, descrição ou email do reporter..."
          class="admin-input admin-input--flex"
          @input="debouncedRefresh"
        />
        <div class="admin-toolbar__group">
          <select v-model="statusFilter" class="admin-select" @change="refresh">
            <option value="">Qualquer status</option>
            <option value="open">Abertos</option>
            <option value="in_progress">Em progresso</option>
            <option value="resolved">Resolvidos</option>
            <option value="wontfix">Wontfix</option>
          </select>
          <select v-model="typeFilter" class="admin-select" @change="refresh">
            <option value="">Qualquer tipo</option>
            <option value="bug">🐞 Bug</option>
            <option value="suggestion">💡 Sugestão</option>
            <option value="question">❓ Dúvida</option>
            <option value="other">✏️ Outro</option>
          </select>
          <select v-model="priorityFilter" class="admin-select" @change="refresh">
            <option value="">Qualquer prioridade</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>
      </div>

      <!-- ============ TABLE ============ -->
      <div class="admin-table">
        <div class="admin-table__scroll">
          <table>
            <caption class="sr-only">Lista de reports</caption>
            <thead>
              <tr>
                <th scope="col">Criado</th>
                <th scope="col" class="admin-table__center">Tipo</th>
                <th scope="col">Título</th>
                <th scope="col">Reporter</th>
                <th scope="col" class="admin-table__center">Status</th>
                <th scope="col" class="admin-table__center">Prio</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6">
                  <div class="admin-loading">
                    <span class="admin-loading__icon">
                      <UIcon name="i-lucide-loader-2" class="size-4 motion-safe:animate-spin" />
                    </span>
                    <span class="admin-loading__title">Carregando reports…</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="6">
                  <div class="admin-empty">
                    <span class="admin-empty__icon">
                      <UIcon name="i-lucide-shield-check" class="size-4" />
                    </span>
                    <span class="admin-empty__title">Nenhum report</span>
                    <span class="admin-empty__sub">Nada nos filtros atuais. Tudo limpo (ou tente outros filtros).</span>
                  </div>
                </td>
              </tr>
              <tr
                v-for="report in items"
                v-else
                :key="report.id"
                style="cursor: pointer;"
                @click="openDetail(report)"
              >
                <td class="admin-table__cell-muted">
                  {{ formatDate(report.created_at) }}
                </td>
                <td class="admin-table__center">
                  <span style="font-size: 14px;" :title="report.type">{{ TYPE_ICON[report.type] }}</span>
                </td>
                <th scope="row">
                  <span class="admin-table__primary-name line-clamp-1">{{ report.title }}</span>
                </th>
                <td class="admin-table__cell-muted">
                  {{ report.user?.email || report.guest_email || 'anônimo' }}
                </td>
                <td class="admin-table__center">
                  <span class="admin-badge" :class="reportStatusClass(report.status)">
                    <span class="admin-stat__dot" style="background-color: currentColor;" />
                    {{ STATUS_LABEL[report.status] }}
                  </span>
                </td>
                <td class="admin-table__center">
                  <span v-if="report.priority" class="admin-badge" :class="priorityClass(report.priority)">
                    {{ report.priority }}
                  </span>
                  <span v-else class="admin-table__cell-muted">—</span>
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

    <!-- Detail / triage drawer -->
    <Teleport to="body">
      <Transition name="report-drawer">
        <div
          v-if="selected"
          class="fixed inset-0 z-50"
          @keydown.esc="closeDetail"
        >
          <button
            type="button"
            class="fixed inset-0"
            :style="{ backgroundColor: 'var(--shadow-ambient)' }"
            aria-label="Fechar detalhe"
            @click="closeDetail"
          />
          <aside
            class="fixed bottom-0 right-0 top-0 z-10 flex w-full max-w-[560px] flex-col overflow-hidden border-l"
            :style="{ backgroundColor: C.background, borderColor: C.border }"
            @click.stop
          >
            <header
              class="flex items-center justify-between border-b px-5 py-4"
              :style="{ borderColor: C.border }"
            >
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                REPORT #{{ selected.id }} · {{ TYPE_ICON[selected.type] }} {{ selected.type }}
              </span>
              <button
                type="button"
                class="rounded-sm p-1.5 transition-colors hover:opacity-80"
                :style="{ color: C.textMuted }"
                aria-label="Fechar"
                @click="closeDetail"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </header>
            <div class="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
              <section>
                <h2 class="text-[20px] leading-tight" :style="{ color: C.text }">{{ selected.title }}</h2>
                <p class="mt-2 whitespace-pre-wrap text-[13px] leading-[1.6]" :style="{ color: C.text }">
                  {{ selected.description }}
                </p>
              </section>

              <!-- Triage controls -->
              <section
                class="grid grid-cols-2 gap-3 rounded-sm border p-3"
                :style="{ borderColor: C.border, backgroundColor: C.surface }"
              >
                <label class="flex flex-col gap-1.5">
                  <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">Status</span>
                  <select
                    :value="selected.status"
                    :disabled="patching"
                    class="rounded-sm border bg-transparent px-2 py-1.5 font-mono-tab text-[11px] uppercase tracking-[0.15em] outline-none transition-colors disabled:opacity-50"
                    :style="statusSelectStyle(selected.status)"
                    @change="(e) => patchStatus((e.target as HTMLSelectElement).value as ReportStatus)"
                  >
                    <option value="open">OPEN</option>
                    <option value="in_progress">IN PROGRESS</option>
                    <option value="resolved">RESOLVED</option>
                    <option value="wontfix">WONTFIX</option>
                  </select>
                </label>
                <label class="flex flex-col gap-1.5">
                  <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">Prioridade</span>
                  <select
                    :value="selected.priority ?? ''"
                    :disabled="patching"
                    class="rounded-sm border bg-transparent px-2 py-1.5 font-mono-tab text-[11px] uppercase tracking-[0.15em] outline-none transition-colors disabled:opacity-50"
                    :style="priorityFieldStyle(selected.priority)"
                    @change="(e) => patchPriority((e.target as HTMLSelectElement).value)"
                  >
                    <option value="">-</option>
                    <option value="high">ALTA</option>
                    <option value="medium">MÉDIA</option>
                    <option value="low">BAIXA</option>
                  </select>
                </label>
              </section>

              <section>
                <label class="flex flex-col gap-1.5">
                  <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
                    Nota interna (não vai pro reporter)
                  </span>
                  <textarea
                    v-model="adminNoteDraft"
                    rows="4"
                    placeholder="Investigação, links de PR, root cause..."
                    class="resize-y rounded-sm border bg-transparent px-3 py-2 text-[13px] leading-relaxed outline-none transition-colors"
                    :style="{ borderColor: C.border, color: C.text }"
                  />
                </label>
                <button
                  type="button"
                  class="mt-2 rounded-sm border px-3 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors hover:opacity-80 disabled:opacity-40"
                  :style="{ borderColor: C.border, color: C.text }"
                  :disabled="patching || adminNoteDraft === (selected.admin_note ?? '')"
                  @click="patchAdminNote"
                >
                  Salvar nota
                </button>
              </section>

              <!-- Reporter + auto-captured context -->
              <section
                class="rounded-sm border p-3"
                :style="{ borderColor: C.border, backgroundColor: C.surface }"
              >
                <h3 class="mb-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
                  Contexto
                </h3>
                <dl class="grid grid-cols-1 gap-1.5 text-[12px]">
                  <div class="flex flex-wrap gap-2">
                    <dt :style="{ color: C.textMuted }">Reporter:</dt>
                    <dd :style="{ color: C.text }">
                      <template v-if="selected.user">
                        {{ selected.user.name }} ({{ selected.user.email }})
                      </template>
                      <template v-else-if="selected.guest_email">
                        {{ selected.guest_email }} (anônimo)
                      </template>
                      <template v-else>-</template>
                    </dd>
                  </div>
                  <div v-if="selected.tenant_slug" class="flex flex-wrap gap-2">
                    <dt :style="{ color: C.textMuted }">Tenant:</dt>
                    <dd :style="{ color: C.text }">{{ selected.tenant_slug }}</dd>
                  </div>
                  <div v-if="selected.page_url" class="flex flex-wrap gap-2">
                    <dt :style="{ color: C.textMuted }">URL:</dt>
                    <dd>
                      <a
                        :href="selected.page_url"
                        target="_blank"
                        rel="noopener"
                        class="break-all underline-offset-2 hover:underline"
                        :style="{ color: C.primary }"
                      >{{ selected.page_url }}</a>
                    </dd>
                  </div>
                  <div v-if="selected.viewport" class="flex flex-wrap gap-2">
                    <dt :style="{ color: C.textMuted }">Viewport:</dt>
                    <dd class="font-mono-tab" :style="{ color: C.text }">{{ selected.viewport }}</dd>
                  </div>
                  <div v-if="selected.user_agent" class="flex flex-wrap gap-2">
                    <dt :style="{ color: C.textMuted }">UA:</dt>
                    <dd class="break-all font-mono-tab text-[11px]" :style="{ color: C.text }">{{ selected.user_agent }}</dd>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <dt :style="{ color: C.textMuted }">Criado:</dt>
                    <dd :style="{ color: C.text }">{{ formatFullDate(selected.created_at) }}</dd>
                  </div>
                  <div v-if="selected.resolved_at" class="flex flex-wrap gap-2">
                    <dt :style="{ color: C.textMuted }">Resolvido:</dt>
                    <dd :style="{ color: C.text }">{{ formatFullDate(selected.resolved_at) }}</dd>
                  </div>
                </dl>
              </section>
            </div>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F } from '~/utils/redentiaCreativeColors'
import type { IReport, IReportStats, ReportStatus, ReportType, ReportPriority } from '~/types/report'

definePageMeta({ middleware: ['admin-panel'] })

const reportsService = useReportsService()
const items = ref<IReport[]>([])
const meta = ref<{ current_page: number; last_page: number; per_page: number; total: number } | null>(null)
const stats = ref<IReportStats | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const statusFilter = ref<'' | ReportStatus>('')
const typeFilter = ref<'' | ReportType>('')
const priorityFilter = ref<'' | ReportPriority>('')
const page = ref(1)

const selected = ref<IReport | null>(null)
const adminNoteDraft = ref('')
const patching = ref(false)

const TYPE_ICON: Record<ReportType, string> = {
  bug: '🐞',
  suggestion: '💡',
  question: '❓',
  other: '✏️',
}

const STATUS_LABEL: Record<ReportStatus, string> = {
  open: 'OPEN',
  in_progress: 'WIP',
  resolved: 'RESOLVED',
  wontfix: 'WONTFIX',
}

async function refresh() {
  loading.value = true
  error.value = null
  try {
    const params: Record<string, string | number> = { page: page.value }
    if (search.value) params.search = search.value
    if (statusFilter.value) params.status = statusFilter.value
    if (typeFilter.value) params.type = typeFilter.value
    if (priorityFilter.value) params.priority = priorityFilter.value
    const resp = await reportsService.list(params)
    items.value = resp.data ?? []
    meta.value = resp.meta ?? null
  } catch (e) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err?.data?.message || err?.message || 'Erro ao carregar reports.'
    items.value = []
  } finally {
    loading.value = false
  }
}

async function refreshStats() {
  try {
    stats.value = await reportsService.stats()
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

async function openDetail(report: IReport) {
  selected.value = report
  adminNoteDraft.value = report.admin_note ?? ''
  try {
    const resp = await reportsService.show(report.id)
    if (resp?.data) {
      selected.value = resp.data
      adminNoteDraft.value = resp.data.admin_note ?? ''
    }
  } catch {
    /* keep optimistic row */
  }
}

function closeDetail() {
  selected.value = null
  adminNoteDraft.value = ''
}

async function applyPatch(body: { status?: ReportStatus; priority?: ReportPriority | null; admin_note?: string | null }) {
  if (!selected.value) return
  patching.value = true
  try {
    const resp = await reportsService.update(selected.value.id, body)
    if (resp?.data) {
      // Mutate the item in the list AND the selected ref so both
      // surfaces reflect the new state without a full refetch.
      const idx = items.value.findIndex((i) => i.id === resp.data.id)
      if (idx >= 0) items.value[idx] = resp.data
      selected.value = resp.data
      void refreshStats()
    }
  } catch (e) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err?.data?.message || err?.message || 'Erro ao atualizar report.'
  } finally {
    patching.value = false
  }
}

function patchStatus(value: ReportStatus) {
  void applyPatch({ status: value })
}

function patchPriority(value: string) {
  void applyPatch({ priority: (value || null) as ReportPriority | null })
}

function patchAdminNote() {
  void applyPatch({ admin_note: adminNoteDraft.value || null })
}

function statusBadgeStyle(status: ReportStatus) {
  const map: Record<ReportStatus, { borderColor: string; color: string }> = {
    open: { borderColor: C.primary, color: C.primary },
    in_progress: { borderColor: C.secondary, color: C.secondary },
    resolved: { borderColor: C.positive, color: C.positive },
    wontfix: { borderColor: C.border, color: C.textMuted },
  }
  return map[status]
}

function reportStatusClass(status: ReportStatus): string {
  const map: Record<ReportStatus, string> = {
    open: 'admin-badge--accent',
    in_progress: '',
    resolved: 'admin-badge--positive',
    wontfix: '',
  }
  return map[status] || ''
}

function priorityClass(priority: ReportPriority): string {
  const map: Record<ReportPriority, string> = {
    high: 'admin-badge--negative',
    medium: 'admin-badge--accent',
    low: '',
  }
  return map[priority] || ''
}

function statusSelectStyle(status: ReportStatus) {
  return { ...statusBadgeStyle(status), backgroundColor: 'transparent' }
}

function priorityStyle(priority: ReportPriority) {
  const map: Record<ReportPriority, { color: string }> = {
    high: { color: C.negative },
    medium: { color: C.primary },
    low: { color: C.textMuted },
  }
  return map[priority]
}

function priorityFieldStyle(priority: ReportPriority | null) {
  const safe: ReportPriority = priority ?? 'low'
  return {
    borderColor: priorityStyle(safe).color,
    color: priorityStyle(safe).color,
    backgroundColor: 'transparent',
  }
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
.font-mono-tab {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-feature-settings: 'tnum' 1;
}

.report-drawer-enter-active,
.report-drawer-leave-active {
  transition: opacity 200ms ease-out;
}
.report-drawer-enter-active aside,
.report-drawer-leave-active aside {
  transition: transform 240ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.report-drawer-enter-from,
.report-drawer-leave-to {
  opacity: 0;
}
.report-drawer-enter-from aside,
.report-drawer-leave-to aside {
  transform: translateX(20px);
}
</style>

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
    <div class="mx-auto flex max-w-6xl flex-col gap-6">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">Reports</span>
          <h1 class="mt-2 text-[28px] leading-tight md:text-[36px]" :style="{ color: C.text, fontFamily: F.display }">
            Problemas reportados.
          </h1>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
            :style="{ borderColor: C.border, color: C.textMuted }"
          >
            <span class="size-1.5 rounded-full" :style="{ backgroundColor: C.primary }" />
            {{ stats?.total ?? 0 }} total
            <template v-if="stats">
              · +{{ stats.last_7d }} em 7d
            </template>
          </span>
          <span
            v-if="stats && stats.open > 0"
            class="inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
            :style="{ borderColor: C.primary, color: C.primary }"
          >
            <UIcon name="i-lucide-alert-circle" class="size-3" />
            {{ stats.open }} abertos
          </span>
        </div>
      </header>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por título, descrição ou email do reporter..."
          class="flex-1 min-w-[220px] rounded-sm border bg-transparent px-4 py-2 text-[13px] outline-none transition-colors"
          :style="{ borderColor: C.border, color: C.text }"
          @input="debouncedRefresh"
        />
        <select
          v-model="statusFilter"
          class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
          :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }"
          @change="refresh"
        >
          <option value="">Qualquer status</option>
          <option value="open">Abertos</option>
          <option value="in_progress">Em progresso</option>
          <option value="resolved">Resolvidos</option>
          <option value="wontfix">Wontfix</option>
        </select>
        <select
          v-model="typeFilter"
          class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
          :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }"
          @change="refresh"
        >
          <option value="">Qualquer tipo</option>
          <option value="bug">🐞 Bug</option>
          <option value="suggestion">💡 Sugestão</option>
          <option value="question">❓ Dúvida</option>
          <option value="other">✏️ Outro</option>
        </select>
        <select
          v-model="priorityFilter"
          class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
          :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }"
          @change="refresh"
        >
          <option value="">Qualquer prioridade</option>
          <option value="high">Alta</option>
          <option value="medium">Média</option>
          <option value="low">Baixa</option>
        </select>
      </div>

      <!-- Table -->
      <div class="overflow-hidden rounded-sm border" :style="{ borderColor: C.border }">
        <table class="w-full text-left">
          <caption class="sr-only">Lista de reports</caption>
          <thead
            class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
            :style="{ color: C.textMuted, backgroundColor: C.surface }"
          >
            <tr>
              <th scope="col" class="px-4 py-3">CRIADO</th>
              <th scope="col" class="px-4 py-3 text-center">TIPO</th>
              <th scope="col" class="px-4 py-3">TÍTULO</th>
              <th scope="col" class="px-4 py-3">REPORTER</th>
              <th scope="col" class="px-4 py-3 text-center">STATUS</th>
              <th scope="col" class="px-4 py-3 text-center">PRIO</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="p-8 text-center" :style="{ color: C.textMuted }">
                <UIcon name="i-lucide-loader-2" class="size-5 motion-safe:animate-spin" />
              </td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="6" class="p-8 text-center text-[13px]" :style="{ color: C.textMuted }">
                Nenhum report com esses filtros.
              </td>
            </tr>
            <tr
              v-for="report in items"
              v-else
              :key="report.id"
              class="border-t cursor-pointer transition-colors hover:brightness-110"
              :style="{ borderColor: C.border, backgroundColor: C.surface }"
              @click="openDetail(report)"
            >
              <td class="px-4 py-3 font-mono-tab text-[11px] tabular-nums" :style="{ color: C.textMuted }">
                {{ formatDate(report.created_at) }}
              </td>
              <td class="px-4 py-3 text-center">
                <span class="text-[14px]" :title="report.type">{{ TYPE_ICON[report.type] }}</span>
              </td>
              <th scope="row" class="px-4 py-3 text-left font-normal" :style="{ color: C.text }">
                <span class="line-clamp-1 text-[13px] font-medium">{{ report.title }}</span>
              </th>
              <td class="px-4 py-3 font-mono-tab text-[11px]" :style="{ color: C.textMuted }">
                {{ report.user?.email || report.guest_email || 'anônimo' }}
              </td>
              <td class="px-4 py-3 text-center">
                <span
                  class="inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
                  :style="statusBadgeStyle(report.status)"
                >
                  <span class="size-1.5 rounded-full" :style="{ backgroundColor: 'currentColor' }" />
                  {{ STATUS_LABEL[report.status] }}
                </span>
              </td>
              <td class="px-4 py-3 text-center font-mono-tab text-[10px] uppercase tracking-[0.15em]">
                <span v-if="report.priority" :style="priorityStyle(report.priority)">
                  {{ report.priority }}
                </span>
                <span v-else :style="{ color: C.textMuted }">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="meta && meta.last_page > 1"
        class="flex items-center justify-between font-mono-tab text-[11px]"
        :style="{ color: C.textMuted }"
      >
        <span>Página {{ meta.current_page }} de {{ meta.last_page }} · {{ meta.total }} resultados</span>
        <div class="inline-flex gap-2">
          <button
            type="button"
            class="rounded-sm border px-3 py-1.5 uppercase tracking-[0.15em] transition-colors hover:opacity-80 disabled:opacity-40"
            :style="{ borderColor: C.border, color: C.text }"
            :disabled="meta.current_page <= 1 || loading"
            @click="changePage(meta.current_page - 1)"
          >Anterior</button>
          <button
            type="button"
            class="rounded-sm border px-3 py-1.5 uppercase tracking-[0.15em] transition-colors hover:opacity-80 disabled:opacity-40"
            :style="{ borderColor: C.border, color: C.text }"
            :disabled="meta.current_page >= meta.last_page || loading"
            @click="changePage(meta.current_page + 1)"
          >Próxima</button>
        </div>
      </div>

      <div v-if="error" class="rounded-sm border px-4 py-3 text-[13px]" :style="{ borderColor: C.negative, color: C.negative }">
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
            :style="{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }"
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
                <h2 class="text-[20px] font-semibold leading-tight" :style="{ color: C.text }">{{ selected.title }}</h2>
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

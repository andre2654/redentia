<!--
  /admin/leads — captured marketing leads.

  Visual language follows /admin/tenants/index: same surface tones,
  same mono-tab eyebrow + 28-36px display headline, same table chrome.
  Filters the URL query string (search, source, since, until) so the
  admin can bookmark a filtered view (e.g. "all whitelabel leads from
  last week") and share the link with sales.

  Detail drawer is server-driven: clicking a row fetches show()
  instead of trusting the row payload, so the admin always sees
  fresh metadata even if the list was paginated 2 minutes ago.
-->
<template>
  <NuxtLayout name="admin-panel">
    <div class="mx-auto flex max-w-6xl flex-col gap-6">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">Leads</span>
          <h1 class="mt-2 text-[28px] leading-tight md:text-[36px]" :style="{ color: C.text, fontFamily: F.display }">
            Capturas das landings.
          </h1>
        </div>
        <div class="flex items-center gap-2">
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
        </div>
      </header>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por nome, email ou empresa..."
          class="flex-1 min-w-[200px] rounded-sm border bg-transparent px-4 py-2 text-[13px] outline-none transition-colors"
          :style="{ borderColor: C.border, color: C.text }"
          @input="debouncedRefresh"
        />
        <select
          v-model="sourceFilter"
          class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
          :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }"
          @change="refresh"
        >
          <option value="">Todas as origens</option>
          <option value="whitelabel">Whitelabel</option>
          <option value="api">API</option>
          <option value="creative">Creative</option>
          <option value="ebook">Ebook</option>
          <option value="other">Outras</option>
        </select>
        <input
          v-model="since"
          type="date"
          class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
          :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }"
          @change="refresh"
        />
        <input
          v-model="until"
          type="date"
          class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
          :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }"
          @change="refresh"
        />
      </div>

      <!-- Table -->
      <div class="overflow-hidden rounded-sm border" :style="{ borderColor: C.border }">
        <table class="w-full text-left">
          <caption class="sr-only">Lista de leads capturados</caption>
          <thead
            class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
            :style="{ color: C.textMuted, backgroundColor: C.surface }"
          >
            <tr>
              <th scope="col" class="px-4 py-3">CAPTURADO</th>
              <th scope="col" class="px-4 py-3">NOME / EMAIL</th>
              <th scope="col" class="px-4 py-3">EMPRESA</th>
              <th scope="col" class="px-4 py-3">CONTATO</th>
              <th scope="col" class="px-4 py-3 text-center">ORIGEM</th>
              <th scope="col" class="px-4 py-3 text-right">AÇÕES</th>
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
                Nenhum lead encontrado com esses filtros.
              </td>
            </tr>
            <tr
              v-for="lead in items"
              v-else
              :key="lead.id"
              class="border-t cursor-pointer transition-colors hover:brightness-110"
              :style="{ borderColor: C.border, backgroundColor: C.surface }"
              @click="openDetail(lead)"
            >
              <td class="px-4 py-3 font-mono-tab text-[11px] tabular-nums" :style="{ color: C.textMuted }">
                {{ formatDate(lead.created_at) }}
              </td>
              <th scope="row" class="px-4 py-3 text-left font-normal" :style="{ color: C.text }">
                <div class="flex flex-col">
                  <span class="text-[13px] font-medium">{{ lead.name }}</span>
                  <span class="font-mono-tab text-[11px]" :style="{ color: C.textMuted }">{{ lead.email }}</span>
                </div>
              </th>
              <td class="px-4 py-3 text-[12px]" :style="{ color: C.text }">
                {{ lead.company || '-' }}
              </td>
              <td class="px-4 py-3 font-mono-tab text-[11px]" :style="{ color: C.textMuted }">
                {{ lead.phone || '-' }}
              </td>
              <td class="px-4 py-3 text-center">
                <span
                  class="inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
                  :style="sourceBadgeStyle(lead.source)"
                >
                  {{ lead.source }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="inline-flex gap-2" @click.stop>
                  <button
                    type="button"
                    :disabled="busyIds.has(lead.id)"
                    class="rounded-sm border px-2 py-1 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors hover:opacity-80 disabled:opacity-40"
                    :style="{ borderColor: C.border, color: C.text }"
                    @click="copyEmail(lead.email)"
                  >COPIAR EMAIL</button>
                  <button
                    type="button"
                    :disabled="busyIds.has(lead.id)"
                    class="rounded-sm border px-2 py-1 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors hover:opacity-80 disabled:opacity-40"
                    :style="{ borderColor: C.negative, color: C.negative }"
                    @click="handleDelete(lead)"
                  >DELETAR</button>
                </div>
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

    <!-- Detail drawer (right slide-over). Refetches on open so the
         admin sees current `metadata` even if the list snapshot is
         stale. Closes on backdrop click or Esc. -->
    <Teleport to="body">
      <Transition name="lead-drawer">
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
            class="fixed bottom-0 right-0 top-0 z-10 flex w-full max-w-[480px] flex-col overflow-hidden border-l"
            :style="{ backgroundColor: C.background, borderColor: C.border }"
            @click.stop
          >
            <header
              class="flex items-center justify-between border-b px-5 py-4"
              :style="{ borderColor: C.border }"
            >
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                LEAD #{{ selected.id }}
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
                <h2 class="text-[20px] font-semibold" :style="{ color: C.text }">{{ selected.name }}</h2>
                <a
                  :href="`mailto:${selected.email}`"
                  class="mt-1 inline-flex items-center gap-1.5 font-mono-tab text-[12px] underline-offset-2 hover:underline"
                  :style="{ color: C.primary }"
                >
                  <UIcon name="i-lucide-mail" class="size-3.5" />
                  {{ selected.email }}
                </a>
              </section>

              <dl class="grid grid-cols-2 gap-3 text-[12px]">
                <div class="flex flex-col">
                  <dt class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">Origem</dt>
                  <dd :style="{ color: C.text }">{{ selected.source }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">Plano</dt>
                  <dd :style="{ color: C.text }">{{ selected.plan || '-' }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">Empresa</dt>
                  <dd :style="{ color: C.text }">{{ selected.company || '-' }}</dd>
                </div>
                <div class="flex flex-col">
                  <dt class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">Telefone</dt>
                  <dd :style="{ color: C.text }">{{ selected.phone || '-' }}</dd>
                </div>
                <div class="flex flex-col col-span-2">
                  <dt class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">Capturado em</dt>
                  <dd :style="{ color: C.text }">{{ formatFullDate(selected.created_at) }}</dd>
                </div>
              </dl>

              <section v-if="selected.message">
                <h3 class="mb-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">Mensagem</h3>
                <p class="rounded-sm border p-3 text-[13px] leading-relaxed" :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }">
                  {{ selected.message }}
                </p>
              </section>

              <section v-if="selected.metadata && Object.keys(selected.metadata).length > 0">
                <h3 class="mb-2 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">Metadata</h3>
                <pre
                  class="overflow-x-auto rounded-sm border p-3 font-mono-tab text-[11px] leading-relaxed"
                  :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }"
                >{{ JSON.stringify(selected.metadata, null, 2) }}</pre>
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
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F } from '~/utils/redentiaCreativeColors'
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
    // Stats failure is non-blocking, header just shows 0.
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
function debouncedRefresh() {
  if (searchTimer) clearTimeout(searchTimer)
  // Reset to page 1 when filters change so the user doesn't land on
  // page 4 of an empty filtered list.
  page.value = 1
  searchTimer = setTimeout(refresh, 300)
}

function changePage(next: number) {
  page.value = next
  refresh()
}

async function openDetail(lead: ILead) {
  // Refetch fresh detail (metadata may have been mutated since the
  // list was loaded). Optimistic open with the row data, then swap.
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

function sourceBadgeStyle(source: LeadSource) {
  // Each source gets a subtle tint so the table is scannable. We
  // only use the brand palette, no rainbow.
  const map: Record<LeadSource, { borderColor: string; color: string }> = {
    whitelabel: { borderColor: C.primary, color: C.primary },
    api: { borderColor: C.positive, color: C.positive },
    creative: { borderColor: C.secondary, color: C.secondary },
    ebook: { borderColor: C.text, color: C.text },
    other: { borderColor: C.border, color: C.textMuted },
  }
  return map[source] ?? map.other
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

.lead-drawer-enter-active,
.lead-drawer-leave-active {
  transition: opacity 200ms ease-out;
}
.lead-drawer-enter-active aside,
.lead-drawer-leave-active aside {
  transition: transform 240ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.lead-drawer-enter-from,
.lead-drawer-leave-to {
  opacity: 0;
}
.lead-drawer-enter-from aside,
.lead-drawer-leave-to aside {
  transform: translateX(20px);
}
</style>

<!--
  /admin/tenants — listagem de white-labels.

  Visual: usa o admin design system. Toggle de status inline (clica
  no badge). Acoes: editar, clonar, deletar. CTA "Novo tenant" no
  header direito.
-->
<template>
  <NuxtLayout name="admin-panel">
    <div class="admin-page">
      <!-- ============ HEADER ============ -->
      <header class="admin-page__head">
        <div class="admin-page__head-left">
          <span class="admin-page__eyebrow">
            <UIcon name="i-lucide-building-2" />
            Tenants
          </span>
          <h1 class="admin-page__title">White-labels cadastrados.</h1>
          <p class="admin-page__lead">
            Cada tenant é uma marca isolada com domínio, brand config e billing próprios.
          </p>
        </div>
        <NuxtLink to="/admin/tenants/new" class="admin-btn admin-btn--primary">
          <UIcon name="i-lucide-plus" class="size-4" />
          Novo tenant
        </NuxtLink>
      </header>

      <!-- ============ TOOLBAR ============ -->
      <div class="admin-toolbar">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por slug ou nome…"
          class="admin-input admin-input--flex"
          @input="debouncedRefresh"
        />
        <select v-model="activeFilter" class="admin-select" @change="refresh">
          <option value="">Todos os status</option>
          <option value="true">Apenas ativos</option>
          <option value="false">Apenas inativos</option>
        </select>
      </div>

      <!-- ============ TABLE ============ -->
      <div class="admin-table">
        <div class="admin-table__scroll">
          <table>
            <caption class="sr-only">Lista de tenants</caption>
            <thead>
              <tr>
                <th scope="col">Slug</th>
                <th scope="col">Nome</th>
                <th scope="col">Domínio</th>
                <th scope="col" class="admin-table__center">Status</th>
                <th scope="col">Atualizado</th>
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
                    <span class="admin-loading__title">Carregando tenants…</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="6">
                  <div class="admin-empty">
                    <span class="admin-empty__icon">
                      <UIcon name="i-lucide-building" class="size-4" />
                    </span>
                    <span class="admin-empty__title">Nenhum tenant encontrado</span>
                    <span class="admin-empty__sub">Tente outros filtros ou crie um novo.</span>
                  </div>
                </td>
              </tr>
              <tr v-for="t in items" v-else :key="t.id">
                <td>
                  <span class="tenant-slug">{{ t.slug }}</span>
                </td>
                <th scope="row">
                  <span class="admin-table__primary-name">{{ t.name }}</span>
                </th>
                <td class="admin-table__cell-muted">{{ t.domain || '—' }}</td>
                <td class="admin-table__center">
                  <button
                    type="button"
                    class="admin-badge"
                    :class="t.is_active ? 'admin-badge--positive' : ''"
                    style="cursor: pointer;"
                    :disabled="busyIds.has(t.id)"
                    :title="t.is_active ? 'Clique pra desativar' : 'Clique pra ativar'"
                    @click="handleToggle(t)"
                  >
                    <span
                      class="admin-stat__dot"
                      :style="{ backgroundColor: t.is_active ? 'var(--brand-positive, #10b981)' : 'currentColor' }"
                    />
                    {{ t.is_active ? 'Ativo' : 'Inativo' }}
                  </button>
                </td>
                <td class="admin-table__cell-muted">
                  {{ formatDate(t.updated_at) }}
                </td>
                <td class="admin-table__right">
                  <div class="admin-actions">
                    <NuxtLink
                      :to="`/admin/tenants/${t.id}`"
                      class="admin-btn admin-btn--ghost admin-btn--xs"
                    >
                      <UIcon name="i-lucide-pencil" class="size-3" />
                      Editar
                    </NuxtLink>
                    <button
                      type="button"
                      :disabled="busyIds.has(t.id)"
                      class="admin-btn admin-btn--ghost admin-btn--xs"
                      @click="handleDuplicate(t)"
                    >
                      <UIcon name="i-lucide-copy" class="size-3" />
                      Clonar
                    </button>
                    <button
                      type="button"
                      :disabled="busyIds.has(t.id)"
                      class="admin-btn admin-btn--danger admin-btn--xs"
                      @click="handleDelete(t)"
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

      <div v-if="error" class="admin-error">
        <UIcon name="i-lucide-alert-circle" class="size-4 shrink-0" />
        {{ error }}
      </div>
    </div>
    <MoleculesConfirmDialog ref="confirmDialogRef" />
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin-panel'] })

const tenantsService = useTenantsService()
const items = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('')
const activeFilter = ref<'' | 'true' | 'false'>('')
const busyIds = reactive(new Set<number>())
const confirmDialogRef = ref<{ open: (opts: { title: string; description?: string; confirmLabel?: string; cancelLabel?: string; variant?: 'destructive' | 'default' }) => Promise<boolean> } | null>(null)

async function refresh() {
  loading.value = true
  error.value = null
  try {
    const params: Record<string, any> = {}
    if (search.value) params.search = search.value
    if (activeFilter.value !== '') params.active = activeFilter.value
    const resp = await tenantsService.list(params)
    items.value = Array.isArray(resp) ? resp : (resp?.data || [])
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Erro ao carregar tenants.'
    items.value = []
  } finally {
    loading.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
function debouncedRefresh() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(refresh, 300)
}

async function handleToggle(t: any) {
  busyIds.add(t.id)
  try {
    const resp = await tenantsService.toggleActive(t.id)
    const updated = resp?.data || resp
    Object.assign(t, updated)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Erro ao alternar status.'
  } finally {
    busyIds.delete(t.id)
  }
}

async function handleDuplicate(t: any) {
  busyIds.add(t.id)
  try {
    await tenantsService.duplicate(t.id)
    await refresh()
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Erro ao clonar tenant.'
  } finally {
    busyIds.delete(t.id)
  }
}

async function handleDelete(t: any) {
  const ok = await confirmDialogRef.value?.open({
    title: `Deletar o tenant "${t.name}"?`,
    description: `Slug: ${t.slug}. Essa ação não pode ser desfeita.`,
    confirmLabel: 'Deletar',
    cancelLabel: 'Cancelar',
    variant: 'destructive',
  })
  if (!ok) return
  busyIds.add(t.id)
  try {
    await tenantsService.remove(t.id)
    items.value = items.value.filter(i => i.id !== t.id)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Erro ao deletar tenant.'
  } finally {
    busyIds.delete(t.id)
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(refresh)
</script>

<style scoped>
.tenant-slug {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--brand-primary);
  letter-spacing: -0.005em;
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
</style>

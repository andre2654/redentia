<template>
  <NuxtLayout name="admin-panel">
    <div class="mx-auto flex max-w-6xl flex-col gap-6">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">[TENANTS]</span>
          <h1 class="mt-2 text-[28px] leading-tight md:text-[36px]" :style="{ color: C.text, fontFamily: F.display }">
            White-labels cadastrados.
          </h1>
        </div>
        <NuxtLink
          to="/admin/tenants/new"
          class="inline-flex items-center gap-2 rounded-sm px-4 py-2.5 font-mono-tab text-[11px] font-bold uppercase tracking-[0.15em] transition-all hover:opacity-90"
          :style="{ backgroundColor: C.primary, color: C.background }"
        >
          <UIcon name="i-lucide-plus" class="size-4" />
          NOVO TENANT
        </NuxtLink>
      </header>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por slug ou nome…"
          class="flex-1 min-w-[200px] rounded-sm border bg-transparent px-4 py-2 text-[13px] outline-none transition-colors"
          :style="{ borderColor: C.border, color: C.text }"
          @input="debouncedRefresh"
        />
        <select
          v-model="activeFilter"
          class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
          :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }"
          @change="refresh"
        >
          <option value="">Todos os status</option>
          <option value="true">Apenas ativos</option>
          <option value="false">Apenas inativos</option>
        </select>
      </div>

      <!-- Table -->
      <div class="overflow-hidden rounded-sm border" :style="{ borderColor: C.border }">
        <table class="w-full text-left">
          <thead class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted, backgroundColor: C.surface }">
            <tr>
              <th class="px-4 py-3">SLUG</th>
              <th class="px-4 py-3">NOME</th>
              <th class="px-4 py-3">DOMÍNIO</th>
              <th class="px-4 py-3 text-center">STATUS</th>
              <th class="px-4 py-3">ATUALIZADO</th>
              <th class="px-4 py-3 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="p-8 text-center" :style="{ color: C.textMuted }">
                <UIcon name="i-lucide-loader-2" class="size-5 animate-spin" />
              </td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="6" class="p-8 text-center text-[13px]" :style="{ color: C.textMuted }">
                Nenhum tenant encontrado.
              </td>
            </tr>
            <tr
              v-for="t in items"
              v-else
              :key="t.id"
              class="border-t transition-colors hover:brightness-110"
              :style="{ borderColor: C.border, backgroundColor: C.surface }"
            >
              <td class="px-4 py-3 font-mono-tab text-[12px]" :style="{ color: C.primary }">{{ t.slug }}</td>
              <td class="px-4 py-3 text-[13px]" :style="{ color: C.text }">{{ t.name }}</td>
              <td class="px-4 py-3 text-[12px]" :style="{ color: C.textMuted }">{{ t.domain || '—' }}</td>
              <td class="px-4 py-3 text-center">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors hover:opacity-80"
                  :style="t.is_active
                    ? { borderColor: C.positive, color: C.positive }
                    : { borderColor: C.border, color: C.textMuted }"
                  :disabled="busyIds.has(t.id)"
                  @click="handleToggle(t)"
                >
                  <span class="size-1.5 rounded-full" :style="{ backgroundColor: t.is_active ? C.positive : C.textMuted }" />
                  {{ t.is_active ? 'ATIVO' : 'INATIVO' }}
                </button>
              </td>
              <td class="px-4 py-3 text-[12px]" :style="{ color: C.textMuted }">
                {{ formatDate(t.updated_at) }}
              </td>
              <td class="px-4 py-3 text-right">
                <div class="inline-flex gap-2">
                  <NuxtLink
                    :to="`/admin/tenants/${t.id}`"
                    class="rounded-sm border px-2 py-1 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors hover:opacity-80"
                    :style="{ borderColor: C.border, color: C.text }"
                  >EDITAR</NuxtLink>
                  <button
                    type="button"
                    :disabled="busyIds.has(t.id)"
                    class="rounded-sm border px-2 py-1 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors hover:opacity-80 disabled:opacity-40"
                    :style="{ borderColor: C.border, color: C.textMuted }"
                    @click="handleDuplicate(t)"
                  >CLONAR</button>
                  <button
                    type="button"
                    :disabled="busyIds.has(t.id)"
                    class="rounded-sm border px-2 py-1 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors hover:opacity-80 disabled:opacity-40"
                    :style="{ borderColor: C.negative, color: C.negative }"
                    @click="handleDelete(t)"
                  >DELETAR</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="error" class="rounded-sm border px-4 py-3 text-[13px]" :style="{ borderColor: C.negative, color: C.negative }">
        {{ error }}
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F } from '~/utils/redentiaCreativeColors'

definePageMeta({ middleware: ['admin-panel'] })

const tenantsService = useTenantsService()
const items = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const search = ref('')
const activeFilter = ref<'' | 'true' | 'false'>('')
const busyIds = reactive(new Set<number>())

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
  if (!confirm(`Deletar o tenant "${t.name}" (${t.slug})? Essa ação não pode ser desfeita.`)) return
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
.font-mono-tab { font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace; font-feature-settings: 'tnum' 1; }
</style>

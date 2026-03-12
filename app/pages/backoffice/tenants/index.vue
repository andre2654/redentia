<template>
  <NuxtLayout name="default" title="Tenants">
    <div class="p-6">
      <!-- Header -->
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl" :class="[brand.font.headingWeight]" :style="{ color: brand.colors.text }">Tenants</h1>
          <p class="mt-1 text-sm" :style="{ color: brand.colors.textMuted }">Gerencie as marcas white-label da plataforma</p>
        </div>
        <NuxtLink
          to="/backoffice/tenants/create"
          class="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          <UIcon name="i-lucide-plus" class="size-4" />
          Novo Tenant
        </NuxtLink>
      </div>

      <!-- Search -->
      <div class="mt-6">
        <div class="relative max-w-md">
          <UIcon name="i-lucide-search" class="absolute left-3 top-1/2 size-4 -translate-y-1/2" :style="{ color: brand.colors.textMuted }" />
          <input
            v-model="search"
            type="text"
            placeholder="Buscar por nome, slug ou dominio..."
            aria-label="Buscar tenants"
            class="w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-secondary/50"
            :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
            @input="debouncedFetch"
          />
          <button
            v-if="search"
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 transition hover:opacity-70"
            :style="{ color: brand.colors.textMuted }"
            aria-label="Limpar busca"
            @click="clearSearch"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </div>
        <p v-if="!loading && search" class="mt-2 text-xs" :style="{ color: brand.colors.textMuted }">
          {{ tenants.length }} resultado{{ tenants.length !== 1 ? 's' : '' }} encontrado{{ tenants.length !== 1 ? 's' : '' }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="mt-12 flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="size-6 animate-spin" :style="{ color: brand.colors.textMuted }" />
      </div>

      <!-- Empty -->
      <div v-else-if="tenants.length === 0" class="mt-12 flex flex-col items-center justify-center py-16 text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl" :style="{ backgroundColor: brand.colors.surface }">
          <UIcon name="i-lucide-building-2" class="size-8" :style="{ color: brand.colors.textMuted }" />
        </div>
        <p class="mt-5 font-medium" :style="{ color: brand.colors.text }">
          {{ search ? 'Nenhum resultado encontrado' : 'Nenhum tenant encontrado' }}
        </p>
        <p class="mt-1 text-sm" :style="{ color: brand.colors.textMuted }">
          {{ search ? 'Tente buscar com outros termos' : 'Crie o primeiro tenant para comecar' }}
        </p>
        <NuxtLink
          v-if="!search"
          to="/backoffice/tenants/create"
          class="mt-5 flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          <UIcon name="i-lucide-plus" class="size-4" />
          Criar primeiro tenant
        </NuxtLink>
      </div>

      <!-- Table -->
      <div v-else class="mt-6 overflow-hidden brand-card border" :style="{ borderColor: brand.colors.border }">
        <!-- Table header -->
        <div
          class="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 border-b px-5 py-3 text-xs font-medium uppercase tracking-wider"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface, color: brand.colors.textMuted }"
        >
          <span class="w-10">Cor</span>
          <span>Tenant</span>
          <span class="w-20 text-center">Status</span>
          <span class="w-44 text-right">Acoes</span>
        </div>

        <!-- Rows -->
        <div
          v-for="(tenant, idx) in tenants"
          :key="tenant.id"
          class="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-5 py-4 transition hover:opacity-90"
          :class="{ 'border-t': idx > 0 }"
          :style="idx > 0 ? { borderColor: brand.colors.border + '60' } : {}"
        >
          <!-- Color swatch -->
          <div
            class="h-10 w-10 shrink-0 rounded-lg shadow-sm"
            :style="{ backgroundColor: tenant.config?.colors?.primary || '#666' }"
          />

          <!-- Info -->
          <div class="flex min-w-0 flex-col">
            <span class="font-semibold" :style="{ color: brand.colors.text }">{{ tenant.name }}</span>
            <div class="mt-0.5 flex items-center gap-3 text-xs" :style="{ color: brand.colors.textMuted }">
              <span class="font-mono">{{ tenant.slug }}</span>
              <span v-if="tenant.domain" class="flex items-center gap-1">
                <UIcon name="i-lucide-globe" class="size-3" />
                {{ tenant.domain }}
              </span>
              <span v-if="tenant.config?.font?.family">{{ tenant.config.font.family }}</span>
            </div>
          </div>

          <!-- Status -->
          <div class="flex w-20 justify-center">
            <span
              class="rounded-full px-2.5 py-1 text-[11px] font-medium"
              :class="tenant.is_active ? 'bg-secondary/15 text-secondary' : ''"
              :style="!tenant.is_active ? { backgroundColor: brand.colors.surfaceHover, color: brand.colors.textMuted } : {}"
            >
              {{ tenant.is_active ? 'Ativo' : 'Inativo' }}
            </span>
          </div>

          <!-- Actions -->
          <div class="flex w-44 items-center justify-end gap-1">
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-secondary/10 hover:text-secondary"
              :style="{ color: brand.colors.textMuted }"
              title="Preview"
              aria-label="Abrir preview do tenant"
              @click="previewTenant(tenant)"
            >
              <UIcon name="i-lucide-eye" class="size-4" />
            </button>
            <NuxtLink
              :to="`/backoffice/tenants/${tenant.id}`"
              class="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-secondary/10 hover:text-secondary"
              :style="{ color: brand.colors.textMuted }"
              title="Editar"
              aria-label="Editar tenant"
            >
              <UIcon name="i-lucide-pencil" class="size-4" />
            </NuxtLink>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-secondary/10 hover:text-secondary"
              :style="{ color: brand.colors.textMuted }"
              title="Duplicar"
              aria-label="Duplicar tenant"
              @click="openDuplicateModal(tenant)"
            >
              <UIcon name="i-lucide-copy" class="size-4" />
            </button>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg transition"
              :class="tenant.is_active ? 'hover:bg-amber-500/10 hover:text-amber-400' : 'hover:bg-secondary/10 hover:text-secondary'"
              :style="{ color: brand.colors.textMuted }"
              :title="tenant.is_active ? 'Desativar' : 'Ativar'"
              :aria-label="tenant.is_active ? 'Desativar tenant' : 'Ativar tenant'"
              @click="openToggleModal(tenant)"
            >
              <UIcon :name="tenant.is_active ? 'i-lucide-pause' : 'i-lucide-play'" class="size-4" />
            </button>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-red-500/10 hover:text-red-400"
              :style="{ color: brand.colors.textMuted }"
              title="Remover"
              aria-label="Remover tenant"
              @click="openDeleteModal(tenant)"
            >
              <UIcon name="i-lucide-trash-2" class="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <BackofficeConfirmModal
      v-model="deleteModal.open"
      :title="`Remover ${deleteModal.tenant?.name || 'tenant'}?`"
      message="Esta acao nao pode ser desfeita. Todos os dados deste tenant serao permanentemente removidos."
      confirm-text="Remover"
      variant="danger"
      :loading="deleteModal.loading"
      @confirm="confirmDelete"
    />

    <!-- Toggle Modal -->
    <BackofficeConfirmModal
      v-model="toggleModal.open"
      :title="toggleModal.tenant?.is_active ? 'Desativar tenant?' : 'Ativar tenant?'"
      :message="toggleModal.tenant?.is_active
        ? `O tenant &quot;${toggleModal.tenant?.name}&quot; ficara inacessivel para os usuarios.`
        : `O tenant &quot;${toggleModal.tenant?.name}&quot; ficara disponivel para os usuarios.`"
      :confirm-text="toggleModal.tenant?.is_active ? 'Desativar' : 'Ativar'"
      :variant="toggleModal.tenant?.is_active ? 'warning' : 'info'"
      :loading="toggleModal.loading"
      @confirm="confirmToggle"
    />

    <!-- Duplicate Modal -->
    <BackofficeConfirmModal
      v-model="duplicateModal.open"
      :title="`Duplicar ${duplicateModal.tenant?.name || 'tenant'}?`"
      message="Uma copia identica sera criada com o sufixo '-copy' no slug. Voce podera edita-la em seguida."
      confirm-text="Duplicar"
      variant="info"
      :loading="duplicateModal.loading"
      @confirm="confirmDuplicate"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { ITenant } from '~/types/tenant'

definePageMeta({
  middleware: ['admin'],
})

const brand = useBrand()
const tenantsService = useTenantsService()
const router = useRouter()
const tenants = ref<ITenant[]>([])
const loading = ref(true)
const search = ref('')

let debounceTimer: ReturnType<typeof setTimeout>
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchTenants(), 300)
}

function clearSearch() {
  search.value = ''
  fetchTenants()
}

async function fetchTenants() {
  loading.value = true
  try {
    const res = (await tenantsService.list({ search: search.value || undefined })) as any
    tenants.value = res?.data ?? []
  } catch (e) {
    showErrorNotification('Erro', 'Falha ao carregar tenants')
  } finally {
    loading.value = false
  }
}

// Delete modal
const deleteModal = reactive({ open: false, loading: false, tenant: null as ITenant | null })
function openDeleteModal(tenant: ITenant) {
  deleteModal.tenant = tenant
  deleteModal.open = true
}
async function confirmDelete() {
  if (!deleteModal.tenant) return
  deleteModal.loading = true
  try {
    await tenantsService.remove(deleteModal.tenant.id)
    tenants.value = tenants.value.filter(t => t.id !== deleteModal.tenant!.id)
    showSuccessNotification('Sucesso', 'Tenant removido')
    deleteModal.open = false
  } catch {
    showErrorNotification('Erro', 'Falha ao remover')
  } finally {
    deleteModal.loading = false
  }
}

// Toggle modal
const toggleModal = reactive({ open: false, loading: false, tenant: null as ITenant | null })
function openToggleModal(tenant: ITenant) {
  toggleModal.tenant = tenant
  toggleModal.open = true
}
async function confirmToggle() {
  if (!toggleModal.tenant) return
  toggleModal.loading = true
  try {
    const res = await tenantsService.toggleActive(toggleModal.tenant.id)
    const updated = (res as any)?.data?.data ?? (res as any)?.data
    if (updated) {
      const idx = tenants.value.findIndex(t => t.id === toggleModal.tenant!.id)
      if (idx !== -1) tenants.value[idx] = updated
    }
    showSuccessNotification('Sucesso', `Tenant ${updated?.is_active ? 'ativado' : 'desativado'}`)
    toggleModal.open = false
  } catch {
    showErrorNotification('Erro', 'Falha ao alterar status')
  } finally {
    toggleModal.loading = false
  }
}

// Duplicate modal
const duplicateModal = reactive({ open: false, loading: false, tenant: null as ITenant | null })
function openDuplicateModal(tenant: ITenant) {
  duplicateModal.tenant = tenant
  duplicateModal.open = true
}
async function confirmDuplicate() {
  if (!duplicateModal.tenant) return
  duplicateModal.loading = true
  try {
    const res = await tenantsService.duplicate(duplicateModal.tenant.id)
    const created = (res as any)?.data?.data ?? (res as any)?.data
    showSuccessNotification('Sucesso', 'Tenant duplicado')
    duplicateModal.open = false
    // Navigate to edit the new tenant
    if (created?.id) {
      router.push(`/backoffice/tenants/${created.id}`)
    } else {
      fetchTenants()
    }
  } catch {
    showErrorNotification('Erro', 'Falha ao duplicar')
  } finally {
    duplicateModal.loading = false
  }
}

function previewTenant(tenant: ITenant) {
  const url = `/?brand=${tenant.slug}`
  window.open(url, '_blank')
}

onMounted(() => fetchTenants())
</script>

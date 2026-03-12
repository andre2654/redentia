<template>
  <NuxtLayout name="default" title="Editar Tenant">
    <div class="p-6">
      <!-- Header -->
      <div class="mb-8 flex items-center gap-4">
        <NuxtLink
          to="/backoffice/tenants"
          class="flex h-9 w-9 items-center justify-center rounded-lg border transition hover:bg-secondary/10 hover:text-secondary"
          :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }"
          aria-label="Voltar para lista de tenants"
        >
          <UIcon name="i-lucide-arrow-left" class="size-4" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl" :class="[brand.font.headingWeight]" :style="{ color: brand.colors.text }">Editar Tenant</h1>
          <p class="mt-0.5 text-sm" :style="{ color: brand.colors.textMuted }">{{ tenant?.name || 'Carregando...' }}</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="size-6 animate-spin" :style="{ color: brand.colors.textMuted }" />
      </div>

      <!-- Error state with retry -->
      <div v-else-if="loadError" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <UIcon name="i-lucide-alert-circle" class="size-8 text-red-400" />
        </div>
        <p class="mt-5 font-medium" :style="{ color: brand.colors.text }">Erro ao carregar tenant</p>
        <p class="mt-1 text-sm" :style="{ color: brand.colors.textMuted }">{{ loadError }}</p>
        <div class="mt-5 flex items-center gap-3">
          <button
            class="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            @click="fetchTenant"
          >
            <UIcon name="i-lucide-refresh-cw" class="size-4" />
            Tentar novamente
          </button>
          <NuxtLink
            to="/backoffice/tenants"
            class="rounded-lg border px-4 py-2.5 text-sm transition hover:opacity-80"
            :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }"
          >
            Voltar para lista
          </NuxtLink>
        </div>
      </div>

      <!-- Form -->
      <BackofficeTenantForm
        v-else-if="tenant"
        :initial="tenant"
        :saving="saving"
        @save="handleUpdate"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { ITenant, ITenantPayload } from '~/types/tenant'

definePageMeta({
  middleware: ['admin'],
})

const brand = useBrand()
const route = useRoute()
const router = useRouter()
const tenantsService = useTenantsService()
const tenant = ref<ITenant | null>(null)
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')

const tenantId = Number(route.params.id)

async function fetchTenant() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await tenantsService.show(tenantId)
    tenant.value = (res as any)?.data?.data ?? (res as any)?.data ?? null
    if (!tenant.value) {
      loadError.value = 'Tenant nao encontrado'
    }
  } catch (e: any) {
    const status = e?.response?.status || e?.status
    if (status === 404) {
      loadError.value = 'Tenant nao encontrado (404)'
    } else if (status === 403) {
      loadError.value = 'Sem permissao para acessar este tenant'
    } else {
      loadError.value = e?.data?.message || e?.message || 'Falha na conexao com o servidor'
    }
  } finally {
    loading.value = false
  }
}

async function handleUpdate(payload: ITenantPayload) {
  saving.value = true
  try {
    await tenantsService.update(tenantId, payload)
    showSuccessNotification('Sucesso', 'Tenant atualizado com sucesso')
    router.push('/backoffice/tenants')
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || 'Falha ao atualizar'
    showErrorNotification('Erro', msg)
  } finally {
    saving.value = false
  }
}

onMounted(() => fetchTenant())
</script>

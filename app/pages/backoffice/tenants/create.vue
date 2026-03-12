<template>
  <NuxtLayout name="default" title="Novo Tenant">
    <div class="p-6">
      <!-- Header -->
      <div class="mb-8 flex items-center gap-4">
        <NuxtLink
          to="/backoffice/tenants"
          class="flex h-9 w-9 items-center justify-center rounded-lg border transition hover:bg-secondary/10 hover:text-secondary"
          :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }"
        >
          <UIcon name="i-lucide-arrow-left" class="size-4" />
        </NuxtLink>
        <div>
          <h1 class="text-2xl" :class="[brand.font.headingWeight]" :style="{ color: brand.colors.text }">Novo Tenant</h1>
          <p class="mt-0.5 text-sm" :style="{ color: brand.colors.textMuted }">Crie uma nova marca white-label</p>
        </div>
      </div>

      <BackofficeTenantForm @save="handleCreate" :saving="saving" />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { ITenantPayload } from '~/types/tenant'

definePageMeta({
  middleware: ['admin'],
})

const brand = useBrand()
const tenantsService = useTenantsService()
const router = useRouter()
const saving = ref(false)

async function handleCreate(payload: ITenantPayload) {
  saving.value = true
  try {
    await tenantsService.create(payload)
    showSuccessNotification('Sucesso', 'Tenant criado com sucesso')
    router.push('/backoffice/tenants')
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || 'Falha ao criar tenant'
    showErrorNotification('Erro', msg)
  } finally {
    saving.value = false
  }
}
</script>

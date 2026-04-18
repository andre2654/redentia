<template>
  <NuxtLayout name="admin-panel">
    <div v-if="loading" class="flex items-center gap-3 text-[14px]" :style="{ color: C.textMuted }">
      <UIcon name="i-lucide-loader-2" class="size-5 animate-spin" /> Carregando tenant…
    </div>
    <AdminTenantEditor
      v-else-if="tenant"
      :initial="tenant"
      :is-new="false"
      @saved="onSaved"
    />
    <div v-else class="rounded-sm border p-6 text-center" :style="{ borderColor: C.border, color: C.textMuted }">
      Tenant não encontrado.
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS as C } from '~/utils/redentiaCreativeColors'

definePageMeta({ middleware: ['admin-panel'] })

const route = useRoute()
const tenantsService = useTenantsService()

const tenant = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const resp = await tenantsService.show(Number(route.params.id))
    tenant.value = resp?.data || resp
  } catch {
    tenant.value = null
  } finally {
    loading.value = false
  }
})

function onSaved(updated: any) {
  tenant.value = updated
}
</script>

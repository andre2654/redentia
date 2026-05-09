<template>
  <NuxtLayout name="admin-panel">
    <div v-if="loading" class="admin-page admin-page--narrow">
      <div class="admin-loading">
        <span class="admin-loading__icon">
          <UIcon name="i-lucide-loader-2" class="size-4 motion-safe:animate-spin" />
        </span>
        <span class="admin-loading__title">Carregando tenant…</span>
      </div>
    </div>
    <AdminTenantEditor
      v-else-if="tenant"
      :initial="tenant"
      :is-new="false"
      @saved="onSaved"
    />
    <div v-else class="admin-page admin-page--narrow">
      <div class="admin-empty">
        <span class="admin-empty__icon">
          <UIcon name="i-lucide-building" class="size-4" />
        </span>
        <span class="admin-empty__title">Tenant não encontrado</span>
        <span class="admin-empty__sub">O ID solicitado não existe ou foi removido.</span>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
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

<template>
  <NuxtLayout name="admin-panel">
    <AdminTenantEditor :initial="defaultTenant" :is-new="true" @saved="onSaved" />
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin-panel'] })

// Minimal default shape — backend validates `config.colors.primary` etc,
// so we seed enough to pass create validation while keeping the JSON
// small enough to hand-edit.
const defaultTenant = {
  slug: '',
  name: '',
  domain: null,
  is_active: true,
  config: {
    name: '',
    shortName: '',
    slug: '',
    colors: {
      primary: '#F5A623',
      secondary: '#FFC555',
      background: '#0A0B0E',
      surface: '#14161C',
      surfaceHover: '#1B1E26',
      border: '#2A2E39',
      text: '#E8EAED',
      textMuted: '#8B92A7',
      positive: '#00D395',
      negative: '#FF4747',
      neutral: '#6B7280',
      inputBg: '#14161C',
      inputBgHover: '#1B1E26',
      inputBorder: '#2A2E39',
    },
    font: { family: 'Sora', google: 'Sora:wght@300;400;500;600;700' },
  },
}

const router = useRouter()
function onSaved(tenant: any) {
  router.push(`/admin/tenants/${tenant.id}`)
}
</script>

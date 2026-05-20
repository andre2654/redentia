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
      primary: 'var(--brand-primary)',
      secondary: 'var(--brand-secondary)',
      background: 'var(--bg-base)',
      surface: 'var(--bg-elevated)',
      surfaceHover: 'var(--bg-overlay)',
      border: 'var(--border-subtle)',
      text: 'var(--brand-text)',
      textMuted: 'var(--text-muted)',
      positive: 'var(--brand-positive)',
      negative: 'var(--brand-negative)',
      neutral: '#6B7280',
      inputBg: 'var(--bg-elevated)',
      inputBgHover: 'var(--bg-overlay)',
      inputBorder: 'var(--border-subtle)',
    },
    font: { family: 'Sora', google: 'Sora:wght@300;400;500;600;700' },
  },
}

const router = useRouter()
function onSaved(tenant: any) {
  router.push(`/admin/tenants/${tenant.id}`)
}
</script>

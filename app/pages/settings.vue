<template>
  <NuxtLayout title="André Saraiva">
    <div class="flex h-full flex-col gap-4 pt-6">
      <div class="flex flex-col px-6">
        <h2 class="text-[18px] font-medium" :style="{ color: brand.colors.text, letterSpacing: '-0.005em' }">Configurações</h2>
        <p class="text-[13px] font-extralight" :style="{ color: `color-mix(in srgb, ${brand.colors.text} 70%, transparent)` }">
          Altere seu nome e senha de acesso.
        </p>
      </div>
      <div class="flex flex-col gap-6">
        <MoleculesSettingsProfile class="rounded-[30px] bg-white/10" />
        <MoleculesSettingsAttachAdvisor v-if="authStore.me?.role !== 'advisor'" class="rounded-[30px] bg-white/10" />
        <MoleculesSettingsBecomeAdvisor class="rounded-[30px] bg-white/10" />
        <MoleculesSettingsSyncWallet v-if="false" class="rounded-[30px] bg-white/10" />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const brand = useBrand()

usePageSeo({
  title: 'Configurações',
  description: 'Configurações da conta',
  path: '/settings',
  robots: 'noindex,nofollow',
})
</script>

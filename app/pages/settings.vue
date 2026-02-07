<template>
  <NuxtLayout title="André Saraiva">
    <div class="flex h-full flex-col gap-4 pt-6">
      <div class="flex flex-col px-6">
        <h2 class="text-[18px] font-bold">Configurações</h2>
        <p class="text-[13px] font-extralight text-white/70">
          Altere seu nome e senha de acesso.
        </p>
      </div>
      <div class="flex flex-col gap-6">
        <MoleculesSettingsProfile class="rounded-[30px] bg-white/10" />
        <MoleculesSettingsSyncWallet v-if="false" class="rounded-[30px] bg-white/10" />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts"></script>

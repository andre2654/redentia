<template>
  <NuxtLayout title="Sua carteira">
    <div class="flex h-full flex-col justify-between gap-[50px]">
      <div class="flex flex-col">
        <MoleculesWalletAssetAccordion />
        <MoleculesWalletAssetAccordion />
      </div>
      <div class="flex flex-col items-center gap-[50px]">
        <AtomsAiInsight class="mx-4 max-w-[900px]" />
        <MoleculesChat class="w-full bg-white/10" />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts"></script>

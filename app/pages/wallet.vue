<template>
  <NuxtLayout title="Sua carteira">
    <div class="flex h-full flex-col justify-between">
      <div class="flex flex-col">
        <MoleculesWalletAssetAccordion />
        <MoleculesWalletAssetAccordion />
      </div>
      <div class="flex flex-col gap-[30px] border-b p-6">
        <h2 class="text-[18px] font-bold">Composição</h2>
        <div class="flex items-center justify-center gap-7 max-lg:flex-col">
          <AtomsGraphBar class="max-sm:max-w-[300px]" />
          <hr class="border-x max-lg:w-[200px] lg:h-[200px]" />
          <AtomsGraphBar class="max-sm:max-w-[300px]" />
        </div>
      </div>
      <div class="mt-[50px] flex flex-col items-center gap-[50px]">
        <AtomsAiInsight class="mx-4 max-w-[900px]" />
        <MoleculesChat class="w-full bg-black/10 dark:bg-white/10" />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts"></script>

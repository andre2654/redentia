<template>
  <NuxtLayout title="Sua carteira">
    <div class="flex h-full flex-col justify-between">
      <div class="flex flex-col gap-5 border-b p-6">
        <h2 class="text-[18px] font-bold">Por tipo</h2>
        <div class="flex flex-col space-y-4">
          <MoleculesWalletAssetAccordion />
          <hr class="mx-6" />
          <MoleculesWalletAssetAccordion />
        </div>
      </div>
      <div class="flex flex-col gap-8 border-b p-6">
        <h2 class="text-[18px] font-bold">Composição</h2>
        <div class="flex items-center justify-center gap-7 max-lg:flex-col">
          <AtomsGraphBar class="max-sm:max-w-[300px]" />
          <hr class="border-x max-lg:w-[200px] lg:h-[200px]" />
          <AtomsGraphBar class="max-sm:max-w-[300px]" />
        </div>
      </div>
      <div class="mt-12 flex flex-col items-center gap-12">
        <AtomsAiInsight />
        <MoleculesChat class="w-full bg-white/10" />
      </div>
    </div>
  </NuxtLayout>
</template>

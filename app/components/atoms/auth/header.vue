<template>
  <div class="flex flex-col items-center gap-6">
    <NuxtLink to="/">
      <BrandLogo variant="full" class="h-auto w-[180px]" />
    </NuxtLink>

    <p class="text-[15px] font-extralight">
      {{ brand.subtitle }}
    </p>
    <AtomsTickerCarousel class="w-[335px]" no-control />
  </div>
</template>

<script setup lang="ts">
const brand = useBrand()
</script>

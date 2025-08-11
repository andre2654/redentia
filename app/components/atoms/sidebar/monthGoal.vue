<template>
  <div
    v-if="hasMonthGoal"
    class="bg-black/2 flex h-[300px] flex-col gap-5 dark:bg-white/5"
  >
    <div class="flex flex-col gap-1 px-3 pt-3">
      <div class="text-[14px] font-medium">Meta de renda mensal</div>
      <b class="redentia-amount text-[16px] font-bold">R$ 5.000,00</b>
      <NuxtLink
        to="/settings"
        class="mt-4 max-w-fit rounded-full border border-black px-3 text-[10px]"
      >
        Configurar
      </NuxtLink>
    </div>
    <div class="flex w-full flex-col gap-1 text-[11px]">
      <span class="text-primary pl-3">
        Meta de <b class="redentia-amount">R$ 5.000,00</b>
      </span>
      <hr class="border-primary" />
      <span class="pl-3 text-white/60">
        Faltam <b class="redentia-amount">R$ 300,00</b> para atingir a meta
      </span>
    </div>
    <div class="flex flex-1 justify-between gap-2">
      <div class="flex h-full w-full flex-col justify-end">
        <div class="flex flex-col items-center justify-center">
          <small> Julho </small>
          <b class="text-[10px]"> R$ 4.700,00 </b>
        </div>
        <div class="bg-primary/10 border-t-primary h-[100%] border-t-2" />
      </div>
      <div class="flex h-full w-full flex-col justify-end">
        <div class="flex flex-col items-center justify-center">
          <small> Julho </small>
          <b class="text-[10px]"> R$ 4.700,00 </b>
        </div>
        <div class="bg-primary/10 border-t-primary h-[80%] border-t-2" />
      </div>
      <div class="flex h-full w-full flex-col justify-end">
        <div class="flex flex-col items-center justify-center">
          <small> Julho </small>
          <b class="text-[10px]"> R$ 4.700,00 </b>
        </div>
        <div class="bg-primary/10 border-t-primary h-[50%] border-t-2" />
      </div>
    </div>
  </div>
  <div
    v-else
    class="bg-black/2 flex h-[300px] flex-col items-center justify-center gap-5 dark:bg-white/5"
  >
    <span class="max-w-[80%] text-center">
      Você ainda não definiu uma meta mensal
    </span>
    <NuxtLink
      to="/settings"
      class="mt-4 max-w-fit rounded-full border border-black px-3 text-[10px]"
    >
      Configurar
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const hasMonthGoal = ref(false)
</script>

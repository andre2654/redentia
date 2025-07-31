<template>
  <div class="bg-primary/15 flex h-[300px] flex-col gap-5">
    <div class="flex flex-col gap-1 px-3 pt-3">
      <div class="text-[14px] font-medium">Meta de renda mensal</div>
      <b class="redentia-amount text-[16px] font-bold">R$ 5.000,00</b>
      <button class="glass mt-4 max-w-fit rounded-full px-3 py-1 text-[8px]">
        Configurar
      </button>
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
    <div
      class="border-primary bg-primary/20 flex flex-1 flex-col items-center border-t-4 pt-6"
    >
      <span class="font-extralight">Renda atual</span>
      <b class="redentia-amount">R$ 4.700,00</b>
    </div>
  </div>
</template>

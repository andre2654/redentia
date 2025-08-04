<template>
  <NuxtLayout title="Visão geral" hide-search-bar>
    <div class="flex h-full flex-col gap-4 pb-8 pt-6">
      <div class="flex flex-col px-6">
        <h2 class="text-[18px] font-bold">Ações e fundos imobiliarios</h2>
        <p class="text-[13px] font-extralight">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
          vulputate erat non massa tristique.
        </p>
      </div>
      <MoleculesSearchAssets class="rounded-none border-y py-4" />
      <div class="grid grid-cols-3 gap-2">
        <div v-for="i in 10" :key="i" class="flex flex-col gap-1 border p-3">
          <div class="flex gap-2">
            <span class="text-[18px] font-semibold">BBAS3</span>
            <span class="text-[16px] text-white/70">Banco do Brasil S.A.</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex gap-2">
              <span class="text-[16px] font-semibold">R$ 50,00</span>
              <span class="text-[14px] text-green-500">(+2,00% hoje)</span>
            </div>
          </div>
          <img
            width="150"
            class="rounded-md"
            src="https://icons.brapi.dev/icons/BBAS3.svg"
            alt="Descrição da imagem"
          />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

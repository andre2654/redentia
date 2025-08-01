<template>
  <div class="flex flex-col items-center justify-between gap-[100px]">
    <div
      class="flex flex-col items-center justify-center gap-4 px-3 pt-[100px]"
    >
      <h2 class="text-center text-2xl">Faça alguma pergunta</h2>
      <p class="text-center text-[13px] font-light text-white/60">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
        vulputate erat non massa tristique.
      </p>
    </div>
    <div class="flex w-full flex-col gap-3">
      <AtomsButton
        class="ml-4 h-[30px] w-[30px] rounded-full text-white"
        size="md"
        color="neutral"
        variant="outline"
        :ui="{
          base: 'bg-transparent min-w-max ring-[#E9E6E6] px-3 text-[13px]',
          trailingIcon: 'text-[#E9E6E6] w-6 h-6',
        }"
        trailing-icon="i-heroicons-outline-arrow-sm-right"
      >
        Faça qualquer pesquisa...
      </AtomsButton>
      <div class="flex w-full flex-col gap-3 bg-white/10 p-3">
        <UTextarea
          placeholder="Faça qualquer pesquisa..."
          size="md"
          rows="4"
          :ui="{
            base: 'text-[14px] max-h-[200px] bg-transparent ring-0 placeholder:text-white/40',
          }"
          autoresize
        />

        <AtomsButton
          class="ml-auto h-[30px] w-[30px] rounded-full text-white"
          size="md"
          color="neutral"
          variant="soft"
          :ui="{
            base: 'bg-[#E9E6E6]',
            leadingIcon: 'text-[#999595] w-6 h-6 -ml-2',
          }"
          icon="i-heroicons-outline-arrow-sm-right"
        />
      </div>
    </div>
  </div>
</template>

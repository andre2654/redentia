<template>
  <div
    class="p-4 flex flex-col"
  >
    <div 
        class="px-7 py-3 flex justify-between items-center w-full rounded-[20px] bg-white/5 h-16">
        <h1
            v-if="title"
            class="text-[25px] text-white"
        >
            {{title}}
        </h1>
        <div class="flex items-center gap-2">
            <MoleculesSearchAssets
                class="rounded-full py-2 px-3 md:max-w-[400px] hover:bg-white/10 bg-white/5 text-white"
            />
            <NuxtLink
                to="/calculadora"
                class="group flex items-center justify-center rounded-full px-3 py-2 hover:bg-white/10 bg-white/5"
                aria-label="Fechar banner"
            >
                Calculadoras
            </NuxtLink>
            <NuxtLink
                to="/calculadora"
                class="group flex items-center justify-center rounded-full px-3 py-2 hover:bg-white/10 bg-white/5"
                aria-label="Fechar banner"
            >
                Assessoria
            </NuxtLink>
        </div>
    </div>
    
    <div class="py-4">
        <slot />
    </div>
  </div>
  <Footer />
</template>

<script lang="ts" setup>
defineProps({
  title: {
    type: String,
    default: 'Static Page',
  },
})
</script>

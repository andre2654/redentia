<template>
  <NuxtLayout title="Assessoria" header-class="!text-white !bg-tertiary/50">
    <div class="flex h-full pt-4">
      <MoleculesChat
        class="h-full bg-gradient-to-b from-[#042f54] to-[#0b3f6d] text-white"
        :suggestions="[
          'Analise meus investimentos e me fale onde posso melhorar',
          'Tenho R$ 100,00 para investir, qual ação comprar?',
          'Rebalance minha carteira para focar em dividendos',
        ]"
        textarea-container-class="bg-gray-200"
        :messages="messages"
        routePath="/help"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const messages = ref<IChatMessage[]>([
  {
    id: '1',
    content: 'Olá, como posso ajudar você hoje?',
    type: 'bot',
    timestamp: new Date(),
  },
])
</script>

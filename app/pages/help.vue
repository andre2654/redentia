<template>
  <NuxtLayout
    title="Assessoria"
    header-class="bg-tertiary/95 text-white"
    container-class="bg-tertiary"
  >
    <MoleculesChat
      class="h-full text-white"
      :suggestions="[
        'Analise meus investimentos e me fale onde posso melhorar',
        'Tenho R$ 100,00 para investir, qual ação comprar?',
        'Rebalance minha carteira para focar em dividendos',
      ]"
      textarea-container-class="bg-gray-200"
      :messages="messages"
    />
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
  {
    id: '2',
    content: 'Estou interessado em ações de tecnologia.',
    type: 'user',
    timestamp: new Date(),
  },
  {
    id: '3',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vulputate erat non massa tristique, eget facilisis lorem ultrices. Duis hendrerit volutpat erat, ac accumsan purus bibendum a. Etiam eget elit et diam vulputate auctor convallis in libero. Suspendisse vehicula nisi volutpat sapien malesuada, in consectetur erat molestie.',
    type: 'bot',
    timestamp: new Date(),
  },
  {
    id: '4',
    content: 'Obrigado! Vou analisar essas opções.',
    type: 'user',
    timestamp: new Date(),
  },
])
</script>

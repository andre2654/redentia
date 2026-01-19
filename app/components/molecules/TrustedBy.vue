<template>
  <section class="border-y border-white/10 py-10">
    <p class="mb-8 text-center text-sm tracking-wide text-gray-500">
      Investidores que usam Redentia operam em
    </p>
    <div 
      class="flex flex-wrap items-center justify-center gap-6 opacity-50 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0 md:gap-10 lg:gap-12"
    >
      <!-- Placeholder logos das corretoras - usar SVGs reais quando disponíveis -->
      <div 
        v-for="broker in brokers" 
        :key="broker.name"
        class="flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
      >
        <span class="text-lg font-bold tracking-tight md:text-xl">{{ broker.name }}</span>
      </div>
    </div>
    <p class="mt-6 text-center text-xs text-gray-600">
      E muitas outras corretoras
    </p>
  </section>
</template>

<script setup lang="ts">
const brokers = [
  { name: 'XP' },
  { name: 'Rico' },
  { name: 'Clear' },
  { name: 'BTG' },
  { name: 'Inter' },
  { name: 'Nubank' },
  { name: 'Toro' },
  { name: 'Genial' },
]
</script>

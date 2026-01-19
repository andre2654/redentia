<template>
  <section class="border-y border-white/10 py-16">
    <div class="mx-auto max-w-6xl px-6">
      <div class="mb-12 text-center">
        <p class="mb-2 text-xs uppercase tracking-[0.2em] text-gray-500">
          Tudo em um só lugar
        </p>
        <h2 class="text-2xl font-bold text-white md:text-3xl lg:text-4xl">
          Ferramentas que fazem a diferença
        </h2>
      </div>
      
      <div class="grid gap-6 md:grid-cols-2">
        <div 
          v-for="feature in features" 
          :key="feature.title"
          class="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-secondary/30 hover:bg-white/10 md:p-8"
        >
          <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-secondary/20">
            <UIcon :name="feature.icon" class="h-6 w-6 text-secondary" />
          </div>
          <div>
            <h3 class="mb-2 text-lg font-bold text-white md:text-xl">
              {{ feature.title }}
            </h3>
            <p class="text-sm text-gray-400 md:text-base">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const features = [
  {
    icon: 'i-lucide-zap',
    title: 'Acompanhe 12.500+ ativos em tempo real',
    description: 'Ações, FIIs, ETFs e BDRs atualizados automaticamente.',
  },
  {
    icon: 'i-lucide-brain',
    title: 'IA que analisa enquanto você dorme',
    description: 'Receba insights e análises personalizadas 24/7.',
  },
  {
    icon: 'i-lucide-calculator',
    title: 'Calculadoras que fazem o trabalho difícil',
    description: 'Juros compostos, preço teto, dividend yield e muito mais.',
  },
  {
    icon: 'i-lucide-bell',
    title: 'Alertas automáticos de oportunidades',
    description: 'Seja notificado quando surgir uma boa oportunidade.',
  },
]
</script>

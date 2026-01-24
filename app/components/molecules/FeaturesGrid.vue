<template>
  <section class="py-20 md:py-28">
    <div class="mx-auto max-w-5xl px-6">
      <!-- Header minimalista -->
      <div class="mb-14 text-center md:mb-16">
        <p class="mb-3 text-xs uppercase tracking-[0.2em] text-white/40">
          Tudo em um só lugar
        </p>
        <h2 class="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
          Ferramentas que fazem a diferença
        </h2>
      </div>
      
      <!-- Features minimalistas -->
      <div class="grid gap-10 md:grid-cols-2 md:gap-12">
        <div 
          v-for="feature in features" 
          :key="feature.title"
          class="flex items-start gap-4"
        >
          <!-- Ícone simples -->
          <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <UIcon 
              :name="feature.icon" 
              class="h-5 w-5 text-white/70"
            />
          </div>
          
          <!-- Conteúdo -->
          <div class="flex flex-col gap-1">
            <h3 class="text-base font-medium text-white md:text-lg">
              {{ feature.title }}
            </h3>
            <p class="text-sm text-white/40">
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

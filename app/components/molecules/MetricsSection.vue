<template>
  <section class="bg-gradient-to-b from-tertiary/30 via-tertiary/10 to-transparent py-20 md:py-28">
    <div class="mx-auto max-w-6xl px-6 text-center">
      <p class="text-xs uppercase tracking-[0.25em] text-gray-500">
        Investir ficou fácil
      </p>
      <h2 class="mt-4 text-2xl font-bold text-white md:text-4xl lg:text-5xl">
        Sem enrolação. Só resultados.
      </h2>
      
      <div ref="counterRef" class="mt-12 md:mt-20">
        <span 
          class="block text-5xl font-black tabular-nums text-white sm:text-6xl md:text-8xl lg:text-[140px]"
          :class="{ 'animate-pulse': !isVisible }"
        >
          {{ formattedCount }}
        </span>
        <p class="mt-4 text-base text-secondary md:mt-6 md:text-xl">
          Análises realizadas na Redentia (e contando)
        </p>
      </div>

      <!-- Stats secundárias -->
      <div class="mt-12 grid grid-cols-2 gap-6 md:mt-16 md:grid-cols-4">
        <div 
          v-for="stat in stats" 
          :key="stat.label"
          class="flex flex-col items-center"
        >
          <span class="text-2xl font-bold text-white md:text-3xl">
            {{ stat.value }}
          </span>
          <span class="mt-1 text-xs text-gray-400 md:text-sm">
            {{ stat.label }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

const counterRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const currentCount = ref(0)
const targetCount = 156234 // Número base para animação

const stats = [
  { value: '12.500+', label: 'Ativos monitorados' },
  { value: '50.000+', label: 'Simulações' },
  { value: '24/7', label: 'Disponibilidade' },
  { value: '~3s', label: 'Resposta da IA' },
]

const formattedCount = computed(() => {
  return new Intl.NumberFormat('pt-BR').format(currentCount.value)
})

// Animação do contador quando entra na viewport
useIntersectionObserver(
  counterRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting && !isVisible.value) {
      isVisible.value = true
      animateCounter()
    }
  },
  { threshold: 0.3 }
)

function animateCounter() {
  const duration = 2000 // 2 segundos
  const steps = 60
  const increment = targetCount / steps
  const stepDuration = duration / steps
  
  let step = 0
  const interval = setInterval(() => {
    step++
    currentCount.value = Math.min(Math.round(increment * step), targetCount)
    
    if (step >= steps) {
      clearInterval(interval)
      // Continuar incrementando lentamente após a animação inicial
      startContinuousIncrement()
    }
  }, stepDuration)
}

function startContinuousIncrement() {
  setInterval(() => {
    currentCount.value += Math.floor(Math.random() * 3) + 1
  }, 3000)
}
</script>

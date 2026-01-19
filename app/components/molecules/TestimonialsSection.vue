<template>
  <section class="bg-white/5 py-16 md:py-20">
    <div class="mx-auto max-w-6xl px-6">
      <div class="mb-12 text-center">
        <p class="mb-2 text-xs uppercase tracking-[0.2em] text-gray-500">
          Histórias de sucesso
        </p>
        <h2 class="text-2xl font-bold text-white md:text-3xl">
          Para iniciantes e investidores experientes
        </h2>
        <p class="mt-3 text-gray-400">
          Milhares de brasileiros já usam a Redentia para tomar decisões melhores
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div 
          v-for="testimonial in testimonials" 
          :key="testimonial.name"
          class="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <!-- Quote -->
          <p class="flex-1 text-gray-300">
            "{{ testimonial.quote }}"
          </p>

          <!-- Metrics -->
          <div class="flex gap-4 border-t border-white/10 pt-4">
            <div 
              v-for="metric in testimonial.metrics" 
              :key="metric.label"
              class="text-center"
            >
              <span class="block text-lg font-bold text-secondary">
                {{ metric.value }}
              </span>
              <span class="text-xs text-gray-500">
                {{ metric.label }}
              </span>
            </div>
          </div>

          <!-- Author -->
          <div class="flex items-center gap-3">
            <UAvatar 
              :alt="testimonial.name" 
              size="md"
              class="bg-secondary/20"
            />
            <div>
              <p class="font-medium text-white">{{ testimonial.name }}</p>
              <p class="text-sm text-gray-400">{{ testimonial.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Metric {
  value: string
  label: string
}

interface Testimonial {
  quote: string
  name: string
  role: string
  metrics: Metric[]
}

const testimonials: Testimonial[] = [
  {
    quote: 'A calculadora de juros compostos me mostrou o poder de investir cedo. Comecei com R$ 500/mês e hoje já tenho uma reserva significativa.',
    name: 'Lucas M.',
    role: 'Investidor iniciante, SP',
    metrics: [
      { value: '5h', label: 'economizadas/semana' },
      { value: '+23%', label: 'em 1 ano' },
    ],
  },
  {
    quote: 'A IA me ajudou a entender indicadores que antes pareciam impossíveis. Hoje analiso FIIs com confiança.',
    name: 'Carolina S.',
    role: 'Analista de marketing, RJ',
    metrics: [
      { value: '12', label: 'FIIs na carteira' },
      { value: 'R$ 850', label: 'dividendos/mês' },
    ],
  },
  {
    quote: 'Uso a Redentia todo dia antes de operar. Os dados em tempo real e os alertas me dão segurança nas decisões.',
    name: 'Roberto A.',
    role: 'Day trader, MG',
    metrics: [
      { value: '~3s', label: 'resposta da IA' },
      { value: '24/7', label: 'monitoramento' },
    ],
  },
]
</script>

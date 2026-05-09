<template>
  <section class="border-y py-16" :style="{ borderColor: 'var(--brand-border)' }">
    <div class="mx-auto max-w-6xl px-6">
      <div class="mb-10 text-center">
        <p class="eyebrow mb-2">
          Para cada perfil
        </p>
        <h2 class="text-2xl md:text-3xl">
          Ferramentas para todo tipo de investidor
        </h2>
      </div>

      <!-- Tabs -->
      <div class="mb-8 flex justify-center">
        <AtomsSegmented
          v-model="activeTab"
          :options="tabs.map((t) => ({ value: t.id, label: t.label }))"
          as="tabs"
          aria-label="Perfis de investidor"
        />
      </div>

      <!-- Tab Content -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="feature in activeFeatures"
          :key="feature.title"
          :to="feature.to"
          class="quiet-card group flex flex-col gap-4 p-6 hover:border-secondary/30"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
            <UIcon :name="feature.icon" class="h-6 w-6 text-secondary" />
          </div>
          <div>
            <h3 class="mb-2 text-lg group-hover:text-secondary">
              {{ feature.title }}
            </h3>
            <p class="text-sm" :style="{ color: 'var(--brand-text-muted)' }">
              {{ feature.description }}
            </p>
          </div>
          <div class="mt-auto flex items-center gap-2 text-sm font-medium text-secondary">
            <span>{{ feature.cta }}</span>
            <UIcon
              name="i-lucide-arrow-right"
              class="h-4 w-4 transition-transform group-hover:translate-x-1"
            />
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Feature {
  title: string
  description: string
  icon: string
  to: string
  cta: string
}

interface Tab {
  id: string
  label: string
  features: Feature[]
}

const activeTab = ref('iniciantes')

const tabs: Tab[] = [
  {
    id: 'iniciantes',
    label: 'Iniciantes',
    features: [
      {
        title: 'Guia de Ações',
        description: 'Aprenda do zero como investir na bolsa',
        icon: 'i-lucide-book-open',
        to: '/guias/como-investir-em-acoes-para-iniciantes',
        cta: 'Começar agora',
      },
      {
        title: 'Juros Compostos',
        description: 'Entenda o poder dos juros sobre juros',
        icon: 'i-lucide-trending-up',
        to: '/calculadora/juros-compostos',
        cta: 'Simular',
      },
      {
        title: 'Quanto Investir',
        description: 'Descubra quanto investir por mês',
        icon: 'i-lucide-wallet',
        to: '/calculadora/quanto-investir',
        cta: 'Calcular',
      },
    ],
  },
  {
    id: 'dividendos',
    label: 'Renda Passiva',
    features: [
      {
        title: 'Melhores FIIs',
        description: 'Fundos imobiliários para renda mensal',
        icon: 'i-lucide-building-2',
        to: '/guias/melhores-fiis-para-investir-em-2026',
        cta: 'Explorar',
      },
      {
        title: 'Dividend Yield',
        description: 'Calcule o rendimento de dividendos',
        icon: 'i-lucide-coins',
        to: '/calculadora/dividend-yield',
        cta: 'Calcular',
      },
      {
        title: 'Preço Teto',
        description: 'Saiba o preço máximo a pagar',
        icon: 'i-lucide-target',
        to: '/calculadora/preco-teto',
        cta: 'Calcular',
      },
    ],
  },
  {
    id: 'crescimento',
    label: 'Crescimento',
    features: [
      {
        title: 'Small Caps',
        description: 'Empresas com alto potencial de crescimento',
        icon: 'i-lucide-rocket',
        to: '/guias/small-caps-guia-completo',
        cta: 'Explorar',
      },
      {
        title: 'Simulador de Ações',
        description: 'Veja quanto teria ganho no passado',
        icon: 'i-lucide-chart-line',
        to: '/calculadora/acoes',
        cta: 'Simular',
      },
      {
        title: 'Planejamento',
        description: 'Monte sua estratégia de investimentos',
        icon: 'i-lucide-map',
        to: '/calculadora/planejamento',
        cta: 'Planejar',
      },
    ],
  },
  {
    id: 'aposentadoria',
    label: 'Aposentadoria',
    features: [
      {
        title: 'Calculadora FIRE',
        description: 'Calcule sua independência financeira',
        icon: 'i-lucide-flame',
        to: '/calculadora/aposentadoria',
        cta: 'Calcular',
      },
      {
        title: 'Imposto de Renda',
        description: 'Calcule IR sobre suas operações',
        icon: 'i-lucide-receipt-text',
        to: '/calculadora/imposto-renda',
        cta: 'Calcular',
      },
      {
        title: 'Planejamento Patrimonial',
        description: 'Projete o crescimento do seu patrimônio',
        icon: 'i-lucide-piggy-bank',
        to: '/calculadora/planejamento',
        cta: 'Planejar',
      },
    ],
  },
]

const activeFeatures = computed(() => {
  const tab = tabs.find(t => t.id === activeTab.value)
  return tab?.features || []
})
</script>

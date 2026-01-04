<template>
  <NuxtLayout name="static" title="Guias de Investimento">
    <div class="flex flex-col gap-8 px-6 py-8">
      <!-- Header -->
      <section class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-newspaper" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">Blog da Redentia</h1>
        </div>
        <p class="text-base text-gray-400 md:text-lg">
          Guias completos, tutoriais práticos e análises detalhadas sobre investimentos. Aprenda desde o básico até estratégias avançadas para dominar o mercado financeiro.
        </p>
      </section>

      <!-- Guia em Destaque -->
      <section
        class="bg-secondary/10 border-secondary rounded-3xl border p-6 md:p-8"
      >
        <div class="mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-star" class="text-secondary h-5 w-5" />
          <h2 class="text-secondary text-lg font-semibold">Artigo em Destaque</h2>
        </div>
        <NuxtLink
          to="/guias/como-investir-em-acoes-para-iniciantes"
          class="group flex flex-col gap-4 md:flex-row md:items-center md:gap-6"
        >
          <div class="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-secondary/30">
            <UIcon name="i-lucide-trending-up" class="text-secondary h-10 w-10" />
          </div>
          <div class="flex-1">
            <div class="mb-3 flex items-center gap-3">
              <UBadge label="Ações" color="secondary" variant="subtle" size="xs" />
              <span class="text-xs text-gray-500">8 min de leitura</span>
            </div>
            <h3 class="mb-2 text-2xl font-bold group-hover:text-secondary transition-colors">
              Como Investir em Ações para Iniciantes
            </h3>
            <p class="mb-4 text-gray-300">
              Guia completo passo a passo para você começar a investir na bolsa de valores. Aprenda desde o básico até estratégias avançadas.
            </p>
            <div class="flex items-center gap-2 text-secondary text-sm font-medium">
              <span>Ler artigo completo</span>
              <UIcon
                name="i-lucide-arrow-right"
                class="h-4 w-4 transition-transform group-hover:translate-x-1"
              />
            </div>
          </div>
        </NuxtLink>
      </section>

      <!-- Categorias -->
      <section class="flex flex-col gap-4">
        <h2 class="text-xl font-semibold">Filtrar por Categoria</h2>
        <div class="flex flex-wrap gap-2">
          <UButton
            color="neutral"
            :variant="filtroCategoria === 'todos' ? 'soft' : 'ghost'"
            size="md"
            @click="filtroCategoria = 'todos'"
          >
            Todos
          </UButton>
          <UButton
            color="neutral"
            :variant="filtroCategoria === 'acoes' ? 'soft' : 'ghost'"
            size="md"
            icon="i-lucide-trending-up"
            @click="filtroCategoria = 'acoes'"
          >
            Ações
          </UButton>
          <UButton
            color="neutral"
            :variant="filtroCategoria === 'fiis' ? 'soft' : 'ghost'"
            size="md"
            icon="i-lucide-building-2"
            @click="filtroCategoria = 'fiis'"
          >
            FIIs
          </UButton>
          <UButton
            color="neutral"
            :variant="filtroCategoria === 'dividendos' ? 'soft' : 'ghost'"
            size="md"
            icon="i-lucide-coins"
            @click="filtroCategoria = 'dividendos'"
          >
            Dividendos
          </UButton>
          <UButton
            color="neutral"
            :variant="filtroCategoria === 'analises' ? 'soft' : 'ghost'"
            size="md"
            icon="i-lucide-chart-line"
            @click="filtroCategoria = 'analises'"
          >
            Análises
          </UButton>
        </div>
      </section>

      <!-- Lista de Guias -->
      <section class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            {{ guiasFiltrados.length }} artigo{{ guiasFiltrados.length !== 1 ? 's' : '' }} disponíve{{ guiasFiltrados.length !== 1 ? 'is' : 'l' }}
          </h2>
        </div>

        <div
          v-if="guiasFiltrados.length > 0"
          class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <MoleculesBlogCard
            v-for="guia in guiasFiltrados"
            :key="guia.slug"
            :titulo="guia.titulo"
            :descricao="guia.descricao"
            :to="`/guias/${guia.slug}`"
            :icon="guia.icon"
            :categoria="guia.categoriaLabel"
            :data="guia.data"
            :tempo-leitura="guia.tempoLeitura"
          />
        </div>
      </section>

      <!-- CTA para Ferramentas -->
      <MoleculesCtaSection
        title="Explore Nossas Ferramentas"
        description="Além dos guias, use nossas ferramentas para analisar ativos e planejar investimentos"
        :buttons="[
          { label: 'Buscar Ativos', to: '/search', icon: 'i-lucide-search', variant: 'primary' },
          { label: 'Calculadoras', to: '/calculadora', icon: 'i-lucide-calculator', variant: 'outline' },
          { label: 'Glossário', to: '/glossario', icon: 'i-lucide-book-open', variant: 'ghost' },
        ]"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
type CategoriaGuia = 'acoes' | 'fiis' | 'dividendos' | 'analises'

interface Guia {
  slug: string
  titulo: string
  descricao: string
  categoria: CategoriaGuia
  categoriaLabel: string
  icon: string
  data: string
  tempoLeitura: number
}

const guias: Guia[] = [
  {
    slug: 'como-investir-em-acoes-para-iniciantes',
    titulo: 'Como Investir em Ações para Iniciantes',
    descricao: 'Aprenda passo a passo como começar a investir na bolsa de valores, desde a abertura de conta até a escolha das melhores ações.',
    categoria: 'acoes',
    categoriaLabel: 'Ações',
    icon: 'i-lucide-trending-up',
    data: '4 Jan 2026',
    tempoLeitura: 8,
  },
  {
    slug: 'melhores-fiis-para-investir-em-2026',
    titulo: 'Melhores FIIs para Investir em 2026',
    descricao: 'Descubra os fundos imobiliários mais promissores para este ano, com análise de segmentos e potencial de retorno.',
    categoria: 'fiis',
    categoriaLabel: 'FIIs',
    icon: 'i-lucide-building-2',
    data: '4 Jan 2026',
    tempoLeitura: 10,
  },
  {
    slug: 'calculadora-de-dividendos',
    titulo: 'Calculadora de Dividendos: Quanto Receber Mensalmente',
    descricao: 'Entenda como calcular sua renda passiva com dividendos e planeje quanto precisa investir para atingir seus objetivos.',
    categoria: 'dividendos',
    categoriaLabel: 'Dividendos',
    icon: 'i-lucide-coins',
    data: '4 Jan 2026',
    tempoLeitura: 7,
  },
  {
    slug: 'analise-petr4-vale-a-pena-investir',
    titulo: 'Análise PETR4: Vale a Pena Investir?',
    descricao: 'Análise completa da Petrobras, avaliando fundamentos, riscos, oportunidades e perspectivas para 2026.',
    categoria: 'analises',
    categoriaLabel: 'Análises',
    icon: 'i-lucide-chart-line',
    data: '4 Jan 2026',
    tempoLeitura: 12,
  },
  {
    slug: 'small-caps-guia-completo',
    titulo: 'Small Caps: Guia Completo',
    descricao: 'Tudo sobre ações de pequenas empresas: como escolher, riscos envolvidos e estratégias para maximizar retornos.',
    categoria: 'acoes',
    categoriaLabel: 'Ações',
    icon: 'i-lucide-rocket',
    data: '4 Jan 2026',
    tempoLeitura: 9,
  },
]

// SEO
usePageSeo({
  title: 'Blog de Investimentos: Guias e Tutoriais Completos | Redentia',
  description:
    'Artigos completos sobre ações, FIIs, dividendos e análises de ativos. Tutoriais práticos, guias passo a passo e estratégias para investidores de todos os níveis.',
  path: '/guias',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Blog da Redentia',
      description:
        'Artigos educacionais sobre investimentos em ações, FIIs, dividendos e mercado financeiro',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.redentia.com.br',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: 'https://www.redentia.com.br/guias',
          },
        ],
      },
    },
  ],
})

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

// Estado
const filtroCategoria = ref<CategoriaGuia | 'todos'>('todos')

// Filtros
const guiasFiltrados = computed(() => {
  if (filtroCategoria.value === 'todos') {
    return guias
  }
  return guias.filter((g) => g.categoria === filtroCategoria.value)
})
</script>

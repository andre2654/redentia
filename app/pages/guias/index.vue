<template>
  <NuxtLayout name="static" title="Guias de Investimento">
    <div class="flex flex-col gap-8 px-6 py-8">
      <!-- Header -->
      <section class="flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-newspaper" class="text-secondary h-8 w-8" />
          <h1 class="text-3xl font-bold md:text-4xl">Blog da {{ brand.name }}</h1>
        </div>
        <p class="text-base md:text-lg" :style="{ color: brand.colors.textMuted }">
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
              <span class="text-xs" :style="{ color: brand.colors.textMuted }">8 min de leitura</span>
            </div>
            <h3 class="mb-2 text-2xl font-bold group-hover:text-secondary transition-colors">
              Como Investir em Ações para Iniciantes
            </h3>
            <p class="mb-4" :style="{ color: brand.colors.textMuted }">
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

      <!-- Ferramentas de Mercado (dados em tempo real) -->
      <section v-if="marketTools.length > 0" class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <p
              class="mb-1 text-[10px] font-medium uppercase tracking-[0.15em]"
              :style="{ color: brand.colors.textMuted }"
            >
              Dados em tempo real
            </p>
            <h2 class="text-xl font-semibold">Ferramentas de Mercado</h2>
          </div>
        </div>
        <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="tool in marketTools"
            :key="tool.to"
            :to="tool.to"
            class="group flex items-start gap-3 rounded-2xl border p-4 transition-all hover:border-white/20"
            :style="{
              borderColor: brand.colors.border,
              backgroundColor: brand.colors.surface,
            }"
          >
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-xl"
              :style="{ backgroundColor: tool.accent + '22' }"
            >
              <UIcon :name="tool.icon" class="size-5" :style="{ color: tool.accent }" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="mb-0.5 flex items-center gap-1.5">
                <h3
                  class="text-sm font-semibold"
                  :style="{ color: brand.colors.text }"
                >
                  {{ tool.title }}
                </h3>
                <UIcon
                  name="i-lucide-arrow-up-right"
                  class="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  :style="{ color: brand.colors.textMuted }"
                />
              </div>
              <p
                class="text-[11px] leading-relaxed"
                :style="{ color: brand.colors.textMuted }"
              >
                {{ tool.description }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Categorias -->
      <section class="flex flex-col gap-4">
        <h2 class="text-xl font-semibold">Filtrar por Categoria</h2>
        <div class="flex flex-wrap gap-2">
          <UButton
            color="secondary"
            :variant="filtroCategoria === 'todos' ? 'soft' : 'ghost'"
            size="md"
            @click="filtroCategoria = 'todos'"
          >
            Todos
          </UButton>
          <UButton
            color="secondary"
            :variant="filtroCategoria === 'acoes' ? 'soft' : 'ghost'"
            size="md"
            icon="i-lucide-trending-up"
            @click="filtroCategoria = 'acoes'"
          >
            Ações
          </UButton>
          <UButton
            color="secondary"
            :variant="filtroCategoria === 'fiis' ? 'soft' : 'ghost'"
            size="md"
            icon="i-lucide-building-2"
            @click="filtroCategoria = 'fiis'"
          >
            FIIs
          </UButton>
          <UButton
            color="secondary"
            :variant="filtroCategoria === 'dividendos' ? 'soft' : 'ghost'"
            size="md"
            icon="i-lucide-coins"
            @click="filtroCategoria = 'dividendos'"
          >
            Dividendos
          </UButton>
          <UButton
            color="secondary"
            :variant="filtroCategoria === 'analises' ? 'soft' : 'ghost'"
            size="md"
            icon="i-lucide-chart-line"
            @click="filtroCategoria = 'analises'"
          >
            Análises
          </UButton>
          <UButton
            color="secondary"
            :variant="filtroCategoria === 'planejamento' ? 'soft' : 'ghost'"
            size="md"
            icon="i-lucide-target"
            @click="filtroCategoria = 'planejamento'"
          >
            Planejamento
          </UButton>
          <UButton
            color="secondary"
            :variant="filtroCategoria === 'ferramentas' ? 'soft' : 'ghost'"
            size="md"
            icon="i-lucide-wrench"
            @click="filtroCategoria = 'ferramentas'"
          >
            Ferramentas
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
        :buttons="ctaButtons"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const brand = useBrand()

type CategoriaGuia =
  | 'acoes'
  | 'fiis'
  | 'dividendos'
  | 'analises'
  | 'planejamento'
  | 'ferramentas'

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

interface MarketTool {
  to: string
  title: string
  description: string
  icon: string
  accent: string
  flag: keyof typeof brand.features | '__any_ranking__'
}

const allMarketTools: MarketTool[] = [
  {
    to: '/ranking/maiores-dividend-yield',
    title: 'Maiores Dividend Yields',
    description:
      'Ranking diário das ações e FIIs que mais pagam dividendos proporcionalmente ao preço.',
    icon: 'i-lucide-coins',
    accent: brand.colors.primary,
    flag: 'showDividendYieldRanking',
  },
  {
    to: '/ranking/maiores-altas-mes',
    title: 'Maiores Altas do Mês',
    description:
      'Ativos com maior valorização nos últimos 30 dias na bolsa brasileira.',
    icon: 'i-lucide-trending-up',
    accent: brand.colors.positive,
    flag: 'showMonthlyMoversRanking',
  },
  {
    to: '/ranking/maiores-baixas-mes',
    title: 'Maiores Baixas do Mês',
    description:
      'Ativos com maior desvalorização nos últimos 30 dias, oportunidades ou alertas.',
    icon: 'i-lucide-trending-down',
    accent: brand.colors.negative,
    flag: 'showMonthlyMoversRanking',
  },
  {
    to: '/dividendos/calendario',
    title: 'Calendário de Dividendos',
    description:
      'Próximos pagamentos de dividendos, JCP e rendimentos das empresas listadas na B3.',
    icon: 'i-lucide-calendar-days',
    accent: brand.colors.primary,
    flag: 'showDividendCalendar',
  },
  {
    to: '/setor',
    title: 'Comparativos Setoriais',
    description:
      'Compare empresas do mesmo setor econômico com indicadores fundamentalistas.',
    icon: 'i-lucide-layers',
    accent: brand.colors.secondary,
    flag: 'showSectorComparatives',
  },
  {
    to: '/ranking',
    title: 'Todos os Rankings',
    description:
      'Hub completo com todos os rankings e ferramentas de análise do mercado.',
    icon: 'i-lucide-trophy',
    accent: brand.colors.secondary,
    flag: '__any_ranking__',
  },
]

const marketTools = computed(() =>
  allMarketTools.filter((t) => {
    if (t.flag === '__any_ranking__') {
      return (
        (brand.features as any)?.showDividendYieldRanking === true ||
        (brand.features as any)?.showMonthlyMoversRanking === true
      )
    }
    return (brand.features as any)?.[t.flag] === true
  })
)

// CTA buttons adapt to the tenant's active features, no dead links.
const ctaButtons = computed(() => {
  const buttons: Array<{ label: string; to: string; icon: string; variant: string }> = []
  const hasRankings =
    (brand.features as any)?.showDividendYieldRanking === true ||
    (brand.features as any)?.showMonthlyMoversRanking === true
  if (hasRankings) {
    buttons.push({ label: 'Rankings', to: '/ranking', icon: 'i-lucide-trophy', variant: 'primary' })
  }
  buttons.push({
    label: 'Buscar Ativos',
    to: '/search',
    icon: 'i-lucide-search',
    variant: buttons.length === 0 ? 'primary' : 'outline',
  })
  buttons.push({
    label: 'Calculadoras',
    to: '/calculadora',
    icon: 'i-lucide-calculator',
    variant: 'ghost',
  })
  return buttons
})

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
  {
    slug: 'quanto-rende-500-por-mes-na-bolsa',
    titulo: 'Quanto Rende R$ 500/Mês na Bolsa em 30 Anos?',
    descricao: 'Simulação real: quanto R$ 500 por mês rendem em 5, 10, 20 e 30 anos. Três cenários (conservador, moderado, arrojado) com juros compostos e dividendos.',
    categoria: 'planejamento',
    categoriaLabel: 'Planejamento',
    icon: 'i-lucide-piggy-bank',
    data: '20 Abr 2026',
    tempoLeitura: 7,
  },
  {
    slug: 'petr4-vs-vale3-vs-itub4',
    titulo: 'PETR4 vs VALE3 vs ITUB4: Qual é a Melhor?',
    descricao: 'Comparação direta das 3 maiores ações da B3 em 2026: Petrobras, Vale e Itaú. Dividendos, P/L, histórico e qual combina com seu perfil.',
    categoria: 'analises',
    categoriaLabel: 'Análises',
    icon: 'i-lucide-split',
    data: '20 Abr 2026',
    tempoLeitura: 9,
  },
  {
    slug: 'acoes-fiis-dividendos-todo-mes',
    titulo: '15 Ações e FIIs que Pagam Dividendos Todo Mês',
    descricao: 'Lista curada de 15 ativos da B3 que pagam dividendos mensalmente: 10 FIIs de alta liquidez e 5 ações recorrentes. DY, ticker e calendário.',
    categoria: 'dividendos',
    categoriaLabel: 'Dividendos',
    icon: 'i-lucide-calendar-check',
    data: '20 Abr 2026',
    tempoLeitura: 10,
  },
  {
    slug: 'como-declarar-acoes-imposto-renda',
    titulo: 'Como Declarar Ações no IR 2026: Guia Completo',
    descricao: 'Como declarar ações, FIIs e dividendos no IR 2026: isenções, códigos da Receita, limite de R$ 20 mil, day vs swing trade e as 5 pegadinhas.',
    categoria: 'acoes',
    categoriaLabel: 'Ações',
    icon: 'i-lucide-receipt',
    data: '20 Abr 2026',
    tempoLeitura: 12,
  },
  {
    slug: 'fire-independencia-financeira-calculadora',
    titulo: 'Quantos Anos Faltam Pra Você Se Aposentar? FIRE Brasil',
    descricao: 'Movimento FIRE no Brasil: quanto acumular, regra dos 4%, Lean/Coast/Barista/Fat FIRE e como calcular a idade da sua independência financeira.',
    categoria: 'planejamento',
    categoriaLabel: 'Planejamento',
    icon: 'i-lucide-flame',
    data: '20 Abr 2026',
    tempoLeitura: 11,
  },
  {
    slug: 'widgets-financeiros-para-site',
    titulo: 'Widgets Financeiros Grátis para Seu Site: Guia 2026',
    descricao: 'Como adicionar cotações da B3, calculadoras, mapas de calor e rankings em qualquer blog, newsletter ou site — sem cadastro, em 2 minutos.',
    categoria: 'ferramentas',
    categoriaLabel: 'Ferramentas',
    icon: 'i-lucide-code-xml',
    data: '20 Abr 2026',
    tempoLeitura: 8,
  },
]

// SEO
usePageSeo({
  title: `Blog de Investimentos: Guias e Tutoriais Completos | ${brand.name}`,
  description:
    'Artigos completos sobre ações, FIIs, dividendos e análises de ativos. Tutoriais práticos, guias passo a passo e estratégias para investidores de todos os níveis.',
  path: '/guias',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: `Blog da ${brand.name}`,
      description:
        'Artigos educacionais sobre investimentos em ações, FIIs, dividendos e mercado financeiro',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: brand.url,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: `${brand.url}/guias`,
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

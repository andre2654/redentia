<script setup lang="ts">
/**
 * Landing page do embed.redentia.com.br — SEO-OPTIMIZED (indexable).
 *
 * Diferente de /creative, /whitelabel, /api-portal (noindex), essa página
 * é a porta de entrada pra tráfego orgânico de:
 *  - "widget de cotações de ações para site"
 *  - "embed calculadora juros compostos"
 *  - "iframe ações B3"
 *  - "widget dividendos"
 *  - "mapa de calor bolsa"
 *
 * Cada embed vira um backlink permanente quando instalado em outro site.
 */

const brand = useBrand()

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

type EmbedCard = {
  slug: string
  title: string
  subtitle: string
  description: string
  href: string
  icon: string
  category: 'ticker' | 'ranking' | 'calculadora' | 'grafico' | 'mapa'
  tag?: string
}

const embeds: EmbedCard[] = [
  {
    slug: 'ticker-small',
    title: 'Ticker Small',
    subtitle: 'Card compacto de cotação',
    description:
      'Preço + variação do dia em formato compacto. Ideal pra barras laterais de blogs e newsletters.',
    href: '/embed/ticker/small?ticker=PETR4',
    icon: 'i-lucide-trending-up',
    category: 'ticker',
  },
  {
    slug: 'ticker-big',
    title: 'Ticker Big',
    subtitle: 'Card completo de ativo',
    description:
      'Cotação, gráfico mini, dividend yield e P/L em card destaque. Pra posts de análise fundamentalista.',
    href: '/embed/ticker/big?ticker=VALE3',
    icon: 'i-lucide-chart-candlestick',
    category: 'ticker',
    tag: 'POPULAR',
  },
  {
    slug: 'carousel',
    title: 'Carrossel de Tickers',
    subtitle: 'Múltiplos ativos rolando',
    description:
      'Carrossel horizontal com vários tickers customizáveis. Atualização em tempo real durante o pregão.',
    href: '/embed/carousel?tickers=PETR4,VALE3,ITUB4,BBAS3',
    icon: 'i-lucide-list-video',
    category: 'ticker',
  },
  {
    slug: 'grafico',
    title: 'Gráfico de Valorização',
    subtitle: 'Performance histórica',
    description:
      'Gráfico interativo de preço com opções de período (1M, 3M, 1A, 5A). Útil pra posts comparando ativos.',
    href: '/embed/grafico?ticker=BBAS3&periodo=1A',
    icon: 'i-lucide-line-chart',
    category: 'grafico',
  },
  {
    slug: 'ranking-altas',
    title: 'Top Maiores Altas',
    subtitle: 'Ações que mais subiram',
    description:
      'Ranking das ações em alta, com filtros por tipo (ações, FIIs, ETFs). Atualizado diariamente.',
    href: '/embed/ranking/altas?tipo=stock',
    icon: 'i-lucide-arrow-up-right',
    category: 'ranking',
    tag: 'NEW',
  },
  {
    slug: 'ranking-baixas',
    title: 'Top Maiores Baixas',
    subtitle: 'Ações que mais caíram',
    description:
      'Ranking inverso — ações que mais desvalorizaram. Complementa posts de análise de mercado.',
    href: '/embed/ranking/baixas?tipo=stock',
    icon: 'i-lucide-arrow-down-right',
    category: 'ranking',
  },
  {
    slug: 'mapa-calor',
    title: 'Mapa de Calor',
    subtitle: 'Visão setorial da B3',
    description:
      'Treemap com todas as ações do Ibovespa coloridas por variação. Visual poderoso pra newsletters.',
    href: '/embed/mapa-calor',
    icon: 'i-lucide-layout-grid',
    category: 'mapa',
    tag: 'NEW',
  },
  {
    slug: 'calculadora',
    title: 'Calculadoras Financeiras',
    subtitle: '7 calculadoras embedáveis',
    description:
      'Juros compostos, dividend yield, preço-teto, aposentadoria e mais. Use nos seus guias e cursos.',
    href: '/embed/calculadora/juros-compostos',
    icon: 'i-lucide-calculator',
    category: 'calculadora',
    tag: 'POPULAR',
  },
]

const integrationSteps = [
  {
    n: '01',
    title: 'Escolha o widget',
    text: 'Navegue pelas opções acima e clique no que quer usar no seu site.',
  },
  {
    n: '02',
    title: 'Customize e copie',
    text: 'Ajuste ticker, cores, tamanho e tema no painel. Copie o código iframe gerado.',
  },
  {
    n: '03',
    title: 'Cole no seu site',
    text: 'Cole o iframe onde quiser: WordPress, Webflow, Medium, newsletter — funciona em qualquer lugar.',
  },
]

const faqs = [
  {
    q: 'Os widgets da Redentia são gratuitos?',
    a: 'Sim, 100% gratuitos. Pedimos apenas manter o link "powered by Redentia" visível no rodapé de cada embed.',
  },
  {
    q: 'Preciso criar conta para usar?',
    a: 'Não. Basta copiar e colar o código iframe. Nenhum cadastro, API key ou autenticação é exigido para os embeds públicos.',
  },
  {
    q: 'Os dados são em tempo real?',
    a: 'Sim. Cotações atualizam durante o pregão da B3 (10h às 17h30). Fora do horário, exibimos o último fechamento.',
  },
  {
    q: 'Posso customizar cores e tamanho?',
    a: 'Sim. Cada widget tem painel de customização com cores, fonte, dimensões e modo claro/escuro. Ajustes ficam no próprio iframe.',
  },
  {
    q: 'Funciona em WordPress, Webflow, Medium?',
    a: 'Sim. O iframe é HTML padrão, compatível com qualquer plataforma que permita embedar HTML (WordPress, Webflow, Ghost, Medium, Notion public pages, etc.).',
  },
  {
    q: 'Preciso creditar a Redentia?',
    a: 'O credit já vem no próprio widget (pequeno link no rodapé). Você não precisa fazer nada adicional. Se remover, violação dos Termos de Uso.',
  },
  {
    q: 'Há limite de visualizações?',
    a: 'Não há limite para uso pessoal ou em blogs/sites de conteúdo. Para uso corporativo com alto volume (>100k views/mês), fale conosco.',
  },
]

usePageSeo({
  title: `Widgets e Embeds de Ações e Calculadoras Financeiras | ${brand.name}`,
  description:
    'Widgets gratuitos de cotação de ações da B3, calculadoras de juros compostos, mapas de calor, rankings e gráficos para embedar no seu site, blog ou newsletter. Dados em tempo real, customizável e sem cadastro.',
  path: '/embed',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Widgets e Embeds', path: '/embed' },
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Widgets e Embeds Redentia',
      description:
        'Coleção de widgets financeiros gratuitos para embedar em sites, blogs e newsletters.',
      about: [
        { '@type': 'Thing', name: 'Widget de cotação de ações B3' },
        { '@type': 'Thing', name: 'Calculadora financeira embed' },
        { '@type': 'Thing', name: 'Mapa de calor Ibovespa' },
        { '@type': 'Thing', name: 'Ranking maiores altas e baixas' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: embeds.map((e, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: e.title,
        description: e.description,
        url: `https://www.redentia.com.br${e.href.split('?')[0]}`,
      })),
    },
  ],
})
</script>

<template>
  <NuxtLayout name="static" title="Widgets e Embeds">
    <section class="flex flex-col gap-16 px-6 py-12 md:py-20">
      <!-- HERO -->
      <header class="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <span
          class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
          :style="{ color: brand.colors.primary }"
        >
          [EMBED.REDENTIA] · WIDGETS GRATUITOS
        </span>
        <h1
          class="text-4xl leading-tight tracking-tight md:text-6xl"
          :class="[brand.font.headingWeight, brand.font.headingStyle]"
          :style="{ color: brand.colors.text }"
        >
          Dados da B3 para <span class="italic" :style="{ color: brand.colors.primary }">qualquer site</span>
        </h1>
        <p class="max-w-2xl text-base text-gray-400 md:text-lg">
          Cotações em tempo real, calculadoras financeiras, mapas de calor e rankings da bolsa brasileira — tudo em widgets gratuitos prontos pra copiar e colar no seu site, blog ou newsletter.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
          <span class="flex items-center gap-1.5">
            <UIcon name="i-lucide-check-circle" class="size-4 text-green-400" /> 100% gratuito
          </span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span class="flex items-center gap-1.5">
            <UIcon name="i-lucide-check-circle" class="size-4 text-green-400" /> Sem cadastro
          </span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span class="flex items-center gap-1.5">
            <UIcon name="i-lucide-check-circle" class="size-4 text-green-400" /> Dados em tempo real
          </span>
          <span :style="{ color: brand.colors.border }">·</span>
          <span class="flex items-center gap-1.5">
            <UIcon name="i-lucide-check-circle" class="size-4 text-green-400" /> Customizável
          </span>
        </div>
      </header>

      <!-- GRID DE EMBEDS -->
      <div class="mx-auto w-full max-w-6xl">
        <h2 class="mb-8 text-2xl md:text-3xl" :class="[brand.font.headingWeight]">
          8 widgets para escolher
        </h2>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="embed in embeds"
            :key="embed.slug"
            :to="embed.href"
            class="group flex flex-col gap-3 rounded-2xl border p-6 transition hover:border-secondary/50"
            :style="{
              borderColor: brand.colors.border,
              backgroundColor: brand.colors.surface,
            }"
          >
            <div class="flex items-start justify-between">
              <div
                class="flex size-12 items-center justify-center rounded-xl"
                :style="{ backgroundColor: `${brand.colors.primary}1a` }"
              >
                <UIcon :name="embed.icon" class="size-6" :style="{ color: brand.colors.primary }" />
              </div>
              <span
                v-if="embed.tag"
                class="font-mono-tab text-[9px] uppercase tracking-[0.15em]"
                :style="{ color: brand.colors.primary }"
              >
                [{{ embed.tag }}]
              </span>
            </div>
            <div class="flex flex-col gap-1">
              <h3 class="text-lg font-semibold" :style="{ color: brand.colors.text }">
                {{ embed.title }}
              </h3>
              <p class="text-sm text-gray-400">
                {{ embed.subtitle }}
              </p>
            </div>
            <p class="text-sm leading-relaxed text-gray-500">
              {{ embed.description }}
            </p>
            <div
              class="mt-2 flex items-center gap-2 text-sm font-semibold transition-all group-hover:gap-3"
              :style="{ color: brand.colors.primary }"
            >
              Ver playground
              <UIcon name="i-lucide-arrow-right" class="size-4" />
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- COMO USAR -->
      <div class="mx-auto w-full max-w-4xl">
        <h2 class="mb-8 text-2xl md:text-3xl" :class="[brand.font.headingWeight]">
          Como instalar um widget no seu site
        </h2>
        <div class="grid gap-6 md:grid-cols-3">
          <div
            v-for="step in integrationSteps"
            :key="step.n"
            class="flex flex-col gap-3 rounded-xl border p-6"
            :style="{ borderColor: brand.colors.border }"
          >
            <span
              class="font-mono-tab text-xs uppercase tracking-[0.18em]"
              :style="{ color: brand.colors.primary }"
            >
              {{ step.n }}
            </span>
            <h3 class="text-lg font-semibold" :style="{ color: brand.colors.text }">
              {{ step.title }}
            </h3>
            <p class="text-sm text-gray-400">
              {{ step.text }}
            </p>
          </div>
        </div>
      </div>

      <!-- EXEMPLO DE CÓDIGO -->
      <div class="mx-auto w-full max-w-4xl">
        <h2 class="mb-6 text-2xl md:text-3xl" :class="[brand.font.headingWeight]">
          Exemplo: embed de cotação PETR4
        </h2>
        <p class="mb-4 text-sm text-gray-400">
          Cole este código em qualquer site. Funciona em WordPress, Webflow, Medium, Ghost, Notion, Substack e praticamente qualquer CMS.
        </p>
        <div
          class="overflow-x-auto rounded-xl border p-5 font-mono text-xs md:text-sm"
          :style="{
            backgroundColor: brand.colors.background,
            borderColor: brand.colors.border,
            color: brand.colors.text,
          }"
        >
          <code>&lt;iframe src="https://embed.redentia.com.br/ticker/small?ticker=PETR4"
        width="320" height="120"
        frameborder="0" loading="lazy"
        title="Cotação PETR4 em tempo real"&gt;&lt;/iframe&gt;</code>
        </div>
      </div>

      <!-- FAQ -->
      <div class="mx-auto w-full max-w-4xl">
        <h2 class="mb-8 text-2xl md:text-3xl" :class="[brand.font.headingWeight]">
          Perguntas Frequentes
        </h2>
        <div class="flex flex-col gap-3">
          <details
            v-for="faq in faqs"
            :key="faq.q"
            class="group rounded-xl border p-5"
            :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
          >
            <summary class="flex cursor-pointer list-none items-center justify-between text-sm font-semibold md:text-base" :style="{ color: brand.colors.text }">
              {{ faq.q }}
              <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
            </summary>
            <p class="mt-3 text-sm leading-relaxed text-gray-400">
              {{ faq.a }}
            </p>
          </details>
        </div>
      </div>

      <!-- CTA FINAL -->
      <div
        class="mx-auto flex w-full max-w-4xl flex-col items-center gap-5 rounded-3xl border p-10 text-center"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
      >
        <h2 class="text-2xl md:text-3xl" :class="[brand.font.headingWeight]" :style="{ color: brand.colors.text }">
          Quer mais do que widgets?
        </h2>
        <p class="max-w-xl text-sm text-gray-400 md:text-base">
          A plataforma completa da {{ brand.name }} tem análise com IA, carteira personalizada, alertas em tempo real e mais de 3.000 ativos. Grátis pra começar.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <UButton to="/auth/register" size="lg" color="primary">
            Criar conta grátis
          </UButton>
          <UButton to="/api-portal" size="lg" variant="outline" color="neutral">
            Ver API completa
          </UButton>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

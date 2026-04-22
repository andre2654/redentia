<template>
  <NuxtLayout name="api-portal">
    <div
      class="relative min-h-screen overflow-hidden"
      :style="{
        backgroundColor: REDENTIA_COLORS.background,
        color: REDENTIA_COLORS.text,
        fontFamily: REDENTIA_FONTS.body,
      }"
    >
      <!-- Background grid + amber glow (copiado do creative) -->
      <div class="pointer-events-none absolute inset-0">
        <div
          class="absolute left-1/2 top-0 h-[800px] w-[1400px] -translate-x-1/2 rounded-full blur-3xl opacity-40"
          :style="{ background: `radial-gradient(ellipse at center top, ${REDENTIA_COLORS.primary}40, transparent 60%)` }"
        />
        <div
          class="absolute inset-0 opacity-[0.04]"
          :style="{
            backgroundImage: `linear-gradient(${REDENTIA_COLORS.text} 1px, transparent 1px), linear-gradient(90deg, ${REDENTIA_COLORS.text} 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }"
        />
        <div
          class="absolute inset-0 opacity-20"
          :style="{ backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, ${REDENTIA_COLORS.text}04 2px, ${REDENTIA_COLORS.text}04 3px)` }"
        />
      </div>

      <!-- Header compartilhado — mesmo visual nas subpáginas do embed -->
      <MoleculesSubdomainHeader product="embed" />

      <!-- HERO (mesmo padrão do creative) -->
      <section class="relative mx-auto max-w-6xl px-6 pb-12 pt-16 md:px-10 md:pb-20 md:pt-24">
        <div class="mb-8 flex flex-wrap items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.18em]">
          <span class="flex items-center gap-1.5" :style="{ color: REDENTIA_COLORS.primary }">
            <span class="relative flex size-1.5">
              <span class="absolute inline-flex size-1.5 animate-ping rounded-full opacity-75" :style="{ backgroundColor: REDENTIA_COLORS.primary }" />
              <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: REDENTIA_COLORS.primary }" />
            </span>
            [EMBED.STUDIO]
          </span>
          <span :style="{ color: REDENTIA_COLORS.border }">·</span>
          <span :style="{ color: REDENTIA_COLORS.textMuted }">IFRAME READY · RESPONSIVO</span>
        </div>

        <h1
          class="mb-6 max-w-3xl text-[48px] leading-[0.95] tracking-tight sm:text-[64px] md:text-[80px] lg:text-[96px]"
          :style="{ color: REDENTIA_COLORS.text, fontFamily: REDENTIA_FONTS.display }"
        >
          Dados da B3 para
          <span class="italic" :style="{ color: REDENTIA_COLORS.primary }">qualquer site.</span>
        </h1>
        <p class="max-w-2xl text-base leading-relaxed md:text-lg" :style="{ color: REDENTIA_COLORS.textMuted }">
          Widgets gratuitos de cotação, calculadoras financeiras, mapas de calor e rankings da bolsa brasileira — tudo pronto pra copiar e colar no seu blog, newsletter ou dashboard. Dados em tempo real, zero cadastro.
        </p>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <span
            class="inline-flex items-center gap-2 rounded border px-3 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
            :style="{ borderColor: REDENTIA_COLORS.border, color: REDENTIA_COLORS.text, backgroundColor: `${REDENTIA_COLORS.surface}80` }"
          >
            <UIcon name="i-lucide-zap" class="size-3" :style="{ color: REDENTIA_COLORS.primary }" />
            [ COPY · PASTE · PUBLISH ]
          </span>
          <span
            class="inline-flex items-center gap-2 rounded border px-3 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
            :style="{ borderColor: REDENTIA_COLORS.border, color: REDENTIA_COLORS.text, backgroundColor: `${REDENTIA_COLORS.surface}80` }"
          >
            <UIcon name="i-lucide-database" class="size-3" :style="{ color: REDENTIA_COLORS.primary }" />
            [ DADOS EM TEMPO REAL ]
          </span>
          <span
            class="inline-flex items-center gap-2 rounded border px-3 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
            :style="{ borderColor: REDENTIA_COLORS.border, color: REDENTIA_COLORS.text, backgroundColor: `${REDENTIA_COLORS.surface}80` }"
          >
            <UIcon name="i-lucide-palette" class="size-3" :style="{ color: REDENTIA_COLORS.primary }" />
            [ TEMA CLARO · ESCURO ]
          </span>
        </div>
      </section>

      <!-- EMBEDS GRID (mesmo padrão do creative) -->
      <section class="relative border-t" :style="{ borderColor: REDENTIA_COLORS.border }">
        <div class="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
          <div class="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span
                class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
                :style="{ color: REDENTIA_COLORS.primary }"
              >
                [ {{ embeds.length.toString().padStart(2, '0') }} WIDGETS ]
              </span>
              <h2
                class="mt-3"
                :style="{
                  color: REDENTIA_COLORS.text,
                  fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                  lineHeight: '1.05',
                  fontFamily: REDENTIA_FONTS.display,
                }"
              >
                Escolha um widget.
              </h2>
            </div>
            <p class="max-w-sm text-sm" :style="{ color: REDENTIA_COLORS.textMuted }">
              Cada widget abre num playground com painel de customização. Ajuste o ticker, escolha tema, copie o iframe e cole no seu site.
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <NuxtLink
              v-for="embed in embeds"
              :key="embed.slug"
              :to="embed.to"
              class="group relative flex flex-col overflow-hidden rounded-lg border transition-all hover:-translate-y-1"
              :style="{
                borderColor: REDENTIA_COLORS.border,
                backgroundColor: `${REDENTIA_COLORS.surface}E6`,
                boxShadow: `0 10px 40px -20px ${REDENTIA_COLORS.primary}40`,
              }"
            >
              <!-- NEW badge -->
              <span
                v-if="embed.isNew"
                class="absolute right-4 top-4 z-10 rounded border px-2 py-0.5 font-mono-tab text-[9px] uppercase tracking-[0.15em]"
                :style="{
                  backgroundColor: REDENTIA_COLORS.primary,
                  color: REDENTIA_COLORS.background,
                  borderColor: REDENTIA_COLORS.primary,
                }"
              >
                NEW
              </span>

              <!-- Preview canvas (aspect-square com gradientes + grid) -->
              <div
                class="relative aspect-square w-full overflow-hidden border-b"
                :style="{ borderColor: REDENTIA_COLORS.border, backgroundColor: REDENTIA_COLORS.background }"
              >
                <div
                  class="absolute inset-0"
                  :style="{
                    background: `radial-gradient(circle at 30% 20%, ${REDENTIA_COLORS.primary}30, transparent 60%), radial-gradient(circle at 70% 80%, ${REDENTIA_COLORS.primary}20, transparent 60%)`,
                  }"
                />
                <div
                  class="absolute inset-0 opacity-[0.06]"
                  :style="{
                    backgroundImage: `linear-gradient(${REDENTIA_COLORS.text} 1px, transparent 1px), linear-gradient(90deg, ${REDENTIA_COLORS.text} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                  }"
                />
                <div class="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                  <UIcon :name="embed.icon" class="mb-4 size-12" :style="{ color: REDENTIA_COLORS.primary }" />
                  <div
                    class="mb-2 font-mono-tab text-[10px] uppercase tracking-[0.18em]"
                    :style="{ color: REDENTIA_COLORS.primary }"
                  >
                    {{ embed.eyebrow }}
                  </div>
                  <div
                    class="mb-3 text-2xl leading-[1.05] tracking-tight md:text-3xl"
                    :style="{ color: REDENTIA_COLORS.text, fontFamily: REDENTIA_FONTS.display }"
                  >
                    {{ embed.previewTitle }}
                  </div>
                  <div class="font-mono-tab text-[10px]" :style="{ color: REDENTIA_COLORS.textMuted }">
                    {{ embed.previewMeta }}
                  </div>
                </div>
              </div>

              <!-- Card body -->
              <div class="flex flex-1 flex-col gap-3 p-5">
                <div class="flex items-center gap-2">
                  <span
                    class="rounded border px-2 py-0.5 font-mono-tab text-[9px] uppercase tracking-[0.12em]"
                    :style="{ borderColor: REDENTIA_COLORS.border, color: REDENTIA_COLORS.textMuted }"
                  >
                    {{ embed.dimensions }}
                  </span>
                  <span
                    class="rounded border px-2 py-0.5 font-mono-tab text-[9px] uppercase tracking-[0.12em]"
                    :style="{ borderColor: REDENTIA_COLORS.border, color: REDENTIA_COLORS.textMuted }"
                  >
                    {{ embed.category }}
                  </span>
                </div>
                <h3 class="text-xl font-bold tracking-tight" :style="{ color: REDENTIA_COLORS.text }">
                  {{ embed.title }}
                </h3>
                <p class="text-[13px] leading-relaxed" :style="{ color: REDENTIA_COLORS.textMuted }">
                  {{ embed.description }}
                </p>
                <div
                  class="mt-auto flex items-center gap-2 border-t pt-3 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
                  :style="{ borderColor: REDENTIA_COLORS.border, color: REDENTIA_COLORS.primary }"
                >
                  ABRIR WIDGET
                  <UIcon name="i-lucide-arrow-right" class="size-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- HOW TO USE (mesmo padrão do creative) -->
      <section
        class="relative border-t"
        :style="{ borderColor: REDENTIA_COLORS.border, backgroundColor: `${REDENTIA_COLORS.surface}40` }"
      >
        <div class="mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-24">
          <div class="mb-12 text-center">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: REDENTIA_COLORS.primary }">
              [ COMO USAR ]
            </span>
            <h2
              class="mt-4"
              :style="{
                color: REDENTIA_COLORS.text,
                fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                lineHeight: '1.1',
                fontFamily: REDENTIA_FONTS.display,
              }"
            >
              3 passos pra embedar.
            </h2>
          </div>
          <ol class="flex flex-col gap-6">
            <li
              v-for="(step, idx) in steps"
              :key="idx"
              class="flex items-start gap-5 rounded-lg border p-5"
              :style="{ borderColor: REDENTIA_COLORS.border, backgroundColor: REDENTIA_COLORS.background }"
            >
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-full border font-mono-tab text-[13px]"
                :style="{ borderColor: REDENTIA_COLORS.primary, color: REDENTIA_COLORS.primary }"
              >
                {{ idx + 1 }}
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold tracking-tight" :style="{ color: REDENTIA_COLORS.text }">
                  {{ step.title }}
                </h3>
                <p class="mt-1 text-[13px] leading-relaxed" :style="{ color: REDENTIA_COLORS.textMuted }">
                  {{ step.description }}
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <!-- CODE EXAMPLE (exclusivo do embed, mas no mesmo tom visual) -->
      <section
        class="relative border-t"
        :style="{ borderColor: REDENTIA_COLORS.border }"
      >
        <div class="mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-24">
          <div class="mb-8 text-center">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: REDENTIA_COLORS.primary }">
              [ EXEMPLO DE CÓDIGO ]
            </span>
            <h2
              class="mt-4"
              :style="{
                color: REDENTIA_COLORS.text,
                fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                lineHeight: '1.1',
                fontFamily: REDENTIA_FONTS.display,
              }"
            >
              Cotação da PETR4 no seu site.
            </h2>
            <p class="mx-auto mt-3 max-w-xl text-[13px]" :style="{ color: REDENTIA_COLORS.textMuted }">
              Cole esse código em qualquer site que aceite HTML. Funciona em WordPress, Webflow, Medium, Ghost, Substack e Notion.
            </p>
          </div>
          <div
            class="overflow-x-auto rounded-lg border p-5 font-mono-tab text-[12px] leading-[1.65] md:text-[13px]"
            :style="{
              borderColor: REDENTIA_COLORS.border,
              backgroundColor: `${REDENTIA_COLORS.background}F5`,
              color: REDENTIA_COLORS.text,
            }"
          >
            <div :style="{ color: REDENTIA_COLORS.textMuted }">
              <span :style="{ color: REDENTIA_COLORS.primary }">&lt;iframe</span>
            </div>
            <div class="pl-4">
              <span :style="{ color: REDENTIA_COLORS.primary }">src</span><span :style="{ color: REDENTIA_COLORS.textMuted }">=</span><span :style="{ color: REDENTIA_COLORS.positive }">"https://embed.redentia.com.br/ticker/small?ticker=PETR4"</span>
            </div>
            <div class="pl-4">
              <span :style="{ color: REDENTIA_COLORS.primary }">width</span><span :style="{ color: REDENTIA_COLORS.textMuted }">=</span><span :style="{ color: REDENTIA_COLORS.positive }">"320"</span>
              <span :style="{ color: REDENTIA_COLORS.primary }"> height</span><span :style="{ color: REDENTIA_COLORS.textMuted }">=</span><span :style="{ color: REDENTIA_COLORS.positive }">"120"</span>
            </div>
            <div class="pl-4">
              <span :style="{ color: REDENTIA_COLORS.primary }">frameborder</span><span :style="{ color: REDENTIA_COLORS.textMuted }">=</span><span :style="{ color: REDENTIA_COLORS.positive }">"0"</span>
              <span :style="{ color: REDENTIA_COLORS.primary }"> loading</span><span :style="{ color: REDENTIA_COLORS.textMuted }">=</span><span :style="{ color: REDENTIA_COLORS.positive }">"lazy"</span>
            </div>
            <div>
              <span :style="{ color: REDENTIA_COLORS.primary }">&gt;&lt;/iframe&gt;</span>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ (SEO) -->
      <section
        class="relative border-t"
        :style="{ borderColor: REDENTIA_COLORS.border, backgroundColor: `${REDENTIA_COLORS.surface}40` }"
      >
        <div class="mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-24">
          <div class="mb-12 text-center">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: REDENTIA_COLORS.primary }">
              [ PERGUNTAS FREQUENTES ]
            </span>
            <h2
              class="mt-4"
              :style="{
                color: REDENTIA_COLORS.text,
                fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                lineHeight: '1.1',
                fontFamily: REDENTIA_FONTS.display,
              }"
            >
              Dúvidas comuns.
            </h2>
          </div>
          <div class="flex flex-col gap-3">
            <details
              v-for="faq in faqs"
              :key="faq.q"
              class="group rounded-lg border p-5"
              :style="{ borderColor: REDENTIA_COLORS.border, backgroundColor: REDENTIA_COLORS.background }"
            >
              <summary
                class="flex cursor-pointer list-none items-center justify-between text-sm font-semibold md:text-base"
                :style="{ color: REDENTIA_COLORS.text }"
              >
                {{ faq.q }}
                <UIcon name="i-lucide-chevron-down" class="size-5 transition-transform group-open:rotate-180" />
              </summary>
              <p class="mt-3 text-[13px] leading-relaxed" :style="{ color: REDENTIA_COLORS.textMuted }">
                {{ faq.a }}
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS, REDENTIA_FONTS } from '~/utils/redentiaCreativeColors'

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

// mainSiteHref agora vive dentro do MoleculesSubdomainHeader

interface EmbedCard {
  slug: string
  title: string
  description: string
  category: string
  dimensions: string
  icon: string
  eyebrow: string
  previewTitle: string
  previewMeta: string
  to: string
  isNew?: boolean
}

const embeds: EmbedCard[] = [
  {
    slug: 'ticker-small',
    title: 'Ticker Small',
    description:
      'Card compacto com logo, preço e variação do dia. Ideal pra sidebars de blogs, newsletters e menções rápidas em textos.',
    category: 'TICKER · POST',
    dimensions: '320 × 120',
    icon: 'i-lucide-trending-up',
    eyebrow: 'TICKER SMALL',
    previewTitle: 'PETR4',
    previewMeta: 'preço + variação',
    to: '/embed/ticker/small?ticker=PETR4',
  },
  {
    slug: 'ticker-big',
    title: 'Ticker Big',
    description:
      'Card completo com cotação, variação, dividend yield, P/L e setor. Pra posts de análise fundamentalista e destaque em guias.',
    category: 'TICKER · POST',
    dimensions: '420 × 220',
    icon: 'i-lucide-chart-candlestick',
    eyebrow: 'TICKER BIG',
    previewTitle: 'VALE3',
    previewMeta: 'cotação + fundamentais',
    to: '/embed/ticker/big?ticker=VALE3',
    isNew: true,
  },
  {
    slug: 'carousel',
    title: 'Carrossel de Tickers',
    description:
      'Barra horizontal com múltiplos ativos atualizando em tempo real. Perfeito pra headers de dashboards e tickers de newsletter.',
    category: 'CARROSSEL · HEADER',
    dimensions: '900 × 100',
    icon: 'i-lucide-list-video',
    eyebrow: 'CAROUSEL',
    previewTitle: 'PETR4 · VALE3 · ITUB4',
    previewMeta: 'scroll contínuo',
    to: '/embed/carousel?tickers=PETR4,VALE3,ITUB4,BBAS3',
  },
  {
    slug: 'grafico',
    title: 'Gráfico de Valorização',
    description:
      'Gráfico interativo de preço histórico com opções de período (1M, 3M, 6M, 1A, 5A). Útil pra posts comparativos e análise de cenário.',
    category: 'GRÁFICO · POST',
    dimensions: '640 × 400',
    icon: 'i-lucide-line-chart',
    eyebrow: 'CHART',
    previewTitle: 'BBAS3 · 1A',
    previewMeta: 'histórico de preço',
    to: '/embed/grafico?ticker=BBAS3&periodo=1A',
  },
  {
    slug: 'ranking-altas',
    title: 'Top Maiores Altas',
    description:
      'Ranking diário das ações que mais subiram, com filtros por ações, FIIs e ETFs. Pra posts diários sobre o mercado brasileiro.',
    category: 'RANKING · POST',
    dimensions: '480 × 580',
    icon: 'i-lucide-arrow-up-right',
    eyebrow: 'RANKING · TOP',
    previewTitle: 'Maiores Altas',
    previewMeta: 'pregão de hoje',
    to: '/embed/ranking/altas?tipo=stock',
    isNew: true,
  },
  {
    slug: 'ranking-baixas',
    title: 'Top Maiores Baixas',
    description:
      'Ranking inverso das ações que mais caíram hoje. Complementa o post de altas e análises de cenário de baixa.',
    category: 'RANKING · POST',
    dimensions: '480 × 580',
    icon: 'i-lucide-arrow-down-right',
    eyebrow: 'RANKING · FLOP',
    previewTitle: 'Maiores Baixas',
    previewMeta: 'pregão de hoje',
    to: '/embed/ranking/baixas?tipo=stock',
  },
  {
    slug: 'mapa-calor',
    title: 'Mapa de Calor',
    description:
      'Treemap com os principais ativos do Ibovespa, IFIX ou Small Caps coloridos por variação do dia. Visual poderoso pra newsletters.',
    category: 'HEATMAP · POST',
    dimensions: '800 × 500',
    icon: 'i-lucide-layout-grid',
    eyebrow: 'MKTMAP',
    previewTitle: 'Ibovespa',
    previewMeta: 'pregão de hoje',
    to: '/embed/mapa-calor',
    isNew: true,
  },
  {
    slug: 'calculadora',
    title: 'Calculadoras Financeiras',
    description:
      'Juros compostos, dividend yield, preço-teto, aposentadoria e mais. Use nos seus guias, cursos online e landing pages.',
    category: 'CALCULADORA · CURSO',
    dimensions: '480 × 700',
    icon: 'i-lucide-calculator',
    eyebrow: 'CALCULATOR',
    previewTitle: 'Juros Compostos',
    previewMeta: '7 calculadoras',
    to: '/embed/calculadora/juros-compostos',
  },
]

const steps = [
  {
    title: 'Escolha um widget',
    description: 'Clique em qualquer card acima pra abrir o playground do widget, com painel de customização e preview ao vivo.',
  },
  {
    title: 'Customize e copie',
    description: 'Ajuste ticker, cores, tamanho e tema no painel lateral. O código iframe é atualizado em tempo real.',
  },
  {
    title: 'Cole no seu site',
    description: 'Cole o iframe em qualquer CMS — WordPress, Webflow, Medium, Ghost ou Substack. Funciona em qualquer lugar que aceite HTML.',
  },
]

const faqs = [
  {
    q: 'Os widgets da Redentia são gratuitos?',
    a: 'Sim, 100% gratuitos. Pedimos apenas manter o link "powered by Redentia" visível no rodapé do widget (já vem no código).',
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
    a: 'Sim. Cada widget tem painel de customização com cores, fonte, dimensões e modo claro/escuro. Ajustes ficam salvos no próprio iframe.',
  },
  {
    q: 'Funciona em WordPress, Webflow, Medium?',
    a: 'Sim. O iframe é HTML padrão, compatível com qualquer plataforma que permita embedar HTML (WordPress, Webflow, Ghost, Medium, Notion, Substack).',
  },
  {
    q: 'Há limite de visualizações?',
    a: 'Não há limite para uso pessoal ou em blogs/sites de conteúdo. Para uso corporativo com alto volume (>100k views/mês), fale com a gente.',
  },
  {
    q: 'Preciso creditar a Redentia?',
    a: 'O credit já vem no próprio widget (pequeno link no rodapé). Você não precisa fazer nada adicional. Remover viola os Termos de Uso.',
  },
]

// SEO — landing é indexável, essa é a porta de entrada do funil de embeds.
usePageSeo({
  title: `Widgets e Embeds de Ações e Calculadoras Financeiras | Redentia`,
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
        url: `https://www.redentia.com.br${e.to.split('?')[0]}`,
      })),
    },
  ],
})
</script>

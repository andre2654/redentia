<template>
  <NuxtLayout name="api-portal">
    <div
      class="relative min-h-screen overflow-hidden"
      :style="{ backgroundColor: REDENTIA_COLORS.background, color: REDENTIA_COLORS.text, fontFamily: REDENTIA_FONTS.body }"
    >
      <!-- Background grid + amber glow -->
      <div class="pointer-events-none absolute inset-0">
        <div
          class="absolute left-1/2 top-0 h-[800px] w-[1400px] -translate-x-1/2 rounded-full blur-3xl opacity-40"
          :style="{ background: `radial-gradient(ellipse at center top, ${REDENTIA_COLORS.primary}40, transparent 60%)` }"
        />
        <div
          class="absolute inset-0 opacity-[0.04]"
          :style="{ backgroundImage: `linear-gradient(${REDENTIA_COLORS.text} 1px, transparent 1px), linear-gradient(90deg, ${REDENTIA_COLORS.text} 1px, transparent 1px)`, backgroundSize: '32px 32px' }"
        />
        <div
          class="absolute inset-0 opacity-20"
          :style="{ backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, ${REDENTIA_COLORS.text}04 2px, ${REDENTIA_COLORS.text}04 3px)` }"
        />
      </div>

      <!-- Header -->
      <header
        class="sticky top-0 z-40 border-b backdrop-blur-xl"
        :style="{ borderColor: REDENTIA_COLORS.border, backgroundColor: `${REDENTIA_COLORS.background}CC` }"
      >
        <div class="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 md:px-6">
          <NuxtLink to="/creative" class="flex items-center gap-2">
            <div
              class="flex size-7 items-center justify-center rounded"
              :style="{ backgroundColor: REDENTIA_COLORS.primary, color: REDENTIA_COLORS.background }"
            >
              <UIcon name="i-lucide-image" class="size-4" />
            </div>
            <span class="font-mono-tab text-[11px] font-bold uppercase tracking-[0.15em]" :style="{ color: REDENTIA_COLORS.text }">
              REDENTIA<span :style="{ color: REDENTIA_COLORS.primary }">.CREATIVE</span>
            </span>
          </NuxtLink>
          <div class="flex-1" />
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 font-mono-tab text-[11px] uppercase tracking-[0.15em] transition-colors hover:opacity-70"
            :style="{ color: REDENTIA_COLORS.textMuted }"
          >
            <UIcon name="i-lucide-arrow-left" class="size-3" />
            Voltar pro site
          </NuxtLink>
        </div>
      </header>

      <!-- HERO -->
      <section class="relative mx-auto max-w-6xl px-6 pb-12 pt-16 md:px-10 md:pb-20 md:pt-24">
        <div class="mb-8 flex flex-wrap items-center gap-3 font-mono-tab text-[10px] uppercase tracking-[0.18em]">
          <span class="flex items-center gap-1.5" :style="{ color: REDENTIA_COLORS.primary }">
            <span class="relative flex size-1.5">
              <span class="absolute inline-flex size-1.5 animate-ping rounded-full opacity-75" :style="{ backgroundColor: REDENTIA_COLORS.primary }" />
              <span class="relative inline-flex size-1.5 rounded-full" :style="{ backgroundColor: REDENTIA_COLORS.primary }" />
            </span>
            [CREATIVE.STUDIO]
          </span>
          <span :style="{ color: REDENTIA_COLORS.border }">·</span>
          <span :style="{ color: REDENTIA_COLORS.textMuted }">SOCIAL READY · 1080×1080</span>
        </div>

        <h1
          class="mb-6 max-w-3xl text-[48px] leading-[0.95] tracking-tight sm:text-[64px] md:text-[80px] lg:text-[96px]"
          :style="{ color: REDENTIA_COLORS.text, fontFamily: REDENTIA_FONTS.display }"
        >
          Conteúdo pronto pro
          <span class="italic" :style="{ color: REDENTIA_COLORS.primary }">feed.</span>
        </h1>
        <p class="max-w-2xl text-base leading-relaxed md:text-lg" :style="{ color: REDENTIA_COLORS.textMuted }">
          Cards, rankings e animações prontas pra você tirar print, postar nas redes sociais e bombar o conteúdo. Todo creative puxa dados reais da Redentia em tempo real — basta escolher o ativo e screenshotar.
        </p>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <span
            class="inline-flex items-center gap-2 rounded border px-3 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
            :style="{ borderColor: REDENTIA_COLORS.border, color: REDENTIA_COLORS.text, backgroundColor: `${REDENTIA_COLORS.surface}80` }"
          >
            <UIcon name="i-lucide-camera" class="size-3" :style="{ color: REDENTIA_COLORS.primary }" />
            [ SCREENSHOT READY ]
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
            <UIcon name="i-lucide-instagram" class="size-3" :style="{ color: REDENTIA_COLORS.primary }" />
            [ POST · STORY · REELS ]
          </span>
        </div>
      </section>

      <!-- CREATIVE GRID -->
      <section class="relative border-t" :style="{ borderColor: REDENTIA_COLORS.border }">
        <div class="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
          <div class="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: REDENTIA_COLORS.primary }">
                [ {{ creatives.length.toString().padStart(2, '0') }} CREATIVES ]
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
                Escolha um template.
              </h2>
            </div>
            <p class="max-w-sm text-sm" :style="{ color: REDENTIA_COLORS.textMuted }">
              Cada creative abre numa tela quadrada. Tira print, ajusta o ticker via query string e posta.
            </p>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <NuxtLink
              v-for="creative in creatives"
              :key="creative.slug"
              :to="creative.to"
              class="group relative flex flex-col overflow-hidden rounded-lg border transition-all hover:-translate-y-1"
              :style="{
                borderColor: REDENTIA_COLORS.border,
                backgroundColor: `${REDENTIA_COLORS.surface}E6`,
                boxShadow: `0 10px 40px -20px ${REDENTIA_COLORS.primary}40`,
              }"
            >
              <!-- NEW badge -->
              <span
                v-if="creative.isNew"
                class="absolute right-4 top-4 z-10 rounded border px-2 py-0.5 font-mono-tab text-[9px] uppercase tracking-[0.15em]"
                :style="{
                  backgroundColor: REDENTIA_COLORS.primary,
                  color: REDENTIA_COLORS.background,
                  borderColor: REDENTIA_COLORS.primary,
                }"
              >
                NEW
              </span>

              <!-- Preview canvas (square aspect) -->
              <div
                class="relative aspect-square w-full overflow-hidden border-b"
                :style="{ borderColor: REDENTIA_COLORS.border, backgroundColor: REDENTIA_COLORS.background }"
              >
                <!-- Decorative background -->
                <div
                  class="absolute inset-0"
                  :style="{
                    background: `radial-gradient(circle at 30% 20%, ${REDENTIA_COLORS.primary}30, transparent 60%), radial-gradient(circle at 70% 80%, ${REDENTIA_COLORS.primary}20, transparent 60%)`,
                  }"
                />
                <!-- Grid pattern -->
                <div
                  class="absolute inset-0 opacity-[0.06]"
                  :style="{ backgroundImage: `linear-gradient(${REDENTIA_COLORS.text} 1px, transparent 1px), linear-gradient(90deg, ${REDENTIA_COLORS.text} 1px, transparent 1px)`, backgroundSize: '20px 20px' }"
                />
                <!-- Preview content -->
                <div class="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                  <UIcon
                    :name="creative.icon"
                    class="mb-4 size-12"
                    :style="{ color: REDENTIA_COLORS.primary }"
                  />
                  <div
                    class="mb-2 font-mono-tab text-[10px] uppercase tracking-[0.18em]"
                    :style="{ color: REDENTIA_COLORS.primary }"
                  >
                    {{ creative.eyebrow }}
                  </div>
                  <div
                    class="mb-3 text-2xl leading-[1.05] tracking-tight md:text-3xl"
                    :style="{ color: REDENTIA_COLORS.text, fontFamily: REDENTIA_FONTS.display }"
                  >
                    {{ creative.previewTitle }}
                  </div>
                  <div class="font-mono-tab text-[10px]" :style="{ color: REDENTIA_COLORS.textMuted }">
                    {{ creative.previewMeta }}
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
                    {{ creative.dimensions }}
                  </span>
                  <span
                    class="rounded border px-2 py-0.5 font-mono-tab text-[9px] uppercase tracking-[0.12em]"
                    :style="{ borderColor: REDENTIA_COLORS.border, color: REDENTIA_COLORS.textMuted }"
                  >
                    {{ creative.category }}
                  </span>
                </div>
                <h3 class="text-xl font-bold tracking-tight" :style="{ color: REDENTIA_COLORS.text }">
                  {{ creative.title }}
                </h3>
                <p class="text-[13px] leading-relaxed" :style="{ color: REDENTIA_COLORS.textMuted }">
                  {{ creative.description }}
                </p>
                <div
                  class="mt-auto flex items-center gap-2 border-t pt-3 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
                  :style="{ borderColor: REDENTIA_COLORS.border, color: REDENTIA_COLORS.primary }"
                >
                  ABRIR CREATIVE
                  <UIcon name="i-lucide-arrow-right" class="size-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- HOW TO USE -->
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
              3 passos pra postar.
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
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS, REDENTIA_FONTS } from '~/utils/redentiaCreativeColors'

interface CreativeCard {
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

const creatives: CreativeCard[] = [
  {
    slug: 'growth-race',
    title: 'Growth Race (Animado)',
    description: 'Comparação animada de valorização de múltiplos ativos com datas passando no título, logos como pontos do gráfico, opção de dividendos reinvestidos. Ideal pra Reels e Stories.',
    category: 'COMPARATIVO · REELS',
    dimensions: '1080 × 1080',
    icon: 'i-lucide-trending-up',
    eyebrow: 'GROWTH RACE',
    previewTitle: 'PETR4 vs VALE3 vs IBOV',
    previewMeta: '2019 → 2026 · animado',
    to: '/creative/growth-race?tickers=PETR4,VALE3,IBOV&reinvest=true',
    isNew: true,
  },
  {
    slug: 'asset-spotlight',
    title: 'Spotlight do Ativo',
    description: 'Card completo com preço, variação, market cap e indicadores fundamentalistas de um ativo. Pronto pra postar como destaque do dia.',
    category: 'DESTAQUE · POST',
    dimensions: '1080 × 1080',
    icon: 'i-lucide-star',
    eyebrow: 'DESTAQUE DO DIA',
    previewTitle: 'PETR4 em foco',
    previewMeta: 'preço + fundamentais',
    to: '/creative/asset-spotlight?ticker=PETR4&subtitle=Destaque+do+dia',
  },
  {
    slug: 'asset-compare',
    title: 'Comparativo de 2 Ativos',
    description: 'Compare 2 ações lado a lado — preço, variação, market cap, DY, P/L. Ideal pra polêmicas do tipo "VALE3 ou PETR4?".',
    category: 'COMPARATIVO · POST',
    dimensions: '1080 × 1080',
    icon: 'i-lucide-split',
    eyebrow: 'COMPARATIVO',
    previewTitle: 'PETR4 vs VALE3',
    previewMeta: 'indicadores lado a lado',
    to: '/creative/asset-compare?tickerA=PETR4&tickerB=VALE3',
  },
  {
    slug: 'ranking-top',
    title: 'Top Altas do Dia',
    description: 'Ranking das maiores altas do pregão com logos, tickers, preços e variação. Atualizado em tempo real.',
    category: 'RANKING · POST',
    dimensions: '1080 × 1080',
    icon: 'i-lucide-trophy',
    eyebrow: 'RANKING · TOP 6',
    previewTitle: 'Maiores Altas',
    previewMeta: 'pregão de hoje',
    to: '/creative/ranking/top',
  },
  {
    slug: 'ranking-bottom',
    title: 'Top Baixas do Dia',
    description: 'Ranking das maiores baixas do pregão. Mesma estrutura do Top Altas mas com o tema vermelho.',
    category: 'RANKING · POST',
    dimensions: '1080 × 1080',
    icon: 'i-lucide-trending-down',
    eyebrow: 'RANKING · FLOP 6',
    previewTitle: 'Maiores Baixas',
    previewMeta: 'pregão de hoje',
    to: '/creative/ranking/bottom',
  },
  {
    slug: 'market-updates',
    title: 'Market Updates (Notificação)',
    description: 'Card estilizado como notificação de iPhone mostrando update de mercado. Ideal pra chamar atenção com headlines curtos.',
    category: 'NOTIFICAÇÃO · REELS',
    dimensions: '1080 × 1080',
    icon: 'i-lucide-bell',
    eyebrow: 'MARKET UPDATE',
    previewTitle: 'Resumo do dia',
    previewMeta: 'estilo notificação',
    to: '/creative/market-updates?format=square',
  },
]

const steps = [
  {
    title: 'Escolha um template',
    description: 'Clique em qualquer card acima pra abrir o creative numa tela quadrada, preenchido com dados reais.',
  },
  {
    title: 'Ajuste via query string',
    description: 'Troque o ativo, subtítulo ou formato mudando os parâmetros na URL. Ex: ?ticker=VALE3&subtitle=Alta+do+dia',
  },
  {
    title: 'Tire print e posta',
    description: 'Use o screenshot do navegador (⌘+Shift+4 no Mac) pra capturar o quadrado e postar nas redes. Pronto.',
  },
]

definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

usePageSeo({
  title: 'Redentia Creative — Conteúdo pronto pro feed',
  description: 'Templates de cards, rankings e animações com dados reais do mercado. Pronto pra print e postar nas redes sociais.',
  path: '/creative',
  robots: 'noindex',
})
</script>

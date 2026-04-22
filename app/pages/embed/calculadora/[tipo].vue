<script setup lang="ts">
/**
 * Embed de calculadoras financeiras. Os tipos disponíveis são:
 *  - juros-compostos
 *  - dividend-yield
 *  - preco-teto
 *  - aposentadoria
 *  - quanto-investir
 *  - imposto-renda
 *  - juros-simples (em breve)
 */

const route = useRoute()
const brand = useBrand()

definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const tipo = computed(() => String(route.params.tipo || 'juros-compostos').toLowerCase())
const theme = ref<'dark' | 'light'>((route.query.theme as any) === 'light' ? 'light' : 'dark')

// Carrega ativos + setores sob demanda só para os tipos que precisam (preco-teto, dividend-yield)
const needsAssets = computed(() => tipo.value === 'preco-teto' || tipo.value === 'dividend-yield')
const needsSectors = computed(() => tipo.value === 'preco-teto')

const { getAssets, getSectors } = useAssetsService()

const { data: assetsData, pending: assetsPending } = await useAsyncData(
  () => `embed-calc-assets-${tipo.value}`,
  () => (needsAssets.value ? getAssets() : Promise.resolve([])),
  { watch: [tipo] },
)

const { data: sectorsData } = await useAsyncData(
  () => `embed-calc-sectors-${tipo.value}`,
  () => (needsSectors.value ? getSectors().catch(() => []) : Promise.resolve([])),
  { watch: [tipo] },
)

const assets = computed(() => assetsData.value ?? [])
const assetsLoading = computed(() => assetsPending.value)
const sectors = computed(() => sectorsData.value ?? [])

const { isWidgetMode, embedUrl, iframeCode, copied, copyIframe } = useEmbedPlayground({
  path: `/calculadora/${tipo.value}`,
  width: 480,
  height: 700,
  params: computed(() => ({ theme: theme.value })),
  title: computed(() => `Calculadora ${tipoLabel.value}`),
})

const tipoLabels: Record<string, string> = {
  'juros-compostos': 'Juros Compostos',
  'dividend-yield': 'Dividend Yield',
  'preco-teto': 'Preço Teto (Método Bazin)',
  'aposentadoria': 'Aposentadoria',
  'quanto-investir': 'Quanto Investir',
  'imposto-renda': 'Imposto de Renda',
}

const tipoLabel = computed(() => tipoLabels[tipo.value] || 'Calculadora')

const availableCalcs = [
  { slug: 'juros-compostos', label: 'Juros Compostos', icon: 'i-lucide-trending-up' },
  { slug: 'dividend-yield', label: 'Dividend Yield', icon: 'i-lucide-percent' },
  { slug: 'preco-teto', label: 'Preço Teto', icon: 'i-lucide-target' },
  { slug: 'aposentadoria', label: 'Aposentadoria', icon: 'i-lucide-piggy-bank' },
  { slug: 'quanto-investir', label: 'Quanto Investir', icon: 'i-lucide-calculator' },
  { slug: 'imposto-renda', label: 'IR sobre Ações', icon: 'i-lucide-receipt' },
]

const seoTitle = computed(
  () =>
    `Calculadora de ${tipoLabel.value} Embedável: Widget para Site | ${brand.name}`
)
const seoDesc = computed(
  () =>
    `Calculadora de ${tipoLabel.value} em formato widget embeddable. Cole no seu site, blog ou curso. Funciona em WordPress, Webflow e qualquer CMS. Gratuito e sem cadastro.`
)

if (!isWidgetMode.value) {
  usePageSeo({
    title: seoTitle.value,
    description: seoDesc.value,
    path: `/embed/calculadora/${tipo.value}`,
    breadcrumbs: [
      { name: 'Início', path: '/' },
      { name: 'Widgets', path: '/embed' },
      { name: `Calc ${tipoLabel.value}`, path: `/embed/calculadora/${tipo.value}` },
    ],
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: `Widget Calculadora de ${tipoLabel.value} Redentia`,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      },
    ],
  })
} else {
  useSeoMeta({ robots: 'noindex,nofollow', title: seoTitle.value })
}
</script>

<template>
  <div v-if="isWidgetMode" class="embed-widget">
    <!-- Widget mode: reusa o componente CalculatorCompound quando possível -->
    <div
      class="flex h-full w-full flex-col rounded-xl p-4"
      :style="{
        backgroundColor: theme === 'light' ? '#ffffff' : brand.colors.surface,
        border: `1px solid ${theme === 'light' ? '#e5e7eb' : brand.colors.border}`,
      }"
    >
      <h3 class="mb-3 text-sm font-bold uppercase tracking-wider" :style="{ color: theme === 'light' ? '#111' : brand.colors.text }">
        Calculadora · {{ tipoLabel }}
      </h3>
      <div class="flex-1 overflow-auto">
        <CalculatorCompound v-if="tipo === 'juros-compostos'" />
        <CalculatorDividendYield
          v-else-if="tipo === 'dividend-yield'"
          :assets="assets"
          :assets-loading="assetsLoading"
        />
        <CalculatorFairPrice
          v-else-if="tipo === 'preco-teto'"
          :assets="assets"
          :assets-loading="assetsLoading"
          :sectors="sectors"
        />
        <CalculatorRetirement v-else-if="tipo === 'aposentadoria'" />
        <CalculatorMonthlyInvestment v-else-if="tipo === 'quanto-investir'" />
        <CalculatorIncomeTax v-else-if="tipo === 'imposto-renda'" />
        <div v-else class="flex h-full flex-col items-center justify-center gap-3 text-center" :style="{ color: theme === 'light' ? '#6b7280' : brand.colors.textMuted }">
          <UIcon name="i-lucide-construction" class="size-10" />
          <p class="text-sm">Calculadora não encontrada.</p>
          <NuxtLink
            to="/embed/calculadora/juros-compostos"
            class="text-sm font-semibold underline"
            :style="{ color: brand.colors.primary }"
          >
            Ver juros compostos
          </NuxtLink>
        </div>
      </div>
      <div class="mt-2 text-[9px] uppercase tracking-[0.15em] opacity-60" :style="{ color: theme === 'light' ? '#6b7280' : brand.colors.textMuted }">
        redentia.com.br
      </div>
    </div>
  </div>

  <MoleculesEmbedPlaygroundShell
    v-else
    :breadcrumb="tipoLabel"
    :hero-title="`Calculadora de ${tipoLabel} para Seu Site`"
    :hero-description="`Embed da calculadora de ${tipoLabel.toLowerCase()} da Redentia. Use em blogs de educação financeira, cursos, landing pages de consultoria ou newsletters. Gratuita, sem cadastro, customizável.`"
    eyebrow-suffix="CALCULADORA EMBEDÁVEL"
  >
      <!-- Seletor de calculadoras disponíveis -->
      <div>
        <h2 class="mb-3 text-sm uppercase tracking-wider text-gray-500">Outras calculadoras embeddable</h2>
        <div class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="c in availableCalcs"
            :key="c.slug"
            :to="`/embed/calculadora/${c.slug}`"
            class="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition"
            :class="c.slug === tipo ? 'border-secondary bg-secondary/10 text-secondary' : 'border-white/10 text-gray-400 hover:border-white/20'"
          >
            <UIcon :name="c.icon" class="size-4" />
            {{ c.label }}
          </NuxtLink>
        </div>
      </div>

      <div class="grid gap-8 md:grid-cols-5">
        <div class="flex flex-col gap-5 md:col-span-2">
          <h2 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Customizar</h2>
          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-400">Tema</label>
            <div class="flex gap-2">
              <button type="button" class="flex-1 rounded-lg border px-4 py-2 text-sm transition" :class="theme === 'dark' ? 'border-secondary bg-secondary/10 text-secondary' : 'border-white/10 text-gray-400'" @click="theme = 'dark'">Escuro</button>
              <button type="button" class="flex-1 rounded-lg border px-4 py-2 text-sm transition" :class="theme === 'light' ? 'border-secondary bg-secondary/10 text-secondary' : 'border-white/10 text-gray-400'" @click="theme = 'light'">Claro</button>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-400">Código iframe</label>
            <div class="overflow-x-auto rounded-lg border p-4 font-mono text-xs" :style="{ backgroundColor: brand.colors.background, borderColor: brand.colors.border, color: brand.colors.text }"><code>{{ iframeCode }}</code></div>
            <UButton :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'" color="primary" block @click="copyIframe">{{ copied ? 'Copiado!' : 'Copiar código' }}</UButton>
          </div>
        </div>
        <div class="flex flex-col gap-4 md:col-span-3">
          <h2 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Pré-visualização</h2>
          <div class="flex min-h-[740px] items-center justify-center rounded-2xl border p-4" :style="{ borderColor: brand.colors.border, backgroundColor: theme === 'light' ? '#f9fafb' : brand.colors.background }">
            <iframe :src="embedUrl" width="480" height="700" frameborder="0" loading="lazy" :title="`Calculadora ${tipoLabel}`" style="border:0;border-radius:12px;max-width:100%;" />
          </div>
        </div>
      </div>
  </MoleculesEmbedPlaygroundShell>
</template>

<style scoped>
.embed-widget { font-family: system-ui, -apple-system, sans-serif; }
</style>

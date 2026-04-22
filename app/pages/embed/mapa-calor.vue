<script setup lang="ts">
const route = useRoute()
const brand = useBrand()

definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

const indice = ref<'ibovespa' | 'ifix' | 'smll'>((route.query.indice as any) || 'ibovespa')
const theme = ref<'dark' | 'light'>((route.query.theme as any) === 'light' ? 'light' : 'dark')

const { isWidgetMode, embedUrl, iframeCode, copied, copyIframe } = useEmbedPlayground({
  path: '/mapa-calor',
  width: 800,
  height: 500,
  params: computed(() => ({ indice: indice.value, theme: theme.value })),
  title: computed(() => `Mapa de calor ${indice.value.toUpperCase()} hoje`),
})

// Fetch heatmap data — endpoint /api/heatmap retorna { data: [...] }
const { data: heatmapData } = await useAsyncData(
  `heatmap-${indice.value}`,
  async () => {
    try {
      const apiBase = String(useRuntimeConfig().public?.apiBaseUrl || '')
      const res = await $fetch<any>(`${apiBase}/heatmap?index=${indice.value}&limit=30`)
      return Array.isArray(res) ? res : res?.data || []
    } catch {
      return []
    }
  },
  { watch: [indice] }
)

const items = computed(() =>
  (Array.isArray(heatmapData.value) ? heatmapData.value : []).slice(0, 30)
)

// Cor baseada na variação
const cellColor = (change: number) => {
  if (change >= 3) return '#16a34a'
  if (change >= 1) return '#22c55e'
  if (change >= 0) return '#4ade80'
  if (change >= -1) return '#f87171'
  if (change >= -3) return '#ef4444'
  return '#dc2626'
}

const indiceLabels: Record<string, string> = {
  ibovespa: 'Ibovespa',
  ifix: 'IFIX (FIIs)',
  smll: 'Small Caps',
}

if (!isWidgetMode.value) {
  usePageSeo({
    title: `Mapa de Calor da Bolsa Brasileira: Widget B3 | ${brand.name}`,
    description:
      'Visualize o desempenho diário do Ibovespa, IFIX e Small Caps em formato treemap colorido. Widget gratuito de mapa de calor da bolsa para embedar em sites e newsletters de finanças.',
    path: '/embed/mapa-calor',
    breadcrumbs: [
      { name: 'Início', path: '/' },
      { name: 'Widgets', path: '/embed' },
      { name: 'Mapa de Calor', path: '/embed/mapa-calor' },
    ],
  })
} else {
  useSeoMeta({ robots: 'noindex,nofollow', title: `Mapa de Calor · ${brand.name}` })
}
</script>

<template>
  <div v-if="isWidgetMode" class="embed-widget">
    <div
      class="flex h-full w-full flex-col rounded-xl p-4"
      :style="{
        backgroundColor: theme === 'light' ? '#ffffff' : brand.colors.surface,
        border: `1px solid ${theme === 'light' ? '#e5e7eb' : brand.colors.border}`,
      }"
    >
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-sm font-bold uppercase tracking-wider" :style="{ color: theme === 'light' ? '#111' : brand.colors.text }">
          Mapa de Calor · {{ indiceLabels[indice] }}
        </h3>
        <span class="text-[10px] uppercase tracking-wider opacity-60" :style="{ color: theme === 'light' ? '#6b7280' : brand.colors.textMuted }">hoje</span>
      </div>

      <div class="grid flex-1 grid-cols-6 gap-1">
        <NuxtLink
          v-for="(it, i) in items"
          :key="i"
          :to="`https://www.redentia.com.br/asset/${String(it.ticker || '').toLowerCase()}`"
          target="_blank"
          rel="noopener"
          class="flex flex-col items-center justify-center rounded p-2 text-white transition hover:scale-105"
          :style="{ backgroundColor: cellColor(it.change_percent ?? 0) }"
        >
          <span class="text-xs font-bold">{{ it.ticker }}</span>
          <span class="text-[10px] tabular-nums opacity-90">
            {{ (it.change_percent ?? 0) >= 0 ? '+' : '' }}{{ (it.change_percent ?? 0).toFixed(2) }}%
          </span>
        </NuxtLink>
      </div>

      <div class="mt-3 text-[9px] uppercase tracking-[0.15em] opacity-60" :style="{ color: theme === 'light' ? '#6b7280' : brand.colors.textMuted }">
        redentia.com.br · dados B3
      </div>
    </div>
  </div>

  <MoleculesEmbedPlaygroundShell
    v-else
    breadcrumb="Mapa de Calor"
    hero-title="Mapa de Calor da Bolsa"
    hero-description="Treemap colorido mostrando o desempenho de cada ativo do índice escolhido: Ibovespa, IFIX (FIIs) ou Small Caps. Verde = em alta, vermelho = em baixa. Visual poderoso pra newsletters e posts diários."
    eyebrow-suffix="TREEMAP B3"
  >
      <div class="grid gap-8 md:grid-cols-5">
        <div class="flex flex-col gap-5 md:col-span-2">
          <h2 class="text-xl font-semibold" :style="{ color: brand.colors.text }">Customizar</h2>
          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-400">Índice</label>
            <div class="grid grid-cols-3 gap-2">
              <button v-for="k in (['ibovespa', 'ifix', 'smll'] as const)" :key="k" type="button" class="rounded-lg border px-3 py-2 text-xs transition" :class="indice === k ? 'border-secondary bg-secondary/10 text-secondary' : 'border-white/10 text-gray-400'" @click="indice = k">
                {{ indiceLabels[k] }}
              </button>
            </div>
          </div>
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
          <div class="flex min-h-[540px] items-center justify-center rounded-2xl border p-4" :style="{ borderColor: brand.colors.border, backgroundColor: theme === 'light' ? '#f9fafb' : brand.colors.background }">
            <iframe :src="embedUrl" width="800" height="500" frameborder="0" loading="lazy" title="Mapa de calor" style="border:0;border-radius:12px;max-width:100%;" />
          </div>
        </div>
      </div>
  </MoleculesEmbedPlaygroundShell>
</template>

<style scoped>
.embed-widget { font-family: system-ui, -apple-system, sans-serif; }
</style>

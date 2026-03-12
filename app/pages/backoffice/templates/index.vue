<template>
  <NuxtLayout name="default" title="Templates Instagram">
    <div class="p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl" :class="[brand.font.headingWeight]" :style="{ color: brand.colors.text }">
          Templates Instagram
        </h1>
        <p class="mt-1 text-sm" :style="{ color: brand.colors.textMuted }">
          Visualize e gere imagens para redes sociais por tenant
        </p>
      </div>

      <!-- Tenant Selector -->
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium" :style="{ color: brand.colors.textMuted }">Tenant:</span>
        <button
          v-for="t in tenants"
          :key="t.id"
          class="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition"
          :style="{
            borderColor: selectedTenant?.id === t.id ? 'var(--ui-secondary)' : brand.colors.border,
            backgroundColor: selectedTenant?.id === t.id ? 'var(--ui-secondary)' : brand.colors.surface,
            color: selectedTenant?.id === t.id ? '#fff' : brand.colors.text,
          }"
          @click="selectTenant(t)"
        >
          <span
            class="h-3 w-3 rounded-full"
            :style="{ backgroundColor: t.config?.colors?.primary || '#888' }"
          />
          {{ t.name }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <UIcon name="i-lucide-loader-2" class="size-6 animate-spin" :style="{ color: brand.colors.textMuted }" />
      </div>

      <!-- No Tenant Selected -->
      <div v-else-if="!selectedTenant" class="flex flex-col items-center justify-center py-16 text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl" :style="{ backgroundColor: brand.colors.surface }">
          <UIcon name="i-lucide-image" class="size-8" :style="{ color: brand.colors.textMuted }" />
        </div>
        <p class="mt-5 font-medium" :style="{ color: brand.colors.text }">Selecione um tenant</p>
        <p class="mt-1 text-sm" :style="{ color: brand.colors.textMuted }">
          Escolha um tenant acima para visualizar os templates
        </p>
      </div>

      <!-- Templates Grid -->
      <div v-else class="flex flex-col gap-8">
        <!-- Template: Market Updates -->
        <div class="brand-card border p-6" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <UIcon name="i-lucide-bell" class="size-5 text-secondary" />
              </div>
              <div>
                <h2 class="font-semibold" :style="{ color: brand.colors.text }">Market Updates</h2>
                <p class="text-xs" :style="{ color: brand.colors.textMuted }">
                  Notificação de mercado com IA — quadrado, feed ou story
                </p>
              </div>
            </div>
          </div>

          <!-- Format Selector -->
          <div class="mb-4 flex gap-2">
            <button
              v-for="fmt in marketFormats"
              :key="fmt.value"
              class="rounded-lg border px-3 py-1.5 text-xs font-medium transition"
              :style="{
                borderColor: marketFormat === fmt.value ? 'var(--ui-secondary)' : brand.colors.border,
                backgroundColor: marketFormat === fmt.value ? 'var(--ui-secondary)' : 'transparent',
                color: marketFormat === fmt.value ? '#fff' : brand.colors.textMuted,
              }"
              @click="marketFormat = fmt.value"
            >
              {{ fmt.label }}
            </button>
          </div>

          <!-- Editable Params -->
          <div class="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label class="mb-1 block text-xs font-medium" :style="{ color: brand.colors.textMuted }">Titulo notificação</label>
              <input
                v-model="marketParams.notifTitle"
                class="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium" :style="{ color: brand.colors.textMuted }">Horário</label>
              <input
                v-model="marketParams.notifTime"
                class="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="mb-1 block text-xs font-medium" :style="{ color: brand.colors.textMuted }">Mensagem</label>
              <input
                v-model="marketParams.notifMessage"
                class="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium" :style="{ color: brand.colors.textMuted }">Headline 1</label>
              <input
                v-model="marketParams.headline1"
                class="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium" :style="{ color: brand.colors.textMuted }">Headline 2</label>
              <input
                v-model="marketParams.headline2"
                class="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium" :style="{ color: brand.colors.textMuted }">Destaque</label>
              <input
                v-model="marketParams.highlight"
                class="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium" :style="{ color: brand.colors.textMuted }">Cor destaque</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="marketParams.accent"
                  type="color"
                  class="h-9 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <input
                  v-model="marketParams.accent"
                  class="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
                />
              </div>
            </div>
          </div>

          <!-- Preview + URL -->
          <div class="flex flex-col gap-4 lg:flex-row">
            <div class="flex-1">
              <div
                class="relative overflow-hidden rounded-lg border"
                :style="{
                  borderColor: brand.colors.border,
                  aspectRatio: marketAspect,
                  maxHeight: '400px',
                }"
              >
                <iframe
                  :key="marketUrl"
                  :src="marketUrl"
                  class="h-full w-full"
                  :style="{ transform: `scale(${marketScale})`, transformOrigin: 'top left', width: `${100 / marketScale}%`, height: `${100 / marketScale}%` }"
                  frameborder="0"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2 lg:w-80">
              <label class="text-xs font-medium" :style="{ color: brand.colors.textMuted }">URL de renderização</label>
              <div class="flex gap-2">
                <input
                  :value="marketUrl"
                  readonly
                  class="w-full truncate rounded-lg border px-3 py-2 text-xs font-mono outline-none"
                  :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
                  @click="($event.target as HTMLInputElement).select()"
                />
                <button
                  class="shrink-0 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-white transition hover:opacity-90"
                  @click="copyUrl(marketUrl)"
                >
                  <UIcon name="i-lucide-copy" class="size-4" />
                </button>
              </div>
              <a
                :href="marketUrl"
                target="_blank"
                class="mt-1 flex items-center gap-1 text-xs text-secondary hover:underline"
              >
                <UIcon name="i-lucide-external-link" class="size-3" />
                Abrir em nova aba (tamanho real)
              </a>
            </div>
          </div>
        </div>

        <!-- Template: Ranking -->
        <div class="brand-card border p-6" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <UIcon name="i-lucide-trophy" class="size-5 text-secondary" />
              </div>
              <div>
                <h2 class="font-semibold" :style="{ color: brand.colors.text }">Ranking de Ações</h2>
                <p class="text-xs" :style="{ color: brand.colors.textMuted }">
                  Maiores altas e baixas do dia — 1080×1080
                </p>
              </div>
            </div>
          </div>

          <!-- Side Selector -->
          <div class="mb-4 flex gap-2">
            <button
              v-for="s in rankingSides"
              :key="s.value"
              class="rounded-lg border px-3 py-1.5 text-xs font-medium transition"
              :style="{
                borderColor: rankingSide === s.value ? 'var(--ui-secondary)' : brand.colors.border,
                backgroundColor: rankingSide === s.value ? 'var(--ui-secondary)' : 'transparent',
                color: rankingSide === s.value ? '#fff' : brand.colors.textMuted,
              }"
              @click="rankingSide = s.value"
            >
              {{ s.label }}
            </button>
          </div>

          <!-- Editable Params -->
          <div class="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label class="mb-1 block text-xs font-medium" :style="{ color: brand.colors.textMuted }">Titulo</label>
              <input
                v-model="rankingParams.title"
                class="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium" :style="{ color: brand.colors.textMuted }">Label (data)</label>
              <input
                v-model="rankingParams.label"
                class="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium" :style="{ color: brand.colors.textMuted }">Limite</label>
              <input
                v-model.number="rankingParams.limit"
                type="number"
                min="1"
                max="20"
                class="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium" :style="{ color: brand.colors.textMuted }">Volume min.</label>
              <input
                v-model.number="rankingParams.volume"
                type="number"
                class="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
              />
            </div>
          </div>

          <!-- Preview + URL -->
          <div class="flex flex-col gap-4 lg:flex-row">
            <div class="flex-1">
              <div
                class="relative overflow-hidden rounded-lg border"
                :style="{ borderColor: brand.colors.border, aspectRatio: '1 / 1', maxHeight: '400px' }"
              >
                <iframe
                  :key="rankingUrl"
                  :src="rankingUrl"
                  class="h-full w-full"
                  :style="{ transform: 'scale(0.37)', transformOrigin: 'top left', width: '270%', height: '270%' }"
                  frameborder="0"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2 lg:w-80">
              <label class="text-xs font-medium" :style="{ color: brand.colors.textMuted }">URL de renderização</label>
              <div class="flex gap-2">
                <input
                  :value="rankingUrl"
                  readonly
                  class="w-full truncate rounded-lg border px-3 py-2 text-xs font-mono outline-none"
                  :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
                  @click="($event.target as HTMLInputElement).select()"
                />
                <button
                  class="shrink-0 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-white transition hover:opacity-90"
                  @click="copyUrl(rankingUrl)"
                >
                  <UIcon name="i-lucide-copy" class="size-4" />
                </button>
              </div>
              <a
                :href="rankingUrl"
                target="_blank"
                class="mt-1 flex items-center gap-1 text-xs text-secondary hover:underline"
              >
                <UIcon name="i-lucide-external-link" class="size-3" />
                Abrir em nova aba (tamanho real)
              </a>

              <!-- Both sides quick links -->
              <div class="mt-3 flex flex-col gap-1">
                <span class="text-xs font-medium" :style="{ color: brand.colors.textMuted }">Links rápidos:</span>
                <a
                  :href="buildRankingUrl('top')"
                  target="_blank"
                  class="flex items-center gap-1.5 text-xs hover:underline"
                  :style="{ color: brand.colors.positive }"
                >
                  <UIcon name="i-lucide-trending-up" class="size-3" />
                  Altas do dia
                </a>
                <a
                  :href="buildRankingUrl('bottom')"
                  target="_blank"
                  class="flex items-center gap-1.5 text-xs hover:underline"
                  :style="{ color: brand.colors.negative }"
                >
                  <UIcon name="i-lucide-trending-down" class="size-3" />
                  Baixas do dia
                </a>
              </div>
            </div>
          </div>
        </div>
        <!-- Template: Asset Spotlight -->
        <div class="brand-card border p-6" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <UIcon name="i-lucide-star" class="size-5 text-secondary" />
              </div>
              <div>
                <h2 class="font-semibold" :style="{ color: brand.colors.text }">Destaque de Ativo</h2>
                <p class="text-xs" :style="{ color: brand.colors.textMuted }">
                  Card individual com preço, variação, P/L, DY e setor — dados reais da API
                </p>
              </div>
            </div>
          </div>

          <!-- Editable Params -->
          <div class="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label class="mb-1 block text-xs font-medium" :style="{ color: brand.colors.textMuted }">Ticker</label>
              <input
                v-model="spotlightParams.ticker"
                class="w-full rounded-lg border px-3 py-2 text-sm uppercase outline-none"
                placeholder="PETR4"
                :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
                @keydown.enter="refreshSpotlight"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium" :style="{ color: brand.colors.textMuted }">Subtitulo</label>
              <input
                v-model="spotlightParams.subtitle"
                class="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
              />
            </div>
            <div class="flex items-end">
              <button
                class="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                @click="refreshSpotlight"
              >
                <UIcon name="i-lucide-refresh-cw" class="size-4" />
                Atualizar preview
              </button>
            </div>
          </div>

          <!-- Preview + URL -->
          <div class="flex flex-col gap-4 lg:flex-row">
            <div class="flex-1">
              <div
                class="relative overflow-hidden rounded-lg border"
                :style="{ borderColor: brand.colors.border, aspectRatio: '1 / 1', maxHeight: '400px' }"
              >
                <iframe
                  :key="spotlightUrl + spotlightRefreshKey"
                  :src="spotlightUrl"
                  class="h-full w-full"
                  :style="{ transform: 'scale(0.37)', transformOrigin: 'top left', width: '270%', height: '270%' }"
                  frameborder="0"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2 lg:w-80">
              <label class="text-xs font-medium" :style="{ color: brand.colors.textMuted }">URL de renderização</label>
              <div class="flex gap-2">
                <input
                  :value="spotlightUrl"
                  readonly
                  class="w-full truncate rounded-lg border px-3 py-2 text-xs font-mono outline-none"
                  :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
                  @click="($event.target as HTMLInputElement).select()"
                />
                <button
                  class="shrink-0 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-white transition hover:opacity-90"
                  @click="copyUrl(spotlightUrl)"
                >
                  <UIcon name="i-lucide-copy" class="size-4" />
                </button>
              </div>
              <a
                :href="spotlightUrl"
                target="_blank"
                class="mt-1 flex items-center gap-1 text-xs text-secondary hover:underline"
              >
                <UIcon name="i-lucide-external-link" class="size-3" />
                Abrir em nova aba (tamanho real)
              </a>
              <p class="mt-2 text-xs" :style="{ color: brand.colors.textMuted }">
                Os dados (preço, P/L, DY, setor) são buscados em tempo real da API ao renderizar.
                Basta trocar o ticker na URL para gerar qualquer ativo.
              </p>
            </div>
          </div>
        </div>

        <!-- Template: Asset Compare -->
        <div class="brand-card border p-6" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <UIcon name="i-lucide-columns-2" class="size-5 text-secondary" />
              </div>
              <div>
                <h2 class="font-semibold" :style="{ color: brand.colors.text }">Comparativo de Ativos</h2>
                <p class="text-xs" :style="{ color: brand.colors.textMuted }">
                  Lado a lado com preço, variação, P/L, DY, P/VPA, ROE — dados reais da API
                </p>
              </div>
            </div>
          </div>

          <!-- Editable Params -->
          <div class="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label class="mb-1 block text-xs font-medium" :style="{ color: brand.colors.textMuted }">Ticker A</label>
              <input
                v-model="compareParams.tickerA"
                class="w-full rounded-lg border px-3 py-2 text-sm uppercase outline-none"
                placeholder="PETR4"
                :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
                @keydown.enter="refreshCompare"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium" :style="{ color: brand.colors.textMuted }">Ticker B</label>
              <input
                v-model="compareParams.tickerB"
                class="w-full rounded-lg border px-3 py-2 text-sm uppercase outline-none"
                placeholder="VALE3"
                :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
                @keydown.enter="refreshCompare"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium" :style="{ color: brand.colors.textMuted }">Subtitulo</label>
              <input
                v-model="compareParams.subtitle"
                class="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
              />
            </div>
            <div class="flex items-end">
              <button
                class="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                @click="refreshCompare"
              >
                <UIcon name="i-lucide-refresh-cw" class="size-4" />
                Atualizar
              </button>
            </div>
          </div>

          <!-- Preview + URL -->
          <div class="flex flex-col gap-4 lg:flex-row">
            <div class="flex-1">
              <div
                class="relative overflow-hidden rounded-lg border"
                :style="{ borderColor: brand.colors.border, aspectRatio: '1 / 1', maxHeight: '400px' }"
              >
                <iframe
                  :key="compareUrl + compareRefreshKey"
                  :src="compareUrl"
                  class="h-full w-full"
                  :style="{ transform: 'scale(0.37)', transformOrigin: 'top left', width: '270%', height: '270%' }"
                  frameborder="0"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2 lg:w-80">
              <label class="text-xs font-medium" :style="{ color: brand.colors.textMuted }">URL de renderização</label>
              <div class="flex gap-2">
                <input
                  :value="compareUrl"
                  readonly
                  class="w-full truncate rounded-lg border px-3 py-2 text-xs font-mono outline-none"
                  :style="{ borderColor: brand.colors.inputBorder, backgroundColor: brand.colors.inputBg, color: brand.colors.text }"
                  @click="($event.target as HTMLInputElement).select()"
                />
                <button
                  class="shrink-0 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-white transition hover:opacity-90"
                  @click="copyUrl(compareUrl)"
                >
                  <UIcon name="i-lucide-copy" class="size-4" />
                </button>
              </div>
              <a
                :href="compareUrl"
                target="_blank"
                class="mt-1 flex items-center gap-1 text-xs text-secondary hover:underline"
              >
                <UIcon name="i-lucide-external-link" class="size-3" />
                Abrir em nova aba (tamanho real)
              </a>
              <p class="mt-2 text-xs" :style="{ color: brand.colors.textMuted }">
                Indicadores com melhor resultado ganham um dot verde.
                P/L menor = melhor, DY e ROE maior = melhor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { ITenant } from '~/types/tenant'

definePageMeta({
  middleware: ['admin'],
})

const brand = useBrand()
const tenantsService = useTenantsService()
const toast = useToast()

// ==================== STATE ====================

const loading = ref(true)
const tenants = ref<ITenant[]>([])
const selectedTenant = ref<ITenant | null>(null)

// Market Updates
const marketFormats = [
  { value: 'square', label: 'Quadrado (1080×1080)' },
  { value: 'feed', label: 'Feed (1080×1350)' },
  { value: 'story', label: 'Story (1080×1920)' },
] as const

const marketFormat = ref<'square' | 'feed' | 'story'>('square')

const marketParams = reactive({
  notifTitle: 'Resumo do dia',
  notifTime: 'Agora',
  notifMessage: 'A PETR4 caiu 20% hoje, nesses preços o dividendo estimado é de 15% ao ano.',
  headline1: 'Receba updates do',
  headline2: 'mercado com IA',
  highlight: 'IA',
  accent: '#FFFFFF',
})

// Ranking
const rankingSides = [
  { value: 'top', label: 'Maiores Altas' },
  { value: 'bottom', label: 'Maiores Baixas' },
] as const

const rankingSide = ref<'top' | 'bottom'>('top')

const rankingParams = reactive({
  title: 'Maiores Altas e Baixas',
  label: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date()),
  limit: 6,
  volume: 1000000,
})

// ==================== COMPUTED ====================

const marketAspect = computed(() => {
  if (marketFormat.value === 'feed') return '1080 / 1350'
  if (marketFormat.value === 'story') return '1080 / 1920'
  return '1 / 1'
})

const marketScale = computed(() => {
  if (marketFormat.value === 'story') return 0.21
  if (marketFormat.value === 'feed') return 0.3
  return 0.37
})

const marketUrl = computed(() => {
  if (!selectedTenant.value) return ''
  const base = `/render/market-updates`
  const params = new URLSearchParams({
    brand: selectedTenant.value.slug,
    format: marketFormat.value,
    notifTitle: marketParams.notifTitle,
    notifTime: marketParams.notifTime,
    notifMessage: marketParams.notifMessage,
    headline1: marketParams.headline1,
    headline2: marketParams.headline2,
    highlight: marketParams.highlight,
    accent: marketParams.accent,
  })
  return `${base}?${params.toString()}`
})

const rankingUrl = computed(() => buildRankingUrl(rankingSide.value))

// Asset Spotlight
const spotlightParams = reactive({
  ticker: 'PETR4',
  subtitle: 'Destaque do dia',
})
const spotlightRefreshKey = ref(0)

const spotlightUrl = computed(() => {
  if (!selectedTenant.value) return ''
  const params = new URLSearchParams({
    brand: selectedTenant.value.slug,
    ticker: spotlightParams.ticker.toUpperCase(),
    subtitle: spotlightParams.subtitle,
  })
  return `/render/asset-spotlight?${params.toString()}`
})

function refreshSpotlight() {
  spotlightRefreshKey.value++
}

// Asset Compare
const compareParams = reactive({
  tickerA: 'PETR4',
  tickerB: 'VALE3',
  subtitle: 'Comparativo',
})
const compareRefreshKey = ref(0)

const compareUrl = computed(() => {
  if (!selectedTenant.value) return ''
  const params = new URLSearchParams({
    brand: selectedTenant.value.slug,
    tickerA: compareParams.tickerA.toUpperCase(),
    tickerB: compareParams.tickerB.toUpperCase(),
    subtitle: compareParams.subtitle,
  })
  return `/render/asset-compare?${params.toString()}`
})

function refreshCompare() {
  compareRefreshKey.value++
}

// ==================== METHODS ====================

function buildRankingUrl(side: string) {
  if (!selectedTenant.value) return ''
  const params = new URLSearchParams({
    brand: selectedTenant.value.slug,
    title: rankingParams.title,
    label: rankingParams.label,
    limit: String(rankingParams.limit),
    volume: String(rankingParams.volume),
  })
  return `/render/ranking/${side}?${params.toString()}`
}

function selectTenant(t: ITenant) {
  selectedTenant.value = t
  // Update accent color from tenant primary
  if (t.config?.colors?.primary) {
    marketParams.accent = t.config.colors.primary
  }
}

async function copyUrl(url: string) {
  try {
    await navigator.clipboard.writeText(window.location.origin + url)
    toast.add({ title: 'URL copiada!', icon: 'i-lucide-check', timeout: 2000 })
  } catch {
    toast.add({ title: 'Erro ao copiar', icon: 'i-lucide-x', color: 'error', timeout: 2000 })
  }
}

// ==================== LIFECYCLE ====================

onMounted(async () => {
  try {
    const res = (await tenantsService.list()) as any
    const list: ITenant[] = res?.data ?? []
    tenants.value = list.filter(t => t.is_active)
    if (tenants.value.length > 0) {
      selectTenant(tenants.value[0])
    }
  } catch {
    toast.add({ title: 'Erro ao carregar tenants', icon: 'i-lucide-alert-triangle', color: 'error' })
  } finally {
    loading.value = false
  }
})
</script>

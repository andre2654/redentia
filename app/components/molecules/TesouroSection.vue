<template>
  <section class="border-b py-10" :style="{ borderColor: brand.colors.border }">
    <!-- Header terminal-styled -->
    <header class="mb-6 flex flex-col gap-1 px-4 md:px-0">
      <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
        [TESOURO.DIRETO]
      </span>
      <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
        Tesouro Direto
      </h2>
      <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
        &gt; TÍTULOS PÚBLICOS DO GOVERNO · ATUALIZAÇÃO DIÁRIA
      </p>
    </header>

    <!-- Indexer filter chips -->
    <div class="mb-4 flex items-center gap-px overflow-x-auto px-4 md:px-0" :style="{ backgroundColor: brand.colors.border }">
      <button
        v-for="chip in indexerChips"
        :key="chip.id"
        type="button"
        class="flex items-center gap-2 px-4 py-2 font-mono-tab text-[10px] uppercase tracking-[0.18em] transition-all"
        :style="{
          backgroundColor: activeIndexer === chip.id ? brand.colors.surface : brand.colors.background,
          color: activeIndexer === chip.id ? brand.colors.primary : brand.colors.textMuted,
          borderBottom: activeIndexer === chip.id ? `1px solid ${brand.colors.primary}` : '1px solid transparent',
        }"
        @click="activeIndexer = chip.id"
      >
        <span>{{ chip.label }}</span>
        <span class="tabular-nums" :style="{ color: activeIndexer === chip.id ? brand.colors.text : brand.colors.textMuted }">
          {{ chip.count }}
        </span>
      </button>
    </div>

    <!-- Grid of titles -->
    <div v-if="isLoading" class="grid gap-px border md:grid-cols-2 lg:grid-cols-3" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }">
      <div v-for="i in 6" :key="`sk-${i}`" class="p-5" :style="{ backgroundColor: brand.colors.surface }">
        <USkeleton class="h-20 w-full" />
      </div>
    </div>

    <div
      v-else
      class="grid gap-px border md:grid-cols-2 lg:grid-cols-3"
      :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }"
    >
      <NuxtLink
        v-for="item in visibleItems"
        :key="item.slug"
        :to="`/tesouro/${item.slug}`"
        class="group flex flex-col gap-3 px-5 py-4 transition-colors"
        :style="{ backgroundColor: brand.colors.surface }"
      >
        <!-- Header row: badge + maturity -->
        <div class="flex items-center justify-between">
          <span
            class="font-mono-tab text-[9px] uppercase tracking-[0.2em] px-1.5 py-0.5"
            :style="{
              color: indexerColor(item.indexer),
              border: `1px solid ${indexerColor(item.indexer)}40`,
            }"
          >
            {{ indexerBadge(item.indexer) }}
          </span>
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em] tabular-nums" :style="{ color: brand.colors.textMuted }">
            VENC · {{ formatMaturity(item.maturity_date) }}
          </span>
        </div>

        <!-- Title name -->
        <h3 class="font-semibold leading-tight" :style="{ color: brand.colors.text }">
          {{ prettyName(item.name) }}
        </h3>

        <!-- Rate (big highlight) -->
        <div class="flex items-end justify-between gap-4">
          <div class="flex flex-col">
            <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">
              TAXA
            </span>
            <span class="font-mono-tab text-lg font-bold tabular-nums" :style="{ color: brand.colors.primary }">
              {{ formatRate(item) }}
            </span>
          </div>
          <div class="flex flex-col items-end">
            <span class="font-mono-tab text-[9px] uppercase tracking-[0.15em]" :style="{ color: brand.colors.textMuted }">
              COMPRA
            </span>
            <span class="font-mono-tab text-sm font-bold tabular-nums" :style="{ color: brand.colors.text }">
              {{ formatMoney(item.price_buy) }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Show more button when truncated -->
    <div v-if="!isLoading && filteredItems.length > limit" class="mt-4 flex justify-center">
      <button
        type="button"
        class="flex items-center gap-2 border px-5 py-2 font-mono-tab text-[10px] uppercase tracking-[0.2em] transition-opacity hover:opacity-75"
        :style="{ borderColor: brand.colors.primary, color: brand.colors.primary }"
        @click="expanded = !expanded"
      >
        {{ expanded ? '&gt; MOSTRAR MENOS' : `&gt; VER TODOS OS ${filteredItems.length} TÍTULOS` }}
        <UIcon :name="expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="h-3 w-3" />
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { indexerBadge, useTesouroService, type TesouroItem } from '~/services/tesouro'

const brand = useBrand()
const activeIndexer = ref<'all' | 'IPCA' | 'SELIC' | 'PREFIXADO' | 'IGPM'>('all')
const expanded = ref(false)
const limit = 6

const { listTesouros } = useTesouroService()

const items = ref<TesouroItem[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    items.value = await listTesouros()
  } catch {
    items.value = []
  } finally {
    isLoading.value = false
  }
})

const indexerChips = computed(() => {
  const all = items.value ?? []
  const countBy = (frag: string) =>
    all.filter((i) => i.indexer?.toLowerCase().includes(frag.toLowerCase())).length
  return [
    { id: 'all' as const, label: 'TUDO', count: all.length },
    { id: 'IPCA' as const, label: 'IPCA+', count: countBy('ipca') },
    { id: 'SELIC' as const, label: 'SELIC', count: countBy('selic') },
    { id: 'PREFIXADO' as const, label: 'PRÉ', count: countBy('prefixado') },
    { id: 'IGPM' as const, label: 'IGPM+', count: countBy('igpm') },
  ]
})

const filteredItems = computed(() => {
  const all = items.value ?? []
  if (activeIndexer.value === 'all') return all
  const token = activeIndexer.value.toLowerCase()
  return all.filter((i) => i.indexer?.toLowerCase().includes(token))
})

const visibleItems = computed(() => {
  return expanded.value ? filteredItems.value : filteredItems.value.slice(0, limit)
})

function prettyName(raw: string): string {
  return raw.replace('Tesouro ', '').replace(/\s+\|.*$/, '')
}

function indexerColor(indexer: string | null): string {
  const b = indexerBadge(indexer)
  if (b === 'IPCA+') return brand.colors.primary
  if (b === 'SELIC') return brand.colors.positive
  if (b === 'PRÉ') return brand.colors.text
  if (b === 'IGPM+') return brand.colors.textMuted
  return brand.colors.textMuted
}

function formatRate(item: TesouroItem): string {
  if (!item.rate) return '-'
  return item.rate
    .replace('IPCA +', 'IPCA+')
    .replace('IGPM +', 'IGPM+')
    .replace(/SELIC\s*\+\s*/, 'SELIC+')
    .replace(/\s+/g, ' ')
    .replace(',', ',') + '%'
}

function formatMoney(v: number | null): string {
  if (v === null) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(v)
}

function formatMaturity(iso: string | null): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return iso
  }
}
</script>

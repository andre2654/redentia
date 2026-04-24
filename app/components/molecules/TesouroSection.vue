<template>
  <section class="border-b py-10" :style="{ borderColor: brand.colors.border }">
    <!-- Header terminal-styled -->
    <header class="mb-6 flex flex-col gap-1 px-4 md:px-0">
      <span class="font-mono-tab text-[10px] uppercase tracking-[0.2em]" :style="{ color: brand.colors.primary }">
        Tesouro Direto
      </span>
      <h2 class="text-xl font-semibold md:text-2xl" :style="{ color: brand.colors.text }">
        Tesouro Direto
      </h2>
      <p class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: brand.colors.textMuted }">
        &gt; TÍTULOS PÚBLICOS DO GOVERNO · ATUALIZAÇÃO DIÁRIA
      </p>
    </header>

    <!-- Loading state -->
    <div v-if="isLoading" class="grid gap-px border md:grid-cols-2 lg:grid-cols-4" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.border }">
      <div v-for="i in 4" :key="`sk-${i}`" class="p-5" :style="{ backgroundColor: brand.colors.surface }">
        <USkeleton class="h-48 w-full" />
      </div>
    </div>

    <!-- Carousel: 1 col mobile / 3 md / 4 xl (same pattern as ranking) -->
    <UCarousel
      v-else
      v-slot="{ item }"
      class="w-full"
      loop
      :items="indexerSlides"
      :ui="{ item: 'basis-1/1 md:basis-1/3 xl:basis-1/4', container: 'bg-transparent' }"
    >
      <div class="flex w-full flex-col gap-2 px-2 py-4">
        <!-- Header: badge + category name + VIEW ALL -->
        <div class="mb-3 flex items-center justify-between border-b pb-2" :style="{ borderColor: brand.colors.border }">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-landmark" class="h-3 w-3" :style="{ color: item.color }" />
            <div class="flex flex-col">
              <span class="font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: item.color }">
                TD {{ item.key }}
              </span>
              <h3 class="font-mono-tab text-[11px] font-semibold uppercase tracking-wider" :style="{ color: brand.colors.text }">
                {{ item.label }} / {{ item.title }}
              </h3>
            </div>
          </div>
          <NuxtLink
            :to="{ path: '/search', query: item.query }"
            class="flex items-center gap-1 font-mono-tab text-[10px] uppercase tracking-[0.12em] transition-colors hover:opacity-80"
            :style="{ color: brand.colors.textMuted }"
          >
            VIEW ALL
            <UIcon name="i-lucide-arrow-right" class="h-3 w-3" />
          </NuxtLink>
        </div>

        <!-- Vertical list of 5 titles -->
        <div class="flex flex-col">
          <NuxtLink
            v-for="title in item.items.slice(0, 5)"
            :key="title.slug"
            :to="`/tesouro/${title.slug}`"
            class="group flex items-center justify-between gap-3 border-b py-2.5 transition-colors"
            :style="{ borderColor: brand.colors.border }"
            @mouseenter="$event.currentTarget.style.backgroundColor = brand.colors.textMuted + '0D'"
            @mouseleave="$event.currentTarget.style.backgroundColor = 'transparent'"
          >
            <div class="flex min-w-0 flex-1 flex-col">
              <span class="truncate text-sm font-medium" :style="{ color: brand.colors.text }">
                {{ prettyName(title.name) }}
              </span>
              <span class="font-mono-tab text-[10px] uppercase tracking-wider tabular-nums" :style="{ color: brand.colors.textMuted }">
                VENC · {{ formatMaturity(title.maturity_date) }}
              </span>
            </div>
            <div class="flex flex-shrink-0 flex-col items-end">
              <span class="font-mono-tab text-sm font-bold tabular-nums" :style="{ color: brand.colors.primary }">
                {{ formatRate(title) }}
              </span>
              <span class="font-mono-tab text-[10px] tabular-nums" :style="{ color: brand.colors.textMuted }">
                {{ formatMoney(title.price_buy) }}
              </span>
            </div>
          </NuxtLink>

          <!-- Empty state -->
          <div
            v-if="!item.items.length"
            class="py-6 text-center font-mono-tab text-[10px] uppercase tracking-wider"
            :style="{ color: brand.colors.textMuted }"
          >
            &gt; Sem títulos
          </div>
        </div>
      </div>
    </UCarousel>
  </section>
</template>

<script setup lang="ts">
import { indexerBadge, useTesouroService, type TesouroItem } from '~/services/tesouro'

const brand = useBrand()
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

const indexerSlides = computed(() => {
  const all = items.value ?? []
  const by = (frag: string) => all.filter((i) => i.indexer?.toLowerCase().includes(frag.toLowerCase()))
  return [
    { key: 'IPCA', label: 'IPCA+', title: 'Indexados à inflação', color: brand.colors.primary, items: by('ipca'), query: { indexer: 'IPCA' } },
    { key: 'SELIC', label: 'SELIC', title: 'Pós-fixados', color: brand.colors.positive, items: by('selic'), query: { indexer: 'SELIC' } },
    { key: 'PREFIXADO', label: 'PRÉ', title: 'Taxa fixa', color: brand.colors.text, items: by('prefixado'), query: { indexer: 'PREFIXADO' } },
    { key: 'IGPM', label: 'IGPM+', title: 'Indexados ao IGPM', color: brand.colors.textMuted, items: by('igpm'), query: { indexer: 'IGPM' } },
  ]
})

function prettyName(raw: string): string {
  return raw.replace('Tesouro ', '').replace(/\s+\|.*$/, '')
}

function formatRate(item: TesouroItem): string {
  if (!item.rate) return '-'
  return item.rate
    .replace('IPCA +', 'IPCA+')
    .replace('IGPM +', 'IGPM+')
    .replace(/SELIC\s*\+\s*/, 'SELIC+')
    .replace(/\s+/g, ' ') + '%'
}

function formatMoney(v: number | null): string {
  if (v === null) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(v)
}

function formatMaturity(iso: string | null): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' })
  } catch {
    return iso
  }
}
</script>

<template>
  <section class="pt-12 md:pt-16">
    <!-- Header quiet -->
    <header class="mb-8 flex flex-col gap-2 px-4 md:px-0">
      <span class="eyebrow">Renda fixa pública</span>
      <h2 class="font-light leading-tight text-[28px] md:text-[36px]" style="color: var(--text-heading); letter-spacing: -0.025em;">
        Tesouro Direto
      </h2>
      <p class="text-[14px] leading-relaxed" style="color: var(--text-body);">
        Títulos públicos do governo, atualização diária.
      </p>
    </header>

    <!-- Loading state -->
    <div v-if="isLoading" class="grid gap-px overflow-hidden rounded-lg border md:grid-cols-2 lg:grid-cols-4" style="border-color: var(--border-subtle); background-color: var(--border-subtle);">
      <div v-for="i in 4" :key="`sk-${i}`" class="p-5" style="background-color: var(--bg-elevated);">
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
      <div class="flex w-full flex-col gap-3 px-2 py-4">
        <!-- Header quiet: eyebrow inline + h3 normal + ver todos link -->
        <div class="mb-2 flex items-end justify-between border-b pb-3" style="border-color: var(--border-subtle);">
          <div class="flex flex-col gap-1">
            <span class="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em]" :style="{ color: item.color }">
              <UIcon name="i-lucide-landmark" class="h-3 w-3" />
              TD {{ item.key }}
            </span>
            <h3 class="text-[15px] font-medium leading-tight" style="color: var(--text-heading);">
              {{ item.label }}
            </h3>
          </div>
          <NuxtLink
            :to="{ path: '/search', query: item.query }"
            class="inline-flex items-center gap-1 text-[12px] font-medium transition-colors hover:underline"
            style="color: var(--brand-primary);"
          >
            Ver todos
            <UIcon name="i-lucide-arrow-right" class="h-3 w-3" />
          </NuxtLink>
        </div>

        <!-- Vertical list of 5 titles. Linhas com border subtle, hover bg-overlay. -->
        <div class="flex flex-col">
          <NuxtLink
            v-for="title in item.items.slice(0, 5)"
            :key="title.slug"
            :to="`/tesouro/${title.slug}`"
            class="group flex items-center justify-between gap-3 border-b py-2.5 transition-colors"
            style="border-color: var(--border-subtle);"
            @mouseenter="(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-overlay)')"
            @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')"
          >
            <div class="flex min-w-0 flex-1 flex-col">
              <span class="truncate text-[14px] font-medium" style="color: var(--text-heading);">
                {{ prettyName(title.name) }}
              </span>
              <span class="text-[11px] tabular-nums" style="color: var(--text-muted);">
                Venc {{ formatMaturity(title.maturity_date) }}
              </span>
            </div>
            <div class="flex flex-shrink-0 flex-col items-end">
              <span class="text-[14px] font-light tabular-nums" style="color: var(--brand-primary); letter-spacing: -0.01em;">
                {{ formatRate(title) }}
              </span>
              <span class="text-[11px] tabular-nums" style="color: var(--text-muted);">
                {{ formatMoney(title.price_buy) }}
              </span>
            </div>
          </NuxtLink>

          <!-- Empty state -->
          <div
            v-if="!item.items.length"
            class="py-6 text-center text-[12px]"
            style="color: var(--text-muted);"
          >
            Sem títulos disponíveis
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

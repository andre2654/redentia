<template>
  <NuxtLayout name="static" title="Calendário de Dividendos">
    <section class="flex flex-col gap-8 px-6 py-8">
      <!-- Hero -->
      <div class="flex flex-col gap-3">
        <NuxtLink
          to="/dividendos"
          class="flex items-center gap-1 text-xs transition hover:opacity-80"
          :style="{ color: brand.colors.textMuted }"
        >
          <UIcon name="i-lucide-chevron-left" class="size-3" />
          Dividendos
        </NuxtLink>
        <div class="flex items-center gap-3">
          <div
            class="flex size-12 items-center justify-center rounded-xl"
            :style="{ backgroundColor: brand.colors.primary + '22' }"
          >
            <UIcon
              name="i-lucide-calendar-days"
              class="size-6"
              :style="{ color: brand.colors.primary }"
            />
          </div>
          <div>
            <p
              class="text-[10px] font-medium uppercase tracking-[0.15em]"
              :style="{ color: brand.colors.textMuted }"
            >
              Calendário
            </p>
            <h1 class="text-3xl font-bold md:text-4xl">Próximos Dividendos</h1>
          </div>
        </div>
        <p class="max-w-2xl text-base" :style="{ color: brand.colors.textMuted }">
          Todos os próximos pagamentos de dividendos, juros sobre capital
          próprio e rendimentos anunciados pelas empresas listadas na B3.
          Atualizado diariamente.
        </p>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3">
        <div
          class="inline-flex gap-1 rounded-xl border p-1"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <button
            v-for="opt in rangeOptions"
            :key="opt.value"
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition"
            :style="{
              backgroundColor: days === opt.value ? brand.colors.primary : 'transparent',
              color: days === opt.value ? readableOn(brand.colors.primary) : brand.colors.textMuted,
            }"
            @click="days = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>

        <div class="text-xs tabular-nums" :style="{ color: brand.colors.textMuted }">
          {{ totalItems }} {{ totalItems === 1 ? 'pagamento' : 'pagamentos' }}
          em {{ groups.length }} {{ groups.length === 1 ? 'dia' : 'dias' }}
        </div>
      </div>

      <!-- Calendar groups -->
      <div v-if="pending" class="flex items-center justify-center py-16">
        <UIcon name="i-lucide-loader" class="size-6 animate-spin" />
      </div>

      <div v-else-if="groups.length === 0" class="py-16 text-center">
        <p class="text-sm" :style="{ color: brand.colors.textMuted }">
          Nenhum dividendo anunciado para os próximos {{ days }} dias.
        </p>
      </div>

      <div v-else class="flex flex-col gap-4">
        <article
          v-for="group in groups"
          :key="group.date"
          class="overflow-hidden rounded-2xl border"
          :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
        >
          <!-- Date header -->
          <header
            class="flex items-baseline justify-between border-b px-5 py-3"
            :style="{ borderColor: brand.colors.border }"
          >
            <div class="flex items-baseline gap-3">
              <h2
                class="text-lg font-bold tabular-nums"
                :style="{ color: brand.colors.text }"
              >
                {{ formatDateLong(group.date) }}
              </h2>
              <span
                class="text-[10px] uppercase tracking-wider"
                :style="{ color: brand.colors.textMuted }"
              >
                {{ relativeLabel(group.date) }}
              </span>
            </div>
            <span
              class="text-xs tabular-nums"
              :style="{ color: brand.colors.textMuted }"
            >
              {{ group.count }} {{ group.count === 1 ? 'pagamento' : 'pagamentos' }}
            </span>
          </header>

          <!-- Items -->
          <ul>
            <li
              v-for="item in group.items"
              :key="`${item.ticker}-${item.label}`"
              class="border-b last:border-b-0"
              :style="{ borderColor: brand.colors.border }"
            >
              <NuxtLink
                :to="`/asset/${item.ticker.toLowerCase()}`"
                class="flex items-center gap-3 px-5 py-3 transition hover:bg-white/5"
              >
                <div
                  class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border"
                  :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.background }"
                >
                  <img
                    v-if="item.logo"
                    :src="item.logo"
                    :alt="item.name"
                    class="size-full object-cover"
                    loading="lazy"
                    @error="($event.target as HTMLImageElement).style.display='none'"
                  >
                  <span
                    v-else
                    class="text-[10px] font-bold"
                    :style="{ color: brand.colors.textMuted }"
                  >
                    {{ item.ticker.slice(0, 2) }}
                  </span>
                </div>
                <div class="flex min-w-0 flex-1 flex-col">
                  <div class="flex items-center gap-2">
                    <span
                      class="text-sm font-semibold"
                      :style="{ color: brand.colors.text }"
                    >
                      {{ item.ticker }}
                    </span>
                    <span
                      class="rounded px-1.5 py-0.5 text-[9px] font-medium uppercase"
                      :style="{
                        backgroundColor: labelColor(item.label) + '22',
                        color: labelColor(item.label),
                      }"
                    >
                      {{ item.label }}
                    </span>
                  </div>
                  <span
                    class="truncate text-[11px]"
                    :style="{ color: brand.colors.textMuted }"
                  >
                    {{ item.name }}
                  </span>
                </div>
                <div class="flex flex-col items-end gap-0.5">
                  <span
                    class="text-sm font-semibold tabular-nums"
                    :style="{ color: rateAccent }"
                  >
                    R$ {{ formatRate(item.rate) }}
                  </span>
                  <span
                    v-if="item.last_date_prior"
                    class="text-[10px] tabular-nums"
                    :style="{ color: brand.colors.textMuted }"
                  >
                    data-com {{ formatDateShort(item.last_date_prior) }}
                  </span>
                </div>
              </NuxtLink>
            </li>
          </ul>
        </article>
      </div>

      <!-- SEO content -->
      <article
        class="prose prose-invert mt-8 max-w-none border-t pt-8"
        :style="{ borderColor: brand.colors.border }"
      >
        <h2 class="text-2xl font-bold">Entendendo as datas</h2>
        <p class="leading-relaxed" :style="{ color: brand.colors.textMuted }">
          Ao receber dividendos, é importante entender três datas-chave:
        </p>
        <ul class="space-y-2" :style="{ color: brand.colors.textMuted }">
          <li>
            <strong>Data de aprovação:</strong> quando o conselho da empresa
            aprova o pagamento.
          </li>
          <li>
            <strong>Data-com (última data com direito):</strong> último dia
            útil em que é preciso ter as ações para receber o provento. Quem
            compra depois dessa data não recebe.
          </li>
          <li>
            <strong>Data de pagamento:</strong> quando o dinheiro efetivamente
            cai na conta do investidor.
          </li>
        </ul>
        <h3 class="text-xl font-semibold">Tipos de proventos</h3>
        <ul class="space-y-2" :style="{ color: brand.colors.textMuted }">
          <li>
            <strong>Dividendos:</strong> distribuição de lucros, isenta de IR
            para pessoa física.
          </li>
          <li>
            <strong>JCP (Juros sobre Capital Próprio):</strong> tributado em
            15% na fonte, mas vantajoso para a empresa.
          </li>
          <li>
            <strong>Rendimentos (FIIs):</strong> distribuição mensal dos
            fundos imobiliários, isentos de IR para PF.
          </li>
          <li>
            <strong>Bonificação:</strong> distribuição de novas ações aos
            acionistas existentes.
          </li>
        </ul>
      </article>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

import { dividendAccent, readableOn } from '~/utils/color'

const brand = useBrand()
const service = useAssetsService()

const rateAccent = computed(() =>
  dividendAccent(brand.colors.primary, brand.colors.negative, brand.colors.positive)
)

useSeoMeta({
  title: 'Calendário de Dividendos da Bolsa | Redentia',
  description:
    'Acompanhe todos os próximos pagamentos de dividendos, JCP e rendimentos das empresas listadas na B3. Calendário atualizado diariamente.',
  ogTitle: 'Calendário de Dividendos da Bolsa Brasileira',
  ogDescription:
    'Todos os próximos dividendos, JCP e rendimentos anunciados pelas empresas da B3.',
})

const rangeOptions = [
  { label: '30 dias', value: 30 },
  { label: '60 dias', value: 60 },
  { label: '90 dias', value: 90 },
]

const days = ref(60)

interface DividendGroup {
  date: string
  count: number
  items: Array<{
    ticker: string
    name: string
    logo: string | null
    type: string
    label: string
    rate: number
    payment_date: string
    last_date_prior: string | null
  }>
}

const { data: groups, pending } = await useAsyncData<DividendGroup[]>(
  'dividends-upcoming',
  async () => {
    const data = await service.getUpcomingDividends(days.value, 300)
    return (data as DividendGroup[]) || []
  },
  { watch: [days], default: () => [] }
)

const totalItems = computed(() =>
  (groups.value || []).reduce((sum, g) => sum + g.count, 0)
)

// ---------- Formatting helpers ----------

function formatDateLong(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d
      .toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'long',
      })
      .replace('.', '')
      .replace(/^./, (c) => c.toUpperCase())
  } catch {
    return dateStr
  }
}

function formatDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  } catch {
    return dateStr
  }
}

function relativeLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00')
    const now = new Date()
    const diffDays = Math.round(
      (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays <= 0) return 'hoje'
    if (diffDays === 1) return 'amanhã'
    if (diffDays < 7) return `em ${diffDays}d`
    if (diffDays < 30) return `em ${Math.floor(diffDays / 7)}sem`
    return `em ${Math.floor(diffDays / 30)}m`
  } catch {
    return ''
  }
}

function formatRate(value: number | string): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return '—'
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  })
}

function labelColor(label: string): string {
  const normalized = (label || '').toUpperCase()
  if (normalized.includes('JCP') || normalized.includes('JUROS')) {
    return brand.colors.warning || '#f59e0b'
  }
  if (normalized.includes('BONIF')) {
    return brand.colors.secondary
  }
  return rateAccent.value
}
</script>

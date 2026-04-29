<!--
  /dividendos/calendario — Big calendar view for upcoming + recent
  dividend payments.

  Surface: month grid (7 × 5-6) with one cell per day. Each cell shows
  the dividend payments scheduled (up to 3 ticker chips visible, "+N"
  truncation badge for the rest). Clicking a day opens a drawer with
  the full list for that date.

  Auth-aware layout: signed-in users get the platform shell (sidebar);
  visitors get the static marketing layout (SEO surface).

  Data: pulls /api/dividends/upcoming + /api/dividends/recent at the
  full 180-day window each, then buckets the results into a Map keyed
  by ISO date so the grid lookup per cell is O(1).
-->
<template>
  <NuxtLayout :name="layoutName" title="Calendário de Dividendos">
    <section class="flex flex-col gap-6 px-6 py-8">
      <!-- ============ Hero ============ -->
      <div class="flex flex-col gap-3">
        <NuxtLink
          v-if="layoutName === 'static'"
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
            <h1
              class="font-light"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(28px, 4vw, 36px)',
                lineHeight: 1.05,
                letterSpacing: '-1px',
              }"
            >Próximos Dividendos</h1>
          </div>
        </div>
        <p class="max-w-2xl text-base" :style="{ color: brand.colors.textMuted }">
          Todos os próximos pagamentos de dividendos, juros sobre capital
          próprio e rendimentos anunciados pelas empresas listadas na B3.
          Atualizado diariamente.
        </p>
      </div>

      <!-- ============ Month nav ============ -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="cal-nav-btn"
            :style="navBtnStyle"
            aria-label="Mês anterior"
            @click="goPrev"
          >
            <UIcon name="i-lucide-chevron-left" class="size-4" />
          </button>
          <h2
            class="min-w-[180px] text-xl font-medium tabular-nums"
            :style="{ color: brand.colors.text, letterSpacing: '-0.01em' }"
          >
            {{ monthLabel }}
          </h2>
          <button
            type="button"
            class="cal-nav-btn"
            :style="navBtnStyle"
            aria-label="Próximo mês"
            @click="goNext"
          >
            <UIcon name="i-lucide-chevron-right" class="size-4" />
          </button>
          <button
            v-if="!isCurrentMonth"
            type="button"
            class="ml-2 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-[background-color,border-color,color]"
            :style="{
              backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
              borderColor: `color-mix(in srgb, ${brand.colors.primary} 40%, transparent)`,
              color: brand.colors.primary,
            }"
            title="Voltar para o mês atual"
            aria-label="Voltar para o mês atual"
            @click="goToday"
          >
            <UIcon name="i-lucide-rotate-ccw" class="size-3.5" />
            <span>Voltar pra hoje</span>
          </button>
        </div>

        <div class="flex items-center gap-3 text-xs" :style="{ color: brand.colors.textMuted }">
          <span class="inline-flex items-center gap-1.5">
            <span class="size-2 rounded-full" :style="{ backgroundColor: rateAccent }" />
            Pagamento
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="size-2 rounded-full" :style="{ backgroundColor: brand.colors.warning || '#f59e0b' }" />
            JCP
          </span>
          <span class="font-medium tabular-nums" :style="{ color: brand.colors.text }">
            {{ monthCount }} {{ monthCount === 1 ? 'pagamento' : 'pagamentos' }}
          </span>
        </div>
      </div>

      <!-- ============ Calendar grid ============ -->
      <div
        class="overflow-hidden rounded-2xl border"
        :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }"
      >
        <!-- Weekday header -->
        <div
          class="grid grid-cols-7 border-b"
          :style="{
            borderColor: brand.colors.border,
            backgroundColor: `color-mix(in srgb, ${brand.colors.border} 18%, ${brand.colors.surface})`,
          }"
        >
          <div
            v-for="d in weekdayLabels"
            :key="d"
            class="px-2 py-2 text-center font-mono-tab text-[10px] font-medium uppercase tracking-[0.16em]"
            :style="{ color: brand.colors.textMuted }"
          >{{ d }}</div>
        </div>

        <!-- Loading skeleton -->
        <div v-if="pending" class="grid grid-cols-7">
          <div
            v-for="n in 35"
            :key="n"
            class="cal-cell-skeleton border-b border-r"
            :style="{ borderColor: brand.colors.border }"
          />
        </div>

        <!-- Days grid -->
        <div v-else class="grid grid-cols-7">
          <button
            v-for="cell in calendarCells"
            :key="cell.iso"
            type="button"
            class="cal-cell relative flex min-h-[110px] flex-col items-stretch gap-1 border-b border-r p-2 text-left transition-[background-color]"
            :class="[
              cell.inMonth ? '' : 'cal-cell-out',
              cell.isToday ? 'cal-cell-today' : '',
              cell.items.length === 0 ? 'cal-cell-empty' : 'cal-cell-has',
            ]"
            :style="{
              borderColor: brand.colors.border,
              backgroundColor: cell.isToday
                ? `color-mix(in srgb, ${brand.colors.primary} 7%, transparent)`
                : 'transparent',
            }"
            :disabled="cell.items.length === 0"
            @click="openDay(cell)"
          >
            <!-- Date number row -->
            <div class="flex items-center justify-between">
              <span
                class="font-mono-tab text-[12px] font-semibold tabular-nums"
                :style="{
                  color: cell.isToday
                    ? brand.colors.primary
                    : cell.inMonth
                      ? brand.colors.text
                      : `color-mix(in srgb, ${brand.colors.text} 30%, transparent)`,
                }"
              >{{ cell.day }}</span>
              <span
                v-if="cell.items.length > 0"
                class="rounded-full px-1.5 py-0.5 font-mono-tab text-[9px] font-medium tabular-nums"
                :style="{
                  backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`,
                  color: brand.colors.primary,
                }"
              >{{ cell.items.length }}</span>
            </div>

            <!-- Ticker chips: up to 3 visible -->
            <div v-if="cell.items.length > 0" class="flex flex-col gap-0.5">
              <div
                v-for="item in cell.items.slice(0, 3)"
                :key="`${item.ticker}-${item.label}`"
                class="flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10.5px]"
                :style="{
                  backgroundColor: `color-mix(in srgb, ${labelColor(item.label)} 12%, transparent)`,
                  color: cell.inMonth
                    ? brand.colors.text
                    : `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
                }"
              >
                <span
                  class="size-1.5 shrink-0 rounded-full"
                  :style="{ backgroundColor: labelColor(item.label) }"
                />
                <span class="truncate font-medium">{{ item.ticker }}</span>
              </div>
              <div
                v-if="cell.items.length > 3"
                class="px-1 font-mono-tab text-[10px]"
                :style="{ color: brand.colors.textMuted }"
              >+{{ cell.items.length - 3 }} mais</div>
            </div>
          </button>
        </div>
      </div>

      <!-- ============ Empty hint when month is empty ============ -->
      <p
        v-if="!pending && monthCount === 0"
        class="text-center text-sm"
        :style="{ color: brand.colors.textMuted }"
      >
        Nenhum pagamento de dividendos para {{ monthLabel.toLowerCase() }}.
      </p>

      <!-- ============ Editorial copy (Stripe-style) ============
           Two sections: "Entendendo as datas" (3-card grid, primary
           reading) and "Tipos de proventos" (definition list, glossary).
           Typography follows the stripe-style skin: weight 300 on the
           section heading, eyebrow with mono tabular + 0.18em tracking,
           body 18px line-height 1.5, no prose-default styles.
      -->
      <div
        class="mt-8 flex flex-col gap-14 border-t pt-12"
        :style="{ borderColor: `color-mix(in srgb, ${brand.colors.border} 60%, transparent)` }"
      >
        <!-- Section A: Entendendo as datas -->
        <section class="flex flex-col gap-8">
          <header class="flex max-w-2xl flex-col gap-3">
            <span
              class="font-mono-tab text-[11px] font-medium uppercase"
              :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
            >Documentação</span>
            <h2
              class="font-light"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(28px, 4vw, 36px)',
                lineHeight: 1.1,
                letterSpacing: '-0.7px',
              }"
            >Entendendo as datas</h2>
            <p
              class="max-w-2xl"
              :style="{
                fontSize: '17px',
                lineHeight: 1.55,
                color: `color-mix(in srgb, ${brand.colors.text} 72%, transparent)`,
              }"
            >Três datas comandam o fluxo de qualquer provento: a aprovação no conselho, a data-com (último pregão pra garantir o direito) e a data de pagamento. Entender a sequência é o que separa quem recebe de quem perde por um dia.</p>
          </header>

          <!-- Date cards: 3-up on desktop, stacked on mobile -->
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <article
              v-for="(d, idx) in dateInfo"
              :key="d.key"
              class="flex flex-col gap-3 rounded-xl border p-5 transition-[border-color,background-color]"
              :style="{
                backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 60%, transparent)`,
                borderColor: `color-mix(in srgb, ${brand.colors.border} 55%, transparent)`,
                boxShadow: `0 1px 0 0 color-mix(in srgb, ${brand.colors.border} 30%, transparent) inset`,
              }"
            >
              <div class="flex items-center gap-2">
                <span
                  class="size-1.5 rounded-full"
                  :style="{ backgroundColor: d.dot }"
                />
                <span
                  class="font-mono-tab text-[10.5px] font-medium uppercase tabular-nums"
                  :style="{
                    letterSpacing: '0.18em',
                    color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)`,
                  }"
                >0{{ idx + 1 }} · {{ d.eyebrow }}</span>
              </div>
              <h3
                class="text-[18px] font-medium"
                :style="{
                  color: brand.colors.text,
                  lineHeight: 1.25,
                  letterSpacing: '-0.22px',
                }"
              >{{ d.title }}</h3>
              <p
                class="text-[14px]"
                :style="{
                  lineHeight: 1.55,
                  color: `color-mix(in srgb, ${brand.colors.text} 68%, transparent)`,
                }"
              >{{ d.body }}</p>
            </article>
          </div>
        </section>

        <!-- Section B: Tipos de proventos (glossary) -->
        <section class="flex flex-col gap-6">
          <header class="flex max-w-2xl flex-col gap-2">
            <span
              class="font-mono-tab text-[11px] font-medium uppercase"
              :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
            >Glossário</span>
            <h2
              class="font-light"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(22px, 3vw, 26px)',
                lineHeight: 1.2,
                letterSpacing: '-0.4px',
              }"
            >Tipos de proventos</h2>
          </header>

          <dl
            class="flex flex-col divide-y"
            :style="{
              ['--tw-divide-opacity' as string]: 1,
              borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
            }"
          >
            <div
              v-for="t in proventoTypes"
              :key="t.key"
              class="grid grid-cols-1 gap-1.5 py-4 md:grid-cols-[220px_1fr] md:gap-8 md:py-5"
              :style="{
                borderColor: `color-mix(in srgb, ${brand.colors.border} 40%, transparent)`,
              }"
            >
              <dt
                class="flex items-baseline gap-2"
                :style="{ color: brand.colors.text }"
              >
                <span
                  class="size-1 shrink-0 rounded-full"
                  :style="{ backgroundColor: brand.colors.primary }"
                />
                <span
                  class="text-[14.5px] font-medium"
                  :style="{ letterSpacing: '-0.005em' }"
                >{{ t.term }}</span>
              </dt>
              <dd
                class="text-[15px]"
                :style="{
                  lineHeight: 1.55,
                  color: `color-mix(in srgb, ${brand.colors.text} 72%, transparent)`,
                }"
              >{{ t.def }}</dd>
            </div>
          </dl>
        </section>
      </div>
    </section>

    <!-- ============ Day drawer (modal) ============ -->
    <Teleport to="body">
      <Transition name="cal-drawer">
        <div
          v-if="openCell"
          class="fixed inset-0 z-50 flex items-end justify-center md:items-center"
          @click="openCell = null"
        >
          <div
            class="absolute inset-0"
            style="background-color: rgba(0,0,0,0.55); backdrop-filter: blur(2px);"
          />
          <div
            class="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border md:rounded-2xl"
            :style="{
              backgroundColor: brand.colors.surface,
              borderColor: brand.colors.border,
              boxShadow: `0 30px 80px -20px rgba(0,0,0,0.5), 0 12px 30px -12px color-mix(in srgb, ${brand.colors.primary} 22%, transparent)`,
            }"
            @click.stop
          >
            <!-- Drawer header -->
            <header
              class="flex items-baseline justify-between gap-3 border-b px-5 py-4"
              :style="{ borderColor: brand.colors.border }"
            >
              <div class="flex flex-col">
                <span
                  class="font-mono-tab text-[10px] font-medium uppercase tracking-[0.18em]"
                  :style="{ color: brand.colors.textMuted }"
                >Pagamentos do dia</span>
                <h3
                  class="mt-0.5 text-xl font-medium"
                  :style="{ color: brand.colors.text, letterSpacing: '-0.01em' }"
                >{{ formatDateLong(openCell.iso) }}</h3>
              </div>
              <button
                type="button"
                class="flex size-8 items-center justify-center rounded-md transition-[background-color]"
                :style="{
                  color: `color-mix(in srgb, ${brand.colors.text} 60%, transparent)`,
                }"
                aria-label="Fechar"
                @click="openCell = null"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </header>

            <!-- Drawer body -->
            <ul class="flex-1 overflow-y-auto">
              <li
                v-for="item in openCell.items"
                :key="`${item.ticker}-${item.label}`"
                class="border-b last:border-b-0"
                :style="{ borderColor: brand.colors.border }"
              >
                <NuxtLink
                  :to="`/asset/${item.ticker.toLowerCase()}`"
                  class="flex items-center gap-3 px-5 py-3 transition hover:bg-white/5"
                  @click="openCell = null"
                >
                  <div
                    class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border"
                    :style="{
                      borderColor: brand.colors.border,
                      backgroundColor: brand.colors.background,
                    }"
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
                    >{{ item.ticker.slice(0, 2) }}</span>
                  </div>
                  <div class="flex min-w-0 flex-1 flex-col">
                    <div class="flex items-center gap-2">
                      <span
                        class="text-sm font-semibold"
                        :style="{ color: brand.colors.text }"
                      >{{ item.ticker }}</span>
                      <span
                        class="rounded px-1.5 py-0.5 text-[9px] font-medium uppercase"
                        :style="{
                          backgroundColor: labelColor(item.label) + '22',
                          color: labelColor(item.label),
                        }"
                      >{{ item.label }}</span>
                    </div>
                    <span
                      class="truncate text-[11px]"
                      :style="{ color: brand.colors.textMuted }"
                    >{{ item.name }}</span>
                  </div>
                  <div class="flex flex-col items-end gap-0.5">
                    <span
                      class="text-sm font-semibold tabular-nums"
                      :style="{ color: rateAccent }"
                    >R$ {{ formatRate(item.rate) }}</span>
                    <span
                      v-if="item.last_date_prior"
                      class="font-mono-tab text-[10px] tabular-nums"
                      :style="{ color: brand.colors.textMuted }"
                    >data-com {{ formatDateShort(item.last_date_prior) }}</span>
                  </div>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </Teleport>
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
const authStore = useAuthStore()

// Auth-aware layout: authenticated users keep the platform shell
// (sidebar with quick actions, market strip, etc.) so the calendar
// reads as part of the app. Unauthenticated visitors get the
// `static` marketing layout, where the calendar doubles as a SEO/
// lead-capture surface.
const layoutName = computed(() =>
  authStore.isAuthenticated ? 'default' : 'static'
)

const rateAccent = computed(() =>
  dividendAccent(brand.colors.primary, brand.colors.negative, brand.colors.positive),
)

usePageSeo({
  title: 'Calendário de Dividendos da Bolsa | Redentia',
  description:
    'Acompanhe todos os próximos pagamentos de dividendos, JCP e rendimentos das empresas listadas na B3. Calendário visual atualizado diariamente.',
  path: '/dividendos/calendario',
  breadcrumbs: [
    { name: 'Início', path: '/' },
    { name: 'Dividendos', path: '/dividendos' },
    { name: 'Calendário', path: '/dividendos/calendario' },
  ],
})

interface DividendItem {
  ticker: string
  name: string
  logo: string | null
  type: string
  label: string
  rate: number
  payment_date: string
  last_date_prior: string | null
}

interface DividendGroup {
  date: string
  count: number
  items: DividendItem[]
}

interface CalendarCell {
  iso: string
  day: number
  inMonth: boolean
  isToday: boolean
  items: DividendItem[]
}

// ---------- Date helpers ----------

function isoOf(d: Date): string {
  // YYYY-MM-DD in local TZ — matches the API's payment_date field,
  // which is also a date-only ISO string.
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)
const TODAY_ISO = isoOf(TODAY)

const cursor = ref(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1))

const monthLabel = computed(() =>
  cursor.value
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^./, (c) => c.toUpperCase()),
)

const isCurrentMonth = computed(() =>
  cursor.value.getFullYear() === TODAY.getFullYear()
  && cursor.value.getMonth() === TODAY.getMonth(),
)

function goPrev() {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() - 1, 1)
}
function goNext() {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + 1, 1)
}
function goToday() {
  cursor.value = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)
}

// ---------- Data fetching ----------

// Fetch upcoming + recent at the API's max window (180d each side).
// Both calls go through the same useAsyncData so SSR + hydration are
// well-behaved. Each returns a list of date-grouped buckets.
const { data: upcomingGroups, pending: pendingUpcoming } = await useAsyncData<DividendGroup[]>(
  'dividends-upcoming-180',
  async () => {
    const data = await service.getUpcomingDividends(180, 500)
    return (data as DividendGroup[]) || []
  },
  { default: () => [] },
)
const { data: recentGroups, pending: pendingRecent } = await useAsyncData<DividendGroup[]>(
  'dividends-recent-180',
  async () => {
    const data = await service.getRecentDividends(180, 500)
    return (data as DividendGroup[]) || []
  },
  { default: () => [] },
)

const pending = computed(() => pendingUpcoming.value || pendingRecent.value)

// Single Map<iso-date, items[]> for O(1) lookup per calendar cell.
const dateMap = computed(() => {
  const map = new Map<string, DividendItem[]>()
  const merge = (groups: DividendGroup[] | null) => {
    for (const g of groups || []) {
      const existing = map.get(g.date)
      if (existing) {
        existing.push(...g.items)
      } else {
        map.set(g.date, [...g.items])
      }
    }
  }
  merge(upcomingGroups.value)
  merge(recentGroups.value)
  return map
})

// ---------- Calendar grid ----------

// Brazil starts the week on Sunday — same as JS getDay() === 0.
const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// Build the 7-col grid: pad the start with leading days from the
// previous month so the first row begins on Sunday, then fill until
// the last day of the cursor month, then pad the tail with trailing
// days from the next month so the grid is rectangular (5 or 6 rows
// of 7 cols each).
const calendarCells = computed<CalendarCell[]>(() => {
  const year = cursor.value.getFullYear()
  const month = cursor.value.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const lastOfMonth = new Date(year, month + 1, 0)

  // Leading pad: days from previous month to fill up to Sunday.
  const lead = firstOfMonth.getDay() // 0 (Sun) .. 6 (Sat)
  const start = new Date(firstOfMonth)
  start.setDate(start.getDate() - lead)

  // Trailing pad: enough days to make total cells a multiple of 7,
  // and ensure at least 6 weeks for visual stability when the month
  // happens to fit in 5.
  const totalSoFar = lead + lastOfMonth.getDate()
  const totalRows = Math.ceil(totalSoFar / 7)
  const totalCells = Math.max(35, totalRows * 7)

  const cells: CalendarCell[] = []
  const lookup = dateMap.value
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const iso = isoOf(d)
    cells.push({
      iso,
      day: d.getDate(),
      inMonth: d.getMonth() === month,
      isToday: iso === TODAY_ISO,
      items: lookup.get(iso) || [],
    })
  }
  return cells
})

const monthCount = computed(() =>
  calendarCells.value
    .filter((c) => c.inMonth)
    .reduce((sum, c) => sum + c.items.length, 0),
)

// ---------- Drawer ----------

const openCell = ref<CalendarCell | null>(null)
function openDay(cell: CalendarCell) {
  if (cell.items.length === 0) return
  openCell.value = cell
}

// ESC closes the drawer.
onMounted(() => {
  if (!import.meta.client) return
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') openCell.value = null
  }
  window.addEventListener('keydown', onKey)
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
})

// ---------- Style helpers ----------

const navBtnStyle = computed(() => ({
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 60%, transparent)`,
  color: brand.colors.text,
}))

// ---------- Formatting helpers ----------

function formatDateLong(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d
      .toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
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

function formatRate(value: number | string): string {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num)) return '-'
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

// ---------- Editorial copy data ----------
// Pulled out of the template so the JSX stays readable. Each entry
// keeps its own dot color so the cards read as a sequence (calm
// muted → primary amber → positive green = "money lands").

const dateInfo = computed(() => [
  {
    key: 'aprovacao',
    eyebrow: 'Aprovação',
    title: 'Data de aprovação',
    body: 'Quando o conselho da empresa aprova o pagamento. É o ponto zero — sem essa decisão, nada começa a contar.',
    dot: `color-mix(in srgb, ${brand.colors.text} 35%, transparent)`,
  },
  {
    key: 'datacom',
    eyebrow: 'Data-com',
    title: 'Última data com direito',
    body: 'Último dia útil em que é preciso ter as ações pra receber o provento. Quem compra a partir do dia seguinte fica de fora.',
    dot: brand.colors.primary,
  },
  {
    key: 'pagamento',
    eyebrow: 'Pagamento',
    title: 'Data de pagamento',
    body: 'Quando o dinheiro efetivamente cai na conta do investidor. Pode levar de dias a semanas após a data-com.',
    dot: brand.colors.positive,
  },
])

const proventoTypes = [
  {
    key: 'div',
    term: 'Dividendos',
    def: 'Distribuição de lucros aos acionistas. Isenta de imposto de renda para pessoa física.',
  },
  {
    key: 'jcp',
    term: 'JCP — Juros sobre Capital Próprio',
    def: 'Tributado em 15% na fonte, mas vantajoso pra empresa por ser dedutível do imposto sobre lucros.',
  },
  {
    key: 'rend',
    term: 'Rendimentos (FIIs)',
    def: 'Distribuição mensal dos fundos imobiliários. Isentos de IR para pessoa física, com regras específicas de elegibilidade.',
  },
  {
    key: 'bonif',
    term: 'Bonificação',
    def: 'Distribuição de novas ações aos acionistas existentes, em vez de pagamento em dinheiro. Não muda o valor patrimonial.',
  },
] as const
</script>

<style scoped>
/* ============ Month nav buttons ============ */
.cal-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: background-color 140ms ease-out;
}
.cal-nav-btn:hover {
  background-color: color-mix(in srgb, var(--brand-text) 7%, transparent);
}

/* ============ Calendar cells ============ */
.cal-cell:not(:disabled) {
  cursor: pointer;
}
.cal-cell:not(:disabled):hover {
  background-color: color-mix(in srgb, var(--brand-primary) 5%, transparent) !important;
}
.cal-cell-out {
  background-color: color-mix(in srgb, var(--brand-border) 8%, transparent);
}
.cal-cell-skeleton {
  min-height: 110px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    color-mix(in srgb, var(--brand-text) 4%, transparent) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: cal-shimmer 1.4s linear infinite;
}
@keyframes cal-shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}

/* Cells in the last column / last visible row don't need an extra
   border to avoid double lines on the container's bottom/right. */
.cal-cell:nth-child(7n),
.cal-cell-skeleton:nth-child(7n) {
  border-right: 0;
}

/* ============ Drawer transition ============ */
.cal-drawer-enter-active,
.cal-drawer-leave-active {
  transition: opacity 200ms ease-out;
}
.cal-drawer-enter-from,
.cal-drawer-leave-to {
  opacity: 0;
}
.cal-drawer-enter-active > div:last-child,
.cal-drawer-leave-active > div:last-child {
  transition: transform 220ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.cal-drawer-enter-from > div:last-child,
.cal-drawer-leave-to > div:last-child {
  transform: translateY(40px);
}

@media (prefers-reduced-motion: reduce) {
  .cal-cell-skeleton { animation: none; }
  .cal-drawer-enter-active > div:last-child,
  .cal-drawer-leave-active > div:last-child {
    transition: none;
  }
}
</style>

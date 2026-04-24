<template>
  <section class="px-6 py-12 md:py-16">
    <div class="mx-auto max-w-4xl">
      <!-- Header -->
      <div class="mb-10 text-center">
        <h2 class="mb-2 text-2xl md:text-3xl" :class="[brand.font.headingWeight, brand.font.headingStyle]" :style="{ color: brand.colors.text }">
          {{ config.sectionTitle }}
        </h2>
        <p class="text-sm md:text-base" :style="{ color: brand.colors.textMuted }">
          {{ config.sectionSubtitle }}
        </p>
      </div>

      <div class="grid gap-8 md:grid-cols-2">
        <!-- Left: Sliders -->
        <div class="flex flex-col gap-6">
          <!-- Age slider -->
          <div>
            <div class="mb-2 flex items-center justify-between">
              <label class="text-sm font-medium" :style="{ color: brand.colors.textMuted }">{{ config.labels.ageSlider }}</label>
              <span class="text-lg font-bold" :style="{ color: brand.colors.primary }">{{ startAge }} anos</span>
            </div>
            <input
              v-model.number="startAge"
              type="range"
              :min="16"
              :max="50"
              :step="1"
              :aria-label="config.labels.ageSlider"
              :aria-valuetext="`${startAge} anos`"
              class="slider w-full"
            />
            <div class="mt-1 flex justify-between text-xs" :style="{ color: brand.colors.textMuted }">
              <span>16</span>
              <span>50</span>
            </div>
          </div>

          <!-- Monthly slider -->
          <div>
            <div class="mb-2 flex items-center justify-between">
              <label class="text-sm font-medium" :style="{ color: brand.colors.textMuted }">{{ config.labels.monthlySlider }}</label>
              <span class="text-lg font-bold" :style="{ color: brand.colors.primary }">{{ formatCurrency(monthlyAmount) }}</span>
            </div>
            <input
              v-model.number="monthlyAmount"
              type="range"
              :min="100"
              :max="10000"
              :step="100"
              :aria-label="config.labels.monthlySlider"
              :aria-valuetext="formatCurrency(monthlyAmount)"
              class="slider w-full"
            />
            <div class="mt-1 flex justify-between text-xs" :style="{ color: brand.colors.textMuted }">
              <span>R$ 100</span>
              <span>R$ 10.000</span>
            </div>
          </div>

          <!-- CTA -->
          <UButton
            :to="config.ctaLink"
            color="secondary"
            size="lg"
            icon="i-lucide-calculator"
            class="mt-2 w-full transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:scale-[1.02]"
          >
            {{ config.ctaText }}
          </UButton>
        </div>

        <!-- Right: Results -->
        <div class="flex flex-col gap-4">
          <!-- Main result -->
          <div class="border p-6 brand-card" :style="{ borderColor: brand.colors.border, backgroundColor: brand.colors.surface }">
            <p class="mb-1 text-xs uppercase tracking-wider" :style="{ color: brand.colors.textMuted }">
              {{ resultLabel }}
            </p>
            <p class="text-3xl md:text-4xl" :class="brand.font.headingWeight" :style="{ color: brand.colors.primary }">
              {{ formatCurrency(mainResult) }}
            </p>
            <p class="mt-2 text-sm" :style="{ color: brand.colors.textMuted }">
              {{ yearsInvesting }} {{ config.labels.timeLabel }}
            </p>
          </div>

          <!-- Comparison -->
          <div class="border p-5 brand-card" :style="{ borderColor: `${brand.colors.negative}33`, backgroundColor: `${brand.colors.negative}0D` }">
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-clock" class="mt-0.5 h-5 w-5 shrink-0" :style="{ color: brand.colors.negative }" />
              <div>
                <p class="text-sm font-semibold" :style="{ color: brand.colors.text }">
                  {{ comparisonLabel }}
                </p>
                <p class="mt-1 text-xs" :style="{ color: brand.colors.textMuted }">
                  {{ formatCurrency(comparisonResult) }} vs {{ formatCurrency(mainResult) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Bar comparison visual -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-3">
              <span class="w-20 text-right text-xs font-medium" :style="{ color: brand.colors.text }">{{ startAge }} anos</span>
              <div class="h-6 brand-card-sm transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-500" :style="{ width: '100%', backgroundColor: brand.colors.primary }" />
            </div>
            <div class="flex items-center gap-3">
              <span class="w-20 text-right text-xs font-medium" :style="{ color: brand.colors.textMuted }">{{ config.compareAge }} anos</span>
              <div class="h-6 brand-card-sm transition-[transform,opacity,box-shadow,background-color,border-color,filter] duration-500" :style="{ width: comparisonBarWidth, backgroundColor: brand.colors.negative }" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const brand = useBrand()

const config = computed(() => brand.wealthCalculator!)

const startAge = ref(config.value.defaultAge)
const monthlyAmount = ref(config.value.defaultMonthly)

function futureValue(monthly: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 12
  const months = years * 12
  if (monthlyRate === 0) return monthly * months
  return monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
}

const yearsInvesting = computed(() => config.value.targetAge - startAge.value)
const yearsComparison = computed(() => config.value.targetAge - config.value.compareAge)

const mainResult = computed(() =>
  futureValue(monthlyAmount.value, config.value.annualRate, yearsInvesting.value)
)

const comparisonResult = computed(() =>
  futureValue(monthlyAmount.value, config.value.annualRate, yearsComparison.value)
)

const difference = computed(() => mainResult.value - comparisonResult.value)

const comparisonBarWidth = computed(() => {
  if (mainResult.value === 0) return '0%'
  const pct = Math.max(5, (comparisonResult.value / mainResult.value) * 100)
  return `${pct}%`
})

const resultLabel = computed(() =>
  config.value.labels.resultPrefix.replace('{target}', String(config.value.targetAge))
)

const comparisonLabel = computed(() =>
  config.value.labels.comparisonText
    .replace('{age}', String(config.value.compareAge))
    .replace('{diff}', formatNumber(difference.value))
)

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}
</script>

<style scoped>
.slider {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: var(--brand-border);
  cursor: pointer;
}

.slider:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 4px;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--brand-primary);
  cursor: pointer;
  box-shadow: 0 2px 8px rgb(var(--brand-overlay) / 0.2);
  transition: transform 150ms;
}

.slider:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgb(var(--brand-overlay) / 0.4), 0 2px 8px rgb(var(--brand-overlay) / 0.2);
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--brand-primary);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgb(var(--brand-overlay) / 0.2);
}
</style>

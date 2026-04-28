<template>
  <div class="relative flex min-w-0 items-center gap-3 overflow-hidden">
    <div
      id="carousel-tickercarousel"
      class="relative min-w-0 flex-1 overflow-hidden"
    >
      <div
        ref="carousel"
        class="flex max-w-full items-stretch whitespace-nowrap will-change-transform"
        :style="{ transform: `translateX(${position}px)` }"
      >
        <NuxtLink
          v-for="(item, index) in repeatedItems"
          :key="index"
          :to="`/asset/${item?.ticker?.toLowerCase?.() || item?.ticker || ''}`"
          :class="['relative flex items-center gap-3 border-l first:border-l-0', big ? 'px-8 py-3' : 'px-6 py-2']"
          :style="{ borderColor: 'var(--border-subtle)' }"
        >
          <!-- Logo grande, ocupa as duas linhas a esquerda -->
          <img
            v-if="!isPlaceholderLogo(item.logo) && !failedLogos.isFailed(item.logo)"
            :src="item.logo"
            :alt="item?.ticker ? `Logo do ativo ${item.ticker}` : 'Logo do ativo'"
            :class="['shrink-0 select-none rounded object-cover', big ? 'h-10 w-10' : 'h-8 w-8']"
            @error="failedLogos.markFailed(item.logo)"
          />
          <div
            v-else
            :class="['flex shrink-0 items-center justify-center rounded border font-mono-tab font-bold', big ? 'h-10 w-10 text-[10px]' : 'h-8 w-8 text-[9px]']"
            :style="{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-overlay)' }"
          >
            {{ (item?.ticker || '').slice(0, 2) }}
          </div>

          <!-- Coluna direita: ticker em cima, preco + variacao embaixo -->
          <div class="flex flex-col justify-center gap-0.5">
            <span
              class="select-none font-medium leading-none"
              :class="big ? 'text-[15px]' : 'text-[13px]'"
              :style="{ color: 'var(--text-heading)' }"
            >{{ item.ticker }}</span>
            <div class="flex items-baseline gap-1.5 leading-none">
              <span
                v-if="item.price"
                class="select-none tabular-nums leading-none"
                :class="big ? 'text-[13px]' : 'text-[12px]'"
                :style="{ color: 'var(--text-body)' }"
              >{{ item.price }}</span>
              <span
                class="select-none tabular-nums font-medium leading-none"
                :class="big ? 'text-[13px]' : 'text-[12px]'"
                :style="{ color: changeColor(item.change) }"
              >{{ item.change }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <button
      v-if="!noControl"
      :aria-label="isPaused ? 'Tocar carrossel' : 'Pausar carrossel'"
      class="hover:opacity-100"
      @click="isPaused = !isPaused"
    >
      <IconPlay
        v-if="isPaused"
        :class="[big ? 'h-6 w-6' : 'h-4 w-4']"
        :style="{ fill: 'var(--brand-text)' }"
      />
      <IconPause v-else :class="[big ? 'h-6 w-6' : 'h-4 w-4']" :style="{ fill: 'var(--brand-text)' }" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const brand = useBrand()
const failedLogos = useFailedLogos()

interface CarouselItem {
  logo: string
  ticker: string
  change: string
  price?: string
}

const props = withDefaults(
  defineProps<{
    noControl?: boolean
    big?: boolean
    items?: CarouselItem[]
    fadeColor?: string
  }>(),
  {
    noControl: false,
    big: false,
    items: () => [],
    fadeColor: '',
  }
)

const fadeBg = computed(() => props.fadeColor || brand.colors.background)

// Cor da change% baseada no sinal: negativo -> brand.negative, positivo -> brand.positive,
// neutro/parse-fail -> muted.
function changeColor(value: string): string {
  const trimmed = (value || '').trim()
  if (!trimmed) return brand.colors.textMuted
  if (trimmed.startsWith('-')) return brand.colors.negative
  const parsed = parseFloat(trimmed.replace('%', '').replace(',', '.'))
  if (!Number.isFinite(parsed) || parsed === 0) return brand.colors.textMuted
  return brand.colors.positive
}

const { getTopStocks } = useAssetsService()

const fetchedItems = !props.items.length
  ? await useAsyncData<CarouselItem[]>('ticker-carousel-items', async () => {
      const data = await getTopStocks('top', 100000)
      return (Array.isArray(data) ? data : []).slice(0, 40).map((asset) => {
        const variation =
          typeof asset.change_percent === 'number'
            ? asset.change_percent
            : typeof asset.change === 'number'
              ? asset.change
              : Number(asset.change_percent ?? asset.change ?? 0) || 0

        const priceNum = Number(asset.market_price ?? asset.close ?? 0)
        const price = Number.isFinite(priceNum) && priceNum > 0
          ? `R$ ${priceNum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : ''

        return {
          logo: asset.logo || '/default-logo.png',
          ticker: asset.ticker,
          change: `${variation.toFixed(2)}%`,
          price,
        }
      })
    })
  : null

const isPaused = ref(false)

const items = ref<CarouselItem[]>(props.items.length ? props.items : [])

if (!items.value.length && fetchedItems?.data.value?.length) {
  items.value = fetchedItems.data.value
}

if (fetchedItems?.data) {
  watch(
    fetchedItems.data,
    (newItems) => {
      if (!props.items.length && newItems?.length) {
        items.value = newItems
      }
    },
    { immediate: true }
  )
}

watch(
  () => props.items,
  (newItems) => {
    if (newItems?.length) {
      items.value = newItems
    } else if (fetchedItems?.data.value?.length) {
      items.value = fetchedItems.data.value
    }
  },
  { deep: true }
)

const repeatedItems = computed(() => [...items.value])

const position = ref(0)
const speed = 0.5
const carousel = ref()
let animationFrame

const loop = () => {
  if (!isPaused.value) {
    position.value -= speed

    const carouselEl = carousel.value
    if (carouselEl) {
      const firstItem = carouselEl.children[0] as HTMLElement | undefined
      if (firstItem) {
        const firstItemWidth = firstItem.offsetWidth

        if (Math.abs(position.value) >= firstItemWidth) {
          position.value += firstItemWidth
          carouselEl.appendChild(firstItem)
        }
      }
    }
  }
  animationFrame = requestAnimationFrame(loop)
}

onMounted(() => {
  animationFrame = requestAnimationFrame(loop)
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrame)
})
</script>

<style scoped>
.will-change-transform {
  will-change: transform;
}

#carousel-tickercarousel {
  position: relative;
}

#carousel-tickercarousel::after {
  content: '';
  top: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  pointer-events: none;
}
</style>

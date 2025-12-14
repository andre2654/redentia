<template>
  <div class="relative flex min-w-0 items-center gap-3 overflow-hidden">
    <div
      id="carousel-tickercarousel"
      class="relative min-w-0 flex-1 overflow-hidden"
    >
      <div
        ref="carousel"
        class="flex max-w-full items-center whitespace-nowrap will-change-transform"
        :style="{ transform: `translateX(${position}px)` }"
      >
        <NuxtLink
          v-for="(item, index) in repeatedItems"
          :key="index"
          :to="`/asset/${item?.ticker?.toLowerCase?.() || item?.ticker || ''}`"
          :class="['flex items-center gap-2', big ? 'px-8 py-3' : 'px-6 py-2']"
        >
          <img
            :src="item.logo"
            :alt="item?.ticker ? `Logo do ativo ${item.ticker}` : 'Logo do ativo'"
            :class="[
              'select-none rounded object-cover',
              big ? 'h-10 w-10' : 'h-6 w-6',
            ]"
          />
          <span
            :class="[
              'select-none font-medium',
              big ? 'text-[20px]' : 'text-[14px]',
            ]"
            >{{ item.ticker }}</span
          >
          <span
            :class="[
              'font-regular text-primary select-none',
              big ? 'text-[16px]' : 'text-[12px]',
            ]"
            >{{ item.change }}</span
          >
        </NuxtLink>
      </div>
    </div>

    <button
      v-if="!noControl"
      class="hover:opacity-100"
      @click="isPaused = !isPaused"
    >
      <IconPlay
        v-if="isPaused"
        :class="[big ? 'h-6 w-6' : 'h-4 w-4', 'fill-white']"
      />
      <IconPause v-else :class="[big ? 'h-6 w-6' : 'h-4 w-4', 'fill-white']" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface CarouselItem {
  logo: string
  ticker: string
  change: string
}

const props = withDefaults(
  defineProps<{
    noControl?: boolean
    big?: boolean
    items?: CarouselItem[]
  }>(),
  {
    noControl: false,
    big: false,
    items: () => [],
  }
)

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

        return {
          logo: asset.logo || '/default-logo.png',
          ticker: asset.ticker,
          change: `${variation.toFixed(2)}%`,
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

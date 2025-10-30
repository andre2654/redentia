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
        <div
          v-for="(item, index) in repeatedItems"
          :key="index"
          :class="[
            'flex items-center gap-2',
            big ? 'px-8 py-3' : 'px-6 py-2'
          ]"
        >
          <img
            :src="item.logo"
            :class="[
              'pointer-events-none select-none rounded object-cover',
              big ? 'h-10 w-10' : 'h-6 w-6'
            ]"
          />
          <span 
            :class="[
              'select-none font-medium',
              big ? 'text-[20px]' : 'text-[14px]'
            ]"
          >{{
            item.ticker
          }}</span>
          <span 
            :class="[
              'font-regular text-primary select-none',
              big ? 'text-[16px]' : 'text-[12px]'
            ]"
          >{{
            item.change
          }}</span>
        </div>
      </div>
    </div>

    <button
      v-if="!noControl"
      class="hover:opacity-100"
      @click="isPaused = !isPaused"
    >
      <IconPlay v-if="isPaused" :class="[big ? 'h-6 w-6' : 'h-4 w-4', 'fill-white']" />
      <IconPause v-else :class="[big ? 'h-6 w-6' : 'h-4 w-4', 'fill-white']" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const { getTopStocks, getTopETFs, getTopReits, getTopBDRs } = useAssetsService()

defineProps({
  noControl: {
    type: Boolean,
    default: false,
  },
  big: {
    type: Boolean,
    default: false,
  },
})

const isPaused = ref(false)

const items = ref([])

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
      const firstItem = carouselEl.children[0]
      const firstItemWidth = firstItem.offsetWidth

      if (Math.abs(position.value) >= firstItemWidth) {
        position.value += firstItemWidth
        carouselEl.appendChild(firstItem)
      }
    }
  }
  animationFrame = requestAnimationFrame(loop)
}

onMounted(async () => {
  const data = await getTopStocks('top', 100000)
  items.value = data.map((asset) => ({
    logo: asset.logo || '/default-logo.png',
    ticker: asset.ticker,
    change: `${asset.change_percent.toFixed(2)}%`,
  }))
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
}
</style>

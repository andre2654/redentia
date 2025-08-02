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
          class="flex items-center gap-2 px-6 py-2"
        >
          <img
            :src="item.logo"
            class="pointer-events-none h-6 w-6 select-none rounded object-cover"
          />
          <span class="select-none text-[14px] font-medium text-white">{{
            item.ticker
          }}</span>
          <span class="font-regular select-none text-[12px] text-green-500">{{
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
      <IconPlay v-if="isPaused" class="h-4 w-4 fill-white" />
      <IconPause v-else class="h-4 w-4 fill-white" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineProps({
  noControl: {
    type: Boolean,
    default: false,
  },
})

const isPaused = ref(false)

const items = [
  {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/BB-logo1.jpg',
    ticker: 'BBAS3',
    change: '+21.01%',
  },
  {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/BB-logo1.jpg',
    ticker: 'BBAS3',
    change: '+21.01%',
  },
  {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/BB-logo1.jpg',
    ticker: 'BBAS3',
    change: '+21.01%',
  },
]

const repeatedItems = computed(() => [...items, ...items, ...items])

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
}
</style>

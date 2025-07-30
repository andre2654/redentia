<template>
  <div class="flex">
    <div class="flex flex-col">
      <div
        class="flex h-[60px] w-[60px] items-center justify-center bg-white text-black"
      >
        {{ stepNumber }}
      </div>
      <hr v-if="hasMore" class="ml-[28px] h-[200px] w-[1px] border-l" />
    </div>
    <hr class="mt-[28px] w-[100px]" />
    <div class="glass flex h-max max-w-[600px] flex-col gap-2 rounded-lg p-4">
      <div class="text-primary text-lg font-bold">
        {{ title }}
      </div>
      <div class="text-primary max-w-[90%]">
        {{ description }}
      </div>
      <button
        class="glass text-primary ml-auto mt-6 rounded-full px-3 py-1 text-sm"
      >
        Concluído
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stepNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  hasMore: {
    type: Boolean,
    default: false,
  },
})
</script>

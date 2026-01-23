<template>
  <NuxtLink
    active-class="bg-secondary/10 text-secondary border-secondary/30"
    class="group flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-left text-white/70 transition-all duration-200 hover:border-white/10 hover:bg-white/5 hover:text-white"
    :class="{
      'pointer-events-none cursor-not-allowed opacity-40': disabled,
      'ml-6 border-l border-white/10 rounded-l-none pl-4': isSubItem,
    }"
  >
    <UIcon
      v-if="icon"
      :name="icon"
      class="h-5 w-5 flex-shrink-0 opacity-60 transition-opacity group-hover:opacity-100"
    />
    <span class="flex-1">{{ text }}</span>
    <UIcon
      v-if="disabled"
      name="i-lucide-lock"
      class="h-3.5 w-3.5 opacity-40"
    />
  </NuxtLink>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  isSubItem: {
    type: Boolean,
    default: false,
  },
})
</script>

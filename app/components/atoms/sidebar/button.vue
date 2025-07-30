<template>
  <NuxtLink
    active-class="bg-primary/10 text-primary border-l-primary border-l-4 font-bold"
    class="px-6 py-3 text-left"
    :class="{
      'cursor-not-allowed opacity-50': disabled,
      'pl-14': isSubItem,
    }"
  >
    {{ text }}
  </NuxtLink>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true,
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

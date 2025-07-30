<template>
  <UButton
    type="submit"
    color="tertiary"
    variant="soft"
    :ui="{
      base: 'items-center justify-center bg-tertiary text-white',
    }"
    size="lg"
  >
    <slot />
  </UButton>
</template>

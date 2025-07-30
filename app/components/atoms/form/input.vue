<template>
  <UInput
    class="input"
    color="secondary"
    variant="soft"
    :ui="{
      base: 'bg-black border-gray-800 border',
      variants: {
        color: {
          secondary: ' text-gray-800',
        },
      },
    }"
    size="lg"
  />
</template>

<style scoped>
.input:deep(input:-webkit-autofill) {
  -webkit-box-shadow: 0 0 0 10px black inset;
  -webkit-text-fill-color: white;
  -webkit-background-clip: text;
}
</style>

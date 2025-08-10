<template>
  <UModal
    v-model:open="open"
    title="Selecione o tema que deseja utilizar"
    :ui="{ content: 'max-w-[650px]' }"
  >
    <template #body>
      <div class="flex justify-between gap-3 max-sm:flex-col">
        <div class="flex flex-col gap-2">
          <p class="font-bold">Tema claro (padrão)</p>
          <button
            class="relative rounded-lg border-4"
            :class="{ 'border-primary': color === 'light' }"
            @click="color = 'light'"
          >
            <div
              v-if="color === 'light'"
              class="bg-primary/20 absolute left-0 top-0 flex h-full w-full items-center justify-center"
            >
              <span
                class="bg-primary/30 rounded-full px-5 py-2 text-lg font-bold text-white backdrop-blur"
                >Selecionado</span
              >
            </div>
            <div
              v-else
              class="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/20"
            >
              <span
                class="rounded-full bg-black/30 px-5 py-2 text-lg font-bold text-white backdrop-blur"
                >Clique</span
              >
            </div>
            <img
              src="/assets/images/dark-mode.png"
              alt="Dark Mode"
              width="300"
            />
          </button>
        </div>
        <div class="flex flex-col gap-2">
          <p class="font-bold">Tema escuro</p>
          <button
            class="relative rounded-lg border-4"
            :class="{ 'border-primary': color === 'dark' }"
            @click="color = 'dark'"
          >
            <div
              v-if="color === 'dark'"
              class="bg-primary/20 absolute left-0 top-0 flex h-full w-full items-center justify-center"
            >
              <span
                class="bg-primary/30 rounded-full px-5 py-2 text-lg font-bold text-black backdrop-blur"
                >Selecionado</span
              >
            </div>
            <div
              v-else
              class="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/20"
            >
              <span
                class="rounded-full bg-black/30 px-5 py-2 text-lg font-bold text-white backdrop-blur"
                >Clique</span
              >
            </div>
            <img
              src="/assets/images/light-mode.png"
              alt="Light Mode"
              width="300"
            />
          </button>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const { setThemeAlreadySelected } = useInterfaceStore()

const open = ref(true)

const color = computed({
  get() {
    return colorMode.value
  },
  set(_color) {
    colorMode.preference = _color
    setThemeAlreadySelected(true)
  },
})
</script>

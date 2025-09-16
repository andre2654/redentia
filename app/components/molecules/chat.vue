<template>
  <div
    class="flex flex-col items-center justify-between gap-[100px] rounded-[30px]"
  >
    <div class="flex flex-col items-center justify-center gap-4 px-3 pt-[70px]">
      <h2 class="text-center text-2xl">Faça alguma pergunta</h2>
      <p class="text-center text-[13px] font-light opacity-60">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
        vulputate erat non massa tristique.
      </p>
      <div class="grid max-w-[800px] grid-cols-2 gap-3 md:grid-cols-3">
        <div v-for="(suggestion, idx) in suggestions" :key="idx" class="mb-2">
          <button
            class="glass flex h-[130px] items-center justify-center rounded-lg bg-gradient-to-t from-white/10 to-transparent p-3 text-[13px] font-medium hover:from-white/20"
            size="md"
            color="neutral"
            variant="soft"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>

    <!-- Chat content -->
    <div class="flex w-full flex-col gap-3">
      <div v-for="message in messages" :key="message.id">
        <AtomsChatMessage :message="message" />
      </div>
    </div>

    <div
      class="sticky bottom-0 flex w-full flex-col gap-3 rounded-b-[30px] bg-black/10 p-3 pb-6 backdrop-blur-[99px] dark:bg-white/10"
      v-bind="textareaContainerProps"
    >
      <UTextarea
        placeholder="Faça qualquer pesquisa..."
        size="md"
        rows="4"
        :ui="{
          base: 'text-[14px] max-h-[200px] bg-transparent ring-0 placeholder:text-black/40 dark:placeholder:text-white/40',
        }"
        autoresize
      />

      <AtomsButton
        class="ml-auto h-[30px] w-[30px] rounded-full"
        size="md"
        color="neutral"
        variant="soft"
        :ui="{
          base: 'bg-[#E9E6E6]',
          leadingIcon: 'text-[#999595] w-6 h-6 -ml-2',
        }"
        icon="i-heroicons-outline-arrow-sm-right"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface IChatMessage {
  id: string
  content: string
  type: 'user' | 'bot'
  timestamp: Date
}

defineProps<{
  suggestions?: string[]
  messages?: IChatMessage[]
}>()

const allAttrs = useAttrs()

const textareaContainerProps = Object.fromEntries(
  Object.entries(allAttrs)
    .filter(([k]) => k.startsWith('textarea-container-'))
    .map(([k, v]) => [k.replace('textarea-container-', ''), v])
)
</script>

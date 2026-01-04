<template>
  <NuxtLink
    :to="to"
    class="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent transition-all hover:border-secondary/30 hover:from-white/10"
  >
    <!-- Header com Ícone/Imagem -->
    <div class="flex items-center gap-4 border-b border-white/10 p-6">
      <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/20">
        <UIcon :name="icon" class="text-secondary h-7 w-7" />
      </div>
      <div class="flex-1">
        <UBadge
          :label="categoria"
          color="neutral"
          variant="subtle"
          size="xs"
          class="mb-2"
        />
        <h3 class="text-xl font-bold leading-tight group-hover:text-secondary transition-colors">
          {{ titulo }}
        </h3>
      </div>
    </div>

    <!-- Conteúdo -->
    <div class="flex flex-1 flex-col gap-4 p-6">
      <p class="line-clamp-3 text-sm leading-relaxed text-gray-400">
        {{ descricao }}
      </p>

      <!-- Meta Info -->
      <div class="mt-auto flex items-center justify-between border-t border-white/10 pt-4 text-xs text-gray-500">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-calendar" class="h-3 w-3" />
            {{ dataFormatada }}
          </span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-clock" class="h-3 w-3" />
            {{ tempoLeitura }} min
          </span>
        </div>
        <div class="flex items-center gap-2 text-secondary text-sm font-medium">
          <span>Ler artigo</span>
          <UIcon
            name="i-lucide-arrow-right"
            class="h-4 w-4 transition-transform group-hover:translate-x-1"
          />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  titulo: string
  descricao: string
  to: string
  icon: string
  categoria: string
  data?: string
  tempoLeitura?: number
}

const props = withDefaults(defineProps<Props>(), {
  data: '4 Jan 2026',
  tempoLeitura: 8,
})

const dataFormatada = computed(() => {
  if (!props.data) return '4 Jan 2026'
  return props.data
})
</script>

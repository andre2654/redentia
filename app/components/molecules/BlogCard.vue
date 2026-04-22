<template>
  <NuxtLink
    :to="to"
    class="group flex flex-col overflow-hidden rounded-2xl border transition-all hover:border-secondary/30"
    :style="{
      borderColor: brand.colors.border,
      backgroundImage: `linear-gradient(to bottom right, ${brand.colors.surfaceHover}, transparent)`,
    }"
  >
    <!-- Header com Ícone/Imagem -->
    <div class="flex items-center gap-4 border-b p-6" :style="{ borderColor: brand.colors.border }">
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
        <h3 class="text-xl font-bold leading-tight group-hover:text-secondary transition-colors" :style="{ color: brand.colors.text }">
          {{ titulo }}
        </h3>
      </div>
    </div>

    <!-- Conteúdo -->
    <div class="flex flex-1 flex-col gap-4 p-6">
      <p class="line-clamp-3 text-sm leading-relaxed" :style="{ color: brand.colors.textMuted }">
        {{ descricao }}
      </p>

      <!-- Meta Info -->
      <div class="mt-auto flex items-center justify-between border-t pt-4 text-xs" :style="{ borderColor: brand.colors.border, color: brand.colors.textMuted }">
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

const brand = useBrand()

const props = withDefaults(defineProps<Props>(), {
  data: '04/01/2026',
  tempoLeitura: 8,
})

const MONTHS: Record<string, string> = {
  jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06',
  jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12',
}

const dataFormatada = computed(() => {
  const raw = (props.data || '').trim()
  if (!raw) return '04/01/2026'
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(raw)) return raw
  const parts = raw.toLowerCase().split(/\s+/)
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0')
    const month = MONTHS[parts[1].slice(0, 3)] || '01'
    const year = parts[2]
    return `${day}/${month}/${year}`
  }
  return raw
})
</script>

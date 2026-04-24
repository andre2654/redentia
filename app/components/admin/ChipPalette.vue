<template>
  <div class="flex flex-col gap-3">
    <!-- Search -->
    <div v-if="totalChips > 6" class="relative">
      <UIcon name="i-lucide-search" class="absolute left-3 top-1/2 size-3.5 -translate-y-1/2" :style="{ color: C.textMuted }" />
      <input
        v-model="query"
        type="text"
        placeholder="Buscar variável… (ex: ticker, change)"
        class="w-full rounded-sm border bg-transparent py-2 pl-9 pr-3 font-mono-tab text-[11px] outline-none"
        :style="{ borderColor: C.border, color: C.text }"
      />
    </div>

    <!-- Empty state -->
    <div
      v-if="loading"
      class="rounded-sm border p-4 text-center font-mono-tab text-[10px]"
      :style="{ borderColor: C.border, color: C.textMuted }"
    >
      <UIcon name="i-lucide-loader-2" class="size-4 motion-safe:animate-spin" />
    </div>
    <div
      v-else-if="!catalog.length"
      class="rounded-sm border p-4 text-center font-mono-tab text-[10px]"
      :style="{ borderColor: C.border, color: C.textMuted }"
    >
      Escolha um preset pra ver as variáveis disponíveis.
    </div>

    <!-- Groups -->
    <div v-else class="flex flex-col gap-3">
      <div v-for="group in filteredCatalog" :key="group.source">
        <div class="mb-1.5 flex items-center gap-2">
          <span
            class="inline-block size-1.5 rounded-full"
            :style="{ backgroundColor: C.primary }"
          />
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
            {{ group.label }}
          </span>
          <span class="font-mono-tab text-[10px]" :style="{ color: C.textMuted }">
            · {{ group.chips.length }}
          </span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="chip in group.chips"
            :key="chip.path"
            type="button"
            class="group rounded-sm border px-2 py-1 font-mono-tab text-[10px] transition-colors hover:opacity-80"
            :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }"
            :title="chipTitle(chip)"
            @click="$emit('insert', asPlaceholder(chip.path))"
          >
            <code :style="{ color: C.primary }">{{ asPlaceholder(chip.path) }}</code>
            <span v-if="values[chip.path]" :style="{ color: C.textMuted }">
              · {{ truncate(values[chip.path], 18) }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS as C } from '~/utils/redentiaCreativeColors'

interface Chip {
  path: string
  label: string
  example?: string
  group?: string
}
interface CatalogGroup {
  source: string
  label: string
  chips: Chip[]
}

const props = defineProps<{
  catalog: CatalogGroup[]
  values: Record<string, string>
  loading?: boolean
}>()
defineEmits<{
  (e: 'insert', placeholder: string): void
}>()

const query = ref('')

const totalChips = computed(() =>
  props.catalog.reduce((sum, g) => sum + g.chips.length, 0)
)

const filteredCatalog = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.catalog
  return props.catalog
    .map(g => ({
      ...g,
      chips: g.chips.filter(c =>
        c.path.toLowerCase().includes(q) ||
        c.label.toLowerCase().includes(q)
      ),
    }))
    .filter(g => g.chips.length > 0)
})

function chipTitle(chip: Chip): string {
  const val = props.values[chip.path]
  return val ? `${chip.label} · Valor atual: ${val}` : chip.label
}

// Keep placeholder formatting in a helper so the template never
// has to nest `{…}` literals inside `{{ … }}` interpolations — Vue's
// compiler reads `{{ {foo} }}` as an object expression and errors.
function asPlaceholder(path: string): string {
  return String.fromCharCode(123) + path + String.fromCharCode(125)
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1) + '…'
}
</script>


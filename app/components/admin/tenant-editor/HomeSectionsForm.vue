<template>
  <div class="home-sections-form">
    <p class="home-sections-form__hint">
      <UIcon name="i-lucide-info" class="size-3.5" />
      Ordem + visibilidade das secoes do `/`. Drag pra reordenar, toggle pra mostrar/esconder.
    </p>

    <ul class="home-sections-form__list">
      <li
        v-for="(section, idx) in sections"
        :key="section.id"
        class="home-sections-form__item"
        :class="{
          'home-sections-form__item--dragging': draggingIdx === idx,
          'home-sections-form__item--hidden': !section.visible,
        }"
        draggable="true"
        @dragstart="onDragStart($event, idx)"
        @dragover.prevent="onDragOver(idx)"
        @dragend="onDragEnd"
        @drop.prevent="onDrop"
      >
        <span class="home-sections-form__handle" aria-hidden="true">
          <UIcon name="i-lucide-grip-vertical" class="size-3.5" />
        </span>
        <span class="home-sections-form__index">{{ idx + 1 }}</span>
        <span class="home-sections-form__id">{{ section.id }}</span>
        <span class="home-sections-form__label">{{ SECTION_LABELS[section.id] || '—' }}</span>
        <button
          type="button"
          class="home-sections-form__toggle"
          :class="{ 'home-sections-form__toggle--on': section.visible }"
          @click="onToggle(idx)"
        >
          <UIcon
            :name="section.visible ? 'i-lucide-eye' : 'i-lucide-eye-off'"
            class="size-3.5"
          />
          {{ section.visible ? 'Visible' : 'Hidden' }}
        </button>
      </li>
    </ul>

    <div class="home-sections-form__advanced">
      <button
        type="button"
        class="home-sections-form__advanced-toggle"
        :aria-expanded="addOpen"
        @click="addOpen = !addOpen"
      >
        <span class="home-sections-form__advanced-arrow" :class="{ 'home-sections-form__advanced-arrow--open': addOpen }" aria-hidden="true">▸</span>
        + Adicionar secao nova
      </button>
      <div v-if="addOpen" class="home-sections-form__add">
        <select v-model="newSectionId" class="admin-input">
          <option value="">Escolha um id…</option>
          <option v-for="id in availableNewSections" :key="id" :value="id">
            {{ id }} — {{ SECTION_LABELS[id] || '' }}
          </option>
        </select>
        <button
          type="button"
          class="admin-btn admin-btn--ghost admin-btn--sm"
          :disabled="!newSectionId"
          @click="onAdd"
        >
          <UIcon name="i-lucide-plus" class="size-3.5" />
          Adicionar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  homeSections: any[] | undefined
}>()

const emit = defineEmits<{
  (e: 'change', path: string, value: any): void
}>()

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero principal',
  trustBar: 'Trust bar (logos clientes)',
  market: 'Mercado ao vivo',
  news: 'Noticias do mercado',
  metrics: 'Metricas (numeros grandes)',
  featureTabs: 'Feature tabs',
  categories: 'Categorias (acoes/FII/etc)',
  aiCta: 'AI CTA banner',
  educational: 'Conteudo educacional',
  products: 'Carousel de produtos',
  guides: 'Guias',
  testimonials: 'Depoimentos',
  marquee: 'Marquee de features',
  apiProduct: 'API product (B2B)',
  wealthCalculator: 'Wealth projection',
  characters: 'Character showcase',
  investorChecklist: 'Checklist do investidor',
  faq: 'FAQ (perguntas frequentes)',
}

const ALL_KNOWN_SECTIONS = Object.keys(SECTION_LABELS)

const sections = computed(() =>
  Array.isArray(props.homeSections) ? props.homeSections : [],
)

const availableNewSections = computed(() => {
  const existing = new Set(sections.value.map((s: any) => s.id))
  return ALL_KNOWN_SECTIONS.filter(id => !existing.has(id))
})

const draggingIdx = ref<number | null>(null)
const newSectionId = ref('')
const addOpen = ref(false)

function onDragStart(ev: DragEvent, idx: number) {
  draggingIdx.value = idx
  if (ev.dataTransfer) {
    ev.dataTransfer.effectAllowed = 'move'
    ev.dataTransfer.setData('text/plain', String(idx))
  }
}

function onDragOver(idx: number) {
  if (draggingIdx.value === null || draggingIdx.value === idx) return
  // Reordena imediato (UX dnd live).
  const next = [...sections.value]
  const [item] = next.splice(draggingIdx.value, 1)
  next.splice(idx, 0, item)
  draggingIdx.value = idx
  emit('change', 'homeSections', next)
}

function onDragEnd() {
  draggingIdx.value = null
}

function onDrop() {
  draggingIdx.value = null
}

function onToggle(idx: number) {
  const next = [...sections.value]
  next[idx] = { ...next[idx], visible: !next[idx].visible }
  emit('change', 'homeSections', next)
}

function onAdd() {
  if (!newSectionId.value) return
  const next = [...sections.value, { id: newSectionId.value, visible: true }]
  emit('change', 'homeSections', next)
  newSectionId.value = ''
}
</script>

<style scoped>
.home-sections-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.home-sections-form__hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

.home-sections-form__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.home-sections-form__item {
  display: grid;
  grid-template-columns: auto auto 1fr 2fr auto;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  border-radius: 7px;
  background: color-mix(in srgb, var(--brand-text) 1.5%, transparent);
  cursor: grab;
  transition: all 0.15s ease;
}
.home-sections-form__item:hover {
  border-color: color-mix(in srgb, var(--brand-text) 18%, transparent);
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
}
.home-sections-form__item--dragging {
  opacity: 0.5;
  cursor: grabbing;
}
.home-sections-form__item--hidden {
  opacity: 0.55;
}

.home-sections-form__handle {
  color: color-mix(in srgb, var(--brand-text) 40%, transparent);
}

.home-sections-form__index {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
  width: 22px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.home-sections-form__id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--brand-text);
}

.home-sections-form__label {
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}

.home-sections-form__toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 15%, transparent);
  border-radius: 5px;
  background: transparent;
  font-size: 11px;
  cursor: pointer;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.home-sections-form__toggle--on {
  border-color: color-mix(in srgb, var(--brand-positive, #10b981) 35%, transparent);
  background: color-mix(in srgb, var(--brand-positive, #10b981) 12%, transparent);
  color: var(--brand-positive, #10b981);
  font-weight: 600;
}

.home-sections-form__advanced-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 0;
  padding: 4px 0;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: var(--brand-text);
  user-select: none;
}
.home-sections-form__advanced-arrow {
  display: inline-block;
  transition: transform 0.15s ease;
  font-size: 10px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.home-sections-form__advanced-arrow--open {
  transform: rotate(90deg);
}
.home-sections-form__add {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  align-items: center;
}
.home-sections-form__add .admin-input {
  flex: 1 1 auto;
}
</style>

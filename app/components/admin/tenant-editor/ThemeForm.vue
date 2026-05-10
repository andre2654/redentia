<template>
  <div class="theme-form">
    <div class="theme-form__row">
      <label class="theme-form__field">
        <span class="theme-form__label">Default mode</span>
        <div class="theme-form__radio-group">
          <button
            type="button"
            class="theme-form__radio"
            :class="{ 'theme-form__radio--active': defaultMode === 'dark' }"
            @click="emit('change', 'defaultMode', 'dark')"
          >
            <UIcon name="i-lucide-moon" class="size-3.5" />
            Dark
          </button>
          <button
            type="button"
            class="theme-form__radio"
            :class="{ 'theme-form__radio--active': defaultMode === 'light' }"
            @click="emit('change', 'defaultMode', 'light')"
          >
            <UIcon name="i-lucide-sun" class="size-3.5" />
            Light
          </button>
        </div>
        <span class="theme-form__hint">Modo "natural" do tenant. Single-mode pina aqui.</span>
      </label>

      <label class="theme-form__field">
        <span class="theme-form__label">Border radius</span>
        <select :value="theme?.borderRadius || 'rounded'" class="admin-input theme-form__select" @change="onSelectChange('theme.borderRadius', $event)">
          <option value="sharp">Sharp (4–16)</option>
          <option value="rounded">Rounded (8–24)</option>
          <option value="pill">Pill (12–32)</option>
        </select>
      </label>

      <label class="theme-form__field">
        <span class="theme-form__label">Animation</span>
        <select :value="theme?.animation || 'smooth'" class="admin-input theme-form__select" @change="onSelectChange('theme.animation', $event)">
          <option value="none">None</option>
          <option value="snappy">Snappy (150ms)</option>
          <option value="smooth">Smooth (300ms)</option>
        </select>
      </label>

      <label class="theme-form__field">
        <span class="theme-form__label">Background pattern</span>
        <select :value="theme?.backgroundPattern || 'gradient'" class="admin-input theme-form__select" @change="onSelectChange('theme.backgroundPattern', $event)">
          <option value="none">None</option>
          <option value="gradient">Gradient</option>
          <option value="grid">Grid</option>
          <option value="dots">Dots</option>
          <option value="noise">Noise</option>
        </select>
      </label>
    </div>

    <!-- Multi-mode toggle -->
    <div class="theme-form__multimode">
      <label class="theme-form__checkbox">
        <input
          type="checkbox"
          :checked="hasMultiMode"
          @change="onMultiModeToggle(($event.target as HTMLInputElement).checked)"
        />
        <span>
          <strong>Suportar dark + light mode</strong>
          <span class="theme-form__hint">
            Habilita toggle no header. Sem isso, tenant fica pinado no <code>defaultMode</code>.
          </span>
        </span>
      </label>

      <div v-if="hasMultiMode" class="theme-form__overrides">
        <p class="theme-form__hint" style="margin-bottom: 8px;">
          Overrides por modo. Cores nao definidas usam <code>colors.*</code> base.
        </p>
        <div class="theme-form__override-tabs">
          <button
            type="button"
            class="theme-form__tab"
            :class="{ 'theme-form__tab--active': activeMode === 'light' }"
            @click="activeMode = 'light'"
          >
            <UIcon name="i-lucide-sun" class="size-3.5" />
            Light overrides
          </button>
          <button
            type="button"
            class="theme-form__tab"
            :class="{ 'theme-form__tab--active': activeMode === 'dark' }"
            @click="activeMode = 'dark'"
          >
            <UIcon name="i-lucide-moon" class="size-3.5" />
            Dark overrides
          </button>
        </div>
        <ColorsForm
          :colors="modeOverrides"
          :namespace="`themes.${activeMode}`"
          @change="(path, value) => emit('change', path, value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ColorsForm from './ColorsForm.vue'

const props = defineProps<{
  defaultMode: 'dark' | 'light' | undefined
  theme: any
  themes: any
}>()

const emit = defineEmits<{
  (e: 'change', path: string, value: any): void
}>()

const activeMode = ref<'light' | 'dark'>('light')

const hasMultiMode = computed(() => {
  const t = props.themes
  if (!t || typeof t !== 'object') return false
  if (Array.isArray(t)) return false
  return !!(t.light || t.dark)
})

const modeOverrides = computed(() => {
  const t = props.themes
  if (!t || typeof t !== 'object' || Array.isArray(t)) return {}
  return t[activeMode.value] || {}
})

function onSelectChange(path: string, ev: Event) {
  emit('change', path, (ev.target as HTMLSelectElement).value)
}

function onMultiModeToggle(enabled: boolean) {
  if (enabled) {
    // Cria themes.light se nao existir (paleta vazia, admin preenche)
    const t = (props.themes && typeof props.themes === 'object' && !Array.isArray(props.themes))
      ? { ...props.themes }
      : {}
    if (!t.light && !t.dark) t.light = {}
    emit('change', 'themes', t)
  } else {
    // Remove themes inteiro pra voltar pra single-mode
    emit('change', 'themes', null)
  }
}
</script>

<style scoped>
.theme-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.theme-form__row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}
.theme-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.theme-form__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.theme-form__hint {
  font-size: 11.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
.theme-form__hint code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  padding: 1px 4px;
  border-radius: 3px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.theme-form__radio-group {
  display: inline-flex;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  border-radius: 7px;
  overflow: hidden;
  width: fit-content;
}
.theme-form__radio {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: transparent;
  border: 0;
  font-size: 12px;
  cursor: pointer;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}
.theme-form__radio--active {
  background: var(--brand-primary);
  color: var(--text-on-primary, #1A0A2E);
  font-weight: 600;
}
.theme-form__select {
  width: 100%;
}

.theme-form__multimode {
  border-top: 1px dashed color-mix(in srgb, var(--brand-text) 12%, transparent);
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.theme-form__checkbox {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  cursor: pointer;
}
.theme-form__checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--brand-primary);
  cursor: pointer;
  margin-top: 2px;
}
.theme-form__checkbox > span {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  color: var(--brand-text);
}

.theme-form__overrides {
  margin-top: 6px;
  padding: 12px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
}
.theme-form__override-tabs {
  display: inline-flex;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  border-radius: 7px;
  overflow: hidden;
  margin-bottom: 12px;
}
.theme-form__tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 0;
  font-size: 12px;
  cursor: pointer;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}
.theme-form__tab--active {
  background: color-mix(in srgb, var(--brand-primary) 16%, transparent);
  color: var(--brand-primary);
  font-weight: 600;
}
</style>

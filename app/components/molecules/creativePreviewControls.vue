<!--
  MoleculesCreativePreviewControls

  Wrapper used by every creative page (asset-spotlight, asset-compare,
  growth-race, etc) to:

  1. Scale the 1080x1080 canvas DOWN so the human editor sees the whole
     square at once on a normal browser window.
  2. Render an inline control panel (right side) with the params each
     creative supports — ticker selectors, dates, format toggles, reset.
  3. Stay COMPLETELY out of the way when Puppeteer renders the creative
     for n8n. Puppeteer hits the creative URL with a `?key=` query param;
     when that's present (or when ?preview=raw), the wrapper renders only
     the slot, no chrome.

  Usage:
    <MoleculesCreativePreviewControls :controls="controls" @reset="onReset">
      <div class="frame">...the 1080x1080 creative...</div>
    </MoleculesCreativePreviewControls>

  controls is an array describing each editable param. Two-way binding via
  v-model on each control row would couple it tightly; instead each control
  exposes a `value` getter + an `update` callback that mutates the URL query.
-->

<template>
  <div v-if="rawMode" class="raw-passthrough">
    <slot />
  </div>
  <div v-else class="cpc-shell">
    <!-- Top header bar -->
    <header class="cpc-header">
      <NuxtLink to="/creative" class="cpc-brand">
        <UIcon name="i-lucide-arrow-left" class="size-3.5" />
        <span class="cpc-brand-label">REDENTIA<span class="cpc-brand-accent">.CREATIVE</span></span>
      </NuxtLink>
      <div class="cpc-header-meta">
        <span class="cpc-tag">[ {{ creativeName }} ]</span>
        <span class="cpc-sep">·</span>
        <span class="cpc-meta">1080 × 1080 px</span>
      </div>
      <div class="cpc-header-actions">
        <button class="cpc-btn-ghost" @click="toggleRaw" :title="'Abrir versão raw (para screenshot)'">
          <UIcon name="i-lucide-camera" class="size-3.5" />
          Modo screenshot
        </button>
        <button class="cpc-btn-primary" @click="$emit('reset')">
          <UIcon name="i-lucide-rotate-ccw" class="size-3.5" />
          Resetar
        </button>
      </div>
    </header>

    <div class="cpc-body">
      <!-- LEFT: scaled-down preview -->
      <div class="cpc-preview-col">
        <div class="cpc-preview-card">
          <div class="cpc-preview-meta">
            <span class="cpc-meta-dot" />
            <span>PREVIEW · ESCALADO {{ Math.round(scale * 100) }}%</span>
          </div>
          <div class="cpc-canvas-wrap" :style="{ width: scaledSize + 'px', height: scaledSize + 'px' }">
            <div class="cpc-canvas" :style="{ transform: `scale(${scale})` }">
              <slot />
            </div>
          </div>
          <div class="cpc-preview-footer">
            <UIcon name="i-lucide-info" class="size-3" />
            <span>Para capturar em alta resolução, clique em "Modo screenshot" acima</span>
          </div>
        </div>
      </div>

      <!-- RIGHT: controls panel -->
      <aside class="cpc-controls-col">
        <div class="cpc-controls-card">
          <div class="cpc-controls-header">
            <span class="cpc-controls-eyebrow">[ CONTROLES ]</span>
            <h3 class="cpc-controls-title">Edite os parâmetros</h3>
            <p class="cpc-controls-sub">A pré-visualização atualiza ao vivo. Os valores ficam na URL — copie ela pra usar no n8n ou compartilhar.</p>
          </div>

          <div class="cpc-controls-list">
            <div
              v-for="ctrl in controls"
              :key="ctrl.id"
              class="cpc-control"
            >
              <label class="cpc-control-label">
                {{ ctrl.label }}
                <span v-if="ctrl.hint" class="cpc-control-hint">{{ ctrl.hint }}</span>
              </label>

              <!-- TEXT input (ticker, subtitle) -->
              <input
                v-if="ctrl.type === 'text'"
                :value="ctrl.value"
                :placeholder="ctrl.placeholder"
                class="cpc-input"
                @input="onInput(ctrl, ($event.target as HTMLInputElement).value)"
              />

              <!-- TICKERS list (multi) -->
              <div v-else-if="ctrl.type === 'tickers'" class="cpc-tickers">
                <div class="cpc-chips">
                  <span
                    v-for="(t, i) in (ctrl.value as string).split(',').filter(Boolean)"
                    :key="t + i"
                    class="cpc-chip"
                  >
                    {{ t.trim().toUpperCase() }}
                    <button class="cpc-chip-x" @click="removeTicker(ctrl, i)">×</button>
                  </span>
                </div>
                <div class="cpc-ticker-add">
                  <input
                    v-model="newTicker"
                    placeholder="Add ticker (Enter)"
                    class="cpc-input cpc-input-sm"
                    @keydown.enter.prevent="addTicker(ctrl)"
                  />
                  <button class="cpc-btn-add" @click="addTicker(ctrl)">+</button>
                </div>
              </div>

              <!-- DATE input -->
              <input
                v-else-if="ctrl.type === 'date'"
                type="date"
                :value="ctrl.value"
                class="cpc-input"
                @input="onInput(ctrl, ($event.target as HTMLInputElement).value)"
              />

              <!-- SELECT -->
              <select
                v-else-if="ctrl.type === 'select'"
                :value="ctrl.value"
                class="cpc-input"
                @change="onInput(ctrl, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="opt in ctrl.options" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>

              <!-- TOGGLE / boolean -->
              <label v-else-if="ctrl.type === 'toggle'" class="cpc-toggle">
                <input
                  type="checkbox"
                  :checked="ctrl.value === 'true' || ctrl.value === true"
                  @change="onInput(ctrl, ($event.target as HTMLInputElement).checked ? 'true' : 'false')"
                />
                <span class="cpc-toggle-track" />
                <span class="cpc-toggle-state">{{ (ctrl.value === 'true' || ctrl.value === true) ? 'ATIVO' : 'INATIVO' }}</span>
              </label>
            </div>
          </div>

          <!-- Current URL display -->
          <div class="cpc-url-block">
            <div class="cpc-url-label">URL ATUAL</div>
            <div class="cpc-url-row">
              <code class="cpc-url-code">{{ currentPath }}</code>
              <button class="cpc-btn-copy" @click="copyUrl" :title="copied ? 'Copiado!' : 'Copiar URL'">
                <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" class="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
type ControlType = 'text' | 'tickers' | 'date' | 'select' | 'toggle'

interface ControlOption {
  label: string
  value: string
}

interface PreviewControl {
  id: string
  label: string
  type: ControlType
  value: string | boolean
  placeholder?: string
  hint?: string
  options?: ControlOption[]
  /** URL query param name to mutate when this control changes */
  param: string
}

const props = defineProps<{
  creativeName: string
  controls: PreviewControl[]
  scale?: number
}>()

defineEmits<{
  (e: 'reset'): void
}>()

const route = useRoute()
const router = useRouter()

const scale = computed(() => props.scale ?? 0.55)
const scaledSize = computed(() => Math.round(1080 * scale.value))

const newTicker = ref('')
const copied = ref(false)

const rawMode = computed(() => {
  // n8n / puppeteer always passes ?key=...
  // Or human can request raw with ?preview=raw
  return !!route.query.key || route.query.preview === 'raw'
})

const currentPath = computed(() => {
  const q = Object.entries(route.query)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&')
  return route.path + (q ? `?${q}` : '')
})

function onInput(ctrl: PreviewControl, value: string) {
  router.replace({ query: { ...route.query, [ctrl.param]: value } })
}

function addTicker(ctrl: PreviewControl) {
  const t = newTicker.value.trim().toUpperCase()
  if (!t) return
  const current = (ctrl.value as string).split(',').filter(Boolean).map(x => x.trim().toUpperCase())
  if (current.includes(t)) {
    newTicker.value = ''
    return
  }
  current.push(t)
  router.replace({ query: { ...route.query, [ctrl.param]: current.join(',') } })
  newTicker.value = ''
}

function removeTicker(ctrl: PreviewControl, idx: number) {
  const current = (ctrl.value as string).split(',').filter(Boolean).map(x => x.trim().toUpperCase())
  current.splice(idx, 1)
  router.replace({ query: { ...route.query, [ctrl.param]: current.join(',') } })
}

function toggleRaw() {
  router.replace({ query: { ...route.query, preview: 'raw' } })
}

async function copyUrl() {
  try {
    const fullUrl = window.location.origin + currentPath.value
    await navigator.clipboard.writeText(fullUrl)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch {
    // ignore
  }
}
</script>

<style scoped>
.raw-passthrough {
  width: 1080px;
  height: 1080px;
}

.cpc-shell {
  min-height: 100vh;
  background: #0A0B0E;
  color: #E8EAED;
  font-family: 'Inter', system-ui, sans-serif;
  font-feature-settings: 'ss01', 'cv11';
}

/* Header */
.cpc-header {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 14px 28px;
  border-bottom: 1px solid #2A2E39;
  background: rgba(10, 11, 14, 0.85);
  backdrop-filter: blur(20px);
}

.cpc-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: #8B92A7;
  text-decoration: none;
  transition: color 0.2s ease;
}
.cpc-brand:hover { color: #E8EAED; }

.cpc-brand-label { color: #E8EAED; }
.cpc-brand-accent { color: #F5A623; }

.cpc-header-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #8B92A7;
}
.cpc-tag { color: #F5A623; text-transform: uppercase; }
.cpc-sep { color: #2A2E39; }

.cpc-header-actions {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.cpc-btn-primary,
.cpc-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
  border: 1px solid transparent;
}

.cpc-btn-primary {
  background: #F5A623;
  color: #0A0B0E;
  font-weight: 600;
  box-shadow: 0 8px 24px -8px rgba(245, 166, 35, 0.5);
}
.cpc-btn-primary:hover { transform: translateY(-1px); }

.cpc-btn-ghost {
  background: transparent;
  color: #E8EAED;
  border-color: #2A2E39;
}
.cpc-btn-ghost:hover { background: rgba(255,255,255,0.04); }

/* Body layout */
.cpc-body {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 28px;
  padding: 28px;
  align-items: start;
}

@media (max-width: 1100px) {
  .cpc-body {
    grid-template-columns: 1fr;
  }
}

/* Preview column */
.cpc-preview-col {
  display: flex;
  justify-content: center;
}

.cpc-preview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid #2A2E39;
  background: linear-gradient(180deg, rgba(20,22,28,0.6), rgba(10,11,14,0.6));
}

.cpc-preview-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #8B92A7;
}

.cpc-meta-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00D395;
  box-shadow: 0 0 10px #00D395;
  animation: cpc-pulse 1.6s ease-in-out infinite;
}

@keyframes cpc-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.cpc-canvas-wrap {
  position: relative;
  border-radius: 16px;
  border: 1px solid #2A2E39;
  background: #0A0B0E;
  overflow: hidden;
  box-shadow: 0 30px 80px -30px rgba(245, 166, 35, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.02);
}

.cpc-canvas {
  width: 1080px;
  height: 1080px;
  transform-origin: top left;
  position: absolute;
  top: 0;
  left: 0;
}

.cpc-preview-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #8B92A7;
}

/* Controls panel */
.cpc-controls-col {
  position: sticky;
  top: 80px;
}

.cpc-controls-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid #2A2E39;
  background: linear-gradient(180deg, rgba(20,22,28,0.6), rgba(10,11,14,0.6));
}

.cpc-controls-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 18px;
  border-bottom: 1px solid #2A2E3980;
}

.cpc-controls-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #F5A623;
}

.cpc-controls-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #E8EAED;
  margin: 0;
}

.cpc-controls-sub {
  font-size: 12px;
  line-height: 1.5;
  color: #8B92A7;
  margin: 4px 0 0;
}

.cpc-controls-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cpc-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cpc-control-label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #E8EAED;
}

.cpc-control-hint {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  font-size: 11px;
  color: #8B92A7;
}

.cpc-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #2A2E39;
  background: #0A0B0E;
  color: #E8EAED;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  outline: none;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.cpc-input:hover { border-color: #3A3F4D; }
.cpc-input:focus { border-color: #F5A623; background: rgba(245, 166, 35, 0.04); }

.cpc-input-sm { padding: 7px 10px; font-size: 11px; }

/* Tickers chips */
.cpc-tickers { display: flex; flex-direction: column; gap: 8px; }
.cpc-chips { display: flex; flex-wrap: wrap; gap: 6px; min-height: 22px; }
.cpc-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 12px;
  border-radius: 9999px;
  background: rgba(245, 166, 35, 0.12);
  border: 1px solid rgba(245, 166, 35, 0.4);
  color: #F5A623;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
}
.cpc-chip-x {
  background: none;
  border: none;
  color: #F5A623;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0 2px;
  opacity: 0.7;
}
.cpc-chip-x:hover { opacity: 1; }

.cpc-ticker-add { display: flex; gap: 6px; }
.cpc-ticker-add .cpc-input { flex: 1; }
.cpc-btn-add {
  width: 32px;
  border-radius: 10px;
  border: 1px solid #2A2E39;
  background: #0A0B0E;
  color: #F5A623;
  cursor: pointer;
  font-weight: 700;
  font-size: 16px;
  line-height: 1;
}
.cpc-btn-add:hover { background: rgba(245, 166, 35, 0.08); border-color: #F5A623; }

/* Toggle */
.cpc-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}
.cpc-toggle input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.cpc-toggle-track {
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: 9999px;
  background: #2A2E39;
  transition: background 0.2s ease;
}
.cpc-toggle-track::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #E8EAED;
  transition: transform 0.2s ease;
}
.cpc-toggle input:checked + .cpc-toggle-track { background: #F5A623; }
.cpc-toggle input:checked + .cpc-toggle-track::after { transform: translateX(16px); background: #0A0B0E; }
.cpc-toggle-state {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: #8B92A7;
}

/* URL block */
.cpc-url-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid #2A2E39;
}
.cpc-url-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #8B92A7;
}
.cpc-url-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cpc-url-code {
  flex: 1;
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #E8EAED;
  word-break: break-all;
  line-height: 1.4;
}
.cpc-btn-copy {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #2A2E39;
  background: rgba(245, 166, 35, 0.1);
  color: #F5A623;
  cursor: pointer;
}
.cpc-btn-copy:hover { background: rgba(245, 166, 35, 0.2); }
</style>

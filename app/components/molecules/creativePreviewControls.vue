<!--
  MoleculesCreativePreviewControls — Playground-style

  Wrapper used por cada creative page (asset-spotlight, asset-compare,
  growth-race etc) pra:

  1. Renderizar um playground no estilo embed.redentia.com.br com:
     - Breadcrumbs (Início > Creative > Nome)
     - Hero header (H1 + descrição)
     - Grid 2:3 (config esquerda · preview direita)
     - Botão "Copiar URL" prominente
     - Cross-links pra outros creatives
  2. Escalar o canvas 1080×1080 pro preview caber em telas normais.
  3. Sumir do caminho quando Puppeteer renderiza (?key= ou ?preview=raw)
     pro screenshot ficar limpo.

  API mantida compatível com as creative pages existentes.
-->

<template>
  <!-- RAW MODE (n8n / Puppeteer ou ?preview=raw) — passthrough 1080×1080 -->
  <div v-if="rawMode" class="raw-passthrough">
    <div v-if="!isPuppeteer" class="raw-toolbar">
      <button class="raw-btn raw-btn-back" @click="exitRaw" title="Voltar para o painel de controles">
        <UIcon name="i-lucide-arrow-left" class="size-3.5" />
        <span>Voltar ao editor</span>
      </button>
      <div class="raw-toolbar-meta">
        <span class="raw-toolbar-tag">[ {{ creativeName }} ]</span>
        <span class="raw-toolbar-sep">·</span>
        <span class="raw-toolbar-meta-text">1080 × 1080 · screenshot ready</span>
      </div>
      <div class="raw-toolbar-actions">
        <slot name="raw-actions" />
      </div>
    </div>
    <slot />
  </div>

  <!-- PLAYGROUND MODE (default) — mesmo padrão dos embeds -->
  <NuxtLayout v-else name="static" :title="creativeName">
    <section class="flex flex-col gap-12 px-6 py-12 md:py-16">
      <!-- Breadcrumbs -->
      <nav class="mx-auto flex w-full max-w-5xl items-center gap-2 text-sm text-gray-400">
        <NuxtLink to="/" class="hover:text-white">Início</NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-4" />
        <NuxtLink to="/creative" class="hover:text-white">Creative Studio</NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-4" />
        <span class="text-white">{{ creativeName }}</span>
      </nav>

      <!-- Hero -->
      <header class="mx-auto flex w-full max-w-5xl flex-col gap-4 text-center md:text-left">
        <span
          class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
          :style="{ color: brand.colors.primary }"
        >
          [ {{ creativeName }} ] · 1080 × 1080 · SCREENSHOT READY
        </span>
        <h1
          class="text-3xl md:text-5xl"
          :class="[brand.font.headingWeight]"
          :style="{ color: brand.colors.text }"
        >
          {{ heroTitle || creativeName }}
        </h1>
        <p v-if="heroDescription" class="max-w-2xl text-base text-gray-400 md:text-lg">
          {{ heroDescription }}
        </p>
      </header>

      <!-- Playground grid -->
      <div class="mx-auto grid w-full max-w-5xl gap-8 md:grid-cols-5">
        <!-- LEFT: Config panel (2 cols) -->
        <div class="flex flex-col gap-5 md:col-span-2">
          <h2 class="text-xl font-semibold" :style="{ color: brand.colors.text }">
            Customizar
          </h2>

          <div
            v-for="ctrl in controls"
            :key="ctrl.id"
            class="flex flex-col gap-2"
          >
            <label class="flex items-baseline justify-between gap-2 text-sm text-gray-400">
              <span class="font-semibold uppercase tracking-wider text-white">{{ ctrl.label }}</span>
              <span v-if="ctrl.hint" class="text-xs text-gray-500">{{ ctrl.hint }}</span>
            </label>

            <!-- TEXT -->
            <UInput
              v-if="ctrl.type === 'text'"
              :model-value="String(ctrl.value ?? '')"
              :placeholder="ctrl.placeholder"
              @update:model-value="onInput(ctrl, String($event))"
            />

            <!-- TICKERS (multi, chips) -->
            <div v-else-if="ctrl.type === 'tickers'" class="flex flex-col gap-2">
              <div class="flex flex-wrap gap-2 empty:hidden">
                <span
                  v-for="(t, i) in tickerList(ctrl)"
                  :key="t + i"
                  class="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono-tab text-xs font-semibold"
                  :style="{
                    borderColor: `${brand.colors.primary}66`,
                    backgroundColor: `${brand.colors.primary}1a`,
                    color: brand.colors.primary,
                  }"
                >
                  {{ t }}
                  <button type="button" class="opacity-70 hover:opacity-100" @click="removeTicker(ctrl, i)">×</button>
                </span>
              </div>
              <div class="flex gap-2">
                <UInput
                  v-model="newTicker"
                  placeholder="Adicionar ticker (Enter)"
                  class="flex-1"
                  @keydown.enter.prevent="addTicker(ctrl)"
                />
                <UButton icon="i-lucide-plus" color="neutral" variant="outline" @click="addTicker(ctrl)" />
              </div>
            </div>

            <!-- DATE -->
            <UInput
              v-else-if="ctrl.type === 'date'"
              type="date"
              :model-value="String(ctrl.value ?? '')"
              @update:model-value="onInput(ctrl, String($event))"
            />

            <!-- SELECT -->
            <USelect
              v-else-if="ctrl.type === 'select'"
              :model-value="String(ctrl.value ?? '')"
              :items="(ctrl.options ?? []).map(o => ({ label: o.label, value: o.value }))"
              @update:model-value="onInput(ctrl, String($event))"
            />

            <!-- TOGGLE -->
            <div v-else-if="ctrl.type === 'toggle'" class="flex items-center gap-3">
              <USwitch
                :model-value="ctrl.value === 'true' || ctrl.value === true"
                @update:model-value="onInput(ctrl, $event ? 'true' : 'false')"
              />
              <span class="font-mono-tab text-xs uppercase tracking-wider text-gray-400">
                {{ (ctrl.value === 'true' || ctrl.value === true) ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
          </div>

          <!-- URL block + copy -->
          <div class="flex flex-col gap-2 pt-2">
            <label class="text-sm text-gray-400">URL atual (compartilhe no n8n ou com time)</label>
            <div
              class="overflow-x-auto rounded-lg border p-4 font-mono text-xs"
              :style="{
                backgroundColor: brand.colors.background,
                borderColor: brand.colors.border,
                color: brand.colors.text,
              }"
            >
              <code>{{ currentPath }}</code>
            </div>
            <UButton :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'" color="primary" block @click="copyUrl">
              {{ copied ? 'Copiado!' : 'Copiar URL' }}
            </UButton>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-2 pt-2">
            <UButton icon="i-lucide-camera" color="primary" variant="soft" @click="toggleRaw">
              Modo screenshot
            </UButton>
            <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="outline" @click="$emit('reset')">
              Resetar
            </UButton>
          </div>
        </div>

        <!-- RIGHT: Preview (3 cols) -->
        <div class="flex flex-col gap-4 md:col-span-3">
          <h2 class="text-xl font-semibold" :style="{ color: brand.colors.text }">
            Pré-visualização
          </h2>
          <div
            class="flex items-center justify-center rounded-2xl border p-4"
            :style="{
              borderColor: brand.colors.border,
              backgroundColor: brand.colors.background,
              minHeight: `${scaledSize + 40}px`,
            }"
          >
            <div
              class="relative overflow-hidden rounded-xl border"
              :style="{
                width: `${scaledSize}px`,
                height: `${scaledSize}px`,
                borderColor: brand.colors.border,
                backgroundColor: brand.colors.background,
                boxShadow: `0 30px 80px -30px ${brand.colors.primary}50`,
              }"
            >
              <div
                class="absolute left-0 top-0"
                style="width: 1080px; height: 1080px; transform-origin: top left;"
                :style="{ transform: `scale(${scale})` }"
              >
                <slot />
              </div>
            </div>
          </div>
          <p class="flex items-center gap-1.5 text-xs text-gray-500">
            <UIcon name="i-lucide-info" class="size-3" />
            Preview escalado a {{ Math.round(scale * 100) }}%. Para capturar em alta resolução, clique em "Modo screenshot".
          </p>
        </div>
      </div>

      <!-- Outros creatives (cross-link, estilo embed playground) -->
      <div class="mx-auto w-full max-w-5xl">
        <h2 class="mb-3 text-xl font-semibold" :style="{ color: brand.colors.text }">
          Outros creatives
        </h2>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="link in otherCreatives"
            :key="link.to"
            :to="link.to"
            variant="outline"
            color="neutral"
            :icon="link.icon"
          >
            {{ link.label }}
          </UButton>
          <UButton to="/creative" variant="outline" color="neutral" icon="i-lucide-layout-grid">
            Todos os creatives
          </UButton>
        </div>
      </div>
    </section>
  </NuxtLayout>
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
  /** Título opcional do hero; default usa creativeName */
  heroTitle?: string
  heroDescription?: string
}>()

defineEmits<{
  (e: 'reset'): void
}>()

const route = useRoute()
const router = useRouter()
const brand = useBrand()

const scale = computed(() => props.scale ?? 0.48)
const scaledSize = computed(() => Math.round(1080 * scale.value))

const newTicker = ref('')
const copied = ref(false)

const rawMode = computed(() => {
  return !!route.query.key || route.query.preview === 'raw'
})

const isPuppeteer = computed(() => !!route.query.key)

function exitRaw() {
  const { preview, ...rest } = route.query
  router.replace({ query: rest })
}

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

function tickerList(ctrl: PreviewControl): string[] {
  return String(ctrl.value ?? '')
    .split(',')
    .map((x) => x.trim().toUpperCase())
    .filter(Boolean)
}

function addTicker(ctrl: PreviewControl) {
  const t = newTicker.value.trim().toUpperCase()
  if (!t) return
  const current = tickerList(ctrl)
  if (current.includes(t)) {
    newTicker.value = ''
    return
  }
  current.push(t)
  router.replace({ query: { ...route.query, [ctrl.param]: current.join(',') } })
  newTicker.value = ''
}

function removeTicker(ctrl: PreviewControl, idx: number) {
  const current = tickerList(ctrl)
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

// Lista curada de outros creatives para cross-link (replica o padrão
// dos playgrounds de embed, que sempre têm links pro restante da
// família no fim da página).
const otherCreatives = computed(() => {
  const all = [
    { to: '/creative/asset-spotlight', label: 'Spotlight', icon: 'i-lucide-star' },
    { to: '/creative/asset-compare', label: 'Comparativo', icon: 'i-lucide-split' },
    { to: '/creative/growth-race', label: 'Growth Race', icon: 'i-lucide-trending-up' },
    { to: '/creative/ranking/top', label: 'Top Altas', icon: 'i-lucide-trophy' },
    { to: '/creative/ranking/bottom', label: 'Top Baixas', icon: 'i-lucide-trending-down' },
    { to: '/creative/market-updates', label: 'Market Updates', icon: 'i-lucide-bell' },
    { to: '/creative/treemap-weekly', label: 'Treemap 7D', icon: 'i-lucide-grid-2x2' },
  ]
  // Tira o atual da lista
  return all.filter((l) => !route.path.startsWith(l.to)).slice(0, 4)
})
</script>

<style scoped>
/* ============================================================
   RAW MODE — mantido idêntico pro Puppeteer não quebrar
   ============================================================ */
.raw-passthrough {
  position: relative;
  width: 1080px;
  height: 1080px;
}

.raw-toolbar {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 14px 10px 10px;
  border-radius: 9999px;
  background: rgba(10, 11, 14, 0.92);
  border: 1px solid #2A2E39;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px -20px rgba(0, 0, 0, 0.8);
  font-family: 'Inter', system-ui, sans-serif;
  color: #E8EAED;
}

.raw-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
  border: 1px solid transparent;
  background: transparent;
  color: #E8EAED;
}

.raw-btn-back {
  background: rgba(245, 166, 35, 0.12);
  color: #F5A623;
  border-color: rgba(245, 166, 35, 0.4);
}
.raw-btn-back:hover {
  background: rgba(245, 166, 35, 0.2);
  transform: translateY(-1px);
}

.raw-toolbar-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: #8B92A7;
}
.raw-toolbar-tag { color: #F5A623; text-transform: uppercase; }
.raw-toolbar-sep { color: #2A2E39; }
.raw-toolbar-meta-text { text-transform: uppercase; }

.raw-toolbar-actions {
  display: flex;
  gap: 6px;
}

/* Slotted action buttons inherit a consistent look */
.raw-toolbar-actions :slotted(button),
.raw-toolbar-actions :slotted(.raw-action-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #2A2E39;
  background: rgba(255, 255, 255, 0.04);
  color: #F5A623;
  cursor: pointer;
  transition: all 0.2s;
}
.raw-toolbar-actions :slotted(button:hover) {
  background: rgba(245, 166, 35, 0.12);
  border-color: #F5A623;
}
</style>

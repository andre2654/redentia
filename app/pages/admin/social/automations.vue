<template>
  <NuxtLayout name="admin-panel">
    <div class="mx-auto flex max-w-6xl flex-col gap-6">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
            [SOCIAL · AUTOMAÇÕES]
          </span>
          <h1 class="mt-2 text-[28px] leading-tight md:text-[36px]" :style="{ color: C.text, fontFamily: F.display }">
            Ações recorrentes.
          </h1>
          <p class="mt-3 max-w-2xl text-[13px]" :style="{ color: C.textMuted }">
            Escolha um preset (ranking diário, corrida semanal, treemap…), ajuste os parâmetros visualmente
            e deixe o agendador rodar. Nada de JSON cru nem cron mental.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-sm px-4 py-2.5 font-mono-tab text-[11px] font-bold uppercase tracking-[0.15em] transition-all hover:opacity-90"
          :style="{ backgroundColor: C.primary, color: C.background }"
          @click="openWizard(null)"
        >
          <UIcon name="i-lucide-plus" class="size-4" />
          NOVA AUTOMAÇÃO
        </button>
      </header>

      <div v-if="error" class="rounded-sm border px-4 py-3 text-[13px]" :style="{ borderColor: C.negative, color: C.negative }">
        {{ error }}
      </div>

      <div v-if="loading" class="py-10 text-center" :style="{ color: C.textMuted }">
        <UIcon name="i-lucide-loader-2" class="size-5 animate-spin" />
      </div>

      <div
        v-else-if="items.length === 0"
        class="rounded-sm border p-8 text-center text-[13px]"
        :style="{ borderColor: C.border, color: C.textMuted }"
      >
        Nenhuma automação cadastrada.
        <button type="button" class="underline" :style="{ color: C.primary }" @click="openWizard(null)">
          Criar a primeira
        </button>.
      </div>

      <section v-else class="flex flex-col gap-3">
        <article
          v-for="a in items"
          :key="a.id"
          class="rounded-sm border p-5 transition-colors hover:brightness-110"
          :style="{ borderColor: C.border, backgroundColor: C.surface }"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex flex-wrap items-center gap-3">
                <span
                  class="inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
                  :style="a.enabled
                    ? { borderColor: C.positive, color: C.positive }
                    : { borderColor: C.border, color: C.textMuted }"
                >
                  <span class="size-1.5 rounded-full" :style="{ backgroundColor: a.enabled ? C.positive : C.textMuted }" />
                  {{ a.enabled ? 'ATIVA' : 'DESATIVADA' }}
                </span>
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.primary }">
                  {{ presetLabelOf(a) }}
                </span>
                <span
                  v-if="humanizedScheduleOf(a)"
                  class="font-mono-tab text-[10px]"
                  :style="{ color: C.textMuted }"
                >
                  <UIcon name="i-lucide-calendar-clock" class="mr-0.5 inline size-3" />
                  {{ humanizedScheduleOf(a) }}
                </span>
              </div>
              <h3 class="mt-2 text-[18px] font-semibold" :style="{ color: C.text }">{{ a.title }}</h3>
              <div class="mt-1 font-mono-tab text-[11px]" :style="{ color: C.textMuted }">
                key: {{ a.key }}
              </div>
              <div
                v-if="a.last_run_at"
                class="mt-3 flex flex-wrap gap-4 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
                :style="{ color: C.textMuted }"
              >
                <span>ÚLTIMA EXECUÇÃO: {{ formatDate(a.last_run_at) }}</span>
                <span v-if="a.last_result?.status" :style="{ color: statusColor(String(a.last_result.status)) }">
                  STATUS: {{ String(a.last_result.status).toUpperCase() }}
                </span>
                <span v-if="a.last_error" :style="{ color: C.negative }">ERRO: {{ a.last_error.slice(0, 60) }}…</span>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                :disabled="busyIds.has(a.id)"
                class="rounded-sm border px-3 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors hover:opacity-80 disabled:opacity-40"
                :style="a.enabled
                  ? { borderColor: C.textMuted, color: C.textMuted }
                  : { borderColor: C.positive, color: C.positive }"
                @click="handleToggle(a)"
              >
                {{ a.enabled ? 'DESATIVAR' : 'ATIVAR' }}
              </button>
              <button
                type="button"
                :disabled="busyIds.has(a.id)"
                class="rounded-sm border px-3 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors hover:opacity-80 disabled:opacity-40"
                :style="{ borderColor: C.primary, color: C.primary }"
                @click="handleRunNow(a)"
              >
                RODAR AGORA
              </button>
              <button
                type="button"
                class="rounded-sm border px-3 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors hover:opacity-80"
                :style="{ borderColor: C.border, color: C.text }"
                @click="openWizard(a)"
              >
                EDITAR
              </button>
              <button
                type="button"
                :disabled="busyIds.has(a.id)"
                class="rounded-sm border px-3 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-colors hover:opacity-80 disabled:opacity-40"
                :style="{ borderColor: C.negative, color: C.negative }"
                @click="handleDelete(a)"
              >
                DELETAR
              </button>
            </div>
          </div>
        </article>
      </section>
    </div>

    <!-- ====================== WIZARD OVERLAY ====================== -->
    <div
      v-if="wizardOpen"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 md:p-6"
      style="background-color: rgba(0,0,0,0.75); backdrop-filter: blur(4px)"
      @click.self="closeWizard"
    >
      <div
        class="my-auto flex w-full max-w-4xl flex-col rounded-sm border"
        :style="{ borderColor: C.border, backgroundColor: C.background }"
      >
        <!-- Header + step indicator -->
        <div class="flex items-center justify-between border-b px-5 py-4" :style="{ borderColor: C.border }">
          <div class="flex items-center gap-3">
            <span class="font-mono-tab text-[11px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
              [{{ wizardMode === 'create' ? 'NOVA AUTOMAÇÃO' : 'EDITAR AUTOMAÇÃO' }}]
            </span>
            <span class="flex items-center gap-1.5 font-mono-tab text-[10px]" :style="{ color: C.textMuted }">
              <span
                v-for="n in 3"
                :key="n"
                class="inline-flex size-5 items-center justify-center rounded-full border transition-all"
                :style="step >= n
                  ? { borderColor: C.primary, color: C.primary, backgroundColor: `${C.primary}15` }
                  : { borderColor: C.border, color: C.textMuted }"
              >{{ n }}</span>
            </span>
          </div>
          <button type="button" class="text-[14px]" :style="{ color: C.textMuted }" @click="closeWizard">✕</button>
        </div>

        <!-- ============== STEP 1 — choose preset ============== -->
        <div v-if="step === 1" class="flex flex-col gap-4 p-5 md:p-6">
          <div>
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
              [ PASSO 1 · ESCOLHA O TIPO ]
            </span>
            <h2 class="mt-1 text-[22px]" :style="{ color: C.text, fontFamily: F.display }">
              O que essa automação vai fazer?
            </h2>
          </div>
          <div class="grid gap-3 md:grid-cols-2">
            <button
              v-for="p in AUTOMATION_PRESETS"
              :key="p.id"
              type="button"
              class="flex flex-col items-start gap-2 rounded-sm border p-4 text-left transition-all hover:-translate-y-0.5"
              :style="draft.preset?.id === p.id
                ? { borderColor: C.primary, backgroundColor: `${C.primary}10` }
                : { borderColor: C.border, backgroundColor: C.surface }"
              @click="selectPreset(p)"
            >
              <div class="flex w-full items-center gap-3">
                <div
                  class="flex size-9 items-center justify-center rounded-sm"
                  :style="{
                    backgroundColor: toneBg(p.tone),
                    color: toneColor(p.tone),
                  }"
                >
                  <UIcon :name="p.icon" class="size-4" />
                </div>
                <div class="flex-1">
                  <div class="text-[14px] font-semibold" :style="{ color: C.text }">{{ p.label }}</div>
                  <div class="font-mono-tab text-[10px] uppercase tracking-[0.12em]" :style="{ color: C.textMuted }">
                    {{ p.type.replaceAll('_', ' ') }}
                  </div>
                </div>
                <UIcon
                  v-if="draft.preset?.id === p.id"
                  name="i-lucide-check"
                  class="size-4"
                  :style="{ color: C.primary }"
                />
              </div>
              <p class="text-[12px] leading-relaxed" :style="{ color: C.textMuted }">
                {{ p.description }}
              </p>
            </button>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              class="rounded-sm border px-4 py-2 font-mono-tab text-[11px] uppercase tracking-[0.15em]"
              :style="{ borderColor: C.border, color: C.text }"
              @click="closeWizard"
            >CANCELAR</button>
            <button
              type="button"
              :disabled="!draft.preset"
              class="rounded-sm px-4 py-2 font-mono-tab text-[11px] font-bold uppercase tracking-[0.15em] disabled:opacity-40"
              :style="{ backgroundColor: C.primary, color: C.background }"
              @click="goToStep(2)"
            >
              PRÓXIMO →
            </button>
          </div>
        </div>

        <!-- ============== STEP 2 — preset params ============== -->
        <div v-else-if="step === 2" class="flex flex-col gap-4 p-5 md:p-6">
          <div>
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
              [ PASSO 2 · PARÂMETROS · {{ draft.preset?.label.toUpperCase() }} ]
            </span>
            <h2 class="mt-1 text-[22px]" :style="{ color: C.text, fontFamily: F.display }">
              Ajuste os detalhes.
            </h2>
            <p class="mt-1 text-[12px]" :style="{ color: C.textMuted }">
              {{ draft.preset?.description }}
            </p>
          </div>

          <!-- Identificação (title + key sempre) -->
          <div class="grid gap-3 md:grid-cols-2">
            <label class="flex flex-col gap-1.5">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">TÍTULO</span>
              <input
                v-model="draft.title"
                type="text"
                required
                maxlength="160"
                class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
                :style="{ borderColor: C.border, color: C.text }"
                @input="autoKeyIfPristine"
              />
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
                KEY (identificador)
              </span>
              <input
                v-model="draft.key"
                type="text"
                required
                maxlength="80"
                class="rounded-sm border bg-transparent px-3 py-2 font-mono-tab text-[12px] outline-none"
                :style="{ borderColor: C.border, color: C.text }"
                @input="draft.keyTouched = true"
              />
            </label>
          </div>

          <!-- Preset-specific params -->
          <div v-if="draft.preset && draft.preset.params.length > 0" class="grid gap-3 md:grid-cols-2">
            <label
              v-for="p in draft.preset.params"
              :key="p.key"
              class="flex flex-col gap-1.5"
            >
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
                {{ p.label }}
              </span>
              <select
                v-if="p.kind === 'select'"
                :value="draft.params[p.key]"
                class="rounded-sm border px-3 py-2 text-[13px] outline-none"
                :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }"
                @change="setParam(p.key, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="o in p.options" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
              <input
                v-else-if="p.kind === 'number'"
                :value="draft.params[p.key]"
                type="number"
                :min="p.min"
                :max="p.max"
                :step="p.step || 1"
                class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
                :style="{ borderColor: C.border, color: C.text }"
                @input="setParam(p.key, Number(($event.target as HTMLInputElement).value))"
              />
              <input
                v-else
                :value="draft.params[p.key]"
                type="text"
                class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
                :style="{ borderColor: C.border, color: C.text }"
                @input="setParam(p.key, ($event.target as HTMLInputElement).value)"
              />
              <span v-if="p.help" class="text-[11px]" :style="{ color: C.textMuted }">{{ p.help }}</span>
            </label>
          </div>

          <!-- Custom preset: raw JSON config editor -->
          <div v-if="draft.preset?.id === 'custom'" class="flex flex-col gap-1.5">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
              CONFIG (JSON)
            </span>
            <textarea
              v-model="draft.customConfigText"
              rows="14"
              spellcheck="false"
              class="rounded-sm border bg-transparent px-3 py-2 font-mono-tab text-[12px] outline-none"
              :style="{
                borderColor: customJsonError ? C.negative : C.border,
                color: C.text,
                backgroundColor: C.surface,
              }"
            />
            <span v-if="customJsonError" class="font-mono-tab text-[10px]" :style="{ color: C.negative }">
              {{ customJsonError }}
            </span>
          </div>

          <!-- Navigation -->
          <div class="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              class="rounded-sm border px-4 py-2 font-mono-tab text-[11px] uppercase tracking-[0.15em]"
              :style="{ borderColor: C.border, color: C.text }"
              @click="goToStep(1)"
            >← VOLTAR</button>
            <button
              type="button"
              :disabled="!canLeaveStep2"
              class="rounded-sm px-4 py-2 font-mono-tab text-[11px] font-bold uppercase tracking-[0.15em] disabled:opacity-40"
              :style="{ backgroundColor: C.primary, color: C.background }"
              @click="goToStep(3)"
            >
              PRÓXIMO →
            </button>
          </div>
        </div>

        <!-- ============== STEP 3 — schedule + caption + integrations ============== -->
        <div v-else-if="step === 3" class="flex flex-col gap-5 p-5 md:p-6">
          <div>
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
              [ PASSO 3 · AGENDAMENTO E PUBLICAÇÃO ]
            </span>
            <h2 class="mt-1 text-[22px]" :style="{ color: C.text, fontFamily: F.display }">
              Quando, onde e como.
            </h2>
          </div>

          <!-- Schedule -->
          <div class="flex flex-col gap-2">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
              AGENDAMENTO
            </span>
            <AdminSchedulePicker v-model="draft.schedule" />
          </div>

          <!-- Integrations (hidden for custom with no scheduled_post) -->
          <div v-if="draft.preset?.type === 'scheduled_post'" class="flex flex-col gap-2">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
              INTEGRAÇÕES POSTIZ
            </span>
            <AdminIntegrationMultiSelect v-model="draft.integrations" />
          </div>

          <!-- Caption + chips (only when there's a caption to write) -->
          <div v-if="draft.preset && draft.preset.id !== 'custom'" class="grid gap-4 md:grid-cols-[1fr_280px]">
            <div class="flex flex-col gap-2">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
                CAPTION (suporta variáveis · clique nas pílulas ao lado)
              </span>
              <textarea
                ref="captionRef"
                v-model="draft.caption"
                rows="6"
                class="rounded-sm border bg-transparent px-3 py-2 text-[13px] leading-relaxed outline-none"
                :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }"
                placeholder="Ex: 🔥 {rank.leader.ticker} liderou com +{rank.leader.change} hoje · {date.today}"
              />
              <!-- Live preview -->
              <div
                v-if="renderedCaption"
                class="rounded-sm border px-3 py-2"
                :style="{ borderColor: C.border, backgroundColor: `${C.primary}08` }"
              >
                <div class="mb-1 font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                  PREVIEW (com valores atuais)
                </div>
                <div class="text-[13px] leading-relaxed" :style="{ color: C.text }">
                  {{ renderedCaption }}
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
                VARIÁVEIS DISPONÍVEIS
              </span>
              <div
                class="max-h-[420px] overflow-y-auto rounded-sm border p-3"
                :style="{ borderColor: C.border, backgroundColor: C.surface }"
              >
                <AdminChipPalette
                  :catalog="chipCatalog"
                  :values="chipValues"
                  :loading="chipsLoading"
                  @insert="insertChip"
                />
              </div>
            </div>
          </div>

          <!-- Enable on save -->
          <label class="flex items-center gap-2">
            <input v-model="draft.enabled" type="checkbox" class="size-4 accent-orange-500" />
            <span class="text-[13px]" :style="{ color: C.text }">
              Ativar a automação ao salvar
            </span>
          </label>

          <div v-if="wizardError" class="rounded-sm border px-3 py-2 text-[12px]" :style="{ borderColor: C.negative, color: C.negative }">
            {{ wizardError }}
          </div>

          <!-- Navigation -->
          <div class="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              class="rounded-sm border px-4 py-2 font-mono-tab text-[11px] uppercase tracking-[0.15em]"
              :style="{ borderColor: C.border, color: C.text }"
              @click="goToStep(2)"
            >← VOLTAR</button>
            <button
              type="button"
              :disabled="saving || !canSave"
              class="rounded-sm px-4 py-2 font-mono-tab text-[11px] font-bold uppercase tracking-[0.15em] disabled:opacity-40"
              :style="{ backgroundColor: C.primary, color: C.background }"
              @click="handleSave"
            >
              {{ saving ? 'SALVANDO…' : (wizardMode === 'create' ? 'CRIAR AUTOMAÇÃO' : 'SALVAR') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F } from '~/utils/redentiaCreativeColors'
import {
  AUTOMATION_PRESETS,
  findPreset,
  buildAutomationConfig,
  type AutomationPreset,
} from '~/utils/automationPresets'
import type { ISocialAutomation } from '~/services/socialAutomations'

definePageMeta({ middleware: ['admin-panel'] })

const service = useSocialAutomationsService()
const runtimeConfig = useRuntimeConfig()
const { authFetch } = useCustomFetch()

// ---------- List state ----------
const items = ref<ISocialAutomation[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const busyIds = reactive(new Set<number>())

async function refresh() {
  loading.value = true
  try {
    items.value = await service.list()
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Erro ao carregar automações.'
  } finally {
    loading.value = false
  }
}

// ---------- Wizard state ----------
const wizardOpen = ref(false)
const wizardMode = ref<'create' | 'edit'>('create')
const wizardError = ref<string | null>(null)
const step = ref<1 | 2 | 3>(1)
const saving = ref(false)

interface WizardDraft {
  id: number | null
  preset: AutomationPreset | null
  title: string
  key: string
  keyTouched: boolean
  params: Record<string, string | number>
  schedule: string | null
  caption: string
  integrations: string[]
  enabled: boolean
  customConfigText: string
}

const draft = reactive<WizardDraft>({
  id: null,
  preset: null,
  title: '',
  key: '',
  keyTouched: false,
  params: {},
  schedule: null,
  caption: '',
  integrations: [],
  enabled: false,
  customConfigText: '{\n  "integrations": [],\n  "content": { "type": "text", "value": "" }\n}',
})

const customJsonError = computed<string | null>(() => {
  if (draft.preset?.id !== 'custom') return null
  try {
    JSON.parse(draft.customConfigText)
    return null
  } catch (e: any) {
    return e.message?.slice(0, 80) || 'JSON inválido'
  }
})

const canLeaveStep2 = computed(() => {
  if (!draft.preset) return false
  if (!draft.title.trim() || !draft.key.trim()) return false
  if (draft.preset.id === 'custom' && customJsonError.value) return false
  return true
})

const canSave = computed(() => canLeaveStep2.value)

// ---------- Chip catalog (live preview) ----------
interface CatalogGroup { source: string; label: string; chips: Array<{ path: string; label: string }> }
const chipCatalog = ref<CatalogGroup[]>([])
const chipValues = ref<Record<string, string>>({})
const chipsLoading = ref(false)

async function fetchChips() {
  if (!draft.preset || draft.preset.id === 'custom') {
    chipCatalog.value = []
    chipValues.value = {}
    return
  }
  chipsLoading.value = true
  try {
    const sources = draft.preset.buildContextSources(draft.params)
    const url = `${runtimeConfig.public.apiBaseUrl as string}/admin/social-automations/preview-context?sources=${encodeURIComponent(JSON.stringify(sources))}`
    const r = await authFetch<{ catalog: CatalogGroup[]; values: Record<string, string> }>(url, { method: 'GET' }) as any
    const payload = r?.data ?? r
    chipCatalog.value = payload?.catalog ?? []
    chipValues.value = payload?.values ?? {}
  } catch (e) {
    chipCatalog.value = []
    chipValues.value = {}
  } finally {
    chipsLoading.value = false
  }
}

// Refresh the chip catalog whenever the preset or its params change.
watch(
  () => [draft.preset?.id, JSON.stringify(draft.params)],
  () => { if (wizardOpen.value) fetchChips() },
)

// ---------- Rendered-caption preview ----------
const renderedCaption = computed(() => {
  if (!draft.caption) return ''
  const vals = chipValues.value
  return draft.caption.replace(/\{([\w.]+)\}/g, (_, key) => vals[key] ?? `{${key}}`)
})

// ---------- Wizard lifecycle ----------
function openWizard(a: ISocialAutomation | null) {
  wizardError.value = null
  step.value = 1
  if (a) {
    wizardMode.value = 'edit'
    const cfg = (a.config || {}) as any
    const presetId = cfg.preset as string | undefined
    const preset = findPreset(presetId) || findPreset('custom')!
    Object.assign(draft, {
      id: a.id,
      preset,
      title: a.title,
      key: a.key,
      keyTouched: true,
      params: { ...(cfg.preset_params || seedParamsFor(preset)) },
      schedule: a.schedule,
      caption: (cfg.content?.value as string) || '',
      integrations: Array.isArray(cfg.integrations) ? cfg.integrations : [],
      enabled: a.enabled,
      customConfigText: JSON.stringify(cfg, null, 2),
    })
    // Open directly at step 2 when editing — the user already knows the preset.
    step.value = 2
  } else {
    wizardMode.value = 'create'
    Object.assign(draft, {
      id: null,
      preset: null,
      title: '',
      key: '',
      keyTouched: false,
      params: {},
      schedule: null,
      caption: '',
      integrations: [],
      enabled: false,
      customConfigText: '{\n  "integrations": [],\n  "content": { "type": "text", "value": "" }\n}',
    })
  }
  wizardOpen.value = true
}

function closeWizard() {
  wizardOpen.value = false
}

function selectPreset(p: AutomationPreset) {
  draft.preset = p
  draft.params = seedParamsFor(p)
  if (!draft.title) draft.title = p.label
  if (!draft.key || !draft.keyTouched) draft.key = p.id
  if (!draft.caption) draft.caption = p.defaultCaption
  if (!draft.schedule && p.defaultSchedule) draft.schedule = p.defaultSchedule.cron
}

function seedParamsFor(p: AutomationPreset): Record<string, string | number> {
  const out: Record<string, string | number> = {}
  for (const s of p.params) {
    out[s.key] = s.defaultValue
  }
  return out
}

function setParam(key: string, value: string | number) {
  draft.params = { ...draft.params, [key]: value }
}

function goToStep(n: 1 | 2 | 3) {
  step.value = n
  if (n === 3) fetchChips()
}

function autoKeyIfPristine() {
  if (draft.keyTouched) return
  draft.key = slugify(draft.title)
}

function slugify(s: string): string {
  return (s || '')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// ---------- Chip insertion ----------
const captionRef = ref<HTMLTextAreaElement | null>(null)
function insertChip(placeholder: string) {
  const el = captionRef.value
  if (!el) {
    draft.caption = (draft.caption || '') + placeholder
    return
  }
  const start = el.selectionStart ?? draft.caption.length
  const end = el.selectionEnd ?? draft.caption.length
  draft.caption = draft.caption.slice(0, start) + placeholder + draft.caption.slice(end)
  nextTick(() => {
    el.focus()
    const pos = start + placeholder.length
    el.setSelectionRange(pos, pos)
  })
}

// ---------- Save ----------
async function handleSave() {
  if (!draft.preset || !canSave.value) return
  wizardError.value = null
  saving.value = true
  try {
    let config: Record<string, unknown>
    if (draft.preset.id === 'custom') {
      config = JSON.parse(draft.customConfigText)
    } else {
      config = buildAutomationConfig({
        preset: draft.preset,
        params: draft.params,
        integrations: draft.integrations,
        caption: draft.caption,
        delayMinutes: null,
      })
    }

    const body = {
      key: draft.key,
      title: draft.title,
      type: draft.preset.type,
      enabled: draft.enabled,
      schedule: draft.schedule || null,
      config,
    }

    if (wizardMode.value === 'create') {
      await service.create(body)
    } else if (draft.id) {
      await service.update(draft.id, body)
    }

    closeWizard()
    await refresh()
  } catch (e: any) {
    wizardError.value = e?.data?.message
      || formatValidationErrors(e?.data?.errors)
      || e?.message
      || 'Erro ao salvar.'
  } finally {
    saving.value = false
  }
}

function formatValidationErrors(errs: any): string | null {
  if (!errs) return null
  return Object.values(errs).flat().join(' · ')
}

// ---------- Row actions ----------
async function handleToggle(a: ISocialAutomation) {
  busyIds.add(a.id)
  try {
    const updated = await service.toggle(a.id)
    Object.assign(a, updated)
  } catch (e: any) {
    error.value = e?.message || 'Erro ao alternar.'
  } finally {
    busyIds.delete(a.id)
  }
}

async function handleRunNow(a: ISocialAutomation) {
  busyIds.add(a.id)
  try {
    await service.runNow(a.id)
    setTimeout(async () => {
      try {
        const updated = await service.show(a.id)
        Object.assign(a, updated)
      } catch {}
    }, 1500)
  } catch (e: any) {
    error.value = e?.message || 'Erro ao disparar execução.'
  } finally {
    busyIds.delete(a.id)
  }
}

async function handleDelete(a: ISocialAutomation) {
  if (!confirm(`Deletar a automação "${a.title}"?`)) return
  busyIds.add(a.id)
  try {
    await service.remove(a.id)
    items.value = items.value.filter(i => i.id !== a.id)
  } catch (e: any) {
    error.value = e?.message || 'Erro ao deletar.'
  } finally {
    busyIds.delete(a.id)
  }
}

// ---------- Helpers for list rendering ----------
function presetLabelOf(a: ISocialAutomation): string {
  const cfg = (a.config || {}) as any
  const preset = findPreset(cfg?.preset)
  if (preset) return preset.label.toUpperCase()
  return a.type.replaceAll('_', ' ').toUpperCase()
}

function humanizedScheduleOf(a: ISocialAutomation): string | null {
  if (!a.schedule) return null
  const parts = a.schedule.trim().split(/\s+/)
  if (parts.length !== 5) return `cron: ${a.schedule}`
  const [mm, hh, , , dow] = parts
  const everyMatch = mm.match(/^\*\/(\d+)$/)
  if (everyMatch && hh === '*' && dow === '*') return `a cada ${everyMatch[1]} min`
  const m = Number(mm), h = Number(hh)
  if (Number.isNaN(m) || Number.isNaN(h)) return `cron: ${a.schedule}`
  const brtH = ((h - 3) + 24) % 24
  const time = `${String(brtH).padStart(2, '0')}:${String(m).padStart(2, '0')} BRT`
  if (dow === '*') return `todo dia às ${time}`
  if (dow === '1-5') return `dias úteis às ${time}`
  return `cron: ${a.schedule}`
}

function statusColor(s: string): string {
  if (s === 'dispatched' || s === 'ok') return C.positive
  if (s === 'stubbed') return C.primary
  if (s === 'error') return C.negative
  return C.textMuted
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function toneBg(tone: AutomationPreset['tone']): string {
  if (tone === 'positive') return `${C.positive}20`
  if (tone === 'negative') return `${C.negative}20`
  return `${C.primary}18`
}
function toneColor(tone: AutomationPreset['tone']): string {
  if (tone === 'positive') return C.positive
  if (tone === 'negative') return C.negative
  return C.primary
}

onMounted(refresh)
</script>

<style scoped>
.font-mono-tab {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-feature-settings: 'tnum' 1;
}
textarea:focus, input:focus, select:focus { outline: none !important; }
</style>

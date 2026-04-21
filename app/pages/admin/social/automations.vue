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
            Escolha um preset, preencha o formulário visual e o agendador faz o resto.
            Nada de JSON cru, nada de cron mental.
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

    <!-- ==================== WIZARD OVERLAY ==================== -->
    <div
      v-if="wizardOpen"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 md:p-6"
      style="background-color: rgba(0,0,0,0.75); backdrop-filter: blur(4px)"
      @click.self="closeWizard"
    >
      <div
        class="my-auto flex w-full max-w-5xl flex-col rounded-sm border"
        :style="{ borderColor: C.border, backgroundColor: C.background }"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b px-5 py-4" :style="{ borderColor: C.border }">
          <div class="flex items-center gap-3">
            <span class="font-mono-tab text-[11px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
              [{{ wizardMode === 'create' ? 'NOVA AUTOMAÇÃO' : 'EDITAR AUTOMAÇÃO' }}]
            </span>
            <span
              v-if="draft.preset"
              class="rounded-sm border px-2 py-0.5 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
              :style="{ borderColor: C.border, color: C.textMuted }"
            >
              {{ draft.preset.label }}
            </span>
          </div>
          <button type="button" class="text-[14px]" :style="{ color: C.textMuted }" @click="closeWizard">✕</button>
        </div>

        <!-- =============== STEP 1 — choose preset =============== -->
        <div v-if="step === 1" class="flex flex-col gap-5 p-5 md:p-6">
          <div>
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
              [ PASSO 1 DE 2 ]
            </span>
            <h2 class="mt-1 text-[24px]" :style="{ color: C.text, fontFamily: F.display }">
              O que essa automação vai postar?
            </h2>
            <p class="mt-1 text-[13px]" :style="{ color: C.textMuted }">
              Cada opção vem pré-configurada com dados reais, horário sugerido e variáveis. Você ajusta tudo no próximo passo.
            </p>
          </div>
          <div class="grid gap-3 md:grid-cols-2">
            <button
              v-for="p in AUTOMATION_PRESETS"
              :key="p.id"
              type="button"
              class="group flex flex-col items-start gap-3 rounded-sm border p-4 text-left transition-all hover:-translate-y-0.5"
              :style="draft.preset?.id === p.id
                ? { borderColor: C.primary, backgroundColor: `${C.primary}10` }
                : { borderColor: C.border, backgroundColor: C.surface }"
              @click="selectPreset(p)"
            >
              <div class="flex w-full items-start gap-3">
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-sm"
                  :style="{ backgroundColor: toneBg(p.tone), color: toneColor(p.tone) }"
                >
                  <UIcon :name="p.icon" class="size-4" />
                </div>
                <div class="flex-1">
                  <div class="text-[14px] font-semibold leading-tight" :style="{ color: C.text }">{{ p.label }}</div>
                  <div class="mt-1 flex flex-wrap items-center gap-1.5">
                    <span
                      class="rounded-sm border px-1.5 py-0.5 font-mono-tab text-[9px] uppercase tracking-[0.12em]"
                      :style="{ borderColor: C.border, color: C.textMuted }"
                    >
                      {{ mediaBadge(p) }}
                    </span>
                    <span
                      v-if="p.defaultSchedule"
                      class="rounded-sm border px-1.5 py-0.5 font-mono-tab text-[9px] uppercase tracking-[0.12em]"
                      :style="{ borderColor: C.border, color: C.textMuted }"
                    >
                      {{ p.defaultSchedule.humanized }}
                    </span>
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
          <div class="flex items-center justify-end gap-3 pt-1">
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
              CONFIGURAR →
            </button>
          </div>
        </div>

        <!-- =============== STEP 2 — single-page config =============== -->
        <div v-else class="grid grid-cols-1 md:grid-cols-[1fr_320px]">
          <!-- MAIN FORM (scrollable) -->
          <div class="flex max-h-[80vh] flex-col gap-4 overflow-y-auto p-5 md:max-h-[85vh] md:p-6">
            <button
              type="button"
              class="inline-flex w-fit items-center gap-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-opacity hover:opacity-70"
              :style="{ color: C.textMuted }"
              @click="goToStep(1)"
            >
              <UIcon name="i-lucide-chevron-left" class="size-3" />
              TROCAR PRESET
            </button>

            <!-- === Identification === -->
            <section
              class="flex flex-col gap-3 rounded-sm border p-4"
              :style="{ borderColor: C.border, backgroundColor: C.surface }"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-tag" class="size-3.5" :style="{ color: C.primary }" />
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                  [ IDENTIFICAÇÃO ]
                </span>
              </div>
              <label class="flex flex-col gap-1.5">
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
                  Nome interno
                </span>
                <input
                  v-model="draft.title"
                  type="text"
                  required
                  maxlength="160"
                  class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
                  :style="{ borderColor: C.border, color: C.text }"
                  placeholder="Ex: Ranking diário das altas — 18h"
                />
                <span class="font-mono-tab text-[10px]" :style="{ color: C.textMuted }">
                  Só aparece pra você nessa lista. O chip gerado pro banco é <code>{{ draft.key || '—' }}</code>.
                </span>
              </label>
            </section>

            <!-- === Content fields (image title/label) === -->
            <section
              v-if="contentParams.length > 0"
              class="flex flex-col gap-3 rounded-sm border p-4"
              :style="{ borderColor: C.border, backgroundColor: C.surface }"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-image" class="size-3.5" :style="{ color: C.primary }" />
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                  [ CONTEÚDO DA IMAGEM ]
                </span>
              </div>
              <div class="grid gap-3 md:grid-cols-2">
                <label
                  v-for="p in contentParams"
                  :key="p.key"
                  class="flex flex-col gap-1.5 md:col-span-2"
                >
                  <span class="flex items-center gap-1.5 font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
                    {{ p.label }}
                    <span
                      v-if="p.supportsChips"
                      class="rounded-sm border px-1 py-0.5 text-[9px]"
                      :style="{ borderColor: C.border, color: C.primary }"
                      title="Este campo aceita variáveis. Clique nas pílulas do painel direito pra inserir."
                    >{CHIPS}</span>
                  </span>
                  <input
                    :value="draft.params[p.key]"
                    :data-param-key="p.key"
                    :placeholder="p.placeholder || ''"
                    type="text"
                    class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
                    :style="{ borderColor: C.border, color: C.text }"
                    @focus="onFieldFocus($event.target as HTMLInputElement)"
                    @input="setParam(p.key, ($event.target as HTMLInputElement).value)"
                  />
                  <span v-if="p.help" class="text-[11px] leading-snug" :style="{ color: C.textMuted }">{{ p.help }}</span>
                </label>
              </div>
            </section>

            <!-- === Data params (top_n, volume, years, etc.) === -->
            <section
              v-if="dataParams.length > 0"
              class="flex flex-col gap-3 rounded-sm border p-4"
              :style="{ borderColor: C.border, backgroundColor: C.surface }"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-sliders-horizontal" class="size-3.5" :style="{ color: C.primary }" />
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                  [ DADOS E FILTROS ]
                </span>
              </div>
              <div class="grid gap-3 md:grid-cols-2">
                <label
                  v-for="p in dataParams"
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
                    :style="{ borderColor: C.border, color: C.text, backgroundColor: C.background }"
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
                  <span v-if="p.help" class="text-[11px] leading-snug" :style="{ color: C.textMuted }">{{ p.help }}</span>
                </label>
              </div>
            </section>

            <!-- === Post caption === -->
            <section
              class="flex flex-col gap-3 rounded-sm border p-4"
              :style="{ borderColor: C.border, backgroundColor: C.surface }"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-message-square-text" class="size-3.5" :style="{ color: C.primary }" />
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                  [ LEGENDA DO POST ]
                </span>
              </div>
              <textarea
                ref="captionRef"
                v-model="draft.caption"
                rows="6"
                class="rounded-sm border bg-transparent px-3 py-2 text-[13px] leading-relaxed outline-none"
                :style="{ borderColor: C.border, color: C.text, backgroundColor: C.background }"
                placeholder="Ex: 🔥 {rank.leader.ticker} liderou com +{rank.leader.change} hoje · {date.today}"
                @focus="onFieldFocus($event.target as HTMLTextAreaElement)"
              />
              <div
                v-if="renderedCaption"
                class="rounded-sm border px-3 py-2"
                :style="{ borderColor: C.border, backgroundColor: `${C.primary}08` }"
              >
                <div class="mb-1 font-mono-tab text-[9px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                  PREVIEW · valores atuais
                </div>
                <div class="whitespace-pre-wrap text-[13px] leading-relaxed" :style="{ color: C.text }">
                  {{ renderedCaption }}
                </div>
              </div>
            </section>

            <!-- === Schedule === -->
            <section
              class="flex flex-col gap-3 rounded-sm border p-4"
              :style="{ borderColor: C.border, backgroundColor: C.surface }"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-calendar-clock" class="size-3.5" :style="{ color: C.primary }" />
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                  [ AGENDAMENTO ]
                </span>
              </div>
              <AdminSchedulePicker v-model="draft.schedule" />
            </section>

            <!-- === Publish destinations === -->
            <section
              v-if="draft.preset?.type === 'scheduled_post'"
              class="flex flex-col gap-3 rounded-sm border p-4"
              :style="{ borderColor: C.border, backgroundColor: C.surface }"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-send" class="size-3.5" :style="{ color: C.primary }" />
                <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                  [ ONDE PUBLICAR ]
                </span>
              </div>
              <AdminIntegrationMultiSelect v-model="draft.integrations" />
            </section>

            <!-- === Image preview link === -->
            <section
              v-if="draft.preset?.hasMedia && previewMediaUrl"
              class="flex flex-wrap items-center justify-between gap-2 rounded-sm border p-4"
              :style="{ borderColor: C.border, backgroundColor: `${C.primary}08` }"
            >
              <div class="flex items-center gap-2 text-[12px]" :style="{ color: C.text }">
                <UIcon name="i-lucide-eye" class="size-3.5" :style="{ color: C.primary }" />
                <span>Confira como a imagem vai sair antes de salvar.</span>
              </div>
              <a
                :href="previewMediaUrl"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-opacity hover:opacity-80"
                :style="{ borderColor: C.primary, color: C.primary }"
              >
                <UIcon name="i-lucide-external-link" class="size-3" />
                ABRIR PRÉVIA
              </a>
            </section>

            <!-- === Activate toggle === -->
            <label
              class="flex items-center gap-2 rounded-sm border p-4"
              :style="{ borderColor: C.border, backgroundColor: C.surface }"
            >
              <input v-model="draft.enabled" type="checkbox" class="size-4 accent-orange-500" />
              <span class="text-[13px]" :style="{ color: C.text }">
                Ativar a automação ao salvar (vai rodar no próximo horário agendado)
              </span>
            </label>

            <div v-if="wizardError" class="rounded-sm border px-3 py-2 text-[12px]" :style="{ borderColor: C.negative, color: C.negative }">
              {{ wizardError }}
            </div>
          </div>

          <!-- STICKY SIDEBAR (chip palette) -->
          <aside
            class="flex max-h-[80vh] flex-col gap-3 overflow-y-auto border-t p-5 md:max-h-[85vh] md:border-l md:border-t-0 md:p-5"
            :style="{ borderColor: C.border, backgroundColor: C.tertiary }"
          >
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-braces" class="size-3.5" :style="{ color: C.primary }" />
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
                [ VARIÁVEIS ]
              </span>
            </div>
            <p class="text-[11px] leading-snug" :style="{ color: C.textMuted }">
              Clique numa variável pra inserir no campo onde o cursor estiver
              (título da imagem, legenda da imagem ou legenda do post).
            </p>

            <!-- Error / retry state -->
            <div
              v-if="chipsError"
              class="rounded-sm border p-3 text-[11px]"
              :style="{ borderColor: C.negative, color: C.negative }"
            >
              {{ chipsError }}
              <button
                type="button"
                class="mt-2 inline-flex items-center gap-1 font-mono-tab text-[10px] uppercase tracking-[0.15em] transition-opacity hover:opacity-70"
                :style="{ color: C.primary }"
                @click="fetchChips()"
              >
                <UIcon name="i-lucide-refresh-cw" class="size-3" />
                TENTAR DE NOVO
              </button>
            </div>

            <AdminChipPalette
              v-else
              :catalog="chipCatalog"
              :values="chipValues"
              :loading="chipsLoading"
              @insert="insertChip"
            />
          </aside>
        </div>

        <!-- Footer (step 2) -->
        <div
          v-if="step === 2"
          class="flex items-center justify-between gap-3 border-t px-5 py-4"
          :style="{ borderColor: C.border }"
        >
          <button
            type="button"
            class="rounded-sm border px-4 py-2 font-mono-tab text-[11px] uppercase tracking-[0.15em]"
            :style="{ borderColor: C.border, color: C.text }"
            @click="closeWizard"
          >CANCELAR</button>
          <button
            type="button"
            :disabled="saving || !canSave"
            class="rounded-sm px-5 py-2 font-mono-tab text-[11px] font-bold uppercase tracking-[0.15em] disabled:opacity-40"
            :style="{ backgroundColor: C.primary, color: C.background }"
            @click="handleSave"
          >
            {{ saving ? 'SALVANDO…' : (wizardMode === 'create' ? 'CRIAR AUTOMAÇÃO' : 'SALVAR' ) }}
          </button>
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
  inferPresetFromConfig,
  buildAutomationConfig,
  type AutomationPreset,
  type PresetParamSchema,
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
const step = ref<1 | 2>(1)
const saving = ref(false)

interface WizardDraft {
  id: number | null
  preset: AutomationPreset | null
  title: string
  key: string
  params: Record<string, string | number>
  schedule: string | null
  caption: string
  integrations: string[]
  enabled: boolean
  // Extras from legacy rows (no `preset`) kept verbatim so the wizard
  // doesn't drop fields it doesn't render.
  legacyExtras: Record<string, unknown>
}

const draft = reactive<WizardDraft>({
  id: null,
  preset: null,
  title: '',
  key: '',
  params: {},
  schedule: null,
  caption: '',
  integrations: [],
  enabled: false,
  legacyExtras: {},
})

// Split preset params into content/data buckets for the two sections.
const contentParams = computed<PresetParamSchema[]>(() =>
  (draft.preset?.params ?? []).filter(p => p.group === 'content'),
)
const dataParams = computed<PresetParamSchema[]>(() =>
  (draft.preset?.params ?? []).filter(p => p.group === 'data'),
)

const canSave = computed(() => !!draft.preset && draft.title.trim() !== '' && draft.key.trim() !== '')

// Live preview URL — mirrors what buildMedia() generates so "Abrir prévia"
// opens the exact page the backend will screenshot at run-time.
const previewMediaUrl = computed<string | null>(() => {
  if (!draft.preset || !draft.preset.hasMedia) return null
  const media = draft.preset.buildMedia(draft.params)
  return media[0]?.source ?? null
})

// ---------- Chip catalog ----------
interface CatalogGroup { source: string; label: string; chips: Array<{ path: string; label: string; example?: string; group?: string }> }
const chipCatalog = ref<CatalogGroup[]>([])
const chipValues = ref<Record<string, string>>({})
const chipsLoading = ref(false)
const chipsError = ref<string | null>(null)

async function fetchChips() {
  if (!draft.preset) {
    chipCatalog.value = []
    chipValues.value = {}
    return
  }
  chipsLoading.value = true
  chipsError.value = null
  try {
    const sources = draft.preset.buildContextSources(draft.params)
    const url = `${runtimeConfig.public.apiBaseUrl as string}/admin/social-automations/preview-context?sources=${encodeURIComponent(JSON.stringify(sources))}`
    const r = await authFetch<any>(url, { method: 'GET' }) as any
    // useCustomFetch's type claims { data: T } but the underlying $fetch
    // passes through whatever the server returned. Our endpoint returns
    // `{catalog, values}` directly with no wrap — support both shapes.
    const payload = (r && typeof r === 'object' && ('catalog' in r || 'values' in r))
      ? r
      : (r?.data ?? {})
    chipCatalog.value = Array.isArray(payload?.catalog) ? payload.catalog : []
    chipValues.value = (payload?.values && typeof payload.values === 'object') ? payload.values : {}
  } catch (e: any) {
    chipCatalog.value = []
    chipValues.value = {}
    chipsError.value = e?.data?.message || e?.message || 'Não rolou carregar as variáveis.'
  } finally {
    chipsLoading.value = false
  }
}

// Refetch on preset change or when data params that affect source definitions change.
// Content-only params (image_title, image_label) don't change the source shape,
// so we deliberately exclude them to avoid a round-trip on every keystroke.
watch(
  () => [
    draft.preset?.id,
    draft.params?.top_n,
    draft.params?.limit,
    draft.params?.per_side,
    draft.params?.side,
    draft.params?.min_volume,
  ],
  () => { if (wizardOpen.value && draft.preset) fetchChips() },
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
  chipsError.value = null
  chipCatalog.value = []
  chipValues.value = {}
  if (a) {
    wizardMode.value = 'edit'
    const cfg = (a.config || {}) as any
    const presetId = cfg.preset as string | undefined
    // Legacy automations (created before the preset system) have no
    // `config.preset` marker. Try to infer from the media URL shape —
    // ranking, growth-race, treemap — before falling back to text-only.
    const explicit = findPreset(presetId)
    const inferred = !explicit ? inferPresetFromConfig(cfg) : null
    const preset = explicit || inferred?.preset || findPreset('text-only')!
    const params = cfg.preset_params ?? inferred?.params ?? seedParamsFor(preset)
    const { preset: _p, preset_params: _pp, integrations: _i, context_sources: _cs, content: _c, delay_minutes: _d, ...extras } = cfg
    Object.assign(draft, {
      id: a.id,
      preset,
      title: a.title,
      key: a.key,
      params: { ...seedParamsFor(preset), ...params },
      schedule: a.schedule,
      caption: (cfg.content?.value as string) || '',
      integrations: Array.isArray(cfg.integrations) ? cfg.integrations : [],
      enabled: a.enabled,
      legacyExtras: extras,
    })
    step.value = 2
    wizardOpen.value = true
    // Kick off the chip fetch right away — no need to wait for user interaction.
    nextTick(() => fetchChips())
  } else {
    wizardMode.value = 'create'
    Object.assign(draft, {
      id: null,
      preset: null,
      title: '',
      key: '',
      params: {},
      schedule: null,
      caption: '',
      integrations: [],
      enabled: false,
      legacyExtras: {},
    })
    step.value = 1
    wizardOpen.value = true
  }
}

function closeWizard() { wizardOpen.value = false }

function selectPreset(p: AutomationPreset) {
  draft.preset = p
  draft.params = seedParamsFor(p)
  // Only seed default title/caption/schedule when we're still on a blank
  // draft — avoid clobbering edits when the admin hops between presets.
  if (!draft.title) draft.title = p.label
  if (!draft.caption) draft.caption = p.defaultCaption
  if (!draft.schedule && p.defaultSchedule) draft.schedule = p.defaultSchedule.cron
  draft.key = generateKey(draft.title, p.id)
}

function seedParamsFor(p: AutomationPreset): Record<string, string | number> {
  const out: Record<string, string | number> = {}
  for (const s of p.params) out[s.key] = s.defaultValue
  return out
}

function setParam(key: string, value: string | number) {
  draft.params = { ...draft.params, [key]: value }
}

function goToStep(n: 1 | 2) {
  step.value = n
  if (n === 2) nextTick(() => fetchChips())
}

// Regenerate key whenever the user edits the title (create mode only;
// editing keeps the existing key so references don't break).
watch(() => draft.title, (title) => {
  if (wizardMode.value !== 'create' || !draft.preset) return
  draft.key = generateKey(title, draft.preset.id)
})

// key generation: slugify the title + short stable suffix so two
// automations of the same preset never collide. Suffix is deterministic
// from (title + preset) so hitting save twice on the same draft keeps
// the same key — prevents accidental "new row" on retry.
function generateKey(title: string, presetId: string): string {
  const base = slugify(title || presetId) || presetId
  const hash = hashString(`${base}::${presetId}`).toString(36).slice(0, 4)
  return (base + '-' + hash).slice(0, 80)
}

function slugify(s: string): string {
  return (s || '')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// ---------- Chip insertion ----------
const captionRef = ref<HTMLTextAreaElement | null>(null)
const lastFocusedField = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)

function onFieldFocus(el: HTMLInputElement | HTMLTextAreaElement) { lastFocusedField.value = el }

function insertChip(placeholder: string) {
  const el = lastFocusedField.value ?? captionRef.value
  if (!el) {
    draft.caption = (draft.caption || '') + placeholder
    return
  }
  const start = el.selectionStart ?? (el.value?.length ?? 0)
  const end = el.selectionEnd ?? (el.value?.length ?? 0)
  const current = el.value ?? ''
  const next = current.slice(0, start) + placeholder + current.slice(end)
  const paramKey = el.getAttribute?.('data-param-key') ?? null
  if (paramKey) setParam(paramKey, next)
  else draft.caption = next
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
    const built = buildAutomationConfig({
      preset: draft.preset,
      params: draft.params,
      integrations: draft.integrations,
      caption: draft.caption,
      delayMinutes: null,
    })
    const config = { ...draft.legacyExtras, ...built }

    const body = {
      key: draft.key,
      title: draft.title,
      type: draft.preset.type,
      enabled: draft.enabled,
      schedule: draft.schedule || null,
      config,
    }

    if (wizardMode.value === 'create') await service.create(body)
    else if (draft.id) await service.update(draft.id, body)

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
      try { const updated = await service.show(a.id); Object.assign(a, updated) } catch {}
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

// ---------- Row display helpers ----------
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
  // Laravel scheduler runs in APP_TIMEZONE (America/Sao_Paulo), so
  // the hour in the cron expression is already BRT — no conversion.
  const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} BRT`
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

function mediaBadge(p: AutomationPreset): string {
  if (!p.hasMedia) return 'TEXTO'
  const firstMedia = p.buildMedia(seedParamsFor(p))[0]
  return firstMedia?.kind === 'video' ? 'VÍDEO' : 'IMAGEM'
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

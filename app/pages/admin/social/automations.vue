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
            Cada automação tem um tipo (post agendado, auto-reply de ticker, comentário em perfil monitorado),
            uma expressão cron e um JSON de config. Toggle pra ativar, "Rodar agora" pra disparar manualmente.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-sm px-4 py-2.5 font-mono-tab text-[11px] font-bold uppercase tracking-[0.15em] transition-all hover:opacity-90"
          :style="{ backgroundColor: C.primary, color: C.background }"
          @click="openEditor(null)"
        >
          <UIcon name="i-lucide-plus" class="size-4" />
          NOVA AUTOMAÇÃO
        </button>
      </header>

      <!-- Error box -->
      <div v-if="error" class="rounded-sm border px-4 py-3 text-[13px]" :style="{ borderColor: C.negative, color: C.negative }">
        {{ error }}
      </div>

      <!-- Loading -->
      <div v-if="loading" class="py-10 text-center" :style="{ color: C.textMuted }">
        <UIcon name="i-lucide-loader-2" class="size-5 animate-spin" />
      </div>

      <!-- Empty state -->
      <div
        v-else-if="items.length === 0"
        class="rounded-sm border p-8 text-center text-[13px]"
        :style="{ borderColor: C.border, color: C.textMuted }"
      >
        Nenhuma automação cadastrada.
        <button type="button" class="underline" :style="{ color: C.primary }" @click="openEditor(null)">
          Criar a primeira
        </button>.
      </div>

      <!-- List -->
      <section v-else class="flex flex-col gap-3">
        <article
          v-for="a in items"
          :key="a.id"
          class="rounded-sm border p-5 transition-colors hover:brightness-110"
          :style="{ borderColor: C.border, backgroundColor: C.surface }"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3">
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
                  {{ a.type.replaceAll('_', ' ') }}
                </span>
                <span v-if="a.schedule" class="font-mono-tab text-[10px]" :style="{ color: C.textMuted }">
                  cron: {{ a.schedule }}
                </span>
              </div>
              <h3 class="mt-2 text-[18px] font-semibold" :style="{ color: C.text }">{{ a.title }}</h3>
              <div class="mt-1 font-mono-tab text-[11px]" :style="{ color: C.textMuted }">
                key: {{ a.key }}
              </div>
              <div v-if="a.last_run_at" class="mt-3 flex flex-wrap gap-4 font-mono-tab text-[10px] uppercase tracking-[0.15em]" :style="{ color: C.textMuted }">
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
                @click="openEditor(a)"
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

    <!-- Editor modal -->
    <div
      v-if="editorOpen"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-6"
      style="background-color: rgba(0,0,0,0.7)"
      @click.self="closeEditor"
    >
      <div
        class="my-auto w-full max-w-2xl rounded-sm border p-6"
        :style="{ borderColor: C.border, backgroundColor: C.background }"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-mono-tab text-[11px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
            [{{ editorMode === 'create' ? 'CRIAR' : 'EDITAR' }} AUTOMAÇÃO]
          </h2>
          <button type="button" class="font-mono-tab text-[12px]" :style="{ color: C.textMuted }" @click="closeEditor">✕</button>
        </div>
        <form class="flex flex-col gap-4" @submit.prevent="handleSave">
          <div class="grid gap-3 md:grid-cols-2">
            <label class="flex flex-col gap-1.5">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">KEY</span>
              <input
                v-model="draft.key"
                type="text"
                required
                maxlength="80"
                class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
                :style="{ borderColor: C.border, color: C.text }"
              />
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">TIPO</span>
              <select
                v-model="draft.type"
                class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
                :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }"
              >
                <option value="scheduled_post">scheduled_post</option>
                <option value="ticker_auto_reply">ticker_auto_reply</option>
                <option value="profile_auto_comment">profile_auto_comment</option>
              </select>
            </label>
            <label class="flex flex-col gap-1.5 md:col-span-2">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">TÍTULO</span>
              <input
                v-model="draft.title"
                type="text"
                required
                maxlength="160"
                class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
                :style="{ borderColor: C.border, color: C.text }"
              />
            </label>
            <label class="flex flex-col gap-1.5 md:col-span-2">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
                SCHEDULE (cron expr, opcional)
              </span>
              <input
                v-model="draft.schedule"
                type="text"
                placeholder="0 21 * * * (todo dia 18h BRT)"
                class="rounded-sm border bg-transparent px-3 py-2 font-mono-tab text-[12px] outline-none"
                :style="{ borderColor: C.border, color: C.text }"
              />
            </label>
            <label class="flex items-center gap-2 md:col-span-2">
              <input v-model="draft.enabled" type="checkbox" class="size-4" />
              <span class="text-[13px]" :style="{ color: C.text }">Ativar ao salvar</span>
            </label>
          </div>
          <label class="flex flex-col gap-1.5">
            <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">CONFIG (JSON)</span>
            <textarea
              v-model="draft.configText"
              rows="12"
              class="rounded-sm border bg-transparent px-3 py-2 font-mono-tab text-[12px] outline-none"
              :style="{ borderColor: draft.configError ? C.negative : C.border, color: C.text, backgroundColor: C.surface }"
              spellcheck="false"
              @input="validateDraftConfig"
            />
            <span v-if="draft.configError" class="font-mono-tab text-[10px]" :style="{ color: C.negative }">
              {{ draft.configError }}
            </span>
          </label>
          <div v-if="editorError" class="rounded-sm border px-3 py-2 text-[12px]" :style="{ borderColor: C.negative, color: C.negative }">
            {{ editorError }}
          </div>
          <div class="flex items-center justify-end gap-3">
            <button
              type="button"
              class="rounded-sm border px-4 py-2 font-mono-tab text-[11px] uppercase tracking-[0.15em]"
              :style="{ borderColor: C.border, color: C.text }"
              @click="closeEditor"
            >CANCELAR</button>
            <button
              type="submit"
              :disabled="saving || !!draft.configError"
              class="rounded-sm px-4 py-2 font-mono-tab text-[11px] font-bold uppercase tracking-[0.15em] disabled:opacity-40"
              :style="{ backgroundColor: C.primary, color: C.background }"
            >
              {{ saving ? 'SALVANDO…' : (editorMode === 'create' ? 'CRIAR' : 'SALVAR') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F } from '~/utils/redentiaCreativeColors'
import type { ISocialAutomation } from '~/services/socialAutomations'

definePageMeta({ middleware: ['admin-panel'] })

const service = useSocialAutomationsService()

const items = ref<ISocialAutomation[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const busyIds = reactive(new Set<number>())

const editorOpen = ref(false)
const editorMode = ref<'create' | 'edit'>('create')
const editorError = ref<string | null>(null)
const saving = ref(false)
const draft = reactive({
  id: null as number | null,
  key: '',
  title: '',
  type: 'scheduled_post' as ISocialAutomation['type'],
  enabled: false,
  schedule: '' as string,
  configText: '{}',
  configError: null as string | null,
})

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

function openEditor(a: ISocialAutomation | null) {
  editorError.value = null
  if (a) {
    editorMode.value = 'edit'
    draft.id = a.id
    draft.key = a.key
    draft.title = a.title
    draft.type = a.type
    draft.enabled = a.enabled
    draft.schedule = a.schedule || ''
    draft.configText = JSON.stringify(a.config || {}, null, 2)
  } else {
    editorMode.value = 'create'
    draft.id = null
    draft.key = ''
    draft.title = ''
    draft.type = 'scheduled_post'
    draft.enabled = false
    draft.schedule = ''
    draft.configText = '{\n  "integrations": [],\n  "content": { "type": "text", "value": "" }\n}'
  }
  draft.configError = null
  editorOpen.value = true
}

function closeEditor() {
  editorOpen.value = false
}

function validateDraftConfig() {
  try {
    JSON.parse(draft.configText)
    draft.configError = null
  } catch (e: any) {
    draft.configError = e.message?.slice(0, 80) || 'JSON inválido'
  }
}

async function handleSave() {
  validateDraftConfig()
  if (draft.configError) return
  saving.value = true
  editorError.value = null
  try {
    const body = {
      key: draft.key,
      title: draft.title,
      type: draft.type,
      enabled: draft.enabled,
      schedule: draft.schedule || null,
      config: JSON.parse(draft.configText),
    }
    if (editorMode.value === 'create') {
      await service.create(body)
    } else if (draft.id) {
      await service.update(draft.id, body)
    }
    closeEditor()
    await refresh()
  } catch (e: any) {
    editorError.value = e?.data?.message || formatValidationErrors(e?.data?.errors) || e?.message || 'Erro ao salvar.'
  } finally {
    saving.value = false
  }
}

function formatValidationErrors(errs: any): string | null {
  if (!errs) return null
  return Object.values(errs).flat().join(' · ')
}

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
    // Re-fetch the single automation a bit later to surface last_run_at.
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

onMounted(refresh)
</script>

<style scoped>
.font-mono-tab { font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace; font-feature-settings: 'tnum' 1; }
textarea:focus, input:focus { outline: none !important; }
</style>

<template>
  <NuxtLayout name="admin-panel">
    <div class="mx-auto flex max-w-5xl flex-col gap-6">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
            [SOCIAL · PERFIS MONITORADOS]
          </span>
          <h1 class="mt-2 text-[28px] leading-tight md:text-[36px]" :style="{ color: C.text, fontFamily: F.display }">
            Quem a gente fica de olho.
          </h1>
          <p class="mt-3 max-w-2xl text-[13px]" :style="{ color: C.textMuted }">
            Lista de perfis de terceiros que a automação <code>profile_auto_comment</code> observa.
            Quando um perfil listado posta algo, o worker (ainda pendente) renderiza o <em>template</em>
            com placeholders <code>{ticker}</code> / <code>{change}</code> e posta um comentário via Postiz.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-sm px-4 py-2.5 font-mono-tab text-[11px] font-bold uppercase tracking-[0.15em] transition-[transform,opacity,box-shadow,background-color,border-color,filter] hover:opacity-90"
          :style="{ backgroundColor: C.primary, color: C.background }"
          @click="openEditor(null)"
        >
          <UIcon name="i-lucide-plus" class="size-4" />
          NOVO PERFIL
        </button>
      </header>

      <div v-if="error" class="rounded-sm border px-4 py-3 text-[13px]" :style="{ borderColor: C.negative, color: C.negative }">
        {{ error }}
      </div>

      <div v-if="loading" class="py-8 text-center" :style="{ color: C.textMuted }">
        <UIcon name="i-lucide-loader-2" class="size-5 motion-safe:animate-spin" />
      </div>

      <div
        v-else-if="items.length === 0"
        class="rounded-sm border p-8 text-center text-[13px]"
        :style="{ borderColor: C.border, color: C.textMuted }"
      >
        Nenhum perfil monitorado ainda.
      </div>

      <div v-else class="overflow-hidden rounded-sm border" :style="{ borderColor: C.border }">
        <table class="w-full text-left">
          <caption class="sr-only">Perfis de redes sociais monitorados</caption>
          <thead class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted, backgroundColor: C.surface }">
            <tr>
              <th scope="col" class="px-4 py-3">PLATAFORMA</th>
              <th scope="col" class="px-4 py-3">HANDLE</th>
              <th scope="col" class="px-4 py-3">NOME</th>
              <th scope="col" class="px-4 py-3 text-center">STATUS</th>
              <th scope="col" class="px-4 py-3">TEMPLATE</th>
              <th scope="col" class="px-4 py-3 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in items"
              :key="p.id"
              class="border-t" :style="{ borderColor: C.border, backgroundColor: C.surface }"
            >
              <td class="px-4 py-3 font-mono-tab text-[11px] uppercase" :style="{ color: C.primary }">{{ p.platform }}</td>
              <th scope="row" class="px-4 py-3 font-mono-tab text-[12px] font-normal text-left" :style="{ color: C.text }">{{ p.handle }}</th>
              <td class="px-4 py-3 text-[13px]" :style="{ color: C.text }">{{ p.display_name || '—' }}</td>
              <td class="px-4 py-3 text-center">
                <button
                  type="button"
                  :disabled="busyIds.has(p.id)"
                  class="inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
                  :style="p.enabled
                    ? { borderColor: C.positive, color: C.positive }
                    : { borderColor: C.border, color: C.textMuted }"
                  @click="handleToggle(p)"
                >
                  <span class="size-1.5 rounded-full" :style="{ backgroundColor: p.enabled ? C.positive : C.textMuted }" />
                  {{ p.enabled ? 'ATIVO' : 'PAUSADO' }}
                </button>
              </td>
              <td class="px-4 py-3 text-[11px]" :style="{ color: C.textMuted }">
                {{ (p.comment_template || '').slice(0, 50) }}{{ (p.comment_template || '').length > 50 ? '…' : '' }}
              </td>
              <td class="px-4 py-3 text-right">
                <div class="inline-flex gap-2">
                  <button
                    type="button"
                    class="rounded-sm border px-2 py-1 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
                    :style="{ borderColor: C.border, color: C.text }"
                    @click="openEditor(p)"
                  >EDITAR</button>
                  <button
                    type="button"
                    :disabled="busyIds.has(p.id)"
                    class="rounded-sm border px-2 py-1 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
                    :style="{ borderColor: C.negative, color: C.negative }"
                    @click="handleDelete(p)"
                  >DELETAR</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Editor modal -->
    <div
      v-if="editorOpen"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-6"
      style="background-color: rgba(0,0,0,0.7)"
      @click.self="closeEditor"
    >
      <div
        class="my-auto w-full max-w-xl rounded-sm border p-6"
        :style="{ borderColor: C.border, backgroundColor: C.background }"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-mono-tab text-[11px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
            [{{ editorMode === 'create' ? 'NOVO' : 'EDITAR' }} PERFIL]
          </h2>
          <button type="button" class="font-mono-tab text-[12px]" :style="{ color: C.textMuted }" @click="closeEditor">✕</button>
        </div>
        <form class="flex flex-col gap-4" @submit.prevent="handleSave">
          <div class="grid gap-3 md:grid-cols-2">
            <label class="flex flex-col gap-1.5">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">PLATAFORMA</span>
              <select
                v-model="draft.platform"
                class="rounded-sm border bg-transparent px-3 py-2 text-[13px]"
                :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }"
              >
                <option value="instagram">instagram</option>
                <option value="x">x</option>
                <option value="threads">threads</option>
                <option value="facebook">facebook</option>
              </select>
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">HANDLE</span>
              <input
                v-model="draft.handle"
                type="text"
                required
                placeholder="@usuario"
                class="rounded-sm border bg-transparent px-3 py-2 font-mono-tab text-[12px]"
                :style="{ borderColor: C.border, color: C.text }"
              />
            </label>
            <label class="flex flex-col gap-1.5 md:col-span-2">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">NOME (opcional)</span>
              <input
                v-model="draft.display_name"
                type="text"
                class="rounded-sm border bg-transparent px-3 py-2 text-[13px]"
                :style="{ borderColor: C.border, color: C.text }"
              />
            </label>
            <label class="flex flex-col gap-1.5 md:col-span-2">
              <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.textMuted }">
                TEMPLATE DE COMENTÁRIO (placeholders: {ticker}, {change}, {price})
              </span>
              <textarea
                v-model="draft.comment_template"
                rows="4"
                placeholder="Hoje {ticker} está {change}% e cota R$ {price}. Mais em redentia.com.br/asset/{ticker}"
                class="rounded-sm border bg-transparent px-3 py-2 text-[13px]"
                :style="{ borderColor: C.border, color: C.text }"
              />
            </label>
            <label class="flex items-center gap-2 md:col-span-2">
              <input v-model="draft.enabled" type="checkbox" class="size-4" />
              <span class="text-[13px]" :style="{ color: C.text }">Ativar monitoramento</span>
            </label>
          </div>

          <div v-if="editorError" class="rounded-sm border px-3 py-2 text-[12px]" :style="{ borderColor: C.negative, color: C.negative }">
            {{ editorError }}
          </div>

          <div class="flex items-center justify-end gap-3">
            <button type="button" class="rounded-sm border px-4 py-2 font-mono-tab text-[11px] uppercase tracking-[0.15em]" :style="{ borderColor: C.border, color: C.text }" @click="closeEditor">CANCELAR</button>
            <button
              type="submit"
              :disabled="saving"
              class="rounded-sm px-4 py-2 font-mono-tab text-[11px] font-bold uppercase tracking-[0.15em] disabled:opacity-40"
              :style="{ backgroundColor: C.primary, color: C.background }"
            >
              {{ saving ? 'SALVANDO…' : (editorMode === 'create' ? 'CRIAR' : 'SALVAR') }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <MoleculesConfirmDialog ref="confirmDialogRef" />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F } from '~/utils/redentiaCreativeColors'
import type { IMonitoredProfile } from '~/services/monitoredProfiles'

definePageMeta({ middleware: ['admin-panel'] })

const service = useMonitoredProfilesService()

const items = ref<IMonitoredProfile[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const busyIds = reactive(new Set<number>())
const confirmDialogRef = ref<{ open: (opts: { title: string; description?: string; confirmLabel?: string; cancelLabel?: string; variant?: 'destructive' | 'default' }) => Promise<boolean> } | null>(null)

const editorOpen = ref(false)
const editorMode = ref<'create' | 'edit'>('create')
const editorError = ref<string | null>(null)
const saving = ref(false)
const draft = reactive({
  id: null as number | null,
  platform: 'instagram' as IMonitoredProfile['platform'],
  handle: '',
  display_name: '',
  comment_template: '',
  enabled: false,
})

async function refresh() {
  loading.value = true
  try {
    items.value = await service.list()
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Erro ao carregar perfis.'
  } finally {
    loading.value = false
  }
}

function openEditor(p: IMonitoredProfile | null) {
  editorError.value = null
  if (p) {
    editorMode.value = 'edit'
    draft.id = p.id
    draft.platform = p.platform
    draft.handle = p.handle
    draft.display_name = p.display_name || ''
    draft.comment_template = p.comment_template || ''
    draft.enabled = p.enabled
  } else {
    editorMode.value = 'create'
    draft.id = null
    draft.platform = 'instagram'
    draft.handle = ''
    draft.display_name = ''
    draft.comment_template = ''
    draft.enabled = false
  }
  editorOpen.value = true
}

function closeEditor() { editorOpen.value = false }

async function handleSave() {
  saving.value = true
  editorError.value = null
  try {
    const body = {
      platform: draft.platform,
      handle: draft.handle,
      display_name: draft.display_name || null,
      comment_template: draft.comment_template || null,
      enabled: draft.enabled,
    }
    if (editorMode.value === 'create') await service.create(body)
    else if (draft.id) await service.update(draft.id, body)
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

async function handleToggle(p: IMonitoredProfile) {
  busyIds.add(p.id)
  try {
    const updated = await service.toggle(p.id)
    Object.assign(p, updated)
  } catch (e: any) {
    error.value = e?.message || 'Erro ao alternar.'
  } finally {
    busyIds.delete(p.id)
  }
}

async function handleDelete(p: IMonitoredProfile) {
  const ok = await confirmDialogRef.value?.open({
    title: `Remover o perfil "${p.handle}"?`,
    description: `Plataforma: ${p.platform}.`,
    confirmLabel: 'Remover',
    cancelLabel: 'Cancelar',
    variant: 'destructive',
  })
  if (!ok) return
  busyIds.add(p.id)
  try {
    await service.remove(p.id)
    items.value = items.value.filter(i => i.id !== p.id)
  } catch (e: any) {
    error.value = e?.message || 'Erro ao deletar.'
  } finally {
    busyIds.delete(p.id)
  }
}

onMounted(refresh)
</script>

<style scoped>
.font-mono-tab { font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace; font-feature-settings: 'tnum' 1; }
textarea:focus, input:focus { outline: none !important; }
</style>

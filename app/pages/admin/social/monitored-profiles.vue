<!--
  /admin/social/monitored-profiles — perfis de terceiros que a
  automacao profile_auto_comment observa.

  Visual: usa o admin design system. Modal de editor com form unificado
  pra create/edit. Templates suportam placeholders {ticker}/{change}/{price}.
-->
<template>
  <NuxtLayout name="admin-panel">
    <div class="admin-page admin-page--narrow">
      <!-- ============ HEADER ============ -->
      <header class="admin-page__head">
        <div class="admin-page__head-left">
          <span class="admin-page__eyebrow">
            <UIcon name="i-lucide-eye" />
            Social · Perfis monitorados
          </span>
          <h1 class="admin-page__title">Quem a gente fica de olho.</h1>
          <p class="admin-page__lead">
            Perfis de terceiros observados pelo <code>profile_auto_comment</code>. Quando o perfil posta,
            o worker renderiza o template com <code>{ticker}</code>, <code>{change}</code>, <code>{price}</code>
            e comenta via Postiz.
          </p>
        </div>
        <button
          type="button"
          class="admin-btn admin-btn--primary"
          @click="openEditor(null)"
        >
          <UIcon name="i-lucide-plus" class="size-4" />
          Novo perfil
        </button>
      </header>

      <div v-if="error" class="admin-error">
        <UIcon name="i-lucide-alert-circle" class="size-4 shrink-0" />
        {{ error }}
      </div>

      <div v-if="loading" class="admin-loading">
        <span class="admin-loading__icon">
          <UIcon name="i-lucide-loader-2" class="size-4 motion-safe:animate-spin" />
        </span>
        <span class="admin-loading__title">Carregando perfis…</span>
      </div>

      <div v-else-if="items.length === 0" class="admin-empty">
        <span class="admin-empty__icon">
          <UIcon name="i-lucide-eye-off" class="size-4" />
        </span>
        <span class="admin-empty__title">Nenhum perfil monitorado</span>
        <span class="admin-empty__sub">Adicione um perfil pra começar a observar posts.</span>
      </div>

      <!-- ============ TABLE ============ -->
      <div v-else class="admin-table">
        <div class="admin-table__scroll">
          <table>
            <caption class="sr-only">Perfis de redes sociais monitorados</caption>
            <thead>
              <tr>
                <th scope="col">Plataforma</th>
                <th scope="col">Handle</th>
                <th scope="col">Nome</th>
                <th scope="col" class="admin-table__center">Status</th>
                <th scope="col">Template</th>
                <th scope="col" class="admin-table__right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in items" :key="p.id">
                <td>
                  <span class="admin-badge admin-badge--accent">{{ p.platform }}</span>
                </td>
                <th scope="row">
                  <span class="profile-handle">{{ p.handle }}</span>
                </th>
                <td>
                  <span class="admin-table__primary-name">{{ p.display_name || '—' }}</span>
                </td>
                <td class="admin-table__center">
                  <button
                    type="button"
                    :disabled="busyIds.has(p.id)"
                    class="admin-badge"
                    :class="p.enabled ? 'admin-badge--positive' : ''"
                    style="cursor: pointer;"
                    @click="handleToggle(p)"
                  >
                    <span
                      class="admin-stat__dot"
                      :style="{ backgroundColor: p.enabled ? 'var(--brand-positive, #10b981)' : 'currentColor' }"
                    />
                    {{ p.enabled ? 'Ativo' : 'Pausado' }}
                  </button>
                </td>
                <td class="admin-table__cell-muted">
                  {{ (p.comment_template || '').slice(0, 50) }}{{ (p.comment_template || '').length > 50 ? '…' : '' }}
                </td>
                <td class="admin-table__right">
                  <div class="admin-actions">
                    <button
                      type="button"
                      class="admin-btn admin-btn--ghost admin-btn--xs"
                      @click="openEditor(p)"
                    >
                      <UIcon name="i-lucide-pencil" class="size-3" />
                      Editar
                    </button>
                    <button
                      type="button"
                      :disabled="busyIds.has(p.id)"
                      class="admin-btn admin-btn--danger admin-btn--xs"
                      @click="handleDelete(p)"
                    >
                      <UIcon name="i-lucide-trash-2" class="size-3" />
                      Deletar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ============ EDITOR MODAL ============ -->
    <div
      v-if="editorOpen"
      class="profile-modal__backdrop"
      @click.self="closeEditor"
    >
      <div class="profile-modal__panel">
        <div class="profile-modal__head">
          <span class="admin-page__eyebrow">
            {{ editorMode === 'create' ? 'Novo' : 'Editar' }} perfil
          </span>
          <button
            type="button"
            class="admin-actions__icon-btn"
            aria-label="Fechar"
            @click="closeEditor"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </div>
        <form class="profile-modal__form" @submit.prevent="handleSave">
          <div class="profile-modal__grid">
            <label class="profile-field">
              <span class="profile-field__label">Plataforma</span>
              <select v-model="draft.platform" class="admin-select">
                <option value="instagram">Instagram</option>
                <option value="x">X</option>
                <option value="threads">Threads</option>
                <option value="facebook">Facebook</option>
              </select>
            </label>
            <label class="profile-field">
              <span class="profile-field__label">Handle</span>
              <input
                v-model="draft.handle"
                type="text"
                required
                placeholder="@usuario"
                class="admin-input"
                style="font-family: 'JetBrains Mono', monospace; font-size: 12px;"
              />
            </label>
            <label class="profile-field profile-modal__grid-full">
              <span class="profile-field__label">Nome (opcional)</span>
              <input
                v-model="draft.display_name"
                type="text"
                class="admin-input"
              />
            </label>
            <label class="profile-field profile-modal__grid-full">
              <span class="profile-field__label">
                Template de comentário
                <span class="profile-field__hint">placeholders: {ticker}, {change}, {price}</span>
              </span>
              <textarea
                v-model="draft.comment_template"
                rows="4"
                placeholder="Hoje {ticker} está {change}% e cota R$ {price}. Mais em redentia.com.br/asset/{ticker}"
                class="admin-input"
                style="resize: vertical; min-height: 96px; font-family: 'JetBrains Mono', monospace; font-size: 12px;"
              />
            </label>
            <label class="profile-field profile-field--inline profile-modal__grid-full">
              <input v-model="draft.enabled" type="checkbox" class="profile-field__checkbox" />
              <span>Ativar monitoramento</span>
            </label>
          </div>

          <div v-if="editorError" class="admin-error">
            <UIcon name="i-lucide-alert-circle" class="size-4 shrink-0" />
            {{ editorError }}
          </div>

          <div class="profile-modal__actions">
            <button
              type="button"
              class="admin-btn admin-btn--ghost"
              @click="closeEditor"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="admin-btn admin-btn--primary"
            >
              <UIcon
                v-if="saving"
                name="i-lucide-loader-2"
                class="size-3.5 motion-safe:animate-spin"
              />
              {{ saving ? 'Salvando…' : (editorMode === 'create' ? 'Criar' : 'Salvar') }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <MoleculesConfirmDialog ref="confirmDialogRef" />
  </NuxtLayout>
</template>

<script setup lang="ts">
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
.profile-handle {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px;
  color: var(--brand-text);
}

.admin-error {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--brand-negative, #ef4444) 40%, transparent);
  background: color-mix(in srgb, var(--brand-negative, #ef4444) 8%, transparent);
  color: var(--brand-negative, #ef4444);
  font-size: 13px;
}

/* ============ MODAL ============ */
.profile-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  padding: 24px;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}
.profile-modal__panel {
  margin: auto;
  width: 100%;
  max-width: 580px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  background: var(--brand-background);
  overflow: hidden;
  box-shadow: 0 30px 80px -20px var(--shadow-ambient);
}
.profile-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}
.profile-modal__form {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.profile-modal__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
@media (min-width: 520px) {
  .profile-modal__grid { grid-template-columns: repeat(2, 1fr); }
}
.profile-modal__grid-full { grid-column: 1 / -1; }
.profile-modal__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.profile-field { display: flex; flex-direction: column; gap: 6px; }
.profile-field__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.profile-field__hint {
  text-transform: none;
  letter-spacing: 0.04em;
  font-weight: 400;
  font-size: 10px;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}
.profile-field--inline {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--brand-text);
}
.profile-field__checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--brand-primary);
  cursor: pointer;
}
</style>

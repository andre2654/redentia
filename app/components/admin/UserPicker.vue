<!--
  AdminUserPicker — multiselect de usuarios pra targeting de
  comunicacoes (audience='specific'). Usado tambem em qualquer outro
  lugar que precisar de um picker de users.

  Props:
    - modelValue: number[]   (lista de user IDs selecionados)
    - tenantId: number|null  (filtro: so users com sub nesse tenant; null = todos)

  Comportamento:
    - Input com search debounced (300ms) bate em /admin/users?search=…&tenant_id=…
    - Resultados mostram nome + email + celular + role badge
    - Click adiciona/remove da lista selecionada
    - Lista de selecionados aparece em cima como chips dismissiveis
    - Ao mudar tenantId, limpa a selecao (uids do tenant antigo nao
      pertencem mais ao novo).
-->
<template>
  <div class="user-picker">
    <!-- Selecionados (chips) -->
    <div v-if="selectedUsers.length" class="user-picker__selected">
      <span
        v-for="u in selectedUsers"
        :key="u.id"
        class="user-picker__chip"
      >
        <span class="user-picker__chip-name">{{ u.name || u.email || `#${u.id}` }}</span>
        <span class="user-picker__chip-meta">{{ u.email || u.celular || '—' }}</span>
        <button
          type="button"
          class="user-picker__chip-remove"
          aria-label="Remover usuário"
          @click="toggle(u.id)"
        >
          <UIcon name="i-lucide-x" class="size-3" />
        </button>
      </span>
    </div>

    <!-- Search input -->
    <div class="user-picker__search">
      <UIcon name="i-lucide-search" class="user-picker__search-icon size-4" />
      <input
        v-model="search"
        type="text"
        placeholder="Buscar por nome, email, login ou celular…"
        class="user-picker__input"
        @focus="open = true"
        @input="onSearchInput"
      />
      <button
        v-if="search"
        type="button"
        class="user-picker__clear"
        aria-label="Limpar busca"
        @click="clearSearch"
      >
        <UIcon name="i-lucide-x" class="size-3.5" />
      </button>
    </div>

    <!-- Results dropdown -->
    <div v-if="open && (loading || results.length || (search && !loading))" class="user-picker__results">
      <div v-if="loading" class="user-picker__state">
        <UIcon name="i-lucide-loader-2" class="size-4 motion-safe:animate-spin" />
        Buscando…
      </div>
      <div v-else-if="!results.length && search" class="user-picker__state">
        <UIcon name="i-lucide-search-x" class="size-4" />
        Nenhum usuário encontrado.
      </div>
      <ul v-else class="user-picker__list">
        <li
          v-for="u in results"
          :key="u.id"
          class="user-picker__item"
          :class="{ 'user-picker__item--selected': isSelected(u.id) }"
          @click="toggle(u.id, u)"
        >
          <span class="user-picker__check">
            <UIcon
              v-if="isSelected(u.id)"
              name="i-lucide-check"
              class="size-3.5"
            />
          </span>
          <div class="user-picker__item-main">
            <span class="user-picker__item-name">{{ u.name || u.login || `#${u.id}` }}</span>
            <span class="user-picker__item-meta">{{ u.email || u.celular || '—' }}</span>
          </div>
          <span class="user-picker__item-role" :data-role="u.role">{{ roleLabel(u.role) }}</span>
        </li>
      </ul>
    </div>

    <p v-if="!selectedUsers.length && !search" class="user-picker__hint">
      <UIcon name="i-lucide-info" class="size-3.5" />
      Digite na busca pra adicionar usuários à lista.
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number[]
  tenantId: number | null
}>()

const emit = defineEmits<{ 'update:modelValue': [number[]] }>()

const usersService = useAdminUsersService()

interface PickerUser {
  id: number
  name: string | null
  email: string | null
  celular: string | null
  login: string | null
  role: string
}

const search = ref('')
const open = ref(false)
const loading = ref(false)
const results = ref<PickerUser[]>([])
// Cache pra reidratar chips quando o componente carrega com IDs ja selecionados
// (ex: edicao de comunicacao com target_user_ids preexistente).
const selectedCache = ref<Map<number, PickerUser>>(new Map())

let searchTimer: ReturnType<typeof setTimeout> | null = null

function isSelected(id: number): boolean {
  return props.modelValue.includes(id)
}

const selectedUsers = computed<PickerUser[]>(() => {
  return props.modelValue
    .map(id => selectedCache.value.get(id) || { id, name: null, email: null, celular: null, login: null, role: 'investor' })
})

async function loadResults() {
  if (!search.value) {
    results.value = []
    return
  }
  loading.value = true
  try {
    const params: any = { search: search.value, page: 1 }
    if (props.tenantId) params.tenant_id = props.tenantId
    const resp = await usersService.list(params)
    const items = resp?.data || []
    results.value = items.slice(0, 20).map((u: any) => ({
      id: Number(u.id),
      name: u.name,
      email: u.email,
      celular: u.celular,
      login: u.login,
      role: u.role,
    }))
    // Atualiza cache com qualquer user achado
    results.value.forEach(u => selectedCache.value.set(u.id, u))
  } catch {
    results.value = []
  } finally {
    loading.value = false
  }
}

// Carrega user details pros IDs preexistentes (caso de edicao). Faz 1 batch.
async function hydrateCache() {
  const idsToFetch = props.modelValue.filter(id => !selectedCache.value.has(id))
  if (!idsToFetch.length) return
  try {
    // Busca pelos IDs (usa search com csv? AdminUsersService.list nao
    // tem filtro por id list, entao precisa puxar pagina e cruzar).
    // Pratica: mostra so os IDs nus (sem nome) e o admin re-busca se
    // quiser. Simplifica e nao bate na API toa toa.
  } catch { /* silent */ }
}

function toggle(id: number, user?: PickerUser) {
  if (user) selectedCache.value.set(id, user)
  const next = isSelected(id)
    ? props.modelValue.filter(x => x !== id)
    : [...props.modelValue, id]
  emit('update:modelValue', next)
}

function onSearchInput() {
  open.value = true
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(loadResults, 300)
}

function clearSearch() {
  search.value = ''
  results.value = []
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    admin: 'ADMIN',
    advisor: 'ASSESSOR',
    investor: 'INVESTIDOR',
  }
  return map[role] || role.toUpperCase()
}

// Click fora fecha o dropdown
function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.user-picker')) open.value = false
}

watch(() => props.tenantId, () => {
  // Tenant mudou — limpa selecao (IDs do tenant antigo nao pertencem
  // mais ao novo) e refaz a busca se houver termo.
  if (props.modelValue.length) emit('update:modelValue', [])
  if (search.value) loadResults()
})

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  hydrateCache()
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<style scoped>
.user-picker {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-picker__selected {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}
.user-picker__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 4px 4px 10px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 35%, transparent);
  color: var(--brand-text);
  font-size: 12px;
  max-width: 100%;
}
.user-picker__chip-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-picker__chip-meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}
.user-picker__chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 0;
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms;
}
.user-picker__chip-remove:hover {
  background: color-mix(in srgb, var(--brand-negative, #ef4444) 14%, transparent);
  color: var(--brand-negative, #ef4444);
}

.user-picker__search {
  position: relative;
  display: flex;
  align-items: center;
}
.user-picker__search-icon {
  position: absolute;
  left: 12px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  pointer-events: none;
}
.user-picker__input {
  width: 100%;
  padding: 9px 36px 9px 36px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  color: var(--brand-text);
  font-family: var(--brand-font);
  font-size: 13px;
  outline: none;
  transition: border-color 150ms, box-shadow 150ms;
}
.user-picker__input::placeholder {
  color: color-mix(in srgb, var(--brand-text) 40%, transparent);
}
.user-picker__input:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}
.user-picker__clear {
  position: absolute;
  right: 8px;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 0;
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms;
}
.user-picker__clear:hover {
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  color: var(--brand-text);
}

.user-picker__results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  z-index: 20;
  max-height: 300px;
  overflow-y: auto;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 12%, transparent);
  background: var(--brand-surface);
  box-shadow: 0 18px 40px -16px rgba(0, 0, 0, 0.35);
}
.user-picker__state {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  font-size: 13px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.user-picker__list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.user-picker__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 150ms;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 4%, transparent);
}
.user-picker__item:hover {
  background: color-mix(in srgb, var(--brand-primary) 6%, transparent);
}
.user-picker__item--selected {
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
}
.user-picker__check {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1.5px solid color-mix(in srgb, var(--brand-text) 25%, transparent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--brand-primary);
  flex-shrink: 0;
}
.user-picker__item--selected .user-picker__check {
  border-color: var(--brand-primary);
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
}
.user-picker__item-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.user-picker__item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--brand-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-picker__item-meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-picker__item-role {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 14%, transparent);
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.user-picker__item-role[data-role='admin'] {
  color: var(--brand-primary);
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
}
.user-picker__item-role[data-role='advisor'] {
  color: var(--brand-positive, #10b981);
  border-color: color-mix(in srgb, var(--brand-positive, #10b981) 35%, transparent);
}

.user-picker__hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
</style>

<!--
  /admin/users — platform users listing.

  Visual: usa o admin design system (assets/css/admin.css). Header com
  eyebrow + title + stat chips a direita. Toolbar de filtros num bloco
  unico. Tabela em card com hover/zebra. Selects de papel/aprovacao
  mantem cor reativa pra escanear o status num pisco.

  A coluna de papel e interativa (admin/advisor/investor) pra promover
  ou demover sem detail screen. Self-demote bloqueado server-side e
  tambem desabilitado no UI pra honestidade.
-->
<template>
  <NuxtLayout name="admin-panel">
    <div class="admin-page">
      <!-- ============ HEADER ============ -->
      <header class="admin-page__head">
        <div class="admin-page__head-left">
          <span class="admin-page__eyebrow">
            <UIcon name="i-lucide-users" />
            Usuários
          </span>
          <h1 class="admin-page__title">Pessoas na plataforma.</h1>
          <p class="admin-page__lead">
            Cadastros, papéis, aprovação de assessores e tração de carteira/raio-X.
          </p>
        </div>
        <div class="admin-page__actions">
          <span class="admin-stat">
            <span class="admin-stat__dot" />
            <span class="admin-stat__value">{{ stats?.total ?? 0 }}</span>
            total
            <template v-if="stats">
              <span class="admin-stat__sep" />
              <span class="admin-stat__value">+{{ stats.last_7d }}</span>
              em 7d
            </template>
          </span>
          <span v-if="stats && stats.pendingApproval > 0" class="admin-stat admin-stat--accent">
            <UIcon name="i-lucide-clock" class="size-3" />
            <span class="admin-stat__value">{{ stats.pendingApproval }}</span>
            aguardando
          </span>
          <span
            v-if="stats && (stats.aum ?? 0) > 0"
            class="admin-stat admin-stat--positive"
            title="Assets Under Management — soma de todas as carteiras"
          >
            <UIcon name="i-lucide-landmark" class="size-3" />
            <span class="admin-stat__value">{{ formatBRL(stats.aum ?? 0) }}</span>
            sob gestão
            <template v-if="stats.usersWithValue">
              <span class="admin-stat__sep" />
              <span class="admin-stat__value">{{ stats.usersWithValue }}</span>
              {{ stats.usersWithValue === 1 ? 'investidor' : 'investidores' }}
            </template>
          </span>
        </div>
      </header>

      <!-- ============ TOOLBAR ============ -->
      <div class="admin-toolbar">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por nome, email, login ou celular..."
          class="admin-input admin-input--flex"
          @input="debouncedRefresh"
        />
        <div class="admin-toolbar__group">
          <select v-model="roleFilter" class="admin-select" @change="refresh">
            <option value="">Todos os papéis</option>
            <option value="admin">Admins</option>
            <option value="advisor">Assessores</option>
            <option value="investor">Investidores</option>
          </select>
          <select v-model="approvalFilter" class="admin-select" @change="refresh">
            <option value="">Qualquer aprovação</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovados</option>
            <option value="rejected">Rejeitados</option>
          </select>
          <!-- Tenant filter — só faz sentido pra superadmin.
               Tenant admin já tem scope forçado no backend (where tenant_id = own). -->
          <select
            v-if="isSuperAdmin"
            v-model="tenantFilter"
            class="admin-select"
            @change="refresh"
          >
            <option :value="null">Todos os tenants</option>
            <option v-for="t in tenants" :key="t.id" :value="t.id">
              {{ t.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- ============ TABLE ============ -->
      <div class="admin-table">
        <div class="admin-table__scroll">
          <table>
            <caption class="sr-only">Lista de usuários da plataforma</caption>
            <thead>
              <tr>
                <th scope="col">Cadastrado</th>
                <th scope="col">Nome / Email</th>
                <th scope="col">Login / Celular</th>
                <th scope="col" class="admin-table__center">Tenant</th>
                <th scope="col" class="admin-table__center">Papel</th>
                <th scope="col" class="admin-table__center">Aprovação</th>
                <th scope="col" class="admin-table__center">Progresso</th>
                <th scope="col" class="admin-table__right">Carteira</th>
                <th scope="col">Assessor</th>
                <th scope="col" class="admin-table__right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="10">
                  <div class="admin-loading">
                    <span class="admin-loading__icon">
                      <UIcon name="i-lucide-loader-2" class="size-4 motion-safe:animate-spin" />
                    </span>
                    <span class="admin-loading__title">Carregando usuários…</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td colspan="10">
                  <div class="admin-empty">
                    <span class="admin-empty__icon">
                      <UIcon name="i-lucide-search-x" class="size-4" />
                    </span>
                    <span class="admin-empty__title">Nenhum usuário encontrado</span>
                    <span class="admin-empty__sub">Tente outros filtros ou limpe a busca.</span>
                  </div>
                </td>
              </tr>
              <tr v-for="user in items" v-else :key="user.id">
                <td class="admin-table__cell-muted">
                  {{ formatDate(user.created_at) }}
                </td>
                <th scope="row">
                  <div class="admin-table__primary">
                    <span class="admin-table__primary-name">{{ user.name }}</span>
                    <span class="admin-table__primary-sub">{{ user.email }}</span>
                  </div>
                </th>
                <td>
                  <div class="admin-table__primary">
                    <span class="admin-table__cell-num" style="font-size: 12px;">{{ user.login || '—' }}</span>
                    <span class="admin-table__cell-muted">{{ user.celular || '—' }}</span>
                  </div>
                </td>
                <td class="admin-table__center">
                  <span
                    v-if="user.tenant"
                    class="user-tenant-pill"
                    :data-tenant="user.tenant.slug"
                    :title="`Tenant: ${user.tenant.name} (slug: ${user.tenant.slug})`"
                  >
                    {{ user.tenant.name }}
                  </span>
                  <span v-else class="admin-table__cell-muted">—</span>
                </td>
                <td class="admin-table__center">
                  <select
                    :value="user.role"
                    :disabled="busyIds.has(user.id) || isSelf(user)"
                    :title="isSelf(user) ? 'Você não pode alterar o próprio papel' : 'Alterar papel'"
                    class="admin-pill-select"
                    :data-tone="user.role"
                    @change="(event) => handleRoleChange(user, event)"
                  >
                    <option value="admin">ADMIN</option>
                    <option value="advisor">ASSESSOR</option>
                    <option value="investor">INVESTIDOR</option>
                  </select>
                </td>
                <td class="admin-table__center">
                  <select
                    v-if="user.role === 'advisor'"
                    :value="user.approval_status ?? 'pending'"
                    :disabled="busyIds.has(user.id)"
                    class="admin-pill-select"
                    :data-tone="user.approval_status ?? 'pending'"
                    @change="(event) => handleApprovalChange(user, event)"
                  >
                    <option value="pending">PENDENTE</option>
                    <option value="approved">APROVADO</option>
                    <option value="rejected">REJEITADO</option>
                  </select>
                  <span v-else class="admin-table__cell-muted">—</span>
                </td>
                <td>
                  <div class="user-progress-chips">
                    <span
                      class="admin-badge"
                      :class="user.has_portfolio ? 'admin-badge--positive' : ''"
                      :title="user.has_portfolio ? 'Carteira preenchida' : 'Sem carteira'"
                    >
                      <UIcon :name="user.has_portfolio ? 'i-lucide-check' : 'i-lucide-minus'" class="size-3" />
                      Carteira
                    </span>
                    <span
                      class="admin-badge"
                      :class="user.has_xray ? 'admin-badge--positive' : ''"
                      :title="user.has_xray ? 'Raio-X gerado' : 'Sem raio-X'"
                    >
                      <UIcon :name="user.has_xray ? 'i-lucide-check' : 'i-lucide-minus'" class="size-3" />
                      Raio-X
                    </span>
                  </div>
                </td>
                <td class="admin-table__right admin-table__cell-num">
                  <span v-if="(user.portfolio_value ?? 0) > 0" :title="`Valor de mercado das posições`">
                    {{ formatBRL(user.portfolio_value!) }}
                  </span>
                  <span v-else class="admin-table__cell-muted">—</span>
                </td>
                <td>
                  <template v-if="user.advisor">
                    <span class="admin-table__primary-name" style="font-size: 12.5px;">{{ user.advisor.name }}</span>
                    <span v-if="user.advisor.advisor_code" class="admin-table__cell-muted ml-1">
                      ({{ user.advisor.advisor_code }})
                    </span>
                  </template>
                  <span v-else class="admin-table__cell-muted">—</span>
                </td>
                <td class="admin-table__right">
                  <div class="user-row-actions">
                    <button
                      type="button"
                      :disabled="busyIds.has(user.id)"
                      class="user-row-action user-row-action--edit"
                      title="Editar dados"
                      aria-label="Editar usuário"
                      @click="openEditModal(user)"
                    >
                      <UIcon name="i-lucide-pencil" class="size-3.5" />
                    </button>
                    <button
                      v-if="!isSelf(user) && user.role !== 'admin'"
                      type="button"
                      :disabled="busyIds.has(user.id)"
                      class="user-row-action user-row-action--impersonate"
                      :title="`Entrar como ${user.name}`"
                      aria-label="Login como"
                      @click="handleImpersonate(user)"
                    >
                      <UIcon name="i-lucide-log-in" class="size-3.5" />
                    </button>
                    <button
                      v-if="canDelete(user)"
                      type="button"
                      :disabled="busyIds.has(user.id)"
                      class="user-row-action user-row-action--delete"
                      :title="`Apagar ${user.name}`"
                      aria-label="Deletar usuário"
                      @click="openDeleteModal(user)"
                    >
                      <UIcon name="i-lucide-trash-2" class="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============ PAGINATION ============ -->
      <div v-if="meta && meta.last_page > 1" class="admin-pagination">
        <span class="admin-pagination__info">
          Página <strong>{{ meta.current_page }}</strong> de {{ meta.last_page }}
          <span class="admin-stat__sep" />
          <strong>{{ meta.total }}</strong> resultados
        </span>
        <div class="admin-actions">
          <button
            type="button"
            class="admin-btn admin-btn--ghost admin-btn--sm"
            :disabled="meta.current_page <= 1 || loading"
            @click="changePage(meta.current_page - 1)"
          >
            <UIcon name="i-lucide-chevron-left" class="size-3.5" />
            Anterior
          </button>
          <button
            type="button"
            class="admin-btn admin-btn--ghost admin-btn--sm"
            :disabled="meta.current_page >= meta.last_page || loading"
            @click="changePage(meta.current_page + 1)"
          >
            Próxima
            <UIcon name="i-lucide-chevron-right" class="size-3.5" />
          </button>
        </div>
      </div>

      <div v-if="error" class="admin-error">
        <UIcon name="i-lucide-alert-circle" class="size-4 shrink-0" />
        {{ error }}
      </div>
    </div>

    <!-- ============ EDIT MODAL ============ -->
    <Teleport to="body">
      <Transition name="user-modal">
        <div
          v-if="editing"
          class="user-modal__backdrop"
          @click.self="closeEditModal"
          @keydown.esc="closeEditModal"
        >
          <div class="user-modal__panel" role="dialog" aria-modal="true" aria-labelledby="edit-user-title">
            <header class="user-modal__head">
              <span class="user-modal__eyebrow">Editar</span>
              <h2 id="edit-user-title" class="user-modal__title">{{ editing.name }}</h2>
              <button type="button" class="user-modal__close" aria-label="Fechar" @click="closeEditModal">
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </header>

            <div class="user-modal__body">
              <div class="user-modal__field">
                <label class="user-modal__label" for="ef-name">Nome</label>
                <input id="ef-name" v-model="editForm.name" type="text" class="user-modal__input" />
              </div>

              <div class="user-modal__grid">
                <div class="user-modal__field">
                  <label class="user-modal__label" for="ef-email">Email</label>
                  <input id="ef-email" v-model="editForm.email" type="email" class="user-modal__input" />
                </div>
                <div class="user-modal__field">
                  <label class="user-modal__label" for="ef-login">Login</label>
                  <input id="ef-login" v-model="editForm.login" type="text" class="user-modal__input" placeholder="—" />
                </div>
              </div>

              <div class="user-modal__grid">
                <div class="user-modal__field">
                  <label class="user-modal__label" for="ef-celular">Celular</label>
                  <input id="ef-celular" v-model="editForm.celular" type="text" class="user-modal__input" placeholder="+55…" />
                </div>
                <div class="user-modal__field">
                  <label class="user-modal__label" for="ef-role">Papel</label>
                  <select id="ef-role" v-model="editForm.role" class="user-modal__input" :disabled="isSelf(editing)">
                    <option value="investor">Investidor</option>
                    <option value="advisor">Assessor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <!-- Tenant: SO superadmin pode mudar -->
              <div class="user-modal__field">
                <label class="user-modal__label" for="ef-tenant">
                  Tenant
                  <span v-if="!isSuperAdmin" class="user-modal__hint">— bloqueado pra tenant admin</span>
                  <span v-else-if="isSelf(editing)" class="user-modal__hint">— não pode mudar o próprio</span>
                </label>
                <select
                  id="ef-tenant"
                  v-model="editForm.tenant_id"
                  class="user-modal__input"
                  :disabled="!isSuperAdmin || isSelf(editing)"
                >
                  <option :value="null">— sem tenant —</option>
                  <option v-for="t in tenants" :key="t.id" :value="t.id">
                    {{ t.name }} ({{ t.slug }})
                  </option>
                </select>
              </div>

              <div v-if="editError" class="user-modal__error">
                <UIcon name="i-lucide-alert-circle" class="size-3.5 shrink-0" />
                {{ editError }}
              </div>
            </div>

            <footer class="user-modal__foot">
              <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" @click="closeEditModal">
                Cancelar
              </button>
              <button
                type="button"
                class="admin-btn admin-btn--sm"
                :disabled="editSaving"
                @click="submitEdit"
              >
                <UIcon
                  :name="editSaving ? 'i-lucide-loader-2' : 'i-lucide-check'"
                  :class="['size-3.5', editSaving && 'motion-safe:animate-spin']"
                />
                {{ editSaving ? 'Salvando…' : 'Salvar' }}
              </button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ============ DELETE CONFIRM MODAL ============ -->
    <Teleport to="body">
      <Transition name="user-modal">
        <div
          v-if="deleting"
          class="user-modal__backdrop"
          @click.self="closeDeleteModal"
          @keydown.esc="closeDeleteModal"
        >
          <div class="user-modal__panel user-modal__panel--danger" role="alertdialog" aria-modal="true">
            <header class="user-modal__head">
              <span class="user-modal__eyebrow user-modal__eyebrow--danger">
                <UIcon name="i-lucide-alert-triangle" class="size-3" />
                Apagar usuário
              </span>
              <h2 class="user-modal__title">{{ deleting.name }}</h2>
              <button type="button" class="user-modal__close" aria-label="Fechar" @click="closeDeleteModal">
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </header>

            <div class="user-modal__body">
              <p class="user-modal__lead">
                Esta ação é <strong>permanente</strong> e não pode ser desfeita. O usuário e suas
                relações (carteira, raio-x, sessões de chat, etc.) ficarão órfãos ou removidos
                conforme as FKs.
              </p>

              <div class="user-modal__detail">
                <div><strong>Email:</strong> {{ deleting.email }}</div>
                <div v-if="deleting.tenant"><strong>Tenant:</strong> {{ deleting.tenant.name }}</div>
                <div><strong>Papel:</strong> {{ deleting.role }}</div>
              </div>

              <p class="user-modal__lead">
                Pra confirmar, digite o email abaixo:
              </p>
              <input
                v-model="deleteConfirmText"
                type="email"
                class="user-modal__input"
                :placeholder="deleting.email"
              />

              <div v-if="deleteError" class="user-modal__error">
                <UIcon name="i-lucide-alert-circle" class="size-3.5 shrink-0" />
                {{ deleteError }}
              </div>
            </div>

            <footer class="user-modal__foot">
              <button type="button" class="admin-btn admin-btn--ghost admin-btn--sm" @click="closeDeleteModal">
                Cancelar
              </button>
              <button
                type="button"
                class="admin-btn admin-btn--sm user-modal__btn-danger"
                :disabled="deleteConfirmText !== deleting.email || deleteBusy"
                @click="submitDelete"
              >
                <UIcon
                  :name="deleteBusy ? 'i-lucide-loader-2' : 'i-lucide-trash-2'"
                  :class="['size-3.5', deleteBusy && 'motion-safe:animate-spin']"
                />
                {{ deleteBusy ? 'Apagando…' : 'Apagar permanentemente' }}
              </button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { IAdminUser, IUserStats, UserRole, ApprovalStatus } from '~/types/admin-user'

definePageMeta({ middleware: ['admin-panel'] })

const usersService = useAdminUsersService()
const tenantsService = useTenantsService()
const auth = useAuthStore()

const items = ref<IAdminUser[]>([])
const meta = ref<{ current_page: number; last_page: number; per_page: number; total: number } | null>(null)
const stats = ref<IUserStats | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const roleFilter = ref<'' | UserRole>('')
const approvalFilter = ref<'' | ApprovalStatus>('')
const tenantFilter = ref<number | null>(null)
const page = ref(1)

/**
 * Superadmin enxerga todos os tenants e pode filtrar manualmente.
 * Tenant admin tem scope forçado pelo backend (where users.tenant_id = own),
 * entao nao precisa do filtro nem da lista de tenants — escondemos o select.
 */
const isSuperAdmin = computed(() => !!auth.me?.is_super_admin)

interface TenantOption { id: number; slug: string; name: string }
const tenants = ref<TenantOption[]>([])

async function loadTenants() {
  // Carrega lista de tenants pra:
  //   - filtro do toolbar (so super)
  //   - select do modal de edit (super pra mudar; tenant admin so pra exibir o nome)
  // Tenant admin pode chamar GET /admin/tenants? — atualmente esta gated em
  // super_admin middleware. Falha graciosamente: o select fica disabled mesmo
  // se tenants[]=[]; backend ainda valida o campo.
  try {
    const list = await tenantsService.list({ active: 'true' })
    const arr = Array.isArray(list) ? list : ((list as any)?.data || [])
    tenants.value = arr.map((t: any) => ({ id: t.id, slug: t.slug, name: t.name }))
  } catch {
    // Nao-critico — tenant admin nao tem acesso a GET /admin/tenants
    tenants.value = []
  }
}

// =================================================================
// Edit modal state + handlers
// =================================================================
const editing = ref<IAdminUser | null>(null)
const editForm = reactive({
  name: '',
  email: '',
  login: '' as string | null,
  celular: '' as string | null,
  role: 'investor' as UserRole,
  tenant_id: null as number | null,
})
const editSaving = ref(false)
const editError = ref<string | null>(null)

function openEditModal(user: IAdminUser) {
  editing.value = user
  editForm.name = user.name
  editForm.email = user.email
  editForm.login = user.login
  editForm.celular = user.celular
  editForm.role = user.role
  editForm.tenant_id = user.tenant_id
  editError.value = null
}

function closeEditModal() {
  editing.value = null
  editError.value = null
}

async function submitEdit() {
  if (!editing.value) return
  editSaving.value = true
  editError.value = null
  try {
    const payload: Record<string, unknown> = {
      name: editForm.name,
      email: editForm.email,
      login: editForm.login || null,
      celular: editForm.celular || null,
      role: editForm.role,
    }
    // Só manda tenant_id se for super (backend ignora silenciosamente
    // pra tenant admin, mas mandar limpinho deixa request menor)
    if (isSuperAdmin.value && !isSelf(editing.value)) {
      payload.tenant_id = editForm.tenant_id
    }
    const resp = await usersService.update(editing.value.id, payload)
    // Sync na lista local
    const idx = items.value.findIndex(u => u.id === editing.value!.id)
    if (idx >= 0 && resp?.data) Object.assign(items.value[idx], resp.data)
    closeEditModal()
  } catch (e) {
    const err = e as { data?: { message?: string; errors?: Record<string, string[]> }; message?: string }
    let msg = err?.data?.message || err?.message || 'Erro ao salvar'
    if (err?.data?.errors) {
      const fieldErrs = Object.entries(err.data.errors)
        .map(([f, msgs]) => `${f}: ${msgs[0]}`)
        .join('; ')
      msg = `${msg} (${fieldErrs})`
    }
    editError.value = msg
  } finally {
    editSaving.value = false
  }
}

// =================================================================
// Delete confirm modal state + handlers
// =================================================================
const deleting = ref<IAdminUser | null>(null)
const deleteConfirmText = ref('')
const deleteBusy = ref(false)
const deleteError = ref<string | null>(null)

function canDelete(user: IAdminUser): boolean {
  if (isSelf(user)) return false
  // Tenant admin não pode apagar admins (backend bloqueia, frontend espelha)
  if (user.role === 'admin' && !isSuperAdmin.value) return false
  return true
}

function openDeleteModal(user: IAdminUser) {
  deleting.value = user
  deleteConfirmText.value = ''
  deleteError.value = null
}

function closeDeleteModal() {
  deleting.value = null
  deleteConfirmText.value = ''
  deleteError.value = null
}

async function submitDelete() {
  if (!deleting.value) return
  if (deleteConfirmText.value !== deleting.value.email) {
    deleteError.value = 'Email não confere.'
    return
  }
  deleteBusy.value = true
  deleteError.value = null
  try {
    await usersService.destroy(deleting.value.id)
    items.value = items.value.filter(u => u.id !== deleting.value!.id)
    void refreshStats()
    closeDeleteModal()
  } catch (e) {
    const err = e as { data?: { message?: string }; message?: string }
    deleteError.value = err?.data?.message || err?.message || 'Erro ao deletar'
  } finally {
    deleteBusy.value = false
  }
}

const busyIds = reactive(new Set<number>())
const currentUserId = computed<string | null>(() => auth.me?.id ?? null)
function isSelf(user: IAdminUser): boolean {
  return currentUserId.value !== null && String(user.id) === currentUserId.value
}

async function refresh() {
  loading.value = true
  error.value = null
  try {
    const params: Record<string, string | number> = { page: page.value }
    if (search.value) params.search = search.value
    if (roleFilter.value) params.role = roleFilter.value
    if (approvalFilter.value) params.approval = approvalFilter.value
    // Tenant filter so faz sentido pra superadmin. Tenant admin tem
    // scope forçado pelo backend (where users.tenant_id = own).
    if (isSuperAdmin.value && tenantFilter.value !== null) {
      params.tenant_id = tenantFilter.value
    }
    const resp = await usersService.list(params)
    items.value = resp.data ?? []
    meta.value = resp.meta ?? null
  } catch (e) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err?.data?.message || err?.message || 'Erro ao carregar usuários.'
    items.value = []
  } finally {
    loading.value = false
  }
}

async function refreshStats() {
  try {
    stats.value = await usersService.stats()
  } catch {
    /* non-blocking */
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
function debouncedRefresh() {
  if (searchTimer) clearTimeout(searchTimer)
  page.value = 1
  searchTimer = setTimeout(refresh, 300)
}

function changePage(next: number) {
  page.value = next
  refresh()
}

async function handleRoleChange(user: IAdminUser, event: Event) {
  const target = event.target as HTMLSelectElement
  const nextRole = target.value as UserRole
  if (nextRole === user.role) return
  busyIds.add(user.id)
  try {
    const resp = await usersService.updateRole(user.id, nextRole)
    if (resp?.data) Object.assign(user, resp.data)
    void refreshStats()
  } catch (e) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err?.data?.message || err?.message || 'Erro ao atualizar papel.'
    target.value = user.role
  } finally {
    busyIds.delete(user.id)
  }
}

const router = useRouter()
async function handleImpersonate(user: IAdminUser) {
  if (busyIds.has(user.id)) return
  const ok = window.confirm(
    `Entrar na plataforma como ${user.name} (${user.email})?\n\n` +
    'Sua sessão de admin será encerrada nesta aba. Para voltar, ' +
    'faça logout e entre de novo com sua conta.'
  )
  if (!ok) return

  busyIds.add(user.id)
  try {
    const resp = await usersService.impersonate(user.id)
    if (!resp?.access_token) {
      error.value = 'Token de impersonate não recebido.'
      return
    }
    if (auth.token) {
      const adminCookie = useCookie<string | null>('auth:admin_token', { maxAge: 3600 * 8 })
      adminCookie.value = auth.token
    }
    auth.addToken(resp.access_token)
    await auth.fetchProfile()
    showSuccessNotification('Login efetuado', `Você está como ${user.name}.`)
    setTimeout(() => router.push('/'), 200)
  } catch (e) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err?.data?.message || err?.message || 'Não foi possível impersonar este usuário.'
  } finally {
    busyIds.delete(user.id)
  }
}

async function handleApprovalChange(user: IAdminUser, event: Event) {
  const target = event.target as HTMLSelectElement
  const nextStatus = target.value as ApprovalStatus
  if (nextStatus === user.approval_status) return
  busyIds.add(user.id)
  try {
    const resp = await usersService.updateApproval(user.id, nextStatus)
    if (resp?.data) Object.assign(user, resp.data)
    void refreshStats()
  } catch (e) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err?.data?.message || err?.message || 'Erro ao atualizar aprovação.'
    target.value = user.approval_status ?? 'pending'
  } finally {
    busyIds.delete(user.id)
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

const brlFull = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })
const brlCompact = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 2 })
function formatBRL(value: number, compact = false): string {
  if (!Number.isFinite(value)) return '—'
  return (compact ? brlCompact : brlFull).format(value)
}

onMounted(() => {
  refresh()
  refreshStats()
  loadTenants()
})
</script>

<style scoped>
/* Pill-style select para role/approval. data-tone troca a cor da borda
   sem precisar de :style binding por linha. */
.admin-pill-select {
  appearance: none;
  border: 1px solid color-mix(in srgb, var(--brand-text) 14%, transparent);
  background: transparent;
  border-radius: 4px;
  padding: 4px 22px 4px 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
  outline: none;
  cursor: pointer;
  transition: border-color 150ms, color 150ms, background 150ms;
  background-image:
    linear-gradient(45deg, transparent 50%, currentColor 50%),
    linear-gradient(135deg, currentColor 50%, transparent 50%);
  background-position:
    calc(100% - 12px) 50%,
    calc(100% - 8px) 50%;
  background-size: 4px 4px, 4px 4px;
  background-repeat: no-repeat;
}
.admin-pill-select:disabled { opacity: 0.45; cursor: not-allowed; }
.admin-pill-select[data-tone='admin'],
.admin-pill-select[data-tone='pending'] {
  color: var(--brand-primary);
  border-color: color-mix(in srgb, var(--brand-primary) 45%, transparent);
  background-color: color-mix(in srgb, var(--brand-primary) 8%, transparent);
}
.admin-pill-select[data-tone='advisor'],
.admin-pill-select[data-tone='approved'] {
  color: var(--brand-positive, #10b981);
  border-color: color-mix(in srgb, var(--brand-positive, #10b981) 45%, transparent);
  background-color: color-mix(in srgb, var(--brand-positive, #10b981) 8%, transparent);
}
.admin-pill-select[data-tone='rejected'] {
  color: var(--brand-negative, #ef4444);
  border-color: color-mix(in srgb, var(--brand-negative, #ef4444) 45%, transparent);
  background-color: color-mix(in srgb, var(--brand-negative, #ef4444) 8%, transparent);
}

/* Tenant pill — cor varia por slug pra escaneamento rapido */
.user-tenant-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 4px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 14%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
}
.user-tenant-pill[data-tenant='redentia'] {
  color: var(--brand-primary);
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
}
.user-tenant-pill[data-tenant='primo-rico'] {
  color: #fb923c;
  border-color: rgba(251, 146, 60, 0.35);
  background: rgba(251, 146, 60, 0.08);
}
.user-tenant-pill[data-tenant='me-poupe'] {
  color: #facc15;
  border-color: rgba(250, 204, 21, 0.35);
  background: rgba(250, 204, 21, 0.08);
}
.user-tenant-pill[data-tenant='investidor-sardinha'] {
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.35);
  background: rgba(248, 113, 113, 0.08);
}
.user-tenant-pill[data-tenant='lifetime'] {
  color: #a78bfa;
  border-color: rgba(167, 139, 250, 0.35);
  background: rgba(167, 139, 250, 0.08);
}

/* Row actions — icon-only buttons em vez do ghost-btn antigo */
.user-row-actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.user-row-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  cursor: pointer;
  transition: background 150ms, border-color 150ms, color 150ms;
}
.user-row-action:hover:not(:disabled) {
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
  color: var(--brand-text);
}
.user-row-action:disabled { opacity: 0.4; cursor: not-allowed; }
.user-row-action--edit:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
  color: var(--brand-primary);
}
.user-row-action--impersonate:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--brand-positive, #10b981) 35%, transparent);
  color: var(--brand-positive, #10b981);
}
.user-row-action--delete:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--brand-negative, #ef4444) 40%, transparent);
  background: color-mix(in srgb, var(--brand-negative, #ef4444) 10%, transparent);
  color: var(--brand-negative, #ef4444);
}

/* =========================================================
   Modal (edit + delete confirm) — compartilham markup base
   ========================================================= */
.user-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
}
.user-modal__panel {
  position: relative;
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  border-radius: 14px;
  background: var(--brand-surface);
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  box-shadow: 0 24px 64px -16px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}
.user-modal__panel--danger {
  border-color: color-mix(in srgb, var(--brand-negative, #ef4444) 30%, transparent);
}

.user-modal__head {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
}
.user-modal__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}
.user-modal__eyebrow--danger { color: var(--brand-negative, #ef4444); }
.user-modal__title {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 17px;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: var(--brand-text);
}
.user-modal__close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 0;
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms;
}
.user-modal__close:hover {
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  color: var(--brand-text);
}

.user-modal__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px;
}
.user-modal__lead {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}
.user-modal__detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--brand-text) 3%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 80%, transparent);
}

.user-modal__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.user-modal__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media (max-width: 540px) {
  .user-modal__grid { grid-template-columns: 1fr; }
}
.user-modal__label {
  font-size: 11px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
  letter-spacing: -0.005em;
}
.user-modal__hint {
  font-size: 10.5px;
  font-weight: 400;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
  font-style: italic;
}
.user-modal__input {
  padding: 9px 12px;
  border-radius: 7px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 14%, transparent);
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  color: var(--brand-text);
  font-family: var(--brand-font);
  font-size: 13px;
  outline: none;
  transition: border-color 150ms, box-shadow 150ms;
  appearance: none;
}
.user-modal__input:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 18%, transparent);
}
.user-modal__input:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.user-modal__error {
  display: inline-flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 6px;
  background: color-mix(in srgb, #ef4444 12%, transparent);
  color: #fca5a5;
  font-size: 11.5px;
  line-height: 1.45;
}

.user-modal__foot {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
  background: color-mix(in srgb, var(--brand-text) 1.5%, transparent);
}
.user-modal__btn-danger {
  background: var(--brand-negative, #ef4444) !important;
  color: #fff !important;
  border-color: var(--brand-negative, #ef4444) !important;
}
.user-modal__btn-danger:hover:not(:disabled) {
  filter: brightness(1.05);
}

.user-modal-enter-active,
.user-modal-leave-active {
  transition: opacity 200ms ease;
}
.user-modal-enter-from,
.user-modal-leave-to { opacity: 0; }
.user-modal-enter-active .user-modal__panel,
.user-modal-leave-active .user-modal__panel {
  transition: transform 220ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
.user-modal-enter-from .user-modal__panel { transform: translateY(20px) scale(0.96); }
.user-modal-leave-to .user-modal__panel { transform: translateY(8px) scale(0.98); }

.user-progress-chips {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.admin-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
.admin-pagination__info {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.admin-pagination__info strong {
  color: var(--brand-text);
  font-weight: 600;
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
  line-height: 1.5;
}
</style>

<!--
  /admin/users — platform users listing.

  Same visual contract as /admin/leads and /admin/tenants. The role
  column is interactive (admin / advisor / investor) so the panel
  can promote/demote inline without a separate detail screen. The
  approval column shows up only for advisors (the only role with a
  pending state today); investors and admins render a dash.

  Self-demote is blocked server-side; we also disable the row's
  role select for the active admin to make the affordance honest.
-->
<template>
  <NuxtLayout name="admin-panel">
    <div class="mx-auto flex max-w-6xl flex-col gap-6">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">Usuários</span>
          <h1 class="mt-2 text-[28px] leading-tight md:text-[36px]" :style="{ color: C.text, fontFamily: F.display }">
            Pessoas na plataforma.
          </h1>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
            :style="{ borderColor: C.border, color: C.textMuted }"
          >
            <span class="size-1.5 rounded-full" :style="{ backgroundColor: C.primary }" />
            {{ stats?.total ?? 0 }} total
            <template v-if="stats">
              · +{{ stats.last_7d }} em 7d
            </template>
          </span>
          <span
            v-if="stats && stats.pendingApproval > 0"
            class="inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 font-mono-tab text-[10px] uppercase tracking-[0.15em]"
            :style="{ borderColor: C.primary, color: C.primary }"
          >
            <UIcon name="i-lucide-clock" class="size-3" />
            {{ stats.pendingApproval }} aguardando aprovação
          </span>
        </div>
      </header>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por nome, email, login ou celular..."
          class="flex-1 min-w-[220px] rounded-sm border bg-transparent px-4 py-2 text-[13px] outline-none transition-colors"
          :style="{ borderColor: C.border, color: C.text }"
          @input="debouncedRefresh"
        />
        <select
          v-model="roleFilter"
          class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
          :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }"
          @change="refresh"
        >
          <option value="">Todos os papéis</option>
          <option value="admin">Admins</option>
          <option value="advisor">Assessores</option>
          <option value="investor">Investidores</option>
        </select>
        <select
          v-model="approvalFilter"
          class="rounded-sm border bg-transparent px-3 py-2 text-[13px] outline-none"
          :style="{ borderColor: C.border, color: C.text, backgroundColor: C.surface }"
          @change="refresh"
        >
          <option value="">Qualquer aprovação</option>
          <option value="pending">Pendentes</option>
          <option value="approved">Aprovados</option>
          <option value="rejected">Rejeitados</option>
        </select>
      </div>

      <!-- Table -->
      <div class="overflow-hidden rounded-sm border" :style="{ borderColor: C.border }">
        <table class="w-full text-left">
          <caption class="sr-only">Lista de usuários da plataforma</caption>
          <thead
            class="font-mono-tab text-[10px] uppercase tracking-[0.18em]"
            :style="{ color: C.textMuted, backgroundColor: C.surface }"
          >
            <tr>
              <th scope="col" class="px-4 py-3">CADASTRADO</th>
              <th scope="col" class="px-4 py-3">NOME / EMAIL</th>
              <th scope="col" class="px-4 py-3">LOGIN / CELULAR</th>
              <th scope="col" class="px-4 py-3 text-center">PAPEL</th>
              <th scope="col" class="px-4 py-3 text-center">APROVAÇÃO</th>
              <th scope="col" class="px-4 py-3">ASSESSOR</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="p-8 text-center" :style="{ color: C.textMuted }">
                <UIcon name="i-lucide-loader-2" class="size-5 motion-safe:animate-spin" />
              </td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="6" class="p-8 text-center text-[13px]" :style="{ color: C.textMuted }">
                Nenhum usuário encontrado com esses filtros.
              </td>
            </tr>
            <tr
              v-for="user in items"
              v-else
              :key="user.id"
              class="border-t transition-colors"
              :style="{ borderColor: C.border, backgroundColor: C.surface }"
            >
              <td class="px-4 py-3 font-mono-tab text-[11px] tabular-nums" :style="{ color: C.textMuted }">
                {{ formatDate(user.created_at) }}
              </td>
              <th scope="row" class="px-4 py-3 text-left font-normal" :style="{ color: C.text }">
                <div class="flex flex-col">
                  <span class="text-[13px] font-medium">{{ user.name }}</span>
                  <span class="font-mono-tab text-[11px]" :style="{ color: C.textMuted }">{{ user.email }}</span>
                </div>
              </th>
              <td class="px-4 py-3">
                <div class="flex flex-col">
                  <span class="font-mono-tab text-[11px]" :style="{ color: C.text }">{{ user.login || '-' }}</span>
                  <span class="font-mono-tab text-[11px]" :style="{ color: C.textMuted }">{{ user.celular || '-' }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-center">
                <select
                  :value="user.role"
                  :disabled="busyIds.has(user.id) || isSelf(user)"
                  :title="isSelf(user) ? 'Você não pode alterar o próprio papel' : 'Alterar papel'"
                  class="rounded-sm border bg-transparent px-2 py-1 font-mono-tab text-[10px] uppercase tracking-[0.15em] outline-none transition-colors disabled:opacity-50"
                  :style="roleSelectStyle(user.role)"
                  @change="(event) => handleRoleChange(user, event)"
                >
                  <option value="admin">ADMIN</option>
                  <option value="advisor">ASSESSOR</option>
                  <option value="investor">INVESTIDOR</option>
                </select>
              </td>
              <td class="px-4 py-3 text-center">
                <template v-if="user.role === 'advisor'">
                  <select
                    :value="user.approval_status ?? 'pending'"
                    :disabled="busyIds.has(user.id)"
                    class="rounded-sm border bg-transparent px-2 py-1 font-mono-tab text-[10px] uppercase tracking-[0.15em] outline-none transition-colors disabled:opacity-50"
                    :style="approvalSelectStyle(user.approval_status)"
                    @change="(event) => handleApprovalChange(user, event)"
                  >
                    <option value="pending">PENDENTE</option>
                    <option value="approved">APROVADO</option>
                    <option value="rejected">REJEITADO</option>
                  </select>
                </template>
                <span v-else :style="{ color: C.textMuted }">-</span>
              </td>
              <td class="px-4 py-3 font-mono-tab text-[11px]" :style="{ color: C.textMuted }">
                <template v-if="user.advisor">
                  <span :style="{ color: C.text }">{{ user.advisor.name }}</span>
                  <span v-if="user.advisor.advisor_code" class="ml-1">({{ user.advisor.advisor_code }})</span>
                </template>
                <span v-else>-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="meta && meta.last_page > 1"
        class="flex items-center justify-between font-mono-tab text-[11px]"
        :style="{ color: C.textMuted }"
      >
        <span>Página {{ meta.current_page }} de {{ meta.last_page }} · {{ meta.total }} resultados</span>
        <div class="inline-flex gap-2">
          <button
            type="button"
            class="rounded-sm border px-3 py-1.5 uppercase tracking-[0.15em] transition-colors hover:opacity-80 disabled:opacity-40"
            :style="{ borderColor: C.border, color: C.text }"
            :disabled="meta.current_page <= 1 || loading"
            @click="changePage(meta.current_page - 1)"
          >Anterior</button>
          <button
            type="button"
            class="rounded-sm border px-3 py-1.5 uppercase tracking-[0.15em] transition-colors hover:opacity-80 disabled:opacity-40"
            :style="{ borderColor: C.border, color: C.text }"
            :disabled="meta.current_page >= meta.last_page || loading"
            @click="changePage(meta.current_page + 1)"
          >Próxima</button>
        </div>
      </div>

      <div v-if="error" class="rounded-sm border px-4 py-3 text-[13px]" :style="{ borderColor: C.negative, color: C.negative }">
        {{ error }}
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F } from '~/utils/redentiaCreativeColors'
import type { IAdminUser, IUserStats, UserRole, ApprovalStatus } from '~/types/admin-user'

definePageMeta({ middleware: ['admin-panel'] })

const usersService = useAdminUsersService()
const auth = useAuthStore()

const items = ref<IAdminUser[]>([])
const meta = ref<{ current_page: number; last_page: number; per_page: number; total: number } | null>(null)
const stats = ref<IUserStats | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const search = ref('')
const roleFilter = ref<'' | UserRole>('')
const approvalFilter = ref<'' | ApprovalStatus>('')
const page = ref(1)

const busyIds = reactive(new Set<number>())
// `auth.me.id` is normalised to a string by the auth store; the
// user list comes back with numeric ids straight from the DB. We
// compare as strings so the self-demote guard works regardless.
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
    // Revert the visible select to the previous role on failure.
    target.value = user.role
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

function roleSelectStyle(role: UserRole) {
  // admin = primary amber, advisor = positive cyan, investor = neutral.
  // Communicates "elevated privilege" without leaning on red.
  const map: Record<UserRole, { borderColor: string; color: string }> = {
    admin: { borderColor: C.primary, color: C.primary },
    advisor: { borderColor: C.positive, color: C.positive },
    investor: { borderColor: C.border, color: C.text },
  }
  return { ...map[role], backgroundColor: 'transparent' }
}

function approvalSelectStyle(status: ApprovalStatus | null) {
  const safe: ApprovalStatus = status ?? 'pending'
  const map: Record<ApprovalStatus, { borderColor: string; color: string }> = {
    pending: { borderColor: C.primary, color: C.primary },
    approved: { borderColor: C.positive, color: C.positive },
    rejected: { borderColor: C.negative, color: C.negative },
  }
  return { ...map[safe], backgroundColor: 'transparent' }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(() => {
  refresh()
  refreshStats()
})
</script>

<style scoped>
.font-mono-tab {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-feature-settings: 'tnum' 1;
}
</style>

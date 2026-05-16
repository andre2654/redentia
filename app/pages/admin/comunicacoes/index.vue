<!--
  /admin/comunicacoes — index card-based.

  Substitui a tabela densa por uma grid de cards com preview visual
  de cada campanha. Cada card mostra:
    - Status pill (active/draft/paused/...) no canto sup-direito
    - Tipo + ícone colorido
    - Título grande
    - Snippet do body (max 2 linhas)
    - Audiência + tenant chip
    - Stats inline (impressions / clicks / dismissals / votes)
    - Hover: actions row aparece (toggle, edit, duplicate, delete)

  Filtros no topo: tabs por tipo + busca + status select.
-->
<template>
  <NuxtLayout name="admin-panel">
    <div class="mx-auto flex max-w-7xl flex-col gap-6">
      <!-- Header -->
      <header class="flex flex-wrap items-end justify-between gap-3">
        <div class="flex flex-col gap-1">
          <span class="eyebrow">Engajamento</span>
          <h1 class="display-h1">Comunicações</h1>
          <p class="lead">
            Gerencie banners, comunicados, CTAs, modais, enquetes e emails, todos os pontos de contato com o usuário num único lugar.
          </p>
        </div>
        <NuxtLink to="/admin/comunicacoes/new" class="primary-cta">
          <UIcon name="i-lucide-plus" class="size-4" />
          Nova campanha
        </NuxtLink>
      </header>

      <!-- Filters bar (sticky-ish) -->
      <div class="filters">
        <!-- Tabs por tipo -->
        <div class="filters__tabs">
          <button
            v-for="t in typeTabs"
            :key="t.value || 'all'"
            type="button"
            class="filter-tab"
            :class="{ 'filter-tab--active': activeType === t.value }"
            @click="activeType = t.value; reload()"
          >
            <UIcon v-if="t.icon" :name="t.icon" class="size-3.5" />
            <span>{{ t.label }}</span>
            <span v-if="counts[t.value || 'all']" class="filter-tab__count">
              {{ counts[t.value || 'all'] }}
            </span>
          </button>
        </div>

        <!-- Search + Status -->
        <div class="filters__right">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Buscar por título..."
            size="sm"
            class="w-56"
            @update:model-value="onSearchChange"
          />
          <USelect
            v-model="statusFilter"
            :items="[
              { label: 'Todos os status', value: '' },
              { label: 'Ativas', value: 'active' },
              { label: 'Agendadas', value: 'scheduled' },
              { label: 'Rascunhos', value: 'draft' },
              { label: 'Pausadas', value: 'paused' },
              { label: 'Encerradas', value: 'ended' },
            ]"
            size="sm"
            @update:model-value="reload()"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <UIcon name="i-lucide-loader-2" class="size-6 motion-safe:animate-spin" />
      </div>

      <!-- Empty state -->
      <div v-else-if="!items.length" class="empty">
        <div class="empty__icon">
          <UIcon name="i-lucide-megaphone" class="size-8" />
        </div>
        <h2 class="empty__title">Nenhuma campanha aqui ainda</h2>
        <p class="empty__subtitle">
          Crie sua primeira campanha para começar a se comunicar com os usuários.
        </p>
        <NuxtLink to="/admin/comunicacoes/new" class="primary-cta">
          <UIcon name="i-lucide-plus" class="size-3.5" />
          Criar primeira campanha
        </NuxtLink>
      </div>

      <!-- Cards grid -->
      <div v-else class="cards-grid">
        <article
          v-for="row in items"
          :key="row.id"
          class="card"
          :class="`card--${row.type}`"
          @click="$router.push(`/admin/comunicacoes/${row.id}`)"
        >
          <!-- Top: type chip + status -->
          <header class="card__top">
            <span class="card__type-chip" :style="typeChipStyle(row.type)">
              <UIcon :name="typeIcon(row.type)" class="size-3" />
              {{ typeLabel(row.type) }}
            </span>
            <span class="card__status" :class="`card__status--${row.status}`">
              <span class="card__status-dot" />
              {{ statusLabel(row.status) }}
            </span>
          </header>

          <!-- Body -->
          <div class="card__body">
            <h3 class="card__title">{{ row.title }}</h3>
            <p v-if="row.body" class="card__snippet">{{ row.body }}</p>
            <p v-else class="card__snippet card__snippet--empty">
              <em>Sem corpo de texto</em>
            </p>
          </div>

          <!-- Meta chips -->
          <div class="card__meta">
            <span class="card__chip">
              <UIcon :name="audienceIcon(row.target_audience)" class="size-3" />
              {{ audienceLabel(row.target_audience) }}
            </span>
            <span class="card__chip card__chip--muted">
              <UIcon
                :name="row.tenant_id ? 'i-lucide-building-2' : 'i-lucide-globe'"
                class="size-3"
              />
              {{ row.tenant_id ? `Tenant #${row.tenant_id}` : 'Global' }}
            </span>
            <span v-if="row.placement" class="card__chip card__chip--muted">
              <UIcon name="i-lucide-map-pin" class="size-3" />
              {{ placementLabel(row.placement) }}
            </span>
          </div>

          <!-- Stats footer -->
          <footer class="card__stats">
            <div class="card__stat">
              <span class="card__stat-label">Impr.</span>
              <span class="card__stat-value">{{ row.impressions }}</span>
            </div>
            <div class="card__stat">
              <span class="card__stat-label">Cliques</span>
              <span class="card__stat-value">{{ row.clicks }}</span>
            </div>
            <div class="card__stat">
              <span class="card__stat-label">CTR</span>
              <span class="card__stat-value">{{ ctr(row) }}%</span>
            </div>
            <div v-if="row.type === 'poll'" class="card__stat">
              <span class="card__stat-label">Votos</span>
              <span class="card__stat-value">{{ row.votes }}</span>
            </div>
          </footer>

          <!-- Actions overlay (hover) -->
          <div class="card__actions">
            <button
              type="button"
              class="card__action"
              :title="row.status === 'active' ? 'Pausar' : 'Ativar'"
              :style="{ color: row.status === 'active' ? 'var(--brand-warning)' : 'var(--brand-positive)' }"
              @click.stop="onToggle(row)"
            >
              <UIcon
                :name="row.status === 'active' ? 'i-lucide-pause' : 'i-lucide-play'"
                class="size-3.5"
              />
            </button>
            <button
              type="button"
              class="card__action"
              title="Duplicar"
              @click.stop="onDuplicate(row)"
            >
              <UIcon name="i-lucide-copy" class="size-3.5" />
            </button>
            <button
              type="button"
              class="card__action card__action--danger"
              title="Apagar"
              @click.stop="onDelete(row)"
            >
              <UIcon name="i-lucide-trash-2" class="size-3.5" />
            </button>
          </div>
        </article>
      </div>

      <!-- Pagination -->
      <div v-if="lastPage > 1" class="pagination">
        <button
          type="button"
          class="page-btn"
          :disabled="page <= 1"
          @click="page--; reload()"
        >
          <UIcon name="i-lucide-chevron-left" class="size-3.5" />
          Anterior
        </button>
        <span class="page-counter">Página {{ page }} de {{ lastPage }}</span>
        <button
          type="button"
          class="page-btn"
          :disabled="page >= lastPage"
          @click="page++; reload()"
        >
          Próxima
          <UIcon name="i-lucide-chevron-right" class="size-3.5" />
        </button>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { CommunicationAdmin, CommunicationType, CommunicationStatus, CommunicationPlacement } from '~/services/communications'

definePageMeta({ middleware: ['admin-panel'] })

const service = useAdminCommunicationsService()

const items = ref<CommunicationAdmin[]>([])
const loading = ref(true)
const page = ref(1)
const lastPage = ref(1)
const search = ref('')
const activeType = ref<CommunicationType | ''>('')
const statusFilter = ref<CommunicationStatus | ''>('')
const counts = ref<Record<string, number>>({})

const typeTabs: { value: CommunicationType | ''; label: string; icon?: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'banner', label: 'Banners', icon: 'i-lucide-flag' },
  { value: 'announcement', label: 'Comunicados', icon: 'i-lucide-megaphone' },
  { value: 'cta', label: 'CTAs', icon: 'i-lucide-mouse-pointer-click' },
  { value: 'modal', label: 'Modais', icon: 'i-lucide-square-stack' },
  { value: 'poll', label: 'Enquetes', icon: 'i-lucide-bar-chart-3' },
  { value: 'notification', label: 'Notificações', icon: 'i-lucide-bell' },
  { value: 'email', label: 'Emails', icon: 'i-lucide-mail' },
]

let searchTimer: ReturnType<typeof setTimeout> | null = null
function onSearchChange() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    reload()
  }, 300)
}

async function reload() {
  loading.value = true
  try {
    const params: any = { page: page.value, per_page: 20 }
    if (activeType.value) params.type = activeType.value
    if (statusFilter.value) params.status = statusFilter.value
    if (search.value) params.search = search.value

    const resp = await service.list(params)
    items.value = resp.data
    lastPage.value = resp.last_page

    counts.value = items.value.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    counts.value['all'] = resp.total
  } catch (e) {
    console.error('[admin/comunicacoes] reload failed', e)
  } finally {
    loading.value = false
  }
}

async function onToggle(row: CommunicationAdmin) {
  try {
    const updated = await service.toggle(row.id)
    const idx = items.value.findIndex((i) => i.id === row.id)
    if (idx >= 0) items.value[idx] = updated
    showSuccessNotification('Status alterado', `Campanha agora ${statusLabel(updated.status).toLowerCase()}`)
  } catch (e: any) {
    showErrorNotification('Erro', e?.data?.message ?? 'Falha ao alterar status')
  }
}

async function onDuplicate(row: CommunicationAdmin) {
  try {
    await service.duplicate(row.id)
    showSuccessNotification('Duplicada', 'Cópia criada como rascunho')
    await reload()
  } catch (e: any) {
    showErrorNotification('Erro', e?.data?.message ?? 'Falha ao duplicar')
  }
}

async function onDelete(row: CommunicationAdmin) {
  if (!confirm(`Apagar "${row.title}"?`)) return
  try {
    await service.destroy(row.id)
    items.value = items.value.filter((i) => i.id !== row.id)
    showSuccessNotification('Apagada', 'Campanha removida')
  } catch (e: any) {
    showErrorNotification('Erro', e?.data?.message ?? 'Falha ao apagar')
  }
}

// =================================================================
// Helpers de label
// =================================================================
function typeLabel(t: CommunicationType): string {
  return ({
    banner: 'Banner',
    announcement: 'Comunicado',
    cta: 'CTA',
    modal: 'Modal',
    poll: 'Enquete',
    notification: 'Notificação',
    email: 'Email',
  } as const)[t]
}

function typeIcon(t: CommunicationType): string {
  return ({
    banner: 'i-lucide-flag',
    announcement: 'i-lucide-megaphone',
    cta: 'i-lucide-mouse-pointer-click',
    modal: 'i-lucide-square-stack',
    poll: 'i-lucide-bar-chart-3',
    notification: 'i-lucide-bell',
    email: 'i-lucide-mail',
  } as const)[t]
}

function typeChipStyle(t: CommunicationType) {
  const color = ({
    banner: '#3b82f6',
    announcement: '#8b5cf6',
    cta: 'var(--brand-warning)',
    modal: '#06b6d4',
    poll: '#ec4899',
    notification: '#a855f7',
    email: 'var(--brand-positive)',
  } as const)[t]
  return {
    backgroundColor: `${color}1a`,
    color,
    borderColor: `${color}40`,
  }
}

function statusLabel(s: CommunicationStatus): string {
  return ({
    draft: 'Rascunho',
    scheduled: 'Agendada',
    active: 'Ativa',
    paused: 'Pausada',
    ended: 'Encerrada',
  } as const)[s]
}

function audienceLabel(a: string): string {
  return ({
    all: 'Todos',
    authenticated: 'Logados',
    guests: 'Visitantes',
    investors: 'Investidores',
    advisors: 'Assessores',
    admins: 'Admins',
    specific: 'Específicos',
  } as Record<string, string>)[a] || a
}

function audienceIcon(a: string): string {
  return ({
    all: 'i-lucide-users',
    authenticated: 'i-lucide-user-check',
    guests: 'i-lucide-user',
    investors: 'i-lucide-trending-up',
    advisors: 'i-lucide-briefcase',
    admins: 'i-lucide-shield',
    specific: 'i-lucide-target',
  } as Record<string, string>)[a] || 'i-lucide-users'
}

function placementLabel(p: CommunicationPlacement): string {
  return ({
    'top': 'Topo',
    'sidebar': 'Sidebar',
    'wallet-hero': 'Wallet hero',
    'help-prompt': 'Chat vazio',
    'home-cta': 'Home',
    'feed': 'Feed',
    'modal': 'Modal',
    'inbox': 'Inbox',
  } as Record<string, string>)[p] || p
}

function ctr(row: CommunicationAdmin): string {
  if (row.impressions <= 0) return '0,0'
  return ((row.clicks / row.impressions) * 100).toFixed(1).replace('.', ',')
}

onMounted(() => reload())
</script>

<style scoped>
.eyebrow {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-feature-settings: 'tnum' 1;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--brand-primary);
}

.display-h1 {
  font-family: var(--brand-font);
  font-weight: 300;
  font-size: clamp(26px, 4vw, 32px);
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
  margin: 0;
}

.lead {
  margin: 0;
  max-width: 580px;
  font-size: 13px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

.primary-cta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 16px;
  border-radius: 9px;
  background: var(--brand-primary);
  color: var(--text-on-primary, #1a0a2e);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
  text-decoration: none;
  border: 0;
  cursor: pointer;
  transition: filter 150ms, transform 120ms;
  box-shadow: 0 8px 18px -10px color-mix(in srgb, var(--brand-primary) 60%, transparent);
}

.primary-cta:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

/* ============ FILTERS BAR ============ */
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
}

.filters__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 7px;
  background: transparent;
  border: 1px solid transparent;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms, border-color 150ms;
}

.filter-tab:hover {
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  color: color-mix(in srgb, var(--brand-text) 85%, transparent);
}

.filter-tab--active {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 32%, transparent);
  color: var(--brand-primary);
}

.filter-tab__count {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 9.5px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
}

.filter-tab--active .filter-tab__count {
  background: color-mix(in srgb, var(--brand-primary) 28%, transparent);
}

.filters__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ============ LOADING / EMPTY ============ */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  padding: 60px 24px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--brand-text) 2%, transparent);
  border: 1px dashed color-mix(in srgb, var(--brand-text) 10%, transparent);
}

.empty__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  color: var(--brand-primary);
}

.empty__title {
  margin: 4px 0 0;
  font-family: var(--brand-font);
  font-size: 18px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 90%, transparent);
}

.empty__subtitle {
  margin: 0 0 12px;
  font-size: 13px;
  max-width: 380px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

/* ============ CARDS GRID ============ */
.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 768px) {
  .cards-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1280px) {
  .cards-grid { grid-template-columns: repeat(3, 1fr); }
}

/* ============ CARD ============ */
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 13px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  cursor: pointer;
  transition: border-color 200ms, transform 200ms, box-shadow 200ms;
  overflow: hidden;
}

.card:hover {
  border-color: color-mix(in srgb, var(--brand-text) 16%, transparent);
  transform: translateY(-2px);
  box-shadow: 0 14px 30px -16px rgba(0, 0, 0, 0.5);
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--card-accent, transparent);
  opacity: 0.7;
}

.card--banner { --card-accent: #3b82f6; }
.card--announcement { --card-accent: #8b5cf6; }
.card--cta { --card-accent: var(--brand-warning); }
.card--modal { --card-accent: #06b6d4; }
.card--poll { --card-accent: #ec4899; }
.card--notification { --card-accent: #a855f7; }
.card--email { --card-accent: var(--brand-positive); }

/* TOP: type chip + status */
.card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card__type-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.card__status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.card__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
}

.card__status--active { color: var(--brand-positive); }
.card__status--active .card__status-dot {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-positive) 20%, transparent);
  animation: status-pulse 2.4s ease-in-out infinite;
}
.card__status--scheduled { color: #06b6d4; }
.card__status--draft { color: color-mix(in srgb, var(--brand-text) 50%, transparent); }
.card__status--paused { color: var(--brand-warning); }
.card__status--ended { color: color-mix(in srgb, var(--brand-text) 40%, transparent); }

@keyframes status-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
}

/* BODY */
.card__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.card__title {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.012em;
  line-height: 1.3;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__snippet {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__snippet--empty { color: color-mix(in srgb, var(--brand-text) 30%, transparent); font-style: italic; }

/* META chips */
.card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.card__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 5px;
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}

.card__chip--muted {
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

/* STATS */
.card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
}

.card__stats:has(.card__stat:nth-child(4)) {
  grid-template-columns: repeat(4, 1fr);
}

.card__stat {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.card__stat-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 40%, transparent);
}

.card__stat-value {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 14px;
  font-weight: 600;
  color: color-mix(in srgb, var(--brand-text) 92%, transparent);
}

/* ACTIONS overlay */
.card__actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 7px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 180ms, transform 180ms;
}

.card:hover .card__actions {
  opacity: 1;
  transform: translateY(0);
}

.card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 5px;
  background: transparent;
  border: 0;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
  cursor: pointer;
  transition: background 150ms, color 150ms;
}

.card__action:hover {
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  color: color-mix(in srgb, var(--brand-text) 100%, transparent);
}

.card__action--danger:hover {
  background: rgba(220, 38, 38, 0.15);
  color: var(--brand-negative);
}

/* ============ PAGINATION ============ */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 13px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  font-size: 12px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 85%, transparent);
  cursor: pointer;
  transition: background 150ms, opacity 150ms;
}

.page-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-counter {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
</style>

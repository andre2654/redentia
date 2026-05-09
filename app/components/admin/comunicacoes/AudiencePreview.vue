<!--
  AudiencePreview — card que mostra EXATAMENTE quem vai receber a
  comunicacao com os filtros configurados no form.

  Feature dorsal: bate em POST /admin/communications/audience-preview
  com os parametros atuais do form (sem precisar salvar). O backend
  resolve a query (audience + tenant + min_aum + has_connections +
  user_ids especificos) e devolve count + sample(5) + by_role.

  Auto-refresh: watch debounced (350ms) nos campos relevantes do form.
  Toda vez que admin muda algo (audience, tenant, AUM, conexoes,
  lista de users), recarrega o preview.

  Estados:
    - loading: skeleton
    - empty (count=0): warn vermelho "ninguem vai receber"
    - anonymous (audience='guests'): texto qualitativo (nao temos contagem)
    - normal: count grande + chips de role + lista de 5 users de amostra

  Props: form com os mesmos campos que vao no body do POST.
  Sem emits — read-only display.
-->
<template>
  <div class="audience-preview">
    <header class="audience-preview__head">
      <span class="audience-preview__eyebrow">Vai chegar pra</span>
      <span v-if="!loading && !error" class="audience-preview__refresh-hint" :title="lastFetched">
        <UIcon
          v-if="loading"
          name="i-lucide-loader-2"
          class="size-3 motion-safe:animate-spin"
        />
        <UIcon v-else name="i-lucide-check" class="size-3" />
        atualizado
      </span>
      <span v-else-if="loading" class="audience-preview__refresh-hint audience-preview__refresh-hint--loading">
        <UIcon name="i-lucide-loader-2" class="size-3 motion-safe:animate-spin" />
        calculando…
      </span>
      <span v-else-if="error" class="audience-preview__refresh-hint audience-preview__refresh-hint--error" :title="error">
        <UIcon name="i-lucide-alert-circle" class="size-3" />
        falhou
      </span>
    </header>

    <!-- LOADING SKELETON (1ª carga) -->
    <div v-if="loading && !data" class="audience-preview__skel">
      <div class="audience-preview__skel-num" />
      <div class="audience-preview__skel-line audience-preview__skel-line--w70" />
      <div class="audience-preview__skel-line audience-preview__skel-line--w50" />
    </div>

    <!-- ERROR -->
    <div v-else-if="error && !data" class="audience-preview__error">
      <UIcon name="i-lucide-alert-circle" class="size-4 shrink-0" />
      <div class="audience-preview__error-body">
        <span>Não consegui calcular agora.</span>
        <code class="audience-preview__error-detail">{{ error }}</code>
        <button type="button" class="audience-preview__error-retry" @click="fetchPreview">
          <UIcon name="i-lucide-refresh-cw" class="size-3" />
          Tentar de novo
        </button>
      </div>
    </div>

    <!-- DATA -->
    <template v-else-if="data">
      <!-- ANONYMOUS (guests) — count nao se aplica -->
      <div v-if="data.is_anonymous" class="audience-preview__anon">
        <UIcon name="i-lucide-globe" class="size-5" />
        <div class="audience-preview__anon-text">
          <span class="audience-preview__anon-title">Visitantes anônimos</span>
          <span class="audience-preview__anon-sub">Não rastreamos visitantes individualmente — toda vez que alguém acessa, o banner aparece.</span>
        </div>
      </div>

      <!-- COUNT GRANDE -->
      <template v-else>
        <div class="audience-preview__count-row">
          <span class="audience-preview__count" :class="{ 'audience-preview__count--zero': data.count === 0 }">
            {{ formatNumber(data.count ?? 0) }}
          </span>
          <span class="audience-preview__count-label">
            {{ (data.count ?? 0) === 1 ? 'usuário vai ver' : 'usuários vão ver' }}
          </span>
        </div>

        <!-- ZERO state -->
        <div v-if="data.count === 0" class="audience-preview__empty">
          <UIcon name="i-lucide-alert-triangle" class="size-3.5" />
          Ninguém atende aos filtros configurados. Revise audiência, tenant ou filtros adicionais.
        </div>

        <!-- BREAKDOWN POR ROLE -->
        <div
          v-else-if="hasRoleBreakdown"
          class="audience-preview__roles"
        >
          <span
            v-for="(count, role) in data.by_role"
            :key="role"
            class="role-chip"
            :class="`role-chip--${role}`"
          >
            <UIcon :name="roleIcon(role as string)" class="size-3" />
            <strong>{{ formatNumber(count) }}</strong>
            <span>{{ roleLabel(role as string, count) }}</span>
          </span>
        </div>

        <!-- AMOSTRA (primeiros 5) -->
        <div v-if="data.sample && data.sample.length" class="audience-preview__sample">
          <span class="audience-preview__sample-label">Amostra:</span>
          <ul class="audience-preview__sample-list">
            <li
              v-for="u in data.sample"
              :key="u.id"
              class="sample-row"
            >
              <span class="sample-row__avatar" :data-role="u.role">
                {{ initialsOf(u.name || u.email || `#${u.id}`) }}
              </span>
              <span class="sample-row__main">
                <span class="sample-row__name">{{ u.name || `Usuário #${u.id}` }}</span>
                <span class="sample-row__meta">{{ u.email || '—' }}</span>
              </span>
              <span class="sample-row__role" :data-role="u.role">{{ roleShort(u.role) }}</span>
            </li>
          </ul>
          <span
            v-if="(data.count ?? 0) > data.sample.length"
            class="audience-preview__more"
          >
            + {{ formatNumber((data.count ?? 0) - data.sample.length) }} {{ ((data.count ?? 0) - data.sample.length) === 1 ? 'outro usuário' : 'outros usuários' }}
          </span>
        </div>

        <!-- FILTROS APLICADOS (tag chips) -->
        <div v-if="hasActiveFilters" class="audience-preview__filters">
          <span class="audience-preview__filters-label">Filtros ativos:</span>
          <span v-if="data.tenant_id" class="filter-chip">
            <UIcon name="i-lucide-building-2" class="size-3" />
            Tenant #{{ data.tenant_id }}
          </span>
          <span v-else class="filter-chip filter-chip--muted">
            <UIcon name="i-lucide-globe" class="size-3" />
            Global
          </span>
          <span v-if="data.filters?.min_aum" class="filter-chip">
            <UIcon name="i-lucide-coins" class="size-3" />
            AUM ≥ R$ {{ formatNumber(data.filters.min_aum) }}
          </span>
          <span v-if="data.filters?.has_connections === true" class="filter-chip">
            <UIcon name="i-lucide-link" class="size-3" />
            Open Finance
          </span>
          <span v-if="data.filters?.has_connections === false" class="filter-chip">
            <UIcon name="i-lucide-unlink" class="size-3" />
            Sem Open Finance
          </span>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AudiencePreview, CommunicationAudience, CommunicationType } from '~/services/communications'

const props = defineProps<{
  type: CommunicationType
  tenantId: number | null
  audience: CommunicationAudience
  userIds: number[]
  minAum: number | null
  hasConnections: boolean | null
}>()

const service = useAdminCommunicationsService()

const data = ref<AudiencePreview | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const lastFetched = ref<string>('')

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let abortToken = 0

async function fetchPreview() {
  // Validacao basica antes de bater
  if (!props.audience) return
  // Se audience=specific e nao tem ids, nao precisa bater (count = 0
  // por definicao, e o backend ja sabe disso, mas evitamos request).
  // Backend tambem trata, entao podemos bater sem problema.

  const myToken = ++abortToken
  loading.value = true
  error.value = null

  try {
    const resp = await service.audiencePreview({
      type: props.type,
      tenant_id: props.tenantId,
      target_audience: props.audience,
      target_user_ids: props.userIds.length ? props.userIds : null,
      target_min_aum: props.minAum,
      target_has_connections: props.hasConnections,
    })
    // Race-protection: se outro request foi disparado depois, ignora resultado deste
    if (myToken !== abortToken) return
    data.value = resp
    lastFetched.value = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch (e: any) {
    if (myToken !== abortToken) return
    // Surface error: validation messages do Laravel vem em `e.data.errors`
    // (objeto field→[messages]) ou `e.data.message`. Outros erros usam `e.message`.
    let msg = e?.data?.message || e?.message || 'Falha ao calcular audiência'
    if (e?.data?.errors && typeof e.data.errors === 'object') {
      const fieldErrors = Object.entries(e.data.errors)
        .map(([field, msgs]) => `${field}: ${(msgs as string[])[0]}`)
        .join('; ')
      msg = `${msg} (${fieldErrors})`
    }
    if (e?.status || e?.statusCode) {
      msg = `${e.status || e.statusCode}: ${msg}`
    }
    // Log no console pra debug — admin pode copiar e mostrar
    console.error('[audience-preview] failed', { error: e, payload: {
      type: props.type, audience: props.audience, tenant_id: props.tenantId,
      userIds: props.userIds, minAum: props.minAum, hasConnections: props.hasConnections,
    } })
    error.value = msg
  } finally {
    if (myToken === abortToken) loading.value = false
  }
}

function scheduleFetch() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchPreview, 350)
}

watch(
  () => [props.type, props.tenantId, props.audience, props.userIds.join(','), props.minAum, props.hasConnections],
  scheduleFetch,
  { immediate: true },
)

// =================================================================
// Helpers
// =================================================================
function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  return new Intl.NumberFormat('pt-BR').format(n)
}

const hasRoleBreakdown = computed(() => {
  if (!data.value?.by_role) return false
  return Object.keys(data.value.by_role).length > 0
})

const hasActiveFilters = computed(() => {
  const f = data.value?.filters
  if (!f) return data.value?.tenant_id != null
  return (
    !!data.value.tenant_id ||
    !!f.min_aum ||
    f.has_connections !== null
  )
})

function roleIcon(role: string): string {
  return ({
    investor: 'i-lucide-trending-up',
    advisor: 'i-lucide-briefcase',
    admin: 'i-lucide-shield',
  } as Record<string, string>)[role] || 'i-lucide-user'
}

function roleLabel(role: string, count: number): string {
  const map: Record<string, [string, string]> = {
    investor: ['investidor', 'investidores'],
    advisor: ['assessor', 'assessores'],
    admin: ['admin', 'admins'],
  }
  const [singular, plural] = map[role] || [role, role + 's']
  return count === 1 ? singular : plural
}

function roleShort(role: string): string {
  return ({
    investor: 'INV',
    advisor: 'ASS',
    admin: 'ADM',
  } as Record<string, string>)[role] || role.slice(0, 3).toUpperCase()
}

function initialsOf(s: string): string {
  const parts = s.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
</script>

<style scoped>
.audience-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}

.audience-preview__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.audience-preview__eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.audience-preview__refresh-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 35%, transparent);
}
.audience-preview__refresh-hint--loading { color: color-mix(in srgb, var(--brand-text) 65%, transparent); }
.audience-preview__refresh-hint--error { color: #f87171; }

/* SKELETON */
.audience-preview__skel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.audience-preview__skel-num {
  height: 36px;
  width: 70%;
  border-radius: 8px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--brand-text) 4%, transparent), color-mix(in srgb, var(--brand-text) 8%, transparent), color-mix(in srgb, var(--brand-text) 4%, transparent));
  background-size: 200% 100%;
  animation: skel-shine 1.4s ease-in-out infinite;
}
.audience-preview__skel-line {
  height: 9px;
  border-radius: 5px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--brand-text) 4%, transparent), color-mix(in srgb, var(--brand-text) 8%, transparent), color-mix(in srgb, var(--brand-text) 4%, transparent));
  background-size: 200% 100%;
  animation: skel-shine 1.4s ease-in-out infinite;
}
.audience-preview__skel-line--w70 { width: 70%; }
.audience-preview__skel-line--w50 { width: 50%; }
@keyframes skel-shine {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ERROR */
.audience-preview__error {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-negative) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-negative) 30%, transparent);
  color: var(--brand-negative);
  font-size: 12px;
}
.audience-preview__error-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.audience-preview__error-detail {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  padding: 5px 8px;
  border-radius: 5px;
  background: color-mix(in srgb, var(--brand-negative) 8%, transparent);
  color: #fecaca;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 80px;
  overflow-y: auto;
}
.audience-preview__error-retry {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  padding: 4px 10px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--brand-negative) 35%, transparent);
  color: var(--brand-negative);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms;
}
.audience-preview__error-retry:hover {
  background: color-mix(in srgb, var(--brand-negative) 15%, transparent);
}

/* ANONYMOUS */
.audience-preview__anon {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 22%, transparent);
  color: var(--brand-primary);
}
.audience-preview__anon-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.audience-preview__anon-title {
  font-family: var(--brand-font);
  font-size: 14px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
}
.audience-preview__anon-sub {
  font-size: 11.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

/* COUNT */
.audience-preview__count-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.audience-preview__count {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
}
.audience-preview__count--zero { color: var(--brand-warning); }
.audience-preview__count-label {
  font-family: var(--brand-font);
  font-size: 13px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

/* EMPTY/ZERO state */
.audience-preview__empty {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--brand-warning) 12%, transparent);
  color: var(--brand-warning);
  font-size: 11.5px;
  line-height: 1.4;
}

/* ROLE BREAKDOWN */
.audience-preview__roles {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.role-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 85%, transparent);
}
.role-chip strong {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: 11.5px;
}
.role-chip span { color: color-mix(in srgb, var(--brand-text) 55%, transparent); }
.role-chip--investor { color: var(--brand-positive); border-color: rgba(52, 211, 153, 0.25); }
.role-chip--advisor { color: #c084fc; border-color: rgba(192, 132, 252, 0.25); }
.role-chip--admin { color: var(--brand-primary); border-color: color-mix(in srgb, var(--brand-primary) 30%, transparent); }

/* SAMPLE LIST */
.audience-preview__sample {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid color-mix(in srgb, var(--brand-text) 5%, transparent);
}
.audience-preview__sample-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 40%, transparent);
}
.audience-preview__sample-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.sample-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 4%, transparent);
}
.sample-row:last-child { border-bottom: 0; }
.sample-row__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 700;
  flex-shrink: 0;
}
.sample-row__avatar[data-role='advisor'] {
  background: color-mix(in srgb, #c084fc 14%, transparent);
  color: #c084fc;
}
.sample-row__avatar[data-role='admin'] {
  background: color-mix(in srgb, var(--brand-primary) 22%, transparent);
}
.sample-row__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.sample-row__name {
  font-size: 12px;
  font-weight: 500;
  color: color-mix(in srgb, var(--brand-text) 92%, transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sample-row__meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sample-row__role {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.14em;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid color-mix(in srgb, var(--brand-text) 10%, transparent);
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
.sample-row__role[data-role='investor'] { color: var(--brand-positive); border-color: rgba(52, 211, 153, 0.3); }
.sample-row__role[data-role='advisor'] { color: #c084fc; border-color: rgba(192, 132, 252, 0.3); }
.sample-row__role[data-role='admin'] { color: var(--brand-primary); border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent); }

.audience-preview__more {
  font-size: 11.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  padding: 4px 0 0;
}

/* FILTERS APPLIED */
.audience-preview__filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  padding-top: 8px;
  border-top: 1px solid color-mix(in srgb, var(--brand-text) 5%, transparent);
}
.audience-preview__filters-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 40%, transparent);
  margin-right: 4px;
}
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 22%, transparent);
  font-size: 10.5px;
  font-weight: 500;
  color: var(--brand-primary);
}
.filter-chip--muted {
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  border-color: color-mix(in srgb, var(--brand-text) 8%, transparent);
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
</style>

<!--
  /settings/integracoes — surface autenticada de gerenciamento de
  conexoes Open Finance (Pluggy).

  RESPONSABILIDADES:
    - Listar todas as conexoes do user (GET /api/pluggy/connections)
    - Permitir conectar nova conta (botao + widget)
    - Permitir forcar refresh manual (POST /api/pluggy/connections/{id}/sync)
    - Permitir desconectar com confirmacao (DELETE)
    - Tratar status: UPDATED / OUTDATED / LOGIN_ERROR / WAITING_USER_INPUT /
      UPDATING / CREATING / ERROR

  AUTO-REFRESH:
    Quando alguma conexao esta UPDATING ou CREATING, polla a cada 30s
    pra capturar o momento que ela vira UPDATED. Stop assim que nao tem
    mais conexao em estado transitorio.

  SEO:
    noindex,nofollow — pagina autenticada, nao indexar.
    Tambem listada no exclude do sitemap (nuxt.config.ts).
-->
<script setup lang="ts">
import type { PluggyConnection } from '~/services/pluggy'

definePageMeta({
  layout: 'default',
  hideInstallAppBanner: true,
})

usePageSeo({
  title: 'Integrações Open Finance | Redentia',
  description:
    'Conecte suas corretoras e bancos via Open Finance para sincronizar automaticamente sua carteira na Redentia.',
  path: '/settings/integracoes',
  robots: 'noindex,nofollow',
})

const pluggy = usePluggyService()
const { openWidget, isLoading: widgetLoading } = usePluggyWidget()

// Lista de conexoes + estados auxiliares por-conexao (sync/delete em
// flight). Mantemos como ref simples (nao useAsyncData) porque o
// polling + as mutacoes manuais sao simples de gerenciar com loadAll().
const connections = ref<PluggyConnection[]>([])
const loading = ref(true)
const errorMsg = ref<string | null>(null)
const syncingIds = ref<Set<number>>(new Set())
const deletingIds = ref<Set<number>>(new Set())

async function loadAll() {
  errorMsg.value = null
  try {
    connections.value = await pluggy.listConnections()
  } catch (err) {
    console.error('[integracoes] failed to load connections', err)
    errorMsg.value = 'Não foi possível carregar suas conexões. Tente recarregar a página.'
  } finally {
    loading.value = false
  }
}

// Polling timer — so liga quando alguma conexao esta em estado
// transitorio (UPDATING / CREATING). Fecha o timer assim que tudo
// estabiliza pra nao gastar request a toa.
const POLL_INTERVAL_MS = 30_000
let pollTimer: ReturnType<typeof setInterval> | null = null

const hasTransientState = computed(() =>
  connections.value.some((c) => c.status === 'UPDATING' || c.status === 'CREATING'),
)

watch(hasTransientState, (active) => {
  if (active && !pollTimer) {
    pollTimer = setInterval(() => {
      void loadAll()
    }, POLL_INTERVAL_MS)
  } else if (!active && pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
})

onMounted(() => {
  void loadAll()
})

// ============ ACTIONS ============

/** Abrir widget pra cadastrar conta nova. */
async function openConnectFlow() {
  await openWidget({
    onSuccess: async () => {
      showSuccessNotification(
        'Conta conectada',
        'Sincronização inicial em andamento. A página atualiza sozinha.',
      )
      await loadAll()
    },
    onError: (err) => {
      const msg
        = (err as { message?: string })?.message
        || 'Não foi possível abrir o conector. Tente novamente.'
      showErrorNotification('Erro ao conectar', msg)
    },
  })
}

/** Reauth flow: abre widget passando o item_id existente. Pluggy mostra
 *  o login da corretora pra renovar a sessao sem o user perder a conexao
 *  (mesmo backend connection_id, so atualiza credenciais). */
async function reconnect(conn: PluggyConnection) {
  await openWidget({
    itemId: conn.item_id,
    onSuccess: async () => {
      showSuccessNotification(
        'Conexão reautenticada',
        `${conn.institution_name} voltou a sincronizar.`,
      )
      await loadAll()
    },
    onError: (err) => {
      const msg
        = (err as { message?: string })?.message
        || 'Não foi possível reautenticar. Tente novamente.'
      showErrorNotification('Erro ao reautenticar', msg)
    },
  })
}

async function syncOne(conn: PluggyConnection) {
  if (syncingIds.value.has(conn.id)) return
  syncingIds.value.add(conn.id)
  try {
    const result = await pluggy.syncConnection(conn.id)
    if (result.status === 'rate_limited') {
      // Pluggy bloqueia refresh < 1h. Re-sync local ainda foi disparado
      // (le dados ja persistidos no Pluggy), so o refetch externo que
      // foi pulado. UI informa pra evitar confusao.
      const minutes = result.retry_after_minutes ?? 60
      showSuccessNotification(
        'Re-sincronizando dados existentes',
        `${conn.institution_name} foi atualizado recentemente. Próximo refresh completo em ~${minutes} min.`,
      )
    } else {
      showSuccessNotification(
        'Sincronização iniciada',
        `Buscando dados atualizados em ${conn.institution_name}.`,
      )
    }
    await loadAll()
  } catch (err) {
    const msg
      = (err as { message?: string })?.message
      || 'Não foi possível iniciar a sincronização.'
    showErrorNotification('Erro ao sincronizar', msg)
  } finally {
    syncingIds.value.delete(conn.id)
  }
}

async function disconnectOne(conn: PluggyConnection) {
  const ok = window.confirm(
    `Desconectar ${conn.institution_name}?\n\n`
      + 'Os ativos importados desta conexão serão removidos da sua carteira. '
      + 'Você pode reconectar a qualquer momento.',
  )
  if (!ok) return

  if (deletingIds.value.has(conn.id)) return
  deletingIds.value.add(conn.id)
  try {
    await pluggy.deleteConnection(conn.id)
    showSuccessNotification(
      'Conexão removida',
      `${conn.institution_name} foi desconectada.`,
    )
    await loadAll()
  } catch (err) {
    const msg
      = (err as { message?: string })?.message
      || 'Não foi possível desconectar agora.'
    showErrorNotification('Erro ao desconectar', msg)
  } finally {
    deletingIds.value.delete(conn.id)
  }
}

// ============ STATUS HELPERS ============

interface StatusVisual {
  label: string
  // tom semantico: positive (verde) | neutral (amber) | negative (vermelho) | info (azul)
  tone: 'positive' | 'neutral' | 'negative' | 'info'
  icon: string
}

function statusVisual(status: PluggyConnection['status']): StatusVisual {
  switch (status) {
    case 'UPDATED':
      return { label: 'Sincronizado', tone: 'positive', icon: 'i-lucide-circle-check' }
    case 'OUTDATED':
      return { label: 'Desatualizado', tone: 'neutral', icon: 'i-lucide-clock' }
    case 'LOGIN_ERROR':
      return { label: 'Reautentique', tone: 'negative', icon: 'i-lucide-key-round' }
    case 'WAITING_USER_INPUT':
      return { label: 'Verificação pendente', tone: 'neutral', icon: 'i-lucide-shield-question' }
    case 'UPDATING':
      return { label: 'Sincronizando...', tone: 'info', icon: 'i-lucide-loader-2' }
    case 'CREATING':
      return { label: 'Configurando...', tone: 'info', icon: 'i-lucide-loader-2' }
    case 'ERROR':
      return { label: 'Erro', tone: 'negative', icon: 'i-lucide-alert-triangle' }
    default:
      return { label: status, tone: 'neutral', icon: 'i-lucide-circle' }
  }
}

// Formata "ha 3h", "ha 2 dias" etc. a partir de uma string ISO.
function timeSince(iso: string | null): string {
  if (!iso) return 'nunca'
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return 'nunca'
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
    if (seconds < 60) return 'agora'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `há ${minutes}min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `há ${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 30) return `há ${days} ${days === 1 ? 'dia' : 'dias'}`
    const months = Math.floor(days / 30)
    if (months < 12) return `há ${months} ${months === 1 ? 'mês' : 'meses'}`
    return `há ${Math.floor(months / 12)} ano(s)`
  } catch {
    return 'nunca'
  }
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(value)
}
</script>

<template>
  <NuxtLayout title="Integrações Open Finance">
    <div class="integ-page">
      <!-- Back link -->
      <NuxtLink to="/settings" class="integ-back">
        <UIcon name="i-lucide-arrow-left" class="size-3.5" aria-hidden="true" />
        <span>Voltar para configurações do usuário</span>
      </NuxtLink>

      <!-- Header -->
      <header class="integ-header">
        <div class="integ-header__copy">
          <span class="integ-eyebrow">Open Finance</span>
          <h1 class="integ-title">
            Integrações
          </h1>
          <p class="integ-subtitle">
            Conecte suas corretoras e bancos pra sincronização automática da
            carteira. Suas credenciais nunca passam pela Redentia, tudo regulado
            pelo Banco Central.
          </p>
        </div>
        <div class="integ-header__action">
          <button
            type="button"
            class="integ-btn-primary"
            :disabled="widgetLoading"
            @click="openConnectFlow"
          >
            <UIcon
              :name="widgetLoading ? 'i-lucide-loader-2' : 'i-lucide-plus'"
              :class="['size-4', widgetLoading && 'motion-safe:animate-spin']"
              aria-hidden="true"
            />
            <span>{{ widgetLoading ? 'Abrindo...' : 'Conectar nova conta' }}</span>
          </button>
        </div>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="integ-loading">
        <UIcon
          name="i-lucide-loader-2"
          class="size-6 motion-safe:animate-spin"
          style="color: var(--brand-primary);"
          aria-hidden="true"
        />
      </div>

      <!-- Error state -->
      <div v-else-if="errorMsg" class="integ-error" role="alert">
        <UIcon name="i-lucide-alert-circle" class="size-4" aria-hidden="true" />
        <span>{{ errorMsg }}</span>
        <button type="button" class="integ-error__retry" @click="loadAll">
          Tentar novamente
        </button>
      </div>

      <!-- Empty -->
      <div v-else-if="connections.length === 0" class="integ-empty">
        <div class="integ-empty__icon" aria-hidden="true">
          <UIcon name="i-lucide-link-2" class="size-8" />
        </div>
        <h2 class="integ-empty__title">
          Nenhuma conta conectada ainda
        </h2>
        <p class="integ-empty__subtitle">
          Conecte sua primeira corretora ou banco pra começar a sincronizar
          automaticamente. Em poucos cliques.
        </p>
        <MoleculesPluggyConnectButton
          variant="primary"
          @connected="loadAll"
        />
      </div>

      <!-- Connections list -->
      <ul v-else class="integ-list">
        <li
          v-for="conn in connections"
          :key="conn.id"
          class="integ-card"
          :class="`integ-card--${statusVisual(conn.status).tone}`"
        >
          <!-- Top row: institution + status -->
          <div class="integ-card__top">
            <div class="integ-card__institution">
              <div class="integ-card__logo" aria-hidden="true">
                <img
                  v-if="conn.institution_logo"
                  :src="conn.institution_logo"
                  :alt="`Logo ${conn.institution_name}`"
                  class="integ-card__logo-img"
                  loading="lazy"
                >
                <UIcon
                  v-else
                  name="i-lucide-building-2"
                  class="size-5"
                  aria-hidden="true"
                />
              </div>
              <div class="integ-card__institution-text">
                <span class="integ-card__institution-name">
                  {{ conn.institution_name }}
                </span>
                <span class="integ-card__institution-type">
                  {{
                    conn.institution_type === 'BANK'
                      ? 'Banco'
                      : conn.institution_type === 'INVESTMENT'
                        ? 'Corretora / Investimentos'
                        : 'Banco e Investimentos'
                  }}
                </span>
              </div>
            </div>

            <span
              class="integ-status"
              :class="`integ-status--${statusVisual(conn.status).tone}`"
            >
              <UIcon
                :name="statusVisual(conn.status).icon"
                :class="[
                  'size-3.5',
                  conn.status === 'UPDATING' || conn.status === 'CREATING'
                    ? 'motion-safe:animate-spin'
                    : '',
                ]"
                aria-hidden="true"
              />
              <span>{{ statusVisual(conn.status).label }}</span>
            </span>
          </div>

          <!-- Meta row: last sync + counts + total -->
          <div class="integ-card__meta">
            <span class="integ-card__meta-item">
              <UIcon name="i-lucide-refresh-cw" class="size-3.5" aria-hidden="true" />
              <span>Última sincronização: {{ timeSince(conn.last_synced_at) }}</span>
            </span>
            <span class="integ-card__meta-dot" aria-hidden="true">·</span>
            <span class="integ-card__meta-item">
              <UIcon name="i-lucide-coins" class="size-3.5" aria-hidden="true" />
              <span>
                {{ conn.positions_count }}
                {{ conn.positions_count === 1 ? 'ativo' : 'ativos' }}
              </span>
            </span>
            <span v-if="conn.total_balance > 0" class="integ-card__meta-dot" aria-hidden="true">·</span>
            <span v-if="conn.total_balance > 0" class="integ-card__meta-item integ-card__meta-item--strong">
              {{ formatBRL(conn.total_balance) }}
            </span>
          </div>

          <!-- Actions row -->
          <div class="integ-card__actions">
            <!-- LOGIN_ERROR / WAITING_USER_INPUT viram CTA "Reconectar"
                 que abre o widget com o item_id pra reauth flow. -->
            <button
              v-if="conn.status === 'LOGIN_ERROR' || conn.status === 'WAITING_USER_INPUT'"
              type="button"
              class="integ-action integ-action--primary"
              :disabled="widgetLoading"
              @click="reconnect(conn)"
            >
              <UIcon name="i-lucide-key-round" class="size-3.5" aria-hidden="true" />
              <span>Reconectar</span>
            </button>

            <button
              v-else
              type="button"
              class="integ-action integ-action--secondary"
              :disabled="syncingIds.has(conn.id) || conn.status === 'UPDATING' || conn.status === 'CREATING'"
              @click="syncOne(conn)"
            >
              <UIcon
                :name="
                  syncingIds.has(conn.id) || conn.status === 'UPDATING'
                    ? 'i-lucide-loader-2'
                    : 'i-lucide-refresh-cw'
                "
                :class="[
                  'size-3.5',
                  (syncingIds.has(conn.id) || conn.status === 'UPDATING') && 'motion-safe:animate-spin',
                ]"
                aria-hidden="true"
              />
              <span>{{ syncingIds.has(conn.id) ? 'Sincronizando...' : 'Atualizar' }}</span>
            </button>

            <button
              type="button"
              class="integ-action integ-action--ghost"
              :disabled="deletingIds.has(conn.id)"
              @click="disconnectOne(conn)"
            >
              <UIcon
                :name="deletingIds.has(conn.id) ? 'i-lucide-loader-2' : 'i-lucide-unlink-2'"
                :class="[
                  'size-3.5',
                  deletingIds.has(conn.id) && 'motion-safe:animate-spin',
                ]"
                aria-hidden="true"
              />
              <span>{{ deletingIds.has(conn.id) ? 'Removendo...' : 'Desconectar' }}</span>
            </button>
          </div>
        </li>
      </ul>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.integ-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 24px 64px;
  width: 100%;
}

/* ============ BACK LINK ============ */
.integ-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  transition: color 150ms;
  text-decoration: none;
}

.integ-back:hover {
  color: var(--brand-primary);
}

/* ============ HEADER ============ */
.integ-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 40%, transparent);
}

.integ-header__copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 580px;
}

.integ-eyebrow {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--brand-primary);
}

.integ-title {
  font-family: var(--brand-font);
  font-weight: 300;
  font-size: clamp(28px, 4vw, 36px);
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: var(--text-heading);
  margin: 0;
}

.integ-subtitle {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}

.integ-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 18px;
  border-radius: 11px;
  border: 0;
  background: var(--brand-primary);
  color: var(--brand-background, #fff);
  font-family: var(--brand-font);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: -0.005em;
  box-shadow: 0 8px 18px -10px color-mix(in srgb, var(--brand-primary) 60%, transparent);
  transition: filter 180ms, transform 120ms, box-shadow 180ms, opacity 180ms;
}

.integ-btn-primary:hover:not(:disabled) {
  filter: brightness(0.95);
  transform: translateY(-1px);
}

.integ-btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ============ LOADING / ERROR ============ */
.integ-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 72px 0;
}

.integ-error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-negative, #dc2626) 25%, transparent);
  color: var(--brand-negative, #dc2626);
  font-size: 13px;
}

.integ-error__retry {
  margin-left: auto;
  background: transparent;
  border: 0;
  color: var(--brand-negative, #dc2626);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ============ EMPTY ============ */
.integ-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
  padding: 56px 20px;
  border-radius: 18px;
  border: 1px dashed color-mix(in srgb, var(--brand-border) 60%, transparent);
  background: color-mix(in srgb, var(--brand-surface) 50%, var(--brand-background));
}

.integ-empty__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
}

.integ-empty__title {
  font-family: var(--brand-font);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.015em;
  color: var(--text-heading);
  margin: 0;
}

.integ-empty__subtitle {
  margin: 0 0 6px;
  font-size: 14px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  max-width: 420px;
}

/* ============ LIST + CARDS ============ */
.integ-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.integ-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 20px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  background: color-mix(in srgb, var(--brand-surface) 55%, var(--brand-background));
  transition: border-color 200ms, box-shadow 200ms;
}

.integ-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 28%, transparent);
  box-shadow: 0 8px 22px -14px color-mix(in srgb, var(--brand-primary) 28%, transparent);
}

.integ-card--negative {
  border-color: color-mix(in srgb, var(--brand-negative, #dc2626) 35%, transparent);
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 4%, var(--brand-surface));
}

.integ-card--info {
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
}

.integ-card__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.integ-card__institution {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.integ-card__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  color: var(--brand-primary);
  overflow: hidden;
  flex-shrink: 0;
}

.integ-card__logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.integ-card__institution-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.integ-card__institution-name {
  font-family: var(--brand-font);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-heading);
}

.integ-card__institution-type {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

/* ============ STATUS BADGES ============ */
.integ-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  white-space: nowrap;
}

.integ-status--positive {
  background: color-mix(in srgb, var(--brand-positive, #10b981) 14%, transparent);
  color: var(--brand-positive, #10b981);
}
.integ-status--neutral {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
}
.integ-status--negative {
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 14%, transparent);
  color: var(--brand-negative, #dc2626);
}
.integ-status--info {
  background: color-mix(in srgb, #3b82f6 14%, transparent);
  color: #3b82f6;
}

/* ============ META ROW ============ */
.integ-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

.integ-card__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.integ-card__meta-item--strong {
  color: var(--brand-text);
  font-family: var(--font-mono, ui-monospace, monospace);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

.integ-card__meta-dot {
  opacity: 0.5;
}

/* ============ ACTIONS ============ */
.integ-card__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding-top: 4px;
  border-top: 1px dashed color-mix(in srgb, var(--brand-border) 40%, transparent);
  padding-top: 10px;
}

.integ-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 9px;
  font-family: var(--brand-font);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  letter-spacing: -0.005em;
  transition: background-color 160ms, border-color 160ms, color 160ms, opacity 160ms;
}

.integ-action--primary {
  background: var(--brand-primary);
  color: var(--brand-background, #fff);
  border: 0;
}
.integ-action--primary:hover:not(:disabled) {
  filter: brightness(0.95);
}

.integ-action--secondary {
  background: transparent;
  color: var(--brand-text);
  border: 1px solid color-mix(in srgb, var(--brand-border) 60%, transparent);
}
.integ-action--secondary:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 5%, transparent);
}

.integ-action--ghost {
  background: transparent;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-border) 40%, transparent);
}
.integ-action--ghost:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--brand-negative, #dc2626) 35%, transparent);
  color: var(--brand-negative, #dc2626);
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 6%, transparent);
}

.integ-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

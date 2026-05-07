<!--
  EmailCampaignEditor — editor dedicado pra campanhas type=email.

  Diferente dos outros tipos (banner/cta/modal/etc), email exige:
    - Painel de DESTINATÁRIOS (quem vai receber, com count + sample)
    - Status de DELIVERY por user (pending / sent / opened / clicked / failed)
    - Botões de TEST SEND e SEND NOW
    - Preview do email como inbox

  Layout: 3 colunas em desktop
    1. LEFT  — composição (subject, body, image, link)
    2. MID   — destinatários + send actions + delivery summary
    3. RIGHT — preview do email
-->
<template>
  <div class="email-editor">
    <!-- ============ COL 1: COMPOSIÇÃO ============ -->
    <section class="email-editor__compose">
      <div class="email-editor__head">
        <span class="eyebrow">Composição</span>
        <h2 class="section-title">O que você quer dizer</h2>
      </div>

      <div class="field">
        <span class="field__label">Assunto *</span>
        <UInput
          v-model="form.title"
          placeholder="Ex.: Lançamos o stress test da carteira"
          size="md"
          required
        />
        <span class="field__hint">Aparece como Subject na inbox. Idealmente 30-50 caracteres.</span>
      </div>

      <div class="field">
        <span class="field__label">Corpo do email *</span>
        <UTextarea
          v-model="form.body"
          :rows="14"
          placeholder="Markdown suportado.&#10;&#10;Use **negrito** pra destacar.&#10;Quebra de linha dupla = parágrafo.&#10;&#10;Recomendado: 100-300 palavras + 1 CTA claro."
          size="md"
        />
        <span class="field__hint">{{ form.body?.length || 0 }} caracteres</span>
      </div>

      <div class="field-row">
        <div class="field">
          <span class="field__label">Imagem (URL, opcional)</span>
          <UInput v-model="form.image_url" placeholder="https://..." size="md" />
          <span class="field__hint">Aparece após o título. Largura máx ~600px.</span>
        </div>
      </div>

      <div class="field-row">
        <div class="field">
          <span class="field__label">Link do botão CTA</span>
          <UInput v-model="form.link_url" placeholder="https://..." size="md" />
        </div>
        <div class="field">
          <span class="field__label">Texto do botão</span>
          <UInput v-model="form.link_label" placeholder="Acessar agora" size="md" />
        </div>
      </div>

      <!-- Audience section colapsada (já existe na coluna do meio) -->
    </section>

    <!-- ============ COL 2: DESTINATÁRIOS + AÇÕES ============ -->
    <section class="email-editor__send">
      <!-- Destinatários card -->
      <div class="recipients">
        <header class="recipients__head">
          <span class="recipients__icon">
            <UIcon name="i-lucide-users" class="size-4" />
          </span>
          <div>
            <span class="recipients__label">Destinatários</span>
            <span class="recipients__sub">quem vai receber</span>
          </div>
          <button
            type="button"
            class="recipients__refresh"
            :disabled="loadingRecipients"
            @click="loadRecipients"
          >
            <UIcon
              :name="loadingRecipients ? 'i-lucide-loader-2' : 'i-lucide-refresh-cw'"
              :class="['size-3.5', loadingRecipients && 'motion-safe:animate-spin']"
            />
          </button>
        </header>

        <div class="recipients__count-block">
          <span class="recipients__count">{{ recipients?.count ?? '—' }}</span>
          <span class="recipients__count-sub">
            {{ recipients?.count === 1 ? 'destinatário' : 'destinatários' }} elegíveis
          </span>
        </div>

        <!-- Breakdown por role -->
        <div v-if="recipients?.by_role && Object.keys(recipients.by_role).length" class="recipients__roles">
          <span
            v-for="(count, role) in recipients.by_role"
            :key="role"
            class="recipients__role-chip"
          >
            <UIcon :name="roleIcon(role as string)" class="size-3" />
            {{ count }} {{ roleLabel(role as string) }}
          </span>
        </div>

        <!-- Filtros aplicados -->
        <div class="recipients__filters">
          <span class="recipients__filter">
            <UIcon name="i-lucide-target" class="size-3" />
            Audiência: <strong>{{ audienceLabel(recipients?.audience || form.target_audience) }}</strong>
          </span>
          <span v-if="recipients?.tenant_id" class="recipients__filter">
            <UIcon name="i-lucide-building-2" class="size-3" />
            Tenant: <strong>#{{ recipients.tenant_id }}</strong>
          </span>
          <span v-else class="recipients__filter">
            <UIcon name="i-lucide-globe" class="size-3" />
            <strong>Global</strong> (todos os tenants)
          </span>
          <span v-if="recipients?.filters?.min_aum" class="recipients__filter">
            <UIcon name="i-lucide-filter" class="size-3" />
            AUM ≥ R$ {{ recipients.filters.min_aum.toLocaleString('pt-BR') }}
          </span>
          <span v-if="recipients?.filters?.has_connections === true" class="recipients__filter">
            <UIcon name="i-lucide-link-2" class="size-3" />
            Open Finance conectado
          </span>
        </div>

        <!-- Sample -->
        <div v-if="recipients?.sample?.length" class="recipients__sample">
          <span class="recipients__sample-label">Amostra (primeiros 5):</span>
          <ul class="recipients__sample-list">
            <li
              v-for="u in recipients.sample"
              :key="u.id"
              class="recipients__sample-item"
            >
              <span class="recipients__avatar">
                {{ initials(u.name || u.email) }}
              </span>
              <div class="recipients__sample-meta">
                <span class="recipients__sample-name">{{ u.name || '(sem nome)' }}</span>
                <span class="recipients__sample-email">{{ u.email }}</span>
              </div>
              <span class="recipients__sample-role">{{ roleLabel(u.role) }}</span>
            </li>
          </ul>
        </div>

        <p v-if="recipients?.count === 0" class="recipients__empty">
          <UIcon name="i-lucide-alert-triangle" class="size-3.5 shrink-0" />
          Nenhum destinatário matches a audiência. Ajuste os filtros antes de enviar.
        </p>
      </div>

      <!-- Audience picker (compacto, dentro da coluna de envio) -->
      <details class="audience-config">
        <summary class="audience-config__summary">
          <UIcon name="i-lucide-sliders-horizontal" class="size-3.5" />
          Ajustar audiência
          <UIcon name="i-lucide-chevron-down" class="size-3.5 audience-config__chevron" />
        </summary>
        <div class="audience-config__body">
          <div class="field">
            <span class="field__label">Audiência</span>
            <USelect
              v-model="form.target_audience"
              :items="[
                { label: 'Logados (todos)', value: 'authenticated' },
                { label: 'Investidores', value: 'investors' },
                { label: 'Assessores', value: 'advisors' },
                { label: 'Admins', value: 'admins' },
                { label: 'Lista específica', value: 'specific' },
              ]"
              size="sm"
              @update:model-value="loadRecipients"
            />
          </div>
          <div class="field">
            <span class="field__label">Tenant</span>
            <USelect
              v-model="form.tenant_id"
              :items="tenantOptions"
              placeholder="Global"
              size="sm"
              @update:model-value="loadRecipients"
            />
          </div>
          <div class="field">
            <span class="field__label">AUM mínimo (R$)</span>
            <UInput
              v-model.number="form.target_min_aum"
              type="number"
              placeholder="vazio = sem filtro"
              size="sm"
              @blur="loadRecipients"
            />
          </div>
        </div>
      </details>

      <!-- Action buttons -->
      <div class="send-actions">
        <button
          type="button"
          class="action-btn action-btn--secondary"
          :disabled="testing || !form.title || !form.body"
          @click="onTestSend"
        >
          <UIcon
            :name="testing ? 'i-lucide-loader-2' : 'i-lucide-flask-conical'"
            :class="['size-4', testing && 'motion-safe:animate-spin']"
          />
          {{ testing ? 'Enviando...' : 'Enviar teste pra mim' }}
        </button>

        <button
          type="button"
          class="action-btn action-btn--primary"
          :disabled="sending || !canSendNow"
          @click="onSendNow"
        >
          <UIcon
            :name="sending ? 'i-lucide-loader-2' : 'i-lucide-send'"
            :class="['size-4', sending && 'motion-safe:animate-spin']"
          />
          {{ sending ? 'Disparando...' : `Enviar agora${recipients?.count ? ` pra ${recipients.count}` : ''}` }}
        </button>
      </div>

      <p v-if="!canSendNow && recipients?.count" class="send-disabled-note">
        <UIcon name="i-lucide-info" class="size-3.5 shrink-0" />
        Preencha assunto e corpo antes de disparar pra base.
      </p>

      <!-- Stats compactas -->
      <div v-if="stats && stats.total > 0" class="stats-summary">
        <header class="stats-summary__head">
          <span class="stats-summary__label">Status do envio</span>
          <span class="stats-summary__total">{{ stats.total }} {{ stats.total === 1 ? 'envio' : 'envios' }}</span>
        </header>

        <div class="stats-bar">
          <div
            v-if="stats.sent > 0"
            class="stats-bar__seg stats-bar__seg--sent"
            :style="{ width: pct(stats.sent, stats.total) + '%' }"
            :title="`${stats.sent} enviados`"
          />
          <div
            v-if="stats.queued > 0"
            class="stats-bar__seg stats-bar__seg--queued"
            :style="{ width: pct(stats.queued, stats.total) + '%' }"
            :title="`${stats.queued} na fila`"
          />
          <div
            v-if="stats.pending > 0"
            class="stats-bar__seg stats-bar__seg--pending"
            :style="{ width: pct(stats.pending, stats.total) + '%' }"
            :title="`${stats.pending} pendentes`"
          />
          <div
            v-if="stats.failed > 0"
            class="stats-bar__seg stats-bar__seg--failed"
            :style="{ width: pct(stats.failed, stats.total) + '%' }"
            :title="`${stats.failed} falharam`"
          />
        </div>

        <div class="stats-grid">
          <div class="stat">
            <span class="stat__label">Enviados</span>
            <span class="stat__value stat__value--sent">{{ stats.sent }}</span>
            <span class="stat__sub">{{ pct(stats.sent, stats.total) }}%</span>
          </div>
          <div class="stat">
            <span class="stat__label">Abertos</span>
            <span class="stat__value">{{ stats.opened }}</span>
            <span class="stat__sub">{{ stats.open_rate }}% rate</span>
          </div>
          <div class="stat">
            <span class="stat__label">Cliques</span>
            <span class="stat__value">{{ stats.clicked }}</span>
            <span class="stat__sub">{{ stats.click_rate }}% rate</span>
          </div>
          <div class="stat">
            <span class="stat__label">Falharam</span>
            <span class="stat__value stat__value--failed">{{ stats.failed }}</span>
          </div>
        </div>
      </div>

      <!-- Deliveries table (colapsável) -->
      <details v-if="deliveries.length > 0" class="deliveries-section" open>
        <summary class="deliveries-section__summary">
          <UIcon name="i-lucide-list-ordered" class="size-4" />
          <span>Para quem foi enviado ({{ deliveriesTotal }})</span>
          <UIcon name="i-lucide-chevron-down" class="size-3.5 deliveries-section__chevron" />
        </summary>

        <div class="deliveries-section__body">
          <div class="deliveries-filters">
            <USelect
              v-model="deliveryStatusFilter"
              :items="[
                { label: 'Todos os status', value: '' },
                { label: 'Pendentes', value: 'pending' },
                { label: 'Na fila', value: 'queued' },
                { label: 'Enviados', value: 'sent' },
                { label: 'Falharam', value: 'failed' },
              ]"
              size="sm"
              @update:model-value="loadDeliveries"
            />
            <UInput
              v-model="deliverySearch"
              placeholder="Buscar email/nome..."
              icon="i-lucide-search"
              size="sm"
              @update:model-value="onDeliverySearchChange"
            />
          </div>

          <ul class="deliveries-list">
            <li
              v-for="d in deliveries"
              :key="d.id"
              class="delivery-row"
            >
              <span :class="`delivery-status delivery-status--${d.status}`" :title="statusLabel(d.status)">
                <UIcon :name="statusIcon(d.status)" class="size-3" />
              </span>
              <div class="delivery-meta">
                <span class="delivery-name">{{ d.name || '(sem nome)' }}</span>
                <span class="delivery-email">{{ d.email }}</span>
              </div>
              <div class="delivery-events">
                <span v-if="d.opened_at" class="delivery-event delivery-event--opened" :title="`Aberto ${relativeTime(d.opened_at)}`">
                  <UIcon name="i-lucide-eye" class="size-3" />
                  {{ d.open_count }}
                </span>
                <span v-if="d.clicked_at" class="delivery-event delivery-event--clicked" :title="`Clicado ${relativeTime(d.clicked_at)}`">
                  <UIcon name="i-lucide-mouse-pointer-click" class="size-3" />
                  {{ d.click_count }}
                </span>
              </div>
              <span class="delivery-time" :title="d.sent_at || d.created_at">
                {{ d.sent_at ? relativeTime(d.sent_at) : (d.last_error ? 'erro' : '—') }}
              </span>
            </li>
          </ul>

          <div v-if="deliveriesLastPage > 1" class="deliveries-pagination">
            <button
              type="button"
              class="pag-btn"
              :disabled="deliveriesPage <= 1"
              @click="deliveriesPage--; loadDeliveries()"
            >Anterior</button>
            <span class="pag-counter">{{ deliveriesPage }} / {{ deliveriesLastPage }}</span>
            <button
              type="button"
              class="pag-btn"
              :disabled="deliveriesPage >= deliveriesLastPage"
              @click="deliveriesPage++; loadDeliveries()"
            >Próxima</button>
          </div>
        </div>
      </details>
    </section>

    <!-- ============ COL 3: PREVIEW ============ -->
    <aside class="email-editor__preview">
      <div class="preview-frame">
        <div class="preview-frame__head">
          <span class="preview-frame__eyebrow">Preview</span>
          <span class="preview-frame__sub">como vai chegar na inbox</span>
        </div>
        <div class="preview-frame__stage">
          <div class="prev-email">
            <div class="prev-email__inbox-bar">
              <UIcon name="i-lucide-inbox" class="size-3.5" />
              <span>Inbox</span>
            </div>
            <div class="prev-email__envelope">
              <header class="prev-email__from">
                <span class="prev-email__avatar">
                  <UIcon name="i-lucide-megaphone" class="size-4" />
                </span>
                <div class="prev-email__from-meta">
                  <div class="prev-email__from-row">
                    <span class="prev-email__sender">Redentia</span>
                    <span class="prev-email__time">agora</span>
                  </div>
                  <span class="prev-email__address">noreply@redentia.com.br</span>
                </div>
              </header>
              <h3 class="prev-email__subject">{{ form.title || '(Assunto do email)' }}</h3>
              <img
                v-if="form.image_url"
                :src="form.image_url"
                alt=""
                class="prev-email__img"
                @error="($event.target as HTMLImageElement).style.display='none'"
              >
              <p v-if="form.body" class="prev-email__body">{{ form.body }}</p>
              <p v-else class="prev-email__body prev-email__body--empty">
                <em>(Corpo do email vazio. Preencha à esquerda.)</em>
              </p>
              <div v-if="form.link_url || form.link_label" class="prev-email__cta-wrap">
                <span class="prev-email__cta">
                  {{ form.link_label || 'Acessar' }}
                </span>
              </div>
              <p class="prev-email__footer">
                Você está recebendo esse email porque é cadastrado na Redentia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import type { CommunicationAdminPayload, RecipientsPreview, EmailDelivery, EmailStats } from '~/services/communications'

interface Props {
  // Form reativo (vem do parent [id].vue, compartilhado)
  form: CommunicationAdminPayload & {
    poll_options: any[]
    tenant_id: number | null
    target_min_aum: number | null
  }
  // ID da campanha (necessário pros endpoints)
  id: number
}
const props = defineProps<Props>()

const service = useAdminCommunicationsService()

// =================================================================
// Recipients preview
// =================================================================
const recipients = ref<RecipientsPreview | null>(null)
const loadingRecipients = ref(false)

async function loadRecipients() {
  loadingRecipients.value = true
  try {
    recipients.value = await service.recipientsPreview(props.id)
  } catch (e) {
    console.warn('[email-editor] failed to load recipients', e)
  } finally {
    loadingRecipients.value = false
  }
}

// =================================================================
// Send actions
// =================================================================
const testing = ref(false)
const sending = ref(false)

const canSendNow = computed(
  () => props.form.title && props.form.body && (recipients.value?.count ?? 0) > 0,
)

async function onTestSend() {
  if (testing.value) return
  testing.value = true
  try {
    // Salva primeiro caso o admin tenha mudanças não-salvas
    await service.update(props.id, props.form as any)
    const resp = await service.testSend(props.id)
    showSuccessNotification('Teste enviado', `Foi pra ${resp.sent_to}. Abra a inbox.`)
  } catch (e: any) {
    showErrorNotification('Erro', e?.data?.message ?? e?.data?.error ?? 'Falha ao enviar teste')
  } finally {
    testing.value = false
  }
}

async function onSendNow() {
  if (sending.value) return
  if (!confirm(`Enviar agora pra ${recipients.value?.count} destinatários? Esta ação não pode ser desfeita.`)) return
  sending.value = true
  try {
    await service.update(props.id, props.form as any)
    const resp = await service.sendNow(props.id)
    showSuccessNotification('Disparado!', `${resp.queued} emails entraram na fila${resp.skipped ? ` · ${resp.skipped} já receberam` : ''}.`)
    // Recarrega stats e deliveries
    await Promise.all([loadStats(), loadDeliveries()])
  } catch (e: any) {
    showErrorNotification('Erro', e?.data?.message ?? e?.data?.error ?? 'Falha ao disparar')
  } finally {
    sending.value = false
  }
}

// =================================================================
// Stats
// =================================================================
const stats = ref<EmailStats | null>(null)

async function loadStats() {
  try {
    stats.value = await service.emailStats(props.id)
  } catch (e) {
    console.warn('[email-editor] failed to load stats', e)
  }
}

// =================================================================
// Deliveries
// =================================================================
const deliveries = ref<EmailDelivery[]>([])
const deliveriesTotal = ref(0)
const deliveriesPage = ref(1)
const deliveriesLastPage = ref(1)
const deliveryStatusFilter = ref('')
const deliverySearch = ref('')

let searchTimer: ReturnType<typeof setTimeout> | null = null
function onDeliverySearchChange() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    deliveriesPage.value = 1
    loadDeliveries()
  }, 300)
}

async function loadDeliveries() {
  try {
    const resp = await service.deliveries(props.id, {
      page: deliveriesPage.value,
      per_page: 20,
      status: deliveryStatusFilter.value || undefined,
      search: deliverySearch.value || undefined,
    })
    deliveries.value = resp.data
    deliveriesTotal.value = resp.total
    deliveriesLastPage.value = resp.last_page
  } catch (e) {
    console.warn('[email-editor] failed to load deliveries', e)
  }
}

// =================================================================
// Tenant options (carregados via tenants service)
// =================================================================
const tenantOptions = ref<{ label: string; value: number | null }[]>([
  { label: 'Global (todos)', value: null },
])

async function loadTenants() {
  try {
    const list = await useTenantsService().list()
    const arr = Array.isArray(list) ? list : ((list as any)?.data || [])
    tenantOptions.value = [
      { label: 'Global (todos)', value: null },
      ...arr.map((t: any) => ({ label: t.name, value: t.id })),
    ]
  } catch (e) {
    console.warn('[email-editor] tenants failed', e)
  }
}

// =================================================================
// Helpers
// =================================================================
function pct(n: number, total: number): number {
  if (!total) return 0
  return Math.round((n / total) * 100)
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

function roleLabel(r: string): string {
  return ({
    investor: 'investidor',
    advisor: 'assessor',
    admin: 'admin',
  } as Record<string, string>)[r] || r
}

function roleIcon(r: string): string {
  return ({
    investor: 'i-lucide-trending-up',
    advisor: 'i-lucide-briefcase',
    admin: 'i-lucide-shield',
  } as Record<string, string>)[r] || 'i-lucide-user'
}

function statusLabel(s: string): string {
  return ({
    pending: 'Pendente',
    queued: 'Na fila',
    sent: 'Enviado',
    failed: 'Falhou',
    bounced: 'Rejeitado',
    unsubscribed: 'Desinscrito',
  } as Record<string, string>)[s] || s
}

function statusIcon(s: string): string {
  return ({
    pending: 'i-lucide-clock',
    queued: 'i-lucide-loader',
    sent: 'i-lucide-check',
    failed: 'i-lucide-x',
    bounced: 'i-lucide-mail-x',
    unsubscribed: 'i-lucide-user-x',
  } as Record<string, string>)[s] || 'i-lucide-circle'
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?'
}

function relativeTime(iso: string): string {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'agora'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m atrás`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h atrás`
  const days = Math.floor(h / 24)
  if (days < 30) return `${days}d atrás`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

onMounted(async () => {
  await loadTenants()
  await loadRecipients()
  await loadStats()
  await loadDeliveries()
})
</script>

<style scoped>
.email-editor {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  padding: 0 24px 32px;
}

@media (min-width: 1024px) {
  .email-editor {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 0.9fr);
    gap: 24px;
  }
}

.eyebrow {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-feature-settings: 'tnum' 1;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}

.section-title {
  margin: 4px 0 0;
  font-family: var(--brand-font);
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: rgba(255, 255, 255, 0.92);
}

/* ============ COL 1: COMPOSE ============ */
.email-editor__compose {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.email-editor__head {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 600px) {
  .field-row { grid-template-columns: 1fr; }
}

.field__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
}

.field__hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.4;
}

/* ============ COL 2: SEND ============ */
.email-editor__send {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* RECIPIENTS card */
.recipients {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 12px;
  background:
    radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--brand-primary) 8%, transparent) 0%, transparent 60%),
    rgba(255, 255, 255, 0.03);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

.recipients__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.recipients__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px; height: 32px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
  color: var(--brand-primary);
}

.recipients__head > div {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recipients__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brand-primary);
}

.recipients__sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.recipients__refresh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px; height: 28px;
  border-radius: 7px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: background 150ms;
}
.recipients__refresh:hover { background: rgba(255, 255, 255, 0.05); }
.recipients__refresh:disabled { opacity: 0.5; cursor: not-allowed; }

.recipients__count-block {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.recipients__count {
  font-family: var(--brand-font);
  font-weight: 200;
  font-size: 36px;
  line-height: 1;
  letter-spacing: -0.025em;
  color: rgba(255, 255, 255, 0.95);
  font-variant-numeric: tabular-nums;
}

.recipients__count-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}

.recipients__roles {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.recipients__role-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
}

.recipients__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-top: 8px;
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
}

.recipients__filter {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 7px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.04);
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.6);
}

.recipients__filter strong { color: rgba(255, 255, 255, 0.95); font-weight: 600; }

.recipients__sample {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.recipients__sample-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.recipients__sample-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recipients__sample-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.02);
}

.recipients__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px; height: 26px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
  color: var(--brand-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
}

.recipients__sample-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.recipients__sample-name {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recipients__sample-email {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recipients__sample-role {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.recipients__empty {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: #fbbf24;
  font-size: 12px;
}

/* AUDIENCE CONFIG (collapsible) */
.audience-config {
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.audience-config__summary {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px;
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.7);
  list-style: none;
}

.audience-config__summary::-webkit-details-marker { display: none; }

.audience-config__chevron {
  margin-left: auto;
  transition: transform 200ms;
}

.audience-config[open] .audience-config__chevron {
  transform: rotate(180deg);
}

.audience-config__body {
  padding: 0 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* SEND ACTIONS */
.send-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 10px;
  border: 0;
  font-family: var(--brand-font);
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  cursor: pointer;
  transition: filter 150ms, transform 120ms, box-shadow 150ms;
}

.action-btn--primary {
  background: linear-gradient(135deg, var(--brand-primary) 0%, color-mix(in srgb, var(--brand-primary) 80%, white) 100%);
  color: var(--text-on-primary, #1a0a2e);
  box-shadow: 0 12px 26px -10px color-mix(in srgb, var(--brand-primary) 65%, transparent);
}

.action-btn--primary:hover:not(:disabled) {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.action-btn--primary:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

.action-btn--secondary {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
}

.action-btn--secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.18);
}

.action-btn--secondary:disabled { opacity: 0.5; cursor: not-allowed; }

.send-disabled-note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.5);
}

/* STATS SUMMARY */
.stats-summary {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stats-summary__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.stats-summary__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brand-primary);
}

.stats-summary__total {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.stats-bar {
  display: flex;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.stats-bar__seg {
  height: 100%;
  transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-bar__seg--sent    { background: #10b981; }
.stats-bar__seg--queued  { background: #06b6d4; }
.stats-bar__seg--pending { background: rgba(255, 255, 255, 0.3); }
.stats-bar__seg--failed  { background: #ef4444; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

@media (min-width: 480px) {
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.stat__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.stat__value {
  font-family: var(--brand-font);
  font-weight: 200;
  font-size: 22px;
  line-height: 1;
  letter-spacing: -0.025em;
  color: rgba(255, 255, 255, 0.95);
  font-variant-numeric: tabular-nums;
}

.stat__value--sent { color: #10b981; }
.stat__value--failed { color: #ef4444; }

.stat__sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

/* DELIVERIES */
.deliveries-section {
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.deliveries-section__summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  font-family: var(--brand-font);
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.92);
  list-style: none;
}

.deliveries-section__summary::-webkit-details-marker { display: none; }

.deliveries-section__chevron {
  margin-left: auto;
  transition: transform 200ms;
  color: rgba(255, 255, 255, 0.5);
}

.deliveries-section[open] .deliveries-section__chevron {
  transform: rotate(180deg);
}

.deliveries-section__body {
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.deliveries-filters {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 8px;
}

.deliveries-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 400px;
  overflow-y: auto;
}

.delivery-row {
  display: grid;
  grid-template-columns: 24px 1fr auto auto;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.delivery-row:last-child { border-bottom: 0; }

.delivery-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px; height: 22px;
  border-radius: 5px;
}

.delivery-status--sent { background: rgba(16, 185, 129, 0.18); color: #10b981; }
.delivery-status--queued { background: rgba(6, 182, 212, 0.18); color: #06b6d4; }
.delivery-status--pending { background: rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.5); }
.delivery-status--failed { background: rgba(239, 68, 68, 0.18); color: #ef4444; }
.delivery-status--bounced { background: rgba(239, 68, 68, 0.18); color: #ef4444; }

.delivery-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.delivery-name {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delivery-email {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delivery-events {
  display: flex;
  gap: 4px;
}

.delivery-event {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 5px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
}

.delivery-event--opened { background: rgba(139, 92, 246, 0.16); color: #c4b5fd; }
.delivery-event--clicked { background: rgba(245, 158, 11, 0.16); color: #fbbf24; }

.delivery-time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
}

.deliveries-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.pag-btn {
  padding: 5px 11px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: background 150ms;
}
.pag-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.08); }
.pag-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.pag-counter {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.55);
}

/* ============ COL 3: PREVIEW ============ */
.email-editor__preview {
  position: sticky;
  top: 90px;
  align-self: start;
}

.preview-frame {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.preview-frame__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.preview-frame__eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}

.preview-frame__sub {
  font-size: 10.5px;
  color: rgba(255, 255, 255, 0.45);
}

.preview-frame__stage {
  padding: 16px;
  background:
    repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0, rgba(255,255,255,0.015) 10px, transparent 10px, transparent 20px),
    rgba(15, 18, 22, 0.5);
}

/* PREVIEW EMAIL */
.prev-email {
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 8px 28px -10px rgba(0, 0, 0, 0.4);
}

.prev-email__inbox-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f6f7f9;
  border-bottom: 1px solid #e8e8e8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #555;
}

.prev-email__envelope {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1a1a1a;
}

.prev-email__from {
  display: flex;
  align-items: center;
  gap: 10px;
}

.prev-email__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px; height: 36px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.15);
  color: #d97706;
}

.prev-email__from-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.prev-email__from-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.prev-email__sender {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
}

.prev-email__time {
  font-size: 11px;
  color: #888;
}

.prev-email__address {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  color: #888;
}

.prev-email__subject {
  margin: 4px 0;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.012em;
  color: #1a1a1a;
}

.prev-email__img {
  width: 100%;
  max-height: 140px;
  object-fit: cover;
  border-radius: 6px;
}

.prev-email__body {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: #444;
  white-space: pre-line;
}

.prev-email__body--empty {
  color: #aaa;
}

.prev-email__cta-wrap {
  text-align: center;
  margin: 8px 0;
}

.prev-email__cta {
  display: inline-block;
  padding: 11px 24px;
  background: #f59e0b;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 7px;
  letter-spacing: -0.005em;
}

.prev-email__footer {
  margin: 16px 0 0;
  padding-top: 14px;
  border-top: 1px solid #e8e8e8;
  font-size: 10.5px;
  color: #888;
  line-height: 1.5;
}
</style>

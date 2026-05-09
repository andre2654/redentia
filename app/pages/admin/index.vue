<template>
  <NuxtLayout name="admin-panel">
    <div class="mx-auto flex max-w-7xl flex-col gap-10">
      <!-- Header -->
      <header class="flex flex-col gap-2">
        <span class="font-mono-tab text-[10px] uppercase tracking-[0.18em]" :style="{ color: C.primary }">
          Dashboard
        </span>
        <h1 class="text-[32px] leading-tight md:text-[40px]" :style="{ color: C.text, fontFamily: F.display }">
          Bem-vindo, {{ auth.me?.name?.split(' ')[0] || 'admin' }}.
        </h1>
        <p class="max-w-2xl text-[14px] leading-[1.6]" :style="{ color: C.textMuted }">
          Visão geral de negócio, engajamento e adoção. As métricas atualizam em tempo real.
        </p>
      </header>

      <!-- ============ NEGÓCIO ============ -->
      <section class="flex flex-col gap-4">
        <div class="section-head">
          <div class="section-head__left">
            <span class="section-head__eyebrow">
              <UIcon name="i-lucide-landmark" class="size-3.5" />
              Negócio
            </span>
            <h2 class="section-head__title">O dinheiro que a Redentia toca</h2>
          </div>
          <NuxtLink to="/admin/users" class="section-head__link">
            Ver usuários
            <UIcon name="i-lucide-arrow-up-right" class="size-3" />
          </NuxtLink>
        </div>

        <div class="metrics-grid">
          <MetricCard
            label="AUM total"
            :value="formatAum(business?.aum_total)"
            :sub="business?.aum_users ? `${business.aum_users} ${business.aum_users === 1 ? 'investidor' : 'investidores'}` : '—'"
            icon="i-lucide-trending-up"
            color="var(--brand-positive)"
            highlight
            :loading="loading"
          />
          <MetricCard
            label="Carteira mediana"
            :value="formatAum(business?.aum_median)"
            sub="50% têm acima disso"
            icon="i-lucide-target"
            color="#3b82f6"
            :loading="loading"
          />
          <MetricCard
            label="Carteira média"
            :value="formatAum(business?.aum_average)"
            :sub="business?.aum_users ? `÷ ${business.aum_users} users` : '—'"
            icon="i-lucide-divide-circle"
            color="#06b6d4"
            :loading="loading"
          />
          <MetricCard
            label="Conversão lead → user"
            :value="business?.lead_conversion != null ? `${business.lead_conversion.toFixed(1).replace('.', ',')}%` : '—'"
            :sub="business?.lead_total ? `${business.lead_converted}/${business.lead_total}` : '—'"
            icon="i-lucide-magnet"
            color="#8b5cf6"
            :loading="loading"
          />
          <MetricCard
            label="Score médio raio-X"
            :value="business?.raiox_score_avg != null ? `${business.raiox_score_avg.toFixed(1).replace('.', ',')}` : '—'"
            :sub="business?.raiox_total ? `${business.raiox_total} análises` : '—'"
            icon="i-lucide-scan-line"
            color="var(--brand-warning)"
            :loading="loading"
            :max-value="100"
            show-progress
          />
        </div>
      </section>

      <!-- ============ ENGAJAMENTO ============ -->
      <section class="flex flex-col gap-4">
        <div class="section-head">
          <div class="section-head__left">
            <span class="section-head__eyebrow">
              <UIcon name="i-lucide-activity" class="size-3.5" />
              Engajamento
            </span>
            <h2 class="section-head__title">Quem volta, quão ativo, e o que vê</h2>
          </div>
          <NuxtLink to="/admin/comunicacoes" class="section-head__link">
            Ver comunicações
            <UIcon name="i-lucide-arrow-up-right" class="size-3" />
          </NuxtLink>
        </div>

        <div class="metrics-grid">
          <!-- DAU/MAU/Stickiness -->
          <article class="dau-card" :class="{ 'dau-card--loading': loading }">
            <span class="dau-card__eyebrow">Atividade</span>
            <div class="dau-card__row">
              <div class="dau-card__stat">
                <span class="dau-card__label">DAU</span>
                <span class="dau-card__value">{{ engagement?.dau ?? '—' }}</span>
                <span class="dau-card__hint">últimas 24h</span>
              </div>
              <div class="dau-card__divider" />
              <div class="dau-card__stat">
                <span class="dau-card__label">WAU</span>
                <span class="dau-card__value">{{ engagement?.wau ?? '—' }}</span>
                <span class="dau-card__hint">últimos 7d</span>
              </div>
              <div class="dau-card__divider" />
              <div class="dau-card__stat">
                <span class="dau-card__label">MAU</span>
                <span class="dau-card__value">{{ engagement?.mau ?? '—' }}</span>
                <span class="dau-card__hint">últimos 30d</span>
              </div>
            </div>
            <div v-if="engagement" class="dau-card__stickiness">
              <span class="dau-card__stickiness-label">
                <UIcon name="i-lucide-zap" class="size-3" />
                Stickiness DAU/MAU
              </span>
              <div class="dau-card__stickiness-bar">
                <div
                  class="dau-card__stickiness-fill"
                  :style="{ width: Math.min(engagement.stickiness, 100) + '%' }"
                />
              </div>
              <span class="dau-card__stickiness-value">{{ engagement.stickiness.toFixed(1).replace('.', ',') }}%</span>
            </div>
          </article>

          <MetricCard
            label="Retenção 7d"
            :value="engagement?.retention_7d != null ? `${engagement.retention_7d.toFixed(1).replace('.', ',')}%` : '—'"
            sub="voltam após cadastro"
            icon="i-lucide-repeat"
            color="#06b6d4"
            :loading="loading"
            :max-value="100"
            show-progress
          />
          <MetricCard
            label="Retenção 30d"
            :value="engagement?.retention_30d != null ? `${engagement.retention_30d.toFixed(1).replace('.', ',')}%` : '—'"
            sub="ainda ativos no mês"
            icon="i-lucide-rotate-cw"
            color="#3b82f6"
            :loading="loading"
            :max-value="100"
            show-progress
          />
          <MetricCard
            label="Novos cadastros 7d"
            :value="engagement?.new_users_7d != null ? String(engagement.new_users_7d) : '—'"
            :sub="engagement?.new_users_24h ? `+${engagement.new_users_24h} hoje` : 'últimos 7 dias'"
            icon="i-lucide-user-plus"
            color="#8b5cf6"
            :loading="loading"
          />
          <MetricCard
            label="Comunicações ativas"
            :value="engagement?.active_communications != null ? String(engagement.active_communications) : '—'"
            :sub="engagement?.communication_impressions ? `${formatCompact(engagement.communication_impressions)} impressões` : 'no ar agora'"
            icon="i-lucide-megaphone"
            color="#ec4899"
            :loading="loading"
            link="/admin/comunicacoes"
          />
        </div>
      </section>

      <!-- ============ ADOÇÃO ============ -->
      <section class="flex flex-col gap-4">
        <div class="section-head">
          <div class="section-head__left">
            <span class="section-head__eyebrow">
              <UIcon name="i-lucide-sparkles" class="size-3.5" />
              Adoção
            </span>
            <h2 class="section-head__title">Como os usuários estão usando a plataforma</h2>
          </div>
          <span class="section-head__base" v-if="adoption">
            base: {{ adoption.users_with_positions }} {{ adoption.users_with_positions === 1 ? 'investidor' : 'investidores' }}
          </span>
        </div>

        <div class="metrics-grid">
          <AdoptionCard
            label="Open Finance"
            :pct="adoption?.open_finance_adoption"
            :count="adoption?.open_finance_users"
            :total="adoption?.users_with_positions"
            icon="i-lucide-link-2"
            color="var(--brand-positive)"
            desc="conectaram corretora"
            :loading="loading"
          />
          <AdoptionCard
            label="Raio-X completo"
            :pct="adoption?.raiox_adoption"
            :count="adoption?.raiox_users"
            :total="adoption?.users_with_positions"
            icon="i-lucide-scan-line"
            color="var(--brand-warning)"
            desc="rodaram análise IA"
            :loading="loading"
          />
          <AdoptionCard
            label="Metas definidas"
            :pct="adoption?.goals_adoption"
            :count="adoption?.goals_users"
            :total="adoption?.users_with_positions"
            icon="i-lucide-target"
            color="#3b82f6"
            desc="têm pelo menos 1 meta"
            :loading="loading"
          />
          <AdoptionCard
            label="Watchlist"
            :pct="adoption?.watchlist_adoption"
            :count="adoption?.watchlist_users"
            :total="adoption?.users_with_positions"
            icon="i-lucide-eye"
            color="#8b5cf6"
            desc="acompanham tickers"
            :loading="loading"
          />
        </div>
      </section>

      <!-- ============ CONTAS / NAVEGACAO ANTIGA ============ -->
      <section class="flex flex-col gap-4">
        <div class="section-head">
          <div class="section-head__left">
            <span class="section-head__eyebrow">
              <UIcon name="i-lucide-layers" class="size-3.5" />
              Operação
            </span>
            <h2 class="section-head__title">Recursos administrativos</h2>
          </div>
        </div>

        <div class="ops-grid">
          <NuxtLink to="/admin/tenants" class="ops-card">
            <UIcon name="i-lucide-building-2" class="size-5" :style="{ color: C.primary }" />
            <div>
              <span class="ops-card__title">Tenants</span>
              <span class="ops-card__sub">{{ tenantsCount }} cadastrados</span>
            </div>
            <UIcon name="i-lucide-arrow-up-right" class="ops-card__arrow size-4" />
          </NuxtLink>
          <NuxtLink to="/admin/leads" class="ops-card">
            <UIcon name="i-lucide-magnet" class="size-5" :style="{ color: C.primary }" />
            <div>
              <span class="ops-card__title">Leads</span>
              <span class="ops-card__sub">{{ leadsTotal }} totais{{ leadsLast7d > 0 ? ` · +${leadsLast7d}/7d` : '' }}</span>
            </div>
            <UIcon name="i-lucide-arrow-up-right" class="ops-card__arrow size-4" />
          </NuxtLink>
          <NuxtLink to="/admin/reports" class="ops-card">
            <UIcon name="i-lucide-life-buoy" class="size-5" :style="{ color: C.primary }" />
            <div>
              <span class="ops-card__title">Reports</span>
              <span class="ops-card__sub">{{ reportsTotal }} totais{{ reportsOpen > 0 ? ` · ${reportsOpen} abertos` : '' }}</span>
            </div>
            <UIcon name="i-lucide-arrow-up-right" class="ops-card__arrow size-4" />
          </NuxtLink>
          <NuxtLink to="/admin/data-health" class="ops-card">
            <UIcon name="i-lucide-activity" class="size-5" :style="{ color: C.primary }" />
            <div>
              <span class="ops-card__title">Data Health</span>
              <span class="ops-card__sub">scrape · news · tesouro</span>
            </div>
            <UIcon name="i-lucide-arrow-up-right" class="ops-card__arrow size-4" />
          </NuxtLink>
          <NuxtLink to="/admin/social/automations" class="ops-card">
            <UIcon name="i-lucide-zap" class="size-5" :style="{ color: C.primary }" />
            <div>
              <span class="ops-card__title">Automações</span>
              <span class="ops-card__sub">{{ automationsActive }}/{{ automationsTotal }} ativas</span>
            </div>
            <UIcon name="i-lucide-arrow-up-right" class="ops-card__arrow size-4" />
          </NuxtLink>
          <a :href="postizUrl" target="_blank" rel="noopener" class="ops-card">
            <UIcon name="i-lucide-share-2" class="size-5" :style="{ color: C.primary }" />
            <div>
              <span class="ops-card__title">Postiz console</span>
              <span class="ops-card__sub">contas sociais (externo)</span>
            </div>
            <UIcon name="i-lucide-external-link" class="ops-card__arrow size-4" />
          </a>
        </div>
      </section>

      <!-- Footer: timestamp -->
      <footer v-if="generatedAt" class="footer-stamp">
        Métricas atualizadas {{ relativeTime(generatedAt) }} ·
        <button type="button" class="footer-stamp__refresh" @click="reload">
          <UIcon
            :name="loading ? 'i-lucide-loader-2' : 'i-lucide-refresh-cw'"
            :class="['size-3', loading && 'motion-safe:animate-spin']"
          />
          Atualizar
        </button>
      </footer>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { REDENTIA_COLORS as C, REDENTIA_FONTS as F } from '~/utils/redentiaCreativeColors'
import type { BusinessMetrics, EngagementMetrics, AdoptionMetrics } from '~/services/adminDashboard'

definePageMeta({ middleware: ['admin-panel'] })

const auth = useAuthStore()
const dashboardService = useAdminDashboardService()
const tenantsService = useTenantsService()
const autService = useSocialAutomationsService()
const leadsService = useLeadsService()
const reportsService = useReportsService()

const postizUrl = computed(() => {
  if (import.meta.server) return 'https://postiz.saraivada.com'
  return window.location.hostname.includes('localhost') ? 'http://localhost:4007' : 'https://postiz.saraivada.com'
})

const loading = ref(true)
const business = ref<BusinessMetrics | null>(null)
const engagement = ref<EngagementMetrics | null>(null)
const adoption = ref<AdoptionMetrics | null>(null)
const generatedAt = ref<string | null>(null)

// Antigos counters (operação)
const tenantsCount = ref(0)
const automationsActive = ref(0)
const automationsTotal = ref(0)
const leadsTotal = ref(0)
const leadsLast7d = ref(0)
const reportsTotal = ref(0)
const reportsOpen = ref(0)

// Compact BRL formatter pra cards. R$ 1.234.567 → "R$ 1,2 mi".
const compactBrl = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 2,
})
function formatAum(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return 'R$ 0'
  return compactBrl.format(value)
}

const compactNum = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })
function formatCompact(n: number): string {
  return compactNum.format(n)
}

function relativeTime(iso: string): string {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'agora'
  const min = Math.floor(sec / 60)
  if (min < 60) return `há ${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

async function reload() {
  loading.value = true
  try {
    const [extStats, tenants, automations, leadStats, reportStats] = await Promise.all([
      dashboardService.extendedStats().catch(() => null),
      tenantsService.list().catch(() => ({ data: [] } as any)),
      autService.list().catch(() => []),
      leadsService.stats().catch(() => null),
      reportsService.stats().catch(() => null),
    ])

    if (extStats) {
      business.value = extStats.data.business
      engagement.value = extStats.data.engagement
      adoption.value = extStats.data.adoption
      generatedAt.value = extStats.generated_at
    }

    const tenantsArr = Array.isArray(tenants) ? tenants : ((tenants as any)?.data || [])
    tenantsCount.value = tenantsArr.length
    automationsTotal.value = automations.length
    automationsActive.value = automations.filter(a => a.enabled).length
    if (leadStats) {
      leadsTotal.value = leadStats.total
      leadsLast7d.value = leadStats.last_7d
    }
    if (reportStats) {
      reportsTotal.value = reportStats.total
      reportsOpen.value = reportStats.open
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => reload())

// =================================================================
// Inline components
// =================================================================
const MetricCard = defineComponent({
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
    sub: { type: String, default: '' },
    icon: { type: String, required: true },
    color: { type: String, default: 'var(--brand-warning)' },
    loading: { type: Boolean, default: false },
    highlight: { type: Boolean, default: false },
    showProgress: { type: Boolean, default: false },
    maxValue: { type: Number, default: 100 },
    link: { type: String, default: '' },
  },
  setup(props) {
    const Tag = props.link ? resolveComponent('NuxtLink') : 'div'
    return () => h(Tag as any, {
      to: props.link || undefined,
      class: ['metric-card', props.highlight && 'metric-card--highlight', props.link && 'metric-card--linkable'],
      style: { '--accent': props.color } as any,
    }, [
      h('div', { class: 'metric-card__head' }, [
        h('span', { class: 'metric-card__icon-wrap' }, [
          h(resolveComponent('UIcon'), { name: props.icon, class: 'size-4' }),
        ]),
        h('span', { class: 'metric-card__label' }, props.label),
      ]),
      h('div', { class: 'metric-card__value-wrap' }, [
        props.loading
          ? h(resolveComponent('UIcon'), { name: 'i-lucide-loader-2', class: 'size-5 motion-safe:animate-spin metric-card__loader' })
          : h('span', { class: 'metric-card__value' }, props.value),
      ]),
      props.sub
        ? h('span', { class: 'metric-card__sub' }, props.sub)
        : null,
      // Progress bar (só se showProgress + value parsável)
      props.showProgress && !props.loading
        ? (() => {
            const numeric = parseFloat(props.value.replace(',', '.'))
            const pct = isFinite(numeric) ? Math.min((numeric / props.maxValue) * 100, 100) : 0
            return h('div', { class: 'metric-card__progress' }, [
              h('div', { class: 'metric-card__progress-fill', style: { width: `${pct}%` } }),
            ])
          })()
        : null,
    ])
  },
})

const AdoptionCard = defineComponent({
  props: {
    label: { type: String, required: true },
    pct: { type: Number, default: null },
    count: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    icon: { type: String, required: true },
    color: { type: String, default: 'var(--brand-warning)' },
    desc: { type: String, default: '' },
    loading: { type: Boolean, default: false },
  },
  setup(props) {
    return () => h('article', {
      class: 'adoption-card',
      style: { '--accent': props.color } as any,
    }, [
      h('div', { class: 'adoption-card__head' }, [
        h('span', { class: 'adoption-card__icon-wrap' }, [
          h(resolveComponent('UIcon'), { name: props.icon, class: 'size-4' }),
        ]),
        h('span', { class: 'adoption-card__label' }, props.label),
      ]),
      props.loading
        ? h(resolveComponent('UIcon'), { name: 'i-lucide-loader-2', class: 'size-5 motion-safe:animate-spin' })
        : h('div', { class: 'adoption-card__value-wrap' }, [
            h('span', { class: 'adoption-card__pct' },
              props.pct != null ? `${props.pct.toFixed(1).replace('.', ',')}%` : '—'),
          ]),
      h('div', { class: 'adoption-card__progress' }, [
        h('div', {
          class: 'adoption-card__progress-fill',
          style: { width: `${Math.min(props.pct || 0, 100)}%` },
        }),
      ]),
      h('div', { class: 'adoption-card__footer' }, [
        h('span', { class: 'adoption-card__count' },
          `${props.count}/${props.total}`),
        h('span', { class: 'adoption-card__desc' }, props.desc),
      ]),
    ])
  },
})
</script>

<style scoped>
.font-mono-tab { font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace; font-feature-settings: 'tnum' 1; }

/* ============ SECTION HEAD ============ */
.section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
}

.section-head__left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.section-head__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
}

.section-head__title {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: color-mix(in srgb, var(--brand-text) 92%, transparent);
}

.section-head__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--brand-primary);
  transition: opacity 150ms;
}
.section-head__link:hover { opacity: 0.8; }

.section-head__base {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}

/* ============ METRICS GRID ============ */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 640px) { .metrics-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .metrics-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1280px) { .metrics-grid { grid-template-columns: repeat(5, 1fr); } }

/* ============ METRIC CARD ============ */
:deep(.metric-card) {
  --accent: var(--brand-primary);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 11px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  transition: border-color 200ms, transform 180ms, box-shadow 200ms;
  position: relative;
  overflow: hidden;
}

:deep(.metric-card--linkable) {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

:deep(.metric-card--linkable:hover) {
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
  transform: translateY(-2px);
  box-shadow: 0 14px 28px -16px color-mix(in srgb, var(--accent) 35%, transparent);
}

:deep(.metric-card--highlight) {
  background:
    radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--accent) 14%, transparent) 0%, transparent 60%),
    color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border-color: color-mix(in srgb, var(--accent) 28%, transparent);
}

:deep(.metric-card__head) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.metric-card__icon-wrap) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--accent);
}

:deep(.metric-card__label) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  flex: 1;
}

:deep(.metric-card__value-wrap) {
  min-height: 32px;
  display: flex;
  align-items: baseline;
}

:deep(.metric-card__value) {
  font-family: var(--brand-font);
  font-weight: 200;
  font-size: clamp(22px, 2.4vw, 28px);
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
  font-variant-numeric: tabular-nums;
}

:deep(.metric-card__loader) {
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

:deep(.metric-card__sub) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

:deep(.metric-card__progress) {
  margin-top: 2px;
  height: 3px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  border-radius: 999px;
  overflow: hidden;
}

:deep(.metric-card__progress-fill) {
  height: 100%;
  background: var(--accent);
  border-radius: 999px;
  transition: width 700ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* ============ DAU CARD (special) ============ */
.dau-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 11px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  grid-column: span 1;
}

@media (min-width: 1024px) {
  .dau-card { grid-column: span 2; }
}

.dau-card__eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

.dau-card__row {
  display: flex;
  align-items: stretch;
  gap: 0;
}

.dau-card__stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0 4px;
}

.dau-card__divider {
  width: 1px;
  background: color-mix(in srgb, var(--brand-text) 8%, transparent);
  margin: 4px 8px;
}

.dau-card__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brand-primary);
}

.dau-card__value {
  font-family: var(--brand-font);
  font-weight: 200;
  font-size: 26px;
  line-height: 1;
  letter-spacing: -0.025em;
  color: color-mix(in srgb, var(--brand-text) 95%, transparent);
  font-variant-numeric: tabular-nums;
}

.dau-card__hint {
  font-size: 10px;
  color: color-mix(in srgb, var(--brand-text) 40%, transparent);
}

.dau-card__stickiness {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid color-mix(in srgb, var(--brand-text) 6%, transparent);
}

.dau-card__stickiness-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  white-space: nowrap;
}

.dau-card__stickiness-bar {
  flex: 1;
  height: 4px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  border-radius: 999px;
  overflow: hidden;
}

.dau-card__stickiness-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--brand-primary) 0%, color-mix(in srgb, var(--brand-primary) 70%, white) 100%);
  border-radius: 999px;
  transition: width 700ms cubic-bezier(0.4, 0, 0.2, 1);
}

.dau-card__stickiness-value {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  font-weight: 600;
  color: var(--brand-primary);
}

/* ============ ADOPTION CARD ============ */
:deep(.adoption-card) {
  --accent: var(--brand-primary);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 11px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
}

:deep(.adoption-card__head) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.adoption-card__icon-wrap) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--accent);
}

:deep(.adoption-card__label) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  flex: 1;
}

:deep(.adoption-card__value-wrap) {
  display: flex;
  align-items: baseline;
}

:deep(.adoption-card__pct) {
  font-family: var(--brand-font);
  font-weight: 200;
  font-size: 28px;
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

:deep(.adoption-card__progress) {
  height: 5px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  border-radius: 999px;
  overflow: hidden;
}

:deep(.adoption-card__progress-fill) {
  height: 100%;
  background: var(--accent);
  border-radius: 999px;
  transition: width 700ms cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.adoption-card__footer) {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
}

:deep(.adoption-card__count) {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 11px;
  font-weight: 600;
  color: color-mix(in srgb, var(--brand-text) 85%, transparent);
}

:deep(.adoption-card__desc) {
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}

/* ============ OPS CARD ============ */
.ops-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
@media (min-width: 640px) { .ops-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .ops-grid { grid-template-columns: repeat(3, 1fr); } }

.ops-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-text) 2.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-text) 8%, transparent);
  text-decoration: none;
  transition: background 150ms, border-color 150ms, transform 150ms;
}
.ops-card:hover {
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  border-color: color-mix(in srgb, var(--brand-text) 18%, transparent);
  transform: translateY(-1px);
}
.ops-card > div {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.ops-card__title {
  font-size: 13px;
  font-weight: 600;
  color: color-mix(in srgb, var(--brand-text) 92%, transparent);
}
.ops-card__sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.ops-card__arrow {
  color: color-mix(in srgb, var(--brand-text) 45%, transparent);
}
.ops-card:hover .ops-card__arrow {
  color: var(--brand-primary);
}

/* ============ FOOTER STAMP ============ */
.footer-stamp {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  color: color-mix(in srgb, var(--brand-text) 40%, transparent);
  padding-top: 6px;
}

.footer-stamp__refresh {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 0;
  color: var(--brand-primary);
  font: inherit;
  cursor: pointer;
  font-weight: 600;
}
.footer-stamp__refresh:hover { opacity: 0.8; }
</style>

<!--
  /wallet — main authenticated wallet surface.

  Two states:
    1. EmptyState  — first visit / wallet wiped: hero + "Importar via chat"
                     CTA + 3 explainer cards. The legacy XLSX upload is GONE.
    2. Dashboard   — populated: hero + KPIs + allocation + positions +
                     goals/watchlist + dividend calendar + raio-x preview.

  Sub-components live under `~/components/molecules/wallet/*`. This file
  is the orchestrator: it fetches data once on mount + on `?refresh=1`,
  derives totals/sectors locally, and routes everything through props.

  Layout: `default` (the platform sidebar). Auth-guarded by the global
  middleware in `middleware/auth.global.ts`.
-->
<template>
  <NuxtLayout :title="brand.nav.wallet">
    <div :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }">
      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-32">
        <UIcon name="i-lucide-loader-2" class="size-8 motion-safe:animate-spin" :style="{ color: brand.colors.primary }" />
      </div>

      <!-- Empty state — substitui o hero antigo (video + 3 cards "Depois
           do import" + lista de selos de seguranca) por <MoleculesWalletEmptyState>.
           A nova hierarquia coloca o Pluggy/Open Finance como CTA primario
           (taxa de retencao maior do que XLSX), com planilha e adicionar
           manualmente como caminhos secundarios. O contextual banner do
           fluxo "Gerar Raio-X" permanece pra preservar o entry-point do
           onboarding existente. -->
      <template v-else-if="!positions.length">
        <div class="flex flex-col items-center gap-8 px-6 py-12">
          <div
            v-if="cameFromRaioXOnboarding"
            class="flex w-full max-w-2xl items-start gap-3 rounded-xl border px-4 py-3"
            :style="{
              borderColor: `color-mix(in srgb, ${brand.colors.primary} 32%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${brand.colors.primary} 6%, ${brand.colors.surface})`,
              boxShadow: `0 4px 14px -8px color-mix(in srgb, ${brand.colors.primary} 22%, transparent)`,
            }"
          >
            <UIcon
              name="i-lucide-sparkles"
              class="size-4 shrink-0"
              :style="{ color: brand.colors.primary, marginTop: '3px' }"
            />
            <div class="flex flex-col gap-0.5">
              <span
                class="font-mono-tab text-[10.5px] font-medium uppercase"
                :style="{ letterSpacing: '0.16em', color: brand.colors.primary }"
              >Raio-X automático</span>
              <p
                class="text-[13.5px] leading-snug"
                :style="{ color: brand.colors.text }"
              >
                Adicione seus ativos abaixo e o Raio-X é gerado automaticamente. Score 0 a 100, riscos, dividendos esperados, tudo.
              </p>
            </div>
          </div>

          <MoleculesWalletEmptyState
            @connected="onPluggyConnected"
            @upload-xlsx="onUploadXlsxRequest"
            @add-manual="onAddManualRequest"
          />
        </div>
      </template>

      <!-- Dashboard
           Ordem reformulada: ActionBar unificado no TOPO (status Open
           Finance + CTA raio-X + sync). Hero focado em FOTO. Saldos
           Open Finance logo abaixo. Composicao (allocation + positions)
           vem ANTES do raio-x. Raio-x (com stress test embutido) e a
           CAMADA QUALITATIVA. Calendar/events/goals/watchlist pareados
           em grids 2-col. -->
      <div v-else class="flex flex-col gap-9 px-6 py-8">
        <!-- ============ 0. ACTION BAR ============
             Banner unificado no TOPO. Mostra status Open Finance,
             botao de sincronizar tudo, CTA pra atualizar/gerar
             analise, botao limpar. Substitui ConnectionStatus +
             botoes do hero antigo. -->
        <MoleculesWalletActionBar
          :has-analysis="!!analysis"
          :generated-label="generatedLabel"
          :wiping="wiping"
          :refreshing="refreshing"
          :syncing="syncingPrimary"
          :connections="connections"
          :primary-connection="primaryConnection"
          @wipe="onWipeClick"
          @sync-and-refresh="onSyncAndRefresh"
          @connected="onPluggyConnected"
        />

        <!-- ============ 1. HEADER DO DASHBOARD ============
             Hero (foto do patrimonio) + saldos bancarios. Tudo o
             que responde "quanto eu tenho hoje" fica agrupado aqui.
             Sem botoes — esses migraram pro ActionBar acima. -->
        <section class="flex flex-col gap-4">
          <MoleculesWalletHeroPatrimony
            :total-value="totalValue"
            :pnl-amount="pnlAmount"
            :pnl-pct="pnlPct"
            :positions-count="positions.length"
            :ytd-pct="null"
            :vs-cdi-pct="null"
            :refreshing="refreshing"
          />

          <MoleculesWalletBankAccountsCard
            v-if="bankAccounts.length > 0"
            :accounts="bankAccounts"
            :totals="accountTotals"
            :pending="bankAccountsPending"
          />
        </section>

        <!-- ============ 2. METRICAS-RESUMO ============ -->
        <MoleculesWalletMetricsGrid
          :total-value="totalValue"
          :pnl-pct="pnlPct"
          :vs-cdi-pct="null"
          :score="score"
          :dividend-forecast-12m="dividendForecast12m"
          :dividend-meta="dividendMeta"
          :benchmarks="benchmarksMini"
        />

        <!-- ============ 2.5 METAS + WATCHLIST ============
             Cards minimalistas pareados, logo apos os KPIs. Antes
             ficavam no rodape; agora ja aparecem na "primeira tela"
             porque traduzem foco do user (onde quer chegar + o
             que esta acompanhando) — informacao tao importante
             quanto KPIs. -->
        <section class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MoleculesWalletGoalsCard :goals="goals" />
          <MoleculesWalletWatchlistCard :items="watchlist" />
        </section>

        <!-- ============ 3. COMPOSICAO ============
             Um unico bloco "Como sua carteira esta distribuida":
             allocation (donut + setores + geografia) + tabela de
             posicoes com tese expansivel. Antes eram 2 sections com
             headings duplicados ("Alocacao" e "Posicoes"); agora UM
             heading guarda-chuva que cobre os dois (por que ambos
             respondem a mesma pergunta da composicao). -->
        <section class="flex flex-col gap-6">
          <SectionHeading
            :brand="brand"
            eyebrow="Composição"
            title="Como sua carteira está distribuída"
          />

          <MoleculesWalletAllocationSection
            :by-class="allocationByClass"
            :sectors="allocationBySector"
            :geography="geography"
          />

          <MoleculesWalletPositionsTable
            :positions="positions"
            :total-value="totalValue"
            :connection-map="connectionMap"
            :analysis="analysis"
          />
        </section>

        <!-- ============ 4. RAIO-X (analise IA) ============
             Heading + summary movem pra ANTES do snowflake porque
             introduzem TODA a zona de raio-X (snowflake +
             dimensions + diagnostic + thesis + stress + macro +
             alternatives). So renderiza com analysis. -->
        <template v-if="analysis">
          <SectionHeading
            :brand="brand"
            eyebrow="9 dimensões"
            title="Como cada eixo da sua carteira está pontuando"
            :lead="analysis.summary_md || undefined"
          />

          <MoleculesWalletSnowflake
            v-if="snowflakeAxes.length"
            :axes="snowflakeAxes"
            :headline="snowflakeHeadline"
            :subline="snowflakeSubline"
          />

          <MoleculesWalletRaioXFull
            :analysis="analysis"
            :positions="positions"
            :total-value="totalValue"
          />
        </template>

        <!-- ============ 5. CALENDARIO UNIFICADO ============
             Big calendar mensal que agrega proventos (dividendos +
             JCP + rendimentos) + eventos (ex-date + earnings +
             rotacoes + vencimentos). Substitui os 2 cards
             antigos (DividendCalendarCard + EventsList) por uma
             unica visao igual a /dividendos/calendario publico. -->
        <MoleculesWalletEventsCalendar
          :dividends="dividendEvents"
          :events="upcomingEvents"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { UnifiedPosition } from '~/services/portfolio'
import type { WalletGoal, WatchlistItem, PortfolioAnalysis } from '~/services/walletData'
import type { PluggyConnection } from '~/services/pluggy'
import {
  analyzePortfolio,
  type PortfolioReport,
} from '~/composables/usePortfolioScore'

definePageMeta({ layout: 'default' })

usePageSeo({
  title: 'Minha Carteira',
  description: 'Carteira de investimentos',
  path: '/wallet',
  robots: 'noindex,nofollow',
})

const brand = useBrand()
const wallet = useWalletDataService()

const loading = ref(true)
const refreshing = ref(false)
const wiping = ref(false)
const positions = ref<UnifiedPosition[]>([])
const goals = ref<WalletGoal[]>([])
const watchlist = ref<WatchlistItem[]>([])
const analysis = ref<PortfolioAnalysis | null>(null)

const authStore = useAuthStore()
const onboarding = useOnboardingChecklist()
const router = useRouter()
const pluggy = usePluggyService()

// ============ PLUGGY / OPEN FINANCE ============
// Lista de conexoes Pluggy do user. Carregada uma vez junto com positions
// (loadAll). Usada pra:
//   1. Decidir se mostra o banner "Conectar Open Finance" (quando o user
//      tem positions mas zero conexao)
//   2. Renderizar a status row no topo do dashboard quando >= 1 conexao
//   3. Construir o connectionMap pra o PositionsTable mostrar o badge
//      "via XP/BTG/etc." em posicoes Pluggy
const connections = ref<PluggyConnection[]>([])
const syncingPrimary = ref(false)

// connectionMap: id -> { id, institution_name }. Usado pelo PositionsTable
// pra resolver pluggy_connection_id -> nome da instituicao no badge da
// posicao. Construido como objeto puro (nao Map) pra serializar bem
// como prop reativa no Vue.
const connectionMap = computed<Record<number, { id: number; institution_name: string }>>(() => {
  const out: Record<number, { id: number; institution_name: string }> = {}
  for (const c of connections.value) {
    out[c.id] = { id: c.id, institution_name: c.institution_name }
  }
  return out
})

const primaryConnection = computed<PluggyConnection | null>(() => {
  if (!connections.value.length) return null
  // Preferir uma conexao "saudavel" como destaque do status row. Se
  // todas estao em estado problematico, mostra a primeira mesmo
  // assim, o user ve o estado real e clica pra gerenciar.
  const healthy = connections.value.find((c) => c.status === 'UPDATED')
  return healthy ?? connections.value[0]!
})

// Banner welcome ("conecte Open Finance"): mostra quando o user TEM
// positions mas ZERO conexoes Pluggy. localStorage por-user pra
// dismissal persistente entre sessoes (chave inclui id pra nao vazar
// dismiss entre contas no mesmo browser).
const pluggyWelcomeDismissed = ref(false)

function pluggyDismissKey(): string | null {
  const uid = authStore.me?.id
  if (!uid) return null
  return `pluggy:dismissed:welcome:${uid}`
}

function loadPluggyWelcomeDismissed() {
  if (typeof localStorage === 'undefined') return
  const key = pluggyDismissKey()
  if (!key) return
  pluggyWelcomeDismissed.value = localStorage.getItem(key) === '1'
}

function dismissPluggyWelcome() {
  pluggyWelcomeDismissed.value = true
  if (typeof localStorage === 'undefined') return
  const key = pluggyDismissKey()
  if (!key) return
  try { localStorage.setItem(key, '1') } catch { /* quota / disabled storage */ }
}

const showPluggyWelcome = computed(() => {
  if (pluggyWelcomeDismissed.value) return false
  if (!positions.value.length) return false
  if (connections.value.length > 0) return false
  return true
})

// formatConnectionTimeSince movido pra MoleculesWalletConnectionStatus
// (extraido na refatoracao de organizacao do dashboard).

async function loadConnections() {
  try {
    connections.value = await pluggy.listConnections()
  } catch (err) {
    // Silent fail — sem conexoes carregadas, o banner de welcome
    // sumira (showPluggyWelcome trata vazio como "tem conexoes ja").
    // Logamos pro console pra debugging.
    console.warn('[wallet] failed to load pluggy connections', err)
    connections.value = []
  }
}

// Bank accounts (saldos bancarios + cartoes de credito) vindos via
// Open Finance. Carregados em paralelo com positions/connections.
// Renderizam no <MoleculesWalletBankAccountsCard> ACIMA da carteira.
const bankAccounts = ref<import('~/services/pluggy').PluggyAccount[]>([])
const accountTotals = ref<import('~/services/pluggy').AccountTotals | null>(null)
const bankAccountsPending = ref(false)

async function loadBankAccounts() {
  bankAccountsPending.value = true
  try {
    const resp = await pluggy.listAccounts()
    bankAccounts.value = resp.data
    accountTotals.value = resp.totals
  } catch (err) {
    console.warn('[wallet] failed to load bank accounts', err)
    bankAccounts.value = []
    accountTotals.value = null
  } finally {
    bankAccountsPending.value = false
  }
}

async function syncPrimaryConnection() {
  if (!primaryConnection.value || syncingPrimary.value) return
  syncingPrimary.value = true
  try {
    const result = await pluggy.syncConnection(primaryConnection.value.id)
    if (result.status === 'rate_limited') {
      const minutes = result.retry_after_minutes ?? 60
      showSuccessNotification(
        'Dados atualizados recentemente',
        `${primaryConnection.value.institution_name} foi sincronizado há pouco. Próximo refresh completo em ~${minutes} min.`,
      )
    } else {
      showSuccessNotification(
        'Sincronização iniciada',
        `Buscando dados atualizados em ${primaryConnection.value.institution_name}.`,
      )
    }
    // Re-fetch connections + positions juntos pra refletir o sync.
    await Promise.all([loadConnections(), reload()])
  } catch (err) {
    const msg
      = (err as { message?: string })?.message
      || 'Não foi possível iniciar a sincronização.'
    showErrorNotification('Erro ao sincronizar', msg)
  } finally {
    syncingPrimary.value = false
  }
}

/**
 * Handler unificado pro botao "Sincronizar dados" do ActionBar.
 * Quando ha conexao Pluggy ativa, dispara sync + reload (mesmo caminho
 * do syncPrimaryConnection). Sem conexao, faz so reload das positions
 * (caso o user queira reler dados que possam ter sido atualizados em
 * outra aba/contexto).
 */
async function onSyncAndRefresh() {
  if (primaryConnection.value) {
    // Reusa o syncPrimaryConnection que ja orquestra sync Pluggy +
    // reload + tratamento de rate-limit + notificacoes. Centralizar
    // aqui mantem 1 caminho pra "atualizar tudo".
    await syncPrimaryConnection()
    return
  }
  // Sem conexao: so reload local
  await reload()
  showSuccessNotification('Atualizado', 'Posições recarregadas.')
}

// Handlers do empty state + banner. Pluggy success: refetch tudo.
// Upload XLSX e Manual: redirecionam pro chat (XLSX) ou abre futura
// pagina de adicao manual. Por enquanto, ambos vao pro chat com intent
// distinto pra a IA orientar a forma certa.
async function onPluggyConnected(_payload: { itemId: string }) {
  showSuccessNotification(
    'Conta conectada',
    'Sincronização inicial em andamento. Atualizando sua carteira.',
  )
  await Promise.all([loadConnections(), reload()])
}

function onUploadXlsxRequest() {
  // O fluxo XLSX migrou pro chat (vide /help?intent=import-portfolio)
  // — laravel /api/portfolio/upload esta @deprecated. Mantemos o
  // emit pra UX consistente caso um dia volte um picker nativo.
  router.push('/help?intent=import-portfolio')
}

function onAddManualRequest() {
  // Adicao manual ainda nao tem pagina propria; encaminha pra chat
  // com intent que orienta a IA a guiar o user.
  router.push('/help?intent=add-position-manual')
}

// Sinaliza se o usuario veio do step "Gerar Raio-X da sua carteira" do
// onboarding. Usado pra mostrar o banner contextual no empty state
// explicando que o raio-x e gerado automaticamente apos enviar a
// carteira. Query param em vez de localStorage pra ser auto-limpo
// quando o user troca de pagina. (`route` ja e declarado abaixo no
// watcher de import-portfolio — nao duplicar.)
const cameFromRaioXOnboarding = computed(
  () => useRoute().query.from === 'onboarding-raio-x',
)

// Video tutorial do empty state. Arquivo de ~28MB com audio narrado
// (~5min) explicando o fluxo "abre chat → cola planilha → carteira
// populada → raio-x gerado". Servido com `preload="none"` no template
// pra nao baixar tudo no load — so fetch quando o user clica play.
// Binding dinamico (:src) em vez de src estatico evita o bug do Vite
// reescrever pra /_nuxt/@fs/... e dar 404. Mesmo padrao usado em
// pages/raio-x.vue e RaioXSimulationModal.vue.
const emptyDemoVideoSrc = '/assets/videos/como-gerar-raio-x.mp4'

// Watcher onboarding: assim que o usuario tiver 1+ posicao na carteira,
// marca o passo "Adicionar 1º ativo" como concluido. Roda uma vez (a
// flag e idempotente no localStorage). Usa `length > 0` em vez de
// `length === 1` pra cobrir tambem o caso de import bulk via chat
// (vários ativos chegando juntos do /help?intent=import-portfolio).
watch(
  () => positions.value.length,
  (n) => {
    if (n > 0) onboarding.markStepDone('wallet')
  },
)

const emptyCardStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${brand.colors.surface} 55%, ${brand.colors.background})`,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 50%, transparent)`,
}))

// actionBarStyle movido pra MoleculesWalletActionBar (extraido).

// Friendly timestamp shown next to the raio-X CTA so the user knows
// how fresh the analysis is. Falls back to empty string when the
// server didn't return a usable date.
const generatedLabel = computed(() => {
  const iso = analysis.value?.generated_at
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    return `${date}, ${time}`
  } catch {
    return ''
  }
})

/**
 * Limpar carteira — destructive 2-step deletion:
 *   1. DELETE /api/portfolio   (Laravel: positions + analysis row)
 *   2. DELETE /api/chat/memories/portfolio  (chat-db: carteira_atual,
 *      carteira_atual_composicao, derived raio-x memories)
 *
 * Both run in parallel (Promise.allSettled) so a hiccup on one side
 * doesn't block the other from completing. After both resolve we
 * reload the page state — the empty state takes over once positions
 * is back to []. Confirmation is a plain `confirm()` for now;
 * upgrade to a styled modal once a Modal molecule lands.
 */
async function onWipeClick(): Promise<void> {
  const ok = window.confirm(
    'Tem certeza que quer apagar TODA a sua carteira?\n\n' +
      'Isso remove suas posições, o último raio-X salvo e o que a IA lembra ' +
      'sobre a carteira. Suas metas e watchlist NÃO são apagadas.\n\n' +
      'Pra ter de volta, importe a planilha do CEI no chat.',
  )
  if (!ok) return

  wiping.value = true
  try {
    const cfg = useRuntimeConfig()
    const apiBase = cfg.public.apiBaseUrl as string
    const direct = (cfg.public as { chatDirectUrl?: string }).chatDirectUrl
    const chatBase = direct && import.meta.client ? direct : '/api/chat'
    const auth = authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}

    await Promise.allSettled([
      fetch(`${apiBase}/portfolio`, {
        method: 'DELETE',
        headers: { Accept: 'application/json', ...auth },
      }),
      fetch(`${chatBase}/memories/portfolio`, {
        method: 'DELETE',
        headers: { Accept: 'application/json', ...auth },
      }),
    ])

    // Reset the local state immediately so the empty branch renders
    // before the network reload finishes — the wipe feels instant.
    positions.value = []
    analysis.value = null
    await reload()
  } catch (err) {
    console.error('[wallet] wipe failed', err)
  } finally {
    wiping.value = false
  }
}

const afterImportCards = [
  {
    title: 'Raio-X completo da carteira',
    body: 'Score 0-100 em 9 dimensões: diversificação, qualidade, renda, hedge cambial, volatilidade, macro. Identifica riscos e oportunidades.',
    icon: 'i-lucide-radar',
    tint: '#fbbf24',
  },
  {
    title: 'Calendário de proventos vivo',
    body: 'Próximos pagamentos de dividendos, JCP e rendimentos com valor estimado. Total esperado nos próximos 12 meses.',
    icon: 'i-lucide-calendar-days',
    tint: '#34d399',
  },
  {
    title: 'Watchlist + metas integradas',
    body: 'Defina objetivos no chat (aposentadoria, reserva, casa) e veja o progresso aqui. Watchlist atualizada em tempo real.',
    icon: 'i-lucide-target',
    tint: '#a78bfa',
  },
] as const

// ============ Derived totals ============
const totalValue = computed(() =>
  positions.value.reduce((s, p) => s + (p.current_value ?? p.quantity * (p.current_price ?? p.average_price)), 0),
)
const totalCost = computed(() =>
  positions.value.reduce((s, p) => s + p.quantity * p.average_price, 0),
)
const pnlAmount = computed(() => (totalCost.value ? totalValue.value - totalCost.value : null))
const pnlPct = computed(() =>
  totalCost.value ? ((totalValue.value - totalCost.value) / totalCost.value) * 100 : null,
)

// ============ Allocation by class ============
const CLASS_LABELS: Record<string, { label: string; color: string }> = {
  STOCK: { label: 'Ações', color: '#fbbf24' },
  REIT: { label: 'FIIs', color: '#a78bfa' },
  ETF: { label: 'ETFs', color: '#34d399' },
  TREASURY: { label: 'Tesouro', color: '#10b981' },
  BDR: { label: 'BDR', color: '#60a5fa' },
  CRYPTO: { label: 'Cripto', color: '#f59e0b' },
}

const allocationByClass = computed(() => {
  if (!totalValue.value) return []
  const map = new Map<string, number>()
  for (const p of positions.value) {
    const k = (p.asset_class || 'OTHER') as string
    const v = p.current_value ?? p.quantity * (p.current_price ?? p.average_price)
    map.set(k, (map.get(k) || 0) + v)
  }
  return [...map.entries()]
    .map(([k, value]) => ({
      label: CLASS_LABELS[k]?.label || k,
      color: CLASS_LABELS[k]?.color || brand.colors.primary,
      value,
      weight_pct: (value / totalValue.value) * 100,
    }))
    .sort((a, b) => b.value - a.value)
})

// Sector resolution falls back to asset class when CompanyProfile
// has no sector entry (typical for ETFs, FIIs without company data,
// and Treasury bonds). This way the donut + bars actually break the
// portfolio down instead of lumping everything into "Outros".
function resolveSector(p: { sector?: string | null; asset_class?: string; ticker: string }): string {
  if (p.sector && p.sector.trim().length > 0) return p.sector
  switch (p.asset_class) {
    case 'TREASURY': return 'Renda Fixa · Tesouro'
    case 'REIT': return 'FII · Sem classificação'
    case 'ETF': return 'ETF'
    case 'BDR': return 'BDR · Sem classificação'
    case 'CRYPTO': return 'Cripto'
  }
  return 'Outros'
}

const allocationBySector = computed(() => {
  if (!totalValue.value) return []
  const map = new Map<string, number>()
  for (const p of positions.value) {
    const sector = resolveSector(p)
    const v = p.current_value ?? p.quantity * (p.current_price ?? p.average_price)
    map.set(sector, (map.get(sector) || 0) + v)
  }
  return [...map.entries()]
    .map(([sector, value]) => ({
      sector,
      value,
      weight_pct: (value / totalValue.value) * 100,
    }))
    .sort((a, b) => b.value - a.value)
})

// ============ Geography ============
const geography = computed(() => {
  if (!totalValue.value) return { brPct: 0, intlPct: 0, intlNote: '', note: '' }
  let intl = 0
  for (const p of positions.value) {
    const v = p.current_value ?? p.quantity * (p.current_price ?? p.average_price)
    if (
      p.asset_class === 'BDR' ||
      p.ticker === 'IVVB11' ||
      p.ticker === 'GOLD11' ||
      p.ticker === 'BIIB39'
    ) {
      intl += v
    }
  }
  const intlPct = (intl / totalValue.value) * 100
  return {
    brPct: 100 - intlPct,
    intlPct,
    intlNote: intl ? 'BDR / GOLD11' : '',
    note: intlPct < 5
      ? 'Risco cambial alto: queda forte do real reduziria patrimônio. Considere IVVB11 ou BDRs pra hedge.'
      : '',
  }
})

// ============ usePortfolioScore (real) ============
const report = computed<PortfolioReport | null>(() => {
  if (!positions.value.length) return null
  // Map UnifiedPosition → PortfolioInput. Treasury tickers in our wallet
  // schema are already in plain-text form ("TESOURO IPCA+ 2032") which
  // the score engine handles via inferUnknownTicker fallback.
  const inputs = positions.value.map((p) => {
    const v = p.current_value ?? p.quantity * (p.current_price ?? p.average_price)
    return { ticker: p.ticker, weight: v }
  })
  return analyzePortfolio(inputs, brand.colors.primary)
})

// Single source of truth for "the" score: prefer the AI snapshot
// when present (authoritative — same number rendered in the big
// gauge inside RaioXFull below). Falls back to the live heuristic
// from usePortfolioScore when the user hasn't run a raio-X yet, so
// the metric tile still shows something meaningful on a fresh
// import. Without this fallback the user would see "two scores"
// (live in the metrics grid, snapshot in the gauge) that disagreed.
const score = computed(() => analysis.value?.score ?? report.value?.score ?? 0)

// ============ Snowflake (5-axis radar) ============
// Collapses the 9 deterministic dimensions of the raio-x into the 5
// classic investor-radar axes: Valor / Futuro / Passado / Saúde /
// Dividendos. Mapping is intentional, not 1-to-1:
//   - Valor      ← `quality` (proxy for company-fundamental value)
//   - Futuro     ← `growth` (growth-sector exposure)
//   - Passado    ← `volatility` (defensiveness = solid past survival)
//   - Saúde      ← average(`diversification`, `concentration`, `macro`)
//                  (capacidade de aguentar tranco multi-frente)
//   - Dividendos ← `income` (DY ponderado)
// All inputs are 0-100 already (deterministic raio-x output), so no
// rescaling needed.
function dimByKey(key: string): { value: number; note: string } | null {
  const d = analysis.value?.dimensions?.find((x) => x.key === key)
  if (!d) return null
  return { value: d.value, note: d.note ?? '' }
}

const snowflakeAxes = computed(() => {
  // Hide the snowflake while there's no snapshot — caller already
  // gates on `analysis` so this just guards against transient nulls.
  if (!analysis.value?.dimensions?.length) return []
  const quality = dimByKey('quality')
  const growth = dimByKey('growth')
  const volatility = dimByKey('volatility')
  const income = dimByKey('income')
  const diversification = dimByKey('diversification')
  const concentration = dimByKey('concentration')
  const macro = dimByKey('macro')
  const healthInputs = [diversification, concentration, macro].filter(
    (x): x is { value: number; note: string } => x != null,
  )
  const healthAvg = healthInputs.length
    ? Math.round(healthInputs.reduce((s, x) => s + x.value, 0) / healthInputs.length)
    : 0
  return [
    { key: 'valor', label: 'Valor', value: quality?.value ?? 0, note: quality?.note },
    { key: 'futuro', label: 'Futuro', value: growth?.value ?? 0, note: growth?.note },
    { key: 'passado', label: 'Passado', value: volatility?.value ?? 0, note: volatility?.note },
    { key: 'saude', label: 'Saúde', value: healthAvg, note: 'Diversificação, concentração e macro combinados.' },
    { key: 'dividendos', label: 'Dividendos', value: income?.value ?? 0, note: income?.note },
  ]
})

const snowflakeHeadline = computed(() => {
  const axes = snowflakeAxes.value
  if (!axes.length) return 'Sua carteira em 5 eixos'
  const sorted = [...axes].sort((a, b) => b.value - a.value)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]
  if (!best || !worst) return 'Sua carteira em 5 eixos'
  // Hand-tuned headline — same pattern as SimplyWall's snowflake card.
  const labelMap: Record<string, string> = {
    valor: 'Valor sólido',
    futuro: 'Crescimento à frente',
    passado: 'Histórico defensivo',
    saude: 'Saúde robusta',
    dividendos: 'Renda passiva forte',
  }
  return labelMap[best.key] ?? 'Sua carteira em 5 eixos'
})

const snowflakeSubline = computed(() => {
  const axes = snowflakeAxes.value
  if (!axes.length) return ''
  const sorted = [...axes].sort((a, b) => b.value - a.value)
  const top = sorted[0]
  const bottom = sorted[sorted.length - 1]
  if (!top || !bottom) return ''
  return `Mais forte em ${top.label.toLowerCase()} (${Math.round(top.value)}). Mais fraco em ${bottom.label.toLowerCase()} (${Math.round(bottom.value)}). A área preenchida mostra o equilíbrio do conjunto.`
})

const dividendForecast12m = computed(() => {
  if (!report.value) return 0
  // monthlyDividendsTotal is normalized per R$ 100k; scale to actual value.
  const ratio = totalValue.value / 100000
  return (report.value.monthlyDividendsTotal || 0) * 12 * ratio
})

const dividendMeta = computed(() => {
  if (!report.value) return ''
  return report.value.expectedReturnLabel || 'DY estimado'
})

const benchmarksMini = computed(() => {
  if (!report.value) return []
  return (report.value.benchmarks || [])
    .filter((b) => b.label.toLowerCase() !== 'sua carteira')
    .slice(0, 3)
    .map((b) => ({ label: b.label, return_12m_pct: b.expected || 0 }))
})

// Upcoming dividend events (next 60 days) — pulled live from the
// public `/api/dividends/upcoming` endpoint and filtered by the
// tickers the user actually holds. Falls back to an empty list on
// network failure (DividendCalendarCard handles that gracefully).
const liveDividendCalendar = ref<
  Array<{
    ticker: string
    name: string
    amount: number
    payment_date: string // ISO YYYY-MM-DD
    kind: 'Dividendo' | 'JCP' | 'Rendimento'
  }>
>([])

async function loadLiveDividendCalendar() {
  if (!positions.value || positions.value.length === 0) {
    liveDividendCalendar.value = []
    return
  }
  try {
    const assets = useAssetsService()
    const groups = await assets.getUpcomingDividends(60, 300)
    if (!Array.isArray(groups)) {
      liveDividendCalendar.value = []
      return
    }
    const userTickers = new Set(positions.value.map((p) => p.ticker.toUpperCase()))
    const events: typeof liveDividendCalendar.value = []
    for (const group of groups as Array<{ date: string; items: any[] }>) {
      const items = Array.isArray(group?.items) ? group.items : []
      for (const it of items) {
        const ticker = (it.ticker || '').toUpperCase()
        if (!userTickers.has(ticker)) continue
        const pos = positions.value.find((p) => p.ticker.toUpperCase() === ticker)
        const qty = pos?.quantity || 0
        const rate = Number(it.rate) || 0
        events.push({
          ticker,
          name: it.name || '',
          amount: rate * qty, // estimated total payout per holding
          payment_date: group.date,
          kind: classifyKind(it.label),
        })
      }
    }
    // Sort by date ascending; cap to 10 to keep the card concise.
    events.sort((a, b) => a.payment_date.localeCompare(b.payment_date))
    liveDividendCalendar.value = events.slice(0, 10)
  } catch {
    liveDividendCalendar.value = []
  }
}

function classifyKind(label: string | null | undefined): 'Dividendo' | 'JCP' | 'Rendimento' {
  const s = (label || '').toUpperCase()
  if (s.includes('JCP') || s.includes('JUROS')) return 'JCP'
  if (s.includes('REND') || s.includes('AMORT')) return 'Rendimento'
  return 'Dividendo'
}

const dividendEvents = computed(() => liveDividendCalendar.value)

// Real upcoming events derived from data we actually have:
//   1. Dividend payment dates (top 5 from liveDividendCalendar)
//   2. Tesouro maturity dates from positions
//   3. (Earnings calendar would need a separate API — out of scope.)
//
// Each entry is filtered to ensure `date` is a valid ISO string,
// avoiding the "Invalid Date" issue that came from the score
// composable's relative-date strings ("hoje", "em 5 dias").
const upcomingEvents = computed(() => {
  const out: Array<{ date: string; label: string; kind: 'pay' | 'maturity' | 'rotate' }> = []

  // Dividend payments (top 5 closest)
  for (const d of liveDividendCalendar.value.slice(0, 5)) {
    if (!d.payment_date) continue
    out.push({
      date: d.payment_date,
      label: `Pagamento ${d.ticker}`,
      kind: 'pay',
    })
  }

  // Tesouro maturities — only those still in the future
  const todayIso = new Date().toISOString().slice(0, 10)
  for (const p of positions.value) {
    const m = (p as { maturity?: string }).maturity
    if (!m || typeof m !== 'string') continue
    const isoDate = m.slice(0, 10) // strip time component if present
    if (isoDate <= todayIso) continue
    out.push({
      date: isoDate,
      label: `Vencimento ${p.ticker}`,
      kind: 'maturity',
    })
  }

  // Sort by date asc, cap at 8 items.
  return out
    .filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8)
})

// ============ Loading ============
async function loadAll() {
  const [pos, gs, wl, snap] = await Promise.all([
    wallet.getPositions(),
    wallet.getGoals(),
    wallet.getWatchlist(),
    wallet.getPortfolioAnalysis(),
  ])
  positions.value = pos
  goals.value = gs
  watchlist.value = wl
  analysis.value = snap

  // Live dividend calendar depends on positions; fire after the
  // positions list is populated. Non-blocking — the rest of the
  // dashboard renders without waiting on it.
  void loadLiveDividendCalendar()
  // Pluggy connections sao independentes de positions, mas a ordem
  // importa pra UX: showPluggyWelcome depende de ambos (positions
  // > 0 AND connections.length === 0). Disparado em paralelo ao
  // calendario, sem bloquear o resto do dashboard.
  void loadConnections()
  // Saldos bancarios (Pluggy accounts) — independente de positions e
  // connections, render proprio. Disparado em paralelo.
  void loadBankAccounts()
}

async function reload() {
  refreshing.value = true
  try {
    await loadAll()
  } finally {
    refreshing.value = false
  }
}

onMounted(async () => {
  loading.value = true
  // Carrega o estado de dismiss do banner Pluggy ANTES de mostrar o
  // dashboard (depende do user.id, que ja esta no authStore quando
  // cheganos aqui pq middleware/auth.global garantiu).
  loadPluggyWelcomeDismissed()
  try {
    await loadAll()
  } finally {
    loading.value = false
  }
})

// MVP: refetch when navigating from /help?intent=import-portfolio
// (chat-service has already saved by the time we land here).
const route = useRoute()
watch(() => route.fullPath, async (path, prev) => {
  if (prev && prev.includes('/help') && path === '/wallet') {
    await reload()
  }
})
</script>

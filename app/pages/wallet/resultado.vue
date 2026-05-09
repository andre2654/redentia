<!--
  /wallet/resultado — pagina de resultado da carteira.

  Dois modos com vocabulario visual distinto, mesmo dataset por baixo:
    - 'carteira' (default) — calmo, editorial, foco em janela mensal/anual
    - 'day-trade' (toggle)  — denso, terminal, foco em janela intraday

  Persistencia do modo: localStorage por user + query param ?mode=.
  Toggle vive no canto superior direito da pagina (header local), nao no
  sidebar. Detalhes em ~/composables/useResultMode.

  Dados: trades reais via Pluggy / `portfolio_trades` table. Quando o
  user nao tem nenhuma conexao Pluggy ativa, mostra empty state com
  CTA pra /wallet (onde vive o widget de conexao). Paywall e
  auth-gating ja sao globais (middleware), aqui o gate adicional e
  Open Finance.

  Layout: usa o `default` layout (sidebar + header da plataforma).
  Auth-guarded pelo middleware/auth.global. Paywall pelo
  middleware/requires-subscription.global (cobre /wallet/**).
-->
<template>
  <NuxtLayout title="Resultado">
    <div :style="{ backgroundColor: brand.colors.background, color: brand.colors.text }">
      <div class="flex flex-col gap-8">
        <!-- ============ HEADER LOCAL ============
             Toggle de modo a direita; nao duplicamos titulo/eyebrow
             porque os componentes Carteira/DayTrade ja trazem seus
             proprios heros. -->
        <header class="flex flex-wrap items-center justify-between gap-3">
          <NuxtLink
            to="/wallet"
            class="resultado-back inline-flex items-center gap-2 text-[12.5px]"
            :style="{ color: `color-mix(in srgb, ${brand.colors.text} 55%, transparent)` }"
          >
            <UIcon name="i-lucide-arrow-left" class="size-3.5" />
            <span>Voltar para a carteira</span>
          </NuxtLink>

          <MoleculesResultadoModeToggle
            v-if="hasConnection && trades.length > 0"
            :mode="mode"
            @update:mode="setMode"
          />
        </header>

        <!-- ============ LOADING ============ -->
        <div
          v-if="loading"
          class="flex items-center justify-center py-32"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="size-8 motion-safe:animate-spin"
            :style="{ color: brand.colors.primary }"
          />
        </div>

        <!-- ============ EMPTY STATE: SEM PLUGGY ============
             Resultado real depende 100% do historico de transacoes que
             so vem via Open Finance. Sem conexao ativa, nao tem como
             gerar metricas — mostramos CTA pra conectar (que vive
             dentro de /wallet, onde o widget Pluggy esta integrado). -->
        <section
          v-else-if="!hasConnection"
          class="empty-of rounded-2xl border p-8 md:p-10"
          :style="emptyCardStyle"
        >
          <div class="empty-of__icon" :style="{ color: brand.colors.primary }">
            <UIcon name="i-lucide-link-2" class="size-8" />
          </div>
          <div class="flex flex-col gap-2 max-w-xl">
            <span
              class="font-mono-tab text-[11px] font-medium uppercase"
              :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
            >Open Finance</span>
            <h2
              class="font-light"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(22px, 2.6vw, 28px)',
                letterSpacing: '-0.015em',
                lineHeight: 1.2,
              }"
            >Conecte sua corretora pra ver o resultado</h2>
            <p
              class="text-[14px] leading-relaxed"
              :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)` }"
            >
              O Resultado é montado a partir das suas operações reais. Sem Open Finance conectado, não temos histórico pra calcular P&amp;L, win rate, distribuição por estilo ou qualquer outra métrica.
            </p>
            <p
              class="text-[12.5px] leading-relaxed mt-1"
              :style="{ color: `color-mix(in srgb, ${brand.colors.text} 50%, transparent)` }"
            >
              A conexão é segura via Open Finance regulado pelo Banco Central — você concede leitura de dados, não movimentação. Importamos automaticamente até 12 meses de histórico.
            </p>
          </div>
          <NuxtLink
            to="/wallet"
            class="empty-of__cta"
            :style="emptyCtaStyle"
          >
            <UIcon name="i-lucide-plug" class="size-4" />
            Conectar Open Finance
            <UIcon name="i-lucide-arrow-right" class="size-3.5" />
          </NuxtLink>
        </section>

        <!-- ============ EMPTY: TEM CONNECTION MAS SEM TRADES AINDA ============
             Pode ser backfill historico rodando (primeira sync, ate
             algumas horas) ou conta nova sem operacoes nos ultimos
             12 meses. Texto adapta. -->
        <section
          v-else-if="!trades.length"
          class="empty-of rounded-2xl border p-8 md:p-10"
          :style="emptyCardStyle"
        >
          <div class="empty-of__icon" :style="{ color: brand.colors.primary }">
            <UIcon
              :name="backfillRunning ? 'i-lucide-loader-2' : 'i-lucide-inbox'"
              class="size-8"
              :class="{ 'motion-safe:animate-spin': backfillRunning }"
            />
          </div>
          <div class="flex flex-col gap-2 max-w-xl">
            <span
              class="font-mono-tab text-[11px] font-medium uppercase"
              :style="{ letterSpacing: '0.18em', color: brand.colors.primary }"
            >{{ backfillRunning ? 'Sincronizando' : 'Sem operações' }}</span>
            <h2
              class="font-light"
              :style="{
                color: brand.colors.text,
                fontSize: 'clamp(22px, 2.6vw, 28px)',
                letterSpacing: '-0.015em',
                lineHeight: 1.2,
              }"
            >{{ backfillRunning
              ? 'Importando seu histórico de operações'
              : 'Nenhuma operação no período' }}</h2>
            <p
              class="text-[14px] leading-relaxed"
              :style="{ color: `color-mix(in srgb, ${brand.colors.text} 65%, transparent)` }"
            >
              <template v-if="backfillRunning">
                Estamos buscando até 12 meses de operações com sua corretora via Open Finance. Isso pode levar alguns minutos na primeira vez. Volte daqui a pouco.
              </template>
              <template v-else>
                A conexão está ativa, mas não encontramos operações nos últimos 12 meses. Se você operou nesse período, peça pra sua corretora reenviar o histórico via Open Finance, ou aguarde a próxima sincronização.
              </template>
            </p>
          </div>
        </section>

        <!-- ============ MODOS (com dados reais) ============ -->
        <Transition v-else name="resultado-mode" mode="out-in">
          <MoleculesResultadoCarteira
            v-if="mode === 'carteira'"
            key="carteira"
            :trades="trades"
          />
          <MoleculesResultadoDayTrade
            v-else
            key="day-trade"
            :trades="trades"
          />
        </Transition>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { MockTrade } from '~/composables/useMockTrades'

definePageMeta({ layout: 'default' })

usePageSeo({
  title: 'Resultado da carteira',
  description: 'Resultado consolidado: P&L, trades fechados, performance vs benchmarks.',
  path: '/wallet/resultado',
  robots: 'noindex,nofollow',
})

const brand = useBrand()
const { mode, setMode, hydrate } = useResultMode()
const pluggy = usePluggyService()
const tradesService = usePortfolioTradesService()

// Estado: connections + trades. Loading enquanto fazemos as duas
// requests em paralelo no mount. Trades so sao buscados se ha
// connection (otimizacao — sem connection a backend retornaria
// vazio mesmo, mas evitamos chamada desnecessaria).
const loading = ref(true)
const hasConnection = ref(false)
const trades = ref<MockTrade[]>([])
// Diferencia "tem conexao mas backfill ainda rodando / 0 trades"
// de "tem conexao com trades reais". Quando true, mostra um aviso
// secundario abaixo do gate principal explicando que sync historico
// pode demorar alguns minutos na primeira vez.
const backfillRunning = ref(false)

async function loadAll() {
  loading.value = true
  try {
    const connections = await pluggy.listConnections().catch(() => [])
    hasConnection.value = connections.length > 0

    if (hasConnection.value) {
      const resp = await tradesService.listTrades('12m').catch((err) => {
        console.warn('[resultado] listTrades failed', err)
        return { data: [], meta: null }
      })
      trades.value = resp.data
      // Se tem conexao com status UPDATING ou last_synced_at=null
      // E zero trades retornados, provavelmente o backfill historico
      // ainda esta rodando.
      if (trades.value.length === 0) {
        backfillRunning.value = connections.some(
          (c) => c.status === 'UPDATING' || c.last_synced_at === null,
        )
      }
    } else {
      trades.value = []
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  hydrate()
  await loadAll()
})

const emptyCardStyle = computed(() => ({
  backgroundColor: brand.colors.surface,
  borderColor: `color-mix(in srgb, ${brand.colors.border} 55%, transparent)`,
  boxShadow: `0 12px 40px -24px color-mix(in srgb, ${brand.colors.primary} 30%, transparent)`,
}))

const emptyCtaStyle = computed(() => ({
  backgroundColor: brand.colors.primary,
  color: brand.colors.background,
  boxShadow: `0 8px 22px -10px color-mix(in srgb, ${brand.colors.primary} 60%, transparent)`,
}))
</script>

<style scoped>
.resultado-back {
  transition: color 160ms ease;
}
.resultado-back:hover {
  color: var(--brand-primary) !important;
}
.resultado-back:hover :deep(.iconify),
.resultado-back:hover svg {
  transform: translateX(-2px);
  transition: transform 160ms ease;
}

/* ============ Empty state Open Finance ============ */
.empty-of {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
  overflow: hidden;
}

.empty-of::before {
  content: '';
  position: absolute;
  top: -60px;
  right: -60px;
  width: 280px;
  height: 280px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--brand-primary) 10%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.empty-of__icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 28%, transparent);
}

.empty-of__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  text-decoration: none;
  transition: filter 150ms, transform 150ms;
}
.empty-of__cta:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

@media (prefers-reduced-motion: reduce) {
  .empty-of__cta:hover {
    transform: none;
  }
}

/* Transicao sutil entre modos. */
.resultado-mode-enter-active,
.resultado-mode-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}
.resultado-mode-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.resultado-mode-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .resultado-mode-enter-active,
  .resultado-mode-leave-active {
    transition: opacity 120ms;
  }
  .resultado-mode-enter-from,
  .resultado-mode-leave-to {
    transform: none;
  }
}
</style>

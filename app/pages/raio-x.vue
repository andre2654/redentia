<!--
  /raio-x — Raio-X da Carteira

  Fluxo principal de aquisicao do Redent.IA. URL e a fonte unica de verdade
  via ?tickers=PETR4,ITUB4,...

  Sem ?tickers: mostra hero curto + input + sugestoes + 3 steps
  Com ?tickers:  mostra MoleculesPortfolioDiagnosis com tudo

  Sem cadastro obrigatorio. Conversao via CTA pos-diagnostico para
  monitoramento continuo (auth/register).
-->
<script setup lang="ts">
import { analyzePortfolio, analyzePortfolioAsync, DEMO_PORTFOLIO } from '~/composables/usePortfolioScore'
import type { PortfolioReport } from '~/composables/usePortfolioScore'

definePageMeta({
  isPublicRoute: true,
})

const brand = useBrand()
const route = useRoute()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const apiBase = (runtimeConfig.public.apiBaseUrl as string) || ''

const layoutName = computed(() => {
  // Sem layout authenticated quando o user esta deslogado.
  // Reusa unauthenticated do projeto.
  return 'unauthenticated'
})

// ----- URL como source of truth -----
const tickersFromUrl = computed<string[]>(() => {
  const raw = route.query.tickers
  if (!raw) return []
  const v = Array.isArray(raw) ? raw[0] : raw
  return String(v)
    .split(/[,;]/)
    .map(s => s.trim().toUpperCase().replace(/\s+/g, ' '))
    .filter(Boolean)
})

const hasTickers = computed(() => tickersFromUrl.value.length > 0)

// Versao sincrona como fallback inicial (renderiza imediatamente com mock).
// Por baixo, dispara a versao async que substitui pelos dados reais.
const initialReport = computed<PortfolioReport | null>(() => {
  if (!hasTickers.value) return null
  return analyzePortfolio(tickersFromUrl.value.map(t => ({ ticker: t })), brand.colors.primary)
})

const realReport = ref<PortfolioReport | null>(null)
const loadingReal = ref(false)

const report = computed(() => realReport.value || initialReport.value)

const { track } = useMetaPixel()

onMounted(() => {
  track('ViewContent', {
    content_name: 'Raio-X Carteira',
    content_category: 'portfolio_analysis',
    content_type: 'product',
  })
  if (hasTickers.value) {
    track('Lead', {
      content_name: 'Raio-X Carteira',
      content_category: 'portfolio_analysis',
      num_assets: tickersFromUrl.value.length,
    })
  }
})

watch(
  () => tickersFromUrl.value.join(','),
  async (csv, prevCsv) => {
    if (!csv || !apiBase) return
    if (prevCsv !== undefined && prevCsv !== csv) {
      track('Lead', {
        content_name: 'Raio-X Carteira',
        content_category: 'portfolio_analysis',
        num_assets: tickersFromUrl.value.length,
      })
    }
    loadingReal.value = true
    try {
      const inputs = tickersFromUrl.value.map(t => ({ ticker: t }))
      realReport.value = await analyzePortfolioAsync(inputs, apiBase, brand.colors.primary)
    }
    catch (err) {
      console.warn('[raio-x] fallback para mock:', err)
    }
    finally {
      loadingReal.value = false
    }
  },
  { immediate: true },
)

function loadDemo() {
  const tickers = DEMO_PORTFOLIO.map(p => p.ticker.replace('TESOURO_SELIC', 'TESOURO SELIC')).join(',')
  router.push({ path: '/raio-x', query: { tickers } })
}

function resetAnalysis() {
  router.push({ path: '/raio-x' })
}

// SEO
const siteUrl = computed(() => {
  const url = runtimeConfig.public?.siteUrl || brand.url
  return String(url).endsWith('/') ? String(url).slice(0, -1) : String(url)
})

usePageSeo({
  title: hasTickers.value
    ? `Raio-X de ${tickersFromUrl.value.length} ativos | ${brand.name}`
    : 'Raio-X da Carteira | Descubra os riscos escondidos da sua carteira em 2 minutos',
  description: 'Analise gratuita da sua carteira de investimentos. Cruzamos fundamentos, dividendos, concentracao, noticias e risco para mostrar o que esta bom, o que esta ruim e o que mudou.',
  path: hasTickers.value ? `/raio-x?tickers=${tickersFromUrl.value.join(',')}` : '/raio-x',
})
</script>

<template>
  <NuxtLayout :name="layoutName" title="Raio-X da Carteira">
    <main class="raio-x">
      <!-- ============ STATE A: sem tickers, mostra input + steps ============ -->
      <section v-if="!hasTickers" class="raio-x__hero">
        <!-- Atmospheric radial -->
        <div
          class="raio-x__radial pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
          :style="{
            background: `radial-gradient(ellipse 60% 70% at 80% 0%, color-mix(in srgb, ${brand.colors.primary} 26%, transparent), transparent 60%)`,
            filter: 'blur(120px)',
          }"
        />

        <div class="mx-auto max-w-4xl px-6 py-16 md:py-24">
          <div class="flex flex-col items-start gap-6 md:items-center md:text-center">
            <p class="eyebrow">RAIO-X DA CARTEIRA</p>
            <h1
              class="max-w-3xl text-[40px] font-light leading-[1.05] tracking-[-0.025em] md:text-[64px]"
              :style="{ color: 'var(--text-heading)' }"
            >
              Descubra os riscos escondidos da sua
              <span class="italic" style="font-family: 'Instrument Serif', serif; color: var(--brand-primary)">carteira</span>
              em 2 minutos.
            </h1>
            <p
              class="max-w-2xl text-[17px] leading-relaxed md:text-[19px]"
              :style="{ color: 'var(--text-body)' }"
            >
              Adicione seus ativos e a Redent.IA cruza fundamentos, noticias, dividendos, concentracao e mercado para mostrar o que esta bom, o que esta ruim e o que mudou.
            </p>

            <div class="mt-4 w-full max-w-2xl">
              <AtomsPortfolioInput
                variant="hero"
                :autofocus="true"
                cta-label="Gerar meu Raio-X gratis"
              />
            </div>

            <ul class="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]" :style="{ color: 'var(--text-muted)' }">
              <li class="flex items-center gap-2">
                <span class="size-1 rounded-full" :style="{ background: brand.colors.primary }" />
                Sem cadastro
              </li>
              <li class="flex items-center gap-2">
                <span class="size-1 rounded-full" :style="{ background: brand.colors.primary }" />
                Resultado em 2 min
              </li>
              <li class="flex items-center gap-2">
                <span class="size-1 rounded-full" :style="{ background: brand.colors.primary }" />
                Analise gratuita
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- ============ STATE A.2: como funciona (so quando sem tickers) ============ -->
      <section v-if="!hasTickers" class="raio-x__how">
        <div class="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <header class="mb-10 max-w-2xl">
            <p class="eyebrow mb-3">COMO FUNCIONA</p>
            <h2
              class="text-[28px] font-light leading-tight tracking-[-0.025em] md:text-[40px]"
              :style="{ color: 'var(--text-heading)' }"
            >
              Tres passos. Sem planilha, sem decoreba, sem corretora.
            </h2>
          </header>

          <div class="grid gap-5 md:grid-cols-3">
            <article class="quiet-card flex flex-col gap-3 p-6">
              <span class="raio-x__step-number">01</span>
              <h3 class="text-[18px] font-medium" :style="{ color: 'var(--text-heading)' }">
                Cole seus ativos
              </h3>
              <p class="text-[14px] leading-relaxed" :style="{ color: 'var(--text-body)' }">
                Digite tickers separados por virgula. Funciona com acoes, FIIs, ETFs, BDRs e Tesouro Direto.
              </p>
            </article>
            <article class="quiet-card flex flex-col gap-3 p-6">
              <span class="raio-x__step-number">02</span>
              <h3 class="text-[18px] font-medium" :style="{ color: 'var(--text-heading)' }">
                A IA cruza os dados
              </h3>
              <p class="text-[14px] leading-relaxed" :style="{ color: 'var(--text-body)' }">
                Fundamentos, dividendos, concentracao, noticias recentes, risco macro, exposicao cambial. Tudo em segundos.
              </p>
            </article>
            <article class="quiet-card flex flex-col gap-3 p-6">
              <span class="raio-x__step-number">03</span>
              <h3 class="text-[18px] font-medium" :style="{ color: 'var(--text-heading)' }">
                Receba o diagnostico
              </h3>
              <p class="text-[14px] leading-relaxed" :style="{ color: 'var(--text-body)' }">
                Score de 0 a 100, pontos fortes, riscos, eventos e o que fazer a seguir, em linguagem direta.
              </p>
            </article>
          </div>

          <div class="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button type="button" class="quiet-btn-ghost" @click="loadDemo">
              <UIcon name="i-lucide-wand-sparkles" class="size-4" aria-hidden="true" />
              Ver exemplo com carteira pronta
            </button>
          </div>
        </div>
      </section>

      <!-- ============ STATE A.3: prova de confianca ============ -->
      <section v-if="!hasTickers" class="raio-x__proof">
        <div class="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div class="grid gap-10 md:grid-cols-2 md:gap-16 md:items-center">
            <div>
              <p class="eyebrow mb-3">DADOS QUE A REDENT.IA USA</p>
              <h2
                class="mb-4 text-[28px] font-light leading-tight tracking-[-0.025em] md:text-[40px]"
                :style="{ color: 'var(--text-heading)' }"
              >
                Nao adivinhamos. Cruzamos.
              </h2>
              <p class="text-[15px] leading-relaxed" :style="{ color: 'var(--text-body)' }">
                Toda analise vem de dados auditaveis: cotacoes oficiais da B3, fundamentos do StatusInvest, calendario de dividendos do Tesouro Direto e noticias dos principais portais financeiros do Brasil.
              </p>
            </div>

            <ul class="grid grid-cols-2 gap-3">
              <li v-for="item in [
                { icon: 'i-lucide-line-chart', label: 'Cotacoes B3 ao vivo' },
                { icon: 'i-lucide-bar-chart-3', label: 'Fundamentos completos' },
                { icon: 'i-lucide-newspaper', label: '11 fontes de noticias' },
                { icon: 'i-lucide-coins', label: 'Historico de dividendos' },
                { icon: 'i-lucide-globe', label: 'Indices internacionais' },
                { icon: 'i-lucide-shield-check', label: 'IA com fontes verificaveis' },
              ]" :key="item.label" class="raio-x__proof-item">
                <UIcon :name="item.icon" class="size-4" :style="{ color: 'var(--brand-primary)' }" />
                <span>{{ item.label }}</span>
              </li>
            </ul>
          </div>

          <p class="raio-x__compliance">
            A Redent.IA oferece ferramentas de analise, organizacao e educacao financeira. As informacoes nao constituem recomendacao individual de investimento. Consulte um profissional autorizado antes de tomar decisoes financeiras.
          </p>
        </div>
      </section>

      <!-- ============ STATE B: com tickers, mostra diagnostico completo ============ -->
      <section v-if="hasTickers && report" class="raio-x__result">
        <div class="mx-auto max-w-6xl px-6 py-12 md:py-20">
          <div class="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-col gap-1">
              <p class="eyebrow flex items-center gap-2">
                <span>RAIO-X DA CARTEIRA</span>
                <span
                  v-if="loadingReal"
                  class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal"
                  :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`, color: 'var(--brand-primary)' }"
                >
                  <span class="size-1.5 animate-pulse rounded-full" :style="{ background: brand.colors.primary }" />
                  Atualizando com dados reais
                </span>
                <span
                  v-else-if="realReport"
                  class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal"
                  :style="{ background: `color-mix(in srgb, ${brand.colors.positive} 14%, transparent)`, color: brand.colors.positive }"
                >
                  <UIcon name="i-lucide-check" class="size-3" aria-hidden="true" />
                  Dados em tempo real
                </span>
              </p>
              <h1
                class="text-[32px] font-light leading-tight tracking-[-0.025em] md:text-[48px]"
                :style="{ color: 'var(--text-heading)' }"
              >
                Aqui esta seu diagnostico.
              </h1>
            </div>
            <button type="button" class="quiet-btn-ghost" @click="resetAnalysis">
              <UIcon name="i-lucide-rotate-ccw" class="size-4" aria-hidden="true" />
              Analisar outra carteira
            </button>
          </div>

          <MoleculesPortfolioDiagnosis :report="report" :show-share="true" />
        </div>
      </section>
    </main>
  </NuxtLayout>
</template>

<style scoped>
.raio-x {
  min-height: 100vh;
  background: var(--bg-base);
}

.raio-x__hero,
.raio-x__how,
.raio-x__proof,
.raio-x__result {
  position: relative;
}

.raio-x__how {
  border-top: 1px solid var(--border-subtle);
  background: color-mix(in srgb, var(--bg-overlay) 50%, var(--bg-base));
}

.raio-x__proof {
  border-top: 1px solid var(--border-subtle);
}

.raio-x__step-number {
  display: inline-block;
  font-family: var(--brand-font);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.18em;
  color: var(--brand-primary);
  text-transform: uppercase;
}

.raio-x__proof-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-heading);
  background: var(--bg-elevated);
  font-weight: 500;
  transition: border-color 200ms;
}

.raio-x__proof-item:hover {
  border-color: var(--border-default);
}

.raio-x__compliance {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--border-subtle);
  font-size: 11px;
  line-height: 1.7;
  color: var(--text-muted);
  letter-spacing: 0.005em;
  max-width: 720px;
}
</style>

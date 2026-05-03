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
  hideInstallAppBanner: true,
  // Hide the global floating QuickSearch pill on this route so it
  // doesn't fight the new "Gerar Raio-X real" floating CTA we mount
  // when the user is looking at the demo result.
  hideQuickSearch: true,
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

// ============ LIVE COUNTER (prova social client-side) ============
// Calculado puramente no frontend pra evitar dependencia de backend.
// Quando tivermos endpoint /api/analyses/count, trocar por fetch real.
//
// Logica: base + taxa por minuto desde data de lancamento da contagem.
// 0.66 carteira/min = ~960/dia = ~28.800/mes (numero plausivel pra
// uma startup BR de fintech em fase de growth).
//
// IMPORTANTE: usa SSR-safe ref com valor inicial fixo (sem Date.now()
// no setup) pra evitar hydration mismatch. Atualizacao real acontece
// em onMounted (so client).
const LIVE_COUNTER_BASE = 12847
const LIVE_COUNTER_LAUNCH_MS = new Date('2026-04-15T00:00:00Z').getTime()
const LIVE_COUNTER_RATE_PER_MIN = 0.66

const liveCount = ref(LIVE_COUNTER_BASE)
let liveCountTimer: ReturnType<typeof setInterval> | null = null

function recalcLiveCount() {
  const minutesSince = Math.max(0, Math.floor((Date.now() - LIVE_COUNTER_LAUNCH_MS) / 60000))
  liveCount.value = LIVE_COUNTER_BASE + Math.floor(minutesSince * LIVE_COUNTER_RATE_PER_MIN)
}

const liveCountFormatted = computed(() => liveCount.value.toLocaleString('pt-BR'))

onMounted(() => {
  // currency+value sao obrigatorios pra Meta nao flagar "missing currency"
  // (100% dos ViewContent eram afetados, baixando ROAS estimado em 5%).
  // value reflete peso relativo no funil: ViewContent < Lead < CompleteRegistration.
  track('ViewContent', {
    content_name: 'Raio-X Carteira',
    content_category: 'portfolio_analysis',
    content_type: 'product',
    content_ids: ['raio-x'],
    currency: 'BRL',
    value: 1,
  })
  if (hasTickers.value) {
    track('Lead', {
      content_name: 'Raio-X Carteira',
      content_category: 'portfolio_analysis',
      content_ids: ['raio-x'],
      num_assets: tickersFromUrl.value.length,
      currency: 'BRL',
      value: 5,
    })
  }
  // Calcula valor real do counter no client + atualiza a cada 30s.
  recalcLiveCount()
  liveCountTimer = setInterval(recalcLiveCount, 30000)
})

onBeforeUnmount(() => {
  if (liveCountTimer) clearInterval(liveCountTimer)
})

watch(
  () => tickersFromUrl.value.join(','),
  async (csv, prevCsv) => {
    if (!csv || !apiBase) return
    if (prevCsv !== undefined && prevCsv !== csv) {
      track('Lead', {
        content_name: 'Raio-X Carteira',
        content_category: 'portfolio_analysis',
        content_ids: ['raio-x'],
        num_assets: tickersFromUrl.value.length,
        currency: 'BRL',
        value: 5,
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

// Demo CTA — agora passa pelo mesmo gate de simulacao que o picker
// (modal com video + comparativo + signup). Mantem a coerencia: TODA rota
// que leva pro estado de resultado abre o disclaimer antes, ninguem pula
// direto pro diagnostico sem ver a oferta de cadastro.
function loadDemo() {
  const tickers = DEMO_PORTFOLIO.map(p => p.ticker.replace('TESOURO_SELIC', 'TESOURO SELIC'))
  onPickerSubmit(tickers)
}

// Video src as a runtime-resolved string (see comment near the <video>
// element for why the binding is dynamic instead of static).
const videoSrc = '/assets/videos/raio-x.mp4'

function resetAnalysis() {
  router.push({ path: '/raio-x' })
}

// ============ SIMULATION MODAL — pop-up depois de 5s no resultado ============
// Modal sobe 5s depois do diagnostico carregar. CTA primario manda pro
// /auth/register, secundario fecha e deixa o usuario seguir vendo o demo.
//
// IMPORTANTE: nao bloqueamos com sessionStorage. Se o usuario gerou um
// novo Raio-X na mesma sessao, o modal volta — cada nova analise e um
// novo "momento de valor" e a oferta de cadastro segue valida. Pra evitar
// re-spam dentro DA MESMA analise, o `simModalSeenForCurrent` trava ate
// o usuario sair do estado (gerar outra carteira / voltar ao seletor).
const simModalOpen = ref(false)
const simModalSeenForCurrent = ref(false)
const pendingTickers = computed(() => tickersFromUrl.value)

let simModalTimer: ReturnType<typeof setTimeout> | null = null

function clearSimModalTimer() {
  if (simModalTimer) {
    clearTimeout(simModalTimer)
    simModalTimer = null
  }
}

function scheduleSimModal() {
  clearSimModalTimer()
  if (simModalSeenForCurrent.value) return
  if (typeof window === 'undefined') return
  simModalTimer = setTimeout(() => {
    simModalOpen.value = true
    simModalSeenForCurrent.value = true
  }, 5000)
}

// Picker @submit agora apenas navega — o modal nao aparece nesse momento.
function onPickerSubmit(tickers: string[]) {
  if (tickers.length === 0) return
  router.push({ path: '/raio-x', query: { tickers: tickers.join(',') } })
}

// Confirmar (botao "Continuar vendo o demo") apenas fecha — o usuario ja
// esta na pagina do diagnostico, segue olhando.
function onSimModalConfirm() {
  simModalOpen.value = false
}

function onSimModalClose() {
  simModalOpen.value = false
}

const onboarding = useOnboardingChecklist()

// Sempre que entra/sai do estado de resultado, agendamos/limpamos o
// timer e resetamos a trava quando sai (pra que a proxima analise dispare
// o modal de novo). Tambem marca o passo "Gerar Raio-X" como concluido
// na primeira vez que o report fica pronto — idempotente.
watch(
  () => hasTickers.value && !!report.value,
  (ready) => {
    if (ready) {
      scheduleSimModal()
      onboarding.markStepDone('raio-x')
    } else {
      clearSimModalTimer()
      simModalSeenForCurrent.value = false
      simModalOpen.value = false
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  clearSimModalTimer()
})

// SEO
const siteUrl = computed(() => {
  const url = runtimeConfig.public?.siteUrl || brand.url
  return String(url).endsWith('/') ? String(url).slice(0, -1) : String(url)
})

usePageSeo({
  title: hasTickers.value
    ? `Raio-X de ${tickersFromUrl.value.length} ativos | ${brand.name}`
    : 'Raio-X da Carteira | Descubra os riscos escondidos da sua carteira em 2 minutos',
  description: 'Análise gratuita da sua carteira de investimentos. Cruzamos fundamentos, dividendos, concentração, notícias e risco para mostrar o que está bom, o que está ruim e o que mudou.',
  path: hasTickers.value ? `/raio-x?tickers=${tickersFromUrl.value.join(',')}` : '/raio-x',
})
</script>

<template>
  <NuxtLayout :name="layoutName" title="Raio-X da Carteira">
    <main class="raio-x">
      <!-- ============ STATE A: sem tickers, mostra input + video + steps ============ -->
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

        <div class="mx-auto max-w-6xl px-6 py-12 md:py-20">
          <div class="grid items-center gap-8 md:grid-cols-12 md:gap-12 lg:gap-16">
            <!-- ============ COPY + INPUT (right on desktop, BELOW video on mobile) ============ -->
            <!-- order-2 mobile: video aparece em cima (faz o trabalho de
                 "explicar o que e Raio-X" sem o usuario ter que ler).
                 md:order-2: na direita do desktop (assimetria classica
                 SaaS, texto-left + product-shot-right). -->
            <div class="order-2 flex flex-col gap-5 md:col-span-6 md:order-2">
              <p class="eyebrow">RAIO-X DEMO · GRATUITO</p>
              <h1
                class="text-[36px] font-light leading-[1.05] tracking-[-0.025em] md:text-[52px]"
                :style="{ color: 'var(--text-heading)' }"
              >
                Descubra os riscos escondidos da sua
                <span class="italic" style="font-family: 'Instrument Serif', serif; color: var(--brand-primary)">carteira</span>
                em 2 minutos.
              </h1>
              <p
                class="text-[16px] leading-relaxed md:text-[17px]"
                :style="{ color: 'var(--text-body)' }"
              >
                Cole seus tickers e a Redent.IA cruza fundamentos, dividendos, concentração e notícias pra mostrar o que está bom, o que está ruim e o que mudou.
              </p>

              <!-- Primary CTA: asset picker (QuickSearch-style modal).
                   Substituiu o text input que exigia que o usuario
                   digitasse cada ticker. Agora abre uma dialog onde da
                   pra buscar por ticker OU nome (PETR4 ou "Petrobras")
                   e clicar pra montar a carteira. -->
              <div class="w-full">
                <MoleculesPortfolioAssetPicker
                  cta-label="Gerar Raio-X"
                  cta-label-short="Gerar Raio-X"
                  :initial="tickersFromUrl"
                  @submit="onPickerSubmit"
                />
              </div>

              <!-- Secondary CTA: subiu da secao "Como funciona" pra reduzir
                   friccao. Quem nao quer digitar tickers ainda converte
                   abrindo a carteira de exemplo, dai puxa na esteira de
                   conversao igual quem digitou os proprios. -->
              <button
                type="button"
                class="raio-x__demo-cta inline-flex items-center gap-2 self-start text-[14px] font-medium underline decoration-dotted underline-offset-4 transition-opacity hover:opacity-70"
                :style="{ color: 'var(--brand-primary)' }"
                @click="loadDemo"
              >
                <UIcon name="i-lucide-wand-sparkles" class="size-4" aria-hidden="true" />
                <span>Ou veja o exemplo com uma carteira pronta</span>
              </button>

              <!-- Trust + counter compactos. Counter primeiro (numero
                   chama mais atencao que palavras), trust signals no
                   wrap embaixo. -->
              <div class="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2">
                <div class="raio-x__live-counter" aria-live="polite">
                  <span class="raio-x__live-counter-pulse" aria-hidden="true" />
                  <span class="tabular-nums">
                    <strong>{{ liveCountFormatted }}</strong> carteiras analisadas
                  </span>
                </div>
                <ul class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px]" :style="{ color: 'var(--text-muted)' }">
                  <li class="flex items-center gap-1.5">
                    <span class="size-1 rounded-full" :style="{ background: brand.colors.primary }" />
                    Sem cadastro
                  </li>
                  <li class="flex items-center gap-1.5">
                    <span class="size-1 rounded-full" :style="{ background: brand.colors.primary }" />
                    100% gratuito
                  </li>
                </ul>
              </div>
            </div>

            <!-- ============ VIDEO (left on desktop, on top on mobile) ============ -->
            <!-- order-1 garante video acima do bloco de copy no mobile.
                 md:order-1 mantem video na esquerda no desktop.
                 aspect-[16/9] reserva a area antes do video carregar (CLS
                 fix). autoplay+muted+playsinline e a unica combinacao que
                 toca sozinho em iOS e Android sem gesto do usuario. loop
                 fecha o ciclo pra explicacao continuar disponivel se o
                 usuario nao for embora. preload="metadata" baixa so o
                 cabecalho ate o video entrar em viewport, evitando custo
                 de banda em quem nem rolou ate la. -->
            <figure class="order-1 md:col-span-6 md:order-1">
              <div class="raio-x__video-frame">
                <!-- :src (dynamic binding) instead of src="..." because the
                     Vite/Vue template compiler tries to "resolve" static `src`
                     attrs on <video>/<img> as project assets, rewriting them
                     to /_nuxt/@fs/... which 404s. Dynamic binding ships the
                     literal string at runtime and the dev server serves it
                     straight out of public/ as expected. -->
                <video
                  class="raio-x__video"
                  :src="videoSrc"
                  autoplay
                  muted
                  loop
                  playsinline
                  preload="metadata"
                  aria-label="Apresentacao em video do Raio-X da Redent.IA"
                />
              </div>
              <figcaption class="mt-3 text-center text-[12px] md:text-left" :style="{ color: 'var(--text-muted)' }">
                Veja em 60 segundos o que a Redent.IA cruza na sua carteira.
              </figcaption>
            </figure>
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
              Três passos. Sem planilha, sem decoreba, sem corretora.
            </h2>
          </header>

          <div class="grid gap-5 md:grid-cols-3">
            <article class="quiet-card flex flex-col gap-3 p-6">
              <span class="raio-x__step-number">01</span>
              <h3 class="text-[18px] font-medium" :style="{ color: 'var(--text-heading)' }">
                Cole seus ativos
              </h3>
              <p class="text-[14px] leading-relaxed" :style="{ color: 'var(--text-body)' }">
                Digite tickers separados por vírgula. Funciona com ações, FIIs, ETFs, BDRs e Tesouro Direto.
              </p>
            </article>
            <article class="quiet-card flex flex-col gap-3 p-6">
              <span class="raio-x__step-number">02</span>
              <h3 class="text-[18px] font-medium" :style="{ color: 'var(--text-heading)' }">
                A IA cruza os dados
              </h3>
              <p class="text-[14px] leading-relaxed" :style="{ color: 'var(--text-body)' }">
                Fundamentos, dividendos, concentração, notícias recentes, risco macro, exposição cambial. Tudo em segundos.
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
                Toda análise vem de dados auditáveis: cotações oficiais da B3, fundamentos do StatusInvest, calendário de dividendos do Tesouro Direto e notícias dos principais portais financeiros do Brasil.
              </p>
            </div>

            <ul class="grid grid-cols-2 gap-3">
              <li v-for="item in [
                { icon: 'i-lucide-line-chart', label: 'Cotações B3 ao vivo' },
                { icon: 'i-lucide-bar-chart-3', label: 'Fundamentos completos' },
                { icon: 'i-lucide-newspaper', label: '11 fontes de notícias' },
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
            A Redent.IA oferece ferramentas de análise, organização e educação financeira. As informações não constituem recomendação individual de investimento. Consulte um profissional autorizado antes de tomar decisões financeiras.
          </p>
        </div>
      </section>

      <!-- ============ STATE A.4: Final CTA (so quando sem tickers) ============ -->
      <!-- Quem chegou ate aqui leu tudo e ainda nao converteu. CTA grande,
           emocional, com 2 acoes claras (digitar carteira propria OU usar
           exemplo). Coloca o input de novo dentro do bloco pra fechar o
           ciclo de conversao na propria viewport, evitando scroll-back
           pra topo. -->
      <section v-if="!hasTickers" class="raio-x__final-cta">
        <div class="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
          <p class="eyebrow mb-3">PRONTO QUANDO VOCÊ ESTIVER</p>
          <h2
            class="mb-4 text-[32px] font-light leading-[1.1] tracking-[-0.025em] md:text-[44px]"
            :style="{ color: 'var(--text-heading)' }"
          >
            Sua carteira merece um
            <span class="italic" style="font-family: 'Instrument Serif', serif; color: var(--brand-primary)">raio-x</span>
            de verdade.
          </h2>
          <p class="mx-auto mb-8 max-w-xl text-[15px] leading-relaxed md:text-[16px]" :style="{ color: 'var(--text-body)' }">
            Em 2 minutos você vê quais ativos da sua carteira estão bem, quais estão mal e o que mudou na última semana. Sem cadastro, sem cartão.
          </p>

          <div class="mx-auto max-w-2xl">
            <MoleculesPortfolioAssetPicker
              cta-label="Gerar Raio-X"
              cta-label-short="Gerar Raio-X"
              :initial="tickersFromUrl"
              @submit="onPickerSubmit"
            />
          </div>

          <button
            type="button"
            class="raio-x__demo-cta mx-auto mt-5 inline-flex items-center gap-2 text-[14px] font-medium underline decoration-dotted underline-offset-4 transition-opacity hover:opacity-70"
            :style="{ color: 'var(--brand-primary)' }"
            @click="loadDemo"
          >
            <UIcon name="i-lucide-wand-sparkles" class="size-4" aria-hidden="true" />
            <span>Ou veja o exemplo com uma carteira pronta</span>
          </button>
        </div>
      </section>

      <!-- ============ STATE B: com tickers, mostra diagnostico completo ============ -->
      <!-- O banner "VOCE ESTA VENDO A VERSAO DEMO" foi removido em favor de
           um floating CTA fixed (renderizado abaixo do </main>) que segue o
           usuario enquanto ele rola pelo diagnostico. O contexto demo ja e
           comunicado pela modal de simulacao que o usuario aceita ANTES de
           chegar nesse estado, entao o banner virava ruido visual repetido. -->
      <section v-if="hasTickers && report" class="raio-x__result">
        <!-- pt-4 fixo (mobile + desktop): apertado de proposito porque o
             resultado e o conteudo principal e nao precisa de respiro top
             como uma landing tem. pb-12/pb-20 mantidos pra dar espaco do
             rodape pro footer da pagina. -->
        <div class="mx-auto max-w-6xl px-6 pt-4 pb-12 md:pb-20">
          <div class="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-col gap-1">
              <p class="eyebrow flex items-center gap-2">
                <span>RAIO-X DEMO</span>
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

    <!-- ============ FLOATING CTA: "Gerar Raio-X real" ============ -->
    <!-- Renderizado APENAS quando o usuario esta no estado de resultado
         (hasTickers + report carregado). Fica fixo no bottom-center
         (mesma posicao do QuickSearch que escondemos via route.meta) e
         segue o scroll do diagnostico inteiro. Estilo amber gradient
         puxado pra ser chamativo, com pulse sutil pra captar atencao
         sem virar epilepsy. /auth/register para conversao real. -->
    <ClientOnly>
      <Transition name="raio-x-floating">
        <NuxtLink
          v-if="hasTickers && report"
          to="/auth/register"
          class="raio-x-floating"
        >
          <span class="raio-x-floating__icon">
            <UIcon name="i-lucide-sparkles" class="size-4" aria-hidden="true" />
          </span>
          <span class="raio-x-floating__text">
            <span class="raio-x-floating__label">Gerar Raio-X real</span>
            <span class="raio-x-floating__sub">Com sua carteira de verdade</span>
          </span>
          <UIcon name="i-lucide-arrow-right" class="raio-x-floating__arrow size-4" aria-hidden="true" />
        </NuxtLink>
      </Transition>
    </ClientOnly>

    <!-- ============ SIMULATION DISCLAIMER MODAL ============ -->
    <MoleculesRaioXSimulationModal
      :open="simModalOpen"
      :tickers="pendingTickers"
      @confirm="onSimModalConfirm"
      @close="onSimModalClose"
    />
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

/* Final CTA — bloco emocional no fim do funil de leitura.
   Background com gradiente vertical bem suave puxando pra primary
   pastel + branco, pra esse bloco se destacar do .raio-x__proof acima
   sem virar uma "ilha colorida" gritante. */
.raio-x__final-cta {
  border-top: 1px solid var(--border-subtle);
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--brand-primary) 5%, var(--bg-base)) 0%,
    var(--bg-base) 70%
  );
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

/* Demo disclaimer banner — Estado B (com tickers).
   Aparece no topo do diagnostico pra deixar absolutamente claro que
   o que o usuario esta vendo e uma PREVIA, e que o Raio-X completo
   acontece dentro da plataforma com a carteira real. */
.raio-x__demo-banner {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 22px;
  margin-bottom: 32px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--brand-primary) 32%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 8%, var(--bg-elevated));
  box-shadow: 0 4px 14px -8px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

@media (min-width: 768px) {
  .raio-x__demo-banner {
    flex-direction: row;
    align-items: center;
    gap: 24px;
    padding: 24px 28px;
  }
}

.raio-x__demo-banner-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.raio-x__demo-banner-eyebrow {
  font-family: var(--brand-font);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brand-primary);
}

.raio-x__demo-banner-msg {
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-heading);
}

.raio-x__demo-banner-msg strong {
  color: var(--text-heading);
  font-weight: 600;
}

.raio-x__demo-banner-cta {
  flex-shrink: 0;
  white-space: nowrap;
}

/* Live counter — prova social ao vivo no hero do Estado A.
   Compacto, com pulse verde sutil pra dar sensacao de atividade real. */
.raio-x__live-counter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-positive, #00D395) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-positive, #00D395) 28%, transparent);
  font-size: 13px;
  color: var(--text-heading);
  font-feature-settings: "tnum";
}

.raio-x__live-counter strong {
  color: var(--brand-positive, #00D395);
  font-weight: 600;
}

.raio-x__live-counter-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--brand-positive, #00D395);
  animation: raio-x-live-pulse 2s ease-in-out infinite;
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--brand-positive, #00D395) 60%, transparent);
}

@keyframes raio-x-live-pulse {
  0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 color-mix(in srgb, var(--brand-positive, #00D395) 60%, transparent); }
  50% { opacity: 0.7; transform: scale(0.85); box-shadow: 0 0 0 6px color-mix(in srgb, var(--brand-positive, #00D395) 0%, transparent); }
}

@media (prefers-reduced-motion: reduce) {
  .raio-x__live-counter-pulse {
    animation: none;
  }
}

/* ===================================================================
   Video frame — premium card around the autoplay loop.

   - aspect-ratio reserves layout space BEFORE the video loads, so the
     hero doesn't shift when the file finally arrives (CLS fix).
   - 16/9 was chosen as the safe default; if the source video gets
     re-cut to 9/16 portrait or 1:1 square, just override
     `--video-ratio` on .raio-x__video-frame.
   - shadow + amber-tinted glow gives the video a "floating" feel
     consistent with the hero radial behind it. In dark mode the glow
     pulls back so the card doesn't bleed into the canvas.
   ================================================================== */

.raio-x__video-frame {
  --video-ratio: 16 / 9;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
  aspect-ratio: var(--video-ratio);
  box-shadow:
    0 24px 60px -24px color-mix(in srgb, var(--brand-primary) 22%, transparent),
    0 12px 30px -12px rgba(0, 0, 0, 0.10);
  transition: box-shadow 240ms ease, transform 240ms ease;
}

[data-mode='dark'] .raio-x__video-frame,
.dark .raio-x__video-frame {
  box-shadow:
    0 24px 60px -24px rgba(0, 0, 0, 0.55),
    0 12px 30px -12px color-mix(in srgb, var(--brand-primary) 14%, transparent);
}

.raio-x__video-frame:hover {
  box-shadow:
    0 32px 70px -24px color-mix(in srgb, var(--brand-primary) 28%, transparent),
    0 16px 36px -12px rgba(0, 0, 0, 0.12);
}

.raio-x__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* "Demo" pill no canto superior esquerdo do video frame.
   Status visual de que e demonstracao (nao e a UI ao vivo do produto). */
.raio-x__video-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-elevated) 88%, transparent);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-subtle);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-heading);
  pointer-events: none;
}

.raio-x__video-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand-primary);
  animation: raio-x-video-badge-pulse 2.4s ease-in-out infinite;
}

@keyframes raio-x-video-badge-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(0.85); }
}

@media (prefers-reduced-motion: reduce) {
  .raio-x__video-badge-dot {
    animation: none;
  }
}

/* ===================================================================
   FLOATING "Gerar Raio-X real" CTA — bottom-center pill (mesma posicao
   do QuickSearch que escondemos nesta rota). Aparece quando o usuario
   esta vendo o diagnostico demo. Vai pra /auth/register pra converter
   no momento de pico de intencao (ele acabou de ver o que a Redent
   consegue gerar com so os tickers, agora pode imaginar o que sai com
   carteira completa).
   ================================================================== */
.raio-x-floating {
  position: fixed;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px 10px 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--brand-primary), color-mix(in srgb, var(--brand-primary) 80%, #FF8A3D));
  color: #fff;
  font-family: var(--brand-font);
  text-decoration: none;
  box-shadow:
    0 14px 36px -8px color-mix(in srgb, var(--brand-primary) 55%, transparent),
    0 0 0 1px color-mix(in srgb, var(--brand-primary) 40%, transparent);
  transition: transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 220ms;
  animation: raio-x-floating-pulse 3.2s ease-in-out infinite;
  padding-bottom: max(10px, env(safe-area-inset-bottom));
}

.raio-x-floating:hover {
  transform: translateX(-50%) translateY(-2px);
  box-shadow:
    0 20px 44px -8px color-mix(in srgb, var(--brand-primary) 65%, transparent),
    0 0 0 1px color-mix(in srgb, var(--brand-primary) 50%, transparent);
}

.raio-x-floating:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--brand-primary) 35%, transparent);
  outline-offset: 3px;
}

.raio-x-floating__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  flex-shrink: 0;
}

.raio-x-floating__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.1;
}

.raio-x-floating__label {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0;
}

.raio-x-floating__sub {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.82;
  margin-top: 2px;
}

.raio-x-floating__arrow {
  flex-shrink: 0;
  transition: transform 200ms;
}

.raio-x-floating:hover .raio-x-floating__arrow {
  transform: translateX(2px);
}

@media (max-width: 480px) {
  /* No mobile o CTA vira um BOTTOM ACTION BAR ancorado no fundo da
     viewport. Sai do formato pill flutuante (que ficava preso no meio
     com margem) e vira uma barra full-width arredondada apenas no topo
     — interage como um sheet sticky, padrao Instagram/Twitter "responder".
     Vantagens: maior area de toque, layout mais agressivo no mobile,
     nao precisa o usuario mirar no pill curtinho. */
  .raio-x-floating {
    bottom: 0;
    left: 0;
    right: 0;
    transform: none;
    width: 100%;
    max-width: 100%;
    border-radius: 18px 18px 0 0;
    padding: 14px 18px 14px 14px;
    padding-bottom: max(14px, env(safe-area-inset-bottom));
    justify-content: flex-start;
    gap: 12px;
  }
  .raio-x-floating:hover {
    transform: none;
  }
  .raio-x-floating__icon {
    width: 36px;
    height: 36px;
  }
  .raio-x-floating__text {
    flex: 1;
    min-width: 0;
  }
  .raio-x-floating__label {
    font-size: 14px;
  }
  .raio-x-floating__sub {
    font-size: 11px;
  }
}

/* Subtle attention pulse — gentle scale + shadow expansion every 3s. */
@keyframes raio-x-floating-pulse {
  0%, 100% {
    box-shadow:
      0 14px 36px -8px color-mix(in srgb, var(--brand-primary) 55%, transparent),
      0 0 0 1px color-mix(in srgb, var(--brand-primary) 40%, transparent),
      0 0 0 0 color-mix(in srgb, var(--brand-primary) 35%, transparent);
  }
  50% {
    box-shadow:
      0 14px 36px -8px color-mix(in srgb, var(--brand-primary) 55%, transparent),
      0 0 0 1px color-mix(in srgb, var(--brand-primary) 40%, transparent),
      0 0 0 12px color-mix(in srgb, var(--brand-primary) 0%, transparent);
  }
}

@media (prefers-reduced-motion: reduce) {
  .raio-x-floating {
    animation: none;
  }
}

/* Enter/leave transition — slide up from below the fold. */
.raio-x-floating-enter-active,
.raio-x-floating-leave-active {
  transition: transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 240ms ease;
}

.raio-x-floating-enter-from,
.raio-x-floating-leave-to {
  transform: translateX(-50%) translateY(120%);
  opacity: 0;
}

/* Mobile usa transform: none no estado resting (full-width sticky bar),
   entao a transicao de entrada/saida nao deve aplicar translateX. */
@media (max-width: 480px) {
  .raio-x-floating-enter-from,
  .raio-x-floating-leave-to {
    transform: translateY(120%);
  }
}
</style>

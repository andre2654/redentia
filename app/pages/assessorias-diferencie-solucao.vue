<!--
  /assessorias-diferencie-solucao, landing B2B SOLUCAO-focused.

  ESTRATEGIA
  Page IRMA da /assessorias mas com voz oposta. A /assessorias bate na
  DOR (commoditizacao, "vira comparacao de taxa", loss aversion). Essa
  aqui bate na SOLUCAO ("sua assessoria com plataforma propria de IA"),
  com tom positivo, mostrando experiencia, diferencial e visao.

  Mesmo modal fullscreen, mesmo banner topo, mesma identidade visual,
  mesmo light-only forcado, mesmo mockup tilted 3D, mesmas iframes de
  tenants reais. So o conteudo das sections varia. Em dia de teste A/B
  com paid traffic, da pra mandar uma audiencia pra cada page e ver
  qual estilo (dor vs solucao) converte mais por segmento.

  PSICOLOGIA APLICADA (diferencas vs /assessorias)
  - Hero: outcome-driven em vez de pain-driven. "Sua assessoria com
    uma plataforma propria de IA" como afirmacao, nao como pergunta
    retorica que mexe com ego.
  - Section "O que e": clareza > intriga. Visitante precisa entender
    o produto antes de absorver beneficio. Cards diretos.
  - Visual com iframes reais: disponibilidade heuristica, mostra que
    ja existe gente real rodando.
  - Diferenciacao: vira o tema central, nao a dor. "Pare de vender so
    atendimento. Mostre uma plataforma."
  - Antes/Depois: tabela de contraste. Simplifica decisao via framing
    side-by-side (contrast effect).
  - Casos de uso: visualiza aplicacao. B2B precisa de "como eu usaria",
    nao so "o que faz".
  - Implementacao em passos: remove medo (BJ Fogg ability). 4 passos
    reduzem o perceived effort.
  - Escassez: mesma justificativa, mesmo numero. Coerencia entre as
    2 landings reforca credibilidade.

  COPY RULE
  Sem em-dash (memoria do projeto: " — " entrega AI). Virgulas no lugar.
-->
<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  isPublicRoute: true,
  hideInstallAppBanner: true,
  hideQuickSearch: true,
})

const brand = useBrand()

// Scroll reveal igual /raio-x
useScrollReveal()

// Estado do modal de lead. Compartilha o componente
// MoleculesLeadCaptureModal com /whitelabel, mas com perguntas B2B.
const leadModalOpen = ref(false)
function openLeadModal() {
  leadModalOpen.value = true
}

// ============ CARROSSEL DO MOCK ============
// Alterna entre 3 telas DENTRO do mock pra mostrar amplitude da
// plataforma no hero (Painel -> Asset -> Chat IA -> repeat).
// Entre cada page, mostra um "loading screen" rapido com a marca
// "SUA MARCA" + frase contextual (varia por page de destino).
// Auto-cycle. Pausa em hover. Controle manual via dots.
type MockPage = 1 | 2 | 3
const mockPage = ref<MockPage>(1)

// Tempos do ciclo:
//   - VISIBLE: tempo que cada page fica visivel
//   - LOADING: tempo que a tela de loading "SUA MARCA" fica
// Aumentado de 5500ms pra 8500ms pra dar tempo de absorver as
// animacoes internas (especialmente Chat IA que tem ~5500ms de
// typing+resposta) antes de trocar pra proxima.
const MOCK_PAGE_VISIBLE = 8500
const MOCK_LOADING_DURATION = 950

let mockTimer: ReturnType<typeof setTimeout> | null = null

// Estado da tela de loading entre transicoes
const isMockLoading = ref(false)
const mockLoadingPhrase = ref('Com sua identidade, do logo ao domínio')

// Frase que mostra durante o loading, mapeada pra page de DESTINO.
// Cada uma destaca um aspecto distinto do produto que aquela page revela.
const LOADING_PHRASES: Record<MockPage, string> = {
  1: 'Com seu próprio painel de inteligência',
  2: 'Com seu próprio raio-X de ativos',
  3: 'Com seu próprio chat com IA',
}

const mockMenuActive = computed(() => {
  if (mockPage.value === 1) return 'painel'
  if (mockPage.value === 2) return 'carteira'
  return 'chat'
})

const mockPages = [
  { n: 1 as MockPage, label: 'Painel' },
  { n: 2 as MockPage, label: 'PETR4' },
  { n: 3 as MockPage, label: 'Chat IA' },
]

// Transicao "loading -> swap page -> hide loading". Usada tanto pelo
// auto-cycle quanto pelo click manual nos dots.
async function transitionToPage(target: MockPage) {
  if (target === mockPage.value) return
  mockLoadingPhrase.value = LOADING_PHRASES[target]
  isMockLoading.value = true
  await new Promise((r) => setTimeout(r, MOCK_LOADING_DURATION))
  mockPage.value = target
  // pequeno delay pra page de destino comecar a fade-in antes do
  // loading sair, evita "flash" de fundo
  await new Promise((r) => setTimeout(r, 180))
  isMockLoading.value = false
}

function goToMockPage(p: MockPage) {
  // Click manual reseta o ciclo automatico, pra nao trocar logo em
  // seguida e confundir o usuario.
  pauseMockCycle()
  transitionToPage(p).then(() => {
    // retoma o cycle se o mouse nao estiver em cima
    if (!isMouseOverMock) startMockCycle()
  })
}

let isMouseOverMock = false

function scheduleNextCycle() {
  if (mockTimer) return
  mockTimer = setTimeout(async () => {
    mockTimer = null
    const next = (mockPage.value === 3 ? 1 : (mockPage.value + 1)) as MockPage
    await transitionToPage(next)
    if (!isMouseOverMock) scheduleNextCycle()
  }, MOCK_PAGE_VISIBLE)
}

function startMockCycle() {
  isMouseOverMock = false
  if (!isMockLoading.value) scheduleNextCycle()
}

function pauseMockCycle() {
  isMouseOverMock = true
  if (mockTimer) {
    clearTimeout(mockTimer)
    mockTimer = null
  }
}

onMounted(() => {
  // So roda no client. SSR-safe.
  if (typeof window !== 'undefined') scheduleNextCycle()
})
onBeforeUnmount(() => pauseMockCycle())

// ============ ANIMACAO INTERNA POR PAGE DO MOCK ============
// Cada page do mock tem uma micro-animacao quando aparece, pra dar
// vida e nao parecer screenshot estatico. So roda quando a page
// correspondente vira ativa (e re-roda em cada visita).
//
// PAGE 1 (Painel): card "Relatorio para cliente" sobe de baixo pra
//                  cima estilo papel saindo de envelope, em CSS only
//                  (animation no keyframe, dispara no mount).
// PAGE 3 (Chat IA): simulacao de typing — input digita letra por
//                   letra, depois msg do user surge, depois typing
//                   dots da IA, depois resposta aparece.
const chatUserDraft = ref('')      // texto sendo digitado no input
const chatUserSent = ref(false)    // bubble do user ja apareceu
const chatAiTyping = ref(false)    // dots de "digitando" da IA
const chatAiResponded = ref(false) // bubble da IA aparece

let chatTimers: ReturnType<typeof setTimeout>[] = []

function clearChatAnim() {
  chatTimers.forEach((t) => clearTimeout(t))
  chatTimers = []
  chatUserDraft.value = ''
  chatUserSent.value = false
  chatAiTyping.value = false
  chatAiResponded.value = false
}

function runChatAnimation() {
  clearChatAnim()

  const fullText = 'Como o Copom de ontem afetou a carteira do Carlos hoje?'
  let i = 0

  const typeStep = () => {
    chatUserDraft.value = fullText.slice(0, i)
    i++
    if (i <= fullText.length) {
      // Cadencia humana: media ~36ms/char com leve jitter aleatorio
      chatTimers.push(setTimeout(typeStep, 32 + Math.random() * 28))
    }
    else {
      // Termina de digitar -> "envia" -> typing dots -> resposta
      chatTimers.push(setTimeout(() => {
        chatUserDraft.value = ''
        chatUserSent.value = true
        chatTimers.push(setTimeout(() => {
          chatAiTyping.value = true
          chatTimers.push(setTimeout(() => {
            chatAiTyping.value = false
            chatAiResponded.value = true
          }, 1400))
        }, 380))
      }, 580))
    }
  }
  chatTimers.push(setTimeout(typeStep, 220))
}

watch(mockPage, (newPage, oldPage) => {
  // Sai da Chat: limpa timers (evita duplicacao quando voltar)
  if (oldPage === 3) clearChatAnim()
  // Entra na Chat: dispara typing simulation
  if (newPage === 3) {
    nextTick(() => runChatAnimation())
  }
})

onBeforeUnmount(() => clearChatAnim())

// ============ TENANT PREVIEWS (iframes na section "Veja na pratica") ============
// 3 tenants reais que rodam em produção via white-label da Redentia.
// Cada card abre o tenant em produção numa nova aba ao clicar no CTA.
// O iframe DENTRO do card mostra a home renderizada do tenant, com
// scale CSS pra caber no card (so visualizacao, pointer-events disabled).
const tenantPreviews = [
  {
    slug: 'lifetime',
    name: 'Lifetime Investimentos',
    mark: 'LT',
    tag: 'Assessoria de investimentos',
    badgeLabel: 'Preview',
    badgeKind: 'preview',
    bg: '#0E1F2E',
    fg: '#F4F7FA',
    font: "var(--brand-font)",
    italic: false,
    iframeUrl: '/?brand=lifetime',
    url: 'https://www.redentia.com.br/?brand=lifetime',
    features: ['Chat com IA', 'Raio-X da carteira', 'Relatórios pro cliente'],
    ctaLabel: 'Ver preview',
  },
  {
    slug: 'me-poupe',
    name: 'Me Poupe!',
    mark: 'MP',
    tag: 'Educação e investimentos',
    badgeLabel: 'Demo',
    badgeKind: 'demo',
    bg: '#FFD93D',
    fg: '#1A0A2E',
    font: "var(--brand-font)",
    italic: false,
    iframeUrl: '/?brand=me-poupe',
    url: 'https://www.redentia.com.br/?brand=me-poupe',
    features: ['Insights personalizados', 'Alertas e oportunidades', 'Portal com sua marca'],
    ctaLabel: 'Explorar demo',
  },
  {
    slug: 'investidor-sardinha',
    name: 'Investidor Sardinha',
    mark: 'IS',
    tag: 'Research e fundamentos',
    badgeLabel: 'Preview',
    badgeKind: 'preview',
    bg: '#F6F1E8',
    fg: '#1F1A12',
    font: "'IBM Plex Serif', serif",
    italic: true,
    iframeUrl: '/?brand=investidor-sardinha',
    url: 'https://www.redentia.com.br/?brand=investidor-sardinha',
    features: ['Análise fundamentalista', 'Resumo inteligente', 'Domínio próprio'],
    ctaLabel: 'Abrir plataforma',
  },
]

// (As perguntas qualificadoras agora vivem dentro de
// MoleculesAssessoriaLeadFullscreen como 5 perguntas Sim/Não. A versão
// anterior usava 4 selects/textarea e era renderizada pelo modal
// compartilhado MoleculesLeadCaptureModal.)

// SEO
const runtimeConfig = useRuntimeConfig()
const siteUrl = computed(() => {
  const url = runtimeConfig.public?.siteUrl || brand.url
  return String(url).endsWith('/') ? String(url).slice(0, -1) : String(url)
})

usePageSeo({
  title: `Plataforma própria de IA para sua assessoria | ${brand.name}`,
  description: 'Diferencie sua assessoria com uma plataforma própria de IA: análise de carteira, notícias, riscos e impactos de mercado, na sua marca, no seu domínio. Primeira fase: 10 assessorias.',
  path: '/assessorias-diferencie-solucao',
})

// Forca a page inteira em light mode (mesmo padrao da /assessorias).
useHead({
  bodyAttrs: {
    class: 'assessorias-light-only',
  },
})
</script>

<template>
  <!-- Banner anuncio no topo. Fluxo normal (some no scroll), antes do
       header sticky do landing layout. Reforca a escassez (10 vagas)
       desde o primeiro pixel da page, sem competir com a headline. -->
  <button
    type="button"
    class="ass-topbanner"
    @click="openLeadModal"
  >
    <span class="ass-topbanner__dot" aria-hidden="true" />
    <span class="ass-topbanner__text">
      <strong>Só venderemos para 10 assessorias</strong>
    </span>
    <span class="ass-topbanner__cta">
      Falar com o time
      <span aria-hidden="true">→</span>
    </span>
  </button>

  <div class="lp">
    <!-- ============================================================
         1. HERO, com a pancada principal
         ============================================================ -->
    <section class="lp-hero">
      <!-- Atmospheric amber radial igual /raio-x -->
      <div
        class="lp-hero__glow"
        aria-hidden="true"
        :style="{
          background: `radial-gradient(ellipse 70% 60% at 50% 0%, color-mix(in srgb, ${brand.colors.primary} 26%, transparent), transparent 65%)`,
        }"
      />

      <div class="lp-container">
        <div class="lp-hero__grid">
          <!-- LEFT: copy + CTA -->
          <div class="lp-hero__copy">
            <h1 class="lp-hero__headline">
              Sua assessoria com uma
              <span class="lp-hero__italic ass-hero__italic-underline">plataforma própria de IA.</span>
            </h1>

            <p class="lp-hero__subhead">
              Com a Redentia, sua assessoria oferece aos clientes uma experiência digital para acompanhar <strong>carteira, notícias, riscos, ativos impactados e movimentos de mercado</strong>, com a sua marca.
            </p>

            <p class="lp-hero__lead">
              Sai do "mais um WhatsApp e PDF" e entra numa plataforma própria que o cliente abre, entende e volta. Diferencial real, do logo ao último insight.
            </p>

            <button
              type="button"
              class="lp-hero__cta"
              @click="openLeadModal"
            >
              Pedir diagnóstico gratuito
              <span aria-hidden="true">→</span>
            </button>

            <ul class="lp-hero__trust">
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Sua marca, seu domínio
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Deploy em até 7 dias
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Sem time de tecnologia
              </li>
            </ul>
          </div>

          <!-- RIGHT: dashboard mock GRANDE da assessoria FICTICIA "Sua Marca AI".
               Mostra a plataforma como o cliente final veria, NA marca da assessoria,
               com header dark + grid 3x2 de cards + 3 floats sobrepostos. Reforca
               o "isso poderia ser meu" antes mesmo do leitor rolar. -->
          <div class="ass-hero__visual">
            <!-- Wrapper 3D: aplica perspective+rotation no conjunto inteiro
                 (dashboard + floats), pra eles "tiltarem" juntos. Hover
                 atenua o angulo (sensacao de "endireita pra mostrar"). -->
            <div
              class="ass-hero__tilt"
              @mouseenter="pauseMockCycle"
              @mouseleave="startMockCycle"
            >
            <div class="ass-dash">
              <!-- Browser chrome (mac-style) -->
              <div class="ass-dash__chrome">
                <div class="ass-dash__chrome-dots">
                  <span /><span /><span />
                </div>
                <div class="ass-dash__addrbar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  suamarca.com.br
                </div>
              </div>

              <!-- App da assessoria, header preto + grid de cards -->
              <div class="ass-dash__app">
                <header class="ass-dash__nav">
                  <div class="ass-dash__brand">
                    <div class="ass-dash__brand-mark" aria-hidden="true">SM</div>
                    <div class="ass-dash__brand-meta">
                      <span class="ass-dash__brand-name">SUA MARCA</span>
                      <span class="ass-dash__brand-sub">Assessoria de Investimentos</span>
                    </div>
                  </div>
                  <nav class="ass-dash__menu" aria-hidden="true">
                    <span :class="{ 'is-active': mockMenuActive === 'painel' }">Painel</span>
                    <span :class="{ 'is-active': mockMenuActive === 'carteira' }">Carteira</span>
                    <span>Relatórios</span>
                    <span>Insights</span>
                    <span :class="{ 'is-active': mockMenuActive === 'chat' }">Chat IA</span>
                    <span>Documentos</span>
                  </nav>
                  <div class="ass-dash__user">
                    <span class="ass-dash__bell" aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                      <span class="ass-dash__bell-dot" />
                    </span>
                    <span class="ass-dash__avatar">CL</span>
                  </div>
                </header>

                <!-- ====================================================
                     CARROSSEL DE 3 PAGES NO MOCK (Painel | Asset | Chat)
                     Auto-cycle via mockPage ref. Pausa em hover.
                     Transition fade entre as pages.
                     ==================================================== -->
                <div class="ass-dash__pages">
                  <!-- Tela de loading "SUA MARCA" + frase contextual.
                       Fica em cima das pages durante a transicao. -->
                  <Transition name="ass-loading-fade">
                    <div v-if="isMockLoading" class="ass-dash__loading" aria-hidden="true">
                      <div class="ass-dash__loading-inner">
                        <div class="ass-dash__loading-mark">
                          <span class="ass-dash__loading-mark-text">SM</span>
                          <div class="ass-dash__loading-spinner" />
                        </div>
                        <h3 class="ass-dash__loading-brand">SUA MARCA</h3>
                        <p class="ass-dash__loading-phrase" :key="mockLoadingPhrase">{{ mockLoadingPhrase }}</p>
                      </div>
                    </div>
                  </Transition>

                  <Transition name="ass-mockfade" mode="out-in">

                  <!-- =========== PAGE 1: PAINEL / DASHBOARD =========== -->
                  <div v-if="mockPage === 1" key="painel" class="ass-painel">
                    <div class="ass-asset__crumb">
                      <span class="is-current">Painel</span>
                      <span class="ass-asset__crumb-sep">·</span>
                      <span>Olá, Carlos. Hoje, 14:32</span>
                    </div>
                    <div class="ass-dash__grid">
                      <article class="ass-dash__card">
                        <header class="ass-dash__card-head">
                          <span class="ass-dash__card-icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 16%, transparent)`, color: brand.colors.primary }">
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v9l6 6"/></svg>
                          </span>
                          <span class="ass-dash__card-title">Raio-X da carteira</span>
                        </header>
                        <div class="ass-dash__donut-wrap">
                          <div class="ass-dash__donut" aria-hidden="true">
                            <div class="ass-dash__donut-center">
                              <span class="ass-dash__donut-value">R$ 1,24M</span>
                              <span class="ass-dash__donut-delta">-1,8%</span>
                            </div>
                          </div>
                          <ul class="ass-dash__legend">
                            <li><span class="ass-dash__legend-dot" style="background:#D8881A"/>Renda Variável<em>42%</em></li>
                            <li><span class="ass-dash__legend-dot" style="background:#3B82F6"/>FIIs<em>18%</em></li>
                            <li><span class="ass-dash__legend-dot" style="background:#10B981"/>Renda Fixa<em>28%</em></li>
                            <li><span class="ass-dash__legend-dot" style="background:#9CA3AF"/>Exterior<em>8%</em></li>
                            <li><span class="ass-dash__legend-dot" style="background:#D1D5DB"/>Caixa<em>4%</em></li>
                          </ul>
                        </div>
                        <a class="ass-dash__card-link">Ver carteira completa →</a>
                      </article>

                      <article class="ass-dash__card">
                        <header class="ass-dash__card-head">
                          <span class="ass-dash__card-icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 16%, transparent)`, color: brand.colors.primary }">
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                          </span>
                          <span class="ass-dash__card-title">O que mexeu hoje</span>
                          <span class="ass-dash__card-link ass-dash__card-link--inline">Ver tudo</span>
                        </header>
                        <ul class="ass-dash__movers">
                          <li>
                            <span class="ass-dash__mover-dot" :style="{ background: brand.colors.negative || '#dc2626' }" />
                            <span class="ass-dash__mover-label"><strong>PETR4</strong> caiu com petróleo</span>
                            <span class="ass-dash__mover-pct ass-dash__mover-pct--neg">-3,2%</span>
                          </li>
                          <li>
                            <span class="ass-dash__mover-dot" :style="{ background: brand.colors.positive || '#10b981' }" />
                            <span class="ass-dash__mover-label"><strong>IVVB11</strong> compensou com dólar</span>
                            <span class="ass-dash__mover-pct ass-dash__mover-pct--pos">+1,1%</span>
                          </li>
                          <li>
                            <span class="ass-dash__mover-dot" :style="{ background: brand.colors.negative || '#dc2626' }" />
                            <span class="ass-dash__mover-label"><strong>Bancos</strong> com Copom hawkish</span>
                            <span class="ass-dash__mover-pct ass-dash__mover-pct--neg">-0,9%</span>
                          </li>
                        </ul>
                        <p class="ass-dash__movers-foot">Ibovespa <span class="ass-dash__mover-pct--neg">-1,42%</span> · Dólar <span class="ass-dash__mover-pct--pos">+0,58%</span></p>
                      </article>

                      <article class="ass-dash__card">
                        <header class="ass-dash__card-head">
                          <span class="ass-dash__card-icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 16%, transparent)`, color: brand.colors.primary }">
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L8 8l4 4 4-4z"/><path d="M2 12l6 4 4-4-4-4z"/><path d="M22 12l-6-4-4 4 4 4z"/><path d="M12 22l4-6-4-4-4 4z"/></svg>
                          </span>
                          <span class="ass-dash__card-title">Assistente IA</span>
                        </header>
                        <p class="ass-dash__ai-greet">Olá, Carlos! <em>Como posso ajudar hoje?</em></p>
                        <div class="ass-dash__ai-bubble">
                          Explique pro cliente por que a carteira caiu hoje.
                          <span class="ass-dash__ai-cursor" aria-hidden="true">↗</span>
                        </div>
                        <p class="ass-dash__ai-suglabel">Sugestões</p>
                        <div class="ass-dash__ai-sugs">
                          <span>Resumir o dia</span>
                          <span>Quais ativos pesaram?</span>
                        </div>
                      </article>

                      <article class="ass-dash__card">
                        <header class="ass-dash__card-head">
                          <span class="ass-dash__card-icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 16%, transparent)`, color: brand.colors.primary }">
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          </span>
                          <span class="ass-dash__card-title">Relatório para cliente</span>
                        </header>
                        <p class="ass-dash__report-meta">Relatório semanal · 02/05/2026</p>
                        <p class="ass-dash__report-body">Resumo, desempenho, alocação e perspectivas.</p>
                        <div class="ass-dash__report-row">
                          <button class="ass-dash__btn">Gerar relatório</button>
                          <div class="ass-dash__report-thumb" aria-hidden="true">
                            <span class="ass-dash__report-thumb-mark">SM</span>
                            <div class="ass-dash__report-thumb-lines">
                              <span /><span /><span /><span />
                            </div>
                          </div>
                        </div>
                      </article>

                      <article class="ass-dash__card">
                        <header class="ass-dash__card-head">
                          <span class="ass-dash__card-icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 16%, transparent)`, color: brand.colors.primary }">
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                          </span>
                          <span class="ass-dash__card-title">Insights personalizados</span>
                          <span class="ass-dash__card-link ass-dash__card-link--inline">Ver todos</span>
                        </header>
                        <ul class="ass-dash__insights">
                          <li>Sua exposição ao setor <strong>financeiro</strong> está acima da média.</li>
                          <li>Janela histórica sugere cautela com <strong>renda variável local</strong>.</li>
                          <li>O dólar pode seguir volátil nas próximas semanas.</li>
                        </ul>
                      </article>

                      <article class="ass-dash__card">
                        <header class="ass-dash__card-head">
                          <span class="ass-dash__card-icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 16%, transparent)`, color: brand.colors.primary }">
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                          </span>
                          <span class="ass-dash__card-title">Alertas e oportunidades</span>
                          <span class="ass-dash__card-link ass-dash__card-link--inline">Ver todos</span>
                        </header>
                        <div class="ass-dash__alert ass-dash__alert--warn">
                          <span class="ass-dash__alert-tag">Alerta</span>
                          <span>Aumento de risco no setor bancário.</span>
                        </div>
                        <div class="ass-dash__alert ass-dash__alert--ok">
                          <span class="ass-dash__alert-tag">Oportunidade</span>
                          <span>NTNB35 com prêmio acima da média.</span>
                        </div>
                      </article>
                    </div>

                    <!-- Carta editorial DENTRO da page do Painel,
                         abaixo do grid de cards. Sobe de baixo pra
                         cima quando a page Painel monta. Versao
                         reduzida da carta do /raio-x pra caber
                         no escopo do mock. -->
                    <article class="ass-letter" aria-hidden="true">
                      <span class="ass-letter__watermark">SUA MARCA</span>

                      <header class="ass-letter__head">
                        <span class="ass-letter__edition">Edição IV · Maio 2026</span>
                        <div class="ass-letter__monogram">SM</div>
                        <span class="ass-letter__date">São Paulo, 02 de maio</span>
                      </header>

                      <p class="ass-letter__salut">Caro <em>Carlos</em>,</p>

                      <p class="ass-letter__body">
                        Maio tratou bem a sua carteira. O retorno no mês foi de
                        <strong class="ass-letter__hl">+4,82%</strong>, à frente do IBOV em
                        <strong>1,84 p.p.</strong> e do CDI em <strong>3,21 pontos</strong>.
                        Destaques vieram dos seus ativos de <em>commodities</em> e dos
                        <em>FIIs de papel</em>.
                      </p>

                      <div class="ass-letter__stats">
                        <div class="ass-letter__stat">
                          <span class="ass-letter__stat-value">+4,82<span class="ass-letter__stat-pct">%</span></span>
                          <span class="ass-letter__stat-label">Retorno do mês</span>
                        </div>
                        <div class="ass-letter__stat ass-letter__stat--divider" />
                        <div class="ass-letter__stat">
                          <span class="ass-letter__stat-value ass-letter__stat-value--small">R$ 487</span>
                          <span class="ass-letter__stat-label">Dividendos</span>
                        </div>
                        <div class="ass-letter__stat ass-letter__stat--divider" />
                        <div class="ass-letter__stat">
                          <span class="ass-letter__stat-value ass-letter__stat-value--small">3</span>
                          <span class="ass-letter__stat-label">Fatos relevantes</span>
                        </div>
                      </div>

                      <div class="ass-letter__rule">
                        <span class="ass-letter__rule-orn">❦</span>
                      </div>

                      <footer class="ass-letter__foot">
                        <p class="ass-letter__closing">Com afeto e disciplina,</p>
                        <span class="ass-letter__signature">Sua Marca</span>
                      </footer>
                    </article>
                  </div>

                  <!-- =========== PAGE 2: ASSET PETR4 =========== -->
                  <div v-else-if="mockPage === 2" key="asset" class="ass-asset">
                  <!-- Breadcrumb fina + ticker -->
                  <div class="ass-asset__crumb">
                    <span>Painel</span>
                    <span class="ass-asset__crumb-sep">›</span>
                    <span>Carteira</span>
                    <span class="ass-asset__crumb-sep">›</span>
                    <span class="is-current">PETR4</span>
                  </div>

                  <!-- Hero do asset: logo + ticker + nome + setor + preco -->
                  <div class="ass-asset__hero">
                    <div class="ass-asset__id">
                      <div class="ass-asset__logo" aria-hidden="true">
                        <span>P</span>
                      </div>
                      <div class="ass-asset__ident">
                        <h2 class="ass-asset__ticker">PETR4</h2>
                        <p class="ass-asset__name">Petróleo Brasileiro S.A.</p>
                        <p class="ass-asset__sector">&gt; Energia · Petróleo, Gás e Biocombustíveis</p>
                      </div>
                    </div>
                    <div class="ass-asset__price">
                      <div class="ass-asset__price-row">
                        <span class="ass-asset__price-currency">R$</span>
                        <span class="ass-asset__price-value">38,42</span>
                      </div>
                      <div class="ass-asset__price-foot">
                        <span class="ass-asset__chip ass-asset__chip--neg">
                          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/></svg>
                          -3,20%
                        </span>
                        <span class="ass-asset__price-when">HOJE · 14:32</span>
                      </div>
                    </div>
                  </div>

                  <!-- Stats row, 6 colunas como na page real -->
                  <div class="ass-asset__stats">
                    <div><span>Volume</span><strong>R$ 1,8 bi</strong></div>
                    <div><span>Var. 12m</span><strong class="is-pos">+12,4%</strong></div>
                    <div><span>Mín 52s</span><strong>32,80</strong></div>
                    <div><span>Máx 52s</span><strong>42,15</strong></div>
                    <div><span>P/L</span><strong>4,2x</strong></div>
                    <div><span>DY 12m</span><strong class="is-pos">14,8%</strong></div>
                  </div>

                  <!-- Chart -->
                  <div class="ass-asset__chart">
                    <div class="ass-asset__chart-head">
                      <span class="ass-asset__chart-label">HISTÓRICO DE COTAÇÃO</span>
                      <div class="ass-asset__chart-range">
                        <span>1D</span><span>1S</span><span class="is-active">1M</span><span>3M</span><span>1A</span><span>5A</span>
                      </div>
                    </div>
                    <svg class="ass-asset__chart-svg" viewBox="0 0 700 180" preserveAspectRatio="none" aria-hidden="true">
                      <defs>
                        <linearGradient id="ass-asset-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" :stop-color="brand.colors.negative || '#dc2626'" stop-opacity="0.3" />
                          <stop offset="100%" :stop-color="brand.colors.negative || '#dc2626'" stop-opacity="0" />
                        </linearGradient>
                      </defs>
                      <!-- Grid horizontal sutil -->
                      <line x1="0" y1="45" x2="700" y2="45" stroke="#E4E4E7" stroke-width="1" stroke-dasharray="2,4"/>
                      <line x1="0" y1="90" x2="700" y2="90" stroke="#E4E4E7" stroke-width="1" stroke-dasharray="2,4"/>
                      <line x1="0" y1="135" x2="700" y2="135" stroke="#E4E4E7" stroke-width="1" stroke-dasharray="2,4"/>
                      <!-- Linha do ativo, queda no fim -->
                      <path d="M0,80 L40,72 L80,90 L120,68 L160,76 L200,55 L240,62 L280,48 L320,58 L360,42 L400,52 L440,38 L480,60 L520,82 L560,108 L600,120 L640,142 L700,158 L700,180 L0,180 Z" fill="url(#ass-asset-grad)" />
                      <path d="M0,80 L40,72 L80,90 L120,68 L160,76 L200,55 L240,62 L280,48 L320,58 L360,42 L400,52 L440,38 L480,60 L520,82 L560,108 L600,120 L640,142 L700,158" :stroke="brand.colors.negative || '#dc2626'" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
                      <!-- Pontilho sob o ultimo ponto -->
                      <circle cx="700" cy="158" r="4" :fill="brand.colors.negative || '#dc2626'" />
                      <circle cx="700" cy="158" r="9" :fill="brand.colors.negative || '#dc2626'" fill-opacity="0.18" />
                    </svg>
                  </div>

                  <!-- Linha de cards: AI insight + dividendos + noticia -->
                  <div class="ass-asset__row">
                    <article class="ass-asset__card ass-asset__card--ai">
                      <header class="ass-asset__card-head">
                        <span class="ass-dash__card-icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 16%, transparent)`, color: brand.colors.primary }">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L8 8l4 4 4-4z"/><path d="M2 12l6 4 4-4-4-4z"/><path d="M22 12l-6-4-4 4 4 4z"/><path d="M12 22l4-6-4-4-4 4z"/></svg>
                        </span>
                        <span class="ass-asset__card-title">Análise IA · Sua marca</span>
                      </header>
                      <p class="ass-asset__ai-text">
                        PETR4 cai <strong>3,2%</strong> hoje pressionada pela queda do <strong>Brent abaixo de US$ 78</strong> e ata do Copom mais hawkish. <strong>Dividend yield de 14,8%</strong> segue defendendo a tese, mas próximas distribuições podem desacelerar se o petróleo seguir caindo.
                      </p>
                      <div class="ass-asset__ai-tags">
                        <span>Risco macro</span>
                        <span>Yield ainda alto</span>
                        <span>Setor pressionado</span>
                      </div>
                    </article>

                    <article class="ass-asset__card">
                      <header class="ass-asset__card-head">
                        <span class="ass-dash__card-icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 16%, transparent)`, color: brand.colors.primary }">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        </span>
                        <span class="ass-asset__card-title">Dividendos</span>
                      </header>
                      <ul class="ass-asset__divs">
                        <li><span>15/04/2026</span><strong class="is-pos">R$ 1,28</strong></li>
                        <li><span>15/01/2026</span><strong class="is-pos">R$ 1,15</strong></li>
                        <li><span>15/10/2025</span><strong class="is-pos">R$ 0,98</strong></li>
                      </ul>
                      <p class="ass-asset__divs-foot">Próximo: <strong>15/07/2026</strong></p>
                    </article>

                    <article class="ass-asset__card">
                      <header class="ass-asset__card-head">
                        <span class="ass-dash__card-icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 16%, transparent)`, color: brand.colors.primary }">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/></svg>
                        </span>
                        <span class="ass-asset__card-title">Notícias do ativo</span>
                      </header>
                      <ul class="ass-asset__news">
                        <li>
                          <span class="ass-asset__news-time">há 1h</span>
                          <span>Brent cai 2,4% com receio de demanda chinesa fraca</span>
                        </li>
                        <li>
                          <span class="ass-asset__news-time">há 4h</span>
                          <span>Petrobras anuncia novo plano estratégico para 2026-2030</span>
                        </li>
                        <li>
                          <span class="ass-asset__news-time">ontem</span>
                          <span>Conselho aprova distribuição extraordinária de dividendos</span>
                        </li>
                      </ul>
                    </article>
                  </div>
                </div>

                <!-- =========== PAGE 3: CHAT IA =========== -->
                <div v-else key="chat" class="ass-chat">
                  <div class="ass-asset__crumb">
                    <span>Painel</span>
                    <span class="ass-asset__crumb-sep">›</span>
                    <span class="is-current">Chat IA · Sua marca</span>
                  </div>

                  <div class="ass-chat__header">
                    <div>
                      <h2 class="ass-chat__title">Carteira do Carlos · análise do dia</h2>
                      <p class="ass-chat__sub">Conversa em andamento · 4 mensagens · contexto carregado</p>
                    </div>
                    <span class="ass-chat__badge">
                      <span class="ass-chat__badge-dot" />
                      Sua Marca AI
                    </span>
                  </div>

                  <div class="ass-chat__thread">
                    <!-- Mensagem do assessor (so aparece depois do typing) -->
                    <div v-if="chatUserSent" class="ass-chat__msg ass-chat__msg--user ass-chat__msg--enter">
                      <span class="ass-chat__msg-avatar ass-chat__msg-avatar--user">C</span>
                      <div class="ass-chat__msg-bubble">
                        Como o Copom de ontem afetou a carteira do Carlos hoje? Preciso explicar pra ele em 1 frase.
                      </div>
                    </div>

                    <!-- Indicador "digitando..." da IA (typing dots) -->
                    <div v-if="chatAiTyping" class="ass-chat__msg ass-chat__msg--ai ass-chat__msg--enter">
                      <span class="ass-chat__msg-avatar ass-chat__msg-avatar--ai">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L8 8l4 4 4-4z"/><path d="M2 12l6 4 4-4-4-4z"/><path d="M22 12l-6-4-4 4 4 4z"/><path d="M12 22l4-6-4-4-4 4z"/></svg>
                      </span>
                      <div class="ass-chat__typing" aria-label="Digitando">
                        <span /><span /><span />
                      </div>
                    </div>

                    <!-- Resposta da IA (so aparece depois do typing) -->
                    <div v-if="chatAiResponded" class="ass-chat__msg ass-chat__msg--ai ass-chat__msg--enter">
                      <span class="ass-chat__msg-avatar ass-chat__msg-avatar--ai">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L8 8l4 4 4-4z"/><path d="M2 12l6 4 4-4-4-4z"/><path d="M22 12l-6-4-4 4 4 4z"/><path d="M12 22l4-6-4-4-4 4z"/></svg>
                      </span>
                      <div class="ass-chat__msg-bubble ass-chat__msg-bubble--ai">
                        <p>A ata mais hawkish puxou a curva longa de juros pra cima, e isso bateu em <strong>3 frentes da carteira do Carlos</strong>:</p>
                        <ul class="ass-chat__bullets">
                          <li><strong>Bancos (-0,9%)</strong>, ITUB4 e BBDC4 sofreram com expectativa de Selic terminal mais alta.</li>
                          <li><strong>FIIs (-1,2%)</strong>, especialmente HGLG11, reagiram à curva de juros.</li>
                          <li><strong>NTNB35 (+0,4%)</strong>, IPCA+ defendeu a parte de renda fixa.</li>
                        </ul>
                        <p class="ass-chat__sumline">
                          <strong>Resumo em 1 frase:</strong> "O Copom mais duro pressionou bancos e FIIs, mas a NTNB35 que você comprou em janeiro funcionou exatamente como hedge."
                        </p>
                        <div class="ass-chat__sources">
                          <span class="ass-chat__sources-label">FONTES</span>
                          <span class="ass-chat__source">Ata Copom · BCB</span>
                          <span class="ass-chat__source">Carteira Carlos · 09/05</span>
                          <span class="ass-chat__source">Curva DI · B3</span>
                        </div>
                      </div>
                    </div>

                    <!-- Sugestões de follow-up (so depois da resposta) -->
                    <div v-if="chatAiResponded" class="ass-chat__sugs ass-chat__msg--enter">
                      <span class="ass-chat__sugs-label">Continuar em</span>
                      <button class="ass-chat__sug">Gerar PDF para enviar ao Carlos</button>
                      <button class="ass-chat__sug">Comparar com a carteira modelo</button>
                      <button class="ass-chat__sug">Sugerir rebalance</button>
                    </div>
                  </div>

                  <!-- Input bar com simulacao de typing (caret pulsante + texto sendo digitado) -->
                  <div class="ass-chat__input">
                    <span class="ass-chat__input-icon" :style="{ color: brand.colors.primary }">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    </span>
                    <span
                      :class="['ass-chat__input-placeholder', { 'is-typing': !!chatUserDraft }]"
                    >
                      <template v-if="chatUserDraft">
                        {{ chatUserDraft }}<span class="ass-chat__input-caret" />
                      </template>
                      <template v-else>
                        Pergunte sobre carteiras, ativos, contexto, ou um cliente...
                      </template>
                    </span>
                    <span
                      :class="['ass-chat__input-send', { 'is-ready': !!chatUserDraft }]"
                      :style="{ background: brand.colors.primary }"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </span>
                  </div>
                </div>

                  </Transition>
                </div>

                <!-- Pager dots, controle manual entre as 3 pages -->
                <div class="ass-dash__pager" role="tablist" aria-label="Telas da plataforma">
                  <button
                    v-for="p in mockPages"
                    :key="p.n"
                    type="button"
                    role="tab"
                    :aria-selected="mockPage === p.n"
                    :class="['ass-dash__pager-dot', { 'is-active': mockPage === p.n }]"
                    @click="goToMockPage(p.n)"
                  >
                    <span class="ass-dash__pager-label">{{ p.label }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Float 1: performance no dia (top right) -->
            <div class="ass-float ass-float--perf" aria-hidden="true">
              <div class="ass-float__head">Performance no dia</div>
              <div class="ass-float__row">
                <div class="ass-float__col">
                  <span class="ass-float__num" :style="{ color: brand.colors.negative || '#dc2626' }">-1,8%</span>
                  <span class="ass-float__sub">R$ -22.340</span>
                </div>
                <svg class="ass-float__spark" viewBox="0 0 70 36" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="ass-float-spark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" :stop-color="brand.colors.negative || '#dc2626'" stop-opacity="0.35" />
                      <stop offset="100%" :stop-color="brand.colors.negative || '#dc2626'" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,10 L10,8 L20,12 L30,7 L40,18 L50,15 L60,24 L70,28 L70,36 L0,36 Z" fill="url(#ass-float-spark)" />
                  <path d="M0,10 L10,8 L20,12 L30,7 L40,18 L50,15 L60,24 L70,28" :stroke="brand.colors.negative || '#dc2626'" stroke-width="1.5" fill="none" />
                </svg>
              </div>
            </div>

            <!-- Float 2: clientes ativos (bottom left) -->
            <div class="ass-float ass-float--clients" aria-hidden="true">
              <span class="ass-float__icon-wrap" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 16%, transparent)`, color: brand.colors.primary }">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </span>
              <div>
                <span class="ass-float__sub">Clientes ativos</span>
                <span class="ass-float__big">127 <em>+8 esta semana</em></span>
              </div>
            </div>

            <!-- Float 3: plataforma com sua marca (bottom right) -->
            <div class="ass-float ass-float--brand" aria-hidden="true">
              <span class="ass-float__icon-wrap" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 16%, transparent)`, color: brand.colors.primary }">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </span>
              <div>
                <span class="ass-float__title">Plataforma com sua marca</span>
                <span class="ass-float__sub">Seu domínio · Seu logo · Sua cor. Experiência 100% personalizada.</span>
              </div>
            </div>
            </div><!-- /.ass-hero__tilt -->
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
         1.5. PREVIEWS REAIS, iframes de tenants em producao
         Posicionada logo abaixo do hero. Reduz risco percebido cedo,
         mostra que ja existe gente real rodando o produto white-label.
         3 cards clicaveis abrem o tenant em producao em nova aba.
         ============================================================ -->
    <section class="ass-previews reveal-on-scroll">
      <div class="lp-container">
        <div class="lp-section-head ass-previews__head">
          <p class="lp-eyebrow lp-eyebrow--center lp-eyebrow--pulsing" style="margin: 0 auto;">
            <span class="lp-eyebrow__dot" aria-hidden="true" />
            PRODUTO REAL · DEMOS · EXPERIÊNCIAS
          </p>
          <h2 class="lp-section-title">
            Veja na prática
            <span class="lp-section-title__italic">como isso aparece.</span>
          </h2>
          <p class="ass-previews__lead">
            Plataformas prontas, com sua marca, seu domínio e uma experiência premium pro cliente final.
          </p>
          <p class="ass-previews__hint">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V8H8"/></svg>
            Clique nos cards para abrir cada plataforma em produção.
          </p>
        </div>

        <div class="ass-previews__grid">
          <article
            v-for="p in tenantPreviews"
            :key="p.slug"
            class="ass-preview__card"
          >
            <a class="ass-preview__head" :href="p.url" target="_blank" rel="noopener">
              <span
                class="ass-preview__badge"
                :class="`ass-preview__badge--${p.badgeKind}`"
              >
                <svg v-if="p.badgeKind === 'preview'" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                {{ p.badgeLabel }}
              </span>
              <div class="ass-preview__brand">
                <span
                  class="ass-preview__logo"
                  :style="{ background: p.bg, color: p.fg, fontFamily: p.font, fontStyle: p.italic ? 'italic' : 'normal' }"
                >{{ p.mark }}</span>
                <div class="ass-preview__id">
                  <span class="ass-preview__name">{{ p.name }}</span>
                  <span class="ass-preview__tag">{{ p.tag }}</span>
                </div>
                <span class="ass-preview__ext" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M17 7H8M17 7V16"/></svg>
                </span>
              </div>
            </a>

            <div class="ass-preview__frame">
              <iframe
                class="ass-preview__iframe"
                :src="p.iframeUrl"
                :title="`Preview da plataforma ${p.name}`"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              />
              <!-- Overlay gradient pro fade do bottom -->
              <div class="ass-preview__frame-fade" aria-hidden="true" />
            </div>

            <ul class="ass-preview__features">
              <li v-for="f in p.features" :key="f">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" :stroke="brand.colors.primary" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
                {{ f }}
              </li>
            </ul>

            <a class="ass-preview__cta" :href="p.url" target="_blank" rel="noopener">
              {{ p.ctaLabel }}
              <span aria-hidden="true">→</span>
            </a>
          </article>
        </div>

        <!-- Faixa de trust embaixo + CTA pra lead -->
        <div class="ass-previews__foot">
          <div class="ass-previews__foot-item">
            <span class="ass-previews__foot-icon" :style="{ color: brand.colors.primary }">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </span>
            <div class="ass-previews__foot-text">
              <strong>Sua marca, seu domínio</strong>
              <span>Plataforma 100% personalizada.</span>
            </div>
          </div>
          <div class="ass-previews__foot-item">
            <span class="ass-previews__foot-icon" :style="{ color: brand.colors.primary }">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
            </span>
            <div class="ass-previews__foot-text">
              <strong>Deploy em até 7 dias</strong>
              <span>Do contrato ao ar, rapidinho.</span>
            </div>
          </div>
          <div class="ass-previews__foot-item">
            <span class="ass-previews__foot-icon" :style="{ color: brand.colors.primary }">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </span>
            <div class="ass-previews__foot-text">
              <strong>Sem time de tecnologia</strong>
              <span>A gente cuida de tudo pra você.</span>
            </div>
          </div>
          <div class="ass-previews__foot-item">
            <span class="ass-previews__foot-icon" :style="{ color: brand.colors.primary }">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </span>
            <div class="ass-previews__foot-text">
              <strong>Pronto para clientes</strong>
              <span>Profissional, segura, confiável.</span>
            </div>
          </div>
          <button
            type="button"
            class="lp-hero__cta ass-previews__foot-cta"
            @click="openLeadModal"
          >
            Pedir uma demo na minha marca
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ============================================================
         2. O QUE E, clareza > intriga
         ============================================================ -->
    <section class="sol-what reveal-on-scroll">
      <div class="lp-container">
        <div class="lp-section-head">
          <p class="lp-eyebrow lp-eyebrow--center">O QUE É</p>
          <h2 class="lp-section-title">
            Uma experiência digital da sua assessoria,
            <span class="lp-section-title__italic">para os seus clientes.</span>
          </h2>
          <p class="sol-what__lead">
            A Redentia entrega uma plataforma com IA para ajudar o cliente a entender melhor a própria carteira. Em vez de depender só de <strong>WhatsApp, reunião e relatório</strong>, o cliente acessa um ambiente próprio com análises, impacto de mercado, notícias relevantes, riscos e o "por que" do que mexeu hoje.
          </p>
        </div>

        <div class="sol-what__grid">
          <article class="sol-what__card">
            <div class="sol-what__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`, color: brand.colors.primary }">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg>
            </div>
            <h3>Carteira</h3>
            <p>O cliente acompanha <strong>ativos, exposição e composição</strong> em tempo real.</p>
          </article>

          <article class="sol-what__card">
            <div class="sol-what__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`, color: brand.colors.primary }">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/></svg>
            </div>
            <h3>Notícias</h3>
            <p>A IA cruza notícias relevantes <strong>com os ativos da carteira</strong> do cliente.</p>
          </article>

          <article class="sol-what__card">
            <div class="sol-what__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`, color: brand.colors.primary }">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <h3>Impactos</h3>
            <p>Mostra o que <strong>ajudou ou pressionou</strong> o resultado, com explicação clara.</p>
          </article>

          <article class="sol-what__card">
            <div class="sol-what__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`, color: brand.colors.primary }">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3>Riscos</h3>
            <p>Identifica <strong>concentração, setores e pontos de atenção</strong> antes do cliente perguntar.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- NOTA: section "Consequencia" (.ass-stakes) da /assessorias foi
         removida nesta page. Landing de SOLUCAO nao precisa agitar dor
         (loss aversion), o tom e construtivo. -->


    <!-- ============================================================
         4. DIFERENCIACAO, beneficio central
         ============================================================ -->
    <section class="sol-diff reveal-on-scroll">
      <div
        class="sol-diff__glow"
        aria-hidden="true"
        :style="{
          background: `radial-gradient(ellipse 60% 50% at 50% 30%, color-mix(in srgb, ${brand.colors.primary} 22%, transparent), transparent 65%)`,
        }"
      />
      <div class="lp-container">
        <div class="lp-section-head">
          <p class="lp-eyebrow lp-eyebrow--center">DIFERENCIAÇÃO</p>
          <h2 class="lp-section-title">
            Pare de vender só atendimento.
            <span class="lp-section-title__italic">Mostre uma plataforma.</span>
          </h2>
          <p class="sol-diff__lead">
            Toda assessoria fala de atendimento, confiança e acompanhamento. Para o cliente, isso soa parecido. Com a Redentia, sua assessoria passa a mostrar <strong>uma experiência concreta</strong>: uma plataforma própria, com IA, pro cliente acompanhar a carteira com clareza.
          </p>
        </div>

        <div class="sol-diff__grid">
          <article class="sol-diff__card">
            <div class="sol-diff__num">01</div>
            <h3>Diferenciação <em>comercial</em></h3>
            <p>Sua assessoria deixa de parecer igual às outras. Tem algo concreto pra mostrar em reunião, no pitch, no LinkedIn.</p>
          </article>

          <article class="sol-diff__card">
            <div class="sol-diff__num">02</div>
            <h3>Mais <em>percepção de valor</em></h3>
            <p>O cliente enxerga análises, contexto, inteligência. A entrega vira visível. A relação preço-valor pesa a seu favor.</p>
          </article>

          <article class="sol-diff__card">
            <div class="sol-diff__num">03</div>
            <h3>Mais <em>presença digital</em></h3>
            <p>A relação sai do WhatsApp, ganha um ambiente próprio. O cliente abre o app da sua casa, não da corretora.</p>
          </article>

          <article class="sol-diff__card">
            <div class="sol-diff__num">04</div>
            <h3>Mais <em>argumento de venda</em></h3>
            <p>Seu time comercial demonstra a plataforma ao captar novos clientes. Diferencial concreto em categoria de muito discurso.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- NOTA: a antiga "section 5 - DEMONSTRACAO VISUAL" (.ass-demo) foi
         removida em 2026-05-11. Era um grid de 6 cards textuais com exemplos
         de output da IA (PETR4, Bancos, IVVB11, etc). Substituida pela
         section "Veja na pratica" no topo da page (logo abaixo do hero),
         que mostra IFRAMES reais de tenants em producao em vez de exemplos
         hipoteticos. Mais convincente, menos abstrato. -->

    <!-- ============================================================
         5. ANTES vs DEPOIS, contraste lado a lado
         ============================================================ -->
    <section class="sol-compare reveal-on-scroll">
      <div class="lp-container">
        <div class="lp-section-head">
          <p class="lp-eyebrow lp-eyebrow--center">ANTES E DEPOIS</p>
          <h2 class="lp-section-title">
            Antes, sua assessoria entregava análise.
            <span class="lp-section-title__italic">Agora, entrega experiência.</span>
          </h2>
        </div>

        <div class="sol-compare__grid">
          <div class="sol-compare__col sol-compare__col--before">
            <p class="sol-compare__head">Antes da Redentia</p>
            <ul>
              <li>WhatsApp como canal principal</li>
              <li>Relatório em PDF mensal</li>
              <li>Reunião pontual de revisão</li>
              <li>Cliente perguntando "por que caiu?"</li>
              <li>Diferencial difícil de explicar</li>
              <li>Dependência do assessor individual</li>
            </ul>
          </div>

          <div class="sol-compare__col sol-compare__col--after">
            <p class="sol-compare__head">Com a Redentia</p>
            <ul>
              <li>Plataforma própria, <strong>no ar em até 7 dias</strong></li>
              <li>IA <strong>responde em segundos</strong> sobre carteira e mercado</li>
              <li>Notícias <strong>cruzadas em tempo real</strong> com os ativos</li>
              <li>Cliente <strong>entende sozinho</strong>, antes de ligar</li>
              <li>Diferencial <strong>visível a cada acesso</strong></li>
              <li>Experiência <strong>escalável</strong>, sem time de tech</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
         6. CASOS DE USO, como a assessoria usa na pratica
         ============================================================ -->
    <section class="sol-uses reveal-on-scroll">
      <div class="lp-container">
        <div class="lp-section-head">
          <p class="lp-eyebrow lp-eyebrow--center">CASOS DE USO</p>
          <h2 class="lp-section-title">
            Como sua assessoria
            <span class="lp-section-title__italic">pode usar a Redentia.</span>
          </h2>
        </div>

        <div class="sol-uses__grid">
          <article class="sol-uses__card">
            <div class="sol-uses__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`, color: brand.colors.primary }">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <h3>Para clientes premium</h3>
            <p>Ofereça experiência diferenciada aos clientes de maior valor da casa.</p>
          </article>

          <article class="sol-uses__card">
            <div class="sol-uses__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`, color: brand.colors.primary }">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3>Para captação</h3>
            <p>Mostre a plataforma em reunião comercial e suba a percepção de sofisticação.</p>
          </article>

          <article class="sol-uses__card">
            <div class="sol-uses__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`, color: brand.colors.primary }">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <h3>Para relacionamento</h3>
            <p>Crie novos motivos pro cliente voltar ao ambiente da casa, sem ser cobrança.</p>
          </article>

          <article class="sol-uses__card">
            <div class="sol-uses__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`, color: brand.colors.primary }">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3>Para retenção</h3>
            <p>O cliente entende carteira, mercado e riscos antes de questionar valor.</p>
          </article>

          <article class="sol-uses__card">
            <div class="sol-uses__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`, color: brand.colors.primary }">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3>Para posicionamento</h3>
            <p>Mostre que sua assessoria não é só atendimento. É inteligência, tech e experiência.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ============================================================
         7. IMPLEMENTACAO, remover medo
         ============================================================ -->
    <section class="sol-steps reveal-on-scroll">
      <div class="lp-container">
        <div class="lp-section-head">
          <p class="lp-eyebrow lp-eyebrow--center">IMPLEMENTAÇÃO</p>
          <h2 class="lp-section-title">
            Você não precisa construir
            <span class="lp-section-title__italic">uma fintech do zero.</span>
          </h2>
          <p class="sol-steps__lead">
            A Redentia entrega a camada de tecnologia para sua assessoria oferecer uma experiência digital própria aos clientes. Sem montar time de produto, design, dados ou desenvolvimento. <strong>Você cuida da relação, a gente cuida da tech.</strong>
          </p>
        </div>

        <ol class="sol-steps__list">
          <li class="sol-steps__step">
            <span class="sol-steps__num">01</span>
            <div class="sol-steps__body">
              <h3>Diagnóstico <span class="sol-steps__time">~1 dia</span></h3>
              <p>Entendemos o modelo da sua assessoria e o perfil de cliente que você atende.</p>
            </div>
          </li>
          <li class="sol-steps__step">
            <span class="sol-steps__num">02</span>
            <div class="sol-steps__body">
              <h3>Configuração da experiência <span class="sol-steps__time">~3 dias</span></h3>
              <p>Adaptamos a plataforma para a sua marca: domínio, paleta, logo, voz e escopo.</p>
            </div>
          </li>
          <li class="sol-steps__step">
            <span class="sol-steps__num">03</span>
            <div class="sol-steps__body">
              <h3>Ativação inicial <span class="sol-steps__time">~2 dias</span></h3>
              <p>Você começa com base selecionada de clientes ou usa pra demonstração comercial.</p>
            </div>
          </li>
          <li class="sol-steps__step">
            <span class="sol-steps__num">04</span>
            <div class="sol-steps__body">
              <h3>Evolução <span class="sol-steps__time">contínua</span></h3>
              <p>Acompanhamos feedbacks e ajustamos a experiência pra gerar mais valor ao longo do tempo.</p>
            </div>
          </li>
        </ol>

        <button
          type="button"
          class="lp-hero__cta sol-steps__cta"
          @click="openLeadModal"
        >
          Agendar conversa de 20 min
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>

    <!-- ============================================================
         7. ESCASSEZ, 10 vagas com justificativa
         ============================================================ -->
    <section class="ass-scarcity reveal-on-scroll">
      <div
        class="ass-scarcity__glow"
        aria-hidden="true"
        :style="{
          background: `radial-gradient(ellipse 50% 60% at 50% 50%, color-mix(in srgb, ${brand.colors.primary} 28%, transparent), transparent 65%)`,
        }"
      />
      <div class="lp-container">
        <div class="ass-scarcity__inner">
          <p class="lp-eyebrow lp-eyebrow--center lp-eyebrow--pulsing" style="margin: 0 auto 18px;">
            <span class="lp-eyebrow__dot" aria-hidden="true" />
            PRIMEIRA FASE
          </p>

          <h2 class="lp-section-title">
            Primeira fase limitada a
            <span class="lp-section-title__italic">10 assessorias.</span>
          </h2>

          <!-- TODO (Andre): substituir "profundidade depois" por data real
               quando definir o cronograma da segunda leva. Ex: "Próxima
               janela em julho/2026." Deadline absoluto fortalece a escassez. -->
          <p class="ass-scarcity__lead">
            Nesta etapa, vamos implementar a Redentia com <strong>apenas 10 assessorias</strong>. O motivo é simples: a solução pede proximidade, adaptação da experiência e acompanhamento da operação comercial de cada escritório. Por isso, poucas assessorias agora, profundidade depois.
          </p>

          <button
            type="button"
            class="lp-hero__cta ass-scarcity__cta"
            @click="openLeadModal"
          >
            Pedir avaliação
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ============================================================
         8. PROVA / CREDIBILIDADE, por que agora
         ============================================================ -->
    <section class="ass-proof reveal-on-scroll">
      <div class="lp-container">
        <div class="lp-section-head">
          <p class="lp-eyebrow lp-eyebrow--center">PROVA</p>
          <h2 class="lp-section-title">
            Uma nova camada de inteligência
            <span class="lp-section-title__italic">para assessorias modernas.</span>
          </h2>
        </div>

        <div class="ass-proof__grid">
          <article class="ass-proof__card">
            <div class="ass-proof__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`, color: brand.colors.primary }">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M6 8h12M6 12h8M6 16h6"/></svg>
            </div>
            <h3>Cliente acostumado com experiência digital</h3>
            <p>Bancos, corretoras e fintechs já elevaram o padrão. A assessoria que ainda entrega só relatório por PDF parece <strong>defasada por contraste</strong>.</p>
          </article>

          <article class="ass-proof__card">
            <div class="ass-proof__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`, color: brand.colors.primary }">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <h3>Atenção do investidor está em disputa</h3>
            <p>Apps, influencers, newsletters, podcasts. Sua assessoria não compete só por <strong>dinheiro</strong>, compete por <strong>tempo de tela</strong> com tudo isso.</p>
          </article>

          <article class="ass-proof__card">
            <div class="ass-proof__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`, color: brand.colors.primary }">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L8 8l4 4 4-4z"/><path d="M2 12l6 4 4-4-4-4z"/><path d="M22 12l-6-4-4 4 4 4z"/><path d="M12 22l4-6-4-4-4 4z"/></svg>
            </div>
            <h3>IA virou expectativa, não novidade</h3>
            <p>O cliente já usa ChatGPT pra pedir opinião sobre a carteira. Sua casa precisa ter <strong>uma IA com a sua marca</strong>, ou ele vai usar a do outro.</p>
          </article>

          <article class="ass-proof__card">
            <div class="ass-proof__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)`, color: brand.colors.primary }">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <h3>Quem cria experiência sai do funil de comoditização</h3>
            <p>Assessoria que vira <strong>plataforma</strong> deixa de depender de WhatsApp, PDF e reunião pra existir na cabeça do cliente. Cria pertencimento.</p>
          </article>
        </div>

        <!-- Stats row da plataforma Redentia -->
        <div class="ass-proof__stats">
          <div class="ass-proof__stat">
            <span class="ass-proof__stat-num">5</span>
            <span class="ass-proof__stat-label">marcas no ar com a infra Redentia</span>
          </div>
          <div class="ass-proof__stat">
            <span class="ass-proof__stat-num">33k+</span>
            <span class="ass-proof__stat-label">carteiras analisadas pela IA</span>
          </div>
          <div class="ass-proof__stat">
            <span class="ass-proof__stat-num">15</span>
            <span class="ass-proof__stat-label">feeds de notícias agregados a cada 10 min</span>
          </div>
          <div class="ass-proof__stat">
            <span class="ass-proof__stat-num">7d</span>
            <span class="ass-proof__stat-label">do go-decision ao produto deployado</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
         9. FAQ, objecoes
         ============================================================ -->
    <section class="ass-faq reveal-on-scroll">
      <div class="lp-container">
        <div class="lp-section-head">
          <p class="lp-eyebrow lp-eyebrow--center">DÚVIDAS</p>
          <h2 class="lp-section-title">
            O que perguntam antes
            <span class="lp-section-title__italic">de começar.</span>
          </h2>
        </div>

        <div class="ass-faq__list">
          <details class="ass-faq__item">
            <summary>
              <span>A plataforma fica com a marca da minha assessoria?</span>
              <span class="ass-faq__chev" aria-hidden="true">+</span>
            </summary>
            <p>Sim. Domínio próprio, logo, paleta, fonte, voz. <strong>Zero menção da Redentia</strong> no produto final que o cliente vê. Pro investidor, é uma plataforma da sua casa, não um software de terceiro.</p>
          </details>

          <details class="ass-faq__item">
            <summary>
              <span>Isso substitui o assessor?</span>
              <span class="ass-faq__chev" aria-hidden="true">+</span>
            </summary>
            <p>Não. A Redentia <strong>aumenta a percepção de valor</strong> do assessor, dando mais clareza, contexto e escala ao relacionamento. O assessor segue como relação humana, a plataforma amplifica.</p>
          </details>

          <details class="ass-faq__item">
            <summary>
              <span>Preciso ter time de tecnologia?</span>
              <span class="ass-faq__chev" aria-hidden="true">+</span>
            </summary>
            <p>Não. A Redentia entrega a camada tecnológica: infra, dados de mercado, calculadoras, IA, design system. Você cuida do <strong>relacionamento</strong> e da <strong>marca</strong>, a gente cuida do resto.</p>
          </details>

          <details class="ass-faq__item">
            <summary>
              <span>Preciso começar com toda a base?</span>
              <span class="ass-faq__chev" aria-hidden="true">+</span>
            </summary>
            <p>Não. Você pode começar com <strong>clientes premium, base selecionada ou usar como ferramenta comercial</strong> pra demonstração. Várias assessorias rodam com 30 a 50 clientes na ativação inicial pra calibrar.</p>
          </details>

          <details class="ass-faq__item">
            <summary>
              <span>É uma plataforma de recomendação de investimento?</span>
              <span class="ass-faq__chev" aria-hidden="true">+</span>
            </summary>
            <p>Não. A proposta é ajudar o cliente a <strong>entender carteira, notícias, riscos e impactos de mercado</strong>. Recomendações e estratégia continuam com a assessoria, como sempre foi.</p>
          </details>

          <details class="ass-faq__item">
            <summary>
              <span>Por que só 10 assessorias na primeira fase?</span>
              <span class="ass-faq__chev" aria-hidden="true">+</span>
            </summary>
            <p>Porque a primeira fase pede <strong>proximidade e personalização na implementação</strong>. Cada plataforma é adaptada ao modelo da casa. Pra fazer isso bem, abrimos só 10 vagas iniciais. Depois, abre a próxima janela.</p>
          </details>

          <details class="ass-faq__item">
            <summary>
              <span>Qual o investimento?</span>
              <span class="ass-faq__chev" aria-hidden="true">+</span>
            </summary>
            <p>Modelos comerciais <strong>ajustados ao porte e ao número de clientes</strong> da assessoria. Definimos juntos depois do diagnóstico, sem proposta de 40 páginas.</p>
          </details>
        </div>
      </div>
    </section>

    <!-- ============================================================
         11. CTA FINAL, fecha com visao + acao
         ============================================================ -->
    <section class="sol-final reveal-on-scroll">
      <div
        class="sol-final__glow"
        aria-hidden="true"
        :style="{
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, color-mix(in srgb, ${brand.colors.primary} 26%, transparent), transparent 65%)`,
        }"
      />
      <div class="lp-container">
        <div class="sol-final__inner">
          <p class="lp-eyebrow lp-eyebrow--center">PRIMEIRA FASE</p>
          <h2 class="lp-section-title">
            Sua assessoria pode ser uma das primeiras
            <span class="lp-section-title__italic">com plataforma própria de IA.</span>
          </h2>

          <p class="sol-final__lead">
            Mostre tecnologia, inteligência e clareza para os seus clientes. <strong>Diferencie sua marca antes que o mercado inteiro faça igual.</strong>
          </p>

          <button
            type="button"
            class="lp-hero__cta sol-final__cta"
            @click="openLeadModal"
          >
            Agendar minha conversa de 20 min
            <span aria-hidden="true">→</span>
          </button>

          <p class="sol-final__legal">
            Conversa de 20 minutos, sem proposta de 40 páginas · assessorias@redentia.com.br
          </p>
        </div>
      </div>
    </section>

    <!-- Modal de captura de lead DEDICADO a /assessorias.
         Fullscreen, multi-step (1: identificacao, 2: 5 perguntas Sim/Não).
         Backend recebe source='assessoria' + metadata.answers via mesmo
         endpoint /api/leads. Modal antigo (centrado, 1-step) continua
         servindo /whitelabel e /api intactos. -->
    <MoleculesAssessoriaLeadFullscreen v-model:open="leadModalOpen" />
  </div>
</template>

<style scoped>
/* =================================================================
 * Estilos base reusados de /raio-x. Em vez de duplicar, importei
 * apenas o que e visualmente diferente da raio-x e estendi com
 * classes ass-* especificas dessa landing.
 *
 * Onde reuso:
 *   .lp-container, .lp-eyebrow, .lp-section-title*, .lp-section-head,
 *   .lp-hero*, .lp-mockup*, .lp-problem, .lp-final*,
 *   .lp-eyebrow--pulsing, .lp-eyebrow__dot, .reveal-on-scroll
 *
 * Por que duplicar aqui mesmo: o <style scoped> da /raio-x nao vaza,
 * cada page tem o proprio. Fizemos um copy-paste consciente. Se
 * extrairmos pra .css global no futuro, dois arquivos atualizam.
 * Por enquanto o tradeoff e aceitavel pra manter cada landing
 * autocontida (vital pra performance de bundle de marketing).
 * ================================================================= */

/* ============ TOP BANNER (anuncio acima do landing header) ============
   Faixa amber sutil em fluxo normal (some no scroll). Mostra a escassez
   "ASSESSORIAS · PRIMEIRA FASE · 10 vagas" desde o pixel zero. Click
   abre o modal de lead direto. */
.ass-topbanner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  width: 100%;
  padding: 9px 24px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--brand-primary) 18%, transparent) 0%,
    color-mix(in srgb, var(--brand-primary) 28%, transparent) 50%,
    color-mix(in srgb, var(--brand-primary) 18%, transparent) 100%
  );
  border: 0;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-primary) 40%, transparent);
  font-family: var(--brand-font);
  color: #1A0A2E;
  cursor: pointer;
  text-align: center;
  transition: filter 200ms;
}
.ass-topbanner:hover { filter: brightness(0.98); }

.ass-topbanner__dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 38%, transparent);
  animation: lp-eyebrow-pulse 2.4s ease-in-out infinite;
  flex-shrink: 0;
}

.ass-topbanner__text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  letter-spacing: 0.04em;
}
.ass-topbanner__text strong {
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 11px;
}
.ass-topbanner__sep { opacity: 0.4; }

.ass-topbanner__cta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 999px;
  background: #1A0A2E;
  color: var(--brand-primary);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0;
  transition: filter 200ms, transform 200ms;
}
.ass-topbanner:hover .ass-topbanner__cta {
  filter: brightness(1.15);
  transform: translateX(2px);
}

@media (max-width: 640px) {
  /* Em mobile, oculta o CTA pra simplificar (clique no banner inteiro
     ja abre o modal). E quebra texto pra duas linhas se precisar. */
  .ass-topbanner__cta { display: none; }
  .ass-topbanner { padding: 8px 16px; }
  .ass-topbanner__text { font-size: 11px; }
  .ass-topbanner__text strong { font-size: 10px; }
}

.lp {
  width: 100%;
  position: relative;
  /* IMPORTANTE: usar `clip` em vez de `hidden`. Quando overflow-x = hidden
     e overflow-y nao e definido (visible), a spec do W3C forca overflow-y
     a computar pra `auto`, criando um scroll container DENTRO do .lp e
     resultando em DOIS scrolls verticais visiveis na page (window + .lp).
     `clip` corta o overflow horizontal sem criar contexto de scroll,
     entao overflow-y permanece visible e existe so o scroll do window. */
  overflow-x: clip;
}

/* NOTA: removi `content-visibility: auto` que copiei do /raio-x. Naquela
   landing faz sentido porque o trafego e majoritariamente paid via Meta
   Ads (alto volume + bounce rapido), entao economizar render off-screen
   importa. Aqui a /assessorias e B2B inbound (volume baixo, ticket
   alto), e o intrinsic-size 800px reservado nao bate com a altura real
   das sections (770-1072px), causando scroll-jank ao crescer/encolher
   o layout on-the-fly. Sem content-visibility, scroll fica suave. */

.lp-container {
  /* Removi max-width fixo (era 1200px) pra dar mais espaco lateral pro
     hero e pro mock da plataforma. Em monitores 4K isso pode espacar
     demais o conteudo, entao ainda limito em 1600px como teto sutil. */
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 24px;
}
@media (min-width: 768px) {
  .lp-container { padding: 0 40px; }
}
@media (min-width: 1280px) {
  .lp-container { padding: 0 56px; }
}

/* ============ EYEBROW + TITLES (igual /raio-x) ============ */
.lp-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
  margin: 0;
}
.lp-eyebrow--center { text-align: center; }

.lp-eyebrow--pulsing {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
}
.lp-eyebrow--center.lp-eyebrow--pulsing {
  margin-left: auto;
  margin-right: auto;
}
.lp-eyebrow__dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 25%, transparent);
  animation: lp-eyebrow-pulse 2.4s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes lp-eyebrow-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(0.8); }
}

.lp-section-title {
  font-size: 32px;
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--brand-text);
  margin: 12px 0 0;
  text-wrap: balance;
}
@media (min-width: 768px) { .lp-section-title { font-size: 48px; } }

.lp-section-title__italic {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
  display: block;
}

.lp-section-head {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 48px;
}
@media (min-width: 768px) { .lp-section-head { margin-bottom: 64px; } }

/* ============ HERO (igual /raio-x) ============ */
.lp-hero {
  position: relative;
  padding: 56px 0 72px;
  isolation: isolate;
}
@media (min-width: 768px) { .lp-hero { padding: 88px 0 112px; } }

.lp-hero__glow {
  position: absolute;
  inset: -120px -10% auto -10%;
  height: 720px;
  filter: blur(60px);
  z-index: -1;
  pointer-events: none;
  opacity: 0.85;
  will-change: opacity;
  transform: translateZ(0);
}

.lp-hero__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;
  align-items: center;
}
/* Desktop: copy menor, dashboard MUITO maior. Inverte a propor de
   1.05/1 (raio-x) pra 0.85/1.4. Mostra a plataforma como protagonista
   visual, copy como suporte. */
@media (min-width: 1024px) {
  .lp-hero__grid {
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.4fr);
    gap: 56px;
  }
}
@media (min-width: 1280px) {
  .lp-hero__grid {
    gap: 72px;
  }
}

.lp-hero__copy { display: flex; flex-direction: column; gap: 18px; }

.lp-hero__headline {
  font-size: 38px;
  font-weight: 300;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--brand-text);
  margin: 6px 0 0;
  text-wrap: balance;
}
@media (min-width: 768px) { .lp-hero__headline { font-size: 60px; } }

.lp-hero__italic {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
  display: block;
  margin-top: 4px;
}

/* Sublinhado curvo amber embaixo do italic.
   Implementacao via `box-decoration-break: clone` + `display: inline`:
   garante que se o texto quebrar em multiplas linhas, CADA linha
   ganha seu proprio sublinhado. Versao anterior usava `::after`
   absolute que cobria so o bounding box inteiro e ficava bugada
   colando embaixo so da ultima linha em telas estreitas. */
.ass-hero__italic-underline {
  display: inline;
  /* padding-bottom controla a distancia texto -> linha. Valor minimo
     que ainda deixa descenders (p, q, y, f) sem serem cortados pela
     linha em Instrument Serif italic. */
  padding-bottom: 0.08em;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 10' preserveAspectRatio='none'><path d='M2 7 Q 50 1 100 5 T 198 6' stroke='%23D8881A' stroke-width='2.5' fill='none' stroke-linecap='round'/></svg>");
  background-repeat: no-repeat;
  background-position: left 100%;
  background-size: 100% 0.14em;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}

.lp-hero__subhead {
  font-size: 18px;
  line-height: 1.5;
  color: var(--brand-text);
  margin: 0;
  font-weight: 400;
}
.lp-hero__subhead strong {
  color: var(--brand-primary);
  font-weight: 600;
}
@media (min-width: 768px) { .lp-hero__subhead { font-size: 21px; } }

.lp-hero__lead {
  font-size: 15px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
  margin: 0;
  max-width: 540px;
}
@media (min-width: 768px) { .lp-hero__lead { font-size: 16px; } }

/* Big CTA (igual raio-x) */
.lp-hero__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  padding: 16px 28px;
  border-radius: 14px;
  border: 0;
  background: var(--brand-primary);
  color: #fff;
  font-family: var(--brand-font);
  font-size: 15.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  cursor: pointer;
  transition: transform 200ms, filter 200ms, box-shadow 200ms;
  box-shadow: 0 14px 32px -12px color-mix(in srgb, var(--brand-primary) 65%, transparent);
  white-space: nowrap;
  width: fit-content;
  max-width: 100%;
}
/* Em mobile apertado (<= 480px), encolhe padding e fonte pra evitar
   estouro horizontal em textos longos como "Pedir uma demo na minha
   marca". Permite wrap em 2 linhas como fallback se mesmo assim
   nao couber. */
@media (max-width: 480px) {
  .lp-hero__cta {
    padding: 14px 20px;
    font-size: 14.5px;
    white-space: normal;
    text-align: center;
    line-height: 1.25;
  }
}
.lp-hero__cta:hover {
  filter: brightness(0.94);
  transform: translateY(-1px);
  box-shadow: 0 18px 40px -12px color-mix(in srgb, var(--brand-primary) 75%, transparent);
}

.lp-hero__trust {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}
.lp-hero__trust li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.lp-hero__trust svg { color: var(--brand-positive, #10b981); }

/* ============ HERO DASHBOARD MOCK (.ass-dash + .ass-float) ============
   Substitui o mockup pequeno do raio-x. Aqui o objetivo e mostrar a
   PLATAFORMA como protagonista visual: header dark, grid 3x2 de cards,
   floats sobrepostos. Tudo CSS puro, sem images externas.

   Acessibilidade: todos os elementos do dashboard sao decorativos
   (aria-hidden ou role implicit), nao competem com o copy do hero
   pro screen reader. CTA e os trust badges seguem sendo os pontos
   acionaveis. */
.ass-hero__visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  /* Perspective declarado no parent (nao no item rotacionado) pra que
     o efeito 3D respeite a posicao do observador (centro da viewport).
     Valor alto (1800px) suaviza a deformacao, mais "premium" que valores
     baixos (~600px) que distorcem demais. */
  perspective: 1800px;
  perspective-origin: 50% 40%;
}

/* Wrapper que recebe o tilt 3D. Engloba dashboard + floats. Hover
   atenua o angulo, ideia de "ele endireita pra te mostrar melhor".
   Em mobile (<1024px) o tilt e desativado pra nao apertar o conteudo. */
.ass-hero__tilt {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-style: preserve-3d;
  transform: rotateY(0deg) rotateX(0deg);
  transition: transform 700ms cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: transform;
}
@media (min-width: 1024px) {
  .ass-hero__tilt {
    /* Tilt: leve rotacao no eixo Y (perspectiva editorial premium) +
       um toquinho no X (sensacao de "olhando de cima"). */
    transform: rotateY(-9deg) rotateX(3deg);
  }
  .ass-hero__tilt:hover {
    /* Hover suaviza pra quase frontal pra deixar o conteudo legivel
       quando o usuario engaja. */
    transform: rotateY(-3deg) rotateX(1deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ass-hero__tilt {
    transform: none !important;
    transition: none;
  }
}

.ass-dash {
  position: relative;
  width: 100%;
  /* Sem max-width — o mock ocupa todo o espaco da coluna do hero
     (que ja e ~1.4fr no grid desktop). */
  border-radius: 16px;
  background: #FFFFFF;
  border: 1px solid color-mix(in srgb, var(--brand-border) 55%, transparent);
  box-shadow:
    0 40px 90px -28px color-mix(in srgb, var(--brand-primary) 32%, transparent),
    0 18px 44px -16px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  font-size: 12px;
  line-height: 1.4;
  color: #0F1116;
}

/* ====== Browser chrome (mac-style top bar) ====== */
.ass-dash__chrome {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  background: #F4F4F5;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 55%, transparent);
}
.ass-dash__chrome-dots {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
.ass-dash__chrome-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.ass-dash__chrome-dots span:nth-child(1) { background: #ff5f57; }
.ass-dash__chrome-dots span:nth-child(2) { background: #febc2e; }
.ass-dash__chrome-dots span:nth-child(3) { background: #28c840; }
.ass-dash__addrbar {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  max-width: 280px;
  margin: 0 auto;
  padding: 4px 12px;
  border-radius: 6px;
  background: #FFFFFF;
  font-size: 11px;
  color: #71717A;
  border: 1px solid color-mix(in srgb, var(--brand-border) 45%, transparent);
}

/* ====== App da assessoria ====== */
.ass-dash__app {
  background: #FAFAFB;
}

/* Header preto da plataforma da assessoria */
.ass-dash__nav {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 18px;
  background: #0F1116;
  color: #FAFAFB;
}
.ass-dash__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.ass-dash__brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #FFFFFF;
  color: #0F1116;
  font-family: 'Instrument Serif', serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.ass-dash__brand-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}
.ass-dash__brand-name {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #FFFFFF;
}
.ass-dash__brand-sub {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.02em;
}

.ass-dash__menu {
  display: none;
  flex: 1;
  align-items: center;
  gap: 18px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
}
@media (min-width: 768px) {
  .ass-dash__menu { display: inline-flex; }
}
.ass-dash__menu span {
  position: relative;
  padding-bottom: 2px;
  cursor: default;
}
.ass-dash__menu span.is-active {
  color: var(--brand-primary);
}
.ass-dash__menu span.is-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -10px;
  height: 2px;
  background: var(--brand-primary);
}

.ass-dash__user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}
.ass-dash__bell {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
}
.ass-dash__bell-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand-primary);
  box-shadow: 0 0 0 2px #0F1116;
}
.ass-dash__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #71717A, #3F3F46);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #FFFFFF;
}

/* ====== Grid de cards 3x2 ====== */
.ass-dash__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  padding: 12px;
}
@media (min-width: 540px) {
  .ass-dash__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 768px) {
  .ass-dash__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    padding: 14px;
  }
}

.ass-dash__card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 12px 12px;
  border-radius: 10px;
  background: #FFFFFF;
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
}

.ass-dash__card-head {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 10.5px;
  font-weight: 600;
  color: #0F1116;
  letter-spacing: -0.005em;
}
.ass-dash__card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  flex-shrink: 0;
}
.ass-dash__card-title { flex: 1; }
.ass-dash__card-link {
  font-size: 9.5px;
  color: var(--brand-primary);
  font-weight: 500;
  letter-spacing: -0.005em;
  cursor: default;
}
.ass-dash__card-link--inline { margin-left: auto; }

/* =================================================================
 * MOCK CARROSSEL: 3 pages alternam dentro do dashboard.
 * - .ass-dash__pages: container que estabiliza altura entre transicoes
 * - .ass-mockfade-*: classes da Vue <Transition>
 * - .ass-dash__pager: dots embaixo do mock
 * ================================================================= */
.ass-dash__pages {
  position: relative;
  /* Estabiliza altura, a maior page (Painel com 6 cards 3x2) define
     o piso; outras pages crescem pra dentro desse box. Evita layout
     shift do hero quando troca page. Mobile: piso menor pra nao
     dominar a viewport (eram 500px ~= 80% da altura util). */
  min-height: 380px;
}
@media (min-width: 768px) {
  .ass-dash__pages { min-height: 540px; }
}

/* ====== Compactacao mobile do mock ======
   Em <= 640px, encolhe chrome, nav e elementos internos. O bloco
   .ass-dash__pages e cortado em max-height fixo + fade gradient pro
   conteudo interno (Painel/Asset/Chat) que naturalmente expande em
   coluna estreita nao dominar a viewport. Resultado: mock total cai
   de ~658px (era ~80% viewport) pra ~430px (~50% viewport). */
@media (max-width: 640px) {
  .ass-dash__chrome { padding: 7px 10px; gap: 10px; }
  .ass-dash__chrome-dots span { width: 8px; height: 8px; }
  .ass-dash__chrome-dots { gap: 5px; }
  .ass-dash__addrbar { max-width: 200px; padding: 3px 10px; font-size: 10px; }
  .ass-dash__nav { padding: 9px 14px; gap: 12px; }
  .ass-dash__brand-mark { width: 26px; height: 26px; font-size: 12px; border-radius: 5px; }
  .ass-dash__brand-name { font-size: 10px; }
  .ass-dash__brand-sub { font-size: 8.5px; }
  .ass-dash__pages {
    min-height: 340px;
    max-height: 340px;
    overflow: hidden;
    -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 78%, transparent 100%);
    mask-image: linear-gradient(to bottom, #000 0%, #000 78%, transparent 100%);
  }
}

.ass-mockfade-enter-active,
.ass-mockfade-leave-active {
  transition: opacity 360ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 360ms cubic-bezier(0.4, 0, 0.2, 1);
}
.ass-mockfade-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.995);
}
.ass-mockfade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.995);
}

/* ============ LOADING SCREEN entre transicoes ============
   "SUA MARCA" + spinner amber + frase contextual da page de destino.
   Aparece por ~950ms, depois a page nova faz fade-in por baixo.
   Reforca a ideia central da landing: a plataforma e branded como
   sua marca, em todos os contextos. */
.ass-dash__loading {
  position: absolute;
  inset: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    180deg,
    #FFFFFF 0%,
    color-mix(in srgb, var(--brand-primary) 6%, #FFFFFF) 100%
  );
  /* Glow amber sutil de fundo */
  background-image:
    radial-gradient(ellipse 70% 50% at 50% 50%,
      color-mix(in srgb, var(--brand-primary) 14%, transparent),
      transparent 60%),
    linear-gradient(180deg, #FFFFFF, color-mix(in srgb, var(--brand-primary) 5%, #FFFFFF));
}

.ass-loading-fade-enter-active {
  transition: opacity 240ms ease-out;
}
.ass-loading-fade-leave-active {
  transition: opacity 320ms ease-in;
}
.ass-loading-fade-enter-from,
.ass-loading-fade-leave-to {
  opacity: 0;
}

.ass-dash__loading-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
}

.ass-dash__loading-mark {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
}
.ass-dash__loading-mark-text {
  position: relative;
  z-index: 2;
  font-family: 'Instrument Serif', serif;
  font-size: 22px;
  font-weight: 600;
  color: #0F1116;
  letter-spacing: -0.02em;
}
.ass-dash__loading-spinner {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2.5px solid color-mix(in srgb, var(--brand-primary) 18%, transparent);
  border-top-color: var(--brand-primary);
  animation: ass-loading-spin 720ms linear infinite;
}
@keyframes ass-loading-spin {
  to { transform: rotate(360deg); }
}

.ass-dash__loading-brand {
  margin: 0;
  font-family: 'Instrument Serif', serif;
  font-size: 32px;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
  letter-spacing: -0.02em;
  line-height: 1;
}
@media (min-width: 768px) {
  .ass-dash__loading-brand { font-size: 38px; }
}

.ass-dash__loading-phrase {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #3F3F46;
  text-align: center;
  letter-spacing: -0.005em;
  /* Fade-in da frase, separado da fade do overlay, pra dar
     "vida" mesmo se a frase mudar entre dois loadings. */
  animation: ass-loading-phrase-in 460ms cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes ass-loading-phrase-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .ass-mockfade-enter-active,
  .ass-mockfade-leave-active,
  .ass-loading-fade-enter-active,
  .ass-loading-fade-leave-active { transition: none; }
  .ass-dash__loading-spinner,
  .ass-dash__loading-phrase { animation: none; }
}

/* Page Painel: padding lateral pra o breadcrumb e header da page nao
   ficarem colados na borda do mock. O `.ass-dash__grid` ja tem padding
   proprio, entao zero o lateral dele aqui pra nao dobrar (continuaria
   funcionando independente nas outras pages). */
.ass-painel {
  padding: 14px 16px 0;
}
.ass-painel .ass-dash__grid {
  padding-left: 0;
  padding-right: 0;
  padding-top: 14px;
}
@media (min-width: 768px) {
  .ass-painel { padding: 16px 20px 0; }
  .ass-painel .ass-dash__grid { padding-top: 16px; }
}

/* Pager dots embaixo do dashboard */
.ass-dash__pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 16px 14px;
  background: #FAFAFB;
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
}
.ass-dash__pager-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  font-family: var(--brand-font);
  font-size: 10.5px;
  font-weight: 500;
  color: #71717A;
  cursor: pointer;
  transition: all 200ms;
}
.ass-dash__pager-dot::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #D4D4D8;
  transition: background 200ms;
}
.ass-dash__pager-dot:hover {
  color: #0F1116;
}
.ass-dash__pager-dot:hover::before {
  background: #71717A;
}
.ass-dash__pager-dot.is-active {
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 28%, transparent);
  color: var(--brand-primary);
}
.ass-dash__pager-dot.is-active::before {
  background: var(--brand-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

/* =================================================================
 * MOCK INTERNO: page de chat IA (estilo /help, perplexity-like).
 * Header da conversa + thread (msg user + msg AI com sources) +
 * sugestoes de follow-up + input bar.
 * ================================================================= */
.ass-chat {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
@media (min-width: 768px) {
  .ass-chat { padding: 16px 20px 20px; }
}

.ass-chat__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
}
.ass-chat__title {
  margin: 0;
  font-family: 'Instrument Serif', serif;
  font-size: 18px;
  font-weight: 400;
  color: #0F1116;
  letter-spacing: -0.02em;
  line-height: 1.15;
}
.ass-chat__sub {
  margin: 2px 0 0;
  font-size: 10px;
  color: #71717A;
}
.ass-chat__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 28%, transparent);
  font-size: 10px;
  font-weight: 600;
  color: var(--brand-primary);
  white-space: nowrap;
}
.ass-chat__badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand-primary);
  animation: lp-eyebrow-pulse 2.4s ease-in-out infinite;
}

.ass-chat__thread {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0 6px;
}

.ass-chat__msg {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.ass-chat__msg--user { flex-direction: row-reverse; }
.ass-chat__msg-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-family: 'Instrument Serif', serif;
  font-size: 13px;
  font-weight: 600;
  color: #FFFFFF;
  flex-shrink: 0;
}
.ass-chat__msg-avatar--user {
  background: linear-gradient(135deg, #71717A, #3F3F46);
}
.ass-chat__msg-avatar--ai {
  background: linear-gradient(135deg, var(--brand-primary), color-mix(in srgb, var(--brand-primary) 70%, #B85F0A));
}

.ass-chat__msg-bubble {
  padding: 10px 13px;
  border-radius: 12px 12px 12px 4px;
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  font-size: 11px;
  line-height: 1.5;
  color: #0F1116;
  max-width: 78%;
}
.ass-chat__msg--user .ass-chat__msg-bubble {
  border-radius: 12px 12px 4px 12px;
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 24%, transparent);
}
.ass-chat__msg-bubble--ai {
  background: #FFFFFF;
  border: 1px solid color-mix(in srgb, var(--brand-border) 55%, transparent);
  max-width: 92%;
  padding: 12px 14px;
}
.ass-chat__msg-bubble p {
  margin: 0;
  font-size: 11px;
  line-height: 1.55;
  color: #0F1116;
}
.ass-chat__msg-bubble p strong {
  color: #0F1116;
  font-weight: 600;
}
.ass-chat__msg-bubble p + p { margin-top: 6px; }

.ass-chat__bullets {
  list-style: none;
  margin: 8px 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.ass-chat__bullets li {
  position: relative;
  padding-left: 12px;
  font-size: 10.5px;
  line-height: 1.5;
  color: #3F3F46;
}
.ass-chat__bullets li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 7px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--brand-primary);
}
.ass-chat__bullets li strong { color: #0F1116; font-weight: 600; }

.ass-chat__sumline {
  margin-top: 10px !important;
  padding: 8px 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border-left: 3px solid var(--brand-primary);
  font-size: 10.5px !important;
  font-style: italic;
}

.ass-chat__sources {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed color-mix(in srgb, var(--brand-border) 55%, transparent);
}
.ass-chat__sources-label {
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #71717A;
  margin-right: 2px;
}
.ass-chat__source {
  display: inline-flex;
  padding: 2px 7px;
  border-radius: 5px;
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
  font-size: 9.5px;
  color: #3F3F46;
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
}

.ass-chat__sugs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 6px 0 0 38px; /* alinha com a bubble da AI */
}
.ass-chat__sugs-label {
  font-size: 9.5px;
  color: #71717A;
  font-weight: 500;
  margin-right: 2px;
}
.ass-chat__sug {
  padding: 5px 11px;
  border-radius: 999px;
  background: #FFFFFF;
  border: 1px solid color-mix(in srgb, var(--brand-border) 55%, transparent);
  font-family: var(--brand-font);
  font-size: 10px;
  font-weight: 500;
  color: var(--brand-primary);
  cursor: default;
  transition: all 180ms;
}
.ass-chat__sug:hover {
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 32%, transparent);
}

.ass-chat__input {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding: 9px 11px 9px 13px;
  border-radius: 12px;
  background: #FFFFFF;
  border: 1px solid color-mix(in srgb, var(--brand-border) 60%, transparent);
  box-shadow: 0 4px 14px -6px rgba(0, 0, 0, 0.08);
}
.ass-chat__input-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ass-chat__input-placeholder {
  flex: 1;
  font-size: 11px;
  color: #A1A1AA;
  display: inline-flex;
  align-items: center;
  min-height: 14px;
}
/* Quando ta digitando, texto fica com cor do user (nao mais placeholder). */
.ass-chat__input-placeholder.is-typing {
  color: #0F1116;
}

/* Caret pulsante amber depois do texto digitado */
.ass-chat__input-caret {
  display: inline-block;
  width: 1.5px;
  height: 12px;
  margin-left: 2px;
  background: var(--brand-primary);
  animation: ass-chat-caret 600ms steps(2) infinite;
  vertical-align: middle;
}
@keyframes ass-chat-caret {
  50% { opacity: 0; }
}

.ass-chat__input-send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  flex-shrink: 0;
  opacity: 0.45;
  transition: opacity 200ms, transform 200ms;
}
/* Quando user "digitou algo" o botao send fica vivo (opacity 1 + leve scale) */
.ass-chat__input-send.is-ready {
  opacity: 1;
  transform: scale(1.06);
}

/* ============ ANIMACOES INTERNAS DO MOCK ============
   Disparam quando a page corresponde monta dentro do <Transition>.
   Cada bubble do chat e o card de relatorio do painel ganham vida
   propria, evitando que o mock pareca um screenshot estatico. */

/* Bubble do chat aparecendo: slide-up + fade. Aplicado em
   user msg, AI typing e AI response. */
.ass-chat__msg--enter {
  animation: ass-chat-msg-in 360ms cubic-bezier(0.22, 0.61, 0.36, 1) backwards;
}
@keyframes ass-chat-msg-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Typing dots da IA: 3 bolinhas pulsando alternadas */
.ass-chat__typing {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 11px 14px;
  border-radius: 12px 12px 12px 4px;
  background: #FFFFFF;
  border: 1px solid color-mix(in srgb, var(--brand-border) 55%, transparent);
}
.ass-chat__typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--brand-text) 30%, transparent);
  animation: ass-chat-typing-bounce 1.2s ease-in-out infinite;
}
.ass-chat__typing span:nth-child(2) { animation-delay: 0.15s; }
.ass-chat__typing span:nth-child(3) { animation-delay: 0.30s; }
@keyframes ass-chat-typing-bounce {
  0%, 60%, 100% { opacity: 0.35; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-4px); }
}

@media (prefers-reduced-motion: reduce) {
  .ass-chat__msg--enter,
  .ass-chat__input-caret,
  .ass-chat__typing span { animation: none; }
}

/* =================================================================
 * CARTA EDITORIAL (.ass-letter*) — versao miniatura
 * Aparece DENTRO da page do Painel, abaixo do grid de cards. Escala
 * compativel com o resto do dashboard mock (font 9-14px). Sobe de
 * baixo pra cima quando o Painel monta no carrossel.
 * Reforca a metafora "experiencia editorial premium pro cliente".
 * ================================================================= */
.ass-letter {
  position: relative;
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  padding: 18px 22px;
  border-radius: 4px;
  background:
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.012) 0,
      rgba(0, 0, 0, 0.012) 1px,
      transparent 1px,
      transparent 4px
    ),
    linear-gradient(180deg, #fdfaf2 0%, #f7f1e3 100%);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.06),
    0 16px 32px -12px rgba(0, 0, 0, 0.18),
    0 0 0 1px color-mix(in srgb, var(--brand-primary) 22%, transparent),
    inset 0 0 60px -20px rgba(170, 130, 60, 0.10);
  font-family: 'Cormorant Garamond', 'Garamond', 'Georgia', serif;
  color: #2b2419;
  overflow: hidden;
  transform: rotate(-0.3deg);
  /* Corta a carta antes do fim pra nao alongar muito o mock vertical.
     Visual de "tem mais embaixo, voce so esta vendo a primeira parte",
     coerente com o feel "preview do produto" do mock. */
  max-height: 230px;
  /* Fade-out gradiente no rodape via mask, escondendo o corte abrupto.
     Aceleração da animação roda igual (so altera o que e visivel). */
  -webkit-mask-image: linear-gradient(180deg,
    #000 0%, #000 70%, transparent 100%);
  mask-image: linear-gradient(180deg,
    #000 0%, #000 70%, transparent 100%);
  /* Animação slide-up disparada no mount (toda vez que a page Painel
     volta a ser ativa no carrossel, o DOM e recriado e roda de novo). */
  animation: ass-letter-rise 700ms cubic-bezier(0.22, 0.61, 0.36, 1) 320ms backwards;
}

/* Watermark gigante SUA MARCA atras do conteudo */
.ass-letter__watermark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  font-weight: 300;
  color: rgba(170, 130, 60, 0.05);
  letter-spacing: 0.08em;
  pointer-events: none;
  user-select: none;
  z-index: 0;
  white-space: nowrap;
}

/* Header: edicao | monograma | data */
.ass-letter__head {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(170, 130, 60, 0.22);
  position: relative;
  z-index: 1;
}
.ass-letter__edition {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(43, 36, 25, 0.65);
}
.ass-letter__monogram {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #2b2419;
  color: #fdfaf2;
  font-family: 'Cormorant Garamond', serif;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.ass-letter__date {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 9px;
  color: rgba(43, 36, 25, 0.6);
  text-align: right;
  font-style: italic;
}

/* Salutation italic + serif */
.ass-letter__salut {
  margin: 12px 0 6px;
  font-size: 14px;
  font-style: italic;
  color: #2b2419;
  position: relative;
  z-index: 1;
}
.ass-letter__salut em {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-weight: 600;
  color: var(--brand-primary);
}

/* Corpo da carta */
.ass-letter__body {
  margin: 0 0 10px;
  font-size: 11.5px;
  line-height: 1.6;
  color: #2b2419;
  position: relative;
  z-index: 1;
}
.ass-letter__body strong { font-weight: 600; }
.ass-letter__body em { font-style: italic; color: rgba(43, 36, 25, 0.85); }
.ass-letter__hl {
  color: #1f6b32;
  font-weight: 700;
}

/* Stats row inline */
.ass-letter__stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 10px;
  margin: 10px 0;
  padding: 10px 0;
  border-top: 1px solid rgba(170, 130, 60, 0.22);
  border-bottom: 1px solid rgba(170, 130, 60, 0.22);
  position: relative;
  z-index: 1;
}
.ass-letter__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  text-align: center;
}
.ass-letter__stat-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 1;
  color: #2b2419;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}
.ass-letter__stat-value--small { font-size: 14px; }
.ass-letter__stat-pct {
  font-size: 10px;
  font-weight: 500;
  margin-left: 1px;
}
.ass-letter__stat-label {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 7.5px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(43, 36, 25, 0.55);
}
.ass-letter__stat--divider {
  width: 1px;
  height: 20px;
  background: rgba(170, 130, 60, 0.3);
}

/* Régua ornamental com flor */
.ass-letter__rule {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 10px 0 8px;
  position: relative;
  z-index: 1;
}
.ass-letter__rule::before,
.ass-letter__rule::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(170, 130, 60, 0.4),
    transparent
  );
}
.ass-letter__rule-orn {
  font-size: 11px;
  color: var(--brand-primary);
  opacity: 0.7;
}

/* Footer: closing + signature */
.ass-letter__foot {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  position: relative;
  z-index: 1;
}
.ass-letter__closing {
  margin: 0;
  font-size: 10.5px;
  font-style: italic;
  color: rgba(43, 36, 25, 0.7);
}
.ass-letter__signature {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  font-weight: 500;
  font-style: italic;
  color: #2b2419;
  line-height: 1;
  letter-spacing: -0.01em;
  transform: skew(-5deg);
  transform-origin: bottom right;
}

@keyframes ass-letter-rise {
  0%   { opacity: 0; transform: translateY(60px) rotate(-1.2deg); }
  60%  { opacity: 1; }
  100% { opacity: 1; transform: translateY(0) rotate(-0.3deg); }
}

@media (prefers-reduced-motion: reduce) {
  .ass-letter { animation: none; }
}

/* =================================================================
 * MOCK INTERNO: page de asset (/asset/petr4 estilo).
 * Reproduz a estrutura real do app: hero ticker + chart + cards.
 * Tudo em escala reduzida (font 9-12px) pra caber no preview.
 * ================================================================= */
.ass-asset {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
@media (min-width: 768px) {
  .ass-asset { padding: 16px 20px 20px; }
}

.ass-asset__crumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: #71717A;
  font-weight: 500;
}
.ass-asset__crumb .is-current {
  color: var(--brand-primary);
  font-weight: 600;
}
.ass-asset__crumb-sep {
  color: #D4D4D8;
}

/* Hero do asset: logo + identificacao | preco grande */
.ass-asset__hero {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
}

.ass-asset__id {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.ass-asset__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #007D3F, #00B85C);
  color: #FFFFFF;
  font-family: 'Instrument Serif', serif;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.02em;
  flex-shrink: 0;
  box-shadow: 0 6px 16px -6px rgba(0, 125, 63, 0.4);
}
.ass-asset__ident {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.ass-asset__ticker {
  font-family: 'Instrument Serif', serif;
  font-size: 26px;
  font-weight: 400;
  color: #0F1116;
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1;
}
.ass-asset__name {
  font-size: 11px;
  font-weight: 600;
  color: #3F3F46;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
}
.ass-asset__sector {
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #A1A1AA;
  margin: 1px 0 0;
}

.ass-asset__price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.ass-asset__price-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.ass-asset__price-currency {
  font-size: 12px;
  color: #71717A;
  font-variant-numeric: tabular-nums;
}
.ass-asset__price-value {
  font-size: 32px;
  font-weight: 300;
  color: #0F1116;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.ass-asset__price-foot {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ass-asset__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.ass-asset__chip--neg {
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 14%, transparent);
  color: var(--brand-negative, #dc2626);
}
.ass-asset__chip--pos {
  background: color-mix(in srgb, var(--brand-positive, #10b981) 14%, transparent);
  color: var(--brand-positive, #10b981);
}
.ass-asset__price-when {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #A1A1AA;
}

/* Stats row 6 colunas */
.ass-asset__stats {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
}
.ass-asset__stats > div {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.ass-asset__stats span {
  font-size: 8.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #A1A1AA;
}
.ass-asset__stats strong {
  font-size: 11.5px;
  font-weight: 600;
  color: #0F1116;
  font-variant-numeric: tabular-nums;
}
.ass-asset__stats strong.is-pos { color: var(--brand-positive, #10b981); }
.ass-asset__stats strong.is-neg { color: var(--brand-negative, #dc2626); }

/* Chart */
.ass-asset__chart {
  padding-bottom: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
}
.ass-asset__chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.ass-asset__chart-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #71717A;
}
.ass-asset__chart-range {
  display: flex;
  gap: 2px;
  padding: 2px;
  border-radius: 6px;
  background: #F4F4F5;
}
.ass-asset__chart-range span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
  color: #71717A;
  cursor: default;
}
.ass-asset__chart-range span.is-active {
  background: #FFFFFF;
  color: var(--brand-primary);
  box-shadow: 0 1px 3px -1px rgba(0, 0, 0, 0.1);
}
.ass-asset__chart-svg {
  width: 100%;
  height: 140px;
  display: block;
}
@media (min-width: 768px) {
  .ass-asset__chart-svg { height: 170px; }
}

/* Linha de cards */
.ass-asset__row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
@media (min-width: 540px) {
  .ass-asset__row { grid-template-columns: 1.4fr 1fr 1.2fr; }
}

.ass-asset__card {
  padding: 12px;
  border-radius: 10px;
  background: #FAFAFB;
  border: 1px solid color-mix(in srgb, var(--brand-border) 45%, transparent);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ass-asset__card--ai {
  background: color-mix(in srgb, var(--brand-primary) 5%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 24%, transparent);
}
.ass-asset__card-head {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 10px;
  font-weight: 600;
  color: #0F1116;
}
.ass-asset__card-title { letter-spacing: -0.005em; }

.ass-asset__ai-text {
  margin: 0;
  font-size: 10.5px;
  line-height: 1.55;
  color: #3F3F46;
}
.ass-asset__ai-text strong { color: #0F1116; font-weight: 600; }
.ass-asset__ai-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 2px;
}
.ass-asset__ai-tags span {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.7);
  font-size: 9px;
  font-weight: 600;
  color: var(--brand-primary);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 28%, transparent);
}

.ass-asset__divs {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ass-asset__divs li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  border-radius: 5px;
  background: #FFFFFF;
  font-size: 10px;
  color: #71717A;
  border: 1px solid color-mix(in srgb, var(--brand-border) 45%, transparent);
  font-variant-numeric: tabular-nums;
}
.ass-asset__divs li strong {
  font-weight: 600;
  font-size: 10.5px;
  color: #0F1116;
}
.ass-asset__divs li strong.is-pos { color: var(--brand-positive, #10b981); }
.ass-asset__divs-foot {
  margin: 4px 0 0;
  padding-top: 6px;
  border-top: 1px dashed color-mix(in srgb, var(--brand-border) 55%, transparent);
  font-size: 9.5px;
  color: #71717A;
}
.ass-asset__divs-foot strong { color: #0F1116; font-weight: 600; }

.ass-asset__news {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.ass-asset__news li {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 10px;
  line-height: 1.4;
  color: #3F3F46;
}
.ass-asset__news-time {
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--brand-primary);
}

/* ============ ESTILOS LEGACY DO MOCK ANTERIOR (donut/movers/AI chat/etc)
   Mantidos pra evitar quebra se o mock anterior voltar via toggle
   futuro. Se for confirmar permanencia da page de asset, da pra
   apagar tudo daqui pra baixo desse bloco em uma proxima limpeza. */
.ass-dash__donut-wrap {
  display: grid;
  grid-template-columns: 76px 1fr;
  gap: 12px;
  align-items: center;
  padding-top: 4px;
}
.ass-dash__donut {
  position: relative;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: conic-gradient(
    #D8881A 0% 42%,
    #3B82F6 42% 60%,
    #10B981 60% 88%,
    #9CA3AF 88% 96%,
    #D1D5DB 96% 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
}
.ass-dash__donut::before {
  content: '';
  position: absolute;
  inset: 14px;
  background: #FFFFFF;
  border-radius: 50%;
}
.ass-dash__donut-center {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  line-height: 1.1;
  padding: 0 4px;
}
.ass-dash__donut-label {
  font-size: 6px;
  color: #71717A;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.ass-dash__donut-value {
  font-size: 8.5px;
  font-weight: 700;
  color: #0F1116;
  font-variant-numeric: tabular-nums;
  margin-top: 1px;
}
.ass-dash__donut-delta {
  font-size: 6.5px;
  font-weight: 600;
  color: var(--brand-negative, #dc2626);
  font-variant-numeric: tabular-nums;
  margin-top: 1px;
}

.ass-dash__legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 9.5px;
  color: #3F3F46;
}
.ass-dash__legend li {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ass-dash__legend em {
  margin-left: auto;
  font-style: normal;
  font-weight: 600;
  color: #0F1116;
  font-variant-numeric: tabular-nums;
}
.ass-dash__legend-dot {
  width: 7px;
  height: 7px;
  border-radius: 2px;
  flex-shrink: 0;
}

/* ====== Card 2: Movers ====== */
.ass-dash__movers {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.ass-dash__movers li {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 10.5px;
  color: #3F3F46;
}
.ass-dash__mover-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.ass-dash__mover-label { flex: 1; }
.ass-dash__mover-label strong { color: #0F1116; font-weight: 600; }
.ass-dash__mover-pct {
  font-size: 10px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
.ass-dash__mover-pct--neg { color: var(--brand-negative, #dc2626); }
.ass-dash__mover-pct--pos { color: var(--brand-positive, #10b981); }
.ass-dash__movers-foot {
  margin: 6px 0 0;
  padding-top: 7px;
  border-top: 1px dashed color-mix(in srgb, var(--brand-border) 55%, transparent);
  font-size: 9.5px;
  color: #71717A;
  font-variant-numeric: tabular-nums;
}

/* ====== Card 3: AI Chat ====== */
.ass-dash__ai-greet {
  margin: 0;
  font-size: 10.5px;
  color: #0F1116;
  font-weight: 500;
}
.ass-dash__ai-greet em {
  font-style: normal;
  color: #71717A;
  font-weight: 400;
}
.ass-dash__ai-bubble {
  position: relative;
  padding: 9px 11px;
  border-radius: 10px 10px 10px 2px;
  background: color-mix(in srgb, var(--brand-primary) 9%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 24%, transparent);
  font-size: 10px;
  line-height: 1.45;
  color: #0F1116;
}
.ass-dash__ai-cursor {
  position: absolute;
  right: 8px;
  bottom: 6px;
  font-size: 9px;
  color: var(--brand-primary);
}
.ass-dash__ai-suglabel {
  margin: 4px 0 0;
  font-size: 9px;
  color: #71717A;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.ass-dash__ai-sugs {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.ass-dash__ai-sugs span {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 6px;
  background: #F4F4F5;
  font-size: 9.5px;
  color: #3F3F46;
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
}

/* ====== Card 4: Report ====== */
.ass-dash__report-meta {
  margin: 0;
  font-size: 10px;
  font-weight: 500;
  color: #0F1116;
}
.ass-dash__report-body {
  margin: 0;
  font-size: 9.5px;
  color: #71717A;
  line-height: 1.45;
}
.ass-dash__report-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}
.ass-dash__btn {
  padding: 6px 11px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  font-size: 9.5px;
  font-weight: 600;
  border: 0;
  cursor: default;
}
.ass-dash__report-thumb {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  padding: 6px 8px;
  border-radius: 5px;
  background: #F4F4F5;
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
}
.ass-dash__report-thumb-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background: #0F1116;
  color: #FFFFFF;
  font-family: 'Instrument Serif', serif;
  font-size: 8px;
  font-weight: 600;
}
.ass-dash__report-thumb-lines {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ass-dash__report-thumb-lines span {
  display: block;
  width: 32px;
  height: 2px;
  border-radius: 1px;
  background: #D4D4D8;
}
.ass-dash__report-thumb-lines span:nth-child(2) { width: 26px; }
.ass-dash__report-thumb-lines span:nth-child(3) { width: 30px; }
.ass-dash__report-thumb-lines span:nth-child(4) { width: 22px; }

/* ====== Card 5: Insights ====== */
.ass-dash__insights {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ass-dash__insights li {
  position: relative;
  padding-left: 11px;
  font-size: 10px;
  line-height: 1.4;
  color: #3F3F46;
}
.ass-dash__insights li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 5px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--brand-primary);
}
.ass-dash__insights li strong { color: #0F1116; font-weight: 600; }

/* ====== Card 6: Alerts ====== */
.ass-dash__alert {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border-radius: 7px;
  font-size: 10px;
  color: #3F3F46;
}
.ass-dash__alert--warn {
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-negative, #dc2626) 22%, transparent);
}
.ass-dash__alert--ok {
  background: color-mix(in srgb, var(--brand-positive, #10b981) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-positive, #10b981) 22%, transparent);
}
.ass-dash__alert-tag {
  display: inline-flex;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  flex-shrink: 0;
}
.ass-dash__alert--warn .ass-dash__alert-tag {
  background: rgba(255, 255, 255, 0.7);
  color: var(--brand-negative, #dc2626);
}
.ass-dash__alert--ok .ass-dash__alert-tag {
  background: rgba(255, 255, 255, 0.7);
  color: var(--brand-positive, #10b981);
}

/* ============ FLOATS sobrepostos ao dashboard ============ */
.ass-float {
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 14px;
  background: #FFFFFF;
  border: 1px solid color-mix(in srgb, var(--brand-border) 55%, transparent);
  box-shadow:
    0 16px 40px -14px rgba(0, 0, 0, 0.16),
    0 6px 18px -8px rgba(0, 0, 0, 0.10);
  font-size: 11px;
  line-height: 1.3;
  color: #0F1116;
  white-space: nowrap;
  animation: ass-float-in 700ms cubic-bezier(0.22, 0.61, 0.36, 1) backwards;
  /* Transition do transform pra animar entre os translateZ default <->
     hover suavemente. Mesma duracao do .ass-hero__tilt pra sincronizar. */
  transition: transform 700ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
@keyframes ass-float-in {
  from { opacity: 0; transform: translateY(10px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}

/* Float "Performance no dia" — top right do mock.
   translateZ positivo o tira do plano do dashboard pra frente, dando
   profundidade real ao efeito 3D. So aplica em desktop pq mobile nao
   tem tilt. */
.ass-float--perf {
  top: -22px;
  right: -10px;
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
  padding: 12px 16px;
  animation-delay: 600ms;
}
@media (min-width: 1024px) {
  .ass-float--perf { transform: translateZ(60px); }
  .ass-hero__tilt:hover .ass-float--perf { transform: translateZ(40px); }
}
.ass-float__head {
  font-size: 9.5px;
  font-weight: 600;
  color: #71717A;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.ass-float__row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.ass-float__col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.ass-float__num {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.025em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.ass-float__sub {
  font-size: 9.5px;
  color: #71717A;
  font-variant-numeric: tabular-nums;
  margin-top: 2px;
}
.ass-float__spark {
  width: 70px;
  height: 32px;
  flex-shrink: 0;
}

/* Float "Clientes ativos" — bottom left do mock */
.ass-float--clients {
  bottom: -18px;
  left: -10px;
  animation-delay: 850ms;
}
@media (min-width: 1024px) {
  .ass-float--clients { transform: translateZ(50px); }
  .ass-hero__tilt:hover .ass-float--clients { transform: translateZ(30px); }
}
.ass-float__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
}
.ass-float__big {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #0F1116;
  letter-spacing: -0.015em;
  font-variant-numeric: tabular-nums;
  line-height: 1.05;
}
.ass-float__big em {
  font-style: normal;
  font-size: 10.5px;
  font-weight: 500;
  color: var(--brand-positive, #10b981);
  margin-left: 4px;
}

/* Float "Plataforma com sua marca" — bottom right do mock */
.ass-float--brand {
  bottom: -28px;
  right: -10px;
  max-width: 270px;
  white-space: normal;
  align-items: flex-start;
  animation-delay: 1100ms;
}
@media (min-width: 1024px) {
  .ass-float--brand { transform: translateZ(70px); }
  .ass-hero__tilt:hover .ass-float--brand { transform: translateZ(50px); }
}
.ass-float__title {
  display: block;
  font-size: 11.5px;
  font-weight: 600;
  color: #0F1116;
  letter-spacing: -0.005em;
  margin-bottom: 2px;
}
.ass-float--brand .ass-float__sub {
  white-space: normal;
  font-size: 9.5px;
  line-height: 1.4;
}

@media (max-width: 1023px) {
  /* Em mobile, recolhe os floats pra dentro do card e diminui um pouco
     pra nao cortar nas bordas. */
  .ass-float--perf  { top: 6px;     right: 6px; }
  .ass-float--clients { bottom: 6px; left: 6px; }
  .ass-float--brand { display: none; }
}

/* =================================================================
 * 1.5. PREVIEWS REAIS, iframes de tenants em producao
 * Posicionada logo abaixo do hero. 3 cards com:
 *   - badge (Preview/Demo)
 *   - header com logo + nome + tagline + icone external
 *   - iframe scaled da home do tenant
 *   - features (3 checks)
 *   - CTA outline amber
 * Embaixo: faixa horizontal de 4 trust + CTA primary lead.
 * ================================================================= */
.ass-previews {
  position: relative;
  padding: 80px 0 96px;
  background: color-mix(in srgb, var(--brand-surface) 30%, var(--brand-background));
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
}
@media (min-width: 768px) {
  .ass-previews { padding: 96px 0 112px; }
}

/* Header centralizado: eyebrow + headline + lead + hint, todos centrados */
.ass-previews__head {
  text-align: center;
  margin: 0 auto 36px;
  max-width: 720px;
}
.ass-previews__head .lp-section-title { text-align: center; }

.ass-previews__lead {
  margin: 18px auto 0;
  max-width: 580px;
  font-size: 16px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
}

.ass-previews__hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 18px auto 0;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--brand-primary);
}
.ass-previews__hint svg { flex-shrink: 0; }

.ass-previews__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  margin-top: 36px;
}
@media (min-width: 768px) {
  .ass-previews__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 22px;
  }
}
@media (min-width: 1100px) {
  .ass-previews__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 22px;
  }
}

.ass-preview__card {
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 55%, transparent);
  box-shadow: 0 14px 36px -16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 280ms cubic-bezier(0.22, 0.61, 0.36, 1),
              box-shadow 280ms cubic-bezier(0.22, 0.61, 0.36, 1),
              border-color 280ms;
}
.ass-preview__card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--brand-primary) 35%, transparent);
  box-shadow: 0 24px 52px -16px color-mix(in srgb, var(--brand-primary) 22%, transparent),
              0 8px 22px -10px rgba(0, 0, 0, 0.10);
}

.ass-preview__head {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 18px 20px 16px;
  text-decoration: none;
  color: inherit;
}

.ass-preview__badge {
  position: absolute;
  top: 16px;
  right: 16px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.ass-preview__badge--preview {
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: var(--brand-primary);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 28%, transparent);
}
.ass-preview__badge--demo {
  background: color-mix(in srgb, var(--brand-positive, #10b981) 14%, transparent);
  color: var(--brand-positive, #10b981);
  border: 1px solid color-mix(in srgb, var(--brand-positive, #10b981) 28%, transparent);
}

.ass-preview__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
}
.ass-preview__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}
.ass-preview__id {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.ass-preview__name {
  font-size: 16px;
  font-weight: 600;
  color: #0F1116;
  letter-spacing: -0.01em;
}
.ass-preview__tag {
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.ass-preview__ext {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--brand-primary) 10%, transparent);
  color: var(--brand-primary);
  flex-shrink: 0;
  transition: all 200ms;
}
.ass-preview__card:hover .ass-preview__ext {
  background: var(--brand-primary);
  color: #FFFFFF;
  transform: rotate(-8deg);
}

/* Iframe scaled. O iframe renderiza em 1280x800 e e escalado pra
   caber no card (que muda com breakpoint). Pointer-events none pra
   nao permitir interacao acidental, o CTA e o que abre. */
.ass-preview__frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: linear-gradient(180deg, #F4F4F5 0%, #FAFAFB 100%);
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
}
.ass-preview__iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 1280px;
  height: 800px;
  border: 0;
  pointer-events: none;
  transform-origin: top left;
  /* Default mobile/tablet (col larga ~600-700px): scale ~0.45-0.55 */
  transform: scale(0.5);
}
@media (min-width: 768px) {
  /* 2 cols no tablet, col ~ 360-420px */
  .ass-preview__iframe { transform: scale(0.34); }
}
@media (min-width: 1100px) {
  /* 3 cols, col ~ 340-380px */
  .ass-preview__iframe { transform: scale(0.30); }
}
@media (min-width: 1280px) {
  /* col ~ 400-450px */
  .ass-preview__iframe { transform: scale(0.34); }
}
@media (min-width: 1500px) {
  /* col ~ 470-520px */
  .ass-preview__iframe { transform: scale(0.40); }
}
.ass-preview__frame-fade {
  position: absolute;
  inset: auto 0 0 0;
  height: 60px;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.7));
  pointer-events: none;
}

.ass-preview__features {
  list-style: none;
  margin: 0;
  padding: 16px 20px 4px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.ass-preview__features li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
}
.ass-preview__features svg { flex-shrink: 0; }

.ass-preview__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 12px 20px 18px;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1.5px solid color-mix(in srgb, var(--brand-primary) 32%, transparent);
  background: transparent;
  color: var(--brand-primary);
  font-family: var(--brand-font);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
  text-decoration: none;
  transition: all 200ms;
}
.ass-preview__cta:hover {
  background: var(--brand-primary);
  color: #FFFFFF;
  border-color: var(--brand-primary);
  transform: translateY(-1px);
}

/* Faixa de trust + CTA principal embaixo dos cards */
.ass-previews__foot {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  align-items: center;
  margin-top: 36px;
  padding: 22px 24px;
  border-radius: 16px;
  background: #FFFFFF;
  border: 1px solid color-mix(in srgb, var(--brand-border) 55%, transparent);
  box-shadow: 0 14px 36px -18px rgba(0, 0, 0, 0.08);
}
@media (min-width: 768px) {
  .ass-previews__foot {
    grid-template-columns: repeat(2, 1fr) auto;
    gap: 14px 28px;
    padding: 22px 28px;
  }
}
@media (min-width: 1280px) {
  .ass-previews__foot {
    grid-template-columns: repeat(4, 1fr) auto;
    gap: 18px 28px;
    padding: 24px 32px;
  }
}

.ass-previews__foot-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ass-previews__foot-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  flex-shrink: 0;
}
.ass-previews__foot-text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
}
.ass-previews__foot-text strong {
  font-size: 13.5px;
  font-weight: 600;
  color: #0F1116;
  letter-spacing: -0.005em;
}
.ass-previews__foot-text span {
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

.ass-previews__foot-cta {
  margin-top: 0;
  white-space: nowrap;
}

/* ============ 2. PROBLEM (igual raio-x) + pain grid ============ */
.lp-problem {
  padding: 80px 0;
}
@media (min-width: 768px) { .lp-problem { padding: 112px 0; } }

.lp-problem__inner {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 56px;
}
.lp-problem__lead {
  font-size: 17px;
  line-height: 1.65;
  color: color-mix(in srgb, var(--brand-text) 80%, transparent);
  margin: 22px 0 0;
}
@media (min-width: 768px) { .lp-problem__lead { font-size: 19px; } }
.lp-problem__lead strong {
  color: var(--brand-text);
  font-weight: 600;
}

.ass-pain__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  max-width: 1100px;
  margin: 0 auto;
}
@media (min-width: 640px) {
  .ass-pain__grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
}
@media (min-width: 1024px) {
  /* 5 cards: 3 em cima, 2 embaixo (centralizadas) */
  .ass-pain__grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 18px;
  }
  .ass-pain__card:nth-child(1) { grid-column: 1 / span 2; }
  .ass-pain__card:nth-child(2) { grid-column: 3 / span 2; }
  .ass-pain__card:nth-child(3) { grid-column: 5 / span 2; }
  .ass-pain__card:nth-child(4) { grid-column: 2 / span 2; }
  .ass-pain__card:nth-child(5) { grid-column: 4 / span 2; }
}

.ass-pain__card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px 22px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-border) 38%, transparent);
  transition: border-color 220ms, transform 220ms, background 220ms;
}
.ass-pain__card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
  background: color-mix(in srgb, var(--brand-primary) 5%, transparent);
  transform: translateY(-2px);
}
.ass-pain__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  flex-shrink: 0;
}
.ass-pain__card p {
  font-size: 14.5px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 80%, transparent);
  margin: 0;
}
.ass-pain__card p strong {
  color: var(--brand-text);
  font-weight: 600;
}

/* ============ 3. STAKES / CONSEQUENCIA ============ */
.ass-stakes {
  padding: 64px 0 72px;
  background: color-mix(in srgb, var(--brand-surface) 35%, var(--brand-background));
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
}
@media (min-width: 768px) { .ass-stakes { padding: 96px 0 112px; } }

.ass-stakes__inner {
  text-align: center;
  max-width: 780px;
  margin: 0 auto;
}

.ass-stakes__chain {
  list-style: none;
  margin: 36px auto 0;
  padding: 0;
  max-width: 620px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ass-stakes__chain li {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 16px 20px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
  text-align: left;
}
.ass-stakes__chain li strong {
  font-size: 14px;
  font-weight: 600;
  color: var(--brand-primary);
  letter-spacing: 0.005em;
}
.ass-stakes__chain li span {
  font-size: 16px;
  line-height: 1.5;
  color: var(--brand-text);
}

.ass-stakes__punch {
  margin: 36px auto 0;
  font-size: 22px;
  line-height: 1.35;
  color: var(--brand-text);
  font-weight: 400;
  max-width: 640px;
  text-wrap: balance;
}
@media (min-width: 768px) {
  .ass-stakes__punch { font-size: 30px; }
}
.ass-stakes__punch-italic {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
  display: block;
  margin-top: 4px;
}

/* ============ 4. SOLUTION ============ */
.ass-solution {
  position: relative;
  padding: 80px 0 96px;
  isolation: isolate;
}
@media (min-width: 768px) { .ass-solution { padding: 112px 0 128px; } }

.ass-solution__glow {
  position: absolute;
  inset: 0 -20%;
  filter: blur(70px);
  z-index: -1;
  pointer-events: none;
  opacity: 0.6;
  will-change: opacity;
  transform: translateZ(0);
}

.ass-solution__lead {
  margin: 22px auto 0;
  max-width: 640px;
  font-size: 16px;
  line-height: 1.65;
  color: color-mix(in srgb, var(--brand-text) 78%, transparent);
}
.ass-solution__lead strong {
  color: var(--brand-text);
  font-weight: 600;
}

.ass-solution__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}
@media (min-width: 768px) {
  .ass-solution__grid { grid-template-columns: repeat(3, 1fr); gap: 22px; }
}

.ass-solution__card {
  position: relative;
  padding: 32px 28px 30px;
  border-radius: 18px;
  background: var(--brand-surface);
  border: 1px solid color-mix(in srgb, var(--brand-border) 55%, transparent);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 220ms, transform 220ms, box-shadow 220ms;
}
.ass-solution__card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  transform: translateY(-3px);
  box-shadow: 0 24px 48px -16px color-mix(in srgb, var(--brand-primary) 24%, transparent);
}

.ass-solution__num {
  font-family: 'Instrument Serif', serif;
  font-size: 30px;
  font-weight: 400;
  color: var(--brand-primary);
  line-height: 1;
  letter-spacing: -0.02em;
}
.ass-solution__card h3 {
  font-size: 19px;
  font-weight: 500;
  letter-spacing: -0.015em;
  color: var(--brand-text);
  margin: 0;
  line-height: 1.3;
}
.ass-solution__card h3 em {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
}
.ass-solution__card p {
  font-size: 14.5px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
  margin: 0;
}

/* (CSS .ass-demo* removido junto com a section em 2026-05-11.
   Substituida pela section .ass-previews com iframes reais.) */

/* ============ 5. BENEFITS ============ */
.ass-benefits {
  padding: 80px 0 96px;
  background: color-mix(in srgb, var(--brand-surface) 30%, var(--brand-background));
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
}
@media (min-width: 768px) { .ass-benefits { padding: 112px 0 128px; } }

.ass-benefits__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-width: 1100px;
  margin: 0 auto;
}
@media (min-width: 640px) {
  .ass-benefits__grid { grid-template-columns: repeat(2, 1fr); gap: 18px; }
}
@media (min-width: 1024px) {
  /* 5 itens, 3+2 layout */
  .ass-benefits__grid { grid-template-columns: repeat(6, 1fr); gap: 20px; }
  .ass-benefits__item:nth-child(1) { grid-column: 1 / span 2; }
  .ass-benefits__item:nth-child(2) { grid-column: 3 / span 2; }
  .ass-benefits__item:nth-child(3) { grid-column: 5 / span 2; }
  .ass-benefits__item:nth-child(4) { grid-column: 2 / span 2; }
  .ass-benefits__item:nth-child(5) { grid-column: 4 / span 2; }
}

.ass-benefits__item {
  position: relative;
  padding: 28px 24px 26px;
  border-radius: 18px;
  background: var(--brand-background);
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  transition: border-color 220ms, transform 220ms;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ass-benefits__item:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
  transform: translateY(-2px);
}
.ass-benefits__num {
  font-family: 'Instrument Serif', serif;
  font-size: 24px;
  font-weight: 400;
  color: var(--brand-primary);
  line-height: 1;
}
.ass-benefits__item h3 {
  font-size: 17px;
  font-weight: 500;
  color: var(--brand-text);
  margin: 0;
  letter-spacing: -0.01em;
}
.ass-benefits__item p {
  font-size: 14px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 72%, transparent);
  margin: 0;
}
.ass-benefits__item p strong {
  color: var(--brand-text);
  font-weight: 600;
}

/* =================================================================
 * SECTIONS EXCLUSIVAS DA /assessorias-diferencie-solucao
 * .sol-what       — 4 cards (Carteira/Noticias/Impactos/Riscos)
 * .sol-diff       — 4 benefit cards numerados
 * .sol-compare    — tabela 2 colunas Antes/Depois
 * .sol-uses       — 5 use case cards
 * .sol-steps      — 4 numbered implementation steps
 * .sol-final      — CTA final
 * ================================================================= */

/* ============ SOL-WHAT (4 cards: Carteira/Noticias/Impactos/Riscos) ============ */
.sol-what {
  padding: 80px 0 96px;
}
@media (min-width: 768px) { .sol-what { padding: 112px 0 128px; } }

.sol-what__lead {
  margin: 22px auto 0;
  max-width: 660px;
  font-size: 16px;
  line-height: 1.65;
  color: color-mix(in srgb, var(--brand-text) 78%, transparent);
}
.sol-what__lead strong {
  color: var(--brand-text);
  font-weight: 600;
}

.sol-what__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  max-width: 1100px;
  margin: 0 auto;
}
@media (min-width: 640px) {
  .sol-what__grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
}
@media (min-width: 1024px) {
  .sol-what__grid { grid-template-columns: repeat(4, 1fr); gap: 22px; }
}

.sol-what__card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 26px 24px;
  border-radius: 16px;
  background: var(--brand-surface);
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  transition: border-color 220ms, transform 220ms;
}
.sol-what__card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
  transform: translateY(-2px);
}
.sol-what__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 11px;
  flex-shrink: 0;
}
.sol-what__card h3 {
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--brand-text);
  margin: 0;
}
.sol-what__card p {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 72%, transparent);
}
.sol-what__card p strong { color: var(--brand-text); font-weight: 600; }

/* ============ SOL-DIFF (4 benefit cards) ============ */
.sol-diff {
  position: relative;
  padding: 80px 0 96px;
  isolation: isolate;
}
@media (min-width: 768px) { .sol-diff { padding: 112px 0 128px; } }
.sol-diff__glow {
  position: absolute;
  inset: 0 -20%;
  filter: blur(70px);
  z-index: -1;
  pointer-events: none;
  opacity: 0.6;
  will-change: opacity;
  transform: translateZ(0);
}
.sol-diff__lead {
  margin: 22px auto 0;
  max-width: 660px;
  font-size: 16px;
  line-height: 1.65;
  color: color-mix(in srgb, var(--brand-text) 78%, transparent);
}
.sol-diff__lead strong { color: var(--brand-text); font-weight: 600; }

.sol-diff__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  max-width: 1100px;
  margin: 0 auto;
}
@media (min-width: 768px) { .sol-diff__grid { grid-template-columns: repeat(2, 1fr); gap: 22px; } }
@media (min-width: 1100px) { .sol-diff__grid { grid-template-columns: repeat(4, 1fr); gap: 20px; } }

.sol-diff__card {
  position: relative;
  padding: 28px 24px 26px;
  border-radius: 18px;
  background: var(--brand-surface);
  border: 1px solid color-mix(in srgb, var(--brand-border) 55%, transparent);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 220ms, transform 220ms, box-shadow 220ms;
}
.sol-diff__card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  transform: translateY(-3px);
  box-shadow: 0 24px 48px -16px color-mix(in srgb, var(--brand-primary) 24%, transparent);
}
.sol-diff__num {
  font-family: 'Instrument Serif', serif;
  font-size: 26px;
  font-weight: 400;
  color: var(--brand-primary);
  line-height: 1;
  letter-spacing: -0.02em;
}
.sol-diff__card h3 {
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.015em;
  color: var(--brand-text);
  margin: 0;
  line-height: 1.3;
}
.sol-diff__card h3 em {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
}
.sol-diff__card p {
  font-size: 14px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 72%, transparent);
  margin: 0;
}

/* ============ SOL-COMPARE (tabela antes/depois) ============ */
.sol-compare {
  padding: 80px 0 96px;
  background: color-mix(in srgb, var(--brand-surface) 30%, var(--brand-background));
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
}
@media (min-width: 768px) { .sol-compare { padding: 112px 0 128px; } }

.sol-compare__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-width: 920px;
  margin: 0 auto;
}
@media (min-width: 768px) {
  .sol-compare__grid { grid-template-columns: 1fr 1fr; gap: 20px; }
}

.sol-compare__col {
  padding: 28px 26px 32px;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 40%, transparent);
}
.sol-compare__head {
  margin: 0 0 18px;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 700;
}
.sol-compare__col ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sol-compare__col li {
  position: relative;
  padding-left: 26px;
  font-size: 15px;
  line-height: 1.5;
}
.sol-compare__col li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 65% 65%;
}
.sol-compare__col--before {
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
}
.sol-compare__col--before .sol-compare__head {
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
.sol-compare__col--before li {
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.sol-compare__col--before li::before {
  background-color: color-mix(in srgb, var(--brand-text) 12%, transparent);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5'%3E%3Cline x1='18' y1='6' x2='6' y2='18'/%3E%3Cline x1='6' y1='6' x2='18' y2='18'/%3E%3C/svg%3E");
}
.sol-compare__col--after {
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 38%, transparent);
  box-shadow: 0 24px 48px -20px color-mix(in srgb, var(--brand-primary) 28%, transparent);
}
.sol-compare__col--after .sol-compare__head {
  color: var(--brand-primary);
}
.sol-compare__col--after li {
  color: var(--brand-text);
}
.sol-compare__col--after li::before {
  background-color: color-mix(in srgb, var(--brand-primary) 22%, transparent);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23D8881A' stroke-width='3'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
}
.sol-compare__col--after li strong { font-weight: 600; }

/* ============ SOL-USES (5 use case cards) ============ */
.sol-uses {
  padding: 80px 0 96px;
}
@media (min-width: 768px) { .sol-uses { padding: 112px 0 128px; } }

.sol-uses__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-width: 1100px;
  margin: 0 auto;
}
@media (min-width: 640px) {
  .sol-uses__grid { grid-template-columns: repeat(2, 1fr); gap: 18px; }
}
@media (min-width: 1024px) {
  /* 5 cards, 3+2 layout */
  .sol-uses__grid { grid-template-columns: repeat(6, 1fr); gap: 20px; }
  .sol-uses__card:nth-child(1) { grid-column: 1 / span 2; }
  .sol-uses__card:nth-child(2) { grid-column: 3 / span 2; }
  .sol-uses__card:nth-child(3) { grid-column: 5 / span 2; }
  .sol-uses__card:nth-child(4) { grid-column: 2 / span 2; }
  .sol-uses__card:nth-child(5) { grid-column: 4 / span 2; }
}

.sol-uses__card {
  padding: 22px 22px 24px;
  border-radius: 16px;
  background: var(--brand-surface);
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 220ms, transform 220ms;
}
.sol-uses__card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 45%, transparent);
  transform: translateY(-2px);
}
.sol-uses__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  flex-shrink: 0;
}
.sol-uses__card h3 {
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--brand-text);
  margin: 0;
}
.sol-uses__card p {
  font-size: 14px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 72%, transparent);
  margin: 0;
}

/* ============ SOL-STEPS (4 implementation steps) ============ */
.sol-steps {
  padding: 80px 0 96px;
  background: color-mix(in srgb, var(--brand-surface) 30%, var(--brand-background));
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
}
@media (min-width: 768px) { .sol-steps { padding: 112px 0 128px; } }

.sol-steps__lead {
  margin: 22px auto 0;
  max-width: 660px;
  font-size: 16px;
  line-height: 1.65;
  color: color-mix(in srgb, var(--brand-text) 78%, transparent);
}
.sol-steps__lead strong { color: var(--brand-text); font-weight: 600; }

.sol-steps__list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-width: 920px;
  margin: 0 auto;
  padding: 0;
  list-style: none;
}
@media (min-width: 768px) {
  .sol-steps__list { grid-template-columns: 1fr 1fr; gap: 20px; }
}

.sol-steps__step {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 22px 22px 24px;
  border-radius: 16px;
  background: var(--brand-background);
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  transition: border-color 220ms;
}
.sol-steps__step:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
}
.sol-steps__num {
  font-family: 'Instrument Serif', serif;
  font-size: 36px;
  font-weight: 400;
  color: var(--brand-primary);
  line-height: 1;
  letter-spacing: -0.02em;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.sol-steps__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}
.sol-steps__body h3 {
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--brand-text);
  margin: 0 0 6px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.sol-steps__time {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-primary) 14%, transparent);
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
}
.sol-steps__body p {
  font-size: 14px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 72%, transparent);
  margin: 0;
}

.sol-steps__cta {
  margin: 36px auto 0;
  display: flex;
}

/* ============ SOL-FINAL (CTA final) ============ */
.sol-final {
  position: relative;
  padding: 96px 0 112px;
  text-align: center;
  isolation: isolate;
}
@media (min-width: 768px) { .sol-final { padding: 128px 0 144px; } }
.sol-final__glow {
  position: absolute;
  inset: -10% -10%;
  filter: blur(60px);
  z-index: -1;
  pointer-events: none;
  opacity: 0.7;
  will-change: opacity;
  transform: translateZ(0);
}
.sol-final__inner {
  max-width: 720px;
  margin: 0 auto;
}
.sol-final__lead {
  margin: 18px auto 32px;
  max-width: 580px;
  font-size: 16px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
}
.sol-final__lead strong { color: var(--brand-text); font-weight: 600; }
.sol-final__cta { margin: 0 auto; }
.sol-final__legal {
  margin: 22px auto 0;
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

/* ============ 7. SCARCITY ============ */
.ass-scarcity {
  position: relative;
  padding: 88px 0 96px;
  isolation: isolate;
  text-align: center;
}
@media (min-width: 768px) { .ass-scarcity { padding: 120px 0 128px; } }

.ass-scarcity__glow {
  position: absolute;
  inset: -10% -10%;
  filter: blur(60px);
  z-index: -1;
  pointer-events: none;
  opacity: 0.7;
  will-change: opacity;
  transform: translateZ(0);
}

.ass-scarcity__inner {
  max-width: 720px;
  margin: 0 auto;
}

.ass-scarcity__lead {
  margin: 22px auto 32px;
  max-width: 600px;
  font-size: 16px;
  line-height: 1.65;
  color: color-mix(in srgb, var(--brand-text) 78%, transparent);
}
.ass-scarcity__lead strong {
  color: var(--brand-text);
  font-weight: 600;
}

.ass-scarcity__cta {
  margin: 32px auto 0;
}

/* ============ 8. PROOF ============ */
.ass-proof {
  padding: 80px 0 96px;
}
@media (min-width: 768px) { .ass-proof { padding: 112px 0 128px; } }

.ass-proof__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  max-width: 1100px;
  margin: 0 auto;
}
@media (min-width: 640px) {
  .ass-proof__grid { grid-template-columns: repeat(2, 1fr); gap: 22px; }
}

.ass-proof__card {
  padding: 28px 26px 30px;
  border-radius: 18px;
  background: var(--brand-surface);
  border: 1px solid color-mix(in srgb, var(--brand-border) 55%, transparent);
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: border-color 220ms, transform 220ms;
}
.ass-proof__card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 45%, transparent);
  transform: translateY(-2px);
}
.ass-proof__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 11px;
  flex-shrink: 0;
}
.ass-proof__card h3 {
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--brand-text);
  margin: 0;
  line-height: 1.3;
}
.ass-proof__card p {
  font-size: 14px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 72%, transparent);
  margin: 0;
}
.ass-proof__card p strong {
  color: var(--brand-text);
  font-weight: 600;
}

.ass-proof__stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin: 56px auto 0;
  max-width: 920px;
}
@media (min-width: 768px) {
  .ass-proof__stats { grid-template-columns: repeat(4, 1fr); gap: 18px; }
}

.ass-proof__stat {
  text-align: center;
  padding: 24px 14px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--brand-surface) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
}
.ass-proof__stat-num {
  display: block;
  font-family: 'Instrument Serif', serif;
  font-size: 36px;
  font-weight: 400;
  color: var(--brand-primary);
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.ass-proof__stat-label {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.45;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}

/* ============ 9. FAQ ============ */
.ass-faq {
  padding: 80px 0 96px;
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
}
@media (min-width: 768px) { .ass-faq { padding: 112px 0 128px; } }

.ass-faq__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 760px;
  margin: 0 auto;
}

.ass-faq__item {
  border-radius: 14px;
  background: var(--brand-surface);
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  overflow: hidden;
  transition: border-color 220ms;
}
.ass-faq__item[open] {
  border-color: color-mix(in srgb, var(--brand-primary) 40%, transparent);
}

.ass-faq__item summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: var(--brand-text);
  list-style: none;
  user-select: none;
}
.ass-faq__item summary::-webkit-details-marker { display: none; }

.ass-faq__chev {
  font-size: 22px;
  font-weight: 300;
  color: var(--brand-primary);
  transition: transform 200ms;
  flex-shrink: 0;
}
.ass-faq__item[open] .ass-faq__chev {
  transform: rotate(45deg);
}

.ass-faq__item p {
  padding: 0 22px 22px;
  margin: 0;
  font-size: 14.5px;
  line-height: 1.65;
  color: color-mix(in srgb, var(--brand-text) 78%, transparent);
}
.ass-faq__item p strong {
  color: var(--brand-text);
  font-weight: 600;
}

/* (CSS .lp-final* + .ass-final__cta removidos junto com a section
   em 2026-05-11. Section nao existe mais.) */

/* ============ SCROLL REVEAL ============ */
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 700ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 700ms cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: var(--reveal-delay, 0ms);
  will-change: opacity, transform;
}
.reveal-on-scroll.is-revealed {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .reveal-on-scroll {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>

<!--
  Bloco <style> NAO scoped. Necessario porque ataca o <body> via classe
  setada por useHead, que esta FORA do escopo dessa page. Vue scoped
  CSS nao vaza pra fora do componente; as regras desse bloco precisam
  ser globais.

  Override das CSS vars do brand garante que a page /assessorias
  permanece em light mode mesmo se o brand atual estiver configurado
  pra dark. Usado em conjunto com useHead({ bodyAttrs.class }).
-->
<style>
body.assessorias-light-only {
  --brand-background: #FAFAFB;
  --brand-text: #1A0A2E;
  --brand-text-muted: rgba(26, 10, 46, 0.6);
  --brand-surface: #FFFFFF;
  --brand-surface-hover: #F4F4F5;
  --brand-border: rgba(26, 10, 46, 0.14);
  --brand-input-bg: #FFFFFF;
  --brand-input-bg-hover: #FAFAFB;
  --brand-input-border: rgba(26, 10, 46, 0.2);
  --text-heading: #1A0A2E;
  --text-body: rgba(26, 10, 46, 0.85);
  --text-muted: rgba(26, 10, 46, 0.55);
  --bg-base: #FAFAFB;
  --bg-elevated: #FFFFFF;
  --bg-overlay: #F4F4F5;
  --border-subtle: rgba(26, 10, 46, 0.10);
  --border-default: rgba(26, 10, 46, 0.18);
  --border-strong: rgba(26, 10, 46, 0.30);
  background: #FAFAFB !important;
  color: #1A0A2E;
  color-scheme: light;
}
</style>

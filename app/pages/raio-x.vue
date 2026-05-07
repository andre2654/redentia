<!--
  /raio-x — Landing page de conversao para anuncios Meta.

  ============ HISTORICO ============
  Versao anterior dessa rota (arquivada): tinha quiz multi-step + result
  page com PortfolioDiagnosis + soft gate. Foi DESCARTADA porque:
    - Carregamento pesado (140KB HTML, 24 modulepreloads, video 36MB)
    - 87/88 sessions paid bouncing em 1s no IG Sponsored Browser
    - Conversao baixa: 28 cadastros em 7 dias com R$50/dia
    - Tool experience (quiz + result) nao era objetivo do anuncio,
      so confundia funnel

  ============ ESTRATEGIA ATUAL ============
  Marketing landing puro. Foco em CADASTRO via email + magic link.
  Tool de raio-x real fica acessivel apenas em /wallet pra users
  autenticados, com carteira real (sem mock).

  Inspirado em Mercury, Linear, Stripe, Wealthfront — fintech/SaaS
  que converte alto. Padroes usados:
    - Hero com headline + product mockup ao lado
    - Atmospheric amber gradients (ressonancia com brand)
    - Mockups visuais de produto (snowflake radar + chat com IA)
    - Video click-to-play no meio (lazy load)
    - Comparison table (corretora vs Redentia)
    - Social proof com numero animado
    - CTA inline com email magic link em 3 momentos

  ============ COPY DIRETO ============
  Voz: direto, sem enrolacao. Enfatiza:
    - Sua corretora mostra o saldo. A Redentia mostra o motivo.
    - Hoje voce compete com IA, nao outros investidores. Use IA.
    - Avisa QUANDO comprar e QUANDO vender.
    - 100% gratis, sem cartao, sem enrolacao.

  ============ PERFORMANCE ============
  Layout `landing` minimo (sem nav/sidebar/footer pesado). Toda
  visualização inline em CSS (sem imagens externas). Chart mockups
  são SVG inline. Email capture usa magic link backend.
  Target: <30KB HTML, <500ms TTI em conexao normal, <1.5s Slow 4G.

  Scroll perf: content-visibility:auto + contain-intrinsic-size em
  sections off-screen, blur reduzido a 60px nos glows, sem 3D
  transforms, will-change em mockup hover.
-->
<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  isPublicRoute: true,
  hideInstallAppBanner: true,
  hideQuickSearch: true,
})

const brand = useBrand()
const router = useRouter()
const { magicLinkRequest } = useAuthService()
const { track } = useMetaPixel()

// ============ EFEITOS DA WALLET ============
// Scroll reveal (IntersectionObserver) — qualquer elemento com classe
// `reveal-on-scroll` ganha is-revealed quando entra no viewport
useScrollReveal()

// Counter animado pro social proof "+X cadastrados"
const totalSignupsEl = ref<HTMLElement | null>(null)
const { currentValue: totalSignupsCount } = useAnimatedCounter({
  to: 1247,
  duration: 1800,
  triggerEl: totalSignupsEl,
})

// Carta sem animação scroll-driven — carta sempre aberta.
// (Versão anterior usava useScrollProgress + transforms calc; foi
// removida porque o efeito não estava ficando bom na prática.)

// ============ EMAIL CAPTURE STATE ============
const email = ref('')
const submitting = ref(false)
const submitted = ref(false)
const errorMsg = ref('')

// Dedup do Lead: se user submete email, espera, depois clica no
// "Reenviar" ou submete de novo, NAO duplicamos o evento na Meta.
// `leadFiredOnce` mantém estado pra a sessao toda. Se quiser permitir
// re-fire (ex: outro email), reseta esse flag manualmente.
const leadFiredOnce = ref(false)

const isValid = computed(() => {
  const e = email.value.trim()
  return e.includes('@') && e.length > 4 && !submitting.value
})

async function submitEmail() {
  if (!isValid.value) return
  submitting.value = true
  errorMsg.value = ''
  try {
    await magicLinkRequest({
      email: email.value.trim().toLowerCase(),
      redirect_to: '/wallet?from=raiox',
    })
    // ============ Lead Pixel/CAPI ============
    // Padronizado com content_ids: ['raio-x'] pra Meta agrupar
    // ViewContent → Lead → CompleteRegistration no mesmo funnel.
    // value=5: Lead vale ~10x menos que CR no nosso modelo de funnel
    // (~10% Lead → CR conversao historica). Dedup via leadFiredOnce
    // pra nao inflar metricas quando user clica resend.
    if (!leadFiredOnce.value) {
      track('Lead', {
        content_name: 'Landing RaioX Magic Link',
        content_category: 'landing_conversion',
        content_ids: ['raio-x'],
        content_type: 'product',
        currency: 'BRL',
        value: 5,
      })
      leadFiredOnce.value = true
    }
    submitted.value = true
  }
  catch (err: unknown) {
    const apiError = err as { data?: { message?: string } }
    errorMsg.value
      = apiError?.data?.message
      || (err instanceof Error ? err.message : 'Erro ao enviar. Tente novamente.')
  }
  finally {
    submitting.value = false
  }
}

// ============ ANIMATED COUNTER ============
// Conta carteiras analisadas — começa em 33000, sobe ~1/segundo
// pra dar sensação de plataforma viva. SSR-safe (valor fixo no setup,
// atualiza só no client).
const ANALYSIS_COUNT_BASE = 33297
const counter = ref(ANALYSIS_COUNT_BASE)
const counterFormatted = computed(() => counter.value.toLocaleString('pt-BR'))

let counterTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // ViewContent ao chegar na landing (top-of-funnel).
  // value=1 sinaliza que e tracking de visita — nao e a conversao.
  // content_ids agrupa com Lead/CompleteRegistration na mesma campanha
  // pra Meta correlacionar quem viu → cadastrou.
  track('ViewContent', {
    content_name: 'Landing RaioX',
    content_category: 'landing_conversion',
    content_ids: ['raio-x'],
    content_type: 'product',
    currency: 'BRL',
    value: 1,
  })
  // Counter animado: incrementa 1 a cada 4-7 segundos (organico)
  counterTimer = setInterval(() => {
    counter.value += 1
  }, 4000 + Math.random() * 3000)
})

onBeforeUnmount(() => {
  if (counterTimer) clearInterval(counterTimer)
})

// ============ LAZY VIDEO (na section "Veja na pratica") ============
// Mesmo padrao do /raio-x: poster JPG enquanto user nao roda ate la,
// e o video MP4 (2.8MB) so baixa quando user clica play. IntersectionObserver
// nem dispara pra video — em vez disso, click-to-play. Economiza 100% da
// bandwidth pra quem nao engaja com a section.
const videoSrc = '/assets/videos/raio-x.mp4'
const videoPoster = '/assets/videos/raio-x-poster.jpg'
const videoPlaying = ref(false)
const videoElRef = ref<HTMLVideoElement | null>(null)

function playVideo() {
  videoPlaying.value = true
  // Aguarda Vue renderizar o <video>, dispara play
  nextTick(() => {
    videoElRef.value?.play()?.catch(() => {
      // autoplay pode falhar em alguns browsers — controls aparecem,
      // user clica de novo no controle nativo se precisar
    })
  })
  // CustomizeProduct = engajamento intermediario. Indica intent
  // entre "viu a page" e "cadastrou". Bom sinal pra Meta calibrar
  // audiencias de tipo "scrolla + assiste video" mesmo se nao virou Lead.
  track('CustomizeProduct', {
    content_name: 'Landing RaioX Video Play',
    content_category: 'landing_engagement',
    content_ids: ['raio-x'],
    content_type: 'product',
    currency: 'BRL',
    value: 0,
  })
}

// SEO
const runtimeConfig = useRuntimeConfig()
const siteUrl = computed(() => {
  const url = runtimeConfig.public?.siteUrl || brand.url
  return String(url).endsWith('/') ? String(url).slice(0, -1) : String(url)
})

usePageSeo({
  title: `Por que sua carteira caiu hoje? | ${brand.name}`,
  description: 'Sua corretora mostra o saldo. A Redentia mostra o motivo. Análise da carteira com IA, em 2 minutos. 100% grátis, sem cartão.',
  path: '/raio-x',
})
</script>

<template>
  <div class="lp">
    <!-- ============ HERO ============ -->
    <section class="lp-hero">
      <!-- Atmospheric amber radial -->
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
            <p class="lp-eyebrow lp-eyebrow--pulsing">
              <span class="lp-eyebrow__dot" aria-hidden="true" />
              RAIO-X DA CARTEIRA · 100% GRÁTIS
            </p>

            <h1 class="lp-hero__headline">
              Sua carteira caiu hoje<span class="lp-hero__dots">…</span>
              <span class="lp-hero__italic">e você não sabe por quê?</span>
            </h1>

            <p class="lp-hero__subhead">
              Sua corretora mostra o <strong>saldo</strong>.
              A Redentia mostra o <strong>motivo</strong>.
            </p>

            <p class="lp-hero__lead">
              Análise da sua carteira cruzando notícias, fundamentos
              e contexto macro, com IA. Em 2 minutos.
            </p>

            <!-- CTA primário grande -->
            <form class="lp-hero__form" novalidate @submit.prevent="submitEmail">
              <input
                v-model="email"
                type="email"
                class="lp-hero__input"
                placeholder="Digite seu email"
                autocomplete="email"
                inputmode="email"
                spellcheck="false"
                autocapitalize="none"
                required
              >
              <button
                type="submit"
                class="lp-hero__cta"
                :disabled="!isValid"
              >
                <span>{{ submitting ? 'Enviando…' : (submitted ? 'Verifique seu email ✓' : 'Faça o Raio-X grátis') }}</span>
                <svg v-if="!submitting && !submitted" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14m-7-7l7 7l-7 7" />
                </svg>
              </button>
            </form>

            <p v-if="errorMsg" class="lp-hero__error" role="alert">
              {{ errorMsg }}
            </p>

            <ul class="lp-hero__trust">
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                100% gratuito
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Sem cartão
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Sem cadastro chato
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>
                </svg>
                Conecta via Open Finance
              </li>
              <li>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.4 1 2.8 1.2 3c.1.2 2 3.1 4.9 4.4.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4M12 21.7c-1.7 0-3.4-.5-4.9-1.3l-3.5.9.9-3.4C3.5 16 3 14.1 3 12.2 3 7.2 7.1 3.1 12 3.1S21 7.2 21 12.2 16.9 21.7 12 21.7M12 1c-6.1 0-11 4.9-11 11 0 1.9.5 3.7 1.4 5.4L1 23l5.7-1.4c1.6.9 3.4 1.4 5.3 1.4 6.1 0 11-4.9 11-11S18.1 1 12 1z"/></svg>
                WhatsApp incluso
              </li>
            </ul>

            <!-- Social proof: counter animado de cadastros + avatares -->
            <div ref="totalSignupsEl" class="lp-social-proof">
              <div class="lp-social-proof__avatars" aria-hidden="true">
                <span class="lp-social-proof__avatar">A</span>
                <span class="lp-social-proof__avatar">M</span>
                <span class="lp-social-proof__avatar">R</span>
                <span class="lp-social-proof__avatar">C</span>
                <span class="lp-social-proof__avatar lp-social-proof__avatar--more">+</span>
              </div>
              <div class="lp-social-proof__copy">
                <span class="lp-social-proof__count">
                  <strong>{{ totalSignupsCount.toLocaleString('pt-BR') }}</strong>
                  investidores
                </span>
                <span class="lp-social-proof__sub">já fizeram o raio-x essa semana</span>
              </div>
            </div>
          </div>

          <!-- RIGHT: product mockup -->
          <div class="lp-hero__visual">
            <!-- Tombstone digit atras do mockup — referencia visual ao
                 stress test da wallet, gigante e semi-transparente -->
            <span class="lp-hero__tombstone" aria-hidden="true">94.4</span>

            <div class="lp-mockup">
              <!-- Mockup card head -->
              <div class="lp-mockup__head">
                <div class="lp-mockup__dots">
                  <span /><span /><span />
                </div>
                <span class="lp-mockup__url">redentia.com.br/raio-x</span>
              </div>

              <!-- Mockup body: simula card de raio-x result -->
              <div class="lp-mockup__body">
                <p class="lp-mockup__eyebrow">RAIO-X · HOJE 14:32</p>

                <!-- Score card -->
                <div class="lp-mockup__score">
                  <div class="lp-mockup__score-label">Sua carteira</div>
                  <div class="lp-mockup__score-value">
                    <span class="lp-mockup__score-num">-2,4%</span>
                    <span class="lp-mockup__score-period">no dia</span>
                  </div>
                  <div class="lp-mockup__sparkline" aria-hidden="true">
                    <!-- Sparkline SVG inline simulando queda -->
                    <svg viewBox="0 0 200 60" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="lp-spark" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" :stop-color="brand.colors.negative || '#dc2626'" stop-opacity="0.4" />
                          <stop offset="100%" :stop-color="brand.colors.negative || '#dc2626'" stop-opacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,20 L20,15 L40,18 L60,12 L80,28 L100,22 L120,35 L140,30 L160,42 L180,38 L200,48 L200,60 L0,60 Z"
                        fill="url(#lp-spark)"
                      />
                      <path
                        d="M0,20 L20,15 L40,18 L60,12 L80,28 L100,22 L120,35 L140,30 L160,42 L180,38 L200,48"
                        :stroke="brand.colors.negative || '#dc2626'"
                        stroke-width="2"
                        fill="none"
                      />
                    </svg>
                  </div>
                </div>

                <!-- Causas explicadas -->
                <div class="lp-mockup__cause-label">POR QUÊ:</div>
                <ul class="lp-mockup__causes">
                  <li>
                    <span class="lp-mockup__bullet" :style="{ background: brand.colors.negative || '#dc2626' }" />
                    <strong>PETR4 -3,8%</strong> · queda do petróleo após reunião OPEC
                  </li>
                  <li>
                    <span class="lp-mockup__bullet" :style="{ background: brand.colors.negative || '#dc2626' }" />
                    <strong>VALE3 -2,1%</strong> · minério de ferro recua na China
                  </li>
                  <li>
                    <span class="lp-mockup__bullet" :style="{ background: brand.colors.positive || '#10b981' }" />
                    <strong>ITUB4 +0,4%</strong> · resultado trimestral acima do esperado
                  </li>
                </ul>

                <!-- AI suggestion footer -->
                <div class="lp-mockup__ai">
                  <span class="lp-mockup__ai-icon" :style="{ background: brand.colors.primary }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                    </svg>
                  </span>
                  <span class="lp-mockup__ai-text">
                    <strong>Sugestão da IA:</strong> sua exposição a commodities tá em 42%, considere rebalancear.
                  </span>
                </div>
              </div>

              <!-- Floating notification 1 -->
              <div class="lp-mockup__float lp-mockup__float--top">
                <span class="lp-mockup__float-pulse" :style="{ background: brand.colors.primary }" />
                <span><strong>Alerta:</strong> notícia nova na sua PETR4</span>
              </div>

              <!-- Floating notification 2 -->
              <div class="lp-mockup__float lp-mockup__float--bottom">
                <span class="lp-mockup__float-icon" :style="{ background: brand.colors.positive || '#10b981' }">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span>Dividendo MXRF11 cai amanhã</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ TICKER TAPE / SOCIAL PROOF BAR ============ -->
    <section class="lp-tickerbar">
      <div class="lp-container lp-tickerbar__inner">
        <div class="lp-tickerbar__live" aria-live="polite">
          <span class="lp-tickerbar__dot" :style="{ background: brand.colors.positive || '#10b981' }" />
          <span class="lp-tickerbar__num tabular-nums">{{ counterFormatted }}</span>
          <span class="lp-tickerbar__label">carteiras analisadas</span>
        </div>
        <div class="lp-tickerbar__sources">
          <span class="lp-tickerbar__source-label">Dados auditáveis:</span>
          <span class="lp-tickerbar__source">B3</span>
          <span class="lp-tickerbar__source">Tesouro Direto</span>
          <span class="lp-tickerbar__source">11 fontes de notícias</span>
        </div>
      </div>
    </section>

    <!-- ============ PROBLEMA ============ -->
    <section class="lp-problem">
      <div class="lp-container">
        <div class="lp-problem__inner">
          <p class="lp-eyebrow lp-eyebrow--center">O MERCADO MUDOU</p>
          <h2 class="lp-section-title">
            Você não está competindo com outros investidores.
            <span class="lp-section-title__italic">Está competindo com IA.</span>
          </h2>
          <p class="lp-problem__lead">
            Hoje, notícia, gráfico, juros, dólar e inteligência artificial
            mexem nos ativos em <strong>segundos</strong>.
          </p>
          <p class="lp-problem__lead">
            Mas você ainda analisa tudo manual: planilha, site de fundamentos,
            gráfico, notícia. Enquanto isso, algoritmos processam <strong>100 mil notícias por segundo</strong>
            e antecipam movimentos antes de você ler a manchete.
          </p>
          <p class="lp-problem__lead lp-problem__cta-line">
            <strong>Use IA a seu favor.</strong>
          </p>
        </div>
      </div>
    </section>

    <!-- ============ FEATURES PRINCIPAIS ============ -->
    <section class="lp-features">
      <div class="lp-container">
        <header class="lp-section-head reveal-on-scroll">
          <p class="lp-eyebrow">O QUE A REDENTIA FAZ</p>
          <h2 class="lp-section-title">
            Para de adivinhar.
            <span class="lp-section-title__italic">Comece a saber.</span>
          </h2>
        </header>

        <div class="lp-features__grid">
          <!-- Feature 1: Raio-X -->
          <article class="lp-feat reveal-on-scroll">
            <div class="lp-feat__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)` }">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="brand.colors.primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" />
                <path d="M4 6h.01" />
                <path d="M2.29 9.62A10 10 0 1 0 21.31 8.35" />
                <path d="M16.24 7.76A6 6 0 1 0 17.51 14" />
                <path d="M12 18h.01" />
                <path d="M17.99 11.66A6 6 0 0 1 15.77 16.67" />
                <circle cx="12" cy="12" r="2" />
                <path d="m13.41 10.59 5.66-5.66" />
              </svg>
            </div>
            <h3>Raio-X completo da carteira</h3>
            <p>Mostra <strong>quais</strong> ativos pesaram e <strong>por quê</strong> caíram ou subiram. Não só o resultado, o motivo.</p>
            <!-- Mini sparkline preview -->
            <div class="lp-feat__viz">
              <div class="lp-feat__bar" :style="{ width: '78%', background: brand.colors.primary }" />
              <div class="lp-feat__bar" :style="{ width: '62%', background: `color-mix(in srgb, ${brand.colors.primary} 70%, transparent)` }" />
              <div class="lp-feat__bar" :style="{ width: '45%', background: `color-mix(in srgb, ${brand.colors.primary} 50%, transparent)` }" />
            </div>
          </article>

          <!-- Feature 2: Alertas -->
          <article class="lp-feat lp-feat--highlight reveal-on-scroll">
            <div class="lp-feat__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)` }">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="brand.colors.primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </div>
            <h3>Avisa <em>quando</em> comprar e <em>quando</em> vender</h3>
            <p>Você não fica adivinhando. A IA monitora seus ativos 24/7 e te avisa quando algo muda, antes da concorrência reagir.</p>
            <div class="lp-feat__alerts">
              <div class="lp-feat__alert">
                <span class="lp-feat__alert-pulse" :style="{ background: brand.colors.primary }" />
                <span><strong>PETR4</strong> · novo gatilho técnico identificado</span>
              </div>
              <div class="lp-feat__alert">
                <span class="lp-feat__alert-pulse" :style="{ background: brand.colors.positive || '#10b981' }" />
                <span><strong>HGLG11</strong> · oportunidade de entrada</span>
              </div>
            </div>
          </article>

          <!-- Feature: Open Finance (HIGHLIGHT — diferencial vs concorrentes) -->
          <article class="lp-feat lp-feat--highlight reveal-on-scroll">
            <div class="lp-feat__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.positive || '#10b981'} 14%, transparent)` }">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="brand.colors.positive || '#10b981'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 17H7A5 5 0 0 1 7 7h2"/>
                <path d="M15 7h2a5 5 0 1 1 0 10h-2"/>
                <line x1="8" x2="16" y1="12" y2="12"/>
              </svg>
            </div>
            <h3>Conecta sua corretora <em>sozinha</em> via Open Finance</h3>
            <p>Sem digitar ticker, sem subir XLSX. Conecta XP, BTG, Itaú, Nubank e demais corretoras autorizadas pelo Banco Central. <strong>Atualização automática</strong> e <strong>credenciais nunca passam pela Redentia</strong>.</p>
            <!-- Mini logos das corretoras suportadas -->
            <div class="lp-feat__bank-row">
              <span class="lp-feat__bank-chip">XP</span>
              <span class="lp-feat__bank-chip">BTG</span>
              <span class="lp-feat__bank-chip">Itaú</span>
              <span class="lp-feat__bank-chip">Nu</span>
              <span class="lp-feat__bank-chip">Inter</span>
              <span class="lp-feat__bank-chip lp-feat__bank-chip--more">+30</span>
            </div>
            <span class="lp-feat__official-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Regulado pelo Banco Central
            </span>
          </article>

          <!-- Feature 3: Notícias -->
          <article class="lp-feat reveal-on-scroll">
            <div class="lp-feat__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)` }">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="brand.colors.primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                <path d="M18 14h-8" />
                <path d="M15 18h-5" />
                <path d="M10 6h8v4h-8V6Z" />
              </svg>
            </div>
            <h3>Cruza notícias com seus ativos</h3>
            <p>Notícia mexeu na sua PETR4? A Redentia encontra, lê, resume e avisa. 11 fontes de mídia financeira monitoradas.</p>
          </article>

          <!-- Feature 4: Chat IA (também via WhatsApp) -->
          <article class="lp-feat reveal-on-scroll">
            <div class="lp-feat__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)` }">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="brand.colors.primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>Pergunta. A IA responde.</h3>
            <p>"Por que minha carteira caiu hoje?" "Qual minha exposição a commodities?" "Devo comprar mais ITUB4?", pergunta no app <strong>ou no WhatsApp</strong>, ela responde com dados.</p>
            <div class="lp-feat__chat">
              <div class="lp-feat__chat-msg lp-feat__chat-msg--user">
                Por que minha carteira caiu?
              </div>
              <div class="lp-feat__chat-msg lp-feat__chat-msg--ai">
                Sua queda de -2,4% veio principalmente de PETR4 (-3,8%) por causa…
              </div>
            </div>
            <!-- Chip indicando WhatsApp -->
            <span class="lp-feat__channel-chip">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.4 1 2.8 1.2 3c.1.2 2 3.1 4.9 4.4.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4M12 21.7c-1.7 0-3.4-.5-4.9-1.3l-3.5.9.9-3.4C3.5 16 3 14.1 3 12.2 3 7.2 7.1 3.1 12 3.1S21 7.2 21 12.2 16.9 21.7 12 21.7M12 1c-6.1 0-11 4.9-11 11 0 1.9.5 3.7 1.4 5.4L1 23l5.7-1.4c1.6.9 3.4 1.4 5.3 1.4 6.1 0 11-4.9 11-11S18.1 1 12 1z"/></svg>
              Funciona no WhatsApp
            </span>
          </article>

          <!-- Feature 5: Dividendos -->
          <article class="lp-feat reveal-on-scroll">
            <div class="lp-feat__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)` }">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="brand.colors.primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
            </div>
            <h3>Calendário de dividendos</h3>
            <p>Quanto e quando cada ativo vai pagar. Com filtros por mês, por tipo, por ticker. Pra você se planejar.</p>
          </article>

          <!-- Feature 6: Benchmarks -->
          <article class="lp-feat reveal-on-scroll">
            <div class="lp-feat__icon" :style="{ background: `color-mix(in srgb, ${brand.colors.primary} 14%, transparent)` }">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="brand.colors.primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" x2="12" y1="20" y2="10" />
                <line x1="18" x2="18" y1="20" y2="4" />
                <line x1="6" x2="6" y1="20" y2="16" />
              </svg>
            </div>
            <h3>Compara com IBOV, CDI, IFIX</h3>
            <p>Sua carteira tá rendendo melhor ou pior que o mercado? Veja sem planilha.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ============ STRESS TEST PREVIEW ============
         Reproduz visualmente o StressTestCard que vive na /wallet.
         3 cards com tombstone year gigante atras, glowing numbers,
         barras animadas. Mensagem: "isso é o que você vê dentro do app".
    -->
    <section class="lp-stress">
      <div
        class="lp-stress__glow"
        aria-hidden="true"
        :style="{
          background: `radial-gradient(ellipse 70% 60% at 50% 0%, color-mix(in srgb, ${brand.colors.negative || '#dc2626'} 16%, transparent), transparent 65%)`,
        }"
      />
      <div class="lp-container">
        <header class="lp-section-head reveal-on-scroll">
          <p class="lp-eyebrow lp-eyebrow--center lp-eyebrow--pulsing lp-eyebrow--negative">
            <span class="lp-eyebrow__dot lp-eyebrow__dot--negative" aria-hidden="true" />
            Stress test real
          </p>
          <h2 class="lp-section-title">
            Você já parou pra pensar
            <span class="lp-section-title__italic lp-section-title__italic--gradient">como sua carteira sobreviveria a uma nova crise?</span>
          </h2>
          <p class="lp-section-lead">
            Calculamos o impacto na sua carteira em três cenários reais, dois que aconteceram e
            um futuro hipotético. Com base no comportamento histórico de cada classe de ativo.
          </p>
        </header>

        <div class="lp-stress__grid">
          <!-- COVID 2020 -->
          <article class="lp-stress-card lp-stress-card--crisis reveal-on-scroll" style="--reveal-delay: 0ms">
            <span class="lp-stress-card__year-bg" aria-hidden="true">2020</span>

            <div class="lp-stress-card__top">
              <span class="lp-stress-card__tag lp-stress-card__tag--real">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9"/><path d="M3 4v5h5"/><path d="M12 7v5l4 2"/></svg>
                Crise real
              </span>
              <span class="lp-stress-card__period">fev–mar 2020</span>
            </div>

            <header class="lp-stress-card__head">
              <div class="lp-stress-card__icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11.9" cy="11.9" r="8.8"/><circle cx="11.9" cy="11.9" r="1.5"/><path d="M11.9 3.1v2.6"/><path d="M11.9 18.1v2.6"/><path d="M3.1 11.9h2.6"/><path d="M18.1 11.9h2.6"/></svg>
              </div>
              <h3 class="lp-stress-card__name">Pandemia COVID-19</h3>
            </header>

            <p class="lp-stress-card__headline">
              Choque global de liquidez. IBOV cedeu 45% em 32 dias, S&amp;P 500 perdeu 34%, FIIs caíram 34%.
            </p>

            <div class="lp-stress-card__impact">
              <div class="lp-stress-card__impact-row">
                <span class="lp-stress-card__impact-label">Carteira balanceada</span>
                <span class="lp-stress-card__impact-baseline">IBOV -45,0%</span>
              </div>
              <div class="lp-stress-card__impact-numbers">
                <span class="lp-stress-card__impact-pct">-34,2%</span>
              </div>
              <div class="lp-stress-card__bar" aria-hidden="true">
                <div class="lp-stress-card__bar-fill" style="width: 68%" />
              </div>
            </div>

            <footer class="lp-stress-card__foot">
              <span class="lp-stress-card__foot-item">⏱ Choque: <strong>32 dias</strong></span>
              <span class="lp-stress-card__foot-dot">·</span>
              <span class="lp-stress-card__foot-item">↗ Recuperação: <strong>~5 meses</strong></span>
            </footer>
          </article>

          <!-- 2008 SUBPRIME -->
          <article class="lp-stress-card lp-stress-card--severe reveal-on-scroll" style="--reveal-delay: 120ms">
            <span class="lp-stress-card__year-bg" aria-hidden="true">2008</span>

            <div class="lp-stress-card__top">
              <span class="lp-stress-card__tag lp-stress-card__tag--real">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9"/><path d="M3 4v5h5"/><path d="M12 7v5l4 2"/></svg>
                Crise real
              </span>
              <span class="lp-stress-card__period">set 2008 – mar 2009</span>
            </div>

            <header class="lp-stress-card__head">
              <div class="lp-stress-card__icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
              </div>
              <h3 class="lp-stress-card__name">Crise do Subprime</h3>
            </header>

            <p class="lp-stress-card__headline">
              Colapso bancário global após a falência do Lehman Brothers. IBOV recuou 54%, S&amp;P 500 perdeu 57%.
            </p>

            <div class="lp-stress-card__impact">
              <div class="lp-stress-card__impact-row">
                <span class="lp-stress-card__impact-label">Carteira balanceada</span>
                <span class="lp-stress-card__impact-baseline">IBOV -54,0%</span>
              </div>
              <div class="lp-stress-card__impact-numbers">
                <span class="lp-stress-card__impact-pct">-41,8%</span>
              </div>
              <div class="lp-stress-card__bar" aria-hidden="true">
                <div class="lp-stress-card__bar-fill" style="width: 84%" />
              </div>
            </div>

            <footer class="lp-stress-card__foot">
              <span class="lp-stress-card__foot-item">⏱ Choque: <strong>6 meses</strong></span>
              <span class="lp-stress-card__foot-dot">·</span>
              <span class="lp-stress-card__foot-item">↗ Recuperação: <strong>~2,5 anos</strong></span>
            </footer>
          </article>

          <!-- AI BUBBLE 202? -->
          <article class="lp-stress-card lp-stress-card--projection reveal-on-scroll" style="--reveal-delay: 240ms">
            <span class="lp-stress-card__year-bg" aria-hidden="true">202?</span>

            <div class="lp-stress-card__top">
              <span class="lp-stress-card__tag lp-stress-card__tag--projection">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m10.6 8.5-7.4 7.4 5 5L17.5 12.4"/><path d="m12.4 7.4 4.2 4.2"/><path d="M22 6.5 17.5 11l-3-3L19 3.5"/></svg>
                Projeção futura
              </span>
              <span class="lp-stress-card__period">2026–2027</span>
            </div>

            <header class="lp-stress-card__head">
              <div class="lp-stress-card__icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M20 15h2"/></svg>
              </div>
              <h3 class="lp-stress-card__name">Estouro da bolha de IA</h3>
            </header>

            <p class="lp-stress-card__headline">
              Cenário hipotético: tese dos hyperscalers (Nvidia, Microsoft, Meta) é revisada bruscamente. BDRs e ETFs sofrem mais.
            </p>

            <div class="lp-stress-card__impact">
              <div class="lp-stress-card__impact-row">
                <span class="lp-stress-card__impact-label">Carteira balanceada</span>
                <span class="lp-stress-card__impact-baseline">IBOV -25,0%</span>
              </div>
              <div class="lp-stress-card__impact-numbers">
                <span class="lp-stress-card__impact-pct">-22,5%</span>
              </div>
              <div class="lp-stress-card__bar" aria-hidden="true">
                <div class="lp-stress-card__bar-fill" style="width: 45%" />
              </div>
            </div>

            <footer class="lp-stress-card__foot">
              <span class="lp-stress-card__foot-item">⏱ Choque: <strong>~12 meses</strong></span>
              <span class="lp-stress-card__foot-dot">·</span>
              <span class="lp-stress-card__foot-item">↗ Recuperação: <strong>18-24 meses</strong></span>
            </footer>
          </article>
        </div>

        <!-- Disclaimer + CTA inline -->
        <div class="lp-stress__disclaimer reveal-on-scroll">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <span>
            Estimativas baseadas no comportamento histórico de cada classe de ativo. Os números acima usam uma carteira balanceada (50% ações / 30% FIIs / 20% Tesouro). <strong>Sua carteira real, com seus pesos exatos, fica disponível dentro do app.</strong>
          </span>
        </div>
      </div>
    </section>

    <!-- ============ CARTA MENSAL (carta aberta, sem animação) ============
         Carta chique posicionada no centro. Sem animação scroll-driven
         pq o efeito não estava bom. Apenas reveal-on-scroll padrão pra
         entrada suave. Visual mantém o tom editorial/correspondência. -->
    <section class="lp-carta">
      <div
        class="lp-carta__glow"
        aria-hidden="true"
        :style="{
          background: `radial-gradient(ellipse 70% 60% at 50% 30%, color-mix(in srgb, ${brand.colors.primary} 14%, transparent), transparent 70%)`,
        }"
      />

      <div class="lp-container">
        <!-- Header acima da carta -->
        <header class="lp-carta__head reveal-on-scroll">
          <p class="lp-eyebrow lp-eyebrow--pulsing lp-eyebrow--center">
            <span class="lp-eyebrow__dot" aria-hidden="true" />
            CARTA MENSAL · ASSINADA PELA REDENTIA
          </p>
          <h2 class="lp-carta__title">
            Toda primeira segunda do mês,
            <span class="lp-carta__title-em">uma carta. Sua.</span>
          </h2>
          <p class="lp-carta__lead">
            Não é newsletter. É um relatório editorial assinado pela Redentia, contando o que
            aconteceu com cada ativo seu, dividendos recebidos, eventos relevantes e três
            sugestões da IA pro próximo mês. <strong>Chega no email e no WhatsApp.</strong>
          </p>
        </header>

        <!-- A CARTA em si — papel chique, aberta, centralizada -->
        <article class="lp-carta__letter reveal-on-scroll">
          <!-- Watermark sutil REDENTIA atrás do conteúdo -->
          <span class="lp-carta__letter-watermark" aria-hidden="true">REDENTIA</span>

          <!-- Header da carta -->
          <header class="lp-carta__letter-head">
            <span class="lp-carta__letter-edition">Edição IV · Outubro 2026</span>
            <div class="lp-carta__letter-monogram" aria-hidden="true">R</div>
            <span class="lp-carta__letter-date">São Paulo, 04 de outubro</span>
          </header>

          <!-- Saudação -->
          <p class="lp-carta__letter-salut">Caro <em>André</em>,</p>

          <!-- Corpo principal -->
          <p class="lp-carta__letter-body">
            Outubro tratou bem a sua carteira. O retorno no mês foi de
            <strong class="lp-carta__hl-positive">+4,82%</strong>, à frente do IBOV em
            <strong>1,84 ponto percentual</strong> e do CDI em
            <strong>3,21 pontos</strong>. Os destaques vieram dos seus ativos de
            <em>commodities</em> e da alocação em <em>FIIs de papel</em>.
          </p>

          <!-- Stats inline elegantes -->
          <div class="lp-carta__letter-stats">
            <div class="lp-carta__letter-stat">
              <span class="lp-carta__letter-stat-value">+4,82<span class="lp-carta__letter-stat-pct">%</span></span>
              <span class="lp-carta__letter-stat-label">Retorno do mês</span>
            </div>
            <div class="lp-carta__letter-stat lp-carta__letter-stat--divider" />
            <div class="lp-carta__letter-stat">
              <span class="lp-carta__letter-stat-value lp-carta__letter-stat-value--small">R$ 487</span>
              <span class="lp-carta__letter-stat-label">Dividendos recebidos</span>
            </div>
            <div class="lp-carta__letter-stat lp-carta__letter-stat--divider" />
            <div class="lp-carta__letter-stat">
              <span class="lp-carta__letter-stat-value lp-carta__letter-stat-value--small">3</span>
              <span class="lp-carta__letter-stat-label">Fatos relevantes</span>
            </div>
          </div>

          <p class="lp-carta__letter-body">
            <span class="lp-carta__letter-dropcap">N</span>esta edição da sua carta, você encontra a análise completa do mês,
            a curadoria de notícias que mexeram com seus ativos, os <strong>dividendos
            que vão cair em novembro</strong>, e três sugestões da nossa IA pra ajustar
            a carteira sem se afobar.
          </p>

          <!-- Régua ornamental -->
          <div class="lp-carta__letter-rule" aria-hidden="true">
            <span class="lp-carta__letter-rule-orn">❦</span>
          </div>

          <!-- TOC dentro da carta -->
          <ol class="lp-carta__letter-toc">
            <li><span>I.</span> Performance do mês <em>vs.</em> IBOV, CDI &amp; IFIX</li>
            <li><span>II.</span> Dividendos recebidos &amp; YTD</li>
            <li><span>III.</span> Eventos &amp; fatos relevantes da carteira</li>
            <li><span>IV.</span> Três sugestões da IA pra próximo mês</li>
            <li><span>V.</span> Calendário de novembro: datas-com &amp; pagamentos</li>
          </ol>

          <!-- Signature -->
          <footer class="lp-carta__letter-foot">
            <p class="lp-carta__letter-closing">Com afeto e disciplina,</p>
            <span class="lp-carta__letter-signature">Redentia</span>
            <span class="lp-carta__letter-meta">A IA que cuida da sua carteira</span>
          </footer>

          <!-- Selo final embaixo no canto -->
          <div class="lp-carta__letter-stamp" aria-hidden="true">
            <span>RDT</span>
          </div>
        </article>

        <!-- Channels strip embaixo -->
        <div class="lp-carta__channels-strip reveal-on-scroll">
          <span class="lp-carta__channels-label">A mesma carta chega em:</span>
          <div class="lp-carta__channels-list">
            <span class="lp-carta__channel-pill">
              <span class="lp-carta__channel-pill-icon lp-carta__channel-pill-icon--email">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </span>
              <strong>Email</strong> com PDF
            </span>
            <span class="lp-carta__channel-pill">
              <span class="lp-carta__channel-pill-icon lp-carta__channel-pill-icon--whats">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.4 1 2.8 1.2 3c.1.2 2 3.1 4.9 4.4.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.4M12 21.7c-1.7 0-3.4-.5-4.9-1.3l-3.5.9.9-3.4C3.5 16 3 14.1 3 12.2 3 7.2 7.1 3.1 12 3.1S21 7.2 21 12.2 16.9 21.7 12 21.7M12 1c-6.1 0-11 4.9-11 11 0 1.9.5 3.7 1.4 5.4L1 23l5.7-1.4c1.6.9 3.4 1.4 5.3 1.4 6.1 0 11-4.9 11-11S18.1 1 12 1z"/></svg>
              </span>
              <strong>WhatsApp</strong> com PDF e resumo
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ POR DENTRO (visual proof) ============
         Mostra 2 dos componentes mais "uau" do produto:
         1. Snowflake (radar 5-axis, igual SimplyWall.st)
         2. Chat com IA (conversa real-feeling)
         Via SVG/HTML inline pra nao puxar deps reais do produto
         (que pesariam o bundle). Mockup estatico mas convincente. -->
    <section class="lp-inside">
      <div
        class="lp-inside__glow"
        aria-hidden="true"
        :style="{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, color-mix(in srgb, ${brand.colors.primary} 18%, transparent), transparent 65%)`,
        }"
      />
      <div class="lp-container">
        <header class="lp-section-head reveal-on-scroll">
          <p class="lp-eyebrow">POR DENTRO DA REDENTIA</p>
          <h2 class="lp-section-title">
            Não é só um app de saldo.
            <span class="lp-section-title__italic">É um analista 24/7.</span>
          </h2>
        </header>

        <div class="lp-inside__grid">
          <!-- ====== CARD 1: SNOWFLAKE RADAR ====== -->
          <article class="lp-inside__card">
            <header class="lp-inside__card-head">
              <p class="lp-inside__card-eyebrow">PERFIL DA CARTEIRA</p>
              <h3>Snowflake</h3>
              <p class="lp-inside__card-desc">
                5 eixos analisados pela IA: <strong>Valor, Futuro, Passado, Saúde, Dividendos</strong>. Veja onde sua carteira é forte e onde tem brecha.
              </p>
            </header>

            <!-- SNOWFLAKE SVG — radar 5 axis -->
            <div class="lp-snowflake">
              <svg viewBox="0 0 360 360" overflow="visible" aria-hidden="true">
                <!-- Concentric pentagons -->
                <g>
                  <!-- 4 anéis -->
                  <polygon points="180,90 268,153 234,257 126,257 92,153" fill="none" :stroke="`color-mix(in srgb, ${brand.colors.text} 8%, transparent)`" stroke-width="1" />
                  <polygon points="180,135 224,166 207,218 153,218 136,166" fill="none" :stroke="`color-mix(in srgb, ${brand.colors.text} 8%, transparent)`" stroke-width="1" />
                  <polygon points="180,157 202,173 193,200 167,200 158,173" fill="none" :stroke="`color-mix(in srgb, ${brand.colors.text} 8%, transparent)`" stroke-width="1" />
                  <polygon points="180,45 356,170 290,304 70,304 4,170" fill="none" :stroke="`color-mix(in srgb, ${brand.colors.text} 16%, transparent)`" stroke-width="1.2" />
                </g>
                <!-- Spokes -->
                <g>
                  <line x1="180" y1="180" x2="180" y2="45" :stroke="`color-mix(in srgb, ${brand.colors.text} 8%, transparent)`" stroke-width="1" />
                  <line x1="180" y1="180" x2="356" y2="170" :stroke="`color-mix(in srgb, ${brand.colors.text} 8%, transparent)`" stroke-width="1" />
                  <line x1="180" y1="180" x2="290" y2="304" :stroke="`color-mix(in srgb, ${brand.colors.text} 8%, transparent)`" stroke-width="1" />
                  <line x1="180" y1="180" x2="70" y2="304" :stroke="`color-mix(in srgb, ${brand.colors.text} 8%, transparent)`" stroke-width="1" />
                  <line x1="180" y1="180" x2="4" y2="170" :stroke="`color-mix(in srgb, ${brand.colors.text} 8%, transparent)`" stroke-width="1" />
                </g>
                <!-- Filled snowflake polygon -->
                <defs>
                  <radialGradient id="lp-snowflake-fill" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" :stop-color="brand.colors.primary" stop-opacity="0.85" />
                    <stop offset="100%" :stop-color="brand.colors.primary" stop-opacity="0.45" />
                  </radialGradient>
                </defs>
                <!-- 5 pontos: Valor (76), Futuro (45), Passado (88), Saúde (62), Dividendos (92) -->
                <polygon
                  points="180,77 248,237 207,295 130,278 8,170"
                  fill="url(#lp-snowflake-fill)"
                  :stroke="brand.colors.primary"
                  stroke-width="2"
                  stroke-linejoin="round"
                />
                <!-- Score dots on tips -->
                <circle cx="180" cy="77" r="5" :fill="brand.colors.primary" />
                <circle cx="248" cy="237" r="5" :fill="brand.colors.primary" />
                <circle cx="207" cy="295" r="5" :fill="brand.colors.primary" />
                <circle cx="130" cy="278" r="5" :fill="brand.colors.primary" />
                <circle cx="8" cy="170" r="5" :fill="brand.colors.primary" />
                <!-- Axis labels -->
                <text x="180" y="32" text-anchor="middle" class="lp-snowflake__label">VALOR</text>
                <text x="180" y="50" text-anchor="middle" class="lp-snowflake__score">76</text>

                <text x="356" y="167" text-anchor="middle" class="lp-snowflake__label">FUTURO</text>
                <text x="356" y="183" text-anchor="middle" class="lp-snowflake__score">45</text>

                <text x="290" y="328" text-anchor="middle" class="lp-snowflake__label">PASSADO</text>
                <text x="290" y="344" text-anchor="middle" class="lp-snowflake__score">88</text>

                <text x="70" y="328" text-anchor="middle" class="lp-snowflake__label">SAÚDE</text>
                <text x="70" y="344" text-anchor="middle" class="lp-snowflake__score">62</text>

                <text x="4" y="167" text-anchor="middle" class="lp-snowflake__label">DIVIDENDOS</text>
                <text x="4" y="183" text-anchor="middle" class="lp-snowflake__score">92</text>
              </svg>
            </div>

            <div class="lp-inside__readout">
              <div class="lp-inside__readout-item">
                <span class="lp-inside__readout-label">Mais forte</span>
                <span class="lp-inside__readout-value" :style="{ color: brand.colors.primary }">Dividendos · 92</span>
              </div>
              <div class="lp-inside__readout-item">
                <span class="lp-inside__readout-label">Brecha</span>
                <span class="lp-inside__readout-value">Futuro · 45</span>
              </div>
            </div>
          </article>

          <!-- ====== CARD 2: CHAT WITH AI ====== -->
          <article class="lp-inside__card">
            <header class="lp-inside__card-head">
              <p class="lp-inside__card-eyebrow">CONVERSA COM A IA</p>
              <h3>Pergunte. Ela responde.</h3>
              <p class="lp-inside__card-desc">
                Sua carteira no contexto. Em linguagem direta, com <strong>dados auditáveis</strong>. Sem jargão.
              </p>
            </header>

            <!-- Chat mockup -->
            <div class="lp-chat">
              <!-- Top: chat header -->
              <div class="lp-chat__topbar">
                <span class="lp-chat__avatar" :style="{ background: brand.colors.primary }">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  </svg>
                </span>
                <div class="lp-chat__topinfo">
                  <span class="lp-chat__title">Assessor com IA</span>
                  <span class="lp-chat__status">
                    <span class="lp-chat__online" :style="{ background: brand.colors.positive || '#10b981' }" />
                    Online · responde em segundos
                  </span>
                </div>
              </div>

              <!-- Messages -->
              <div class="lp-chat__msgs">
                <div class="lp-chat__msg lp-chat__msg--user">
                  Por que minha carteira caiu hoje?
                </div>

                <div class="lp-chat__msg lp-chat__msg--ai">
                  Sua queda de <strong>-2,4%</strong> hoje veio principalmente de:
                  <ul class="lp-chat__list">
                    <li>PETR4 <strong style="color: var(--brand-negative, #dc2626)">-3,8%</strong>, petróleo recuou após reunião OPEC</li>
                    <li>VALE3 <strong style="color: var(--brand-negative, #dc2626)">-2,1%</strong>, minério caiu na China</li>
                  </ul>
                  Sua exposição a commodities tá em <strong>42%</strong>. Quer que eu analise alternativas pra rebalancear?
                </div>

                <div class="lp-chat__msg lp-chat__msg--user">
                  Sim, mostra opções
                </div>

                <div class="lp-chat__typing">
                  <span /><span /><span />
                </div>
              </div>

              <!-- Bottom: chat input mockup -->
              <div class="lp-chat__inputbar">
                <span class="lp-chat__input-placeholder">Pergunta o que quiser sobre sua carteira…</span>
                <span class="lp-chat__send" :style="{ background: brand.colors.primary }">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m5 12 7-7 7 7" /><path d="M12 19V5" />
                  </svg>
                </span>
              </div>
            </div>
          </article>
        </div>

        <!-- Bottom row: 3 mini stat cards -->
        <div class="lp-inside__stats">
          <div class="lp-inside__stat">
            <div class="lp-inside__stat-num" :style="{ color: brand.colors.primary }">11</div>
            <div class="lp-inside__stat-label">fontes de notícia<br>monitoradas 24/7</div>
          </div>
          <div class="lp-inside__stat">
            <div class="lp-inside__stat-num" :style="{ color: brand.colors.primary }">B3</div>
            <div class="lp-inside__stat-label">cotações oficiais<br>em tempo real</div>
          </div>
          <div class="lp-inside__stat">
            <div class="lp-inside__stat-num" :style="{ color: brand.colors.primary }">100%</div>
            <div class="lp-inside__stat-label">dados auditáveis<br>(B3, Tesouro, BCB)</div>
          </div>
          <div class="lp-inside__stat">
            <div class="lp-inside__stat-num" :style="{ color: brand.colors.primary }">24/7</div>
            <div class="lp-inside__stat-label">monitora seus ativos<br>enquanto você dorme</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ VEJA NA PRATICA (video click-to-play) ============
         Mostra o produto rodando depois que user ja absorveu features
         (texto) + por-dentro (mockups). Vídeo so baixa quando user clica
         no poster — preload=none, sem custo pra quem nao engaja. -->
    <section class="lp-video">
      <div class="lp-container">
        <header class="lp-section-head reveal-on-scroll">
          <p class="lp-eyebrow">VEJA NA PRÁTICA</p>
          <h2 class="lp-section-title">
            60 segundos pra ver o que sua corretora
            <span class="lp-section-title__italic">nunca vai te mostrar.</span>
          </h2>
        </header>

        <div class="lp-video__frame">
          <!-- Estado 1: poster + play overlay (não baixa o MP4) -->
          <button
            v-if="!videoPlaying"
            type="button"
            class="lp-video__poster-wrap"
            aria-label="Tocar vídeo de apresentação"
            @click="playVideo"
          >
            <img
              :src="videoPoster"
              alt="Apresentação do Raio-X"
              class="lp-video__poster"
              loading="lazy"
              decoding="async"
            />
            <div class="lp-video__play-overlay">
              <span class="lp-video__play-btn" :style="{ background: brand.colors.primary }">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="0">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span class="lp-video__play-label">Tocar vídeo · 60s</span>
            </div>
            <span class="lp-video__badge">
              <span class="lp-video__badge-dot" :style="{ background: brand.colors.primary }" />
              Apresentação Redent.IA
            </span>
          </button>

          <!-- Estado 2: video tocando (so monta apos click, ai baixa) -->
          <video
            v-else
            ref="videoElRef"
            class="lp-video__player"
            :src="videoSrc"
            :poster="videoPoster"
            controls
            playsinline
            preload="auto"
          />
        </div>

        <!-- CTA repetido abaixo do video — momento de pico de engajamento -->
        <div class="lp-video__cta">
          <p class="lp-video__cta-line">
            Convencido? <strong>Faça o seu Raio-X agora.</strong>
          </p>
          <form class="lp-video__form" novalidate @submit.prevent="submitEmail">
            <input
              v-model="email"
              type="email"
              class="lp-hero__input"
              placeholder="Digite seu email"
              autocomplete="email"
              inputmode="email"
              spellcheck="false"
              autocapitalize="none"
              required
            >
            <button
              type="submit"
              class="lp-hero__cta"
              :disabled="!isValid"
            >
              <span>{{ submitting ? 'Enviando…' : (submitted ? 'Verifique seu email ✓' : 'Faça meu Raio-X grátis') }}</span>
              <svg v-if="!submitting && !submitted" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14m-7-7l7 7l-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </section>

    <!-- ============ COMPARISON TABLE ============ -->
    <section class="lp-compare">
      <div class="lp-container">
        <header class="lp-section-head reveal-on-scroll">
          <p class="lp-eyebrow">A DIFERENÇA</p>
          <h2 class="lp-section-title">
            Sua corretora mostra <em>o quê.</em>
            <span class="lp-section-title__italic">A Redentia mostra o <em>por quê</em>.</span>
          </h2>
        </header>

        <div class="lp-compare__table">
          <div class="lp-compare__col lp-compare__col--bad">
            <div class="lp-compare__head">Sua corretora</div>
            <ul>
              <li>Mostra o saldo</li>
              <li>Você adivinha o motivo</li>
              <li>Reage depois que cai</li>
              <li>Análise manual em planilha</li>
              <li>Sem alertas inteligentes</li>
              <li>Notícias soltas</li>
            </ul>
          </div>
          <div class="lp-compare__col lp-compare__col--good">
            <div class="lp-compare__head">A Redentia</div>
            <ul>
              <li><strong>Mostra o motivo</strong></li>
              <li><strong>Você sabe o que aconteceu</strong></li>
              <li><strong>Antecipa movimentos</strong></li>
              <li><strong>IA cruza tudo automaticamente</strong></li>
              <li><strong>Alertas em tempo real</strong></li>
              <li><strong>Notícias conectadas aos seus ativos</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ FINAL CTA ============ -->
    <section class="lp-final">
      <div
        class="lp-final__glow"
        aria-hidden="true"
        :style="{
          background: `radial-gradient(ellipse 60% 70% at 50% 50%, color-mix(in srgb, ${brand.colors.primary} 32%, transparent), transparent 70%)`,
        }"
      />
      <div class="lp-container">
        <div class="lp-final__inner">
          <p class="lp-eyebrow">PRONTO QUANDO VOCÊ ESTIVER</p>
          <h2 class="lp-section-title">
            Comece grátis.
            <span class="lp-section-title__italic">Sem cartão. Sem enrolação.</span>
          </h2>
          <p class="lp-final__lead">
            Em 30 segundos você cadastra. Em 2 minutos vê o motivo de cada ativo da sua carteira.
          </p>

          <form class="lp-final__form" novalidate @submit.prevent="submitEmail">
            <input
              v-model="email"
              type="email"
              class="lp-hero__input"
              placeholder="Digite seu email"
              autocomplete="email"
              inputmode="email"
              spellcheck="false"
              autocapitalize="none"
              required
            >
            <button
              type="submit"
              class="lp-hero__cta"
              :disabled="!isValid"
            >
              <span>{{ submitting ? 'Enviando…' : (submitted ? 'Verifique seu email ✓' : 'Faça meu Raio-X grátis') }}</span>
              <svg v-if="!submitting && !submitted" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14m-7-7l7 7l-7 7" />
              </svg>
            </button>
          </form>

          <p class="lp-final__legal">
            Te enviamos um link mágico no email. Sem senha pra criar.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ============================================================
   LANDING PAGE — design system
   ============================================================
   Tipografia escala generosa, gradientes amber atmosféricos,
   mockups visuais inline, comparação table com contraste.
   Inspirado: Mercury, Linear, Stripe, Wealthfront.
   ============================================================ */

.lp {
  width: 100%;
  position: relative;
  overflow-x: hidden;
}

/* ============ SCROLL PERFORMANCE ============
   content-visibility: auto faz o browser skipar rendering de sections
   que estao off-screen (com layout reservado via contain-intrinsic-size).
   Resultado: scroll smooth mesmo com varias sections com glows/animations.
   Aplicamos so nas sections abaixo do hero (a fold). Hero precisa
   renderizar imediatamente. */
.lp-problem,
.lp-features,
.lp-inside,
.lp-video,
.lp-compare,
.lp-final {
  content-visibility: auto;
  contain-intrinsic-size: 1px 800px;
}

.lp-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

@media (min-width: 768px) {
  .lp-container { padding: 0 40px; }
}

/* Eyebrow microtipográfico amber tracking-wide */
.lp-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
  margin: 0;
}
.lp-eyebrow--center { text-align: center; }

/* Section title — light weight, letter-spacing negativa */
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

.lp-section-title em {
  font-style: normal;
  font-family: 'Instrument Serif', serif;
  font-weight: 400;
}

.lp-section-head {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 48px;
}
@media (min-width: 768px) { .lp-section-head { margin-bottom: 64px; } }

/* ============ HERO ============ */
.lp-hero {
  position: relative;
  padding: 56px 0 72px;
  isolation: isolate;
}
@media (min-width: 768px) { .lp-hero { padding: 88px 0 112px; } }

/* IMPORTANTE: blur(100px) e enorme custo de pixel pro compositor. Em pages
   com varios glows + scroll continuo, isso trava. Reduzi pra 60px (visual
   praticamente identico) + adicionei will-change pra browser otimizar a
   layer separadamente. Mesmo aplicado nos outros .__glow abaixo. */
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
@media (min-width: 1024px) {
  .lp-hero__grid {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    gap: 64px;
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
@media (min-width: 768px) { .lp-hero__headline { font-size: 64px; } }

.lp-hero__dots {
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.lp-hero__italic {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
  display: block;
  margin-top: 4px;
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

.lp-hero__form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
  width: 100%;
  max-width: 520px;
}
@media (min-width: 540px) {
  .lp-hero__form { flex-direction: row; }
}

.lp-hero__input {
  flex: 1;
  padding: 16px 20px;
  border-radius: 14px;
  border: 1.5px solid color-mix(in srgb, var(--brand-border) 75%, transparent);
  background: var(--brand-surface);
  color: var(--brand-text);
  font-family: var(--brand-font);
  font-size: 16px;
  letter-spacing: -0.005em;
  transition: border-color 200ms, box-shadow 200ms;
}
.lp-hero__input::placeholder {
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.lp-hero__input:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand-primary) 20%, transparent);
}

.lp-hero__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
}
.lp-hero__cta:hover:not(:disabled) {
  filter: brightness(0.94);
  transform: translateY(-1px);
  box-shadow: 0 18px 40px -12px color-mix(in srgb, var(--brand-primary) 75%, transparent);
}
.lp-hero__cta:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  filter: grayscale(0.2);
}

.lp-hero__error {
  font-size: 12px;
  color: var(--brand-negative, #dc2626);
  background: color-mix(in srgb, var(--brand-negative, #dc2626) 8%, transparent);
  padding: 8px 12px;
  border-radius: 8px;
  margin: 0;
  max-width: 520px;
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

/* ============ HERO MOCKUP (visual to right) ============ */
.lp-hero__visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* IMPORTANTE: removi rotateY/rotateX (3D transforms). Em scroll, browsers
   recalculam transform de elementos com 3D pra resolver z-index, causando
   stutter especialmente em mobile. Mantive translateY no hover (2D, barato)
   + box-shadow expansion pra dar sensacao de "lift" sem custo de scroll.

   REMOVI overflow:hidden — estava clipando os floats (badges "Alerta..."
   e "Dividendo..."). Substitui por border-radius nos elementos internos
   (head/body) pra manter visualmente os rounded corners. */
.lp-mockup {
  position: relative;
  width: 100%;
  max-width: 480px;
  border-radius: 22px;
  background: var(--brand-surface);
  border: 1px solid color-mix(in srgb, var(--brand-border) 65%, transparent);
  box-shadow:
    0 32px 80px -24px color-mix(in srgb, var(--brand-primary) 32%, transparent),
    0 16px 40px -12px rgba(0, 0, 0, 0.18);
  transition: transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 320ms;
  /* Cria camada compositor propria, isola dos repaints da page */
  will-change: transform;
  transform: translateZ(0);
}
@media (min-width: 1024px) {
  .lp-mockup:hover {
    transform: translateY(-6px);
    box-shadow:
      0 40px 96px -24px color-mix(in srgb, var(--brand-primary) 40%, transparent),
      0 20px 48px -12px rgba(0, 0, 0, 0.22);
  }
}

.lp-mockup__head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: color-mix(in srgb, var(--brand-background) 50%, var(--brand-surface));
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  /* Rounded matching mockup top corners (sem overflow:hidden no parent) */
  border-radius: 22px 22px 0 0;
}
.lp-mockup__dots {
  display: flex;
  gap: 6px;
}
.lp-mockup__dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--brand-text) 18%, transparent);
}
.lp-mockup__dots span:nth-child(1) { background: #ff5f57; }
.lp-mockup__dots span:nth-child(2) { background: #febc2e; }
.lp-mockup__dots span:nth-child(3) { background: #28c840; }

.lp-mockup__url {
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  letter-spacing: 0;
}

.lp-mockup__body { padding: 22px 24px 26px; }

.lp-mockup__eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
  margin: 0 0 14px;
}

.lp-mockup__score {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 14px 0 18px;
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 40%, transparent);
}
.lp-mockup__score-label {
  grid-column: 1;
  font-size: 13px;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}
.lp-mockup__score-value {
  grid-column: 1;
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 2px;
}
.lp-mockup__score-num {
  font-size: 32px;
  font-weight: 600;
  color: var(--brand-negative, #dc2626);
  letter-spacing: -0.025em;
  line-height: 1;
}
.lp-mockup__score-period {
  font-size: 12px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.lp-mockup__sparkline {
  grid-column: 2;
  grid-row: 1 / 3;
  width: 110px;
  height: 50px;
}
.lp-mockup__sparkline svg {
  width: 100%;
  height: 100%;
}

.lp-mockup__cause-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brand-primary);
  margin: 16px 0 10px;
}
.lp-mockup__causes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.lp-mockup__causes li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  line-height: 1.45;
  color: var(--brand-text);
}
.lp-mockup__bullet {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
}

.lp-mockup__ai {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 18px;
  padding: 12px 14px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-primary) 22%, transparent);
}
.lp-mockup__ai-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  flex-shrink: 0;
}
.lp-mockup__ai-text {
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--brand-text);
}
.lp-mockup__ai-text strong { color: var(--brand-primary); font-weight: 600; }

/* Floating notification badges */
.lp-mockup__float {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: var(--brand-surface);
  border: 1px solid color-mix(in srgb, var(--brand-border) 80%, transparent);
  box-shadow: 0 12px 32px -12px rgba(0, 0, 0, 0.22);
  font-size: 12px;
  white-space: nowrap;
  color: var(--brand-text);
  z-index: 2;
  animation: lp-float-in 800ms cubic-bezier(0.22, 0.61, 0.36, 1) backwards;
}
.lp-mockup__float--top {
  top: -16px;
  right: -10px;
  animation-delay: 600ms;
}
.lp-mockup__float--bottom {
  bottom: 24px;
  left: -10px;
  animation-delay: 1100ms;
}
@media (min-width: 1024px) {
  .lp-mockup__float--top { right: -36px; }
  .lp-mockup__float--bottom { left: -36px; }
}
.lp-mockup__float strong { font-weight: 600; color: var(--brand-text); }
.lp-mockup__float-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: lp-pulse 2s ease-in-out infinite;
}
.lp-mockup__float-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex-shrink: 0;
}

@keyframes lp-float-in {
  from { opacity: 0; transform: translateY(12px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes lp-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(0.78); }
}

/* ============ TICKER BAR ============ */
.lp-tickerbar {
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
  background: color-mix(in srgb, var(--brand-surface) 50%, var(--brand-background));
  padding: 18px 0;
}

.lp-tickerbar__inner {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}
@media (min-width: 768px) {
  .lp-tickerbar__inner {
    flex-direction: row;
    justify-content: space-between;
    gap: 24px;
  }
}

.lp-tickerbar__live {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-feature-settings: "tnum";
}
.lp-tickerbar__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: lp-pulse 2s ease-in-out infinite;
}
.lp-tickerbar__num {
  font-weight: 700;
  color: var(--brand-text);
}
.lp-tickerbar__label {
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}

.lp-tickerbar__sources {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  font-size: 12px;
}
.lp-tickerbar__source-label {
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
.lp-tickerbar__source {
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
}

/* ============ PROBLEMA ============ */
.lp-problem {
  padding: 80px 0;
}
@media (min-width: 768px) { .lp-problem { padding: 112px 0; } }

.lp-problem__inner {
  text-align: center;
  max-width: 760px;
  margin: 0 auto;
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
.lp-problem__cta-line {
  margin-top: 36px;
  font-size: 22px;
  color: var(--brand-primary);
}
.lp-problem__cta-line strong {
  color: var(--brand-primary);
  font-weight: 600;
}
@media (min-width: 768px) { .lp-problem__cta-line { font-size: 28px; } }

/* ============ FEATURES ============ */
.lp-features {
  padding: 80px 0 96px;
}
@media (min-width: 768px) { .lp-features { padding: 112px 0 128px; } }

.lp-features__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}
@media (min-width: 640px) {
  .lp-features__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .lp-features__grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }
}

.lp-feat {
  position: relative;
  padding: 28px 26px 30px;
  border-radius: 18px;
  background: var(--brand-surface);
  border: 1px solid color-mix(in srgb, var(--brand-border) 55%, transparent);
  transition: border-color 220ms, transform 220ms, box-shadow 220ms;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.lp-feat:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 50%, transparent);
  transform: translateY(-2px);
  box-shadow: 0 20px 40px -16px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}

.lp-feat--highlight {
  border-color: color-mix(in srgb, var(--brand-primary) 32%, transparent);
  box-shadow: 0 16px 36px -16px color-mix(in srgb, var(--brand-primary) 22%, transparent);
}
.lp-feat--highlight::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 18px;
  padding: 1px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 60%, transparent), transparent);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
}

.lp-feat__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 11px;
}

.lp-feat h3 {
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.015em;
  color: var(--brand-text);
  margin: 0;
  line-height: 1.25;
}
.lp-feat h3 em {
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-weight: 400;
  color: var(--brand-primary);
}

.lp-feat p {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 72%, transparent);
}
.lp-feat p strong {
  color: var(--brand-text);
  font-weight: 600;
}

.lp-feat__viz {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lp-feat__bar {
  height: 6px;
  border-radius: 999px;
  transition: width 800ms ease-out;
}

.lp-feat__alerts {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}
.lp-feat__alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--brand-background) 55%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
  font-size: 12.5px;
  color: var(--brand-text);
}
.lp-feat__alert-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  animation: lp-pulse 2s ease-in-out infinite;
}

.lp-feat__chat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}
.lp-feat__chat-msg {
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 12.5px;
  line-height: 1.4;
  max-width: 92%;
}
.lp-feat__chat-msg--user {
  align-self: flex-end;
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
  color: var(--brand-text);
  border-bottom-right-radius: 4px;
}
.lp-feat__chat-msg--ai {
  align-self: flex-start;
  background: color-mix(in srgb, var(--brand-background) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
  color: color-mix(in srgb, var(--brand-text) 85%, transparent);
  border-bottom-left-radius: 4px;
}

/* ============ POR DENTRO (snowflake + chat demo) ============ */
.lp-inside {
  position: relative;
  padding: 80px 0 96px;
  isolation: isolate;
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
}
@media (min-width: 768px) { .lp-inside { padding: 112px 0 128px; } }

.lp-inside__glow {
  position: absolute;
  inset: 10% -20% auto -20%;
  height: 80%;
  filter: blur(60px);
  z-index: -1;
  pointer-events: none;
  opacity: 0.7;
  will-change: opacity;
  transform: translateZ(0);
}

.lp-inside__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 1024px) {
  .lp-inside__grid {
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }
}

.lp-inside__card {
  display: flex;
  flex-direction: column;
  padding: 28px 24px;
  border-radius: 22px;
  background: var(--brand-surface);
  border: 1px solid color-mix(in srgb, var(--brand-border) 55%, transparent);
  box-shadow:
    0 32px 80px -28px color-mix(in srgb, var(--brand-primary) 22%, transparent),
    0 12px 32px -12px rgba(0, 0, 0, 0.10);
  transition: transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 320ms;
}
@media (min-width: 768px) {
  .lp-inside__card { padding: 36px 32px; }
}
.lp-inside__card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 40px 96px -28px color-mix(in srgb, var(--brand-primary) 32%, transparent),
    0 16px 40px -12px rgba(0, 0, 0, 0.14);
}

.lp-inside__card-head {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 4px;
}
.lp-inside__card-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand-primary);
  margin: 0;
}
.lp-inside__card h3 {
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -0.022em;
  color: var(--brand-text);
  margin: 0;
  line-height: 1.15;
}
@media (min-width: 768px) {
  .lp-inside__card h3 { font-size: 28px; }
}
.lp-inside__card-desc {
  margin: 8px 0 0;
  font-size: 14.5px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
}
.lp-inside__card-desc strong {
  color: var(--brand-text);
  font-weight: 600;
}

/* ====== SNOWFLAKE ====== */
.lp-snowflake {
  display: flex;
  justify-content: center;
  padding: 24px 0 8px;
}
.lp-snowflake svg {
  width: 100%;
  max-width: 380px;
  height: auto;
  overflow: visible;
}
:deep(.lp-snowflake__label),
.lp-snowflake__label {
  font-family: var(--brand-font);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  fill: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
:deep(.lp-snowflake__score),
.lp-snowflake__score {
  font-family: var(--brand-font);
  font-size: 12px;
  font-weight: 700;
  fill: var(--brand-primary);
  font-feature-settings: "tnum";
}

.lp-inside__readout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
}
.lp-inside__readout-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.lp-inside__readout-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}
.lp-inside__readout-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--brand-text);
}

/* ====== CHAT MOCKUP ====== */
.lp-chat {
  display: flex;
  flex-direction: column;
  margin-top: 22px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--brand-background) 50%, var(--brand-surface));
  border: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
  overflow: hidden;
}

.lp-chat__topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--brand-surface);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
}
.lp-chat__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  flex-shrink: 0;
}
.lp-chat__topinfo { display: flex; flex-direction: column; gap: 2px; }
.lp-chat__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--brand-text);
}
.lp-chat__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.lp-chat__online {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: lp-pulse 2s ease-in-out infinite;
}

.lp-chat__msgs {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}
.lp-chat__msg {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13.5px;
  line-height: 1.5;
  max-width: 88%;
}
.lp-chat__msg--user {
  align-self: flex-end;
  background: color-mix(in srgb, var(--brand-primary) 20%, transparent);
  color: var(--brand-text);
  border-bottom-right-radius: 4px;
  font-weight: 500;
}
.lp-chat__msg--ai {
  align-self: flex-start;
  background: var(--brand-surface);
  border: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
  color: var(--brand-text);
  border-bottom-left-radius: 4px;
}
.lp-chat__msg--ai strong { color: var(--brand-text); font-weight: 600; }

.lp-chat__list {
  list-style: none;
  margin: 8px 0 8px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.lp-chat__list li {
  font-size: 12.5px;
  line-height: 1.5;
}

.lp-chat__typing {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  border-radius: 14px;
  background: var(--brand-surface);
  border: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
  border-bottom-left-radius: 4px;
}
.lp-chat__typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--brand-text) 35%, transparent);
  animation: lp-typing-bounce 1.4s ease-in-out infinite;
}
.lp-chat__typing span:nth-child(2) { animation-delay: 0.2s; }
.lp-chat__typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes lp-typing-bounce {
  0%, 60%, 100% { opacity: 0.35; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-4px); }
}

.lp-chat__inputbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--brand-surface);
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
}
.lp-chat__input-placeholder {
  flex: 1;
  font-size: 13px;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}
.lp-chat__send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  flex-shrink: 0;
}

/* ====== STATS ROW (4 mini cards) ====== */
.lp-inside__stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-top: 36px;
}
@media (min-width: 768px) {
  .lp-inside__stats {
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    margin-top: 56px;
  }
}

.lp-inside__stat {
  text-align: center;
  padding: 22px 16px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--brand-surface) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
}
.lp-inside__stat-num {
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1;
}
@media (min-width: 768px) { .lp-inside__stat-num { font-size: 38px; } }

.lp-inside__stat-label {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.45;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}

/* ============ VIDEO SECTION ============ */
.lp-video {
  padding: 80px 0 96px;
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
}
@media (min-width: 768px) { .lp-video { padding: 112px 0 128px; } }

.lp-video__frame {
  position: relative;
  max-width: 920px;
  margin: 0 auto;
  border-radius: 22px;
  overflow: hidden;
  background: var(--brand-surface);
  border: 1px solid color-mix(in srgb, var(--brand-border) 55%, transparent);
  aspect-ratio: 16 / 9;
  box-shadow:
    0 32px 80px -28px color-mix(in srgb, var(--brand-primary) 28%, transparent),
    0 16px 40px -12px rgba(0, 0, 0, 0.18);
  /* Cria layer compositor proprio pra animation do hover/play nao
     repintar a section inteira */
  contain: layout paint;
}

/* ====== POSTER + PLAY OVERLAY ====== */
.lp-video__poster-wrap {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
}

.lp-video__poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 600ms cubic-bezier(0.22, 0.61, 0.36, 1), filter 320ms;
  filter: brightness(0.85);
}

.lp-video__poster-wrap:hover .lp-video__poster {
  transform: scale(1.02);
  filter: brightness(0.78);
}

.lp-video__play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 2;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 30%,
    rgba(0, 0, 0, 0.18) 100%
  );
}

.lp-video__play-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  border-radius: 999px;
  box-shadow:
    0 24px 60px -12px color-mix(in srgb, var(--brand-primary) 65%, transparent),
    0 0 0 14px color-mix(in srgb, var(--brand-primary) 18%, transparent);
  /* Pulse subtle */
  animation: lp-video-pulse 2.5s ease-in-out infinite;
  transition: transform 240ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.lp-video__poster-wrap:hover .lp-video__play-btn {
  transform: scale(1.08);
}

@media (min-width: 768px) {
  .lp-video__play-btn { width: 92px; height: 92px; }
  .lp-video__play-btn svg { width: 36px; height: 36px; }
}

@keyframes lp-video-pulse {
  0%, 100% {
    box-shadow:
      0 24px 60px -12px color-mix(in srgb, var(--brand-primary) 65%, transparent),
      0 0 0 14px color-mix(in srgb, var(--brand-primary) 18%, transparent),
      0 0 0 0 color-mix(in srgb, var(--brand-primary) 25%, transparent);
  }
  50% {
    box-shadow:
      0 24px 60px -12px color-mix(in srgb, var(--brand-primary) 65%, transparent),
      0 0 0 14px color-mix(in srgb, var(--brand-primary) 18%, transparent),
      0 0 0 28px color-mix(in srgb, var(--brand-primary) 0%, transparent);
  }
}
@media (prefers-reduced-motion: reduce) {
  .lp-video__play-btn { animation: none; }
}

.lp-video__play-label {
  font-family: var(--brand-font);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #fff;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* "Apresentação Redent.IA" badge no canto superior esquerdo */
.lp-video__badge {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.lp-video__badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: lp-pulse 2s ease-in-out infinite;
}

/* ====== VIDEO PLAYING STATE ====== */
.lp-video__player {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

/* ====== CTA BELOW VIDEO ====== */
.lp-video__cta {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
@media (min-width: 768px) { .lp-video__cta { margin-top: 48px; } }

.lp-video__cta-line {
  font-size: 17px;
  line-height: 1.5;
  color: color-mix(in srgb, var(--brand-text) 80%, transparent);
  margin: 0;
  text-align: center;
}
.lp-video__cta-line strong {
  color: var(--brand-text);
  font-weight: 600;
}
@media (min-width: 768px) { .lp-video__cta-line { font-size: 19px; } }

.lp-video__form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 520px;
}
@media (min-width: 540px) {
  .lp-video__form { flex-direction: row; }
}

/* ============ COMPARISON ============ */
.lp-compare {
  padding: 80px 0;
  background: color-mix(in srgb, var(--brand-surface) 35%, var(--brand-background));
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
}
@media (min-width: 768px) { .lp-compare { padding: 112px 0; } }

.lp-compare__table {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-width: 920px;
  margin: 0 auto;
}
@media (min-width: 768px) {
  .lp-compare__table {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
}

.lp-compare__col {
  padding: 28px 26px 32px;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--brand-border) 40%, transparent);
}
.lp-compare__col ul {
  list-style: none;
  padding: 0;
  margin: 18px 0 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.lp-compare__col li {
  font-size: 15px;
  line-height: 1.5;
  padding-left: 24px;
  position: relative;
}

.lp-compare__col--bad {
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
}
.lp-compare__col--bad .lp-compare__head {
  font-size: 13px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
  font-weight: 600;
}
.lp-compare__col--bad li {
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}
.lp-compare__col--bad li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--brand-text) 12%, transparent);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5'%3E%3Cline x1='18' y1='6' x2='6' y2='18'/%3E%3Cline x1='6' y1='6' x2='18' y2='18'/%3E%3C/svg%3E");
  background-size: 60% 60%;
  background-position: center;
  background-repeat: no-repeat;
}

.lp-compare__col--good {
  background: color-mix(in srgb, var(--brand-primary) 8%, transparent);
  border-color: color-mix(in srgb, var(--brand-primary) 38%, transparent);
  box-shadow: 0 24px 48px -20px color-mix(in srgb, var(--brand-primary) 28%, transparent);
}
.lp-compare__col--good .lp-compare__head {
  font-size: 13px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--brand-primary);
  font-weight: 700;
}
.lp-compare__col--good li {
  color: var(--brand-text);
}
.lp-compare__col--good li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: color-mix(in srgb, var(--brand-primary) 22%, transparent);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23F5A623' stroke-width='3'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
  background-size: 65% 65%;
  background-position: center;
  background-repeat: no-repeat;
}
.lp-compare__col--good li strong {
  font-weight: 600;
}

/* ============ FINAL CTA ============ */
.lp-final {
  position: relative;
  padding: 96px 0 112px;
  text-align: center;
  isolation: isolate;
}
@media (min-width: 768px) { .lp-final { padding: 128px 0 144px; } }

.lp-final__glow {
  position: absolute;
  inset: -10% -10%;
  filter: blur(60px);
  z-index: -1;
  pointer-events: none;
  opacity: 0.7;
  will-change: opacity;
  transform: translateZ(0);
}

.lp-final__inner {
  max-width: 720px;
  margin: 0 auto;
}

.lp-final__lead {
  margin: 18px auto 32px;
  max-width: 580px;
  font-size: 16px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--brand-text) 75%, transparent);
}

.lp-final__form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 520px;
  margin: 0 auto;
}
@media (min-width: 540px) {
  .lp-final__form { flex-direction: row; }
}

.lp-final__legal {
  margin: 18px auto 0;
  font-size: 12.5px;
  color: color-mix(in srgb, var(--brand-text) 55%, transparent);
}

/* =================================================================
 * EFEITOS WOW (mesmos da /wallet) — eyebrow pulsante + tombstone
 * digit + scroll reveal + magnetic CTA + stress test cards.
 * ================================================================= */

/* ============ EYEBROW PULSANTE ============ */
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

.lp-eyebrow__dot--negative {
  background: var(--brand-negative, #dc2626);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-negative, #dc2626) 25%, transparent);
}

.lp-eyebrow--negative {
  color: var(--brand-negative, #dc2626) !important;
}

@keyframes lp-eyebrow-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(0.8); }
}

/* ============ TOMBSTONE DIGIT (atrás do mockup) ============ */
.lp-hero__visual {
  position: relative;
}

.lp-hero__tombstone {
  position: absolute;
  top: -40px;
  right: -10px;
  font-family: var(--brand-font);
  font-weight: 100;
  font-size: clamp(140px, 18vw, 240px);
  line-height: 0.85;
  letter-spacing: -0.06em;
  color: color-mix(in srgb, var(--brand-primary) 12%, transparent);
  user-select: none;
  pointer-events: none;
  z-index: 0;
  white-space: nowrap;
}

@media (max-width: 880px) {
  .lp-hero__tombstone { display: none; }
}

.lp-hero__visual .lp-mockup {
  position: relative;
  z-index: 1;
}

/* ============ SOCIAL PROOF (counter animado) ============ */
.lp-social-proof {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 22px;
  padding: 12px 14px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-border) 40%, transparent);
  width: fit-content;
}

.lp-social-proof__avatars {
  display: flex;
  align-items: center;
}

.lp-social-proof__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 30%, var(--brand-surface)) 0%, color-mix(in srgb, var(--brand-primary) 14%, var(--brand-surface)) 100%);
  border: 2px solid var(--brand-background);
  font-family: var(--brand-font);
  font-size: 11px;
  font-weight: 700;
  color: var(--brand-text);
  margin-left: -8px;
}

.lp-social-proof__avatar:first-child { margin-left: 0; }

.lp-social-proof__avatar--more {
  background: var(--brand-primary);
  color: var(--text-on-primary, var(--brand-background, #fff));
}

.lp-social-proof__copy {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.lp-social-proof__count {
  font-size: 13px;
  color: var(--brand-text);
  font-variant-numeric: tabular-nums;
}

.lp-social-proof__count strong {
  font-weight: 700;
  color: var(--brand-primary);
  margin-right: 4px;
}

.lp-social-proof__sub {
  font-size: 11.5px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

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

/* ============ STRESS TEST SECTION ============ */
.lp-stress {
  position: relative;
  padding: 96px 0;
  overflow: hidden;
}

.lp-stress__glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.lp-stress > .lp-container {
  position: relative;
  z-index: 1;
}

.lp-stress__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  margin-top: 40px;
}

@media (min-width: 1024px) {
  .lp-stress__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Section title gradient italic (mais dramático que o italic comum) */
.lp-section-title__italic--gradient {
  background: linear-gradient(
    100deg,
    var(--brand-negative, #dc2626) 0%,
    #f59e0b 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* ============ STRESS TEST CARD (clone visual do wallet) ============ */
.lp-stress-card {
  --tone: var(--brand-negative, #dc2626);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px 22px 18px;
  border-radius: 24px;
  border: 1px solid color-mix(in srgb, var(--tone) 20%, transparent);
  background:
    radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--tone) 22%, transparent) 0%, transparent 60%),
    linear-gradient(180deg,
      color-mix(in srgb, var(--tone) 8%, var(--brand-surface)) 0%,
      color-mix(in srgb, var(--brand-surface) 85%, var(--brand-background)) 100%
    );
  position: relative;
  overflow: hidden;
  transition: border-color 220ms, transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 220ms;
}

.lp-stress-card--crisis  { --tone: var(--brand-negative, #dc2626); }
.lp-stress-card--severe  { --tone: #ef4444; }
.lp-stress-card--projection { --tone: #f59e0b; }

.lp-stress-card:hover {
  border-color: color-mix(in srgb, var(--tone) 50%, transparent);
  transform: translateY(-4px);
  box-shadow:
    0 28px 56px -22px color-mix(in srgb, var(--tone) 55%, transparent),
    0 0 0 1px color-mix(in srgb, var(--tone) 25%, transparent);
}

/* Tombstone year (gigante, atrás do conteúdo) */
.lp-stress-card__year-bg {
  position: absolute;
  bottom: -38px;
  right: -10px;
  font-family: var(--brand-font);
  font-weight: 100;
  font-size: 180px;
  line-height: 0.85;
  letter-spacing: -0.06em;
  color: color-mix(in srgb, var(--tone) 14%, transparent);
  user-select: none;
  pointer-events: none;
  z-index: 0;
}

.lp-stress-card > *:not(.lp-stress-card__year-bg) {
  position: relative;
  z-index: 1;
}

/* TOP TAG ROW */
.lp-stress-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.lp-stress-card__tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.lp-stress-card__tag--real {
  background: color-mix(in srgb, var(--tone) 14%, transparent);
  color: var(--tone);
  border: 1px solid color-mix(in srgb, var(--tone) 30%, transparent);
}

.lp-stress-card__tag--projection {
  background: color-mix(in srgb, #f59e0b 14%, transparent);
  color: #f59e0b;
  border: 1px solid color-mix(in srgb, #f59e0b 30%, transparent);
}

.lp-stress-card__period {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

/* HEAD */
.lp-stress-card__head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lp-stress-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 13px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--tone) 22%, transparent) 0%,
    color-mix(in srgb, var(--tone) 8%, transparent) 100%
  );
  border: 1px solid color-mix(in srgb, var(--tone) 35%, transparent);
  color: var(--tone);
  flex-shrink: 0;
  box-shadow: 0 6px 18px -8px color-mix(in srgb, var(--tone) 50%, transparent);
}

.lp-stress-card__name {
  margin: 0;
  font-family: var(--brand-font);
  font-size: 18px;
  font-weight: 500;
  letter-spacing: -0.018em;
  color: var(--brand-text);
  line-height: 1.2;
}

.lp-stress-card__headline {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--brand-text) 70%, transparent);
}

/* IMPACT (HERO!) */
.lp-stress-card__impact {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-radius: 16px;
  background:
    radial-gradient(ellipse at center top, color-mix(in srgb, var(--tone) 18%, transparent) 0%, transparent 70%),
    color-mix(in srgb, var(--tone) 6%, var(--brand-background));
  border: 1px solid color-mix(in srgb, var(--tone) 28%, transparent);
  position: relative;
  overflow: hidden;
}

.lp-stress-card__impact::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--tone) 60%, transparent), transparent);
}

.lp-stress-card__impact-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.lp-stress-card__impact-label {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}

.lp-stress-card__impact-baseline {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.lp-stress-card__impact-numbers {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.lp-stress-card__impact-pct {
  font-family: var(--brand-font);
  font-weight: 100;
  font-size: clamp(48px, 6.4vw, 64px);
  line-height: 0.95;
  letter-spacing: -0.05em;
  color: var(--tone);
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 40px color-mix(in srgb, var(--tone) 50%, transparent);
}

.lp-stress-card__bar {
  height: 5px;
  width: 100%;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-text) 6%, transparent);
  overflow: hidden;
  margin-top: 4px;
}

.lp-stress-card__bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--tone) 0%, color-mix(in srgb, var(--tone) 70%, white) 100%);
  border-radius: 999px;
  box-shadow: 0 0 12px color-mix(in srgb, var(--tone) 50%, transparent);
}

/* FOOTER */
.lp-stress-card__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
  padding-top: 14px;
  margin-top: auto;
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 30%, transparent);
  font-size: 11px;
  color: color-mix(in srgb, var(--brand-text) 60%, transparent);
}

.lp-stress-card__foot-item strong {
  font-weight: 600;
  color: var(--brand-text);
}

.lp-stress-card__foot-dot {
  opacity: 0.5;
}

/* DISCLAIMER */
.lp-stress__disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 28px auto 0;
  padding: 14px 18px;
  max-width: 900px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--brand-text) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-border) 35%, transparent);
  font-size: 12.5px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}

.lp-stress__disclaimer strong {
  color: var(--brand-text);
  font-weight: 600;
}

@media (max-width: 640px) {
  .lp-stress-card__year-bg {
    font-size: 140px;
    bottom: -28px;
  }
  .lp-stress { padding: 64px 0; }
}

.lp-section-lead {
  margin: 12px auto 0;
  max-width: 720px;
  font-size: 14.5px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
  text-align: center;
}

/* ============ HERO CTA: SHIMMER EFFECT ============ */
.lp-hero__cta {
  position: relative;
  overflow: hidden;
}

.lp-hero__cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 30%, color-mix(in srgb, white 25%, transparent) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 700ms ease;
  pointer-events: none;
}

.lp-hero__cta:hover::before,
.lp-hero__cta:focus-visible::before {
  transform: translateX(100%);
}

/* =================================================================
 * OPEN FINANCE feature card (chips de bancos + badge BCB)
 * ================================================================= */
.lp-feat__bank-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.lp-feat__bank-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 11px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--brand-text) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--brand-text);
}

.lp-feat__bank-chip--more {
  background: color-mix(in srgb, var(--brand-positive, #10b981) 12%, transparent);
  border-color: color-mix(in srgb, var(--brand-positive, #10b981) 30%, transparent);
  color: var(--brand-positive, #10b981);
}

.lp-feat__official-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 12px;
  padding: 5px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-positive, #10b981) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--brand-positive, #10b981) 28%, transparent);
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--brand-positive, #10b981);
  width: fit-content;
}

/* Chip "Funciona no WhatsApp" no card de chat */
.lp-feat__channel-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 12px;
  padding: 5px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, #25d366 12%, transparent);
  border: 1px solid color-mix(in srgb, #25d366 32%, transparent);
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #25d366;
  width: fit-content;
}

/* =================================================================
 * CARTA MENSAL — carta aberta (sem animação scroll-driven)
 * ================================================================= */
.lp-carta {
  position: relative;
  padding: 96px 0;
  background: color-mix(in srgb, var(--brand-surface) 30%, var(--brand-background));
  border-top: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--brand-border) 25%, transparent);
  isolation: isolate;
}

@media (max-width: 768px) {
  .lp-carta { padding: 64px 0; }
}

.lp-carta__glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.lp-carta > .lp-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.lp-carta__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
  max-width: 720px;
}

.lp-carta__title {
  margin: 0;
  font-family: var(--brand-font);
  font-weight: 200;
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: var(--brand-text);
}

.lp-carta__title-em {
  font-style: italic;
  font-weight: 300;
  background: linear-gradient(100deg,
    var(--brand-primary) 0%,
    color-mix(in srgb, var(--brand-primary) 60%, white) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.lp-carta__lead {
  margin: 6px 0 0;
  max-width: 640px;
  font-size: 14.5px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--brand-text) 65%, transparent);
}

.lp-carta__lead strong {
  color: var(--brand-text);
  font-weight: 600;
}

/* === A CARTA === */
.lp-carta__letter {
  position: relative;
  width: min(640px, 92vw);
  display: flex;
  flex-direction: column;
  padding: 44px 52px 36px;
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
    0 32px 80px -20px rgba(0, 0, 0, 0.55),
    0 0 0 1px color-mix(in srgb, var(--brand-primary) 25%, transparent),
    inset 0 0 80px -20px rgba(170, 130, 60, 0.12);
  font-family: 'Cormorant Garamond', 'Garamond', 'Georgia', serif;
  color: #2b2419;
  overflow: hidden;
  transform: rotate(-0.3deg);
}

@media (max-width: 640px) {
  .lp-carta__letter { padding: 28px 24px 24px; }
}

.lp-carta__letter-watermark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cormorant Garamond', 'Georgia', serif;
  font-size: clamp(80px, 16vw, 160px);
  font-weight: 300;
  letter-spacing: 0.16em;
  color: rgba(170, 130, 60, 0.06);
  pointer-events: none;
  user-select: none;
  z-index: 0;
  transform: rotate(-8deg);
  white-space: nowrap;
}

.lp-carta__letter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1px dashed rgba(170, 130, 60, 0.3);
  position: relative;
  z-index: 1;
}

.lp-carta__letter-edition,
.lp-carta__letter-date {
  font-family: 'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace;
  font-size: 9.5px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #8a7a5a;
}

.lp-carta__letter-monogram {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: linear-gradient(135deg, #b8860b 0%, #8b6914 100%);
  color: #fdfaf2;
  font-family: 'Cormorant Garamond', 'Georgia', serif;
  font-size: 22px;
  font-weight: 600;
  font-style: italic;
  box-shadow: 0 4px 10px -2px rgba(139, 105, 20, 0.5);
}

.lp-carta__letter-salut {
  margin: 22px 0 12px;
  font-family: 'Cormorant Garamond', 'Garamond', 'Georgia', serif;
  font-size: 26px;
  font-weight: 400;
  color: #2b2419;
  position: relative;
  z-index: 1;
}

.lp-carta__letter-salut em {
  font-style: italic;
  font-weight: 500;
}

.lp-carta__letter-body {
  margin: 10px 0;
  font-family: 'Cormorant Garamond', 'Garamond', 'Georgia', serif;
  font-size: 16px;
  line-height: 1.7;
  color: #3a3122;
  text-align: justify;
  hyphens: auto;
  position: relative;
  z-index: 1;
}

.lp-carta__letter-body strong {
  font-weight: 600;
  color: #2b2419;
}

.lp-carta__letter-body em {
  font-style: italic;
}

.lp-carta__hl-positive {
  color: #15803d !important;
  font-weight: 700 !important;
}

.lp-carta__letter-dropcap {
  float: left;
  font-family: 'Cormorant Garamond', 'Georgia', serif;
  font-size: 46px;
  font-weight: 600;
  line-height: 0.85;
  margin: 6px 10px 0 0;
  color: #b8860b;
}

.lp-carta__letter-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  margin: 20px 0;
  background: linear-gradient(135deg,
    rgba(184, 134, 11, 0.06) 0%,
    rgba(184, 134, 11, 0.02) 100%
  );
  border-top: 1px solid rgba(170, 130, 60, 0.22);
  border-bottom: 1px solid rgba(170, 130, 60, 0.22);
  position: relative;
  z-index: 1;
}

.lp-carta__letter-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  text-align: center;
}

.lp-carta__letter-stat--divider {
  flex: 0 0 1px;
  width: 1px;
  height: 36px;
  background: rgba(170, 130, 60, 0.25);
}

.lp-carta__letter-stat-value {
  font-family: 'Cormorant Garamond', 'Georgia', serif;
  font-size: 30px;
  font-weight: 500;
  line-height: 1;
  color: #15803d;
  font-variant-numeric: tabular-nums;
}

.lp-carta__letter-stat-value--small {
  font-size: 22px;
  color: #2b2419;
  font-weight: 600;
}

.lp-carta__letter-stat-pct {
  font-size: 16px;
  font-weight: 400;
  color: #15803d;
  margin-left: 1px;
}

.lp-carta__letter-stat-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #8a7a5a;
}

@media (max-width: 480px) {
  .lp-carta__letter-stats { gap: 8px; padding: 12px 14px; }
  .lp-carta__letter-stat-value { font-size: 22px; }
  .lp-carta__letter-stat-value--small { font-size: 16px; }
  .lp-carta__letter-stat-label { font-size: 8px; letter-spacing: 0.12em; }
}

.lp-carta__letter-rule {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 18px 0;
  position: relative;
  z-index: 1;
}

.lp-carta__letter-rule::before,
.lp-carta__letter-rule::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(170, 130, 60, 0.35), transparent);
}

.lp-carta__letter-rule-orn {
  margin: 0 14px;
  font-size: 16px;
  color: #b8860b;
}

.lp-carta__letter-toc {
  display: flex;
  flex-direction: column;
  gap: 6px;
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  font-family: 'Cormorant Garamond', 'Garamond', 'Georgia', serif;
  font-size: 15px;
  line-height: 1.55;
  color: #3a3122;
  position: relative;
  z-index: 1;
}

.lp-carta__letter-toc li {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.lp-carta__letter-toc li > span {
  font-style: italic;
  color: #8b6914;
  font-weight: 600;
  flex-shrink: 0;
  min-width: 30px;
}

.lp-carta__letter-toc em {
  font-style: italic;
  color: #6b5f48;
}

.lp-carta__letter-foot {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px dashed rgba(170, 130, 60, 0.22);
  position: relative;
  z-index: 1;
}

.lp-carta__letter-closing {
  margin: 0;
  font-family: 'Cormorant Garamond', 'Georgia', serif;
  font-size: 16px;
  font-style: italic;
  color: #3a3122;
}

.lp-carta__letter-signature {
  font-family: 'Cormorant Garamond', 'Georgia', serif;
  font-size: 42px;
  font-weight: 500;
  font-style: italic;
  line-height: 1;
  color: #b8860b;
  letter-spacing: -0.02em;
  margin-top: 6px;
}

.lp-carta__letter-meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8a7a5a;
  margin-top: 4px;
}

.lp-carta__letter-stamp {
  position: absolute;
  bottom: 22px;
  left: 28px;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  border: 2px solid #b8860b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #b8860b;
  opacity: 0.6;
  transform: rotate(-8deg);
  z-index: 1;
}

@media (max-width: 640px) {
  .lp-carta__letter-stamp { width: 38px; height: 38px; font-size: 9px; bottom: 14px; left: 16px; }
  .lp-carta__letter-signature { font-size: 32px; }
  .lp-carta__letter-salut { font-size: 22px; }
  .lp-carta__letter-body { font-size: 14.5px; }
  .lp-carta__letter-toc { font-size: 13.5px; }
}

/* CHANNELS strip embaixo */
.lp-carta__channels-strip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.lp-carta__channels-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--brand-text) 50%, transparent);
}

.lp-carta__channels-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.lp-carta__channel-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand-surface) 80%, var(--brand-background));
  border: 1px solid color-mix(in srgb, var(--brand-border) 50%, transparent);
  font-size: 12.5px;
  color: var(--brand-text);
}

.lp-carta__channel-pill strong {
  font-weight: 600;
}

.lp-carta__channel-pill-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  flex-shrink: 0;
}

.lp-carta__channel-pill-icon--email {
  background: color-mix(in srgb, var(--brand-primary) 18%, transparent);
  color: var(--brand-primary);
}

.lp-carta__channel-pill-icon--whats {
  background: color-mix(in srgb, #25d366 18%, transparent);
  color: #25d366;
}
</style>

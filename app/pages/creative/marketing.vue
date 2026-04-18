<script setup lang="ts">
definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

// ============================================================
// Marketing Creative, 20 visual variants for social media
//
// All variants render at 1080x1080 (Instagram post) on the
// Redentia palette. Content is driven by query params so the
// same page generates 100+ distinct artes by changing params.
//
//   ?variant=terminal-hook       → terminal-style headline
//   ?variant=stat-big            → single huge statistic
//   ?variant=quote-card          → testimonial / founder quote
//   ?variant=before-after        → before/after split
//   ?variant=feature-grid        → 4 features grid
//   ?variant=price-duel          → vs competitor pricing
//   ?variant=code-preview        → curl + JSON response
//   ?variant=tenants-gallery     → 5 whitelabel tenants
//   ?variant=growth-hype         → growth race still
//   ?variant=myth-buster         → "mito vs verdade"
//   ?variant=step-list           → 1-2-3 steps
//   ?variant=ticker-spotlight    → single asset with logo
//   ?variant=ranking-mini        → top 5 leaderboard
//   ?variant=question-hook       → big question
//   ?variant=announcement        → "NOVO" release badge
//   ?variant=redentia-diff       → "o que nos torna diferentes"
//   ?variant=api-beta            → api public beta announcement
//   ?variant=wl-case             → whitelabel case study
//   ?variant=creative-promo      → creative studio promo
//   ?variant=manifesto           → big-text manifesto
// ============================================================

import { REDENTIA_COLORS as C, REDENTIA_FONTS as F, REDENTIA_GOOGLE_FONT_HREF } from '~/utils/redentiaCreativeColors'

const route = useRoute()

function q(key: string, fallback = ''): string {
  const v = route.query[key]
  if (typeof v === 'string') return v
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0]
  return fallback
}

const variant = computed(() => q('variant', 'terminal-hook'))
const title = computed(() => q('title', ''))
const subtitle = computed(() => q('subtitle', ''))
const stat = computed(() => q('stat', ''))
const statLabel = computed(() => q('stat_label', ''))
const eyebrow = computed(() => q('eyebrow', ''))
const cta = computed(() => q('cta', ''))
const accent = computed(() => q('accent', '') || C.primary)
const footer = computed(() => q('footer', 'REDENTIA.COM.BR'))
const badge = computed(() => q('badge', ''))

useHead(() => ({
  title: `Redentia, ${variant.value}`,
  meta: [
    { name: 'robots', content: 'noindex,nofollow,noarchive' },
    { name: 'viewport', content: 'width=1080, initial-scale=1' },
  ],
  link: [
    { rel: 'stylesheet', href: REDENTIA_GOOGLE_FONT_HREF },
  ],
}))

// Leaderboard data for the ranking-mini variant. Hardcoded because
// these artes are marketing screenshots, not live data.
const rankingRows = [
  { ticker: 'CALI3', name: 'CONST. A LINDON', change: '19,63' },
  { ticker: 'ESTR4', name: 'ESTRELA ON', change: '12,47' },
  { ticker: 'AZEV3', name: 'AZEVEDO ON', change: '4,35' },
  { ticker: 'RSID3', name: 'ROSSI RESID', change: '4,12' },
  { ticker: 'INEP4', name: 'INEPAR PN', change: '3,26' },
]
</script>

<template>
  <div class="stage">
    <div class="card">
      <!-- Background depth -->
      <div class="bg-layer amber" />
      <div class="bg-layer grid" />
      <div class="bg-layer scanlines" />

      <!-- Header (shared across variants) -->
      <div class="hdr">
        <div class="hdr-left">
          <img src="/brand/logo-icon.svg" alt="Redentia" class="hdr-logo" />
          <span class="hdr-name">REDENTIA</span>
        </div>
        <span class="hdr-right">{{ badge || eyebrow || 'REDENTIA.COM.BR' }}</span>
      </div>

      <!-- ============ VARIANT CONTENT ============ -->

      <!-- 01 · TERMINAL HOOK, amber eyebrow + big serif headline + curl box -->
      <div v-if="variant === 'terminal-hook'" class="body center-col">
        <span class="eyebrow">[ {{ eyebrow || 'NEW RELEASE' }} ]</span>
        <h1 class="serif-huge">
          {{ title || 'O mercado brasileiro,' }}
          <br />
          <span class="italic amber">{{ subtitle || 'em JSON.' }}</span>
        </h1>
        <div class="terminal-box">
          <div class="terminal-hdr">
            <span class="dot red" />
            <span class="dot amber" />
            <span class="dot green" />
            <span class="terminal-title">REDENTIA.MERCADO</span>
          </div>
          <div class="terminal-body">
            <div><span class="prompt">$</span> curl redentia.com.br/v1/tickers/PETR4</div>
            <div class="muted">✓ 200 OK · 42ms</div>
          </div>
        </div>
      </div>

      <!-- 02 · STAT BIG, single huge number -->
      <div v-else-if="variant === 'stat-big'" class="body center">
        <span class="eyebrow">[ {{ eyebrow || 'DATA' }} ]</span>
        <div class="stat-huge">{{ stat || '25K+' }}</div>
        <div class="stat-label">{{ statLabel || 'ATIVOS MONITORADOS EM TEMPO REAL' }}</div>
        <div class="sub-small">{{ subtitle || 'Ações · FIIs · ETFs · BDRs · Índices' }}</div>
      </div>

      <!-- 03 · QUOTE CARD -->
      <div v-else-if="variant === 'quote-card'" class="body center-col">
        <span class="eyebrow">[ {{ eyebrow || 'TESTEMUNHO' }} ]</span>
        <div class="quote-mark">"</div>
        <div class="quote-text">
          {{ title || 'Eu desliguei o scraper que quebrava toda semana. Migrei pra Redentia em uma sprint e esqueci o assunto.' }}
        </div>
        <div class="quote-author">
          <div class="author-avatar">
            <span>{{ subtitle?.slice(0, 2) || 'LF' }}</span>
          </div>
          <div class="author-info">
            <div class="author-name">{{ subtitle || 'Lucas Ferreira' }}</div>
            <div class="author-role">{{ cta || 'CTO · Growth Invest' }}</div>
          </div>
        </div>
      </div>

      <!-- 04 · BEFORE-AFTER split -->
      <div v-else-if="variant === 'before-after'" class="body no-center">
        <span class="eyebrow">[ {{ eyebrow || 'ANTES → DEPOIS' }} ]</span>
        <div class="ba-grid">
          <div class="ba-side ba-before">
            <div class="ba-label">ANTES</div>
            <div class="ba-text">{{ title || '15 min/dia abrindo home broker, brapi, status invest, 4 planilhas.' }}</div>
          </div>
          <div class="ba-divider">
            <span class="ba-arrow">→</span>
          </div>
          <div class="ba-side ba-after">
            <div class="ba-label amber">DEPOIS</div>
            <div class="ba-text">{{ subtitle || '1 push notification. Carteira consolidada. IA responde em 3s.' }}</div>
          </div>
        </div>
        <div class="ba-bottom">{{ cta || 'Redentia. A infraestrutura que faltava.' }}</div>
      </div>

      <!-- 05 · FEATURE GRID (4 features 2x2) -->
      <div v-else-if="variant === 'feature-grid'" class="body center-col">
        <span class="eyebrow">[ {{ eyebrow || 'O QUE VOCÊ GANHA' }} ]</span>
        <h2 class="serif-mid">{{ title || 'Tudo em um lugar só.' }}</h2>
        <div class="fg-grid">
          <div class="fg-item">
            <div class="fg-icon">📊</div>
            <div class="fg-title">Dados B3</div>
            <div class="fg-sub">Tempo real</div>
          </div>
          <div class="fg-item">
            <div class="fg-icon">🧮</div>
            <div class="fg-title">Calculadoras</div>
            <div class="fg-sub">8 ferramentas</div>
          </div>
          <div class="fg-item">
            <div class="fg-icon">🤖</div>
            <div class="fg-title">IA própria</div>
            <div class="fg-sub">Responde em 3s</div>
          </div>
          <div class="fg-item">
            <div class="fg-icon">💰</div>
            <div class="fg-title">Carteira</div>
            <div class="fg-sub">Consolidada</div>
          </div>
        </div>
      </div>

      <!-- 06 · PRICE DUEL (vs competitor) -->
      <div v-else-if="variant === 'price-duel'" class="body center-col">
        <span class="eyebrow">[ {{ eyebrow || 'MATH' }} ]</span>
        <h2 class="serif-mid">{{ title || 'Faça a conta.' }}</h2>
        <div class="pd-grid">
          <div class="pd-side pd-them">
            <div class="pd-brand">{{ subtitle || 'Outros' }}</div>
            <div class="pd-price">{{ statLabel || 'R$ 298' }}</div>
            <div class="pd-unit">/mês</div>
            <ul class="pd-bullets">
              <li>❌ Preço em USD</li>
              <li>❌ Sem Open Finance</li>
              <li>❌ Suporte em inglês</li>
            </ul>
          </div>
          <div class="pd-vs">VS</div>
          <div class="pd-side pd-us">
            <div class="pd-brand amber">{{ cta || 'Redentia' }}</div>
            <div class="pd-price amber">{{ stat || 'R$ 0' }}</div>
            <div class="pd-unit">pra sempre</div>
            <ul class="pd-bullets">
              <li>✅ BRL nativo</li>
              <li>✅ Open Finance BR</li>
              <li>✅ IA em português</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 07 · CODE PREVIEW, big curl box -->
      <div v-else-if="variant === 'code-preview'" class="body no-center">
        <span class="eyebrow">[ {{ eyebrow || 'DEVS' }} ]</span>
        <h2 class="serif-mid">{{ title || 'Menos parsing. Mais produto.' }}</h2>
        <div class="code-box">
          <div class="code-hdr">
            <span class="dot red" />
            <span class="dot amber" />
            <span class="dot green" />
            <span class="code-title">REDENTIA.API · v1</span>
          </div>
          <pre class="code-body"><code><span class="prompt">$</span> curl redentia.com.br/v1/tickers/PETR4

{
  <span class="amber">"symbol"</span>: <span class="green">"PETR4"</span>,
  <span class="amber">"name"</span>: <span class="green">"PETROBRAS PN"</span>,
  <span class="amber">"price"</span>: 49.03,
  <span class="amber">"change_pct"</span>: <span class="green">0.27</span>,
  <span class="amber">"dividend_yield"</span>: 16.33,
  <span class="amber">"pe_ratio"</span>: 6.18
}</code></pre>
        </div>
        <div class="code-foot">{{ cta || 'Menos de 50ms. Schema estável. A partir de R$ 49/mês.' }}</div>
      </div>

      <!-- 08 · TENANTS GALLERY (5 whitelabel) -->
      <div v-else-if="variant === 'tenants-gallery'" class="body center-col">
        <span class="eyebrow">[ {{ eyebrow || 'WHITE LABEL' }} ]</span>
        <h2 class="serif-mid">{{ title || '5 marcas. 1 infra.' }}</h2>
        <div class="tg-grid">
          <div class="tg-item" style="background:#0A0B0E">
            <div class="tg-name" style="color:#F5A623;font-family:'Instrument Serif'">Redentia</div>
          </div>
          <div class="tg-item" style="background:#F7F5EF">
            <div class="tg-name" style="color:#1C2133;font-family:'Fraunces';font-style:italic">Norte</div>
          </div>
          <div class="tg-item" style="background:#0F0D0B">
            <div class="tg-name" style="color:#FF6B35;font-family:'Fraunces';font-weight:700">Primo</div>
          </div>
          <div class="tg-item" style="background:#F6F1E8">
            <div class="tg-name" style="color:#C84B31;font-family:'IBM Plex Serif';font-style:italic">Sardinha</div>
          </div>
          <div class="tg-item" style="background:#1A0A2E">
            <div class="tg-name" style="color:#FACC15;font-family:'Poppins';font-weight:900">Me Poupe!</div>
          </div>
          <div class="tg-item tg-next">
            <div class="tg-name amber">{{ cta || 'Sua marca' }}</div>
            <div class="tg-sub">{{ subtitle || 'deploy em 1 semana' }}</div>
          </div>
        </div>
      </div>

      <!-- 09 · GROWTH HYPE, big stat + gain indicator -->
      <div v-else-if="variant === 'growth-hype'" class="body center">
        <span class="eyebrow">[ {{ eyebrow || 'PREGÃO' }} ]</span>
        <div class="gh-ticker">{{ title || 'PETR4' }}</div>
        <div class="gh-change amber">{{ stat || '+19,63%' }}</div>
        <div class="gh-period">{{ statLabel || 'NA SEMANA' }}</div>
        <div class="gh-sub">{{ subtitle || 'Acompanhe tudo em tempo real na Redentia.' }}</div>
      </div>

      <!-- 10 · MYTH BUSTER -->
      <div v-else-if="variant === 'myth-buster'" class="body no-center">
        <span class="eyebrow">[ {{ eyebrow || 'MITO vs VERDADE' }} ]</span>
        <div class="mb-grid">
          <div class="mb-side mb-myth">
            <div class="mb-label">MITO</div>
            <div class="mb-text">{{ title || '"Preciso ter R$ 5.000 pra começar a investir."' }}</div>
          </div>
          <div class="mb-side mb-truth">
            <div class="mb-label amber">VERDADE</div>
            <div class="mb-text">{{ subtitle || 'R$ 50 já compra fração de PETR4, BOVA11, ou um CDB de liquidez diária.' }}</div>
          </div>
        </div>
        <div class="mb-bottom">{{ cta || 'A Redentia te mostra por onde começar.' }}</div>
      </div>

      <!-- 11 · STEP LIST, 3 steps -->
      <div v-else-if="variant === 'step-list'" class="body no-center">
        <span class="eyebrow">[ {{ eyebrow || '3 PASSOS' }} ]</span>
        <h2 class="serif-mid">{{ title || 'Como funciona.' }}</h2>
        <ol class="sl-list">
          <li><span class="sl-num">1</span><span class="sl-text">{{ subtitle?.split('|')[0] || 'Crie sua conta grátis (sem cartão).' }}</span></li>
          <li><span class="sl-num">2</span><span class="sl-text">{{ subtitle?.split('|')[1] || 'Importe sua carteira via Open Finance.' }}</span></li>
          <li><span class="sl-num">3</span><span class="sl-text">{{ subtitle?.split('|')[2] || 'Pergunte qualquer coisa pra IA.' }}</span></li>
        </ol>
        <div class="sl-foot">{{ cta || 'Pronto. Sua carteira consolidada em 5 min.' }}</div>
      </div>

      <!-- 12 · TICKER SPOTLIGHT -->
      <div v-else-if="variant === 'ticker-spotlight'" class="body center-col">
        <span class="eyebrow">[ {{ eyebrow || 'DESTAQUE DO DIA' }} ]</span>
        <div class="ts-ticker">{{ title || 'VALE3' }}</div>
        <div class="ts-name">{{ subtitle || 'VALE ON · MINERAÇÃO' }}</div>
        <div class="ts-price">{{ stat || 'R$ 85,59' }}</div>
        <div class="ts-change amber">{{ statLabel || '+0,16% hoje · DY 7,42%' }}</div>
        <div class="ts-foot">{{ cta || 'Ver análise completa na Redentia' }}</div>
      </div>

      <!-- 13 · RANKING MINI (5-item leaderboard) -->
      <div v-else-if="variant === 'ranking-mini'" class="body no-center">
        <span class="eyebrow">[ {{ eyebrow || 'RANKING · TOP 5' }} ]</span>
        <h2 class="serif-mid">{{ title || 'Maiores altas da semana' }}</h2>
        <div class="rm-list">
          <div class="rm-row" v-for="(row, i) in rankingRows" :key="i">
            <span class="rm-rank">{{ i + 1 }}º</span>
            <span class="rm-ticker">{{ row.ticker }}</span>
            <span class="rm-name">{{ row.name }}</span>
            <span class="rm-change amber">+{{ row.change }}%</span>
          </div>
        </div>
        <div class="rm-foot">{{ cta || 'Ranking atualizado todo dia na Redentia' }}</div>
      </div>

      <!-- 14 · QUESTION HOOK, huge question -->
      <div v-else-if="variant === 'question-hook'" class="body center-col">
        <span class="eyebrow">[ {{ eyebrow || 'PERGUNTA QUE NINGUÉM FAZ' }} ]</span>
        <h1 class="serif-huge">
          {{ title || 'Quanto tempo' }}
          <br />
          <span class="italic amber">{{ subtitle || 'sua carteira gastou em home broker esse mês?' }}</span>
        </h1>
        <div class="qh-sub">{{ cta || 'A Redentia responde isso em 1 gráfico.' }}</div>
      </div>

      <!-- 15 · ANNOUNCEMENT (NOVO badge) -->
      <div v-else-if="variant === 'announcement'" class="body center">
        <div class="an-badge">NOVO</div>
        <h1 class="serif-huge mid">
          {{ title || 'Redentia API' }}
          <br />
          <span class="italic amber">{{ subtitle || 'já está no ar.' }}</span>
        </h1>
        <div class="an-sub">{{ cta || 'Primeiro mês grátis · 50+ endpoints · R$ 49/mês depois' }}</div>
      </div>

      <!-- 16 · REDENTIA DIFF, 3 differentials -->
      <div v-else-if="variant === 'redentia-diff'" class="body no-center">
        <span class="eyebrow">[ {{ eyebrow || 'O QUE NOS TORNA DIFERENTES' }} ]</span>
        <h2 class="serif-mid">{{ title || 'A única que é 100% brasileira.' }}</h2>
        <div class="rd-list">
          <div class="rd-item"><span class="rd-num amber">01</span>Dados direto da B3, não de scraping</div>
          <div class="rd-item"><span class="rd-num amber">02</span>IA treinada em renda variável BR</div>
          <div class="rd-item"><span class="rd-num amber">03</span>Gratuito pra sempre · Open Finance nativo</div>
        </div>
        <div class="rd-foot">{{ cta || 'redentia.com.br' }}</div>
      </div>

      <!-- 17 · API BETA announcement -->
      <div v-else-if="variant === 'api-beta'" class="body no-center">
        <span class="eyebrow amber">[ PUBLIC BETA ]</span>
        <h1 class="serif-huge mid">
          {{ title || 'Redentia API' }}
          <br />
          <span class="italic amber">{{ subtitle || 'é pra todos.' }}</span>
        </h1>
        <div class="ab-chips">
          <span class="chip">50+ ENDPOINTS</span>
          <span class="chip">&lt; 50ms LATENCY</span>
          <span class="chip">MCP READY</span>
          <span class="chip">R$ 49/MÊS</span>
        </div>
        <div class="ab-foot">{{ cta || 'api.redentia.com.br · primeiro mês grátis' }}</div>
      </div>

      <!-- 18 · WHITELABEL CASE -->
      <div v-else-if="variant === 'wl-case'" class="body no-center">
        <span class="eyebrow">[ {{ eyebrow || 'CASE WHITELABEL' }} ]</span>
        <h2 class="serif-mid">
          {{ title || 'Do briefing ao ar' }}
          <span class="italic amber">em 7 dias.</span>
        </h2>
        <div class="wc-timeline">
          <div class="wc-step"><div class="wc-num">D1</div><div class="wc-text">Briefing visual</div></div>
          <div class="wc-arrow">→</div>
          <div class="wc-step"><div class="wc-num">D3</div><div class="wc-text">Protótipo clicável</div></div>
          <div class="wc-arrow">→</div>
          <div class="wc-step"><div class="wc-num">D7</div><div class="wc-text">Deploy em produção</div></div>
        </div>
        <div class="wc-foot">{{ cta || '5 marcas já fizeram. A sua é a próxima.' }}</div>
      </div>

      <!-- 19 · CREATIVE PROMO -->
      <div v-else-if="variant === 'creative-promo'" class="body center-col">
        <span class="eyebrow">[ {{ eyebrow || 'CREATIVE STUDIO' }} ]</span>
        <h1 class="serif-huge">
          {{ title || 'Conteúdo pronto' }}
          <br />
          <span class="italic amber">{{ subtitle || 'pro feed.' }}</span>
        </h1>
        <div class="cp-cards">
          <div class="cp-card">📊</div>
          <div class="cp-card">🏆</div>
          <div class="cp-card">🚀</div>
          <div class="cp-card">⚡</div>
        </div>
        <div class="cp-foot">{{ cta || 'creative.redentia.com.br · grátis' }}</div>
      </div>

      <!-- 20 · MANIFESTO, big text block -->
      <div v-else-if="variant === 'manifesto'" class="body no-center">
        <span class="eyebrow">[ {{ eyebrow || 'MANIFESTO' }} ]</span>
        <div class="mf-text">
          {{ title || 'Todo investidor brasileiro merece uma plataforma que fala a língua dele. Que entende que PIX é instantâneo, que JCP é tributado, que BDRs pagam dividendo em USD mas a conta é BRL.' }}
        </div>
        <div class="mf-sig">, {{ cta || 'Time Redentia' }}</div>
      </div>

      <!-- Fallback -->
      <div v-else class="body center-col">
        <div class="stat-huge amber">{{ variant }}</div>
        <div class="stat-label">variant não encontrada</div>
      </div>

      <!-- Footer (shared) -->
      <div class="foot">
        <img src="/brand/logo-icon.svg" alt="Redentia" class="foot-logo" />
        <span class="foot-text">{{ footer }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================
   BASE & STAGE
   ============================================================ */
.stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: #0A0B0E;
  font-family: 'Inter', system-ui, sans-serif;
}

.card {
  position: relative;
  width: 1080px;
  height: 1080px;
  max-width: 100%;
  aspect-ratio: 1 / 1;
  background: #0A0B0E;
  color: #E8EAED;
  border: 1px solid #2A2E39;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 56px 64px;
  box-sizing: border-box;
}

/* Background decoration */
.bg-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.bg-layer.amber {
  background: radial-gradient(ellipse at 50% 0%, rgba(245, 166, 35, 0.18) 0%, transparent 55%),
              radial-gradient(ellipse at 50% 100%, rgba(245, 166, 35, 0.1) 0%, transparent 55%);
}
.bg-layer.grid {
  opacity: 0.04;
  background-image:
    linear-gradient(#E8EAED 1px, transparent 1px),
    linear-gradient(90deg, #E8EAED 1px, transparent 1px);
  background-size: 40px 40px;
}
.bg-layer.scanlines {
  opacity: 0.18;
  background-image: repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(232,234,237,0.04) 2px, rgba(232,234,237,0.04) 3px);
}

/* ============================================================
   HEADER / FOOTER
   ============================================================ */
.hdr {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #8B92A7;
}
.hdr-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.hdr-logo {
  width: 32px;
  height: 32px;
}
.hdr-name {
  color: #E8EAED;
  font-weight: 700;
}
.hdr-right {
  color: #F5A623;
}

.foot {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 24px;
  margin-top: auto;
  border-top: 1px solid rgba(42, 46, 57, 0.6);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #8B92A7;
}
.foot-logo {
  width: 28px;
  height: 28px;
  opacity: 0.7;
}

/* ============================================================
   BODY WRAPPERS
   ============================================================ */
.body {
  position: relative;
  flex: 1;
  display: flex;
  min-height: 0;
  padding: 40px 0;
}
.body.center {
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
}
.body.center-col {
  align-items: center;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}
.body.no-center {
  flex-direction: column;
  gap: 24px;
}

/* ============================================================
   TYPOGRAPHY HELPERS
   ============================================================ */
.eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #F5A623;
  margin-bottom: 24px;
  display: inline-block;
}
.eyebrow.amber {
  color: #F5A623;
  font-weight: 700;
}

.serif-huge {
  font-family: 'Instrument Serif', serif;
  font-size: 112px;
  line-height: 0.92;
  letter-spacing: -0.02em;
  color: #E8EAED;
  margin: 0;
  max-width: 900px;
}
.serif-huge.mid {
  font-size: 96px;
}

.serif-mid {
  font-family: 'Instrument Serif', serif;
  font-size: 72px;
  line-height: 1;
  letter-spacing: -0.02em;
  color: #E8EAED;
  margin: 0 0 32px 0;
  max-width: 900px;
}

.italic {
  font-style: italic;
}

.amber {
  color: #F5A623;
}

/* ============================================================
   01 · TERMINAL HOOK
   ============================================================ */
.terminal-box {
  margin-top: 48px;
  width: 100%;
  max-width: 780px;
  border: 1px solid #2A2E39;
  border-radius: 8px;
  background: #14161C;
  overflow: hidden;
  text-align: left;
}
.terminal-hdr {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #2A2E39;
  background: #0A0B0E;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot.red { background: #FF4747; }
.dot.amber { background: #F5A623; }
.dot.green { background: #00D395; }
.terminal-title {
  margin-left: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.15em;
  color: #8B92A7;
  text-transform: uppercase;
}
.terminal-body {
  padding: 24px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  line-height: 1.7;
  color: #E8EAED;
}
.prompt {
  color: #F5A623;
  margin-right: 8px;
}
.terminal-body .muted {
  color: #00D395;
}

/* ============================================================
   02 · STAT BIG
   ============================================================ */
.stat-huge {
  font-family: 'Instrument Serif', serif;
  font-size: 360px;
  line-height: 0.9;
  color: #F5A623;
  letter-spacing: -0.04em;
}
.stat-label {
  margin-top: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 20px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #E8EAED;
}
.sub-small {
  margin-top: 28px;
  font-size: 22px;
  color: #8B92A7;
}

/* ============================================================
   03 · QUOTE CARD
   ============================================================ */
.quote-mark {
  font-family: 'Instrument Serif', serif;
  font-size: 200px;
  line-height: 0.5;
  color: #F5A623;
  margin-top: 40px;
  margin-bottom: 16px;
}
.quote-text {
  font-family: 'Instrument Serif', serif;
  font-size: 44px;
  line-height: 1.25;
  color: #E8EAED;
  max-width: 820px;
  margin-top: 16px;
  font-style: italic;
}
.quote-author {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 48px;
}
.author-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(245, 166, 35, 0.2);
  color: #F5A623;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 20px;
  letter-spacing: 0.05em;
}
.author-info {
  text-align: left;
}
.author-name {
  font-size: 22px;
  font-weight: 700;
  color: #E8EAED;
}
.author-role {
  font-size: 14px;
  color: #8B92A7;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-top: 4px;
}

/* ============================================================
   04 · BEFORE-AFTER
   ============================================================ */
.ba-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 24px;
  margin-top: 40px;
  flex: 1;
  align-items: center;
}
.ba-side {
  padding: 40px;
  border: 1px solid #2A2E39;
  border-radius: 12px;
  background: #14161C;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.ba-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #8B92A7;
  margin-bottom: 16px;
}
.ba-label.amber {
  color: #F5A623;
}
.ba-text {
  font-family: 'Instrument Serif', serif;
  font-size: 38px;
  line-height: 1.15;
  color: #E8EAED;
}
.ba-divider {
  display: flex;
  align-items: center;
  justify-content: center;
}
.ba-arrow {
  font-size: 80px;
  color: #F5A623;
  font-weight: 700;
}
.ba-bottom {
  margin-top: 40px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #E8EAED;
}

/* ============================================================
   05 · FEATURE GRID
   ============================================================ */
.fg-grid {
  margin-top: 32px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  width: 100%;
  max-width: 820px;
}
.fg-item {
  border: 1px solid #2A2E39;
  border-radius: 12px;
  background: #14161C;
  padding: 40px 32px;
  text-align: center;
}
.fg-icon {
  font-size: 56px;
  margin-bottom: 16px;
}
.fg-title {
  font-family: 'Instrument Serif', serif;
  font-size: 36px;
  color: #E8EAED;
}
.fg-sub {
  margin-top: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #8B92A7;
}

/* ============================================================
   06 · PRICE DUEL
   ============================================================ */
.pd-grid {
  margin-top: 32px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: stretch;
  width: 100%;
}
.pd-side {
  padding: 40px 32px;
  border: 1px solid #2A2E39;
  border-radius: 12px;
  background: #14161C;
  text-align: center;
}
.pd-side.pd-us {
  border-color: #F5A623;
  box-shadow: 0 10px 40px -15px rgba(245, 166, 35, 0.5);
}
.pd-brand {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #8B92A7;
  margin-bottom: 16px;
}
.pd-price {
  font-family: 'Instrument Serif', serif;
  font-size: 96px;
  line-height: 0.9;
  color: #E8EAED;
}
.pd-price.amber {
  color: #F5A623;
}
.pd-unit {
  margin-top: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8B92A7;
}
.pd-bullets {
  list-style: none;
  padding: 0;
  margin: 32px 0 0 0;
  text-align: left;
  font-size: 18px;
  color: #E8EAED;
}
.pd-bullets li {
  padding: 6px 0;
}
.pd-vs {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Instrument Serif', serif;
  font-style: italic;
  font-size: 72px;
  color: #F5A623;
}

/* ============================================================
   07 · CODE PREVIEW
   ============================================================ */
.code-box {
  margin-top: 24px;
  border: 1px solid #2A2E39;
  border-radius: 8px;
  background: #14161C;
  overflow: hidden;
  flex: 1;
}
.code-hdr {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border-bottom: 1px solid #2A2E39;
  background: #0A0B0E;
}
.code-title {
  margin-left: 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.15em;
  color: #8B92A7;
  text-transform: uppercase;
}
.code-body {
  padding: 32px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  line-height: 1.7;
  color: #E8EAED;
  margin: 0;
}
.code-body .amber { color: #F5A623; }
.code-body .green { color: #00D395; }
.code-foot {
  margin-top: 24px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #F5A623;
  text-align: center;
}

/* ============================================================
   08 · TENANTS GALLERY
   ============================================================ */
.tg-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  width: 100%;
  max-width: 820px;
  margin-top: 32px;
}
.tg-item {
  aspect-ratio: 1 / 1;
  border: 1px solid #2A2E39;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}
.tg-name {
  font-size: 36px;
  line-height: 1;
}
.tg-next {
  border: 2px dashed #F5A623;
  background: rgba(245, 166, 35, 0.05);
}
.tg-sub {
  margin-top: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8B92A7;
}

/* ============================================================
   09 · GROWTH HYPE
   ============================================================ */
.gh-ticker {
  font-family: 'Instrument Serif', serif;
  font-size: 180px;
  line-height: 0.9;
  color: #E8EAED;
  letter-spacing: -0.02em;
}
.gh-change {
  font-family: 'Instrument Serif', serif;
  font-size: 280px;
  line-height: 0.9;
  letter-spacing: -0.03em;
  margin-top: 32px;
}
.gh-period {
  margin-top: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 20px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #8B92A7;
}
.gh-sub {
  margin-top: 48px;
  font-size: 22px;
  color: #E8EAED;
  max-width: 680px;
}

/* ============================================================
   10 · MYTH BUSTER
   ============================================================ */
.mb-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 40px;
  flex: 1;
  justify-content: center;
}
.mb-side {
  padding: 40px;
  border: 1px solid #2A2E39;
  border-radius: 12px;
  background: #14161C;
}
.mb-side.mb-truth {
  border-color: #F5A623;
  background: rgba(245, 166, 35, 0.05);
}
.mb-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #8B92A7;
  margin-bottom: 16px;
}
.mb-label.amber { color: #F5A623; }
.mb-text {
  font-family: 'Instrument Serif', serif;
  font-size: 36px;
  line-height: 1.2;
  color: #E8EAED;
}
.mb-bottom {
  margin-top: 24px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #F5A623;
}

/* ============================================================
   11 · STEP LIST
   ============================================================ */
.sl-list {
  list-style: none;
  padding: 0;
  margin: 32px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.sl-list li {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  border: 1px solid #2A2E39;
  border-radius: 12px;
  background: #14161C;
}
.sl-num {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #F5A623;
  color: #0A0B0E;
  font-family: 'Instrument Serif', serif;
  font-size: 48px;
  flex-shrink: 0;
}
.sl-text {
  font-family: 'Instrument Serif', serif;
  font-size: 32px;
  color: #E8EAED;
  line-height: 1.2;
}
.sl-foot {
  margin-top: 24px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #F5A623;
}

/* ============================================================
   12 · TICKER SPOTLIGHT
   ============================================================ */
.ts-ticker {
  font-family: 'Instrument Serif', serif;
  font-size: 240px;
  line-height: 0.9;
  color: #E8EAED;
  letter-spacing: -0.04em;
  margin-top: 24px;
}
.ts-name {
  margin-top: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #8B92A7;
}
.ts-price {
  margin-top: 48px;
  font-family: 'Instrument Serif', serif;
  font-size: 96px;
  line-height: 1;
  color: #E8EAED;
}
.ts-change {
  margin-top: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 24px;
  letter-spacing: 0.1em;
}
.ts-foot {
  margin-top: 48px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #F5A623;
}

/* ============================================================
   13 · RANKING MINI
   ============================================================ */
.rm-list {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.rm-row {
  display: grid;
  grid-template-columns: 80px 180px 1fr auto;
  gap: 24px;
  align-items: center;
  padding: 24px 32px;
  border: 1px solid #2A2E39;
  border-radius: 10px;
  background: #14161C;
}
.rm-rank {
  font-family: 'Instrument Serif', serif;
  font-size: 36px;
  color: #F5A623;
}
.rm-ticker {
  font-weight: 800;
  font-size: 28px;
  color: #E8EAED;
  letter-spacing: 0.02em;
}
.rm-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #8B92A7;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.rm-change {
  font-family: 'JetBrains Mono', monospace;
  font-size: 26px;
  font-weight: 700;
}
.rm-foot {
  margin-top: 24px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8B92A7;
}

/* ============================================================
   14 · QUESTION HOOK
   ============================================================ */
.qh-sub {
  margin-top: 48px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 20px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #F5A623;
}

/* ============================================================
   15 · ANNOUNCEMENT
   ============================================================ */
.an-badge {
  display: inline-block;
  padding: 16px 40px;
  border: 3px solid #F5A623;
  background: #F5A623;
  color: #0A0B0E;
  font-family: 'JetBrains Mono', monospace;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 0.25em;
  border-radius: 4px;
  transform: rotate(-3deg);
  margin-bottom: 48px;
}
.an-sub {
  margin-top: 48px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 20px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #E8EAED;
}

/* ============================================================
   16 · REDENTIA DIFF
   ============================================================ */
.rd-list {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.rd-item {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 28px 32px;
  border: 1px solid #2A2E39;
  border-left: 4px solid #F5A623;
  background: #14161C;
  border-radius: 8px;
  font-family: 'Instrument Serif', serif;
  font-size: 36px;
  color: #E8EAED;
}
.rd-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.1em;
}
.rd-foot {
  margin-top: 24px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #F5A623;
}

/* ============================================================
   17 · API BETA
   ============================================================ */
.ab-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 48px;
}
.chip {
  padding: 12px 20px;
  border: 1px solid #F5A623;
  background: rgba(245, 166, 35, 0.1);
  color: #F5A623;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border-radius: 4px;
  font-weight: 700;
}
.ab-foot {
  margin-top: 48px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8B92A7;
}

/* ============================================================
   18 · WL CASE TIMELINE
   ============================================================ */
.wc-timeline {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  gap: 20px;
  align-items: center;
  margin-top: 40px;
  flex: 1;
}
.wc-step {
  padding: 40px 24px;
  border: 1px solid #2A2E39;
  border-radius: 12px;
  background: #14161C;
  text-align: center;
}
.wc-num {
  font-family: 'Instrument Serif', serif;
  font-size: 96px;
  color: #F5A623;
  line-height: 0.9;
}
.wc-text {
  margin-top: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #E8EAED;
}
.wc-arrow {
  font-size: 48px;
  color: #F5A623;
  font-weight: 700;
}
.wc-foot {
  margin-top: 24px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #E8EAED;
}

/* ============================================================
   19 · CREATIVE PROMO
   ============================================================ */
.cp-cards {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 16px;
  margin-top: 48px;
  width: 100%;
  max-width: 680px;
}
.cp-card {
  aspect-ratio: 1 / 1;
  border: 1px solid #2A2E39;
  border-radius: 12px;
  background: #14161C;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 96px;
}
.cp-foot {
  margin-top: 32px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #F5A623;
}

/* ============================================================
   20 · MANIFESTO
   ============================================================ */
.mf-text {
  margin-top: 24px;
  font-family: 'Instrument Serif', serif;
  font-size: 46px;
  line-height: 1.2;
  color: #E8EAED;
  max-width: 900px;
  font-style: italic;
  flex: 1;
  display: flex;
  align-items: center;
}
.mf-sig {
  margin-top: 24px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #F5A623;
}
</style>

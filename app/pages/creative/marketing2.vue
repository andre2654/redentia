<script setup lang="ts">
definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

// ============================================================
// Marketing Creative · Volume 2 — VISUAL-FIRST
//
// Second batch of marketing artes focused on SHOWING, not
// telling. iPhone push mockups, live tenant hero snippets,
// data visualizations with real numbers, and big-typography
// jargon quotes. Designed to be scroll-stopping on feed.
//
// Query param `variant` controls the layout; secondary params
// override copy to generate text variations of the same visual.
// ============================================================

import { REDENTIA_GOOGLE_FONT_HREF } from '~/utils/redentiaCreativeColors'

const route = useRoute()

function q(key: string, fallback = ''): string {
  const v = route.query[key]
  if (typeof v === 'string') return v
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0]
  return fallback
}

const variant = computed(() => q('variant', 'iphone-push-price'))

// Generic override props
const title = computed(() => q('title', ''))
const subtitle = computed(() => q('subtitle', ''))
const body = computed(() => q('body', ''))
const stat = computed(() => q('stat', ''))
const statLabel = computed(() => q('stat_label', ''))
const eyebrow = computed(() => q('eyebrow', ''))
const cta = computed(() => q('cta', ''))
const author = computed(() => q('author', ''))
const timeAgo = computed(() => q('time', 'AGORA'))

// iPhone content props
const pushTitle = computed(() => q('push_title', ''))
const pushBody = computed(() => q('push_body', ''))
const pushApp = computed(() => q('push_app', 'REDENTIA'))

// Tenant slug for tenant-hero variants
const tenantSlug = computed(() => q('tenant', 'mepoupe'))

// Mock data for the iphone-assets-list variant
const mockAssets = [
  { ticker: 'PETR4', name: 'Petrobras PN', price: '49,03', change: '0,27', up: true, initials: 'PT', bg: '#0a8a44' },
  { ticker: 'VALE3', name: 'Vale ON', price: '85,59', change: '0,16', up: true, initials: 'VL', bg: '#1c8a8a' },
  { ticker: 'ITUB4', name: 'Itaú PN', price: '34,17', change: '1,42', up: true, initials: 'IT', bg: '#ec7000' },
  { ticker: 'BBDC4', name: 'Bradesco PN', price: '14,28', change: '0,84', up: false, initials: 'BB', bg: '#cc092f' },
  { ticker: 'WEGE3', name: 'WEG ON', price: '38,90', change: '2,15', up: true, initials: 'WG', bg: '#005496' },
  { ticker: 'MGLU3', name: 'Magazine Luiza', price: '8,42', change: '3,28', up: false, initials: 'ML', bg: '#1a47a1' },
]

// Jargon text color & font already baked into each jargon variant

// Google Fonts stylesheet (extended with Poppins, Fraunces,
// IBM Plex Serif so the jargon variants can match each tenant's
// native font)
const fontsHref = 'https://fonts.googleapis.com/css2?family=Inter:wght@300..800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600;700&family=Poppins:wght@400;500;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,700;1,9..144,400;1,9..144,700&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Space+Grotesk:wght@300..700&display=swap'

useHead(() => ({
  title: `Redentia — ${variant.value}`,
  meta: [
    { name: 'robots', content: 'noindex,nofollow,noarchive' },
    { name: 'viewport', content: 'width=1080, initial-scale=1' },
  ],
  link: [{ rel: 'stylesheet', href: fontsHref }],
}))

// Helpers for the data-coverage variant — simulate a list of tickers
const sampleTickers = [
  'PETR4', 'VALE3', 'ITUB4', 'BBAS3', 'BBDC4', 'MGLU3',
  'WEGE3', 'ABEV3', 'ITSA4', 'B3SA3', 'RENT3', 'LREN3',
  'JBSS3', 'SUZB3', 'HAPV3', 'RADL3', 'EQTL3', 'PRIO3',
  'CCRO3', 'CSAN3', 'GGBR4', 'SBSP3', 'UGPA3', 'VIVT3',
]
</script>

<template>
  <div class="stage">
    <div class="card" :class="`card-${variant}`">
      <!-- ============================================================
           BACKDROP — each variant defines its own look via .card-XXX
           ============================================================ -->
      <div class="backdrop-1" />
      <div class="backdrop-2" />
      <div class="backdrop-grid" />
      <div class="backdrop-noise" />

      <!-- ============================================================
           HEADER (shared — some variants hide it via CSS)
           ============================================================ -->
      <div class="header">
        <div class="header-brand">
          <img src="/brand/logo-icon.svg" alt="Redentia" class="header-logo" />
          <span class="header-name">REDENTIA</span>
        </div>
        <span class="header-tag">{{ eyebrow || 'REDENTIA.COM.BR' }}</span>
      </div>

      <!-- ============================================================
           VARIANT 01–05 · IPHONE PUSH NOTIFICATIONS
           iPhone lock screen (dark) with a Redentia notification card
           ============================================================ -->
      <div
        v-if="['iphone-push-price','iphone-push-dividend','iphone-push-ia','iphone-push-alert','iphone-push-news'].includes(variant)"
        class="body iphone-body"
      >
        <div class="iphone">
          <!-- Phone frame -->
          <div class="iphone-frame">
            <!-- Notch (dynamic island) -->
            <div class="iphone-notch"></div>

            <!-- Screen -->
            <div class="iphone-screen">
              <!-- Wallpaper gradient -->
              <div class="screen-wall" />

              <!-- Status bar -->
              <div class="status-bar">
                <span class="status-time">9:41</span>
                <span class="status-icons">
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="0" y="7" width="3" height="4" rx="1" fill="white"/><rect x="5" y="5" width="3" height="6" rx="1" fill="white"/><rect x="10" y="2" width="3" height="9" rx="1" fill="white"/><rect x="15" y="0" width="3" height="11" rx="1" fill="white" opacity="0.5"/></svg>
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M8 11C6.2 9.2 2.6 7.4 0.2 6C2 3.4 4.8 1.8 8 1.8C11.2 1.8 14 3.4 15.8 6C13.4 7.4 9.8 9.2 8 11Z" fill="white"/></svg>
                  <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="1" y="1" width="21" height="10" rx="2.5" stroke="white" stroke-opacity="0.7"/><rect x="3" y="3" width="16" height="6" rx="1" fill="white"/><rect x="23" y="4" width="1.5" height="4" rx="0.5" fill="white" opacity="0.5"/></svg>
                </span>
              </div>

              <!-- Date / time -->
              <div class="lock-datetime">
                <div class="lock-date">sábado, 11 de abril</div>
                <div class="lock-time">9:41</div>
              </div>

              <!-- Notification card -->
              <div class="push-card">
                <div class="push-header">
                  <div class="push-app-icon">
                    <img src="/brand/logo-icon.svg" alt="R" />
                  </div>
                  <div class="push-app-info">
                    <span class="push-app-name">{{ pushApp }}</span>
                  </div>
                  <span class="push-time">{{ timeAgo }}</span>
                </div>
                <div class="push-content">
                  <div class="push-title">{{ pushTitle || 'PETR4 subiu 3,5% hoje.' }}</div>
                  <div class="push-body">{{ pushBody || 'Seu alerta de preço foi acionado. Cotação atual: R$ 50,82 · DY projetado: 16,3%' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column: caption -->
        <div class="iphone-caption">
          <div class="iphone-eyebrow">{{ eyebrow || '[ NOTIFICAÇÕES INTELIGENTES ]' }}</div>
          <h2 class="iphone-title">{{ title || 'O mercado no seu bolso.' }}</h2>
          <p class="iphone-sub">{{ subtitle || 'Defina alertas de preço, dividendos e eventos corporativos. A Redentia manda um push só quando realmente importa.' }}</p>
          <div class="iphone-tag">{{ cta || 'redentia.com.br' }}</div>
        </div>
      </div>

      <!-- ============================================================
           VARIANT · IPHONE ASSETS LIST (full app screen mockup)
           Phone showing the carteira / lista de ativos
           ============================================================ -->
      <div v-else-if="variant === 'iphone-assets-list'" class="body iphone-body">
        <div class="iphone">
          <div class="iphone-frame">
            <div class="iphone-notch"></div>
            <div class="iphone-screen iphone-screen-app">
              <!-- Status bar -->
              <div class="status-bar">
                <span class="status-time">9:41</span>
                <span class="status-icons">
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="0" y="7" width="3" height="4" rx="1" fill="white"/><rect x="5" y="5" width="3" height="6" rx="1" fill="white"/><rect x="10" y="2" width="3" height="9" rx="1" fill="white"/><rect x="15" y="0" width="3" height="11" rx="1" fill="white" opacity="0.5"/></svg>
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M8 11C6.2 9.2 2.6 7.4 0.2 6C2 3.4 4.8 1.8 8 1.8C11.2 1.8 14 3.4 15.8 6C13.4 7.4 9.8 9.2 8 11Z" fill="white"/></svg>
                  <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="1" y="1" width="21" height="10" rx="2.5" stroke="white" stroke-opacity="0.7"/><rect x="3" y="3" width="16" height="6" rx="1" fill="white"/><rect x="23" y="4" width="1.5" height="4" rx="0.5" fill="white" opacity="0.5"/></svg>
                </span>
              </div>

              <!-- App header -->
              <div class="app-header">
                <div class="app-header-row">
                  <span class="app-greeting">Olá, Lucas</span>
                  <span class="app-bell">🔔</span>
                </div>
                <div class="app-portfolio">
                  <span class="app-portfolio-label">PATRIMÔNIO TOTAL</span>
                  <div class="app-portfolio-value">R$ 142.380,<span class="app-portfolio-cents">42</span></div>
                  <div class="app-portfolio-change">+R$ 2.418 <span>(+1,72%)</span></div>
                </div>
              </div>

              <!-- Tabs -->
              <div class="app-tabs">
                <span class="app-tab app-tab-active">Carteira</span>
                <span class="app-tab">Mercado</span>
                <span class="app-tab">Proventos</span>
              </div>

              <!-- Asset list -->
              <div class="app-asset-list">
                <div class="app-asset" v-for="asset in mockAssets" :key="asset.ticker">
                  <div class="app-asset-icon" :style="{ background: asset.bg }">{{ asset.initials }}</div>
                  <div class="app-asset-info">
                    <div class="app-asset-ticker">{{ asset.ticker }}</div>
                    <div class="app-asset-name">{{ asset.name }}</div>
                  </div>
                  <div class="app-asset-meta">
                    <div class="app-asset-price">R$ {{ asset.price }}</div>
                    <div class="app-asset-change" :class="asset.up ? 'pos' : 'neg'">
                      {{ asset.up ? '+' : '' }}{{ asset.change }}%
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bottom nav -->
              <div class="app-bottom-nav">
                <div class="app-nav-item app-nav-active">
                  <div class="app-nav-icon">●</div>
                  <span>Home</span>
                </div>
                <div class="app-nav-item">
                  <div class="app-nav-icon">○</div>
                  <span>Mercado</span>
                </div>
                <div class="app-nav-item">
                  <div class="app-nav-icon">○</div>
                  <span>IA</span>
                </div>
                <div class="app-nav-item">
                  <div class="app-nav-icon">○</div>
                  <span>Perfil</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="iphone-caption">
          <div class="iphone-eyebrow">{{ eyebrow || '[ SUA CARTEIRA · TEMPO REAL ]' }}</div>
          <h2 class="iphone-title">{{ title || 'Tudo numa tela só.' }}</h2>
          <p class="iphone-sub">{{ subtitle || 'Ações, FIIs, ETFs, BDRs, renda fixa. Importa via Excel ou Open Finance e a Redentia faz o resto. Rentabilidade ponderada, dividendos calculados, alertas inteligentes.' }}</p>
          <div class="iphone-tag">{{ cta || 'redentia.com.br' }}</div>
        </div>
      </div>

      <!-- ============================================================
           VARIANT · IPHONE AI CHAT (iMessage-style conversation)
           ============================================================ -->
      <div v-else-if="variant === 'iphone-ai-chat'" class="body iphone-body">
        <div class="iphone">
          <div class="iphone-frame">
            <div class="iphone-notch"></div>
            <div class="iphone-screen iphone-screen-app">
              <div class="status-bar">
                <span class="status-time">9:41</span>
                <span class="status-icons">
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="0" y="7" width="3" height="4" rx="1" fill="white"/><rect x="5" y="5" width="3" height="6" rx="1" fill="white"/><rect x="10" y="2" width="3" height="9" rx="1" fill="white"/><rect x="15" y="0" width="3" height="11" rx="1" fill="white" opacity="0.5"/></svg>
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M8 11C6.2 9.2 2.6 7.4 0.2 6C2 3.4 4.8 1.8 8 1.8C11.2 1.8 14 3.4 15.8 6C13.4 7.4 9.8 9.2 8 11Z" fill="white"/></svg>
                  <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="1" y="1" width="21" height="10" rx="2.5" stroke="white" stroke-opacity="0.7"/><rect x="3" y="3" width="16" height="6" rx="1" fill="white"/><rect x="23" y="4" width="1.5" height="4" rx="0.5" fill="white" opacity="0.5"/></svg>
                </span>
              </div>

              <!-- Chat header -->
              <div class="chat-header">
                <div class="chat-avatar">
                  <img src="/brand/logo-icon.svg" alt="Redentia" />
                </div>
                <div class="chat-header-info">
                  <div class="chat-header-name">Assessor Redentia</div>
                  <div class="chat-header-status">
                    <span class="chat-dot-pulse"></span>
                    online · respondendo
                  </div>
                </div>
                <div class="chat-info-btn">ⓘ</div>
              </div>

              <!-- Messages -->
              <div class="chat-messages">
                <div class="chat-msg chat-msg-user">
                  <div class="chat-bubble chat-bubble-user">Vale a pena entrar em PETR4 hoje?</div>
                  <div class="chat-time">9:38</div>
                </div>

                <div class="chat-msg chat-msg-ai">
                  <div class="chat-bubble chat-bubble-ai">
                    Pelo preço atual (R$ 49,03) e DY de 16,3%, PETR4 está negociando 12% abaixo do preço-teto de Bazin. Mas o setor de petróleo tem volatilidade alta — recomendo limitar a 5% da carteira.
                  </div>
                </div>
                <div class="chat-msg chat-msg-ai">
                  <div class="chat-bubble chat-bubble-ai chat-bubble-card">
                    <div class="chat-card-label">PETR4 · DESTAQUE</div>
                    <div class="chat-card-row"><span>Preço</span><strong>R$ 49,03</strong></div>
                    <div class="chat-card-row"><span>DY</span><strong class="pos">16,3%</strong></div>
                    <div class="chat-card-row"><span>Preço-teto Bazin</span><strong>R$ 55,80</strong></div>
                  </div>
                  <div class="chat-time">9:39 · IA</div>
                </div>

                <div class="chat-msg chat-msg-user">
                  <div class="chat-bubble chat-bubble-user">Mostra os 3 maiores DY da bolsa</div>
                  <div class="chat-time">9:40</div>
                </div>

                <div class="chat-msg chat-msg-ai">
                  <div class="chat-bubble chat-bubble-ai chat-typing">
                    <span class="chat-typing-dot"></span>
                    <span class="chat-typing-dot"></span>
                    <span class="chat-typing-dot"></span>
                  </div>
                </div>
              </div>

              <!-- Input -->
              <div class="chat-input">
                <div class="chat-input-field">Pergunta qualquer coisa…</div>
                <div class="chat-send-btn">↑</div>
              </div>
            </div>
          </div>
        </div>

        <div class="iphone-caption">
          <div class="iphone-eyebrow">{{ eyebrow || '[ ASSESSOR · IA · 24/7 ]' }}</div>
          <h2 class="iphone-title">{{ title || 'Tira a dúvida na hora.' }}</h2>
          <p class="iphone-sub">{{ subtitle || 'A IA da Redentia foi treinada no mercado brasileiro. Pergunta sobre qualquer ação, fundo, indicador ou estratégia — resposta em segundos, com dados reais e fontes citadas.' }}</p>
          <div class="iphone-tag">{{ cta || 'redentia.com.br' }}</div>
        </div>
      </div>

      <!-- ============================================================
           VARIANT 10–14 · BIG JARGON TYPOGRAPHY (per-tenant voice)
           Uses the exact font, color and italic style of each tenant
           ============================================================ -->
      <div v-else-if="variant === 'jargon-mepoupe'" class="body jargon-body jargon-mepoupe">
        <div class="jargon-eyebrow">O JARGÃO QUE VIROU MARCA</div>
        <div class="jargon-quote">
          Chega de<br>
          <span class="hl-yellow">dinheirofobia,</span><br>
          criatura!
        </div>
        <div class="jargon-author">
          <span class="jargon-author-name">— {{ author || 'Nathalia Arcuri' }}</span>
          <span class="jargon-author-role">ME POUPE! · REDENTIA WHITELABEL</span>
        </div>
      </div>

      <div v-else-if="variant === 'jargon-primo'" class="body jargon-body jargon-primo">
        <div class="jargon-eyebrow">MANUAL DO PRIMO</div>
        <div class="jargon-quote">
          {{ title || 'Liberdade' }}<br>
          <span class="italic-orange">{{ subtitle || 'ou mediocridade.' }}</span>
        </div>
        <div class="jargon-author">
          <span class="jargon-author-name">— {{ author || 'Thiago Nigro' }}</span>
          <span class="jargon-author-role">PRIMO RICO · REDENTIA WHITELABEL</span>
        </div>
      </div>

      <div v-else-if="variant === 'jargon-sardinha'" class="body jargon-body jargon-sardinha">
        <div class="jargon-eyebrow">§ · AUVP RESEARCH</div>
        <div class="jargon-quote">
          A única<br>
          <span class="italic-red">verdade possível</span><br>
          é o conhecimento.
        </div>
        <div class="jargon-author">
          <span class="jargon-author-name">— {{ author || 'Raul Sena' }}</span>
          <span class="jargon-author-role">INVESTIDOR SARDINHA · AUVP</span>
        </div>
      </div>

      <div v-else-if="variant === 'jargon-norte'" class="body jargon-body jargon-norte">
        <div class="jargon-eyebrow">NORTE CAPITAL · GABINETE DIGITAL</div>
        <div class="jargon-quote">
          Estimado<br>
          <span class="italic-gold">investidor,</span><br>
          seu portfólio aguarda.
        </div>
        <div class="jargon-author">
          <span class="jargon-author-name">— NORTE CAPITAL</span>
          <span class="jargon-author-role">ASSESSORIA · REDENTIA WHITELABEL</span>
        </div>
      </div>

      <div v-else-if="variant === 'jargon-redentia'" class="body jargon-body jargon-redentia">
        <div class="jargon-eyebrow">[ REDENTIA.TERMINAL ]</div>
        <div class="jargon-quote">
          Investir com<br>
          <span class="italic-amber">inteligência.</span>
        </div>
        <div class="jargon-author">
          <span class="jargon-author-name">— REDENTIA.COM.BR</span>
          <span class="jargon-author-role">PLATAFORMA · 100% GRÁTIS</span>
        </div>
      </div>

      <!-- ============================================================
           VARIANT 20 · TENANT SHOWCASE — shows 1 tenant hero rendered
           with its own fonts/colors (mini version of the real hero)
           ============================================================ -->
      <div v-else-if="variant === 'tenant-showcase-mepoupe'" class="body tenant-body tenant-mepoupe">
        <div class="tenant-badge-wrap">
          <div class="tenant-badge">⚡ NO AR · PROGRAMA #001</div>
        </div>
        <div class="tenant-hero-grid">
          <div class="tenant-hero-text">
            <h2 class="tenant-title tenant-title-mepoupe">
              Chega de<br>
              dinheirofobia,<br>
              <span class="tenant-highlight-yellow">criatura!</span>
            </h2>
            <p class="tenant-sub">Eu sou a Nath. Esta é a Me Poupe! — o programa que explica seu dinheiro do jeito que sua melhor amiga explicaria.</p>
            <div class="tenant-chips">
              <span class="tenant-chip">+7M NA COMUNIDADE</span>
              <span class="tenant-chip">100% GRÁTIS</span>
              <span class="tenant-chip">SEM SIDNELSON</span>
            </div>
          </div>
        </div>
        <div class="tenant-footer">ESTA É A CARA DA ME POUPE! NA INFRA DA REDENTIA. redentia.com.br/whitelabel</div>
      </div>

      <div v-else-if="variant === 'tenant-showcase-primo'" class="body tenant-body tenant-primo">
        <div class="tenant-tape">MANUAL DO PRIMO · FICHA TÉCNICA · CAPÍTULO 01</div>
        <div class="tenant-hero-grid">
          <div class="tenant-hero-text">
            <h2 class="tenant-title tenant-title-primo">
              MÉTODO<br>
              <span class="tenant-highlight-orange">ARCA</span><br>
              DO PRIMO.
            </h2>
            <p class="tenant-sub">Ações · Real Estate · Caixa · Ativos alternativos. Os 4 pilares da construção de patrimônio de longo prazo.</p>
            <div class="tenant-bullets">
              <span>A — AÇÕES</span>
              <span>R — REAL ESTATE (FIIs)</span>
              <span>C — CAIXA</span>
              <span>A — ATIVOS ALTERNATIVOS</span>
            </div>
          </div>
        </div>
        <div class="tenant-footer">ESTA É A CARA DO PRIMO RICO NA INFRA DA REDENTIA. redentia.com.br/whitelabel</div>
      </div>

      <div v-else-if="variant === 'tenant-showcase-sardinha'" class="body tenant-body tenant-sardinha">
        <div class="tenant-masthead">
          <span>AUVP RESEARCH</span>
          <span>VOL. 2026 · Nº 04</span>
        </div>
        <div class="tenant-hero-grid">
          <div class="tenant-hero-text">
            <div class="tenant-section-label">§ · Artigo de capa</div>
            <h2 class="tenant-title tenant-title-sardinha">
              O papel do<br>
              <span class="tenant-highlight-red">sardinha</span><br>
              é estudar.
            </h2>
            <p class="tenant-sub">Método AUVP aplicado à realidade brasileira. Filtros de ROE, margem líquida, dívida controlada e múltiplo razoável. Sem dica, sem recomendação.</p>
            <div class="tenant-sign">— RAUL SENA, EDITOR-CHEFE</div>
          </div>
        </div>
        <div class="tenant-footer">ESTA É A CARA DO AUVP NA INFRA DA REDENTIA. redentia.com.br/whitelabel</div>
      </div>

      <div v-else-if="variant === 'tenant-showcase-norte'" class="body tenant-body tenant-norte">
        <div class="tenant-letter-header">
          <span>NORTE CAPITAL</span>
          <span>CARTA MENSAL · ABRIL 2026</span>
        </div>
        <div class="tenant-hero-grid">
          <div class="tenant-hero-text">
            <div class="tenant-dash" />
            <h2 class="tenant-title tenant-title-norte">
              Estimado<br>
              <span class="tenant-highlight-gold">investidor,</span>
            </h2>
            <p class="tenant-sub tenant-sub-italic">
              Nesta edição discutimos o posicionamento tático do portfólio diante do ciclo macro brasileiro, com atenção especial aos setores de energia, financeiro e consumo.
            </p>
            <div class="tenant-sign tenant-sign-italic">— Norte Capital, Mesa de Gestão</div>
          </div>
        </div>
        <div class="tenant-footer">ESTA É A CARA DA NORTE CAPITAL NA INFRA DA REDENTIA. redentia.com.br/whitelabel</div>
      </div>

      <div v-else-if="variant === 'tenant-showcase-redentia'" class="body tenant-body tenant-redentia">
        <div class="tenant-status-line">
          <span class="status-dot-live">●</span>
          [MARKET.LIVE] · B3 · SESSÃO ABERTA · REDENTIA v2.1
        </div>
        <div class="tenant-hero-grid">
          <div class="tenant-hero-text">
            <h2 class="tenant-title tenant-title-redentia">
              Investir com<br>
              <span class="tenant-highlight-amber">inteligência.</span>
            </h2>
            <p class="tenant-sub">Plataforma terminal para o mercado brasileiro. Dados em tempo real, fundamentos desde 2009, IA própria e consolidador de carteira.</p>
            <div class="tenant-terminal-line">&gt; Pergunte sobre qualquer ativo...<span class="terminal-caret-mini" /></div>
          </div>
        </div>
        <div class="tenant-footer">ESTA É A CARA DA REDENTIA. redentia.com.br</div>
      </div>

      <!-- ============================================================
           VARIANT · DATA COVERAGE 25K
           Big number + ticker wall showing coverage
           ============================================================ -->
      <div v-else-if="variant === 'data-coverage'" class="body data-body">
        <div class="data-eyebrow">[ COBERTURA ]</div>
        <div class="data-coverage-headline">
          <div class="data-big-number">1.316</div>
          <div class="data-big-sublabel">TICKERS NA B3, TODOS COBERTOS</div>
        </div>
        <div class="ticker-wall">
          <div class="ticker-wall-row" v-for="(row, i) in [sampleTickers.slice(0, 8), sampleTickers.slice(8, 16), sampleTickers.slice(16, 24)]" :key="i">
            <span v-for="t in row" :key="t" class="ticker-wall-chip">{{ t }}</span>
          </div>
        </div>
        <p class="data-foot">Ações · FIIs · ETFs · BDRs · Índices · Criptomoedas · Câmbio. Em tempo real. redentia.com.br</p>
      </div>

      <!-- ============================================================
           VARIANT · DATA TIMELINE — 15+ years of history
           ============================================================ -->
      <div v-else-if="variant === 'data-timeline'" class="body data-body">
        <div class="data-eyebrow">[ HISTÓRICO DESDE 2009 ]</div>
        <h2 class="data-title">
          15+ anos de dados da B3 na<br>
          <span class="data-amber">ponta do dedo.</span>
        </h2>
        <div class="timeline-track">
          <div class="timeline-year" v-for="(year, i) in ['2009', '2012', '2015', '2018', '2021', '2024', '2026']" :key="year">
            <div class="timeline-dot" :class="{ 'timeline-dot-end': i === 6 }" />
            <div class="timeline-label">{{ year }}</div>
          </div>
          <div class="timeline-line" />
        </div>
        <p class="data-foot">Backtests, análise fundamentalista, séries históricas de dividendos. Tudo coberto. redentia.com.br</p>
      </div>

      <!-- ============================================================
           VARIANT · DATA SECURITY SHIELD
           ============================================================ -->
      <div v-else-if="variant === 'data-security'" class="body data-body data-security">
        <div class="data-eyebrow">[ SEGURANÇA & PRIVACIDADE ]</div>
        <h2 class="data-title">
          Seus dados são<br>
          <span class="data-amber">seus.</span>
        </h2>
        <div class="security-grid">
          <div class="security-item">
            <div class="security-icon">🔐</div>
            <div class="security-name">TLS 1.3</div>
            <div class="security-desc">Criptografia end-to-end em toda requisição</div>
          </div>
          <div class="security-item">
            <div class="security-icon">🛡️</div>
            <div class="security-name">LGPD</div>
            <div class="security-desc">Compliance total, você pode exportar e deletar a qualquer hora</div>
          </div>
          <div class="security-item">
            <div class="security-icon">🏦</div>
            <div class="security-name">Open Finance</div>
            <div class="security-desc">Regulado pelo BACEN, autorização via banco emissor</div>
          </div>
          <div class="security-item">
            <div class="security-icon">🚫</div>
            <div class="security-name">Zero senhas</div>
            <div class="security-desc">Nunca pedimos senha de corretora. Token OAuth só.</div>
          </div>
        </div>
        <p class="data-foot">redentia.com.br — plataforma brasileira, dados brasileiros, privacidade BR.</p>
      </div>

      <!-- ============================================================
           VARIANT · AI CHAT MOCKUP
           ============================================================ -->
      <div v-else-if="variant === 'ai-chat'" class="body ai-body">
        <div class="ai-eyebrow">[ ASSESSORIA COM IA ]</div>
        <h2 class="ai-title">
          A IA da Redentia responde<br>
          em <span class="data-amber">3 segundos.</span>
        </h2>
        <div class="ai-chat-frame">
          <div class="ai-chat-header">
            <div class="ai-chat-avatar">R</div>
            <div>
              <div class="ai-chat-name">Assessora IA</div>
              <div class="ai-chat-status"><span class="ai-chat-dot" /> online · redentia.com.br</div>
            </div>
          </div>
          <div class="ai-chat-body">
            <div class="ai-msg ai-msg-user">
              Quais ações brasileiras pagam mais de 10% de dividend yield e têm P/L menor que 10?
            </div>
            <div class="ai-msg ai-msg-bot">
              <div class="ai-msg-label">ASSESSORA · Redentia</div>
              Encontrei 7 ações que atendem seus critérios. Top 3 por DY: <strong>BBAS3</strong> (11.2%, P/L 4.8), <strong>PETR4</strong> (16.3%, P/L 6.1), <strong>CPLE6</strong> (10.4%, P/L 6.8)...
              <div class="ai-msg-source">FONTES CITADAS · 4</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           VARIANT · STATS ROW — 4 big stats horizontally
           ============================================================ -->
      <div v-else-if="variant === 'stats-row'" class="body stats-body">
        <div class="stats-eyebrow">[ NÚMEROS QUE IMPORTAM ]</div>
        <h2 class="stats-title">Por que os devs e investidores<br>brasileiros estão <span class="data-amber">migrando.</span></h2>
        <div class="stats-grid">
          <div class="stats-item">
            <div class="stats-num">1316</div>
            <div class="stats-lab">TICKERS COBERTOS</div>
            <div class="stats-sub">Ações · FIIs · BDRs · ETFs</div>
          </div>
          <div class="stats-item">
            <div class="stats-num">15+</div>
            <div class="stats-lab">ANOS DE HISTÓRICO</div>
            <div class="stats-sub">Desde 2009 · Backtests</div>
          </div>
          <div class="stats-item">
            <div class="stats-num">&lt;50</div>
            <div class="stats-lab">MILLISSEGUNDOS P95</div>
            <div class="stats-sub">Latência média</div>
          </div>
          <div class="stats-item">
            <div class="stats-num">R$ 0</div>
            <div class="stats-lab">PARA O USUÁRIO FINAL</div>
            <div class="stats-sub">Pra sempre · Zero ads</div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           VARIANT · WHY NORMAL PERSON — consolidator before/after
           ============================================================ -->
      <div v-else-if="variant === 'why-consolidator'" class="body why-body">
        <div class="why-eyebrow">[ POR QUE REDENTIA ]</div>
        <h2 class="why-title">
          Sua carteira em<br>
          <span class="data-amber">5 corretoras.</span>
        </h2>
        <div class="why-columns">
          <div class="why-col why-col-before">
            <div class="why-col-label">HOJE</div>
            <div class="wallets-stack">
              <div class="wallet-card">XP</div>
              <div class="wallet-card">NUINVEST</div>
              <div class="wallet-card">RICO</div>
              <div class="wallet-card">CLEAR</div>
              <div class="wallet-card">BTG</div>
            </div>
            <div class="why-col-sub">5 apps · 5 senhas · 0 consolidação</div>
          </div>
          <div class="why-arrow">→</div>
          <div class="why-col why-col-after">
            <div class="why-col-label why-col-label-amber">COM REDENTIA</div>
            <div class="wallets-one">
              <div class="wallet-one-icon">R</div>
              <div class="wallet-one-text">1 app<br>Open Finance</div>
            </div>
            <div class="why-col-sub">1 tela · rentabilidade consolidada · alertas</div>
          </div>
        </div>
        <p class="why-foot">redentia.com.br — consolidação via Open Finance · grátis · seguro</p>
      </div>

      <!-- ============================================================
           VARIANT · CALCULATORS SHOWCASE — 8 calcs grid
           ============================================================ -->
      <div v-else-if="variant === 'calculators'" class="body calc-body">
        <div class="calc-eyebrow">[ FERRAMENTAS ]</div>
        <h2 class="calc-title">
          8 calculadoras grátis.<br>
          <span class="data-amber">Zero cadastro.</span>
        </h2>
        <div class="calc-grid">
          <div class="calc-item">
            <div class="calc-icon">📈</div>
            <div class="calc-name">Juros Compostos</div>
          </div>
          <div class="calc-item">
            <div class="calc-icon">🏷️</div>
            <div class="calc-name">Preço Teto</div>
            <div class="calc-tag">Graham · Bazin</div>
          </div>
          <div class="calc-item">
            <div class="calc-icon">👴</div>
            <div class="calc-name">Aposentadoria</div>
          </div>
          <div class="calc-item">
            <div class="calc-icon">💰</div>
            <div class="calc-name">Dividend Yield</div>
          </div>
          <div class="calc-item">
            <div class="calc-icon">📊</div>
            <div class="calc-name">Planejamento</div>
          </div>
          <div class="calc-item">
            <div class="calc-icon">💵</div>
            <div class="calc-name">Quanto Investir</div>
          </div>
          <div class="calc-item">
            <div class="calc-icon">🎯</div>
            <div class="calc-name">Carteira Ideal</div>
          </div>
          <div class="calc-item">
            <div class="calc-icon">📉</div>
            <div class="calc-name">IR Tributação</div>
          </div>
        </div>
        <p class="calc-foot">redentia.com.br/calculadora</p>
      </div>

      <!-- ============================================================
           VARIANT · OPEN FINANCE
           ============================================================ -->
      <div v-else-if="variant === 'open-finance'" class="body of-body">
        <div class="of-eyebrow">[ INTEGRAÇÃO BANCÁRIA ]</div>
        <h2 class="of-title">
          Open Finance<br>
          <span class="data-amber">nativo.</span>
        </h2>
        <div class="of-ring">
          <div class="of-ring-core">
            <div class="of-ring-center">R</div>
          </div>
          <div class="of-ring-bank" v-for="(bank, i) in ['NU', 'XP', 'BTG', 'ITAÚ', 'BB', 'RICO', 'CLEAR', 'INTER']" :key="bank" :style="{ transform: `rotate(${i * 45}deg) translateX(220px) rotate(-${i * 45}deg)` }">
            {{ bank }}
          </div>
        </div>
        <p class="of-foot">Conecta com qualquer banco/corretora regulada pelo BACEN. Autorização via Open Finance oficial. Sua carteira consolidada em 30 segundos. redentia.com.br</p>
      </div>

      <!-- ============================================================
           VARIANT · NEW FEATURES HIGHLIGHT
           ============================================================ -->
      <div v-else-if="variant === 'feature-highlight'" class="body feat-body">
        <div class="feat-eyebrow">[ {{ eyebrow || 'NOVA FUNCIONALIDADE' }} ]</div>
        <div class="feat-badge-wrap">
          <span class="feat-badge">NOVO</span>
        </div>
        <h2 class="feat-title">{{ title || 'Commentaries com IA' }}</h2>
        <p class="feat-sub">{{ subtitle || 'Análises diárias geradas por Claude explicando exatamente por que cada ativo da B3 se moveu. Com fontes citadas, contexto macro e dados comparativos.' }}</p>
        <div class="feat-card">
          <div class="feat-card-header">
            <span class="feat-card-tag">IBOV · 10/04/2026</span>
            <span class="feat-card-change">+1,23%</span>
          </div>
          <h3 class="feat-card-title">{{ body || 'Ibovespa renova recorde aos 197 mil pontos pela primeira vez' }}</h3>
          <p class="feat-card-body">{{ q('card_body', 'O Ibovespa engata o terceiro dia de recordes consecutivos na expectativa de negociações para um acordo de paz definitivo no Oriente Médio, fechando em alta de 1,23% aos 197.534 pontos...') }}</p>
          <div class="feat-card-sources">4 FONTES CITADAS · CLAUDE SONNET 4.5</div>
        </div>
      </div>

      <!-- ============================================================
           VARIANT · 5 TENANTS GRID WITH LIVE PREVIEW
           ============================================================ -->
      <div v-else-if="variant === '5-tenants-real'" class="body tenants-real-body">
        <div class="tenants-real-eyebrow">[ REDENTIA WHITELABEL · 5 MARCAS NO AR ]</div>
        <h2 class="tenants-real-title">
          Um backend.<br>
          <span class="data-amber">Cinco identidades.</span>
        </h2>
        <div class="tenants-real-grid">
          <div class="tenant-real-card" style="background: #0A0B0E; border-color: #F5A623">
            <div class="trc-eyebrow" style="color: #F5A623">[ TERMINAL ]</div>
            <div class="trc-title" style="font-family: 'Instrument Serif'; color: #E8EAED">Investir com <i style="color:#F5A623">inteligência.</i></div>
            <div class="trc-brand" style="color: #F5A623">REDENTIA</div>
          </div>
          <div class="tenant-real-card" style="background: #F7F5EF; border-color: #C9A26A">
            <div class="trc-eyebrow" style="color: #6B5838">NORTE CAPITAL</div>
            <div class="trc-title" style="font-family: 'Fraunces'; color: #1C2133; font-style: italic">Estimado <span style="color:#8B6F3D">investidor,</span></div>
            <div class="trc-brand" style="color: #8B6F3D; font-family: 'Fraunces'">Norte Capital</div>
          </div>
          <div class="tenant-real-card" style="background: #0F0D0B; border-color: #FF6B35">
            <div class="trc-eyebrow" style="color: #FF6B35">MANUAL DO PRIMO</div>
            <div class="trc-title" style="font-family: 'Fraunces'; color: #F4EDE4; font-weight: 700">LIBERDADE <span style="color:#FF6B35">OU MEDIOCRIDADE.</span></div>
            <div class="trc-brand" style="color: #FF6B35; font-family: 'Fraunces'; font-weight: 700">PRIMO RICO</div>
          </div>
          <div class="tenant-real-card" style="background: #F6F1E8; border-color: #C84B31">
            <div class="trc-eyebrow" style="color: #C84B31; font-family: 'IBM Plex Mono', monospace">§ AUVP RESEARCH</div>
            <div class="trc-title" style="font-family: 'IBM Plex Serif'; color: #1F1A12; font-style: italic">A única <span style="color:#C84B31">verdade possível.</span></div>
            <div class="trc-brand" style="color: #C84B31; font-family: 'IBM Plex Serif'">Investidor Sardinha</div>
          </div>
          <div class="tenant-real-card" style="background: #1A0A2E; border-color: #FACC15">
            <div class="trc-eyebrow" style="color: #FACC15">AO VIVO · PROGRAMA #001</div>
            <div class="trc-title" style="font-family: 'Poppins'; color: #FFFFFF; font-weight: 900">Chega de dinheirofobia, <span style="color:#FACC15">criatura!</span></div>
            <div class="trc-brand" style="color: #FACC15; font-family: 'Poppins'; font-weight: 800">Me Poupe!</div>
          </div>
          <div class="tenant-real-card tenant-real-card-next">
            <div class="trc-eyebrow" style="color: #F5A623">[ SUA MARCA ]</div>
            <div class="trc-title" style="font-family: 'Instrument Serif'; color: #E8EAED">O próximo <i style="color:#F5A623">é você.</i></div>
            <div class="trc-brand" style="color: #F5A623">DEPLOY EM 1 SEMANA</div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           VARIANT · AI INTELLIGENT — features list
           ============================================================ -->
      <div v-else-if="variant === 'intelligent'" class="body int-body">
        <div class="int-eyebrow">[ INTELIGÊNCIA ARTIFICIAL ]</div>
        <h2 class="int-title">
          A primeira IA do Brasil<br>
          que <span class="data-amber">realmente sabe</span><br>
          de renda variável.
        </h2>
        <ul class="int-list">
          <li><span class="int-num">01</span> Treinada em português brasileiro · responde gírias de mercado</li>
          <li><span class="int-num">02</span> Cita fontes · ANBIMA, CVM, BACEN, IBGE — com link</li>
          <li><span class="int-num">03</span> Conhece regras brasileiras · JCP, day trade, isenção FIIs</li>
          <li><span class="int-num">04</span> Consulta sua carteira · responde com SEUS ativos, não genéricos</li>
        </ul>
      </div>

      <!-- ============================================================
           VARIANT · GLOBE REACH / BRAZIL FIRST
           ============================================================ -->
      <div v-else-if="variant === 'brazil-first'" class="body br-body">
        <div class="br-eyebrow">[ BRAZIL FIRST ]</div>
        <div class="br-flag">🇧🇷</div>
        <h2 class="br-title">
          Feita no Brasil, <br>
          para o <span class="data-amber">investidor brasileiro.</span>
        </h2>
        <div class="br-features">
          <div class="br-feature">✓ Dados em BRL nativo</div>
          <div class="br-feature">✓ Open Finance regulado BACEN</div>
          <div class="br-feature">✓ Conhece JCP, FII isento, day-trade 15%</div>
          <div class="br-feature">✓ IA responde em português, com gírias</div>
          <div class="br-feature">✓ Suporte em pt-BR, time no Brasil</div>
          <div class="br-feature">✓ LGPD nativa, dados em solo brasileiro</div>
        </div>
      </div>

      <!-- ============================================================
           Fallback
           ============================================================ -->
      <div v-else class="body fallback-body">
        <div style="font-family:'Instrument Serif';font-size:120px;color:#F5A623">{{ variant }}</div>
        <div style="font-family:'JetBrains Mono', monospace;color:#8B92A7">variant não encontrada</div>
      </div>

      <!-- ============================================================
           Footer (shared — some variants hide it)
           ============================================================ -->
      <div class="footer">
        <img src="/brand/logo-icon.svg" alt="Redentia" class="footer-logo" />
        <span class="footer-text">REDENTIA.COM.BR</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================
   GLOBAL CARD SHELL
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
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 56px 64px;
  box-sizing: border-box;
}

/* Background layers (applied inside cards that use dark terminal theme) */
.backdrop-1,
.backdrop-2,
.backdrop-grid,
.backdrop-noise {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.backdrop-1 {
  background: radial-gradient(ellipse at 50% 0%, rgba(245, 166, 35, 0.22) 0%, transparent 60%),
              radial-gradient(ellipse at 50% 100%, rgba(245, 166, 35, 0.1) 0%, transparent 60%);
}
.backdrop-2 { display: none; }
.backdrop-grid {
  opacity: 0.04;
  background-image:
    linear-gradient(#E8EAED 1px, transparent 1px),
    linear-gradient(90deg, #E8EAED 1px, transparent 1px);
  background-size: 48px 48px;
}
.backdrop-noise {
  opacity: 0.2;
  background-image: repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(232,234,237,0.04) 2px, rgba(232,234,237,0.04) 3px);
}

/* Header & Footer (shared) */
.header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #8B92A7;
  z-index: 2;
}
.header-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}
.header-logo {
  width: 32px;
  height: 32px;
}
.header-name {
  color: #E8EAED;
  font-weight: 700;
}
.header-tag {
  color: #F5A623;
}

.footer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 22px;
  margin-top: auto;
  border-top: 1px solid rgba(42, 46, 57, 0.5);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #8B92A7;
  z-index: 2;
}
.footer-logo {
  width: 26px;
  height: 26px;
  opacity: 0.6;
}

/* Body wrapper — every variant has its own layout inside */
.body {
  position: relative;
  flex: 1;
  display: flex;
  min-height: 0;
  z-index: 2;
  padding: 36px 0;
}

/* ============================================================
   IPHONE PUSH VARIANTS — 2-column: phone mockup + caption
   ============================================================ */
.iphone-body {
  align-items: center;
  gap: 48px;
}

.iphone {
  flex-shrink: 0;
  width: 440px;
  height: 880px;
  position: relative;
  filter: drop-shadow(0 25px 60px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 100px rgba(245, 166, 35, 0.08));
}

.iphone-frame {
  position: absolute;
  inset: 0;
  background: linear-gradient(145deg, #2a2a2d 0%, #151517 50%, #0a0a0c 100%);
  border-radius: 60px;
  padding: 13px;
  box-shadow:
    inset 0 0 0 2px #3a3a40,
    inset 0 0 0 6px #0a0a0c,
    0 0 0 1px rgba(255, 255, 255, 0.04);
}

.iphone-notch {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: 115px;
  height: 34px;
  background: #000;
  border-radius: 20px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

.iphone-screen {
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 48px;
  overflow: hidden;
  position: relative;
}

.screen-wall {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(60, 30, 0, 0.8) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(50, 20, 0, 0.5) 0%, transparent 50%),
    linear-gradient(180deg, #0a0503 0%, #1a0e02 50%, #0f0602 100%);
}

.status-bar {
  position: absolute;
  top: 16px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 36px;
  z-index: 5;
  color: white;
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
}
.status-time {
  padding-left: 8px;
}
.status-icons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.lock-datetime {
  position: absolute;
  top: 90px;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.88);
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
}
.lock-date {
  font-size: 18px;
  font-weight: 500;
  text-transform: capitalize;
  opacity: 0.8;
  margin-bottom: 4px;
}
.lock-time {
  font-size: 92px;
  font-weight: 200;
  letter-spacing: -0.03em;
  line-height: 1;
}

.push-card {
  position: absolute;
  left: 16px;
  right: 16px;
  top: 350px;
  background: rgba(30, 30, 32, 0.78);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border-radius: 20px;
  padding: 16px 18px;
  color: white;
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border: 0.5px solid rgba(255, 255, 255, 0.1);
}

.push-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.push-app-icon {
  width: 24px;
  height: 24px;
  background: #F5A623;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px;
  flex-shrink: 0;
}
.push-app-icon img {
  width: 100%;
  height: 100%;
  filter: invert(1);
}
.push-app-info {
  flex: 1;
  min-width: 0;
}
.push-app-name {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.85);
}
.push-time {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  text-transform: lowercase;
}
.push-title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.25;
  margin-bottom: 4px;
  color: white;
}
.push-body {
  font-size: 15px;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.8);
}

/* ===== App-screen variant (full UI inside iPhone) ===== */
.iphone-screen-app {
  background: linear-gradient(180deg, #0a0b0e 0%, #14161c 100%);
  display: flex;
  flex-direction: column;
}

.app-header {
  padding: 50px 22px 18px;
  background: linear-gradient(180deg, rgba(245, 166, 35, 0.18) 0%, transparent 100%);
}
.app-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.app-greeting {
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}
.app-bell { font-size: 18px; }
.app-portfolio {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.app-portfolio-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #F5A623;
  font-weight: 600;
}
.app-portfolio-value {
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
}
.app-portfolio-cents {
  font-size: 22px;
  opacity: 0.7;
}
.app-portfolio-change {
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  font-size: 13px;
  color: #00D395;
  font-weight: 600;
}
.app-portfolio-change span { opacity: 0.85; }

.app-tabs {
  display: flex;
  gap: 18px;
  padding: 8px 22px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.app-tab {
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.5);
  padding-bottom: 6px;
  border-bottom: 2px solid transparent;
}
.app-tab-active {
  color: #fff;
  border-bottom-color: #F5A623;
}

.app-asset-list {
  flex: 1;
  padding: 8px 0 70px;
  overflow: hidden;
}
.app-asset {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 22px;
}
.app-asset + .app-asset { border-top: 1px solid rgba(255,255,255,0.04); }
.app-asset-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  font-weight: 700;
  font-size: 13px;
  color: #fff;
  flex-shrink: 0;
}
.app-asset-info { flex: 1; min-width: 0; }
.app-asset-ticker {
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  line-height: 1.15;
}
.app-asset-name {
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  font-size: 11px;
  color: rgba(255,255,255,0.55);
  margin-top: 1px;
}
.app-asset-meta {
  text-align: right;
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
}
.app-asset-price {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  font-variant-numeric: tabular-nums;
}
.app-asset-change {
  font-size: 11px;
  font-weight: 600;
  margin-top: 1px;
  font-variant-numeric: tabular-nums;
}
.app-asset-change.pos { color: #00D395; }
.app-asset-change.neg { color: #FF4747; }

.app-bottom-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 10px 0 20px;
  background: rgba(10,11,14,0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255,255,255,0.06);
}
.app-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  font-size: 9px;
  color: rgba(255,255,255,0.4);
}
.app-nav-active { color: #F5A623; }
.app-nav-icon { font-size: 14px; line-height: 1; }

/* ===== Chat (iMessage style) ===== */
.chat-header {
  padding: 50px 18px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(180deg, rgba(245, 166, 35, 0.12) 0%, transparent 100%);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.chat-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #F5A623;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 7px;
  flex-shrink: 0;
}
.chat-avatar img { width: 100%; height: 100%; }
.chat-header-info { flex: 1; }
.chat-header-name {
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  line-height: 1.15;
}
.chat-header-status {
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  font-size: 10px;
  color: rgba(255,255,255,0.55);
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 1px;
}
.chat-dot-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00D395;
  box-shadow: 0 0 8px #00D395;
}
.chat-info-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(245, 166, 35, 0.15);
  color: #F5A623;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.chat-messages {
  flex: 1;
  padding: 12px 14px 80px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}
.chat-msg {
  display: flex;
  flex-direction: column;
  max-width: 84%;
}
.chat-msg-user { align-self: flex-end; align-items: flex-end; }
.chat-msg-ai { align-self: flex-start; align-items: flex-start; }
.chat-bubble {
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  font-size: 13px;
  line-height: 1.4;
  padding: 9px 13px;
  border-radius: 18px;
  word-wrap: break-word;
}
.chat-bubble-user {
  background: linear-gradient(135deg, #F5A623 0%, #ec9210 100%);
  color: #0a0b0e;
  font-weight: 500;
  border-bottom-right-radius: 4px;
}
.chat-bubble-ai {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(255,255,255,0.04);
}
.chat-bubble-card {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px 14px;
  background: rgba(245, 166, 35, 0.1);
  border: 1px solid rgba(245, 166, 35, 0.3);
}
.chat-card-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #F5A623;
  font-weight: 700;
  margin-bottom: 4px;
}
.chat-card-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255,255,255,0.7);
}
.chat-card-row strong {
  color: #fff;
  font-weight: 600;
}
.chat-card-row strong.pos { color: #00D395; }
.chat-time {
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  font-size: 9px;
  color: rgba(255,255,255,0.4);
  margin-top: 3px;
  padding: 0 8px;
}
.chat-typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px !important;
}
.chat-typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  animation: chat-typing-bounce 1.2s infinite;
}
.chat-typing-dot:nth-child(2) { animation-delay: 0.2s; }
.chat-typing-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes chat-typing-bounce {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}

.chat-input {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 14px 18px;
  display: flex;
  gap: 8px;
  align-items: center;
  background: rgba(10,11,14,0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255,255,255,0.06);
}
.chat-input-field {
  flex: 1;
  padding: 9px 14px;
  background: rgba(255,255,255,0.08);
  border-radius: 9999px;
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  border: 1px solid rgba(255,255,255,0.06);
}
.chat-send-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F5A623;
  color: #0a0b0e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.iphone-caption {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 440px;
}

.iphone-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.2em;
  color: #F5A623;
  text-transform: uppercase;
  margin-bottom: 24px;
}

.iphone-title {
  font-family: 'Instrument Serif', serif;
  font-size: 92px;
  line-height: 0.95;
  letter-spacing: -0.02em;
  color: #E8EAED;
  margin: 0 0 28px 0;
  max-width: 440px;
}

.iphone-sub {
  font-size: 20px;
  line-height: 1.5;
  color: #8B92A7;
  margin-bottom: 32px;
  max-width: 440px;
}

.iphone-tag {
  display: inline-block;
  padding: 14px 22px;
  background: #F5A623;
  color: #0A0B0E;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  border-radius: 4px;
  width: fit-content;
  box-shadow: 0 10px 30px rgba(245, 166, 35, 0.3);
}

/* ============================================================
   JARGON VARIANTS — huge type, per-tenant voice
   ============================================================ */
.jargon-body {
  flex-direction: column;
  justify-content: center;
  padding-top: 0;
  padding-bottom: 0;
}

.jargon-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin-bottom: 48px;
}

.jargon-quote {
  font-size: 150px;
  line-height: 0.92;
  letter-spacing: -0.02em;
  margin-bottom: 40px;
}

.jargon-author {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 24px;
}
.jargon-author-name {
  font-size: 22px;
  font-weight: 600;
}
.jargon-author-role {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.2em;
  color: #8B92A7;
  text-transform: uppercase;
}

/* Me Poupe jargon — purple + yellow highlight + Poppins 900 */
.card-jargon-mepoupe {
  background: linear-gradient(135deg, #1A0A2E 0%, #2D1047 50%, #1A0A2E 100%);
}
.card-jargon-mepoupe .backdrop-1 { display: none; }
.card-jargon-mepoupe .backdrop-2 {
  display: block;
  background:
    radial-gradient(ellipse at 10% 20%, rgba(250, 204, 21, 0.18) 0%, transparent 50%),
    radial-gradient(ellipse at 90% 85%, rgba(250, 204, 21, 0.12) 0%, transparent 55%);
}
.card-jargon-mepoupe .header-tag,
.card-jargon-mepoupe .footer-text {
  color: #FACC15;
}
.card-jargon-mepoupe .jargon-eyebrow {
  color: #FACC15;
}
.card-jargon-mepoupe .jargon-quote {
  font-family: 'Poppins', sans-serif;
  font-weight: 900;
  color: #FFFFFF;
}
.card-jargon-mepoupe .hl-yellow {
  color: #FACC15;
  position: relative;
  display: inline-block;
}
.card-jargon-mepoupe .hl-yellow::after {
  content: '';
  position: absolute;
  left: -4px;
  right: -4px;
  bottom: 6px;
  height: 22px;
  background: rgba(250, 204, 21, 0.3);
  z-index: -1;
  transform: skew(-2deg);
}

/* Primo Rico jargon — deep dark + orange italic + Fraunces 700 */
.card-jargon-primo {
  background: linear-gradient(180deg, #0F0D0B 0%, #1a1714 100%);
}
.card-jargon-primo .backdrop-1 {
  background: radial-gradient(ellipse at 50% 30%, rgba(255, 107, 53, 0.14) 0%, transparent 50%);
}
.card-jargon-primo .header-tag,
.card-jargon-primo .footer-text {
  color: #FF6B35;
}
.card-jargon-primo .jargon-eyebrow { color: #FF6B35; }
.card-jargon-primo .jargon-quote {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  color: #F4EDE4;
  text-transform: uppercase;
}
.card-jargon-primo .italic-orange {
  color: #FF6B35;
  font-style: italic;
  font-weight: 400;
  text-transform: none;
}

/* Sardinha jargon — ivory paper + red-pen IBM Plex Serif */
.card-jargon-sardinha {
  background: #F6F1E8;
  color: #1F1A12;
}
.card-jargon-sardinha .backdrop-1,
.card-jargon-sardinha .backdrop-grid,
.card-jargon-sardinha .backdrop-noise {
  display: none;
}
.card-jargon-sardinha .header-name,
.card-jargon-sardinha .footer-text,
.card-jargon-sardinha .header-tag {
  color: #1F1A12;
}
.card-jargon-sardinha .footer {
  border-top-color: rgba(31, 26, 18, 0.15);
}
.card-jargon-sardinha .jargon-eyebrow {
  color: #C84B31;
  font-family: 'IBM Plex Mono', 'JetBrains Mono', monospace;
}
.card-jargon-sardinha .jargon-quote {
  font-family: 'IBM Plex Serif', serif;
  font-weight: 500;
  color: #1F1A12;
}
.card-jargon-sardinha .italic-red {
  color: #C84B31;
  font-style: italic;
}
.card-jargon-sardinha .jargon-author-name { color: #1F1A12; }
.card-jargon-sardinha .jargon-author-role { color: rgba(31, 26, 18, 0.55); }

/* Norte jargon — ivory editorial + Fraunces italic + gold */
.card-jargon-norte {
  background: #F7F5EF;
  color: #1C2133;
}
.card-jargon-norte .backdrop-1,
.card-jargon-norte .backdrop-grid,
.card-jargon-norte .backdrop-noise {
  display: none;
}
.card-jargon-norte .header-name,
.card-jargon-norte .footer-text,
.card-jargon-norte .header-tag {
  color: #1C2133;
}
.card-jargon-norte .footer { border-top-color: rgba(28, 33, 51, 0.15); }
.card-jargon-norte .jargon-eyebrow {
  color: #8B6F3D;
  font-family: 'Fraunces', serif;
  font-style: italic;
  letter-spacing: 0.15em;
}
.card-jargon-norte .jargon-quote {
  font-family: 'Fraunces', serif;
  font-weight: 400;
  color: #1C2133;
}
.card-jargon-norte .italic-gold {
  color: #8B6F3D;
  font-style: italic;
}
.card-jargon-norte .jargon-author-name { color: #1C2133; }
.card-jargon-norte .jargon-author-role { color: rgba(28, 33, 51, 0.55); }

/* Redentia jargon — amber terminal */
.card-jargon-redentia .jargon-eyebrow {
  color: #F5A623;
}
.card-jargon-redentia .jargon-quote {
  font-family: 'Instrument Serif', serif;
  color: #E8EAED;
}
.card-jargon-redentia .italic-amber {
  color: #F5A623;
  font-style: italic;
}

/* ============================================================
   TENANT SHOWCASE VARIANTS — shows a tenant's hero inside the card
   with the real tenant colors + fonts
   ============================================================ */
.tenant-body {
  flex-direction: column;
  padding: 16px 0;
}

.tenant-hero-grid {
  flex: 1;
  display: flex;
  align-items: center;
}

.tenant-hero-text {
  max-width: 880px;
}

.tenant-title {
  font-size: 108px;
  line-height: 0.95;
  letter-spacing: -0.02em;
  margin: 0 0 32px 0;
}

.tenant-sub {
  font-size: 22px;
  line-height: 1.45;
  margin-bottom: 28px;
  max-width: 700px;
}

.tenant-footer {
  position: relative;
  z-index: 3;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 14px 0 0;
  margin-top: auto;
}

/* Me Poupe showcase */
.card-tenant-showcase-mepoupe {
  background: linear-gradient(135deg, #1A0A2E 0%, #2D1047 55%, #1A0A2E 100%);
}
.card-tenant-showcase-mepoupe .backdrop-1 { display: none; }
.card-tenant-showcase-mepoupe .backdrop-2 {
  display: block;
  background:
    radial-gradient(ellipse at 15% 15%, rgba(250, 204, 21, 0.2) 0%, transparent 55%),
    radial-gradient(circle at 88% 12%, #FACC15 2px, transparent 2px),
    radial-gradient(circle at 78% 85%, #FACC15 3px, transparent 3px),
    radial-gradient(circle at 25% 90%, #FACC15 2px, transparent 2px);
  opacity: 0.5;
}
.card-tenant-showcase-mepoupe .header-tag,
.card-tenant-showcase-mepoupe .footer-text,
.card-tenant-showcase-mepoupe .tenant-footer { color: #FACC15; }
.card-tenant-showcase-mepoupe .tenant-badge-wrap { margin-top: 20px; }
.card-tenant-showcase-mepoupe .tenant-badge {
  display: inline-block;
  background: #FACC15;
  color: #1A0A2E;
  padding: 10px 20px;
  border-radius: 9999px;
  font-family: 'Poppins', sans-serif;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transform: rotate(-3deg);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}
.card-tenant-showcase-mepoupe .tenant-title-mepoupe {
  font-family: 'Poppins', sans-serif;
  font-weight: 900;
  color: #FFFFFF;
}
.card-tenant-showcase-mepoupe .tenant-highlight-yellow {
  color: #FACC15;
  display: inline-block;
  position: relative;
}
.card-tenant-showcase-mepoupe .tenant-highlight-yellow::after {
  content: '';
  position: absolute;
  left: -6px;
  right: -6px;
  bottom: 8px;
  height: 24px;
  background: rgba(250, 204, 21, 0.25);
  z-index: -1;
  transform: skew(-3deg);
}
.card-tenant-showcase-mepoupe .tenant-sub {
  color: rgba(255, 255, 255, 0.85);
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
}
.card-tenant-showcase-mepoupe .tenant-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.card-tenant-showcase-mepoupe .tenant-chip {
  padding: 8px 16px;
  border-radius: 9999px;
  background: rgba(250, 204, 21, 0.15);
  border: 1.5px solid rgba(250, 204, 21, 0.5);
  color: #FACC15;
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

/* Primo Rico showcase */
.card-tenant-showcase-primo {
  background: #0F0D0B;
}
.card-tenant-showcase-primo .backdrop-1 {
  background: radial-gradient(ellipse at 80% 0%, rgba(255, 107, 53, 0.18) 0%, transparent 50%);
}
.card-tenant-showcase-primo .header-tag,
.card-tenant-showcase-primo .footer-text,
.card-tenant-showcase-primo .tenant-footer { color: #FF6B35; }
.card-tenant-showcase-primo .tenant-tape {
  background: #FF6B35;
  color: #0F0D0B;
  padding: 12px 56px;
  margin: 14px -64px 40px;
  font-family: 'Fraunces', serif;
  font-size: 15px;
  letter-spacing: 0.2em;
  font-weight: 700;
  text-transform: uppercase;
}
.card-tenant-showcase-primo .tenant-title-primo {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  color: #F4EDE4;
  text-transform: uppercase;
  font-size: 118px;
}
.card-tenant-showcase-primo .tenant-highlight-orange {
  color: #FF6B35;
}
.card-tenant-showcase-primo .tenant-sub {
  color: rgba(244, 237, 228, 0.75);
  font-family: 'Fraunces', serif;
}
.card-tenant-showcase-primo .tenant-bullets {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: 'Fraunces', serif;
  font-size: 20px;
  font-weight: 500;
  color: #FF6B35;
}

/* Sardinha showcase */
.card-tenant-showcase-sardinha {
  background: #F6F1E8;
  color: #1F1A12;
}
.card-tenant-showcase-sardinha .backdrop-1,
.card-tenant-showcase-sardinha .backdrop-grid,
.card-tenant-showcase-sardinha .backdrop-noise { display: none; }
.card-tenant-showcase-sardinha .header-name,
.card-tenant-showcase-sardinha .footer-text,
.card-tenant-showcase-sardinha .header-tag,
.card-tenant-showcase-sardinha .tenant-footer { color: #1F1A12; }
.card-tenant-showcase-sardinha .footer {
  border-top-color: rgba(31, 26, 18, 0.15);
}
.card-tenant-showcase-sardinha .tenant-masthead {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #C84B31;
  display: flex;
  justify-content: space-between;
  padding-top: 18px;
  padding-bottom: 22px;
  border-bottom: 1.5px solid rgba(31, 26, 18, 0.3);
  margin-bottom: 40px;
}
.card-tenant-showcase-sardinha .tenant-section-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.18em;
  color: #C84B31;
  text-transform: uppercase;
  margin-bottom: 24px;
}
.card-tenant-showcase-sardinha .tenant-title-sardinha {
  font-family: 'IBM Plex Serif', serif;
  font-weight: 500;
  color: #1F1A12;
}
.card-tenant-showcase-sardinha .tenant-highlight-red {
  color: #C84B31;
  font-style: italic;
  text-decoration: underline;
  text-decoration-color: rgba(200, 75, 49, 0.35);
  text-decoration-thickness: 4px;
  text-underline-offset: 10px;
}
.card-tenant-showcase-sardinha .tenant-sub {
  color: rgba(31, 26, 18, 0.7);
  font-family: 'IBM Plex Serif', serif;
  font-style: italic;
  font-size: 24px;
}
.card-tenant-showcase-sardinha .tenant-sign {
  font-family: 'IBM Plex Serif', serif;
  font-style: italic;
  font-size: 16px;
  color: rgba(31, 26, 18, 0.55);
}

/* Norte showcase */
.card-tenant-showcase-norte {
  background: #F7F5EF;
  color: #1C2133;
}
.card-tenant-showcase-norte .backdrop-1,
.card-tenant-showcase-norte .backdrop-grid,
.card-tenant-showcase-norte .backdrop-noise { display: none; }
.card-tenant-showcase-norte .header-name,
.card-tenant-showcase-norte .footer-text,
.card-tenant-showcase-norte .header-tag,
.card-tenant-showcase-norte .tenant-footer { color: #1C2133; }
.card-tenant-showcase-norte .footer { border-top-color: rgba(28, 33, 51, 0.15); }
.card-tenant-showcase-norte .tenant-letter-header {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 15px;
  color: rgba(28, 33, 51, 0.55);
  display: flex;
  justify-content: space-between;
  padding: 18px 0 24px;
  border-bottom: 1px solid rgba(28, 33, 51, 0.15);
  margin-bottom: 36px;
}
.card-tenant-showcase-norte .tenant-dash {
  width: 80px;
  height: 1.5px;
  background: #8B6F3D;
  margin-bottom: 28px;
}
.card-tenant-showcase-norte .tenant-title-norte {
  font-family: 'Fraunces', serif;
  font-weight: 400;
  color: #1C2133;
}
.card-tenant-showcase-norte .tenant-highlight-gold {
  color: #8B6F3D;
  font-style: italic;
}
.card-tenant-showcase-norte .tenant-sub-italic {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 24px;
  color: rgba(28, 33, 51, 0.7);
  max-width: 800px;
}
.card-tenant-showcase-norte .tenant-sign-italic {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 16px;
  color: rgba(28, 33, 51, 0.55);
  margin-top: 16px;
}

/* Redentia showcase */
.card-tenant-showcase-redentia .tenant-status-line {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.2em;
  color: #8B92A7;
  margin-top: 12px;
  margin-bottom: 40px;
  text-transform: uppercase;
}
.card-tenant-showcase-redentia .status-dot-live {
  color: #F5A623;
  animation: pulse 1.5s infinite;
}
.card-tenant-showcase-redentia .tenant-title-redentia {
  font-family: 'Instrument Serif', serif;
  color: #E8EAED;
}
.card-tenant-showcase-redentia .tenant-highlight-amber {
  color: #F5A623;
  font-style: italic;
}
.card-tenant-showcase-redentia .tenant-sub {
  color: #8B92A7;
  font-size: 22px;
}
.card-tenant-showcase-redentia .tenant-terminal-line {
  display: inline-flex;
  align-items: center;
  padding: 14px 24px;
  background: rgba(245, 166, 35, 0.1);
  border: 1px solid rgba(245, 166, 35, 0.4);
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  color: #F5A623;
}
.terminal-caret-mini {
  display: inline-block;
  width: 10px;
  height: 22px;
  background: #F5A623;
  margin-left: 4px;
  animation: blink 1s infinite step-end;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
@keyframes blink { 50% { opacity: 0; } }

/* ============================================================
   DATA COVERAGE — big number + ticker wall
   ============================================================ */
.data-body {
  flex-direction: column;
  gap: 32px;
  padding-top: 32px;
}
.data-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  letter-spacing: 0.22em;
  color: #F5A623;
  text-transform: uppercase;
}
.data-coverage-headline {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.data-big-number {
  font-family: 'Instrument Serif', serif;
  font-size: 320px;
  line-height: 0.85;
  color: #F5A623;
  letter-spacing: -0.04em;
  margin-top: 8px;
}
.data-big-sublabel {
  font-family: 'JetBrains Mono', monospace;
  font-size: 20px;
  letter-spacing: 0.15em;
  color: #E8EAED;
  text-transform: uppercase;
  margin-top: 8px;
}
.ticker-wall {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
}
.ticker-wall-row {
  display: flex;
  gap: 10px;
  flex-wrap: nowrap;
}
.ticker-wall-chip {
  padding: 10px 16px;
  border: 1px solid #2A2E39;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  font-weight: 700;
  color: #E8EAED;
  background: rgba(20, 22, 28, 0.6);
  letter-spacing: 0.04em;
}
.data-foot {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #8B92A7;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  text-align: center;
  margin-top: 16px;
}

.data-title {
  font-family: 'Instrument Serif', serif;
  font-size: 96px;
  line-height: 0.95;
  letter-spacing: -0.02em;
  color: #E8EAED;
  margin: 0;
  max-width: 900px;
}
.data-amber {
  color: #F5A623;
  font-style: italic;
}

/* Timeline */
.timeline-track {
  position: relative;
  display: flex;
  justify-content: space-between;
  margin: 60px 0 48px;
  padding: 40px 0 20px;
}
.timeline-line {
  position: absolute;
  top: 52px;
  left: 4%;
  right: 4%;
  height: 2px;
  background: linear-gradient(to right, #2A2E39, #F5A623 85%, #FFC555);
  z-index: 0;
}
.timeline-year {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.timeline-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #0A0B0E;
  border: 2px solid #8B92A7;
}
.timeline-dot-end {
  background: #F5A623;
  border-color: #F5A623;
  box-shadow: 0 0 0 6px rgba(245, 166, 35, 0.25);
}
.timeline-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  color: #8B92A7;
  font-weight: 700;
}

/* Security */
.security-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin: 32px 0;
}
.security-item {
  padding: 30px 28px;
  border: 1px solid #2A2E39;
  border-radius: 10px;
  background: rgba(20, 22, 28, 0.65);
}
.security-icon {
  font-size: 44px;
  margin-bottom: 14px;
  filter: grayscale(0.2);
}
.security-name {
  font-family: 'Instrument Serif', serif;
  font-size: 36px;
  color: #F5A623;
  margin-bottom: 6px;
}
.security-desc {
  font-size: 15px;
  color: #8B92A7;
  line-height: 1.4;
}

/* ============================================================
   AI CHAT MOCKUP
   ============================================================ */
.ai-body {
  flex-direction: column;
  gap: 26px;
  padding-top: 24px;
}
.ai-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.22em;
  color: #F5A623;
  text-transform: uppercase;
}
.ai-title {
  font-family: 'Instrument Serif', serif;
  font-size: 80px;
  line-height: 0.95;
  color: #E8EAED;
  margin: 0;
}
.ai-chat-frame {
  background: #14161C;
  border: 1px solid #2A2E39;
  border-radius: 18px;
  padding: 24px;
  margin-top: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
.ai-chat-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 18px;
  border-bottom: 1px solid #2A2E39;
  margin-bottom: 20px;
}
.ai-chat-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #F5A623;
  color: #0A0B0E;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Instrument Serif', serif;
  font-size: 28px;
  font-weight: 700;
}
.ai-chat-name {
  font-size: 17px;
  color: #E8EAED;
  font-weight: 700;
}
.ai-chat-status {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #8B92A7;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.ai-chat-dot {
  width: 8px;
  height: 8px;
  background: #00D395;
  border-radius: 50%;
  display: inline-block;
}

.ai-chat-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.ai-msg {
  padding: 18px 22px;
  border-radius: 14px;
  font-size: 17px;
  line-height: 1.45;
  max-width: 85%;
}
.ai-msg-user {
  background: #2A2E39;
  color: #E8EAED;
  align-self: flex-end;
  border-bottom-right-radius: 4px;
}
.ai-msg-bot {
  background: rgba(245, 166, 35, 0.08);
  border: 1px solid rgba(245, 166, 35, 0.25);
  color: #E8EAED;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}
.ai-msg-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: #F5A623;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.ai-msg-source {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(245, 166, 35, 0.15);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #8B92A7;
  letter-spacing: 0.15em;
}

/* ============================================================
   STATS ROW
   ============================================================ */
.stats-body {
  flex-direction: column;
  gap: 28px;
  padding-top: 28px;
}
.stats-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.22em;
  color: #F5A623;
  text-transform: uppercase;
}
.stats-title {
  font-family: 'Instrument Serif', serif;
  font-size: 72px;
  line-height: 0.95;
  color: #E8EAED;
  margin: 0;
  max-width: 900px;
}
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-top: 24px;
}
.stats-item {
  padding: 36px 30px;
  border: 1px solid #2A2E39;
  border-radius: 12px;
  background: rgba(20, 22, 28, 0.6);
}
.stats-num {
  font-family: 'Instrument Serif', serif;
  font-size: 94px;
  line-height: 0.9;
  color: #F5A623;
  letter-spacing: -0.03em;
}
.stats-lab {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #E8EAED;
  margin-top: 14px;
}
.stats-sub {
  font-size: 14px;
  color: #8B92A7;
  margin-top: 6px;
}

/* ============================================================
   WHY CONSOLIDATOR
   ============================================================ */
.why-body {
  flex-direction: column;
  gap: 32px;
}
.why-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.22em;
  color: #F5A623;
  text-transform: uppercase;
}
.why-title {
  font-family: 'Instrument Serif', serif;
  font-size: 84px;
  line-height: 0.95;
  color: #E8EAED;
  margin: 0;
}
.why-columns {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex: 1;
}
.why-col {
  flex: 1;
  padding: 36px 28px;
  border: 1px solid #2A2E39;
  border-radius: 14px;
  background: rgba(20, 22, 28, 0.6);
}
.why-col-after {
  border-color: #F5A623;
  box-shadow: 0 16px 60px rgba(245, 166, 35, 0.15);
}
.why-col-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #8B92A7;
  margin-bottom: 22px;
}
.why-col-label-amber {
  color: #F5A623;
}
.wallets-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wallet-card {
  padding: 16px 20px;
  background: #14161C;
  border: 1px solid #2A2E39;
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  font-weight: 700;
  color: #E8EAED;
  letter-spacing: 0.12em;
}
.wallets-one {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 28px 22px;
  background: #0A0B0E;
  border: 1.5px solid #F5A623;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(245, 166, 35, 0.2);
}
.wallet-one-icon {
  width: 64px;
  height: 64px;
  background: #F5A623;
  color: #0A0B0E;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Instrument Serif', serif;
  font-size: 38px;
  font-weight: 700;
}
.wallet-one-text {
  font-family: 'Instrument Serif', serif;
  font-size: 32px;
  color: #E8EAED;
  line-height: 1.1;
}
.why-col-sub {
  margin-top: 20px;
  font-size: 14px;
  color: #8B92A7;
}
.why-arrow {
  font-size: 64px;
  color: #F5A623;
  font-weight: 700;
  flex-shrink: 0;
}
.why-foot {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.15em;
  color: #8B92A7;
  text-align: center;
  text-transform: uppercase;
}

/* ============================================================
   CALCULATORS GRID
   ============================================================ */
.calc-body {
  flex-direction: column;
  gap: 24px;
  padding-top: 24px;
}
.calc-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.22em;
  color: #F5A623;
  text-transform: uppercase;
}
.calc-title {
  font-family: 'Instrument Serif', serif;
  font-size: 82px;
  line-height: 0.95;
  color: #E8EAED;
  margin: 0;
}
.calc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-top: 12px;
}
.calc-item {
  padding: 26px 18px;
  background: rgba(20, 22, 28, 0.7);
  border: 1px solid #2A2E39;
  border-radius: 10px;
  text-align: center;
}
.calc-icon {
  font-size: 42px;
  margin-bottom: 12px;
}
.calc-name {
  font-family: 'Instrument Serif', serif;
  font-size: 22px;
  color: #E8EAED;
  line-height: 1;
}
.calc-tag {
  margin-top: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #F5A623;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.calc-foot {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.2em;
  color: #F5A623;
  text-transform: uppercase;
  text-align: center;
}

/* ============================================================
   OPEN FINANCE RING
   ============================================================ */
.of-body {
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: flex-start;
  padding-top: 36px;
}
.of-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.22em;
  color: #F5A623;
  text-transform: uppercase;
}
.of-title {
  font-family: 'Instrument Serif', serif;
  font-size: 92px;
  line-height: 0.95;
  color: #E8EAED;
  margin: 0 0 12px 0;
  text-align: center;
}
.of-ring {
  position: relative;
  width: 600px;
  height: 460px;
  margin: 0 auto;
}
.of-ring-core {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle, #F5A623 0%, #C07A00 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 80px rgba(245, 166, 35, 0.5);
}
.of-ring-center {
  font-family: 'Instrument Serif', serif;
  font-size: 96px;
  font-weight: 400;
  color: #0A0B0E;
  line-height: 1;
}
.of-ring-bank {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 68px;
  height: 68px;
  margin-left: -34px;
  margin-top: -34px;
  border-radius: 50%;
  background: #14161C;
  border: 1.5px solid #2A2E39;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  color: #F5A623;
  letter-spacing: 0.04em;
}
.of-foot {
  font-size: 15px;
  color: #8B92A7;
  text-align: center;
  max-width: 740px;
  margin: 0 auto;
  line-height: 1.5;
}

/* ============================================================
   FEATURE HIGHLIGHT
   ============================================================ */
.feat-body {
  flex-direction: column;
  gap: 20px;
  padding-top: 24px;
}
.feat-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.22em;
  color: #F5A623;
  text-transform: uppercase;
}
.feat-badge-wrap {
  margin: 4px 0 8px 0;
}
.feat-badge {
  display: inline-block;
  padding: 9px 22px;
  background: #F5A623;
  color: #0A0B0E;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.2em;
}
.feat-title {
  font-family: 'Instrument Serif', serif;
  font-size: 84px;
  line-height: 0.95;
  color: #E8EAED;
  margin: 0;
}
.feat-sub {
  font-size: 18px;
  line-height: 1.5;
  color: #8B92A7;
  max-width: 900px;
}
.feat-card {
  background: #14161C;
  border: 1px solid rgba(245, 166, 35, 0.35);
  border-left: 4px solid #F5A623;
  border-radius: 12px;
  padding: 28px 32px;
  margin-top: 10px;
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.4);
}
.feat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.feat-card-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.18em;
  color: #F5A623;
  text-transform: uppercase;
}
.feat-card-change {
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  color: #00D395;
  font-weight: 700;
}
.feat-card-title {
  font-family: 'Instrument Serif', serif;
  font-size: 32px;
  color: #E8EAED;
  margin: 0 0 10px 0;
  line-height: 1.15;
}
.feat-card-body {
  font-size: 15px;
  color: #8B92A7;
  line-height: 1.5;
  margin: 0 0 14px 0;
}
.feat-card-sources {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #8B92A7;
  letter-spacing: 0.16em;
  padding-top: 12px;
  border-top: 1px solid rgba(245, 166, 35, 0.15);
}

/* ============================================================
   5 TENANTS REAL
   ============================================================ */
.tenants-real-body {
  flex-direction: column;
  gap: 24px;
  padding-top: 18px;
}
.tenants-real-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.22em;
  color: #F5A623;
  text-transform: uppercase;
}
.tenants-real-title {
  font-family: 'Instrument Serif', serif;
  font-size: 78px;
  line-height: 0.95;
  color: #E8EAED;
  margin: 0;
}
.tenants-real-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 8px;
}
.tenant-real-card {
  padding: 22px 18px;
  border: 1.5px solid;
  border-radius: 12px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.trc-eyebrow {
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
}
.trc-title {
  font-size: 24px;
  line-height: 1.1;
  margin-top: 10px;
}
.trc-brand {
  font-size: 18px;
  font-weight: 700;
  margin-top: 16px;
}
.tenant-real-card-next {
  background: rgba(20, 22, 28, 0.5);
  border-color: #F5A623;
  border-style: dashed;
}

/* ============================================================
   INTELLIGENT FEATURES LIST
   ============================================================ */
.int-body {
  flex-direction: column;
  gap: 28px;
  padding-top: 24px;
}
.int-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.22em;
  color: #F5A623;
  text-transform: uppercase;
}
.int-title {
  font-family: 'Instrument Serif', serif;
  font-size: 72px;
  line-height: 0.98;
  color: #E8EAED;
  margin: 0;
  max-width: 900px;
}
.int-list {
  list-style: none;
  padding: 0;
  margin: 12px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.int-list li {
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 22px 26px;
  background: rgba(20, 22, 28, 0.6);
  border: 1px solid #2A2E39;
  border-left: 4px solid #F5A623;
  border-radius: 10px;
  font-family: 'Instrument Serif', serif;
  font-size: 26px;
  color: #E8EAED;
  line-height: 1.25;
}
.int-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 20px;
  color: #F5A623;
  font-weight: 700;
  letter-spacing: 0.05em;
}

/* ============================================================
   BRAZIL FIRST
   ============================================================ */
.br-body {
  flex-direction: column;
  justify-content: center;
  padding-top: 0;
  padding-bottom: 0;
  gap: 16px;
}
.br-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.22em;
  color: #F5A623;
  text-transform: uppercase;
}
.br-flag {
  font-size: 160px;
  line-height: 1;
  margin: 4px 0;
  filter: drop-shadow(0 8px 24px rgba(0, 155, 58, 0.3));
}
.br-title {
  font-family: 'Instrument Serif', serif;
  font-size: 90px;
  line-height: 0.95;
  color: #E8EAED;
  margin: 0;
}
.br-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 20px;
}
.br-feature {
  padding: 18px 22px;
  background: rgba(20, 22, 28, 0.6);
  border: 1px solid #2A2E39;
  border-left: 3px solid #F5A623;
  border-radius: 8px;
  font-size: 17px;
  color: #E8EAED;
}
</style>

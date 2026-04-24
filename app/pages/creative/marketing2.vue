<script setup lang="ts">
definePageMeta({
  layout: false,
  isPublicRoute: true,
  hideInstallAppBanner: true,
})

// ============================================================
// Marketing Creative · Volume 2, VISUAL-FIRST
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

const isEditorial = computed(() => variant.value.startsWith('redentia-'))

useHead(() => ({
  title: `Redentia, ${variant.value}`,
  meta: [
    { name: 'robots', content: 'noindex,nofollow,noarchive' },
    { name: 'viewport', content: 'width=1080, initial-scale=1' },
  ],
  link: [{ rel: 'stylesheet', href: fontsHref }],
  style: isEditorial.value ? [{
    children: `
      html, body, #__nuxt, #__layout { margin: 0; padding: 0; background: #F5A623; width: 1080px; height: 1080px; overflow: hidden; }
      body > * { width: 1080px; height: 1080px; }
    `,
  }] : [],
}))

// Helpers for the data-coverage variant, simulate a list of tickers
const sampleTickers = [
  'PETR4', 'VALE3', 'ITUB4', 'BBAS3', 'BBDC4', 'MGLU3',
  'WEGE3', 'ABEV3', 'ITSA4', 'B3SA3', 'RENT3', 'LREN3',
  'JBSS3', 'SUZB3', 'HAPV3', 'RADL3', 'EQTL3', 'PRIO3',
  'CCRO3', 'CSAN3', 'GGBR4', 'SBSP3', 'UGPA3', 'VIVT3',
]

// ============================================================
// CARROSSEL REDENTIA · query-param helpers
// Permite customizar cada slide via ?title=...&subtitle=...&pager=...
// Usa token {amber} dentro de strings para marcar a parte destacada
// ============================================================
function splitHighlight(text: string): { plain: string; highlight: string; tail: string } {
  const match = text.match(/^(.*?)\{amber\}(.*?)\{\/amber\}(.*)$/)
  if (!match) return { plain: text, highlight: '', tail: '' }
  return { plain: match[1] ?? '', highlight: match[2] ?? '', tail: match[3] ?? '' }
}
function renderMultiline(text: string): string[] {
  // Accept both real newlines (when multi-line strings are urlencoded)
  // and the escaped-backslash-n form (when shell passes "\n" literally).
  return text.split(/\r?\n|\\n/).map(s => s.trim()).filter(Boolean)
}
const pager = computed(() => q('pager', ''))
const url = computed(() => q('url', 'redentia.com.br'))
const statValue = computed(() => q('stat_value', ''))
const statUnit = computed(() => q('stat_unit', ''))
const listItems = computed(() => renderMultiline(q('items', '')))
const beforeTitle = computed(() => q('before_title', 'ANTES'))
const afterTitle = computed(() => q('after_title', 'COM REDENTIA'))
const beforeItems = computed(() => renderMultiline(q('before_items', '')))
const afterItems = computed(() => renderMultiline(q('after_items', '')))
const stepsItems = computed(() => renderMultiline(q('steps', '')))
const badges = computed(() => {
  const b1 = q('badge1', '')
  const b2 = q('badge2', '')
  const b3 = q('badge3', '')
  return [b1, b2, b3].filter(Boolean).map(s => {
    const [val, ...rest] = s.split('|')
    return { value: (val ?? '').trim(), label: rest.join('|').trim() }
  })
})
const marks = computed(() => {
  const raw = q('marks', '')
  if (!raw) return []
  return raw.split('|').map(s => s.trim()).filter(Boolean)
})

// Unit-post (single post) props
const ticker = computed(() => q('ticker', 'PETR4'))
const tickerName = computed(() => q('ticker_name', 'PETROBRAS PN'))
const tickerSector = computed(() => q('ticker_sector', 'ENERGIA'))
const price = computed(() => q('price', 'R$ 49,03'))
const change = computed(() => q('change', '+0,27%'))
const direction = computed(() => q('direction', 'up'))
const meta1 = computed(() => q('meta1', ''))
const meta2 = computed(() => q('meta2', ''))
const meta3 = computed(() => q('meta3', ''))
const rankingItems = computed(() => {
  const raw = q('ranking', '')
  if (!raw) return []
  return raw.split(/\r?\n|\\n/).map(line => {
    const parts = line.split('|').map(s => s.trim())
    return {
      ticker: parts[0] || '',
      value: parts[1] || '',
      extra: parts[2] || '',
    }
  }).filter(r => r.ticker)
})
</script>

<template>
  <div v-if="isEditorial" class="editorial-bg-fill"></div>
  <div class="stage" :class="{ 'stage-editorial': variant.startsWith('redentia-') }">
    <div class="card" :class="`card-${variant}`">
      <!-- ============================================================
           BACKDROP, each variant defines its own look via .card-XXX
           ============================================================ -->
      <div class="backdrop-1" />
      <div class="backdrop-2" />
      <div class="backdrop-grid" />
      <div class="backdrop-noise" />

      <!-- ============================================================
           HEADER (shared, some variants hide it via CSS)
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
                    Pelo preço atual (R$ 49,03) e DY de 16,3%, PETR4 está negociando 12% abaixo do preço-teto de Bazin. Mas o setor de petróleo tem volatilidade alta, recomendo limitar a 5% da carteira.
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
          <p class="iphone-sub">{{ subtitle || 'A IA da Redentia foi treinada no mercado brasileiro. Pergunta sobre qualquer ação, fundo, indicador ou estratégia, resposta em segundos, com dados reais e fontes citadas.' }}</p>
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
          <span class="jargon-author-name">, {{ author || 'Nathalia Arcuri' }}</span>
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
          <span class="jargon-author-name">, {{ author || 'Thiago Nigro' }}</span>
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
          <span class="jargon-author-name">, {{ author || 'Raul Sena' }}</span>
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
          <span class="jargon-author-name">, NORTE CAPITAL</span>
          <span class="jargon-author-role">ASSESSORIA · REDENTIA WHITELABEL</span>
        </div>
      </div>

      <div v-else-if="variant === 'jargon-redentia'" class="body jargon-body jargon-redentia">
        <div class="jargon-eyebrow">REDENTIA.MERCADO</div>
        <div class="jargon-quote">
          Investir com<br>
          <span class="italic-amber">inteligência.</span>
        </div>
        <div class="jargon-author">
          <span class="jargon-author-name">, REDENTIA.COM.BR</span>
          <span class="jargon-author-role">PLATAFORMA · 100% GRÁTIS</span>
        </div>
      </div>

      <!-- ============================================================
           VARIANT 20 · TENANT SHOWCASE, shows 1 tenant hero rendered
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
            <p class="tenant-sub">Eu sou a Nath. Esta é a Me Poupe!, o programa que explica seu dinheiro do jeito que sua melhor amiga explicaria.</p>
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
              <span>A, AÇÕES</span>
              <span>R, REAL ESTATE (FIIs)</span>
              <span>C, CAIXA</span>
              <span>A, ATIVOS ALTERNATIVOS</span>
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
            <div class="tenant-sign">, RAUL SENA, EDITOR-CHEFE</div>
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
            <div class="tenant-sign tenant-sign-italic">, Norte Capital, Mesa de Gestão</div>
          </div>
        </div>
        <div class="tenant-footer">ESTA É A CARA DA NORTE CAPITAL NA INFRA DA REDENTIA. redentia.com.br/whitelabel</div>
      </div>

      <div v-else-if="variant === 'tenant-showcase-redentia'" class="body tenant-body tenant-redentia">
        <div class="tenant-status-line">
          <span class="status-dot-live">●</span>
          MARKET.LIVE · B3 · SESSÃO ABERTA · REDENTIA v2.1
        </div>
        <div class="tenant-hero-grid">
          <div class="tenant-hero-text">
            <h2 class="tenant-title tenant-title-redentia">
              Investir com<br>
              <span class="tenant-highlight-amber">inteligência.</span>
            </h2>
            <p class="tenant-sub">Ecossistema completo para o mercado brasileiro. Dados em tempo real, fundamentos desde 2009, IA própria e consolidador de carteira.</p>
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
        <div class="data-eyebrow">COBERTURA</div>
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
           VARIANT · DATA TIMELINE, 15+ years of history
           ============================================================ -->
      <div v-else-if="variant === 'data-timeline'" class="body data-body">
        <div class="data-eyebrow">HISTÓRICO DESDE 2009</div>
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
        <div class="data-eyebrow">SEGURANÇA & PRIVACIDADE</div>
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
        <p class="data-foot">redentia.com.br, plataforma brasileira, dados brasileiros, privacidade BR.</p>
      </div>

      <!-- ============================================================
           VARIANT · AI CHAT MOCKUP
           ============================================================ -->
      <div v-else-if="variant === 'ai-chat'" class="body ai-body">
        <div class="ai-eyebrow">ASSESSORIA COM IA</div>
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
           VARIANT · STATS ROW, 4 big stats horizontally
           ============================================================ -->
      <div v-else-if="variant === 'stats-row'" class="body stats-body">
        <div class="stats-eyebrow">NÚMEROS QUE IMPORTAM</div>
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
           VARIANT · WHY NORMAL PERSON, consolidator before/after
           ============================================================ -->
      <div v-else-if="variant === 'why-consolidator'" class="body why-body">
        <div class="why-eyebrow">POR QUE REDENTIA</div>
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
        <p class="why-foot">redentia.com.br, consolidação via Open Finance · grátis · seguro</p>
      </div>

      <!-- ============================================================
           VARIANT · CALCULATORS SHOWCASE, 8 calcs grid
           ============================================================ -->
      <div v-else-if="variant === 'calculators'" class="body calc-body">
        <div class="calc-eyebrow">FERRAMENTAS</div>
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
        <div class="of-eyebrow">INTEGRAÇÃO BANCÁRIA</div>
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
        <div class="tenants-real-eyebrow">REDENTIA WHITELABEL · 5 MARCAS NO AR</div>
        <h2 class="tenants-real-title">
          Um backend.<br>
          <span class="data-amber">Cinco identidades.</span>
        </h2>
        <div class="tenants-real-grid">
          <div class="tenant-real-card" style="background: #0A0B0E; border-color: #F5A623">
            <div class="trc-eyebrow" style="color: #F5A623">TERMINAL</div>
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
            <div class="trc-eyebrow" style="color: #F5A623">SUA MARCA</div>
            <div class="trc-title" style="font-family: 'Instrument Serif'; color: #E8EAED">O próximo <i style="color:#F5A623">é você.</i></div>
            <div class="trc-brand" style="color: #F5A623">DEPLOY EM 1 SEMANA</div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           VARIANT · AI INTELLIGENT, features list
           ============================================================ -->
      <div v-else-if="variant === 'intelligent'" class="body int-body">
        <div class="int-eyebrow">INTELIGÊNCIA ARTIFICIAL</div>
        <h2 class="int-title">
          A primeira IA do Brasil<br>
          que <span class="data-amber">realmente sabe</span><br>
          de renda variável.
        </h2>
        <ul class="int-list">
          <li><span class="int-num">01</span> Treinada em português brasileiro · responde gírias de mercado</li>
          <li><span class="int-num">02</span> Cita fontes · ANBIMA, CVM, BACEN, IBGE, com link</li>
          <li><span class="int-num">03</span> Conhece regras brasileiras · JCP, day trade, isenção FIIs</li>
          <li><span class="int-num">04</span> Consulta sua carteira · responde com SEUS ativos, não genéricos</li>
        </ul>
      </div>

      <!-- ============================================================
           VARIANT · GLOBE REACH / BRAZIL FIRST
           ============================================================ -->
      <div v-else-if="variant === 'brazil-first'" class="body br-body">
        <div class="br-eyebrow">BRAZIL FIRST</div>
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
           CARROSSEL_01 · O QUE É REDENTIA
           Paleta invertida, amber dominante + preto de contraste.
           5 posts sequenciais (cover → wallet → analysis → features → cta).
           Quebra o feed escuro dos posts automáticos.
           ============================================================ -->
      <div v-else-if="variant === 'redentia-cover'" class="body amber-body amber-cover-min">
        <div class="amber-min-grid"></div>

        <div class="amber-min-top">
          <img src="/brand/logo-full.svg" alt="Redentia" class="amber-min-logo" />
          <div class="amber-min-pager">{{ pager || '01 — 05' }}</div>
        </div>

        <div class="amber-min-center">
          <div class="amber-min-eyebrow">{{ eyebrow || 'CONHEÇA' }}</div>
          <h1 class="amber-min-title">
            <template v-if="title">
              <template v-for="(line, i) in renderMultiline(title)" :key="i">
                <template v-if="splitHighlight(line).plain">{{ splitHighlight(line).plain }}</template><span v-if="splitHighlight(line).highlight" class="amber-min-italic">{{ splitHighlight(line).highlight }}</span>{{ splitHighlight(line).tail }}<br>
              </template>
            </template>
            <template v-else>
              O ecossistema de<br>
              investimentos<br>
              <span class="amber-min-italic">realmente</span> inteligente.
            </template>
          </h1>
          <p class="amber-min-sub">
            Cotações em tempo real, análise fundamentalista, assessora com IA e calculadora de aporte, numa só tela, do bolso à mesa.
          </p>
        </div>

        <div class="amber-min-pillars">
          <div class="amber-min-pillar">
            <div class="amber-min-pillar-num">01</div>
            <div class="amber-min-pillar-name">Carteira</div>
          </div>
          <div class="amber-min-pillar-sep"></div>
          <div class="amber-min-pillar">
            <div class="amber-min-pillar-num">02</div>
            <div class="amber-min-pillar-name">Análise</div>
          </div>
          <div class="amber-min-pillar-sep"></div>
          <div class="amber-min-pillar">
            <div class="amber-min-pillar-num">03</div>
            <div class="amber-min-pillar-name">Assessora IA</div>
          </div>
          <div class="amber-min-pillar-sep"></div>
          <div class="amber-min-pillar">
            <div class="amber-min-pillar-num">04</div>
            <div class="amber-min-pillar-name">Calculadoras</div>
          </div>
        </div>

        <div class="amber-min-foot">
          <div class="amber-min-url">
            <img src="/brand/logo-icon.svg" alt="" class="amber-min-foot-icon" />
            redentia.com.br
          </div>
          <div class="amber-min-arrow">arraste →</div>
        </div>
      </div>

      <div v-else-if="variant === 'redentia-wallet'" class="body amber-body amber-cover-min">
        <div class="amber-min-grid"></div>

        <div class="amber-min-top">
          <img src="/brand/logo-full.svg" alt="Redentia" class="amber-min-logo" />
          <div class="amber-min-pager">02 — 05</div>
        </div>

        <div class="amber-min-split">
          <div class="amber-min-split-text">
            <div class="amber-min-eyebrow">CARTEIRA</div>
            <h2 class="amber-min-title amber-min-title-md">
              Visão completa<br>
              da <span class="amber-min-italic">sua</span><br>
              carteira.
            </h2>
            <p class="amber-min-sub">
              Importe via Excel ou Open Finance. A Redentia consolida tudo em uma tela, rentabilidade, dividendos e exposição setorial, atualizados em tempo real.
            </p>
          </div>
          <div class="amber-min-iphone">
            <div class="iphone-frame">
              <div class="iphone-notch"></div>
              <div class="iphone-screen iphone-screen-iframe">
                <iframe src="/" class="amber-min-iphone-iframe" loading="eager" scrolling="no"></iframe>
              </div>
            </div>
          </div>
        </div>

        <div class="amber-min-pillars">
          <div class="amber-min-pillar">
            <div class="amber-min-pillar-num">01</div>
            <div class="amber-min-pillar-name">Open Finance</div>
          </div>
          <div class="amber-min-pillar-sep"></div>
          <div class="amber-min-pillar">
            <div class="amber-min-pillar-num">02</div>
            <div class="amber-min-pillar-name">Rentabilidade TWR</div>
          </div>
          <div class="amber-min-pillar-sep"></div>
          <div class="amber-min-pillar">
            <div class="amber-min-pillar-num">03</div>
            <div class="amber-min-pillar-name">Proventos</div>
          </div>
          <div class="amber-min-pillar-sep"></div>
          <div class="amber-min-pillar">
            <div class="amber-min-pillar-num">04</div>
            <div class="amber-min-pillar-name">Alertas</div>
          </div>
        </div>

        <div class="amber-min-foot">
          <div class="amber-min-url">
            <img src="/brand/logo-icon.svg" alt="" class="amber-min-foot-icon" />
            redentia.com.br
          </div>
          <div class="amber-min-arrow">arraste →</div>
        </div>
      </div>

      <div v-else-if="variant === 'redentia-analysis'" class="body amber-body amber-cover-min">
        <div class="amber-min-grid"></div>

        <div class="amber-min-top">
          <img src="/brand/logo-full.svg" alt="Redentia" class="amber-min-logo" />
          <div class="amber-min-pager">03 — 05</div>
        </div>

        <div class="amber-min-center amber-min-center-tight">
          <div class="amber-min-eyebrow">ANÁLISE</div>
          <h2 class="amber-min-title amber-min-title-md">
            Fundamentos e<br>
            preço-teto <span class="amber-min-italic">em 30s.</span>
          </h2>
          <p class="amber-min-sub">
            Os 3 métodos clássicos (Bazin, Graham, Gordon) calculados para todos os 1.316 tickers da B3, com comentários gerados por IA treinada em balanços brasileiros.
          </p>
        </div>

        <div class="amber-min-cards">
          <div class="amber-min-card">
            <div class="amber-min-card-ticker">PETR4</div>
            <div class="amber-min-card-name">Petrobras PN</div>
            <div class="amber-min-card-rows">
              <div><span>Preço</span><em>R$ 49,03</em></div>
              <div><span>DY 12m</span><em class="pos">16,3%</em></div>
              <div><span>P/L</span><em>6,1</em></div>
              <div><span>Teto Bazin</span><em class="pos">R$ 55,80</em></div>
            </div>
          </div>
          <div class="amber-min-card">
            <div class="amber-min-card-ticker">WEGE3</div>
            <div class="amber-min-card-name">WEG ON</div>
            <div class="amber-min-card-rows">
              <div><span>Preço</span><em>R$ 38,90</em></div>
              <div><span>ROE</span><em class="pos">28,4%</em></div>
              <div><span>P/L</span><em>31,2</em></div>
              <div><span>Teto Graham</span><em class="neg">R$ 32,10</em></div>
            </div>
          </div>
          <div class="amber-min-card">
            <div class="amber-min-card-ticker">MXRF11</div>
            <div class="amber-min-card-name">Maxi Renda FII</div>
            <div class="amber-min-card-rows">
              <div><span>Cota</span><em>R$ 10,32</em></div>
              <div><span>DY 12m</span><em class="pos">11,8%</em></div>
              <div><span>P/VP</span><em class="pos">0,98</em></div>
              <div><span>Rendimento</span><em>R$ 0,10</em></div>
            </div>
          </div>
        </div>

        <div class="amber-min-foot">
          <div class="amber-min-url">
            <img src="/brand/logo-icon.svg" alt="" class="amber-min-foot-icon" />
            redentia.com.br/asset
          </div>
          <div class="amber-min-arrow">arraste →</div>
        </div>
      </div>

      <div v-else-if="variant === 'redentia-features'" class="body amber-body amber-cover-min">
        <div class="amber-min-grid"></div>

        <div class="amber-min-top">
          <img src="/brand/logo-full.svg" alt="Redentia" class="amber-min-logo" />
          <div class="amber-min-pager">04 — 05</div>
        </div>

        <div class="amber-min-center amber-min-center-tight">
          <div class="amber-min-eyebrow">DASHBOARD</div>
          <h2 class="amber-min-title amber-min-title-md">
            Seu assessor,<br>
            na <span class="amber-min-italic">sua</span> tela.
          </h2>
          <p class="amber-min-sub">
            Previsão de dividendos, movimentos recentes, assessoria com IA e calculadora de aporte, num só dashboard. Redentia.com.br, direto do navegador.
          </p>
        </div>

        <div class="amber-min-laptop">
          <div class="laptop-frame">
            <div class="laptop-bar">
              <span class="laptop-dot laptop-dot-red"></span>
              <span class="laptop-dot laptop-dot-yellow"></span>
              <span class="laptop-dot laptop-dot-green"></span>
              <div class="laptop-url">redentia.com.br/asset/bbas3</div>
            </div>
            <div class="laptop-screen-iframe-wrap">
              <iframe src="/asset/BBAS3" class="amber-min-laptop-iframe" loading="eager" scrolling="no"></iframe>
            </div>
          </div>
        </div>

        <div class="amber-min-foot">
          <div class="amber-min-url">
            <img src="/brand/logo-icon.svg" alt="" class="amber-min-foot-icon" />
            redentia.com.br
          </div>
          <div class="amber-min-arrow">arraste →</div>
        </div>
      </div>

      <div v-else-if="variant === 'redentia-cta'" class="body amber-body amber-cover-min amber-cta-clean">
        <div class="amber-min-grid"></div>

        <div class="amber-min-top">
          <img src="/brand/logo-full.svg" alt="Redentia" class="amber-min-logo" />
          <div class="amber-min-pager">{{ pager || '05 — 05' }}</div>
        </div>

        <div class="amber-cta-c">
          <div class="amber-cta-c-label">FIM DO CARROSSEL · COMEÇO DO RESTO</div>

          <h2 class="amber-cta-c-hero">
            <template v-if="title">
              <template v-for="(line, i) in renderMultiline(title)" :key="i">
                <template v-if="splitHighlight(line).plain">{{ splitHighlight(line).plain }}</template><span v-if="splitHighlight(line).highlight" class="amber-min-italic">{{ splitHighlight(line).highlight }}</span>{{ splitHighlight(line).tail }}<br>
              </template>
            </template>
            <template v-else>
              Comece<br>
              <span class="amber-min-italic">de graça.</span>
            </template>
          </h2>

          <p class="amber-cta-c-sub">
            Sua carteira consolidada, análise de ativos em 30 segundos e uma assessora com IA treinada no mercado brasileiro. Tudo no navegador, sem instalar nada.
          </p>

          <a class="amber-cta-c-button">
            <div class="amber-cta-c-button-arrow">↗</div>
            <div class="amber-cta-c-button-text">
              <span class="amber-cta-c-button-label">acesse agora</span>
              <span class="amber-cta-c-button-url">{{ url }}</span>
            </div>
          </a>

        </div>
      </div>

      <!-- ============================================================
           CARROSSEL · GENÉRICAS · STAT / LIST / STEPS / COMPARE / QUOTE
           Todas no mesmo layout minimalista (logo + pager topo,
           eyebrow + title + conteúdo no centro, grid amber de fundo).
           ============================================================ -->
      <div v-else-if="variant === 'redentia-stat'" class="body amber-body amber-cover-min">
        <div class="amber-min-top">
          <img src="/brand/logo-full.svg" alt="Redentia" class="amber-min-logo" />
          <div class="amber-min-pager">{{ pager || '02 — 05' }}</div>
        </div>
        <div class="amber-min-center amber-min-center-tight">
          <div class="amber-min-eyebrow">{{ eyebrow || 'NÚMERO' }}</div>
          <div class="amber-min-stat-big">
            {{ statValue || '1.316' }}<span v-if="statUnit" class="amber-min-stat-unit">{{ statUnit }}</span>
          </div>
          <h2 class="amber-min-title amber-min-title-stat">
            <template v-if="title">
              <template v-for="(line, i) in renderMultiline(title)" :key="i">
                <template v-if="splitHighlight(line).plain">{{ splitHighlight(line).plain }}</template><span v-if="splitHighlight(line).highlight" class="amber-min-italic">{{ splitHighlight(line).highlight }}</span>{{ splitHighlight(line).tail }}<br>
              </template>
            </template>
            <template v-else>
              Tickers cobertos em <span class="amber-min-italic">tempo real.</span>
            </template>
          </h2>
          <p v-if="subtitle" class="amber-min-sub">{{ subtitle }}</p>
        </div>
      </div>

      <div v-else-if="variant === 'redentia-list'" class="body amber-body amber-cover-min">
        <div class="amber-min-top">
          <img src="/brand/logo-full.svg" alt="Redentia" class="amber-min-logo" />
          <div class="amber-min-pager">{{ pager || '03 — 05' }}</div>
        </div>
        <div class="amber-min-center amber-min-center-tight">
          <div class="amber-min-eyebrow">{{ eyebrow || 'ITENS' }}</div>
          <h2 class="amber-min-title">
            <template v-if="title">
              <template v-for="(line, i) in renderMultiline(title)" :key="i">
                <template v-if="splitHighlight(line).plain">{{ splitHighlight(line).plain }}</template><span v-if="splitHighlight(line).highlight" class="amber-min-italic">{{ splitHighlight(line).highlight }}</span>{{ splitHighlight(line).tail }}<br>
              </template>
            </template>
            <template v-else>
              Tudo num <span class="amber-min-italic">lugar só.</span>
            </template>
          </h2>
          <p v-if="subtitle" class="amber-min-sub">{{ subtitle }}</p>
        </div>
        <ul class="amber-min-items-list">
          <li v-for="(item, i) in listItems" :key="i">
            <span class="amber-min-items-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="amber-min-items-text">
              <template v-if="splitHighlight(item).plain">{{ splitHighlight(item).plain }}</template><span v-if="splitHighlight(item).highlight" class="amber-min-italic">{{ splitHighlight(item).highlight }}</span>{{ splitHighlight(item).tail }}
            </span>
          </li>
        </ul>
      </div>

      <div v-else-if="variant === 'redentia-steps'" class="body amber-body amber-cover-min">
        <div class="amber-min-top">
          <img src="/brand/logo-full.svg" alt="Redentia" class="amber-min-logo" />
          <div class="amber-min-pager">{{ pager || '03 — 05' }}</div>
        </div>
        <div class="amber-min-center amber-min-center-tight">
          <div class="amber-min-eyebrow">{{ eyebrow || 'PASSO A PASSO' }}</div>
          <h2 class="amber-min-title">
            <template v-if="title">
              <template v-for="(line, i) in renderMultiline(title)" :key="i">
                <template v-if="splitHighlight(line).plain">{{ splitHighlight(line).plain }}</template><span v-if="splitHighlight(line).highlight" class="amber-min-italic">{{ splitHighlight(line).highlight }}</span>{{ splitHighlight(line).tail }}<br>
              </template>
            </template>
            <template v-else>
              Em <span class="amber-min-italic">3 passos.</span>
            </template>
          </h2>
        </div>
        <div class="amber-min-steps-list">
          <div class="amber-min-step" v-for="(step, i) in stepsItems" :key="i">
            <div class="amber-min-step-num">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="amber-min-step-body">{{ step }}</div>
          </div>
        </div>
      </div>

      <div v-else-if="variant === 'redentia-compare'" class="body amber-body amber-cover-min">
        <div class="amber-min-top">
          <img src="/brand/logo-full.svg" alt="Redentia" class="amber-min-logo" />
          <div class="amber-min-pager">{{ pager || '04 — 05' }}</div>
        </div>
        <div class="amber-min-center amber-min-center-tight">
          <div class="amber-min-eyebrow">{{ eyebrow || 'ANTES / DEPOIS' }}</div>
          <h2 class="amber-min-title">
            <template v-if="title">
              <template v-for="(line, i) in renderMultiline(title)" :key="i">
                <template v-if="splitHighlight(line).plain">{{ splitHighlight(line).plain }}</template><span v-if="splitHighlight(line).highlight" class="amber-min-italic">{{ splitHighlight(line).highlight }}</span>{{ splitHighlight(line).tail }}<br>
              </template>
            </template>
            <template v-else>
              Antes e depois de <span class="amber-min-italic">Redentia.</span>
            </template>
          </h2>
        </div>
        <div class="amber-min-compare-grid">
          <div class="amber-min-compare-col amber-min-compare-before">
            <div class="amber-min-compare-label">{{ beforeTitle }}</div>
            <ul>
              <li v-for="(item, i) in beforeItems" :key="i">{{ item }}</li>
            </ul>
          </div>
          <div class="amber-min-compare-col amber-min-compare-after">
            <div class="amber-min-compare-label amber-min-compare-label-after">{{ afterTitle }}</div>
            <ul>
              <li v-for="(item, i) in afterItems" :key="i">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div v-else-if="variant === 'redentia-quote'" class="body amber-body amber-cover-min">
        <div class="amber-min-top">
          <img src="/brand/logo-full.svg" alt="Redentia" class="amber-min-logo" />
          <div class="amber-min-pager">{{ pager || '02 — 05' }}</div>
        </div>
        <div class="amber-min-center amber-min-center-quote">
          <div class="amber-min-eyebrow">{{ eyebrow || 'CITAÇÃO' }}</div>
          <div class="amber-min-quote-mark">"</div>
          <h2 class="amber-min-title amber-min-title-quote">
            <template v-if="title">
              <template v-for="(line, i) in renderMultiline(title)" :key="i">
                <template v-if="splitHighlight(line).plain">{{ splitHighlight(line).plain }}</template><span v-if="splitHighlight(line).highlight" class="amber-min-italic">{{ splitHighlight(line).highlight }}</span>{{ splitHighlight(line).tail }}<br>
              </template>
            </template>
            <template v-else>
              Investir é liberdade<br>
              <span class="amber-min-italic">disfarçada de paciência.</span>
            </template>
          </h2>
          <p v-if="subtitle" class="amber-min-quote-author">{{ subtitle }}</p>
        </div>
      </div>

      <!-- ============================================================
           UNIT POSTS · PUSH NOTIFICATION
           iPhone lock screen com notificação Redentia
           ============================================================ -->
      <div v-else-if="variant === 'redentia-push'" class="body amber-body amber-cover-min">
        <div class="amber-min-top">
          <img src="/brand/logo-full.svg" alt="Redentia" class="amber-min-logo" />
          <div class="amber-min-pager">{{ pager || 'NOTIFICAÇÃO' }}</div>
        </div>
        <div class="amber-push-wrap">
          <div class="amber-push-eyebrow">{{ eyebrow || 'CHEGOU UM ALERTA' }}</div>
          <div class="amber-push-lockscreen">
            <div class="amber-push-time">{{ q('lock_time', '9:41') }}</div>
            <div class="amber-push-date">{{ q('lock_date', 'Quinta-feira, 28 de Abril') }}</div>
            <div class="amber-push-card">
              <div class="amber-push-card-head">
                <div class="amber-push-card-icon">
                  <img src="/brand/logo-icon.svg" alt="" />
                </div>
                <div class="amber-push-card-meta">
                  <span class="amber-push-card-app">REDENTIA</span>
                  <span class="amber-push-card-when">agora</span>
                </div>
              </div>
              <div class="amber-push-card-title">{{ pushTitle || 'BBAS3 anunciou JCP' }}</div>
              <div class="amber-push-card-body">{{ pushBody || 'R$ 0,42 por ação. Você vai receber R$ 210,00 em 28/abr.' }}</div>
            </div>
          </div>
          <p v-if="subtitle" class="amber-push-caption">{{ subtitle }}</p>
        </div>
      </div>

      <!-- ============================================================
           UNIT POSTS · MOVIMENTO (variação notável de ativo)
           ============================================================ -->
      <div v-else-if="variant === 'redentia-movimento'" class="body amber-body amber-cover-min">
        <div class="amber-min-top">
          <img src="/brand/logo-full.svg" alt="Redentia" class="amber-min-logo" />
          <div class="amber-min-pager">{{ pager || (direction === 'up' ? 'ALTA NOTÁVEL' : 'BAIXA NOTÁVEL') }}</div>
        </div>
        <div class="amber-min-center amber-min-center-tight">
          <div class="amber-min-eyebrow">{{ eyebrow || 'MOVIMENTO DO DIA' }}</div>
          <div class="amber-mov-wrap">
            <div class="amber-mov-ticker">{{ ticker }}</div>
            <div class="amber-mov-name">{{ tickerName }} <span v-if="tickerSector">· {{ tickerSector }}</span></div>
          </div>
          <div class="amber-mov-price-row">
            <div class="amber-mov-price">{{ price }}</div>
            <div class="amber-mov-change" :class="direction === 'up' ? 'pos' : 'neg'">
              <span class="amber-mov-arrow">{{ direction === 'up' ? '↑' : '↓' }}</span>
              {{ change }}
            </div>
          </div>
          <p v-if="subtitle" class="amber-min-sub">{{ subtitle }}</p>
          <div v-if="meta1 || meta2 || meta3" class="amber-mov-meta">
            <span v-if="meta1">{{ meta1 }}</span>
            <span v-if="meta2">{{ meta2 }}</span>
            <span v-if="meta3">{{ meta3 }}</span>
          </div>
        </div>
      </div>

      <!-- ============================================================
           UNIT POSTS · RANKING top 5
           ============================================================ -->
      <div v-else-if="variant === 'redentia-ranking'" class="body amber-body amber-cover-min">
        <div class="amber-min-top">
          <img src="/brand/logo-full.svg" alt="Redentia" class="amber-min-logo" />
          <div class="amber-min-pager">{{ pager || 'RANKING' }}</div>
        </div>
        <div class="amber-min-center amber-min-center-tight">
          <div class="amber-min-eyebrow">{{ eyebrow || 'TOP 5 DA SEMANA' }}</div>
          <h2 class="amber-min-title">
            <template v-if="title">
              <template v-for="(line, i) in renderMultiline(title)" :key="i">
                <template v-if="splitHighlight(line).plain">{{ splitHighlight(line).plain }}</template><span v-if="splitHighlight(line).highlight" class="amber-min-italic">{{ splitHighlight(line).highlight }}</span>{{ splitHighlight(line).tail }}<br>
              </template>
            </template>
            <template v-else>
              Top 5\n
              <span class="amber-min-italic">dividend yield.</span>
            </template>
          </h2>
          <p v-if="subtitle" class="amber-min-sub">{{ subtitle }}</p>
        </div>
        <div class="amber-ranking-list">
          <div class="amber-ranking-item" v-for="(item, i) in rankingItems" :key="i">
            <div class="amber-ranking-pos">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="amber-ranking-ticker">{{ item.ticker }}</div>
            <div class="amber-ranking-value">{{ item.value }}</div>
            <div class="amber-ranking-extra">{{ item.extra }}</div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           UNIT POST · FEATURE LAUNCH (calculadora, novo módulo, etc)
           Big mockup + badge NOVIDADE + hero + CTA
           ============================================================ -->
      <div v-else-if="variant === 'redentia-launch'" class="body amber-body amber-cover-min">
        <div class="amber-min-top">
          <img src="/brand/logo-full.svg" alt="Redentia" class="amber-min-logo" />
          <div class="amber-launch-badge">
            <span class="amber-launch-badge-dot"></span>
            {{ pager || 'NOVIDADE' }}
          </div>
        </div>

        <div class="amber-launch-head">
          <div class="amber-min-eyebrow">{{ eyebrow || 'LANÇAMENTO' }}</div>
          <h1 class="amber-launch-title">
            <template v-if="title">
              <template v-for="(line, i) in renderMultiline(title)" :key="i">
                <template v-if="splitHighlight(line).plain">{{ splitHighlight(line).plain }}</template><span v-if="splitHighlight(line).highlight" class="amber-min-italic">{{ splitHighlight(line).highlight }}</span>{{ splitHighlight(line).tail }}<br>
              </template>
            </template>
          </h1>
          <p v-if="subtitle" class="amber-launch-sub">{{ subtitle }}</p>
        </div>

        <div class="amber-launch-laptop">
          <div class="laptop-frame">
            <div class="laptop-bar">
              <span class="laptop-dot laptop-dot-red"></span>
              <span class="laptop-dot laptop-dot-yellow"></span>
              <span class="laptop-dot laptop-dot-green"></span>
              <div class="laptop-url">{{ q('iframe_url_label', 'redentia.com.br') }}</div>
            </div>
            <div class="laptop-screen-iframe-wrap">
              <iframe :src="q('iframe_src', '/')" class="amber-min-laptop-iframe" loading="eager" scrolling="no"></iframe>
            </div>
          </div>
        </div>

        <div v-if="marks.length > 0" class="amber-launch-chips">
          <span v-for="(m, i) in marks" :key="i" class="amber-launch-chip">{{ m }}</span>
        </div>

        <div class="amber-launch-cta">
          <img src="/brand/logo-icon.svg" alt="" class="amber-launch-cta-icon" />
          <span class="amber-launch-cta-url">{{ url }}</span>
        </div>
      </div>

      <!-- ============================================================
           UNIT POST · EMBED GRID (6 widgets em mosaico)
           ============================================================ -->
      <div v-else-if="variant === 'redentia-embed-grid'" class="body amber-body amber-cover-min">
        <div class="amber-min-top">
          <img src="/brand/logo-full.svg" alt="Redentia" class="amber-min-logo" />
          <div class="amber-min-pager">{{ pager || '02 — 05' }}</div>
        </div>
        <div class="amber-min-center amber-min-center-tight">
          <div class="amber-min-eyebrow">{{ eyebrow || 'EMBED STUDIO' }}</div>
          <h2 class="amber-min-title amber-min-title-md">
            <template v-if="title">
              <template v-for="(line, i) in renderMultiline(title)" :key="i">
                <template v-if="splitHighlight(line).plain">{{ splitHighlight(line).plain }}</template><span v-if="splitHighlight(line).highlight" class="amber-min-italic">{{ splitHighlight(line).highlight }}</span>{{ splitHighlight(line).tail }}<br>
              </template>
            </template>
            <template v-else>
              6 widgets\n
              <span class="amber-min-italic">prontos</span> pra colar.
            </template>
          </h2>
          <p v-if="subtitle" class="amber-min-sub">{{ subtitle }}</p>
        </div>
        <div class="amber-embed-grid">
          <div class="amber-embed-tile amber-embed-tile-tall">
            <iframe src="/embed/ticker/big?ticker=PETR4&widget=1" class="amber-embed-iframe" scrolling="no" loading="eager"></iframe>
            <div class="amber-embed-tile-label">TICKER BIG</div>
          </div>
          <div class="amber-embed-tile">
            <iframe src="/embed/ticker/small?ticker=VALE3&widget=1" class="amber-embed-iframe" scrolling="no" loading="eager"></iframe>
            <div class="amber-embed-tile-label">TICKER SMALL</div>
          </div>
          <div class="amber-embed-tile amber-embed-tile-wide">
            <iframe src="/embed/grafico?ticker=PETR4&widget=1" class="amber-embed-iframe amber-embed-iframe-chart" scrolling="no" loading="eager"></iframe>
            <div class="amber-embed-tile-label">GRÁFICO</div>
          </div>
          <div class="amber-embed-tile">
            <iframe src="/embed/ranking/altas?widget=1" class="amber-embed-iframe" scrolling="no" loading="eager"></iframe>
            <div class="amber-embed-tile-label">RANKING</div>
          </div>
          <div class="amber-embed-tile">
            <iframe src="/embed/mapa-calor?widget=1" class="amber-embed-iframe" scrolling="no" loading="eager"></iframe>
            <div class="amber-embed-tile-label">MAPA CALOR</div>
          </div>
          <div class="amber-embed-tile">
            <iframe src="/embed/calculadora/juros-compostos?widget=1" class="amber-embed-iframe" scrolling="no" loading="eager"></iframe>
            <div class="amber-embed-tile-label">CALCULADORA</div>
          </div>
        </div>
      </div>

      <!-- ============================================================
           UNIT POST · EMBED SHOWCASE (1 widget grande + code snippet)
           ============================================================ -->
      <div v-else-if="variant === 'redentia-embed-showcase'" class="body amber-body amber-cover-min">
        <div class="amber-min-top">
          <img src="/brand/logo-full.svg" alt="Redentia" class="amber-min-logo" />
          <div class="amber-min-pager">{{ pager || '03 — 05' }}</div>
        </div>
        <div class="amber-min-center amber-min-center-tight">
          <div class="amber-min-eyebrow">{{ eyebrow || 'WIDGET' }}</div>
          <h2 class="amber-min-title amber-min-title-md">
            <template v-if="title">
              <template v-for="(line, i) in renderMultiline(title)" :key="i">
                <template v-if="splitHighlight(line).plain">{{ splitHighlight(line).plain }}</template><span v-if="splitHighlight(line).highlight" class="amber-min-italic">{{ splitHighlight(line).highlight }}</span>{{ splitHighlight(line).tail }}<br>
              </template>
            </template>
          </h2>
          <p v-if="subtitle" class="amber-min-sub">{{ subtitle }}</p>
        </div>
        <div class="amber-embed-preview">
          <iframe :src="q('iframe_src', '/embed/ticker/big?ticker=PETR4&widget=1')" class="amber-embed-preview-iframe" scrolling="no" loading="eager"></iframe>
        </div>
        <div class="amber-embed-code">
          <div class="amber-embed-code-head">
            <span class="amber-embed-code-dots">
              <span></span><span></span><span></span>
            </span>
            <span class="amber-embed-code-label">HTML · cole no seu site</span>
            <span class="amber-embed-code-copy">↳ COPIAR</span>
          </div>
          <div class="amber-embed-code-body">
            <span class="amber-embed-code-tag">&lt;iframe</span>
            <span class="amber-embed-code-attr"> src=</span>
            <span class="amber-embed-code-str">"{{ q('iframe_url', 'embed.redentia.com.br/ticker/big') }}"</span>
            <span class="amber-embed-code-attr"> width=</span>
            <span class="amber-embed-code-str">"420"</span>
            <span class="amber-embed-code-attr"> height=</span>
            <span class="amber-embed-code-str">"220"</span>
            <span class="amber-embed-code-tag">&gt;&lt;/iframe&gt;</span>
          </div>
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
           Footer (shared, some variants hide it)
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

/* Body wrapper, every variant has its own layout inside */
.body {
  position: relative;
  flex: 1;
  display: flex;
  min-height: 0;
  z-index: 2;
  padding: 36px 0;
}

/* ============================================================
   IPHONE PUSH VARIANTS, 2-column: phone mockup + caption
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
   JARGON VARIANTS, huge type, per-tenant voice
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

/* Me Poupe jargon, purple + yellow highlight + Poppins 900 */
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

/* Primo Rico jargon, deep dark + orange italic + Fraunces 700 */
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

/* Sardinha jargon, ivory paper + red-pen IBM Plex Serif */
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

/* Norte jargon, ivory editorial + Fraunces italic + gold */
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

/* Redentia jargon, amber terminal */
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
   TENANT SHOWCASE VARIANTS, shows a tenant's hero inside the card
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
   DATA COVERAGE, big number + ticker wall
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

/* ============================================================
   CARROSSEL REDENTIA · AMBER-DOMINANT PALETTE
   Inverts the default dark scheme: amber bg, black accents.
   Differentiates editorial carousels from automated dark posts.
   ============================================================ */
/* Override stage padding so the 1080x1080 screenshot captures
   the full amber card edge-to-edge. Uses an explicit class rather
   than :has() for broader headless-browser support. */
.stage-editorial {
  padding: 0 !important;
  background: #F5A623 !important;
  min-height: 1080px !important;
  height: 1080px !important;
  align-items: stretch !important;
}
.stage-editorial > .card {
  width: 1080px !important;
  height: 1080px !important;
  aspect-ratio: auto !important;
}
.card-redentia-cover,
.card-redentia-wallet,
.card-redentia-analysis,
.card-redentia-features,
.card-redentia-cta {
  background-color: #F5A623;
  background-image:
    linear-gradient(rgba(10, 11, 14, 0.11) 1px, transparent 1px),
    linear-gradient(90deg, rgba(10, 11, 14, 0.11) 1px, transparent 1px);
  background-size: 54px 54px;
  background-position: -1px -1px;
  color: #0A0B0E;
  border: none;
  border-radius: 0;
  /* Padding moved into .amber-cover-min so the body can use the
     full 1080 height instead of 952 (1080 − 128px vertical pad),
     which prevents the footer from being clipped. */
  padding: 0 !important;
}
.card-redentia-cover .backdrop-1,
.card-redentia-cover .backdrop-2,
.card-redentia-cover .backdrop-grid,
.card-redentia-cover .backdrop-noise,
.card-redentia-wallet .backdrop-1,
.card-redentia-wallet .backdrop-2,
.card-redentia-wallet .backdrop-grid,
.card-redentia-wallet .backdrop-noise,
.card-redentia-analysis .backdrop-1,
.card-redentia-analysis .backdrop-2,
.card-redentia-analysis .backdrop-grid,
.card-redentia-analysis .backdrop-noise,
.card-redentia-features .backdrop-1,
.card-redentia-features .backdrop-2,
.card-redentia-features .backdrop-grid,
.card-redentia-features .backdrop-noise,
.card-redentia-cta .backdrop-1,
.card-redentia-cta .backdrop-2,
.card-redentia-cta .backdrop-grid,
.card-redentia-cta .backdrop-noise {
  display: none;
}

/* Hide shared header/footer on these editorial variants
   (carousel paging is handled inline) */
.card-redentia-cover .header,
.card-redentia-cover .footer,
.card-redentia-wallet .header,
.card-redentia-wallet .footer,
.card-redentia-analysis .header,
.card-redentia-analysis .footer,
.card-redentia-features .header,
.card-redentia-features .footer,
.card-redentia-cta .header,
.card-redentia-cta .footer {
  display: none;
}
.card-redentia-push,
.card-redentia-movimento,
.card-redentia-ranking,
.card-redentia-launch,
.card-redentia-embed-grid,
.card-redentia-embed-showcase {
  padding: 0 !important;
  overflow: hidden !important;
  position: relative;
}
.card-redentia-embed-grid,
.card-redentia-embed-showcase {
  background-color: #F5A623;
  background-image:
    linear-gradient(rgba(10, 11, 14, 0.11) 1px, transparent 1px),
    linear-gradient(90deg, rgba(10, 11, 14, 0.11) 1px, transparent 1px);
  background-size: 54px 54px;
  background-position: -1px -1px;
}
.card-redentia-embed-grid .header,
.card-redentia-embed-grid .footer,
.card-redentia-embed-showcase .header,
.card-redentia-embed-showcase .footer {
  display: none;
}
.card-redentia-push .header,
.card-redentia-push .footer,
.card-redentia-movimento .header,
.card-redentia-movimento .footer,
.card-redentia-ranking .header,
.card-redentia-ranking .footer,
.card-redentia-launch .header,
.card-redentia-launch .footer {
  display: none;
}
.card-redentia-launch {
  background-color: #F5A623;
  background-image:
    linear-gradient(rgba(10, 11, 14, 0.11) 1px, transparent 1px),
    linear-gradient(90deg, rgba(10, 11, 14, 0.11) 1px, transparent 1px);
  background-size: 54px 54px;
  background-position: -1px -1px;
}

.amber-body {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}
/* Editorial minimal variants need visible overflow so the
   absolutely positioned footer (anchored to the card) isn't
   clipped by the 952px-tall body. */
.amber-body.amber-cover-min {
  overflow: visible !important;
}

.amber-grid-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.14;
  background-image:
    linear-gradient(#0A0B0E 1px, transparent 1px),
    linear-gradient(90deg, #0A0B0E 1px, transparent 1px);
  background-size: 72px 72px;
}

.amber-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background:
    radial-gradient(ellipse 900px 600px at 82% 12%, rgba(255, 224, 130, 0.85) 0%, rgba(245, 166, 35, 0) 60%),
    radial-gradient(ellipse 700px 500px at 8% 105%, rgba(180, 110, 10, 0.18) 0%, transparent 55%);
}

.amber-grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(ellipse at 85% 8%, rgba(255, 224, 130, 0.55) 0%, transparent 45%),
    radial-gradient(ellipse at 12% 110%, rgba(10, 11, 14, 0.18) 0%, transparent 55%);
  z-index: 1;
}

.amber-pager {
  position: absolute;
  top: 16px;
  right: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.25em;
  color: #0A0B0E;
  font-weight: 700;
  z-index: 3;
  padding: 8px 14px;
  border: 2px solid #0A0B0E;
  border-radius: 999px;
  background: #F5A623;
}

.amber-pager-inline {
  position: static;
  padding: 6px 12px;
  font-size: 12px;
}

.amber-swipe {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.3em;
  color: #0A0B0E;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}
.amber-swipe span {
  font-size: 22px;
  animation: amber-swipe-bounce 1.6s ease-in-out infinite;
}
@keyframes amber-swipe-bounce {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(6px); }
}

/* ----- Shared editorial elements ----- */
.amber-topbar {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(10, 11, 14, 0.25);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.14em;
  color: #0A0B0E;
  text-transform: uppercase;
  font-weight: 600;
  flex-shrink: 0;
}
.amber-live {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  letter-spacing: 0.18em;
}
.amber-live-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #0A0B0E;
  box-shadow: 0 0 0 0 rgba(10, 11, 14, 0.5);
  animation: amber-live-pulse 1.8s ease-in-out infinite;
}
@keyframes amber-live-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(10, 11, 14, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(10, 11, 14, 0); }
}
.amber-topbar-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0.75;
}
.amber-topbar-meta em {
  font-style: normal;
  font-weight: 700;
}
.amber-topbar-meta em.pos { color: #0a7a3f; }
.amber-topbar-meta em.neg { color: #a0211c; }
.amber-topbar-meta .sep { opacity: 0.35; }

.amber-ticker-tape {
  position: relative;
  z-index: 3;
  background: #0A0B0E;
  color: #F5A623;
  overflow: hidden;
  margin: 12px -72px 4px -72px;
  border-top: 1px solid rgba(245, 166, 35, 0.18);
  border-bottom: 1px solid rgba(245, 166, 35, 0.18);
  height: 42px;
  min-height: 42px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
.amber-ticker-track {
  display: flex;
  gap: 36px;
  padding: 0 28px;
  white-space: nowrap;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  /* Static for screenshots — no animation so every PNG is consistent */
  transform: translateX(0);
}
.amber-ticker-track span {
  display: flex;
  gap: 8px;
  align-items: center;
}
.amber-ticker-track strong {
  color: #FFE082;
  font-weight: 800;
}
.amber-ticker-track em {
  font-style: normal;
}
.amber-ticker-track em.pos { color: #00D395; }
.amber-ticker-track em.neg { color: #FF4747; }
@keyframes amber-ticker-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.amber-eyebrow-issue {
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.24em;
  color: #0A0B0E;
  font-weight: 700;
  padding: 10px 0;
  border-bottom: 1px solid rgba(10, 11, 14, 0.2);
}
.amber-eyebrow-slash {
  opacity: 0.4;
  font-weight: 400;
}

.terminal-cursor {
  display: inline-block;
  width: 0.5em;
  height: 0.85em;
  background: currentColor;
  margin-left: 0.12em;
  vertical-align: baseline;
  animation: terminal-blink 1.1s step-end infinite;
}
@keyframes terminal-blink {
  50% { opacity: 0; }
}

/* Mini stats row · POST 2 side */
.amber-mini-stats {
  display: flex;
  gap: 14px;
  margin-top: 4px;
}
.mini-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  background: rgba(10, 11, 14, 0.08);
  border: 1px dashed rgba(10, 11, 14, 0.3);
  border-radius: 10px;
  flex: 1;
}
.mini-stat-num {
  font-family: 'Instrument Serif', serif;
  font-size: 32px;
  color: #0A0B0E;
  line-height: 1;
  letter-spacing: -0.02em;
}
.mini-stat-num.pos { color: #0a7a3f; }
.mini-stat-num.neg { color: #a0211c; }
.mini-stat-lab {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #0A0B0E;
  opacity: 0.65;
  font-weight: 700;
  text-transform: uppercase;
}

/* Sparklines inside cards · POST 3 */
.amber-card-spark {
  width: 100%;
  height: 22px;
  margin: 4px 0;
}

/* IA footer note · POST 3 */
.amber-analysis-foot {
  position: relative;
  z-index: 3;
  margin-top: 14px;
}
.amber-ai-note {
  background: rgba(10, 11, 14, 0.9);
  color: #F5A623;
  padding: 14px 18px;
  border-radius: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  border: 1px solid rgba(245, 166, 35, 0.22);
  display: flex;
  gap: 10px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.amber-ai-caret {
  color: #00D395;
  font-weight: 700;
}
.amber-ai-note em {
  font-style: normal;
  font-weight: 700;
  color: #FFE082;
  padding-right: 8px;
  border-right: 1px solid rgba(245, 166, 35, 0.25);
}

/* Laptop card enhancements · POST 4 */
.laptop-card-head-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.laptop-card-delta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  padding: 3px 6px;
  border-radius: 4px;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.laptop-card-delta.pos {
  color: #00D395;
  background: rgba(0, 211, 149, 0.12);
  border: 1px solid rgba(0, 211, 149, 0.25);
}
.laptop-card-legend {
  display: flex;
  justify-content: space-between;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.1em;
  color: rgba(232, 234, 237, 0.5);
  font-weight: 600;
  text-transform: uppercase;
  margin-top: 4px;
}
.laptop-card-ai {
  background: linear-gradient(135deg, rgba(245, 166, 35, 0.1) 0%, rgba(20, 22, 28, 1) 60%);
  border-color: rgba(245, 166, 35, 0.3);
}

/* CTA terminal · POST 5 */
.amber-cta-terminal {
  background: #0A0B0E;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 20px 48px rgba(10, 11, 14, 0.45);
  border: 1px solid rgba(245, 166, 35, 0.2);
  width: 100%;
  max-width: 760px;
}
.amber-cta-terminal-bar {
  background: #14161C;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgba(245, 166, 35, 0.15);
}
.amber-cta-terminal-title {
  margin-left: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: rgba(245, 166, 35, 0.65);
  letter-spacing: 0.12em;
  font-weight: 600;
}
.amber-cta-terminal-body {
  padding: 24px 28px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.amber-cta-terminal-line {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: rgba(245, 166, 35, 0.6);
  font-weight: 600;
}
.amber-cta-terminal-line .caret {
  color: #00D395;
  margin-right: 8px;
  font-weight: 700;
}
.amber-cta-terminal-url {
  font-family: 'JetBrains Mono', monospace;
  font-size: 44px;
  color: #F5A623;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
  display: flex;
  align-items: center;
  margin-top: 2px;
}
.amber-cta-terminal-url .terminal-cursor {
  background: #F5A623;
  width: 0.38em;
  height: 0.78em;
  margin-left: 0.15em;
  margin-bottom: 0.08em;
}
.amber-cta-terminal-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: rgba(245, 166, 35, 0.55);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 6px;
}

.amber-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.28em;
  color: #0A0B0E;
  font-weight: 700;
  text-transform: uppercase;
}
.amber-eyebrow-inv {
  color: #F5A623;
  background: #0A0B0E;
  display: inline-block;
  padding: 8px 14px;
  border-radius: 4px;
}

.amber-underline {
  display: inline;
  background-image: linear-gradient(180deg, transparent 0%, transparent 82%, #0A0B0E 82%, #0A0B0E 96%, transparent 96%);
  padding: 0 4px 4px 4px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

/* ----- POST 1 · COVER (editorial terminal) ----- */
.amber-cover {
  justify-content: flex-start;
  gap: 0;
  padding: 0;
}
.amber-cover-hero {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 28px;
}
.amber-cover-title {
  font-family: 'Instrument Serif', serif;
  font-size: 200px;
  line-height: 0.88;
  margin: 0;
  color: #0A0B0E;
  letter-spacing: -0.035em;
  font-weight: 400;
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 0px;
  row-gap: 8px;
}
.cover-word-1 {
  display: inline-block;
}
.amber-dot {
  color: #0A0B0E;
  display: inline-block;
  transform: translateY(-4px);
}
.amber-accent {
  background: #0A0B0E;
  color: #F5A623;
  padding: 6px 22px 18px 22px;
  display: inline-block;
  border-radius: 8px;
  line-height: 0.82;
  font-style: italic;
  font-size: 180px;
  margin-left: 8px;
}
.amber-accent-terminal {
  display: inline-flex;
  align-items: flex-end;
  background: #0A0B0E;
  color: #F5A623;
  padding: 2px 24px 14px 24px;
  margin-left: 0;
  font-family: 'JetBrains Mono', monospace;
  font-style: italic;
  font-weight: 700;
  font-size: 150px;
  line-height: 0.9;
  letter-spacing: -0.03em;
  border-radius: 6px;
  box-shadow: 0 18px 40px rgba(10, 11, 14, 0.35), inset 0 0 0 1px rgba(245, 166, 35, 0.15);
}
.amber-accent-terminal .terminal-cursor {
  width: 0.38em;
  height: 0.72em;
  margin-left: 0.14em;
  margin-bottom: 0.06em;
  background: #F5A623;
}
.amber-cover-sub {
  font-family: 'Instrument Serif', serif;
  font-size: 48px;
  line-height: 1.1;
  color: #0A0B0E;
  margin: 0;
  font-weight: 400;
  max-width: 780px;
}
.amber-cover-sub-italic {
  font-style: italic;
}

.amber-cover-cards {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: auto;
}
.amber-data-card {
  background: rgba(10, 11, 14, 0.96);
  color: #F5A623;
  padding: 18px 18px 16px 18px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 150px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 14px 32px rgba(10, 11, 14, 0.3);
  border: 1px solid rgba(245, 166, 35, 0.18);
}
.amber-data-card-hl {
  background: #FFE082;
  color: #0A0B0E;
  border-color: rgba(10, 11, 14, 0.25);
}
.amber-data-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.24em;
  color: currentColor;
  opacity: 0.8;
  font-weight: 700;
  text-transform: uppercase;
}
.amber-data-value {
  font-family: 'Instrument Serif', serif;
  font-size: 60px;
  line-height: 0.95;
  color: currentColor;
  font-weight: 400;
  letter-spacing: -0.02em;
}
.amber-data-unit {
  font-size: 22px;
  font-style: italic;
  opacity: 0.7;
  margin-left: 4px;
}
.amber-data-sub {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: currentColor;
  opacity: 0.7;
  font-weight: 500;
}
.amber-data-sparkline {
  width: 100%;
  height: 22px;
  margin-top: auto;
}
.amber-data-chips-mini {
  display: flex;
  gap: 6px;
  margin-top: auto;
}
.amber-data-chips-mini span {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  padding: 3px 6px;
  border: 1px solid rgba(245, 166, 35, 0.4);
  border-radius: 3px;
  letter-spacing: 0.12em;
  font-weight: 700;
  color: #F5A623;
}
.amber-data-chat {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  margin-top: auto;
  padding-top: 6px;
  border-top: 1px dashed rgba(10, 11, 14, 0.3);
  font-weight: 600;
}
.amber-data-chat-caret {
  color: inherit;
  font-weight: 700;
  margin-right: 4px;
}

.amber-cover-foot {
  position: relative;
  z-index: 3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(10, 11, 14, 0.2);
  font-family: 'JetBrains Mono', monospace;
}
.amber-cover-url {
  font-size: 14px;
  color: #0A0B0E;
  font-weight: 700;
  letter-spacing: 0.12em;
  display: flex;
  align-items: center;
  gap: 8px;
}
.amber-cover-url-caret {
  color: #0A0B0E;
  opacity: 0.55;
}

/* ----- POST 1 · MINIMALIST COVER ----- */
.amber-cover-min {
  /* Use the full card 1080 height; paddings are here (not on the
     card) so the footer sits inside the visible area. */
  padding: 64px 72px !important;
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  height: 100%;
  gap: 0;
  position: relative;
  overflow: visible !important;
  box-sizing: border-box;
}
/* Paints the grid onto the card itself via absolutely positioned
   pseudo-sibling, so it covers the full 1080x1080 card (past the
   card's 64/72px padding). */
/* Grid is now painted as a background on .card-redentia-* directly,
   so this element is just a no-op placeholder (kept for the DOM
   structure so the existing markup doesn't need to change). */
.amber-min-grid {
  display: none;
}
.card-redentia-cover,
.card-redentia-wallet,
.card-redentia-analysis,
.card-redentia-features,
.card-redentia-cta {
  overflow: hidden !important;
}
.amber-min-top {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2px;
  flex-shrink: 0;
}
.amber-min-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.18em;
  color: #0A0B0E;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.85;
}
.amber-min-meta em {
  font-style: normal;
  font-weight: 700;
}
.amber-min-meta em.pos { color: #0a7a3f; }
.amber-min-meta em.neg { color: #a0211c; }
.amber-min-meta-sep {
  opacity: 0.35;
  font-weight: 400;
}
.amber-min-live {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-weight: 700;
}
.amber-min-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #0A0B0E;
  box-shadow: 0 0 0 0 rgba(10, 11, 14, 0.5);
  animation: amber-live-pulse 1.8s ease-in-out infinite;
}

.amber-min-stocks {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0;
  padding: 16px 0;
  margin-top: 16px;
  border-top: 1px solid rgba(10, 11, 14, 0.2);
  border-bottom: 1px solid rgba(10, 11, 14, 0.2);
  flex-shrink: 0;
}
.amber-min-stock {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 6px;
}
.amber-min-stock-ticker {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.2em;
  color: #0A0B0E;
  opacity: 0.55;
  font-weight: 700;
}
.amber-min-stock-price {
  font-family: 'Instrument Serif', serif;
  font-size: 26px;
  color: #0A0B0E;
  line-height: 1;
  letter-spacing: -0.01em;
}
.amber-min-stock-change {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.06em;
  font-weight: 700;
}
.amber-min-stock-change.pos { color: #0a7a3f; }
.amber-min-stock-change.neg { color: #a0211c; }
.amber-min-stock-sep {
  width: 1px;
  align-self: stretch;
  background: rgba(10, 11, 14, 0.15);
  margin: 0 12px;
}
.amber-min-logo {
  height: 56px;
  width: auto;
  filter: brightness(0);
}
.amber-min-pager {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  letter-spacing: 0.3em;
  color: #0A0B0E;
  font-weight: 600;
  opacity: 0.65;
}
.amber-min-center {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 0;
  gap: 16px;
  padding: 20px 0;
}
.amber-min-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 20px;
  letter-spacing: 0.28em;
  color: #0A0B0E;
  font-weight: 700;
  opacity: 0.75;
}
.amber-min-title {
  font-family: 'Inter', sans-serif;
  font-size: 84px;
  line-height: 1.02;
  color: #0A0B0E;
  font-weight: 700;
  letter-spacing: -0.04em;
  margin: 0;
}
.amber-min-italic {
  font-style: italic;
}
.amber-min-sub {
  font-family: 'Inter', sans-serif;
  font-size: 26px;
  line-height: 1.45;
  color: #0A0B0E;
  margin: 0;
  opacity: 0.8;
  max-width: 820px;
  font-style: normal;
  font-weight: 400;
}
.amber-min-pillars {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: stretch;
  gap: 0;
  padding: 22px 0;
  flex-shrink: 0;
}
.amber-min-pillar {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}
.amber-min-pillar-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  letter-spacing: 0.25em;
  color: #0A0B0E;
  opacity: 0.55;
  font-weight: 600;
}
.amber-min-pillar-name {
  font-family: 'Fraunces', serif;
  font-size: 32px;
  color: #0A0B0E;
  line-height: 1;
  font-weight: 400;
}
.amber-min-pillar-sep {
  display: none;
}
.amber-min-foot {
  display: none;
}
.amber-min-foot-icon {
  height: 22px;
  width: auto;
  filter: brightness(0);
  vertical-align: middle;
  margin-right: 8px;
}
.amber-min-url {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  letter-spacing: 0.12em;
  color: #0A0B0E;
  font-weight: 600;
  display: flex;
  align-items: center;
}
.amber-min-arrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.3em;
  color: #0A0B0E;
  font-weight: 700;
  text-transform: uppercase;
}

/* Variations for other posts */
.amber-min-title-md {
  font-size: 86px;
}
.amber-min-title-lg {
  font-size: 120px;
}
.amber-min-center-tight {
  flex: 0 0 auto;
  gap: 16px;
  padding: 20px 0;
}
.card-redentia-features .amber-min-center-tight {
  padding-top: 180px;
  padding-bottom: 60px;
}
.card-redentia-features .amber-min-laptop {
  margin-top: 40px;
}
.card-redentia-features .amber-min-laptop .laptop-frame {
  height: 380px;
}
.amber-min-center-cta {
  align-items: flex-start;
  gap: 26px;
}

/* POST 2 · split: text + iPhone */
.amber-min-split {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 24px 0;
}
.amber-min-split-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-width: 0;
}
.amber-min-iphone {
  flex-shrink: 0;
  width: 350px;
  height: 720px;
  position: relative;
  filter: drop-shadow(0 24px 48px rgba(10, 11, 14, 0.28));
}
.amber-min-iphone .iphone-frame {
  position: absolute;
  inset: 0;
  background: linear-gradient(145deg, #1a1a1d 0%, #0f0f11 50%, #050506 100%);
  border-radius: 52px;
  padding: 11px;
  box-shadow:
    inset 0 0 0 2px #2a2a2e,
    inset 0 0 0 5px #050506;
}
.amber-min-iphone .iphone-notch {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 95px;
  height: 28px;
  background: #000;
  border-radius: 16px;
  z-index: 10;
}
.amber-min-iphone .iphone-screen {
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 42px;
  overflow: hidden;
  position: relative;
}
.iphone-screen-iframe {
  background: #0A0B0E;
}
.amber-min-iphone-iframe {
  /* The Redentia home page forces its body to 1080px wide.
     Render the iframe at the natural 1080px (so the whole page
     layout fits without horizontal overflow) and scale it down
     to 328px so it fills the iPhone screen edge-to-edge. */
  width: 1080px;
  height: 2300px;
  border: 0;
  display: block;
  transform: scale(0.304);
  transform-origin: top left;
  background: #0A0B0E;
}

/* POST 3 · cards compactos */
.amber-min-cards {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  flex-shrink: 0;
  padding: 8px 0;
}
.amber-min-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(10, 11, 14, 0.18);
  border-radius: 4px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #0A0B0E;
  backdrop-filter: blur(2px);
}
.amber-min-card-ticker {
  font-family: 'Inter', sans-serif;
  font-size: 34px;
  font-weight: 800;
  color: #0A0B0E;
  letter-spacing: -0.01em;
}
.amber-min-card-name {
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: #0A0B0E;
  opacity: 0.55;
  font-style: normal;
  font-weight: 600;
  line-height: 1;
  border-bottom: 1px solid rgba(10, 11, 14, 0.15);
  padding-bottom: 16px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.amber-min-card-rows {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 4px;
}
.amber-min-card-rows div {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: 'Inter', sans-serif;
  font-size: 18px;
}
.amber-min-card-rows span {
  color: #0A0B0E;
  opacity: 0.6;
  letter-spacing: 0.02em;
  font-weight: 500;
}
.amber-min-card-rows em {
  font-style: normal;
  color: #0A0B0E;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-family: 'Inter', sans-serif;
  font-size: 19px;
}
.amber-min-card-rows em.pos { color: #0a7a3f; }
.amber-min-card-rows em.neg { color: #a0211c; }
.amber-min-card-rows em.pos { color: #0a7a3f; }
.amber-min-card-rows em.neg { color: #a0211c; }

/* POST 4 · laptop minimal */
.amber-min-laptop {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  filter: drop-shadow(0 24px 48px rgba(10, 11, 14, 0.3));
  padding: 10px 0;
}
.amber-min-laptop .laptop-frame {
  width: 920px;
  height: 500px;
  background: #0A0B0E;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 3px solid #0A0B0E;
}
.amber-min-laptop .laptop-bar {
  padding: 8px 14px;
  min-height: 34px;
  flex-shrink: 0;
}
.laptop-screen-iframe-wrap {
  flex: 1;
  background: #0A0B0E;
  position: relative;
  overflow: hidden;
  width: 100%;
}
.amber-min-laptop-iframe {
  /* Target body is forced to 1080px wide by the app's global layout,
     so we size the iframe at 1080px and scale to fit the 920px
     laptop screen width. Height is oversized so overflow:hidden
     on the wrapper crops the excess, filling the entire screen. */
  position: absolute;
  top: 0;
  left: 0;
  width: 1080px;
  height: 760px;
  border: 0;
  display: block;
  transform: scale(0.852);
  transform-origin: top left;
  background: #0A0B0E;
}
.amber-min-laptop .laptop-frame::after {
  content: '';
  display: block;
  width: 860px;
  height: 10px;
  background: linear-gradient(180deg, #1a1a1d 0%, #0a0a0c 100%);
  border-radius: 0 0 10px 10px;
  margin: 0 -20px -10px -20px;
  align-self: center;
}

/* POST 5 · CTA url box */
.amber-min-cta-url-box {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 18px 28px;
  background: #0A0B0E;
  color: #F5A623;
  border-radius: 2px;
}

/* ----- POST 5 · EDITORIAL CTA (invitation-style) ----- */
.amber-cta-editorial {
  position: relative;
}
.amber-cta-invite {
  position: relative;
  z-index: 3;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 24px 0 0 0;
}
.amber-cta-stamp {
  position: absolute;
  top: -34px;
  right: -4px;
  z-index: 5;
  transform: rotate(14deg);
  width: 170px;
  height: 170px;
  border-radius: 50%;
  border: 3px solid #0A0B0E;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  filter: drop-shadow(0 10px 18px rgba(10, 11, 14, 0.15));
}
.amber-cta-stamp::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px dashed #0A0B0E;
  border-radius: 50%;
}
.amber-cta-stamp-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.amber-cta-stamp-text {
  font-family: 'Inter', sans-serif;
  font-size: 42px;
  font-weight: 800;
  color: #0A0B0E;
  letter-spacing: -0.03em;
  line-height: 1;
}
.amber-cta-stamp-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  color: #0A0B0E;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}
.amber-cta-invite-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(10, 11, 14, 0.2);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.22em;
  color: #0A0B0E;
  font-weight: 700;
  text-transform: uppercase;
}
.amber-cta-invite-code {
  opacity: 0.55;
  font-weight: 500;
}
.amber-cta-hero {
  font-family: 'Inter', sans-serif;
  font-size: 110px;
  line-height: 0.98;
  color: #0A0B0E;
  font-weight: 800;
  letter-spacing: -0.04em;
  margin: 0;
  max-width: 900px;
}
.amber-cta-row {
  display: flex;
  gap: 32px;
  align-items: stretch;
}
.amber-cta-row-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  justify-content: center;
}
.amber-cta-row-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
.amber-cta-url-stack {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 26px;
  background: #0A0B0E;
  color: #F5A623;
  border-radius: 6px;
  box-shadow: 0 14px 28px rgba(10, 11, 14, 0.25);
}
.amber-cta-url-caret {
  font-family: 'JetBrains Mono', monospace;
  font-size: 32px;
  color: #F5A623;
  font-weight: 700;
}
.amber-cta-url-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.24em;
  color: rgba(245, 166, 35, 0.6);
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 2px;
}
.amber-cta-url-big {
  font-family: 'JetBrains Mono', monospace;
  font-size: 32px;
  color: #F5A623;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1;
}
.amber-cta-meta-text {
  font-family: 'Inter', sans-serif;
  font-size: 17px;
  line-height: 1.5;
  color: #0A0B0E;
  opacity: 0.8;
  margin: 0;
  max-width: 500px;
  font-weight: 400;
}
.amber-cta-meta-text strong {
  font-weight: 700;
  opacity: 1;
}
.amber-cta-qr {
  width: 170px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}
.amber-cta-qr-svg {
  width: 170px;
  height: 170px;
  border: 2px solid #0A0B0E;
  padding: 8px;
  background: #F5A623;
  border-radius: 4px;
}
.amber-cta-qr-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.22em;
  color: #0A0B0E;
  font-weight: 700;
  text-align: center;
  line-height: 1.4;
  text-transform: uppercase;
}
.amber-cta-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 20px;
  border-top: 1px solid rgba(10, 11, 14, 0.2);
  margin-top: auto;
}
.amber-cta-signature {
  display: flex;
  align-items: center;
  gap: 14px;
}
.amber-cta-signature-icon {
  width: 36px;
  height: 36px;
  filter: brightness(0);
}
.amber-cta-signature-name {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #0A0B0E;
  line-height: 1.1;
}
.amber-cta-signature-role {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: #0A0B0E;
  opacity: 0.6;
  font-weight: 500;
  margin-top: 2px;
}
.amber-cta-stats {
  display: flex;
  gap: 28px;
}
.amber-cta-stats div {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-end;
}
.amber-cta-stats strong {
  font-family: 'Inter', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #0A0B0E;
  letter-spacing: -0.02em;
  line-height: 1;
}
.amber-cta-stats span {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.2em;
  color: #0A0B0E;
  opacity: 0.6;
  text-transform: uppercase;
  font-weight: 600;
}

/* ----- POST 5 · CLEAN CTA ----- */
.amber-cta-clean {
  grid-template-columns: 1fr;
}
.amber-cta-c {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 28px;
  padding: 20px 0;
  margin-top: 72px;
}
.amber-cta-c-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 20px;
  letter-spacing: 0.28em;
  color: #0A0B0E;
  font-weight: 700;
  text-transform: uppercase;
  opacity: 0.75;
}
.amber-cta-c-hero {
  font-family: 'Inter', sans-serif;
  font-size: 180px;
  line-height: 0.92;
  color: #0A0B0E;
  font-weight: 800;
  letter-spacing: -0.05em;
  margin: 0;
}
.amber-cta-c-sub {
  font-family: 'Inter', sans-serif;
  font-size: 22px;
  line-height: 1.45;
  color: #0A0B0E;
  opacity: 0.75;
  margin: 0;
  max-width: 780px;
  font-weight: 400;
}
.amber-cta-c-button {
  display: inline-flex;
  align-items: center;
  gap: 20px;
  padding: 20px 28px 20px 28px;
  background: #0A0B0E;
  color: #F5A623;
  border-radius: 6px;
  align-self: flex-start;
  box-shadow: 0 18px 40px rgba(10, 11, 14, 0.3);
  transition: transform 0.2s ease;
  cursor: pointer;
  text-decoration: none;
}
.amber-cta-c-button-arrow {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #F5A623;
  color: #0A0B0E;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  flex-shrink: 0;
}
.amber-cta-c-button-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.amber-cta-c-button-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.24em;
  color: rgba(245, 166, 35, 0.6);
  text-transform: uppercase;
  font-weight: 600;
}
.amber-cta-c-button-url {
  font-family: 'JetBrains Mono', monospace;
  font-size: 28px;
  color: #F5A623;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1;
}
.amber-cta-c-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  margin-top: auto;
  border-top: 1px solid rgba(10, 11, 14, 0.2);
}
.amber-cta-c-foot-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #0A0B0E;
  font-weight: 500;
}
.amber-cta-c-foot-left strong {
  font-style: italic;
  font-weight: 700;
}
.amber-cta-c-foot-icon {
  height: 24px;
  width: auto;
  filter: brightness(0);
}
.amber-cta-c-foot-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.16em;
  color: #0A0B0E;
  font-weight: 600;
  text-transform: uppercase;
  opacity: 0.75;
}
.amber-cta-c-foot-meta .dot {
  opacity: 0.4;
}
.amber-min-cta-icon {
  height: 32px;
  width: auto;
  filter: brightness(1.1);
}
.amber-min-cta-url {
  font-family: 'JetBrains Mono', monospace;
  font-size: 38px;
  font-weight: 700;
  color: #F5A623;
  letter-spacing: 0.02em;
}
.amber-min-sub-center {
  text-align: left;
  font-style: normal;
  opacity: 0.65;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.amber-cover-marks {
  display: flex;
  gap: 14px;
  align-items: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.22em;
  font-weight: 700;
  color: #0A0B0E;
  margin-top: 14px;
  flex-wrap: wrap;
}

/* ----- POST 2 · WALLET ----- */
.amber-wallet {
  padding: 72px 8px 40px;
}
.amber-row {
  display: flex;
  gap: 48px;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
}
.amber-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-width: 0;
}
.amber-title {
  font-family: 'Instrument Serif', serif;
  font-size: 88px;
  line-height: 0.92;
  margin: 0;
  color: #0A0B0E;
  font-weight: 400;
  letter-spacing: -0.02em;
}
.amber-title-wide {
  font-size: 82px;
}
.amber-sub {
  font-family: 'Inter', sans-serif;
  font-size: 22px;
  line-height: 1.45;
  color: #0A0B0E;
  margin: 0;
  max-width: 520px;
  opacity: 0.85;
  font-weight: 500;
}
.amber-sub-wide {
  max-width: 840px;
  font-size: 24px;
}
.amber-bullets {
  list-style: none;
  padding: 0;
  margin: 6px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.amber-bullets li {
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  color: #0A0B0E;
  letter-spacing: 0.04em;
  padding-left: 24px;
  position: relative;
  font-weight: 600;
}
.amber-bullets li::before {
  content: '→';
  position: absolute;
  left: 0;
  top: 0;
  color: #0A0B0E;
  font-weight: 700;
}
.amber-iphone {
  flex-shrink: 0;
  width: 400px;
  height: 820px;
  position: relative;
  filter: drop-shadow(0 30px 60px rgba(10, 11, 14, 0.35));
}
.amber-iphone .iphone-frame {
  position: absolute;
  inset: 0;
  background: linear-gradient(145deg, #1a1a1d 0%, #0f0f11 50%, #050506 100%);
  border-radius: 58px;
  padding: 12px;
  box-shadow:
    inset 0 0 0 2px #2a2a2e,
    inset 0 0 0 6px #050506,
    0 0 0 2px rgba(10, 11, 14, 0.5);
}
.amber-iphone .iphone-notch {
  position: absolute;
  top: 22px;
  left: 50%;
  transform: translateX(-50%);
  width: 105px;
  height: 32px;
  background: #000;
  border-radius: 18px;
  z-index: 10;
}
.amber-iphone .iphone-screen {
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 46px;
  overflow: hidden;
  position: relative;
}

/* ----- POST 3 · ANALYSIS ----- */
.amber-analysis {
  flex-direction: column;
  gap: 14px;
  padding: 0;
}
.amber-analysis-top {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}
.amber-analysis-cards {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 4px;
}
.amber-card {
  background: #0A0B0E;
  color: #F5A623;
  padding: 18px 16px 16px 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 16px 36px rgba(10, 11, 14, 0.3);
  border: 1px solid rgba(245, 166, 35, 0.18);
}
.amber-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.amber-card-ticker {
  font-family: 'JetBrains Mono', monospace;
  font-size: 26px;
  font-weight: 700;
  color: #F5A623;
  letter-spacing: 0.04em;
}
.amber-card-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 4px 8px;
  border: 1px solid rgba(245, 166, 35, 0.5);
  border-radius: 4px;
  color: #F5A623;
  font-weight: 700;
}
.amber-card-badge-pos {
  background: #00D395;
  color: #0A0B0E;
  border-color: #00D395;
}
.amber-card-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: rgba(245, 166, 35, 0.65);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 600;
}
.amber-card-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}
.amber-card-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(245, 166, 35, 0.18);
  font-family: 'Inter', sans-serif;
}
.amber-card-row:last-child { border-bottom: none; }
.amber-card-row {
  padding: 6px 0;
}
.amber-card-row span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 500;
}
.amber-card-row strong {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #F5A623;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.amber-card-row strong.pos { color: #00D395; }
.amber-card-row strong.neg { color: #FF4747; }

/* ----- POST 4 · FEATURES / LAPTOP ----- */
.amber-features {
  padding: 68px 0 30px;
  flex-direction: column;
  gap: 22px;
}
.amber-features-head {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.amber-laptop {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  filter: drop-shadow(0 28px 52px rgba(10, 11, 14, 0.35));
}
.laptop-frame {
  width: 880px;
  height: 500px;
  background: #0A0B0E;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 4px solid #0A0B0E;
  box-shadow: 0 4px 0 rgba(10, 11, 14, 0.4);
}
.laptop-frame::after {
  content: '';
  display: block;
  width: 920px;
  height: 12px;
  background: linear-gradient(180deg, #1a1a1d 0%, #0a0a0c 100%);
  border-radius: 0 0 12px 12px;
  margin: 0 -24px -12px -24px;
  align-self: center;
  box-shadow: 0 6px 12px rgba(10, 11, 14, 0.3);
}
.laptop-bar {
  background: #14161C;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgba(245, 166, 35, 0.1);
}
.laptop-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}
.laptop-dot-red { background: #FF5F57; }
.laptop-dot-yellow { background: #FEBC2E; }
.laptop-dot-green { background: #28C840; }
.laptop-url {
  margin-left: auto;
  margin-right: auto;
  background: #0A0B0E;
  padding: 6px 20px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #F5A623;
  letter-spacing: 0.05em;
  font-weight: 600;
}
.laptop-screen {
  flex: 1;
  display: flex;
  background: #0A0B0E;
}
.laptop-sidebar {
  width: 60px;
  background: #0A0B0E;
  border-right: 1px solid rgba(245, 166, 35, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  padding: 18px 0;
}
.laptop-logo {
  width: 28px;
  height: 28px;
  filter: brightness(1.2);
  margin-bottom: 8px;
}
.laptop-nav, .laptop-nav-active {
  color: rgba(245, 166, 35, 0.4);
  font-size: 14px;
}
.laptop-nav-active { color: #F5A623; }
.laptop-main {
  flex: 1;
  padding: 18px;
  overflow: hidden;
}
.laptop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 12px;
  height: 100%;
}
.laptop-card {
  background: #14161C;
  border: 1px solid rgba(245, 166, 35, 0.15);
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}
.laptop-card-span2 { grid-column: span 2; }
.laptop-card-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.22em;
  color: #F5A623;
  text-transform: uppercase;
  font-weight: 700;
}
.laptop-card-big {
  font-family: 'Instrument Serif', serif;
  font-size: 44px;
  color: #E8EAED;
  line-height: 1;
  letter-spacing: -0.02em;
}
.laptop-card-big span {
  font-size: 28px;
  color: rgba(232, 234, 237, 0.6);
}
.laptop-card-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 70px;
  margin-top: auto;
}
.laptop-card-bars span {
  flex: 1;
  background: linear-gradient(180deg, #F5A623 0%, #C47A12 100%);
  border-radius: 3px 3px 0 0;
}
.laptop-chat-bubble {
  background: rgba(245, 166, 35, 0.1);
  border: 1px solid rgba(245, 166, 35, 0.3);
  padding: 10px 12px;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  line-height: 1.35;
  color: #E8EAED;
  font-weight: 500;
}
.laptop-card-foot {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: #00D395;
  letter-spacing: 0.1em;
  font-weight: 600;
  margin-top: auto;
}
.laptop-move {
  display: flex;
  justify-content: space-between;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #E8EAED;
  padding: 4px 0;
  border-bottom: 1px dashed rgba(245, 166, 35, 0.12);
  font-weight: 600;
}
.laptop-move:last-child { border-bottom: none; }
.laptop-move .pos { color: #00D395; }
.laptop-move .neg { color: #FF4747; }
.laptop-calc {
  font-family: 'Instrument Serif', serif;
  font-size: 32px;
  color: #F5A623;
  line-height: 1;
}
.laptop-calc span {
  font-size: 16px;
  color: rgba(245, 166, 35, 0.65);
}
.laptop-calc-foot {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: rgba(232, 234, 237, 0.65);
  letter-spacing: 0.08em;
  margin-top: auto;
  font-weight: 600;
}
.amber-chips {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  padding: 0 20px;
}
.amber-chips span {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.15em;
  padding: 8px 14px;
  background: #0A0B0E;
  color: #F5A623;
  border-radius: 999px;
}

/* ----- POST 5 · CTA ----- */
.amber-cta {
  padding: 0;
  justify-content: center;
  align-items: center;
}
.amber-cta-inner {
  position: relative;
  z-index: 2;
  max-width: 920px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  text-align: center;
}
.amber-cta-title {
  font-family: 'Instrument Serif', serif;
  font-size: 140px;
  line-height: 0.92;
  color: #0A0B0E;
  margin: 0;
  font-weight: 400;
  letter-spacing: -0.03em;
}
.amber-cta-accent {
  font-style: italic;
  background: #0A0B0E;
  color: #F5A623;
  padding: 0 24px 14px 24px;
  display: inline-block;
  border-radius: 14px;
  line-height: 0.85;
}
.amber-cta-box {
  background: #0A0B0E;
  color: #F5A623;
  padding: 24px 42px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  margin-top: 12px;
  box-shadow: 0 20px 48px rgba(10, 11, 14, 0.45);
}
.amber-cta-url {
  font-family: 'JetBrains Mono', monospace;
  font-size: 46px;
  font-weight: 700;
  color: #F5A623;
  letter-spacing: 0.04em;
}
.amber-cta-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  letter-spacing: 0.2em;
  color: rgba(245, 166, 35, 0.75);
  text-transform: uppercase;
  font-weight: 600;
}
.amber-cta-badges {
  display: flex;
  gap: 16px;
  margin-top: 14px;
}
.amber-cta-badge {
  background: #F5A623;
  border: 2px solid #0A0B0E;
  border-radius: 12px;
  padding: 14px 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 190px;
}
.amber-cta-badge strong {
  font-family: 'Instrument Serif', serif;
  font-size: 44px;
  color: #0A0B0E;
  line-height: 1;
  font-weight: 400;
}
.amber-cta-badge span {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.18em;
  color: #0A0B0E;
  font-weight: 700;
}

.amber-cover-title-text {
  font-family: 'Instrument Serif', serif;
  font-size: 140px;
  line-height: 0.95;
  margin: 0;
  color: #0A0B0E;
  letter-spacing: -0.03em;
  font-weight: 400;
  display: block;
}
.amber-cover-title-text .amber-accent {
  font-family: 'Instrument Serif', serif;
  font-size: 120px;
  padding: 8px 22px 18px 22px;
  line-height: 0.8;
}

/* Shared card shells for new generic variants */
.card-redentia-stat,
.card-redentia-list,
.card-redentia-steps,
.card-redentia-compare,
.card-redentia-quote,
.card-redentia-push,
.card-redentia-movimento,
.card-redentia-ranking {
  background-color: #F5A623;
  background-image:
    linear-gradient(rgba(10, 11, 14, 0.11) 1px, transparent 1px),
    linear-gradient(90deg, rgba(10, 11, 14, 0.11) 1px, transparent 1px);
  background-size: 54px 54px;
  background-position: -1px -1px;
  color: #0A0B0E;
  border: none;
  border-radius: 0;
  border-radius: 0;
  padding: 64px 72px;
}
.card-redentia-stat .backdrop-1,
.card-redentia-stat .backdrop-2,
.card-redentia-stat .backdrop-grid,
.card-redentia-stat .backdrop-noise,
.card-redentia-list .backdrop-1,
.card-redentia-list .backdrop-2,
.card-redentia-list .backdrop-grid,
.card-redentia-list .backdrop-noise,
.card-redentia-steps .backdrop-1,
.card-redentia-steps .backdrop-2,
.card-redentia-steps .backdrop-grid,
.card-redentia-steps .backdrop-noise,
.card-redentia-compare .backdrop-1,
.card-redentia-compare .backdrop-2,
.card-redentia-compare .backdrop-grid,
.card-redentia-compare .backdrop-noise,
.card-redentia-quote .backdrop-1,
.card-redentia-quote .backdrop-2,
.card-redentia-quote .backdrop-grid,
.card-redentia-quote .backdrop-noise {
  display: none;
}
.card-redentia-stat .header,
.card-redentia-stat .footer,
.card-redentia-list .header,
.card-redentia-list .footer,
.card-redentia-steps .header,
.card-redentia-steps .footer,
.card-redentia-compare .header,
.card-redentia-compare .footer,
.card-redentia-quote .header,
.card-redentia-quote .footer {
  display: none;
}

/* ----- GENERIC · STAT ----- */
.amber-stat {
  padding: 72px 8px 40px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 24px;
}
.amber-stat-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 960px;
}
.amber-stat-value {
  font-family: 'Instrument Serif', serif;
  font-size: 320px;
  line-height: 0.85;
  color: #0A0B0E;
  margin: 0;
  letter-spacing: -0.05em;
  font-weight: 400;
}
.amber-stat-unit {
  font-size: 120px;
  margin-left: 8px;
}
.amber-stat-title {
  font-family: 'Instrument Serif', serif;
  font-size: 80px;
  line-height: 0.95;
  color: #0A0B0E;
  margin: 0;
  font-weight: 400;
  letter-spacing: -0.02em;
}
.amber-stat-sub {
  font-family: 'Inter', sans-serif;
  font-size: 22px;
  line-height: 1.45;
  color: #0A0B0E;
  opacity: 0.85;
  margin: 0;
  max-width: 820px;
  font-weight: 500;
}

/* ----- GENERIC · LIST ----- */
.amber-list {
  padding: 72px 4px 40px;
  flex-direction: column;
  gap: 26px;
}
.amber-list-head {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.amber-title-list {
  font-size: 82px;
}
.amber-list-items {
  position: relative;
  z-index: 2;
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.amber-list-items li {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 18px 24px;
  background: #0A0B0E;
  border-radius: 14px;
  color: #F5A623;
  box-shadow: 0 10px 28px rgba(10, 11, 14, 0.25);
}
.amber-list-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  font-weight: 700;
  color: #F5A623;
  letter-spacing: 0.04em;
  min-width: 48px;
}
.amber-list-text {
  font-family: 'Instrument Serif', serif;
  font-size: 30px;
  line-height: 1.2;
  color: #F5A623;
  font-weight: 400;
}
.amber-list-hl {
  color: #FFE082;
  font-style: italic;
}

/* ----- GENERIC · STEPS ----- */
.amber-steps {
  padding: 72px 4px 44px;
  flex-direction: column;
  gap: 32px;
}
.amber-steps-track {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1;
  justify-content: center;
}
.amber-step {
  display: flex;
  align-items: stretch;
  gap: 24px;
  padding: 26px 28px;
  background: rgba(10, 11, 14, 0.06);
  border: 2px dashed rgba(10, 11, 14, 0.25);
  border-radius: 18px;
}
.amber-step-num {
  font-family: 'Instrument Serif', serif;
  font-size: 80px;
  line-height: 1;
  color: #0A0B0E;
  font-weight: 400;
  min-width: 110px;
  text-align: center;
  border-right: 2px solid rgba(10, 11, 14, 0.15);
  padding-right: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.amber-step-body {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  line-height: 1.35;
  color: #0A0B0E;
  flex: 1;
  display: flex;
  align-items: center;
  font-weight: 600;
}

/* ----- GENERIC · COMPARE ----- */
.amber-compare {
  padding: 72px 4px 40px;
  flex-direction: column;
  gap: 28px;
}
.amber-compare-grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 60px 1fr;
  gap: 22px;
  align-items: stretch;
  flex: 1;
}
.amber-compare-col {
  padding: 26px 28px;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.amber-compare-before {
  background: rgba(10, 11, 14, 0.08);
  border: 2px dashed rgba(10, 11, 14, 0.3);
}
.amber-compare-after {
  background: #0A0B0E;
  color: #F5A623;
}
.amber-compare-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.28em;
  color: #0A0B0E;
  font-weight: 700;
  text-transform: uppercase;
  padding-bottom: 10px;
  border-bottom: 1px dashed rgba(10, 11, 14, 0.3);
}
.amber-compare-label-after {
  color: #F5A623;
  border-bottom-color: rgba(245, 166, 35, 0.3);
}
.amber-compare-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.amber-compare-before ul li {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  line-height: 1.35;
  color: #0A0B0E;
  padding-left: 28px;
  position: relative;
  font-weight: 500;
  text-decoration: line-through;
  opacity: 0.7;
}
.amber-compare-before ul li::before {
  content: '✕';
  position: absolute;
  left: 0;
  top: 0;
  font-weight: 700;
}
.amber-compare-after ul li {
  font-family: 'Inter', sans-serif;
  font-size: 19px;
  line-height: 1.35;
  color: #F5A623;
  padding-left: 28px;
  position: relative;
  font-weight: 600;
}
.amber-compare-after ul li::before {
  content: '✓';
  position: absolute;
  left: 0;
  top: 0;
  color: #00D395;
  font-weight: 700;
}
.amber-compare-arrow {
  font-family: 'Instrument Serif', serif;
  font-size: 84px;
  color: #0A0B0E;
  align-self: center;
  justify-self: center;
  line-height: 1;
  font-weight: 400;
}

/* ----- GENERIC · QUOTE ----- */
.amber-quote {
  justify-content: center;
  align-items: center;
  padding: 60px 12px;
}
.amber-quote-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 940px;
  text-align: left;
}
.amber-quote-mark {
  font-family: 'Instrument Serif', serif;
  font-size: 280px;
  line-height: 0.6;
  color: #0A0B0E;
  font-weight: 400;
  height: 100px;
  font-style: italic;
}
.amber-quote-text {
  font-family: 'Instrument Serif', serif;
  font-size: 96px;
  line-height: 0.98;
  color: #0A0B0E;
  margin: 0;
  font-weight: 400;
  letter-spacing: -0.02em;
}
.amber-quote-author {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  letter-spacing: 0.18em;
  color: #0A0B0E;
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 20px;
}

/* ============================================================
   GENERIC VARIANTS · MINIMALIST LAYOUT
   (stat · list · steps · compare · quote)
   Same header/footer/grid shell as the POST_01 cover; only the
   middle content differs between variants.
   ============================================================ */

/* STAT · big number */
.amber-min-stat-big {
  font-family: 'Inter', sans-serif;
  font-size: 180px;
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.05em;
  color: #0A0B0E;
  margin: 4px 0 0 0;
}
.amber-min-stat-unit {
  font-size: 72px;
  font-weight: 700;
  opacity: 0.7;
  margin-left: 8px;
}
.amber-min-title-stat {
  font-size: 60px;
  margin-top: 4px;
}

/* LIST · items numerados */
.amber-min-items-list {
  position: relative;
  z-index: 2;
  list-style: none;
  padding: 0;
  margin: 0 0 40px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}
.amber-min-items-list li {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 18px 24px;
  background: rgba(10, 11, 14, 0.04);
  border: 1px solid rgba(10, 11, 14, 0.15);
  border-radius: 4px;
}
.amber-min-items-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  font-weight: 700;
  color: #0A0B0E;
  opacity: 0.5;
  letter-spacing: 0.04em;
  min-width: 44px;
  padding-top: 3px;
}
.amber-min-items-text {
  font-family: 'Inter', sans-serif;
  font-size: 19px;
  line-height: 1.4;
  color: #0A0B0E;
  font-weight: 500;
  flex: 1;
}

/* STEPS */
.amber-min-steps-list {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 40px;
  flex-shrink: 0;
}
.amber-min-step {
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 26px 28px;
  background: rgba(10, 11, 14, 0.04);
  border: 1px solid rgba(10, 11, 14, 0.2);
  border-radius: 4px;
}
.amber-min-step-num {
  font-family: 'Inter', sans-serif;
  font-size: 64px;
  font-weight: 800;
  line-height: 1;
  color: #0A0B0E;
  letter-spacing: -0.03em;
  min-width: 100px;
  padding-right: 24px;
  border-right: 1px solid rgba(10, 11, 14, 0.2);
}
.amber-min-step-body {
  font-family: 'Inter', sans-serif;
  font-size: 22px;
  line-height: 1.35;
  color: #0A0B0E;
  font-weight: 500;
  flex: 1;
}

/* COMPARE · 2 cols */
.amber-min-compare-grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 40px;
  flex-shrink: 0;
}
.amber-min-compare-col {
  padding: 28px 24px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.amber-min-compare-before {
  background: rgba(10, 11, 14, 0.06);
  border: 1px solid rgba(10, 11, 14, 0.2);
}
.amber-min-compare-after {
  background: #0A0B0E;
  color: #F5A623;
}
.amber-min-compare-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.24em;
  color: #0A0B0E;
  font-weight: 700;
  text-transform: uppercase;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(10, 11, 14, 0.2);
}
.amber-min-compare-label-after {
  color: #F5A623;
  border-bottom-color: rgba(245, 166, 35, 0.3);
}
.amber-min-compare-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.amber-min-compare-before ul li {
  font-family: 'Inter', sans-serif;
  font-size: 17px;
  line-height: 1.35;
  color: #0A0B0E;
  opacity: 0.65;
  padding-left: 24px;
  position: relative;
  font-weight: 500;
  text-decoration: line-through;
}
.amber-min-compare-before ul li::before {
  content: '×';
  position: absolute;
  left: 0;
  font-weight: 700;
  opacity: 0.8;
}
.amber-min-compare-after ul li {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  line-height: 1.35;
  color: #F5A623;
  padding-left: 24px;
  position: relative;
  font-weight: 600;
}
.amber-min-compare-after ul li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #00D395;
  font-weight: 700;
}

/* QUOTE */
.amber-min-center-quote {
  justify-content: center;
  padding: 40px 0;
}
.amber-min-quote-mark {
  font-family: 'Inter', sans-serif;
  font-size: 240px;
  font-weight: 900;
  color: #0A0B0E;
  line-height: 0.7;
  height: 110px;
  letter-spacing: -0.05em;
}
.amber-min-title-quote {
  font-size: 90px;
  line-height: 0.98;
  margin-top: 20px;
}
.amber-min-quote-author {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  letter-spacing: 0.22em;
  color: #0A0B0E;
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 32px;
  opacity: 0.75;
}

/* ============================================================
   UNIT POSTS · PUSH NOTIFICATION (iPhone lock screen)
   ============================================================ */
.amber-push-wrap {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  justify-content: center;
  align-items: center;
  padding: 20px 0 80px 0;
}
.amber-push-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 20px;
  letter-spacing: 0.28em;
  color: #0A0B0E;
  font-weight: 700;
  text-transform: uppercase;
}
.amber-push-lockscreen {
  width: 460px;
  height: 660px;
  background:
    radial-gradient(ellipse at 50% 20%, rgba(245, 166, 35, 0.18) 0%, transparent 55%),
    linear-gradient(180deg, #0a0503 0%, #1a0e02 50%, #0f0602 100%);
  border-radius: 50px;
  padding: 52px 26px 40px 26px;
  box-shadow:
    inset 0 0 0 2px #2a2a2e,
    inset 0 0 0 14px #050506,
    0 24px 48px rgba(10, 11, 14, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.amber-push-lockscreen::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 115px;
  height: 32px;
  background: #000;
  border-radius: 18px;
}
.amber-push-time {
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  font-size: 84px;
  font-weight: 200;
  color: rgba(255, 255, 255, 0.92);
  letter-spacing: -0.03em;
  margin-top: 56px;
  line-height: 1;
}
.amber-push-date {
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 500;
  margin-top: 6px;
  margin-bottom: 46px;
}
.amber-push-card {
  width: 100%;
  background: rgba(35, 30, 25, 0.72);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 16px 18px;
  color: white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
.amber-push-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.amber-push-card-icon {
  width: 28px;
  height: 28px;
  background: #F5A623;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}
.amber-push-card-icon img {
  width: 100%;
  height: 100%;
  filter: invert(1);
}
.amber-push-card-meta {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
}
.amber-push-card-app {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
  letter-spacing: 0.02em;
}
.amber-push-card-when {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
}
.amber-push-card-title {
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  font-size: 17px;
  font-weight: 600;
  color: white;
  line-height: 1.25;
  margin-bottom: 4px;
}
.amber-push-card-body {
  font-family: -apple-system, 'SF Pro Display', 'Inter', sans-serif;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.3;
}
.amber-push-caption {
  font-family: 'Inter', sans-serif;
  font-size: 22px;
  color: #0A0B0E;
  opacity: 0.75;
  line-height: 1.4;
  text-align: center;
  max-width: 720px;
  margin: 0;
}

/* ============================================================
   UNIT POSTS · MOVIMENTO (variação de ativo)
   ============================================================ */
.amber-mov-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.amber-mov-ticker {
  font-family: 'Inter', sans-serif;
  font-size: 120px;
  font-weight: 800;
  line-height: 0.95;
  color: #0A0B0E;
  letter-spacing: -0.05em;
}
.amber-mov-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  letter-spacing: 0.18em;
  color: #0A0B0E;
  opacity: 0.7;
  font-weight: 600;
  text-transform: uppercase;
}
.amber-mov-price-row {
  display: flex;
  align-items: baseline;
  gap: 32px;
  margin-top: 8px;
  padding: 24px 0;
  border-top: 1px solid rgba(10, 11, 14, 0.2);
  border-bottom: 1px solid rgba(10, 11, 14, 0.2);
}
.amber-mov-price {
  font-family: 'Inter', sans-serif;
  font-size: 72px;
  font-weight: 800;
  line-height: 1;
  color: #0A0B0E;
  letter-spacing: -0.03em;
}
.amber-mov-change {
  font-family: 'Inter', sans-serif;
  font-size: 56px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.amber-mov-change.pos { color: #0a7a3f; }
.amber-mov-change.neg { color: #a0211c; }
.amber-mov-arrow {
  font-size: 48px;
}
.amber-mov-meta {
  display: flex;
  gap: 14px;
  margin-top: 20px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  letter-spacing: 0.12em;
  color: #0A0B0E;
  font-weight: 600;
  opacity: 0.7;
  flex-wrap: wrap;
}
.amber-mov-meta span {
  padding: 10px 16px;
  border: 1px solid rgba(10, 11, 14, 0.25);
  border-radius: 4px;
  text-transform: uppercase;
}

/* ============================================================
   UNIT POSTS · RANKING
   ============================================================ */
.amber-ranking-list {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 40px;
  flex-shrink: 0;
}
.amber-ranking-item {
  display: grid;
  grid-template-columns: 70px 1fr auto auto;
  gap: 20px;
  align-items: center;
  padding: 18px 24px;
  background: rgba(10, 11, 14, 0.04);
  border: 1px solid rgba(10, 11, 14, 0.2);
  border-radius: 4px;
}
.amber-ranking-pos {
  font-family: 'Inter', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #0A0B0E;
  opacity: 0.45;
  letter-spacing: -0.02em;
}
.amber-ranking-ticker {
  font-family: 'Inter', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: #0A0B0E;
  letter-spacing: -0.01em;
}
.amber-ranking-value {
  font-family: 'Inter', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #0a7a3f;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
.amber-ranking-extra {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #0A0B0E;
  opacity: 0.55;
  letter-spacing: 0.08em;
  font-weight: 600;
}

/* ============================================================
   UNIT POST · FEATURE LAUNCH
   ============================================================ */
.amber-launch-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  background: #0A0B0E;
  color: #F5A623;
  border-radius: 999px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.28em;
  font-weight: 700;
  text-transform: uppercase;
}
.amber-launch-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #F5A623;
  animation: amber-live-pulse 1.8s ease-in-out infinite;
}
.amber-launch-head {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 18px;
  flex-shrink: 0;
}
.amber-launch-title {
  font-family: 'Inter', sans-serif;
  font-size: 82px;
  line-height: 0.98;
  color: #0A0B0E;
  font-weight: 800;
  letter-spacing: -0.04em;
  margin: 0;
}
.amber-launch-sub {
  font-family: 'Inter', sans-serif;
  font-size: 22px;
  line-height: 1.45;
  color: #0A0B0E;
  opacity: 0.75;
  margin: 0;
  max-width: 820px;
  font-weight: 500;
}
.amber-launch-laptop {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
  filter: drop-shadow(0 24px 48px rgba(10, 11, 14, 0.3));
  margin: 24px 0 20px 0;
}
.amber-launch-laptop .laptop-frame {
  width: 920px;
  height: 460px;
  background: #0A0B0E;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 3px solid #0A0B0E;
}
.amber-launch-laptop .laptop-bar {
  padding: 8px 14px;
  min-height: 34px;
  flex-shrink: 0;
}
.amber-launch-chips {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}
.amber-launch-chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  letter-spacing: 0.16em;
  font-weight: 700;
  padding: 10px 20px;
  background: #0A0B0E;
  color: #F5A623;
  border-radius: 999px;
  text-transform: uppercase;
}
.amber-launch-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 18px 0 0 0;
  border-top: 1px solid rgba(10, 11, 14, 0.2);
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}
.amber-launch-cta-icon {
  height: 32px;
  width: auto;
  filter: brightness(0);
}
.amber-launch-cta-url {
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  font-weight: 700;
  color: #0A0B0E;
  letter-spacing: 0.06em;
}

/* ============================================================
   UNIT POST · EMBED GRID (6 widgets tiles)
   ============================================================ */
.amber-embed-grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 12px;
  margin-bottom: 40px;
  flex-shrink: 0;
}
.amber-embed-tile {
  background: #0A0B0E;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  height: 170px;
  display: flex;
  flex-direction: column;
}
.amber-embed-tile-wide {
  grid-column: span 2;
}
.amber-embed-tile-tall {
  grid-row: span 1;
}
.amber-embed-iframe {
  border: 0;
  width: 100%;
  height: 100%;
  background: #0A0B0E;
}
.amber-embed-iframe-chart {
  height: 170px;
}
.amber-embed-tile-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.2em;
  color: #F5A623;
  font-weight: 700;
  background: linear-gradient(180deg, transparent 0%, rgba(10, 11, 14, 0.85) 60%);
  text-transform: uppercase;
  text-align: right;
}

/* ============================================================
   UNIT POST · EMBED SHOWCASE (1 widget + code)
   ============================================================ */
.amber-embed-preview {
  position: relative;
  z-index: 2;
  margin: 8px 0 18px 0;
  background: #0A0B0E;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 260px;
  flex-shrink: 0;
  box-shadow: 0 16px 40px rgba(10, 11, 14, 0.25);
}
.amber-embed-preview-iframe {
  border: 0;
  width: 100%;
  height: 240px;
  background: transparent;
}
.amber-embed-code {
  position: relative;
  z-index: 2;
  background: #0A0B0E;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(245, 166, 35, 0.25);
  flex-shrink: 0;
  margin-bottom: 24px;
}
.amber-embed-code-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(245, 166, 35, 0.06);
  border-bottom: 1px solid rgba(245, 166, 35, 0.15);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.12em;
  color: rgba(245, 166, 35, 0.65);
  font-weight: 600;
}
.amber-embed-code-dots {
  display: inline-flex;
  gap: 6px;
}
.amber-embed-code-dots span {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: rgba(245, 166, 35, 0.2);
}
.amber-embed-code-dots span:first-child { background: #FF5F57; }
.amber-embed-code-dots span:nth-child(2) { background: #FEBC2E; }
.amber-embed-code-dots span:last-child { background: #28C840; }
.amber-embed-code-label {
  flex: 1;
  text-transform: uppercase;
}
.amber-embed-code-copy {
  font-size: 11px;
  letter-spacing: 0.18em;
  font-weight: 700;
  color: #F5A623;
}
.amber-embed-code-body {
  padding: 22px 20px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  line-height: 1.65;
  color: #E8EAED;
  word-break: break-all;
}
.amber-embed-code-tag {
  color: #F5A623;
  font-weight: 700;
}
.amber-embed-code-attr {
  color: rgba(255, 224, 130, 0.85);
}
.amber-embed-code-str {
  color: #00D395;
}
</style>

<style>
/* Global, unscoped overrides for the marketing2 creative page.
   Avoids :has() (unreliable in older headless Chrome). */
html, body {
  margin: 0 !important;
  padding: 0 !important;
  background: #F5A623 !important;
  min-height: 1080px !important;
}
body {
  width: 1080px !important;
}
.stage-editorial {
  width: 1080px !important;
  height: 1080px !important;
  min-height: 1080px !important;
  max-height: 1080px !important;
  padding: 0 !important;
  margin: 0 !important;
  background: #F5A623 !important;
  overflow: hidden !important;
  display: block !important;
}
.stage-editorial > .card {
  width: 1080px !important;
  height: 1080px !important;
  max-width: 1080px !important;
  max-height: 1080px !important;
  margin: 0 !important;
  border-radius: 0 !important;
  border: none !important;
  aspect-ratio: auto !important;
  box-sizing: border-box !important;
}
</style>

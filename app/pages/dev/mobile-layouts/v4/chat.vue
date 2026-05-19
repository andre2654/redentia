<!--
  V4 — Chat Mercury (port direto dos JSX oficiais).

  Estrategia: 2 shells (mobile + desktop), toggle Basic/MAX via ref('basic'|'max').
  - Mobile: `.phone.mercury.chat` (com `.chat-max` quando MAX)
  - Desktop: `.dt.mercury-dt.chat-dt` (com `.chat-max-dt` quando MAX)
  - Cards expansiveis (Patrimonio HOJE, Proventos do mes)
  - Maiores altas/baixas (2 cards mover)
  - Noticias do dia (scroll horizontal mobile, grid 3-col desktop)
  - Sugestoes clicaveis (MAX tem 2 a mais)
  - Input bar fixado bottom (gradient ouro no MAX)
  - Sidebar (desktop) com Chat IA active em FERRAMENTAS

  Cores: #F8F6F1 base, #FAF6EA parchment (MAX), #0F0F0E ink, golds #B7873A/#D1A75A/#8A6018
-->
<template>
  <div class="v4">

    <!-- ============ MOBILE SHELL (.phone.mercury.chat) ============ -->
    <div class="phone mercury chat" :class="{ 'chat-max': mode === 'max' }">

      <!-- APPBAR: back + logo Redent.IA + selector Basic/MAX -->
      <div class="m-appbar chat-appbar">
        <div class="appbar-left">
          <NuxtLink to="/dev/mobile-layouts/v4/home" class="back-btn">
            <UIcon name="i-lucide-chevron-left" class="size-4" />
          </NuxtLink>
          <span class="brand-seal">
            <UIcon name="i-lucide-sparkles" class="size-4" style="color:#fff;" />
          </span>
          <div class="brand-meta">
            <div class="brand-title">
              Redent.IA
              <span v-if="mode === 'max'" class="max-badge">MAX</span>
            </div>
            <div class="brand-sub">
              {{ mode === 'max' ? 'Pensamento profundo · analise sem limites' : 'Pergunte algo sobre sua carteira' }}
            </div>
          </div>
        </div>
        <button class="mode-selector" @click="toggleMode">
          <span>{{ mode === 'max' ? 'MAX' : 'Basic' }}</span>
          <UIcon name="i-lucide-chevron-down" class="size-3" />
        </button>
      </div>

      <div class="m-scroll chat-scroll">

        <!-- GREET -->
        <div class="chat-greet">
          <template v-if="mode === 'max'">
            <div class="greet-h">
              Boa tarde, <span class="greet-name-italic">Andre.</span>
            </div>
            <div class="greet-s">Sua carteira preparou alguns dados pra conversarmos.</div>
          </template>
          <template v-else>
            <div class="greet-h-basic">Ola, Andre</div>
            <div class="greet-s">Toque em um card abaixo ou digite sua pergunta.</div>
          </template>
        </div>

        <!-- DATA CARDS (Patrimonio + Proventos) -->
        <div v-for="card in dataCards" :key="card.title" class="data-card-wrap">
          <div class="chat-card data-card" :class="{ open: openedCards.has(card.title) }" @click="toggleCard(card.title)">
            <div class="data-card-head">
              <div class="data-card-meta">
                <div class="data-card-tag-row">
                  <span class="data-tag" :class="`tag-${card.tagTone}`">{{ card.tag }}</span>
                  <span class="data-card-title">{{ card.title }}</span>
                </div>
                <div class="data-card-value" :style="card.valueColor ? { color: card.valueColor } : {}">{{ card.value }}</div>
                <div class="data-card-sub" :style="card.subColor ? { color: card.subColor } : {}">{{ card.sub }}</div>
              </div>
              <UIcon name="i-lucide-chevron-right" class="size-3 data-chevron" :class="{ rotated: openedCards.has(card.title) }" />
            </div>
            <div v-if="openedCards.has(card.title)" class="data-card-body">
              <div class="data-body-label">Pergunte sobre isso</div>
              <div v-for="(a, i) in card.actions" :key="i" class="data-action">
                <span>{{ a }}</span>
                <UIcon name="i-lucide-arrow-right" class="size-3" :style="{ color: mode === 'max' ? '#B7873A' : 'rgba(15,15,14,.45)' }" />
              </div>
            </div>
          </div>
        </div>

        <!-- MAIORES ALTAS E BAIXAS -->
        <div class="m-section chat-section">
          <span class="title">Maiores altas e baixas da carteira</span>
        </div>
        <div class="movers-row">
          <div v-for="m in movers" :key="m.ticker" class="chat-card mover-card">
            <span class="mover-tag" :class="`tag-${m.tone}`">{{ m.tag }}</span>
            <div class="mover-ticker">{{ m.ticker }}</div>
            <div class="mover-name">{{ m.name }}</div>
            <div class="mover-delta" :style="{ color: m.tone === 'pos' ? '#0F8C4D' : '#C4413A' }">{{ m.delta }}</div>
            <div class="mover-ask" :style="{ color: mode === 'max' ? '#B7873A' : 'rgba(15,15,14,.55)' }">
              Perguntar
              <UIcon name="i-lucide-chevron-right" class="size-3" />
            </div>
          </div>
        </div>

        <!-- NOTICIAS DO DIA -->
        <div class="m-section chat-section">
          <span class="title">Noticias do dia</span>
          <span class="link">Ver todas →</span>
        </div>
        <div class="news-scroll">
          <div v-for="n in news" :key="n.title" class="chat-card news-card">
            <div class="news-head">
              <span class="news-source">{{ n.source.toUpperCase() }}</span>
              <span class="news-time">{{ n.time }}</span>
            </div>
            <div class="news-title">{{ n.title }}</div>
            <div class="news-foot">
              <span v-for="t in n.tickers" :key="t" class="news-ticker">{{ t }}</span>
              <span class="news-ask" :style="{ color: mode === 'max' ? '#B7873A' : 'rgba(15,15,14,.55)' }">
                Perguntar
                <UIcon name="i-lucide-chevron-right" class="size-3" />
              </span>
            </div>
          </div>
        </div>

        <!-- SUGESTOES -->
        <div class="m-section chat-section">
          <span class="title">{{ mode === 'max' ? 'Sugestoes da IA' : 'Sugestoes' }}</span>
        </div>
        <div class="suggestions">
          <div v-for="s in visibleSuggestions" :key="s.text"
               class="suggestion"
               :class="{ 'max-only': s.maxOnly }">
            <div class="suggestion-ic" :class="{ 'max-only-ic': s.maxOnly }">
              <UIcon :name="s.icon" class="size-4" />
            </div>
            <div class="suggestion-text">{{ s.text }}</div>
            <span v-if="s.maxOnly" class="suggestion-badge">MAX</span>
            <UIcon name="i-lucide-chevron-right" class="size-3" style="color: rgba(15,15,14,.35);" />
          </div>
        </div>
      </div>

      <!-- INPUT BAR FIXO BOTTOM -->
      <div class="chat-input-bar">
        <div class="input-main">
          <span class="input-placeholder">Pergunte algo sobre sua carteira</span>
          <button class="send-btn">
            <UIcon name="i-lucide-send" class="size-3.5" />
          </button>
        </div>
        <div class="input-foot">
          <div class="input-foot-spacer" />
          <span class="mode-label">{{ mode === 'max' ? 'MODO MAX' : 'BASIC' }}</span>
        </div>
      </div>
    </div>


    <!-- ============ DESKTOP SHELL (.dt.mercury-dt.chat-dt) ============ -->
    <div class="dt mercury-dt chat-dt" :class="{ 'chat-max-dt': mode === 'max' }">
      <!-- SIDEBAR -->
      <div class="d-side">
        <div class="d-brand">
          <span class="d-brand-mark"><img src="/brand/logo-icon.svg" alt="Redentia" /></span>
          <span class="nm">Redentia</span>
        </div>
        <div class="d-nav">
          <div v-for="n in navMain" :key="n.label" class="item">
            <UIcon :name="n.icon" class="ic" />
            <span>{{ n.label }}</span>
            <span v-if="n.badge" class="badge">{{ n.badge }}</span>
          </div>
          <div class="grp">Ferramentas</div>
          <div v-for="t in navTools" :key="t.label" class="item" :class="{ active: t.label === 'Chat IA' }">
            <UIcon :name="t.icon" class="ic" />
            <span>{{ t.label }}</span>
            <span v-if="t.badge" class="badge">{{ t.badge }}</span>
          </div>
        </div>
        <div class="d-side-footer">
          <div class="av">A</div>
          <div>
            <div>Andre Silva</div>
            <div class="d-mut" style="font-size:11px; margin-top:1px;">Premium · 2 anos</div>
          </div>
        </div>
      </div>

      <!-- MAIN -->
      <div class="d-main">
        <div class="d-topbar">
          <div class="d-search">
            <UIcon name="i-lucide-search" class="size-4" />
            <span>Buscar conversas, ativos, noticias…</span>
            <span class="kbd">⌘ K</span>
          </div>
          <div class="right">
            <div class="d-iconbtn"><UIcon name="i-lucide-bell" class="size-4" /></div>
            <div class="d-iconbtn"><UIcon name="i-lucide-settings" class="size-4" /></div>
          </div>
        </div>

        <div class="d-content chat-content">
          <!-- GREET -->
          <div class="d-greet chat-greet-dt">
            <div class="greet-brand">
              <span class="greet-seal">
                <UIcon name="i-lucide-sparkles" class="size-4" style="color:#fff;" />
              </span>
              <div>
                <div class="greet-title-row">
                  <div class="h">Redent.IA</div>
                  <span v-if="mode === 'max'" class="max-badge-dt">MAX</span>
                </div>
                <div class="d-mut greet-sub-dt"
                     :style="{ color: mode === 'max' ? '#B7873A' : 'rgba(15,15,14,.55)' }">
                  {{ mode === 'max' ? 'Pensamento profundo · analise sem limites' : 'Pergunte algo sobre sua carteira' }}
                </div>
              </div>
            </div>
            <div class="actions">
              <div class="d-btn d-btn-ghost">Historico</div>
              <button class="mode-selector-dt" @click="toggleMode">
                {{ mode === 'max' ? 'MAX' : 'Basic' }}
                <UIcon name="i-lucide-chevron-down" class="size-3" />
              </button>
            </div>
          </div>

          <!-- 2 COLS: MAIN CHAT + RIGHT HISTORY -->
          <div class="chat-grid-dt">
            <div class="chat-main-dt">
              <!-- Data cards row -->
              <div class="chat-data-row-dt">
                <div v-for="card in dataCards" :key="card.title"
                     class="d-card chat-data-dt"
                     :class="{ open: openedCards.has(card.title) }"
                     @click="toggleCard(card.title)">
                  <div class="chat-data-dt-head">
                    <div class="data-card-tag-row">
                      <span class="data-tag" :class="`tag-${card.tagTone}`">{{ card.tag }}</span>
                      <span class="data-card-title">{{ card.title }}</span>
                    </div>
                    <UIcon name="i-lucide-chevron-right" class="size-3 data-chevron"
                           :class="{ rotated: openedCards.has(card.title) }" />
                  </div>
                  <div class="data-card-value" :style="card.valueColor ? { color: card.valueColor } : {}">{{ card.value }}</div>
                  <div class="data-card-sub" :style="card.subColor ? { color: card.subColor } : {}">{{ card.sub }}</div>
                  <div v-if="openedCards.has(card.title)" class="data-card-body">
                    <div v-for="(a, i) in card.actions" :key="i" class="data-action">
                      <span>{{ a }}</span>
                      <UIcon name="i-lucide-arrow-right" class="size-3" :style="{ color: mode === 'max' ? '#B7873A' : 'rgba(15,15,14,.45)' }" />
                    </div>
                  </div>
                </div>
                <div class="movers-row-dt">
                  <div v-for="m in movers" :key="m.ticker" class="d-card mover-dt">
                    <span class="mover-tag" :class="`tag-${m.tone}`">{{ m.tag }}</span>
                    <div class="mover-ticker">{{ m.ticker }}</div>
                    <div class="mover-name">{{ m.name }}</div>
                    <div class="mover-delta" :style="{ color: m.tone === 'pos' ? '#0F8C4D' : '#C4413A' }">{{ m.delta }}</div>
                  </div>
                </div>
              </div>

              <!-- News row -->
              <div class="d-card news-card-dt">
                <div class="d-section-h">
                  <span class="title">Noticias do dia</span>
                  <span class="link">Ver todas →</span>
                </div>
                <div class="news-grid-dt">
                  <div v-for="n in news" :key="n.title" class="news-item-dt">
                    <div class="news-head">
                      <span class="news-source">{{ n.source.toUpperCase() }}</span>
                      <span class="news-time">{{ n.time }}</span>
                    </div>
                    <div class="news-title">{{ n.title }}</div>
                    <div class="news-foot">
                      <span v-for="t in n.tickers" :key="t" class="news-ticker">{{ t }}</span>
                      <span class="news-ask" :style="{ color: mode === 'max' ? '#B7873A' : 'rgba(15,15,14,.55)' }">
                        Perguntar
                        <UIcon name="i-lucide-chevron-right" class="size-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty state -->
              <div class="d-card empty-state-dt">
                <template v-if="mode === 'max'">
                  <div class="empty-h-max">
                    Boa tarde, <span class="greet-name-italic">Andre.</span>
                    <div class="empty-sub-max">Sua carteira preparou alguns dados. Toque em um card acima ou pergunte abaixo.</div>
                  </div>
                </template>
                <template v-else>
                  <div class="empty-h-basic">Ola, Andre</div>
                  <div class="empty-sub-basic">Toque em um card acima ou digite sua pergunta abaixo.</div>
                </template>
              </div>

              <!-- Input bar desktop -->
              <div class="chat-input-bar-dt">
                <div class="input-main-dt">
                  <span class="input-placeholder-dt">Pergunte algo sobre sua carteira</span>
                  <button class="send-btn-dt">
                    Enviar
                    <UIcon name="i-lucide-send" class="size-3" />
                  </button>
                </div>
                <div class="input-foot-dt">
                  <div class="input-pills">
                    <span v-for="p in suggPills" :key="p" class="sugg-pill">{{ p }}</span>
                  </div>
                  <span class="mode-label">{{ mode === 'max' ? 'MODO MAX' : 'BASIC' }}</span>
                </div>
              </div>
            </div>

            <!-- Right history -->
            <div class="d-card history-dt">
              <div class="d-section-h">
                <span class="title">Conversas</span>
                <span class="link">+ Nova</span>
              </div>
              <div class="history-label">Historico recente</div>
              <div class="conv-list">
                <div v-for="(c, i) in convs" :key="c.title"
                     class="conv-row" :class="{ active: i === 0 }">
                  <span class="conv-title">{{ c.title }}</span>
                  <span class="conv-time">{{ c.time }}</span>
                </div>
              </div>
              <div class="history-footer">
                {{ mode === 'max' ? 'Mensagens ilimitadas · MAX' : '8/20 mensagens · gratis' }}
              </div>
              <div v-if="mode !== 'max'" class="activate-max">
                <UIcon name="i-lucide-star" class="size-3" />
                <span class="activate-label">Ativar MAX</span>
                <UIcon name="i-lucide-chevron-right" class="size-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({ layout: false })

const mode = ref<'basic' | 'max'>('basic')
const openedCards = ref<Set<string>>(new Set())

function toggleMode() {
  mode.value = mode.value === 'max' ? 'basic' : 'max'
}
function toggleCard(title: string) {
  if (openedCards.value.has(title)) openedCards.value.delete(title)
  else openedCards.value.add(title)
  // trigger reactivity
  openedCards.value = new Set(openedCards.value)
}

const navMain = [
  { label: 'Inicio',     icon: 'i-lucide-house' },
  { label: 'Carteira',   icon: 'i-lucide-wallet' },
  { label: 'Raio-X',     icon: 'i-lucide-radar', badge: 'novo' },
  { label: 'Calendario', icon: 'i-lucide-calendar' },
  { label: 'Carta',      icon: 'i-lucide-mail' },
]
const navTools = [
  { label: 'Chat IA',       icon: 'i-lucide-sparkles', badge: '2' },
  { label: 'Calculadoras',  icon: 'i-lucide-calculator' },
  { label: 'Rankings',      icon: 'i-lucide-trophy' },
  { label: 'Setores',       icon: 'i-lucide-grid-2x2' },
  { label: 'Guias',         icon: 'i-lucide-book' },
]

const dataCards = [
  {
    tag: 'HOJE', tagTone: 'ink', title: 'Patrimonio',
    value: 'R$ 505.206,63', valueColor: '',
    sub: '↓ 0,66% · −R$ 3.370 hoje', subColor: '#C4413A',
    actions: ['Por que caiu hoje?', 'Como melhorar?', 'Vale aportar agora?'],
  },
  {
    tag: 'MAIO', tagTone: 'pos', title: 'Proventos do mes',
    value: '+ R$ 487', valueColor: '#0F8C4D',
    sub: '7 pagamentos · prox. BBAS3 em 3 dias', subColor: '',
    actions: ['Quais ativos pagaram?', 'Posso ganhar mais com FIIs?', 'Tributacao dos proventos'],
  },
]

const movers = [
  { tag: 'ALTA', tone: 'pos', ticker: 'PETR4', name: 'Petrobras', delta: '+2,14%' },
  { tag: 'QUEDA', tone: 'neg', ticker: 'ITSA4', name: 'Itausa', delta: '−2,41%' },
]

const news = [
  { time: '2h', source: 'InfoMoney', title: 'Brent dispara 3,2% e reaviva tese de Petrobras', tickers: ['PETR4'] },
  { time: '5h', source: 'Valor', title: 'Curva de juros longa abre apos ata do Copom', tickers: ['ITSA4', 'CPLE3'] },
  { time: '6h', source: 'Bloomberg', title: 'Vacancia logistica cai a 9% no trimestre', tickers: ['HGLG11', 'KNRI11'] },
]

const allSuggestions = [
  { text: 'Como minha carteira esta vs IBOV em 12m?', icon: 'i-lucide-trending-up', maxOnly: false },
  { text: 'Quais 3 mudancas aumentariam meu DY?', icon: 'i-lucide-dollar-sign', maxOnly: false },
  { text: 'Simule cenario de Selic em 11%', icon: 'i-lucide-globe', maxOnly: true },
  { text: 'Compare meu portfolio com perfil top 10%', icon: 'i-lucide-trophy', maxOnly: true },
]
const visibleSuggestions = computed(() =>
  allSuggestions.filter(s => mode.value === 'max' || !s.maxOnly)
)

const suggPills = ['Como esta vs IBOV?', 'Proximos proventos', 'Onde diversificar?']

const convs = [
  { title: 'Por que ITSA4 caiu hoje?', time: 'agora' },
  { title: 'Vale aportar mais em FIIs?', time: 'ontem' },
  { title: 'Comparar com IBOV 12m', time: '2d' },
  { title: 'Tese de PETR4 hoje', time: '3d' },
  { title: 'Como funciona a Selic?', time: '1 sem' },
  { title: 'Tributacao dos dividendos', time: '2 sem' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&family=Newsreader:ital,wght@1,400;1,500&display=swap');

.v4 { min-height: 100vh; background: #F8F6F1; }

/* ============ TOGGLE mobile/desktop ============ */
.phone.mercury.chat { display: block; }
.dt.mercury-dt.chat-dt { display: none; }
@media (min-width: 1024px) {
  .phone.mercury.chat { display: none; }
  .dt.mercury-dt.chat-dt { display: flex; }
}

/* ============ MOBILE SHELL ============ */
.phone.mercury.chat {
  background: #F8F6F1;
  color: #0F0F0E;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  min-height: 100vh;
  position: relative;
  max-width: 480px;
  margin: 0 auto;
}
/* MAX mode parchment background */
.phone.mercury.chat.chat-max {
  background:
    radial-gradient(ellipse 100% 50% at 50% 0%, rgba(183,135,58,.10), transparent 70%),
    radial-gradient(ellipse 80% 40% at 100% 100%, rgba(91,74,122,.08), transparent 70%),
    #FAF6EA;
}

/* APPBAR */
.chat-appbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 22px 22px 16px;
  position: sticky; top: 0; z-index: 30;
  background: rgba(248,246,241,.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.chat-max .chat-appbar { background: rgba(250,246,234,.92); }
.appbar-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.back-btn {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.7);
  display: grid; place-items: center; cursor: pointer; flex-shrink: 0;
  text-decoration: none;
}
.brand-seal {
  width: 28px; height: 28px; border-radius: 999px;
  background: #0F0F0E; color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.chat-max .brand-seal {
  background: linear-gradient(135deg, #D1A75A, #8A6018);
  box-shadow: 0 2px 10px rgba(183,135,58,.4);
}
.brand-meta { min-width: 0; }
.brand-title {
  font-size: 16px; font-weight: 600; letter-spacing: -.01em; line-height: 1;
  display: flex; align-items: center; gap: 7px;
}
.max-badge {
  padding: 2px 7px; border-radius: 5px;
  background: linear-gradient(135deg, #D1A75A, #8A6018);
  color: #FAF6EA;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; font-weight: 700; letter-spacing: .12em;
}
.brand-sub {
  font-size: 11px;
  color: rgba(15,15,14,.5);
  margin-top: 2px; font-weight: 500;
}
.chat-max .brand-sub { color: #B7873A; }

.mode-selector {
  padding: 6px 10px; border-radius: 8px;
  background: rgba(15,15,14,.04);
  color: rgba(15,15,14,.6);
  font-size: 11px; font-weight: 600;
  display: flex; align-items: center; gap: 5px;
  cursor: pointer; border: 0; font-family: inherit;
}
.chat-max .mode-selector {
  background: rgba(183,135,58,.10);
  color: #B7873A;
}

/* SCROLL */
.chat-scroll {
  padding: 4px 0 200px;
}
.chat-scroll::-webkit-scrollbar { display: none; }

/* GREET */
.chat-greet { padding: 8px 22px 18px; }
.greet-h {
  font-size: 24px; font-weight: 600; letter-spacing: -.02em; line-height: 1.2;
}
.greet-name-italic {
  color: #B7873A; font-family: 'Newsreader', serif;
  font-style: italic; font-weight: 500;
}
.greet-h-basic { font-size: 20px; font-weight: 600; letter-spacing: -.018em; }
.greet-s { font-size: 13px; color: rgba(15,15,14,.55); margin-top: 6px; font-weight: 400; }

/* SECTION header */
.m-section.chat-section {
  padding: 20px 22px 12px;
  display: flex; justify-content: space-between; align-items: baseline;
}
.m-section.chat-section .title {
  font-size: 15px; font-weight: 600; letter-spacing: -.01em;
}
.m-section.chat-section .link {
  font-size: 13px; color: #0F0F0E; font-weight: 500; cursor: pointer;
}

/* CHAT CARD base */
.chat-card {
  background: #FFFFFF;
  border: 1px solid rgba(15,15,14,.05);
  border-radius: 14px;
}
.chat-max .chat-card {
  border-color: rgba(183,135,58,.18);
  box-shadow:
    0 1px 0 rgba(15,15,14,.02),
    0 8px 28px -16px rgba(183,135,58,.18);
}

/* DATA CARDS (Patrimonio / Proventos) */
.data-card-wrap { padding: 0 16px 10px; }
.data-card {
  padding: 14px 16px;
  cursor: pointer;
}
.data-card-head {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
}
.data-card-meta { flex: 1; min-width: 0; }
.data-card-tag-row {
  display: flex; align-items: center; gap: 6px; margin-bottom: 6px;
}
.data-tag {
  padding: 2px 7px; border-radius: 4px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; font-weight: 700; letter-spacing: .1em;
}
.data-tag.tag-ink { background: rgba(15,15,14,.06); color: #0F0F0E; }
.data-tag.tag-pos { background: rgba(15,140,77,.10); color: #0F8C4D; }
.data-tag.tag-neg { background: rgba(196,65,58,.10); color: #C4413A; }
.data-card-title {
  font-size: 12px; font-weight: 500; color: rgba(15,15,14,.6);
}
.data-card-value {
  font-size: 22px; font-weight: 600; letter-spacing: -.022em;
  font-variant-numeric: tabular-nums; color: #0F0F0E;
}
.data-card-sub {
  font-size: 12px; color: rgba(15,15,14,.55);
  margin-top: 4px; font-variant-numeric: tabular-nums;
}
.data-chevron {
  color: rgba(15,15,14,.5);
  transition: transform .2s;
}
.data-chevron.rotated { transform: rotate(90deg); }

.data-card-body {
  margin-top: 14px; padding-top: 14px;
  border-top: 1px solid rgba(15,15,14,.06);
  display: flex; flex-direction: column; gap: 6px;
}
.data-body-label {
  font-size: 10px; font-weight: 600; letter-spacing: .1em;
  text-transform: uppercase; color: rgba(15,15,14,.45);
  margin-bottom: 4px;
}
.data-action {
  padding: 10px 12px; border-radius: 9px;
  background: rgba(15,15,14,.03);
  font-size: 13px; font-weight: 500; color: #0F0F0E;
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  cursor: pointer;
}

/* MOVER cards (altas/baixas) */
.movers-row {
  padding: 0 16px 6px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
}
.mover-card {
  padding: 14px;
  display: flex; flex-direction: column;
  cursor: pointer;
}
.mover-tag {
  padding: 2px 7px; border-radius: 4px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; font-weight: 700; letter-spacing: .1em;
  align-self: flex-start;
}
.mover-tag.tag-pos { background: rgba(15,140,77,.10); color: #0F8C4D; }
.mover-tag.tag-neg { background: rgba(196,65,58,.10); color: #C4413A; }
.mover-ticker { font-size: 15px; font-weight: 600; margin-top: 10px; }
.mover-name { font-size: 11px; color: rgba(15,15,14,.5); margin-top: 1px; }
.mover-delta {
  font-size: 18px; font-weight: 600; letter-spacing: -.018em;
  margin-top: 8px; font-variant-numeric: tabular-nums;
}
.mover-ask {
  margin-top: 10px; padding-top: 10px;
  border-top: 1px solid rgba(15,15,14,.05);
  font-size: 11px; font-weight: 500;
  display: flex; align-items: center; gap: 5px;
}

/* NEWS */
.news-scroll {
  display: flex; gap: 10px;
  padding: 0 16px;
  overflow-x: auto;
  scrollbar-width: none;
}
.news-scroll::-webkit-scrollbar { display: none; }
.news-card {
  flex-shrink: 0; min-width: 220px; max-width: 220px;
  padding: 14px;
  cursor: pointer;
  display: flex; flex-direction: column;
}
.news-head {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 10px;
}
.news-source {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; letter-spacing: .12em; font-weight: 700;
  color: rgba(15,15,14,.6);
}
.news-time {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; color: rgba(15,15,14,.4);
}
.news-title {
  font-size: 13px; font-weight: 600; letter-spacing: -.005em;
  line-height: 1.3; flex: 1;
}
.news-foot {
  display: flex; gap: 5px; align-items: center;
  margin-top: 12px; padding-top: 10px;
  border-top: 1px solid rgba(15,15,14,.05);
}
.news-ticker {
  padding: 2px 6px; border-radius: 4px;
  background: rgba(15,15,14,.05); color: rgba(15,15,14,.65);
  font-size: 10px; font-weight: 600; letter-spacing: .02em;
}
.news-ask {
  margin-left: auto; font-size: 10px; font-weight: 600;
  display: flex; align-items: center; gap: 3px;
}

/* SUGGESTIONS */
.suggestions {
  padding: 0 16px; display: flex; flex-direction: column; gap: 8px;
}
.suggestion {
  background: #FFFFFF;
  border: 1px solid rgba(15,15,14,.05);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex; align-items: center; gap: 12px;
  cursor: pointer;
}
.suggestion.max-only {
  border-color: rgba(183,135,58,.25);
}
.chat-max .suggestion {
  border-color: rgba(183,135,58,.18);
  box-shadow:
    0 1px 0 rgba(15,15,14,.02),
    0 8px 28px -16px rgba(183,135,58,.18);
}
.suggestion-ic {
  width: 30px; height: 30px; border-radius: 8px;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.7);
  display: grid; place-items: center; flex-shrink: 0;
}
.suggestion-ic.max-only-ic {
  background: linear-gradient(135deg, rgba(209,167,90,.22), rgba(138,96,24,.22));
  color: #B7873A;
}
.suggestion-text {
  flex: 1; font-size: 13px; font-weight: 500;
  letter-spacing: -.003em; line-height: 1.3;
}
.suggestion-badge {
  padding: 1px 6px; border-radius: 4px;
  background: linear-gradient(135deg, #D1A75A, #8A6018);
  color: #FAF6EA;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 8px; font-weight: 700; letter-spacing: .12em;
}

/* INPUT BAR */
.chat-input-bar {
  position: fixed; left: 16px; right: 16px; bottom: 18px;
  max-width: 448px; margin: 0 auto;
  background: #FFFFFF;
  border: 1px solid rgba(15,15,14,.08);
  border-radius: 18px;
  padding: 14px 16px;
  display: flex; flex-direction: column; gap: 10px;
  color: #0F0F0E;
  box-shadow: 0 4px 16px -8px rgba(15,15,14,.12);
  z-index: 15;
}
.chat-max .chat-input-bar {
  background: linear-gradient(180deg, rgba(15,15,14,.95), rgba(15,15,14,1));
  border-color: rgba(183,135,58,.30);
  color: #FAF6EA;
  box-shadow: 0 12px 32px -10px rgba(15,15,14,.3);
}
.input-main {
  display: flex; align-items: center; gap: 10px;
}
.input-placeholder {
  font-size: 14px; color: rgba(15,15,14,.4);
  font-weight: 500; flex: 1;
}
.chat-max .input-placeholder { color: rgba(250,246,234,.45); }
.send-btn {
  width: 32px; height: 32px; border-radius: 50%;
  background: #0F0F0E; color: #FFFFFF;
  display: grid; place-items: center;
  cursor: pointer; border: 0;
}
.chat-max .send-btn {
  background: linear-gradient(135deg, #D1A75A, #B7873A);
  color: #0F0F0E;
  box-shadow: 0 2px 10px rgba(183,135,58,.4);
}
.input-foot {
  display: flex; align-items: center; gap: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(15,15,14,.06);
}
.chat-max .input-foot { border-top-color: rgba(255,255,255,.08); }
.input-foot-spacer { flex: 1; }
.mode-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; letter-spacing: .1em; font-weight: 600;
  color: rgba(15,15,14,.4);
}
.chat-max .mode-label { color: rgba(183,135,58,.85); }


/* ============ DESKTOP SHELL ============ */
.dt.mercury-dt.chat-dt {
  background: #F8F6F1;
  color: #0F0F0E;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  min-height: 100vh;
  position: relative;
}
.dt.mercury-dt.chat-dt.chat-max-dt {
  background:
    radial-gradient(ellipse 100% 50% at 50% 0%, rgba(183,135,58,.10), transparent 70%),
    radial-gradient(ellipse 80% 40% at 100% 100%, rgba(91,74,122,.08), transparent 70%),
    #FAF6EA;
}
.dt .d-mut { color: rgba(15,15,14,.55); }

/* Sidebar */
.dt .d-side {
  width: 240px; flex-shrink: 0;
  padding: 24px 20px;
  display: flex; flex-direction: column; gap: 24px;
  border-right: 1px solid rgba(15,15,14,.06);
  position: sticky; top: 0;
  height: 100vh;
}
.dt .d-side .d-brand {
  display: flex; align-items: center; gap: 10px;
  padding: 0 4px;
}
.dt .d-side .d-brand-mark {
  width: 26px; height: 26px; border-radius: 8px;
  background: #0F0F0E; color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700;
}
.dt .d-side .d-brand-mark img { width: 20px; height: 20px; display: block; }
.dt .d-side .d-brand .nm {
  font-size: 16px; font-weight: 600; letter-spacing: -.01em;
}
.dt .d-side .d-nav { display: flex; flex-direction: column; gap: 2px; }
.dt .d-side .d-nav .grp {
  font-size: 10px; font-weight: 600;
  letter-spacing: .12em; text-transform: uppercase;
  color: rgba(15,15,14,.4);
  padding: 14px 8px 6px;
}
.dt .d-side .d-nav .item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 8px;
  font-size: 13.5px; font-weight: 500; color: rgba(15,15,14,.65);
  cursor: pointer; transition: all .15s;
}
.dt .d-side .d-nav .item:hover { background: rgba(15,15,14,.04); color: #0F0F0E; }
.dt .d-side .d-nav .item.active {
  background: #0F0F0E; color: #FFFFFF;
}
.dt .d-side .d-nav .item .ic { width: 18px; height: 18px; flex-shrink: 0; opacity: .85; }
.dt .d-side .d-nav .item .badge {
  margin-left: auto;
  padding: 1px 6px; border-radius: 5px;
  background: rgba(15,15,14,.08); color: rgba(15,15,14,.7);
  font-size: 10px; font-weight: 600;
}
.dt .d-side .d-nav .item.active .badge {
  background: rgba(255,255,255,.15); color: #fff;
}
.dt .d-side-footer {
  margin-top: auto;
  padding: 14px 10px;
  border-top: 1px solid rgba(15,15,14,.06);
  display: flex; align-items: center; gap: 10px;
  font-size: 13px;
}
.dt .d-side-footer .av {
  width: 32px; height: 32px; border-radius: 50%;
  background: #0F0F0E; color: #fff;
  display: grid; place-items: center;
  font-weight: 600; font-size: 13px; flex-shrink: 0;
}

/* MAIN */
.dt .d-main {
  flex: 1; min-width: 0;
  overflow-y: auto; overflow-x: hidden;
}
.dt .d-main::-webkit-scrollbar { width: 0; }
.dt .d-topbar {
  padding: 20px 32px;
  display: flex; align-items: center; gap: 16px;
  border-bottom: 1px solid rgba(15,15,14,.06);
}
.dt .d-search {
  flex: 1; display: flex; align-items: center; gap: 10px;
  padding: 9px 14px; border-radius: 10px;
  background: rgba(15,15,14,.03);
  font-size: 13px; color: rgba(15,15,14,.45);
  max-width: 480px;
}
.dt .d-search .kbd {
  margin-left: auto;
  padding: 2px 6px; border-radius: 5px;
  font-family: 'IBM Plex Mono', monospace; font-size: 10px;
  background: rgba(15,15,14,.06); color: rgba(15,15,14,.6);
}
.dt .d-topbar .right {
  margin-left: auto;
  display: flex; align-items: center; gap: 10px;
}
.dt .d-iconbtn {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(15,15,14,.04);
  display: grid; place-items: center; color: rgba(15,15,14,.65);
  cursor: pointer; transition: all .15s;
}

/* CONTENT */
.chat-content {
  padding: 24px 32px 32px;
  display: flex; flex-direction: column; gap: 16px;
}
.chat-greet-dt {
  display: flex; justify-content: space-between; align-items: flex-end;
  padding-bottom: 4px;
}
.greet-brand {
  display: flex; align-items: center; gap: 14px;
}
.greet-seal {
  width: 36px; height: 36px; border-radius: 999px;
  background: #0F0F0E; color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.chat-max-dt .greet-seal {
  background: linear-gradient(135deg, #D1A75A, #8A6018);
  box-shadow: 0 2px 10px rgba(183,135,58,.4);
}
.greet-title-row {
  display: flex; align-items: center; gap: 10px;
}
.dt .d-greet .h {
  font-size: 22px; font-weight: 600; letter-spacing: -.022em;
}
.max-badge-dt {
  padding: 3px 8px; border-radius: 6px;
  background: linear-gradient(135deg, #D1A75A, #8A6018);
  color: #FAF6EA;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; font-weight: 700; letter-spacing: .12em;
}
.greet-sub-dt { font-size: 12px; margin-top: 3px; }
.chat-greet-dt .actions { display: flex; gap: 10px; }
.dt .d-btn {
  padding: 9px 16px; border-radius: 9px;
  background: #0F0F0E; color: #fff;
  font-size: 13px; font-weight: 500; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
}
.dt .d-btn-ghost { background: rgba(15,15,14,.04); color: #0F0F0E; }
.dt .d-btn-ghost:hover { background: rgba(15,15,14,.08); }
.mode-selector-dt {
  padding: 9px 14px; border-radius: 9px;
  background: rgba(15,15,14,.04); color: #0F0F0E;
  font-size: 13px; font-weight: 600;
  display: inline-flex; align-items: center; gap: 6px;
  cursor: pointer; border: 0; font-family: inherit;
}
.chat-max-dt .mode-selector-dt {
  background: rgba(183,135,58,.10); color: #B7873A;
}

/* CHAT GRID — 2 cols (main + history) */
.chat-grid-dt {
  display: grid; grid-template-columns: 1fr 280px;
  gap: 14px;
}
.chat-main-dt {
  display: flex; flex-direction: column; gap: 14px; min-height: 0;
}

/* DESKTOP cards base */
.dt .d-card {
  background: #FFFFFF;
  border: 1px solid rgba(15,15,14,.05);
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 1px 0 rgba(15,15,14,.02), 0 8px 24px -16px rgba(15,15,14,.08);
}
.chat-max-dt .d-card {
  border-color: rgba(183,135,58,.18);
  box-shadow:
    0 1px 0 rgba(15,15,14,.02),
    0 8px 28px -16px rgba(183,135,58,.18);
}
.dt .d-section-h {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 12px;
}
.dt .d-section-h .title { font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
.dt .d-section-h .link { font-size: 13px; color: #0F0F0E; font-weight: 500; cursor: pointer; }

/* DATA row desktop: 2 cards Patrimonio/Proventos + 2 movers */
.chat-data-row-dt {
  display: grid; grid-template-columns: 1.4fr 1fr 1fr;
  gap: 10px;
}
.chat-data-dt {
  padding: 18px 20px;
  cursor: pointer;
}
.chat-data-dt-head {
  display: flex; align-items: center; justify-content: space-between;
}
.chat-data-dt .data-card-value {
  font-size: 24px; margin-top: 10px;
}
.movers-row-dt {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
}
.mover-dt {
  padding: 14px;
  cursor: pointer;
  display: flex; flex-direction: column;
}
.mover-dt .mover-ticker { font-size: 13px; margin-top: 8px; }
.mover-dt .mover-name { font-size: 10px; }
.mover-dt .mover-delta { font-size: 16px; margin-top: 6px; }

/* NEWS desktop */
.news-card-dt {
  padding: 18px 22px;
  display: flex; flex-direction: column; gap: 14px;
}
.news-grid-dt {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
}
.news-item-dt {
  background: rgba(15,15,14,.025);
  border: 1px solid rgba(15,15,14,.04);
  border-radius: 12px; padding: 14px 16px;
  cursor: pointer;
  display: flex; flex-direction: column;
}
.news-item-dt .news-title { flex: 1; }
.news-item-dt .news-foot {
  margin-top: 10px; padding-top: 0; border-top: 0;
}
.news-item-dt .news-ticker {
  background: rgba(15,15,14,.06);
}

/* EMPTY state desktop */
.empty-state-dt {
  padding: 24px 28px;
  flex: 1;
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  text-align: center; min-height: 120px;
}
.empty-h-max {
  font-size: 22px; font-weight: 600; letter-spacing: -.018em;
  max-width: 480px; line-height: 1.3;
}
.empty-sub-max {
  font-size: 14px; color: rgba(15,15,14,.55);
  font-weight: 400; margin-top: 8px;
}
.empty-h-basic {
  font-size: 18px; font-weight: 600; letter-spacing: -.015em;
}
.empty-sub-basic {
  font-size: 13px; color: rgba(15,15,14,.55); margin-top: 6px;
  max-width: 460px;
}

/* INPUT BAR desktop */
.chat-input-bar-dt {
  background: #FFFFFF;
  border: 1px solid rgba(15,15,14,.08);
  border-radius: 16px;
  padding: 16px 18px;
  display: flex; flex-direction: column; gap: 10px;
  color: #0F0F0E;
  box-shadow: 0 4px 16px -10px rgba(15,15,14,.08);
}
.chat-max-dt .chat-input-bar-dt {
  background: linear-gradient(180deg, #1A1A1A, #0F0F0E);
  border-color: rgba(183,135,58,.30);
  color: #FAF6EA;
  box-shadow: 0 12px 32px -10px rgba(15,15,14,.3);
}
.input-main-dt {
  display: flex; align-items: center; gap: 12px;
}
.input-placeholder-dt {
  font-size: 15px; color: rgba(15,15,14,.4);
  font-weight: 500; flex: 1;
}
.chat-max-dt .input-placeholder-dt { color: rgba(250,246,234,.45); }
.send-btn-dt {
  padding: 8px 18px; border-radius: 10px;
  background: #0F0F0E; color: #FFFFFF;
  font-size: 13px; font-weight: 600;
  display: inline-flex; align-items: center; gap: 6px;
  cursor: pointer; border: 0; font-family: inherit;
}
.chat-max-dt .send-btn-dt {
  background: linear-gradient(135deg, #D1A75A, #B7873A);
  color: #0F0F0E;
}
.input-foot-dt {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid rgba(15,15,14,.06);
}
.chat-max-dt .input-foot-dt { border-top-color: rgba(255,255,255,.08); }
.input-pills { display: flex; gap: 6px; }
.sugg-pill {
  padding: 5px 11px; border-radius: 999px;
  background: rgba(15,15,14,.04);
  color: rgba(15,15,14,.6);
  font-size: 11px; font-weight: 500; cursor: pointer;
}
.chat-max-dt .sugg-pill {
  background: rgba(255,255,255,.06);
  color: rgba(250,246,234,.7);
}

/* HISTORY dt */
.history-dt {
  padding: 18px 18px;
  display: flex; flex-direction: column;
}
.history-label {
  font-size: 11px; font-weight: 500;
  color: rgba(15,15,14,.5); margin-top: 4px;
}
.conv-list {
  margin-top: 14px; flex: 1; overflow-y: auto; min-height: 0;
}
.conv-row {
  padding: 10px 10px; border-radius: 8px;
  margin-bottom: 2px; cursor: pointer;
  display: flex; justify-content: space-between; align-items: baseline; gap: 8px;
}
.conv-row.active { background: rgba(15,15,14,.05); }
.conv-title {
  font-size: 12px; font-weight: 500; color: rgba(15,15,14,.7);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
}
.conv-row.active .conv-title { font-weight: 600; color: #0F0F0E; }
.conv-time {
  font-size: 10px; color: rgba(15,15,14,.45);
  flex-shrink: 0;
}
.history-footer {
  font-size: 10px; font-weight: 500;
  color: rgba(15,15,14,.5);
  margin-top: 18px; padding: 12px 0 0;
  border-top: 1px solid rgba(15,15,14,.05);
}
.activate-max {
  margin-top: 10px; padding: 10px 12px; border-radius: 10px;
  background: linear-gradient(135deg, rgba(209,167,90,.12), rgba(138,96,24,.12));
  border: 1px solid rgba(183,135,58,.25);
  font-size: 12px; color: #8A6018;
  display: flex; align-items: center; gap: 8px; cursor: pointer;
}
.activate-label { flex: 1; font-weight: 500; }
</style>

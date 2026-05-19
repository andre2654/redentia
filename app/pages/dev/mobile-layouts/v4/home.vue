<!--
  V4 — Mercury Bank (port direto do Figma HTML).

  Estratégia: 2 shells separados (mobile + desktop) com os EXATOS
  namespaces do Figma:
    - `.phone.mercury` + `.m-*` para < 1024px
    - `.dt.mercury-dt` + `.d-*` para ≥ 1024px

  CSS é copy-paste IDÊNTICO dos blocos embedded dos arquivos
  `Home _ Mobile.html` e `Home _ Desktop.html`. Apenas adaptado:
    - Removido width/height fixos (388x812 / 1440x900) pra responder ao viewport
    - `.m-tabbar position:absolute` → `position:fixed` (shell não é phone simulator)
    - Toggle de visibility entre mobile/desktop via @media
-->
<template>
  <div class="v4">

    <!-- ============ MOBILE SHELL (.phone.mercury) ============ -->
    <div class="phone mercury">
      <div class="m-appbar">
        <div class="m-appbar-brand">
          <span class="m-seal"><img src="/brand/logo-icon.svg" alt="Redentia" /></span>
          <span>Redentia</span>
        </div>
        <div class="m-appbar-icons">
          <button class="m-iconbtn m-iconbtn-circle"><UIcon name="i-lucide-search" class="size-5" /></button>
          <button class="m-iconbtn m-iconbtn-circle"><UIcon name="i-lucide-bell" class="size-5" /></button>
        </div>
      </div>

      <div class="m-scroll">

        <!-- GREET -->
        <div class="m-greet">
          <div class="h">Boa tarde, André</div>
          <div class="s">Sua carteira encerrou em queda hoje</div>
        </div>

        <!-- PATRIMÔNIO CARD -->
        <div class="m-card m-card-lg">
          <div class="m-label">Patrimônio total</div>
          <div class="m-num-hero">R$ 505.206<span class="dec">,63</span></div>
          <div class="m-patrim-delta-row">
            <span class="m-delta-chip neg">↓ 0,66%</span>
            <span class="m-mut">− R$ 3.370,97 hoje</span>
          </div>
          <svg viewBox="0 0 400 90" preserveAspectRatio="none" class="m-patrim-chart">
            <defs>
              <linearGradient id="mPatGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#0F8C4D" stop-opacity="0.18" />
                <stop offset="100%" stop-color="#0F8C4D" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,76 L20,74 L40,70 L60,72 L80,64 L100,68 L120,58 L140,54 L160,52 L180,46 L200,48 L220,40 L240,42 L260,34 L280,30 L300,26 L320,22 L340,18 L360,14 L380,10 L400,8 L400,90 L0,90 Z"
                  fill="url(#mPatGrad)" />
            <path d="M0,76 L20,74 L40,70 L60,72 L80,64 L100,68 L120,58 L140,54 L160,52 L180,46 L200,48 L220,40 L240,42 L260,34 L280,30 L300,26 L320,22 L340,18 L360,14 L380,10 L400,8"
                  fill="none" stroke="#0F8C4D" stroke-width="1.5"
                  stroke-linejoin="round" stroke-linecap="round" />
            <circle cx="400" cy="8" r="3" fill="#0F8C4D" />
          </svg>
          <div class="m-patrim-seg-row">
            <div class="m-seg">
              <span v-for="p in periods" :key="p"
                    class="s" :class="{ active: activePeriod === p }"
                    @click="activePeriod = p">{{ p }}</span>
            </div>
          </div>
          <div class="m-patrim-reason">
            <span>
              <span>Caiu</span> por <strong>Juros Futuros</strong>
              <span class="m-mut"> e mais 4</span>
            </span>
            <span class="m-link">ver →</span>
          </div>
        </div>

        <!-- SHORTCUTS row — círculo + label embaixo, primeiro destacado -->
        <div class="m-shortcuts">
          <NuxtLink v-for="(s, i) in shortcuts" :key="s.label" :to="s.to" class="m-shortcut">
            <span class="m-shortcut-ic" :class="{ active: i === 0 }">
              <UIcon :name="s.icon" class="size-6" />
            </span>
            <span class="m-shortcut-lbl">{{ s.label }}</span>
          </NuxtLink>
        </div>

        <!-- SECTION Resumo -->
        <div class="m-section">
          <span class="title">Resumo</span>
          <span class="link">Tudo →</span>
        </div>
        <!-- 2 cards in a row (P&L mês + Notificações) -->
        <div class="m-resumo-row">
          <div class="m-card m-resumo-card">
            <div class="m-label">P&amp;L · mês</div>
            <div class="m-num-mid m-delta-pos">+ R$ 11.842</div>
            <div class="m-mut" style="font-size:12px; margin-top:4px;">+2,4% · 19 dias</div>
            <svg viewBox="0 0 200 40" preserveAspectRatio="none" class="m-pl-spark">
              <path d="M0,32 L18,30 L36,28 L54,29 L72,24 L90,22 L108,19 L126,17 L144,14 L162,11 L180,8 L200,5"
                    fill="none" stroke="#0F8C4D" stroke-width="1.5"
                    stroke-linejoin="round" stroke-linecap="round" />
            </svg>
          </div>
          <div class="m-card m-resumo-card">
            <div class="m-notif-head">
              <span class="m-label">Notificações</span>
              <span class="m-notif-badge">3</span>
            </div>
            <div class="m-notif-tag">MERCADO</div>
            <div class="m-notif-title">Selic subiu 50 bps</div>
            <div class="m-mut" style="font-size:12px; margin-top:4px;">Há 2 horas</div>
            <div class="m-notif-dots">
              <span class="m-notif-dot active" />
              <span class="m-notif-dot" />
              <span class="m-notif-dot" />
            </div>
          </div>
        </div>

        <!-- SECTION Por classe -->
        <div class="m-section">
          <span class="title">Por classe</span>
          <span class="link">Detalhes →</span>
        </div>
        <div class="m-card">
          <div class="m-stack-bar">
            <span class="m-stack-seg" style="width:41.1%; background:#1A8E5E;" />
            <span class="m-stack-seg" style="width:39.5%; background:#0F8C4D;" />
            <span class="m-stack-seg" style="width:19.5%; background:#5B4A7A;" />
          </div>
          <div v-for="(c, i) in composicao" :key="c.label" class="m-comp-row" :class="{ last: i === composicao.length - 1 }">
            <span class="m-comp-dot" :style="{ background: c.color }" />
            <div class="m-comp-meta">
              <div class="m-comp-name">{{ c.label }}</div>
              <div class="m-comp-sub">{{ c.pct }}% da carteira</div>
            </div>
            <div class="m-comp-right">
              <div class="m-comp-val">R$ {{ c.value }}</div>
              <div class="m-comp-delta">{{ c.delta }}%</div>
            </div>
          </div>
        </div>

        <!-- SECTION Próximos pagamentos -->
        <div class="m-section">
          <span class="title">Próximos pagamentos</span>
          <span class="link">Calendário →</span>
        </div>
        <div class="m-card">
          <div class="m-pay-hero">
            <div class="m-pay-date">
              <div class="m-pay-d">22</div>
              <div class="m-pay-m">MAI</div>
            </div>
            <div>
              <span class="m-label">Próximo · em 3 dias</span>
              <div class="m-pay-tk">BBAS3 · Dividendo</div>
              <div class="m-delta-pos m-pay-amount">+ R$ 84,20</div>
            </div>
          </div>
          <div class="m-pays">
            <div v-for="p in proxPayments" :key="p.day + p.ticker" class="m-pay-mini">
              <div class="m-pay-mini-date">
                <div>{{ p.day }}</div>
                <div>{{ p.month }}</div>
              </div>
              <div class="m-pay-mini-tk">{{ p.ticker }}</div>
              <div class="m-pay-mini-kind">{{ p.kind }}</div>
              <div class="m-pay-mini-amount">+{{ p.amount }}</div>
            </div>
          </div>
          <div class="m-pay-foot">
            <div>
              <div class="m-label">Total previsto · 30 dias</div>
              <div class="m-pay-total">+ R$ 662,50</div>
            </div>
            <span class="m-delta-chip pos">DY 7,8%</span>
          </div>
        </div>

        <!-- SECTION Insights -->
        <div class="m-section"><span class="title">Insights</span></div>
        <NuxtLink to="/dev/mobile-layouts/v4/raio-x" class="m-cta">
          <div>
            <div class="t">Raio-X da carteira</div>
            <div class="s">9 dimensões · atualizado há 3 dias</div>
          </div>
          <UIcon name="i-lucide-arrow-right" class="size-5" style="color:white;" />
        </NuxtLink>

        <!-- CTA Carta — editorial gold -->
        <NuxtLink to="/dev/mobile-layouts/v4/carta" class="m-cta-carta">
          <div class="m-cta-carta-meta">
            <span class="m-cta-carta-kicker">EDIÇÃO IV · MAIO 2026</span>
            <div class="m-cta-carta-title">Sua carta de <span class="ital">maio.</span></div>
            <div class="m-cta-carta-sub">O mês que petróleo ditou o ritmo</div>
          </div>
          <div class="m-cta-carta-arrow">
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </div>
        </NuxtLink>

        <!-- CTA Chat IA -->
        <NuxtLink to="/dev/mobile-layouts/v4/chat" class="m-cta-chat">
          <div class="m-cta-chat-icon">
            <UIcon name="i-lucide-sparkles" class="size-5" />
          </div>
          <div class="m-cta-chat-meta">
            <div class="m-cta-chat-title">Falar com Redent.IA</div>
            <div class="m-cta-chat-sub">Tire dúvidas sobre sua carteira</div>
          </div>
          <UIcon name="i-lucide-arrow-right" class="size-4" />
        </NuxtLink>

        <!-- SECTION Atividade recente -->
        <div class="m-section">
          <span class="title">Atividade recente</span>
          <span class="link">Tudo →</span>
        </div>
        <div class="m-card">
          <div v-for="(a, i) in atividades" :key="a.id" class="m-act-row" :class="{ last: i === atividades.length - 1 }">
            <span class="m-act-ic">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path v-if="a.dir === 'out'" d="M12 5v14M5 12l7 7 7-7" />
                <path v-else d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </span>
            <div class="m-act-meta">
              <div class="m-act-title">{{ a.title }}<span class="m-mut"> · </span>{{ a.ticker }}</div>
              <div class="m-act-when">{{ a.when }}</div>
            </div>
            <div class="m-act-amount" :class="a.dir === 'in' ? 'm-delta-pos' : ''">{{ a.amount }}</div>
          </div>
        </div>
      </div>

      <!-- TABBAR -->
      <div class="m-tabbar">
        <NuxtLink v-for="t in mobileTabs" :key="t.label"
                  :to="t.to"
                  class="m-tab"
                  :class="{ active: t.label === 'Início' }">
          <UIcon :name="t.icon" />
          <span class="lbl">{{ t.label }}</span>
        </NuxtLink>
      </div>
    </div>


    <!-- ============ DESKTOP SHELL (.dt.mercury-dt) ============ -->
    <div class="dt mercury-dt">
      <div class="d-side">
        <div class="d-brand">
          <span class="d-brand-mark"><img src="/brand/logo-icon.svg" alt="Redentia" /></span>
          <span class="nm">Redentia</span>
        </div>
        <div class="d-nav">
          <NuxtLink v-for="n in navMain" :key="n.label"
                    :to="n.to"
                    class="item"
                    :class="{ active: n.label === 'Início' }">
            <UIcon :name="n.icon" class="ic" />
            <span>{{ n.label }}</span>
            <span v-if="n.badge" class="badge">{{ n.badge }}</span>
          </NuxtLink>
          <div class="grp">Ferramentas</div>
          <NuxtLink v-for="t in navTools" :key="t.label" :to="t.to" class="item">
            <UIcon :name="t.icon" class="ic" />
            <span>{{ t.label }}</span>
            <span v-if="t.badge" class="badge">{{ t.badge }}</span>
          </NuxtLink>
        </div>
        <div class="d-side-footer">
          <div class="av">A</div>
          <div>
            <div>André Silva</div>
            <div class="d-mut" style="font-size:12px;">Premium · 2 anos</div>
          </div>
        </div>
      </div>

      <div class="d-main">
        <div class="d-topbar">
          <div class="d-search">
            <UIcon name="i-lucide-search" class="size-4" />
            <span>Buscar ativos, fundos, notícias…</span>
            <span class="kbd">⌘ K</span>
          </div>
          <div class="right">
            <div class="d-iconbtn"><UIcon name="i-lucide-bell" class="size-4" /></div>
            <div class="d-iconbtn"><UIcon name="i-lucide-settings" class="size-4" /></div>
          </div>
        </div>

        <div class="d-content">
          <!-- GREET -->
          <div class="d-greet">
            <div>
              <div class="d-mut">Ter. 19 de mai · 17:34</div>
              <div class="h">Boa tarde, André</div>
              <div class="s">Sua carteira encerrou em queda hoje</div>
            </div>
            <div class="actions">
              <div class="d-btn d-btn-ghost">Aportar</div>
              <div class="d-btn">Gerar Raio-X <UIcon name="i-lucide-arrow-right" class="size-3.5" /></div>
            </div>
          </div>

          <!-- ROW 1: Patrim card grande à esquerda (com chart embutido) + coluna lateral à direita (P&L stacked Notif) -->
          <div class="d-row-1">
            <!-- LEFT: Card de Patrimônio (tudo + chart dentro) -->
            <div class="d-card d-patrim-card">
              <div class="d-patrim-top">
                <div>
                  <div class="d-label">Patrimônio total</div>
                  <div class="d-num-hero">R$ 505.206<span class="dec">,63</span></div>
                  <div class="d-patrim-delta-row">
                    <span class="d-delta-chip neg">↓ 0,66%</span>
                    <span class="d-mut">− R$ 3.370,97 hoje</span>
                  </div>
                  <div class="d-patrim-reason">
                    <span class="d-neg">Caiu</span>
                    <span class="d-mut">por</span>
                    <strong>Juros Futuros</strong>
                    <span class="d-mut">e mais 4</span>
                    <span class="d-link">ver →</span>
                  </div>
                </div>
                <div class="d-seg">
                  <span v-for="p in periods" :key="p"
                        class="s" :class="{ active: activePeriod === p }"
                        @click="activePeriod = p">{{ p }}</span>
                </div>
              </div>
              <svg viewBox="0 0 800 240" preserveAspectRatio="none" class="d-patrim-chart">
                <defs>
                  <linearGradient id="dPatGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#0F8C4D" stop-opacity="0.18" />
                    <stop offset="100%" stop-color="#0F8C4D" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,200 L40,195 L80,180 L120,178 L160,160 L200,170 L240,150 L280,140 L320,138 L360,120 L400,128 L440,108 L480,110 L520,90 L560,80 L600,72 L640,60 L680,52 L720,40 L760,32 L800,28 L800,240 L0,240 Z"
                      fill="url(#dPatGrad)" />
                <path d="M0,200 L40,195 L80,180 L120,178 L160,160 L200,170 L240,150 L280,140 L320,138 L360,120 L400,128 L440,108 L480,110 L520,90 L560,80 L600,72 L640,60 L680,52 L720,40 L760,32 L800,28"
                      fill="none" stroke="#0F8C4D" stroke-width="2"
                      stroke-linejoin="round" stroke-linecap="round" />
                <circle cx="800" cy="28" r="4" fill="#0F8C4D" />
              </svg>
            </div>

            <!-- RIGHT: Stack [P&L · mês] + [Notificações] -->
            <div class="d-row-1-side">
              <div class="d-card d-side-card">
                <div class="d-label">P&amp;L · mês</div>
                <div class="d-num-mid d-pos">+ R$ 11.842</div>
                <div class="d-mut" style="font-size:12px; margin-top:4px;">+2,4% · 19 dias</div>
                <svg viewBox="0 0 400 60" preserveAspectRatio="none" class="d-pl-spark">
                  <defs>
                    <linearGradient id="dPlGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stop-color="#0F8C4D" stop-opacity="0.18" />
                      <stop offset="100%" stop-color="#0F8C4D" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,50 L36,48 L72,44 L108,46 L144,38 L180,34 L216,32 L252,28 L288,25 L324,21 L360,18 L400,12 L400,60 L0,60 Z"
                        fill="url(#dPlGrad)" />
                  <path d="M0,50 L36,48 L72,44 L108,46 L144,38 L180,34 L216,32 L252,28 L288,25 L324,21 L360,18 L400,12"
                        fill="none" stroke="#0F8C4D" stroke-width="1.5"
                        stroke-linejoin="round" stroke-linecap="round" />
                </svg>
              </div>
              <div class="d-card d-side-card">
                <div class="d-notif-head">
                  <span class="d-label">Notificações</span>
                  <span class="d-notif-badge">3</span>
                </div>
                <div class="d-notif-tag">MERCADO</div>
                <div class="d-notif-title">Selic subiu 50 bps</div>
                <div class="d-mut" style="font-size:12px; margin-top:2px;">Há 2 horas</div>
                <div class="d-notif-dots">
                  <span class="d-notif-dot active" />
                  <span class="d-notif-dot" />
                  <span class="d-notif-dot" />
                </div>
              </div>
            </div>
          </div>

          <!-- ROW 2: Por classe + Próximos pagamentos (2-col) -->
          <div class="d-grid-2col">
            <div class="d-card">
              <div class="d-section-h">
                <span class="title">Por classe</span>
                <span class="link">Detalhes →</span>
              </div>
              <div class="d-stack-bar">
                <span class="d-stack-seg" style="width:41.1%; background:#0F8C4D;" />
                <span class="d-stack-seg" style="width:39.5%; background:#22B26B;" />
                <span class="d-stack-seg" style="width:19.5%; background:#7C5BC0;" />
              </div>
              <div v-for="(c, i) in composicao" :key="c.label" class="d-comp-row">
                <div class="d-comp-meta">
                  <div class="d-comp-top">
                    <span class="d-comp-dot" :style="{ background: ['#0F8C4D', '#22B26B', '#7C5BC0'][i] }" />
                    <span class="d-comp-name">{{ c.label }}</span>
                    <span class="d-comp-pct d-mut">{{ c.pct }}%</span>
                  </div>
                  <div class="d-comp-val"><span class="d-mut">R$ </span>{{ c.value }}</div>
                </div>
                <svg viewBox="0 0 80 30" preserveAspectRatio="none" class="d-comp-spark">
                  <path :d="['M0,8 L13,10 L26,14 L40,11 L53,17 L66,21 L80,24', 'M0,6 L13,9 L26,12 L40,16 L53,20 L66,22 L80,25', 'M0,12 L13,9 L26,15 L40,14 L53,18 L66,16 L80,20'][i]"
                        fill="none" stroke="#C4413A" stroke-width="1.5"
                        stroke-linejoin="round" stroke-linecap="round" />
                </svg>
                <span class="d-comp-delta d-neg">{{ c.delta }}%</span>
              </div>
            </div>

            <div class="d-card">
              <div class="d-pay-hero">
                <div class="d-pay-date-sq">
                  <div class="d-pay-d">22</div>
                  <div class="d-pay-m">MAI</div>
                </div>
                <div class="d-pay-hero-meta">
                  <div class="d-pay-next-lbl">PRÓXIMO · EM 3 DIAS</div>
                  <div class="d-pay-tk">BBAS3 · Dividendo</div>
                  <div class="d-pay-amount d-pos">+ R$ 84,20</div>
                </div>
              </div>
              <div class="d-pays">
                <div v-for="p in proxPayments" :key="p.day + p.ticker" class="d-pay-mini">
                  <div class="d-pay-mini-date">
                    <span class="d-pay-mini-d">{{ p.day }}</span>
                    <span class="d-pay-mini-m">{{ p.month }}</span>
                  </div>
                  <div class="d-pay-mini-tk">{{ p.ticker }}</div>
                  <div class="d-pay-mini-kind d-mut">{{ p.kind }}</div>
                  <div class="d-pay-mini-amount">+{{ p.amount }}</div>
                </div>
              </div>
              <div class="d-pay-foot">
                <div>
                  <div class="d-label">Total · 30 dias</div>
                  <div class="d-pay-total">+ R$ 662,50</div>
                </div>
                <span class="d-delta-chip pos">DY 7,8%</span>
              </div>
            </div>
          </div>

          <!-- ROW 3: Atividade recente (full) -->
          <div class="d-card">
            <div class="d-section-h">
              <span class="title">Atividade recente</span>
              <span class="link">Tudo →</span>
            </div>
            <div v-for="(a, i) in atividades" :key="a.id" class="d-act-row" :style="i === atividades.length - 1 ? 'border-bottom:0;' : ''">
              <span class="d-act-ic" :class="`d-act-ic-${a.dir}`">
                <UIcon :name="a.icon" class="size-4" />
              </span>
              <div class="d-act-meta">
                <div class="d-act-title">{{ a.title }}</div>
                <div class="d-mut" style="font-size:12px; margin-top:2px;">{{ a.when }}</div>
              </div>
              <div class="d-act-detail">
                <div class="d-act-tk">{{ a.ticker }}</div>
                <div class="d-mut" style="font-size:12px; margin-top:2px;">{{ a.detail }}</div>
              </div>
              <div class="d-act-amount" :class="a.dir === 'in' ? 'd-pos' : ''">{{ a.amount }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: false })

const activeTab = ref('Início')
const activePeriod = ref('1S')
const periods = ['1D', '1S', '1M', '3M', '1A', 'Tudo']

const navMain = [
  { label: 'Início',     icon: 'i-lucide-house',    to: '/dev/mobile-layouts/v4/home' },
  { label: 'Carteira',   icon: 'i-lucide-wallet',   to: '/dev/mobile-layouts/v4/carteira' },
  { label: 'Raio-X',     icon: 'i-lucide-radar',    to: '/dev/mobile-layouts/v4/raio-x', badge: 'novo' },
  { label: 'Calendário', icon: 'i-lucide-calendar', to: '/dev/mobile-layouts/v4/home' },
  { label: 'Carta',      icon: 'i-lucide-mail',     to: '/dev/mobile-layouts/v4/carta' },
]
const navTools = [
  { label: 'Chat IA',       icon: 'i-lucide-sparkles',  to: '/dev/mobile-layouts/v4/chat', badge: '2' },
  { label: 'Calculadoras',  icon: 'i-lucide-calculator', to: '/dev/mobile-layouts/v4/calc' },
  { label: 'Rankings',      icon: 'i-lucide-trophy',     to: '/dev/mobile-layouts/v4/rankings' },
  { label: 'Setores',       icon: 'i-lucide-grid-2x2',   to: '/dev/mobile-layouts/v4/mercado' },
  { label: 'Guias',         icon: 'i-lucide-book',       to: '/dev/mobile-layouts/v4/home' },
]
const mobileTabs = [
  { label: 'Início',   icon: 'i-lucide-house',  to: '/dev/mobile-layouts/v4/home' },
  { label: 'Carteira', icon: 'i-lucide-wallet', to: '/dev/mobile-layouts/v4/carteira' },
  { label: 'Raio-X',   icon: 'i-lucide-radar',  to: '/dev/mobile-layouts/v4/raio-x' },
  { label: 'Mercado',  icon: 'i-lucide-globe',  to: '/dev/mobile-layouts/v4/mercado' },
]
const shortcuts = [
  { label: 'Chat IA',       icon: 'i-lucide-clock',       to: '/dev/mobile-layouts/v4/chat' },
  { label: 'Calculadoras',  icon: 'i-lucide-calculator',  to: '/dev/mobile-layouts/v4/calc' },
  { label: 'Calendário',    icon: 'i-lucide-calendar',    to: '/dev/mobile-layouts/v4/carteira' },
  { label: 'Rankings',      icon: 'i-lucide-trophy',      to: '/dev/mobile-layouts/v4/rankings' },
  { label: 'Setores',       icon: 'i-lucide-grid-2x2',    to: '/dev/mobile-layouts/v4/mercado' },
  { label: 'Guias',         icon: 'i-lucide-book',        to: '/dev/mobile-layouts/v4/home' },
  { label: 'Open Finance',  icon: 'i-lucide-building-2',  to: '/dev/mobile-layouts/v4/carteira' },
]
const composicao = [
  { label: 'Ações BR', pct: 41.1, value: '209.300', delta: '-0,90', color: '#1A8E5E' },
  { label: 'FIIs',     pct: 39.5, value: '201.300', delta: '-1,90', color: '#0F8C4D' },
  { label: 'Tesouro',  pct: 19.5, value: '99.300',  delta: '-0,60', color: '#5B4A7A' },
]
const proxPayments = [
  { day: '28', month: 'mai', ticker: 'PETR4',  kind: 'JCP', amount: '240,50' },
  { day: '05', month: 'jun', ticker: 'HGLG11', kind: 'Div', amount: '102,40' },
  { day: '12', month: 'jun', ticker: 'ITSA4',  kind: 'JCP', amount: '145,80' },
  { day: '18', month: 'jun', ticker: 'KNRI11', kind: 'Div', amount:  '89,60' },
]
const atividades = [
  { id: 1, dir: 'out', icon: 'i-lucide-shopping-cart',     title: 'Compra',   ticker: 'PETR4',  when: 'Hoje · 14:32',     detail: '100 cotas · R$ 38,42',    amount: '− R$ 3.842,00' },
  { id: 2, dir: 'in',  icon: 'i-lucide-coins',              title: 'Provento', ticker: 'HGLG11', when: 'Ontem',             detail: 'Rendimento mensal',        amount: '+ R$ 312,00' },
  { id: 3, dir: 'in',  icon: 'i-lucide-arrow-down-right',   title: 'Venda',    ticker: 'BBDC4',  when: '3 dias atrás',      detail: '50 cotas · R$ 24,10',     amount: '+ R$ 1.205,00' },
  { id: 4, dir: 'out', icon: 'i-lucide-piggy-bank',         title: 'Aporte',   ticker: 'CDB',    when: '5 dias atrás',      detail: 'Banco X · Liq. 2027',     amount: '− R$ 5.000,00' },
]
</script>

<style scoped>
/* ============ V4 — Fonts ============ */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.v4 { min-height: 100vh; background: #F8F6F1; }

/* ============ TOGGLE mobile/desktop ============ */
.phone.mercury { display: block; }
.dt.mercury-dt { display: none; }
@media (min-width: 1024px) {
  .phone.mercury { display: none; }
  .dt.mercury-dt { display: flex; }
}

/* ============ MOBILE SHELL (.phone.mercury) — copy do Figma ============ */
.phone.mercury {
  background: #F8F6F1;
  color: #0F0F0E;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  min-height: 100vh;
  position: relative;
  max-width: 480px;
  margin: 0 auto;
}
.phone.mercury .m-status {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 28px 6px;
  font-size: 15px; font-weight: 600; color: #0F0F0E;
}
.phone.mercury .m-status-icons { display: inline-flex; gap: 6px; }
.phone.mercury .m-appbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 24px 22px 16px;
  position: sticky; top: 0; z-index: 30;
  background: rgba(248,246,241,.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.phone.mercury .m-appbar-brand {
  display: inline-flex; align-items: center; gap: 10px;
  font-size: 16px; font-weight: 600;
}
.phone.mercury .m-seal {
  width: 32px; height: 32px; border-radius: 999px;
  background: #0F0F0E; color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
}
.phone.mercury .m-seal img { width: 20px; height: 20px; display: block; }
.phone.mercury .m-appbar-icons { display: inline-flex; gap: 8px; }
.phone.mercury .m-iconbtn {
  width: 40px; height: 40px; border-radius: 999px;
  background: transparent; color: #0F0F0E;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; border: 0;
}
.phone.mercury .m-iconbtn-circle {
  background: rgba(15,15,14,.04);
}
.phone.mercury .m-iconbtn:hover { background: rgba(15,15,14,.08); }

.phone.mercury .m-scroll {
  padding: 4px 0 120px;
}
.phone.mercury .m-scroll::-webkit-scrollbar { display: none; }
.phone.mercury .m-mut { color: rgba(15,15,14,.5); }
.phone.mercury .m-dim { color: rgba(15,15,14,.32); }
.phone.mercury .m-link { color: #0F0F0E; font-size: 13px; font-weight: 500; cursor: pointer; }

.phone.mercury .m-card {
  margin: 0 16px; padding: 22px 20px;
  background: #FFFFFF; border-radius: 20px;
  box-shadow: 0 1px 0 rgba(15,15,14,.04), 0 8px 24px -12px rgba(15,15,14,.08);
}
.phone.mercury .m-card-lg { padding: 24px 22px; }
.phone.mercury .m-card + .m-card { margin-top: 10px; }

.phone.mercury .m-greet { padding: 4px 22px 14px; }
.phone.mercury .m-greet .h {
  font-size: 24px; font-weight: 600;
  letter-spacing: -.02em; line-height: 1.1;
}
.phone.mercury .m-greet .s {
  font-size: 13px; color: rgba(15,15,14,.5); margin-top: 4px;
}

.phone.mercury .m-label {
  font-size: 11px; font-weight: 500;
  color: rgba(15,15,14,.5); letter-spacing: .01em;
}

.phone.mercury .m-num-hero {
  font-family: 'Inter', sans-serif; font-weight: 500;
  font-size: 38px; line-height: 1; letter-spacing: -.035em;
  font-variant-numeric: tabular-nums;
  margin: 8px 0 12px;
}
.phone.mercury .m-num-hero .dec { color: rgba(15,15,14,.32); }
.phone.mercury .m-num-mid {
  font-family: 'Inter', sans-serif; font-weight: 600;
  font-size: 24px; line-height: 1; letter-spacing: -.025em;
  font-variant-numeric: tabular-nums;
  margin-top: 10px;
}
.phone.mercury .m-num-row {
  font-family: 'Inter', sans-serif; font-weight: 500;
  font-size: 14px; font-variant-numeric: tabular-nums;
}

.phone.mercury .m-delta-pos { color: #0F8C4D; font-weight: 500; }
.phone.mercury .m-delta-neg { color: #C4413A; font-weight: 500; }
.phone.mercury .m-delta-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 9px; border-radius: 6px;
  font-size: 12px; font-weight: 500; font-variant-numeric: tabular-nums;
}
.phone.mercury .m-delta-chip.neg { background: rgba(196,65,58,.08); color: #C4413A; }
.phone.mercury .m-delta-chip.pos { background: rgba(15,140,77,.08); color: #0F8C4D; }
.phone.mercury .m-patrim-delta-row {
  display: inline-flex; align-items: center; gap: 10px; margin-top: 2px;
}
.phone.mercury .m-patrim-chart {
  width: 100%; height: 90px;
  display: block; margin: 16px 0 12px;
}
.phone.mercury .m-patrim-seg-row { display: flex; }
.phone.mercury .m-patrim-reason {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; margin-top: 14px;
  font-size: 13px; color: rgba(15,15,14,.7);
}
.phone.mercury .m-patrim-reason strong { color: #0F0F0E; font-weight: 600; }

.phone.mercury .m-seg {
  display: inline-flex; padding: 3px; gap: 2px;
  background: rgba(15,15,14,.04); border-radius: 10px;
}
.phone.mercury .m-seg .s {
  padding: 6px 11px; border-radius: 7px;
  font-size: 11px; font-weight: 500; color: rgba(15,15,14,.5);
  cursor: pointer; transition: all .15s;
}
.phone.mercury .m-seg .s.active {
  background: #fff; color: #0F0F0E;
  box-shadow: 0 1px 2px rgba(15,15,14,.06), 0 0 0 1px rgba(15,15,14,.04);
}

.phone.mercury .m-section {
  padding: 24px 22px 12px;
  display: flex; justify-content: space-between; align-items: baseline;
}
.phone.mercury .m-section .title {
  font-size: 15px; font-weight: 600; letter-spacing: -.01em;
}
.phone.mercury .m-section .link {
  font-size: 13px; color: #0F0F0E; font-weight: 500; cursor: pointer;
}

/* shortcuts — círculo grande + label embaixo */
.phone.mercury .m-shortcuts {
  display: flex; gap: 16px;
  padding: 20px 22px 8px;
  overflow-x: auto;
  scrollbar-width: none;
}
.phone.mercury .m-shortcuts::-webkit-scrollbar { display: none; }
.phone.mercury .m-shortcut {
  flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  width: 64px;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
  color: inherit;
}
.phone.mercury .m-shortcut-ic {
  width: 56px; height: 56px; border-radius: 999px;
  background: rgba(15,15,14,.04);
  color: #0F0F0E;
  display: grid; place-items: center;
  transition: all .15s;
}
.phone.mercury .m-shortcut-ic.active {
  background: #0F0F0E;
  color: #FFFFFF;
}
.phone.mercury .m-shortcut-lbl {
  font-size: 12px; font-weight: 500; color: #0F0F0E;
  text-align: center; line-height: 1.2;
}

/* resumo 2-col */
.phone.mercury .m-resumo-row {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 16px;
}
.phone.mercury .m-resumo-row .m-card { margin: 0; padding: 18px 16px; }
.phone.mercury .m-resumo-card { display: flex; flex-direction: column; gap: 4px; }
.phone.mercury .m-pl-spark { width: 100%; height: 40px; margin-top: 8px; }
.phone.mercury .m-notif-head {
  display: flex; align-items: center; justify-content: space-between;
}
.phone.mercury .m-notif-badge {
  padding: 1px 6px; border-radius: 999px;
  background: #C4413A; color: #fff;
  font-size: 10px; font-weight: 600;
}
.phone.mercury .m-notif-tag {
  margin-top: 10px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; font-weight: 600;
  letter-spacing: .08em; color: rgba(15,15,14,.5);
}
.phone.mercury .m-notif-title {
  margin-top: 4px;
  font-size: 14px; font-weight: 600; letter-spacing: -.01em;
}
.phone.mercury .m-notif-dots {
  display: inline-flex; gap: 4px; margin-top: 8px;
}
.phone.mercury .m-notif-dot {
  width: 6px; height: 6px; border-radius: 999px;
  background: rgba(15,15,14,.18);
}
.phone.mercury .m-notif-dot.active { background: #0F0F0E; }

/* stack bar + composição */
.phone.mercury .m-stack-bar {
  display: flex; width: 100%; height: 6px;
  gap: 3px;
  margin-bottom: 18px;
}
.phone.mercury .m-stack-seg { height: 100%; border-radius: 3px; }
.phone.mercury .m-comp-row {
  display: flex; align-items: center; gap: 12px; padding: 12px 0;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.phone.mercury .m-comp-row.last { border-bottom: 0; padding-bottom: 0; }
.phone.mercury .m-comp-row:first-of-type { padding-top: 0; }
.phone.mercury .m-comp-dot {
  width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0;
}
.phone.mercury .m-comp-meta { flex: 1; min-width: 0; }
.phone.mercury .m-comp-name { font-size: 14px; font-weight: 500; letter-spacing: -.005em; }
.phone.mercury .m-comp-sub { font-size: 11px; color: rgba(15,15,14,.5); margin-top: 2px; }
.phone.mercury .m-comp-right { text-align: right; }
.phone.mercury .m-comp-val {
  font-family: 'Inter', sans-serif; font-weight: 500; font-size: 14px;
  font-variant-numeric: tabular-nums;
}
.phone.mercury .m-comp-delta {
  font-size: 11px; color: #C4413A; margin-top: 2px;
  font-variant-numeric: tabular-nums;
}

/* próximos pagamentos */
.phone.mercury .m-pay-hero {
  display: flex; align-items: center; gap: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(15,15,14,.06);
}
.phone.mercury .m-pay-date {
  display: flex; flex-direction: column; align-items: center;
  width: 48px; padding: 8px 0;
  background: rgba(15,15,14,.04); border-radius: 10px;
}
.phone.mercury .m-pay-d {
  font-size: 19px; font-weight: 600; line-height: 1;
  font-variant-numeric: tabular-nums;
}
.phone.mercury .m-pay-m {
  margin-top: 3px;
  font-size: 9px; font-weight: 600;
  letter-spacing: .10em; text-transform: uppercase;
  color: rgba(15,15,14,.5);
}
.phone.mercury .m-pay-tk { margin-top: 4px; font-size: 14px; font-weight: 600; }
.phone.mercury .m-pay-amount { margin-top: 4px; font-size: 16px; font-weight: 600; font-variant-numeric: tabular-nums; }
.phone.mercury .m-pays {
  display: flex; gap: 8px;
  margin: 14px 0;
  overflow-x: auto; scrollbar-width: none;
}
.phone.mercury .m-pays::-webkit-scrollbar { display: none; }
.phone.mercury .m-pay-mini {
  flex-shrink: 0; width: 96px;
  padding: 10px 12px;
  background: rgba(15,15,14,.04); border-radius: 10px;
  display: flex; flex-direction: column; gap: 4px;
}
.phone.mercury .m-pay-mini-date {
  display: inline-flex; align-items: baseline; gap: 4px;
  font-variant-numeric: tabular-nums;
}
.phone.mercury .m-pay-mini-date > div:first-child { font-size: 15px; font-weight: 600; }
.phone.mercury .m-pay-mini-date > div:last-child { font-size: 11px; color: rgba(15,15,14,.5); }
.phone.mercury .m-pay-mini-tk { font-size: 12px; font-weight: 600; }
.phone.mercury .m-pay-mini-kind { font-size: 10px; color: rgba(15,15,14,.5); }
.phone.mercury .m-pay-mini-amount {
  margin-top: 4px;
  font-size: 13px; font-weight: 600; color: #0F8C4D;
  font-variant-numeric: tabular-nums;
}
.phone.mercury .m-pay-foot {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px;
  margin: 14px -20px -22px;
  background: rgba(15,15,14,.025);
  border-top: 1px solid rgba(15,15,14,.06);
  border-radius: 0 0 20px 20px;
}
.phone.mercury .m-pay-total {
  margin-top: 4px;
  font-size: 16px; font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* CTA Raio-X (dark) */
.phone.mercury .m-cta {
  margin: 0 16px; padding: 18px 20px;
  background: #0F0F0E; color: #FFFFFF;
  border-radius: 20px;
  display: flex; align-items: center; justify-content: space-between;
  cursor: pointer;
  text-decoration: none;
}
.phone.mercury .m-cta .t { font-size: 16px; font-weight: 500; letter-spacing: -.01em; }
.phone.mercury .m-cta .s { font-size: 12px; color: rgba(255,255,255,.55); margin-top: 2px; }

/* CTA Carta — editorial gold */
.phone.mercury .m-cta-carta {
  margin: 10px 16px 0;
  padding: 20px 22px;
  background: linear-gradient(135deg, #FAF6EA 0%, #F4EDD9 100%);
  border: 1px solid rgba(183,135,58,.20);
  border-radius: 20px;
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
  text-decoration: none; color: inherit;
  position: relative; overflow: hidden;
  box-shadow: 0 1px 0 rgba(183,135,58,.06), 0 8px 24px -14px rgba(183,135,58,.18);
}
.phone.mercury .m-cta-carta::before {
  content: ""; position: absolute; right: -30px; top: -30px;
  width: 110px; height: 110px; border-radius: 50%;
  background: radial-gradient(circle, rgba(183,135,58,.10) 0%, transparent 70%);
  pointer-events: none;
}
.phone.mercury .m-cta-carta-meta { flex: 1; min-width: 0; position: relative; z-index: 1; }
.phone.mercury .m-cta-carta-kicker {
  font-family: 'IBM Plex Mono', monospace; font-size: 9px; font-weight: 600;
  letter-spacing: .12em; color: #8A6018;
}
.phone.mercury .m-cta-carta-title {
  font-family: 'Newsreader', serif; font-weight: 500;
  font-size: 22px; line-height: 1.1; letter-spacing: -.015em;
  color: #1A1F2E; margin-top: 6px;
}
.phone.mercury .m-cta-carta-title .ital {
  font-style: italic; color: #B7873A;
}
.phone.mercury .m-cta-carta-sub {
  font-size: 12px; color: rgba(26,31,46,.55); margin-top: 4px;
}
.phone.mercury .m-cta-carta-arrow {
  width: 38px; height: 38px; border-radius: 50%;
  background: rgba(183,135,58,.12); color: #8A6018;
  display: grid; place-items: center;
  flex-shrink: 0; position: relative; z-index: 1;
}

/* CTA Chat IA — soft */
.phone.mercury .m-cta-chat {
  margin: 10px 16px 0;
  padding: 16px 18px;
  background: #FFFFFF;
  border: 1px solid rgba(15,15,14,.05);
  border-radius: 16px;
  display: flex; align-items: center; gap: 14px;
  text-decoration: none; color: inherit;
  box-shadow: 0 1px 0 rgba(15,15,14,.02), 0 8px 24px -16px rgba(15,15,14,.08);
}
.phone.mercury .m-cta-chat-icon {
  width: 40px; height: 40px; border-radius: 12px;
  background: rgba(15,15,14,.04); color: #0F0F0E;
  display: grid; place-items: center;
  flex-shrink: 0;
}
.phone.mercury .m-cta-chat-meta { flex: 1; min-width: 0; }
.phone.mercury .m-cta-chat-title { font-size: 14px; font-weight: 600; letter-spacing: -.005em; }
.phone.mercury .m-cta-chat-sub { font-size: 12px; color: rgba(15,15,14,.5); margin-top: 2px; }

/* atividade recente */
.phone.mercury .m-act-row {
  display: grid; grid-template-columns: 34px 1fr auto;
  align-items: center; gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.phone.mercury .m-act-row:first-child { padding-top: 0; }
.phone.mercury .m-act-row.last { border-bottom: 0; padding-bottom: 0; }
.phone.mercury .m-act-ic {
  width: 34px; height: 34px; border-radius: 10px;
  background: rgba(15,15,14,.04);
  color: rgba(15,15,14,.7);
  display: grid; place-items: center;
}
.phone.mercury .m-act-title { font-size: 14px; font-weight: 500; }
.phone.mercury .m-act-when { font-size: 11px; color: rgba(15,15,14,.5); margin-top: 1px; }
.phone.mercury .m-act-amount {
  font-family: 'Inter', sans-serif; font-weight: 500; font-size: 14px;
  font-variant-numeric: tabular-nums;
}

/* tabbar */
.phone.mercury .m-tabbar {
  position: fixed; left: 0; right: 0; bottom: 0;
  max-width: 480px; margin: 0 auto;
  height: 78px;
  background: rgba(248,246,241,.94); backdrop-filter: blur(20px);
  border-top: 1px solid rgba(15,15,14,.06);
  display: flex; justify-content: space-around; align-items: flex-start;
  padding: 12px 24px 24px;
  z-index: 20;
}
.phone.mercury .m-tab {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  background: transparent; border: 0;
  color: rgba(15,15,14,.35); cursor: pointer;
  padding: 4px 8px;
  font-family: inherit;
}
.phone.mercury .m-tab.active { color: #0F0F0E; }
.phone.mercury .m-tab svg { width: 22px; height: 22px; }
.phone.mercury .m-tab .lbl { font-size: 10px; font-weight: 500; }


/* ============ DESKTOP SHELL (.dt.mercury-dt) — copy do Figma ============ */
.dt.mercury-dt {
  background: #F8F6F1;
  color: #0F0F0E;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  min-height: 100vh;
  position: relative;
}
.dt .d-mut { color: rgba(15,15,14,.55); }
.dt .d-dim { color: rgba(15,15,14,.35); }
.dt .d-pos { color: #0F8C4D; }
.dt .d-neg { color: #C4413A; }
.dt .d-link { color: #0F0F0E; font-size: 13px; font-weight: 500; cursor: pointer; }

/* sidebar */
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
  font-weight: 600; font-size: 13px;
  flex-shrink: 0;
}

/* main */
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
.dt .d-iconbtn:hover { background: rgba(15,15,14,.08); }

/* content */
.dt .d-content {
  padding: 24px 32px 60px;
  display: flex; flex-direction: column; gap: 16px;
}
.dt .d-greet {
  display: flex; justify-content: space-between; align-items: flex-end;
  padding-bottom: 4px;
}
.dt .d-greet .h {
  margin-top: 4px;
  font-size: 26px; font-weight: 600; letter-spacing: -.022em;
}
.dt .d-greet .s {
  font-size: 13px; color: rgba(15,15,14,.5); margin-top: 4px;
}
.dt .d-greet .actions { display: flex; gap: 10px; }
.dt .d-btn {
  padding: 9px 16px; border-radius: 9px;
  background: #0F0F0E; color: #fff;
  font-size: 13px; font-weight: 500; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
}
.dt .d-btn-ghost { background: rgba(15,15,14,.04); color: #0F0F0E; }
.dt .d-btn-ghost:hover { background: rgba(15,15,14,.08); }

.dt .d-card {
  background: #FFFFFF;
  border: 1px solid rgba(15,15,14,.05);
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 1px 0 rgba(15,15,14,.02), 0 8px 24px -16px rgba(15,15,14,.08);
}
.dt .d-section-h {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 12px;
}
.dt .d-section-h .title { font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
.dt .d-section-h .link { font-size: 13px; color: #0F0F0E; font-weight: 500; cursor: pointer; }
.dt .d-label { font-size: 11px; font-weight: 500; color: rgba(15,15,14,.5); }
.dt .d-num-hero {
  font-weight: 500; font-size: 42px; line-height: 1;
  letter-spacing: -.032em; font-variant-numeric: tabular-nums;
  margin: 8px 0 12px;
}
.dt .d-num-hero .dec { color: rgba(15,15,14,.32); }
.dt .d-num-mid {
  font-weight: 600; font-size: 28px; line-height: 1;
  letter-spacing: -.025em; font-variant-numeric: tabular-nums;
  margin-top: 10px;
}

.dt .d-delta-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 6px;
  font-size: 12px; font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.dt .d-delta-chip.neg { background: rgba(196,65,58,.08); color: #C4413A; }
.dt .d-delta-chip.pos { background: rgba(15,140,77,.10); color: #0F8C4D; }

.dt .d-seg {
  display: inline-flex; padding: 3px; gap: 2px;
  background: rgba(15,15,14,.04); border-radius: 9px;
}
.dt .d-seg .s {
  padding: 6px 11px; border-radius: 6px;
  font-size: 11px; font-weight: 500; color: rgba(15,15,14,.5);
  cursor: pointer;
}
.dt .d-seg .s.active {
  background: #fff; color: #0F0F0E;
  box-shadow: 0 1px 2px rgba(15,15,14,.08);
}

/* desktop row layouts — Mercury faithful */
.dt .d-row-1 {
  display: grid; grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr);
  gap: 16px;
}
.dt .d-patrim-card {
  display: flex; flex-direction: column; gap: 20px;
  padding: 24px 28px;
}
.dt .d-patrim-top {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
}
.dt .d-patrim-delta-row {
  display: inline-flex; align-items: center; gap: 10px; margin-top: 4px;
}
.dt .d-patrim-reason {
  margin-top: 16px;
  display: inline-flex; align-items: center; flex-wrap: wrap; gap: 6px;
  font-size: 13px; color: rgba(15,15,14,.7);
}
.dt .d-patrim-reason .d-neg { color: #C4413A; font-weight: 600; }
.dt .d-patrim-reason strong { color: #0F0F0E; font-weight: 600; }
.dt .d-patrim-reason .d-link { color: #0F0F0E; font-weight: 500; cursor: pointer; margin-left: 4px; }
.dt .d-patrim-chart {
  width: 100%; height: 140px; display: block;
}
.dt .d-row-1-side {
  display: flex; flex-direction: column; gap: 16px; min-width: 0;
}
.dt .d-side-card { padding: 18px 20px; }

.dt .d-grid-2col {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.dt .d-pl-spark { width: 100%; height: 60px; margin-top: 10px; display: block; }

.dt .d-notif-head {
  display: flex; align-items: center; justify-content: space-between;
}
.dt .d-notif-badge {
  padding: 2px 8px; border-radius: 6px;
  background: #0F0F0E; color: #fff;
  font-size: 10px; font-weight: 600;
}
.dt .d-notif-tag {
  display: inline-block;
  margin-top: 14px;
  padding: 3px 8px; border-radius: 5px;
  background: rgba(196,65,58,.08); color: #C4413A;
  font-size: 9px; font-weight: 700; letter-spacing: .10em;
}
.dt .d-notif-title {
  margin-top: 4px;
  font-size: 15px; font-weight: 600; letter-spacing: -.01em;
}
.dt .d-notif-dots {
  display: inline-flex; gap: 4px; margin-top: 10px;
}
.dt .d-notif-dot {
  width: 6px; height: 6px; border-radius: 999px;
  background: rgba(15,15,14,.18);
}
.dt .d-notif-dot.active { background: #0F0F0E; }

/* composição */
.dt .d-stack-bar {
  display: flex; width: 100%; height: 8px;
  border-radius: 999px; overflow: hidden;
  margin-bottom: 18px;
  gap: 3px;
}
.dt .d-stack-seg { height: 100%; border-radius: 4px; }
.dt .d-comp-row {
  display: grid; grid-template-columns: minmax(0, 1fr) 80px auto;
  align-items: center; gap: 14px; padding: 12px 0;
  border-bottom: 1px solid rgba(15,15,14,.04);
}
.dt .d-comp-row:last-child { border-bottom: 0; padding-bottom: 0; }
.dt .d-comp-meta { min-width: 0; }
.dt .d-comp-top {
  display: inline-flex; align-items: baseline; gap: 8px;
}
.dt .d-comp-dot { width: 7px; height: 7px; border-radius: 999px; align-self: center; }
.dt .d-comp-name { font-size: 14px; font-weight: 600; }
.dt .d-comp-pct {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.dt .d-comp-val { font-size: 13px; color: rgba(15,15,14,.7); font-variant-numeric: tabular-nums; margin-top: 4px; }
.dt .d-comp-spark { width: 80px; height: 30px; display: block; }
.dt .d-comp-delta { font-size: 13px; font-weight: 500; font-variant-numeric: tabular-nums; }

/* próximos pagamentos */
.dt .d-pay-hero {
  display: flex; align-items: flex-start; gap: 16px;
  padding-bottom: 18px;
}
.dt .d-pay-date-sq {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  width: 52px; height: 56px;
  background: #0F0F0E; color: #fff;
  border-radius: 10px;
  flex-shrink: 0;
}
.dt .d-pay-date-sq .d-pay-d {
  font-size: 20px; font-weight: 700; line-height: 1;
  font-variant-numeric: tabular-nums; color: #fff;
}
.dt .d-pay-date-sq .d-pay-m {
  margin-top: 4px;
  font-size: 9px; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase;
  color: rgba(255,255,255,.7);
}
.dt .d-pay-hero-meta { display: flex; flex-direction: column; gap: 4px; }
.dt .d-pay-next-lbl {
  font-size: 10px; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase;
  color: #0F8C4D;
}
.dt .d-pay-tk { font-size: 16px; font-weight: 600; letter-spacing: -.005em; }
.dt .d-pay-amount {
  font-size: 22px; font-weight: 600;
  letter-spacing: -.015em; font-variant-numeric: tabular-nums;
  margin-top: 2px;
}
.dt .d-pays {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 8px; margin: 0 0 18px;
}
.dt .d-pay-mini {
  padding: 12px 14px;
  background: rgba(15,15,14,.04);
  border-radius: 10px;
  display: flex; flex-direction: column; gap: 2px;
}
.dt .d-pay-mini-date {
  display: inline-flex; align-items: baseline; gap: 5px;
  font-variant-numeric: tabular-nums;
}
.dt .d-pay-mini-d { font-size: 16px; font-weight: 700; }
.dt .d-pay-mini-m {
  font-size: 10px; font-weight: 600; letter-spacing: .10em;
  text-transform: uppercase; color: rgba(15,15,14,.5);
}
.dt .d-pay-mini-tk { font-size: 13px; font-weight: 600; margin-top: 2px; }
.dt .d-pay-mini-kind { font-size: 11px; }
.dt .d-pay-mini-amount {
  margin-top: 6px;
  font-size: 14px; font-weight: 600; color: #0F8C4D;
  font-variant-numeric: tabular-nums;
}
.dt .d-pay-foot {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid rgba(15,15,14,.06);
}
.dt .d-pay-total {
  margin-top: 4px;
  font-size: 18px; font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* atividade desktop */
.dt .d-act-row {
  display: grid;
  grid-template-columns: 36px 1fr 1fr auto;
  align-items: center; gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(15,15,14,.06);
}
.dt .d-act-row:first-of-type { padding-top: 0; }
.dt .d-act-ic {
  width: 36px; height: 36px; border-radius: 11px;
  display: grid; place-items: center;
}
.dt .d-act-ic-in { background: rgba(15,140,77,.10); color: #0F8C4D; }
.dt .d-act-ic-out { background: rgba(15,15,14,.04); color: #0F0F0E; }
.dt .d-act-title { font-size: 14px; font-weight: 500; }
.dt .d-act-tk { font-size: 13px; font-weight: 500; }
.dt .d-act-amount {
  font-size: 14px; font-weight: 500;
  font-variant-numeric: tabular-nums;
}
</style>

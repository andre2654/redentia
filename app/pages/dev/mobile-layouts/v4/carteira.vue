<!--
  V4 — Mercury Bank · Carteira (Portfolio).

  Estratégia: 2 shells separados (mobile + desktop) com os EXATOS
  namespaces do Figma:
    - `.phone.mercury` + `.m-*` para < 1024px
    - `.dt.mercury-dt` + `.d-*` para ≥ 1024px

  Port direto de carteira-mercury.jsx + carteira-mercury-desktop.jsx
-->
<template>
  <div class="v4">

    <!-- ============ MOBILE SHELL (.phone.mercury) ============ -->
    <div class="phone mercury">

      <!-- Top appbar — Carteira: title + search + filter -->
      <div class="m-appbar" style="padding-bottom: 18px;">
        <div style="display:flex; flex-direction:column;">
          <span class="m-label" style="font-size:10px;">2 corretoras · 12 ativos</span>
          <span style="font-size:22px; font-weight:600; letter-spacing:-.022em; margin-top:4px;">Carteira</span>
        </div>
        <div class="m-appbar-icons">
          <button class="m-iconbtn m-iconbtn-circle"><UIcon name="i-lucide-search" class="size-4" /></button>
          <button class="m-iconbtn m-iconbtn-circle"><UIcon name="i-lucide-sliders-horizontal" class="size-4" /></button>
        </div>
      </div>

      <div class="m-scroll">

        <!-- Hero — Patrimônio + chart -->
        <div class="m-card m-card-lg">
          <div class="m-label">Patrimônio total</div>
          <div class="m-num-hero">R$ 505.206<span class="dec">,63</span></div>
          <div class="m-patrim-delta-row">
            <span class="m-delta-chip pos">↑ 18,4%</span>
            <span class="m-mut" style="font-size:13px;">+ R$ 78.420 · 12 meses</span>
          </div>

          <svg viewBox="0 0 400 120" preserveAspectRatio="none" class="m-patrim-chart" style="height:120px; margin-top:20px;">
            <defs>
              <linearGradient id="mCartGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#0F8C4D" stop-opacity="0.18" />
                <stop offset="100%" stop-color="#0F8C4D" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,100 L20,96 L40,92 L60,88 L80,90 L100,82 L120,84 L140,76 L160,72 L180,74 L200,66 L220,58 L240,60 L260,52 L280,46 L300,48 L320,40 L340,32 L360,28 L380,20 L400,14 L400,120 L0,120 Z"
                  fill="url(#mCartGrad)" />
            <path d="M0,100 L20,96 L40,92 L60,88 L80,90 L100,82 L120,84 L140,76 L160,72 L180,74 L200,66 L220,58 L240,60 L260,52 L280,46 L300,48 L320,40 L340,32 L360,28 L380,20 L400,14"
                  fill="none" stroke="#0F8C4D" stroke-width="1.5"
                  stroke-linejoin="round" stroke-linecap="round" />
            <circle cx="400" cy="14" r="3" fill="#0F8C4D" />
          </svg>

          <div style="display:flex; justify-content:center; margin-top:14px;">
            <div class="m-seg">
              <span v-for="p in periods" :key="p"
                    class="s" :class="{ active: activePeriod === p }"
                    @click="activePeriod = p">{{ p }}</span>
            </div>
          </div>
        </div>

        <!-- Performance row — 3 stats -->
        <div class="m-mini-stats">
          <div class="m-mini-stat">
            <div class="m-label" style="font-size:10px;">vs IBOV</div>
            <div class="m-mini-stat-v pos">+4,8pp</div>
          </div>
          <div class="m-mini-stat">
            <div class="m-label" style="font-size:10px;">vs CDI</div>
            <div class="m-mini-stat-v pos">+6,2pp</div>
          </div>
          <div class="m-mini-stat">
            <div class="m-label" style="font-size:10px;">Score</div>
            <div class="m-mini-stat-v">71/100</div>
          </div>
        </div>

        <!-- Contas conectadas · Open Finance -->
        <div class="m-section">
          <span class="title">Contas conectadas</span>
          <span class="link">Gerenciar →</span>
        </div>
        <div class="m-banks">
          <div v-for="b in banks" :key="b.name" class="m-bank-card">
            <div style="display:flex; align-items:center; gap:9px; margin-bottom:10px;">
              <div class="m-bank-mark" :style="{ background: b.color, color: b.initialsColor }">{{ b.initials }}</div>
              <div style="flex:1; min-width:0;">
                <div class="m-bank-name">{{ b.name }}</div>
                <div class="m-bank-holdings">{{ b.holdings }}</div>
              </div>
            </div>
            <div class="m-bank-value">{{ b.value }}</div>
            <div class="m-bank-sync">
              <span class="m-bank-dot" />
              <span class="m-bank-sync-lbl">Sincronizado</span>
            </div>
          </div>
          <div class="m-bank-add">
            <div class="m-bank-add-ic">
              <UIcon name="i-lucide-plus" class="size-4" />
            </div>
            <div>
              <div class="m-bank-add-title">Conectar conta</div>
              <div class="m-bank-add-sub">via Open Finance</div>
            </div>
          </div>
        </div>

        <!-- Composição -->
        <div class="m-section">
          <span class="title">Composição</span>
          <span class="link">Por setor →</span>
        </div>
        <div class="m-card" style="padding: 20px;">
          <div class="m-stack-bar" style="gap:3px;">
            <span class="m-stack-seg" style="flex:41.1; background:#1A8E5E; border-radius:3px;" />
            <span class="m-stack-seg" style="flex:39.5; background:#0F8C4D; border-radius:3px;" />
            <span class="m-stack-seg" style="flex:19.5; background:#5B4A7A; border-radius:3px;" />
          </div>
          <div v-for="(c, i) in composicao" :key="c.label" class="m-comp-row" :class="{ 'is-last': i === composicao.length - 1 }">
            <div class="m-comp-meta">
              <div class="m-comp-top">
                <span class="m-comp-dot" :style="{ background: c.color }" />
                <span class="m-comp-name">{{ c.label }}</span>
                <span class="m-comp-pct">{{ c.pct }}%</span>
              </div>
              <div class="m-comp-val"><span class="m-mut">R$ </span>{{ c.value }}</div>
            </div>
            <svg viewBox="0 0 56 22" class="m-comp-spark">
              <path :d="c.sparkPath"
                    fill="none" :stroke="c.delta >= 0 ? '#0F8C4D' : '#C4413A'"
                    stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
            <span class="m-delta-chip" :class="c.delta >= 0 ? 'pos' : 'neg'">
              {{ c.delta >= 0 ? '+' : '' }}{{ c.delta.toFixed(1).replace('.', ',') }}%
            </span>
          </div>
        </div>

        <!-- P&L · 12 meses -->
        <div class="m-section">
          <span class="title">Resultado</span>
          <span class="link">Detalhes →</span>
        </div>
        <div class="m-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="m-label">P&amp;L · 12 meses</div>
              <div class="m-pnl-num">+ R$ 78.420</div>
              <div class="m-mut" style="font-size:11px; margin-top:3px;">≈ R$ 6.535 / mês · 18,4%</div>
            </div>
            <div style="text-align:right;">
              <div class="m-label" style="font-size:10px;">Melhor mês</div>
              <div style="font-size:13px; font-weight:600; color:#0F8C4D; margin-top:3px; font-variant-numeric:tabular-nums;">+R$ 14.2k</div>
              <div class="m-mut" style="font-size:10px; margin-top:1px;">Out · 2025</div>
            </div>
          </div>

          <div class="m-divider" />

          <!-- Bar chart — positive/negative months -->
          <svg viewBox="0 0 320 132" preserveAspectRatio="none" class="m-pnl-bars">
            <line x1="4" x2="316" y1="65" y2="65" stroke="rgba(15,15,14,.12)" stroke-dasharray="2 3" />
            <!-- bars: pos (above zero=65) -->
            <rect x="4"    y="35"  width="20" height="30" rx="3" fill="#0F8C4D" fill-opacity=".75" />
            <rect x="30"   y="17"  width="20" height="48" rx="3" fill="#0F8C4D" fill-opacity=".75" />
            <rect x="56"   y="65"  width="20" height="17" rx="3" fill="#C4413A" fill-opacity=".75" />
            <rect x="82"   y="8"   width="20" height="57" rx="3" fill="#0F8C4D" fill-opacity=".75" />
            <rect x="108"  y="0"   width="20" height="65" rx="3" fill="#0F8C4D" fill-opacity=".75" />
            <rect x="134"  y="40"  width="20" height="25" rx="3" fill="#0F8C4D" fill-opacity=".75" />
            <rect x="160"  y="65"  width="20" height="13" rx="3" fill="#C4413A" fill-opacity=".75" />
            <rect x="186"  y="22"  width="20" height="43" rx="3" fill="#0F8C4D" fill-opacity=".75" />
            <rect x="212"  y="65"  width="20" height="23" rx="3" fill="#C4413A" fill-opacity=".75" />
            <rect x="238"  y="30"  width="20" height="35" rx="3" fill="#0F8C4D" fill-opacity=".75" />
            <rect x="264"  y="14"  width="20" height="51" rx="3" fill="#0F8C4D" fill-opacity=".75" />
            <rect x="290"  y="35"  width="20" height="30" rx="3" fill="#0F8C4D" />
            <!-- labels -->
            <text v-for="(m, i) in pnlMonths" :key="m"
                  :x="14 + i * 26" y="125"
                  text-anchor="middle"
                  font-family="IBM Plex Mono"
                  font-size="9"
                  letter-spacing=".06em"
                  :fill="i === 11 ? '#0F0F0E' : 'rgba(15,15,14,.45)'"
                  :font-weight="i === 11 ? 600 : 500">{{ m }}</text>
          </svg>

          <div class="m-pnl-legend">
            <div class="m-pnl-legend-row">
              <span style="width:8px; height:8px; border-radius:2px; background:#0F8C4D;" />
              <span>Ganho</span>
              <span style="color:rgba(15,15,14,.4);">9</span>
            </div>
            <div class="m-pnl-legend-row">
              <span style="width:8px; height:8px; border-radius:2px; background:#C4413A;" />
              <span>Perda</span>
              <span style="color:rgba(15,15,14,.4);">3</span>
            </div>
          </div>
        </div>

        <!-- Posições / Holdings tabs -->
        <div class="m-section">
          <span class="title">Posições</span>
          <span class="link">Tudo →</span>
        </div>

        <!-- Class tabs -->
        <div style="padding: 0 22px 12px;">
          <div class="m-tabs-class">
            <span v-for="t in classTabs" :key="t.v"
                  class="m-tab-class"
                  :class="{ active: activeClassTab === t.v }"
                  @click="activeClassTab = t.v">
              {{ t.label }} <span class="m-tab-class-count">{{ t.count }}</span>
            </span>
          </div>
        </div>

        <!-- Holdings list -->
        <div class="m-card" style="padding: 4px 0;">
          <div v-for="(h, i) in currentHoldings" :key="h.ticker"
               class="m-holding"
               :class="{ 'is-last': i === currentHoldings.length - 1 }">
            <div style="flex:1; min-width:0;">
              <div class="m-holding-tk">{{ h.ticker }}</div>
              <div class="m-holding-qty">{{ h.qty }}</div>
            </div>
            <svg viewBox="0 0 56 22" class="m-holding-spark">
              <path :d="sparkPath(h.spark)"
                    fill="none"
                    :stroke="h.delta >= 0 ? '#0F8C4D' : '#C4413A'"
                    stroke-width="1.4"
                    stroke-linecap="round"
                    stroke-linejoin="round" />
            </svg>
            <div style="text-align:right; min-width:80px;">
              <div class="m-holding-val">R$ {{ h.val }}</div>
              <div class="m-holding-delta" :class="h.delta >= 0 ? 'pos' : 'neg'">
                {{ h.delta >= 0 ? '+' : '' }}{{ h.delta.toFixed(2).replace('.', ',') }}%
              </div>
            </div>
          </div>
        </div>

        <!-- Renda passiva -->
        <div class="m-section">
          <span class="title">Renda passiva</span>
          <span class="link">Calendário →</span>
        </div>
        <div class="m-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="m-label">Projeção · 12 meses</div>
              <div class="m-pnl-num">+ R$ 8.700</div>
              <div class="m-mut" style="font-size:11px; margin-top:3px;">≈ R$ 725 / mês</div>
            </div>
            <span class="m-delta-chip pos">DY 7,8%</span>
          </div>
          <div class="m-divider" />
          <div class="m-renda-bars">
            <div v-for="(v, i) in rendaPassivaBars" :key="i" class="m-renda-bar-col">
              <div class="m-renda-bar"
                   :style="{ height: (v / 500 * 100) + '%', background: i === 11 ? '#0F8C4D' : 'rgba(15,140,77,.25)' }" />
            </div>
          </div>
          <div class="m-renda-labels">
            <div v-for="m in pnlMonths" :key="m">{{ m }}</div>
          </div>
        </div>

        <!-- Insight CTA -->
        <div class="m-cta" style="margin-top: 24px; margin-bottom: 24px;">
          <div>
            <div class="t">Rebalancear carteira</div>
            <div class="s">Ações BR está 5pp acima do alvo</div>
          </div>
          <div class="m-cta-arrow">
            <UIcon name="i-lucide-arrow-right" class="size-4" style="color:white;" />
          </div>
        </div>
      </div>

      <!-- TABBAR -->
      <div class="m-tabbar">
        <NuxtLink v-for="t in mobileTabs" :key="t.label"
                  :to="t.to"
                  class="m-tab"
                  :class="{ active: t.label === 'Carteira' }">
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
                    :class="{ active: n.label === 'Carteira' }">
            <UIcon :name="n.icon" class="ic" />
            <span>{{ n.label }}</span>
            <span v-if="n.badge" class="badge">{{ n.badge }}</span>
          </NuxtLink>
          <div class="grp">Ferramentas</div>
          <div v-for="t in navTools" :key="t.label" class="item">
            <UIcon :name="t.icon" class="ic" />
            <span>{{ t.label }}</span>
            <span v-if="t.badge" class="badge">{{ t.badge }}</span>
          </div>
        </div>
        <div class="d-side-footer">
          <div class="av">A</div>
          <div style="flex:1; min-width:0;">
            <div style="font-weight:500;">André Silva</div>
            <div class="d-mut" style="font-size:11px; margin-top:1px;">Premium · 2 anos</div>
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
              <div class="d-mut" style="font-size:12px; font-weight:500; margin-bottom:6px;">2 corretoras · 12 ativos · sincronizado há 3 min</div>
              <div class="h">Carteira</div>
            </div>
            <div class="actions">
              <div class="d-btn d-btn-ghost">Exportar</div>
              <div class="d-btn">
                <UIcon name="i-lucide-plus" class="size-3.5" />
                Conectar conta
              </div>
            </div>
          </div>

          <!-- ROW 1: Hero + right side (mini-stats + connected accounts) -->
          <div class="d-row-1" style="grid-template-columns: 1fr 340px;">
            <div class="d-card" style="padding: 24px 26px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <div class="d-label">Patrimônio total</div>
                  <div class="d-num-hero" style="margin-top:10px;">R$ 505.206<span class="dec">,63</span></div>
                  <div class="d-patrim-delta-row">
                    <span class="d-delta-chip pos">↑ 18,4%</span>
                    <span class="d-mut" style="font-size:13px;">+ R$ 78.420 · 12 meses</span>
                  </div>
                </div>
                <div class="d-seg">
                  <span v-for="p in periods" :key="p"
                        class="s" :class="{ active: activePeriod === p }"
                        @click="activePeriod = p">{{ p }}</span>
                </div>
              </div>
              <svg viewBox="0 0 800 240" preserveAspectRatio="none" class="d-patrim-chart" style="margin-top:18px;">
                <defs>
                  <linearGradient id="dCartGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#0F8C4D" stop-opacity="0.18" />
                    <stop offset="100%" stop-color="#0F8C4D" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,200 L40,192 L80,184 L120,178 L160,180 L200,164 L240,168 L280,152 L320,144 L360,148 L400,132 L440,116 L480,120 L520,104 L560,92 L600,96 L640,80 L680,64 L720,56 L760,40 L800,28 L800,240 L0,240 Z"
                      fill="url(#dCartGrad)" />
                <path d="M0,200 L40,192 L80,184 L120,178 L160,180 L200,164 L240,168 L280,152 L320,144 L360,148 L400,132 L440,116 L480,120 L520,104 L560,92 L600,96 L640,80 L680,64 L720,56 L760,40 L800,28"
                      fill="none" stroke="#0F8C4D" stroke-width="2"
                      stroke-linejoin="round" stroke-linecap="round" />
                <circle cx="800" cy="28" r="4" fill="#0F8C4D" />
              </svg>
            </div>

            <div style="display:flex; flex-direction:column; gap:14px;">
              <div class="d-mini-stats">
                <div class="d-mini-stat">
                  <div class="d-label" style="font-size:10px;">vs IBOV</div>
                  <div class="d-mini-stat-v pos">+4,8pp</div>
                </div>
                <div class="d-mini-stat">
                  <div class="d-label" style="font-size:10px;">vs CDI</div>
                  <div class="d-mini-stat-v pos">+6,2pp</div>
                </div>
                <div class="d-mini-stat">
                  <div class="d-label" style="font-size:10px;">Score</div>
                  <div class="d-mini-stat-v">71/100</div>
                </div>
              </div>

              <div class="d-card" style="padding: 14px 14px 12px; flex:1;">
                <div class="d-section-h" style="margin-bottom:10px;">
                  <span class="title" style="font-size:13px;">Contas conectadas</span>
                  <span class="link" style="font-size:12px;">Gerenciar →</span>
                </div>
                <div v-for="b in banks" :key="b.name" class="d-bank-row">
                  <div class="d-bank-mark" :style="{ background: b.color, color: b.initialsColor }">{{ b.initials }}</div>
                  <div style="flex:1; min-width:0;">
                    <div class="d-bank-name">{{ b.name }}</div>
                    <div class="d-bank-sub">{{ b.holdings }} · Open Finance</div>
                  </div>
                  <div style="text-align:right;">
                    <div class="d-bank-val">{{ b.value }}</div>
                    <div class="d-bank-sync">
                      <span class="d-bank-dot" />
                      <span class="d-bank-sync-lbl">3 min</span>
                    </div>
                  </div>
                </div>
                <div class="d-bank-add-row">
                  <div class="d-bank-add-ic">
                    <UIcon name="i-lucide-plus" class="size-3.5" />
                  </div>
                  <div style="flex:1; font-size:12px; font-weight:500;">
                    Conectar mais contas
                    <div style="font-size:10px; color:rgba(15,15,14,.5); font-weight:400; margin-top:1px;">via Open Finance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ROW 2: Composição + Resultado P&L -->
          <div class="d-grid-2col" style="grid-template-columns: 1fr 1.2fr;">
            <div class="d-card">
              <div class="d-section-h">
                <span class="title">Composição</span>
                <span class="link">Por setor →</span>
              </div>
              <div class="d-stack-bar" style="height:6px; gap:3px; margin-top:6px; margin-bottom:14px;">
                <span class="d-stack-seg" style="flex:41.1; background:#1A8E5E; border-radius:3px;" />
                <span class="d-stack-seg" style="flex:39.5; background:#0F8C4D; border-radius:3px;" />
                <span class="d-stack-seg" style="flex:19.5; background:#5B4A7A; border-radius:3px;" />
              </div>
              <div v-for="(c, i) in composicao" :key="c.label" class="d-comp-row" :class="{ 'is-last': i === composicao.length - 1 }">
                <div class="d-comp-meta">
                  <div class="d-comp-top">
                    <span class="d-comp-dot" :style="{ background: c.color }" />
                    <span class="d-comp-name">{{ c.label }}</span>
                    <span class="d-comp-pct d-mut">{{ c.pct }}%</span>
                  </div>
                  <div class="d-comp-val"><span class="d-mut">R$ </span>{{ c.value }}</div>
                </div>
                <svg viewBox="0 0 80 30" preserveAspectRatio="none" class="d-comp-spark">
                  <path :d="c.dsparkPath"
                        fill="none" :stroke="c.delta >= 0 ? '#0F8C4D' : '#C4413A'"
                        stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
                </svg>
                <span class="d-comp-delta" :class="c.delta >= 0 ? 'd-pos' : 'd-neg'">
                  {{ c.delta >= 0 ? '+' : '' }}{{ c.delta.toFixed(1).replace('.', ',') }}%
                </span>
              </div>
            </div>

            <div class="d-card">
              <div class="d-section-h">
                <span class="title">Resultado · P&amp;L</span>
                <span class="link">Detalhes →</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-top:4px;">
                <div>
                  <div class="d-label" style="font-size:10px;">12 meses</div>
                  <div class="d-pnl-num">+ R$ 78.420</div>
                  <div class="d-mut" style="font-size:11px; margin-top:3px;">≈ R$ 6.535 / mês · 18,4%</div>
                </div>
                <div style="text-align:right;">
                  <div class="d-label" style="font-size:10px;">Melhor mês</div>
                  <div style="font-size:14px; font-weight:600; color:#0F8C4D; margin-top:3px; font-variant-numeric:tabular-nums;">+R$ 14.2k</div>
                  <div class="d-mut" style="font-size:10px; margin-top:1px;">Out · 2025</div>
                </div>
              </div>
              <div class="d-divider" />
              <svg viewBox="0 0 720 480" preserveAspectRatio="none" class="d-pnl-bars">
                <line x1="4" x2="716" y1="240" y2="240" stroke="rgba(15,15,14,.12)" stroke-dasharray="5 7" />
                <rect x="4"    y="120" width="50" height="120" rx="3" fill="#0F8C4D" fill-opacity=".75" />
                <rect x="64"   y="60"  width="50" height="180" rx="3" fill="#0F8C4D" fill-opacity=".75" />
                <rect x="124"  y="240" width="50" height="60"  rx="3" fill="#C4413A" fill-opacity=".75" />
                <rect x="184"  y="20"  width="50" height="220" rx="3" fill="#0F8C4D" fill-opacity=".75" />
                <rect x="244"  y="0"   width="50" height="240" rx="3" fill="#0F8C4D" fill-opacity=".75" />
                <rect x="304"  y="140" width="50" height="100" rx="3" fill="#0F8C4D" fill-opacity=".75" />
                <rect x="364"  y="240" width="50" height="50"  rx="3" fill="#C4413A" fill-opacity=".75" />
                <rect x="424"  y="80"  width="50" height="160" rx="3" fill="#0F8C4D" fill-opacity=".75" />
                <rect x="484"  y="240" width="50" height="85"  rx="3" fill="#C4413A" fill-opacity=".75" />
                <rect x="544"  y="100" width="50" height="140" rx="3" fill="#0F8C4D" fill-opacity=".75" />
                <rect x="604"  y="50"  width="50" height="190" rx="3" fill="#0F8C4D" fill-opacity=".75" />
                <rect x="664"  y="125" width="50" height="115" rx="3" fill="#0F8C4D" />
              </svg>
              <div class="d-pnl-legend">
                <div class="d-pnl-legend-row">
                  <span style="width:8px; height:8px; border-radius:2px; background:#0F8C4D;" />
                  <span>Ganho</span>
                  <span style="color:rgba(15,15,14,.4);">9</span>
                </div>
                <div class="d-pnl-legend-row">
                  <span style="width:8px; height:8px; border-radius:2px; background:#C4413A;" />
                  <span>Perda</span>
                  <span style="color:rgba(15,15,14,.4);">3</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Posições — full table -->
          <div class="d-card" style="padding: 0;">
            <div class="d-holdings-head">
              <span style="font-size:15px; font-weight:600; letter-spacing:-.01em;">Posições · {{ currentHoldings.length }} ativos</span>
              <div class="d-tabs-class">
                <span v-for="t in classTabs" :key="t.v"
                      class="d-tab-class"
                      :class="{ active: activeClassTab === t.v }"
                      @click="activeClassTab = t.v">
                  {{ t.label }} <span class="d-tab-class-count">{{ t.count }}</span>
                </span>
              </div>
            </div>

            <div class="d-holdings-thead">
              <div>Ativo</div>
              <div>Quantidade</div>
              <div style="text-align:right;">Preço médio</div>
              <div style="text-align:right;">Hoje</div>
              <div style="text-align:center;">30d</div>
              <div style="text-align:right;">Total</div>
            </div>

            <div v-for="(h, i) in currentHoldings" :key="h.ticker"
                 class="d-holding"
                 :class="{ 'is-last': i === currentHoldings.length - 1 }">
              <div>
                <div class="d-holding-tk">{{ h.ticker }}</div>
                <div class="d-holding-name">{{ h.name }}</div>
              </div>
              <div class="d-holding-qty">{{ h.qty }}</div>
              <div class="d-holding-avg">R$ —</div>
              <div style="text-align:right;">
                <div class="d-holding-delta" :class="h.delta >= 0 ? 'd-pos' : 'd-neg'">
                  {{ h.delta >= 0 ? '+' : '' }}{{ h.delta.toFixed(2).replace('.', ',') }}%
                </div>
              </div>
              <div style="display:flex; justify-content:center;">
                <svg viewBox="0 0 80 28" class="d-holding-spark">
                  <path :d="dsparkPath(h.spark)"
                        fill="none"
                        :stroke="h.delta >= 0 ? '#0F8C4D' : '#C4413A'"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
              </div>
              <div style="text-align:right; font-size:14px; font-weight:500; font-variant-numeric:tabular-nums;">R$ {{ h.val }}</div>
            </div>
          </div>

          <!-- ROW: Renda passiva + Sugestão IA CTA -->
          <div class="d-grid-2col" style="grid-template-columns: 1.4fr 1fr;">
            <div class="d-card">
              <div class="d-section-h">
                <span class="title">Renda passiva</span>
                <span class="link">Calendário →</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <div class="d-label" style="font-size:10px;">Projeção · 12 meses</div>
                  <div class="d-pnl-num">+ R$ 8.700</div>
                  <div class="d-mut" style="font-size:11px; margin-top:3px;">≈ R$ 725 / mês</div>
                </div>
                <span class="d-delta-chip pos">DY 7,8%</span>
              </div>
              <div class="d-divider" />
              <div class="d-renda-bars">
                <div v-for="(v, i) in rendaPassivaBars" :key="i" class="d-renda-bar-col">
                  <div class="d-renda-bar"
                       :style="{ height: (v / 500 * 100) + '%', background: i === 11 ? '#0F8C4D' : 'rgba(15,140,77,.25)' }" />
                </div>
              </div>
              <div class="d-renda-labels">
                <div v-for="m in pnlMonths" :key="m">{{ m }}</div>
              </div>
            </div>

            <div class="d-suggest-card">
              <div>
                <div class="d-suggest-eyebrow">Sugestão IA</div>
                <div class="d-suggest-title">Rebalancear carteira</div>
                <div class="d-suggest-body">Ações BR está 5pp acima do alvo. Considere mover R$ 7,1k para Renda Fixa.</div>
              </div>
              <div class="d-suggest-actions">
                <div class="d-suggest-btn primary">Simular →</div>
                <div class="d-suggest-btn ghost">Ignorar</div>
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

const activePeriod = ref('1A')
const periods = ['1D', '1S', '1M', '3M', '1A', '5A', 'Tudo']

const activeClassTab = ref('acoes')

const navMain = [
  { label: 'Início',     icon: 'i-lucide-house',    to: '/dev/mobile-layouts/v4/home' },
  { label: 'Carteira',   icon: 'i-lucide-wallet',   to: '/dev/mobile-layouts/v4/carteira' },
  { label: 'Raio-X',     icon: 'i-lucide-radar',    to: '/dev/mobile-layouts/v4/raio-x',    badge: 'novo' },
  { label: 'Calendário', icon: 'i-lucide-calendar', to: '/dev/mobile-layouts/v4/calendario' },
  { label: 'Carta',      icon: 'i-lucide-mail',     to: '/dev/mobile-layouts/v4/carta' },
]
const navTools = [
  { label: 'Chat IA',      icon: 'i-lucide-sparkles',   badge: '2' },
  { label: 'Calculadoras', icon: 'i-lucide-calculator' },
  { label: 'Rankings',     icon: 'i-lucide-trophy' },
  { label: 'Setores',      icon: 'i-lucide-grid-2x2' },
  { label: 'Guias',        icon: 'i-lucide-book' },
]
const mobileTabs = [
  { label: 'Início',   icon: 'i-lucide-house',  to: '/dev/mobile-layouts/v4/home' },
  { label: 'Carteira', icon: 'i-lucide-wallet', to: '/dev/mobile-layouts/v4/carteira' },
  { label: 'Raio-X',   icon: 'i-lucide-radar',  to: '/dev/mobile-layouts/v4/raio-x' },
  { label: 'Mercado',  icon: 'i-lucide-globe',  to: '/dev/mobile-layouts/v4/mercado' },
]

const banks = [
  { name: 'Itaú',        holdings: '8 ativos', value: 'R$ 287.420', color: '#EC7000', initials: 'i', initialsColor: '#fff' },
  { name: 'BTG Pactual', holdings: '4 ativos', value: 'R$ 217.786', color: '#FFEE00', initials: 'B', initialsColor: '#0F0F0E' },
]

const composicao = [
  { label: 'Ações BR', pct: '41.1', value: '209.300', delta: -0.9, color: '#1A8E5E',
    sparkPath:  'M0,10 L10,12 L19,14 L28,11 L37,14 L46,17 L56,19',
    dsparkPath: 'M0,12 L13,15 L26,18 L40,16 L53,20 L66,23 L80,25' },
  { label: 'FIIs',     pct: '39.5', value: '201.300', delta: -1.9, color: '#0F8C4D',
    sparkPath:  'M0,8 L10,11 L19,13 L28,16 L37,18 L46,20 L56,21',
    dsparkPath: 'M0,10 L13,13 L26,16 L40,19 L53,22 L66,24 L80,26' },
  { label: 'Tesouro',  pct: '19.5', value: ' 99.300', delta: -0.6, color: '#5B4A7A',
    sparkPath:  'M0,14 L10,13 L19,14 L28,14 L37,15 L46,14 L56,14',
    dsparkPath: 'M0,17 L13,16 L26,17 L40,17 L53,18 L66,17 L80,17' },
]

const pnlMonths = ['JUN','JUL','AGO','SET','OUT','NOV','DEZ','JAN','FEV','MAR','ABR','MAI']
const rendaPassivaBars = [210, 180, 290, 240, 340, 295, 412, 380, 445, 312, 498, 402]

const classTabs = [
  { v: 'acoes',   label: 'Ações',   count: 5 },
  { v: 'fiis',    label: 'FIIs',    count: 4 },
  { v: 'tesouro', label: 'Tesouro', count: 3 },
]

const holdings: Record<string, Array<{ ticker: string; name: string; qty: string; val: string; delta: number; spark: 'up' | 'down' | 'flat' }>> = {
  acoes: [
    { ticker: 'PETR4', name: 'Petrobras PN',       qty: '180 cotas', val: '69.156', delta:  2.14, spark: 'up' },
    { ticker: 'ITUB4', name: 'Itaú Unibanco PN',   qty: '420 cotas', val: '12.230', delta: -1.43, spark: 'down' },
    { ticker: 'VALE3', name: 'Vale ON',            qty: '150 cotas', val:  '7.943', delta:  1.32, spark: 'up' },
    { ticker: 'BBDC4', name: 'Bradesco PN',        qty: '300 cotas', val:  '7.230', delta: -0.87, spark: 'down' },
    { ticker: 'BBAS3', name: 'Banco do Brasil ON', qty:  '85 cotas', val:  '2.456', delta:  0.42, spark: 'flat' },
  ],
  fiis: [
    { ticker: 'HGLG11', name: 'CSHG Logística',     qty: '120 cotas', val: '19.008', delta:  0.84, spark: 'up' },
    { ticker: 'MCCI11', name: 'Mauá Capital RF',    qty: '180 cotas', val: '17.640', delta: -0.32, spark: 'flat' },
    { ticker: 'KNRI11', name: 'Kinea Renda',        qty:  '90 cotas', val: '13.041', delta:  0.21, spark: 'up' },
    { ticker: 'CPTS11', name: 'Capitânia Securit.', qty: '160 cotas', val: '12.840', delta:  0.15, spark: 'flat' },
  ],
  tesouro: [
    { ticker: 'IPCA+',  name: 'IPCA+ 2030',         qty: '12 títulos', val: '48.330', delta: -0.60, spark: 'flat' },
    { ticker: 'CDB-X',  name: 'CDB Banco X · 112%', qty: 'liq. 2027',  val: '30.420', delta:  0.42, spark: 'flat' },
    { ticker: 'LCI',    name: 'LCI · 96% CDI',      qty: 'liq. 2026',  val: '20.550', delta:  0.38, spark: 'flat' },
  ],
}

const currentHoldings = computed(() => holdings[activeClassTab.value])

// Sparkline paths (static, plausible) — 56x22 mobile
function sparkPath(spark: 'up' | 'down' | 'flat') {
  if (spark === 'up')   return 'M0,16 L9,14 L18,15 L28,11 L37,12 L46,8 L56,6'
  if (spark === 'down') return 'M0,6 L9,8 L18,9 L28,12 L37,11 L46,14 L56,17'
  return 'M0,11 L9,11 L18,10 L28,11 L37,11 L46,12 L56,11'
}
// Desktop sparkline 80x28
function dsparkPath(spark: 'up' | 'down' | 'flat') {
  if (spark === 'up')   return 'M0,21 L13,18 L26,19 L40,14 L53,15 L66,10 L80,7'
  if (spark === 'down') return 'M0,7 L13,10 L26,11 L40,15 L53,14 L66,18 L80,22'
  return 'M0,14 L13,14 L26,13 L40,14 L53,14 L66,15 L80,14'
}
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

/* ============ MOBILE SHELL ============ */
.phone.mercury {
  background: #F8F6F1;
  color: #0F0F0E;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  min-height: 100vh;
  position: relative;
  max-width: 480px;
  margin: 0 auto;
}
.phone.mercury .m-appbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 24px 22px 16px;
  position: sticky; top: 0; z-index: 30;
  background: rgba(248,246,241,.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.phone.mercury .m-appbar-icons { display: inline-flex; gap: 8px; }
.phone.mercury .m-iconbtn {
  width: 34px; height: 34px; border-radius: 999px;
  background: transparent; color: rgba(15,15,14,.6);
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer; border: 0;
}
.phone.mercury .m-iconbtn-circle { background: rgba(15,15,14,.04); }
.phone.mercury .m-iconbtn:hover { background: rgba(15,15,14,.08); }

.phone.mercury .m-scroll { padding: 4px 0 120px; }
.phone.mercury .m-scroll::-webkit-scrollbar { display: none; }
.phone.mercury .m-mut { color: rgba(15,15,14,.5); }
.phone.mercury .m-link { color: #0F0F0E; font-size: 13px; font-weight: 500; cursor: pointer; }

.phone.mercury .m-card {
  margin: 0 16px; padding: 22px 20px;
  background: #FFFFFF; border-radius: 20px;
  box-shadow: 0 1px 0 rgba(15,15,14,.04), 0 8px 24px -12px rgba(15,15,14,.08);
}
.phone.mercury .m-card-lg { padding: 24px 22px; }
.phone.mercury .m-card + .m-card { margin-top: 10px; }

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

.phone.mercury .m-delta-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 9px; border-radius: 6px;
  font-size: 12px; font-weight: 500; font-variant-numeric: tabular-nums;
}
.phone.mercury .m-delta-chip.neg { background: rgba(196,65,58,.08); color: #C4413A; }
.phone.mercury .m-delta-chip.pos { background: rgba(15,140,77,.08); color: #0F8C4D; }
.phone.mercury .m-patrim-delta-row {
  display: inline-flex; align-items: center; gap: 10px; margin-top: 12px;
}
.phone.mercury .m-patrim-chart {
  width: 100%;
  display: block; margin-left: -6px; margin-right: -6px;
}

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

/* Mini stats row */
.phone.mercury .m-mini-stats {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 8px; padding: 14px 16px 0;
}
.phone.mercury .m-mini-stat {
  background: #FFFFFF;
  border: 1px solid rgba(15,15,14,.05);
  border-radius: 12px;
  padding: 12px;
}
.phone.mercury .m-mini-stat-v {
  font-size: 17px; font-weight: 600; margin-top: 4px;
  letter-spacing: -.015em; font-variant-numeric: tabular-nums;
  color: #0F0F0E;
}
.phone.mercury .m-mini-stat-v.pos { color: #0F8C4D; }
.phone.mercury .m-mini-stat-v.neg { color: #C4413A; }

/* Banks */
.phone.mercury .m-banks {
  display: flex; gap: 8px;
  padding: 0 16px;
  overflow-x: auto; scrollbar-width: none;
}
.phone.mercury .m-banks::-webkit-scrollbar { display: none; }
.phone.mercury .m-bank-card {
  flex-shrink: 0; min-width: 148px;
  background: #FFFFFF;
  border: 1px solid rgba(15,15,14,.05);
  border-radius: 14px;
  padding: 14px 14px 12px;
}
.phone.mercury .m-bank-mark {
  width: 30px; height: 30px; border-radius: 8px;
  display: grid; place-items: center;
  font-weight: 700; font-size: 14px; letter-spacing: -.02em;
}
.phone.mercury .m-bank-name { font-size: 12px; font-weight: 600; letter-spacing: -.005em; line-height: 1.1; }
.phone.mercury .m-bank-holdings { font-size: 10px; color: rgba(15,15,14,.5); margin-top: 1px; }
.phone.mercury .m-bank-value { font-size: 13px; font-weight: 600; letter-spacing: -.01em; font-variant-numeric: tabular-nums; }
.phone.mercury .m-bank-sync { display: flex; align-items: center; gap: 5px; margin-top: 6px; }
.phone.mercury .m-bank-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #0F8C4D;
  box-shadow: 0 0 0 3px rgba(15,140,77,.15);
}
.phone.mercury .m-bank-sync-lbl { font-size: 10px; color: rgba(15,15,14,.5); font-weight: 500; }

.phone.mercury .m-bank-add {
  flex-shrink: 0; min-width: 148px;
  background: transparent;
  border: 1px dashed rgba(15,15,14,.18);
  border-radius: 14px;
  padding: 14px;
  display: flex; flex-direction: column; justify-content: space-between;
  cursor: pointer;
}
.phone.mercury .m-bank-add-ic {
  width: 30px; height: 30px; border-radius: 8px;
  background: rgba(15,15,14,.06); color: rgba(15,15,14,.7);
  display: grid; place-items: center;
}
.phone.mercury .m-bank-add-title { font-size: 12px; font-weight: 600; letter-spacing: -.005em; margin-top: 14px; }
.phone.mercury .m-bank-add-sub { font-size: 10px; color: rgba(15,15,14,.5); margin-top: 3px; line-height: 1.3; }

/* stack bar + composição */
.phone.mercury .m-stack-bar {
  display: flex; width: 100%; height: 6px;
  border-radius: 999px; overflow: hidden;
  margin-bottom: 18px;
}
.phone.mercury .m-stack-seg { height: 100%; }
.phone.mercury .m-comp-row {
  display: grid; grid-template-columns: minmax(0, 1fr) 56px auto;
  align-items: center; gap: 12px; padding: 12px 0;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.phone.mercury .m-comp-row.is-last { border-bottom: 0; padding-bottom: 0; }
.phone.mercury .m-comp-row:first-of-type { padding-top: 0; }
.phone.mercury .m-comp-meta { min-width: 0; }
.phone.mercury .m-comp-top {
  display: inline-flex; align-items: center; gap: 8px;
  margin-bottom: 4px;
}
.phone.mercury .m-comp-dot { width: 6px; height: 6px; border-radius: 999px; }
.phone.mercury .m-comp-name { font-size: 13px; font-weight: 500; }
.phone.mercury .m-comp-pct { font-size: 13px; color: rgba(15,15,14,.5); font-variant-numeric: tabular-nums; }
.phone.mercury .m-comp-val { font-size: 13px; font-variant-numeric: tabular-nums; }
.phone.mercury .m-comp-spark { width: 56px; height: 22px; display: block; }

/* P&L */
.phone.mercury .m-pnl-num {
  font-size: 24px; font-weight: 600; letter-spacing: -.025em;
  margin-top: 6px; color: #0F8C4D;
  font-variant-numeric: tabular-nums;
}
.phone.mercury .m-divider {
  height: 1px; background: rgba(15,15,14,.06);
  margin: 16px -20px 14px;
}
.phone.mercury .m-pnl-bars {
  width: 100%; height: 132px; display: block;
}
.phone.mercury .m-pnl-legend {
  display: flex; gap: 14px; margin-top: 10px;
  font-size: 11px; color: rgba(15,15,14,.55);
}
.phone.mercury .m-pnl-legend-row { display: flex; align-items: center; gap: 5px; }

/* Class tabs */
.phone.mercury .m-tabs-class {
  display: flex; gap: 4px; padding: 3px;
  background: rgba(15,15,14,.04); border-radius: 10px;
}
.phone.mercury .m-tab-class {
  flex: 1; padding: 8px 14px; border-radius: 7px; text-align: center;
  font-size: 12px; font-weight: 500;
  color: rgba(15,15,14,.5);
  background: transparent;
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 5px;
}
.phone.mercury .m-tab-class.active {
  color: #0F0F0E; background: #FFFFFF;
  box-shadow: 0 1px 2px rgba(15,15,14,.06);
}
.phone.mercury .m-tab-class-count { font-size: 10px; opacity: .55; }

/* Holdings */
.phone.mercury .m-holding {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 22px;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.phone.mercury .m-holding.is-last { border-bottom: 0; }
.phone.mercury .m-holding-tk { font-size: 14px; font-weight: 600; letter-spacing: -.005em; }
.phone.mercury .m-holding-qty { font-size: 11px; color: rgba(15,15,14,.5); margin-top: 1px; }
.phone.mercury .m-holding-spark { width: 56px; height: 22px; display: block; flex-shrink: 0; }
.phone.mercury .m-holding-val { font-size: 14px; font-weight: 500; font-variant-numeric: tabular-nums; }
.phone.mercury .m-holding-delta {
  font-size: 11px; font-weight: 600; margin-top: 2px;
  font-variant-numeric: tabular-nums;
}
.phone.mercury .m-holding-delta.pos { color: #0F8C4D; }
.phone.mercury .m-holding-delta.neg { color: #C4413A; }

/* Renda passiva bars */
.phone.mercury .m-renda-bars {
  display: flex; align-items: flex-end; gap: 5px; height: 48px;
}
.phone.mercury .m-renda-bar-col {
  flex: 1; height: 100%;
  display: flex; flex-direction: column; justify-content: flex-end;
}
.phone.mercury .m-renda-bar {
  width: 100%; border-radius: 3px;
}
.phone.mercury .m-renda-labels {
  display: flex; gap: 5px; margin-top: 6px;
  font-size: 9px; font-family: 'IBM Plex Mono', monospace;
  color: rgba(15,15,14,.4); letter-spacing: .06em;
}
.phone.mercury .m-renda-labels > div { flex: 1; text-align: center; }

/* CTA */
.phone.mercury .m-cta {
  margin: 0 16px; padding: 18px 20px;
  background: #0F0F0E; color: #FFFFFF;
  border-radius: 20px;
  display: flex; align-items: center; justify-content: space-between;
  cursor: pointer;
}
.phone.mercury .m-cta .t { font-size: 16px; font-weight: 500; letter-spacing: -.01em; }
.phone.mercury .m-cta .s { font-size: 12px; color: rgba(255,255,255,.55); margin-top: 2px; }
.phone.mercury .m-cta-arrow {
  display: grid; place-items: center;
  width: 38px; height: 38px; border-radius: 50%;
  background: rgba(255,255,255,.1);
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
  padding: 4px 8px; text-decoration: none;
  font-family: inherit;
}
.phone.mercury .m-tab.active { color: #0F0F0E; }
.phone.mercury .m-tab svg { width: 22px; height: 22px; }
.phone.mercury .m-tab .lbl { font-size: 10px; font-weight: 500; }


/* ============ DESKTOP SHELL ============ */
.dt.mercury-dt {
  background: #F8F6F1;
  color: #0F0F0E;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  min-height: 100vh;
  position: relative;
}
.dt .d-mut { color: rgba(15,15,14,.55); }
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
.dt .d-side .d-brand .nm { font-size: 16px; font-weight: 600; letter-spacing: -.01em; }
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
  text-decoration: none;
}
.dt .d-side .d-nav .item:hover { background: rgba(15,15,14,.04); color: #0F0F0E; }
.dt .d-side .d-nav .item.active { background: #0F0F0E; color: #FFFFFF; }
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
.dt .d-main { flex: 1; min-width: 0; overflow-y: auto; overflow-x: hidden; }
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
.dt .d-topbar .right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
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
  display: flex; flex-direction: column; gap: 14px;
}
.dt .d-greet {
  display: flex; justify-content: space-between; align-items: flex-end;
  padding-bottom: 4px;
}
.dt .d-greet .h { font-size: 26px; font-weight: 600; letter-spacing: -.022em; }
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
.dt .d-delta-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 6px;
  font-size: 12px; font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.dt .d-delta-chip.neg { background: rgba(196,65,58,.08); color: #C4413A; }
.dt .d-delta-chip.pos { background: rgba(15,140,77,.10); color: #0F8C4D; }
.dt .d-patrim-delta-row { display: inline-flex; align-items: center; gap: 10px; margin-top: 12px; }
.dt .d-patrim-chart { width: 100%; height: 200px; display: block; }

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

/* desktop row layouts */
.dt .d-row-1 { display: grid; gap: 14px; margin-bottom: 0; }
.dt .d-grid-2col { display: grid; gap: 14px; }

/* mini stats desktop */
.dt .d-mini-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.dt .d-mini-stat {
  background: #FFFFFF;
  border: 1px solid rgba(15,15,14,.05);
  border-radius: 12px;
  padding: 12px;
}
.dt .d-mini-stat-v {
  font-size: 17px; font-weight: 600; margin-top: 4px;
  letter-spacing: -.015em; font-variant-numeric: tabular-nums;
}
.dt .d-mini-stat-v.pos { color: #0F8C4D; }

/* desktop banks */
.dt .d-bank-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.dt .d-bank-mark {
  width: 30px; height: 30px; border-radius: 8px;
  display: grid; place-items: center;
  font-weight: 700; font-size: 14px; letter-spacing: -.02em;
  flex-shrink: 0;
}
.dt .d-bank-name { font-size: 13px; font-weight: 600; letter-spacing: -.005em; line-height: 1.1; }
.dt .d-bank-sub { font-size: 10px; color: rgba(15,15,14,.5); margin-top: 2px; }
.dt .d-bank-val { font-size: 13px; font-weight: 500; font-variant-numeric: tabular-nums; }
.dt .d-bank-sync {
  display: flex; align-items: center; justify-content: flex-end; gap: 5px;
  margin-top: 2px;
}
.dt .d-bank-dot { width: 5px; height: 5px; border-radius: 50%; background: #0F8C4D; }
.dt .d-bank-sync-lbl { font-size: 9px; color: rgba(15,15,14,.5); font-weight: 500; }

.dt .d-bank-add-row {
  margin-top: 6px;
  padding: 10px 12px; border-radius: 10px;
  border: 1px dashed rgba(15,15,14,.18);
  display: flex; align-items: center; gap: 10px;
  cursor: pointer;
}
.dt .d-bank-add-ic {
  width: 28px; height: 28px; border-radius: 8px;
  background: rgba(15,15,14,.05); color: rgba(15,15,14,.65);
  display: grid; place-items: center;
}

/* composição desktop */
.dt .d-stack-bar { display: flex; width: 100%; overflow: hidden; }
.dt .d-stack-seg { height: 100%; }
.dt .d-comp-row {
  display: grid; grid-template-columns: minmax(0, 1fr) 80px auto;
  align-items: center; gap: 14px; padding: 12px 0;
  border-bottom: 1px solid rgba(15,15,14,.04);
}
.dt .d-comp-row.is-last { border-bottom: 0; padding-bottom: 0; }
.dt .d-comp-meta { min-width: 0; }
.dt .d-comp-top { display: inline-flex; align-items: baseline; gap: 8px; }
.dt .d-comp-dot { width: 7px; height: 7px; border-radius: 999px; align-self: center; }
.dt .d-comp-name { font-size: 14px; font-weight: 600; }
.dt .d-comp-pct { font-size: 12px; font-variant-numeric: tabular-nums; }
.dt .d-comp-val { font-size: 13px; color: rgba(15,15,14,.7); font-variant-numeric: tabular-nums; margin-top: 4px; }
.dt .d-comp-spark { width: 80px; height: 30px; display: block; }
.dt .d-comp-delta { font-size: 13px; font-weight: 500; font-variant-numeric: tabular-nums; }

/* P&L desktop */
.dt .d-pnl-num {
  font-size: 24px; font-weight: 600; letter-spacing: -.025em;
  margin-top: 6px; color: #0F8C4D;
  font-variant-numeric: tabular-nums;
}
.dt .d-divider {
  height: 1px; background: rgba(15,15,14,.06);
  margin: 14px 0 12px;
}
.dt .d-pnl-bars { width: 100%; height: 160px; display: block; }
.dt .d-pnl-legend {
  display: flex; gap: 14px; margin-top: 10px;
  font-size: 11px; color: rgba(15,15,14,.55);
}
.dt .d-pnl-legend-row { display: flex; align-items: center; gap: 5px; }

/* Posições desktop */
.dt .d-holdings-head {
  padding: 20px 22px 14px;
  display: flex; justify-content: space-between; align-items: center;
}
.dt .d-tabs-class {
  display: flex; gap: 4px; padding: 3px;
  background: rgba(15,15,14,.04); border-radius: 10px;
}
.dt .d-tab-class {
  padding: 8px 14px; border-radius: 7px; text-align: center;
  font-size: 12px; font-weight: 500;
  color: rgba(15,15,14,.5);
  background: transparent;
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 5px;
}
.dt .d-tab-class.active {
  color: #0F0F0E; background: #FFFFFF;
  box-shadow: 0 1px 2px rgba(15,15,14,.06);
}
.dt .d-tab-class-count { font-size: 10px; opacity: .55; }

.dt .d-holdings-thead {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 100px 100px 1fr;
  gap: 14px; padding: 10px 22px;
  border-top: 1px solid rgba(15,15,14,.06);
  border-bottom: 1px solid rgba(15,15,14,.06);
  font-size: 10px; font-weight: 600;
  letter-spacing: .08em; text-transform: uppercase;
  color: rgba(15,15,14,.45);
}
.dt .d-holding {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 100px 100px 1fr;
  gap: 14px; padding: 14px 22px;
  align-items: center;
  border-bottom: 1px solid rgba(15,15,14,.04);
}
.dt .d-holding.is-last { border-bottom: 0; }
.dt .d-holding-tk { font-size: 14px; font-weight: 600; letter-spacing: -.005em; }
.dt .d-holding-name { font-size: 11px; color: rgba(15,15,14,.5); margin-top: 2px; }
.dt .d-holding-qty { font-size: 13px; color: rgba(15,15,14,.7); }
.dt .d-holding-avg { font-size: 13px; color: rgba(15,15,14,.7); text-align: right; font-variant-numeric: tabular-nums; }
.dt .d-holding-delta { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.dt .d-holding-delta.d-pos { color: #0F8C4D; }
.dt .d-holding-delta.d-neg { color: #C4413A; }
.dt .d-holding-spark { width: 80px; height: 28px; display: block; }

/* Renda passiva desktop */
.dt .d-renda-bars {
  display: flex; align-items: flex-end; gap: 5px; height: 60px;
}
.dt .d-renda-bar-col {
  flex: 1; height: 100%;
  display: flex; flex-direction: column; justify-content: flex-end;
}
.dt .d-renda-bar { width: 100%; border-radius: 3px; }
.dt .d-renda-labels {
  display: flex; gap: 5px; margin-top: 6px;
  font-size: 9px; font-family: 'IBM Plex Mono', monospace;
  color: rgba(15,15,14,.4); letter-spacing: .06em;
}
.dt .d-renda-labels > div { flex: 1; text-align: center; }

/* Suggest card */
.dt .d-suggest-card {
  background: #0F0F0E; color: #FAF6EA;
  border-radius: 18px;
  padding: 24px 22px;
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; justify-content: space-between;
}
.dt .d-suggest-eyebrow {
  color: rgba(255,255,255,.6); font-size: 10px;
  letter-spacing: .08em; text-transform: uppercase; font-weight: 600;
}
.dt .d-suggest-title {
  font-size: 20px; font-weight: 600; margin-top: 8px;
  letter-spacing: -.015em; line-height: 1.25;
}
.dt .d-suggest-body {
  font-size: 13px; color: rgba(255,255,255,.6);
  margin-top: 6px; line-height: 1.4;
}
.dt .d-suggest-actions { display: flex; gap: 8px; margin-top: 18px; }
.dt .d-suggest-btn {
  padding: 9px 16px; border-radius: 9px;
  font-size: 12px; font-weight: 500; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
}
.dt .d-suggest-btn.primary { background: #FAF6EA; color: #0F0F0E; }
.dt .d-suggest-btn.ghost { background: rgba(255,255,255,.08); color: rgba(255,255,255,.85); }
</style>

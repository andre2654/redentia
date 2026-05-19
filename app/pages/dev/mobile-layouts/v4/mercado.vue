<!--
  V4 — Mercado Mercury Bank (port direto do Figma JSX).

  Toggle "Para você" vs "Mercado completo" — modo completo é o default.
  Estratégia: 2 shells separados (mobile + desktop).
-->
<template>
  <div class="v4">

    <!-- ============ MOBILE SHELL (.phone.mercury) ============ -->
    <div class="phone mercury">
      <div class="m-appbar" style="padding-bottom:18px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="m-backbtn">
            <UIcon name="i-lucide-chevron-left" class="size-4" />
          </div>
          <div>
            <div class="m-label" style="font-size:10px;">Bolsa aberta · ao vivo</div>
            <div style="font-size:18px; font-weight:600; letter-spacing:-.015em; margin-top:2px;">Mercado</div>
          </div>
        </div>
      </div>

      <!-- Toggle Para você / Mercado completo -->
      <div style="display:flex; justify-content:center; padding:0 16px 14px;">
        <div class="m-mode-toggle">
          <span
            :class="['m-mode-opt', { active: mode === 'voce' }]"
            @click="mode = 'voce'">
            <UIcon name="i-lucide-user" class="size-3" />
            Para você
          </span>
          <span
            :class="['m-mode-opt', { active: mode === 'completo' }]"
            @click="mode = 'completo'">
            <UIcon name="i-lucide-globe" class="size-3" />
            Mercado completo
          </span>
        </div>
      </div>

      <div class="m-scroll">
        <!-- IBOV Hero -->
        <div class="m-card m-card-lg">
          <div style="display:flex; align-items:flex-start; justify-content:space-between;">
            <div>
              <div class="m-label">Ibovespa</div>
              <div class="m-ibov-num">128.420 <span class="m-ibov-unit">pts</span></div>
              <div style="display:flex; gap:8px; align-items:center; margin-top:8px;">
                <span class="m-pill-pos">↑ 1,24%</span>
                <span style="font-size:12px; color:rgba(15,15,14,.55);">+1.572 pts hoje</span>
              </div>
            </div>
            <div class="m-live-pill">
              <span class="m-live-dot" />AO VIVO
            </div>
          </div>
          <svg viewBox="0 0 400 90" preserveAspectRatio="none" class="m-ibov-chart">
            <defs>
              <linearGradient id="mIbovGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#0F8C4D" stop-opacity="0.18" />
                <stop offset="100%" stop-color="#0F8C4D" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,72 L20,68 L40,62 L60,66 L80,58 L100,52 L120,56 L140,46 L160,42 L180,38 L200,44 L220,32 L240,28 L260,32 L280,22 L300,18 L320,22 L340,14 L360,10 L380,14 L400,8 L400,90 L0,90 Z"
                  fill="url(#mIbovGrad)" />
            <path d="M0,72 L20,68 L40,62 L60,66 L80,58 L100,52 L120,56 L140,46 L160,42 L180,38 L200,44 L220,32 L240,28 L260,32 L280,22 L300,18 L320,22 L340,14 L360,10 L380,14 L400,8"
                  fill="none" stroke="#0F8C4D" stroke-width="1.6"
                  stroke-linejoin="round" stroke-linecap="round" />
            <circle cx="400" cy="8" r="3.5" fill="#0F8C4D" />
          </svg>
          <div style="display:flex; justify-content:center; margin-top:14px;">
            <div class="m-seg">
              <span v-for="p in periods" :key="p"
                    class="s" :class="{ active: activePeriod === p }"
                    @click="activePeriod = p">{{ p }}</span>
            </div>
          </div>
        </div>

        <!-- CTA Hero "Caos" -->
        <div style="padding:14px 16px 0;">
          <div class="m-caos">
            <span class="m-caos-glow-r" />
            <span class="m-caos-glow-l" />
            <div style="position:relative;">
              <div class="m-caos-eyebrow">SUA IA FINANCEIRA</div>
              <div class="m-caos-h">
                Do <span class="m-caos-red">caos</span> do mercado<br />
                ao impacto na sua <span class="m-caos-gold">carteira.</span>
              </div>
              <div class="m-caos-sub">A Redent.IA traduz o que se move lá fora em ações concretas pra você.</div>
              <div style="margin-top:18px; display:flex; gap:8px;">
                <div class="m-caos-btn">
                  Ativar minha conta
                  <UIcon name="i-lucide-arrow-right" class="size-3" />
                </div>
                <div class="m-caos-btn-ghost">Ver demo</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ================== "PARA VOCÊ" — dados pessoais da carteira ================== -->
        <template v-if="mode === 'voce'">
          <!-- Patrimônio hero card -->
          <div class="m-card m-card-lg">
            <div class="m-label">Sua carteira hoje</div>
            <div class="m-pv-hero">R$ 504.623<span class="m-mut" style="font-size:20px;">,19</span></div>
            <div style="display:flex; align-items:center; gap:8px; margin-top:10px;">
              <span class="m-delta-chip neg">↓ 0,78%</span>
              <span style="font-size:12px; color:rgba(15,15,14,.55);">− R$ 3.954,41 hoje</span>
            </div>
            <div class="m-pv-impact">
              <div style="font-size:12px; color:rgba(15,15,14,.85); line-height:1.5;">
                <b>Principal impacto:</b> juros futuros pressionou ITSA4 e MCCI11 em <b style="color:#C4413A;">−R$ 2,41k</b>.
              </div>
            </div>
            <div class="m-pv-factors">
              <div v-for="f in pvFactors" :key="f.label" class="m-pv-factor">
                <div class="m-pv-factor-ic" :style="{ background: f.bg, color: f.color }">{{ f.icon }}</div>
                <div style="flex:1; min-width:0;">
                  <div class="m-pv-factor-label">{{ f.label }}</div>
                  <div class="m-pv-factor-amount">{{ f.amount }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Resumo do dia · IA -->
          <div class="m-card m-pv-resumo">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
              <span class="m-pv-resumo-logo">
                <img src="/brand/logo-icon.svg" alt="Redentia" />
              </span>
              <span class="m-pv-resumo-eyebrow">RESUMO DO DIA · 16:29</span>
            </div>
            <div style="font-size:14px; font-weight:600; letter-spacing:-.005em; margin-bottom:10px;">
              A leitura do dia, na sua linguagem
            </div>
            <div style="display:flex; gap:10px;">
              <div style="width:2px; background:#B7873A; border-radius:2px; flex-shrink:0;"></div>
              <div style="font-size:12px; color:#0F0F0E; line-height:1.5; flex:1;">
                Dia negativo (−0,78%). 74% do movimento veio de fatores macro, principalmente juros futuros (−R$ 2,4k). Reação setorial.
              </div>
            </div>
            <div class="m-pv-resumo-stats">
              <span><b>74%</b> setorial</span>
              <span style="color:rgba(15,15,14,.3);">·</span>
              <span><b>26%</b> específica</span>
              <span style="color:rgba(15,15,14,.3);">·</span>
              <span><b>8</b> ativos movidos</span>
            </div>
            <NuxtLink to="/dev/mobile-layouts/v4/chat" class="m-pv-resumo-cta">
              Continuar conversa
              <UIcon name="i-lucide-arrow-right" class="size-3" />
            </NuxtLink>
          </div>

          <!-- Seus ativos · caíram hoje -->
          <div class="m-section">
            <span class="title">Seus ativos · caíram hoje</span>
            <span class="link">Tudo →</span>
          </div>
          <div class="m-card" style="padding:4px 0;">
            <div class="m-pv-holdings-header">
              <UIcon name="i-lucide-chevron-down" class="size-3" />
              <span style="font-size:13px; font-weight:600;">22 ativos</span>
              <span style="margin-left:auto; font-size:12px; font-weight:600; color:#C4413A;">−R$ 3,97k</span>
              <span style="font-size:12px; font-weight:600; color:#C4413A;">−1,20%</span>
            </div>
            <NuxtLink v-for="(h, i) in pvHoldings" :key="h.t" to="/dev/mobile-layouts/v4/ativo"
                      class="m-pv-holding-row" :class="{ last: i === pvHoldings.length - 1 }">
              <span class="m-pv-holding-logo" :style="{ background: assetColor(h.t), color: assetTextColor(h.t) }">{{ h.t.charAt(0) }}</span>
              <div style="flex:1; min-width:0;">
                <div style="font-size:13px; font-weight:600;">{{ h.t }}</div>
                <div style="font-size:11px; color:rgba(15,15,14,.5);">{{ h.n }}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:12px; font-weight:600; color:#C4413A;">−R$ {{ Math.abs(h.hoje).toLocaleString('pt-BR') }}</div>
                <div style="font-size:11px; color:#C4413A; margin-top:2px;">{{ h.pct.toFixed(2).replace('.', ',') }}%</div>
              </div>
            </NuxtLink>
          </div>

          <!-- Bolsa em queda -->
          <div class="m-section">
            <span class="title">Bolsa em queda</span>
          </div>
          <div class="m-card">
            <div class="m-label">Ibovespa</div>
            <div style="font-size:30px; font-weight:600; letter-spacing:-.028em; margin-top:6px; line-height:1;">174.126</div>
            <div style="font-size:13px; color:#C4413A; margin-top:6px; font-weight:600;">↓ −1,78% · você 1pp acima</div>
            <div style="margin-top:14px; padding-top:14px; border-top:1px solid rgba(15,15,14,.06);">
              <div v-for="(r, i) in pvIndices" :key="r.l" class="m-pv-index-row" :class="{ last: i === pvIndices.length - 1 }">
                <span style="font-size:13px; color:rgba(15,15,14,.7);">{{ r.l }}</span>
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-size:13px; font-weight:600;">{{ r.v }}</span>
                  <span style="font-size:12px; font-weight:600; min-width:50px; text-align:right;" :style="{ color: r.c }">{{ r.d }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ================== "MERCADO COMPLETO" ================== -->
        <template v-if="mode === 'completo'">
          <!-- Ações -->
          <div class="m-section">
            <div>
              <span class="title">Ações</span>
              <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:1px; font-weight:500;">Top 5 altas e quedas</div>
            </div>
            <div class="m-tab-pill">
              <span :class="['m-tab-pill-opt', { 'up-active': tabAcoes === 'up' }]" @click="tabAcoes = 'up'">↑ Alta</span>
              <span :class="['m-tab-pill-opt', { 'dn-active': tabAcoes === 'dn' }]" @click="tabAcoes = 'dn'">↓ Queda</span>
            </div>
          </div>
          <div style="padding:0 16px 8px;">
            <FirstChartBlock :ticker="(tabAcoes === 'up' ? acoesUp : acoesDn)[0].t" :delta="(tabAcoes === 'up' ? acoesUp : acoesDn)[0].d" id-prefix="acoes" />
          </div>
          <div class="m-row-scroll">
            <NuxtLink v-for="it in (tabAcoes === 'up' ? acoesUp : acoesDn)" :key="it.t" to="/dev/mobile-layouts/v4/ativo" class="m-asset-card">
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="m-asset-logo" :style="{ background: assetColor(it.t), color: assetTextColor(it.t) }">{{ it.t.charAt(0) }}</span>
                <div style="font-size:13px; font-weight:600; letter-spacing:-.005em;">{{ it.t }}</div>
              </div>
              <div class="m-asset-delta" :style="{ color: it.d >= 0 ? '#0F8C4D' : '#C4413A' }">{{ formatDelta(it.d) }}%</div>
            </NuxtLink>
          </div>

          <!-- FIIs -->
          <div class="m-section">
            <div>
              <span class="title">FIIs</span>
              <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:1px; font-weight:500;">Fundos imobiliários</div>
            </div>
            <div class="m-tab-pill">
              <span :class="['m-tab-pill-opt', { 'up-active': tabFii === 'up' }]" @click="tabFii = 'up'">↑ Alta</span>
              <span :class="['m-tab-pill-opt', { 'dn-active': tabFii === 'dn' }]" @click="tabFii = 'dn'">↓ Queda</span>
            </div>
          </div>
          <div style="padding:0 16px 8px;">
            <FirstChartBlock :ticker="(tabFii === 'up' ? fiiUp : fiiDn)[0].t" :delta="(tabFii === 'up' ? fiiUp : fiiDn)[0].d" id-prefix="fii" />
          </div>
          <div class="m-row-scroll">
            <NuxtLink v-for="it in (tabFii === 'up' ? fiiUp : fiiDn)" :key="it.t" to="/dev/mobile-layouts/v4/ativo" class="m-asset-card">
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="m-asset-logo" :style="{ background: assetColor(it.t), color: assetTextColor(it.t) }">{{ it.t.charAt(0) }}</span>
                <div style="font-size:13px; font-weight:600; letter-spacing:-.005em;">{{ it.t }}</div>
              </div>
              <div class="m-asset-delta" :style="{ color: it.d >= 0 ? '#0F8C4D' : '#C4413A' }">{{ formatDelta(it.d) }}%</div>
            </NuxtLink>
          </div>

          <!-- ETFs -->
          <div class="m-section">
            <div>
              <span class="title">ETFs</span>
              <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:1px; font-weight:500;">Maiores altas</div>
            </div>
            <span class="link">Tudo →</span>
          </div>
          <div style="padding:0 16px 8px;">
            <FirstChartBlock :ticker="etfUp[0].t" :delta="etfUp[0].d" id-prefix="etf" />
          </div>
          <div class="m-row-scroll">
            <NuxtLink v-for="it in etfUp" :key="it.t" to="/dev/mobile-layouts/v4/ativo" class="m-asset-card">
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="m-asset-logo" :style="{ background: assetColor(it.t), color: assetTextColor(it.t) }">{{ it.t.charAt(0) }}</span>
                <div style="font-size:13px; font-weight:600; letter-spacing:-.005em;">{{ it.t }}</div>
              </div>
              <div class="m-asset-delta" style="color:#0F8C4D;">+{{ formatDelta(it.d) }}%</div>
            </NuxtLink>
          </div>

          <!-- BDRs -->
          <div class="m-section">
            <div>
              <span class="title">BDRs</span>
              <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:1px; font-weight:500;">Ações globais via BR</div>
            </div>
            <span class="link">Tudo →</span>
          </div>
          <div style="padding:0 16px 8px;">
            <FirstChartBlock :ticker="bdrUp[0].t" :delta="bdrUp[0].d" id-prefix="bdr" />
          </div>
          <div class="m-row-scroll">
            <NuxtLink v-for="it in bdrUp" :key="it.t" to="/dev/mobile-layouts/v4/ativo" class="m-asset-card">
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="m-asset-logo" :style="{ background: assetColor(it.t), color: assetTextColor(it.t) }">{{ it.t.charAt(0) }}</span>
                <div style="font-size:13px; font-weight:600; letter-spacing:-.005em;">{{ it.t }}</div>
              </div>
              <div class="m-asset-delta" style="color:#0F8C4D;">+{{ formatDelta(it.d) }}%</div>
            </NuxtLink>
          </div>
        </template>

        <!-- Cripto -->
        <div class="m-section">
          <span class="title">Cripto em destaque</span>
          <span class="link">Tudo →</span>
        </div>

        <!-- Bitcoin featured -->
        <div style="padding:0 16px 10px;">
          <div class="m-btc-card">
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <div style="display:flex; align-items:center; gap:10px;">
                <div class="m-btc-logo">B</div>
                <div>
                  <div style="display:flex; align-items:center; gap:5px;">
                    <span style="font-size:13px; font-weight:600;">Bitcoin</span>
                    <span class="m-btc-rank">#1</span>
                  </div>
                  <div style="font-size:10px; color:rgba(15,15,14,.5);">BTC · 30d</div>
                </div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:15px; font-weight:600; font-variant-numeric:tabular-nums;">R$ 423,8k</div>
                <div style="font-size:11px; font-weight:600; color:#C4413A; margin-top:2px;">−2,31%</div>
              </div>
            </div>
            <svg viewBox="0 0 320 60" preserveAspectRatio="none" class="m-btc-chart">
              <defs>
                <linearGradient id="mBtcGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#F7931A" stop-opacity="0.22" />
                  <stop offset="100%" stop-color="#F7931A" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,10 L20,14 L40,12 L60,18 L80,22 L100,18 L120,26 L140,24 L160,32 L180,30 L200,38 L220,36 L240,42 L260,40 L280,46 L300,44 L320,50 L320,60 L0,60 Z"
                    fill="url(#mBtcGrad)" />
              <path d="M0,10 L20,14 L40,12 L60,18 L80,22 L100,18 L120,26 L140,24 L160,32 L180,30 L200,38 L220,36 L240,42 L260,40 L280,46 L300,44 L320,50"
                    fill="none" stroke="#F7931A" stroke-width="1.8"
                    stroke-linejoin="round" stroke-linecap="round" />
            </svg>
          </div>
        </div>

        <div class="m-row-scroll">
          <div v-for="c in cryptoOthers" :key="c.t" class="m-crypto-card">
            <div style="display:flex; align-items:center; gap:8px;">
              <div class="m-crypto-ic" :style="{ background: c.color }">{{ c.t.charAt(0) }}</div>
              <div style="flex:1;">
                <div style="font-size:13px; font-weight:600;">{{ c.t }}</div>
                <div style="font-size:10px; color:rgba(15,15,14,.5);">{{ c.name }}</div>
              </div>
            </div>
            <div style="font-size:15px; font-weight:600; margin-top:12px; font-variant-numeric:tabular-nums;">{{ c.px }}</div>
            <div style="font-size:12px; font-weight:600; margin-top:3px;" :style="{ color: c.d >= 0 ? '#0F8C4D' : '#C4413A' }">
              {{ formatDelta(c.d) }}%
            </div>
          </div>
        </div>

        <!-- Tesouro -->
        <div class="m-section">
          <span class="title">Tesouro Direto</span>
          <span class="link">Comparar →</span>
        </div>
        <div class="m-card m-card-tight">
          <div v-for="(t, i) in tesouro" :key="t.name" class="m-tesouro-row" :class="{ last: i === tesouro.length - 1 }">
            <div class="m-tesouro-ic">
              <UIcon name="i-lucide-landmark" class="size-4" />
            </div>
            <div style="flex:1;">
              <div style="font-size:14px; font-weight:500;">{{ t.name }}</div>
              <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:1px;">Tesouro Direto</div>
            </div>
            <div style="font-size:13px; font-weight:600; color:#5B4A7A; font-variant-numeric:tabular-nums;">{{ t.rate }}</div>
          </div>
        </div>

        <!-- News -->
        <div class="m-section">
          <span class="title">Últimas notícias</span>
          <span class="link">Tudo →</span>
        </div>
        <div class="m-card m-card-tight">
          <div v-for="(n, i) in news" :key="n.title" class="m-news-row" :class="{ last: i === news.length - 1 }">
            <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px;">
              <span class="m-news-source">{{ n.source.toUpperCase() }}</span>
              <span class="m-news-time">{{ n.time }}</span>
            </div>
            <div style="font-size:14px; font-weight:600; letter-spacing:-.005em; line-height:1.3;">{{ n.title }}</div>
            <div style="display:flex; gap:5px; margin-top:8px;">
              <span v-for="t in n.tickers" :key="t" class="m-news-tag">{{ t }}</span>
            </div>
          </div>
        </div>

        <!-- Chat CTA -->
        <div style="text-align:center; padding:24px 22px 14px;">
          <div style="font-size:24px; font-weight:600; letter-spacing:-.022em; line-height:1.15;">
            Tire suas dúvidas em segundos
          </div>
          <div style="font-size:13px; color:rgba(15,15,14,.55); margin-top:8px; line-height:1.4; max-width:300px; margin-left:auto; margin-right:auto;">
            Pergunte qualquer coisa sobre investimentos. Nossa IA responde instantaneamente.
          </div>
        </div>
        <div class="m-chat-grid">
          <div v-for="c in chatCards" :key="c.q" class="m-chat-card">
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <div class="m-chat-ic">
                <UIcon :name="c.icon" class="size-3.5" />
              </div>
              <span class="m-chat-cat">{{ c.cat }}</span>
            </div>
            <div style="font-size:13px; font-weight:600; letter-spacing:-.005em; line-height:1.3; min-height:36px;">{{ c.q }}</div>
            <div class="m-chat-cta">
              Perguntar
              <UIcon name="i-lucide-arrow-right" class="size-2.5" />
            </div>
          </div>
        </div>

        <div class="m-chat-promo">
          <span class="m-chat-promo-glow" />
          <div class="m-chat-promo-bubble">
            <div class="m-chat-promo-ic">
              <UIcon name="i-lucide-star" class="size-3.5" />
            </div>
            <div style="font-size:12.5px; color:#0F0F0E; line-height:1.4;">
              <b>Olá! Sou o Assessor Redentia.</b> Posso ajudar com análises, tirar dúvidas e dar recomendações personalizadas para seus investimentos.
            </div>
          </div>
          <div class="m-chat-promo-stats">
            <span class="m-chat-stat">
              <UIcon name="i-lucide-zap" class="size-3" />
              Resposta em ~3s
            </span>
            <span class="m-chat-stat">
              <UIcon name="i-lucide-brain" class="size-3" />
              IA Treinada
            </span>
            <span class="m-chat-stat">
              <UIcon name="i-lucide-infinity" class="size-3" />
              Ilimitado
            </span>
          </div>
          <div class="m-chat-promo-btn">
            <UIcon name="i-lucide-message-circle" class="size-3.5" />
            <span style="font-size:14px; font-weight:600;">Pergunte ao Assessor</span>
            <UIcon name="i-lucide-arrow-right" class="size-3" />
          </div>
          <div class="m-chat-promo-foot">
            <UIcon name="i-lucide-shield" class="size-2.5" />
            7 dias grátis no Pro · Sem cartão pra começar
          </div>
        </div>

        <!-- Guias -->
        <div class="m-section">
          <span class="title">Guias</span>
          <span class="link">Todos →</span>
        </div>
        <div class="m-row-scroll" style="padding-bottom:14px;">
          <div v-for="g in guias" :key="g.title" class="m-guia-card">
            <div class="m-guia-ic">
              <UIcon :name="g.icon" class="size-4" />
            </div>
            <div>
              <div style="font-size:14px; font-weight:600; letter-spacing:-.005em; line-height:1.3;">{{ g.title }}</div>
              <div style="font-size:11px; color:rgba(15,15,14,.55); margin-top:4px;">{{ g.sub }}</div>
            </div>
          </div>
        </div>

        <!-- FAQ -->
        <div class="m-section">
          <div>
            <span class="title">Dúvidas comuns</span>
            <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:1px; font-weight:500;">Se ainda tiver dúvida, peça pra IA</div>
          </div>
        </div>
        <div class="m-card" style="padding:4px 22px;">
          <div v-for="(f, i) in faqs" :key="f.q" class="m-faq" :class="{ last: i === faqs.length - 1 }">
            <div class="m-faq-head" @click="faqOpen = faqOpen === i ? -1 : i">
              <span style="font-size:14px; font-weight:600; letter-spacing:-.005em; flex:1; padding-right:10px;">{{ f.q }}</span>
              <div class="m-faq-btn" :class="{ open: faqOpen === i }">
                <UIcon name="i-lucide-plus" class="size-2.5" :class="{ 'm-faq-rot': faqOpen === i }" />
              </div>
            </div>
            <div v-if="faqOpen === i" style="padding:0 0 14px; font-size:13px; color:rgba(15,15,14,.7); line-height:1.55;">{{ f.a }}</div>
          </div>
        </div>

        <div style="height:30px;" />
      </div>

      <!-- TABBAR -->
      <div class="m-tabbar">
        <NuxtLink v-for="t in mobileTabs" :key="t.label" :to="t.to" class="m-tab">
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
          <div v-for="n in navMain" :key="n.label" class="item" :class="{ active: n.active }">
            <UIcon :name="n.icon" class="ic" />
            <span>{{ n.label }}</span>
            <span v-if="n.badge" class="badge">{{ n.badge }}</span>
          </div>
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
          <div class="d-greet">
            <div>
              <div class="d-mut" style="font-size:12px; font-weight:500; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
                <span style="width:6px; height:6px; border-radius:50%; background:#0F8C4D;" />
                Bolsa aberta · ao vivo
              </div>
              <div class="h">Mercado</div>
            </div>
            <div class="actions">
              <div class="d-mode-toggle">
                <span :class="['d-mode-opt', { active: mode === 'voce' }]" @click="mode = 'voce'">
                  Para você
                </span>
                <span :class="['d-mode-opt', { active: mode === 'completo' }]" @click="mode = 'completo'">
                  <UIcon name="i-lucide-globe" class="size-3" style="margin-right:4px;" />
                  Mercado completo
                </span>
              </div>
            </div>
          </div>

          <!-- IBOV + Caos hero -->
          <div class="d-row-ibov">
            <div class="d-card d-ibov-card">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <div class="d-label">Ibovespa · agora</div>
                  <div class="d-ibov-num">128.420<span class="d-ibov-unit">pts</span></div>
                  <div style="display:flex; align-items:center; gap:10px; margin-top:10px;">
                    <span class="d-pill-pos">↑ 1,24%</span>
                    <span style="font-size:13px; color:rgba(15,15,14,.55);">+1.572 pts hoje</span>
                  </div>
                </div>
                <div class="d-seg">
                  <span v-for="p in periodsDt" :key="p"
                        class="s" :class="{ active: activePeriod === p }"
                        @click="activePeriod = p">{{ p }}</span>
                </div>
              </div>
              <svg viewBox="0 0 800 180" preserveAspectRatio="none" class="d-ibov-chart">
                <defs>
                  <linearGradient id="dIbovGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#0F8C4D" stop-opacity="0.18" />
                    <stop offset="100%" stop-color="#0F8C4D" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,140 L40,128 L80,120 L120,124 L160,108 L200,116 L240,98 L280,90 L320,92 L360,76 L400,80 L440,66 L480,68 L520,52 L560,46 L600,40 L640,28 L680,24 L720,20 L760,14 L800,8 L800,180 L0,180 Z"
                      fill="url(#dIbovGrad)" />
                <path d="M0,140 L40,128 L80,120 L120,124 L160,108 L200,116 L240,98 L280,90 L320,92 L360,76 L400,80 L440,66 L480,68 L520,52 L560,46 L600,40 L640,28 L680,24 L720,20 L760,14 L800,8"
                      fill="none" stroke="#0F8C4D" stroke-width="2"
                      stroke-linejoin="round" stroke-linecap="round" />
                <circle cx="800" cy="8" r="4" fill="#0F8C4D" />
              </svg>
            </div>

            <div class="d-caos">
              <span class="d-caos-glow-r" />
              <span class="d-caos-glow-l" />
              <div style="position:relative;">
                <div class="d-caos-eyebrow">SUA IA FINANCEIRA</div>
                <div class="d-caos-h">
                  Do <span class="d-caos-red">caos</span> do mercado<br />
                  ao impacto na sua <span class="d-caos-gold">carteira.</span>
                </div>
                <div class="d-caos-sub">A Redent.IA traduz o que se move lá fora em ações concretas pra você.</div>
              </div>
              <div style="position:relative; margin-top:18px; display:flex; gap:10px;">
                <div class="d-caos-btn">
                  Ativar minha conta
                  <UIcon name="i-lucide-arrow-right" class="size-3" />
                </div>
                <div class="d-caos-btn-ghost">Ver demo</div>
              </div>
            </div>
          </div>

          <!-- 4 columns (Ações, FIIs, ETFs, BDRs) - apenas em modo completo -->
          <template v-if="mode === 'completo'">
            <div class="d-row-4col">
              <div v-for="col in marketColumns" :key="col.title" class="d-card d-market-col">
                <div class="d-section-h" style="margin-bottom:8px;">
                  <span class="title" style="font-size:14px;">{{ col.title }}</span>
                  <span class="link" style="font-size:11px;">→</span>
                </div>
                <div class="d-col-first">
                  <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                    <span class="d-asset-logo" style="width:22px; height:22px;" :style="{ background: assetColor(col.items[0].t), color: assetTextColor(col.items[0].t) }">{{ col.items[0].t.charAt(0) }}</span>
                    <span style="font-size:12px; font-weight:600;">{{ col.items[0].t }}</span>
                    <span class="d-asset-delta-tag" :style="{ color: col.items[0].d >= 0 ? '#0F8C4D' : '#C4413A' }">{{ formatDelta(col.items[0].d) }}%</span>
                  </div>
                  <svg viewBox="0 0 240 60" preserveAspectRatio="none" style="width:100%; height:60px; display:block;">
                    <defs>
                      <linearGradient :id="`dColGrad${col.title}`" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" :stop-color="col.items[0].d >= 0 ? '#0F8C4D' : '#C4413A'" stop-opacity="0.18" />
                        <stop offset="100%" :stop-color="col.items[0].d >= 0 ? '#0F8C4D' : '#C4413A'" stop-opacity="0" />
                      </linearGradient>
                    </defs>
                    <path :d="col.items[0].d >= 0 ? 'M0,46 L24,42 L48,40 L72,36 L96,30 L120,28 L144,24 L168,18 L192,14 L216,10 L240,6 L240,60 L0,60 Z' : 'M0,8 L24,12 L48,16 L72,20 L96,28 L120,30 L144,34 L168,40 L192,44 L216,50 L240,54 L240,60 L0,60 Z'"
                          :fill="`url(#dColGrad${col.title})`" />
                    <path :d="col.items[0].d >= 0 ? 'M0,46 L24,42 L48,40 L72,36 L96,30 L120,28 L144,24 L168,18 L192,14 L216,10 L240,6' : 'M0,8 L24,12 L48,16 L72,20 L96,28 L120,30 L144,34 L168,40 L192,44 L216,50 L240,54'"
                          fill="none"
                          :stroke="col.items[0].d >= 0 ? '#0F8C4D' : '#C4413A'"
                          stroke-width="1.6"
                          stroke-linejoin="round" stroke-linecap="round" />
                  </svg>
                </div>
                <div>
                  <div v-for="(it, idx) in col.items" :key="it.t" class="d-col-row" :class="{ last: idx === col.items.length - 1 }">
                    <span class="d-asset-logo" style="width:24px; height:24px;" :style="{ background: assetColor(it.t), color: assetTextColor(it.t) }">{{ it.t.charAt(0) }}</span>
                    <span style="flex:1; font-size:13px; font-weight:600;">{{ it.t }}</span>
                    <span style="font-size:13px; font-weight:600; font-variant-numeric:tabular-nums;" :style="{ color: it.d >= 0 ? '#0F8C4D' : '#C4413A' }">{{ formatDelta(it.d) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Cripto + Tesouro -->
          <div class="d-row-2col">
            <div class="d-card">
              <div class="d-section-h">
                <span class="title">Cripto em destaque</span>
                <span class="link">Tudo →</span>
              </div>
              <!-- Bitcoin featured -->
              <div class="d-btc-card">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                  <div style="display:flex; align-items:center; gap:10px;">
                    <div class="d-btc-logo">B</div>
                    <div>
                      <div style="display:flex; align-items:center; gap:6px;">
                        <span style="font-size:14px; font-weight:600;">Bitcoin</span>
                        <span class="d-btc-rank">#1 MCAP</span>
                      </div>
                      <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:1px;">BTC · 30 dias</div>
                    </div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-size:18px; font-weight:600; letter-spacing:-.015em; font-variant-numeric:tabular-nums;">R$ 423,8k</div>
                    <div style="font-size:12px; font-weight:600; color:#C4413A; margin-top:2px;">−2,31%</div>
                  </div>
                </div>
                <svg viewBox="0 0 480 80" preserveAspectRatio="none" class="d-btc-chart">
                  <defs>
                    <linearGradient id="dBtcGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stop-color="#F7931A" stop-opacity="0.22" />
                      <stop offset="100%" stop-color="#F7931A" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,14 L30,18 L60,16 L90,22 L120,26 L150,22 L180,30 L210,28 L240,36 L270,34 L300,42 L330,40 L360,48 L390,46 L420,54 L450,52 L480,60 L480,80 L0,80 Z"
                        fill="url(#dBtcGrad)" />
                  <path d="M0,14 L30,18 L60,16 L90,22 L120,26 L150,22 L180,30 L210,28 L240,36 L270,34 L300,42 L330,40 L360,48 L390,46 L420,54 L450,52 L480,60"
                        fill="none" stroke="#F7931A" stroke-width="1.8"
                        stroke-linejoin="round" stroke-linecap="round" />
                  <circle cx="480" cy="60" r="3.5" fill="#F7931A" stroke="#FFFFFF" stroke-width="1.5" />
                </svg>
              </div>
              <!-- Other cryptos grid -->
              <div class="d-crypto-grid">
                <div v-for="c in cryptoOthers" :key="c.t" class="d-crypto-row">
                  <div class="d-crypto-ic" :style="{ background: c.color }">{{ c.t.charAt(0) }}</div>
                  <div style="flex:1; min-width:0;">
                    <div style="font-size:13px; font-weight:600;">{{ c.t }}</div>
                    <div style="font-size:11px; color:rgba(15,15,14,.5); font-variant-numeric:tabular-nums;">{{ c.px }}</div>
                  </div>
                  <div style="font-size:12px; font-weight:600; font-variant-numeric:tabular-nums;" :style="{ color: c.d >= 0 ? '#0F8C4D' : '#C4413A' }">
                    {{ formatDelta(c.d) }}%
                  </div>
                </div>
              </div>
            </div>

            <div class="d-card">
              <div class="d-section-h">
                <span class="title">Tesouro Direto</span>
                <span class="link">Comparar →</span>
              </div>
              <div style="margin-top:6px;">
                <div v-for="(t, i) in tesouro" :key="t.name" class="d-tesouro-row" :class="{ last: i === tesouro.length - 1 }">
                  <div class="d-tesouro-ic">
                    <UIcon name="i-lucide-landmark" class="size-4" />
                  </div>
                  <div style="flex:1;">
                    <div style="font-size:14px; font-weight:500;">{{ t.name }}</div>
                    <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:1px;">Tesouro Direto</div>
                  </div>
                  <div style="font-size:14px; font-weight:600; color:#5B4A7A; font-variant-numeric:tabular-nums;">{{ t.rate }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat CTA Desktop -->
          <div class="d-card d-chat-cta">
            <div style="text-align:center; margin-bottom:32px;">
              <div style="font-size:32px; font-weight:600; letter-spacing:-.025em; line-height:1.1;">Tire suas dúvidas em segundos</div>
              <div style="font-size:15px; color:rgba(15,15,14,.55); margin-top:10px; line-height:1.4;">
                Pergunte qualquer coisa sobre investimentos. Nossa IA responde instantaneamente.
              </div>
            </div>
            <div class="d-chat-grid">
              <div v-for="c in chatCardsDt" :key="c.q" class="d-chat-card">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                  <div class="d-chat-ic">
                    <UIcon :name="c.icon" class="size-4" />
                  </div>
                  <span class="d-chat-cat">{{ c.cat }}</span>
                </div>
                <div style="font-size:14px; font-weight:600; letter-spacing:-.005em; line-height:1.3; min-height:40px;">{{ c.q }}</div>
                <div class="d-chat-cta-link">
                  Perguntar
                  <UIcon name="i-lucide-arrow-right" class="size-2.5" />
                </div>
              </div>
            </div>
            <div class="d-chat-promo">
              <span class="d-chat-promo-glow" />
              <div class="d-chat-promo-bubble">
                <div class="d-chat-promo-ic">
                  <UIcon name="i-lucide-star" class="size-4" />
                </div>
                <div style="font-size:14px; color:#0F0F0E; line-height:1.5;">
                  <b>Olá! Sou o Assessor Redentia.</b> Posso ajudar com análises, tirar dúvidas e dar recomendações personalizadas para seus investimentos.
                </div>
              </div>
              <div class="d-chat-promo-stats">
                <span class="d-chat-stat">
                  <UIcon name="i-lucide-zap" class="size-3" />
                  Resposta em ~3s
                </span>
                <span class="d-chat-stat-div" />
                <span class="d-chat-stat">
                  <UIcon name="i-lucide-brain" class="size-3" />
                  IA Treinada
                </span>
                <span class="d-chat-stat-div" />
                <span class="d-chat-stat">
                  <UIcon name="i-lucide-infinity" class="size-3" />
                  Ilimitado
                </span>
              </div>
              <div class="d-chat-promo-btn">
                <UIcon name="i-lucide-message-circle" class="size-4" />
                <span style="font-size:15px; font-weight:600;">Pergunte ao Assessor</span>
                <UIcon name="i-lucide-arrow-right" class="size-3" />
              </div>
              <div class="d-chat-promo-foot">
                <UIcon name="i-lucide-shield" class="size-3" />
                7 dias grátis no Pro · Sem cartão pra começar
              </div>
            </div>
          </div>

          <!-- News (Desktop 3-col) -->
          <div class="d-card">
            <div class="d-section-h">
              <span class="title">Últimas notícias</span>
              <span class="link">Tudo →</span>
            </div>
            <div class="d-news-grid">
              <div v-for="n in news" :key="n.title" class="d-news-card">
                <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;">
                  <span class="d-news-source">{{ n.source.toUpperCase() }}</span>
                  <span class="d-news-time">{{ n.time }}</span>
                </div>
                <div style="font-size:14px; font-weight:600; letter-spacing:-.005em; line-height:1.3;">{{ n.title }}</div>
                <div style="display:flex; gap:5px; margin-top:8px;">
                  <span v-for="t in n.tickers" :key="t" class="d-news-tag">{{ t }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Guias -->
          <div class="d-card">
            <div class="d-section-h">
              <span class="title">Guias para começar</span>
              <span class="link">Biblioteca →</span>
            </div>
            <div class="d-guia-grid">
              <div v-for="g in guias" :key="g.title" class="d-guia-card">
                <div class="d-guia-ic">
                  <UIcon :name="g.icon" class="size-4" />
                </div>
                <div>
                  <div style="font-size:14px; font-weight:600; letter-spacing:-.005em; line-height:1.3;">{{ g.title }}</div>
                  <div style="font-size:11px; color:rgba(15,15,14,.55); margin-top:4px;">{{ g.sub }}</div>
                </div>
                <div class="d-guia-link">
                  Ler
                  <UIcon name="i-lucide-arrow-right" class="size-2.5" />
                </div>
              </div>
            </div>
          </div>

          <!-- FAQ -->
          <div style="margin-top:14px;">
            <div class="d-section-h" style="margin-bottom:18px; padding-left:4px;">
              <div>
                <div class="d-faq-eyebrow">PERGUNTAS FREQUENTES</div>
                <div class="d-faq-h">
                  Dúvidas <span class="d-faq-h-italic">comuns.</span>
                </div>
                <div style="font-size:14px; color:rgba(15,15,14,.55); margin-top:8px;">Se algo ainda não estiver claro, peça pra Redent.IA.</div>
              </div>
              <span class="d-faq-talk">
                Falar com a IA
                <UIcon name="i-lucide-arrow-right" class="size-2.5" />
              </span>
            </div>
            <div class="d-card" style="padding:4px 26px;">
              <div v-for="(f, i) in faqsDt" :key="f.q" class="d-faq" :class="{ last: i === faqsDt.length - 1 }">
                <div class="d-faq-head" @click="faqOpenDt = faqOpenDt === i ? -1 : i">
                  <span style="font-size:15px; font-weight:600; letter-spacing:-.005em;">{{ f.q }}</span>
                  <div class="d-faq-btn" :class="{ open: faqOpenDt === i }">
                    <UIcon name="i-lucide-plus" class="size-3" :class="{ 'd-faq-rot': faqOpenDt === i }" />
                  </div>
                </div>
                <div v-if="faqOpenDt === i" style="padding:0 0 18px; font-size:14px; color:rgba(15,15,14,.7); line-height:1.6; max-width:780px;">{{ f.a }}</div>
              </div>
            </div>
            <div class="d-faq-help">
              <span class="d-logo-mini">R</span>
              <div style="flex:1;">
                <div style="font-size:14px; font-weight:600;">Ainda com dúvida?</div>
                <div style="font-size:12px; color:rgba(15,15,14,.6); margin-top:2px;">Pergunte qualquer coisa pra Redent.IA, resposta em segundos.</div>
              </div>
              <div class="d-btn" style="padding:9px 16px; font-size:13px;">
                Pergunte agora
                <UIcon name="i-lucide-arrow-right" class="size-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h } from 'vue'

definePageMeta({ layout: false })

// Inline FirstChartBlock helper component (used inside the section "first item" preview)
const FirstChartBlock = defineComponent({
  name: 'FirstChartBlock',
  props: {
    ticker: { type: String, required: true },
    delta: { type: Number, required: true },
    idPrefix: { type: String, default: 'fc' },
  },
  setup(props) {
    const color = computed(() => (props.delta >= 0 ? '#0F8C4D' : '#C4413A'))
    const gradId = computed(() => `${props.idPrefix}-${props.ticker}`)
    const path = computed(() =>
      props.delta >= 0
        ? 'M0,46 L20,42 L40,40 L60,36 L80,30 L100,28 L120,24 L140,18 L160,14 L180,10 L200,8 L220,10 L240,6 L260,8 L280,4 L300,6 L320,4'
        : 'M0,8 L20,10 L40,14 L60,18 L80,22 L100,26 L120,30 L140,34 L160,38 L180,42 L200,44 L220,48 L240,50 L260,52 L280,54 L300,52 L320,54',
    )
    const area = computed(() => `${path.value} L320,56 L0,56 Z`)
    return () =>
      h('div', { style: 'padding:12px 14px; background:#FFFFFF; border:1px solid rgba(15,15,14,.05); border-radius:12px;' }, [
        h('div', { style: 'display:flex; align-items:center; gap:8px; margin-bottom:4px;' }, [
          h('span', { style: 'width:22px; height:22px; border-radius:6px; background:#5B4A7A; color:#fff; display:grid; place-items:center; font-size:10px; font-weight:700;' }, props.ticker.charAt(0)),
          h('span', { style: 'font-size:12px; font-weight:600;' }, props.ticker),
          h('span', { style: `margin-left:auto; font-size:12px; font-weight:600; color:${color.value}; font-variant-numeric:tabular-nums;` }, `${props.delta >= 0 ? '+' : ''}${props.delta.toFixed(2).replace('.', ',')}%`),
        ]),
        h('svg', { viewBox: '0 0 320 56', preserveAspectRatio: 'none', style: 'width:100%; height:56px; display:block;' }, [
          h('defs', [
            h('linearGradient', { id: gradId.value, x1: '0', y1: '0', x2: '0', y2: '1' }, [
              h('stop', { offset: '0%', 'stop-color': color.value, 'stop-opacity': '0.18' }),
              h('stop', { offset: '100%', 'stop-color': color.value, 'stop-opacity': '0' }),
            ]),
          ]),
          h('path', { d: area.value, fill: `url(#${gradId.value})` }),
          h('path', { d: path.value, fill: 'none', stroke: color.value, 'stroke-width': '1.6', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }),
        ]),
      ])
  },
})

const mode = ref<'voce' | 'completo'>('completo')
const activePeriod = ref('1S')
const periods = ['1D', '1S', '1M', '1A', '5A']
const periodsDt = ['1D', '1S', '1M', '3M', '1A', '5A', 'Tudo']

const tabAcoes = ref<'up' | 'dn'>('up')
const tabFii = ref<'up' | 'dn'>('up')

// "Para você" — dados pessoais
const pvFactors = [
  { icon: '%', label: 'Juros futuros',     amount: '−R$ 2,41k', color: '#B7873A', bg: 'rgba(183,135,58,.12)' },
  { icon: '⊡', label: 'Consumo doméstico', amount: '−R$ 485',   color: '#5B4A7A', bg: 'rgba(91,74,122,.12)' },
  { icon: '$', label: 'Dólar',             amount: '−R$ 405',   color: '#1B7A4A', bg: 'rgba(27,122,74,.12)' },
  { icon: '◐', label: 'Petróleo',          amount: '−R$ 379',   color: '#B86C0E', bg: 'rgba(247,147,26,.12)' },
]
const pvHoldings = [
  { t: 'CPLE3', n: 'Copel ON',   hoje: -403,    pct: -1.74 },
  { t: 'ITSA4', n: 'Itausa PN',  hoje: -400,    pct: -1.56 },
  { t: 'PETR4', n: 'Petrobras',  hoje: -385,    pct: -1.19 },
  { t: 'WEGE3', n: 'WEG ON',     hoje: -285.98, pct: -1.86 },
  { t: 'FLRY3', n: 'Fleury ON',  hoje: -279,    pct: -1.97 },
]
const pvIndices = [
  { l: 'IFIX',    v: '3.822',    d: '−0,74%', c: '#C4413A' },
  { l: 'Dólar',   v: 'R$ 5,04',  d: '+0,57%', c: '#0F8C4D' },
  { l: 'Brent',   v: 'US$ 111',  d: '−0,86%', c: '#C4413A' },
  { l: 'S&P 500', v: '7.362',    d: '−0,62%', c: '#C4413A' },
]

const faqOpen = ref(0)
const faqOpenDt = ref(0)

const ASSET_COLORS: Record<string, string> = {
  PETR4: '#1A8E5E', VALE3: '#EEC643', BBAS3: '#FFE74C', WEGE3: '#005CA9',
  JBSS3: '#C8102E', ITSA4: '#FF8C00', CPLE3: '#0066A1', BBDC4: '#E11D48',
  B3SA3: '#1A1A1A', MGLU3: '#0086FF', HGLG11: '#5B7C99', KNRI11: '#6EAD5C',
  MCCI11: '#3B2D6E', XPLG11: '#FFCE00', VISC11: '#D32F2F', BRCO11: '#666666',
  BOVA11: '#0F0F0E', IVVB11: '#1F8A5B', SMAL11: '#8A4FFF',
  AAPL34: '#1A1A1A', TSLA34: '#CC0000', NVDC34: '#76B900',
}
const LIGHT_BGS = ['#FFE74C', '#EEC643', '#FFCE00', '#76B900']
function assetColor(t: string) { return ASSET_COLORS[t] || '#5B4A7A' }
function assetTextColor(t: string) { return LIGHT_BGS.includes(ASSET_COLORS[t] || '') ? '#0F0F0E' : '#FFFFFF' }

function formatDelta(d: number) {
  const s = d.toFixed(2).replace('.', ',')
  return d >= 0 ? `+${s}` : s
}

const acoesUp = [
  { t: 'PETR4', d: 2.14 }, { t: 'VALE3', d: 1.32 }, { t: 'BBAS3', d: 1.18 },
  { t: 'WEGE3', d: 0.97 }, { t: 'JBSS3', d: 0.84 },
]
const acoesDn = [
  { t: 'ITSA4', d: -2.41 }, { t: 'CPLE3', d: -1.87 }, { t: 'BBDC4', d: -1.43 },
  { t: 'B3SA3', d: -1.12 }, { t: 'MGLU3', d: -0.98 },
]
const fiiUp = [
  { t: 'HGLG11', d: 0.84 }, { t: 'KNRI11', d: 0.62 }, { t: 'MCCI11', d: 0.41 },
]
const fiiDn = [
  { t: 'XPLG11', d: -0.92 }, { t: 'VISC11', d: -0.71 }, { t: 'BRCO11', d: -0.55 },
]
const etfUp = [
  { t: 'BOVA11', d: 1.21 }, { t: 'IVVB11', d: 0.78 }, { t: 'SMAL11', d: 0.65 },
]
const bdrUp = [
  { t: 'AAPL34', d: 1.85 }, { t: 'TSLA34', d: 3.12 }, { t: 'NVDC34', d: 2.41 },
]

const cryptoOthers = [
  { t: 'ETH', name: 'Ethereum', px: 'R$ 18.4k', d: -1.85, color: '#627EEA' },
  { t: 'SOL', name: 'Solana',   px: 'R$ 821',   d:  4.12, color: '#9945FF' },
]

const tesouro = [
  { name: 'Prefixado 2027', rate: '13,2%' },
  { name: 'IPCA+ 2030',     rate: 'IPCA + 6,8%' },
  { name: 'Selic 2029',     rate: '100% Selic' },
]

const news = [
  { time: '2h', source: 'Valor',     title: 'Ata do Copom abre curva longa de juros',          tickers: ['ITSA4', 'CPLE3'] },
  { time: '5h', source: 'InfoMoney', title: 'Brent dispara 3,2% e reaviva tese de Petrobras', tickers: ['PETR4'] },
  { time: '6h', source: 'Bloomberg', title: 'Vacância logística cai a 9% no trimestre',         tickers: ['HGLG11'] },
]

const guias = [
  { title: 'Como funcionam os FIIs',     sub: '12 min · iniciante',     icon: 'i-lucide-building-2' },
  { title: 'Tributação de dividendos',   sub: '8 min · intermediário',  icon: 'i-lucide-receipt' },
  { title: 'IPCA+ vs Prefixado',         sub: '10 min · intermediário', icon: 'i-lucide-trending-up' },
  { title: 'Como ler um balanço',        sub: '18 min · avançado',      icon: 'i-lucide-book-open' },
]

const chatCards = [
  { cat: 'Conceitos',     q: 'Qual a diferença entre ações e FIIs?', icon: 'i-lucide-scale' },
  { cat: 'Renda Passiva', q: 'Como funcionam os dividendos?',         icon: 'i-lucide-coins' },
  { cat: 'Estratégia',    q: 'O que é diversificação?',               icon: 'i-lucide-pie-chart' },
  { cat: 'Planejamento',  q: 'Quanto devo investir por mês?',         icon: 'i-lucide-wallet' },
]

const chatCardsDt = [
  ...chatCards,
  { cat: 'Análise',  q: 'Como escolher boas ações?',     icon: 'i-lucide-search' },
  { cat: 'Produtos', q: 'Vale a pena investir em ETFs?', icon: 'i-lucide-trending-up' },
]

const faqs = [
  { q: 'Como a Redentia funciona?',          a: 'A Redentia conecta com suas corretoras via Open Finance e cruza tudo com rankings e fatores macro pra te mostrar o que mexeu com sua carteira.' },
  { q: 'Preciso pagar pra ver os dados?',    a: 'Não. Cotações, rankings e notícias são gratuitos. Recursos premium ficam no Pro com 7 dias grátis.' },
  { q: 'As cotações são em tempo real?',     a: 'Sim. Atualizamos a cada 1 minuto durante o pregão.' },
  { q: 'É seguro?',                          a: 'Open Finance é regulado pelo BC. Apenas leitura, sem acesso a senhas ou ordens.' },
]

const faqsDt = [
  { q: 'Como a Redentia funciona?',          a: 'A Redentia conecta com suas corretoras via Open Finance, traz seus ativos automaticamente e cruza tudo com mais de 15 rankings, notícias em tempo real e fatores macro pra te mostrar, em texto simples, o que realmente mexeu com sua carteira.' },
  { q: 'Preciso pagar pra ver os dados?',    a: 'Não. Cotações ao vivo, rankings, notícias e calculadoras são gratuitos. Os recursos premium (Carta mensal, Raio-X completo, Chat MAX) ficam no plano Pro com 7 dias grátis sem cartão.' },
  { q: 'As cotações são em tempo real?',     a: 'Sim. Atualizamos a cada 1 minuto durante o pregão, sem delay. Tesouro e cripto seguem a fonte oficial (B3, CoinMarketCap).' },
  { q: 'Como a Redent.IA é treinada?',       a: 'Combinamos dados fundamentalistas da B3, notícias curadas de 6 fontes e os 15 rankings proprietários da Redentia. A IA traduz isso pra explicações claras, não é um modelo genérico.' },
  { q: 'Preciso conectar minha corretora?',  a: 'Não, mas conectar libera Carta personalizada, Raio-X completo e simulações com seus números reais. A conexão é via Open Finance, 100% regulamentada pelo BCB.' },
  { q: 'É seguro?',                          a: 'Open Finance é regulado pelo Banco Central. Não temos acesso a senhas, não fazemos ordens em seu nome, apenas leitura. Você revoga a qualquer momento.' },
]

const marketColumns = computed(() => [
  { title: 'Ações', items: [...acoesUp, ...acoesDn].slice(0, 5), mixed: true },
  { title: 'FIIs',  items: [...fiiUp, ...fiiDn], mixed: true },
  { title: 'ETFs',  items: etfUp, pos: true },
  { title: 'BDRs',  items: bdrUp, pos: true },
])

const mobileTabs = [
  { label: 'Início',   icon: 'i-lucide-house',  to: '/dev/mobile-layouts/v4' },
  { label: 'Carteira', icon: 'i-lucide-wallet', to: '/dev/mobile-layouts/v4' },
  { label: 'Raio-X',   icon: 'i-lucide-radar',  to: '/dev/mobile-layouts/v4' },
  { label: 'Mercado',  icon: 'i-lucide-globe',  to: '/dev/mobile-layouts/v4/mercado' },
]

const navMain = [
  { label: 'Início',     icon: 'i-lucide-house' },
  { label: 'Carteira',   icon: 'i-lucide-wallet' },
  { label: 'Raio-X',     icon: 'i-lucide-radar', badge: 'novo' },
  { label: 'Mercado',    icon: 'i-lucide-trending-up', active: true },
  { label: 'Carta',      icon: 'i-lucide-mail' },
]
const navTools = [
  { label: 'Chat IA',      icon: 'i-lucide-sparkles', badge: '2' },
  { label: 'Calculadoras', icon: 'i-lucide-calculator' },
  { label: 'Rankings',     icon: 'i-lucide-trophy' },
  { label: 'Setores',      icon: 'i-lucide-grid-2x2' },
  { label: 'Guias',        icon: 'i-lucide-book' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:ital,wght@1,500&display=swap');

.v4 { min-height: 100vh; background: #F8F6F1; }

/* TOGGLE mobile/desktop */
.phone.mercury { display: block; }
.dt.mercury-dt { display: none; }
@media (min-width: 1024px) {
  .phone.mercury { display: none; }
  .dt.mercury-dt { display: flex; }
}

/* ============ MOBILE ============ */
.phone.mercury {
  background: #F8F6F1; color: #0F0F0E;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  min-height: 100vh; position: relative;
  max-width: 480px; margin: 0 auto;
}
.phone.mercury .m-appbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 24px 22px 16px;
  position: sticky; top: 0; z-index: 30;
  background: rgba(248,246,241,.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.phone.mercury .m-backbtn {
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.7);
  display: grid; place-items: center; cursor: pointer;
}
.phone.mercury .m-label {
  font-size: 11px; font-weight: 500;
  color: rgba(15,15,14,.5); letter-spacing: .01em;
}
.phone.mercury .m-scroll { padding: 0 0 120px; }
.phone.mercury .m-scroll::-webkit-scrollbar { display: none; }

/* mode toggle */
.phone.mercury .m-mode-toggle {
  display: flex; gap: 3px; padding: 3px;
  background: rgba(15,15,14,.04); border-radius: 10px;
  width: 100%;
}
.phone.mercury .m-mode-opt {
  flex: 1; padding: 8px 12px; border-radius: 7px;
  font-size: 12px; font-weight: 500;
  color: rgba(15,15,14,.6); text-align: center;
  cursor: pointer; display: inline-flex; align-items: center;
  justify-content: center; gap: 5px;
}
.phone.mercury .m-mode-opt.active {
  background: #FFFFFF;
  box-shadow: 0 1px 2px rgba(15,15,14,.08);
  color: #0F0F0E; font-weight: 600;
}

.phone.mercury .m-card {
  margin: 0 16px; padding: 22px 20px;
  background: #FFFFFF; border-radius: 20px;
  box-shadow: 0 1px 0 rgba(15,15,14,.04), 0 8px 24px -12px rgba(15,15,14,.08);
}
.phone.mercury .m-card-lg { padding: 24px 22px; }
.phone.mercury .m-card + .m-card { margin-top: 10px; }
.phone.mercury .m-card-tight { padding: 4px 0; }

/* IBOV hero */
.phone.mercury .m-ibov-num {
  font-size: 28px; font-weight: 600; letter-spacing: -.025em;
  margin-top: 8px; font-variant-numeric: tabular-nums;
}
.phone.mercury .m-ibov-unit { font-size: 14px; color: rgba(15,15,14,.4); font-weight: 500; }
.phone.mercury .m-pill-pos {
  padding: 3px 8px; border-radius: 6px;
  background: rgba(15,140,77,.10); color: #0F8C4D;
  font-size: 12px; font-weight: 500;
}
.phone.mercury .m-live-pill {
  padding: 3px 8px; border-radius: 6px;
  background: rgba(15,140,77,.10); color: #0F8C4D;
  font-size: 10px; font-weight: 600; letter-spacing: .08em;
  display: flex; align-items: center; gap: 5px;
}
.phone.mercury .m-live-dot { width: 6px; height: 6px; border-radius: 50%; background: #0F8C4D; }
.phone.mercury .m-ibov-chart { width: 100%; height: 90px; display: block; margin: 16px -6px 0; }

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

/* Caos CTA */
.phone.mercury .m-caos {
  padding: 24px 22px;
  border-radius: 18px;
  background: #0F0F0E; color: #FAF6EA;
  position: relative; overflow: hidden; cursor: pointer;
}
.phone.mercury .m-caos-glow-r {
  position: absolute; right: -50px; top: -50px;
  width: 220px; height: 220px; border-radius: 50%;
  background: radial-gradient(circle, rgba(183,135,58,.30), transparent 65%);
  pointer-events: none;
}
.phone.mercury .m-caos-glow-l {
  position: absolute; left: -40px; bottom: -50px;
  width: 180px; height: 180px; border-radius: 50%;
  background: radial-gradient(circle, rgba(196,65,58,.18), transparent 65%);
  pointer-events: none;
}
.phone.mercury .m-caos-eyebrow {
  color: #B7873A; font-weight: 600;
  font-family: 'IBM Plex Mono', monospace; font-size: 10px;
  letter-spacing: .14em; text-transform: uppercase;
}
.phone.mercury .m-caos-h {
  font-size: 24px; font-weight: 600; letter-spacing: -.022em;
  margin-top: 14px; line-height: 1.2;
}
.phone.mercury .m-caos-red { color: #C4413A; font-family: 'Newsreader', serif; font-style: italic; }
.phone.mercury .m-caos-gold { color: #B7873A; font-family: 'Newsreader', serif; font-style: italic; }
.phone.mercury .m-caos-sub {
  font-size: 13px; color: rgba(255,255,255,.65); margin-top: 10px; line-height: 1.4;
}
.phone.mercury .m-caos-btn {
  padding: 10px 16px; border-radius: 8px;
  background: #FAF6EA; color: #0F0F0E;
  font-size: 13px; font-weight: 600;
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
}
.phone.mercury .m-caos-btn-ghost {
  padding: 10px 14px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,.2); color: #FAF6EA;
  font-size: 13px; font-weight: 500; cursor: pointer;
}

/* sections */
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

/* tab pill */
.phone.mercury .m-tab-pill {
  display: flex; gap: 3px; padding: 3px;
  background: rgba(15,15,14,.04); border-radius: 8px;
}
.phone.mercury .m-tab-pill-opt {
  padding: 4px 10px; border-radius: 6px;
  font-size: 11px; font-weight: 600;
  color: rgba(15,15,14,.5); cursor: pointer;
}
.phone.mercury .m-tab-pill-opt.up-active {
  background: #FFFFFF; color: #0F8C4D;
  box-shadow: 0 1px 2px rgba(15,15,14,.08);
}
.phone.mercury .m-tab-pill-opt.dn-active {
  background: #FFFFFF; color: #C4413A;
  box-shadow: 0 1px 2px rgba(15,15,14,.08);
}

/* row scrolls */
.phone.mercury .m-row-scroll {
  display: flex; gap: 10px;
  padding: 0 16px;
  overflow-x: auto;
  scrollbar-width: none;
}
.phone.mercury .m-row-scroll::-webkit-scrollbar { display: none; }

.phone.mercury .m-asset-card {
  flex-shrink: 0; min-width: 120px;
  background: #FFFFFF; border: 1px solid rgba(15,15,14,.05);
  border-radius: 12px; padding: 12px 14px;
  text-decoration: none; color: inherit;
  transition: transform .15s, box-shadow .15s;
  cursor: pointer;
}
.phone.mercury .m-asset-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -4px rgba(15,15,14,.08);
}
.phone.mercury .m-asset-logo {
  width: 26px; height: 26px; border-radius: 8px;
  display: grid; place-items: center;
  font-size: 11px; font-weight: 700; letter-spacing: -.02em;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.08);
}
.phone.mercury .m-asset-delta {
  font-size: 14px; font-weight: 600; margin-top: 10px;
  font-variant-numeric: tabular-nums;
}

/* Bitcoin card mobile */
.phone.mercury .m-btc-card {
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(247,147,26,.08), rgba(247,147,26,.02));
  border: 1px solid rgba(247,147,26,.18);
  border-radius: 14px;
}
.phone.mercury .m-btc-logo {
  width: 32px; height: 32px; border-radius: 50%;
  background: #F7931A; color: #fff;
  display: grid; place-items: center;
  font-size: 14px; font-weight: 700;
}
.phone.mercury .m-btc-rank {
  padding: 1px 5px; border-radius: 3px;
  background: rgba(247,147,26,.12); color: #B86C0E;
  font-size: 8px; font-weight: 700; letter-spacing: .08em;
}
.phone.mercury .m-btc-chart {
  width: 100%; height: 60px; display: block; margin-top: 10px;
}

.phone.mercury .m-crypto-card {
  flex-shrink: 0; min-width: 160px;
  background: #FFFFFF; border: 1px solid rgba(15,15,14,.05);
  border-radius: 14px; padding: 14px;
}
.phone.mercury .m-crypto-ic {
  width: 30px; height: 30px; border-radius: 50%;
  color: #fff; display: grid; place-items: center;
  font-size: 12px; font-weight: 700;
}

/* Tesouro rows */
.phone.mercury .m-tesouro-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 22px;
  border-bottom: 1px solid rgba(15,15,14,.05);
  cursor: pointer;
}
.phone.mercury .m-tesouro-row.last { border-bottom: 0; }
.phone.mercury .m-tesouro-ic {
  width: 34px; height: 34px; border-radius: 10px;
  background: rgba(91,74,122,.08); color: #5B4A7A;
  display: grid; place-items: center; flex-shrink: 0;
}

/* News rows */
.phone.mercury .m-news-row {
  padding: 14px 22px;
  border-bottom: 1px solid rgba(15,15,14,.05);
  cursor: pointer;
}
.phone.mercury .m-news-row.last { border-bottom: 0; }
.phone.mercury .m-news-source {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; letter-spacing: .12em; font-weight: 700;
  color: rgba(15,15,14,.65);
}
.phone.mercury .m-news-time {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; color: rgba(15,15,14,.4);
}
.phone.mercury .m-news-tag {
  padding: 2px 6px; border-radius: 4px;
  background: rgba(15,15,14,.05); color: rgba(15,15,14,.65);
  font-size: 10px; font-weight: 600;
}

/* Chat grid */
.phone.mercury .m-chat-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  padding: 0 16px;
}
.phone.mercury .m-chat-card {
  background: #FFFFFF; border: 1px solid rgba(15,15,14,.06);
  border-radius: 14px; padding: 14px;
  cursor: pointer;
  display: flex; flex-direction: column; gap: 12px;
}
.phone.mercury .m-chat-ic {
  width: 30px; height: 30px; border-radius: 8px;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.7);
  display: grid; place-items: center;
}
.phone.mercury .m-chat-cat {
  padding: 2px 7px; border-radius: 5px;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.55);
  font-size: 9px; font-weight: 600;
}
.phone.mercury .m-chat-cta {
  font-size: 11px; color: #B7873A; font-weight: 600;
  display: inline-flex; align-items: center; gap: 4px;
  margin-top: auto;
}

/* Chat promo */
.phone.mercury .m-chat-promo {
  margin: 16px 16px 0; padding: 20px 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(183,135,58,.12) 0%, rgba(244,237,217,.5) 100%);
  position: relative; overflow: hidden;
}
.phone.mercury .m-chat-promo-glow {
  position: absolute; right: -40px; top: -40px;
  width: 160px; height: 160px; border-radius: 50%;
  background: radial-gradient(circle, rgba(183,135,58,.20), transparent 60%);
  pointer-events: none;
}
.phone.mercury .m-chat-promo-bubble {
  position: relative;
  display: flex; gap: 10px; align-items: flex-start;
  padding: 14px;
  background: #FFFFFF; border-radius: 12px;
  border: 1px solid rgba(183,135,58,.20);
}
.phone.mercury .m-chat-promo-ic {
  width: 32px; height: 32px; border-radius: 10px;
  background: linear-gradient(135deg, #D1A75A, #B7873A); color: #FFFFFF;
  display: grid; place-items: center; flex-shrink: 0;
}
.phone.mercury .m-chat-promo-stats {
  position: relative; display: flex; justify-content: center;
  gap: 14px; margin-top: 16px; flex-wrap: wrap;
}
.phone.mercury .m-chat-stat {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; color: #B7873A; font-weight: 600;
}
.phone.mercury .m-chat-promo-btn {
  position: relative; margin-top: 14px;
  padding: 14px 16px; border-radius: 12px;
  background: linear-gradient(135deg, #D1A75A, #B7873A); color: #FFFFFF;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; box-shadow: 0 6px 18px -6px rgba(183,135,58,.4);
}
.phone.mercury .m-chat-promo-foot {
  position: relative; text-align: center; margin-top: 10px;
  font-size: 11px; color: rgba(15,15,14,.55);
  display: inline-flex; align-items: center; gap: 5px;
  width: 100%; justify-content: center;
}

/* Guias */
.phone.mercury .m-guia-card {
  flex-shrink: 0; min-width: 200px;
  background: #FFFFFF; border: 1px solid rgba(15,15,14,.05);
  border-radius: 14px; padding: 16px;
  display: flex; flex-direction: column; gap: 14px;
}
.phone.mercury .m-guia-ic {
  width: 40px; height: 40px; border-radius: 10px;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.7);
  display: grid; place-items: center;
}

/* FAQ */
.phone.mercury .m-faq { border-bottom: 1px solid rgba(15,15,14,.06); }
.phone.mercury .m-faq.last { border-bottom: 0; }
.phone.mercury .m-faq-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 0; cursor: pointer;
}
.phone.mercury .m-faq-btn {
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.6);
  display: grid; place-items: center; flex-shrink: 0;
  transition: all .2s;
}
.phone.mercury .m-faq-btn.open { background: #0F0F0E; color: #FFFFFF; }
.phone.mercury .m-faq-rot { transform: rotate(45deg); transition: transform .2s; }

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
  font-family: inherit; text-decoration: none;
}
.phone.mercury .m-tab.router-link-active { color: #0F0F0E; }
.phone.mercury .m-tab svg { width: 22px; height: 22px; }
.phone.mercury .m-tab .lbl { font-size: 10px; font-weight: 500; }


/* ============ DESKTOP ============ */
.dt.mercury-dt {
  background: #F8F6F1; color: #0F0F0E;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  min-height: 100vh; position: relative;
}
.dt .d-mut { color: rgba(15,15,14,.55); }

.dt .d-side {
  width: 240px; flex-shrink: 0;
  padding: 24px 20px;
  display: flex; flex-direction: column; gap: 24px;
  border-right: 1px solid rgba(15,15,14,.06);
  position: sticky; top: 0;
  height: 100vh;
}
.dt .d-brand { display: flex; align-items: center; gap: 10px; padding: 0 4px; }
.dt .d-brand-mark {
  width: 26px; height: 26px; border-radius: 8px;
  background: #0F0F0E; color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700;
}
.dt .d-brand-mark img { width: 20px; height: 20px; display: block; }
.dt .d-brand .nm { font-size: 16px; font-weight: 600; letter-spacing: -.01em; }
.dt .d-nav { display: flex; flex-direction: column; gap: 2px; }
.dt .d-nav .grp {
  font-size: 10px; font-weight: 600;
  letter-spacing: .12em; text-transform: uppercase;
  color: rgba(15,15,14,.4);
  padding: 14px 8px 6px;
}
.dt .d-nav .item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 8px;
  font-size: 13.5px; font-weight: 500; color: rgba(15,15,14,.65);
  cursor: pointer; transition: all .15s;
}
.dt .d-nav .item:hover { background: rgba(15,15,14,.04); color: #0F0F0E; }
.dt .d-nav .item.active { background: #0F0F0E; color: #FFFFFF; }
.dt .d-nav .item .ic { width: 18px; height: 18px; flex-shrink: 0; opacity: .85; }
.dt .d-nav .item .badge {
  margin-left: auto;
  padding: 1px 6px; border-radius: 5px;
  background: rgba(15,15,14,.08); color: rgba(15,15,14,.7);
  font-size: 10px; font-weight: 600;
}
.dt .d-nav .item.active .badge { background: rgba(255,255,255,.15); color: #fff; }

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

.dt .d-content {
  padding: 24px 32px 60px;
  display: flex; flex-direction: column; gap: 14px;
}
.dt .d-greet { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 4px; }
.dt .d-greet .h { margin-top: 4px; font-size: 26px; font-weight: 600; letter-spacing: -.022em; }

.dt .d-mode-toggle {
  display: flex; gap: 3px; padding: 3px;
  background: rgba(15,15,14,.04); border-radius: 10px;
}
.dt .d-mode-opt {
  padding: 7px 14px; border-radius: 7px;
  font-size: 13px; font-weight: 500;
  color: rgba(15,15,14,.6); cursor: pointer;
  display: inline-flex; align-items: center;
}
.dt .d-mode-opt.active {
  background: #FFFFFF; color: #0F0F0E; font-weight: 600;
  box-shadow: 0 1px 2px rgba(15,15,14,.08);
}

.dt .d-btn {
  padding: 9px 16px; border-radius: 9px;
  background: #0F0F0E; color: #fff;
  font-size: 13px; font-weight: 500; cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
}

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

/* IBOV + Caos hero row */
.dt .d-row-ibov {
  display: grid; grid-template-columns: 1.4fr 1fr; gap: 14px;
}
.dt .d-ibov-card { padding: 24px 26px; }
.dt .d-ibov-num {
  font-size: 38px; font-weight: 600; letter-spacing: -.03em;
  font-variant-numeric: tabular-nums; line-height: 1; margin-top: 10px;
}
.dt .d-ibov-unit { font-size: 18px; color: rgba(15,15,14,.4); font-weight: 500; margin-left: 6px; }
.dt .d-pill-pos {
  padding: 4px 10px; border-radius: 6px;
  background: rgba(15,140,77,.10); color: #0F8C4D;
  font-size: 13px; font-weight: 600;
}
.dt .d-ibov-chart {
  width: 100%; height: 180px; display: block;
  margin: 14px -8px 0;
}

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

/* Caos Desktop */
.dt .d-caos {
  padding: 24px 26px; border-radius: 18px;
  background: #0F0F0E; color: #FAF6EA;
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; justify-content: space-between;
}
.dt .d-caos-glow-r {
  position: absolute; right: -50px; top: -50px;
  width: 240px; height: 240px; border-radius: 50%;
  background: radial-gradient(circle, rgba(183,135,58,.30), transparent 65%);
  pointer-events: none;
}
.dt .d-caos-glow-l {
  position: absolute; left: -40px; bottom: -60px;
  width: 200px; height: 200px; border-radius: 50%;
  background: radial-gradient(circle, rgba(196,65,58,.18), transparent 65%);
  pointer-events: none;
}
.dt .d-caos-eyebrow {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; letter-spacing: .14em;
  text-transform: uppercase; font-weight: 600; color: #B7873A;
}
.dt .d-caos-h {
  font-size: 28px; font-weight: 600; letter-spacing: -.025em;
  margin-top: 16px; line-height: 1.15;
}
.dt .d-caos-red { color: #C4413A; font-family: 'Newsreader', serif; font-style: italic; }
.dt .d-caos-gold { color: #B7873A; font-family: 'Newsreader', serif; font-style: italic; }
.dt .d-caos-sub {
  font-size: 14px; color: rgba(255,255,255,.65); margin-top: 14px; line-height: 1.4;
}
.dt .d-caos-btn {
  padding: 12px 20px; border-radius: 10px;
  background: #FAF6EA; color: #0F0F0E;
  font-size: 14px; font-weight: 600;
  display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
}
.dt .d-caos-btn-ghost {
  padding: 12px 18px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,.2); color: #FAF6EA;
  font-size: 14px; font-weight: 500; cursor: pointer;
}

/* 4 col layout */
.dt .d-row-4col {
  display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 14px;
}
.dt .d-market-col { padding: 18px 20px; }
.dt .d-col-first {
  padding: 10px 0 14px;
  border-bottom: 1px solid rgba(15,15,14,.05);
  margin-bottom: 8px;
}
.dt .d-asset-logo {
  border-radius: 6px;
  display: grid; place-items: center;
  font-weight: 700; font-size: 10px; letter-spacing: -.02em;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.08);
}
.dt .d-asset-delta-tag {
  margin-left: auto;
  font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums;
}
.dt .d-col-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(15,15,14,.04);
}
.dt .d-col-row.last { border-bottom: 0; }

/* 2 col layout */
.dt .d-row-2col {
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
}

/* BTC card desktop */
.dt .d-btc-card {
  padding: 18px 20px;
  background: linear-gradient(135deg, rgba(247,147,26,.08) 0%, rgba(247,147,26,.02) 100%);
  border: 1px solid rgba(247,147,26,.18);
  border-radius: 14px;
  margin-top: 6px;
}
.dt .d-btc-logo {
  width: 36px; height: 36px; border-radius: 50%;
  background: #F7931A; color: #FFFFFF;
  display: grid; place-items: center;
  font-size: 18px; font-weight: 700;
}
.dt .d-btc-rank {
  padding: 1px 6px; border-radius: 4px;
  background: rgba(247,147,26,.12); color: #B86C0E;
  font-size: 9px; font-weight: 700; letter-spacing: .08em;
}
.dt .d-btc-chart {
  width: 100%; height: 80px; display: block;
  margin: 10px -4px 0;
}

.dt .d-crypto-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  margin-top: 12px;
}
.dt .d-crypto-row {
  padding: 12px 14px;
  background: rgba(15,15,14,.03); border-radius: 10px;
  display: flex; align-items: center; gap: 10px;
}
.dt .d-crypto-ic {
  width: 30px; height: 30px; border-radius: 50%;
  color: #fff; display: grid; place-items: center;
  font-size: 12px; font-weight: 700; flex-shrink: 0;
}

/* Tesouro desktop */
.dt .d-tesouro-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.dt .d-tesouro-row.last { border-bottom: 0; }
.dt .d-tesouro-ic {
  width: 32px; height: 32px; border-radius: 9px;
  background: rgba(91,74,122,.08); color: #5B4A7A;
  display: grid; place-items: center; flex-shrink: 0;
}

/* Chat CTA Desktop */
.dt .d-chat-cta { padding: 40px 44px 36px; }
.dt .d-chat-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
}
.dt .d-chat-card {
  background: #FFFFFF; border: 1px solid rgba(15,15,14,.06);
  border-radius: 14px; padding: 16px;
  cursor: pointer;
  display: flex; flex-direction: column; gap: 12px;
}
.dt .d-chat-ic {
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.7);
  display: grid; place-items: center;
}
.dt .d-chat-cat {
  padding: 2px 8px; border-radius: 5px;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.55);
  font-size: 10px; font-weight: 600;
}
.dt .d-chat-cta-link {
  font-size: 12px; color: #B7873A; font-weight: 600;
  display: inline-flex; align-items: center; gap: 4px;
  margin-top: auto;
}

.dt .d-chat-promo {
  margin-top: 28px; padding: 30px 36px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(183,135,58,.12) 0%, rgba(244,237,217,.5) 100%);
  position: relative; overflow: hidden;
}
.dt .d-chat-promo-glow {
  position: absolute; right: -60px; top: -60px;
  width: 280px; height: 280px; border-radius: 50%;
  background: radial-gradient(circle, rgba(183,135,58,.20), transparent 60%);
  pointer-events: none;
}
.dt .d-chat-promo-bubble {
  position: relative;
  display: flex; gap: 14px; align-items: flex-start;
  padding: 16px 20px;
  background: #FFFFFF; border-radius: 14px;
  border: 1px solid rgba(183,135,58,.20);
  max-width: 640px; margin: 0 auto;
}
.dt .d-chat-promo-ic {
  width: 38px; height: 38px; border-radius: 11px;
  background: linear-gradient(135deg, #D1A75A, #B7873A); color: #FFFFFF;
  display: grid; place-items: center; flex-shrink: 0;
}
.dt .d-chat-promo-stats {
  position: relative;
  display: flex; justify-content: center; gap: 24px;
  margin-top: 22px;
}
.dt .d-chat-stat {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; color: #B7873A; font-weight: 600;
}
.dt .d-chat-stat-div { width: 1px; background: rgba(15,15,14,.12); }
.dt .d-chat-promo-btn {
  position: relative; margin: 22px auto 0;
  padding: 14px 28px; border-radius: 12px;
  background: linear-gradient(135deg, #D1A75A, #B7873A); color: #FFFFFF;
  display: inline-flex; align-items: center; gap: 10px;
  cursor: pointer; box-shadow: 0 8px 24px -8px rgba(183,135,58,.5);
  width: max-content;
  left: 50%; transform: translateX(-50%);
}
.dt .d-chat-promo-foot {
  position: relative; text-align: center; margin-top: 14px;
  font-size: 12px; color: rgba(15,15,14,.55);
  display: flex; align-items: center; justify-content: center; gap: 6px;
}

/* News desktop */
.dt .d-news-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;
  margin-top: 6px;
}
.dt .d-news-card {
  padding: 14px 16px;
  background: rgba(15,15,14,.025);
  border: 1px solid rgba(15,15,14,.04);
  border-radius: 12px;
  cursor: pointer;
}
.dt .d-news-source {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; letter-spacing: .12em; font-weight: 700;
  color: rgba(15,15,14,.65);
}
.dt .d-news-time {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; color: rgba(15,15,14,.4);
}
.dt .d-news-tag {
  padding: 2px 7px; border-radius: 4px;
  background: rgba(15,15,14,.06); color: rgba(15,15,14,.65);
  font-size: 11px; font-weight: 600;
}

/* Guia desktop */
.dt .d-guia-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px;
  margin-top: 6px;
}
.dt .d-guia-card {
  background: rgba(15,15,14,.025);
  border: 1px solid rgba(15,15,14,.04);
  border-radius: 12px; padding: 16px 18px;
  display: flex; flex-direction: column; gap: 12px;
  cursor: pointer;
}
.dt .d-guia-ic {
  width: 44px; height: 44px; border-radius: 11px;
  background: rgba(15,15,14,.05); color: rgba(15,15,14,.7);
  display: grid; place-items: center;
}
.dt .d-guia-link {
  margin-top: auto;
  font-size: 12px; font-weight: 500; color: #0F0F0E;
  display: inline-flex; align-items: center; gap: 5px;
}

/* FAQ desktop */
.dt .d-faq-eyebrow {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px; letter-spacing: .18em;
  text-transform: uppercase; color: #B7873A; font-weight: 600;
}
.dt .d-faq-h {
  font-family: 'Inter', sans-serif;
  font-weight: 600; font-size: 32px;
  letter-spacing: -.025em; margin-top: 8px; line-height: 1.1;
}
.dt .d-faq-h-italic {
  font-family: 'Newsreader', serif; font-style: italic;
  font-weight: 500; color: #B7873A;
}
.dt .d-faq-talk {
  padding: 9px 16px; border-radius: 9px;
  background: rgba(15,15,14,.04);
  font-size: 13px; font-weight: 500;
  color: rgba(15,15,14,.7);
  display: inline-flex; align-items: center; gap: 6px;
  cursor: pointer;
}
.dt .d-faq { border-bottom: 1px solid rgba(15,15,14,.06); }
.dt .d-faq.last { border-bottom: 0; }
.dt .d-faq-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 0; cursor: pointer;
}
.dt .d-faq-btn {
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.6);
  display: grid; place-items: center; transition: all .2s;
}
.dt .d-faq-btn.open { background: #0F0F0E; color: #FFFFFF; }
.dt .d-faq-rot { transform: rotate(45deg); transition: transform .2s; }

.dt .d-faq-help {
  margin-top: 18px;
  padding: 18px 22px; border-radius: 14px;
  background: rgba(183,135,58,.06);
  border: 1px solid rgba(183,135,58,.18);
  display: flex; align-items: center; gap: 14px;
}
.dt .d-logo-mini {
  width: 26px; height: 26px; border-radius: 8px;
  background: #0F0F0E; color: #fff;
  display: inline-grid; place-items: center;
  font-size: 13px; font-weight: 700;
}

/* ============ "PARA VOCÊ" mobile styles ============ */
.phone.mercury .m-pv-hero {
  font-size: 34px; font-weight: 600; letter-spacing: -.032em;
  margin-top: 8px; font-variant-numeric: tabular-nums; line-height: 1;
}
.phone.mercury .m-pv-impact {
  margin-top: 14px; padding: 10px 12px;
  background: rgba(196,65,58,.04);
  border-left: 3px solid #C4413A;
  border-radius: 4px 8px 8px 4px;
}
.phone.mercury .m-pv-factors {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 12px;
}
.phone.mercury .m-pv-factor {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; background: rgba(15,15,14,.025); border-radius: 9px;
}
.phone.mercury .m-pv-factor-ic {
  width: 26px; height: 26px; border-radius: 7px;
  display: grid; place-items: center;
  font-size: 12px; font-weight: 700; flex-shrink: 0;
}
.phone.mercury .m-pv-factor-label {
  font-size: 11px; font-weight: 600;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.phone.mercury .m-pv-factor-amount {
  font-size: 11px; font-weight: 600; color: #C4413A;
  margin-top: 1px; font-variant-numeric: tabular-nums;
}

/* Resumo do dia · IA card editorial */
.phone.mercury .m-pv-resumo {
  margin-top: 10px;
  background: linear-gradient(135deg, rgba(255,237,209,.45), rgba(248,232,209,.20));
  border: 1px solid rgba(183,135,58,.20);
}
.phone.mercury .m-pv-resumo-logo {
  width: 24px; height: 24px; border-radius: 50%;
  background: #0F0F0E;
  display: inline-grid; place-items: center;
}
.phone.mercury .m-pv-resumo-logo img { width: 14px; height: 14px; display: block; }
.phone.mercury .m-pv-resumo-eyebrow {
  font-family: 'IBM Plex Mono', monospace; font-size: 9px;
  letter-spacing: .14em; color: #B7873A; font-weight: 600;
}
.phone.mercury .m-pv-resumo-stats {
  display: flex; gap: 10px; margin-top: 12px;
  font-size: 10px; color: rgba(15,15,14,.6); flex-wrap: wrap;
}
.phone.mercury .m-pv-resumo-stats b { color: #0F0F0E; }
.phone.mercury .m-pv-resumo-cta {
  margin-top: 14px; padding: 10px 14px;
  background: #0F0F0E; color: #FFFFFF; border-radius: 9px;
  font-size: 13px; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  text-decoration: none;
}

/* Holdings list */
.phone.mercury .m-pv-holdings-header {
  padding: 12px 22px; display: flex; align-items: center; gap: 10px;
  border-bottom: 1px solid rgba(15,15,14,.05);
  background: rgba(15,15,14,.02);
}
.phone.mercury .m-pv-holding-row {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 22px;
  border-bottom: 1px solid rgba(15,15,14,.04);
  text-decoration: none; color: inherit;
  transition: background .15s;
}
.phone.mercury .m-pv-holding-row:hover { background: rgba(15,15,14,.02); }
.phone.mercury .m-pv-holding-row.last { border-bottom: 0; }
.phone.mercury .m-pv-holding-logo {
  width: 26px; height: 26px; border-radius: 8px;
  display: grid; place-items: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
}

/* Indices */
.phone.mercury .m-pv-index-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 0;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.phone.mercury .m-pv-index-row.last { border-bottom: 0; }
</style>

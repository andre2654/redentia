<!--
  V4 — Ativo PETR4 (Mercury Bank style).
  Mobile + Desktop · preço + chart + fundamentalistas + Redentia metrics +
  MDI + notícias + demonstrações + checklist + FAQ.
-->
<template>
  <div class="v4">

    <!-- ============ MOBILE SHELL (.phone.mercury) ============ -->
    <div class="phone mercury">
      <div class="m-appbar" style="padding-bottom:18px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <NuxtLink to="/dev/mobile-layouts/v4/home" class="m-back-btn">
            <UIcon name="i-lucide-chevron-left" class="size-4" />
          </NuxtLink>
          <div class="m-asset-logo">PETR4</div>
          <div>
            <div style="font-size:16px; font-weight:600; letter-spacing:-.012em;">PETR4</div>
            <div style="font-size:10px; color:rgba(15,15,14,.55); margin-top:1px;">Petrobras PN N2</div>
          </div>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="m-back-btn">
            <UIcon name="i-lucide-bell" class="size-3" />
          </button>
        </div>
      </div>

      <div class="m-scroll">
        <!-- Hero price + chart -->
        <div class="m-card m-card-lg">
          <div class="m-label">Preço atual</div>
          <div style="font-size:36px; font-weight:600; letter-spacing:-.032em; margin-top:8px; font-variant-numeric:tabular-nums; line-height:1;">R$ 38,42</div>
          <div style="display:flex; align-items:center; gap:8px; margin-top:10px;">
            <span class="m-pos-pill">↑ 2,14%</span>
            <span style="font-size:12px; color:rgba(15,15,14,.55);">+R$ 0,80 hoje</span>
          </div>
          <div style="margin-top:14px; margin-left:-6px; margin-right:-6px; height:140px;">
            <svg viewBox="0 0 350 140" preserveAspectRatio="none" style="width:100%; height:100%; display:block;">
              <defs>
                <linearGradient id="ativoM" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#0F8C4D" stop-opacity="0.22" />
                  <stop offset="100%" stop-color="#0F8C4D" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,110 L25,98 L50,108 L75,90 L100,82 L125,88 L150,72 L175,76 L200,60 L225,52 L250,58 L275,42 L300,38 L325,28 L350,22 L350,140 L0,140 Z"
                    fill="url(#ativoM)" />
              <path d="M0,110 L25,98 L50,108 L75,90 L100,82 L125,88 L150,72 L175,76 L200,60 L225,52 L250,58 L275,42 L300,38 L325,28 L350,22"
                    fill="none" stroke="#0F8C4D" stroke-width="1.8"
                    stroke-linejoin="round" stroke-linecap="round" />
              <circle cx="350" cy="22" r="3.5" fill="#0F8C4D" stroke="#FFFFFF" stroke-width="1.5" />
            </svg>
          </div>
          <div style="display:flex; justify-content:center; margin-top:14px;">
            <div class="m-seg">
              <span v-for="(p, i) in periods" :key="p" class="s" :class="{ active: i === 3 }">{{ p }}</span>
            </div>
          </div>
          <div class="m-hero-stats">
            <div v-for="s in heroStatsM" :key="s.l">
              <div class="m-label" style="font-size:9px;">{{ s.l }}</div>
              <div style="font-size:13px; font-weight:600; margin-top:3px; font-variant-numeric:tabular-nums;">{{ s.v }}</div>
            </div>
          </div>
        </div>

        <!-- CTAs -->
        <div style="padding:14px 16px 0; display:flex; gap:8px; margin-bottom:10px;">
          <div class="m-cta-primary">Comparar</div>
          <div class="m-cta-ghost">Criar alerta</div>
        </div>

        <!-- Fundamentalistas -->
        <div class="m-section">
          <span class="title">Fundamentalistas</span>
          <span class="link">Histórico →</span>
        </div>
        <div class="m-card" style="padding:4px 0;">
          <div v-for="(f, i) in fundamentaisM" :key="f.l"
               class="m-fund-row"
               :class="{ 'm-fund-row-last': i === fundamentaisM.length - 1 }">
            <span style="font-size:13px; color:rgba(15,15,14,.65);">{{ f.l }}</span>
            <span style="font-size:13px; font-weight:600; font-variant-numeric:tabular-nums;">{{ f.v }}</span>
          </div>
        </div>

        <!-- Inteligentes Redentia -->
        <div class="m-section">
          <span class="title">Dados inteligentes · Redentia</span>
        </div>
        <div class="m-card m-redentia-card">
          <div v-for="(m, i) in redentiaMetrics" :key="m.l"
               class="m-rmet-row"
               :class="{ 'm-rmet-row-last': i === redentiaMetrics.length - 1 }">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
              <span style="font-size:13px; font-weight:500;">{{ m.l }}</span>
              <span style="font-size:13px; font-weight:600; font-variant-numeric:tabular-nums;" :style="{ color: m.c }">
                {{ m.v.toFixed(1).replace('.', ',') }}<span style="color:rgba(15,15,14,.4); font-weight:500; font-size:10px;">/10</span>
              </span>
            </div>
            <div class="m-rmet-bar">
              <div :style="{ width: (m.v * 10) + '%', background: m.c }" class="m-rmet-fill"></div>
            </div>
          </div>
        </div>

        <!-- MDI -->
        <div class="m-section">
          <span class="title">MDI · Dividendo Inteligente</span>
        </div>
        <div class="m-card">
          <div class="m-label" style="font-size:11px;">Histórico + projeção 5 meses</div>
          <div style="margin-top:12px; height:130px;">
            <svg viewBox="0 0 340 128" preserveAspectRatio="none" style="width:100%; height:100%; display:block;">
              <g v-for="(mo, i) in mdiMonths" :key="mo.m">
                <rect v-if="mo.proj"
                      :x="4 + i * 28" :y="110 - (mo.v / 1.55) * 100"
                      width="22" :height="(mo.v / 1.55) * 100"
                      fill="rgba(183,135,58,.20)" stroke="#B7873A" stroke-width="1"
                      stroke-dasharray="2 2" rx="2" />
                <rect v-else
                      :x="4 + i * 28" :y="110 - (mo.v / 1.55) * 100"
                      width="22" :height="(mo.v / 1.55) * 100"
                      fill="#0F8C4D" :opacity="i < 7 ? 1 : 0.5" rx="2" />
                <text :x="15 + i * 28" y="124" text-anchor="middle"
                      font-family="IBM Plex Mono" font-size="8" letter-spacing=".04em"
                      :fill="mo.proj ? '#B7873A' : 'rgba(15,15,14,.5)'"
                      :font-weight="mo.proj ? 600 : 500">{{ mo.m }}</text>
              </g>
            </svg>
          </div>
          <div style="display:flex; gap:12px; margin-top:10px; font-size:10px; color:rgba(15,15,14,.55); flex-wrap:wrap;">
            <span style="display:inline-flex; align-items:center; gap:4px;"><span style="width:7px; height:7px; border-radius:2px; background:#0F8C4D;"></span>Pago</span>
            <span style="display:inline-flex; align-items:center; gap:4px;"><span style="width:7px; height:7px; border-radius:2px; background:rgba(183,135,58,.5); border:1px dashed #B7873A;"></span>Projeção</span>
          </div>
          <div class="m-mdi-stats">
            <div v-for="s in mdiStatsM" :key="s.l">
              <div class="m-label" style="font-size:9px;">{{ s.l }}</div>
              <div style="font-size:15px; font-weight:600; margin-top:3px; font-variant-numeric:tabular-nums;" :style="{ color: s.c || '#0F0F0E' }">{{ s.v }}</div>
              <div style="font-size:10px; color:rgba(15,15,14,.5); margin-top:1px;">{{ s.s }}</div>
            </div>
          </div>
        </div>

        <!-- Notícias -->
        <div class="m-section">
          <span class="title">Notícias sobre PETR4</span>
          <span class="link">Tudo →</span>
        </div>
        <div style="padding:0 16px 8px;">
          <div class="m-news-feat">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:10px;">
              <span style="font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.12em; font-weight:700; color:#B7873A;">DESTAQUE · VALOR</span>
              <span style="color:rgba(15,15,14,.3);">·</span>
              <span style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:rgba(15,15,14,.45);">2h</span>
            </div>
            <div class="m-news-hero">
              <div class="m-news-hero-bg">BR</div>
            </div>
            <div style="font-size:15px; font-weight:600; letter-spacing:-.005em; line-height:1.3;">Brent dispara 3,2% e reaviva tese de alta de Petrobras</div>
            <div style="display:flex; gap:5px; margin-top:10px;">
              <span v-for="t in ['PETRÓLEO', 'BRENT']" :key="t" class="m-news-tag">{{ t }}</span>
            </div>
          </div>
        </div>
        <div class="m-card" style="padding:4px 0;">
          <div v-for="(n, i) in news" :key="n.title"
               class="m-news-row"
               :class="{ 'm-news-row-last': i === news.length - 1 }">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:5px;">
              <span style="font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.12em; font-weight:700; color:rgba(15,15,14,.6);">{{ n.source.toUpperCase() }}</span>
              <span style="color:rgba(15,15,14,.3);">·</span>
              <span style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:rgba(15,15,14,.4);">{{ n.time }}</span>
            </div>
            <div style="font-size:13px; font-weight:600; line-height:1.35;">{{ n.title }}</div>
            <div style="margin-top:6px;">
              <span class="m-news-tag-amber">{{ n.tag }}</span>
            </div>
          </div>
        </div>

        <!-- Demonstrações financeiras -->
        <div class="m-section">
          <span class="title">Demonstrações financeiras</span>
          <span class="link">Detalhes →</span>
        </div>
        <div class="m-fin-row">
          <div v-for="(card, ci) in finCardsM" :key="card.t" class="m-fin-card">
            <div style="font-size:13px; font-weight:600; margin-bottom:12px;">{{ card.t }}</div>
            <div v-for="(it, i) in card.items" :key="it.l"
                 class="m-fin-item"
                 :class="{ 'm-fin-item-last': i === card.items.length - 1 }">
              <span :style="{
                fontSize: '12px',
                fontWeight: it.b ? 600 : 500,
                color: it.b ? '#0F0F0E' : 'rgba(15,15,14,.7)'
              }">{{ it.l }}</span>
              <span style="font-size:12px; font-weight:600; font-variant-numeric:tabular-nums;" :style="{ color: it.c }">{{ it.v }}</span>
            </div>
            <div class="m-fin-foot">2025 · R$ BI</div>
          </div>
        </div>

        <!-- Checklist -->
        <div class="m-section">
          <div>
            <span class="title">Checklist fundamentalista</span>
            <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:1px; font-weight:500;">8 de 10 critérios atendidos</div>
          </div>
          <span class="m-score-tag">8/10</span>
        </div>
        <div class="m-card" style="padding:4px 0;">
          <div v-for="(c, i) in checklistM" :key="i"
               class="m-check-row"
               :class="{ 'm-check-row-last': i === checklistM.length - 1 }">
            <div class="m-check-ic" :class="`m-check-ic-${c.ok === true ? 'ok' : c.ok === false ? 'fail' : 'na'}`">
              <UIcon v-if="c.ok === true" name="i-lucide-check" class="size-3" />
              <UIcon v-else-if="c.ok === false" name="i-lucide-x" class="size-3" />
              <UIcon v-else name="i-lucide-minus" class="size-3" />
            </div>
            <div style="flex:1; min-width:0;">
              <div style="font-size:12.5px; font-weight:500; letter-spacing:-.003em;">{{ c.title }}</div>
              <div v-if="c.detail" style="font-size:10.5px; color:rgba(15,15,14,.55); margin-top:2px;">{{ c.detail }}</div>
            </div>
          </div>
        </div>

        <!-- Últimos proventos -->
        <div class="m-section">
          <div>
            <span class="title">Últimos proventos</span>
            <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:1px; font-weight:500;">Você tem 400 cotas</div>
          </div>
          <span class="link">Calendário →</span>
        </div>
        <div class="m-card" style="padding:4px 0;">
          <div v-for="(p, i) in proventosM" :key="p.d"
               class="m-prov-row"
               :class="{ 'm-prov-row-last': i === proventosM.length - 1 }">
            <div>
              <div style="font-size:13px; font-weight:600;">{{ p.tipo }}</div>
              <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:1px;">{{ p.d }}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:13px; font-weight:600; color:#0F8C4D; font-variant-numeric:tabular-nums;">{{ p.valor }}<span style="color:rgba(15,15,14,.4); font-weight:500; font-size:10px; margin-left:3px;">/cota</span></div>
              <div style="font-size:11px; color:rgba(15,15,14,.55); margin-top:2px; font-variant-numeric:tabular-nums;">{{ p.total }}</div>
            </div>
          </div>
        </div>

        <!-- Chat CTA -->
        <div style="padding:14px 16px 0;">
          <div class="m-chat-cta">
            <div class="m-chat-pill">
              <UIcon name="i-lucide-sparkles" class="size-3" />
              PERGUNTE PRA REDENT.IA
            </div>
            <div style="font-size:20px; font-weight:600; letter-spacing:-.018em; margin-top:12px; line-height:1.2;">
              Vale a pena investir em <span style="font-family:'Newsreader',serif; font-style:italic; font-weight:500; color:#B7873A;">PETR4?</span>
            </div>
            <div style="font-size:12px; color:rgba(15,15,14,.6); margin-top:8px; line-height:1.4;">A IA cruza fundamentos, dividendos e macro pra responder em segundos.</div>
            <div class="m-chat-btn">
              <UIcon name="i-lucide-message-circle" class="size-3" />
              Abrir conversa
              <UIcon name="i-lucide-arrow-right" class="size-3" />
            </div>
          </div>
        </div>

        <!-- FAQ -->
        <div class="m-section">
          <span class="title">Dúvidas sobre PETR4</span>
        </div>
        <div class="m-card" style="padding:4px 22px;">
          <div v-for="(f, i) in faqs" :key="f.q"
               :class="{ 'm-faq-row-last': i === faqs.length - 1 }"
               class="m-faq-row">
            <div class="m-faq-head" @click="openFaqM = openFaqM === i ? -1 : i">
              <span style="font-size:13px; font-weight:600; letter-spacing:-.005em; flex:1; padding-right:10px;">{{ f.q }}</span>
              <div class="m-faq-toggle" :class="{ open: openFaqM === i }">
                <UIcon name="i-lucide-plus" class="size-3" />
              </div>
            </div>
            <div v-if="openFaqM === i" style="padding:0 0 14px; font-size:12.5px; color:rgba(15,15,14,.7); line-height:1.55;">{{ f.a }}</div>
          </div>
        </div>

        <div style="height:30px;"></div>
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
          <NuxtLink v-for="n in navMain" :key="n.label" :to="n.to" class="item">
            <UIcon :name="n.icon" class="ic" />
            <span>{{ n.label }}</span>
            <span v-if="n.badge" class="badge">{{ n.badge }}</span>
          </NuxtLink>
          <div class="grp">Ferramentas</div>
          <NuxtLink v-for="t in navTools" :key="t.label" :to="t.to || '#'" class="item">
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
          <!-- Header -->
          <div class="d-greet">
            <div>
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <NuxtLink to="/dev/mobile-layouts/v4/home" class="d-mut" style="font-size:12px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:4px; text-decoration:none;">
                  <UIcon name="i-lucide-chevron-left" class="size-3" />
                  Mercado
                </NuxtLink>
                <span class="d-dim" style="font-size:12px;">·</span>
                <span class="d-mut" style="font-size:12px; font-weight:500;">Ações BR · Petróleo</span>
              </div>
              <div style="display:flex; align-items:center; gap:14px;">
                <div class="d-asset-logo">PETR4</div>
                <div>
                  <div class="h">PETR4</div>
                  <div class="d-mut" style="font-size:13px; margin-top:3px; font-weight:500;">Petrobras PN N2 · Petróleo & Gás</div>
                </div>
              </div>
            </div>
            <div class="actions">
              <div class="d-btn d-btn-ghost"><UIcon name="i-lucide-bell" class="size-3" />Criar alerta</div>
              <div class="d-btn"><UIcon name="i-lucide-grid-2x2" class="size-3" />Comparar</div>
            </div>
          </div>

          <!-- Hero price + chart -->
          <div class="d-card" style="padding:28px 32px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <div class="d-label">Preço atual</div>
                <div style="font-size:44px; font-weight:600; letter-spacing:-.032em; margin-top:10px; font-variant-numeric:tabular-nums; line-height:1;">R$ 38,42</div>
                <div style="display:flex; align-items:center; gap:10px; margin-top:12px;">
                  <span class="d-pos-pill">↑ 2,14%</span>
                  <span style="font-size:13px; color:rgba(15,15,14,.55);">+R$ 0,80 hoje · vol R$ 480M</span>
                </div>
              </div>
              <div class="d-seg">
                <span v-for="(p, i) in periodsD" :key="p" class="s" :class="{ active: i === 3 }">{{ p }}</span>
              </div>
            </div>
            <div style="margin-top:18px; margin-left:-8px; margin-right:-8px; height:240px;">
              <svg viewBox="0 0 800 240" preserveAspectRatio="none" style="width:100%; height:100%; display:block;">
                <defs>
                  <linearGradient id="ativoD" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#0F8C4D" stop-opacity="0.22" />
                    <stop offset="100%" stop-color="#0F8C4D" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,190 L50,178 L100,184 L150,160 L200,148 L250,158 L300,128 L350,134 L400,108 L450,98 L500,104 L550,76 L600,68 L650,52 L700,42 L750,28 L800,18 L800,240 L0,240 Z"
                      fill="url(#ativoD)" />
                <path d="M0,190 L50,178 L100,184 L150,160 L200,148 L250,158 L300,128 L350,134 L400,108 L450,98 L500,104 L550,76 L600,68 L650,52 L700,42 L750,28 L800,18"
                      fill="none" stroke="#0F8C4D" stroke-width="2"
                      stroke-linejoin="round" stroke-linecap="round" />
                <circle cx="800" cy="18" r="4" fill="#0F8C4D" stroke="#FFFFFF" stroke-width="1.5" />
              </svg>
            </div>
            <div class="d-hero-stats">
              <div v-for="s in heroStatsD" :key="s.l">
                <div class="d-label" style="font-size:10px;">{{ s.l }}</div>
                <div style="font-size:15px; font-weight:600; margin-top:5px; font-variant-numeric:tabular-nums;" :style="{ color: s.c || '#0F0F0E' }">{{ s.v }}</div>
              </div>
            </div>
          </div>

          <!-- Fundamentalistas + Redentia -->
          <div class="d-fund-row">
            <div class="d-card">
              <div class="d-section-h">
                <span class="title">Dados fundamentalistas</span>
                <span class="link">Histórico →</span>
              </div>
              <div class="d-fund-grid">
                <div v-for="f in fundamentaisD" :key="f.l" class="d-fund-cell">
                  <div class="d-label" style="font-size:10px;">{{ f.l }}</div>
                  <div style="font-size:20px; font-weight:600; letter-spacing:-.02em; margin-top:6px; font-variant-numeric:tabular-nums;">{{ f.v }}</div>
                  <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:2px;">{{ f.s }}</div>
                </div>
              </div>
            </div>

            <div class="d-card d-redentia-card">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                <UIcon name="i-lucide-sparkles" class="size-4" style="color:#B7873A" />
                <span style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.14em; color:#B7873A; font-weight:600;">DADOS INTELIGENTES · REDENTIA</span>
              </div>
              <div class="d-section-h" style="margin-bottom:14px;">
                <span class="title">Como a Redentia vê</span>
              </div>
              <div v-for="(m, i) in redentiaMetrics" :key="m.l"
                   class="d-rmet-row"
                   :class="{ 'd-rmet-row-last': i === redentiaMetrics.length - 1 }">
                <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:5px;">
                  <span style="font-size:13px; font-weight:500;">{{ m.l }}</span>
                  <span style="font-size:14px; font-weight:600; font-variant-numeric:tabular-nums;" :style="{ color: m.c }">
                    {{ m.v.toFixed(1).replace('.', ',') }}<span style="color:rgba(15,15,14,.4); font-weight:500; font-size:11px;">/10</span>
                  </span>
                </div>
                <div class="d-rmet-bar">
                  <div :style="{ width: (m.v * 10) + '%', background: m.c }" class="d-rmet-fill"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- MDI -->
          <div class="d-card">
            <div class="d-section-h">
              <div>
                <span class="title">MDI · Mapa do Dividendo Inteligente</span>
                <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:3px;">Histórico + projeção dos próximos 5 meses · em R$/cota</div>
              </div>
              <div style="display:flex; gap:14px; font-size:11px;">
                <span style="display:inline-flex; align-items:center; gap:5px;"><span style="width:8px; height:8px; border-radius:2px; background:#0F8C4D;"></span>Pago</span>
                <span style="display:inline-flex; align-items:center; gap:5px;"><span style="width:8px; height:8px; border-radius:2px; background:#0F8C4D; opacity:.5;"></span>Confirmado</span>
                <span style="display:inline-flex; align-items:center; gap:5px;"><span style="width:8px; height:8px; border-radius:2px; background:rgba(183,135,58,.5); border:1.5px dashed #B7873A;"></span>Projeção</span>
              </div>
            </div>
            <div style="margin-top:18px; height:200px;">
              <svg viewBox="0 0 900 200" preserveAspectRatio="none" style="width:100%; height:100%; display:block;">
                <line v-for="f in [0.25, 0.5, 0.75]" :key="f"
                      x1="20" :x2="880" :y1="16 + 168*f" :y2="16 + 168*f"
                      stroke="rgba(15,15,14,.06)" stroke-dasharray="2 4" />
                <g v-for="(mo, i) in mdiMonths" :key="mo.m">
                  <rect v-if="mo.proj"
                        :x="20 + i * 73" :y="180 - (mo.v / 1.55) * 148"
                        width="65" :height="(mo.v / 1.55) * 148"
                        fill="rgba(183,135,58,.20)" stroke="#B7873A" stroke-width="1"
                        stroke-dasharray="3 3" rx="3" />
                  <rect v-else
                        :x="20 + i * 73" :y="180 - (mo.v / 1.55) * 148"
                        width="65" :height="(mo.v / 1.55) * 148"
                        fill="#0F8C4D" :opacity="i < 7 ? 1 : 0.5" rx="3" />
                  <text :x="20 + i * 73 + 32" :y="180 - (mo.v / 1.55) * 148 - 6"
                        text-anchor="middle" font-family="Inter" font-size="10" font-weight="600"
                        :fill="mo.proj ? '#B7873A' : '#0F8C4D'">R$ {{ mo.v.toFixed(2).replace('.', ',') }}</text>
                  <text :x="20 + i * 73 + 32" y="198"
                        text-anchor="middle" font-family="IBM Plex Mono" font-size="10" letter-spacing=".05em"
                        :fill="mo.proj ? '#B7873A' : 'rgba(15,15,14,.5)'"
                        :font-weight="mo.proj ? 600 : 500">{{ mo.m }}</text>
                </g>
              </svg>
            </div>
            <div class="d-mdi-stats">
              <div v-for="s in mdiStatsD" :key="s.l">
                <div class="d-label" style="font-size:10px;">{{ s.l }}</div>
                <div style="font-size:18px; font-weight:600; letter-spacing:-.015em; margin-top:5px; font-variant-numeric:tabular-nums;" :style="{ color: s.c || '#0F0F0E' }">{{ s.v }}</div>
                <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:2px;">{{ s.s }}</div>
              </div>
            </div>
          </div>

          <!-- Notícias -->
          <div class="d-card" style="padding:0; overflow:hidden;">
            <div class="d-section-h" style="padding:22px 26px 14px; margin-bottom:0; border-bottom:1px solid rgba(15,15,14,.06);">
              <div>
                <span class="title">Notícias sobre PETR4</span>
                <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:3px;">Últimas 24h · 6 fontes · curadoria Redentia</div>
              </div>
              <span class="link">Tudo →</span>
            </div>
            <div class="d-news-grid">
              <div class="d-news-feat-col">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
                  <span style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.14em; font-weight:700; color:#B7873A;">DESTAQUE · VALOR</span>
                  <span style="color:rgba(15,15,14,.3);">·</span>
                  <span style="font-size:11px; color:rgba(15,15,14,.5); font-family:'IBM Plex Mono',monospace;">2h</span>
                </div>
                <div class="d-news-hero">
                  <span class="d-news-glow"></span>
                  <div class="d-news-hero-bg">BR</div>
                </div>
                <div style="font-size:22px; font-weight:600; letter-spacing:-.015em; line-height:1.25; color:#0F0F0E;">Brent dispara 3,2% e reaviva tese de alta de Petrobras no curto prazo</div>
                <div style="font-size:14px; color:rgba(15,15,14,.7); margin-top:12px; line-height:1.55; flex:1;">Tensão no Oriente Médio empurrou Brent para acima de US$ 88 pelo segundo dia consecutivo. Analistas elevaram preço-alvo de PETR4.</div>
                <div style="display:flex; align-items:center; justify-content:space-between; margin-top:18px; padding-top:14px; border-top:1px solid rgba(15,15,14,.05);">
                  <div style="display:flex; gap:6px;">
                    <span v-for="t in ['PETROBRAS', 'PETRÓLEO', 'BRENT']" :key="t" class="d-news-tag">{{ t }}</span>
                  </div>
                  <span style="font-size:13px; font-weight:500; color:#B7873A; display:inline-flex; align-items:center; gap:5px; cursor:pointer;">
                    Ler completa
                    <UIcon name="i-lucide-external-link" class="size-3" />
                  </span>
                </div>
              </div>
              <div class="d-news-side-col">
                <div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:rgba(15,15,14,.5); font-weight:600; margin-bottom:14px;">OUTRAS MANCHETES</div>
                <div style="flex:1; display:flex; flex-direction:column;">
                  <div v-for="(n, i) in newsOthers" :key="n.title"
                       class="d-news-row"
                       :class="{ 'd-news-row-last': i === newsOthers.length - 1 }">
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:5px;">
                      <span style="font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.12em; font-weight:700; color:rgba(15,15,14,.6);">{{ n.source.toUpperCase() }}</span>
                      <span style="color:rgba(15,15,14,.3); font-size:10px;">·</span>
                      <span style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:rgba(15,15,14,.4);">{{ n.time }}</span>
                    </div>
                    <div style="font-size:13px; font-weight:600; letter-spacing:-.003em; line-height:1.35; color:#0F0F0E;">{{ n.title }}</div>
                    <div style="display:flex; gap:5px; margin-top:6px;">
                      <span v-for="t in n.tags" :key="t" class="d-news-tag-amber">{{ t }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Demonstrações financeiras -->
          <div class="d-section-h" style="margin-bottom:0; margin-top:0; padding:0 4px;">
            <div>
              <span class="title">Demonstrações financeiras</span>
              <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:3px;">Últimos 5 anos · em R$ bilhões</div>
            </div>
            <span class="link">Detalhes →</span>
          </div>
          <div class="d-fin-row">
            <div v-for="card in finCardsD" :key="card.title" class="d-card" style="padding:20px 22px;">
              <div class="d-section-h" style="margin-bottom:14px;">
                <span class="title" style="font-size:14px;">{{ card.title }}</span>
                <span class="d-mut" style="font-size:11px;">5 anos</span>
              </div>
              <div style="margin-left:-4px; margin-right:-4px; height:118px;">
                <svg viewBox="0 0 320 118" preserveAspectRatio="none" style="width:100%; height:100%; display:block;">
                  <line x1="4" x2="316" y1="50" y2="50" stroke="rgba(15,15,14,.08)" stroke-dasharray="2 3" />
                  <g v-for="(s, si) in card.series" :key="s.l">
                    <path :d="serieToPath(s.v)"
                          fill="none" :stroke="s.color"
                          :stroke-width="s.bold ? 2.2 : 1.4"
                          :opacity="s.bold ? 1 : 0.72"
                          stroke-linecap="round" stroke-linejoin="round" />
                  </g>
                  <text v-for="(y, i) in ['2021', '2022', '2023', '2024', '2025']" :key="y"
                        :x="4 + (i / 4) * 312" y="114"
                        text-anchor="middle" font-family="IBM Plex Mono" font-size="9"
                        letter-spacing=".05em" fill="rgba(15,15,14,.4)" font-weight="500">{{ y }}</text>
                </svg>
              </div>
              <div style="margin-top:8px; padding-top:8px; border-top:1px solid rgba(15,15,14,.06);">
                <div v-for="(s, i) in card.series" :key="s.l"
                     class="d-fin-leg"
                     :class="{ 'd-fin-leg-last': i === card.series.length - 1 }">
                  <div style="display:flex; align-items:center; gap:7px;">
                    <span :style="{ background: s.color, opacity: s.bold ? 1 : 0.72 }" style="width:8px; height:8px; border-radius:2px;"></span>
                    <span :style="{
                      fontSize: '12px',
                      fontWeight: s.bold ? 600 : 500,
                      color: s.bold ? '#0F0F0E' : 'rgba(15,15,14,.7)'
                    }">{{ s.l }}</span>
                  </div>
                  <span :style="{
                    fontSize: '12px', fontWeight: 600,
                    color: s.v[s.v.length - 1] < 0 ? '#C4413A' : (s.bold ? s.color : '#0F0F0E')
                  }" style="font-variant-numeric:tabular-nums;">
                    {{ s.v[s.v.length - 1] >= 0 ? '+' : '−' }}R$ {{ Math.abs(s.v[s.v.length - 1]) }}B
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Checklist + Proventos -->
          <div class="d-check-row">
            <div class="d-card">
              <div class="d-section-h">
                <div>
                  <span class="title">Checklist fundamentalista</span>
                  <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:3px;">8 de 10 critérios atendidos · score Redentia 8,4/10</div>
                </div>
                <span class="d-score-tag">8/10</span>
              </div>
              <div style="margin-top:6px;">
                <div v-for="(c, i) in checklistD" :key="c.title"
                     class="d-check-row-item"
                     :class="{ 'd-check-row-item-last': i === checklistD.length - 1 }">
                  <div class="d-check-ic" :class="`d-check-ic-${c.ok === true ? 'ok' : c.ok === false ? 'fail' : 'na'}`">
                    <UIcon v-if="c.ok === true" name="i-lucide-check" class="size-3" />
                    <UIcon v-else-if="c.ok === false" name="i-lucide-x" class="size-3" />
                    <UIcon v-else name="i-lucide-minus" class="size-3" />
                  </div>
                  <div style="flex:1; min-width:0;">
                    <div style="font-size:13px; font-weight:500; letter-spacing:-.005em;">{{ c.title }}</div>
                    <div v-if="c.detail" style="font-size:11px; color:rgba(15,15,14,.55); margin-top:3px;">{{ c.detail }}</div>
                  </div>
                  <span v-if="c.warn" class="d-warn-tag">FALHA</span>
                </div>
              </div>
            </div>

            <div class="d-card">
              <div class="d-section-h">
                <div>
                  <span class="title">Últimos proventos</span>
                  <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:3px;">Você tem 400 cotas</div>
                </div>
                <span class="link">Calendário →</span>
              </div>
              <div style="margin-top:6px;">
                <div v-for="(p, i) in proventosD" :key="p.d"
                     class="d-prov-row"
                     :class="{ 'd-prov-row-last': i === proventosD.length - 1 }">
                  <div style="flex:1; min-width:0;">
                    <div style="font-size:13px; font-weight:600;">{{ p.tipo }}</div>
                    <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:2px;">{{ p.d }}</div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-size:13px; font-weight:600; color:#0F8C4D; font-variant-numeric:tabular-nums;">{{ p.valor }} <span style="color:rgba(15,15,14,.4); font-weight:500; font-size:10px;">/cota</span></div>
                    <div style="font-size:11px; color:rgba(15,15,14,.55); margin-top:2px; font-variant-numeric:tabular-nums;">{{ p.total }} recebido</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat CTA -->
          <div class="d-card d-chat-cta">
            <div style="text-align:center;">
              <div class="d-chat-pill">
                <UIcon name="i-lucide-sparkles" class="size-3" />
                PERGUNTE PRA REDENT.IA
              </div>
              <div style="font-weight:600; font-size:30px; letter-spacing:-.022em; margin-top:16px; line-height:1.15;">
                Vale a pena
                <span style="font-family:'Newsreader',serif; font-style:italic; font-weight:500; color:#B7873A;">investir em PETR4?</span>
              </div>
              <div style="font-size:14px; color:rgba(15,15,14,.6); margin-top:10px; max-width:560px; margin-left:auto; margin-right:auto;">
                A IA cruza fundamentos, dividendos e contexto macro pra responder em segundos, com explicação clara.
              </div>
            </div>
            <div class="d-chat-suggest-row">
              <div v-for="c in chatSuggestions" :key="c.q" class="d-chat-suggest-card">
                <div style="font-size:13px; font-weight:600; letter-spacing:-.005em; line-height:1.35;">{{ c.q }}</div>
                <div style="margin-top:10px; font-size:12px; font-weight:600; color:#B7873A; display:inline-flex; align-items:center; gap:5px;">
                  Perguntar
                  <UIcon name="i-lucide-arrow-right" class="size-3" />
                </div>
              </div>
            </div>
            <div style="display:flex; justify-content:center; margin-top:22px;">
              <div class="d-chat-cta-btn">
                <UIcon name="i-lucide-message-circle" class="size-3" />
                Abrir conversa
                <UIcon name="i-lucide-arrow-right" class="size-3" />
              </div>
            </div>
          </div>

          <!-- FAQ -->
          <div>
            <div class="d-section-h" style="margin-bottom:18px; padding-left:4px;">
              <div>
                <div style="font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:#B7873A; font-weight:600;">PERGUNTAS FREQUENTES</div>
                <div style="font-weight:600; font-size:30px; letter-spacing:-.025em; margin-top:8px; line-height:1.1;">
                  Dúvidas sobre
                  <span style="font-family:'Newsreader',serif; font-style:italic; font-weight:500; color:#B7873A;">PETR4.</span>
                </div>
              </div>
            </div>
            <div class="d-card" style="padding:4px 26px;">
              <div v-for="(f, i) in faqsD" :key="f.q"
                   class="d-faq-row"
                   :class="{ 'd-faq-row-last': i === faqsD.length - 1 }">
                <div class="d-faq-head" @click="openFaqD = openFaqD === i ? -1 : i">
                  <span style="font-size:15px; font-weight:600; letter-spacing:-.005em;">{{ f.q }}</span>
                  <div class="d-faq-toggle" :class="{ open: openFaqD === i }">
                    <UIcon name="i-lucide-plus" class="size-3" />
                  </div>
                </div>
                <div v-if="openFaqD === i" style="padding:0 0 18px; font-size:14px; color:rgba(15,15,14,.7); line-height:1.6; max-width:780px;">{{ f.a }}</div>
              </div>
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

const openFaqM = ref(0)
const openFaqD = ref(0)
const periods = ['1D', '1S', '1M', '3M', '1A', '5A']
const periodsD = ['1D', '1S', '1M', '3M', '1A', '5A', 'Tudo']

const heroStatsM = [
  { l: 'Min 52s', v: 'R$ 28,40' },
  { l: 'Max 52s', v: 'R$ 42,18' },
  { l: 'Mkt Cap', v: 'R$ 510B' },
]
const heroStatsD = [
  { l: 'Min 52s',       v: 'R$ 28,40' },
  { l: 'Max 52s',       v: 'R$ 42,18' },
  { l: 'Variação ano',  v: '+18,2%', c: '#0F8C4D' },
  { l: 'Beta',          v: '0,84' },
  { l: 'Market Cap',    v: 'R$ 510B' },
  { l: 'Free Float',    v: '37,5%' },
]

const fundamentaisM = [
  { l: 'P/L',         v: '3,8x' },
  { l: 'P/VP',        v: '0,9x' },
  { l: 'DY',          v: '13,4%' },
  { l: 'ROE',         v: '72,7%' },
  { l: 'ROA',         v: '46,9%' },
  { l: 'Margem',      v: '24,2%' },
  { l: 'Crescimento', v: '+18% a.a' },
  { l: 'Liquidez',    v: 'R$ 480M' },
]
const fundamentaisD = [
  { l: 'P/L',         v: '3,8x',    s: 'preço/lucro' },
  { l: 'P/VP',        v: '0,9x',    s: 'preço/valor patrim.' },
  { l: 'DY',          v: '13,4%',   s: 'dividend yield' },
  { l: 'ROE',         v: '72,7%',   s: 'retorno patrim.' },
  { l: 'ROA',         v: '46,9%',   s: 'retorno ativos' },
  { l: 'Margem líq.', v: '24,2%',   s: 'lucratividade' },
  { l: 'Crescimento', v: '+18% a.a', s: '5 anos' },
  { l: 'Liquidez',    v: 'R$ 480M', s: 'volume médio diário' },
]

const redentiaMetrics = [
  { l: 'Redentia Score', v: 8.4, c: '#0F8C4D' },
  { l: 'Qualidade',      v: 9.1, c: '#0F8C4D' },
  { l: 'Valor',          v: 7.8, c: '#0F8C4D' },
  { l: 'Dividendos',     v: 9.6, c: '#0F8C4D' },
  { l: 'Crescimento',    v: 6.2, c: '#B7873A' },
  { l: 'Risco',          v: 7.0, c: '#B7873A' },
]

const mdiMonths = [
  { m: 'JUN', v: 0.84 }, { m: 'JUL', v: 1.20 }, { m: 'AGO', v: 0.92 }, { m: 'SET', v: 1.45 },
  { m: 'OUT', v: 1.10 }, { m: 'NOV', v: 1.36 }, { m: 'DEZ', v: 1.48 },
  { m: 'JAN', v: 1.22, proj: true }, { m: 'FEV', v: 0.96, proj: true }, { m: 'MAR', v: 1.18, proj: true },
  { m: 'ABR', v: 1.40, proj: true }, { m: 'MAI', v: 1.55, proj: true },
]
const mdiStatsM = [
  { l: 'Próximo provento', v: 'R$ 1,22', s: 'JAN 2027' },
  { l: 'DY projetado',     v: '14,1%',   s: '12m', c: '#B7873A' },
  { l: 'Acumulado 12m',    v: 'R$ 5,40', s: '+18% YoY', c: '#0F8C4D' },
  { l: 'Confiança',        v: '72%',     s: '5 anos' },
]
const mdiStatsD = [
  { l: 'Próximo provento', v: 'R$ 1,22', s: 'JAN 2027 · projeção' },
  { l: 'Acumulado 12m',    v: 'R$ 5,40', s: '+18% vs ano anterior', c: '#0F8C4D' },
  { l: 'DY projetado',     v: '14,1%',   s: 'próximos 12 meses', c: '#B7873A' },
  { l: 'Confiança',        v: '72%',     s: 'baseada em 5 anos' },
]

const news = [
  { source: 'InfoMoney', time: '5h', title: 'Petrobras anuncia novo plano de dividendos para 2027', tag: 'DIVIDENDOS' },
  { source: 'Bloomberg', time: '9h', title: 'Receita de exportação cresce 18% no trimestre',         tag: 'BALANÇO' },
  { source: 'Estadão',   time: '1d', title: 'CEO sinaliza foco em redução de dívida no curto prazo', tag: 'GOVERNANÇA' },
]
const newsOthers = [
  { source: 'InfoMoney', time: '5h', title: 'Petrobras anuncia novo plano de dividendos para 2027', tags: ['DIVIDENDOS'] },
  { source: 'Bloomberg', time: '9h', title: 'Receita de exportação cresce 18% no trimestre',         tags: ['BALANÇO'] },
  { source: 'Estadão',   time: '1d', title: 'CEO sinaliza foco em redução de dívida no curto prazo', tags: ['GOVERNANÇA'] },
  { source: 'Reuters',   time: '1d', title: 'Produção em Búzios atinge novo recorde mensal',         tags: ['PRODUÇÃO'] },
]

const finCardsM = [
  {
    t: 'Fluxo de Caixa',
    items: [
      { l: 'Operacional',    v: '+R$ 194B', c: '#0F8C4D' },
      { l: 'Investimento',   v: '−R$ 82B',  c: '#C4413A' },
      { l: 'Financiamento',  v: '−R$ 72B',  c: '#5B4A7A' },
      { l: 'Livre',          v: '+R$ 112B', c: '#B7873A', b: true },
    ],
  },
  {
    t: 'Balanço Patrimonial',
    items: [
      { l: 'Ativos',         v: 'R$ 945B', c: '#0F0F0E', b: true },
      { l: 'Passivos',       v: 'R$ 450B', c: '#C4413A' },
      { l: 'Patrimônio',     v: 'R$ 495B', c: '#0F8C4D' },
      { l: 'Caixa',          v: 'R$ 82B',  c: '#B7873A' },
    ],
  },
  {
    t: 'DRE',
    items: [
      { l: 'Receita',        v: 'R$ 580B', c: '#0F0F0E', b: true },
      { l: 'EBITDA',         v: 'R$ 254B', c: '#5B4A7A' },
      { l: 'Lucro líq.',     v: 'R$ 168B', c: '#0F8C4D' },
    ],
  },
]

const finCardsD = [
  {
    title: 'Fluxo de Caixa',
    series: [
      { l: 'Operacional',    v: [145, 168, 172, 189, 194],    color: '#0F8C4D' },
      { l: 'Investimento',   v: [-78, -85, -92, -88, -82],     color: '#C4413A' },
      { l: 'Financiamento',  v: [-62, -58, -65, -70, -72],     color: '#5B4A7A' },
      { l: 'Livre',          v: [67, 83, 80, 101, 112],        color: '#B7873A', bold: true },
    ],
  },
  {
    title: 'Balanço Patrimonial',
    series: [
      { l: 'Ativos',         v: [820, 860, 890, 920, 945],     color: '#0F0F0E', bold: true },
      { l: 'Passivos',       v: [510, 520, 495, 475, 450],     color: '#C4413A' },
      { l: 'Patrimônio',     v: [310, 340, 395, 445, 495],     color: '#0F8C4D' },
      { l: 'Caixa',          v: [58, 62, 68, 74, 82],          color: '#B7873A' },
    ],
  },
  {
    title: 'DRE',
    series: [
      { l: 'Receita op.',    v: [450, 485, 520, 548, 580],     color: '#0F0F0E', bold: true },
      { l: 'EBITDA',         v: [182, 205, 222, 238, 254],     color: '#5B4A7A' },
      { l: 'Lucro líquido',  v: [105, 128, 142, 155, 168],     color: '#0F8C4D' },
    ],
  },
]

// path generator for tiny multi-line financial charts
function serieToPath(values: number[]) {
  const W = 320, H = 100, padX = 4, padY = 8
  const max = Math.max(...values.map(Math.abs))
  const pts = values.map((v, i) => {
    const x = padX + (i / (values.length - 1)) * (W - padX * 2)
    const norm = v / max
    const y = H / 2 - norm * (H / 2 - padY)
    return `${x},${y}`
  })
  return 'M' + pts.join(' L')
}

const checklistM = [
  { ok: true,  title: '+ de 5 anos de histórico',        detail: 'Dados desde 2021' },
  { ok: true,  title: 'Pagou dividendos nos últimos 5a', detail: '5/5 anos' },
  { ok: true,  title: 'Sem prejuízo recente' },
  { ok: true,  title: 'Dividend Yield > 5%',             detail: '13,4%' },
  { ok: true,  title: 'ROE > 10%',                       detail: '72,7%' },
  { ok: true,  title: 'Dívida ≤ Patrimônio',             detail: 'R$ 7,1B / R$ 10,5B' },
  { ok: false, title: 'Market Cap > R$ 1B',              detail: 'R$ 0', warn: true },
  { ok: true,  title: 'ROA > 5%',                        detail: '46,9%' },
  { ok: null,  title: 'Margem líquida positiva',         detail: 'Indisponível' },
  { ok: true,  title: 'FCF positivo',                    detail: 'R$ 10,0B' },
]
const checklistD = [
  { ok: true,  title: 'Mais de 5 anos de histórico',         detail: 'Dados desde 2021' },
  { ok: true,  title: 'Pagou dividendos nos últimos 5 anos', detail: '2022, 2023, 2024, 2025, 2026 (5/5)' },
  { ok: true,  title: 'Sem prejuízo em exercícios anuais recentes' },
  { ok: true,  title: 'Dividend Yield acima de 5%',          detail: 'Yield atual: 13,4%' },
  { ok: true,  title: 'ROE acima de 10%',                    detail: 'ROE atual: 72,7%' },
  { ok: true,  title: 'Dívida menor ou igual ao patrimônio', detail: 'Dívida: R$ 7,1B · Patrimônio: R$ 10,5B' },
  { ok: false, title: 'Market Cap maior que R$ 1B',          detail: 'Market Cap: R$ 0', warn: true },
  { ok: true,  title: 'ROA acima de 5%',                     detail: 'ROA atual: 46,9%' },
  { ok: null,  title: 'Margem líquida positiva',             detail: 'Dados indisponíveis' },
  { ok: true,  title: 'Fluxo de caixa livre positivo',       detail: 'FCF: R$ 10,0B' },
]

const proventosM = [
  { d: '15 mai 26', tipo: 'JCP',        valor: 'R$ 0,42', total: 'R$ 168' },
  { d: '14 fev 26', tipo: 'Dividendo',  valor: 'R$ 1,18', total: 'R$ 472' },
  { d: '20 nov 25', tipo: 'JCP',        valor: 'R$ 0,38', total: 'R$ 152' },
  { d: '15 ago 25', tipo: 'Dividendo',  valor: 'R$ 1,02', total: 'R$ 408' },
]
const proventosD = [
  { d: '15 mai · 2026', tipo: 'JCP',        valor: 'R$ 0,42', total: 'R$ 168,00' },
  { d: '14 fev · 2026', tipo: 'Dividendo',  valor: 'R$ 1,18', total: 'R$ 472,00' },
  { d: '20 nov · 2025', tipo: 'JCP',        valor: 'R$ 0,38', total: 'R$ 152,00' },
  { d: '15 ago · 2025', tipo: 'Dividendo',  valor: 'R$ 1,02', total: 'R$ 408,00' },
  { d: '12 mai · 2025', tipo: 'JCP',        valor: 'R$ 0,35', total: 'R$ 140,00' },
]

const chatSuggestions = [
  { q: 'É hora de comprar PETR4?' },
  { q: 'Quais os riscos de PETR4 hoje?' },
  { q: 'PETR4 vs concorrentes do setor' },
]

const faqs = [
  { q: 'Como funciona o DY de PETR4?', a: 'O Dividend Yield (DY) é o quanto a ação pagou em dividendos nos últimos 12 meses dividido pelo preço atual. PETR4 está em 13,4%.' },
  { q: 'O que é o MDI?', a: 'Mapa do Dividendo Inteligente. Combinamos histórico, sazonalidade e fundamentos pra projetar quanto cada cota deve render nos próximos meses.' },
  { q: 'Como calcular o checklist?', a: 'Critérios objetivos: histórico, dividendos, ROE, ROA, dívida, market cap, margem e FCF. Cada item é binário (passa ou não).' },
  { q: 'A projeção do MDI é garantida?', a: 'Não. É uma projeção estatística. Eventos extraordinários podem alterar valores.' },
]
const faqsD = [
  { q: 'Como funciona o Dividend Yield de PETR4?', a: 'O Dividend Yield (DY) é o quanto a ação pagou em dividendos nos últimos 12 meses dividido pelo preço atual. Para PETR4, o yield está em 13,4%, alto pra média do mercado.' },
  { q: 'O que é o MDI?', a: 'Mapa do Dividendo Inteligente. Combinamos histórico, sazonalidade e fundamentos da empresa pra projetar quanto cada cota deve render nos próximos meses, com nível de confiança baseado em 5 anos de dados.' },
  { q: 'Como a Redentia calcula os 10/10 do checklist?', a: 'Critérios objetivos: histórico, dividendos, ROE, ROA, dívida, market cap, margem, e fluxo de caixa. Cada item é binário (passa ou não). O score 0-10 reflete quantos critérios são atendidos com peso ponderado.' },
  { q: 'A projeção do MDI é garantida?', a: 'Não. É uma projeção estatística baseada em comportamento histórico. Eventos extraordinários podem alterar significativamente os valores.' },
  { q: 'Posso receber alertas sobre este ativo?', a: 'Sim. Crie um alerta com o botão "Criar alerta" no topo. Você pode ser avisado por queda %, novo provento, score Redentia, ou notícias relevantes.' },
]

const navMain = [
  { label: 'Início',     icon: 'i-lucide-house',    to: '/dev/mobile-layouts/v4/home' },
  { label: 'Carteira',   icon: 'i-lucide-wallet',   to: '#' },
  { label: 'Raio-X',     icon: 'i-lucide-radar',    to: '#', badge: 'novo' },
  { label: 'Calendário', icon: 'i-lucide-calendar', to: '#' },
  { label: 'Carta',      icon: 'i-lucide-mail',     to: '#' },
]
const navTools = [
  { label: 'Chat IA',       icon: 'i-lucide-sparkles',   to: '#', badge: '2' },
  { label: 'Calculadoras',  icon: 'i-lucide-calculator', to: '/dev/mobile-layouts/v4/calc' },
  { label: 'Rankings',      icon: 'i-lucide-trophy',     to: '/dev/mobile-layouts/v4/rankings' },
  { label: 'Setores',       icon: 'i-lucide-grid-2x2',   to: '#' },
  { label: 'Guias',         icon: 'i-lucide-book',       to: '#' },
]
const mobileTabs = [
  { label: 'Início',   icon: 'i-lucide-house',  to: '/dev/mobile-layouts/v4/home' },
  { label: 'Carteira', icon: 'i-lucide-wallet', to: '#' },
  { label: 'Raio-X',   icon: 'i-lucide-radar',  to: '#' },
  { label: 'Mercado',  icon: 'i-lucide-globe',  to: '/dev/mobile-layouts/v4/mercado' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:ital,wght@1,400;1,500&display=swap');

.v4 { min-height: 100vh; background: #F8F6F1; }

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
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
}
.phone.mercury .m-back-btn {
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.7);
  display: grid; place-items: center; cursor: pointer;
  border: 0; padding: 0;
}
.phone.mercury .m-asset-logo {
  width: 32px; height: 32px; border-radius: 8px;
  background: linear-gradient(135deg, #1A8E5E, #0E5D3D);
  color: #fff; display: grid; place-items: center;
  font-size: 9px; font-weight: 700; letter-spacing: .04em;
}
.phone.mercury .m-scroll { padding: 4px 0 120px; }
.phone.mercury .m-scroll::-webkit-scrollbar { display: none; }
.phone.mercury .m-label { font-size: 11px; font-weight: 500; color: rgba(15,15,14,.5); letter-spacing: .01em; }

.phone.mercury .m-card {
  margin: 0 16px; padding: 22px 20px;
  background: #FFFFFF; border-radius: 20px;
  box-shadow: 0 1px 0 rgba(15,15,14,.04), 0 8px 24px -12px rgba(15,15,14,.08);
}
.phone.mercury .m-card-lg { padding: 24px 22px; }
.phone.mercury .m-card + .m-card { margin-top: 10px; }

.phone.mercury .m-section {
  padding: 24px 22px 12px;
  display: flex; justify-content: space-between; align-items: baseline;
}
.phone.mercury .m-section .title { font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
.phone.mercury .m-section .link { font-size: 13px; color: #0F0F0E; font-weight: 500; cursor: pointer; }

.phone.mercury .m-pos-pill {
  padding: 3px 9px; border-radius: 6px;
  background: rgba(15,140,77,.10); color: #0F8C4D;
  font-size: 12px; font-weight: 600;
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

.phone.mercury .m-hero-stats {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;
  margin-top: 14px; padding-top: 14px;
  border-top: 1px solid rgba(15,15,14,.06);
}

.phone.mercury .m-cta-primary {
  flex: 1; padding: 12px; border-radius: 10px;
  background: #0F0F0E; color: #FFFFFF;
  font-size: 13px; font-weight: 600; text-align: center; cursor: pointer;
}
.phone.mercury .m-cta-ghost {
  padding: 12px 14px; border-radius: 10px;
  background: rgba(15,15,14,.04); color: #0F0F0E;
  font-size: 13px; font-weight: 500; cursor: pointer;
}

.phone.mercury .m-fund-row {
  display: flex; justify-content: space-between;
  padding: 11px 22px;
  border-bottom: 1px solid rgba(15,15,14,.04);
}
.phone.mercury .m-fund-row-last { border-bottom: 0; }

.phone.mercury .m-redentia-card {
  background: linear-gradient(135deg, rgba(255,237,209,.45), rgba(248,232,209,.20));
  border: 1px solid rgba(183,135,58,.20);
}
.phone.mercury .m-rmet-row {
  padding: 10px 0;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.phone.mercury .m-rmet-row-last { border-bottom: 0; }
.phone.mercury .m-rmet-bar {
  height: 3px; background: rgba(15,15,14,.06);
  border-radius: 2px; overflow: hidden;
}
.phone.mercury .m-rmet-fill {
  height: 100%; border-radius: 2px;
}

.phone.mercury .m-mdi-stats {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  margin-top: 14px; padding-top: 14px;
  border-top: 1px solid rgba(15,15,14,.06);
}

.phone.mercury .m-news-feat {
  padding: 14px 16px; background: #FFFFFF;
  border: 1px solid rgba(15,15,14,.06);
  border-radius: 14px;
}
.phone.mercury .m-news-hero {
  height: 90px; border-radius: 9px;
  background: linear-gradient(135deg, #1A8E5E, #0E5D3D);
  margin-bottom: 12px; position: relative; overflow: hidden;
}
.phone.mercury .m-news-hero-bg {
  position: absolute; left: 12px; bottom: 8px;
  color: #FFFFFF; font-family: 'Newsreader', serif;
  font-style: italic; font-size: 36px; font-weight: 500;
  line-height: 1; opacity: .6;
}
.phone.mercury .m-news-tag {
  padding: 2px 6px; border-radius: 4px;
  background: rgba(15,15,14,.05);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; font-weight: 600;
  color: rgba(15,15,14,.65);
}
.phone.mercury .m-news-tag-amber {
  padding: 1px 6px; border-radius: 4px;
  background: rgba(183,135,58,.10); color: #B7873A;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 8px; font-weight: 700; letter-spacing: .05em;
}
.phone.mercury .m-news-row {
  padding: 13px 22px;
  border-bottom: 1px solid rgba(15,15,14,.05);
  cursor: pointer;
}
.phone.mercury .m-news-row-last { border-bottom: 0; }

.phone.mercury .m-fin-row {
  display: flex; gap: 10px; padding: 0 16px;
  overflow-x: auto; scrollbar-width: none;
}
.phone.mercury .m-fin-row::-webkit-scrollbar { display: none; }
.phone.mercury .m-fin-card {
  flex-shrink: 0; min-width: 240px;
  padding: 16px 18px;
  background: #FFFFFF; border: 1px solid rgba(15,15,14,.05);
  border-radius: 14px;
}
.phone.mercury .m-fin-item {
  display: flex; justify-content: space-between;
  padding: 7px 0;
  border-bottom: 1px solid rgba(15,15,14,.04);
}
.phone.mercury .m-fin-item-last { border-bottom: 0; }
.phone.mercury .m-fin-foot {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; letter-spacing: .1em;
  color: rgba(15,15,14,.4); font-weight: 600;
  margin-top: 10px; padding-top: 10px;
  border-top: 1px solid rgba(15,15,14,.05);
}

.phone.mercury .m-score-tag {
  padding: 4px 9px; border-radius: 5px;
  background: rgba(15,140,77,.10); color: #0F8C4D;
  font-size: 11px; font-weight: 700;
}
.phone.mercury .m-check-row {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 11px 22px;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.phone.mercury .m-check-row-last { border-bottom: 0; }
.phone.mercury .m-check-ic {
  width: 20px; height: 20px; border-radius: 50%;
  display: grid; place-items: center;
  flex-shrink: 0; margin-top: 1px;
}
.phone.mercury .m-check-ic-ok { background: rgba(15,140,77,.10); color: #0F8C4D; }
.phone.mercury .m-check-ic-fail { background: rgba(196,65,58,.10); color: #C4413A; }
.phone.mercury .m-check-ic-na { background: rgba(15,15,14,.04); color: rgba(15,15,14,.5); }

.phone.mercury .m-prov-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 22px;
  border-bottom: 1px solid rgba(15,15,14,.04);
}
.phone.mercury .m-prov-row-last { border-bottom: 0; }

.phone.mercury .m-chat-cta {
  padding: 22px 20px;
  background: linear-gradient(135deg, rgba(255,237,209,.45), rgba(244,237,217,.30));
  border: 1px solid rgba(183,135,58,.20);
  border-radius: 16px; text-align: center;
}
.phone.mercury .m-chat-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 999px;
  background: rgba(183,135,58,.12); color: #B7873A;
  font-size: 10px; font-weight: 600; letter-spacing: .05em;
}
.phone.mercury .m-chat-btn {
  margin-top: 16px; padding: 12px 16px; border-radius: 10px;
  background: linear-gradient(135deg, #D1A75A, #B7873A);
  color: #FFFFFF; font-size: 13px; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  cursor: pointer;
}

.phone.mercury .m-faq-row {
  border-bottom: 1px solid rgba(15,15,14,.06);
}
.phone.mercury .m-faq-row-last { border-bottom: 0; }
.phone.mercury .m-faq-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 0; cursor: pointer;
}
.phone.mercury .m-faq-toggle {
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.6);
  display: grid; place-items: center; flex-shrink: 0;
  transition: all .2s;
}
.phone.mercury .m-faq-toggle.open {
  background: #0F0F0E; color: #FFFFFF;
  transform: rotate(45deg);
}

/* Tabbar */
.phone.mercury .m-tabbar {
  position: fixed; left: 0; right: 0; bottom: 0;
  max-width: 480px; margin: 0 auto;
  height: 78px;
  background: rgba(248,246,241,.94); backdrop-filter: blur(20px);
  border-top: 1px solid rgba(15,15,14,.06);
  display: flex; justify-content: space-around; align-items: flex-start;
  padding: 12px 24px 24px; z-index: 20;
}
.phone.mercury .m-tab {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  background: transparent; border: 0;
  color: rgba(15,15,14,.35); cursor: pointer;
  padding: 4px 8px; font-family: inherit;
  text-decoration: none;
}
.phone.mercury .m-tab svg { width: 22px; height: 22px; }
.phone.mercury .m-tab .lbl { font-size: 10px; font-weight: 500; }

/* ============ DESKTOP ============ */
.dt.mercury-dt {
  background: #F8F6F1; color: #0F0F0E;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  min-height: 100vh; position: relative;
}
.dt .d-mut { color: rgba(15,15,14,.55); }
.dt .d-dim { color: rgba(15,15,14,.35); }

.dt .d-side {
  width: 240px; flex-shrink: 0;
  padding: 24px 20px;
  display: flex; flex-direction: column; gap: 24px;
  border-right: 1px solid rgba(15,15,14,.06);
  position: sticky; top: 0; height: 100vh;
}
.dt .d-side .d-brand { display: flex; align-items: center; gap: 10px; padding: 0 4px; }
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
  color: rgba(15,15,14,.4); padding: 14px 8px 6px;
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
.dt .d-side-footer {
  margin-top: auto; padding: 14px 10px;
  border-top: 1px solid rgba(15,15,14,.06);
  display: flex; align-items: center; gap: 10px; font-size: 13px;
}
.dt .d-side-footer .av {
  width: 32px; height: 32px; border-radius: 50%;
  background: #0F0F0E; color: #fff;
  display: grid; place-items: center;
  font-weight: 600; font-size: 13px; flex-shrink: 0;
}

.dt .d-main { flex: 1; min-width: 0; overflow-y: auto; overflow-x: hidden; }
.dt .d-main::-webkit-scrollbar { width: 0; }
.dt .d-topbar {
  padding: 20px 32px; display: flex; align-items: center; gap: 16px;
  border-bottom: 1px solid rgba(15,15,14,.06);
}
.dt .d-search {
  flex: 1; display: flex; align-items: center; gap: 10px;
  padding: 9px 14px; border-radius: 10px;
  background: rgba(15,15,14,.03);
  font-size: 13px; color: rgba(15,15,14,.45); max-width: 480px;
}
.dt .d-search .kbd {
  margin-left: auto; padding: 2px 6px; border-radius: 5px;
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

.dt .d-content {
  padding: 24px 32px 60px;
  display: flex; flex-direction: column; gap: 14px;
}
.dt .d-greet {
  display: flex; justify-content: space-between; align-items: flex-end;
  padding-bottom: 4px;
}
.dt .d-greet .h { margin-top: 4px; font-size: 26px; font-weight: 600; letter-spacing: -.022em; }
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
  border-radius: 18px; padding: 22px;
  box-shadow: 0 1px 0 rgba(15,15,14,.02), 0 8px 24px -16px rgba(15,15,14,.08);
}
.dt .d-section-h {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 12px;
}
.dt .d-section-h .title { font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
.dt .d-section-h .link { font-size: 13px; color: #0F0F0E; font-weight: 500; cursor: pointer; }
.dt .d-label { font-size: 11px; font-weight: 500; color: rgba(15,15,14,.5); }

.dt .d-asset-logo {
  width: 48px; height: 48px; border-radius: 12px;
  background: linear-gradient(135deg, #1A8E5E, #0E5D3D);
  color: #fff; display: grid; place-items: center;
  font-size: 12px; font-weight: 700; letter-spacing: .05em;
}

.dt .d-pos-pill {
  padding: 4px 10px; border-radius: 6px;
  background: rgba(15,140,77,.10); color: #0F8C4D;
  font-size: 13px; font-weight: 600;
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

.dt .d-hero-stats {
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;
  margin-top: 18px; padding-top: 18px;
  border-top: 1px solid rgba(15,15,14,.06);
}

/* Fundamentalistas + Redentia row */
.dt .d-fund-row {
  display: grid; grid-template-columns: 1.2fr 1fr; gap: 14px;
}
.dt .d-fund-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  margin-top: 6px;
}
.dt .d-fund-cell {
  padding: 14px 16px; background: rgba(15,15,14,.025);
  border-radius: 10px;
}
.dt .d-redentia-card {
  background: linear-gradient(135deg, rgba(255,237,209,.45), rgba(248,232,209,.20));
  border: 1px solid rgba(183,135,58,.20);
}
.dt .d-rmet-row {
  padding: 10px 0;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.dt .d-rmet-row-last { border-bottom: 0; }
.dt .d-rmet-bar {
  height: 3px; background: rgba(15,15,14,.06);
  border-radius: 2px; overflow: hidden;
}
.dt .d-rmet-fill { height: 100%; border-radius: 2px; }

.dt .d-mdi-stats {
  display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 14px;
  margin-top: 14px; padding-top: 14px;
  border-top: 1px solid rgba(15,15,14,.06);
}

/* News */
.dt .d-news-grid {
  display: grid; grid-template-columns: 1.4fr 1fr; gap: 0;
}
.dt .d-news-feat-col {
  padding: 24px 28px;
  border-right: 1px solid rgba(15,15,14,.06);
  display: flex; flex-direction: column;
}
.dt .d-news-side-col {
  padding: 24px 26px;
  display: flex; flex-direction: column;
}
.dt .d-news-hero {
  height: 160px; border-radius: 12px;
  background: linear-gradient(135deg, #1A8E5E 0%, #0E5D3D 100%);
  position: relative; overflow: hidden; margin-bottom: 18px;
}
.dt .d-news-glow {
  position: absolute; right: -40px; top: -40px;
  width: 160px; height: 160px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,.15), transparent 60%);
}
.dt .d-news-hero-bg {
  position: absolute; left: 20px; bottom: 20px;
  color: #FFFFFF; font-family: 'Newsreader', serif;
  font-style: italic; font-size: 60px; font-weight: 500;
  line-height: 1; opacity: .6;
}
.dt .d-news-tag {
  padding: 3px 8px; border-radius: 5px;
  background: rgba(15,15,14,.05); color: rgba(15,15,14,.7);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; font-weight: 600; letter-spacing: .02em;
}
.dt .d-news-tag-amber {
  padding: 1px 6px; border-radius: 4px;
  background: rgba(183,135,58,.10); color: #B7873A;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 8px; font-weight: 700; letter-spacing: .05em;
}
.dt .d-news-row {
  padding: 14px 0;
  border-bottom: 1px solid rgba(15,15,14,.05);
  cursor: pointer;
  flex: 1;
  display: flex; flex-direction: column; justify-content: center;
}
.dt .d-news-row-last { border-bottom: 0; }

/* Fin */
.dt .d-fin-row {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;
}
.dt .d-fin-leg {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 0;
  border-bottom: 1px solid rgba(15,15,14,.04);
}
.dt .d-fin-leg-last { border-bottom: 0; }

/* Checklist */
.dt .d-check-row {
  display: grid; grid-template-columns: 1.2fr 1fr; gap: 14px;
}
.dt .d-check-row-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.dt .d-check-row-item-last { border-bottom: 0; }
.dt .d-check-ic {
  width: 24px; height: 24px; border-radius: 50%;
  display: grid; place-items: center;
  flex-shrink: 0; margin-top: 1px;
}
.dt .d-check-ic-ok { background: rgba(15,140,77,.10); color: #0F8C4D; }
.dt .d-check-ic-fail { background: rgba(196,65,58,.10); color: #C4413A; }
.dt .d-check-ic-na { background: rgba(15,15,14,.04); color: rgba(15,15,14,.5); }
.dt .d-warn-tag {
  padding: 2px 7px; border-radius: 5px;
  background: rgba(196,65,58,.10); color: #C4413A;
  font-size: 10px; font-weight: 700; letter-spacing: .05em;
}

.dt .d-score-tag {
  padding: 5px 11px; border-radius: 6px;
  background: rgba(15,140,77,.10); color: #0F8C4D;
  font-size: 12px; font-weight: 600;
}

.dt .d-prov-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(15,15,14,.04);
}
.dt .d-prov-row-last { border-bottom: 0; }

/* Chat CTA */
.dt .d-chat-cta {
  padding: 30px 36px;
  background: linear-gradient(135deg, rgba(255,237,209,.40) 0%, rgba(244,237,217,.30) 100%);
  border: 1px solid rgba(183,135,58,.20);
}
.dt .d-chat-pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 5px 12px; border-radius: 999px;
  background: rgba(183,135,58,.12); color: #B7873A;
  font-size: 11px; font-weight: 600; letter-spacing: .05em;
}
.dt .d-chat-suggest-row {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
  margin-top: 24px;
}
.dt .d-chat-suggest-card {
  padding: 16px 18px; background: #FFFFFF;
  border: 1px solid rgba(15,15,14,.06);
  border-radius: 12px; cursor: pointer;
}
.dt .d-chat-cta-btn {
  padding: 13px 26px; border-radius: 12px;
  background: linear-gradient(135deg, #D1A75A, #B7873A);
  color: #FFFFFF; font-size: 14px; font-weight: 600;
  display: inline-flex; align-items: center; gap: 8px;
  cursor: pointer;
  box-shadow: 0 8px 20px -8px rgba(183,135,58,.5);
}

/* FAQ */
.dt .d-faq-row {
  border-bottom: 1px solid rgba(15,15,14,.06);
}
.dt .d-faq-row-last { border-bottom: 0; }
.dt .d-faq-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 0; cursor: pointer;
}
.dt .d-faq-toggle {
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.6);
  display: grid; place-items: center;
  transition: all .2s;
}
.dt .d-faq-toggle.open {
  background: #0F0F0E; color: #FFFFFF;
  transform: rotate(45deg);
}
</style>

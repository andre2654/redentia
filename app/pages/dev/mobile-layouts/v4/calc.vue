<!--
  V4 — Calculadoras (Mercury Bank style).
  Toggle interno: 'list' (listagem) <-> 'juros' (calculadora de Juros Compostos).
-->
<template>
  <div class="v4">

    <!-- ============ MOBILE SHELL (.phone.mercury) ============ -->
    <div class="phone mercury">

      <!-- ---------- LIST VIEW ---------- -->
      <template v-if="view === 'list'">
        <div class="m-appbar" style="padding-bottom:18px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <NuxtLink to="/dev/mobile-layouts/v4/home" class="m-back-btn">
              <UIcon name="i-lucide-chevron-left" class="size-4" />
            </NuxtLink>
            <div>
              <div class="m-label" style="font-size:10px;">10 calculadoras · ferramentas</div>
              <div style="font-size:18px; font-weight:600; letter-spacing:-.015em; margin-top:2px;">Calculadoras</div>
            </div>
          </div>
        </div>

        <div class="m-scroll">
          <!-- Search -->
          <div style="padding:4px 16px 14px;">
            <div class="m-search">
              <UIcon name="i-lucide-search" class="size-4" style="color:rgba(15,15,14,.5)" />
              <span>Buscar uma calculadora…</span>
            </div>
          </div>

          <!-- Featured · 3 popular -->
          <div class="m-section"><span class="title">Mais usadas</span></div>
          <div class="m-feat-row">
            <button v-for="c in CALCS.filter(c => c.popular)" :key="c.id"
                    class="m-feat-card"
                    @click="view = c.id === 'juros' ? 'juros' : 'list'">
              <span class="m-calc-ic m-calc-ic-large">
                <UIcon :name="iconMap[c.icon]" class="size-5" />
              </span>
              <div>
                <div style="font-size:14px; font-weight:600; letter-spacing:-.005em;">{{ c.name }}</div>
                <div style="font-size:11px; color:rgba(15,15,14,.55); margin-top:3px; line-height:1.3;">{{ c.sub }}</div>
              </div>
            </button>
          </div>

          <!-- All calculators -->
          <div class="m-section">
            <span class="title">Todas as calculadoras</span>
            <span class="link">Filtrar →</span>
          </div>
          <div class="m-card" style="padding:4px 0;">
            <button v-for="(c, i) in CALCS" :key="c.id"
                    class="m-calc-row"
                    :class="{ 'm-calc-row-last': i === CALCS.length - 1 }"
                    @click="view = c.id === 'juros' ? 'juros' : 'list'">
              <span class="m-calc-ic">
                <UIcon :name="iconMap[c.icon]" class="size-4" />
              </span>
              <div style="flex:1; min-width:0;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:14px; font-weight:500; letter-spacing:-.005em;">{{ c.name }}</span>
                  <span v-if="c.popular" class="m-pop-tag">Popular</span>
                </div>
                <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:2px;">{{ c.sub }}</div>
              </div>
              <UIcon name="i-lucide-chevron-right" class="size-3" style="color:rgba(15,15,14,.35)" />
            </button>
          </div>

          <div class="m-cta" style="margin-top:24px; margin-bottom:24px;">
            <div>
              <div class="t">Simulações salvas</div>
              <div class="s">7 cenários · acesse rapidamente</div>
            </div>
            <UIcon name="i-lucide-arrow-right" class="size-4" style="color:white;" />
          </div>
        </div>
      </template>

      <!-- ---------- JUROS VIEW ---------- -->
      <template v-else>
        <div class="m-appbar" style="padding-bottom:18px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <button class="m-back-btn" @click="view = 'list'">
              <UIcon name="i-lucide-chevron-left" class="size-4" />
            </button>
            <div>
              <div class="m-label" style="font-size:10px;">Calculadora</div>
              <div style="font-size:18px; font-weight:600; letter-spacing:-.015em; margin-top:2px;">Juros compostos</div>
            </div>
          </div>
          <button class="m-back-btn">
            <UIcon name="i-lucide-upload" class="size-4" />
          </button>
        </div>

        <div class="m-scroll">
          <!-- Hero result -->
          <div class="m-card m-card-lg" style="background:#0F0F0E; color:#FAF6EA; position:relative; overflow:hidden;">
            <span class="m-glow-amber"></span>
            <div style="position:relative;">
              <div class="m-mono-tag">VALOR FINAL · 10 ANOS</div>
              <div class="m-hero-num">
                R$ 248.402<span style="color:rgba(255,255,255,.45);">,17</span>
              </div>
              <div class="m-hero-split">
                <div>
                  <div class="m-mono-sub">VOCÊ APORTOU</div>
                  <div class="m-hero-stat">R$ 130.000</div>
                </div>
                <div style="flex:1;">
                  <div class="m-mono-sub">JUROS</div>
                  <div class="m-hero-stat" style="color:#5EFFA5;">+R$ 118.402</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chart -->
          <div class="m-card">
            <div class="d-section-h">
              <span class="title" style="font-size:13px; font-weight:600;">Evolução do patrimônio</span>
              <span style="font-size:11px; color:rgba(15,15,14,.55); font-weight:500;">10 anos · mensal</span>
            </div>
            <div style="margin-top:14px; margin-left:-6px; margin-right:-6px;">
              <svg viewBox="0 0 350 160" preserveAspectRatio="none" style="width:100%; height:160px; display:block;">
                <defs>
                  <linearGradient id="jrtM" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#0F8C4D" stop-opacity=".25" />
                    <stop offset="100%" stop-color="#0F8C4D" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <line v-for="f in [0.25, 0.5, 0.75]" :key="f"
                      x1="6" :x2="344" :y1="8 + 144*f" :y2="8 + 144*f"
                      stroke="rgba(15,15,14,.06)" stroke-dasharray="2 4" />
                <path d="M6,140 L40,138 L70,134 L100,128 L130,118 L160,104 L190,88 L220,68 L250,52 L280,36 L310,22 L344,10 L344,152 L6,152 Z"
                      fill="url(#jrtM)" />
                <path d="M6,148 L40,146 L70,142 L100,138 L130,134 L160,128 L190,122 L220,114 L250,106 L280,98 L310,90 L344,82 L344,152 L6,152 Z"
                      fill="rgba(15,15,14,.08)" />
                <path d="M6,148 L40,146 L70,142 L100,138 L130,134 L160,128 L190,122 L220,114 L250,106 L280,98 L310,90 L344,82"
                      fill="none" stroke="rgba(15,15,14,.5)" stroke-width="1.5"
                      stroke-linecap="round" stroke-dasharray="3 3" />
                <path d="M6,140 L40,138 L70,134 L100,128 L130,118 L160,104 L190,88 L220,68 L250,52 L280,36 L310,22 L344,10"
                      fill="none" stroke="#0F8C4D" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="344" cy="10" r="3.5" fill="#0F8C4D" stroke="#FFFFFF" stroke-width="1.5" />
              </svg>
            </div>
            <div style="display:flex; gap:14px; margin-top:10px; font-size:11px; color:rgba(15,15,14,.55);">
              <div style="display:flex; align-items:center; gap:5px;">
                <span style="width:9px; height:9px; border-radius:2px; background:rgba(15,15,14,.4);"></span>
                <span>Aportes</span>
              </div>
              <div style="display:flex; align-items:center; gap:5px;">
                <span style="width:9px; height:9px; border-radius:2px; background:#0F8C4D;"></span>
                <span>Juros</span>
              </div>
              <div style="margin-left:auto; font-size:11px; font-weight:600; color:#0F8C4D;">+91% sobre o aportado</div>
            </div>
          </div>

          <!-- Inputs -->
          <div class="m-section">
            <span class="title">Parâmetros</span>
            <span class="link">Resetar</span>
          </div>
          <div class="m-card" style="padding:4px 0;">
            <div v-for="(inp, i) in inputs" :key="inp.label"
                 class="m-input-row"
                 :class="{ 'm-input-row-last': i === inputs.length - 1 }">
              <div style="flex:1; min-width:0;">
                <div style="font-size:11px; color:rgba(15,15,14,.5); font-weight:500;">{{ inp.label }}</div>
                <div style="font-size:17px; font-weight:600; letter-spacing:-.015em; margin-top:3px; font-variant-numeric:tabular-nums;">{{ inp.value }}</div>
                <div v-if="inp.sub" style="font-size:10px; color:rgba(15,15,14,.45); margin-top:2px;">{{ inp.sub }}</div>
              </div>
              <span class="m-edit-btn">
                <UIcon name="i-lucide-pencil" class="size-3" />
              </span>
            </div>
          </div>

          <!-- Slider quick adjust -->
          <div class="m-card" style="margin-top:10px;">
            <div class="m-label">Ajuste rápido · Período</div>
            <div style="display:flex; align-items:baseline; justify-content:space-between; margin-top:8px;">
              <div style="font-size:24px; font-weight:600; letter-spacing:-.022em; font-variant-numeric:tabular-nums;">
                10 <span style="font-size:14px; color:rgba(15,15,14,.5); font-weight:500;">anos</span>
              </div>
              <div style="font-size:11px; color:rgba(15,15,14,.5); font-weight:500;">
                Total final: <b style="color:#0F0F0E;">R$ 248.402</b>
              </div>
            </div>
            <div class="m-slider-track">
              <div class="m-slider-fill"></div>
              <div class="m-slider-thumb"></div>
            </div>
            <div class="m-slider-labels">
              <span>1A</span><span>5A</span><span>10A</span><span>20A</span><span>30A</span>
            </div>
          </div>

          <!-- Yearly breakdown -->
          <div class="m-section">
            <span class="title">Tabela anual</span>
            <span class="link">Exportar →</span>
          </div>
          <div class="m-card" style="padding:0 22px 8px;">
            <div class="m-table-head">
              <div>ANO</div>
              <div>APORTE ACUM.</div>
              <div>JUROS</div>
              <div style="text-align:right;">SALDO</div>
            </div>
            <div v-for="(row, i) in tableRows" :key="row.y"
                 class="m-table-row"
                 :class="{ 'm-table-row-last': i === tableRows.length - 1, 'm-table-row-hl': row.highlight }">
              <div :class="row.highlight ? 'm-table-y-hl' : 'm-table-y'">{{ row.y }}</div>
              <div style="font-size:13px; color:rgba(15,15,14,.65); font-variant-numeric:tabular-nums;">R$ {{ row.ap }}</div>
              <div :style="{ color:'#0F8C4D', fontWeight: row.highlight ? 600 : 500 }" style="font-size:13px; font-variant-numeric:tabular-nums;">+{{ row.jr }}</div>
              <div style="font-size:13px; font-weight:600; text-align:right; font-variant-numeric:tabular-nums;">R$ {{ row.saldo }}</div>
            </div>
          </div>

          <!-- Save / Share CTAs -->
          <div style="padding:18px 16px 30px; display:flex; gap:8px;">
            <div class="m-save-btn">
              Salvar simulação
              <UIcon name="i-lucide-save" class="size-3" />
            </div>
            <div class="m-share-btn">
              <UIcon name="i-lucide-upload" class="size-4" />
            </div>
          </div>
        </div>
      </template>

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
          <NuxtLink v-for="t in navTools" :key="t.label" :to="t.to || '#'"
                    class="item" :class="{ active: t.label === 'Calculadoras' }">
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
            <span>Buscar uma calculadora…</span>
            <span class="kbd">⌘ K</span>
          </div>
          <div class="right">
            <div class="d-iconbtn"><UIcon name="i-lucide-bell" class="size-4" /></div>
            <div class="d-iconbtn"><UIcon name="i-lucide-settings" class="size-4" /></div>
          </div>
        </div>

        <!-- ---------- DESKTOP: LIST VIEW ---------- -->
        <div v-if="view === 'list'" class="d-content">
          <div class="d-greet">
            <div>
              <div class="d-mut" style="font-size:12px; font-weight:500; margin-bottom:6px;">10 ferramentas · 7 simulações salvas</div>
              <div class="h">Calculadoras</div>
            </div>
            <div class="actions">
              <div class="d-btn d-btn-ghost">Minhas simulações</div>
              <div class="d-btn">
                <UIcon name="i-lucide-plus" class="size-3" />
                Nova calculadora
              </div>
            </div>
          </div>

          <!-- Featured row -->
          <div class="d-feat-row">
            <div v-for="c in CALCS.filter(c => c.popular)" :key="c.id"
                 class="d-card d-feat-card"
                 @click="view = c.id === 'juros' ? 'juros' : 'list'">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <div class="d-feat-ic">
                  <UIcon :name="iconMap[c.icon]" class="size-5" />
                </div>
                <span class="d-pop-tag">Popular</span>
              </div>
              <div>
                <div style="font-size:17px; font-weight:600; letter-spacing:-.015em;">{{ c.name }}</div>
                <div style="font-size:13px; color:rgba(15,15,14,.55); margin-top:4px; line-height:1.4;">{{ c.sub }}</div>
              </div>
              <div style="display:inline-flex; align-items:center; gap:5px; margin-top:auto; font-size:13px; font-weight:500; color:#0F0F0E;">
                Abrir
                <UIcon name="i-lucide-arrow-right" class="size-3" />
              </div>
            </div>
          </div>

          <!-- All calculators -->
          <div class="d-card">
            <div class="d-section-h">
              <span class="title">Todas as calculadoras</span>
              <span class="link">Filtrar →</span>
            </div>
            <div class="d-calc-grid">
              <div v-for="c in CALCS" :key="c.id"
                   class="d-calc-card"
                   @click="view = c.id === 'juros' ? 'juros' : 'list'">
                <div class="d-calc-card-ic">
                  <UIcon :name="iconMap[c.icon]" class="size-4" />
                </div>
                <div>
                  <div style="font-size:13px; font-weight:600; letter-spacing:-.005em; display:flex; align-items:center; gap:6px;">
                    {{ c.name }}
                    <span v-if="c.popular" style="width:5px; height:5px; border-radius:50%; background:#B7873A;"></span>
                  </div>
                  <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:3px; line-height:1.3;">{{ c.sub }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Saved scenarios + suggestion -->
          <div class="d-saved-row">
            <div class="d-card">
              <div class="d-section-h">
                <span class="title">Simulações salvas</span>
                <span class="link">Tudo →</span>
              </div>
              <div class="d-label" style="font-size:11px; margin-top:4px;">Suas projeções recentes</div>
              <div style="margin-top:14px;">
                <div v-for="(s, i) in saved" :key="s.name"
                     class="d-saved-item"
                     :class="{ 'd-saved-item-last': i === saved.length - 1 }">
                  <div style="flex:1; min-width:0;">
                    <div style="font-size:14px; font-weight:600; letter-spacing:-.005em;">{{ s.name }}</div>
                    <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:2px;">{{ s.calc }} · {{ s.when }}</div>
                  </div>
                  <div style="font-size:14px; font-weight:600; color:#0F0F0E; font-variant-numeric:tabular-nums;">{{ s.value }}</div>
                  <UIcon name="i-lucide-chevron-right" class="size-3" style="color:rgba(15,15,14,.35)" />
                </div>
              </div>
            </div>

            <div class="d-ai-card">
              <span class="d-glow-amber"></span>
              <div style="position:relative;">
                <div class="d-mono-tag">SUGESTÃO DA IA</div>
                <div style="font-size:22px; font-weight:600; margin-top:10px; letter-spacing:-.015em; line-height:1.25;">
                  Quanto preciso aportar pra me aposentar aos
                  <span class="d-amber-serif">55?</span>
                </div>
                <div style="font-size:13px; color:rgba(255,255,255,.65); margin-top:8px; line-height:1.4;">
                  Pré-preenche com seu perfil e patrimônio atual.
                </div>
              </div>
              <div style="position:relative; margin-top:18px;">
                <div class="d-ai-cta">Calcular →</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ---------- DESKTOP: JUROS VIEW ---------- -->
        <div v-else class="d-content">
          <div class="d-greet">
            <div>
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                <span class="d-mut" style="font-size:12px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" @click="view = 'list'">
                  <UIcon name="i-lucide-chevron-left" class="size-3" />
                  Calculadoras
                </span>
                <span class="d-dim" style="font-size:12px;">·</span>
                <span class="d-mut" style="font-size:12px; font-weight:500;">Renda fixa</span>
              </div>
              <div class="h">Juros compostos</div>
            </div>
            <div class="actions">
              <div class="d-btn d-btn-ghost">
                <UIcon name="i-lucide-upload" class="size-3" />
                Exportar
              </div>
              <div class="d-btn">
                <UIcon name="i-lucide-save" class="size-3" />
                Salvar simulação
              </div>
            </div>
          </div>

          <!-- Params + result -->
          <div class="d-juros-row">
            <!-- Parameters -->
            <div class="d-card">
              <div class="d-section-h">
                <span class="title">Parâmetros</span>
                <span class="link">Resetar</span>
              </div>
              <div style="margin-top:6px;">
                <div v-for="(inp, i) in inputs" :key="inp.label"
                     class="d-input-row"
                     :class="{ 'd-input-row-last': i === inputs.length - 1 }">
                  <div style="flex:1; min-width:0;">
                    <div style="font-size:11px; color:rgba(15,15,14,.5); font-weight:500;">{{ inp.label }}</div>
                    <div style="font-size:18px; font-weight:600; letter-spacing:-.015em; margin-top:3px; font-variant-numeric:tabular-nums;">{{ inp.value }}</div>
                    <div v-if="inp.sub" style="font-size:10px; color:rgba(15,15,14,.45); margin-top:2px;">{{ inp.sub }}</div>
                  </div>
                  <span class="d-edit-btn">
                    <UIcon name="i-lucide-pencil" class="size-3" />
                  </span>
                </div>
              </div>
              <div class="d-slider-box">
                <div class="d-label" style="font-size:10px;">Ajuste rápido · Período</div>
                <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:8px;">
                  <div style="font-size:20px; font-weight:600; letter-spacing:-.02em; font-variant-numeric:tabular-nums;">
                    10 <span style="font-size:12px; color:rgba(15,15,14,.5); font-weight:500;">anos</span>
                  </div>
                  <div style="font-size:11px; color:rgba(15,15,14,.55); font-weight:500;">120 meses</div>
                </div>
                <div class="d-slider-track">
                  <div class="d-slider-fill"></div>
                  <div class="d-slider-thumb"></div>
                </div>
                <div class="d-slider-labels">
                  <span>1A</span><span>5A</span><span>10A</span><span>20A</span><span>30A</span>
                </div>
              </div>
            </div>

            <!-- Result + chart -->
            <div style="display:flex; flex-direction:column; gap:14px;">
              <div class="d-card d-result-hero">
                <span class="d-glow-amber"></span>
                <div style="position:relative; display:flex; justify-content:space-between; align-items:flex-end; gap:30px;">
                  <div>
                    <div class="d-mono-tag" style="color:rgba(255,255,255,.6);">VALOR FINAL · 10 ANOS</div>
                    <div style="font-size:54px; font-weight:600; letter-spacing:-.035em; margin-top:12px; font-variant-numeric:tabular-nums; line-height:1;">
                      R$ 248.402<span style="color:rgba(255,255,255,.45);">,17</span>
                    </div>
                  </div>
                  <div style="display:flex; gap:24px;">
                    <div>
                      <div class="d-mono-sub">VOCÊ APORTOU</div>
                      <div style="font-size:18px; font-weight:600; margin-top:6px; font-variant-numeric:tabular-nums;">R$ 130.000</div>
                    </div>
                    <div>
                      <div class="d-mono-sub">JUROS</div>
                      <div style="font-size:18px; font-weight:600; margin-top:6px; color:#5EFFA5; font-variant-numeric:tabular-nums;">+R$ 118.402</div>
                    </div>
                    <div>
                      <div class="d-mono-sub">RENT. TOTAL</div>
                      <div style="font-size:18px; font-weight:600; margin-top:6px; color:#5EFFA5; font-variant-numeric:tabular-nums;">+91%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="d-card" style="flex:1; display:flex; flex-direction:column;">
                <div class="d-section-h">
                  <span class="title">Evolução do patrimônio</span>
                  <span style="font-size:12px; color:rgba(15,15,14,.55); font-weight:500;">10 anos · mensal</span>
                </div>
                <div style="margin-top:8px; margin-left:-6px; margin-right:-6px; flex:1; height:200px;">
                  <svg viewBox="0 0 800 200" preserveAspectRatio="none" style="width:100%; height:100%; display:block;">
                    <defs>
                      <linearGradient id="jrtD" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#0F8C4D" stop-opacity=".25" />
                        <stop offset="100%" stop-color="#0F8C4D" stop-opacity="0" />
                      </linearGradient>
                    </defs>
                    <line v-for="f in [0.25, 0.5, 0.75]" :key="f"
                          x1="6" :x2="794" :y1="8 + 184*f" :y2="8 + 184*f"
                          stroke="rgba(15,15,14,.06)" stroke-dasharray="2 4" />
                    <path d="M6,175 L80,170 L160,160 L240,144 L320,124 L400,100 L480,76 L560,52 L640,32 L720,18 L794,8 L794,192 L6,192 Z"
                          fill="url(#jrtD)" />
                    <path d="M6,182 L80,180 L160,176 L240,170 L320,164 L400,158 L480,150 L560,140 L640,128 L720,114 L794,98 L794,192 L6,192 Z"
                          fill="rgba(15,15,14,.08)" />
                    <path d="M6,182 L80,180 L160,176 L240,170 L320,164 L400,158 L480,150 L560,140 L640,128 L720,114 L794,98"
                          fill="none" stroke="rgba(15,15,14,.5)" stroke-width="1.5"
                          stroke-linecap="round" stroke-dasharray="3 3" />
                    <path d="M6,175 L80,170 L160,160 L240,144 L320,124 L400,100 L480,76 L560,52 L640,32 L720,18 L794,8"
                          fill="none" stroke="#0F8C4D" stroke-width="2"
                          stroke-linecap="round" stroke-linejoin="round" />
                    <circle cx="794" cy="8" r="4" fill="#0F8C4D" stroke="#FFFFFF" stroke-width="1.5" />
                  </svg>
                </div>
                <div style="display:flex; gap:16px; margin-top:10px; font-size:12px; color:rgba(15,15,14,.6);">
                  <div style="display:flex; align-items:center; gap:5px;">
                    <span style="width:9px; height:9px; border-radius:2px; background:rgba(15,15,14,.4);"></span>
                    <span>Aportes acumulados</span>
                  </div>
                  <div style="display:flex; align-items:center; gap:5px;">
                    <span style="width:9px; height:9px; border-radius:2px; background:#0F8C4D;"></span>
                    <span>Juros gerados</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Yearly table -->
          <div class="d-card">
            <div class="d-section-h">
              <span class="title">Tabela anual completa</span>
              <span class="link">Baixar CSV →</span>
            </div>
            <div class="d-table-head">
              <div>ANO</div>
              <div>APORTE ANO</div>
              <div>APORTE ACUM.</div>
              <div>JUROS ANO</div>
              <div>JUROS ACUM.</div>
              <div style="text-align:right;">SALDO</div>
            </div>
            <div v-for="(row, i) in tableRowsDt" :key="row.y"
                 class="d-table-row"
                 :class="{ 'd-table-row-last': i === tableRowsDt.length - 1, 'd-table-row-hl': row.highlight }">
              <div :class="row.highlight ? 'd-table-y-hl' : 'd-table-y'">{{ row.y }}</div>
              <div style="font-size:13px; color:rgba(15,15,14,.65); font-variant-numeric:tabular-nums;">R$ {{ row.apAno }}</div>
              <div style="font-size:13px; color:rgba(15,15,14,.85); font-variant-numeric:tabular-nums;">R$ {{ row.apAcum }}</div>
              <div style="font-size:13px; color:#0F8C4D; font-weight:500; font-variant-numeric:tabular-nums;">+{{ row.jrAno }}</div>
              <div :style="{ fontWeight: row.highlight ? 600 : 500 }" style="font-size:13px; color:#0F8C4D; font-variant-numeric:tabular-nums;">+{{ row.jrAcum }}</div>
              <div style="font-size:14px; font-weight:600; text-align:right; font-variant-numeric:tabular-nums;">R$ {{ row.saldo }}</div>
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

const view = ref<'list' | 'juros'>('list')

const iconMap: Record<string, string> = {
  rate: 'i-lucide-refresh-cw',
  cap: 'i-lucide-trending-up',
  tax: 'i-lucide-receipt',
  loan: 'i-lucide-home',
  goal: 'i-lucide-target',
  cpi: 'i-lucide-activity',
  bond: 'i-lucide-landmark',
  shield: 'i-lucide-shield',
  dy: 'i-lucide-circle-dollar-sign',
  target: 'i-lucide-target',
}

const CALCS = [
  { id: 'juros',   name: 'Juros compostos',       sub: 'Quanto vai render seu aporte',     icon: 'rate',   popular: true },
  { id: 'teto',    name: 'Preço teto',            sub: 'Bazin · Graham · Décio Bazin',     icon: 'cap',    popular: true },
  { id: 'ir',      name: 'IR de investimentos',   sub: 'Renda variável · Tesouro',         icon: 'tax',    popular: true },
  { id: 'financ',  name: 'Financiamento',         sub: 'SAC · Price · imóvel · veículo',   icon: 'loan' },
  { id: 'apos',    name: 'Aposentadoria',         sub: 'Quanto você precisa pra parar',    icon: 'goal' },
  { id: 'inflac',  name: 'Inflação',              sub: 'Corrige valores pelo IPCA',        icon: 'cpi' },
  { id: 'cdb',     name: 'CDB vs Tesouro',        sub: 'Comparador líquido',               icon: 'bond' },
  { id: 'reserva', name: 'Reserva de emergência', sub: 'Quanto guardar e onde',            icon: 'shield' },
  { id: 'div',     name: 'Dividend Yield',        sub: 'Calcula DY de qualquer ativo',     icon: 'dy' },
  { id: 'aporte',  name: 'Aporte ideal',          sub: 'Pra bater sua meta',               icon: 'target' },
]

const inputs = [
  { label: 'Aporte inicial', value: 'R$ 10.000', sub: 'Quanto você começa' },
  { label: 'Aporte mensal',  value: 'R$ 1.000',  sub: 'Repete todo mês' },
  { label: 'Taxa de juros',  value: '0,75% a.m.', sub: '≈ 9,4% a.a.' },
  { label: 'Período',        value: '10 anos',    sub: '120 meses' },
]

const tableRows = [
  { y: '1',  ap: '22.000',  jr: '1.420',   saldo: '23.420' },
  { y: '3',  ap: '46.000',  jr: '9.480',   saldo: '55.480' },
  { y: '5',  ap: '70.000',  jr: '24.120',  saldo: '94.120' },
  { y: '7',  ap: '94.000',  jr: '48.890',  saldo: '142.890' },
  { y: '10', ap: '130.000', jr: '118.402', saldo: '248.402', highlight: true },
]

const tableRowsDt = [
  { y: '1',  apAno: '12.000', apAcum: '22.000',  jrAno: '1.420',  jrAcum: '1.420',   saldo: '23.420' },
  { y: '2',  apAno: '12.000', apAcum: '34.000',  jrAno: '2.840',  jrAcum: '4.260',   saldo: '38.260' },
  { y: '3',  apAno: '12.000', apAcum: '46.000',  jrAno: '5.220',  jrAcum: '9.480',   saldo: '55.480' },
  { y: '4',  apAno: '12.000', apAcum: '58.000',  jrAno: '6.890',  jrAcum: '16.370',  saldo: '74.370' },
  { y: '5',  apAno: '12.000', apAcum: '70.000',  jrAno: '7.750',  jrAcum: '24.120',  saldo: '94.120' },
  { y: '6',  apAno: '12.000', apAcum: '82.000',  jrAno: '11.520', jrAcum: '35.640',  saldo: '117.640' },
  { y: '7',  apAno: '12.000', apAcum: '94.000',  jrAno: '13.250', jrAcum: '48.890',  saldo: '142.890' },
  { y: '8',  apAno: '12.000', apAcum: '106.000', jrAno: '15.180', jrAcum: '64.070',  saldo: '170.070' },
  { y: '9',  apAno: '12.000', apAcum: '118.000', jrAno: '22.730', jrAcum: '86.800',  saldo: '204.800' },
  { y: '10', apAno: '12.000', apAcum: '130.000', jrAno: '31.602', jrAcum: '118.402', saldo: '248.402', highlight: true },
]

const saved = [
  { name: 'Aposentadoria · 2046', calc: 'Juros compostos', value: 'R$ 1,2M', when: 'atualizado há 3d' },
  { name: 'Casa própria · 2028',  calc: 'Financiamento',   value: 'R$ 480k', when: 'há 1 sem' },
  { name: 'Reserva · 6 meses',    calc: 'Reserva',         value: 'R$ 36k',  when: 'há 2 sem' },
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
.phone.mercury .m-label { font-size: 11px; font-weight: 500; color: rgba(15,15,14,.5); letter-spacing: .01em; }

.phone.mercury .m-section {
  padding: 24px 22px 12px;
  display: flex; justify-content: space-between; align-items: baseline;
}
.phone.mercury .m-section .title { font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
.phone.mercury .m-section .link { font-size: 13px; color: #0F0F0E; font-weight: 500; cursor: pointer; }

.phone.mercury .m-search {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; background: #FFFFFF;
  border: 1px solid rgba(15,15,14,.06); border-radius: 12px;
}
.phone.mercury .m-search > :first-child { max-width: 15px; flex-shrink: 0; }
.phone.mercury .m-search span { flex: 1; font-size: 14px; color: rgba(15,15,14,.4); }

.phone.mercury .m-feat-row {
  display: flex; gap: 10px; padding: 0 16px;
  overflow-x: auto; scrollbar-width: none;
}
.phone.mercury .m-feat-row::-webkit-scrollbar { display: none; }
.phone.mercury .m-feat-card {
  flex-shrink: 0; min-width: 178px;
  padding: 18px 16px;
  background: #FFFFFF; border: 1px solid rgba(15,15,14,.05);
  border-radius: 14px; cursor: pointer;
  display: flex; flex-direction: column; gap: 14px;
  text-align: left; font-family: inherit;
}
.phone.mercury .m-calc-ic {
  width: 34px; height: 34px; border-radius: 10px;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.7);
  display: grid; place-items: center; flex-shrink: 0;
}
.phone.mercury .m-calc-ic-large { width: 44px; height: 44px; }

.phone.mercury .m-calc-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 22px;
  border-bottom: 1px solid rgba(15,15,14,.05);
  cursor: pointer; width: 100%;
  background: transparent; border-left: 0; border-right: 0; border-top: 0;
  font-family: inherit; text-align: left;
}
.phone.mercury .m-calc-row-last { border-bottom: 0; }
.phone.mercury .m-pop-tag {
  padding: 1px 6px; border-radius: 4px;
  background: rgba(183,135,58,.12); color: #B7873A;
  font-size: 9px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
}

.phone.mercury .m-cta {
  margin: 0 16px; padding: 18px 20px;
  background: #0F0F0E; color: #FFFFFF; border-radius: 20px;
  display: flex; align-items: center; justify-content: space-between;
}
.phone.mercury .m-cta .t { font-size: 16px; font-weight: 500; letter-spacing: -.01em; }
.phone.mercury .m-cta .s { font-size: 12px; color: rgba(255,255,255,.55); margin-top: 2px; }

/* Hero dark card */
.phone.mercury .m-glow-amber {
  position: absolute; right: -30px; top: -30px;
  width: 160px; height: 160px; border-radius: 50%;
  background: radial-gradient(circle, rgba(183,135,58,.22), transparent 70%);
  pointer-events: none;
}
.phone.mercury .m-mono-tag {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; letter-spacing: .14em;
  color: rgba(255,255,255,.6); font-weight: 600;
}
.phone.mercury .m-mono-sub {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; letter-spacing: .12em;
  color: rgba(255,255,255,.5);
}
.phone.mercury .m-hero-num {
  font-size: 40px; font-weight: 600; letter-spacing: -.032em;
  margin-top: 10px; font-variant-numeric: tabular-nums;
}
.phone.mercury .m-hero-split {
  display: flex; gap: 20px; margin-top: 18px; padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,.10);
}
.phone.mercury .m-hero-stat {
  font-size: 15px; font-weight: 600; margin-top: 5px;
  font-variant-numeric: tabular-nums;
}

.phone.mercury .d-section-h {
  display: flex; justify-content: space-between; align-items: baseline;
}

/* Inputs */
.phone.mercury .m-input-row {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 22px;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.phone.mercury .m-input-row-last { border-bottom: 0; }
.phone.mercury .m-edit-btn {
  width: 30px; height: 30px; border-radius: 8px;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.6);
  display: grid; place-items: center;
}

/* Slider */
.phone.mercury .m-slider-track {
  margin-top: 18px; height: 5px;
  background: rgba(15,15,14,.06); border-radius: 3px;
  position: relative;
}
.phone.mercury .m-slider-fill {
  position: absolute; left: 0; height: 100%; width: 30%;
  background: #0F0F0E; border-radius: 3px;
}
.phone.mercury .m-slider-thumb {
  position: absolute; left: 30%; transform: translateX(-50%); top: -7px;
  width: 18px; height: 18px; border-radius: 50%;
  background: #FFFFFF; border: 2px solid #0F0F0E;
  box-shadow: 0 1px 4px rgba(15,15,14,.18);
}
.phone.mercury .m-slider-labels {
  display: flex; justify-content: space-between; margin-top: 8px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; letter-spacing: .08em;
  color: rgba(15,15,14,.45); font-weight: 600;
}

/* Table */
.phone.mercury .m-table-head {
  display: grid; grid-template-columns: 40px 1fr 1fr 1fr;
  gap: 8px; padding: 12px 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; letter-spacing: .1em; text-transform: uppercase;
  color: rgba(15,15,14,.45); font-weight: 600;
  border-bottom: 1px solid rgba(15,15,14,.06);
}
.phone.mercury .m-table-row {
  display: grid; grid-template-columns: 40px 1fr 1fr 1fr;
  gap: 8px; padding: 12px 0; align-items: center;
  border-bottom: 1px solid rgba(15,15,14,.04);
}
.phone.mercury .m-table-row-last { border-bottom: 0; }
.phone.mercury .m-table-row-hl {
  background: rgba(183,135,58,.06);
  margin: 0 -22px; padding-left: 22px; padding-right: 22px;
}
.phone.mercury .m-table-y { font-size: 14px; font-weight: 600; color: #0F0F0E; }
.phone.mercury .m-table-y-hl {
  font-size: 14px; font-weight: 700; color: #B7873A;
  font-family: 'Newsreader', serif; font-style: italic;
}

/* CTAs */
.phone.mercury .m-save-btn {
  flex: 1; padding: 13px 18px; border-radius: 10px;
  background: #0F0F0E; color: #fff;
  font-size: 14px; font-weight: 500;
  text-align: center; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
}
.phone.mercury .m-share-btn {
  width: 48px; padding: 13px 0; border-radius: 10px;
  background: rgba(15,15,14,.04);
  display: grid; place-items: center; cursor: pointer;
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
.dt .d-side .d-brand {
  display: flex; align-items: center; gap: 10px; padding: 0 4px;
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
.dt .d-side .d-nav .item.active .badge { background: rgba(255,255,255,.15); color: #fff; }
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

/* Featured cards */
.dt .d-feat-row {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;
}
.dt .d-feat-card {
  padding: 24px 26px; cursor: pointer;
  display: flex; flex-direction: column; gap: 16px;
}
.dt .d-feat-ic {
  width: 48px; height: 48px; border-radius: 14px;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.75);
  display: grid; place-items: center;
}
.dt .d-pop-tag {
  padding: 2px 8px; border-radius: 4px;
  background: rgba(183,135,58,.12); color: #B7873A;
  font-size: 9px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
}

.dt .d-calc-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 6px;
}
.dt .d-calc-card {
  background: rgba(15,15,14,.025);
  border: 1px solid rgba(15,15,14,.04);
  border-radius: 12px; padding: 16px 18px; cursor: pointer;
  display: flex; flex-direction: column; gap: 12px;
}
.dt .d-calc-card-ic {
  width: 36px; height: 36px; border-radius: 10px;
  background: #FFFFFF; color: rgba(15,15,14,.7);
  display: grid; place-items: center;
  border: 1px solid rgba(15,15,14,.05);
}

.dt .d-saved-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
}
.dt .d-saved-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(15,15,14,.05); cursor: pointer;
}
.dt .d-saved-item-last { border-bottom: 0; }

.dt .d-ai-card {
  padding: 24px 26px; border-radius: 18px;
  background: #0F0F0E; color: #FAF6EA;
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; justify-content: space-between;
}
.dt .d-glow-amber {
  position: absolute; right: -40px; top: -40px;
  width: 200px; height: 200px; border-radius: 50%;
  background: radial-gradient(circle, rgba(183,135,58,.22), transparent 70%);
  pointer-events: none;
}
.dt .d-mono-tag {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; letter-spacing: .14em;
  color: #B7873A; font-weight: 600;
}
.dt .d-mono-sub {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; letter-spacing: .12em;
  color: rgba(255,255,255,.5);
}
.dt .d-amber-serif {
  color: #B7873A; font-family: 'Newsreader', serif;
  font-style: italic; font-weight: 500;
}
.dt .d-ai-cta {
  padding: 10px 16px; border-radius: 9px;
  background: #FAF6EA; color: #0F0F0E;
  font-size: 13px; font-weight: 600;
  display: inline-flex; align-items: center; gap: 6px;
  cursor: pointer;
}

/* Juros desktop */
.dt .d-juros-row {
  display: grid; grid-template-columns: 380px 1fr; gap: 14px;
}
.dt .d-input-row {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.dt .d-input-row-last { border-bottom: 0; }
.dt .d-edit-btn {
  width: 30px; height: 30px; border-radius: 8px;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.6);
  display: grid; place-items: center; cursor: pointer;
}
.dt .d-slider-box {
  margin-top: 18px; padding: 14px 16px; border-radius: 12px;
  background: rgba(15,15,14,.03);
}
.dt .d-slider-track {
  margin-top: 14px; height: 4px;
  background: rgba(15,15,14,.08); border-radius: 2px; position: relative;
}
.dt .d-slider-fill {
  position: absolute; left: 0; height: 100%; width: 30%;
  background: #0F0F0E; border-radius: 2px;
}
.dt .d-slider-thumb {
  position: absolute; left: 30%; transform: translateX(-50%); top: -7px;
  width: 18px; height: 18px; border-radius: 50%;
  background: #FFFFFF; border: 2px solid #0F0F0E;
  box-shadow: 0 1px 4px rgba(15,15,14,.18);
}
.dt .d-slider-labels {
  display: flex; justify-content: space-between; margin-top: 8px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; letter-spacing: .08em;
  color: rgba(15,15,14,.45); font-weight: 600;
}

.dt .d-result-hero {
  background: #0F0F0E; color: #FAF6EA;
  position: relative; overflow: hidden;
  padding: 28px 32px;
}

.dt .d-table-head {
  display: grid; grid-template-columns: 80px 1fr 1fr 1fr 1fr 1fr;
  gap: 14px; padding: 12px 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
  color: rgba(15,15,14,.45); font-weight: 600;
  border-top: 1px solid rgba(15,15,14,.06);
  border-bottom: 1px solid rgba(15,15,14,.06);
}
.dt .d-table-row {
  display: grid; grid-template-columns: 80px 1fr 1fr 1fr 1fr 1fr;
  gap: 14px; padding: 14px 0; align-items: center;
  border-bottom: 1px solid rgba(15,15,14,.04);
}
.dt .d-table-row-last { border-bottom: 0; }
.dt .d-table-row-hl {
  background: rgba(183,135,58,.06);
  margin: 0 -22px; padding-left: 22px; padding-right: 22px;
}
.dt .d-table-y { font-size: 15px; font-weight: 600; color: #0F0F0E; }
.dt .d-table-y-hl {
  font-size: 15px; font-weight: 700; color: #B7873A;
  font-family: 'Newsreader', serif; font-style: italic;
}
</style>

<!--
  /hero-examples — 20 heroes, cada um com background/cor/efeito próprio.
  Cada palco é uma identidade visual distinta. Nada de template uniforme.
-->
<template>
  <NuxtLayout name="default" title="Hero examples">
    <main class="hex-shell">
      <header class="hex-page-head">
        <p class="hex-eyebrow">/ Hero examples · 20 variações cinematográficas</p>
        <h1 class="hex-page-h">
          20 heroes que tentam te <em>surpreender.</em>
        </h1>
        <p class="hex-page-sub">
          Cada palco é um experimento próprio — gradient, dark, paper, terminal,
          neon, brutalismo. Mesma promessa em 20 línguas visuais.
        </p>
        <nav class="hex-page-nav">
          <a href="#a" class="hex-page-nav-link">→ Lado A · 10 heroes pra /</a>
          <a href="#b" class="hex-page-nav-link">→ Lado B · 10 heroes pra /</a>
        </nav>
      </header>

      <!-- ============================================================
           BANNER — Fluxo "Inteligência Redentia" (componente reutilizável)
           ============================================================ -->
      <div class="bn-wrap">
        <MoleculesHomeIntelligenceBanner />
      </div>

      <!-- ============================================================
           LADO A — empurra pro Resumo Inteligente (/)
           ============================================================ -->
      <section id="a" class="hex-side">
        <header class="hex-side-head">
          <p class="hex-side-eyebrow">LADO A · em /</p>
          <h2 class="hex-side-h">10 jeitos de seduzir pro <em>Resumo</em></h2>
        </header>

        <!-- A01 — VIOLETA + ORBE PULSANTE -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">A01</span><span class="hex-label-name">A pergunta · orbe pulsante</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage a01">
            <span class="a01-orb a01-orb-1" aria-hidden="true" />
            <span class="a01-orb a01-orb-2" aria-hidden="true" />
            <div class="a01-shell">
              <p class="a01-tag">REDENTIA · diário</p>
              <h2 class="a01-h">Tem <em>30 segundos</em>?</h2>
              <p class="a01-sub">A leitura do dia inteiro cabe em uma respiração.</p>
              <NuxtLink to="/" class="a01-btn">
                <span>Sim, mostra aí</span>
                <UIcon name="i-lucide-arrow-right" class="size-4" />
              </NuxtLink>
            </div>
          </div>
          <p class="hex-note">BG: violeta profundo + 2 orbes radiais pulsando. Premium e intimista.</p>
        </article>

        <!-- A02 — MANIFESTO BRUTAL PRETO -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">A02</span><span class="hex-label-name">Manifesto brutal</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage a02">
            <div class="a02-grid" aria-hidden="true" />
            <span class="a02-glow" aria-hidden="true" />
            <div class="a02-shell">
              <p class="a02-tag">SEM RUÍDO</p>
              <h2 class="a02-h">
                Você não <s>lê</s> o mercado.<br />
                Você <em>entende.</em>
              </h2>
              <NuxtLink to="/" class="a02-btn">
                <span>Ver edição de hoje</span>
                <UIcon name="i-lucide-arrow-right" class="size-4" />
              </NuxtLink>
            </div>
          </div>
          <p class="hex-note">BG: preto absoluto + grid + glow âmbar inferior. Editorial premium.</p>
        </article>

        <!-- A03 — MEGA "30s" GRADIENT TEXT -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">A03</span><span class="hex-label-name">Mega 30s · gradient text</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage a03">
            <span class="a03-spot" aria-hidden="true" />
            <div class="a03-shell">
              <p class="a03-mega" aria-label="30 segundos">30<span>s</span></p>
              <p class="a03-sub">é o tempo certo. <em>Não mais.</em></p>
              <NuxtLink to="/" class="a03-btn">
                <UIcon name="i-lucide-zap" class="size-4" />
                <span>Começar agora</span>
              </NuxtLink>
            </div>
          </div>
          <p class="hex-note">BG: dark com spot light + número em gradient âmbar→magenta. Cinematic.</p>
        </article>

        <!-- A04 — SPLIT CAOS VS CALMA -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">A04</span><span class="hex-label-name">Split caos vs calma</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage a04">
            <div class="a04-grid">
              <div class="a04-chaos">
                <div class="a04-noise"><span v-for="i in 9" :key="i" /></div>
                <p class="a04-cap a04-cap-chaos">8 cards · 24 indicadores · 16 charts</p>
              </div>
              <div class="a04-vs">
                <span>vs</span>
              </div>
              <div class="a04-calm">
                <span class="a04-glow" aria-hidden="true" />
                <p class="a04-quote">"O petróleo levou o Brasil hoje."</p>
                <p class="a04-cap a04-cap-calm">1 leitura · 30s</p>
              </div>
            </div>
            <NuxtLink to="/" class="a04-btn">
              <span>Quero o lado calmo</span>
              <UIcon name="i-lucide-arrow-right" class="size-4" />
            </NuxtLink>
          </div>
          <p class="hex-note">BG: split — ruído real no caos, calma com halo dourado.</p>
        </article>

        <!-- A05 — RELÓGIO CIRCULAR -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">A05</span><span class="hex-label-name">Relógio que economiza</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage a05">
            <div class="a05-grid">
              <svg class="a05-ring" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="88" fill="none" stroke="var(--border-subtle)" stroke-width="8" />
                <circle cx="100" cy="100" r="88" fill="none" stroke="var(--brand-primary)" stroke-width="8" stroke-dasharray="552" stroke-dashoffset="540" stroke-linecap="round" transform="rotate(-90 100 100)" />
                <text x="100" y="92" text-anchor="middle" font-family="Georgia" font-size="48" fill="var(--text-heading)" font-weight="400">30</text>
                <text x="100" y="118" text-anchor="middle" font-size="11" fill="var(--text-muted)" letter-spacing="2">SEGUNDOS</text>
              </svg>
              <div>
                <p class="a05-eyebrow">VOCÊ GASTA EM MÉDIA</p>
                <p class="a05-old">12 min/dia</p>
                <p class="a05-mid">olhando dashboards. A gente devolve <em>11 min e 30 segundos.</em></p>
                <NuxtLink to="/" class="a05-btn">
                  <UIcon name="i-lucide-clock" class="size-4" />
                  <span>Recuperar meu tempo</span>
                </NuxtLink>
              </div>
            </div>
          </div>
          <p class="hex-note">BG: limpo com ring de progresso SVG (12% completo).</p>
        </article>

        <!-- A06 — BRUTAL PRETO + RISCADO VERMELHO -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">A06</span><span class="hex-label-name">Anti-dashboard brutalista</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage a06">
            <div class="a06-shell">
              <ul class="a06-strike">
                <li><svg viewBox="0 0 200 20" class="a06-line"><line x1="0" y1="10" x2="200" y2="10" stroke="var(--brand-negative)" stroke-width="3" /></svg>8 cards de KPI</li>
                <li><svg viewBox="0 0 200 20" class="a06-line"><line x1="0" y1="10" x2="200" y2="10" stroke="var(--brand-negative)" stroke-width="3" /></svg>24 indicadores</li>
                <li><svg viewBox="0 0 200 20" class="a06-line"><line x1="0" y1="10" x2="200" y2="10" stroke="var(--brand-negative)" stroke-width="3" /></svg>16 charts</li>
                <li><svg viewBox="0 0 200 20" class="a06-line"><line x1="0" y1="10" x2="200" y2="10" stroke="var(--brand-negative)" stroke-width="3" /></svg>6 tabelas</li>
              </ul>
              <p class="a06-eq">=</p>
              <p class="a06-result">Só <em>o que mexeu.</em></p>
              <NuxtLink to="/" class="a06-btn">
                <span>Ver Resumo</span>
                <UIcon name="i-lucide-arrow-right" class="size-4" />
              </NuxtLink>
            </div>
          </div>
          <p class="hex-note">BG: preto brutal + linhas vermelhas riscando a lista. Editorial agressivo.</p>
        </article>

        <!-- A07 — JORNAL SEPIA -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">A07</span><span class="hex-label-name">Jornal sepia</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage a07">
            <div class="a07-paper">
              <p class="a07-masthead">REDENTIA <span>EDIÇÃO 213</span></p>
              <p class="a07-meta">Terça, 21 de novembro · noite</p>
              <h2 class="a07-h">"O petróleo levou o Brasil pra baixo."</h2>
              <p class="a07-deck">
                Brent caiu 2,8%. Petrobras derreteu. Ibovespa fechou em −1,85%.
                <em>Os juros pioraram, exportadoras seguraram.</em>
              </p>
              <div class="a07-rule" />
              <p class="a07-byline">
                <span class="a07-r">R</span>
                <span><strong>Redentia · Editorial</strong> · 17h48</span>
              </p>
              <NuxtLink to="/" class="a07-btn">
                <span>Ler edição completa</span>
                <UIcon name="i-lucide-arrow-right" class="size-3.5" />
              </NuxtLink>
            </div>
          </div>
          <p class="hex-note">BG: papel kraft sepia + masthead estilo jornal. Slow journalism.</p>
        </article>

        <!-- A08 — GLASSMORPHISM SPLIT -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">A08</span><span class="hex-label-name">Glassmorphism split</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage a08">
            <span class="a08-blob a08-blob-1" aria-hidden="true" />
            <span class="a08-blob a08-blob-2" aria-hidden="true" />
            <span class="a08-blob a08-blob-3" aria-hidden="true" />
            <div class="a08-shell">
              <p class="a08-eyebrow">MESMO DIA · DUAS LEITURAS</p>
              <div class="a08-cards">
                <div class="a08-card a08-card-old">
                  <p class="a08-card-tag">Tradicional</p>
                  <div class="a08-card-noise"><span v-for="i in 12" :key="i" /></div>
                </div>
                <div class="a08-card a08-card-new">
                  <p class="a08-card-tag">Redentia</p>
                  <p class="a08-card-quote">"Petróleo<br />levou tudo<br />pra baixo."</p>
                </div>
              </div>
              <NuxtLink to="/" class="a08-btn">
                <span>Quero a versão Redentia</span>
                <UIcon name="i-lucide-arrow-right" class="size-4" />
              </NuxtLink>
            </div>
          </div>
          <p class="hex-note">BG: blobs coloridos com blur + cards glassmorphism. Aurora vibe.</p>
        </article>

        <!-- A09 — CARROSSEL DE AÇÕES (componente real) + INDICADORES + NEWS -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">A09</span><span class="hex-label-name">Tickers + indicadores + news</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage a09">
            <!-- BG: ticker carousel real rodando atrás, fade pesado -->
            <div class="a09-ticker-bg" aria-hidden="true">
              <AtomsTickerCarousel
                no-control
                big
                :items="a09Tickers"
                fade-color="var(--bg-elevated)"
              />
            </div>

            <div class="a09-shell">
              <p class="a09-eyebrow">A REDENTIA PROCESSOU HOJE</p>
              <p class="a09-big">1.450</p>
              <p class="a09-mid">dados. <em>Só 5 importam.</em></p>

              <!-- INDICADORES mockados -->
              <ul class="a09-indicators">
                <li>
                  <p class="a09-ind-label">IBOV</p>
                  <p class="a09-ind-val neg">−1,85%</p>
                </li>
                <li>
                  <p class="a09-ind-label">SELIC</p>
                  <p class="a09-ind-val">13,75%</p>
                </li>
                <li>
                  <p class="a09-ind-label">DÓLAR</p>
                  <p class="a09-ind-val pos">+0,42%</p>
                </li>
                <li>
                  <p class="a09-ind-label">BRENT</p>
                  <p class="a09-ind-val neg">−2,81%</p>
                </li>
                <li>
                  <p class="a09-ind-label">S&amp;P 500</p>
                  <p class="a09-ind-val neg">−1,42%</p>
                </li>
              </ul>

              <!-- CARROSSEL DE NEWS mockado (scroll horizontal) -->
              <div class="a09-news-wrap">
                <ul class="a09-news">
                  <li>
                    <span class="a09-news-dot a09-news-dot-neg" />
                    <p class="a09-news-source">VALOR</p>
                    <p class="a09-news-h">Petrobras recua 4,1% após Brent perder linha dos US$ 72</p>
                  </li>
                  <li>
                    <span class="a09-news-dot a09-news-dot-neg" />
                    <p class="a09-news-source">BLOOMBERG</p>
                    <p class="a09-news-h">DI sobe 18 bps com revisão fiscal; bancos pressionados</p>
                  </li>
                  <li>
                    <span class="a09-news-dot a09-news-dot-pos" />
                    <p class="a09-news-source">INFOMONEY</p>
                    <p class="a09-news-h">Vale +1,9% com dólar a R$ 5,84 e minério firme</p>
                  </li>
                  <li>
                    <span class="a09-news-dot a09-news-dot-neg" />
                    <p class="a09-news-source">REUTERS</p>
                    <p class="a09-news-h">Wall Street fecha vermelha com Nvidia caindo 3,5%</p>
                  </li>
                  <li>
                    <span class="a09-news-dot a09-news-dot-neg" />
                    <p class="a09-news-source">FOLHA</p>
                    <p class="a09-news-h">Lula sinaliza ajuste fiscal; mercado oscila</p>
                  </li>
                  <li>
                    <span class="a09-news-dot a09-news-dot-pos" />
                    <p class="a09-news-source">VEJA</p>
                    <p class="a09-news-h">Suzano e JBS lideram exportadoras em alta</p>
                  </li>
                </ul>
              </div>

              <NuxtLink to="/" class="a09-btn">
                <UIcon name="i-lucide-sparkles" class="size-4" />
                <span>Ver os 5 que importam</span>
              </NuxtLink>
            </div>
          </div>
          <p class="hex-note">BG: AtomsTickerCarousel real rodando atrás. Indicadores + news mockados embaixo do número.</p>
        </article>

        <!-- A10 — EMAIL CLIENT REALISTA -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">A10</span><span class="hex-label-name">Email client realista</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage a10">
            <div class="a10-window">
              <div class="a10-bar">
                <span class="a10-dot a10-dot-r" />
                <span class="a10-dot a10-dot-y" />
                <span class="a10-dot a10-dot-g" />
                <p class="a10-url">inbox · redentia diário</p>
              </div>
              <div class="a10-content">
                <div class="a10-row a10-row-active">
                  <span class="a10-avatar">R</span>
                  <div class="a10-info">
                    <p class="a10-from"><strong>Redentia Diário</strong> <span>17h48</span></p>
                    <p class="a10-subject">O petróleo levou o Brasil pra baixo hoje. 🛢️</p>
                    <p class="a10-preview">Brent caiu 2,8%, Petrobras −4,1%, juros subiram. Em duas linhas o dia inteiro…</p>
                  </div>
                </div>
                <div class="a10-row a10-row-faded">
                  <span class="a10-avatar a10-avatar-2">B</span>
                  <div class="a10-info">
                    <p class="a10-from"><strong>Bloomberg</strong> <span>17h32</span></p>
                    <p class="a10-subject">Mercado bate novo low semanal…</p>
                  </div>
                </div>
                <div class="a10-row a10-row-faded">
                  <span class="a10-avatar a10-avatar-3">V</span>
                  <div class="a10-info">
                    <p class="a10-from"><strong>Valor</strong> <span>16h55</span></p>
                    <p class="a10-subject">Análise: o dia em 8 indicadores…</p>
                  </div>
                </div>
              </div>
            </div>
            <NuxtLink to="/" class="a10-btn">
              <UIcon name="i-lucide-mail-open" class="size-4" />
              <span>Abrir edição de hoje</span>
            </NuxtLink>
          </div>
          <p class="hex-note">BG: mock de inbox real, a do Redentia em destaque. Familiar.</p>
        </article>
      </section>

      <!-- ============================================================
           LADO B — empurra pro Mercado Completo
           ============================================================ -->
      <section id="b" class="hex-side">
        <header class="hex-side-head">
          <p class="hex-side-eyebrow">LADO B · em /</p>
          <h2 class="hex-side-h">10 jeitos de chamar pro <em>Mercado Completo</em></h2>
        </header>

        <!-- B01 — TERMINAL BLOOMBERG -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">B01</span><span class="hex-label-name">Terminal Bloomberg</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage b01">
            <div class="b01-scanline" aria-hidden="true" />
            <div class="b01-shell">
              <p class="b01-prompt">redentia &gt; analyst_mode --activate</p>
              <h2 class="b01-h">
                <span class="b01-blink">_</span> Modo <em>analista.</em>
              </h2>
              <ul class="b01-list">
                <li><span>✓</span> 29 tickers monitorados</li>
                <li><span>✓</span> 11 setores correlacionados</li>
                <li><span>✓</span> 9 dimensões do Raio-X</li>
              </ul>
              <NuxtLink to="/" class="b01-btn">
                <UIcon name="i-lucide-terminal" class="size-4" />
                <span>./executar</span>
              </NuxtLink>
            </div>
          </div>
          <p class="hex-note">BG: terminal preto + scanlines + monospace verde. Pra power users.</p>
        </article>

        <!-- B02 — GRID DE 1244 PONTOS -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">B02</span><span class="hex-label-name">Grid 1.244 pontos</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage b02">
            <div class="b02-grid" aria-hidden="true">
              <span v-for="i in 240" :key="i" :class="[3, 87, 142].includes(i) ? 'b02-hot' : ''" />
            </div>
            <div class="b02-shell">
              <h2 class="b02-h">E os <em>outros 1.244</em>?</h2>
              <p class="b02-sub">A gente filtrou pra te entregar 3. Mas tem 1.244 esperando.</p>
              <NuxtLink to="/" class="b02-btn">
                <UIcon name="i-lucide-database" class="size-4" />
                <span>Mergulhar em tudo</span>
              </NuxtLink>
            </div>
          </div>
          <p class="hex-note">BG: 240 pontos em grid (representa 1.244), 3 destacados em âmbar.</p>
        </article>

        <!-- B03 — BLUEPRINT/X-RAY -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">B03</span><span class="hex-label-name">Blueprint x-ray</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage b03">
            <div class="b03-grid" aria-hidden="true" />
            <svg class="b03-schematic" viewBox="0 0 320 180" aria-hidden="true">
              <circle cx="60" cy="40" r="14" stroke="#60a5fa" stroke-width="1.5" fill="none" />
              <circle cx="60" cy="40" r="3" fill="#60a5fa" />
              <line x1="60" y1="54" x2="60" y2="140" stroke="#60a5fa" stroke-width="1" stroke-dasharray="3 3" />
              <circle cx="60" cy="140" r="6" stroke="#60a5fa" stroke-width="1.5" fill="none" />
              <line x1="60" y1="40" x2="260" y2="40" stroke="#60a5fa" stroke-width="1" stroke-dasharray="3 3" />
              <circle cx="260" cy="40" r="6" stroke="#60a5fa" stroke-width="1.5" fill="none" />
              <line x1="260" y1="40" x2="260" y2="140" stroke="#60a5fa" stroke-width="1" stroke-dasharray="3 3" />
              <circle cx="260" cy="140" r="14" stroke="#60a5fa" stroke-width="1.5" fill="none" />
              <text x="60" y="170" font-size="9" fill="#60a5fa" text-anchor="middle">DADO_BRUTO</text>
              <text x="260" y="170" font-size="9" fill="#60a5fa" text-anchor="middle">CONCLUSÃO</text>
            </svg>
            <div class="b03-shell">
              <p class="b03-eyebrow">TRANSPARENCY</p>
              <h2 class="b03-h">Não <em>acredita</em>?<br />Veja você mesmo.</h2>
              <NuxtLink to="/" class="b03-btn">
                <UIcon name="i-lucide-eye" class="size-4" />
                <span>Ver schematic completo</span>
              </NuxtLink>
            </div>
          </div>
          <p class="hex-note">BG: azul blueprint + grid técnico + schematic SVG. Engenharia.</p>
        </article>

        <!-- B04 — PROFUNDIDADE CINEMÁTICA -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">B04</span><span class="hex-label-name">Profundidade cinemática</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage b04">
            <div class="b04-stack" aria-hidden="true">
              <span class="b04-layer b04-l1" />
              <span class="b04-layer b04-l2" />
              <span class="b04-layer b04-l3" />
              <span class="b04-layer b04-l4" />
            </div>
            <div class="b04-shell">
              <h2 class="b04-h">Mergulhe nos <em>dados.</em></h2>
              <div class="b04-counts">
                <div><strong>8</strong><span>TABELAS</span></div>
                <div><strong>16</strong><span>CHARTS</span></div>
                <div><strong>200+</strong><span>PONTOS</span></div>
              </div>
              <NuxtLink to="/" class="b04-btn">
                <UIcon name="i-lucide-arrow-down" class="size-4" />
                <span>Mergulhar</span>
              </NuxtLink>
            </div>
          </div>
          <p class="hex-note">BG: camadas com profundidade (parallax). Dive deep.</p>
        </article>

        <!-- B05 — BADGE HOLOGRÁFICO -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">B05</span><span class="hex-label-name">Badge holográfico</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage b05">
            <div class="b05-shell">
              <div class="b05-badge">
                <div class="b05-badge-inner">
                  <UIcon name="i-lucide-zap" class="size-7" />
                  <p class="b05-badge-text">PRO</p>
                </div>
              </div>
              <h2 class="b05-h">Modo <em>analista</em> ativado.</h2>
              <p class="b05-sub">9 dimensões, Raio-X completo, fundamentos, dividendos. Tudo.</p>
              <NuxtLink to="/" class="b05-btn">
                <span>Entrar no modo Pro</span>
                <UIcon name="i-lucide-arrow-right" class="size-4" />
              </NuxtLink>
            </div>
          </div>
          <p class="hex-note">BG: gradient suave + badge holográfico com shimmer rotativo.</p>
        </article>

        <!-- B06 — PIPELINE COM FLUXO -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">B06</span><span class="hex-label-name">Pipeline animado</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage b06">
            <div class="b06-shell">
              <p class="b06-eyebrow">DE COMO CHEGAMOS À LEITURA</p>
              <div class="b06-pipeline">
                <div class="b06-node">
                  <div class="b06-circle">1.247</div>
                  <p>notícias</p>
                </div>
                <div class="b06-flow"><span /><span /><span /></div>
                <div class="b06-node">
                  <div class="b06-circle">49</div>
                  <p>com impacto</p>
                </div>
                <div class="b06-flow"><span /><span /><span /></div>
                <div class="b06-node">
                  <div class="b06-circle b06-circle-final">3</div>
                  <p>fatores</p>
                </div>
              </div>
              <NuxtLink to="/" class="b06-btn">
                <UIcon name="i-lucide-git-branch" class="size-4" />
                <span>Ver o caminho dos dados</span>
              </NuxtLink>
            </div>
          </div>
          <p class="hex-note">BG: pipeline funil de dados com partículas fluindo.</p>
        </article>

        <!-- B07 — DASHBOARD MOCK REALISTA -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">B07</span><span class="hex-label-name">Dashboard preview</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage b07">
            <div class="b07-shell">
              <div class="b07-left">
                <h2 class="b07-h">A <em>versão completa</em> tem isso.</h2>
                <p class="b07-sub">Patrimônio, score, raio-X, dividendos, eventos, ativos.</p>
                <NuxtLink to="/" class="b07-btn">
                  <span>Abrir dashboard</span>
                  <UIcon name="i-lucide-arrow-up-right" class="size-4" />
                </NuxtLink>
              </div>
              <div class="b07-mock">
                <div class="b07-mock-head">
                  <p class="b07-mock-num">R$ 509.523</p>
                  <p class="b07-mock-pct">↑ +0,18%</p>
                </div>
                <svg class="b07-mock-chart" viewBox="0 0 240 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="b07grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="var(--brand-positive)" stop-opacity="0.4" />
                      <stop offset="100%" stop-color="var(--brand-positive)" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon points="0,60 30,55 60,48 90,40 120,45 150,30 180,20 210,15 240,10 240,80 0,80" fill="url(#b07grad)" />
                  <polyline points="0,60 30,55 60,48 90,40 120,45 150,30 180,20 210,15 240,10" fill="none" stroke="var(--brand-positive)" stroke-width="2" />
                </svg>
                <div class="b07-mock-grid">
                  <div><p>Score</p><p><strong>82</strong></p></div>
                  <div><p>Ativos</p><p><strong>29</strong></p></div>
                  <div><p>Renda</p><p><strong>R$18k</strong></p></div>
                </div>
              </div>
            </div>
          </div>
          <p class="hex-note">BG: laptop-style mock com chart + KPIs reais. Tease do completo.</p>
        </article>

        <!-- B08 — MOSAICO NUMÉRICO -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">B08</span><span class="hex-label-name">Mosaico numérico</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage b08">
            <div class="b08-shell">
              <h2 class="b08-h">Sua carteira tem mais que <em>3 fatores.</em></h2>
              <div class="b08-mosaic">
                <div class="b08-tile b08-tile-1"><strong>29</strong><span>ATIVOS</span></div>
                <div class="b08-tile b08-tile-2"><strong>11</strong><span>SETORES</span></div>
                <div class="b08-tile b08-tile-3"><strong>9</strong><span>DIMENSÕES</span></div>
                <div class="b08-tile b08-tile-4"><strong>4</strong><span>CLASSES</span></div>
                <div class="b08-tile b08-tile-5"><strong>82</strong><span>SCORE</span></div>
                <div class="b08-tile b08-tile-6"><strong>1.2k</strong><span>NEWS</span></div>
              </div>
              <NuxtLink to="/" class="b08-btn">
                <span>Ver cada um deles</span>
                <UIcon name="i-lucide-arrow-right" class="size-4" />
              </NuxtLink>
            </div>
          </div>
          <p class="hex-note">BG: mosaico tipo subway com tiles coloridos. Granularidade visual.</p>
        </article>

        <!-- B09 — CHECKLIST GRADIENT -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">B09</span><span class="hex-label-name">Persona checklist</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage b09">
            <span class="b09-glow" aria-hidden="true" />
            <div class="b09-shell">
              <p class="b09-eyebrow">VOCÊ É O TIPO QUE</p>
              <ul class="b09-checks">
                <li><UIcon name="i-lucide-check-circle-2" class="size-4" /> Lê cada relatório trimestral</li>
                <li><UIcon name="i-lucide-check-circle-2" class="size-4" /> Compara carteira com IBOV diariamente</li>
                <li><UIcon name="i-lucide-check-circle-2" class="size-4" /> Sabe o DY de cada FII de cabeça</li>
              </ul>
              <p class="b09-then">Resumo não é pra você.</p>
              <NuxtLink to="/" class="b09-btn">
                <UIcon name="i-lucide-layout-grid" class="size-4" />
                <span>Modo Completo</span>
              </NuxtLink>
            </div>
          </div>
          <p class="hex-note">BG: gradient teal+emerald + glow. Segmentação por persona.</p>
        </article>

        <!-- B10 — TOGGLE TÁTIL -->
        <article class="hex-card">
          <div class="hex-label"><span class="hex-label-num">B10</span><span class="hex-label-name">Toggle tátil 3D</span><NuxtLink to="/" class="hex-label-link">→ /</NuxtLink></div>
          <div class="hex-stage b10">
            <div class="b10-shell">
              <p class="b10-eyebrow">Você está em</p>
              <div class="b10-switch">
                <div class="b10-switch-side b10-switch-side-on">
                  <p>RESUMO</p>
                  <UIcon name="i-lucide-sparkles" class="size-5" />
                </div>
                <div class="b10-switch-handle" />
                <NuxtLink to="/" class="b10-switch-side b10-switch-side-off">
                  <UIcon name="i-lucide-layout-grid" class="size-5" />
                  <p>COMPLETO</p>
                </NuxtLink>
              </div>
              <p class="b10-sub">Click pra trocar.</p>
            </div>
          </div>
          <p class="hex-note">BG: switch físico com profundidade. Tátil, satisfatório.</p>
        </article>
      </section>
    </main>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

// (Banner Inteligência Redentia agora vive em
// components/molecules/HomeIntelligenceBanner.vue e é importado direto.)

// Mock items pro AtomsTickerCarousel em A09 (ações brasileiras + alguns intl).
const a09Tickers = [
  { logo: '/default-logo.png', ticker: 'PETR4',  change: '-4.11%', price: 'R$ 36,84' },
  { logo: '/default-logo.png', ticker: 'VALE3',  change: '+1.88%', price: 'R$ 56,92' },
  { logo: '/default-logo.png', ticker: 'ITUB4',  change: '-2.01%', price: 'R$ 33,21' },
  { logo: '/default-logo.png', ticker: 'BBDC4',  change: '-2.11%', price: 'R$ 13,42' },
  { logo: '/default-logo.png', ticker: 'BBAS3',  change: '-2.00%', price: 'R$ 27,85' },
  { logo: '/default-logo.png', ticker: 'WEGE3',  change: '+0.37%', price: 'R$ 41,20' },
  { logo: '/default-logo.png', ticker: 'B3SA3',  change: '-1.80%', price: 'R$ 9,84' },
  { logo: '/default-logo.png', ticker: 'PRIO3',  change: '-5.20%', price: 'R$ 38,42' },
  { logo: '/default-logo.png', ticker: 'SUZB3',  change: '+1.04%', price: 'R$ 54,21' },
  { logo: '/default-logo.png', ticker: 'JBSS3',  change: '+1.09%', price: 'R$ 32,45' },
  { logo: '/default-logo.png', ticker: 'ABEV3',  change: '-0.84%', price: 'R$ 11,82' },
  { logo: '/default-logo.png', ticker: 'ELET3',  change: '-0.83%', price: 'R$ 42,85' },
  { logo: '/default-logo.png', ticker: 'MGLU3',  change: '-3.20%', price: 'R$ 8,45' },
  { logo: '/default-logo.png', ticker: 'RAIZ4',  change: '+0.56%', price: 'R$ 4,32' },
  { logo: '/default-logo.png', ticker: 'EMBR3',  change: '+1.42%', price: 'R$ 38,90' },
  { logo: '/default-logo.png', ticker: 'BPAC11', change: '-1.95%', price: 'R$ 33,18' },
]
</script>

<style scoped>
.hex-shell { max-width: 1080px; margin: 0 auto; padding: 56px 32px 80px; }
@media (max-width: 767px) { .hex-shell { padding: 32px 20px 56px; } }

.hex-page-head { margin-bottom: 64px; max-width: 760px; }
.hex-eyebrow { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.22em; color: var(--text-muted); margin: 0 0 18px; }
.hex-page-h { font-family: Georgia, serif; font-size: clamp(32px, 4.4vw, 44px); font-weight: 300; color: var(--text-heading); margin: 0 0 18px; letter-spacing: -0.025em; line-height: 1.1; }
.hex-page-h em { font-style: italic; color: var(--brand-primary); }
.hex-page-sub { font-size: 15px; line-height: 1.6; color: var(--text-body); margin: 0 0 24px; }
.hex-page-nav { display: flex; flex-wrap: wrap; gap: 12px; }
.hex-page-nav-link { padding: 9px 16px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 999px; font-size: 12.5px; font-weight: 600; color: var(--text-body); text-decoration: none; }
.hex-page-nav-link:hover { border-color: var(--brand-primary); color: var(--brand-primary); }

.hex-side { margin-bottom: 80px; padding-top: 24px; }
.hex-side-head { margin-bottom: 36px; padding-bottom: 24px; border-bottom: 1px solid var(--border-subtle); }
.hex-side-eyebrow { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.22em; color: var(--brand-primary); margin: 0 0 12px; }
.hex-side-h { font-family: Georgia, serif; font-size: clamp(24px, 3vw, 32px); font-weight: 400; color: var(--text-heading); margin: 0; letter-spacing: -0.022em; }
.hex-side-h em { font-style: italic; color: var(--brand-primary); }

.hex-card { margin-bottom: 56px; }
.hex-label { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.hex-label-num { font-size: 11px; font-weight: 700; padding: 3px 9px; background: var(--text-heading); color: var(--bg-default); border-radius: 4px; letter-spacing: 0.08em; }
.hex-label-name { font-size: 13px; font-weight: 600; color: var(--text-heading); }
.hex-label-link { margin-left: auto; font-size: 11px; color: var(--text-muted); text-decoration: none; padding: 3px 8px; border: 1px solid var(--border-subtle); border-radius: 999px; font-family: monospace; }
.hex-label-link:hover { color: var(--brand-primary); border-color: var(--brand-primary); }
.hex-stage { position: relative; border-radius: 18px; padding: 56px 40px; min-height: 440px; display: flex; align-items: center; justify-content: center; overflow: hidden; isolation: isolate; }
.hex-note { font-size: 11.5px; color: var(--text-muted); font-style: italic; margin: 12px 4px 0; }

/* ============================================================
   A01 — VIOLETA + ORBES PULSANTES
   ============================================================ */
.a01 { background: radial-gradient(120% 100% at 30% 30%, #2a1a4d 0%, #14092e 50%, #0a0420 100%); }
.a01-orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(60px); opacity: 0.7; }
.a01-orb-1 { width: 380px; height: 380px; background: #ff8c42; top: -100px; left: -80px; animation: a01-orb-1 6s ease-in-out infinite; }
.a01-orb-2 { width: 320px; height: 320px; background: #c084fc; bottom: -120px; right: -60px; animation: a01-orb-2 7s ease-in-out infinite; }
@keyframes a01-orb-1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,20px) scale(1.1); } }
@keyframes a01-orb-2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-40px,-30px) scale(1.05); } }
.a01-shell { position: relative; text-align: center; max-width: 600px; }
.a01-tag { font-size: 11px; font-weight: 700; letter-spacing: 0.24em; color: #ffb86c; margin: 0 0 24px; text-transform: uppercase; }
.a01-h { font-family: Georgia, serif; font-size: clamp(40px, 6vw, 64px); font-weight: 300; color: #fff; margin: 0 0 16px; line-height: 1; letter-spacing: -0.03em; }
.a01-h em { font-style: italic; background: linear-gradient(135deg, #ffd97e 0%, #ff8c42 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.a01-sub { font-family: Georgia, serif; font-size: 18px; font-style: italic; color: rgba(255,255,255,0.7); margin: 0 0 32px; }
.a01-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 30px; background: rgba(255,255,255,0.95); color: #14092e; border-radius: 999px; font-size: 15px; font-weight: 700; text-decoration: none; backdrop-filter: blur(10px); transition: transform 200ms; }
.a01-btn:hover { transform: translateY(-2px) scale(1.02); }

/* ============================================================
   A02 — MANIFESTO BRUTAL PRETO
   ============================================================ */
.a02 { background: #000; color: #fff; }
.a02-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 40px 40px; mask-image: radial-gradient(ellipse at center, #000 0%, transparent 70%); -webkit-mask-image: radial-gradient(ellipse at center, #000 0%, transparent 70%); }
.a02-glow { position: absolute; bottom: -200px; left: 50%; transform: translateX(-50%); width: 600px; height: 400px; background: radial-gradient(ellipse, rgba(255,184,76,0.4) 0%, transparent 60%); pointer-events: none; filter: blur(40px); }
.a02-shell { position: relative; text-align: center; max-width: 720px; }
.a02-tag { font-size: 11px; font-weight: 700; letter-spacing: 0.28em; color: var(--brand-primary); margin: 0 0 24px; }
.a02-h { font-family: Georgia, serif; font-size: clamp(36px, 5.4vw, 60px); font-weight: 300; color: #fff; margin: 0 0 32px; line-height: 1.05; letter-spacing: -0.03em; }
.a02-h s { text-decoration: line-through; text-decoration-color: var(--brand-primary); text-decoration-thickness: 3px; color: rgba(255,255,255,0.4); }
.a02-h em { font-style: italic; color: var(--brand-primary); }
.a02-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; background: var(--brand-primary); color: #000; border-radius: 6px; font-size: 14.5px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 0.06em; }

/* ============================================================
   A03 — MEGA 30s GRADIENT TEXT
   ============================================================ */
.a03 { background: radial-gradient(circle at 50% 40%, #1a0f2e 0%, #0a0612 70%); }
.a03-spot { position: absolute; top: -40%; left: 50%; transform: translateX(-50%); width: 800px; height: 800px; background: radial-gradient(circle, rgba(255,184,76,0.18) 0%, transparent 50%); pointer-events: none; }
.a03-shell { position: relative; text-align: center; }
.a03-mega { font-family: Georgia, serif; font-size: clamp(140px, 22vw, 260px); font-weight: 200; margin: 0; line-height: 0.85; letter-spacing: -0.06em; background: linear-gradient(135deg, #ffd97e 0%, #ff8c42 40%, #f0598d 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.a03-mega span { font-size: 0.55em; opacity: 0.85; }
.a03-sub { font-family: Georgia, serif; font-size: 22px; color: rgba(255,255,255,0.85); margin: 16px 0 28px; font-weight: 300; }
.a03-sub em { font-style: italic; color: #ffd97e; }
.a03-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 30px; background: #fff; color: #0a0612; border-radius: 999px; font-size: 15px; font-weight: 700; text-decoration: none; }

/* ============================================================
   A04 — SPLIT CAOS VS CALMA
   ============================================================ */
.a04 { background: linear-gradient(90deg, #1a0d0d 0%, #1a0d0d 50%, var(--bg-elevated) 50%, var(--bg-elevated) 100%); padding: 40px; flex-direction: column; }
.a04-grid { display: grid; grid-template-columns: 1fr auto 1fr; gap: 20px; align-items: stretch; width: 100%; max-width: 720px; margin-bottom: 24px; }
.a04-chaos, .a04-calm { padding: 22px; border-radius: 12px; position: relative; }
.a04-chaos { background: #2a1414; }
.a04-noise { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-bottom: 16px; }
.a04-noise span { aspect-ratio: 1; background: #4a1f1f; border-radius: 3px; box-shadow: inset 0 0 6px rgba(239,68,68,0.3); }
.a04-noise span:nth-child(2n) { background: #5a2424; }
.a04-noise span:nth-child(3n) { background: #3a1818; }
.a04-cap { font-size: 11.5px; font-weight: 600; margin: 0; }
.a04-cap-chaos { color: var(--brand-negative); }
.a04-calm { background: var(--bg-default); border: 1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent); overflow: hidden; }
.a04-glow { position: absolute; inset: 0; background: radial-gradient(circle at center, color-mix(in srgb, var(--brand-primary) 18%, transparent) 0%, transparent 70%); pointer-events: none; }
.a04-quote { position: relative; font-family: Georgia, serif; font-size: 18px; font-style: italic; color: var(--text-heading); margin: 0 0 12px; line-height: 1.3; min-height: 80px; }
.a04-cap-calm { color: var(--brand-primary); position: relative; }
.a04-vs { display: flex; align-items: center; color: #fff; }
.a04-vs span { padding: 8px 14px; background: linear-gradient(135deg, var(--brand-primary), #ff8c42); border-radius: 50%; font-size: 12px; font-weight: 800; letter-spacing: 0.1em; }
.a04-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 26px; background: var(--brand-primary); color: #fff; border-radius: 999px; font-size: 14px; font-weight: 700; text-decoration: none; align-self: center; }
@media (max-width: 640px) { .a04 { background: var(--bg-elevated); } .a04-grid { grid-template-columns: 1fr; } .a04-vs { justify-self: center; } }

/* ============================================================
   A05 — RELÓGIO CIRCULAR
   ============================================================ */
.a05 { background: linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-base) 100%); }
.a05-grid { display: grid; grid-template-columns: 220px 1fr; gap: 40px; align-items: center; max-width: 720px; }
.a05-ring { width: 220px; height: 220px; }
.a05-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.22em; color: var(--text-muted); margin: 0 0 10px; }
.a05-old { font-family: Georgia, serif; font-size: clamp(36px, 5vw, 52px); font-weight: 300; color: var(--text-heading); margin: 0 0 14px; letter-spacing: -0.03em; }
.a05-mid { font-size: 15px; color: var(--text-body); margin: 0 0 22px; line-height: 1.55; }
.a05-mid em { font-style: italic; color: var(--brand-primary); font-weight: 600; }
.a05-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 26px; background: var(--text-heading); color: var(--bg-default); border-radius: 999px; font-size: 14px; font-weight: 600; text-decoration: none; }
@media (max-width: 640px) { .a05-grid { grid-template-columns: 1fr; justify-items: center; text-align: center; } }

/* ============================================================
   A06 — BRUTAL PRETO + RISCADO
   ============================================================ */
.a06 { background: #000; color: #fff; padding: 56px 32px; }
.a06-shell { max-width: 480px; text-align: center; }
.a06-strike { list-style: none; padding: 0; margin: 0 0 20px; }
.a06-strike li { position: relative; font-family: Georgia, serif; font-size: clamp(18px, 2vw, 24px); color: rgba(255,255,255,0.5); padding: 6px 0; }
.a06-line { position: absolute; top: 50%; left: 0; right: 0; width: 100%; height: 20px; transform: translateY(-50%); }
.a06-eq { font-family: Georgia, serif; font-size: 48px; color: var(--brand-primary); margin: 8px 0; }
.a06-result { font-family: Georgia, serif; font-size: clamp(28px, 4vw, 38px); color: #fff; margin: 0 0 28px; font-weight: 400; }
.a06-result em { font-style: italic; color: var(--brand-primary); }
.a06-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 30px; background: var(--brand-primary); color: #000; border-radius: 6px; font-size: 14.5px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 0.06em; }

/* ============================================================
   A07 — JORNAL SEPIA
   ============================================================ */
.a07 { background: #f5ecdc; padding: 40px; }
.a07-paper { max-width: 640px; background: #fbf5e8; padding: 40px 44px; border: 1px solid #d9c9a3; border-radius: 4px; box-shadow: 0 12px 32px -8px rgba(120,90,30,0.15); position: relative; }
.a07-paper::before, .a07-paper::after { content: ''; position: absolute; left: 0; right: 0; height: 1px; background: #2a1810; }
.a07-paper::before { top: 22px; }
.a07-paper::after { top: 26px; height: 0.5px; }
.a07-masthead { font-family: Georgia, serif; font-size: 26px; font-weight: 700; letter-spacing: 0.06em; color: #2a1810; margin: 6px 0 8px; text-transform: uppercase; }
.a07-masthead span { font-size: 11px; font-weight: 400; float: right; margin-top: 8px; }
.a07-meta { font-family: Georgia, serif; font-size: 11px; font-style: italic; color: #5a4530; margin: 0 0 28px; letter-spacing: 0.08em; }
.a07-h { font-family: Georgia, serif; font-size: clamp(24px, 3.4vw, 36px); font-weight: 400; font-style: italic; color: #2a1810; margin: 0 0 14px; line-height: 1.15; letter-spacing: -0.015em; }
.a07-deck { font-family: Georgia, serif; font-size: 14px; color: #5a4530; line-height: 1.6; margin: 0 0 18px; }
.a07-deck em { font-style: italic; color: #2a1810; font-weight: 600; }
.a07-rule { height: 1px; background: #d9c9a3; margin: 0 0 14px; }
.a07-byline { display: flex; align-items: center; gap: 8px; font-family: Georgia, serif; font-size: 11px; color: #5a4530; margin: 0 0 18px; }
.a07-byline strong { color: #2a1810; font-weight: 700; }
.a07-r { width: 22px; height: 22px; background: #2a1810; color: #fbf5e8; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; }
.a07-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: #2a1810; color: #fbf5e8; border-radius: 2px; font-size: 12px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; }

/* ============================================================
   A08 — GLASSMORPHISM AURORA
   ============================================================ */
.a08 { background: linear-gradient(135deg, #0a0420 0%, #1a0f2e 100%); }
.a08-blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.7; pointer-events: none; }
.a08-blob-1 { width: 400px; height: 400px; background: #6366f1; top: -100px; left: -100px; }
.a08-blob-2 { width: 350px; height: 350px; background: #ec4899; bottom: -100px; right: 50px; }
.a08-blob-3 { width: 300px; height: 300px; background: var(--brand-warning); top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.4; }
.a08-shell { position: relative; max-width: 680px; }
.a08-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.24em; color: rgba(255,255,255,0.8); margin: 0 0 24px; text-align: center; }
.a08-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 28px; }
.a08-card { padding: 22px; border-radius: 14px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.15); }
.a08-card-old { background: rgba(255,255,255,0.05); }
.a08-card-new { background: rgba(251,191,36,0.12); border-color: rgba(251,191,36,0.4); }
.a08-card-tag { font-size: 10.5px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin: 0 0 14px; }
.a08-card-new .a08-card-tag { color: var(--brand-warning); }
.a08-card-noise { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.a08-card-noise span { aspect-ratio: 1; background: rgba(255,255,255,0.1); border-radius: 2px; }
.a08-card-quote { font-family: Georgia, serif; font-size: 18px; font-style: italic; color: #fff; margin: 0; line-height: 1.3; }
.a08-btn { display: flex; margin: 0 auto; align-items: center; gap: 8px; padding: 13px 26px; background: #fff; color: #0a0420; border-radius: 999px; font-size: 14px; font-weight: 700; text-decoration: none; width: fit-content; }

/* ============================================================
   A09 — CARROSSEL DE AÇÕES + INDICADORES + NEWS
   ============================================================ */
.a09 { background: linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-base) 100%); padding: 40px 32px; }
.a09-ticker-bg { position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-50%); opacity: 0.16; pointer-events: none; mask-image: linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%); -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%); }
.a09-shell { position: relative; text-align: center; max-width: 720px; padding: 32px 28px; background: var(--bg-default); border: 1px solid var(--border-subtle); border-radius: 18px; box-shadow: 0 20px 50px -12px rgba(0,0,0,0.10); }
.a09-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.22em; color: var(--text-muted); margin: 0 0 14px; }
.a09-big { font-family: Georgia, serif; font-size: clamp(56px, 9vw, 88px); font-weight: 300; color: var(--brand-primary); margin: 0; line-height: 0.9; letter-spacing: -0.035em; font-variant-numeric: tabular-nums; }
.a09-mid { font-size: 18px; color: var(--text-body); margin: 14px 0 24px; }
.a09-mid em { font-style: italic; color: var(--text-heading); font-weight: 600; }

/* Indicadores mockados */
.a09-indicators { list-style: none; padding: 0; margin: 0 0 18px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.a09-indicators li { padding: 12px 10px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 10px; }
.a09-ind-label { font-size: 10px; font-weight: 700; letter-spacing: 0.16em; color: var(--text-muted); margin: 0 0 4px; }
.a09-ind-val { font-size: 14px; font-weight: 600; margin: 0; font-variant-numeric: tabular-nums; color: var(--text-heading); }
.a09-ind-val.pos { color: var(--brand-positive); }
.a09-ind-val.neg { color: var(--brand-negative); }
@media (max-width: 600px) { .a09-indicators { grid-template-columns: repeat(3, 1fr); } .a09-indicators li:nth-child(n+4) { display: none; } }

/* Carrossel de news mockado (horizontal scroll snap) */
.a09-news-wrap { margin: 0 -28px 22px; padding: 0 28px; overflow: hidden; position: relative; }
.a09-news-wrap::before, .a09-news-wrap::after { content: ''; position: absolute; top: 0; bottom: 0; width: 28px; z-index: 2; pointer-events: none; }
.a09-news-wrap::before { left: 0; background: linear-gradient(90deg, var(--bg-default) 0%, transparent 100%); }
.a09-news-wrap::after { right: 0; background: linear-gradient(-90deg, var(--bg-default) 0%, transparent 100%); }
.a09-news { list-style: none; padding: 0; margin: 0; display: flex; gap: 10px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
.a09-news::-webkit-scrollbar { display: none; }
.a09-news li { flex: 0 0 220px; padding: 14px 16px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 12px; scroll-snap-align: start; text-align: left; position: relative; }
.a09-news-dot { position: absolute; top: 14px; right: 14px; width: 8px; height: 8px; border-radius: 50%; }
.a09-news-dot-neg { background: var(--brand-negative); }
.a09-news-dot-pos { background: var(--brand-positive); }
.a09-news-source { font-size: 9.5px; font-weight: 700; letter-spacing: 0.16em; color: var(--text-muted); margin: 0 0 6px; }
.a09-news-h { font-size: 12.5px; line-height: 1.35; color: var(--text-heading); margin: 0; font-weight: 500; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

.a09-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 26px; background: var(--brand-primary); color: #fff; border-radius: 999px; font-size: 14px; font-weight: 700; text-decoration: none; }

/* ============================================================
   A10 — EMAIL CLIENT REALISTA
   ============================================================ */
.a10 { background: linear-gradient(180deg, #e8edf5 0%, #d4dceb 100%); }
.a10-window { max-width: 580px; background: #fff; border-radius: 12px; box-shadow: 0 20px 50px -8px rgba(0,0,0,0.18); overflow: hidden; margin: 0 auto 22px; }
.a10-bar { display: flex; align-items: center; gap: 6px; padding: 12px 16px; background: #f5f7fa; border-bottom: 1px solid #e3e8f0; }
.a10-dot { width: 11px; height: 11px; border-radius: 50%; }
.a10-dot-r { background: #ff5f57; }
.a10-dot-y { background: #ffbd2e; }
.a10-dot-g { background: #27c93f; }
.a10-url { margin-left: 14px; font-size: 12px; color: #6c7693; font-family: monospace; }
.a10-content { padding: 8px; }
.a10-row { display: grid; grid-template-columns: 36px 1fr; gap: 12px; padding: 14px 16px; border-radius: 8px; margin-bottom: 2px; }
.a10-row-active { background: rgba(255,184,76,0.10); border: 1px solid rgba(255,184,76,0.32); }
.a10-row-faded { opacity: 0.5; }
.a10-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--brand-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
.a10-avatar-2 { background: #1e3a8a; }
.a10-avatar-3 { background: #0f766e; }
.a10-info { min-width: 0; }
.a10-from { display: flex; justify-content: space-between; font-size: 13px; color: #2d3748; margin: 0 0 4px; }
.a10-from strong { font-weight: 700; }
.a10-from span { font-size: 11px; color: #8b94a8; font-variant-numeric: tabular-nums; }
.a10-subject { font-size: 14px; font-weight: 600; color: #1a202c; margin: 0 0 3px; }
.a10-preview { font-size: 12px; color: #6c7693; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.a10-btn { display: flex; align-items: center; gap: 8px; padding: 13px 26px; background: #1a202c; color: #fff; border-radius: 999px; font-size: 14px; font-weight: 600; text-decoration: none; margin: 0 auto; width: fit-content; }

/* ============================================================
   B01 — TERMINAL BLOOMBERG
   ============================================================ */
.b01 { background: #0a0e0a; padding: 40px; }
.b01-scanline { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(132,204,22,0.03) 3px, rgba(132,204,22,0.03) 4px); pointer-events: none; }
.b01-shell { position: relative; font-family: 'SF Mono', Menlo, monospace; max-width: 540px; }
.b01-prompt { font-size: 13px; color: #84cc16; margin: 0 0 18px; }
.b01-blink { animation: b01-blink 1s step-end infinite; color: #84cc16; }
@keyframes b01-blink { 50% { opacity: 0; } }
.b01-h { font-family: 'SF Mono', Menlo, monospace; font-size: clamp(36px, 5vw, 52px); font-weight: 500; color: #fff; margin: 0 0 24px; line-height: 1; letter-spacing: -0.02em; }
.b01-h em { font-style: normal; color: #84cc16; font-weight: 600; }
.b01-list { list-style: none; padding: 0; margin: 0 0 26px; }
.b01-list li { font-size: 14px; color: #84cc16; padding: 5px 0; display: flex; gap: 10px; }
.b01-list li span { color: #fff; }
.b01-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; background: #84cc16; color: #0a0e0a; border-radius: 4px; font-size: 13px; font-weight: 700; text-decoration: none; font-family: 'SF Mono', Menlo, monospace; }

/* ============================================================
   B02 — GRID 1.244 PONTOS
   ============================================================ */
.b02 { background: var(--bg-base); padding: 40px; }
.b02-grid { position: absolute; inset: 20px; display: grid; grid-template-columns: repeat(24, 1fr); gap: 6px; pointer-events: none; opacity: 0.35; }
.b02-grid span { aspect-ratio: 1; background: var(--text-muted); border-radius: 50%; opacity: 0.5; }
.b02-grid .b02-hot { background: var(--brand-primary); opacity: 1; box-shadow: 0 0 12px var(--brand-primary); animation: b02-pulse 2s ease-in-out infinite; }
@keyframes b02-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.6); } }
.b02-shell { position: relative; text-align: center; max-width: 540px; padding: 32px; background: var(--bg-default); border: 1px solid var(--border-default); border-radius: 14px; box-shadow: 0 16px 40px -8px rgba(0,0,0,0.1); }
.b02-h { font-family: Georgia, serif; font-size: clamp(30px, 4.4vw, 40px); font-weight: 300; color: var(--text-heading); margin: 0 0 14px; letter-spacing: -0.025em; }
.b02-h em { font-style: italic; color: var(--brand-primary); }
.b02-sub { font-size: 15px; color: var(--text-body); margin: 0 0 22px; }
.b02-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 26px; background: var(--brand-primary); color: #fff; border-radius: 999px; font-size: 14px; font-weight: 700; text-decoration: none; }

/* ============================================================
   B03 — BLUEPRINT X-RAY
   ============================================================ */
.b03 { background: #0a1628; padding: 0; }
.b03-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(96,165,250,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.08) 1px, transparent 1px); background-size: 24px 24px; }
.b03-schematic { position: absolute; top: 20px; right: 20px; width: 280px; height: auto; pointer-events: none; opacity: 0.6; }
.b03-shell { position: relative; max-width: 480px; padding: 56px 40px; }
.b03-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.24em; color: #60a5fa; margin: 0 0 16px; font-family: monospace; }
.b03-h { font-family: Georgia, serif; font-size: clamp(28px, 4vw, 40px); font-weight: 300; color: #fff; margin: 0 0 24px; line-height: 1.1; letter-spacing: -0.025em; }
.b03-h em { font-style: italic; color: #60a5fa; }
.b03-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; background: rgba(96,165,250,0.12); border: 1px solid #60a5fa; color: #60a5fa; border-radius: 4px; font-size: 13.5px; font-weight: 700; text-decoration: none; font-family: monospace; }

/* ============================================================
   B04 — PROFUNDIDADE CINEMÁTICA
   ============================================================ */
.b04 { background: radial-gradient(circle at 30% 50%, #1f2937 0%, #0f172a 100%); padding: 40px; }
.b04-stack { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.b04-layer { position: absolute; width: 60%; height: 70%; border-radius: 18px; border: 1px solid; }
.b04-l1 { background: rgba(255,184,76,0.08); border-color: rgba(255,184,76,0.18); transform: translate(-80px, -40px) rotate(-3deg); }
.b04-l2 { background: rgba(255,184,76,0.12); border-color: rgba(255,184,76,0.24); transform: translate(-30px, -10px) rotate(-1deg); }
.b04-l3 { background: rgba(255,184,76,0.16); border-color: rgba(255,184,76,0.3); transform: translate(20px, 20px) rotate(1deg); }
.b04-l4 { background: rgba(255,184,76,0.2); border-color: rgba(255,184,76,0.36); transform: translate(70px, 50px) rotate(3deg); }
.b04-shell { position: relative; text-align: center; max-width: 580px; }
.b04-h { font-family: Georgia, serif; font-size: clamp(32px, 4.6vw, 44px); font-weight: 400; color: #fff; margin: 0 0 28px; letter-spacing: -0.025em; }
.b04-h em { font-style: italic; color: var(--brand-primary); }
.b04-counts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
.b04-counts > div { padding: 22px; background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; display: flex; flex-direction: column; }
.b04-counts strong { font-family: Georgia, serif; font-size: 32px; font-weight: 400; color: var(--brand-primary); margin-bottom: 4px; font-variant-numeric: tabular-nums; }
.b04-counts span { font-size: 10.5px; font-weight: 700; letter-spacing: 0.16em; color: rgba(255,255,255,0.6); }
.b04-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 26px; background: var(--brand-primary); color: #0f172a; border-radius: 999px; font-size: 14px; font-weight: 700; text-decoration: none; }

/* ============================================================
   B05 — BADGE HOLOGRÁFICO
   ============================================================ */
.b05 { background: linear-gradient(135deg, #0c0a1f 0%, #1a1240 100%); padding: 40px; }
.b05-shell { text-align: center; max-width: 560px; }
.b05-badge { width: 110px; height: 110px; margin: 0 auto 28px; border-radius: 28px; padding: 3px; background: linear-gradient(135deg, var(--brand-warning), #f0598d, #818cf8, var(--brand-warning)); background-size: 200% 200%; animation: b05-shimmer 4s linear infinite; position: relative; box-shadow: 0 20px 50px -10px rgba(251,191,36,0.4); }
@keyframes b05-shimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
.b05-badge-inner { width: 100%; height: 100%; background: #1a1240; border-radius: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
.b05-badge-inner :deep(svg) { color: var(--brand-warning); }
.b05-badge-text { font-size: 12px; font-weight: 800; letter-spacing: 0.22em; color: #fff; margin: 0; }
.b05-h { font-family: Georgia, serif; font-size: clamp(30px, 4.4vw, 42px); font-weight: 300; color: #fff; margin: 0 0 14px; letter-spacing: -0.025em; }
.b05-h em { font-style: italic; background: linear-gradient(135deg, var(--brand-warning), #f0598d); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.b05-sub { font-size: 15px; color: rgba(255,255,255,0.7); margin: 0 0 26px; line-height: 1.5; }
.b05-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 26px; background: linear-gradient(135deg, var(--brand-warning), #f0598d); color: #1a1240; border-radius: 999px; font-size: 14px; font-weight: 700; text-decoration: none; }

/* ============================================================
   B06 — PIPELINE COM FLUXO
   ============================================================ */
.b06 { background: linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-base) 100%); padding: 40px; }
.b06-shell { max-width: 720px; text-align: center; }
.b06-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.22em; color: var(--brand-primary); margin: 0 0 28px; }
.b06-pipeline { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 32px; flex-wrap: wrap; }
.b06-node { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.b06-circle { width: 90px; height: 90px; border-radius: 50%; background: var(--bg-default); border: 2px solid var(--border-default); display: flex; align-items: center; justify-content: center; font-family: Georgia, serif; font-size: 22px; font-weight: 400; color: var(--text-body); font-variant-numeric: tabular-nums; }
.b06-circle-final { background: var(--brand-primary); border-color: var(--brand-primary); color: #fff; box-shadow: 0 12px 30px -8px color-mix(in srgb, var(--brand-primary) 50%, transparent); }
.b06-node p { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted); margin: 0; }
.b06-flow { display: flex; gap: 4px; align-items: center; padding: 0 4px; }
.b06-flow span { width: 6px; height: 6px; border-radius: 50%; background: var(--brand-primary); opacity: 0.4; animation: b06-flow 1.5s ease-in-out infinite; }
.b06-flow span:nth-child(2) { animation-delay: 0.2s; }
.b06-flow span:nth-child(3) { animation-delay: 0.4s; }
@keyframes b06-flow { 0%,100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
.b06-btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 26px; background: var(--brand-primary); color: #fff; border-radius: 999px; font-size: 14px; font-weight: 700; text-decoration: none; }

/* ============================================================
   B07 — DASHBOARD MOCK REALISTA
   ============================================================ */
.b07 { background: linear-gradient(135deg, #1e1b4b 0%, #0c0a1f 100%); padding: 40px; }
.b07-shell { display: grid; grid-template-columns: 1fr 1fr; gap: 36px; align-items: center; max-width: 800px; }
.b07-left {}
.b07-h { font-family: Georgia, serif; font-size: clamp(26px, 3.6vw, 34px); font-weight: 400; color: #fff; margin: 0 0 14px; letter-spacing: -0.022em; }
.b07-h em { font-style: italic; color: var(--brand-warning); }
.b07-sub { font-size: 14px; color: rgba(255,255,255,0.7); margin: 0 0 22px; line-height: 1.55; }
.b07-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; background: var(--brand-warning); color: #1e1b4b; border-radius: 999px; font-size: 13.5px; font-weight: 700; text-decoration: none; }
.b07-mock { padding: 18px; background: rgba(255,255,255,0.06); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; }
.b07-mock-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; }
.b07-mock-num { font-family: Georgia, serif; font-size: 22px; font-weight: 400; color: #fff; margin: 0; font-variant-numeric: tabular-nums; }
.b07-mock-pct { font-size: 13px; color: var(--brand-positive); font-weight: 700; margin: 0; }
.b07-mock-chart { display: block; width: 100%; height: 64px; margin-bottom: 12px; }
.b07-mock-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.b07-mock-grid > div { padding: 8px; background: rgba(255,255,255,0.05); border-radius: 6px; }
.b07-mock-grid p:first-child { font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.5); margin: 0; }
.b07-mock-grid strong { font-size: 14px; color: #fff; font-weight: 600; font-variant-numeric: tabular-nums; }
@media (max-width: 640px) { .b07-shell { grid-template-columns: 1fr; } }

/* ============================================================
   B08 — MOSAICO NUMÉRICO
   ============================================================ */
.b08 { background: linear-gradient(135deg, var(--bg-base) 0%, var(--bg-elevated) 100%); padding: 40px; }
.b08-shell { max-width: 680px; }
.b08-h { font-family: Georgia, serif; font-size: clamp(28px, 4vw, 36px); font-weight: 300; color: var(--text-heading); margin: 0 0 24px; letter-spacing: -0.025em; text-align: center; }
.b08-h em { font-style: italic; color: var(--brand-primary); }
.b08-mosaic { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 28px; }
.b08-tile { padding: 22px; border-radius: 12px; display: flex; flex-direction: column; gap: 4px; }
.b08-tile-1 { background: color-mix(in srgb, var(--brand-primary) 14%, var(--bg-default)); }
.b08-tile-2 { background: color-mix(in srgb, #d97706 14%, var(--bg-default)); }
.b08-tile-3 { background: color-mix(in srgb, #8b5cf6 14%, var(--bg-default)); }
.b08-tile-4 { background: color-mix(in srgb, var(--brand-positive) 14%, var(--bg-default)); }
.b08-tile-5 { background: color-mix(in srgb, #2563eb 14%, var(--bg-default)); }
.b08-tile-6 { background: color-mix(in srgb, #ec4899 14%, var(--bg-default)); }
.b08-tile strong { font-family: Georgia, serif; font-size: 30px; font-weight: 400; color: var(--text-heading); font-variant-numeric: tabular-nums; }
.b08-tile span { font-size: 10.5px; font-weight: 700; letter-spacing: 0.16em; color: var(--text-muted); }
.b08-btn { display: flex; align-items: center; gap: 8px; padding: 13px 26px; background: var(--text-heading); color: var(--bg-default); border-radius: 999px; font-size: 14px; font-weight: 700; text-decoration: none; margin: 0 auto; width: fit-content; }
@media (max-width: 640px) { .b08-mosaic { grid-template-columns: repeat(2, 1fr); } }

/* ============================================================
   B09 — CHECKLIST GRADIENT TEAL
   ============================================================ */
.b09 { background: linear-gradient(135deg, #042f2e 0%, #064e3b 100%); padding: 40px; }
.b09-glow { position: absolute; bottom: -200px; right: -100px; width: 500px; height: 500px; background: radial-gradient(circle, rgba(52,211,153,0.4) 0%, transparent 60%); filter: blur(60px); pointer-events: none; }
.b09-shell { position: relative; max-width: 560px; }
.b09-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.22em; color: #34d399; margin: 0 0 16px; text-align: center; }
.b09-checks { list-style: none; padding: 0; margin: 0 0 22px; }
.b09-checks li { display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: rgba(255,255,255,0.06); border: 1px solid rgba(52,211,153,0.24); border-radius: 12px; margin-bottom: 8px; font-size: 14.5px; color: #fff; backdrop-filter: blur(10px); }
.b09-checks li :deep(svg) { color: #34d399; flex-shrink: 0; }
.b09-then { font-family: Georgia, serif; font-size: clamp(22px, 3vw, 26px); color: #fff; margin: 0 0 26px; text-align: center; font-style: italic; }
.b09-btn { display: flex; align-items: center; gap: 8px; padding: 13px 26px; background: #34d399; color: #042f2e; border-radius: 999px; font-size: 14px; font-weight: 700; text-decoration: none; margin: 0 auto; width: fit-content; }

/* ============================================================
   B10 — TOGGLE TÁTIL
   ============================================================ */
.b10 { background: linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-base) 100%); padding: 40px; }
.b10-shell { text-align: center; max-width: 480px; }
.b10-eyebrow { font-size: 12px; color: var(--text-muted); margin: 0 0 24px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; }
.b10-switch { position: relative; display: inline-flex; align-items: stretch; padding: 6px; background: var(--bg-default); border: 1px solid var(--border-default); border-radius: 20px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.06), 0 12px 28px -8px rgba(0,0,0,0.1); margin-bottom: 18px; }
.b10-switch-side { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 18px 32px; border-radius: 14px; text-decoration: none; cursor: pointer; transition: all 200ms; min-width: 130px; }
.b10-switch-side p { font-size: 11px; font-weight: 800; letter-spacing: 0.20em; margin: 0; }
.b10-switch-side-on { background: var(--brand-primary); color: #fff; box-shadow: 0 6px 14px -4px color-mix(in srgb, var(--brand-primary) 50%, transparent); }
.b10-switch-side-off { color: var(--text-body); }
.b10-switch-side-off:hover { background: var(--bg-elevated); color: var(--text-heading); }
.b10-switch-handle { width: 1px; background: var(--border-subtle); margin: 8px 4px; }
.b10-sub { font-size: 12.5px; color: var(--text-muted); margin: 0; }

/* Wrap pro componente MoleculesHomeIntelligenceBanner — só spacing */
.bn-wrap { margin-bottom: 64px; }
</style>

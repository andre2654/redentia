<!--
  V4 — Raio-X (Mercury) — Vue port dos JSX oficiais.

  Estratégia (mesma do home.vue):
    - 2 shells: mobile (.phone.mercury + .m-*) e desktop (.dt.mercury-dt + .d-*)
    - Toggle via @media (min-width: 1024px)
    - Score + radar 9D + grid de dimensões + highlights + ações + comparação
-->
<template>
  <div class="v4">

    <!-- ============ MOBILE SHELL (.phone.mercury) ============ -->
    <div class="phone mercury">
      <div class="m-appbar" style="padding-bottom: 18px;">
        <div style="display:flex; flex-direction:column;">
          <span class="m-label" style="font-size:10px;">Atualizado há 3 dias</span>
          <span style="font-size:22px; font-weight:600; letter-spacing:-.022em; margin-top:4px;">Raio-X</span>
        </div>
        <div class="m-appbar-icons">
          <button class="m-iconbtn m-iconbtn-circle"><UIcon name="i-lucide-refresh-cw" class="size-4" /></button>
          <button class="m-iconbtn m-iconbtn-circle"><UIcon name="i-lucide-info" class="size-4" /></button>
        </div>
      </div>

      <div class="m-scroll">

        <!-- HERO: score + radar -->
        <div class="m-card m-card-lg" style="position:relative; overflow:hidden;">
          <div class="m-label">Redentia Score</div>
          <div class="m-hero-row">
            <div class="m-hero-meta">
              <div class="m-score-row">
                <div class="m-score-num">71</div>
                <div class="m-mut m-score-den">/100</div>
              </div>
              <div class="m-score-delta-row">
                <span class="m-score-chip-pos">↑ +4 no mês</span>
                <span class="m-mut" style="font-size:12px;">era 67</span>
              </div>
            </div>
            <svg :viewBox="`0 0 ${radarMobileSize} ${radarMobileSize}`"
                 :style="{ width: radarMobileSize + 'px', height: radarMobileSize + 'px', flexShrink: 0 }">
              <polygon v-for="(g, gi) in radarGrid(radarMobileSize)" :key="'g'+gi"
                       :points="g" fill="none" stroke="rgba(15,15,14,.08)" stroke-width="1" />
              <line v-for="(a, ai) in radarAxes(radarMobileSize)" :key="'a'+ai"
                    :x1="a.x1" :y1="a.y1" :x2="a.x2" :y2="a.y2"
                    stroke="rgba(15,15,14,.08)" stroke-width="1" />
              <polygon :points="radarShape(radarMobileSize)"
                       fill="rgba(15,140,77,.18)" stroke="#0F8C4D" stroke-width="1.5" stroke-linejoin="round" />
              <circle v-for="(p, pi) in radarPoints(radarMobileSize)" :key="'p'+pi"
                      :cx="p[0]" :cy="p[1]" r="2.5" fill="#0F8C4D" />
            </svg>
          </div>

          <div class="m-hero-sep" />

          <div class="m-hero-counts">
            <div>
              <div class="m-label" style="font-size:10px;">Verdes</div>
              <div class="m-count-num" style="color:#0F8C4D;">3</div>
            </div>
            <div>
              <div class="m-label" style="font-size:10px;">Amarelas</div>
              <div class="m-count-num" style="color:#B7873A;">5</div>
            </div>
            <div>
              <div class="m-label" style="font-size:10px;">Vermelhas</div>
              <div class="m-count-num" style="color:#C4413A;">1</div>
            </div>
          </div>
        </div>

        <!-- SECTION: 9 dimensões -->
        <div class="m-section">
          <span class="title">9 dimensões</span>
          <span class="link">Ordenar →</span>
        </div>
        <div class="m-dim-grid">
          <div v-for="(d, i) in RAIOX_DIMS" :key="i" class="m-dim-card">
            <div class="m-dim-top">
              <span class="m-dim-v" :style="{ color: toneColor(d.tone) }">{{ d.v }}</span>
              <span class="m-dim-dot" :style="{ background: toneColor(d.tone) }" />
            </div>
            <div class="m-dim-k">{{ d.k }}</div>
            <div class="m-dim-bar">
              <div class="m-dim-bar-fill" :style="{ width: d.v + '%', background: toneColor(d.tone) }" />
            </div>
          </div>
        </div>

        <!-- SECTION: Pontos de destaque -->
        <div class="m-section">
          <span class="title">Pontos de destaque</span>
        </div>
        <div class="m-card" style="padding: 4px 22px;">
          <div v-for="(h, i) in highlights" :key="i"
               class="m-hl-row"
               :style="i === highlights.length - 1 ? 'border-bottom:0;' : ''">
            <div class="m-hl-head">
              <span class="m-hl-label" :style="{ color: toneColor(h.kind) }">{{ h.label }}</span>
              <span class="m-hl-v" :style="{ color: toneColor(h.kind) }">{{ h.v }}/100</span>
            </div>
            <div class="m-hl-dim">{{ h.dim }}</div>
            <div class="m-hl-body">{{ h.body }}</div>
          </div>
        </div>

        <!-- SECTION: Ações sugeridas -->
        <div class="m-section">
          <span class="title">Ações sugeridas</span>
          <span class="link">3 ações →</span>
        </div>
        <div class="m-card" style="padding: 4px 0;">
          <div v-for="(a, i) in actions" :key="i"
               class="m-act-sg-row"
               :style="i === actions.length - 1 ? 'border-bottom:0;' : ''">
            <div class="m-act-sg-num">{{ a.n }}</div>
            <div class="m-act-sg-meta">
              <div class="m-act-sg-head">
                <span class="m-act-sg-title">{{ a.title }}</span>
                <span class="m-act-sg-impact">{{ a.impact }}</span>
              </div>
              <div class="m-act-sg-body">{{ a.body }}</div>
            </div>
          </div>
        </div>

        <!-- SECTION: Comparação -->
        <div class="m-section">
          <span class="title">Comparação</span>
          <span class="link">Detalhes →</span>
        </div>
        <div class="m-card">
          <div class="m-label">Vs. carteiras de perfil similar</div>
          <div style="margin-top:12px;">
            <div v-for="(b, i) in mobileCompare" :key="i" class="m-cmp-row">
              <div class="m-cmp-head">
                <span :class="['m-cmp-label', { highlight: b.highlight }]">{{ b.label }}</span>
                <span :class="['m-cmp-v', { highlight: b.highlight }]">{{ b.v }}/100</span>
              </div>
              <div class="m-cmp-bar">
                <div class="m-cmp-bar-fill"
                     :style="{ width: b.v + '%', background: b.highlight ? '#0F8C4D' : 'rgba(15,15,14,.3)' }" />
              </div>
            </div>
          </div>
          <div class="m-cmp-foot">
            Sua pontuação está <span style="color:#0F8C4D; font-weight:600;">9 pontos acima da mediana</span> de moderados conservadores.
          </div>
        </div>

        <!-- CTA -->
        <div class="m-cta" style="margin-top:24px; margin-bottom:24px;">
          <div>
            <div class="t">Refazer análise</div>
            <div class="s">Última: 3 dias atrás</div>
          </div>
          <div class="m-cta-ic">
            <UIcon name="i-lucide-refresh-cw" class="size-4" />
          </div>
        </div>
      </div>

      <!-- TABBAR -->
      <div class="m-tabbar">
        <NuxtLink v-for="t in mobileTabs" :key="t.label"
                  :to="t.to"
                  class="m-tab"
                  :class="{ active: t.label === 'Raio-X' }">
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
                    :class="{ active: n.label === 'Raio-X' }">
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
              <div class="d-mut" style="font-size:12px; font-weight:500; margin-bottom:6px;">
                Última análise: 3 dias atrás · 9 dimensões
              </div>
              <div class="h">Raio-X da carteira</div>
            </div>
            <div class="actions">
              <div class="d-btn d-btn-ghost">Histórico</div>
              <div class="d-btn">
                <UIcon name="i-lucide-refresh-cw" class="size-3.5" />
                Refazer análise
              </div>
            </div>
          </div>

          <!-- ROW 1: Score + Comparação -->
          <div class="d-row-hero">
            <!-- Score card -->
            <div class="d-card d-score-card">
              <div class="d-score-meta">
                <div class="d-label">Redentia Score</div>
                <div class="d-score-row">
                  <div class="d-score-num">71</div>
                  <div class="d-mut d-score-den">/ 100</div>
                </div>
                <div class="d-score-delta-row">
                  <span class="d-score-chip-pos">↑ +4 no mês</span>
                  <span class="d-mut" style="font-size:13px;">era 67 · perfil moderado</span>
                </div>
                <div class="d-score-counts">
                  <div>
                    <div class="d-label" style="font-size:10px;">Verdes</div>
                    <div class="d-count-num" style="color:#0F8C4D;">3</div>
                  </div>
                  <div>
                    <div class="d-label" style="font-size:10px;">Amarelas</div>
                    <div class="d-count-num" style="color:#B7873A;">5</div>
                  </div>
                  <div>
                    <div class="d-label" style="font-size:10px;">Vermelhas</div>
                    <div class="d-count-num" style="color:#C4413A;">1</div>
                  </div>
                </div>
              </div>
              <svg :viewBox="`0 0 ${radarDesktopSize} ${radarDesktopSize}`"
                   :style="{ width: radarDesktopSize + 'px', height: radarDesktopSize + 'px', flexShrink: 0 }">
                <polygon v-for="(g, gi) in radarGrid(radarDesktopSize)" :key="'dg'+gi"
                         :points="g" fill="none" stroke="rgba(15,15,14,.08)" stroke-width="1" />
                <line v-for="(a, ai) in radarAxes(radarDesktopSize)" :key="'da'+ai"
                      :x1="a.x1" :y1="a.y1" :x2="a.x2" :y2="a.y2"
                      stroke="rgba(15,15,14,.08)" stroke-width="1" />
                <polygon :points="radarShape(radarDesktopSize)"
                         fill="rgba(15,140,77,.18)" stroke="#0F8C4D" stroke-width="1.5" stroke-linejoin="round" />
                <circle v-for="(p, pi) in radarPoints(radarDesktopSize)" :key="'dp'+pi"
                        :cx="p[0]" :cy="p[1]" r="3.2" fill="#0F8C4D" />
              </svg>
            </div>

            <!-- Comparação card -->
            <div class="d-card">
              <div class="d-section-h">
                <span class="title">Comparação com perfil similar</span>
              </div>
              <div class="d-label" style="font-size:11px; margin-top:4px;">Moderados conservadores · n=4.218</div>
              <div style="margin-top:18px;">
                <div v-for="(b, i) in desktopCompare" :key="i" class="d-cmp-row">
                  <div class="d-cmp-head">
                    <span :class="['d-cmp-label', { highlight: b.highlight }]">{{ b.label }}</span>
                    <span :class="['d-cmp-v', { highlight: b.highlight }]">{{ b.v }}/100</span>
                  </div>
                  <div class="d-cmp-bar">
                    <div class="d-cmp-bar-fill"
                         :style="{ width: b.v + '%', background: b.highlight ? '#0F8C4D' : 'rgba(15,15,14,.3)' }" />
                  </div>
                </div>
              </div>
              <div class="d-cmp-note">
                Sua pontuação está <b style="color:#0F8C4D;">9 pontos acima da mediana</b> e 4 pontos do top 25%.
              </div>
            </div>
          </div>

          <!-- ROW 2: 9 dimensões -->
          <div class="d-card">
            <div class="d-section-h">
              <span class="title">9 dimensões</span>
              <span class="link">Ordenar →</span>
            </div>
            <div class="d-dim-grid">
              <div v-for="(d, i) in RAIOX_DIMS" :key="i" class="d-dim-card">
                <div class="d-dim-top">
                  <div>
                    <div class="d-dim-k">{{ d.k }}</div>
                    <div class="d-dim-insight">{{ d.insight }}</div>
                  </div>
                  <div class="d-dim-v-wrap">
                    <span class="d-dim-v" :style="{ color: toneColor(d.tone) }">{{ d.v }}</span>
                    <span class="d-dim-den">/100</span>
                  </div>
                </div>
                <div class="d-dim-bar">
                  <div class="d-dim-bar-fill" :style="{ width: d.v + '%', background: toneColor(d.tone) }" />
                </div>
              </div>
            </div>
          </div>

          <!-- ROW 3: Highlights + Actions -->
          <div class="d-row-hl">
            <div class="d-card">
              <div class="d-section-h">
                <span class="title">Pontos de destaque</span>
              </div>
              <div style="margin-top:4px;">
                <div v-for="(h, i) in highlights" :key="i"
                     class="d-hl-row"
                     :style="i === highlights.length - 1 ? 'border-bottom:0;' : ''">
                  <div class="d-hl-head">
                    <span class="d-hl-label" :style="{ color: toneColor(h.kind) }">{{ h.label }}</span>
                    <span class="d-hl-v" :style="{ color: toneColor(h.kind) }">{{ h.v }}/100</span>
                  </div>
                  <div class="d-hl-dim">{{ h.dim }}</div>
                  <div class="d-hl-body">{{ h.body }}</div>
                </div>
              </div>
            </div>

            <div class="d-card">
              <div class="d-section-h">
                <span class="title">Ações sugeridas</span>
                <span class="link">3 ações · +18 pts →</span>
              </div>
              <div class="d-act-sg-wrap">
                <div v-for="(a, i) in actions" :key="i"
                     class="d-act-sg-row"
                     :style="i === actions.length - 1 ? 'border-bottom:0;' : ''">
                  <div class="d-act-sg-num">{{ a.n }}</div>
                  <div class="d-act-sg-meta">
                    <div class="d-act-sg-head">
                      <span class="d-act-sg-title">{{ a.title }}</span>
                      <span class="d-act-sg-impact">{{ a.impact }}</span>
                    </div>
                    <div class="d-act-sg-body">{{ a.body }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ROW 4: Score trend -->
          <div class="d-card">
            <div class="d-section-h">
              <span class="title">Evolução do score</span>
              <span class="link">Ver histórico →</span>
            </div>
            <div class="d-label" style="font-size:11px; margin-top:4px;">Últimos 6 meses</div>
            <div class="d-trend-wrap">
              <svg viewBox="0 0 1000 150" preserveAspectRatio="none" style="width:100%; height:100%; display:block;">
                <defs>
                  <linearGradient id="trendg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#0F8C4D" stop-opacity="0.22" />
                    <stop offset="100%" stop-color="#0F8C4D" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <line v-for="(g, gi) in trendGridLines" :key="'tg'+gi"
                      :x1="20" :x2="980" :y1="g" :y2="g"
                      stroke="rgba(15,15,14,.06)" stroke-dasharray="2 4" />
                <path :d="trendArea" fill="url(#trendg)" />
                <path :d="trendPath" fill="none" stroke="#0F8C4D" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round" />
                <g v-for="(p, pi) in trendPoints" :key="'tp'+pi">
                  <circle :cx="p.x" :cy="p.y" :r="pi === trendPoints.length - 1 ? 5 : 3"
                          fill="#0F8C4D" stroke="#fff" stroke-width="2" />
                  <text :x="p.x" :y="p.y - 12" text-anchor="middle"
                        font-family="Inter" font-size="11" font-weight="600" fill="#0F0F0E">{{ p.v }}</text>
                  <text :x="p.x" y="144" text-anchor="middle"
                        font-family="IBM Plex Mono" font-size="9" letter-spacing=".06em"
                        :fill="pi === trendPoints.length - 1 ? '#0F0F0E' : 'rgba(15,15,14,.45)'"
                        :font-weight="pi === trendPoints.length - 1 ? 600 : 500">{{ p.m }}</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

definePageMeta({ layout: false })

const RAIOX_DIMS = [
  { k: 'Diversificação', v: 88, tone: 'pos', insight: '12 setores · HHI 0,17' },
  { k: 'Liquidez',       v: 83, tone: 'pos', insight: '95% saída em 1 dia' },
  { k: 'Resiliência',    v: 82, tone: 'pos', insight: 'beta 0,71 vs IBOV' },
  { k: 'Concentração',   v: 74, tone: 'mid', insight: 'Bancos = 18% do total' },
  { k: 'Cambial',        v: 71, tone: 'mid', insight: '12% em USD' },
  { k: 'Qualidade',      v: 66, tone: 'mid', insight: 'ROE médio 14%' },
  { k: 'Renda',          v: 65, tone: 'mid', insight: 'DY ponderado 7,8% a.a.' },
  { k: 'Volatilidade',   v: 66, tone: 'mid', insight: 'σ 14,2% · 12m' },
  { k: 'Crescimento',    v: 36, tone: 'neg', insight: '2,8% em setores growth' },
]

const radarMobileSize = 120
const radarDesktopSize = 220

function toneColor(t: string) {
  if (t === 'pos') return '#0F8C4D'
  if (t === 'neg') return '#C4413A'
  return '#B7873A'
}

function radarGrid(size: number) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 8
  const n = RAIOX_DIMS.length
  return [0.33, 0.66, 1].map(f => {
    const rr = r * f
    const pts = []
    for (let k = 0; k < n; k++) {
      const ang = -Math.PI / 2 + (k / n) * Math.PI * 2
      pts.push([cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr])
    }
    return pts.map(p => p.join(',')).join(' ')
  })
}

function radarAxes(size: number) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 8
  const n = RAIOX_DIMS.length
  return RAIOX_DIMS.map((_, i) => {
    const ang = -Math.PI / 2 + (i / n) * Math.PI * 2
    return { x1: cx, y1: cy, x2: cx + Math.cos(ang) * r, y2: cy + Math.sin(ang) * r }
  })
}

function radarPoints(size: number): [number, number][] {
  const cx = size / 2, cy = size / 2, r = size / 2 - 8
  const n = RAIOX_DIMS.length
  return RAIOX_DIMS.map((d, i) => {
    const ang = -Math.PI / 2 + (i / n) * Math.PI * 2
    const rr = (d.v / 100) * r
    return [cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr]
  })
}

function radarShape(size: number) {
  return radarPoints(size).map(p => p.join(',')).join(' ')
}

const highlights = [
  { kind: 'pos', label: 'Maior força',  dim: 'Diversificação', v: '88', body: 'Sua carteira está bem distribuída entre 12 setores diferentes.' },
  { kind: 'mid', label: 'Oportunidade', dim: 'Renda',          v: '65', body: 'DY de 7,8% a.a., pode subir com mais FIIs de papel.' },
  { kind: 'neg', label: 'Atenção',      dim: 'Crescimento',    v: '36', body: 'Exposição baixa a setores de crescimento (tech, healthcare).' },
]

const actions = [
  { n: '1', title: 'Reduzir bancos',         impact: '+9 pts', body: 'ITUB4 + BBDC4 = 18% das ações BR' },
  { n: '2', title: 'Adicionar growth',       impact: '+6 pts', body: 'Considere ETF tech ou healthcare (10% da carteira)' },
  { n: '3', title: 'Aumentar FIIs de papel', impact: '+3 pts', body: 'Spread CDI+ acima da média histórica' },
]

const mobileCompare = [
  { label: 'Você',    v: 71, highlight: true },
  { label: 'Mediana', v: 62, highlight: false },
  { label: 'Top 10%', v: 84, highlight: false },
]
const desktopCompare = [
  { label: 'Você',       v: 71, highlight: true },
  { label: 'Top 10%',    v: 84, highlight: false },
  { label: 'Mediana',    v: 62, highlight: false },
  { label: 'Top 25%',    v: 75, highlight: false },
  { label: 'Bottom 25%', v: 48, highlight: false },
]

const navMain = [
  { label: 'Início',     icon: 'i-lucide-house',    to: '/dev/mobile-layouts/v4/home' },
  { label: 'Carteira',   icon: 'i-lucide-wallet',   to: '/dev/mobile-layouts/v4/home' },
  { label: 'Raio-X',     icon: 'i-lucide-radar',    to: '/dev/mobile-layouts/v4/raio-x', badge: 'novo' },
  { label: 'Calendário', icon: 'i-lucide-calendar', to: '/dev/mobile-layouts/v4/home' },
  { label: 'Carta',      icon: 'i-lucide-mail',     to: '/dev/mobile-layouts/v4/home' },
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
  { label: 'Carteira', icon: 'i-lucide-wallet', to: '/dev/mobile-layouts/v4/home' },
  { label: 'Raio-X',   icon: 'i-lucide-radar',  to: '/dev/mobile-layouts/v4/raio-x' },
  { label: 'Mercado',  icon: 'i-lucide-globe',  to: '/dev/mobile-layouts/v4/mercado' },
]

// Score trend chart
const trendData = [
  { m: 'DEZ', v: 61 },
  { m: 'JAN', v: 64 },
  { m: 'FEV', v: 62 },
  { m: 'MAR', v: 67 },
  { m: 'ABR', v: 67 },
  { m: 'MAI', v: 71 },
]
const W = 1000
const H = 130
const padX = 20
const padY = 16
const minV = 50
const maxV = 80

const trendPointsRaw = computed(() => trendData.map((d, i) => [
  padX + (i / (trendData.length - 1)) * (W - padX * 2),
  padY + (1 - (d.v - minV) / (maxV - minV)) * (H - padY * 2),
] as [number, number]))

function smoothPath(points: [number, number][]) {
  if (points.length < 2) return ''
  let d = `M${points[0][0]},${points[0][1]}`
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1]
    const p1 = points[i]
    const cx = (p0[0] + p1[0]) / 2
    d += ` Q${p0[0]},${p0[1]} ${cx},${(p0[1] + p1[1]) / 2}`
    d += ` Q${p1[0]},${p1[1]} ${p1[0]},${p1[1]}`
  }
  return d
}

const trendPath = computed(() => smoothPath(trendPointsRaw.value))
const trendArea = computed(() => {
  const pts = trendPointsRaw.value
  return trendPath.value + ` L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`
})

const trendGridLines = computed(() => [60, 70, 80].map(v =>
  padY + (1 - (v - minV) / (maxV - minV)) * (H - padY * 2),
))

const trendPoints = computed(() => trendPointsRaw.value.map((p, i) => ({
  x: p[0],
  y: p[1],
  v: trendData[i].v,
  m: trendData[i].m,
})))
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

/* ============ MOBILE (.phone.mercury) ============ */
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

/* HERO */
.phone.mercury .m-hero-row {
  display: flex; align-items: flex-start; gap: 18px;
  margin-top: 10px;
}
.phone.mercury .m-hero-meta { flex: 1; min-width: 0; }
.phone.mercury .m-score-row {
  display: flex; align-items: baseline; gap: 6px;
}
.phone.mercury .m-score-num {
  font-size: 64px; font-weight: 600; letter-spacing: -.035em;
  line-height: 1; color: #0F0F0E;
  font-variant-numeric: tabular-nums;
}
.phone.mercury .m-score-den { font-size: 18px; font-weight: 500; }
.phone.mercury .m-score-delta-row {
  display: flex; align-items: center; gap: 8px; margin-top: 14px;
}
.phone.mercury .m-score-chip-pos {
  padding: 3px 9px; border-radius: 6px;
  background: rgba(15,140,77,.10); color: #0F8C4D;
  font-size: 11px; font-weight: 600;
}
.phone.mercury .m-hero-sep {
  height: 1px; background: rgba(15,15,14,.06);
  margin: 18px -20px 14px;
}
.phone.mercury .m-hero-counts {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;
}
.phone.mercury .m-count-num {
  font-size: 18px; font-weight: 600; margin-top: 4px;
  font-variant-numeric: tabular-nums;
}

/* DIM GRID */
.phone.mercury .m-dim-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 8px; padding: 0 16px;
}
.phone.mercury .m-dim-card {
  background: #FFFFFF;
  border: 1px solid rgba(15,15,14,.05);
  border-radius: 12px;
  padding: 12px 12px 10px;
}
.phone.mercury .m-dim-top {
  display: flex; align-items: baseline; justify-content: space-between;
  margin-bottom: 8px;
}
.phone.mercury .m-dim-v {
  font-size: 18px; font-weight: 600; letter-spacing: -.02em;
  font-variant-numeric: tabular-nums;
}
.phone.mercury .m-dim-dot {
  width: 6px; height: 6px; border-radius: 50%;
}
.phone.mercury .m-dim-k {
  font-size: 11px; font-weight: 600;
  letter-spacing: -.003em; line-height: 1.2;
  margin-bottom: 6px;
}
.phone.mercury .m-dim-bar {
  height: 3px; background: rgba(15,15,14,.05);
  border-radius: 2px; overflow: hidden;
}
.phone.mercury .m-dim-bar-fill {
  height: 100%; border-radius: 2px; opacity: .7;
}

/* HIGHLIGHTS */
.phone.mercury .m-hl-row {
  padding: 14px 0;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.phone.mercury .m-hl-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6px;
}
.phone.mercury .m-hl-label {
  font-size: 10px; font-weight: 600;
  letter-spacing: .08em; text-transform: uppercase;
}
.phone.mercury .m-hl-v {
  font-size: 14px; font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.phone.mercury .m-hl-dim {
  font-size: 14px; font-weight: 600;
  letter-spacing: -.005em; margin-bottom: 4px;
}
.phone.mercury .m-hl-body {
  font-size: 12px; color: rgba(15,15,14,.55); line-height: 1.4;
}

/* ACTIONS */
.phone.mercury .m-act-sg-row {
  display: flex; gap: 12px; align-items: flex-start;
  padding: 14px 22px;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.phone.mercury .m-act-sg-num {
  width: 28px; height: 28px; border-radius: 50%;
  background: #0F0F0E; color: #FFFFFF;
  display: grid; place-items: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px; font-weight: 600;
  flex-shrink: 0;
}
.phone.mercury .m-act-sg-meta { flex: 1; min-width: 0; }
.phone.mercury .m-act-sg-head {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 8px;
}
.phone.mercury .m-act-sg-title {
  font-size: 14px; font-weight: 600; letter-spacing: -.005em;
}
.phone.mercury .m-act-sg-impact {
  padding: 2px 7px; border-radius: 5px;
  background: rgba(15,140,77,.10); color: #0F8C4D;
  font-size: 11px; font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.phone.mercury .m-act-sg-body {
  font-size: 12px; color: rgba(15,15,14,.55);
  margin-top: 3px; line-height: 1.4;
}

/* COMPARE */
.phone.mercury .m-cmp-row { padding: 8px 0; }
.phone.mercury .m-cmp-head {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 5px;
}
.phone.mercury .m-cmp-label {
  font-size: 13px; font-weight: 500; color: rgba(15,15,14,.6);
}
.phone.mercury .m-cmp-label.highlight { font-weight: 600; color: #0F0F0E; }
.phone.mercury .m-cmp-v {
  font-size: 13px; font-weight: 500; color: rgba(15,15,14,.6);
  font-variant-numeric: tabular-nums;
}
.phone.mercury .m-cmp-v.highlight { font-weight: 600; color: #0F8C4D; }
.phone.mercury .m-cmp-bar {
  height: 4px; background: rgba(15,15,14,.05);
  border-radius: 2px; overflow: hidden;
}
.phone.mercury .m-cmp-bar-fill { height: 100%; border-radius: 2px; }
.phone.mercury .m-cmp-foot {
  font-size: 12px; color: rgba(15,15,14,.55);
  margin-top: 14px; line-height: 1.4;
}

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
.phone.mercury .m-cta-ic {
  display: grid; place-items: center;
  width: 38px; height: 38px;
  border-radius: 50%;
  background: rgba(255,255,255,.1);
  color: #fff;
}

/* TABBAR */
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
  text-decoration: none;
}
.phone.mercury .m-tab.active { color: #0F0F0E; }
.phone.mercury .m-tab svg { width: 22px; height: 22px; }
.phone.mercury .m-tab .lbl { font-size: 10px; font-weight: 500; }


/* ============ DESKTOP (.dt.mercury-dt) ============ */
.dt.mercury-dt {
  background: #F8F6F1;
  color: #0F0F0E;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  min-height: 100vh;
  position: relative;
}
.dt .d-mut { color: rgba(15,15,14,.55); }

/* SIDEBAR */
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
  text-decoration: none;
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
.dt .d-iconbtn:hover { background: rgba(15,15,14,.08); }

/* CONTENT */
.dt .d-content {
  padding: 24px 32px 60px;
  display: flex; flex-direction: column; gap: 14px;
}
.dt .d-greet {
  display: flex; justify-content: space-between; align-items: flex-end;
  padding-bottom: 4px;
}
.dt .d-greet .h {
  margin-top: 4px;
  font-size: 26px; font-weight: 600; letter-spacing: -.022em;
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

/* HERO ROW (score + comparação) */
.dt .d-row-hero {
  display: grid; grid-template-columns: 1.2fr 1fr; gap: 14px;
}
.dt .d-score-card {
  padding: 24px 26px;
  display: flex; gap: 24px; align-items: center;
}
.dt .d-score-meta { flex: 1; }
.dt .d-score-row {
  display: flex; align-items: baseline; gap: 8px;
  margin-top: 10px;
}
.dt .d-score-num {
  font-size: 84px; font-weight: 600; letter-spacing: -.035em;
  line-height: 1; color: #0F0F0E;
  font-variant-numeric: tabular-nums;
}
.dt .d-score-den { font-size: 24px; font-weight: 500; }
.dt .d-score-delta-row {
  display: flex; align-items: center; gap: 10px; margin-top: 16px;
}
.dt .d-score-chip-pos {
  padding: 4px 10px; border-radius: 6px;
  background: rgba(15,140,77,.10); color: #0F8C4D;
  font-size: 12px; font-weight: 600;
}
.dt .d-score-counts {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-top: 22px;
}
.dt .d-count-num {
  font-size: 20px; font-weight: 600; margin-top: 4px;
  font-variant-numeric: tabular-nums;
}

/* COMPARE DESKTOP */
.dt .d-cmp-row { padding: 8px 0; }
.dt .d-cmp-head {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 5px;
}
.dt .d-cmp-label {
  font-size: 13px; font-weight: 500; color: rgba(15,15,14,.6);
}
.dt .d-cmp-label.highlight { font-weight: 600; color: #0F0F0E; }
.dt .d-cmp-v {
  font-size: 13px; font-weight: 500; color: rgba(15,15,14,.6);
  font-variant-numeric: tabular-nums;
}
.dt .d-cmp-v.highlight { font-weight: 600; color: #0F8C4D; }
.dt .d-cmp-bar {
  height: 4px; background: rgba(15,15,14,.05);
  border-radius: 2px; overflow: hidden;
}
.dt .d-cmp-bar-fill { height: 100%; border-radius: 2px; }
.dt .d-cmp-note {
  margin-top: 16px; padding: 12px 14px;
  background: rgba(15,140,77,.06);
  border: 1px solid rgba(15,140,77,.18);
  border-radius: 10px;
  font-size: 13px; line-height: 1.4;
}

/* DIM GRID DESKTOP */
.dt .d-dim-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 10px; margin-top: 6px;
}
.dt .d-dim-card {
  background: rgba(15,15,14,.02);
  border: 1px solid rgba(15,15,14,.04);
  border-radius: 12px;
  padding: 14px 16px;
}
.dt .d-dim-top {
  display: flex; align-items: baseline; justify-content: space-between;
  margin-bottom: 10px;
}
.dt .d-dim-k {
  font-size: 13px; font-weight: 600; letter-spacing: -.005em;
}
.dt .d-dim-insight {
  font-size: 11px; color: rgba(15,15,14,.5); margin-top: 3px;
}
.dt .d-dim-v-wrap {
  display: flex; align-items: baseline; gap: 4px;
}
.dt .d-dim-v {
  font-size: 24px; font-weight: 600; letter-spacing: -.025em;
  font-variant-numeric: tabular-nums;
}
.dt .d-dim-den {
  font-size: 11px; color: rgba(15,15,14,.4);
}
.dt .d-dim-bar {
  height: 4px; background: rgba(15,15,14,.05);
  border-radius: 2px; overflow: hidden;
}
.dt .d-dim-bar-fill {
  height: 100%; border-radius: 2px; opacity: .7;
}

/* HIGHLIGHT + ACTIONS ROW */
.dt .d-row-hl {
  display: grid; grid-template-columns: 1fr 1.2fr; gap: 14px;
}
.dt .d-hl-row {
  padding: 14px 0;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.dt .d-hl-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6px;
}
.dt .d-hl-label {
  font-size: 10px; font-weight: 600;
  letter-spacing: .08em; text-transform: uppercase;
}
.dt .d-hl-v {
  font-size: 14px; font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.dt .d-hl-dim {
  font-size: 14px; font-weight: 600;
  letter-spacing: -.005em; margin-bottom: 4px;
}
.dt .d-hl-body {
  font-size: 12px; color: rgba(15,15,14,.55); line-height: 1.4;
}

.dt .d-act-sg-wrap { margin: 4px -22px 0; }
.dt .d-act-sg-row {
  display: flex; gap: 12px; align-items: flex-start;
  padding: 14px 22px;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.dt .d-act-sg-num {
  width: 28px; height: 28px; border-radius: 50%;
  background: #0F0F0E; color: #FFFFFF;
  display: grid; place-items: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px; font-weight: 600;
  flex-shrink: 0;
}
.dt .d-act-sg-meta { flex: 1; min-width: 0; }
.dt .d-act-sg-head {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 8px;
}
.dt .d-act-sg-title {
  font-size: 14px; font-weight: 600; letter-spacing: -.005em;
}
.dt .d-act-sg-impact {
  padding: 2px 7px; border-radius: 5px;
  background: rgba(15,140,77,.10); color: #0F8C4D;
  font-size: 11px; font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.dt .d-act-sg-body {
  font-size: 12px; color: rgba(15,15,14,.55);
  margin-top: 3px; line-height: 1.4;
}

/* TREND CHART */
.dt .d-trend-wrap {
  margin-top: 18px;
  margin-left: -6px; margin-right: -6px;
  height: 140px;
}
</style>

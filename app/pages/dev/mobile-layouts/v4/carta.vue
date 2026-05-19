<!--
  V4 — Mercury · Carta (editorial monthly letter).

  Estrategia: 2 shells separados (mobile + desktop) com namespaces:
    - `.phone.mercury` + `.m-*` para < 1024px
    - `.dt.mercury-dt` + `.d-*` para >= 1024px

  Port direto dos JSX oficiais Mercury (carta-mercury.jsx + carta-mercury-desktop.jsx).
  Adaptado para Vue 3 + Nuxt: `className` -> `class`, inline styles JSX -> :style,
  helpers TocRow / CartaThumb inlineados via v-for sobre arrays.

  Editorial accents: Newsreader italic em ouro #B7873A para signature/numerais romanos.
-->
<template>
  <div class="v4">

    <!-- ============ MOBILE SHELL (.phone.mercury) ============ -->
    <div class="phone mercury">
      <div class="m-appbar" style="padding-bottom: 18px;">
        <div style="display:flex; flex-direction:column;">
          <span class="m-label" style="font-size:10px;">Edicao IV · maio 2026</span>
          <span style="font-size:22px; font-weight:600; letter-spacing:-.022em; margin-top:4px;">Carta</span>
        </div>
        <div style="display:flex; gap:8px;">
          <div class="m-iconbtn m-iconbtn-circle">
            <UIcon name="i-lucide-clock" class="size-4" />
          </div>
          <div class="m-iconbtn m-iconbtn-circle">
            <UIcon name="i-lucide-menu" class="size-4" />
          </div>
        </div>
      </div>

      <div class="m-scroll">

        <!-- Edition cover card (dark + gold radial glow) -->
        <div class="m-card m-cover-card">
          <span class="m-cover-glow" />
          <div style="position:relative;">
            <div class="m-cover-meta">
              <span class="m-cover-edition">EDICAO IV</span>
              <span class="m-cover-month">MAIO · 2026</span>
            </div>
            <div class="m-cover-headline">
              O mes que <span class="gold">petroleo</span> ditou o ritmo.
            </div>
            <div class="m-cover-lead">
              Sua carteira fechou em <b class="m-pos-bright">+2,4%</b>, a frente do IBOV em <b>1,2pp</b>.
            </div>
            <div class="m-cover-tristat">
              <div>
                <div class="m-cover-stat-lbl">RETORNO</div>
                <div class="m-cover-stat-val m-pos-bright">+2,4%</div>
              </div>
              <div>
                <div class="m-cover-stat-lbl">DIVIDENDOS</div>
                <div class="m-cover-stat-val">R$ 487</div>
              </div>
              <div>
                <div class="m-cover-stat-lbl">FATOS</div>
                <div class="m-cover-stat-val">3</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Greeting + lead paragraph -->
        <div style="padding:28px 22px 0;">
          <div class="m-letter-greet">
            Caro <span style="color:#0F0F0E;">Andre,</span>
          </div>
          <div class="m-letter-p">
            <span class="m-dropcap">M</span>aio foi um mes de duas faces. O petroleo deu vida a <b>Petrobras</b> e empurrou
            sua carteira pra cima na primeira quinzena, mas a ata do Copom no fim do mes
            jogou um balde de agua fria nas eletricas e nos bancos. Voce terminou
            <b style="color:#0F8C4D;"> +2,4% no azul</b>, e a frente do IBOV.
          </div>
          <div class="m-letter-p m-letter-p-mut">
            Nesta edicao: analise do mes, o que cair em proventos em junho, e tres
            sugestoes da IA pra ajustar a carteira sem se afobar.
          </div>
        </div>

        <!-- TOC -->
        <div class="m-section">
          <span class="title">Nesta edicao</span>
          <span class="link">15 min de leitura</span>
        </div>
        <div class="m-card m-toc-card">
          <div v-for="(row, i) in tocRows" :key="row.n"
               class="m-toc-row" :class="{ 'is-last': i === tocRows.length - 1 }">
            <div class="m-toc-num">{{ row.n }}</div>
            <div style="flex:1; min-width:0;">
              <div class="m-toc-t">{{ row.t }}</div>
              <div class="m-toc-s">{{ row.s }}</div>
            </div>
            <div class="m-toc-min">{{ row.min.toUpperCase() }}</div>
            <UIcon name="i-lucide-chevron-right" class="size-3 m-toc-chev" />
          </div>
        </div>

        <!-- Pull Quote -->
        <div style="padding:28px 26px 0;">
          <div class="m-quote">
            "A carteira manteve disciplina apesar da volatilidade macro."
          </div>
          <div class="m-quote-attrib">— Mesa de Investimentos · Redentia</div>
        </div>

        <!-- Previous editions (horizontal scroll) -->
        <div class="m-section">
          <span class="title">Edicoes anteriores</span>
          <span class="link">Arquivo →</span>
        </div>
        <div class="m-cartas">
          <div v-for="c in prevEditions" :key="c.edition" class="m-carta-thumb">
            <div class="m-carta-thumb-head">
              <span class="m-carta-thumb-edition">EDICAO {{ c.edition }}</span>
              <span class="m-carta-thumb-month">{{ c.month.toUpperCase() }}</span>
            </div>
            <div class="m-carta-thumb-theme">{{ c.theme }}</div>
            <div class="m-carta-thumb-foot">
              <span class="m-carta-thumb-lbl">Retorno</span>
              <span class="m-carta-thumb-delta" :class="`tone-${c.tone}`">{{ c.delta }}</span>
            </div>
          </div>
        </div>

        <!-- Signature footer -->
        <div class="m-signature">
          <div class="m-signature-lead">Com afeto e disciplina,</div>
          <div class="m-signature-name">Redentia</div>
          <div class="m-signature-tag">A IA QUE CUIDA DA SUA CARTEIRA</div>
        </div>

        <!-- CTA -->
        <div class="m-cta-row">
          <div class="m-cta-primary">
            Ler analise completa
            <UIcon name="i-lucide-arrow-right" class="size-3" />
          </div>
          <div class="m-cta-secondary">
            <UIcon name="i-lucide-download" class="size-4" />
          </div>
        </div>
      </div>

      <!-- TABBAR -->
      <div class="m-tabbar">
        <NuxtLink v-for="t in mobileTabs" :key="t.label"
                  :to="t.to"
                  class="m-tab"
                  :class="{ active: t.label === 'Carta' }">
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
                    :class="{ active: n.label === 'Carta' }">
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
            <div style="font-weight:500;">Andre Silva</div>
            <div class="d-mut" style="font-size:11px; margin-top:1px;">Premium · 2 anos</div>
          </div>
        </div>
      </div>

      <div class="d-main">
        <div class="d-topbar">
          <div class="d-search">
            <UIcon name="i-lucide-search" class="size-4" />
            <span>Buscar ativos, fundos, noticias…</span>
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
                Edicao IV · maio 2026 · 15 min
              </div>
              <div class="h">A Carta</div>
            </div>
            <div class="actions">
              <div class="d-btn d-btn-ghost">Arquivo</div>
              <div class="d-btn">
                <UIcon name="i-lucide-download" class="size-3.5" />
                Baixar PDF
              </div>
            </div>
          </div>

          <!-- Cover hero (dark + gold radial glow) -->
          <div class="d-cover-card">
            <span class="d-cover-glow" />
            <div class="d-cover-inner">
              <div class="d-cover-meta">
                <span class="d-cover-edition">EDICAO IV</span>
                <span class="d-cover-month">MAIO · 2026</span>
              </div>
              <div class="d-cover-headline">
                O mes que <span class="gold">petroleo</span> ditou o ritmo.
              </div>
              <div class="d-cover-lead">
                Sua carteira fechou em <b class="d-pos-bright">+2,4%</b>, a frente do IBOV em 1,2pp.
                Sete dividendos creditados, tres fatos relevantes, uma sugestao de rebalanceamento.
              </div>
              <div class="d-cover-tristat">
                <div>
                  <div class="d-cover-stat-lbl">RETORNO</div>
                  <div class="d-cover-stat-val d-pos-bright">+2,4%</div>
                </div>
                <div>
                  <div class="d-cover-stat-lbl">DIVIDENDOS</div>
                  <div class="d-cover-stat-val">R$ 487</div>
                </div>
                <div>
                  <div class="d-cover-stat-lbl">FATOS RELEVANTES</div>
                  <div class="d-cover-stat-val">3</div>
                </div>
                <div>
                  <div class="d-cover-stat-lbl">VS IBOV</div>
                  <div class="d-cover-stat-val d-pos-bright">+1,2pp</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Article + TOC sidebar (2-col) -->
          <div class="d-letter-grid">

            <!-- Article -->
            <div class="d-card d-article-card">
              <div class="d-letter-greet">
                Caro <span style="color:#0F0F0E;">Andre,</span>
              </div>
              <div class="d-letter-p">
                <span class="d-dropcap">M</span>aio foi um mes de duas faces. O <b>petroleo</b> deu vida a Petrobras e empurrou
                sua carteira pra cima na primeira quinzena, mas a <b>ata do Copom</b> no fim do mes
                jogou um balde de agua fria nas eletricas e nos bancos. Voce terminou
                <b class="d-pos-text"> +2,4% no azul</b>, e a frente do IBOV em 1,2 ponto percentual.
              </div>

              <div class="d-pull-quote">
                "A carteira manteve disciplina apesar da volatilidade macro."
                <div class="d-pull-quote-attrib">— Mesa de Investimentos · Redentia</div>
              </div>

              <div class="d-letter-p d-letter-p-mut">
                Nesta edicao voce encontra a <b>analise completa do mes</b>, a curadoria de noticias
                que mexeram com seus ativos, os <b>R$ 487 de dividendos</b> que cairao nos proximos
                30 dias, e tres sugestoes da nossa IA pra ajustar a carteira sem se afobar.
              </div>

              <div class="d-signature">
                <div class="d-signature-lead">Com afeto e disciplina,</div>
                <div class="d-signature-name">Redentia</div>
                <div class="d-signature-tag">A IA QUE CUIDA DA SUA CARTEIRA</div>
              </div>
            </div>

            <!-- TOC sidebar -->
            <div class="d-card d-toc-card">
              <div class="d-section-h">
                <span class="title">Nesta edicao</span>
              </div>
              <div class="d-label" style="font-size:11px;">15 min de leitura</div>
              <div style="margin-top:14px;">
                <div v-for="(row, i) in tocRows" :key="row.n"
                     class="d-toc-row"
                     :class="{ 'is-first': i === 0, 'is-last': i === tocRows.length - 1 }">
                  <div class="d-toc-num">{{ row.n }}</div>
                  <div class="d-toc-t">{{ row.t }}</div>
                  <span class="d-toc-min">{{ row.minOnly }} MIN</span>
                </div>
              </div>
              <div class="d-toc-cta">
                <div class="d-toc-cta-primary">Ler tudo →</div>
                <div class="d-toc-cta-secondary">
                  <UIcon name="i-lucide-download" class="size-3.5" />
                </div>
              </div>
            </div>
          </div>

          <!-- Previous editions -->
          <div class="d-card">
            <div class="d-section-h">
              <span class="title">Edicoes anteriores</span>
              <span class="link">Arquivo completo →</span>
            </div>
            <div class="d-prev-grid">
              <div v-for="c in prevEditionsDt" :key="c.edition" class="d-carta-thumb">
                <div class="d-carta-thumb-head">
                  <span class="d-carta-thumb-edition">EDICAO {{ c.edition }}</span>
                  <span class="d-carta-thumb-month">{{ c.month.toUpperCase() }}</span>
                </div>
                <div class="d-carta-thumb-theme">{{ c.theme }}</div>
                <div class="d-carta-thumb-foot">
                  <span class="d-carta-thumb-lbl">Retorno do mes</span>
                  <span class="d-carta-thumb-delta" :class="`tone-${c.tone}`">{{ c.delta }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const navMain = [
  { label: 'Inicio',     icon: 'i-lucide-house',    to: '/dev/mobile-layouts/v4/home' },
  { label: 'Carteira',   icon: 'i-lucide-wallet',   to: '/dev/mobile-layouts/v4/carteira' },
  { label: 'Raio-X',     icon: 'i-lucide-radar',    to: '/dev/mobile-layouts/v4/raio-x',     badge: 'novo' },
  { label: 'Calendario', icon: 'i-lucide-calendar', to: '/dev/mobile-layouts/v4/calendario' },
  { label: 'Carta',      icon: 'i-lucide-mail',     to: '/dev/mobile-layouts/v4/carta' },
]
const navTools = [
  { label: 'Chat IA',       icon: 'i-lucide-sparkles',   badge: '2' },
  { label: 'Calculadoras',  icon: 'i-lucide-calculator' },
  { label: 'Rankings',      icon: 'i-lucide-trophy' },
  { label: 'Setores',       icon: 'i-lucide-grid-2x2' },
  { label: 'Guias',         icon: 'i-lucide-book' },
]
const mobileTabs = [
  { label: 'Inicio',   icon: 'i-lucide-house',  to: '/dev/mobile-layouts/v4/home' },
  { label: 'Carteira', icon: 'i-lucide-wallet', to: '/dev/mobile-layouts/v4/carteira' },
  { label: 'Raio-X',   icon: 'i-lucide-radar',  to: '/dev/mobile-layouts/v4/raio-x' },
  { label: 'Mercado',  icon: 'i-lucide-globe',  to: '/dev/mobile-layouts/v4/mercado' },
]

const tocRows = [
  { n: 'I',   t: 'Performance vs benchmarks',  s: 'IBOV, CDI & IFIX',                          min: '3 min', minOnly: '3' },
  { n: 'II',  t: 'Dividendos recebidos',       s: 'R$ 487 distribuidos em 7 pagamentos',        min: '2 min', minOnly: '2' },
  { n: 'III', t: 'Eventos & fatos relevantes', s: 'Copom, Brent, balancos',                     min: '4 min', minOnly: '4' },
  { n: 'IV',  t: 'Sugestoes da IA',            s: 'Tres passos pra junho',                       min: '3 min', minOnly: '3' },
  { n: 'V',   t: 'Calendario de junho',        s: 'Datas-com & pagamentos previstos',           min: '3 min', minOnly: '3' },
]

const prevEditions = [
  { edition: 'III', month: 'abril',     theme: 'Inflacao em foco',  delta: '+1,9%', tone: 'pos' },
  { edition: 'II',  month: 'marco',     theme: 'Bancos no centro',  delta: '−0,8%', tone: 'neg' },
  { edition: 'I',   month: 'fevereiro', theme: 'Comeco de ano',     delta: '+3,2%', tone: 'pos' },
]
const prevEditionsDt = [
  { edition: 'III', month: 'abril 2026',     theme: 'Inflacao em foco',                       delta: '+1,9%', tone: 'pos' },
  { edition: 'II',  month: 'marco 2026',     theme: 'Bancos no centro',                       delta: '−0,8%', tone: 'neg' },
  { edition: 'I',   month: 'fevereiro 2026', theme: 'Comeco de ano com a Selic em alta',      delta: '+3,2%', tone: 'pos' },
  { edition: '0',   month: 'janeiro 2026',   theme: 'O ano em tres cenarios',                  delta: '+1,1%', tone: 'pos' },
]
</script>

<style scoped>
/* ============ V4 — Fonts ============ */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:ital,wght@1,400;1,500&display=swap');

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

.phone.mercury .m-label {
  font-size: 11px; font-weight: 500;
  color: rgba(15,15,14,.5); letter-spacing: .01em;
}

.phone.mercury .m-section {
  padding: 28px 22px 12px;
  display: flex; justify-content: space-between; align-items: baseline;
}
.phone.mercury .m-section .title {
  font-size: 15px; font-weight: 600; letter-spacing: -.01em;
}
.phone.mercury .m-section .link {
  font-size: 13px; color: #0F0F0E; font-weight: 500; cursor: pointer;
}

/* COVER CARD (dark + gold glow) */
.phone.mercury .m-cover-card {
  padding: 24px 22px;
  background: #0F0F0E;
  color: #FAF6EA;
  position: relative;
  overflow: hidden;
}
.phone.mercury .m-cover-glow {
  position: absolute; right: -30px; top: -30px;
  width: 160px; height: 160px; border-radius: 50%;
  background: radial-gradient(circle, rgba(183,135,58,.20), transparent 70%);
  pointer-events: none;
}
.phone.mercury .m-cover-meta {
  display: flex; justify-content: space-between; align-items: baseline;
}
.phone.mercury .m-cover-edition {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; letter-spacing: .18em;
  color: rgba(255,255,255,.55);
}
.phone.mercury .m-cover-month {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; letter-spacing: .12em;
  color: rgba(255,255,255,.55);
}
.phone.mercury .m-cover-headline {
  font-size: 30px; font-weight: 600;
  letter-spacing: -.025em; line-height: 1.1;
  margin-top: 22px;
}
.phone.mercury .m-cover-headline .gold { color: #B7873A; }
.phone.mercury .m-cover-lead {
  font-size: 13px; color: rgba(255,255,255,.65);
  margin-top: 14px; line-height: 1.4;
}
.phone.mercury .m-pos-bright { color: #5EFFA5; }
.phone.mercury .m-cover-tristat {
  display: flex; gap: 16px;
  margin-top: 22px; padding-top: 18px;
  border-top: 1px solid rgba(255,255,255,.10);
}
.phone.mercury .m-cover-stat-lbl {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; letter-spacing: .12em;
  color: rgba(255,255,255,.5);
}
.phone.mercury .m-cover-stat-val {
  font-size: 18px; font-weight: 600;
  margin-top: 4px; font-variant-numeric: tabular-nums;
}

/* LETTER body */
.phone.mercury .m-letter-greet {
  font-size: 24px; font-weight: 600;
  letter-spacing: -.022em; line-height: 1.15;
}
.phone.mercury .m-letter-p {
  font-size: 15px; color: #0F0F0E;
  margin-top: 18px; line-height: 1.55;
  font-weight: 400;
}
.phone.mercury .m-letter-p-mut { color: rgba(15,15,14,.7); margin-top: 14px; }
.phone.mercury .m-dropcap {
  float: left;
  font-family: 'Newsreader', serif; font-style: italic;
  font-weight: 500; color: #B7873A;
  font-size: 44px; line-height: 1;
  margin-right: 6px; margin-top: 2px;
}

/* TOC */
.phone.mercury .m-toc-card { padding: 4px 22px; }
.phone.mercury .m-toc-row {
  display: flex; gap: 12px; align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.phone.mercury .m-toc-row.is-last { border-bottom: none; }
.phone.mercury .m-toc-num {
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(15,15,14,.04);
  color: rgba(15,15,14,.7);
  display: grid; place-items: center;
  font-family: 'Newsreader', serif; font-style: italic;
  font-weight: 500; font-size: 14px;
  flex-shrink: 0;
}
.phone.mercury .m-toc-t {
  font-size: 14px; font-weight: 600; letter-spacing: -.005em;
}
.phone.mercury .m-toc-s {
  font-size: 11px; color: rgba(15,15,14,.5); margin-top: 2px;
}
.phone.mercury .m-toc-min {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; letter-spacing: .1em;
  color: rgba(15,15,14,.4); font-weight: 600;
}
.phone.mercury .m-toc-chev { color: rgba(15,15,14,.35); }

/* QUOTE */
.phone.mercury .m-quote {
  padding-left: 14px;
  border-left: 3px solid #B7873A;
  font-size: 18px; font-weight: 500;
  letter-spacing: -.012em; line-height: 1.35;
  color: #0F0F0E;
}
.phone.mercury .m-quote-attrib {
  margin-top: 10px; padding-left: 17px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; letter-spacing: .12em;
  text-transform: uppercase;
  color: rgba(15,15,14,.5); font-weight: 500;
}

/* PREVIOUS EDITIONS */
.phone.mercury .m-cartas {
  display: flex; gap: 10px;
  padding: 0 16px;
  overflow-x: auto;
  scrollbar-width: none;
}
.phone.mercury .m-cartas::-webkit-scrollbar { display: none; }
.phone.mercury .m-carta-thumb {
  flex-shrink: 0; min-width: 200px;
  background: #FFFFFF;
  border: 1px solid rgba(15,15,14,.05);
  border-radius: 14px;
  padding: 14px;
}
.phone.mercury .m-carta-thumb-head {
  display: flex; justify-content: space-between; align-items: baseline;
}
.phone.mercury .m-carta-thumb-edition {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; letter-spacing: .18em;
  color: rgba(15,15,14,.45); font-weight: 600;
}
.phone.mercury .m-carta-thumb-month {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; letter-spacing: .1em;
  color: rgba(15,15,14,.45);
}
.phone.mercury .m-carta-thumb-theme {
  font-size: 14px; font-weight: 600;
  letter-spacing: -.005em; margin-top: 14px;
  line-height: 1.25;
}
.phone.mercury .m-carta-thumb-foot {
  display: flex; align-items: center; gap: 6px;
  margin-top: 14px; padding-top: 10px;
  border-top: 1px solid rgba(15,15,14,.05);
}
.phone.mercury .m-carta-thumb-lbl { font-size: 12px; color: rgba(15,15,14,.5); }
.phone.mercury .m-carta-thumb-delta {
  font-size: 13px; font-weight: 600;
  font-variant-numeric: tabular-nums;
  margin-left: auto;
}
.phone.mercury .m-carta-thumb-delta.tone-pos { color: #0F8C4D; }
.phone.mercury .m-carta-thumb-delta.tone-neg { color: #C4413A; }

/* SIGNATURE */
.phone.mercury .m-signature {
  padding: 32px 22px;
  text-align: right;
  margin-top: 20px;
}
.phone.mercury .m-signature-lead {
  font-size: 13px;
  color: rgba(15,15,14,.55);
  font-style: italic;
}
.phone.mercury .m-signature-name {
  font-size: 28px; font-weight: 500;
  color: #B7873A;
  margin-top: 6px;
  letter-spacing: -.018em;
  font-family: 'Newsreader', serif;
  font-style: italic;
}
.phone.mercury .m-signature-tag {
  margin-top: 6px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; letter-spacing: .12em;
  color: rgba(15,15,14,.5);
  font-weight: 500;
}

/* CTA */
.phone.mercury .m-cta-row {
  padding: 0 16px;
  display: flex; gap: 8px;
  margin-bottom: 24px;
}
.phone.mercury .m-cta-primary {
  flex: 1; padding: 13px 18px; border-radius: 10px;
  background: #0F0F0E; color: #FFFFFF;
  font-size: 14px; font-weight: 500;
  text-align: center;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer;
}
.phone.mercury .m-cta-secondary {
  width: 48px; padding: 13px 0; border-radius: 10px;
  background: rgba(15,15,14,.04);
  color: #0F0F0E;
  display: grid; place-items: center;
  cursor: pointer;
}

/* TABBAR */
.phone.mercury .m-tabbar {
  position: fixed; left: 0; right: 0; bottom: 0;
  max-width: 480px; margin: 0 auto;
  height: 78px;
  background: rgba(248,246,241,.94);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(15,15,14,.06);
  display: flex; justify-content: space-around; align-items: flex-start;
  padding: 12px 24px 24px;
  z-index: 20;
}
.phone.mercury .m-tab {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  background: transparent; border: 0;
  color: rgba(15,15,14,.35);
  cursor: pointer;
  padding: 4px 8px;
  font-family: inherit;
  text-decoration: none;
}
.phone.mercury .m-tab.active { color: #0F0F0E; }
.phone.mercury .m-tab svg,
.phone.mercury .m-tab .iconify { width: 22px; height: 22px; }
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
.dt .d-pos-text { color: #0F8C4D; }

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

/* COVER (desktop) */
.dt .d-cover-card {
  border-radius: 18px;
  padding: 40px 44px;
  background: #0F0F0E;
  color: #FAF6EA;
  position: relative;
  overflow: hidden;
}
.dt .d-cover-glow {
  position: absolute; right: -60px; top: -60px;
  width: 320px; height: 320px; border-radius: 50%;
  background: radial-gradient(circle, rgba(183,135,58,.18), transparent 70%);
  pointer-events: none;
}
.dt .d-cover-inner { position: relative; max-width: 680px; }
.dt .d-cover-meta {
  display: flex; justify-content: space-between; align-items: baseline;
}
.dt .d-cover-edition {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; letter-spacing: .18em;
  color: rgba(255,255,255,.55);
}
.dt .d-cover-month {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; letter-spacing: .12em;
  color: rgba(255,255,255,.55);
}
.dt .d-cover-headline {
  font-size: 48px; font-weight: 600;
  letter-spacing: -.03em; line-height: 1.05;
  margin-top: 32px;
}
.dt .d-cover-headline .gold { color: #B7873A; }
.dt .d-cover-lead {
  font-size: 16px; color: rgba(255,255,255,.7);
  margin-top: 16px; line-height: 1.4;
  max-width: 560px;
}
.dt .d-pos-bright { color: #5EFFA5; }
.dt .d-cover-tristat {
  display: flex; gap: 32px;
  margin-top: 34px; padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,.10);
}
.dt .d-cover-stat-lbl {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; letter-spacing: .14em;
  color: rgba(255,255,255,.5);
}
.dt .d-cover-stat-val {
  font-size: 28px; font-weight: 600;
  margin-top: 6px; letter-spacing: -.02em;
  font-variant-numeric: tabular-nums;
}

/* ARTICLE + TOC grid */
.dt .d-letter-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 14px;
}
.dt .d-article-card { padding: 40px 44px; }
.dt .d-letter-greet {
  font-size: 34px; font-weight: 600;
  letter-spacing: -.022em; line-height: 1.1;
}
.dt .d-letter-p {
  font-size: 17px; color: #0F0F0E;
  margin-top: 24px; line-height: 1.6;
  font-weight: 400;
}
.dt .d-letter-p-mut { color: rgba(15,15,14,.8); }
.dt .d-dropcap {
  float: left;
  font-family: 'Newsreader', serif; font-style: italic;
  font-weight: 500; color: #B7873A;
  font-size: 72px; line-height: 1;
  margin-right: 8px; margin-top: 4px;
}
.dt .d-pull-quote {
  margin: 32px 0;
  padding-left: 18px;
  border-left: 3px solid #B7873A;
  font-size: 22px; font-weight: 500;
  letter-spacing: -.012em; line-height: 1.4;
  color: #0F0F0E;
}
.dt .d-pull-quote-attrib {
  margin-top: 14px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px; letter-spacing: .12em;
  text-transform: uppercase;
  color: rgba(15,15,14,.5);
  font-weight: 500; font-style: normal;
}
.dt .d-signature {
  margin-top: 48px; text-align: right;
  padding-top: 32px;
  border-top: 1px solid rgba(15,15,14,.06);
}
.dt .d-signature-lead {
  font-size: 14px; color: rgba(15,15,14,.55);
  font-style: italic;
}
.dt .d-signature-name {
  font-size: 38px; font-weight: 500;
  color: #B7873A;
  margin-top: 6px;
  letter-spacing: -.018em;
  font-family: 'Newsreader', serif;
  font-style: italic;
}
.dt .d-signature-tag {
  margin-top: 6px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; letter-spacing: .14em;
  text-transform: uppercase;
  color: rgba(15,15,14,.4); font-weight: 600;
}

/* TOC sidebar */
.dt .d-toc-card {
  position: sticky;
  top: 0;
  align-self: flex-start;
}
.dt .d-toc-row {
  display: flex; gap: 10px; align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(15,15,14,.05);
}
.dt .d-toc-row.is-first { border-top: 1px solid rgba(15,15,14,.05); }
.dt .d-toc-row.is-last { border-bottom: none; }
.dt .d-toc-num {
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(15,15,14,.04);
  color: rgba(15,15,14,.7);
  display: grid; place-items: center;
  font-family: 'Newsreader', serif; font-style: italic;
  font-weight: 500; font-size: 12px;
  flex-shrink: 0;
}
.dt .d-toc-t {
  flex: 1; font-size: 13px; font-weight: 500;
  letter-spacing: -.005em; line-height: 1.25;
}
.dt .d-toc-min {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; letter-spacing: .1em;
  color: rgba(15,15,14,.4); font-weight: 600;
}
.dt .d-toc-cta {
  display: flex; gap: 6px;
  margin-top: 18px; padding-top: 14px;
  border-top: 1px solid rgba(15,15,14,.06);
}
.dt .d-toc-cta-primary {
  flex: 1; padding: 10px 12px; border-radius: 8px;
  background: #0F0F0E; color: #fff;
  font-size: 12px; font-weight: 500;
  text-align: center; cursor: pointer;
}
.dt .d-toc-cta-secondary {
  width: 38px; padding: 10px 0; border-radius: 8px;
  background: rgba(15,15,14,.04);
  display: grid; place-items: center;
  cursor: pointer;
}

/* PREVIOUS EDITIONS (desktop) */
.dt .d-prev-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 6px;
}
.dt .d-carta-thumb {
  background: #FFFFFF;
  border: 1px solid rgba(15,15,14,.06);
  border-radius: 14px;
  padding: 18px 20px 16px;
  cursor: pointer;
  transition: transform .15s;
}
.dt .d-carta-thumb:hover { transform: translateY(-2px); }
.dt .d-carta-thumb-head {
  display: flex; justify-content: space-between; align-items: baseline;
}
.dt .d-carta-thumb-edition {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; letter-spacing: .18em;
  color: rgba(15,15,14,.45); font-weight: 600;
}
.dt .d-carta-thumb-month {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; letter-spacing: .1em;
  color: rgba(15,15,14,.45);
}
.dt .d-carta-thumb-theme {
  font-size: 16px; font-weight: 600;
  letter-spacing: -.005em;
  margin-top: 18px; line-height: 1.3;
  min-height: 42px;
}
.dt .d-carta-thumb-foot {
  display: flex; align-items: center; gap: 6px;
  margin-top: 14px; padding-top: 12px;
  border-top: 1px solid rgba(15,15,14,.05);
}
.dt .d-carta-thumb-lbl { font-size: 12px; color: rgba(15,15,14,.5); }
.dt .d-carta-thumb-delta {
  font-size: 14px; font-weight: 600;
  font-variant-numeric: tabular-nums;
  margin-left: auto;
}
.dt .d-carta-thumb-delta.tone-pos { color: #0F8C4D; }
.dt .d-carta-thumb-delta.tone-neg { color: #C4413A; }
</style>

<!--
  V4 — Rankings (Mercury Bank style).
  Lista de rankings + Redentia Score hero + filtros por categoria.
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
          <div>
            <div class="m-label" style="font-size:10px;">{{ RANKINGS.length }} rankings · atualizado agora</div>
            <div style="font-size:18px; font-weight:600; letter-spacing:-.015em; margin-top:2px;">Rankings</div>
          </div>
        </div>
      </div>

      <div class="m-scroll">

        <!-- Redentia Score Hero -->
        <div style="padding:4px 16px 0;">
          <div class="m-score-hero">
            <span class="m-glow-amber"></span>
            <span class="m-glow-purple"></span>
            <div style="position:relative; display:flex; justify-content:space-between; align-items:flex-start;">
              <div style="flex:1; min-width:0;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="m-rank-pill">RANKING EXCLUSIVO</span>
                </div>
                <div class="m-score-title">
                  Redentia <span class="m-amber-serif">Score.</span>
                </div>
                <div style="font-size:13px; color:rgba(255,255,255,.7); margin-top:8px; line-height:1.4; max-width:240px;">
                  A nota de 0 a 10 que cruza <b style="color:#FAF6EA;">15 rankings</b> simultaneamente pra medir qualidade fundamentalista.
                </div>
              </div>
              <div class="m-score-ring">
                <div class="m-score-ring-inner">
                  <div style="text-align:center;">
                    <div style="font-size:24px; font-weight:600; letter-spacing:-.02em; color:#FAF6EA; font-variant-numeric:tabular-nums; line-height:1;">7,8</div>
                    <div style="font-family:'IBM Plex Mono',monospace; font-size:7px; letter-spacing:.12em; color:rgba(255,255,255,.5); margin-top:2px; font-weight:600;">SUA MÉDIA</div>
                  </div>
                </div>
              </div>
            </div>
            <div style="position:relative; display:flex; gap:14px; margin-top:18px; padding-top:14px; border-top:1px solid rgba(255,255,255,.10);">
              <div>
                <div style="font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.12em; color:rgba(255,255,255,.5); font-weight:600;">NOTA 9+</div>
                <div style="font-size:16px; font-weight:600; margin-top:4px; color:#5EFFA5; font-variant-numeric:tabular-nums;">12 ativos</div>
              </div>
              <div style="width:1px; background:rgba(255,255,255,.08);"></div>
              <div>
                <div style="font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.12em; color:rgba(255,255,255,.5); font-weight:600;">SEUS ATIVOS</div>
                <div style="font-size:16px; font-weight:600; margin-top:4px; font-variant-numeric:tabular-nums;">2 no top 20</div>
              </div>
              <div style="flex:1; display:flex; align-items:center; justify-content:flex-end;">
                <span class="m-score-cta">
                  Abrir <UIcon name="i-lucide-arrow-right" class="size-3" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Category pills -->
        <div class="m-pill-row">
          <button class="m-pill" :class="{ active: cat === 'all' }" @click="cat = 'all'">
            Todos <span>{{ RANKINGS.length }}</span>
          </button>
          <button v-for="c in RANKINGS_CATS" :key="c.id"
                  class="m-pill"
                  :class="{ active: cat === c.id }"
                  @click="cat = c.id">
            {{ c.label }} <span>{{ c.count }}</span>
          </button>
        </div>

        <!-- Top 3 popular -->
        <template v-if="cat === 'all'">
          <div class="m-section"><span class="title">Mais consultados</span></div>
          <div class="m-feat-row">
            <button v-for="r in RANKINGS.filter(r => r.popular)" :key="r.id" class="m-feat-card">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <span class="m-rank-ic m-rank-ic-large">
                  <UIcon :name="iconMap[r.icon]" class="size-5" />
                </span>
                <span class="m-pop-tag">Popular</span>
              </div>
              <div>
                <div style="font-size:14px; font-weight:600; letter-spacing:-.005em;">{{ r.name }}</div>
                <div style="font-size:11px; color:rgba(15,15,14,.55); margin-top:3px; line-height:1.3;">{{ r.sub }}</div>
              </div>
            </button>
          </div>
        </template>

        <!-- List -->
        <div class="m-section">
          <span class="title">{{ cat === 'all' ? 'Todos os rankings' : RANKINGS_CATS.find(c => c.id === cat)?.label }}</span>
          <span class="link">Filtrar →</span>
        </div>
        <div class="m-card" style="padding:4px 0;">
          <button v-for="(r, i) in filtered" :key="r.id"
                  class="m-rank-row"
                  :class="{ 'm-rank-row-last': i === filtered.length - 1 }">
            <span class="m-rank-ic">
              <UIcon :name="iconMap[r.icon]" class="size-4" />
            </span>
            <div style="flex:1; min-width:0;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:14px; font-weight:500; letter-spacing:-.005em;">{{ r.name }}</span>
                <span v-if="r.popular" style="width:5px; height:5px; border-radius:50%; background:#B7873A;"></span>
              </div>
              <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:2px;">{{ r.sub }}</div>
            </div>
            <span style="font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.08em; color:rgba(15,15,14,.4); font-weight:600;">{{ r.updated.toUpperCase() }}</span>
            <UIcon name="i-lucide-chevron-right" class="size-3" style="color:rgba(15,15,14,.35)" />
          </button>
        </div>

        <div class="m-cta" style="margin-top:24px; margin-bottom:24px;">
          <div>
            <div class="t">Salvar um ranking</div>
            <div class="s">Receba alertas quando algo entra ou sai</div>
          </div>
          <UIcon name="i-lucide-arrow-right" class="size-4" style="color:white;" />
        </div>
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
          <NuxtLink v-for="t in navTools" :key="t.label" :to="t.to || '#'"
                    class="item" :class="{ active: t.label === 'Rankings' }">
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
            <span>Buscar um ranking, ativo ou métrica…</span>
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
              <div class="d-mut" style="font-size:12px; font-weight:500; margin-bottom:6px;">{{ RANKINGS.length }} rankings + Score exclusivo · atualizado agora</div>
              <div class="h">Rankings</div>
            </div>
            <div class="actions">
              <div class="d-btn d-btn-ghost">Salvos · 3</div>
              <div class="d-btn">
                <UIcon name="i-lucide-plus" class="size-3" />
                Criar ranking
              </div>
            </div>
          </div>

          <!-- Redentia Score Featured -->
          <div class="d-score-hero">
            <span class="d-score-glow-amber"></span>
            <span class="d-score-glow-purple"></span>
            <div style="position:relative; display:flex; justify-content:space-between; align-items:center; gap:30px;">
              <div style="flex:1; min-width:0;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="d-rank-pill">RANKING EXCLUSIVO</span>
                </div>
                <div class="d-score-title">
                  Redentia <span class="d-amber-serif">Score.</span>
                </div>
                <div style="font-size:15px; color:rgba(255,255,255,.7); margin-top:12px; line-height:1.5; max-width:460px;">
                  A nota de 0 a 10 que cruza <b style="color:#FAF6EA;">15 rankings simultaneamente</b> pra medir qualidade fundamentalista. Quem aparece bem em vários rankings tem score alto, quem só aparece em um, tem score baixo.
                </div>
                <div style="display:flex; gap:30px; margin-top:24px; padding-top:20px; border-top:1px solid rgba(255,255,255,.10);">
                  <div>
                    <div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.14em; color:rgba(255,255,255,.5); font-weight:600;">NOTA 9+</div>
                    <div style="font-size:22px; font-weight:600; margin-top:6px; color:#5EFFA5; font-variant-numeric:tabular-nums;">12 ativos</div>
                  </div>
                  <div>
                    <div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.14em; color:rgba(255,255,255,.5); font-weight:600;">NOTA 7-9</div>
                    <div style="font-size:22px; font-weight:600; margin-top:6px; font-variant-numeric:tabular-nums;">48 ativos</div>
                  </div>
                  <div>
                    <div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.14em; color:rgba(255,255,255,.5); font-weight:600;">SEUS ATIVOS</div>
                    <div style="font-size:22px; font-weight:600; margin-top:6px; color:#B7873A; font-variant-numeric:tabular-nums;">2 no top 20</div>
                  </div>
                  <div style="flex:1; display:flex; align-items:center; justify-content:flex-end;">
                    <span class="d-score-cta">
                      Abrir ranking
                      <UIcon name="i-lucide-arrow-right" class="size-3" />
                    </span>
                  </div>
                </div>
              </div>
              <div class="d-score-ring">
                <div class="d-score-ring-inner">
                  <div style="text-align:center;">
                    <div style="font-size:42px; font-weight:600; letter-spacing:-.025em; color:#FAF6EA; font-variant-numeric:tabular-nums; line-height:1;">7,8</div>
                    <div style="font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.14em; color:rgba(255,255,255,.5); margin-top:4px; font-weight:600;">SUA MÉDIA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Category pills -->
          <div class="d-pill-row">
            <button class="d-pill" :class="{ active: cat === 'all' }" @click="cat = 'all'">
              Todos <span>{{ RANKINGS.length }}</span>
            </button>
            <button v-for="c in RANKINGS_CATS" :key="c.id"
                    class="d-pill"
                    :class="{ active: cat === c.id }"
                    @click="cat = c.id">
              {{ c.label }} <span>{{ c.count }}</span>
            </button>
          </div>

          <!-- 4-column grid of rankings -->
          <div class="d-card">
            <div class="d-section-h">
              <span class="title">{{ cat === 'all' ? 'Todos os rankings' : RANKINGS_CATS.find(c => c.id === cat)?.label }}</span>
              <span class="link">Filtros avançados →</span>
            </div>
            <div class="d-rank-grid">
              <div v-for="r in filtered" :key="r.id" class="d-rank-card">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                  <div class="d-rank-card-ic">
                    <UIcon :name="iconMap[r.icon]" class="size-4" />
                  </div>
                  <span v-if="r.popular" class="d-pop-tag">Popular</span>
                </div>
                <div>
                  <div style="font-size:13px; font-weight:600; letter-spacing:-.005em;">{{ r.name }}</div>
                  <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:3px; line-height:1.3;">{{ r.sub }}</div>
                </div>
                <div style="margin-top:auto; display:flex; align-items:center; justify-content:space-between; padding-top:8px; border-top:1px solid rgba(15,15,14,.04);">
                  <span style="font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.08em; color:rgba(15,15,14,.4); font-weight:600;">{{ r.updated.toUpperCase() }}</span>
                  <UIcon name="i-lucide-arrow-right" class="size-3" style="color:rgba(15,15,14,.5)" />
                </div>
              </div>
            </div>
          </div>

          <!-- Saved + suggestion row -->
          <div class="d-saved-row">
            <div class="d-card">
              <div class="d-section-h">
                <span class="title">Rankings salvos</span>
                <span class="link">Gerenciar →</span>
              </div>
              <div class="d-label" style="font-size:11px; margin-top:4px;">Você é alertado quando algo entra ou sai</div>
              <div style="margin-top:14px;">
                <div v-for="(s, i) in savedRanks" :key="s.name"
                     class="d-saved-item"
                     :class="{ 'd-saved-item-last': i === savedRanks.length - 1 }">
                  <div style="flex:1; min-width:0;">
                    <div style="font-size:14px; font-weight:600; letter-spacing:-.005em;">{{ s.name }}</div>
                    <div style="font-size:11px; color:rgba(15,15,14,.5); margin-top:2px;">{{ s.stat }}</div>
                  </div>
                  <span class="d-alert-tag">
                    <span style="width:5px; height:5px; border-radius:50%; background:#0F8C4D;"></span>
                    {{ s.alert }}
                  </span>
                  <UIcon name="i-lucide-chevron-right" class="size-3" style="color:rgba(15,15,14,.35)" />
                </div>
              </div>
            </div>
            <div class="d-card" style="padding:22px 24px; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div class="d-label" style="font-size:10px; color:#B7873A; font-weight:600; letter-spacing:.12em; text-transform:uppercase;">Sugestão da IA</div>
                <div style="font-size:18px; font-weight:600; letter-spacing:-.015em; margin-top:10px; line-height:1.3;">
                  Qual ranking combina
                  <span style="font-family:'Newsreader',serif; font-style:italic; font-weight:500; color:#B7873A;">com seu perfil?</span>
                </div>
                <div style="font-size:12px; color:rgba(15,15,14,.55); margin-top:8px; line-height:1.4;">
                  Baseado no seu objetivo de renda passiva.
                </div>
              </div>
              <div class="d-btn" style="margin-top:14px; align-self:flex-start;">
                Ver sugestões →
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

definePageMeta({ layout: false })

const cat = ref<string>('all')

const iconMap: Record<string, string> = {
  tag: 'i-lucide-tag',
  box: 'i-lucide-box',
  coin: 'i-lucide-circle-dollar-sign',
  flame: 'i-lucide-flame',
  rocket: 'i-lucide-rocket',
  building: 'i-lucide-building-2',
  wave: 'i-lucide-activity',
}

const RANKINGS_CATS = [
  { id: 'valor', label: 'Valor',       count: 8 },
  { id: 'cresc', label: 'Crescimento', count: 6 },
  { id: 'div',   label: 'Dividendos',  count: 5 },
  { id: 'qual',  label: 'Qualidade',   count: 4 },
  { id: 'fii',   label: 'FIIs',        count: 7 },
  { id: 'tec',   label: 'Técnico',     count: 5 },
]

const RANKINGS = [
  { id: 'pl-min',   cat: 'valor', name: 'Menor P/L',              sub: 'Ações negociadas barato',               icon: 'tag',      updated: 'agora' },
  { id: 'pvp-min',  cat: 'valor', name: 'Menor P/VP',             sub: 'Preço sobre valor patrimonial',         icon: 'box',      updated: 'agora' },
  { id: 'dy-max',   cat: 'div',   name: 'Maior Dividend Yield',   sub: 'Quem paga mais dividendos',             icon: 'coin',     updated: 'agora', popular: true },
  { id: 'roe-max',  cat: 'qual',  name: 'Maior ROE',              sub: 'Retorno sobre patrimônio',              icon: 'flame',    updated: 'agora', popular: true },
  { id: 'cresc',    cat: 'cresc', name: 'Crescimento de receita', sub: 'Top 20% de growth nos últimos 5a',      icon: 'rocket',   updated: '3h' },
  { id: 'fii-dy',   cat: 'fii',   name: 'FIIs com maior DY',      sub: 'Renda mensal projetada',                icon: 'building', updated: 'agora', popular: true },
  { id: 'fii-pvp',  cat: 'fii',   name: 'FIIs com menor P/VP',    sub: 'Negociando abaixo do valor patrim.',    icon: 'box',      updated: 'agora' },
  { id: 'liq',      cat: 'tec',   name: 'Maior liquidez',         sub: 'Volume médio diário',                   icon: 'wave',     updated: 'agora' },
]

const filtered = computed(() => cat.value === 'all' ? RANKINGS : RANKINGS.filter(r => r.cat === cat.value))

const savedRanks = [
  { name: 'Menor P/L',         stat: '10 ativos · 2 seus', alert: 'alertas ativos' },
  { name: 'Maior DY',          stat: '10 ativos · 3 seus', alert: 'alertas ativos' },
  { name: 'Redentia Score 9+', stat: '12 ativos · 2 seus', alert: 'alertas ativos' },
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
.phone.mercury .m-label { font-size: 11px; font-weight: 500; color: rgba(15,15,14,.5); letter-spacing: .01em; }

.phone.mercury .m-card {
  margin: 0 16px; padding: 22px 20px;
  background: #FFFFFF; border-radius: 20px;
  box-shadow: 0 1px 0 rgba(15,15,14,.04), 0 8px 24px -12px rgba(15,15,14,.08);
}

.phone.mercury .m-section {
  padding: 24px 22px 12px;
  display: flex; justify-content: space-between; align-items: baseline;
}
.phone.mercury .m-section .title { font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
.phone.mercury .m-section .link { font-size: 13px; color: #0F0F0E; font-weight: 500; cursor: pointer; }

/* Score hero */
.phone.mercury .m-score-hero {
  padding: 24px 22px; border-radius: 18px;
  background: #0F0F0E; color: #FAF6EA;
  position: relative; overflow: hidden; cursor: pointer;
}
.phone.mercury .m-glow-amber {
  position: absolute; right: -50px; top: -50px;
  width: 220px; height: 220px; border-radius: 50%;
  background: radial-gradient(circle, rgba(183,135,58,.32), transparent 65%);
  pointer-events: none;
}
.phone.mercury .m-glow-purple {
  position: absolute; left: -30px; bottom: -50px;
  width: 160px; height: 160px; border-radius: 50%;
  background: radial-gradient(circle, rgba(91,74,122,.18), transparent 65%);
  pointer-events: none;
}
.phone.mercury .m-rank-pill {
  padding: 3px 8px; border-radius: 5px;
  background: linear-gradient(135deg, #D1A75A, #8A6018);
  color: #0F0F0E;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 9px; font-weight: 700; letter-spacing: .12em;
}
.phone.mercury .m-score-title {
  font-size: 26px; font-weight: 600; letter-spacing: -.022em;
  margin-top: 14px; line-height: 1.1;
}
.phone.mercury .m-amber-serif {
  color: #B7873A; font-family: 'Newsreader', serif;
  font-style: italic; font-weight: 500;
}
.phone.mercury .m-score-ring {
  width: 78px; height: 78px; border-radius: 50%;
  background: conic-gradient(from -90deg, #D1A75A 0deg, #B7873A 280deg, rgba(255,255,255,.08) 280deg);
  display: grid; place-items: center; flex-shrink: 0; position: relative;
}
.phone.mercury .m-score-ring-inner {
  position: absolute; inset: 5px; border-radius: 50%;
  background: #0F0F0E;
  display: grid; place-items: center;
}
.phone.mercury .m-score-cta {
  padding: 8px 14px; border-radius: 8px;
  background: #FAF6EA; color: #0F0F0E;
  font-size: 13px; font-weight: 600;
  display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
}

/* Pills */
.phone.mercury .m-pill-row {
  display: flex; gap: 6px;
  padding: 18px 16px 14px;
  overflow-x: auto; scrollbar-width: none;
}
.phone.mercury .m-pill-row::-webkit-scrollbar { display: none; }
.phone.mercury .m-pill {
  flex-shrink: 0; padding: 7px 12px; border-radius: 999px;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.65);
  font-size: 12px; font-weight: 500;
  display: inline-flex; align-items: center; gap: 5px;
  cursor: pointer; border: 0; font-family: inherit;
}
.phone.mercury .m-pill.active {
  background: #0F0F0E; color: #FFFFFF;
}

/* Featured cards */
.phone.mercury .m-feat-row {
  display: flex; gap: 10px; padding: 0 16px;
  overflow-x: auto; scrollbar-width: none;
}
.phone.mercury .m-feat-row::-webkit-scrollbar { display: none; }
.phone.mercury .m-feat-card {
  flex-shrink: 0; min-width: 200px;
  padding: 18px 16px;
  background: #FFFFFF; border: 1px solid rgba(15,15,14,.05);
  border-radius: 14px; cursor: pointer;
  display: flex; flex-direction: column; gap: 14px;
  text-align: left; font-family: inherit;
}
.phone.mercury .m-pop-tag {
  padding: 2px 7px; border-radius: 4px;
  background: rgba(183,135,58,.12); color: #B7873A;
  font-size: 9px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
}

.phone.mercury .m-rank-ic {
  width: 34px; height: 34px; border-radius: 10px;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.7);
  display: grid; place-items: center; flex-shrink: 0;
}
.phone.mercury .m-rank-ic-large { width: 44px; height: 44px; }

.phone.mercury .m-rank-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 22px;
  border-bottom: 1px solid rgba(15,15,14,.05);
  cursor: pointer; width: 100%;
  background: transparent;
  border-left: 0; border-right: 0; border-top: 0;
  font-family: inherit; text-align: left;
}
.phone.mercury .m-rank-row-last { border-bottom: 0; }

.phone.mercury .m-cta {
  margin: 0 16px; padding: 18px 20px;
  background: #0F0F0E; color: #FFFFFF; border-radius: 20px;
  display: flex; align-items: center; justify-content: space-between;
}
.phone.mercury .m-cta .t { font-size: 16px; font-weight: 500; letter-spacing: -.01em; }
.phone.mercury .m-cta .s { font-size: 12px; color: rgba(255,255,255,.55); margin-top: 2px; }

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

/* Score hero desktop */
.dt .d-score-hero {
  padding: 32px 36px; border-radius: 18px;
  background: #0F0F0E; color: #FAF6EA;
  position: relative; overflow: hidden; cursor: pointer;
}
.dt .d-score-glow-amber {
  position: absolute; right: -80px; top: -80px;
  width: 340px; height: 340px; border-radius: 50%;
  background: radial-gradient(circle, rgba(183,135,58,.30), transparent 65%);
  pointer-events: none;
}
.dt .d-score-glow-purple {
  position: absolute; left: -50px; bottom: -80px;
  width: 280px; height: 280px; border-radius: 50%;
  background: radial-gradient(circle, rgba(91,74,122,.16), transparent 65%);
  pointer-events: none;
}
.dt .d-rank-pill {
  padding: 3px 10px; border-radius: 5px;
  background: linear-gradient(135deg, #D1A75A, #8A6018);
  color: #0F0F0E;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; font-weight: 700; letter-spacing: .14em;
}
.dt .d-score-title {
  font-size: 42px; font-weight: 600; letter-spacing: -.028em;
  margin-top: 18px; line-height: 1.05;
}
.dt .d-amber-serif {
  color: #B7873A; font-family: 'Newsreader', serif;
  font-style: italic; font-weight: 500;
}
.dt .d-score-ring {
  width: 140px; height: 140px; border-radius: 50%;
  background: conic-gradient(from -90deg, #D1A75A 0deg, #B7873A 280deg, rgba(255,255,255,.08) 280deg);
  display: grid; place-items: center; flex-shrink: 0; position: relative;
}
.dt .d-score-ring-inner {
  position: absolute; inset: 8px; border-radius: 50%;
  background: #0F0F0E;
  display: grid; place-items: center;
}
.dt .d-score-cta {
  padding: 12px 22px; border-radius: 10px;
  background: #FAF6EA; color: #0F0F0E;
  font-size: 14px; font-weight: 600;
  display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
}

/* Pills */
.dt .d-pill-row {
  display: flex; gap: 6px; padding: 2px 0;
}
.dt .d-pill {
  padding: 7px 12px; border-radius: 999px;
  background: rgba(15,15,14,.04); color: rgba(15,15,14,.65);
  font-size: 12px; font-weight: 500;
  display: inline-flex; align-items: center; gap: 5px;
  cursor: pointer; border: 0; font-family: inherit;
}
.dt .d-pill.active {
  background: #0F0F0E; color: #FFFFFF;
}

/* Rank grid */
.dt .d-rank-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 6px;
}
.dt .d-rank-card {
  background: rgba(15,15,14,.025);
  border: 1px solid rgba(15,15,14,.04);
  border-radius: 12px; padding: 16px 18px; cursor: pointer;
  display: flex; flex-direction: column; gap: 12px;
}
.dt .d-rank-card-ic {
  width: 36px; height: 36px; border-radius: 10px;
  background: #FFFFFF; color: rgba(15,15,14,.7);
  display: grid; place-items: center;
  border: 1px solid rgba(15,15,14,.05);
}
.dt .d-pop-tag {
  padding: 2px 7px; border-radius: 4px;
  background: rgba(183,135,58,.12); color: #B7873A;
  font-size: 9px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
}

/* Saved */
.dt .d-saved-row {
  display: grid; grid-template-columns: 1.4fr 1fr; gap: 14px;
}
.dt .d-saved-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(15,15,14,.05); cursor: pointer;
}
.dt .d-saved-item-last { border-bottom: 0; }
.dt .d-alert-tag {
  padding: 3px 8px; border-radius: 5px;
  background: rgba(15,140,77,.10); color: #0F8C4D;
  font-size: 10px; font-weight: 600;
  display: inline-flex; align-items: center; gap: 4px;
}
</style>
